---
title: 把第三方渠道接进来
summary: 鉴权、限流、日志三层的具体配置，让接入的渠道可追、可限、可审计
order: 2
level: 进阶
tags: [鉴权, 限流, 日志]
updated: 2026-11-08
readingTime: 6
---

网关自己跑起来只是第一步。真正花时间的是把上游渠道接进来之后的三件事：调用方怎么证明身份、超额怎么拦、出问题怎么查。这三层任何一层缺了，接入就会变成「谁都能用、用了多少不知道、坏了找不到原因」。

## 鉴权：三层要分开

最容易犯的错是把「网关令牌」和「上游 key」混成一件事。它们是两个空间的凭证，作用方向相反。

上游 key 是网关花出去的钱，绝不下发给客户端。`sk-` 开头的一串明文，一旦进了前端代码或者被提交到仓库，就等于把账户余额公开。

网关令牌是发给调用方的，网关用它识别「这是谁」。令牌本身不应该包含权限信息，权限查数据库，这样改权限不用重发令牌。

给令牌加前缀区分场景。我现在的约定是 `sk-gw-` 给服务端、`pk-gw-` 给前端只读，前缀不参与验证，纯粹为了在日志和代码审计里一眼分辨。曾经有一次前端打包把服务端令牌带出去了，就是因为两者长得一样，review 时没人注意。

数据库里只存哈希，不存明文：

```python
import hashlib, secrets

def issue_token(owner: str) -> str:
    raw = "sk-gw-" + secrets.token_urlsafe(32)
    digest = hashlib.sha256(raw.encode()).hexdigest()
    # 存 digest、owner、额度、创建时间；raw 只在这一次返回给用户
    db.execute(
        "INSERT INTO tokens(digest, owner, quota_cents, created_at) "
        "VALUES (%s, %s, %s, now())",
        (digest, owner, 500),
    )
    return raw

def verify(raw: str) -> dict | None:
    digest = hashlib.sha256(raw.encode()).hexdigest()
    return db.fetchone("SELECT * FROM tokens WHERE digest = %s AND revoked = false", (digest,))
```

用 `sha256` 而不是 bcrypt，是因为令牌是 32 字节随机串，没有字典攻击的空间，而每次请求都要校验，bcrypt 的 100ms 代价承受不了。用户密码反过来，必须用慢哈希，这两者不能套同一个方案。

校验失败返回 401，但响应体要一致。分别返回「令牌不存在」「令牌已过期」「额度不足」，等于给攻击者一个枚举接口。额度不足用 402 或者 429，不要用 401，客户端才能正确区分该换令牌还是该充值。

## 限流：至少两个维度

单一维度的限流一定会被打穿。只按 IP 限，同一台机器换 IP 就绕过去了；只按令牌限，一个人开十个令牌就是十倍额度。

我需要的是至少三层：令牌维度、模型维度、全局维度。

令牌维度防单个用户打爆，模型维度防某个贵模型被集中刷，全局维度是最后一道闸，防止上游账单失控。

算法用令牌桶而不是固定窗口。固定窗口有个边界问题：一分钟 60 次的限制，在 00:59 打 60 次、01:00 再打 60 次，两秒内过了 120 次。令牌桶按速率补充，没有这个缺口。

```python
import time, redis

r = redis.Redis(decode_responses=True)

def allow(key: str, rate_per_sec: float, burst: int) -> tuple[bool, float]:
    """返回 (是否放行, 建议等待秒数)。用 Redis 存桶状态，Lua 保证原子。"""
    lua = """
    local key, rate, burst, now = KEYS[1], tonumber(ARGV[1]), tonumber(ARGV[2]), tonumber(ARGV[3])
    local t = redis.call('HMGET', key, 'tokens', 'ts')
    local tokens = tonumber(t[1]) or burst
    local ts = tonumber(t[2]) or now
    tokens = math.min(burst, tokens + (now - ts) * rate)
    if tokens < 1 then
      redis.call('HMSET', key, 'tokens', tokens, 'ts', now)
      redis.call('EXPIRE', key, 120)
      return {0, (1 - tokens) / rate}
    end
    redis.call('HMSET', key, 'tokens', tokens - 1, 'ts', now)
    redis.call('EXPIRE', key, 120)
    return {1, 0}
    """
    ok, wait = r.eval(lua, 1, key, rate_per_sec, burst, time.time())
    return bool(ok), float(wait)
```

这段必须用 Lua 或者 `EVAL` 保证读改写原子。分成 `GET` 再 `SET`，并发下会超发，实测二十个并发就能把 10 QPS 的桶放到 14。

被限流时返回 429，并带上 `Retry-After` 和 `X-RateLimit-Remaining`。不带这两个头，客户端只能盲目重试，把限流窗口一直续上，最后谁都进不来。

具体数值上，我的默认配置是：单令牌 2 QPS、突发 10；单模型 20 QPS；全局 100 QPS。这套数值在 2 核机器上留了余量，实际压测到 130 QPS 时 P99 延迟才明显抬头。

## 日志：先定字段，再谈采集

日志的价值取决于字段设计，不取决于存了多少。我要能回答三个问题：这次请求是谁发的、打到了哪个渠道、花了我多少钱。

一行一条 JSON，字段固定：

```json
{
  "ts": "2026-11-08T10:21:33.412+08:00",
  "req_id": "01JC8Z4Q7X",
  "token_id": 42,
  "owner": "lab-gpu",
  "model_req": "chat-large",
  "model_up": "qwen-max",
  "channel_id": 7,
  "stream": true,
  "status": 200,
  "prompt_tokens": 1812,
  "completion_tokens": 640,
  "first_byte_ms": 380,
  "total_ms": 9120,
  "cost_cents": 3,
  "retry": 0
}
```

`req_id` 是整条链路的串联键。客户端可以在请求头里带一个 `X-Request-Id`，网关透传并回写响应头，出问题时用户报这个 id，你直接 grep 一条。

`first_byte_ms` 和 `total_ms` 要分开记。流式请求里首字节时间反映上游排队和冷启动，总耗时反映生成长度。只看总耗时，会把「模型慢」和「回答长」混为一谈。

`model_req` 和 `model_up` 也要分开。对外模型名是稳定契约，上游模型名会变。只有这一层分开记，换渠道前后才能对比。

## 隐私与保留

请求体默认不记。需要排查时按 `req_id` 临时开启采样，记 1% 就够定位问题。

要记的话必须脱敏，`Authorization`、`Cookie`、`api_key` 一律替换成 `[redacted]`，正文里的手机号、邮箱用正则抹掉。这件事我建议做成中间件的默认行为，而不是靠写日志的人自觉。

保留期按天分区，30 天足够。超过 30 天的日志查询频率接近于零，但磁盘成本是实打实的。清理用定时任务删分区表，不要 `DELETE FROM logs WHERE ts < ...`，后者在大表上会锁住整张表。

## 三层的关键取舍

| 层面 | 方案 | 代价 | 什么时候值得 |
| --- | --- | --- | --- |
| 令牌存储 | 明文 | 泄露即失守 | 不推荐 |
| 令牌存储 | sha256 | 无法反查原文 | 默认方案 |
| 限流 | 固定窗口 | 边界双倍放行 | 只做粗粒度兜底 |
| 限流 | 令牌桶 + Lua | 需要 Redis | 有明确 QPS 要求时 |
| 日志 | 全量请求体 | 存储与合规风险 | 排查期临时开采样 |
| 日志 | 元数据 + 采样正文 | 无法复现具体内容 | 长期默认 |

最后一行是实际选择。全量存正文看起来很爽，但一个月之后你会发现：磁盘满了、备份变慢、还多了一堆不该留的用户内容。元数据全记，正文按需采样，这个组合在排查效率和成本之间最平衡。

接入渠道这件事，做完这三层之后才算是「上线」。只把 key 填进去能通，那叫试用。

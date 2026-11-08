---
title: 一次请求记哪些字段才够复现
summary: 从「用户说答得不对」出发，倒推日志最小字段集与采样策略
order: 3
level: 进阶
tags: [可观测性, 日志, trace]
updated: 2026-11-08
readingTime: 5
---

排障时最耗时的不是修，是复现。用户说「刚才那个回答是错的」，而你手上只有一条 `status=200, latency=3.2s`。判断这类问题需要哪些字段，有个很实用的办法：拿一个真实的坏回答，问自己缺什么才能重放出同一个输出。

## 复现的最小闭环

要让同一个输入走同一条代码路径得到同一个输出，需要四类信息：模型侧参数、输入原文、代码侧决策、环境侧状态。缺任何一类，都只能靠猜。

模型侧：`model` 精确到版本号，不要只记 `gpt-4o` 这种别名，别名后面会漂移。`temperature`、`top_p`、`max_tokens`、`stop`、`seed`。开了 `seed` 也不保证完全确定，但能把分布收窄，排障时够用。

输入原文：完整 messages 数组，不是摘要。还要记 tokenizer 数出来的 token 数。

代码侧决策：这一次请求走了哪条分支。检索了几条、重排后保留了几条、注入了哪几个工具、用了哪个提示词模板的哪个版本。这一层最常被漏，因为没有它，同一个输入在两次请求里可能走完全不同的路径。

环境侧：上游提供商、区域节点、是否命中缓存、重试次数、降级档位。

## 字段清单

下面是按「必须有 / 有了更好」分的清单。有必须字段就能复现，有可选字段能定位性能与成本问题。

| 字段 | 类型 | 级别 | 说明 |
| --- | --- | --- | --- |
| `trace_id` | string | 必须 | 贯穿前后端，前端报错时用户能提供 |
| `model` | string | 必须 | 带版本号，例如 `gpt-4o-2024-08-06` |
| `prompt_version` | string | 必须 | 模板的 git commit 短哈希 |
| `messages_hash` | string | 必须 | 输入内容的 sha256 前 16 位 |
| `params` | object | 必须 | 采样参数整体序列化 |
| `input_tokens` | int | 必须 | 来自上游 `usage` |
| `output_tokens` | int | 必须 | 同上 |
| `cached_tokens` | int | 必须 | 判断缓存是否生效 |
| `finish_reason` | string | 必须 | `stop` / `length` / `content_filter` |
| `attempt` | int | 必须 | 第几次重试，从 0 开始 |
| `latency_ms` | object | 必须 | 拆成 connect / first_token / total |
| `route` | string | 可选 | 实际命中的提供商与区域 |
| `retrieved_ids` | string[] | 可选 | 检索命中的文档 ID |
| `degraded` | string | 可选 | 降级档位，空表示未降级 |
| `response_preview` | string | 可选 | 前 200 字，脱敏后 |

`finish_reason` 比任何错误码都有用。用户抱怨「回答被截断了」，看这个字段是 `length` 就结束了排查。用户抱怨「答非所问」，如果是 `content_filter`，说明是拦截而不是模型能力问题。

`first_token` 和 `total` 必须分两个字段。只记 total，无法区分「模型慢」和「首字节慢」。我遇到过一次平均延迟从 1.8s 涨到 4s 的告警，拆分后发现 first_token 没变、total 变长，原因是输出被模板改动带长了两百 token，跟推理速度无关。

## JSON 日志的实际写法

结构化日志的关键是：一行一条，字段名固定，不嵌套超过两层。

```python
import hashlib, json, time, uuid, logging
from openai import OpenAI

client = OpenAI(timeout=30.0, max_retries=0)   # 重试自己管，别让 SDK 偷偷重试
log = logging.getLogger("llm")

def call_llm(messages, model, params, prompt_version, attempt=0):
    trace_id = str(uuid.uuid4())
    blob = json.dumps(messages, ensure_ascii=False, sort_keys=True)
    digest = hashlib.sha256(blob.encode()).hexdigest()[:16]
    t0 = time.monotonic()
    try:
        resp = client.chat.completions.create(model=model, messages=messages, **params)
        t1 = time.monotonic()
        u = resp.usage
        details = getattr(u, "prompt_tokens_details", None)
        log.info(json.dumps({
            "trace_id": trace_id,
            "model": resp.model,
            "prompt_version": prompt_version,
            "messages_hash": digest,
            "params": params,
            "input_tokens": u.prompt_tokens,
            "output_tokens": u.completion_tokens,
            "cached_tokens": getattr(details, "cached_tokens", 0) if details else 0,
            "finish_reason": resp.choices[0].finish_reason,
            "attempt": attempt,
            "latency_ms": {"total": int((t1 - t0) * 1000)},
        }, ensure_ascii=False))
        return resp
    except Exception as e:
        log.error(json.dumps({
            "trace_id": trace_id,
            "model": model,
            "messages_hash": digest,
            "attempt": attempt,
            "latency_ms": {"total": int((time.monotonic() - t0) * 1000)},
            "error_type": type(e).__name__,
            "error_msg": str(e)[:300],
        }, ensure_ascii=False))
        raise
```

流式路径要额外记 `first_token_ms`，在收到第一个非空 delta 时打点。非流式调用没有这个概念，`total` 就够。

`sort_keys=True` 是必要的。messages 里字典键的顺序不稳，会导致同一个输入算出不同的 hash，按 hash 聚合的结果就散成一片。

`trace_id` 要回传给前端。前端渲染回答时把 id 塞进一个隐藏的复制按钮，用户反馈问题时一键带走，比让他描述「大概三点多那次」有效得多。

## 不要存全量原文

全量原文有隐私和体积两个问题。一条包含 8000 token 上下文的请求，原文大概 30KB，一天十万次就是 3GB 文本量，日志系统的成本会超过模型调用本身。

折中方案是分层：默认只存 hash 和 preview；命中错误、或响应被用户标记为差评时，把原文写进单独的对象存储，保留 7 天，键是 `trace_id`。这样正常请求的日志很轻，需要复现的那条有全量。

采样率按状态分层制定，不要全局随机采样。

| 请求类型 | 采样率 | 理由 |
| --- | --- | --- |
| 成功且无标记 | 2% | 只为统计分布 |
| `finish_reason=length` | 100% | 截断问题需要全样本 |
| 5xx 或超时 | 100% | 数量少，必须全留 |
| 用户差评 | 100% | 唯一的高价值标注 |
| 命中降级 | 50% | 观察降级质量 |

全局 1% 采样的问题在于，错误率 0.3% 时，一天十万请求只能采到 3 条错误，统计上没意义。按状态分层，错误永远全留。

## 指标与日志分开

日志回答「这一次发生了什么」，指标回答「整体在变好还是变坏」。混在一起会让两边都变差：日志里塞聚合数字，查询慢；指标里塞 trace_id，基数爆炸。

需要单独做成 counter 或 histogram 的只有几项：按 `model` 和 `feature` 维度的请求数、token 消耗、`finish_reason` 分布、首 token 延迟的分位数、缓存命中率。`trace_id` 这类高基数字段绝对不能进指标标签，一天十万请求会产生十万条时间序列，直接把 Prometheus 打挂。

告警按用户感知设阈值。首 token 延迟 P95 超过 3s 报警，比整体错误率超过 1% 报警更贴近实际体验，因为流式场景下用户对首字等待最敏感。总延迟再长，只要首字快，观感就不差。

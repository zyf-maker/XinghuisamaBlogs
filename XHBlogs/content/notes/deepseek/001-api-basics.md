---
title: "DeepSeek API 接入四坑"
summary: "base_url、模型名、max_tokens、错误码四处高频翻车点，附可跑通调用与流式解析"
order: 1
level: "入门"
tags: [DeepSeek, API, Python]
updated: "2026-11-08"
readingTime: 7
---

上周替同事排查一个 404，代码本身没毛病：他把 `base_url` 写成了 `https://api.deepseek.com/v1`。OpenAI 官方端点带 `/v1`，DeepSeek 的文档里不带，SDK 会自己拼 `/chat/completions`，多一层前缀就落到不存在的路由上。这种错误不报参数错，日志里只看得到路由不存在，很容易往网络和代理上想。

## base_url 与 OpenAI SDK 的兼容边界

兼容层做的是协议对齐，不是端点对齐。正确写法是 `https://api.deepseek.com`，SDK 内部拼成 `https://api.deepseek.com/chat/completions`。Anthropic 格式是另一套，挂在 `https://api.deepseek.com/anthropic` 下，两套别混着用，同一个 key 可以调，但消息结构不同。

`extra_body` 是这套兼容层的关键细节。OpenAI SDK 的 `create()` 签名里没有 `thinking`、`user_id` 这类字段，直接当关键字参数传会抛 `TypeError`，必须塞进 `extra_body`，SDK 会把它并进请求体。第一次遇到这个报错时我以为是 SDK 版本旧，升级了两版才反应过来。

## 模型名只有两个

可用名是 `deepseek-flash` 和 `deepseek-v4-pro`，具体以官方文档为准。旧文章里的 `deepseek-chat`、`deepseek-reasoner`、`deepseek-v4-flash` 这些名字还能不能调、映射到哪个版本，只能查文档当下的模型列表，别照抄半年前的博客。

我上线前会跑一次模型列表接口，把返回的名字写进配置的默认值，避免硬编码一个已经下线的名字。

| 维度 | deepseek-flash | deepseek-v4-pro |
| --- | --- | --- |
| 上下文 / 输出上限 | 1M / 384K | 1M / 384K |
| 并发限制（账号粒度） | 2500 | 500 |
| 图像理解 | 支持 | 不支持 |
| 输入单价（缓存未命中） | 约为 pro 的四分之一到五分之一 | 基准价，以官方文档为准 |
| 输出单价 | 约为 pro 的三分之一 | 基准价，以官方文档为准 |

价格随时段浮动，空闲时段是高峰的一半，实际以官方文档为准。选型我只问三件事：要不要看图、并发峰值多高、单次输出多长。要图或者并发过千，flash 没有替代品；纯推理任务且并发不超过 500，pro 的答案质量确实高一档，代价是输出单价三倍多。

## max_tokens 卡的是输出总量

这是最容易误判的一处。`max_tokens` 卡的是 completion 的总量，思考模式下推理内容和最终回答共用这个额度。它还决定推理能跑多久：非思考模式默认 8K，思考模式默认 64K，`reasoning_effort` 设成 `max` 时默认 128K，硬上限 393216。取值范围是 1 到 384K，超过就报 422。

我踩过一次：把 `max_tokens` 按老习惯设成 1024，思考模式下模型推理到一半就被截断，`content` 是空的，`finish_reason` 是 `length`。当时以为是模型抽风，其实是额度只够写完思考。现在的判断规则很简单，看到 `finish_reason == "length"` 且 `content` 为空，先怀疑额度，不要怀疑模型。

## 400 和 402 分别代表什么

400 是请求体层面的错误，402 是账户余额。两者在日志里都表现为一次失败请求，但修法完全不同，混在一起排查会浪费很多时间。

| 状态码 | 我实际遇到过的触发条件 | 处理方式 |
| --- | --- | --- |
| 400 | `stream_options` 传了但 `stream` 不是 true | 两个参数成对出现 |
| 400 | 带 `tools` 的请求，历史轮 `reasoning_content` 没回传 | 整条 message 原样 append |
| 400 | 思考模式下 `tool_choice` 设成 `required` 或指定函数 | 先关思考，或用 `auto` |
| 401 | key 从环境变量读进来带了换行 | `.strip()` 一次 |
| 402 | 赠送额度和充值额度都扣完 | 查余额接口，充值 |
| 422 | `max_tokens` 超过 393216 | 按上限截断 |
| 429 | 并发超限，flash 2500、pro 500 | 退避重试，别立刻重发 |
| 503 | 高峰排队或资源不足 | 指数退避，超过三次降级 |

402 有一个隐蔽点：余额为 0 时接口不会返回空回答，而是直接拒绝整个请求。做灰度时如果只监控 HTTP 200 的比例，余额耗尽会表现成成功率骤降，容易误判成模型服务异常。

## 最小可跑通调用

非流式请求适合先验证链路，下面这段去掉思考模式，输出稳定，便于对比 token 数。

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["DEEPSEEK_API_KEY"].strip(),
    base_url="https://api.deepseek.com",
    timeout=120,
)

resp = client.chat.completions.create(
    model="deepseek-flash",
    messages=[
        {"role": "system", "content": "回答控制在三句话内，不用列表。"},
        {"role": "user", "content": "解释一下 KV cache 为什么能省下重复计算"},
    ],
    max_tokens=2048,
    extra_body={"thinking": {"type": "disabled"}},
)

choice = resp.choices[0]
print("finish:", choice.finish_reason)
print(choice.message.content)
print("tokens:", resp.usage.prompt_tokens, resp.usage.completion_tokens)
print("cache hit:", resp.usage.prompt_tokens_details.prompt_cache_hit_tokens)
```

`prompt_cache_hit_tokens` 这个字段值得单独打出来。固定的 system prompt 和长文档前缀会命中缓存，命中部分的输入单价明显低于未命中部分，实际以官方文档为准。同一段前缀连发两次，第二次的命中数应该接近前缀长度，如果不是，说明前缀被改动了，比如中间插了时间戳。

## 流式要处理的三种帧

流式返回是 SSE，里面混着三种行：带数据的 `data: {...}`、保活用的 `: keep-alive` 注释、结束标记 `data: [DONE]`。自己解析 HTTP 响应时必须跳过注释行，否则 json 解析会在冒号上炸掉。另外 `stream_options.include_usage` 打开后，最后一个块的 `choices` 只含一个元素，不含新增内容，`usage` 挂在这个块上，别指望单独收到一个只带 usage 的包。

```python
stream = client.chat.completions.create(
    model="deepseek-flash",
    messages=[{"role": "user", "content": "写一个 30 行的令牌桶限流器，只要代码"}],
    stream=True,
    stream_options={"include_usage": True},
    max_tokens=4096,
)

for chunk in stream:
    if not chunk.choices:
        continue
    delta = chunk.choices[0].delta
    if getattr(delta, "content", None):
        print(delta.content, end="", flush=True)
    if chunk.choices[0].finish_reason:
        print("\nfinish:", chunk.choices[0].finish_reason)
    if getattr(chunk, "usage", None):
        print("total:", chunk.usage.total_tokens)
```

## 上线前先看三个数

命中率、推理占比、错误码分布。命中率低就去调整前缀顺序，把稳定内容放前面；推理占比高说明任务其实不需要思考，可以关掉；429 和 503 的比例决定重试策略要不要加长退避。这三个数比平均延迟更能说明链路是否健康。

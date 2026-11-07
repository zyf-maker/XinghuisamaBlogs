---
title: "工具调用是怎么工作的：从 JSON Schema 到 function calling"
summary: "拆开一次工具调用的完整链路：模型只生成结构化文本，解析、校验、执行与回填都在你的代码里，断点也都在那里。"
order: 1
level: "入门"
tags: ["function calling", "JSON Schema", "Agent"]
updated: "2026-11-05"
readingTime: 4
---

很多人第一次读完 function calling 的文档，会以为模型真的执行了什么。实际上它只做了一件很朴素的事：把「我想调用哪个工具、参数是什么」写成一段结构化文本。剩下的解析、校验、执行、把结果塞回对话，全部发生在你的进程里。这篇文章把这条链路拆开，逐段说明它在哪里会断。

## 一、模型没有调用任何东西

function calling（也常被称作 tool use）在协议层只是一次受约束的文本生成。你提供一份工具清单，模型在需要时输出一个特殊消息块，里面带工具名和一段 JSON。不同厂商的叫法不一样，OpenAI 叫 tool_calls，Anthropic 叫 tool_use content block，MCP（Model Context Protocol）里则是一个 tools/call 的 JSON-RPC 请求。名字不同，骨架相同：工具名、参数、一个用于对账的 id。

把这个前提想清楚，会直接推出三个结论。第一，模型不会因为 schema 里写了 required 就真的传全，schema 只是强烈建议。第二，模型不知道你的工具此刻是否可用、是否限流。第三，工具执行失败时模型不会自动得知，除非你把错误当成一条普通消息喂回去。

所以「工具调用」这个说法本身有点误导。准确的说法是：模型生成调用意图，运行时负责把意图落成副作用。

## 二、JSON Schema 是写给模型的说明书

一个能被稳定调用的工具定义，大概长这样：

```json
{
  "name": "query_structure",
  "description": "按 SMILES 查询分子结构信息。仅在用户给出明确分子标识时调用。",
  "parameters": {
    "type": "object",
    "properties": {
      "smiles": {
        "type": "string",
        "description": "标准 SMILES，不带盐和立体标记"
      },
      "fields": {
        "type": "array",
        "items": { "type": "string", "enum": ["formula", "mw", "logp", "hbd", "hba"] },
        "description": "需要返回的字段，默认只返回 formula 与 mw"
      }
    },
    "required": ["smiles"],
    "additionalProperties": false
  }
}
```

写 schema 时有几条经验值得记住。description 的信息量远大于 type，"什么时候该用"比"参数是什么类型"更能左右模型的选择。enum 是抑制幻觉最有效的约束，凡是取值有限的参数都应该枚举，而不是让模型自由发挥。additionalProperties: false 能减少模型自作主张加字段的概率。

也要知道 schema 的局限。模型看到的是序列化之后的文本，不是 JSON Schema 规范本身；`$ref`、`oneOf`、`allOf` 这类组合关键字在不同实现里的支持程度不一致，schema 越复杂，调用准确率越低。我的经验是嵌套不要超过两层，扁平的对象加清晰的字段名，比精巧的复用结构可靠得多。

还有一个常被忽略的点：schema 里的 description 会直接占用上下文窗口（context window）。工具多、字段多的时候，光是工具定义就可能吃掉几千 token，而且这部分开销每一轮都要重付。字段描述写清楚是必要的，把整段使用文档塞进 description 则得不偿失。

## 三、一次完整的往返

下面是一次真实的最小往返，用 OpenAI 的 Python SDK 写：

```python
from openai import OpenAI
import json

client = OpenAI()

tools = [{
    "type": "function",
    "function": {
        "name": "query_structure",
        "description": "按 SMILES 查询分子结构信息",
        "parameters": {
            "type": "object",
            "properties": {"smiles": {"type": "string"}},
            "required": ["smiles"],
        },
    },
}]

messages = [{"role": "user", "content": "帮我查一下 CC(=O)Oc1ccccc1C(=O)O 的分子量"}]

resp = client.chat.completions.create(
    model="gpt-4.1-mini",
    messages=messages,
    tools=tools,
    tool_choice="auto",
)

msg = resp.choices[0].message
messages.append(msg.model_dump(exclude_none=True))

for call in msg.tool_calls or []:
    args = json.loads(call.function.arguments)
    result = query_structure(**args)          # 你自己的实现
    messages.append({
        "role": "tool",
        "tool_call_id": call.id,
        "content": json.dumps(result, ensure_ascii=False),
    })

final = client.chat.completions.create(model="gpt-4.1-mini", messages=messages, tools=tools)
```

有三个细节容易漏。assistant 那条带 tool_calls 的消息必须原样回填，不能只回填文本，否则部分实现会直接报 400。每个 tool_call 都必须有一条对应的 tool 消息，id 要对上，漏一条就报错。工具返回的 content 必须是字符串，字典要自己序列化。

## 四、实际会断在哪里

| 故障 | 表现 | 处理方式 |
| --- | --- | --- |
| 参数幻觉 | 传了 enum 之外的取值，或编造不存在的 id | 服务端二次校验，拒绝后把错误文本回传 |
| 类型漂移 | 数字被写成字符串，布尔被写成 "true" | 用 pydantic 之类做严格解析，失败即报错 |
| 并行调用漏回 | 模型一次给出三条 tool_calls，只回了一条 | 循环遍历，保证一一对应 |
| 流式分片 | 流式模式下参数字符串被切成多段 | 按 index 累积拼接，结束时再解析 |
| 结果过长 | 一次查询返回几万字符，上下文被挤爆 | 在工具侧截断并给出摘要字段 |
| 无进展循环 | 反复调用同一工具、参数几乎不变 | 记录调用指纹，命中重复就强制终止 |

其中最常见的是参数幻觉和无进展循环，前者靠校验兜住，后者靠运行时计数兜住，都不能指望提示词解决。

## 五、我的做法

工具宁少勿多。一个工具只做一件事，不要造一个能查能改能删的万能接口，因为模型对宽接口的参数选择几乎必然失误。工具总数超过二十个时，我会先做一层工具检索，把候选收窄到五六个再交给模型，而不是把所有 schema 一次性铺进去。

错误要以模型能读懂的方式回传，而不是抛异常中断整轮对话。把 "SMILES 解析失败：第 7 个字符非法" 作为 tool 消息返回，模型通常能自己换个写法重试；直接抛异常只会让整次请求失败。

写操作一定要有幂等键。模型重试是常态，重复下单、重复发信这类事故几乎都来自这里。超时和重试预算也要在运行时控制，别让一次工具调用把整条链路拖死。

最后一条：schema 不是安全边界。它是给模型的说明书，不是给你的校验器。权限判断、参数合法性和资源配额，都必须在真正执行的那一侧完成。

## 六、什么时候不该用

如果任务只有一步、输出结构固定，用结构化输出（structured outputs）直接约束结果就行，多绕一层工具调用只是增加延迟和失败点。如果流程本身是确定的，比如「先查库、再算、再写文件」，把它写成固定代码比让模型选工具可靠得多。

工具调用的价值在于处理分支不确定的场合：用户想查什么、要不要再多查一次、参数从哪里来，这些才是模型擅长的判断。把确定性留给代码，把选择权留给模型，这条线划清楚，工具调用才真的好用。

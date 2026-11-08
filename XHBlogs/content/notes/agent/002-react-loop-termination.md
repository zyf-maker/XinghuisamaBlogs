---
title: "ReAct 循环该在哪里停"
summary: "终止条件、步数上限与重复调用检测的具体判定逻辑和参数"
order: 2
level: "进阶"
tags: [Agent, ReAct, 循环控制]
updated: "2026-11-08"
readingTime: 6
---

ReAct 循环跑飞的方式很固定：模型不给出最终答案，一直调工具；或者给了一个答案是"我再确认一下"，然后调同一个工具第三次。前者烧钱，后者更糟，因为日志里看起来一切正常。

上线前必须回答三个问题：什么时候算结束、最多跑多少步、怎么发现它在原地转圈。三个都不能靠模型自觉。

## 终止信号要显式

最不可靠的做法是检测输出里有没有 "Final Answer" 这个词。模型会写"最终的答案是"、"Answer:"、"综上"，每一种都合理，每一种都要加正则。而在 function calling 模式下，终止本来就有结构化信号：模型这一轮没有返回 `tool_calls`，只返回了文本内容。这就是唯一的终止条件，不需要解析文本。

代价是模型可能同时返回文本和 tool_calls。这时以 tool_calls 为准，因为模型很可能是在说"我先查一下"然后附带了一个调用。文本部分可以留作思考轨迹，但不能当答案。

```
循环终止的判定顺序：
1. 没有 tool_calls 且 content 非空  -> 正常结束，content 即答案
2. 没有 tool_calls 且 content 为空  -> 异常结束，回退到最近一次有效观察
3. 有 tool_calls 且 step >= MAX_STEPS -> 强制结束，追加一条"步数用尽，请基于已有信息作答"
4. 有 tool_calls 但命中重复检测      -> 强制结束或换策略
```

第 2 条很关键。模型偶尔会返回空内容，常见于上下文接近上限或者工具返回了超长内容之后。不处理的话，调用方拿到空字符串，前端显示一片空白。

## 步数上限取多少

常见任务是 3 到 5 步。上限设 8 覆盖了 95% 的正常情况，设 15 只会让跑飞的案例多烧一倍钱。我用 8 作为默认值，但按任务类型调整：

| 任务类型 | 上限 | 依据 |
| --- | --- | --- |
| 单次查询 + 总结 | 4 | 一次工具调用加一次改写 |
| 多跳检索（比较、聚合） | 8 | 跳数约为问题中的实体数 +1 |
| 代码修复循环 | 12 | 改-跑-看报错-再改，允许三次迭代 |
| 开放型研究 | 15 | 需要强制收敛提示，否则必然撞上限 |

上限的作用不是让任务成功，是让失败变便宜。撞上限的任务本来也大概率失败，早点结束能省下后面几步的 token。

超过上限时的收尾方式也要固定：不要直接报错，而是再发一轮请求，把 `tool_choice` 设为 `none`，system 里追加"步数已用尽，只能基于已有观察作答，不要调用工具"。这样至少有 60% 的概率能拿到一个部分正确的答案，比抛异常好。

## 重复调用的检测

我的判定用三个信号，任何一个命中就算重复：

完全相同调用，即工具名和参数 JSON 逐字节相同。这是最常见的，参数里带了时间戳或随机 ID 的情况要先把这些字段归一化，否则每次都"不同"。归一化规则写在配置里，比如忽略 `request_id`、`trace_id`、`timestamp` 三个键。

参数近似相同，用参数值拼成的字符串算相似度，Jaccard 或编辑距离都行。阈值取 0.85，主要是为了抓住"同一个查询换了个说法"的情况，比如 `query: "Redis 持久化"` 和 `query: "redis 持久化机制"`。这一条的误报率不低，所以只在连续两步都近似时才算。

观察结果无新增，把本轮工具返回的文本和上一轮做比对，长度差小于 5% 且关键词重合度高于 0.9 就认为没有新信息。这一条能抓住"换了参数但返回同一份文档"的情况，在检索类工具上特别有效。

```python
import hashlib
import json
from collections import Counter

def call_fingerprint(name: str, args: dict, ignore: tuple[str, ...] = ()) -> str:
    """忽略易变字段后生成稳定指纹。"""
    clean = {k: v for k, v in args.items() if k not in ignore}
    payload = json.dumps({"n": name, "a": clean}, sort_keys=True, ensure_ascii=False)
    return hashlib.sha1(payload.encode()).hexdigest()[:16]

def is_stuck(history: list[dict], window: int = 3) -> bool:
    """history 里每项含 fingerprint 与 observation。连续 window 次同指纹 = 卡住。"""
    if len(history) < 2:
        return False
    recent = [h["fingerprint"] for h in history[-window:]]
    if len(set(recent)) == 1:
        return True

    def overlap(a: str, b: str) -> float:
        ca, cb = Counter(a), Counter(b)
        inter = sum((ca & cb).values())
        union = sum((ca | cb).values())
        return inter / union if union else 1.0

    last, prev = history[-1], history[-2]
    if last["fingerprint"] != prev["fingerprint"]:
        return overlap(last["observation"], prev["observation"]) > 0.9
    return False
```

`window=3` 的意思是连续三次同样调用才判定卡死。用 2 会让"重试一次"的合法行为被误杀，很多工具第一次超时第二次成功。

## 卡住之后怎么办

直接终止会浪费已经积累的上下文。我的处理是分三级：

第一级，注入纠正提示。把重复的调用从历史里删掉，换成一条 user 消息："你已经用相同的参数调用了 search 两次，返回内容相同。请改用不同策略，或基于现有信息作答。"这一步能救回大约一半的卡死案例，因为模型确实没意识到自己在重复。

第二级，禁用工具。`tool_choice: "none"` 强制它必须输出文本。适用于已经积累了三轮以上有效观察的情况。

第三级，降级返回。把已收集的观察拼成一份摘要返回，标注"信息可能不完整"。这是给用户的兜底，不该静默发生，要在响应里带一个标记字段。

## 上下文也是循环的一部分

循环跑久了，观察内容会把上下文撑爆。一个网页抓取工具返回 8 千字，三步之后就是 2.4 万字。我的做法是每步之后对观察做截断：保留前 1500 字和后 500 字，中间用 `[... 已省略 6234 字 ...]` 替代。首尾保留是因为工具返回的内容通常结论在头部（摘要）、异常在尾部（错误信息）。

截断之后要保证工具名和参数的记录完整，否则重复检测失效。这两个字段不进截断范围，只截 observation 字段。

## 别把循环写成递归

用递归实现循环，每次调用压一层栈，出异常时栈信息几十层，日志里根本看不出第几步出的错。用 `for step in range(MAX_STEPS)` 加显式状态列表，每一步的输入、输出、耗时都追加到同一个结构里，出问题能一眼定位到第几步、哪个工具、参数是什么。可观测性上的这点差别，在排查线上问题时值几个小时。

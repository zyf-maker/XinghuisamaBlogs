---
title: "推理内容怎么解析、怎么计费"
summary: "推理流与正文流的分流解析、按 reasoning_tokens 核算成本、以及折叠展示的取舍"
order: 2
level: "进阶"
tags: [DeepSeek, reasoning_content, 流式解析]
updated: "2026-11-08"
readingTime: 8
---

把思考模式的返回直接拼成一个字符串丢给前端，是我今年改得最亏的一处代码。用户在页面上看到模型先自言自语两百字再给答案，第一反应是「它卡住了」。更糟的是账单：同一个改写任务，开思考比关思考的输出 token 多了 2.6 倍，因为推理内容按输出计价。

## 两个字段，两条流

思考模式下，`message` 对象里同时有 `reasoning_content` 和 `content`，两者同级，不是嵌套关系。流式时也是两路增量各自下发，同一个 delta 里通常只有一个非空，但协议不保证永远互斥，所以累积缓冲必须分开，不能写成 `buf += delta.content or delta.reasoning_content`。这么写出来的文本会把推理和答案缝在一起，后面没有任何办法切开。

`reasoning_content` 的语义是「最终答案之前的推理内容」。它不保证是给人读的完整句子，也不保证格式稳定，直接当正文渲染会得到一堆半截话。我把它当调试信息看待，只在需要的时候给人看。

## 推理长度不可控，但可以度量

`max_tokens` 是推理和正文共用的额度，模型不会告诉你它打算想多久。同一个 prompt 连跑五次，推理 token 数的波动可以到两三倍，这是成本估算最大的不确定性来源。

可度量的值在 `usage.completion_tokens_details.reasoning_tokens` 里，非流式直接读，流式要等最后一个块。我现在的做法是把每次请求的 `reasoning_tokens / completion_tokens` 打进日志，按任务类型聚合。跑了一周后拿到一组数：分类任务的中位数是 0.71，结构化抽取是 0.63，多步算术题是 0.44。前两类根本不需要思考，白白付了七成输出费用。

| 任务类型 | 实测推理占比 | 建议 |
| --- | --- | --- |
| 文本分类、打标签 | 0.6 到 0.75 | 关掉思考，准确率几乎不变 |
| 字段抽取、格式转换 | 0.55 到 0.7 | 关掉，配 JSON 模式 |
| 短文本润色、翻译 | 0.4 到 0.6 | 关掉，延迟能降一半以上 |
| 多步算术、逻辑校验 | 0.35 到 0.5 | 开，答案正确率提升明显 |
| 代码调试、根因分析 | 0.4 到 0.6 | 开，且用 `reasoning_effort: high` |

这些数字来自我自己的业务语料，换领域要重测。判断方法很土：同一批样本跑两遍，一遍开一遍关，比正确率和总输出 token，正确率差不到两个百分点就关。

## 什么时候该把思考关掉

`reasoning_effort` 传 `none`，或者 `extra_body` 里传 `{"thinking": {"type": "disabled"}}`，后者的优先级更高。传了 `thinking` 对象时 `reasoning_effort` 就不起作用了，两处都写容易自己把自己绕进去。

`temperature` 是个连带副作用。思考模式下这个参数不生效，传了也不报错。关掉思考以后它才真正开始影响输出，如果之前照着旧代码写了 0.2，切到非思考模式会突然发现输出变得很死板。

多轮拼接也分两种。不带 `tools` 的请求，历史轮的 `reasoning_content` 传上去会被忽略；一旦请求体里出现 `tools`，历史轮就必须完整回传，缺一个就 400。我的做法是统一回传整个 message 对象，别自己挑字段拼，省得两种模式各写一套。

## 用原始 SSE 分流解析

直接用 SDK 也能做，但要看保活注释和 `[DONE]` 就得自己碰字节流。这段代码用 `requests` 逐行读，把两路增量分开累积，顺便统计推理 token。

```python
import json
import os
import time
import requests

def stream_with_reasoning(prompt: str, with_reasoning: bool = True):
    payload = {
        "model": "deepseek-flash",
        "messages": [{"role": "user", "content": prompt}],
        "stream": True,
        "stream_options": {"include_usage": True},
        "max_tokens": 8192,
    }
    if with_reasoning:
        payload["reasoning_effort"] = "high"
    else:
        payload["thinking"] = {"type": "disabled"}

    resp = requests.post(
        "https://api.deepseek.com/chat/completions",
        headers={
            "Authorization": f"Bearer {os.environ['DEEPSEEK_API_KEY'].strip()}",
            "Content-Type": "application/json",
        },
        json=payload,
        stream=True,
        timeout=(10, 300),
    )
    if resp.status_code >= 400:
        raise RuntimeError(f"{resp.status_code} {resp.text[:300]}")

    reasoning_buf, content_buf = [], []
    usage, finish = None, None
    started = time.monotonic()

    for raw in resp.iter_lines(decode_unicode=True):
        if not raw:
            continue
        line = raw.strip()
        if line.startswith(":"):          # SSE 保活注释，直接丢
            continue
        if not line.startswith("data:"):
            continue
        data = line[5:].strip()
        if data == "[DONE]":
            break

        chunk = json.loads(data)
        if chunk.get("usage"):
            usage = chunk["usage"]
        choices = chunk.get("choices") or []
        if not choices:
            continue

        choice = choices[0]
        delta = choice.get("delta") or {}
        if delta.get("reasoning_content"):
            reasoning_buf.append(delta["reasoning_content"])
        if delta.get("content"):
            content_buf.append(delta["content"])
        if choice.get("finish_reason"):
            finish = choice["finish_reason"]

    elapsed = time.monotonic() - started
    return {
        "reasoning": "".join(reasoning_buf),
        "content": "".join(content_buf),
        "finish": finish,
        "elapsed": round(elapsed, 2),
        "reasoning_tokens": (usage or {}).get("completion_tokens_details", {}).get("reasoning_tokens"),
        "completion_tokens": (usage or {}).get("completion_tokens"),
    }
```

`resp.iter_lines()` 在保活阶段会持续吐空行和 `: keep-alive`，这两个都必须跳过，不然 `json.loads` 会在第一个冒号上抛异常。我第一次接的时候忘了处理注释行，报错信息是 `Expecting value: line 1 column 1`，排查了半小时才意识到是保活帧。

还有一个坑：`finish` 可能是 `length`。思考模式很容易撞上限，看起来像模型没说完，其实是额度被推理吃完了。遇到 `length` 且 `content` 为空，直接把 `max_tokens` 抬到 16384 试一次，能过就说明是额度问题。

## 前端怎么折叠才不抖

做法是两栏但不是两个框：推理放进一个默认收起的折叠块，标题写成「思考过程 · 3.2 秒 · 1240 tokens」，正文用等宽小字。答案出来后折叠块保持收起，只有用户主动展开才渲染。

有一个细节必须处理：推理流式到达时高频触发渲染会让整页跳动。前端按 80 毫秒节流一次，并且累积时只在 `content` 开始到达后才切换状态文案，否则用户会先看到「思考中」再看到「已回答」再闪回「思考中」。

```typescript
type Phase = "idle" | "reasoning" | "answering" | "done";

export function createAccumulator(onFlush: (s: State) => void) {
  const state: State = { phase: "idle", reasoning: "", answer: "", rTokens: 0 };
  let timer: number | null = null;

  const flush = () => {
    timer = null;
    onFlush({ ...state });
  };

  return {
    pushReasoning(text: string) {
      state.phase = "reasoning";
      state.reasoning += text;
      if (timer === null) timer = window.setTimeout(flush, 80);
    },
    pushContent(text: string) {
      state.phase = "answering";
      state.answer += text;
      if (timer === null) timer = window.setTimeout(flush, 80);
    },
    finish(reasoningTokens?: number) {
      state.phase = "done";
      state.rTokens = reasoningTokens ?? state.rTokens;
      if (timer) window.clearTimeout(timer);
      flush();
    },
  };
}

interface State {
  phase: Phase;
  reasoning: string;
  answer: string;
  rTokens: number;
}
```

状态机只有四个值，`reasoning` 一旦离开就不再回去，避免文案闪烁。这个 `phase` 字段还能直接用于埋点，统计有多少请求走完了推理而答案为空，那批请求就是被 `length` 截掉的，需要单独调额度。

## 该不该给用户看推理

我的判断标准是看它有没有解释价值。代码审查、根因分析这类任务，推理里的排查顺序对用户有参考意义，展开率能到三成。文案生成、字段抽取这种，推理基本是复述指令，展开率不到百分之二，索性只留一行时长和 token 数。

不展示推理的时候，仍然要存。出了问题要能回放当次请求的完整上下文，把 `reasoning_content` 落库能省下大量复现成本。存储上按 `user_id` 分表，别和正文混在一列，检索的时候会后悔。

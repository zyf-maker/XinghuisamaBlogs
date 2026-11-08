---
title: 给站点接一条流式问答接口
summary: 服务端检索、拼 prompt、转发上游 SSE 的完整实现与代价
order: 2
level: 进阶
tags: [SSE, 检索, Route Handler]
updated: 2026-11-08
readingTime: 6
---

站内问答的价值不在模型多强，而在它说的话能不能落到你自己的文章上。做到这一点只需要三件事：先用字面检索捞出几篇相关的笔记，把摘要和正文片段塞进 system，再把上游的流原样转给浏览器。难点全在边界——检索捞不到时说什么、上游挂了怎么回、转发时哪一层在偷偷攒缓冲。

## 检索不必上向量

文档总量在几百篇时，字符级 2-gram 打分就够用，一次全量遍历是毫秒级。更实际的理由是可解释：命中了哪几个二元组是能打印出来的，回答里给的引用也就站得住。

打分要分层。只按正文命中数排，长文会靠体量压过主题更准的短篇。我实测过，问「温度和 top_p 怎么调」，一篇讲可观测性的长文排到了采样那篇前面，因为前者正文里恰好出现了几次「温度」和参数名。改成标题 8 分、标签 5 分、摘要 4 分、正文 1 分，排序立刻正常。

还要加一层同义词桥接。用户说「分块」，文档里写的是「切分」，纯字面匹配会漏。词表别贪大，只收真正造成漏检的那几个，多一条就多一次误召回。

```ts
export function score(q: string, doc: { title: string; tags: string[]; summary: string; body: string }) {
  const grams = bigrams(q);
  let s = 0;
  for (const g of grams) {
    if (doc.title.toLowerCase().includes(g)) s += 8;
    if (doc.tags.some((t) => t.toLowerCase().includes(g))) s += 5;
    if (doc.summary.toLowerCase().includes(g)) s += 4;
    if (doc.body.toLowerCase().includes(g)) s += 1;
  }
  return s;
}
```

取 `limit = 4`。不是越多越好：每篇塞 1500 字，四篇就是 6000 字上下文，输入 token 直接翻倍，而且排名第五以后的内容大概率是噪声，会把模型带偏。

## prompt 分三段拼

第一段是固定的人设与回答规则，跟着仓库走；第二段是检索结果；第三段是历史和当前问题。拼接顺序不能乱，尤其是历史必须放在检索结果之后，否则模型会把上一轮的回答当成笔记内容来引用。

```ts
const system =
  systemPrompt +
  "\n\n你可以使用下面的站内笔记作为依据。引用时必须写出篇目标题；笔记里没有的信息就说明没有，不要编。" +
  (context ? `\n\n<notes>\n${context}</notes>` : "\n\n（本次没有检索到相关笔记。）");

const body = {
  model: MODEL_ID,
  messages: [{ role: "system", content: system }, ...history, { role: "user", content: question }],
  max_tokens: 520,
  temperature: 0.3,
  stream: true,
};
```

「没有检索到」这一句必须显式写。留空的话，模型会拿通用知识硬答，用户看不出区别，但引用的篇目全是编的。写了这一句，它至少会承认站里没有。

历史只留最近 6 条，每条截到 1200 字。不截的话，一个用户来回五次就能把上下文推到两万 token，而其中九成是寒暄。

## 转发上游流时只做最小解析

上游返回的是 `text/event-stream`，每帧一行 `data: {...}`。服务端不需要理解语义，只把 `delta.content` 抽出来重新包一层自己的协议：

```ts
controller.enqueue(encoder.encode(
  `data: ${JSON.stringify({ type: "delta", text: delta })}\n\n`
));
```

自己再定一层协议的理由是前端要区分来源列表、正文增量、错误、结束四种事件。直接透传上游格式，前端就得适配每家供应商的字段差异，换模型时全要改。

第一帧先发检索结果，前端可以立刻渲染「参考了哪几篇」，用户在看首字之前就有东西可看。这一帧的收益比想象中大，实测首字延迟 2 秒时，先出引用的版本几乎没人抱怨等待。

```ts
controller.enqueue(encoder.encode(
  `data: ${JSON.stringify({ type: "sources", sources })}\n\n`
));
```

上游分片处理有个必须遵守的细节：缓冲区只能按 `\n` 切，最后一个残片留到下一轮，不能直接 `split("\n")` 全用完。半行 JSON 拿去 `JSON.parse` 会抛 `SyntaxError: Unterminated string in JSON at position 42`，而这类残片在流里必然出现。

## 超时、失败与配额

三处都要设上限，设的位置不同：

| 位置 | 参数 | 建议值 | 不设的后果 |
| --- | --- | --- | --- |
| 上游请求 | `AbortSignal.timeout` | 55s | 用户断开后连接挂在服务端，占用并发 |
| 单条回答 | `max_tokens` | 520 | 一次回答烧掉几千 token |
| 用户输入 | 字符截断 | 800 | 有人贴整篇论文进来，成本不可控 |

上游返回非 200 时不要透传它的 body。上游的 401 里可能带 key 的片段，直接把状态码和截断后的 body 塞回前端是常见的泄露路径。统一转成 502，附一个 300 字以内的摘要。

还有一个容易漏的：客户端主动断开时，ReadableStream 的 `cancel` 会被调用，但上游的 fetch 不会自动中止。要把 `AbortController` 的 signal 同时传给上游 fetch，并在 `cancel` 里 `abort()`，否则每关一次页面就在服务端留一条跑满 55 秒的连接。

## 这套东西的真实上限

字面检索没有语义泛化能力。用户问「为什么我的回答总是被截断」，而笔记里写的是「max_tokens 太小」，两个句子没有一个二字组重合，检索为空，回答退化成通用常识。

补法有两条：维护一份口语到术语的同义词表，或者对问题做一次改写再检索。前者可控、成本为零，后者多一次模型调用、延迟加 800ms 左右。几百篇的量级下我选前者，词表长到三百条以上时再考虑后者。

另一件事是别把这个接口当成客服。它只能回答「站里写过什么」，问它今天的天气、某本书的页码，正确行为是承认不知道。人设里那句话比任何检索优化都重要。

---
title: "流式输出的前端实现：分帧、渲染节奏与断流收尾"
summary: "流式输出真正的难点不在接口，而在字节分帧、渲染节奏和断流后的收尾。这篇梳理 SSE 与 fetch stream 之间的取舍、压掉重排抖动的过程，以及首字延迟的体感优化。"
order: 1
level: "进阶"
tags: ["流式输出", "SSE", "前端性能"]
updated: "2026-11-06"
readingTime: 7
---

第一次做流式对话时，很容易以为把 `stream: true` 打开、前端逐块追加文本就完事了。真正上线后，问题全出在别的地方：中文偶尔变成乱码，长回答越写越卡，网关一缓冲就变成「等八秒然后整段蹦出来」，还有回答被截断了但界面看起来一切正常。这篇按常见问题的出现顺序复盘一遍。

## 一、先把流当成字节流，不是字符串流

最开始的写法很朴素：`reader.read()` 拿到 `Uint8Array`，直接 `chunk.toString()` 拼进字符串。本地测试全英文，没问题；换成中文，标点位置偶尔冒出 `�`。

原因不复杂：一个汉字在 UTF-8 里占三个字节，而 chunk 的边界由网络和 TCP 缓冲决定，正好切在汉字中间时，`toString()` 会把这个残缺的字节序列解成替换字符。这个错误是永久的，后面补上来的字节接不回去。

修法是 `TextDecoder` 的流式模式：

```ts
const decoder = new TextDecoder("utf-8");
const text = decoder.decode(chunk, { stream: true }); // 关键：stream 为 true
```

`stream: true` 让解码器把不完整的字节序列留在内部缓冲，等下一块到了再拼。流结束时还要再调一次 `decoder.decode()` 把残留 flush 出来，否则最后半个字符会被丢掉。

第二个坑紧接着来：SSE 的帧边界和 chunk 边界没有关系。一帧 `data: {...}\n\n` 可能横跨两个 chunk，也可能一个 chunk 里有五帧。所以必须自己维护 buffer，按分隔符切：

```ts
async function* readSSE(res: Response) {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder("utf-8");
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n\n")) !== -1) {
      const frame = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      for (const line of frame.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") return;
        yield JSON.parse(data);
      }
    }
  }
}
```

这段不到三十行，但建议每个做流式对话的人都自己写一遍。写过才知道 `[DONE]` 不是协议强制的，只是 OpenAI 的约定，换一家供应商可能给你一个 `finish_reason` 字段就关连接。

## 二、SSE 还是 fetch stream

这两个经常被当成一回事。SSE 是一种响应格式（`text/event-stream`），`EventSource` 是浏览器提供的消费它的 API；`fetch` 拿到的是原始字节流，格式随便你定。差别在实际能力上：

| 维度 | EventSource | fetch + ReadableStream |
| --- | --- | --- |
| 请求方法 | 只能 GET | 任意，通常是 POST |
| 自定义请求头 | 不支持，带不了 Authorization | 支持 |
| 自动重连 | 内置，会带 Last-Event-ID | 需要自己实现 |
| 主动中断 | close() | AbortController |
| 消息体大小 | 受 URL 长度限制 | 无实际限制 |

对话场景要 POST 一长串 messages，还要带鉴权头，`EventSource` 直接出局。用 polyfill 补也绕不过自己解析，不如一开始就用 `fetch`。代价是失去自动重连，但对话场景本来也不该盲目重连——重连意味着重新计费，而且用户看到的半截回答要处理。

选 `fetch` 之后，`text/event-stream` 只当作一种便于调试的封装格式用，真正的解帧逻辑在上面的函数里。

## 三、逐字渲染为什么会抖

第一版实现是每个 delta 都 `setState` 一次。30 到 50 token 每秒不算快，但每次更新都触发整个消息列表的 re-render，列表里还有十几条历史消息、每条都在做 markdown 解析。表现是输入框跟着卡，滚动不跟手，长回答到后半段掉到 20fps 以下。

改了三轮。

第一轮，把流式消息拆成独立组件并用 `memo` 包住，只重渲染当前这条。有效，但不根治——单条消息内部的 markdown 全量 parse 仍然是主要开销，每来一个 token 就要重新解析一遍整段文本。

第二轮，流式期间不渲染 markdown，只输出纯文本，容器上给 `white-space: pre-wrap`，流结束后再做一次解析和代码高亮。这一刀砍掉了大部分 CPU。

第三轮，把渲染频率和 token 到达频率解耦，用 `requestAnimationFrame` 做批量 flush：

```ts
let pending = "";
let raf = 0;
function push(delta: string) {
  pending += delta;
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    node.textContent += pending;
    pending = "";
  });
}
```

一次 800 token 的回答，渲染次数从约 800 次降到 50 次左右（受 60fps 上限约束），长回答的脚本耗时从 1.2 秒降到 180 毫秒上下，输入框不再卡。

这里有个反向的坑值得单独说。为了让效果「像打字」，一种常见的做法是加一个每 30 毫秒吐一个字的定时器。上游快的时候（某些小模型能跑到 200 token/s），队列越积越长，回答实际已经生成完，界面上还要再爬十几秒，用户以为卡死了。**不要为了视觉效果制造一个假的、固定的输出节奏**，真实的到达速度就是最好的节奏。

还有一个细节是自动滚动。每帧调 `scrollIntoView` 会强制同步布局，等于把刚省下来的性能又还回去。改成在同一个 rAF 里设 `scrollTop = scrollHeight`，并且监听用户手动上滑，一旦上滑就暂停跟随，否则用户想往回看历史，会被一直拽到底部。

## 四、首字延迟是体感问题

实测下来，首字延迟（TTFT）大致是：小模型 300 到 500 毫秒，大模型 700 到 1200 毫秒；如果前面还有检索，再加 200 到 400 毫秒。用户能明显感到「卡」的分界线大约在 1 秒。

有几件事值得做，效果从大到小排列。

第一，不要等第一个 token 才创建气泡。点击发送的瞬间就插入用户消息和助手占位，本地记录 t0，第一个 token 到达时替换占位内容。感知上的等待被前置到了「点击」这个动作上，而点击本来就需要反馈。

第二，把能并行的前置工作合并。检索、用户画像查询、模板拼装原本是串行的三段 `await`，改成 `Promise.all` 之后，首字延迟的 P50 从 1.4 秒降到 0.9 秒。

第三，把连接建立和首 token 分开度量。这两个数的优化手段完全不同：连接慢多半是 TLS、DNS 或网关排队；首 token 慢是模型侧排队或 prompt 太长。只记一个总数，排查时无从下手。

第四，如果 TTFT 的 P95 已经超过 2.5 秒，别在前端硬扛，去上游解决：缩短 system prompt、给静态前缀加缓存、或者先用小模型出第一句再切换。前端能做的补偿很有限。

## 五、断流、重试与收尾

最隐蔽的一个 bug：只判断了 `reader.read()` 返回的 `done`，把它当作正常结束。结果网关在空闲 60 秒时返回了一个 200 加空 body，前端认为流正常结束，一条被截断的回答在界面上看起来完整无缺。用户拿着半句话来问「你刚才说的第三点是什么」，问题才暴露出来。

修法是引入一个显式的完成判定：只有收到 `[DONE]`，或者最后一个 chunk 里的 `finish_reason` 是 `stop` 或 `length`，才算完整。其余情况一律标记 `incomplete`，界面上显示「回答中断」并给一个继续生成的按钮。

重试策略上，不重发整个请求往往更好。重发意味着重新计费，而且用户会看到已经读过的内容原地跳变一次。更好的做法是续写：把已生成的部分作为 assistant 前缀再请求一次。这要求上游支持前缀续写，不支持的时候就只提供手动重试，别自己偷偷重来。

超时要分三个设，混在一起一定会出问题：

- 首字节超时 15 秒，连不上就快速失败；
- 帧间空闲超时 20 秒，管的是流卡住，不是总时长；
- 总时长 180 秒，兜底。

只有一个 60 秒的总超时是典型的错误配置，结果长回答写到第 58 秒被掐断，用户看到一条莫名其妙的半截内容。

最后是中间层的坑。Nginx 默认 `proxy_buffering on`，会把上游的流攒成一大块再吐。本地开发直连没问题，上了预发就变成「转圈八秒，然后整段出现」。要显式关掉：

```bash
proxy_buffering off;
proxy_read_timeout 300s;
proxy_http_version 1.1;
add_header X-Accel-Buffering no;
```

`X-Accel-Buffering: no` 是给不掌控中间层时用的备用开关。如果前面还有 CDN 或者 Serverless 网关，同样要确认它们不缓冲响应体。

一份可用的检查清单：用 `TextDecoder` 流式解码而不是 `toString()`；按空行切帧并维护 buffer；用 rAF 批量 flush；流结束后再做 markdown 和高亮；三个超时分开设；用 `finish_reason` 判断完整性；确认链路每一层都没开缓冲。这七条里任何一条漏掉，症状都不会是报错，而是「看起来能用但偶尔很怪」。

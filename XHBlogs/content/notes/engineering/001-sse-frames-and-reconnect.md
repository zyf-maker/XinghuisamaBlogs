---
title: 流式输出的帧、心跳与重连
summary: 拆开 SSE 的字节层，说明前端如何正确解析、断线后如何续写
order: 1
level: 进阶
tags: [SSE, 流式输出, 前端]
updated: 2026-11-08
readingTime: 6
---

流式输出看起来只是把一段文本分多次吐出来，真正落地的麻烦几乎全在字节层：帧怎么切、多字节字符被 chunk 劈开怎么办、代理什么时候把缓冲攒满、断线之后从哪一字节接着写。这些问题在本地跑得通，一上生产就集中爆发。

## 一次流式响应就是永不结束的 HTTP 响应

服务端返回 `Content-Type: text/event-stream`，之后不再关闭连接，把内容按帧写进 socket。响应体是若干帧的拼接，帧之间用空行分隔，帧内部每行是 `field: value`。规范定义的字段只有四个。

| 字段 | 作用 | 常见误用 |
| --- | --- | --- |
| `data` | 消息体，多行会按换行拼接 | 以为只能单行，把 JSON 压成一行反而不好调试 |
| `event` | 事件类型，默认 `message` | 前端只监听 `message`，自定义类型全部漏掉 |
| `id` | 游标，浏览器重连时回填 `Last-Event-ID` | 用自增内存计数，多实例部署后重连拿不到 |
| `retry` | 重连间隔毫秒 | 设成 100，上游 429 时把配额打光 |

以冒号开头的行是注释，服务端用它发心跳：`: ping`。这一行不产生消息，但能让中间层知道连接还活着。

最小的一帧是 `data: {"delta":"你"}` 加一个空行。`data:` 后面那个空格在解析时应被剥掉，只剥一个空格，不要 trim 到底，否则内容开头的空格会消失，代码块缩进就烂了。

OpenAI 兼容接口在这层之上加了自己的约定：每帧一个 JSON，最后一帧是 `data: [DONE]`。`[DONE]` 不是合法 JSON，`JSON.parse` 会直接抛 `SyntaxError: Unexpected token '['`。我第一版客户端就在这里翻车：流末尾抛错，前面已经渲染出来的内容被 catch 里的错误状态覆盖，用户看到的是一条完整回复加一个红色报错。正确顺序是先比对字符串再解析。

## 服务端该设的响应头

```http
Content-Type: text/event-stream; charset=utf-8
Cache-Control: no-cache, no-transform
Connection: keep-alive
X-Accel-Buffering: no
```

`no-transform` 挡的是某些 CDN 的自动压缩，`X-Accel-Buffering: no` 只对 nginx 生效，用来单独关掉这条响应的缓冲。nginx 默认 `proxy_buffering on`，会把上游输出攒到 4KB 或 8KB 再转发，表现是「等了五秒突然一次性出现一大段」，看起来像模型很慢，其实是代理在攒。

对应的 nginx 片段，这几行缺一不可：

```nginx
location /chat/stream {
    proxy_pass http://app:8000;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_buffering off;
    proxy_read_timeout 300s;
    proxy_cache off;
}
```

`proxy_set_header Connection ""` 是必需的。默认会带上 `Connection: close`，让每条流请求都新建一个上游连接，连接数一上来就先打满端口。

gzip 对 `text/event-stream` 基本没有收益，多数压缩实现会攒够一个 block 才输出，直接在应用层关掉更省事。

## 前端解析要处理半帧

用 `EventSource` 最省事，但它只能发 GET，不能带 `Authorization` 头，不能带请求体。带鉴权的接口只能自己读 `fetch` 的 `ReadableStream`。

关键点只有两个：`TextDecoder` 必须传 `{ stream: true }`，缓冲区里要保留最后一个未闭合的帧。

```ts
async function* readSSE(res: Response): AsyncGenerator<string> {
  const reader = res.body!.getReader()
  const decoder = new TextDecoder('utf-8')
  let buf = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    let idx: number
    while ((idx = buf.indexOf('\n\n')) !== -1) {
      const raw = buf.slice(0, idx)
      buf = buf.slice(idx + 2)
      for (const line of raw.split('\n')) {
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).replace(/^ /, '')
        if (payload === '[DONE]') return
        yield payload
      }
    }
  }
}
```

一个汉字在 UTF-8 里占三字节，正好跨 chunk 边界时，不带 `stream: true` 会解出 U+FFFD 替换符，中文变成一串问号方块。这个问题在英文测试里永远复现不了。

帧分隔符按 `\r\n\r\n` 发的服务端也见过，稳妥做法是先统一换行再找 `\n\n`。

还有一层容易被忽略：一帧里如果有多行 `data:`，规范要求用换行拼接成一个字符串再投递，不是分成多条消息。有些实现把多行当多条处理，结果前端收到半个 JSON。发 JSON 就压成一行，能避开这个坑。

## 别用 EventSource 的场景

三种情况必须自己读流：需要 POST 请求体、需要自定义请求头、需要携带 cookie 之外的鉴权。`EventSource(url)` 只接受一个 URL，没法传 `Authorization`，也没法设 `credentials: include` 以外的选项。有些实现绕道在查询串里放 token，代价是 token 会进 nginx 的 access log 和浏览器历史。

自己实现之后记得手动调 `reader.cancel()`。组件卸载时如果只把生成器丢掉，底层连接不会立刻关闭，服务端会继续生成、继续计费，直到写出失败。React 里在 `useEffect` 的清理函数里调 abort，别依赖 GC。

## 断线之后从哪续

`EventSource` 自带重连，间隔由 `retry` 控制，并把最后收到的 `id` 放进 `Last-Event-ID` 请求头。自己用 fetch 实现就没有这层白送的能力，得手工做。

可行的做法是服务端每帧带一个递增的游标，值取已生成的 token 数或字符偏移。客户端保存最后一个游标，重连时用查询参数回传，服务端要么从该位置继续生成，要么把已有前缀作为 assistant 消息重放给模型让它接着写。

两种都有代价。真续写要求推理侧支持中断恢复，多数托管 API 不支持；重放会把前缀再计一次输入 token，一段 3000 token 的回答重放三次就是三倍输入费。所以真实系统里通常加一条：超过 20s 的重连不再续写，直接把已收到的部分标成「已中断」，让用户点重新生成。

多实例部署时游标不能存在进程内存里，否则重连打到另一台机器就是空游标。放 Redis，键是 `session_id`，TTL 给 10 分钟。

## 心跳与超时对齐

中间层的空闲超时普遍比想象中短。Cloudflare 免费版大约 100s 无数据就断，部分负载均衡默认 60s。服务端每 15s 发一帧 `: ping`，能把这个计时器一直重置。

客户端也要有超时，但不能是「总时长超时」。一个正常的长回答可以跑三分钟，用 30s 总超时会把正常请求杀掉。合理的拆法是：连接建立 5s，首帧 20s，帧间隔 30s。三个计时器分别对应 DNS/TLS 慢、上游排队、模型卡住三种不同故障。

日志里这三个时间要分开记，混成一个 `latency` 字段，出问题时无法判断是网络还是模型。

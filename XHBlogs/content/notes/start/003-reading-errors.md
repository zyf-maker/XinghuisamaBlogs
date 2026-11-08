---
title: 学会读报错
summary: AI 编程最常踩的五类报错，以及从栈帧和类型签名反推根因的顺序
order: 3
level: 入门
tags: [调试, 报错, TypeScript]
updated: 2026-11-08
readingTime: 7
---

AI 写出来的代码，报错往往比人手写的更迷惑。原因很直接：它能生成语法正确、类型签名自洽、但语义错了的代码。编译器不会拦它，运行时才炸，而且炸的位置离真正的错很远。

读报错这件事因此变成核心技能。下面五类错误覆盖了我用 AI 写代码时遇到的绝大多数情况，按出现频率排序，每类给出定位顺序。

## 第一类：类型对不上，但错在别处

TypeScript 里最常见的一句：

```
error TS2345: Argument of type 'string | undefined' is not assignable
to parameter of type 'string'.
```

AI 的第一反应通常是加 `!` 或者 `as string`。这是最坏的处理方式。`string | undefined` 意味着上游某个地方可能没有值，你在这一层强行断言，等于把崩溃点推到运行时。

定位顺序是往上游走，不是往下游堵。找到这个变量的来源函数，看它的返回类型为什么包含 `undefined`：

```ts
// 报错现场
function renderName(user: User | null) {
  return user.name.toUpperCase();  // TS18047: 'user' is possibly 'null'
}

// 错误修法：非空断言，掩盖问题
return user!.name.toUpperCase();

// 正确做法：在边界处收口
function renderName(user: User | null): string {
  if (!user) return "";
  return user.name.toUpperCase();
}
```

一个实用的判断标准：如果修复需要加 `!`、`as`、`@ts-ignore` 中的任何一个，先停下来想 30 秒。这三样东西在 AI 生成的代码里出现频率极高，它们是它在绕过类型系统，不是在解决问题。整份 diff 里出现超过两处，这段代码我基本会重写而不是修补。

还有一个变体更难查：类型检查过了，但运行时是 `undefined`。常见于可选链写漏了一层、解构时属性名拼错。这类问题 TS 抓不到，只能靠 `console.log` 或者断言库。我的习惯是在关键数据进入渲染前加一条 `zod` 解析，早炸比晚炸好。

## 第二类：模块找不到

```
Error: Cannot find module '@/lib/db'
Require stack:
- /app/api/settings/route.ts
```

这条报错有四个常见原因，排查顺序从便宜到贵。

第一，路径别名没配。`@/` 这种写法依赖 `tsconfig.json` 里的 `paths`，运行时要靠 bundler 解析。TS 能过、运行时报错，就是这个配置在两边不一致。

第二，大小写。Linux 上 `lib/Db.ts` 和 `lib/db.ts` 是两个文件，macOS 上不是。本地跑得好好的，部署到容器里 500，几乎总是这个原因。

第三，服务端组件和客户端组件的边界。在 `"use client"` 文件里 import 了一个用了 `fs` 的模块，报错长得像模块找不到，实际是打包器把它剔掉了。

第四，真的是没装。`node_modules` 里删过东西、`package.json` 和 lock 文件不同步，`npm ci` 重装一遍比重试十次快。

这类错误里我最常踩的是第二条。文件名里带大写字母，在 macOS 上开发三周都没事，第一次上 CI 就挂。现在的项目我直接在 lint 里加一条规则强制 kebab-case 命名，从源头掐掉。

## 第三类：异步没等

```
TypeError: Cannot read properties of undefined (reading 'map')
```

报错位置是一个 `.map`，但数据源明明是个数组。真实原因是上一个 `await` 忘了写，拿到的是 Promise 而不是结果。

AI 生成异步代码时特别容易漏 `await`，因为漏了之后语法完全合法，TS 有时也只是给个警告。定位方式是看调用链上每一层的返回类型，凡是 `Promise<T>` 出现了却没被 await 或被 return 的地方，都是嫌疑点。

```ts
// 症状：items 是 Promise，不是数组
const items = fetchItems();
items.map(render);   // 报错在这里

// 修法一：加 await（在 async 函数内）
const items = await fetchItems();

// 修法二：如果不想阻塞，明确处理 pending 状态
const items = await fetchItems().catch(() => []);
```

`for` 循环里的 `await` 是另一个高频坑。`array.forEach(async (x) => {...})` 不会等任何一项，循环立刻结束。要顺序执行用 `for...of`，要并发用 `Promise.all`。这两种写法语义完全不同，AI 经常混着用，而且代码能跑，只是结果偶尔不对，比直接报错更难查。

## 第四类：状态更新了但界面没变

React 里最常见的隐性错误。现象是点击按钮，`console.log` 打印出正确的新值，但页面上的数字没动。

三个成因，逐个排查。

直接修改了 state 对象。`items.push(x)` 之后 `setItems(items)`，引用没变，React 认为没有更新，直接跳过渲染。必须返回新数组：`setItems([...items, x])`。

在闭包里读了旧值。`useEffect` 里用了一个 state，但依赖数组没写它，effect 内部永远是第一次渲染时的值。这类 bug 的表现是「改了一次之后就不再响应」。

在渲染期间做了副作用。组件函数体里直接 `setState`，会触发无限重渲染，控制台报 `Maximum update depth exceeded`。这个报错很明确，但 AI 有时会把它包进 `try/catch`，然后把真正的信息吃掉。

排查这类问题时，`React DevTools` 的 Profiler 比 `console.log` 有效得多。看哪个组件在重渲染、props 有没有变，一眼就能定位。

## 第五类：请求失败，但状态码看不出问题

```
FetchError: request to http://127.0.0.1:3000/api/chat failed,
reason: connect ECONNREFUSED 127.0.0.1:3000
```

`ECONNREFUSED` 是端口上没人在听。`ETIMEDOUT` 是有人在听但不回。`ENOTFOUND` 是 DNS 解析失败。三个词对应三种完全不同的排查方向，先把它们分清楚，能省掉一半时间。

服务端返回 4xx 或 5xx 的情况，最容易被忽略的是跨域。浏览器控制台里的跨域报错说得含糊，真正有用的信息在 Network 面板里：如果请求根本没发出去，或者 `Response` 一栏是空的，那就是预检请求被拦了。

```bash
绕过浏览器，直接看服务端到底返回什么
curl -i -X POST http://127.0.0.1:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hi"}]}'
```

这条命令能区分两类问题：curl 正常、浏览器报错，是跨域或凭证问题；curl 也报错，是服务端自己的问题。这一步不做，很容易在跨域配置上折腾一小时，而真正的原因是后端 500。

## 五类错误的定位入口

| 错误类型 | 首查位置 | 典型误修 | 有效信号 |
| --- | --- | --- | --- |
| 类型不匹配 | 上游函数返回类型 | 加 `!` 或 `as` | 变量定义处的 `undefined` 来源 |
| 模块找不到 | 别名配置与文件名大小写 | 反复重装依赖 | 报错里的 `Require stack` |
| 异步没等 | 调用链上的 `Promise<T>` | 加 `try/catch` 掩盖 | 拿到的是 Promise 而非数据 |
| 界面不更新 | state 是否被直接修改 | 强制 rerender | DevTools 里 props 是否变化 |
| 请求失败 | 先 curl 再开浏览器 | 直接改跨域配置 | `ECONNREFUSED` 等具体错误码 |

## 把报错喂给 AI 的正确姿势

报错本身不够，需要三样东西：完整的错误信息（含栈帧）、触发它的最小输入、以及相关文件的当前内容。

只说「报错了」让它猜，得到的通常是通用建议。贴完整栈帧再加上「这个函数在 lib/db.ts 第 40 到 80 行」，它给的定位会具体到行。

一个反直觉的经验：让它先解释报错，再让它改。要求它用两三句话说明「这个错误意味着什么、最可能的原因是什么」，然后你再判断它理解得对不对。理解错了就直接纠正，比让它带着错误理解去改代码便宜得多。

最后一条，报错信息不要手动截断。栈帧最底下那几行经常是关键，`Caused by:` 后面的内容往往才是根因。复制全了再发。

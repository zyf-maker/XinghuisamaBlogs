---
title: "工具链的收敛趋势"
summary: "协议层、编辑器层、编排层各自在稳定什么，用换掉它要改多少代码来排序耦合度"
order: 3
level: "深入"
tags: [MCP, 工具链, 架构耦合]
updated: "2026-11-08"
readingTime: 8
---

判断一个技术层是否已经稳定，我有一个简单标准：换掉它要改多少行代码。改配置文件的算稳定，改十来个文件算半稳定，得重写调用方算没稳定。用这条标准量过去一年，三层工具的收敛程度差得很远，协议层已经稳了，编辑器层稳了一半，编排层还在动。

我们内部那套东西换过三次编排框架。第一次从手写循环换成图编排，改了四百多行。第二次换另一个图编排，又改三百多行。第三次学乖了，先把工具注册和执行拆出去，再换编排层只动了六十行。这三次的差别不在框架好坏，在耦合位置。

## 协议层为什么先稳

工具调用的协议层做的事情很少：把一个函数描述成结构化 schema，让模型输出符合 schema 的参数，再决定是否执行。这件事的接口形状几乎没有争议，字段就那几个：名称、描述、参数 schema、返回值。

MCP 这类协议能收敛，原因是它把传输和语义拆开了。传输可以是标准输入输出、可以是 HTTP、可以是 SSE，语义层只有请求、响应、通知三种消息。换传输不影响语义，换语义不影响传输。这种正交设计让实现者可以只做一半。

我实测过一件事：同一个工具，用标准输入输出和 HTTP 两种传输分别注册，在四个客户端里跑，调用成功率都是 100%，唯一的差别是启动耗时和进程管理方式。这说明协议层已经到了“实现差异不影响调用方”的阶段，这是稳定的标志。

协议层还有一个隐性收益：它把工具的生命周期从应用里挪出去了。工具变成独立进程，崩溃不影响主进程，重启不影响会话。这条设计带来的复杂度是真的，要处理进程回收、握手超时、半开连接，但换来的是工具可以换语言写。

## 编辑器层稳在配置，不稳在扩展 API

编辑器这一层的情况复杂一些。配置格式收敛得很快，基本就是一份 JSON，声明服务器怎么起、传什么环境变量、允许哪些权限。这份配置现在跨编辑器可用，字段名大同小异。

不收敛的是扩展 API。想做超出协议范围的事，比如自定义面板、拦截编辑事件、改渲染，每家一套。这类扩展一旦写下去，换编辑器就是重写。

我的分界线是：只用配置能表达的能力就是可迁移的，碰扩展 API 就是锁定的。按这条分，大部分团队的用法其实都在安全区内，真正锁死的只有少数做了深度定制的。

| 层 | 具体形态 | 耦合度 | 换掉要改什么 | 是否可迁移 |
| --- | --- | --- | --- | --- |
| 协议 | 工具描述与调用消息格式 | 低 | 改适配器一处，约 30 行 | 是，跨客户端通用 |
| 配置 | 服务器声明与环境变量 | 低 | 改一份 JSON | 是，字段名微调 |
| 传输 | 标准输入输出或 HTTP | 低 | 改启动方式和超时配置 | 是，语义不变 |
| 编辑器 | 快捷键与工作区设置 | 中 | 改文档和习惯 | 人迁移，代码不动 |
| 扩展 API | 自定义面板与事件钩子 | 高 | 重写扩展本体 | 否，每家一套 |
| 编排 | 图定义与状态机 | 高 | 重写流程与错误处理 | 否，语义各家不同 |
| 提示模板 | 系统提示与少样本 | 中高 | 改模板并重跑固定集 | 部分，需重新评测 |

这张表是按耦合度排的。越是靠近表格上方，越值得押注；越靠下，越应该包一层。

## 编排层为什么还在动

编排层要回答的问题比协议层难得多：什么时候该调工具、调几个、并行还是串行、失败了重试还是改道、上下文怎么裁。这些没有唯一答案，所以每家的抽象都不一样。有的用图，节点是函数；有的用角色，角色之间传消息；有的用状态机，显式定义转移。

问题在于这些抽象的迁移成本极高。图编排里的“边”和状态机里的“转移”看着像，语义不同：图编排默认允许多入多出，状态机要求确定性。把一套搬到另一套，等于重新设计流程。

我的做法是把编排层当成可替换件，具体是三条约束。流程步骤写成纯函数，输入输出都是普通对象，不碰框架类型。工具调用统一走一个执行器接口，框架只负责决定调哪个。状态持久化用自己的表结构，不存框架的序列化格式。

这三条做到，换编排框架的工作量就收敛到“重写调度逻辑”，大约几十行。做不到，就是重写全部。

## 一个能真用的适配器

下面这段把工具定义和执行解耦，编排层换掉时只改调度部分。类型定义手写，不依赖具体框架。

```typescript
type JsonSchema = Record<string, unknown>;

export interface ToolDef {
  name: string;
  description: string;
  inputSchema: JsonSchema;
}

export interface ToolResult {
  ok: boolean;
  content: string;
  error?: string;
}

type Handler = (args: Record<string, unknown>) => Promise<ToolResult>;

export class ToolRegistry {
  private defs = new Map<string, ToolDef>();
  private handlers = new Map<string, Handler>();

  register(def: ToolDef, handler: Handler): void {
    if (this.defs.has(def.name)) {
      throw new Error(`duplicate tool: ${def.name}`);
    }
    this.defs.set(def.name, def);
    this.handlers.set(def.name, handler);
  }

  // 提供给编排层的只有 schema，不含实现，便于整体序列化
  list(): ToolDef[] {
    return [...this.defs.values()];
  }

  async call(name: string, raw: unknown): Promise<ToolResult> {
    const handler = this.handlers.get(name);
    const def = this.defs.get(name);
    if (!handler || !def) {
      return { ok: false, content: "", error: `unknown tool: ${name}` };
    }
    const args = (raw ?? {}) as Record<string, unknown>;
    const required = (def.inputSchema.required as string[] | undefined) ?? [];
    const missing = required.filter((k) => args[k] === undefined);
    if (missing.length > 0) {
      return { ok: false, content: "", error: `missing args: ${missing.join(",")}` };
    }
    try {
      return await handler(args);
    } catch (e) {
      return { ok: false, content: "", error: (e as Error).message };
    }
  }
}

// 用法：注册后只把 registry.list() 交给模型，call 由执行层调用
const registry = new ToolRegistry();
registry.register(
  {
    name: "read_file",
    description: "读取工作目录内的文本文件，超过 8000 字符会截断",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string", description: "相对路径" } },
      required: ["path"],
    },
  },
  async (args) => {
    const path = String(args.path);
    if (path.includes("..")) {
      return { ok: false, content: "", error: "path escape blocked" };
    }
    const { readFile } = await import("node:fs/promises");
    const text = await readFile(path, "utf8");
    return { ok: true, content: text.slice(0, 8000) };
  },
);
```

这段代码的价值不在实现，在边界。`list()` 只吐 schema，编排层拿不到实现；`call()` 把参数校验和异常都收成一个结果对象，编排层不需要知道工具内部怎么失败。这两条让编排层可以整体替换。

## 收敛的判据是什么

我现在的判据有三条，按重要性排。

第一，有没有跨实现的互操作测试。协议层有，所以能收敛。编排层没有，所以不能。互操作测试比规范文档更能约束实现，因为它会真的跑起来。

第二，换实现是否只改配置。配置能表达的能力就是被抽象干净的，需要写代码才能改的就是没抽象好。

第三，失败语义是否统一。工具失败是抛异常还是返回错误对象，超时算失败还是重试，这些细节不统一，上层就得写分支判断。分支一多，迁移成本就回来了。

## 押注建议

协议层可以直接押，它是这一轮里唯一把接口和实现分开的。编辑器层押配置，不押扩展。编排层不押，包一层适配器，等它自己打完。

我踩过的坑是把业务逻辑写进了编排层的图定义里，节点函数直接读框架的上下文对象。那次换框架，四百行里有一半是业务逻辑，等于是把业务重写了一遍。后来把节点拆成纯函数，上下文通过参数传，才把这块摘出来。

判断一层能不能押，不看它有多少人用，看它有没有把你的代码和它的抽象绑在一起。绑得越松，越值得押。

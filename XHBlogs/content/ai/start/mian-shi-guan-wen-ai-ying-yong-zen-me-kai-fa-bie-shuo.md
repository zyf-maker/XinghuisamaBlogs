---
title: "面试官问「AI 应用怎么开发」，别说只会调 API！"
summary: "最近有个学员跟我说，他去面试的时候，面试官问了一个问题：如果让你开发一个 AI 应用，你会怎么做？"
order: 102
level: "入门"
tags: ["概念大全"]
updated: "2026-07-21"
readingTime: 11
author: "程序员鱼皮"
source: "https://github.com/liyupi/ai-guide"
---

最近有个学员跟我说，他去面试的时候，面试官问了一个问题：如果让你开发一个 AI 应用，你会怎么做？

他自信满满地回答：那还不简单？调个 API 就行了呗。

面试官追问：就这一种方式？你确定吗？

他直接懵了，场面一度非常尴尬。

其实这个问题很有代表性。很多同学对 AI 应用开发的认知还停留在「调 API」这个层面，觉得能发个 HTTP 请求拿到 AI 的回答就完事儿了。

但实际上，调 API 只是最基础的一种方式。从最底层的 HTTP 请求，到官方 SDK 封装，到功能齐全的开发框架，再到拖拽式的低代码平台，还有一种鲜为人知的隐藏模式，AI 应用开发的模式已经非常丰富了。

![](/imgs/b630b5c506a554ae.png)

今天鱼皮就给大家一次性讲清楚，目前主流的 **5 种 AI 应用开发模式** 到底是什么、怎么用、各自适合什么场景。每种模式我都会给一段简单的代码示例，帮你快速理解。搞懂这些，不仅面试的时候能应对自如，用 AI 编程做项目的时候也能知道该往技术栈里加什么。

![](/imgs/c83fa04c96fa80c3.png)


## 一、HTTP API 直接调用

最原始、最直接的方式，就是通过 HTTP 请求调用大模型的 API 接口。

简单来说，就是你的程序给大模型发送一条消息，大模型处理完之后把结果返回给你。

这就像打电话给一个专家咨询问题。你得自己拨号码（拼接 API 地址）、报上身份（传入密钥）、把问题描述清楚（构造请求体），然后等专家回答完再自己记录下来（解析响应）。**虽然每一步都得自己来，但你对整个过程有完全的掌控。**

![](/imgs/d28105700a69c27b.png)

不管你用什么编程语言，只要能发 HTTP 请求，就能调用 AI 大模型。所以这是所有大模型服务商都支持的最基本的调用方式。

无论是国外的 OpenAI 和 Anthropic、国内的 DeepSeek 和通义千问，还是本地用 Ollama 部署的开源模型，甚至是 OpenRouter 这类一个 API Key 就能调用多家模型的聚合平台，都支持通过 HTTP API 来调用。

目前 HTTP API 调用主要有两种协议格式。

**1）OpenAI 兼容格式**

这套格式最初是 OpenAI 定义的，但因为用的人多，现在已经成了各家默认遵循的标准。DeepSeek、通义千问、Kimi、Ollama 等绝大多数大模型服务商都兼容这套格式。

有统一标准的好处是，你写一套调用大模型的代码，只需要换个 API 地址和密钥，就能无缝切换到不同厂商的模型，不用重新适配格式。

举个例子，我用 HTTP 请求工具 curl，发一个 OpenAI 兼容格式的请求，调用 DeepSeek 大模型：

```bash
curl https://api.deepseek.com/chat/completions \
  -H "Authorization: Bearer 你的API密钥" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-v4-pro",
    "messages": [
      {"role": "system", "content": "你是一个有用的助手"},
      {"role": "user", "content": "用一句话介绍什么是AI应用开发"}
    ]
  }'
```

如果换成调用 OpenAI 的模型，只需要把 URL 请求地址和 model 模型名称换一下就行，请求格式完全一样。

**2）Anthropic Messages API 格式**

Anthropic（Claude 模型的开发商）用的是自己独立的一套协议，请求结构和 OpenAI 不太一样。

比如系统提示词是放在顶层的 `system` 参数里，而不是作为一条消息传入。如果你要调用 Claude 系列模型，就得按它的格式来。

```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: 你的API密钥" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 1024,
    "system": "你是一个有用的助手",
    "messages": [
      {"role": "user", "content": "用一句话介绍什么是AI应用开发"}
    ]
  }'
```

实际开发 AI 应用的时候，你还需要了解请求和响应中各个字段的含义。最核心的是 `messages` 字段，也就是你跟 AI 的对话消息列表；此外还有 `temperature` 控制回答的随机性、`max_tokens` 限制回答长度、响应里的 `usage` 字段能告诉你这次调用消耗了多少 Token 等等。各家平台一般都会提供详细的 API 文档，照着文档来就行。

![](/imgs/20b353d4d1d30ff0.png)

大模型的 API 一般会提供两种调用方式。一种是普通请求，一问一答，等 AI 生成完整个回答后一次性返回。另一种是流式请求，如果你想实现一个字一个字往外蹦的打字机效果，就需要用到 **SSE（Server-Sent Events）** 流式传输协议，让服务端把生成的内容一段一段地推送给你。用法也不复杂，一般只需要在请求参数里把 `stream` 设置为 `true` 就行了。

下面我用 Python 写一个流式调用的例子，感受一下打字机效果是怎么实现的：

```python
import requests

response = requests.post(
    "https://api.deepseek.com/chat/completions",
    headers={
        "Authorization": "Bearer 你的API密钥",
        "Content-Type": "application/json"
    },
    json={
        "model": "deepseek-chat",
        "stream": True,  # 开启流式输出
        "messages": [
            {"role": "system", "content": "你是一个有用的助手"},
            {"role": "user", "content": "用一句话介绍什么是AI应用开发"}
        ]
    },
    stream=True  # 开启流式接收
)

# 逐行读取服务端推送的内容
for line in response.iter_lines():
    if line:
        print(line.decode())
```


## 二、官方 SDK 调用

写过上面那段代码的同学应该能感受到，直接用 HTTP 调用还是挺麻烦的。填写 URL、设置请求头、构造 JSON、解析响应、处理错误码、流式数据逐行解析…… 这些跟你的业务逻辑压根儿没关系，但每一个都得自己处理。

所以各大模型厂商都提供了 **SDK（Software Development Kit 软件开发工具包）**，帮你把这些底层细节封装好了。

如果 HTTP API 是自己拨号打电话，那 SDK 就像装了一个智能通讯 APP。你只管说话，APP 帮你自动拨号、接通、录音、整理成文字，你拿到手的直接就是现成的答案。

![](/imgs/4f3820f10a187c37.png)

目前 OpenAI、Anthropic、Google、阿里云百炼、智谱等主流大模型服务商都提供了多语言的 SDK，覆盖 Python、Java 等常用语言。

![](/imgs/9702c2db6de66724.png)

SDK 的本质就是对 HTTP 请求的封装，所以前面提到的 OpenAI 兼容格式在 SDK 层面同样适用。比如 DeepSeek 兼容 OpenAI 的协议，那你直接用 OpenAI 的 SDK，改个参数就能调用 DeepSeek 模型了。

比如我用 OpenAI 的 Python SDK 来调用 GPT 模型，代码如下：

```python
# 引入 OpenAI 官方 SDK
from openai import OpenAI

client = OpenAI(api_key="你的API密钥")

completion = client.chat.completions.create(
    model="gpt-5",
    messages=[
        {"role": "system", "content": "你是一个有用的助手"},
        {"role": "user", "content": "用一句话介绍什么是AI应用开发"}
    ]
)

print(completion.choices[0].message.content)
```

不用填写 URL、不用设置请求头、不用手动解析 JSON，几行代码就搞定了。而且 SDK 还内置了错误重试、类型提示、流式处理等功能，让开发效率更高、代码更简洁、系统也更稳定。

如果你用的是 DeepSeek 模型，代码几乎一模一样，只需要改一下 base_url 请求地址和 model 模型名称就行：

```python
client = OpenAI(
    api_key="你的DeepSeek密钥",
    base_url="https://api.deepseek.com"
)

# 调用时把 model 换成 DeepSeek 的模型名
completion = client.chat.completions.create(
    model="deepseek-chat",
    messages=[...]
)
```


## 三、AI 开发框架

SDK 解决了 **怎么方便地调模型** 的问题，但企业中的 AI 应用远不止调一下模型那么简单。

你可能还需要让 AI 记住之前聊过什么（会话记忆）、让 AI 先去知识库里查资料再回答（RAG 检索增强生成）、让 AI 能调用外部工具比如查天气、搜网页（工具调用）、通过 MCP 协议接入更多外部服务、甚至让多个 AI 协同工作完成复杂任务……

这些能力如果每个都自己从零开始写，工作量巨大。所以就有人在 SDK 的基础上又封装了一层，做成了 **AI 开发框架**。

打个比方，SDK 相当于给你提供了发动机、轮胎、方向盘这些零件，你得自己一个一个装配；AI 开发框架相当于直接给你一辆半成品车，底盘、车架、电路都搭好了，你只需要决定外观和内饰就能上路。

![](/imgs/e49ca08bccca5c15.png)

下面以 Python 和 Java 为例，列举几个主流的 AI 开发框架，之后你在 AI 编程时看到这些技术名词，就不会感到陌生了。

Python 生态中，**LangChain** 是目前最主流的 AI 应用开发框架，提供了大量集成组件，涵盖模型调用、RAG 知识库、工具调用、MCP 集成等常用能力。

**LangGraph** 是 LangChain 团队推出的进阶框架，用图的结构来编排复杂的 AI 工作流，适合构建有状态的、需要循环和分支逻辑的 AI 智能体。

举个例子，用 LangChain 调用模型的代码长这样：

```python
from langchain.chat_models import init_chat_model
from langchain.messages import HumanMessage, SystemMessage

model = init_chat_model("gpt-5")

messages = [
    SystemMessage("你是一个有用的助手"),
    HumanMessage("用一句话介绍什么是AI应用开发")
]

response = model.invoke(messages)
print(response.content)
```

看起来和 SDK 差不多对吧？

但 LangChain 的价值在于，当你需要加上记忆、工具调用这些高级能力时，只需要几行配置就能搞定，不用自己从零实现。

比如创建一个带工具调用能力的 AI Agent：

```python
from langchain.agents import create_agent
from langchain.tools import tool

# 定义一个工具，让 AI 能查天气
@tool
def get_weather(city: str) -> str:
    """查询指定城市的天气"""
    return f"{city}今天晴，25°C"

# 一行代码创建带工具调用能力的 Agent
agent = create_agent(model="gpt-4o", tools=[get_weather])

# 调用 Agent，它会自动判断是否需要调用工具
result = agent.invoke(
    {"messages": [{"role": "user", "content": "北京今天天气怎么样？"}]}
)
```

这样 AI 就能主动调用工具去查天气了，你只需要定义好工具函数，LangChain 帮你搞定剩下的。

而且很多其他语言生态的 AI 开发框架，在设计上几乎都参考了 LangChain 的思路，比如 Java 的 LangChain4j、Go 的 LangChainGo，功能上和 Python 版基本对齐，学会一个版本切到其他语言也很容易上手。

Java 生态还有 Spring 官方推出的 Spring AI 以及阿里的 Spring AI Alibaba，深度融入 Spring Boot 生态，适合 Java 后端开发者快速上手。

![](/imgs/e1150d5b78bc06e9.png)

另外我觉得 **Vercel AI SDK** 也值得大家关注，它是 TypeScript 生态的 AI 开发框架，提供了 20 多个模型供应商的统一接口，特别适合前端和全栈开发者。


## 四、低代码 AI 开发平台

框架虽然功能强大，但写代码终归是有门槛的。特别是业务人员或者不太会编程的同学，光是搭个开发环境就够头疼的了。

这时 **低代码 AI 开发平台** 就派上用场了，不用写代码也能搭出 AI 应用。

打个比方，低代码平台就像搭积木。大模型是一块积木，知识库是一块积木，工具调用是一块积木，每块积木都是现成的，你只需要决定怎么拼接、拼成什么形状就好了。

![](/imgs/5fe52de3ac9f2d41.png)

Dify 是典型的低代码 AI 开发平台，它支持通过可视化界面搭建 AI 聊天助手、工作流、知识库问答等应用，还能一键接入各种大模型。

它最大的优势是开源、可私有化部署，企业想把数据放在自己服务器上也没问题。

![](/imgs/1979d39ee1f0e03b.png)

在 Dify 上搭一个 AI 聊天助手，大概就这么几步：

1. 选择一个大模型（比如 GPT-5.5 或 DeepSeek）
2. 写一段系统提示词，告诉 AI 它的角色
3. 配置知识库（可选），上传你的文档资料
4. 点击发布，就能得到一个可调用的 API 或者直接分享的聊天链接

整个过程不需要写一行代码。

类似的平台还有不少，比如字节跳动的 Coze（扣子）也支持可视化搭建 AI 应用，容易上手；阿里云百炼是一站式的大模型应用构建平台，集成了模型调用、智能体编排、知识库管理等能力；还有开源的工作流自动化平台 n8n，擅长做跨系统的 AI 自动化流程。


## 五、AI 编程工具的 SDK

前面 4 种模式覆盖了从手动写代码、到完全不写代码的各种方案。但还有一种很多同学不知道的模式。。。

2026 年，Cursor、Claude Code、GitHub Copilot 等 AI 编程工具纷纷推出了自己的 SDK。你可以在自己的代码里直接调用这些 AI 编程工具的 Agent，它们能帮你读代码、改代码、跑命令，而且你在 AI 编程工具里配置好的 MCP 服务、Skills、项目规则这些能力，通过 SDK 调用时同样能生效。

如果说前面那些方式都是你自己动手干活，那么使用 AI 编程工具的 SDK 相当于你雇了一个会写代码的 AI 程序员。你只需要告诉它做什么，它会自动读文件、分析代码、完成开发。

![](/imgs/6c68b60d097b1e8a.png)

以 Cursor SDK 为例，允许你在 TypeScript / Node.js 代码中直接调用 Cursor 的 AI Agent。

先新建项目文件夹，然后打开终端，在该目录下输入一行命令安装 SDK：

```bash
npm install @cursor/sdk
```

![](/imgs/28458124c384e6a8.png)

然后登录 [Cursor Dashboard](https://cursor.com/dashboard/integrations)，在 Integrations 页面生成一个 API Key 并保存下来，后面代码里需要用它来验证身份。

![](/imgs/71acf6b9c17620a6.png)

假设我本地有一个「创作选题获取器」项目，里面用 AGENTS.md 定义了选题获取的工作流规则，还安装了 frontend-design 前端设计技能。

![](/imgs/da4004d4bef1286d.png)

现在我想让 AI 帮我获取今天的热门选题，并生成一个漂亮的网页报告。

新建一个 JavaScript 文件，比如 `main.js`，写入以下代码：

```javascript
import { Agent } from "@cursor/sdk";

// 创建 AI Agent，指向「创作选题获取器」项目
const agent = await Agent.create({
  apiKey: '你的 API Key',
  model: { id: "gpt-5.5" },
  local: { cwd: "/Users/yupi/workflow/创作选题获取器" },
});

// 一句话下达指令
const run = await agent.send("帮我获取今日 AI 领域的热门选题，并生成一个网页报告");

// 收集所有事件，打印到终端的同时保存到文件
const events = [];
for await (const event of run.stream()) {
  console.log(event);
  events.push(event);
}

// 把完整的事件记录保存为 JSON 文件，方便事后分析
const fs = await import("fs");
fs.writeFileSync("agent-output.json", JSON.stringify(events, null, 2));
```
然后在终端执行：

```bash
node main.js
```

运行后你会在终端看到一连串事件输出，比如 Agent 开始执行。

![](/imgs/759356016a6711ed.png)

从日志里可以清晰地看到 Agent 的整个执行过程：它先用 `glob` 工具扫描了项目目录，然后用 `read` 工具依次读取了 AGENTS.md 工作流规则和 frontend-design 的 SKILL.md 技能说明，接着通过 `shell` 工具调用了项目里的热点获取脚本进行联网搜索，从 GitHub、Hacker News 等 6 个平台采集了 70 条热门话题，再通过 `edit` 命令生成了一个近千行代码的 HTML 网页报告。

![](/imgs/61e64a16ff54f1aa.png)

最后 Agent 还自动打开了浏览器，让你直接查看生成的选题报告。

![](/imgs/556f8cff7ef476db.png)

你会发现，整个过程和在 Cursor 编辑器里跟 AI 对话一模一样。但区别在于，现在你是用代码来调用它的，这意味着你可以把它嵌入到 CI/CD 流水线、自动化脚本、甚至自己的产品里。普通的大模型 SDK 只能帮你生成文本，而 AI 编程工具的 SDK 能帮你直接操作代码库、调用工具、生成文件。

如果只是一次性的简单任务，还有更简洁的写法：

```typescript
const result = await Agent.prompt(
  "给这个项目写一个 README.md",
  {
    apiKey: process.env.CURSOR_API_KEY!,
    model: { id: "composer-2" },
    local: { cwd: process.cwd() },
  }
);
```

前面演示的是本地运行模式，Agent 直接在你自己的电脑上跑，适合开发调试。除此之外，Cursor SDK 还支持 Cursor 托管云模式，Cursor 帮你在云端开一台隔离的虚拟机来执行任务，适合同时跑多个 Agent 并行处理；以及自托管云模式，你自己管理服务器，适合企业内部使用。

有了 AI 编程工具的 SDK 后，你甚至可以把 AI 编程工具当成一种开发环境，就像部署项目需要配置数据库一样，在服务器上配好 AI 编程工具的环境，然后在代码中通过 SDK 来调用，实现自动化的代码生成、审查、重构等任务。

除了 Cursor，Anthropic 的 Claude Agent SDK 和 GitHub 的 Copilot SDK 也提供了类似的能力，用法大同小异。


## 怎么选择？

讲完了 5 种 AI 应用开发模式，那实际开发的时候到底该选哪种呢？

这里我帮大家做了一个简单的对比：

| 模式 | 一句话总结 | 适合谁 |
|------|-----------|--------|
| HTTP API | 自己拼请求调模型，最底层最灵活 | 想了解底层原理、或 SDK 不支持的语言 |
| 官方 SDK | 用官方封装好的工具包调模型 | 大多数开发者的日常开发 |
| AI 开发框架 | 记忆、RAG、工具调用等能力开箱即用 | 需要开发完整 AI 应用的团队 |
| 低代码平台 | 拖拽搭建，不用写代码 | 非技术人员、快速验证想法 |
| AI 编程工具 SDK | 让 AI Agent 帮你写代码 | 想把 AI 编程能力集成到自动化流程中 |

注意，这 5 种模式之间并不是互相排斥的，实际开发中经常会混着用。比如用低代码平台快速搭个原型验证想法，验证通过后再用开发框架重写成正式版本；或者在框架搭好的项目里，某些模块直接用 HTTP API 调一个特殊接口。

**选择的核心原则是：用最少的成本解决当前的问题。** 能拖拽解决的，就别写代码；能用框架搞定的，就别自己造轮子；能用 SDK 的，就别手撸 HTTP。

![](/imgs/df584abc68cd41f8.png)

不过如果你是在学习阶段，我建议反过来，从 HTTP API 开始，一步步往上走。这样对每一层的原理都能有清晰的理解，后面用更高层的工具也不会一头雾水。


## 写在最后

AI 应用开发这个领域变化太快了，新框架、新工具几乎每个月都在冒出来。

但万变不离其宗，底层就是这几种模式。搞懂了这些，不管未来出什么新工具，你都能快速定位它属于哪一层、解决什么问题。

回到开头那个面试场景，如果你能把这 5 种模式的适用场景和优劣讲清楚，面试官大概率会对你刮目相看。

想做 AI 实战项目的话，[编程导航](https://www.codefather.cn/) 上有多套 AI 项目教程，手把手带你从 0 到 1 做出完整的 AI 应用，加油！

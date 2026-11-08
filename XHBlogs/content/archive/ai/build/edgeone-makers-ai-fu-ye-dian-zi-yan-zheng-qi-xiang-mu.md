---
title: "EdgeOne Makers - AI 副业点子验证器项目实战"
summary: "用 AI 编程 + EdgeOne Makers，20 分钟开发上线一个 AI Agent 应用"
order: 30
level: "进阶"
tags: ["项目实战"]
updated: "2026-10-22"
readingTime: 8
author: "程序员鱼皮"
source: "https://github.com/liyupi/ai-guide"
---

大家好，我是程序员鱼皮。

AI 时代，越来越多人开始琢磨用 AI 搞副业赚钱，各种想法满天飞。

但问题是，大多数想法都停留在「感觉能赚钱」的阶段，真正去做之后才发现，要么竞品已经一堆了，要么根本没人愿意付费，时间精力全浪费了。

所以我就想，能不能做一个 **AI 投资人 Agent**，专门帮我验证副业想法靠不靠谱？

跟它描述你的副业想法，它会联网搜竞品、分析市场、评估可行性，然后像真正的投资人一样给出判断：愿意投多少钱？还是白送都不要？

如果你觉得自己的想法被低估了，可以继续追问、调整方案，它会记住你之前说的内容，动态更新估值。

这样就能快速过滤掉那些不靠谱的想法，把时间省下来花在真正值得做的事上。

⭐️ 本期对应视频版：[https://bilibili.com/video/BV1jU756mE1x/](https://bilibili.com/video/BV1jU756mE1x/)


## 方案设计
想做这样一个 AI 应用，你要考虑很多事情：

- 怎么对接 AI 模型？
- 怎么使用联网搜索能力？
- 怎么隔离多个用户的对话记录？
- 怎么让 Agent 记住上下文，应对用户的追问？

哪怕让 AI 帮你搞定这些，也会花很多时间和 tokens。

最近腾讯云的 [EdgeOne Makers](https://pages.edgeone.ai/zh/document/product-introduction) 刚上线了 Agent 托管能力，正好解决了这些问题。

![](/imgs/704ae855f77da0f9.png)

你只需要专注写 Agent 的业务逻辑（比如怎么评估一个副业想法），剩下那些联网搜索、对话记忆、模型对接之类的活儿，部署上去之后平台自动帮你搞定。

![](/imgs/0abd2ac75b58ad7e.png)

接下来我会从 0 带大家用 AI 编程 + EdgeOne Makers，把这个 AI 投资人 Agent 开发上线。

不过在动手之前，我先带大家用 EdgeOne Makers 控制台快速部署一个官方模板，感受一下这个平台到底是怎么玩的。


## 快速体验 EdgeOne Makers

进入 EdgeOne Makers 的 Agent 面板，可以看到默认提供了很多 Agent 应用模板，支持 OpenAI SDK、Claude SDK、LangGraph、CrewAI 等主流框架，JS 和 Python 都能用。

![](/imgs/2939ab9bb1e1ba0d.png)

我这里选择创建一个 OpenAI Agent 模板：

![](/imgs/ea85f85616f9cdfd.png)

关联 GitHub 仓库后，什么信息都不用改，直接点击创建部署。

![](/imgs/9d247e36b01c5608.png)

系统会帮你快速创建一个项目仓库，然后自动完成整个项目的初始化、安装依赖和构建部署。

![](/imgs/45a5e05b3d15838c.png)

点击预览，可以看到平台提供了一个临时测试域名：

![](/imgs/5637561fc653a719.png)

直接访问，一个 AI Agent 项目就上线可用了。能够正常和 AI 对话，响应速度也不错。

![](/imgs/a4ba423ce213258e.png)

你可能会好奇：我没填大模型的 API Key，怎么就能用了？

进入 Makers 控制台的 [Models 模型面板](https://console.cloud.tencent.com/edgeone/makers?tab=models&subTab=models)，你会发现 EdgeOne Makers 默认帮我们对接了主流大模型，限时赠送每个用户 50 万 Token / 月。

![](/imgs/3f896e4c73916b53.png)

还自动创建了一个调用大模型的默认密钥，并且在创建项目时，把这个密钥注入到了程序的环境变量中，所以你不用填 Key 就能直接用。

![](/imgs/c395ffd6216564cd.png)

看到这里，相信你对 EdgeOne Makers 有了基本认识，你可以把它理解为一个专门给 AI Agent 准备的托管平台，模型、工具、记忆、监控这些能力它都帮你备好了，你只管写业务逻辑。

![](/imgs/89741841a089d38b.png)

下面进入正题，我会带大家走一遍完整流程：环境准备 → 设计提示词 → AI 开发 → 部署上线 → 迭代优化。

![](/imgs/e53e61ec66e531bd.png)


## 环境准备

开发之前，要先安装 EdgeOne 官方提供的 Skills 技能包，装上之后 AI 就自动知道怎么按照 EdgeOne Makers 的要求来写代码（比如项目文件往哪放、入口函数怎么写、平台提供的联网搜索和对话记忆怎么调用），不需要你手动喂文档。

![](/imgs/d9d448be6b2565d2.png)

参考 [官方文档](https://cloud.tencent.com/document/product/1552/129329)，打开终端，输入一行命令：

```bash
npx skills add TencentEdgeOne/edgeone-makers-tools
```

根据指引，选择要安装的 Skill，比如我们要用到的智能体开发 `/makers-agents` 和部署 `/makers-deploy` 技能。

![](/imgs/7a7b96b5b4e1f6d0.png)

安装范围选择全局安装，这样之后所有项目都能用。

准备就绪，下面开始写提示词。


## 设计提示词
我的需求并不复杂，而且用什么框架、部署到哪里我已经想清楚了，就没让 AI 帮我整理，直接编写完整的提示词。

完整的提示词如下：

```markdown
帮我开发「AI 投资人」副业验证 Agent，部署在 EdgeOne Makers 平台上。

明确的技术方案：
1. 使用 OpenAI Agents SDK 框架
2. 前端和 Agent 共存在同一个项目里，之后我会一次部署到 EdgeOne Makers
 
开发要求：
1. 体现 Loop Engineering 的思想，自主开发、自主测试验证，最终交付一个完全可用的产品
2. 如果有不明确的地方，先问我再动手

需求描述：
Agent 的设定是见过太多项目的资深投资人，说话毒舌、判断犀利。用户描述自己的副业想法后，它会联网搜索竞品和市场信息，给出愿意投资多少钱的判断（或者「白送都不要」），并说明理由和改进建议。支持多轮对话，用户可以根据反馈调整方案继续追问，Agent 要记住之前聊过的内容。前端采用 Q 版风格，多端适配。
```

简单解释一下，开发要求里的 Loop Engineering 思想是让 AI 自己写完代码后自主测试验证，不用人工盯着。

不过注意，部署到 EdgeOne Makers 上的代码得遵循平台的规范，不然跑不起来。

所以执行的时候，我要先通过斜杠命令调用 `/makers-agents` 技能，AI 就会自动按照平台要求的入口函数写法、联网搜索和对话记忆的接入方式来写代码。

![](/imgs/281af641ee5957ce.png)


## AI 自主开发
确保使用了 `/makers-agents` 技能后，发送提示词，AI 就开始自主开发了。

它先加载了 Skill 中关于 Agent 开发的规范（感兴趣可以看 [官方文档](https://pages.edgeone.ai/zh/document/agents) 了解详情），然后创建项目、编写 Agent 逻辑和前端页面。

![](/imgs/0993fabd6e07d46f.png)

几分钟后，AI 完成了核心功能的开发，并且对代码进行了编译验证和自检。

![](/imgs/13ef968bc0a27437.png)

不过由于本地没有配置 AI 大模型的 API Key，没办法完整测试对话流程。

没关系，接下来部署到 EdgeOne Makers 上，配好密钥就能跑了。


## 部署上线
前面体验 **通过控制台** 创建模板项目时，EdgeOne Makers 自动帮我们注入了 `AI_GATEWAY_API_KEY` 和 `AI_GATEWAY_BASE_URL` 这两个环境变量。

但如果是自己本地创建项目，需要 **手动** 到 Makers 控制台获取这两个环境变量的值。

![](/imgs/7d3fe91bd96d3ff0.png)

此外，由于我的 AI 投资 Agent 需要联网搜索竞品信息，还要开通腾讯云的 [Web Search API 服务](https://console.cloud.tencent.com/wsapi/index)：

![](/imgs/3b96dc96530ea97a.png)

先选个最便宜的套餐就行，然后获取到联网搜索 API 密钥。

![](/imgs/0a3e6e14ac29b2be.png)

拿到这些密钥后，直接把信息提供给 AI，使用 `/makers-deploy` 技能让它帮我部署：

```markdown
帮我部署上线：
AI_GATEWAY_BASE_URL 是 https://ai-gateway.edgeone.link/v1
AI_GATEWAY_API_KEY 是 sk-xxxxx
联网搜索 API Key 是 sk-xxxxx
```

![](/imgs/2473f06c258116c9.png)

AI 自动设置好环境变量并进行部署。首次部署时会提醒你登录授权，跟着 AI 的提示操作就好。

![](/imgs/111a80e701127060.png)

很快部署完成，直接拿到了可以访问的线上地址，太方便了！

![](/imgs/9585002aec95add1.png)

打开试试，给它发个 IDEA：做一个 AI 帮你写朋友圈文案的小程序。

Agent 进行了联网搜索，找到了好几个竞品，然后给出了评估结果 —— 白送都不要！

![](/imgs/0dcb60d5465b8da2.png)

不愧是毒蛇金主，丝毫不留情面，我喜欢。

虽然功能跑通了，但默认模型的输出效果一般，下面咱们来换个更强的。


## 切换模型
进入 Makers 的模型面板，添加一个新模型，比如国产之光 DeepSeek，点击添加。

![](/imgs/ea4814626a46d9b6.png)

需要到 [DeepSeek 的 API 开放平台](https://platform.deepseek.com/api_keys) 获取密钥，创建一个临时密钥，复制粘贴到 Makers 中保存，就可以使用 DeepSeek V4 Pro 模型了。

![](/imgs/a0eb9519293049e0.png)

怎么让 Agent 用上这个新模型呢？是要改代码么？

**其实完全不需要。**

简单看下代码，你会发现，模型配置优先读取 `AI_GATEWAY_MODEL` 这个环境变量。

![](/imgs/cb004a0b4a32a700.png)

所以我们只需要让 AI 设置一下这个变量，然后重新部署就好了：

```markdown
设置 AI_GATEWAY_MODEL 环境变量为 deepseek/deepseek-v4-pro
重新部署
```

![](/imgs/ef1e43d819c64ec9.png)

部署成功后进入 Makers 控制台，可以看到环境变量已经生效了，很方便吧！

![](/imgs/e5dc03c8d8f1612f.png)

我们再来试一下同样的 IDEA：做一个 AI 帮你写朋友圈文案的小程序。

这次 Agent 进行了多轮联网搜索，最后又给出了扎心的锐评 —— 白送我都不要。

![](/imgs/0e503f20794c1579.png)

看看这通分析，明显比切换模型前的效果好多了吧？它还让我研究垂直方向……

好，那我就接着追问：我是个程序员和 UP 猪，怎么垂直？

![](/imgs/b03c0b1f4034d866.png)

好家伙，这能给我投 30 万？

![](/imgs/61acb169f096c4b9.png)

这个赛道分析还是有点意思的，什么叫编程教学赛道已经被头部吃干抹净，这个 ** 鱼皮是谁啊？！

再往下看关键的变现路径，是不是跟大家想的差不多？

![](/imgs/408a87f4bc8155d8.png)

总结一下就是 **接广告、卖课、搞培训**。

不是哥们，这么真实吗？

![](/imgs/61acb169f096c4b9.png)


## 迭代优化
到目前为止功能已经跑通了，但我发现一个问题：多轮对话记忆好像没有生效，Agent 不记得之前聊过什么。

![](/imgs/b649ac83cf2f67ce.png)

所以接下来要做一些优化。

先让 AI 用 Git 提交一版代码，万一改出问题也好及时回滚：

![](/imgs/f2194768ffe803bf.png)

然后让 AI 进一步优化、更新已部署的网站、并通过 Browser Use 自主验证效果、修复 Bug：

```markdown
优化项目、更新部署、自主验证并修复 Bug
1. 必须支持多轮对话，用户可以根据反馈调整方案继续追问，Agent 要记住之前聊过的内容
2. 优化前端页面，禁止使用 Emoji，对标商业产品，保持 Q 版风格
3. 优化 Markdown 格式的展示
```

![](/imgs/157b5725bc505478.png)

AI 很快修复了代码，利用 `makers-deploy` 技能更新了线上的网站，然后自己打开浏览器对话验证。

![](/imgs/5de188f8f0b13dc8.png)

来看看最终的效果，Markdown 的展示格式优雅多了。

![](/imgs/c93353c78aff619b.png)

而且这次多轮对话记忆也成功生效了！

![](/imgs/12f601651338a48c.png)

你会发现，我们全程没有开通任何数据库或存储服务，对话记忆是 EdgeOne Makers 平台帮我们搞定的，它在底层管理了每个用户的对话历史，不同用户之间互不干扰。

![](/imgs/7dd8cd4d9f6ecd93.png)

加上之前演示的联网搜索、模型网关，这些能力都是部署上去自动就有的，我们自己完全不用操心。

![](/imgs/e48cc135ec53dcde.png)

此外，进入 Makers 控制台的调用链路追踪面板，你可以看到 Agent 调用次数和 Token 消耗等数据。

![](/imgs/4e2d97a8dc8aa648.png)

甚至能够看到某一次调用的完整链路日志，每一次 AI 生成和工具调用的细节都一目了然，便于优化 Agent 和排查问题。

![](/imgs/d2db642124c84dbf.png)


## 成品体验
到这里，我的 AI 投资人 Agent 就开发完成了，我可以愉快地用它来验证各种副业想法。

比如我要在闲鱼上接单：

```markdown
在闲鱼上接单，帮人用 AI 写文案/简历/小红书笔记，收费 30 ~ 100 一单
```

得，看来不行。

![](/imgs/2e3947cd8d616fb8.png)

我要搭 AI 的 API 中转站：

```markdown
搭一个 AI API 中转站，帮国内用户方便地调用 GPT/Claude，赚差价
```

得，看来又不行！

![](/imgs/2ddf4e5aebfda00c.png)

我要做个 AI 英语口语陪练 App：

```markdown
做一个 AI 英语口语陪练 App，用语音对话的方式帮用户练口语，按月订阅 29.9 元
```

得，看来又又不行！！

![](/imgs/73f5e7352dfcf2d4.png)

我要摆摊卖程序员炒饭：

```markdown
我要摆摊卖程序员炒饭，通过线上拍短视频营销
```

呃啊，看来想搞一个好的项目 IDEA 不容易啊！

![](/imgs/6a55682f9369471f.png)

算了，还是卖课吧：

```markdown
我有流量基础，录制编程教程，在自己的平台上卖课，收费几百到几千不等
```

我 Chovy！！！卖课也不容易啊。

![](/imgs/9a640175e4ef0610.png)

唉，钱难赚，屎难吃。

接下来，我又试了很多个 IDEA，全部都被 AI 否定了。

![](/imgs/489be6e41d683db3.png)

哼，我就不信没有办法搞出 S 级想法！

![](/imgs/c7977219adfadf08.png)

一个人的力量是渺小的，所以我决定把这个项目开源出来，大家可以直接让 AI 帮你部署到 EdgeOne Makers 上，就能随时随地验证自己的想法了，坐等一批 A 级和 S 级想法。

> 开源指路：https://github.com/liyupi/ai-investor

![](/imgs/5e96522608b62a6f.png)


## 写在最后

从写代码到上线，整个过程不到 20 分钟。回过头来想想，我只关注了 Agent 的业务逻辑，其他的联网搜索、对话记忆、模型网关、链路追踪这些工程化的东西，[EdgeOne Makers](https://pages.edgeone.ai/zh/document/product-introduction) 全帮我搞定了。

AI 时代，大模型的能力很重要，但给大模型提供的这一系列配套能力同样重要。模型再强，没有靠谱的工程化支撑，Agent 也只能停留在本地 Demo 阶段。能让开发者把精力全部放在业务逻辑上，而不是重复造轮子，这是非常有价值的事。

---
title: "Codex - AI 开源项目学习网站项目实战"
summary: "本项目是一个 AI 驱动的开源项目学习助手，用户输入 GitHub 仓库地址，系统自动分析源码并生成通俗易懂的分析报告，还支持针对源码的交互式问答。全程使用 Codex + GPT-5.5 开发，后端对接 DeepSeek V4 API。"
order: 26
level: "进阶"
tags: ["项目实战", "转载", "AI"]
updated: "2026-10-22"
readingTime: 10
author: "程序员鱼皮"
source: "https://github.com/liyupi/ai-guide"
---

> 本文转载自 **[程序员鱼皮 · AI 指南](https://github.com/liyupi/ai-guide)**，原文标题《Codex - AI 开源项目学习网站项目实战》，作者 程序员鱼皮。
> 内容按 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可使用，本站仅作非商业性收录与排版适配。

本项目是一个 AI 驱动的开源项目学习助手，用户输入 GitHub 仓库地址，系统自动分析源码并生成通俗易懂的分析报告，还支持针对源码的交互式问答。全程使用 Codex + GPT-5.5 开发，后端对接 DeepSeek V4 API。

大家好，我是程序员鱼皮。

最近 AI 圈儿也太闹腾了，4 月 23 号 OpenAI 发布了 GPT-5.5，紧接着第二天 DeepSeek 就放出了 V4，两个重磅模型前后脚上线。

![](https://pic.yupi.icu/1/image-20260428152723505.png)

光看跑分没什么意思，模型好不好用，还得拿真实项目来检验。

正好 OpenAI 的 Codex 桌面端这段时间更新很猛，已经从一个纯 AI 编程工具进化成了支持 Computer Use、插件市场、内置浏览器的「超级 App」。

所以这篇文章，我全程用 Codex + GPT-5.5 来开发一个完整的全栈项目，后端对接 DeepSeek V4 的 API 实现 AI 能力。

看完这期，你能学会 Codex 的使用方法、感受新模型的实际能力、掌握 AI 编程的实用技巧，可谓一举三得。

点个收藏，咱们开始~


## 需求分析

这次要做的项目叫「项目学习助手」（project-helper），核心需求很简单：

用户输入一个 GitHub 仓库地址，系统自动克隆项目并分析源码，生成一份通俗易懂的完整分析报告。报告涵盖项目概述、技术栈、目录结构、核心模块、数据流、设计模式、阅读建议等，真正做到「傻子也能懂」。分析过程实时推送进度，已经分析过的项目自动缓存，不用重复分析。

![](https://pic.yupi.icu/1/image-20260427152036161.png)

另外，用户还可以针对源码进行交互式问答，AI 会自主搜索代码、读取文件来回答问题，支持流式输出。

这样一来，你可以快速学会任何开源项目，哪怕面对几万行代码的仓库，也完全不虚。


## 方案设计

如果你完全没有任何技术基础，可以让 AI 帮你完成方案设计。

但这里为了节省时间和 tokens，我直接告诉 AI 怎么做。

项目采用前后端分离架构：

- 后端用 Python FastAPI + LangChain + SQLite
- 前端用 Vue 框架
- AI 能力对接 DeepSeek V4 的 API

AI 分析和 AI 问答能力的实现还是有点小技巧的，如果一个代码仓库有几万行，难道要全部扔给 AI 自己去分析么？

我的思路是， 采用 AI 工具调用（Tool Use）的方式，给 AI 提供读取文件、搜索代码、获取仓库结构等工具，剩下的交给 AI 自己判断该看哪些文件、该怎么组织答案。这也是 DeepSeek V4 专门优化过的 Agentic 场景。

![](https://pic.yupi.icu/1/image-20260427143741108.png)


## 环境准备

### Codex 配置

打开 Codex，首先确认模型列表里有 GPT-5.5。如果看不到，大概率是账号的问题，可能需要开通更高级的会员，我这里用的是 Plus 会员。

![](https://pic.yupi.icu/1/1777256418373-5682599c-2367-4f94-951a-43bab6f0f861.png)

可以看到界面上已经有了 GPT-5.5 模型选项，还支持调节智能程度（低 / 中 / 高 / 超高），我选择「高」。

左下角进入设置，把工作模式切换为「用于编程」，这样 AI 的回复会更专业、更适合开发场景：

![](https://pic.yupi.icu/1/1777259578973-cbe093c8-ea7d-4d5e-897a-afd81222dd30.png)


### 安装 AI 扩展

Codex 的 AI 扩展主要包括三类：

- MCP 服务，用于连接外部工具连接
- Agent Skills 技能包，让 AI 学会特定的专业技能
- Plugins 插件，给 AI 增加更多能力

官方自带了一些内置的插件和技能，比如 Computer Use、Browser Use、PDF 处理、演示文稿编辑等：

![](https://pic.yupi.icu/1/1777257188480-f3405539-10b4-49bf-b612-10f6e4f5fb50.png)

![](https://pic.yupi.icu/1/1777257208664-88183795-3fb8-4862-92fe-bb2d877430e3.png)

不过这次项目需要的几个扩展，Codex 默认没有，得自己安装。

我们需要下面 3 个扩展：

1. Firecrawl：联网搜索和网页抓取，让 AI 能获取最新的技术信息
2. Context7：查询最新的技术文档和 API 用法，减少 AI 瞎编的情况
3. UI UX Pro Max：前端美化技能，让生成的页面更有设计感

你可以在 Codex 设置里手动添加 MCP 服务：

![](https://pic.yupi.icu/1/1777257301111-de539209-39d3-4956-86ba-9e43c7991cad.png)

但是，要手动填写一堆参数，真特么麻烦啊！

![](https://pic.yupi.icu/1/1777257751584-4842f03a-fa07-4cbe-94ad-dce017977b66.png)

虽然也可以直接编辑 `~/.codex/config.toml` 配置文件来添加 MCP 服务，但还是很麻烦。

这点上 Codex 的体验不如 Copilot 和 Cursor 的可视化安装，Copilot 甚至直接把 MCP 集成到了 VSCode 扩展市场里，一键搜索安装就行。

好在我们可以换一种方式，用每个 AI 服务提供的命令来快速安装。

#### 1、安装 Firecrawl

Firecrawl 是一个联网搜索和网页抓取工具，能让 AI 在开发前先搜索最新的技术信息和文档。我们的项目需要它来查询 DeepSeek V4 的最新 API 用法。

打开终端，输入下列命令：

```bash
npx -y firecrawl-cli@latest init --all --browser
```

![](https://pic.yupi.icu/1/1777258212308-8c83d23e-338e-4ec2-b1c0-05f54a22a36e.png)

执行后，会自动打开浏览器，要在弹出的页面中点击授权：

![](https://pic.yupi.icu/1/1777258069152-2d7fdb02-64e2-440b-bcbd-6254b07fb74e.png)

安装完成后，会自动注册 12 个相关技能：

![](https://pic.yupi.icu/1/1777258235867-0f6f08f5-4791-4b66-84b7-50936912540d.png)

在 Codex 的技能管理中，就能看到新添加的 Firecrawl 相关技能了：

![](https://pic.yupi.icu/1/1777258331237-182161c5-d21b-4a9b-9c6a-855d99312b5e.png)


#### 2、安装 Context7

Context7 是一个技术文档查询工具，让 AI 能获取到各种框架和库的最新官方文档，避免用过时的 API 写代码。

先在终端输入一行命令来安装：

```bash
npx ctx7@latest setup
```

它会问是安装 MCP 服务还是 CLI + Skills，这里我选择 CLI + Skills。你会发现，现在越来越多工具已经从 MCP 转向 CLI + Skills 的方式了：

![](https://pic.yupi.icu/1/1777258448310-41f86ec3-26e1-476e-aed5-4913c8116d21.png)

同样在弹出的网页中授权，不用自己获取和输入 API Key，太方便了！

![](https://pic.yupi.icu/1/1777258547209-dc872280-09eb-4bd9-ad45-2e412382002d.png)

然后选择要给哪个 AI 编程工具安装，我选择为 Codex 安装：

![](https://pic.yupi.icu/1/1777258572107-f494c3bb-01a9-443d-ba1d-6b1a3b3fab9a.png)

安装成功：

![](https://pic.yupi.icu/1/1777258672897-259f035a-f365-46ce-bc5d-e33fbc839f34.png)

在 Codex 中确认已安装的技能：

![](https://pic.yupi.icu/1/1777258710387-4b47a05d-dcb1-43ce-9761-f5d28976731e.png)

当然，你也可以选择安装 MCP Server 的方式：

![](https://pic.yupi.icu/1/1777259105649-99e28db3-c43e-4c49-a3b3-c567fa592d1f.png)

安装后，在 Codex 的 MCP 服务器设置里，就能看到 Context7 MCP 了，这不比自己手动填参数方便多了？

![](https://pic.yupi.icu/1/1777259122962-393ac901-870c-4b8b-bcf4-742e39a90c5a.png)


#### 3、安装 UI UX Pro Max

这是一个前端美化技能包，能让 AI 生成的页面更有设计感，不会有一大堆的 Emoji。

输入一行命令：

```bash
uipro init
```

选择为 Codex 安装技能：

![](https://pic.yupi.icu/1/image-20260427143633213.png)

安装成功：

![](https://pic.yupi.icu/1/1777258832043-8a3230db-2a76-47f7-a32a-5113a0487631.png)

在 Codex 的技能管理中，能看到新技能：

![](https://pic.yupi.icu/1/1777258847545-ba145ccf-2ab3-4a37-948a-4bb48d228fe4.png)

至此，环境准备完成！下次开发项目时，就不用再重复准备了~


## 开发

新建一个 `project-helper` 项目文件夹，在 Codex 中打开：

![](https://pic.yupi.icu/1/1777259374913-7c4ecded-191b-4010-820a-fe8c31ab3da9.png)

然后输入提示词。这里分享一下我实际用的提示词，给大家参考：

```markdown
## 角色

你是一个全栈工程师，擅长 Python + FastAPI + LangChain 开发。

## 任务

开发一个叫 project-helper（项目学习助手）的 Web 应用，帮助用户快速读懂任意开源项目的源码，傻子也能懂。

用户输入一个 GitHub 仓库地址，系统自动克隆项目并分析源码，生成一份通俗易懂的完整分析报告，涵盖项目概述、技术栈、目录结构、核心模块、数据流、设计模式、阅读建议等。分析过程实时推送进度，已分析过的项目自动缓存，无需重复分析。

用户还可以针对源码进行交互式问答，给 Agent 提供读取文件、搜索代码等工具，让 AI 自主查找代码来回答问题，支持流式输出。

## 技术栈

- 后端：Python FastAPI + LangChain + SQLite + 对接 DeepSeek V4 模型
- 前端：Vue，前后端分离

## 要求

1. 页面需要阅读舒适，具有科技感，代码块有语法高亮，使用 UI UX Pro Max 技能美化页面
2. 开发前，先通过 Firecrawl 联网搜索信息，通过 Context7 查询最新技术文档和用法
3. 必须生成完整可运行的代码，每步完成后必须自主测试验证
```

简单解读一下这段提示词的几个要点：

- **角色定义** 放在最前面，让 AI 进入全栈工程师的状态
- **任务描述** 用自然语言把需求讲清楚
- **技术栈** 只列关键选型，让 AI 自己决定具体实现方案
- 最后两条要求是关键，让 AI 先查文档再写代码，避免瞎编写法；让 AI 开发完后自主测试，减少翻车

模型我选择 GPT-5.5，智能程度选「高」，权限给完全访问（主要图个省事儿）：

![](https://pic.yupi.icu/1/1777259547435-755d715a-4233-4779-a198-a2d38d94c92c.png)

注意，如果你想让 AI 测试得更完整，可以先获取好 DeepSeek 的 API Key 并直接写在提示词里。否则没有 API Key，AI 是没法完成大模型调用测试的。

把上述提示词发送给 AI，接下来就是漫长的等待了。

我这次等了 9 分钟，这期间一直在做提肛，有了 AI 编程后运动量也拉上来了~

AI 生成了完整的前端和后端项目代码，还自动写好了项目文档：

![](https://pic.yupi.icu/1/1777260859705-cb84bd29-ca01-4da7-a75f-1e8f7224e653.png)

点击右上角可以查看生成的所有代码文件，总共 19 个文件、1644 行代码：

![](https://pic.yupi.icu/1/1777261007438-29de19fd-b3f8-4268-a6a1-3b05966cb85d.png)

点击右上角查看项目概览，可以看到进度、生成结果、信息来源等。

注意看「来源」那栏，我们提供的 3 个技能 AI 都用上了。Firecrawl 用来搜索信息，UI UX Pro Max 用来美化页面，Context7 用来查文档：

![](https://pic.yupi.icu/1/1777260929224-57f9b68c-5642-4d5a-8d89-990a4158253f.png)

感兴趣的同学可以看下 AI 生成的核心代码。比如问答模块利用 LangChain 实现了一个能调用 `read_file`（读取文件）、`grep_code`（搜索代码）、`repo_map`（获取仓库结构）这 3 个工具的 Agent，AI 会自主决定调用哪些工具来回答用户的问题。

![](https://pic.yupi.icu/1/1777262292586-f5557d4f-ce46-495e-9f7f-48b239cabd53.png)


## 测试验证

接下来需要获取 DeepSeek 的 API Key，进入 [DeepSeek 开放平台](https://platform.deepseek.com)，创建 API Key，记得不要泄露哦！

![](https://pic.yupi.icu/1/1777261129697-2ad16c21-6d70-4e87-879c-df2dd7e888b2.png)

大家在使用某个 AI 大模型时，记得要关注一下价格。比如写这篇文章时，DeepSeek 的 V4-Flash 百万 tokens 输入只要 1 元、输出 2 元；V4-Pro 输入 3 元、输出 6 元（当时是限时 2.5 折优惠）。现在 DeepSeek 已经改成了峰谷计价，主力的 deepseek-flash（V4.1 Flash）空闲时段输入 1 元、输出 4 元，高峰时段翻倍，缓存命中的输入低至 0.02 元/百万 tokens，具体以官方价格页为准。

![](https://pic.yupi.icu/1/1777261160054-a4d31930-44d6-4bcb-a3d0-72b533793cb7.png)

但是 DeepSeek 目前还没有 Coding Plan，不太建议拿它来 AI 编程，估计消耗的 tokens 会让很多同学吃不消。但是用它来做 AI 应用的大脑非常合适，性价比很高。

根据 AI 给出的指引，在 Codex 中打开终端，设置环境变量，把 API Key 改为你自己的：

```bash
export DEEPSEEK_API_KEY=你的_key
export DEEPSEEK_MODEL=deepseek-v4-pro
```

![](https://pic.yupi.icu/1/1777261353853-35e38b40-6f56-4d02-b2f1-90bfed1755be.png)

不过这种 `export` 方式是临时的，终端一关就没了。

更好的做法是让 AI 搞一个环境变量配置文件，我们手动填写就行。

AI 很快完成了任务，新增了 `.env` 和 `.env.example` 环境变量文件：

![](https://pic.yupi.icu/1/1777261704240-13861afc-d888-46cb-b2ff-594d3acd3dd7.png)

注意，如果你的项目要开源，一定记得在 `.gitignore` 中忽略 `.env` 文件，防止 API Key 泄露到 GitHub 上。

然后直接在编辑器中打开 `.env` 文件，把 API Key 填进去：

![](https://pic.yupi.icu/1/1777261752700-19c79ce9-9589-476d-a728-369353e279ff.png)

配置完环境变量后，让 AI 重启项目：

![](https://pic.yupi.icu/1/1777261872346-c8224d36-f3a4-446f-9055-de3fb1f7988f.png)

接下来人工测试一下。打开网页，输入一个 GitHub 仓库地址，比如我之前带大家开发的 [AI 零代码应用生成平台](https://github.com/liyupi/yu-ai-code-mother)：

![](https://pic.yupi.icu/1/1777262004830-4f2fb828-e4eb-4bb6-95e4-d3fa190fd13b.png)

虽然页面的布局和风格中规中矩，但功能是完全正常的。DeepSeek V4 生成的分析结果还挺靠谱的，包含了项目概述、技术栈分析：

![](https://pic.yupi.icu/1/image-20260427143606586.png)

还有核心模块详解、数据流分析、新手阅读建议等等，内容是准确的，生成速度也比较快：

![](https://pic.yupi.icu/1/1777262420380-cfac00d4-9116-47cb-ab65-189db056104a-20260427143538208.png)

再来测试下源码问答功能，问它：项目用了哪些设计模式？

AI 调用了工具自己去翻代码，很快就列举出来了，包括门面模式、策略模式等，每个模式都标注了对应的源码文件路径：

![](https://pic.yupi.icu/1/1777262689897-d57b786b-2196-4369-86d7-c2d29fb190fe.png)

核心功能测试没问题。但如果项目要正式上线，还要测试一堆边界条件，比如仓库不存在怎么办？网络断了会不会崩？缓存命中的逻辑对不对？

一个个手动测太麻烦了，干脆直接让 AI 帮忙。

Codex 内置了 Browser Use 插件，输入 `@Browser Use` 使用插件，让 AI 自主测试：

```markdown
自主测试所有功能，出了问题自动修复，确保所有功能正常可用
```

![](https://pic.yupi.icu/1/1777262810965-5c656c56-627e-482f-8d5d-865a867d123e.png)

可以看到 AI 在 Codex 内部打开了一个浏览器，它会自己点击页面、输入仓库地址、查看分析结果、测试问答功能，全程自主操作。这期间我又做了一会儿提肛，提麻了。

![](https://pic.yupi.icu/1/1777262956188-5e7cc9e6-7c98-402c-adee-79956abf7630.png)

等了大概 9 分钟，AI 完成了端到端的自主测试，还修复了好几个它自己发现的 Bug：

![](https://pic.yupi.icu/1/1777265795106-dfdc2945-e0e4-4653-a79f-814302226667.png)

至此项目就开发完了，是不是很简单？

你还可以继续让 AI 优化前端布局、给报告中增加 Mermaid 流程图、支持导出报告文件等等，发挥想象力自由扩展吧~


## 我的感受

最后聊聊我用 Codex、GPT-5.5 和 DeepSeek V4 的真实感受。

先说 Codex，Codex 的界面主打一个简洁，第一眼看上去甚至不像 AI 编程工具，更像个 AI 聊天助手。但功能其实比较完整，比如 MCP 和 Skills 扩展、插件市场、自动化、Git 集成、Browser Use、Computer Use，AI 编程所需的工程能力基本都具备了。

不过缺点也很明显。默认可用的模型有限，不像 Cursor 和 Copilot 原生就整合了 Claude、GPT、Gemini 各种模型随便切。易用性也差了一些，从 MCP 配置那里大家应该已经感受到了。Copilot 可以直接在扩展市场一键搜索安装 MCP，Cursor 也支持可视化编辑 JSON 配置，Codex 这边还得自己折腾命令行或者手写 TOML。

![](https://pic.yupi.icu/1/1777266857576-e240c700-e113-4d3d-8f4d-44512175986f.png)

再说说 GPT-5.5 模型。有一说一，我测了几个全栈项目，并没有明显感受到 GPT-5.5 和 Claude Opus 模型的差距。只要提示词到位，基本都能一把梭全栈项目的前端和后端，而且核心业务流程大概率一次性跑通。前端表现嘛，中规中矩，虽然实现了响应式，但 UI 没有特别惊艳的地方。。。

![](https://pic.yupi.icu/1/1777267657382-9f026e06-9984-42f6-b371-c998a41d2af9.png)

再看看 GPT-5.5 的成本。以开发前面这个项目为例，共消耗了 13 万 tokens，上下文用了 50%。Codex 桌面端目前上下文容量是 258K，开发简单的全栈项目没问题，但复杂工程项目可能会有压力。

![](https://pic.yupi.icu/1/1777268009237-7136c440-d7f9-4fec-8949-9c7fbc3deeb9.png)

我目前开的是 GPT Plus 会员，一个月 20 刀（150 元左右），每 5 小时和每周有限额。做完这个项目，5 小时的额度基本就用完了，不算扩展功能的话，1 周差不多能做 5 个完整项目。

![](https://pic.yupi.icu/1/1777266442906-7ccad38c-40d0-488e-a891-27dafc3876ef.png)

最后说说 DeepSeek V4。

我们团队之前的业务有接入 DeepSeek V3，也在带大家做的项目中用过 V3。这次把 V4 接到业务里，生成速度还是挺快的，效果比 V3 提升明显，尤其是对代码的理解和分析能力。而且有了 100 万 tokens 的超长上下文支持，让我们可以做更重的 AI 应用，比如深度研究、复杂项目源码的全局分析等等。

看一下实际的 API 消耗，测试过程中用了 27 次请求，消耗了 5 万多 tokens，花费 0.15 元。按正常用户使用量算，一天 1000 次请求大约消耗 5.5 元，性价比很高。

![](https://pic.yupi.icu/1/1777266027113-1126052d-a9a6-4049-ab3a-b75291612a87.png)

总的来说，后续我不太会继续用 Codex 来做日常 AI 编程，做复杂项目时会选择 GPT-5.5 或 Claude Opus 模型，但开发 AI 应用时会优先对接 DeepSeek V4 的 API，便宜好用。


## 写在最后

这个项目从需求到上线，全程用 Codex + GPT-5.5 完成开发，后端对接 DeepSeek V4 的 API，整个过程不到 20 分钟。

虽然 Codex 在 MCP 配置体验上还不如 Cursor 和 Copilot 方便，但功能完整度已经很不错了。更重要的是，这个项目让我们看到了用不同 AI 编程工具开发全栈项目的可能性。如果你想了解更多 AI 编程工具的使用方法和对比，可以阅读本教程编程工具板块的相关文章。


## 推荐资源

1）鱼皮 AI 导航网站：[AI 资源大全、最新 AI 资讯、免费 AI 教程](https://ai.codefather.cn)

2）编程导航学习圈：[学习路线、编程教程、实战项目、求职宝典、交流答疑](https://www.codefather.cn)

3）程序员面试八股文：[实习/校招/社招高频考点、企业真题解析](https://www.mianshiya.com)

4）程序员写简历神器：[专业模板、丰富例句、直通面试](https://www.laoyujianli.com)

5）1 对 1 模拟面试：[实习/校招/社招面试拿 Offer 必备](https://ai.mianshiya.com)

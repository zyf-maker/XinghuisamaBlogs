---
title: "GitHub Copilot 云端 AI 自动开发实战"
summary: "GitHub Copilot 云端 AI 自动开发实战——程序员鱼皮的 AI 编程工具实战教程。"
order: 17
level: "进阶"
tags: ["Vibe Coding", "工具实战", "AI 编程工具"]
updated: "2026-04-30"
readingTime: 14
author: "程序员鱼皮"
source: "https://github.com/liyupi/ai-guide"
---

> 本文转载自 **[程序员鱼皮 · AI 指南](https://github.com/liyupi/ai-guide)**，原文标题《GitHub Copilot 云端 AI 自动开发实战》，作者 程序员鱼皮。
> 内容按 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可使用，本站仅作非商业性收录与排版适配。

本文介绍如何利用 GitHub Copilot Coding Agent 在云端自动完成从需求分析到全栈开发、测试、部署上线、代码审查、Issue 处理、定时任务的全流程。全程不需要打开 IDE，在 GitHub 网页版即可完成。

大家好，我是程序员鱼皮。

前两天，我受邀参加了微软 AI Tour 大会，还在会上做了一场演讲。

主题是「带你看 GitHub Copilot 的另一面：智能体装机，不只在 IDE」。这名字是大会方包装的，说实话我自己看着都一头雾水。。。

![](https://pic.yupi.icu/1/image-20260422215325862.png)

简单来说就是：**手把手教大家如何用 GitHub + Copilot，打造属于自己的 AI 智能体。**

真没想到有这么多人来听分享，看来大家对这个选题确实很感兴趣。

![](https://pic.yupi.icu/1/mmexport1776762414702_%E5%89%AF%E6%9C%AC.jpg)

这篇文章就是演讲的完整文字版，希望能给大家一些启发和帮助。

⭐️ 视频版：https://bilibili.com/video/BV1aFoyBnE4D



## 背景和思考

最近「一人公司」和「龙虾」的概念特别火，很多人都在玩 AI 智能体，比如 OpenClaw 养虾、Hermes Agent 养马什么的。

现在的 AI 智能体不只是聊天，能持续干活、越用越懂你、随处使用。

但是，你有没有想过，扒开所有花哨的包装，**一个 AI 智能体的本质到底是什么？**

我觉得是四样东西：**角色、记忆、技能、工作空间**。

没有工作空间，角色无处定义、记忆无处存储、技能无处挂载。

![](https://pic.yupi.icu/1/image-20260423162031832.png)

除了自己的电脑之外，还有其他的工作空间吗？

作为一名开源作者，我本能地想到 GitHub 这个全球最大的代码托管平台，它的仓库天然就是 **持久化的文件空间**；而 GitHub Copilot 又提供了强大的 AI 代理执行能力，还支持网页版使用。

那干脆把 GitHub 仓库当成养 AI 智能体的「个人电脑」，不就可以了么？

所以下面我要手把手教大家：**怎么用 GitHub 打造一只你自己的 AI 小龙虾。**

我把它称为「给虾」：

![](https://pic.yupi.icu/1/image-20260423162442682.png)

接下来我会一步步演示，如何利用 GitHub 搭建一个超级智能体，不需要打开 IDE，也能完成从需求分析到全栈开发、测试、文档生成、部署上线、SEO 优化、代码审查、自动处理 Issues、定时任务的全流程。



## 1、初始化 Agent

打开 GitHub 网页版，你会发现 GitHub Copilot 的对话入口随处可见，已经融入到 GitHub 的各个角落了。

![](https://pic.yupi.icu/1/1774936826720-d8fb03a7-3f53-4674-8d37-d1abbd873565.png)

我们先新建一个叫 `github-claw` 的仓库，作为 AI 智能体的工作空间。

创建仓库时就可以填入初始化的提示词，这其实就是我们给这只 AI 小龙虾注入灵魂的过程。

![](https://pic.yupi.icu/1/1774936859388-895eba7a-1a5a-45d8-b510-b2c2b5402efa.png)

在开始之前，建议先从右上角进入 GitHub Copilot 的设置，开启联网搜索功能，这样 AI 能获取更新的信息。

![](https://pic.yupi.icu/1/image-20260423162530594.png)

然后我们填入初始化 Agent 的提示词。这段提示词定义了龙虾的角色、行为规则和记忆机制：

```markdown
你是这个仓库中长期驻留的个人 AI 助手与主要代理，像 OpenClaw 一样，不只是回答问题，还要持续做事、积累记忆、维护角色，并让这个仓库逐渐成为可长期演化的个人 AI 空间。

请先参考 OpenClaw 官方文档，理解它作为 "能做事的个人 AI 助手" 的定位，以及角色、记忆、技能和工作空间的思路：https://docs.openclaw.ai

然后把这个仓库初始化为适合 GitHub Copilot 网页版长期使用的个人 AI 工作空间，让我以后在新的 Copilot 对话里，也能继续沿用同一个角色、记忆和工作方式。

请先创建并提交一个简洁、可长期复用的 AGENTS.md，在里面定义：
- 你是谁
- 你如何在这个仓库中工作
- 你如何管理任务与记忆
- 你每次完成任务后要做的收尾动作

要求：
- 把仓库当作持久化的文件与记忆空间，可保存任何有用文件
- 用文件作为记忆的真实来源，不把重要信息只留在当前对话里
- 将长期记忆与每日/临时记录区分开
- 规则简洁、实用、可扩展，不要过度设计

如果确有必要，可以补充最少量的 MEMORY.md、memory/ 或 SOUL.md，但请保持轻量，并以 AGENTS.md 为核心。
```

可以看到，Copilot 自动初始化了一个工作空间，还自动集成了 GitHub 的 MCP 工具：

![](https://pic.yupi.icu/1/1774937227476-47848347-e4ba-4d4f-855f-b5921ea4eb59.png)

任务完成后，它会自动创建一个 PR。我们人工检查一下，没问题就合并。

![](https://pic.yupi.icu/1/1774937109998-7080c68f-b049-4fe9-9c4d-860a0ddf2484.png)

对了，如果你发现有「网络连接失败」的提示，是因为 Copilot coding agent 默认有防火墙限制。需要到仓库设置里关闭防火墙：

![](https://pic.yupi.icu/1/1774937329485-d4936387-abd0-464a-b808-a20f8cf6167d.png)

Agent 初始化完成后，你可以跟它打个招呼，它会通过文档获取到记忆：

![](https://pic.yupi.icu/1/image-20260423162709389.png)



## 2、开发上线网站

Agent 初始化好了，接下来让它干活。

让它帮我的开源 AI 知识库项目 `ai-guide` 开发一个高颜值的导航官网，提示词如下：

```markdown
请为我开源的 AI 知识库项目（ai-guide）开发并部署一个高颜值的导航官网，突出项目介绍、精选内容、路线图、更新日志、增长趋势等，吸引更多人关注我的开源仓库。必须使用 UI-UX-PRO-MAX 技能全面优化前端界面，完成后直接给出可上线访问的地址。必须自主完成任务
```

在仓库的 Agents 面板中，可以直接发起新的对话任务。

Copilot 会通过 GitHub MCP 获取我的开源项目信息，然后自动开始开发网站：

![](https://pic.yupi.icu/1/1774937381654-bde29eb7-3d0f-4869-a065-f7ddb09950dd.png)

生成代码后，它还会自动执行代码检查，发现问题就自主修复：

![](https://pic.yupi.icu/1/1774937517424-6099472c-eb6c-4688-a02d-79b3ed37ca8e.png)

接着它会自动创建 GitHub Actions 工作流，利用 GitHub Pages 完成静态网站的部署：

![](https://pic.yupi.icu/1/1774937463974-f0f1cf86-da67-40ee-8cf9-abee42b66807.png)

合并 PR 后，还需要进入仓库设置里的 GitHub Pages，选择「从工作流部署」（注意仓库必须是公开的）：

![](https://pic.yupi.icu/1/1774937811979-b3b187f8-f23c-42b1-be46-363d9f9a2457.png)

然后手动触发一次工作流，后续每次推送代码都会自动触发部署：

> 注意检查 workflow 里的分支名配置，要和你仓库的默认分支一致（比如 `master` 还是 `main`）。

![](https://pic.yupi.icu/1/1774937756522-a4fd8522-7891-4e7c-9825-67a6473dbb3a.png)

成功部署后，页面就可以正常访问了：

![](https://pic.yupi.icu/1/1774937885356-5d43735f-8c35-42de-a89e-b868612e5448.png)



## 3、使用技能

不过你可能注意到了，虽然我在提示词里提到了要用 `UI-UX-PRO-MAX` 技能，但 AI 并没有真正安装它。

当我命令它用技能时，它反而自己造了一个，这就不对了。

![](https://pic.yupi.icu/1/1774937618640-576f8005-f62f-44f4-9483-e1734d8555cd.png)

所以我们需要新开一个对话，通过提示词教会 AI 如何正确发现、安装和使用技能：

```markdown
请优化当前仓库的工作流与 AGENTS.md，让这个仓库中的主要 AI 代理具备稳定的技能发现、安装和使用机制。

明确约定如下：
- 项目级技能统一保存在 .agents/skills/
- 每个技能使用独立目录，例如 .agents/skills/<skill-name>/
- 技能的主入口文件为 SKILL.md
- 如果技能包含脚本、模板或资源文件，也与 SKILL.md 放在同一技能目录下

请在 AGENTS.md 中加入简洁、可执行的规则，使代理在后续工作中遵循以下流程：
1. 接到任务后，先检查本地 .agents/skills/ 中是否已有可复用技能
2. 如果本地没有合适技能，再自动到 GitHub 开源仓库和 Skills.sh 搜索相关技能
3. 优先选择来源清晰、结构规范、说明完整、风险较低的技能
4. 安装技能时，将其保存到 .agents/skills/<skill-name>/
5. 安装后更新必要说明，使后续对话能够直接复用这些技能
6. 如果找不到合适技能，再自行完成任务，但优先沉淀成可复用技能
7. 避免重复安装相同技能，并尽量保持技能目录整洁、命名清晰、可维护
```

AI 顺利完成了任务，制定了技能标准：

![](https://pic.yupi.icu/1/1774937972667-4d367cc1-d71d-43fe-ae68-3431b6d2108a.png)

搞定了技能规范，接下来让 AI 正确安装并使用 `UI-UX-PRO-MAX` 技能来优化网站：

```markdown
帮我废弃掉原来错误的 UI-UX-PRO-MAX 技能，安装正确的 UI-UX-PRO-MAX 技能，并利用这个技能优化之前的 ai-guide 导航网站
```

![](https://pic.yupi.icu/1/1774938123134-4f172cad-2ba2-402e-82e6-625db01ca36b.png)

这次成功了！AI 智能体从 GitHub 上正确复制了技能目录，并用技能优化了网站的 UI：

![](https://pic.yupi.icu/1/1774938261001-a8f8d0ea-313a-4782-bb5c-bd049d535b6d.png)

页面移除了多余的 Emoji，看起来更专业了：

![](https://pic.yupi.icu/1/1774938307530-07362fac-fdd8-4e2f-9c72-0a1319022029.png)

更重要的是，它还更新了 `AGENTS.md` 工作流、记忆和任务文件，实现了 AI 智能体的进化，之后它就能自己发现和使用技能了：

![](https://pic.yupi.icu/1/1774938201747-77528d03-8fbc-4ef0-9221-160f06ae49b2.png)



## 4、文档生成

文档是开源项目的牌面，我们让 AI 帮忙生成一份图文并茂的项目介绍文档 README.md。

这里有个小技巧，先人工挑选一个靠谱的 AI 生图技能，然后到 [鱼皮 AI 导航](https://ai.codefather.cn/) 上找一个你喜欢的绘图风格提示词模板，一起提供给 AI 参考。

![](https://pic.yupi.icu/1/1774938362506-65f5400c-e58c-49e0-a717-5f1df6306c65.png)

给 AI 的提示词：

```markdown
请先阅读当前仓库中的 ai-guide 导航网站，并为它生成一份高质量的 README.md 项目介绍文档，同时配套生成几张帮助理解和宣传网站的动漫风格图片，保存并在 README 中引用。

请先安装并使用这个 AI 生图技能：npx skills add https://github.com/inferen-sh/skills --skill ai-image-generation。我可以提供 Gemini NanoBanana 的 API Key，请安全使用，不要写入仓库。

AI 生图的风格参考下面的提示词模板：@已经复制的模板
```

AI 完成任务后会请求一个生图 API Key，我们到 Google AI Studio 上获取后发给 AI。它会注重安全性，仅临时使用这个密钥：

![](https://pic.yupi.icu/1/1774938470660-ee788099-bace-4a0b-8f2b-326de0caf773.png)

AI 智能体成功调用技能，生成了图文并茂的文档：

![](https://pic.yupi.icu/1/1774938669310-fbbb62dd-a10d-4ef7-8ade-4ae3630f33e8.png)

不过这次它误改了网站首页的文件。没关系，通过 PR 我们发现了这个问题，不合并就行，再让 AI 自主修复。

这里也提醒大家：**虽然 AI 写代码能力很强了，但代码审查依然很重要。**

![](https://pic.yupi.icu/1/1774938796668-8b82900c-1f40-44f7-89d3-e4f03af3cea7.png)



## 5、SEO 优化

开源项目上线后，想把它推广出去，需要做好 SEO 搜索引擎优化，让用户能在搜索引擎上搜索到你的网站。

我们用一个专业的 SEO 技能来优化网站：

```markdown
请先阅读当前仓库中的 ai-guide 导航网站，并对它进行一轮高质量的 SEO 优化，直接完善站点的标题、描述、结构化信息、页面语义、链接结构和可索引性。

做法上，请先安装并使用这个 SEO 技能：npx skills add https://github.com/coreyhaines31/marketingskills --skill seo-audit，然后把优化结果直接落实到项目代码中。
```

GitHub Copilot 整合了 Claude 等多个模型，可以直接在云端启动不同的 AI 来完成任务：

![](https://pic.yupi.icu/1/1774938911290-462333f6-8107-485d-ae36-f1417eff0cc0.png)

直接在网页端爽用 Claude 模型：

![](https://pic.yupi.icu/1/1774938853796-04e68bed-2f7d-42cb-9206-0c237f26f288.png)

很快 AI 就完成了 SEO 优化，网站更容易被搜索引擎收录了：

![](https://pic.yupi.icu/1/1774939165853-dc11c5a9-ee7a-4462-8d24-3fd3b4947ebe.png)

效果如图，网页上增加了一堆搜索关键词：

![](https://pic.yupi.icu/1/1774939208320-445dfdcb-c527-49bf-acf7-e24571e42584.png)

可以看出，我们的 AI 智能体已经能够熟练运用各种技能了。之后你再新开一个对话，就可以直接使用已经安装好的技能，把 GitHub 当成安全隔离的「电脑空间」来用。



## 6、开发前后端全栈项目

既然 GitHub 提供了完整的工作空间，那也可以用来开发包含后端的全栈项目。

比如输入下面的提示词，让 AI 帮我开发个《多媒体处理平台》：

```markdown
在当前仓库内新开发一个完整可运行的《多媒体处理平台》前后端项目：
- 前端使用 Vue 实现多页面，支持图片、音频和视频的压缩与格式转换
- 后端使用 Python + SQLite + FFmpeg 等

请自主完成项目的前后端开发、联调、依赖配置、示例数据、必要文档和本地运行方式，并主动进行测试验证，确保图片、音频和视频的压缩与格式转换流程都能实际可用。

除非确实必要，否则不要中途停下来向我确认，直接持续推进到可运行状态。
```

AI 会自己完成环境安装、前后端开发、自动化测试、文档生成，全流程一条龙：

![](https://pic.yupi.icu/1/1774939363314-a5d0a2ae-6cc8-43f2-b7d2-85e8a491cfe4.png)

注意，这些全部都是在云端执行的。哪怕你把网页、网络甚至电脑都关了，也不影响它继续工作。

![](https://pic.yupi.icu/1/1774939462978-9bc438e5-22d2-4d30-9d5b-3d8dd24bfa22.png)



## 7、测试验证

涉及后端的项目还是得好好测试一下。有 2 种方式可以访问和测试。



### 本地接管测试

开发完成后，你可以在 AI 工作的对话框中点击「Open in VS Code」，或者用 Copilot CLI 在本地接管项目：

![](https://pic.yupi.icu/1/image-20260423163857167.png)

VS Code 接管项目后，会自动克隆仓库到本地并打开。

然后你可以让 AI 帮你运行项目：

```markdown
帮我运行这个项目的前后端
```

它会自动创建 Python 虚拟环境，关键步骤会找你确认（比如安装依赖和执行命令），非常安全：

![](https://pic.yupi.icu/1/1774939577513-adc4908e-bd05-43a4-834d-efad1f629026.png)

然后人工打开浏览器测试，有问题再让 AI 修复就好：

![](https://pic.yupi.icu/1/1774939621027-32a61479-57ec-4022-b090-a5fba6d92a5b.png)



### 在线运行测试

如果不想开本地 IDE，还可以用 GitHub Codespaces。

Codespaces 是 GitHub 提供的云端开发环境，可以在浏览器里直接编辑代码、运行项目，体验和本地 VS Code 几乎一样。

![](https://pic.yupi.icu/1/image-20260423163948284.png)

需要先让 AI 帮忙创建 Codespaces 所需的配置，这样创建环境后就会自动完成初始化并运行项目：

```markdown
请继续为这个项目补全 GitHub Codespaces 开发环境配置，创建 .devcontainer/ 相关文件，使其适配这个前后端项目，并确保在创建 Codespace 后能够自动安装前后端依赖、安装 FFmpeg、初始化必要环境、自动启动 Vue 前端与 Python 后端，并正确转发访问端口。
```

![](https://pic.yupi.icu/1/1774939729545-f819f0c7-1e67-45bf-bb74-2716aa60f694.png)

AI 创建了所需的配置文件：

![](https://pic.yupi.icu/1/1774939782308-e572175e-b55e-4934-8273-00e617db2cef.png)

然后在 GitHub 上创建 Codespace：

![](https://pic.yupi.icu/1/image-20260423164046377.png)

创建完成后，正常情况下可以直接访问前端和后端（注意前端请求后端的地址可能需要调整）：

![](https://pic.yupi.icu/1/1774939972660-85faf67a-ec86-4bb4-be10-a533fe2432de.png)

如果访问不了，也可以进入 Codespace 的终端手动执行启动脚本（注意脚本的执行路径要正确）：

![](https://pic.yupi.icu/1/1774939912870-37b0f3dc-354b-4aef-ac68-58bc21e85513.png)

你看，这个操作界面是不是和本地的 VS Code 一样？而且还能直接在网页版里使用 Copilot。



## 8、代码审查

代码审查是保障代码质量的关键环节。GitHub Copilot 提供了自动和手动两种审查方式。



### 自动代码审查

Copilot coding agent 开发的代码，本身就会自动执行一轮代码审查：

![](https://pic.yupi.icu/1/1774921510223-3b174e66-582c-4a50-a663-a686d4d0cefb.png)

同时还会自动执行安全检测：

![](https://pic.yupi.icu/1/1774921537750-a468dece-3396-4d8c-8753-06b0fbb61054.png)

此外，你还可以在仓库设置中开启对所有 PR 的自动审查。

![](https://pic.yupi.icu/1/1774925532564-80308560-a96c-41b8-9a02-80a21fcda515.png)

把 Copilot 当成你的「同事」就好，只要把它加为 Reviewer，就会自动触发审查：

![](https://pic.yupi.icu/1/1774925617582-16064bd0-af9e-4684-ae16-0acc54570b3d.png)

审查结果还支持快捷修复，你可以根据它的建议直接采纳修改，一键提交。也可以通过自定义指令来调整审查的侧重点：

![](https://pic.yupi.icu/1/1774940063359-5b4cc05e-d016-4c0c-83df-ab3b95ca35cf.png)



### 手动代码审查

把 GitHub Copilot 当成你的同事，只要在 PR 中把它设置为 Reviewers，就会触发代码审查：

![](https://pic.yupi.icu/1/1774940168717-5cae3ea3-3868-4bf1-900c-e98bdfeb1373.png)

你也可以在 PR 的评论里直接 `@copilot`，比如让它把端口号恢复成原样。

这种方式更适合让 Copilot 根据审查意见直接改代码、修复 Bug：

![](https://pic.yupi.icu/1/1774940212269-3c0f640b-b461-4992-8a8b-4355a5ae0b51.png)



## 9、处理 Issues

维护开源项目的过程中，肯定少不了处理用户提的 Issues（问题），这也是很花时间的事情，可以让 AI 智能体自动完成。



### 手动处理 Issues

GitHub Copilot 官方支持让 Copilot coding agent 接手 Issue、自动创建 PR 并修复。

操作很简单，进入一个 Issue，把它分配给 Copilot 就行：

![](https://pic.yupi.icu/1/1774940337943-ba0b6ed8-872f-4745-b934-64d4f0fbb14b.png)

Copilot 会自动创建一个 PR：

![](https://pic.yupi.icu/1/1774940372286-4be19b2d-2d7d-4860-afef-4f3314321c48.png)

同时创建一个工作会话来分析和修复这个 Issue：

![](https://pic.yupi.icu/1/1774940395478-6e05f7f7-f5ea-4c9b-bbf3-912bfe585612.png)



### 自动回复 Issues + 自动修复 Bug

还可以让 AI 全自动帮我们回复 Issues 并修复 Bug。

利用 GitHub Actions 的自动化能力，我们只需要补一个「自动派单」的工作流就行。

给 AI 一段提示词：

```markdown
为当前仓库创建一套 Issue 自动化处理工作流：当有新的 Issue 创建时，先自动回复一条简洁的确认与补充信息提示；如果该 Issue 被识别为 bug（比如带有 bug 标签或满足明确的 bug 条件），则自动将该 Issue 分配给 GitHub Copilot coding agent 处理，并让 Copilot 后续自动开 PR 修复。

请直接完成所需的 GitHub Actions 工作流、必要配置和说明，优先采用简洁、稳定的实现方式。
```

![](https://pic.yupi.icu/1/1774940470510-d1d080c2-1b43-40f8-a4c8-da6b99baceba.png)

不过需要注意的是，自动生成的脚本可能会有问题，比如只回复了却没有真正分配给 Copilot 去修复：

![](https://pic.yupi.icu/1/1774940518174-d623cbc5-ae7a-4258-babc-34fb7d42d6db.png)

这时候可以再让 AI 根据官方文档修复。核心要注意几点：

```markdown
请修复当前仓库中 Issue 自动化工作流的 Copilot 分配逻辑。现在工作流虽然会自动评论"已分配给 Copilot"，但实际上并没有真正成功分配。

请参考 GitHub 官方对 Copilot coding agent 的 Issue API 分配方式，改成正确可用的实现：使用正确的 Copilot assignee copilot-swe-agent[bot]、必要的 agent_assignment 参数，并且只有在真实确认分配成功后才发表评论；如果分配失败，也要给出明确、真实的失败提示，不要误报成功。

另外，请顺手优化这个工作流的结构：opened 事件只负责自动回复，labeled + bug 事件只负责分配给 Copilot，保证整体逻辑更清晰稳定。
```

![](https://pic.yupi.icu/1/1774940559765-faff3598-81bb-4a7d-a4fd-e9a0024644a8.png)

而且这里需要用户级别的 Personal Access Token（PAT），不能用默认的 GITHUB_TOKEN。

先到 GitHub 申请 PAT，开通相应的仓库权限：

![](https://pic.yupi.icu/1/1774940613065-a66b1fc9-09cf-47ad-ad5e-57dd4618490c.png)

然后把密钥存放到仓库的 Secrets 中，在工作流脚本中通过 `secrets.COPILOT_ASSIGN_TOKEN` 引用：

![](https://pic.yupi.icu/1/1774940688587-7e6f019d-9df1-4af5-b808-233ee3ec15ee.png)

引用 token 的示例代码如下：

```yaml
  - name: Assign issue to Copilot coding agent
    uses: actions/github-script@v7
    with:
      github-token: ${{ secrets.COPILOT_ASSIGN_TOKEN }}
      script: |
```

然后我只要提一个打了 `bug`  标签的 Issue，就会触发 GitHub Actions，自动把 Bug 分配给 AI 处理：

![](https://pic.yupi.icu/1/1774940722288-25f2ee1e-d20d-46c5-869a-bee8fcb69d00.png)



## 10、定时任务

OpenClaw 的一大亮点是可以执行定时任务，那咱们的 “给虾” 也要有！

但是 GitHub 仓库不是一台常驻运行的电脑，怎么做定时任务呢？

我有个主意，利用 GitHub Actions 的 `schedule` 触发器，就能给 AI 智能体补上「定时触发」的能力。

比如让它每天自动推送最新的 AI 科技热点：

```markdown
为当前仓库创建一个可长期使用的定时任务工作流，利用 GitHub Actions 模拟 OpenClaw 风格的定时触发能力。

目标：每天北京时间中午 13 点，自动收集并总结本周最新的 AI 科技热点，并以 "推送日报" 的形式发送给我。

优先采用简单稳定的实现方式：默认先推送到 GitHub Issue；如果仓库中已有邮箱等其他 webhook 配置，也可以优先复用。
```

当然，你还可以选择对接更多第三方渠道，比如邮件、Telegram 等：

![](https://pic.yupi.icu/1/1774940782165-e1ce8ae7-2ab1-4982-a48c-1e9c5791db3b.png)

任务完成，创建了定时触发的 GitHub 工作流：

![](https://pic.yupi.icu/1/1774940824191-a0b449e3-d16f-4784-9894-2b2835361853.png)

之后，每天会自动生成一份 AI 科技日报：

![](https://pic.yupi.icu/1/1774940877163-c8368494-3a99-45d4-a98b-7cfb7ed6e12a.png)

注意，GitHub Actions 的 schedule 定时触发会有延迟，官方文档也说明了在高负载时段（尤其是每小时开头）可能延迟甚至丢弃任务，所以不适合对执行时间要求精准的场景。



## 11、封装 AI 智能体

到这里，我们的 AI 小龙虾已经养得很肥了。它有了角色、记忆、技能、自动化流水线。不妨把它封装起来，分享给别人用。

于是，我给 Copilot 这段提示词，让它帮我封装成一个 Agent Skill：

```markdown
请把当前仓库里已经实现的所有 "把 GitHub Copilot 变成小龙虾" 的能力，系统化封装成一个可复用的 agent skill，名称为 github-claw，并放到仓库的 skills/github-claw/ 目录下。

在开始之前，请先参考 anthropics/skills 仓库中的 skill-creator 结构与规范，按规范创建完整技能文件，而不是只写一个简单的 SKILL.md：
https://github.com/anthropics/skills/tree/main/skills/skill-creator

这个 github-claw skill 的目标是：让其他用户只要安装这个技能，就能尽可能快速地把 GitHub Copilot 仓库工作流变成一个 OpenClaw 风格的小龙虾系统，具备并串联以下能力：
- 角色与人格
- 文件化记忆与长期上下文
- 技能发现、安装与管理
- 定时任务 / GitHub Actions 自动化
- Issue 自动回复与自动分配给 Copilot
- PR 审查与自动化工作流
- 编码开发、部署、网站生成与项目推进
```

![](https://pic.yupi.icu/1/1774941001296-f6cfe046-91a8-477f-814e-944c4ce5ca10.png)

封装好的 `github-claw` 技能被单独放到了一个干净的分支：

![](https://pic.yupi.icu/1/1774941046143-f9f04ebf-6c68-41f1-b037-6f9b6f50cae2.png)

这样一来，以后任何人只要新建一个 GitHub 仓库，安装上这个技能，就能立刻拥有一只自己的 AI 小龙虾了。

> GitHub Claw 项目开源：https://github.com/liyupi/github-claw

![](https://pic.yupi.icu/1/1774941138078-6a086446-9193-4b43-9847-9232401f9854.png)



## 总结

至此，我们全程没有打开 IDE，利用 GitHub 网页版就打造了自己的 AI 智能体。

你可以让它帮你完成从需求分析到全栈开发、测试、文档、部署上线、SEO 优化、代码审查、Issue 自动处理、定时任务的全流程。

而且因为 GitHub Copilot 深度融合在网页端，以上所有任务都可以通过手机打开 GitHub 网页或 GitHub Mobile App 完成，随时随地使用。

![](https://pic.yupi.icu/1/image-20260423165139146.png)

Copilot 的优势在于：

1）全程云端执行：Copilot coding agent 在 GitHub Actions 支持的临时环境中独立工作，非常安全。你可以关掉网页甚至关机，AI 会继续干活。

2）端到端交付能力：GitHub Copilot 能够贯穿整个开发生命周期，从写代码到 PR 审查到部署，全部在 GitHub 生态内闭环完成。

3）多模型灵活选择：GitHub 提供了多个模型供选择，可以根据不同任务类型适配最合适的模型，节省成本。

![](https://pic.yupi.icu/1/image-20260423165247440.png)



## GitHub Copilot 更多能力

除了今天演示的核心流程，GitHub Copilot 还有很多值得探索的能力：

1）Coding Agent MCP 配置：在仓库设置中可以配置 Copilot 的权限、工具和 MCP Server（比如接入 Context7、Firecrawl 等 MCP），扩展 Copilot 的外部数据获取和操作能力。

2）GitHub 内置 Memory：Copilot 可以自动存储它在仓库工作中推断出的有用信息，形成持久化的仓库级记忆。后续它在这个仓库里工作时会自动调用这些记忆，效果越用越好。目前处于 Public Preview 阶段。

3）Copilot Spaces：一种上下文共享空间，你可以把代码、文档、设计稿等多种资源聚合到一个 Space 里，让 Copilot 在回答和工作时始终基于正确的上下文，适合团队协作场景。

4）GitHub Spark：通过自然语言描述你的想法，Spark 可以秒出全栈 Web 应用原型，支持实时预览和一键部署到 Azure，不需要写代码。还可以从 Spark 创建 GitHub 仓库，双向同步。

5）GitHub Copilot CLI：这是一个独立的命令行 AI 工具，可以阅读代码、编辑文件、执行命令、创建 PR，还能把任务委派给专门的 Agent。支持远程会话恢复，在任何终端上都能接着干。

除了前面主要展示的 Copilot 网页端，桌面端的 GitHub Copilot（VS Code 等 IDE 插件版本）也非常好用，能灵活切换多个大模型，还集成了网络搜索等各种主流工具，支持 MCP 和 Skills，平时我也经常用它带大家开发完整项目。

比如我的 AI 热点监控工具项目，就是完全利用 GitHub Copilot 在 IDE 中开发出来的。

![](https://pic.yupi.icu/1/image-20260423165402802.png)

如果你想系统学习 GitHub Copilot 的使用方法，可以阅读本教程编程工具板块中的《AI IDE 插件》和同板块「工具实战」中的《VSCode + GitHub Copilot：微软全家桶的 AI 编程实战》。



## 推荐资源

1）鱼皮 AI 导航网站：[AI 资源大全、最新 AI 资讯、免费 AI 教程](https://ai.codefather.cn)

2）编程导航学习圈：[学习路线、编程教程、实战项目、求职宝典、交流答疑](https://www.codefather.cn)

3）程序员面试八股文：[实习/校招/社招高频考点、企业真题解析](https://www.mianshiya.com)

4）程序员写简历神器：[专业模板、丰富例句、直通面试](https://www.laoyujianli.com)

5）1 对 1 模拟面试：[实习/校招/社招面试拿 Offer 必备](https://ai.mianshiya.com)



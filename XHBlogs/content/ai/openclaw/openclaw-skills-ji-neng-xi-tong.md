---
title: "OpenClaw Skills 技能系统"
summary: "给 AI 装能力扩展包，从发现到安装全流程"
order: 11
level: "入门"
tags: ["OpenClaw"]
updated: "2026-03-20"
readingTime: 5
author: "程序员鱼皮"
source: "https://github.com/liyupi/ai-guide"
---

你好，我是鱼皮。小龙虾本体只有基础能力（读写文件、执行命令等），装上不同的技能（Skills）之后，就能解锁各种专业能力，比如搜索网页、生成图片、制作 PPT 等。这篇教程带你全面了解 OpenClaw 的技能系统。


## 技能是什么

技能（Skills）就是给 AI 准备的能力扩展包。

技能本质上是存放在特定目录下的文件夹，里面包含一个 `SKILL.md` 说明文件和可选的资源文件。AI 在需要时会自动加载对应的技能来增强自己。

![](/imgs/8ebdb574a0a7a52d.png)

技能可以安装在多个位置：

- `~/.openclaw/workspace/skills`：小龙虾专用的技能目录，只有你的小龙虾能用
- `~/.agents/skills`：通用目录，其他 AI 工具（比如 Cursor、Claude Code）也能自动识别和使用这里的技能


## 使用内置技能

可以在「技能模块」全局查看 OpenClaw 识别到的技能，包括 OpenClaw 内置的技能、通过插件安装的第三方技能、本地目录中的技能等等。

![](/imgs/f1450693fb97c26e.png)

更常用的是直接查看和管理 Agent 的技能。

注意，技能不是越多越好！一定要按需选用！每开启一个技能，它的说明文件就会被注入到 AI 的上下文中，技能越多消耗的 Tokens 越大。

建议先把所有内置的技能关闭，绝大多数技能是用不到的，可以节省一些 Tokens：

![](/imgs/ff2e47d1d6f1c6d5.png)

当你需要用到什么功能的时候，先到技能模块搜一下有没有内置的技能。

比如我们想用 AI 生图，可以搜索 image，打开内置的 nano-banana-pro 技能：

![](/imgs/8489773bad341851.png)

需要从 [Google AI Studio](https://aistudio.google.com/api-keys) 获取到 Nano Banana 的 API Key：

![](/imgs/c3e23d16527470fb.png)

然后确保给小龙虾（代理）开启了这个技能，注意技能的状态要是 `eligible` 可用的：

![](/imgs/da66e6f7d11e56f8.png)

建议刚开始在对话中提到技能名称，引导 AI 使用技能。

比如我这里告诉 AI 使用 Banana 技能生图，甚至还可以给 AI 发送图片哦：

```markdown
用 Banana 生成一张让这个人把你做成蒜蓉小龙虾的图片，并且让我在飞书直接看到图片，不要废话！
注意飞书中发送图片要用 filePath 参数指定完整的文件路径
```

效果还不错吧！

![](/imgs/d1b7778478e4e654.png)

以后我在外面拍照之后，可以直接用手机发给小龙虾，让它帮我瞬间生成牛呗轰轰的图片~

这次我们通过斜杠命令触发指定技能，直接使用 `/{技能名称}` 就好：

```markdown
/nano-banana-pro 把后面那哥们移除掉，顺便帮我开个美颜，一只眼睛变成永恒万花筒写轮眼
```

![](/imgs/ec860a2f77df8d4b.png)

老规矩，如果没发送图片成功，让它注意 **飞书中发送图片要用 filePath 参数指定完整的文件路径**：

![](/imgs/c335c1e3f8949daf.png)

阿妈忒勒斯！

生成失败的话，可能是因为你家网络的原因，可以改为用国产的大模型生图。


## 发现优质技能

除了使用内置的技能，我们还可以到很多渠道发现优质技能：

- [ClawHub](https://clawhub.ai/)：OpenClaw 官方技能商店，技能最全、更新最快
- [skills.sh](https://skills.sh/)：Vercel 提供的技能搜索引擎，方便按关键词搜索
- GitHub：很多优秀技能开源在 GitHub 上，搜索关键词就能找到

![](/imgs/49c87db717201285.png)

当然，还有很多获取实用技能的渠道，像鱼皮的 AI 导航网站 ai.codefather.cn 也给大家推荐了一波技能。

![](/imgs/85970a0573c0dfaa.png)

**一定要注意技能的安全性！**

尽量安装开源的、可信的、Star 多的、开源社区中反馈良好的。

这里给大家推荐几个适合小龙虾的技能：

+ 自主进化技能：[self-improving-agent](https://clawhub.ai/pskoett/self-improving-agent) 自动捕获学习记录、错误和纠正，实现 AI 代理的持续自我改进
+ 网页搜索技能：[Multi-Search-Engine](https://clawhub.ai/gpyAngyoujun/multi-search-engine)（无需 API Key，有国内 + 国外的搜索引擎），或者 [Tavily Search](https://skills.sh/tavily-ai/skills/search)（需要 API Key，每月 1,000 次搜索，适合搜索国外最新内容）
+ 安全审查技能：[Skill Vetter](https://clawhub.ai/spclaudehome/skill-vetter) 安装新技能前帮你检查技能文件是否安全可信，防止安装到恶意技能
+ 办公技能，比如 [Anthropic 官方开源](https://github.com/anthropics/skills/tree/main/skills) 的 docx、pptx、xlsx、pdf 处理技能

![](/imgs/8e4f82d473ddd507.png)

OpenClaw 内置的 clawhub 技能、还有 find-skills 这两个 “用于发现和安装其他技能” 的技能，我建议谨慎给龙虾使用，万一龙虾搜索到一些不安全的技能，然后自己安装了就不好了。

我们可以人工用这些工具发现技能，确定没问题后，再安装。

![](/imgs/1c0058365cf0d766.png)


## 安装技能

以 Multi-Search-Engine 为例，我们演示一下怎么安装技能，会讲解多种方式。

但无论哪种方式，安装原理都是把技能文件从远程下载到本地存放技能的 skills 目录中。


### 方式一：直接下载压缩包

![](/imgs/100913d2131ff2b2.png)

你可以把解压后的目录放到 `~/.agents/skills` 这个各家 AI 编程工具都能自动识别的通用技能目录，这样其他 AI 编程工具也能使用这个技能。

如果你只希望小龙虾能使用，可以放到 `~/.openclaw/workspace/skills` 目录下，这是小龙虾的工作空间。

![](/imgs/01f452be5e4e1dfb.png)

然后就能在「代理」或者「技能」模块中看到识别出的工作区技能了，开启并保存，就能在对话中使用了：

![](/imgs/5f976cb8aa5a632b.png)

比如让它帮我搜索鱼皮编程导航相关的信息：

```plain
/multi-search-engine 全网搜索鱼皮编程导航相关的信息
```

![](/imgs/4559363fe6fc0a66.png)


### 方式二：通过 clawhub 命令行安装

先安装 clawhub 命令行工具，它是 OpenClaw 官方技能商店的客户端，可以一行命令搜索和安装技能：

```bash
npm i -g clawhub
```

![](/imgs/63fc44fe198e082d.png)

然后用 clawhub 安装，参数为你在 clawhub 看到的技能名称（别输错了）：

```bash
clawhub install multi-search-engine
```

![](/imgs/e518f1b39f6f36ae.png)


### 方式三：通过 NPX 工具安装

首推 Vercel 官方提供的 **NPX 工具** 来安装技能，适合有 GitHub 开源仓库地址的技能。

可以先到 Vercel 官方的技能网站 [skills.sh](https://skills.sh/) 或者 GitHub 上找到你要安装技能的开源仓库地址和技能名称。

比如安装 agent-browser 这个让 AI 操作浏览器的技能：

![](/imgs/4bd2c569d08f1b51.png)

只要输入一行命令，就能自动安装指定技能了：

```bash
npx skills add https://github.com/vercel-labs/agent-browser --skill agent-browser
```

可以选择安装到 OpenClaw 或者其他 AI 编程工具的路径下：

![](/imgs/fc50b5119ff4ede7.png)

注意，不建议通过跟龙虾对话，让它自己安装技能。还是那句话，AI 做事是有随机性的，有些明确可完成的任务自己做更稳定。


## 让 AI 自己创造技能

除了安装别人做好的技能，你还可以让 AI 自己创建新技能，将解决方案沉淀为可复用的技能包，龙虾越养越聪明。

> 建议先安装 Anthropic 官方的 [skill-creator](https://skills.sh/anthropics/skills/skill-creator) 技能，能够帮你创建出更规范的、更懂 AI 的技能。

比如我之前接入飞书后，发现 AI 拍了照片却不会发到飞书。于是我引导小龙虾自己探索飞书多媒体发送的方法：

```markdown
飞书支持给用户发送图片、文件、音频、视频并直接浏览，请你详细了解具体的发送方法，并且必须要把需要发送的文件放到 workspace 工作空间中。你必须记住这些方法，之后快速地给我发送想要的内容。
```

AI 会去读取飞书技能文档，学习怎么发送多媒体消息。

![](/imgs/08e1c4aac2df6ce3.png)

这次不仅成功发送了图片，而且 AI 还很有学习精神，自己去研究有没有更优的方案：

![](/imgs/ae651ca435b33f08.png)

甚至自己创建了一个 `feishu-media` 技能，之后发送多媒体就更丝滑了。

这就是 AI 的厉害之处：只要你下命令，它就能自己研究问题、自己解决问题，还能把解决方案沉淀成可复用的技能，下次直接用。

![](/imgs/1073af7e6c379c10.png)


## 写在最后

学会了技能系统，接下来我们来看定时任务和自动化，让小龙虾定时帮你巡检、汇报。


## 推荐资源

1）鱼皮 AI 导航网站：[AI 资源大全、最新 AI 资讯、免费 AI 教程](https://ai.codefather.cn)

2）编程导航学习圈：[学习路线、编程教程、实战项目、求职宝典、交流答疑](https://www.codefather.cn)

3）程序员面试八股文：[实习/校招/社招高频考点、企业真题解析](https://www.mianshiya.com)

4）程序员写简历神器：[专业模板、丰富例句、直通面试](https://www.laoyujianli.com)

5）1 对 1 模拟面试：[实习/校招/社招面试拿 Offer 必备](https://ai.mianshiya.com)

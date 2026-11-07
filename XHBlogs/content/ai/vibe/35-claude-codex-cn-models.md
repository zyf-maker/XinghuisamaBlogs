---
title: "Claude Code 和 Codex 对接国内模型教程"
summary: "Claude Code 和 Codex 对接国内模型教程——程序员鱼皮的 AI 编程工具实战教程。"
order: 35
level: "深入"
tags: ["Vibe Coding", "Claude Code", "AI 编程工具"]
updated: "2026-10-22"
readingTime: 9
author: "程序员鱼皮"
source: "https://github.com/liyupi/ai-guide"
---

> 本文转载自 **[程序员鱼皮 · AI 指南](https://github.com/liyupi/ai-guide)**，原文标题《Claude Code 和 Codex 对接国内模型教程》，作者 程序员鱼皮。
> 内容按 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可使用，本站仅作非商业性收录与排版适配。

很多人想学 AI 编程，想耍一耍目前最流行的 Claude Code 和 Codex 编程工具，结果一上手就卡在了第一步。

要么没有国外的订阅账号，登录都登录不上；要么好不容易开通了，发现官方额度死贵，对话一会儿额度就耗光了；再加上时不时还有封号的风险，整的提心吊胆。

咱们怎么能因为「用不了工具」这种事，就把学 AI 编程的劲头给浇灭了呢！

其实 Claude Code 和 Codex 都支持切换模型，咱们用国内的大模型（比如 DeepSeek、Qwen、智谱 GLM）来驱动它们就行，量大管饱，不用魔法，也不怕封号。

这篇文章我就手把手教你把国内模型接到 Claude Code 和 Codex 里。我会以 DeepSeek 为例，看完你就能跑通整套流程，想换哪家模型都是一样的操作。

⭐️ 本文对应视频版，2 分钟就能跟着搞定：https://bilibili.com/video/BV14JEj6uEdG

点个收藏，咱们开始~



## 为什么推荐 DeepSeek

在动手之前，先说说为什么我拿 DeepSeek 来举例。

DeepSeek 的 Flash 模型主打性价比，写这篇文章时 V4-Flash 输入 1 元 / 百万 token、输出 2 元 / 百万 token，大概只有 V4-Pro 十分之一的价格。

> 注：DeepSeek 现在的 Flash 模型已经升级为 V4.1 Flash（模型名 `deepseek-flash`），改成了峰谷计价：空闲时段输入 1 元、输出 4 元，高峰时段翻倍（每百万 token，缓存未命中），大约是 V4-Pro 的三分之一到四分之一。最新价格以 DeepSeek 官方价格页为准。

![](https://pic.yupi.icu/1/image-20260803152949072.png)

重点是它在 Agent 能力上做了大幅强化，在专门测试 AI 自主执行终端任务的 Terminal-Bench 上拿到了 82.7 分，竟然反超了当时还是预览版的 V4-Pro（72.1 分），写代码、调工具、自主执行任务都很能打。

![](https://pic.yupi.icu/1/HOiZba2aYAAozFz.jpeg)

Agent 能力强、价格又便宜，用来驱动 Claude Code 和 Codex 学习 AI 编程，性价比是最高的。

**而且更香的是，它原生支持了 Responses API，可以直接接入 Codex，不需要任何协议转换。** 这一点后面配置的时候你会体会到有多省事。

当然，如果你已经买了其他平台的套餐，比如智谱 GLM、Qwen、Kimi、MiniMax，操作思路完全一样，把 Base URL 和 API Key 换成对应平台的就行。



## CC Switch 是什么

Claude Code、Codex 这些命令行工具，每一个的配置格式都不一样。如果你想给它们换个模型供应商，得自己去翻文档，手动编辑 JSON、TOML 或者 `.env` 文件，填一堆 Base URL、API Key、模型名之类的参数。说不定改错一个字符就跑不起来，想在几个模型之间来回切换就更麻烦了。。。

CC Switch 就是来解决这个痛点的。它是一个免费开源的跨平台桌面工具，用一个可视化界面统一管理 Claude Code、Codex、Gemini CLI、OpenCode 等多个 AI 编程工具的配置。

> 开源指路：[https://github.com/farion1231/cc-switch](https://github.com/farion1231/cc-switch)

![](https://pic.yupi.icu/1/1780312934749-a570e124-074c-40fe-924b-5f9719e45e56.png)

CC Switch 内置了 50 多个供应商预设，DeepSeek、Qwen、Kimi、智谱 GLM、MiniMax 这些都有，你不用自己手动改配置文件，点几下就能一键切换模型，还能从系统托盘里快速切换。

![](https://pic.yupi.icu/1/image-20260601193909067.png)

下面我就用它来带大家实操一遍。



## 安装 CC Switch

到 [CC Switch 官网](https://ccswitch.io) 或者 [GitHub Releases 页面](https://github.com/farion1231/cc-switch/releases/latest)，根据你的操作系统选择对应的安装方式。

![](https://pic.yupi.icu/1/1780310254037-fb0cd631-17e9-45cf-b1c2-963d18cbf99d.png)

Mac 用户推荐直接用 Homebrew 一行命令安装，装完直接就能用：

```bash
brew install --cask cc-switch
```

![](https://pic.yupi.icu/1/1780310254160-ed387f10-f656-429f-a41d-8e288b8e3be2.png)

Windows 用户从 Releases 页面下载 `.msi` 安装包，双击运行即可；Linux 用户根据发行版选择 `.deb`、`.rpm` 或 `.AppImage`。

安装完成后启动 CC Switch，主界面会出现在桌面或者系统托盘里。

下面我们就分别给 Claude Code 和 Codex 接上 DeepSeek 了。不过在那之前，得先把 DeepSeek 的 API Key 准备好。



## 准备大模型 API Key

不管接哪个工具，都得先有一个 DeepSeek 的 API Key。

到 [DeepSeek 开放平台](https://platform.deepseek.com) 注册登录，进入 API keys 页面，点击创建一个新的 key。

![](https://pic.yupi.icu/1/image-20260601194058029.png)

注意，key 只会在创建时完整显示这一次，记得当场复制保存好，后面在 CC Switch 里要用到它。



## 把 DeepSeek 接入 Claude Code

我们先从简单的 Claude Code 开始。



### 先装好 Claude Code

简单介绍一下 Claude Code。它是 Anthropic 推出的 AI 编程工具，直接在终端里运行，你跟它聊天描述需求，它就能自主分析项目、写代码、跑命令、修 Bug，全程自主执行。

![](https://pic.yupi.icu/1/1780310254072-69c9a86c-ede2-40e7-807c-13684461d4c2.png)

安装 Claude Code 很简单，先确保电脑里有 Node.js 环境，没有的话去 [Node 官网](https://nodejs.org/en/download) 下个傻瓜式安装包。然后一行命令搞定：

```bash
npm install -g @anthropic-ai/claude-code
```

装好后在终端输入 `claude` 就能进入对话界面，首次使用需要登录。但很多同学没有 Anthropic 的官方账号，登录这步就卡住了，根本没法直接用。

别急，下面就用 CC Switch 把它切换成 DeepSeek。



### 用 CC Switch 切换模型

打开 CC Switch，在顶部应用栏选择 **Claude**，然后点击「添加供应商」：

![](https://pic.yupi.icu/1/1780310658228-ffa4ff69-342c-4244-82e3-2204dad61e97.png)

在预设的模型供应商列表里选择 **DeepSeek**：

![](https://pic.yupi.icu/1/1780310679329-e280982b-da09-4f4e-8861-d943f39f17ed.png)

接下来填写刚才在 DeepSeek 开放平台创建好的 API Key：

![](https://pic.yupi.icu/1/1780310750547-43515207-6f23-45b7-a62f-56370070da4f.png)

其余字段基本不用动，CC Switch 的 DeepSeek 预设已经帮你把模型都配好了，里面内置了 DeepSeek-V4-Pro 和 DeepSeek-V4-Flash 两个版本。主模型默认是 Pro（对应 Claude Code 里的 Opus 位），小模型是 Flash（对应 Haiku 位）。

如果你想省钱又够用，直接全部用 V4-Flash 也完全没问题，它的 Agent 能力已经很强了。

如果你想用上 DeepSeek V4 的百万 tokens 超长上下文，还能在这里直接勾选开启 1M 模式，告诉 Claude Code 这个模型能吃下这么长的上下文，不用自己去改配置。

![](https://pic.yupi.icu/1/1780310818585-ecfe1960-f1cd-4a31-a1e7-f1da199c17d9.png)

填完点右下角的「添加」按钮。这里能看到 Claude Code 的 JSON 配置文件，CC Switch 干的活儿就是帮你可视化地修改它，省去手动编辑的麻烦。

![](https://pic.yupi.icu/1/1780310894533-0153954b-e19f-4e96-93a5-de8208e08c01.png)

最后点击启用 DeepSeek 模型：

![](https://pic.yupi.icu/1/1780310914775-338bbb35-872d-46ad-9cbf-5731341a3942.png)

重新进入 Claude Code，左上角能看到当前用的模型。我们让它自报家门，输入一句：你是什么模型？

AI 能正常给出回复，就说明切换成功了：

![](https://pic.yupi.icu/1/1780311048597-711eca09-fe5c-4d0a-bb01-7c9bbfcb033c.png)

你可能会发现，用 CC Switch 给 Claude Code 接 DeepSeek，整套流程格外简单。这是因为 DeepSeek 提供了兼容 Anthropic 协议的接口，而 Claude Code 本身就是按这个协议来通信的，CC Switch 直接把配置写进 `settings.json` 就能用了。



## 把 DeepSeek 接入 Codex

搞定 Claude Code，我们再来看 Codex。它是 OpenAI 推出的 AI 编程工具，最近的热度堪称炸裂，经常赠送重置额度，使劲蹬都蹬不完。

![](https://pic.yupi.icu/1/1780311345253-521a8636-47ec-4d53-bb1a-e350748e2085-20260601194352039.png)

Codex 有两种形态，一种是在终端里跑的命令行版 Codex CLI，一种是带图形界面的桌面 APP。

命令行版的安装方式跟 Claude Code 类似，一行命令就能搞定：

```bash
npm install -g @openai/codex
```

装好后在终端输入 `codex` 就能进入对话界面，首次使用同样需要登录 OpenAI 账号。没有账号的话，就要自己折腾一下切换个模型。

![](https://pic.yupi.icu/1/1780311431037-8b655299-d1f1-4ff5-a845-988c0980c4ca.png)

至于 Codex 桌面 APP 的安装和基础玩法，前段时间我刚出过一套《保姆级的视频 + 图文教程》，需要的同学直接到我的 [鱼皮 AI 导航](https://ai.codefather.cn/library/2058749249474023425) 自取：

![](https://pic.yupi.icu/1/image-20260601194545597.png)

给 Codex 接 DeepSeek 有 3 种方法，我按推荐程度依次介绍。



### 方法 1、官方一键脚本（推荐）

DeepSeek 官方提供了一个配置脚本，跑一下就能全部搞定。

在运行之前，确保你已经安装了 Codex CLI 或者 ChatGPT 桌面 APP，并且至少启动过一次，让它生成好 `~/.codex` 配置目录，脚本要往里面写东西。

> 官方文档参考：[https://api-docs.deepseek.com/quick_start/agent_integrations/codex/](https://api-docs.deepseek.com/quick_start/agent_integrations/codex/)

Windows 用户在 PowerShell 执行：

```powershell
irm https://cdn.deepseek.com/api-docs/codex-deepseek-setup-en.ps1 | iex
```

Mac 或 Linux 用户在终端执行：

```bash
bash <(curl -fsSL https://cdn.deepseek.com/api-docs/codex-deepseek-setup.sh)
```

脚本启动后会让你选择要用的模型，目前 DeepSeek-V4-Flash 已经可以直接选了，输入「1」就好：

![](https://pic.yupi.icu/1/image-20260803114529569.png)

首次运行时，它还会让你输入 API Key：

![](https://pic.yupi.icu/1/image-20260803114842807.png)

然后按回车键执行，唰唰唰，脚本就帮我们把 DeepSeek 接入到 Codex 中了。

![](https://pic.yupi.icu/1/image-20260803114928055.png)

多说几句，这个脚本会自动完成下面几件事：

1. 把你现有的 Codex 配置备份到 `~/.codex/backup-deepseek/` 目录，随时可以恢复
2. 生成一个 `~/.codex/models.json` 文件，告诉 Codex 关于 DeepSeek 模型的元数据（上下文窗口大小、支持的推理等级等等）
3. 修改 `~/.codex/config.toml`，写入 DeepSeek 的接口配置，你之前设置的 MCP 服务器和项目配置都会保留
4. 自动校验配置语法，如果有错就中止，不会损坏你的文件

配置完成后，重新打开 Codex，启动横幅如果显示 `deepseek-v4-flash`，就说明配好了：

![](https://pic.yupi.icu/1/image-20260803120531949.png)

如果你用的是 ChatGPT 桌面 APP 或者 Codex 的 VS Code 插件，不用单独配置，直接打开就能用 DeepSeek 模型了，因为它们和 CLI 版共用同一套配置文件。

![](https://pic.yupi.icu/1/image-20260803141956962.png)

想切换回官方模型的话，重新跑一遍脚本，在菜单里选恢复选项就行。

![](https://pic.yupi.icu/1/image-20260803115518337.png)



### 方法 2、手动编辑配置文件

如果你不想跑脚本，也可以自己手动修改配置文件，两步就能搞定。

第一步，在电脑的用户目录下找到 `.codex` 文件夹（Mac / Linux 路径是 `~/.codex/`，Windows 是 `%USERPROFILE%\.codex\`），创建一个 `models.json` 文件，文件中的内容可以到 [DeepSeek 官方文档](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/codex/) 复制。

![](https://pic.yupi.icu/1/image-20260803113859064.png)

这个文件的作用是告诉 Codex 关于 DeepSeek 模型的各种参数信息，比如支持 100 万 token 的上下文窗口、支持 low / high / max 三档推理深度等。

第二步，在同一个目录下编辑 `config.toml` 文件，添加下面这段配置：

```toml
model = "deepseek-v4-flash"
model_provider = "deepseek"
preferred_auth_method = "apikey"
forced_login_method = "api"
model_reasoning_effort = "high"
model_catalog_json = "~/.codex/models.json"

[model_providers.deepseek]
name = "deepseek"
base_url = "https://api.deepseek.com/"
wire_api = "responses"
experimental_bearer_token = "<你的 DeepSeek API Key>"
```

把其中的 `experimental_bearer_token` 换成你自己的 API Key 就行。

这里的关键是 `wire_api = "responses"`，它告诉 Codex 用 Responses API 协议跟 DeepSeek 通信，而 DeepSeek-V4-Flash 原生就支持这个协议，所以能直接跑通。

保存文件后重新打开 Codex，就能用 DeepSeek-V4-Flash 了。



### 方法 3、用 CC Switch 做协议转换

前面两种方法之所以这么省事，全靠 DeepSeek 官方做了原生适配。但如果你想接的是智谱 GLM、Kimi、MiniMax 这些还不支持 Responses API 的模型，只改 `base_url` 大概率会翻车，直接给你报一个 404 错误。

问题出在协议上。Codex 用的是 OpenAI 的 **Responses API**，而大多数国内模型走的是 **Chat Completions API**，这俩压根儿不是一套东西。就好比你打电话，号码是拨通了，可你说中文、对方只懂法语，照样聊不到一块儿去。

![](https://pic.yupi.icu/1/01_%E7%94%B5%E8%AF%9D%E6%AF%94%E5%96%BB-%E5%8D%8F%E8%AE%AE%E6%A0%BC%E5%BC%8F%E4%B8%8D%E9%80%9A_compressed_v2.png)

所以这种情况下，关键在于中间得有个「翻译」，把 Codex 发出的请求转换成模型能听懂的格式。

好在 CC Switch 已经把这件事给我们办妥了。它的「本地路由」功能会在你电脑上起一个轻量级的代理服务，请求的流转过程是这样的：

```plain
Codex → CC Switch → 大模型 → CC Switch → Codex
```

整个转发对 Codex 完全透明，它自己还以为在访问 OpenAI 官方接口呢。这样既保留了 Codex 的原汁原味体验，又能用上便宜的国内模型，岂不美哉？

![](https://pic.yupi.icu/1/02_CC_Switch%E6%9C%AC%E5%9C%B0%E8%B7%AF%E7%94%B1%E5%8D%8F%E8%AE%AE%E8%BD%AC%E6%8D%A2%E6%B5%81%E7%A8%8B_compressed_v3.png)

下面还是用 DeepSeek 来演示这个流程（截图现成），你换成其他供应商的操作步骤完全一样。



#### 1、在 CC Switch 里添加供应商

打开 CC Switch，在顶部应用栏切换到 **Codex**，点击「添加供应商」：

![](https://pic.yupi.icu/1/1780311605982-1c994d40-c7f4-48df-817c-bed2b6c31fab.png)

在预设里搜索并选择 **DeepSeek**，跟前面给 Claude Code 配置时的步骤一样：

![](https://pic.yupi.icu/1/1780311659008-be813d0f-d761-435f-a7cb-a74899214864.png)

填入你的 DeepSeek API Key，其余字段保持默认：

![](https://pic.yupi.icu/1/1780311678381-5d244f5c-6943-43ba-a6c3-a2a29960d907.png)

跟 Claude Code 一样，模型这些 CC Switch 都已经预设好了，其他字段不用动。

要特别注意的是，这一步的关键是得 **开启「本地路由映射」**，然后点右下角的「添加」按钮保存就好。

![](https://pic.yupi.icu/1/1780311713574-2317e9a2-ece4-4c4d-a188-4d6735402c6a.png)

回到主页后，选择启用 DeepSeek：

![](https://pic.yupi.icu/1/1780311910051-908552fe-d168-4df1-9a08-3c9e6f1e4d0d.png)

但是到目前为止，我们还不能在 Codex 中正常使用 DeepSeek，对话会直接报前面说的 404 错误：

![](https://pic.yupi.icu/1/1780311879234-642050c1-2333-4d8e-866d-1abc9197d7dd.png)



#### 2、开启本地路由

切换到 DeepSeek 后，系统会提示你开启路由。点击左上角的「设置」按钮进入设置页面：

![](https://pic.yupi.icu/1/1780311968017-bf4e43f6-736e-4ba7-9ce9-5a9ca2763910.png)

找到路由设置菜单，把本地路由的「路由总开关」打开，然后选择启用 Codex 路由：

![](https://pic.yupi.icu/1/1780312030888-cdfafb55-0a3f-4fd7-bdc5-785eb3cd9bc8.png)

这一步就是让 CC Switch 的本地代理正式接管 Codex 的请求，前面说的协议转换全靠它。

大功告成！

重新打开 Codex CLI，就能看到已经切换为 DeepSeek 模型了。同样让它自报家门，能正常对话就说明切换成功了：

![](https://pic.yupi.icu/1/1780312108872-2c760023-290a-4e7a-b8d0-be36159900da.png)

你会发现，AI 嘴上还说自己是基于 GPT-5 的 Codex。这是因为 Codex 会给模型注入一套自己的系统提示词，让它默认以为自己是官方模型，但实际干活的底层已经换成 DeepSeek 了。

再来试试 Codex 桌面 APP。因为它和命令行版共用 `~/.codex` 这套配置，CC Switch 切换之后直接打开就能用，同样问它是什么模型，底层跑的也是 DeepSeek：

![](https://pic.yupi.icu/1/1780312248394-f117f7bb-1372-4a73-91e7-2b6c171cef6f.png)

如果想改回来，反向操作即可，把路由关掉、再启用默认配置就行：

![](https://pic.yupi.icu/1/1780312343473-b43668a4-cb80-4f60-8fce-e7aa93e7753e.png)

怎么样，是不是比想象中简单多了？

换成其他供应商也是这套流程，在 CC Switch 里选对应的预设（没有预设就自定义一个），把人家给你的专属 Base URL 和 API Key 填进去，别忘了开启本地路由。



## 给纯文本模型加上看图能力

配置完成之后，还有一个坑要提醒你。

DeepSeek-V4-Flash 虽然 Agent 能力很强，但它是纯文本模型，不能理解图片。如果你在 Codex 或 Claude Code 中让它分析一张截图、看一下 UI 界面长什么样，它是做不到的。

不过这个问题也有现成的解决方案，就是给你的 AI 编程工具装一个 **Vision Skill**，用另一个多模态视觉模型来帮它看图。

比如这个通用的 [多模态视觉识别 Skill](https://github.com/asuojun/claude-vision-skill)，专门就是为 DeepSeek 这类没有视觉能力的模型设计的。而且由于 Skill 是通用标准，Codex 和 Claude Code 等各种 AI 编程工具都能安装使用。

你需要先准备一个支持图片理解的视觉模型，比如通义千问的 Qwen3.8-Max，并且到对应的大模型平台获取到 API Key。

![](https://pic.yupi.icu/1/image-20260803154236012.png)

然后直接在 AI 编程工具中发一段提示词，让 AI 帮你完成 Skill 的安装和配置：

```plain
全局安装 Vision Skill（https://github.com/asuojun/claude-vision-skill），按照 README 的说明进行配置。
- 视觉模型用通义千问的 qwen3.8-max
- API Key 为 <改为你自己的 API Key>
```

![](https://pic.yupi.icu/1/image-20260803155552049.png)

安装好之后，当 AI 遇到需要看图的任务时，Vision Skill 就会自动把图片发给视觉模型，让它把图片内容转成文字描述，再交给 DeepSeek 继续推理。

![](https://pic.yupi.icu/1/image-20260803155836402.png)

如果你平时写代码不怎么需要 AI 看图，这一步可以先跳过，等用到的时候再装也来得及。想深入了解 Skills 的用法，可以阅读本教程编程工具板块「工具实战」目录中的《Agent Skills：通用 AI 技能库》。



## 写在最后

这篇文章手把手带大家把国内大模型（以 DeepSeek 为例）接入了 Claude Code 和 Codex。

给 Codex 接 DeepSeek 首选官方一键脚本，因为 DeepSeek 原生支持了 Responses API，不需要任何协议转换；如果要接的模型不支持这个协议，就用 CC Switch 的本地路由来做转换。给 Claude Code 接模型更简单，因为国内主流模型基本都提供了兼容 Anthropic 协议的接口，用 CC Switch 点几下就好。

看到这里你会发现，现在学 AI 编程的门槛真的低到不能再低了。百万 token 上下文、Agent 能力拉满、价格还便宜到离谱，成本可能只是官方订阅的零头。

**工具和模型，都不该成为你学习路上的拦路虎。**

所以别再用「我没账号、用不起」当借口了，配好环境，赶紧上手把工具用起来才是。至于该选哪个模型来干哪种活，可以阅读本教程编程工具板块中的《AI 模型选择指南》；如果你想搞清楚 Claude Code 为什么会封号、有哪些替代方案，可以阅读本目录中的《Claude Code 封号机制和应对方案》。


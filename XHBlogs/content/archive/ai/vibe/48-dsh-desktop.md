---
title: "DeepSeek Harness 桌面端上手教程"
summary: "双击安装、免配环境，带你用上 DeepSeek 官方打包的 DSH 桌面客户端。"
order: 48
level: "深入"
tags: ["Vibe Coding", "DeepSeek Harness", "AI 编程工具"]
updated: "2026-10-22"
readingTime: 6
author: "程序员鱼皮"
source: "https://github.com/liyupi/ai-guide"
---

大家好，我是程序员鱼皮。

DeepSeek 开源的 Harness 工具 DSH，核心理念是「一切皆插件」，发布没多久 GitHub 就冲到了 20 万 Star。

![](/imgs/eceef0e558e2ccff.png)

不过官方发布的时候只提供了命令行和 Web 两种使用方式，你得先装好 Node.js 环境，在终端里敲命令启动，再用浏览器访问。对很多小白来说，这个门槛就不太友好了。

所以 Harness 才开源没几天，社区开发者就做出了好几个桌面客户端。其中最火的是 dsh-desktop，拿了 2 万多个 Star，支持 Windows 和 macOS，双击安装就能用。

![](/imgs/a4dd9d3db4383b62.png)

有意思的是，DeepSeek 官方自己其实也在做桌面端。我在官方 deepseek-harness 仓库里发现多了一个 `apps/desktop` 目录，是一个基于 Electron 的桌面应用，包名叫 `@deepseek-ai/dsh-desktop`，连打包签名、自动更新的流程都写好了。

![](/imgs/1cbbf594f1e34a67.png)

DeepSeek 没有发过任何公告、推文和博客，就是悄悄把代码合进了 master 分支，很符合它低调的风格。

![](/imgs/8ec8e1518599c1a0.jpg)

一开始官方没放安装包，想体验只能自己拉源码编译。又过了十来天，网友在 DeepSeek 自家的下载域名里扒出了桌面端的更新清单和安装包，现在已经可以双击安装了。

这篇文章我会带你安装 DSH 桌面端、看看它比网页版多了什么，再聊聊官方版和社区版到底有什么区别。如果你还没用过 DeepSeek Harness，建议先阅读本教程编程工具板块 DeepSeek Harness 目录中的《DeepSeek Harness 保姆级入门教程》。



## 一、下载安装包

先说清楚，这个安装包不是官方正式发布的，**截止到 2026 年 9 月 25 日，DeepSeek 官方还没有发任何上线公告。**

不过有网友专门验过签名，安装包用的是「杭州深度求索人工智能」公司主体的苹果开发者证书，并且通过了苹果官方公证，基本可以确定是 DeepSeek 自己打的包。

我整理时的最新版本是 `0.1.7-rc.2`，下载地址如下：

- Windows 版本：https://download.deepseek.com/dsh-desk/bin/win-x64/deepseek-harness-0.1.7-rc.2-win-x64.exe
- Mac 版本（Apple 芯片）：https://download.deepseek.com/dsh-desk/bin/mac-arm64/deepseek-harness-0.1.7-rc.2-mac-arm64.dmg

目前只有这两个版本，用 Intel 芯片 Mac 和 Linux 的朋友暂时还得再等等。

安装包都不小，Windows 版接近 300 MB，Mac 版将近 370 MB。因为官方把 Node.js、pnpm 和 Python 运行环境全都打包进去了，你的电脑上不用提前装任何环境。

选择对应系统的版本下载，双击安装就能打开了。



### 怎么获取最新版本？

桌面端还在快速迭代，上面的链接过段时间可能就不是最新的了。那怎么实时拿到最新的下载地址呢？

很简单，直接问 AI。我让 DeepSeek Harness 用最简单直接的方式告诉我怎么获取：

![](/imgs/900bcf6a25bcbe4a.png)

原理是这样的：桌面端内置了自动更新功能，每隔 10 分钟左右就会去官方服务器读取一份更新清单文件，清单里写着最新的版本号和安装包地址。所以我们不用猜文件名，直接打开这份清单看一眼就行：

- Windows 版更新清单：https://download.deepseek.com/dsh-desk/feeds/win-x64/nightly.yml
- Mac 版更新清单：https://download.deepseek.com/dsh-desk/feeds/mac-arm64/nightly-mac.yml

注意，Mac 版清单里给的是 `.zip` 格式的自动更新包，把链接结尾的 `.zip` 换成 `.dmg`，就是平时双击安装的安装包了。



## 二、桌面端体验

第一眼看上去，桌面端的界面跟 DeepSeek Harness 网页版几乎一模一样。

![](/imgs/070c6e6073346ef2.png)

我翻了下仓库里 `apps/desktop` 目录的源码，桌面端是在完整的 DSH 网页应用外面套了一层 Electron 壳，界面用的是同一套前端代码。Electron 是一个专门开发跨平台桌面应用的开源框架，VS Code、Discord 这些知名应用都是用它做的。

套壳的好处是，桌面端的对话记录和配置都跟网页版互通。两者读写的是电脑上同一个 `~/.dsh` 数据目录，我之前在网页版里创建的工作区、聊过的会话都还在，配置好的第三方模型也能直接切换使用。

![](/imgs/fc60012710b1817f.png)



### 内置插件和第三方插件

新版本的 DSH 在左侧菜单栏加了一个「插件」入口，里面内置了 7 个官方插件，包括智能体团队、自动授权审查、语音输入、终端、Agent 循环、子智能体和网页搜索。比如开启智能体团队插件后，就能让多个 Agent 分工协作，还带有共享的任务看板。

![](/imgs/f9ff866aad51a359.png)

除了官方插件，你还可以点击右上角的「添加插件」，直接输入 GitHub 仓库地址来安装第三方插件。

比如我装了一个社区开发者做的 dsh-web 全家桶插件，它把一大批网页端的增强插件聚合到了一起：

![](/imgs/8f07341cbd887f31.png)

装好之后，聊天背景换成了二次元插画，右下角还多了一个看板娘。你喜欢么？

![](/imgs/19fffdf6f9926d7a.png)

更多好玩的插件，可以阅读本教程编程工具板块 DeepSeek Harness 目录中的《DeepSeek Harness 精选插件推荐》。



### 登录 DeepSeek 账号

桌面端和网页版在 UI 上还是有点差别的。最明显的是左下角可以直接登录 DeepSeek 账号，查看充值余额、查询用量，还能直接充值。

![](/imgs/3816a4219969c9b0.png)

登录账号之后，模型列表里会多出一组「DeepSeek 账号」模型，可以直接用账号里的余额跑任务，不用再去开放平台单独申请 API Key 了。对新手来说，这一步能省掉不少麻烦。

![](/imgs/96042b3c719813a1.png)

能看出来，DeepSeek 这次是真的打算好好做桌面端了。账号登录、首次使用引导、自动更新这些面向普通用户的功能都安排上了，安装包还用公司证书做了签名。



### 目前的不足

不过我不建议大家现在就把 DSH 桌面端当作主力工具，尝尝鲜就好。

一方面官方还没有发布上线公告；另一方面作为实验版本，它的功能还不全，体验也比较一般。比如我在 Mac 上就没办法缩放字体，翻了下源码才发现 macOS 的菜单里确实没有放大和缩小这两项。

早期我自己从源码编译的 `0.1.5-rc.2` 版本还有更离谱的 Bug：整个应用内无法粘贴内容，DeepSeek 的 API Key 是我一个字母一个字母手输进去的……

如果你追求稳定，日常还是建议用网页版，或者社区更成熟的 dsh-desktop。



## 三、从源码编译（备选）

如果你用的是暂时没有安装包的系统，或者想体验仓库里最新的代码，也可以自己从源码编译。前提是电脑上已经装好了 Node.js（需要 22.19 以上版本），没装过的话去 [Node 官网](https://nodejs.org) 下载最新的 LTS 稳定版本。

当然，更简单的方式是直接让 AI 帮你安装和运行。想自己动手的话，打开终端依次执行下面 3 步。

1）安装 pnpm 包管理器

DeepSeek Harness 用 pnpm 来管理依赖，先全局安装一下：

```bash
npm install -g pnpm@11.7.0
```

2）克隆仓库并安装依赖

把整个 Harness 仓库拉到本地，然后安装依赖。这个仓库很大，依赖也多，安装过程可能会有点儿慢：

```bash
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
```

3）启动桌面端开发模式

```bash
pnpm run dev:desktop
```

这一步会先编译整个项目，再自动下载 Electron。过一会儿就能看到一个 Electron 窗口弹出来，在设置里填好 API Key 就能开始用了。

![](/imgs/027a68f58bc4a804.png)

我试了一下，跟 AI 对话、文件操作、工具调用、插件管理这些功能都是正常的。

![](/imgs/fcf4fd0f0d1d977c.png)



## 四、官方版和社区版有什么区别？

可能有人会问，社区已经有那么多桌面端了，官方下场做这个有什么不一样？

我觉得最大的区别在于 **安全性**。

社区做的桌面端，不管是用 Electron 还是 Tauri，基本思路都差不多：在你本地起一个 HTTP 服务，再用桌面窗口去访问 `localhost` 上的这个服务。简单来说，就是给 Web 页面套了一个桌面壳子。

这种方式简单，但有一个潜在问题：你的电脑上开了一个端口。如果你在公司内网或者公共 Wi-Fi 下使用，理论上同一网络下的其他设备是有可能访问到这个端口的。

而官方桌面端完全没有开任何端口。它用了一套自定义的 `dsh-app://` 协议来传输数据，Electron 主进程和 DSH 后端之间通过进程管道直接通信，请求和响应走的是分帧字节流，生命周期控制则走 Node IPC。也就是说，从网络层面来看，你的 Harness 对外界是完全不可见的。

![安全性对比](/imgs/4503c13a84154796.png)

另一个区别是 **版本绑定**。

官方把 Electron 壳、DSH 后端、Node.js 运行时绑成了一个整体，一起签名、一起发布、一起更新。社区版通常是桌面壳和 DSH 后端分开更新的，偶尔会出现版本不匹配导致的奇怪问题。官方自己维护更新通道，后续升级也会更及时、更让人放心。



## 写在最后

从源码里悄悄出现 `apps/desktop` 目录，到网友扒出签名安装包，DeepSeek Harness 桌面端只用了十来天就从「要自己编译」变成了「双击就能装」。

虽然现在还是实验版本，但账号登录、自动更新、零端口的通信设计都说明官方是认真在做的。等正式发布之后，DSH 对小白的门槛会再降一大截。

如果你想让 DSH 7x24 小时运行、在手机上也能随时查看 AI 的进度，可以阅读本教程编程工具板块 DeepSeek Harness 目录中的《DeepSeek Harness 服务器部署教程》，跟桌面端正好是两种互补的用法。

赶紧装上试试吧，臻品大家共赏，踩坑鱼皮先来~


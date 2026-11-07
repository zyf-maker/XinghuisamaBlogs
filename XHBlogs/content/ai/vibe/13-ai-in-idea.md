---
title: "在 IDEA 中使用 AI 编程"
summary: "虽然 AI 编程工具快速发展，但很多同学和团队仍然在使用 JetBrains IDEA 进行开发。好消息是，IDEA 同样可以接入 AI 编程能力，下面介绍几种方式。"
order: 13
level: "进阶"
tags: ["Vibe Coding", "工具实战", "AI 编程工具"]
updated: "2026-06-04"
readingTime: 1
author: "程序员鱼皮"
source: "https://github.com/liyupi/ai-guide"
---

## 1、在终端里运行 AI

打开 IDEA 内置的终端，你会发现终端右侧直接就有 Claude Code、Codex 等 AI 工具的快捷入口（前提是你已经提前安装好了这些工具）。除此之外，JetBrains 自家的 Junie CLI 也可以在终端里运行。

![](/imgs/6620059ddcb9db71.png)

本质上就是帮你在终端里执行了运行这些工具的命令，跟你在外部终端用没什么区别，只是不用来回切窗口了。



## 2、安装第三方 AI 插件

虽然现在独立的 AI 编程工具发展很快，但 JetBrains Marketplace 上的 AI 插件也一直在更新迭代，选择很多。

![](/imgs/2201ee5aa8b1eb14.png)

我个人比较推荐通义灵码和 Cline。通义灵码对国内用户比较友好，注册简单，免费额度也够用。Cline 的 Agent 能力强，适合喜欢折腾的同学。

![](/imgs/73bf64295e7bc005.png)



## 3、通过 ACP 协议接入 AI

2026 年 1 月，JetBrains 和 Zed 联合推出了 ACP（Agent Client Protocol）协议。

简单来说，ACP 就是一套标准规范，让各种 AI 编程 Agent 能够统一接入不同的 IDE，不管是 Claude Code 还是 Gemini CLI，只要支持 ACP 协议，就能在 JetBrains IDE 里一键安装使用。

![](/imgs/c918eba4501a493a.png)

他们还配套上线了一个 ACP Agent Registry，目前已经有 40 多个 AI Agent 可以一键安装。

操作也很简单，先安装好 JetBrains 官方提供的 AI Assistant 插件：

![](/imgs/4aa915208fdfce78.png)

然后打开 AI Chat 面板，第一次使用的话你可以免费试用：

![](/imgs/a24d3d877fb192b8.png)

或者点击「Add ACP Agents」自主添加智能体，点击后就能看到 Claude Agent、Gemini CLI、Codex、Cursor、GitHub Copilot、Cline 等一堆 Agent，选择你需要的，点击安装就行了。

![](/imgs/0a92475bd6da16a0.png)

通过自主选择 Agent，不需要 JetBrains AI 订阅，装完就能用，美滋滋~

![](/imgs/0c14bd0c3ec7be0b.png)

另外提一下，Claude Code 在 JetBrains 里还有一个 [专属插件](https://plugins.jetbrains.com/plugin/27310-claude-code-beta-) 叫 `Claude Code [Beta]`，比直接在终端跑多了几个功能，比如在 IDE 里直接看 diff 预览、自动把你选中的代码发给 Claude、自动共享 IDE 的报错信息等。不过目前这个插件还是以终端为基础的包装，整体体验不如 VS Code 的插件成熟，聊胜于无吧。

![](/imgs/b99f6619671ee953.png)



## 写在最后

以上就是在 IDEA 中接入 AI 编程能力的几种方式，从终端直接运行、到安装插件、再到通过 ACP 协议统一接入，总有一种适合你。

学会了这些内容，你就能在不离开 IDEA 的前提下享受到 AI 编程带来的效率提升。

如果你想继续学习更多 AI 编程工具和实战技巧，可以阅读本教程编程工具板块的其他文章。


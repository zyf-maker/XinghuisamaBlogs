---
title: "Anthropic 官方 - 人机协作团队方法"
summary: "把 AI 当成同事，Anthropic 官方总结的 4 条协作经验"
order: 15
level: "进阶"
tags: ["经验技巧", "转载", "AI"]
updated: "2026-09-02"
readingTime: 8
author: "程序员鱼皮"
source: "https://github.com/liyupi/ai-guide"
---

> 本文转载自 **[程序员鱼皮 · AI 指南](https://github.com/liyupi/ai-guide)**，原文标题《Anthropic 官方 - 人机协作团队方法》，作者 程序员鱼皮。
> 内容按 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可使用，本站仅作非商业性收录与排版适配。

大家好，我是程序员鱼皮。

赌一包辣条，你肯定听说过 OPC 一人公司的概念吧？

一个人，驾驭几十个 AI，效率贼啦高，年收入破百万，想想都很威风~

![](https://pic.yupi.icu/1/image-20260824131103066.png)

虽然实际上很少有人能做到这种程度，但不可否认的一点是，很多公司都开始引入 AI 员工了。

**毕竟 AI 无所不能，关键是它完全不会累、效率还贼高。**

![](https://pic.yupi.icu/1/deepseek%20%E5%A4%A7%E8%82%A5%E9%B1%BC%E8%A1%A8%E6%83%85%E5%8C%85%E4%B8%AD.jpeg)

Claude 背后的公司 Anthropic 正在探索一种跟 AI 协作的新方式，他们把 Claude 拉进工作群，只要艾特它 `@Claude`，就可以让它按照要求去干活。

![](https://pic.yupi.icu/hackdeacon/pic02.jpg?imageSlim)

听起来很简单，但他们在实际运用 AI 的过程中，也遇到了不少痛点。

比如 AI 很死板，没有写进协作文档的内容、没发在工作群里的消息，它一件也不知道。

你不给它分工，它也不知道自己该做什么。。

好在，Anthropic 官方发布了一篇文章 [《打造高效的人机协作团队》](https://claude.com/blog/building-effective-human-agent-teams)，分享了一套如何让 AI 高效地融入团队的方法。

> 原文地址：[https://claude.com/blog/building-effective-human-agent-teams](https://claude.com/blog/building-effective-human-agent-teams)

![](https://pic.yupi.icu/1/image-20260824130929774.png)

如果 AI 真的成了团队成员，我们要怎么和它一起工作呢？

这篇文章我就来给你答案。


## 如何带好一个 AI 同事
Anthropic 分享了 4 条非常有价值的经验，一起来学习一下。


### 一、写清楚协作信息

一般来说，AI 能读取到的，只有「写下来的东西」。

AI 主要通过文档、工作群聊天记录、会议纪要、代码等等可检索的信息来理解团队。

所以很多人类团队口头达成共识的默认信息，其实 AI 完全不清楚。

比如，我们开会时说过的话、员工之间的私聊、某位老员工脑子里的业务背景，AI 是看不到的。

如果项目已经暂停了，但这个信息只出现在几个人的私聊里，AI 就可能继续按照旧计划推进。

所以对 AI 来说：**没写下来的事情，就等于没发生。**

Anthropic 的做法，是让重要信息尽量同步到公开的工作空间里。项目进展、任务负责人、关键决定，都应该记录在团队能够访问和检索的地方。

以前我们写文档，可能只是为了方便团队查阅。现在，文档还承担了另一个作用：**给 AI 同事提供工作背景**。

![](https://pic.yupi.icu/hackdeacon/pic04.jpg?imageSlim)

其实，这个建议不仅仅是和 AI 协作时才适用。平时大家在团队中工作也是一样的，有什么想法、决定，及时同步出来，别憋在心里，这样很多不必要的误会和返工，根本不会发生。

那我们要怎么写清楚协作信息，给 AI 同事快速提供背景信息呢？

可以从 4 个方面入手：会议纪要、聊天记录总结、企业知识库、项目配置文件。

![](https://pic.yupi.icu/hackdeacon/pic03.jpg?imageSlim)


#### 1、会议纪要

这一步其实就是把会议记录的音频转成文字，再由 AI 把文字总结成有结构、可读性强的文档。

听起来好像有点麻烦，但不用慌，已经有现成的产品供我们使用。

如果公司在用类似企业微信、腾讯会议、钉钉、飞书等协作产品，可以通过在线会议转写功能，快速生成会议纪要。

![腾讯会议自动文字转写](https://pic.yupi.icu/hackdeacon/2b6c107ba5dd5ff4f9daea24209d7edc.png?imageSlim)

这时候就有人要问了：那线下会议怎么办？

也不用慌，飞书等产品支持上传录音或视频，快速生成会议纪要。在开会时，我们只需要顺手录制音频就好。

![](https://pic.yupi.icu/hackdeacon/aba112c037de243fcc55cb4202f0a9d3.png?imageSlim)

得到生成的《会议纪要文档》后，可以直接丢给我们的 AI 同事，让它快速了解背景信息。


#### 2、聊天记录总结

我们团队日常用企业微信比较多（主要是方便联系客户），它有一个「聊天记录快速总结」功能，而且能导出为文档。

这样我们就可以快速总结团队的需求、进度，甚至可以一键出周报。

![企业微信聊天记录总结](https://pic.yupi.icu/hackdeacon/4817c2899542397133656f5e95e3d7ca.png?imageSlim)

如果工作用的是微信沟通，但目前微信还没有「一键总结聊天记录」的功能，怎么办？

办法总比困难多，我们可以把聊天记录合并转发给「腾讯元宝」，让它帮我们总结。

具体操作步骤如下：

![](https://pic.yupi.icu/hackdeacon/b0cd9e79403bdc97ce10529615cc34fe.jpg?imageSlim)

很简单吧？


#### 3、企业知识库

如果公司已经在用企业知识库，像飞书、语雀、Notion 等产品，那么你已经有了 AI 团队的「工作记忆」，只差同步给 AI 同事，让它能够检索到。

这里分享一个语雀的实用功能，可以根据你一周、一个月内的工作文档，让 AI 推理总结，并可以导出文档为 AI 友好的 Markdown 格式。

![语雀](https://pic.yupi.icu/hackdeacon/e59aa5cb1d0085307d4a5d8f307a54df.png?imageSlim)


#### 4、项目配置文件

企业知识库是团队成员共同的资源，真正开发项目时需要一份专属于项目的「知识库」。用来说明项目是干嘛的、用什么技术栈、有哪些约定、目标是什么。

像 `CLAUDE.md`、`AGENTS.md` 等文件其实就是专属于项目的知识库，同时这些文件生来就是给 AI 读的，可以把它们跟随项目一起提交到 GitHub，让团队和 AI 一起共享。

![](https://pic.yupi.icu/1/image-20260824132638290.png)


### 二、给 AI 和人类分好工

AI 和每位团队成员要共享同一个工作空间，并且都要有明确的分工，应该共同维护同一套产物，避免重复工作。

举个常见的例子：在之前的传统模式下，团队要统计一份「本月业务用户数据」，你让自己的 AI 出了一个版本，隔壁同事也让他的 AI 出了一个版本。

结果你俩用的标准还不一样，你按「注册量」统计，隔壁同事按「激活量」来算，活干重复了、数字也对不上。

![](https://pic.yupi.icu/hackdeacon/pic05.jpg?imageSlim)

这就是没有明确分工、没有统一工作空间的结果，各个同事之间养着自己的 AI，不仅重复干活，还污染了产出的上下文。

当然，如果有多个 AI Agent，每个 Agent 也要有自己的角色和分工，并给它配齐相应的工具与访问权限。

做数据分析的 Agent，需要用到访问数据库的 MCP。比如 DBHub 这个 MCP，在 Claude Code 的官方文档里，就是用它来演示连接 PostgreSQL 数据库。

![](https://pic.yupi.icu/hackdeacon/20260813101117851.png?imageSlim)

![](https://pic.yupi.icu/hackdeacon/20260813102906814.png?imageSlim)

负责测试的 Agent 需要调用测试工具，比如比较常见的 Playwright MCP、Browser Use，它们能让 AI 自己打开网页、点击、输入、截图、还能自己看控制台的报错。

对于负责文档整理的 Agent，需要有访问相关资料的权限。

Anthropic 还用了一个很巧妙的方法，用 `Skills` 技能文件来定义每个 Agent 所担任的角色，就类似于之前很多人在提示词开头写「你是一位专业的软件工程师」。

`Skills` 技能文件需要包含 AI 的角色定位、干活的步骤和规范、以及所拥有的权限等内容。

![Skill files](https://pic.yupi.icu/hackdeacon/code.png?imageSlim)

这样一来，如果你想要复刻一个同款的 Agent 也很方便，把 Skills 文件提供给另一个 AI 就好了。此时的 `Skills` 技能文件就像是「离职交接文档」。

![](https://pic.yupi.icu/hackdeacon/pic06.jpg?imageSlim)

定义清晰的角色与职责，才能让 AI 和团队达成共识，从而帮助团队走向成功。

我们团队最近在研究一个「知乎回答工作流」，目的是让 AI 自动帮我从知乎搜集高质量的问题，并结合这套 AI 编程教程知识库中的内容，来撰写问题的回答。

根据多 Agent 协作的思路，我可以让一个 Agent 专心负责搜集问题，一个 Agent 专门根据知识库撰写答案。

![](https://pic.yupi.icu/hackdeacon/pic07.jpg?imageSlim)

刚好最近知乎官方发布了 Zhihu CLI，这是知乎数据开放平台面向 AI Agent 提供的官方命令行工具。

只需要给你的 AI 发送一段提示词，就能安装并配置知乎 CLI：
```
请下载安装 zhihu-cli skill 并完成初始化配置 https://developer-cdn.zhihu.com/zhihu-cli/releases/stable/skill/zhihu-cli-skill.zip
```

![](https://pic.yupi.icu/hackdeacon/20260812220455886.png?imageSlim)

然后到 [知乎平台](https://developer.zhihu.com/profile) 生成一个密钥用于认证知乎 CLI，生成的密钥也是直接发送给 AI，就能完成配置。

> 指路：https://developer.zhihu.com/profile

安装并配置好后，创建一个搜集问题的 Agent Skill：

![](https://pic.yupi.icu/hackdeacon/20260812222212989.png?imageSlim)

OK，搜索问题的能力就成功实现了。不过返回的问题相关数据其实是错误的，需要后续再修复，这里我先继续创建撰写回答的 Agent。

![](https://pic.yupi.icu/hackdeacon/20260812223503102.png?imageSlim)

把完整的需求、以及我自己的写作风格指南提供给 AI：

![](https://pic.yupi.icu/hackdeacon/20260812224346461.png?imageSlim)

这里的附加文件就是文章前面提到的，要给 AI 提供足够的背景信息，它才能理解清楚你的需求。

![](https://pic.yupi.icu/hackdeacon/20260812225210530.png?imageSlim)

开发完编写回答的 Agent 后，AI 还自己跑了一遍工作流验证。

虽然生成的回答效果还达不到我的预期，可能还要再让它加一个去 AI 味的 Skill 之类的，但这个工作流已经可以完全跑通了，能省下不少时间。

看到这里，你应该理解了什么是 Skills、以及什么是多 Agent 协作了，大家可以尝试根据自己的日常工作，来搭建专属于你的 AI 同事。


### 三、让 AI 主动

Anthropic 发现，很多时候，AI 只会完成被分配到的任务，而不会主动提出新的项目建议和方向，缺少大局观。

想让它主动提建议、主动发现问题，得先告诉它团队宏大、长远的大目标，这个目标称之为「北极星」。

这里的北极星必须由人类设定，一般是公司的使命和业务目标，然后明确告诉团队里的 AI。

![](https://pic.yupi.icu/hackdeacon/pic10.jpg?imageSlim)

官方在文章中说：一个团队把「让新用户更容易上手我们的产品」定成北极星，AI 发现产品的报错提示写得太难懂，很容易把用户劝退。它主动提了文案修改意见后，第二周新用户明显增多了。

举个例子，比如新用户使用邮箱时，原报错提示写的是："Invalid input in field 'email'。Please verify the format. Try again."

新用户看完一头雾水：哪里不对？格式是什么样？

AI 主动提出修改建议，改为：邮箱格式不对，请检查是否包含 @ 符号，比如 yupi@codefather.cn

![](https://pic.yupi.icu/hackdeacon/pic09.jpg?imageSlim)

所以说，AI 有时候不够主动，并不是它不聪明，而是你没有告诉它团队的终极目标是啥。

公司层面的目标，可以写进企业文化文档；产品层面的目标，可以写进项目配置文件。


### 四、和 AI 慢慢建立信任
很多团队最容易犯的错是：**一开始就完全相信 AI**。

AI 做得快，不代表做得对。

所以 Anthropic 建议不要一开始就把重要工作全部交给 AI，而是先从简单、容易检查的任务开始。

然后根据 AI 干活的结果是否可靠，来循序渐进地授予 AI 更多的操作权限。

Anthropic 的工程师已经可以让 AI 独立处理 500 个 Bug 修复任务。但这个结果不是一蹴而就的，经过了很长时间的调试、反馈和改进。

我觉得这就像一位新同事加入团队时，前期需要先评估他的工作能力，慢慢培养、磨合工作默契。

举个例子，我们团队搭建了一个 AI 资讯推送机器人，能够定时在交流群中推送 AI 热点：

![](https://pic.yupi.icu/hackdeacon/20260813111951884.png?imageSlim)

其实在一开始，我们是先同步草稿给人工检查编辑，再确定发布。

> AI 每天自动搜集资讯 → 整理成草稿 → 同步给人工检查 → 编辑确认 → 发布

![](https://pic.yupi.icu/hackdeacon/pic08.jpg?imageSlim)

在前期还是需要人类来把关，AI 只负责干活，不负责决定。

后来我们做了些优化，才完全把主动权交给 AI。人工检查了一段时间，发现它的筛选质量稳定了、翻车率降低了，才开始让它直接自己推送，不用每条都等人工过目。

前面刚刚学习了 Anthropic 提供的经验，其实还可以进一步优化自动推送热点的工作，告诉 AI 这个项目的目标。 

比如让 AI 不再只是整理资讯，而是告诉它：我们推送的目标是「帮读者每天用最短时间，抓住 AI 行业最重要的变化」。


## 写在最后

看到这儿你会发现：Anthropic 分享的四条经验，其实不都是老生常谈的东西吗？？？

没错，清晰的目标、明确的角色与分工、扎实的文档、统一的质量标准，这些点本来就是好团队该有的，是大家共同需要做到的事情。

所以我觉得，如果你本身就有一个健康的团队，接入 AI 同事可以快速地为工作提效，反之 AI 同事只会给原本混乱的团队 **雪上加霜**！

![](https://pic.yupi.icu/hackdeacon/pic11.jpg?imageSlim)

**AI 不会拯救一个混乱的团队，它只会把团队原本的样子无限放大。**

所以我的建议是，先别急着给团队塞一堆 AI，而是先把文档、分工和目标这几件事捋顺，再一个个把 AI 同事请进来。

如果你想了解更多团队场景下的 AI 协作实践，可以阅读本板块中的《11 Vibe Coding 团队协作技巧》；想知道怎么给 AI 写好项目配置文件，可以阅读本教程编程工具板块「Claude Code」目录中的《用好 CLAUDE.md 让 AI 编程效率翻倍》。

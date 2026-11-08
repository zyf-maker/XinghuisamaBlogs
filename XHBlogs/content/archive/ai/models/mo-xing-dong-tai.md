---
title: "模型动态"
summary: "AI 模型的最新发布、测评和行业动态"
order: 1
level: "进阶"
tags: ["模型动态"]
updated: "2026-10-22"
readingTime: 2
author: "程序员鱼皮"
source: "https://github.com/liyupi/ai-guide"
---

你好，我是程序员鱼皮。

AI 模型更新的速度越来越快了，每隔几周就有新模型发布，让人眼花缭乱。

这个板块专门记录重要的模型发布事件和实测对比，帮你在第一时间了解新模型的能力边界，做出合理的选择。

目前收录的内容分为四类。

一类是单模型深度实测，比如 DeepSeek V4 Pro、Claude Opus 5 和 Kimi K3 都是用同一套 7 个项目的提示词跑出来的，方便横向对比；GPT-6 Astra 用了 4 个项目案例，小米 MiMo 也是 4 个；DeepSeek V4.1 Flash 1017 同样是 4 个，其中城市生成器直接用上一版的原题做了新旧对比；Claude Fable 5.1、GLM-5.3-Flash、Gemini 3.8 Flash 和 Gemini 4 Argon 用了 3 个项目案例，其中 Gemini 4 Argon 还复用了 Opus 5 和 Kimi K3 测过的题目，并且专门检查了 AI 自测报告的真实性。

第二类是横向对比，比如 Claude Opus 5.5 双模型横评（同一天发布的 Opus 5.5 和 GPT-6 Sol 正面对决）、GLM-5.3 三模型横评（在 DeepSeek Harness 统一环境下对比 GLM-5.3、Kimi K3 和 DeepSeek V4 Pro）、GPT-5.6 三模型横评、Opus 4.8 四模型横评、Claude Fable 5 对比 Opus 4.8 和 GPT-5.5、DeepSeek V4.1 Flash 对比 V4 Pro 和 GLM-5.3-Flash，都是用同一段提示词让几个模型同时开发项目，直接看谁的完成度更高。

第三类是专项能力实测，比如《DeepSeek V4 Flash Vision 视觉能力实测 - 8 个场景》专门测了视觉模型的识图能力，《GPT Images 2.5 生图能力实测 - 10 个创意玩法》测的是 AI 生图，《Jev 决策模型实测 - 从入门到实战》测的是一种不能聊天、只做判断的新型模型。多模态是 2026 年模型竞争的重点方向，模型能自己截图看效果，AI 编程的体验会有质的变化，这类文章可以帮你判断哪些模型已经「开眼」了。

第四类是发布解读，比如《GPT-6 Astra 发布解读 - 跑分、官方案例和争议》会带你看清官方跑分、官方展示案例和第三方评测之间的差距。这类文章的重点不是教你用，而是教你怎么读懂一次模型发布：哪些数字是厂商自己挑的、哪些是第三方跑的、单价不涨为什么账单还会涨。

这里的内容偏「新闻 + 测评」性质，不需要按顺序学习，有新模型发布时来看看就好。如果你想系统了解如何选择 AI 模型，建议先阅读本教程编程工具板块中的《AI 模型选择指南》。

如果你觉得天天被新模型轰炸、根本跟不上，还可以打开我用 AI 做的 [AI 大模型世界](https://www.bilibili.com/toy/ai-model-world) 网站，免费、免登录。它把全世界几百个主流模型做成了一个个像素小人，能力条、价格、上下文长度一眼就能看出来；还有从 2023 年到现在的模型发布时间线，以及综合智力、性价比、编程能力等几十个排行榜，数据全部来自 Epoch AI、LiveBench 等第三方评测，每 12 小时自动更新一次。网站代码也 [完全开源](https://github.com/liyupi/ai-model-world)，想自己部署一份也没问题。

![AI 大模型世界](/imgs/3e9e966f2c43cd2f.png)

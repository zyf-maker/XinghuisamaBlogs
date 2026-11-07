---
title: "LangChain + LangGraph - AI 修图智能体项目实战"
summary: "这是一套以 AI Agent 驱动图片编辑为核心的全栈项目教程，基于 Python 3.13 + FastAPI + LangChain + LangGraph + React 19 + Konva 开发。你只需要用一句话描述修图需求，AI"
order: 40
level: "进阶"
tags: ["项目实战", "转载", "AI"]
updated: "2026-09-28"
readingTime: 6
author: "程序员鱼皮"
source: "https://github.com/liyupi/ai-guide"
---

> 本文转载自 **[程序员鱼皮 · AI 指南](https://github.com/liyupi/ai-guide)**，原文标题《LangChain + LangGraph - AI 修图智能体项目实战》，作者 程序员鱼皮。
> 内容按 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可使用，本站仅作非商业性收录与排版适配。

这是一套以 AI Agent 驱动图片编辑为核心的全栈项目教程，基于 Python 3.13 + FastAPI + LangChain + LangGraph + React 19 + Konva 开发。你只需要用一句话描述修图需求，AI 就能自动规划修图步骤、调用 21 种编辑工具帮你完成专业级修图，从文生图到抠图调色、区域编辑、图层拆分，全部自动搞定。

项目代码免费开源：https://github.com/yuyuanweb/ai-retouch-agent

完整视频教程 + 文字教程：https://www.codefather.cn/course/2099386518517915649

![](https://pic.yupi.icu/pine/image-20260901150955859.png)


## 项目介绍

修图这件事，对大多数人来说门槛不低。专业软件的按钮一大堆，想把背景换成海滩、把人像调亮一点，都得先搞清楚用哪个工具、调哪个参数。

现在的 AI 生图模型已经很强了，但光有模型还不够。一次完整的修图往往是好几步连在一起的：先抠图、再换背景、再调色，每一步都依赖上一步的结果。如果只是把需求丢给一个模型，很难保证每一步都可控、可撤销、可以人工把关。

这个项目就是冲着这个痛点来的。用户在对话框里用自然语言描述需求，AI Agent 会把它拆解成一份多步计划，标好每一步的依赖关系，用户确认之后再按顺序调用编辑工具执行。整个过程既有 AI 的自动化，又保留了专业画布编辑器的精细控制。

更重要的是，这套 Agent + 工具注册 + 异步执行的架构可以套用到任何需要 AI 驱动的业务场景中，比如 AI 设计工具、AI 视频编辑、AI 数据处理等等。


## 项目功能演示

1）AI 文生图，输入提示词就能出图

在创作页输入一段提示词，AI 自动生成四张候选图，以四宫格的形式展示给你挑选。整个生成过程通过 SSE 实时推送进度，不用傻等。选中满意的图片后，直接进入编辑器开始修图。

![](https://pic.yupi.icu/pine/image-20260901142856191.png)

2）专业级画布编辑器

基于 react-konva 搭建了一个真正能用的图片编辑器，支持画布缩放平移、图层文档管理、撤销重做，还有前后对比滑杆，一拖就能看到修图前后的效果。

![](https://pic.yupi.icu/pine/image-20260831153713493.png)

3）自然语言驱动修图

这是整个项目最酷的能力。你在对话框里输入一句话，比如「把背景换成海滩」、「提高亮度和饱和度」，AI Agent 会自动分析你的需求，规划出修图步骤，然后一步步调用工具帮你执行。不需要你去找按钮、调参数，说一句话就搞定。

![](https://pic.yupi.icu/pine/image-20260831155606100.png)

4）21 种编辑工具，覆盖主流修图场景

项目内置了丰富的编辑工具：rembg 一键抠图、11 参数调色（亮度、对比度、饱和度、色温等）、裁剪 / 翻转 / 缩放 / 旋转 / 移动等画布变换、AI 换背景、AI 扩图、超分辨率放大。手动点击工具栏可以用，Agent 也能自动调用，UI 和 Agent 共享同一套工具注册表。

![](https://pic.yupi.icu/pine/image-20260831160551720.png)

5）智能区域选择

集成了 SAM（Segment Anything Model）点选能力，鼠标点一下就能精准选中画面中的任意物体，还支持笔刷涂抹模式自由绘制选区。首次点击计算 embedding，后续点击只跑 decoder，响应速度是毫秒级的。

![](https://pic.yupi.icu/pine/Google%20Chrome%202026-08-31%2016.09.05.png)

6）局部精细编辑

有了选区之后，可以做局部消除和局部替换。局部消除会用 AI inpainting 把选区内的东西抹掉，自动填补背景；局部替换可以用一句提示词描述你想换成什么，只改选区内容，其他地方纹丝不动。

![](https://pic.yupi.icu/pine/image-20260901141549744.png)

7）图层拆分和独立操作

一键把图片按语义拆成主体层和背景层，还可以选择拆出 OCR 文字层。拆完之后每个图层可以独立缩放、调色、移动，互不影响。还支持点选画面中的任意物体，把它提升为独立图层，背景自动修复。图层数据用 JSONB 持久化，切换图片再切回来，图层结构不会丢。

![](https://pic.yupi.icu/pine/image-20260831161340074.png)

8）多步计划和人机协作

当修图需求比较复杂时，AI 会输出一份包含多个步骤的结构化 JSON 计划，每一步标注了依赖关系。服务端会做工具存在性校验、参数合法性检查、依赖补全和环检测，然后按拓扑排序确定执行顺序。用户可以在计划卡片上确认执行、单步重试或取消后续，AI 干活你把关。

![](https://pic.yupi.icu/pine/image-20260831161657975.png)


## 功能梳理

该项目功能完整，涵盖文生图、画布编辑器、AI Agent 对话、编辑工具、区域选择、局部编辑、图层系统、多步计划、营销图、批量处理 10 大模块，覆盖了一个真实 AI 修图产品的核心业务场景。

![](https://pic.yupi.icu/pine/feature-modules.png)


## 项目收获

本项目选题新颖，紧跟 AI Agent 和 AIGC 趋势，以专业级 AI 修图工具为目标。区别于增删改查的烂大街项目，你将从零搭建一个集画布编辑器、AI Agent、异步任务、图层系统于一体的全栈应用，技术深度和广度都远超普通项目。

每一期文字教程都详细讲解了设计决策和实现细节，让你不只会做，还知道为什么这么做。

从这个项目中你可以学到：

- 如何基于 FastAPI + SQLAlchemy 搭建 Python 全栈项目，实现 JWT Cookie 认证？
- 如何设计 Provider 抽象层，一行配置切换 Mock 和真实 AI 模型？
- 如何用 ARQ 异步队列 + Redis Pub/Sub + SSE 实现实时进度推送？
- 如何用 react-konva 搭建专业级图片编辑器，支持图层文档和视口变换？
- 如何用 LangChain 接入规划模型，再用 LangGraph 构建 AI Agent，让大模型规划修图步骤？
- 如何设计统一的工具注册表，一处定义同时服务 UI 和 Agent？
- 如何用 SAM 模型实现智能点选，一键选中任意物体？
- 如何做图层拆分，把一张图拆成主体、背景和文字三个独立图层？
- 如何实现多步计划的服务端校验、拓扑排序和人机协作？
- 如何用 Docker 多阶段构建和 compose profile 实现一条命令部署？

这个项目特别适合：

- 想系统学习 AI Agent 开发，把「大模型 + 工具调用」落地成完整产品的同学
- 想实战 LangChain、LangGraph 等主流 AI 应用开发框架的同学
- 想补齐 Python 后端 + React 前端全栈能力，尤其是想做复杂前端交互（画布编辑器）的同学
- 想找一个技术含量高、可以直接当毕设和简历项目的同学


## 核心业务流程

项目的核心业务流程非常清晰，能够帮你理清 AI Agent 项目的开发思路。

一次 AI 修图请求的完整链路是：用户输入自然语言指令 → Agent 规划修图步骤 → 服务端校验和拓扑排序 → 用户确认计划 → 按依赖自动执行工具 → 结果推送前端 → 画布实时更新。

![](https://pic.yupi.icu/pine/business-flow.png)

这条链路上最值得琢磨的是「计划先确认再执行」这个设计。单步的简单操作可以直接执行，多步计划则先交给用户确认，把人工干预放在成本最低的位置，既保证了效率，又避免 AI 一口气跑偏把图改坏。


## 技术选型

本项目以 Python FastAPI + LangChain / LangGraph + React + Konva 为核心，前后端分离，综合运用了多种主流的 AI 应用开发和图像处理技术。

![](https://pic.yupi.icu/1/1788272498423-003621d7-9129-4b82-ac5d-3f67665bca14.png)

后端：Python 3.13、FastAPI + Pydantic v2、SQLAlchemy 2 + Alembic、asyncpg + Uvicorn、bcrypt + JWT Cookie 认证

前端和画布：React 19 + TypeScript、Vite + Tailwind CSS v4、react-konva 画布引擎、Zustand 视口状态、TanStack Query 数据管理

Agent 和模型：LangGraph 状态图、LangChain Core + ChatOpenAI、qwen-plus 负责规划、百炼 DashScope 图像模型、Provider 抽象层、21 个 ToolSpec 统一注册

图像处理：rembg 本地抠图、SAM vit_b 量化版、Pillow 色彩管线、OpenCV 图像操作、ONNX Runtime + RapidOCR

异步和通信：ARQ 异步任务队列、Redis 队列和 Pub/Sub、SSE 实时进度推送、独立 Worker 进程

数据和部署：PostgreSQL（业务数据 / JSONB）、Redis、MinIO 图片资源存储、Docker 多阶段构建 + Docker Compose


## 架构设计

本项目采用前后端分离 + 异步 Worker 架构。前端是 React 19 + Konva 的单页应用，后端是 Python FastAPI 服务，通过 REST API 和 SSE 通信。

后端内部按照路由层、业务服务层、数据访问层分层，AI 生图、抠图、扩图等耗时任务通过 ARQ 异步队列提交到独立 Worker 执行，结果通过 Redis Pub/Sub + SSE 实时推送给前端。LangChain 负责接入规划模型和绑定工具签名，LangGraph 负责 Agent 的计划编排，ToolRegistry 统一管理所有编辑工具的元信息和执行逻辑。数据分别落在 PostgreSQL（业务数据）、Redis（缓存和消息）和 MinIO（图片资源）中。

![](https://pic.yupi.icu/pine/system-architecture.png)

完整视频教程 + 文字教程：https://www.codefather.cn/course/2099386518517915649

如果你想先学一个难度稍低的同类项目，可以看看「AI 实用工具」分类中的《LangChain + LangGraph - AI 智能 PPT 生成器项目实战》，两个项目的技术栈相近，一个偏工作流编排，一个偏 Agent 规划和工具调用，搭配学习效果更好。


## 推荐资源

1）鱼皮 AI 导航网站：[AI 资源大全、最新 AI 资讯、免费 AI 教程](https://ai.codefather.cn)

2）编程导航学习圈：[学习路线、编程教程、实战项目、求职宝典、交流答疑](https://www.codefather.cn)

3）程序员面试八股文：[实习/校招/社招高频考点、企业真题解析](https://www.mianshiya.com)

4）程序员写简历神器：[专业模板、丰富例句、直通面试](https://www.laoyujianli.com)

5）1 对 1 模拟面试：[实习/校招/社招面试拿 Offer 必备](https://ai.mianshiya.com)

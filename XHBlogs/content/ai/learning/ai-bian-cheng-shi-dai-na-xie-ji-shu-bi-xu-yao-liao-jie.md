---
title: "AI 编程时代，哪些技术必须要了解？"
summary: "用 AI 编程做项目的时候，你一定会遇到各种没见过的技术名词。"
order: 13
level: "入门"
tags: ["编程学习", "转载", "AI"]
updated: "2026-09-02"
readingTime: 9
author: "程序员鱼皮"
source: "https://github.com/liyupi/ai-guide"
---

> 本文转载自 **[程序员鱼皮 · AI 指南](https://github.com/liyupi/ai-guide)**，原文标题《AI 编程时代，哪些技术必须要了解？》，作者 程序员鱼皮。
> 内容按 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可使用，本站仅作非商业性收录与排版适配。

用 AI 编程做项目的时候，你一定会遇到各种没见过的技术名词。

比如 AI 跟你说：用 Next.js 搭前端，Prisma 连数据库，部署到 Vercel。

你一脸问号：这都是啥？算了，让 AI 干就完了，我不用管……

![](https://pic.yupi.icu/1/%E5%95%A5%E5%95%A5%E5%95%A5%E8%A1%A8%E6%83%85%E5%8C%85.jpg)

但问题是，如果你对这些技术完全没概念，跟 AI 沟通时就说不清楚自己想要什么，AI 选错了方向你也判断不出来。

我之前做项目就遇到过，AI 给我用了一个很冷门的数据库方案，我不了解就直接用了，结果后面想加功能的时候发现生态太差，很多东西没有现成方案，只能推翻重来。

所以我写了这篇文章，帮你把 AI 编程时代最核心的技术梳理一遍。你不需要深入学习每一个技术，但至少要知道它们是干嘛的？什么时候该用？做技术选型的时候心里有数就行。


## 一、编程语言

首先，你必须了解 AI 编程中最常用的 2 套编程语言。

#### 1、JavaScript / TypeScript

JavaScript 最早是给浏览器用的语言，负责网页上的各种交互效果。后来 Node.js 的出现让它也能跑在服务器上写后端，于是 JS 变成了前后端通吃的全栈语言。

![](https://pic.yupi.icu/1/article-images/tech-stack/01_JavaScript%E7%BC%96%E7%A8%8B%E8%AF%AD%E8%A8%80_compressed_v3.png)

TypeScript 是 JavaScript 的增强版，给每个变量都标注了类型，写代码时编辑器就能帮你检查错误。

现在 AI 生成代码默认就会优先用 TypeScript，因为有了类型信息后，AI 理解代码的上下文更准确，生成的代码质量也更高。

如果你想做网站相关的项目，JS/TS 几乎是绑定的。

![](https://pic.yupi.icu/1/article-images/tech-stack/02_TypeScript%E7%B1%BB%E5%9E%8B%E7%B3%BB%E7%BB%9F%E5%A2%9E%E5%BC%BA_compressed_v3.png)


#### 2、Python

Python 的语法接近英语，读起来像伪代码一样直观，所以很多零基础的同学第一门语言就学 Python。

它在 AI、机器学习、数据分析、自动化脚本这些领域有统治级的地位，大量 AI 框架和工具都是用 Python 写的。

如果你要做 AI 应用开发、数据处理、爬虫这些事情，Python 是非常好的选择。

![](https://pic.yupi.icu/1/article-images/tech-stack/03_Python%E7%BC%96%E7%A8%8B%E8%AF%AD%E8%A8%80_compressed_v2.png)

简单来说，做网站选 JS / TS，做 AI 应用选 Python，两者都会就更好了。


## 二、前端三件套

前端就是用户能看到和交互的部分，也就是你在浏览器里看到的一切。

AI 编程中，前端是最容易搞定的部分，因为改完代码刷新一下就能看到效果。

传统的前端三件套是 HTML + CSS + JavaScript，但是 AI 时代，我愿称 React + Next.js + Tailwind CSS 为全新的前端三件套，因为这是 AI 编程工具最爱用的前端组合。

#### 1、React

React 是 Meta 开发的前端框架，核心理念是把页面拆分成一个个可复用的组件。

比如一个按钮是一个组件，一个导航栏也是一个组件，像搭积木一样拼起来就是一个完整的页面。

根据开发者调查数据，React 的使用率超过了 80%，是全球最主流的前端框架。AI 训练数据中 React 代码量最大，所以 AI 生成 React 代码的质量也是最高的。我们团队的产品基本都是用 React 开发的。

![](https://pic.yupi.icu/1/article-images/tech-stack/07_React%E5%89%8D%E7%AB%AF%E6%A1%86%E6%9E%B6_compressed_v1.png)


#### 2、Next.js

Next.js 是基于 React 的全栈框架，由 Vercel 公司开发。

它的厉害之处在于不仅能写前端页面，还能在同一个项目里写后端接口，真正实现了一个项目搞定前后端。而且它支持服务端渲染，对搜索引擎收录非常友好。

很多 AI 零代码平台生成的项目默认就是 Next.js。你在 app 目录下创建一个文件夹就自动对应一个页面路径，后端接口写在 app/api 目录下，前后端代码能放在同一个项目里，但逻辑上是分开的。

而且能够轻松部署到 Vercel 平台，只需要把代码推到 GitHub，连接仓库后每次推送自动构建上线，非常省事。

![](https://pic.yupi.icu/1/article-images/tech-stack/09_Next.js%E5%85%A8%E6%A0%88%E6%A1%86%E6%9E%B6_compressed_v1.png)


#### 3、Tailwind CSS

Tailwind CSS 是一个原子化的样式框架。

传统开发网页是先写 HTML 结构，然后再写 CSS 文件定义样式。而 Tailwind 的思路不同，它把常用样式都变成了一个个小 class 名，直接在 HTML 里拼就行。比如想让一个元素水平垂直居中，写 `flex justify-center items-center` 就搞定了。

刚开始你可能会觉得 class 名一大串有点丑，但用习惯之后真的回不去了。

AI 生成的前端代码默认就很喜欢用 Tailwind，因为它不需要额外维护 CSS 文件，而且每个样式类名只有一种写法，AI 生成的准确率特别高。

![](https://pic.yupi.icu/1/article-images/tech-stack/11_Tailwind_CSS%E5%8E%9F%E5%AD%90%E5%8C%96%E6%A1%86%E6%9E%B6_compressed_v1.png)

不过你可能也注意到了，AI 生成的页面经常是蓝紫色渐变的配色，就是因为 Tailwind 的默认色板有蓝色和紫色，AI 用起来特别顺手，导致做出来的东西千篇一律…… 想避免这个问题，记得在提示词里明确你想要的配色风格。

React + Next.js + Tailwind CSS 这三个技术为什么总是绑定出现呢？

因为 AI 模型是从互联网上的大量代码中学习的，React、Next.js、Tailwind CSS 恰好是这几年开源项目用得最多的组合，AI 对它们最熟悉，生成的代码最靠谱。这形成了一个飞轮效应，AI 越推荐，用的人越多，训练数据越多，AI 就更推荐。


## 三、后端框架

后端是用户看不见的部分，负责处理业务逻辑、存储数据、管理用户身份。

当你在网站上点击「注册」按钮，前端会把你填的信息发给后端，后端负责校验数据、存到数据库、返回结果。

如果你用 Next.js，其实后端接口可以直接写在同一个项目里，不需要单独搞一个后端项目。但如果你需要更独立、更强大的后端服务，就得选一个后端框架了。


#### 1、Spring Boot

Spring Boot 是 Java 后端开发的标配框架，国内大部分企业的后端系统都是用它写的。

它的理念是「约定大于配置」，帮你把各种繁琐的配置都简化了，开箱即用。

如果你学 AI 编程的同时也想提升后端就业竞争力，Spring Boot 是必学的。而且 Spring AI 框架的推出，让 Java 程序员也能很方便地开发 AI 应用了。

![](https://pic.yupi.icu/1/article-images/tech-stack/24_Spring_Boot%E6%A1%86%E6%9E%B6_compressed_v2.png)


#### 2、FastAPI

FastAPI 是 Python 生态中增长最快的后端框架，目前已经有接近 40% 的 Python 开发者在使用。它天生支持异步和类型检查，写完接口文档就自动生成了，不需要额外维护。

FastAPI 最爽的一点是，启动后访问 /docs 路径就能看到一个交互式的接口文档页面，可以直接在浏览器里测试接口。如果你用 AI 生成 Python 后端项目，大概率就是 FastAPI。

![](https://pic.yupi.icu/1/article-images/tech-stack/25_FastAPI%E6%A1%86%E6%9E%B6_compressed_v1.png)

简单来说，Java 方向选 Spring Boot，Python 方向选 FastAPI，想省事用 Next.js 的 API Routes 前后端一把梭。


## 四、数据存储

网站上的用户信息、文章内容、订单记录等需要多次查询的数据，都需要存在数据库里。

#### 1、MySQL / PostgreSQL

关系型数据库就像 Excel 表格一样，数据有行有列，数据之间可以建立关联。

![](https://pic.yupi.icu/1/1769046133583-18e6b389-b3b7-4c56-b5f3-7482a3897bd3.png)

MySQL 和 PostgreSQL 是最主流的两个关系型数据库，都是开源免费的。

![](https://pic.yupi.icu/1/1769046291097-2dea6cb4-76e5-45ef-8799-e187324eee46.png)

MySQL 在国内用得最广，遇到问题基本都能搜到解决方案。PostgreSQL 功能更强大，支持 JSON 数据类型、地理信息、全文搜索，还能通过 pgvector 插件支持向量搜索，适合开发 AI 应用，很多海外的 SaaS 产品和 AI 项目都在用 PostgreSQL。

顺带一提，在代码中操作数据库一般不直接写 SQL 语句，而是通过 ORM 工具来操作。比如 Node.js 项目常用 Prisma，Java 项目常用 MyBatis-Plus，Python 项目常用 SQLAlchemy。有了 ORM，你在代码里操作数据就像操作普通对象一样方便。


#### 2、Supabase

如果你不想自己维护数据库，还有一个省事的选择。

Supabase 是一个开源的后端即服务平台，底层基于 PostgreSQL，提供了数据库、用户认证、文件存储、实时订阅等功能。

注册个账号就能用，免费额度够个人项目折腾了。

你可以跟 AI 说「用 Supabase 做数据库和认证」，AI 就能帮你生成完整的集成代码。

![](https://pic.yupi.icu/1/article-images/tech-stack/36_Supabase%E5%90%8E%E7%AB%AF%E6%9C%8D%E5%8A%A1_compressed_v1.png)


## 五、部署上线

代码写完了，怎么让全世界的人都能访问到你的网站呢？

这就需要把代码部署到服务器上。

#### 1、Vercel

最省事的方式是用 Vercel 平台。

它是 Next.js 框架背后的公司，对 Next.js 项目的支持最好。你只需要把代码推送到 GitHub，Vercel 会自动帮你构建和部署，几分钟就能上线，还自带 HTTPS 和 CDN 加速。免费额度对个人项目完全够用，非常适合部署 AI 编程做出来的小项目。

![](https://pic.yupi.icu/1/article-images/tech-stack/44_Vercel%E9%83%A8%E7%BD%B2%E5%B9%B3%E5%8F%B0_compressed_v3.png)


#### 2、Linux 云服务器

不过 Vercel 的服务器在海外，而且它更适合前端和全栈项目。如果你要做面向国内用户的商业产品，或者后端是一个独立的 Java / Python 服务，就需要自己买 Linux 云服务器了。

国内的云服务商可以选阿里云、腾讯云等等，新用户一般有免费试用或大额优惠，买一台 2 核 4G 的配置就够个人项目用了。

服务器的操作系统基本都是 Linux，所以了解一些基本的 Linux 命令是有必要的，比如 cd 进目录、ls 看文件这些。不过大部分操作都可以让 AI 帮你生成命令，不用死记。


#### 3、Docker

Docker 可以把你的代码、运行环境、依赖库全部打包成一个「容器」，不管在什么机器上运行，效果都一样。

以前经常会遇到「在自己电脑上能跑，到服务器上就报错」的情况，用了 Docker 就不存在这个问题了。

把应用封装为 Docker 很简单，让 AI 帮你写 Dockerfile 配置文件就行，不需要自己记 Docker 文件的写法。

![](https://pic.yupi.icu/1/article-images/tech-stack/46_Docker%E5%AE%B9%E5%99%A8%E5%8C%96_compressed_v2.png)

如果你的项目涉及多个服务，比如前端 + 后端 + 数据库，还可以用 docker-compose 一键启动所有服务。


## 六、代码管理

#### 1、Git

用 AI 编程做项目时，建议用 Git 来管理代码。比如让 AI 改代码之前先提交一版，万一改崩了还能回退。这就像游戏里的存档，打 Boss 之前先存个档，死了能重来。

你不需要死记 Git 命令，因为 AI 可以帮你执行 Git 操作。但几个核心概念要知道，比如 commit 是保存一个版本，branch 是创建一个分支，push 是把代码推送到远程仓库。

![](https://pic.yupi.icu/1/07_Git%E7%89%88%E6%9C%AC%E7%AE%A1%E7%90%86%E5%90%8E%E6%82%94%E8%8D%AF_compressed_v3.png)


#### 2、GitHub

GitHub 是全球最大的代码托管平台，也是曾经大家玩梗说的程序员社交平台。上面有海量的开源项目，是编程学习资源的宝库。

你可以把代码推送到 GitHub 上，便于备份、分享和协作。前面说的 Vercel 部署，就是连接你的 GitHub 仓库来实现自动上线的。

![](https://pic.yupi.icu/1/article-images/tech-stack/71_GitHub%E4%BB%A3%E7%A0%81%E6%89%98%E7%AE%A1%E5%B9%B3%E5%8F%B0_compressed_v1.png)


## 七、调用 AI 大模型

借助 AI 编程 + AI 大模型服务，你可以轻松开发出自己的 AI 应用，比如做一个 AI 客服、AI 写作助手、AI 数据分析工具。

要做这些事情，首先得知道怎么在代码里调用大模型。


#### 1、OpenAI API

OpenAI API 是目前最通用的大模型调用方式。

OpenAI 提供了一套标准的 API，你可以用它来实现对话、文本生成、代码生成、图片生成等功能。可以在代码中安装对应语言的 SDK，然后用 API Key 初始化客户端后就能调用模型了。

很多其他 AI 服务商的 API 也兼容 OpenAI 的接口格式，比如 DeepSeek、通义千问等。所以学会调用 OpenAI API 后，切换到其他模型也很方便。

![](https://pic.yupi.icu/1/article-images/tech-stack/72_OpenAI_API%E8%B0%83%E7%94%A8GPT%E5%A4%A7%E6%A8%A1%E5%9E%8B_compressed_v2.png)

如果你想在一个项目中灵活切换不同的模型，还可以用 OpenRouter 这样的统一接口服务，一个 Key 就能调用上百种大模型。


#### 2、LangChain

学会基本的调用大模型之后，如果你想做更复杂的 AI 应用，比如让 AI 自主使用工具、编排多步骤的工作流，就需要 AI 应用开发框架了。

LangChain 可以说是最流行的 AI 应用开发框架，你可以把它理解成 AI 应用开发的「积木」，它内置了大量的集成组件，比如对接各种大模型、向量数据库、工具调用等。对于快速搭建 AI 应用原型来说，LangChain 能帮你省下大量的样板代码。

不过有一点要注意，LangChain 更适合原型开发和复杂的多模型编排场景。如果你的应用比较简单，直接用 OpenAI 或者各家大模型的 SDK 会更轻量。

![](https://pic.yupi.icu/1/article-images/tech-stack/76_LangChain_AI%E5%BA%94%E7%94%A8%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6_compressed_v1.png)


## 八、向量数据库和 RAG

做 AI 应用时，经常遇到一个问题：大模型的知识是有截止日期的，而且缺乏你自己的私有知识。

比如你想让 AI 基于公司内部文档回答员工的提问，直接问大模型肯定答不上来。

这时候就需要 RAG 技术了。

RAG 的全称是 Retrieval-Augmented Generation 检索增强生成，核心思想就是 **先搜再答**，让大模型在回答之前先去搜一遍相关资料，再基于搜到的知识来组织答案。就跟开卷考试差不多，遇到不会的先翻翻书。

![](https://pic.yupi.icu/1/1776332850706-68cb05fe-7022-445c-9c3d-944f74f48dee.png)

但怎么搜到相关的资料呢？

如果用关键词匹配，很容易出现问题和文档里的用词不一致的情况。所以需要用到 **向量** 的概念。

简单来说，向量就是把一段文字用一串数字来表示，让计算机可以比较语义上的相似度。负责把文字转成向量的模型叫 Embedding 模型，存储这些向量并支持快速相似度搜索的数据库就是向量数据库。

![](https://pic.yupi.icu/1/1769046928023-6111fd54-4926-4ef0-b67b-e10f3af57d52.png)

RAG 的做法其实就 2 步。

1）把你的文档切成小块，转成向量存进向量数据库。

2）用户提问时，把问题也转成向量，去向量库里搜最相似的几个文档块，再把这些块连同用户问题一起交给大模型生成回答。

![](https://pic.yupi.icu/1/1776650476421-3bfb3c26-575d-4cc4-9538-f74a4589b42d.png)

在 AI 时代，向量数据库的应用越来越广，做 AI 知识库、语义搜索、推荐系统都需要用到它。主流的向量数据库有 Milvus、Chroma、Qdrant 这些，PostgreSQL 也可以通过 pgvector 插件支持向量搜索。

![](https://pic.yupi.icu/1/1769047066536-0ef08cd3-b86b-4c97-9016-7add32a710b8.png)

如果想深入了解 RAG 的各种进阶方案，我之前写过一篇 [从 Naive RAG 到 Agentic RAG 的全景科普文章](https://mp.weixin.qq.com/s/r_HwTfIyShV5Ke0UY6b-4g)，感兴趣可以去看看。


## 写在最后

本文是 AI 编程技术栈的精简版介绍。鱼皮的[《小白都能学的 AI 编程实战》视频课](https://ai.codefather.cn/course/2087008226460565505)中配套了完整版的《AI 编程技术栈速查手册》，覆盖了更多技术的详细讲解，遇到新技术一查就懂。

我把 AI 编程时代最核心的技术给大家梳理了一遍，从编程语言到前后端框架，从数据库到部署上线，从 AI 大模型调用到 RAG 知识库。

有了 AI 辅助编程，很多技术你不需要深入学习，只要知道它是什么、什么时候该用，AI 就能帮你搞定具体的代码实现。

**技术是为产品服务的，别为了学技术而学技术。**

不过如果你想找程序员相关的工作，还是要系统学习这些技术的，但也不用面面俱到。实际做项目的过程中，遇到什么学什么，用到什么查什么，加油！

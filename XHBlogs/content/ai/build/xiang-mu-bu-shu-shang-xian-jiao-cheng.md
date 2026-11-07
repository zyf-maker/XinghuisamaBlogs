---
title: "项目部署上线教程"
summary: "在前面的文章中，我们学习了如何开发各种项目。但是如果项目只能在本地运行，那就太可惜了。这篇文章，我会教你如何把项目部署到互联网上，让全世界的人都能访问。"
order: 7
level: "进阶"
tags: ["项目实战"]
updated: "2026-07-01"
readingTime: 15
author: "程序员鱼皮"
source: "https://github.com/liyupi/ai-guide"
---

你好，我是程序员鱼皮。

在前面的文章中，我们学习了如何开发各种项目。但是如果项目只能在本地运行，那就太可惜了。这篇文章，我会教你如何把项目部署到互联网上，让全世界的人都能访问。

需要先说明的是，如果你用的是 Bolt.new、Lovable、美团 NoCode、百度秒哒等 AI 零代码平台，它们一般自带了部署功能，点击发布按钮就能上线，非常方便。但是如果你想更灵活地部署，比如使用自己的域名、选择不同的服务器、或者部署更复杂的全栈项目，那就需要学习更多的部署方式。

下面我会介绍多种部署方式，从最新的 AI 自动部署、到最流行的 Vercel 一键部署、再到专业的服务器部署。你可以根据自己的项目类型和需求，选择合适的部署方式。


## 一、部署方式概览

在开始之前，先了解一下有哪些部署方式。

对于前端项目（静态网页、单页应用等），最简单的方式是使用托管平台，比如 Vercel、GitHub Pages、EdgeOne Pages 等。这些平台提供免费的托管服务，只需要上传代码，就能自动部署并生成访问链接。

对于全栈项目（包含前端和后端），可以选择容器化部署（Docker）、云服务器部署（阿里云、腾讯云等）、或者 Serverless 部署。这些方式相对复杂一些，但功能更强大。

下面我会详细介绍每种部署方式。


## 二、让 AI 自动部署（最新最酷）

先来分享一个最新的技巧，让 AI 帮你部署网站。

以前，我们开发一个网站，需要先提出需求、再设计方案、再写代码开发、最后部署上线。我们都知道 AI 现在写代码越来越溜了，慢慢地替代了我们程序员写代码的部分工作；但其实，AI 的能力不止于此，利用 MCP，它甚至可以直接帮我们把网站部署上线！

好好好，合着我只要提个一句话需求，写代码和部署都不用我来干了，让我退化是吧？

![](/imgs/60544e614ec2bc32.png)

下面就来带大家实操一下，让 AI 帮我生成并部署个人博客网站。


### 方式一、EdgeOne Pages MCP 自动部署

#### 准备工具

我们需要用到的工具包括：

- Cursor：AI 编程工具，负责调用 AI 生成代码
- EdgeOne Pages MCP：能够将网站快速部署到 CDN 并生成公开访问链接的服务

什么是 EdgeOne Pages MCP 呢？拆解一下这几个单词。

EdgeOne 是腾讯云提供的 CDN 加速服务，可以把用户的网站资源缓存到离用户最近的边缘节点，提升网站性能。

![](/imgs/1231df55773acef1.png)

EdgeOne Pages 是基于这个 CDN 的网站部署服务，可以让你轻松地将网站部署到 CDN 上，并且得到公开访问地址，完全不需要自己搭建服务器。

![](/imgs/7e71b07b403b8aae.png)

MCP 则是目前很火的模型上下文协议，让 AI 模型能够轻松地使用各种工具来增强能力，完成更复杂的任务。

![](/imgs/4bca8f0fe30ca23b.png)

EdgeOne Pages MCP 的作用就显而易见了 —— 给 AI 提供网站部署工具，这也是一个比较热门的 MCP。

![](/imgs/78dcc8906947d1fe.png)


#### 快速实战

1）开通 Pages 服务

首先到 [EdgeOne 控制台](https://console.cloud.tencent.com/edgeone/pages) 开通 Pages 服务：

![](/imgs/1905dd7ae05fff6e.png)

开通服务后，默认进入了项目管理页面，我们先不急着创建项目：

![](/imgs/0371646908744c35.png)

由于等下要通过 MCP 完成网站部署，所以要先获取 API Token，作为调用服务的凭证：

![](/imgs/b8aae9cbc66cddce.png)


2）配置 MCP

新建一个项目文件夹 `yupi-blog`，在 Cursor 中打开，然后进入设置，添加 MCP 服务：

![](/imgs/0348278f10ccf360.png)

将这段配置复制粘贴到 MCP 配置文件中：

```json
{
  "mcpServers": {
    "edgeone-pages-mcp-server": {
      "command": "npx",
      "args": ["edgeone-pages-mcp"],
      "env": {
        "EDGEONE_PAGES_API_TOKEN": "你的API Token",
        "EDGEONE_PAGES_PROJECT_NAME": ""
      }
    }
  }
}
```

注意要把 API Token 改成你自己的，并且把注释删除掉，否则会报错：

![](/imgs/8115b6c4e6ffe0d6.png)

正常情况下，你会看到 MCP 服务成功加载，绿了绿了！

![](/imgs/713b25518592a238.png)

这个服务提供了 2 个工具：

- deploy_html：部署 HTML 内容到 EdgeOne Pages，返回公开访问 URL
- deploy_folder_or_zip：部署文件夹或 ZIP 文件到 EdgeOne Pages，返回公开访问 URL

注意，这个 MCP 服务需要 NPX 工具才能在本地成功启动。NPX 可以直接运行 NPM 包中的命令而无需全局安装，常用于执行脚手架工具和一次性命令。

如果你没有 NPX 命令、或者 Node.js 版本过低（最好不要低于 20），都会导致工具无法加载。

![](/imgs/9669a75bcfd18e83.png)

这时，你只需要到 [官网安装 Node.js](https://nodejs.org/zh-cn)，会自动帮你安装 NPM 和 NPX 工具：

![](/imgs/c4dd07ecc9f89769.png)

如果没有自动安装 NPX 工具，那就用 NPM 包管理工具安装 NPX：

```bash
npm i -g npx
```


3）生成并部署网站

准备好 MCP 服务后，下面来生成网站。输入下列提示词，让 AI 帮我生成个人博客网站：

```
帮我根据程序员鱼皮的 GitHub 生成个人博客网站，极客风格，简洁大气；生成完成后部署网站
@https://github.com/liyupi
```

查看 AI 的思考过程，它已经想到要使用 EdgeOne Pages 去部署网站了：

![](/imgs/59583b7add61002f.png)

很快网站就生成并部署完成，可以看到 AI 调用了 MCP 部署 HTML 的工具，得到了访问地址：

![](/imgs/e91ab1d66052640f.png)

直接打开网址就看到效果了，不要太方便！

![](/imgs/d5fc97f93410d63a.png)

不过目前生成的网站比较简单，就一个 HTML 页面，甚至没有在本地创建代码文件。


4）部署网站目录

再来尝试一个更复杂的项目吧，使用下面的提示词，让 AI 利用前端框架开发多页面网站：

```
帮我根据程序员鱼皮的 GitHub 生成个人博客网站，极客风格，简洁大气；
需要包含多个页面，要求使用 Vue 框架模块化开发；
生成完成后部署网站
@https://github.com/liyupi/
```

![](/imgs/191536c9fbda97c3.png)

这次要等待的时间会比较久，鱼皮建议大家趁这个时间接杯水，起来活动活动。最近久坐不动，我感觉自己的肩膀已经硬如磐石了。

![](/imgs/fd561db09362bf6b.png)

我们会发现，虽然生成了一大堆代码，但是并没有自动部署，只是给出了部署建议：

![](/imgs/bafd44ba1d462b2e.png)

看一下 AI 的思考过程，原来是使用部署工具失败了：

![](/imgs/1ee7ad5ef74ee497.png)

经过我的测试发现，如果想部署网站目录或压缩包，最好先在 Pages 网页版创建一个项目，然后让 MCP 把网站文件传到这个项目内。

那就先利用官方提供的例子，随便部署一个网站：

![](/imgs/461153e7261a909d.png)

修改项目的名称为 `yupi-blog`，直接点击 "开始部署" 就好：

![](/imgs/6646de60805d8586.png)

等待部署中，30 秒左右就好了：

![](/imgs/3d6440041f8291cf.png)

项目部署成功后，我们修改 Cursor MCP 的配置，填入刚刚创建的项目名称：

![](/imgs/e289aa841876cf0f.png)

然后再跟 AI 对话，让它帮我部署网站目录：

![](/imgs/a743c6e0ee2b619f.png)

可以看到这次 AI 成功执行了部署工具，并且得到了访问地址：

![](/imgs/f693e28ce9c85af1.png)

看下网站效果，还不错吧，很有科技感！

![](/imgs/3cce8f7ca3108fb3.png)

不过要注意，生成的网站默认使用临时域名，有效期比较短：

![](/imgs/57d6a673a11db652.png)

如果你有域名的话，建议配置一下自定义域名，就可以无限期访问啦~

![](/imgs/9a5179cea0ac72d3.png)

怎么样，是不是很简单？等能够轻松在手机上使用 MCP 的时候，试想一下，你走在路上跟朋友聊天，朋友向你推荐了一位博主 —— 程序员鱼皮，你只需要跟 AI 说一句话，2 分钟后，就能给朋友访问介绍这个博主的网站，跟变魔术似的。

![](/imgs/57beb76307665831.png)

值得一提的是，EdgeOne Pages 目前应该是免费的，真香了。

![](/imgs/fb28d62e5a6bdbc5.png)


### 方式二、Vercel CLI + Skills 自动部署

除了 EdgeOne Pages，Vercel 也是非常主流的部署平台，同样支持 AI 自动部署。

国外主流的免费部署平台还有：

1）Netlify 是一个老牌的前端托管平台，内置了表单处理、身份验证等开箱即用的功能，免费额度也挺大方。

![](/imgs/029ddb69c77d5f64.png)

2）Cloudflare Pages 背靠全球最大的 CDN 厂商 Cloudflare，全球访问速度快，而且免费额度夯爆了，每天 10 万次请求都不收费！

![](/imgs/6e6a793bd94e876b.png)

这些平台都支持从 GitHub 仓库导入项目并一键部署，也都提供了 Skills 或 MCP 来让 AI 编程工具自动完成部署操作。而且不只能部署纯静态页面，Next.js、Nuxt、Astro 这些全栈框架的网站也能直接丢上去，支持 SSR 服务端渲染。

下面以 Vercel 为例，带大家完整走一遍 AI 自动部署的流程。

假设已经用 AI 开发好了一个「编程宝典」文档网站，基于 VuePress 构建，代码也推到了 GitHub 上开源。这是一个精简版的模板项目，大家可以直接 fork 拿来练手。

> 开源指路：[https://github.com/liyupi/codefather](https://github.com/liyupi/codefather) （template 分支）

![](/imgs/3efea89a0a39294f.png)


#### 什么是 Vercel？

先简单介绍一下 Vercel。它是目前海外最主流的网站部署平台，你把代码丢给它，它能帮你构建、托管、CDN 加速，还自动配好 HTTPS，完全不需要自己搭建服务器。而且跟 GitHub 深度集成，之后每次推送代码都会自动重新部署，非常省心。

![](/imgs/867432fb1ed8e9b9.png)

为了让 AI 编程工具能帮我们操作 Vercel，Vercel 官方提供了 3 样东西：

1）Vercel CLI 命令行工具：在终端里执行 `vercel` 命令就能完成部署，可以让 AI 帮你调用。

![](/imgs/76622dd7a170fe06.png)

2）Skills 技能包：Skill 是一种标准化的指令文件，相当于给 AI 看了一遍 Vercel 的部署教程。装了之后 AI 就知道完整的操作流程和最佳实践，遇到问题也知道怎么处理。

![](/imgs/cdde5af6becbbe51.png)

3）MCP 模型上下文协议：让 AI 直接调用 Vercel 的 API 来管理项目，比如创建部署、配置环境变量等。

![](/imgs/77ce4cf8bf5c998b.png)

我们这里主要用 **CLI + Skills** 的组合来演示。相比 MCP，Skills 不需要额外配置服务端，而且一次安装后，各种 AI 编程工具都能直接用。


#### 快速实战

**1、注册 Vercel 账号**

首先到 [Vercel 官网](https://vercel.com) 注册账号，建议直接用 GitHub 账号登录，这样后面导入项目会很方便：

![](/imgs/3ee072ba8ade25f4.png)


**2、安装 Vercel CLI**

Vercel 提供了命令行工具，可以让我们通过终端完成部署。

先打开终端，用 npm 全局安装：

```bash
npm i -g vercel@latest
```

![](/imgs/023fbef2c94908e7.png)

安装完之后，在终端执行 `vercel login`，并且在弹出的网页中完成登录认证：

![](/imgs/86e9245b212f75e0.png)


**3、安装 Vercel Skills**

接下来给 AI 编程工具装上 Vercel 的部署技能 `deploy-to-vercel`。装了之后，AI 在帮你部署的时候就能自动检测项目状态、选择最佳的部署方式、生成预览链接。

![](/imgs/a7db856b4a14b0bc.png)

打开终端，输入下列命令，可以安装 Vercel 团队提供的多个技能：

```bash
npx skills add vercel-labs/agent-skills
```

你可以自己选择要安装哪些技能，这里我就单选一个部署技能：

![](/imgs/e1b9b85f3cfce40c.png)

技能默认会被安装到大多数 AI 编程工具都支持的 `.agents/skills` 目录下，你也可以安装在特定 AI 编程工具的技能目录下，比如安装到 Claude Code 支持的 `.claude/skills` 目录：

![](/imgs/d7673d950260655c.png)

最后，选择「全局安装」还是「当前项目下安装」，我一般选择全局，省的每个项目都要单独装一遍。

![](/imgs/fdd2fc57ba6d25e9.png)

安装成功后，你的 AI 编程工具（Cursor、Claude Code、Codex 等）就会自动加载这些技能，在 AI 需要的时候帮你用上。

![](/imgs/df19b593923af879.png)

除了技能之外，你也可以配置 Vercel 的 MCP 服务，二选一就好。

直接进入 [Vercel MCP 的官方文档](https://vercel.com/docs/agent-resources/vercel-mcp#cursor)，点击「Add to Cursor」按钮：

![](/imgs/d0fb3efb6cf8fe23.png)

会自动跳转到 Cursor 的设置页面，点击 Install 就能完成安装了，然后完成授权即可，非常傻瓜式：

![](/imgs/c7d0abccf52146ff.png)


**4、让 AI 帮你部署**

准备工作搞定，下面在 AI 编程工具中打开你的项目目录，就可以开始部署了。

这里选择使用 Claude Code 来演示，但 Cursor、Codex 等其他 AI 编程工具的用法都是一样的。

安装 Skills 之后，会多出一个 `/deploy-to-vercel` 斜杠命令。直接在跟 AI 对话时输入这个命令，就能触发部署流程，比手打提示词更方便、成功率也更高。

```
/deploy-to-vercel 帮我把当前项目部署到 Vercel
```

![](/imgs/0ec42e9442947739.png)

AI 会自动帮你完成以下操作：

1. 检测当前项目类型（比如识别出这是一个 VuePress 项目）
2. 执行 `vercel` 命令发起部署
3. 如果是第一次部署，AI 会自动帮你创建 Vercel 项目并完成关联
4. 等待构建完成，最后把访问链接给你（中间遇到报错还会自主修复）

![](/imgs/b89ebb201c27c11f.png)

很快就部署完成了，AI 会返回一个类似 `xxx.vercel.app` 的链接：

![](/imgs/8bdf0eb0806b934a.png)

直接打开网址就能看到效果了，不要太方便！

![](/imgs/0d620ad7323d373a.png)

还可以在 Vercel 后台查看和管理已经部署的网站：

![](/imgs/2ef9eb070199d58f.png)

对了，如果你的项目需要配置环境变量（比如 AI 模型的 API Key），在部署前告诉 AI 就行。

比如：帮我设置环境变量 OPENROUTER_API_KEY 值是 sk-xxx。

AI 会通过 Vercel CLI 帮你配好，部署时自动生效。

![](/imgs/ecc98de0c7b47aed.png)

你也可以在 Vercel 网页控制台手动添加，效果是一样的。

![](/imgs/22c75b70c8ac7653.png)


**5、后续更新**

之后每次修改了代码，只需要再跟 AI 说一句「帮我重新部署」就行。或者也可以直接把代码推到 GitHub，Vercel 检测到代码更新后会自动触发重新部署，完全不用手动操作。

如果想发布到正式的生产环境（带正式域名那种），直接跟 AI 说，让它帮你执行 `vercel --prod` 命令就好。

![](/imgs/7a3ee3a0eafca8fb.png)


**6、配置自定义域名（可选）**

Vercel 默认给你的是 `.vercel.app` 结尾的域名，不太优雅。

如果你有自己的域名，可以在 Vercel 控制台绑定，比如之前给自己做的「互联网数字墓园项目 - 挂了么」绑定了个域名：

![](/imgs/184dc96aea3253ce.png)

添加域名后，AI 会引导你完成 DNS 配置，绑定成功后 Vercel 还会自动帮你配好 HTTPS 证书。


## 三、Vercel 一键部署（推荐）

[Vercel](https://vercel.com) 是目前最流行的前端部署平台，特别适合 React、Next.js、Vue、静态网站等前端项目。

Vercel 的优点是个人项目完全免费，部署速度极快（一般 1 ~ 2 分钟），自动配置 HTTPS 和 CDN 加速；还和 GitHub 深度集成，能够在你推送代码到 GitHub 仓库后自动部署。


### 使用步骤

1）首先访问 [Vercel 官网](https://vercel.com) 注册账号，建议使用 GitHub 账号注册登录。

2）创建项目，可以直接绑定 GitHub 并选择已经托管的项目，点击 "Deploy" 部署按钮：

![](/imgs/971e05f6fa93a9a6.png)

3）等待 1 ~ 2 分钟，项目就上线了！

部署成功后 Vercel 会自动给你一个域名，比如 `your-project.vercel.app`，你也可以绑定自己的域名。而且每次你往 GitHub 推送代码，Vercel 都会自动重新部署，完全不用手动操作。


### 命令行部署

除了网页操作，Vercel 还提供了命令行工具，可以让我们通过一行命令把自己的项目部署到平台。先用 NPM 安装 Vercel CLI 工具：

```bash
npm i -g vercel@latest
```

然后，直接在想部署的项目文件夹下输入 `vercel` 命令，就能部署当前项目了：

![](/imgs/68b53a3420852200.png)

让 AI 完成自动部署的方法也很简单，你只需要在提示词中告诉 AI “你可以使用 vercel 命令行工具完成网站部署”，聪明如它，一定能帮你完成任务。

💡 具体过程可以看鱼皮的视频教程：https://www.bilibili.com/video/BV1TV4y1j76t

除了 Vercel，还有 [Netlify](https://www.netlify.com/) 这个类似的平台。Netlify 和 Vercel 功能差不多，但功能更全面一些，支持更多的框架和静态站点生成器，有表单处理、无服务器函数等功能，免费额度更大、还支持 A/B 测试和分析。使用方式和 Vercel 类似：注册账号 => 连接 GitHub => 选择项目 => 点击部署。如果你的项目不是 Next.js（Next.js 用 Vercel 最好），可以考虑用 Netlify。


## 四、GitHub Pages 部署

[GitHub Pages](https://pages.github.com/) 是 GitHub 提供的免费静态网站托管服务。优点是完全免费、无限流量、和 GitHub 无缝集成。

使用方法巨简单，在 GitHub 创建仓库并上传网站文件后，直接在仓库设置中启用 GitHub Pages：

![](/imgs/1c7b859c154b2b95.png)

然后就能通过 `username.github.io/repo-name` 访问了。适合个人主页、项目文档、简单的静态网站。

GitHub Pages 的限制是只能部署静态网站，不能运行后端代码。但对于纯前端项目来说，完全够用了。而且完全免费，不用担心流量限制。


## 五、云服务器部署

如果你想要更多的控制权，可以租一台云服务器，自己部署项目。国内主流的云服务商有阿里云、腾讯云、华为云等。

云服务器部署的基本流程：

1）购买云服务器（推荐 2 核 4G 配置起步，第一次购买有新用户优惠）

2）安装运行环境，比如 Node.js、Nginx、MySQL 数据库等

3）上传代码到服务器

4）配置 Nginx 反向代理

5）配置域名和 SSL 证书

这个过程对于纯新手来说会有点儿复杂，但可以使用宝塔面板或 1Panel 这样的可视化管理工具，大大简化操作。这些面板提供了图形化界面，不需要记复杂的命令，点点鼠标就能完成配置。

![](/imgs/88010aa842fc9996.png)

云服务器部署的优点是你有完全的控制权，可以随时调整配置，而且更稳定。缺点是需要一定的编程或运维知识，而且服务器需要付费（一般每月几十到几百元不等）。

💡 具体过程可以看鱼皮的视频教程：
- [云端编辑器 + Vercel + 对象存储 + 内网穿透 4 种方式部署](https://www.bilibili.com/video/BV1UZ4y197i1)
- [Nginx + 宝塔 2 种方式部署个人博客](https://www.bilibili.com/video/BV1rU4y1J785)
- [WordPress 搭建个人博客](https://www.bilibili.com/video/BV14q4y1R7XM)
- [4 种主流前后端项目部署](https://www.codefather.cn/course/1790943469757837313/section/1791075571845345281?contentType=video&tabKey=videoList)

鱼皮在编程导航带大家做过 20 多套项目了，几乎每种部署方式都给大家讲解过：

- [AI 零代码应用生成平台项目](https://www.codefather.cn/course/1948291549923344386)：1Panel 面板 + Nginx 前端 + Java 后端（jar 包）
- [代码生成器共享平台项目](https://www.codefather.cn/course/1790980795074654209)：宝塔面板 + Nginx 前端 + Java 项目管理器（jar 包）后端部署

基本上学会这几种部署方式，能够应对绝大多数部署需求了。


## 六、Docker 容器化部署

对于包含前端和后端的全栈项目，Docker 是一个很好的部署方式。Docker 可以把你的应用和运行环境打包成一个容器，在任何支持 Docker 的服务器上都能运行。

Docker 的优点是环境一致性好，不会出现 “在我电脑上能跑，在服务器上跑不了” 的问题。而且可以很方便地管理多个应用，每个应用独立运行，互不影响。

使用 Docker 部署的基本流程：

1. 编写 Dockerfile，定义应用的运行环境
2. 构建 Docker 镜像
3. 运行 Docker 容器
4. 配置 Nginx 反向代理（如果需要）

这个过程相对复杂一些，但可以让 AI 帮你完成。你只需要告诉 AI：“帮我写一个 Dockerfile，用来部署这个 Node.js 项目。” AI 会生成完整的 Dockerfile 和部署脚本。

如果你想学习企业级的部署方式，建议深入学习 Docker。

💡 具体过程可以看鱼皮的项目教程：
- [AI 答题应用平台项目](https://www.codefather.cn/course/1790274408835506178)：Vercel 前端 + Docker 后端 + 云托管 Serverless 平台部署
- [AI 超级智能体项目](https://www.codefather.cn/course/1915010091721236482)：Docker 前端 + Docker 后端 + 云托管 Serverless 平台部署
- [OJ 在线判题项目](https://www.codefather.cn/course/1790980707917017089)：Docker Compose 后端微服务部署


## 七、AI Agent 应用的部署

除了传统的前端网站和全栈应用，现在越来越多人开始开发 AI Agent 应用。比如 AI 客服、AI 分析助手、AI 写作工具这些能跟用户多轮对话的智能应用。

这类应用的部署跟普通网站不太一样，因为它背后需要一整套「AI 基础设施」的支撑：

- 大模型 API 的对接和密钥管理
- 多用户的对话记忆隔离（你不能让 A 用户看到 B 用户跟 AI 聊了什么）
- 联网搜索、文件解析等工具能力的接入

如果这些都要自己从头搭建，模型网关、对话存储、工具管理每一项都是不小的工作量，还没开始写业务逻辑就累得够呛了。

目前比较推荐的方式是使用 **AI Agent 托管平台**，比如腾讯云的 [EdgeOne Makers](https://pages.edgeone.ai/zh/document/product-introduction)。这类平台把模型网关、对话记忆、联网搜索、链路追踪等能力都帮你准备好了，你只需要专注写 Agent 的业务逻辑，其他的交给平台处理就行。

![](/imgs/704ae855f77da0f9.png)

平台默认帮你对接了主流大模型，提供一定免费的 Token 额度，支持一键切换 DeepSeek、GPT、Claude 等不同模型。而且内置了很多现成的 Agent 应用模板，覆盖 OpenAI SDK、Claude SDK、LangGraph、CrewAI 等主流框架，JS 和 Python 都能用，选个模板就能快速起步。

![](/imgs/2939ab9bb1e1ba0d.png)


### 部署方式

使用 EdgeOne Makers 部署 AI Agent 有两种方式。

**方式一、控制台创建模板项目**

最简单的方式是直接在 EdgeOne Makers 控制台选一个 Agent 模板，关联 GitHub 仓库，点击创建部署。系统会自动帮你初始化项目、安装依赖、构建部署，几十秒就能拿到一个可访问的 AI Agent 应用。

![](/imgs/ea85f85616f9cdfd.png)

**方式二、本地开发 + AI 自动部署**

如果你想自己写 Agent 的业务逻辑，可以在本地用 AI 编程工具开发，然后让 AI 帮你部署。

具体步骤：

1）安装 EdgeOne 官方的 Skills 技能包，让 AI 自动了解平台的开发规范：

```bash
npx skills add TencentEdgeOne/edgeone-makers-tools
```

![](/imgs/7a7b96b5b4e1f6d0.png)

2）在 AI 编程工具中调用 `/makers-agents` 技能，描述你的 Agent 需求，AI 会自动按照平台规范写代码。

![](/imgs/281af641ee5957ce.png)

3）开发完成后，调用 `/makers-deploy` 技能让 AI 帮你一键部署，几秒钟就能拿到线上访问地址。

![](/imgs/9585002aec95add1.png)

上面这套流程走下来，从写代码到部署上线，不到 20 分钟就能搞定。而且部署之后如果想切换模型，只需要在控制台改一个环境变量重新部署就行，完全不用动代码。

![](/imgs/e5dc03c8d8f1612f.png)

感兴趣的同学可以阅读本教程项目实战板块中的《EdgeOne Makers - AI 副业点子验证器项目实战》，里面有从 0 到上线的完整开发部署流程演示。也可以看对应的视频版：https://bilibili.com/video/BV1jU756mE1x


## 八、CDN 加速优化（可选）

部署完成后，如果你想让网站访问速度更快，还可以使用 CDN 加速。

CDN（内容分发网络）就是把你的网站内容缓存到全球各地的服务器上，用户访问时会自动选择离他最近的服务器，大大提高加载速度。

![](/imgs/4810c2c3648cfa04.png)

[Cloudflare](https://www.cloudflare.com/zh-cn/) 提供免费的 CDN 服务，优势是：

- 完全免费（个人网站）
- 全球 CDN 加速，覆盖 200+ 个城市
- 自动 HTTPS 证书
- DDoS 防护和 Web 防火墙
- 免费的 DNS 服务

使用方法很简单，注册 Cloudflare 账号，添加你的域名，然后把域名的 DNS 服务器改成 Cloudflare 提供的地址就行。Cloudflare 会自动帮你加速和保护网站。

也可以直接使用 Cloudflare 提供的 Pages 页面部署能力，直接上传自己的代码，交给它一键部署并白票免费的域名，更方便~

![](/imgs/7148fc5bdd0af4ba.png)

如果你的网站部署在 Vercel 或 Netlify 上，它们本身就有 CDN 加速，不需要额外配置 Cloudflare。但如果你是自己租服务器部署，强烈建议用 Cloudflare 加速。


## 九、域名和 SSL 证书

部署完成后，你可能想给网站配置一个好记的域名，而不是一直用难以记忆的 IP 地址让用户访问。


### 购买域名

域名就是网站的地址，比如 [codefather.cn](https://codefather.cn/)、[dogyupi.com](http://dogyupi.com/)。对于国内用户，我推荐在 [阿里云](https://wanwang.aliyun.com/) 或 [腾讯云](https://dnspod.cloud.tencent.com/) 这种知名云服务商购买域名。价格一般是几十块钱一年，而且操作界面都是中文的，很方便。

需要注意的是，如果你的网站服务器在国内，域名需要备案。备案流程大概需要 1 ~ 2 周，需要提供身份证、手机号等信息。如果你的网站部署在 Vercel、Netlify 这些国外平台上，或者在国外平台购买域名，那么可以省去备案，快速上线。


### 配置 SSL 证书

现在的网站基本都要求 HTTPS，所以需要配置 SSL 证书。好消息是，大部分部署平台都会自动配置 SSL 证书，你不需要手动操作。

比如 Vercel、Netlify、GitHub Pages、EdgeOne Pages 都会自动配置 HTTPS，你只需要绑定域名就行。

如果你是自己租服务器部署，可以使用免费的 [Let's Encrypt](https://letsencrypt.org/zh-cn/) 证书，或者用 Cloudflare 的 CDN，它们都会自动配置 HTTPS。


## 写在最后

通过这篇文章，你已经学习了多种项目部署方式。从最新的 AI 自动部署，到最流行的 Vercel 一键部署，从简单的 GitHub Pages，到专业的云服务器和 Docker 容器化部署，每种方式都有自己的适用场景。

我建议对于新手，从简单的开始。如果你用的是 AI 零代码平台，直接用它自带的发布功能就好。如果你用 Cursor 等代码编辑器开发，推荐先用 Vercel 或 GitHub Pages，几分钟就能上线。等你熟练了，再学习 Docker 和云服务器部署，这些是企业级的部署方式，更专业也更灵活。

现在，选择一个适合你的部署方式，把你的项目发布到互联网上吧~


## 推荐资源

1）鱼皮 AI 导航网站：[AI 资源大全、最新 AI 资讯、免费 AI 教程](https://ai.codefather.cn)

2）编程导航学习圈：[学习路线、编程教程、实战项目、求职宝典、交流答疑](https://www.codefather.cn)

3）程序员面试八股文：[实习/校招/社招高频考点、企业真题解析](https://www.mianshiya.com)

4）程序员写简历神器：[专业模板、丰富例句、直通面试](https://www.laoyujianli.com)

5）1 对 1 模拟面试：[实习/校招/社招面试拿 Offer 必备](https://ai.mianshiya.com)

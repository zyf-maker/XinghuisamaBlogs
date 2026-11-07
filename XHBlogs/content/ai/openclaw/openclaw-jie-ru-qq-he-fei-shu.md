---
title: "OpenClaw 接入 QQ 和飞书"
summary: "把 OpenClaw 接入手机聊天软件，随时随地养虾"
order: 7
level: "入门"
tags: ["OpenClaw"]
updated: "2026-03-24"
readingTime: 5
author: "程序员鱼皮"
source: "https://github.com/liyupi/ai-guide"
---

你好，我是鱼皮。

安装好 OpenClaw 之后，总不能每次都打开电脑上的网页控制台才能跟小龙虾对话吧？把它接入你常用的聊天软件，掏出手机就能给龙虾下达任务，这才是 OpenClaw 的正确使用方式。

这篇教程教你接入 QQ 和飞书两大平台。


## 接入 QQ

腾讯专门为 OpenClaw 搞了一个快捷接入通道，几步就能搞定！

打开 QQ 机器人 OpenClaw 接入页面，用 QQ 扫码登录：

> 指路：https://q.qq.com/qqbot/openclaw/index.html

![](/imgs/50b4c1d9aa911b45.png)

点击「创建机器人」，直接秒出！

![](/imgs/473f39cc96005fb3.png)

创建完成后，手机 QQ 立刻就会收到小龙虾打招呼的消息：

![](/imgs/c2000b49d63ae090.png)

然后可以修改机器人的头像、昵称等信息，给你的龙虾起个好听的名字吧~

![](/imgs/e686011e9c96760e.png)

接下来是最关键的一步。页面上会显示三条配置命令，你只需要依次复制这 3 条命令到终端（PowerShell）中执行就可以了。

注意命令中包含你的密钥信息，不要泄露给别人！

![](/imgs/43622e604de8026d.png)

到终端中依次执行命令：

![](/imgs/4ab2536bfa3b16f4.png)

接入成功后，你可以在 OpenClaw 的网页控制台的「频道」（Channels）板块看到已经接入了 QQ 机器人渠道：

![](/imgs/5ff2908a1beeaba2.png)

现在，掏出手机试试吧！

直接在 QQ 上给小龙虾发消息下达任务，比如让它查看电脑配置、或者帮你写一篇文章。完成速度很快，而且支持 Markdown 格式输出，阅读体验不错：

![](/imgs/1cd1b87c000b755c.png)

如果你好奇它背后做了些什么，可以在 OpenClaw 的网页控制台中查看跟 QQ 机器人的完整对话记录：

![](/imgs/c0b66aae2db1105b.png)


## 接入飞书

飞书有两种接入方式。推荐使用更简单的官方插件方式，几分钟就能搞定；如果官方插件不适用，也可以手动在飞书开放平台创建机器人。


### 方式一：官方插件扫码接入（推荐）

官方提供了对接飞书的插件，先在终端输入一行命令安装：

```bash
npx -y @larksuite/openclaw-lark-tools install
```

![](/imgs/a71c2427f58fa79c.png)

然后直接在命令行中用飞书扫码对接机器人（Windows 的 PowerShell 无法正常显示二维码，需要改为使用自带的 CMD 命令行）。

通过手机操作来创建机器人就好，整个流程非常傻瓜式：

![](/imgs/1916d633d96233f3.png)

操作完成后，在命令行能看到配置飞书机器人成功，在 OpenClaw 网页控制台的频道模块也能看到新增了 Feishu 频道：

![](/imgs/d05e7751c3ab922a.png)

你会在飞书收到应用审批的消息，进入管理后台审核即可：

![](/imgs/23e66bb05526b1d4.png)

点击审核通过，通过后机器人会自动发布上线：

![](/imgs/bc167ea20fb07d64.png)

然后在飞书搜索你的机器人名称：

![](/imgs/04ea8224cd053b74.png)

进入聊天，先发送 `/feishu auth` 授权，傻瓜式操作：

![](/imgs/ff9492447aa670e6.png)

然后跟小龙虾打个招呼，能够成功收到小龙虾回复的消息：

![](/imgs/4d80133d2a1800db.png)

飞书插件还支持开启流式响应，实现打字机效果。打开终端，执行命令：

```bash
openclaw config set channels.feishu.streaming true
```

![](/imgs/abf2b5fd9a3fa328.png)

配置之后，体验比之前好了不少：

![](/imgs/094a6fb31078e062.png)


### 方式二：手动创建飞书机器人

如果方式一不适用（比如企业飞书有权限限制），可以手动在飞书开放平台创建机器人应用。

📺 本方式对应视频教程：https://www.bilibili.com/video/BV1QPcDz1ECF

整个流程分为 5 步：飞书创建机器人应用 → OpenClaw 添加飞书频道 → 配置飞书事件 → 私聊配对 → 解锁多媒体能力。

**1）飞书创建机器人应用**

登录飞书开放平台，进入开发者后台，点击「创建企业自建应用」：

> 指路：https://open.feishu.cn/app

![](/imgs/65b677b117bcbb19.png)

填写应用名称和描述，给你的机器人起个好听的名字：

![](/imgs/3a25ca490ffea91d.png)

创建完成后进入应用详情页，在「添加应用能力」中点击添加机器人能力：

![](/imgs/90785ac53d8e1071.png)

然后进入左侧「权限管理」页面开通权限：

![](/imgs/e3b9e7c44ec12a74.png)

如果你的飞书里没有敏感信息，可以直接把 `im:`、`contact:`、`file:` 等相关的权限全勾上。如果需要精细控制权限，最少只需要开通 `im:message`、`im:chat`、`contact:user.base:readonly` 这 3 个。

也可以通过批量导入 JSON 配置一键搞定权限，在权限管理页面选择批量导入，把下面的 JSON 粘贴进去：

```json
{
  "scopes": {
    "tenant": [
      "aily:file:read",
      "aily:file:write",
      "application:application.app_message_stats.overview:readonly",
      "application:application:self_manage",
      "application:bot.menu:write",
      "cardkit:card:read",
      "cardkit:card:write",
      "contact:user.employee_id:readonly",
      "corehr:file:download",
      "event:ip_list",
      "im:chat.access_event.bot_p2p_chat:read",
      "im:chat.members:bot_access",
      "im:message",
      "im:message.group_at_msg:readonly",
      "im:message.p2p_msg:readonly",
      "im:message:readonly",
      "im:message:send_as_bot",
      "im:resource"
    ],
    "user": [
      "aily:file:read",
      "aily:file:write",
      "im:chat.access_event.bot_p2p_chat:read"
    ]
  }
}
```

![](/imgs/96f94928284055e6.png)

权限配置完成后，点击「创建版本」发布应用：

![](/imgs/e6bf74fcd5bf6d76.png)

填写版本号和更新说明、按需选择是否对外共享，然后申请线上发布：

![](/imgs/b2c4ec58ee87ba8b.png)

进入飞书管理后台审核通过即可：

![](/imgs/de438b93612c5fb2.png)

审核通过后，回到应用的「凭证与基础信息」页面，获取 App ID 和 App Secret，复制保存好，下一步要用。注意这俩是你机器人的钥匙，千万不要泄露给别人！

![](/imgs/8c4b29878af8471a.png)

**2）OpenClaw 添加飞书频道**

拿到 App ID 和 App Secret 之后，打开终端执行命令：

```bash
openclaw channels add
```

![](/imgs/48e1c269dcf5528e.png)

跟着向导一步步操作就好。先选择 Feishu 频道，然后输入 App Secret 和 App ID，连接模式选择 WebSocket 长连接，国内用户选择 Feishu 频道：

![](/imgs/19d4ff1077b42d08.png)

然后配置私聊的访问控制方式，建议选择配对码模式，更安全：

![](/imgs/808007524fddfb35.png)

对接完成后，在 OpenClaw 网页控制台的频道列表中就能看到飞书了：

![](/imgs/7e17740ab87013f2.png)

**3）配置飞书事件**

频道接好了，还需要在飞书侧配置事件订阅，不然飞书不知道该把哪些消息推给 OpenClaw。

回到飞书开发者后台，进入「事件与回调」配置，开启长连接的事件订阅方式：

![](/imgs/fb848e2bdabcfd00.png)

然后添加事件，至少要添加「接收消息」（`im.message.receive_v1`）这一项：

![](/imgs/de93c1d37c2d811c.png)

配置好事件后，别忘了最关键的一步 —— 发布新版本！改了配置不发布是不会生效的，很多人就卡在这一步：

![](/imgs/1a26648234960e8a.png)

**4）私聊配对**

在飞书中搜索你创建的机器人，进入私聊，随便说一句话。发送第一条消息后，机器人会返回一个配对码：

![](/imgs/a0bd6cf0869a8859.png)

在终端中执行命令完成配对，把 `<配对码>` 替换成你自己收到的那串配对码：

```bash
openclaw pairing approve feishu <配对码>
```

执行成功后会提示配对完成：

![](/imgs/d259eb89e2524fa4.png)

配对成功后，再发一条消息试试，这次 AI 就能成功回复了！

![](/imgs/1adf74cac4cb51a2.png)

**5）解锁多媒体能力**

基础对话搞定了，但飞书支持丰富的消息类型，可以让小龙虾给你发送图片、音视频、文件。

你只需要给小龙虾一句引导，让 AI 自己学习怎么发送多媒体消息：

```markdown
飞书支持给用户发送图片、文件、音频、视频并直接浏览，请你详细了解具体的发送方法，并且必须要把需要发送的文件放到 workspace 工作空间中。你必须记住这些方法，之后快速地给我发送想要的内容。
```

AI 会去读取飞书技能文档，学习怎么发送多媒体消息，之后你就可以让它拍照、录音、找文件，通通发到飞书：

![](/imgs/8a15f50b7fcbfda8.png)


## 实用小技巧

在飞书对话框里可以直接输入斜杠命令来控制 OpenClaw 的行为，不需要打开网页控制台，非常方便。


### 1、斜杠命令 /new 新开一个对话

直接在对话框里输入 `/new`，可以清空上下文开启一段新对话，让 AI 更专注当前任务，还能节省 Tokens 费用。

![](/imgs/f49edde1eee07a26.png)


### 2、斜杠命令 /verbose 开启调试模式

输入 `/verbose on` 后，AI 会输出更多执行细节，方便你了解它到底在干什么，排查问题也更方便。

比如让 AI 打开网站并截图，能够看到它通过编写 JS 脚本、打开了浏览器并执行截图的过程：

![](/imgs/8fd0f09b32878783.png)


## 写在最后

恭喜完成基础安装和接入！从现在开始，你可以掏出手机就跟你的小龙虾聊天、让它帮你干活了。

如果你想把 OpenClaw 接入微信，可以阅读《OpenClaw 接入微信保姆级教程》。

从下一篇开始进入进阶玩法，首先学习如何初始化和配置你的小龙虾。


## 推荐资源

1）鱼皮 AI 导航网站：[AI 资源大全、最新 AI 资讯、免费 AI 教程](https://ai.codefather.cn)

2）编程导航学习圈：[学习路线、编程教程、实战项目、求职宝典、交流答疑](https://www.codefather.cn)

3）程序员面试八股文：[实习/校招/社招高频考点、企业真题解析](https://www.mianshiya.com)

4）程序员写简历神器：[专业模板、丰富例句、直通面试](https://www.laoyujianli.com)

5）1 对 1 模拟面试：[实习/校招/社招面试拿 Offer 必备](https://ai.mianshiya.com)

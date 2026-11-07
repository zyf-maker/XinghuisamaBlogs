---
title: "Cursor + Cordova - 表情包生成器 APP 项目实战"
summary: "本项目将带你用纯 Vibe Coding 的方式，一行代码都不写，开发一个可以在手机上运行的 APP。"
order: 22
level: "进阶"
tags: ["项目实战"]
updated: "2026-07-21"
readingTime: 9
author: "程序员鱼皮"
source: "https://github.com/liyupi/ai-guide"
---

本项目将带你用纯 Vibe Coding 的方式，一行代码都不写，开发一个可以在手机上运行的 APP。

这是一个典型的 Vibe Coding 项目，鱼皮会讲解如何用 AI 生成网页、然后通过工具打包成 APP。重点在于学习 Cordova 工具的使用和 APP 打包流程，适合想快速做出 APP 的同学。


---


你现在看到的 APP，是我完全用 AI 生成的，一行代码都没写！怎么做到的呢？

![](/imgs/702f72c241a8fb3c.png)

大家好，我是程序员鱼皮。AI 发展很快，现在随随便便就能生成一个网站，但是怎么纯用 AI 开发能在手机上运行的 APP 呢？网上基本上没有完整的教程。所以，我出手了，下面只用几分钟的时间，我会教大家如何利用 AI 生成 APP，依然是 **保姆级教程**。

⭐️ 本文对应视频，推荐观看：[https://bilibili.com/video/BV17HMcziEye](https://www.bilibili.com/video/BV17HMcziEye/)


下面有请我们的主角 `Cordova`！

## 一、什么是 Cordova？

Apache Cordova 是一个开源的移动应用开发框架，允许开发者使用 HTML、CSS 和 JavaScript 等 Web 技术开发 **跨平台** 的移动应用。它通过将 Web 技术封装在本地容器中，使得开发者可以编写一次代码，然后在 Android、iOS、Windows 等多个平台上运行。

![](/imgs/4d63e55a7d2e7776.png)

Cordova 主要基于以下几个核心组件实现，感兴趣的同学可以了解一下：

![](/imgs/1e28858e188d71d7.png)

也就是说，想要开发 APP，我们只需要把网站文件交给 Cordova，根据需要装一装插件、改一改配置，然后直接使用它提供的构建工具就能将 Web 应用打包成原生 APP 应用了（比如 APK 文件）！几乎不涉及任何代码编写和开发。

听起来很简单，有手就行？但是想使用 Cordova 开发 APP，必须要在电脑上安装对应的环境，比如 Android 和 IOS，而安装环境的难度可以说是 **非常炸裂** 了！

如果你自己折腾，可能至少要花个几天的时间，会踩很多坑，到网上搜各种方案还不一定能搞定。所以我才做了这个教程，该踩的坑我都帮大家踩完了，会 **用最短的时间带你搞定环境，并且教你如何使用 AI + Cordova 生成 APP**。开始之前记得 **点赞收藏三连** 哦，拜托，我的头发真的不多啦！

![](/imgs/3f60625215722fac.png)

## 二、环境准备

### 安装 Cordova

首先我们要安装 Cordova。Cordova 的运行依赖 Node.js 和 NPM 前端工具，到 [Node.js 官网](https://nodejs.org/zh-cn) 下载即可，会自动安装 NPM。

![](/imgs/892e8148ac747821.png)

可以把 NPM 理解为快速安装各种软件的小工具，安装完成后打开终端，执行下列命令安装 Cordova：

```bash
npm install -g cordova
```

Cordova 支持将网站打包为 Android 和 IOS 移动端、Electron 桌面端应用。下面鱼皮带大家安装我个人认为难度最大的 **Android 环境**。注意，接下来的每一步，操作其实都不难，但是一定要仔细看！一个细节不注意可能就报错了！


### 安装 Android 环境

首先，我们要根据 Cordova 的版本来确定所需环境和工具的版本，由于我们安装的 Cordova 是最新版本的，因此直接阅读 [最新的官方文档](https://cordova.apache.org/docs/en/dev/guide/platforms/android/index.html) 即可，比如我这里需要的依赖如下：

![](/imgs/883d686607c4ac0e.png)

其中，最重要的是：

- Java 17
- Gradle 8.13
- Android API 级别 >= 24

下面我们分别安装这些依赖。


#### 1、安装 Java

Java 版本必须是 17，最好找个现成的 [Windows 系统的 Java 安装包](https://www.azul.com/downloads/?version=java-17-lts&os=windows&package=jdk#zulu)：

![](/imgs/8db798fa774ad0f2.png)

安装 Java 时建议选择 **自动配置环境变量**（包括 Path 和 JAVA_HOME），就不用自己手动配置环境变量了。

![](/imgs/3852374219223fe2.png)

安装完成后，打开终端执行 `java -version` 命令查看版本号，看到下列输出表示成功：

![](/imgs/6793117802abb96a.png)

如果无法执行命令，大概率是没有配置 Path 环境变量。

![](/imgs/587e37f59f78568c.png)


#### 2、安装 Gradle

根据上面的版本号，Gradle 必须是 8.13，直接到 [官网](https://gradle.org/releases/) 下载二进制压缩包即可。

![](/imgs/7debb8461ef800bf.png)

解压下载完成的压缩包，移动到 **不包含中文的路径** 中，然后配置环境变量，包括 Path 和 GRADLE_HOME：

![](/imgs/fb71b3c8d1d6f8fe.png)

![](/imgs/18e6e9ec543b4e96.png)

打开终端执行 `gradle -v` 命令，查看版本号：

![](/imgs/1edb362cd45c01db.png)

如果命令无法执行，大概率是 Path 环境变量配置错误。


#### 3、安装 Android

建议直接安装 Android 开发工具 [Android Studio](https://developer.android.com/studio?hl=zh-cn)，会自动安装 Android 的开发 SDK 和运行环境。

到官网下载 Android studio，运行安装包，按照步骤安装即可：

![](/imgs/4314f82f03845651.png)

安装完成后，第一次打开 Android Studio 时，会提醒你安装 Android SDK 环境：

![](/imgs/d5964d53803dd652.png)

注意不要把 SDK 组件安装到包含中文的目录下，好在安装包也给了限制，不然又得栽倒一片人。。。

![](/imgs/ef7e2fd88566b774.png)

接下来无脑安装即可，会自动安装各种 Android 开发常用的工具、还有安卓设备模拟器：

![](/imgs/d76726b913cf740d.png)

这一步可能会有点煎熬，有些地区的朋友可能需要一些特殊的网络支持，你懂的。

![](/imgs/4c17d0fac87f9c49.png)

![](/imgs/9e15785a799ab070.png)

经过了漫长的等待，Android SDK 终于安装完成，然后需要配置 Android 的环境变量 ANDROID_HOME：

![](/imgs/2841bb9021977f07.png)

还要配置 platform-tools 到 Path 中，里面有一些命令行工具：

![](/imgs/867f2cfa12e22076.png)


配置完成后，我们打开 Android Studio，右上角进入 SDK Manager 的设置，根据 Cordova 的版本号要求，安装对应 API Level 的 SDK，比如我这里安装了 34 和 35 版本。

![](/imgs/0f13f441e089b97c.png)

这一步可能也会比较慢，耐心等待安装吧~

![](/imgs/3569afe018095e6b.png)

安装完 SDK 后，再进入 SDK 工具选项，安装 Command-line Tools 命令行工具，之后在电脑上运行安卓 apk 包时可能会用到：

![](/imgs/b5cc66c05bc0eb3e.png)

同样，把 Command-line Tools 添加到环境变量 Path 中，路径为 `%ANDROID_HOME%\cmdline-tools\latest\bin`，这样一来，很多工具可以直接在终端中使用了，比如 apkanalyzer。

![](/imgs/a0d2f774d074cd82.png)


#### 4、安装 Android 设备模拟器

下面我们要尝试在自己的电脑上运行 Android 手机模拟器，这样调试程序更方便。

打开 Android Studio 的设备管理器，添加一个新设备：

![](/imgs/71b31f305d237108.png)

选择指定机型，建议选择 API 版本高一点的，我这里选择 Pixel 7：

![](/imgs/b574c812cfa23d29.png)

安装推荐的系统镜像：

![](/imgs/821de2053bbe270b.png)

耐心等待后手机就创建成功了，直接运行：

![](/imgs/bca18951841c5dbb.png)

结果，报错啦！

![](/imgs/1367a0b6e8f6ab0e.png)

如果你也遇到这种情况，可以在终端 **进入 Android 模拟器目录** 手动运行虚拟设备，这样能够看到详细的错误信息，有利于排查问题。

![](/imgs/5383e28deae8f985.png)

比如我这里显然是由于路径包含了中文！可恶啊，当时年少轻狂不自卑一个没注意用了中文路径。。。

![](/imgs/e8afd01214750430.png)

解决方法很简单，手动创建一个不包含中文路径的 avd 虚拟设备目录，然后设置环境变量 ANDROID_SDK_HOME：

![](/imgs/10294dd97ccf8792.png)

然后再利用 Android Studio 创建一个设备并运行，这次成功运行了，恭喜你多了一个手机！

![](/imgs/418f09879911a5ac.png)

至此，环境终于搞定了，下面来实战 AI + Cordova 开发 APP。

## 三、AI + Cordova 实战

### 创建项目

打开终端，进入你想要创建项目的目录，先执行 `cordova create` 命令来创建项目：

```bash
cordova create <你的项目英文名称>
```

首次创建项目可能会有提示：

![](/imgs/2e748269412279f9.png)


### 生成代码

此处有 2 种生成模式：

1. 先创建 Cordova 项目，然后在该项目内进行 AI 代码生成。告诉 AI 你要创建一个兼容 Cordova APP 的网站，直接让 AI 生成兼容 APP 的代码。这样做的好处是生成的代码 **可以使用 Cordova 插件调用系统原生的能力**，比如调用相机进行拍照。
2. 在 Cordova 项目外单独用 AI 生成网站项目，AI 不会关心你是否要把项目转为 Cordova APP，然后再把生成好的网站移动到 Cordova 项目中。这样做的好处是生成的网站代码更容易运行，同样 **适合你已经有现成网站项目** 的场景。

下面两种方式我都会给大家演示，先讲第一种模式，直接让 AI 生成一个【表情包生成器】的 Cordova APP。

用 Cursor 打开刚刚创建的 Cordova 项目目录，给 AI 输入下列提示词，提示词中需要包含 Cordova，并且提到 **兼容性**：

```shell
请帮我开发一个【移动端表情包生成器】Web APP，使用纯前端技术 + Cordova 实现。
如果需要，你可以通过 Cordova 调用系统原生功能。

请生成完整的项目代码，确保功能完整可用，而且所有功能都需要同时兼容网页端和移动设备。

## 📋 功能需求
### 1. 图片获取
- 支持摄像头拍照
- 支持从本地选择图片文件
- 自动缩放图片到合适尺寸

### 2. 表情包模板
- 提供8-10个常用表情包模板（惊呆了、无语、赞、点赞、emo了等）
- 网格布局展示模板，点击选择应用

### 3. 文字编辑
- 输入自定义文字内容
- 调整字体大小（20px-50px）
- 选择文字颜色（白色、黑色、红色等基础色彩）
- 添加文字描边效果
- 拖拽移动文字位置

### 4. 贴纸功能
- 提供常用emoji表情贴纸（😂🤣😭😍🤔等5-10个）
- 提供简单装饰贴纸（星星、爱心、箭头等）
- 支持拖拽移动和简单缩放

### 5. 保存功能
- 将编辑后的表情包导出为图片
- 支持下载保存到本地

## 🎨 界面要求
- 移动端优先：适配手机屏幕，大按钮设计
- 页面布局：
  - 主页：拍照按钮、选择图片按钮
  - 编辑页：顶部工具栏 + 中央画布 + 底部功能区
- 操作简单：实时预览效果，一键保存

## 📱 操作流程
1. 拍照或选择图片
2. 选择表情包模板
3. 编辑文字内容和样式
4. 添加emoji或装饰贴纸
5. 预览效果并保存图片 
```

AI 生成的网站文件会放到 `www` 目录下。生成代码完成后，AI 可能会自动提醒你打包 APP 并且运行的命令，要依次添加安卓平台、安装插件、打包、运行。

![](/imgs/7b33ad76ae9c9e49.png)

这些命令我们等会儿就会用到，现在先不要自动执行，因为生成的代码不一定直接可用，我们需要先利用网页端进行调试。


### 网页浏览

可以直接双击生成的 HTML 文件 `www/index.html` 查看效果；当然，更推荐的是通过 cordova 命令添加平台并运行。

先添加浏览器平台：

```shell
cordova platform add browser
```

如果你在执行命令时遇到了报错，可以直接问 AI，比如鱼皮遇到了缺少命令执行权限的错误：

![](/imgs/1a6ea35ccd30896c.png)

解决方案是，执行下列命令来修改 PowerShell 的执行策略：

```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

添加平台成功后，可以输入 `cordova run` 命令运行平台：

```bash
cordova run browser
```

然后就能够查看到网站的运行效果了。需要注意的是，因为 Cordova Browser 平台的特殊性，通过这个命令运行的网页效果可能和直接双击、或者启动本地服务器运行有区别。

![](/imgs/163ab684a10ca4c3.png)

除了上面的命令外，如果你想快速调试多个不同的平台，可以运行下列命令，统一查看各个平台：

```bash
cordova serve --port 8000
```

![](/imgs/d4b4991a71811111.png)

### 添加安卓平台

接下来执行类似的命令来添加安卓平台：

```bash
cordova platform add android
```

如图，添加安卓平台成功，注意要 **确保输出的 Target SDK 和 Compile SDK 版本一致**：

![](/imgs/18b74f65e6441def.png)

如果不一致，可能会影响 APP 的运行。可以修改 `config.xml` 的 targetSdkVersion 来修改版本号：

![](/imgs/c25590c0d45556fa.png)

### 添加插件

由于我的项目需要调用摄像头，所以要添加对应的插件，执行下列命令：

```bash
cordova plugin add cordova-plugin-camera
```

添加插件成功：

![](/imgs/5f4f3d63613533d5.png)


### 打包运行安卓 APP

#### 打包

安装完插件后，执行 `cordova build` 命令可以打包 Android apk：

```bash
cordova build android
```

看到下列信息表示打包成功：

![](/imgs/edb41d82344f2051.png)

得到 apk 包后，有 2 种运行方式：

#### 手机运行

可以直接将 apk 包发送到手机安装运行：

![](/imgs/875d3c0a33f169ae.png)

运行效果如图：

![](/imgs/719602b3ffa4545a.jpg)

![](/imgs/1c9229e3d28591cd.jpg)


#### 电脑运行

先打开 Android Studio 并启动安卓虚拟设备，然后执行 `cordova run` 命令：

```bash
cordova run android
```

就可以将 apk 安装到虚拟设备中，并且运行 APP 了，效果如图：

![](/imgs/868e123b293b0e45.png)


### 常见报错

打包运行是最容易遇到报错的地方，可能会遇到很多种报错，比如缺少插件、缺少文件、无法安装依赖、无法运行等等，建议直接把报错信息发给 AI，让它帮你解决。

下面鱼皮分享一些自己遇到的坑点。

#### 1、项目缺少文件

比如鱼皮的项目缺少了图标文件：

![](/imgs/b5cc5643b2b950c9.png)

AI 尝试帮我创建图标：

![](/imgs/b2949468725fc3ab.png)

或者简单粗暴，移除配置文件中对图标的引用：

![](/imgs/f301d3bbe78c0f24.png)


#### 2、缺少环境变量

如果环境搭建不顺利，可能会遇到下列报错，根据报错信息去进行对应的配置即可：

![](/imgs/998b5b47fc55b7ad.png)


#### 3、命令执行失败

执行 `cordova run` 报错命令执行失败，可能是因为没有配置 `cmdline-tools` 到环境变量 Path 中。

![](/imgs/f31c54f91f1681d3.png)


#### 4、Gradle 无法安装

明明已经安装了 Gradle，但是 Cordova 仍然会安装 Gradle，而且可能因为网络原因下载失败：

![](/imgs/a5a08db00d695bca.png)

这时，我们可以配置环境变量 `CORDOVA_ANDROID_GRADLE_DISTRIBUTION_URL`，指定从本地下载 Gradle。环境变量的值设置为我们自己下载的 Gradle 压缩包的路径。

![](/imgs/fd0d3b8ff2be5c2a.png)

如果修改配置后再次执行打包命令还是报错，建议删除项目内的 `platforms/android/.gradle` 缓存，然后重试。


## 四、已有项目打包为 APP

刚刚实战了直接用 AI 生成 Cordova APP 项目的方式，如果我们已经有现成的网站项目，也能够很方便地打包为 APP。

比如现在鱼皮有一个消消乐网页游戏项目，让我们来包装为 APP：

![](/imgs/84420583b751e20d.png)

1）先创建 cordova 项目：

```bash
cordova create yu-game-web-app
```

2）把已有的网页文件复制到 www 目录下：

![](/imgs/b7c74516a1f2e098.png)

3）执行 cordova 命令添加 Android 平台：

```bash
cordova platform add android
```

4）最后，打包或者直接运行：

```bash
cordova run android
```

运行成功的效果如图，还是很 nice 的~

![](/imgs/e293f8d4d40a8afe.png)


## 最后

OK，教程到这里就结束了，由于缺少设备等原因，IOS 就先不给大家演示了。

最后给大家一些建议，Cordova 比较适合中小型网站项目，尤其适合已经有网站项目想快速转为 APP 的场景；但如果你需要搞一个复杂的大项目，依赖很多移动设备的原生能力，使用 Cordova 就不是很合适了，不如 Flutter。尤其是没有编程能力的同学来说，建议不要直接用 AI 生成复杂的 Cordova APP，很可能出现你搞不定的代码问题，但是做些小游戏、小工具还是很不错的。也希望我的分享对大家有帮助吧，想获取更多编程和 AI 干货的朋友记得关注鱼皮哦，拜拜~


## 推荐资源

1）鱼皮 AI 导航网站：[AI 资源大全、最新 AI 资讯、免费 AI 教程](https://ai.codefather.cn)

2）编程导航学习圈：[学习路线、编程教程、实战项目、求职宝典、交流答疑](https://www.codefather.cn)

3）程序员面试八股文：[实习/校招/社招高频考点、企业真题解析](https://www.mianshiya.com)

4）程序员写简历神器：[专业模板、丰富例句、直通面试](https://www.laoyujianli.com)

5）1 对 1 模拟面试：[实习/校招/社招面试拿 Offer 必备](https://ai.mianshiya.com)

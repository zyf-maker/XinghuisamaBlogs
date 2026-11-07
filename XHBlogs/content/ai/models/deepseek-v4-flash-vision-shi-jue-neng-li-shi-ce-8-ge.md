---
title: "DeepSeek V4 Flash Vision 视觉能力实测 - 8 个场景"
summary: "蓝色大肥鱼终于能看图了，用 8 个场景实测 DeepSeek 视觉模型到底行不行"
order: 7
level: "进阶"
tags: ["模型动态", "转载", "AI"]
updated: "2026-10-22"
readingTime: 7
author: "程序员鱼皮"
source: "https://github.com/liyupi/ai-guide"
---

> 本文转载自 **[程序员鱼皮 · AI 指南](https://github.com/liyupi/ai-guide)**，原文标题《DeepSeek V4 Flash Vision 视觉能力实测 - 8 个场景》，作者 程序员鱼皮。
> 内容按 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可使用，本站仅作非商业性收录与排版适配。

大家好，我是程序员鱼皮。

最近 DeepSeek 的活可真是太多了，我对老 D 真是又爱又恨的。。

![](https://pic.yupi.icu/hackdeacon/20260824135821040.jpg?imageSlim)

先是 7 月底放出了 V4 Flash 模型正式版，紧接着 8 月又上线 V4 Pro 正式版，还涨了一波价。与此同时还发布了自家的 AI 工具 DeepSeek Harness，一切皆插件，可玩性极强。

在很多用户吐槽 DeepSeek 不能看图之后，DeepSeek 竟然很快推出了一个船新模型 **DeepSeek-V4-Flash-Vision-Exp**，名字可真够长的。

我用最直白最不绕弯子的说法告诉你，这个模型就是在 V4 Flash 的基础上，加了一个识图能力 DLC 扩展包，且价格不变！

太好了，蓝色大肥鱼终于能看图了，不用安装任何识图插件，迈出了原生多模态能力的第一步。

![](https://pic.yupi.icu/1/HHX3vV5akAAjiNO.jpg)

那这双「鱼眼」的能力到底怎么样呢？

我准备了大量的测试案例，来一起看看吧。


## 识图能力测试

这次测试我主要用的是 DeepSeek Harness（DSH）来接入视觉模型，还没用过的朋友建议先阅读本教程编程工具板块「DeepSeek Harness」目录中的《DeepSeek Harness 保姆级入门教程》，这里我不再重复讲了。

![](https://pic.yupi.icu/1/image-20260814133452050.png)

首先需要将 DSH 升级到最新版本，如果你是通过 `npm` 进行安装的 DSH，通过以下命令进行升级：

``` bash
npm update -g @deepseek-ai/dsh
```

升级完成后，运行 `dsh -V` 命令，确认版本号是否为最新。然后接入 DeepSeek 官方的 API，就可以切换到最新的视觉模型了。

![](https://pic.yupi.icu/hackdeacon/20260824143815328.png?imageSlim)


### 1、OCR 文字识别测试

环境准备就绪，先来个开胃菜。我找了一张由 GPT Image 生成的发票，里面故意包含了一处错误，看看视觉模型能不能找出其中的猫腻。

![](https://pic.yupi.icu/hackdeacon/20260824144403931.png?imageSlim)

在 DSH 中，你可以直接把图片拖进输入框：

![](https://pic.yupi.icu/hackdeacon/20260824144629708.png?imageSlim)

除了拖拽，DSH 也支持通过图片链接或复制粘贴的方式添加图片。

![](https://pic.yupi.icu/hackdeacon/20260824145429084.png?imageSlim)

识别结果非常精准，而且我并没有告诉 AI 要找出其中的错误，它也顺便把问题给指出来了，好评。

![](https://pic.yupi.icu/hackdeacon/20260824150221467.png?imageSlim)

看来 OCR 文字识别能力没什么问题，毕竟早在去年 DeepSeek 开源的 OCR 模型就已经很强了。

![](https://pic.yupi.icu/hackdeacon/20260824154026794.png?imageSlim)

我把同样的图片丢给国外顶尖的 Claude Opus 5 模型，它同样主动找出了发票中的问题。

![](https://pic.yupi.icu/hackdeacon/20260825002126582.png?imageSlim)


### 2、身份识别

接下来我把 DeepSeek 的亲爹梁文锋的照片发给 AI，看看它能不能认出来。

![](https://pic.yupi.icu/1/%E5%BC%80%E6%BA%90%E5%9C%A3%E4%BA%BA%E6%A2%81%E6%96%87%E9%94%8B%E4%B8%AD.jpeg)

结果模型思考了 1 分 29 秒后，信心满满地告诉我，照片中的人物是泡泡玛特的 CEO 王宁：

![](https://pic.yupi.icu/hackdeacon/20260824153346551.png?imageSlim)

也有其他网友让 DeepSeek 视觉模型来识别梁文锋的照片，有识别出张雪峰的、有识别出张一鸣的、还有识别出是 Kimi 创始人杨植麟的，一个比一个离谱。。

![](https://pic.yupi.icu/hackdeacon/20260824161138841.png?imageSlim)

同时我也让 Opus 5 来识别这张照片，结果它出于肖像权考虑，直接拒绝识别人物。。。

![](https://pic.yupi.icu/hackdeacon/20260824155010701.png?imageSlim)

然后我又把自己的照片丢给 AI，看看它会把我认成谁呢？

![](https://pic.yupi.icu/hackdeacon/20260824162343744.png?imageSlim)

结果试了几次，这个视觉模型在 DSH 里死活认不出我，放心了放心了。

![](https://pic.yupi.icu/hackdeacon/20260824162911655.png?imageSlim)

其实早在今年四月底，DeepSeek 网页版就灰度上线了「识图模式」，到六月份全量开放，并且可以免费使用。而这次 V4-Flash-Vision-Exp 模型的上线，则是将视觉能力正式开放到了 API 层面，开发者通过 DSH 等工具就能直接调用了。

![](https://pic.yupi.icu/hackdeacon/20260825100521703.png?imageSlim)

我在 DeepSeek 网页的识图模式中又试了一次，特地关闭了联网搜索，结果居然把我认成了王俊凯。。。

![](https://pic.yupi.icu/hackdeacon/20260825124513534.png?imageSlim)

我又让 AI 识别一次，这次我是杀马特教父，不是哥们？

![](https://pic.yupi.icu/hackdeacon/20260824163143560.png?imageSlim)

看来人物身份识别这一块的能力算是《梁了》。那就换个对象，来测试一下 AI 能不能认出最近因为抽象而爆火的「牛来」。

![](https://pic.yupi.icu/1/%25E7%2589%259B%25E6%259D%25A5%25E5%259B%25BE%25E7%2589%2587.jpg)

视觉模型一开始只能识别出图片中的基本元素，不过它竟然能看出来这是一张 AI 生成的图，还挺厉害的。

![](https://pic.yupi.icu/hackdeacon/20260824164405990.png?imageSlim)

我再让 AI 联网搜索相关内容后，它才成功说出了「牛来」：

![](https://pic.yupi.icu/hackdeacon/20260824165116246.png?imageSlim)

Claude Opus 5 模型同样需要联网搜索辅助，才能认出这是「牛来」。

![](https://pic.yupi.icu/hackdeacon/20260825092328139.png?imageSlim)

既然身份识别对 AI 来说有点吃力，那么我们降低一下难度，来测试一下 DeepSeek 认不认识自己。

![](https://pic.yupi.icu/hackdeacon/20260824165500367.png?imageSlim)

看来大肥鱼还是认得出自己的，不过回答中的模型型号已经是远古时期的了。


### 3、iPhone 机型识别挑战

下面我们做一个有意思的识别挑战。

如果你不太了解 iPhone 产品线，看看这些年出的 Pro Max 机型，你会发现，外观不能说极其相似，只能说几乎一模一样。

![](https://pic.yupi.icu/hackdeacon/20260824170611862.png?imageSlim)

于是，我把 iPhone 11 Pro Max 到 16 Pro Max 这几款外观极其相似的机型，再加上比较有辨识度的 iPhone 17 Pro Max 和 iPhone Air，一共 8 款机型放到一张图里，打乱顺序，看看 DeepSeek 视觉模型能不能正确识别出来。

![](https://pic.yupi.icu/hackdeacon/20260824173214990.png?imageSlim)

结果 DeepSeek 视觉模型的正确率只有 62.5%，猜对了 5 个，猜错了 3 个。错的这三款刚好是外观相似度最高的 14 Pro Max、15 Pro Max 和 16 Pro Max。有意思的是，它明明参考了每一代 iPhone 的经典壁纸来辅助判断，居然还是猜错了。

![](https://pic.yupi.icu/hackdeacon/20260824174033241.png?imageSlim)

而我使用 DeepSeek 网页版的识图模式，居然全对！

![](https://pic.yupi.icu/hackdeacon/20260824174601168.png?imageSlim)

Claude Opus 5 这边也是不吃压力，一次全对。

![](https://pic.yupi.icu/hackdeacon/20260824224913882.png?imageSlim)


### 4、找不同小游戏

小时候我很喜欢玩 QQ 游戏里的《大家来找茬》，我记得是不是还有个《美女来找茬》？反正老爱玩了。

简单来说就是找不同的游戏，来看看 DeepSeek 视觉模型能找出几处不同。

![](https://pic.yupi.icu/hackdeacon/20260824181020776.png?imageSlim)

花费了将近 4 分钟，DeepSeek 视觉模型把 8 处不同全部都找出来了。

![](https://pic.yupi.icu/hackdeacon/20260824181241660.png?imageSlim)

跟标准答案一模一样，还是很厉害的：

![](https://pic.yupi.icu/hackdeacon/20260824181744160.png?imageSlim)

Opus 5 也找出了所有不同，还标记了出来，不过耗时更长，花了 5 分 44 秒。

![](https://pic.yupi.icu/hackdeacon/20260824182025908.png?imageSlim)


### 5、图片转 ASCII

识别和找不同都测完了，接下来让视觉模型做个有意思的小玩意吧。我让 AI 识别图片中的鲸娘，然后转成 ASCII 码形式展示。

![](https://pic.yupi.icu/hackdeacon/20260824191124223.png?imageSlim)

DeepSeek 视觉模型生成出来的效果还算可以，再调整一下细节就完美了，比如深色模式版本下的裙子白色部分不应该是留空，而是填充，防止穿帮。

![](https://pic.yupi.icu/hackdeacon/20260824222029528.png?imageSlim)

并且 DeepSeek 视觉模型生成的版本带有「方块字符」选项，方块字符的展示效果更加完美，但也存在深色模式下穿帮的问题。

![](https://pic.yupi.icu/hackdeacon/20260824221817721.png?imageSlim)

对比一下 Opus 5 生成出来的效果，深色模式也出现了留空穿帮问题，不过 Opus 5 的整体细节会更好。

![](https://pic.yupi.icu/hackdeacon/20260824221131943.png?imageSlim)


### 6、报错截图测试

有趣的项目测完了，来看看实际开发中更实用的场景。

我让 AI 生成了一个带有 Bug 的 Vue 项目，然后把报错截图丢给视觉模型，看看能不能一次性解决。

![](https://pic.yupi.icu/hackdeacon/20260825125052487.png?imageSlim)

看起来报错一大堆，但实际上要解决的问题很简单，就是代码漏写了 `import` 语句，加上有个文件缺失，导致项目启动失败，需要改动的地方很少。

DeepSeek 视觉模型只用了 49 秒就解决了报错问题，还顺便发现了项目里的其他 bug。

![](https://pic.yupi.icu/hackdeacon/20260825103133747.png?imageSlim)

Opus 5 更快，只花了 33 秒就搞定了。

![](https://pic.yupi.icu/hackdeacon/20260825104549261.png?imageSlim)

看来让 AI 改 Bug 这件事真的已经没什么难度了。


### 7、前端页面复刻测试

根据截图还原网页，应该算是视觉模型最经典的应用场景之一了，也是很多人判断 AI 能不能打的试金石。

我让视觉模型识别并复刻 [面试鸭刷题神器](https://www.mianshiya.com) 的热门面试题库页面。

![](https://pic.yupi.icu/hackdeacon/20260824233200734.png?imageSlim)

DeepSeek 视觉模型花了 4 分 30 秒完成任务。

![](https://pic.yupi.icu/hackdeacon/20260824233252743.png?imageSlim)

效果不算完美，而且识别错了好几处内容。居然把「开刷」识别成了「剑别」？？？

旁边的「热门」也识别成了「部门」，右上角搜索框左边还莫名其妙多了个「人工审题 🔥」。

![](https://pic.yupi.icu/hackdeacon/20260824233617910.png?imageSlim)

前面我还刚夸过 DeepSeek 的 OCR 能力，没想到这次翻车了。。

Opus 5 这边只花了 2 分钟就完成了，虽然有些细节不太一样，但好在整体没有夸张的错误。

![](https://pic.yupi.icu/hackdeacon/20260824233946516.png?imageSlim)


### 8、硬核逻辑测试

最后来一个硬核测试。我让 GPT Image 出题并生成图片，让 DeepSeek 视觉模型来解题，最后把结果发回 GPT 来判断正误。

![](https://pic.yupi.icu/hackdeacon/20260825000506117.png?imageSlim)

GPT 出的题目是一张电商运营数据报表，既考验视觉模型的 OCR 文字识别能力，又考验它对图表中数据关系和业务逻辑的理解。

![](https://pic.yupi.icu/hackdeacon/20260825092800074.png?imageSlim)

这么复杂的问题，DeepSeek 视觉模型只用了 2 分 46 秒就完成了回答。

我把 DeepSeek 的回答结果发回 GPT，让它来评价打分。

![](https://pic.yupi.icu/hackdeacon/20260825093024613.png?imageSlim)

GPT 给出的评价是「整体很强」，满分 10 分给到了 8 分。扣的两分主要是因为存在推断过头和 OCR 识别失误的问题。

![](https://pic.yupi.icu/hackdeacon/20260825093607632.png?imageSlim)

而 GPT 对 Opus 5 的评价是「明显更强」。

![](https://pic.yupi.icu/hackdeacon/20260825100044279.png?imageSlim)

我让 GPT 总结了 Opus 5 哪些方面比 DeepSeek 视觉模型更强，大家自己看看吧：

![](https://pic.yupi.icu/hackdeacon/20260825100230160.png?imageSlim)

看来蓝色大肥鱼还需要继续练习呀。

![](https://pic.yupi.icu/1/DeepSeek%20%E5%8F%88%E9%94%99%E4%BA%86%E8%A1%A8%E6%83%85%E5%8C%85%E5%B0%8F.jpeg)


## 写在最后

DeepSeek-V4-Flash-Vision-Exp 当时还只是一个试验性模型（后续更新：2026 年 9 月官方已经用原生多模态的 V4.1 Flash 正式版接替了它，旧模型名的请求会自动由 V4.1 Flash 处理，按 Flash 价格计费）。根据官方公布的基准测试数据，这个模型的纯文本能力和 V4 Flash 正式版持平，而在需要视觉理解的 Agent 基准测试上，多模态能力已经接近 Opus 4.8。

整体测试下来，我觉得这款视觉模型还是比较可用的，尤其是性价比非常突出。

以上八轮测试，我都是在价格高峰时段完成的，做下来总共花了大约 6 块钱。而 Opus 5 我估算花了 8 刀左右，差了将近 10 倍！

根据官方文档，DeepSeek 的图片处理成本非常低，一张图最多折算 384 个输入 token，计费价格与 V4 Flash 一致。按高峰时段、缓存未命中的最高价来算，一张图大约只要 0.12 分，远不到 1 分钱，这价格可以说是基本白送了。

![](https://pic.yupi.icu/hackdeacon/20260825104944950.png?imageSlim)

不过也不得不承认，这款模型在 OCR 识别和逻辑推理上确实还有不足，希望正式版能有所改善。

不管怎么说，这毕竟是 DeepSeek 在多模态方向迈出的重要一步，相信梁哥！

视觉能力对 AI 编程的意义其实很大。模型能自己截图看效果，就意味着它可以自己验收前端页面、自己发现布局问题，而不用你一遍遍地截图丢给它。如果你想了解其他模型在这方面的表现，可以阅读本教程模型动态板块中的其他实测文章。

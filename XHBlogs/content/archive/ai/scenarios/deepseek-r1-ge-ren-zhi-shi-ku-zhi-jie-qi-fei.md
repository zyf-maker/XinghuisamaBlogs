---
title: "DeepSeek R1 + 个人知识库，直接起飞！"
summary: "DeepSeek R1 + 个人知识库，直接起飞！"
order: 6
level: "入门"
tags: ["应用场景"]
updated: "2025-05-30"
readingTime: 2
author: "程序员鱼皮"
source: "https://github.com/liyupi/ai-guide"
---

DeepSeek R1 + 个人知识库，直接起飞！

今天要讲的：DeepSeek-R1 + 个人知识库打造。  
除了硅基流动，还要用到另一个圈内比较火的第三方客户端：Cherry Studio。  

![](/imgs/7ae29b8e97a80abd.webp)

1\. 下载安装 Cherry Studio  
https://cherry-ai.com/  
作为一个完全开源的项目，除去UI设计、功能不谈，Cherry Studio很值得推荐的一点是作者（@kangfenmao）活跃在各大平台、论坛，积极听取用户反馈的同时，更新相当及时。  

![](/imgs/ce5febb7635d0380.webp)


2\. 模型配置  
安装好Cherry Studio后，首先需要配置模型。搭建个人知识库，仅硅基流动的模型就足够了，所以只需：点击左下角的设置\->选择硅基流动\->打开开关->填入硅基流动的API key。  

![](/imgs/cf4070cada78a02f.webp)


接下来，把需要用到的模型添加上。下拉到最下面，点击绿色的管理按钮。  

![](/imgs/f9cd842252463092.webp)


常规模型中，推荐添加下面三个模型：推理模型DeepSeek-R1、通用模型DeepSeek-V3，以及视觉模型Janus-Pro-7B。  

![](/imgs/d2416d299f47c77e.webp)


嵌入（embedding）模型，推荐添加下面两个：完全免费的BAAI/bge-m3和付费的Pro/BAAI/bge-m3。  

![](/imgs/7e4398db58ad318a.webp)


一般说来，免费的BAAI/bge-m3模型就够用。  
3\. 创建知识库  
配置完模型，就可以开始创建知识库了！  
点击左侧菜单栏的知识库图标->点击左上角的添加按钮->在弹窗里输入你的知识库名称，随便输，方便查找就行->选择嵌入模型。  
嵌入模型选择上一步中添加的免费模型BAAI/bge-m3就可以。  

![](/imgs/939414591fbb8308.webp)


接下来就可以往你创建好的知识库里添加资料，Cherry Studio支持各种类型的资料，比如文件、网址、笔记等等。  

![](/imgs/f0249ead8ce34073.webp)


以最常见的文件资料为例，直接把PDF拖拽进去，当看到文件右边的状态符号变为绿色的对勾，就说明该文件已经向量化完毕。  

![](/imgs/a0fe2e38e3667e24.webp)


4\. 和知识库对话  
添加完资料，就可以开始检索你的个人知识库了。  
两种方式使用。  
一种是直接在知识库最下面的搜索知识库，点击后进行搜索。  
输入你想搜索的内容，点击搜索按钮。就像下面这样。  

![](/imgs/2934fcfc2272a360.webp)


第二种方法则更为实用：直接在问答的过程中选中知识库，相当于给LLM添加了额外的上下文信息。  
在Cherry Studio的输入框下方，有一个知识库的图标，点击，选择你创建好的知识库。  

![](/imgs/fb2c2f312f13015f.webp)


选中后，知识库的图标会变成蓝色。  

![](/imgs/1313f785462d2973.webp)


这里我默认的模型是DeepSeek-R1。回答前，会先对知识库进行检索，然后把搜索结果投喂给DeepSeek-R1，由模型进行整理、分析，再生成最终的答案。  
可以看到，DeepSeek-R1的回答结果是基于知识库内容产生的。  

![](/imgs/93b9a4fd0aa853b8.webp)


附上DeepSeek-R1的思考过程，一如既往的给力。  

![](/imgs/213fcd89bb418ebd.webp)

  

近期，由于大量用户涌入硅基流动使用DeepSeek模型，导致硅基的DeepSeek-R1调用可能卡顿，并且思考时间有时离谱的长。所以，上车要趁早啊。  

![](/imgs/c112b8c0b4ab5215.webp)

  

> 来源：[https://mp.weixin.qq.com/s/wa\_Swhj2cAvB9Btt2\_-Dbg](https://mp.weixin.qq.com/s/wa_Swhj2cAvB9Btt2_-Dbg)

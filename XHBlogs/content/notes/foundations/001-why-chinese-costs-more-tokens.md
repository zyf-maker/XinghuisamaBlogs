---
title: 中文为什么比英文更费 token
summary: 从 BPE 合并规则解释中英 token 差异，给出可跑的估算脚本与成本折算。
order: 1
level: 入门
tags: [token, 成本, 分词]
updated: 2026-11-08
readingTime: 5
---

同一段技术说明，中文写 800 字，英文写 500 词，账单上中文那一版往往更贵。不是中文「更啰嗦」，是分词器对中文的压缩率本来就差。这件事在写长文档、跑批量任务、做 RAG 切块的时候，会直接变成钱和上下文预算。

## 一个汉字到底占几个 token

先破除一个流传很广的说法：「中文一个字一个 token」。这只在少数高频字上成立。

现代主流模型用的是字节级 BPE（byte-level BPE）。词表的起点是 256 个字节，不是字符。英文单词能整块进词表，因为 `the`、`ing`、`tion` 这类组合在训练语料里出现得足够多，合并规则会把它们粘成一个 token。中文没有这个待遇：一个常用汉字在 UTF-8 里占 3 个字节，模型得先学会「这三个字节经常一起出现」，才可能把它合并成一个 token。常用字学得会，次常用字和生僻字学不会，于是退化成 2 到 3 个 token。

量级上，用 `cl100k_base` 这类偏英文的词表，中文常见文本大约 1 个汉字对应 1 到 1.5 个 token，标点、数字、中英混排更差。换成 `o200k_base` 或国产模型自带的词表，能压到 0.6 到 0.9。英文这边，一个 token 平均覆盖 4 个字符左右，也就是一个 5 字母的单词接近 1 个 token。两边一对比，同样信息量下中文的 token 数常常是英文的 1.5 到 2 倍。

## 差异来自词表怎么长出来的

词表大小是固定的，几万到二十万条合并规则。每条规则的位置都有限，给英文的子词留得多了，给中文的就少。

这解释了几个反直觉的现象。第一，古文和成语比现代白话更费 token，因为训练语料里的占比低，合并规则覆盖不到。第二，专业术语在中文里经常是逐字切开的，`图神经网络` 可能切成 `图` `神经` `网络` 三段，而 `GNN` 是一个 token。第三，全角标点、中文引号、破折号经常单独占一个 token，一段排版讲究的中文文本，标点开销能到 15%。

我最初做文档切块时就踩过这个坑。按 500 字符切，以为一块差不多 200 token，实际喂进去接近 600，几个块拼起来直接顶到窗口上限，报 `context_length_exceeded`。字符数和 token 数之间没有稳定比例，只能实测。

## 自己量一遍，别信别人的表格

词表版本一变，所有比例都变。最可靠的做法是用当前要调的模型自己的 tokenizer 量一遍。

```python
import tiktoken

SAMPLES = {
    "zh_tech": "图神经网络在分子性质预测上的主要瓶颈是标注数据稀缺，"
               "以及消息传递层数增加后出现的过平滑现象。",
    "en_tech": "The main bottleneck of graph neural networks for molecular "
               "property prediction is scarce labeled data and over-smoothing "
               "as message passing depth increases.",
    "zh_code": "把 embeddings 缓存到本地，按 content_hash 做键，避免重复请求。",
    "en_code": "Cache embeddings locally, keyed by content_hash, to avoid "
               "duplicate requests.",
}

def measure(enc_name: str) -> None:
    enc = tiktoken.get_encoding(enc_name)
    zh = en = 0
    for text in (SAMPLES["zh_tech"], SAMPLES["zh_code"]):
        zh += len(enc.encode(text))
    for text in (SAMPLES["en_tech"], SAMPLES["en_code"]):
        en += len(enc.encode(text))
    zh_chars = sum(len(SAMPLES[k]) for k in ("zh_tech", "zh_code"))
    en_chars = sum(len(SAMPLES[k]) for k in ("en_tech", "en_code"))
    print(
        f"{enc_name:14s} zh={zh:4d} tok ({zh / zh_chars:.2f} tok/char)"
        f"  en={en:4d} tok ({en / en_chars:.2f} tok/char)"
        f"  ratio={zh / en:.2f}"
    )

for name in ("cl100k_base", "o200k_base"):
    measure(name)
```

`pip install tiktoken` 之后直接跑。输出的 `ratio` 就是这段样本里中文相对英文的 token 倍数，`tok/char` 可以直接拿去乘你的字符数做粗估。换成别的模型，把 `get_encoding` 换掉，或者用对应厂商的 tokenizer 库，逻辑一样。

粗估时我会用 1.6 这个系数给中文做第一版预算，然后用真实样本回填。误差在一两天内就能收敛。

## 成本怎么折算

单价按百万 token 计的时候，语言差异会被放大。假设输入单价 2 元每百万 token、输出单价 8 元每百万 token，一篇 3000 字的中文文章，输入侧大概是 4500 token，成本 0.009 元；英文版 2000 词约 2600 token，成本 0.0052 元。单篇看着无所谓，乘上每天几千篇的批处理就是另一回事。

| 场景 | 中文 token 估算 | 英文 token 估算 | 相对成本 | 备注 |
| --- | --- | --- | --- | --- |
| 3000 字技术文档 | 约 4500 | 约 2600 | 1.7x | 术语多的更差 |
| 500 字产品文案 | 约 700 | 约 420 | 1.7x | 标点占比高 |
| 代码注释中英混排 | 约 1.2 tok/字 | 约 0.25 tok/字符 | 1.4x | 保留英文标识符能省 |
| 古文中译摘要 | 约 2.0 tok/字 | 不适用 | — | 生僻字退化严重 |

更值得注意的是输出侧。输出单价通常是输入的 3 到 4 倍，而模型写中文时更爱铺陈。同一个 prompt，要求「用英文写 3 条要点」和「用中文写 3 条要点」，后者 token 数经常多出 60%，成本差距比输入侧更明显。做批量摘要时我会明确限制输出字数和条数，这不是文风偏好，是预算控制。

## 省 token 的几种实际做法

保留英文标识符。变量名、函数名、库名、缩写不翻译，`embedding` 就写 `embedding`。`图神经网络` 切成 3 段，`GNN` 是 1 个 token，混排反而更省。

控制标点密度。中文全角括号、书名号、省略号各占一个 token，长文档里用半角括号和直引号能省下几个百分点。

切块按 token 不按字符。上传前先用 tokenizer 数一遍，留出输出预算，别等报错。

提示词用英文写、内容用中文喂。指令部分英文更紧凑，任务内容该是什么语言就是什么语言，两边都不别扭。

这些做法加起来能把中文任务的 token 开销压下来两三成，够抵消大部分词表劣势。剩下的差距，只能等词表迭代。

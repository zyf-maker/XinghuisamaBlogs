---
title: 三个采样参数的实际关系
summary: 从 logits 到采样结果的实际流程，给出各任务区间的参数表与常见误配。
order: 2
level: 入门
tags: [采样, temperature, 参数调优]
updated: 2026-11-08
readingTime: 6
---

很少有参数像 temperature 这样被随手设置又被误解。很多人调它像拧音量旋钮，觉得「大一点更有创意，小一点更准确」。实际改动的是 logits 被缩放的倍数，连带影响后面 top_p、top_k 的候选集，三个参数是联动的，不是三个独立旋钮。

## 从 logits 到最终选中的 token

模型的最后一层吐出一组 logits，长度等于词表大小，十几万个数。流程是固定的四步：先除 temperature，再按 top_k 截断，再按 top_p 累积截断，最后归一化成概率分布做采样。

temperature 除在 softmax 之前，所以它改的是分布的陡峭程度。T=1 是模型原本的样子；T=0.2 会把差距放大五倍，原本 30% 概率的 token 掉到几乎为零；T=1.5 会把分布压平，长尾里那些本来不该出现的词开始有份。

关键点在于：temperature 不改变候选集，只改变候选集内部的相对权重。而 top_p、top_k 是在改候选集本身。所以「T 调低一点更稳」和「top_p 调低一点更稳」不是同一件事，前者让第一名的优势变大，后者直接砍掉尾巴。

## top_k 与 top_p 的分工

top_k 是硬截断：只留概率最高的 k 个，其余置零。它的问题是概率分布的形状随上下文变化很大。有的位置前 3 个 token 就占 95%，k=50 留了 47 个纯噪声；有的位置前 50 个加起来才 60%，k=50 反而把合理选项砍了。固定 k 无法适应这种变化。

top_p 是软截断：按概率从高到低累加，累积到 p 就停。分布尖锐时自动只剩几个候选，分布平坦时保留几十个。这就是所谓的 nucleus sampling，适应性明显更好。

两者同时开的时候，先 top_k 再 top_p，取交集。实践中我基本只用 top_p，top_k 留默认或直接关掉。同时把两个都调到很低，会造成候选集过窄，输出开始出现复读和固定句式，这是很多人误以为「模型变笨」的真实原因。

## 具体设多少

下面这张表是我自己跑的几类任务收敛后的值，不是理论推荐，是撞过墙之后留下来的。

| 任务类型 | temperature | top_p | top_k | 主要失败模式 |
| --- | --- | --- | --- | --- |
| 结构化抽取、JSON 输出 | 0 – 0.2 | 0.1 – 0.3 | 关闭 | 字段漂移、多写解释 |
| 代码生成、修改 | 0.1 – 0.3 | 0.5 | 关闭 | 语法正确但逻辑跑偏 |
| 技术问答、文档改写 | 0.3 – 0.6 | 0.9 | 关闭 | 事实漂移 |
| 摘要、要点压缩 | 0.3 | 0.8 | 关闭 | 漏掉限定条件 |
| 头脑风暴、命名 | 0.8 – 1.0 | 0.95 | 关闭 | 重复同一批想法 |
| 创意写作初稿 | 1.0 – 1.2 | 0.95 | 关闭 | 跑题、节奏失控 |

几个经验值。写代码不要设 0。T=0 是贪心解码，每一步都选最高概率的 token，会让模型反复走同一条最保守的路径，遇到需要换个写法绕开错误的地方就卡死。0.2 保留一点随机性，重试时能给出不同实现。

JSON 输出不要只靠 temperature。低温度能减少格式错误，但拦不住模型在字段里加一句「以上内容仅供参考」。该用 schema 约束和校验重试，参数只是辅助。

T 超过 1.3 之后收益迅速衰减，输出开始出现语义漂移：句子通顺，前后指代开始错乱。做创意写作我用 1.0 到 1.2，再高就要靠人工重写，反而更慢。

## 一次踩坑的记录

早期做论文摘要抽取，我把 temperature 设成 0.7、top_p 设成 0.5，以为双保险。结果抽取准确率一直上不去，同一个输入跑三次能出三种字段名。查了半天 prompt，最后发现是 top_p=0.5 把正确字段名挤出了候选集：模型在某个位置想输出 `sample_size`，但累积概率前 50% 里只到 `sample`，于是它补了个 `count` 上去。

把 top_p 提到 0.9、temperature 降到 0.2，字段一致性问题当天消失。教训是：**约束输出格式靠降 T，不靠砍 top_p**。砍 top_p 砍掉的是词汇多样性，不是格式稳定性，而且砍得越狠，模型越容易在细节上用近义词凑。

## 可复现的对比脚本

调参最怕凭感觉。写个小脚本固定输入跑多轮，统计结构合法率和内容差异度，比看几条输出靠谱。

```python
import json
from collections import Counter
from openai import OpenAI

client = OpenAI()
PROMPT = "从下面的句子中抽取实验参数，只输出 JSON，键为 solvent、temperature_k、yield_pct。\n句子：该反应在乙腈中于 353 K 进行，产率 78%。"

def run(temp: float, top_p: float, n: int = 20) -> tuple[float, int]:
    ok, keysets = 0, Counter()
    for _ in range(n):
        r = client.chat.completions.create(
            model="MODEL_NAME",
            messages=[{"role": "user", "content": PROMPT}],
            temperature=temp,
            top_p=top_p,
            max_tokens=120,
        )
        raw = r.choices[0].message.content.strip()
        try:
            obj = json.loads(raw)
        except json.JSONDecodeError:
            continue
        ok += 1
        keysets[tuple(sorted(obj.keys()))] += 1
    return ok / n, len(keysets)

for t, p in [(0.0, 1.0), (0.2, 0.9), (0.7, 0.5), (1.0, 0.95)]:
    rate, variants = run(t, p)
    print(f"T={t:<4} p={p:<5} json_ok={rate:.0%} key_variants={variants}")
```

跑完会看到 T=0.7/p=0.5 那行 `key_variants` 明显偏高，跟我在线上遇到的问题对得上。这个脚本的价值不在数字精确，在于把「感觉不太稳」变成一个能对比的比率。

## 几个容易被忽略的点

`max_tokens` 截断发生在采样之后，被截断的输出看起来像模型没写完，容易被误判成参数问题。先确认不是长度限制。

流式输出时，前几个 token 的随机性会决定整段走向。要稳定，前几十个 token 的温度影响比后面大得多。有的推理服务支持按位置调温度，但多数 API 不支持，别指望。

同一组参数换模型不一定成立。不同厂商的 logits 尺度不一样，A 模型上合适的 0.3 在 B 模型上可能过于保守。参数要跟着模型重新标定一次，别跨模型抄配置。

推理模型（reasoning 类）普遍忽略 temperature，内部有自己的采样策略。给它们设 0.1 不会有额外收益，这一点值得单独写一篇。

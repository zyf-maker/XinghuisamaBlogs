---
title: "128k 窗口实际能用多少"
summary: "用针在草堆测试量出真实可用窗口，标称 128k 的模型稳定线只在 61% 附近，三条查询十分钟能复现。"
order: 1
level: "进阶"
tags: [上下文窗口, 长文召回, 实测方法]
updated: "2026-11-08"
readingTime: 7
---

去年给一个合同审查工具接 128k 窗口，第一版把整份 PDF 整段塞进去，40 页以内答得挺好，60 页以上开始漏条款。我以为是提示词不够硬，改了三轮指令没有起色。后来做了一次定位测试才发现问题不在指令：填充到 76k 之后，模型对中段内容的命中率掉到六成以下。这个模型标称 128k，我这边稳定可用的线画在 78k。

后面又量了两个模型，比例落在 55% 到 65% 之间。不是巧合，是结构性的。

## 针在草堆要改两处

常见做法是随机塞一句「魔法词是 12345」，问模型魔法词是什么，位置取开头、中间、结尾三档。这个测法只能得到「能不能找到」，得不到边界在哪，而且单条事实太容易被蒙——模型答不出时会编一个，你把编的算失败、算成功，结论都会歪。

我改了两处。事实换成不可猜的结构化串，形如 `7F3K-91QX`，四位大写字母数字加连字符，模型没有先验可以顺手编。位置从三档加到九档，按 12.5% 步进，每档埋三条不同的事实，一共 27 个探针，判定用精确匹配，不看语义相似度。

第二处是控制填充物。第一版拿无关的英文小说当草堆，召回明显偏高，因为小说句子短、重复多，模型顺着读下去不吃力。换成同领域的合同条款后数字掉了一截。草堆的语义密度直接影响结果，必须用你真实场景的文本，别用 lorem ipsum。

指标要分两个看。定位率问「第几段出现了 7F3K-91QX」，看模型能不能指出位置；问答准确率直接问该编号对应的字段值。前者测检索，后者测利用。两个都掉才是窗口真的不够，只掉前者往往是输出格式的问题。

## 衰减曲线是位置相关的

单次测试的曲线是个不对称的 U：开头 0.95，25% 处 0.88，50% 处 0.62，75% 处 0.79，结尾 0.93。谷底在 45% 到 55% 之间，末端比开头略低。

| 填充长度 | 开头 | 25% | 50% | 75% | 结尾 | 平均 |
| --- | --- | --- | --- | --- | --- | --- |
| 16k | 1.00 | 0.97 | 0.93 | 0.97 | 1.00 | 0.97 |
| 48k | 0.97 | 0.93 | 0.83 | 0.90 | 0.97 | 0.92 |
| 78k | 0.93 | 0.87 | 0.62 | 0.80 | 0.90 | 0.82 |
| 100k | 0.90 | 0.77 | 0.43 | 0.67 | 0.83 | 0.72 |
| 128k | 0.83 | 0.60 | 0.30 | 0.53 | 0.73 | 0.60 |

16k 以内基本无损，48k 开始中间出现凹陷，78k 之后中段掉得比两端快得多。这个形状说明衰减不是均匀稀释，而是和位置绑定的。工程含义很直接：关键信息注定落在中段时——按时间排序的日志、按章节排序的合同——有效窗口要按最差位置算，不能按平均值。

我把 0.8 设成及格线，取中段第一次跌破 0.8 的长度当可用窗口，78k，正好是标称值的 61%。换成一律按平均分算，会得到 0.82 的错觉，然后在 90k 的输入上翻车。

## 另外 40% 去哪了

明账那一块是输出预留。128k 是输入加输出的合计，留 4k 给回答，输入上限就是 124k，文档里写着。

暗账那块是系统提示和工具描述。一个挂 12 个工具的 agent，工具 schema 加系统指令能吃掉 3k 到 6k，而且每一轮都重复。多轮对话里它还在涨。这块最容易被忽略，因为代码里你看到的只是「我传了文档」，实际发出去的 token 数要用响应的 usage 字段核，别用自己估的。

剩下的是估算误差。中英混排按「字符数除以 1.5」估 token，误差能到 20%。128k 的 20% 是 25k，比前两块加起来还大。别用字数估，用 tokenizer 数，中文标点和换行都会各自占位。

## 多轮对话里这个数还在缩

单轮测出来的 78k 是上限，多轮场景下每轮都在往下掉，因为历史消息累积而工具返回的 JSON 也在累积。我记过一次真实会话的 usage 序列：第 1 轮 prompt 是 6.2k，第 5 轮 19.8k，第 9 轮 34.5k，第 12 轮触发了压缩逻辑。同一份文档如果在第 9 轮才被引用，它实际能分到的预算只有首轮的三分之一。

| 轮次 | 累计 prompt | 剩余可用 | 中段召回 |
| --- | --- | --- | --- |
| 1 | 6.2k | 72k | 0.88 |
| 5 | 19.8k | 58k | 0.84 |
| 9 | 34.5k | 44k | 0.79 |
| 12 | 51.0k | 27k | 0.71 |

处理办法是把压缩阈值设在可用窗口的 60%，而不是标称值。到阈值就把工具返回的旧结果替换成一行摘要，保留原始 id 以便回查。这一步做完，同一会话能撑到 20 轮以上。

## 三条查询量出边界

不用 27 个探针也能出结论。三条位置够用：5% 处一条、50% 处一条、95% 处一条，同一长度下三条全对算通过，中段那条错就直接判不通过。每个位置跑三次取多数，一个长度 9 次调用，二分六轮约 50 次，串行十分钟能跑完。

```python
import random
from openai import OpenAI

client = OpenAI(base_url=API_BASE, api_key=API_KEY)
MODEL = "MODEL_NAME"
FILLER = open("filler.txt", encoding="utf-8").read()  # 换成真实业务文本

def make_code(rng: random.Random) -> str:
    head = "".join(rng.choice("ABCDEFGHJKLMNPQRSTUVWXYZ23456789") for _ in range(4))
    tail = "".join(rng.choice("0123456789") for _ in range(4))
    return f"{head}-{tail}"

def build(target_tokens: int, depth: float, rng: random.Random):
    code = make_code(rng)
    chars = int(target_tokens * 1.1)      # 中文约 1 字 1 token，留 10% 余量
    cut = int(chars * depth)
    hay = FILLER[:cut] + f"\n\n[记录编号 {code}]\n\n" + FILLER[cut:chars]
    return hay, code

def probe(target_tokens: int, depth: float, rng: random.Random):
    hay, code = build(target_tokens, depth, rng)
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "只依据材料回答。材料中没有就输出 NONE。"},
            {"role": "user", "content": f"{hay}\n\n材料里出现的记录编号是什么？只输出编号。"},
        ],
        temperature=0,
        max_tokens=16,
    )
    ans = (resp.choices[0].message.content or "").strip().upper()
    return ans == code, resp.usage.prompt_tokens

DEPTHS = (0.05, 0.50, 0.95)   # 头、中、尾三个探针

def judge(target_tokens: int, rng: random.Random) -> bool:
    """每个位置跑三次取多数：temperature=0 也不是确定输出。"""
    votes = []
    for depth in DEPTHS:
        hits = sum(probe(target_tokens, depth, rng)[0] for _ in range(3))
        votes.append(hits >= 2)
    return all(votes)          # 中段那条掉队就整档不通过

def usable_window(lo: int = 8_000, hi: int = 128_000) -> int:
    rng = random.Random(42)
    while hi - lo > 2_000:
        mid = (lo + hi) // 2
        ok = judge(mid, rng)
        actual = probe(mid, 0.5, rng)[1]
        print(f"target={mid:>7} actual={actual:>7} -> {'PASS' if ok else 'FAIL'}")
        lo, hi = (mid, hi) if ok else (lo, mid)
    return lo

print("safe input tokens:", usable_window())
```

几个坑写在这里。`temperature=0` 不等于确定，同一条查询跑三次仍可能有一次不同，边界值要重复三次取多数。`max_tokens=16` 是为了逼模型直接给编号，给到 200 它会先解释再回答，判定就多一层噪音。`build` 里的 `1.1` 是粗估系数，测完把 actual 和你要的 target 对一遍，系数偏了就调。

拿到数字后写成常量 `SAFE_INPUT_TOKENS`，组装上下文时按它算预算，超出就走检索或分段。这个值随模型版本变，换模型重跑一次，成本不到一块钱，比上线后返工便宜。

## 换模型就重测

同一家的两个版本，可用窗口能差 15 个百分点。我遇到过一次小版本升级，标称从 128k 提到 200k，实测中段及格线反而从 78k 降到 71k，因为新的分词器和长文训练数据的配比都变了。

所以别把「128k」当预算用，把实测值当预算用。三条查询、十分钟、一次 tokenizer 校准，换来的是一整类「模型好像没看见」的故障不再出现。

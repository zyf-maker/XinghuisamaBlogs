---
title: "同 prompt 在四家模型上的差异"
summary: "固定 40 条样本、三维打分、成对比较，把模型差异变成一张可复核的 csv，而不是凭手感选型。"
order: 2
level: "进阶"
tags: [模型对比, 评分表, 评测脚本]
updated: "2026-11-08"
readingTime: 7
---

给一个客服摘要功能选模型时，我先凭手感挑了 A 家。上线两周投诉集中在「摘要里多出客户没说的话」。回头拿 40 条真实对话跑一遍，A 的事实错误率 22%，B 家 9%，而 B 的单价只有 A 的 0.4 倍。手感选了最贵且最差的那个。

那次之后我把选型流程固定下来：样本集先冻住，维度只留三个，评分靠两两对比而不是绝对分。整套跑完半天，比我之前来回试 prompt 的两周便宜得多。

## 样本集先冻住

40 条起步，按任务难度分三层：12 条常规、16 条边界、12 条故意刁难。常规是正常输入，边界是不完整或歧义输入，刁难那层放长文本、混语言、带矛盾指令的样本。三层比例写死，后面加样本时按同样比例追加，不然几轮下来常规样本越堆越多，分数会虚高。

每条样本存三个字段：`case_id`、`input`、`expect_key_points`。第三项不是标准答案，是「必须出现的信息点」列表，3 到 5 条，判定时按点命中，不看措辞。摘要这类任务没有唯一正确答案，按点判比按句比稳。

同一个 prompt 冻结成文件，四家共用一个字符串，不做任何按厂商的微调。这条听起来废话，实际最容易破：调 A 家时顺手加了一句「请用中文」，其他三家就跟不上了，等于在比四个不同的 prompt。prompt 里只放任务本身，厂商相关的参数走 API 参数层。

## 只留三个维度

维度越多越评不动。砍到三个，每个都能机械判定。

| 维度 | 判定方式 | 权重 | 失败样本的典型表现 |
| --- | --- | --- | --- |
| 格式合规 | 正则或 JSON 解析，二值 | 0.3 | 多出前言、字段名带空格 |
| 事实准确 | 必含信息点命中率 | 0.5 | 编造客户未说的诉求 |
| 长度合理 | 与期望长度的比值落在 0.6 到 1.6 | 0.2 | 常规样本写 400 字 |

格式合规二值判定，过就是 1，不过就是 0，不给半分，避免评分者心软。事实准确用命中点数除以应含点数，这是唯一需要人看的地方，但只看点不看文笔，30 秒能判一条。长度用比值而非绝对差，因为不同样本的合理长度本来就差几倍。

三个维度的排序有讲究。事实准确权重最高，因为它是业务事故的来源；格式合规排第二，因为它决定你能不能直接程序化消费；长度垫底，但它能抓到「废话多」这个常见退化。加权总分只用来排序，不能用来对外宣称「A 比 B 好 12%」，那是过度解读。

## 绝对值靠不住，成对比较才稳

让评分者给 1 到 5 分，同一条输出今天给 3 分明天给 4 分。我试过，同一批输出隔一周重评，自身一致率只有 71%。改成两两对比：同一条样本，把 A 和 B 的输出并排放，问「哪一个的事实错误更少」，一致率提到 93%。

对比要消除位置偏置。随机交换左右顺序，每次对比跑两遍，两遍结论不一致就记为平局。别省这一步，我第一版没交换，结果排第一的模型正好总被放在左边。

四家两两组合是 6 对，乘 40 条样本乘 2 次顺序，480 次判定。全人工不现实，实际做法是：格式和长度用脚本判，事实维度用脚本算点命中率，只有命中率差距在 5% 以内的疑难对才人工看，落到人手上的不到 40 条。

## 打分表长这样

csv 用长表而非宽表，一行一个「样本 × 模型」的结果，加一次对比就是多几行，不用改表头。

```csv
case_id,model,run,latency_ms,in_tokens,out_tokens,format_ok,points_hit,points_total,len_ratio,note
c001,model-a,1,1840,412,168,1,4,5,1.12,
c001,model-b,1,2210,412,240,1,5,5,1.61,
c001,model-c,1,960,412,0,0,0,5,0.00,empty_content
c002,model-a,1,1720,388,142,1,3,3,0.94,
```

`run` 字段是重跑次数，同一配置至少跑 3 次。`note` 只在异常时填，写清失败模式，比如 `empty_content`、`truncated`、`refused_style`。这张表的价值在 `note` 列，它把「分数低」变成「为什么低」，后面调 prompt 全靠它。

`latency_ms` 记总耗时，`out_tokens` 为 0 而 `latency_ms` 正常，基本就是返回了空内容，这类必须单独标出来，不然平均分会把它当成功样本摊掉。

## 跑对比的脚本骨架

脚本只做三件事：调四家、落表、算汇总。评分函数留成可替换的，格式判定按任务换正则。

```python
import csv, json, os, re, time, statistics, urllib.request
from concurrent.futures import ThreadPoolExecutor

# 每家一组 base_url / key / 真实模型 id，全从环境变量读，不写进仓库
MODELS = {
    "model-a": dict(base_url=os.environ["A_URL"], key=os.environ["A_KEY"], name=os.environ["A_ID"]),
    "model-b": dict(base_url=os.environ["B_URL"], key=os.environ["B_KEY"], name=os.environ["B_ID"]),
    "model-c": dict(base_url=os.environ["C_URL"], key=os.environ["C_KEY"], name=os.environ["C_ID"]),
    "model-d": dict(base_url=os.environ["D_URL"], key=os.environ["D_KEY"], name=os.environ["D_ID"]),
}
PROMPT = open("prompt.txt", encoding="utf-8").read()
CASES = [json.loads(l) for l in open("cases.jsonl", encoding="utf-8")]
RUNS = 3

def post_json(url: str, body: dict, key: str, timeout: int = 90) -> dict:
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))

def score_format(text: str) -> int:
    if not text.strip():
        return 0
    if re.search(r"^(好的|当然|以下是)", text):
        return 0
    return 1

def score_points(text: str, points: list[str]) -> tuple[int, int]:
    hit = sum(1 for p in points if p in text)
    return hit, len(points)

def call(model: str, case: dict, run: int) -> dict:
    cfg = MODELS[model]
    body = {
        "model": cfg["name"],
        "messages": [{"role": "user", "content": PROMPT.replace("{{text}}", case["input"])}],
        "temperature": 0,
        "max_tokens": 400,
    }
    t0 = time.perf_counter()
    r = post_json(f"{cfg['base_url']}/chat/completions", body, cfg["key"])
    dt = int((time.perf_counter() - t0) * 1000)
    text = (r.get("choices") or [{}])[0].get("message", {}).get("content") or ""
    usage = r.get("usage") or {}
    hit, total = score_points(text, case["expect_key_points"])
    return {
        "case_id": case["case_id"], "model": model, "run": run,
        "latency_ms": dt,
        "in_tokens": usage.get("prompt_tokens", 0),
        "out_tokens": usage.get("completion_tokens", 0),
        "format_ok": score_format(text),
        "points_hit": hit, "points_total": total,
        "len_ratio": round(len(text) / max(case["expect_len"], 1), 2),
        "note": "" if text.strip() else "empty_content",
    }

def summarize(rows: list[dict]) -> None:
    for m in MODELS:
        sub = [r for r in rows if r["model"] == m]
        fmt = sum(r["format_ok"] for r in sub) / len(sub)
        acc = sum(r["points_hit"] / max(r["points_total"], 1) for r in sub) / len(sub)
        p50 = statistics.median(r["latency_ms"] for r in sub)
        print(f"{m:10s} fmt={fmt:.2f} acc={acc:.2f} p50={p50:.0f}ms")

with ThreadPoolExecutor(max_workers=4) as pool:
    jobs = [(m, c, i + 1) for m in MODELS for c in CASES for i in range(RUNS)]
    rows = list(pool.map(lambda j: call(*j), jobs))
with open("scores.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0]))
    w.writeheader()
    w.writerows(rows)
summarize(rows)
```

`score_points` 用子串匹配，中文场景够用，换成英文要先做大小写归一和标点归一，否则同一个词因为复数形式判为未命中。`latency_ms` 记录的是含网络的总耗时，模型推理占多少要另算，别拿这个数去谈推理速度。

占位符用 `{{text}}` 加 `str.replace`，不用 `str.format`。prompt 正文里只要出现一对花括号——比如要求模型输出 `{"topic": ...}` 示例——`format` 就会抛 `KeyError: '"topic"'`，这类报错我在两版脚本上都踩过。替换成 `replace` 之后，花括号随便写。

`ThreadPoolExecutor` 的并发数按厂商限流设，四家共用一个 4 线程池时，某一家慢会拖住整体，实际使用时按模型分组、每组独立池更合理。

## 分数之外还要看两件事

一件事是重跑稳定性。同一配置跑 3 次，如果 `format_ok` 的方差超过 0.15，说明这个提示词在该模型上不稳，分数再高也不能用。我在 A 家碰到过：平均格式合规 0.94，但其中 6 条样本三次结果一次过两次不过，等于每次调用有三分之一的概率要重试。

另一件事是失败模式的一致性。B 家事实准确率最高，但它失败时倾向于整段编造，C 家失败时倾向于给一句「材料不足」。前者在业务上更危险，因为看不出来错。评分表里加一列失败类型，比单纯比总分有信息量得多。

选型结论写成一页：三个维度各自的数、稳定性、失败模式、单价。我当时那张表上 B 家三项都不差且单价最低，直接换掉 A 家，投诉率一周内从 3.1% 降到 0.8%。

## 别拿总分做承诺

这套流程能给的是「在我的 40 条样本上，B 优于 A」，仅此而已。样本换了结论会变，任务从摘要换成抽取，排序可能反转。所以还要留一套回归集：每次换模型或改 prompt，重跑同一批样本，看三维数字有没有退化超过 5 个百分点。把评测变成上线前的一道闸，比一次性选型报告有用得多。

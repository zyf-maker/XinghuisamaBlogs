---
title: 把提示词改动变成可复现的对比
summary: 用固定样本集与成对比较跑提示词回归，替代「感觉变好了」的判断。
order: 4
level: 深入
tags: [回归测试, 评估, 提示词]
updated: 2026-11-08
readingTime: 6
---

改一句提示词，跑两条样例看着更顺眼，就上线。三周后发现某类输入全线崩了，回滚时已经说不清是哪次改动引入的。这个循环我走过不止一遍，问题不在改得对错，在于没有可复现的对比。

## 先定义「变好」

评估的第一道坎不是工具，是标准。同一条输出，两个人可能给出不同判断。「更准确」在抽取任务里可以量化，在写作任务里不行。

可量化的用程序判定：字段是否齐全、值是否等于标准答案、JSON 是否合法、引用是否在原文中出现。这类判定没有争议，优先做。

不可量化的用成对比较：给评审两条输出（A 和 B，不告诉来源），问哪个更好，或者一样。不要用 1 到 5 分打分，同一批人跨时间的打分尺度会漂移，成对比较的稳定性高得多。

第三种是 LLM 作为评审。成本低、可扩展，但有两个已知偏差要处理：倾向选择更长的输出，倾向选择排在前面的输出。前者可以通过在提示里明确「长度不作为优劣依据」缓解，后者必须靠随机交换 A/B 位置来消除，并且统计时把交换过的样本合并。

## 样本集要怎么建

规模上，50 到 100 条足够发现方向性问题。少于 30 条，一次改动的效应淹没在噪声里。超过 200 条，人工复核的成本撑不住，除非全自动判定。

构成上，按难度分层。头部常见输入占一半，边界样本占三成，已知失败样本占两成。第三类最关键：每次修完的 bug 都要沉淀成样本，否则同一个问题会以不同形式回来。

每条样本存四样东西：输入、期望输出的关键约束（不必是完整标准答案）、难度标签、来源。期望输出写成约束而不是全文，是因为完整答案会随着业务口径变化而过期，约束更稳定。

样本集要冻结。改动样本和改动提示词不能在同一次提交里进行，否则无法归因。

## 一套最小可用的回归流程

原则是：一次只改一个变量，跑全部样本，看成对结果，记录结论。

一条样本就是一行 JSON，字段固定为 `id`、`input`、`expect`、`must_have`、`difficulty`、`source`。目录约定如下，`cases` 一旦冻结就不再随手改。

| 路径 | 内容 | 变更规则 |
| --- | --- | --- |
| `evals/cases/*.jsonl` | 冻结样本集 | 只增不改，新增需评审 |
| `evals/prompts/v1.txt` | 当前基线提示 | 只在提升基线时更新 |
| `evals/prompts/v2.txt` | 待测提示 | 每次实验新建 |
| `evals/runs/<tag>.jsonl` | 单次运行结果 | 只追加，不覆盖 |

```python
import json, pathlib
from concurrent.futures import ThreadPoolExecutor
from openai import OpenAI

client = OpenAI()
ROOT = pathlib.Path("evals")

def load_cases() -> list[dict]:
    cases = []
    for f in sorted((ROOT / "cases").glob("*.jsonl")):
        cases += [json.loads(l) for l in f.read_text("utf-8").splitlines() if l.strip()]
    return cases

def run_one(prompt: str, case: dict, tag: str) -> dict:
    resp = client.chat.completions.create(
        model="MODEL_NAME",
        messages=[{"role": "user", "content": prompt.replace("{{input}}", case["input"])}],
        temperature=0,
    )
    return {"id": case["id"], "tag": tag,
            "output": resp.choices[0].message.content,
            "in_tok": resp.usage.prompt_tokens,
            "out_tok": resp.usage.completion_tokens}

def run(prompt_path: pathlib.Path, tag: str) -> pathlib.Path:
    prompt = prompt_path.read_text("utf-8")
    cases = load_cases()
    with ThreadPoolExecutor(max_workers=8) as pool:
        rows = list(pool.map(lambda c: run_one(prompt, c, tag), cases))
    out = ROOT / "runs" / f"{tag}.jsonl"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(json.dumps(r, ensure_ascii=False) for r in rows), "utf-8")
    print(f"{tag}: {len(rows)} cases, avg_out_tok="
          f"{sum(r['out_tok'] for r in rows) / len(rows):.1f}")
    return out
```

温度固定为 0 是关键。带随机性的评估，两次跑同一份提示都会得到不同数字，无法判断差异来自改动还是噪声。如果任务本身需要温度大于零（比如创意类），那就跑三次取多数，成本翻三倍，但结论才站得住。

## 判定和对比

```python
def check(case: dict, output: str) -> bool:
    """返回该条是否通过。判定逻辑按任务替换。"""
    try:
        obj = json.loads(output)
    except json.JSONDecodeError:
        return False
    for key in case["must_have"]:
        if key not in obj:
            return False
    return all(str(obj.get(k)).strip() == str(v) for k, v in case["expect"].items())

def compare(tag_a: str, tag_b: str) -> None:
    a = {r["id"]: r for r in map(json.loads, (ROOT / "runs" / f"{tag_a}.jsonl").read_text("utf-8").splitlines())}
    b = {r["id"]: r for r in map(json.loads, (ROOT / "runs" / f"{tag_b}.jsonl").read_text("utf-8").splitlines())}
    cases = {c["id"]: c for c in load_cases()}
    win_b = win_a = tie = 0
    worse_ids = []
    for cid in cases:
        pa = check(cases[cid], a[cid]["output"])
        pb = check(cases[cid], b[cid]["output"])
        if pa and not pb:
            win_a += 1; worse_ids.append(cid)
        elif pb and not pa:
            win_b += 1
        else:
            tie += 1
    print(f"{tag_a}: {win_a}  {tag_b}: {win_b}  tie: {tie}")
    print("回归样本:", worse_ids[:10])
```

`worse_ids` 比总数有用。总数告诉你方向，具体 id 告诉你代价。一个改动让总体提升 5 个点，但让三类边界样本从全对变成全错，这 5 个点是假的。

样本量小的时候别信百分比。60 条样本上 3 条的差异就是 5%，没有统计意义。经验阈值：差异超过 8 条才认为有效，否则记为「无显著变化」。

## 一次真实的判断失误

改造一个摘要提示，加了「优先保留定量结论」这条约束。50 条样本跑下来，人工成对比较 32 比 18，看着是明显改进，上线了。

两周后收到反馈：财报类摘要开始丢失定性描述，比如「管理层对下半年需求持谨慎态度」这类句子消失了。原因是约束把注意力全导向数字，非量化的判断被当成可省略内容。我的样本集里财报类只有 4 条，占比 8%，这个损失在评估里根本没显形。

补的做法有两条。样本集按业务来源分层，每个来源至少 10 条，占比不超过 30%。以及，改动里任何带「优先」「重点」这类排序词的约束，都要专门加一类反向样本，验证它没有挤掉别的东西。

## 让这套东西持续跑起来

放在 CI 里，提示词文件变更时触发。跑完输出三个数：通过率、平均输出 token、平均延迟。第三个指标常被忽略，但一个让输出长度翻倍的改动，即使准确率提升，成本账也未必划算。

结果要留档，每次一行：日期、提示词哈希、模型版本、通过率、样本数。模型版本必须记，服务端模型更新会让对比失效，这时候只能重跑基线，不能拿新结果和旧结果比。

判定失败的样本自动进待审队列，人工确认后决定是否加入样本集。这个循环走顺之后，提示词改动会从「试试看」变成「有据可依」，回滚也有依据。

最后一条经验：不要追求把通过率刷到 100。样本集里那些始终失败的条目，往往暴露的是任务定义本身有问题，或者标注口径不一致。盯着它们改提示词，会得到一堆只为这几条服务的特殊规则，然后在新输入上崩得更厉害。

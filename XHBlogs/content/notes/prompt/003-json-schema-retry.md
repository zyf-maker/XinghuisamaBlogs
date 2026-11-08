---
title: 让模型输出合法 JSON
summary: JSON mode 与 schema 校验的边界，给出带修复重试的完整实现。
order: 3
level: 进阶
tags: [JSON, schema, 重试]
updated: 2026-11-08
readingTime: 5
---

让模型输出 JSON 有一道隐形的台阶：能产出 95% 合法的 JSON 很容易，把剩下 5% 处理掉才是工程问题。JSON mode 解决了大部分语法错误，但对语义错误无能为力，而后者更难排查。

## JSON mode 保证了什么

开启结构化输出后，服务端在解码阶段约束 token 选择，只允许构成合法 JSON 的序列。语法层面的失败率基本归零。它不保证的事有三件。

字段是否存在。你要求 `solvent` 和 `yield_pct`，它可能给你 `solvent_name` 和 `yield`。语法全对，业务全错。

类型是否正确。`yield_pct` 应该是数字，它给 `"78%"`。`null` 应该是 null，它给字符串 `"null"`。

值是否在约束范围内。枚举字段里出现你没定义的取值，或者数字超出物理合理区间。

这些都属于语义约束，schema 校验才能拦。所以正确的分层是：JSON mode 管语法，schema 校验管结构，业务规则管取值。三层各司其职。

## 用 schema 定义输出的形状

主流接口都支持传 JSON Schema，服务端据此约束解码。这时候 schema 不只是文档，是运行时约束。写 schema 时几个决定会直接影响成功率。

尽量少用嵌套。三层嵌套的对象，模型漏字段的概率显著上升。扁平化能解决大部分问题，把 `{"meta": {"yield": {"value": 78}}}` 改成 `{"yield_pct": 78}`。

枚举一定要显式列。写 `"type": "string"` 让模型自己发挥，会出现十几种写法。写 `"enum": ["高", "中", "低"]`，收敛到三个值。

必填项要标。不标 `required`，模型会按自己的判断省略字段，尤其是它认为「不重要」的。标了之后才会稳定出现。

数组加长度上限。`minItems` 和 `maxItems` 能防住模型列 30 条要点的情况，这在摘要任务里很常见。

可空字段用联合类型而不是空字符串。`["string", "null"]` 让模型明确区分「没有」和「空」，后处理不用猜。

## 失败重试要带信息

校验失败就重发一样的请求，是最常见的错误做法。温度大于零时可能碰巧过关，温度为零时必然重复同样的错误。

有效重试要把错误信息喂回去。把校验器抛出的具体路径和原因拼进下一轮提示，模型才知道改哪里。

```python
import json
from typing import Any
import jsonschema
from openai import OpenAI

client = OpenAI()
SCHEMA: dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "required": ["solvent", "temperature_k", "yield_pct", "confidence"],
    "properties": {
        "solvent": {"type": "string", "minLength": 1},
        "temperature_k": {"type": ["number", "null"], "minimum": 0, "maximum": 1200},
        "yield_pct": {"type": ["number", "null"], "minimum": 0, "maximum": 100},
        "confidence": {"type": "string", "enum": ["high", "medium", "low"]},
    },
}

def validate(raw: str) -> tuple[dict | None, str]:
    try:
        obj = json.loads(raw)
    except json.JSONDecodeError as e:
        return None, f"JSON 解析失败：{e.msg} at pos {e.pos}"
    try:
        jsonschema.validate(obj, SCHEMA)
    except jsonschema.ValidationError as e:
        path = "/".join(str(p) for p in e.absolute_path) or "<root>"
        return None, f"路径 {path} 校验失败：{e.message}"
    return obj, ""

def extract(text: str, max_attempts: int = 3) -> dict:
    messages = [
        {"role": "system", "content": "只输出符合 schema 的 JSON，不要解释。"},
        {"role": "user", "content": text},
    ]
    last_err = ""
    for attempt in range(1, max_attempts + 1):
        resp = client.chat.completions.create(
            model="MODEL_NAME",
            messages=messages,
            response_format={"type": "json_schema",
                             "json_schema": {"name": "extraction", "strict": True,
                                             "schema": SCHEMA}},
            temperature=0.1,
        )
        raw = resp.choices[0].message.content or ""
        obj, err = validate(raw)
        if obj is not None:
            return obj
        last_err = err
        print(f"[attempt {attempt}] {err}")
        messages += [
            {"role": "assistant", "content": raw},
            {"role": "user", "content":
                f"上面的输出不合法：{err}。请修正后重新输出完整 JSON，不要输出其他内容。"},
        ]
    raise ValueError(f"连续 {max_attempts} 次未通过校验：{last_err}")
```

关键是 `messages` 里保留了错误的那次输出。模型看到自己写的东西和具体错误，才知道要改哪一行。只给错误文字、不给原输出，它会重写一版全新的，可能引入新错误。

`additionalProperties: False` 那句别省。模型很爱加 `notes`、`explanation` 字段，加完之后解析器多出未知键，往下游传会炸。

## 比重试更省的做法

重试是兜底，不是主路径。降低首次失败率的几个手段，收益比重试高。

把 schema 用自然语言复述一遍。schema 是给解析器看的，模型对它的遵循不如对提示词。在提示里写「必须包含 solvent、temperature_k、yield_pct、confidence 四个字段，confidence 只能取 high/medium/low」，两处一致时准确率明显更高。

先给一个合法示例。一条正例比一段描述有效。注意示例要符合 schema，包括类型。

让模型先思考再输出。对判断类字段，先输出理由字段再输出结论字段，准确率更高。但理由字段会在最终 JSON 里，如果下游不要，得单独剥离，或者放在另一个字段里。

分两步走。第一步让它输出自由文本的分析，第二步用另一次调用把分析转成 JSON。第二步的输入是结构化的、短的，失败率极低。代价是两次调用，适合对准确率要求高、对成本不敏感的场景。

| 策略 | 首次成功率 | 额外成本 | 适用场景 |
| --- | --- | --- | --- |
| 仅 JSON mode | 中 | 无 | 字段少、格式宽松 |
| JSON mode + schema 约束 | 高 | 无 | 主流选择 |
| 加自然语言复述 | 更高 | 少量 token | 字段多、枚举多 |
| 加正例 | 更高 | 一条示例 | 字段语义难描述 |
| 两步走 | 最高 | 一次调用 | 高准确率要求 |
| 失败重试 | 兜底 | 按失败率 | 必须配 |

## 别忽略的边界

`null` 和缺失字段是两回事。schema 里标了 required 又允许 null，语义是「必须出现，可以是空」。想要「可以没有」，就别放进 required。这两件事模型分不清，得靠提示词说明。

数字精度。模型可能输出 `78.00000001`，`multipleOf` 或者事后 round 能解决。化学产率这种字段，保留一位小数就够。

枚举值的本地化。schema 定义 `high/medium/low`，模型有时会输出 `高/中/低`。schema 约束能拦住，但错误信息读起来很别扭。在提示里同时给出中英对照能减少这类失败。

最后，校验失败要能观测。把失败率、失败路径、重试次数打成指标，比看日志快得多。某个字段的失败率突然上升，通常是上游数据格式变了，不是模型退化。

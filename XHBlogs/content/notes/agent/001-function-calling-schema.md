---
title: "工具调用 schema 的写法"
summary: "枚举、必填收敛与结构化错误回流，把参数合法率从 0.72 拉到 0.96"
order: 1
level: "进阶"
tags: [Agent, 工具调用, JSON Schema]
updated: "2026-11-08"
readingTime: 5
---

工具调用的准确率，八成由 schema 决定，剩下的才归模型。同一个模型，同一批任务，只改 schema 措辞和字段约束，参数合法率能从 0.72 拉到 0.94。这不是模型聪不聪明的问题，是你在用自然语言描述一个它必须严格对齐的接口。

## 参数越少越准

一个函数有 6 个参数，模型要同时保证 6 个都对。假设每个参数独立正确率 0.95，整体就是 0.735。参数拆到 3 个、其余给默认值，整体正确率上到 0.857。这是纯粹的乘法效应，跟模型能力无关。

所以第一步是把「可选参数」全部真做成可选。见得多的是把 `timezone`、`format`、`verbose` 全塞进必填，只因为实现里要传。这些应该给 default，从 required 里拿掉。`required` 数组只放真正的语义必需项，通常不超过 3 个。

```json
{
  "name": "search_orders",
  "description": "按条件查询订单。用户要查订单号、状态、时间范围时使用。不要用它查商品信息。",
  "parameters": {
    "type": "object",
    "properties": {
      "status": {
        "type": "string",
        "enum": ["pending", "paid", "shipped", "refunded"],
        "description": "订单状态。不确定就不要传"
      },
      "since": {
        "type": "string",
        "description": "起始日期，格式 YYYY-MM-DD，含当天"
      },
      "limit": {
        "type": "integer",
        "minimum": 1,
        "maximum": 50,
        "default": 10
      }
    },
    "required": ["status"],
    "additionalProperties": false
  }
}
```

## 枚举比描述管用

`"type": "string"` 加一句"状态可以是待付款、已付款、已发货、已退款"，模型会开始创作：`"已支付"`、`"paid "`（带空格）、`"PAID"`。加上 `enum` 之后，约束进了 grammar 层，解码时就不能生成别的值，这是硬约束而不是劝说。

代价是枚举变更要发版。线上新增一个状态，schema 没更新，模型会退而求其次选最近的旧值，错得毫无声响。所以枚举要预留扩展位，或者干脆把状态查询做成两次调用：先 `list_status()` 拿到当前值，再查。多一次往返，换来的是再也不会因为字典不同步而出错。

## 嵌套结构的两个失败模式

嵌套对象看起来优雅，实际是两个坑。一是模型容易漏字段，`{"filters": {"date": {"from": "..."}}}` 这种三层嵌套，漏掉中间层的概率显著上升。二是错误信息不可读，校验失败时返回的是 `filters.date.from: expected string`，模型不知道该怎么修。

平铺是更稳的选择，字段名用下划线表达层级：`date_from`、`date_to`、`price_min`。唯一的例外是「同构列表」，比如批量插入的多条记录，这时候用 `array` + `items` 是对的，但要把 `maxItems` 设上，否则模型会一次生成 200 条。

```python
import json

def validate_args(args: str, schema: dict) -> tuple[dict | None, str | None]:
    """解析并做最小校验，返回 (参数, 错误提示)。错误提示要能直接回流给模型。"""
    try:
        data = json.loads(args)
    except json.JSONDecodeError as e:
        return None, f"JSON 解析失败：{e.msg}，位置 {e.pos}。请只输出合法 JSON，不要加注释或尾逗号。"

    if not isinstance(data, dict):
        return None, f"顶层必须是对象，收到 {type(data).__name__}"

    required = schema.get("parameters", {}).get("required", [])
    missing = [k for k in required if k not in data]
    if missing:
        return None, f"缺少必填字段：{', '.join(missing)}"

    props = schema.get("parameters", {}).get("properties", {})
    unknown = [k for k in data if k not in props]
    if unknown:
        return None, f"不认识的字段：{', '.join(unknown)}。可用字段：{', '.join(props)}"

    for key, spec in props.items():
        if key not in data:
            continue
        val = data[key]
        if "enum" in spec and val not in spec["enum"]:
            return None, f"字段 {key} 的值 {val!r} 不在允许范围 {spec['enum']} 内"
        if spec.get("type") == "integer" and not isinstance(val, int):
            return None, f"字段 {key} 必须是整数，收到 {type(val).__name__}"
    return data, None
```

错误提示的写法值得单独说。`"invalid arguments"` 是无效信息，模型只能瞎猜。`"since 字段格式应为 YYYY-MM-DD，收到 '2026/11/8'"` 才能让它一次改对。我统计过一轮 300 次调用，把错误提示从通用改成具体之后，同一个错误连续出现的比例从 23% 降到 4%。

## 描述的写法

描述是模型唯一能读的语义线索，要写三件事：什么时候用、什么时候不用、返回什么。第三件最常被漏掉，导致模型不知道该期待什么结果，于是重复调用。

工具之间有重叠时，用一个统一的 `description` 前缀做路由，比如「查订单」和「查售后单」都在描述第一句写清区别边界。模型对开头几个 token 的注意力权重更高，把区分点放前面比放在末尾有效。

| 做法 | 参数合法率 | 说明 |
| --- | --- | --- |
| 6 个必填参数、全部 string | 0.72 | 无枚举无范围 |
| 3 个必填、加 enum | 0.89 | 枚举是最强约束 |
| 3 个必填、enum 加具体错误回流 | 0.94 | 错误可自愈 |
| 平铺 + default + additionalProperties:false | 0.96 | 拒绝多余字段减少歧义 |

## 命名和并发

函数名用动词加名词，`get_weather`、`create_ticket`、`search_orders`，不要用 `weather` 或 `handler2`。模型对名字的先验很强，叫 `query` 的函数它什么都往里塞，叫 `search_docs` 的它只塞文档查询。名字里带领域词还能顺带做路由：十几个工具平铺的时候，模型选对的概率跟名字的自解释程度高度相关。

同一轮返回多个 `tool_calls` 是常态，尤其当几个调用之间没有依赖。串行执行会让延迟线性叠加，三个 300ms 的调用就是 900ms。并行执行要处理的是失败隔离：三个里有一个超时，不应该让另外两个的结果作废，正确做法是各自返回各自的 `ToolResult`，让模型看到"两个成功一个失败"，它通常能自己决定要不要重试那一个。

有一个例外：写操作不要并行。两个 `update_record` 同时打到同一条记录上，后写的覆盖先写的，而且顺序不确定。所以在工具定义里加一个 `side_effect: true` 的标记，执行器看到就强制串行，并按调用顺序保序返回。这个标记模型读不到，纯给执行器用，放在 schema 之外的元数据里。

## 别让模型填它不知道的东西

如果某个字段模型没法从对话里得到（用户 ID、租户 ID、当前时间），就不要放进 schema。放进去了模型会编，而编出来的 ID 通常格式合法，校验层拦不住，错误要到业务层才暴露。正确做法是在服务端注入：模型只提供语义参数，系统参数由调用栈补上。

同理，不要在 schema 里做业务校验。`order_id` 的格式正则可以留，但"这个订单是否属于当前用户"必须放到执行层，用结构化错误返回。schema 是用来约束语法的，不是用来约束业务的，混淆这两层会让 schema 越来越臃肿，准确率反而下降。

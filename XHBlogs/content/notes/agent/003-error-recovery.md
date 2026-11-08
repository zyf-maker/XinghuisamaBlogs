---
title: "多步任务的错误恢复分支"
summary: "工具报错、参数非法、超时三类失败的判定与重试策略"
order: 3
level: "深入"
tags: [Agent, 错误处理, 重试]
updated: "2026-11-08"
readingTime: 5
---

Agent 跑多步任务时，失败是常态而不是例外。十个工具调用里有一个报错，五步任务就有四成的概率至少踩一次。区别在于：有的系统踩了能绕过去，有的系统把异常直接抛给用户，还带一句"抱歉，出了点问题"。

错误分三类，处理逻辑完全不同。混在一起用一个 `except Exception: retry()` 处理，是大多数 agent 不稳定的根源。

## 先分类，再决定

判定的第一个维度是「重试有没有意义」。网络超时重试有意义，参数格式错误重试没有意义，除非模型能改参数。第二个维度是「谁有能力修」：有些错误模型读得懂就能自己改，有些必须人工介入。

| 错误类型 | 典型信号 | 谁修 | 重试策略 |
| --- | --- | --- | --- |
| 参数非法 | 400、schema 校验失败 | 模型 | 不重试同一调用，改写参数后重试 |
| 工具内部报错 | 500、业务异常码 | 无人 | 换工具或降级 |
| 超时 | 连接超时、deadline exceeded | 系统 | 指数退避，最多 2 次 |
| 限流 | 429、rate limit | 系统 | 读 Retry-After，等待后重试 |
| 结果为空 | 200 但内容为空 | 模型 | 放宽条件重查，最多 1 次 |

这张表要落到代码里成为一个分支，不能留在文档里。

## 参数非法：把错误变成模型的输入

关键是把错误信息结构化地回流给模型，而不是抛异常。工具执行器应该永远返回一个 JSON，里面带 `ok`、`error_type`、`message`、`hint` 四个字段，这样模型能读到、能改。

```python
import time
from dataclasses import dataclass, field

@dataclass
class ToolResult:
    ok: bool
    data: dict | None = None
    error_type: str | None = None      # invalid_args / internal / timeout / empty
    message: str = ""
    retryable: bool = False
    attempts: int = 0

def run_tool(fn, args: dict, timeout: float = 10.0, max_retry: int = 2) -> ToolResult:
    for attempt in range(max_retry + 1):
        try:
            out = fn(**args, _timeout=timeout)
        except TypeError as e:
            # 参数不匹配：重试无意义，直接让模型改
            return ToolResult(False, error_type="invalid_args",
                              message=f"参数不合法：{e}",
                              retryable=False, attempts=attempt + 1)
        except TimeoutError:
            if attempt == max_retry:
                return ToolResult(False, error_type="timeout",
                                  message=f"工具 {timeout}s 内未返回",
                                  retryable=True, attempts=attempt + 1)
            time.sleep(0.8 * (2 ** attempt))   # 0.8s, 1.6s
            continue
        except Exception as e:
            return ToolResult(False, error_type="internal",
                              message=f"{type(e).__name__}: {e}",
                              retryable=False, attempts=attempt + 1)

        if not out:
            return ToolResult(False, error_type="empty",
                              message="工具返回空结果", retryable=False,
                              attempts=attempt + 1)
        return ToolResult(True, data=out, attempts=attempt + 1)
    return ToolResult(False, error_type="timeout", message="重试耗尽", attempts=max_retry + 1)
```

超时重试两次、退避 0.8 秒起翻倍，是为了避开瞬时抖动又不至于把一次任务拖到几分钟。如果工具本身有 p99 是 8 秒的尾部延迟，超时值给 10 秒就够，给 30 秒只会让失败变慢。

参数非法的处理要点在 `message` 的内容。不要返回堆栈，要返回"哪个字段、期望什么、收到什么"。模型看到 `TypeError: missing 1 required positional argument: 'since'` 会知道补参数，看到 `KeyError: 'status_list'` 大概率会瞎猜。

重试次数用完还没修好，就不要再让它试。连续两次参数错误说明模型的参数理解有系统性偏差，继续循环只会烧 token。这时转人工或换一个更简单的工具。

## 内部报错：不要重试

500 和业务异常重试的成功率接近 0，因为它是确定性的服务端问题。这类错误的正确动作是换路径：如果有备用工具就用备用，没有就降级。

降级的粒度要按任务设计。检索失败可以退化成只用已有上下文回答；写文件失败可以退化成把内容放到响应里让用户手动保存；发消息失败必须上报，因为静默失败比报错更糟。

一个容易被忽略的点是错误分类的粒度。「数据库连接池耗尽」和「SQL 语法错误」都是 500，但前者重试三次可能成功，后者永远不行。所以要在工具层把可重试的业务错误码显式标出来，比如约定 `code: 50301` 表示临时不可用，其余 5xx 一律不重试。这个约定要写进工具 schema 的描述里，让调用方知道。

## 超时：区分工具超时和任务超时

工具级超时是单次调用的上限，任务级超时是整个 agent 跑完的上限。两个都要有，且任务级要小于用户的耐心。给一个 5 步任务的预算是 90 秒，单步超时 10 秒乘 5 步加模型响应时间，已经逼近上限，所以第 4 步超时的时候应该停止再试，用已有信息收尾。

实现上把 deadline 一直往下传，而不是每层各算各的。工具收到的是剩余时间，不是一个固定值。

```
剩余时间 = deadline - now()
如果 剩余时间 < 3s：不再发起新的工具调用，直接收尾
否则：工具超时 = min(单步上限, 剩余时间 - 1s)
```

留 1 秒是给收尾那一轮模型调用的。少了这个预留，最后一步拿不到答案，前面全白跑。

## 错误要进上下文，但要有节制

把每一次失败都完整写进对话历史，五步之后上下文里一半是错误堆栈，模型会被带偏，开始复述错误而不是解决问题。我的做法是：成功的调用保留完整结果，失败的调用只保留一行摘要，形如 `[search_orders 失败] invalid_args：since 格式应为 YYYY-MM-DD`。

同时维护一个失败计数。对同一个工具失败两次，就在下一轮的 system 追加"工具 search_orders 已连续失败两次，不要再用它"。这是硬性的提示，比让模型自己从历史里推断可靠得多。

## 一条判定原则

每次失败后问一个问题：这次的输入和上次有什么不同。如果答不上来，就不该重试，因为重试的期望收益是零。这条原则能砍掉大部分无意义的循环，也比任何复杂的退避算法更容易在代码里落地。

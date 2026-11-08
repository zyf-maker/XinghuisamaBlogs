---
title: 重构里哪些事该交给 AI
summary: 按接口契约划分 AI 可全权重构的范围，给出检查手段与四条红线
order: 3
level: 深入
tags: [重构, 接口设计, 审查]
updated: 2026-11-08
readingTime: 7
---

## 一次失控的重构

半年多前，我让代理重构一个数据清洗模块：`clean.py` 六百行，七个函数互相调用，中间状态靠字典传递。要求是"拆成清晰的小函数，减少重复"。

它做得不差。函数拆小了，重复消掉了，测试全绿，性能还快了 15%。但它顺手把 `clean_rows(rows)` 的参数从 `list[dict]` 改成了 `Iterable[Row]`，因为拆出来的内部函数更适合用 dataclass 传参，它就把外层也统一了。

这个改动本身合理，代价是 `pipeline.py` 里三十多处调用全要改，其中五处在一个我三个月没碰的定时任务里，测试没覆盖。上线两天后报表任务挂了。

问题不在它会犯错，在于我把"接口变更"和"内部整理"混在一次任务里交给它。这两件事的风险差一个数量级，处理方式也该不同。

## 判据：有没有跨过契约

我给自己的划分标准只有一条：改动是否改变了模块对外可见的形状。可见形状包括函数签名、参数类型、返回值结构、异常类型、文件路径、环境变量名、数据库列名、HTTP 路由。内部实现不算。

按这条线分三档。

**可以全权**：函数体内部重排、提取局部变量、合并重复分支、提前 return 替代嵌套、改局部变量名、把长函数拆成私有函数、加类型标注（不改签名语义）、消除未使用导入。这些改动对外部完全不可见，测试能兜住。

**要审 diff**：错误处理方式调整、日志级别与内容、并发原语的替换（`threading.Lock` 换 `asyncio`）、缓存策略、批量操作的分批大小。这些不改变签名，但改变了运行时行为和可观测性，出问题的表现是"功能对但指标变了"。

**人来定**：所有签名变更、模块拆分与合并、公共类型定义、异常层级、配置项命名、目录结构。这些改动会向调用方扩散，扩散范围只有你知道。

## 冻结接口的具体手段

光靠提示词约束不住。可行的办法是把接口变成机器能检查的东西，改了就报错。

第一步，重构前导出签名快照：

```bash
# Python：导出公开 API 的签名，作为基线
python - <<'EOF'
import inspect, json, importlib
mod = importlib.import_module("cleaning.core")
out = {}
for name, obj in vars(mod).items():
    if name.startswith("_") or not callable(obj):
        continue
    try:
        out[name] = str(inspect.signature(obj))
    except (ValueError, TypeError):
        pass
print(json.dumps(out, indent=2, ensure_ascii=False))
EOF
```

把输出存成 `api-baseline.json` 提交。重构后重新生成，`git diff` 一眼看出哪个签名动了。

第二步，用类型检查器当守门人。Python 用 mypy 的 `--strict` 跑一遍，TS 用 `tsc --noEmit`。签名一改，调用方全部飘红。这比读 diff 可靠得多——diff 只能看到改的地方，类型检查能看到没改的地方受了什么影响。

```bash
uv run mypy src/ --strict --no-error-summary 2>&1 | head -40
```

第三步，对最关键的入口加契约测试。不是测逻辑，是测形状：

```python
import inspect
from cleaning import core

def test_public_surface_is_stable():
    assert list(inspect.signature(core.clean_rows).parameters) == ["rows", "strict"]
    assert inspect.signature(core.clean_rows).return_annotation is list
```

三条断言，拦住"顺手改签名"这类动作。它挡不住有意的变更，但能保证变更必须显式——改测试就是明确宣告"我要动接口"。

## 分阶段交付

一次任务只做一件事，是我试过最有效的降风险手段。经验值：

| 阶段 | 允许的动作 | 预期 diff 规模 | 卡点 |
| --- | --- | --- | --- |
| 一 | 只加测试，不改实现 | 新增文件 | 覆盖率上升，全绿 |
| 二 | 内部重排，签名冻结 | 单文件内，百行内 | 类型检查通过，签名快照不变 |
| 三 | 提接口变更方案，不动代码 | 无 diff | 人工确认影响面 |
| 四 | 按确认的方案改签名，同步调用方 | 跨文件 | 编译/类型检查全绿，测试全绿 |

第一阶段的收益常被低估。重构前让代理补测试，它会发现哪些路径根本没被覆盖——这些正是重构成"内部实现可以自由改"的前提。没测试的模块，任何内部重排都是赌博。

第三阶段要求"只写方案不动代码"，是为了拿到影响面清单。让它列出：改这个签名会影响哪些文件、哪些调用点、哪些是测试、哪些是外部消费者。这份清单它做得比人快，而决策留给人。

## 一个具体的对话形状

第二阶段的提示我固定这么写：

```
目标：把 clean.py 的 normalize_rows 拆成三个私有函数。
约束：
- 不改 normalize_rows 的签名和返回值
- 不改同目录其他文件
- 不改任何测试
- 允许新增以 _ 开头的私有函数
完成后运行 pytest tests/test_cleaning.py -q 并贴出输出。
```

四条约束加一句验证要求。约束里最重要的是"不改测试"——不加的话，它拆函数时会顺手把测试里的内部调用也改了，等于把监工换成了自己人。

第三阶段的提示：

```
不要改代码。列出把 clean_rows 的参数从 list[dict] 改成 Iterable[Row]
需要动的所有位置：文件、行号、调用点数量、是否测试。
按风险从高到低排，标出没有测试覆盖的。
```

最后一句是关键。"标出没有测试覆盖的"会把它逼到具体位置，而不是笼统说"影响较大"。

## 四条红线

踩过坑之后定下来的，不再商量：

- 不改迁移文件。已提交的 migration 是不可变历史，改了会让环境之间状态分叉。
- 不改序列化格式。字段名、字段顺序、默认值，牵涉到已经落盘的数据和外部对接方。
- 不改异常类型。`except ValueError` 换成 `except CustomError`，上游所有捕获点静默失效，这是最难查的一类问题。
- 不动构建配置。`tsconfig`、`vite.config`、`pyproject.toml` 的改动影响全仓，收益局部而风险全局。

## 全权之后要验什么

即便在"可以全权"的范围内，也要验三件事，不读代码也能验：

测试数量不能减少。少于重构前，说明它删了用例。跑一遍带收集统计的命令确认。

覆盖率不能下降。`pytest --cov=cleaning --cov-report=term-missing`，看百分比和未覆盖行号。下降说明拆出去的分支没被走到。

运行时行为不能变。对纯函数模块，最省事的办法是留一份重构前的输出快照，重构后逐条比对：

```python
def test_output_matches_snapshot():
    rows = load_fixture("sample_2024.json")
    expected = load_json("snapshots/clean_2024.json")
    assert clean_rows(rows) == expected
```

有了这份快照，"内部随便改"才真的成立。没有它，拆分函数就是在赌自己没写错。

## 判断的落点

重构交给 AI 的部分，本质是"机械变换"：模式固定、局部可验、错了测试能抓到。人保留的部分是"契约决策"：影响谁、成本多大、什么时候付。

这条线不是能力边界，是责任边界。模型能把接口改得很干净，但它不承担调用方半夜报警的后果。所以那部分留在人手上，不是因为做不好，是因为得有人签字。

---
title: "用 AI 做大范围重构：脚本做机械活，人做裁决"
summary: "把 4 万行代码从回调改成 async 的完整记录。核心是分三层：脚本做可证明正确的机械替换，AI 只做语义判断，分歧点由人裁决，并在动第一行代码前先建好可比对的行为基线。"
order: 5
level: "深入"
tags: ["重构", "AI 编程", "脚本化改造", "基线"]
updated: "2026-11-06"
readingTime: 7
---

去年底我做了一次跨 9 个模块、约 4 万行的重构：把一套回调风格的数据库访问层改成 async/await，同时把散落各处的错误处理收敛成一个异常层。这件事如果全靠手写，我估计要三周；实际用了九天，其中两天在重建基线。这篇记录流程里我认为最有用的部分。

## 先建基线，再动代码

重构的定义是「行为不变」，所以第一件事必须是能证明行为不变。没有这层证明，后面所有讨论都是猜。

我的基线有三份，缺一不可：

```bash
# 1. 测试基线：记录当前通过的用例集合，不只看总数
pytest -q --tb=no -p no:randomly > /tmp/base.txt 2>&1
git stash list && git rev-parse HEAD   # 记下基线 commit，写进 PR 描述

# 2. 接口基线：把所有对外函数的签名快照下来
python - <<'PY' > /tmp/api_before.txt
import ast, pathlib
for p in sorted(pathlib.Path("app").rglob("*.py")):
    for n in ast.parse(p.read_text(encoding="utf-8")).body:
        if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)):
            print(f"{p}::{n.name}({', '.join(a.arg for a in n.args.args)})")
PY

# 3. 行为基线：拿真实请求打一遍影子环境，存响应
python scripts/snapshot.py --cases tests/fixtures/cases.yaml --out /tmp/snap_before.json
```

第三份最容易被跳过，但它救了我。测试只覆盖了 63% 的分支，`snapshot.py` 走的是 200 条真实业务请求的录制回放，响应体逐字段 diff。后面有一次替换让某个可选字段从 `null` 变成了 `[]`，测试全绿，是快照 diff 抓到的。

第一份命令里的 `--tb=no` 和 `-p no:randomly` 也值得说。不带 `--tb=no`，失败输出会把文件撑到几兆，后面 diff 时全是噪音；不加 `-p no:randomly`，每次执行顺序不同，失败集合没法直接比较。我第一次就是忘了后者，两天里有一半时间在追一个根本不存在的「不稳定用例」。

## 分三层：脚本、AI、人

想清楚这三层的分工，是这次重构没失控的主要原因。

**第一层，机械替换交给脚本。** 判定标准是「能不能用一条正则加 AST 校验证明它永远正确」。这类改动哪怕有三千处，也不该让模型逐处处理——慢、贵，而且它每次可能给出不同写法。

**第二层，AI 只做语义判断。** 典型问题是「这个回调里捕获了 `self`，改成 async 后闭包捕获的时机变了，要不要显式传参」。这类问题没有机械规则，但在给定文件范围内有唯一合理解。

**第三层，人裁决分歧。** AI 给出的方案互相矛盾，或者涉及外部契约，就停下来由我定。

第一层的脚本我写了两版。第一版用 `sed`，改了两千多处，第二版全部回滚，因为它在字符串字面量里也做了替换。正确的做法是解析成 AST 再改：

```python
import ast, pathlib, sys

class CallbackToAsync(ast.NodeTransformer):
    def visit_Call(self, node: ast.Call) -> ast.Call:
        self.generic_visit(node)
        func = node.func
        # 只处理 db.fetch/x.read 这种属性调用，且不在字符串里
        if isinstance(func, ast.Attribute) and func.attr in {"fetch", "read", "query"}:
            node.args.append(ast.Constant(value=False))   # 占位参数，先不动语义
        return node

changed = 0
for p in pathlib.Path("app").rglob("*.py"):
    src = p.read_text(encoding="utf-8")
    tree = ast.parse(src)
    before = ast.unparse(tree)          # 必须先存快照
    new = ast.unparse(CallbackToAsync().visit(tree))
    if new != before:                   # NodeTransformer 是原地改 tree，
        p.write_text(new + "\n", encoding="utf-8")   # 再 unparse(tree) 比的是自己
        changed += 1
print(f"rewritten files: {changed}", file=sys.stderr)
```

`ast.unparse` 会丢掉注释和原始格式，所以这个脚本我只用在一批本来就没有注释的适配层文件上。其他文件用 `libcst` 保格式，代价是慢三倍。这个取舍我试过两次才定下来：第一次全用 `libcst`，4 万行跑了 11 分钟，还能接受；但它的改写 API 太啰嗦，脚本本身比要改的代码还长，我写错了两次。最后是「无注释文件用 AST，有注释文件用 libcst」。

## 让 AI 只输出判断，不输出代码

这是我最想强调的一条。大范围重构里，让 AI 直接改文件几乎一定会出问题——它看不到全局，第 40 个文件改完时已经忘了第 3 个文件的约定。

所以我的用法是：把一批文件（通常 5 到 8 个）连同 `AGENTS.md` 里的约定一起给它，要求输出一张判断表，而不是代码。

```text
读下面 6 个文件，判断每个 await 插入点的等价改动方式。
只输出表格，列为：
文件:行号 | 当前写法 | 建议方式(A=直接await/B=包asyncio.gather/C=需人工判断) | 一句话理由
不确定的一律标 C，不要猜。
```

197 个判断点里，A 有 154 个、B 有 21 个、C 有 22 个。C 的那 22 个我逐个看了，其中 9 个是它确实判断不了的（涉及连接池复用时机），13 个它其实能判断，只是保守了。这个比例可以接受——保守的错误比自信的错误便宜得多。

反过来我也试过让它直接改：给了 6 个文件，让它「改成 async 并保持行为一致」。结果它给三个函数加了 `asyncio.gather`，但那三个函数有共享的可变状态，并发执行会互相覆盖。测试没抓到，因为测试是串行的。这类错误只有在并发压测下才暴露，而它不会主动告诉你去压测。

## 分歧点必须人工裁决

22 个 C 里有 4 个是真正的分歧，我记了决策，因为它们后来都被 review 问到过。

其中一个：连接池的获取时机。原代码在函数入口拿连接、出口释放；改成 async 后，如果在 `await` 之前拿、之后释放，连接会被长时间占用，池子 20 个连接在 50 QPS 下三分钟就耗尽。我的决定是改成「用到时取、用完立即还」，代价是同一个函数内可能取两次。这个决定写进了 `docs/adr/007-db-pool.md`，理由是数字：50 QPS × 平均持有 800ms = 40 个并发连接需求，超过池子上限。

这类决定没法交给模型，因为它需要知道池子大小、QPS、持有时间。这些数字在监控里，不在代码里。

## 踩过的坑

最贵的一次失误发生在第二周。我想加速，让 AI 一次处理 20 个文件，指令是「按前 20 个文件的模式改剩下的」。它确实照做了，但它把前面某个文件里我手工调整过的一个特例也当成了模式，复制到了 7 个不需要它的地方。这批改动测试全绿——因为那个特例是「多包一层重试」，多包一层不会报错，只是让重试次数从 3 变成 9。

发现方式是快照比对里出现了延迟分布的偏移，P99 从 340ms 涨到 1.1s。如果只对响应体做 diff，这个错误会一直留着。

第二个坑是 git 层面的。我一开始把脚本改动和 AI 改动混在同一批提交里，出了问题没法回滚到中间状态。后来改成严格分开：每次脚本改动一个 commit（message 里带 `script:` 前缀），每次 AI 判断应用后一个 commit，人的裁决再一个。这样二分定位时，`git log --oneline` 一眼能看出是哪一类改动引入的。

第三个坑比较轻但很烦：`ast.unparse` 把我几处 `# noqa: E501` 注释吃掉了，导致 lint 在 CI 上失败。修复成本低，但如果当时没跑 `ruff check`，这批改动会卡在合并队列里等一轮 review。所以我现在脚本跑完的第一条命令固定是 `git diff --stat && ruff check .`。

## 收尾

重构完成的判定，我用的是三份基线的对比，而不是「感觉改完了」：测试集合无新增失败（失败数从 3 降到 3，都是已知的 flaky）、接口签名快照的差集只有预期的 11 个函数、快照响应 diff 为空。

九天里，脚本跑了大约 20 分钟，AI 调用花了不到 4 小时，剩下全是我的时间——读判断表、裁决分歧、写 ADR。这个比例可能和很多人的预期相反，但我觉得这才是大范围重构的常态：机械的部分机器很快，判断的部分还是人的活。AI 在这里的作用不是替我决定，而是把 197 个判断点摊开放在我面前，让我能在四小时里做完原本要三天的事。

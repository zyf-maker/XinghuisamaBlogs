---
title: 三个练习项目的选法
summary: 从批处理到工具调用分三级选项目，每级给验收线和最常见的三种做错方式
order: 3
level: "进阶"
tags: [练习项目, 工具调用, 验收标准]
updated: "2026-11-08"
readingTime: 8
---

选练习项目的关键不在于难，而在于「能被判死」。一个项目如果做完之后你说不清它是对是错，那它只是打发时间。我给自己的规矩是：每个项目开工前先写好验收条件，条件里必须包含一个会失败的用例。做不到这一步的项目，我直接换掉。下面三个项目是按这个标准筛出来的，难度递增，但都不需要超过三百行代码。

## 三个项目的位置

先把三者的差别摆清楚，很多人卡住是因为一上来就跳到了第三级。

| 项目 | 核心能力 | 代码量 | 主要风险 | 过关线 |
| --- | --- | --- | --- | --- |
| 命令行批处理 | 稳定、可重跑、可核算成本 | 150 行内 | 失败后状态脏掉 | 200 条输入零人工干预跑完 |
| 带检索问答 | 分块、召回、拒答 | 250 行内 | 答得顺但查不到 | 20 题里 16 题可追溯到原文 |
| 工具调用 agent | 约束输出、处理失败、防死循环 | 350 行内 | 循环调用烧钱 | 5 个任务里 4 个在 8 步内收敛 |

## 第一级：命令行批处理

输入是一批文件或一批 JSON 记录，输出是结构化的结果文件。我选的实际题目是「把一堆积压的 issue 文本按模块分类，并抽出涉及的文件名」。选它的理由很实在：判断对错不需要人看，我可以手工标 30 条做基准。

要做对三件事。第一，每条输入独立成任务，一条失败不影响其他条，错误写进 `errors.jsonl` 而不是中断整个批次。第二，断点续跑，已经成功的条目有记录，重跑时跳过。第三，输出必须过一次 schema 校验，模型返回的 JSON 少一个字段就直接判失败重试，不要试图修补。

下面这段是我第三版才写对的续跑逻辑，前两版都是先读全部再判断，跑到一半崩掉就得从头来：

```bash
# 已完成条目写入 done.txt，重跑时过滤掉
process_one() {
  local id="$1"
  if grep -qxF "$id" done.txt 2>/dev/null; then
    return 0
  fi
  if out=$(run_model "$id" 2>>err.log); then
    printf '%s\n' "$out" >> results.jsonl
    printf '%s\n' "$id" >> done.txt
  else
    printf '{"id":"%s","error":"model_failed"}\n' "$id" >> errors.jsonl
  fi
}

export -f process_one
xargs -P 4 -I{} bash -c 'process_one "$@"' _ {} < ids.txt
```

并发压到 4 是我实测的值。开到 12 时超过一半的请求吃 `429`，重试把总耗时拉得比串行还长。

验收：200 条输入，全程不看着，跑完之后 `results.jsonl` 加 `errors.jsonl` 条数等于 200，且 `errors.jsonl` 里的每一条都能说出失败原因。误差率按手工基准算，分类准确率低于 80% 就回去改提示，别加代码。

常见做错的地方：把整批塞进一次请求，指望模型批量输出。条目一多就开始漏，且没法定位漏了哪条。把重试写成无上限，遇上 `402` 这类不该重试的错误会把额度耗光。还有一种是结果直接覆盖原文件，中途失败留下半截数据，我第一次就是这么丢了两个小时的产出。

## 第二级：带检索的问答

语料用你自己的东西：三十到一百份文档，别用公开数据集。公开数据集的问题是你不熟悉内容，答错了你也看不出来。

这个项目的核心不是「答得自然」，是「答得可查」。我的实现里，每个回答片段都带来源编号，界面上点编号能跳到原文那一段。做不到可追溯，这个项目就等于没做。

索引和查询必须分开成两个命令，方便单独调。分块按标题层级切，别按固定字符数硬切，硬切会把一张表切成两半。查询时先取 8 条候选，再用一次轻量调用做重排，留下 3 条给最终回答。重排这一步的收益比换更大的模型明显，我实测过同一批题，只加重排就能把可追溯率从 62% 提到 81%。

拒答是必须实现的功能，而且要单独验。我在提示里写死了一句约束，并给了反例：材料里没有的信息不要补，补了就算错。然后专门造 5 道材料里确实没有答案的题。这 5 道题如果都能答出来，不是模型强，是你的提示在鼓励它编。

验收：20 道题，15 道有答案、5 道无答案。有答案的答对 12 道以上且每条论断都能点到具体文档段落，无答案的至少 4 道明确说没有。

常见做错的地方：分块太小导致上下文断裂，一句话被切成两个块，召回哪一半都答不全。把所有候选一股脑塞进提示，长是长了，模型反而抓不住重点。还有一种是只测有答案的题，做完看着很顺，上线第一周就被用户问到一个材料外的概念，编了一段。

## 第三级：带工具调用的 agent

工具只要两个：一个查数据库，一个写文件。别加第三个，加了这个项目就变成在调工具而不是在学约束。

这一级的难点全在失败处理。模型会给出参数不存在的调用、会连续调同一个工具、会在拿到结果后重复调用等一个不会变的答案。所以必须有三道闸：单次任务最多 8 步，同一工具同一参数连续出现两次就中断，工具报错时把错误原文回给模型而不是自己吞掉。

我用 TypeScript 写调度循环，因为类型能逼我把工具的参数约束写清楚：

```typescript
type Turn = {
  message: Message;
  toolCall: { name: string; args: Record<string, unknown> } | null;
};
type Caller = (history: Message[], schema: unknown) => Promise<Turn>;
type Tools = {
  schema: unknown;
  run: (name: string, args: Record<string, unknown>) => Promise<ToolResult>;
};
type ToolResult = { ok: true; data: unknown } | { ok: false; error: string };

const MAX_STEPS = 8;

export async function run(task: string, call: Caller, tools: Tools) {
  const history: Message[] = [{ role: "user", content: task }];
  const seen = new Set<string>();

  for (let step = 0; step < MAX_STEPS; step++) {
    const turn = await call(history, tools.schema);
    history.push(turn.message);

    if (turn.toolCall === null) return { status: "done", answer: turn.message.content, steps: step + 1 };

    const { name, args } = turn.toolCall;
    const key = `${name}:${JSON.stringify(args)}`;
    if (seen.has(key)) return { status: "stuck", reason: "repeat_call", steps: step + 1 };
    seen.add(key);

    const result: ToolResult = await tools.run(name, args);
    history.push({
      role: "tool",
      content: result.ok ? JSON.stringify(result.data) : `ERROR: ${result.error}`,
    });
  }
  return { status: "timeout", steps: MAX_STEPS };
}
```

那个 `seen` 集合是整个循环里最值钱的三行。没有它，我第一版在一个不存在的表名上原地转了四十多圈，账单出来才停。

验收：准备 5 个任务，其中 2 个是工具查不到数据的（比如问一个库里没有的月份）。要求 4 个任务在 8 步内给出可用结果，2 个查不到的任务必须如实说查不到，不能编一个数字填上。

常见做错的地方：把工具返回的错误包装成「没有结果」，模型于是开始猜。把步数上限设成 20 以上，觉得宽一点更稳，实际上多出来的步数全在重复调用。还有就是工具参数用自然语言描述而不给 schema，模型每次拼参数的方式都不一样，日志根本没法对照。

## 挑选的原则

三条，按重要性排。第一，这个项目的结果必须能用一句话判对错，判不了就换。第二，输入必须是你熟的领域，否则你分不清是模型错还是你的判断错。第三，项目规模控制在一个周末能出第一版，出不来就砍功能，而不是延长时间。

三个项目之间不要并行做。第一级没做到零人工干预就去写第二级，你会把批处理的脏状态带到检索里，排查起来是双重不确定。

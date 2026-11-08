---
title: 接 AI 进旧仓库先写 AGENTS.md
summary: 在已有仓库里放一份可执行的 AGENTS.md，比任何自动化都先做
order: 3
level: 入门
tags: [AGENTS.md, 仓库治理, 协作]
updated: 2026-11-08
readingTime: 6
---

## 先解决"它不知道"

把一个成熟仓库交给代理，第一天的失败通常与模型能力无关：它跑 `npm test` 失败，因为项目用 pnpm；它改完代码没跑 `make lint`，因为没人告诉它有这一步；它把 `src/generated/` 下的文件当成源码改了，因为目录名里没有"生成"字样。

这些都不是需要"更聪明的模型"来解决的问题，是仓库没有把约定写下来。人靠口口相传和肌肉记忆，代理靠文件。

AGENTS.md 是放在仓库根目录的纯文本约定，被读取它的工具在会话开始时注入。没有标准机构背书，但格式足够简单：Markdown 加几个固定小节。它的价值不在"AI 专用"，而在于逼你把散落在 wiki、聊天记录、老员工脑子里的东西写成可执行条款。

## 内容只留三类

第一类是命令。装依赖、跑测试、跑单个测试、跑 lint、跑类型检查、构建。每条都要能复制粘贴直接跑，不带占位符。

```bash
# 装依赖
pnpm install --frozen-lockfile

# 全量测试
pnpm test --run

# 单文件（vitest）
pnpm test --run src/lib/order.test.ts

# 只跑名字匹配的用例
pnpm test --run -t "幂等"

# 类型检查
pnpm tsc --noEmit -p tsconfig.build.json
```

`--frozen-lockfile` 这类细节必须写进去。少了它，代理装依赖时可能悄悄改锁文件，然后你在 code review 里看到一堆版本号变更。

第二类是结构。不需要画目录树，只要标出"这里不能随便动"：

- `src/generated/` 由 `pnpm codegen` 生成，手改会在下次构建时被覆盖。
- `packages/core` 是独立发布的包，改动需要同步 version。
- `legacy/` 里的代码只做兼容修复，不重构。
- 测试夹具在 `test/fixtures/`，不要为通过测试而改夹具。

第三类是禁令。写得像代码评审意见，短、可验证：

- 不新增运行时依赖，除非在 PR 描述里说明理由。
- 不改 `.github/workflows/`，CI 由基础设施组维护。
- 不提交 `.env`、`*.pem`、`fixtures/large/`。
- 提交前必须 `pnpm lint` 通过，不用 `--no-verify` 跳过钩子。

三类之外的东西，比如架构哲学、历史决策、性能指标，放别处。AGENTS.md 是操作手册，不是设计文档。写长了没人读，模型也只记住前几条。

## 一个能落地的版本

```markdown
# AGENTS.md

## 环境
Node 22，pnpm 9。不要用 npm 或 yarn。

## 命令
- 装依赖：pnpm install --frozen-lockfile
- 测试：pnpm test --run
- 单文件：pnpm test --run <path>
- 类型检查：pnpm tsc --noEmit
- 构建：pnpm build

## 结构
- src/generated/ 是 codegen 产物，改 src/schema/ 后重新生成
- packages/core 独立发布，改公开 API 要同步 CHANGELOG
- apps/web 依赖 packages/core，改 core 后跑 pnpm -r build

## 规矩
- 新增依赖先问，不要自己加到 package.json
- 不改 .github/workflows/
- 测试失败先解释原因，不要放宽断言
- 改完跑 pnpm lint && pnpm tsc --noEmit
```

三十五行的文件，覆盖了这个仓库八成的踩坑点。写它的过程本身就是一次盘点：我把 `pnpm -r build` 这条补上去，是因为它上一轮改了 core 却没重建 web，本地测试全绿、CI 挂了。

## 让文件自己保持准确

AGENTS.md 会腐化，跟 README 一样。区别是腐化后果更直接：命令过期，代理照着跑，报错，然后它自己发明一条命令继续跑。

两个低成本机制。一是把命令抽成 `package.json` 的 script，AGENTS.md 只写 `pnpm test`，具体参数在 script 里维护，改一处全生效。二是把能在 CI 里强制的规则从文档里删掉，交给 lint 和类型检查，文档只留机器管不了的。

我试过让代理在每次任务结束时检查 AGENTS.md 是否需要更新，效果一般，它会往里面加水分。改成人工每月扫一遍，删掉已经下沉到工具链的条目，反而稳定。

## 自动化放在后面

有人在 AGENTS.md 之后想立刻上"全自动修复 issue"。顺序反了。

自动化的前提是反馈回路闭合：机器能自己判断改对了没有。这需要三样东西同时存在——可靠的测试、能本地复现的构建、明确的边界规则。前两样是老问题，第三样才是 AGENTS.md 的产出。

我见过最典型的失败是：仓库测试覆盖率三成，CI 跑十五分钟，然后让人配一个"提交即自动修 bug"的流水线。结果是代理改一个函数，跑不动测试，凭猜测继续改，最后产出一个看着合理、行为不对的补丁，还得人从头审。成本比手写高。

可行的推进顺序：

| 阶段 | 做的事 | 判断能否进入下一阶段 |
| --- | --- | --- |
| 一 | 写 AGENTS.md，人工带着代理改代码 | 连续两周，代理产出的补丁八成可直接合并 |
| 二 | 加只读自动化：自动贴 issue 上下文、自动跑测试 | 测试稳定，失败原因能自动定位到文件 |
| 三 | 加写自动化，限定范围（只动单文件、只修 lint） | 越界率低到可以忽略 |
| 四 | 端到端自动修，人工只审 diff | 前三个阶段都稳定运行一个月 |

第一阶段的判断标准是"八成可直接合并"，不是"能跑通"。这个差别很重要：能跑通但每次都要人重写一半的补丁，不构成自动化的基础。

## 写文档的副作用

写完这份文件，我发现它对人也有效。新同事入职，第一件事是读 AGENTS.md，比翻 wiki 快。它同时也是 code review 的检查表——评审时说"看 AGENTS.md 第三条"比解释五分钟省事。

一份文档同时服务两个读者，是它值得写的主要原因。至于代理，它只是第三个读者。

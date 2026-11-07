---
title: "Claude Code 配置哲学：官方亲自教你怎么「调教」AI"
summary: "Anthropic 官方教你怎么「调教」Claude Code"
order: 36
level: "深入"
tags: ["Vibe Coding", "Claude Code", "AI 编程工具"]
updated: "2026-09-02"
readingTime: 8
author: "程序员鱼皮"
source: "https://github.com/liyupi/ai-guide"
---

> 本文转载自 **[程序员鱼皮 · AI 指南](https://github.com/liyupi/ai-guide)**，原文标题《Claude Code 配置哲学：官方亲自教你怎么「调教」AI》，作者 程序员鱼皮。
> 内容按 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可使用，本站仅作非商业性收录与排版适配。

大家好，我是程序员鱼皮。

最近 Anthropic 官方发了一篇博文，标题叫《Steering Claude Code》，把 Claude Code 的整套配置体系从底层逻辑到使用场景讲了个透。

由于是官方团队亲自写的，相当于出题人告诉你标准答案，因此整篇文章的干货价值非常高。

今天我结合官方内容加上我自己使用 Claude Code 的经验，给大家做一个完整的中文解读。

> 原文指路：https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more

![](https://pic.yupi.icu/1/image-20260625173136998.png)



## Claude Code 的调教方式

Claude Code 的调教方式共有 7 种：CLAUDE.md 文件、Rules 规则、Skills 技能、Subagents 子智能体、Hooks 钩子、Output Styles 输出风格，以及 Append System Prompt 系统提示词追加。

每种方式的核心区别在于 3 点：

1. 什么时候加载到上下文
2. 长对话压缩时会不会被丢掉
3. 占用多少 token

如果你把指令放错了地方，AI 可能直接忽略掉你的指令，白白浪费 tokens。

接下来咱们挨个儿学习。

![Claude Code 七种调教方式总览](https://pic.yupi.icu/1/01_%E4%B8%83%E7%A7%8D%E8%B0%83%E6%95%99%E6%96%B9%E5%BC%8F%E6%80%BB%E8%A7%88%E5%AF%B9%E6%AF%94%E5%9B%BEv2_compressed_v1.png)



## 1、CLAUDE.md - AI 的项目手册

CLAUDE.md 是放在项目根目录的 Markdown 文件，会话一开始就加载，全程常驻在上下文中。

那 CLAUDE.md 里适合放什么内容呢？

像构建命令、目录结构、代码规范、团队约定这些 AI 需要 **时刻记住** 的事实性信息。

我在自己的 [《AI 编程教程》](https://ai.codefather.cn/vibe) 中多次强调，CLAUDE.md 就像给新同事写的项目文档。你不需要每次都跟 AI 解释项目用的是什么技术、有什么规矩，只要写一次，之后都会生效。

CLAUDE.md 的加载分两种方式。

根目录的 CLAUDE.md 是始终加载的，压缩对话时也会重新读取，不会丢失。

子目录的 CLAUDE.md 比如 `app/api/CLAUDE.md`，只有当 Claude 读取该目录下的文件时才会加载，适合放只跟特定模块相关的约定。

![CLAUDE.md 加载机制](https://pic.yupi.icu/1/02_CLAUDE.md%E5%8A%A0%E8%BD%BD%E6%9C%BA%E5%88%B6v2_compressed_v3.png)

官方明确建议，**CLAUDE.md 尽量控制在 200 行以内**。

原因很简单，CLAUDE.md 的每一行都占 token，不管当前任务会不会用到。

如果你塞了 500 行进去，哪怕做一个简单的前端样式调整，也得带着那些后端部署规范一起加载，纯属浪费。

我自己就踩过这个坑，之前把所有东西都往 CLAUDE.md 里堆，后来发现 AI 的指令遵循度明显下降了，特别是在长对话里。后来精简了一波，把流程性的内容移到了 Skills 里，效果立竿见影。

所以记住一个原则就好：**CLAUDE.md 只放「事实」，不放「流程」。**

![事实和流程对比](https://pic.yupi.icu/1/03_%E4%BA%8B%E5%AE%9Evs%E6%B5%81%E7%A8%8B-CLAUDE.md%E5%86%85%E5%AE%B9%E5%88%86%E7%B1%BB%E5%AF%B9%E6%AF%94_compressed_v1.png)

构建命令、技术栈、目录结构、命名规范是事实。部署流程、代码审查清单、发布步骤是流程，应该封装为 Skills。



## 2、Rules 规则 - 路径级的精准约束

Rules 是放在 `.claude/rules/` 目录下的 Markdown 文件，用来给 Claude 设定具体的约束或编码规范。

它最强大的地方在于支持路径作用域。你在规则文件的头部加一个 `paths` 字段，就能让这条规则只在 Claude 读取特定路径下的文件时才生效。

比如我有一条规则是「所有 API 处理器必须使用 Zod 进行输入验证」，我把它的作用域设为 `src/api/**`。这样当我只是在改前端页面的时候，这条规则压根不会加载，也就不浪费 token。

```yaml
---
paths:
  - "src/api/**"
  - "**/*.handler.ts"
---
所有 API 处理器必须使用 Zod 进行输入验证。
```

我自己在项目中就是这么用的，把数据库相关的规范限定在 `src/db/**` 下面，前端相关的限定在 `src/components/**` 下面，各管各的。

什么时候该用 Rule，而不是子目录 CLAUDE.md 呢？

答案是：当一条规范需要跨目录生效的时候。

比如所有 `.test.ts` 文件都要遵守某个测试规则，用路径作用域的 Rule 更合适。子目录 CLAUDE.md 只能管它所在那个目录下面的文件。



## 3、Skills 技能 - 按需加载的工作流

Skills 放在 `.claude/skills/` 目录下，每个技能是一个文件夹，核心是一个 `SKILL.md` 描述文件。

Skills 的渐进式加载设计非常优雅。会话开始时，Claude 只会读取每个 Skill 的名称和简短描述，完整的技能内容只有在被触发时才加载到上下文中。

![Skills渐进式加载设计](https://pic.yupi.icu/1/04_Skills%E6%B8%90%E8%BF%9B%E5%BC%8F%E5%8A%A0%E8%BD%BD%E8%AE%BE%E8%AE%A1%E5%9B%BEv2_compressed_v3.png)

这意味着你可以定义几十个 Skills，但平时它们几乎不占 token。只有当你主动调用（比如输入 `/code-review`），或者 AI 自动匹配到当前任务需要某个技能时，完整的指令内容才会加载进来。

我在 `.claude/skills/` 下面放了部署流程、代码审查清单、创建新组件的标准步骤等等。这些流程性的东西如果全写在 CLAUDE.md 里，哪怕你只是说个「你好」，就得白白浪费不知道多少 tokens。放在 Skills 里就不一样了，需要时才加载。

还有个很重要的细节。压缩对话时，已触发的 Skills 会按总预算重新注入，如果预算不够，最早触发的技能会被优先丢弃。所以一次会话里别触发太多 Skills，聚焦当前任务最重要。



## 4、Subagents 子智能体 - 隔离的独立助手

Subagents 放在 `.claude/agents/` 目录下，每个文件定义一个独立的 AI 助手。

跟 Skills 最大的区别在于，Subagent 运行在自己独立的上下文窗口里，只有最终结果会返回给主会话。所有中间过程完全不占用你主对话的上下文空间。

![Subagents 隔离上下文运行机制](https://pic.yupi.icu/1/05_Subagents%E9%9A%94%E7%A6%BB%E4%B8%8A%E4%B8%8B%E6%96%87%E8%BF%90%E8%A1%8C%E6%9C%BA%E5%88%B6%E5%9B%BEv2_compressed_v1.png)

什么场景适合用 Subagent 呢？

比如深度搜索代码库找某个 Bug 的根因、分析日志文件定位性能瓶颈、做依赖审计检查哪些包有安全漏洞。这类任务的中间过程可能产生几万 token 的内容，如果都堆在主对话里，很快就会把上下文撑爆。

Subagent 还支持嵌套，最多可以嵌套 5 层深，配合动态工作流可以编排几十甚至上百个后台 Agent 并行工作。

我之前用 Claude Code 的 `/batch` 命令批量迁移 API 版本，本质上就是在用 Subagent。它会自动把任务拆成十几个子任务，每个在独立工作树中运行，互不干扰。

那 Skills 和 Subagents 怎么选呢？

很简单，如果你想看到 AI 的执行过程并随时干预，用 Skill。如果你只关心最终结果、不想被中间信息干扰，用 Subagent。



## 5、Hooks 钩子 - 确定性的自动化

Hooks 是 7 种方式里最特殊的一个。

前面讲的 CLAUDE.md、Rules、Skills 本质上都是给 AI 的「建议」，AI 可能遵循也可能不遵循，特别是在长会话或复杂场景下。

但 Hooks 不一样，它不是指令，而是自动化代码。**到了触发条件就一定会执行**，不需要 AI 来决定要不要做。

Hooks 通过 `settings.json` 注册，绑定到 Claude Code 生命周期中的特定事件，比如工具调用前（PreToolUse）、工具调用后（PostToolUse）、压缩对话前（PreCompact）等等。

![Hooks生命周期事件触发](https://pic.yupi.icu/1/06_Hooks%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E4%BA%8B%E4%BB%B6%E8%A7%A6%E5%8F%91%E5%9B%BEv2_compressed_v2.png)

最经典的用法就是：每次编辑文件后自动跑 Prettier 格式化。

这件事如果写在 CLAUDE.md 里，AI 大概率会遵循，但也可能会忘掉。

用 Hook 就不存在这个问题，文件一编辑，Prettier 就自动执行，跟 AI 模型本身无关。

而且 Hook 的上下文成本几乎为零，因为配置信息压根不在主上下文里。



### 「永远不要做 X」靠指令是不够的

这是官方博文里我觉得最值得记住的一个观点。

你在 CLAUDE.md 里写「永远不要删除数据库迁移文件」，Claude 大部分时候确实会遵守。但是在长会话、上下文压缩、或者遇到某个文件里的 prompt 注入时，AI 是有可能违反这条指令的。

真正的安全防线需要 **Hook + 权限** 双重保障。你可以用 `PreToolUse` Hook 检查每一次工具调用，一旦发现要删除数据库迁移文件，就直接 exit code 2 拦截掉。再配合 Managed Settings 从组织层面强制禁止某些操作，这样才能真正做到万无一失。

这个思路跟我之前分析 Claude Code 源码时看到的 fail-closed 设计是类似的。Claude Code 内部的工具系统默认把所有工具当作「危险操作」处理，除非工具明确声明自己是只读的。

**安全这件事，不能指望 AI 的自觉性。**

![指令和钩子-安全防线对比](https://pic.yupi.icu/1/07_%E6%8C%87%E4%BB%A4vs%E9%92%A9%E5%AD%90-%E5%AE%89%E5%85%A8%E9%98%B2%E7%BA%BF%E5%AF%B9%E6%AF%94%E5%9B%BE_compressed_v3.png)



## 6、Output Styles 和 Append System Prompt

最后两种方式我用的相对较少，所以放在一起讲。

Output Styles 是用来定义 Claude 输出风格和行为模式的。它放在 `.claude/output-styles/` 目录下，会被注入到系统提示词中，永远不会被压缩丢掉。

但有一点要特别注意，自定义输出风格会替换掉 Claude Code 的默认系统提示词。

也就是说，Claude Code 原本内置的那些关键行为，比如怎么确定修改范围、什么时候加注释、遇到安全问题怎么处理，自定义之后就全没了。

所以官方的建议是先看看内置的几种风格够不够用，别轻易去自定义。目前内置了 Proactive 主动执行、Explanatory 详细解释、Learning 协作学习这 3 种模式，基本覆盖了大多数使用场景。

![](https://pic.yupi.icu/1/image-20260625182514344.png)

Append System Prompt 是另一种调整 Claude 行为的方式，它允许你在不修改任何文件的情况下，临时给 Claude 追加一段指令。

具体用法是通过 CLI 的 `--append-system-prompt` 参数传入，只对当次调用生效。

跟 Output Style 的区别在于，它是追加而非替换，不会影响 Claude Code 的默认行为。适合临时调整语气、输出格式这些轻量需求。

![](https://pic.yupi.icu/1/image-20260625182914705.png)

不过官方也提到了一个限制，追加的指令越多，AI 对每条指令的遵循度就越低，特别是指令之间有冲突的时候。



## 什么时候该用什么？

一口气看完 7 种方式，你可能会有点蒙。

没关系，官方给了几条判断标准，有个印象就行。

![配置方式选择决策流程](https://pic.yupi.icu/1/08_%E9%85%8D%E7%BD%AE%E6%96%B9%E5%BC%8F%E9%80%89%E6%8B%A9%E5%86%B3%E7%AD%96%E6%B5%81%E7%A8%8B%E5%9B%BE_compressed_v3.png)

第一，CLAUDE.md 放「事实」，Skills 放「流程」。

如果你的 CLAUDE.md 里有超过 30 行的步骤性内容，比如部署 runbook、安全审查清单，就应该把它移到 `.claude/skills/` 里面去。

第二，「每次 X 后做 Y」这类需求应该用 Hook，不要写在指令里。

比如每次编辑后跑 Prettier、提交前检查 lint、完成任务后发 Slack 通知，这些都不应该依赖 AI 的记忆力。模型选择做某件事，和某件事自动发生，这完全是两回事。

第三，「绝对不能做 X」这种硬性要求需要 Hook + 权限双保险。

光靠指令只能做到 AI 大部分时候遵守，真正的安全边界必须用确定性机制来保证。这跟写代码一个道理，你不会靠注释来防止某个函数被错误调用，你会用类型系统和权限检查来兜底。



## 我的实践经验

再分享几个我自己配置 Claude Code 的心得。

首先是 CLAUDE.md 要有「索引」思维。不要把它当百科全书，把它当目录就好。告诉 Claude 项目的基本信息，然后用指针指向更详细的文件。

比如写上：前端组件规范见 docs/FRONTEND.md、部署流程用 /deploy 技能。

这样 CLAUDE.md 保持精简，Claude 需要详细信息的时候会自己去读对应文件。

![渐进式披露按需加载](https://pic.yupi.icu/1/06_%E6%B8%90%E8%BF%9B%E5%BC%8F%E6%8A%AB%E9%9C%B2%E6%8C%89%E9%9C%80%E5%8A%A0%E8%BD%BD_compressed_v2.png)

然后是 Skills，我觉得这是目前最被低估的功能。我现在把很多重复性的工作流程都封装成了 Skill，什么 AI 热点搜集、视频动画制作、图文创作工作流等等。

Subagent 我主要用来做调研型任务。比如：帮我调研一下这个库有没有替代方案、搜集信息、分析一下这个 Bug 的原因，这类任务中间过程很长，但最终只需要一个结论，用 Subagent 可以让主对话保持干净。不过很多 AI 工具现在都能自动创建和管理 Subagent 了。



## 写在最后

Claude Code 的配置体系设计得很讲究：事实和流程分离、按需加载降低成本、确定性保障优于概率性指令、隔离执行避免上下文污染。

这些设计思想不管你是想深度使用 Claude Code，还是想自己搭建 AI Agent 系统，都值得好好学一学。

顺便说个能佐证这套设计的事：Anthropic 自己在新模型发布后，把 Claude Code 的系统提示词砍掉了 80% 以上，而编程跑分一点没掉。他们砍掉的正是那些本该交给模型自己判断、或者本该做成按需加载的内容。想了解这套「提示词减法」的具体做法，可以阅读本教程经验技巧板块「大厂 AI 编程经验」目录中的《Anthropic 官方 - 提示词精简方法》。


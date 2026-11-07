// AI 知识库的分类定义。
// 目录名（slug）与 content/ai/<slug>/ 一一对应，改名时两边都要动。
//
// kind 用来区分「自己写的」和「转载整理的」：
//   original     —— 原创笔记，讲判断与取舍，篇幅较短
//   republished  —— 按 CC BY-NC-SA 4.0 转载整理的资料，每篇开头都有出处与许可声明

export type AiCategoryKind = "original" | "republished";

export type AiCategory = {
  slug: string;
  name: string;
  en: string;
  description: string;
  /** 在总览页的排列顺序，小的在前 */
  order: number;
  /** 分类页顶部的一句话导语，比 description 更具体 */
  intro: string;
  /** 原创还是转载，决定在总览页落在哪一栏 */
  kind: AiCategoryKind;
};

export const aiCategories: AiCategory[] = [
  // ── 原创 ───────────────────────────────────────────────
  {
    slug: "foundations",
    name: "模型基础",
    en: "Foundations",
    description: "分词、采样、上下文与推理模型的工作方式。",
    intro:
      "先把模型当作一个带状态的函数看：它读什么、怎么吐出下一个 token、为什么同一个问题两次答案不同。这一组是后面所有内容的地基。",
    order: 1,
    kind: "original",
  },
  {
    slug: "prompt",
    name: "提示词工程",
    en: "Prompting",
    description: "结构化指令、示例选择、自我校验与可回归的评测。",
    intro:
      "提示词不是咒语。这一组把它拆成可讨论的部件：角色与约束、示例的选法、输出的结构、以及怎么把「感觉变好了」变成可回归的评测。",
    order: 2,
    kind: "original",
  },
  {
    slug: "agent",
    name: "Agent 与工具",
    en: "Agents",
    description: "函数调用、ReAct 循环、MCP 与多智能体协作。",
    intro:
      "Agent 的骨架其实很短：一次决策、一次工具调用、一次结果回填，然后重复。难的是什么时候停、错了怎么恢复、多个 Agent 之间怎么分工。",
    order: 3,
    kind: "original",
  },
  {
    slug: "rag",
    name: "检索与知识库",
    en: "RAG",
    description: "切分、向量化、重排与检索质量的评测。",
    intro:
      "RAG 的效果八成死在切分上。这一组从「一段文本该怎么切」开始，讲到混合检索、重排，以及怎么判断检索到底有没有变好。",
    order: 4,
    kind: "original",
  },
  {
    slug: "coding",
    name: "AI 编程",
    en: "Coding",
    description: "用模型写代码的完整工作流与常见失效模式。",
    intro:
      "让模型写代码不是「让它写」就完了。这一组讲怎么给上下文、怎么让测试说真话、怎么审查它写的东西，以及重构和迁移这类活儿怎么切。",
    order: 5,
    kind: "original",
  },
  {
    slug: "engineering",
    name: "工程化",
    en: "Engineering",
    description: "流式输出、成本控制、限流降级与可观测性。",
    intro:
      "把模型接进真实系统之后才会遇到的问题：流式响应怎么组织、一次请求到底花了多少、上游挂了怎么退、出了问题怎么查。",
    order: 6,
    kind: "original",
  },
  {
    slug: "tools",
    name: "工具与选型",
    en: "Tooling",
    description: "模型选型、本地推理与工具链的取舍。",
    intro:
      "选型不是选最强的，是选在这个任务、这个预算、这个延迟要求下最合适的。这一组给出可复用的比较维度，而不是排行榜。",
    order: 7,
    kind: "original",
  },
  {
    slug: "product",
    name: "产品与变现",
    en: "Product",
    description: "从需求到 MVP、定价、获客与合规。",
    intro:
      "技术能跑通和有人愿意付钱是两件事。这一组记录把 AI 能力变成产品的路径，以及这一路上容易踩的合规坑。",
    order: 8,
    kind: "original",
  },

  // ── 转载整理的资料库 ────────────────────────────────────
  {
    slug: "start",
    name: "AI 入门",
    en: "Getting Started",
    description: "核心概念、工具清单与 DeepSeek 的来龙去脉。",
    intro:
      "第一次接触大模型时的最短路径：先弄清「模型、提示词、上下文、Agent」这几个词各自指什么，再上手几个能立刻用起来的工具。这一组适合当作阅读地图。",
    order: 20,
    kind: "republished",
  },
  {
    slug: "deepseek",
    name: "DeepSeek 手册",
    en: "DeepSeek",
    description: "提问技巧、本地部署、API 接入与 MoE 架构拆解。",
    intro:
      "围绕 DeepSeek 的一组资料：从怎么问出好结果、怎么在本地跑起来，到 V3 与 R1 的 MoE 架构到底改了哪几处。既有可直接照做的手册，也有偏技术的解析。",
    order: 21,
    kind: "republished",
  },
  {
    slug: "scenarios",
    name: "应用场景",
    en: "Scenarios",
    description: "办公、写作、设计、编程与理财的具体用法。",
    intro:
      "把模型放进具体的工作流里：写周报、做表格、生成配图、处理一份合同，或者给自己搭一个知识库。每个场景都落到可复制的操作步骤。",
    order: 22,
    kind: "republished",
  },
  {
    slug: "vibe",
    name: "工具实战手册",
    en: "Toolcraft",
    description: "Cursor、Claude Code、Codex、DeepSeek Harness 等工具的实操。",
    intro:
      "覆盖从零代码平台到命令行代理、从编辑器插件到官方桌面端的完整工具谱系，按「总览 → 工具实战 → 单个工具深入」三层递进。",
    order: 23,
    kind: "republished",
  },
  {
    slug: "build",
    name: "项目实战",
    en: "Build",
    description: "从需求到上线，完整做完一个 AI 应用。",
    intro:
      "按「想清楚做什么 → 选技术 → 做完 → 部署上线」的顺序组织。包含个人工具、AI 应用、全栈站点、小程序，以及几个企业级项目的完整拆解。",
    order: 24,
    kind: "republished",
  },
  {
    slug: "craft",
    name: "协作技巧",
    en: "Craft",
    description: "对话工程、上下文管理、幻觉处理与代码质量。",
    intro:
      "和模型协作的手感是可以练的。这一组讲的都是具体动作：怎么把需求讲清楚、怎么控制喂进去的上下文、死循环了怎么办、怎么让生成的代码可维护。",
    order: 25,
    kind: "republished",
  },
  {
    slug: "growth",
    name: "变现与运营",
    en: "Growth",
    description: "盈利模式、定价、SEO / GEO 与运营复盘。",
    intro:
      "代码能跑通只是开始。这一组讨论产品怎么定位、怎么定价、怎么被搜到、怎么涨粉，以及网站上线之后的数据、监控与安全该怎么做。",
    order: 26,
    kind: "republished",
  },
  {
    slug: "learning",
    name: "学习路线",
    en: "Learning",
    description: "编程路线、知识百科、资源清单与面试准备。",
    intro:
      "给自学的人准备的一组索引：从零开始该按什么顺序学、每个阶段有哪些高质量资料、面试会问什么、工作之后怎么继续成长。",
    order: 27,
    kind: "republished",
  },
  {
    slug: "models",
    name: "模型实测",
    en: "Benchmarks",
    description: "各家模型在真实项目上的编程能力对比。",
    intro:
      "同一批项目交给不同模型做，差别是能被看见的。这一组记录实测过程与结果，包括具体做对了什么、卡在哪里、要花多少轮对话。",
    order: 28,
    kind: "republished",
  },
  {
    slug: "openclaw",
    name: "OpenClaw 手册",
    en: "OpenClaw",
    description: "自托管 AI 助手的安装、接入与技能扩展。",
    intro:
      "把一个能长期运行的 AI 助手部署到自己的机器或云上：安装、接 QQ 与飞书、换模型、装技能、拍照任务、管记忆、控成本，以及怎么安全地卸载干净。",
    order: 29,
    kind: "republished",
  },
  {
    slug: "news",
    name: "行业动态",
    en: "News",
    description: "按日期归档的 AI 行业资讯。",
    intro:
      "这一组是时间线资料，按天归档。适合回看某个模型或某家公司什么时候发生过什么，不适合当作稳定结论。信息来自公开转载，原文链接已保留。",
    order: 30,
    kind: "republished",
  },
];

export const aiCategoryMap: Record<string, AiCategory> = Object.fromEntries(
  aiCategories.map((c) => [c.slug, c]),
);

export function getCategory(slug: string): AiCategory | undefined {
  return aiCategoryMap[slug];
}

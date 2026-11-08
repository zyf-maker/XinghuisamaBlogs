// 知识库的分类定义。
//
// 两层结构：
//   group     —— 统一大类，左栏只显示这一层，控制在 6 个以内
//   category  —— 大类下的子组，对应 content/notes/<slug>/ 目录
//
// 目录名（slug）与 content/notes/<slug>/ 一一对应，改名时两边都要动。

export type AiGroupSlug =
  | "basics"
  | "tooling"
  | "practice"
  | "getting-started"
  | "platform"
  | "news";

export type AiGroup = {
  slug: AiGroupSlug;
  name: string;
  /** 一句话说明，首页大类卡与左栏用 */
  description: string;
  order: number;
};

export const aiGroups: AiGroup[] = [
  {
    slug: "basics",
    name: "基础原理",
    description: "模型怎么读、怎么算、怎么记。",
    order: 1,
  },
  {
    slug: "tooling",
    name: "工具与编程",
    description: "编辑器、命令行、本地推理与工程化。",
    order: 2,
  },
  {
    slug: "practice",
    name: "实战与产品",
    description: "从想法到上线，再到有人付费。",
    order: 3,
  },
  {
    slug: "getting-started",
    name: "入门路线",
    description: "零基础怎么开始，按顺序读什么。",
    order: 4,
  },
  {
    slug: "platform",
    name: "平台与部署",
    description: "自托管、接渠道、跑在自己的机器上。",
    order: 5,
  },
  {
    slug: "news",
    name: "行业动态",
    description: "按时间归档的公开资讯。",
    order: 6,
  },
];

export const aiGroupMap: Record<string, AiGroup> = Object.fromEntries(
  aiGroups.map((g) => [g.slug, g]),
);

export function getGroup(slug: string): AiGroup | undefined {
  return aiGroupMap[slug];
}

export type AiCategory = {
  slug: string;
  name: string;
  /** 所属大类 */
  group: AiGroupSlug;
  description: string;
  /** 在所属大类内的排列顺序 */
  order: number;
  /** 分类页顶部的一句话导语 */
  intro: string;
};

export const aiCategories: AiCategory[] = [
  // ── 基础原理 ───────────────────────────────────────────
  {
    slug: "foundations",
    name: "模型基础",
    group: "basics",
    description: "分词、采样、上下文与推理模型的工作方式。",
    intro:
      "先把模型当作一个带状态的函数看：它读什么、怎么吐出下一个 token、为什么同一个问题两次答案不同。这一组是后面所有内容的地基。",
    order: 1,
  },
  {
    slug: "prompt",
    name: "提示词",
    group: "basics",
    description: "结构化指令、示例选择与自我校验。",
    intro:
      "提示词不是咒语。这一组把它拆成可讨论的部件：角色与约束、示例的选法、输出的结构、以及怎么把「感觉变好了」变成可回归的评测。",
    order: 2,
  },
  {
    slug: "rag",
    name: "检索与知识库",
    group: "basics",
    description: "切分、向量化、重排与检索评测。",
    intro:
      "检索质量决定回答质量的上限。这一组讲块怎么切、向量与关键词怎么混、召回率怎么量。",
    order: 3,
  },
  {
    slug: "agent",
    name: "Agent 与工具调用",
    group: "basics",
    description: "函数调用、ReAct 循环与多智能体协作。",
    intro:
      "Agent 的骨架其实很短：一次决策、一次工具调用、一次结果回填，然后重复。难的是什么时候停、错了怎么恢复。",
    order: 4,
  },

  // ── 工具与编程 ─────────────────────────────────────────
  {
    slug: "vibe",
    name: "AI 编程工具",
    group: "tooling",
    description: "Cursor、Claude Code、Codex 等工具的实操。",
    intro: "按「总览 → 单工具 → 深入用法」三层递进，尽量落到具体操作。",
    order: 1,
  },
  {
    slug: "coding",
    name: "AI 辅助开发",
    group: "tooling",
    description: "上下文管理、测试生成与重构边界。",
    intro: "把 AI 当协作者而不是自动补全：给它什么上下文、怎么验它的产出、哪里不该让它碰。",
    order: 2,
  },
  {
    slug: "engineering",
    name: "工程化",
    group: "tooling",
    description: "流式输出、成本控制、可观测性与限流降级。",
    intro: "上线之后的问题都在这一组：延迟、账单、复现、以及超时之后怎么办。",
    order: 3,
  },
  {
    slug: "models",
    name: "模型实测",
    group: "tooling",
    description: "各家模型的横向对比与场景表现。",
    intro: "只记可复现的观察：同一个任务上谁更稳、贵多少、上下文够不够用。",
    order: 4,
  },
  {
    slug: "tools",
    name: "工具选型",
    group: "tooling",
    description: "模型、推理框架与部署方案的取舍。",
    intro: "选型不是排行榜。这一组讲在什么约束下该选什么，以及换掉它的成本。",
    order: 5,
  },

  // ── 实战与产品 ─────────────────────────────────────────
  {
    slug: "build",
    name: "项目实战",
    group: "practice",
    description: "完整项目的搭建过程与关键决策。",
    intro: "从空目录到能访问的站点，记录每一步真正做的选择和踩到的坑。",
    order: 1,
  },
  {
    slug: "scenarios",
    name: "应用场景",
    group: "practice",
    description: "不同行业与角色怎么用起来。",
    intro: "按场景看落地：办公、内容、客服、教育、研发，各自卡在哪里。",
    order: 2,
  },
  {
    slug: "craft",
    name: "协作技巧",
    group: "practice",
    description: "和模型配合的手感与工作流。",
    intro: "同一件事，说法不同结果差很多。这一组是实操层面的经验。",
    order: 3,
  },
  {
    slug: "growth",
    name: "变现与运营",
    group: "practice",
    description: "定价、渠道、获客与交付。",
    intro: "做出东西只是开始。这一组讲怎么把它变成有人付钱的产品。",
    order: 4,
  },
  {
    slug: "product",
    name: "产品判断",
    group: "practice",
    description: "需求验证、定价与范围收敛。",
    intro: "选错问题的成本远高于写错代码。这一组讲怎么尽早知道自己在做错事。",
    order: 5,
  },

  // ── 入门路线 ───────────────────────────────────────────
  {
    slug: "start",
    name: "零基础入门",
    group: "getting-started",
    description: "第一次接触 AI 该先弄懂什么。",
    intro: "不假设任何前置知识，从「它到底是什么」开始，一路到能自己跑通一个小项目。",
    order: 1,
  },
  {
    slug: "learning",
    name: "学习路线",
    group: "getting-started",
    description: "按阶段排列的阅读与练习顺序。",
    intro: "给一条可执行的顺序，而不是一份资源清单。",
    order: 2,
  },
  {
    slug: "deepseek",
    name: "DeepSeek 手册",
    group: "getting-started",
    description: "国产模型的用法、技术解析与资源。",
    intro: "从使用到原理，把一套模型吃透。",
    order: 3,
  },

  // ── 平台与部署 ─────────────────────────────────────────
  {
    slug: "openclaw",
    name: "OpenClaw 手册",
    group: "platform",
    description: "自托管部署与接入的完整流程。",
    intro: "把服务跑在自己的机器上：环境、配置、反代、以及常见报错。",
    order: 1,
  },

  // ── 行业动态 ───────────────────────────────────────────
  {
    slug: "news",
    name: "行业动态",
    group: "news",
    description: "按日期归档的公开资讯。",
    intro: "时间线资料，适合回看某个模型或某家公司什么时候发生过什么，不适合当作稳定结论。",
    order: 1,
  },
];

export const aiCategoryMap: Record<string, AiCategory> = Object.fromEntries(
  aiCategories.map((c) => [c.slug, c]),
);

export function getCategory(slug: string): AiCategory | undefined {
  return aiCategoryMap[slug];
}

export function getCategoriesOfGroup(group: string): AiCategory[] {
  return aiCategories.filter((c) => c.group === group).sort((a, b) => a.order - b.order);
}

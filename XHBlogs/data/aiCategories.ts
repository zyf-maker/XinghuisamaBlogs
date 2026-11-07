// AI 知识库的分类定义。
// 目录名（slug）与 content/ai/<slug>/ 一一对应，改名时两边都要动。

export type AiCategory = {
  slug: string;
  name: string;
  en: string;
  description: string;
  /** 在总览页的排列顺序，小的在前 */
  order: number;
  /** 分类页顶部的一句话导语，比 description 更具体 */
  intro: string;
};

export const aiCategories: AiCategory[] = [
  {
    slug: "foundations",
    name: "模型基础",
    en: "Foundations",
    description: "分词、采样、上下文与推理模型的工作方式。",
    intro:
      "先把模型当作一个带状态的函数看：它读什么、怎么吐出下一个 token、为什么同一个问题两次答案不同。这一组是后面所有内容的地基。",
    order: 1,
  },
  {
    slug: "prompt",
    name: "提示词工程",
    en: "Prompting",
    description: "结构化指令、示例选择、自我校验与可回归的评测。",
    intro:
      "提示词不是玄学，是可以被拆解、被复用、被测试的工程产物。这一组讲怎么写，也讲怎么证明改完之后没有变差。",
    order: 2,
  },
  {
    slug: "agent",
    name: "Agent 与工具",
    en: "Agents",
    description: "工具调用、ReAct 循环、MCP 协议与多智能体的边界。",
    intro:
      "模型本身不能读文件、不能发请求。把「能动手」这件事拆开，就是工具定义、循环控制、错误恢复和权限，以及什么时候不要拆成多个智能体。",
    order: 3,
  },
  {
    slug: "rag",
    name: "检索与知识库",
    en: "Retrieval",
    description: "切分、混合检索、评测与知识库产品化。",
    intro:
      "检索质量决定回答质量的上限。这一组从文档怎么切开始，到怎么衡量召回是否真的变好了，再到一个知识库长期维护时绕不开的增量与权限。",
    order: 4,
  },
  {
    slug: "coding",
    name: "AI 编程",
    en: "Coding",
    description: "从补全到代理，以及如何审查模型写的代码。",
    intro:
      "AI 写代码已经不是能不能的问题，而是怎么用、怎么审、什么时候不该用。这一组偏实操，含一次真实的模块拆分记录。",
    order: 5,
  },
  {
    slug: "engineering",
    name: "工程化",
    en: "Engineering",
    description: "评测体系、成本控制、可观测性与发布策略。",
    intro:
      "把 demo 变成产品的过程里，最难的不是调 prompt，而是让它稳定、可测、便宜、出问题能查。这一组讲这些不太性感的部分。",
    order: 6,
  },
  {
    slug: "tools",
    name: "工具与选型",
    en: "Tooling",
    description: "模型选型、本地部署、编辑器与命令行工作流。",
    intro:
      "选型不是选最强的，是选在这个任务、这个预算、这个延迟要求下最合适的。这一组给出可复用的比较维度，而不是排行榜。",
    order: 7,
  },
  {
    slug: "product",
    name: "产品与变现",
    en: "Product",
    description: "从需求到 MVP、定价、获客与合规。",
    intro:
      "技术能跑通和有人愿意付钱是两件事。这一组记录把 AI 能力变成产品的路径，以及这一路上容易踩的合规坑。",
    order: 8,
  },
];

export const aiCategoryMap: Record<string, AiCategory> = Object.fromEntries(
  aiCategories.map((c) => [c.slug, c]),
);

export function getCategory(slug: string): AiCategory | undefined {
  return aiCategoryMap[slug];
}

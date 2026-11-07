// 全站模块导航，各模块侧栏共用。
// 放在一处，改名或加模块时只改这里。

export type ModuleLink = {
  label: string;
  href: string;
  en: string;
  /** 侧栏右侧的小字 */
  meta?: string;
};

export const moduleLinks: ModuleLink[] = [
  { label: "知识库", href: "/ai", en: "Knowledge" },
  { label: "工具库", href: "/tools", en: "Tools" },
  { label: "提示词", href: "/prompts", en: "Prompts" },
  { label: "MCP 与 Skills", href: "/mcp", en: "Protocol" },
  { label: "学习路线", href: "/learn", en: "Routes" },
  { label: "行业动态", href: "/ai/news", en: "News" },
];

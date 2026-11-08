import fs from "fs";
import path from "path";
import matter from "gray-matter";

import { getSearchIndex } from "./aiDocs";
import { toolsData } from "../data/tools";
import { promptsData } from "../data/prompts";
import { routes } from "../data/routes";
import { mcpServers, skillsData } from "../data/mcp";

/**
 * 跨模块的站内搜索索引。
 *
 * 为什么不用第三方搜索：全站内容量在几百条量级，一个几百 KB 的 JSON
 * 塞进首屏 RSC payload 完全扛得住，客户端做子串匹配的延迟比一次网络往返低。
 * 检索只需要标题 + 摘要 + 标签，正文不进索引。
 */
export type SearchItem = {
  kind: "笔记" | "工具" | "提示词" | "路线" | "MCP" | "Skill" | "文章" | "随笔";
  title: string;
  href: string;
  summary: string;
  /** 左侧小字，一般是分类名 */
  meta: string;
  /** 供匹配用的小写拼接串 */
  haystack: string;
};

function readPosts(dir: string, kind: "文章" | "随笔"): SearchItem[] {
  const full = path.join(process.cwd(), dir);
  if (!fs.existsSync(full)) return [];

  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(full, file), "utf8"));
      const title = (data.title as string) || file.replace(/\.md$/, "");
      const summary = ((data.description as string) || content.trim().slice(0, 70)).replace(/\s+/g, " ");
      const slug = file.replace(/\.md$/, "");
      return {
        kind,
        title,
        href: kind === "文章" ? `/posts/${slug}` : `/chatter/${slug}`,
        summary,
        meta: kind,
        haystack: `${title} ${summary}`.toLowerCase(),
      } satisfies SearchItem;
    });
}

let cached: SearchItem[] | null = null;

export function getSearchItems(): SearchItem[] {
  if (cached) return cached;

  const notes: SearchItem[] = getSearchIndex().map((d) => ({
    kind: "笔记",
    title: d.title,
    href: `/ai/${d.category}/${d.slug}`,
    summary: d.summary,
    meta: d.categoryName,
    haystack: d.haystack,
  }));

  const tools: SearchItem[] = toolsData.map((t) => ({
    kind: "工具",
    title: t.name,
    href: `/tools/${t.category}#${t.id}`,
    summary: t.tagline,
    meta: t.pricing,
    haystack: `${t.name} ${t.tagline} ${t.detail} ${t.tags.join(" ")}`.toLowerCase(),
  }));

  const prompts: SearchItem[] = promptsData.map((p) => ({
    kind: "提示词",
    title: p.title,
    href: `/prompts/${p.group}#${p.id}`,
    summary: p.useCase,
    meta: p.useCase,
    haystack: `${p.title} ${p.useCase} ${p.tags.join(" ")} ${p.body}`.toLowerCase(),
  }));

  const routeItems: SearchItem[] = routes.map((r) => ({
    kind: "路线",
    title: r.name,
    href: `/learn/${r.slug}`,
    summary: r.outcome,
    meta: `${r.steps.length} 步`,
    haystack: `${r.name} ${r.audience} ${r.outcome}`.toLowerCase(),
  }));

  const mcp: SearchItem[] = mcpServers.map((m) => ({
    kind: "MCP",
    title: m.name,
    href: `/mcp#${m.id}`,
    summary: m.capability,
    meta: m.origin,
    haystack: `${m.name} ${m.capability} ${m.whenToUse} ${m.tags.join(" ")}`.toLowerCase(),
  }));

  const skills: SearchItem[] = skillsData.map((s) => ({
    kind: "Skill",
    title: s.name,
    href: `/mcp#${s.id}`,
    summary: s.what,
    meta: "Skill",
    haystack: `${s.name} ${s.what} ${s.trigger} ${s.tags.join(" ")}`.toLowerCase(),
  }));

  cached = [
    ...notes,
    ...readPosts("posts", "文章"),
    ...readPosts("chatters", "随笔"),
    ...tools,
    ...prompts,
    ...routeItems,
    ...mcp,
    ...skills,
  ];

  return cached;
}

import fs from "fs";
import path from "path";
import matter from "gray-matter";

import {
  aiCategories,
  aiGroups,
  aiCategoryMap,
  aiGroupMap,
  getCategoriesOfGroup,
  type AiCategory,
  type AiGroup,
  type AiGroupSlug,
} from "../data/aiCategories";

export type AiDoc = {
  /** 形如 "agent/002-react-loop"，全站唯一 */
  key: string;
  category: string;
  categoryName: string;
  group: string;
  groupName: string;
  slug: string;
  title: string;
  summary: string;
  order: number;
  level: string;
  tags: string[];
  updated: string;
  readingTime: number;
  /** 原作者，没有就空 */
  author: string;
  /** 原始出处链接，没有就空 */
  source: string;
  /** 去掉 frontmatter 后的正文，供检索与统计字数 */
  body: string;
};

export type AiCategoryWithDocs = AiCategory & {
  docs: AiDoc[];
};

/**
 * 传给客户端组件（左栏目录）的轻量结构。
 * 绝不能把 body 一起序列化下去：一篇正文几 KB，几十篇就会把 RSC payload 撑到 MB 级。
 */
export type AiDocBrief = Omit<AiDoc, "body">;

export type AiCategoryBrief = {
  slug: string;
  name: string;
  group: string;
  groupName: string;
  docs: AiDocBrief[];
};

export function toBrief(categories: AiCategoryWithDocs[]): AiCategoryBrief[] {
  return categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    group: c.group,
    groupName: aiGroupMap[c.group]?.name ?? c.group,
    docs: c.docs.map(({ body, ...rest }) => rest),
  }));
}

/** 左栏专用：全部分类的目录树，不含正文 */
export function getAllCategoryBriefs(): AiCategoryBrief[] {
  return toBrief(getAllCategories());
}



/**
 * 正式内容目录：content/notes/<category>/
 * 演示/测试内容目录：content/archive/ai/<category>/ —— 只有设置 SHOW_DEMO_CONTENT=1 时才读
 *
 * 这样正式发布永远不会带上测试文章，本地想验版式时再加环境变量。
 */
const NOTES_ROOT = path.join(process.cwd(), "content", "notes");
const DEMO_ROOT = path.join(process.cwd(), "content", "archive", "ai");

export function demoEnabled(): boolean {
  return process.env.SHOW_DEMO_CONTENT === "1";
}

function contentRoot(): string {
  return demoEnabled() ? DEMO_ROOT : NOTES_ROOT;
}

function toNumber(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[,，]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/** 读一个分类目录下的全部 md，按 order、文件名排序 */
function readCategory(category: AiCategory): AiDoc[] {
  const dir = path.join(contentRoot(), category.slug);
  if (!fs.existsSync(dir)) return [];

  const groupName = aiGroupMap[category.group]?.name ?? category.group;
  const docs: AiDoc[] = [];

  for (const fileName of fs.readdirSync(dir)) {
    if (!fileName.endsWith(".md")) continue;

    const full = path.join(dir, fileName);
    let parsed;
    try {
      parsed = matter(fs.readFileSync(full, "utf8"));
    } catch {
      // 单篇 frontmatter 坏掉不应该让整站构建失败
      continue;
    }

    const { data, content } = parsed;
    const slug = fileName.replace(/\.md$/, "");

    docs.push({
      key: `${category.slug}/${slug}`,
      category: category.slug,
      categoryName: category.name,
      group: category.group,
      groupName,
      slug,
      title: (data.title as string) || slug,
      summary: (data.summary as string) || content.trim().slice(0, 60),
      order: toNumber(data.order, 999),
      level: (data.level as string) || "入门",
      tags: toStringArray(data.tags),
      updated: (data.updated as string) || (data.date as string) || "",
      readingTime: toNumber(data.readingTime, Math.max(1, Math.round(content.length / 400))),
      author: (data.author as string) || "",
      source: (data.source as string) || "",
      body: content,
    });
  }

  return docs.sort((a, b) => (a.order !== b.order ? a.order - b.order : a.slug.localeCompare(b.slug)));
}

let cacheKey = "";
let cache: AiCategoryWithDocs[] | null = null;

/** 全站唯一的入口：所有分类 + 其下文章。构建期同步读盘，结果缓存。 */
export function getAllCategories(): AiCategoryWithDocs[] {
  const key = contentRoot();
  if (cache && cacheKey === key) return cache;
  cacheKey = key;
  cache = [...aiCategories]
    .sort((a, b) => a.order - b.order)
    .map((c) => ({ ...c, docs: readCategory(c) }));
  return cache;
}

export function getAllDocs(): AiDoc[] {
  return getAllCategories().flatMap((c) => c.docs);
}

export function getCategoryWithDocs(slug: string): AiCategoryWithDocs | undefined {
  return getAllCategories().find((c) => c.slug === slug);
}

export function getDoc(category: string, slug: string): AiDoc | undefined {
  return getCategoryWithDocs(category)?.docs.find((d) => d.slug === slug);
}

/** 全站按更新时间倒序，用于「最近更新」 */
export function getRecentDocs(limit = 8): AiDoc[] {
  return [...getAllDocs()]
    .sort((a, b) => (a.updated < b.updated ? 1 : a.updated > b.updated ? -1 : 0))
    .slice(0, limit);
}

/** 上一篇 / 下一篇，只在同一分类内导航 */
export function getNeighbours(category: string, slug: string): { prev?: AiDoc; next?: AiDoc } {
  const docs = getCategoryWithDocs(category)?.docs ?? [];
  const i = docs.findIndex((d) => d.slug === slug);
  if (i < 0) return {};
  return { prev: docs[i - 1], next: docs[i + 1] };
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const doc of getAllDocs()) {
    for (const tag of doc.tags) counts.set(tag, (counts.get(tag) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => (b.count !== a.count ? b.count - a.count : a.tag.localeCompare(b.tag)));
}

/** 大类级的聚合，首页与左栏用 */
export type GroupWithCategories = AiGroup & {
  categories: AiCategoryWithDocs[];
  docCount: number;
};

export function getGroups(): GroupWithCategories[] {
  const all = getAllCategories();
  return [...aiGroups]
    .sort((a, b) => a.order - b.order)
    .map((g) => {
      const categories = getCategoriesOfGroup(g.slug)
        .map((c) => all.find((x) => x.slug === c.slug))
        .filter((x): x is AiCategoryWithDocs => Boolean(x))
        .filter((x) => x.docs.length > 0);
      return { ...g, categories, docCount: categories.reduce((n, c) => n + c.docs.length, 0) };
    })
    .filter((g) => g.docCount > 0);
}

/** 分类级别的统计，总览页顶部用 */
export function getStats() {
  const all = getAllDocs();
  const levels = new Map<string, number>();
  for (const d of all) levels.set(d.level, (levels.get(d.level) || 0) + 1);

  return {
    categories: getAllCategories().filter((c) => c.docs.length > 0).length,
    groups: getGroups().length,
    docs: all.length,
    tags: new Set(all.flatMap((d) => d.tags)).size,
    minutes: all.reduce((n, d) => n + d.readingTime, 0),
    levelBreakdown: [...levels.entries()].map(([level, count]) => ({ level, count })),
  };
}

/** 给站内搜索用的轻量索引，只含标题 / 摘要 / 标签 */
export type AiSearchEntry = {
  key: string;
  title: string;
  category: string;
  categoryName: string;
  group: string;
  groupName: string;
  slug: string;
  summary: string;
  tags: string[];
  level: string;
  readingTime: number;
  updated: string;
  haystack: string;
};

/**
 * 正文摘要参与检索：读者想搜的往往是文中出现过的词（报错串、参数名），
 * 只查标题会让命中率低得离谱。截前 1400 字、去掉 Markdown 记号，
 * 体积换命中率，45 篇量级下首屏 payload 只多几十 KB。
 */
function bodyHaystack(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*`|~\-]{1,}/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1400);
}

export function getSearchIndex(): AiSearchEntry[] {
  return getAllDocs().map((d) => ({
    key: d.key,
    title: d.title,
    category: d.category,
    categoryName: d.categoryName,
    group: d.group,
    groupName: d.groupName,
    slug: d.slug,
    summary: d.summary,
    tags: d.tags,
    level: d.level,
    readingTime: d.readingTime,
    updated: d.updated,
    haystack: [d.title, d.summary, d.categoryName, d.groupName, ...d.tags, bodyHaystack(d.body)]
      .join(" ")
      .toLowerCase(),
  }));
}

export { aiCategoryMap, aiGroupMap, type AiGroupSlug };

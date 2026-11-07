import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "highlight.js/styles/atom-one-dark.css";

export type TocItem = { level: number; text: string; id: string };

/** 把标题转成稳定 id：保留中日韩与字母数字，其余折成连字符 */
export function slugifyHeading(raw: string): string {
  const plain = raw
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/[*_~`#]/g, "")
    .trim();
  const slug = plain
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `h-${slug || "section"}`;
}

/** 从 markdown 里抽 h2 / h3，跳过代码围栏里的伪标题 */
export function extractToc(content: string): TocItem[] {
  const toc: TocItem[] = [];
  let fence: { marker: string; length: number } | null = null;

  for (const line of content.split(/\r?\n/)) {
    const delimiter = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (delimiter) {
      const marker = delimiter[1][0];
      if (!fence) {
        if (marker !== "`" || !delimiter[2].includes("`")) {
          fence = { marker, length: delimiter[1].length };
          continue;
        }
      } else if (marker === fence.marker && delimiter[1].length >= fence.length && !delimiter[2].trim()) {
        fence = null;
        continue;
      }
    }
    if (fence) continue;

    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const text = match[2].trim();
      toc.push({ level: match[1].length, text, id: slugifyHeading(text) });
    }
  }
  return toc;
}

type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: string;
};

function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

/**
 * 给 h2 / h3 补 id 的 rehype 插件。
 * 用自写的树遍历，避免额外依赖；标题文本重复时追加序号保证唯一。
 */
function rehypeHeadingIds() {
  return (tree: HastNode) => {
    const seen = new Map<string, number>();

    const walk = (node: HastNode) => {
      if (node.type === "element" && (node.tagName === "h2" || node.tagName === "h3")) {
        const base = slugifyHeading(textOf(node));
        const n = seen.get(base) ?? 0;
        seen.set(base, n + 1);
        node.properties = { ...(node.properties ?? {}), id: n === 0 ? base : `${base}-${n}` };
      }
      (node.children ?? []).forEach(walk);
    };

    walk(tree);
  };
}

/** markdown -> html，标题带锚点 id */
export async function renderMarkdown(content: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    // @ts-ignore rehype-highlight 7.x 的 options 类型没有导出
    .use(rehypeHighlight, {
      detect: false,
      ignoreMissing: true,
      subset: [
        "bash", "shell", "python", "typescript", "javascript", "tsx", "jsx",
        "json", "yaml", "sql", "cpp", "c", "go", "rust", "html", "css",
        "diff", "text", "markdown",
      ],
    })
    .use(rehypeKatex)
    .use(rehypeHeadingIds)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  return file.toString();
}

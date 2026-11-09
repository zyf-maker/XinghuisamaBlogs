import fs from "fs";
import path from "path";

/**
 * 配图取用：优先 AI 生成的 jpg，缺席时退回原有 svg 占位。
 *
 * 这样补图只需把文件放进 public/，页面代码不用再动。
 */
const PUBLIC_DIR = path.join(process.cwd(), "public");
const cache = new Map<string, string>();

/** 每种配图的候选路径，按优先级排列 */
function candidates(kind: string, slug: string): string[] {
  if (kind === "route") {
    return [`covers/route/route-${slug}.jpg`, `/covers/route-${slug}`.slice(1) + ".svg"];
  }
  if (kind === "gallery") {
    return [`gallery/ai/${slug}.jpg`, `gallery/${slug}.svg`];
  }
  return [`covers/ai/${slug}.jpg`, `covers/${slug}.svg`];
}

export type CoverKind = "topic" | "route" | "gallery";

export function cover(kind: CoverKind, slug: string, fallback = "/covers/foundations.svg"): string {
  const key = `${kind}/${slug}`;
  const hit = cache.get(key);
  if (hit) return hit;

  for (const rel of candidates(kind, slug)) {
    if (fs.existsSync(path.join(PUBLIC_DIR, rel))) {
      const url = "/" + rel;
      cache.set(key, url);
      return url;
    }
  }

  // 路线没有专属图时借用「入门路线」主题图
  if (kind === "route") {
    for (const rel of ["covers/ai/getting-started.jpg", "covers/getting-started.svg"]) {
      if (fs.existsSync(path.join(PUBLIC_DIR, rel))) {
        const url = "/" + rel;
        cache.set(key, url);
        return url;
      }
    }
  }

  cache.set(key, fallback);
  return fallback;
}

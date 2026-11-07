import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

import { getAllDocs } from "../lib/aiDocs";

const BASE = "https://xinghuisama-blogs-sandy.vercel.app";

function markdownSlugs(dir: string): string[] {
  const full = path.join(process.cwd(), dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/ai",
    "/ai/all",
    "/ai/ask",
    "/timeline",
    "/chatter",
    "/moments",
    "/projects",
    "/photowall",
    "/music",
    "/friends",
    "/about",
  ].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));

  const categoryRoutes = ["foundations", "prompt", "agent", "rag", "coding", "engineering", "tools", "product"].map(
    (c) => ({
      url: `${BASE}/ai/${c}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }),
  );

  const docRoutes = getAllDocs().map((d) => ({
    url: `${BASE}/ai/${d.category}/${d.slug}`,
    lastModified: new Date(d.updated || Date.now()),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const postRoutes = markdownSlugs("posts").map((s) => ({
    url: `${BASE}/posts/${s}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const chatterRoutes = markdownSlugs("chatters").map((s) => ({
    url: `${BASE}/chatter/${s}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...categoryRoutes, ...docRoutes, ...postRoutes, ...chatterRoutes];
}

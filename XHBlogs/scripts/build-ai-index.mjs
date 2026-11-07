// 构建期把 content/ai 下的笔记压成一份 JSON 索引，供 edge runtime 的问答接口使用。
// 为什么需要这一步：edge runtime 不能访问 fs，而检索需要在运行时读到正文。
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const contentDir = path.join(root, "content", "ai");
const outFile = path.join(root, "lib", "aiIndex.generated.json");

const CATEGORY_NAMES = {
  foundations: "模型基础",
  prompt: "提示词工程",
  agent: "Agent 与工具",
  rag: "检索与知识库",
  coding: "AI 编程",
  engineering: "工程化",
  tools: "工具与选型",
  product: "产品与变现",
};

function collect() {
  if (!fs.existsSync(contentDir)) return [];
  const docs = [];

  for (const category of fs.readdirSync(contentDir)) {
    const dir = path.join(contentDir, category);
    if (!fs.statSync(dir).isDirectory()) continue;

    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".md")) continue;
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      if (!data.title) continue;

      const slug = file.replace(/\.md$/, "");
      docs.push({
        key: `${category}/${slug}`,
        category,
        categoryName: CATEGORY_NAMES[category] || category,
        slug,
        title: String(data.title),
        summary: String(data.summary || ""),
        level: String(data.level || "入门"),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        body: content.slice(0, 6000),
      });
    }
  }

  return docs;
}

const docs = collect();
fs.writeFileSync(outFile, JSON.stringify(docs), "utf8");
console.log(`[ai-index] ${docs.length} docs -> ${path.relative(root, outFile)}`);

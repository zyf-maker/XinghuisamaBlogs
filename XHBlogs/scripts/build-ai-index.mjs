// 构建期把笔记压成一份 JSON 索引，供 edge runtime 的问答接口使用。
// 为什么需要这一步：edge runtime 不能访问 fs，而检索需要在运行时读到正文。
//
// 内容源跟随 SHOW_DEMO_CONTENT 开关：
//   默认        content/notes/<category>/
//   =1 时       content/archive/ai/<category>/（测试用，正式发布不读）
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const demo = process.env.SHOW_DEMO_CONTENT === "1";
const contentDir = path.join(root, "content", demo ? "archive/ai" : "notes");
const outFile = path.join(root, "lib", "aiIndex.generated.json");

/** 不进检索的分类：资讯只是链接列表，噪音大于信号 */
const SKIP_CATEGORIES = new Set(["news"]);

/** 每篇正文进索引的字符数。edge 函数有体积上限，1800 字足够命中主题词。 */
const BODY_LIMIT = 1800;

const CATEGORY_NAMES = {
  foundations: "模型基础",
  prompt: "提示词",
  agent: "Agent 与工具调用",
  rag: "检索与知识库",
  coding: "AI 辅助开发",
  engineering: "工程化",
  tools: "工具选型",
  product: "产品判断",
  start: "零基础入门",
  deepseek: "DeepSeek 手册",
  scenarios: "应用场景",
  vibe: "AI 编程工具",
  build: "项目实战",
  craft: "协作技巧",
  growth: "变现与运营",
  learning: "学习路线",
  models: "模型实测",
  openclaw: "OpenClaw 手册",
  news: "行业动态",
};

function collect() {
  if (!fs.existsSync(contentDir)) return [];
  const docs = [];

  for (const category of fs.readdirSync(contentDir)) {
    if (SKIP_CATEGORIES.has(category)) continue;

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
        body: content.slice(0, BODY_LIMIT),
      });
    }
  }

  return docs;
}

const docs = collect();
fs.writeFileSync(outFile, JSON.stringify(docs), "utf8");
console.log(`[ai-index] ${docs.length} docs (${demo ? "demo" : "live"}) -> ${path.relative(root, outFile)}`);

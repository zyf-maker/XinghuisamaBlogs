// edge runtime 专用的检索索引。
// 为什么单独一个文件：edge 里没有 fs，不能像 lib/aiDocs.ts 那样在运行时读 content/ai。
// 索引由 scripts/build-ai-index.mjs 在 build/dev/start 之前生成，指向 lib/aiIndex.generated.json。
import raw from "./aiIndex.generated.json";

export type AiIndexEntry = {
  key: string;
  category: string;
  categoryName: string;
  slug: string;
  title: string;
  summary: string;
  level: string;
  tags: string[];
  body: string;
};

const ENTRIES = raw as AiIndexEntry[];

const norm = (s: string) => s.replace(/\s+/g, "").toLowerCase();

// 口语词 → 文档用词。只放真正会造成漏检的，不追求大词表。
const SYNONYMS: [string, string][] = [
  ["分块", "切分"],
  ["切片", "切分"],
  ["切块", "切分"],
  ["显存", "显存"],
  ["流式", "流式"],
];

export function getIndexEntries(): AiIndexEntry[] {
  return ENTRIES;
}

export function getIndexSize(): number {
  return ENTRIES.length;
}

/**
 * 检索：字符级 2-gram 重合度打分。
 * 不用向量的理由——文档总量在几百篇以内，一次遍历是毫秒级；
 * 而且「命中了哪几个二元组」是可解释的，方便回答里给出引用。
 *
 * 分层加权是必须的：只按正文命中数排序，长文会靠体量压过主题更准的短篇
 * （实测问「温度和 top_p 怎么调」，一篇讲可观测性的长文排到了采样那篇前面）。
 * 所以标题 8 分、标签 5 分、摘要 4 分、正文 1 分。
 */
export function retrieve(question: string, limit = 4) {
  const q = question.replace(/\s+/g, "").toLowerCase();
  if (q.length < 2) return [];

  const grams = new Set<string>();
  for (let i = 0; i < q.length - 1; i++) grams.add(q.slice(i, i + 2));

  // 同义词扩展：用户口语说「分块」，文档标题写「切分」，
  // 纯字面 2-gram 会把后者排到评测那篇之后——这类词必须显式桥接。
  for (const [from, to] of SYNONYMS) {
    if (q.includes(from)) {
      const t = norm(to);
      for (let i = 0; i < t.length - 1; i++) grams.add(t.slice(i, i + 2));
    }
  }

  const scored = ENTRIES.map((doc) => {
    const title = norm(doc.title);
    const tags = norm(doc.tags.join(" "));
    const summary = norm(doc.summary);
    const body = norm(doc.body);

    let titleHit = 0;
    let tagHit = 0;
    let summaryHit = 0;
    let bodyHit = 0;

    for (const g of grams) {
      if (title.includes(g)) titleHit++;
      if (tags.includes(g)) tagHit++;
      if (summary.includes(g)) summaryHit++;
      if (body.includes(g)) bodyHit++;
    }

    const score = titleHit * 8 + tagHit * 5 + summaryHit * 4 + bodyHit;
    return { doc, score, titleHit };
  });

  return scored
    .filter((s) => s.score > 0 && (s.titleHit > 0 || s.score >= 6))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

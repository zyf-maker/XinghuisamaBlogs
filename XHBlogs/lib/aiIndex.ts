// edge runtime 专用的检索索引。
// 为什么单独一个文件：edge 里没有 fs，不能像 lib/aiDocs.ts 那样在运行时读 content/notes。
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

// 口语词 → 文档用词。中文术语和英文参数名之间必须显式桥接：
// 问「温度怎么调」时，采样那篇的标题与标签只有 temperature，
// 纯字面 2-gram 完全对不上，会被正文里顺带提过「温度」的长文压住。
const SYNONYMS: [string, string][] = [
  ["分块", "切分"],
  ["切片", "切分"],
  ["切块", "切分"],
  ["温度", "temperature"],
  ["幻觉", "编造"],
  ["提示词", "prompt"],
  ["智能体", "agent"],
  ["慢", "延迟"],
];

/** 英文词元、下划线标识符、参数名单独抽出来精确加权 */
const LATIN = /[a-z][a-z0-9_]{1,}/g;

function gramsOf(s: string): Set<string> {
  const out = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2));
  return out;
}

// 字段权重：标题最可信，正文只作佐证
const W = { title: 3.0, tags: 2.2, summary: 1.8, body: 1.0 };

type Prepared = {
  doc: AiIndexEntry;
  title: string;
  tags: string;
  summary: string;
  body: string;
};

let prepared: Prepared[] | null = null;
let docFreq: Map<string, number> | null = null;

function prepare() {
  if (prepared && docFreq) return { prepared, docFreq };

  prepared = ENTRIES.map((doc) => ({
    doc,
    title: norm(doc.title),
    tags: norm(doc.tags.join(" ")),
    summary: norm(doc.summary),
    body: norm(doc.body),
  }));

  // 每篇只统计一次出现的 gram，避免长文靠重复刷分
  docFreq = new Map<string, number>();
  for (const p of prepared) {
    const seen = gramsOf(`${p.title}\u0000${p.tags}\u0000${p.summary}\u0000${p.body}`);
    for (const g of seen) docFreq.set(g, (docFreq.get(g) ?? 0) + 1);
  }

  return { prepared, docFreq };
}

/**
 * 检索：IDF 加权的字符 2-gram 覆盖率 + 拉丁词元精确命中。
 *
 * 为什么不用向量：文档总量几十到几百篇，一次遍历是毫秒级；
 * 「命中了哪几个二元组」可解释，回答里能给出引用。
 *
 * 为什么必须 IDF：中文常见的二元组（「怎么」「一个」「to」）几乎每篇都有，
 * 按命中数量排序等于按篇幅排序。乘以 ln(N/df) 之后，
 * 只有真正区分主题的 gram（「采样」「重连」）才有分量。
 */
export function retrieve(question: string, limit = 4) {
  const q = norm(question);
  if (q.length < 2) return [];

  const { prepared: docs, docFreq: df } = prepare();
  const N = docs.length;

  // 查询 gram：基础 gram + 同义词桥接 gram（权重减半，因为不是原话）
  const base = gramsOf(q);
  const syn = new Set<string>();
  for (const [from, to] of SYNONYMS) {
    if (q.includes(from)) for (const g of gramsOf(norm(to))) syn.add(g);
  }
  for (const g of base) syn.delete(g);

  const idf = (g: string) => Math.log((N + 1) / ((df.get(g) ?? 0) + 0.5));

  let maxScore = 0;
  for (const g of base) maxScore += idf(g);
  for (const g of syn) maxScore += idf(g) * 0.5;
  if (maxScore <= 0) maxScore = 1;

  const latin = Array.from(new Set((question.toLowerCase().match(LATIN) ?? []).filter((t) => t.length >= 2)));

  const scored = docs.map((p) => {
    let score = 0;
    let titleHit = 0;
    let tagHit = 0;
    let summaryHit = 0;
    let bodyHit = 0;

    for (const g of base) {
      const w = idf(g);
      if (p.title.includes(g)) {
        score += w * W.title;
        titleHit++;
      }
      if (p.tags.includes(g)) {
        score += w * W.tags;
        tagHit++;
      }
      if (p.summary.includes(g)) {
        score += w * W.summary;
        summaryHit++;
      }
      if (p.body.includes(g)) {
        score += w * W.body;
        bodyHit++;
      }
    }

    for (const g of syn) {
      const w = idf(g) * 0.5;
      if (p.title.includes(g)) {
        score += w * W.title;
        titleHit++;
      }
      if (p.tags.includes(g)) {
        score += w * W.tags;
        tagHit++;
      }
      if (p.summary.includes(g)) {
        score += w * W.summary;
        summaryHit++;
      }
      if (p.body.includes(g)) score += w * W.body;
    }

    // 归一化成 0..1 的匹配度，再放大到百分制，便于设阈值
    let pct = (score / maxScore) * 100;

    // 英文标识符精确命中是最强的意图信号，单独加分
    for (const t of latin) {
      if (p.title.includes(t)) pct += 22;
      else if (p.tags.includes(t)) pct += 15;
      else if (p.summary.includes(t)) pct += 11;
      else if (p.body.includes(t)) pct += 5;
    }

    const strong = titleHit > 0 || tagHit > 0 || summaryHit > 0 || latin.some((t) => p.body.includes(t));

    // 正文里原样抄了这句话的，通常是在「讨论」这个问题（举例、讲排序踩坑），
    // 不是在回答它。实测这条规则能把《给站点接一条流式问答接口》从
    // 「温度和 top_p 怎么调」的第一名压下去。
    if (p.body.includes(q) && titleHit === 0) pct *= 0.45;

    return { doc: p.doc, score: pct, strong };
  });

  return scored
    .filter((s) => s.strong && s.score >= 14)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getIndexEntries(): AiIndexEntry[] {
  return ENTRIES;
}

export function getIndexSize(): number {
  return ENTRIES.length;
}

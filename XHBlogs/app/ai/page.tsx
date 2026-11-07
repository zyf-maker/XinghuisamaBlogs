import type { Metadata } from "next";
import Link from "next/link";

import PageHeader from "../../components/PageHeader";
import { getAllCategories, getRecentDocs, getStats, getAllTags } from "../../lib/aiDocs";

export const metadata: Metadata = {
  title: "AI 知识库",
  description: "从模型基础到产品变形的八组笔记：把大模型相关的东西讲清楚，且能落地。",
};

function shortDate(v: string) {
  if (!v) return "";
  return v.slice(0, 7).replace("-", ".");
}

export default function AiIndexPage() {
  const categories = getAllCategories();
  const stats = getStats();
  const recent = getRecentDocs(6);
  const tags = getAllTags().slice(0, 14);

  return (
    <main className="mx-auto w-[92%] max-w-5xl pb-24 pt-14">
      <PageHeader
        eyebrow={`Knowledge · ${stats.docs} 篇 · ${stats.categories} 组`}
        title="AI 知识库"
        description="不是词典，是工作笔记。每一篇都从一个具体问题出发，给出可执行的判断、参数和踩过的坑；讲不清楚的地方会直说讲不清楚。"
      />

      {/* 统计条：一块玻璃条，四格用发丝线切开 */}
      <div className="glass glass-sheen mt-2 grid grid-cols-2 divide-x divide-y divide-[var(--line)] overflow-hidden sm:grid-cols-4 sm:divide-y-0">
        {[
          { label: "篇目", value: String(stats.docs), unit: "docs" },
          { label: "分组", value: String(stats.categories), unit: "groups" },
          { label: "标签", value: String(stats.tags), unit: "tags" },
          { label: "总阅读", value: String(stats.minutes), unit: "min" },
        ].map((item) => (
          <div key={item.label} className="px-4 py-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
              {item.label}
            </p>
            <p className="mt-1.5 font-serif text-[1.6rem] font-bold leading-none text-[var(--ink)]">
              {item.value}
              <span className="ml-1 font-mono text-[10px] font-normal tracking-[0.1em] text-[var(--muted)]">
                {item.unit}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* 分类网格 */}
      <section className="pt-12">
        <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-3">
          <h2 className="font-serif text-lg font-bold text-[var(--ink)]">八个分组</h2>
          <Link
            href="/ai/all"
            className="font-mono text-[10px] tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
          >
            INDEX →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {categories.map((cat, i) => (
            <Link
              key={cat.slug}
              href={`/ai/${cat.slug}`}
              className="glass glass-sheen group flex flex-col gap-3 p-6 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] tracking-[0.18em] text-[var(--muted)]">
                  {String(i + 1).padStart(2, "0")} / {cat.en.toUpperCase()}
                </span>
                <span className="font-mono text-[10px] text-[var(--muted)]">{cat.docs.length}</span>
              </div>

              <h3 className="font-serif text-[1.3rem] font-bold leading-tight text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                {cat.name}
              </h3>

              <p className="text-[12.5px] leading-[1.8] text-[var(--ink-soft)]">{cat.description}</p>

              <p className="mt-auto line-clamp-2 border-t border-[var(--line)] pt-3 font-mono text-[10.5px] leading-[1.7] text-[var(--muted)]">
                {cat.docs.slice(0, 3).map((d) => d.title).join(" · ") || "待补充"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 最近更新 + 标签 */}
      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_260px]">
        <section>
          <div className="border-b border-[var(--line)] pb-3">
            <h2 className="font-serif text-lg font-bold text-[var(--ink)]">最近更新</h2>
          </div>

          {recent.length === 0 ? (
            <p className="py-10 text-[13px] text-[var(--muted)]">还没有篇目。</p>
          ) : (
            <ol className="divide-y divide-[var(--line)]">
              {recent.map((doc, i) => (
                <li key={doc.key}>
                  <Link href={`/ai/${doc.category}/${doc.slug}`} className="group flex gap-4 py-5">
                    <span className="w-6 shrink-0 pt-1 font-mono text-[11px] text-[var(--muted)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[14.5px] font-semibold leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                        {doc.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-[12.5px] leading-[1.75] text-[var(--ink-soft)]">
                        {doc.summary}
                      </p>
                      <p className="mt-1.5 font-mono text-[10px] tracking-[0.1em] text-[var(--muted)]">
                        {doc.categoryName} · {shortDate(doc.updated)} · {doc.readingTime} 分钟
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>

        <aside className="space-y-8">
          <div>
            <div className="border-b border-[var(--line)] pb-3">
              <p className="eyebrow">标签</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <Link
                  key={t.tag}
                  href={`/ai/all?tag=${encodeURIComponent(t.tag)}`}
                  className="glass-inset tag transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {t.tag}
                  <span className="ml-1 opacity-60">{t.count}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="border border-[var(--line)] p-4">
            <p className="eyebrow">怎么读</p>
            <p className="mt-2.5 text-[12.5px] leading-[1.85] text-[var(--ink-soft)]">
              如果刚开始接触，按「模型基础 → 提示词工程 → 检索与知识库」的顺序走。
              如果已经在做产品，直接从「工程化」和「产品与变现」入手更省时间。
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

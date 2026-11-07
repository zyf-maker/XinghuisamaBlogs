import type { Metadata } from "next";
import Link from "next/link";

import PageHeader from "../../components/PageHeader";
import { getAllCategories, getRecentDocs, getStats, getAllTags } from "../../lib/aiDocs";

export const metadata: Metadata = {
  title: "AI 知识库",
  description:
    "两组内容：一组是自己写的判断与取舍，一组是按 CC BY-NC-SA 4.0 转载整理的公开资料。从模型基础到产品变现。",
};

function shortDate(v: string) {
  if (!v) return "";
  return v.slice(0, 7).replace("-", ".");
}

type Cat = ReturnType<typeof getAllCategories>[number];

function CategoryGrid({ items, startIndex }: { items: Cat[]; startIndex: number }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {items.map((cat, i) => (
        <Link
          key={cat.slug}
          href={`/ai/${cat.slug}`}
          className="glass glass-sheen group flex flex-col gap-3 p-6 transition-transform duration-300 hover:-translate-y-0.5"
        >
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] tracking-[0.18em] text-[var(--muted)]">
              {String(startIndex + i + 1).padStart(2, "0")} / {cat.en.toUpperCase()}
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
  );
}

function SectionHead({ title, note, count }: { title: string; note: string; count: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-3">
      <h2 className="font-serif text-lg font-bold text-[var(--ink)]">
        {title}
        {note ? (
          <span className="ml-3 font-mono text-[10px] font-normal tracking-[0.12em] text-[var(--muted)]">
            {note}
          </span>
        ) : null}
      </h2>
      <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--muted)]">{count}</span>
    </div>
  );
}

export default function AiIndexPage() {
  const all = getAllCategories().filter((c) => c.docs.length > 0);
  const original = all.filter((c) => c.kind === "original");
  const republished = all.filter((c) => c.kind === "republished");
  const stats = getStats();
  const recent = getRecentDocs(6);
  const tags = getAllTags().slice(0, 14);

  return (
    <main className="mx-auto w-[92%] max-w-5xl pb-24 pt-14">
      <PageHeader
        eyebrow={`Knowledge · ${stats.docs} 篇 · ${stats.categories} 组`}
        title="AI 知识库"
        description="两组东西：前八组是我自己写的判断、参数与踩坑，篇幅不长但每篇都落到一个具体动作；后面几组是按 CC BY-NC-SA 4.0 转载整理的公开教程，当作手册与索引来用。两边在篇目页都标了出处。"
      />

      {/* 统计条：一块玻璃条，四格用发丝线切开 */}
      <div className="glass glass-sheen mt-2 grid grid-cols-2 divide-x divide-y divide-[var(--line)] overflow-hidden sm:grid-cols-4 sm:divide-y-0">
        {[
          { label: "篇目", value: String(stats.docs), unit: "docs" },
          { label: "分组", value: String(stats.categories), unit: "groups" },
          { label: "原创", value: String(original.reduce((n, c) => n + c.docs.length, 0)), unit: "own" },
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

      {/* 原创 */}
      <section className="pt-12">
        <SectionHead
          title="原创笔记"
          note={`${original.reduce((n, c) => n + c.docs.length, 0)} 篇 · ${original.length} 组`}
          count="OWN NOTES"
        />
        <CategoryGrid items={original} startIndex={0} />
      </section>

      {/* 转载 */}
      <section className="pt-14">
        <SectionHead
          title="资料库"
          note={`${republished.reduce((n, c) => n + c.docs.length, 0)} 篇 · ${republished.length} 组`}
          count="REPUBLISHED"
        />
        <p className="mt-3 max-w-2xl text-[12.5px] leading-[1.85] text-[var(--ink-soft)]">
          这一栏是从
          <a
            href="https://github.com/liyupi/ai-guide"
            target="_blank"
            rel="noreferrer"
            className="link-accent"
          >
            程序员鱼皮的 AI 指南
          </a>
          按 CC BY-NC-SA 4.0 许可转载整理的。原文有近百万字，这里做了排版适配、去掉了分享按钮与失效跳转，
          每篇开头保留原始出处与许可声明。著作权归原作者所有，本站不作商业使用。
        </p>
        <CategoryGrid items={republished} startIndex={original.length} />
      </section>

      {/* 最近更新 + 标签 */}
      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_260px]">
        <section>
          <SectionHead title="最近更新" note="" count="RECENT" />

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
              想建立体系，按「模型基础 → 提示词工程 → 检索与知识库 → Agent 与工具」的顺序走一遍。
              想立刻用起来，去「工具实战手册」挑一个你正在用的工具。
              在做产品，直接看「工程化」和「变现与运营」。
            </p>
          </div>

          <div className="border border-[var(--line)] p-4">
            <p className="eyebrow">站内问答</p>
            <p className="mt-2.5 text-[12.5px] leading-[1.85] text-[var(--ink-soft)]">
              不想一页页翻？直接问。
            </p>
            <Link
              href="/ai/ask"
              className="mt-3 inline-block font-mono text-[10px] tracking-[0.16em] text-[var(--accent)] hover:underline"
            >
              提问 →
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}

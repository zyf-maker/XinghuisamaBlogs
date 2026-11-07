import type { Metadata } from "next";
import Link from "next/link";

import PageHeader from "../../components/PageHeader";
import ModuleShell from "../../components/ModuleShell";
import SideNav from "../../components/SideNav";
import { getAllCategories, getRecentDocs, getStats, getAllTags } from "../../lib/aiDocs";
import { moduleLinks } from "../../lib/moduleNav";

export const metadata: Metadata = {
  title: "AI 知识库",
  description: "从模型基础到产品变现，19 组笔记与手册。",
};

function shortDate(v: string) {
  if (!v) return "";
  return v.slice(0, 7).replace("-", ".");
}

type Cat = ReturnType<typeof getAllCategories>[number];

function CategoryRow({ cat, index }: { cat: Cat; index: number }) {
  return (
    <Link
      href={`/ai/${cat.slug}`}
      className="group grid gap-2 border-b border-[var(--line)] py-6 transition-colors last:border-b-0 sm:grid-cols-[42px_minmax(0,1fr)_auto] sm:items-baseline sm:gap-5"
    >
      <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--muted)]">
        {String(index).padStart(2, "0")}
      </span>

      <div className="min-w-0">
        <h3 className="font-serif text-[1.15rem] font-bold leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
          {cat.name}
          <span className="ml-3 font-mono text-[10px] font-normal tracking-[0.12em] text-[var(--muted)]">
            {cat.en.toUpperCase()}
          </span>
        </h3>
        <p className="mt-1.5 text-[12.5px] leading-[1.8] text-[var(--ink-soft)]">{cat.description}</p>
        <p className="mt-2 truncate font-mono text-[10.5px] text-[var(--muted)]">
          {cat.docs.slice(0, 3).map((d) => d.title).join(" · ")}
        </p>
      </div>

      <span className="font-mono text-[10px] tracking-[0.12em] text-[var(--muted)] sm:text-right">
        {cat.docs.length} 篇
      </span>
    </Link>
  );
}

export default function AiIndexPage() {
  const all = getAllCategories().filter((c) => c.docs.length > 0);
  const stats = getStats();
  const recent = getRecentDocs(6);
  const tags = getAllTags().slice(0, 14);

  const sections = [
    {
      title: "分组",
      items: all.map((c) => ({ label: c.name, href: `/ai/${c.slug}`, meta: String(c.docs.length) })),
    },
    { title: "全部篇目", items: [{ label: "按分类与等级浏览", href: "/ai/all" }] },
    {
      title: "其他模块",
      items: moduleLinks
        .filter((m) => m.href !== "/ai")
        .map((m) => ({ label: m.label, href: m.href })),
    },
  ];

  return (
    <>
      <div className="mx-auto w-[92%] max-w-6xl">
        <div className="pt-14">
          <PageHeader
            eyebrow={`Knowledge · ${stats.docs} 篇 · ${stats.categories} 组`}
            title="AI 知识库"
            description="从模型基础到产品变现，按组编排。多数篇目能直接落到一个具体动作上，不是概念罗列。"
            actions={
              <Link
                href="/ai/ask"
                className="rounded-md border border-[var(--line-strong)] px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                直接提问 →
              </Link>
            }
          />
        </div>
      </div>

      <ModuleShell wide sidebar={<SideNav sections={sections} footer={{ label: "全部篇目 →", href: "/ai/all" }} />}>
        {/* 统计条 */}
        <div className="grid grid-cols-2 divide-x divide-[var(--line)] border-y border-[var(--line)] sm:grid-cols-4">
          {[
            { label: "篇目", value: String(stats.docs), unit: "docs" },
            { label: "分组", value: String(stats.categories), unit: "组" },
            { label: "标签", value: String(stats.tags), unit: "tags" },
            { label: "总阅读", value: String(stats.minutes), unit: "min" },
          ].map((item) => (
            <div key={item.label} className="px-4 py-4 first:pl-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                {item.label}
              </p>
              <p className="mt-1 font-serif text-[1.4rem] font-bold leading-none text-[var(--ink)]">
                {item.value}
                <span className="ml-1 font-mono text-[10px] font-normal tracking-[0.1em] text-[var(--muted)]">
                  {item.unit}
                </span>
              </p>
            </div>
          ))}
        </div>

        {/* 模块入口：工具、提示词、MCP、路线、动态 */}
        <div className="mt-8 flex flex-wrap gap-2">
          {moduleLinks
            .filter((m) => m.href !== "/ai")
            .map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="group inline-flex items-baseline gap-2 rounded-md border border-[var(--line)] px-3 py-1.5 transition-colors hover:border-[var(--accent)]"
              >
                <span className="text-[12.5px] text-[var(--ink-soft)] transition-colors group-hover:text-[var(--accent)]">
                  {m.label}
                </span>
                <span className="font-mono text-[9.5px] tracking-[0.12em] text-[var(--muted)]">
                  {m.en.toUpperCase()}
                </span>
              </Link>
            ))}
        </div>

        {/* 分组列表 */}
        <section className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-3">
            <h2 className="font-serif text-lg font-bold text-[var(--ink)]">全部分组</h2>
            <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--muted)]">
              {stats.categories} 组 · {stats.docs} 篇
            </span>
          </div>
          <div className="mt-1">
            {all.map((cat, i) => (
              <CategoryRow key={cat.slug} cat={cat} index={i + 1} />
            ))}
          </div>
        </section>

        {/* 最近更新 + 标签 */}
        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_240px]">
          <section>
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-3">
              <h2 className="font-serif text-lg font-bold text-[var(--ink)]">最近更新</h2>
              <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--muted)]">RECENT</span>
            </div>

            {recent.length === 0 ? (
              <p className="py-10 text-[13px] text-[var(--muted)]">还没有篇目。</p>
            ) : (
              <ol className="divide-y divide-[var(--line)]">
                {recent.map((doc, i) => (
                  <li key={doc.key}>
                    <Link href={`/ai/${doc.category}/${doc.slug}`} className="group flex gap-4 py-5">
                      <span className="w-6 shrink-0 pt-0.5 font-mono text-[11px] text-[var(--muted)]">
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
                    className="rounded-sm border border-[var(--line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {t.tag}
                    <span className="ml-1 opacity-60">{t.count}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="border-b border-[var(--line)] pb-3">
                <p className="eyebrow">怎么读</p>
              </div>
              <p className="mt-3 text-[12.5px] leading-[1.85] text-[var(--ink-soft)]">
                想建体系，照「模型基础 → 提示词 → 检索 → Agent」走一遍；想马上用起来，去工具库挑一个正在用的；在做产品，直接看工程化与变现两组。
              </p>
            </div>
          </aside>
        </div>
      </ModuleShell>
    </>
  );
}

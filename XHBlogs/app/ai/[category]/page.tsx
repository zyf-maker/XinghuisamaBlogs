import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import PageHeader from "../../../components/PageHeader";
import SidebarNav from "../../../components/ai/SidebarNav";
import { getAllCategories, getCategoryWithDocs } from "../../../lib/aiDocs";

export function generateStaticParams() {
  return getAllCategories().map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategoryWithDocs(category);
  if (!cat) return { title: "分类不存在" };

  return {
    title: `${cat.name} · AI 知识库`,
    description: cat.description,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = getCategoryWithDocs(category);
  if (!cat) notFound();

  const categories = getAllCategories();
  const totalMinutes = cat.docs.reduce((n, d) => n + d.readingTime, 0);

  return (
    <main className="mx-auto w-[92%] max-w-6xl pb-24 pt-14">
      <PageHeader
        eyebrow={`Knowledge / ${cat.en} · ${cat.docs.length} 篇 · ${totalMinutes} 分钟`}
        title={cat.name}
        description={cat.intro}
        actions={
          <Link
            href="/ai"
            className="font-mono text-[10px] tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
          >
            ← KNOWLEDGE
          </Link>
        }
      />

      <div className="grid gap-12 pt-10 lg:grid-cols-[220px_1fr] lg:gap-14">
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <SidebarNav categories={categories} activeCategory={cat.slug} />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-3">
            <h2 className="font-serif text-lg font-bold text-[var(--ink)]">篇目</h2>
            <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--muted)]">
              {String(cat.docs.length).padStart(2, "0")} ARTICLES
            </span>
          </div>

          {cat.docs.length === 0 ? (
            <p className="py-16 text-[13px] text-[var(--muted)]">这一组还在写，暂时是空的。</p>
          ) : (
            <ol className="divide-y divide-[var(--line)]">
              {cat.docs.map((doc, i) => (
                <li key={doc.key}>
                  <Link href={`/ai/${cat.slug}/${doc.slug}`} className="group grid gap-3 py-7 sm:grid-cols-[40px_1fr]">
                    <span className="pt-1 font-mono text-[11px] text-[var(--muted)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="font-serif text-[1.15rem] font-bold leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                          {doc.title}
                        </h3>
                        <span className="tag">{doc.level}</span>
                      </div>

                      <p className="mt-2 text-[13px] leading-[1.85] text-[var(--ink-soft)]">{doc.summary}</p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] tracking-[0.1em] text-[var(--muted)]">
                        <span>{doc.updated}</span>
                        <span aria-hidden="true">·</span>
                        <span>{doc.readingTime} 分钟</span>
                        {doc.tags.length > 0 ? (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">{doc.tags.join(" / ")}</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </main>
  );
}

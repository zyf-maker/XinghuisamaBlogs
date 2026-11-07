import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import PageHeader from "../../../components/PageHeader";
import ModuleShell from "../../../components/ModuleShell";
import SideNav from "../../../components/SideNav";
import { getAllCategoryBriefs, getCategoryWithDocs, getStats } from "../../../lib/aiDocs";
import { moduleLinks } from "../../../lib/moduleNav";

export function generateStaticParams() {
  return getAllCategoryBriefs().map((c) => ({ category: c.slug }));
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

  const categories = getAllCategoryBriefs();
  const stats = getStats();
  const totalMinutes = cat.docs.reduce((n, d) => n + d.readingTime, 0);

  const sections = [
    {
      title: "分组",
      items: categories.map((c) => ({
        label: c.name,
        href: `/ai/${c.slug}`,
        meta: String(c.docs.length),
      })),
    },
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
            eyebrow={`Knowledge / ${cat.en} · ${cat.docs.length} 篇 · ${totalMinutes} 分钟`}
            title={cat.name}
            description={cat.intro}
            actions={
              <Link
                href="/ai"
                className="font-mono text-[10px] tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
              >
                ← 知识库
              </Link>
            }
          />
        </div>
      </div>

      <ModuleShell wide sidebar={<SideNav sections={sections} footer={{ label: "全部篇目 →", href: "/ai/all" }} />}>
        <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-3">
          <h2 className="font-serif text-lg font-bold text-[var(--ink)]">篇目</h2>
          <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--muted)]">
            {String(cat.docs.length).padStart(2, "0")} / {stats.docs}
          </span>
        </div>

        {cat.docs.length === 0 ? (
          <p className="py-16 text-[13px] text-[var(--muted)]">这一组还在写，暂时是空的。</p>
        ) : (
          <ol className="divide-y divide-[var(--line)]">
            {cat.docs.map((doc, i) => (
              <li key={doc.key}>
                <Link
                  href={`/ai/${cat.slug}/${doc.slug}`}
                  className="group grid gap-3 py-7 sm:grid-cols-[40px_1fr]"
                >
                  <span className="pt-1 font-mono text-[11px] text-[var(--muted)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="font-serif text-[1.15rem] font-bold leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                        {doc.title}
                      </h3>
                      <span className="font-mono text-[10px] tracking-[0.1em] text-[var(--muted)]">
                        {doc.level}
                      </span>
                    </div>

                    <p className="mt-2 text-[13px] leading-[1.85] text-[var(--ink-soft)]">{doc.summary}</p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] tracking-[0.1em] text-[var(--muted)]">
                      <span>{doc.updated}</span>
                      <span aria-hidden="true">·</span>
                      <span>{doc.readingTime} 分钟</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </ModuleShell>
    </>
  );
}

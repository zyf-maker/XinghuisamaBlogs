import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ModuleShell from "../../../../components/ModuleShell";
import SideNav from "../../../../components/SideNav";
import AiToc from "../../../../components/ai/AiToc";
import { getAllCategoryBriefs, getCategoryWithDocs, getDoc, getNeighbours } from "../../../../lib/aiDocs";
import { asset } from "../../../../lib/base";
import { moduleLinks } from "../../../../lib/moduleNav";
import { extractToc, renderMarkdown } from "../../../../lib/markdown";

export function generateStaticParams() {
  return getAllCategoryBriefs().flatMap((c) => c.docs.map((d) => ({ category: c.slug, slug: d.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const doc = getDoc(category, slug);
  if (!doc) return { title: "篇目不存在" };

  return {
    title: doc.title,
    description: doc.summary,
    openGraph: { title: doc.title, description: doc.summary, type: "article" },
  };
}

export default async function AiDocPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const doc = getDoc(category, slug);
  const cat = getCategoryWithDocs(category);
  if (!doc || !cat) notFound();

  const categories = getAllCategoryBriefs();
  const { prev, next } = getNeighbours(category, slug);
  const html = await renderMarkdown(doc.body);
  const toc = extractToc(doc.body);

  const sections = [
    {
      title: cat.name,
      items: cat.docs.map((d) => ({
        label: d.title,
        href: `/ai/${cat.slug}/${d.slug}`,
      })),
    },
    {
      title: "其他主题",
      items: categories
        .filter((c) => c.group !== cat.group)
        .map((c) => ({ label: c.name, href: `/ai/${c.slug}` })),
    },
    {
      title: "其他模块",
      items: moduleLinks.filter((m) => m.href !== "/ai").map((m) => ({ label: m.label, href: m.href })),
    },
  ];

  return (
    <ModuleShell
      wide
      sidebar={<SideNav sections={sections} footer={{ label: "全部篇目 →", href: "/ai/all" }} />}
      aside={toc.length > 0 ? <AiToc toc={toc} /> : undefined}
    >
      <article className="min-w-0">
        {/* 页首只留标题与摘要，不摆分类 / 等级 / 时长 / 日期那一排小字 */}
        <header className="pb-8 pt-10">
          <Link
            href={`/ai/${cat.slug}`}
            className="text-[11.5px] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
          >
            ← {cat.name}
          </Link>

          <h1 className="mt-3 font-serif text-[1.9rem] font-black leading-[1.2] tracking-tight text-[var(--ink)] sm:text-[2.35rem]">
            {doc.title}
          </h1>

          {doc.summary ? (
            <p className="mt-3.5 max-w-2xl text-[13.5px] leading-[1.9] text-[var(--ink-soft)]">{doc.summary}</p>
          ) : null}

          <div className="mt-6 overflow-hidden rounded-[var(--r-lg)] border border-[var(--glass-line)]">
            <img src={asset(`/covers/${cat.slug}.svg`)} alt="" className="h-32 w-full object-cover sm:h-40" />
          </div>
        </header>

        <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: html }} />

        <nav className="mt-16 grid gap-px border-y border-[var(--line)] bg-[var(--line)] sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/ai/${prev.category}/${prev.slug}`}
              className="group bg-[var(--paper)] p-5 transition-colors hover:bg-[var(--surface)]"
            >
              <span className="text-[10.5px] text-[var(--muted)]">← 上一篇</span>
              <p className="mt-1.5 line-clamp-2 text-[13.5px] font-semibold leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                {prev.title}
              </p>
            </Link>
          ) : (
            <div className="bg-[var(--paper)] p-5">
              <span className="text-[10.5px] text-[var(--muted)]">已是第一篇</span>
            </div>
          )}

          {next ? (
            <Link
              href={`/ai/${next.category}/${next.slug}`}
              className="group bg-[var(--paper)] p-5 text-right transition-colors hover:bg-[var(--surface)]"
            >
              <span className="text-[10.5px] text-[var(--muted)]">下一篇 →</span>
              <p className="mt-1.5 line-clamp-2 text-[13.5px] font-semibold leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                {next.title}
              </p>
            </Link>
          ) : (
            <div className="bg-[var(--paper)] p-5 text-right">
              <span className="text-[10.5px] text-[var(--muted)]">已是最后一篇</span>
            </div>
          )}
        </nav>
      </article>
    </ModuleShell>
  );
}

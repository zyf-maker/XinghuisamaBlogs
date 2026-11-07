import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ModuleShell from "../../../../components/ModuleShell";
import SideNav from "../../../../components/SideNav";
import AiToc from "../../../../components/ai/AiToc";
import { getAllCategoryBriefs, getCategoryWithDocs, getDoc, getNeighbours } from "../../../../lib/aiDocs";
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
    title: `${doc.title} · AI 知识库`,
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
      title: "全部分组",
      items: categories.map((c) => ({ label: c.name, href: `/ai/${c.slug}`, meta: String(c.docs.length) })),
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
      <nav
        aria-label="面包屑"
        className="mx-auto mt-8 flex w-[92%] max-w-6xl flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] tracking-[0.14em] text-[var(--muted)]"
      >
        <Link href="/ai" className="transition-colors hover:text-[var(--accent)]">
          知识库
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`/ai/${cat.slug}`} className="transition-colors hover:text-[var(--accent)]">
          {cat.name}
        </Link>
      </nav>

      <ModuleShell
        wide
        sidebar={<SideNav sections={sections} footer={{ label: "全部篇目 →", href: "/ai/all" }} />}
        aside={toc.length > 0 ? <AiToc toc={toc} /> : undefined}
      >
        <article className="min-w-0">
          <header className="border-b border-[var(--line)] pb-7">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] tracking-[0.14em] text-[var(--muted)]">
              <span>{cat.name}</span>
              <span aria-hidden="true">·</span>
              <span>{doc.level}</span>
              <span aria-hidden="true">·</span>
              <span>{doc.readingTime} 分钟</span>
              <span aria-hidden="true">·</span>
              <span>{doc.updated}</span>
            </div>

            <h1 className="mt-4 font-serif text-[1.85rem] font-black leading-[1.22] tracking-tight text-[var(--ink)] sm:text-[2.3rem]">
              {doc.title}
            </h1>

            {doc.summary ? (
              <p className="mt-4 max-w-2xl text-[13.5px] leading-[1.9] text-[var(--ink-soft)]">
                {doc.summary}
              </p>
            ) : null}

            {doc.tags.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {doc.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/ai/all?tag=${encodeURIComponent(tag)}`}
                    className="rounded-sm border border-[var(--line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            ) : null}
          </header>

          <div className="prose prose-slate max-w-none pt-9" dangerouslySetInnerHTML={{ __html: html }} />

          <nav className="mt-16 grid gap-px border-y border-[var(--line)] bg-[var(--line)] sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/ai/${prev.category}/${prev.slug}`}
                className="group bg-[var(--paper)] p-5 transition-colors hover:bg-[var(--surface)]"
              >
                <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--muted)]">← 上一篇</span>
                <p className="mt-1.5 line-clamp-2 text-[13.5px] font-semibold leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                  {prev.title}
                </p>
              </Link>
            ) : (
              <div className="bg-[var(--paper)] p-5">
                <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--muted)]">
                  已是第一篇
                </span>
              </div>
            )}

            {next ? (
              <Link
                href={`/ai/${next.category}/${next.slug}`}
                className="group bg-[var(--paper)] p-5 text-right transition-colors hover:bg-[var(--surface)]"
              >
                <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--muted)]">下一篇 →</span>
                <p className="mt-1.5 line-clamp-2 text-[13.5px] font-semibold leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                  {next.title}
                </p>
              </Link>
            ) : (
              <div className="bg-[var(--paper)] p-5 text-right">
                <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--muted)]">
                  已是最后一篇
                </span>
              </div>
            )}
          </nav>

          <p className="mt-6 font-mono text-[10.5px] leading-[1.9] text-[var(--muted)]">
            {doc.author ? <>作者 {doc.author} · </>
              : null}
            这一组共 {cat.docs.length} 篇 ·
            <Link
              href={`/ai/${cat.slug}`}
              className="ml-1 text-[var(--accent)] underline decoration-[var(--accent-soft)] underline-offset-4"
            >
              返回「{cat.name}」
            </Link>
          </p>
        </article>
      </ModuleShell>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "../../../../components/Navbar";
import PageTransition from "../../../../components/PageTransition";
import AiToc from "../../../../components/ai/AiToc";
import { RailCard, NumList } from "../../../../components/tpl/Template";
import { aiGroups } from "../../../../data/aiCategories";
import { getAllCategoryBriefs, getCategoryWithDocs, getDoc, getNeighbours, getRecentDocs } from "../../../../lib/aiDocs";
import { extractToc, renderMarkdown } from "../../../../lib/markdown";
import { toolsData } from "../../../../data/tools";

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

/**
 * 篇目页模板（照参考站的资讯详情页）：
 * 面包屑 → 大标题 1.7-2.1rem → 一行元信息（分组 / 等级 / 时长 / 更新）
 * → 正文（约 720px 行宽）→ 上下篇；右栏是「本组目录 + 同主题 + 最近更新」。
 */
export default async function AiDocPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const doc = getDoc(category, slug);
  const cat = getCategoryWithDocs(category);
  if (!doc || !cat) notFound();

  const { prev, next } = getNeighbours(category, slug);
  const html = await renderMarkdown(doc.body);
  const toc = extractToc(doc.body);
  const recent = getRecentDocs(10);
  const groupName = aiGroups.find((g) => g.slug === cat.group)?.name ?? "";

  return (
    <div className="min-h-screen">
      <Navbar />
      <PageTransition>
        <main className="wrap pb-20">
          <div className="split">
            <article className="min-w-0">
              <nav className="flex flex-wrap items-center gap-2 pt-9 text-[12px] text-[var(--muted)]">
                <Link href="/ai" className="hover:text-[var(--accent)]">知识库</Link>
                <span>/</span>
                <span>{groupName}</span>
                <span>/</span>
                <Link href={`/ai/${cat.slug}`} className="hover:text-[var(--accent)]">{cat.name}</Link>
              </nav>

              <h1 className="mt-3 text-[1.7rem] font-extrabold leading-[1.25] tracking-[-0.02em] text-[var(--ink)] sm:text-[2.1rem]">
                {doc.title}
              </h1>

              <p className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[var(--muted)]">
                <span>{cat.name}</span>
                <span className="opacity-40">·</span>
                <span>{doc.level}</span>
                <span className="opacity-40">·</span>
                <span>{doc.readingTime} 分钟</span>
                {doc.updated && (
                  <>
                    <span className="opacity-40">·</span>
                    <span>{doc.updated}</span>
                  </>
                )}
              </p>

              {doc.summary && (
                <p className="mt-4 border-l-2 border-[var(--accent)] bg-[var(--accent-soft)] px-3.5 py-2.5 text-[13px] leading-[1.8] text-[var(--ink-soft)]">
                  {doc.summary}
                </p>
              )}

              <div className="prose prose-slate mt-7 max-w-none" dangerouslySetInnerHTML={{ __html: html }} />

              <nav className="mt-14 grid gap-3 sm:grid-cols-2">
                {prev ? (
                  <Link href={`/ai/${prev.category}/${prev.slug}`} className="pcard group p-4">
                    <span className="text-[11px] text-[var(--muted)]">← 上一篇</span>
                    <p className="mt-1.5 line-clamp-2 text-[13px] font-semibold leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                      {prev.title}
                    </p>
                  </Link>
                ) : (
                  <div className="pcard p-4 opacity-60">
                    <span className="text-[11px] text-[var(--muted)]">已是第一篇</span>
                  </div>
                )}
                {next ? (
                  <Link href={`/ai/${next.category}/${next.slug}`} className="pcard group p-4 sm:text-right">
                    <span className="text-[11px] text-[var(--muted)]">下一篇 →</span>
                    <p className="mt-1.5 line-clamp-2 text-[13px] font-semibold leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                      {next.title}
                    </p>
                  </Link>
                ) : (
                  <div className="pcard p-4 opacity-60 sm:text-right">
                    <span className="text-[11px] text-[var(--muted)]">已是最后一篇</span>
                  </div>
                )}
              </nav>
            </article>

            <aside className="space-y-3">
              {toc.length > 0 && (
                <RailCard title="本页目录">
                  <div className="max-h-[52vh] overflow-y-auto scroll-quiet">
                    <AiToc toc={toc} />
                  </div>
                </RailCard>
              )}

              <RailCard title={cat.name} href={`/ai/${cat.slug}`} more="组内">
                <NumList
                  items={cat.docs.slice(0, 8).map((d) => ({
                    title: d.title,
                    href: `/ai/${cat.slug}/${d.slug}`,
                  }))}
                />
              </RailCard>

              <RailCard title="最近更新" href="/ai/all" more="更多">
                <NumList
                  items={recent.slice(0, 6).map((d) => ({
                    title: d.title,
                    href: `/ai/${d.category}/${d.slug}`,
                  }))}
                />
              </RailCard>

              <RailCard title="热门工具" href="/tools" more="更多">
                <div className="grid grid-cols-2 gap-1.5">
                  {toolsData.slice(0, 6).map((t) => (
                    <a
                      key={t.id}
                      href={t.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-[12px] text-[var(--ink-soft)] transition-colors hover:bg-[var(--surface-alt)] hover:text-[var(--ink)]"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[var(--surface-alt)] text-[10px] font-semibold uppercase text-[var(--muted)]">
                        {t.name.slice(0, 1)}
                      </span>
                      <span className="min-w-0 truncate">{t.name}</span>
                    </a>
                  ))}
                </div>
              </RailCard>
            </aside>
          </div>
        </main>
      </PageTransition>
    </div>
  );
}

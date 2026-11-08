import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "../../../components/Navbar";
import PageTransition from "../../../components/PageTransition";
import { RailCard, NumList, SectionHead, ListCard } from "../../../components/tpl/Template";
import { aiGroups, getCategory } from "../../../data/aiCategories";
import { getAllCategoryBriefs, getCategoryWithDocs, getRecentDocs } from "../../../lib/aiDocs";
import { asset } from "../../../lib/base";

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
  if (!cat) return { title: "分组不存在" };
  return { title: `${cat.name} · 知识库`, description: cat.description };
}

/**
 * 分类页模板：页首「面包屑 + 大标题 + 一句话说明 + 同类筛选胶囊」，
 * 正文用列表卡（左缩略图 + 右标题摘要），右栏是同类分组榜与最近更新。
 */
export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = getCategoryWithDocs(category);
  if (!cat) notFound();

  const meta = getCategory(category);
  const groupName = aiGroups.find((g) => g.slug === meta?.group)?.name ?? "";
  const categories = getAllCategoryBriefs();
  const siblings = categories.filter((c) => c.group === meta?.group);
  const recent = getRecentDocs(10);

  return (
    <div className="min-h-screen">
      <Navbar />
      <PageTransition>
        <main className="wrap pb-20">
          <div className="pt-10 pb-6">
            <nav className="flex items-center gap-2 text-[12px] text-[var(--muted)]">
              <Link href="/ai" className="hover:text-[var(--accent)]">知识库</Link>
              <span>/</span>
              <span>{groupName}</span>
            </nav>
            <h1 className="mt-3 text-[1.75rem] font-extrabold leading-[1.22] tracking-[-0.02em] text-[var(--ink)] sm:text-[2.2rem]">
              {cat.name}
            </h1>
            <p className="mt-2.5 max-w-[680px] text-[13px] leading-[1.8] text-[var(--muted)]">{cat.intro}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {siblings.map((c) => (
                <Link
                  key={c.slug}
                  href={`/ai/${c.slug}`}
                  className={`chip ${c.slug === cat.slug ? "chip-on" : ""}`}
                >
                  {c.name}
                  <span className={c.slug === cat.slug ? "" : "text-[var(--muted)]"}>{c.docs.length}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="split">
            <div className="min-w-0">
              <SectionHead
                title={`共 ${cat.docs.length} 篇`}
                more="全部篇目"
                href="/ai/all"
              />
              {cat.docs.length === 0 ? (
                <p className="py-16 text-[13px] text-[var(--muted)]">这一组还在整理。</p>
              ) : (
                <div className="space-y-3">
                  {cat.docs.map((doc) => (
                    <ListCard
                      key={doc.key}
                      href={`/ai/${cat.slug}/${doc.slug}`}
                      title={doc.title}
                      desc={doc.summary}
                      thumb={asset(`/covers/${cat.slug}.svg`)}
                      meta={`${doc.level} · ${doc.readingTime} 分钟${doc.updated ? ` · ${doc.updated}` : ""}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <aside className="space-y-3">
              <RailCard title={groupName || "同组"} href="/ai" more="知识库">
                <NumList
                  items={siblings.map((c) => ({
                    title: c.name,
                    href: `/ai/${c.slug}`,
                    meta: `${c.docs.length}`,
                  }))}
                />
              </RailCard>

              <RailCard title="主题">
                <ul className="space-y-2">
                  {aiGroups.map((g) => (
                    <li key={g.slug}>
                      <Link
                        href={`/ai#${g.slug}`}
                        className={`flex items-center justify-between text-[12.5px] hover:text-[var(--accent)] ${
                          g.slug === meta?.group ? "font-medium text-[var(--accent)]" : "text-[var(--ink-soft)]"
                        }`}
                      >
                        <span>{g.name}</span>
                        <span className="text-[11px] text-[var(--muted)]">
                          {categories.filter((c) => c.group === g.slug).reduce((n, c) => n + c.docs.length, 0)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </RailCard>

              <RailCard title="最近更新" href="/ai/all" more="更多">
                <NumList
                  items={recent.slice(0, 6).map((d) => ({
                    title: d.title,
                    href: `/ai/${d.category}/${d.slug}`,
                  }))}
                />
              </RailCard>
            </aside>
          </div>
        </main>
      </PageTransition>
    </div>
  );
}

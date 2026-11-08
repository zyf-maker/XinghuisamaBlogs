import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "../../../components/Navbar";
import PageTransition from "../../../components/PageTransition";
import { RailCard, NumList, SectionHead } from "../../../components/tpl/Template";
import { toolCategories, getToolsByCategory } from "../../../data/tools";
import { getRecentDocs } from "../../../lib/aiDocs";

export function generateStaticParams() {
  return toolCategories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = toolCategories.find((c) => c.slug === category);
  if (!cat) return { title: "工具库" };
  return { title: `${cat.name} · 工具库`, description: cat.description };
}

/**
 * 工具分类页：面包屑 + 标题 + 同类胶囊 + 卡片网格（4 列），右栏是分类榜。
 * 卡片结构与首页一致，只是这里给足 detail 的两行。
 */
export default async function ToolCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = toolCategories.find((c) => c.slug === category);
  if (!cat) notFound();

  const items = getToolsByCategory(cat.slug);
  const recent = getRecentDocs(8);

  return (
    <div className="min-h-screen">
      <Navbar />
      <PageTransition>
        <main className="wrap pb-20">
          <div className="pt-10 pb-6">
            <nav className="flex items-center gap-2 text-[12px] text-[var(--muted)]">
              <Link href="/tools" className="hover:text-[var(--accent)]">工具库</Link>
              <span>/</span>
              <span>{cat.name}</span>
            </nav>
            <h1 className="mt-3 text-[1.75rem] font-extrabold leading-[1.22] tracking-[-0.02em] text-[var(--ink)] sm:text-[2.2rem]">
              {cat.name}
            </h1>
            <p className="mt-2.5 max-w-[680px] text-[13px] leading-[1.8] text-[var(--muted)]">{cat.description}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {toolCategories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/tools/${c.slug}`}
                  className={`chip ${c.slug === cat.slug ? "chip-on" : ""}`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="split">
            <div className="min-w-0">
              <SectionHead title={`共 ${items.length} 个`} more="全部工具" href="/tools" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((tool) => (
                  <a
                    key={tool.id}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pcard flex flex-col p-4"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="line-clamp-1 text-[14px] font-semibold text-[var(--ink)]">{tool.name}</h3>
                      <span className="shrink-0 text-[11px] text-[var(--muted)]">{tool.pricing}</span>
                    </div>
                    <p className="mt-1.5 text-[12.5px] leading-[1.7] text-[var(--ink-soft)]">{tool.tagline}</p>
                    <p className="mt-1.5 line-clamp-3 text-[12px] leading-[1.7] text-[var(--muted)]">{tool.detail}</p>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-3 text-[11px] text-[var(--muted)]">
                      <span className="truncate">{tool.platform.join(" · ")}</span>
                      <span className="shrink-0">打开 ↗</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <aside className="space-y-3">
              <RailCard title="分类">
                <NumList
                  items={toolCategories.map((c) => ({
                    title: c.name,
                    href: `/tools/${c.slug}`,
                    meta: `${getToolsByCategory(c.slug).length}`,
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
            </aside>
          </div>
        </main>
      </PageTransition>
    </div>
  );
}

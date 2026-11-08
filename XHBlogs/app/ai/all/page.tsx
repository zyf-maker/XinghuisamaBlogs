import type { Metadata } from "next";

import Navbar from "../../../components/Navbar";
import PageTransition from "../../../components/PageTransition";
import AllIndex from "../../../components/ai/AllIndex";
import { RailCard, NumList, SectionHead } from "../../../components/tpl/Template";
import { aiGroups } from "../../../data/aiCategories";
import { getAllCategories, getSearchIndex } from "../../../lib/aiDocs";

export const metadata: Metadata = {
  title: "全部篇目 · AI 知识库",
  description: "AI 知识库的完整索引，可按分类筛选或直接搜索标题、摘要与标签。",
};

/**
 * 全部篇目：页首极简（标题 + 一句说明），正文交给客户端 AllIndex（搜索 + 筛选），
 * 右栏是主题与分组榜。搜索词从 `?q=` 或旧的 `?tag=` 都认。
 */
export default async function AiAllPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const initial = sp.q ?? sp.tag ?? "";
  const entries = getSearchIndex();
  const cats = getAllCategories().filter((c) => c.docs.length > 0);

  return (
    <div className="min-h-screen">
      <Navbar />
      <PageTransition>
        <main className="wrap pb-20">
          <div className="pt-10 pb-6">
            <h1 className="text-[1.7rem] font-extrabold leading-[1.22] tracking-[-0.02em] text-[var(--ink)] sm:text-[2.1rem]">
              全部篇目
            </h1>
            <p className="mt-2.5 max-w-[680px] text-[13px] leading-[1.8] text-[var(--muted)]">
              共 {entries.length} 篇。搜索只在这份索引里做，不发请求，敲字即出结果。
            </p>
          </div>

          <div className="split">
            <div className="min-w-0">
              <AllIndex
                entries={entries}
                categories={cats.map((c) => ({ slug: c.slug, name: c.name }))}
                initialQuery={initial}
              />
            </div>

            <aside className="space-y-3">
              <RailCard title="主题">
                <NumList
                  items={aiGroups.map((g) => ({
                    title: g.name,
                    href: `/ai#${g.slug}`,
                    meta: String(
                      cats.filter((c) => c.group === g.slug).reduce((n, c) => n + c.docs.length, 0)
                    ),
                  }))}
                />
              </RailCard>

              <RailCard title="分组" href="/ai" more="知识库">
                <NumList
                  items={cats.map((c) => ({ title: c.name, href: `/ai/${c.slug}`, meta: String(c.docs.length) }))}
                />
              </RailCard>
            </aside>
          </div>
        </main>
      </PageTransition>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import SearchBox from "../../components/SearchBox";
import { RailCard, NumList, SectionHead } from "../../components/tpl/Template";
import { aiGroups } from "../../data/aiCategories";
import { getAllCategories, getGroups, getRecentDocs } from "../../lib/aiDocs";
import { getSearchItems } from "../../lib/siteSearch";
import { toolsData } from "../../data/tools";
import { promptsData } from "../../data/prompts";
import { routes } from "../../data/routes";

export const metadata: Metadata = {
  title: "知识库",
  description: "按主题分组的 AI 笔记：模型基础、工具、实战、部署。",
};

/**
 * 知识库总览。
 *
 * 版式照参考站：居中标题 + 大搜索框 + 一行大类胶囊（当筛选用），
 * 下面是「左宽右窄」：左侧按六个大类分节、节内是分类卡（卡里直接列真实篇目），
 * 右侧是主题榜与资料入口。左栏不再套一层分类树。
 */
export default function AiIndexPage() {
  const groups = getGroups();
  const allCats = getAllCategories().filter((c) => c.docs.length > 0);
  const recent = getRecentDocs(8);
  const searchItems = getSearchItems();

  const totalDocs = groups.reduce((n, g) => n + g.docCount, 0);

  return (
    <div className="min-h-screen">
      <Navbar />
      <PageTransition>
        <section className="wrap pb-7 pt-10 text-center">
          <h1 className="mx-auto max-w-[760px] text-[1.8rem] font-extrabold leading-[1.18] tracking-[-0.02em] text-[var(--ink)] sm:text-[2.35rem]">
            按主题分组的 AI 笔记
          </h1>
          <p className="mx-auto mt-3.5 max-w-[640px] text-[13.5px] leading-[1.8] text-[var(--muted)]">
            动手之后写下来的：参数、命令、踩过的坑，以及哪些说法经不起复现。
          </p>
          <div className="mx-auto mt-6 w-full max-w-[672px]">
            <SearchBox items={searchItems} limit={10} placeholder="在知识库里搜一篇笔记" />
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {aiGroups.map((g) => {
              const hit = groups.find((x) => x.slug === g.slug);
              return (
                <Link key={g.slug} href={`#${g.slug}`} className="chip">
                  {g.name}
                  <span className="text-[11px] text-[var(--muted)]">{hit?.docCount ?? 0}</span>
                </Link>
              );
            })}
            <Link href="/ai/all" className="chip chip-on">
              全部篇目
            </Link>
          </div>
        </section>

        <main className="wrap pb-20">
          <div className="split">
            <div className="min-w-0 space-y-10">
              {allCats.length === 0 ? (
                <div className="pcard p-6">
                  <p className="text-[14px] font-semibold text-[var(--ink)]">这里还是空的</p>
                  <p className="mt-2 max-w-md text-[13px] leading-[1.8] text-[var(--muted)]">
                    写入
                    <code className="mx-1 rounded bg-[var(--surface-alt)] px-1 py-0.5 font-mono text-[12px] text-[var(--ink)]">
                      content/notes/&lt;分组&gt;/
                    </code>
                    的 Markdown 会在下次构建时自动出现在这里。
                  </p>
                </div>
              ) : (
                aiGroups.map((g) => {
                  const hit = groups.find((x) => x.slug === g.slug);
                  const cats = hit?.categories ?? [];
                  if (cats.length === 0) return null;

                  return (
                    <section key={g.slug} id={g.slug} className="scroll-mt-20">
                      <SectionHead title={g.name} more="全部" href="/ai/all" extra={
                        <span className="text-[11.5px] text-[var(--muted)]">{hit?.docCount ?? 0} 篇</span>
                      } />
                      <p className="-mt-1 mb-3 text-[12.5px] leading-[1.7] text-[var(--muted)]">{g.description}</p>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {cats.map((cat) => (
                          <div key={cat.slug} className="pcard p-4">
                            <div className="flex items-baseline justify-between gap-2">
                              <h3 className="text-[13.5px] font-bold text-[var(--ink)]">
                                <Link href={`/ai/${cat.slug}`} className="transition-colors hover:text-[var(--accent)]">
                                  {cat.name}
                                </Link>
                              </h3>
                              <span className="shrink-0 text-[11px] text-[var(--muted)]">{cat.docs.length} 篇</span>
                            </div>

                            <ul className="mt-2.5 space-y-1.5">
                              {cat.docs.slice(0, 4).map((doc) => (
                                <li key={doc.key}>
                                  <Link
                                    href={`/ai/${cat.slug}/${doc.slug}`}
                                    className="group flex items-baseline gap-2 text-[12.5px] leading-[1.6]"
                                  >
                                    <span className="shrink-0 font-mono text-[10px] text-[var(--muted)] opacity-70">
                                      {String(doc.order).padStart(2, "0")}
                                    </span>
                                    <span className="min-w-0 flex-1 text-[var(--ink-soft)] transition-colors group-hover:text-[var(--accent)]">
                                      {doc.title}
                                    </span>
                                  </Link>
                                </li>
                              ))}
                            </ul>

                            {cat.docs.length > 4 && (
                              <Link href={`/ai/${cat.slug}`} className="mt-2.5 inline-block text-[11.5px] text-[var(--muted)] hover:text-[var(--accent)]">
                                还有 {cat.docs.length - 4} 篇 →
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })
              )}
            </div>

            <aside className="space-y-3">
              <RailCard title="分组 · 按篇数" href="/ai/all" more="全部">
                <NumList
                  items={allCats.slice(0, 10).map((c) => ({
                    title: c.name,
                    href: `/ai/${c.slug}`,
                    meta: `${c.docs.length}`,
                  }))}
                />
              </RailCard>

              <RailCard title="最近更新" href="/ai/all" more="更多">
                <NumList
                  items={recent.slice(0, 8).map((d) => ({
                    title: d.title,
                    href: `/ai/${d.category}/${d.slug}`,
                    meta: `${d.readingTime}′`,
                  }))}
                />
              </RailCard>

              <RailCard title="直接提问" href="/ai/ask" more="去问">
                <p className="text-[12px] leading-[1.75] text-[var(--muted)]">
                  用一句话描述问题，系统先在 {totalDocs} 篇笔记里检索，再带着命中的段落回答。
                </p>
                <Link href="/ai/ask" className="chip chip-on mt-3">
                  打开问答
                </Link>
              </RailCard>

              <RailCard title="资料">
                <ul className="space-y-2">
                  {[
                    { name: "工具库", href: "/tools", meta: `${toolsData.length}` },
                    { name: "提示词", href: "/prompts", meta: `${promptsData.length}` },
                    { name: "学习路线", href: "/learn", meta: `${routes.length}` },
                    { name: "MCP 与 Skills", href: "/mcp", meta: "12/8" },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="flex items-center justify-between text-[12.5px] text-[var(--ink-soft)] hover:text-[var(--accent)]">
                        <span>{l.name}</span>
                        <span className="text-[11px] text-[var(--muted)]">{l.meta}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </RailCard>
            </aside>
          </div>
        </main>
      </PageTransition>
    </div>
  );
}

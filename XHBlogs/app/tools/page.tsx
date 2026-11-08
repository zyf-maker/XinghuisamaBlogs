import type { Metadata } from "next";
import Link from "next/link";

import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import SearchBox from "../../components/SearchBox";
import { RailCard, NumList, SectionHead } from "../../components/tpl/Template";
import { toolCategories, toolsData } from "../../data/tools";
import { getSearchItems } from "../../lib/siteSearch";
import { getRecentDocs } from "../../lib/aiDocs";

export const metadata: Metadata = {
  title: "工具库",
  description: "按用途分类的 AI 工具索引，写清楚适合谁、代价是什么。",
};

/**
 * 工具库模板（照参考站 /tool）：
 * 每个分类一个板块 —— 板块头「分类名 + 细分胶囊 + 全部 >」，下面是 5 列小卡，
 * 卡内只有「名称 / 一句定位 / 价格」，不放长文。整页不分页，垂直流到底。
 */
export default function ToolsPage() {
  const searchItems = getSearchItems();
  const recent = getRecentDocs(8);

  return (
    <div className="min-h-screen">
      <Navbar />
      <PageTransition>
        <section className="wrap pb-7 pt-10 text-center">
          <h1 className="mx-auto max-w-[760px] text-[1.8rem] font-extrabold leading-[1.18] tracking-[-0.02em] text-[var(--ink)] sm:text-[2.35rem]">
            挑工具，看代价
          </h1>
          <p className="mx-auto mt-3.5 max-w-[640px] text-[13.5px] leading-[1.8] text-[var(--muted)]">
            按用途分类，不按热度排。每条都写了适合谁、强在哪、要付什么。
          </p>
          <div className="mx-auto mt-6 w-full max-w-[672px]">
            <SearchBox items={searchItems} limit={10} placeholder="搜工具名或用途，比如「本地推理」" />
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {toolCategories.map((c) => (
              <Link key={c.slug} href={`#${c.slug}`} className="chip">
                {c.name}
              </Link>
            ))}
          </div>
        </section>

        <main className="wrap pb-20">
          <div className="split">
            <div className="min-w-0 space-y-9">
              {toolCategories.map((cat) => {
                const items = toolsData.filter((t) => t.category === cat.slug);
                if (items.length === 0) return null;

                return (
                  <section key={cat.slug} id={cat.slug} className="scroll-mt-20">
                    <SectionHead title={cat.name} more="查看全部" href={`/tools/${cat.slug}`} extra={
                      <span className="text-[11.5px] text-[var(--muted)]">{items.length} 个</span>
                    } />
                    <p className="-mt-1 mb-3 text-[12.5px] text-[var(--muted)]">{cat.description}</p>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {items.slice(0, 10).map((tool) => (
                        <a
                          key={tool.id}
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pcard flex flex-col p-3"
                        >
                          <div className="flex items-baseline justify-between gap-1.5">
                            <h3 className="line-clamp-1 text-[13px] font-semibold text-[var(--ink)]">{tool.name}</h3>
                            <span className="shrink-0 text-[10.5px] text-[var(--muted)]">{tool.pricing}</span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-[12px] leading-[1.65] text-[var(--muted)]">{tool.tagline}</p>
                        </a>
                      ))}
                    </div>

                    {items.length > 10 && (
                      <Link
                        href={`/tools/${cat.slug}`}
                        className="mt-3 inline-block text-[12px] text-[var(--muted)] hover:text-[var(--accent)]"
                      >
                        还有 {items.length - 10} 个 →
                      </Link>
                    )}
                  </section>
                );
              })}
            </div>

            <aside className="space-y-3">
              <RailCard title="按价格挑">
                <NumList
                  items={["免费额度", "开源", "按量", "订阅"].map((p) => ({
                    title: p,
                    href: "/tools",
                    meta: `${toolsData.filter((t) => t.pricing === p).length}`,
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

              <RailCard title="收录标准">
                <ul className="space-y-1.5 text-[12px] leading-[1.7] text-[var(--muted)]">
                  <li>· 能公开访问、还在维护</li>
                  <li>· 价格写官网标价，变了自己核</li>
                  <li>· 只写取舍，不写广告词</li>
                </ul>
              </RailCard>
            </aside>
          </div>
        </main>
      </PageTransition>
    </div>
  );
}

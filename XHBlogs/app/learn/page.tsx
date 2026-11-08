import type { Metadata } from "next";
import Link from "next/link";

import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import SearchBox from "../../components/SearchBox";
import { RailCard, NumList, SectionHead, ListCard } from "../../components/tpl/Template";
import { routes } from "../../data/routes";
import { getSearchItems } from "../../lib/siteSearch";
import { getRecentDocs } from "../../lib/aiDocs";
import { toolsData } from "../../data/tools";
import { asset } from "../../lib/base";

export const metadata: Metadata = {
  title: "学习路线",
  description: "按目标排的顺序清单：先读什么、再做什么，每步都有可验证的产出。",
};

/**
 * 学习路线模板（照参考站 /resource/learn）：
 * 左对齐标题 + 左对齐搜索框 → 单列「左图右文」卡 → 右栏热门工具与推荐。
 */
export default function LearnPage() {
  const searchItems = getSearchItems();
  const recent = getRecentDocs(8);

  return (
    <div className="min-h-screen">
      <Navbar />
      <PageTransition>
        <main className="wrap pb-20">
          <div className="pt-10 pb-6">
            <h1 className="text-[1.7rem] font-extrabold leading-[1.22] tracking-[-0.02em] text-[var(--ink)] sm:text-[2.1rem]">
              学习路线
            </h1>
            <p className="mt-2.5 max-w-[680px] text-[13px] leading-[1.8] text-[var(--muted)]">
              不是课程表，是按目标倒推的顺序。每一步都该有能拿给别人的产出。
            </p>
            <div className="mt-5 max-w-[560px]">
              <SearchBox items={searchItems} limit={10} placeholder="在学习路线里搜，比如「知识库」" />
            </div>
          </div>

          <div className="split">
            <div className="min-w-0">
              <SectionHead title={`共 ${routes.length} 条`} more="知识库" href="/ai" />
              <div className="space-y-3">
                {routes.map((r) => (
                  <ListCard
                    key={r.slug}
                    href={`/learn/${r.slug}`}
                    title={r.name}
                    desc={r.outcome}
                    thumb={asset(`/covers/route-${r.slug}.svg`)}
                    meta={`${r.steps.length} 步 · 面向${r.audience} · 前置：${r.prerequisite}`}
                  />
                ))}
              </div>
            </div>

            <aside className="space-y-3">
              <RailCard title="热门工具" href="/tools" more="更多">
                <div className="grid grid-cols-2 gap-1.5">
                  {toolsData.slice(0, 8).map((t) => (
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

              <RailCard title="推荐教程" href="/ai/all" more="更多">
                <NumList
                  items={recent.slice(0, 6).map((d) => ({
                    title: d.title,
                    href: `/ai/${d.category}/${d.slug}`,
                  }))}
                />
              </RailCard>

              <RailCard title="路线清单">
                <ul className="space-y-2">
                  {routes.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/learn/${r.slug}`} className="flex items-center justify-between text-[12.5px] text-[var(--ink-soft)] hover:text-[var(--accent)]">
                        <span className="min-w-0 truncate">{r.name}</span>
                        <span className="shrink-0 text-[11px] text-[var(--muted)]">{r.steps.length} 步</span>
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

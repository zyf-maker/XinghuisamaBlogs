import type { Metadata } from "next";
import Link from "next/link";

import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import SearchBox from "../../components/SearchBox";
import { RailCard, NumList, SectionHead } from "../../components/tpl/Template";
import { mcpServers, skillsData, mcpIntro, skillsIntro } from "../../data/mcp";
import { getSearchItems } from "../../lib/siteSearch";
import { getRecentDocs } from "../../lib/aiDocs";

export const metadata: Metadata = {
  title: "MCP 与 Skills",
  description: "让模型接上外部工具与能力的两套机制，以及值得先装的几个。",
};

const FAQ = [
  {
    q: "MCP 和 Skills 到底差在哪",
    a: "MCP 给模型「手脚」——能读文件、查库、开浏览器；Skills 给模型「方法」——遇到某类任务按什么步骤做。没有工具，方法落不了地；工具很多而没方法，就会乱调。",
  },
  {
    q: "先装哪个",
    a: "先装你每天都要用的那一件事。文件读写与命令执行覆盖八成场景，之后再按缺口补数据库、浏览器、抓取。",
  },
  {
    q: "权限怎么给",
    a: "只读账号、限定库名与目录、写操作必须显式确认。工具能做的事越具体，越不容易失控。",
  },
  {
    q: "为什么强调顺序",
    a: "先 MCP 后 Skills：工具确定了，方法才有落点。反过来先写一堆流程说明，接上工具后往往要重写。",
  },
];

/**
 * MCP 与 Skills 模板（照参考站 /mcp）：
 * 居中标题 + 大搜索框 + 浅灰统计条 + 两行筛选胶囊 → 4 列卡网格 → 常见问答 2 列。
 */
export default function McpPage() {
  const searchItems = getSearchItems();
  const recent = getRecentDocs(8);

  return (
    <div className="min-h-screen">
      <Navbar />
      <PageTransition>
        <section className="wrap pt-12 pb-8 text-center">
          <h1 className="mx-auto max-w-[760px] text-[1.9rem] font-extrabold leading-[1.2] tracking-[-0.02em] text-[var(--ink)] sm:text-[2.5rem]">
            让模型真正能动手
          </h1>
          <p className="mx-auto mt-3.5 max-w-[640px] text-[13.5px] leading-[1.8] text-[var(--muted)]">
            MCP 给模型手脚，Skills 给模型方法。这里只收跑得起来、值得先装的。
          </p>
          <div className="mx-auto mt-6 w-full max-w-[672px]">
            <SearchBox items={searchItems} limit={10} placeholder="搜 MCP 服务或 Skill，比如「数据库」" />
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Link href="#mcp" className="chip chip-on">
              MCP 服务
            </Link>
            <Link href="#skills" className="chip">
              Skills
            </Link>
            <Link href="#choose" className="chip">
              怎么选
            </Link>
          </div>

          <div className="mx-auto mt-6 flex max-w-[672px] flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-lg border border-[var(--card-line)] bg-[var(--card-bg)] px-4 py-2.5 text-[12px] text-[var(--muted)]">
            <span>MCP {mcpServers.length} 个</span>
            <span className="opacity-40">|</span>
            <span>Skills {skillsData.length} 个</span>
            <span className="opacity-40">|</span>
            <span>官方 / 社区 / 厂商三类来源</span>
          </div>
        </section>

        <main className="wrap pb-20">
          <div className="split">
            <div className="min-w-0 space-y-10">
              <section id="mcp" className="scroll-mt-20">
                <SectionHead title="MCP 服务" extra={
                  <span className="text-[11.5px] text-[var(--muted)]">{mcpServers.length} 个</span>
                } />
                <p className="-mt-1 mb-3 max-w-[720px] text-[12.5px] leading-[1.75] text-[var(--muted)]">{mcpIntro}</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {mcpServers.map((s) => (
                    <article key={s.id} className="pcard flex flex-col p-4">
                      <div className="flex items-baseline justify-between gap-2">
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="line-clamp-1 text-[13.5px] font-semibold text-[var(--ink)] transition-colors hover:text-[var(--accent)]"
                        >
                          {s.name}
                        </a>
                        <span className="shrink-0 text-[10.5px] text-[var(--muted)]">{s.origin}</span>
                      </div>

                      <p className="mt-1.5 line-clamp-2 text-[12px] leading-[1.7] text-[var(--ink-soft)]">{s.capability}</p>
                      <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-[1.7] text-[var(--muted)]">{s.whenToUse}</p>

                      <pre className="mt-2.5 overflow-x-auto rounded-md border border-[var(--card-line)] bg-[var(--surface-alt)] px-2.5 py-1.5 font-mono text-[11px] leading-[1.7] text-[var(--ink-soft)]">
                        <code>{s.install}</code>
                      </pre>
                    </article>
                  ))}
                </div>
              </section>

              <section id="skills" className="scroll-mt-20">
                <SectionHead title="Skills" extra={
                  <span className="text-[11.5px] text-[var(--muted)]">{skillsData.length} 个</span>
                } />
                <p className="-mt-1 mb-3 max-w-[720px] text-[12.5px] leading-[1.75] text-[var(--muted)]">{skillsIntro}</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {skillsData.map((s) => (
                    <article key={s.id} className="pcard p-4">
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="line-clamp-1 text-[13.5px] font-semibold text-[var(--ink)] transition-colors hover:text-[var(--accent)]"
                      >
                        {s.name}
                      </a>
                      <p className="mt-1.5 line-clamp-2 text-[12px] leading-[1.7] text-[var(--ink-soft)]">{s.what}</p>
                      <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-[1.7] text-[var(--muted)]">{s.trigger}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section id="choose" className="scroll-mt-20">
                <SectionHead title="常见问题" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {FAQ.map((f) => (
                    <article key={f.q} className="pcard p-4">
                      <h3 className="text-[13px] font-semibold text-[var(--ink)]">{f.q}</h3>
                      <p className="mt-1.5 text-[12px] leading-[1.8] text-[var(--muted)]">{f.a}</p>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-3">
              <RailCard title="MCP 榜">
                <NumList items={mcpServers.slice(0, 8).map((s) => ({ title: s.name, href: s.url, meta: s.origin }))} />
              </RailCard>

              <RailCard title="Skills 榜">
                <NumList items={skillsData.slice(0, 8).map((s) => ({ title: s.name, href: s.url }))} />
              </RailCard>

              <RailCard title="最近更新" href="/ai/all" more="更多">
                {recent.length > 0 ? (
                  <NumList
                    items={recent.slice(0, 5).map((d) => ({
                      title: d.title,
                      href: `/ai/${d.category}/${d.slug}`,
                    }))}
                  />
                ) : (
                  <p className="py-2 text-[12.5px] leading-[1.8] text-[var(--muted)]">还没有发布笔记。</p>
                )}
              </RailCard>
            </aside>
          </div>
        </main>
      </PageTransition>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import SearchBox from "../../components/SearchBox";
import { RailCard, NumList, SectionHead } from "../../components/tpl/Template";
import PromptList from "./[group]/PromptList";
import { promptGroups, promptsData } from "../../data/prompts";
import { getSearchItems } from "../../lib/siteSearch";
import { getRecentDocs } from "../../lib/aiDocs";

export const metadata: Metadata = {
  title: "提示词",
  description: "可直接复制的提示词模板，按用途分组，写清每条解决什么问题。",
};

/**
 * 提示词模板（照参考站 /painting）：
 * 居中大标题 + 副标题 + 大搜索框 + 统计条 + 一行分组胶囊，正文 3 列卡片网格。
 */
export default function PromptsPage() {
  const searchItems = getSearchItems();
  const recent = getRecentDocs(8);

  return (
    <div className="min-h-screen">
      <Navbar />
      <PageTransition>
        <section className="wrap pt-12 pb-8 text-center">
          <h1 className="mx-auto max-w-[760px] text-[1.9rem] font-extrabold leading-[1.2] tracking-[-0.02em] text-[var(--ink)] sm:text-[2.5rem]">
            直接能用的提示词
          </h1>
          <p className="mx-auto mt-3.5 max-w-[640px] text-[13.5px] leading-[1.8] text-[var(--muted)]">
            尖括号里是占位符，换成你自己的内容。靠把要求写具体，不是堆技巧词。
          </p>
          <div className="mx-auto mt-6 w-full max-w-[672px]">
            <SearchBox items={searchItems} limit={10} placeholder="搜提示词，比如「改写」「代码审查」" />
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {promptGroups.map((g) => (
              <Link key={g.slug} href={`#${g.slug}`} className="chip">
                {g.name}
                <span className="text-[11px] text-[var(--muted)]">
                  {promptsData.filter((p) => p.group === g.slug).length}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <main className="wrap pb-20">
          <div className="split">
            <div className="min-w-0 space-y-9">
              {promptGroups.map((g) => {
                const items = promptsData.filter((p) => p.group === g.slug);
                if (items.length === 0) return null;
                return (
                  <section key={g.slug} id={g.slug} className="scroll-mt-20">
                    <SectionHead title={g.name} more="单独看" href={`/prompts/${g.slug}`} extra={
                      <span className="text-[11.5px] text-[var(--muted)]">{items.length} 条</span>
                    } />
                    <p className="-mt-1 mb-3 text-[12.5px] leading-[1.7] text-[var(--muted)]">{g.description}</p>
                    <PromptList items={items} />
                  </section>
                );
              })}
            </div>

            <aside className="space-y-3">
              <RailCard title="分组">
                <NumList
                  items={promptGroups.map((g) => ({
                    title: g.name,
                    href: `/prompts/${g.slug}`,
                    meta: `${promptsData.filter((p) => p.group === g.slug).length}`,
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

              <RailCard title="怎么用">
                <ul className="space-y-1.5 text-[12px] leading-[1.7] text-[var(--muted)]">
                  <li>· 占位符全换成具体对象</li>
                  <li>· 一次只改一处，对比效果</li>
                  <li>· 结果不稳就加约束，不是加字数</li>
                </ul>
              </RailCard>
            </aside>
          </div>
        </main>
      </PageTransition>
    </div>
  );
}

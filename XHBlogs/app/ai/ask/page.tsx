import type { Metadata } from "next";

import Navbar from "../../../components/Navbar";
import PageTransition from "../../../components/PageTransition";
import AskPanel from "../../../components/ai/AskPanel";
import Link from "next/link";

import { RailCard, SectionHead } from "../../../components/tpl/Template";
import { getRecentDocs, getStats } from "../../../lib/aiDocs";
import { getIndexSize } from "../../../lib/aiIndex";

export const metadata: Metadata = {
  title: "问一问 · AI 知识库",
  description: "基于站内 AI 笔记的检索问答，回答会附上它参考了哪几篇。",
};

/**
 * 问答页：居中页首 + 对话框，右栏说明「答案从哪来」。不放统计数字堆。
 */
export default function AskPage() {
  const stats = getStats();
  const indexed = getIndexSize();
  const recent = getRecentDocs(6);

  return (
    <div className="min-h-screen">
      <Navbar />
      <PageTransition>
        <main className="wrap pb-20">
          <div className="pt-12 pb-7 text-center">
            <h1 className="text-[1.9rem] font-extrabold leading-[1.2] tracking-[-0.02em] text-[var(--ink)] sm:text-[2.4rem]">
              问一句，答一篇
            </h1>
            <p className="mx-auto mt-3 max-w-[640px] text-[13.5px] leading-[1.8] text-[var(--muted)]">
              答案只来自站内 {indexed} 篇笔记。检索不到会说检索不到，命中过的篇目会列在回答上方，方便自己核对。
            </p>
          </div>

          <div className="split">
            <div className="min-w-0 space-y-8">
              <AskPanel />

              <section>
                <SectionHead title="最近写过的" more="全部篇目" href="/ai/all" />
                <div className="pcard divide-y divide-[var(--card-line)]">
                  {recent.map((doc) => (
                    <Link
                      key={doc.key}
                      href={`/ai/${doc.key}`}
                      className="group flex items-baseline gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--surface-alt)]"
                    >
                      <span className="min-w-0 flex-1 truncate text-[13.5px] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                        {doc.title}
                      </span>
                      <span className="shrink-0 text-[11.5px] text-[var(--muted)]">{doc.categoryName}</span>
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-3">
              <RailCard title="它是怎么答的">
                <ol className="space-y-2 text-[12px] leading-[1.75] text-[var(--muted)]">
                  <li>1. 把你这句话拆成字符对，在索引里算覆盖度</li>
                  <li>2. 取覆盖率最高的几篇，标题命中加权最重</li>
                  <li>3. 只把这几篇的开头交给模型，让它照材料答</li>
                  <li>4. 材料里没有的，它应该说没有</li>
                </ol>
              </RailCard>

              <RailCard title="能问什么">
                <ul className="space-y-1.5 text-[12px] leading-[1.7] text-[var(--muted)]">
                  <li>· 具体参数怎么设，比如温度、top_p</li>
                  <li>· 某个报错为什么出、怎么改</li>
                  <li>· 两类方案怎么取舍，代价在哪</li>
                </ul>
              </RailCard>

              <RailCard title="现有笔记" href="/ai/all" more="全部">
                <p className="text-[12px] leading-[1.75] text-[var(--muted)]">
                  共 {stats.docs} 篇，{stats.groups} 个主题，{stats.categories} 个分组，累计约 {stats.minutes} 分钟阅读。
                </p>
              </RailCard>
            </aside>
          </div>
        </main>
      </PageTransition>
    </div>
  );
}

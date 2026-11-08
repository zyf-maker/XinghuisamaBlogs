import type { Metadata } from "next";
import Link from "next/link";

import PageHeader from "../../components/PageHeader";
import ModuleShell from "../../components/ModuleShell";
import SideNav from "../../components/SideNav";
import { aiGroups } from "../../data/aiCategories";
import { getAllCategories, getGroups, getRecentDocs } from "../../lib/aiDocs";
import { asset } from "../../lib/base";
import { moduleLinks } from "../../lib/moduleNav";

export const metadata: Metadata = {
  title: "知识库",
  description: "按主题分组的 AI 笔记：模型基础、工具、实战、部署。",
};

/**
 * 知识库总览。
 *
 * 左栏只放「统一大类」（六个，固定），右栏放真实内容（大类下的分组与篇目），
 * 这样点左栏是在切换主题域，而不是在分类里再套一层分类。
 */
export default function AiIndexPage() {
  const groups = getGroups();
  const allCats = getAllCategories().filter((c) => c.docs.length > 0);
  const recent = getRecentDocs(6);

  // 大类即使暂时没内容也保留，页面上显示空态，避免左栏跳来跳去
  const sidebar = [
    {
      title: "主题",
      items: aiGroups.map((g) => {
        const hit = groups.find((x) => x.slug === g.slug);
        return { label: g.name, href: `/ai#${g.slug}`, meta: hit ? String(hit.docCount) : "0" };
      }),
    },
    {
      title: "索引",
      items: [{ label: "全部篇目", href: "/ai/all" }],
    },
    {
      title: "其他模块",
      items: moduleLinks.filter((m) => m.href !== "/ai").map((m) => ({ label: m.label, href: m.href })),
    },
  ];

  return (
    <>
      <div className="mx-auto w-[92%] max-w-6xl">
        <div className="pt-14">
          <PageHeader
            title="知识库"
            description="按主题分组的笔记。多数是动手之后写下来的，包含具体参数、命令和踩过的坑。"
            actions={
              <Link
                href="/ai/ask"
                className="rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3.5 py-1.5 text-[11.5px] text-[var(--ink-soft)] backdrop-blur-md transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                直接提问 →
              </Link>
            }
          />
        </div>
      </div>

      <ModuleShell wide sidebar={<SideNav sections={sidebar} />}>
        {allCats.length === 0 ? (
          <div className="glass-card p-8">
            <p className="font-serif text-[1.05rem] font-bold text-[var(--ink)]">这里还是空的</p>
            <p className="mt-2 max-w-md text-[13px] leading-[1.85] text-[var(--ink-soft)]">
              笔记正在陆续整理。目录结构、检索与问答链路已经就绪，写入
              <code className="mx-1 rounded bg-[var(--surface-alt)] px-1 py-0.5 font-mono text-[12px] text-[var(--ink)]">
                content/notes/&lt;分组&gt;/
              </code>
              的 Markdown 会在下次构建时自动出现在这里。
            </p>
            <p className="mt-4 text-[12.5px] text-[var(--muted)]">
              想先看看别的：<Link href="/tools" className="link-accent">工具库</Link> ·{" "}
              <Link href="/prompts" className="link-accent">提示词</Link> ·{" "}
              <Link href="/learn" className="link-accent">学习路线</Link>
            </p>
          </div>
        ) : (
          <div className="space-y-14">
            {aiGroups.map((g) => {
              const hit = groups.find((x) => x.slug === g.slug);
              const cats = hit?.categories ?? [];

              // 空的大类不在这里占位：左栏已标「待整理」，正文只列有内容的
              if (cats.length === 0) return null;

              return (
                <section key={g.slug} id={g.slug} className="scroll-mt-24">
                  <div className="relative overflow-hidden rounded-[var(--r-lg)] border border-[var(--glass-line)]">
                    <img
                      src={asset(`/covers/${g.slug}.svg`)}
                      alt=""
                      className="h-24 w-full object-cover sm:h-28"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--paper)]/95 via-[var(--paper)]/55 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-center px-6">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h2 className="font-serif text-[1.5rem] font-bold text-[var(--ink)]">{g.name}</h2>
                        <span className="text-[11.5px] text-[var(--muted)]">{hit ? `${hit.docCount} 篇` : ""}</span>
                      </div>
                      <p className="mt-1 max-w-md text-[12.5px] leading-[1.7] text-[var(--ink-soft)]">
                        {g.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {cats.map((cat) => (
                      <div key={cat.slug} className="glass-flat p-5">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h3 className="text-[14.5px] font-semibold text-[var(--ink)]">
                              <Link href={`/ai/${cat.slug}`} className="transition-colors hover:text-[var(--accent)]">
                                {cat.name}
                              </Link>
                            </h3>
                            <span className="text-[11px] text-[var(--muted)]">{cat.docs.length} 篇</span>
                          </div>

                          <ul className="mt-3 space-y-2">
                            {cat.docs.slice(0, 4).map((doc) => (
                              <li key={doc.key}>
                                <Link
                                  href={`/ai/${cat.slug}/${doc.slug}`}
                                  className="group flex items-baseline gap-3 text-[13px]"
                                >
                                  <span className="shrink-0 font-mono text-[10.5px] text-[var(--ink-soft)] opacity-70">
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
                            <Link
                              href={`/ai/${cat.slug}`}
                              className="mt-3 inline-block text-[11.5px] text-[var(--muted)] hover:text-[var(--accent)]"
                            >
                              还有 {cat.docs.length - 4} 篇 →
                            </Link>
                          )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            {recent.length > 0 && (
              <section className="glass-flat p-6">
                <div className="border-b border-[var(--line)] pb-3">
                  <h2 className="font-serif text-[1.35rem] font-bold text-[var(--ink)]">最近更新</h2>
                </div>
                <ol className="divide-y divide-[var(--line)]">
                  {recent.map((doc) => (
                    <li key={doc.key}>
                      <Link href={`/ai/${doc.category}/${doc.slug}`} className="group block py-4">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <h3 className="text-[14px] font-medium text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                            {doc.title}
                          </h3>
                          <span className="text-[11px] text-[var(--muted)]">{doc.categoryName}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        )}
      </ModuleShell>
    </>
  );
}

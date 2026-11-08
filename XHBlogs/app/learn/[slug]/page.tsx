import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "../../../components/Navbar";
import PageTransition from "../../../components/PageTransition";
import { RailCard, NumList } from "../../../components/tpl/Template";
import { routes, routeMap } from "../../../data/routes";
import { getCategory } from "../../../data/aiCategories";
import { getRecentDocs } from "../../../lib/aiDocs";

export function generateStaticParams() {
  return routes.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = routeMap.get(slug);
  if (!r) return { title: "学习路线" };
  return { title: `${r.name} · 学习路线`, description: r.outcome };
}

/**
 * 单条路线：面包屑 + 标题 + 一行元信息 + 左侧竖线时间轴步骤 + 右栏目录与相邻路线。
 */
export default async function RoutePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const route = routeMap.get(slug);
  if (!route) notFound();

  const idx = routes.findIndex((r) => r.slug === route.slug);
  const prev = idx > 0 ? routes[idx - 1] : null;
  const next = idx < routes.length - 1 ? routes[idx + 1] : null;
  const recent = getRecentDocs(8);

  return (
    <div className="min-h-screen">
      <Navbar />
      <PageTransition>
        <main className="wrap pb-20">
          <div className="split">
            <article className="min-w-0">
              <nav className="flex items-center gap-2 pt-9 text-[12px] text-[var(--muted)]">
                <Link href="/learn" className="hover:text-[var(--accent)]">学习路线</Link>
                <span>/</span>
                <span>{route.name}</span>
              </nav>

              <h1 className="mt-3 text-[1.7rem] font-extrabold leading-[1.25] tracking-[-0.02em] text-[var(--ink)] sm:text-[2.1rem]">
                {route.name}
              </h1>

              <p className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[var(--muted)]">
                <span>{route.steps.length} 步</span>
                <span className="opacity-40">·</span>
                <span>面向{route.audience}</span>
                <span className="opacity-40">·</span>
                <span>前置：{route.prerequisite}</span>
              </p>

              <p className="mt-4 border-l-2 border-[var(--accent)] bg-[var(--accent-soft)] px-3.5 py-2.5 text-[13px] leading-[1.8] text-[var(--ink-soft)]">
                {route.outcome}
              </p>

              <ol className="mt-8">
                {route.steps.map((s, i) => (
                  <li
                    key={s.title}
                    id={`step-${i + 1}`}
                    className="relative scroll-mt-20 border-l border-[var(--card-line)] pb-8 pl-6 last:pb-0"
                  >
                    <span className="absolute -left-[11px] top-1 flex h-[22px] w-[22px] items-center justify-center rounded-full border border-[var(--card-line)] bg-[var(--card-bg-solid)] font-mono text-[10px] text-[var(--accent)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <h2 className="text-[15px] font-bold text-[var(--ink)]">{s.title}</h2>
                    <p className="mt-1.5 text-[13px] leading-[1.85] text-[var(--ink-soft)]">{s.goal}</p>

                    <ul className="mt-2.5 space-y-1">
                      {s.actions.map((a) => (
                        <li key={a} className="text-[12.5px] leading-[1.8] text-[var(--muted)]">
                          · {a}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-[var(--muted)]">
                      <span>约 {s.duration}</span>
                      {s.related.map((rel) => {
                        const cat = getCategory(rel);
                        if (!cat) return null;
                        return (
                          <Link key={rel} href={`/ai/${rel}`} className="hover:text-[var(--accent)]">
                            对照阅读：{cat.name} →
                          </Link>
                        );
                      })}
                    </div>
                  </li>
                ))}
              </ol>

              <nav className="mt-12 grid gap-3 sm:grid-cols-2">
                {prev ? (
                  <Link href={`/learn/${prev.slug}`} className="pcard group p-4">
                    <span className="text-[11px] text-[var(--muted)]">← 上一条</span>
                    <p className="mt-1 text-[13px] font-semibold text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                      {prev.name}
                    </p>
                  </Link>
                ) : (
                  <div className="pcard p-4 opacity-60">
                    <span className="text-[11px] text-[var(--muted)]">已是第一条</span>
                  </div>
                )}
                {next ? (
                  <Link href={`/learn/${next.slug}`} className="pcard group p-4 sm:text-right">
                    <span className="text-[11px] text-[var(--muted)]">下一条 →</span>
                    <p className="mt-1 text-[13px] font-semibold text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                      {next.name}
                    </p>
                  </Link>
                ) : (
                  <div className="pcard p-4 opacity-60 sm:text-right">
                    <span className="text-[11px] text-[var(--muted)]">已是最后一条</span>
                  </div>
                )}
              </nav>
            </article>

            <aside className="space-y-3">
              <RailCard title="本页步骤">
                <NumList
                  items={route.steps.map((s, i) => ({
                    title: s.title,
                    href: `#step-${i + 1}`,
                    meta: `${i + 1}`,
                  }))}
                />
              </RailCard>

              <RailCard title="全部路线" href="/learn" more="返回">
                <NumList
                  items={routes.map((r) => ({ title: r.name, href: `/learn/${r.slug}`, meta: `${r.steps.length}` }))}
                />
              </RailCard>

              <RailCard title="最近更新" href="/ai/all" more="更多">
                <NumList
                  items={recent.slice(0, 5).map((d) => ({
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

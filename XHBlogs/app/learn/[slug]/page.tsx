import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ModuleShell from "../../../components/ModuleShell";
import SideNav from "../../../components/SideNav";
import PageHeader from "../../../components/PageHeader";
import { routes, routeMap } from "../../../data/routes";
import { getCategory } from "../../../data/aiCategories";
import { moduleLinks } from "../../../lib/moduleNav";

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

export default async function RoutePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const route = routeMap.get(slug);
  if (!route) notFound();

  const idx = routes.findIndex((r) => r.slug === route.slug);
  const prev = idx > 0 ? routes[idx - 1] : null;
  const next = idx < routes.length - 1 ? routes[idx + 1] : null;

  const sections = [
    {
      title: "本页步骤",
      items: route.steps.map((s, i) => ({
        label: s.title,
        href: `#step-${i + 1}`,
      })),
    },
    {
      title: "路线",
      items: routes.map((r) => ({ label: r.name, href: `/learn/${r.slug}` })),
    },
    {
      title: "其他模块",
      items: moduleLinks
        .filter((m) => m.href !== "/learn")
        .map((m) => ({ label: m.label, href: m.href })),
    },
  ];

  return (
    <>
      <div className="mx-auto w-[92%] max-w-6xl">
        <div className="pt-14">
          <PageHeader
            title={route.name}
            description={route.outcome}
            actions={
              <Link
                href="/learn"
                className="text-[11.5px] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
              >
                ← 全部路线
              </Link>
            }
          />
        </div>
      </div>

      <ModuleShell wide sidebar={<SideNav sections={sections} />}>
        <dl className="grid gap-2 border-y border-[var(--line)] py-5 text-[13px] leading-[1.85] sm:grid-cols-[72px_1fr] sm:gap-x-4">
          <dt className="text-[11.5px] text-[var(--muted)] sm:pt-1">适合谁</dt>
          <dd className="text-[var(--ink-soft)]">{route.audience}</dd>
          <dt className="text-[11.5px] text-[var(--muted)] sm:pt-1">前置要求</dt>
          <dd className="text-[var(--ink-soft)]">{route.prerequisite}</dd>
          <dt className="text-[11.5px] text-[var(--muted)] sm:pt-1">学完能做</dt>
          <dd className="text-[var(--ink-soft)]">{route.outcome}</dd>
        </dl>

        <ol className="mt-10">
          {route.steps.map((s, i) => (
            <li
              key={s.title}
              id={`step-${i + 1}`}
              className="relative scroll-mt-24 border-l border-[var(--line)] pb-10 pl-6 last:pb-0"
            >
              <span className="absolute -left-[13px] top-1 flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[var(--line-strong)] bg-[var(--paper)] text-[10.5px] text-[var(--accent)]">
                {String(i + 1).padStart(2, "0")}
              </span>

              <h2 className="font-serif text-[1.15rem] font-bold text-[var(--ink)]">{s.title}</h2>
              <p className="mt-1.5 text-[13.5px] leading-[1.85] text-[var(--ink-soft)]">{s.goal}</p>

              <ul className="mt-3 space-y-1.5">
                {s.actions.map((a) => (
                  <li key={a} className="text-[12.5px] leading-[1.85] text-[var(--muted)]">
                    · {a}
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-[var(--muted)]">
                <span>约 {s.duration}</span>
                {s.related.map((rel) => {
                  const cat = getCategory(rel);
                  if (!cat) return null;
                  return (
                    <Link key={rel} href={`/ai/${rel}`} className="transition-colors hover:text-[var(--accent)]">
                      对照阅读：{cat.name} →
                    </Link>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>

        <nav className="mt-14 flex items-stretch justify-between gap-4 border-t border-[var(--line)] pt-6">
          {prev ? (
            <Link href={`/learn/${prev.slug}`} className="group max-w-[46%]">
              <span className="text-[11px] text-[var(--muted)]">上一条</span>
              <p className="mt-1 font-serif text-[14px] font-bold text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                {prev.name}
              </p>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/learn/${next.slug}`} className="group max-w-[46%] text-right">
              <span className="text-[11px] text-[var(--muted)]">下一条</span>
              <p className="mt-1 font-serif text-[14px] font-bold text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                {next.name}
              </p>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </ModuleShell>
    </>
  );
}

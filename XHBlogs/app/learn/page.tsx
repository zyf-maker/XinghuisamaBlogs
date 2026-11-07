import type { Metadata } from "next";

import ModuleShell from "../../components/ModuleShell";
import SideNav from "../../components/SideNav";
import PageHeader from "../../components/PageHeader";
import { routes } from "../../data/routes";
import { moduleLinks } from "../../lib/moduleNav";

export const metadata: Metadata = {
  title: "学习路线",
  description: "按目标排的顺序清单：先读什么、再做什么，每步都有可验证的产出。",
};

export default function LearnPage() {
  const sections = [
    {
      title: "路线",
      items: routes.map((r) => ({ label: r.name, href: `/learn/${r.slug}`, meta: `${r.steps.length} 步` })),
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
            eyebrow={`Routes · ${routes.length} 条`}
            title="学习路线"
            description="不是课程表，是按目标倒推的顺序：每一步都该有能拿给别人的产出，否则就还没学会。"
          />
        </div>
      </div>

      <ModuleShell wide sidebar={<SideNav sections={sections} />}>
        <ul className="divide-y divide-[var(--line)] border-t border-[var(--line)]">
          {routes.map((r) => (
            <li key={r.slug} className="py-8">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <a
                  href={`/learn/${r.slug}`}
                  className="font-serif text-[1.3rem] font-bold text-[var(--ink)] transition-colors hover:text-[var(--accent)]"
                >
                  {r.name}
                </a>
                <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--muted)]">
                  {r.en.toUpperCase()} · {r.steps.length} 步
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-[13px] leading-[1.85] sm:grid-cols-[72px_1fr] sm:gap-x-4">
                <dt className="font-mono text-[10px] tracking-[0.12em] text-[var(--muted)] sm:pt-1">适合谁</dt>
                <dd className="text-[var(--ink-soft)]">{r.audience}</dd>
                <dt className="font-mono text-[10px] tracking-[0.12em] text-[var(--muted)] sm:pt-1">学完能做</dt>
                <dd className="text-[var(--ink-soft)]">{r.outcome}</dd>
                <dt className="font-mono text-[10px] tracking-[0.12em] text-[var(--muted)] sm:pt-1">前置</dt>
                <dd className="text-[var(--muted)]">{r.prerequisite}</dd>
              </dl>

              <ol className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
                {r.steps.map((s, i) => (
                  <li key={s.title} className="font-mono text-[10.5px] text-[var(--muted)]">
                    <span className="text-[var(--accent)]">{String(i + 1).padStart(2, "0")}</span> {s.title}
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      </ModuleShell>
    </>
  );
}

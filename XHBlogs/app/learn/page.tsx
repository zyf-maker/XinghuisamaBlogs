import type { Metadata } from "next";
import Link from "next/link";

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
            title="学习路线"
            description="不是课程表，是按目标倒推的顺序。每一步都该有能拿给别人的产出。"
          />
        </div>
      </div>

      <ModuleShell wide sidebar={<SideNav sections={sections} />}>
        <div className="grid gap-4">
          {routes.map((r) => (
            <Link
              key={r.slug}
              href={`/learn/${r.slug}`}
              className="glass-card glass-sheen group p-6"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-serif text-[1.25rem] font-bold text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                  {r.name}
                </h2>
                <span className="shrink-0 text-[11.5px] text-[var(--muted)]">{r.steps.length} 步</span>
              </div>

              <p className="mt-2 text-[13px] leading-[1.8] text-[var(--ink-soft)]">{r.outcome}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {r.steps.map((s, i) => (
                  <span
                    key={s.title}
                    className="glass-inset px-2.5 py-1 text-[11.5px] text-[var(--ink-soft)]"
                  >
                    <span className="mr-1 text-[var(--accent)]">{String(i + 1).padStart(2, "0")}</span>
                    {s.title}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </ModuleShell>
    </>
  );
}

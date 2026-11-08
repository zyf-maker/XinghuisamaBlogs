import type { Metadata } from "next";

import ModuleShell from "../../components/ModuleShell";
import SideNav from "../../components/SideNav";
import PageHeader from "../../components/PageHeader";
import { toolCategories, toolsData } from "../../data/tools";
import { moduleLinks } from "../../lib/moduleNav";

export const metadata: Metadata = {
  title: "工具库",
  description: "按用途分类的 AI 工具索引，写清楚适合谁、代价是什么。",
};

export default function ToolsPage() {
  const sections = [
    {
      title: "工具分类",
      items: toolCategories.map((c) => ({
        label: c.name,
        href: `/tools/${c.slug}`,
      })),
    },
    {
      title: "其他模块",
      items: moduleLinks
        .filter((m) => m.href !== "/tools")
        .map((m) => ({ label: m.label, href: m.href })),
    },
  ];

  return (
    <>
      <div className="mx-auto w-[92%] max-w-6xl">
        <div className="pt-14">
          <PageHeader
            title="工具库"
            description="按用途分，不按热度排。写清它适合谁、强在哪、代价是什么。"
          />
        </div>
      </div>

      <ModuleShell
        wide
        sidebar={<SideNav sections={sections} footer={{ label: "全部工具 →", href: "/tools" }} />}
      >
        {toolCategories.map((cat) => {
          const items = toolsData.filter((t) => t.category === cat.slug);
          if (items.length === 0) return null;

          return (
            <section key={cat.slug} id={cat.slug} className="mb-10 scroll-mt-24 last:mb-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-2.5">
                <h2 className="font-serif text-[1.3rem] font-bold text-[var(--ink)]">{cat.name}</h2>
                <span className="text-[11.5px] text-[var(--muted)]">{items.length} 个</span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {items.map((tool, i) => (
                  <a
                    key={tool.id}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`glass-card glass-sheen group flex min-w-0 flex-col p-5 ${
                      i === items.length - 1 && items.length % 2 === 1 ? "sm:col-span-2" : ""
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-serif text-[1.02rem] font-bold text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                        {tool.name}
                      </span>
                      <span className="shrink-0 text-[11px] text-[var(--muted)]">{tool.pricing}</span>
                    </div>

                    <p className="mt-2 text-[13px] leading-[1.75] text-[var(--ink-soft)]">{tool.tagline}</p>
                    <p className="mt-2 text-[12px] leading-[1.75] text-[var(--muted)]">{tool.detail}</p>

                    <div className="mt-auto flex items-center justify-between gap-3 pt-3.5 text-[11px] text-[var(--muted)]">
                      <span className="truncate">{tool.platform.join(" · ")}</span>
                      <span className="shrink-0 transition-colors group-hover:text-[var(--accent)]">打开 ↗</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          );
        })}
      </ModuleShell>
    </>
  );
}

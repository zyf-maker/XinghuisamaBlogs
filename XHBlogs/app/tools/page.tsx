import type { Metadata } from "next";
import Link from "next/link";

import ModuleShell from "../../components/ModuleShell";
import SideNav from "../../components/SideNav";
import PageHeader from "../../components/PageHeader";
import { toolCategories, toolsData } from "../../data/tools";
import { moduleLinks } from "../../lib/moduleNav";

export const metadata: Metadata = {
  title: "工具库",
  description: "按用途分类的 AI 工具索引，写清楚适合谁、代价是什么。",
};

const pricingOrder = ["免费", "免费额度", "开源", "自部署", "按量", "订阅"];

export default function ToolsPage() {
  const sections = [
    {
      title: "工具分类",
      items: toolCategories.map((c) => ({
        label: c.name,
        href: `/tools/${c.slug}`,
        meta: String(toolsData.filter((t) => t.category === c.slug).length),
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
            eyebrow={`Tools · ${toolsData.length} 个 · ${toolCategories.length} 类`}
            title="工具库"
            description="按用途分，不按热度排。每个条目写清楚它适合谁、强在哪、代价是什么——不做排行榜。"
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
            <section key={cat.slug} id={cat.slug} className="mb-16 scroll-mt-24 last:mb-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-3">
                <h2 className="font-serif text-lg font-bold text-[var(--ink)]">
                  {cat.name}
                  <span className="ml-3 font-mono text-[10px] font-normal tracking-[0.12em] text-[var(--muted)]">
                    {cat.en.toUpperCase()}
                  </span>
                </h2>
                <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--muted)]">
                  {items.length} 个
                </span>
              </div>

              <p className="mt-3 text-[12.5px] leading-[1.8] text-[var(--muted)]">{cat.description}</p>

              <ul className="mt-2 divide-y divide-[var(--line)]">
                {items.map((tool) => (
                  <li key={tool.id} className="py-6">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group font-serif text-[1.05rem] font-bold text-[var(--ink)] transition-colors hover:text-[var(--accent)]"
                      >
                        {tool.name}
                        <span className="ml-1.5 font-mono text-[10px] font-normal text-[var(--muted)] transition-colors group-hover:text-[var(--accent)]">
                          ↗
                        </span>
                      </a>
                      <span className="font-mono text-[10px] tracking-[0.1em] text-[var(--muted)]">
                        {tool.pricing}
                      </span>
                    </div>

                    <p className="mt-1.5 text-[13.5px] leading-[1.8] text-[var(--ink-soft)]">
                      {tool.tagline}
                    </p>
                    <p className="mt-2 text-[12.5px] leading-[1.85] text-[var(--muted)]">{tool.detail}</p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] tracking-[0.1em] text-[var(--muted)]">
                      <span>{tool.platform.join(" / ")}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <p className="mt-12 border-t border-[var(--line)] pt-6 font-mono text-[10.5px] leading-[1.9] text-[var(--muted)]">
          价格与功能随时会变，用之前去官网确认一遍。
          收录标准是「能公开访问、还在维护」，不代表推荐。
          价格区间标记：{pricingOrder.join(" · ")}。
        </p>
      </ModuleShell>
    </>
  );
}

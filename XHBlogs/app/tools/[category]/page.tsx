import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ModuleShell from "../../../components/ModuleShell";
import SideNav from "../../../components/SideNav";
import PageHeader from "../../../components/PageHeader";
import { toolCategories, toolsData, getToolsByCategory } from "../../../data/tools";
import { moduleLinks } from "../../../lib/moduleNav";

export function generateStaticParams() {
  return toolCategories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = toolCategories.find((c) => c.slug === category);
  if (!cat) return { title: "工具库" };
  return { title: `${cat.name} · 工具库`, description: cat.description };
}

export default async function ToolCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = toolCategories.find((c) => c.slug === category);
  if (!cat) notFound();

  const items = getToolsByCategory(cat.slug);

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
            eyebrow={`Tools · ${cat.en} · ${items.length} 个`}
            title={cat.name}
            description={cat.description}
            actions={
              <Link
                href="/tools"
                className="font-mono text-[10px] tracking-[0.14em] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
              >
                ← 全部工具
              </Link>
            }
          />
        </div>
      </div>

      <ModuleShell
        wide
        sidebar={<SideNav sections={sections} footer={{ label: "全部工具 →", href: "/tools" }} />}
      >
        <ul className="divide-y divide-[var(--line)] border-t border-[var(--line)]">
          {items.map((tool) => (
            <li key={tool.id} className="py-7">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group font-serif text-[1.15rem] font-bold text-[var(--ink)] transition-colors hover:text-[var(--accent)]"
                >
                  {tool.name}
                  <span className="ml-1.5 font-mono text-[10px] font-normal text-[var(--muted)] transition-colors group-hover:text-[var(--accent)]">
                    ↗
                  </span>
                </a>
                <span className="font-mono text-[10px] tracking-[0.1em] text-[var(--muted)]">
                  {tool.pricing}
                </span>
                <span className="font-mono text-[10px] tracking-[0.1em] text-[var(--muted)]">
                  {tool.platform.join(" / ")}
                </span>
              </div>

              <p className="mt-2 text-[14px] leading-[1.85] text-[var(--ink-soft)]">{tool.tagline}</p>
              <p className="mt-2 text-[12.5px] leading-[1.85] text-[var(--muted)]">{tool.detail}</p>

              {tool.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tool.tags.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="rounded-sm border border-[var(--line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </ModuleShell>
    </>
  );
}

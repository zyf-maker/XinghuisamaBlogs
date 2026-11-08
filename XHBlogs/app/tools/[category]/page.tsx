import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ModuleShell from "../../../components/ModuleShell";
import SideNav from "../../../components/SideNav";
import PageHeader from "../../../components/PageHeader";
import { toolCategories, getToolsByCategory } from "../../../data/tools";
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
            title={cat.name}
            description={cat.description}
            actions={
              <Link
                href="/tools"
                className="text-[11.5px] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
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
        <div className="grid gap-3 sm:grid-cols-2">
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
                <span className="font-serif text-[1.05rem] font-bold text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
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
      </ModuleShell>
    </>
  );
}

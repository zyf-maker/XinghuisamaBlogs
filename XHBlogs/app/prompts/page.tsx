import type { Metadata } from "next";

import ModuleShell from "../../components/ModuleShell";
import SideNav from "../../components/SideNav";
import PageHeader from "../../components/PageHeader";
import PromptList from "./[group]/PromptList";
import { promptGroups, promptsData } from "../../data/prompts";
import { moduleLinks } from "../../lib/moduleNav";

export const metadata: Metadata = {
  title: "提示词",
  description: "可直接复制的提示词模板，按用途分组，写清每条解决什么问题。",
};

export default function PromptsPage() {
  const sections = [
    {
      title: "分组",
      items: promptGroups.map((g) => ({
        label: g.name,
        href: `/prompts/${g.slug}`,
        meta: String(promptsData.filter((p) => p.group === g.slug).length),
      })),
    },
    {
      title: "其他模块",
      items: moduleLinks
        .filter((m) => m.href !== "/prompts")
        .map((m) => ({ label: m.label, href: m.href })),
    },
  ];

  return (
    <>
      <div className="mx-auto w-[92%] max-w-6xl">
        <div className="pt-14">
          <PageHeader
            eyebrow={`Prompts · ${promptsData.length} 条 · ${promptGroups.length} 组`}
            title="提示词"
            description="尖括号里的是占位符，替换成你自己的内容。真要稳定，靠的是把要求写具体，不是堆技巧词。"
          />
        </div>
      </div>

      <ModuleShell
        wide
        sidebar={<SideNav sections={sections} footer={{ label: "全部提示词 →", href: "/prompts" }} />}
      >
        {promptGroups.map((g) => {
          const items = promptsData.filter((p) => p.group === g.slug);
          if (items.length === 0) return null;
          return (
            <section key={g.slug} id={g.slug} className="mb-16 scroll-mt-24 last:mb-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-3">
                <h2 className="font-serif text-lg font-bold text-[var(--ink)]">
                  {g.name}
                  <span className="ml-3 font-mono text-[10px] font-normal tracking-[0.12em] text-[var(--muted)]">
                    {g.en.toUpperCase()}
                  </span>
                </h2>
                <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--muted)]">
                  {items.length} 条
                </span>
              </div>
              <p className="mt-3 text-[12.5px] leading-[1.8] text-[var(--muted)]">{g.description}</p>
              <PromptList items={items} />
            </section>
          );
        })}
      </ModuleShell>
    </>
  );
}

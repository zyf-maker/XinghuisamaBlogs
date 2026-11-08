import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ModuleShell from "../../../components/ModuleShell";
import SideNav from "../../../components/SideNav";
import PageHeader from "../../../components/PageHeader";
import PromptList from "./PromptList";
import { promptGroups, getPromptsByGroup } from "../../../data/prompts";
import { moduleLinks } from "../../../lib/moduleNav";

export function generateStaticParams() {
  return promptGroups.map((g) => ({ group: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ group: string }>;
}): Promise<Metadata> {
  const { group } = await params;
  const g = promptGroups.find((x) => x.slug === group);
  if (!g) return { title: "提示词" };
  return { title: `${g.name} · 提示词`, description: g.description };
}

export default async function PromptGroupPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group } = await params;
  const g = promptGroups.find((x) => x.slug === group);
  if (!g) notFound();

  const items = getPromptsByGroup(g.slug);

  const sections = [
    {
      title: "分组",
      items: promptGroups.map((x) => ({
        label: x.name,
        href: `/prompts/${x.slug}`,
        
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
            title={g.name}
            description={g.description}
            actions={
              <Link
                href="/prompts"
                className="text-[11.5px] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
              >
                ← 全部分组
              </Link>
            }
          />
        </div>
      </div>

      <ModuleShell
        wide
        sidebar={<SideNav sections={sections} footer={{ label: "全部提示词 →", href: "/prompts" }} />}
      >
        <PromptList items={items} />
      </ModuleShell>
    </>
  );
}

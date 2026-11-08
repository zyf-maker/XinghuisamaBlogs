import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "../../../components/Navbar";
import PageTransition from "../../../components/PageTransition";
import { RailCard, NumList, SectionHead } from "../../../components/tpl/Template";
import PromptList from "./PromptList";
import { promptGroups, getPromptsByGroup } from "../../../data/prompts";
import { getRecentDocs } from "../../../lib/aiDocs";

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
  const recent = getRecentDocs(8);

  return (
    <div className="min-h-screen">
      <Navbar />
      <PageTransition>
        <main className="wrap pb-20">
          <div className="pt-10 pb-6">
            <nav className="flex items-center gap-2 text-[12px] text-[var(--muted)]">
              <Link href="/prompts" className="hover:text-[var(--accent)]">提示词</Link>
              <span>/</span>
              <span>{g.name}</span>
            </nav>
            <h1 className="mt-3 text-[1.75rem] font-extrabold leading-[1.22] tracking-[-0.02em] text-[var(--ink)] sm:text-[2.2rem]">
              {g.name}
            </h1>
            <p className="mt-2.5 max-w-[680px] text-[13px] leading-[1.8] text-[var(--muted)]">{g.description}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {promptGroups.map((x) => (
                <Link
                  key={x.slug}
                  href={`/prompts/${x.slug}`}
                  className={`chip ${x.slug === g.slug ? "chip-on" : ""}`}
                >
                  {x.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="split">
            <div className="min-w-0">
              <SectionHead title={`共 ${items.length} 条`} more="全部提示词" href="/prompts" />
              <PromptList items={items} />
            </div>

            <aside className="space-y-3">
              <RailCard title="分组">
                <NumList
                  items={promptGroups.map((x) => ({
                    title: x.name,
                    href: `/prompts/${x.slug}`,
                    meta: `${getPromptsByGroup(x.slug).length}`,
                  }))}
                />
              </RailCard>

              <RailCard title="最近更新" href="/ai/all" more="更多">
                <NumList
                  items={recent.slice(0, 6).map((d) => ({
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

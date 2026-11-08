import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ModuleShell from "../../../components/ModuleShell";
import SideNav from "../../../components/SideNav";
import { aiGroups, getCategory } from "../../../data/aiCategories";
import { getAllCategoryBriefs, getCategoryWithDocs } from "../../../lib/aiDocs";
import { asset } from "../../../lib/base";


export function generateStaticParams() {
  return getAllCategoryBriefs().map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategoryWithDocs(category);
  if (!cat) return { title: "分组不存在" };

  return { title: `${cat.name} · 知识库`, description: cat.description };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = getCategoryWithDocs(category);
  if (!cat) notFound();

  const meta = getCategory(category);
  const groupName = aiGroups.find((g) => g.slug === meta?.group)?.name ?? "";
  const categories = getAllCategoryBriefs();

  // 左栏：主题大类 + 当前大类下的分组（展开），不在别的分类里乱跳
  const sections = [
    {
      title: "主题",
      items: aiGroups.map((g) => {
        const count = categories
          .filter((c) => c.group === g.slug)
          .reduce((n, c) => n + c.docs.length, 0);
        return { label: g.name, href: `/ai#${g.slug}`, meta: String(count) };
      }),
    },
    {
      title: groupName || "同组",
      items: categories
        .filter((c) => c.group === meta?.group)
        .map((c) => ({ label: c.name, href: `/ai/${c.slug}`, meta: String(c.docs.length) })),
    },

  ];

  return (
    <>
      {/* 封面图直接铺在页首底下，文字压在图上，不再单独占一条横幅 */}
      <div className="relative overflow-hidden">
        <img
          src={asset(`/covers/${cat.slug}.svg`)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--paper)]/96 via-[var(--paper)]/80 to-[var(--paper)]/45" />
        <div className="relative mx-auto w-[92%] max-w-6xl pt-12">
          <header className="border-b border-[var(--line)] pb-6">
            <Link
              href="/ai"
              className="text-[11.5px] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
            >
              ← 知识库
            </Link>
            <h1 className="mt-3 font-serif text-[2rem] font-black leading-[1.15] tracking-tight text-[var(--ink)] sm:text-[2.4rem]">
              {cat.name}
            </h1>
            <p className="mt-2.5 max-w-xl text-[13.5px] leading-[1.85] text-[var(--ink-soft)]">{cat.intro}</p>
          </header>
        </div>
      </div>

      <ModuleShell wide sidebar={<SideNav sections={sections} footer={{ label: "全部篇目 →", href: "/ai/all" }} />}>
        {cat.docs.length === 0 ? (
          <p className="py-16 text-[13px] text-[var(--muted)]">这一组还在整理。</p>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {cat.docs.map((doc) => (
              <Link key={doc.key} href={`/ai/${cat.slug}/${doc.slug}`} className="group block py-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="font-serif text-[1.1rem] font-bold leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                    {doc.title}
                  </h2>
                  <span className="shrink-0 text-[11.5px] text-[var(--muted)]">{doc.readingTime} 分钟</span>
                </div>
                <p className="mt-2.5 text-[13px] leading-[1.9] text-[var(--ink-soft)]">{doc.summary}</p>
              </Link>
            ))}
          </div>
        )}
      </ModuleShell>
    </>
  );
}

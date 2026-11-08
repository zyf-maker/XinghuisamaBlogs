import type { Metadata } from "next";

import PageHeader from "../../../components/PageHeader";
import ModuleShell from "../../../components/ModuleShell";
import SideNav from "../../../components/SideNav";
import AllIndex from "../../../components/ai/AllIndex";
import { aiGroups } from "../../../data/aiCategories";
import { getAllCategories, getSearchIndex } from "../../../lib/aiDocs";
import { moduleLinks } from "../../../lib/moduleNav";

export const metadata: Metadata = {
  title: "全部篇目 · AI 知识库",
  description: "AI 知识库的完整索引，可按分类筛选或直接搜索标题、摘要与标签。",
};

export default async function AiAllPage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const { tag } = await searchParams;
  const entries = getSearchIndex();
  const cats = getAllCategories().filter((c) => c.docs.length > 0);

  const sections = [
    {
      title: "主题",
      items: aiGroups.map((g) => {
        const count = cats.filter((c) => c.group === g.slug).reduce((n, c) => n + c.docs.length, 0);
        return { label: g.name, href: `/ai#${g.slug}`, meta: String(count) };
      }),
    },
    {
      title: "分组",
      items: cats.map((c) => ({ label: c.name, href: `/ai/${c.slug}`, meta: String(c.docs.length) })),
    },
    {
      title: "其他模块",
      items: moduleLinks.filter((m) => m.href !== "/ai").map((m) => ({ label: m.label, href: m.href })),
    },
  ];

  return (
    <>
      <div className="mx-auto w-[92%] max-w-6xl">
        <div className="pt-14">
          <PageHeader
            title="全部篇目"
            description="所有笔记的完整列表。搜索只在这份索引里做，不发请求，所以敲字即出结果。"
          />
        </div>
      </div>

      <ModuleShell wide sidebar={<SideNav sections={sections} />}>
        <AllIndex
          entries={entries}
          categories={cats.map((c) => ({ slug: c.slug, name: c.name }))}
          initialQuery={tag ?? ""}
        />
      </ModuleShell>
    </>
  );
}

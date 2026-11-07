import type { Metadata } from "next";

import PageHeader from "../../../components/PageHeader";
import AllIndex from "../../../components/ai/AllIndex";
import { getAllCategories, getSearchIndex } from "../../../lib/aiDocs";

export const metadata: Metadata = {
  title: "全部篇目 · AI 知识库",
  description: "AI 知识库的完整索引，可按分类筛选或直接搜索标题、摘要与标签。",
};

export default async function AiAllPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const entries = getSearchIndex();
  const categories = getAllCategories().map((c) => ({ slug: c.slug, name: c.name }));

  return (
    <main className="mx-auto w-[92%] max-w-4xl pb-24 pt-14">
      <PageHeader
        eyebrow={`Index · ${entries.length} 篇`}
        title="全部篇目"
        description="按分类分组列出所有笔记。搜索只在这份索引里做，不发请求，所以很快。"
      />

      <div className="pt-8">
        <AllIndex entries={entries} categories={categories} initialQuery={tag ?? ""} />
      </div>
    </main>
  );
}

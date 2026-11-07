import type { Metadata } from "next";

import PageHeader from "../../../components/PageHeader";
import AskPanel from "../../../components/ai/AskPanel";
import { getStats } from "../../../lib/aiDocs";

export const metadata: Metadata = {
  title: "问一问 · AI 知识库",
  description: "基于站内 AI 笔记的检索问答，回答会附上它参考了哪几篇。",
};

export default function AskPage() {
  const stats = getStats();

  return (
    <main className="mx-auto w-[92%] max-w-3xl pb-24 pt-14">
      <PageHeader
        eyebrow={`Ask · 索引 ${stats.docs} 篇`}
        title="问一问"
        description="答案来自站内笔记，不是通用模型知识。检索不到会直说检索不到，并且把命中过的篇目列在回答上方，方便自己核对。"
      />

      <div className="pt-8">
        <AskPanel />
      </div>

      <div className="mt-8 space-y-2 border-t border-[var(--line)] pt-6 font-mono text-[10.5px] leading-[1.9] text-[var(--muted)]">
        <p>· 检索是字符级 2-gram 打分，不做向量；文档量小时更快，也更好解释。</p>
        <p>· 单次回答限制在 520 token 以内，长问题会被截断到 800 字。</p>
        <p>· 会话不落库，刷新即清空。</p>
      </div>
    </main>
  );
}

import type { Metadata } from "next";

import PageHeader from "../../../components/PageHeader";
import AskPanel from "../../../components/ai/AskPanel";

export const metadata: Metadata = {
  title: "问一问 · AI 知识库",
  description: "基于站内 AI 笔记的检索问答，回答会附上它参考了哪几篇。",
};

export default function AskPage() {
  return (
    <main className="mx-auto w-[92%] max-w-3xl pb-24 pt-14">
      <PageHeader
        title="问一问"
        description="答案来自站内笔记，不是通用模型知识。检索不到会说检索不到，并在回答上方列出命中过的篇目，方便自己核对。"
      />

      <div className="pt-8">
        <AskPanel />
      </div>
    </main>
  );
}

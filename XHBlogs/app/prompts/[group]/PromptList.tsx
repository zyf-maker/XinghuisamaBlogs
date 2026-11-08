"use client";

import { useState } from "react";

import type { Prompt } from "../../../data/prompts";

/**
 * 提示词网格：竖向卡，标题 + 用途 + 正文预览 + 复制。
 * 版式照参考站 /painting 的图卡网格——卡内信息层级只有三层，不堆标签。
 */
export default function PromptList({ items, cols = 3 }: { items: Prompt[]; cols?: 2 | 3 }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (p: Prompt) => {
    try {
      await navigator.clipboard.writeText(p.body);
      setCopied(p.id);
      window.setTimeout(() => setCopied((c) => (c === p.id ? null : c)), 1600);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className={`grid gap-3 ${cols === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"}`}>
      {items.map((p) => (
        <article key={p.id} className="pcard flex flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 text-[13.5px] font-semibold leading-snug text-[var(--ink)]">{p.title}</h3>
            <button
              type="button"
              onClick={() => copy(p)}
              className="shrink-0 rounded-md border border-[var(--card-line)] px-2 py-0.5 text-[11px] text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {copied === p.id ? "已复制" : "复制"}
            </button>
          </div>

          <p className="mt-1.5 line-clamp-2 text-[12px] leading-[1.7] text-[var(--muted)]">{p.useCase}</p>

          <pre className="mt-3 max-h-[168px] flex-1 overflow-y-auto scroll-quiet whitespace-pre-wrap break-words rounded-md border border-[var(--card-line)] bg-[var(--surface-alt)] p-2.5 font-mono text-[11.5px] leading-[1.75] text-[var(--ink-soft)]">
            <code>{p.body}</code>
          </pre>

          {p.notes.length > 0 && (
            <p className="mt-2.5 line-clamp-2 text-[11.5px] leading-[1.7] text-[var(--muted)]">· {p.notes[0]}</p>
          )}
        </article>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";

import type { Prompt } from "../../data/prompts";

/**
 * 提示词列表。每条右上角有复制按钮，
 * 复制的是 body 原文，不含标题与说明。
 */
export default function PromptList({ items }: { items: Prompt[] }) {
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
    <div className="divide-y divide-[var(--line)] border-t border-[var(--line)]">
      {items.map((p) => (
        <article key={p.id} className="py-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-serif text-[1.1rem] font-bold text-[var(--ink)]">{p.title}</h2>
              <p className="mt-1 text-[13px] leading-[1.8] text-[var(--muted)]">{p.useCase}</p>
            </div>
            <button
              type="button"
              onClick={() => copy(p)}
              className="shrink-0 rounded-md border border-[var(--line-strong)] px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {copied === p.id ? "已复制" : "复制"}
            </button>
          </div>

          <pre className="mt-4 overflow-x-auto rounded-md border border-[var(--line)] bg-[var(--surface-alt)] p-4 font-mono text-[12px] leading-[1.85] text-[var(--ink-soft)]">
            <code>{p.body}</code>
          </pre>

          {p.notes.length > 0 ? (
            <ul className="mt-3 space-y-1">
              {p.notes.map((n) => (
                <li key={n} className="text-[12px] leading-[1.8] text-[var(--muted)]">
                  · {n}
                </li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </div>
  );
}

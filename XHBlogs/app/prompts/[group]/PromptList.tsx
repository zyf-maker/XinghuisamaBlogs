"use client";

import { useState } from "react";

import type { Prompt } from "../../../data/prompts";

/**
 * 提示词列表。每条是一张玻璃卡，右上角复制按钮复制 body 原文。
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
    <div className="mt-5 grid gap-3">
      {items.map((p) => (
        <article key={p.id} className="glass-card glass-sheen p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-serif text-[1.05rem] font-bold text-[var(--ink)]">{p.title}</h3>
              <p className="mt-1 text-[12.5px] leading-[1.8] text-[var(--muted)]">{p.useCase}</p>
            </div>
            <button
              type="button"
              onClick={() => copy(p)}
              className="shrink-0 rounded-full border border-[var(--line-strong)] px-3 py-1 text-[11.5px] text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {copied === p.id ? "已复制" : "复制"}
            </button>
          </div>

          <pre className="mt-3.5 overflow-x-auto whitespace-pre-wrap break-words rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface-alt)] p-3.5 font-mono text-[12px] leading-[1.85] text-[var(--ink-soft)]">
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

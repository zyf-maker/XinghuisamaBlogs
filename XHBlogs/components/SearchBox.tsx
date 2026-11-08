"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import type { SearchItem } from "../lib/siteSearch";

type Props = {
  items: SearchItem[];
  /** 首屏可见的候选数量 */
  limit?: number;
  placeholder?: string;
  autoFocus?: boolean;
};

const KIND_ORDER = ["笔记", "工具", "提示词", "路线", "MCP", "Skill", "文章", "随笔"] as const;

/**
 * 站内搜索。
 *
 * 索引在服务端一次性传下来（几百条，只含标题与摘要），客户端做子串匹配：
 * 中文没有分词也能命中，代价是 O(n)，但 n 在千以内，输入到出结果感觉不到延迟。
 * 排序规则：标题命中 > 摘要命中，短标题优先（更可能是用户想要的条目）。
 */
export default function SearchBox({ items, limit = 12, placeholder = "搜索笔记、工具、提示词…", autoFocus }: Props) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // 「/」聚焦搜索框，和大多数文档站一致
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    if (!q) return [];

    const terms = q.split(/\s+/).filter(Boolean);
    const scored: { item: SearchItem; score: number }[] = [];

    for (const item of items) {
      let score = 0;
      let matchedAll = true;

      for (const term of terms) {
        const inTitle = item.title.toLowerCase().includes(term);
        const inHay = item.haystack.includes(term);
        if (!inTitle && !inHay) {
          matchedAll = false;
          break;
        }
        score += inTitle ? 110 : 30;
      }

      if (!matchedAll) continue;
      // 标题越短越可能精确命中
      score += Math.max(0, 60 - item.title.length);
      scored.push({ item, score });
    }

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.item);
  }, [deferred, items, limit]);

  const grouped = useMemo(() => {
    const map = new Map<string, SearchItem[]>();
    for (const r of results) {
      const list = map.get(r.kind) ?? [];
      list.push(r);
      map.set(r.kind, list);
    }
    return KIND_ORDER.filter((k) => map.has(k)).map((k) => ({ kind: k, list: map.get(k)! }));
  }, [results]);

  const hasQuery = deferred.trim().length > 0;

  return (
    <div className="w-full">
      <div className="glass-inset relative flex items-center gap-3 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2.5 backdrop-blur-md">
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[var(--muted)]" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4.5 4.5" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="站内搜索"
          className="min-w-0 flex-1 bg-transparent text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="清空"
            className="shrink-0 font-mono text-[11px] text-[var(--muted)] hover:text-[var(--accent)]"
          >
            清空
          </button>
        ) : (
          <kbd className="hidden shrink-0 rounded border border-[var(--line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted)] sm:block">
            /
          </kbd>
        )}
      </div>

      {hasQuery && (
        <div className="mt-4">
          {results.length === 0 ? (
            <p className="py-6 text-[13px] text-[var(--muted)]">
              没有匹配「{deferred.trim()}」的内容。
            </p>
          ) : (
            <div className="space-y-6">
              {grouped.map((g) => (
                <div key={g.kind}>
                  <p className="border-b border-[var(--line)] pb-1.5 text-[11px] text-[var(--muted)]">{g.kind}</p>
                  <ul className="divide-y divide-[var(--line)]">
                    {g.list.map((r) => (
                      <li key={`${r.kind}-${r.href}-${r.title}`}>
                        <Link href={r.href} className="group block py-2.5">
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="min-w-0 truncate text-[13.5px] font-medium text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                              {r.title}
                            </span>
                            <span className="shrink-0 text-[11px] text-[var(--muted)]">{r.meta}</span>
                          </div>
                          <p className="mt-0.5 line-clamp-1 text-[12px] text-[var(--ink-soft)]">{r.summary}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

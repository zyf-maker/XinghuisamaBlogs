"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { AiSearchEntry } from "../../lib/aiDocs";

type Props = {
  entries: AiSearchEntry[];
  categories: { slug: string; name: string }[];
  initialQuery?: string;
};

/**
 * 全部篇目索引。搜索只在传下来的索引上做子串匹配，不发请求。
 * 版式照参考站的列表页：圆角搜索框 + 一行胶囊筛选 + 按分组的小节列表。
 */
export default function AllIndex({ entries, categories, initialQuery = "" }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [activeCat, setActiveCat] = useState("all");

  const countOf = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) map.set(e.category, (map.get(e.category) ?? 0) + 1);
    return map;
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (activeCat !== "all" && e.category !== activeCat) return false;
      if (!q) return true;
      return e.haystack.includes(q);
    });
  }, [entries, query, activeCat]);

  const grouped = useMemo(() => {
    const map = new Map<string, AiSearchEntry[]>();
    for (const e of filtered) {
      const arr = map.get(e.category) ?? [];
      arr.push(e);
      map.set(e.category, arr);
    }
    return categories
      .map((c) => ({ ...c, items: map.get(c.slug) ?? [] }))
      .filter((c) => c.items.length > 0);
  }, [filtered, categories]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex h-10 flex-1 items-center gap-2 rounded-full border border-[var(--card-line)] bg-[var(--card-bg)] px-4 focus-within:border-[var(--accent)]">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]" fill="none" stroke="currentColor" strokeWidth="1.9">
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16l4.5 4.5" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜标题、摘要或标签"
            className="h-full w-full bg-transparent text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
          />
        </label>
        <p className="text-[11.5px] text-[var(--muted)]">
          {filtered.length} / {entries.length} 篇
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <button type="button" onClick={() => setActiveCat("all")} className={`chip ${activeCat === "all" ? "chip-on" : ""}`}>
          全部
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setActiveCat(c.slug)}
            className={`chip ${activeCat === c.slug ? "chip-on" : ""}`}
          >
            {c.name}
            <span className="opacity-60">{countOf.get(c.slug) ?? 0}</span>
          </button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <p className="py-16 text-[13px] text-[var(--muted)]">没有匹配的篇目。</p>
      ) : (
        <div className="mt-8 space-y-8">
          {grouped.map((group) => (
            <section key={group.slug}>
              <div className="sec-head">
                <h2 className="sec-title">{group.name}</h2>
                <Link href={`/ai/${group.slug}`} className="sec-more">
                  {group.items.length} 篇 →
                </Link>
              </div>

              <div className="pcard divide-y divide-[var(--card-line)] px-4">
                {group.items.map((item) => (
                  <Link
                    key={item.key}
                    href={`/ai/${item.category}/${item.slug}`}
                    className="group flex items-baseline justify-between gap-4 py-3"
                  >
                    <span className="min-w-0 text-[13px] text-[var(--ink-soft)] transition-colors group-hover:text-[var(--accent)]">
                      {item.title}
                    </span>
                    <span className="shrink-0 text-[11px] text-[var(--muted)]">
                      {item.tags.slice(0, 2).join(" / ")}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

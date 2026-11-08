"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { AiSearchEntry } from "../../lib/aiDocs";

type Props = {
  entries: AiSearchEntry[];
  categories: { slug: string; name: string }[];
  initialQuery?: string;
};

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
      {/* 控件 */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
        <label className="flex h-10 w-full max-w-sm items-center gap-2 border border-[var(--line)] px-3 focus-within:border-[var(--accent)]">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
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

      {/* 分类筛选 */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setActiveCat("all")}
          className={`tag glass-inset transition-colors ${
            activeCat === "all"
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "hover:border-[var(--line-strong)]"
          }`}
        >
          全部
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setActiveCat(c.slug)}
            className={`tag glass-inset transition-colors ${
              activeCat === c.slug
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "hover:border-[var(--line-strong)]"
            }`}
          >
            {c.name}
            <span className="ml-1 opacity-55">{countOf.get(c.slug) ?? 0}</span>
          </button>
        ))}
      </div>

      {/* 结果 */}
      {grouped.length === 0 ? (
        <p className="py-16 text-[13px] text-[var(--muted)]">没有匹配的篇目。</p>
      ) : (
        <div className="mt-10 space-y-12">
          {grouped.map((group) => (
            <section key={group.slug}>
              <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-2.5">
                <h2 className="font-serif text-base font-bold text-[var(--ink)]">{group.name}</h2>
                <Link
                  href={`/ai/${group.slug}`}
                  className="text-[11.5px] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
                >
                  {group.items.length} →
                </Link>
              </div>

              <ul className="divide-y divide-[var(--line)]">
                {group.items.map((item) => (
                  <li key={item.key}>
                    <Link href={`/ai/${item.category}/${item.slug}`} className="group flex items-baseline justify-between gap-6 py-3.5">
                      <span className="min-w-0 text-[13.5px] text-[var(--ink-soft)] transition-colors group-hover:text-[var(--accent)]">
                        {item.title}
                      </span>
                      <span className="shrink-0 text-[11.5px] text-[var(--ink-soft)] opacity-80">
                        {item.tags.slice(0, 2).join(" / ")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

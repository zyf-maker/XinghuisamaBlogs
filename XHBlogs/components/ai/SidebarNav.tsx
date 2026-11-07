"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import type { AiCategoryWithDocs } from "../../lib/aiDocs";

type Props = {
  categories: AiCategoryWithDocs[];
  /** 当前所在分类，用于展开 */
  activeCategory?: string;
};

/**
 * 知识库左栏目录：分类折叠 + 篇目列表。
 * 文章页与分类页共用，移动端默认收起当前分类之外的组。
 */
export default function SidebarNav({ categories, activeCategory }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    activeCategory ? { [activeCategory]: true } : {},
  );

  const toggle = (slug: string) =>
    setOpen((prev) => ({ ...prev, [slug]: !prev[slug] }));

  return (
    <nav aria-label="知识库目录" className="text-[13px]">
      <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-2.5">
        <span className="eyebrow">目录</span>
        <Link
          href="/ai/all"
          className="font-mono text-[10px] tracking-[0.14em] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
        >
          全部篇目 →
        </Link>
      </div>

      <ul className="mt-1">
        {categories.map((cat) => {
          const expanded = open[cat.slug] ?? false;
          const isActiveCat = activeCategory === cat.slug;
          const catHref = `/ai/${cat.slug}`;

          return (
            <li key={cat.slug} className="border-b border-[var(--line)] last:border-b-0">
              <div className="flex items-stretch">
                <Link
                  href={catHref}
                  className={`min-w-0 flex-1 py-2.5 pr-2 transition-colors ${
                    isActiveCat
                      ? "text-[var(--accent)]"
                      : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                  }`}
                >
                  <span className="block truncate">{cat.name}</span>
                  <span className="mt-0.5 block font-mono text-[10px] tracking-[0.12em] text-[var(--muted)]">
                    {cat.en} · {cat.docs.length}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => toggle(cat.slug)}
                  aria-expanded={expanded}
                  aria-label={`${expanded ? "收起" : "展开"}${cat.name}`}
                  className="flex w-7 items-center justify-center text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              </div>

              {expanded ? (
                <ul className="mb-2 ml-1 border-l border-[var(--line)] pl-3">
                  {cat.docs.map((doc) => {
                    const href = `/ai/${cat.slug}/${doc.slug}`;
                    const isCurrent = pathname === href;
                    return (
                      <li key={doc.key}>
                        <Link
                          href={href}
                          className={`block py-1.5 text-[12.5px] leading-[1.6] transition-colors ${
                            isCurrent
                              ? "text-[var(--accent)]"
                              : "text-[var(--muted)] hover:text-[var(--ink)]"
                          }`}
                        >
                          {doc.title}
                        </Link>
                      </li>
                    );
                  })}
                  {cat.docs.length === 0 ? (
                    <li className="py-1.5 text-[12px] text-[var(--muted)]">待补充</li>
                  ) : null}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

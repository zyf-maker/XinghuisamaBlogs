"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { contentLinks } from "../lib/contentNav";
import { moduleLinks } from "../lib/moduleNav";

type Props = {
  /** 额外可选的统计，比如某栏目有多少条 */
  meta?: Record<string, string>;
  /** 是否在下面再挂一排 AI 模块入口 */
  showModules?: boolean;
};

/**
 * 博客内容栏目的侧栏。
 * 写作类页面（文章/随笔/手记/项目/相册/音乐/友链）都挂这一份，
 * 保证左侧导航在不同页面之间不跳位。
 */
export default function ContentSidebar({ meta, showModules = true }: Props) {
  const pathname = usePathname();
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <nav aria-label="栏目导航" className="text-[13px]">
      <div className="border-b border-[var(--line)] pb-2">
        <span className="eyebrow">栏目</span>
      </div>
      <ul className="mt-1">
        {contentLinks.map((l) => (
          <li key={l.href} className="border-b border-[var(--line)] last:border-b-0">
            <Link
              href={l.href}
              className={`flex items-baseline justify-between gap-2 py-2 transition-colors ${
                active(l.href) ? "text-[var(--accent)]" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              <span className="min-w-0 truncate">{l.label}</span>
              <span className="shrink-0 font-mono text-[10px] text-[var(--muted)]">
                {meta?.[l.href] ?? ""}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {showModules ? (
        <div className="mt-7">
          <div className="border-b border-[var(--line)] pb-2">
            <span className="eyebrow">AI 模块</span>
          </div>
          <ul className="mt-1">
            {moduleLinks.map((m) => (
              <li key={m.href} className="border-b border-[var(--line)] last:border-b-0">
                <Link
                  href={m.href}
                  className={`flex items-baseline justify-between gap-2 py-2 transition-colors ${
                    active(m.href) ? "text-[var(--accent)]" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                  }`}
                >
                  <span className="min-w-0 truncate">{m.label}</span>
                  <span className="shrink-0 font-mono text-[9.5px] tracking-[0.1em] text-[var(--muted)]">
                    {m.en.toUpperCase()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </nav>
  );
}

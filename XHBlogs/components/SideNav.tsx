"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = {
  label: string;
  href: string;
  /** 右侧的小字，比如篇数 */
  meta?: string;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

type Props = {
  sections: NavSection[];
  /** 顶部一行链接，比如「全部 →」 */
  footer?: { label: string; href: string };
};

/**
 * 通用左栏：分组的链接列表。
 * 工具库、提示词库、MCP、学习路线共用同一套视觉，
 * 避免每个模块各写一份侧栏、间距和选中态都不一样。
 */
export default function SideNav({ sections, footer }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <nav aria-label="模块导航" className="text-[13px]">
      {sections.map((section, si) => (
        <div key={section.title} className={si === 0 ? "" : "mt-7"}>
          <div className="border-b border-[var(--line)] pb-2">
            <span className="eyebrow">{section.title}</span>
          </div>
          <ul className="mt-1">
            {section.items.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href} className="border-b border-[var(--line)] last:border-b-0">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    title={item.label}
                    className={`-mx-2 flex items-baseline justify-between gap-2 px-2 py-2 transition-colors ${
                      active
                        ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)] shadow-[inset_2px_0_0_var(--accent)]"
                        : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                    }`}
                  >
                    <span className="min-w-0 leading-[1.45] line-clamp-2">{item.label}</span>
                    {item.meta ? (
                      <span
                        className={`shrink-0 font-mono text-[10px] ${
                          active ? "text-[var(--accent)]" : "text-[var(--muted)]"
                        }`}
                      >
                        {item.meta}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {footer ? (
        <Link
          href={footer.href}
          className="mt-6 inline-block font-mono text-[10px] tracking-[0.14em] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
        >
          {footer.label}
        </Link>
      ) : null}
    </nav>
  );
}

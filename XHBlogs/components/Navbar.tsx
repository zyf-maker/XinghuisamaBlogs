"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { siteConfig } from "../siteConfig";
import { useTheme } from "./ThemeProvider";

/**
 * 顶部导航。
 * 版式照参考站：通栏、56px 高、容器定宽，左品牌 + 一排文字菜单 + 右侧图标组。
 * 菜单项压到 10 个以内，其余收进「更多」——参考站也是这个密度。
 */
const navLinks = [
  { name: "首页", href: "/" },
  { name: "知识库", href: "/ai" },
  { name: "工具库", href: "/tools" },
  { name: "提示词", href: "/prompts" },
  { name: "MCP", href: "/mcp" },
  { name: "学习路线", href: "/learn" },
];

const moreLinks = [
  { name: "全部篇目", href: "/ai/all" },
  { name: "站内问答", href: "/ai/ask" },
  { name: "资讯", href: "/ai/news" },
  { name: "文章", href: "/timeline" },
  { name: "随笔", href: "/chatter" },
  { name: "手记", href: "/moments" },
  { name: "项目", href: "/projects" },
  { name: "相册", href: "/photowall" },
  { name: "音乐", href: "/music" },
  { name: "友链", href: "/friends" },
  { name: "关于", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMore(false);
  }, [pathname]);

  useEffect(() => {
    if (!more) return;
    const onDown = (e: MouseEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMore(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [more]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  const moreActive = moreLinks.some((l) => isActive(l.href));

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-200 ${
        scrolled ? "border-b border-[var(--card-line)] bg-[var(--card-bg-solid)]/92 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="wrap flex h-14 items-center gap-6">
        {/* 品牌 */}
        <Link href="/" className="flex shrink-0 items-baseline gap-1.5">
          <span className="text-[15.5px] font-extrabold tracking-[-0.01em] text-[var(--ink)]">
            {siteConfig.navTitle || siteConfig.title}
          </span>
        </Link>

        {/* 桌面菜单 */}
        <nav className="hidden min-w-0 flex-1 items-center gap-5 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap text-[13.5px] transition-colors ${
                isActive(link.href)
                  ? "font-medium text-[var(--accent)]"
                  : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMore((v) => !v)}
              aria-expanded={more}
              className={`flex items-center gap-1 whitespace-nowrap text-[13.5px] transition-colors ${
                moreActive ? "font-medium text-[var(--accent)]" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              更多
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {more && (
              <div className="absolute left-1/2 top-full z-50 w-[168px] -translate-x-1/2 pt-2">
                <div className="pcard overflow-hidden bg-[var(--card-bg-solid)] p-1.5">
                  {moreLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
                        isActive(link.href)
                          ? "text-[var(--accent)]"
                          : "text-[var(--ink-soft)] hover:bg-[var(--surface-alt)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* 右侧图标组 */}
        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <Link
            href="/ai/all"
            aria-label="搜索与全部篇目"
            className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--ink-soft)] transition-colors hover:bg-[var(--surface-alt)] hover:text-[var(--ink)]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l4.5 4.5" />
            </svg>
          </Link>
          <a
            href={siteConfig.social.github || "https://github.com/zyf-maker"}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="hidden h-9 w-9 items-center justify-center rounded-md text-[var(--ink-soft)] transition-colors hover:bg-[var(--surface-alt)] hover:text-[var(--ink)] sm:flex"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49l-.01-1.9c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.11-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.4 9.4 0 0 1 5 0c1.9-1.32 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.8-4.58 5.05.36.32.68.94.68 1.9l-.01 2.82c0 .27.18.6.69.49A10.03 10.03 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
            </svg>
          </a>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "切换到浅色" : "切换到深色"}
            className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--ink-soft)] transition-colors hover:bg-[var(--surface-alt)] hover:text-[var(--ink)]"
          >
            {isDark ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="4.2" />
                <path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20.5 14.6A8.6 8.6 0 1 1 9.4 3.5a7 7 0 0 0 11.1 11.1z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="菜单"
            className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--ink-soft)] transition-colors hover:bg-[var(--surface-alt)] lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.9">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* 移动端下拉：两列全量 */}
      {open && (
        <div className="max-h-[calc(100vh-3.5rem)] overflow-y-auto border-t border-[var(--card-line)] bg-[var(--card-bg-solid)] lg:hidden">
          <nav className="wrap grid grid-cols-2 gap-x-6 gap-y-0.5 py-3">
            {[...navLinks, ...moreLinks].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`border-b border-[var(--card-line)] py-2.5 text-[13.5px] ${
                  isActive(link.href) ? "text-[var(--accent)]" : "text-[var(--ink-soft)]"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

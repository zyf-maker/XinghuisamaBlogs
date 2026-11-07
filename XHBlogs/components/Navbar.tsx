"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { siteConfig } from '../siteConfig';
import { useTheme } from './ThemeProvider';

const navLinks = [
  { name: '首页', href: '/' },
  { name: '知识库', href: '/ai' },
  { name: '文章', href: '/timeline' },
  { name: '随笔', href: '/chatter' },
  { name: '手记', href: '/moments' },
  { name: '项目', href: '/projects' },
  { name: '相册', href: '/photowall' },
  { name: '音乐', href: '/music' },
  { name: '友链', href: '/friends' },
  { name: '关于', href: '/about' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'glass-bar border-b border-[var(--line)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 w-[92%] max-w-6xl items-center justify-between">
        {/* 品牌 */}
        <Link href="/" className="group flex items-baseline gap-2.5">
          <span className="font-serif text-[1.3rem] font-black tracking-tight text-[var(--ink)]">
            {siteConfig.navTitle || siteConfig.title}
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--muted)] sm:inline">
            {siteConfig.authorEn}
          </span>
        </Link>

        {/* 桌面导航 */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative py-1 text-[13.5px] transition-colors ${
                isActive(link.href)
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
            >
              {link.name}
              {isActive(link.href) && (
                <span className="absolute -bottom-0.5 left-0 h-px w-full bg-[var(--accent)]" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* 主题切换 */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? '切换到浅色' : '切换到深色'}
            className="flex h-11 w-11 items-center justify-center rounded-md border border-[var(--line)] text-[var(--ink-soft)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--accent)]"
          >
            {isDark ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="12" cy="12" r="4.2" />
                <path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M20.5 14.6A8.6 8.6 0 1 1 9.4 3.5a7 7 0 0 0 11.1 11.1z" />
              </svg>
            )}
          </button>

          {/* 移动端菜单 */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="菜单"
            className="flex h-11 w-11 items-center justify-center rounded-md border border-[var(--line)] text-[var(--ink-soft)] transition-colors hover:border-[var(--line-strong)] md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* 移动端下拉 */}
      {open && (
        <div className="border-t border-[var(--line)] bg-[var(--paper)] md:hidden">
          <nav className="mx-auto grid w-[92%] max-w-6xl grid-cols-2 gap-x-6 gap-y-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between border-b border-[var(--line)] py-2.5 text-sm ${
                  isActive(link.href) ? 'text-[var(--accent)]' : 'text-[var(--ink-soft)]'
                }`}
              >
                {link.name}
                <span className="font-mono text-[10px] text-[var(--muted)]">
                  {link.href === '/' ? '/' : link.href}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

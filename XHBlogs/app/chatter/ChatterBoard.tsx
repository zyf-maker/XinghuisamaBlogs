"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "../../siteConfig";
import { asset } from "../../lib/base";

type Chatter = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  mood?: string;
  cover?: string;
  content: string;
};

/**
 * 随笔列表。
 * 版式照参考站 /essay 的 Feed：单列宽卡 —— 上方头像 + 昵称 + 日期，
 * 中间标题与两三行摘要，底部标签。原先的瀑布流在只有一篇时会缩成左侧窄条，
 * 所以这里固定单列，条目多也只是往下排。
 */
export default function ChatterBoard({ chatters }: { chatters: Chatter[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("全部");

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    chatters.forEach((c) => c.tags?.forEach((t) => tags.add(t)));
    return ["全部", ...Array.from(tags)];
  }, [chatters]);

  const filteredChatters = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return chatters.filter((chatter) => {
      const matchSearch =
        query === "" ||
        chatter.title.toLowerCase().includes(query) ||
        chatter.content.toLowerCase().includes(query);
      const matchTag = activeTag === "全部" || chatter.tags?.includes(activeTag);
      return matchSearch && matchTag;
    });
  }, [chatters, searchQuery, activeTag]);

  return (
    <div className="w-full">
      <div className="mb-7 border-b border-[var(--line)] pb-6">
        <h1 className="text-[1.6rem] font-extrabold leading-[1.2] tracking-[-0.02em] text-[var(--ink)] sm:text-[1.95rem]">
          {siteConfig.chatterTitle || "随笔"}
        </h1>
        <p className="mt-3 max-w-2xl text-[13px] leading-[1.8] text-[var(--muted)]">
          {siteConfig.chatterDescription || "短记录与即时的判断。"}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="搜随笔…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-md border border-[var(--card-line)] bg-[var(--card-bg)] pl-9 pr-4 text-[13px] text-[var(--ink)] transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
          />
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`chip ${activeTag === tag ? "chip-on" : ""}`}
            >
              {tag === "全部" ? tag : `#${tag}`}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredChatters.map((chatter) => (
            <motion.div
              layout
              key={chatter.slug}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Link href={`/chatter/${chatter.slug}`} className="pcard group block p-4 sm:p-5">
                <div className="flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(siteConfig.avatarUrl)}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-full border border-[var(--card-line)]"
                  />
                  <span className="text-[12.5px] font-medium text-[var(--ink)]">{siteConfig.authorName}</span>
                  <span className="text-[11.5px] text-[var(--muted)]">{chatter.date}</span>
                  {chatter.mood && (
                    <span className="ml-auto shrink-0 rounded bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10.5px] text-[var(--accent)]">
                      {chatter.mood}
                    </span>
                  )}
                </div>

                {chatter.title && (
                  <h3 className="mt-2.5 text-[15px] font-semibold leading-[1.5] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                    {chatter.title}
                  </h3>
                )}

                <p className="mt-1.5 line-clamp-3 text-[13px] leading-[1.85] text-[var(--muted)]">{chatter.content}</p>

                {chatter.tags?.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {chatter.tags.map((t) => (
                      <span key={t} className="rounded bg-[var(--surface-alt)] px-1.5 py-0.5 text-[10.5px] text-[var(--muted)]">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredChatters.length === 0 && (
          <p className="py-16 text-center text-[13px] text-[var(--muted)]">没有匹配的随笔。</p>
        )}
      </div>
    </div>
  );
}

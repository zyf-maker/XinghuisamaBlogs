"use client";
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../../siteConfig';

type Chatter = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  mood?: string;
  cover?: string;
  content: string;
};

export default function ChatterBoard({ chatters }: { chatters: Chatter[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("全部");

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    chatters.forEach(c => c.tags?.forEach(t => tags.add(t)));
    return ["全部", ...Array.from(tags)];
  }, [chatters]);

  const filteredChatters = useMemo(() => {
    if (searchQuery.length > 0 && searchQuery.trim() === "") return [];
    const query = searchQuery.trim().toLowerCase();

    return chatters.filter(chatter => {
      const matchSearch = chatter.title.toLowerCase().includes(query) ||
                          chatter.content.toLowerCase().includes(query);
      const matchTag = activeTag === "全部" || chatter.tags?.includes(activeTag);
      return matchSearch && matchTag;
    });
  }, [chatters, searchQuery, activeTag]);

  return (
    // 🌟 核心修改：缩紧整体容器的左右边距 px-3 md:px-10
    <div className="w-full relative z-10">

      <div className="mb-8 md:mb-12 border-b border-[var(--line)] pb-8">
        <h1 className="font-serif text-[2rem] font-black leading-[1.15] tracking-tight text-[var(--ink)] sm:text-[2.5rem]">
          {siteConfig.chatterTitle || "随笔"}
        </h1>
        <p className="mt-3 max-w-2xl text-[13.5px] leading-[1.85] text-[var(--ink-soft)]">
          {siteConfig.chatterDescription || "短记录与即时的判断。"}
        </p>
      </div>

      <div className="mb-8 md:mb-12 flex flex-col items-center gap-5 md:gap-8">
        <div className="relative w-full max-w-lg group px-2 md:px-0">
          {/* 🌟 核心修改：搜索框在手机端更扁凑 */}
          <input
            type="text"
            placeholder="搜寻被遗忘的思绪..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--surface)] border border-[var(--line-strong)] rounded-md md:rounded-lg px-4 md:px-6 py-3 md:py-4 pl-10 md:pl-14 text-sm md:text-base text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted)] font-medium"
          />
          <svg className="w-4 h-4 md:w-6 md:h-6 absolute left-5 md:left-5 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>

        <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 px-2 md:px-0">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1.5 md:px-5 md:py-2 rounded-lg md:rounded-md text-[10px] md:text-xs font-black transition-all duration-500 border ${
                activeTag === tag 
                ? 'bg-[var(--accent)] text-[var(--accent-ink)] border-[var(--line-strong)] shadow-sm md:shadow-sm md:shadow-sm scale-105' 
                : 'bg-[var(--surface-alt)] text-[var(--accent)] border-[var(--line)] hover:bg-[var(--surface)]'
              }`}
            >
              {tag === "全部" ? tag : `# ${tag}`}
            </button>
          ))}
        </div>
      </div>

      {/* 🌟 核心修改 1：瀑布流直接设定为 columns-2，减小间距 gap-3 */}
      <motion.div layout className="columns-2 lg:columns-3 gap-3 md:gap-6 space-y-3 md:space-y-6">
        <AnimatePresence mode='popLayout'>
          {filteredChatters.map((chatter) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={chatter.slug}
              className="break-inside-avoid"
            >
              {/* 🌟 核心修改 2：卡片圆角缩小 rounded-lg */}
              <Link
                href={`/chatter/${chatter.slug}`}
                className="block rounded-lg md:rounded-lg bg-[var(--surface)] border border-[var(--line-strong)] transition-all duration-500 group relative overflow-hidden"
              >
                {chatter.cover && (
                  // 🌟 核心修改 3：图片高度自适应 h-28 -> h-52
                  <div className="w-full h-28 md:h-52 overflow-hidden relative">
                    <img src={chatter.cover} alt="cover" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0"></div>

                    {/* 🌟 核心修改 4：心情徽章微缩 */}
                    {chatter.mood && (
                      <span className="absolute top-2 right-2 md:top-4 md:right-4 bg-[var(--surface)] text-[var(--ink)] text-[8px] md:text-[10px] font-black px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-[var(--line)] uppercase tracking-widest">
                        {chatter.mood}
                      </span>
                    )}
                  </div>
                )}

                {/* 🌟 核心修改 5：内部 padding 极致压缩 p-3 md:p-7 */}
                <div className="p-3 md:p-7">
                  <div className="flex items-center justify-between mb-2 md:mb-4">
                    <div className="text-[8px] md:text-[10px] font-black text-[var(--accent)] uppercase tracking-wider md:tracking-[0.2em] bg-[var(--accent-soft)] px-1.5 py-0.5 md:px-3 md:py-1 rounded-md md:rounded-lg border border-[var(--line-strong)]">
                      {chatter.date}
                    </div>
                    {/* 心情展示 - 无封面版 */}
                    {!chatter.cover && chatter.mood && (
                      <div className="text-[8px] md:text-[10px] font-black text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 md:px-3 md:py-1 rounded-md md:rounded-lg border border-[var(--line-strong)]">
                        {chatter.mood}
                      </div>
                    )}
                  </div>

                  {chatter.title && (
                    // 🌟 核心修改 6：标题压缩 text-sm md:text-xl
                    <h3 className="text-sm md:text-xl font-bold text-[var(--ink)] mb-1.5 md:mb-4 leading-tight group-hover:text-[var(--accent)] transition-colors line-clamp-2 md:line-clamp-none">{chatter.title}</h3>
                  )}

                  {/* 🌟 核心修改 7：正文压缩，限制行数 */}
                  <div className="text-[10px] md:text-sm text-[var(--ink-soft)] leading-snug md:leading-relaxed line-clamp-4 md:line-clamp-5 opacity-90 font-medium italic">
                    {chatter.content}
                  </div>

                  {/* 🌟 核心修改 8：底部标签微缩 */}
                  {chatter.tags && chatter.tags.length > 0 && (
                    <div className="mt-3 md:mt-6 flex flex-wrap gap-1 md:gap-2">
                      {chatter.tags.map(t => (
                        <span key={t} className="text-[8px] md:text-[9px] font-black text-[var(--ink-soft)] bg-[var(--surface-alt)] px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-md border border-[var(--line)] transition-all group-hover:bg-[var(--accent-soft)] group-hover:text-[var(--accent)]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
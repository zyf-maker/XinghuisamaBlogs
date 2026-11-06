"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import BackButton from '../../components/BackButton';
import { friendsData } from '../../data/friends';
import Comments from '../../components/Comments'; // 🌟 引入你的 Gitalk 组件
import { siteConfig } from '../../siteConfig'; // 🌟 引入刚刚更新的全局配置文件

// Framer Motion 动画变体：交错子元素
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 } // 每张卡片延迟 0.15 秒出现
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function FriendsBoard() {
  // 🌟 控制复制按钮的状态
  const [isCopied, setIsCopied] = useState(false);

  // 🌟 直接从 siteConfig 读取申请格式
  const applyFormat = siteConfig.friendLinkApplyFormat;

  const handleCopy = () => {
    navigator.clipboard.writeText(applyFormat);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-10 py-6 md:py-10 relative z-10 scroll-smooth mt-20 md:mt-10">

      {/* 页首 */}
      <div className="mb-8 md:mb-10 border-b border-[var(--line)] pb-8 md:pb-9">
        <div className="mb-5 flex justify-start">
          <BackButton />
        </div>
        <p className="eyebrow">Links · {friendsData.length} 个</p>
        <h1 className="mt-3 font-serif text-[2rem] font-black leading-[1.15] tracking-tight text-[var(--ink)] sm:text-[2.5rem]">友链</h1>
        <p className="mt-3 max-w-2xl text-[13.5px] leading-[1.85] text-[var(--ink-soft)]">
          一些常读的站、常开的工具，以及常联系的人。
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5"
      >
        {friendsData.map((friend) => (
          <motion.div key={friend.id} variants={itemVariants} className="h-full">
            <a
              href={friend.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex h-full flex-col justify-between gap-4 rounded-md border border-[var(--line)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--line-strong)] md:p-5"
            >
              <div className="flex items-start gap-3">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="h-9 w-9 shrink-0 rounded-full border border-[var(--line)] bg-[var(--surface-alt)] object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-serif text-[15px] font-bold text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                    {friend.name}
                  </h2>
                  <p className="mt-0.5 truncate font-mono text-[10px] tracking-[0.08em] text-[var(--muted)]">
                    {friend.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </p>
                </div>
              </div>

              <p className="line-clamp-2 text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
                {friend.description}
              </p>
            </a>
          </motion.div>
        ))}
      </motion.div>

      {/* 申请友链引导区 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-14 border-t border-[var(--line)] pt-10 md:mt-20"
      >
        <div className="grid gap-8 md:grid-cols-[1fr_320px] md:gap-12">
          <div>
            <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-3">
              <h2 className="font-serif text-lg font-bold text-[var(--ink)]">交换友链</h2>
              <a href="#gitalk-container" className="font-mono text-[10px] tracking-[0.16em] text-[var(--muted)] hover:text-[var(--accent)]">
                去留言 →
              </a>
            </div>
            <p className="mt-4 max-w-xl text-[13px] leading-[1.9] text-[var(--ink-soft)]">
              复制下面这段格式，在页面底部的留言区提交即可。我会在一两天内加上。
            </p>
            <div className="relative mt-5 max-w-md rounded-md border border-[var(--line)] bg-[var(--surface-alt)] p-4">
              <pre className="whitespace-pre-wrap break-all pr-9 font-mono text-[11px] leading-relaxed text-[var(--ink)]">
                {applyFormat}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute right-2 top-2 rounded border border-[var(--line)] bg-[var(--surface)] p-1.5 text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                title="一键复制"
              >
                {isCopied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5 text-[var(--accent)]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3.5 w-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 019.75 12.375v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="eyebrow">Rules</p>
            <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
              <li>站点内容以原创为主，能正常访问。</li>
              <li>不接受纯采集站、导航站与广告站。</li>
              <li>加上后我会回访，长期不更新会移除。</li>
            </ul>
            <div className="mt-4 hairline" />
            <p className="mt-4 font-mono text-[10.5px] leading-relaxed text-[var(--muted)]">
              也可以直接邮件或在 GitHub 上找我。
            </p>
          </div>
        </div>
      </motion.div>

      {/* 评论区 */}
      <motion.div
        id="gitalk-container"
        className="mt-14 scroll-mt-24 border-t border-[var(--line)] pt-10 md:mt-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-5 flex items-baseline justify-between">
          <h3 className="font-serif text-lg font-bold text-[var(--ink)]">留言</h3>
          <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--muted)]">COMMENTS</span>
        </div>

        <Comments />
      </motion.div>

    </div>
  );
}
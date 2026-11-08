"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/**
 * 归档列表的一行：左侧日期栏 + 竖线节点，右侧白卡。
 * 版式照参考站 /news 的时间轴（左圆点 + 日期，右侧标题 + 摘要），
 * 不做左右交替——交替会逼出大片留白，也让阅读顺序变乱。
 */
export default function TimelineNode({ post, index }: { post: any; index: number }) {
  const date = String(post.date || "").split(" ")[0];
  const [y, m, d] = date.split("-");

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative flex gap-4 sm:gap-5"
    >
      {/* 左侧：日期 + 节点 */}
      <div className="relative flex w-[58px] shrink-0 flex-col items-end pt-[3px] sm:w-[74px]">
        <span className="text-[12px] font-semibold tabular-nums text-[var(--ink)]">
          {m && d ? `${Number(m)}月${Number(d)}日` : date}
        </span>
        <span className="mt-0.5 text-[11px] tabular-nums text-[var(--muted)]">{y}</span>
      </div>

      <div className="relative flex min-w-0 flex-1 gap-4 pb-4">
        {/* 竖线与圆点 */}
        <span className="absolute left-[3px] top-[9px] z-10 h-[7px] w-[7px] rounded-full bg-[var(--accent)] ring-4 ring-[var(--page-bg)]" aria-hidden />
        <span className="absolute left-[6px] top-[20px] bottom-0 w-px bg-[var(--card-line)]" aria-hidden />

        <Link
          href={`/posts/${post.slug}`}
          className="pcard group ml-4 min-w-0 flex-1 px-4 py-3.5 sm:px-5 sm:py-4"
        >
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="min-w-0 text-[14.5px] font-semibold leading-[1.5] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
              #{index} {post.title}
            </h3>
            <span className="hidden shrink-0 text-[11.5px] text-[var(--muted)] sm:block">
              {post.tags?.[0] ? `#${post.tags[0]}` : ""}
            </span>
          </div>
          {post.description && (
            <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-[1.8] text-[var(--muted)]">{post.description}</p>
          )}
          {post.tags?.length > 1 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {post.tags.slice(1).map((tag: string) => (
                <span key={tag} className="rounded bg-[var(--surface-alt)] px-1.5 py-0.5 text-[10.5px] text-[var(--muted)]">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Link>
      </div>
    </motion.article>
  );
}

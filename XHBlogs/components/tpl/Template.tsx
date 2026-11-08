import Link from "next/link";
import type { ReactNode } from "react";

/**
 * 页面首屏（参考站 ai.codefather.cn 的模板）：
 * 居中大标题 + 一行副标题 + 居中大搜索框 + 可选热门关键词。
 * 服务端组件，搜索框与热词用 children 传进来。
 */
export function PageHero({
  title,
  desc,
  children,
  align = "center",
}: {
  title: string;
  desc?: string;
  children?: ReactNode;
  align?: "center" | "left";
}) {
  const isCenter = align === "center";
  return (
    <section className={isCenter ? "text-center" : ""}>
      <h1
        className={`font-sans text-[1.85rem] font-extrabold leading-[1.2] tracking-[-0.02em] text-[var(--ink)] sm:text-[2.4rem] ${
          isCenter ? "mx-auto" : ""
        }`}
      >
        {title}
      </h1>
      {desc && (
        <p
          className={`mt-3 text-[13.5px] leading-[1.75] text-[var(--muted)] ${
            isCenter ? "mx-auto max-w-[640px]" : "max-w-[720px]"
          }`}
        >
          {desc}
        </p>
      )}
      {children && (
        <div className={`mt-6 ${isCenter ? "mx-auto w-full max-w-[672px]" : "w-full max-w-[672px]"}`}>
          {children}
        </div>
      )}
    </section>
  );
}

/** 区块头：左标题 + 右「更多 →」 */
export function SectionHead({
  title,
  more,
  href,
  extra,
}: {
  title: string;
  more?: string;
  href?: string;
  extra?: ReactNode;
}) {
  return (
    <div className="sec-head">
      <div className="flex min-w-0 items-baseline gap-3">
        <h2 className="sec-title shrink-0">{title}</h2>
        {extra}
      </div>
      {more && href && (
        <Link href={href} className="sec-more">
          {more} →
        </Link>
      )}
    </div>
  );
}

/** 右栏模块卡：标题 + 内容 */
export function RailCard({
  title,
  href,
  more,
  children,
  className = "",
}: {
  title: string;
  href?: string;
  more?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`pcard p-4 ${className}`}>
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <h3 className="text-[13.5px] font-bold text-[var(--ink)]">{title}</h3>
        {href && more && (
          <Link href={href} className="sec-more">
            {more}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

/** 数字榜：1-10 序号 + 标题，用于右栏热榜 */
export function NumList({ items }: { items: { title: string; href: string; meta?: string }[] }) {
  return (
    <div className="numlist">
      {items.map((it, i) => (
        <Link key={`${it.href}-${i}`} href={it.href}>
          <i>{i + 1}</i>
          <span className="min-w-0 flex-1 leading-[1.5] line-clamp-2">{it.title}</span>
          {it.meta && <span className="shrink-0 text-[11px] text-[var(--muted)]">{it.meta}</span>}
        </Link>
      ))}
    </div>
  );
}

/** 分页器：静态站点用「上一页 / 页码 / 下一页」，只渲染存在的页 */
export function Pager({
  page,
  total,
  makeHref,
}: {
  page: number;
  total: number;
  makeHref: (p: number) => string;
}) {
  if (total <= 1) return null;
  const nums: (number | "...")[] = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== "...") nums.push("...");
  }
  return (
    <nav className="pager" aria-label="分页">
      {page > 1 && <Link href={makeHref(page - 1)}>‹</Link>}
      {nums.map((n, i) =>
        n === "..." ? (
          <span key={`gap-${i}`} className="gap">
            …
          </span>
        ) : (
          <Link key={n} href={makeHref(n)} className={n === page ? "on" : ""}>
            {n}
          </Link>
        )
      )}
      {page < total && <Link href={makeHref(page + 1)}>›</Link>}
    </nav>
  );
}

/** 列表卡：左缩略图 + 右侧标题与摘要（参考站 /resource/learn 的样式） */
export function ListCard({
  href,
  title,
  desc,
  thumb,
  meta,
}: {
  href: string;
  title: string;
  desc: string;
  thumb?: string;
  meta?: string;
}) {
  return (
    <Link href={href} className="pcard flex gap-4 p-3">
      {thumb && (
        <div className="thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="min-w-0 flex-1 py-0.5">
        <h3 className="line-clamp-1 text-[14.5px] font-semibold text-[var(--ink)]">{title}</h3>
        <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-[1.75] text-[var(--muted)]">{desc}</p>
        {meta && <p className="mt-1.5 text-[11.5px] text-[var(--muted)] opacity-80">{meta}</p>}
      </div>
    </Link>
  );
}

/** 竖向图卡：图占大半 + 标题 + 标签（参考站 /painting 的样式） */
export function FigureCard({
  href,
  title,
  tags,
  figure,
  badge,
  ratio = "4 / 3",
}: {
  href: string;
  title: string;
  tags?: string;
  figure?: string;
  badge?: string;
  ratio?: string;
}) {
  return (
    <Link href={href} className="pcard group block overflow-hidden">
      <div className="card-figure" style={{ aspectRatio: ratio }}>
        {figure ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={figure} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full bg-[var(--surface-alt)]" />
        )}
        {badge && (
          <span className="absolute left-2 top-2 rounded-md bg-white/85 px-1.5 py-0.5 text-[10px] font-medium text-[var(--ink)] backdrop-blur-sm">
            {badge}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 text-[13.5px] font-semibold text-[var(--ink)]">{title}</h3>
        {tags && <p className="mt-1 line-clamp-1 text-[11.5px] text-[var(--muted)]">{tags}</p>}
      </div>
    </Link>
  );
}

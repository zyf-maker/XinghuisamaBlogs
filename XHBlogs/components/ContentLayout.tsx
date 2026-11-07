import type { ReactNode } from "react";

import ContentSidebar from "./ContentSidebar";

type Props = {
  children: ReactNode;
  /** 侧栏上每个栏目后面显示的数字，比如文章数、随笔数 */
  meta?: Record<string, string>;
  /** 内容区更宽时用（相册、音乐这类） */
  wide?: boolean;
  /** 页面底部多留白 */
  bottom?: string;
};

/**
 * 内容栏目的统一外壳：左栏固定导航 + 右侧正文。
 * 文章、随笔、手记、项目、相册、音乐、友链都套这一层，
 * 好处是切换栏目时正文的左边线不会跳。
 */
export default function ContentLayout({ children, meta, wide, bottom = "pb-24" }: Props) {
  return (
    <div className={`mx-auto w-[92%] ${wide ? "max-w-7xl" : "max-w-6xl"} ${bottom}`}>
      <div className="grid gap-10 pt-24 lg:grid-cols-[196px_minmax(0,1fr)] lg:gap-14">
        {/* 移动端：折叠 */}
        <details className="border-y border-[var(--line)] py-3 lg:hidden">
          <summary className="flex cursor-pointer items-center justify-between text-[13px] text-[var(--ink-soft)]">
            <span className="eyebrow">导航</span>
            <span className="font-mono text-[10px] text-[var(--muted)]">展开 / 收起</span>
          </summary>
          <div className="pt-4">
            <ContentSidebar meta={meta} />
          </div>
        </details>

        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
            <ContentSidebar meta={meta} />
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

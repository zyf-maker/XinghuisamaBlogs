import type { ReactNode } from "react";

/**
 * 空态：icon + 一句实话 + 一句解释。
 *
 * 站点目前没有正式内容，任何“列表为空”都必须是明确说明，
 * 不能只是一行浅灰小字 —— 那看起来像页面没加载完。
 */
export function EmptyState({
  title,
  hint,
  action,
  compact,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[var(--r-md)] border border-dashed border-[var(--card-line)] bg-[var(--surface)] px-6 text-center ${
        compact ? "py-10" : "py-16"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 text-[var(--ink-soft)]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 8.5V18a1.5 1.5 0 0 0 1.5 1.5h14a1.5 1.5 0 0 0 1.5-1.5V8.5m-17 0V6a1.5 1.5 0 0 1 1.5-1.5h5l2 2h6A1.5 1.5 0 0 1 20.5 8.5m-17 0h17" />
      </svg>
      <p className="mt-3 text-[14px] font-semibold text-[var(--ink)]">{title}</p>
      {hint && <p className="mt-1.5 max-w-[420px] text-[12.5px] leading-[1.8] text-[var(--ink-soft)]">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;

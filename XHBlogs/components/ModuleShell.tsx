import type { ReactNode } from "react";

type Props = {
  /** 左栏内容，桌面端 sticky */
  sidebar: ReactNode;
  children: ReactNode;
  /** 右侧可选的目录列 */
  aside?: ReactNode;
  /** 内容区最大宽度，文章页需要宽一些 */
  wide?: boolean;
};

/**
 * 知识库/工具库/提示词库等模块的统一三栏壳。
 * 手机上侧栏收在顶部，用 details 折叠，不占用首屏。
 */
export default function ModuleShell({ sidebar, children, aside, wide }: Props) {
  const cols = aside
    ? "lg:grid-cols-[196px_minmax(0,1fr)_236px]"
    : "lg:grid-cols-[210px_minmax(0,1fr)]";

  return (
    <div className={`mx-auto w-[92%] ${wide ? "max-w-6xl" : "max-w-5xl"} pb-24`}>
      <div className={`grid gap-10 pt-10 ${cols} lg:gap-10`}>
        {/* 移动端：折叠的目录 */}
        <details className="group border-y border-[var(--line)] lg:hidden">
          {/* 整条可点，不再只有几个小字是热区 */}
          <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 text-[13px] text-[var(--ink-soft)] marker:hidden">
            <span>目录</span>
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-[var(--muted)] transition-transform group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </summary>
          <div className="pb-4">{sidebar}</div>
        </details>

        <aside className="hidden lg:block">
          <div className="scroll-quiet sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1 hover:pr-2">
            {sidebar}
          </div>
        </aside>

        <div className="min-w-0">{children}</div>

        {aside ? (
          <aside className="hidden lg:block">
            <div className="sticky top-24">{aside}</div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}

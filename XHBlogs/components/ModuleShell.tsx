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
        <details className="border-y border-[var(--line)] py-3 lg:hidden">
          <summary className="flex cursor-pointer items-center justify-between text-[13px] text-[var(--ink-soft)]">
            <span className="eyebrow">目录</span>
            <span className="font-mono text-[10px] text-[var(--muted)]">展开 / 收起</span>
          </summary>
          <div className="pt-4">{sidebar}</div>
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

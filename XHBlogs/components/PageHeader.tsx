import type { ReactNode } from "react";

type Props = {
  /** 兼容旧调用，不再渲染。真正的信息只留标题与一句说明。 */
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

/**
 * 全站统一的页首：衬线大标题 + 一句说明 + 发丝分割线。
 * 刻意不渲染英文眉标与统计小字——那些东西堆在标题上方只会制造噪音。
 */
export default function PageHeader({ title, description, actions }: Props) {
  return (
    <header className="border-b border-[var(--line)] pb-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-serif text-[2rem] font-black leading-[1.15] tracking-tight text-[var(--ink)] sm:text-[2.4rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-2.5 max-w-xl text-[13.5px] leading-[1.85] text-[var(--ink-soft)]">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </header>
  );
}

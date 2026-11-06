import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

/**
 * 全站统一的页首：眉标 + 衬线大标题 + 一句说明 + 发丝分割线。
 * 所有内页都用它，保证节奏一致。
 */
export default function PageHeader({ eyebrow, title, description, actions }: Props) {
  return (
    <header className="border-b border-[var(--line)] pb-9">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 font-serif text-[2rem] font-black leading-[1.15] tracking-tight text-[var(--ink)] sm:text-[2.5rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-[13.5px] leading-[1.85] text-[var(--ink-soft)]">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </header>
  );
}

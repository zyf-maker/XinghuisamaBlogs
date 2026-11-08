import Link from "next/link";
import type { ReactNode } from "react";

import { getRecentDocs } from "../lib/aiDocs";
import { contentLinks } from "../lib/contentNav";
import { moduleLinks } from "../lib/moduleNav";
import { RailCard, NumList } from "./tpl/Template";

type Props = {
  children: ReactNode;
  /** 侧栏导航项后面显示的数字，比如文章数、随笔数 */
  meta?: Record<string, string>;
  /** 内容区更宽时用（相册、音乐这类） */
  wide?: boolean;
  /** 页面底部多留白 */
  bottom?: string;
};

/**
 * 内容栏目的统一外壳，版式照参考站的列表页：主体「左宽右窄」，
 * 左栏放实际内容，右栏 300px 放栏目导航、最近更新与模块入口。
 * 移动端右栏自然落到正文下方，不做折叠——参考站在手机上也这么处理。
 */
export default function ContentLayout({ children, meta, bottom = "pb-20" }: Props) {
  const recent = getRecentDocs(6);

  return (
    <div className={`wrap ${bottom}`}>
      <div className="split pt-10">
        <div className="min-w-0">{children}</div>

        <aside className="space-y-3">
          <RailCard title="栏目">
            <ul className="-my-0.5">
              {contentLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="flex items-baseline justify-between gap-2 py-1.5 text-[12.5px] text-[var(--ink-soft)] transition-colors hover:text-[var(--accent)]"
                  >
                    <span className="min-w-0 truncate">{l.label}</span>
                    <span className="shrink-0 text-[11px] text-[var(--muted)]">{meta?.[l.href] ?? ""}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </RailCard>

          <RailCard title="最近更新" href="/ai/all" more="更多">
            <NumList
              items={recent.map((d) => ({
                title: d.title,
                href: `/ai/${d.category}/${d.slug}`,
              }))}
            />
          </RailCard>

          <RailCard title="AI 模块">
            <ul className="-my-0.5">
              {moduleLinks.map((m) => (
                <li key={m.href}>
                  <Link
                    href={m.href}
                    className="block py-1.5 text-[12.5px] text-[var(--ink-soft)] transition-colors hover:text-[var(--accent)]"
                  >
                    {m.label}
                  </Link>
                </li>
              ))}
            </ul>
          </RailCard>
        </aside>
      </div>
    </div>
  );
}

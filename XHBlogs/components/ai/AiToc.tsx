"use client";

import { useEffect, useState } from "react";

type TocItem = { level: number; text: string; id: string };

/** 文章右侧目录：滚动高亮 + 平滑跳转。id 由 lib/markdown 统一生成。 */
export default function AiToc({ toc }: { toc: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (toc.length === 0) return;

    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (headings.length === 0) return;

    const onScroll = () => {
      const offset = 140;
      let current = headings[0].id;
      for (const el of headings) {
        if (el.getBoundingClientRect().top <= offset) current = el.id;
        else break;
      }
      setActiveId(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [toc]);

  if (toc.length === 0) return null;

  const jump = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: y, behavior: "smooth" });
    setActiveId(id);
  };

  return (
    <nav aria-label="本页目录" className="text-[12px]">
      <div className="border-b border-[var(--line)] pb-2.5">
        <span className="eyebrow">本页</span>
      </div>

      <ul className="mt-3 space-y-1.5 border-l border-[var(--line)]">
        {toc.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={(e) => jump(e, item.id)}
                className={`-ml-px block w-full border-l-2 py-0.5 pl-3 text-left leading-[1.6] transition-colors ${
                  isActive
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
                } ${item.level === 3 ? "pl-5 text-[11.5px]" : ""}`}
              >
                {item.text}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

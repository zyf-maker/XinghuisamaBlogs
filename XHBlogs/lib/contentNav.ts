// 个人内容栏目的导航，博客各页侧栏共用。
// 与 moduleNav（AI 模块）分开，避免侧栏一屏塞二十条。

export type ContentLink = {
  label: string;
  href: string;
  en: string;
};

export const contentLinks: ContentLink[] = [
  { label: "文章", href: "/timeline", en: "Archive" },
  { label: "随笔", href: "/chatter", en: "Notes" },
  { label: "手记", href: "/moments", en: "Moments" },
  { label: "项目", href: "/projects", en: "Projects" },
  { label: "相册", href: "/photowall", en: "Gallery" },
  { label: "音乐", href: "/music", en: "Music" },
  { label: "友链", href: "/friends", en: "Links" },
  { label: "关于", href: "/about", en: "About" },
];

/** 生成「内容栏目」分组的侧栏数据，排除当前页自己 */
export function contentSection(current: string, meta?: Record<string, string>) {
  return {
    title: "栏目",
    items: contentLinks.map((l) => ({
      label: l.label,
      href: l.href,
      meta: meta?.[l.href],
    })),
  };
}

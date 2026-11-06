// siteConfig.ts — 全站控制中心
// 站点：逸群不凡

export const siteConfig = {
  /* ---------------- 1. 站点身份 ---------------- */
  title: "逸群不凡",
  slogan: "以计算为笔，以思考为墨。",
  bio: "记录分子模拟、图神经网络与工程实践。一个在实验室与编辑器之间来回切换的人。",
  authorName: "逸群",
  authorEn: "YIQUN",
  authorTitle: "计算化学 · 图神经网络 · 软件工程",

  faviconUrl: "/favicon.svg",
  avatarUrl: "/avatar.svg",

  /* ---------------- 2. 导航品牌 ---------------- */
  navTitle: "逸群不凡",
  navSuffix: "",
  navAfter: "",

  /* ---------------- 3. 配色与背景 ---------------- */
  // 站点为暖纸/墨黑双主题，单一朱砂强调色，不再使用壁纸轮播
  useGradient: false,
  themeColors: ["#a8432b", "#c96a4a", "#8a3623", "#d97757"],
  bgImages: [],
  bgGroups: [{ id: "default", name: "默认", images: [] }],
  activeBgGroup: "default",

  defaultPostCover: "/og-default.svg",
  photoWallImage: "/og-default.svg",
  cloudMusicIds: ["1809646618", "3361076230", "1859390262"],

  /* ---------------- 4. 社交 ---------------- */
  social: {
    github: "https://github.com/zyf-maker",
    gitee: "",
    google: "",
    email: "",
    qq: "",
    wechat: "",
  },

  counts: {
    photos: 0,
  },

  /* ---------------- 5. 文案 ---------------- */
  chatterTitle: "随笔",
  chatterDescription: "研究笔记、工程实践与一些不成熟的判断。",

  danmakuList: [],

  /* ---------------- 6. 评论 ---------------- */
  gitalkConfig: {
    clientID: "",
    clientSecret: "",
    repo: "",
    owner: "",
    admin: [""],
  },

  /* ---------------- 7. 页脚 ---------------- */
  buildDate: "2026-03-23T00:00:00",
  footerBadges: [
    {
      name: "Next.js",
      color: "text-[var(--ink-soft)]",
      svg: "<path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z\"/>",
    },
    {
      name: "React",
      color: "text-[var(--ink-soft)]",
      svg: "<path d=\"M12 22.6l-9.8-5.6V5.6L12 0l9.8 5.6v11.4l-9.8 5.6zm-8.2-6.5l8.2 4.7 8.2-4.7V7.5L12 2.8 3.8 7.5v8.6z\"/>",
    },
    {
      name: "Tailwind",
      color: "text-[var(--ink-soft)]",
      svg: "<path d=\"M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624C13.666,10.618,15.027,12,18.001,12 c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624c1.177,1.194,2.538,2.576,5.512,2.576 c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C10.337,13.382,8.976,12,6.001,12z\"/>",
    },
  ],

  icpConfig: null as null | { name: string; link: string },

  /* ---------------- 8. AI 助手 ---------------- */
  aiConfig: {
    // 端点走 OpenAI 兼容协议
    baseUrl: "https://amr-link.open-design.ai/v1",
    modelId: "deepseek-v4.1-flash-eco",
    maxOutputTokens: 320,
    temperature: 0.7,
    // 助手人格
    systemPrompt:
      "你是「逸群不凡」博客的站内助手。回答用简体中文，克制、准确、不卖萌、不使用颜文字。\n" +
      "1. 最多三句话，能一句说清就不要两句。\n" +
      "2. 不臆造站内文章内容；不确定就直说不确定。\n" +
      "3. 涉及技术问题时给出具体做法，而不是笼统建议。",
  },

  friendLinkApplyFormat:
    "名称：逸群不凡\n简介：以计算为笔，以思考为墨。\n链接：https://xinghuisama-blogs-sandy.vercel.app\n头像：/avatar.svg",

  enableLevelSystem: false,
};

export type SiteConfig = typeof siteConfig;

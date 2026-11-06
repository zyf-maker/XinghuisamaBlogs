// 友链数据：手动维护，新增一条即可
export interface Friend {
  id: string;
  name: string;
  url: string;
  description: string;
  avatar: string;
  themeColor: string;
}

export const friendsData: Friend[] = [
  {
    id: "jianbai-resume",
    name: "简白 · 中文简历工具",
    url: "http://111.230.230.103/",
    description: "免费的中文简历编辑器，模板克制、导出干净，写完直接投。",
    avatar: "https://www.google.com/s2/favicons?domain=111.230.230.103&sz=64",
    themeColor: "rgba(168, 67, 43, 0.12)",
  },
  {
    id: "github-zyf",
    name: "GitHub · zyf-maker",
    url: "https://github.com/zyf-maker",
    description: "代码仓库与实验记录，分子模拟脚本、前端玩具都在这里。",
    avatar: "https://www.google.com/s2/favicons?domain=github.com&sz=64",
    themeColor: "rgba(22, 21, 15, 0.08)",
  },
  {
    id: "self",
    name: "逸群不凡",
    url: "https://xinghuisama-blogs-sandy.vercel.app",
    description: "本站：以计算为笔，以思考为墨。",
    avatar: "/avatar.svg",
    themeColor: "rgba(168, 67, 43, 0.12)",
  },
];

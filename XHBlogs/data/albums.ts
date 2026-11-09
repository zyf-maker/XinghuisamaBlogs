// 相册数据：手写维护。图片放在 public/gallery/ 下，路径以 / 开头。
export interface Photo { url: string; caption?: string; }
export interface Album { id: string; title: string; description: string; cover: string; date: string; photos: Photo[]; }

export const albums: Album[] = [
  {
    id: "md-study",
    title: "分子模拟笔记",
    description: "溶剂盒、轨迹与 RMSF 曲线——计算化学里那些能被画出来的部分。",
    cover: "/gallery/ai/md-1.jpg",
    date: "2026.03",
    photos: [
      { url: "/gallery/ai/md-1.jpg", caption: "溶剂盒：TIP3P，300 K" },
      { url: "/gallery/ai/md-2.jpg", caption: "RMSF 曲线：残基 1–128" },
    ],
  },
  {
    id: "graph-notes",
    title: "图网络手记",
    description: "消息传递、潜空间与那些在训练曲线上没有出现的直觉。",
    cover: "/gallery/ai/net-1.jpg",
    date: "2025.12",
    photos: [
      { url: "/gallery/ai/net-1.jpg", caption: "消息传递：第三层" },
      { url: "/gallery/ai/net-2.jpg", caption: "潜空间投影：UMAP 2D" },
    ],
  },
  {
    id: "city-walk",
    title: "城市切片",
    description: "在实验与代码之外，偶尔抬头看一眼城市的样子。",
    cover: "/gallery/ai/cn-1.jpg",
    date: "2025.10",
    photos: [
      { url: "/gallery/ai/cn-1.jpg", caption: "江边黄昏" },
      { url: "/gallery/ai/cn-2.jpg", caption: "末班地铁" },
    ],
  },
];

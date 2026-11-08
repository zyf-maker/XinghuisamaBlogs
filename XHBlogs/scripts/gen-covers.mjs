// 生成分类封面。
// 站内目前没有可用的真实配图，与其塞占位图，不如按分类名做确定性抽象图：
// 同一分类永远得到同一张图（种子来自 slug 的哈希），风格与站点一致
// （薄雾渐变 + 半透明几何 + 极淡网格），缩到卡片尺寸也不会糊。
//
// 用法：node scripts/gen-covers.mjs
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "public", "covers");

const palettes = [
  { a: "#b9d2da", b: "#dfe7ee", ink: "#5c7d88", accent: "#95412c" },
  { a: "#c6c8e4", b: "#e6e4f0", ink: "#6a6a92", accent: "#95412c" },
  { a: "#e2cfb4", b: "#f0e7d8", ink: "#8a7355", accent: "#95412c" },
  { a: "#bfd7c4", b: "#e2ebe3", ink: "#5f8067", accent: "#95412c" },
  { a: "#d8c9c0", b: "#efe7e1", ink: "#87695c", accent: "#95412c" },
  { a: "#c3ccd6", b: "#e4e8ec", ink: "#5f6e7c", accent: "#95412c" },
];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

// 简单可复现的伪随机
function rng(seed) {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function cover(slug) {
  const seed = hash(slug);
  const rand = rng(seed);
  const p = palettes[seed % palettes.length];
  const W = 1200;
  const H = 750;

  const blobs = Array.from({ length: 4 }, (_, i) => {
    const cx = Math.round(rand() * W);
    const cy = Math.round(rand() * H);
    const r = Math.round(180 + rand() * 260);
    const op = (0.28 + rand() * 0.26).toFixed(3);
    const fill = i % 2 === 0 ? p.a : p.b;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${op}" />`;
  }).join("");

  // 几条细弧线，作为「编辑感」的装饰
  const arcs = Array.from({ length: 3 }, (_, i) => {
    const cy = Math.round(H * (0.25 + i * 0.25));
    const r = Math.round(320 + rand() * 300);
    return `<circle cx="${Math.round(rand() * W)}" cy="${cy}" r="${r}" fill="none" stroke="${p.ink}" stroke-opacity="0.14" stroke-width="1" />`;
  }).join("");

  const grid = Array.from({ length: 11 }, (_, i) => {
    const x = Math.round((W / 10) * i);
    return `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${p.ink}" stroke-opacity="0.05" stroke-width="1" />`;
  }).join("");

  // 一片朱砂色的短横，全站唯一的彩色重音
  const barY = Math.round(H * 0.72);
  const barW = Math.round(60 + rand() * 90);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fffefc" />
      <stop offset="55%" stop-color="${p.b}" />
      <stop offset="100%" stop-color="${p.a}" />
    </linearGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="60" />
    </filter>
    <radialGradient id="vig" cx="0.5" cy="0.42" r="0.72">
      <stop offset="60%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#1c202e" stop-opacity="0.1" />
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)" />
  <g filter="url(#soft)">${blobs}</g>
  <g>${grid}</g>
  <g>${arcs}</g>
  <rect x="72" y="${barY}" width="${barW}" height="6" rx="3" fill="${p.accent}" opacity="0.85" />
  <rect width="${W}" height="${H}" fill="url(#vig)" />
</svg>
`;
}

const slugs = [
  // 大类
  "basics",
  "tooling",
  "practice",
  "getting-started",
  "platform",
  "news",
  // 分类
  "foundations",
  "prompt",
  "rag",
  "agent",
  "vibe",
  "coding",
  "engineering",
  "models",
  "tools",
  "build",
  "scenarios",
  "craft",
  "growth",
  "product",
  "start",
  "learning",
  "deepseek",
  "openclaw",
];

fs.mkdirSync(outDir, { recursive: true });
for (const slug of slugs) {
  fs.writeFileSync(path.join(outDir, `${slug}.svg`), cover(slug), "utf8");
}
console.log(`[covers] ${slugs.length} files -> public/covers/`);

// 生成分类封面。
// 站内没有可用真实配图，与其塞占位图，不如按分类名做确定性抽象图：
// 同一分类永远得到同一张图（种子来自 slug 的哈希），缩到卡片尺寸也不会糊。
//
// 两张图之间必须能一眼分开，所以每个 slug 都从色相环上取自己的角度，
// 再叠一个大号衬线首字母——只靠浅色渐变，五张卡排在一起就全是一个样。
//
// 用法：node scripts/gen-covers.mjs
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "public", "covers");

// 由 slug 决定色相，保证同族分类（foundations/prompt/rag/agent）落在大致相邻、
// 但彼此仍可分辨的角度上，避免整片卡片糊成一色。
const seeds = {
  basics: { hue: 202, glyph: "基" },
  tooling: { hue: 158, glyph: "工" },
  practice: { hue: 24, glyph: "实" },
  "getting-started": { hue: 268, glyph: "路" },
  platform: { hue: 186, glyph: "台" },
  news: { hue: 342, glyph: "讯" },
  foundations: { hue: 208, glyph: "原" },
  prompt: { hue: 190, glyph: "词" },
  rag: { hue: 172, glyph: "索" },
  agent: { hue: 220, glyph: "体" },
  vibe: { hue: 148, glyph: "编" },
  coding: { hue: 162, glyph: "码" },
  engineering: { hue: 132, glyph: "工" },
  models: { hue: 250, glyph: "模" },
  tools: { hue: 84, glyph: "器" },
  build: { hue: 32, glyph: "造" },
  scenarios: { hue: 16, glyph: "景" },
  craft: { hue: 8, glyph: "艺" },
  growth: { hue: 46, glyph: "长" },
  product: { hue: 350, glyph: "品" },
  start: { hue: 274, glyph: "始" },
  learning: { hue: 288, glyph: "学" },
  deepseek: { hue: 234, glyph: "深" },
  openclaw: { hue: 302, glyph: "爪" },
  // 学习路线：每条一个色相与首字，避免五张卡长得一样
  "route-beginner": { hue: 268, glyph: "零" },
  "route-engineer": { hue: 158, glyph: "工" },
  "route-rag": { hue: 190, glyph: "索" },
  "route-agent": { hue: 220, glyph: "体" },
  "route-product": { hue: 24, glyph: "品" },
};

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

const hsl = (h, s, l) => `hsl(${h} ${s}% ${l}%)`;

function cover(slug) {
  const meta = seeds[slug] ?? { hue: hash(slug) % 360, glyph: "·" };
  const seed = hash(slug);
  const rand = rng(seed);
  const W = 1200;
  const H = 750;
  const h0 = meta.hue;

  // 主色三档 + 一个补色重音，深度差拉大，卡片缩小后仍能看出层次
  const deep = hsl(h0, 46, 62);
  const mid = hsl(h0, 52, 78);
  const pale = hsl(h0, 46, 92);
  const accent = hsl((h0 + 168) % 360, 52, 46);

  const blobs = Array.from({ length: 4 }, (_, i) => {
    const cx = Math.round(rand() * W);
    const cy = Math.round(rand() * H);
    const r = Math.round(190 + rand() * 250);
    const op = (0.3 + rand() * 0.28).toFixed(3);
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${i % 2 === 0 ? deep : mid}" opacity="${op}" />`;
  }).join("");

  const grid = Array.from({ length: 11 }, (_, i) => {
    const x = Math.round((W / 10) * i);
    return `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${deep}" stroke-opacity="0.07" stroke-width="1" />`;
  }).join("");

  // 两条粗弧，形成方向感
  const arcs = Array.from({ length: 2 }, (_, i) => {
    const cy = Math.round(H * (0.3 + i * 0.45));
    const r = Math.round(360 + rand() * 260);
    return `<circle cx="${Math.round(rand() * W)}" cy="${cy}" r="${r}" fill="none" stroke="${deep}" stroke-opacity="0.22" stroke-width="${i === 0 ? 2 : 1}" />`;
  }).join("");

  // 大号衬线首字：一眼区分，且不抢正文标题
  const glyphX = Math.round(W * 0.5);
  const glyphY = Math.round(H * 0.64);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${pale}" />
      <stop offset="52%" stop-color="${mid}" />
      <stop offset="100%" stop-color="${deep}" />
    </linearGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="58" />
    </filter>
    <radialGradient id="vig" cx="0.42" cy="0.38" r="0.78">
      <stop offset="55%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#1c202e" stop-opacity="0.14" />
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)" />
  <g filter="url(#soft)">${blobs}</g>
  <g>${grid}</g>
  <g>${arcs}</g>
  <text x="${glyphX}" y="${glyphY}" text-anchor="middle" font-family="Songti SC, Source Han Serif SC, Noto Serif SC, serif" font-size="240" font-weight="700" fill="#fffefc" fill-opacity="0.8">${meta.glyph}</text>
  <rect x="${glyphX - 43}" y="${Math.round(H * 0.74)}" width="86" height="6" rx="3" fill="${accent}" />
  <rect width="${W}" height="${H}" fill="url(#vig)" />
</svg>
`;
}

fs.mkdirSync(outDir, { recursive: true });
for (const slug of Object.keys(seeds)) {
  fs.writeFileSync(path.join(outDir, `${slug}.svg`), cover(slug), "utf8");
}
console.log(`[covers] ${Object.keys(seeds).length} files -> public/covers/`);

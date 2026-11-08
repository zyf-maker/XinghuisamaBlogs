---
title: 从空目录到能访问的站
summary: 手搭 Next.js 静态站的最小工程、构建产物形状与 nginx 托管
order: 1
level: 入门
tags: [Next.js, 静态导出, 部署]
updated: 2026-11-08
readingTime: 5
---

一台空服务器、一个空目录，到浏览器里能打开页面，中间只有四件事：装依赖、写四个文件、构建、把 `out` 目录交给 nginx。看起来简单，卡人的地方全在第四步之后——路径、尾斜杠、404、缓存头，每一样都能让首页正常而内页全挂。

## 先确定要不要静态导出

笔记站的内容在构建时就已经定死了。启用 `output: "export"` 后，`next build` 把每个路由渲染成一个 html 文件，产物是纯静态资源，扔给 nginx 就行，服务器上不需要常驻 Node 进程，也不用担心内存和重启。

代价得在动手前想清楚：静态导出没有 route handler，没有 middleware，没有按需重新验证，`next/image` 的运行时优化也没有。一心想要「首页先跑起来」的站，用静态导出是对的；等以后要加流式问答这类接口，就得切回 `standalone`。这个切换本身不大，但 `next.config` 和部署脚本要重写一遍。我的习惯是先用静态导出把外壳立住，接口真的需要了再换。

## 最小工程只有四个文件

不用 create-next-app。脚手架的交互选项改过几轮，脚本化反而更慢，手写四个文件更快，也能看清每一行在做什么。

配置只有三行有用：

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
```

`output: "export"` 决定了整件事。`images.unoptimized` 不是可选项，静态导出下没有图像优化服务，不关掉构建会在导出阶段直接抛出 `Image Optimization using the default loader is not compatible with export.`，后面还跟着两条修改建议。`trailingSlash: true` 让 `/about` 产出 `about/index.html` 而不是 `about.html`，nginx 的 `try_files` 才对得上，否则要么 403，要么多写一条 rewrite。

根布局必须是服务端组件，且真的返回 `html` 和 `body`：

```tsx
export const metadata = { title: "逸群不凡" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

漏掉这两个标签，构建阶段就会抛 `Missing <html> and <body> tags in the root layout.`，并给出指向 missing-root-layout-tags 文档的提示。中文字体不要在 layout 里用 `next/font/google` 拉远程字体，构建机在墙内会卡到超时才报 `Failed to fetch \`Noto_Sans_SC\` from Google Fonts.`，一个和布局毫无关系的错。要用就直接下载 woff2 放本地，走 `next/font/local`。

## 构建产物是什么形状

`npm run build` 结束后，`out` 目录长这样：

```bash
$ find out -maxdepth 1
out
out/404.html
out/index.html
out/_next
out/about
```

`_next/static` 下是按路由切分的 js 和 css，文件名带内容哈希，可以放心设一年缓存。html 不能长缓存，每次构建都会变。这个区别是后面所有缓存配置的依据。

产物里没有 `server.js`，也没有 `.next`，这一点值得强调：很多人在 `out` 之外还想顺手把 `.next` 上传，其实毫无用处，静态站要的只有 `out`。文件名带哈希也意味着每次构建都在新增文件，服务器上保留最近两三版做回滚，旧版目录直接删，不要指望它自己清理。

首次构建最容易撞的是 Node 版本。`next` 的 `engines` 写的是 `>=20.9.0`，机器上如果还是 18，`next build` 在解析命令的那一刻就退出，原话是 `You are using Node.js 18.20.4. For Next.js, Node.js version ">=20.9.0" is required.`。用 nvm 切到 22 之后重新装依赖，不要拿旧 `node_modules` 硬跑，`sharp` 这类原生模块会带着旧 ABI 一起报错。

## 内容层不要用运行时 fs

页面上要列出笔记，最直觉的写法是在服务端组件里读目录。这在 `next dev` 和静态导出里都能跑，但导出时会被迫在构建期完成全部读取，任何一次 `fs.readFile` 抛出都会让整站构建失败，而报错栈指向的往往是某个具体文件，定位成本高。

写一层薄封装，把读取放在 `lib/posts.ts`，用 `gray-matter` 拆 frontmatter，顺手把缺字段的文件直接判失败：

```ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const DIR = path.join(process.cwd(), "content/notes");

export type Note = { slug: string; title: string; summary: string; order: number; tags: string[] };

export function listNotes(): Note[] {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".md"));
  const notes = files.map((file) => {
    const { data } = matter(fs.readFileSync(path.join(DIR, file), "utf8"));
    if (!data.title || typeof data.order !== "number") {
      throw new Error(`${file}: title 或 order 缺失`);
    }
    return { slug: file.replace(/\.md$/, ""), ...data } as Note;
  });
  return notes.sort((a, b) => a.order - b.order);
}
```

这段代码的价值在 `throw` 那一行。字段缺失时构建直接红掉，比线上渲染出一个 `undefined` 标题强得多。次序靠 frontmatter 里的 `order` 排，不靠文件名字典序，因为改名之后字典序会乱，而 `order` 是显式约定。

## 交给 nginx 的三行

```nginx
location / {
    root /var/www/blog/out;
    index index.html;
    try_files $uri $uri/ =404;
    error_page 404 /404.html;
}
```

三行各管一件事。`index index.html` 让目录请求落到它内部的 index；`$uri/` 让 `/about/` 这种带尾斜杠的请求去试目录；`=404` 把真正不存在的路径交出去，再由 `error_page` 换成自定义页。

漏掉 `index` 指令时，`/about/` 会命中一个存在但没有默认文档的目录，nginx 在 autoindex 关闭的情况下返回 403，而不是 404。这个区别很坑：403 看起来像权限问题，实际是缺一行配置。

`error_page 404 /404.html` 有个副作用：它会让 404 页面返回状态码 200，除非再加一句 `=404`。写全了是这样，`error_page 404 =404 /404.html;`，搜索引擎才不会把一堆软 404 收进索引。

## 三个真实踩过的坑

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 本地 `next dev` 正常，构建后内页全 404 | `trailingSlash` 与实际落盘文件名不一致 | 开启 `trailingSlash`，nginx 补 `$uri/index.html` |
| 中文文件名的路由线上 404，本地正常 | 路径编码在构建与请求两侧不一致 | 文件名只用英文短横线，中文只放在 frontmatter 里 |
| 部署后首屏样式闪一下才正常 | html 被缓存，引用的是上一版带哈希的 css | html 设 `no-cache`，静态资源设 `immutable` |

第三条的根因很具体：浏览器缓存了旧 html，里面的 `/_next/static/chunks/xxx.css` 已经在新构建里被删掉了，请求 404，页面裸奔到 js 执行完才补上样式。修法不是禁缓存，而是分开设：

```nginx
location /_next/static/ {
    root /var/www/blog/out;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 顺手加的一件事

构建完成后跑一遍产物自检，比人眼翻页面可靠：

```bash
test -f out/index.html || exit 1
test -f out/404.html || exit 1
grep -q "逸群不凡" out/index.html || exit 1
```

这三条放进部署脚本，任何一次构建把首页渲染空了都会当场失败，而不是等用户点进来发现白屏。静态站的好处是产物可以被这样粗暴地验证，坏处是没人会替你验证。

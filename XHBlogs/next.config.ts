import type { NextConfig } from "next";

// 站点已经跑在服务器上，图片由同一台机器的 nginx 直接给。
// 线上域名是 111.230.230.103，所以 /imgs/* 就是本机路径，不需要回源。
// 保留 IMG_ORIGIN 是为了在 Vercel 预览时还能取到图。
const IMG_ORIGIN = process.env.IMG_ORIGIN || "";

// 80 端口被简历站占着，服务器上博客挂在 /blog 子路径下。
// 走 Vercel 时留空，站点就在根路径。
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  // output: 'export',
  // 服务器上用 standalone 产物跑，不必把 node_modules 传上去
  output: "standalone",
  basePath: BASE_PATH || undefined,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  async rewrites() {
    if (!IMG_ORIGIN) return [];
    return [
      {
        source: "/imgs/:path*",
        destination: `${IMG_ORIGIN}/imgs/:path*`,
      },
    ];
  },
};

export default nextConfig;

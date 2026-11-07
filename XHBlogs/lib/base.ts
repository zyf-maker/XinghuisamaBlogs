// 站点可能挂在子路径下（服务器上 80 端口被简历站占着，博客走 /blog）。
// next/link 和 next 的静态资源会自动带 basePath，但手写的 <img src="/..."> 不会。
// 所有 public 下的静态资源都过一遍 asset()，本地/Vercel 时因为 basePath 为空等于原样返回。
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function asset(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${BASE_PATH}${path}`;
}

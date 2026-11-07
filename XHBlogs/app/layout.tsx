import 'katex/dist/katex.min.css';
import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { MusicProvider } from "../components/MusicProvider";
import FloatingPlayer from "../components/FloatingPlayer";
import { siteConfig } from "../siteConfig";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });
const notoSerif = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.title}`,
  },
  description: siteConfig.bio,
  metadataBase: new URL("https://xinghuisama-blogs-sandy.vercel.app"),
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.bio,
    type: "website",
    locale: "zh_CN",
    images: ["/og-default.svg"],
  },
  icons: {
    icon: [{ url: siteConfig.faviconUrl, type: "image/svg+xml" }],
    apple: siteConfig.faviconUrl,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="w-full overflow-x-hidden min-h-full flex flex-col relative bg-[var(--paper)] text-[var(--ink)]">
        <ThemeProvider>
          <MusicProvider>
            {/* 背景层：玻璃要「像玻璃」，背后必须有东西可采样。
                底色 + 几团大范围光斑 + 极细噪点，不画网格线：
                网格在 backdrop-filter 后面会被虚化成一片灰雾，
                既压低了文字对比度，又让人以为整页「蒙了一层」。
                靠光斑的明暗过渡提供采样内容就够了。 */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(146deg, #efe9dd 0%, #ece4d6 36%, #eae2d4 62%, #eee8dc 100%)",
                }}
              />
              <div
                className="absolute -left-[22vw] -top-[26vh] h-[74vw] w-[74vw] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(198,74,42,0.52) 0%, rgba(198,74,42,0.22) 34%, rgba(198,74,42,0) 66%)",
                  filter: "blur(46px)",
                }}
              />
              <div
                className="absolute -right-[20vw] top-[10vh] h-[68vw] w-[68vw] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(52,104,142,0.46) 0%, rgba(52,104,142,0.2) 36%, rgba(52,104,142,0) 68%)",
                  filter: "blur(50px)",
                }}
              />
              {/* 这两团压在正文栏下面：卡片必须「有事可采」，
                  否则玻璃只会是一块比纸更白的板子。 */}
              <div
                className="absolute left-[8vw] top-[34vh] h-[46vw] w-[46vw] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(206,96,50,0.56) 0%, rgba(206,96,50,0.24) 40%, rgba(214,120,66,0) 72%)",
                  filter: "blur(44px)",
                }}
              />
              <div
                className="absolute right-[10vw] top-[58vh] h-[42vw] w-[42vw] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(52,110,150,0.54) 0%, rgba(52,110,150,0.22) 40%, rgba(74,124,148,0) 72%)",
                  filter: "blur(42px)",
                }}
              />
              <div
                className="absolute bottom-[-26vh] left-[18vw] h-[62vw] w-[62vw] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(206,164,74,0.42) 0%, rgba(206,164,74,0.16) 38%, rgba(206,164,74,0) 70%)",
                  filter: "blur(46px)",
                }}
              />
              {/* 极细噪点，避免大面积渐变出现色带 */}
              <div
                className="absolute inset-0 opacity-[0.16] mix-blend-multiply"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
                }}
              />
            </div>

            <div className="relative z-10 flex-1 flex flex-col">{children}</div>

            <div className="hidden md:block">
              <FloatingPlayer />
            </div>
          </MusicProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

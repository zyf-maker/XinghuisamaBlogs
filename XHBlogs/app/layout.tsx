import 'katex/dist/katex.min.css';
import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { MusicProvider } from "../components/MusicProvider";
import FloatingPlayer from "../components/FloatingPlayer";
import { siteConfig } from "../siteConfig";
import { asset } from "../lib/base";

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
    images: [asset("/og-default.svg")],
  },
  icons: {
    icon: [{ url: asset(siteConfig.faviconUrl), type: "image/svg+xml" }],
    apple: asset(siteConfig.faviconUrl),
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
            {/* 背景层：mesh 渐变雾面。
                玻璃要「像玻璃」，背后必须有东西可采样，所以这里刻意保留了
                四团低饱和的有色光斑（青、蓝紫、赭、苔绿）——但都压在
                0.2~0.3 的强度，叠在近白的纸面上只会显出很淡的色温偏移，
                不会像早期那版高饱和广告底色。
                最后压一层极细噪点，避免大面积渐变在低色深屏幕上出现色带。 */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, #fcfbf9 0%, #f8f8f7 38%, #f5f6f7 68%, #fbfaf8 100%)",
                }}
              />
              <div
                className="absolute -left-[16vw] -top-[22vh] h-[74vh] w-[74vw] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(172,204,214,0.62) 0%, rgba(172,204,214,0.2) 44%, rgba(180,206,214,0) 72%)",
                  filter: "blur(70px)",
                }}
              />
              <div
                className="absolute -right-[14vw] -top-[8vh] h-[70vh] w-[62vw] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(193,197,235,0.58) 0%, rgba(193,197,235,0.18) 46%, rgba(196,200,232,0) 74%)",
                  filter: "blur(76px)",
                }}
              />
              <div
                className="absolute left-[6vw] top-[46vh] h-[62vh] w-[58vw] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(228,205,172,0.5) 0%, rgba(228,205,172,0.15) 46%, rgba(226,206,178,0) 74%)",
                  filter: "blur(80px)",
                }}
              />
              <div
                className="absolute -right-[8vw] bottom-[-16vh] h-[66vh] w-[56vw] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(180,214,192,0.52) 0%, rgba(180,214,192,0.16) 46%, rgba(186,214,196,0) 74%)",
                  filter: "blur(78px)",
                }}
              />
              <div
                className="absolute inset-0 opacity-[0.055] mix-blend-multiply"
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

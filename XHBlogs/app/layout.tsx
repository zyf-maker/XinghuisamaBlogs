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
            {/* 背景层：一张近乎中性的纸面。
                之前用五团高饱和光斑（朱砂/靛蓝/土黄）给玻璃做采样，
                结果是整页底色偏暖偏艳，看久了累眼。现在只留：
                一层极淡的暖灰渐变 + 两团几乎无色的柔光 + 细噪点。
                玻璃靠边缘高光和背景的一点点明暗差就够了，
                不需要把底色染成 advertisement 那种饱和度。 */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, #faf9f7 0%, #f8f7f5 34%, #f7f6f4 66%, #fbfaf8 100%)",
                }}
              />
              <div
                className="absolute -left-[18vw] -top-[20vh] h-[80vh] w-[80vw] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(226,221,212,0.34) 0%, rgba(226,221,212,0.12) 42%, rgba(226,221,212,0) 72%)",
                  filter: "blur(60px)",
                }}
              />
              <div
                className="absolute -right-[16vw] top-[42vh] h-[76vh] w-[70vw] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(214,219,222,0.3) 0%, rgba(214,219,222,0.1) 44%, rgba(214,219,222,0) 74%)",
                  filter: "blur(64px)",
                }}
              />
              <div
                className="absolute inset-0 opacity-[0.07] mix-blend-multiply"
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

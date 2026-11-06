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
      <body className="w-screen overflow-x-hidden min-h-full flex flex-col relative bg-[var(--paper)] text-[var(--ink)]">
        <ThemeProvider>
          <MusicProvider>
            {/* 极淡的纸纹网格：只在顶部有存在感，不抢内容 */}
            <div
              aria-hidden="true"
              className="fixed inset-0 z-0 pointer-events-none opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)",
                backgroundSize: "80px 80px",
                maskImage: "radial-gradient(circle at 50% 0%, rgba(0,0,0,0.6), transparent 70%)",
                WebkitMaskImage: "radial-gradient(circle at 50% 0%, rgba(0,0,0,0.6), transparent 70%)",
              }}
            />

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

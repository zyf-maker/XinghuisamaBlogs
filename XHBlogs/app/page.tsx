import { asset } from "../lib/base";
import fs from "fs";
import path from "path";
import Link from "next/link";
import matter from "gray-matter";

import Navbar from "../components/Navbar";
import PageTransition from "../components/PageTransition";
import MiniPlayer from "../components/MiniPlayer";
import HomeClock from "../components/HomeClock";
import { siteConfig } from "../siteConfig";
import { friendsData } from "../data/friends";
import { projectsData } from "../data/projects";
import { aiCategories } from "../data/aiCategories";
import { getStats } from "../lib/aiDocs";

type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
};

function readMarkdown(dir: string) {
  const full = path.join(process.cwd(), dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(full, file), "utf8"));
      return {
        slug: file.replace(/\.md$/, ""),
        title: (data.title as string) || "无题",
        description: (data.description as string) || content.trim().slice(0, 68),
        date: (data.date as string) || "1970-01-01",
        tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function short(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

const sections = [
  { href: "/ai", label: "知识库", desc: "AI 相关的工作笔记" },
  { href: "/timeline", label: "文章", desc: "长文与笔记归档" },
  { href: "/chatter", label: "随笔", desc: "短记录与即时判断" },
  { href: "/projects", label: "项目", desc: "代码与工具" },
  { href: "/about", label: "关于", desc: "我在做什么" },
];

export default function Home() {
  const posts = readMarkdown("posts") as Post[];
  const chatters = readMarkdown("chatters") as Post[];
  const latest = posts.slice(0, 4);
  const latestChatter = chatters.slice(0, 3);
  const projects = projectsData.slice(0, 3);
  const aiStats = getStats();

  return (
    <div className="min-h-screen">
      <Navbar />

      <PageTransition>
        <main className="mx-auto w-[92%] max-w-5xl pb-24">
          {/* ── 卷首 ── */}
          <header className="border-b border-[var(--line)] pb-14 pt-16 sm:pt-20">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Journal · {siteConfig.authorEn}</p>
              <HomeClock since={siteConfig.buildDate} />
            </div>

            <h1 className="mt-10 font-serif text-[2.6rem] font-black leading-[1.1] tracking-tight text-[var(--ink)] sm:text-[3.6rem]">
              {siteConfig.title}
            </h1>

            <p className="mt-5 max-w-2xl font-serif text-[15px] leading-[1.9] text-[var(--ink-soft)] sm:text-base">
              {siteConfig.bio}
            </p>

            <p className="mt-3 font-mono text-[11px] tracking-[0.18em] text-[var(--muted)]">{siteConfig.slogan}</p>

            <div className="mt-9 flex flex-wrap items-center gap-x-3 gap-y-3 text-[13px]">
              {sections.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="glass-inset group inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3.5 py-1.5 text-[var(--ink-soft)] backdrop-blur-md transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {s.label}
                  <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--muted)]">{s.desc}</span>
                </Link>
              ))}
            </div>
          </header>

          <div className="grid gap-12 pt-14 lg:grid-cols-[1fr_300px] lg:gap-14">
            {/* ── 左栏 ── */}
            <div className="min-w-0">
              {/* 知识库入口：这里是整个站的重心，放在最前 */}
              <section>
                <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-3">
                  <h2 className="font-serif text-lg font-bold text-[var(--ink)]">AI 知识库</h2>
                  <Link href="/ai" className="font-mono text-[10px] tracking-[0.16em] text-[var(--muted)] hover:text-[var(--accent)]">
                    {aiStats.docs} 篇 →
                  </Link>
                </div>

                <Link href="/ai" className="glass glass-sheen group mt-5 block p-6 transition-transform duration-300 hover:-translate-y-0.5">
                  <div className="flex items-baseline justify-between">
                    <p className="font-mono text-[10px] tracking-[0.18em] text-[var(--muted)]">
                      KNOWLEDGE BASE · {aiStats.categories} GROUPS
                    </p>
                    <span className="font-mono text-[10px] text-[var(--muted)] transition-colors group-hover:text-[var(--accent)]">
                      进入 ↗
                    </span>
                  </div>
                  <p className="mt-3 font-serif text-[17px] font-bold leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                    从模型基础到产品变形的八组笔记
                  </p>
                  <p className="mt-2 text-[12.5px] leading-[1.85] text-[var(--ink-soft)]">
                    分词、采样、上下文、提示词、工具调用、检索、评测、选型与变现。
                    每篇都从一个具体问题出发，给出可执行的参数和踩过的坑。
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {aiCategories.map((c) => (
                      <span key={c.slug} className="tag">
                        {c.name}
                      </span>
                    ))}
                  </div>
                </Link>
              </section>

              <section className="mt-14">
                <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-3">
                  <h2 className="font-serif text-lg font-bold text-[var(--ink)]">最近文章</h2>
                  <Link href="/timeline" className="font-mono text-[10px] tracking-[0.16em] text-[var(--muted)] hover:text-[var(--accent)]">
                    ALL {posts.length} →
                  </Link>
                </div>

                {latest.length === 0 ? (
                  <p className="py-10 text-[13px] text-[var(--muted)]">还没有文章。</p>
                ) : (
                  <ol className="divide-y divide-[var(--line)]">
                    {latest.map((post, i) => (
                      <li key={post.slug}>
                        <Link href={`/posts/${post.slug}`} className="group flex gap-4 py-6 sm:gap-6">
                          <span className="w-6 shrink-0 pt-1 font-mono text-[11px] text-[var(--muted)]">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                              <h3 className="font-serif text-[17px] font-bold leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                                {post.title}
                              </h3>
                              <span className="font-mono text-[10px] tracking-[0.12em] text-[var(--muted)]">{short(post.date)}</span>
                            </div>
                            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[var(--ink-soft)]">{post.description}</p>
                            {post.tags.length > 0 && (
                              <div className="mt-2.5 flex flex-wrap gap-1.5">
                                {post.tags.slice(0, 4).map((tag) => (
                                  <span key={tag} className="tag">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <section className="mt-14">
                <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-3">
                  <h2 className="font-serif text-lg font-bold text-[var(--ink)]">{siteConfig.chatterTitle}</h2>
                  <Link href="/chatter" className="font-mono text-[10px] tracking-[0.16em] text-[var(--muted)] hover:text-[var(--accent)]">
                    ALL →
                  </Link>
                </div>
                <ul className="divide-y divide-[var(--line)]">
                  {latestChatter.map((c) => (
                    <li key={c.slug}>
                      <Link href={`/chatter/${c.slug}`} className="group block py-5">
                        <div className="flex items-baseline justify-between gap-4">
                          <h3 className="font-serif text-[15px] font-bold text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                            {c.title}
                          </h3>
                          <span className="shrink-0 font-mono text-[10px] text-[var(--muted)]">{short(c.date)}</span>
                        </div>
                        <p className="mt-1 line-clamp-1 text-[12.5px] text-[var(--ink-soft)]">{c.description}</p>
                      </Link>
                    </li>
                  ))}
                  {latestChatter.length === 0 && <li className="py-8 text-[13px] text-[var(--muted)]">还没有随笔。</li>}
                </ul>
              </section>

              <section className="mt-14">
                <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-3">
                  <h2 className="font-serif text-lg font-bold text-[var(--ink)]">项目</h2>
                  <Link href="/projects" className="font-mono text-[10px] tracking-[0.16em] text-[var(--muted)] hover:text-[var(--accent)]">
                    ALL →
                  </Link>
                </div>
                <ul className="divide-y divide-[var(--line)]">
                  {projects.map((p) => (
                    <li key={p.id} className="py-5">
                      <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="group block">
                        <div className="flex items-baseline justify-between gap-4">
                          <h3 className="font-serif text-[15px] font-bold text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                            {p.name}
                          </h3>
                          <span className="shrink-0 font-mono text-[10px] text-[var(--muted)]">GITHUB ↗</span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-[var(--ink-soft)]">{p.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {p.tags.map((t) => (
                            <span key={t} className="tag">
                              {t}
                            </span>
                          ))}
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-14">
                <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-3">
                  <h2 className="font-serif text-lg font-bold text-[var(--ink)]">友链</h2>
                  <Link href="/friends" className="font-mono text-[10px] tracking-[0.16em] text-[var(--muted)] hover:text-[var(--accent)]">
                    ALL →
                  </Link>
                </div>
                <ul className="divide-y divide-[var(--line)]">
                  {friendsData.slice(0, 4).map((f) => (
                    <li key={f.id}>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-baseline justify-between gap-4 py-4"
                      >
                        <div className="min-w-0">
                          <span className="font-serif text-[14px] font-bold text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                            {f.name}
                          </span>
                          <span className="ml-3 text-[12px] text-[var(--muted)]">{f.description}</span>
                        </div>
                        <span className="shrink-0 font-mono text-[10px] text-[var(--muted)]">↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* ── 右栏 ── */}
            <aside className="space-y-6">
              <MiniPlayer />

              <div className="glass glass-sheen p-5">
                <p className="eyebrow">Profile</p>
                <div className="mt-3 flex items-center gap-3">
                  <img src={asset(siteConfig.avatarUrl)} alt={siteConfig.authorName} className="h-12 w-12 rounded-full border border-[var(--line)]" />
                  <div>
                    <p className="font-serif text-[15px] font-bold text-[var(--ink)]">{siteConfig.authorName}</p>
                    <p className="mt-0.5 text-[11.5px] text-[var(--muted)]">{siteConfig.authorTitle}</p>
                  </div>
                </div>
                <div className="mt-4 hairline" />
                <dl className="mt-4 space-y-2 font-mono text-[11px] text-[var(--muted)]">
                  <div className="flex justify-between">
                    <dt>文章</dt>
                    <dd className="text-[var(--ink-soft)]">{posts.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>随笔</dt>
                    <dd className="text-[var(--ink-soft)]">{chatters.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>项目</dt>
                    <dd className="text-[var(--ink-soft)]">{projectsData.length}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  {siteConfig.social?.github && (
                    <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" className="btn-ghost px-3 py-1.5 text-[12px]">
                      GitHub ★
                    </a>
                  )}
                  <Link href="/about" className="btn-accent px-3 py-1.5 text-[12px]">
                    关于我
                  </Link>
                </div>
              </div>

              <div className="glass glass-sheen p-5">
                <p className="eyebrow">Bookmarks</p>
                <ul className="mt-3 space-y-2.5">
                  <li>
                    <a
                      href="http://111.230.230.103/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between text-[13px] text-[var(--ink-soft)] transition-colors hover:text-[var(--accent)]"
                    >
                      <span>简白 · 中文简历工具</span>
                      <span className="font-mono text-[10px] text-[var(--muted)]">↗</span>
                    </a>
                  </li>
                  <li>
                    <Link href="/photowall" className="group flex items-center justify-between text-[13px] text-[var(--ink-soft)] transition-colors hover:text-[var(--accent)]">
                      <span>相册</span>
                      <span className="font-mono text-[10px] text-[var(--muted)]">↗</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/music" className="group flex items-center justify-between text-[13px] text-[var(--ink-soft)] transition-colors hover:text-[var(--accent)]">
                      <span>音乐</span>
                      <span className="font-mono text-[10px] text-[var(--muted)]">↗</span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="glass-flat p-5">
                <p className="eyebrow">Colophon</p>
                <p className="mt-3 text-[12px] leading-relaxed text-[var(--muted)]">
                  Next.js · React · Tailwind CSS。标题用思源宋体，正文用无衬线，单一朱砂色作为强调。
                </p>
              </div>
            </aside>
          </div>
        </main>
      </PageTransition>

      <footer className="border-t border-[var(--line)]">
        <div className="mx-auto flex w-[92%] max-w-5xl flex-col items-start justify-between gap-3 py-8 sm:flex-row sm:items-center">
          <p className="font-mono text-[10.5px] tracking-[0.16em] text-[var(--muted)]">
            © {new Date().getFullYear()} {siteConfig.title} · {siteConfig.authorEn}
          </p>
          <div className="flex flex-wrap gap-3">
            {siteConfig.footerBadges?.map((b) => (
              <span key={b.name} className="tag">
                {b.name}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

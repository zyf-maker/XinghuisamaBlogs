import { asset } from "../lib/base";
import fs from "fs";
import path from "path";
import Link from "next/link";
import matter from "gray-matter";

import Navbar from "../components/Navbar";
import PageTransition from "../components/PageTransition";
import SearchBox from "../components/SearchBox";
import HomeClock from "../components/HomeClock";
import { siteConfig } from "../siteConfig";
import { friendsData } from "../data/friends";
import { projectsData } from "../data/projects";
import { aiGroups } from "../data/aiCategories";
import { getGroups, getRecentDocs } from "../lib/aiDocs";
import { getSearchItems } from "../lib/siteSearch";
import { moduleLinks } from "../lib/moduleNav";
import { promptsData } from "../data/prompts";
import { toolsData } from "../data/tools";

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

/** 首页只做入口，不堆统计 */
export default function Home() {
  const posts = readMarkdown("posts") as Post[];
  const chatters = readMarkdown("chatters") as Post[];
  const latest = posts.slice(0, 4);
  const latestChatter = chatters.slice(0, 3);
  const projects = projectsData.slice(0, 3);

  const groups = getGroups();
  const recentDocs = getRecentDocs(5);
  const searchItems = getSearchItems();

  // 大类没内容时也要有入口，所以用静态定义兜底
  const groupCards = aiGroups.map((g) => {
    const hit = groups.find((x) => x.slug === g.slug);
    return { ...g, docCount: hit?.docCount ?? 0 };
  });

  return (
    <div className="min-h-screen">
      <Navbar />

      <PageTransition>
        <main className="mx-auto w-[92%] max-w-6xl pb-24">
          {/* ── 卷首：玻璃大卡，搜索框压在里面 ── */}
          <section className="pt-12 sm:pt-16">
            <div className="glass-card glass-sheen overflow-hidden p-7 sm:p-11">
              <div className="flex items-start justify-between gap-4">
                <p className="text-[11px] tracking-[0.2em] text-[var(--muted)]">{siteConfig.slogan}</p>
                <HomeClock since={siteConfig.buildDate} />
              </div>

              <h1 className="mt-7 font-serif text-[2.35rem] font-black leading-[1.08] tracking-tight text-[var(--ink)] sm:text-[3.4rem]">
                {siteConfig.title}
              </h1>

              <p className="mt-4 max-w-2xl text-[14.5px] leading-[1.9] text-[var(--ink-soft)] sm:text-[15.5px]">
                {siteConfig.bio}
              </p>

              <div className="mt-8 max-w-2xl">
                <SearchBox items={searchItems} limit={10} placeholder="搜笔记、工具或提示词" />
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {moduleLinks.map((m) => (
                  <Link
                    key={m.href}
                    href={m.href}
                    className="glass-pill px-3.5 py-1.5 text-[12.5px] text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {m.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* ── 大类：bento 网格，左栏是入口而不是再套一层分类 ── */}
          <section className="mt-14">
            <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-3">
              <h2 className="font-serif text-lg font-bold text-[var(--ink)]">知识库</h2>
              <Link href="/ai" className="text-[11px] text-[var(--muted)] hover:text-[var(--accent)]">
                全部 →
              </Link>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groupCards.map((g) => (
                <Link
                  key={g.slug}
                  href={`/ai#${g.slug}`}
                  className="glass-card glass-sheen group relative overflow-hidden"
                >
                  <div className="relative h-24 w-full overflow-hidden">
                    <img
                      src={asset(`/covers/${g.slug}.svg`)}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-transparent to-transparent" />
                  </div>
                  <div className="p-5 pt-3">
                    <h3 className="font-serif text-[1.05rem] font-bold text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                      {g.name}
                    </h3>
                    <p className="mt-1.5 text-[12.5px] leading-[1.8] text-[var(--ink-soft)]">{g.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ── 最近更新 ── */}
          {recentDocs.length > 0 && (
            <section className="mt-14">
              <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-3">
                <h2 className="font-serif text-lg font-bold text-[var(--ink)]">最近更新</h2>
                <Link href="/ai/all" className="text-[11px] text-[var(--muted)] hover:text-[var(--accent)]">
                  全部篇目 →
                </Link>
              </div>
              <ol className="divide-y divide-[var(--line)]">
                {recentDocs.map((doc) => (
                  <li key={doc.key}>
                    <Link href={`/ai/${doc.category}/${doc.slug}`} className="group block py-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h3 className="font-serif text-[15.5px] font-bold text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                          {doc.title}
                        </h3>
                        <span className="shrink-0 text-[11.5px] text-[var(--muted)]">{doc.categoryName}</span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-[1.8] text-[var(--ink-soft)]">{doc.summary}</p>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* ── 双栏：写作 / 侧栏 ── */}
          <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
            <div className="min-w-0">
              <section>
                <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-3">
                  <h2 className="font-serif text-lg font-bold text-[var(--ink)]">最近文章</h2>
                  <Link href="/timeline" className="text-[11px] text-[var(--muted)] hover:text-[var(--accent)]">
                    全部 →
                  </Link>
                </div>

                {latest.length === 0 ? (
                  <p className="py-10 text-[13px] text-[var(--muted)]">还没有文章。</p>
                ) : (
                  <ol className="divide-y divide-[var(--line)]">
                    {latest.map((post) => (
                      <li key={post.slug}>
                        <Link href={`/posts/${post.slug}`} className="group block py-6">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                            <h3 className="font-serif text-[17px] font-bold leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                              {post.title}
                            </h3>
                            <span className="shrink-0 text-[11.5px] text-[var(--muted)]">{short(post.date)}</span>
                          </div>
                          <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-[1.8] text-[var(--ink-soft)]">
                            {post.description}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <section className="mt-12">
                <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-3">
                  <h2 className="font-serif text-lg font-bold text-[var(--ink)]">{siteConfig.chatterTitle}</h2>
                  <Link href="/chatter" className="text-[11px] text-[var(--muted)] hover:text-[var(--accent)]">
                    全部 →
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
                          <span className="shrink-0 text-[11px] text-[var(--muted)]">{short(c.date)}</span>
                        </div>
                        <p className="mt-1 line-clamp-1 text-[12.5px] text-[var(--ink-soft)]">{c.description}</p>
                      </Link>
                    </li>
                  ))}
                  {latestChatter.length === 0 && <li className="py-8 text-[13px] text-[var(--muted)]">还没有随笔。</li>}
                </ul>
              </section>

              <section className="mt-12">
                <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-3">
                  <h2 className="font-serif text-lg font-bold text-[var(--ink)]">项目</h2>
                  <Link href="/projects" className="text-[11px] text-[var(--muted)] hover:text-[var(--accent)]">
                    全部 →
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
                          <span className="shrink-0 text-[11px] text-[var(--muted)]">GitHub ↗</span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
                          {p.description}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* ── 右栏 ── */}
            <aside className="space-y-3">
              <div className="glass-flat p-5">
                <div className="flex items-center gap-3">
                  <img
                    src={asset(siteConfig.avatarUrl)}
                    alt={siteConfig.authorName}
                    className="h-12 w-12 rounded-full border border-[var(--glass-border)]"
                  />
                  <div className="min-w-0">
                    <p className="font-serif text-[15px] font-bold text-[var(--ink)]">{siteConfig.authorName}</p>
                    <p className="mt-0.5 text-[11.5px] text-[var(--muted)]">{siteConfig.authorTitle}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {siteConfig.social?.github && (
                    <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" className="btn-ghost px-3 py-1.5 text-[12px]">
                      GitHub
                    </a>
                  )}
                  <Link href="/about" className="btn-accent px-3 py-1.5 text-[12px]">
                    关于我
                  </Link>
                </div>
              </div>

              <div className="glass-flat p-5">
                <p className="text-[12px] font-medium text-[var(--ink-soft)]">资料</p>
                <ul className="mt-3 space-y-2.5">
                  <li>
                    <Link href="/tools" className="flex items-center justify-between text-[13px] text-[var(--ink-soft)] hover:text-[var(--accent)]">
                      <span>工具库</span>
                      <span className="text-[11px] text-[var(--muted)]">{toolsData.length}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/prompts" className="flex items-center justify-between text-[13px] text-[var(--ink-soft)] hover:text-[var(--accent)]">
                      <span>提示词</span>
                      <span className="text-[11px] text-[var(--muted)]">{promptsData.length}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/mcp" className="flex items-center justify-between text-[13px] text-[var(--ink-soft)] hover:text-[var(--accent)]">
                      <span>MCP 与 Skills</span>
                      <span className="text-[11px] text-[var(--muted)]">↗</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/learn" className="flex items-center justify-between text-[13px] text-[var(--ink-soft)] hover:text-[var(--accent)]">
                      <span>学习路线</span>
                      <span className="text-[11px] text-[var(--muted)]">↗</span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="glass-flat p-5">
                <p className="text-[12px] font-medium text-[var(--ink-soft)]">友链</p>
                <ul className="mt-3 space-y-2.5">
                  {friendsData.slice(0, 4).map((f) => (
                    <li key={f.id}>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between text-[13px] text-[var(--ink-soft)] hover:text-[var(--accent)]"
                      >
                        <span className="min-w-0 truncate">{f.name}</span>
                        <span className="shrink-0 text-[11px] text-[var(--muted)]">↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </main>
      </PageTransition>

      <footer className="border-t border-[var(--line)]">
        <div className="mx-auto flex w-[92%] max-w-6xl flex-col items-start justify-between gap-3 py-8 sm:flex-row sm:items-center">
          <p className="text-[11px] tracking-[0.14em] text-[var(--muted)]">
            © {new Date().getFullYear()} {siteConfig.title} · {siteConfig.authorEn}
          </p>
          <div className="flex flex-wrap gap-2">
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

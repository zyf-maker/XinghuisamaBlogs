import { asset } from "../lib/base";
import fs from "fs";
import path from "path";
import Link from "next/link";
import matter from "gray-matter";

import Navbar from "../components/Navbar";
import PageTransition from "../components/PageTransition";
import SearchBox from "../components/SearchBox";
import { RailCard, NumList, SectionHead } from "../components/tpl/Template";
import { siteConfig } from "../siteConfig";
import { friendsData } from "../data/friends";
import { projectsData } from "../data/projects";
import { aiGroups } from "../data/aiCategories";
import { getGroups, getRecentDocs } from "../lib/aiDocs";
import { getSearchItems } from "../lib/siteSearch";
import { toolsData, toolCategories } from "../data/tools";
import { promptsData } from "../data/prompts";
import { routes } from "../data/routes";

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

/**
 * 首页模板：照 ai.codefather.cn 的骨架 ——
 * 居中卷首（大标题 + 副标题 + 大搜索框 + 热门搜索一行）
 * → 左宽右窄两栏，左侧按「精选 / 知识库 / 工具 / 随笔 / 提示词 / 路线」分区，
 * 右侧是作者卡 + 资讯榜 + 热门工具小格 + 友链。
 */
export default function Home() {
  const posts = readMarkdown("posts") as Post[];
  const chatters = readMarkdown("chatters") as Post[];
  const projects = projectsData;

  const groups = getGroups();
  const recentDocs = getRecentDocs(6);
  const searchItems = getSearchItems();

  const groupCards = aiGroups.map((g) => {
    const hit = groups.find((x) => x.slug === g.slug);
    return { ...g, docCount: hit?.docCount ?? 0 };
  });

  const featuredTools = toolsData.slice(0, 10);
  const featuredPrompts = promptsData.slice(0, 4);
  const hotTags = ["提示词", "Agent", "RAG", "微调", "上下文", "成本"];

  return (
    <div className="min-h-screen">
      <Navbar />

      <PageTransition>
        {/* ── 卷首：居中，参考站首屏就是这个结构 ── */}
        <section className="wrap pb-7 pt-9 text-center sm:pt-12">
          <h1 className="mx-auto max-w-[760px] text-[1.85rem] font-extrabold leading-[1.16] tracking-[-0.025em] text-[var(--ink)] sm:text-[2.6rem]">
            看明白 AI，从这里开始
          </h1>
          <p className="mx-auto mt-3.5 max-w-[600px] text-[13.5px] leading-[1.75] text-[var(--muted)]">
            {siteConfig.bio}
          </p>

          <div className="mx-auto mt-6 w-full max-w-[640px]">
            <SearchBox items={searchItems} limit={10} placeholder="搜笔记、工具、提示词，或直接搜一个报错" />
          </div>

          <p className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[12.5px] text-[var(--muted)]">
            <span>热门搜索：</span>
            {hotTags.map((t) => (
              <Link key={t} href={`/ai/all?q=${encodeURIComponent(t)}`} className="hover:text-[var(--accent)]">
                {t}
              </Link>
            ))}
          </p>
        </section>

        <main className="wrap pb-20">
          <div className="split">
            {/* ═══ 主栏 ═══ */}
            <div className="min-w-0 space-y-10">
              {/* 精选推荐：5 列小卡（参考站首块） */}
              <section>
                <SectionHead title="精选推荐" more="全部" href="/ai/all" />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {groupCards.slice(0, 5).map((g) => (
                    <Link key={g.slug} href={`/ai#${g.slug}`} className="pcard group overflow-hidden">
                      <div className="card-figure" style={{ aspectRatio: "16 / 10" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={asset(`/covers/${g.slug}.svg`)} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                      </div>
                      <div className="p-2.5">
                        <h3 className="line-clamp-1 text-[13px] font-semibold text-[var(--ink)]">{g.name}</h3>
                        <p className="mt-0.5 line-clamp-1 text-[11.5px] text-[var(--muted)]">{g.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* 知识库：分类标签 + 4 列卡（参考站「AI 工具大全」那一格的结构） */}
              <section>
                <SectionHead title="知识库" more="查看全部" href="/ai" />
                <div className="mb-3 flex flex-wrap gap-2">
                  {aiGroups.map((g) => (
                    <Link key={g.slug} href={`/ai#${g.slug}`} className="chip">
                      {g.name}
                    </Link>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {recentDocs.map((doc) => (
                    <Link key={doc.key} href={`/ai/${doc.category}/${doc.slug}`} className="pcard group p-3.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="line-clamp-1 text-[13.5px] font-semibold text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                          {doc.title}
                        </h3>
                        <span className="shrink-0 text-[11px] text-[var(--muted)]">{doc.readingTime} 分钟</span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-[1.75] text-[var(--muted)]">{doc.summary}</p>
                    </Link>
                  ))}
                </div>
              </section>

              {/* 工具库：5 列纯文字小卡 */}
              <section>
                <SectionHead title="AI 工具" more="全部工具" href="/tools" />
                <div className="mb-3 flex flex-wrap gap-2">
                  {toolCategories.map((c) => (
                    <Link key={c.slug} href={`/tools/${c.slug}`} className="chip">
                      {c.name}
                    </Link>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {featuredTools.map((t) => (
                    <a key={t.id} href={t.url} target="_blank" rel="noopener noreferrer" className="pcard p-3">
                      <h3 className="line-clamp-1 text-[13px] font-semibold text-[var(--ink)]">{t.name}</h3>
                      <p className="mt-1 line-clamp-2 text-[11.5px] leading-[1.6] text-[var(--muted)]">{t.tagline}</p>
                    </a>
                  ))}
                </div>
              </section>

              {/* 随笔：用户栏 + 标题 + 摘要（参考站社区卡的结构，去掉互动栏） */}
              <section>
                <SectionHead title={siteConfig.chatterTitle} more="全部" href="/chatter" />
                <div className="space-y-3">
                  {chatters.slice(0, 3).map((c) => (
                    <Link key={c.slug} href={`/chatter/${c.slug}`} className="pcard group flex gap-3 p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={asset(siteConfig.avatarUrl)} alt="" className="h-9 w-9 shrink-0 rounded-full border border-[var(--card-line)]" />
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[12.5px] font-medium text-[var(--ink)]">{siteConfig.authorName}</span>
                          <span className="text-[11.5px] text-[var(--muted)]">{short(c.date)}</span>
                        </div>
                        <h3 className="mt-1 line-clamp-1 text-[14px] font-semibold text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                          {c.title}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-[12.5px] leading-[1.75] text-[var(--muted)]">{c.description}</p>
                      </div>
                    </Link>
                  ))}
                  {chatters.length === 0 && <p className="text-[13px] text-[var(--muted)]">还没有随笔。</p>}
                </div>
              </section>

              {/* 提示词：竖图卡 3-4 列 */}
              <section>
                <SectionHead title="提示词" more="全部提示词" href="/prompts" />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {featuredPrompts.map((p) => (
                    <Link key={p.id} href={`/prompts/${p.group}`} className="pcard group overflow-hidden">
                      <div className="card-figure" style={{ aspectRatio: "16 / 10" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={asset(`/covers/${p.group === "coding" ? "coding" : p.group === "writing" ? "prompt" : "engineering"}.svg`)} alt="" className="h-full w-full object-cover" />
                        <span className="absolute left-2 top-2 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-medium text-[#17161a]">
                          模板
                        </span>
                      </div>
                      <div className="p-3">
                        <h3 className="line-clamp-1 text-[13px] font-semibold text-[var(--ink)]">{p.title}</h3>
                        <p className="mt-1 line-clamp-1 text-[11.5px] text-[var(--muted)]">{p.useCase}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* 学习路线：左图右文列表卡 */}
              <section>
                <SectionHead title="学习路线" more="全部路线" href="/learn" />
                <div className="space-y-3">
                  {routes.slice(0, 3).map((r) => (
                    <Link key={r.slug} href={`/learn/${r.slug}`} className="pcard flex gap-4 p-3">
                      <div className="thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={asset(`/covers/getting-started.svg`)} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1 py-0.5">
                        <h3 className="line-clamp-1 text-[14px] font-semibold text-[var(--ink)]">{r.name}</h3>
                        <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-[1.75] text-[var(--muted)]">{r.outcome}</p>
                        <p className="mt-1.5 text-[11.5px] text-[var(--muted)] opacity-80">{r.steps.length} 步 · {r.audience}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* 项目：纯文字行 */}
              <section>
                <SectionHead title="项目" more="全部" href="/projects" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {projects.slice(0, 4).map((p) => (
                    <a key={p.id} href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="pcard p-3.5">
                      <h3 className="line-clamp-1 text-[13.5px] font-semibold text-[var(--ink)]">{p.name}</h3>
                      <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-[1.75] text-[var(--muted)]">{p.description}</p>
                    </a>
                  ))}
                </div>
              </section>
            </div>

            {/* ═══ 右栏 ═══ */}
            <aside className="space-y-3">
              <RailCard title="关于本站">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset(siteConfig.avatarUrl)} alt={siteConfig.authorName} className="h-11 w-11 rounded-full border border-[var(--card-line)]" />
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-[var(--ink)]">{siteConfig.authorName}</p>
                    <p className="mt-0.5 line-clamp-1 text-[11.5px] text-[var(--muted)]">{siteConfig.authorTitle}</p>
                  </div>
                </div>
                <p className="mt-3 text-[12px] leading-[1.7] text-[var(--muted)]">{siteConfig.slogan}</p>
                <div className="mt-3 flex gap-2">
                  {siteConfig.social?.github && (
                    <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" className="chip">
                      GitHub
                    </a>
                  )}
                  <Link href="/about" className="chip chip-on">
                    关于我
                  </Link>
                </div>
              </RailCard>

              <RailCard title="按主题读" href="/ai" more="知识库">
                <NumList
                  items={groupCards.map((g) => ({
                    title: g.name,
                    href: `/ai#${g.slug}`,
                    meta: `${g.docCount}`,
                  }))}
                />
              </RailCard>

              <RailCard title="热门工具" href="/tools" more="更多">
                <div className="grid grid-cols-2 gap-1.5">
                  {toolsData.slice(0, 8).map((t) => (
                    <a
                      key={t.id}
                      href={t.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-[12px] text-[var(--ink-soft)] transition-colors hover:bg-[var(--surface-alt)] hover:text-[var(--ink)]"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[var(--surface-alt)] text-[10px] font-semibold uppercase text-[var(--muted)]">
                        {t.name.slice(0, 1)}
                      </span>
                      <span className="min-w-0 truncate">{t.name}</span>
                    </a>
                  ))}
                </div>
              </RailCard>

              <RailCard title="资料" href="/mcp" more="MCP">
                <ul className="space-y-2">
                  {[
                    { name: "工具库", href: "/tools", meta: `${toolsData.length}` },
                    { name: "提示词", href: "/prompts", meta: `${promptsData.length}` },
                    { name: "学习路线", href: "/learn", meta: `${routes.length}` },
                    { name: "站内问答", href: "/ai/ask", meta: "AI" },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="flex items-center justify-between text-[12.5px] text-[var(--ink-soft)] hover:text-[var(--accent)]">
                        <span>{l.name}</span>
                        <span className="text-[11px] text-[var(--muted)]">{l.meta}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </RailCard>

              <RailCard title="友链" href="/friends" more="更多">
                <ul className="space-y-2">
                  {friendsData.slice(0, 4).map((f) => (
                    <li key={f.id}>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 text-[12.5px] text-[var(--ink-soft)] hover:text-[var(--accent)]"
                      >
                        <span className="min-w-0 truncate">{f.name}</span>
                        <span className="shrink-0 text-[11px] text-[var(--muted)]">↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </RailCard>
            </aside>
          </div>
        </main>
      </PageTransition>

      <footer className="border-t border-[var(--card-line)]">
        <div className="wrap flex flex-col items-start justify-between gap-3 py-8 sm:flex-row sm:items-center">
          <p className="text-[12px] text-[var(--muted)]">
            © {new Date().getFullYear()} {siteConfig.title} · {siteConfig.authorEn}
          </p>
          <div className="flex flex-wrap gap-2">
            {siteConfig.footerBadges?.map((b) => (
              <span key={b.name} className="chip">
                {b.name}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

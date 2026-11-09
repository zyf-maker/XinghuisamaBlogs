import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// 🌟 核心升级：引入 Next.js 现代统一解析流
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm'; // 🌟 挂载 GFM 支持删除线
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import rehypeKatex from 'rehype-katex';

// 🌟 引入神仙代码高亮主题（Atom One Dark）
import 'highlight.js/styles/atom-one-dark.css';

import Navbar from '../../../components/Navbar';
import PageTransition from '../../../components/PageTransition';
import { siteConfig } from '../../../siteConfig';
import ClientSocials from '../../../components/ClientSocials';
import SidebarLyric from '../../../components/SidebarLyric';
import BackButton from '../../../components/BackButton';
import Comments from '../../../components/Comments';
import { asset } from '../../../lib/base';

export async function generateStaticParams() {
  const chattersDirectory = path.join(process.cwd(), 'chatters');
  if (!fs.existsSync(chattersDirectory)) return [];
  const filenames = fs.readdirSync(chattersDirectory);
  return filenames
    .filter((name) => name.endsWith('.md'))
    .map((name) => ({
      slug: name.replace(/\.md$/, ''),
    }));
}

async function getChatterData(slug: string) {
  const fullPath = path.join(process.cwd(), 'chatters', `${slug}.md`);
  // 随笔目录可能为空，缺文件时落到 404 而不是抛错
  if (!fs.existsSync(fullPath)) notFound();
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  let { data, content } = matter(fileContents);

  // ==========================================
  // 🌟 前台渲染清洗区：终极防吞换行 + 安全保护补丁！（从 Post 完美移植）
  // ==========================================

  // 1. 基础物理清洗：统一换行符，干掉幽灵占位符和纯空格废行
  content = content.replace(/\r\n/g, '\n');
  content = content.replace(/[\u200B-\u200D\uFEFF]/g, '');
  content = content.replace(/^[ \t]+$/gm, '');

  // 2. 强行修复数字列表缺少空格导致无法渲染为列表的 Bug (1.百度 -> 1. 百度)
  content = content.replace(/^(\s*\d+)\.([^ \n])/gm, '$1. $2');

  // 3. 🌟 空间隔离防吞换行阵法（绝对不伤代码块！）
  const blocks = content.split(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g);
  content = blocks.map((block, index) => {
    // 奇数索引是代码块
    if (index % 2 === 1) {
      // 🌟 安全注入：如果代码块没写明语言，只在开头安全补上 cpp，绝不破坏结尾！
      if (/^```[ \t]*(\n|$)/.test(block)) {
         return block.replace(/^```[ \t]*/, '```cpp');
      }
      return block;
    }

    // 偶数索引是正文。把 3 个以上的连续 \n 替换为真实的 <br> 标签。
    // （3 个 \n 相当于中间空了 1 行真正的空白）
    return block.replace(/\n{3,}/g, (match) => {
      const brCount = match.length - 2;
      return '\n\n' + '<br>'.repeat(brCount) + '\n\n';
    });
  }).join('');

  // ==========================================

  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    // @ts-ignore
    .use(rehypeHighlight, {
      detect: true,
      ignoreMissing: true,
      subset: ['cpp', 'c', 'python', 'java', 'javascript', 'typescript', 'go', 'rust', 'bash', 'json', 'html', 'css', 'sql', 'xml']
    })
    .use(rehypeKatex)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  return {
    slug,
    contentHtml: processedContent.toString(),
    title: data.title || '碎片记录',
    date: data.date,
    mood: data.mood,
    tags: data.tags && Array.isArray(data.tags) ? data.tags : [],
    cover: data.cover || siteConfig.defaultPostCover
  };
}

function getRecentChatters(currentSlug: string) {
  const chattersDirectory = path.join(process.cwd(), 'chatters');
  let fileNames: string[] = [];
  try { fileNames = fs.readdirSync(chattersDirectory).filter(f => f.endsWith('.md')); } catch(e) {}
  if (!fileNames) return [];

  return fileNames.map(f => {
    const s = f.replace(/\.md$/, '');
    const c = fs.readFileSync(path.join(chattersDirectory, f), 'utf8');
    const { data } = matter(c);
    return { slug: s, title: data.title || '碎片记录', date: data.date || '1970-01-01' };
  }).filter(p => p.slug !== currentSlug)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
}

function generateCalendarMatrix(year: number, month: number, targetDay: number) {
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const days = [];
  for (let i = 0; i < startDay; i++) { days.push(null); }
  for (let i = 1; i <= daysInMonth; i++) { days.push(i); }
  return { days, targetDay };
}

export default async function ChatterDetail({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const chatterData = await getChatterData(resolvedParams.slug);
  const recentChatters = getRecentChatters(resolvedParams.slug);

  const dateObj = new Date(chatterData.date || '2026-03-24');
  const yearStr = dateObj.getFullYear();
  const monthNum = dateObj.getMonth() + 1;
  const dayNum = dateObj.getDate();

  const { days: calendarDays } = generateCalendarMatrix(yearStr, monthNum, dayNum);
  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <div className="min-h-screen">
      <Navbar />

      <PageTransition>
        <main className="wrap pb-20">
          <div className="split pt-10">
            <article className="pcard min-w-0 p-5 sm:p-8">
              <div className="mb-4">
                <BackButton />
              </div>

              <h1 className="text-[1.7rem] font-extrabold leading-[1.3] tracking-[-0.02em] text-[var(--ink)] sm:text-[2.1rem]">
                {chatterData.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-[var(--muted)]">
                <span>{chatterData.date}</span>
                {chatterData.mood && <span>心情：{chatterData.mood}</span>}
                {chatterData.tags.map((tag: string) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>

              <div
                className="prose mt-7 max-w-none text-[var(--ink)]"
                dangerouslySetInnerHTML={{ __html: chatterData.contentHtml }}
              />

              <div className="mt-12">
                <Comments />
              </div>
            </article>

            <aside className="space-y-3">
              <section className="pcard p-4 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset(siteConfig.avatarUrl)}
                  alt=""
                  className="mx-auto mb-3 h-14 w-14 rounded-full border border-[var(--card-line)]"
                />
                <h3 className="text-[13.5px] font-bold text-[var(--ink)]">{siteConfig.authorName}</h3>
                <p className="mt-1.5 text-[12px] leading-[1.7] text-[var(--muted)]">{siteConfig.bio}</p>
                <div className="mt-3 flex justify-center">
                  <ClientSocials />
                </div>
              </section>

              <section className="pcard p-4">
                <h3 className="mb-2.5 text-[13.5px] font-bold text-[var(--ink)]">
                  {yearStr} 年 {monthNum} 月
                </h3>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-[var(--muted)]">
                  {weekDays.map((day) => (
                    <div key={day}>{day}</div>
                  ))}
                </div>
                <div className="mt-1.5 grid grid-cols-7 gap-y-1 text-center">
                  {calendarDays.map((day, index) => (
                    <div key={index} className="flex items-center justify-center">
                      {day ? (
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-md text-[11px] ${
                            day === dayNum
                              ? "bg-[var(--accent)] font-semibold text-[var(--accent-ink)]"
                              : "text-[var(--ink-soft)]"
                          }`}
                        >
                          {day}
                        </div>
                      ) : (
                        <div className="h-6 w-6" />
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="pcard p-4">
                <h3 className="mb-2.5 text-[13.5px] font-bold text-[var(--ink)]">其他随笔</h3>
                <div>
                  {recentChatters.map((p) => (
                    <Link key={p.slug} href={`/chatter/${p.slug}`} className="group block py-1.5">
                      <h4 className="line-clamp-2 text-[12.5px] leading-[1.55] text-[var(--ink-soft)] transition-colors group-hover:text-[var(--accent)]">
                        {p.title}
                      </h4>
                      <p className="mt-0.5 text-[11px] text-[var(--muted)]">{p.date}</p>
                    </Link>
                  ))}
                </div>
              </section>

              <SidebarLyric />
            </aside>
          </div>
        </main>
      </PageTransition>
    </div>
  );
}
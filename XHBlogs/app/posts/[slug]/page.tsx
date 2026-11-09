import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm'; // 🌟 核心引入：支持删除线和表格等 GFM 语法
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// 引入高亮主题
import 'highlight.js/styles/atom-one-dark.css';

import Navbar from '../../../components/Navbar';
import PageTransition from '../../../components/PageTransition';
import { siteConfig } from '../../../siteConfig';
import ClientSocials from '../../../components/ClientSocials';
import ClientTOC from '../../../components/ClientTOC';
import BackButton from '../../../components/BackButton';
import Comments from '../../../components/Comments';
import SidebarLyric from '../../../components/SidebarLyric';
import { asset } from '../../../lib/base';

export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), 'posts');
  if (!fs.existsSync(postsDirectory)) return [];

  const filenames = fs.readdirSync(postsDirectory);

  return filenames
    .filter((name) => name.endsWith('.md'))
    .map((name) => ({
      slug: name.replace(/\.md$/, ''),
    }));
}

function extractToc(content: string) {
  const toc = [];
  let fence: { marker: string; length: number } | null = null;
  for (const line of content.split(/\r?\n/)) {
    const delimiter = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (delimiter) {
      const marker = delimiter[1][0];
      if (!fence) {
        if (marker !== '`' || !delimiter[2].includes('`')) {
          fence = { marker, length: delimiter[1].length };
          continue;
        }
      } else if (marker === fence.marker && delimiter[1].length >= fence.length && !delimiter[2].trim()) {
        fence = null;
        continue;
      }
    }
    if (fence) continue;
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const text = match[2].trim();
      toc.push({ level: match[1].length, text, id: text.toLowerCase().replace(/\s+/g, '-') });
    }
  }
  return toc;
}

async function getPostData(slug: string) {
  const fullPath = path.join(process.cwd(), 'posts', `${slug}.md`);
  // 文章目录可以是空的（正式发布前不引入内容），此时返回 404 而不是抛异常
  if (!fs.existsSync(fullPath)) notFound();
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  let { data, content } = matter(fileContents);

  // ==========================================
  // 🌟 前台渲染清洗区：终极防吞换行补丁！
  // ==========================================

  // 1. 强行修复数字列表缺少空格导致无法渲染为列表的 Bug (1.百度 -> 1. 百度)
  content = content.replace(/^(\s*\d+)\.([^ \n])/gm, '$1. $2');

  // 2. 🌟 拯救被 Markdown 引擎吞噬的“连续空行”！
  // 统一换行符，并清理纯空格的废弃空行
  content = content.replace(/\r\n/g, '\n').replace(/^[ \t]+$/gm, '');

  // 将代码块切开保护，只处理正文的连续空行！
  const blocks = content.split(/(```[\s\S]*?```)/g);
  content = blocks.map((block, index) => {
    // 奇数索引是代码块，原样返回，绝对不碰！
    if (index % 2 === 1) return block;

    // 偶数索引是正文。把 3 个以上的连续 \n 替换为真实的 <br/> 标签。
    // （3 个 \n 相当于中间空了 1 行真正的空白）
    return block.replace(/\n{3,}/g, (match) => {
      const brCount = match.length - 2;
      return '\n\n' + '<br/>'.repeat(brCount) + '\n\n';
    });
  }).join('');

  // ==========================================

  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    // 🌟 allowDangerousHtml 必须开启，这样上面生成的 <br/> 才能顺利通过变成真正的换行！
    .use(remarkRehype, { allowDangerousHtml: true })
    // 🌟 核心升级：开启代码语言自动侦测，并限制白名单，大幅提高 C++ 和常用语言的猜中率！
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
    toc: extractToc(content),
    title: data.title,
    date: data.date,
    tags: data.tags && Array.isArray(data.tags) ? data.tags : [],
    cover: data.cover || siteConfig.defaultPostCover
  };
}

function getRecentPosts(currentSlug: string) {
  const postsDirectory = path.join(process.cwd(), 'posts');
  let fileNames: string[] = [];
  try { fileNames = fs.readdirSync(postsDirectory).filter(f => f.endsWith('.md')); } catch(e) {}
  if (!fileNames) return [];
  return fileNames.map(f => {
    const s = f.replace(/\.md$/, '');
    const c = fs.readFileSync(path.join(postsDirectory, f), 'utf8');
    const { data } = matter(c);
    return { slug: s, title: data.title || '无标题', date: data.date };
  }).filter(p => p.slug !== currentSlug).slice(0, 3);
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const postData = await getPostData(resolvedParams.slug);
  const recentPosts = getRecentPosts(resolvedParams.slug);

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
                {postData.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-[var(--muted)]">
                <span>{postData.date}</span>
                {postData.tags.map((tag: string) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>

              <div
                id="article-content"
                className="prose mt-7 max-w-none text-[var(--ink)]"
                dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
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

              {postData.toc.length > 0 && <ClientTOC toc={postData.toc} />}

              <section className="pcard p-4">
                <h3 className="mb-2.5 text-[13.5px] font-bold text-[var(--ink)]">其他文章</h3>
                <div>
                  {recentPosts.map((p) => (
                    <Link key={p.slug} href={`/posts/${p.slug}`} className="group block py-1.5">
                      <h4 className="line-clamp-1 text-[12.5px] text-[var(--ink-soft)] transition-colors group-hover:text-[var(--accent)]">
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
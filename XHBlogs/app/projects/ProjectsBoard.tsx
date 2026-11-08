"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../../components/BackButton'; // 注意层级路径
import { projectsData } from '../../data/projects';

export default function ProjectsBoard() {
  const [searchQuery, setSearchQuery] = useState("");

  // 搜索过滤逻辑
  const filteredProjects = useMemo(() => {
    if (searchQuery.trim() === "") return projectsData;
    const query = searchQuery.trim().toLowerCase();

    return projectsData.filter(project =>
      project.name.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  return (
    <div className="w-full relative z-10">

      {/* 页首 */}
      <div className="mb-10 border-b border-[var(--line)] pb-9">
        <div className="mb-5">
          <BackButton />
        </div>
        <h1 className="font-serif text-[2rem] font-black leading-[1.15] tracking-tight text-[var(--ink)] sm:text-[2.5rem]">
          项目
        </h1>
        <p className="mt-3 max-w-2xl text-[13.5px] leading-[1.85] text-[var(--ink-soft)]">
          开源项目、科研代码与实验室里折腾出来的工具。
        </p>
      </div>

      {/* 搜索框 */}
      <div className="mb-2 w-full">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="搜索名称、描述或技术栈"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 rounded-md border border-[var(--line-strong)] bg-[var(--surface)] pl-10 pr-4 text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)] transition-colors focus:border-[var(--accent)] focus:outline-none"
          />
          <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="h-8" />
      {/* 项目列表 */}
      <motion.div layout className="divide-y divide-[var(--line)] border-b border-[var(--line)] relative">
        <AnimatePresence>
          {filteredProjects.map((project) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              key={project.id}
            >
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block py-7"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-3">
                      <h2 className="font-serif text-[17px] font-bold text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                        {project.name}
                      </h2>
                      <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--muted)] opacity-0 transition-opacity group-hover:opacity-100">
                        GITHUB ↗
                      </span>
                    </div>
                    <p className="mt-2 max-w-2xl text-[13px] leading-[1.85] text-[var(--ink-soft)]">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-1.5 sm:justify-end">
                    {project.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-[13px] text-[var(--muted)]"
          >
            没有找到与「{searchQuery}」匹配的项目。
          </motion.div>
        )}
      </motion.div>

      <p className="mt-8 max-w-2xl text-[12.5px] leading-[1.9] text-[var(--muted)]">
        这里只放能公开的仓库。还有几个在内部跑的东西暂时没整理出来，
        更实在的产出在
        <Link href="/ai" className="link-accent mx-1">
          知识库
        </Link>
        里。
      </p>

    </div>
  );
}
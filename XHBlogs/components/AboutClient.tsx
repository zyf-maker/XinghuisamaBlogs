"use client";

import { asset } from "../lib/base";
import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, MessageSquare, Sparkles, Activity } from 'lucide-react';
import Comments from './Comments';
import { siteConfig } from '../siteConfig';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

type ActivityRecord = {
  id: string;
  type: '文章' | '杂谈' | '说说';
  title: string;
  date: string;
  url: string;
};

export default function AboutClient({
  contentHtml,
  coverImage,
  activities
}: {
  contentHtml: string,
  coverImage: string,
  activities: ActivityRecord[]
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'intro';

  const handleTabChange = (tab: string) => {
    router.push(`${pathname}?tab=${tab}`, { scroll: false });
  };

  const heatmapScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'activity') {
      const checkAndScroll = setInterval(() => {
        const el = heatmapScrollRef.current;
        if (el) {
          el.scrollLeft = el.scrollWidth;
          clearInterval(checkAndScroll);

          setTimeout(() => {
            if (heatmapScrollRef.current) {
              heatmapScrollRef.current.scrollLeft = heatmapScrollRef.current.scrollWidth;
            }
          }, 300);
        }
      }, 50);

      const timeout = setTimeout(() => clearInterval(checkAndScroll), 2000);

      return () => {
        clearInterval(checkAndScroll);
        clearTimeout(timeout);
      };
    }
  }, [activeTab]);

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const getLocalDateKey = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const { weeks, activityMap } = useMemo(() => {
    const today = new Date();
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 364);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    let curr = new Date(startDate);
    const weeksArr = [];
    let currentWeek = [];

    while (curr <= endDate) {
      currentWeek.push(new Date(curr));
      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
      curr.setDate(curr.getDate() + 1);
    }
    if (currentWeek.length > 0) weeksArr.push(currentWeek);

    const map: Record<string, number> = {};
    activities.forEach(a => {
      const d = new Date(a.date);
      if (!isNaN(d.getTime())) {
        const dateKey = getLocalDateKey(d);
        map[dateKey] = (map[dateKey] || 0) + 1;
      }
    });

    return { weeks: weeksArr, activityMap: map };
  }, [activities]);

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-[var(--accent-soft)]';
    if (count === 1) return 'bg-[var(--ok)]/15';
    if (count === 2) return 'bg-[var(--ok)]/15';
    if (count === 3) return 'bg-[var(--ok)]';
    return 'bg-[var(--ok)]';
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case '文章': return 'text-[var(--accent)] ';
      case '杂谈': return 'text-[var(--accent)] ';
      case '说说': return 'text-[var(--accent)] ';
      default: return 'text-[var(--accent)]';
    }
  };

  return (
    <div className="bg-[var(--surface)] rounded-lg border border-[var(--line-strong)] overflow-hidden transition-colors duration-700 relative">

      <div className="w-full h-40 sm:h-48 md:h-64 relative bg-[var(--surface-alt)] overflow-hidden group">
        <img src={coverImage} alt="About Hero" className="w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105" />
        <div className="absolute inset-0"></div>
      </div>

      <div className="px-5 sm:px-8 md:px-16 pb-10 md:pb-16 relative">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[var(--line)] overflow-hidden -mt-12 md:-mt-16 relative z-20 bg-[var(--surface)]">
          <img src={asset(siteConfig.avatarUrl)} alt="avatar" className="w-full h-full object-cover" />
        </div>

        {/* 🌟 核心修复区：手机端排版优雅适配 */}
        <div className="mt-4 md:mt-6 mb-6 md:mb-8 relative flex flex-col md:flex-row md:items-end justify-between gap-5 md:gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black text-[var(--ink)] tracking-tight mb-1 md:mb-3 transition-colors duration-700">关于我</h1>
            <p className="text-sm md:text-lg text-[var(--accent)] font-bold tracking-widest uppercase transition-colors duration-700">Hello World, I'm {siteConfig.authorName}</p>
          </div>

          <div className="flex items-center w-full md:w-auto gap-1 bg-[var(--surface)] p-1 md:p-1.5 rounded-md md:rounded-lg border border-[var(--line-strong)]">
            <button
              onClick={() => handleTabChange('intro')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2 rounded-lg md:rounded-md text-xs md:text-sm font-black transition-all duration-300 ${activeTab === 'intro' ? 'bg-[var(--accent)] text-[var(--accent-ink)] shadow-sm' : 'text-[var(--accent)] hover:text-[var(--accent)]'}`}
            >
              自我介绍
            </button>
            <button
              onClick={() => handleTabChange('activity')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2 rounded-lg md:rounded-md text-xs md:text-sm font-black transition-all duration-300 ${activeTab === 'activity' ? 'bg-[var(--accent)] text-[var(--accent-ink)] shadow-sm' : 'text-[var(--accent)] hover:text-[var(--accent)]'}`}
            >
              研究动态
            </button>
          </div>
        </div>

        <div className="w-full h-px bg-[var(--surface-alt)] mb-6 md:mb-8"></div>

        <AnimatePresence mode="wait">
          {activeTab === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <div className="relative">
                
                <div className="prose prose-slate prose-base md:prose-lg max-w-none text-[var(--ink)] font-serif transition-colors duration-700 leading-relaxed scroll-smooth" dangerouslySetInnerHTML={{ __html: contentHtml }} />
              </div>
              <div className="mt-12 md:mt-16"><Comments /></div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>

              <div className="mb-12 p-5 md:p-8 bg-[var(--surface-alt)] rounded-lg border border-[var(--line-strong)]">
                <h3 className="text-lg font-black text-[var(--ink)] mb-6 flex items-center gap-2">
                  <Activity size={20} className="text-[var(--accent)]" />
                  {activities.length} contributions in the last year
                </h3>

                <div className="flex gap-2">

                  <div className="flex flex-col shrink-0">
                    <div className="h-4 mb-1"></div>
                    <div className="flex flex-col gap-[4px] text-[10px] text-[var(--muted)]">
                      <div className="h-[11px] md:h-[13px]"></div>
                      <div className="h-[11px] md:h-[13px] leading-none flex items-center">Mon</div>
                      <div className="h-[11px] md:h-[13px]"></div>
                      <div className="h-[11px] md:h-[13px] leading-none flex items-center">Wed</div>
                      <div className="h-[11px] md:h-[13px]"></div>
                      <div className="h-[11px] md:h-[13px] leading-none flex items-center">Fri</div>
                      <div className="h-[11px] md:h-[13px]"></div>
                    </div>
                  </div>

                  <div ref={heatmapScrollRef} className="flex-1 overflow-x-auto pb-4 custom-scrollbar scroll-smooth relative">
                    <div className="min-w-[700px]">

                      <div className="flex gap-[4px] text-[10px] text-[var(--muted)] mb-1 h-4">
                        {weeks.map((week, idx) => {
                          const firstDay = week[0];
                          const isFirstWeekOfMonth = firstDay.getDate() <= 7;
                          return (
                            <div key={idx} className="w-[11px] md:w-[13px] shrink-0 relative">
                              {isFirstWeekOfMonth && (
                                <span className="absolute left-0 whitespace-nowrap z-10">
                                  {firstDay.toLocaleString('en-US', { month: 'short' })}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex gap-[4px]">
                        {weeks.map((week, i) => (
                          <div key={i} className="flex flex-col gap-[4px]">
                            {week.map((day, j) => {
                              const dateKey = getLocalDateKey(day);
                              const count = activityMap[dateKey] || 0;
                              return (
                                <div
                                  key={j}
                                  title={`${dateKey}: ${count} 次更新`}
                                  className={`w-[11px] h-[11px] md:w-[13px] md:h-[13px] rounded-[3px] transition-colors duration-300 hover:ring-2 hover:ring-[var(--accent)] ${getColorClass(count)}`}
                                ></div>
                              );
                            })}
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-2 text-[10px] md:text-xs font-bold text-[var(--ink-soft)]">
                  Less
                  <div className="w-[11px] h-[11px] rounded-[3px] bg-[var(--surface-alt)]"></div>
                  <div className="w-[11px] h-[11px] rounded-[3px] bg-[var(--accent)]"></div>
                  <div className="w-[11px] h-[11px] rounded-[3px] bg-[var(--accent)]"></div>
                  <div className="w-[11px] h-[11px] rounded-[3px] bg-[var(--accent)]"></div>
                  <div className="w-[11px] h-[11px] rounded-[3px] bg-[var(--accent)]"></div>
                  More
                </div>
              </div>

              <div className="relative pl-6 md:pl-8 border-l-2 border-[var(--line-strong)] space-y-6 md:space-y-8">
                {activities.map((act, index) => {
                  const isMoment = act.type === '说说';
                  const targetUrl = isMoment ? '/moments' : act.url;

                  return (
                    <div key={index} className="relative group">
                      <div className="absolute -left-[31px] md:-left-[39px] top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-[var(--surface)] border-2 border-[var(--line-strong)] rounded-full group-hover:scale-125 transition-transform duration-300 z-10"></div>

                      <Link
                        href={targetUrl}
                        className="flex flex-col md:flex-row md:items-center gap-3 bg-[var(--surface)] p-4 rounded-lg border border-[var(--line-strong)] transition-all group-hover:-translate-y-1 cursor-pointer block relative overflow-hidden"
                      >
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <img src={asset(siteConfig.avatarUrl)} alt="author" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-[var(--line)] shrink-0" />

                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-[var(--ink)] text-sm">{siteConfig.authorName}</span>
                              <span className={`text-xs font-bold ${getTypeColor(act.type)}`}>
                                {isMoment ? '发布了 说说' : `更新了 ${act.type}`}
                              </span>
                            </div>

                            <div className="text-[10px] md:hidden font-mono text-[var(--muted)] mt-0.5">
                              {formatDateTime(act.date)}
                            </div>
                          </div>
                        </div>

                        {!isMoment && (
                          <>
                            <div className="hidden md:block w-px h-8 bg-[var(--surface-alt)] mx-2 shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm md:text-base font-black text-[var(--ink)] truncate group-hover:text-[var(--accent)] transition-colors">
                                《{act.title}》
                              </div>
                            </div>
                          </>
                        )}

                        {isMoment && (
                          <div className="flex-1 hidden md:block"></div>
                        )}

                        <div className="hidden md:block text-[11px] font-mono text-[var(--muted)] shrink-0 ml-auto bg-[var(--surface-alt)] px-2 py-1 rounded-md">
                          {formatDateTime(act.date)}
                        </div>
                      </Link>
                    </div>
                  );
                })}

                {activities.length === 0 && (
                  <div className="text-[var(--ink-soft)] text-sm font-bold">石石数据库中时无活动记录...</div>
                )}
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
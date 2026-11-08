"use client";

import { asset } from "../../lib/base";
import { useState, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { MapPin, MessageSquare, Clock, Sparkles, Search, ArrowDownAZ, ArrowUpZA, ChevronLeft, ChevronRight, Ghost } from 'lucide-react';
import MomentComments from '../../components/MomentComments';

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return '刚刚';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} 分钟前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} 小时前`;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

export default function MomentList({ moments, authorName, avatarUrl }: any) {
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [lightbox, setLightbox] = useState<{ images: string[], index: number } | null>(null);

  const processedMoments = useMemo(() => {
    let result = moments ? [...moments] : [];

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(m =>
        (m.content || '').toLowerCase().includes(query) ||
        (m.location || '').toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
    return result;
  }, [moments, searchQuery, sortOrder]);

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lightbox) return;
    setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.images.length });
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lightbox) return;
    setLightbox({ ...lightbox, index: (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length });
  };

  const renderImages = (images: string[]) => {
    if (!images || images.length === 0) return null;
    const count = images.length;

    if (count === 1) {
      return (
        <div className="mt-4 md:mt-8 flex justify-start sm:justify-center w-full">
          <div onClick={() => setLightbox({ images, index: 0 })} className="max-w-[80%] sm:max-w-[280px] overflow-hidden rounded-md md:rounded-lg border border-[var(--line-strong)] cursor-zoom-in group">
            <img src={images[0]} alt="moment" className="w-full h-auto max-h-[300px] md:max-h-[400px] object-contain group-hover:scale-105 transition-transform duration-500" />
          </div>
        </div>
      );
    }

    const columns = count === 4 ? 2 : 3;
    const maxWidth = count === 4 ? '210px' : '320px';

    return (
      <div className="w-full flex justify-start sm:justify-center mt-4 md:mt-8">
        <div className="grid gap-1.5 md:gap-2 sm:mx-auto" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, width: '100%', maxWidth: maxWidth }}>
          {images.slice(0, 9).map((src, idx) => {
            const isLastVisible = idx === 8 && count > 9;
            return (
              <div key={idx} onClick={() => setLightbox({ images, index: idx })} className="group relative aspect-square overflow-hidden rounded-lg md:rounded-md bg-[var(--surface-alt)] border border-[var(--line-strong)] cursor-zoom-in">
                <img src={src} alt="moment" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                {isLastVisible && (
                  <div className="absolute inset-0 bg-[#14161a] flex items-center justify-center text-[#f7f5f0]">
                    <span className="text-lg md:text-xl font-black">+{count - 9}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMomentCard = (moment: any) => (
    <motion.div
      key={moment.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
      className="flex flex-col bg-[var(--surface)] rounded-lg md:rounded-lg border border-[var(--line-strong)] p-5 md:p-10 transition-shadow overflow-hidden relative group w-full"
    >
      <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-8 pb-4 md:pb-6 border-b border-[var(--line-strong)] relative">
        <div className="w-10 h-10 md:w-14 md:h-14 shrink-0 rounded-md md:rounded-lg overflow-hidden border-2 border-[var(--line)]">
          <img src={asset(avatarUrl)} alt="avatar" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-base md:text-lg font-black text-[#576b95] tracking-wide">{authorName}</h3>
          <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-[11px] text-[var(--muted)] font-bold mt-0.5 md:mt-1"><Clock size={10} className="md:w-3 md:h-3" /> {timeAgo(moment.date)}</div>
        </div>
      </div>

      <p className="text-[var(--ink)] text-[14px] md:text-[16px] leading-relaxed whitespace-pre-wrap font-medium break-words">{moment.content}</p>

      {renderImages(moment.images)}

      <div className="mt-5 md:mt-10 flex items-center justify-between">
        <div className="min-w-0 flex-1 pr-2">
          {moment.location && (
            <span className="inline-flex items-center gap-1 md:gap-1.5 text-[9px] md:text-[11px] font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] max-w-full truncate border border-[var(--line-strong)]">
              {/* 🌟 就是这里！shrink-0 已经乖乖放进 className 里面了 */}
              <MapPin size={10} className="md:w-3 md:h-3 shrink-0" />
              <span className="truncate">{moment.location}</span>
            </span>
          )}
        </div>
        <button onClick={() => setOpenCommentId(openCommentId === moment.id ? null : moment.id)} className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shrink-0 rounded-full transition-all ${openCommentId === moment.id ? 'bg-[var(--accent)] text-[var(--accent-ink)] shadow-sm rotate-12' : 'bg-[var(--surface)] text-[var(--ink-soft)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]'}`}>
          <MessageSquare size={14} className="md:w-4 md:h-4" />
        </button>
      </div>

      <AnimatePresence>
        {openCommentId === moment.id && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1, marginTop: 16 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-[var(--surface-alt)] rounded-lg md:rounded-lg p-4 md:p-6 border border-[var(--line-strong)] relative">
              <div className="absolute -top-2 right-6 md:right-8 w-4 h-4 bg-[var(--surface-alt)] rotate-45 border-l border-t border-[var(--line-strong)]"></div>
              <MomentComments id={`/moments/${moment.id}`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="w-full relative z-10 flex-1 flex flex-col">

      <div className="mb-8 md:mb-10 border-b border-[var(--line)] pb-8 md:pb-9">
        <h1 className="font-serif text-[2rem] font-black leading-[1.15] tracking-tight text-[var(--ink)] sm:text-[2.5rem]">手记</h1>
        <p className="mt-3 max-w-2xl text-[13.5px] leading-[1.85] text-[var(--ink-soft)]">
          不成篇的片段：一行想法、一张图、一段没写完的话。
        </p>
      </div>

      <div className="mb-10 md:mb-16 flex flex-col items-center gap-5 md:gap-8">
        <div className="relative w-full max-w-lg group px-2 md:px-0">
          <Search className="w-5 h-5 md:w-6 md:h-6 absolute left-6 md:left-5 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors z-20 pointer-events-none" />
          <input type="text" placeholder="搜寻被遗忘的记忆..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[var(--surface)] border border-[var(--line-strong)] rounded-md md:rounded-lg px-5 md:px-6 py-3 md:py-4 pl-12 md:pl-14 text-sm md:text-base text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all font-medium relative z-10" />
        </div>

        <div className="flex bg-[var(--surface)] p-1 md:p-1.5 rounded-md md:rounded-lg border border-[var(--line-strong)] relative z-10">
          <button onClick={() => setSortOrder('desc')} className={`flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-md text-[10px] md:text-xs font-black transition-all duration-300 ${sortOrder === 'desc' ? 'bg-[var(--accent)] text-[var(--accent-ink)] shadow-sm md:shadow-sm scale-105' : 'text-[var(--accent)] hover:text-[var(--accent)]'}`}>
            <ArrowDownAZ size={12} className="md:w-3.5 md:h-3.5"/> 最新
          </button>
          <button onClick={() => setSortOrder('asc')} className={`flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-md text-[10px] md:text-xs font-black transition-all duration-300 ${sortOrder === 'asc' ? 'bg-[var(--accent)] text-[var(--accent-ink)] shadow-sm md:shadow-sm scale-105' : 'text-[var(--accent)] hover:text-[var(--accent)]'}`}>
            <ArrowUpZA size={12} className="md:w-3.5 md:h-3.5"/> 最早
          </button>
        </div>
      </div>

      <LayoutGroup>
        {processedMoments.length > 0 ? (
          <div className="flex flex-col md:flex-row gap-5 md:gap-8 pb-32 w-full items-start">
            <div className="flex-1 flex flex-col gap-5 md:gap-8 w-full min-w-0">
              <AnimatePresence mode='popLayout'>
                {processedMoments.filter((_, i) => i % 2 === 0).map(moment => renderMomentCard(moment))}
              </AnimatePresence>
            </div>
            <div className="flex-1 flex flex-col gap-5 md:gap-8 w-full min-w-0">
              <AnimatePresence mode='popLayout'>
                {processedMoments.filter((_, i) => i % 2 === 1).map(moment => renderMomentCard(moment))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-12 md:py-24 min-h-[300px] md:min-h-[450px]">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center px-6 md:px-10 py-12 md:py-20 bg-[var(--surface)] rounded-lg md:rounded-[50px] border border-[var(--line)] max-w-lg w-full mx-auto">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-[var(--accent-soft)] rounded-lg md:rounded-lg flex items-center justify-center mb-6 md:mb-8 relative">
                <div className="absolute inset-0 bg-[var(--accent-soft)] rounded-full animate-pulse"></div>
                <Ghost size={32} className="md:w-12 md:h-12 text-[var(--accent)] relative z-10" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl md:text-3xl font-black text-[var(--ink)] mb-2 md:mb-4 tracking-tight">{searchQuery ? "没找到相关记忆" : "朋友圈空空如也"}</h2>
              <p className="text-[var(--ink-soft)] font-medium text-sm md:text-lg leading-relaxed px-2 md:px-4">{searchQuery ? `尝试精简你的搜索词，或者换个心情再次出发。` : `还没有记录下任何生活碎片呢。`}</p>
            </motion.div>
          </div>
        )}
      </LayoutGroup>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#14161a] flex items-center justify-center cursor-pointer overflow-hidden"
            onClick={() => setLightbox(null)}
          >
            {lightbox.images.length > 1 && (
              <>
                <button className="absolute left-4 md:left-12 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center bg-[var(--surface-alt)] hover:bg-[var(--surface)] rounded-full text-[var(--ink)] transition-all z-50 border border-[var(--line)]" onClick={prevImg}><ChevronLeft size={24} className="md:w-9 md:h-9"/></button>
                <button className="absolute right-4 md:right-12 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center bg-[var(--surface-alt)] hover:bg-[var(--surface)] rounded-full text-[var(--ink)] transition-all z-50 border border-[var(--line)]" onClick={nextImg}><ChevronRight size={24} className="md:w-9 md:h-9"/></button>
              </>
            )}
            <motion.div key={lightbox.index} initial={{ opacity: 0, scale: 0.9, x: 50 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9, x: -50 }} className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-12 pointer-events-none">
              <img src={lightbox.images[lightbox.index]} className="max-w-full max-h-[75vh] md:max-h-[85vh] object-contain rounded-lg border border-[var(--line)] pointer-events-auto" alt="fullscreen" />
              <div className="absolute bottom-8 md:bottom-10 px-4 md:px-5 py-1.5 md:py-2 rounded-full bg-[var(--surface-alt)] text-[var(--ink)] text-[10px] md:text-xs font-black tracking-widest border border-[var(--line)]">
                {lightbox.index + 1} / {lightbox.images.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
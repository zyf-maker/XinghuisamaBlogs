"use client";

import { asset } from '../../lib/base';

import { useState, useMemo, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import PageTransition from '../../components/PageTransition';
import { albums, Album } from '../../data/albums';

export default function PhotoWallClient() {
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [selectedImage, setSelectedImage] = useState<{url: string, caption?: string} | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);

    const timer = setTimeout(() => {
      setActiveQuery(searchQuery.toLowerCase());
      setIsTransitioning(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { matchedAlbums, matchedPhotos } = useMemo(() => {
    if (!activeQuery) return { matchedAlbums: albums, matchedPhotos: [] };

    const matchedAlbums = albums.filter(album =>
      album.title.toLowerCase().includes(activeQuery) ||
      album.description.toLowerCase().includes(activeQuery)
    );

    const matchedPhotos = albums.flatMap(album =>
      album.photos.map(p => ({ ...p, albumName: album.title }))
    ).filter(photo => photo.caption?.toLowerCase().includes(activeQuery));

    return { matchedAlbums, matchedPhotos };
  }, [activeQuery]);

  return (
    <div className="min-h-screen relative pb-32">
      <Navbar />

      <PageTransition>
        <div className="w-full relative z-10">

          {!currentAlbum && (
            <div className="animate-fade-in-up">
              <div className="flex flex-col gap-6 border-b border-[var(--line)] pb-9 mb-10 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="eyebrow">Gallery · {albums.length} 个相册</p>
                  <h1 className="mt-3 font-serif text-[2rem] font-black leading-[1.15] tracking-tight text-[var(--ink)] sm:text-[2.5rem]">相册</h1>
                  <p className="mt-3 max-w-2xl text-[13.5px] leading-[1.85] text-[var(--ink-soft)]">一些拍下来的、被留下来的时刻。</p>
                </div>

                <div className="relative w-full md:w-72 group shrink-0">
                  <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="搜索相册或照片描述"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-[var(--surface)] border border-[var(--line-strong)] rounded-md text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>
              </div>

              <div className={`transition-opacity duration-300 ease-in-out ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>

                {activeQuery && matchedPhotos.length > 0 && (
                  <div className="mb-16">
                    <h3 className="text-xl font-bold text-[var(--ink)] mb-6 flex items-center gap-2">
                      <span className="w-2 h-6 bg-[var(--accent)] rounded-full"></span>
                      匹配的单张照片 ({matchedPhotos.length})
                    </h3>
                    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
                      {matchedPhotos.map((photo, index) => (
                        <div
                          key={`search-photo-${index}`}
                          onClick={() => setSelectedImage(photo)}
                          className="break-inside-avoid relative group rounded-lg overflow-hidden cursor-zoom-in bg-[var(--surface)] border border-[var(--line)] transition-transform duration-500 hover:scale-[1.02]"
                        >
                          <img src={asset(photo.url)} alt={photo.caption} className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                          <div
                            className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            style={{ background: "linear-gradient(to top, rgba(20,22,26,0.8), rgba(20,22,26,0) 58%)" }}
                          >
                            <span className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#f7f5f0]/70">{photo.albumName}</span>
                            <p className="text-sm font-medium text-[#f7f5f0]">{photo.caption}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeQuery && matchedAlbums.length > 0 && (
                  <h3 className="text-xl font-bold text-[var(--ink)] mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-[var(--accent)] rounded-full"></span>
                    相关相册 ({matchedAlbums.length})
                  </h3>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {matchedAlbums.map((album, index) => (
                    <div
                      key={album.id}
                      onClick={() => { setSearchQuery(''); setCurrentAlbum(album); }}
                      className="group cursor-pointer"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-[var(--line)] bg-[var(--surface-alt)]">
                        <img
                          src={asset(album.cover)}
                          alt={album.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                        <div
                          className="absolute inset-0 flex items-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          style={{ background: "linear-gradient(to top, rgba(16,18,22,0.94), rgba(16,18,22,0) 62%)" }}
                        >
                          <span className="rounded-sm bg-[rgba(16,18,22,0.86)] px-2 py-1 font-mono text-[11px] tracking-[0.14em] text-white">
                            展开相册 →
                          </span>
                        </div>
                      </div>

                      <div className="pt-4">
                        <div className="flex items-baseline justify-between gap-3">
                          <h2 className="font-serif text-[16px] font-bold text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                            {album.title}
                          </h2>
                          <span className="shrink-0 font-mono text-[10px] tracking-[0.1em] text-[var(--muted)]">
                            {album.date} · {album.photos.length} 张
                          </span>
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-[var(--ink-soft)]">{album.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {activeQuery && matchedAlbums.length === 0 && matchedPhotos.length === 0 && (
                  <div className="text-center py-20 text-[var(--ink-soft)] font-medium">
                    没有找到相关的照片或相册。
                  </div>
                )}
              </div>
            </div>
          )}

          {currentAlbum && (
            <div className="animate-fade-in-up">
              <div className="mb-10 flex flex-col gap-5 border-b border-[var(--line)] pb-8 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <button
                      onClick={() => setCurrentAlbum(null)}
                      className="group inline-flex items-center gap-2 text-[12.5px] text-[var(--ink-soft)] transition-colors hover:text-[var(--accent)]"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      返回相册列表
                    </button>
                  </div>
                  <p className="eyebrow">{currentAlbum.date} · {currentAlbum.photos.length} 张</p>
                  <h1 className="mt-3 font-serif text-[2rem] font-black leading-[1.15] tracking-tight text-[var(--ink)] sm:text-[2.5rem]">{currentAlbum.title}</h1>
                  <p className="mt-3 max-w-2xl text-[13.5px] leading-[1.85] text-[var(--ink-soft)]">{currentAlbum.description}</p>
                </div>
              </div>

              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
                {currentAlbum.photos.map((photo, index) => (
                  <div
                    key={`${photo.url}-${index}`}
                    onClick={() => setSelectedImage(photo)}
                    className="break-inside-avoid relative group rounded-lg overflow-hidden cursor-zoom-in bg-[var(--surface)] border border-[var(--line)] transition-transform duration-500 hover:scale-[1.02] animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <img src={asset(photo.url)} alt={photo.caption || '照片'} className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    <div
                      className="absolute inset-0 flex items-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: "linear-gradient(to top, rgba(20,22,26,0.78), rgba(20,22,26,0) 55%)" }}
                    >
                      {photo.caption && <p className="text-[13px] font-medium text-[#f7f5f0]">{photo.caption}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </PageTransition>

      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-[#14161a] flex flex-col items-center justify-center p-4 sm:p-10 cursor-zoom-out animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-6 right-6 text-[var(--ink)] hover:text-[var(--accent)] transition-colors bg-[var(--surface)] border border-[var(--line-strong)] rounded-full p-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <img
            src={asset(selectedImage.url)}
            alt={selectedImage.caption || '全屏照片'}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {selectedImage.caption && (
            <div className="absolute bottom-10 px-6 py-3 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full text-[var(--ink)] text-sm font-medium tracking-wide">
              {selectedImage.caption}
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}
"use client";

import { useEffect, useRef, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, RefreshCcw, ListMusic, Mic2, Disc3, Volume2, VolumeX, Search, X, MessageSquare } from 'lucide-react';
import Navbar from '../../components/Navbar';
import PageTransition from '../../components/PageTransition';
import { useMusic } from '../../components/MusicProvider';
import Comments from '../../components/Comments';

export default function MusicClient() {
  const {
    playlist, currentSong, isPlaying, progress, currentTime, duration, currentLyric,
    isLoading, togglePlay, nextSong, prevSong, handleSeek,
    playSong, selectSong,
    playMode, togglePlayMode,
    volume, setVolume, isMuted, toggleMute
  } = useMusic();

  const lyricContainerRef = useRef<HTMLDivElement>(null);
  const activeLyricRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'lyrics' | 'playlist'>('lyrics');
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [parsedLyrics, setParsedLyrics] = useState<any[]>([]);

  useEffect(() => {
    if (!currentSong) {
      setParsedLyrics([]);
      return;
    }

    const rawLrc = currentSong.lrc || currentSong.lyric || (typeof currentSong.lyrics === 'string' ? currentSong.lyrics : '');

    if (Array.isArray(currentSong.lyrics) && currentSong.lyrics.length > 0) {
      setParsedLyrics(currentSong.lyrics);
      return;
    }

    if (!rawLrc || typeof rawLrc !== 'string') {
      setParsedLyrics([]);
      return;
    }

    const lines = rawLrc.split('\n');
    const parsed = [];
    const timeExp = /\[(\d{2,}):(\d{2})(?:[.:](\d{2,3}))?\]/g;
    let hasValidTime = false;

    for (const line of lines) {
      const text = line.replace(/\[\d{2,}:\d{2}(?:[.:]\d{2,3})?\]/g, '').trim();
      if (!text) continue;

      let match;
      while ((match = timeExp.exec(line)) !== null) {
        hasValidTime = true;
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        const ms = match[3] ? parseFloat(`0.${match[3]}`) : 0;
        parsed.push({ time: min * 60 + sec + ms, text });
      }
    }

    if (hasValidTime) {
      setParsedLyrics(parsed.sort((a, b) => a.time - b.time));
    } else {
      setParsedLyrics(lines.map(l => ({ time: -1, text: l.trim() })).filter(l => l.text));
    }
  }, [currentSong?.id, currentSong?.lyric, currentSong?.lrc, currentSong?.lyrics]);

  const activeLyricIndex = useMemo(() => {
    if (!parsedLyrics.length) return -1;
    let idx = parsedLyrics.findIndex((l: any) => l.time > currentTime) - 1;
    if (idx === -2) idx = parsedLyrics.length - 1;
    return Math.max(0, idx);
  }, [currentTime, parsedLyrics]);

  useEffect(() => {
    if (activeLyricRef.current && lyricContainerRef.current && activeTab === 'lyrics') {
      const container = lyricContainerRef.current;
      const activeItem = activeLyricRef.current;
      const scrollTarget = activeItem.offsetTop - container.offsetHeight / 2 + activeItem.offsetHeight / 2;
      container.scrollTo({ top: scrollTarget, behavior: 'smooth' });
    }
  }, [activeLyricIndex, activeTab]);

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPlayModeIcon = () => {
    switch (playMode) {
      case 'loop': return <Repeat size={18} className="text-[var(--ink-soft)] hover:text-[var(--accent)] md:w-5 md:h-5" />;
      case 'single': return <RefreshCcw size={18} className="text-[var(--accent)] md:w-5 md:h-5" />;
      case 'random': return <Shuffle size={18} className="text-[var(--ink-soft)] hover:text-[var(--accent)] md:w-5 md:h-5" />;
      default: return <Repeat size={18} className="text-[var(--ink-soft)] md:w-5 md:h-5" />;
    }
  };

  const handlePlaySong = (index: number) => {
    if (typeof playSong === 'function') playSong(index);
    else if (typeof selectSong === 'function') selectSong(index);
  };

  const filteredPlaylist = useMemo(() => {
    if (!searchQuery.trim()) return playlist;
    const lowerQuery = searchQuery.toLowerCase();
    return playlist.filter((song: any) =>
      (song.title || song.name || '').toLowerCase().includes(lowerQuery) ||
      (song.artist || song.author || '').toLowerCase().includes(lowerQuery)
    );
  }, [playlist, searchQuery]);

  if (isLoading || !currentSong) {
    return (
      <div className="min-h-screen relative pb-32 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center animate-pulse gap-4">
          <Disc3 size={48} className="text-[var(--accent)] animate-spin" />
          <span className="font-black text-[var(--ink-soft)] tracking-widest text-sm">唤醒音频引擎中...</span>
        </div>
      </div>
    );
  }

  const songCover = currentSong.cover || currentSong.pic || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop";

  return (
    <div className="min-h-screen relative pb-10 flex flex-col">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-[-10%] bg-cover bg-center transition-all duration-1000 blur-[70px] opacity-20 saturate-100" style={{ backgroundImage: `url(${songCover})` }} />
        <div className="absolute inset-0 bg-[var(--paper)]/92" />
      </div>

      <Navbar />

      <PageTransition>
        <div className="w-full relative z-10">
          <div className="animate-fade-in-up mb-8 md:mb-10 border-b border-[var(--line)] pb-8 md:pb-9">
            <h1 className="font-serif text-[2rem] font-black leading-[1.15] tracking-tight text-[var(--ink)] sm:text-[2.5rem]">音乐</h1>
            <p className="mt-3 max-w-2xl text-[13.5px] leading-[1.85] text-[var(--ink-soft)]">
              写东西的时候循环的那些曲子。歌词滚动，点一句可以跳过去。
            </p>
          </div>

          <div className="flex flex-col md:grid md:grid-cols-12 gap-6 md:gap-8 w-full md:items-stretch md:h-[calc(100vh-320px)] md:min-h-[600px] md:max-h-[720px]">

            {/* ====== 左侧/顶部：播放控制台 ====== */}
            <div className="md:col-span-5 flex flex-col bg-[var(--surface)] border border-[var(--line-strong)] rounded-lg p-6 md:p-10 relative overflow-hidden transition-all duration-500 shrink-0 min-h-[460px] sm:min-h-[500px] md:min-h-0">

              <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full overflow-hidden py-4 md:py-0">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-64 lg:h-64 flex-shrink-0 aspect-square mb-6 md:mb-10 flex items-center justify-center">
                   <div className={`absolute inset-0 m-auto w-[85%] h-[85%] bg-[var(--accent-soft)] blur-[35px] rounded-full transition-all duration-1000 z-0 ${isPlaying ? 'opacity-90 scale-105' : 'opacity-20 scale-100'}`}></div>
                   <div className="absolute inset-0 m-auto w-[90%] h-[90%] rounded-full z-0"></div>
                   <motion.div className={`absolute inset-0 w-full h-full rounded-full border-[4px] md:border-[6px] border-[var(--line-strong)] overflow-hidden transition-transform duration-700 z-10 rotating-disc ${isPlaying ? 'scale-100' : 'scale-95'}`}
                     style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}>
                     <img src={songCover} alt="cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                     <div className="absolute inset-0 m-auto w-10 h-10 md:w-12 md:h-12 bg-[var(--surface)] rounded-full z-30 border border-[var(--line)]"></div>
                     <div className="absolute inset-0 z-20 rounded-full pointer-events-none opacity-20" style={{ background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.4), transparent, rgba(255,255,255,0.4), transparent)' }}></div>
                   </motion.div>
                </div>
                <div className="w-full text-center px-2 md:px-4 mb-2 md:mb-6">
                  <h1 className="text-lg md:text-xl lg:text-2xl font-black text-[var(--ink)] truncate tracking-tight">{currentSong.title || currentSong.name}</h1>
                  <h2 className="text-xs md:text-sm font-bold text-[var(--ink-soft)] truncate mt-1 md:mt-2 tracking-widest">{currentSong.artist || currentSong.author}</h2>
                </div>
              </div>

              <div className="w-full mt-auto relative z-20">
                <div className="w-full flex flex-col gap-1.5 mb-6 md:mb-8 px-1 md:px-3">
                  <input type="range" min="0" max="100" value={progress || 0} onChange={handleSeek} className="w-full h-1 md:h-1.5 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, var(--accent) ${progress}%, rgba(0, 0, 0, 0.15) 0)` }} />
                  <div className="flex justify-between text-[10px] md:text-xs font-bold text-[var(--ink-soft)] tabular-nums"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
                </div>
                <div className="w-full flex items-center justify-between px-1 md:px-2 lg:px-4">
                  <button onClick={togglePlayMode} className="p-2 transition-transform hover:scale-110">{getPlayModeIcon()}</button>
                  <div className="flex items-center gap-3 md:gap-4 lg:gap-6">
                    <button onClick={prevSong} className="p-2 text-[var(--ink)] hover:text-[var(--accent)] transition-transform hover:scale-110"><SkipBack size={24} className="md:w-7 md:h-7" fill="currentColor" /></button>
                    <button onClick={togglePlay} className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 flex items-center justify-center bg-[var(--accent)] text-[var(--accent-ink)] rounded-full hover:scale-105">
                      {isPlaying ? <Pause size={28} className="md:w-8 md:h-8" fill="currentColor" /> : <Play size={28} className="md:w-8 md:h-8 ml-1" fill="currentColor" />}
                    </button>
                    <button onClick={nextSong} className="p-2 text-[var(--ink)] hover:text-[var(--accent)] transition-transform hover:scale-110"><SkipForward size={24} className="md:w-7 md:h-7" fill="currentColor" /></button>
                  </div>
                  <div className="flex items-center" onMouseLeave={() => setShowVolumeSlider(false)}>
                    <AnimatePresence>
                      {showVolumeSlider && (
                        <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 80, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="hidden md:flex overflow-hidden items-center mr-2 bg-[var(--surface)] rounded-full px-3 py-1.5 border border-[var(--line)]">
                          <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : (volume || 0)} onChange={(e) => setVolume && setVolume(Number(e.target.value))} className="w-16 h-1 appearance-none rounded-full cursor-pointer" style={{ background: `linear-gradient(to right, var(--accent) ${(volume || 0) * 100}%, rgba(0, 0, 0, 0.15) 0)` }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button onClick={() => setShowVolumeSlider(!showVolumeSlider)} onDoubleClick={toggleMute} className={`p-2 rounded-full transition-all ${showVolumeSlider ? 'bg-[var(--accent)] text-[var(--accent-ink)] shadow-sm' : 'text-[var(--accent)] hover:text-[var(--accent)]'}`}>{isMuted || volume === 0 ? <VolumeX size={18} className="md:w-5 md:h-5"/> : <Volume2 size={18} className="md:w-5 md:h-5" />}</button>
                  </div>
                </div>
              </div>
            </div>

            {/* ====== 右侧/底部：歌词与歌单面板 ====== */}
            <div className="md:col-span-7 flex flex-col bg-[var(--surface)] border border-[var(--line-strong)] rounded-lg relative transition-colors duration-700 overflow-hidden h-[450px] md:h-auto shrink-0">
              <div className="flex items-center justify-center gap-1 p-1 mt-4 md:mt-6 mx-auto bg-[var(--surface)] rounded-full border border-[var(--line-strong)] w-48 md:w-64 z-20 shrink-0">
                <button onClick={() => setActiveTab('lyrics')} className={`flex-1 py-1.5 md:py-2 rounded-full font-black text-xs md:text-[13px] transition-all ${activeTab === 'lyrics' ? 'bg-[var(--accent)] text-[var(--accent-ink)] shadow-sm' : 'text-[var(--accent)]'}`}>歌词</button>
                <button onClick={() => setActiveTab('playlist')} className={`flex-1 py-1.5 md:py-2 rounded-full font-black text-xs md:text-[13px] transition-all ${activeTab === 'playlist' ? 'bg-[var(--accent)] text-[var(--accent-ink)] shadow-sm' : 'text-[var(--accent)]'}`}>歌单</button>
              </div>

              <div className="flex-1 relative mt-2 flex flex-col overflow-hidden">
                {activeTab === 'lyrics' && (
                  <div className="absolute inset-0 flex flex-col h-full animate-in fade-in duration-300">
                    <div className="absolute top-0 left-0 right-0 h-32 md:h-40 z-10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 h-32 md:h-40 z-10 pointer-events-none" />
                    <div ref={lyricContainerRef} className="h-full overflow-y-auto no-scrollbar scroll-smooth relative px-4 md:px-6 lyric-mask-container">
                        <div className="py-[30vh] md:py-[35vh] flex flex-col gap-4 md:gap-6 text-center lg:px-10">
                            {parsedLyrics.length > 0 ? (
                              parsedLyrics.map((line: any, index: number) => {
                                const isActive = index === activeLyricIndex;
                                return (
                                  <div key={index} ref={isActive ? activeLyricRef : null}
                                    className={`transition-all duration-700 cursor-pointer px-2 md:px-4 rounded-lg ${isActive ? 'opacity-100 scale-105 py-2 md:py-3 bg-[var(--surface-alt)]' : 'opacity-20 hover:opacity-40'}`}
                                    onClick={() => duration > 0 && handleSeek({ target: { value: String((line.time / duration) * 100) } } as any)}
                                  >
                                    <p className={`font-black tracking-tight leading-relaxed transition-all duration-700 ${isActive ? 'text-lg md:text-2xl text-[var(--accent)]' : 'text-sm md:text-lg text-[var(--accent)]'}`} style={isActive ? { textShadow: '0 0 20px rgba(168, 67, 43, 0.15)' } : {}}>{line.text}</p>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="h-full flex items-center justify-center">
                                 <div className="flex flex-col items-center gap-3 md:gap-4">
                                    <Disc3 className="animate-spin text-[var(--accent)]" size={32} />
                                    <p className="text-base md:text-xl font-black text-[var(--accent)] animate-pulse">{currentLyric || "正在加载歌词…"}</p>
                                 </div>
                              </div>
                            )}
                        </div>
                    </div>
                  </div>
                )}
                {activeTab === 'playlist' && (
                  <div className="absolute inset-0 px-4 md:px-8 pb-4 md:pb-8 pt-2 md:pt-4 animate-in fade-in duration-300 flex flex-col">
                    <div className="relative w-full max-w-md mx-auto group mb-4 md:mb-8 shrink-0">
                      <div className="absolute inset-0 bg-[var(--accent-soft)] blur-xl group-focus-within:bg-[var(--accent-soft)] transition-all rounded-full" />
                      <Search className="w-4 h-4 md:w-5 md:h-5 absolute left-4 top-1/2 -translate-y-1/2 z-10 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors" />
                      <input type="text" placeholder="搜索音轨..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-10 md:h-12 pl-10 md:pl-12 pr-10 md:pr-12 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all" />
                      {searchQuery && (<button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-[#14161a] rounded-full transition-colors"><X size={14} className="text-[var(--ink-soft)]" /></button>)}
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-2 md:gap-2.5">
                      <AnimatePresence mode='popLayout'>
                        {filteredPlaylist.map((song: any) => {
                          const originalIndex = playlist.findIndex((s: any) => s.id === song.id);
                          const isPlayingThis = (song.id === currentSong.id);
                          return (
                            <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={song.id} onClick={() => handlePlaySong(originalIndex)} className={`group flex items-center justify-between p-3 md:p-4 rounded-md md:rounded-lg cursor-pointer transition-all border ${isPlayingThis ? 'bg-[var(--surface)] shadow-sm border-[var(--line-strong)]' : 'border-transparent hover:bg-[var(--surface-alt)]'}`}>
                              <div className="flex items-center gap-3 md:gap-4 w-[85%]">
                                <div className="relative w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-lg md:rounded-md overflow-hidden">
                                  <img src={song.cover || song.pic} alt="cover" className="w-full h-full object-cover" />
                                  {isPlayingThis && isPlaying && <div className="absolute inset-0 bg-[#14161a] flex items-center justify-center"><div className="flex gap-[3px] items-end h-2 md:h-3"><span className="w-0.5 bg-[var(--surface)] rounded-full animate-[bounce_1s_infinite_0ms]" /><span className="w-0.5 bg-[var(--surface)] rounded-full animate-[bounce_1s_infinite_200ms]" /><span className="w-0.5 bg-[var(--surface)] rounded-full animate-[bounce_1s_infinite_400ms]" /></div></div>}
                                </div>
                                <div className="flex flex-col truncate"><span className={`text-sm md:text-[15px] font-black truncate ${isPlayingThis ? 'text-[var(--accent)]' : 'text-[var(--accent)]'}`}>{song.title || song.name}</span><span className="text-[10px] md:text-[11px] font-medium text-[var(--ink-soft)] truncate mt-0.5">{song.artist || song.author}</span></div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ====== 留言板 ====== */}
          <div className="mt-8 md:mt-12 mb-20 bg-[var(--surface)] rounded-lg md:rounded-lg border border-[var(--line-strong)] overflow-hidden transition-colors duration-700 relative">
             <div className="px-5 sm:px-8 md:px-16 py-8 md:py-12 relative">
                <div className="flex items-center gap-3 mb-6 md:mb-8 border-b border-[var(--line-strong)] pb-4 md:pb-6">
                   <div className="w-10 h-10 md:w-12 md:h-12 rounded-md md:rounded-lg bg-[var(--accent-soft)] flex items-center justify-center"><MessageSquare className="text-[var(--accent)] w-5 h-5 md:w-6 md:h-6" /></div>
                   <div><h3 className="text-xl md:text-2xl font-black text-[var(--ink)] tracking-tight">留言</h3><p className="text-xs md:text-sm text-[var(--ink-soft)] font-medium">听到这一首，你想起了什么。</p></div>
                </div>
                <div className="relative"><Comments /></div>
             </div>
          </div>
        </div>
      </PageTransition>

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .rotating-disc { animation: spin 20s linear infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .lyric-mask-container {
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
          mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
        }
      `}</style>
    </div>
  );
}
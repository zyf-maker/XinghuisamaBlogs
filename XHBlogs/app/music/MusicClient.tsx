"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  RefreshCcw,
  Volume2,
  VolumeX,
  Search,
  X,
} from "lucide-react";
import { useMusic } from "../../components/MusicProvider";
import { siteConfig } from "../../siteConfig";
import Comments from "../../components/Comments";

type LyricLine = { time: number; text: string };

/**
 * 音乐页。
 * 左边一张播放器卡（封面 / 曲名 / 进度 / 控制），右边歌词与歌单二选一。
 * 控制条只用固定宽度的三组按钮，不再叠弹出式音量条——那个弹层会把
 * 最右侧的音量按钮顶出卡片。
 */
export default function MusicClient() {
  const {
    playlist,
    currentSong,
    isPlaying,
    progress,
    currentTime,
    duration,
    isLoading,
    togglePlay,
    nextSong,
    prevSong,
    handleSeek,
    playSong,
    selectSong,
    playMode,
    togglePlayMode,
    volume,
    setVolume,
    isMuted,
    toggleMute,
  } = useMusic();

  const lyricRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<"lyrics" | "playlist">("lyrics");
  const [query, setQuery] = useState("");
  const [lines, setLines] = useState<LyricLine[]>([]);

  useEffect(() => {
    if (!currentSong) {
      setLines([]);
      return;
    }
    const raw =
      currentSong.lrc ||
      currentSong.lyric ||
      (typeof currentSong.lyrics === "string" ? currentSong.lyrics : "");

    if (Array.isArray(currentSong.lyrics) && currentSong.lyrics.length > 0) {
      setLines(currentSong.lyrics as LyricLine[]);
      return;
    }
    if (!raw || typeof raw !== "string") {
      setLines([]);
      return;
    }

    const parsed: LyricLine[] = [];
    const timeExp = /\[(\d{2,}):(\d{2})(?:[.:](\d{2,3}))?\]/g;
    let timed = false;

    for (const line of raw.split("\n")) {
      const text = line.replace(/\[\d{2,}:\d{2}(?:[.:]\d{2,3})?\]/g, "").trim();
      if (!text) continue;
      let m: RegExpExecArray | null;
      timeExp.lastIndex = 0;
      while ((m = timeExp.exec(line)) !== null) {
        timed = true;
        const ms = m[3] ? parseFloat(`0.${m[3]}`) : 0;
        parsed.push({ time: parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + ms, text });
      }
    }

    setLines(
      timed
        ? parsed.sort((a, b) => a.time - b.time)
        : raw
            .split("\n")
            .map((l) => ({ time: -1, text: l.trim() }))
            .filter((l) => l.text),
    );
  }, [currentSong?.id, currentSong?.lrc, currentSong?.lyric, currentSong?.lyrics]);

  const activeIndex = useMemo(() => {
    if (!lines.length) return -1;
    let idx = lines.findIndex((l) => l.time > currentTime) - 1;
    if (idx === -2) idx = lines.length - 1;
    return Math.max(0, idx);
  }, [currentTime, lines]);

  useEffect(() => {
    if (activeRef.current && lyricRef.current && tab === "lyrics") {
      const c = lyricRef.current;
      const a = activeRef.current;
      c.scrollTo({ top: a.offsetTop - c.offsetHeight / 2 + a.offsetHeight / 2, behavior: "smooth" });
    }
  }, [activeIndex, tab]);

  const fmt = (t: number) => {
    if (!t || Number.isNaN(t)) return "0:00";
    return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
  };

  const modeIcon = () => {
    if (playMode === "single") return <RefreshCcw size={17} className="text-[var(--accent)]" />;
    if (playMode === "random") return <Shuffle size={17} className="text-[var(--ink-soft)]" />;
    return <Repeat size={17} className="text-[var(--ink-soft)]" />;
  };

  const playAt = (index: number) => {
    if (typeof playSong === "function") playSong(index);
    else if (typeof selectSong === "function") selectSong(index);
  };

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return playlist;
    return playlist.filter((s: any) =>
      `${s.title || s.name || ""} ${s.artist || s.author || ""}`.toLowerCase().includes(q),
    );
  }, [playlist, query]);

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--card-line)] border-t-[var(--accent)]" />
        <span className="text-[12.5px] text-[var(--muted)]">正在加载曲目…</span>
      </div>
    );
  }

  // 接口限流时不摆空屏：列出配置里的曲目，说明原因，页面结构保持完整。
  if (!currentSong) {
    return (
      <div className="space-y-4">
        <div className="pcard p-5">
          <p className="text-[13.5px] font-semibold text-[var(--ink)]">曲库暂时拿不到</p>
          <p className="mt-1.5 text-[12.5px] leading-[1.8] text-[var(--muted)]">
            播放依赖网易云的公开接口，它有时会限流。以下是配置里排好的曲目，接口恢复后即可播放。
          </p>
        </div>
        <ol className="pcard divide-y divide-[var(--card-line)]">
          {siteConfig.cloudMusicIds.map((id, i) => (
            <li key={id} className="flex items-center gap-3 px-4 py-3">
              <span className="w-6 shrink-0 text-[11px] tabular-nums text-[var(--muted)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 text-[13px] text-[var(--ink-soft)]">曲目 {id}</span>
              <a
                href={`https://music.163.com/#/song?id=${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-[11.5px] text-[var(--muted)] hover:text-[var(--accent)]"
              >
                网易云 ↗
              </a>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  const cover =
    currentSong.cover ||
    currentSong.pic ||
    "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop";

  return (
    <div className="w-full">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        {/* 播放器 */}
        <section className="pcard flex flex-col p-5">
          <div className="relative mx-auto aspect-square w-full max-w-[240px] overflow-hidden rounded-[var(--r-md)] border border-[var(--card-line)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt={currentSong.title || currentSong.name || "cover"} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          </div>

          <div className="mt-4 text-center">
            <h2 className="truncate text-[15px] font-semibold text-[var(--ink)]">
              {currentSong.title || currentSong.name}
            </h2>
            <p className="mt-1 truncate text-[12.5px] text-[var(--muted)]">
              {currentSong.artist || currentSong.author}
            </p>
          </div>

          <div className="mt-4">
            <input
              type="range"
              min="0"
              max="100"
              value={progress || 0}
              onChange={handleSeek}
              className="h-1 w-full cursor-pointer appearance-none rounded-full"
              style={{ background: `linear-gradient(to right, var(--accent) ${progress}%, var(--card-line) 0)` }}
            />
            <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-[var(--muted)]">
              <span>{fmt(currentTime)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button onClick={togglePlayMode} className="p-1.5 transition-opacity hover:opacity-70" title="播放模式">
              {modeIcon()}
            </button>
            <div className="flex items-center gap-2">
              <button onClick={prevSong} className="p-1.5 text-[var(--ink-soft)] transition-colors hover:text-[var(--accent)]">
                <SkipBack size={20} fill="currentColor" />
              </button>
              <button
                onClick={togglePlay}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)] transition-opacity hover:opacity-88"
              >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="ml-0.5" fill="currentColor" />}
              </button>
              <button onClick={nextSong} className="p-1.5 text-[var(--ink-soft)] transition-colors hover:text-[var(--accent)]">
                <SkipForward size={20} fill="currentColor" />
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleMute}
                className="p-1.5 text-[var(--ink-soft)] transition-colors hover:text-[var(--accent)]"
                title={isMuted ? "取消静音" : "静音"}
              >
                {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume || 0}
                onChange={(e) => setVolume && setVolume(Number(e.target.value))}
                className="hidden h-1 w-14 cursor-pointer appearance-none rounded-full sm:block"
                style={{ background: `linear-gradient(to right, var(--accent) ${(isMuted ? 0 : volume || 0) * 100}%, var(--card-line) 0)` }}
              />
            </div>
          </div>
        </section>

        {/* 歌词 / 歌单 */}
        <section className="pcard flex min-h-[420px] flex-col overflow-hidden">
          <div className="flex items-center gap-1 border-b border-[var(--card-line)] p-2">
            <button
              onClick={() => setTab("lyrics")}
              className={`chip ${tab === "lyrics" ? "chip-on" : ""}`}
            >
              歌词
            </button>
            <button
              onClick={() => setTab("playlist")}
              className={`chip ${tab === "playlist" ? "chip-on" : ""}`}
            >
              歌单 · {playlist.length}
            </button>
          </div>

          {tab === "lyrics" ? (
            <div ref={lyricRef} className="scroll-quiet relative flex-1 overflow-y-auto px-5 py-6">
              {lines.length > 0 ? (
                <div className="flex flex-col gap-2.5 text-center">
                  {lines.map((line, i) => {
                    const on = i === activeIndex;
                    return (
                      <div
                        key={`${line.time}-${i}`}
                        ref={on ? activeRef : null}
                        onClick={() =>
                          duration > 0 &&
                          handleSeek({ target: { value: String((line.time / duration) * 100) } } as any)
                        }
                        className={`cursor-pointer rounded-[var(--r-sm)] px-2 py-1.5 transition-colors ${
                          on ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--surface-alt)]"
                        }`}
                      >
                        <p
                          className={`text-[13.5px] leading-[1.85] ${
                            on ? "font-medium text-[var(--accent)]" : "text-[var(--ink-soft)]"
                          }`}
                        >
                          {line.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="flex h-full items-center justify-center text-[13px] text-[var(--muted)]">
                  这首歌没有歌词文件。
                </p>
              )}
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="relative p-3">
                <Search size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搜曲名或歌手…"
                  className="h-9 w-full rounded-[var(--r-sm)] border border-[var(--card-line)] bg-[var(--surface)] pl-8 pr-8 text-[12.5px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                    <X size={13} />
                  </button>
                )}
              </div>

              <ol className="scroll-quiet min-h-0 flex-1 overflow-y-auto px-2 pb-2">
                {list.map((song: any) => {
                  const index = playlist.findIndex((s: any) => s.id === song.id);
                  const on = song.id === currentSong.id;
                  return (
                    <li key={song.id}>
                      <button
                        onClick={() => playAt(index)}
                        className={`flex w-full items-center gap-3 rounded-[var(--r-sm)] px-2 py-2 text-left transition-colors ${
                          on ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--surface-alt)]"
                        }`}
                      >
                        <span className="w-5 shrink-0 text-[11px] tabular-nums text-[var(--muted)]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block truncate text-[13px] ${
                              on ? "font-medium text-[var(--accent)]" : "text-[var(--ink)]"
                            }`}
                          >
                            {song.title || song.name}
                          </span>
                          <span className="mt-0.5 block truncate text-[11.5px] text-[var(--muted)]">
                            {song.artist || song.author}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
                {list.length === 0 && (
                  <li className="px-3 py-10 text-center text-[12.5px] text-[var(--muted)]">没有匹配的曲目。</li>
                )}
              </ol>
            </div>
          )}
        </section>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-[13px] font-medium text-[var(--ink-soft)]">留言</h2>
        <div className="pcard p-5">
          <Comments />
        </div>
      </section>
    </div>
  );
}

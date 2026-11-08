"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMusic } from "./MusicProvider";

function formatTime(time: number) {
  if (!time || Number.isNaN(time)) return "00:00";
  return `${String(Math.floor(time / 60)).padStart(2, "0")}:${String(Math.floor(time % 60)).padStart(2, "0")}`;
}

/** 首页侧栏的迷你播放器：细线分栏、无阴影、朱砂进度条 */
export default function MiniPlayer() {
  const { playlist, currentSong, isPlaying, progress, currentTime, duration, isLoading, togglePlay, nextSong, prevSong, handleSeek } =
    useMusic();
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const text = currentSong?.lyrics?.[0]?.text ?? "";
    setTyped("");
    if (!text) return;
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, 55);
    return () => clearInterval(timer);
  }, [currentSong]);

  if (isLoading) {
    return (
      <div className="glass glass-sheen p-5">
        <p className="mt-3 font-mono text-[11px] text-[var(--muted)]">连接中 …</p>
      </div>
    );
  }

  if (!playlist.length || !currentSong) {
    return (
      <div className="glass glass-sheen p-5">
        <p className="mt-3 text-[13px] text-[var(--muted)]">歌单尚未配置。</p>
      </div>
    );
  }

  return (
    <div className="glass glass-sheen overflow-hidden">
      <div className="flex items-center gap-4 border-b border-[var(--line)] p-4">
        <img
          src={currentSong.cover}
          alt={currentSong.title}
          referrerPolicy="no-referrer"
          className={`h-14 w-14 shrink-0 rounded-md border border-[var(--line)] object-cover ${
            isPlaying ? "animate-[spin_9s_linear_infinite]" : ""
          }`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-[var(--muted)]">正在播放</p>
          <p className="mt-1 truncate font-serif text-[15px] font-bold text-[var(--ink)]">{currentSong.title}</p>
          <p className="truncate text-[12px] text-[var(--muted)]">{currentSong.artist}</p>
        </div>
        <Link href="/music" className="text-[11px] text-[var(--muted)] hover:text-[var(--accent)]">
          ALL →
        </Link>
      </div>

      <div className="px-4 pt-3">
        <p className="h-5 truncate font-serif text-[12.5px] text-[var(--ink-soft)]">
          {typed}
          <span className="ml-0.5 inline-block h-3 w-px translate-y-0.5 bg-[var(--accent)] animate-cursor" />
        </p>
        <div className="mt-3 flex items-center gap-2 font-mono text-[10px] text-[var(--muted)]">
          <span className="w-9 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            aria-label="播放进度"
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-[var(--surface-alt)] outline-none"
            style={{
              background: `linear-gradient(to right, var(--accent) ${progress}%, var(--surface-alt) ${progress}%)`,
            }}
          />
          <span className="w-9">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={prevSong} aria-label="上一首" className="text-[var(--muted)] transition-colors hover:text-[var(--ink)]">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "暂停" : "播放"}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)] transition-transform hover:scale-105"
        >
          {isPlaying ? (
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="ml-0.5 h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <button onClick={nextSong} aria-label="下一首" className="text-[var(--muted)] transition-colors hover:text-[var(--ink)]">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

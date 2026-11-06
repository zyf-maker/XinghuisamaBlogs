"use client";
import { useMusic } from './MusicProvider';
import { useState, useEffect } from 'react';

export default function SidebarLyric() {
  const { currentSong, currentLyric, isPlaying } = useMusic();
  const [displayedLyric, setDisplayedLyric] = useState("");

  useEffect(() => {
    setDisplayedLyric("");
    let i = 0;
    const targetText = currentLyric || "";
    if (!targetText) return;

    const typingInterval = setInterval(() => {
      if (i <= targetText.length) {
        setDisplayedLyric(targetText.slice(0, i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [currentLyric]);

  if (!currentSong) return null;

  return (
    <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--line-strong)] transition-colors duration-700">
      <h3 className="font-black text-[var(--ink)] mb-4 border-l-4 border-[var(--line-strong)] pl-2 text-sm">NOW PLAYING</h3>

      <div className="flex items-center gap-4 mb-4">
        {/* 旋转封面 */}
        <div
          className="w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--line)] animate-[spin_6s_linear_infinite]"
          style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
        >
          <img src={currentSong.cover} className="w-full h-full object-cover" alt="cover" />
        </div>

        <div className="flex-1 overflow-hidden">
          <h4 className="text-sm font-bold text-[var(--ink)] truncate">{currentSong.title}</h4>
          <p className="text-xs text-[var(--ink-soft)] truncate">{currentSong.artist}</p>
        </div>
      </div>

      {/* 歌词打字机 */}
      <div className="bg-[var(--surface-alt)] p-3 rounded-md min-h-[60px] flex items-center justify-center text-center">
        <p className="text-xs font-bold text-[var(--accent)]">
          {displayedLyric}
          <span className="inline-block w-[3px] h-3 ml-1 bg-[var(--accent)] animate-cursor align-middle"></span>
        </p>
      </div>

      <style>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-cursor { animation: cursorBlink 0.8s step-end infinite; }
      `}</style>
    </div>
  );
}
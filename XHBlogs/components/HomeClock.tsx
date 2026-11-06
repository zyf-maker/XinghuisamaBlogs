"use client";

import { useEffect, useState } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** 顶栏右侧的小状态块：本地时间 + 站点运行时长，全部客户端计算以免水合不一致 */
export default function HomeClock({ since }: { since: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const start = new Date(since || "2026-03-23T00:00:00").getTime();
  let uptime = "";
  if (now) {
    const diff = now.getTime() - start;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff / 3600000) % 24);
    uptime = `${days} 天 ${hours} 小时`;
  }

  return (
    <div className="flex items-center gap-6 font-mono text-[11px] tracking-[0.14em] text-[var(--muted)]">
      <span suppressHydrationWarning>
        {now ? `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}` : "--:--:--"}
      </span>
      <span className="hidden sm:inline">UP {uptime || "—"}</span>
    </div>
  );
}

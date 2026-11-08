"use client";

import { useRef, useState } from "react";
import Link from "next/link";

type Source = { title: string; key: string; category: string };
type Msg = { role: "user" | "assistant"; content: string; sources?: Source[] };

const SUGGESTIONS = [
  "RAG 的块大小怎么定？",
  "多智能体什么时候是过度设计？",
  "怎么给提示词做回归测试？",
  "本地跑一个 7B 模型值得吗？",
];

/** 知识库问答：流式输出，先出「参考了哪几篇」，再出正文。 */
export default function AskPanel() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || busy) return;

    setError("");
    setBusy(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);

    const controller = new AbortController();
    abortRef.current = controller;

    let answer = "";
    let sources: Source[] = [];

    const paint = () =>
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last && last.role === "assistant") {
          next[next.length - 1] = { role: "assistant", content: answer, sources };
        } else {
          next.push({ role: "assistant", content: answer, sources });
        }
        return next;
      });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/ask`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: question,
          history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const detail = await res.text().catch(() => "");
        throw new Error(detail.slice(0, 160) || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const raw = trimmed.slice(5).trim();
          if (!raw) continue;

          try {
            const evt = JSON.parse(raw);
            if (evt.type === "sources") {
              sources = evt.sources ?? [];
              paint();
            } else if (evt.type === "delta") {
              answer += evt.text;
              paint();
            } else if (evt.type === "error") {
              setError(evt.message || "生成失败。");
            }
          } catch {
            // 忽略坏帧
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError("请求失败，稍后再试。");
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
        <p className="text-[12.5px] font-medium text-[var(--ink)]">站内问答</p>
        <p className="text-[11px] text-[var(--muted)]">
          {busy ? "生成中" : "就绪"}
        </p>
      </div>

      <div className="min-h-[132px] space-y-4 px-4 py-5">
        {messages.length === 0 ? (
          <div>
            <p className="text-[13px] leading-[1.9] text-[var(--ink-soft)]">
              问一句，我会先在知识库里检索，再基于检索到的篇目回答，并把出处列出来。
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="tag transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <p className="max-w-[85%] rounded-[var(--r-md)] bg-[var(--surface-alt)] px-3.5 py-2 text-[13px] leading-[1.8] text-[var(--ink)]">
                {m.content}
              </p>
            </div>
          ) : (
            <div key={i} className="border-l-2 border-[var(--accent)] pl-3.5">
              {m.sources && m.sources.length > 0 ? (
                <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[11px] text-[var(--muted)]">参考</span>
                  {m.sources.map((s) => (
                    <Link
                      key={s.key}
                      href={`/ai/${s.key}`}
                      className="tag transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      {s.title}
                    </Link>
                  ))}
                </div>
              ) : null}

              <p className="whitespace-pre-wrap text-[13.5px] leading-[1.95] text-[var(--ink-soft)]">
                {m.content || (busy ? "…" : "（没有回答）")}
              </p>
            </div>
          ),
        )}

        {error ? (
          <p className="rounded-[var(--r-sm)] border border-[var(--err)] px-3 py-2 text-[12px] text-[var(--err)]">{error}</p>
        ) : null}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-[var(--line)] p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="问点具体的，比如「块大小 512 够用吗」"
          className="glass-inset h-10 flex-1 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="h-10 shrink-0 rounded-full bg-[var(--accent)] px-5 text-[13px] font-semibold text-[var(--accent-ink)] transition-opacity hover:opacity-88 disabled:opacity-40"
        >
          提问
        </button>
      </form>
    </div>
  );
}

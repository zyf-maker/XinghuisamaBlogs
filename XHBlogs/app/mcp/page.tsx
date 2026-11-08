import type { Metadata } from "next";

import ModuleShell from "../../components/ModuleShell";
import SideNav from "../../components/SideNav";
import PageHeader from "../../components/PageHeader";
import { mcpServers, skillsData, mcpIntro, skillsIntro } from "../../data/mcp";
import { moduleLinks } from "../../lib/moduleNav";

export const metadata: Metadata = {
  title: "MCP 与 Skills",
  description: "让模型接上外部工具与能力的两套机制，以及值得先装的几个。",
};

export default function McpPage() {
  const sections = [
    {
      title: "本页",
      items: [
        { label: "MCP 服务", href: "#mcp" },
        { label: "Skills", href: "#skills" },
        { label: "怎么选", href: "#choose" },
      ],
    },
    {
      title: "其他模块",
      items: moduleLinks
        .filter((m) => m.href !== "/mcp")
        .map((m) => ({ label: m.label, href: m.href })),
    },
  ];

  return (
    <>
      <div className="mx-auto w-[92%] max-w-6xl">
        <div className="pt-14">
          <PageHeader
            title="MCP 与 Skills"
            description="MCP 给模型「手脚」，Skills 给模型「方法」。混着用会白费力气。"
          />
        </div>
      </div>

      <ModuleShell wide sidebar={<SideNav sections={sections} />}>
        <section id="mcp" className="scroll-mt-24">
          <h2 className="font-serif text-[1.35rem] font-bold text-[var(--ink)]">MCP 服务</h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-[1.85] text-[var(--ink-soft)]">{mcpIntro}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {mcpServers.map((s) => (
              <div key={s.id} className="glass-card glass-sheen flex min-w-0 flex-col p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-serif text-[1.02rem] font-bold text-[var(--ink)] transition-colors hover:text-[var(--accent)]"
                  >
                    {s.name}
                  </a>
                  <span className="shrink-0 text-[11px] text-[var(--muted)]">{s.origin}</span>
                </div>

                <p className="mt-2 text-[13px] leading-[1.75] text-[var(--ink-soft)]">{s.capability}</p>
                <p className="mt-2 text-[12px] leading-[1.75] text-[var(--muted)]">{s.whenToUse}</p>

                <pre className="mt-3 overflow-x-auto rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2 font-mono text-[11.5px] leading-[1.7] text-[var(--ink-soft)]">
                  <code>{s.install}</code>
                </pre>
              </div>
            ))}
          </div>
        </section>

        <section id="skills" className="mt-14 scroll-mt-24">
          <h2 className="font-serif text-[1.35rem] font-bold text-[var(--ink)]">Skills</h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-[1.85] text-[var(--ink-soft)]">{skillsIntro}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {skillsData.map((s) => (
              <div key={s.id} className="glass-card glass-sheen flex min-w-0 flex-col p-5">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-serif text-[1.02rem] font-bold text-[var(--ink)] transition-colors hover:text-[var(--accent)]"
                >
                  {s.name}
                </a>
                <p className="mt-2 text-[13px] leading-[1.75] text-[var(--ink-soft)]">{s.what}</p>
                <p className="mt-2 text-[12px] leading-[1.75] text-[var(--muted)]">{s.trigger}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="choose" className="mt-14 scroll-mt-24">
          <h2 className="font-serif text-[1.35rem] font-bold text-[var(--ink)]">怎么选</h2>
          <div className="mt-3 space-y-3 text-[13px] leading-[1.9] text-[var(--ink-soft)]">
            <p>
              模型不知道你的数据库长什么样，也不该知道——那是 MCP 的事。接一个数据库 MCP，
              给只读账号、限定库名，让它能查但不该能改。
            </p>
            <p>
              模型知道数据库能查，但不知道你们团队查数要先看口径表、再对时间范围、最后标注数据来源——那是
              Skills 的事。把这段流程写成一份说明，触发词写清，它才会照做。
            </p>
            <p>顺序上先 MCP 后 Skills：没有工具，方法无处落地；工具太多而没方法，则会乱调。</p>
          </div>
        </section>
      </ModuleShell>
    </>
  );
}

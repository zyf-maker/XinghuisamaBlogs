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
        { label: "MCP 服务", href: "#mcp", meta: String(mcpServers.length) },
        { label: "Skills", href: "#skills", meta: String(skillsData.length) },
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
            eyebrow={`Protocol · ${mcpServers.length} 个 MCP · ${skillsData.length} 个 Skill`}
            title="MCP 与 Skills"
            description="两者解决的不是同一件事：MCP 给模型「手脚」，Skills 给模型「方法」。混着用会白费力气。"
          />
        </div>
      </div>

      <ModuleShell wide sidebar={<SideNav sections={sections} />}>
        <section id="mcp" className="scroll-mt-24">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-3">
            <h2 className="font-serif text-lg font-bold text-[var(--ink)]">
              MCP 服务
              <span className="ml-3 font-mono text-[10px] font-normal tracking-[0.12em] text-[var(--muted)]">
                MODEL CONTEXT PROTOCOL
              </span>
            </h2>
            <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--muted)]">
              {mcpServers.length} 个
            </span>
          </div>
          <p className="mt-3 text-[13px] leading-[1.85] text-[var(--ink-soft)]">{mcpIntro}</p>

          <ul className="mt-4 divide-y divide-[var(--line)] border-t border-[var(--line)]">
            {mcpServers.map((s) => (
              <li key={s.id} className="py-6">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group font-serif text-[1.05rem] font-bold text-[var(--ink)] transition-colors hover:text-[var(--accent)]"
                  >
                    {s.name}
                    <span className="ml-1.5 font-mono text-[10px] font-normal text-[var(--muted)] group-hover:text-[var(--accent)]">
                      ↗
                    </span>
                  </a>
                  <span className="font-mono text-[10px] tracking-[0.1em] text-[var(--muted)]">
                    {s.origin}
                  </span>
                </div>

                <p className="mt-1.5 text-[13.5px] leading-[1.8] text-[var(--ink-soft)]">{s.capability}</p>
                <p className="mt-1.5 text-[12.5px] leading-[1.8] text-[var(--muted)]">
                  什么时候用：{s.whenToUse}
                </p>

                <pre className="mt-3 overflow-x-auto rounded-md border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2.5 font-mono text-[11.5px] leading-[1.7] text-[var(--ink-soft)]">
                  <code>{s.install}</code>
                </pre>
              </li>
            ))}
          </ul>
        </section>

        <section id="skills" className="mt-16 scroll-mt-24">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-3">
            <h2 className="font-serif text-lg font-bold text-[var(--ink)]">
              Skills
              <span className="ml-3 font-mono text-[10px] font-normal tracking-[0.12em] text-[var(--muted)]">
                REUSABLE INSTRUCTIONS
              </span>
            </h2>
            <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--muted)]">
              {skillsData.length} 个
            </span>
          </div>
          <p className="mt-3 text-[13px] leading-[1.85] text-[var(--ink-soft)]">{skillsIntro}</p>

          <ul className="mt-4 divide-y divide-[var(--line)] border-t border-[var(--line)]">
            {skillsData.map((s) => (
              <li key={s.id} className="py-6">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group font-serif text-[1.05rem] font-bold text-[var(--ink)] transition-colors hover:text-[var(--accent)]"
                >
                  {s.name}
                  <span className="ml-1.5 font-mono text-[10px] font-normal text-[var(--muted)] group-hover:text-[var(--accent)]">
                    ↗
                  </span>
                </a>
                <p className="mt-1.5 text-[13.5px] leading-[1.8] text-[var(--ink-soft)]">{s.what}</p>
                <p className="mt-1.5 text-[12.5px] leading-[1.8] text-[var(--muted)]">
                  什么时候加载：{s.trigger}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section id="choose" className="mt-16 scroll-mt-24">
          <div className="border-b border-[var(--line)] pb-3">
            <h2 className="font-serif text-lg font-bold text-[var(--ink)]">怎么选</h2>
          </div>
          <div className="mt-4 space-y-3 text-[13px] leading-[1.9] text-[var(--ink-soft)]">
            <p>
              模型不知道你的数据库长什么样，也不该知道——那是 MCP 的事。接一个数据库 MCP，
              给只读账号、限定库名，让它能查但不该能改。
            </p>
            <p>
              模型知道数据库能查，但不知道你们团队查数要先看口径表、再对时间范围、最后标注数据来源——那是
              Skills 的事。把这段流程写成一份说明，触发词写清，它才会照做。
            </p>
            <p>
              顺序上先 MCP 后 Skills：没有工具，方法无处落地；工具太多而没方法，则会乱调。
            </p>
          </div>
        </section>
      </ModuleShell>
    </>
  );
}

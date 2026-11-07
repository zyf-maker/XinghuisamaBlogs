// MCP 服务器与 Skills 的索引。
// MCP（Model Context Protocol）是 Anthropic 提出的一套工具接入协议，
// 现在 Claude Code、Cursor、DeepSeek Harness 等都已支持。
// 这里的条目只写公开可获取的，星标数是写这份数据时的大致量级，会变。

export type McpEntry = {
  id: string;
  name: string;
  url: string;
  /** 官方 / 社区 / 自建 */
  origin: "官方" | "社区" | "厂商";
  /** 这个 server 让模型能操作什么 */
  capability: string;
  /** 什么时候值得接 */
  whenToUse: string;
  /** 怎么装：一行命令或一段配置说明 */
  install: string;
  tags: string[];
};

export type SkillEntry = {
  id: string;
  name: string;
  url: string;
  /** 这个 skill 做什么 */
  what: string;
  /** 触发条件：什么话会让它被加载 */
  trigger: string;
  tags: string[];
};

export const mcpServers: McpEntry[] = [
  {
    id: "filesystem",
    name: "Filesystem",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
    origin: "官方",
    capability: "在指定目录内读写文件、搜索内容、列目录。",
    whenToUse: "让模型处理本地一批文件，但不想给它整个磁盘的权限时。用 allowed-directories 限定范围。",
    install: 'npx -y @modelcontextprotocol/server-filesystem /path/to/dir',
    tags: ["文件", "本地", "官方"],
  },
  {
    id: "github",
    name: "GitHub",
    url: "https://github.com/github/github-mcp-server",
    origin: "官方",
    capability: "读写 issue、PR、代码搜索、仓库元数据。",
    whenToUse: "让模型自己查 issue 上下文、开 PR、做 review。比自己贴 diff 高效得多。",
    install: 'docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server',
    tags: ["GitHub", "PR", "issue"],
  },
  {
    id: "postgres",
    name: "Postgres",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres",
    origin: "官方",
    capability: "只读查询数据库，列 schema、跑 SELECT。",
    whenToUse: "排查数据问题、写报表 SQL。务必用只读账号，且限制可访问的库。",
    install: 'npx -y @modelcontextprotocol/server-postgres postgresql://readonly@host/db',
    tags: ["数据库", "SQL", "只读"],
  },
  {
    id: "playwright",
    name: "Playwright",
    url: "https://github.com/microsoft/playwright-mcp",
    origin: "厂商",
    capability: "驱动真实浏览器：点按钮、填表单、截图、读无障碍树。",
    whenToUse: "做端到端测试，或让模型自己验证一个前端改动到底有没有生效。",
    install: 'npx -y @playwright/mcp@latest',
    tags: ["浏览器", "E2E", "截图"],
  },
  {
    id: "context7",
    name: "Context7",
    url: "https://github.com/upstash/context7",
    origin: "社区",
    capability: "按需拉取某个库的最新文档，直接注入上下文。",
    whenToUse: "模型对某个库的 API 记忆过时了，老是写旧的写法。比让它猜强。",
    install: 'npx -y @upstash/context7-mcp',
    tags: ["文档", "版本", "库"],
  },
  {
    id: "sequential-thinking",
    name: "Sequential Thinking",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking",
    origin: "官方",
    capability: "把推理拆成可修订的步骤，允许回头看和改前面的结论。",
    whenToUse: "多步规划类任务。对简单问题反而是负担，会拖慢响应。",
    install: 'npx -y @modelcontextprotocol/server-sequential-thinking',
    tags: ["推理", "规划", "思考"],
  },
  {
    id: "memory",
    name: "Memory",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/memory",
    origin: "官方",
    capability: "基于知识图谱的持久记忆，跨会话记住实体与关系。",
    whenToUse: "需要模型记住长期上下文（比如项目里的人物、约定）。注意隐私边界。",
    install: 'npx -y @modelcontextprotocol/server-memory',
    tags: ["记忆", "知识图谱", "持久"],
  },
  {
    id: "fetch",
    name: "Fetch",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch",
    origin: "官方",
    capability: "抓网页并转成 Markdown，可选截断长度。",
    whenToUse: "让模型读一篇具体链接的内容。比直接内置联网更可控，能限制抓取范围。",
    install: 'npx -y @modelcontextprotocol/server-fetch',
    tags: ["抓取", "网页", "Markdown"],
  },
  {
    id: "chrome-devtools",
    name: "Chrome DevTools",
    url: "https://github.com/ChromeDevTools/chrome-devtools-mcp",
    origin: "厂商",
    capability: "接管一个已登录的 Chrome，读性能指标、网络请求、控制台。",
    whenToUse: "调试真实页面的性能问题，或需要已登录状态的自动化。",
    install: 'npx chrome-devtools-mcp@latest',
    tags: ["Chrome", "调试", "性能"],
  },
  {
    id: "notion",
    name: "Notion",
    url: "https://github.com/makenotion/notion-mcp-server",
    origin: "厂商",
    capability: "读写 Notion 页面与数据库。",
    whenToUse: "把团队的 wiki 或任务库接进模型，做摘要与检索。",
    install: 'npx -y @notionhq/notion-mcp-server',
    tags: ["Notion", "文档", "团队"],
  },
  {
    id: "slack",
    name: "Slack",
    url: "https://github.com/modelcontextprotocol/servers",
    origin: "官方",
    capability: "读频道历史、发消息、搜索。",
    whenToUse: "从聊天记录里找决策背景。要注意权限与合规。",
    install: "见官方仓库配置说明",
    tags: ["Slack", "聊天", "检索"],
  },
  {
    id: "obsidian",
    name: "Obsidian",
    url: "https://github.com/MarkusPfundstein/mcp-obsidian",
    origin: "社区",
    capability: "读写本地 Obsidian 仓库里的 Markdown 笔记。",
    whenToUse: "个人知识库与模型打通。纯本地文件，没有云同步风险。",
    install: "见仓库，需要配置 vault 路径与本地 REST 插件",
    tags: ["笔记", "本地", "Markdown"],
  },
];

export const skillsData: SkillEntry[] = [
  {
    id: "code-review",
    name: "code-review",
    url: "https://github.com/anthropics/skills",
    what: "按 Standards 与 Spec 两条轴审一段改动，分别指出规范问题与需求偏差。",
    trigger: "「review 一下这个分支」「看下这个 PR」",
    tags: ["审查", "PR", "规范"],
  },
  {
    id: "tdd",
    name: "tdd",
    what: "红-绿-重构的循环：先写失败测试，再写最小实现，最后清理。",
    trigger: "「用 TDD 做这个」「先写测试」",
    tags: ["测试", "开发流程"],
  },
  {
    id: "diagnosing-bugs",
    name: "diagnosing-bugs",
    what: "面向难复现 bug 与性能回退的诊断循环：先建立可观测性，再二分定位。",
    trigger: "「debug 一下」「这个性能怎么掉这么多」",
    tags: ["调试", "性能"],
  },
  {
    id: "domain-modeling",
    name: "domain-modeling",
    what: "梳理项目术语，产出 CONTEXT.md 或 ADR，避免团队各说各话。",
    trigger: "「整理一下这个项目的概念」「写个 ADR」",
    tags: ["领域模型", "文档"],
  },
  {
    id: "writing-for-agents",
    name: "writing-for-agents",
    what: "写给人看的文档和写给 Agent 看的文档要求不同，这个 skill 讲后者。",
    trigger: "「写个 SKILL.md」「改 AGENTS.md」",
    tags: ["Agent", "文档", "提示"],
  },
  {
    id: "find-docs",
    name: "find-docs",
    what: "查某个库的最新文档与 API 用法，避免模型用过时的写法。",
    trigger: "「这个 API 怎么用」「Next.js 16 有什么变化」",
    tags: ["文档", "检索"],
  },
  {
    id: "frontend-design",
    name: "frontend-design",
    what: "给新界面定方向：字体、留白、配色、层级，避免做成模板感。",
    trigger: "「做个落地页」「这个页面太丑了」",
    tags: ["设计", "前端"],
  },
  {
    id: "office",
    name: "office",
    what: "创建与编辑 docx / xlsx / pptx，并提供渲染校验。",
    trigger: "「生成一份 PPT」「改这个 Excel」",
    tags: ["Office", "文档"],
  },
];

export const mcpIntro = `MCP 解决的是同一个问题：模型怎么知道自己有哪些工具、每个工具怎么调。
在它之前，每家 IDE 都有自己的插件格式，写一次要适配五遍；MCP 把「工具」抽象成一层协议，
server 用 JSON-RPC 暴露能力，client 负责发现和调用。

接 MCP 之前先想清楚两件事：这个工具会不会读到不该读的数据，以及它出错时 Agent 会不会卡死。
前者靠最小权限（只给单个目录、只读账号），后者靠超时与重试上限。`;

export const skillsIntro = `Skill 和 MCP 是两回事。MCP 给模型「手」，Skill 给模型「经验」——
一段写清楚的操作流程，在特定任务出现时才被加载，不占用常规上下文。

写 Skill 的关键是把「怎么做」写成可执行的步骤，而不是描述性的话。
一个好 Skill 里应该能看到：触发条件、步骤、每一步的验收标准、以及失败时怎么办。`;

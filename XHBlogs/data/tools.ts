// AI 工具库的数据。
// 只收录能公开访问、仍在维护的工具；价格写的是官网标价，会变，用前请自己核对。
// 分类顺序即侧栏顺序。

export type ToolCategory = {
  slug: string;
  name: string;
  en: string;
  description: string;
};

export type Tool = {
  id: string;
  name: string;
  url: string;
  category: string;
  /** 一句话定位，不要写成广告 */
  tagline: string;
  /** 两三句展开：适合谁、强在哪、有什么代价 */
  detail: string;
  /** 免费 / 免费额度 / 订阅 / 开源 / 自部署 */
  pricing: "免费" | "免费额度" | "订阅" | "开源" | "自部署" | "按量";
  platform: string[];
  tags: string[];
};

export const toolCategories: ToolCategory[] = [
  {
    slug: "chat",
    name: "对话与推理",
    en: "Chat",
    description: "通用大模型入口，网页端与 API 都归在这里。",
  },
  {
    slug: "coding",
    name: "AI 编程",
    en: "Coding",
    description: "编辑器、命令行代理与代码补全。",
  },
  {
    slug: "writing",
    name: "写作与办公",
    en: "Writing",
    description: "长文、翻译、表格与文档处理。",
  },
  {
    slug: "image",
    name: "图像生成",
    en: "Image",
    description: "文生图、图生图、修图与设计稿。",
  },
  {
    slug: "video",
    name: "视频与音频",
    en: "Video",
    description: "视频生成、配音、转录与音乐。",
  },
  {
    slug: "agent",
    name: "Agent 与自动化",
    en: "Agents",
    description: "工作流编排、浏览器代理与多步任务。",
  },
  {
    slug: "rag",
    name: "知识库与检索",
    en: "Retrieval",
    description: "把私有文档接进模型。",
  },
  {
    slug: "infra",
    name: "推理与部署",
    en: "Infra",
    description: "自托管推理、微调与向量数据库。",
  },
];

export const toolsData: Tool[] = [
  // ── 对话与推理 ──────────────────────────────────────────
  {
    id: "chatgpt",
    name: "ChatGPT",
    url: "https://chatgpt.com",
    category: "chat",
    tagline: "OpenAI 的通用对话入口，插件与联网都在这里。",
    detail:
      "网页端最省事的起点，文件上传、图片理解、联网检索、代码解释器都集成在一个输入框里。免费版有次数限制，重度使用需要订阅。API 与网页端是两套计费。",
    pricing: "免费额度",
    platform: ["Web", "iOS", "Android", "桌面端"],
    tags: ["对话", "多模态", "联网"],
  },
  {
    id: "claude",
    name: "Claude",
    url: "https://claude.ai",
    category: "chat",
    tagline: "长文本与写作的手感在同档里最稳。",
    detail:
      "上下文窗口大，读整本书或一整个代码仓库不容易丢细节。写作风格偏克制，不太爱堆形容词。Projects 功能可以把一组固定资料挂在会话上。",
    pricing: "免费额度",
    platform: ["Web", "iOS", "Android", "桌面端"],
    tags: ["长上下文", "写作", "代码"],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    url: "https://chat.deepseek.com",
    category: "chat",
    tagline: "中文表现好、API 便宜，推理模式可手动开。",
    detail:
      "网页端免费，R1 系列的推理过程会展示出来。API 价格在同档模型里属于最低一档，适合做量大但不需要顶级质量的批处理。高峰时段可能排队。",
    pricing: "免费额度",
    platform: ["Web", "iOS", "Android"],
    tags: ["中文", "推理", "低价 API"],
  },
  {
    id: "kimi",
    name: "Kimi",
    url: "https://kimi.moonshot.cn",
    category: "chat",
    tagline: "长文档解析见长，适合一次性读完一份材料。",
    detail:
      "支持上传 PDF、Word、网页链接后直接提问，摘要与要点提取做得比较扎实。对中文报告的格式理解较好，图表里的文字偶尔会丢。",
    pricing: "免费额度",
    platform: ["Web", "iOS", "Android"],
    tags: ["长文档", "中文", "PDF"],
  },
  {
    id: "gemini",
    name: "Gemini",
    url: "https://gemini.google.com",
    category: "chat",
    tagline: "和 Google 生态绑得最紧的一档。",
    detail:
      "可以直接读 Gmail、Drive、Docs 里的内容，搜索结果也能作为上下文。多模态理解（尤其是视频）是它的强项。国内访问需要自己解决网络问题。",
    pricing: "免费额度",
    platform: ["Web", "Android", "iOS"],
    tags: ["多模态", "Google 生态", "视频理解"],
  },
  {
    id: "poe",
    name: "Poe",
    url: "https://poe.com",
    category: "chat",
    tagline: "一个订阅里横向比较十几种模型。",
    detail:
      "同一个问题可以换模型重跑，适合做选型对比。也支持自己搭 Bot 分享出去。额度按点数算，贵的模型消耗快。",
    pricing: "订阅",
    platform: ["Web", "iOS", "Android"],
    tags: ["多模型", "对比", "Bot"],
  },

  // ── AI 编程 ────────────────────────────────────────────
  {
    id: "cursor",
    name: "Cursor",
    url: "https://cursor.com",
    category: "coding",
    tagline: "VS Code 的 fork，把补全、改写、仓库级问答做进了编辑器。",
    detail:
      "Tab 补全会预测你下一步要改的位置，不只是补一行。Composer 能跨文件编辑，@ 引用文件和文档。代价是它毕竟是 fork，插件生态偶尔滞后。",
    pricing: "免费额度",
    platform: ["Windows", "macOS", "Linux"],
    tags: ["编辑器", "补全", "多文件"],
  },
  {
    id: "claude-code",
    name: "Claude Code",
    url: "https://claude.com/product/claude-code",
    category: "coding",
    tagline: "跑在终端里的编程代理，直接读写你的仓库。",
    detail:
      "不依赖 IDE，在项目根目录启动后可以自己找文件、跑测试、改代码。适合「先让它跑一遍看结果」的场景。要给它清晰的边界，否则容易改到不该改的地方。",
    pricing: "订阅",
    platform: ["macOS", "Linux", "Windows"],
    tags: ["终端", "代理", "重构"],
  },
  {
    id: "codex",
    name: "OpenAI Codex",
    url: "https://openai.com/codex",
    category: "coding",
    tagline: "云端沙箱里并行跑多个编码任务。",
    detail:
      "把任务丢进云端容器，它自己装依赖、跑测试、开 PR。适合批量修小问题或补测试。需要仓库授权，私有项目的权限要单独确认。",
    pricing: "订阅",
    platform: ["Web", "CLI"],
    tags: ["云端", "PR", "并行"],
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    url: "https://github.com/features/copilot",
    category: "coding",
    tagline: "最早的代码补全，胜在和 GitHub 工作流无缝。",
    detail:
      "IDE 插件形态，补全质量这几年被追上，但 code review、Issue 转 PR 这些 GitHub 内的集成是它的护城河。学生与开源维护者有免费额度。",
    pricing: "订阅",
    platform: ["VS Code", "JetBrains", "Neovim", "Visual Studio"],
    tags: ["补全", "GitHub", "Review"],
  },
  {
    id: "windsurf",
    name: "Windsurf",
    url: "https://windsurf.com",
    category: "coding",
    tagline: "强调「代理接管整段任务」的编辑器。",
    detail:
      "Cascade 模式会让模型自己连续执行多步操作并保留可回滚的检查点。界面上把改动前后并排展示，比纯 diff 好读。",
    pricing: "免费额度",
    platform: ["Windows", "macOS", "Linux"],
    tags: ["编辑器", "代理", "检查点"],
  },
  {
    id: "aider",
    name: "Aider",
    url: "https://aider.chat",
    category: "coding",
    tagline: "命令行里最老牌的结对编程工具，改动全部进 git。",
    detail:
      "每次改动自动提交，出问题 git revert 就行。可以指定多个文件作为上下文，也能跑到本地模型上。没有花哨界面，输出全在终端。",
    pricing: "开源",
    platform: ["CLI"],
    tags: ["CLI", "git", "开源"],
  },
  {
    id: "cline",
    name: "Cline",
    url: "https://cline.bot",
    category: "coding",
    tagline: "VS Code 里的开源代理，每一步都要你点确认。",
    detail:
      "默认人工确认每一次文件写入和命令执行，适合还在建立信任的阶段。支持自带 key，也可以接本地模型。",
    pricing: "开源",
    platform: ["VS Code"],
    tags: ["开源", "VS Code", "确认式"],
  },

  // ── 写作与办公 ──────────────────────────────────────────
  {
    id: "notion-ai",
    name: "Notion AI",
    url: "https://www.notion.com/product/ai",
    category: "writing",
    tagline: "在已有的文档库里做摘要、续写与问答。",
    detail:
      "价值在于它读的是你自己的 workspace，不是通用知识。适合团队知识库。单独订阅价格不便宜，需要评估使用频率。",
    pricing: "订阅",
    platform: ["Web", "桌面端", "移动端"],
    tags: ["文档", "知识库", "团队"],
  },
  {
    id: "grammarly",
    name: "Grammarly",
    url: "https://www.grammarly.com",
    category: "writing",
    tagline: "英文写作的语法与语气校正，装在哪都能用。",
    detail:
      "浏览器扩展覆盖几乎所有输入框。语气检测（正式/友好/自信）对非母语写作帮助最大。中文基本不适用。",
    pricing: "免费额度",
    platform: ["浏览器扩展", "桌面端", "Word"],
    tags: ["英文", "语法", "语气"],
  },
  {
    id: "deepl",
    name: "DeepL",
    url: "https://www.deepl.com",
    category: "writing",
    tagline: "翻译质量仍是同档里最稳的，尤其是欧洲语言。",
    detail:
      "文档翻译能保留原有排版，这点比多数竞品好。中英互译的语感比机翻味淡。免费版有字数上限。",
    pricing: "免费额度",
    platform: ["Web", "桌面端", "API"],
    tags: ["翻译", "文档", "术语表"],
  },
  {
    id: "gamma",
    name: "Gamma",
    url: "https://gamma.app",
    category: "writing",
    tagline: "给一段大纲，直接生成可编辑的演示文稿。",
    detail:
      "输出的是网页格式，能导出 PPTX 但排版会走样。适合快速做一版给别人看的东西，正式汇报还是得自己调。",
    pricing: "免费额度",
    platform: ["Web"],
    tags: ["PPT", "大纲", "导出"],
  },
  {
    id: "nanobanana",
    name: "Nano Banana",
    url: "https://gemini.google.com",
    category: "writing",
    tagline: "图像编辑模型，改局部时能保持一致的人物与风格。",
    detail:
      "按指令局部修改而不是整张重画，多轮编辑后主体不漂移。目前通过 Gemini 应用使用。",
    pricing: "免费额度",
    platform: ["Web", "移动端"],
    tags: ["图像编辑", "一致性", "多轮"],
  },

  // ── 图像生成 ────────────────────────────────────────────
  {
    id: "midjourney",
    name: "Midjourney",
    url: "https://www.midjourney.com",
    category: "image",
    tagline: "审美上限最高的一档，风格化插图几乎不用调。",
    detail:
      "提示词写得糙也能出好看的图，代价是精确控制弱，改具体细节得靠局部重绘。现在有网页版，不再必须用 Discord。",
    pricing: "订阅",
    platform: ["Web", "Discord"],
    tags: ["文生图", "风格化", "插画"],
  },
  {
    id: "sdxl",
    name: "Stable Diffusion",
    url: "https://github.com/Stability-AI/generative-models",
    category: "image",
    tagline: "开源图像模型，本地跑，随便微调。",
    detail:
      "权重公开，可以 LoRA 微调出固定角色或画风。ComfyUI 连节点做复杂流程。门槛在于显卡和参数调校。",
    pricing: "开源",
    platform: ["本地", "自部署"],
    tags: ["开源", "本地", "LoRA"],
  },
  {
    id: "comfyui",
    name: "ComfyUI",
    url: "https://github.com/comfyanonymous/ComfyUI",
    category: "image",
    tagline: "节点式的图像生成工作流，可复现可分享。",
    detail:
      "把采样、ControlNet、放大、局部重绘拆成节点连线，工作流能存成 JSON 发给别人复现。学习曲线陡，但一旦搭好效率极高。",
    pricing: "开源",
    platform: ["本地", "自部署"],
    tags: ["工作流", "节点", "ControlNet"],
  },
  {
    id: "figma-ai",
    name: "Figma AI",
    url: "https://www.figma.com",
    category: "image",
    tagline: "在设计稿里直接改文案、找配图、生成占位布局。",
    detail:
      "价值不在生成多惊艳，而在不打断设计流程——不用切到另一个工具再贴回来。适合已有设计系统的团队。",
    pricing: "免费额度",
    platform: ["Web", "桌面端"],
    tags: ["设计", "Figma", "配图"],
  },
  {
    id: "ideogram",
    name: "Ideogram",
    url: "https://ideogram.ai",
    category: "image",
    tagline: "图里的文字能写对，做招贴和 logo 草案很省事。",
    detail:
      "多数图像模型渲染文本会糊，它专门优化过这块。适合需要画面里带中英文字的场景，长的多行文字仍会出错。",
    pricing: "免费额度",
    platform: ["Web"],
    tags: ["文字渲染", "招贴", "Logo"],
  },

  // ── 视频与音频 ──────────────────────────────────────────
  {
    id: "sora",
    name: "Sora",
    url: "https://sora.com",
    category: "video",
    tagline: "OpenAI 的视频生成，分镜与镜头运动控制更细。",
    detail:
      "适合短片段的概念演示。物理一致性比早期版本好，但长镜头仍会漂移。生成成本高，需要逐条试。",
    pricing: "订阅",
    platform: ["Web"],
    tags: ["视频生成", "分镜", "概念"],
  },
  {
    id: "runway",
    name: "Runway",
    url: "https://runwayml.com",
    category: "video",
    tagline: "把生成能力做成剪辑工具链，不只是出片段。",
    detail:
      "有运动笔刷、镜头控制、绿幕抠像等一整套。适合做短视频素材。按秒计费，长片成本要算清楚。",
    pricing: "免费额度",
    platform: ["Web"],
    tags: ["视频", "剪辑", "特效"],
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    url: "https://elevenlabs.io",
    category: "video",
    tagline: "配音与声音克隆，中文的自然度这两年追上来了。",
    detail:
      "多语言配音能保持同一音色，适合做多语版本。API 好用，能直接接进播客或课程流水线。克隆他人声音有授权问题。",
    pricing: "免费额度",
    platform: ["Web", "API"],
    tags: ["配音", "克隆", "多语言"],
  },
  {
    id: "whisper",
    name: "Whisper",
    url: "https://github.com/openai/whisper",
    category: "video",
    tagline: "开源的语音转写，中文识别够用且能本地跑。",
    detail:
      "large-v3 在多语混说场景下表现不错，带时间戳。有 GPU 的话本地跑一整场会议录音很快。也有更快的 whisper.cpp 与 faster-whisper 实现。",
    pricing: "开源",
    platform: ["本地", "CLI", "API"],
    tags: ["转写", "开源", "时间戳"],
  },
  {
    id: "suno",
    name: "Suno",
    url: "https://suno.com",
    category: "video",
    tagline: "给歌词和风格描述，直接出整首带人声的歌。",
    detail:
      "副歌结构和编曲完成度比预期高，适合做视频配乐或 Demo。版权归属按订阅等级不同，商用前要看清条款。",
    pricing: "免费额度",
    platform: ["Web"],
    tags: ["音乐", "人声", "配乐"],
  },

  // ── Agent 与自动化 ──────────────────────────────────────
  {
    id: "dify",
    name: "Dify",
    url: "https://dify.ai",
    category: "agent",
    tagline: "开源的可视化 LLM 应用编排，能自部署。",
    detail:
      "把提示词、知识库、工具调用串成工作流，带调试面板和日志。国内团队用得多，自部署数据不出内网。复杂逻辑还是会碰到表达力上限。",
    pricing: "开源",
    platform: ["Web", "自部署"],
    tags: ["编排", "开源", "知识库"],
  },
  {
    id: "n8n",
    name: "n8n",
    url: "https://n8n.io",
    category: "agent",
    tagline: "通用自动化平台，把模型当成几百个节点里的一个。",
    detail:
      "触发、条件分支、HTTP 请求、数据库读写都能接，模型只是其中一环。适合把 AI 塞进已有的业务流程，而不是让 AI 当主角。",
    pricing: "自部署",
    platform: ["Web", "自部署"],
    tags: ["自动化", "工作流", "集成"],
  },
  {
    id: "coze",
    name: "扣子 Coze",
    url: "https://www.coze.cn",
    category: "agent",
    tagline: "低代码搭 Bot，发布到飞书、微信、网页。",
    detail:
      "插件市场现成，内置知识库和多轮对话管理。适合快速验证一个对话产品的想法。深度定制不如自己写代码自由。",
    pricing: "免费额度",
    platform: ["Web"],
    tags: ["Bot", "低代码", "飞书"],
  },
  {
    id: "browser-use",
    name: "Browser Use",
    url: "https://github.com/browser-use/browser-use",
    category: "agent",
    tagline: "让模型直接操作浏览器，点按钮填表单。",
    detail:
      "基于 Playwright，把页面元素转成模型能理解的结构。做信息采集、后台重复操作很省事。稳定性取决于页面结构，遇到验证码就废。",
    pricing: "开源",
    platform: ["Python"],
    tags: ["浏览器", "爬取", "Python"],
  },
  {
    id: "langgraph",
    name: "LangGraph",
    url: "https://github.com/langchain-ai/langgraph",
    category: "agent",
    tagline: "把 Agent 写成状态机，分支和回滚都能显式表达。",
    detail:
      "比链式调用更好调试：每个节点输入输出可持久化，出错能从中断点恢复。代价是要自己设计状态结构。",
    pricing: "开源",
    platform: ["Python", "TypeScript"],
    tags: ["状态机", "编排", "可恢复"],
  },

  // ── 知识库与检索 ────────────────────────────────────────
  {
    id: "ragflow",
    name: "RAGFlow",
    url: "https://github.com/infiniflow/ragflow",
    category: "rag",
    tagline: "对复杂 PDF 的版面解析做得比较细。",
    detail:
      "表格、双栏、扫描件这些难啃的排版能保留结构，切分时带上下文。适合技术手册、财报这类文档。资源占用不小。",
    pricing: "开源",
    platform: ["自部署", "Web"],
    tags: ["PDF", "版面解析", "开源"],
  },
  {
    id: "qdrant",
    name: "Qdrant",
    url: "https://qdrant.tech",
    category: "rag",
    tagline: "向量数据库，过滤与混合检索支持得比较完整。",
    detail:
      "标量过滤和向量检索能一起用，不用先粗筛再算相似度。Rust 写的，单机性能好。适合亿级以下规模。",
    pricing: "开源",
    platform: ["自部署", "云"],
    tags: ["向量库", "过滤", "Rust"],
  },
  {
    id: "pgvector",
    name: "pgvector",
    url: "https://github.com/pgvector/pgvector",
    category: "rag",
    tagline: "给 Postgres 加向量索引，能少维护一套系统。",
    detail:
      "已经有 Postgres 的话最省事：向量和业务数据放一起，事务一致，备份沿用原来的。千万级以内够用，再大要考虑专用库。",
    pricing: "开源",
    platform: ["自部署", "云"],
    tags: ["Postgres", "向量", "事务"],
  },
  {
    id: "docs2prompt",
    name: "Docs to Prompt",
    url: "https://github.com",
    category: "rag",
    tagline: "把一整个文档站抓成带结构的 Markdown 喂给模型。",
    detail:
      "按导航层级抓取，保留标题结构，生成的 Markdown 直接可以当上下文。省掉手工复制粘贴。注意目标站的使用条款。",
    pricing: "开源",
    platform: ["CLI"],
    tags: ["抓取", "Markdown", "上下文"],
  },

  // ── 推理与部署 ──────────────────────────────────────────
  {
    id: "ollama",
    name: "Ollama",
    url: "https://ollama.com",
    category: "infra",
    tagline: "一条命令把开源模型拉下来本地跑。",
    detail:
      "模型管理和服务化都包好了，接口兼容 OpenAI 格式，改个 base URL 就能把现有代码指过来。适合开发和内网演示。生产环境要自己加限流和监控。",
    pricing: "开源",
    platform: ["macOS", "Linux", "Windows"],
    tags: ["本地推理", "OpenAI 兼容", "轻量"],
  },
  {
    id: "vllm",
    name: "vLLM",
    url: "https://github.com/vllm-project/vllm",
    category: "infra",
    tagline: "高吞吐推理服务，PagedAttention 是它的核心。",
    detail:
      "把 KV cache 分页管理，显存利用率比朴素实现高一截，并发上量后吞吐差距明显。部署比 Ollama 复杂，要调张量并行和批大小。",
    pricing: "开源",
    platform: ["Linux", "GPU"],
    tags: ["推理服务", "高吞吐", "PagedAttention"],
  },
  {
    id: "llamacpp",
    name: "llama.cpp",
    url: "https://github.com/ggml-org/llama.cpp",
    category: "infra",
    tagline: "量化后在 CPU 和消费级显卡上跑，Mac 上尤其好使。",
    detail:
      "GGUF 量化格式的事实标准。4bit 量化后 7B 模型在普通笔记本上能跑到可用速度。精度会有损失，长任务上能感觉到。",
    pricing: "开源",
    platform: ["CPU", "macOS", "Linux", "Windows"],
    tags: ["量化", "GGUF", "CPU"],
  },
  {
    id: "unsloth",
    name: "Unsloth",
    url: "https://github.com/unslothai/unsloth",
    category: "infra",
    tagline: "微调加速，单卡也能跑 LoRA。",
    detail:
      "重写了反向传播的显存管理，同样的卡能塞更大 batch。对 Llama / Qwen / Gemma 系列支持好。冷门架构可能要等适配。",
    pricing: "开源",
    platform: ["Python", "GPU"],
    tags: ["微调", "LoRA", "省显存"],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    url: "https://openrouter.ai",
    category: "infra",
    tagline: "一个 key 调几十家模型，方便做 A/B 和降级。",
    detail:
      "统一成 OpenAI 格式，可以按价格排序选模型，也能配置自动降级。加了层转发会有额外延迟，对延迟敏感的场景要实测。",
    pricing: "按量",
    platform: ["API"],
    tags: ["多模型", "网关", "降级"],
  },
  {
    id: "together",
    name: "Together AI",
    url: "https://www.together.ai",
    category: "infra",
    tagline: "开源模型的托管推理，价格比一线厂商低。",
    detail:
      "Llama、Qwen、Mixtral 这些开源权重模型直接调 API，不用自己维护 GPU。冷门模型可能限流。也提供微调服务。",
    pricing: "按量",
    platform: ["API"],
    tags: ["托管", "开源模型", "便宜"],
  },
];

export const toolCategoryMap = new Map(toolCategories.map((c) => [c.slug, c]));

export function getToolsByCategory(slug: string) {
  return toolsData.filter((t) => t.category === slug);
}

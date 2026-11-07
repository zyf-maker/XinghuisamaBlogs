// 学习路线：按目标倒推的顺序清单。
// 每条路线给的是「先读什么、再做什么」，不是链接堆。

export type RouteStep = {
  title: string;
  /** 这一步要达成什么 */
  goal: string;
  /** 具体动作 */
  actions: string[];
  /** 大概要多久 */
  duration: string;
  /** 站内可以对照的篇目类别，形如 "foundations" */
  related: string[];
};

export type Route = {
  slug: string;
  name: string;
  en: string;
  /** 适合谁 */
  audience: string;
  /** 学完能做什么 */
  outcome: string;
  /** 前置要求 */
  prerequisite: string;
  steps: RouteStep[];
};

export const routes: Route[] = [
  {
    slug: "beginner",
    name: "从零到能用",
    en: "Start",
    audience: "刚开始接触大模型，还没写过一行相关代码。",
    outcome: "能独立用 API 做出一个带上下文的小工具，知道成本大概花在哪。",
    prerequisite: "会一门语言的变量、函数、HTTP 请求。",
    steps: [
      {
        title: "把基本词搞清",
        goal: "知道 token、上下文窗口、温度、系统提示各自控制什么。",
        actions: [
          "读「模型基础」四篇，重点是分词与采样的两篇。",
          "打开一个模型网页端，用同一个问题分别把温度理解成「机器人」和「编辑」，观察差别。",
        ],
        duration: "2 小时",
        related: ["foundations"],
      },
      {
        title: "跑通第一次 API 调用",
        goal: "能在本地用代码发一次请求并打印结果和花费的 token 数。",
        actions: [
          "拿一个 key，用 curl 或任意 SDK 发一次 chat/completions。",
          "把响应里的 usage 打印出来，算一次调用多少钱。",
        ],
        duration: "半天",
        related: ["tools"],
      },
      {
        title: "做一个会记住上下文的小工具",
        goal: "理解消息数组是怎么累积的，以及为什么长对话会变贵。",
        actions: [
          "写一个命令行问答，把历史消息追加进 messages。",
          "跑十轮后打印总 token，观察增长曲线。",
        ],
        duration: "一天",
        related: ["foundations", "engineering"],
      },
      {
        title: "加一层结构化输出",
        goal: "让模型稳定返回 JSON，而不是自由文本。",
        actions: [
          "用系统提示约定字段，再让它返回一个固定 schema。",
          "故意给一个模糊输入，看它怎么补默认值，据此补校验逻辑。",
        ],
        duration: "半天",
        related: ["prompt"],
      },
    ],
  },
  {
    slug: "engineer",
    name: "工程落地",
    en: "Ship",
    audience: "要把模型接进真实产品的后端或全栈开发。",
    outcome: "能上线一个带流式输出、限流、成本监控和降级策略的 AI 功能。",
    prerequisite: "有 Web 后端经验，知道缓存、队列、超时这些概念。",
    steps: [
      {
        title: "先把流式跑通",
        goal: "前端能一个字一个字地出，而不是转圈等十秒。",
        actions: [
          "服务端把上游的 SSE 直接转发，不要缓冲整段再发。",
          "前端用 ReadableStream 逐块解析，处理半包和断线。",
        ],
        duration: "一天",
        related: ["engineering"],
      },
      {
        title: "把成本算清楚",
        goal: "能回答「这个功能每个用户每月花多少钱」。",
        actions: [
          "在服务端记录每次调用的输入输出 token 与模型名。",
          "按天汇总，找出花得最多的那条路径。",
        ],
        duration: "一天",
        related: ["engineering"],
      },
      {
        title: "加限流与降级",
        goal: "上游抖动时产品不会整个挂掉。",
        actions: [
          "给每用户设频率上限，超限时返回明确提示而不是转圈。",
          "准备一个更便宜或更稳的备用模型，主模型连续失败时切换。",
        ],
        duration: "一至两天",
        related: ["engineering"],
      },
      {
        title: "把评测固定下来",
        goal: "改提示词之后能判断是变好还是变坏。",
        actions: [
          "收集 30 到 50 条真实输入，写成带期望行为的用例表。",
          "每次改动跑一遍，记录通过率，不要凭感觉。",
        ],
        duration: "两天",
        related: ["prompt", "rag"],
      },
    ],
  },
  {
    slug: "rag",
    name: "知识库与检索",
    en: "Retrieval",
    audience: "要给一堆自有文档做问答。",
    outcome: "能搭起一套可评测的检索问答，知道效果不好时该改哪一层。",
    prerequisite: "会写 Python 或 TS，能跑起一个向量库。",
    steps: [
      {
        title: "先别写代码，先看文档长什么样",
        goal: "判断这批文档的难点是排版、长度还是术语。",
        actions: [
          "随机抽 20 篇，统计平均长度、有没有表格、有没有扫描件。",
          "找出三篇最难处理的，它们决定你的架构。",
        ],
        duration: "半天",
        related: ["rag"],
      },
      {
        title: "切分与向量化",
        goal: "切出来的块语义完整，检索时能被找到。",
        actions: [
          "按标题层级切，块长控制在 300 到 600 token，重叠 10% 到 15%。",
          "中文用多语模型，别用纯英文的 embedding。",
        ],
        duration: "一至两天",
        related: ["rag"],
      },
      {
        title: "加一层重排",
        goal: "召回的前 20 条里，真正有用的排到前 3。",
        actions: [
          "用交叉编码器重排，或先做混合检索（BM25 + 向量）。",
          "对比加重排前后的命中率，别凭感觉。",
        ],
        duration: "一天",
        related: ["rag"],
      },
      {
        title: "建评测集",
        goal: "能量化「检索到底有没有变好」。",
        actions: [
          "人工写 50 条问题，标注正确来源片段。",
          "算 recall@5 与 MRR，每次改切分都跑一遍。",
        ],
        duration: "两天",
        related: ["rag"],
      },
    ],
  },
  {
    slug: "agent",
    name: "Agent 与工具调用",
    en: "Agents",
    audience: "要让模型自己决定调什么工具、连续执行多步。",
    outcome: "能写出一个不轻易死循环、失败会自己退回来的 Agent 循环。",
    prerequisite: "已经跑通过函数调用，理解 JSON Schema。",
    steps: [
      {
        title: "先把单次函数调用写稳",
        goal: "模型能正确选择工具并填对参数。",
        actions: [
          "给工具写清楚的 description：什么时候用、什么时候别用。",
          "参数用 enum 和 minimum/maximum 卡死取值范围。",
        ],
        duration: "一天",
        related: ["agent"],
      },
      {
        title: "加上循环和停止条件",
        goal: "多步任务能跑完，卡住时能自己停。",
        actions: [
          "设最大步数，超过就中断并汇报。",
          "同一个工具连续两次返回相同结果视为卡死。",
        ],
        duration: "一天",
        related: ["agent"],
      },
      {
        title: "处理失败",
        goal: "工具报错后不原样重试，而是先分类。",
        actions: [
          "区分参数错、权限错、超时、服务端错四类。",
          "只有超时和 5xx 允许有限重试，其余直接把错误回给模型让它改参数。",
        ],
        duration: "一天",
        related: ["agent"],
      },
      {
        title: "接 MCP",
        goal: "把常用工具（文件、浏览器、数据库）换成标准协议接入。",
        actions: [
          "挑一个官方 server 接上，跑通工具发现与调用。",
          "按最小权限配置：单个目录、只读账号。",
        ],
        duration: "半天",
        related: ["agent"],
      },
    ],
  },
  {
    slug: "product",
    name: "做成产品",
    en: "Product",
    audience: "有技术能力，想把 AI 能力变成有人付钱的东西。",
    outcome: "能判断一个想法值不值得做，并做出最小可验证版本。",
    prerequisite: "能独立上线一个网站或小程序。",
    steps: [
      {
        title: "先验证需求真伪",
        goal: "区分「听起来有用」和「有人愿意为此改变行为」。",
        actions: [
          "找 5 个目标用户，只问他们最近一次怎么解决这个问题。",
          "如果对方的现有解法是 Excel 加手工，说明痛点在，但付费意愿未知。",
        ],
        duration: "一周",
        related: ["product"],
      },
      {
        title: "砍到能一周做完",
        goal: "做出一个只解决一个动作的版本。",
        actions: [
          "写下来：用户打开它，第一件要做的事是什么。",
          "把除此之外的功能全部砍掉，包括登录和设置。",
        ],
        duration: "一周",
        related: ["product"],
      },
      {
        title: "定一个能验证的价格",
        goal: "知道用户愿不愿意付钱，而不只是愿不愿意用。",
        actions: [
          "先收钱再做，哪怕只是预付意向金。",
          "定价不要按成本加价，按替代方案的价钱定。",
        ],
        duration: "三天",
        related: ["product"],
      },
      {
        title: "算清单位经济",
        goal: "知道每个用户赚多少、花多少。",
        actions: [
          "算每次调用的模型成本、服务器摊销、获客成本。",
          "如果毛利低于 50%，要么提价要么换更小的模型。",
        ],
        duration: "两天",
        related: ["product", "engineering"],
      },
    ],
  },
];

export const routeMap = new Map(routes.map((r) => [r.slug, r]));

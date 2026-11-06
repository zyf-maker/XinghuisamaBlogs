// 项目数据：手动维护
export type Project = {
  id: string;
  name: string;
  description: string;
  icon: string;
  githubUrl: string;
  tags: string[];
};

export const projectsData: Project[] = [
  {
    id: "dramaforge",
    name: "DramaForge",
    githubUrl: "https://github.com/zyf-maker/dramaforge",
    description: "AI 漫剧自动化工厂：从选题、剧本、分镜抽卡，到图生视频、配音与合成，把一整条内容流水线交给模型跑完。",
    icon: "🎬",
    tags: ["TypeScript", "Agent", "视频生成"],
  },
  {
    id: "dsh-market",
    name: "DSH Market",
    githubUrl: "https://github.com/zyf-maker/dsh-market-own",
    description: "DeepSeek Harness 的插件市场：浏览已发布目录、按 harness 格式安装、自动修复兼容性。目录数据由另一个仓库定时重建与发布。",
    icon: "🧩",
    tags: ["JavaScript", "Plugin", "Catalog"],
  },
  {
    id: "dsh-catalog",
    name: "DSH Catalog",
    githubUrl: "https://github.com/zyf-maker/dsh-catalog-merged",
    description: "插件市场的数据侧：多源采集、去重、准入、排序，每 6 小时重建一次并发布静态页面。",
    icon: "🗂",
    tags: ["PLpgSQL", "Data Pipeline"],
  },
  {
    id: "reverse-everything",
    name: "Reverse Everything",
    githubUrl: "https://github.com/zyf-maker/reverse-everything",
    description: "以行为为驱动的逆向工程与独立复刻验证方法论：从产物与运行时证据出发，重建并验证行为等价。",
    icon: "🔍",
    tags: ["JavaScript", "Reverse Engineering"],
  },
  {
    id: "comp-chem-tool",
    name: "Computational Chemistry Tool",
    githubUrl: "https://github.com/heiehiehi/Computational_Chemistry_Tool",
    description: "在 WSL2 + Ubuntu 22 下使用的计算化学流程整合脚本，围绕 GROMACS 做了常用分析的一键封装。",
    icon: "🧪",
    tags: ["GROMACS", "RMSF", "分子模拟"],
  },
];

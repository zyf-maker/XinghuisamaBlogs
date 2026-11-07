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
    id: "comp-chem-tool",
    name: "Computational Chemistry Tool",
    githubUrl: "https://github.com/heiehiehi/Computational_Chemistry_Tool",
    description:
      "在 WSL2 + Ubuntu 22 下使用的计算化学流程脚本，围绕 GROMACS 把轨迹分析、RMSF、氢键统计这些常用步骤做成一键封装，省掉每次手敲命令的重复。",
    icon: "🧪",
    tags: ["GROMACS", "RMSF", "分子模拟"],
  },
];

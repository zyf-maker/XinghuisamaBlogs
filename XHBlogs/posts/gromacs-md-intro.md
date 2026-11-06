---
title: "GROMACS 2025 一次完整跑通：从建模到 RMSF"
date: "2026-03-24 07:00:01"
description: "把溶剂盒、能量最小化、NVT/NPT 平衡到成品模拟的流程走一遍，附上我实际踩到的坑。"
tags: ["分子动力学", "GROMACS", "计算化学"]
---

## 为什么记录这个

跑分子动力学这件事，烦的从来不是命令本身，而是每一步之间的**衔接条件**：力场选哪个、水模型配哪个、加热到多少、耦合常数给多少。隔两个月再回来，八成要重新翻文档。

所以这篇就当自己的检查清单。

## 一、拓扑与溶剂盒

蛋白先过一遍 `pdb2gmx`，选力场这一步决定了后面所有参数能不能直接抄别人。我的习惯是 `amber14sb` + `tip3p`，文献里对得上号的组合最多。

```bash
gmx pdb2gmx -f protein.pdb -o protein.gro -water tip3p -ff amber14sb
gmx editconf -f protein.gro -o box.gro -c -d 1.2 -bt cubic
gmx solvate -cp box.gro -cs spc216.gro -o solv.gro -p topol.top
```

`-d 1.2` 是溶质到盒边的最小距离。给小了会出现周期性镜像自相互作用，给大了纯属浪费算力。

## 二、加离子

中和体系要用 `genion`，注意它读的是 `.tpr`：

```bash
gmx grompp -f ions.mdp -c solv.gro -p topol.top -o ions.tpr
gmx genion -s ions.tpr -o ionized.gro -p topol.top -pname NA -nname CL -neutral
```

盐浓度我一般按 0.15 M 给，生理条件附近。真正影响结果的往往不是浓度本身，而是你有没有**把离子位置随机化**——直接替换水分子的位置会带来初始聚集。

## 三、能量最小化

先最速下降，跑个几千步，看 `Fmax` 能不能压到 1000 以下。压不下去通常是两个原因：侧链有原子重叠，或者拓扑里的电荷没配平。

## 四、平衡：NVT 再 NPT

```bash
gmx grompp -f nvt.mdp -c em.gro -r em.gro -p topol.top -o nvt.tpr
gmx mdrun -deffnm nvt
gmx grompp -f npt.mdp -c nvt.gro -r nvt.gro -t nvt.cpt -p topol.top -o npt.tpr
gmx mdrun -deffnm npt
```

`-r` 位置限制那一步千万别漏，尤其 NVT 阶段，不加位置限制蛋白会在真空中散开。

## 五、成品模拟与 RMSF

```bash
gmx mdrun -deffnm md -nb gpu -pme gpu
gmx rmsf -s md.tpr -f md.xtc -o rmsf.xvg -res
```

RMSF 曲线是判断柔性区最直观的工具。我习惯把高波动残基和结构域注释叠在一起看——**波动大的位置经常正好落在 loop 上**，这时候"模拟不稳定"往往是好消息，说明力场抓到了真实柔性。

## 踩过的坑

- `nsteps` 写太大导致 checkpoint 间隔过长，中断一次损失几小时。
- `tcoupl` 的组写错，水被单独恒温，蛋白实际在跑 NVE。
- 用别人的 `.mdp` 却没检查 `constraints`，氢键长度约束方式不同会导致能量跳变。

后面几篇会写图神经网络怎么把这类模拟结果拿去做特征。

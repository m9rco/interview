---
title: 数据结构与算法
---

# 数据结构与算法

> 面向后台/游戏面试的 DS&A 复习专区：数据结构、排序查找、双指针/滑窗、回溯、动态规划、图论、后台高频算法。**代码统一 C++**，难点配 SVG 动画 / mermaid 图，每篇附**面试高频题清单**。

::: tip 🧠 一句话记忆锚点
**刷题先认题型再套模板：有序数组找目标→二分；区间/子串→双指针/滑窗；选/排列/组合→回溯；最优子结构+重叠子问题→DP；连通/最短路/依赖→图论。复杂度先估 O()，再考虑能否用空间换时间（哈希/前缀和/记忆化）。**
:::

## 复杂度大 O 速查

**数据结构操作**

| 结构 | 查找 | 插入 | 删除 | 备注 |
|---|---|---|---|---|
| 数组 | O(n) | O(n) | O(n) | 索引访问 O(1) |
| 链表 | O(n) | O(1)* | O(1)* | *已知指针 |
| 哈希表 | O(1) | O(1) | O(1) | 最坏 O(n) |
| 平衡树（红黑/AVL） | O(log n) | O(log n) | O(log n) | 有序 + 范围查询 |
| 堆 | O(1) 查顶 | O(log n) | O(log n) | 建堆 O(n) |
| 跳表 | O(log n) | O(log n) | O(log n) | 期望值 |
| Trie | O(m) | O(m) | O(m) | m=词长 |

**排序**：比较排序下界 **O(n log n)**；快排平均 O(n log n)/最坏 O(n²)，归并/堆稳定 O(n log n)，插入近乎有序 O(n)。

**常见量级参考**（1s 内可处理）：O(n) ~ 10⁸、O(n log n) ~ 10⁶~10⁷、O(n²) ~ 10⁴、O(2ⁿ) ~ n≤20、O(n!) ~ n≤11。看数据范围反推算法：`n≤20` 想状压/回溯，`n≤10³` 想 O(n²) DP，`n≤10⁵` 想 O(n log n)，`n≥10⁶` 想 O(n)/O(log n)。

## 解题套路总纲（看到 X 想到 Y）

| 题目特征 | 首选思路 | 专题 |
|---|---|---|
| 有序数组 / 找边界 / 求最值满足单调 | **二分查找**（含二分答案） | [二分查找](/algo/binary-search.md) |
| 子数组 / 子串 / 定长或变长区间 | **滑动窗口 / 双指针** | [双指针与滑窗](/algo/two-pointers-sliding-window.md) |
| 两数之和(有序) / 去重 / 快慢指针判环 | **双指针** | [双指针与滑窗](/algo/two-pointers-sliding-window.md) |
| 全排列 / 子集 / 组合 / 棋盘放置 | **回溯 + 剪枝** | [回溯](/algo/backtracking.md) |
| 最优解 + 重叠子问题 / 计数路径 / 背包 | **动态规划** | [动态规划](/algo/dynamic-programming.md) |
| 连通性 / 最短路 / 拓扑依赖 / 岛屿 | **BFS/DFS/并查集/Dijkstra** | [图论](/algo/graph.md) |
| Top-K / 第 K 大 / 合并 K 路 | **堆 / 快速选择** | [排序](/algo/sorting.md)、[数据结构](/algo/data-structures.md) |
| 前缀匹配 / 自动补全 | **Trie** | [数据结构](/algo/data-structures.md) |
| 分片扩缩容 / 缓存穿透 / UV 估算 | **一致性哈希 / 布隆 / HLL** | [后台高频算法](/algo/backend-algorithms.md) |

## 专区导航

- [常见数据结构](/algo/data-structures.md) —— 链表、栈队列、BST/AVL/红黑、堆、Trie、跳表、布隆、哈希表（含堆下沉 / 跳表查找动画）
- [排序算法](/algo/sorting.md) —— 七大排序 C++ 实现、快排三路 partition 动画、堆排
- [二分查找](/algo/binary-search.md) —— 标准二分 + 左右边界 + 旋转数组 / 峰值 / 二分答案
- [双指针与滑动窗口](/algo/two-pointers-sliding-window.md) —— 对撞 / 快慢指针、变长滑窗（含伸缩动画）
- [回溯](/algo/backtracking.md) —— 子集 / 排列 / 组合 / N 皇后 / 括号（含递归决策树）
- [动态规划](/algo/dynamic-programming.md) —— 五步法、背包、LIS、编辑距离、股票、区间 DP（含填表动画）
- [图论](/algo/graph.md) —— BFS/DFS、拓扑排序、Dijkstra、并查集（含遍历动画）
- [后台高频算法](/algo/backend-algorithms.md) —— 一致性哈希、布隆、LSM/B+、限流数学（含哈希环动画）

## 内容来源

综合整理自经典教材（《算法》第 4 版、《算法导论》）与高频面试题型；代码为教学示意的 C++ 实现，请以官方文档与教材为准。

---
title: 动态规划
---

# 动态规划

> 五步法 · 0/1 与完全背包 · LIS · 编辑距离 · 股票系列 · 区间 DP——统一 C++、含填表动画

::: tip 🧠 一句话记忆锚点
**DP 用在"最优子结构 + 重叠子问题"：大问题的最优解由子问题最优解拼出，且子问题被反复用到（所以要缓存）。五步法——① 定义状态 dp[i] 含义 ② 写状态转移方程 ③ 定初始值/边界 ④ 定遍历顺序（保证算 dp[i] 时依赖项已算好）⑤ 举例验证。背包看"选/不选"，字符串对齐看"增删改"，序列看"以 i 结尾"。**
:::

## 场景问题

看到"最值 / 方案数 / 能否达到"，且**当前决策依赖之前的决策结果**、子问题会被重复计算——就是 DP。它把指数级的暴力递归（回溯）通过**记忆化 / 递推**降到多项式。

DP vs 回溯：都建立在"决策"上，但回溯**枚举所有具体解**（子问题不重叠），DP 求**最优值/计数**且**子问题重叠**（缓存复用）。DP vs 贪心：贪心每步取局部最优且不回头（需证明贪心选择性质），DP 考虑所有子问题组合。

## 实现方案

### 五步法（万能框架）

1. **状态定义**：`dp[i]` / `dp[i][j]` 到底表示什么（最难也最关键）
2. **转移方程**：`dp[i]` 由哪些更小的状态推出
3. **初始化**：边界值（空串、第 0 个、容量 0）
4. **遍历顺序**：保证算 `dp[i][j]` 时它依赖的格子已算好
5. **验证**：小例子手推一遍表

### 填表动画（以二维 DP 为例）

**二维 DP 的核心是"格子依赖"**：`dp[i][j]` 通常由**上（dp[i-1][j]）、左（dp[i][j-1]）、左上（dp[i-1][j-1]）** 推出——所以必须**从上到下、从左到右**填，才能保证依赖项就绪：

<svg viewBox="0 0 520 260" width="100%" style="max-width:520px;height:auto" role="img" aria-label="动态规划填表：按行列顺序逐格填充，每格依赖上/左/左上">
  <!-- grid 5 cols x 4 rows -->
  <g stroke="#475569" stroke-width="1">
    <g fill="#334155">
      <rect x="60"  y="30" width="80" height="44" rx="3"><animate attributeName="opacity" values="0.15;1" begin="0s"   dur="0.4s" fill="freeze"/><animate attributeName="opacity" values="1;0.15" begin="4.6s" dur="0.4s" fill="freeze"/></rect>
      <rect x="144" y="30" width="80" height="44" rx="3"><animate attributeName="opacity" values="0.15;1" begin="0.4s" dur="0.4s" fill="freeze"/><animate attributeName="opacity" values="1;0.15" begin="4.6s" dur="0.4s" fill="freeze"/></rect>
      <rect x="228" y="30" width="80" height="44" rx="3"><animate attributeName="opacity" values="0.15;1" begin="0.8s" dur="0.4s" fill="freeze"/><animate attributeName="opacity" values="1;0.15" begin="4.6s" dur="0.4s" fill="freeze"/></rect>
      <rect x="312" y="30" width="80" height="44" rx="3"><animate attributeName="opacity" values="0.15;1" begin="1.2s" dur="0.4s" fill="freeze"/><animate attributeName="opacity" values="1;0.15" begin="4.6s" dur="0.4s" fill="freeze"/></rect>
      <rect x="60"  y="78" width="80" height="44" rx="3"><animate attributeName="opacity" values="0.15;1" begin="1.6s" dur="0.4s" fill="freeze"/><animate attributeName="opacity" values="1;0.15" begin="4.6s" dur="0.4s" fill="freeze"/></rect>
      <rect x="144" y="78" width="80" height="44" rx="3"><animate attributeName="opacity" values="0.15;1" begin="2.0s" dur="0.4s" fill="freeze"/><animate attributeName="opacity" values="1;0.15" begin="4.6s" dur="0.4s" fill="freeze"/></rect>
    </g>
    <!-- target cell (highlighted) -->
    <rect x="228" y="78" width="80" height="44" rx="3" fill="#7c3aed"><animate attributeName="opacity" values="0.15;0.15;1" keyTimes="0;0.52;0.6" begin="0s" dur="4s" fill="freeze"/></rect>
  </g>
  <!-- dependency arrows into target from up / left / up-left -->
  <defs><marker id="dpah" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" fill="#f59e0b"/></marker></defs>
  <g stroke="#f59e0b" stroke-width="2" fill="none">
    <line x1="268" y1="74" x2="268" y2="78" marker-end="url(#dpah)"><animate attributeName="opacity" values="0;0;1" keyTimes="0;0.55;0.62" dur="4s" begin="0s" fill="freeze"/></line>
    <line x1="224" y1="100" x2="228" y2="100" marker-end="url(#dpah)"><animate attributeName="opacity" values="0;0;1" keyTimes="0;0.55;0.62" dur="4s" begin="0s" fill="freeze"/></line>
    <line x1="224" y1="74" x2="230" y2="80" marker-end="url(#dpah)"><animate attributeName="opacity" values="0;0;1" keyTimes="0;0.55;0.62" dur="4s" begin="0s" fill="freeze"/></line>
  </g>
  <text x="248" y="105" font-size="12" fill="#fff" text-anchor="middle">dp[i][j]</text>
  <text x="60" y="150" font-size="12" fill="currentColor">← 从上到下、从左到右填；紫格 dp[i][j] 依赖 上 / 左 / 左上（橙箭头）。</text>
  <text x="60" y="172" font-size="11" fill="currentColor">编辑距离：dp[i][j]=min(上,左,左上)+1（字符不同）或 =左上（字符相同）。</text>
</svg>

### 0/1 背包（每件选或不选）

```cpp
// 容量 W，物品 weight[i]/value[i]；求最大价值
int knapsack01(const std::vector<int>& w, const std::vector<int>& v, int W) {
    std::vector<int> dp(W + 1, 0);                 // dp[j]=容量 j 的最大价值
    for (int i = 0; i < (int)w.size(); i++)
        for (int j = W; j >= w[i]; j--)            // 逆序！保证每件只用一次（0/1）
            dp[j] = std::max(dp[j], dp[j - w[i]] + v[i]);
    return dp[W];
}
```

> **完全背包**（每件无限次）：内层 `j` 改**正序** `for (j = w[i]; j <= W; j++)`——正序让 `dp[j-w[i]]` 可能已含本件，即允许重复选。**背包问题的"逆序/正序"是 0/1 与完全的唯一区别，必背。**

### 最长递增子序列 LIS

```cpp
int lengthOfLIS(const std::vector<int>& a) {
    std::vector<int> tails;                        // tails[k]=长度 k+1 的递增子序列的最小结尾
    for (int x : a) {
        auto it = std::lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x); // x 比所有都大 → 接长
        else *it = x;                              // 替换第一个 ≥ x 的，保持结尾最小
    }
    return tails.size();                           // O(n log n)
}
// 朴素 O(n²)：dp[i]=以 a[i] 结尾的 LIS 长 = max(dp[j]+1, a[j]<a[i])
```

### 编辑距离（二维 DP 经典）

```cpp
int editDistance(const std::string& a, const std::string& b) {
    int m = a.size(), n = b.size();
    std::vector<std::vector<int>> dp(m + 1, std::vector<int>(n + 1));
    for (int i = 0; i <= m; i++) dp[i][0] = i;     // b 为空：删 i 次
    for (int j = 0; j <= n; j++) dp[0][j] = j;     // a 为空：插 j 次
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            if (a[i-1] == b[j-1]) dp[i][j] = dp[i-1][j-1];              // 字符相同，免操作
            else dp[i][j] = 1 + std::min({dp[i-1][j],    // 删
                                          dp[i][j-1],    // 插
                                          dp[i-1][j-1]});// 改
    return dp[m][n];
}
```

### 买卖股票（状态机 DP）

```cpp
// 最多一次交易
int maxProfit1(const std::vector<int>& p) {
    int minPrice = INT_MAX, best = 0;
    for (int x : p) { minPrice = std::min(minPrice, x); best = std::max(best, x - minPrice); }
    return best;
}
// 通用：dp[持有] / dp[不持有]；k 次交易再加一维 k；含冷冻期/手续费加转移项
```

## 为什么这么做

- **为什么能 DP**：最优子结构（大问题最优解含子问题最优解）+ 重叠子问题（同一子问题被多次求）。缺前者不能拆，缺后者用分治即可（无需缓存）。
- **遍历顺序为什么关键**：递推时 `dp[i][j]` 依赖的格子必须先算好。背包逆序防止一件物品被重复计入（0/1），正序则允许（完全）——顺序直接改变语义。
- **状态压缩**：很多二维 DP 只依赖上一行 → 用一维滚动数组把空间从 O(mn) 降到 O(n)（背包即如此）。

## 为什么别的选择不行

- **暴力递归 / 回溯**：重叠子问题被指数次重复计算（斐波那契 O(2ⁿ)）；DP 缓存后降到 O(n)。
- **贪心**：只在有"贪心选择性质"时成立（如活动选择、Huffman）；一般最优化问题贪心会错，DP 考虑全部子问题组合才安全。
- **纯记忆化 vs 递推**：等价，递推（自底向上）省递归栈、常数更小；记忆化（自顶向下）代码更贴近状态定义、只算用到的状态。二选一看题。

## 沉淀结论

::: tip 速记
- 五步：定义状态 → 转移方程 → 初始化 → 遍历顺序 → 验证
- 背包：0/1 逆序、完全正序；序列 DP 常"以 i 结尾"；二维 DP 看"上/左/左上"依赖
- 只依赖上一行 → 滚动数组压成一维；LIS 用 `lower_bound` 降到 O(n log n)
:::

### 面试高频题清单

- **Q：DP 和回溯/贪心怎么选？** A：求所有具体解且子问题不重叠 → 回溯；求最优/计数且子问题重叠 → DP；能证明局部最优即全局最优 → 贪心。
- **Q：0/1 背包和完全背包代码差别？** A：仅内层循环方向——0/1 逆序（每件一次）、完全正序（可重复选）。
- **Q：LIS 怎么做到 O(n log n)？** A：维护"各长度递增子序列的最小结尾"数组，对每个数二分找替换位（tails 单调）。
- **Q：编辑距离转移方程？** A：字符相同 `dp[i][j]=dp[i-1][j-1]`；否则 `=1+min(删 dp[i-1][j], 插 dp[i][j-1], 改 dp[i-1][j-1])`。
- **Q：如何设计股票买卖 DP？** A：状态机——持有/不持有（再按交易次数 k、冷冻期、手续费加维度），列各状态转移。
- **Q：区间 DP 特征？** A：`dp[i][j]` 表示区间 `[i,j]` 的解，按**区间长度从小到大**枚举（戳气球、最长回文子序列、矩阵链乘）。
- **Q：怎么把空间优化掉一维？** A：若 `dp[i]` 只依赖 `dp[i-1]`，用滚动数组或原地覆盖（注意覆盖顺序）。

### 记忆口诀

- **能否 DP**：最优子结构 / 重叠子问题 / 缺前者不能拆、缺后者用分治
- **五步法**：定义状态 / 转移方程 / 初始化 / 遍历顺序 / 举例验证
- **背包方向**：0/1 逆序 / 完全正序 / 顺序即语义
- **题型套路**：背包看选不选 / 字符串看增删改 / 序列看以 i 结尾 / 二维看上左左上

## 内容来源

综合整理自《算法导论》DP 章节与高频面试题型（背包九讲、LeetCode DP 标签）；代码为教学示意的 C++ 实现。

## 自测：合上资料能说清楚吗？

1. 一个问题满足什么两个条件才适合用 DP？缺其中一个分别该退回到什么方法？
   <details><summary>参考答案</summary>

需同时有**最优子结构**（大问题最优解由子问题最优解拼出）与**重叠子问题**（同一子问题被反复求）。缺最优子结构则不能拆解；有最优子结构但**无重叠**用**分治**即可，无需缓存。

</details>

2. 完整说出 DP 五步法，并解释其中哪一步最容易被忽略却最关键。
   <details><summary>参考答案</summary>

①定义状态 ②转移方程 ③初始化 ④**遍历顺序** ⑤举例验证。**遍历顺序**最易被忽略：算 `dp[i][j]` 时其依赖的格子（上/左/左上）必须已算好，顺序错则读到未初始化的值。

</details>

3. 0/1 背包与完全背包的代码只差一处，是哪里？为什么这一处就改变了语义？
   <details><summary>参考答案</summary>

只差内层容量循环方向。**0/1 逆序**：算 `dp[j]` 时 `dp[j-w]` 仍是上一件的旧值，保证每件**只选一次**；**完全正序**：`dp[j-w]` 可能已含本件，从而允许**重复选**。

</details>

4. LIS 如何从 O(n²) 优化到 O(n log n)？维护的数组含义是什么？
   <details><summary>参考答案</summary>

维护 `tails[k]` = **长度 k+1 的递增子序列的最小结尾**（单调递增）。对每个数用 `lower_bound` 二分找第一个 ≥ 它的位置替换，找不到则接长；数组长度即 LIS 长。二分把每步的 O(n) 降为 O(log n)。

</details>

5. 写出编辑距离的转移方程，并说明「字符相同」与「字符不同」两种情形的处理差异。
   <details><summary>参考答案</summary>

字符**相同**：`dp[i][j]=dp[i-1][j-1]`，免操作直接继承左上。字符**不同**：`dp[i][j]=1+min(dp[i-1][j] 删, dp[i][j-1] 插, dp[i-1][j-1] 改)`，取三种操作最小代价加一。边界：空串对齐需删/插 i 或 j 次。

</details>

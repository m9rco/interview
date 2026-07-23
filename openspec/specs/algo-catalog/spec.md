# algo-catalog Specification

## Purpose
TBD - created by archiving change site-content-audit. Update Purpose after archive.
## Requirements
### Requirement: 算法域专题目录

`/algo/` 域 MUST 覆盖既有 8 专题，并 MUST 补齐 7 个高频编码面试类别专题：`greedy`、`bit-manipulation`、`monotonic-stack`、`string-matching`、`intervals`、`math-number-theory`、`union-find`。每个专题 MUST 按五段式组织、配套 `.cards.md`、接入 `dependency-map`。

#### Scenario: 15 个算法专题齐备

- **WHEN** 检查 `docs/algo/` 与侧边栏
- **THEN** 既有 8 专题 + 新增 7 专题（共 15 篇）均存在、通过 `check:structure`、各配一份 `.cards.md`

### Requirement: greedy 专题内容完整

`greedy` 专题 MUST 覆盖贪心的适用判定与经典题型。

#### Scenario: greedy 必含项

- **WHEN** 打开 `docs/algo/greedy.md`
- **THEN** 内容至少包含：贪心成立的两大前提（贪心选择性质 + 最优子结构）与"何时能贪、何时必须 DP"的判定、交换论证/反证法证明思路、经典题（活动选择/区间调度、Huffman 编码、跳跃游戏、加油站、分发糖果、任务调度器），并与 `dynamic-programming` 交叉链接

### Requirement: bit-manipulation 专题内容完整

`bit-manipulation` 专题 MUST 覆盖位运算技巧与经典题型。

#### Scenario: bit-manipulation 必含项

- **WHEN** 打开 `docs/algo/bit-manipulation.md`
- **THEN** 内容至少包含：与/或/异或/取反/移位语义、常用技巧（`x&(x-1)` 消最低位 1、`x&-x` 取最低位 1、异或消偶找单、状态压缩、位掩码枚举子集）、经典题（只出现一次的数字 I/II/III、位1计数、格雷码、子集枚举、汉明距离）、有符号右移与溢出坑

### Requirement: monotonic-stack 专题内容完整

`monotonic-stack` 专题 MUST 覆盖单调栈/单调队列的套路与经典题型。

#### Scenario: monotonic-stack 必含项

- **WHEN** 打开 `docs/algo/monotonic-stack.md`
- **THEN** 内容至少包含：单调递增/递减栈的入栈出栈不变量、"下一个更大/更小元素"通用模板、单调队列解滑动窗口最大值、经典题（每日温度、柱状图最大矩形、接雨水、股票跨度），并说明与 `two-pointers-sliding-window` 的边界

### Requirement: string-matching 专题内容完整

`string-matching` 专题 MUST 覆盖主流字符串匹配算法。

#### Scenario: string-matching 必含项

- **WHEN** 打开 `docs/algo/string-matching.md`
- **THEN** 内容至少包含：暴力匹配复杂度、KMP（next/fail 数组构造与匹配、为何 O(n+m)）、Rabin-Karp 滚动哈希与哈希碰撞、Z 函数/扩展 KMP 概览、Trie/AC 自动机多模匹配概览、经典题（strStr、重复子串、最短回文串）

### Requirement: intervals 专题内容完整

`intervals` 专题 MUST 覆盖区间类问题的排序套路与经典题型。

#### Scenario: intervals 必含项

- **WHEN** 打开 `docs/algo/intervals.md`
- **THEN** 内容至少包含：按起点/终点排序的选择依据、区间合并、插入区间、区间交集、会议室 I/II（最少会议室=扫描线/最小堆）、用最少箭引爆气球、差分数组与扫描线技巧

### Requirement: math-number-theory 专题内容完整

`math-number-theory` 专题 MUST 覆盖后端高频数学与数论。

#### Scenario: math-number-theory 必含项

- **WHEN** 打开 `docs/algo/math-number-theory.md`
- **THEN** 内容至少包含：GCD/LCM 与欧几里得、快速幂与模幂、模运算性质与防溢出、质数筛（埃氏筛/线性筛）、质因数分解、组合数与取模（费马小定理逆元）、随机与洗牌（Fisher-Yates）、经典题（Pow(x,n)、快乐数、计数质数、多数元素 Boyer-Moore）

### Requirement: union-find 专题内容完整

`union-find` 专题 MUST 作为独立专题覆盖并查集，并从 `graph` 抽出。

#### Scenario: union-find 必含项

- **WHEN** 打开 `docs/algo/union-find.md`
- **THEN** 内容至少包含：按秩/按大小合并 + 路径压缩、近似 O(α(n)) 复杂度、连通分量计数、经典题（岛屿数量、冗余连接、账户合并、被围绕的区域、最长连续序列）、带权并查集概览，并与 `graph` 交叉链接说明"何时用并查集 vs BFS/DFS"


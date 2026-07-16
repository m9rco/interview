---
title: 二分查找与变体
---

# 二分查找与变体

> 标准二分 · 左/右边界 · 旋转数组 · 找峰值 · 第 K 小 · 二分答案——统一 C++、区间不变量

::: tip 🧠 一句话记忆锚点
**二分的本质不是"数组有序"，而是"存在单调的判定条件（可行→不可行 的分界）"。写对二分只需盯死两点：① 区间定义（`[lo,hi]` 闭 还是 `[lo,hi)` 半开）②循环不变量与收缩方向要与区间定义一致。找边界时把"相等"也当作继续收缩的条件。**
:::

## 场景问题

二分是面试最容易"写出 bug"的基础算法——死循环、边界差一、返回错索引，几乎都源于**区间定义和收缩不一致**。先钉死一套模板，所有变体都从它推。

判断能否二分：**数组有序**，或更一般地——**答案空间上存在单调性**（小于某阈值都不行、大于都行），后者就是"二分答案"。

## 实现方案

### 模板一：找确定值（闭区间 `[lo, hi]`）

```cpp
int binarySearch(const std::vector<int>& a, int target) {
    int lo = 0, hi = (int)a.size() - 1;             // 闭区间 [lo, hi]
    while (lo <= hi) {                               // 区间非空
        int mid = lo + (hi - lo) / 2;                // 防溢出
        if (a[mid] == target) return mid;
        else if (a[mid] < target) lo = mid + 1;      // 收缩到 [mid+1, hi]
        else hi = mid - 1;                           // 收缩到 [lo, mid-1]
    }
    return -1;                                       // 未找到
}
```

**区间收缩动画**：每次比较把搜索区间**砍掉一半**，O(log n) 步收敛。下图查找 target（落在索引 6）：

<svg viewBox="0 0 560 150" width="100%" style="max-width:560px;height:auto" role="img" aria-label="二分查找：搜索区间每步减半，向目标收敛">
  <g font-size="13" text-anchor="middle">
    <rect x="40"  y="50" width="44" height="40" rx="3" fill="#334155"/><text x="62"  y="75" fill="#fff">1</text>
    <rect x="88"  y="50" width="44" height="40" rx="3" fill="#334155"/><text x="110" y="75" fill="#fff">3</text>
    <rect x="136" y="50" width="44" height="40" rx="3" fill="#334155"/><text x="158" y="75" fill="#fff">5</text>
    <rect x="184" y="50" width="44" height="40" rx="3" fill="#334155"/><text x="206" y="75" fill="#fff">7</text>
    <rect x="232" y="50" width="44" height="40" rx="3" fill="#334155"/><text x="254" y="75" fill="#fff">9</text>
    <rect x="280" y="50" width="44" height="40" rx="3" fill="#334155"/><text x="302" y="75" fill="#fff">11</text>
    <rect x="328" y="50" width="44" height="40" rx="3" fill="#16a34a"/><text x="350" y="75" fill="#fff">13</text>
    <rect x="376" y="50" width="44" height="40" rx="3" fill="#334155"/><text x="398" y="75" fill="#fff">15</text>
    <rect x="424" y="50" width="44" height="40" rx="3" fill="#334155"/><text x="446" y="75" fill="#fff">17</text>
    <rect x="472" y="50" width="44" height="40" rx="3" fill="#334155"/><text x="494" y="75" fill="#fff">19</text>
  </g>
  <!-- shrinking active-range window -->
  <rect y="46" height="48" rx="4" fill="#f59e0b" fill-opacity="0.22" stroke="#f59e0b" stroke-width="2">
    <animate attributeName="x" values="40;40;328;328;328" keyTimes="0;0.25;0.5;0.75;1" dur="5s" repeatCount="indefinite" calcMode="discrete"/>
    <animate attributeName="width" values="476;476;236;92;44" keyTimes="0;0.25;0.5;0.75;1" dur="5s" repeatCount="indefinite" calcMode="discrete"/>
  </rect>
  <text x="40" y="122" font-size="11" fill="currentColor">[0,9] mid=9&lt;13 → [5,9]；mid=13 命中（若继续：[5,6]→[6,6]）。每步区间减半 → O(log n)。</text>
</svg>

### 模板二：找左边界（第一个 ≥ target）/ 右边界

大量面试题要的不是"某个 target"，而是"第一个满足条件的位置"。用**半开区间 `[lo, hi)`** + "找左边界"最不易错：

```cpp
// 第一个 >= target 的下标（lower_bound）；不存在返回 a.size()
int lowerBound(const std::vector<int>& a, int target) {
    int lo = 0, hi = (int)a.size();                  // 半开 [lo, hi)
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < target) lo = mid + 1;           // mid 不满足，排除
        else hi = mid;                               // mid 可能是答案，保留在 [lo, mid)
    }
    return lo;                                        // lo == hi，即左边界
}

// 第一个 > target 的下标（upper_bound）：把上面的 < 改成 <=
int upperBound(const std::vector<int>& a, int target) {
    int lo = 0, hi = (int)a.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] <= target) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}
```

> 求 target 的出现次数 = `upperBound - lowerBound`；插入位置 = `lowerBound`。C++ 标准库直接有 `std::lower_bound / upper_bound`。

### 变体：旋转有序数组搜索

```cpp
int searchRotated(const std::vector<int>& a, int target) {
    int lo = 0, hi = (int)a.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) return mid;
        if (a[lo] <= a[mid]) {                        // 左半有序
            if (a[lo] <= target && target < a[mid]) hi = mid - 1;
            else lo = mid + 1;
        } else {                                      // 右半有序
            if (a[mid] < target && target <= a[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return -1;
}
```

关键：mid 把数组分两半，**至少一半是有序的**——判断 target 是否落在有序那半，决定往哪走。

### 二分答案（把"求最优"转成"判定可行"）

当答案落在一个数值区间、且"可行性"单调（值越大越可行 / 越不可行），就对**答案**二分，`check(x)` 判可行：

```cpp
// 例：分割数组使子数组和的最大值最小（"可行"= 能否用 ≤ m 段、每段和 ≤ x 覆盖）
int splitArray(const std::vector<int>& a, int m) {
    auto feasible = [&](long long cap) {
        int cnt = 1; long long cur = 0;
        for (int v : a) {
            if (v > cap) return false;
            if (cur + v > cap) { cnt++; cur = v; } else cur += v;
        }
        return cnt <= m;
    };
    long long lo = 0, hi = 0;
    for (int v : a) { lo = std::max(lo, (long long)v); hi += v; }
    while (lo < hi) {                                 // 找最小可行 cap
        long long mid = lo + (hi - lo) / 2;
        if (feasible(mid)) hi = mid; else lo = mid + 1;
    }
    return (int)lo;
}
```

## 为什么这么做

- **`mid = lo + (hi-lo)/2`**：避免 `(lo+hi)` 整型溢出。
- **半开区间找左边界**：`hi = mid`（不 -1）保证"可能的答案"永远在区间内，循环 `lo < hi` 终止时 `lo==hi` 恰是边界，天然无差一 bug。
- **循环条件与区间匹配**：闭区间 `[lo,hi]` 用 `lo <= hi` 且 `hi=mid-1/lo=mid+1`；半开 `[lo,hi)` 用 `lo < hi` 且 `hi=mid`。混用是死循环/越界的根源。

## 为什么别的选择不行

- **线性扫描 O(n)**：有序或答案单调时浪费；二分 O(log n) 是"每次砍一半"的指数级优势。
- **`hi = mid - 1` 用在找左边界**：可能把唯一答案排除，导致差一错误——找边界必须 `hi = mid`。
- **对"无单调性"的问题硬套二分**：`check` 不单调则二分结论无意义，先证明单调再二分。

## 沉淀结论

::: tip 速记
- 找确定值 → 闭区间模板一；找边界 / 计数 / 插入位置 → 半开模板二（lower/upper_bound）
- `mid = lo + (hi-lo)/2` 防溢出；循环条件与区间定义严格匹配
- "求最优最值 + 可行性单调" → **二分答案**，把优化问题转成判定问题
:::

### 面试高频题清单

- **Q：为什么会死循环？** A：区间定义与收缩不一致（如半开区间却写 `hi=mid-1`，或 `lo=mid` 未 +1）。用固定模板 + `mid=lo+(hi-lo)/2`。
- **Q：找第一个/最后一个等于 target？** A：`lowerBound` 得第一个 ≥ target 再判等；最后一个 = `upperBound-1` 再判等。
- **Q：旋转排序数组找最小值 / 找 target？** A：比较 `a[mid]` 与 `a[hi]`（或 `a[lo]`）判断哪半有序，向可能含目标的一侧收缩。
- **Q：山脉数组找峰值？** A：`a[mid] < a[mid+1]` 说明峰在右（`lo=mid+1`），否则在左含 mid（`hi=mid`）。
- **Q：什么时候用二分答案？** A：求"最大化最小值 / 最小化最大值 / 第 K 小"且可行性随答案单调时——对答案二分 + O(n) check。
- **Q：两个有序数组的中位数？** A：二分较短数组的划分点，使左半 ≤ 右半，O(log(min(m,n)))。

### 记忆口诀

- **本质**：单调判定 / 可行→不可行分界 / 不限于"有序数组"
- **写对两点**：区间定义（闭 `[lo,hi]` / 半开 `[lo,hi)`） / 循环条件与收缩方向一致 / `mid=lo+(hi-lo)/2` 防溢出
- **选模板**：找确定值→闭区间 / 找边界·计数·插入→半开 lower/upper_bound / 求最值→二分答案
- **防坑**：找边界用 `hi=mid` 不 -1 / check 必须单调 / 混用区间=死循环

## 内容来源

综合整理自《算法》第 4 版二分章节与高频面试题；模板经数值边界验证。请以教材与官方文档为准。

## 自测：合上资料能说清楚吗？

1. 能用二分的前提到底是什么？只有"数组有序"才行吗？
   <details><summary>参考答案</summary>

本质是**存在单调判定条件**（可行→不可行有明确分界），有序数组只是特例。答案空间上"小于阈值都不行、大于都行"即可**二分答案**。

</details>

2. 写二分只需盯死哪两点，为什么它们决定了对错？
   <details><summary>参考答案</summary>

①**区间定义**（闭 `[lo,hi]` 还是半开 `[lo,hi)`）；②**循环条件与收缩方向**要与区间定义一致。二者不匹配是**死循环、越界、差一**的根源。

</details>

3. 对比"找确定值"模板与"找左边界"模板：循环条件与 `hi` 收缩为何不同？
   <details><summary>参考答案</summary>

找确定值用**闭区间** `lo<=hi`、`hi=mid-1`；找左边界用**半开** `lo<hi`、`hi=mid`（不减一，保留可能答案）。终止时 `lo==hi` 即边界，**天然无差一**。

</details>

4. 旋转有序数组里怎么判断该往哪半走？
   <details><summary>参考答案</summary>

mid 分两半必有**至少一半有序**。比较 `a[lo]<=a[mid]` 定位有序半，再看 target 是否落在该半的值域内，决定收缩方向。

</details>

5. 什么信号提示该用"二分答案"？check 有什么硬性要求？
   <details><summary>参考答案</summary>

信号：**最大化最小值 / 最小化最大值 / 第 K 小**。要求 `check(x)` 对答案**单调**；不单调则二分结论无意义，须先证单调，check 通常 O(n)。

</details>

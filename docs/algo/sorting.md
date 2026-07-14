---
title: 排序算法全景与选型
---

# 排序算法全景与选型

> 选择/插入/希尔/冒泡/归并/快排/堆排 · 稳定性 × 复杂度 × 选型公式 · 快排三路优化 · 线性排序 · 全部 C++ 实现

::: tip 🧠 一句话记忆锚点
**面试问排序先反问四件事：数据规模、是否近乎有序、是否大量重复、要不要稳定。选型——小/近乎有序用插入，通用用快排（工程配三路 + 随机基准 + 小区间转插入），要稳定或链表用归并，Top-K/优先级用堆。比较排序下界 O(n log n)；标准库都是混合体（C++ introsort、Go pdqsort）。**
:::

## 场景问题

拿到排序需求先自问：

1. **数据特征**：大量重复元素？（→ 三路快排）近乎有序？（→ 插入排序 O(n)）取值范围有限？（→ 计数/基数排序 O(n)）
2. **是否要稳定**：相等元素保持原相对顺序？（→ 归并、稳定插入）
3. **存储结构**：链表不适合快排（无随机访问），适合归并
4. **数据量**：小数组常数因子主导，O(n²) 的插入反而更快

## 实现方案

### 七大排序对照表

| 算法 | 平均 | 最坏 | 最好 | 空间 | 稳定 | 一句话记忆 |
| --- | --- | --- | --- | --- | --- | --- |
| 冒泡 Bubble | O(n²) | O(n²) | O(n) | O(1) | ✅ | 相邻交换，加 flag 可提前退出 |
| 选择 Selection | O(n²) | O(n²) | O(n²) | O(1) | ❌ | 每轮选最小放前面，交换次数少 |
| 插入 Insertion | O(n²) | O(n²) | **O(n)** | O(1) | ✅ | 近乎有序神器，小数组快 |
| 希尔 Shell | O(n^1.3) | O(n²) | O(n) | O(1) | ❌ | 带间隔的插入，缩小增量 |
| 归并 Merge | O(nlogn) | O(nlogn) | O(nlogn) | **O(n)** | ✅ | 稳定、可外排、适合链表 |
| 快排 Quick | O(nlogn) | **O(n²)** | O(nlogn) | O(logn) | ❌ | 通用最快，基准选不好退化 |
| 堆排 Heap | O(nlogn) | O(nlogn) | O(nlogn) | O(1) | ❌ | 原地、最坏也稳，Top-K 首选 |

线性排序（非比较，受限于取值范围）：**计数排序** O(n+k)、**基数排序** O(d·(n+k))、**桶排序** O(n)，稳定但需额外空间且只适合整数/定长 key。

### O(n²) 三兄弟（C++）

```cpp
#include <vector>
using std::vector;

void bubbleSort(vector<int>& a) {
    for (int i = 0; i < (int)a.size() - 1; i++) {
        bool swapped = false;                       // 提前退出：本轮无交换即已有序
        for (int j = 0; j + 1 < (int)a.size() - i; j++)
            if (a[j] > a[j + 1]) { std::swap(a[j], a[j + 1]); swapped = true; }
        if (!swapped) break;
    }
}

void selectionSort(vector<int>& a) {               // 不稳定：远距离交换
    for (int i = 0; i < (int)a.size() - 1; i++) {
        int mn = i;
        for (int j = i + 1; j < (int)a.size(); j++)
            if (a[j] < a[mn]) mn = j;
        std::swap(a[i], a[mn]);
    }
}

void insertionSort(vector<int>& a) {               // 近乎有序时 O(n)
    for (int i = 1; i < (int)a.size(); i++) {
        int key = a[i], j = i - 1;
        while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j--; }
        a[j + 1] = key;
    }
}
```

### 归并排序（稳定，O(n) 额外空间）

```cpp
void mergeSort(vector<int>& a, int l, int r, vector<int>& tmp) {
    if (l >= r) return;
    int m = l + (r - l) / 2;
    mergeSort(a, l, m, tmp);
    mergeSort(a, m + 1, r, tmp);
    int i = l, j = m + 1, k = l;
    while (i <= m && j <= r)
        tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];   // <= 保证稳定
    while (i <= m) tmp[k++] = a[i++];
    while (j <= r) tmp[k++] = a[j++];
    for (int t = l; t <= r; t++) a[t] = tmp[t];
}
```

### 快速排序（三路 + 随机基准 + 小区间转插入）

朴素快排在**已排序 / 大量重复**输入下退化到 O(n²)。工程化三招：**随机基准 / 三数取中**避免有序退化、**三路切分**处理大量重复、**小区间转插入**减少递归常数。

```cpp
#include <cstdlib>

void quickSort(vector<int>& a, int lo, int hi) {
    while (lo < hi) {
        if (hi - lo < 16) { /* 小区间转插入（略，见上）*/ }
        int p = lo + rand() % (hi - lo + 1);       // 随机基准，防有序退化
        std::swap(a[lo], a[p]);
        int pivot = a[lo];
        int lt = lo, i = lo + 1, gt = hi;           // 荷兰国旗三路划分
        while (i <= gt) {
            if (a[i] < pivot)      std::swap(a[i++], a[lt++]);
            else if (a[i] > pivot) std::swap(a[i], a[gt--]);
            else                   i++;             // == pivot 留在中间，跳过
        }
        // [lo,lt) < pivot | [lt,gt] == pivot | (gt,hi] > pivot
        if (lt - lo < hi - gt) { quickSort(a, lo, lt - 1); lo = gt + 1; }  // 尾递归优化：先递归小半边
        else                   { quickSort(a, gt + 1, hi); hi = lt - 1; }
    }
}
```

**三路 partition 动画**：三个指针 `lt / i / gt` 把数组扫成 `<pivot | ==pivot | 待定 | >pivot`——大量重复时等值区被一次性排除，退化为近 O(n)：

<svg viewBox="0 0 640 200" width="100%" style="max-width:640px;height:auto" role="img" aria-label="快排三路划分：lt/i/gt 三指针把数组分成小于/等于/大于 pivot 三段">
  <text x="20" y="24" font-size="12" fill="currentColor">pivot = 5，扫描指针 i 前进：&lt;5 换到左(lt)，&gt;5 换到右(gt)，==5 原地</text>
  <!-- cells -->
  <g font-size="13" text-anchor="middle">
    <rect x="40"  y="70" width="56" height="40" rx="4" fill="#1d4ed8"/><text x="68"  y="95" fill="#fff">3</text>
    <rect x="100" y="70" width="56" height="40" rx="4" fill="#1d4ed8"/><text x="128" y="95" fill="#fff">1</text>
    <rect x="160" y="70" width="56" height="40" rx="4" fill="#64748b"/><text x="188" y="95" fill="#fff">5</text>
    <rect x="220" y="70" width="56" height="40" rx="4" fill="#64748b"/><text x="248" y="95" fill="#fff">5</text>
    <rect x="280" y="70" width="56" height="40" rx="4" fill="#dc2626"/><text x="308" y="95" fill="#fff">8</text>
    <rect x="340" y="70" width="56" height="40" rx="4" fill="#dc2626"/><text x="368" y="95" fill="#fff">9</text>
    <rect x="400" y="70" width="56" height="40" rx="4" fill="#1d4ed8"/><text x="428" y="95" fill="#fff">2</text>
    <rect x="460" y="70" width="56" height="40" rx="4" fill="#dc2626"/><text x="488" y="95" fill="#fff">7</text>
  </g>
  <!-- legend -->
  <g font-size="11">
    <rect x="40" y="130" width="14" height="14" fill="#1d4ed8"/><text x="60" y="142" fill="currentColor">&lt; pivot</text>
    <rect x="150" y="130" width="14" height="14" fill="#64748b"/><text x="170" y="142" fill="currentColor">== pivot</text>
    <rect x="270" y="130" width="14" height="14" fill="#dc2626"/><text x="290" y="142" fill="currentColor">&gt; pivot</text>
  </g>
  <!-- moving scan pointer i -->
  <polygon points="-8,0 8,0 0,14" fill="#f59e0b">
    <animateMotion path="M68 52 L 488 52" dur="4s" repeatCount="indefinite" calcMode="discrete" keyPoints="0;0.14;0.28;0.42;0.57;0.71;0.85;1" keyTimes="0;0.14;0.28;0.42;0.57;0.71;0.85;1"/>
  </polygon>
  <text x="60" y="176" font-size="11" fill="currentColor">i 指针（橙）逐格判定；等值段 [lt,gt] 一次性定位，大量重复时接近 O(n)。</text>
</svg>

### 堆排序（原地，最坏也 O(n log n)）

```cpp
void siftDown(vector<int>& a, int i, int n) {
    while (2 * i + 1 < n) {
        int c = 2 * i + 1;                          // 左孩子
        if (c + 1 < n && a[c + 1] > a[c]) c++;       // 取较大孩子
        if (a[i] >= a[c]) break;
        std::swap(a[i], a[c]);
        i = c;
    }
}
void heapSort(vector<int>& a) {
    int n = a.size();
    for (int i = n / 2 - 1; i >= 0; i--) siftDown(a, i, n);   // 建堆 O(n)
    for (int i = n - 1; i > 0; i--) {
        std::swap(a[0], a[i]);                        // 堆顶（最大）换到末尾
        siftDown(a, 0, i);                            // 缩小堆再下沉
    }
}
```

> sift-down 的下沉过程见 [常见数据结构 · 堆](/algo/data-structures.md) 里的动画。

## 为什么这么做

- **没有银弹**：比较排序下界 O(n log n)，"最快"取决于输入。工程库用混合策略在各种输入上都不塌方（C++ `std::sort` = introsort：快排 + 递归过深转堆排兜底 + 小区间插入收尾）。
- **稳定性是业务需求**：多关键字排序（先按价格、价格相同保持按时间的原序）依赖稳定排序，归并/稳定插入不可替代。
- **三路快排**：面对大量重复元素，普通快排会把等值元素反复交换、划分不均；三路一次性把等值区排除，是 `sort colors`（荷兰国旗）这类题的核心。

## 为什么别的选择不行

- **只用快排**：面对已排序或全等元素退化 O(n²)、递归爆栈 → 必须配随机基准 + 三路 + 堆排兜底。
- **只用 O(n²) 排序**：数据一大不可用；但小数组 / 近乎有序时插入排序常数小反而更优，工程库在小区间回退它。
- **线性排序当万金油**：计数/基数只在 key 取值范围可控、整数/定长时成立，范围一大空间爆炸，无法替代通用比较排序。

## 沉淀结论

::: tip 选型速答
- **选型公式**：小/近乎有序 → 插入；通用 → 快排（三路 + 随机基准 + 小区间插入）；要稳定/链表/外排 → 归并；Top-K/优先级 → 堆
- **稳定的**：冒泡、插入、归并、计数/基数/桶；**不稳定**：选择、希尔、快排、堆
- **快排最坏 O(n²)**，靠随机基准 + 三路 + introsort 兜底
:::

### 面试高频题清单（按主题分类）

**排序本身**
- **Q：`std::sort` 底层是什么？** A：introsort——快排为主，递归深度超 `2·log n` 转堆排（防最坏），小区间（<16）转插入排序。
- **Q：如何稳定地排序？** A：归并排序天然稳定；或给比较键追加原始下标做二级键；`std::stable_sort`（归并，O(n log²n) 或借助额外空间 O(n log n)）。
- **Q：为什么快排比归并常数更小？** A：原地、缓存友好、无额外数组拷贝；归并要 O(n) 辅助空间和更多数据搬移。

**基于划分/堆的经典题**
- **Q：数组第 K 大？** A：快速选择（quickselect，期望 O(n)）或 size=K 最小堆（O(n log K)）。
- **Q：颜色分类 / sort colors（0/1/2）？** A：三路划分（荷兰国旗），一趟 O(n)、O(1) 空间。
- **Q：合并 K 个有序链表？** A：最小堆放 K 个头节点，每次弹最小、推入其后继，O(N log K)；或两两归并。
- **Q：链表排序为什么用归并？** A：链表无随机访问，快排取基准/划分低效；归并可 O(1) 空间（自底向上）且稳定。

## 内容来源

关键点整理自经典教材（《算法》第 4 版）与标准库实现（C++ introsort / Go pdqsort）；并查集迁至 [图论](/algo/graph.md)。请以官方文档与教材为准。

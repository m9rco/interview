---
title: 双指针与滑动窗口
---

# 双指针与滑动窗口

> 对撞指针 · 快慢指针 · 定长/变长滑动窗口——统一 C++、含窗口伸缩动画

::: tip 🧠 一句话记忆锚点
**双指针 = 用两个下标把 O(n²) 的嵌套枚举压成 O(n)。三种范式：① 对撞指针（有序数组两端向中间，两数之和 / 盛水）② 快慢指针（链表判环 / 找中点 / 原地去重）③ 滑动窗口（连续子数组/子串，右指针扩、破坏条件时左指针缩）。滑窗口诀：右扩到满足/破坏 → 左缩到恰好合法 → 更新答案。**
:::

## 场景问题

很多"连续子数组 / 子串 / 一对元素"的问题，暴力是 O(n²) 双重循环。双指针利用**单调性**（数组有序、或窗口扩缩时条件单调变化）让两个指针各自最多走一遍，降到 **O(n)**。

判断能不能用：
- **对撞**：数组**有序**，且移动某端能单调改变某个度量（和变大/变小）。
- **快慢**：链表 / 数组中"环、中点、倒数第 k 个、原地覆盖"。
- **滑窗**：求**连续**区间的最值/计数，且"窗口越大越满足（或越不满足）"具单调性。

## 实现方案

### 对撞指针（有序数组两数之和 / 盛最多水）

```cpp
// 有序数组找和为 target 的两个数
std::pair<int,int> twoSumSorted(const std::vector<int>& a, int target) {
    int l = 0, r = (int)a.size() - 1;
    while (l < r) {
        int s = a[l] + a[r];
        if (s == target) return {l, r};
        else if (s < target) l++;         // 和太小 → 左指针右移变大
        else r--;                         // 和太大 → 右指针左移变小
    }
    return {-1, -1};
}

// 盛最多水的容器：短板决定容量，移动短板才可能变大
int maxArea(const std::vector<int>& h) {
    int l = 0, r = (int)h.size() - 1, best = 0;
    while (l < r) {
        best = std::max(best, std::min(h[l], h[r]) * (r - l));
        if (h[l] < h[r]) l++; else r--;   // 移动较矮的一侧
    }
    return best;
}
```

### 快慢指针（链表判环 / 找环入口）

```cpp
struct ListNode { int val; ListNode* next; };

bool hasCycle(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;                // 慢走 1 步
        fast = fast->next->next;          // 快走 2 步
        if (slow == fast) return true;    // 相遇 → 有环
    }
    return false;
}

ListNode* detectCycleStart(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next; fast = fast->next->next;
        if (slow == fast) {               // 相遇后，一指针回头
            ListNode* p = head;
            while (p != slow) { p = p->next; slow = slow->next; }
            return p;                     // 再次相遇即环入口（数学可证）
        }
    }
    return nullptr;
}
```

### 变长滑动窗口（最长无重复子串）

**窗口伸缩动画**：右指针 `r` 不断扩张纳入新字符；一旦窗口内出现重复，左指针 `l` 右移收缩到重新合法；全程每个字符最多进出窗口各一次 → O(n)：

<svg viewBox="0 0 560 160" width="100%" style="max-width:560px;height:auto" role="img" aria-label="滑动窗口：右指针扩张，遇重复时左指针收缩，窗口在字符串上滑动">
  <g font-size="15" text-anchor="middle" font-family="monospace">
    <rect x="40"  y="50" width="44" height="44" rx="4" fill="#334155"/><text x="62"  y="78" fill="#fff">a</text>
    <rect x="90"  y="50" width="44" height="44" rx="4" fill="#334155"/><text x="112" y="78" fill="#fff">b</text>
    <rect x="140" y="50" width="44" height="44" rx="4" fill="#334155"/><text x="162" y="78" fill="#fff">c</text>
    <rect x="190" y="50" width="44" height="44" rx="4" fill="#334155"/><text x="212" y="78" fill="#fff">a</text>
    <rect x="240" y="50" width="44" height="44" rx="4" fill="#334155"/><text x="262" y="78" fill="#fff">b</text>
    <rect x="290" y="50" width="44" height="44" rx="4" fill="#334155"/><text x="312" y="78" fill="#fff">c</text>
    <rect x="340" y="50" width="44" height="44" rx="4" fill="#334155"/><text x="362" y="78" fill="#fff">b</text>
    <rect x="390" y="50" width="44" height="44" rx="4" fill="#334155"/><text x="412" y="78" fill="#fff">b</text>
  </g>
  <!-- window rect: expand then contract as duplicates appear -->
  <rect y="46" height="52" rx="5" fill="#16a34a" fill-opacity="0.2" stroke="#16a34a" stroke-width="2.5">
    <animate attributeName="x"     values="40;40;40;90;140;190;240" keyTimes="0;0.15;0.3;0.45;0.6;0.8;1" dur="6s" repeatCount="indefinite" calcMode="discrete"/>
    <animate attributeName="width" values="44;94;144;144;144;144;144" keyTimes="0;0.15;0.3;0.45;0.6;0.8;1" dur="6s" repeatCount="indefinite" calcMode="discrete"/>
  </rect>
  <text x="40" y="128" font-size="11" fill="currentColor">"abcabcbb"：窗口扩到 abc；遇到重复 a → 左缩；继续 → 最长无重复子串长度 3。</text>
</svg>

```cpp
#include <unordered_map>
int lengthOfLongestSubstring(const std::string& s) {
    std::unordered_map<char, int> last;   // 字符 -> 最近出现下标
    int l = 0, best = 0;
    for (int r = 0; r < (int)s.size(); r++) {
        auto it = last.find(s[r]);
        if (it != last.end() && it->second >= l)
            l = it->second + 1;           // 出现重复：左边界跳到重复字符的下一位
        last[s[r]] = r;
        best = std::max(best, r - l + 1); // 当前窗口长度
    }
    return best;
}
```

### 变长滑窗通用模板（最小覆盖子串）

```cpp
#include <unordered_map>
std::string minWindow(const std::string& s, const std::string& t) {
    std::unordered_map<char,int> need, win;
    for (char c : t) need[c]++;
    int have = 0, required = need.size();
    int l = 0, bestLen = INT_MAX, bestL = 0;
    for (int r = 0; r < (int)s.size(); r++) {
        char c = s[r];
        if (need.count(c) && ++win[c] == need[c]) have++;   // 该字符已满足
        while (have == required) {                           // 窗口合法 → 尝试收缩
            if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l; }
            char d = s[l++];
            if (need.count(d) && win[d]-- == need[d]) have--;
        }
    }
    return bestLen == INT_MAX ? "" : s.substr(bestL, bestLen);
}
```

**通用套路**：右指针扩张并更新窗口状态 → `while (窗口合法/超标) { 更新答案; 左指针收缩 }`。定长窗口则固定 `r-l+1==k` 时更新并同步右移。

## 为什么这么做

- **对撞指针的正确性**：数组有序时，`a[l]+a[r]` 随 `l++` 单调增、随 `r--` 单调减，所以能一次排除一行/一列，等价于在矩阵上走单调路径，O(n)。
- **快慢指针判环**：快指针每轮比慢指针多走 1 步，若有环必在环内追上；环入口的推导来自"头到入口 = 相遇点绕环回入口"的等距关系。
- **滑窗 O(n)**：左右指针都只增不减，各遍历一次，总移动 ≤ 2n；哈希表 O(1) 维护窗口内计数。

## 为什么别的选择不行

- **暴力双重循环 O(n²)**：n 大直接超时；双指针利用单调性把一维扫描降到线性。
- **无序数组用对撞指针**：单调性不成立，移动指针无法保证排除正确的一侧——需先排序或改用哈希。
- **滑窗套错方向**：窗口条件不单调（例如允许负数求"和 = k"的连续子数组）时滑窗失效，应改用**前缀和 + 哈希**。

## 沉淀结论

::: tip 速记
- 有序 + 找一对 → 对撞指针；链表环/中点/倒数 k → 快慢指针；连续子串/子数组最值 → 滑动窗口
- 滑窗模板：右扩更新状态 → `while(合法/超标){更新答案; 左缩}`
- 滑窗失效（条件不单调、含负数求定值）→ 前缀和 + 哈希
:::

### 面试高频题清单

- **Q：三数之和（3Sum）？** A：排序后固定一个数，剩下两数用对撞指针，注意去重跳过相同值，O(n²)。
- **Q：最长无重复字符子串？** A：变长滑窗 + 哈希记录字符最近下标，左边界跳过重复位（见上）。
- **Q：最小覆盖子串？** A：滑窗 + need/win 计数 + have 计数满足数，合法时收缩取最短（见上）。
- **Q：链表判环 / 找环入口 / 找中点？** A：快慢指针；找中点让 fast 走到尾时 slow 在中点；删倒数第 k 个用"快指针先走 k 步"。
- **Q：和为 k 的连续子数组个数（含负数）？** A：**不能滑窗**（不单调），用前缀和 + 哈希表记录前缀和出现次数，O(n)。
- **Q：接雨水？** A：对撞指针 + 维护左右最大高度，短的一侧结算，O(n) O(1)。

### 记忆口诀

- **对撞指针**：有序数组 / 两端向中间 / 移动某端单调改变度量（两数之和、盛水、接雨水）
- **快慢指针**：链表 / 快2慢1 / 环-中点-倒数k（判环、找入口、找中点）
- **滑动窗口**：连续区间 / 右扩到满足或破坏 → 左缩到恰好合法 → 更新答案
- **失效兜底**：条件不单调 / 含负数求定值 → 前缀和 + 哈希

## 内容来源

综合整理自高频面试题型（LeetCode 双指针 / 滑动窗口标签）与《算法》第 4 版；代码为教学示意的 C++ 实现。

> 消歧：本篇的"滑动窗口"是**算法技巧**（在数组/字符串上移动左右边界）。网络里的[滑动窗口](../internet/sliding-window.md)是 **TCP/HTTP 流量控制**，同名但不同概念；单调栈相关的窗口最值见[单调栈与单调队列](./monotonic-stack.md)。

## 自测：合上资料能说清楚吗？

1. 双指针为什么能把 O(n²) 的枚举压成 O(n)？它依赖什么前提？

<details><summary>参考答案</summary>

依赖**单调性**（数组**有序**或窗口扩缩时条件单调变化），使两个指针**各自只增不减、最多各走一遍**，总移动 ≤ 2n。前提破坏则不适用。

</details>

2. 对撞指针与滑动窗口有何区别？各自适用什么场景？

<details><summary>参考答案</summary>

**对撞指针**：两端向中间逼近，用于**有序数组找一对元素**（两数之和、盛水）。**滑动窗口**：同向双指针维护**连续区间**，用于子串/子数组的最值或计数。前者靠数组有序，后者靠窗口条件单调。

</details>

3. 快慢指针判环后，如何找到环的入口？为什么成立？

<details><summary>参考答案</summary>

相遇后让**一指针回到头节点**，两指针**同速各走 1 步**，再次相遇即入口。因**头到入口的距离 = 相遇点绕环回入口的距离**（数学等距关系）。

</details>

4. 变长滑窗的通用模板是什么？定长窗口有何不同？

<details><summary>参考答案</summary>

变长：**右扩更新状态 → `while(合法/超标){更新答案; 左缩}`**。定长：固定 `r-l+1==k` 时更新答案并**同步右移左右指针**，无需 while 收缩。

</details>

5. 求"和为 k 的连续子数组个数"，含负数时为什么不能用滑窗？改用什么？

<details><summary>参考答案</summary>

含负数时窗口和**不随长度单调变化**，扩缩无法判断方向，滑窗失效。改用**前缀和 + 哈希表**记录各前缀和出现次数，O(n) 统计。

</details>

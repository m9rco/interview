---
title: 蓄水池抽样（Reservoir Sampling）与加权扩展
---

# 蓄水池抽样（Reservoir Sampling）与加权扩展

> 蓄水池抽样解决一个看似不可能的问题：在**总量未知、只能单遍扫描、内存只够放 k 个**的流式数据里，等概率抽出 k 个样本。核心只有一行：第 i 个元素以 k/i 的概率替换池中随机一个。它的美在于——你永远不知道流有多长，却能保证每个元素最终留存概率恰好是 k/n。

::: tip 一句话结论
总量未知、单遍、O(k) 内存下等概率抽 k 个：第 i 个以 k/i 概率替换池中随机一个。
:::

## 场景问题

游戏后台的"从流里公平抽样"随处可见，且都带着"总量未知 + 内存受限"的约束：

- **日志/监控抽样**：战斗服每秒产几十万条日志，全量落盘存不下也贵，要**等概率抽 1%** 落库做分析。日志流是无界的，你不知道今天总共会有多少条。
- **自研网格选连接目标**：去中心化网格里每个节点要从**全量成员**（可能上万）中选固定 `k` 个建连/广播，成员表在流式变化，且不想为此把全量列表拷一份排序。
- **大流量 Trace 采样**：一条请求链路要不要采样，得在**看到第一个 span 时就决定**，那时还不知道这条链路总共多少 span。
- **内存受限统计**：嵌入式/边缘节点上做 Top-K 之外的"代表性样本"，内存只够 k 个槽。

朴素做法是"先把所有元素收集起来，再随机选 k 个"——但**总量未知**（流不知道何时结束）且**内存放不下**（全量可能是 TB 级）。蓄水池抽样让你**单遍、O(k) 内存、O(1) 每元素**就搞定，且严格等概率。

## 实现方案

### 基础算法（Algorithm R）

维护一个大小为 k 的"蓄水池"：

1. 前 k 个元素**直接放入**池中。
2. 从第 `i = k+1` 个元素起：以 `k/i` 的概率决定是否"入选"；若入选，随机替换池中某一个（即 `rand(0, i-1) < k` 时，替换 `pool[rand(0,i-1)]`）。
3. 流结束时，池中 k 个元素就是等概率样本。

```go
package reservoir

import "math/rand"

// Sample 对未知长度的整数流做等概率 k-抽样。
// stream 用 channel 表示"边到边处理、无需知道总长"。
func Sample(stream <-chan int, k int) []int {
	pool := make([]int, 0, k)
	i := 0
	for x := range stream {
		i++
		if i <= k {
			pool = append(pool, x) // 前 k 个直接入池
			continue
		}
		// 第 i 个以 k/i 概率入选：等价于 rand(0,i-1) 落在前 k 个位置
		j := rand.Intn(i) // [0, i)
		if j < k {
			pool[j] = x // 替换池中第 j 个
		}
	}
	return pool
}
```

```mermaid
graph TD
    S["流式输入 x1 x2 x3 ... (总量未知)"] --> C{"i <= k ?"}
    C -->|是| F["直接放入 pool[i]"]
    C -->|否| P{"rand(0,i-1) < k ?<br/>(概率 k/i)"}
    P -->|命中| R["替换 pool[j]"]
    P -->|未命中| D["丢弃 xi"]
    F --> N["读下一个"]
    R --> N
    D --> N
    N --> C
```

::: tip
每个元素只做一次 `rand` 和至多一次赋值，**O(1) 每元素、O(k) 总内存、单遍扫描**。当 n 远大于 k 时，绝大多数元素直接被丢弃（概率 k/i 随 i 增大迅速变小），实际非常快。
:::

### 概率正确性证明

**命题**：流结束（长度 n）时，任意元素 `x` 最终留在池中的概率恰为 `k/n`。

设第 `m` 个元素（`m > k`）。它要"最终留存"，需要：**入选时被选中** 且 **之后再没被替换掉**。

- 第 m 个元素入选的概率：`k/m`。
- 之后每一步 `t`（`t = m+1 ... n`），第 t 个元素入选概率是 `k/t`，若入选则等概率替换池中 k 个之一，故"我这一格被替换"的概率是 `(k/t)·(1/k) = 1/t`，"没被替换"的概率是 `1 - 1/t = (t-1)/t`。

于是第 m 个元素最终留存的概率为：

$$
P = \frac{k}{m} \cdot \prod_{t=m+1}^{n} \frac{t-1}{t}
= \frac{k}{m} \cdot \frac{m}{m+1}\cdot\frac{m+1}{m+2}\cdots\frac{n-1}{n}
$$

连乘裂项后中间全部抵消，只剩 `m/n`：

$$
P = \frac{k}{m} \cdot \frac{m}{n} = \frac{k}{n}
$$

对前 k 个元素（`m ≤ k`）同理：它一开始必然在池中（概率 1），之后每步不被替换的概率同样连乘出 `k/n`。故**所有 n 个元素留存概率都是 k/n，抽样等概率**。∎

::: tip
证明的关键是那串"裂项连乘"——`(m)/(m+1)·(m+1)/(m+2)·…·(n-1)/n = m/n`。这正是蓄水池抽样正确性的数学核心：无论 n 多大、m 在哪，连乘总能抵消成 m/n，再乘上入选概率 k/m 得 k/n。
:::

### 加权扩展：A-Res（Algorithm A with Reservoir）

基础算法假设每个元素等权。现实里常需**按权重抽样**（权重大的更该被选中，如按流量大小抽节点）。Efraimidis & Spirakis 的 **A-Res** 给每个元素算一个 key：`key = u^(1/w)`（`u` 是 `(0,1)` 均匀随机数，`w` 是权重），然后**保留 key 最大的 k 个**——用一个大小 k 的最小堆维护。权重越大，`key` 期望越大，越容易留在堆里。

```go
package reservoir

import (
	"container/heap"
	"math"
	"math/rand"
)

type item struct {
	val int
	key float64 // u^(1/w)
}

// 最小堆：堆顶是当前 k 个里 key 最小的，便于被更大的替换
type minHeap []item

func (h minHeap) Len() int            { return len(h) }
func (h minHeap) Less(i, j int) bool  { return h[i].key < h[j].key }
func (h minHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *minHeap) Push(x interface{}) { *h = append(*h, x.(item)) }
func (h *minHeap) Pop() interface{} {
	old := *h
	n := len(old)
	it := old[n-1]
	*h = old[:n-1]
	return it
}

// WeightedSample: 流式加权抽样，(值,权重) 一一对应地到来
type Elem struct {
	Val    int
	Weight float64
}

func WeightedSample(stream <-chan Elem, k int) []int {
	h := &minHeap{}
	heap.Init(h)
	for e := range stream {
		key := math.Pow(rand.Float64(), 1.0/e.Weight) // u^(1/w)
		if h.Len() < k {
			heap.Push(h, item{e.Val, key})
		} else if key > (*h)[0].key { // 比当前最小的还大 → 替换堆顶
			(*h)[0] = item{e.Val, key}
			heap.Fix(h, 0)
		}
	}
	res := make([]int, 0, k)
	for _, it := range *h {
		res = append(res, it.val)
	}
	return res
}
```

::: warning
A-Res 每元素是 O(log k)（堆操作）而非基础版的 O(1)，因为要维护"最大 k 个 key"。它保证"元素被选中的概率正比于权重"，但注意这是 **Efraimidis-Spirakis 定义的加权无放回**抽样语义；若要严格按权重成比例或流特别长，可用 A-ExpJ（指数跳跃）变体进一步优化。
:::

## 实战：监控存储层——降采样且"保异常"

蓄水池最典型的落地是监控/日志的**存储瘦身**：指标点全量落库既贵又无必要——绝大多数点是"正常无聊"的。直接用 **Algorithm R** 对每个指标流做等概率 1% 降采样，就能在**总量未知、内存只够 k 个**的前提下拿到一份代表性样本。

但等概率有个致命问题：**异常点是稀有的高价值样本，会被一并稀释掉**。解法是把上文的 **A-Res 加权蓄水池**直接复用，权重取"**当前点对基线的偏离度**"——偏离越大（越像异常），`key = u^(1/w)` 期望越大，越容易留在池里。这就实现了**分层采样**：正常点狠狠稀释、异常点重点保留。

```go
package predict

import "math"

// devWeight 用基线（均值 mean、方差 varc）把"偏离度"折算成 A-Res 的权重 w。
// 正常点 w≈1（正常稀释），偏离 3σ 的点 w 明显放大（优先留存）。
func devWeight(x, mean, varc float64) float64 {
	sigma := math.Sqrt(varc)
	if sigma == 0 {
		return 1
	}
	z := math.Abs(x-mean) / sigma
	return 1 + z*z // 偏离度平方放大：3σ 点权重≈10，均值点权重≈1
}
```

把 `devWeight` 的返回值喂给上文 `WeightedSample` 的 `Elem.Weight`，就得到一个**"降采样 + 自动保异常"**的存储层。此外常配合**时间分桶蓄水池**（每个 1min 窗口各维护一个池），保证样本在时间轴上均匀覆盖，而不是全挤在流量高峰。

> 蓄水池只负责监控流水线里的"**存什么**"。基线偏离度（`mean`/`varc`）从哪来、突发怎么抓、趋势怎么预判——EWMA / ARIMA / 滑动窗口的**多时间尺度检测**详见 [时序异常检测](../common/time-series-anomaly-detection.md)，本篇不再展开。

## 为什么这么做

- **为什么不能"先收集再随机"**：流式数据**总量未知**——你不知道何时结束，无法先算出 n 再选；且**内存放不下**——全量可能远超单机内存。蓄水池用 O(k) 内存、单遍就完成，且不需要知道 n。
- **为什么用 k/i 概率**：这是让"每个元素最终 k/n"成立的唯一正确概率（见上面裂项证明）。直觉上，越靠后的元素越少见到它替换的机会（i 越大 k/i 越小），恰好补偿了它"入池晚"，最终打平。
- **为什么加权用 `u^(1/w)`**：这个 key 变换让"权重大的元素 key 大概率更大"，等价于按权重做无放回抽样，且同样能**单遍流式**完成，只需把"随机替换"换成"堆维护最大 k 个"。
- **在自研网格里的价值**：从上万成员里选固定 k 个建连/广播时，成员在流式变化，蓄水池让每个节点用极小内存就得到一份**均匀（或按权重）代表性子集**，无需拷贝全量列表排序。

## 为什么别的选择不行

- **先收集全部再 `rand.Perm` 选 k 个**：需要 O(n) 内存和已知 n，流式/大数据场景直接爆内存或根本拿不到 n。
- **每来一个元素独立以 p 概率保留（伯努利采样）**：样本量不固定（可能远多于或少于 k），且总量未知时无法定出合适的 p 使期望正好 k。蓄水池保证**恰好 k 个**。
- **只保留最近 k 个（滑动窗口）**：会偏向流的尾部，早期元素留存概率为 0，不是等概率抽样。
- **对加权场景仍用基础 Algorithm R**：忽略权重，权重大的元素不会被更多地选中，业务语义错误。加权必须上 A-Res / A-ExpJ。
- **监控里只用等概率蓄水池瘦身**：会把稀有异常点一并稀释掉——异常恰恰是最该留的。必须用 A-Res 以"偏离度"为权重做保异常分层采样。

## 沉淀结论

- 蓄水池抽样 = **未知总量 + 单遍 + O(k) 内存**下的等概率 k-抽样，核心一行：第 i 个以 k/i 概率替换池中随机一个。
- 正确性靠**裂项连乘**证明：任意元素最终留存概率恰为 k/n。
- 加权用 **A-Res**：`key = u^(1/w)`，最小堆保留最大 k 个，每元素 O(log k)。
- 记住反例边界：**先收集再选**（要 O(n) 内存 + 已知 n）、**滑动窗口**（偏尾部）都不是等概率流式抽样。
- 落地到监控：蓄水池（A-Res 保异常）管"**存什么**"；"平时多少 / 现在炸没炸 / 接下来往哪走"由 [时序异常检测](../common/time-series-anomaly-detection.md) 的 EWMA/ARIMA/滑动窗口负责，两者配合。
- 一句话选型：**总量未知、只能扫一遍、内存只够 k 个时，用蓄水池；要按权重（或保异常）就换 A-Res。**

### 记忆口诀

**基础**：k/i 替换 / O(1) 每元素 / O(k) 内存 / 单遍
**正确性**：裂项连乘 / 任意元素 k/n
**加权 A-Res**：key = u^(1/w) / 最小堆保最大 k 个 / O(log k)
**落地监控**：A-Res 保异常管"存什么" / 检测尺度见时序异常检测

## 内容来源

综合整理。参考资料：Knuth《The Art of Computer Programming》Vol.2 §3.4.2（Algorithm R）、Vitter "Random Sampling with a Reservoir"（ACM TOMS 1985）、Efraimidis & Spirakis "Weighted Random Sampling with a Reservoir"（Information Processing Letters 2006，即 A-Res / A-ExpJ），以及日志采样、分布式 Trace 采样与监控降采样的工程实践。EWMA/ARIMA/滑动窗口等时序检测手段已拆分至 [时序异常检测](../common/time-series-anomaly-detection.md)。

## 自测：合上资料能说清楚吗？

1. 为什么第 i 个元素要用 k/i 而不是别的概率替换？换成固定概率会怎样？

<details><summary>参考答案</summary>

**k/i** 是让每个元素最终留存概率都等于 **k/n** 的唯一正确值。靠**裂项连乘**：入选概率 k/m 乘上后续每步不被替换概率的连乘 m/n，抵消得 k/n。用固定概率会破坏这个平衡——靠后元素替换机会没随 i 缩小，早期元素被过度稀释，不再等概率。

</details>

2. 请证明任意元素在流结束时的留存概率恰为 k/n。

<details><summary>参考答案</summary>

第 m 个（m>k）元素留存 = **入选**(k/m) 且**之后每步不被替换**。第 t 步被替换概率 = (k/t)·(1/k) = 1/t，不被替换 = (t-1)/t。连乘 t=m+1..n 得 **m/n**（裂项抵消），再乘 k/m 得 **k/n**。前 k 个初始必在池中(概率1)同理得 k/n。∎

</details>

3. 基础 Algorithm R 和加权 A-Res 有什么区别？各自复杂度和适用场景？

<details><summary>参考答案</summary>

**Algorithm R** 等权，每元素 **O(1)**（一次 rand + 至多一次赋值），保证等概率。**A-Res** 按权重，给每元素算 **key = u^(1/w)**，用最小堆保留最大 k 个，每元素 **O(log k)**，选中概率正比于权重。等概率场景用 R，需按权重（如监控里以偏离度为权"保异常"）用 A-Res。

</details>

4. 监控降采样若只用等概率蓄水池会有什么问题？怎么解决？

<details><summary>参考答案</summary>

等概率会把**稀有的异常点一并稀释掉**——而异常恰恰是最该留存的高价值样本。解法：用 **A-Res**，权重取"**对基线的偏离度**"（如 `1+z²`，z 为偏离的 σ 数），偏离越大越容易留在池里，实现"正常点狠稀释、异常点重点保留"的**分层采样**。基线本身由 [时序异常检测](../common/time-series-anomaly-detection.md) 的 EWMA 提供。

</details>

5. 为什么不能"先收集全部再随机选 k 个"，也不能用伯努利采样（每个以 p 概率留）？

<details><summary>参考答案</summary>

**先收集再选**：需 **O(n) 内存 + 已知 n**，流式数据总量未知且可能 TB 级，爆内存或拿不到 n。**伯努利采样**：样本量不固定（可能远多于/少于 k），且总量未知时无法定出使期望恰为 k 的 p。蓄水池保证**恰好 k 个** + **单遍 O(k) 内存**。

</details>

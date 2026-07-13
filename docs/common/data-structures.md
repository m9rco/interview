# 常见数据结构

> 覆盖后台面试高频考点：链表、栈与队列、树族（BST/AVL/红黑树）、堆、前缀树（Trie）、跳表、布隆过滤器、哈希表。每种结构：原理 → 复杂度 → 典型应用 → 代码示例（Go）。

---

## 1. 链表（Linked List）

### 原理

节点持有数据 + 指向下一节点的指针，内存不连续。

| 变种 | 特点 |
|------|------|
| 单向链表 | `next` 指针，只能向后遍历 |
| 双向链表 | `prev + next`，可双向遍历，LRU Cache 常用 |
| 循环链表 | 尾节点 `next` 指向头节点，约瑟夫问题 |

### 复杂度

| 操作 | 时间 | 空间 |
|------|------|------|
| 头插/尾插（已知指针） | O(1) | O(1) |
| 查找 | O(n) | — |
| 删除（已知指针） | O(1) | — |
| 按索引访问 | O(n) | — |

### 典型应用

- LRU Cache（双向链表 + HashMap）
- 内核内存管理（Linux `list_head`）
- 消息队列节点链接

### 代码示例

```go
type Node struct {
    Val  int
    Next *Node
}

// 反转链表（迭代）
func reverseList(head *Node) *Node {
    var prev *Node
    cur := head
    for cur != nil {
        next := cur.Next
        cur.Next = prev
        prev = cur
        cur = next
    }
    return prev
}

// LRU Cache 核心结构（双向链表 + map）
type LRUCache struct {
    cap        int
    cache      map[int]*DNode
    head, tail *DNode
}
type DNode struct {
    key, val   int
    prev, next *DNode
}
```

---

## 2. 栈（Stack）与队列（Queue）

### 原理

| 结构 | 特性 | 底层实现 |
|------|------|----------|
| 栈 | LIFO（后进先出） | 数组 or 链表 |
| 队列 | FIFO（先进先出） | 数组（环形）or 链表 |
| 双端队列（Deque） | 两端均可进出 | 双向链表 or 动态数组 |
| 优先队列 | 按优先级出队 | 堆 |

### 复杂度

均为 O(1) push/pop/peek（无须扩容时）。

### 典型应用

- 栈：函数调用栈、括号匹配、表达式求值、DFS 迭代
- 队列：BFS 层序遍历、生产者-消费者、滑动窗口最大值（单调队列）
- 单调栈：Next Greater Element，接雨水

### 代码示例

```go
// 单调递减栈：求每个元素右侧第一个更大元素
func nextGreater(nums []int) []int {
    n := len(nums)
    res := make([]int, n)
    stack := []int{}  // 存索引
    for i := 0; i < n; i++ {
        for len(stack) > 0 && nums[stack[len(stack)-1]] < nums[i] {
            idx := stack[len(stack)-1]
            stack = stack[:len(stack)-1]
            res[idx] = nums[i]
        }
        stack = append(stack, i)
    }
    return res
}
```

---

## 3. 二叉搜索树（BST）

### 原理

- 左子树所有节点 < 根 < 右子树所有节点
- 中序遍历输出有序序列

### 复杂度

| 操作 | 平均 | 最坏（退化为链表） |
|------|------|--------------------|
| 查找/插入/删除 | O(log n) | O(n) |

### 典型应用

- 有序字典基础（TreeMap）
- 数据库 B-Tree 索引前身

### 代码示例

```go
type TreeNode struct {
    Val         int
    Left, Right *TreeNode
}

func insert(root *TreeNode, val int) *TreeNode {
    if root == nil {
        return &TreeNode{Val: val}
    }
    if val < root.Val {
        root.Left = insert(root.Left, val)
    } else {
        root.Right = insert(root.Right, val)
    }
    return root
}

// 中序遍历（迭代）
func inorder(root *TreeNode) []int {
    var res []int
    stack := []*TreeNode{}
    cur := root
    for cur != nil || len(stack) > 0 {
        for cur != nil {
            stack = append(stack, cur)
            cur = cur.Left
        }
        cur = stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        res = append(res, cur.Val)
        cur = cur.Right
    }
    return res
}
```

---

## 4. AVL 树 & 红黑树

### AVL 树

**原理**：每个节点的左右子树高度差（平衡因子）≤ 1，通过旋转（左旋/右旋/左右旋/右左旋）维护平衡。

| 操作 | 复杂度 |
|------|--------|
| 查找/插入/删除 | O(log n) |
| 旋转次数（插入） | ≤ 2 |
| 旋转次数（删除） | O(log n) |

**适用**：读多写少（旋转少），如数据库内存索引。

### 红黑树

**原理**：节点染红/黑，满足五条红黑性质（根黑、叶黑、红节点子必黑、任意路径黑高相等）。比 AVL 放松平衡要求，旋转更少。

| 操作 | 复杂度 |
|------|--------|
| 查找/插入/删除 | O(log n) |
| 旋转次数（插入） | ≤ 3 |
| 旋转次数（删除） | ≤ 3 |

**适用**：写频繁（Linux CFS 调度器、Java TreeMap、C++ std::map）。

### 对比

| | AVL | 红黑树 |
|--|-----|--------|
| 平衡严格度 | 严格（高度差 ≤ 1） | 宽松（黑高相等） |
| 查找性能 | 略优 | 略差（但同阶） |
| 插入/删除旋转 | 多 | 少 |
| 选择场景 | 读密集 | 写密集 |

---

## 5. 堆（Heap）

### 原理

完全二叉树用数组存储，满足堆性质：
- **最大堆**：父节点 ≥ 子节点
- **最小堆**：父节点 ≤ 子节点

数组索引关系：`parent(i) = (i-1)/2`，`left(i) = 2i+1`，`right(i) = 2i+2`

### 复杂度

| 操作 | 复杂度 |
|------|--------|
| 插入（sift up） | O(log n) |
| 删除堆顶（sift down） | O(log n) |
| 建堆（heapify） | O(n) |
| 查堆顶 | O(1) |

### 典型应用

- Top K 问题（维护 size=K 的最小堆）
- 堆排序
- Dijkstra 最短路（最小优先队列）
- 任务调度（优先队列）

### 代码示例

```go
import "container/heap"

// Top K 最大元素：用最小堆维护 k 个
type MinHeap []int
func (h MinHeap) Len() int           { return len(h) }
func (h MinHeap) Less(i, j int) bool { return h[i] < h[j] }
func (h MinHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *MinHeap) Push(x any)        { *h = append(*h, x.(int)) }
func (h *MinHeap) Pop() any {
    old := *h; n := len(old)
    x := old[n-1]; *h = old[:n-1]; return x
}

func topK(nums []int, k int) []int {
    h := &MinHeap{}
    heap.Init(h)
    for _, v := range nums {
        heap.Push(h, v)
        if h.Len() > k {
            heap.Pop(h)
        }
    }
    return []int(*h)
}
```

---

## 6. 前缀树（Trie）

### 原理

多叉树，每条边代表一个字符，根到某节点的路径拼出一个前缀/单词。每个节点包含：
- `children [26]*TrieNode`（或 `map[rune]*TrieNode`）
- `isEnd bool`

### 复杂度

| 操作 | 复杂度 |
|------|--------|
| 插入 | O(m)，m = 词长 |
| 查找 | O(m) |
| 前缀匹配 | O(m + 结果数) |
| 空间 | O(ALPHABET × n × m) |

### 典型应用

- 搜索引擎自动补全
- 路由表最长前缀匹配（IP 路由）
- 敏感词过滤（AC 自动机基于 Trie）
- 拼写检查

### 代码示例

```go
type TrieNode struct {
    children [26]*TrieNode
    isEnd    bool
}

type Trie struct{ root *TrieNode }

func NewTrie() *Trie { return &Trie{root: &TrieNode{}} }

func (t *Trie) Insert(word string) {
    cur := t.root
    for _, ch := range word {
        idx := ch - 'a'
        if cur.children[idx] == nil {
            cur.children[idx] = &TrieNode{}
        }
        cur = cur.children[idx]
    }
    cur.isEnd = true
}

func (t *Trie) Search(word string) bool {
    cur := t.root
    for _, ch := range word {
        idx := ch - 'a'
        if cur.children[idx] == nil { return false }
        cur = cur.children[idx]
    }
    return cur.isEnd
}

func (t *Trie) StartsWith(prefix string) bool {
    cur := t.root
    for _, ch := range prefix {
        idx := ch - 'a'
        if cur.children[idx] == nil { return false }
        cur = cur.children[idx]
    }
    return true
}
```

---

## 7. 跳表（Skip List）

### 原理

在有序链表基础上，建立多层索引。每层是下层节点的随机子集（概率 p=0.5），形成"快速通道"。

```
层 3：   1 ────────────────── 9
层 2：   1 ──── 4 ────────── 9
层 1：   1 ── 3 ── 4 ── 7 ── 9
层 0：   1 - 2 - 3 - 4 - 5 - 7 - 8 - 9  ← 原始链表
```

### 复杂度

| 操作 | 平均 | 最坏 |
|------|------|------|
| 查找/插入/删除 | O(log n) | O(n) |
| 空间 | O(n) 期望 | O(n log n) |

### 典型应用

- **Redis ZSet（有序集合）**：skiplist + hashtable 组合
- LevelDB / RocksDB MemTable
- 替代平衡树：实现更简单，锁粒度更细（并发友好）

### 代码示例（简化版）

```go
const maxLevel = 16
const p = 0.5

type SkipNode struct {
    val     int
    forward [maxLevel]*SkipNode
}

type SkipList struct {
    head  *SkipNode
    level int
}

func randomLevel() int {
    lv := 1
    for lv < maxLevel && rand.Float64() < p {
        lv++
    }
    return lv
}

func (sl *SkipList) Search(val int) bool {
    cur := sl.head
    for i := sl.level - 1; i >= 0; i-- {
        for cur.forward[i] != nil && cur.forward[i].val < val {
            cur = cur.forward[i]
        }
    }
    cur = cur.forward[0]
    return cur != nil && cur.val == val
}
```

---

## 8. 布隆过滤器（Bloom Filter）

### 原理

用 **k 个哈希函数** 将元素映射到长度为 **m** 的 bit 数组的 k 个位置，全置 1 表示"可能存在"，有任一位为 0 则"一定不存在"。

**核心特性**：
- **假阳性（False Positive）**：可能误判存在 → 可接受
- **假阴性（False Negative）**：绝不漏判不存在 → 不会漏

假阳率 `p ≈ (1 - e^(-kn/m))^k`，n = 元素数。

### 复杂度

| 操作 | 复杂度 |
|------|--------|
| 插入 | O(k) |
| 查询 | O(k) |
| 空间 | O(m) bits ≈ n × 10 bits（p≈1%） |

### 典型应用

- 缓存穿透防护（Redis 布隆过滤器）
- 爬虫 URL 去重（数十亿 URL）
- 数据库查询加速（BigTable / Cassandra）
- 黑名单过滤（恶意 IP）

### 代码示例

```go
import (
    "github.com/bits-and-blooms/bloom/v3"
)

// 预期 1M 元素，假阳率 0.1%
filter := bloom.NewWithEstimates(1_000_000, 0.001)

filter.AddString("hello")
filter.AddString("world")

fmt.Println(filter.TestString("hello"))  // true（一定存在）
fmt.Println(filter.TestString("go"))     // false（一定不存在）
fmt.Println(filter.TestString("ello"))   // false 或 true（误判）
```

**自实现（教学版）**：

```go
type BloomFilter struct {
    bits    []bool
    hashFns []func(string) int
}

func (bf *BloomFilter) Add(s string) {
    for _, fn := range bf.hashFns {
        bf.bits[fn(s)%len(bf.bits)] = true
    }
}

func (bf *BloomFilter) Test(s string) bool {
    for _, fn := range bf.hashFns {
        if !bf.bits[fn(s)%len(bf.bits)] { return false }
    }
    return true
}
```

---

## 9. 哈希表（Hash Table）

### 原理

通过哈希函数将 key 映射到数组索引，O(1) 平均时间存取。冲突解决：
- **链地址法（Chaining）**：冲突桶挂链表（Go map 采用）
- **开放寻址法（Open Addressing）**：线性探测 / 二次探测 / 双重哈希

**负载因子** `λ = n/m`（n=元素数，m=桶数），Go map 默认阈值 6.5，超过触发扩容（2 倍）。

### 复杂度

| 操作 | 平均 | 最坏（全冲突） |
|------|------|----------------|
| 插入/查找/删除 | O(1) | O(n) |
| 扩容（rehash） | — | O(n) 摊还 |

### 典型应用

- 缓存（memcached key-value）
- 数据库 Hash Join
- 计数器（词频统计）
- 两数之和、字母异位词

### Go map 注意事项

```go
// 1. 并发读写 → sync.Map 或 RWMutex
var mu sync.RWMutex
mu.RLock(); v := m[k]; mu.RUnlock()

// 2. 遍历顺序随机（有意随机化，防止依赖顺序）
for k, v := range m { ... }  // 顺序不保证

// 3. nil map 可读不可写
var m map[string]int
m["k"] = 1  // panic: assignment to entry in nil map
m = make(map[string]int)  // 初始化

// 4. 预分配减少 rehash
m := make(map[string]int, expectedSize)
```

---

## 复杂度速查表

| 结构 | 查找 | 插入 | 删除 | 备注 |
|------|------|------|------|------|
| 数组 | O(n) | O(n) | O(n) | 索引访问 O(1) |
| 链表 | O(n) | O(1) | O(1)* | *已知指针 |
| 哈希表 | O(1) | O(1) | O(1) | 最坏 O(n) |
| BST | O(log n) | O(log n) | O(log n) | 最坏 O(n) |
| AVL/红黑树 | O(log n) | O(log n) | O(log n) | 严格保证 |
| 堆 | O(n)* | O(log n) | O(log n) | *堆顶 O(1) |
| 前缀树 | O(m) | O(m) | O(m) | m=词长 |
| 跳表 | O(log n) | O(log n) | O(log n) | 期望值 |
| 布隆过滤器 | O(k) | O(k) | ❌不支持 | k=哈希数 |

---

## 选型指南

```
需要精确存在性判断 + 极低内存？    → 布隆过滤器
需要有序 + 范围查询？               → 红黑树 / 跳表
需要前缀匹配 / 自动补全？           → Trie
需要频繁 Top K / 优先调度？         → 堆
需要 O(1) 存取 + 无序？             → 哈希表
需要有序 + 写多读少？               → 红黑树（B-Tree 磁盘场景）
需要有序 + 读多写少？               → AVL 树
```

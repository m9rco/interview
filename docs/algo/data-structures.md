# 常见数据结构

> 覆盖后台面试高频考点：链表、栈与队列、树族（BST/AVL/红黑树）、堆、前缀树（Trie）、跳表、布隆过滤器、哈希表。每种结构：原理 → 复杂度 → 典型应用 → 代码示例（C++）。

::: tip 🧠 一句话记忆锚点
**数据结构选型看两问：要不要"有序 + 范围查询"、要不要"O(1) 存取"。O(1) 无序→哈希表；有序+范围→红黑树/跳表；前缀匹配→Trie；Top-K/优先级→堆；海量存在性判断+省内存→布隆过滤器。所有"平衡树/堆/跳表"的 O(log n) 本质都是"每步砍掉一半或一层"。**
:::

---

## 场景问题

[待补充]

## 实现方案

[待补充]

## 为什么这么做

[待补充]

## 为什么别的选择不行

[待补充]

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

```cpp
#include <iostream>
#include <unordered_map>

struct Node {
    int val;
    Node* next;
    Node(int v) : val(v), next(nullptr) {}
};

// 反转链表（迭代）
Node* reverseList(Node* head) {
    Node* prev = nullptr;
    Node* cur = head;
    while (cur != nullptr) {
        Node* next = cur->next;
        cur->next = prev;
        prev = cur;
        cur = next;
    }
    return prev;
}

// LRU Cache（双向链表 + unordered_map，get/put 均 O(1)）
struct DNode {
    int key, val;
    DNode* prev;
    DNode* next;
    DNode(int k, int v) : key(k), val(v), prev(nullptr), next(nullptr) {}
};

struct LRUCache {
    int cap;
    std::unordered_map<int, DNode*> cache;
    DNode* head;  // dummy head
    DNode* tail;  // dummy tail

    LRUCache(int capacity) : cap(capacity) {
        head = new DNode(0, 0);
        tail = new DNode(0, 0);
        head->next = tail;
        tail->prev = head;
    }
    void remove(DNode* n) { n->prev->next = n->next; n->next->prev = n->prev; }
    void addFront(DNode* n) { n->next = head->next; n->prev = head; head->next->prev = n; head->next = n; }
    int get(int key) {
        if (!cache.count(key)) return -1;
        DNode* n = cache[key]; remove(n); addFront(n); return n->val;    // 命中：移到头部
    }
    void put(int key, int val) {
        if (cache.count(key)) { DNode* n = cache[key]; n->val = val; remove(n); addFront(n); return; }
        if ((int)cache.size() == cap) {                                 // 超容：淘汰尾部
            DNode* lru = tail->prev; remove(lru); cache.erase(lru->key); delete lru;
        }
        DNode* n = new DNode(key, val); addFront(n); cache[key] = n;
    }
};

int main() {
    // 反转链表：1->2->3 变 3->2->1
    Node* head = new Node(1);
    head->next = new Node(2);
    head->next->next = new Node(3);
    head = reverseList(head);
    std::cout << "反转后: ";
    for (Node* p = head; p; p = p->next) std::cout << p->val << (p->next ? "->" : "\n");

    // LRU（容量 2）
    LRUCache lru(2);
    lru.put(1, 10);
    lru.put(2, 20);
    std::cout << "get(1) = " << lru.get(1) << "\n";   // 10（1 变为最近使用）
    lru.put(3, 30);                                    // 容量满 → 淘汰最久未用的 key 2
    std::cout << "get(2) = " << lru.get(2) << "\n";   // -1（已淘汰）
    return 0;
}
```

> 编译运行：`g++ -std=c++11 demo.cpp && ./a.out` → 输出 `反转后: 3->2->1` / `get(1) = 10` / `get(2) = -1`。

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

```cpp
#include <iostream>
#include <vector>
#include <stack>

// 单调递减栈：求每个元素右侧第一个更大元素
std::vector<int> nextGreater(const std::vector<int>& nums) {
    int n = nums.size();
    std::vector<int> res(n, 0);
    std::stack<int> stk;  // 存索引
    for (int i = 0; i < n; i++) {
        while (!stk.empty() && nums[stk.top()] < nums[i]) {
            int idx = stk.top();
            stk.pop();
            res[idx] = nums[i];
        }
        stk.push(i);
    }
    return res;
}

int main() {
    std::vector<int> nums = {2, 1, 2, 4, 3};
    auto res = nextGreater(nums);
    std::cout << "下一个更大元素: ";
    for (int x : res) std::cout << x << " ";   // 4 2 4 0 0（0 表示右侧无更大）
    std::cout << "\n";
    return 0;
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

```cpp
#include <iostream>
#include <vector>
#include <stack>

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

TreeNode* insert(TreeNode* root, int val) {
    if (root == nullptr) return new TreeNode(val);
    if (val < root->val)
        root->left = insert(root->left, val);
    else
        root->right = insert(root->right, val);
    return root;
}

// 中序遍历（迭代）
std::vector<int> inorder(TreeNode* root) {
    std::vector<int> res;
    std::stack<TreeNode*> stk;
    TreeNode* cur = root;
    while (cur != nullptr || !stk.empty()) {
        while (cur != nullptr) {
            stk.push(cur);
            cur = cur->left;
        }
        cur = stk.top();
        stk.pop();
        res.push_back(cur->val);
        cur = cur->right;
    }
    return res;
}

int main() {
    TreeNode* root = nullptr;
    for (int x : {5, 3, 7, 2, 4, 6, 8}) root = insert(root, x);
    auto io = inorder(root);
    std::cout << "BST 中序(有序): ";
    for (int x : io) std::cout << x << " ";   // 2 3 4 5 6 7 8
    std::cout << "\n";
    return 0;
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

**删除堆顶（sift-down）动画**：把末尾元素挪到堆顶后，它比孩子小（最大堆），于是**与较大的孩子交换、一路下沉**，直到满足堆性质。红色高亮就是正在下沉的"违规节点"：

<svg viewBox="0 0 520 240" width="100%" style="max-width:520px;height:auto" role="img" aria-label="堆 sift-down：堆顶元素与较大孩子交换、逐层下沉">
  <g stroke="#475569" stroke-width="1.5">
    <line x1="260" y1="50" x2="150" y2="120"/><line x1="260" y1="50" x2="370" y2="120"/>
    <line x1="150" y1="120" x2="90" y2="190"/><line x1="150" y1="120" x2="210" y2="190"/>
    <line x1="370" y1="120" x2="310" y2="190"/><line x1="370" y1="120" x2="430" y2="190"/>
  </g>
  <g font-size="14" fill="#fff" text-anchor="middle">
    <circle cx="260" cy="50"  r="20" fill="#334155"/><text x="260" y="55">3</text>
    <circle cx="150" cy="120" r="20" fill="#334155"/><text x="150" y="125">9</text>
    <circle cx="370" cy="120" r="20" fill="#334155"/><text x="370" y="125">7</text>
    <circle cx="90"  cy="190" r="20" fill="#334155"/><text x="90"  y="195">4</text>
    <circle cx="210" cy="190" r="20" fill="#334155"/><text x="210" y="195">8</text>
    <circle cx="310" cy="190" r="20" fill="#334155"/><text x="310" y="195">1</text>
    <circle cx="430" cy="190" r="20" fill="#334155"/><text x="430" y="195">6</text>
  </g>
  <circle r="22" fill="none" stroke="#dc2626" stroke-width="3">
    <animateMotion path="M260 50 L 150 120 L 210 190" dur="4s" repeatCount="indefinite" keyPoints="0;0;0.5;0.5;1;1" keyTimes="0;0.2;0.45;0.65;0.9;1" calcMode="linear"/>
  </circle>
  <text x="20" y="228" font-size="11" fill="currentColor">3 &lt; max(9,7)=9 → 换到左；3 &lt; max(4,8)=8 → 再换；到叶子停。每层 O(1) 比较，共 O(log n)。</text>
</svg>

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

```cpp
#include <iostream>
#include <vector>
#include <queue>

// Top K 最大元素：用最小堆（priority_queue 默认最大堆，greater<int> 变最小堆）维护 k 个
std::vector<int> topK(const std::vector<int>& nums, int k) {
    // min-heap: 堆顶是最小元素
    std::priority_queue<int, std::vector<int>, std::greater<int>> minHeap;
    for (int v : nums) {
        minHeap.push(v);
        if ((int)minHeap.size() > k) {
            minHeap.pop();  // 弹出最小的，保留最大的 k 个
        }
    }
    std::vector<int> res;
    while (!minHeap.empty()) {
        res.push_back(minHeap.top());
        minHeap.pop();
    }
    return res;  // 返回 Top K 最大元素（升序）
}

int main() {
    std::vector<int> nums = {3, 1, 5, 12, 2, 11};
    auto res = topK(nums, 3);
    std::cout << "Top-3 最大: ";
    for (int x : res) std::cout << x << " ";   // 5 11 12（升序）
    std::cout << "\n";
    return 0;
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

```cpp
#include <iostream>
#include <string>
#include <array>

struct TrieNode {
    std::array<TrieNode*, 26> children{};
    bool isEnd = false;
    TrieNode() { children.fill(nullptr); }
};

struct Trie {
    TrieNode* root;
    Trie() : root(new TrieNode()) {}

    void insert(const std::string& word) {
        TrieNode* cur = root;
        for (char ch : word) {
            int idx = ch - 'a';
            if (cur->children[idx] == nullptr)
                cur->children[idx] = new TrieNode();
            cur = cur->children[idx];
        }
        cur->isEnd = true;
    }

    bool search(const std::string& word) {
        TrieNode* cur = root;
        for (char ch : word) {
            int idx = ch - 'a';
            if (cur->children[idx] == nullptr) return false;
            cur = cur->children[idx];
        }
        return cur->isEnd;
    }

    bool startsWith(const std::string& prefix) {
        TrieNode* cur = root;
        for (char ch : prefix) {
            int idx = ch - 'a';
            if (cur->children[idx] == nullptr) return false;
            cur = cur->children[idx];
        }
        return true;
    }
};

int main() {
    Trie t;
    t.insert("apple");
    std::cout << std::boolalpha
              << "search(apple)   = " << t.search("apple")      << "\n"   // true
              << "search(app)     = " << t.search("app")        << "\n"   // false（不是完整单词）
              << "startsWith(app) = " << t.startsWith("app")    << "\n";  // true（是前缀）
    return 0;
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

**查找 7 的动画**：从最高层最左开始，"**能右则右（下一个 &lt; 目标）、否则下沉一层**"，像下楼梯一样跳过大段节点——期望 O(log n)：

<svg viewBox="0 0 560 210" width="100%" style="max-width:560px;height:auto" role="img" aria-label="跳表查找 7：逐层向右，遇到更大值则下沉一层">
  <g font-size="11" fill="#94a3b8"><text x="6" y="44">L3</text><text x="6" y="84">L2</text><text x="6" y="124">L1</text><text x="6" y="164">L0</text></g>
  <!-- level links -->
  <g stroke="#475569" stroke-width="1.5">
    <line x1="60" y1="40" x2="520" y2="40"/>
    <line x1="60" y1="80" x2="520" y2="80"/>
    <line x1="60" y1="120" x2="520" y2="120"/>
    <line x1="60" y1="160" x2="520" y2="160"/>
  </g>
  <!-- nodes -->
  <g font-size="11" fill="#fff" text-anchor="middle">
    <circle cx="60" cy="40" r="12" fill="#334155"/><text x="60" y="44">1</text><circle cx="520" cy="40" r="12" fill="#334155"/><text x="520" y="44">9</text>
    <circle cx="60" cy="80" r="12" fill="#334155"/><text x="60" y="84">1</text><circle cx="240" cy="80" r="12" fill="#334155"/><text x="240" y="84">4</text><circle cx="520" cy="80" r="12" fill="#334155"/><text x="520" y="84">9</text>
    <circle cx="60" cy="120" r="12" fill="#334155"/><text x="60" y="124">1</text><circle cx="180" cy="120" r="12" fill="#334155"/><text x="180" y="124">3</text><circle cx="240" cy="120" r="12" fill="#334155"/><text x="240" y="124">4</text><circle cx="400" cy="120" r="12" fill="#16a34a"/><text x="400" y="124">7</text><circle cx="520" cy="120" r="12" fill="#334155"/><text x="520" y="124">9</text>
    <circle cx="60" cy="160" r="12" fill="#334155"/><text x="60" y="164">1</text><circle cx="120" cy="160" r="12" fill="#334155"/><text x="120" y="164">2</text><circle cx="180" cy="160" r="12" fill="#334155"/><text x="180" y="164">3</text><circle cx="240" cy="160" r="12" fill="#334155"/><text x="240" y="164">4</text><circle cx="300" cy="160" r="12" fill="#334155"/><text x="300" y="164">5</text><circle cx="400" cy="160" r="12" fill="#334155"/><text x="400" y="164">7</text><circle cx="460" cy="160" r="12" fill="#334155"/><text x="460" y="164">8</text><circle cx="520" cy="160" r="12" fill="#334155"/><text x="520" y="164">9</text>
  </g>
  <!-- search pointer: (1,L3)->down->(4,L2)->down->(7,L1) -->
  <circle r="15" fill="none" stroke="#f59e0b" stroke-width="3">
    <animateMotion path="M60 40 L 60 80 L 240 80 L 240 120 L 400 120" dur="5s" repeatCount="indefinite" keyPoints="0;0.15;0.15;0.5;0.5;0.65;0.65;1;1" keyTimes="0;0.15;0.25;0.45;0.55;0.7;0.8;0.95;1" calcMode="linear"/>
  </circle>
  <text x="20" y="198" font-size="11" fill="currentColor">L3:1→9太大，下沉；L2:1→4→9太大，下沉；L1:4→7 命中。高层"快速通道"跳过大段节点。</text>
</svg>

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

```cpp
#include <iostream>
#include <array>
#include <climits>
#include <cstdlib>

constexpr int MAX_LEVEL = 16;
constexpr double P = 0.5;

struct SkipNode {
    int val;
    std::array<SkipNode*, MAX_LEVEL> forward{};
    SkipNode(int v) : val(v) { forward.fill(nullptr); }
};

struct SkipList {
    SkipNode* head;
    int level;

    SkipList() : level(1) {
        head = new SkipNode(INT_MIN);  // 哨兵节点
    }

    static int randomLevel() {
        int lv = 1;
        while (lv < MAX_LEVEL && (double)rand() / RAND_MAX < P)
            lv++;
        return lv;
    }

    void insert(int val) {
        std::array<SkipNode*, MAX_LEVEL> update{};      // 各层待更新的前驱
        SkipNode* cur = head;
        for (int i = level - 1; i >= 0; i--) {
            while (cur->forward[i] && cur->forward[i]->val < val) cur = cur->forward[i];
            update[i] = cur;
        }
        int lv = randomLevel();
        if (lv > level) { for (int i = level; i < lv; i++) update[i] = head; level = lv; }
        SkipNode* node = new SkipNode(val);
        for (int i = 0; i < lv; i++) {                   // 在每一层把新节点接进链表
            node->forward[i] = update[i]->forward[i];
            update[i]->forward[i] = node;
        }
    }

    bool search(int val) const {
        SkipNode* cur = head;
        for (int i = level - 1; i >= 0; i--) {
            while (cur->forward[i] != nullptr && cur->forward[i]->val < val)
                cur = cur->forward[i];
        }
        cur = cur->forward[0];
        return cur != nullptr && cur->val == val;
    }
};

int main() {
    srand(42);
    SkipList sl;
    for (int x : {1, 3, 4, 7, 9}) sl.insert(x);
    std::cout << std::boolalpha
              << "search(7) = " << sl.search(7) << "\n"   // true
              << "search(5) = " << sl.search(5) << "\n";  // false
    return 0;
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

// C++ 外部库：可使用 boost::bloom_filters（Boost.BloomFilter）或 Redis 内置布隆过滤器模块。
// 示例（伪代码，需引入 boost 库）：
// ```cpp
// #include <boost/bloom_filter/basic_bloom_filter.hpp>
// boost::bloom_filters::basic_bloom_filter<std::string, 1000000> filter;
// filter.insert("hello");
// bool exists = filter.probably_contains("hello");  // true（可能存在）
// ```

**自实现（教学版）**：

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <functional>

struct BloomFilter {
    std::vector<bool> bits;
    std::vector<std::function<size_t(const std::string&)>> hashFns;

    BloomFilter(int m, std::vector<std::function<size_t(const std::string&)>> fns)
        : bits(m, false), hashFns(std::move(fns)) {}

    void add(const std::string& s) {
        for (auto& fn : hashFns)
            bits[fn(s) % bits.size()] = true;
    }

    bool test(const std::string& s) const {
        for (auto& fn : hashFns) {
            if (!bits[fn(s) % bits.size()]) return false;   // 有一位为 0 → 一定不存在
        }
        return true;                                        // 全 1 → 可能存在
    }
};

int main() {
    // 两个不同的哈希函数（教学用；生产用不同 seed 的 murmur/xxhash）
    std::vector<std::function<size_t(const std::string&)>> fns = {
        [](const std::string& s) { return std::hash<std::string>{}(s); },
        [](const std::string& s) {                          // FNV-1a
            size_t h = 1469598103934665603ULL;
            for (char c : s) { h ^= (size_t)(unsigned char)c; h *= 1099511628211ULL; }
            return h;
        }
    };
    BloomFilter bf(1000, fns);
    bf.add("hello");
    std::cout << std::boolalpha
              << "test(hello) = " << bf.test("hello") << "\n"   // true（一定被加过）
              << "test(world) = " << bf.test("world") << "\n";  // 多半 false（一定不存在，除非碰撞）
    return 0;
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

### std::unordered_map 注意事项

```cpp
#include <iostream>
#include <unordered_map>
#include <string>

int main() {
    std::unordered_map<std::string, int> m;
    m.reserve(16);                 // 预分配桶，减少 rehash（4. 预分配减少 rehash）

    m["a"] = 1;
    m["b"] = 2;
    m["a"]++;                      // 已存在则更新

    // 查找：先判断存在再取值（operator[] 会插入默认值，只读用 find/count）
    auto it = m.find("a");
    if (it != m.end())
        std::cout << "a = " << it->second << "\n";     // a = 2
    std::cout << "count(c) = " << m.count("c") << "\n"; // 0（不存在）

    // 2. 遍历顺序不保证（哈希桶顺序，不同实现/rehash 后都可能变）
    for (auto& kv : m) std::cout << kv.first << ":" << kv.second << " ";
    std::cout << "\n";
    // 1. 并发：std::unordered_map 非线程安全，多线程需 std::shared_mutex
    //    （读 std::shared_lock、写 std::unique_lock）
    return 0;
}
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

## 面试高频题清单（按结构分类）

**链表**
- **Q：反转链表？** A：迭代三指针 `prev/cur/next`，逐个反向（见上）；递归版注意回溯时接 `head->next->next=head`。
- **Q：判断链表有环 / 找环入口？** A：快慢指针，相遇即有环；再让一指针回头，同速前进相遇点即入口（Floyd 判圈）。
- **Q：LRU Cache 手写？** A：`unordered_map<key, 双向链表节点*>` + 哨兵头尾，`get/put` 均 O(1)：命中移到头、超容删尾。

**栈 / 队列**
- **Q：有效括号 / 表达式求值？** A：栈匹配；表达式用两个栈（数字栈 + 运算符栈）或转逆波兰。
- **Q：单调栈解什么？** A：下一个更大元素、每日温度、柱状图最大矩形、接雨水——"找左/右第一个更大/更小"。

**树 / 堆**
- **Q：红黑树 vs AVL 怎么选？** A：AVL 严格平衡、查找略快、旋转多，读密集；红黑树弱平衡、插删旋转少，写密集（std::map、Linux CFS）。
- **Q：为什么 MySQL 用 B+ 树不用红黑树？** A：红黑树高瘦、一次比较一次磁盘 IO 太亏；B+ 树矮胖多路，一节点一页、叶子链表利于范围扫描。
- **Q：Top-K 用什么？** A：维护 size=K 的**最小堆**（求最大 K 个），O(N log K)；或快速选择期望 O(N)。

**跳表 / 哈希 / 布隆**
- **Q：Redis ZSet 为什么用跳表不用红黑树？** A：实现简单、范围查询天然（底层有序链表）、并发/锁粒度友好；配合 hashtable 做 O(1) 按成员查。
- **Q：哈希冲突怎么解决？扩容？** A：链地址法 / 开放寻址；负载因子超阈值 rehash（2 倍），渐进式 rehash 摊还避免卡顿。
- **Q：布隆过滤器为什么能防缓存穿透？会误判吗？** A：位数组 + k 哈希，"说没有一定没有"（无假阴），"说有可能没有"（有假阳）；DB 里不存在的 key 直接在布隆层拒掉。

## 选型指南（口诀）

- 无序 O(1) 存取 → 哈希表；有序 + 范围 → 红黑树 / 跳表
- 前缀匹配 → Trie；Top-K / 优先级 → 堆；海量去重/存在性 → 布隆过滤器
- 磁盘索引 → B+ 树；写多读少落盘 → LSM Tree（见 [后台高频算法](/algo/backend-algorithms.md)）

### 记忆口诀

- **选型两问**：O(1) 无序 / 有序+范围 / 前缀匹配 / Top-K 优先级 / 省内存存在性 → 哈希表 / 红黑树·跳表 / Trie / 堆 / 布隆
- **O(log n) 本质**：每步砍一半 / 平衡树旋转 / 跳表下楼梯 / 堆上浮下沉
- **红黑 vs AVL**：AVL 严格·查快·旋转多·读密集 / 红黑弱平衡·插删旋转少·写密集
- **布隆两性**：无假阴（说没有一定没有）/ 有假阳（说有可能有）/ 位数组 + k 哈希

## 沉淀结论

[待补充]

### 记忆口诀

[待补充]

## 自测：合上资料能说清楚吗？

1. **为什么平衡树、堆、跳表的核心操作都是 O(log n)？三者"砍一半"的方式有何不同？**
   <details><summary>参考答案</summary>

本质都是**每步排除掉一部分候选**。平衡树靠**高度受控**，一次比较砍掉一棵子树；堆靠**上浮/下沉**，每层一次比较逐层走；跳表靠**多层索引**，高层"快速通道"跳过大段节点，期望每层前进常数步。

</details>

2. **红黑树和 AVL 树都是 O(log n)，工程上如何取舍？各举一个真实用例。**
   <details><summary>参考答案</summary>

**AVL 严格平衡**（高度差 ≤1），查找略快但插删**旋转多**，适合**读密集**如内存索引；**红黑树弱平衡**，插删旋转 ≤3，适合**写频繁**，如 **std::map / Java TreeMap / Linux CFS 调度器**。

</details>

3. **Redis ZSet 为什么用跳表而不是红黑树？**
   <details><summary>参考答案</summary>

跳表**实现简单**、**范围查询天然**（底层就是有序链表）、**锁粒度细并发友好**；再配一个 **hashtable** 做 O(1) 按成员查分值。红黑树范围查询需中序遍历、并发改写更复杂。

</details>

4. **布隆过滤器为什么能防缓存穿透？它会误判吗？哪种误判绝不会发生？**
   <details><summary>参考答案</summary>

k 个哈希映射到位数组，DB 中不存在的 key 在布隆层**直接拒掉**，不打到 DB。存在**假阳性**（说有可能没有），但**绝无假阴性**（说没有就一定没有）——因为存过必然把对应位置 1。

</details>

5. **给定"海量 URL 去重"和"需要按分数范围查排行榜"两个需求，分别选什么结构，为什么？**
   <details><summary>参考答案</summary>

URL 去重选**布隆过滤器**：数十亿量级只需 ~n×10 bits，容忍极小假阳；排行榜选**跳表（+哈希）**：需**有序 + 范围查询 + 按成员定位**，正是 Redis ZSet 的组合。

</details>

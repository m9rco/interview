---
title: 算法与数据结构 · 面试高频
---

# 算法与数据结构 · 面试高频

一致性哈希 · Ring / Jump / Maglev · 树 / 布隆 / 跳表

## 场景问题

::: tip 为什么这些算法值得记
**分布式系统 = 一致性哈希 + 布隆过滤器 + 跳表 + LSM/B+ 树 + Merkle 树**——这几样占了后台面试算法题的一大半。挑最容易被追问的写出来，能秒杀"讲一下 Redis Cluster / Kafka / Cassandra 是怎么做的"这类连环问。
:::

## 实现方案

### 一致性哈希三种主流实现

| 算法 | 思路 | 内存 | 查找复杂度 | 扩缩容影响 | 适用 |
|---|---|---|---|---|---|
| **Ring Hash (Ketama)** | 把节点哈希到 [0, 2³²) 环上，每个节点放 N 个虚拟节点；请求哈希后顺时针找第一个节点 | O(N × V)（V=虚拟节点数，通常 100~200） | O(log(NV)) | **平均 1/N** 迁移 | Redis Cluster、Memcached、大部分场景 |
| **Jump Consistent Hash** | Google 论文，纯计算：`ch(key, num_buckets)`；无内存 | **0** | O(log N) | **平均 1/N** 迁移，**分布最均匀** | 实例 ID 是**数字**才好用（NZMesh 就是这么选的） |
| **Maglev** | Google 出品，**查找表 (lookup table) M 个槽**（通常 M=65537 素数），每个后端偏好序列填槽 | O(M)（65537 通常够用） | **O(1)** | **~1/N** 迁移 | **Google/Envoy L4 负载均衡**、需要极致查找速度 |

### Ring Hash 关键代码

```python
class RingHash:
    def __init__(self, nodes, vnodes=160):
        self.ring = {}          # hash -> node
        self.sorted_keys = []
        for n in nodes:
            for i in range(vnodes):
                h = md5(f"{n}#{i}".encode()).digest()  # 或 xxhash
                # 拆成 4 个 32-bit hash，一个副本 4 个虚拟节点（Ketama 惯例）
                for j in range(4):
                    v = int.from_bytes(h[j*4:(j+1)*4], "big")
                    self.ring[v] = n
                    self.sorted_keys.append(v)
        self.sorted_keys.sort()

    def get(self, key):
        h = int.from_bytes(md5(key.encode()).digest()[:4], "big")
        idx = bisect_right(self.sorted_keys, h) % len(self.sorted_keys)
        return self.ring[self.sorted_keys[idx]]
```

**为何要虚拟节点**：直接哈希节点物理 IP 分布严重不均；虚拟节点越多分布越均，代价是内存 + 变更时排序开销。

### Jump Consistent Hash（Google 论文原版）

```c
int32_t JumpConsistentHash(uint64_t key, int32_t num_buckets) {
    int64_t b = -1, j = 0;
    while (j < num_buckets) {
        b = j;
        key = key * 2862933555777941757ULL + 1;   // LCG
        j = (int64_t)((b + 1) * (double)(1LL << 31) / (double)((key >> 33) + 1));
    }
    return (int32_t)b;
}
```

**核心思想**：从 bucket 0 开始，每次概率 `(b+1)/(j+1)` 决定"是否留在当前 bucket"；不然跳到 j。**期望迭代次数 O(log N)**、**内存 0**、**分布均匀**。

**限制**：bucket 编号必须 **0 ~ N-1 连续整数**——扩容只能追加、缩容必须是从尾部——不适合"节点 IP 无序删除"场景（但 NZMesh 用 TBUSID 数字就是这个前提）。

### Maglev Hashing（Google 2016 SIGCOMM）

**目标**：负载均衡器上要**极低延迟 O(1) 查找**、**扩缩容时仅少量键迁移**、**均匀分布**。

**做法**：
1. **查找表 M 个槽**（M 是素数，通常 65537）
2. 每个后端 `i` 生成一个"偏好序列 permutation"：`P[i][j] = (offset[i] + j × skip[i]) mod M`，其中 offset/skip 由后端 IP 独立哈希算出、skip 与 M 互质
3. 轮流让每个后端"抢"一个槽——按偏好序列找**第一个未被占的槽**，占之
4. 请求 lookup：`backend = table[hash(key) mod M]` ← **O(1)**

**扩缩容**：加一个后端 → 重新填表；因每个后端偏好序列独立，**约 1/N 的槽会换主**，仍然均匀；对已有 flow 的迁移比例低。

### 树的家族（面试高频）

| 树 | 特点 | 用在哪 |
|---|---|---|
| **BST / AVL** | 严格平衡（左右差 ≤ 1），旋转多 | 教学；实际业务少用 |
| **红黑树** | 弱平衡（黑高一致），插删旋转少 | C++ `std::map`、Java `TreeMap`、Linux CFS 调度、epoll 内部 |
| **B / B+ 树** | 每节点多路（几十~几百 key），**磁盘友好**（一次 IO 读一节点）；B+ 叶子链表 | **数据库索引 (MySQL InnoDB)**、文件系统 |
| **LSM Tree** | 写入先 memtable，满了刷成 SSTable；后台 compact 合并 | **LevelDB / RocksDB / Cassandra / HBase**（写多读少） |
| **跳表 (Skip List)** | 多层链表，期望 O(log n)；**实现比红黑简单** | Redis ZSet、LevelDB memtable、并发场景（易做无锁） |
| **字典树 Trie** | 按字符分叉；前缀匹配 O(m) | 路由表、自动补全、词典 |
| **Radix / Patricia Trie** | Trie 压缩单链；**IP 路由表**核心 | Linux FIB、Envoy 路由匹配 |
| **Merkle Tree** | 叶子哈希 + 内部节点 = 子哈希拼接的哈希 | Git、区块链、Cassandra 反熵、防作弊校验 |
| **Segment Tree / BIT** | 区间求和/最值 O(log n)；BIT 更省常数 | 打排行榜、区间查询业务 |
| **Fenwick Tree (BIT)** | 前缀和 O(log n) | 同上，代码短 |

## 为什么这么做

### 布隆过滤器 (Bloom Filter)

**是什么**：位数组 + K 个哈希函数；插入时置 K 位；查询时检查 K 位是否全 1。

- **False Positive** 存在（说"有"可能实际没有），**False Negative 不存在**（说"没有"就一定没）
- **假阳率 p** 与 位数 m、元素数 n、hash 数 k 关系：`p ≈ (1 - e^(-kn/m))^k`；**最优 k = (m/n) × ln 2**
- **实用估算**：**每元素 ~10 bit → 假阳率 ~1%**；每加 4.8 bit → 假阳率降 10 倍

**变种**：
- **Counting Bloom**：位改计数器，支持删除
- **Cuckoo Filter**：支持删除 + 更好局部性；用两个 hash + 踢出
- **RedisBloom**（Redis 8 内建）：SPACE-efficient，直接用 `BF.ADD/BF.EXISTS`

**用途**：缓存穿透（DB 里都没有的 key 直接拒）、爬虫 URL 去重、DB 前置存在性判断（HBase / RocksDB SST 都有 Bloom 判断"这层有没有 key"）。

### HyperLogLog

- **基数估算**（有多少不同元素）**极小内存**——12 KB 就能算 10 亿量级 UV，误差 <1%
- **原理**：把 hash 分块，取每块前导 0 数量的最大值 → 类似"抛硬币 n 次至少一次连中 k 个正面 → n ≈ 2^k"
- **Redis `PFADD` / `PFCOUNT`** 就是这个

### LRU / LFU / ARC

- **LRU (Least Recently Used)**：**HashMap + 双向链表**——O(1) 访问 + 移到头
- **LFU (Least Frequently Used)**：按访问次数淘汰；**冷启动慢**（新元素次数少易被淘汰）
- **ARC (Adaptive Replacement Cache)**：ZFS 用；LRU + LFU 各一半自适应
- **Redis 4+ LFU** 用 8-bit 计数器 + 概率衰减，避免长期积累旧热点

### 限流算法数学

- **令牌桶**：`tokens = min(capacity, tokens + rate × Δt)`；请求扣 N 个，`tokens < N` 就拒 → **允许突发**
- **漏桶**：桶容量 + 恒定漏出速率 → **强制平滑**
- **滑动窗口计数器**：把 1 秒切成 10 份，每 100ms 一格；查询近 1 秒时求和；**内存 O(格子数)**

### 经典面试算法题（Top 频次）

- **TopK**：**最小堆 K 大小**（O(N log K)）或 **快速选择**（期望 O(N)）
- **LRU 手写**：`HashMap<Key, Node>` + **双向链表** + `head/tail` 哨兵
- **多线程交替打印 ABC**：用 3 个信号量或 `ReentrantLock + Condition`
- **无重复字符最长子串**：滑动窗口 + `HashMap<char, lastIndex>`
- **合并 K 个有序链表**：**最小堆**（O(N log K)）
- **LFU**：**HashMap + 频次桶（每桶又一个双向链表）**
- **股票 II 题系列**：DP 状态机（持有 / 不持有）
- **N 皇后**：回溯 + 位运算加速

## 为什么别的选择不行

### 一致性哈希踩坑

- **Ring Hash 虚拟节点太少 → 分布严重倾斜**（100 起步，200 更稳）
- **Ring Hash 用 md5 太慢** → 换 xxhash / murmur
- **Jump Hash 只能追加**：删中间节点不行；解法是"打墓碑"（把删除的桶留着但不响应）
- **Maglev 表大小不是素数** → 分布不均
- **Bloom 假阳率忽略 hash 相关性** → 用不同 seed 的 murmur / xxhash，别用 md5 截段

## 沉淀结论

### 面试快速反应表

- **一致性哈希 → 想到**：Ring / Jump / Maglev 三选一 + 虚拟节点 + 迁移 1/N
- **缓存穿透 → 想到**：布隆过滤器 + 空值缓存
- **有序集合 + 排行榜 → 想到**：跳表（Redis ZSet）或 Segment Tree
- **区间查询 → 想到**：Segment Tree / BIT
- **前缀匹配 → 想到**：Trie / Radix Trie
- **数据校验 → 想到**：Merkle Tree
- **写多读少存储 → 想到**：LSM Tree（LevelDB / RocksDB）
- **磁盘索引 → 想到**：B+ 树
- **UV 估算 → 想到**：HyperLogLog

## 内容来源

迁移自 guide/theme-algo-ds（综合整理：Google Maglev/Jump 论文、Redis / RocksDB 源码、《数据结构与算法分析》，2026-07）


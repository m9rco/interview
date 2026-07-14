---
title: 后台高频算法
---

# 后台高频算法

> 一致性哈希（Ring / Jump / Maglev）· 布隆过滤器 · HyperLogLog · LRU/LFU · 限流数学 · 树家族（B+/LSM/Merkle）——统一 C++ 实现

::: tip 🧠 一句话记忆锚点
**后台系统设计题的算法一半在这：一致性哈希（扩缩容只迁 1/N）+ 布隆过滤器（防缓存穿透）+ 跳表/LSM/B+ 树（存储引擎）+ Merkle 树（校验/反熵）。看到"分片/扩缩容"想到一致性哈希，"缓存穿透"想到布隆，"写多读少落盘"想到 LSM，"磁盘索引"想到 B+ 树，"UV 估算"想到 HyperLogLog。**
:::

## 场景问题

::: tip 为什么这些算法值得记
**分布式系统 = 一致性哈希 + 布隆过滤器 + 跳表 + LSM/B+ 树 + Merkle 树**——这几样占了后台面试算法题的一大半。挑最容易被追问的写出来，能秒杀"讲一下 Redis Cluster / Kafka / Cassandra 是怎么做的"这类连环问。
:::

## 实现方案

### 一致性哈希三种主流实现

| 算法 | 思路 | 内存 | 查找 | 扩缩容影响 | 适用 |
|---|---|---|---|---|---|
| **Ring Hash (Ketama)** | 节点哈希到 [0,2³²) 环，每节点 N 个虚拟节点；请求哈希后顺时针找第一个节点 | O(N×V) | O(log(NV)) | **平均 1/N** 迁移 | Redis Cluster、Memcached |
| **Jump Consistent Hash** | Google 论文，纯计算 `ch(key, buckets)`，无内存 | **0** | O(log N) | **1/N 迁移，分布最均匀** | 实例 ID 是**数字**才好用 |
| **Maglev** | 查找表 M 槽（素数，常 65537），每后端偏好序列填槽 | O(M) | **O(1)** | ~1/N 迁移 | Google/Envoy L4 负载均衡 |

**扩缩容只迁 1/N 的直觉**：环上加一个节点，只有"新节点逆时针到前一节点"这一小段的 key 改落到新节点，其余不动。

<svg viewBox="0 0 560 240" width="100%" style="max-width:560px;height:auto" role="img" aria-label="一致性哈希环：新增节点仅接管一段区间，只有 1/N 的 key 迁移">
  <circle cx="200" cy="120" r="90" fill="none" stroke="#475569" stroke-width="2"/>
  <!-- existing nodes A B C on ring -->
  <g font-size="12" text-anchor="middle">
    <circle cx="200" cy="30" r="13" fill="#1d4ed8"/><text x="200" y="34" fill="#fff">A</text>
    <circle cx="278" cy="165" r="13" fill="#1d4ed8"/><text x="278" y="169" fill="#fff">B</text>
    <circle cx="122" cy="165" r="13" fill="#1d4ed8"/><text x="122" y="169" fill="#fff">C</text>
  </g>
  <!-- new node D appears between A and B -->
  <circle cx="290" cy="70" r="13" fill="#16a34a"><animate attributeName="opacity" values="0;0;1;1" dur="4s" repeatCount="indefinite"/></circle>
  <text x="290" y="74" font-size="12" text-anchor="middle" fill="#fff"><animate attributeName="opacity" values="0;0;1;1" dur="4s" repeatCount="indefinite"/>D</text>
  <!-- highlighted migrated arc (A..D) turns green -->
  <path d="M 200 30 A 90 90 0 0 1 290 70" fill="none" stroke="#16a34a" stroke-width="5"><animate attributeName="opacity" values="0.15;0.15;1;1" dur="4s" repeatCount="indefinite"/></path>
  <text x="360" y="90" font-size="12" fill="currentColor">新增节点 D：</text>
  <text x="360" y="112" font-size="12" fill="#16a34a">只有绿色弧段的 key</text>
  <text x="360" y="132" font-size="12" fill="#16a34a">从 B 改落到 D</text>
  <text x="360" y="154" font-size="12" fill="currentColor">其余 key 不动 → 迁移 ~1/N</text>
  <text x="360" y="188" font-size="11" fill="currentColor">虚拟节点越多，</text>
  <text x="360" y="206" font-size="11" fill="currentColor">分布越均匀（100~200 起步）</text>
</svg>

**Ring Hash 关键代码（C++）**

```cpp
#include <map>
#include <string>
#include <cstdint>

struct RingHash {
    std::map<uint32_t, std::string> ring;   // 有序：hash -> 物理节点
    int vnodes;
    RingHash(int v = 160) : vnodes(v) {}

    void addNode(const std::string& node) {
        for (int i = 0; i < vnodes; i++)
            ring[hash32(node + "#" + std::to_string(i))] = node;   // 每节点撒 V 个虚拟点
    }
    std::string get(const std::string& key) const {
        if (ring.empty()) return "";
        auto it = ring.lower_bound(hash32(key));   // 顺时针第一个 ≥ h 的虚拟节点
        if (it == ring.end()) it = ring.begin();   // 环回绕
        return it->second;
    }
    static uint32_t hash32(const std::string& s);  // xxhash/murmur，勿用 md5 截段（慢）
};
```

**为何要虚拟节点**：直接哈希物理 IP 分布严重不均；虚拟节点越多越均，代价是内存 + 变更时排序开销。

**Jump Consistent Hash（Google 论文原版，C/C++ 通用）**

```cpp
int32_t jumpConsistentHash(uint64_t key, int32_t num_buckets) {
    int64_t b = -1, j = 0;
    while (j < num_buckets) {
        b = j;
        key = key * 2862933555777941757ULL + 1;                 // LCG
        j = (int64_t)((b + 1) * (double)(1LL << 31) / (double)((key >> 33) + 1));
    }
    return (int32_t)b;
}
```

**核心思想**：从 bucket 0 开始，每次以概率 `(b+1)/(j+1)` 决定"是否留在当前 bucket"。**期望 O(log N)、内存 0、分布均匀**。**限制**：bucket 必须 `0~N-1` 连续整数——只能尾部增删，不适合"无序删中间节点"。

**Maglev**：查找表 M 槽（素数 65537）；每后端按 `P[i][j]=(offset[i]+j·skip[i]) mod M` 生成偏好序列，轮流抢第一个空槽；查询 `table[hash(key) mod M]` 是 **O(1)**。扩缩容重填表，约 1/N 槽换主。

### 树的家族（面试高频）

| 树 | 特点 | 用在哪 |
|---|---|---|
| **红黑树** | 弱平衡，插删旋转少 | C++ `std::map`、Java `TreeMap`、Linux CFS、epoll |
| **B / B+ 树** | 多路、磁盘友好（一次 IO 一节点）；B+ 叶子链表利于范围扫 | **数据库索引 (InnoDB)**、文件系统 |
| **LSM Tree** | 写先入 memtable，满了刷 SSTable，后台 compact | **LevelDB/RocksDB/Cassandra/HBase**（写多读少） |
| **跳表** | 多层链表，期望 O(log n)，实现简单易并发 | Redis ZSet、LevelDB memtable |
| **Trie / Radix** | 前缀匹配 O(m)；Radix 压缩单链 | 路由表、自动补全、Linux FIB |
| **Merkle 树** | 叶子哈希 + 内节点=子哈希拼接的哈希 | Git、区块链、Cassandra 反熵、防篡改校验 |
| **线段树 / BIT** | 区间求和/最值 O(log n)；BIT 常数更小 | 排行榜、区间查询 |

## 为什么这么做

### 布隆过滤器（C++）

**是什么**：位数组 + K 个哈希函数；插入置 K 位，查询检查 K 位是否全 1。**False Positive 存在**（说"有"可能没有），**False Negative 不存在**（说"没有"一定没有）。假阳率 `p ≈ (1 - e^(-kn/m))^k`，**最优 k = (m/n)·ln2**；经验值**每元素 ~10 bit → 假阳率 ~1%**。

```cpp
#include <vector>
#include <string>
#include <cstdint>

struct BloomFilter {
    std::vector<bool> bits;
    int k;                                          // 哈希函数个数
    BloomFilter(size_t m, int k) : bits(m, false), k(k) {}

    void add(const std::string& s) {
        uint64_t h1 = hashA(s), h2 = hashB(s);
        for (int i = 0; i < k; i++)
            bits[(h1 + (uint64_t)i * h2) % bits.size()] = true;   // 双哈希生成 k 个位
    }
    bool maybeContains(const std::string& s) const {
        uint64_t h1 = hashA(s), h2 = hashB(s);
        for (int i = 0; i < k; i++)
            if (!bits[(h1 + (uint64_t)i * h2) % bits.size()]) return false;  // 有 0 一定不存在
        return true;                                // 全 1 → 可能存在
    }
    static uint64_t hashA(const std::string&);      // 用不同 seed 的 murmur/xxhash
    static uint64_t hashB(const std::string&);
};
```

**变种**：Counting Bloom（位改计数器支持删除）、Cuckoo Filter（支持删除 + 更好局部性）、RedisBloom（`BF.ADD/BF.EXISTS`）。**用途**：缓存穿透（DB 都没有的 key 直接拒）、URL 去重、RocksDB SST 层判断"这层有没有 key"。

### HyperLogLog

**基数估算**（多少不同元素）**极小内存**——12 KB 算 10 亿量级 UV，误差 <1%。原理：hash 分块，取每块前导 0 个数的最大值（"抛硬币连中 k 个正面 → n≈2^k"）。Redis `PFADD/PFCOUNT` 即此。

### LRU / LFU / ARC

- **LRU**：`unordered_map + 双向链表`——O(1) 访问 + 移到头，淘汰尾部（见 [数据结构](/algo/data-structures.md)）。
- **LFU**：按访问次数淘汰；**冷启动慢**（新元素次数少易被淘汰）；实现用"频次桶 + 每桶双向链表"。
- **Redis LFU** 用 8-bit 计数器 + 概率衰减，避免旧热点长期霸榜。

### 限流算法数学

- **令牌桶**：`tokens = min(cap, tokens + rate·Δt)`，请求扣 N，`tokens<N` 拒 → **允许突发**
- **漏桶**：桶容量 + 恒定漏出速率 → **强制平滑**
- **滑动窗口计数器**：1 秒切 10 格，查询近 1 秒求和 → 内存 O(格数)（详见 [令牌桶与漏桶](/game-infra/token-leaky-bucket.md)）

## 为什么别的选择不行

- **Ring Hash 虚拟节点太少 → 分布倾斜**（100 起步，200 更稳）；用 md5 太慢 → 换 xxhash/murmur。
- **Jump Hash 只能追加**：删中间节点不行；解法是"打墓碑"（保留桶但不响应）。
- **Maglev 表大小不是素数 → 分布不均**。
- **Bloom 用 md5 截段做多哈希 → 相关性强、假阳偏高**：应用不同 seed 的独立哈希（或双哈希法 `h1 + i·h2`）。

## 沉淀结论

### 面试快速反应表

- **一致性哈希 →** Ring / Jump / Maglev 三选一 + 虚拟节点 + 迁移 1/N
- **缓存穿透 →** 布隆过滤器 + 空值缓存
- **有序集合 / 排行榜 →** 跳表（Redis ZSet）或线段树
- **区间查询 →** 线段树 / BIT
- **前缀匹配 →** Trie / Radix Trie
- **数据校验 / 反熵 →** Merkle 树
- **写多读少落盘 →** LSM Tree；**磁盘索引 →** B+ 树；**UV 估算 →** HyperLogLog

### 面试高频题清单

- **Q：Redis Cluster 怎么分片？** A：16384 个 slot（CRC16(key) mod 16384），节点认领 slot 区间；本质是"槽 + 一致性映射"，扩缩容按 slot 迁移。
- **Q：一致性哈希 vs 取模分片？** A：取模 `hash%N` 在 N 变化时几乎全部 key 重映射；一致性哈希只迁 1/N，且虚拟节点保证均衡。
- **Q：布隆过滤器怎么定 m 和 k？** A：给定 n 和目标假阳率 p，`m = -n·ln p /(ln2)²`，`k = (m/n)·ln2`；经验 ~10 bit/元素 ≈ 1%。
- **Q：LSM 为什么写快、读可能慢？** A：写只追加 memtable/WAL（顺序 IO）；读要查 memtable + 多层 SSTable，靠布隆过滤器 + 分层 compaction 降读放大。

## 内容来源

综合整理：Google Maglev / Jump Consistent Hash 论文、Redis / RocksDB 公开资料、《数据结构与算法分析》。代码为教学示意，生产请用成熟库（哈希用 xxhash/murmur）。

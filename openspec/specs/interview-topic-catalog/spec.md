# interview-topic-catalog

## Purpose

面试复习中心 `THEMES` 数组的**内容目录规范**：定义每一个专题的必含知识点清单，作为内容验收的最低门槛。规范以"是什么 → 为什么这么选 → 踩过什么坑 → 怎么填的"四段式为核心组织结构，覆盖首批 7 个专题（`intro`、`business-proxy`、`xmesh-k8s`、`rate-limit`、`redis`、`k8s-network`、`agent-dev`）以及 6 个后续追加的通用后台专题（`concurrency`、`tcp-net`、`gc-stw`、`algo-ds`、`design-model`、`release-strategy`）。
## Requirements
### Requirement: 专题目录

复习中心 MUST 涵盖以下 13 个专题，且每个专题 MUST 满足其"关键知识点必含项"清单，作为内容验收的最低门槛。

#### Scenario: 全部 13 个专题都存在

- **WHEN** 检查 `THEMES` 数组
- **THEN** 数组包含以下 13 个 `id`：`intro`、`business-proxy`、`xmesh-k8s`、`rate-limit`、`redis`、`k8s-network`、`agent-dev`、`concurrency`、`tcp-net`、`gc-stw`、`algo-ds`、`design-model`、`release-strategy`

### Requirement: intro 专题内容完整

`intro` 专题的内容 MUST 覆盖个人经历与后台通用架构信条。

#### Scenario: intro 必含项

- **WHEN** 打开 `theme-intro.html` 或首页 intro 面板
- **THEN** 内容至少包含：两段工作经历时间线（360 三年 + 鹅厂六年，含团队与项目）、"分而治之/读写分离"设计信条、高性能三要点（配置中心/Kafka/四七层负载）、高可用五问、分布式核心议题（CAP/BASE/Paxos-Raft-ZAB/Gossip/一致性哈希、RPC-网关-配置中心-注册中心、分布式 ID/锁/事务与坑）、游戏 vs 互联网后台的本质差异（单线程无锁 vs 多协程/多线程、计算密集 vs I/O 密集）

### Requirement: business-proxy 专题内容完整

`business-proxy` 专题 MUST 覆盖 platpxy / paypxy / mallsvrd 三模块技术演进要点。

#### Scenario: business-proxy 必含项

- **WHEN** 打开 business-proxy 内容
- **THEN** 内容至少包含：三模块关系图（platpxy / paypxy / mallsvrd）、platpxy 三种出向通道（HTTP 命名连接池 / 原生 TCP 私有协议 / cgo C++ SDK）、paypxy 完整支付链路（下单-支付-回调-对账）与幂等四道闸、米大师签名规则与 URL 编码坑、连接池 12000 上限与复用率埋点、监控维度爆炸的坑与固定枚举维度做法、mallsvrd 双商品体系（Shop/Mall）与周期刷新时间对齐、乐观锁 CAS、逆战点直购超时的 PLAN A/B/C 演进

### Requirement: xmesh-k8s 专题内容完整

`xmesh-k8s` 专题 MUST 覆盖自研服务网格演进 + K8s 部署要点，且 MUST 明确校正"Gossip"概念与代码落地的差异。

#### Scenario: xmesh-k8s 必含项

- **WHEN** 打开 xmesh-k8s 内容
- **THEN** 内容至少包含：TGW+PROXY+TBus 时代死法、Consul 版硬伤（300 实例数据重复、5000 节点上限）、"以机器为单位"部署（DaemonSet + hostNetwork）、Gossip 校正（概念 vs 全连接单跳广播）、`calc_connect` 单向连接算法（IP 末位 bit 异或 + 5000 节点连接差 0.37%）、Reservoir Sampling 32 节点、Jump Consistent Hash 取代 Ketama、就近路由与备份路由、CVM 多通道（virtio 40-45% 瓶颈 + SDK 直连 + 一致性 HASH 保序）、K8s 三种部署模型对比（DaemonSet/Service/Sidecar 弃用原因）、hostIP 注入而非 UDS、跨集群主机网络直连、xmeshpanel 对账 host.txt vs K8s API

### Requirement: rate-limit 专题内容完整

`rate-limit` 专题 MUST 对比互联网后台与游戏后台的限流方案与本质差异。

#### Scenario: rate-limit 必含项

- **WHEN** 打开 rate-limit 内容
- **THEN** 内容至少包含：互联网限流（Nginx limit_req、令牌桶/漏桶原理、Sentinel/Guava RateLimiter、Redis+Lua 集群限流、分布式令牌桶算法、网关层 vs 服务层）、游戏限流（Tick 内 CD、玩家/账号/服务器/大区多层、按帧摊派与写队列削峰、活动开服的排队机 + 平滑扩容、跨服玩法排队匹配）、二者本质差异（无状态 vs 强状态；I/O 密集 vs 计算密集；用户请求独立 vs 世界状态高度耦合）、限流后的降级/熔断/兜底策略

### Requirement: redis 专题内容完整

`redis` 专题 MUST 覆盖版本演进与分布式议题两大主线。

#### Scenario: redis 必含项

- **WHEN** 打开 redis 内容
- **THEN** 内容至少包含：版本演进时间线（3.x AOF/RDB、4.x MODULE + PSYNC2、5.x STREAM 消息队列、6.x 多线程网络 IO + ACL、7.x FUNCTION + Sharded PubSub + AOF Multi-Part、8.x 更高吞吐 + 语义索引/JSON 内建，含每版本关键新特性与破坏性变更）、分布式锁（SETNX + expire + Lua 释放、Redlock 争议、Redisson 看门狗续期、锁提前过期坑）、Cluster（Slot 迁移、gossip、多 key 事务限制、Hash Tag）、主从异步复制丢数据与故障转移、缓存三板斧（穿透/击穿/雪崩 + 布隆过滤器 + 互斥重建 + 随机 TTL）、Cache-aside/Write-through/Write-behind 对比、双写一致性（延时双删、Canal 订阅 binlog）

### Requirement: k8s-network 专题内容完整

`k8s-network` 专题 MUST 覆盖异构混部与 CNI 网络插件原理与落地。

#### Scenario: k8s-network 必含项

- **WHEN** 打开 k8s-network 内容
- **THEN** 内容至少包含：异构混部（GPU/ARM/x86 节点池、node label + taint/toleration + nodeSelector + affinity、多 runtime containerd/kata、DS 战斗集群一机一 Pod）、CNI 三大流派原理对比（Flannel VXLAN 隧道、Calico BGP + IPIP、Cilium eBPF 内核态数据面）、Service 与 kube-proxy 三种模式（userspace/iptables/ipvs）、Ingress vs Gateway API、腾讯 BCS 直连 CLB 落地、跨 K8s 集群通信（Overlay 依赖 vs 主机网络直连）、eBPF 干掉 sidecar 反复横跳的原理、Sidecar 资源精简与 XDS 下发爆炸问题

### Requirement: agent-dev 专题内容完整

`agent-dev` 专题 MUST 覆盖 Agent 系统构建的核心概念、落地经验与主流框架。

#### Scenario: agent-dev 必含项

- **WHEN** 打开 agent-dev 内容
- **THEN** 内容至少包含：Agent Loop 结构（观察-规划-行动-反思、ReAct、Plan-and-Execute）、Tool Use 协议与 Function Calling、上下文窗口管理（滑动窗口 + 语义压缩 + 关键事实提取）、AI 巡检系统落地（自研经验：滑动窗口设计、语义分析压缩策略）、Prompt Engineering 与失败恢复（重试、幂等、护栏）、评测（golden set、红队测试、离线回放）、Multi-Agent 协作模式、代表性框架对比（LangGraph、AutoGen、CrewAI、Anthropic Claude Agent SDK）

### Requirement: concurrency 专题内容完整

`concurrency` 专题 MUST 覆盖进程/线程/协程三种并发单位的对照与调度原理。

#### Scenario: concurrency 必含项

- **WHEN** 打开 concurrency 内容
- **THEN** 内容至少包含：进程/线程/协程三维对照（地址空间、调度方、切换成本、创建成本、通信方式、故障隔离、代表实现）、内核态/用户态调度（1:1、N:1、M:N，Linux pthread、Java Thread、Go GMP）、Go GMP 三要素（G/M/P、Work Stealing、Handoff、Preemption、netpoller）、其它协程/异步生态（Python asyncio + GIL、Kotlin suspend、Rust tokio、Erlang BEAM 进程、C++20 coroutine、微信 mmcoroutine/libco）、内存模型与可见性（volatile ≠ 原子、Happens-Before、CPU cache line、伪共享）、同步原语选型（Mutex、RWMutex、Spin、Semaphore、Condvar、Lock-Free CAS/ABA、RCU）、经典并发事故（死锁四条件、优先级反转、惊群、协程泄漏、锁粒度）、上下文切换开销量级、CPU/IO 密集与游戏 vs 互联网选型

### Requirement: tcp-net 专题内容完整

`tcp-net` 专题 MUST 覆盖 TCP 协议核心原理与网络编程实践。

#### Scenario: tcp-net 必含项

- **WHEN** 打开 tcp-net 内容
- **THEN** 内容至少包含：TCP 三次握手/四次挥手（含各状态机、TIME_WAIT 目的与 2MSL、SYN Flood 防御、SO_REUSEADDR/REUSEPORT）、拥塞控制（慢启动、拥塞避免、快重传/快恢复、Reno/CUBIC/BBR 差异）、流量控制（滑动窗口、零窗口探测、Nagle 与 TCP_NODELAY、Delayed ACK 组合坑）、粘包拆包与应用层协议（长度前缀/分隔符/固定长度/协议 buf）、Keepalive 与半开连接、TCP vs UDP 选型、IO 多路复用（select/poll/epoll，LT/ET 模式、水平触发陷阱）、零拷贝（sendfile、splice、mmap）、TIME_WAIT 累积生产事故与调优、常见抓包排障（tcpdump / wireshark 关键字段）

### Requirement: gc-stw 专题内容完整

`gc-stw` 专题 MUST 覆盖主流语言 GC 算法与 STW 优化。

#### Scenario: gc-stw 必含项

- **WHEN** 打开 gc-stw 内容
- **THEN** 内容至少包含：GC 基本算法（引用计数、标记-清除、复制、标记-整理、分代）、Java GC 演进（Serial/Parallel/CMS/G1/ZGC/Shenandoah、G1 Region 与 Mixed GC、ZGC 染色指针 + 读屏障 + 并发标记与转移）、Go GC（三色标记 + 混合写屏障，Pacer 触发时机、STW 时间演进从毫秒到亚毫秒）、V8 GC（Scavenge 新生代 + Mark-Sweep-Compact 老生代 + Orinoco 并行、Incremental Marking 减少 STW）、Python 引用计数 + 分代循环回收、GC 关键指标（暂停时间 P99、吞吐、堆使用、Allocation Rate）、STW 现象排查（GC 日志、pprof、jstat/jcmd/gceasy、G1 Humongous 对象、finalizer 陷阱）、内存泄漏排查、GC 与延迟敏感服务的调优思路（对象池、减少分配、堆外内存、逃逸分析）

### Requirement: algo-ds 专题内容完整

`algo-ds` 专题 MUST 覆盖后端高频算法与数据结构。

#### Scenario: algo-ds 必含项

- **WHEN** 打开 algo-ds 内容
- **THEN** 内容至少包含：一致性哈希（Ring Hash + 虚拟节点 + Ketama 惯例、Jump Consistent Hash 论文实现、Google Maglev 查找表 M 素数与偏好序列）、树家族（BST/AVL/红黑/B/B+/LSM/跳表/Trie/Radix/Merkle/Segment/BIT 及其杀手场景）、布隆过滤器（假阳率公式、最优 k、Counting/Cuckoo/RedisBloom）、HyperLogLog、LRU/LFU/ARC 与 Redis LFU 概率衰减、限流算法数学（令牌桶/漏桶/滑动窗口计数器）、经典手写题（TopK 最小堆/快速选择、LRU/LFU 手写、多线程交替打印、无重复子串滑动窗口、合并 K 有序链表最小堆、股票 II DP、N 皇后回溯）、面试快速反应表（一致性哈希/缓存穿透/排行榜/区间查询/前缀匹配等场景到数据结构的映射）

### Requirement: design-model 专题内容完整

`design-model` 专题 MUST 覆盖并发/协作设计模型与同步/异步/阻塞/非阻塞正交维度。

#### Scenario: design-model 必含项

- **WHEN** 打开 design-model 内容
- **THEN** 内容至少包含：同步/异步 vs 阻塞/非阻塞四象限（含 Linux epoll 是同步非阻塞而非异步 IO 的澄清、io_uring 才是真异步）、Reactor 三种变体（单线程/单 Reactor 多线程/主从 Reactor）与 Proactor（IOCP/io_uring）、Actor vs CSP 差别（通道所有权、寻址方式、发送语义、匹配语义，附 ASCII 邮箱模型对比）、Event Loop（Node 6 阶段 + 微任务/宏任务）、SEDA / Pipeline / Half-Sync-Half-Async / Master-Worker / Leader-Follower / Pub-Sub、经典组合（Nginx = Master-Worker + Reactor；Netty = 主从 Reactor + Pipeline；Erlang = Actor + Supervisor Tree；Kafka = Reactor + Master-Worker + Pub/Sub）、常见事故（Reactor 慢回调堵塞、Actor 邮箱堆积、CSP channel 泄漏与死锁、Event Loop 微任务饿死宏任务、Master-Worker 惊群、Pub/Sub 顺序与丢失、SEDA 队列爆掉）、面试话术把设计模型绑到实际系统（游戏 Actor / platpxy Reactor / XMesh Half-Sync-Half-Async / paypxy Pipeline）

### Requirement: release-strategy 专题内容完整

`release-strategy` 专题 MUST 覆盖 K8s 灰度/金丝雀/蓝绿/A-B/Shadow 发布策略与生态工具。

#### Scenario: release-strategy 必含项

- **WHEN** 打开 release-strategy 内容
- **THEN** 内容至少包含：六大发布策略正面对比（Recreate、RollingUpdate、BlueGreen、Canary、A-B、Shadow，附停机、回滚、基础设施、场景多维表）、K8s 原生五关键字段（`maxSurge`/`maxUnavailable`/`minReadySeconds`/`progressDeadlineSeconds`/`revisionHistoryLimit`）与 `kubectl rollout undo/history/status`、Canary 三层次（副本比例/Ingress annotation/Service Mesh 权重）、Istio VirtualService+DestinationRule 与 Nginx-Ingress canary annotation（weight/header/cookie）完整清单、Argo Rollouts / Flagger / Kruise Rollout 三工具对比、Argo Rollouts + AnalysisTemplate（Prometheus PromQL 成功率）示例、A-B 与 Canary 的差别（技术 vs 业务、随机 vs 特征、观察期长短、成功指标、失败动作）、Shadow / Traffic Mirroring 用法与副作用坑、生产灰度 SOP 八步、常见事故（Endpoints 摘除滞后 502、preStop sleep + 优雅退出、会话粘性、DB Schema 双向兼容、Feature Flag 腐烂、Canary 假阳性、多集群不同步、Envoy xDS 缓存）、游戏后台的独家灰度（分区/UID/Feature Flag/DS preStop）

### Requirement: 内容组织的四段式结构

每个专题的详情内容 MUST 以"是什么 → 为什么这么选 → 踩过什么坑 → 怎么填的"四段式组织，与用户已有的桌面笔记语言对齐。

#### Scenario: 每份专题都有四段

- **WHEN** 用户浏览任一专题内容
- **THEN** 页面能明确识别到四个段落标题（"是什么"、"为什么这么选"、"踩过什么坑"、"怎么填的"）；即便某段内容较短或标注"待补充"，段落骨架也 MUST 保留

### Requirement: 内容来源可追溯

每个专题的独立分册末尾 MUST 提供"内容来源"区块，注明抽取自哪份桌面 Markdown 或哪些外部资料，以及抽取时间。

#### Scenario: 分册页脚有来源

- **WHEN** 用户滚动到任一独立分册页面底部
- **THEN** 存在一个"内容来源 / Sources"区块，包含至少一条可读的来源说明；对于抽取自桌面 md 的三个专题（intro/business-proxy/xmesh-k8s），来源说明含 md 路径 + 抽取日期；对于综合整理的通用专题（rate-limit / redis / k8s-network / agent-dev / concurrency / tcp-net / gc-stw / algo-ds / design-model / release-strategy），来源说明标注"综合整理"及主要参考出处

### Requirement: go-gotchas 专题内容完整

`go-gotchas`（Go 语言基础与常见陷阱）专题 MUST 覆盖 Go 高频语法陷阱与底层模型。

#### Scenario: go-gotchas 必含项

- **WHEN** 打开 `docs/common/go-gotchas.md`
- **THEN** 内容至少包含：new vs make 区别、slice 底层表头与共享底层数组/append 扩容坑（含三索引切片规避）、defer 的 LIFO/参数注册时求值/修改命名返回值、for-range 循环变量捕获（Go 1.22 前后语义差异与规避）、nil interface 二元组陷阱、内存逃逸典型五因、读写已关闭 channel 的行为、string↔[]byte 拷贝与零拷贝、sync.Map 适用场景，且以五段式组织、页脚含"内容来源"标注 lifei6671/interview-go

### Requirement: mysql-innodb 专题内容完整

`mysql-innodb`（MySQL InnoDB 索引与事务）专题 MUST 覆盖 InnoDB 索引结构与 MVCC 事务机制。

#### Scenario: mysql-innodb 必含项

- **WHEN** 打开 `docs/common/mysql-innodb.md`
- **THEN** 内容至少包含：B+ 树为何做索引（树高≈IO 次数、叶子有序链表、对比 B 树/红黑树/Hash）、聚簇索引 vs 二级索引与回表/覆盖索引、联合索引最左前缀与范围列失效、索引下推 ICP、索引失效常见写法、MVCC（隐藏列 + undo 版本链 + ReadView 可见性判定 + 快照读/当前读）、事务隔离级别与 RR/RC 的 ReadView 时机、InnoDB 如何压制幻读（MVCC + Next-Key Lock），且以五段式组织、页脚含"内容来源"标注 lifei6671/interview-go

### Requirement: sorting 专题内容完整

`sorting`（排序算法全景与选型）专题 MUST 覆盖主流排序算法对比、选型与相关基础。

#### Scenario: sorting 必含项

- **WHEN** 打开 `docs/common/sorting.md`
- **THEN** 内容至少包含：七大排序（冒泡/选择/插入/希尔/归并/快排/堆排）稳定性×时间×空间对照表、线性排序（计数/基数/桶）适用条件、快排工程化优化（随机基准/三数取中、三路切分、小区间转插入、introsort/pdqsort）、排序选型公式、并查集（按秩合并 + 路径压缩）、Unix I/O 模型（阻塞/非阻塞/多路复用/信号驱动/异步，select→poll→epoll），且以五段式组织、页脚含"内容来源"标注 m9rco/practice 与 lifei6671/interview-go


## ADDED Requirements

### Requirement: 游戏基础架构与工具域专题目录

`docs/game-infra/` 域 MUST 至少涵盖以下专题，每个专题 MUST 满足其"必含知识点"清单作为内容验收门槛，并以五段式组织。

#### Scenario: 域内专题齐备

- **WHEN** 检查 `docs/game-infra/` 目录
- **THEN** 至少存在以下专题：`tconnd`、`tbus`、`cni-plugins`、`mesh-istio-cilium`、`mesh-central-vs-decentral`、`stateful-migration`、`stateful-recovery`、`ebpf`、`consistent-hash-impl`、`reservoir-sampling`、`cpp-coroutine`、`seckill`、`config-hot-reload`、`token-leaky-bucket`、`raft-gossip`、`llvm-compile`、`ratelimit-circuitbreak`

### Requirement: tconnd 专题内容完整

`tconnd` 专题 MUST 覆盖腾讯游戏接入层 tconnd 的连接管理与协议。

#### Scenario: tconnd 必含项

- **WHEN** 打开 tconnd 专题
- **THEN** 内容至少包含：tconnd 作为接入网关的职责（长连接维持、收发包、心跳、加解密、路由到后端 TBus）、连接与会话状态管理、私有协议帧格式与粘包处理、为什么游戏用自研接入层而非通用网关（有状态长连接、私有协议、低延迟）、与 TBus 的配合、断线重连与会话保持

### Requirement: tbus 专题内容完整

`tbus` 专题 MUST 覆盖 TBus 进程间/服务间通信总线。

#### Scenario: tbus 必含项

- **WHEN** 打开 tbus 专题
- **THEN** 内容至少包含：TBus 基于共享内存的高性能本机 IPC 与跨机通道模型、地址（GCIM/世界-集群-实例-模块寻址）与路由、零拷贝与环形队列、为什么游戏后台用共享内存总线而非 RPC over TCP（同机低延迟、无内核拷贝）、与服务网格/gRPC 的取舍、消息可靠性与背压

### Requirement: cni-plugins 专题内容完整

`cni-plugins` 专题 MUST 覆盖 CNI 规范与主流 K8s 网络插件。

#### Scenario: cni-plugins 必含项

- **WHEN** 打开 cni-plugins 专题
- **THEN** 内容至少包含：CNI 规范（ADD/DEL、可执行 + JSON、IPAM 职责）、三大流派原理对比（Flannel VXLAN 隧道封包、Calico BGP 路由 + IPIP、Cilium eBPF 内核态数据面）、Underlay vs Overlay 取舍、为什么大规模/低延迟场景倾向 BGP/eBPF 而非 VXLAN（封包开销、MTU）、多插件链（CNI chaining、Multus 多网卡）与游戏战斗集群一机一 Pod 的诉求

### Requirement: mesh-istio-cilium 专题内容完整

`mesh-istio-cilium` 专题 MUST 覆盖 Istio 与 Cilium 两类服务网格数据面。

#### Scenario: mesh-istio-cilium 必含项

- **WHEN** 打开 mesh-istio-cilium 专题
- **THEN** 内容至少包含：Istio（Envoy sidecar 数据面 + istiod 控制面、xDS 下发、VirtualService/DestinationRule、mTLS）、Cilium（eBPF 无 sidecar/sidecarless、L3-L7 策略在内核、Hubble 可观测）、sidecar 注入与流量劫持（iptables）的开销、为什么 eBPF 数据面能省掉 sidecar 反复横跳（内核态直接转发）、两者在延迟/资源/可运维性上的取舍

### Requirement: mesh-central-vs-decentral 专题内容完整

`mesh-central-vs-decentral` 专题 MUST 覆盖服务网格中心化与去中心化两种实现及优劣。

#### Scenario: mesh-central-vs-decentral 必含项

- **WHEN** 打开 mesh-central-vs-decentral 专题
- **THEN** 内容至少包含：中心化（集中式控制面/注册中心统一下发路由、如 Istio istiod、自研 panel）与去中心化（节点间 gossip 传播成员与路由、无单点）的架构对比、一致性与时效性（中心化强一致但有单点/扩展瓶颈，去中心化最终一致但抗故障）、规模上限（中心化受控制面连接数限制、去中心化受 gossip 收敛与流量放大限制）、为什么自研网格在大规模游戏集群选去中心化 + 单向连接算法降连接数、各自的可观测与排障难度

### Requirement: stateful-migration 专题内容完整

`stateful-migration` 专题 MUST 覆盖有状态服务的数据迁移方案。

#### Scenario: stateful-migration 必含项

- **WHEN** 打开 stateful-migration 专题
- **THEN** 内容至少包含：有状态迁移的难点（内存态 + 连接态不能像无状态那样直接漂移）、迁移方式（停机迁移、双写灰度、增量同步 + 追平 + 切换、一致性哈希扩容下的 slot/分片搬迁）、玩家数据/房间状态的迁移（先冻结写、快照 + 增量、目标端回放、切流量、校验）、为什么不能简单重建（会话丢失、状态不可重算）、迁移中的一致性与回滚点

### Requirement: stateful-recovery 专题内容完整

`stateful-recovery` 专题 MUST 覆盖有状态服务的数据恢复/容灾。

#### Scenario: stateful-recovery 必含项

- **WHEN** 打开 stateful-recovery 专题
- **THEN** 内容至少包含：恢复的数据来源（周期快照/checkpoint、WAL/操作日志回放、上游重放、副本接管）、RPO/RTO 权衡、快照 + 增量日志的恢复流程与幂等回放、脑裂与双主防护、为什么纯内存服务必须落盘 checkpoint（宕机即丢）、与迁移的区别（恢复面向故障、迁移面向计划内变更）、演练与数据校验

### Requirement: ebpf 专题内容完整

`ebpf` 专题 MUST 覆盖 eBPF 原理与在网络/可观测/安全的落地。

#### Scenario: ebpf 必含项

- **WHEN** 打开 ebpf 专题
- **THEN** 内容至少包含：eBPF 是什么（内核态安全沙箱虚拟机、verifier 校验、JIT、Map 与用户态共享数据、无需改内核/加载模块）、挂载点（XDP/tc 网络、kprobe/uprobe/tracepoint 追踪、LSM 安全）、典型用途（Cilium 数据面替代 kube-proxy iptables、bpftrace/BCC 可观测、DDoS 早期丢包、DNS 拦截）、为什么 eBPF 能替代 iptables（O(1) map 查找 vs 线性 iptables 链、内核态零拷贝）、限制（verifier 对循环/指令数的约束、内核版本依赖）

### Requirement: consistent-hash-impl 专题内容完整

`consistent-hash-impl` 专题 MUST 覆盖一致性哈希三种算法（RingHash/Maglev/JumpHash）原理与实现。

#### Scenario: consistent-hash-impl 必含项

- **WHEN** 打开 consistent-hash-impl 专题
- **THEN** 内容至少包含：Ring Hash（哈希环 + 虚拟节点 + Ketama、O(log N) 二分查找、vnode 数量与均衡度、约 1/N 重映射，支持任意加减权重节点）、Maglev（固定查找表 + 偏好序列填充、O(1) 查表、近乎均匀、扰动小但非最优、表大小取素数）、Jump Consistent Hash（零内存、纯算术 O(log N)、完美均衡、最优 1/N 迁移，但只能在尾部增删桶、不支持任意删中间节点/权重）、三者权衡表（查找成本/内存/均衡/任意增删/重映射）与选型（LB 数据面选 Maglev、尾部分片选 Jump、异构带权选 Ring）、含可运行代码

### Requirement: reservoir-sampling 专题内容完整

`reservoir-sampling` 专题 MUST 覆盖蓄水池抽样算法及其用途。

#### Scenario: reservoir-sampling 必含项

- **WHEN** 打开 reservoir-sampling 专题
- **THEN** 内容至少包含：问题定义（未知总量/流式数据中等概率抽 k 个）、算法（前 k 个直接入池，第 i 个以 k/i 概率替换池中随机一个）、概率正确性证明（每个元素最终留存概率为 k/n）、用途（日志采样、大流量监控抽样、自研网格中从全量节点里选固定数量做连接/广播、内存受限统计）、为什么不能"先收集再随机"（总量未知/内存放不下）、加权蓄水池（A-Res）扩展、含可运行代码

### Requirement: cpp-coroutine 专题内容完整

`cpp-coroutine` 专题 MUST 覆盖 C++ 有栈/无栈协程与 C++20 原生协程对比。

#### Scenario: cpp-coroutine 必含项

- **WHEN** 打开 cpp-coroutine 专题
- **THEN** 内容至少包含：有栈协程（每协程独立完整调用栈、可从任意嵌套深处挂起、切换需保存/切换栈指针与寄存器，如 libco/boost.context/ucontext）与无栈协程（编译期状态机 + 堆上定长帧、只能在 co_await/co_yield 点挂起、无独立栈，如 C++20）的本质区别、为什么 C++11 时代要自研有栈协程（无语言级支持、需改造大量同步/阻塞老代码而不改函数签名，即规避"函数染色"）、C++20 原生协程为何是无栈（省内存、切换更廉价、支持百万级并发）却带来函数染色（co_await 病毒式传染、深调用栈/第三方阻塞代码难改造）、两者内存/切换成本/改造成本对比、微信 libco hook 系统调用的做法

### Requirement: seckill 专题内容完整

`seckill` 专题 MUST 覆盖游戏业务里的秒杀/抢购承载，瓶颈定位与解决。

#### Scenario: seckill 必含项

- **WHEN** 打开 seckill 专题
- **THEN** 内容至少包含：瓶颈定位（热点单行库存的行锁竞争、DB 连接与 IOPS、缓存击穿、超卖）、分层削峰（前端限流/答题/随机延迟、接入层限流、消息队列异步下单、库存预热到 Redis）、库存扣减方案（Redis + Lua 原子扣减、预扣 + 异步落库、分段库存/库存分桶降热点）、防超卖（原子操作 + 幂等令牌、乐观锁 CAS）、防重复/防刷（幂等键、限购）、最终一致对账、为什么不能直接打 DB（行锁串行化、连接打满）、游戏秒杀与电商秒杀差异（世界状态/公平性/防外挂）、含 Redis+Lua 代码

### Requirement: config-hot-reload 专题内容完整

`config-hot-reload` 专题 MUST 覆盖内存配置热刷新与更新机制。

#### Scenario: config-hot-reload 必含项

- **WHEN** 打开 config-hot-reload 专题
- **THEN** 内容至少包含：热刷诉求（游戏数值/活动/开关不停服更新）、实现（配置中心推送/长轮询/watch、版本号与灰度、双 buffer + 原子指针切换保证读无锁无撕裂、reload 校验失败回滚）、一致性（多进程/多节点同时生效的时序、按世界/分区分批）、为什么用双 buffer 原子切换而非加锁改（读多写少、避免读端阻塞与半更新）、配置校验与灰度发布、与代码热更的区别

### Requirement: token-leaky-bucket 专题内容完整

`token-leaky-bucket` 专题 MUST 覆盖令牌桶与漏桶算法及用途。

#### Scenario: token-leaky-bucket 必含项

- **WHEN** 打开 token-leaky-bucket 专题
- **THEN** 内容至少包含：令牌桶（匀速产 token、桶容量允许突发、请求取 token、可积攒）与漏桶（请求入队匀速漏出、严格恒定速率、不允许突发）原理与差异、各自适用（令牌桶做限流允许突发、漏桶做整流削峰平滑输出）、实现（令牌桶惰性计算 last_time + rate、分布式用 Redis+Lua）、与滑动窗口计数器/固定窗口的对比与为什么要平滑、含可运行代码

### Requirement: raft-gossip 专题内容完整

`raft-gossip` 专题 MUST 覆盖 Raft 与 Gossip 两类分布式协议的用途与简单实现。

#### Scenario: raft-gossip 必含项

- **WHEN** 打开 raft-gossip 专题
- **THEN** 内容至少包含：Raft（强一致共识、Leader 选举 + 日志复制 + 安全性、任期 term、心跳与选举超时、多数派提交、脑裂处理、用于元数据/配置/KV 强一致，如 etcd）、Gossip（最终一致的成员发现与状态传播、SI/SIR 传染模型、周期随机选节点交换、收敛速度 O(log N) 轮、抗故障无单点，用于集群成员/故障探测，如 Serf/Redis Cluster/Cassandra）、CP vs AP 取舍、为什么成员发现用 Gossip 而元数据一致用 Raft、各自简易实现要点与伪码

### Requirement: llvm-compile 专题内容完整

`llvm-compile` 专题 MUST 覆盖编译优化原理、LLVM 工具链与 Clang/GCC 历史。

#### Scenario: llvm-compile 必含项

- **WHEN** 打开 llvm-compile 专题
- **THEN** 内容至少包含：编译三段式（前端 → 优化器 → 后端）与 LLVM IR（SSA 形式、目标无关中间表示）、LLVM 工具（clang 前端、opt 优化器、llc 后端、lld 链接器、libc++、LTO 链接期优化、Sanitizers、libFuzzer）、常见优化（常量折叠、内联、循环展开/向量化、死代码消除、逃逸分析、PGO）、Clang vs GCC 历史与差异（LLVM 模块化库化 vs GCC 单体、许可证 GPL vs Apache、诊断信息与 IDE 集成、编译速度与生成代码质量之争）、为什么 LLVM 的模块化设计催生了大量语言与工具

### Requirement: ratelimit-circuitbreak 专题内容完整

`ratelimit-circuitbreak` 专题 MUST 覆盖互联网与游戏后台的限流与熔断对比。

#### Scenario: ratelimit-circuitbreak 必含项

- **WHEN** 打开 ratelimit-circuitbreak 专题
- **THEN** 内容至少包含：限流层次（接入层 Nginx limit_req、网关层、服务层 Sentinel/Guava、分布式 Redis+Lua）、算法选型（固定/滑动窗口、令牌桶、漏桶）、熔断（Hystrix/Sentinel 状态机 closed→open→half-open、错误率/慢调用触发、快速失败与降级兜底）、游戏后台限流特点（Tick 内 CD、玩家/账号/服/大区多层、按帧摊派与写队列削峰、开服排队机 + 平滑扩容）、互联网 vs 游戏本质差异（无状态可水平扩 vs 强状态世界耦合；I/O 密集 vs 计算密集）、限流后降级熔断兜底策略

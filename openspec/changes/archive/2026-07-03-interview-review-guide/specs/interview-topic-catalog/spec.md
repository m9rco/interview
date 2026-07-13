## ADDED Requirements

### Requirement: 首批七个专题目录

复习中心 MUST 涵盖以下 7 个专题（intro、business-proxy、xmesh-k8s、rate-limit、redis、k8s-network、agent-dev），且每个专题 MUST 满足其"关键知识点必含项"清单，作为内容验收的最低门槛。

#### Scenario: 全部 7 个专题都存在

- **WHEN** 检查 `THEMES` 数组
- **THEN** 数组恰好包含以下 7 个 `id`：`intro`、`business-proxy`、`xmesh-k8s`、`rate-limit`、`redis`、`k8s-network`、`agent-dev`

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

### Requirement: 内容组织的四段式结构

每个专题的详情内容 MUST 以"是什么 → 为什么这么选 → 踩过什么坑 → 怎么填的"四段式组织，与用户已有的桌面笔记语言对齐。

#### Scenario: 每份专题都有四段

- **WHEN** 用户浏览任一专题内容
- **THEN** 页面能明确识别到四个段落标题（"是什么"、"为什么这么选"、"踩过什么坑"、"怎么填的"）；即便某段内容较短或标注"待补充"，段落骨架也 MUST 保留

### Requirement: 内容来源可追溯

每个专题的独立分册末尾 MUST 提供"内容来源"区块，注明抽取自哪份桌面 Markdown 或哪些外部资料，以及抽取时间。

#### Scenario: 分册页脚有来源

- **WHEN** 用户滚动到任一独立分册页面底部
- **THEN** 存在一个"内容来源 / Sources"区块，包含至少一条可读的来源说明（如 `~/Desktop/01-业务代理模块技术演进.md` + 抽取日期）；对于 4 个新增专题（rate-limit、redis、k8s-network、agent-dev），来源说明标注"综合整理，请以官方文档为准"

# content-redundancy-policy（Delta）

冗余治理规范：为已识别的内容重叠簇确立"单一事实源 + 去重 + 双向交叉链接"的可验收规则，避免同一概念在多篇重复讲解、口径彼此冲突，降低复习跳读成本。

## ADDED Requirements

### Requirement: 单一事实源与交叉链接

对任一被多篇专题覆盖的概念，其详细讲解 MUST 只存在于一个"事实源"页面，其余页面 MUST 以交叉链接引用而非重复讲解；相关专题之间 MUST 建立双向可点击链接。

#### Scenario: 概念详解不重复

- **WHEN** 审阅任一被识别为重叠簇的专题组
- **THEN** 每个共享概念仅在其事实源页面展开，其他页面以"详见 [X]"链接引用，且链接双向可达

### Requirement: 限流三件套边界清晰

`rate-limit` / `token-leaky-bucket` / `ratelimit-circuitbreak` 三篇 MUST 划清职责且互不重复桶算法定义。

#### Scenario: 限流三件套去重

- **WHEN** 对比三篇内容
- **THEN** `token-leaky-bucket` 为令牌桶/漏桶算法唯一详解、`rate-limit` 为"互联网 vs 游戏"选型框架、`ratelimit-circuitbreak` 为熔断/降级韧性
- **AND** `rate-limit` 与 `ratelimit-circuitbreak` 不再重复展开桶算法定义，改为链接到 `token-leaky-bucket`

### Requirement: 服务网格口径统一

关于自研网格 nzmesh"是不是 gossip"的表述 MUST 在 `self-mesh-k8s` 与 `raft-gossip` 两篇之间保持一致，且实现代码 MUST 只在单一归属页展开。

#### Scenario: nzmesh 口径不冲突

- **WHEN** 对比 `self-mesh-k8s.md` 与 `raft-gossip.md` 对 nzmesh 的描述
- **THEN** 两篇统一表述为"全连接广播是 gossip 的一种特例（省去 incarnation/间接探测），而非'不是 gossip'"
- **AND** nzmesh 实现代码只在其中一篇展开，另一篇以链接引用

### Requirement: RAG 文件层级明确

`rag` / `rag-data-cleaning` / `rag-context-pruning` / `rag-storage-cleanup` 四篇 MUST 建立"主线枢纽 → 实现深潜 → 运维"的清晰层级并互链。

#### Scenario: RAG 四文件不重复且分层

- **WHEN** 从 `rag.md` 出发浏览四篇
- **THEN** `rag.md` 为主线枢纽并链接其余三篇；`rag-data-cleaning` 与主线 chunking 段落不重复讲解；`rag-context-pruning` 定位为实现级深潜；`rag-storage-cleanup` 定位为向量库运维/版本化

### Requirement: 已识别重叠簇的交叉链接

以下已识别簇 MUST 完成去重与双向交叉链接：`ebpf`↔`k8s-network`（eBPF 为何优于 iptables 仅一处）、`business-proxy`→`idempotency-design`（幂等四道闸改引用）、`tcp-net`/`lvs-epoll`/`os-zerocopy`（epoll/零拷贝详解单一归属）、`two-pointers-sliding-window`↔`internet/sliding-window`（同名异义消歧）、`backend-algorithms`↔`data-structures`（树家族归属消歧）。

#### Scenario: 各簇完成治理

- **WHEN** 审阅上述每个簇
- **THEN** 重复段落已收敛为单一事实源 + 链接引用，且相关专题之间存在双向可点击交叉链接

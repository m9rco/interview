---
title: 学习路径推荐
---

# 学习路径推荐

> 按面试目标选路径。每天 2 小时估算，顺序不能跳（后面依赖前面）。

---

## 路径 A：游戏后台基础架构

**目标岗位**：游戏基础架构、游戏引擎后台、游戏服务器框架  
**预计时长**：约 21 天（42 小时）

1. `data-structures` — 数据结构基础（2h）
2. `concurrency` — 并发与锁（3h）
3. `redis` — Redis 原理与实战（3h）
4. `http-tls-rpc` — 网络通信基础（2h）
5. `rate-limit` — 限流：互联网 vs 游戏（2h）
6. `ratelimit-circuitbreak` — 熔断降级（1.5h）
7. `consistent-hash-impl` — 一致性哈希实现（2h）
8. `reservoir-sampling` — 蓄水池抽样（1h）
9. `raft-gossip` — Raft & Gossip 共识（2h）
10. `k8s-network` — K8s 网络原理（2h）
11. `self-mesh-k8s` — 自研服务网格 + K8s 部署（3h）
12. `distributed-kv` — 分布式 KV 设计（2h）
13. `lockstep` — 帧同步原理（2h）
14. `stateful-migration` — 有状态服务迁移（1.5h）
15. `stateful-recovery` — 有状态服务恢复（1.5h）

::: tip 复习重点
路径 A 的核心考察：**分布式一致性 + 无锁/低锁并发 + 服务网格演进**。重点背清 xmesh 演进故事线和 consistent-hash 的具体实现细节。
:::

---

## 路径 B：互联网/智能硬件后台

**目标岗位**：互联网后台、智能硬件云端、通用服务端  
**预计时长**：约 18 天（36 小时）

1. `data-structures` — 数据结构基础（2h）
2. `concurrency` — 并发与锁（3h）
3. `http-tls-rpc` — 网络通信与 RPC（2h）
4. `tcp-net` — TCP 网络深度（2h）
5. `redis` — Redis 原理与实战（3h）
6. `mysql-innodb` — MySQL InnoDB（2h）
7. `message-queue` — 消息队列（2h）
8. `design-model` — 设计模式（1.5h）
9. `distributed-transaction` — 分布式事务（2h）
10. `rate-limit` — 限流方案（2h）
11. `lvs-epoll` — LVS + epoll 高性能 I/O（2h）
12. `os-zerocopy` — 零拷贝原理（1.5h）
13. `gc-stw` — GC 与 STW（1.5h）

::: tip 复习重点
路径 B 核心：**MySQL 锁与事务 + Redis 高可用 + 分布式一致性**。把 CAP/BASE/两阶段提交/TCC 讲清楚是必考项。
:::

---

## 路径 C：AI 工程方向

**目标岗位**：AI 后台工程、LLM 应用开发、RAG 系统  
**预计时长**：约 16 天（32 小时）

1. `data-structures` — 数据结构基础（2h）
2. `llm-fundamentals` — LLM 核心原理（3h）
3. `llm-inference-optimization` — 推理优化（2h）
4. `rag` — RAG 架构（2h）
5. `rag-data-cleaning` — RAG 数据清洗（1h）
6. `rag-context-pruning` — 上下文裁剪（1h）
7. `rag-storage-cleanup` — 存储清理策略（1h）
8. `agent-dev` — Agent 开发（2h）
9. `ai-eng-practices` — AI 工程实践（1.5h）
10. `redis` — Redis（向量/缓存场景）（2h）
11. `rate-limit` — 限流（LLM 接口保护）（1.5h）
12. `concurrency` — 并发（推理服务并发模型）（2h）

::: tip 复习重点
路径 C 核心：**Attention 机制 + KV Cache + RAG 全链路**。能画出 RAG 架构图并说清每个组件的取舍是加分项。
:::

---

## 路径 D：进阶游戏基础架构

**目标岗位**：资深游戏基础架构、平台/中间件、SRE 方向（在路径 A 之上的深水区）
**预计时长**：约 20 天（40 小时）
**前置**：先完成路径 A（本路径默认你已掌握 A 的分布式一致性与服务网格基础）

1. `access-gateway` — 接入网关与长连接（2h）
2. `message-bus` — 消息总线（2h）
3. `cni-plugins` — CNI 网络插件三流派（2h）
4. `ebpf` — eBPF 数据面（3h）
5. `mesh-central-vs-decentral` — 中心化 vs 去中心化网格（2h）
6. `mesh-istio-cilium` — Istio vs Cilium 网格落地（2h）
7. `config-hot-reload` — 配置热更新（1.5h）
8. `token-leaky-bucket` — 令牌桶与漏桶算法详解（2h）
9. `seckill` — 秒杀/抢购系统（2h）
10. `release-strategy` — 灰度/金丝雀/蓝绿发布（3h）
11. `cpp-coroutine` — C++ 协程（2.5h）
12. `llvm-compile` — LLVM 编译流程（2h）
13. `sanitizers` — Sanitizer 排查内存/并发问题（1.5h）

::: tip 复习重点
路径 D 核心：**网格数据面（eBPF/Sidecar 取舍）+ 发布策略 SOP + 高并发承载（秒杀/令牌桶）**。这是把路径 A 的"能讲清演进"升级到"能讲清取舍与事故"的深水区，面高级/资深岗必备。
:::

---

## 路径对比速览

| | 路径 A（游戏基础架构） | 路径 B（互联网后台） | 路径 C（AI 工程） | 路径 D（进阶游戏基础架构） |
|---|---|---|---|---|
| 天数 | ~21 天 | ~18 天 | ~16 天 | ~20 天 |
| 核心门槛 | 分布式 + 服务网格 | MySQL + 分布式事务 | Transformer + RAG | 网格数据面 + 发布策略 + 高并发承载 |
| 最难专题 | `self-mesh-k8s` | `distributed-transaction` | `llm-inference-optimization` | `ebpf` |
| 共同前置 | `data-structures` + `concurrency` + `redis` | ← 同 | ← 同 | 路径 A 全部 |

---

::: warning 依赖规则
路径中任意相邻 `A → B`，B 依赖 A。不要跳着学——跳过前置会让后面的专题读起来很痛苦。可参考[知识点依赖图](./dependency-map.md)。
:::

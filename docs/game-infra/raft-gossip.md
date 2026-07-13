---
title: Raft 与 Gossip：CP 强一致共识 vs AP 最终一致传播
---

# Raft 与 Gossip：CP 强一致共识 vs AP 最终一致传播

> 分布式系统里两类需求泾渭分明：**元数据/配置**要强一致（谁是 Leader、当前分片表是什么，读到旧值就出错），用 Raft；**集群成员/故障探测**要高可用且抗故障（哪些节点活着，允许短暂不一致），用 Gossip。前者是 CP，多数派提交、有单点式的 Leader；后者是 AP，无中心、随机传播、O(log N) 轮收敛。选错了，要么强一致的东西被 gossip 弄脏，要么成员发现被 Raft 的单点拖垮。

## 场景问题

自研游戏网格/集群管理里，有两组性质完全相反的状态：

- **要强一致的元数据**：分片路由表、配置版本、"哪个节点是某世界的主"。这类数据**读到旧值就会出事**（两个节点都以为自己是主 → 双写冲突 / 脑裂）。必须有**单一事实来源**、多数派确认后才算生效。
- **要高可用的成员视图**：集群里几千上万个节点，谁在线、谁挂了、谁的负载多少。这类数据**允许短暂不一致**（某节点挂了，30 秒内大家陆续知道即可），但**绝不能有单点**——成员发现服务自己挂了会导致全局瞎。

如果用一套协议硬扛两边：用 Raft 做成员发现，则 Leader 一挂、选举期间全集群成员视图冻结，且几千节点全连 Leader 上报心跳，Leader 连接数/写入被打爆；用 Gossip 存分片路由表，则传播期间不同节点看到不同的路由，请求被发错地方。所以工程上**分而治之**：Raft 管强一致元数据，Gossip 管最终一致成员。

## 实现方案

### Raft：Leader 选举 + 日志复制 + 安全性

Raft 把共识拆成三块：**Leader 选举**、**日志复制**、**安全性约束**。核心概念：

- **term（任期）**：逻辑时钟，单调递增。每次选举 term+1，用来识别过期 Leader。
- **三种角色**：Follower（被动）、Candidate（拉票中）、Leader（唯一写入口）。
- **两个超时**：选举超时（Follower 多久没收到心跳就发起选举，随机化以避免同时开选）、心跳间隔（Leader 定期发 heartbeat 维持权威）。
- **多数派提交**：一条日志被复制到多数派（N/2+1）节点后才 commit，保证已提交的日志在任何后续 Leader 上都存在。

#### 选举状态机

```mermaid
stateDiagram-v2
    [*] --> Follower
    Follower --> Candidate: 选举超时<br/>(没收到 Leader 心跳)
    Candidate --> Candidate: 选票未过半<br/>term+1 重新选举
    Candidate --> Leader: 获得多数派选票
    Candidate --> Follower: 发现更高 term 的 Leader/投票
    Leader --> Follower: 发现更高 term<br/>(自己已过期)
    Leader --> Leader: 定期发心跳<br/>维持权威
```

#### 选举伪码

```text
// 每个节点的主循环
loop forever:
    switch state:
    case Follower:
        if 在 electionTimeout(随机 150~300ms) 内没收到 Leader 心跳 或 合法投票请求:
            转为 Candidate

    case Candidate:
        currentTerm += 1
        votedFor = self
        votesGranted = 1
        重置随机 electionTimeout
        向所有其他节点并行发送 RequestVote(term, lastLogIndex, lastLogTerm)
        收集响应:
            if 对方 term > currentTerm: 转 Follower, 更新 term  // 发现更新的任期
            if 得到多数派选票 (votesGranted > N/2): 转 Leader
            if electionTimeout 到期仍未过半: 保持 Candidate, 重新选举 (term 再 +1)

    case Leader:
        周期性向所有 Follower 发 AppendEntries(心跳 / 携带日志)
        if 收到更高 term 的消息: 转 Follower  // 网络分区愈合，旧 Leader 退位

// 投票方处理 RequestVote：
on RequestVote(term, candidateId, lastLogIndex, lastLogTerm):
    if term < currentTerm: 拒绝                          // 过期请求
    if term > currentTerm: currentTerm = term; votedFor = null; 转 Follower
    // 安全性：只投给日志"至少和自己一样新"的候选者
    logOk = (lastLogTerm > myLastLogTerm) ||
            (lastLogTerm == myLastLogTerm && lastLogIndex >= myLastLogIndex)
    if (votedFor == null || votedFor == candidateId) && logOk:
        votedFor = candidateId; 授予选票; 重置 electionTimeout
    else: 拒绝
```

#### 日志复制伪码

```text
// 客户端写请求只能到 Leader
on ClientWrite(cmd):
    log.append({term: currentTerm, cmd})
    // 并行复制给所有 Follower
    for each follower:
        AppendEntries(prevLogIndex, prevLogTerm, entries[], leaderCommit)
    // 当某 index 被多数派确认，推进 commitIndex
    if 某条目已复制到多数派节点:
        commitIndex = 该 index
        apply 到状态机, 回复客户端

on AppendEntries(term, prevLogIndex, prevLogTerm, entries, leaderCommit):
    if term < currentTerm: 拒绝  // 过期 Leader
    if 本地 log[prevLogIndex].term != prevLogTerm: 拒绝  // 日志不匹配 → Leader 回退重试
    删除冲突条目并追加 entries
    if leaderCommit > commitIndex: commitIndex = min(leaderCommit, 最后新条目 index)
    重置 electionTimeout  // 收到合法心跳
```

::: warning
**脑裂处理**靠 term + 多数派：网络分区时，少数派那边即使选出"Leader"也拿不到多数派选票、无法 commit 任何日志；分区愈合后，它一看到更高 term 立刻退位为 Follower，其未提交的日志被覆盖。**任何时刻至多一个 Leader 能提交日志**，这是 Raft 不脑裂的根本。
:::

### Gossip：最终一致的成员传播（SI / SIR 传染模型）

Gossip（流行病/传染病模型）：每个节点**周期性随机挑几个 peer**，交换各自的成员状态（谁在线、版本号、心跳计数），像病毒一样扩散。收敛速度 **O(log N) 轮**——一轮翻几倍，几千节点几秒内全知道。没有中心节点，任何节点挂了不影响传播，天然抗故障。

传染模型：
- **SI（Susceptible-Infected）**：知道消息的节点持续传播，最终全体感染（简单但网络流量不收敛）。
- **SIR（Susceptible-Infected-Removed）**：节点传播一段时间后转为"移除"（不再主动传该消息），限制流量放大，实际系统（Serf）用这类反熵 + 有限次传播。

```mermaid
graph LR
    subgraph 第0轮
        A0["A(已知)"]
    end
    subgraph 第1轮
        A0 -->|随机选 fanout=2| B1["B"]
        A0 --> C1["C"]
    end
    subgraph round2["第2轮 已知节点各自再传"]
        B1 --> D2["D"]
        B1 --> E2["E"]
        C1 --> F2["F"]
        C1 --> G2["G"]
    end
    N["每轮已知数近似翻倍 → O(log N) 轮全收敛<br/>无中心, 任一节点挂了不影响"]
```

#### Gossip 伪码（含故障探测）

```text
// 每个节点维护 members: {id -> {state: alive/suspect/dead, incarnation: 版本号, heartbeat}}

// 传播循环：每 gossipInterval(如 200ms) 一次
loop:
    peers = 从存活成员里随机选 fanout 个 (如 3 个)
    for p in peers:
        向 p 发送 (我的 members 摘要)          // push-pull / 反熵
        收到 p 的 members, 逐条 merge:
            if 对方 incarnation > 本地: 采纳对方状态  // 版本新者胜
            if 状态冲突(我说 alive, 它说 suspect): 用更高 incarnation 裁决

// 故障探测(SWIM 风格)：直接探测 + 间接探测降误判
loop probeInterval:
    t = 随机选一个成员
    发 ping(t); 若 ackTimeout 内无 ack:
        向 k 个其他成员请求 "帮我 ping t" (indirect ping)  // 排除自身网络抖动
        若都无 ack: 标 t 为 suspect, 通过 gossip 广播
    被标 suspect 的节点若自己还活着, 会广播更高 incarnation 的 alive 反驳(自我澄清)
    suspect 超时未澄清 → 标 dead
```

::: tip
Gossip 的收敛是**概率性 O(log N) 轮**而非确定性：fanout=3、几千节点时，几秒内几乎必然全收敛。SWIM 的"间接探测 + 自我澄清（incarnation 反驳）"是降低误判的关键——避免一次网络抖动就把好节点判死。Serf、Redis Cluster、Cassandra、HashiCorp Consul 的成员层都是这套。
:::

## 为什么这么做

**CP vs AP，用 CAP 视角看两者定位：**

| 维度 | Raft (CP) | Gossip (AP) |
|---|---|---|
| 一致性 | **强一致**（线性一致，多数派提交） | **最终一致**（收敛后一致） |
| 可用性 | 选举期间短暂不可写；需多数派存活 | **始终可用**，无单点 |
| 中心 | 有 Leader（写单点，读可扩） | **完全去中心** |
| 规模 | 受 Leader 连接/复制吞吐限制（通常 3~7 节点核心组） | 上万节点（流量 O(fanout)/节点） |
| 收敛/延迟 | 提交延迟 = 一次多数派 RTT | O(log N) 轮，秒级 |
| 用途 | 元数据/配置/KV 强一致（etcd、ZooKeeper 类、分片表、Leader 选主） | 成员发现、故障探测、状态传播（Serf、Redis Cluster、Cassandra） |

- **为什么元数据用 Raft**：分片路由表、"谁是主"这类数据**读到旧值即错**，必须线性一致 + 单一提交点。Raft 的多数派提交 + term 保证"已提交的永不丢、任意时刻至多一主"，正是元数据要的。etcd（K8s 的大脑）就是 Raft。
- **为什么成员发现用 Gossip**：几千上万节点的存活视图，用不着强一致（晚几秒知道某节点挂了可接受），但**绝不能有单点**且**流量不能集中**。Gossip 去中心、O(log N) 收敛、每节点只跟少数 peer 通信（流量 O(fanout)），完美契合。
- **两者配合**：自研网格常见架构是——**Gossip 层维护"谁在线"的成员视图（AP，抗故障）**，**Raft 组维护"分片怎么分、配置版本"的强一致元数据（CP）**，Raft 组的成员本身也可由 Gossip 层发现。各司其职。

## 为什么别的选择不行

- **用 Raft 做成员发现**：几千节点全向 Leader 上报心跳，Leader 连接数/写入被打爆；Leader 一挂，选举期间全局成员视图冻结。规模和可用性都不匹配。
- **用 Gossip 存强一致元数据**：传播期间不同节点看到不同版本的路由表，请求被发错节点、双主并存。Gossip 只保证**最终**一致，中间态不可靠，强一致数据绝不能用。
- **中心化注册中心（单 master）做成员**：单点故障 = 全局瞎；连接数随节点数线性增长，扩展瓶颈明显。Gossip 去中心正是为此。
- **两阶段提交（2PC）替代 Raft**：2PC 协调者单点、阻塞、无容错（协调者挂在提交中会阻塞参与者）。Raft 用多数派 + 选举解决了容错，是共识的正解。
- **只用一套协议统一两边**：如上所述，CP 和 AP 的取舍相反，硬用一套必然在另一边出问题。**分而治之**是唯一对的选择。

## 沉淀结论

- **Raft = CP 强一致共识**：Leader 选举（term + 随机选举超时 + 多数派选票）+ 日志复制（多数派提交）+ 安全性（只投日志更新者、任意时刻至多一主）。用于**元数据/配置/KV**，代表 etcd。
- **Gossip = AP 最终一致传播**：周期随机选 peer 交换状态，SI/SIR 传染模型，O(log N) 轮收敛，无单点抗故障；SWIM 的间接探测 + incarnation 自我澄清降误判。用于**成员发现/故障探测**，代表 Serf/Redis Cluster/Cassandra。
- **选型分界**：读到旧值就出错的 → Raft；允许短暂不一致但要抗故障、大规模的 → Gossip。
- 一句话：**元数据一致用 Raft，成员发现用 Gossip，二者配合而非二选一。**

## 内容来源

综合整理。参考论文与资料：Ongaro & Ousterhout "In Search of an Understandable Consensus Algorithm (Raft)"（USENIX ATC 2014）及 raft.github.io、Das et al. "SWIM: Scalable Weakly-consistent Infection-style Process Group Membership Protocol"（DSN 2002）、Demers et al. "Epidemic Algorithms for Replicated Database Maintenance"（PODC 1987），以及 etcd/Raft、HashiCorp Serf/Consul memberlist、Redis Cluster、Cassandra gossip 的实现文档。

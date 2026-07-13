## ADDED Requirements

### Requirement: 游戏业务实现域专题目录

`docs/game-biz/` 域 MUST 至少涵盖以下专题，每个专题 MUST 满足其"必含知识点"清单作为内容验收门槛，并以五段式组织。

#### Scenario: 域内专题齐备

- **WHEN** 检查 `docs/game-biz/` 目录
- **THEN** 至少存在以下专题：`activity-framework`（多模板活动框架）、`idempotency-design`（业务幂等性）、`redis-room-recommend`（Redis 房间推荐列表）、`game-vs-internet`（游戏与互联网后台本质差异）

### Requirement: activity-framework 专题内容完整

`activity-framework` 专题 MUST 覆盖多模板游戏活动框架的设计。

#### Scenario: activity-framework 必含项

- **WHEN** 打开 activity-framework 专题
- **THEN** 内容至少包含：活动框架的诉求（大量同质活动——签到/累充/兑换/排行/任务——快速配置上线、策划可配、复用领奖与进度逻辑）、抽象设计（活动模板/实例、条件-进度-奖励三段抽象、时间窗与开关、状态机 未开始/进行中/已结束/已领取）、配置驱动（模板 + 参数化配置热刷）、通用能力下沉（进度累积、幂等发奖、防重复领取、断点续发）、多模板扩展点（策略模式/插件注册新玩法而不改核心）、为什么用框架而非每个活动单写（避免重复造轮子与发奖事故）、为什么用配置 + 模板而非硬编码、含活动状态机 Mermaid 图与核心接口代码

### Requirement: idempotency-design 专题内容完整

`idempotency-design` 专题 MUST 覆盖业务幂等性设计。

#### Scenario: idempotency-design 必含项

- **WHEN** 打开 idempotency-design 专题
- **THEN** 内容至少包含：为什么需要幂等（网络重试、消息重投、用户重复点击、超时补偿导致的重复请求）、幂等键设计（业务唯一键/请求 ID/订单号）、实现方案（唯一索引防重、Redis SETNX 去重令牌、状态机 + CAS 只允许合法流转、去重表 + 事务）、发奖/扣费/支付回调的幂等（先查后写有并发窗口、需原子或加锁）、令牌桶式幂等令牌（先申请 token 再提交）、与"恰好一次"语义的关系（至少一次 + 幂等 = 效果恰好一次）、为什么不能只靠前端防重、含代码与流程图

### Requirement: redis-room-recommend 专题内容完整

`redis-room-recommend` 专题 MUST 覆盖用 Redis 实现房间推荐列表。

#### Scenario: redis-room-recommend 必含项

- **WHEN** 打开 redis-room-recommend 专题
- **THEN** 内容至少包含：需求（实时展示可加入房间、按热度/匹配度/新鲜度排序、高频读写、房间秒级增删与人数变化）、数据结构选型（ZSet 按分值排序 + 分页 ZREVRANGE、Hash 存房间详情、分值融合热度/时间衰减/匹配度）、实时更新（房间人数变化更新 score、过期房间清理 TTL/定时扫、满员/关闭即删）、分页与翻页一致性、避免大 key 与热点、按分区/模式分桶、为什么用 ZSet 而非 DB order by（内存排序 O(log N) 写、抗高并发读）、为什么要做分值衰减、含 Redis 命令与代码

### Requirement: game-vs-internet 专题内容完整

`game-vs-internet` 专题 MUST 覆盖游戏后台与互联网后台的本质差异。

#### Scenario: game-vs-internet 必含项

- **WHEN** 打开 game-vs-internet 专题
- **THEN** 内容至少包含：状态模型（游戏强状态长连接有世界状态 vs 互联网多为无状态短请求可水平扩）、并发模型（游戏单线程无锁按 Tick 驱动/单区单进程 vs 互联网多线程/多协程无共享横向扩）、计算特征（游戏计算密集 + 实时性/帧驱动 vs 互联网 I/O 密集）、一致性与容错（游戏内存态需 checkpoint 恢复、单点故障影响一整区 vs 互联网无状态副本自愈）、扩缩容（游戏有状态迁移难、按区/世界切分 vs 互联网自动弹性）、限流与发布（游戏按区/UID 灰度、DS preStop vs 互联网流量权重灰度）、为什么这些差异导致两套技术栈难以直接复用、对架构选型的指导意义

# interview-topic-catalog（Delta）

本 delta 修正规范与线上现实、与结构门禁三方漂移：由"13 专题 + 四段式"更新为真实的多域约 45 专题 + 五段式，并补充体量失衡专题的治理验收项。首批 13 专题的既有必含项清单保持有效，不在此重复。

## MODIFIED Requirements

### Requirement: 专题目录

复习中心 MUST 覆盖 6 个内容域，每个域下的每个专题 MUST 满足"关键知识点必含项"清单，作为内容验收的最低门槛。首批 13 个专题（`intro`、`business-proxy`、`xmesh-k8s`/`self-mesh-k8s`、`rate-limit`、`redis`、`k8s-network`、`agent-dev`、`concurrency`、`tcp-net`、`gc-stw`、`algo-ds`、`design-model`、`release-strategy`）的必含项清单持续有效；`agent-dev` 已迁入 `/ai-llm/` 域（见 `ai-llm-catalog`）。

#### Scenario: 六大域齐备且专题接入导航

- **WHEN** 检查 `docs/` 目录与 `docs/.vuepress/configs/sidebar.js`
- **THEN** 存在 6 个内容域：`algo`、`common`、`internet`、`game-infra`、`game-biz`、`ai-llm`
- **AND** 每个域下的每个专题 `.md` 均出现在侧边栏，且被 `docs/intro/dependency-map.md` 收录（无孤儿专题）
- **AND** 每个专题配套一份同名 `.cards.md` 间隔复习闪卡

#### Scenario: 首批 13 专题必含项不减

- **WHEN** 检查首批 13 个专题
- **THEN** 每个专题仍满足其在本规范中定义的关键知识点必含项清单

## REMOVED Requirements

### Requirement: 内容组织的四段式结构

**Reason**: 线上站点已统一为五段式（场景问题 → 实现方案 → 为什么这么做 → 为什么别的选择不行 → 沉淀结论），且 `scripts/check-structure.js` 门禁强制的即为五段式；旧的四段式（是什么 → 为什么这么选 → 踩过什么坑 → 怎么填的）与现实和门禁均不一致，属规范漂移。
**Migration**: 见新增的「内容组织的五段式结构」要求；所有专题已按五段式组织并通过 `npm run check:structure`。

## ADDED Requirements

### Requirement: 内容组织的五段式结构

每个专题的详情内容 MUST 以"场景问题 → 实现方案 → 为什么这么做 → 为什么别的选择不行 → 沉淀结论"五段式组织，并包含"一句话结论"callout 与"记忆口诀"小节，与 `scripts/check-structure.js` 门禁保持一致。

#### Scenario: 每份专题都通过结构门禁

- **WHEN** 运行 `npm run check:structure`
- **THEN** 除显式豁免的叙事页（如 `self-intro-narrative.md`）外，所有专题页面均命中五个锚点标题（`## 场景问题`、`## 实现方案`、`## 为什么这么做`、`## 为什么别的选择不行`、`## 沉淀结论`）、一句话结论 callout、`### 记忆口诀` 小节
- **AND** 门禁退出码为 0

### Requirement: 体量失衡专题的治理

超长的 catch-all 或塞入正交主题的专题 MUST 被拆分或瘦身，使单篇聚焦单一可面试叙述。

#### Scenario: reservoir-sampling 回归抽样本身

- **WHEN** 打开 `docs/game-infra/reservoir-sampling.md`
- **THEN** 其内容聚焦蓄水池抽样（Algorithm R、A-Res 加权、概率证明、在 self-mesh 选 peer 的应用）
- **AND** 时序异常检测（EWMA/ARIMA/滑窗）已迁出到独立专题 `time-series-anomaly-detection` 并被两侧交叉链接

#### Scenario: ai-eng-practices 去理论化并可导航

- **WHEN** 打开 `docs/ai-llm/ai-eng-practices.md`
- **THEN** 顶部存在目录/决策树，便于跳读
- **AND** 已在 `llm-fundamentals`/`agent-dev`/`rag` 中讲过的基础理论以交叉链接替代重复讲解
- **AND** 文档定位收敛为"企业级 AI 研发工程化落地"，不再重复教授 LLM/Agent 基础

### Requirement: common 域补齐可观测性

`common` 域 MUST 新增 `observability` 专题，收拢此前散落在 10+ 文件的可观测性内容为单一事实源。

#### Scenario: observability 必含项

- **WHEN** 打开 `docs/common/observability.md`
- **THEN** 内容至少包含：三支柱（Metrics/Logs/Traces）与关系、分布式链路追踪（trace/span、上下文传播、关联 ID、采样策略 head/tail）、指标方法论（RED/USE、P99 与直方图/分位数陷阱）、结构化日志与跨服务关联、OpenTelemetry 标准与主流后端（Prometheus/Jaeger），并给出"线上延迟突刺如何定位"的排障叙述

### Requirement: game-biz 域补齐高频考点

`game-biz` 域 MUST 新增 `anti-cheat` 与 `economy-progression` 两个专题。

#### Scenario: anti-cheat 必含项

- **WHEN** 打开 `docs/game-biz/anti-cheat.md`
- **THEN** 内容至少包含：服务端权威原则与客户端/服务端信任边界、常见作弊类型（内存修改/加速/自动化/协议重放）与对应检测信号、遥测与异常评分、分布式校验（不逐服务查询的批量/异步校验）、封禁与申诉闭环，并与 `idempotency-design`/`business-proxy` 交叉链接

#### Scenario: economy-progression 必含项

- **WHEN** 打开 `docs/game-biz/economy-progression.md`
- **THEN** 内容至少包含：软/硬货币与资源回收（sink/source 平衡）、成长曲线与等级/战令、赛季软重置 vs 硬重置、通胀与定价、免费/付费平衡，并与 `gacha`/`activity-framework` 交叉链接

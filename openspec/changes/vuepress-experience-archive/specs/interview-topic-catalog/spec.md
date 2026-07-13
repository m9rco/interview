## MODIFIED Requirements

### Requirement: 专题目录

复习中心 MUST 涵盖原有 13 个专题（内容无损迁移到 Markdown），且专题目录 MUST 随三大域的新内容目录（`internet-backend-catalog`、`game-infra-catalog`、`game-business-catalog`）共同演进——不再固定为 13 项，但原 13 项 MUST 全部保留且各自满足其"关键知识点必含项"清单，作为内容验收的最低门槛。

#### Scenario: 原 13 个专题全部保留

- **WHEN** 检查新站点内容
- **THEN** 以下 13 个专题均有对应 Markdown 承接：`intro`、`business-proxy`、`xmesh-k8s`、`rate-limit`、`redis`、`k8s-network`、`agent-dev`、`concurrency`、`tcp-net`、`gc-stw`、`algo-ds`、`design-model`、`release-strategy`

#### Scenario: 目录随新域扩展

- **WHEN** 三大域按各自 catalog spec 补齐新专题
- **THEN** 新专题与原 13 专题并存于站点，专题总数随内容演进增长，无需修改本 spec 的原 13 项要求

### Requirement: 内容组织的五段式结构

每个专题的详情内容 MUST 以"场景问题 → 实现方案 → 为什么这么做 → 为什么别的选择不行 → 沉淀结论"五段式组织，以对齐"归档 + 复习"的目标：把"为什么别的选择不行"独立成段，强化反选沉淀。原有的桌面笔记四段式内容在迁移时 MUST 无损并入五段式对应段落。

#### Scenario: 每份专题都有五段

- **WHEN** 用户浏览任一专题内容
- **THEN** 页面能明确识别到五个段落标题（场景问题/实现方案/为什么这么做/为什么别的选择不行/沉淀结论）；即便某段内容较短或标注"待补充"，段落骨架也 MUST 保留

#### Scenario: 四段式内容无损并入

- **WHEN** 迁移旧专题（其内容原按"是什么/为什么这么选/踩过什么坑/怎么填的"组织）
- **THEN** 旧四段内容分别并入新五段（是什么→场景问题/实现方案；为什么这么选→为什么这么做；踩过什么坑→沉淀结论或为什么别的选择不行；怎么填的→实现方案/沉淀结论），无信息丢失

### Requirement: 内容来源可追溯

每个专题页面 MUST 提供"内容来源"区块，注明抽取自哪份桌面 Markdown、旧 `guide/` 专题，或哪些外部资料，以及抽取/整理时间。

#### Scenario: 专题页脚有来源

- **WHEN** 用户滚动到任一专题页面底部
- **THEN** 存在"内容来源 / Sources"区块，至少一条可读来源说明；迁移自旧 guide 的专题注明"迁移自 guide/theme-<slug>"，综合整理的新专题标注"综合整理"及主要参考出处

# content-narrative-style

## Purpose

全站专题内容的**叙事化与可记忆化风格规范**：在保留 `memory-system` 规范定义的现有五段式骨架（`::: tip 一句话结论` → 场景问题 → 实现方案 → 为什么这么做 → 为什么别的选择不行 → 沉淀结论 → `### 记忆口诀`）与技术正确性的前提下，定义每个专题正文 MUST 补齐/提质的三类可记忆化元素（叙事钩子、幽默类比、记忆锚点）及其红线约束。本规范为附加内容质量门槛，与 `memory-system`、`content-redundancy-policy`、`content-privacy-policy`、`interview-topic-catalog`、`interview-review-hub` 协同，不改动后者的既有需求（尤其不改动五段式结构本身，只提升其可读性与记忆友好度）。

> 实现约定：配套 `.cards.md` 由 `scripts/generate-cards.mjs` 从源 `.md` 的 `### 记忆口诀` 段与 `## 自测` 的 `<details>` 块**自动生成**，MUST NOT 手工编辑；正文与闪卡的对齐通过"改源 `.md` 后运行 `npm run generate:cards`"保证。

## ADDED Requirements

### Requirement: 叙事钩子开篇

每个专题正文 MUST 在开篇（H1 之后的首个 `>` 引导段或"场景问题"节首）用一句话场景、冲突或反差把读者拉入问题，而非直接罗列定义。钩子 MUST 与该专题真实技术主题一致，不得为博眼球而失真。

#### Scenario: 开篇是场景而非定义

- **WHEN** 打开任一专题 `.md`，阅读 H1 之后的首段
- **THEN** 首段呈现一个具体场景/冲突/反差（"读到旧值就出错的元数据…"式），点出"为什么要关心这个问题"
- **AND** 未以"XX 是一种…"式的裸定义开篇

#### Scenario: 钩子不失真

- **WHEN** 对照钩子与正文技术内容
- **THEN** 钩子描述的场景与专题真实解决的问题一致，无夸大或误导性表述

### Requirement: 幽默类比锚定核心机制

每个专题 MUST 为其最枯燥/最难理解的 1 个核心机制提供一个贴切、易懂、带轻松笔触的生活化类比，且类比后 MUST 紧跟"类比在哪失效"的一句话边界说明，防止读者把类比当事实。

#### Scenario: 核心机制有类比

- **WHEN** 审阅专题正文中讲解核心难点机制的段落
- **THEN** 存在至少一个生活化类比（形如"把 X 想成 Y"），帮助建立直觉
- **AND** 类比不替代技术定义，而是与技术定义并存

#### Scenario: 类比标注失效边界

- **WHEN** 阅读任一类比之后紧邻的内容
- **THEN** 有一句话点明该类比在何处与真实机制不符（"但真实的 X 并不…"），避免读者被类比误导

### Requirement: 记忆锚点与闪卡对齐

每个专题 MUST 拥有一处可背诵的记忆锚点，承载于 `memory-system` 已强制的 `### 记忆口诀` 段（并可辅以顶部 `::: tip 一句话结论`），且 MUST 通过重新生成而非手工编辑来保证配套 `.cards.md` 与之一致。

#### Scenario: 记忆口诀段可背诵

- **WHEN** 打开专题 `.md` 的 `### 记忆口诀` 段
- **THEN** 内容为一句/一组可背诵的浓缩表达（口诀/顺口溜/谐音/首字母串），而非正文段落的复制粘贴

#### Scenario: 闪卡经再生成与正文一致

- **WHEN** 修改专题 `.md` 的 `### 记忆口诀` 或 `## 自测` 后运行 `npm run generate:cards`
- **THEN** 同名 `.cards.md` 的"记忆口诀"段与 Q/A 卡由源 `.md` 重新生成，与正文语义一致
- **AND** `.cards.md` 未被手工直接编辑（其内容完全可由源 `.md` 复现）

### Requirement: 润色红线约束

叙事化润色 MUST 是纯增量的可读性增强，不得触碰以下红线：技术正确性、知识点完整性、内容去重、隐私、构建健康。

#### Scenario: 不牺牲技术正确性与知识点

- **WHEN** 对比润色前后的专题内容
- **THEN** 无新增技术错误，且 `interview-topic-catalog` 对该专题定义的关键知识点必含项一项不减

#### Scenario: 不制造冗余、不泄隐私

- **WHEN** 审阅润色引入的类比/钩子/锚点
- **THEN** 未在非事实源页面重复展开他页已详解的概念（遵循 `content-redundancy-policy`）
- **AND** 未引入违反 `content-privacy-policy` 的真实姓名/内部标识等敏感信息

#### Scenario: 不破坏构建

- **WHEN** 润色改动 markdown 后运行站点构建与现有 lint 门禁
- **THEN** VuePress 构建通过，`:::` 容器与 `<details>` 缩进块级 HTML 未被破坏（不触发 CI 缩进 lint 失败）

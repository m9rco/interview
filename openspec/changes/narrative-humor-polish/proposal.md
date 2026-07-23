## Why

现有专题技术密度高、正确性强，但相当一部分内容是"教科书式陈述"——协议、算法、坑点堆在一起，读起来枯燥、难以在脑内建立画面感，面试临场也不容易调取。人对**故事、类比、反差和笑点**的记忆远强于对定义清单的记忆。给全部专题补一层"叙事化 + 幽默风趣 + 记忆锚点"的润色，能在**不牺牲技术正确性**的前提下，把"看得懂"提升为"记得住、讲得出"。

## What Changes

- 新增一套**叙事化内容风格规范**，定义每个专题在保留现有四段式（是什么→为什么这么选→踩过什么坑→怎么填的）与技术正确性的前提下，MUST 补齐的三类可记忆化元素：
  - **叙事钩子**：开篇用一句话场景/冲突/反差把读者拉进来（而非直接甩定义）。
  - **幽默类比**：对枯燥难懂的核心机制，给一个贴切、好笑、不失真的生活化类比（"把 Raft 想成…"）。
  - **记忆锚点**：一句可背诵的口诀/顺口溜/谐音，与 `.cards.md` 的记忆口诀对齐。
- 将该规范**逐域应用到全部 6 个内容域**（`algo`、`common`、`internet`、`game-infra`、`game-biz`、`ai-llm`）的所有专题及其配套 `.cards.md`。
- 明确**红线约束**：润色不得引入技术错误、不得稀释关键知识点（`interview-topic-catalog` 必含项不减）、不得违反 `content-redundancy-policy`（不制造重复讲解）与 `content-privacy-policy`。
- 非目标：不新增专题、不改站点结构/构建/侧边栏、不改四段式骨架。

## Capabilities

### New Capabilities
- `content-narrative-style`: 定义专题正文与闪卡的叙事化、幽默类比、记忆锚点三类可记忆化元素的必含项与验收标准，以及"不牺牲正确性/不减知识点/不制造冗余"的红线约束。

### Modified Capabilities
<!-- 无 spec 级需求变更：本规范为附加内容质量约束，不改动 topic-catalog 必含项、redundancy/privacy 现有需求，仅与之协同。 -->

## Impact

- **内容**：`docs/{algo,common,internet,game-infra,game-biz,ai-llm}/*.md` 全部专题正文，及其同名 `.cards.md` 闪卡的记忆口诀段。
- **规范**：新增 `openspec/specs/content-narrative-style/spec.md`；与 `content-redundancy-policy`、`content-privacy-policy`、`interview-topic-catalog`、`interview-review-hub` 协同（后者的四段式渲染约束不变）。
- **构建**：无代码/构建变更；沿用现有 VuePress markdown 与 `.githooks`/CI 的缩进块级 HTML lint 门禁，润色时须避免破坏 `:::` 容器与 `<details>` 缩进。

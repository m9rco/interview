## Why

复习中心目前只有一篇 `agent-dev.md`（且挂在"游戏业务"域下），缺少**大语言模型核心原理**与 **RAG** 两大高频面试主题；而 Agent、RAG、LLM 三者本属同一知识域，散落各处既不成体系、也难以在面试前快速拾起。随着这一年 AI/大模型岗位与"传统后台 + 大模型应用"复合岗的面试比重上升，需要把这三块补齐并归拢成独立域。

## What Changes

- 新增独立域 **AI / 大模型**（`/ai-llm/`），在导航栏与侧边栏中作为与"互联网后台 / 游戏基础架构 / 游戏业务 / 通用基础"并列的一域。
- 新增三个专题（沿用站点五段式：场景问题 → 实现方案 → 为什么这么做 → 为什么别的选择不行 → 沉淀结论，且每篇至少一段代码 + 一张 Mermaid 图）：
  - `llm-fundamentals`：**大模型核心原理**——Transformer / Self-Attention、位置编码、Tokenization/BPE、预训练目标与 Scaling Law、解码采样策略、涌现与对齐概览。
  - `llm-inference-optimization`：**推理与微调优化**——KV Cache、FlashAttention、PagedAttention/vLLM、Continuous Batching、量化（GPTQ/AWQ/INT8）、投机解码、MoE，以及 LoRA/QLoRA、RLHF/DPO、蒸馏等训练侧优化。
  - `rag`：**RAG 核心原理与优化**——Embedding、Chunking 策略、向量索引（HNSW/IVF-PQ）、混合检索（BM25 + 向量）、Rerank、Query 改写/HyDE、多路召回、评测（RAGAS/命中率）与幻觉抑制。
- 将现有 `agent-dev.md` 从 `/game-biz/` **迁移**至 `/ai-llm/`（内容保留，必要时补齐与新专题的交叉引用），使 Agent 与 RAG/LLM 同域。
- 相应更新 VuePress 导航栏（`navbar.js`）与侧边栏（`sidebar.js`），并在首页 `docs/README.md` 的"三大域"介绍中加入 AI / 大模型域。

## Capabilities

### New Capabilities
- `ai-llm-catalog`: AI / 大模型域的**内容目录规范**——为该域每个专题（`llm-fundamentals`、`llm-inference-optimization`、`rag`、`agent-dev`）定义"必含知识点"验收清单，作为内容验收的最低门槛。

### Modified Capabilities
<!-- agent-dev 仅发生域间位置迁移，其必含知识点要求不变；新域拥有独立的 ai-llm-catalog spec，故 interview-topic-catalog / vuepress-archive-site 的既有 requirement 不发生变更。 -->

## Impact

- **新增**：`docs/ai-llm/README.md`、`docs/ai-llm/llm-fundamentals.md`、`docs/ai-llm/llm-inference-optimization.md`、`docs/ai-llm/rag.md`。
- **迁移**：`docs/game-biz/agent-dev.md` → `docs/ai-llm/agent-dev.md`（同时从 game-biz 侧边栏移除、加入 ai-llm 侧边栏）。
- **修改**：`docs/.vuepress/configs/navbar.js`、`docs/.vuepress/configs/sidebar.js`、`docs/README.md`（首页三大域→四大域介绍）、`docs/game-biz/README.md`（若引用 agent-dev 链接需同步）。
- **规范**：新增 1 份 spec（`ai-llm-catalog`）。
- **风险**：迁移 `agent-dev.md` 会改变其 URL 路径（`/game-biz/agent-dev` → `/ai-llm/agent-dev`），需检查站内是否有硬编码链接指向旧路径。

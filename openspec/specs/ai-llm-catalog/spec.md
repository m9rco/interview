# ai-llm-catalog

## Purpose

AI / 大模型域（`/ai-llm/`）的**内容目录规范**：为该域每个专题定义"关键知识点必含项"清单，作为内容验收的最低门槛。规范沿用站点统一的五段式组织（场景问题 → 实现方案 → 为什么这么做 → 为什么别的选择不行 → 沉淀结论），并要求每个专题至少一段贴近真实/可运行的代码与一张 Mermaid 图。首批覆盖 4 个专题：`llm-fundamentals`、`llm-inference-optimization`、`rag`、`agent-dev`（后者由 `game-biz` 域迁入）。

## Requirements

### Requirement: AI / 大模型域专题目录

复习中心 MUST 在独立的 `/ai-llm/` 域下涵盖以下 4 个专题，且每个专题 MUST 满足其"关键知识点必含项"清单。该域 MUST 作为一级导航项出现在导航栏与侧边栏，与其他域并列。

#### Scenario: 全部 4 个专题都存在且可导航

- **WHEN** 打开站点导航栏与 `/ai-llm/` 侧边栏
- **THEN** 存在名为"AI / 大模型"（或等义）的一级导航域
- **AND** 该域侧边栏包含 4 个专题：`llm-fundamentals`、`llm-inference-optimization`、`rag`、`agent-dev`
- **AND** 每个专题页面均按五段式组织，且至少含一段代码与一张 Mermaid 图

### Requirement: llm-fundamentals 专题内容完整

`llm-fundamentals` 专题 MUST 覆盖大语言模型的核心原理，讲清"为什么 Transformer 能取代 RNN、注意力到底算什么、模型如何生成下一个 token"。

#### Scenario: llm-fundamentals 必含项

- **WHEN** 打开 `llm-fundamentals` 内容
- **THEN** 内容至少包含：Transformer 整体结构（Encoder/Decoder、Decoder-only 主流化原因）、Self-Attention 计算（Q/K/V、缩放点积 `softmax(QKᵀ/√d)V`、多头注意力、因果 mask）、位置编码（绝对/正弦、RoPE、ALiBi 及长上下文外推）、Tokenization（BPE/BBPE/SentencePiece、词表与 OOV）、预训练目标（Next-Token Prediction / 自回归）与 Scaling Law（参数-数据-算力关系、Chinchilla 最优）、解码采样策略（greedy、beam、temperature、top-k、top-p/nucleus、repetition penalty）、上下文窗口与注意力 O(n²) 复杂度的由来、涌现能力与对齐（SFT→RLHF）概览

### Requirement: llm-inference-optimization 专题内容完整

`llm-inference-optimization` 专题 MUST 覆盖大模型**推理侧**与**训练/微调侧**的主流优化手段，并说明各手段解决的瓶颈（显存 / 吞吐 / 延迟 / 成本）。

#### Scenario: llm-inference-optimization 必含项

- **WHEN** 打开 `llm-inference-optimization` 内容
- **THEN** 内容至少包含：推理两阶段（Prefill vs Decode，及各自受算力/显存带宽约束的差异）、KV Cache 原理与显存占用估算、FlashAttention（IO-aware、分块 + online softmax、省显存不省 FLOPs）、PagedAttention / vLLM（显存分页、消除碎片）、Continuous / In-flight Batching 提升吞吐、量化（INT8/INT4、GPTQ/AWQ、权重 vs 激活量化、KV Cache 量化的精度-显存权衡）、投机解码（Speculative Decoding，draft-verify）、MoE（稀疏激活、路由与负载均衡）、张量/流水线并行概览；训练/微调侧：全参微调 vs PEFT、LoRA/QLoRA 原理（低秩增量 `W+BA`、冻结主干）、RLHF 与 DPO 对比、知识蒸馏；并给出"何时选哪种优化"的决策指引

### Requirement: rag 专题内容完整

`rag` 专题 MUST 覆盖检索增强生成的核心链路与工程优化，讲清"朴素 RAG 为什么会答不准 / 检索不到，以及每一环怎么优化"。

#### Scenario: rag 必含项

- **WHEN** 打开 `rag` 内容
- **THEN** 内容至少包含：RAG 动机（缓解幻觉/知识时效/私域知识，vs 微调的取舍）、标准链路（Load → Chunk → Embed → Index → Retrieve → Rerank → Generate）与流程图、Chunking 策略（定长/重叠、按语义/按结构、chunk 大小与召回精度权衡）、Embedding 模型与相似度（cosine/dot、归一化）、向量索引（暴力 vs HNSW vs IVF-PQ 的精度-内存-速度权衡）、混合检索（BM25 稀疏 + 稠密向量、RRF 融合）、Rerank（Cross-Encoder 精排）、查询侧优化（Query Rewrite、HyDE、多查询/Step-back、Query 路由）、上下文构造（top-k 选择、去重、"迷失在中间"与顺序、prompt 模板）、评测（RAGAS：faithfulness/answer relevance/context precision-recall，检索命中率）、常见坑（分块切断语义、召回相似但事实相反、上下文过长稀释、embedding 与业务语料 domain gap）、进阶范式（GraphRAG、Agentic RAG）概览

### Requirement: agent-dev 专题内容完整（迁入本域）

`agent-dev` 专题由 `game-biz` 域迁入 `/ai-llm/` 域，其内容必含项 MUST 保持不变，并 MUST 与本域 `rag` / `llm-fundamentals` 建立交叉引用。

#### Scenario: agent-dev 迁入后必含项不减

- **WHEN** 打开迁入后的 `/ai-llm/agent-dev` 内容
- **THEN** 内容至少包含：Agent 最小闭环（Perception→Plan→Act→Reflect）、主流架构范式（ReAct / Plan-and-Execute / Reflexion / ToT / Multi-Agent）、Tool Use / Function Calling 协议（含 MCP）、上下文窗口管理（滑动窗口 + 摘要 + 分层记忆 + 工具输出截断）、Prompt Engineering 核心杠杆、失败恢复三板斧（重试/幂等/护栏）、Agent 评测方法（Golden Set / 红队 / 离线回放 / 影子流量）、十大真实坑、主流框架对比
- **AND** 页面内含指向本域 `rag` 与 `llm-fundamentals` 的交叉引用

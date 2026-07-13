---
title: AI / 大模型
---

# AI / 大模型

这一域覆盖大语言模型的**核心原理**与**工程优化**，以及基于 LLM 的应用开发（RAG、Agent），共 5 个专题：

- [大模型核心原理](/ai-llm/llm-fundamentals.md) —— Transformer / Self-Attention、位置编码、Tokenization、Scaling Law、解码采样、涌现与对齐
- [推理与微调优化](/ai-llm/llm-inference-optimization.md) —— KV Cache、FlashAttention、PagedAttention/vLLM、量化、投机解码、MoE、LoRA/QLoRA、RLHF/DPO、蒸馏
- [RAG 检索增强生成](/ai-llm/rag.md) —— 检索链路、Chunking、向量索引、混合检索、Rerank、Query 改写、系统性提升召回率、评测与常见坑
- [RAG 上下文剪枝实战](/ai-llm/rag-context-pruning.md) —— Listwise LLM 剪枝复现：为什么固定 top-N 不行、自适应保留数、本地实测数字、分层归因与落地优化
- [Agent 开发](/ai-llm/agent-dev.md) —— Agent Loop、工具调用、上下文管理、失败恢复、评测与真实坑

> 组织方式沿用全站五段式：**场景问题 → 实现方案 → 为什么这么做 → 为什么别的选择不行 → 沉淀结论**，每个专题至少配一段贴近真实的代码与一张流程图。

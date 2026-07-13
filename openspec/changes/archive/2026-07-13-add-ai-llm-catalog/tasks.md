# Tasks: add-ai-llm-catalog

## 1. 建立 AI / 大模型域骨架

- [x] 1.1 新建目录 `docs/ai-llm/` 与域索引 `docs/ai-llm/README.md`（介绍本域 4 个专题，风格对齐其他域 README）
- [x] 1.2 在 `docs/.vuepress/configs/navbar.js` 增加一级导航项"AI / 大模型"，`link: '/ai-llm/'`
- [x] 1.3 在 `docs/.vuepress/configs/sidebar.js` 新增 `/ai-llm/` 分组，children 列出 README + 4 个专题
- [x] 1.4 更新 `docs/README.md` 首页：把"三大域"介绍扩为含 AI / 大模型的四域，并补 features/链接

## 2. 迁移 agent-dev 专题入新域

- [x] 2.1 `git mv docs/game-biz/agent-dev.md docs/ai-llm/agent-dev.md`
- [x] 2.2 在 `sidebar.js` 的 `/game-biz/` 分组移除 `agent-dev.md`，加入 `/ai-llm/` 分组
- [x] 2.3 全仓 `grep -rn "game-biz/agent-dev"`（docs/**、README、configs），把旧链接改到 `/ai-llm/agent-dev`
- [x] 2.4 在 `agent-dev.md` 内补充指向本域 `rag` 与 `llm-fundamentals` 的交叉引用

## 3. 编写 llm-fundamentals 专题

- [x] 3.1 按五段式撰写 `docs/ai-llm/llm-fundamentals.md`，覆盖 spec 必含项：Transformer 结构、Self-Attention（Q/K/V、缩放点积、多头、因果 mask）、位置编码（正弦/RoPE/ALiBi）、Tokenization（BPE/BBPE）、预训练目标与 Scaling Law、解码采样（greedy/beam/temperature/top-k/top-p/repetition penalty）、O(n²) 复杂度、涌现与对齐概览
- [x] 3.2 补至少一段代码（如缩放点积注意力的伪代码/最小实现）与一张 Mermaid 图（Transformer/注意力数据流）
- [x] 3.3 补"内容来源"页脚（整理时间 + 以官方文档为准）

## 4. 编写 llm-inference-optimization 专题

- [x] 4.1 按五段式撰写 `docs/ai-llm/llm-inference-optimization.md`，覆盖推理侧：Prefill/Decode 两阶段、KV Cache 与显存估算、FlashAttention、PagedAttention/vLLM、Continuous Batching、量化（INT8/INT4、GPTQ/AWQ、KV Cache 量化）、投机解码、MoE、并行概览
- [x] 4.2 覆盖训练/微调侧：全参 vs PEFT、LoRA/QLoRA（低秩增量 W+BA）、RLHF vs DPO、蒸馏；给出"何时选哪种优化"的决策指引
- [x] 4.3 在"为什么别的选择不行"段落放对比表（如 微调 全参/LoRA/QLoRA、量化方案权衡）；补代码片段（如 KV Cache 显存估算或 LoRA 前向示意）与一张 Mermaid 图（推理链路/两阶段）
- [x] 4.4 补"内容来源"页脚

## 5. 编写 rag 专题

- [x] 5.1 按五段式撰写 `docs/ai-llm/rag.md`，覆盖：RAG 动机（vs 微调取舍）、标准链路 Load→Chunk→Embed→Index→Retrieve→Rerank→Generate、Chunking 策略、Embedding 与相似度、向量索引（暴力/HNSW/IVF-PQ 权衡）、混合检索（BM25+向量、RRF）、Rerank（Cross-Encoder）、查询侧优化（Query Rewrite/HyDE/多查询/路由）、上下文构造（top-k/去重/"迷失在中间"）、评测（RAGAS、命中率）、常见坑、进阶范式（GraphRAG/Agentic RAG）
- [x] 5.2 放对比表（向量索引权衡、稀疏 vs 稠密 vs 混合检索）与一张 Mermaid 图（RAG 检索链路）；补代码片段（如混合检索 RRF 融合或 chunking 伪代码）
- [x] 5.3 补"内容来源"页脚

## 6. 验收

- [x] 6.1 逐条对照 `specs/ai-llm-catalog/spec.md` 必含项自检 4 个专题内容齐全
- [x] 6.2 运行 `vuepress build`（或 `npm run docs:build` / Makefile 对应目标）确认构建通过、无死链
- [x] 6.3 本地预览，点击导航栏/侧边栏各链接确认 AI / 大模型域可达、agent-dev 新路径生效、旧路径无残留引用

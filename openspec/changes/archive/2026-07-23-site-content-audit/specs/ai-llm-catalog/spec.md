# ai-llm-catalog（Delta）

扩充 AI / 大模型域专题清单：在既有 4 专题（`llm-fundamentals`、`llm-inference-optimization`、`rag`、`agent-dev`）基础上，新增 4 个高频面试专题。既有专题必含项持续有效，不在此重复。

## ADDED Requirements

### Requirement: llm-security 专题内容完整

`llm-security` 专题 MUST 覆盖大模型应用的对抗安全，讲清"提示注入怎么发生、怎么防"。

#### Scenario: llm-security 必含项

- **WHEN** 打开 `docs/ai-llm/llm-security.md`
- **THEN** 内容至少包含：提示注入（直接/间接、越狱 Jailbreak、提示泄漏）攻击向量、工具调用与 RAG 场景下的注入放大、防护三板斧（输入校验/输出过滤/权限最小化与沙箱）、系统提示与用户内容的信任边界、数据外泄与 PII 防护、红队评测思路，并与 `agent-dev`/`rag` 交叉链接

### Requirement: llm-evaluation 专题内容完整

`llm-evaluation` 专题 MUST 覆盖超越 RAGAS 的评测方法论。

#### Scenario: llm-evaluation 必含项

- **WHEN** 打开 `docs/ai-llm/llm-evaluation.md`
- **THEN** 内容至少包含：评测指标分类（能力/安全/幻觉/格式遵从）、基准选择与污染问题、LLM-as-judge 的可靠性与偏差校正、人类在环与标注一致性、离线回放/影子流量/回归测试、Golden Set 构建，并与 `rag`（RAGAS）交叉链接说明边界

### Requirement: llm-cost-latency 专题内容完整

`llm-cost-latency` 专题 MUST 覆盖 LLM 服务的成本与延迟工程。

#### Scenario: llm-cost-latency 必含项

- **WHEN** 打开 `docs/ai-llm/llm-cost-latency.md`
- **THEN** 内容至少包含：Token 经济（输入/输出计价、上下文膨胀成本）、延迟拆解（TTFT vs TPOT、Prefill/Decode）、成本-质量-延迟三角权衡、降本手段（缓存/路由到小模型/批处理/量化）、延迟 SLA 设计与预算护栏，并与 `llm-inference-optimization` 交叉链接

### Requirement: fine-tuning 专题内容完整

`fine-tuning` 专题 MUST 覆盖微调策略选型。

#### Scenario: fine-tuning 必含项

- **WHEN** 打开 `docs/ai-llm/fine-tuning.md`
- **THEN** 内容至少包含：全参微调 vs PEFT（LoRA/QLoRA 原理）、SFT vs RLHF vs DPO 的目标与代价对比、何时该微调 vs 该用 RAG vs 该用 Prompt、数据规模与质量要求、灾难性遗忘与评测回归，并与 `llm-inference-optimization`（LoRA）/`rag` 交叉链接

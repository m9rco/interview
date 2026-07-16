# llm-inference-optimization — 闪卡

> **先量瓶颈再选招：Prefill 卡算力、Decode 卡显存带宽。KV Cache 降复杂度、FlashAttention 降访存、PagedAttention + Continuous Batching 提吞吐、量化 + 投机解码降延迟与成本。训练侧——能不训就 RAG/prompt，要训用 LoRA/QLoRA，对齐用 DPO 起步。**

## 记忆口诀

- **两阶段**：Prefill 卡算力 / Decode 卡带宽 / 先量瓶颈再选招
- **省显存**：KV Cache 降复杂度 / GQA-MQA 砍 KV 头 / 量化搬得少
- **提吞吐**：PagedAttention 消碎片 / Continuous Batching 动态拼批 / prefix 共享
- **降延迟**：投机解码无损 2~3x / 低比特量化 / FlashAttention 省访存
- **训练侧**：能不训就 RAG-prompt / 要训用 LoRA-QLoRA / 对齐 DPO 起步

## Card 1

**Q**: 一次推理为什么要拆成 Prefill 和 Decode 两个阶段？各自的瓶颈是什么？

**A**: Prefill 并行处理整个 prompt、算 KV，瓶颈是算力；Decode 自回归逐 token，每步要把整个模型权重从显存搬一遍，瓶颈是显存带宽。这解释了量化为何直接提速。

## Card 2

**Q**: KV Cache 解决了什么问题？它的代价是什么，怎么省？

**A**: 缓存已算的 K/V，每步只算新 token，复杂度 O(n²)→O(n)；代价是显存（长上下文/大 batch 常比权重还吃显存）。省法：GQA/MQA、KV 量化、PagedAttention 消碎片。

## Card 3

**Q**: 对比 FlashAttention 与投机解码：它们分别优化什么？都是"近似"加速吗？

**A**: 都无损（数学等价）。FlashAttention 是 IO-aware 分块 + online softmax，不落地 n×n 矩阵，省访存；投机解码用小模型猜 k 个 token、大模型并行 verify，省带宽、提 2~3x 速度。

## Card 4

**Q**: 对比 RLHF 与 DPO：为什么 DPO 逐渐成主流？

**A**: RLHF 需奖励模型 + PPO 强化学习，效果强但流程复杂、易训崩；DPO 直接用偏好对做分类式优化，免奖励模型、免 RL，更稳更省，故成主流；追求上限再上 RLHF。

## Card 5

**Q**: "MoE 是免费的大模型" 这句话错在哪？

**A**: 错。MoE 每 token 只激活 top-k 专家，省的是算力；但显存必须装下所有专家，且路由负载均衡与通信开销都是挑战——省算力不省显存。

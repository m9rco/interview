---
title: 大模型核心原理
---

# 大模型核心原理

> Transformer / Self-Attention · 位置编码 · Tokenization · Scaling Law · 解码采样 · 涌现与对齐

::: tip 🧠 一句话记忆锚点
**大模型 = Self-Attention（任意位置直连 + 全并行，代价是 O(n²)）+ 位置编码（注意力本身不知词序）+ Scale（Chinchilla 参数/数据等比） + 对齐（SFT→RLHF/DPO）。一切生成都归结为"预测下一个 token"，输出风格由解码采样决定。**
:::

## 场景问题

### 为什么是 Transformer，不是 RNN/LSTM？

一个绕不开的面试起点：给定一段文本预测下一个 token，为什么 2017 年后大家全换成了 Transformer？

- **RNN/LSTM 的两个死穴**：① 时序依赖**无法并行**——第 t 步必须等第 t-1 步算完，训练慢；② 长程依赖靠隐状态一路传递，**梯度消失**，隔几十个 token 的信息就丢了。
- **Transformer 的答案**：用 **Self-Attention** 让序列里任意两个位置**直接**建立连接（路径长度 O(1) 而非 O(n)），且整段序列可**一次性并行**计算。代价是注意力的 **O(n²)** 复杂度——这是后面所有"长上下文优化"的根源。

```mermaid
flowchart LR
    subgraph RNN[RNN 串行]
        x1 --> h1 --> h2 --> h3 --> h4
        x2 --> h2
        x3 --> h3
        x4 --> h4
    end
    subgraph TF[Self-Attention 全连接]
        t1 <--> t2
        t1 <--> t3
        t1 <--> t4
        t2 <--> t3
        t2 <--> t4
        t3 <--> t4
    end
```

### 主流大模型都是 Decoder-only

原始 Transformer 是 Encoder-Decoder（翻译任务）。今天主流生成式大模型（GPT、LLaMA、Qwen、Claude）几乎都是 **Decoder-only**：

| 结构 | 代表 | 适合 |
| --- | --- | --- |
| **Encoder-only** | BERT | 理解类（分类 / 抽取 / 检索 embedding） |
| **Encoder-Decoder** | T5 / BART | 序列到序列（翻译 / 摘要） |
| **Decoder-only** | GPT / LLaMA / Qwen | 自回归生成，**统一用"预测下一个 token"**做所有任务 |

Decoder-only 胜出的核心原因：**任务大一统**——预训练与推理都是同一个"next-token prediction"，天然适配指令、对话、few-shot；架构简单、易 scale。

## 实现方案

### Self-Attention：缩放点积注意力

一句话：**每个 token 用自己的 Query 去和所有 token 的 Key 做相似度打分，softmax 归一化成权重，再对所有 Value 加权求和**——得到"融合了上下文的新表示"。

```text
Attention(Q, K, V) = softmax( Q·Kᵀ / √d_k ) · V
```

下图直观展示这个过程：**当前 token 的 Query 依次给每个 Key 打分（扫描光束），softmax 归一化成权重（右侧长条），再按权重把各 Value 加权汇聚成"新表示"**。权重高的 Key（K2）贡献最大。

<svg viewBox="0 0 660 250" width="100%" style="max-width:660px;height:auto" role="img" aria-label="Self-Attention：Query 对各 Key 打分并按 softmax 权重加权求和">
  <rect x="18" y="100" width="96" height="48" rx="8" fill="#7c3aed"/>
  <text x="66" y="122" text-anchor="middle" font-size="13" fill="#fff">Q</text>
  <text x="66" y="140" text-anchor="middle" font-size="11" fill="#e9d5ff">当前 token</text>

  <!-- Key nodes -->
  <g font-size="12" fill="currentColor">
    <rect x="250" y="14"  width="76" height="34" rx="6" fill="#1e293b" stroke="#475569"/><text x="288" y="35" text-anchor="middle">K1 / V1</text>
    <rect x="250" y="74"  width="76" height="34" rx="6" fill="#1e293b" stroke="#38bdf8"/><text x="288" y="95" text-anchor="middle">K2 / V2</text>
    <rect x="250" y="134" width="76" height="34" rx="6" fill="#1e293b" stroke="#475569"/><text x="288" y="155" text-anchor="middle">K3 / V3</text>
    <rect x="250" y="194" width="76" height="34" rx="6" fill="#1e293b" stroke="#475569"/><text x="288" y="215" text-anchor="middle">K4 / V4</text>
  </g>

  <!-- Q -> K scanning beams (staggered opacity = 逐个打分) -->
  <g stroke="#a78bfa" fill="none">
    <line x1="114" y1="124" x2="250" y2="31"  stroke-width="1.5"><animate attributeName="stroke-opacity" values="0.12;1;0.12" dur="4s" begin="0s"   repeatCount="indefinite"/></line>
    <line x1="114" y1="124" x2="250" y2="91"  stroke-width="3.5"><animate attributeName="stroke-opacity" values="0.12;1;0.12" dur="4s" begin="1s"   repeatCount="indefinite"/></line>
    <line x1="114" y1="124" x2="250" y2="151" stroke-width="2"  ><animate attributeName="stroke-opacity" values="0.12;1;0.12" dur="4s" begin="2s"   repeatCount="indefinite"/></line>
    <line x1="114" y1="124" x2="250" y2="211" stroke-width="1.5"><animate attributeName="stroke-opacity" values="0.12;1;0.12" dur="4s" begin="3s"   repeatCount="indefinite"/></line>
  </g>

  <!-- softmax weight bars -->
  <g font-size="11" fill="currentColor">
    <rect x="340" y="21"  height="18" rx="3" fill="#64748b"><animate attributeName="width" values="6;22;22" dur="4s" begin="0s" repeatCount="indefinite"/></rect><text x="410" y="35">0.1</text>
    <rect x="340" y="81"  height="18" rx="3" fill="#38bdf8"><animate attributeName="width" values="6;120;120" dur="4s" begin="1s" repeatCount="indefinite"/></rect><text x="470" y="95">0.6</text>
    <rect x="340" y="141" height="18" rx="3" fill="#64748b"><animate attributeName="width" values="6;44;44" dur="4s" begin="2s" repeatCount="indefinite"/></rect><text x="392" y="155">0.2</text>
    <rect x="340" y="201" height="18" rx="3" fill="#64748b"><animate attributeName="width" values="6;22;22" dur="4s" begin="3s" repeatCount="indefinite"/></rect><text x="410" y="215">0.1</text>
  </g>

  <!-- aggregate -> output -->
  <path d="M326 31 C 470 31, 480 118, 546 124" stroke="#334155" fill="none" stroke-width="1"/>
  <path d="M326 91 C 470 91, 480 118, 546 124" stroke="#38bdf8" fill="none" stroke-width="3"/>
  <path d="M326 151 C 470 151, 480 130, 546 128" stroke="#334155" fill="none" stroke-width="1.4"/>
  <path d="M326 211 C 470 211, 480 130, 546 128" stroke="#334155" fill="none" stroke-width="1"/>
  <rect x="546" y="100" width="100" height="48" rx="8" fill="#0ea5e9"/>
  <text x="596" y="120" text-anchor="middle" font-size="12" fill="#fff">新表示</text>
  <text x="596" y="138" text-anchor="middle" font-size="10" fill="#e0f2fe">Σ wᵢ·Vᵢ</text>
  <!-- traveling pulse on dominant path -->
  <circle r="4" fill="#f0f9ff"><animateMotion path="M114 124 L 288 91 L 596 124" dur="4s" begin="1s" repeatCount="indefinite"/></circle>
</svg>

- **Q/K/V** 都是输入 embedding 经三个可学习矩阵 `W_Q / W_K / W_V` 线性变换得到。
- **除以 √d_k**：点积随维度增大而方差变大，不缩放会把 softmax 推入梯度极小的饱和区。
- **多头（Multi-Head）**：把 Q/K/V 切成 h 份并行做注意力，再拼接——每个头学不同的关注模式（语法 / 指代 / 位置…），类似 CNN 的多通道。
- **因果 mask（Causal Mask）**：生成时第 t 个 token 只能看到 ≤ t 的位置，把上三角置为 `-∞`，softmax 后为 0——保证"不偷看未来"。

```python
import numpy as np

def scaled_dot_product_attention(Q, K, V, causal=True):
    # Q,K,V: [seq_len, d_k]
    d_k = Q.shape[-1]
    scores = Q @ K.T / np.sqrt(d_k)          # [seq, seq] 相似度矩阵
    if causal:                                # 因果 mask：屏蔽未来位置
        mask = np.triu(np.ones_like(scores), k=1).astype(bool)
        scores[mask] = -1e9
    scores = scores - scores.max(-1, keepdims=True)   # 数值稳定
    weights = np.exp(scores)
    weights /= weights.sum(-1, keepdims=True)          # softmax
    return weights @ V                        # 对 Value 加权求和
```

一个完整的 Decoder Block = **Masked Multi-Head Attention → 残差 + LayerNorm → FFN(前馈) → 残差 + LayerNorm**，堆叠 N 层。残差连接解决深层网络梯度问题，LayerNorm 稳定训练（现代模型多用 Pre-LN + RMSNorm）。

```mermaid
flowchart TD
    IN[Token Embedding + 位置编码] --> A[Masked Multi-Head Attention]
    A --> R1[Add & Norm] --> F[Feed-Forward FFN]
    F --> R2[Add & Norm] --> OUT[下一层 / LM Head]
    IN -.残差.-> R1
    R1 -.残差.-> R2
```

### 位置编码：注意力本身"看不见顺序"

Self-Attention 是**排列不变**的——打乱输入顺序，输出集合不变。必须显式注入位置信息：

- **正弦绝对编码（原版）**：用不同频率的 sin/cos 给每个位置一个固定向量，加到 embedding 上。简单但外推差。
- **RoPE（旋转位置编码，LLaMA/Qwen 主流）**：把位置信息以**旋转**方式作用到 Q/K 上，天然编码**相对位置**，且有一定长度外推能力（配合 NTK/YaRN 插值可扩窗口）。
- **ALiBi**：直接在注意力分数上按距离加线性偏置，训练短、推理长的外推能力强。

### Tokenization：模型眼里没有"字"，只有 token

文本先切成 token（子词单元）再查 embedding 表。主流是 **BPE / BBPE / SentencePiece**：

- **BPE（Byte-Pair Encoding）**：从字符开始，反复合并"最高频相邻对"，直到词表达到设定大小。高频词整体成 token，低频词拆成子词——平衡词表大小与 OOV。
- **BBPE（Byte-level BPE，GPT 系）**：在**字节**上做 BPE，任何 UTF-8 文本都能编码，**永不 OOV**，对中文/emoji 友好。

工程影响：① 中文一个字常占 1~2+ token，**计费和上下文长度按 token 算**；② prompt 里的空格、换行都是 token；③ 数字/罕见词被拆碎会影响数学能力。

### 预训练目标与 Scaling Law

- **预训练目标**：Decoder-only 用**自回归语言建模**——最大化整段序列的 `∏ₜ P(xₜ | x_<ₜ)`，即"预测下一个 token"。损失是交叉熵（等价于最小化困惑度 Perplexity）。
- **Scaling Law**：模型能力随**参数量 N、数据量 D、算力 C**呈幂律平滑提升。**Chinchilla（DeepMind）**修正了早期"堆参数"的偏见：给定算力预算，**参数与数据应大致等比例增长**（约 20 tokens/参数），此前的大模型多是"参数过大、数据喂不够"。

### 解码采样：同一个模型，输出风格由采样决定

模型每步输出的是**全词表的概率分布**，怎么从中选下一个 token 就是解码策略：

| 策略 | 做法 | 特点 |
| --- | --- | --- |
| **Greedy** | 每步取概率最大 | 确定、易复读、乏味 |
| **Beam Search** | 保留 top-b 条候选序列 | 适合翻译/摘要，开放生成易呆板 |
| **Temperature** | logits 除以 T 再 softmax | T↑ 更随机有创意，T↓ 更保守 |
| **Top-k** | 只在概率前 k 个里采样 | 截断长尾 |
| **Top-p（Nucleus）** | 只在累积概率达 p 的最小集合里采样 | 动态截断，主流默认 |
| **Repetition Penalty** | 对已出现 token 降权 | 抑制复读 |

面试常问："temperature=0 是否完全确定？"——**理论上贪心确定，但受浮点/并行归约顺序、MoE 路由等影响，实际仍可能有微小非确定性。**

## 为什么这么做

### 为什么 O(n²) 是"原罪"也是"取舍"

注意力要算 n×n 的相似度矩阵，序列翻倍则**计算和显存都是 4 倍**。为什么还用它？

- 换来的是**任意位置直连 + 全并行**，这是 RNN 给不了的表达力与训练效率。
- n² 的痛点催生了一整套优化：稀疏/滑窗注意力、FlashAttention（省显存不改结果）、线性注意力、以及推理侧的 KV Cache——详见 [推理与微调优化](/ai-llm/llm-inference-optimization.md)。

### 为什么需要对齐（Alignment）

预训练只学会了"续写互联网文本"，并不天然"听话、有用、无害"。要变成可用的助手需**对齐**三步：

1. **SFT（监督微调）**：用高质量"指令-回答"对，教模型follow instruction。
2. **RLHF / DPO**：用人类偏好数据训练，让输出更符合人类偏好（有用/诚实/无害）。
3. **系统提示 + 护栏**：运行时约束角色与边界。

```mermaid
flowchart LR
    A[海量文本<br/>自回归预训练] --> B[SFT<br/>指令微调]
    B --> C[RLHF / DPO<br/>偏好对齐]
    C --> D[可用助手]
```

## 为什么别的选择不行

### 常见误区与澄清

| 误区 | 澄清 |
| --- | --- |
| "参数越多一定越强" | Chinchilla：数据不够时，大参数是浪费；小而喂饱的模型可反超 |
| "上下文窗口越大越好" | 有 O(n²) 开销 + "迷失在中间"（middle 信息利用差）；长窗≠会用长窗 |
| "temperature 越高越聪明" | 只是更随机；推理/代码任务通常要**低温**甚至贪心 |
| "微调就能加知识" | 微调擅长改**风格/格式/能力**，加**事实知识**常更适合 [RAG](/ai-llm/rag.md) |
| "BPE 按词切" | 按**高频子词/字节**切，一个中文字可能是多个 token |
| "Attention 知道词序" | 不知道，全靠**位置编码**注入 |

### 为什么不直接无限堆层/堆窗口

- 层数堆太深收益递减且难训（靠残差 + Norm 缓解，但仍有瓶颈）。
- 窗口靠 O(n²) 硬扩会撞显存墙；工程上靠 RoPE 插值（NTK/YaRN）、稀疏注意力、外部检索（RAG）分摊，而非无脑加长。

## 沉淀结论

::: tip 心法总结
**大模型 = Transformer（Self-Attention 全连接 + 位置编码）× Scale（Chinchilla 最优的参数/数据配比）+ 对齐（SFT→RLHF/DPO）。** 一切生成行为都归结为"预测下一个 token"，而输出风格由**解码采样**控制；O(n²) 注意力是能力之源，也是所有长上下文与推理优化的战场。
:::

### 面试常见问题清单（按主题分类）

**架构**
- **Q：为什么 Transformer 取代 RNN/LSTM？** A：Self-Attention 让任意两位置直连（路径 O(1)）且整段并行；RNN 串行不能并行、长程靠隐状态传递会梯度消失。代价是注意力 O(n²)。
- **Q：为什么主流大模型是 Decoder-only？** A：任务大一统——预训练与推理都是同一个 next-token prediction，天然适配指令/对话/few-shot，架构简单易 scale。
- **Q：Attention 为什么除以 √d_k？** A：点积随维度增大方差变大，不缩放会把 softmax 推入梯度极小的饱和区，训练不稳。
- **Q：多头注意力的意义？** A：把 Q/K/V 切成 h 份并行，各头学不同关注模式（语法/指代/位置），类似 CNN 多通道。

**位置与分词**
- **Q：注意力知道词序吗？怎么注入位置？** A：不知道（排列不变），必须显式注入——正弦绝对编码 / RoPE（相对位置、可外推）/ ALiBi（距离线性偏置）。
- **Q：一个中文字是几个 token？** A：不定，常 1~2+ 个；BPE/BBPE 按高频子词/字节切，计费与上下文长度都按 token 算。

**训练与解码**
- **Q：Scaling Law 与 Chinchilla 的结论？** A：能力随 N/D/C 幂律提升；给定算力，参数与数据应约等比例增长（~20 tokens/参数），别一味堆参数。
- **Q：temperature=0 是否完全确定？** A：理论上贪心确定，但受浮点/并行归约顺序、MoE 路由影响，实际仍可能有微小非确定性。
- **Q：Top-k 与 Top-p 区别？** A：Top-k 固定候选个数；Top-p（Nucleus）按累积概率动态截断，是主流默认。

**能力边界**
- **Q：加事实知识该微调还是 RAG？** A：微调擅长改风格/格式/能力；加事实/时效知识优先 [RAG](/ai-llm/rag.md)。
- **Q：上下文窗口越大越好吗？** A：否，有 O(n²) 开销 + "迷失在中间"，长窗≠会用长窗。

延伸阅读：[推理与微调优化](/ai-llm/llm-inference-optimization.md) · [RAG 检索增强生成](/ai-llm/rag.md) · [Agent 开发](/ai-llm/agent-dev.md)

### 记忆口诀

- **Self-Attention**：QKV 打分 / softmax 加权 / 任意位置直连 O(1) / 代价 O(n²)
- **架构选型**：Encoder-only 理解 / Encoder-Decoder 翻译 / Decoder-only 生成大一统
- **位置编码**：注意力排列不变 / 正弦绝对 / RoPE 相对可外推 / ALiBi 距离偏置
- **分词计费**：BPE 高频子词 / BBPE 字节永不 OOV / 中文一字多 token
- **Scale 配比**：Chinchilla / 参数数据等比 / ~20 tokens 每参数
- **解码采样**：Greedy 确定 / Temperature 随机度 / Top-k 定数 / Top-p 动态截断
- **对齐三步**：SFT 指令 → RLHF/DPO 偏好 → 系统提示护栏

## 内容来源

综合整理：Attention Is All You Need（Vaswani 2017）、GPT/LLaMA/Chinchilla 论文、RoPE/ALiBi 论文、Hugging Face 与各家官方文档（2026-07；领域更新快，请以最新论文与官方文档为准）。

## 自测：合上资料能说清楚吗？

1. Transformer 靠什么取代了 RNN/LSTM？付出的代价是什么？

<details><summary>参考答案</summary>

用 **Self-Attention** 让任意两位置**直连**（路径 O(1)）且整段**并行**，解决了 RNN 的**串行不可并行**与**长程梯度消失**。代价是注意力的 **O(n²)** 计算/显存开销，成为长上下文优化的战场。

</details>

2. 为什么 Self-Attention 需要额外的位置编码？列举两种主流方案。

<details><summary>参考答案</summary>

注意力**排列不变**，打乱顺序输出集合不变，本身"看不见词序"。主流：**RoPE**（旋转编码，天然编码**相对位置**、可外推）、**ALiBi**（按距离加**线性偏置**，短训长推）；原版是**正弦绝对编码**。

</details>

3. 对比 Top-k 与 Top-p（Nucleus）采样的区别，各自特点是什么？

<details><summary>参考答案</summary>

**Top-k** 固定候选**个数** k，长尾概率分布不均时可能仍过窄或过宽；**Top-p** 按**累积概率**取达 p 的最小集合，**动态截断**、随分布自适应，是主流默认。二者都在截断长尾、平衡多样性与质量。

</details>

4. 对比"微调"与"RAG"，加入新知识该选哪个？

<details><summary>参考答案</summary>

**微调**擅长改**风格/格式/能力**，把知识"焊死"进权重、更新成本高、易遗忘；**RAG** 把知识放外部库检索注入，适合**事实/时效**类知识，可增删溯源。加事实优先 **RAG**，改行为风格用微调。

</details>

5. Chinchilla 修正了此前"堆参数"的什么偏见？给出结论。

<details><summary>参考答案</summary>

此前大模型多**参数过大、数据喂不够**。Chinchilla 指出：给定算力预算，**参数 N 与数据 D 应大致等比例增长**（约 **20 tokens/参数**），小而喂饱的模型可反超参数更大者，能力随 N/D/C 呈**幂律**提升。

</details>

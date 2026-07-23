# llm-evaluation — 闪卡

> **评测四象限：能力 / 安全 / 幻觉 / 格式遵从，缺一象限模型上线就翻车。公开 benchmark 分数看看就好——数据污染（train-test contamination）让它虚高；生产靠自建 Golden Set + 离线回放 + 影子流量做回归。LLM-as-judge 便宜快，但有位置偏差/长度偏差/自我偏好三大坑，要靠人类在环校准（Cohen's kappa 量一致性）。RAG 的对错交给 RAGAS 的 faithfulness / answer relevance / context precision-recall。**

## 记忆口诀

- **四象限**：能力 / 安全 / 幻觉 / 格式遵从（安全+幻觉一票否决）
- **三层指标**：硬匹配 → 规则校验 → LLM/人类裁判（越往下越贵，能上层别下沉）
- **judge 三偏差**：位置 / 长度 / 自我偏好（交换顺序 + rubric + 换家族模型）
- **回归三件套**：Golden Set 回归 / 离线回放 / 影子流量
- **信不信榜单**：污染让它虚高，改写就崩，生产只信私有集
- **RAGAS 三指标**：faithfulness / answer relevance / context precision-recall

## Card 1

**Q**: LLM 评测的四类指标象限是什么？为什么不能只看一个综合总分？

**A**: 能力 / 安全 / 幻觉 / 格式遵从。不能只看总分是因为安全和幻觉是一票否决象限——一个能力 90 分但越狱率 30% 的模型不能上线，总分会把致命短板平均掉。分象限才能设"任一象限不达标即拦截"的门禁。

## Card 2

**Q**: 什么是 train-test contamination？它如何影响 benchmark 分数，怎么应对？

**A**: 数据污染：benchmark 题目答案早已进了模型预训练语料，模型是"背过"而非"会做"，表现为榜单虚高但改写换数就崩。应对：用私有/新构造评测集、做改写鲁棒性测试、关注训练截止后发布的新 benchmark、生产以自建 Golden Set 为准。

## Card 3

**Q**: LLM-as-judge 有哪三大偏差？各自的校正手段是什么？

**A**: 位置偏差（偏爱某个位置）→ 交换顺序各判一遍、两次一致才算数；长度偏差（偏爱啰嗦答案）→ rubric 显式约束简洁不扣分；自我偏好（偏爱同源输出）→ 换不同家族模型当裁判、多裁判投票 + 人工复核。此外给参考答案、先说理由再打分、固定低温度也能降方差。

## Card 4

**Q**: Cohen's kappa 是什么，为什么评测里要用它而不是直接算"一致比例"？

**A**: kappa = (po - pe)/(1 - pe)，扣除了随机蒙对的一致成分。直接算一致比例会被"瞎猜也能蒙对"虚高，kappa 更真实。用途：先确认人-人 kappa 高（rubric 无歧义），再验证机器-人类 kappa 达标（如 >0.6）才敢大规模用 LLM 裁判。

## Card 5

**Q**: 离线回放、影子流量、回归测试三者的区别？RAG 系统又该用什么评？

**A**: 回归测试在 Golden Set 上跑防指标退化（CI 门禁）；离线回放录真实用户轨迹、改版后原样重放对比；影子流量新旧版并行处理真实请求但新版结果不返给用户、只记录对比（零风险）。RAG 用 RAGAS：faithfulness（幻觉）、answer relevance（能力）、context precision-recall（检索质量，RAG 特有），定位是检索还是生成的锅。

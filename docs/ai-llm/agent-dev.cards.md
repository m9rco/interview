# agent-dev — 闪卡

> **Agent = Prompt + Tools + Memory + Loop + Guardrails + Evaluation，六件缺一都会在生产坏掉。核心闭环 Perception→Plan→Act→Reflect；工具要幂等 + 校验 + 截断 + 可回滚；上下文靠分层记忆(短期原文 / 中期摘要+关键事实 pin 住 / 长期向量库)。Demo 跑通只是 20%，剩下 80% 是评测与护栏。**

## 记忆口诀

- **六件套**：Prompt / Tools / Memory / Loop / Guardrails / Evaluation
- **最小闭环**：Perception → Plan → Act → Reflect
- **工具四原则**：幂等 / 校验+友好错误 / 返回截断 / 副作用可回滚
- **分层记忆**：短期原文 / 中期摘要+pin关键事实 / 长期向量库
- **生产铁律**：Demo 20% / 评测护栏 80% / 熔断+预算+白名单+Trace

## Card 1

**Q**: Agent 的最小闭环由哪四步构成？它和一次普通的 LLM 调用最大的区别在哪？

**A**: Perception → Plan → Act → Reflect 循环。区别：Agent 能自主调用工具获取外部信息、观察结果后迭代，普通调用是单轮无反馈的一问一答。

## Card 2

**Q**: 工具（Tool Use）设计的四条原则是什么？分别防的是什么坑？

**A**: 幂等（防重试重复扣款）、参数校验+友好错误（防参数幻觉、助自我修正）、返回截断（防打爆 context）、副作用可回滚/二次确认（防误删误操作）。

## Card 3

**Q**: 对话历史撑爆 200k context，分层记忆是怎么解决的？关键事实为什么要单独 pin？

**A**: 短期留最近 N 轮原文、中期压摘要+关键事实、长期进向量库按需召回。pin 是因为滑动窗口会误删早期指令、摘要漂移会丢约束，关键事实固定不参与滑动才不丢。

## Card 4

**Q**: 对比 **ReAct** 和 **Plan-and-Execute**：各自思路、适用场景与短板？

**A**: ReAct 每步现想现做（Thought→Action→Observation），灵活但易跑偏、步数多。Plan-and-Execute 先出完整计划再逐步执行、中途可 replan，适合长任务，但初始计划可能不准。

## Card 5

**Q**: 为什么说"Demo 跑通只是 20%"？生产化最容易坏在哪几处，各配什么护栏？

**A**: 剩 80% 是评测+护栏。常坏点：无限循环（去重+轮数熔断）、输出爆炸（分页摘要）、参数幻觉（Schema 校验）、成本失控（token 预算+熔断）、副作用（白名单+human-in-the-loop）、可观测缺失（Trace+span）。

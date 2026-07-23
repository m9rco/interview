# observability — 闪卡

> 可观测性的核心是**用三支柱互补地回答"系统现在怎么了、为什么"**：**Metrics 便宜且全局，告诉你"出没出问题、哪个指标坏了"；Traces 中等成本，告诉你"一次请求慢在哪个 span、跨了哪几个服务"；Logs 最贵最细，告诉你"那一刻到底发生了什么"**。三者靠 **trace_id** 串起来，排障永远是"**metrics 报警 → trace 定位慢 span → logs 看细节**"这条链路往下钻。记住两条铁律：**分位数（P99）不能求平均、必须靠直方图聚合**；**采样要么在入口全采后端 head-based，要么等 trace 完成再按错误/慢来选 tail-based**。

## 记忆口诀

- **三支柱**：Metrics 发现（便宜全局）· Traces 定位（因果树采样）· Logs 定因（最贵最细）
- **串联**：一根 trace_id 穿三支柱 · logs 带 span_id · metrics 带 exemplar
- **传播**：W3C traceparent 随头走 · 版本-traceid-spanid-flags
- **采样**：head 入口定（简单漏错）· tail 完成定（专留错慢）
- **方法论**：请求看 RED · 资源看 USE
- **分位数**：P99 不求平均 · 合桶再算分位数
- **排障**：报警看 metrics → 定位看 trace → 细节看 logs

## Card 1

**Q**: Metrics、Logs、Traces 三支柱各自回答什么问题、成本量级如何、如何串联？

**A**: Metrics 便宜、可聚合，回答"出没出问题、趋势如何"；Traces 中等成本、随请求量增长靠采样，回答"一次请求跨服务慢/错在哪个 span"；Logs 最贵最细，回答"那一刻具体发生了什么"。三者是"发现→定位→定因"的漏斗，靠 trace_id（日志带 trace_id/span_id、指标带 exemplar）串成一条线。

## Card 2

**Q**: 分布式追踪里 trace 上下文如何跨进程传递？W3C traceparent 里有什么？

**A**: 靠随请求头（HTTP header / MQ 消息头）显式透传，不是全局变量。W3C `traceparent` 格式为 `version-trace_id-span_id-flags`（如 `00-<16字节traceid>-<8字节spanid>-01`，flags=01 表示已采样）。下游用其中 trace_id 续接同一条 trace，把自己的 span 挂为子 span（parent_span_id 指向上游）。

## Card 3

**Q**: head-based 与 tail-based 采样各自的时机、优缺点？为什么不全量采集？

**A**: head-based 在请求入口当场决定采不采，简单、无需缓冲、开销低，但可能恰好丢掉出错/慢的那条。tail-based 把所有 span 先缓冲，等 trace 完成后按"是否错误/是否慢"决定保留，能专挑高价值 trace，但要缓冲全部 span、内存和架构复杂。不全量是因为 trace 量随请求线性增长、存储成本不可承受，且绝大多数正常 trace 无排障价值。

## Card 4

**Q**: 为什么三台机器各自 P99=100ms，整体 P99 不等于 100ms？正确的聚合方式是什么？

**A**: 因为分位数不可加、不可平均——你不知道每台的请求量与长尾分布形状，简单平均没有统计意义。正确做法：用直方图指标（按 `le` 边界存累计计数），跨来源聚合时先把各来源同一个桶的计数相加（`sum(rate(..._bucket[5m])) by (le)`），再对合并后的直方图用 `histogram_quantile(0.99, ...)` 计算。结果是近似值（桶内插值）但数学正确。

## Card 5

**Q**: 线上某服务延迟突然从 300ms 涨到 1.8s，用三支柱怎么一步步定位？

**A**: ① Metrics 发现：告警触发，看到该服务 P99 飙升、错误率上涨，知道"哪个服务坏了"但不知为什么。② Trace 定位：打开一条 tail 采样留下的慢 trace，看 span 树，发现耗时集中在某个 DB Query span，下游其他服务正常，问题收敛到某条查询。③ Logs 定因：用该 span 的 trace_id 跳到对应日志，看到 db timeout、慢 SQL 与参数，结合 DB 监控确认是缺索引+锁等待。metrics 说"坏了"、trace 说"坏在哪环"、logs 说"为什么坏"。

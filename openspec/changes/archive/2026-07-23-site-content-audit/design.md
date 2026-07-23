## Context

站点是一份**个人向**的后台面试复习档案（VuePress 2），绑定特定人设（360 三年 + 鹅厂六年，游戏基础架构 + 互联网/智能硬件后台 + AI 工程）。已从旧规范的 13 专题成长为 6 域约 45 专题，每篇配 Anki 闪卡，受 `check:md`（构建前 HTML 门禁）与 `check:structure`（五段式 + 记忆锚点门禁）双门禁约束，经 `.githooks/pre-commit` 与 CI 拦截。

本次盘点已用四路并行审计 + 人工核对完成，证据要点：72 篇结构门禁仅 1 篇（叙事页）"失败"、闪卡 100% 覆盖；规范却仍写 13 专题/四段式（与门禁的五段式冲突）；多处内容重叠且 nzmesh"是否 gossip"口径自相矛盾；7 类高频编码考点与可观测性等确无独立专题（已 grep 核实）。误报已剔除：`raft-gossip` 已覆盖共识、`distributed-transaction` 已覆盖 2PC/TCC/Saga。

约束：不改变构建/发布流程；不删除既有专题；新增/改写专题必须继续通过双门禁并纳入闪卡生成；一切改动以"可面试叙述"为验收视角。

## Goals / Non-Goals

**Goals:**
- 削冗余：为已识别重叠簇确立单一事实源 + 双向交叉链接，消除口径冲突（尤其 nzmesh）。
- 补遗漏：补齐已核实的高频考点（算法 7 篇、可观测性、AI 安全/评测/成本/微调、游戏防作弊/经济）。
- 治体量：拆分/瘦身 catch-all 与主题混塞专题（ai-eng-practices、reservoir-sampling），补厚偏薄的 http-tls-rpc。
- 纠漂移：规范对齐现实与门禁；学习路径/依赖图收纳全部专题与新增专题；消除结构门禁误报。

**Non-Goals:**
- 不做面向"通用后台"的越界扩张（如 PostgreSQL 深潜、前端工程转向）——人设不匹配的"缺口"不补；`elixir-fp`/`frontend-engineering` 作为人设覆盖保留，不在本次删改。
- 不重写既有合规专题的正文，只做去重/加链/补节。
- 不改构建、发布、闪卡模板机制本身。

## Decisions

**D1：冗余走"去重 + 交叉链接"而非合并删除。** 每个重叠概念指定唯一"事实源"页，其余页改为链接引用。
- 备选：物理合并文件。否决——会破坏 dependency-map/学习路径/侧边栏的稳定 URL，且单篇可面试性下降。

**D2：nzmesh 口径统一为"全连接广播 = gossip 的一种特例（省去 incarnation/间接探测）"。** 实现代码归并到 `self-mesh-k8s`（落地页），`raft-gossip` 保留 SWIM 理论并链接过去。
- 理由：两篇当前对同一系统给出互斥结论，面试复述时自相矛盾风险最高，属最高优先级修复。

**D3：新增专题一律遵循五段式 + 记忆锚点 + 一句话结论 + 配套 `.cards.md`，并接入 dependency-map/sidebar/learning-paths。** 通过 `check:md` 与 `check:structure` 方算完成。
- 理由：与门禁和既有 71 篇保持同构，避免产生新的"孤儿/不合规"。

**D4：规范以 delta 修正而非推倒重来。** `interview-topic-catalog` 用 MODIFIED 保留 13 专题必含项、仅改域结构与四→五段式；新增 `algo-catalog`/`content-redundancy-policy` 两个 capability；`ai-llm-catalog` 用 ADDED 扩 4 专题。
- 备选：归档旧规范另起新规范。否决——13 专题必含项仍是有效验收资产，MODIFIED 可无损保留。

**D5：分波推进，P1 冗余先行。** P1（去重/加链，零新增、风险最低）→ P2（拆分/瘦身/补厚）→ P3（新增约 13 专题，工作量最大）→ P4（规范+结构收口）。每波独立可交付、可回滚。

**D6：算法 7 新专题按"编码轮通用套路"粒度组织**（模板 + 3–6 道经典题 + 复杂度 + 与邻近专题边界），而非题解合集。`union-find` 从 `graph` 抽出独立成篇并双向链接。

## Risks / Trade-offs

- [P3 新增 13 专题体量大、易烂尾] → 按域切片、每篇独立验收（双门禁 + 闪卡）；P1/P2/P4 不依赖 P3，可先行合入产生价值。
- [去重时误删仍被别处依赖的内容] → 去重前 grep 反链确认，改链接而非直接删段；保留 git 历史可回滚。
- [nzmesh 口径修正可能与作者原意不符] → 属"澄清"而非"改设计"，落地前在 self-mesh-k8s 校正清单里显式标注"算法差异 vs 架构归类"两层，供作者确认。
- [规范 MODIFIED 若正文不全会在归档时丢细节] → 已复制整块 MODIFIED 内容；首批 13 专题必含项以"持续有效"引用保留，不删原文。
- [新增专题稀释人设纯度] → 新增项均落在既有三条路径的高频考点内，不引入无关域。

## Migration Plan

1. **P1 削冗余**：逐簇去重 + 双向链接（限流三件套 → 网格 nzmesh 口径 → ebpf/k8s-network → business-proxy 幂等 → RAG 四文件 → network/IO 三件套 → 算法两处消歧）。跑 `check:md`。
2. **P2 治体量**：拆出 `time-series-anomaly-detection`、重构 `ai-eng-practices`、补厚 `http-tls-rpc`。跑双门禁。
3. **P3 补遗漏**：按 algo → common → ai-llm → game-biz 顺序新增专题，每篇即时接入 sidebar/dependency-map、生成闪卡、过双门禁。
4. **P4 收口**：新增"路径 D：进阶游戏基础架构"、依赖图补边、`check-structure.js` 豁免 self-intro-narrative、执行规范 sync/archive。
5. **回滚**：每波为独立提交；任一波异常 `git revert` 该波即可，不影响其他波与发布。

## Open Questions

- 算法 7 专题是否需要同步扩 `learning-paths`（编码轮路径 E），还是仅进 dependency-map？倾向后者先行。
- `reservoir-sampling` 拆出的时序异常检测归 `game-infra` 还是 `common`？倾向 `common`（跨域通用）。
- game-biz 的 `anti-cheat`/`economy-progression` 是否纳入路径 A/D，还是仅作 game-biz 域补充？

## Why

站点已从最初规范约定的 13 个专题成长为 6 个域、约 45 个专题（每个专题另配 Anki 闪卡），但**目录规范停留在旧结构**、**部分专题内容互相重叠**、**若干高频面试考点尚未覆盖**。一次系统盘点后统一"补遗漏、削冗余、纠漂移"，直接提升三条学习路径（游戏基础架构 / 互联网后台 / AI 工程）的面试命中率。

本次盘点已完成，核心结论（均已核对真实文件，剔除误报）：

- **规范漂移**：`interview-topic-catalog` 规范仍写"13 专题 + 四段式（是什么→为什么这么选→踩过什么坑→怎么填的）"，而线上是"约 45 专题 + 五段式（场景问题→实现方案→为什么这么做→为什么别的选择不行→沉淀结论）"，且 `scripts/check-structure.js` 强制的是五段式。规范与现实、规范与门禁三方不一致。
- **冗余待调**：限流三件套、服务网格四件套（含 nzmesh"是不是 gossip"的自相矛盾表述）、eBPF↔k8s-network、business-proxy↔idempotency-design、RAG 四拆文件等存在实质重复或口径冲突。
- **遗漏待补（已核实确无独立专题）**：算法域缺贪心 / 位运算 / 单调栈 / 字符串匹配(KMP) / 区间 / 数论 / 并查集(独立)；`common` 缺可观测性（链路追踪/指标/日志，现散落在 10 个文件里无归属）；`ai-llm` 缺提示注入安全 / 评测方法论 / 成本延迟 / 微调策略。
- **体量失衡**：`ai-eng-practices.md`(967 行) катч-all、`reservoir-sampling.md`(515 行) 塞入了正交的时序异常检测、`http-tls-rpc.md`(165 行) 相对其覆盖面偏薄。
- **结构断点**：约 13 个 game-infra 专题未进入任何学习路径（缺"进阶游戏基础架构"路径）；`self-intro-narrative.md` 被结构门禁误报。

> 澄清两处误报：`raft-gossip` 已覆盖 Raft 共识/选主，`distributed-transaction` 已覆盖 2PC/TCC/Saga —— 不作为遗漏项处理。

## What Changes

围绕"更多技术面试成功率"，分四波推进（P1 冗余先行、风险最低；P4 规范收口）：

- **P1 削冗余（内容不新增，只去重 + 交叉链接，确立单一事实源）**
  - 限流三件套划清边界：`token-leaky-bucket` 作算法唯一详解，`rate-limit` 作"互联网 vs 游戏"选型框架，`ratelimit-circuitbreak` 作熔断降级韧性；删去彼此重复的桶算法定义，互加交叉链接。
  - 服务网格：修正 `self-mesh-k8s` 与 `raft-gossip` 对 nzmesh"是不是 gossip"的冲突口径（统一为"全连接广播是 gossip 的一种特例，只是省去 incarnation/间接探测"），nzmesh 实现代码归并到单一归属页，另一页改为引用。
  - `ebpf` 与 `k8s-network` 去重"eBPF 为何优于 iptables"，保留一处 + 交叉链接。
  - `business-proxy` 的"幂等四道闸"改为引用 `idempotency-design`，只保留支付场景的特化差异。
  - RAG 四文件确立层级：`rag` 为主线枢纽，`rag-data-cleaning` 与主线 chunking 去重，`rag-context-pruning` 定位为实现级深潜引用，`rag-storage-cleanup` 正名为运维/版本化；四文件建立清晰交叉链接。
  - `tcp-net`/`lvs-epoll`/`os-zerocopy` 的 epoll/零拷贝确立唯一详解归属 + 三方交叉链接；`two-pointers-sliding-window`↔`internet/sliding-window`、`backend-algorithms`↔`data-structures` 加消歧交叉链接。

- **P2 治体量（拆分/瘦身/补薄）**
  - `reservoir-sampling` 拆出 `time-series-anomaly-detection`（EWMA/ARIMA/滑窗），本体回归抽样算法本身。
  - `ai-eng-practices` 重构：顶部加 TOC + 决策树，剥离已在 `llm-fundamentals`/`agent-dev`/`rag` 的基础理论改为链接，收敛重复段落。
  - `http-tls-rpc` 补厚：HTTP/2 HPACK、HTTP/3 QUIC 要点、TLS1.3 0-RTT 风险。

- **P3 补遗漏（新增专题，均按五段式 + 记忆锚点 + 配套 .cards.md）**
  - 算法域：`greedy`、`bit-manipulation`、`monotonic-stack`、`string-matching`(KMP/Z/Rabin-Karp)、`intervals`、`math-number-theory`、`union-find`（从 graph 抽出独立成篇）。
  - `common` 域：`observability`（链路追踪/指标/日志/采样/关联 ID）。
  - `game-biz` 域：`anti-cheat`（服务端权威/信任边界/作弊信号）、`economy-progression`（软经济/成长/资源回收/赛季）。
  - `ai-llm` 域：`llm-security`（提示注入/越狱/防护）、`llm-evaluation`（超越 RAGAS 的评测方法论）、`llm-cost-latency`（Token 经济/延迟 SLA）、`fine-tuning`（SFT/RLHF/DPO 选型）。

- **P4 纠漂移 + 收结构**
  - `learning-paths` 新增"路径 D：进阶游戏基础架构"覆盖 13 个孤儿专题；新增专题全部接入 `dependency-map`。
  - 修正 `interview-topic-catalog` 规范：更新为真实专题清单与五段式，新增"冗余治理/单一事实源/交叉链接"要求。
  - `scripts/check-structure.js` 将 `self-intro-narrative.md` 纳入豁免清单，消除误报。

## Capabilities

### New Capabilities
- `algo-catalog`: 算法域（`/algo/`）内容目录规范——定义 8 个既有专题 + 7 个待补专题（greedy/bit-manipulation/monotonic-stack/string-matching/intervals/math-number-theory/union-find）的关键知识点必含项与五段式验收门槛。此前该域无任何规范覆盖。
- `content-redundancy-policy`: 冗余治理规范——定义"重叠专题必须确立单一事实源、彼此去重、双向交叉链接"的可验收规则，覆盖限流三件套、网格四件套、RAG 四文件、network/IO 三件套等已识别簇。

### Modified Capabilities
- `interview-topic-catalog`: 修正规范漂移——由"13 专题 + 四段式"更新为真实的多域约 45 专题清单与五段式（场景问题→实现方案→为什么这么做→为什么别的选择不行→沉淀结论），与 `check-structure.js` 门禁对齐；补充体量失衡专题（ai-eng-practices/reservoir-sampling）的拆分/瘦身验收项。
- `ai-llm-catalog`: 扩充 AI 域专题清单——新增 `llm-security`、`llm-evaluation`、`llm-cost-latency`、`fine-tuning` 四个专题的必含项要求。

## Impact

- **内容**：`docs/` 下约 20 个既有专题被去重/交叉链接/瘦身/补厚；新增约 13 个专题 `.md` + 对应 `.cards.md`。
- **导航与结构**：`docs/intro/learning-paths.md`（新增路径 D）、`docs/intro/dependency-map.md`（接入新专题）、`docs/.vuepress/configs/sidebar.js`（新增专题侧边栏）。
- **规范**：`openspec/specs/interview-topic-catalog/`、`openspec/specs/ai-llm-catalog/` 更新；新增 `openspec/specs/algo-catalog/`、`openspec/specs/content-redundancy-policy/`。
- **门禁脚本**：`scripts/check-structure.js`（豁免 self-intro-narrative）；新增专题需通过 `npm run check:md` 与 `npm run check:structure`，并纳入 `npm run generate:cards`。
- **非破坏性**：不删除任何既有专题（冗余项走"去重+链接"而非删除）；不改变构建/发布流程。

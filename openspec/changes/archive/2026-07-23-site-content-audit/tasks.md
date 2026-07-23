# Tasks · site-content-audit

> 分四波推进：P1 冗余先行（零新增、风险最低）→ P2 治体量 → P3 补遗漏 → P4 纠漂移收口。每波独立可交付、可回滚。每项内容改动均须过 `npm run check:md`；新增/改写专题另须过 `npm run check:structure` 并 `npm run generate:cards`。

## 1. P1 削冗余（去重 + 单一事实源 + 双向交叉链接）

- [x] 1.1 限流三件套划界：`token-leaky-bucket` 保留桶算法唯一详解；`rate-limit` 删除重复的桶定义，收敛为"互联网 vs 游戏"选型框架并链接过去；`ratelimit-circuitbreak` 聚焦熔断/降级并链接过去（三方双向可达）
- [x] 1.2 网格 nzmesh 口径统一：在 `self-mesh-k8s.md` 校正清单显式区分"算法差异 vs 架构归类"，统一表述为"全连接广播 = gossip 特例（省 incarnation/间接探测）"；nzmesh 实现代码归并到 `self-mesh-k8s`，`raft-gossip.md` 改为保留 SWIM 理论 + 链接引用
- [x] 1.3 `ebpf.md` 删除"eBPF 为何优于 iptables"重复段，改链接 `k8s-network.md` 的 kube-proxy 演进表；两篇双向加链
- [x] 1.4 `business-proxy.md` 的"幂等四道闸"改为引用 `idempotency-design.md`，仅保留支付场景特化差异
- [x] 1.5 RAG 四文件分层互链：`rag.md` 立为主线枢纽并链接其余三篇；`rag-data-cleaning` 与主线 chunking 去重；`rag-context-pruning` 标注实现级深潜；`rag-storage-cleanup` 正名为向量库运维/版本化
- [x] 1.6 network/IO 三件套：`os-zerocopy` 定为零拷贝唯一详解、`lvs-epoll` 或 `tcp-net` 定为 epoll 详解归属；其余处改链接引用，三方双向加链
- [x] 1.7 算法消歧加链：`two-pointers-sliding-window` ↔ `internet/sliding-window`（同名异义）、`backend-algorithms` ↔ `data-structures`（树家族归属）
- [x] 1.8 跑 `npm run check:md` 确认 P1 全部改动不破坏构建

## 2. P2 治体量（拆分 / 瘦身 / 补厚）

- [x] 2.1 从 `reservoir-sampling.md` 拆出新专题 `docs/common/time-series-anomaly-detection.md`（EWMA/ARIMA/滑窗），本体回归蓄水池抽样；两侧交叉链接；生成闪卡；接入 sidebar/dependency-map
- [x] 2.2 重构 `ai-eng-practices.md`：顶部加 TOC/决策树；将 `llm-fundamentals`/`agent-dev`/`rag` 已讲基础理论改为链接；收敛 evomap 等重复段落
- [x] 2.3 补厚 `http-tls-rpc.md`：新增 HTTP/2 HPACK、HTTP/3 QUIC 要点、TLS1.3 0-RTT 风险
- [x] 2.4 跑 `npm run check:md` 与 `npm run check:structure` 确认 P2 改动合规

## 3. P3 补遗漏 · 算法域（7 篇，按 `algo-catalog` 必含项）

- [x] 3.1 新增 `docs/algo/greedy.md`（贪心判定 + 交换论证 + 活动选择/Huffman/跳跃游戏/加油站/分糖果/任务调度器）
- [x] 3.2 新增 `docs/algo/bit-manipulation.md`（位技巧 + 只出现一次系列/位1计数/格雷码/子集枚举/汉明距离）
- [x] 3.3 新增 `docs/algo/monotonic-stack.md`（单调栈/单调队列模板 + 每日温度/柱状图最大矩形/接雨水/滑窗最大值）
- [x] 3.4 新增 `docs/algo/string-matching.md`（KMP/Rabin-Karp/Z 函数/AC 自动机概览 + strStr/重复子串/最短回文串）
- [x] 3.5 新增 `docs/algo/intervals.md`（排序套路 + 合并/插入/交集/会议室 I·II/最少箭 + 差分与扫描线）
- [x] 3.6 新增 `docs/algo/math-number-theory.md`（GCD/快速幂/模运算/质数筛/逆元/Fisher-Yates + Pow/快乐数/计数质数/多数元素）
- [x] 3.7 新增 `docs/algo/union-find.md`（按秩合并+路径压缩 + 岛屿数量/冗余连接/账户合并/被围绕区域），并从 `graph.md` 抽出并双向加链
- [x] 3.8 为 3.1–3.7 逐篇生成 `.cards.md`、接入 `sidebar.js` 与 `dependency-map.md`、过 `check:structure`

## 4. P3 补遗漏 · common / ai-llm / game-biz

- [x] 4.1 新增 `docs/common/observability.md`（三支柱 + 链路追踪/采样/关联 ID + RED·USE + 分位数陷阱 + OpenTelemetry/Prometheus/Jaeger + 延迟突刺排障）
- [x] 4.2 新增 `docs/ai-llm/llm-security.md`（提示注入/越狱/泄漏 + 工具·RAG 注入放大 + 输入校验/输出过滤/沙箱 + 信任边界 + 红队）
- [x] 4.3 新增 `docs/ai-llm/llm-evaluation.md`（指标分类 + 基准污染 + LLM-as-judge 偏差 + 人类在环 + 离线回放/影子流量 + Golden Set）
- [x] 4.4 新增 `docs/ai-llm/llm-cost-latency.md`（Token 经济 + TTFT/TPOT + 三角权衡 + 缓存/小模型路由/批处理/量化 + 延迟 SLA 与预算护栏）
- [x] 4.5 新增 `docs/ai-llm/fine-tuning.md`（全参 vs PEFT/LoRA/QLoRA + SFT vs RLHF vs DPO + 微调 vs RAG vs Prompt 决策 + 灾难性遗忘）
- [x] 4.6 新增 `docs/game-biz/anti-cheat.md`（服务端权威 + 信任边界 + 作弊类型与检测信号 + 遥测评分 + 批量/异步校验 + 封禁申诉）
- [x] 4.7 新增 `docs/game-biz/economy-progression.md`（软/硬货币 sink·source + 成长曲线/战令 + 赛季软·硬重置 + 通胀定价 + 免费/付费平衡）
- [x] 4.8 为 4.1–4.7 逐篇生成 `.cards.md`、接入 `sidebar.js` 与 `dependency-map.md`、按各自 catalog 必含项建立交叉链接、过双门禁

## 5. P4 纠漂移 + 结构收口

- [x] 5.1 `docs/intro/learning-paths.md` 新增"路径 D：进阶游戏基础架构"，覆盖 `access-gateway`/`cni-plugins`/`config-hot-reload`/`cpp-coroutine`/`ebpf`/`llvm-compile`/`mesh-central-vs-decentral`/`mesh-istio-cilium`/`message-bus`/`release-strategy`/`sanitizers`/`seckill`/`token-leaky-bucket` 等孤儿专题
- [x] 5.2 `docs/intro/dependency-map.md` 补入所有新增专题的节点、边与 click 跳转，确认无孤儿
- [x] 5.3 `scripts/check-structure.js` 将 `self-intro-narrative.md` 纳入豁免清单，消除误报；重跑确认门禁 0 退出
- [x] 5.4 全站跑 `npm run docs:build` 确认无死链/构建失败
- [ ] 5.5 执行规范同步：将 `interview-topic-catalog`/`ai-llm-catalog` delta 与新增 `algo-catalog`/`content-redundancy-policy` 同步到 `openspec/specs/`（`/opsx:sync` 或归档流程）

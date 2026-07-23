# Tasks — narrative-humor-polish

> 每个"专题"任务 = 对该专题**源 `.md`** 执行润色配方 7 项检查清单：①开篇钩子是场景非定义 ②最难核心机制配幽默类比 ③类比后标失效边界 ④`### 记忆口诀` 可背诵 ⑤`interview-topic-catalog` 必含项自查不减 ⑥去重/隐私红线自查 ⑦不破 `:::`/`<details>` 缩进。
> `.cards.md` **不手改**——由每域收尾统一运行 `npm run generate:cards` 从源 `.md`（`### 记忆口诀` + `## 自测`）重新生成并一并提交。

## 1. 准备与配方固化

- [x] 1.1 汇总 7 项润色检查清单为可勾选模板，作为每个专题任务的验收口径
- [x] 1.2 确认 `npm run generate:cards`、`npm run check:structure`、`npm run check:md` 与本地构建均可跑通，作为每域收尾门禁
- [x] 1.3 抽 1 个已有专题（如 `raft-gossip`）做样板润色，确立钩子/类比/锚点的密度基线

## 2. algo 域

- [x] 2.1 润色 `backend-algorithms`
- [x] 2.2 润色 `data-structures`
- [x] 2.3 润色 `sorting`
- [x] 2.4 润色 `binary-search`
- [x] 2.5 润色 `two-pointers-sliding-window`
- [x] 2.6 润色 `monotonic-stack`
- [x] 2.7 润色 `dynamic-programming`
- [x] 2.8 润色 `backtracking`
- [x] 2.9 润色 `greedy`
- [x] 2.10 润色 `graph`
- [x] 2.11 润色 `union-find`
- [x] 2.12 润色 `intervals`
- [x] 2.13 润色 `string-matching`
- [x] 2.14 润色 `bit-manipulation`
- [x] 2.15 润色 `math-number-theory`
- [x] 2.16 algo 域收尾：`npm run generate:cards` 重生成闪卡 + `check:structure`/`check:md` + 构建通过，提交 `docs(algo): …`

## 3. common 域

- [x] 3.1 润色 `concurrency`
- [x] 3.2 润色 `cpp11-gotchas`
- [x] 3.3 润色 `cpp20-gotchas`
- [x] 3.4 润色 `go-gotchas`
- [x] 3.5 润色 `rust-gotchas`
- [x] 3.6 润色 `design-model`
- [x] 3.7 润色 `distributed-transaction`
- [x] 3.8 润色 `gc-stw`
- [x] 3.9 润色 `http-tls-rpc`
- [x] 3.10 润色 `message-queue`
- [x] 3.11 润色 `mysql-innodb`
- [x] 3.12 润色 `redis`
- [x] 3.13 润色 `observability`
- [x] 3.14 润色 `os-zerocopy`
- [x] 3.15 润色 `time-series-anomaly-detection`
- [x] 3.16 common 域收尾：`npm run generate:cards` 重生成闪卡 + `check:structure`/`check:md` + 构建通过，提交 `docs(common): …`

## 4. internet 域

- [x] 4.1 润色 `tcp-net`
- [x] 4.2 润色 `lvs-epoll`
- [x] 4.3 润色 `sliding-window`
- [x] 4.4 润色 `dns-clean-intercept`
- [x] 4.5 润色 `dns-attack-tunnel`
- [x] 4.6 润色 `php-fpm-nginx`
- [x] 4.7 润色 `iot-mqtt`
- [x] 4.8 润色 `elixir-fp`
- [x] 4.9 润色 `frontend-engineering`
- [x] 4.10 internet 域收尾：`npm run generate:cards` 重生成闪卡 + `check:structure`/`check:md` + 构建通过，提交 `docs(internet): …`

## 5. game-infra 域

- [x] 5.1 润色 `access-gateway`
- [x] 5.2 润色 `message-bus`
- [x] 5.3 润色 `rate-limit`
- [x] 5.4 润色 `token-leaky-bucket`
- [x] 5.5 润色 `ratelimit-circuitbreak`
- [x] 5.6 润色 `raft-gossip`
- [x] 5.7 润色 `consistent-hash-impl`
- [x] 5.8 润色 `reservoir-sampling`
- [x] 5.9 润色 `distributed-kv`
- [x] 5.10 润色 `self-mesh-k8s`
- [x] 5.11 润色 `mesh-central-vs-decentral`
- [x] 5.12 润色 `mesh-istio-cilium`
- [x] 5.13 润色 `k8s-network`
- [x] 5.14 润色 `cni-plugins`
- [x] 5.15 润色 `ebpf`
- [x] 5.16 润色 `cpp-coroutine`
- [x] 5.17 润色 `llvm-compile`
- [x] 5.18 润色 `sanitizers`
- [x] 5.19 润色 `lockstep`
- [x] 5.20 润色 `seckill`
- [x] 5.21 润色 `config-hot-reload`
- [x] 5.22 润色 `release-strategy`
- [x] 5.23 润色 `stateful-migration`
- [x] 5.24 润色 `stateful-recovery`
- [x] 5.25 game-infra 域收尾：`npm run generate:cards` 重生成闪卡 + `check:structure`/`check:md` + 构建通过，提交 `docs(game-infra): …`

## 6. game-biz 域

- [x] 6.1 润色 `game-vs-internet`
- [x] 6.2 润色 `business-proxy`
- [x] 6.3 润色 `idempotency-design`
- [x] 6.4 润色 `activity-framework`
- [x] 6.5 润色 `economy-progression`
- [x] 6.6 润色 `gacha`
- [x] 6.7 润色 `anti-cheat`
- [x] 6.8 润色 `leaderboard`
- [x] 6.9 润色 `matchmaking`
- [x] 6.10 润色 `mail`
- [x] 6.11 润色 `redis-room-recommend`
- [x] 6.12 game-biz 域收尾：`npm run generate:cards` 重生成闪卡 + `check:structure`/`check:md` + 构建通过，提交 `docs(game-biz): …`

## 7. ai-llm 域

- [x] 7.1 润色 `llm-fundamentals`
- [x] 7.2 润色 `llm-inference-optimization`
- [x] 7.3 润色 `llm-cost-latency`
- [x] 7.4 润色 `llm-evaluation`
- [x] 7.5 润色 `fine-tuning`
- [x] 7.6 润色 `llm-security`
- [x] 7.7 润色 `rag`
- [x] 7.8 润色 `rag-data-cleaning`
- [x] 7.9 润色 `rag-context-pruning`
- [x] 7.10 润色 `rag-storage-cleanup`
- [x] 7.11 润色 `agent-dev`
- [x] 7.12 润色 `ai-eng-practices`
- [x] 7.13 ai-llm 域收尾：`npm run generate:cards` 重生成闪卡 + `check:structure`/`check:md` + 构建通过，提交 `docs(ai-llm): …`

## 8. 全站验收

- [x] 8.1 全站构建通过，无 `:::`/`<details>` 缩进 lint 失败
- [x] 8.2 抽查 ≥6 个专题（每域 1 个）：源 `.md` 经 `generate:cards` 后 `.cards.md` 口诀/卡片与正文一致，且 `.cards.md` 无手工改动残留
- [x] 8.3 抽查红线：润色无新增技术错误、`interview-topic-catalog` 必含项不减、无隐私/冗余违规
- [x] 8.4 归档前用 `openspec status --change narrative-humor-polish` 确认全部任务完成

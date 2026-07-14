## Context

本站为公开发布的后台面试复习站点（VuePress 2，构建后发布到 GitHub Pages 与腾讯云 COS）。当前正文、文件 slug、侧边栏 / 导航配置以及 `README` 中直接出现真实雇主名、项目代号、内部专有系统名与个人 PII。全站扫描命中概况：

- 雇主 / 项目：`360`、`腾讯`、`微视`、`天美`、`逆战`、`怪物猎人`、`星之破晓`、`宝可梦大集结` —— 集中在 `docs/intro/README.md`、`docs/game-infra/*`、`docs/game-biz/business-proxy.md`。
- 内部系统（同时是文件 slug）：`tconnd`（≈82）、`tbus`（≈53）、`xmesh/xMesh`（≈28）、`tcaplusdb`（≈20）、另有 `tRPC`、`Oteam`、`EPC`。
- 个人 PII：`super marco`、`marco`、`0x06`。

约束：本次仅做**匿名化脱敏**，不重写内容逻辑；须保持站点可正常构建、无死链；须保留全部技术知识价值。

## Goals / Non-Goals

**Goals:**
- 已发布内容中不再出现可识别的真实雇主 / 项目代号 / 内部系统名 / 个人 PII。
- 内部系统名替换为通用等价物并附公开类比，读者仍能理解技术定位。
- 文件 slug、链接、导航去内部代号且构建无死链。
- 全站术语替换一致（依据统一术语映射表）。

**Non-Goals:**
- 不做表达 / 逻辑 / 结构层面的内容重写（五段式打磨、论证补全、可读性重排）——留待后续独立 change。
- 不改写 git 历史（历史提交中的原始名称本次不处理）。
- 不处理 `openspec/**` 内部规划文档中的名称（未发布、非站点内容，见风险条目）。
- 不手改 `docs/.vuepress/dist/**`（构建产物，重建即覆盖）。

## Decisions

### D1：内部系统名 → 通用等价物 + 公开类比（而非直接删除或保留代号）
保留技术知识价值的前提下去代号。采用固定术语映射表，首次出现处加一句公开类比。

**术语映射表（落地基准，apply 时以此为准）：**

| 原始 | 泛化替换 | 首次出现类比 |
|---|---|---|
| 360 | 某互联网安全公司 | —— |
| 腾讯 / 鹅厂 / Tencent | 某头部游戏大厂 | —— |
| 微视 / 微视中台 | 某短视频中台 | —— |
| 天美 | 某头部游戏工作室 | —— |
| 逆战（手游） | 某射击手游 | —— |
| 怪物猎人（上云） | 某端转手游上云项目 | —— |
| 星之破晓 | 某格斗手游 | —— |
| 宝可梦大集结 | 某 MOBA 手游 | —— |
| tconnd | 长连接接入网关 | 职能类似公有云接入层 / LVS + 长连接网关 |
| tbus | 内部消息总线 | 类似进程间 / 服务间的自研消息总线 |
| tcaplusdb | 分布式 KV 存储 | 类似公有云表格存储 / DynamoDB 类 NoSQL |
| xmesh / xMesh | 自研服务网格 | 类似 Istio/Envoy 但点对点、无 sidecar 全量下发 |
| tRPC | 自研 RPC 框架 | 类似 gRPC + 服务治理 |
| Oteam | 公司级开源协同小组 | —— |
| EPC | 工程效能建设 | —— |

**保留项（公开信息，非隐私）：** `Meshery`（真实开源项目，可保留项目名，但淡化"成员"个人角色）、`鲲鹏`/`信创`/`CoreDNS`/`Erlang`（公开技术生态）。alternatives：全部删除会损失知识价值；保留代号仅加注则仍泄露内部名——均否。

### D2：文件 slug 重命名并全量更新引用
以内部代号命名的文档重命名为泛化 slug，同步改 `sidebar.js`、`navbar.js`、`docs/README.md`、根 `README.md` 及跨文档链接。建议映射：

| 原文件 | 新文件 |
|---|---|
| `docs/game-infra/tconnd.md` | `docs/game-infra/access-gateway.md` |
| `docs/game-infra/tbus.md` | `docs/game-infra/message-bus.md` |
| `docs/game-infra/xmesh-k8s.md` | `docs/game-infra/self-mesh-k8s.md` |
| `docs/game-infra/tcaplusdb.md` | `docs/game-infra/distributed-kv.md` |

alternative：保留 slug 只改正文——否，slug 出现在公开 URL 中同样泄露代号。用 `git mv` 保留历史追溯。

### D3：一次性全站脚本辅助 + 人工复核
先用脚本做机械替换（基于术语表），再逐文件人工复核语境（尤其类比注解、中英混排、代码块内的示例命名），最后以 `docs:build` + 全站关键词复扫做验收门槛（命中数须为 0）。

### D4：实施期发现的扩充映射与分级（apply 补充）

全站扫描发现的可识别实体远多于 D1 初表，且风险分两级，处理策略随之分级：

**（a）自研内部内容（高风险，深度脱敏）—— `business-proxy.md`、`xmesh-k8s.md`**

| 原始 | 泛化替换 |
|---|---|
| platpxy / paypxy / mallsvrd / lobbysvrd / dbsvrd / bagsvrd | 平台代理 / 支付代理 / 商城服务 / 大厅服务 / DB 服务 / 背包服务 |
| 米大师 / Midas | 某统一计费平台 |
| WeGame / 微信 / QQ / 抖音 / GVoice / 企业微信 | 某 PC 游戏平台 / 主流社交平台 / 某短视频平台 / 语音服务 / 企业 IM |
| 腾讯安全 TSS / Hope / RLBot·MetaAI | 内容安全服务 / 未成年人保护平台 / AI 对局机器人 |
| Q币·Q卡·QQ钱包 / 逆战点 | 平台币·储值卡·平台钱包 / 游戏点券 |
| L5 / Polaris / 北极星 | 服务发现（注册中心） |
| GSM / gsmv2 / AcoContext | 监控告警系统 / 协程框架 |
| xmesh_*（源码符号）/ xmeshpanel / local_tbus | mesh_*（去 x 前缀）/ mesh-panel / local_bus |
| TBusPP-MESH（公司组件）/ TBUSID | 某公司内部 Mesh 组件 / 数字实例 ID |
| 源码 file:line（`xmesh_main.c:476`、`platpxy/src/main.go:12`…）| 删除坐标，仅留机制描述 |
| `xsvr.internal` / 腾讯 BCS·`bkbcs.tencent.com` | 内网运维面板 / 某云厂商托管 K8s 的自定义 Ingress |
| `@jessonchen` + 日期 | 删除署名，保留"曾反复调整"叙述 |
| CVM(SA2/SA3/S6) / nju·sh.yaml | 云主机（虚拟化机型）/ 多地域集群 |
| `libgotss_sdk.so`(130MB) | 内容安全 SDK（大体积 cgo C++ 动态库） |
| 个人本地路径 `~/Desktop/*`、`/Users/marcopu/...`、抽取日期 | 删除或改为"综合整理" |

通用编程符号（`ComputeSig`/`UrlEncode`/`MallContext` 等，不含品牌）保留为示意，不影响脱敏。

**（b）公开手册框架笔记（低风险，浅层脱敏）—— `tconnd.md`、`tbus.md`、`tcaplusdb.md`**

用户决策：**仅去品牌 + 头部代号**，保留公开手册技术组件名（不动逻辑）。

- 去除：`腾讯`/`Tencent`/`鹅厂`、`TSF4G(Tencent Service Framework for Game)` → "某游戏后台框架"；`TGW（腾讯网关）` → "外部接入网关(L4)"。
- 头部代号泛化：`tconnd/TCONND` → 接入网关；`tbus/TBUS/TBus` → 消息总线（共享内存）；`tcaplusdb/TcaplusDB` → 分布式 KV；`xmesh` → 自研 Mesh。
- **保留**：`FRAME/TFRAMEHEAD`、`GCIM`、`TDR`、`APS`、`ClusterAgent`、`PDU` 及五种模式、`TxxxAPI`、各配置字段名 —— 均为公开手册术语，删之不成文。

## Risks / Trade-offs

- [URL 失效 / BREAKING] → 个人复习站，站外入站链接风险低；如需可在后续加 301/客户端重定向，本次不做。
- [代码块 / 示例标识符中的代号残留]（如变量名、注释含 `tconnd`）→ 复扫须包含代码块；替换时保证示例仍语义自洽。
- [半脱敏 / 前后不一致] → 以术语映射表为唯一基准，验收阶段全站关键词命中数须为 0。
- [`openspec/specs/interview-topic-catalog` 等规划文档也内嵌原始名称（如 `platpxy`/`paypxy`/`mallsvrd`/`逆战`/`360`）] → 属未发布的内部规划产物，本次划为 Non-Goal；若后续仓库整体开源，需另开 change 处理。
- [git 历史仍含原始名称] → 本次不改历史；如有强隐私需求需专门的 history-rewrite change（高风险，单列）。

## Migration Plan

1. 落地术语映射表（写入本 design 已完成）。
2. 正文脱敏（按目录批次：intro → game-infra → game-biz → ai-llm/common）。
3. `git mv` 重命名 slug，更新 sidebar/navbar/README/跨链。
4. `npm run docs:build` 验证无死链；全站关键词复扫命中数为 0。
5. 回滚：本次为纯内容改动，`git revert` 即可回滚。

## Open Questions

- slug 新命名是否采用上表建议值，或用户有偏好命名？（apply 时可微调，不阻塞）
- `Meshery` 开源参与经历是否保留项目名？（默认保留项目、淡化个人角色）

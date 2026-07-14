## Why

本站是**公开发布**的后台面试复习站点（GitHub Pages + 腾讯云 COS），但正文中直接出现了可识别的真实雇主（360、腾讯）、具体项目代号（微视、天美、逆战、怪物猎人、星之破晓、宝可梦大集结）、公司内部专有系统名（tcaplusdb、tbus、tconnd、xmesh、tRPC 等）以及个人身份线索。这些信息一旦被搜索引擎收录，会带来隐私与合规风险，也可能泄露前雇主的内部技术细节。需要在保留全部技术知识价值的前提下，对全站做一次**全面匿名化**。

## What Changes

- **正文脱敏**：将全站 Markdown 中的真实雇主名替换为泛化描述（如"某互联网安全公司""某头部游戏大厂"）。
- **项目代号泛化**：具体游戏 / 项目代号替换为品类化描述（如"某短视频中台""某 MOBA 手游""某射击手游"），保留其技术场景。
- **内部系统名等价替换**：内部专有系统名替换为**通用等价物 + 公开类比**（如 tconnd → 长连接接入网关，tbus → 内部消息总线，tcaplusdb → 分布式 KV 存储，xmesh → 自研服务网格），保证读者仍能理解其技术定位，但不暴露内部代号。
- **文件名 / URL 脱敏**：以内部代号命名的文档 slug（`tconnd.md`、`tbus.md`、`xmesh-k8s.md`、`tcaplusdb.md`）重命名为泛化 slug，并同步更新侧边栏、导航、跨文档链接与站点入口引用。**BREAKING**：原有页面 URL 将失效（个人复习站，站外入站链接风险低）。
- **个人身份线索移除**：移除昵称（super marco）、个人域名/联系线索（0x06）等 PII，保留"从互联网到游戏"的经历骨架但去个人化。
- **一致性词表**：建立并落地一份术语映射表，保证同一实体在全站被替换为同一泛化词，避免半脱敏 / 前后不一致。

**非目标**：本次**不**做表达 / 逻辑 / 结构层面的内容重写与优化（五段式打磨、论证补全、可读性重排等留待后续独立 change）；**不**改写 git 历史（历史提交中的原始名称属独立议题，本次不处理）。

## Capabilities

### New Capabilities

- `content-privacy-policy`: 定义全站内容发布前必须满足的隐私 / 匿名化要求——禁止出现真实雇主名、项目代号、内部专有系统名与个人 PII；规定泛化与类比替换规则、术语一致性要求，以及文件 slug / 链接不得泄露内部代号。

### Modified Capabilities

<!-- 现有 catalog 类 spec（interview-topic-catalog / ai-llm-catalog / interview-review-hub）的行为需求不变，仅其条目的展示标题与 slug 因脱敏而变化，不涉及需求级改动，故此处留空。 -->

## Impact

- **内容**：`docs/**/*.md`（约 9 个文件含敏感命中，正文替换涉及 intro / game-infra / game-biz / ai-llm 等）。
- **配置 / 路由**：`docs/.vuepress/configs/sidebar.js`、`docs/.vuepress/configs/navbar.js`、`docs/README.md`、根 `README.md`、`package.json` 描述字段。
- **构建产物**：`docs/.vuepress/dist/**` 由构建重新生成，无需手改。
- **依赖 / 系统**：无代码依赖变更；发布流程（Pages / COS）不变。

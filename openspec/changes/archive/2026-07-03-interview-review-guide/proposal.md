## Why

面试即将到来，需要一份可长期复习、脉络清晰的"个人技术雷达"：把 9 年经验（3 年互联网后台 + 6 年游戏后台）中真正能讲透的关键点——业务代理演进（platpxy/paypxy/mallsvrd）、自研服务网格 NZMesh 与 K8s 部署——串成一张知识拓扑，并补齐面试常问但个人手头文档尚缺的 4 大主题（限流、Redis 版本演进与分布式、K8s 异构与网络插件、Agent 开发）。目前信息散落在桌面 Markdown，无法快速切题、无法在面试前几分钟快速回顾。做一份**动态 HTML 复习中心**，能按主题切换、快速跳转关键点、并保留可扩展性以便后续按专题独立生成 HTML 分册。

## What Changes

- 建立 `guide/`（本仓库根下）复习中心目录，产出**一份可离线打开的动态 HTML 首页 `index.html`**，含：
  - 个人简介卡片（毕业到今，两段工作经历要点）
  - 中央拓扑图（9 大主题节点 + 关系连线，SVG 手绘不依赖第三方 CDN）
  - 主题切换标签（点击拓扑节点或标签切换主题详情面板）
  - 每个主题的"关键知识点 + 面试话术 + 踩坑与填坑"三段式内容
- 抽取 3 份桌面 Markdown 的核心信息作为**首批 3 个专题**：
  - `theme-intro`（个人简介 + 高性能/高可用/分布式速记 + 单线程 vs 多线程本质）
  - `theme-business-proxy`（platpxy/paypxy/mallsvrd 业务代理模块技术演进）
  - `theme-nzmesh-k8s`（NZMesh 服务网格 + K8s 部署）
- 补齐 **4 个新专题**（用户明确要求）：
  - `theme-rate-limit`（互联网后台 vs 游戏后台限流方案对比与落地）
  - `theme-redis`（Redis 各版本演进 + 分布式问题与方案）
  - `theme-k8s-network`（K8s 异构混部 + CNI/网络插件原理与落地）
  - `theme-agent-dev`（Agent 开发：Loop、上下文、工具调用、滑动窗口语义分析）
- **动态性设计**：单文件 HTML + 内联 CSS/JS，通过一个 `themes` 数据结构渲染，新增专题只需**在数组里追加一项**并可选地生成一份独立 HTML；提供一个**独立专题 HTML 生成器**（同仓库内一个 `template.html` 骨架 + 每个主题一份 markdown/JSON 数据即可复制生成分册）。
- 所有专题内容以**"是什么 → 为什么这么选 → 踩过什么坑 → 怎么填的"**四段式结构组织，与用户既有笔记对齐。

## Capabilities

### New Capabilities

- `interview-review-hub`: 面试复习中心的动态 HTML 首页规范——含拓扑视图、主题切换、内容结构、样式与交互约束，以及"专题独立 HTML"扩展方式。
- `interview-topic-catalog`: 面试主题目录规范——首批 7 个专题（3 个已有笔记 + 4 个补齐）的**内容纲要与关键知识点必含项**，作为每份 HTML 内容源的最低验收标准。

### Modified Capabilities

<!-- 无——本项目当前 openspec/specs/ 为空，全部为新增能力 -->

## Impact

- 影响范围：本仓库 `/Users/marcopu/lab/interview/` 新增 `guide/` 目录（包含 `index.html`、每个专题的独立 HTML、共用 `template.html`、静态资源）；不改动任何桌面 Markdown 源文件（只读引用）。
- 交付物为**纯静态 HTML/CSS/JS**，双击可开，不依赖网络与外部 CDN（离线安全，面试现场可用）。
- 无外部依赖、无构建工具，任何浏览器直接打开即可；后续新增专题的边际成本≈复制模板 + 填数据。
- 不涉及生产系统、无运行时安全影响。

## Context

用户是拥有 9 年后台开发经验的资深工程师（3 年互联网后台，含 360 智能硬件/DDOS 攻防；6 年游戏后台，含微视中台、怪物猎人上云、星之破晓、宝可梦大集结、逆战手游支付/商城）。桌面已有 3 份高质量 Markdown（`加油.md`、`01-业务代理模块技术演进.md`、`02-XMesh服务网格与K8s部署.md`），但离面试即战力还差两件事：**(1)** 内容散落无法一屏切换、无中央拓扑；**(2)** 面试常问的**限流/Redis/K8s 网络/Agent 开发**四题在个人笔记里覆盖不全。

需求本质：一份**离线可用、动态、可扩展**的复习中心 HTML，既能作为面试现场的"最后一分钟总览"，又能沉淀为长期知识雷达，后续可按专题分册独立打印/发送。

现状约束：
- 仓库当前只有 `.claude/`、`.codebuddy/`、`openspec/`（本次 change 的家）三个目录，无前端工程。
- 用户明确要求"HTML 保证动态性，后续可以生成各专题独有 HTML"——意味着**不能上重型前端框架**（no npm build、no React/Vue toolchain），也不能依赖 CDN（离线场景）。
- 内容以中文为主，需要拓扑图、代码块、表格、可折叠章节。

## Goals / Non-Goals

**Goals:**
- 交付一份 `guide/index.html`：中央拓扑 + 主题标签栏 + 详情面板；单击切主题、无刷新；支持深链（`#theme-xmesh` 直达）。
- 覆盖 **7 个首批专题**：3 个来自现有笔记（Intro / Business-Proxy / XMesh-K8s）+ 4 个新增（Rate-Limit / Redis / K8s-Network / Agent-Dev）。
- 每个专题产出**同结构独立 HTML 分册**（`guide/theme-<slug>.html`），用同一 `template.html` 骨架，方便后续单独分享/打印。
- 全部内容以**"是什么 → 为什么这么选 → 踩过什么坑 → 怎么填的"**四段式组织，与用户既有笔记语言一致。
- 双击即开、离线可用、无网络请求；一切资源内联或本地相对引用。

**Non-Goals:**
- **不做**服务端、账号、评论、协同编辑。
- **不做**内容管理系统（CMS）、Markdown 实时渲染引擎。用户要复用桌面 md，直接把关键点抽出内联到 HTML/JS 数据里，而不是运行时解析 md。
- **不做**动画大量粒子、3D 拓扑。拓扑图用手绘 SVG 即可（信息密度胜于炫技）。
- **不涉及** OpenSpec 的 specs 目录用于业务能力（本仓库特殊场景：这里"能力"指知识中心自身的规范）。

## Decisions

### Decision 1：单文件内联 HTML + Vanilla JS，不上任何框架

**为什么选**：目标是"双击可开、面试现场断网也能用"。任何 CDN（React/Vue/Marked/Highlight.js）都会在无网时白屏。Vanilla JS + 内联 CSS 的边际复杂度对 7~15 个专题的场景完全够用（DOM 增删 + hash 路由 ≈ 100 行 JS）。

**替代方案**：
- Vite + React：好处是组件化，坏处是需要 build，且 dist 出来仍是多文件，不利于单文件分发；用户明确"生成各专题独有 HTML"暗示轻量分发。
- Docsify/VuePress：需要 CDN 或 npm 生态，不满足离线。
- 纯 Markdown + GitHub 渲染：无法实现拓扑交互 + 主题切换。

### Decision 2：内容数据以内联 JS 数组 `THEMES` 表达，模板由字符串模板函数渲染

**结构**：
```js
const THEMES = [
  {
    id: 'intro',
    title: '个人简介 & 职业主线',
    icon: '👋',
    tagline: '9 年后台，从互联网到游戏',
    sections: [
      { kind: 'kv', title: '两段工作经历', items: [...] },
      { kind: 'quote', text: '分而治之，读写分离...' },
      { kind: 'md', body: '### 高性能\n...' },
    ],
  },
  // ...
]
```

**渲染器**：一个 `renderTheme(theme)` 根据 `section.kind` 分派到对应渲染函数（`kv | quote | md | table | code | callout | topology`）。

**为什么选**：新增专题只需向 `THEMES` push 一项即可，正对 proposal 的"动态性"目标。JSON schema 明确，未来即使换渲染器（例如 Vue）迁移成本低。

**替代方案**：直接把 HTML 写死到 `<section>`——扩展性差、样式重复、无法共用独立分册模板。

### Decision 3：轻量 Markdown 子集（自研 30 行渲染器）用于 `md` 类型

支持：`### 标题` / `**粗体**` / `*斜体*` / 反引号代码 / 三反引号代码块 / 列表 / 表格。理由：Marked 完整版 60KB，我们需要的功能不到 5%。三十行 replace 链搞定，拷进任何专题分册都能独立跑。

### Decision 4：拓扑图用手绘 SVG，节点点击驱动主题切换

- 中央 `<svg viewBox="0 0 800 500">`，7 个圆形节点（每个是一个专题）+ 连线（哪些主题彼此互相引用，例如 XMesh ↔ K8s-Network 有强关联）。
- 每个节点绑 `onclick="switchTheme('rate-limit')"`；键盘可 Tab + Enter；带高亮态。

**为什么不用 D3/vis.js**：太重，且我们节点数固定，力导向反而不稳定；面试时希望拓扑"每次打开都在同样位置，肌肉记忆能对上"。

### Decision 5：主题独立 HTML 用同一模板 `template.html` 生成

`template.html` 是**占位符版**（里头 `__TITLE__`、`__THEME_JSON__`、`__CSS__`、`__JS__`）；我们不做构建工具，直接**在 index.html 顶部提供一个"下载本主题为独立 HTML"按钮**：JS 内 `serializeTheme(theme)` → 拼字符串 → `Blob` → `a[download]`。用户零依赖、零命令行也能生成分册。

**替代方案**：写 Node.js 脚本生成——增加了运行环境要求，与"离线可用"冲突。

### Decision 6：可视样式基调

- **暗色系 + 荧光青/紫**做"技术雷达"感；亮色一键切换（媒体查询 + `[data-theme]`）。
- 字体：系统字体栈优先（PingFang SC / Hiragino Sans GB / Microsoft YaHei / -apple-system）避免加载。
- 代码块用 `<pre><code>` + 我们自己的 CSS 类高亮（不引 highlight.js）。

### Decision 7：4 个新增专题的核心内容边界（保证覆盖到用户明确点名的问题）

- **限流**：互联网侧（Nginx limit_req、Sentinel、令牌桶/漏桶、Redis+Lua、分布式令牌桶、集群限流）+ 游戏侧（Tick 内 CD、玩家/账号/服务器多层、按帧摊派、账号级 QPS、写队列削峰、活动开服洪峰的排队机 + 平滑扩容）+ 二者本质差异（无状态 vs 强状态；I/O 密集 vs 计算密集）。
- **Redis**：版本演进（3.x AOF/RDB、4.x MODULE + PSYNC2、5.x STREAM、6.x 多线程 IO + ACL、7.x FUNCTION + Sharded PubSub + AOF 多文件、8.x 语义索引/JSON 内建 + 更高吞吐）+ 分布式议题（分布式锁的 SETNX/Redlock 争议、看门狗、脑裂、主从异步复制丢数据、Cluster Slot 迁移与 gossip、集群模式下的多 key 事务、Redis 与本地缓存双写一致性、Cache-aside/Write-through/Write-behind、缓存穿透/击穿/雪崩三板斧）。
- **K8s 异构 & CNI**：异构（GPU/ARM/x86 混部、node label + taint/toleration、多 runtime、DS 战斗集群单机独占）+ 网络插件原理（Flannel VXLAN、Calico BGP + IPIP、Cilium eBPF）+ 落地（团队为何选 hostNetwork DaemonSet 跳出 Overlay，跨 K8s 集群主机网络直连的实践与业界对比）。
- **Agent 开发**：Agent Loop 结构（观察-思考-行动-反思）、Tool Use 协议、上下文窗口管理与滑动窗口 + 语义分析压缩、失败恢复与幂等、评测（golden set / red-team）、真实项目（AI 巡检系统）落地要点。

## Risks / Trade-offs

- **[风险] 内容准确性/时效性**（Redis 版本、K8s CNI、Agent 生态更新快）→ **缓解**：每个专题内容标注"截至 2026 年"标签；面试前一天用 5 分钟浏览各专题的"新变化"章节；HTML 结构保留 `changelog` 区，方便后续手工修订。
- **[风险] 单文件 HTML 内容膨胀**（7 主题 ×  详细四段可能 ~200KB+）→ **缓解**：`index.html` 只装**每个专题的摘要 + 关键要点**；深度内容留在**独立分册 HTML**里，标签栏点击时按需加载对应分册（`fetch('theme-redis.html')` 在本地 file:// 也能工作，或直接跳转）。分册也做懒加载。
- **[风险] 桌面 md 内容跟 HTML 不同步**（用户后续改了桌面 md，HTML 没更新）→ **缓解**：明确接受"这是抽取快照"，在页脚注明来源文件路径 + 抽取日期；不做实时联动（那需要构建工具）。
- **[风险] SVG 拓扑在小屏幕不好看**（面试可能用外接投屏或 iPad）→ **缓解**：`viewBox` + `preserveAspectRatio` 允许缩放；<768px 断点切成竖排列表模式（拓扑折叠），主题切换仍可用。
- **[风险] file:// 打开时某些浏览器 fetch 分册 HTML 会被 CORS 拦**（Chrome 严格）→ **缓解**：默认策略是**打开新标签**跳转独立 HTML，不做 fetch 内嵌；点击"独立视图"按钮就是 `window.open('theme-x.html')`。
- **[取舍] 手写 Markdown 渲染器不完美**：不支持嵌套列表深度 > 2、不支持 HTML 块。**取舍**：这批专题内容用不到复杂结构；确实需要复杂结构的段落直接写原生 HTML `kind: 'html'` 逃生舱。
- **[取舍] 无搜索**：7 主题 + Ctrl+F 已经够用；后续如果专题超过 15 个，再加一个纯 JS 前缀树搜索（<50 行）。

## Migration Plan

不涉及生产迁移。交付路径：
1. 新增 `guide/` 目录（不动 `openspec/`、`.claude/`、`.codebuddy/`）。
2. 一次性写好：`template.html`（占位符骨架）、`index.html`（首页 + 拓扑 + 全部主题摘要）、7 个 `theme-<slug>.html`（各专题详情）、`assets/style.css`（可选：如果内联太长可外提，但默认全内联）。
3. 用户拿到后本地双击 `guide/index.html`，无任何环境要求。
4. **回滚**：删除 `guide/` 目录即可，其他文件不受影响。

## Open Questions

- 是否需要一个**"面试模拟"模式**（隐藏答案、只显示问题）？—— 默认先不做，等用户有真实使用反馈；预留 `data-mask` 属性钩子。
- 拓扑图 7 节点之间的**关系连线**是"我认为的关系"还是"面试常见联问"？—— 采取双色线：**实线=技术依赖**（如 XMesh↔K8s-Network），**虚线=面试常联问**（如 Redis↔Rate-Limit 常同一轮出现）。
- 是否要把桌面 md 直接嵌进 HTML？—— 不嵌全文，但在每份专题分册最后放"原始笔记链接"（本地绝对路径），点击提示"macOS 从终端打开"。

## ADDED Requirements

### Requirement: 首页拓扑可视化

复习中心 `guide/index.html` MUST 提供一张单页居中的 SVG 拓扑图，包含全部首批 7 个专题节点、节点间关系连线（区分技术依赖与面试联问两类），且每个节点 MUST 可点击、可键盘 Tab 聚焦、可通过 Enter/Space 触发主题切换。

#### Scenario: 首次打开时展示 7 个节点

- **WHEN** 用户双击 `guide/index.html`
- **THEN** 页面在无网络环境下 500ms 内渲染出中央 SVG 拓扑，包含 7 个专题节点（intro、business-proxy、nzmesh-k8s、rate-limit、redis、k8s-network、agent-dev），每个节点显示图标 + 中文标题

#### Scenario: 点击节点切换到对应主题

- **WHEN** 用户点击某个拓扑节点（例如 rate-limit）
- **THEN** 详情面板无刷新切换到该主题的内容，URL hash 同步更新为 `#rate-limit`，被选中节点在 SVG 中呈现高亮态（描边加粗 + 光晕）

#### Scenario: 键盘可达

- **WHEN** 用户按 Tab 键遍历页面
- **THEN** 每个拓扑节点作为可聚焦元素依次获得焦点，按 Enter 或空格键触发与鼠标点击相同的主题切换行为

#### Scenario: 深链直达

- **WHEN** 用户直接在浏览器地址栏输入 `guide/index.html#redis` 打开
- **THEN** 页面加载完成后自动激活 redis 主题，拓扑图对应节点高亮，详情面板滚动到内容顶部

### Requirement: 主题切换与详情面板

`guide/index.html` MUST 提供顶部标签栏（tab strip）作为拓扑之外的第二切换入口，且 MUST 保证任何一个专题被激活时，详情面板严格按"是什么 → 为什么这么选 → 踩过什么坑 → 怎么填的"四段式渲染其内容。

#### Scenario: 通过标签栏切换主题

- **WHEN** 用户点击顶部标签栏中的任一标签
- **THEN** 详情面板切换到对应主题内容，URL hash 更新，被选中标签视觉上区别于其他标签

#### Scenario: 四段式结构可见

- **WHEN** 任一专题被激活
- **THEN** 详情面板依序渲染四个段落，每个段落有明确的段落标题（"是什么"、"为什么这么选"、"踩过什么坑"、"怎么填的"）；如果某个专题的某段暂缺内容，仍 MUST 保留该段占位（例如"待补充"）以保证结构一致性

#### Scenario: 前进后退可用

- **WHEN** 用户切换若干次主题后按下浏览器"后退"
- **THEN** 页面还原到上一个被激活的主题（通过监听 `hashchange` 实现），拓扑与标签栏高亮态同步

### Requirement: 独立专题 HTML 分册

首批 7 个专题中每一个 MUST 存在一份**独立可离线打开的 HTML 分册文件**（`guide/theme-<slug>.html`），且这些分册 MUST 从统一的 `guide/template.html` 骨架生成，仅注入该专题自身的内容数据。

#### Scenario: 每个专题都有独立文件

- **WHEN** 检查 `guide/` 目录
- **THEN** 存在 `theme-intro.html`、`theme-business-proxy.html`、`theme-nzmesh-k8s.html`、`theme-rate-limit.html`、`theme-redis.html`、`theme-k8s-network.html`、`theme-agent-dev.html` 共 7 份文件

#### Scenario: 分册可独立分发

- **WHEN** 将任一分册单文件复制到另一台断网电脑上双击打开
- **THEN** 页面完整渲染其专题内容，无任何 404、无 CDN 依赖、样式与首页保持一致

#### Scenario: 用户可从首页导出分册

- **WHEN** 用户在首页某专题详情面板点击"下载独立 HTML"按钮
- **THEN** 浏览器触发下载一份 `theme-<slug>.html` 文件，其内容与仓库自带的分册文件在结构上等价（内容以当前 THEMES 数据为准）

### Requirement: 离线与零外部依赖

所有交付物 MUST 在无网络环境下双击 HTML 即可完整运行，MUST NOT 引用任何外部 CDN、字体服务、图片外链、npm 依赖或运行时构建工具。

#### Scenario: 断网打开无 404

- **WHEN** 断网状态下打开任一 HTML 文件（首页或分册）
- **THEN** DevTools 的 Network 面板不出现任何红色（4xx/5xx/failed）请求，页面所有可视元素正常显示

#### Scenario: 无外部资源引用

- **WHEN** 检查任一 HTML 的源码
- **THEN** `<link>`、`<script>`、`<img>`、`url(...)` 等资源引用要么是同目录相对路径，要么是内联，MUST NOT 包含 `https://` 或 `http://` 协议指向的第三方资源

### Requirement: 可扩展的专题数据结构

主题内容 MUST 以内联 JavaScript 中的 `THEMES` 数组表达，且新增一个专题 MUST 只需向该数组追加一项配置（可选地生成一份独立分册），无需修改渲染器或样式表核心逻辑。

#### Scenario: 追加一个专题

- **WHEN** 开发者向 `THEMES` 数组新追加一个 `{ id, title, icon, tagline, sections }` 对象
- **THEN** 首页顶部标签栏自动出现该专题标签、拓扑图逻辑（如手工在 SVG 补一个节点）之外的所有渲染工作无需改代码即完成

#### Scenario: 章节类型可组合

- **WHEN** 一个专题的 `sections` 中混合使用 `kv | quote | md | table | code | callout` 等章节类型
- **THEN** 渲染器按 `section.kind` 分派到对应渲染函数，输出符合视觉规范的 HTML 片段；未知的 `kind` MUST 优雅降级（渲染为普通段落 + 控制台警告），不能整个页面白屏

### Requirement: 响应式与打印友好

页面 MUST 在桌面（>=1024px）、平板（768–1024px）、手机（<768px）三档尺寸下可读；MUST 支持浏览器打印（Ctrl+P）为整洁的 PDF，且打印时 MUST 隐藏交互控件（标签栏、按钮）、展开所有折叠段落。

#### Scenario: 手机上拓扑折叠

- **WHEN** 视口宽度 < 768px
- **THEN** 中央 SVG 拓扑折叠为竖向的主题列表（icon + 标题），点击行为与桌面一致；标签栏改为可横向滑动

#### Scenario: 打印为 PDF 干净

- **WHEN** 用户在任一分册页按 Ctrl+P（或 macOS Cmd+P）
- **THEN** 打印预览中不出现按钮、下载图标、标签栏；四段式内容全部展开、连续排版、代码块换行不截断

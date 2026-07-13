## ADDED Requirements

### Requirement: 复习中心作为归档站点存在

复习中心 MUST 作为一个 VuePress 静态归档站点存在，承载全部专题内容，并由 `vuepress-archive-site` 能力定义其站点交互（导航、侧边栏、搜索、图表、主题、`base`）。本 spec 只保证"复习中心整体形态"这一高层要求，交互细节以 `vuepress-archive-site` 为准。

#### Scenario: 站点承载全部专题

- **WHEN** 用户打开归档站点首页
- **THEN** 能通过导航/侧边栏访问三大域（互联网后台 / 游戏基础架构 / 游戏业务）与个人页下的全部专题，且具备全文搜索

#### Scenario: 迁移不丢内容

- **WHEN** 对照旧 `guide/` 的 13 个专题与新站点内容
- **THEN** 旧专题（intro/business-proxy/xmesh-k8s/rate-limit/redis/k8s-network/agent-dev/concurrency/tcp-net/gc-stw/algo-ds/design-model/release-strategy）的知识点在新站点均有对应 Markdown 承接，无内容缺失

## REMOVED Requirements

### Requirement: 首页拓扑可视化

**Reason**: 迁移到 VuePress 后，首页交互由 `vuepress-archive-site` 的分域导航 + 自动侧边栏 + 全文搜索承接，不再维护手写 SVG 拓扑首页。

**Migration**: 用 VuePress 首页 + 顶部导航 + 侧边栏进入专题；专题间关系在内容页内用 Mermaid 图或"相关专题"链接表达。旧 SVG 拓扑首页保留在 git 历史。

### Requirement: 独立专题 HTML 分册

**Reason**: 不再生成手写自包含 `theme-<slug>.html` 分册；内容以 Markdown 单页承载，由 VuePress 统一渲染。

**Migration**: 每个专题对应一个 `docs/<域>/<slug>.md`；如需离线分发，用浏览器"打印为 PDF"或站点静态产物整体归档。

### Requirement: 离线与零外部依赖

**Reason**: 本次有意放弃"断网双击零依赖"硬约束，换取全文搜索、代码高亮、Mermaid、可维护性。站点为构建型静态资源，通过 GitHub Pages/COS 在线访问。

**Migration**: 通过 `static-publish-pipeline` 发布到 GitHub Pages 与腾讯云 COS 在线访问；本地可 `vuepress dev`/`build` 后用静态服务器预览。

### Requirement: 可扩展的专题数据结构

**Reason**: 内容不再以内联 `THEMES` JS 数组表达，改为 Markdown 文件；扩展方式由 `vuepress-archive-site` 的"新增 .md 自动进侧边栏"承接。

**Migration**: 新增专题 = 在对应域目录新增一个五段式 `.md` 文件并按约定登记侧边栏，不再修改 JS 数据数组。

### Requirement: 响应式与打印友好

**Reason**: 响应式由 VuePress 主题原生提供；打印/离线诉求降级为浏览器打印 PDF，不再作为本 spec 的硬性验收项。

**Migration**: 依赖 VuePress 主题的响应式与暗色主题（见 `vuepress-archive-site`）；需要 PDF 时用浏览器打印。

## MODIFIED Requirements

### Requirement: 主题切换与详情面板

复习中心 MUST 通过 VuePress 的导航与侧边栏在专题间切换，且每个专题详情 MUST 按五段式（`场景问题 → 实现方案 → 为什么这么做 → 为什么别的选择不行 → 沉淀结论`）渲染，缺失段落保留占位。（原"顶部标签栏 + SVG 拓扑双入口 + 四段式"的实现要求由 VuePress 导航/侧边栏 + 五段式取代。）

#### Scenario: 通过侧边栏切换主题

- **WHEN** 用户点击侧边栏中的任一专题条目
- **THEN** 主内容区切换到对应专题页面，URL 更新，被选中项在侧边栏高亮

#### Scenario: 五段式结构可见

- **WHEN** 任一专题被打开
- **THEN** 页面依序渲染五个段落标题（场景问题/实现方案/为什么这么做/为什么别的选择不行/沉淀结论）；某段暂缺内容时仍保留该段标题与占位（如"待补充"）

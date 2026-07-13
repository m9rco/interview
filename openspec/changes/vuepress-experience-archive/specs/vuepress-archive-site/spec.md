## ADDED Requirements

### Requirement: VuePress 工程结构

站点 MUST 以 VuePress 2 工程组织，内容源为 Markdown，构建产物为纯静态目录。工程 MUST 提供 `package.json`（固定依赖版本）、`docs/.vuepress/config.*` 配置、以及按域划分的内容目录。

#### Scenario: 本地开发与构建可跑通

- **WHEN** 在项目根执行安装依赖后运行 `dev` 与 `build` 脚本
- **THEN** `dev` 启动本地预览服务并热更新，`build` 在配置的输出目录（如 `docs/.vuepress/dist`）产出纯静态资源，过程无报错

#### Scenario: 内容按三域加个人页组织

- **WHEN** 检查 `docs/` 目录
- **THEN** 存在 `intro/`（个人经历与通用心法）、`internet/`（互联网/智能硬件后台）、`game-infra/`（游戏基础架构）、`game-biz/`（游戏业务）四个内容分区，每个专题为一个 `.md` 文件

### Requirement: 分域导航与自动侧边栏

站点 MUST 提供顶部导航区分三大域，且每个域 MUST 有按专题聚合的多级侧边栏。侧边栏 MUST 能随新增 Markdown 文件扩展，不需改渲染逻辑核心。

#### Scenario: 顶部导航进入某一域

- **WHEN** 用户点击顶部导航中的"游戏基础架构"
- **THEN** 页面进入该域首页或首个专题，左侧侧边栏展示该域全部专题条目

#### Scenario: 新增专题自动出现在侧边栏

- **WHEN** 开发者向某域目录新增一个符合约定的 `.md` 专题文件（并按约定登记）
- **THEN** 重新构建后该专题自动出现在对应域的侧边栏，无需修改主题或渲染核心代码

### Requirement: 本地全文搜索

站点 MUST 内置本地全文搜索（不依赖第三方托管搜索服务），可按专题标题与正文命中并跳转。

#### Scenario: 搜索关键词命中专题

- **WHEN** 用户在搜索框输入"一致性哈希"
- **THEN** 下拉结果列出包含该关键词的专题条目，点击后跳转到对应页面并定位到匹配位置

### Requirement: 代码高亮与行高亮

站点 MUST 支持常见语言（至少 Go/C++/PHP/JS/Bash/YAML）的语法高亮，且 MUST 支持对代码块指定行做高亮强调。

#### Scenario: 代码块按语言高亮

- **WHEN** 某专题包含标注语言的围栏代码块
- **THEN** 渲染出对应语言的语法高亮；若代码块标注了行高亮范围，则被指定的行呈现强调样式

### Requirement: Mermaid 流程图渲染

站点 MUST 支持在 Markdown 中以 Mermaid 语法书写流程图/时序图/状态图并在页面渲染为图形。

#### Scenario: Mermaid 代码块渲染为图

- **WHEN** 某专题包含一个 ` ```mermaid ` 代码块
- **THEN** 页面将其渲染为矢量流程图而非原始文本，暗色主题下图形配色可读

### Requirement: 暗色主题

站点 MUST 支持明/暗主题切换，且 MUST 记忆用户选择。

#### Scenario: 切换并记忆暗色

- **WHEN** 用户切换到暗色主题并刷新或再次访问
- **THEN** 站点保持暗色，正文、代码块、Mermaid 图在暗色下均可读

### Requirement: base 路径可配置

站点 MUST 支持通过构建时配置（如环境变量 `DEPLOY_TARGET`）切换 `base`，以适配 GitHub Pages 子路径与 COS 根路径两种部署目标，避免资源 404。

#### Scenario: Pages 子路径构建

- **WHEN** 以 GitHub Pages 目标构建（子路径形如 `/<repo>/`）
- **THEN** 产物中的 JS/CSS/图片等资源引用均带正确的 `base` 前缀，部署到子路径后样式与脚本正常加载，无 404

#### Scenario: COS 根路径构建

- **WHEN** 以 COS 目标构建（`base` 为 `/` 或自定义域名根）
- **THEN** 产物资源引用以根路径解析，上传到 COS 后页面正常渲染

### Requirement: 内容五段式模板与来源页脚

每个专题 MUST 以五段式二级标题组织：`场景问题`、`实现方案`、`为什么这么做`、`为什么别的选择不行`、`沉淀结论`，且文末 MUST 有"内容来源"区块。缺内容的段落 MUST 保留占位（如"待补充"）以保证结构一致。

#### Scenario: 专题具备五段骨架

- **WHEN** 打开任一专题页面
- **THEN** 页面依序出现五个段落标题（场景问题/实现方案/为什么这么做/为什么别的选择不行/沉淀结论），文末存在"内容来源"区块；某段暂缺时保留标题与占位

#### Scenario: 重点专题含代码与图

- **WHEN** 打开被标记为重点的专题（如一致性哈希、eBPF、秒杀、限流熔断、活动框架）
- **THEN** 该专题至少包含一段可读的、贴近真实的代码块与至少一张 Mermaid 图

# memory-system

## Purpose

为面试复习中心建立**记忆辅助系统**：解决四个核心痛点——单篇内容杂乱无主线、跨篇依赖关系不清、复习顺序没有节奏、看完就忘缺乏反复提取机制。系统以"依赖图 + 学习路径 + 间隔复习卡 + 主动提取测验"四层机制为核心，叠加在现有 VuePress 站点上，不破坏现有内容组织。

---

## Requirements

### Requirement: 单篇结构标准化

每篇专题文档的内部结构 MUST 遵循统一的**五段式 + 记忆锚点**模板，确保阅读者能快速找到"这篇讲什么、为什么重要、核心结论是什么"。

#### Scenario: 打开任意一篇专题

- **WHEN** 用户打开任意专题页（如 `rate-limit`、`redis`、`gc-stw`）
- **THEN** 页面顶部 MUST 有一个 `::: tip 一句话结论` callout，30 字以内，能独立成句
- **AND** 正文 MUST 按顺序包含五个锚点标题：`## 场景问题`、`## 实现方案`、`## 为什么这么做`、`## 为什么别的选择不行`、`## 沉淀结论`
- **AND** `## 沉淀结论` 下 MUST 有一个 `### 记忆口诀` 小节，用 3-5 个关键词或一句顺口溜概括整篇核心

#### Scenario: 检查缺失结构的文档

- **WHEN** 运行 `npm run check:structure`（或等价 lint 脚本）
- **THEN** 输出缺失上述结构的文档列表，每行格式为 `[WARN] docs/xxx/yyy.md 缺少: 记忆口诀`

---

### Requirement: 跨篇依赖图

复习中心 MUST 提供一张**知识点依赖图**，明确哪些专题是其他专题的前置知识，让用户知道"先学什么、再学什么"。

#### Scenario: 查看依赖图

- **WHEN** 用户打开 `docs/intro/README.md` 或专属的 `docs/intro/dependency-map.md`
- **THEN** 页面包含一张 Mermaid `graph TD` 图，节点为各专题 slug，有向边表示"需要先掌握"关系
- **AND** 节点按域着色：`common` 域蓝色、`game-infra` 域橙色、`game-biz` 域绿色、`ai-llm` 域紫色、`algo` 域灰色

#### Scenario: 依赖图覆盖所有专题

- **WHEN** 检查依赖图节点集合
- **THEN** 节点数量 = `docs/` 下非 README 的 `.md` 文件总数，无遗漏

#### Scenario: 点击节点跳转

- **WHEN** 用户在 VuePress 渲染的依赖图中点击某个节点
- **THEN** 跳转到对应专题页面（通过 Mermaid `click` 指令实现）

---

### Requirement: 学习路径推荐

复习中心 MUST 提供至少三条**预设学习路径**，针对不同面试目标给出有序的专题学习序列。

#### Scenario: 查看学习路径

- **WHEN** 用户打开 `docs/intro/learning-paths.md`
- **THEN** 页面包含以下三条路径（Markdown 有序列表 + 每项附时间估算）：
  - **路径 A：游戏后台基础架构**（目标：游戏基础架构岗）：`concurrency` → `redis` → `rate-limit` → `k8s-network` → `self-mesh-k8s` → `distributed-kv` → `lockstep`
  - **路径 B：互联网后台通用**（目标：互联网/智能硬件后台岗）：`concurrency` → `redis` → `http-tls-rpc` → `mysql-innodb` → `message-queue` → `design-model` → `distributed-transaction`
  - **路径 C：AI 工程方向**（目标：AI 后台/LLM 工程岗）：`llm-fundamentals` → `llm-inference-optimization` → `rag` → `agent-dev` → `redis` → `rate-limit`
- **AND** 每条路径标注预计学习天数（按每天 2 小时估算）

#### Scenario: 路径与依赖图一致

- **WHEN** 检查三条路径中的专题顺序
- **THEN** 任意相邻两个专题 `A → B`，在依赖图中不存在 `B → A` 的边（不能违反依赖顺序）

---

### Requirement: 间隔复习卡（Flashcard）

每个专题 MUST 附带一组**可导出的 Anki 闪卡**，支持间隔重复复习，解决"看完就忘"问题。

#### Scenario: 每个专题有闪卡文件

- **WHEN** 检查 `docs/<domain>/<slug>.md` 对应的闪卡
- **THEN** 在同目录下存在 `<slug>.cards.md` 文件，格式为标准 Q&A：
  ```
  ## Card 1
  **Q**: [问题，模拟面试官提问]
  **A**: [答案，不超过 100 字，含关键词加粗]
  ```
- **AND** 每个专题至少 5 张卡、至多 15 张卡
- **AND** 卡片问题风格为"面试官直问"（例：`令牌桶和漏桶的本质区别？`）

#### Scenario: 闪卡可导出为 Anki 格式

- **WHEN** 运行 `npm run export:anki`
- **THEN** 在 `output/anki/` 下生成 `<slug>.txt`，每行格式为 `问题\t答案`（Anki 默认导入格式）

#### Scenario: 站内快速过卡模式

- **WHEN** 用户在任意专题页点击"快速过卡"按钮
- **THEN** 页面弹出覆盖层，依次展示该专题的闪卡，先显示 Q、点击翻转显示 A，支持键盘 `Space` 翻卡、`→` 下一张、`←` 上一张

---

### Requirement: 主动提取测验（Self-Test）

每个专题 MUST 在文末提供一组**主动提取题**，强迫用户用自己的话写出答案，而非被动阅读。

#### Scenario: 每个专题有自测题

- **WHEN** 打开任意专题页
- **THEN** 文末 MUST 有 `## 自测：合上资料能说清楚吗？` 小节
- **AND** 该小节包含 3-5 道开放题，每道题下有一个 `<details><summary>参考答案</summary>...</details>` 折叠块

#### Scenario: 自测题覆盖核心考点

- **WHEN** 检查自测题内容
- **THEN** 每道题 MUST 对应该专题 `## 沉淀结论` 中的至少一个关键词
- **AND** 至少一道题要求"对比两个方案"（培养辨析能力）

---

### Requirement: 复习进度追踪

站点 MUST 提供轻量级的**本地复习进度追踪**，让用户知道哪些专题已掌握、哪些需要复习。

#### Scenario: 标记专题掌握状态

- **WHEN** 用户在专题页点击"已掌握" / "需复习" / "未开始" 按钮
- **THEN** 状态保存到 `localStorage`，页面刷新后状态保留
- **AND** 依赖图中对应节点的颜色随状态变化（绿色=已掌握、黄色=需复习、灰色=未开始）

#### Scenario: 复习仪表盘

- **WHEN** 用户打开 `docs/intro/README.md`
- **THEN** 页面顶部显示一个进度概览卡片：已掌握 N/78、需复习 M 个、未开始 K 个
- **AND** "需复习"列表按上次标记时间倒序排列（最久未复习的排最前）

---

## Non-Goals

- 不引入外部数据库或后端服务，所有状态存 `localStorage`
- 不自动生成闪卡内容（内容由人工填写，AI 辅助草稿）
- 不改变现有 Markdown 文档的目录结构
- 不支持多设备同步（本地单机即可满足复习场景）

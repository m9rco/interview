## Context

复习中心是一套 VuePress 2 静态站点，内容以 Markdown 按"域"归档（`docs/<domain>/*.md`），侧边栏/导航栏由 `docs/.vuepress/configs/{sidebar,navbar}.js` 显式声明——新增专题即在对应域数组追加一项，无需改渲染核心。内容验收由 `openspec/specs/*-catalog` 系列 spec 的"必含知识点"清单约束，统一五段式（场景问题 → 实现方案 → 为什么这么做 → 为什么别的选择不行 → 沉淀结论），每篇至少一段代码 + 一张 Mermaid 图。

当前 AI 相关内容只有一篇 `docs/game-biz/agent-dev.md`，孤立地挂在游戏业务域下，缺 RAG 与 LLM 原理两大主题。本次把三者归拢为独立的 AI / 大模型域。

## Goals / Non-Goals

**Goals:**
- 建立 `/ai-llm/` 独立域（导航栏 + 侧边栏 + 首页介绍），与既有四域并列。
- 新增 `llm-fundamentals`、`llm-inference-optimization`、`rag` 三篇高质量五段式专题，覆盖核心原理与优化办法。
- 把 `agent-dev.md` 无损迁入新域，并与新专题交叉引用。
- 内容满足 `ai-llm-catalog` spec 的全部必含项，`vuepress build` 通过、无死链。

**Non-Goals:**
- 不改动 VuePress 站点骨架、搜索/Mermaid 插件、发布流水线（GitHub Pages / COS）等既有能力。
- 不追求覆盖全部前沿论文；以面试高频、可讲清原理与权衡的知识点为准。
- 不新增可运行的 AI 代码工程（仅文档内的示意/伪代码片段）。
- 不引入新的构建期依赖。

## Decisions

### 决策 1：新建独立域 `/ai-llm/`，而非塞进 `common` 或 `game-biz`
AI/大模型是自成体系的一域，且面试占比在上升；独立域让导航清晰、便于整体拾起。备选：塞进"通用基础"——被否，通用基础定位是跨域后台基础（并发/GC/MySQL 等），与大模型主题耦合度低，混放会稀释两边。

### 决策 2：迁移 `agent-dev.md` 而非在原地保留 + 复制
Agent 与 RAG/LLM 强相关，同域才能交叉引用、避免知识割裂。采用"移动文件 + 改两处 sidebar + 首页/域 README 链接"的方式；旧 URL `/game-biz/agent-dev` 失效属可接受代价（站点为个人归档、无外部深链契约），但实现时 MUST 全站 grep 旧路径并修正。备选：原地保留、新域只加软链——被否，会造成两个入口、内容易失同步。

### 决策 3：LLM 主题拆成"原理"与"优化"两篇，而非合成一篇巨页
`llm-fundamentals` 讲"是什么/怎么算"，`llm-inference-optimization` 讲"上生产怎么提吞吐/降显存/降成本/微调"。拆分让每篇聚焦、符合站点单专题粒度，也匹配面试中"原理题"与"工程优化题"的自然分野。RAG 单独成篇（检索链路自成体系）。

### 决策 4：内容以"讲清权衡"为纲，严守五段式
每篇的"为什么别的选择不行"段落承载对比表（如向量索引 暴力/HNSW/IVF-PQ、微调 全参/LoRA/QLoRA、检索 稀疏/稠密/混合），这是本站相对于"概念罗列"的差异化价值，也是 spec 必含项的落点。

## Risks / Trade-offs

- [迁移 `agent-dev.md` 导致旧 URL 失效 / 站内死链] → 实现时全仓 `grep -rn "game-biz/agent-dev"`（含 `docs/**`、README、sidebar/navbar）逐一改到 `/ai-llm/agent-dev`；构建后本地点击验证。
- [大模型知识更新快，文档易过时] → 每篇沿用既有"内容来源"页脚标注整理时间与"以官方文档为准"，聚焦不易过时的原理与权衡而非具体榜单数字。
- [三篇新内容篇幅大、写作成本高] → 按 spec 必含项清单逐条对照落笔，避免发散；代码片段用最小可讲解的伪代码/示意，不追求可运行工程。
- [首页与域 README 的"三大域/四域"措辞需同步] → 在 tasks 中显式列为一步，避免文案与实际导航不一致。

## Migration Plan

1. 新建 `docs/ai-llm/` 目录与 `README.md`（域索引）。
2. `git mv docs/game-biz/agent-dev.md docs/ai-llm/agent-dev.md`，补交叉引用。
3. 新增 `llm-fundamentals.md`、`llm-inference-optimization.md`、`rag.md`。
4. 更新 `navbar.js`（加"AI / 大模型"项）、`sidebar.js`（新增 `/ai-llm/` 组，从 `/game-biz/` 组移除 agent-dev）。
5. 更新 `docs/README.md` 首页域介绍与 `docs/game-biz/README.md` 内引用。
6. 全站修正指向旧 `agent-dev` 路径的链接；`vuepress build` 验证无死链后提交。

回滚：内容为纯静态文档，`git revert` 即可完全回退，无数据迁移风险。

## Open Questions

- 导航栏文案定为"AI / 大模型"还是"AI / LLM"？（倾向中文"AI / 大模型"，与站点其他中文导航一致——除非用户另有偏好。）

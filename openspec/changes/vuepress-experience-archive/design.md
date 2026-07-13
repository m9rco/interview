## Context

现状：`guide/` 是手写的自包含 HTML 复习中心，`build.py` 从 `_themes.js`（`THEMES` 数组）+ `_assets.css/js` 生成 `index.html` 与 13 份 `theme-*.html`，每份文件内联全部 CSS/JS/数据，可断网双击运行。两份 spec（`interview-review-hub`、`interview-topic-catalog`）把"离线零依赖、SVG 拓扑首页、独立 HTML 分册、四段式内容"固化为硬约束。

诉求变化：目标从"面试复习"转为"9 年后台经验归档 + 随时复习"，内容量将从 13 个专题扩到约 40+ 个（横跨互联网/智能硬件后台、游戏基础架构、游戏业务三域），且每条经验要按"场景问题 → 实现 → 为什么这么做 → 为什么别的不行 → 沉淀"组织，配大量代码与流程图。手写 HTML + JS 数据数组在这个体量下维护成本过高，且缺全文搜索/自动目录/代码高亮/图表。

约束：内容主体是中文；产物要能发到 GitHub Pages（带子路径 `base`），同时静态同步到腾讯云 COS；COS/Pages 密钥不能入库；作者本机为 macOS + zsh，已有 Node 生态。

## Goals / Non-Goals

**Goals:**
- 用 VuePress 2 重建站点，Markdown 组织内容，具备本地全文搜索、分域多级侧边栏、代码高亮+行高亮、Mermaid 流程图、暗色主题。
- 无损迁移现有 13 专题知识点，并把内容模板从四段式升级为五段式（场景/实现/为什么/反选/沉淀）。
- 按用户清单补齐三大域新专题，每专题至少一段贴近真实的代码 + 一张 Mermaid 图。
- 一条命令能本地构建并预览；一条命令（或一次 push）能发布到 GitHub Pages + 同步 COS。

**Non-Goals:**
- 不追求断网零依赖的单文件分发（本次明确放弃该约束，是取舍不是遗漏）。
- 不做服务端渲染/动态后端，纯静态站点。
- 不做账号系统、评论、访问统计等运营功能。
- 不在本 change 内追求把 40+ 专题的每段内容一次写满——spec 定义"必含项验收门槛"，内容随 apply 迭代补齐，但骨架与首批重点专题必须落地。

## Decisions

### 决策 1：VuePress 2（vuepress-theme-hope 或默认主题 + 插件）而非 Docusaurus / MkDocs / 保留手写 HTML
- **为什么**：VuePress 2 原生 Markdown + Vue、生态内有成熟的本地搜索、Mermaid、代码行高亮插件，`base` 配置天然适配 GitHub Pages 子路径，产物是纯静态目录便于同步到 COS。中文文档社区活跃。
- **反选理由**：
  - 保留手写 HTML：内容扩到 40+ 专题后 `_themes.js` 数据数组维护、无搜索/无高亮无法接受。
  - Docusaurus（React）：功能强但偏重、React 定制成本高于本项目所需，中文默认体验不如 hope 主题顺手。
  - MkDocs（Python）：Material 主题优秀，但作者栈是 Node/前端，且 Mermaid/Vue 组件扩展不如 VuePress 顺手。
- **倾向**：默认主题 + 官方/社区插件（搜索、Mermaid、代码高亮），保持轻量；若侧边栏/卡片首页诉求强则切 `vuepress-theme-hope`。此细节留到 apply 时定，不阻塞 spec。

### 决策 2：内容按"三域"分目录，五段式模板统一
- 目录：`docs/internet/`（互联网/智能硬件后台）、`docs/game-infra/`（游戏基础架构）、`docs/game-biz/`（游戏业务），外加 `docs/intro/`（个人经历与通用心法）。侧边栏按域分组自动生成。
- 每个专题一个 `.md`，统一五段式二级标题：`## 场景问题` / `## 实现方案` / `## 为什么这么做` / `## 为什么别的选择不行` / `## 沉淀结论`，文末 `## 内容来源`。
- **为什么**：域划分与作者履历（3 年互联网 + 6 年游戏）对齐，复习时可按域进入；五段式把"反选"独立成段，正是归档最想沉淀的"为什么不选别的"。
- **反选理由**：单一扁平目录在 40+ 专题下侧边栏过长、无法体现履历结构；沿用旧四段式会把"为什么别的不行"混进"为什么这么选"，弱化归档价值。

### 决策 3：发布双通道——GitHub Actions 为主，本地脚本为辅
- CI（`.github/workflows/deploy.yml`）：push 到 `main` → `vuepress build` → 用官方 action 发 GitHub Pages → 用 `coscmd`/`ossutil` 把 `dist` 同步到 COS 桶；COS `SecretId/SecretKey`、桶名走 GitHub Secrets。
- 本地脚本（`scripts/deploy-cos.sh`）：给不想等 CI 或临时手动发布用，从环境变量/本机 `~/.cos.conf` 读密钥，绝不写进仓库。
- **为什么**：CI 保证"push 即发布"的一致性与可审计；本地脚本兜底应急。COS 同步要处理缓存头（HTML 短缓存、带 hash 的静态资源长缓存）与"先传新资源再覆盖 index"的顺序，降低发布中途 404。
- **反选理由**：只用本地脚本无法团队协作/无审计；只用 Pages 不满足"静态生成至 COS"的硬需求。

### 决策 4：`base` 路径与资源引用
- GitHub Pages 项目页在 `/<repo>/` 子路径，`config` 的 `base` 必须设为该子路径；COS 若绑自定义域名则 `base` 为 `/`。用环境变量在构建时切换（`DEPLOY_TARGET=pages|cos`），避免两处产物资源路径打架。
- **为什么**：`base` 配错是静态站点最常见的"样式丢失/404"根因，显式建模两目标。

## Risks / Trade-offs

- [放弃离线零依赖] → 有意取舍；在 `interview-review-hub` spec 用 REMOVED + Reason/Migration 显式记录，旧 HTML 保留在 git 历史可回溯。
- [COS 密钥泄露] → 密钥只走 GitHub Secrets / 本机环境变量；仓库加 `.gitignore` 排除 `.cos.conf`、`.env`；CI 日志避免回显密钥。
- [`base` 路径配错导致上线白屏] → 用 `DEPLOY_TARGET` 显式区分 Pages/COS 构建；发布前本地 `vuepress build` + 静态服务器验证一次。
- [发布中途资源不一致（新 index 引用尚未上传的 chunk）] → COS 同步顺序：先传带 hash 的静态资源，最后覆盖入口 HTML；HTML 设短缓存，静态资源长缓存。
- [内容一次写不完] → spec 只卡"必含项验收门槛"与首批重点专题；tasks 里把内容补齐拆成按域推进的迭代任务，骨架先行、内容渐进。
- [Mermaid/搜索插件与 VuePress 2 版本兼容] → 锁定插件与 VuePress 的兼容版本组合，`package.json` 固定版本号，避免开源范围版本漂移。

## Migration Plan

1. 初始化 VuePress 工程（`package.json`、`docs/.vuepress/config`、基础插件），本地跑通 `dev`/`build`。
2. 把现有 13 专题从 `_themes.js`/`theme-*.html` 抽取为 Markdown，套五段式模板，落到对应域目录，校验无内容丢失。
3. 按三域补齐新专题骨架，先重点专题（DNS 攻防、eBPF、一致性哈希三算法、协程、秒杀、限流熔断、活动框架、幂等性）写满代码+图。
4. 接入发布：先本地脚本发一次 COS 验证 `base`/缓存/顺序，再落 GitHub Actions 双发布。
5. 旧 `guide/` 手写产物停止维护（保留 git 历史）；README 指向新站点与发布方式。
- **回滚**：GitHub Pages/COS 保留上一版本产物即可回退；VuePress 工程与旧 `guide/` 在迁移期并存，出问题可临时切回旧 HTML。

## Resolved Decisions（作者已确认）

- **仓库**：`github.com/m9rco/interview`。GitHub Pages 项目页 → 构建 `base: '/interview/'`（`DEPLOY_TARGET=pages`）。
- **COS**：绑定自定义域名 `interview.0x06.cn`，走根路径 → 构建 `base: '/'`（`DEPLOY_TARGET=cos`）。
- **优先级**：**优先保障 GitHub Pages 可用**；COS 作为后续扩充选项。因此 CI 先跑通 Pages 发布，COS 同步作为可选步骤（失败不阻断 Pages），本地脚本 `deploy-cos.sh` 先行提供、CI 的 COS step 可后置启用。
- **主题**：先用 VuePress 2 默认主题（`@vuepress/theme-default`）+ 插件；卡片首页/更强侧边栏诉求出现再切 `vuepress-theme-hope`。

## Open Questions

- 暂无阻塞项。COS 密钥（SecretId/SecretKey/桶名/Region）在启用 COS 发布时通过环境变量或 GitHub Secrets 注入。

## Why

现有 `guide/` 是一套手写的自包含 HTML 复习中心（`build.py` 内联 CSS/JS/数据、13 个专题、强约束"断网双击即用、零外部依赖"）。它擅长离线分发，却付出了明显代价：内容写死在 `_themes.js` 的 `THEMES` 数组里，新增/修订一个专题要动 JS 数据结构、重跑生成脚本；无全文搜索、无侧边栏自动目录、Markdown 与代码高亮全靠手搓 HTML；也没有正规的构建产物与发布链路。

而这次的目标不再只是"面试复习"，而是给过去 **9 年（3 年互联网/智能硬件后台 + 6 年游戏局外后台）** 做一份可长期维护、可随时重新拾起的**经验归档**。每一条经验都要回答同一组问题：**在什么特定场景下遇到什么问题 → 怎么实现的 → 为什么这么做 → 为什么同类的其他选择不行 → 沉淀出什么结论**。这套"场景—抉择—反选—沉淀"的组织方式，配合全文检索和大量代码/流程图，用 Markdown + VuePress 表达远比手写 HTML 顺手，也才能承载即将新增的约 40 个技术专题。

## What Changes

- **BREAKING** 交付形态从"手写自包含单文件 HTML"迁移到 **VuePress 静态站点**：内容以 Markdown 组织，`build.py` / `_themes.js` / `_assets.*` / 手写 `theme-*.html` 退役（保留在 git 历史，不再维护）。放弃现有 spec 的"断网双击零依赖"硬约束，换取全文搜索、自动侧边栏、代码高亮、Mermaid 流程图、可维护性。
- 引入 **VuePress 站点骨架**：首页导航、按"互联网后台 / 游戏基础架构 / 游戏业务"分域的多级侧边栏、本地全文搜索、Mermaid 流程图插件、代码块高亮与行高亮、暗色主题、`base` 路径可配置（适配 GitHub Pages 子路径）。
- 建立 **发布流水线**：`vuepress build` 产出静态资源 → 发布到 **GitHub Pages**，并把同一份产物**静态同步到腾讯云 COS**（`coscmd`/`ossutil` 类工具），支持一键脚本 + CI（GitHub Actions）两种触发。
- **内容大扩充**，把现有 13 专题的知识点无损迁移进来，并按用户清单补齐三大域的新专题（含代码与流程图）：
  - 互联网 / 智能硬件后台：php-fpm+Nginx 多进程异步 I/O、IoT/MQTT 私有协议、Gulp/Webpack/SPA/白鹭引擎前端工程、Elixir 等函数式、DNS 攻防与隧道、DNS 清洗拦截（内核态 + CoreDNS）、LVS+epoll、TCP/HTTP 滑动窗口。
  - 游戏基础架构与工具：tconnd/tbus、CNI 与 K8s 插件、Istio/Cilium 服务网格中心化 vs 去中心化、有状态服务的数据迁移与恢复、eBPF、一致性哈希（RingHash/Maglev/JumpHash）实现、蓄水池算法、C++11 有栈/无栈协程 vs C++20、秒杀承载、内存配置热刷、令牌桶/漏桶、Raft/Gossip 简易实现、LLVM/Clang/GCC 编译优化、限流熔断。
  - 游戏业务实现：多模板游戏活动框架、业务幂等性设计、Redis 房间推荐列表、游戏 vs 互联网后台本质差异。
- **内容组织升级**：把现有"是什么 → 为什么这么选 → 踩过什么坑 → 怎么填的"四段式，扩展为归档导向的 **五段式**——"场景问题 → 实现方案 → 为什么这么做 → 为什么别的选择不行 → 沉淀结论（含面试话术）"，并强制每个专题至少一段可运行/贴近真实的代码与一张 Mermaid 图。

## Capabilities

### New Capabilities
- `vuepress-archive-site`: VuePress 站点的工程与交互能力规范——目录结构、`config` 约定、分域侧边栏与导航、本地全文搜索、Mermaid/代码高亮插件、暗色主题、`base` 路径与静态资源约束、内容五段式模板与"内容来源"页脚。
- `static-publish-pipeline`: 静态产物的发布能力规范——`vuepress build` 产物校验、GitHub Pages 发布、腾讯云 COS 同步（缓存头/覆盖策略/失败回滚）、本地脚本与 GitHub Actions 两条发布路径、密钥不入库约束。
- `internet-backend-catalog`: 互联网/智能硬件后台域的**内容目录规范**——为该域每个专题定义"必含知识点"验收清单（php-fpm/Nginx、MQTT/IoT、前端工程与白鹭、Elixir、DNS 攻防与清洗、LVS/epoll、滑动窗口等）。
- `game-infra-catalog`: 游戏基础架构与工具域的内容目录规范——tconnd/tbus、CNI/服务网格、有状态迁移恢复、eBPF、一致性哈希三算法、协程、秒杀、热刷、限流熔断、Raft/Gossip、LLVM 等专题的必含项。
- `game-business-catalog`: 游戏业务实现域的内容目录规范——多模板活动框架、幂等性设计、Redis 房间推荐、游戏 vs 互联网本质差异等专题的必含项。

### Modified Capabilities
- `interview-review-hub`: 交付机制从"手写自包含 HTML + SVG 拓扑首页 + 独立分册"整体替换为 VuePress 站点，**BREAKING** 移除"离线零依赖 / 双击打开 / 独立 HTML 分册 / SVG 拓扑"等要求，改为由 `vuepress-archive-site` 承接站点交互；本 spec 收敛为"复习中心作为归档站点存在"的高层要求与迁移不丢内容的保证。
- `interview-topic-catalog`: 现有 13 专题的必含项要求整体保留（内容无损迁移到 Markdown），但把四段式结构要求升级为五段式，并把"专题目录"从固定 13 项扩展为"随三大域新目录共同演进"。

## Impact

- **退役**：`guide/build.py`、`guide/_themes.js`、`guide/_assets.css`、`guide/_assets.js`、`guide/theme-*.html`、`guide/index.html`（保留在 git 历史）。
- **新增**：VuePress 工程（`package.json`、`docs/.vuepress/config.*`、`docs/**/*.md`、Mermaid/搜索插件）、发布脚本（`scripts/deploy-cos.*`、`.github/workflows/deploy.yml`）。
- **依赖**：Node.js + VuePress 2 及插件、`coscmd` 或腾讯云 COS 上传工具；CI 需要 GitHub Pages 权限与 COS 密钥（走 GitHub Secrets，不入库）。
- **规范**：新增 5 份 spec，修改 2 份现有 spec（`interview-review-hub`、`interview-topic-catalog`）。
- **风险**：破坏"离线零依赖"是有意为之的取舍，需在 design 中记录；COS 密钥管理与 `base` 路径配置是发布正确性的关键点。

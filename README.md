# 9 年后台经验归档

3 年互联网/智能硬件后台 + 6 年游戏局外后台的经验归档与复习站点。每个专题按五段式组织：**场景问题 → 实现方案 → 为什么这么做 → 为什么别的选择不行 → 沉淀结论**。

- 在线（GitHub Pages）：https://m9rco.github.io/interview/
- 在线（腾讯云 COS）：https://interview.0x06.cn/ （后续扩充启用）

## 技术栈

VuePress 2（`@vuepress/theme-default`）+ 本地全文搜索 + Mermaid 流程图 + 代码高亮 + 暗色主题。内容以 Markdown 组织在 `docs/` 下，按域分目录：

| 目录 | 域 |
|---|---|
| `docs/intro/` | 个人经历 & 通用心法 |
| `docs/internet/` | 互联网 / 智能硬件后台 |
| `docs/game-infra/` | 游戏基础架构与工具 |
| `docs/game-biz/` | 游戏业务实现 |
| `docs/common/` | 通用后台基础（跨域） |

## 本地开发

```bash
npm install
npm run docs:dev          # 本地预览（热更新）
npm run docs:build        # 默认构建（Pages base=/interview/）
npm run docs:build:pages  # 显式 Pages 目标（base=/interview/）
npm run docs:build:cos    # COS 目标（base=/，绑定 interview.0x06.cn）
```

> 依赖 Node.js（本地 v20 可用；CI 用 v22）。

## 发布

- **GitHub Pages（主）**：push 到 `main` 由 `.github/workflows/deploy.yml` 自动构建并发布。
- **腾讯云 COS（后续扩充）**：
  - CI：在仓库设置 `ENABLE_COS=true`（Variables）与 `COS_SECRET_ID/COS_SECRET_KEY/COS_BUCKET/COS_REGION`（Secrets），CI 会自动同步；失败不阻断 Pages。
  - 本地：`cp .cos.conf.example .cos.conf` 填好密钥后运行 `./scripts/deploy-cos.sh`。
  - 同步策略：先传带 hash 的静态资源（长缓存），最后覆盖入口 HTML（短缓存），降低发布过程 404。

> **密钥安全**：COS 密钥绝不入库。`.env` / `.cos.conf` 已在 `.gitignore` 中排除；CI 走 GitHub Secrets。

## 旧版复习中心

`guide/` 下是旧版手写自包含 HTML 复习中心（`build.py` + `_themes.js`），已停止维护，保留在 git 历史中。其 13 个专题的内容已无损迁移到本 VuePress 站点。

## 1. 基线与词表

- [x] 1.1 全站关键词基线扫描：对 `docs/**/*.md` 与 `docs/.vuepress/configs/*.js`、`docs/README.md`、根 `README.md` 检索术语映射表中的全部原始词，记录每词命中文件与行数作为验收基线
- [x] 1.2 确认术语映射表（见 design.md D1）与 slug 重命名表（D2）；如用户对 slug 命名或 `Meshery` 处理有偏好则在此微调
- [x] 1.3 确认代码块内示例标识符（变量名、注释）中的代号也纳入替换范围

## 2. 正文脱敏（按目录批次）

- [x] 2.1 `docs/intro/README.md`：雇主名（360/腾讯）、项目代号（微视/天美/逆战/怪物猎人/星之破晓/宝可梦大集结）、个人 PII（super marco、marco）全部按词表替换；保留两段式经历骨架
- [x] 2.2 `docs/game-infra/*.md`：内部系统名（tconnd/tbus/xmesh/tcaplusdb/tRPC/EPC/Oteam）替换为通用等价物，首次出现处补公开类比注解
- [x] 2.3 `docs/game-biz/business-proxy.md`：雇主/项目代号、模块代号（如 platpxy/paypxy/mallsvrd 若可识别为内部命名）、个人 PII 泛化
- [x] 2.4 `docs/ai-llm/*.md` 与 `docs/common/*.md`：清理残留 PII（如 rag-context-pruning.md 中的 marco）与任何雇主/系统名命中
- [x] 2.5 `docs/README.md`（首页）与根 `README.md`、`package.json` description：清理个人域名/联系线索（0x06）与雇主/项目描述

## 3. slug 重命名与引用更新

- [x] 3.1 用 `git mv` 按 D2 表重命名 `tconnd.md`/`tbus.md`/`xmesh-k8s.md`/`tcaplusdb.md` 为泛化 slug
- [x] 3.2 更新 `docs/.vuepress/configs/sidebar.js` 中对应 `link` 路径
- [x] 3.3 更新 `docs/.vuepress/configs/navbar.js` 及 `docs/README.md` 首页 actions/features 中的相关链接与文案
- [x] 3.4 全站搜索并修正跨文档相对链接（`](.../tconnd.md)` 等）指向新 slug

## 4. 验收

- [x] 4.1 全站关键词复扫：术语映射表全部原始词在 `docs/**/*.md`（含代码块）与站点配置/README 中命中数为 0；个人 PII 命中数为 0
- [x] 4.2 一致性抽查：同一实体在不同文档中均使用词表中的同一泛化词，无混用、无残留
- [x] 4.3 `npm run docs:build` 构建成功，无因重命名导致的断链 / 404 告警
- [x] 4.4 人工抽读脱敏后关键页面（intro、access-gateway、self-mesh-k8s、business-proxy），确认技术场景与结论完整、类比注解到位、语句通顺

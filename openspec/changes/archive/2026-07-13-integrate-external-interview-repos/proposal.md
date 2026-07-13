## Why

`docs/common/`（跨域通用基础）已有并发、设计模型、GC/STW、算法数据结构、Redis 等专题，但对照两份高星面试仓库仍有明显空白：

- [lifei6671/interview-go](https://github.com/lifei6671/interview-go)：Go 语法陷阱（slice 共享底层数组、defer 改命名返回值、for-range 闭包、nil interface、内存逃逸、关闭 chan 读写、string↔[]byte、sync.Map）与 **MySQL InnoDB**（B+ 树索引、聚簇/二级索引、最左前缀、索引下推、MVCC/ReadView、隔离级别与幻读）——后者本站此前**完全缺失**。
- [m9rco/practice](https://github.com/m9rco/practice)：**排序算法系统对比**（七大排序稳定性/复杂度/选型、快排三路+随机基准优化）、并查集、Unix I/O 模型——`algo-ds` 有哈希/树/LRU 但缺排序全景。

把这些关键点提炼进本站，补齐 Go 基础、MySQL、排序三块面试高频空白。

## What Changes

- 新增 `docs/common/go-gotchas.md`（Go 语言基础与常见陷阱）
- 新增 `docs/common/mysql-innodb.md`（MySQL InnoDB 索引与事务）
- 新增 `docs/common/sorting.md`（排序算法全景与选型，含并查集/IO 模型要点）
- 三篇均套用现有五段式 + `## 内容来源` 页脚，署名两份外部仓库
- `docs/.vuepress/configs/sidebar.js` 的"通用后台基础"组按主题相邻插入三篇

## Capabilities

### Modified Capabilities
- `interview-topic-catalog`: 在通用后台基础域新增 3 个专题的"必含知识点"验收清单（`go-gotchas`、`mysql-innodb`、`sorting`），沿用五段式与"内容来源"约束；专题目录随之扩展。

## Impact

- **新增**：3 份 Markdown 专题、1 处 sidebar 配置改动。
- **规范**：修改 1 份现有 spec（`interview-topic-catalog`）。
- **验证**：`vuepress build` 通过（53 页全部渲染），三页产物落地 `dist/common/`。
- **无破坏**：不改动既有专题内容与发布流水线。

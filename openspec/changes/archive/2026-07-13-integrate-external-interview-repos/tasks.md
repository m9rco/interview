## 1. 提炼与撰写三篇专题

- [x] 1.1 `go-gotchas`：new/make、slice 共享底层数组与扩容、defer 顺序与改命名返回值、for-range 闭包（Go 1.22 分水岭）、nil interface、内存逃逸五因、关闭 chan 读写、string↔[]byte、sync.Map，套五段式
- [x] 1.2 `mysql-innodb`：B+ 树为何做索引、聚簇/二级索引与回表/覆盖索引、联合索引最左前缀、索引下推 ICP、索引失效、MVCC（undo 版本链 + ReadView + 快照/当前读）、隔离级别与幻读，套五段式
- [x] 1.3 `sorting`：七大排序稳定性/复杂度/选型对照、快排三路+随机基准+小区间转插入、并查集、Unix I/O 模型，套五段式
- [x] 1.4 三篇页脚均加"内容来源"，署名 lifei6671/interview-go 与 m9rco/practice

## 2. 接入与验证

- [x] 2.1 `sidebar.js` 通用后台基础组按主题相邻插入三篇
- [x] 2.2 `vuepress build` 通过，三页渲染到 `dist/common/`
- [x] 2.3 更新 `interview-topic-catalog` spec，新增三专题必含项

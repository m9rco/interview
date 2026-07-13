## ADDED Requirements

### Requirement: go-gotchas 专题内容完整

`go-gotchas`（Go 语言基础与常见陷阱）专题 MUST 覆盖 Go 高频语法陷阱与底层模型。

#### Scenario: go-gotchas 必含项

- **WHEN** 打开 `docs/common/go-gotchas.md`
- **THEN** 内容至少包含：new vs make 区别、slice 底层表头与共享底层数组/append 扩容坑（含三索引切片规避）、defer 的 LIFO/参数注册时求值/修改命名返回值、for-range 循环变量捕获（Go 1.22 前后语义差异与规避）、nil interface 二元组陷阱、内存逃逸典型五因、读写已关闭 channel 的行为、string↔[]byte 拷贝与零拷贝、sync.Map 适用场景，且以五段式组织、页脚含"内容来源"标注 lifei6671/interview-go

### Requirement: mysql-innodb 专题内容完整

`mysql-innodb`（MySQL InnoDB 索引与事务）专题 MUST 覆盖 InnoDB 索引结构与 MVCC 事务机制。

#### Scenario: mysql-innodb 必含项

- **WHEN** 打开 `docs/common/mysql-innodb.md`
- **THEN** 内容至少包含：B+ 树为何做索引（树高≈IO 次数、叶子有序链表、对比 B 树/红黑树/Hash）、聚簇索引 vs 二级索引与回表/覆盖索引、联合索引最左前缀与范围列失效、索引下推 ICP、索引失效常见写法、MVCC（隐藏列 + undo 版本链 + ReadView 可见性判定 + 快照读/当前读）、事务隔离级别与 RR/RC 的 ReadView 时机、InnoDB 如何压制幻读（MVCC + Next-Key Lock），且以五段式组织、页脚含"内容来源"标注 lifei6671/interview-go

### Requirement: sorting 专题内容完整

`sorting`（排序算法全景与选型）专题 MUST 覆盖主流排序算法对比、选型与相关基础。

#### Scenario: sorting 必含项

- **WHEN** 打开 `docs/common/sorting.md`
- **THEN** 内容至少包含：七大排序（冒泡/选择/插入/希尔/归并/快排/堆排）稳定性×时间×空间对照表、线性排序（计数/基数/桶）适用条件、快排工程化优化（随机基准/三数取中、三路切分、小区间转插入、introsort/pdqsort）、排序选型公式、并查集（按秩合并 + 路径压缩）、Unix I/O 模型（阻塞/非阻塞/多路复用/信号驱动/异步，select→poll→epoll），且以五段式组织、页脚含"内容来源"标注 m9rco/practice 与 lifei6671/interview-go

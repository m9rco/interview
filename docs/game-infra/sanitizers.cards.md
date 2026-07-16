# sanitizers — 闪卡

> Sanitizer 的原理可以用一句话概括：**编译期插桩 + 影子内存**——编译器在每次内存访问前插入检查代码，用一块"影子内存"记录每个字节的可用状态，访问前先查影子表，非法就立刻报错并打出带符号的调用栈。它和 Valgrind 的根本区别是：**Sanitizer 靠编译期插桩（快，~2x）需要重编译；Valgrind 靠运行时动态二进制翻译（慢，10-50x）无需重编译**。内存泄漏定位的核心抓手是：**ASan 内置的 LSan 在进程退出时扫描"仍可达但无人引用"的堆块并报告分配栈**，线上长跑则看 **RSS 持续增长 + heap profiler 差分**。

## 记忆口诀

**ASan**：影子内存8:1 / 红区查越界 / 隔离区毒化查UAF
**LSan**：退出扫可达 / 报不可达块的分配栈 / 常驻单例不算泄漏
**选型**：可重编ASan(~2x) / 免重编Valgrind(10-50x) / 线上heap profiler差分
**判泄漏**：RSS涨≠泄漏 / 排除碎片缓存不还OS / 看长期只增不减

## Card 1

**Q**: ASan 是怎么在每次内存访问前判断"这块内存能不能碰"的？为什么这种做法比遍历检查快？

**A**: 靠影子内存(8:1)：每 8 字节应用内存对应 1 字节影子，记录可用字节数。编译器在每次 load/store 前插桩，`shadow=(addr>>3)+offset` 算出影子地址、读 1 字节判断合法性。检查成本恒定（几条算术指令 + 1 字节读），无需遍历，这是 ASan 只慢 ~2x 的根本，用空间换时间。

## Card 2

**Q**: ASan 为什么能报 use-after-free？如果 free 后内存立刻还给分配器会怎样？

**A**: `free` 时 ASan 不立刻归还，而是毒化整块并放进 FIFO 隔离区(quarantine)停留一段时间，期间任何访问都踩到毒化影子 → 报 UAF。若立刻归还，内存会被下次分配复用，UAF 访问到的是合法新数据，检测不到。代价是隔离区占内存（ASan 内存开销大）。

## Card 3

**Q**: 同事说服务 RSS 一直在涨，肯定是内存泄漏了。这个判断对吗？怎么确认？

**A**: 不一定对。RSS 涨 ≠ 泄漏：可能是分配器缓存空闲内存不还 OS、内存碎片、Page Cache 或有意缓存。判据是"长期只增不减且与负载不成比例"。确认方法：heap profiler（tcmalloc/jemalloc）对两个时间点做分配栈差分看谁在持续增长；glibc 用 `malloc_stats` 区分泄漏 vs 未归还。

## Card 4

**Q**: 要查泄漏，什么时候用 ASan+LSan，什么时候用 Valgrind，什么时候都不能用？两者根本区别是什么？

**A**: 根本区别：ASan 靠编译期插桩(~2x，需重编)，Valgrind 靠运行时动态二进制翻译(10-50x，免重编)。可重编且能复现 → 首选 ASan+LSan（直接给分配栈）；不能重编或只想快速看 → Valgrind Memcheck（但慢，游戏帧循环会卡死）；线上长跑不能停 → 都不用，改用 eBPF memleak / jemalloc prof 采样。

## Card 5

**Q**: 哪些 Sanitizer 能同时开、哪些互斥？为什么？

**A**: ASan+UBSan+LSan 可同开（LSan 默认内含在 ASan）；ASan/MSan/TSan 三者互斥。因为 ASan、MSan、TSan 都要独占地把大段虚拟地址映射成自己的影子内存，布局冲突，只能分轮跑。编译务必带 `-g -fno-omit-frame-pointer`，并让 `llvm-symbolizer` 在 PATH 才有符号。

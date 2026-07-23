---
title: Sanitizer 工具链与内存泄漏定位
---

# Sanitizer 工具链与内存泄漏定位

> ASan/LSan/MSan/TSan/UBSan 全家桶 · 影子内存(shadow memory) + 红区(redzone) + 拦截器(interceptor) 原理 · Valgrind 对比 · 内存泄漏定位方法论（LSan / heap profiler / RSS 增长排查）

::: tip 一句话抓手
Sanitizer 的原理可以用一句话概括：**编译期插桩 + 影子内存**——编译器在每次内存访问前插入检查代码，用一块"影子内存"记录每个字节的可用状态，访问前先查影子表，非法就立刻报错并打出带符号的调用栈。它和 Valgrind 的根本区别是：**Sanitizer 靠编译期插桩（快，~2x）需要重编译；Valgrind 靠运行时动态二进制翻译（慢，10-50x）无需重编译**。内存泄漏定位的核心抓手是：**ASan 内置的 LSan 在进程退出时扫描"仍可达但无人引用"的堆块并报告分配栈**，线上长跑则看 **RSS 持续增长 + heap profiler 差分**。
:::

## 场景问题

> **打个比方（ASan 三件套）**：**红区（redzone）**像博物馆给每件展品四周拉的**警戒线**——你本该只碰展品本身（合法内存），手一旦伸进警戒线区域（越界访问相邻字节），警报立刻响。**影子内存**则是保安手里的一张"**地图小抄**"：每个真实字节都对应影子里一个标记，写着"这块能不能碰"；保安用不着全程死盯你，你每次伸手前他瞄一眼小抄就知道该不该拦（**访问前查 1 字节影子，不是遍历整块内存**）。而 use-after-free 靠"**隔离仓库（quarantine）**"：你退掉的展品不立刻重新布展，先扔进仓库隔离一阵、贴上"毒化"封条，这期间你要是又摸回去，当场抓包。**类比失效边界**：警戒线和小抄都要额外占地又费时——ASan 内存大致翻倍、速度约 2×，所以它是**开发/测试期**的排查利器，绝不能常开在生产热路径上。而且它靠**编译期插桩**，那些没跟着重编的第三方预编译库（`.so`）插不进桩，照样是它照不到的盲区。

C++ 服务端/客户端排查内存与并发问题，绕不开的题：

| 题目 | 考点 | 直觉答案往往错在 |
| --- | --- | --- |
| ASan 怎么知道数组越界了 | 影子内存 + 红区 | 不是遍历检查，是访问前查 1 字节影子 |
| ASan 为什么能报 use-after-free | 隔离缓存(quarantine) | free 的内存不立刻还，先隔离并毒化 |
| ASan 和 Valgrind 选哪个 | 插桩 vs 动态翻译 | ASan 快但要重编译；Valgrind 慢但即插即用 |
| 内存泄漏和内存增长是一回事吗 | 泄漏 vs 缓存/碎片 | 不是，RSS 涨可能是缓存/碎片/大页，未必泄漏 |
| LSan 报的泄漏一定是 bug 吗 | 可达性分析 | "还可达"的全局单例不算泄漏，能白名单抑制 |
| 线上服务不能重编怎么查泄漏 | 采样 profiler | tcmalloc/jemalloc heap profiler、bcc/eBPF |
| 多个 Sanitizer 能一起开吗 | 兼容性 | ASan+UBSan 可，ASan+TSan/MSan 互斥 |

## 实现方案

### Sanitizer 全家桶

都是 **Clang/GCC 编译期插桩 + 运行时库（compiler-rt）** 的组合，`-fsanitize=` 开启，务必带 `-g -fno-omit-frame-pointer` 才能出可读调用栈：

| 工具 | 缩写 | 抓什么 | 典型开销 |
| --- | --- | --- | --- |
| AddressSanitizer | ASan | 堆/栈/全局**越界**、**use-after-free/return/scope**、double-free | ~2x 时间、2-3x 内存 |
| LeakSanitizer | LSan | **内存泄漏**（进程退出时可达性扫描） | 近乎免费（含在 ASan 内） |
| MemorySanitizer | MSan | 读取**未初始化内存** | ~3x，需全量插桩（含 libc++） |
| ThreadSanitizer | TSan | **数据竞争**、死锁 | ~5-15x 时间、5-10x 内存 |
| UndefinedBehaviorSanitizer | UBSan | 整数溢出、空指针解引用、非法移位、类型不对齐等 **UB** | 很低 |

::: warning 组合与限制
- **ASan + UBSan + LSan 可同时开**（LSan 默认内含在 ASan 里）
- **ASan / MSan / TSan 三者互斥**——都要独占影子内存布局，只能分开跑
- Sanitizer 是**测试/预发环境**工具，带插桩的二进制**不要上生产**（性能和内存开销 + 攻击面）
- ASan 与某些操作不兼容：自定义分配器要 hook、`fork` 无 exec、setuid、非标准栈切换（协程要用 `__sanitizer_start_switch_fiber` 告知）
:::

### ASan 原理：影子内存 + 红区 + 隔离区

**① 影子内存（Shadow Memory）**：ASan 把地址空间按 **8:1** 映射——每 8 字节应用内存对应 **1 字节影子**，记录这 8 字节里"前 k 个可用"。地址转换是简单算术：`shadow = (addr >> 3) + offset`。编译器在**每次 load/store 前**插入几条指令：算出影子地址、读那 1 字节、判断本次访问是否落在可用区，非法则调用运行时报错。

```
应用访问 addr →  shadow = (addr>>3)+Offset
                 若 shadow==0 全部可用 → 放行
                 否则比较访问偏移与可用字节数 → 越界则 report
```

**② 红区（Redzone）**：ASan 替换 `malloc`/`new`，在每个分配块**前后插入"毒化"的红区**（影子标记为不可访问）。一旦越界读写踩进红区，影子检查立即命中 → 精确报出**越界方向 + 分配栈 + 访问栈**。栈变量和全局变量同理由编译器加红区。

**③ 隔离区（Quarantine）实现 use-after-free**：`free` 时不立刻把内存还给分配器，而是**毒化整块**并放进一个 FIFO 隔离队列停留一段时间。这期间任何访问都踩到"毒化"影子 → 报 use-after-free。队列满了才真正回收（所以 ASan 内存开销大）。

**④ 拦截器（Interceptor）**：ASan 用 `memcpy/strcpy/...` 的包装版做边界检查，并借此拦截内存操作。

### LSan 原理：退出时的可达性扫描

LeakSanitizer 在**进程退出**（或手动 `__lsan_do_recoverable_leak_check()`）时，做一次**类 GC 的根可达性扫描**：以寄存器、栈、全局区、TLS 为根，扫描所有仍被引用的堆块；**任何已分配但从任何根都不可达的堆块 = 泄漏**，并打印其分配调用栈。

::: warning "可达"的泄漏不会被报
LSan 只报**不可达**的块。像"全局单例只 new 一次、进程结束也不 delete"这种**仍可达**的常驻对象，LSan 认为不是泄漏（严格说是"still reachable"）。真正的隐蔽泄漏（如每次请求 new 后指针丢失、容器只增不删）才会被抓。误报可用 `LSAN_OPTIONS=suppressions=lsan.supp` 或代码里 `__lsan::ScopedDisabler` 白名单抑制。
:::

### 运行与解读

```bash
clang++ -fsanitize=address -g -fno-omit-frame-pointer -O1 app.cpp -o app
ASAN_OPTIONS=detect_leaks=1:halt_on_error=0 ./app
# 报告需 llvm-symbolizer 在 PATH 才有函数名/行号
```

报告关键行：`ERROR: AddressSanitizer: heap-use-after-free`、`freed by thread T0 here`（释放栈）、`previously allocated by thread T0 here`（分配栈）、`SUMMARY`。**分配栈 + 访问栈的对照是定位根因的钥匙**。

### 内存泄漏定位方法论（分场景）

**A. 能重编、可复现 → 首选 ASan+LSan**：最省事，直接给分配栈。

**B. 不能重编 / 只是想快速看 → Valgrind Memcheck**：动态二进制插桩（DBI），无需重编译，能查越界、未初始化、泄漏，但**慢 10-50 倍**，不适合高并发/实时场景（游戏帧循环会卡死）。

**C. 线上长跑服务、RSS 缓慢增长 → 采样式 heap profiler**：
- **tcmalloc（gperftools）**：`HEAPPROFILE=/tmp/prof ./app`，用 `pprof` 对两个时间点的堆快照做**差分**，看谁在持续增长
- **jemalloc**：`MALLOC_CONF=prof:true,lg_prof_sample:19`，`jeprof` 分析
- **heaptrack**（KDE）：低开销记录所有分配，图形化看分配来源和峰值
- **bcc/eBPF `memleak`**：`memleak -p <pid>`，不停机、按调用栈聚合未释放分配，适合生产采样

**D. 判断"是不是真泄漏" → 先看趋势**：
- `top`/`/proc/<pid>/status` 看 **RSS**；`pmap -x <pid>` 看段级增长
- **RSS 涨 ≠ 泄漏**：可能是分配器把空闲内存留着不还 OS（`malloc_trim`/`jemalloc` 后台回收）、**内存碎片**、Page Cache、或有意的缓存。**判据是"长期趋势只增不减、且与负载不成比例"**
- glibc 可用 `mallinfo2`/`malloc_stats` 看 arena 占用区分"泄漏 vs 碎片/未归还"

## 为什么这么做

- **为什么用影子内存而非遍历检查**：把"这块内存能不能访问"降维成"查 1 字节影子 + 几条算术指令"，让每次访问的检查成本恒定且极小（~2x），这是 ASan 能实用（相对 Valgrind 10-50x）的根本。用空间（1/8 影子 + 红区）换时间。
- **为什么 free 要进隔离区**：立刻归还的内存会被下一次分配复用，use-after-free 访问到的是合法新数据，检测不到。隔离 + 毒化让"已释放"状态维持一段时间，把 UAF 变成可捕获的越界访问。
- **为什么 LSan 用可达性而非引用计数**：C++ 没有 GC/统一引用计数，唯一通用判据就是"从根还能不能走到这块内存"。走不到 = 无人能再释放它 = 泄漏。这也解释了为什么"可达的常驻单例"不被判为泄漏。

## 为什么别的选择不行

- **为什么不用 Valgrind 替代 ASan**：Valgrind 在虚拟 CPU 上翻译执行每条指令，慢 10-50 倍且不支持真正多线程并行，高并发游戏服务端根本跑不动。ASan 编译期插桩只慢 ~2x，能在预发压测中长期开着。代价是需要重编译。
- **为什么带 Sanitizer 的二进制不上生产**：2-3x 内存、2x-15x CPU 开销无法接受；且影子内存布局、拦截器改变了 ABI 行为，还引入额外攻击面。生产用低开销采样（eBPF memleak、jemalloc prof sampling）。
- **为什么不能只看 RSS 判泄漏**：分配器出于性能会缓存空闲内存不立即还给 OS，碎片也会让 RSS 虚高。只凭 RSS 增长下"泄漏"结论会误判——必须结合 heap profiler 的分配栈差分和长期趋势。
- **为什么 ASan/TSan 不能同时开**：两者都要独占地把大段虚拟地址映射成自己的影子内存，布局冲突，只能分两轮跑（一轮查内存、一轮查数据竞争）。

## 沉淀结论

面试速答清单：

- **原理一句话：编译期插桩 + 影子内存(8:1)；每次访问前查 1 字节影子，越界/UAF 立即报带栈**
- **ASan = 影子内存 + 分配块前后红区(查越界) + free 进隔离区并毒化(查 UAF)**
- **LSan（含于 ASan）= 退出时根可达性扫描，报不可达堆块的分配栈；可达单例不算泄漏**
- **全家桶：ASan 越界/UAF、LSan 泄漏、MSan 未初始化、TSan 数据竞争、UBSan 未定义行为**
- **ASan+UBSan 可同开；ASan/MSan/TSan 互斥；编译带 `-g -fno-omit-frame-pointer`，需 llvm-symbolizer 出符号**
- **ASan 靠编译期插桩(~2x，要重编)；Valgrind 靠动态翻译(10-50x，免重编)**
- **泄漏定位分场景：可重编→ASan+LSan；免重编→Valgrind；线上长跑→tcmalloc/jemalloc heap profiler 差分 / eBPF memleak / heaptrack**
- **RSS 涨 ≠ 泄漏：可能是分配器不还 OS、碎片、缓存；判据是长期只增不减且与负载不匹配**
- **Sanitizer 是测试/预发工具，插桩二进制不上生产**

### 记忆口诀

**ASan**：影子内存8:1 / 红区查越界 / 隔离区毒化查UAF
**LSan**：退出扫可达 / 报不可达块的分配栈 / 常驻单例不算泄漏
**选型**：可重编ASan(~2x) / 免重编Valgrind(10-50x) / 线上heap profiler差分
**判泄漏**：RSS涨≠泄漏 / 排除碎片缓存不还OS / 看长期只增不减

## 内容来源

关键点整理自 [AddressSanitizer 算法论文与 Clang 文档](https://clang.llvm.org/docs/AddressSanitizer.html)、[LeakSanitizer](https://clang.llvm.org/docs/LeakSanitizer.html)、[TSan](https://clang.llvm.org/docs/ThreadSanitizer.html)/[MSan](https://clang.llvm.org/docs/MemorySanitizer.html)/[UBSan](https://clang.llvm.org/docs/UndefinedBehaviorSanitizer.html) 官方文档、Valgrind Memcheck 手册、gperftools/jemalloc heap profiler 与 bcc `memleak` 文档重写为五段式。编译三段式与工具链全景参见 [编译优化与 LLVM/Clang/GCC](/game-infra/llvm-compile.md)。请以官方文档为准。

## 自测：合上资料能说清楚吗？

ASan 是怎么在每次内存访问前判断"这块内存能不能碰"的？为什么这种做法比遍历检查快？

<details><summary>参考答案</summary>

靠**影子内存(8:1)**：每 8 字节应用内存对应 1 字节影子，记录可用字节数。编译器在每次 load/store 前插桩，`shadow=(addr>>3)+offset` 算出影子地址、读 1 字节判断合法性。检查成本恒定（几条算术指令 + 1 字节读），无需遍历，这是 ASan 只慢 **~2x** 的根本，用空间换时间。

</details>

ASan 为什么能报 use-after-free？如果 free 后内存立刻还给分配器会怎样？

<details><summary>参考答案</summary>

`free` 时 ASan 不立刻归还，而是**毒化整块并放进 FIFO 隔离区(quarantine)**停留一段时间，期间任何访问都踩到毒化影子 → 报 UAF。若立刻归还，内存会被下次分配复用，UAF 访问到的是**合法新数据**，检测不到。代价是隔离区占内存（ASan 内存开销大）。

</details>

同事说服务 RSS 一直在涨，肯定是内存泄漏了。这个判断对吗？怎么确认？

<details><summary>参考答案</summary>

不一定对。**RSS 涨 ≠ 泄漏**：可能是分配器缓存空闲内存不还 OS、**内存碎片**、Page Cache 或有意缓存。判据是"**长期只增不减且与负载不成比例**"。确认方法：heap profiler（tcmalloc/jemalloc）对两个时间点做**分配栈差分**看谁在持续增长；glibc 用 `malloc_stats` 区分泄漏 vs 未归还。

</details>

要查泄漏，什么时候用 ASan+LSan，什么时候用 Valgrind，什么时候都不能用？两者根本区别是什么？

<details><summary>参考答案</summary>

**根本区别**：ASan 靠**编译期插桩(~2x，需重编)**，Valgrind 靠**运行时动态二进制翻译(10-50x，免重编)**。可重编且能复现 → 首选 **ASan+LSan**（直接给分配栈）；不能重编或只想快速看 → **Valgrind Memcheck**（但慢，游戏帧循环会卡死）；线上长跑不能停 → 都不用，改用 **eBPF memleak / jemalloc prof 采样**。

</details>

哪些 Sanitizer 能同时开、哪些互斥？为什么？

<details><summary>参考答案</summary>

**ASan+UBSan+LSan 可同开**（LSan 默认内含在 ASan）；**ASan/MSan/TSan 三者互斥**。因为 ASan、MSan、TSan 都要**独占地把大段虚拟地址映射成自己的影子内存**，布局冲突，只能分轮跑。编译务必带 `-g -fno-omit-frame-pointer`，并让 `llvm-symbolizer` 在 PATH 才有符号。

</details>

# go-gotchas — 闪卡

> Go 的面试陷阱几乎都来自三个真相：**slice/map/chan 是引用语义、值传递复制的是「表头」**；**defer 在 return 赋值之后、函数返回之前执行，能改命名返回值**；**接口是 (type, value) 二元组，`(*T)(nil)` 装进接口后接口不为 nil**。记住这三条，八成语法题当场破。

## 记忆口诀

- **两函数**：new 返指针 / make 返实例 / 仅限 slice·map·chan
- **slice**：共享底层数组 / 未扩容污染源 / 副本用 Clone·三索引
- **defer**：LIFO / 参数注册即求值 / 改命名返回值
- **接口 nil**：二元组 / 类型值全 nil 才 nil / 别拿带类型的 nil 指针当 error
- **chan**：读关返零值·ok=false / 写关 panic / 谁写谁关只关一次

## Card 1

**Q**: `append` 到一个用 `a[:2]` 得到的子 slice，什么时候会改到原 slice、什么时候不会？如何强制隔离？

**A**: 未超 cap 时共享底层数组，写回会污染源 slice；超 cap 触发重新分配后二者分离。想强制隔离：用 `slices.Clone`、`append([]int{}, src...)`，或三索引切片 `a[low:high:max]` 把 cap 卡死，逼下次 append 扩容。

## Card 2

**Q**: 命名返回值和匿名返回值，defer 里 `r++` 分别会不会影响最终返回？为什么？

**A**: 命名返回值能改：defer 在 return 赋值之后、真正返回之前执行，改的就是那个返回变量。匿名返回值改不动：return 已把值复制到返回槽，defer 动的是局部变量。

## Card 3

**Q**: 一个返回 `error` 的函数里 `var p *MyErr = nil; return p`，调用方 `if err != nil` 为什么成立？怎么避免？

**A**: 接口是 (类型, 值) 二元组，`p` 虽为 nil 但类型信息 `*MyErr` 还在，接口整体就不等于 nil。避免：成功路径直接 `return nil`（字面量，类型也为 nil），只有真出错才返回非 nil 指针。

## Card 4

**Q**: 内置 `map` 并发写会发生什么？`sync.Map` 与 `RWMutex + map` 各自的适用场景？

**A**: 内置 map 并发读写触发 fatal（不可 recover）。`sync.Map` 适合读多写少 / key 稳定（read·dirty 双 map，读走无锁快路径，但无 `len`）；`RWMutex + map` 适合写频繁 / 需遍历统计，通常更快更可控。

## Card 5

**Q**: `[]byte(s)` 常规强转会拷贝吗？为什么不能默认零拷贝共享？极致性能下怎么办？

**A**: 会拷贝一次。string 不可变是 map key、并发共享、常量折叠的地基；零拷贝共享会让改 `[]byte` 反噬 string，破坏不可变契约。极致场景用 `unsafe.String` / `unsafe.Slice`（Go 1.20+）复用底层数组，但必须保证之后不改。

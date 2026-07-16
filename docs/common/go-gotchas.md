---
title: Go 语言基础与常见陷阱
---

# Go 语言基础与常见陷阱

> new/make · slice 扩容与共享底层数组 · defer 顺序与返回值 · for-range 闭包 · nil interface · 内存逃逸 · 关闭 chan 读写 · string↔[]byte · sync.Map

::: tip 一句话抓手
Go 的面试陷阱几乎都来自三个真相：**slice/map/chan 是引用语义、值传递复制的是「表头」**；**defer 在 return 赋值之后、函数返回之前执行，能改命名返回值**；**接口是 (type, value) 二元组，`(*T)(nil)` 装进接口后接口不为 nil**。记住这三条，八成语法题当场破。
:::

## 场景问题

面试白板高频「找错/说输出」题，本质在考对底层模型的理解：

| 题目 | 考点 | 直觉答案往往错在 |
| --- | --- | --- |
| `var x string = nil` | 值类型不能赋 nil | string 是值类型，零值是 `""`，不能与 nil 比较 |
| `append` 后原 slice 变了吗 | 共享底层数组 + 扩容 | 未扩容时共享、改一处动全局；扩容后才分离 |
| `defer` 里改返回值 | 命名返回值 + defer 时机 | defer 能修改命名返回值，匿名返回值改不动 |
| for-range 中起 goroutine 打印 `i` | 循环变量捕获 | Go 1.22 前所有闭包共享同一个 `i` |
| `(*T)(nil)` 装进 error 判 `!= nil` | 接口二元组 | 类型信息在，接口就不为 nil |
| 读写已关闭的 chan | close 语义 | 读能一直读（返零值），写直接 panic |

## 实现方案

### new vs make

- `new(T)`：分配 T 的**零值**并返回指针 `*T`，适用于任意类型
- `make(T, ...)`：**仅**用于 `slice / map / chan`，做内部初始化并返回 **T 本身**（非指针），返回的是可用的实例

```go
p := new([]int)   // *[]int，指向一个 nil slice，*p == nil，append 前不可直接索引
s := make([]int, 0, 8) // []int，len=0 cap=8，可直接 append
```

### slice：表头、共享底层数组、扩容

slice 的底层结构是三元组，值传递复制的是这个 24 字节表头，不是数据：

```go
type SliceHeader struct {
    Data uintptr // 指向底层数组
    Len  int
    Cap  int
}
```

::: warning append 的经典坑
```go
a := []int{1, 2, 3}
b := a[:2]          // b 与 a 共享底层数组，len=2 cap=3
b = append(b, 99)   // 未超 cap，写回底层数组第 3 位 → a 变成 [1 2 99]！
b = append(b, 100)  // 超 cap，重新分配，b 与 a 从此分离
```
**规避**：需要独立副本时用 `append([]int{}, src...)` 或 `slices.Clone`；或用三索引切片 `a[low:high:max]` 限制 cap 强制下次 append 扩容分离。
:::

扩容规则（Go 1.18+）：cap < 256 时翻倍；≥ 256 时按 `newcap += (newcap + 3*256) / 4` 平滑到约 1.25 倍，再按内存规格向上取整。

### defer：执行时机、LIFO、与返回值

- 多个 defer 按**后进先出（栈）**执行
- defer 的**参数在注册时求值**，但函数体在返回时才跑
- defer 在 `return` 给返回值赋值**之后**、真正返回**之前**执行 → 能改**命名返回值**

```go
func f() (r int) {   // 命名返回值
    defer func() { r++ }()
    return 5         // r=5 → defer 执行 r++ → 实际返回 6
}

func g() int {       // 匿名返回值
    r := 5
    defer func() { r++ }()
    return r         // 返回值已复制为 5，defer 改的是局部 r → 返回 5
}
```

### for-range 循环变量捕获（Go 1.22 分水岭）

```go
for i := 0; i < 3; i++ {
    go func() { fmt.Print(i) }() // Go1.21-：常打印 333；Go1.22+：012
}
```

- **Go 1.22 之前**：`i` 是整个循环共享的一个变量，goroutine 真正跑时循环多半已结束 → 都读到最终值。规避：`i := i` 在循环体内做拷贝，或 `go func(i int){...}(i)` 传参。
- **Go 1.22 起**：每轮迭代 `i` 是新变量，闭包捕获天然正确。写代码仍建议显式传参，兼容旧版本 + 表意清晰。

### nil interface 陷阱

接口值 = `(动态类型, 动态值)` 二元组。只有**两者都为 nil** 接口才等于 nil：

```go
func do() error {
    var p *MyErr = nil
    return p          // 返回接口 (*MyErr, nil) —— 类型非 nil！
}
if do() != nil {      // 成立！经典“明明返回 nil 却进了错误分支”
    ...
}
```

**规避**：函数签名返回具体错误时，出错才返回非 nil 指针，成功路径直接 `return nil`（字面量 nil，类型也为 nil）。

### 内存逃逸（Escape Analysis）

编译器无法证明变量生命周期不超出栈帧时，就把它分配到堆上。用 `go build -gcflags='-m'` 查看。典型逃逸场景：

- 函数内返回**局部变量的指针**（C 里是野指针，Go 合法但逃逸）
- 把**指针或含指针的值发送到 channel**（编译期不知何时被接收）
- `[]*T` 这类**切片中存指针**
- `append` 触发底层数组重新分配且大小依赖运行时数据
- 在 **interface 上调用方法**（动态派发，实参逃逸）
- 变量太大超过栈规格，或大小在编译期不确定

### 关闭的 channel 读写

- **读已关闭 chan**：buffer 有剩余元素则依次读出（第二返回值 `ok=true`）；读空后立即返回**元素零值**且 `ok=false`，永不阻塞 → 用 `v, ok := <-ch` 或 `for range ch` 判断
- **写已关闭 chan**：直接 `panic: send on closed channel`
- **close 已关闭/nil chan**：panic
- 原则：**谁写谁关、只关一次**；多生产者用 `sync.Once` 或额外信号 chan 协调关闭

### string ↔ []byte 是否拷贝

`string` 不可变、`[]byte` 可变，两者底层结构不同（string 无 cap），**常规强转 `[]byte(s)` / `string(b)` 都会发生一次内存拷贝**以保证不可变性。极致性能场景可用 `unsafe` 复用底层数组零拷贝（Go 1.20+ 推荐 `unsafe.String` / `unsafe.Slice`），但必须保证之后不修改，否则破坏 string 不可变契约。

### sync.Map 适用场景

内置 `map` **并发读写会 fatal（非 panic，无法 recover）**。方案：

- 读多写少 / key 集合基本稳定 → `sync.Map`（内部 read/dirty 双 map，读走无锁快路径）
- 写频繁 / 需要遍历统计 → 自己用 `sync.RWMutex + map`，通常更快更可控
- `sync.Map` 无 `len()`，遍历用 `Range`；不要在读多写少之外滥用

## 为什么这么做

- **值语义 + 引用表头**：Go 用值传递保证简单可预测，同时让 slice/map/chan 以「小表头 + 指向堆数据」兼顾拷贝成本与共享能力——代价就是上面这些共享底层数组的坑。
- **defer 改命名返回值**：这是 Go 做统一错误包装 / 资源清理（`defer func(){ if err != nil {...} }()`）的语言级支撑，时机设计在 return 赋值之后正是为此。
- **逃逸分析**：让开发者不用手动区分栈/堆，编译器保证安全；理解它才能写出少 GC 压力的热路径代码（对象池、避免接口装箱、预分配 slice）。

## 为什么别的选择不行

- **为什么不让内置 map 并发安全**：绝大多数 map 是单 goroutine 使用，默认加锁会让所有人为极少数并发场景买单，违背 Go「零成本抽象」取向 → 把并发安全下放给 `sync.Map`/`RWMutex` 按需选用。
- **为什么 string 转 []byte 要拷贝**：string 的不可变性是 map key、并发共享、常量折叠等一堆特性的地基；若零拷贝共享，改 []byte 就会改到 string，破坏契约 → 默认拷贝，`unsafe` 留给你自负其责。
- **为什么不早点修 for-range 捕获**：改变量作用域是破坏性变更，社区权衡多年才在 1.22 用「每轮新变量」定案，并靠 `//go:build` 语言版本门控，避免旧代码语义漂移。

## 沉淀结论

面试速答清单：

- **new 返指针零值 / make 返 slice·map·chan 实例**
- **slice 共享底层数组，append 未扩容会污染源；要副本就 Clone / 三索引切片**
- **defer LIFO；参数注册时求值；能改命名返回值**
- **for-range 闭包：1.22 前共享变量（`i:=i` 或传参规避），1.22 后每轮新变量**
- **接口 nil 需类型和值都为 nil；别返回带类型的 nil 指针当 error**
- **逃逸五因：返指针、进 chan、存指针切片、append 扩容、接口调用**
- **关闭 chan：读可读（返零值 ok=false），写 panic；谁写谁关**
- **string↔[]byte 默认拷贝一次；并发写 map 用 sync.Map / RWMutex**

### 记忆口诀

- **两函数**：new 返指针 / make 返实例 / 仅限 slice·map·chan
- **slice**：共享底层数组 / 未扩容污染源 / 副本用 Clone·三索引
- **defer**：LIFO / 参数注册即求值 / 改命名返回值
- **接口 nil**：二元组 / 类型值全 nil 才 nil / 别拿带类型的 nil 指针当 error
- **chan**：读关返零值·ok=false / 写关 panic / 谁写谁关只关一次

## 内容来源

关键点整理自 [lifei6671/interview-go](https://github.com/lifei6671/interview-go)（`base/go-grammar.md` 及 `question/q001-q025` 系列），结合 Go 官方规范与 release notes（Go 1.22 循环变量语义）重写为五段式。请以官方文档为准。

## 自测：合上资料能说清楚吗？

1. `append` 到一个用 `a[:2]` 得到的子 slice，什么时候会改到原 slice、什么时候不会？如何强制隔离？

<details><summary>参考答案</summary>

**未超 cap** 时共享底层数组，写回会**污染源 slice**；**超 cap** 触发重新分配后二者分离。想强制隔离：用 **`slices.Clone`**、`append([]int{}, src...)`，或**三索引切片** `a[low:high:max]` 把 cap 卡死，逼下次 append 扩容。

</details>

2. 命名返回值和匿名返回值，defer 里 `r++` 分别会不会影响最终返回？为什么？

<details><summary>参考答案</summary>

**命名返回值**能改：defer 在 return 赋值**之后**、真正返回**之前**执行，改的就是那个返回变量。**匿名返回值**改不动：return 已把值**复制**到返回槽，defer 动的是局部变量。

</details>

3. 一个返回 `error` 的函数里 `var p *MyErr = nil; return p`，调用方 `if err != nil` 为什么成立？怎么避免？

<details><summary>参考答案</summary>

接口是 **(类型, 值) 二元组**，`p` 虽为 nil 但**类型信息 `*MyErr` 还在**，接口整体就**不等于 nil**。避免：成功路径直接 **`return nil`**（字面量，类型也为 nil），只有真出错才返回非 nil 指针。

</details>

4. 内置 `map` 并发写会发生什么？`sync.Map` 与 `RWMutex + map` 各自的适用场景？

<details><summary>参考答案</summary>

内置 map 并发读写触发 **fatal（不可 recover）**。**`sync.Map`** 适合**读多写少 / key 稳定**（read·dirty 双 map，读走无锁快路径，但无 `len`）；**`RWMutex + map`** 适合**写频繁 / 需遍历统计**，通常更快更可控。

</details>

5. `[]byte(s)` 常规强转会拷贝吗？为什么不能默认零拷贝共享？极致性能下怎么办？

<details><summary>参考答案</summary>

会**拷贝一次**。string **不可变**是 map key、并发共享、常量折叠的地基；零拷贝共享会让改 `[]byte` 反噬 string，**破坏不可变契约**。极致场景用 **`unsafe.String` / `unsafe.Slice`**（Go 1.20+）复用底层数组，但必须保证之后不改。

</details>

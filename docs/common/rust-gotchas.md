---
title: Rust 语言基础与常见陷阱
---

# Rust 语言基础与常见陷阱

> 所有权与移动 · 借用规则与生命周期 · `String` vs `&str` · `Rc`/`Arc`/`RefCell` 内部可变性 · 循环引用泄漏 · `?` 与错误处理 · Send/Sync · async 与 `.await` · trait 对象 · panic vs Result

::: tip 一句话抓手
Rust 的陷阱几乎都源自三个真相：**所有权唯一——赋值/传参默认是「移动」而非拷贝，move 后原变量失效**；**借用规则铁律——任一时刻要么多个共享引用 `&T`、要么唯一可变引用 `&mut T`，二者不可并存（编译期强制）**；**生命周期只是给编译器证明「引用不会比被引用者活得久」的标注，不改变运行时行为**。抓住这三条，八成 borrow checker 报错当场看懂。
:::

## 场景问题

面试与实战高频「为什么编译不过 / 会 panic」题，本质在考对所有权模型的理解：

| 题目 | 考点 | 直觉答案往往错在 |
| --- | --- | --- |
| `let b = a;` 之后用 `a` 报错 | 移动语义 | 非 Copy 类型赋值是 move，`a` 已失效 |
| 遍历 `Vec` 时 `push` 报错 | 借用冲突 | 迭代持有 `&`，push 需 `&mut`，不可并存 |
| `Rc` 互相持有会泄漏吗 | 循环引用 | 会，Rust 不防内存泄漏（泄漏是安全的） |
| `RefCell` 借用两次可变 | 运行时借用检查 | 编译过，运行时 `borrow_mut` 冲突直接 panic |
| 函数返回局部变量引用 | 生命周期 | 编译不过，引用比被引用者活得久 |
| `String` 能当 `&str` 用吗 | Deref 强制转换 | 能，`&String` 自动 deref 成 `&str` |
| `unwrap()` 生产环境用吗 | panic vs Result | `None`/`Err` 上 unwrap 直接 panic 崩进程 |
| 多线程共享 `Rc` | Send/Sync | `Rc` 非线程安全，编译期就拒绝，用 `Arc` |

## 实现方案

### 所有权与移动

每个值有**唯一所有者**，所有者离开作用域时值被 `drop`（析构）。非 `Copy` 类型的赋值、传参、返回都是**移动**：所有权转移，原变量失效。

```rust
let a = String::from("hi");
let b = a;              // 移动：a 的所有权给了 b
// println!("{}", a);  // ❌ 编译错误：value borrowed after move
```

`Copy` 类型（整数、`bool`、`char`、以及全由 Copy 组成的元组/结构）赋值是**按位拷贝**，原变量仍可用。`Clone` 是显式深拷贝（`a.clone()`）。

### 借用规则（编译期强制）

任一作用域内，对同一数据：**要么有任意多个不可变引用 `&T`，要么有且仅有一个可变引用 `&mut T`**——绝不同时存在。这就是「共享不可变、可变不共享」，从根上消灭数据竞争。

::: warning 迭代中修改容器
```rust
let mut v = vec![1, 2, 3];
for x in &v {           // 不可变借用 v
    v.push(*x);         // ❌ 需要可变借用 v，与上面的 &v 冲突
}
```
**规避**：先收集要改的，循环外再改；或改用索引 `for i in 0..v.len()`；或用 `retain`/`drain` 等专门 API。
:::

NLL（Non-Lexical Lifetimes）让借用在**最后一次使用后**即结束，而非到作用域尾，所以很多「看起来冲突」的代码其实能过。

### 生命周期标注

生命周期 `'a` 是给编译器的**证明**，标注引用之间的存活关系，不产生任何运行时代码：

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str { // 返回值活得不超过 x、y
    if x.len() > y.len() { x } else { y }
}
```

大多数场景由**生命周期省略规则**自动推导，无需手写。返回**局部变量的引用**必然编译不过（悬垂），要么返回所有权（`String`），要么让调用方传入缓冲。

### String vs &str

- `String`：**拥有**的、堆分配、可增长的 UTF-8 字符串
- `&str`：**借用**的字符串切片（指针 + 长度），指向别处的 UTF-8 数据；字符串字面量是 `&'static str`

`&String` 通过 **Deref 强制转换**自动变 `&str`，所以函数参数**优先写 `&str`**（更通用，`String` 和字面量都能传）。注意：字符串按 UTF-8 存储，`s[0]` 这样的字节索引**不被允许**（会切坏多字节字符），要用 `.chars()` / `.bytes()`。

### 内部可变性：Rc / Arc / RefCell / Cell

- `Rc<T>`：单线程引用计数共享所有权（非原子，非 `Send`）
- `Arc<T>`：原子引用计数，跨线程共享
- `RefCell<T>`：把**借用检查推迟到运行时**，允许在只有 `&self` 时改内部（`borrow` / `borrow_mut`）
- `Cell<T>`：整值 get/set 的内部可变，无引用

常见组合 `Rc<RefCell<T>>`（单线程共享可变）、`Arc<Mutex<T>>`（多线程共享可变）。

::: warning RefCell 运行时 panic + Rc 循环泄漏
```rust
let c = RefCell::new(5);
let b1 = c.borrow_mut();
let b2 = c.borrow_mut(); // ❌ 运行时 panic: already borrowed
```
`RefCell` 把借用冲突从「编译错误」变成「**运行时 panic**」——灵活性换来的是崩溃风险。

`Rc` 互相强引用会**内存泄漏**（计数永不归零）——**Rust 保证内存安全，但不保证不泄漏**（泄漏不是 unsafe）。规避：一个方向用 `Weak<T>`（`Rc::downgrade`，`upgrade()` 拿回 `Option<Rc>`）打破环。
:::

### 错误处理：Result / Option / `?` / panic

- 可恢复错误用 `Result<T, E>`，缺值用 `Option<T>`
- `?` 运算符：`Ok`/`Some` 时取值，`Err`/`None` 时**提前返回**（自动 `From` 转换错误类型）
- `panic!` / `unwrap()` / `expect()`：**不可恢复**，展开栈或直接 abort

::: warning unwrap 是生产事故高发点
`unwrap()` / `expect()` 在 `None` / `Err` 上**直接 panic**。库代码和服务里滥用 = 一个边界输入崩整个线程/进程。生产代码用 `?` 传播、`match`/`if let` 处理、或 `unwrap_or`/`unwrap_or_else` 给默认值。`unwrap` 只留给「逻辑上不可能失败」且你愿意为其崩溃负责的地方。
:::

### 并发：Send / Sync

- `Send`：类型的所有权可跨线程转移
- `Sync`：`&T` 可跨线程共享（即 `T` 可被多线程同时引用）

这两个 auto trait 由编译器自动推导，把线程安全变成**类型系统层面的编译期检查**：`Rc` 非 `Send`（计数非原子），跨线程传会**编译报错**，逼你换 `Arc`。「无畏并发」正来自此——数据竞争在编译期就被拒。

### async / .await

`async fn` 返回一个**惰性的 `Future`**，**不 `.await`（或不交给 executor）就完全不执行**。Rust 只提供语言层，运行时（tokio / async-std）需自选。

::: warning async 的两个高频坑
- **忘记 `.await`**：`let f = do_async();` 什么都没发生，`f` 只是个未轮询的 Future（编译器通常有 `must_use` 警告）。
- **跨 `.await` 持有非 `Send` 类型**（如 `RefCell` 的 borrow、`MutexGuard`）：在多线程 executor 上会编译报错或死锁；`.await` 点前释放守卫。
:::

### trait 对象与泛型

- 泛型 `<T: Trait>`：**静态分发**，单态化，零运行时开销，代码膨胀
- `dyn Trait`（`Box<dyn Trait>`、`&dyn Trait`）：**动态分发**，虚表，有运行时开销但代码紧凑、可异构集合

## 为什么这么做

- **所有权 + 借用检查**：Rust 的核心命题是「**无 GC 的内存安全 + 无数据竞争的并发**」。把「谁负责释放」「谁能改」编码进类型系统，编译期证明，运行时零开销——既有 C++ 的性能又有内存安全，代价是编译期与 borrow checker 搏斗。
- **生命周期**：让编译器能证明所有引用都不悬垂，且**不需要运行时检查或 GC**。标注只是把程序员脑中的存活假设写给编译器验证。
- **Result + `?`**：错误是值、必须显式处理（`#[must_use]`），杜绝「忘记检查返回码」；`?` 让传播不啰嗦。区分 panic（bug/不可恢复）与 Result（预期内错误）让错误处理意图清晰。
- **Send/Sync**：把线程安全下沉到类型系统，编译期挡住数据竞争，这是「无畏并发」的技术基础。

## 为什么别的选择不行

- **为什么不用 GC**：GC 有停顿和内存开销，且无法确定性释放非内存资源。所有权在编译期确定释放点，零运行时成本，适合系统级/嵌入式/高性能场景——这是 Rust 存在的理由。
- **为什么不允许共享可变引用**：可变别名（aliasing + mutation）正是数据竞争和迭代器失效的根源。禁止它换来的是编译期消灭一大类 bug；需要共享可变时显式用 `RefCell`/`Mutex`，把风险局部化并标注出来。
- **为什么 Rust 不防内存泄漏**：泄漏不违反内存安全（不会读写非法内存），且完全防住会限制表达力（`Rc` 环有合法用途）。所以 `mem::forget`、`Rc` 环泄漏都是 safe 的——安全 ≠ 无泄漏。
- **为什么 async 是惰性的**：惰性 Future 让运行时能自由调度、组合、取消，且零成本（不 poll 就不占资源）。代价是必须搭配 executor 且容易「忘记 await」。

## 沉淀结论

面试速答清单：

- **所有权唯一；非 Copy 类型赋值/传参是 move，move 后原变量失效**
- **借用铁律：多个 `&T` 或唯一 `&mut T`，二者不可并存；NLL 让借用在末次使用后即结束**
- **生命周期是编译期证明，零运行时开销；不能返回局部变量的引用**
- **参数优先 `&str`（`&String` 自动 deref）；字符串是 UTF-8，不能字节索引**
- **`RefCell` 把借用检查移到运行时，冲突 panic；`Rc` 环内存泄漏（安全但泄漏），用 `Weak` 打破**
- **`Rc<RefCell<T>>` 单线程共享可变；`Arc<Mutex<T>>` 多线程**
- **错误用 `Result`/`Option` + `?` 传播；`unwrap`/`expect` 会 panic，生产慎用**
- **`Send`/`Sync` 编译期保证线程安全；`Rc` 非 Send，跨线程用 `Arc`**
- **`async fn` 返回惰性 Future，不 `.await` 不执行；别跨 await 持有非 Send 守卫**
- **泛型 = 静态分发零开销；`dyn Trait` = 动态分发有虚表；Rust 内存安全 ≠ 不泄漏**

## 内容来源

关键点整理自 [The Rust Programming Language（官方 Book）](https://doc.rust-lang.org/book/)、[Rustonomicon](https://doc.rust-lang.org/nomicon/)、[Rust Reference](https://doc.rust-lang.org/reference/) 与社区共识（NLL、Send/Sync 规则）重写为五段式。请以官方文档为准。

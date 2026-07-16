# rust-gotchas — 闪卡

> Rust 的陷阱几乎都源自三个真相：**所有权唯一——赋值/传参默认是「移动」而非拷贝，move 后原变量失效**；**借用规则铁律——任一时刻要么多个共享引用 `&T`、要么唯一可变引用 `&mut T`，二者不可并存（编译期强制）**；**生命周期只是给编译器证明「引用不会比被引用者活得久」的标注，不改变运行时行为**。抓住这三条，八成 borrow checker 报错当场看懂。

## 记忆口诀

- **所有权**：唯一 / move 后失效 / Copy 才拷贝
- **借用**：共享不可变 `&T` / 可变不共享 `&mut T` / NLL 末次即结束
- **共享可变**：单线程 `Rc<RefCell>` / 多线程 `Arc<Mutex>` / 环用 `Weak` 打破
- **错误**：`Result`+`?` 传播 / `unwrap` 会 panic / `Send·Sync` 编译期查
- **async**：Future 惰性 / 不 await 不跑 / 别跨 await 持非 Send 守卫

## Card 1

**Q**: 为什么 `let b = a;` 之后再用 `a` 会编译报错？什么类型不会？

**A**: 非 Copy 类型赋值是 move（所有权转移），`a` 失效。整数/`bool`/`char` 等 Copy 类型是按位拷贝，原变量仍可用；`Clone` 是显式深拷贝。

## Card 2

**Q**: 借用规则的「铁律」是什么？NLL 又放宽了什么？

**A**: 同一数据要么多个 `&T`、要么唯一 `&mut T`，不可并存（共享不可变、可变不共享）。NLL 让借用在最后一次使用后即结束（而非到作用域尾），故很多看似冲突的代码能过。

## Card 3

**Q**: `RefCell` 和编译期借用检查有何不同？借用冲突时会怎样？

**A**: `RefCell` 把借用检查推迟到运行时，允许 `&self` 下改内部。冲突（如两次 `borrow_mut`）不是编译错误而是运行时 panic——用灵活性换崩溃风险。

## Card 4

**Q**: 对比 `Rc` 与 `Arc`、`Rc<RefCell<T>>` 与 `Arc<Mutex<T>>`，各用在什么场景？

**A**: `Rc` 非原子计数、非 Send，仅单线程；`Arc` 原子计数、可跨线程。共享可变时：单线程用 `Rc<RefCell<T>>`，多线程用 `Arc<Mutex<T>>`。跨线程传 `Rc` 编译期即被拒。

## Card 5

**Q**: `async fn` 返回什么？为什么说它「惰性」，有哪两个高频坑？

**A**: 返回惰性 Future，不 `.await`（或不交 executor）就不执行。坑一：忘记 await，什么都不发生；坑二：跨 await 持有非 Send 守卫（`RefCell` borrow、`MutexGuard`）在多线程 executor 上报错或死锁。

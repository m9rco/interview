---
title: C++20 语言基础与常见陷阱
---

# C++20 语言基础与常见陷阱

> Concepts 约束 · Ranges 与视图惰性求值 · Coroutines 协程 · Modules · `<=>` 三路比较 · `std::span` · `constinit`/`consteval` · `std::jthread` 与 stop_token · designated initializers

::: tip 一句话抓手
C++20 的四大件（Concepts / Ranges / Coroutines / Modules）里，最容易在面试和实战翻车的是两个真相：**Ranges 的 view 是惰性的、且大多不拥有数据——底层容器一销毁 view 就悬垂**；**协程的 `co_await`/`co_yield` 只是「可暂停的函数」，帧在堆上分配、生命周期由你写的 promise 类型管，用错就悬垂/泄漏**。再加一条老命题：`operator<=>` 让你「写一个比较得到六个」。抓住这三点，C++20 的新坑基本覆盖。
:::

## 场景问题

面试与 code review 高频「这段新语法安全吗 / 输出什么」题：

| 题目 | 考点 | 直觉答案往往错在 |
| --- | --- | --- |
| `auto v = vec \| filter(..)` 存起来跨函数用 | view 悬垂 | view 不拥有数据，vec 没了 v 就悬垂 |
| range 管道遍历两次结果一样吗 | 惰性 + 有状态 view | `filter` 每次遍历重新求值，某些 view 只能过一遍 |
| 协程函数里能用 `return` 吗 | 协程规则 | 不能用普通 return，只能 `co_return` |
| `co_await` 之后引用参数还有效吗 | 协程帧生命周期 | 引用/指针参数在挂起后可能已悬垂 |
| 定义了 `<=>` 还要写 `==` 吗 | 三路比较合成 | `==` 不由 `<=>` 自动合成（性能考量），要单独默认 |
| `std::span` 保存一份 vector 的视图安全吗 | span 是非拥有视图 | 同 view，底层生命周期结束即悬垂 |
| Concepts 约束失败是硬错误吗 | SFINAE 友好 | 不是，约束失败是「不参与重载」而非编译中止 |

## 实现方案

### Concepts：给模板参数加约束

用可读的约束替代晦涩的 SFINAE，错误信息从「几百行模板展开」变成「不满足 concept X」：

```cpp
template <class T>
concept Addable = requires(T a, T b) { { a + b } -> std::same_as<T>; };

template <Addable T>          // 或 requires Addable<T>
T sum(T a, T b) { return a + b; }
```

约束不满足时该重载**只是不参与候选**（SFINAE 友好），不是编译错误——这让重载决议能在多个受约束模板间正确挑选。`requires requires` 双关键字（一个引入约束、一个是 requires 表达式）是常见困惑点。

### Ranges 与视图（惰性 + 非拥有）

```cpp
auto evens = vec | std::views::filter([](int x){ return x % 2 == 0; })
                 | std::views::transform([](int x){ return x * x; });
for (int x : evens) { /* 到这里才逐元素求值 */ }
```

::: warning view 悬垂：C++20 最大新坑
`views::filter/transform/...` 返回的是**惰性视图**，**不拥有**底层数据，只持有对源容器的引用/迭代器。
```cpp
auto get() {
    std::vector<int> v{1,2,3};
    return v | std::views::transform([](int x){ return x*2; }); // ❌ v 出栈销毁
}                                                                //   返回的 view 悬垂
```
**规避**：view 不要跨越底层容器的生命周期存储；需要独立结果就**物化**（C++23 的 `ranges::to<vector>`，或手动 `std::vector<int>(r.begin(), r.end())`）。对临时容器用管道时尤其危险。
:::

::: warning 惰性 + 有状态导致重复求值 / 单遍
惰性意味着**每次遍历 view 都重新执行整条管道**（`transform` 的函数会被反复调用，别在里面放副作用或昂贵计算并假设只跑一次）。且部分 view（如 `filter`）不是 forward range 之上还保持廉价，缓存首元素等实现细节会让「遍历两次」出现意外。需要多次使用请先物化。
:::

### Coroutines：可暂停的函数

一个函数体内出现 `co_await` / `co_yield` / `co_return` 之一，它就是协程。编译器把局部状态存进**堆上分配的协程帧**，由返回类型关联的 `promise_type` 控制挂起/恢复/销毁。

::: warning 协程帧的生命周期与悬垂参数
- **按引用/指针传入的参数不会被拷进协程帧**。协程在第一个挂起点之后，调用方栈帧可能已经返回 → **引用参数悬垂**。规避：协程参数尽量**按值传**（会拷进帧），或保证实参活得够久。
- 协程帧必须被恢复到结束或显式 `destroy`，否则**帧泄漏**。这通常由 RAII 的协程句柄包装（如各种 `task<T>`）负责。
- C++20 只给了**底层原语**，标准库**没有**开箱即用的 `task`/`generator`（`std::generator` 是 C++23）。实战多依赖第三方库（cppcoro、folly、asio）。
:::

```cpp
Generator<int> range(int n) {
    for (int i = 0; i < n; ++i)
        co_yield i;          // 每次挂起产出一个值，恢复后继续循环
}
```

### 三路比较运算符 `<=>`（太空船）

```cpp
struct Point {
    int x, y;
    auto operator<=>(const Point&) const = default; // 一次默认，得到 < > <= >=
    bool operator==(const Point&) const = default;  // == 需单独默认！
};
```

::: warning `<=>` 不合成 `==`
`operator<=>` 会自动合成 `<`、`>`、`<=`、`>=`，但**不合成 `==` / `!=`**。原因是性能：判等常有短路优化（先比 size 再比内容），而 `<=>` 语义是全序比较，强行用它做判等会更慢。所以要相等比较就**单独 `= default` 一个 `operator==`**。返回类型有 `strong_ordering` / `weak_ordering` / `partial_ordering`（浮点是 partial，因 NaN 不可比）。
:::

### 其他高频新特性

- **`std::span<T>`**：连续序列的**非拥有**视图（指针 + 长度），统一 `vector`/数组/C 数组的接口；**悬垂风险同 view**，别持有超过底层生命周期。
- **`std::jthread`**：析构时**自动 join**（`std::thread` 忘记 join 会 `terminate`），并内建 `stop_token` 协作式取消。新代码优先 `jthread`。
- **`consteval`**：必须编译期求值的「立即函数」；**`constinit`**：保证静态变量常量初始化（防「静态初始化顺序灾难」），但不要求 const。
- **Modules**：`import std;` 替代头文件，避免宏污染与重复解析、加快编译；但工具链/构建系统支持在 2020-2022 年尚不成熟，落地慢。
- **Designated initializers**：`Widget w{.x = 1, .y = 2};`，但**必须按成员声明顺序**，且不支持乱序/嵌套跳过（比 C 更严）。

## 为什么这么做

- **Concepts**：把模板的隐式契约显式化，既改善错误信息（从模板展开地狱到一行「不满足约束」），又让重载决议可基于约束精确挑选，取代脆弱难读的 `enable_if` SFINAE。
- **Ranges 惰性视图**：管道式组合（`filter | transform | take`）表达力强且**零中间容器**——不惰性就得每一步物化一个临时 vector，内存和拷贝成本爆炸。惰性 + 非拥有正是「零成本抽象」的体现，代价就是悬垂风险。
- **Coroutines**：让异步/生成器代码写成同步的直线逻辑，消灭回调地狱。帧放堆上是因为挂起后要跨栈帧存活，栈放不下。
- **`<=>`**：从「写六个比较运算符」的样板中解放，一次 `= default` 覆盖全序，减少手写比较的不一致 bug。

## 为什么别的选择不行

- **为什么 view 不拥有数据**：拥有就得拷贝或管理生命周期，破坏「零成本、可任意组合」的目标。非拥有让 view 轻如迭代器对，代价是把生命周期责任交给程序员——这是 C++ 一贯的取舍。
- **为什么协程不自动拷贝引用参数**：拷贝有成本且改变语义，C++ 默认「你写引用就是要引用」。自动拷会违背零成本原则，于是把悬垂责任留给你（按值传即入帧）。
- **为什么 `<=>` 不管 `==`**：全序比较和判等是不同操作，判等有独立的快路径优化空间。若强行合成，`==` 会被迫走全序路径而变慢，违背性能优先。
- **为什么 Modules 落地慢**：它要求编译器 + 构建系统 + 包管理协同重构几十年的头文件生态，不是语言特性本身的问题，而是工具链演进的现实约束。

## 沉淀结论

面试速答清单：

- **Concepts 约束失败 = 不参与重载（SFINAE 友好），不是编译中止；错误信息大幅改善**
- **Ranges view 惰性 + 非拥有：别跨底层容器生命周期存储，需结果就物化**
- **view 每次遍历重跑整条管道，`transform` 里别放有副作用/昂贵逻辑**
- **协程：函数体含 `co_*` 即协程；帧在堆上；引用参数挂起后易悬垂 → 按值传**
- **C++20 无标准 `task`/`generator`（那是 C++23），需第三方库**
- **`<=>` 合成四个关系运算但不合成 `==`，判等要单独 `= default`；浮点是 partial_ordering**
- **`std::span` 是非拥有视图，悬垂风险同 view**
- **新代码用 `std::jthread`（自动 join + stop_token）代替 `std::thread`**
- **`constinit` 防静态初始化顺序灾难；`consteval` 强制编译期求值**
- **designated initializers 必须按声明顺序**

### 记忆口诀

- **四大件**：Concepts 约束 / Ranges 惰性视图 / Coroutines 协程 / Modules 模块
- **Ranges 两坑**：非拥有→跨生命周期悬垂 / 惰性→每遍重跑管道，需结果就物化
- **协程三律**：`co_*` 即协程 / 帧在堆上 / 引用参数挂起后悬垂→按值传
- **太空船**：一写 `<=>` 得四关系 / 但 `==` 要单独 default / 浮点是 partial

## 内容来源

关键点整理自 [cppreference](https://en.cppreference.com/)、ISO C++ 标准（N4861，C++20）、《C++20: The Complete Guide》（Nicolai Josuttis）与 [isocpp Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/) 重写为五段式。协程与 Ranges 悬垂问题参考社区共识（P2216/P2415 等提案讨论）。请以官方标准与 cppreference 为准。

## 自测：合上资料能说清楚吗？

1. 为什么把一个 `vec | views::filter(...)` 的结果存到成员变量、跨函数使用是危险的？如何规避？
<details><summary>参考答案</summary>

view **不拥有**数据，只持有对源容器的**引用/迭代器**；底层 `vec` 一销毁，view 就**悬垂**。规避：不要跨底层容器生命周期存储 view，需要独立结果就**物化**为 vector（`ranges::to` 或迭代器构造）。

</details>

2. 协程函数按引用传入参数，在第一个 `co_await` 挂起点之后使用它为什么可能崩？正确做法是什么？
<details><summary>参考答案</summary>

引用/指针参数**不会拷进协程帧**；挂起后调用方栈帧可能已返回，实参**悬垂**。做法：协程参数尽量**按值传**（会拷入堆上的帧），或确保实参活得够久。

</details>

3. 定义了 `operator<=>() = default` 后，`<`、`==` 分别是否可用？为什么这样设计？
<details><summary>参考答案</summary>

`<`/`>`/`<=`/`>=` **自动合成**可用；`==`/`!=` **不合成**，需单独 `operator== = default`。原因是**性能**：判等常有短路优化（先比 size），强用全序 `<=>` 做判等更慢。

</details>

4. 对比 `std::span` 与 `std::vector`：各自的所有权与悬垂风险有何不同？
<details><summary>参考答案</summary>

`vector` **拥有**并管理数据，生命周期自洽；`span` 是**非拥有**视图（指针+长度），只是别人数据的窗口，**悬垂风险同 Ranges view**——不能持有超过底层生命周期。span 适合做接口参数，不适合长期存储。

</details>

5. 为什么 C++20 有了协程语法，实战却常要引入 cppcoro/asio 等第三方库？
<details><summary>参考答案</summary>

C++20 只给了**底层原语**（`co_await`/promise 定制点），标准库**没有**开箱即用的 `task`/`generator`（`std::generator` 是 **C++23**）。要写可用的协程返回类型和调度，得靠第三方库或自己实现 promise。

</details>

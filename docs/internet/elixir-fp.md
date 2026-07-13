---
title: Elixir 与函数式 / BEAM
---

# Elixir 与函数式 / BEAM

> 为什么电信设备能做到"九个九"的可用性、单机扛百万连接？答案是 BEAM 上的轻量进程 + Actor 模型 + OTP 监督树，加上"let it crash"这套反直觉的容错哲学。Elixir 是这套 30 年老底子的现代语法外壳。

## 场景问题

某些系统对**高并发 + 软实时 + 容错**的要求是普通线程模型难以满足的：

- **海量并发连接**：即时通讯、推送网关、IoT 接入，单机几十万到百万长连接，每个连接需要独立、隔离的状态。
- **软实时**：不是硬实时（不保证微秒级），但要求延迟稳定、无长时间停顿（GC 不能 Stop-The-World 卡全局）。
- **电信级容错**：某个连接/会话崩了，绝不能影响其他连接；系统要能自愈，可用性逼近 99.9999999%。
- **热更新**：电信设备不能停机升级。

传统"共享内存 + 锁 + 大线程"模型在这里处处碰壁：线程重（MB 级栈）、锁竞争、一个线程崩溃可能带崩进程、全局 GC 停顿。BEAM（Erlang 虚拟机）+ 函数式 + Actor 就是为这类问题从头设计的运行时。

## 实现方案

### 函数式基石：不可变数据 + 模式匹配 + 递归

```elixir
# 不可变：更新 map 不改原值，返回新值
person = %{name: "Ada", age: 36}
older = %{person | age: 37}    # person 不变，older 是新 map

# 模式匹配：解构 + 断言合一
{:ok, value} = {:ok, 42}       # 匹配成功，value = 42
{:ok, value} = {:error, :nope} # 匹配失败 → 抛异常（fail fast）

# 用递归 + 模式匹配替代 for 循环（函数多子句按模式分派）
def sum([]), do: 0                      # 边界：空列表
def sum([head | tail]), do: head + sum(tail)  # 拆头递归

# 尾递归 + 累加器，避免爆栈（BEAM 对尾调用优化）
def sum_tr(list, acc \\ 0)
def sum_tr([], acc), do: acc
def sum_tr([h | t], acc), do: sum_tr(t, acc + h)
```

- **不可变数据**：数据一旦创建不可修改，"修改"即产生新值。天然无数据竞争——多个进程读同一份数据无需加锁。
- **无副作用**：函数输入决定输出，易测试、易推理、可安全并行。
- **模式匹配 + 递归替代循环**：函数式没有可变循环变量，用递归（尤其尾递归）+ 多子句模式匹配表达迭代，代码声明式、清晰。

### Actor 模型：轻量进程 + 消息传递

```mermaid
flowchart LR
    P1[进程 A<br/>独立堆栈] -->|send msg| MB2[进程 B 的邮箱]
    MB2 --> P2[进程 B<br/>receive 处理]
    P2 -->|send reply| MB1[进程 A 的邮箱]
    Note1[无共享内存<br/>只靠拷贝消息通信]
```

BEAM 的并发单位是**轻量进程**（不是 OS 线程/进程）：

- **极轻**：初始几 KB 内存，创建微秒级，单机可跑**数百万**个。
- **完全隔离**：每个进程有**独立的堆和 GC**，进程间**不共享任何内存**，只能通过**消息传递**（消息被拷贝到对方邮箱）通信。
- **抢占式调度**：BEAM 调度器（每 CPU 核一个）在进程间公平抢占调度（按 reduction 计数），单个进程无法饿死别人。
- **独立 GC**：每个进程单独 GC，**没有全局 Stop-The-World**，所以延迟稳定——这是"软实时"的关键。

```elixir
# 裸进程：spawn + send + receive
pid = spawn(fn ->
  receive do
    {:hello, from} -> send(from, {:reply, "hi"})
  end
end)
send(pid, {:hello, self()})
```

### OTP：GenServer + Supervisor 监督树

裸 `spawn/send/receive` 很少直接用，生产用 **OTP** 抽象。GenServer 封装"有状态服务进程"的通用模式：

```elixir
defmodule Counter do
  use GenServer

  # ---- 客户端 API（在调用者进程里执行）----
  def start_link(init), do: GenServer.start_link(__MODULE__, init, name: __MODULE__)
  def inc, do: GenServer.cast(__MODULE__, :inc)        # 异步，不等回复
  def get, do: GenServer.call(__MODULE__, :get)        # 同步，等回复

  # ---- 服务端回调（在 GenServer 进程里串行执行，天然无锁）----
  @impl true
  def init(init), do: {:ok, init}                       # 初始化状态

  @impl true
  def handle_cast(:inc, state), do: {:noreply, state + 1}

  @impl true
  def handle_call(:get, _from, state), do: {:reply, state, state}
end
```

::: tip GenServer 为什么无需加锁
一个 GenServer 进程的状态只被它自己**串行**处理消息时访问，消息在邮箱里排队逐个处理。没有并发访问同一状态，自然不需要锁——这就是 Actor 模型消解锁的方式：**用"串行处理 + 隔离"替代"并行访问 + 加锁"**。
:::

**Supervisor 监督树 + let-it-crash**：

```elixir
defmodule App.Supervisor do
  use Supervisor
  def start_link(arg), do: Supervisor.start_link(__MODULE__, arg, name: __MODULE__)

  @impl true
  def init(_) do
    children = [
      {Counter, 0},
      {SessionRegistry, []},
    ]
    # 重启策略：one_for_one（谁崩重启谁）
    Supervisor.init(children, strategy: :one_for_one, max_restarts: 3, max_seconds: 5)
  end
end
```

```mermaid
flowchart TB
    Root[根 Supervisor<br/>strategy: one_for_one] --> S1[子 Supervisor<br/>会话组]
    Root --> W0[Counter GenServer]
    S1 --> W1[Session 1]
    S1 --> W2[Session 2]
    S1 --> W3[Session N]
    Note[某 Session 崩溃 → 监督者重启它<br/>回到干净初始状态，其他不受影响]
```

- **let it crash（放任崩溃）**：不写防御性 try/catch 兜住所有异常。进程遇到未预期错误就让它崩，监督者**把它重启回一个已知的干净状态**。因为进程隔离，一个崩溃不扩散。
- **监督策略**：`one_for_one`（崩谁重启谁）、`one_for_all`（一个崩全部重启）、`rest_for_one`（崩它及其后启动的）。
- **重启上限**：`max_restarts/max_seconds` 内崩太频繁则监督者自己也崩，向上冒泡——避免无限重启掩盖真 bug。

### 为什么这套能做电信级容错

```mermaid
flowchart LR
    Crash[某进程崩溃] --> Iso[进程隔离<br/>不共享内存 → 不扩散]
    Iso --> Sup[监督者感知<br/>linked/monitor]
    Sup --> Restart[重启到干净状态]
    Restart --> Heal[系统自愈<br/>其余进程无感]
```

崩溃被隔离在单个轻量进程内，监督者秒级重启回干净状态，故障不扩散、系统自愈——这就是 Erlang/OTP 在电信设备上做到"九个九"的机制。

## 为什么这么做

### 为什么不可变 + 无共享让并发变简单

并发 bug 的根源是**多个执行流并发修改共享的可变状态**（数据竞争）。函数式的不可变数据 + Actor 的无共享内存**从根上消灭了这个前提**：没有共享可变状态，就没有数据竞争，就不需要锁，也就没有死锁、锁竞争、内存可见性这些问题。状态被封在各自的进程里，只能通过消息改变。这让"写正确的高并发程序"从"如履薄冰"变成"默认安全"。

### 为什么 let-it-crash 反而更可靠

传统思路是"预判所有错误并防御"。但错误组合无穷，防御代码本身也可能有 bug，还把主逻辑搞得面目全非。OTP 的思路是：**只处理你预期的正常路径，异常就崩，交给监督者重启到已知好状态**。因为：

- 进程隔离 + 状态外置（监督者持有重启逻辑），重启代价极低。
- 大量瞬时错误（网络抖动、偶发脏数据）重启一次就好了，无需精心处理每种。
- 主逻辑保持干净，可靠性反而更高。

### 为什么独立 GC 支撑软实时

每个进程独立小堆、独立 GC，回收只停这一个进程（且它的堆很小，停顿微不足道），**永远没有全局 STW**。相比之下 JVM/Go 的全局 GC 即便优化得很好也会有全局停顿波动。这让 BEAM 的**尾延迟（P99/P999）异常稳定**，正是软实时要的。

## 为什么别的选择不行

### 为什么 Go/Java 的线程模型在此场景不如 BEAM

| 维度 | BEAM 进程 | Go goroutine | Java 线程 |
|---|---|---|---|
| 隔离性 | 完全隔离（独立堆/GC） | 共享内存（要 channel/锁自律） | 共享内存（要锁） |
| 崩溃影响 | 单进程崩不扩散 | panic 不 recover 会**带崩整个进程** | 未捕获异常影响所在线程/JVM |
| GC | 每进程独立、无全局 STW | 全局 GC（有 STW，虽短） | 全局 GC（STW 波动） |
| 容错模型 | 内建监督树/OTP | 需自己搭 | 需自己搭 |
| 热更新 | 内建（code reload） | 无 | 弱 |

- **Go**：goroutine 也很轻、调度也好，但 goroutine **共享内存**，仍需 channel/锁自律，且一个 goroutine 的 `panic` 未 recover 会带崩整个进程——没有 BEAM 那种"崩溃被隔离在单进程 + 监督树自愈"的内建容错。
- **Java**：线程重、共享内存靠锁、全局 GC 有 STW 波动，做百万连接和软实时都吃力。

BEAM 的杀手锏不是"更快"，而是**隔离 + 监督 + 无全局 STW** 这套为容错和软实时量身定做的组合，Go/Java 要自己费力拼凑且做不到同等隔离度。

### 为什么函数式 + Actor 不适合计算密集 / 大可变数组

- **计算密集（数值计算、加解密热循环）**：函数式的不可变意味着"改一个元素要生成新结构"，对**大数组的原地修改**极不友好；BEAM 的数值计算性能也远不如 C/Rust/Go。这类任务该用命令式语言 + 可变数组，或把热点用 NIF（原生 C）外挂。
- **需要可变大数组/矩阵**：不可变数据结构（持久化数据结构靠共享 + 部分拷贝）在"频繁原地写大数组"场景开销大。图像处理、科学计算、游戏物理这类应选可变内存模型的语言。

**结论**：Elixir/BEAM 的甜点是 **I/O 密集 + 海量并发连接 + 软实时 + 高容错**（聊天、推送、IoT 接入、Web 后端）；**不是** CPU 密集的数值计算。用错场景就是拿容错换性能的亏本买卖。

## 沉淀结论

**复习要点**

- **函数式三件套**：不可变数据（无数据竞争）、无副作用（易推理/并行）、模式匹配 + 递归（替代循环，尾递归防爆栈）。
- **BEAM 轻量进程**：几 KB、微秒创建、百万级、**独立堆 + 独立 GC + 无共享内存**，抢占式调度，靠**消息传递**通信 —— 即 Actor 模型。
- **OTP**：GenServer 封装有状态服务（消息串行处理，天然无锁）；Supervisor 监督树 + **let-it-crash**（崩了重启到干净状态，进程隔离故障不扩散）；重启策略 one_for_one/all/rest_for_one + 重启上限。
- **软实时**靠每进程独立 GC、**无全局 STW**，尾延迟稳定。
- vs Go/Java：BEAM 胜在**隔离 + 监督 + 无全局 STW** 的内建容错，非速度；Go 共享内存 + panic 会带崩进程，Java 线程重 + 全局 GC。
- **不适合**：CPU 密集数值计算、频繁原地改大数组——该用命令式/可变内存语言或 NIF。

**面试话术**

> "Elixir 跑在 BEAM 上，核心是函数式 + Actor。不可变数据和进程间无共享内存从根上消灭了数据竞争，所以不用锁；并发单位是几 KB 的轻量进程，单机能跑百万个，每个有独立堆和独立 GC，没有全局 STW，所以尾延迟稳定、能做软实时。容错靠 OTP 的监督树 + let-it-crash：进程遇到未预期错误就崩，监督者把它重启到干净状态，因为进程隔离故障不会扩散，这就是电信级九个九可用性的来源。相比 Go/Java，goroutine 和线程都共享内存、panic 或未捕获异常会带崩进程，也没有内建监督树——BEAM 赢在隔离和容错，不是赢在速度。所以它适合海量连接、软实时、高容错的 I/O 密集服务，不适合 CPU 密集的数值计算和大可变数组。"

::: warning 一句话记忆
BEAM 卖的不是"快"，是"崩得起、修得快、互不影响"——隔离 + 监督 + 无全局 GC 停顿。
:::

## 内容来源

综合整理。主要参考方向：Elixir 官方文档、Erlang/OTP 设计原则（Supervisor / GenServer behaviour）、《Programming Erlang》(Joe Armstrong) 的 let-it-crash 哲学、BEAM 调度与 per-process GC 机制文档。

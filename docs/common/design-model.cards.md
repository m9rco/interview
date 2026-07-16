# design-model — 闪卡

> 两维度定 IO 行为，Reactor/Actor/CSP/EventLoop 是模型，按状态耦合与 IO 密集组合选型。

## 记忆口诀

- **两维度**：同步异步=等不等结果 / 阻塞非阻塞=IO没就绪挂不挂线程；epoll=同步非阻塞，io_uring才是真异步
- **Actor vs CSP**：Actor知道给谁发（PID+私有mailbox） / CSP知道往哪发（channel一等对象、匿名）；Go在CSP上模拟Actor
- **Reactor三变体**：单线程(Redis) / 单Reactor多线程(不推荐) / 主从Reactor(Nginx·Netty生产首选)
- **选型三问**：状态耦合→Actor·单tick / IO密集→CSP·Reactor / 要背压→channel·request(n)；真实系统都是模型组合

## Card 1

**Q**: 「同步/异步」和「阻塞/非阻塞」是同一回事吗？为什么说 Linux 的 `epoll` 不是异步 IO？

**A**: 是两个正交维度：同步异步看调用方等不等结果，阻塞非阻塞看IO 未就绪时线程挂不挂。`epoll` 是同步非阻塞 + 就绪通知——read 还是自己做；真正把 syscall 交内核异步做的只有 io_uring、POSIX AIO。

## Card 2

**Q**: 为什么说 Go 是 CSP 而不是 Actor？请对比 Actor 与 CSP 的核心区别。

**A**: 核心是耦合方向：Actor 的 mailbox 属接收方、发送方要有 PID（知道给谁发）；CSP 的 channel 是独立一等对象、发送方只认 channel（知道往哪发）。Go 的 goroutine 无内建 mailbox/PID，`ch<-m` 面向 channel，故是 CSP；用 goroutine+专属 chan 模拟 Actor 是在 CSP 之上实现。

## Card 3

**Q**: Reactor 有哪三种变体？生产环境通常选哪种，为什么？

**A**: 单 Reactor 单线程（Redis 6 前，慢回调堵全进程）、单 Reactor 多线程（读写仍在 EL 线程，不推荐）、主从 Reactor（mainReactor 只 accept，多个 subReactor 各绑线程管连接整个 IO 生命周期）。生产选主从 Reactor——Nginx/Netty/Envoy 都是，几十万连接无压力。

## Card 4

**Q**: 为什么游戏后台用 Actor + 单 tick 循环，而不像互联网服务那样用协程池打 DB？

**A**: ①状态强耦合：玩家血量/背包是共享可变态，单 tick 天生串行免锁；②AOE 联动跨协程加锁=死锁温床；③确定性：同 seed 同输入同结果，靠它做录像回放/跨服校验，协程调度非确定；④瓶颈在 CPU（技能/寻路/AI）不是 IO，协程收益小。

## Card 5

**Q**: Actor 邮箱堆积和 CSP channel 泄漏分别怎么发生、怎么填坑？

**A**: 邮箱堆积：热点 actor 收 > 处理导致 OOM；填坑=有界邮箱（满则丢/降级/背压）+分片+优先队列。channel 泄漏：发送方崩溃后接收方在无缓冲 channel 上永等；填坑=配 `context` `select{case <-ch; case <-ctx.Done()}`，发送方唯一 close，接收方用 `v,ok:=<-ch` 检查。

# php-fpm-nginx — 闪卡

> Nginx 单线程事件驱动扛连接、fpm 多进程阻塞扛计算，负载相反所以模型相反。

## 记忆口诀

**Nginx**：单线程 / epoll / 非阻塞 / 扛连接

**php-fpm**：多进程 / 阻塞 / share-nothing / 扛计算

**解耦**：FastCGI / 进程常驻复用 / 打败 CGI 每请求 fork

**雪崩**：下游慢 / worker 秒满 / backlog 溢出 / 502

**防线**：terminate_timeout / slowlog / 下游超时 / 熔断

## Card 1

**Q**: 为什么 Nginx 用单线程事件驱动，而 php-fpm 用多进程阻塞？这两种相反的模型分别对应什么样的负载特征？

**A**: 连接层是 I/O 密集、连接多、每连接工作量小，epoll 让单线程管海量 fd、空闲连接几乎不占 CPU；计算层是 CPU 密集且 PHP 是同步阻塞代码，多进程一 worker 一请求换来天然隔离。负载特征相反，模型就该相反。

## Card 2

**Q**: 为什么一个第三方接口变慢（如支付超时 5s）会导致整站 502，而不只是慢？

**A**: fpm worker 是阻塞式，慢下游把每 worker 占用时间从 50ms 拉到 5s，吞吐掉 100 倍，有限的 `max_children` 秒满，新请求全堆到 `listen.backlog`，队列溢出即 502。防线：`request_terminate_timeout` + `slowlog` + 下游调用超时 + 熔断。

## Card 3

**Q**: `pm.max_children` 应该怎么定？设太大或太小分别有什么后果？

**A**: 按内存换算：(可用内存 − 系统预留) / 单进程平均内存。设太大：并发一高就 OOM，OOM Killer 随机杀进程更难排查；设太小：worker 不够、请求堆在 backlog 排队，表现为变慢直至 502。用 `pm.status_path` 看 `active processes` / `max children reached`。

## Card 4

**Q**: 对比 Swoole（协程化 PHP）与传统 php-fpm，各适合什么场景？为什么不能无脑用 Swoole 替代 fpm？

**A**: Swoole 常驻内存 + 协程，适合新写的高性能网关/长连接/WebSocket；但它打破 share-nothing——全局变量、连接跨请求共享残留，内存泄漏会累积 OOM，老框架/扩展假设"请求结束即销毁"会出问题。传统 CRUD 业务追求稳定和快速迭代，fpm 心智负担更低。二者是不同场景，非替代。

## Card 5

**Q**: FastCGI 相比传统 CGI 强在哪？为什么 fpm 不适合做长连接/推送？

**A**: CGI 每请求 fork 新进程加载解释器，开销巨大；FastCGI 让进程常驻复用（fpm worker 池），一次初始化多次服务。但 fpm 生命周期是请求-响应即结束、无连接保持概念，长轮询/SSE/WebSocket 会长期占住 worker 使 `max_children` 耗尽，应交给 Swoole/Node/Go 等常驻事件驱动服务。

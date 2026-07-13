## ADDED Requirements

### Requirement: 互联网/智能硬件后台域专题目录

`docs/internet/` 域 MUST 至少涵盖以下专题，每个专题 MUST 满足其"必含知识点"清单作为内容验收门槛，并以五段式（场景问题/实现方案/为什么这么做/为什么别的选择不行/沉淀结论）组织。

#### Scenario: 域内专题齐备

- **WHEN** 检查 `docs/internet/` 目录
- **THEN** 至少存在以下专题：`php-fpm-nginx`（多进程异步 I/O）、`iot-mqtt`（IoT 私有协议与 MQTT）、`frontend-engineering`（Gulp/Webpack/SPA/白鹭引擎）、`elixir-fp`（函数式）、`dns-attack-tunnel`（DNS 攻防与隧道）、`dns-clean-intercept`（DNS 清洗拦截与 CoreDNS）、`lvs-epoll`（LVS 与 epoll）、`sliding-window`（TCP/HTTP 滑动窗口）

### Requirement: php-fpm-nginx 专题内容完整

`php-fpm-nginx` 专题 MUST 覆盖 php-fpm + Nginx 的多进程异步 I/O 模型。

#### Scenario: php-fpm-nginx 必含项

- **WHEN** 打开 php-fpm-nginx 专题
- **THEN** 内容至少包含：Nginx 事件驱动（master-worker + epoll 单线程非阻塞）与 php-fpm 多进程阻塞式 worker 的分工、FastCGI 协议与进程池（pm static/dynamic/ondemand、`pm.max_children` 与内存换算、请求队列 `listen.backlog`）、为什么 PHP 用多进程而非协程（无共享内存的 share-nothing 模型、每请求独立生命周期）、慢请求打满 worker 的雪崩与 `request_terminate_timeout`/`slowlog` 排查、opcode 缓存（OPcache）、与协程化 PHP（Swoole）对比及为什么传统 CGI 模型不适合长连接/推送

### Requirement: iot-mqtt 专题内容完整

`iot-mqtt` 专题 MUST 覆盖智能硬件私有协议设计与 MQTT。

#### Scenario: iot-mqtt 必含项

- **WHEN** 打开 iot-mqtt 专题
- **THEN** 内容至少包含：私有二进制协议设计（定长头 + TLV/变长体、魔数、版本、序列号、校验、字节序）与为什么不用 JSON/HTTP（带宽、功耗、解析成本）、MQTT 核心（发布/订阅、Broker、Topic 通配 `+`/`#`、QoS 0/1/2 语义与重复投递、保留消息、遗嘱 LWT、Keepalive 与 PINGREQ、Clean Session 与会话持久化）、为什么 MQTT 适合弱网低功耗设备而 HTTP 轮询/CoAP 各自的取舍、海量设备长连接的连接保持与心跳压测、鉴权（一机一密/一型一密）与 TLS

### Requirement: frontend-engineering 专题内容完整

`frontend-engineering` 专题 MUST 覆盖前端工程化与 Web 游戏引擎。

#### Scenario: frontend-engineering 必含项

- **WHEN** 打开 frontend-engineering 专题
- **THEN** 内容至少包含：Gulp（基于流的任务运行器）与 Webpack（基于依赖图的打包器）本质差异与为什么后者取代前者做模块打包、Webpack 核心（entry/output/loader/plugin、Tree Shaking、Code Splitting、HMR、hash 命名与长缓存）、SPA 原理（前端路由 history/hash、首屏与 SSR/预渲染取舍）、白鹭引擎（Egret）等 Web 游戏引擎的渲染循环（Canvas/WebGL、tick/RAF、资源加载与纹理合图）、为什么 H5 小游戏选专用引擎而非直接 DOM

### Requirement: elixir-fp 专题内容完整

`elixir-fp` 专题 MUST 覆盖 Elixir/函数式与 BEAM 并发模型。

#### Scenario: elixir-fp 必含项

- **WHEN** 打开 elixir-fp 专题
- **THEN** 内容至少包含：不可变数据与无副作用、模式匹配与递归替代循环、Elixir 运行在 BEAM（Erlang VM）上的轻量进程与 Actor 模型、OTP（GenServer/Supervisor/监督树、let-it-crash 哲学）、进程间消息传递与无共享、为什么函数式 + Actor 适合高并发软实时（电信级容错）而不适合计算密集/需要可变大数组的场景、与 Go/Java 线程模型对比

### Requirement: dns-attack-tunnel 专题内容完整

`dns-attack-tunnel` 专题 MUST 覆盖 DNS 相关网络攻防与 DNS 隧道原理（用于防御与检测视角）。

#### Scenario: dns-attack-tunnel 必含项

- **WHEN** 打开 dns-attack-tunnel 专题
- **THEN** 内容至少包含：DNS 报文结构与解析链路（递归/迭代、根/TLD/权威）、常见攻击面（DNS 缓存投毒/Kaminsky、DDoS 反射放大、随机子域水刷/NXDOMAIN 攻击、域前置）、DNS 隧道原理（把数据编码进子域名/TXT 记录经权威服务器外带，iodine/dnscat2 类工具的编码与分片）、为什么 DNS 隧道能穿透多数防火墙（53 端口常放行）、检测特征（异常长子域、高频 TXT/NULL 查询、单域高熵、查询频率与响应大小异常）与防御（RPZ、限速、深度包检测）

### Requirement: dns-clean-intercept 专题内容完整

`dns-clean-intercept` 专题 MUST 覆盖 DNS 清洗/拦截与内核态实现及 CoreDNS。

#### Scenario: dns-clean-intercept 必含项

- **WHEN** 打开 dns-clean-intercept 专题
- **THEN** 内容至少包含：DNS 拦截层次（应用层解析器 / CoreDNS 插件链 / 内核态 XDP-eBPF/netfilter 钩子）、内核态拦截为什么快（绕过用户态拷贝、XDP 在网卡驱动早期丢包/改写）与其实现要点、CoreDNS 架构（插件链 Corefile、forward/cache/hosts/rewrite/template/acl 插件、作为 K8s 集群 DNS 承接 Service 解析）、清洗策略（黑白名单、RPZ、污染检测与纠正）、为什么用 CoreDNS 取代 kube-dns/dnsmasq（插件化、Go 生态、可观测）

### Requirement: lvs-epoll 专题内容完整

`lvs-epoll` 专题 MUST 覆盖 LVS 四层负载与 epoll 事件模型。

#### Scenario: lvs-epoll 必含项

- **WHEN** 打开 lvs-epoll 专题
- **THEN** 内容至少包含：LVS 三种转发模式（NAT/DR/TUN）原理与 DR 为什么性能最高（响应直接回客户端、只改 MAC）、调度算法（rr/wrr/lc/wlc/sh）、LVS 工作在内核 IPVS 与为什么四层比七层快、Keepalived + LVS 高可用（VRRP）、epoll 原理（红黑树 + 就绪链表、`epoll_ctl`/`epoll_wait`、LT vs ET、惊群与 `EPOLLEXCLUSIVE`）、为什么 epoll 优于 select/poll（O(1) 就绪通知、无需每次全量拷贝 fd 集）、LVS 与七层网关（Nginx）的分层配合

### Requirement: sliding-window 专题内容完整

`sliding-window` 专题 MUST 覆盖 TCP 流量控制滑动窗口与 HTTP 层的流控。

#### Scenario: sliding-window 必含项

- **WHEN** 打开 sliding-window 专题
- **THEN** 内容至少包含：TCP 滑动窗口（发送/接收窗口、`rwnd` 通告、窗口滑动与确认、零窗口与窗口探测、糊涂窗口综合征与 Nagle/Delayed ACK）、拥塞窗口 `cwnd` 与滑动窗口的区别与共同约束发送速率、HTTP/1.1 队头阻塞与 HTTP/2 的流控（`WINDOW_UPDATE`、连接级与流级窗口、多路复用）与 HTTP/3 QUIC 的流控、为什么应用层还要限流（TCP 窗口只保护链路不保护后端）

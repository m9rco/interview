# ebpf — 闪卡

> eBPF=内核态安全沙箱，不改内核就能拿到内核态的性能与可见性。

## 记忆口诀

**四要素**：verifier不崩 / JIT够快 / Map通用户态 / 动态加载不重启
**挂载点**：网络XDP·tc / 追踪kprobe·uprobe·tracepoint / 安全LSM
**替iptables**：O(1)map查表 / vs O(N)规则链 / 增量原子更新
**防SYN Flood**：越早拦越省 / 驱动层拦纯SYN / 令牌桶per-IP限速 / SYN Cookie抗伪造

## Card 1

**Q**: eBPF 靠哪几个机制做到"在内核里跑用户代码却不会崩内核"？

**A**: 核心是 verifier：加载前静态校验无越界访问、无未初始化寄存器、分支可终止、指令数有上限，不过则拒绝加载。再配 JIT 编译到本机码保证速度、Map 通用户态、动态加载免重启。verifier 是不崩的根本保证。

## Card 2

**Q**: 为什么 Cilium 用 eBPF 能替掉 kube-proxy 的 iptables？两者查 Service 的复杂度差在哪？

**A**: iptables 的 KUBE-SERVICES 是线性规则链，查 Service 是 O(N)，规则更新要全量重刷、慢且有窗口。eBPF 用 hash map 查表做到 O(1)，更新只改一个 map entry（增量、原子）。Service 数上千时线性链是硬伤，这是替换的技术根因。

## Card 3

**Q**: 为什么防 SYN Flood 要用 XDP，而不是内核 SYN Cookie 或用户态防火墙？

**A**: 位置决定成本，越早拦越省。XDP 挂在网卡驱动最前端，恶意 SYN 在此 `XDP_DROP`，服务端连半连接状态都不分配、包都不进协议栈。用户态才丢则协议栈+半连接槽开销已付出；SYN Cookie 虽不占队列但仍要为每个 SYN 计算并回包。

## Card 4

**Q**: XDP 令牌桶限速在代码里为什么用定点数（×SCALE）而不用浮点？IP 头解引用前为什么必须做边界检查？

**A**: verifier 不允许浮点运算，所以用 `×SCALE` 的定点数表示令牌。IP 头长度可变（`ihl` 以 4 字节为单位），且 verifier 要求每次解引用前显式做边界检查（`(void*)(hdr+1) > data_end`），否则可能越界读、校验直接拒绝加载。

## Card 5

**Q**: eBPF 落地最大的阻力是什么？上线前要核对什么？

**A**: 最大阻力是内核版本依赖。XDP、BTF/CO-RE、`bpf_loop`、ringbuf 等特性各有最低内核版本要求，不满足则 attach 失败或降级。上线前须核对目标节点内核版本与所需特性矩阵，老旧内核（如 3.x）基本无法用 eBPF 数据面。另有 verifier 约束：栈仅 512B、大状态须放 Map。

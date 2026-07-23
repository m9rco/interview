---
title: 游戏基础架构与工具
---

# 游戏基础架构与工具（6 年）

这一域覆盖游戏局外后台的基础架构、网络、有状态服务、算法与工具，共 18 个专题：

**接入与通信**
- [接入网关（长连接接入层）](/game-infra/access-gateway.md) · [消息总线（共享内存 IPC）](/game-infra/message-bus.md)

**网络与服务网格**
- [CNI 与 K8s 网络插件](/game-infra/cni-plugins.md) · [Istio 与 Cilium 服务网格](/game-infra/mesh-istio-cilium.md) · [中心化 vs 去中心化](/game-infra/mesh-central-vs-decentral.md) · [eBPF](/game-infra/ebpf.md)

**有状态服务**
- [分布式游戏存储（分布式 KV）](/game-infra/distributed-kv.md) · [数据迁移](/game-infra/stateful-migration.md) · [数据恢复](/game-infra/stateful-recovery.md) · [配置热刷新](/game-infra/config-hot-reload.md)

**算法与协程**
- [一致性哈希四算法](/game-infra/consistent-hash-impl.md) · [蓄水池抽样](/game-infra/reservoir-sampling.md) · [C++ 协程](/game-infra/cpp-coroutine.md) · [Raft 与 Gossip](/game-infra/raft-gossip.md)

**流量与承载**
- [秒杀承载](/game-infra/seckill.md) · [令牌桶与漏桶](/game-infra/token-leaky-bucket.md) · [限流与熔断](/game-infra/ratelimit-circuitbreak.md)

**编译**
- [编译优化与 LLVM/Clang/GCC](/game-infra/llvm-compile.md)

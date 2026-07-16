# mesh-istio-cilium — 闪卡

> Istio 靠 Envoy sidecar 治理最全，Cilium 靠 eBPF 内核态省掉横跳，成熟 vs 性能之争。

## 记忆口诀

**Istio**：Envoy sidecar / istiod 控制面 / xDS 下发 / 功能全但横跳
**Cilium**：eBPF 无 sidecar / 内核态直转 / Hubble 可观测 / 省资源但依赖内核
**取舍**：成熟通用治理 vs 内核态高性能

**相关专题**：[eBPF 原理与落地](/game-infra/ebpf.md) · [CNI 与 K8s 网络插件](/game-infra/cni-plugins.md) · [中心化 vs 去中心化网格](/game-infra/mesh-central-vs-decentral.md) · [自研 Mesh × K8s](/game-infra/self-mesh-k8s.md)

## Card 1

**Q**: Istio 是怎么在业务代码零改动的前提下，把所有进出流量劫持到 Envoy sidecar 的？

**A**: 由 init 容器 `istio-init` 写入 iptables 规则，把 Pod 的入/出流量重定向到 Envoy 端口。业务进程收发的是明文，网络上跑的是 sidecar 间的 mTLS，全程无感知。

## Card 2

**Q**: istiod 是怎么把用户写的路由/策略配置生效到成百上千个 sidecar 上的？

**A**: istiod 把 VirtualService/DestinationRule 等 CRD 翻译成 Envoy 配置，通过 xDS 协议（LDS/RDS/CDS/EDS）动态下发给所有 sidecar，无需重启，实现路由/灰度/重试的集中控制。

## Card 3

**Q**: 同样做服务网格，Istio sidecar 和 Cilium eBPF 在延迟与资源上的核心差异是什么？

**A**: sidecar 一次 A→B 调用要经 App A→Envoy A→Envoy B→App B，多两跳用户态代理 + 每 Pod 一份 Envoy 内存。eBPF 在内核态就地转发，不上送用户态，每节点一份 agent，延迟更低、更省资源。

## Card 4

**Q**: 既然 eBPF sidecarless 又快又省，为什么 Istio 仍被大量采用？

**A**: Envoy L7 能力极其成熟、复杂协议支持全，且是用户态、弱内核依赖。eBPF 强依赖较新内核版本、L7 能力仍在补齐，内核态调试门槛高。选型是"成熟通用治理 vs 内核态高性能"的权衡。

## Card 5

**Q**: 游戏里的帧内多跳低延迟通信，能直接套用 Istio/Cilium 这类 Mesh 吗？

**A**: 不合适。通用 Mesh 面向微服务东西向治理/可观测，非为游戏帧内同机高频通信设计。同机高频应走消息总线共享内存，自研游戏网格更倾向去中心化 + 降连接数，Mesh 不替代 IPC。

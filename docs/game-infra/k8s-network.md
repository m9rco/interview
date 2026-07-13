---
title: K8s 异构 & 网络插件
---

# K8s 异构 & 网络插件

异构混部 · CNI 三大流派 · 从 Overlay 到 hostNetwork

## 场景问题

### 异构混部：一群"不一样"的机器混在一起

- **CPU 异构**：x86 (Intel/AMD) + ARM (鲲鹏/飞腾/Graviton) + 国产化（龙芯/申威）
- **加速器异构**：GPU (A100/H100/T4) + NPU (Ascend) + FPGA + DPU
- **调度目标**：让 Pod 落到匹配的节点，避免 x86 镜像跑到 ARM 节点上崩
- **典型场景**：训练用 GPU 节点池，推理用 CPU 节点池，前端 Web 用普通节点池；游戏 DS 战斗集群一机一 Pod（本项目就是）

### 异构调度的四把刀

- **Node Label**：`kubectl label node n1 node_type=ds arch=arm64 gpu=a100`
- **NodeSelector**：Pod 声明 `nodeSelector: {node_type: ds}`——**硬约束**
- **Taint / Toleration**：节点打 taint `gpu=true:NoSchedule`，Pod 显式容忍才能调度上——防止普通 Pod 抢 GPU 节点
- **Affinity / AntiAffinity**：
  - `nodeAffinity`：软/硬亲和 (更强表达力)
  - `podAntiAffinity`：DS 战斗进程用 `topologyKey: kubernetes.io/hostname` 强制**一机一 Pod**
- **多 Runtime**：`containerd`（默认）+ `kata-containers`（虚拟化隔离）+ `runc`；通过 `RuntimeClass` 让 Pod 选运行时

## 实现方案

### 异构落地清单

- 每类节点打 label（`arch=`, `gpu=`, `node_type=`）
- 每个工作负载**明确 nodeSelector/Affinity**，别赖默认调度器
- 关键机器加 taint 防止普通 Pod 抢占
- 多架构镜像用 **Docker Manifest / `docker buildx`** 构建 arm64+amd64 双平台，Pull 时自动匹配
- 通过 `topologySpreadConstraints` 打散跨可用区/机架

### CNI 选型决策

- **中小集群、快速起步** → Flannel VXLAN
- **需要 NetworkPolicy、跨机房** → Calico BGP（BGP 通）或 IPIP（BGP 不通）
- **大集群、性能极致、L7 策略** → Cilium (eBPF)
- **游戏后台、跨集群直连需求** → **hostNetwork DaemonSet**（本项目）+ 一层业务级 Mesh 做路由

### Sidecar 精简与 XDS 下发爆炸的应对

- **Sidecar CR** 声明依赖：只下发本 Pod 真正调用的服务，**避免全量**
- **命名空间级隔离**：`Sidecar.workloadSelector` + `egress.hosts`
- **eBPF Cilium**：完全去 Sidecar，控制面成本降到近零
- **DPU 卸载**：把 Envoy 或 eBPF 数据面卸载到 SmartNIC/DPU（未来趋势）

### 本项目具体落地

- `hostNetwork: true` DaemonSet，宿主机 `0.0.0.0:8000`
- 业务 Pod 通过 Downward API 注入 `HOST_IP`，参数 `--mesh=$HOST_IP:8000`
- 跨集群：南京 / 上海各一份 kubeconfig，xmeshpanel 读多集群 `Nodes().List()` 组网
- 接入层：BCS 直连 CLB（`isDirectConnect: true`），按运营商 `-dx/-yd/-wt` 拆 CLB

## 为什么这么做

### K8s 网络四大原则

1. 每个 Pod 都有**独立 IP**（Pod IP 平面）
2. Pod 与 Pod 之间**直接互通**，无需 NAT
3. 节点上的 Agent（kubelet/kube-proxy）能与本节点所有 Pod 通信
4. Pod 看到的自己 IP == 别的 Pod 看到的它的 IP（**IP 一致性**）

### Service / kube-proxy 的三种模式

- **userspace（远古）**：kube-proxy 自己转发，慢，已废弃
- **iptables（默认）**：为每个 Service 生成 iptables 规则；**规则数 O(N)**，服务 5000+ 时 iptables 规则匹配 O(N) 变慢，容易触发内核卡顿
- **ipvs（推荐大集群）**：内核态 hash 表，**O(1) 查找**；支持更多算法 (rr/lc/dh/sh)；同时支持 SNAT/DNAT
- **eBPF (Cilium kube-proxy replacement)**：**完全绕过 kube-proxy**，Service 转发做进 eBPF map；集群 5000+ Service 时优势明显

### Ingress vs Gateway API

- **Ingress**：K8s 早期方案，抽象度低（只 host/path），能力靠 `annotations` 各家自定义 → **不可移植**
- **Gateway API**（新一代）：三层资源模型 `GatewayClass` / `Gateway` / `HTTPRoute|TCPRoute|GRPCRoute`，**类型安全、跨实现可移植**
- 生产落地：Nginx-Ingress、APISIX、Envoy Gateway、Cilium Gateway、腾讯 BCS 直连 Ingress（`networkextension.bkbcs.tencent.com`）

### Service Mesh：数据面演进

- **Sidecar (Istio + Envoy)**：每 Pod 一个 Envoy——**协议栈反复横跳** + **XDS 全量下发**（500 服务 × 10 Pod = 每 Envoy 5000 实例）
- **Node-level (Cilium Service Mesh / Ambient Istio)**：一节点一代理，**去 Sidecar**，共享数据面
- **eBPF 干掉反复横跳**：Cilium eBPF 数据面**内核态直连**，绕过用户态 socket 拷贝

## 为什么别的选择不行

### CNI 三大流派原理对比

| 插件 | 数据面原理 | 控制面 | 优点 | 缺点 |
| --- | --- | --- | --- | --- |
| **Flannel (VXLAN)** | Overlay：Pod 报文封装成 UDP，节点间走 VXLAN 隧道 (VNI) | 简单，etcd 存 subnet 划分 | **极简**，装完就能跑；跨节点无需路由配合 | **双封装**性能损耗 ~10-15%；不支持 NetworkPolicy |
| **Calico (BGP)** | BGP 直路：节点间用 BGP 广告 Pod CIDR，走宿主机路由表**不封装** | BGP RR (Route Reflector) + Felix Agent | **性能接近裸金属**；支持 NetworkPolicy；跨机房友好 | 需要网络设备支持 BGP 或用 IPIP 模式回退 |
| **Calico (IPIP)** | 轻量隧道：IP-in-IP 单封装 | 同上 | BGP 不通时的兜底 | 仍有一层封装 |
| **Cilium (eBPF)** | **内核 eBPF 数据面**：绕过 iptables/kube-proxy，直接在 socket/tc 层转发 | 基于 eBPF map，控制面 daemon | **性能最强、可观测最强**；L7 策略、mTLS 都能做 | 内核版本要求 (≥4.19 强推荐≥5.10)；学习曲线陡 |

### 生产踩坑清单

- **VXLAN 上 MTU 未减 50 字节**：包分片导致跨节点 gRPC 超时 → 显式设置 `mtu: 1450`
- **iptables 规则过万导致 kube-proxy sync 分钟级**：Service 5000+ → 切 ipvs 或 eBPF
- **NodeLocal DNSCache 未启**：CoreDNS 打爆 → 每节点部署 DNSCache Pod
- **CNI IP 池耗尽**：Pod 疯狂重启回收 IP 慢 → 加大子网 / 用 Calico IPPool 分层
- **NetworkPolicy 与 Ingress Controller 冲突**：Ingress 拦截被 NetworkPolicy 阻掉 → **命名空间级白名单** + 显式放行 `ingress-nginx`
- **Cilium 升级踩内核 bug**：eBPF map 冲突 → 升前灰度节点，滚动升级

### Overlay 依赖 vs 主机网络直连（本项目实战对比）

**Overlay 依赖（业界主流）**：
- 跨集群靠 Submariner / Skupper / KubeVirt-CNI 之类构建二层
- 好处是抽象干净；坏处是**多一层封装 + 依赖 K8s 网络组件稳定性**

**主机网络直连（自研 Mesh 采用）**：
- `hostNetwork: true` 的 DaemonSet；跨集群走公司内网直接连宿主机 IP
- **规避 K8s 网络组件频繁异常**（Sidecar 时代真实痛点）
- 缺点：占用宿主机端口；调度需要 `hostPort` 冲突检测

## 沉淀结论

- **异构混部**靠 label + nodeSelector/affinity + taint + 多架构镜像四把刀落地，别赖默认调度器。
- **CNI 选型**按规模走：小集群 Flannel VXLAN 图省事；要 NetworkPolicy/跨机房上 Calico BGP（不通回退 IPIP）；大集群、L7、极致性能上 Cilium eBPF。
- **Service 转发**大集群务必从 iptables O(N) 切到 ipvs O(1) 或 eBPF，否则 5000+ Service 时 kube-proxy sync 分钟级。
- **游戏后台**的结论是跳出 Overlay：`hostNetwork` DaemonSet + 业务级 Mesh 做路由，用宿主机 IP 直连规避 K8s 网络组件频繁异常，代价是占端口、需 `hostPort` 冲突检测。

## 内容来源

迁移自 guide/theme-k8s-network（综合整理）

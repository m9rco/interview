# cni-plugins — 闪卡

> CNI 用可执行+JSON 极简契约把组网外包给插件，游戏低延迟诉求把选型推向 BGP/eBPF。

## 记忆口诀

- **CNI 契约**：可执行文件 / stdin JSON 入 / stdout JSON 出 / `ADD·DEL·CHECK`
- **三流派**：Flannel=VXLAN overlay / Calico=BGP underlay 路由 / Cilium=eBPF 内核态
- **Overlay vs Underlay**：通用性换性能 / 封包税 + MTU 缩水 / 能三层路由就别付税
- **游戏诉求**：低延迟 / 一机一 Pod / Multus 多网卡 → 推向 BGP·eBPF

## Card 1

**Q**: K8s 为什么不内置一种网络实现，而要把组网外包给 CNI？CNI 的契约到底约定了什么？

**A**: 网络环境千差万别（VPC/裸金属/跨区），内置死一种会限制所有人。CNI 只约定极简契约：一个可执行文件，kubelet 传 `CNI_COMMAND=ADD/DEL/CHECK` + netns + stdin JSON，插件回 stdout JSON，组网自由实现，IPAM 是其子职责。

## Card 2

**Q**: Flannel(VXLAN) 与 Calico(BGP) 的数据面原理差在哪？为什么低延迟战斗集群更偏向后者？

**A**: Flannel 把二层帧封进 UDP/VXLAN 隧道（overlay），每包付封包 CPU + MTU 缩水 50 字节税。Calico 每节点跑 BGP 宣告 Pod 路由，原生三层直达无封包。战斗流量对延迟敏感，省掉 overlay 税更划算。

## Card 3

**Q**: 为什么在公有云上 Calico 常被迫回退 IPIP？这带来什么代价？

**A**: 公有云 VPC 常禁止自定义路由/BGP 宣告，Pod 网段路由无法被底层接受，Calico 只能用 IPIP 封装跨子网兜底——又变相成了 overlay，重新付封包税，失去纯路由的性能优势。

## Card 4

**Q**: CNI chaining 与 Multus 各解决什么问题？游戏场景怎么用？

**A**: chaining：主插件组网后串接链式插件（`portmap` 端口映射、`bandwidth` 限速、`tuning`）。Multus：给一个 Pod 挂多张网卡。游戏"一机一 Pod + 业务/管理网分离"，如 `eth0` 走 overlay、`net1` 直连 SR-IOV/underlay 承载玩家流量。

## Card 5

**Q**: Cilium 相比 Calico 的核心差异是什么？各自的前提约束？

**A**: Cilium 用 eBPF 在内核态挂载点转发并执行 L3-L7 策略，可替代 kube-proxy、O(1) 策略、可观测强，但需较新内核。Calico 靠 BGP 三层路由，成熟稳定，但依赖底层网络允许 BGP。

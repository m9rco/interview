# release-strategy — 闪卡

> **Canary（金丝雀）= 按流量比例逐步放量**、**BlueGreen（蓝绿）= 双环境瞬时切换**、**A-B = 按用户特征分流做业务实验**、**Shadow（影子）= 复制流量不返回**。四种模型正交组合，落地靠 `Deployment` + Service Mesh / Ingress 权重 + Argo Rollouts / Flagger 自动化。

## 记忆口诀

**六策略**：Recreate杀了再拉 / RollingUpdate逐批换 / BlueGreen双环境切 / Canary比例放量 / A-B按特征 / Shadow复制不返回
**Canary三层**：副本比例（土）/ Ingress annotation（中）/ Mesh+Argo Rollouts（生产）
**四道验收**：健康检查 / 烟雾测试 / 黄金SLI（成功率·P99·饱和度·错误码）/ 业务指标
**防 502**：preStop sleep / 优雅退出drain / terminationGracePeriodSeconds

## Card 1

**Q**: BlueGreen（蓝绿）和 Canary（金丝雀）有什么本质区别？各自的杀手场景是什么？

**A**: 蓝绿=两套完整环境，Service selector 瞬时切换，回滚极快但两倍资源，适合协议大跨度、要秒级回滚。Canary=按流量比例逐步放量（1→5→25→100），配指标自动验收，资源省、粒度细，是生产标配。蓝绿"要么全旧要么全新"，Canary"新旧混跑逐步过渡"。

## Card 2

**Q**: Canary 一步步放量时，凭什么决定"继续放量"还是"自动回滚"？

**A**: 靠自动化指标验收（Argo Rollouts `AnalysisTemplate` / Flagger）。看黄金 SLI：成功率 / 延迟 P99 / 饱和度 / 错误码分布，任一劣化即回滚。关键要用对照组基线而非绝对阈值——新版只要不比 stable 差就通过，避免"老版本本就有毛刺"的假阳性。

## Card 3

**Q**: 为什么 Pod 收到 SIGTERM 后会出现 502？怎么根治？

**A**: 因为 SIGTERM 与 Endpoints 摘除是并发的，K8s 只保证最终一致，不保证"先摘再杀"——kube-proxy 还没同步 iptables，请求就打到已死 Pod。填坑：preStop sleep 15s 等 Endpoints 传播 + 业务优雅退出（先停 accept、处理完 in-flight）+ `terminationGracePeriodSeconds` 大于 drain 时间。

## Card 4

**Q**: Shadow（影子流量）能验证什么？有什么绝对不能碰的坑？

**A**: 复制真实流量到新版但丢弃响应，用于性能压测、协议兼容 Diff、数据兼容验证。坑：新版若有副作用（写 DB、发短信、扣费）会双写双发双扣！所以 Shadow 只能用于纯查询链路，或用 Sandbox DB 隔离。且响应被丢导致请求排队少，打不满容量，不能替代压测。

## Card 5

**Q**: 游戏后台为什么不能直接套 Ingress 权重灰度？它怎么做？

**A**: 因为玩家会话强状态、重连必须落原服，随机比例分流会导致重连不一致。做法：按大区/服务器分批（测试区→休闲区→全量，每级观察 24h+）、按 UID 白名单（`uid%100<5` 且持久化在玩家档案）、Feature Flag 百分比放量（不换镜像）、DS 战斗服preStop 等玩家全退再 SIGTERM。

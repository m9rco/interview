## 1. VuePress 工程初始化

- [x] 1.1 初始化 `package.json`，固定 VuePress 2 及插件版本（本地搜索、Mermaid、代码高亮/行高亮），添加 `dev`/`build` 脚本
- [x] 1.2 创建 `docs/.vuepress/config.*`：站点标题、语言 zh-CN、暗色主题、`base` 由 `DEPLOY_TARGET` 环境变量切换（pages 子路径 / cos 根路径）
- [x] 1.3 建立分域目录骨架 `docs/intro/`、`docs/internet/`、`docs/game-infra/`、`docs/game-biz/` 与首页 `docs/README.md`
- [x] 1.4 配置顶部导航（四大区）与按域自动/约定生成的多级侧边栏
- [x] 1.5 接入本地全文搜索、Mermaid 渲染、代码块语法高亮与行高亮，`vuepress dev` 本地验证四项都生效
- [x] 1.6 定义并落地"五段式 + 内容来源页脚"的专题 Markdown 模板（含 Mermaid/代码占位）

## 2. 迁移现有 13 专题（内容无损）

- [x] 2.1 从 `guide/_themes.js` / `theme-*.html` 抽取 13 专题原文，逐一映射到目标域目录
- [x] 2.2 迁移 `intro`、`business-proxy`、`nzmesh-k8s` 到对应域，四段式内容并入五段式，保留桌面 md 来源标注
- [x] 2.3 迁移 `rate-limit`、`redis`、`k8s-network`、`agent-dev` 到对应域，套五段式
- [x] 2.4 迁移 `concurrency`、`tcp-net`、`gc-stw`、`algo-ds`、`design-model`、`release-strategy`，套五段式
- [x] 2.5 逐条核对迁移无内容丢失（对照 `interview-topic-catalog` 各专题必含项），每页页脚标注"迁移自 guide/theme-<slug>"

## 3. 互联网/智能硬件后台域内容（internet-backend-catalog）

- [x] 3.1 `php-fpm-nginx`：多进程异步 I/O 模型 + FastCGI 进程池，含 worker 雪崩排查，配架构图
- [x] 3.2 `iot-mqtt`：私有二进制协议设计 + MQTT QoS/LWT/Keepalive，含协议帧图与代码
- [x] 3.3 `frontend-engineering`：Gulp vs Webpack、SPA、白鹭引擎渲染循环
- [x] 3.4 `elixir-fp`：不可变/模式匹配 + BEAM Actor + OTP 监督树
- [x] 3.5 `dns-attack-tunnel`：DNS 攻击面 + 隧道原理与检测特征（防御视角），配数据外带流程图
- [x] 3.6 `dns-clean-intercept`：清洗拦截层次 + 内核态 eBPF/XDP + CoreDNS 插件链
- [x] 3.7 `lvs-epoll`：LVS 三模式（DR 为何最快）+ epoll 原理与 LT/ET，配转发路径图
- [x] 3.8 `sliding-window`：TCP 滑动窗口 vs 拥塞窗口 + HTTP/2 流控，配窗口滑动图

## 4. 游戏基础架构域内容（game-infra-catalog）

- [x] 4.1 `tconnd`、`tbus`：接入层与共享内存总线，配连接/寻址图
- [x] 4.2 `cni-plugins`、`mesh-istio-cilium`、`mesh-central-vs-decentral`：CNI 三流派 + 网格数据面 + 中心化 vs 去中心化对比
- [x] 4.3 `stateful-migration`、`stateful-recovery`：有状态迁移与恢复流程，配快照+增量回放时序图
- [x] 4.4 `ebpf`：原理 + 挂载点 + 替代 iptables，配挂载点图
- [x] 4.5 `consistent-hash-impl`：RingHash/Maglev/JumpHash 三算法权衡表 + 可运行代码
- [x] 4.6 `reservoir-sampling`：算法 + 概率证明 + 可运行代码
- [x] 4.7 `cpp-coroutine`：有栈/无栈 vs C++20 函数染色，含 libco 与协程切换代码
- [x] 4.8 `seckill`：瓶颈定位 + 分层削峰 + Redis+Lua 原子扣减代码 + 流程图
- [x] 4.9 `config-hot-reload`：双 buffer 原子切换热刷，配切换图
- [x] 4.10 `token-leaky-bucket`：令牌桶 vs 漏桶 + 可运行代码
- [x] 4.11 `raft-gossip`：Raft 选举/复制 + Gossip 传播，含伪码与收敛图
- [x] 4.12 `llvm-compile`：编译三段式 + LLVM IR/工具链 + Clang vs GCC 历史
- [x] 4.13 `ratelimit-circuitbreak`：限流分层 + 熔断状态机 + 互联网 vs 游戏差异，配熔断状态图

## 5. 游戏业务域内容（game-business-catalog）

- [x] 5.1 `activity-framework`：模板/实例 + 条件-进度-奖励抽象 + 扩展点，配活动状态机图与接口代码
- [x] 5.2 `idempotency-design`：幂等键 + 去重/CAS/状态机方案，配流程图与代码
- [x] 5.3 `redis-room-recommend`：ZSet 分值融合 + 实时更新 + 分页，含 Redis 命令与代码
- [x] 5.4 `game-vs-internet`：状态/并发/计算/容错/扩缩容/发布多维对比，配对比表

## 6. 发布流水线（static-publish-pipeline）

- [x] 6.1 编写本地脚本 `scripts/deploy-cos.sh`：`vuepress build`（cos 目标）→ 产物校验 → `coscmd`/`ossutil` 同步，密钥从环境变量读
- [x] 6.2 实现 COS 同步顺序（先传 hash 静态资源、最后覆盖入口 HTML）与缓存头（HTML 短缓存 / 资源长缓存）
- [x] 6.3 更新 `.gitignore` 排除 `.env`、`.cos.conf` 等本机凭据；确认仓库与历史无明文密钥
- [x] 6.4 编写 `.github/workflows/deploy.yml`：push main → build → 发 GitHub Pages（pages 目标 base）→ 同步 COS（cos 目标 base），凭据走 GitHub Secrets
- [ ] 6.5 本地脚本发一次 COS 验证 `base`/缓存/顺序正确、页面无 404；再验证 CI 双发布 —— **待用户执行**：需 COS 密钥（`.cos.conf`/Secrets）与 push 到 main 触发 CI；本地已用静态服务器验证 `base=/interview/` 下首页/专题/CSS/mermaid chunk 均 HTTP 200

## 7. 收尾与验证

- [x] 7.1 停止维护旧 `guide/`（保留 git 历史），更新根 `README` 指向新站点与发布方式
- [x] 7.2 全站 `vuepress build` 通过，本地静态服务器验证导航/侧边栏/搜索/Mermaid/暗色/代码高亮全部正常
- [x] 7.3 逐项核对三大域 catalog 与 topic-catalog 的"必含项"验收清单，重点专题确有代码 + Mermaid 图
- [ ] 7.4 `openspec validate vuepress-experience-archive` 通过，确认 Pages 与 COS 两个线上地址均可访问 —— spec 校验通过、本地可访问性已验证；**线上地址可访问待用户 push/开启 Pages 后确认**

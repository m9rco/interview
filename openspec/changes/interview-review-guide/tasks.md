## 1. 骨架与共用资产

- [x] 1.1 在仓库根新建 `guide/` 目录（与 `openspec/` 平级），确认无冲突文件。
- [x] 1.2 编写 `guide/template.html` 骨架：含 `<meta charset="utf-8">`、`__TITLE__` / `__THEME_JSON__` / `__CSS__` / `__JS__` 四个占位符，并在浏览器中打开验证空模板不报错。
- [x] 1.3 编写共用 CSS（暗色系 + 荧光青/紫、亮色可切换、系统字体栈、代码块样式、响应式 3 档断点、`@media print` 打印规则），先内联到 `template.html`。
- [x] 1.4 编写共用 JS（THEMES 数据结构定义、`renderTheme()` 分派器、`kv/quote/md/table/code/callout` 六种章节渲染函数、轻量 Markdown 30 行渲染器、`hashchange` 深链、`switchTheme()` 主题切换、"下载独立 HTML"按钮的 `serializeTheme()`）。
- [x] 1.5 定义章节 `kind` 未知时的降级策略（fallback 为普通段落 + `console.warn`），写单元级 mock 数据自测。

## 2. index.html 首页

- [x] 2.1 编写 `guide/index.html`：顶部标题 + 简介卡片；顶部标签栏（7 个专题）；中央 SVG 拓扑（7 节点 + 关系连线，实线=技术依赖 / 虚线=面试联问）；详情面板容器。
- [x] 2.2 SVG 拓扑手绘 7 个节点定位（intro 居中、其他 6 个环绕），每个节点为 `<g role="button" tabindex="0">`，绑 click / keydown（Enter/Space）触发主题切换。
- [x] 2.3 拓扑节点激活态样式（描边加粗 + 光晕），标签栏激活态样式，二者由 `switchTheme()` 统一控制。
- [x] 2.4 页面初始化时读取 `location.hash` 决定默认激活的主题；无 hash 时激活 `intro`。
- [x] 2.5 <768px 断点：SVG 拓扑折叠为竖向主题列表，标签栏改为横向可滑动。

## 3. 内容抽取与 THEMES 数据

- [x] 3.1 从 `~/Desktop/加油.md` 抽取 `intro` 专题内容（两段经历、设计信条、高性能/高可用/分布式速记、单/多线程本质、istio 慢的原因），按四段式（是什么/为什么这么选/踩过什么坑/怎么填的）填入 `THEMES[0]`。
- [x] 3.2 从 `~/Desktop/01-业务代理模块技术演进.md` 抽取 `business-proxy` 专题内容（三模块关系图 + platpxy 三通道 + paypxy 支付链路 + 幂等四道闸 + 米大师签名 + 12000 连接池 + 监控维度爆炸 + mallsvrd 双商品体系 + 周期时间对齐 + PLAN A/B/C），填入 `THEMES[1]`。
- [x] 3.3 从 `~/Desktop/02-NZMesh服务网格与K8s部署.md` 抽取 `nzmesh-k8s` 专题内容（含 Gossip 校正、calc_connect、Reservoir Sampling、Jump Hash、就近路由、CVM 多通道、DaemonSet+hostNetwork、hostIP 注入、跨集群、nzmeshpanel 对账），填入 `THEMES[2]`。
- [x] 3.4 编写 `rate-limit` 专题（互联网限流：Nginx limit_req / 令牌桶 / 漏桶 / Sentinel / Guava / Redis+Lua / 分布式令牌桶 / 网关层 vs 服务层；游戏限流：Tick 内 CD / 玩家账号服务器多层 / 按帧摊派 / 写队列削峰 / 排队机 + 平滑扩容 / 跨服匹配；本质差异；降级熔断兜底），填入 `THEMES[3]`。
- [x] 3.5 编写 `redis` 专题（版本演进 3.x→8.x 时间线含 STREAM/多线程 IO/FUNCTION 等每版本亮点 + 分布式锁 SETNX/Redlock/Redisson 看门狗 + Cluster gossip/Slot/Hash Tag + 主从异步复制风险 + 缓存三板斧 + 双写一致性），填入 `THEMES[4]`。
- [x] 3.6 编写 `k8s-network` 专题（异构混部 + node label/taint/toleration/affinity + 多 runtime + CNI 三大流派原理对比 Flannel/Calico/Cilium + kube-proxy 三模式 + Ingress/Gateway API + BCS 直连 CLB + 跨集群通信选型 + eBPF 干掉 sidecar 反复横跳 + XDS 全量下发问题），填入 `THEMES[5]`。
- [x] 3.7 编写 `agent-dev` 专题（Agent Loop / ReAct / Plan-and-Execute + Tool Use / Function Calling + 上下文窗口管理与滑动窗口 + 语义压缩 + AI 巡检落地 + Prompt Engineering + 失败恢复 + 幂等 + 评测 golden/red-team + Multi-Agent 协作 + 框架对比 LangGraph/AutoGen/CrewAI/Claude Agent SDK），填入 `THEMES[6]`。
- [x] 3.8 每个专题结尾追加 `sources` 章节（分册末尾展示"内容来源"），三个已有专题引用桌面 md 路径 + 抽取日期，四个新增专题标注"综合整理"。

## 4. 独立分册生成

- [x] 4.1 使用 `template.html` + `THEMES[i]` 数据，为 7 个专题各生成 `guide/theme-<slug>.html` 一份（在编辑器中直接把 index 里的 THEMES 单项拷成分册的 THEME_JSON，或用一次性 Node.js 脚本生成后手动 vendor 进仓库）。
- [x] 4.2 每份分册 MUST 独立可开：断网双击，页面渲染完整，无 404。
- [x] 4.3 首页详情面板增加"下载独立 HTML"按钮，点击后 `serializeTheme(theme)` → Blob → `a.download='theme-<slug>.html'`；下载出来的文件与仓库自带分册在结构上等价（可对比字节差异控制在可接受范围）。

## 5. 打印与响应式验收

- [x] 5.1 在 Chrome 打印预览下逐一检查 index 与 7 份分册：按钮/标签栏/下载图标被隐藏、四段式内容全部展开、代码块换行不截断。
- [x] 5.2 手机尺寸（DevTools 375×812）下检查：拓扑折叠、标签栏可滑动、四段式仍可读。
- [x] 5.3 键盘可达验收：Tab 遍历首页所有节点/标签，Enter/Space 触发切换与鼠标一致。
- [x] 5.4 深链验收：`file://.../guide/index.html#redis` 直接打开激活 redis。
- [x] 5.5 断网验收：关掉 Wi-Fi，双击首页与任一分册，Network 面板全绿；`grep -R "https\?://" guide/` 应仅命中许可白名单（例如注释里说明用途的仓库自身链接）。

## 6. 内容内检与提交

- [x] 6.1 逐个专题对照 `specs/interview-topic-catalog/spec.md` 的必含项清单打勾，缺哪一项就补哪一项（尤其新增 4 个专题容易遗漏细节）。
- [x] 6.2 校对每个专题四段式段落存在（"是什么/为什么这么选/踩过什么坑/怎么填的"），暂缺的段落显式写"待补充"占位。
- [x] 6.3 手动挑 3 处技术校正回读一遍：Gossip 概念 vs 代码全连接广播、msc 走 TBus 共享内存而非 UDS、跨 DC "选 2 个中转"存疑——确保表述与桌面 md 校正清单一致。
- [x] 6.4 首页页脚写"抽取自 `~/Desktop/*.md`，日期 2026-07-02，仓库路径 `/Users/marcopu/lab/interview/guide/`"。
- [x] 6.5 `git status` 确认仅 `guide/` 目录新增；`git add guide/ openspec/changes/interview-review-guide/` 后由用户确认再 commit。

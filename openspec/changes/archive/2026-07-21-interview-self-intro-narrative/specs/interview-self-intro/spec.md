## ADDED Requirements

### Requirement: 脚本文件与主线定位

`docs/intro/self-intro-narrative.md` MUST 作为面试开场自我介绍叙事脚本存在，且 MUST 以「风险把控 + 系统稳定性」为叙事主线、以「克制地展现技术判断力」为副线。

#### Scenario: 文件存在且主线明确

- **WHEN** 打开 `docs/intro/self-intro-narrative.md`
- **THEN** 文档包含 VuePress frontmatter（`title`）、一句话定位（风险把控 + 稳定性为主线），且全篇不出现自夸式形容词堆砌（如"我非常优秀"），聪明感通过取舍论证与踩坑复盘体现

### Requirement: 五段式叙事结构

脚本 MUST 按五段组织：**钩子开场 → 经历骨架 → 稳定性/风险信条 → 埋钩子引导 → 收口反问**，且每段 MUST 给出可直接朗读的话术。

#### Scenario: 五段齐备且每段可念

- **WHEN** 检查脚本正文
- **THEN** 依次出现五个段落标题，每段至少含一段用引用块或明确标注的「可直接念」话术，措辞为第一人称口语、无占位符

#### Scenario: 每段附引导意图

- **WHEN** 阅读「经历骨架」「稳定性/风险信条」「埋钩子引导」三段
- **THEN** 每段末尾标注「面试官大概率追问」+「我要把话题引向的专题」，并以站内链接指向对应 `docs/` 专题（如 xmesh-k8s、business-proxy、rate-limit、redis）

### Requirement: 风险把控与稳定性要点必含

脚本 MUST 覆盖候选人可展开的风险/稳定性硬核论据，使主线可被追问后仍站得住。

#### Scenario: 稳定性四板斧与真实踩坑

- **WHEN** 阅读「稳定性/风险信条」段
- **THEN** 至少包含：高可用四板斧（限时排队削峰 / 超时重试熔断隔离 / 降级冗余故障转移 / 幂等防重状态机）、上线前防线（压测/监控/混沌/演练/容量评估）、以及至少两个**第一人称真实踩坑→止损→沉淀**的故事（如支付幂等四道闸、分布式锁看门狗续期、逆战点直购超时 PLAN A/B/C 演进、Reservoir/一致性哈希扩缩容），每个故事点出"风险在哪、我如何把控"

### Requirement: 双时长版本与引导路线图

脚本 MUST 提供 60 秒电梯版与 3~5 分钟完整版，并 MUST 提供一张「引导路线图」表格。

#### Scenario: 两种时长版本可选

- **WHEN** 检查脚本
- **THEN** 同时存在标注为「60 秒电梯版」与「3~5 分钟完整版」的两段话术，电梯版可独立朗读、不依赖完整版

#### Scenario: 引导路线图表格

- **WHEN** 查看「引导路线图」
- **THEN** 存在一张表格，列含「面试官问什么 → 我怎么答 → 顺势抛出的钩子/引向的专题」，至少覆盖 5 条常见追问路径

### Requirement: intro 入口链接

`docs/intro/README.md` MUST 提供指向该叙事脚本的入口链接，且 MUST NOT 改变 README 既有内容语义。

#### Scenario: README 可跳转到脚本

- **WHEN** 打开 `docs/intro/README.md`
- **THEN** 在「场景问题」段落附近存在一处指向 `self-intro-narrative.md` 的相对链接，其余既有段落内容不变

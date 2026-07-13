---
title: 业务代理 · 支付 · 商城
---

# 业务代理 · 支付 · 商城

platpxy / paypxy / mallsvrd 三模块技术演进

## 场景问题

商业化链路要同时对接十几个外部平台、把"钱"收准、把道具发对，并且让多人并行开发不互相踩踏。三个模块各司其职：

**三模块关系图**

```text
                客户端
                  │ (拉起支付/拉商城/买东西)
        ┌─────────▼──────────┐
        │      lobbysvrd       │  大厅按命令字分发
        └─────────┬──────────┘
                  │ mesh RPC (protobuf)
        ┌─────────▼──────────┐
        │     mallsvrd         │  商业化"大杂烩"：商城/商店/抽奖/活动/任务/支付编排
        └───┬───────┬─────┬───┘
   RPC      │       │     │ RPC
  ┌─────────▼┐  ┌───▼───┐ └────────────► deposit / bagsvrd（原子扣币+发道具）
  │ paypxy   │  │platpxy│
  │(支付代理) │  │(平台) │
  └────┬─────┘  └───┬───┘
       │HTTP        │HTTP / 原生 TCP / cgo C++SDK
   ┌───▼───┐   ┌────▼─────────────────────────────┐
   │米大师 │   │微信/QQ/WeGame/抖音/腾讯安全/Hope... │
   │Midas  │   │（十几个外部平台）                 │
   └───────┘   └──────────────────────────────────┘
```

**一句话定位**

- **platpxy**：对接公司"各种平台"的**统一出口**，一个平台能力一个文件，横向铺
- **paypxy**：只对接**米大师计费**，围绕"钱"做重试、幂等、对账
- **mallsvrd**：商业化业务编排层，自己不碰外部平台，靠 paypxy 收钱、靠 deposit 发货

## 实现方案

**platpxy — 平台代理**

统一对接公司内外平台的**代理出口**，同时是 RPC 服务端（收游戏服请求）+ HTTP 服务端（收平台回调）。入口 `platpxy/src/main.go:12`：`ctx.Run(true)` 触发 `OnInit` 注册约 30 个 RPC handler。

**接的平台清单**：TSS 腾讯安全（敏感词/反外挂/票据）、Hope 未成年人保护、WeGame 鉴权、高校/网吧特权、信誉分、微信/QQ 订阅、微信小游戏支付、抖音直播上车、GVoice 语音、企业微信机器人、LLM、AI 对局机器人（RLBot/MetaAI）、COS 上传、投诉/Bug 上报……**十几个**。

**paypxy — 支付代理**

**只对接米大师 Midas 计费系统**，RPC + HTTP 双服务。RPC 收游戏侧下单/查询/扣币；HTTP 收米大师**发货回调**。渠道：Q币、微信支付、QQ 钱包、Q卡、iap 苹果内购、微信电商、统一账户、页匠营销发券、游戏内代币。

**mallsvrd — "商业化大杂烩"**

入口极简（`main.cpp`），核心是 `MallContext`。早已超出"商城"——**商城/商店/抽奖/商业化活动/任务监听/米大师支付编排**都在同一进程，靠 `EQueueID` 队列分流做隔离。典型的**业务聚合服务**：减少跨服 RPC，代价是单进程巨大（`utils.cpp` 88KB、`utils_activity.cpp` 46KB）。

## 为什么这么做

**platpxy：为什么不做通用 HTTP 代理？**

对接平台的复杂度不在"发个 HTTP"，而在下面这一堆：

```text
URL: protocol://IP:PORT/path?parms
protocol - http/https
ip:port  - 域名/IP/L5/Polaris → 需二次请求（先服务发现再拼URL）
path     - 固定/拼接
parms    - 各种签名计算规则
DATA     - json/xml 生成复杂度、签名嵌套
```

- **方案一**（否）：通用 HTTP 代理（gamesvr ⇄ httppxy ⇄ plat）——签名/寻址/数据组装各家不同，扛不下来
- **方案二**（选中）：**平台代理 platpxy** —— 每个平台的寻址、签名、数据组装各自封装

**扩展方式**：新增能力 = 新建 `service_xxx.go` + `OnInit` 加一行 `svrcontext.Register(...)` + `PlatPxySvr` 加一段 toml。**一接口一文件**让多人并行不干扰。

**platpxy 三种出向通道**

| 通道 | 用途 | 实现要点 |
| --- | --- | --- |
| **HTTP (JSON/GET)** | 大部分平台 | 命名连接池 `http_transport.go:58`；11 种 `HTTPClientType_*` 分池复用 |
| **原生 TCP 私有协议** | AI 对局机器人 (RLBot) | 自研 `tcppool/`；4 字节大端长度头+包体；连接复用时**校验 req_type/seq_id 防串包** |
| **cgo C++ SDK** | 腾讯安全 TSS | `tsssdk/tss_sdk.go` cgo 链接 `lib/libgotss_sdk.so`（130MB） |

**paypxy：完整支付链路**

```text
1. 下单  OnUnifiedBuyGoods → 先写 dbsvrd 订单表 (Ordered)
         → 组米大师参数+签名+POST → 返 token/url 给客户端
2. 支付  客户端拿 token 拉起米大师收银台 (代币走 in_game_coin_pay)
3. 回调  米大师 POST → MidasDeliveryHandle 验签 → **幂等四道闸** → RPC 转 mallsvrd 真正发道具
4. 对账  OnPlayerPropCheckNtf 货币校对，不一致时下发同步包
```

**幂等四道闸** (`service_http.go:35`)：未找到订单 / 已终止订单 / **重复发货 → 返回成功** / 正常。

> "重复发货**返回成功**"是关键——避免米大师以为失败而无限重试（`service_http.go:205`）。

**paypxy：核心机制**

- **寻址（L5 / Polaris）**：`"64128513:196608"` 就是 Polaris service 名 `fmt.Sprintf("%d:%d", L5Mod, L5Cmd)`；每次请求后 `UpdateServiceCallResult` 把成败/延时**回灌北极星**做熔断负载。
- **米大师签名 `ComputeSig`**：

```text
HMAC-SHA1( method & urlencode(path) & urlencode(sorted参数),
           offerKey+"&" ) 再 base64
```

自定义 `UrlEncode` 把 `~`→`%7E`、`+`→`%20`——**签名最易踩坑处**。

**mallsvrd：两套并行的商品体系**

- **商店 Shop**（10000–19999）：走 deposit 直接兑换，**无 RMB 链路**；`DBPlayerBuyRecords`
- **商城 Mall**（30000–39999）：含 RMB/逆战点/微信小游戏支付、折扣券、赛季 BP、VIP 特权，**业务最重**；`DBPlayerBuyRecordsByMall`

靠 `buy_factory.h` 按 `shop_id` 区段分流到 `MallBuy`/`ShopBuy`，走 `BuyBase::Buy()` 模板方法：`PreBuildItem → PreRecords → PreCheck → OnBuy`。

## 为什么别的选择不行

**platpxy 的坑**

- **WeGame 硬性 3s 超时**：整套 HTTP 超时压到 3s（`http_transport.go:63`），**注释写清了原因**
- **故障时 ERROR 日志反噬**：异常时暴打 ERROR 会把服务彻底压垮
- **TCP 连接池复用串包**：残留响应错回给别人

**paypxy README 上那串 TODO 背后的坑**

| TODO 项 | 坑是什么 | 代码里怎么填的 |
| --- | --- | --- |
| url 解析校验 | 拼出来的 URL 可能非法 | 下单前先校验 URL |
| http transport 链接复用 | 每次新建连接**打满端口** | `sync.Map` 按业务名缓存 `MonitoredHttpClient`；`MaxIdleConns=12000`；`MaxIdleConnsPerHost=总数/实例数`；用 `httptrace` 统计**复用 vs 新建**验证池子真生效 |
| **重试时再获取一下实例** | 重试反复打**同一台**挂掉的实例 | 把 `getServiceInstance` 放进**重试 for 循环体内部**，每次重试重新向 Polaris 要实例；退避用**指数退避封顶 + 20% 随机抖动**防重试风暴 |
| **监控不要直接上报字符串** | 把可变字符串（错误详情/ID）拼进监控**维度 key**，导致维度爆炸打爆监控系统 | 维度名收敛成**固定枚举常量**（`metrics.go:11`），可变信息只进日志；错误码用 `int` 映射；`Alert` 只在初始化失败等致命场景用 |

**paypxy 考古级坑**

- **metadata 脏数据**：米大师 metadata 偶尔混入非数字字符，`ParseMetadata` 逐字符只取数字
- **云游戏 metadata 嵌套 JSON**：手写括号配对解析器 `extractFirstJSONObject`
- **签名嵌套（微信小游戏）**：需两层签名（`paySig=HMAC-SHA256(uri&body, appKey)` + `signature=HMAC-SHA256(body, sessionKey)`），sessionKey 还要先用 `js_code` 换。paypxy 组 JSON、**RPC 调 platpxy 算签名**，跨进程协作
- **补发货策略**：微信 24h 内 15 次、QQ钱包 2h 9 次、Q币Q卡 5 分钟退款、iap 每次拉起补发

**mallsvrd 的坑**

| 坑 | 后果 | 填法 |
| --- | --- | --- |
| **uint32 下溢少付钱** | 折扣可用次数 `max(0u, discount_count - used)`，配置缩量后 `used>count` 下溢成超大值 → 全部按折扣价，**玩家少付钱** | 先判 `used >= count ? 0 : count-used` |
| **逆战点直购超时** | 跨 RPC 中断，玩家扣款成功但商品未发 | PLAN A/B/C 三套演进；最终选 C：**单次 RPC** 让 paypxy 完成下单+扣款；直购超时**不返错给客户端**，靠 5 次重试补偿 |
| **米大师重复发货** | 跨请求丢上下文、重复发道具 | 发货前查 `received_list` 幂等，已收当正常处理不报错；订单优先读 cache，miss 再回查 DB |
| 跨服 RPC 抖动 | 赛季 BP/折扣券校验偶发超时 | `CheckSeasonBPBuyItem` 做 N 次重试循环 |

## 沉淀结论

**platpxy 三大填法**

- WeGame 3s 超时：**注释写死原因**，避免后人调回默认导致回归
- 错误日志限流：`errLogCnt` 限流 ERROR 输出（`server.go:37`）
- TCP 连接池串包：**校验 req_type/seq_id + 50ms 探活 `isHealthy`**（`tcp_pool.go:212`）

**paypxy：连接复用 & 重试策略**

**连接复用哲学**：
- 用长连接/http2 把 socket 数摁住
- 分桶 + 全局 12000 上限：控规模、分散热点
- **90s 空闲回收 + 多层超时兜底**
- **复用率埋点**：一眼看出是否逼近 socket 上限

**重试白黑名单** `shouldRetry`：
- 余额不足 / 账户不存在**不重试**
- 其余因"米大师错误码未完整收录"，为保稳定**默认重试**（防御性）

**mallsvrd：职责下沉与"薄发货层"演进**

代码里留有大量注释的"考古层"，方向都指向：

> **组装/过滤职责从服务端迁到配置 Hub 预构建 + 客户端**，本服趋于"薄发货层"。

- `GetMallUnits` 直接 `CopyFrom` 远端**预构建好的列表**
- 商品条件过滤全注释掉，改为**无差别全量下发**，过滤挪到取商品时点或客户端
- **组限购**被注释禁用（`set_group_id(...)` 都注掉）
- **热路径优化**：`FastDatetimeStr2Sec` 手写字符串缓存，避免每次购买重复解析

**货币扣减：不自己做，走 deposit 原子兑换**

统一通过 `RPC::Deposit::ExchangeProps`：把消费货币放 `del_prop_list`、商品/赠品放 `add_prop_list`，**一次兑换原子完成扣减+发货**。逆战点特殊（由 paypxy 扣），在 `add_del_prop` 里直接 `return` 跳过。

**周期刷新时间对齐（最精巧的一段）**

`GetPeriodStartSec`：日/周/月/季/年都先对齐到配置的**"每日刷新点"**（线上 06:00）。
- **周**：+7 天回退到周一（处理 `localtime` 周日=0 vs ISO 周一=1）
- **季**：`tm_mon += 3; tm_mon -= tm_mon%3` 对齐季度首月
- **赛季类周期**：不用时间戳，靠**比对赛季 ID** 判过期

**依赖关系（按 RPC 调用频次）**

- **dbsvrd**：97（数据）
- **paypxy**：19（收钱）
- **deposit / bagsvrd**：19（原子扣币+发货）
- **lobby**：11
- **GlobalHook**：8（购买广播给任务/成就）
- **其他**：mission / lottery / vip / season / mail / apollo / award

::: tip 共用技术底座
- **框架**：`common/framework/svrcontext`（AcoContext 协程）；RPC 走 `svrcontext.Register / s.Request / s.Respond`，底层是自研 Mesh
- **服务发现**：`common/service_discovery`（北极星 polaris-go 封装）
- **监控**：`common/observability/gsmv2`（GSM）——**数值属性**走 `Sum/Avg/Max/SetAttr`；**字符串告警**走 `Alert`；**两者严格分开**
:::

## 内容来源

迁移自 `guide/theme-business-proxy`（原抽取自 `~/Desktop/01-业务代理模块技术演进.md`，抽取日期 2026-07-02，仓库路径 `/Users/marcopu/lab/interview/guide/`）。




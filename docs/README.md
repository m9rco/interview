---
home: true
title: 首页
heroText: 后台技术面试复习中心
tagline: 互联网/智能硬件后台 · 游戏基础架构 · 游戏业务 · 场景 → 实现 → 为什么这么做 → 为什么别的不行 → 沉淀
actions:
  - text: 个人经历 & 心法
    link: /intro/
    type: primary
  - text: 互联网/硬件后台
    link: /internet/
    type: secondary
  - text: 游戏基础架构
    link: /game-infra/
    type: secondary
  - text: 游戏业务
    link: /game-biz/
    type: secondary
features:
  - title: 场景驱动
    details: 每条经验都从一个真实的特定场景问题出发，而不是罗列概念。
  - title: 反选沉淀
    details: 不只讲"怎么做"，更讲"为什么这么做"以及"为什么同类的其他选择在这个场景不行"。
  - title: 代码 + 流程图
    details: 重点专题配可运行/贴近真实的代码与 Mermaid 流程图，便于随时重新拾起。
footer: 面试复习用 · 由 VuePress 生成 · 发布于 GitHub Pages / interview.0x06.cn
---

## 这份复习中心是什么

一份面向后台技术面试的通用复习中心，覆盖**互联网 / 智能硬件后台**、**游戏基础架构**、**游戏业务**三大域。这份站点把知识按"域"归档，每个专题统一用五段式组织：

1. **场景问题** —— 在什么特定场景下遇到什么问题
2. **实现方案** —— 怎么实现的（含代码 / 流程图）
3. **为什么这么做** —— 这么选的理由
4. **为什么别的选择不行** —— 同类方案在这个场景为何被否
5. **沉淀结论** —— 沉淀下来的结论与复习要点

## 三大域

- [互联网 / 智能硬件后台](/internet/) —— php-fpm+Nginx、MQTT/IoT、前端工程、Elixir、DNS 攻防与清洗、LVS/epoll、滑动窗口
- [游戏基础架构](/game-infra/) —— tconnd/tbus、CNI/服务网格、有状态迁移恢复、eBPF、一致性哈希、协程、秒杀、限流熔断、Raft/Gossip、LLVM
- [游戏业务实现](/game-biz/) —— 多模板活动框架、幂等性设计、Redis 房间推荐、游戏 vs 互联网本质差异

// 按域分组侧边栏。新增专题 = 在对应域数组追加一项，无需改渲染核心。
// 标 ★ 者为迁移自旧复习中心的实战笔记；其余为体系化深挖专题。
export const sidebar = {
  '/intro/': [
    {
      text: '个人经历 & 后台通用心法',
      children: ['/intro/README.md'],
    },
  ],

  '/internet/': [
    {
      text: '互联网 / 智能硬件后台（3 年）',
      children: [
        '/internet/README.md',
        '/internet/php-fpm-nginx.md',
        '/internet/iot-mqtt.md',
        '/internet/frontend-engineering.md',
        '/internet/elixir-fp.md',
        '/internet/dns-attack-tunnel.md',
        '/internet/dns-clean-intercept.md',
        '/internet/lvs-epoll.md',
        '/internet/sliding-window.md',
        '/internet/tcp-net.md',
      ],
    },
  ],

  '/game-infra/': [
    {
      text: '接入与通信',
      children: ['/game-infra/README.md', '/game-infra/tconnd.md', '/game-infra/tbus.md'],
    },
    {
      text: '网络与服务网格',
      children: [
        '/game-infra/cni-plugins.md',
        '/game-infra/mesh-istio-cilium.md',
        '/game-infra/mesh-central-vs-decentral.md',
        '/game-infra/ebpf.md',
        '/game-infra/xmesh-k8s.md',
        '/game-infra/k8s-network.md',
      ],
    },
    {
      text: '有状态服务',
      children: [
        '/game-infra/tcaplusdb.md',
        '/game-infra/stateful-migration.md',
        '/game-infra/stateful-recovery.md',
        '/game-infra/config-hot-reload.md',
      ],
    },
    {
      text: '算法与协程',
      children: [
        '/game-infra/consistent-hash-impl.md',
        '/game-infra/reservoir-sampling.md',
        '/game-infra/cpp-coroutine.md',
        '/game-infra/raft-gossip.md',
      ],
    },
    {
      text: '流量与承载',
      children: [
        '/game-infra/seckill.md',
        '/game-infra/token-leaky-bucket.md',
        '/game-infra/ratelimit-circuitbreak.md',
        '/game-infra/rate-limit.md',
        '/game-infra/release-strategy.md',
      ],
    },
    {
      text: '编译',
      children: ['/game-infra/llvm-compile.md'],
    },
  ],

  '/game-biz/': [
    {
      text: '游戏业务实现（6 年）',
      children: [
        '/game-biz/README.md',
        '/game-biz/activity-framework.md',
        '/game-biz/idempotency-design.md',
        '/game-biz/redis-room-recommend.md',
        '/game-biz/leaderboard.md',
        '/game-biz/gacha.md',
        '/game-biz/mail.md',
        '/game-biz/matchmaking.md',
        '/game-biz/game-vs-internet.md',
        '/game-biz/business-proxy.md',
      ],
    },
  ],

  '/ai-llm/': [
    {
      text: 'AI / 大模型',
      children: [
        '/ai-llm/README.md',
        '/ai-llm/llm-fundamentals.md',
        '/ai-llm/llm-inference-optimization.md',
        '/ai-llm/rag.md',
        '/ai-llm/agent-dev.md',
      ],
    },
  ],

  '/common/': [
    {
      text: '通用后台基础（跨域）',
      children: [
        '/common/concurrency.md',
        '/common/go-gotchas.md',
        '/common/design-model.md',
        '/common/gc-stw.md',
        '/common/algo-ds.md',
        '/common/sorting.md',
        '/common/mysql-innodb.md',
        '/common/redis.md',
      ],
    },
  ],
}

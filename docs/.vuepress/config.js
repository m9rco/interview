import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { searchPlugin } from '@vuepress/plugin-search'
import { markdownChartPlugin } from '@vuepress/plugin-markdown-chart'
import { markdownExtPlugin } from '@vuepress/plugin-markdown-ext'
import { markdownStylizePlugin } from '@vuepress/plugin-markdown-stylize'
import { markdownMathPlugin } from '@vuepress/plugin-markdown-math'
import { navbar } from './configs/navbar.js'
import { sidebar } from './configs/sidebar.js'

// GitHub Pages 项目页在 /interview/ 子路径；COS 绑定 interview.0x06.cn 走根路径。
// 通过 DEPLOY_TARGET 环境变量在构建时切换 base，避免资源 404。
const DEPLOY_TARGET = process.env.DEPLOY_TARGET || 'pages'
const base = DEPLOY_TARGET === 'cos' ? '/' : '/interview/'
// hostname 供默认主题内置的 SEO(og 标签) 与 sitemap 生成绝对 URL；随部署目标切换。
// 设了 hostname，主题就会自动启用 @vuepress/plugin-seo 与 @vuepress/plugin-sitemap。
const hostname = DEPLOY_TARGET === 'cos' ? 'https://interview.0x06.cn' : 'https://m9rco.github.io'

export default defineUserConfig({
  base,
  lang: 'zh-CN',
  title: '后台技术面试复习中心',
  description: '互联网/智能硬件后台 · 游戏基础架构 · 游戏业务 · 场景—抉择—反选—沉淀',
  head: [
    ['meta', { name: 'theme-color', content: '#0969da' }],
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1' }],
  ],

  bundler: viteBundler(),

  theme: defaultTheme({
    logo: null,
    hostname,
    repo: 'm9rco/interview',
    docsDir: 'docs',
    navbar,
    sidebar,
    sidebarDepth: 2,
    // 明暗主题切换 + 记忆由默认主题内置（colorMode / colorModeSwitch）
    colorMode: 'auto',
    colorModeSwitch: true,
    editLink: false,
    lastUpdated: true,
    contributors: false,
    themePlugins: {
      // 交由 md-enhance 统一接管代码高亮/容器等增强
      prismjs: true,
    },
  }),

  plugins: [
    searchPlugin({
      locales: {
        '/': { placeholder: '搜索专题 / 关键词' },
      },
      // 命中标题权重更高
      hotKeys: [{ key: 'k', ctrl: true }],
      maxSuggestions: 12,
    }),
    // Mermaid 流程图/时序图/状态图（```mermaid 代码块）
    markdownChartPlugin({ mermaid: true }),
    // GFM 增强：任务列表、脚注等
    markdownExtPlugin({ gfm: true, tasklist: true, footnote: true }),
    // 文本样式：对齐、上标、下标、标记
    markdownStylizePlugin({ align: true, sup: true, sub: true, mark: true }),
    // 数学公式：$...$ 行内、$$...$$ 块级，用 KaTeX 渲染
    markdownMathPlugin({ type: 'katex' }),
  ],
})

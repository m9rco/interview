#!/usr/bin/env node
// check-structure.js
// 校验 docs/ 下每篇专题文档是否符合「五段式 + 记忆锚点」模板。
// 对应 openspec/specs/memory-system/spec.md · Requirement「单篇结构标准化」。
//
// 检查项：
//   1. 顶部一句话结论 callout： ::: tip 一句话结论
//   2. 五个锚点标题（按 spec 顺序）：
//        ## 场景问题 / ## 实现方案 / ## 为什么这么做 / ## 为什么别的选择不行 / ## 沉淀结论
//   3. 记忆口诀小节： ### 记忆口诀
//
// 输出：每个存在缺失的文档一行，格式为
//   [WARN] docs/xxx/yyy.md 缺少: 记忆口诀, 场景问题
// 退出码：全部通过为 0，存在缺失为 1（便于接入 CI）。

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const docsRoot = join(repoRoot, 'docs');

// 需要跳过的目录（VuePress 配置/缓存等，非专题内容）。
const SKIP_DIRS = new Set(['.vuepress', 'node_modules', '.git']);

// 每个检查项：label 用于报告，test 返回 true 表示「命中/存在」。
const CHECKS = [
  { label: '一句话结论', test: (t) => /:::\s*tip[^\n]*(一句话|记忆锚点)/.test(t) },
  { label: '场景问题', test: (t) => /^##\s+(\d+\.\s*)?场景问题/m.test(t) },
  { label: '实现方案', test: (t) => /^##\s+(\d+\.\s*)?实现方案/m.test(t) },
  { label: '为什么这么做', test: (t) => /^##\s+(\d+\.\s*)?为什么这么做/m.test(t) },
  { label: '为什么别的选择不行', test: (t) => /^##\s+(\d+\.\s*)?为什么别的选择不行/m.test(t) },
  { label: '沉淀结论', test: (t) => /^##\s+(\d+\.\s*)?沉淀结论/m.test(t) },
  { label: '记忆口诀', test: (t) => /^###\s+记忆口诀\s*$/m.test(t) },
];

// 递归收集 docs/ 下非 README、非 .cards.md 的 .md 文件。
// .cards.md 是间隔复习闪卡文件，遵循另一套模板，不在本检查范围内。
function collectDocs(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue;
      out.push(...collectDocs(full));
      continue;
    }
    if (!entry.endsWith('.md')) continue;
    if (entry === 'README.md') continue;
    if (entry.endsWith('.cards.md')) continue;
    if (entry === 'dependency-map.md' || entry === 'learning-paths.md') continue;
    out.push(full);
  }
  return out;
}

function main() {
  const files = collectDocs(docsRoot).sort();
  const warnings = [];

  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const missing = CHECKS.filter((c) => !c.test(text)).map((c) => c.label);
    if (missing.length > 0) {
      // 统一使用 posix 风格的相对路径，保证输出稳定（docs/xxx/yyy.md）。
      const rel = relative(repoRoot, file).split(sep).join('/');
      warnings.push(`[WARN] ${rel} 缺少: ${missing.join(', ')}`);
    }
  }

  for (const line of warnings) console.log(line);

  const total = files.length;
  const bad = warnings.length;
  console.log(
    `\n检查完成：共 ${total} 篇，${total - bad} 篇合规，${bad} 篇缺少结构。`
  );

  process.exit(bad > 0 ? 1 : 0);
}

main();

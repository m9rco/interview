#!/usr/bin/env node
// lint-md-html.js
// 拦截会让 VuePress(Vue 模板编译器) 构建失败的 Markdown 内联 HTML 写法。
//
// 背景：Vue 把 Markdown 渲染出的 HTML 当作模板解析。若块级标签
// (如 <details>/<summary>) 缩进放在有序/无序列表项内，而其闭合标签
// 在列 0，标签嵌套错位会触发 "Element is missing end tag"，导致整站
// 构建失败、无法发布。正确写法是「列 0 起 + 前置空行」，与其余文档一致。
//
// 本检查只扫描 docs/ 下的 .md（含 .cards.md 与 README），并跳过围栏代码块
// (``` 或 ~~~) 内的内容——代码块里的尖括号是示例文本，不会被当成 HTML。
//
// 退出码：无问题为 0；发现问题为 1（供 CI / pre-commit 钩子拦截）。

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const docsRoot = join(repoRoot, 'docs');

const SKIP_DIRS = new Set(['.vuepress', 'node_modules', '.git']);

// 会破坏构建的块级标签：缩进（行首有空白）出现即判定为问题。
const RISKY_BLOCK_TAGS = ['details', 'summary'];
const INDENTED_OPEN = new RegExp(`^[ \\t]+</?(?:${RISKY_BLOCK_TAGS.join('|')})[\\s>]`);
const FENCE = /^\s*(```|~~~)/;

function collectDocs(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue;
      out.push(...collectDocs(full));
      continue;
    }
    if (entry.endsWith('.md')) out.push(full);
  }
  return out;
}

function scan(file) {
  const lines = readFileSync(file, 'utf8').split('\n');
  const hits = [];
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (FENCE.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (INDENTED_OPEN.test(line)) {
      hits.push({ line: i + 1, text: line.trim() });
    }
  }
  return hits;
}

function main() {
  const files = collectDocs(docsRoot).sort();
  let bad = 0;
  for (const file of files) {
    const hits = scan(file);
    if (hits.length === 0) continue;
    bad++;
    const rel = relative(repoRoot, file).split(sep).join('/');
    for (const h of hits) {
      console.error(`[ERROR] ${rel}:${h.line}  缩进的块级 HTML「${h.text}」会导致 VuePress 构建失败`);
    }
  }

  if (bad > 0) {
    console.error(
      `\n发现 ${bad} 个文件含缩进的块级 HTML 标签。` +
        `\n修复：把 <details>/<summary> 移到列 0（顶格），并在其与上一行之间留一个空行。` +
        `\n正确示例：\n  1. 问题文字\n\n  <details><summary>参考答案</summary>\n\n  答案文字\n\n  </details>\n`
    );
    process.exit(1);
  }
  console.log(`Markdown HTML 检查通过：共 ${files.length} 篇，无会破坏构建的缩进块级标签。`);
  process.exit(0);
}

main();

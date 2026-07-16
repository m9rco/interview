#!/usr/bin/env node
// generate-cards.mjs
// 从每篇文档的「## 自测」段提取 Q&A，生成同目录下的 .cards.md
// 同时输出 output/anki/<slug>.txt（Anki 导入格式：问题\t答案）

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';

const BASE = `${process.env.HOME}/lab/interview`;
const ANKI_DIR = `${BASE}/output/anki`;
mkdirSync(ANKI_DIR, { recursive: true });

function collectMd(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.') || entry === 'node_modules') continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) results.push(...collectMd(full));
    else if (
      entry.endsWith('.md') &&
      !entry.includes('README') &&
      !entry.endsWith('.cards.md') &&
      !full.includes('.vuepress') &&
      !full.includes('dependency-map') &&
      !full.includes('learning-paths')
    ) results.push(full);
  }
  return results;
}

// 从文档文本中提取自测 Q&A 对
// 策略：找 ## 自测 段，然后以每个 <details> 块为单位，取块前最后一个非空行作为问题
function extractQA(text) {
  const pairs = [];

  const selfTestMatch = text.match(/## 自测[^\n]*\n([\s\S]*?)(?=\n## |\n# |$)/);
  if (!selfTestMatch) return pairs;

  const section = selfTestMatch[1];

  // 按 <details> 分割
  const parts = section.split(/<details>/);
  for (let i = 1; i < parts.length; i++) {
    // 前一块的最后一个非空行 = 问题
    const before = parts[i - 1];
    const lines = before.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    const rawQ = lines[lines.length - 1];
    // 清理：去掉编号前缀 "1. " "**Q1：" 等，去掉末尾 **
    const q = rawQ
      .replace(/^\d+\.\s+/, '')
      .replace(/^\*{1,2}Q?\d*[：:.]?\s*/i, '')
      .replace(/\*{1,2}$/, '')
      .trim();

    // 提取答案：<summary>参考答案</summary>内容</details>
    const ansMatch = parts[i].match(/<summary>参考答案<\/summary>([\s\S]*?)<\/details>/);
    if (!ansMatch) continue;
    const a = ansMatch[1]
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\*\*(.+?)\*\*/g, '$1');  // 去掉加粗（Anki 不渲染 md）

    if (q && a) pairs.push({ q, a });
  }

  return pairs;
}

function extractOneLiner(text) {
  const m = text.match(/:::\s*tip[^\n]*\n([\s\S]*?):::/);
  return m ? m[1].trim().replace(/\n/g, ' ') : '';
}

function extractMnemonic(text) {
  const m = text.match(/### 记忆口诀\n([\s\S]*?)(?=\n##|\n### |$)/);
  return m ? m[1].trim() : '';
}

const files = collectMd(`${BASE}/docs`);
let generated = 0;
let skipped = 0;

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const pairs = extractQA(text);

  if (pairs.length === 0) {
    console.log(`[skip] ${file.replace(BASE + '/', '')} — 无自测题`);
    skipped++;
    continue;
  }

  const slug = basename(file, '.md');
  const dir = dirname(file);
  const oneLiner = extractOneLiner(text);
  const mnemonic = extractMnemonic(text);

  // 生成 .cards.md
  const cardsLines = [
    `# ${slug} — 闪卡`,
    '',
    oneLiner ? `> ${oneLiner}` : '',
    '',
  ];

  if (mnemonic) {
    cardsLines.push('## 记忆口诀', '', mnemonic, '');
  }

  pairs.forEach(({ q, a }, i) => {
    cardsLines.push(
      `## Card ${i + 1}`,
      '',
      `**Q**: ${q}`,
      '',
      `**A**: ${a}`,
      '',
    );
  });

  writeFileSync(join(dir, `${slug}.cards.md`), cardsLines.join('\n'));

  // 生成 Anki txt
  const ankiLines = pairs.map(({ q, a }) => `${q}\t${a}`);
  writeFileSync(join(ANKI_DIR, `${slug}.txt`), ankiLines.join('\n') + '\n');

  console.log(`[ok] ${file.replace(BASE + '/', '')} — ${pairs.length} 张卡`);
  generated++;
}

console.log(`\n完成：生成 ${generated} 篇 .cards.md + anki txt，跳过 ${skipped} 篇`);

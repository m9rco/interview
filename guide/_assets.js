// ==============================================================
// Interview Review Guide — shared runtime (documentation style)
// Vanilla JS. No CDN. Works from file://.
//
// Data model (v2):
//   THEMES[i] = { id, title, icon, tagline, hero?, groups, sources }
//   groups = [ { id, title, sections: [...] }, ... ]
//   Each theme designs its own group outline — no forced schema.
// ==============================================================
(function () {
  'use strict';

  // ---- Tiny Markdown (subset) -----------------------------------
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function renderInline(text) {
    let s = escapeHtml(text);
    s = s.replace(/`([^`]+)`/g, (_, c) => '<code>' + c + '</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    return s;
  }
  function renderMarkdown(md) {
    if (!md) return '';
    const lines = md.replace(/\r\n/g, '\n').split('\n');
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (/^```/.test(line)) {
        const buf = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++;
        out.push('<pre><code>' + escapeHtml(buf.join('\n')) + '</code></pre>');
        continue;
      }
      if (/^---\s*$/.test(line)) { out.push('<hr>'); i++; continue; }
      let m;
      if ((m = /^####\s+(.*)$/.exec(line))) { out.push('<h4>' + renderInline(m[1]) + '</h4>'); i++; continue; }
      if ((m = /^###\s+(.*)$/.exec(line)))  { out.push('<h4>' + renderInline(m[1]) + '</h4>'); i++; continue; }
      if (/^>\s?/.test(line)) {
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
        out.push('<blockquote>' + renderInline(buf.join(' ')) + '</blockquote>');
        continue;
      }
      if (/^\|.*\|$/.test(line) && i + 1 < lines.length && /^\|[\s:\-|]+\|$/.test(lines[i + 1])) {
        const header = line.split('|').slice(1, -1).map(s => s.trim());
        i += 2;
        const rows = [];
        while (i < lines.length && /^\|.*\|$/.test(lines[i])) {
          rows.push(lines[i].split('|').slice(1, -1).map(s => s.trim()));
          i++;
        }
        let html = '<table><thead><tr>';
        header.forEach(h => html += '<th>' + renderInline(h) + '</th>');
        html += '</tr></thead><tbody>';
        rows.forEach(r => {
          html += '<tr>';
          r.forEach(c => html += '<td>' + renderInline(c) + '</td>');
          html += '</tr>';
        });
        html += '</tbody></table>';
        out.push(html);
        continue;
      }
      if (/^[-*]\s+/.test(line)) {
        const buf = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i])) { buf.push(lines[i].replace(/^[-*]\s+/, '')); i++; }
        out.push('<ul>' + buf.map(t => '<li>' + renderInline(t) + '</li>').join('') + '</ul>');
        continue;
      }
      if (/^\d+\.\s+/.test(line)) {
        const buf = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i])) { buf.push(lines[i].replace(/^\d+\.\s+/, '')); i++; }
        out.push('<ol>' + buf.map(t => '<li>' + renderInline(t) + '</li>').join('') + '</ol>');
        continue;
      }
      if (/^\s*$/.test(line)) { i++; continue; }
      const buf = [];
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^```/.test(lines[i]) && !/^#{3,4}\s+/.test(lines[i]) && !/^[-*]\s+/.test(lines[i]) && !/^\d+\.\s+/.test(lines[i]) && !/^>\s?/.test(lines[i]) && !(/^\|.*\|$/.test(lines[i]) && i + 1 < lines.length && /^\|[\s:\-|]+\|$/.test(lines[i + 1]))) {
        buf.push(lines[i]); i++;
      }
      out.push('<p>' + renderInline(buf.join(' ')) + '</p>');
    }
    return out.join('\n');
  }

  // ---- Section renderers ---------------------------------------
  const SECTION_RENDERERS = {
    md(sec) {
      const body = renderMarkdown(sec.body || '');
      return sec.title ? ('<h4>' + escapeHtml(sec.title) + '</h4>' + body) : body;
    },
    quote(sec) {
      return '<blockquote>' + renderInline(sec.text || '') + '</blockquote>';
    },
    kv(sec) {
      const items = (sec.items || []).map(pair => {
        const [k, v] = pair;
        return '<div class="k">' + escapeHtml(k) + '</div><div class="v">' + renderInline(v) + '</div>';
      }).join('');
      return (sec.title ? '<h4>' + escapeHtml(sec.title) + '</h4>' : '') + '<div class="kv">' + items + '</div>';
    },
    table(sec) {
      const head = (sec.header || []).map(h => '<th>' + renderInline(h) + '</th>').join('');
      const rows = (sec.rows || []).map(r => '<tr>' + r.map(c => '<td>' + renderInline(c) + '</td>').join('') + '</tr>').join('');
      return (sec.title ? '<h4>' + escapeHtml(sec.title) + '</h4>' : '') +
        '<table><thead><tr>' + head + '</tr></thead><tbody>' + rows + '</tbody></table>';
    },
    code(sec) {
      return (sec.title ? '<h4>' + escapeHtml(sec.title) + '</h4>' : '') +
        '<pre><code>' + escapeHtml(sec.body || '') + '</code></pre>';
    },
    ascii(sec) {
      return (sec.title ? '<h4>' + escapeHtml(sec.title) + '</h4>' : '') +
        '<div class="ascii">' + escapeHtml(sec.body || '') + '</div>';
    },
    callout(sec) {
      const variant = sec.variant || 'info';
      return '<div class="callout ' + escapeHtml(variant) + '">' +
        (sec.title ? '<div class="title">' + escapeHtml(sec.title) + '</div>' : '') +
        (sec.body ? renderMarkdown(sec.body) : '') +
        '</div>';
    },
  };
  function renderSection(sec) {
    const r = SECTION_RENDERERS[sec.kind];
    if (!r) {
      console.warn('[guide] unknown section kind:', sec.kind, sec);
      return '<p>' + renderInline((sec.body || sec.text || JSON.stringify(sec))) + '</p>';
    }
    return r(sec);
  }

  // ---- Theme block rendering (documentation style) --------------
  function groupAnchor(themeId, groupId) {
    return themeId + '__' + groupId;
  }
  function renderGroup(theme, group) {
    let html = '';
    const anchor = groupAnchor(theme.id, group.id);
    html += '<h3 class="stage" id="' + escapeHtml(anchor) + '"><a class="anchor" href="#' + escapeHtml(anchor) + '">§</a>' + escapeHtml(group.title) + '</h3>';
    const secs = group.sections || [];
    html += secs.length ? secs.map(renderSection).join('\n') : '<p><em>待补充</em></p>';
    return html;
  }
  function renderThemeBlock(theme) {
    let html = '';
    html += '<section class="theme-block" id="' + escapeHtml(theme.id) + '">';
    html += '<h2 class="theme-title" id="theme-' + escapeHtml(theme.id) + '"><a class="anchor" href="#' + escapeHtml(theme.id) + '">§</a>' + escapeHtml(theme.icon || '') + ' ' + escapeHtml(theme.title || '') + '</h2>';
    if (theme.tagline) html += '<div class="tagline">' + renderInline(theme.tagline) + '</div>';
    if (theme.hero) {
      html += (Array.isArray(theme.hero) ? theme.hero : [theme.hero]).map(renderSection).join('\n');
    }
    (theme.groups || []).forEach(g => { html += renderGroup(theme, g); });
    if (theme.sources && theme.sources.length) {
      const anchor = groupAnchor(theme.id, 'sources');
      html += '<h3 class="stage" id="' + escapeHtml(anchor) + '">📎 内容来源</h3>';
      html += '<ul>' + theme.sources.map(s => '<li>' + renderInline(s) + '</li>').join('') + '</ul>';
    }
    html += '</section>';
    return html;
  }

  function renderSidebarHub(themes) {
    let html = '';
    html += '<div class="brand">📖 面试复习中心<small>9 年后台 · ' + themes.length + ' 大专题</small></div>';
    html += '<h2>专题</h2><ul>';
    themes.forEach(t => {
      html += '<li><a href="#' + escapeHtml(t.id) + '" data-nav="' + escapeHtml(t.id) + '">' + escapeHtml(t.icon || '') + ' ' + escapeHtml(t.title) + '</a></li>';
    });
    html += '</ul>';
    html += '<div class="tools">';
    html += '<button id="btn-theme" title="亮/暗主题">☾ 主题</button>';
    html += '<button onclick="window.print()" title="打印">🖨 打印</button>';
    html += '</div>';
    return html;
  }

  function renderSidebarSingle(theme) {
    let html = '';
    html += '<div class="brand">📖 ' + escapeHtml(theme.title) + '<small>面试复习分册</small></div>';
    html += '<h2>目录</h2><ul>';
    (theme.groups || []).forEach(g => {
      const anchor = groupAnchor(theme.id, g.id);
      html += '<li><a href="#' + escapeHtml(anchor) + '">' + escapeHtml(g.title) + '</a></li>';
    });
    if (theme.sources && theme.sources.length) {
      const anchor = groupAnchor(theme.id, 'sources');
      html += '<li><a href="#' + escapeHtml(anchor) + '">📎 内容来源</a></li>';
    }
    html += '</ul>';
    html += '<div class="tools">';
    html += '<button id="btn-theme" title="亮/暗主题">☾ 主题</button>';
    html += '<button onclick="window.print()" title="打印">🖨 打印</button>';
    html += '<a href="index.html">← 返回首页</a>';
    html += '</div>';
    return html;
  }

  function bindThemeToggle() {
    const btn = document.getElementById('btn-theme');
    if (!btn) return;
    let stored = null;
    try { stored = localStorage.getItem('guide-theme'); } catch (_) {}
    if (stored) document.documentElement.setAttribute('data-theme', stored);
    btn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? '' : 'dark';
      if (cur) document.documentElement.setAttribute('data-theme', cur);
      else document.documentElement.removeAttribute('data-theme');
      try { localStorage.setItem('guide-theme', cur); } catch (_) {}
    });
  }

  function bindMobileMenu() {
    const btn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    if (!btn || !sidebar) return;
    btn.addEventListener('click', () => sidebar.classList.toggle('open'));
    sidebar.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') sidebar.classList.remove('open');
    });
  }

  function bindScrollSpy(themes) {
    const links = document.querySelectorAll('.sidebar a[data-nav]');
    if (!links.length) return;
    const map = {};
    themes.forEach(t => {
      const el = document.getElementById(t.id);
      if (el) map[t.id] = el;
    });
    function onScroll() {
      const y = window.scrollY + 100;
      let active = themes[0] && themes[0].id;
      themes.forEach(t => {
        const el = map[t.id];
        if (el && el.offsetTop <= y) active = t.id;
      });
      links.forEach(a => a.classList.toggle('active', a.dataset.nav === active));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- Boot -----------------------------------------------------
  function bootHub() {
    const themes = window.__GUIDE_THEMES__ || [];
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    if (!sidebar || !content) return;

    sidebar.innerHTML = renderSidebarHub(themes);
    let contentHtml = '';
    contentHtml += '<h1 class="doc-title">面试复习中心</h1>';
    contentHtml += '<p class="doc-lede">9 年后台开发（3 年互联网 + 6 年游戏）· ' + themes.length + ' 大专题，每个专题都有自己的骨架，不套模板。侧边栏跳转专题，进入分册看到该专题的完整目录。</p>';
    themes.forEach(t => contentHtml += renderThemeBlock(t));
    contentHtml += '<div class="footer-note" id="footer-note"></div>';
    content.innerHTML = contentHtml;

    const footer = document.getElementById('footer-note');
    if (footer) footer.innerHTML = (window.__GUIDE_META__ && window.__GUIDE_META__.footerNote) || '';

    bindThemeToggle();
    bindMobileMenu();
    bindScrollSpy(themes);
  }

  function bootSingle() {
    const theme = window.__GUIDE_THEME__;
    if (!theme) return;
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    if (!sidebar || !content) return;

    sidebar.innerHTML = renderSidebarSingle(theme);
    let contentHtml = '';
    contentHtml += '<h1 class="doc-title">' + escapeHtml(theme.icon || '') + ' ' + escapeHtml(theme.title) + '</h1>';
    if (theme.tagline) contentHtml += '<p class="doc-lede">' + renderInline(theme.tagline) + '</p>';
    if (theme.hero) {
      contentHtml += (Array.isArray(theme.hero) ? theme.hero : [theme.hero]).map(renderSection).join('\n');
    }
    (theme.groups || []).forEach(g => { contentHtml += renderGroup(theme, g); });
    if (theme.sources && theme.sources.length) {
      const anchor = groupAnchor(theme.id, 'sources');
      contentHtml += '<h3 class="stage" id="' + escapeHtml(anchor) + '">📎 内容来源</h3>';
      contentHtml += '<ul>' + theme.sources.map(s => '<li>' + renderInline(s) + '</li>').join('') + '</ul>';
    }
    contentHtml += '<div class="footer-note" id="footer-note"></div>';
    content.innerHTML = contentHtml;

    const footer = document.getElementById('footer-note');
    if (footer) footer.innerHTML = (window.__GUIDE_META__ && window.__GUIDE_META__.footerNote) || '';

    bindThemeToggle();
    bindMobileMenu();
  }

  function boot() {
    if (window.__GUIDE_MODE__ === 'hub') bootHub();
    else if (window.__GUIDE_MODE__ === 'single') bootSingle();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.__GUIDE_API__ = { renderMarkdown, renderSection, renderThemeBlock, renderGroup };
})();

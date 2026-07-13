#!/usr/bin/env python3
"""Generate index.html and theme-*.html — documentation style.

- No topology, no tabs, no fancy chrome.
- Left sidebar TOC (sticky) + main content column.
- Every emitted HTML file is fully self-contained (CSS + JS + data inlined).
- Regenerate any time: `python3 build.py`.
"""
import os, re, json

HERE = os.path.dirname(os.path.abspath(__file__))

def read(p): return open(os.path.join(HERE, p), 'r', encoding='utf-8').read()

CSS = read('_assets.css')
JS  = read('_assets.js')
THEMES_SRC = read('_themes.js')

def safe_script(s: str) -> str:
    return s.replace('</script', '<\\/script')
def safe_style(s: str) -> str:
    return s.replace('</style', '<\\/style')

SUBPAGE_SHIM = """
<script>
(function () {
  var id = window.__GUIDE_THEME_ID__;
  var arr = window.__GUIDE_THEMES__ || [];
  var t = arr.find(function (x) { return x.id === id; });
  window.__GUIDE_MODE__ = 'single';
  window.__GUIDE_THEME__ = t;
})();
</script>
"""

DOC_LAYOUT = """
<button id="menu-btn" class="menu-btn" aria-label="menu">☰</button>
<div class="doc">
  <aside id="sidebar" class="sidebar"></aside>
  <main id="content" class="content"></main>
</div>
"""

def build_index_html():
    css_inline = safe_style(CSS)
    js_inline  = safe_script(JS)
    themes_inline = safe_script(THEMES_SRC)
    return f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>面试复习中心 · 9 年后台</title>
<style>{css_inline}</style>
</head>
<body>
{DOC_LAYOUT}
<script>{themes_inline}</script>
<script>window.__GUIDE_MODE__ = 'hub';</script>
<script>{js_inline}</script>
</body>
</html>
"""

def build_subpage(theme_id, theme_title, theme_icon):
    css_inline = safe_style(CSS)
    js_inline  = safe_script(JS)
    themes_inline = safe_script(THEMES_SRC)
    title = f"{theme_icon} {theme_title} — 面试复习"
    return f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<style>{css_inline}</style>
</head>
<body>
{DOC_LAYOUT}
<script>{themes_inline}</script>
<script>window.__GUIDE_THEME_ID__ = {json.dumps(theme_id)};</script>
{SUBPAGE_SHIM}
<script>{js_inline}</script>
</body>
</html>
"""

def extract_theme_stubs(src: str):
    stubs = []
    lines = src.split('\n')
    i = 0
    while i < len(lines):
        m = re.match(r"\s*id:\s*'([a-z0-9-]+)',", lines[i])
        if m:
            tid = m.group(1)
            title = None; icon = None
            for j in range(i, min(i+20, len(lines))):
                if title is None:
                    tm = re.match(r"\s*title:\s*'([^']+)',", lines[j])
                    if tm: title = tm.group(1)
                if icon is None:
                    im = re.match(r"\s*icon:\s*'([^']+)',", lines[j])
                    if im: icon = im.group(1)
                if title and icon: break
            if title and icon:
                stubs.append((tid, title, icon))
        i += 1
    return stubs

def main():
    stubs = extract_theme_stubs(THEMES_SRC)
    if len(stubs) < 1:
        raise SystemExit(f'No themes found. Aborting.')
    print(f'Found {len(stubs)} themes.')
    with open(os.path.join(HERE, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(build_index_html())
    print('Wrote index.html')
    for (tid, title, icon) in stubs:
        html = build_subpage(tid, title, icon)
        path = os.path.join(HERE, f'theme-{tid}.html')
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f'Wrote {os.path.basename(path)}')

if __name__ == '__main__':
    main()

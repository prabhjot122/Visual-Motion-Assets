/* LawVriksh blog kit — deterministic title fitting, link slots and an offline Markdown renderer.
   Load after core/lv-runtime.js. No network, no timers, no randomness. */
(function(){
  'use strict';
  var LV = window.LV = window.LV || {};

  /* ---------- title fitting ----------
     [data-fit] shrinks its font-size in 2 px steps from data-fit-max until it fits its box
     (data-fit-box, else the parent) and data-fit-lines. It never goes below data-fit-min. */
  function fit(el){
    var cs = getComputedStyle(el);
    var max = +el.getAttribute('data-fit-max') || parseFloat(cs.fontSize), min = +el.getAttribute('data-fit-min') || max * 0.6;
    var box = el.closest('[data-fit-box]') || el.parentElement, maxLines = +el.getAttribute('data-fit-lines') || 99;
    var fs = max;
    for (; fs >= min; fs -= 2) {
      el.style.fontSize = fs + 'px';
      var lh = parseFloat(getComputedStyle(el).lineHeight), h = el.getBoundingClientRect().height, lines = Math.round(h / (isNaN(lh) ? fs : lh));
      if (h <= box.clientHeight + 1 && lines <= maxLines) return fs;
    }
    el.style.fontSize = min + 'px'; return min;
  }
  LV.fit = fit;
  /* [data-cols-auto] lists choose their column count from the item count and the frame width:
     up to data-cols-max columns (data-cols-max-narrow on frames under 1000 px); more items wrap evenly (5 -> 3+2, 6 -> 3+3). */
  LV.layoutLists = function(){
    var root = document.querySelector('.lv'); if (!root) return; var w = root.offsetWidth;
    [].slice.call(document.querySelectorAll('[data-cols-auto]')).forEach(function(l){
      var kids = [].filter.call(l.children, function(c){ return c.tagName !== 'TEMPLATE'; }), n = kids.length;
      var max = +(l.getAttribute('data-cols-max') || 4); if (w < 1000) max = Math.min(+(l.getAttribute('data-cols-max-narrow') || 2), max);
      var cols = n <= max ? Math.max(n, 1) : Math.ceil(n / Math.ceil(n / max));
      l.style.setProperty('--cols', cols); l.setAttribute('data-cols', cols); l.setAttribute('data-n', n);
      kids.forEach(function(k, i){ k.classList.toggle('is-row-end', (i + 1) % cols === 0 || i === n - 1); k.classList.toggle('is-last', i === n - 1); });
    });
  };
  LV.fitAll = function(){ LV.layoutLists(); [].slice.call(document.querySelectorAll('[data-fit]')).forEach(fit); };

  /* ---------- Markdown (no raw HTML is ever passed through) ---------- */
  var esc = function(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var slug = function(s){ return String(s).toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  var safeUrl = function(u){ return /^\s*(javascript|data|vbscript):/i.test(u) ? '#' : u; };
  function inline(s){
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
    s = s.replace(/\[\^(\w+)\]/g, '<sup class="fn"><a href="#fn-$1" id="fnref-$1">$1</a></sup>');
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function(m, t, u){ return '<a href="' + esc(safeUrl(u.replace(/&amp;/g, '&'))) + '">' + t + '</a>'; });
    s = s.replace(/\[(\d{1,3})\](?!\()/g, '<span class="lv-cite">[$1]</span>');
    return s;
  }
  function listItems(lines){
    var items = [], cur = null;
    lines.forEach(function(l){ var m = l.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/); if (m) { cur = [m[1]]; items.push(cur); } else if (cur) cur.push(l.trim()); });
    return items.map(function(it){ return it.join(' '); });
  }
  function container(name, args, body, env){
    var inner = md(body, env, true);
    var label = args.trim();
    if (!label && (name === 'figure' || name === 'source')) label = body.replace(/\s+/g, ' ').trim();   // arguments may sit on the line below
    if (name === 'note' || name === 'caution' || name === 'settle') {
      var def = {note: 'Note', caution: 'Caution', settle: 'What this does not settle'}[name];
      return '<aside class="lv-callout is-' + name + '"><p class="lv-callout-k">' + esc(label || def) + '</p>' + inner + '</aside>';
    }
    if (name === 'term') return '<div class="lv-term"><p class="lv-term-k">Key term</p><p class="lv-term-name">' + inline(label) + '</p>' + inner + '</div>';
    if (name === 'pull') return '<p class="lv-pull">' + inline(body.replace(/\s+/g, ' ').trim()) + '</p>';
    if (name === 'steps') return '<ol class="lv-steps">' + listItems(body.split('\n')).map(function(t){ return '<li>' + inline(t) + '</li>'; }).join('') + '</ol>';
    if (name === 'checklist') return '<ul class="lv-checks">' + listItems(body.split('\n')).map(function(t){ return '<li>' + inline(t) + '</li>'; }).join('') + '</ul>';
    if (name === 'cta') { var p = label.split('|').map(function(x){ return x.trim(); }); return '<section class="lv-cta"><div class="lv-cta-t">' + inner + '</div><a class="lv-btn" href="' + esc(safeUrl(p[2] || '#')) + '">' + esc(p[0] || '') + '</a>' + (p[1] ? '<p class="lv-cta-note">' + esc(p[1]) + '</p>' : '') + '</section>'; }
    if (name === 'figure') { var f = label.split('|').map(function(x){ return x.trim().replace('{theme}', env.theme || 'paper'); }); return '<figure class="lv-figure"><img src="' + esc(safeUrl(f[0] || '')) + '" alt="' + esc(f[1] || '') + '">' + (f[2] ? '<figcaption>' + esc(f[2]) + '</figcaption>' : '') + '</figure>'; }
    if (name === 'source') { var s = label.split('|').map(function(x){ return x.trim(); }); return '<p class="lv-source">' + s.map(function(x, i){ return (i ? '<span class="sep" aria-hidden="true"></span>' : '') + '<span>' + esc(x) + '</span>'; }).join('') + '</p>'; }
    return inner;
  }
  function md(src, env, nested){
    env = env || {theme: 'paper'};
    var lines = String(src == null ? '' : src).replace(/\r/g, '').split('\n'), out = [], foot = [], i = 0;
    var blockStart = function(l){ return /^(#{1,3}\s|:::|\|)/.test(l) || /^\s*([-*]|\d+\.)\s+/.test(l) || /^(-{3,}|\*{3,})\s*$/.test(l) || /^\[\^\w+\]:/.test(l); };
    while (i < lines.length) {
      var ln = lines[i];
      if (!ln.trim()) { i++; continue; }
      var m = ln.match(/^:::\s*(\w+)\s*(.*)$/);
      if (m) { var body = []; i++; while (i < lines.length && !/^:::\s*$/.test(lines[i])) body.push(lines[i++]); i++; out.push(container(m[1], m[2], body.join('\n'), env)); continue; }
      var fd = ln.match(/^\[\^(\w+)\]:\s*(.*)$/); if (fd) { foot.push([fd[1], fd[2]]); i++; continue; }
      var h = ln.match(/^(#{1,3})\s+(.*)$/); if (h) { var lv = h[1].length; out.push('<h' + lv + ' id="' + slug(h[2]) + '">' + inline(h[2]) + '</h' + lv + '>'); i++; continue; }
      if (/^(-{3,}|\*{3,})\s*$/.test(ln)) { out.push('<hr class="lv-divider">'); i++; continue; }
      if (/^\|/.test(ln) && /^\|[\s:|-]+\|?\s*$/.test(lines[i + 1] || '')) {
        var cells = function(l){ return l.replace(/^\||\|\s*$/g, '').split('|').map(function(c){ return c.trim(); }); };
        var head = cells(ln); i += 2; var rows = [];
        while (i < lines.length && /^\|/.test(lines[i])) rows.push(cells(lines[i++]));
        out.push('<div class="lv-table"><table><thead><tr>' + head.map(function(c){ return '<th>' + inline(c) + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.map(function(r){ return '<tr>' + r.map(function(c){ return '<td>' + inline(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>');
        continue;
      }
      if (/^\s*([-*]|\d+\.)\s+/.test(ln)) {
        var ord = /^\s*\d+\./.test(ln), buf = [];
        while (i < lines.length && (/^\s*([-*]|\d+\.)\s+/.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && buf.length))) buf.push(lines[i++]);
        var tag = ord ? 'ol' : 'ul'; out.push('<' + tag + '>' + listItems(buf).map(function(t){ return '<li>' + inline(t) + '</li>'; }).join('') + '</' + tag + '>'); continue;
      }
      var pb = [];
      while (i < lines.length && lines[i].trim() && !(pb.length && blockStart(lines[i]))) pb.push(lines[i++].trim());
      out.push('<p>' + inline(pb.join(' ')) + '</p>');
    }
    if (foot.length && !nested) out.push('<ol class="lv-sources">' + foot.map(function(f){ return '<li id="fn-' + f[0] + '">' + inline(f[1]) + ' <a class="back" href="#fnref-' + f[0] + '">Back to text</a></li>'; }).join('') + '</ol>');
    return out.join('\n');
  }
  LV.md = md;

  /* ---------- slots added by the blog kit ---------- */
  function themeOf(){ var r = document.querySelector('.lv'); return r ? r.getAttribute('data-theme') : 'paper'; }
  function buildToc(){
    var list = document.querySelector('[data-slot-list="contents"]'); if (!list || list.__manual) return;
    var hs = [].slice.call(document.querySelectorAll('[data-slot-md] h2'));
    [].slice.call(list.children).forEach(function(c){ if (c.tagName !== 'TEMPLATE') list.removeChild(c); });
    hs.forEach(function(h){ var li = document.createElement('li'), a = document.createElement('a'); a.href = '#' + h.id; a.textContent = h.textContent; li.appendChild(a); list.appendChild(li); });
    var wrap = list.closest('[data-toc]'); if (wrap) wrap.toggleAttribute('data-hidden', !hs.length);
  }
  function renderMd(){
    [].slice.call(document.querySelectorAll('[data-slot-md]')).forEach(function(el){
      if (el.__src == null) { var s = el.querySelector('script[type="text/markdown"]'); el.__src = s ? s.textContent : ''; }
      el.innerHTML = md(el.__src, {theme: themeOf()});
    });
    buildToc();
  }
  var baseFill = LV.fill;
  LV.fill = function(d){
    d = d || {};
    if ('contents' in d) { var l = document.querySelector('[data-slot-list="contents"]'); if (l) l.__manual = true; }
    var r = baseFill ? baseFill.apply(this, arguments) : null;
    [].slice.call(document.querySelectorAll('[data-slot-md]')).forEach(function(el){
      var k = el.getAttribute('data-slot-md'); if (k in d) el.__src = String(d[k] == null ? '' : d[k]);
    });
    if (document.querySelector('[data-slot-md]')) renderMd();
    [].slice.call(document.querySelectorAll('[data-slot-href]')).forEach(function(el){
      var k = el.getAttribute('data-slot-href'); if (k in d && d[k]) el.setAttribute('href', safeUrl(String(d[k])));
    });
    LV.fitAll();
    return r;
  };
  window.__lvAfterFill = function(){ LV.fitAll(); };
  if (window.__lvReady) window.__lvReady.then(function(){ LV.fitAll(); });
  document.addEventListener('DOMContentLoaded', function(){ if (document.querySelector('[data-slot-md]')) renderMd(); LV.fitAll(); });
})();

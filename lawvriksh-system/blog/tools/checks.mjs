// In-page self-checks (blog variant of tools/checks.mjs: min size, side margin and flat grounds are parameters). checkPage is serialised into the page by render.mjs,
// so it must stay self-contained (no imports, no closures).
export function checkPage(opts){
  const {W, H, reel, skip, textCheck} = opts;
  const TOK = ['#171717','#1c1714','#f5f1ea','#fbfaf7','#c94820','#a93a18','#cf795d','#c4562e','#5a524b'];
  const tokRGB = TOK.map(h => [1,3,5].map(i => parseInt(h.slice(i, i + 2), 16)));
  const root = document.querySelector('.lv');
  const problems = [];
  const P = (check, detail) => { if (problems.length < 60) problems.push({check, ...detail}); };
  // blog variant: sizes scale with width (34 px at 1080 wide, 40 px at 1200, 24 px at 720); side margin and ground are parameters
  const scale = W / 1080, minPx = opts.minPx ?? (reel ? 34 : Math.round(34 * W / 1080 * 10) / 10);
  const safeX = opts.safeX ?? 56, top = reel ? 200 : 0, bottom = reel ? H - 380 : H;

  // ---------- fonts ----------
  let fontsOk = true;
  const faces = [...document.fonts].filter(f => f.family.replace(/"/g, '') === 'LawVriksh Sans' && f.status === 'loaded');
  const loadedWeights = new Set(faces.map(f => String(f.weight)));
  const visible = el => { if (!el.isConnected) return false; const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return false; let n = el; while (n && n !== document.body) { const c = getComputedStyle(n); if (+c.opacity < 0.02 || c.display === 'none') return false; n = n.parentElement; } return true; };

  // ---------- collect text line rects ----------
  const texts = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    if (!n.nodeValue.trim()) continue;
    const el = n.parentElement; if (!el || el.closest('template,script,style') || !visible(el)) continue;
    const r = document.createRange(); r.selectNodeContents(n);
    // glyph band: the font's content box inset 18% top and bottom (where ink sits);
    // avoids false hits when a 1.0 line-height lets content boxes touch.
    const rects = [...r.getClientRects()].filter(q => q.width > 1 && q.height > 1).map(q => { const ins = q.height * 0.18; return {left: q.left, right: q.right, top: q.top + ins, bottom: q.bottom - ins, width: q.width, height: q.height - 2 * ins}; });
    texts.push({el, node: n, rects, text: n.nodeValue.trim().slice(0, 40)});
  }
  const italic = [], weights = new Set();
  for (const t of texts) {
    const cs = getComputedStyle(t.el);
    const fam = cs.fontFamily.split(',')[0].trim().replace(/["']/g, '');
    if (fam !== 'LawVriksh Sans') { fontsOk = false; P('font', {text: t.text, fam}); }
    weights.add(cs.fontWeight);
    if (!['400','500','600'].includes(cs.fontWeight)) { fontsOk = false; P('font', {text: t.text, weight: cs.fontWeight}); }
    if (cs.fontStyle !== 'normal') italic.push(t.text);
  }
  for (const w of weights) if (!loadedWeights.has(w)) { fontsOk = false; P('font', {weight: w, msg: 'face not loaded'}); }
  if (document.querySelector('.lv i, .lv em')) italic.push('<i>/<em> element');

  // ---------- palette ----------
  const bad = new Set();
  const colorRe = /rgba?\(([^)]+)\)/g;
  const isTok = (r, g, b) => tokRGB.some(([R, G, B]) => Math.abs(R - r) <= 1 && Math.abs(G - g) <= 1 && Math.abs(B - b) <= 1);
  const scan = (s, where) => { if (!s) return; let m; colorRe.lastIndex = 0; while ((m = colorRe.exec(s))) { const v = m[1].split(/[,\s/]+/).filter(Boolean).map(Number); const a = v.length > 3 ? v[3] : 1; if (a === 0) continue; if (!isTok(v[0], v[1], v[2])) bad.add(`${m[0]} @${where}`); } };
  for (const el of [root, ...root.querySelectorAll('*')]) {
    if (el.closest('template')) continue;
    const cs = getComputedStyle(el), tag = el.tagName.toLowerCase();
    const where = tag + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : '');
    if (el.childNodes.length && [...el.childNodes].some(c => c.nodeType === 3 && c.nodeValue.trim())) scan(cs.color, where);
    scan(cs.backgroundColor, where); scan(cs.backgroundImage, where); scan(cs.boxShadow, where);
    if (parseFloat(cs.borderTopWidth) > 0) scan(cs.borderTopColor, where);
    if (el instanceof SVGElement) { if (/^(path|rect|circle|ellipse|line|polyline|polygon|text|tspan)$/.test(tag)) { if (tag !== 'line') scan(cs.fill, where); scan(cs.stroke, where); } if (tag === 'stop') scan(cs.stopColor, where); }
    for (const pseudo of ['::before', '::after']) { const p = getComputedStyle(el, pseudo); if (p.content && p.content !== 'none') { scan(p.backgroundColor, where + pseudo); scan(p.backgroundImage, where + pseudo); scan(p.boxShadow, where + pseudo); } }
  }
  [...bad].slice(0, 8).forEach(b => P('palette', {color: b}));

  // ---------- geometry ----------
  const inter = (a, b, pad = 2) => Math.max(0, Math.min(a.right - pad, b.right - pad) - Math.max(a.left + pad, b.left + pad)) * Math.max(0, Math.min(a.bottom - pad, b.bottom - pad) - Math.max(a.top + pad, b.top + pad));
  let overlapOk = true, safeOk = true, sizeOk = true, contrastOk = true, minFont = 999, minContrast = 99;
  if (textCheck) {
    const decos = [...root.querySelectorAll('[data-deco], .stone, img, svg[data-image], .thread')].filter(visible).filter(d => !d.closest('.mark')).map(d => ({d, r: d.getBoundingClientRect()}));
    // .thread node dot area (pseudo) — approximate as a 30px box at the node
    for (let i = 0; i < texts.length; i++) {
      const A = texts[i];
      for (let j = i + 1; j < texts.length; j++) {
        const B = texts[j]; if (A.el === B.el || A.el.contains(B.el) || B.el.contains(A.el)) continue;
        for (const ra of A.rects) for (const rb of B.rects) if (inter(ra, rb, 3) > 6) { overlapOk = false; P('overlap', {a: A.text, b: B.text}); }
      }
      for (const {d, r} of decos) { if (d.contains(A.el)) continue; for (const ra of A.rects) { const ar = d.classList.contains('thread') ? {left: r.left, right: r.right, top: r.top - 3, bottom: r.bottom + 3} : r; if (inter(ra, ar, 1) > 4) { overlapOk = false; P('overlap', {text: A.text, deco: d.className.baseVal ?? d.className}); } } }
      for (const ra of A.rects) {
        if (ra.left < safeX - 0.5 || ra.right > W - safeX + 0.5) { safeOk = false; P('safe-area', {text: A.text, x: Math.round(ra.left), r: Math.round(ra.right)}); }
        if (ra.top < top - 0.5 || ra.bottom > bottom + 0.5 || ra.top < 0 || ra.bottom > H) { safeOk = false; P('safe-area', {text: A.text, y: Math.round(ra.top), b: Math.round(ra.bottom)}); }
      }
      const cs = getComputedStyle(A.el), fs = parseFloat(cs.fontSize);
      minFont = Math.min(minFont, fs);
      if (fs < minPx - 0.01) { sizeOk = false; P('min-size', {text: A.text, fs}); }
      // contrast: composite text colour over the stack of ancestor backgrounds
      const parse = s => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return [0,0,0,0]; const v = m[1].split(/[,\s/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1]; };
      const layers = []; let e = A.el;
      while (e && e !== document.documentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c[3] > 0) layers.push(c); if (c[3] >= 1) break; e = e.parentElement; }
      const theme = root.getAttribute('data-theme'); let bg = theme === 'dark' ? [28,23,20] : [245,241,234];
      if (!layers.length || layers[layers.length - 1][3] < 1) { /* textured paper ground: measure against its darkest typical value */ bg = theme === 'dark' ? [28,23,20] : (opts.flat ? [245,241,234] : [236,230,220]); }
      for (const L of layers.reverse()) bg = bg.map((v, k) => L[k] * L[3] + v * (1 - L[3]));
      const fc = parse(cs.color); let op = 1; let q = A.el; while (q && q !== root) { op *= +getComputedStyle(q).opacity; q = q.parentElement; }
      const a = fc[3] * op, fg = [0,1,2].map(k => fc[k] * a + bg[k] * (1 - a));
      const lum = c => { const [r, g, b] = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
      const L1 = lum(fg), L2 = lum(bg), ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      minContrast = Math.min(minContrast, ratio);
      const need = fs >= 60 * scale ? 3 : 4.5;
      if (ratio < need) { contrastOk = false; P('contrast', {text: A.text, ratio: +ratio.toFixed(2), need}); }
    }
  }
  // ---------- arrows ----------
  const arrowRe = /[←-⇿➔-➿⟰-⟿⤀-⥿⬀-⯿▶▸►◀‣]|->|=>|-->/;
  let arrowsOk = !arrowRe.test(root.innerText) && !document.querySelector('marker, [marker-end], [marker-start]');
  if (!arrowsOk) P('arrows', {});
  const pass = {fonts: fontsOk, noItalics: !italic.length, palette: bad.size === 0, noOverlap: overlapOk, safeArea: safeOk, minSize: sizeOk, contrast: contrastOk, noArrows: arrowsOk};
  for (const s of skip || []) delete pass[s];
  if (italic.length) P('italic', {items: italic.slice(0, 4)});
  return {pass, minFont: minFont === 999 ? null : minFont, minContrast: minContrast === 99 ? null : +minContrast.toFixed(2), weights: [...weights].sort(), problems};
}

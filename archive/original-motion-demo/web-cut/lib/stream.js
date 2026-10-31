/* LawVriksh web cut — the caption stream, v2 (web-cut/web-cut-plan.md §10–11).
 *
 * User direction (22 Oct): nothing cuts in, and nothing repeats. Every sentence is connected to
 * the motion before it (one thing triggering the next), and every turn uses its own move.
 *
 * One sentence object at a time, whole sentences, serif only (Newsreader), clay italic for key
 * words, paper grounds only. A segment says where its sentence sits (`place`), how it arrives
 * (`in`) and how it leaves when the next one starts (`out`); the film behind can recede under it
 * (`rec`, with a style `fx` that the host applies). Moves:
 *   in : morph (travel from the previous sentence's place and resolve on the way; `fit`: centre on
 *        centre at the previous box's width) · zoom (out of
 *        depth) · from (out of an object's box, framed by lifting corner marks) · gather (out of a
 *        point) · burst (thrown out of a point with the scene) · drop (falls in) · rise (up into
 *        its line) · type (letter by letter, clay caret) · reveal (a clay rule wipes it on) ·
 *        stream (token by token) · settle (scattered words land and straighten) · focus (one
 *        blurred block comes into focus) · lift · slide · flip · blur (in-place swaps) ·
 *        highlight (lands, then a marker sweeps its key words) · count (a figure counts up)
 *        · stamp (pressed in) · unfold (each word turns in on its left edge) · trace (a clay
 *        underline runs ahead and the words follow it) · wave (a ripple through the line) ·
 *        cascade (line by line from the left) · none (already there: a carried-over sentence)
 *   out: morph · lift · into (shrinks into an object's box) · sweep (leaves along a direction)
 *        · drop (falls away) · split (its lines part) · recede (back into depth toward a point)
 *        · wipe (wiped away left to right) · strike (struck through, then gone) · ride (moves
 *        with a host transform, see `carry`)
 * Pure function of web time. Copied into each web project's assets by prepare-assets.mjs.
 */
const gsap = window.gsap;
const EZ = (name) => gsap.parseEase(name);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const SVGNS = 'http://www.w3.org/2000/svg';

const CSS = `
.st-layer { position: absolute; left: 0; top: 0; width: 1440px; height: 1000px; pointer-events: none; overflow: hidden; }
.st-veil { position: absolute; inset: 0; background: #efebe3 url(assets/textures/paper.jpg) center / cover; opacity: 0; }
.st-wash { position: absolute; left: -260px; top: -300px; width: 1240px; height: 660px; background: radial-gradient(closest-side, rgba(245,241,234,0.95) 0%, rgba(245,241,234,0.85) 50%, rgba(245,241,234,0) 100%); opacity: 0; }
.st-wash.low { left: 40px; top: 770px; width: 1360px; height: 290px; background: radial-gradient(closest-side, rgba(245,241,234,0.97) 0%, rgba(245,241,234,0.9) 55%, rgba(245,241,234,0) 100%); }
.st-sent.light { color: #f6f1e8; text-shadow: 0 2px 18px rgba(20,14,10,0.45); }
.st-sent.light em { color: #f2c3a6; }
.st-sent { position: absolute; left: 0; top: 0; transform-origin: 0 0; white-space: nowrap; font-family: 'Newsreader', serif; font-weight: 500; letter-spacing: -0.028em; color: #1c1714; perspective: 600px; }
.st-sent.c { text-align: center; line-height: 1.04; }
.st-sent.l { text-align: left; line-height: 1.08; }
.st-sent em { font-style: italic; color: #a93a18; position: relative; }
.st-sent span.w { display: inline-block; white-space: pre; position: relative; }
.st-sent span.ch { display: inline-block; white-space: pre; }
.st-sent .hl { position: absolute; left: -0.06em; right: -0.06em; top: 0.18em; bottom: 0.06em; background: rgba(240,170,60,0.32); transform-origin: 0 50%; z-index: -1; }
.st-caret { position: absolute; width: 3px; background: #c94820; }
.st-rule { position: absolute; height: 2px; background: #c4562e; transform-origin: 0 50%; }
.st-strike { position: absolute; height: 3px; background: #c4562e; transform-origin: 0 50%; }
.st-marks { position: absolute; left: 0; top: 0; }
.hud { position: absolute; inset: 0; font-family: 'Newsreader', serif; font-size: 12px; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(28,23,20,0.72); }
.hud svg { position: absolute; left: 0; top: 0; }
.hud .tl { position: absolute; left: 34px; top: 24px; white-space: nowrap; }
.hud .bl { position: absolute; left: 34px; bottom: 22px; white-space: nowrap; display: flex; gap: 14px; }
.hud .bl b { font-weight: 500; opacity: 0.4; }
.hud .bl b.on { opacity: 1; }
.hud .br { position: absolute; right: 34px; bottom: 22px; white-space: nowrap; }
`;

/* words → <span class="w">, and for letter-level moves each letter → <span class="ch"> */
function spans(html, letters) {
  const tpl = document.createElement('template'); tpl.innerHTML = html;
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const s = document.createElement('span'); s.className = 'w';
          if (letters) [...part].forEach((c) => { const l = document.createElement('span'); l.className = 'ch'; l.textContent = c; s.appendChild(l); });
          else s.textContent = part;
          frag.appendChild(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName === 'B') { n.classList.add('w'); n.style.display = 'inline-block'; n.style.fontWeight = 'inherit'; }
      else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  };
  walk(tpl.content);
  return tpl.innerHTML;
}

const PLACES = {
  center: { align: 'c', max: 118, y: 'mid' },
  corner: { align: 'l', fs: 50, x: 64, y: 62 },
  top: { align: 'c', max: 64, y: 96 },
  below: { align: 'c', max: 52, y: 'low' }, // the subtitle: bottom centre, clear of the frame labels
};

/**
 * segments: [{ at, html, place, size?, in?, out?, dur?, rec?, fx?, fxp?, anchorIn?, anchorOut?, point?, dir?, marks?, wash? }]
 * hud: { chapters, chapter: (t) => ({ num, name, case? }), start? }
 * render(t) → { rec, fx, fxp }  (the host recedes its film by rec, in the style fx)
 */
export function mountStream(host, { segments = [], hud = null } = {}) {
  const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
  const layer = document.createElement('div'); layer.className = 'st-layer'; host.appendChild(layer);
  const veil = document.createElement('div'); veil.className = 'st-veil'; layer.appendChild(veil);
  const wash = document.createElement('div'); wash.className = 'st-wash'; layer.appendChild(wash);
  const washLow = document.createElement('div'); washLow.className = 'st-wash low'; layer.appendChild(washLow);
  const marksSvg = document.createElementNS(SVGNS, 'svg'); marksSvg.setAttribute('class', 'st-marks'); marksSvg.setAttribute('width', 1440); marksSvg.setAttribute('height', 1000); layer.appendChild(marksSvg);
  const marks = document.createElementNS(SVGNS, 'path'); marks.setAttribute('fill', 'none'); marks.setAttribute('stroke', '#1c1714'); marks.setAttribute('stroke-width', '2'); marks.setAttribute('stroke-linecap', 'square'); marksSvg.appendChild(marks);

  const S = segments.map((g, i) => {
    const P = typeof g.place === 'object' ? g.place : PLACES[g.place || 'center'];
    const rec = g.rec ?? (g.place === 'center' ? 1 : 0);
    if (!g.html) return { ...g, rec, el: null, i };
    const letters = g.in === 'type';
    const el = document.createElement('div'); el.className = `st-sent ${P.align}${g.tone === 'light' ? ' light' : ''}`; el.innerHTML = spans(g.html, letters); layer.appendChild(el);
    let fs = g.size ?? P.fs;
    if (!fs) { el.style.fontSize = '100px'; fs = Math.min(g.size ?? P.max, (P.align === 'c' ? 1180 : 1000) / el.offsetWidth * 100); }
    el.style.fontSize = `${fs}px`;
    const w = el.offsetWidth, h = el.offsetHeight;
    const x = P.x ?? (1440 - w) / 2;
    const y = P.y === 'mid' ? (1000 - h) / 2 - 8 : P.y === 'low' ? 912 - h : P.y;
    const words = [...el.querySelectorAll('.w')];
    words.forEach((s) => { s.dataset.line = Math.round(s.offsetTop / (fs * 1.0)); s.dataset.cx = s.offsetLeft + s.offsetWidth / 2; s.dataset.cy = s.offsetTop + s.offsetHeight / 2; });
    const lines = Math.max(...words.map((s) => +s.dataset.line)) + 1;
    const extra = {};
    if (g.in === 'type') { extra.caret = document.createElement('div'); extra.caret.className = 'st-caret'; layer.appendChild(extra.caret); extra.chars = [...el.querySelectorAll('span.ch')]; }
    if (g.in === 'reveal' || g.in === 'trace') { extra.rule = document.createElement('div'); extra.rule.className = 'st-rule'; layer.appendChild(extra.rule); }
    if (g.out === 'strike') { extra.strikes = Array.from({ length: lines }, () => { const d = document.createElement('div'); d.className = 'st-strike'; layer.appendChild(d); return d; }); }
    if (g.in === 'highlight') { extra.hls = [...el.querySelectorAll('em')].map((e) => { const d = document.createElement('i'); d.className = 'hl'; e.prepend(d); return d; }); }
    if (g.in === 'count') { extra.count = el.querySelector('b[data-count]'); }
    return { ...g, P, rec, el, fs, x, y, w, h, words, lines, i, ...extra };
  });
  S.forEach((g, i) => {
    g.prev = i ? S[i - 1] : null; g.next = S[i + 1] ?? null;
    if (!g.in) g.in = !g.prev?.el ? 'lift' : g.prev.P === g.P && g.place === g.prev.place ? 'lift' : 'morph';
    g.tin = g.dur ?? (['type', 'count'].includes(g.in) ? 1.3 : ['morph', 'from', 'burst', 'gather'].includes(g.in) ? Math.min(1.35, 0.75 + 0.035 * (g.words?.length ?? 6)) : 0.9);
  });
  S.forEach((g) => { if (g.el && !g.out) g.out = g.next && g.next.in === 'morph' && g.next.el ? 'morph' : 'lift'; });

  let H = null;
  if (hud) {
    const el = document.createElement('div'); el.className = 'hud'; layer.appendChild(el);
    const svg = document.createElementNS(SVGNS, 'svg'); svg.setAttribute('width', 1440); svg.setAttribute('height', 1000); el.appendChild(svg);
    const p = document.createElementNS(SVGNS, 'path'); p.setAttribute('fill', 'none'); p.setAttribute('stroke-width', '1.5'); p.setAttribute('stroke', 'rgba(28,23,20,0.72)');
    const I = 22, L = 28;
    p.setAttribute('d', `M${I} ${I + L}V${I}H${I + L}M${1440 - I - L} ${I}H${1440 - I}V${I + L}M${1440 - I} ${1000 - I - L}V${1000 - I}H${1440 - I - L}M${I + L} ${1000 - I}H${I}V${1000 - I - L}`);
    svg.appendChild(p);
    const tl = document.createElement('div'); tl.className = 'tl'; el.appendChild(tl);
    const bl = document.createElement('div'); bl.className = 'bl'; el.appendChild(bl);
    bl.innerHTML = hud.chapters.map((n, i) => `<b>${String(i).padStart(2, '0')}</b>`).join('');
    const br = document.createElement('div'); br.className = 'br'; el.appendChild(br);
    H = { el, tl, br, ticks: [...bl.children] };
  }

  /* ------------------------------------------------------------ helpers */
  const place = (g, x, y, s, r = 0) => { g.el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${r.toFixed(3)}deg) scale(${s.toFixed(4)})`; };
  const word = (w, op, dx = 0, dy = 0, s = 1, rot = 0, blur = 0, rx = 0, ry = 0) => {
    w.style.opacity = clamp(op, 0, 1).toFixed(3);
    if (ry) w.style.transformOrigin = '0 50%';
    w.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)${rx ? ` rotateX(${rx.toFixed(1)}deg)` : ''}${ry ? ` rotateY(${ry.toFixed(1)}deg)` : ''} rotate(${rot.toFixed(2)}deg) scale(${s.toFixed(3)})`;
    w.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
  };
  const stag = (k, n, p, a = 0, b = 1, len = 0.35) => { const s = a + (n > 1 ? k / (n - 1) : 0) * (b - a - len); return seg(p, s, s + len); };
  const fitBox = (g, box) => { const s = (box.w * 0.92) / g.w; return { x: box.x + box.w / 2 - g.w * s / 2, y: box.y + box.h / 2 - g.h * s / 2, s, r: box.rot ?? 0 }; };
  // `fit` morphs: g's box laid over another sentence's box, centre on centre, at that box's width
  // (a heading settling into a subtitle of different length never overflows the frame)
  const fitTo = (g, o) => { const s = o.w / g.w; return { x: o.x + o.w / 2 - g.w * s / 2, y: o.y + o.h / 2 - g.h * s / 2, s }; };
  const cornerPath = (x0, y0, x1, y1, L = 18) => `M${x0} ${y0 + L}V${y0}H${x0 + L}M${x1 - L} ${y0}H${x1}V${y0 + L}M${x1} ${y1 - L}V${y1}H${x1 - L}M${x0 + L} ${y1}H${x0}V${y1 - L}`;

  /* the incoming sentence: g arrives over u (0–1, raw progress of its move) */
  function arrive(g, t, raw) {
    const n = g.words.length, u = EZ('power3.inOut')(raw);
    const home = () => place(g, g.x, g.y, 1);
    switch (g.in) {
      case 'morph': {
        const p = g.prev; const a = g.fit ? fitTo(g, p) : { x: p.x, y: p.y, s: p.fs / g.fs };
        place(g, lerp(a.x, g.x, u), lerp(a.y, g.y, u), lerp(a.s, 1, u));
        g.words.forEach((w, k) => { const v = stag(k, n, raw, 0.3, 0.98, 0.3); const e = EZ('back.out(1.2)')(v); word(w, v, 0, 16 * (1 - e), 1, 0, 8 * (1 - v)); });
        break;
      }
      case 'zoom': {
        const z = EZ('expo.out')(raw), s = lerp(0.82, 1, z);
        place(g, g.x + (1 - s) * g.w / 2, g.y + (1 - s) * g.h / 2, s);
        g.words.forEach((w, k) => { const v = stag(k, n, raw, 0, 0.9, 0.35); word(w, v, 0, 10 * (1 - v), 1, 0, 10 * (1 - v)); });
        break;
      }
      case 'from': {
        const f = fitBox(g, g.anchorIn);
        place(g, lerp(f.x, g.x, u), lerp(f.y, g.y, u), lerp(f.s, 1, u), lerp(f.r, 0, u));
        g.words.forEach((w, k) => { const v = stag(k, n, raw, 0.25, 0.98, 0.3); word(w, v, 0, 12 * (1 - v), 1, 0, 6 * (1 - v)); });
        if (g.marks) { const ex = 26 * EZ('expo.out')(raw), x0 = lerp(f.x - 14, g.x, u) - ex, y0 = lerp(f.y - 14, g.y, u) - ex; const x1 = x0 + lerp(g.w * f.s + 28, g.w, u) + 2 * ex, y1 = y0 + lerp(g.h * f.s + 28, g.h, u) + 2 * ex; marks.setAttribute('d', cornerPath(x0, y0, x1, y1, 22)); marks.style.opacity = (1 - seg(raw, 0.75, 1)).toFixed(3); }
        break;
      }
      case 'gather': case 'burst': {
        home();
        const pt = g.point;
        g.words.forEach((w, k) => {
          const v = stag(k, n, raw, 0, 1, g.in === 'burst' ? 0.55 : 0.5), e = EZ(g.in === 'burst' ? 'expo.out' : 'back.out(1.3)')(v);
          const dx = (pt.x - (g.x + +w.dataset.cx)) * (1 - e), dy = (pt.y - (g.y + +w.dataset.cy)) * (1 - e) - (g.in === 'burst' ? 80 * Math.sin(Math.PI * e) : 0);
          word(w, seg(v, 0, 0.3), dx, dy, lerp(0.2, 1, e), (g.in === 'burst' ? (k % 2 ? 14 : -14) : 0) * (1 - e), 6 * (1 - e));
        });
        break;
      }
      case 'drop': {
        home();
        g.words.forEach((w, k) => { const v = stag(k, n, raw, 0, 1, 0.45), e = EZ('bounce.out')(v); word(w, seg(v, 0, 0.2), 0, -170 * (1 - e), 1, (k % 3 - 1) * 4 * (1 - e)); });
        break;
      }
      case 'rise': {
        home();
        g.words.forEach((w) => { const v = stag(+w.dataset.line, g.lines, raw, 0, 1, 0.6), e = EZ('expo.out')(v); word(w, v, 0, 60 * (1 - e), 1, 0, 4 * (1 - v)); });
        break;
      }
      case 'type': {
        home();
        const total = g.chars.length, shown = Math.floor(seg(raw, 0, 0.92) * total + 1e-6);
        g.words.forEach((w) => word(w, 1));
        g.chars.forEach((c, k) => { c.style.opacity = k < shown ? 1 : 0; });
        const last = g.chars[Math.max(0, shown - 1)];
        const blink = raw >= 1 ? (Math.floor((t - g.at - g.tin) * 2.5) % 2 === 0 ? 1 : 0) : 1;
        if (last) { const r = last.getBoundingClientRect(), L = layer.getBoundingClientRect(); Object.assign(g.caret.style, { left: `${(shown ? r.right : r.left) - L.left + 3}px`, top: `${r.top - L.top + g.fs * 0.12}px`, height: `${g.fs * 0.82}px`, opacity: blink }); }
        break;
      }
      case 'reveal': {
        home();
        const e = EZ('power2.inOut')(raw), edge = lerp(-6, 106, e);
        g.el.style.webkitMaskImage = g.el.style.maskImage = `linear-gradient(90deg, #000 ${(edge - 6).toFixed(1)}%, transparent ${edge.toFixed(1)}%)`;
        g.words.forEach((w) => word(w, 1));
        Object.assign(g.rule.style, { left: `${g.x}px`, top: `${g.y + g.h + 8}px`, width: `${g.w}px`, transform: `scaleX(${e.toFixed(4)})`, opacity: (1 - seg(raw, 0.85, 1)).toFixed(3) });
        break;
      }
      case 'stream': {
        home();
        g.words.forEach((w, k) => { const v = stag(k, n, raw, 0, 1, 0.12); word(w, v, 0, 0, 1, 0, 3 * (1 - v)); });
        break;
      }
      case 'settle': {
        home();
        g.words.forEach((w, k) => { const v = stag(k, n, raw, 0, 1, 0.5), e = EZ('back.out(1.6)')(v); const sx = ((k * 37) % 21 - 10) * 3, sy = ((k * 53) % 17 - 8) * 4; word(w, seg(v, 0, 0.25), sx * (1 - e), sy * (1 - e) - 30 * (1 - e), 1, ((k * 29) % 13 - 6) * 2.2 * (1 - e)); });
        break;
      }
      case 'focus': {
        const e = EZ('power2.out')(raw), s = lerp(1.06, 1, e);
        place(g, g.x - (s - 1) * g.w / 2, g.y - (s - 1) * g.h / 2, s);
        g.words.forEach((w) => word(w, seg(raw, 0, 0.4), 0, 0, 1, 0, 26 * (1 - e)));
        break;
      }
      case 'none': home(); g.words.forEach((w) => word(w, 1)); break;
      case 'stamp': home(); g.words.forEach((w, k) => { const v = stag(k, n, raw, 0, 0.95, 0.4), e = EZ('back.out(2.2)')(v); word(w, seg(v, 0, 0.25), 0, 0, lerp(1.7, 1, e), 0, 10 * (1 - seg(v, 0, 0.6))); }); break;
      case 'unfold': home(); g.words.forEach((w, k) => { const v = stag(k, n, raw, 0, 0.95, 0.45), e = EZ('power3.out')(v); word(w, seg(v, 0, 0.35), 0, 0, 1, 0, 0, 0, -88 * (1 - e)); }); break;
      case 'trace': {
        home();
        const e = EZ('power1.inOut')(seg(raw, 0, 0.85)), edge = g.x + e * (g.w + 40);
        Object.assign(g.rule.style, { left: `${g.x}px`, top: `${g.y + g.h + 6}px`, width: `${g.w}px`, transform: `scaleX(${clamp((edge - g.x) / g.w, 0, 1).toFixed(4)})`, opacity: (1 - seg(raw, 0.88, 1)).toFixed(3) });
        g.words.forEach((w) => { const wx = g.x + w.offsetLeft; const v = clamp((edge - wx) / 60, 0, 1); word(w, v, 0, 8 * (1 - v), 1, 0, 4 * (1 - v)); });
        break;
      }
      case 'wave': home(); g.words.forEach((w, k) => { const v = stag(k, n, raw, 0, 1, 0.5), e = EZ('expo.out')(v); word(w, seg(v, 0, 0.3), 0, (44 + 16 * Math.sin(k * 1.3)) * (1 - e), 1, 0, 6 * (1 - v)); }); break;
      case 'cascade': home(); g.words.forEach((w) => { const l = +w.dataset.line, v = stag(l, g.lines, raw, 0, 1, 0.6), e = EZ('expo.out')(v); word(w, seg(v, 0, 0.4), -70 * (1 - e), 0, 1, 0, 8 * (1 - v)); }); break;
      case 'slide': home(); g.words.forEach((w, k) => { const v = stag(k, n, raw, 0, 0.95, 0.4), e = EZ('expo.out')(v); word(w, v, 50 * (1 - e), 0, 1, 0, 6 * (1 - v)); }); break;
      case 'flip': home(); g.words.forEach((w, k) => { const v = stag(k, n, raw, 0, 0.95, 0.45), e = EZ('back.out(1.4)')(v); word(w, seg(v, 0, 0.3), 0, 0, 1, 0, 0, 90 * (1 - e)); }); break;
      case 'blur': home(); g.words.forEach((w, k) => { const v = stag(k, n, raw, 0, 0.9, 0.5); word(w, v, 0, 0, 1, 0, 14 * (1 - v)); }); break;
      case 'highlight': case 'count': case 'lift': default: {
        home();
        g.words.forEach((w, k) => { const v = stag(k, n, raw, 0, g.in === 'highlight' ? 0.7 : 0.95, 0.35), e = EZ('back.out(1.2)')(v); word(w, v, 0, 18 * (1 - e), 1, 0, 7 * (1 - v)); });
        if (g.hls) g.hls.forEach((h, k) => { h.style.transform = `scaleX(${EZ('power2.inOut')(seg(raw, 0.62 + k * 0.08, 0.95 + k * 0.08)).toFixed(3)})`; });
        if (g.count) { const N = +g.count.dataset.count; g.count.textContent = String(Math.round(N * EZ('power2.out')(seg(raw, 0.2, 1)))); }
      }
    }
  }

  /* the outgoing sentence g leaves over raw (0–1) toward `nx` (the next segment) */
  function leave(g, nx, raw) {
    const n = g.words.length, u = EZ('power3.inOut')(raw);
    const fade = (k) => { const o = stag(k, n, raw, 0, 0.6, 0.35); return o; };
    switch (g.out) {
      case 'morph': {
        const a = nx.fit ? fitTo(g, nx) : { x: nx.x, y: nx.y, s: nx.fs / g.fs };
        place(g, lerp(g.x, a.x, u), lerp(g.y, a.y, u), lerp(1, a.s, u));
        g.words.forEach((w, k) => { const o = fade(k); word(w, 1 - o, 0, -14 * o, 1, 0, 7 * o); });
        break;
      }
      case 'into': {
        const f = fitBox(g, g.anchorOut);
        place(g, lerp(g.x, f.x, u), lerp(g.y, f.y, u), lerp(1, f.s, u), lerp(0, f.r, u));
        g.words.forEach((w) => word(w, 1 - seg(raw, 0.55, 1), 0, 0, 1, 0, 3 * seg(raw, 0.5, 1)));
        if (g.marks) { const x0 = lerp(g.x - 20, f.x - 12, u), y0 = lerp(g.y - 20, f.y - 12, u), x1 = lerp(g.x + g.w + 20, f.x + g.w * f.s + 12, u), y1 = lerp(g.y + g.h + 20, f.y + g.h * f.s + 12, u); marks.setAttribute('d', cornerPath(x0, y0, x1, y1, 22)); marks.style.opacity = (seg(raw, 0, 0.2) * (1 - seg(raw, 0.8, 1))).toFixed(3); }
        break;
      }
      case 'sweep': {
        const [dx, dy] = g.dir ?? [460, 0];
        place(g, g.x + dx * EZ('power2.in')(raw), g.y + dy * EZ('power2.in')(raw), 1);
        g.words.forEach((w, k) => { const o = stag(n - 1 - k, n, raw, 0, 1, 0.5); word(w, 1 - o, 0, 0, 1, 0, 12 * o); });
        break;
      }
      case 'drop': {
        place(g, g.x, g.y, 1);
        g.words.forEach((w, k) => { const o = stag(k, n, raw, 0, 1, 0.55), e = EZ('power2.in')(o); word(w, 1 - seg(o, 0.4, 1), 0, 300 * e, 1, (k % 2 ? 8 : -8) * e, 0); });
        break;
      }
      case 'split': {
        place(g, g.x, g.y, 1);
        g.words.forEach((w) => { const l = +w.dataset.line, d = l < g.lines / 2 ? -1 : 1, e = EZ('power3.in')(raw); word(w, 1 - seg(raw, 0.4, 1), 0, d * 180 * e, 1, 0, 8 * e); });
        break;
      }
      case 'recede': {
        const pt = g.point ?? { x: g.x + g.w / 2, y: g.y + g.h / 2 }, s = lerp(1, 0.35, EZ('power2.in')(raw));
        place(g, lerp(g.x, pt.x - g.w * s / 2, u), lerp(g.y, pt.y - g.h * s / 2, u), s);
        g.words.forEach((w) => word(w, 1 - seg(raw, 0.35, 1), 0, 0, 1, 0, 6 * raw));
        break;
      }
      case 'wipe': {
        place(g, g.x, g.y, 1);
        const edge = lerp(-6, 106, EZ('power2.in')(raw));
        g.el.style.webkitMaskImage = g.el.style.maskImage = `linear-gradient(90deg, transparent ${edge.toFixed(1)}%, #000 ${(edge + 8).toFixed(1)}%)`;
        g.words.forEach((w) => word(w, 1));
        break;
      }
      case 'strike': {
        place(g, g.x, g.y, 1);
        const lineW = Array(g.lines).fill(0).map((_, l) => { const ws = g.words.filter((w) => +w.dataset.line === l); return ws.length ? { x0: Math.min(...ws.map((w) => w.offsetLeft)), x1: Math.max(...ws.map((w) => w.offsetLeft + w.offsetWidth)), y: ws[0].offsetTop + ws[0].offsetHeight * 0.55 } : null; });
        g.strikes.forEach((d, l) => { const L = lineW[l]; if (!L) return; Object.assign(d.style, { left: `${g.x + L.x0}px`, top: `${g.y + L.y}px`, width: `${L.x1 - L.x0}px`, transform: `scaleX(${EZ('power2.inOut')(seg(raw, l * 0.15, 0.45 + l * 0.15)).toFixed(3)})`, opacity: (1 - seg(raw, 0.75, 1)).toFixed(3), display: '' }); });
        g.words.forEach((w) => word(w, 1 - seg(raw, 0.6, 1), 0, 0, 1, 0, 4 * seg(raw, 0.6, 1)));
        break;
      }
      case 'lift': default: {
        place(g, g.x, g.y, 1);
        g.words.forEach((w, k) => { const o = fade(k); word(w, 1 - o, 0, -16 * o, 1, 0, 7 * o); });
      }
    }
  }

  return function render(t) {
    S.forEach((g) => { if (g.el) { g.el.style.display = 'none'; g.el.style.webkitMaskImage = g.el.style.maskImage = ''; } if (g.caret) g.caret.style.opacity = 0; if (g.rule) g.rule.style.opacity = 0; if (g.strikes) g.strikes.forEach((d) => { d.style.display = 'none'; }); });
    marks.setAttribute('d', '');
    let i = -1; S.forEach((g, k) => { if (t >= g.at) i = k; });
    let rec = 0, fx = 'blur', fxp = null, wTop = 0, wLow = 0;
    if (i >= 0) {
      const cur = S[i], prev = cur.prev;
      const swap = prev?.el && cur.el && ['lift', 'strike'].includes(prev.out) && cur.place === prev.place; // in place: the new sentence waits for the old to clear
      const delay = (swap ? (prev.out === 'strike' ? 0.72 : cur.place === 'below' ? 0.2 : 0.34) : 0) + (cur.wait ?? 0); // subtitles cross faster: more reading time
      const raw = seg(t, cur.at + delay, cur.at + delay + cur.tin);
      const outDur = prev?.el ? (prev.out === 'morph' ? cur.tin : prev.outDur ?? (swap ? 0.45 : 0.75)) : 0;
      const rawOut = prev?.el ? seg(t, cur.at, cur.at + outDur) : 1;
      const k = EZ('power2.inOut')(seg(t, cur.at, cur.at + (cur.recDur ?? cur.tin))); // the film moves on the segment's own clock, not its words' delay
      rec = cur.in === 'none' ? cur.rec : prev ? lerp(prev.rec, cur.rec, k) : cur.rec * seg(t, cur.at, cur.at + 0.6);
      const owner = prev && prev.rec > cur.rec ? prev : cur; fx = owner.fx ?? 'blur'; fxp = owner.fxp ?? null;
      if (prev?.el && rawOut < 1) { prev.el.style.display = ''; leave(prev, cur.el ? cur : prev, rawOut); }
      if (cur.el) { cur.el.style.display = ''; arrive(cur, t, raw); }
      // subtitles always sit on the low wash (contrast over busy frames); light type over footage has none
      const washOf = (g) => (g?.el ? (g.wash ?? (g.place === 'corner' ? 'top' : g.place === 'below' && g.tone !== 'light' ? 'low' : null)) : null);
      const wc = washOf(cur), wp = washOf(prev);
      const wu = cur.el ? seg(raw, 0, 0.5) : 0, wd = prev?.el ? 1 - seg(rawOut, 0.5, 1) : 0;
      if (wc === 'top') wTop = Math.max(wTop, wu); if (wc === 'low') wLow = Math.max(wLow, wu);
      if (wp === 'top') wTop = Math.max(wTop, wd); if (wp === 'low') wLow = Math.max(wLow, wd);
    }
    veil.style.opacity = fx === 'iris' ? 0 : (0.84 * rec).toFixed(3);
    wash.style.opacity = wTop.toFixed(3); washLow.style.opacity = wLow.toFixed(3);
    if (H) {
      const c = hud.chapter(t);
      H.el.style.opacity = (seg(t, hud.start ?? 0.4, (hud.start ?? 0.4) + 0.4) * (hud.end != null ? 1 - seg(t, hud.end, hud.end + 0.5) : 1)).toFixed(3);
      H.tl.textContent = `LawVriksh  ·  ${String(c.num).padStart(2, '0')}  ${c.name}`;
      H.ticks.forEach((b, k2) => b.classList.toggle('on', k2 === c.num));
      H.br.textContent = c.case || '';
    }
    return { rec, fx, fxp };
  };
}

/* The film's recession, in one of several styles (so no two turns recede the same way). */
export function applyFilm(film, rec, fx = 'blur', p = {}) {
  const r = rec;
  let tr = 'none', filter = r > 0.01 ? `blur(${(9 * r).toFixed(2)}px)` : 'none', clip = '';
  if (fx === 'blur') tr = `scale(${(1 - 0.035 * r).toFixed(4)})`;
  else if (fx === 'push') tr = `scale(${(1 + 0.09 * r).toFixed(4)})`;
  else if (fx === 'rise') tr = `translateY(${(-90 * r).toFixed(1)}px)`;
  else if (fx === 'sink') tr = `translateY(${(110 * r).toFixed(1)}px) scale(${(1 - 0.04 * r).toFixed(4)})`;
  else if (fx === 'pan') tr = `translateX(${((p.dir ?? -1) * 320 * r).toFixed(1)}px)`;
  else if (fx === 'veil') tr = 'none';
  else if (fx === 'shrink') tr = `scale(${(1 - 0.32 * r).toFixed(4)})`;
  else if (fx === 'iris') { filter = 'none'; const rad = lerp(1000, 0, EZ('power2.in')(r)); clip = r > 0.001 ? `circle(${rad.toFixed(1)}px at ${p.x ?? 720}px ${p.y ?? 500}px)` : ''; }
  film.style.transformOrigin = `${p.ox ?? 720}px ${p.oy ?? 500}px`;
  film.style.transform = r > 0.001 ? tr : 'none';
  film.style.filter = filter;
  film.style.clipPath = clip;
}

/** Piecewise-linear web → reel time map. keys: [[web, reel], ...] ascending; flat runs are holds. */
export function timeMap(keys) {
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [w1, r1] = keys[i], [w0, r0] = keys[i - 1];
      if (t <= w1) return w1 === w0 ? r1 : r0 + (r1 - r0) * ((t - w0) / (w1 - w0));
    }
    return keys.at(-1)[1];
  };
}

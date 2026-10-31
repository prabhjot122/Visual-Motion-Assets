/* WEB CUT COPY of section-3/src/section3.js: identical scene code, exporting renderAt for src/web.js.
 *
 * LawVriksh graphics track — section 3, global reel time 33.1333–38.1333 s (D5–D9).
 *
 * Composition time 0 = reel 33.1333 s (frame 994, the first after the 33.130 jump
 * cut). renderAt(t) takes GLOBAL reel seconds and is a pure function of time:
 * one paused GSAP timeline, seeded geometry, no clocks, no network.
 *
 * One continuous Case Map camera. Its keyframes are the approved stills' own
 * framings — d05 (collapsed), d06 (Conflicts), d07 (Version A/B), d08 = Frame C
 * (Compare), d09 (Verify) — so every hold lands exactly on its still. The map is
 * rebuilt by the stills' lib/casemap.js and the panels by lib/panels.js.
 * Clicks land on the words: Conflicts 34.32 ("conflicting" 34.38), Amount
 * outstanding 34.97, Version B 36.68 ("verify"). Verify fact is shown, never pressed.
 */
const ID = 'section-3';
const T0 = 33.1333, DUR = 5.0333; // 151 frames at 30 fps: 33.1333–38.1333; "aur poore case ki timeline" starts 38.17
const gsap = window.gsap;
const EZ = (name) => gsap.parseEase(name);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const tw = (t, a, b, e = 'power2.inOut') => EZ(e)(seg(t, a, b));
const $ = (id) => document.getElementById(id);
const SVGNS = 'http://www.w3.org/2000/svg';
const show = (node, on) => { node.style.display = on ? '' : 'none'; return on; };
function el(tag, attrs = {}, parent) { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; }
function div(cls, html = '', parent) { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; parent.appendChild(d); return d; }
const corners = (x0, y0, x1, y1, L = 20) => `M${x0} ${y0 + L}V${y0}H${x0 + L}M${x1 - L} ${y0}H${x1}V${y0 + L}M${x1} ${y1 - L}V${y1}H${x1 - L}M${x0 + L} ${y1}H${x0}V${y1 - L}`;
const scaleBox = (b, k) => { const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2; return { x0: cx + (b.x0 - cx) * k, y0: cy + (b.y0 - cy) * k, x1: cx + (b.x1 - cx) * k, y1: cy + (b.y1 - cy) * k }; };
function cubicAt(p0, c1, c2, p1, n = 40) { const out = []; for (let i = 0; i <= n; i++) { const u = i / n, m = 1 - u; out.push({ x: m * m * m * p0.x + 3 * m * m * u * c1.x + 3 * m * u * u * c2.x + u * u * u * p1.x, y: m * m * m * p0.y + 3 * m * m * u * c1.y + 3 * m * u * u * c2.y + u * u * u * p1.y }); } return out; }
const polyD = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('');
const drawn = (pts, u) => { const n = Math.round(pts.length * clamp(u, 0, 1)); return n >= 2 ? polyD(pts.slice(0, n)) : ''; };

await Promise.all(['400 100px "Newsreader"', 'italic 400 100px "Newsreader"', 'italic 400 30px "Instrument Serif"', '500 13px "Figtree"', '600 13px "Figtree"'].map((f) => document.fonts.load(f)));
await document.fonts.ready;

/* ------------------------------------------------------------ the camera */
// Map window geometry, inner scale and map origin of each approved still (dy: d09's inner offset).
const K = {
  k5: { x: 150, y: 300, w: 1360, h: 760, s: 1.08, ox: 602, oy: 300, dy: 0 },   // d05 collapsed
  k6: { x: 120, y: 150, w: 1400, h: 900, s: 1.45, ox: 960, oy: 222, dy: 0 },    // d06 Conflicts
  k7: { x: 40, y: -80, w: 1180, h: 1180, s: 1.6, ox: 1270, oy: 254, dy: 0 },    // d07 Version A/B
  k8: { x: 60, y: 290, w: 1020, h: 740, s: 1.5, ox: 1256, oy: 100, dy: 0 },     // d08 Frame C
  k9: { x: -40, y: 700, w: 470, h: 360, s: 1.25, ox: 1300, oy: 52, dy: -55 },   // d09 Verify
};
const CAM = [[T0, 'k5'], [34.36, 'k5'], [34.86, 'k6'], [35.0, 'k6'], [35.45, 'k7'], [35.5, 'k7'], [35.95, 'k8'], [36.72, 'k8'], [37.22, 'k9']];
function camAt(t) {
  let i = 0; while (i < CAM.length - 1 && CAM[i + 1][0] <= t) i++;
  const [ta, a] = CAM[i], nxt = CAM[Math.min(i + 1, CAM.length - 1)], [tb, b] = nxt;
  const u = b === a || tb === ta ? 0 : EZ('power3.inOut')(seg(t, ta, tb));
  const A = K[a], B = K[b], c = {};
  for (const k in A) c[k] = lerp(A[k], B[k], u);
  c.weight = (key) => (a === key ? 1 - u : 0) + (b === key ? (a === b ? 0 : u) : 0) + (a === b && a === key ? u : 0);
  c.a = a; c.b = b; c.u = u;
  return c;
}
const toScreen = (c, p) => ({ x: c.x + (c.ox + p.x) * c.s, y: c.y + c.dy + (44 + c.oy + p.y) * c.s });

/* ------------------------------------------------------------ the map */
const CM = window.CaseMap, PATHS = [[], ['conflicts'], ['conflicts', 'amount'], ['conflicts', 'amount', 'versionB']];
const CLICK = { conflicts: 34.32, amount: 34.97, versionB: 36.68 };
const mapState = (t) => (t < CLICK.conflicts ? { i: 0, sel: null } : t < CLICK.amount ? { i: 1, sel: null } : t < CLICK.versionB ? { i: 2, sel: 'amount' } : { i: 3, sel: 'versionB' });
const CRUMBS = [['Arora v. Meridian Estates Pvt. Ltd.'], ['Arora v. Meridian Estates Pvt. Ltd.', 'Conflicts'], ['Arora v. Meridian Estates Pvt. Ltd.', 'Conflicts', 'Amount outstanding'], ['Arora v. Meridian Estates Pvt. Ltd.', 'Conflicts', 'Amount outstanding']];
const mapInner = $('map-inner');
const world = CM.chrome(mapInner, { w: 1300, h: 900, crumbs: CRUMBS[0] });
const toolbar = mapInner.querySelector('.toolbar'), canvas = mapInner.querySelector('#cm-canvas'), crumbsEl = mapInner.querySelector('.crumbs');
// the current app also shows expand and refresh beside + and −
toolbar.insertAdjacentHTML('beforeend', '<div class="tb-sq"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3a352f" stroke-width="1.8" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></div><div class="tb-sq"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3a352f" stroke-width="1.8" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/></svg></div>');
const SEP = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#858585" stroke-width="2" stroke-linecap="round"><path d="m9 6 6 6-6 6"/></svg>';
let rendered = -1;
function renderState(st) {
  if (st.i === rendered) return;
  CM.renderMap(world, { path: PATHS[st.i], selected: st.sel, ox: 0, oy: 0, k: 1 });
  world.querySelectorAll('.edge').forEach((e) => { e.setAttribute('pathLength', 1); e.setAttribute('stroke-dasharray', '1 1'); });
  const cr = CRUMBS[st.i]; crumbsEl.innerHTML = cr.map((c, i) => `<span class="${i === cr.length - 1 && cr.length > 1 ? 'cur' : ''}">${c}</span>`).join(SEP);
  rendered = st.i;
}
const box = (id) => CM.box(PATHS[3], id); // the layout is the same at every depth
const CATS = ['parties', 'facts', 'advocates', 'evidence', 'issues', 'arguments', 'provisions', 'reliefs', 'conflicts'];
const RIGHT = new Set(['facts', 'evidence', 'arguments', 'reliefs']);
// edge id → [draw start, draw length]; node id → [appear start, appear length]
const EDGE_T = Object.fromEntries([...CATS.map((id, i) => [`e-matter-${id}`, [33.62 + i * 0.035, 0.32]]),
  ['e-conflicts-amount', [34.42, 0.3]], ['e-conflicts-duedate', [34.46, 0.3]], ['e-amount-versionA', [35.04, 0.26]], ['e-amount-versionB', [35.08, 0.26]]]);
const NODE_T = Object.fromEntries([...CATS.map((id, i) => [id, [33.62 + i * 0.035 + 0.22, 0.12]]),
  ['amount', [34.52, 0.22]], ['duedate', [34.56, 0.22]], ['versionA', [35.12, 0.22]], ['versionB', [35.16, 0.22]]]);

/* ------------------------------------------------------------ stage pieces */
// Collage pieces from each still; each belongs to the keyframes it appears in (Harvey collage).
const DECOR = [
  { cls: 'char', round: true, at: { k5: [1150, 150, 44, 44], k6: [980, 52, 46, 46], k8: [930, 196, 52, 52], k9: [1110, 40, 50, 50] } },
  { cls: 'clay', style: 'border-radius:60px 0 0 0', at: { k5: [1210, 118, 260, 200] } },
  { cls: 'hatch', at: { k5: [1380, 420, 80, 600] } },
  { cls: 'clay', style: "clip-path:path('M0 0 H120 A140 140 0 0 1 260 140 V520 H0 Z')", at: { k6: [-60, 560, 260, 520] } },
  { cls: 'sand', at: { k6: [1060, -30, 220, 120] } },
  { cls: 'halftone', at: { k6: [-20, 30, 180, 64] } },
  { cls: 'hatch', at: { k7: [-20, 700, 64, 340] } },
  { cls: 'sand', at: { k8: [-20, -20, 190, 110] } },
  { cls: 'halftone', at: { k8: [0, 214, 128, 64] } },
  { cls: 'clay', style: "clip-path:path('M0 0 H240 V190 H130 A110 110 0 0 0 20 80 H0 Z')", at: { k8: [920, -40, 240, 190] } },
  { cls: 'hatch', at: { k8: [-20, 380, 64, 640] } },
  { cls: 'sand', at: { k9: [1180, -30, 300, 150] } },
].map((d) => { const e = div(`deco ${d.cls}`, '', $('decor')); e.setAttribute('style', `${d.round ? 'border-radius:999px;' : ''}${d.style || ''}`); return { ...d, e }; });
const GUIDES = { // pencil crop guides of each still
  k5: 'M0 300 H1440 M150 0 V1000 M0 980 L1100 0', k6: 'M0 150 H1440 M120 0 V1000 M380 1000 L1440 40',
  k8: 'M60 0 V1000 M0 290 H1440 M1004 0 V1000 M0 930 L980 0', k9: 'M440 0 V1000 M0 250 H1440',
};
const guides = Object.fromEntries(Object.entries(GUIDES).map(([k, d]) => [k, el('path', { d, pathLength: 1 }, $('guide-g'))]));
const WORDS = {
  mapped: { html: 'Mapped<em>.</em>', x: 56, y: 40, size: 236, in: [33.2, 33.6], out: [CLICK.conflicts, 34.52] },
  compare: { html: 'Compare<em>.</em>', x: 50, y: 22, size: 236, in: [35.75, 36.1], out: [CLICK.versionB, 36.86] },  // "compare" 35.98
  verify: { html: 'Verify<em>.</em>', x: 46, y: 24, size: 220, in: [36.92, 37.3], out: [99, 100] },                  // "verify" 36.68
};
for (const w of Object.values(WORDS)) {
  w.mask = div('mask', `<div class="word" style="left:0; top:0; font-size:${w.size}px">${w.html}</div>`, $('words'));
  Object.assign(w.mask.style, { left: `${w.x}px`, top: `${w.y - 8}px`, width: '1100px', height: `${Math.round(w.size * 1.24)}px` });
  w.word = w.mask.firstChild; w.word.style.top = '8px';
}
// 2 : 1 stones (Rs. 2,30,00,000 : Rs. 1,15,00,000), the P4 stones returning; rects [x, topFace y, w, frontH]
const STONES = [
  { cls: 'clay', label: 'A', light: [1.28, 0.58], at: { k7: [1118, 820, 120, 180], k8: [1080, 842, 110, 140], k9: [1110, 820, 120, 180] }, rise: 300 },
  { cls: 'char', label: 'B', light: [1.7, 0.7], at: { k7: [1296, 910, 120, 90], k8: [1250, 912, 110, 70], k9: [1290, 910, 120, 90] }, rise: 200 },
].map((s) => { const e = div(`stone`, `<i class="${s.cls} front"></i><i class="${s.cls} top"></i><i class="${s.cls} side"></i><b>${s.label}</b>`, $('stones')); return { ...s, e, front: e.children[0], top: e.children[1], side: e.children[2], b: e.children[3] }; });

const pConflict = $('panel-conflict'), pFact = $('panel-fact');
pConflict.innerHTML = window.Panels.conflict(); pFact.innerHTML = window.Panels.materialFactB();
const FACT_AT = { x: 1036, y: 250, s: 1.28 };
pFact.style.transform = 'none'; pFact.style.display = '';
const localRect = (node, host) => { const a = node.getBoundingClientRect(), b = host.getBoundingClientRect(); return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; };
const CARD = localRect(pFact.querySelector('#src-order'), pFact), FACT_H = pFact.offsetHeight;
const PREVIEW = { x: 440, y: 250, w: 580, h: 800 };
// cited passage on order p1 (1100-px raster × 682/1100): "For this" + the line with Rs. 1,15,00,000/-
const PK = 682 / 1100, HL = [[754.6, 618.0, 814.6, 644.0], [118.3, 646.6, 824.0, 672.6]];
HL.forEach(([a, b, c, d], i) => Object.assign($(`hl-${i + 1}`).style, { left: `${a * PK}px`, top: `${b * PK}px`, width: `${(c - a) * PK}px`, height: `${(d - b) * PK}px` }));

/* =============================================================== renderAt */
function weightOf(c, at) { // presence and position of a keyed piece under the current camera
  const wa = at[c.a] ? 1 : 0, wb = at[c.b] ? 1 : 0, w = c.a === c.b ? wa : (1 - c.u) * wa + c.u * wb;
  const r = at[c.a] && at[c.b] ? at[c.a].map((v, i) => lerp(v, at[c.b][i], c.u)) : (at[c.a] || at[c.b]);
  return { w, r };
}

function renderAt(t) {
  const c = camAt(t), st = mapState(t);
  renderState(st);

  /* the slab from section 2 leaves to the left, leaving a sliver until the Conflicts move */
  const sx = t < 33.5 ? lerp(-470, -1840, EZ('power3.out')(seg(t, 33.1, 33.5))) : lerp(-1840, -2200, tw(t, 34.36, 34.8, 'power2.in'));
  show($('slab-layer'), sx + 1900 > 0);
  $('slab').style.transform = `translateX(${sx.toFixed(1)}px)`;
  $('bug').style.opacity = tw(t, 33.35, 33.55).toFixed(3);
  $('bug').style.top = `${lerp(36, 150, c.weight('k9')).toFixed(1)}px`;

  /* collage and pencil guides follow the keyframes; the d05 set also has its intro */
  const intro = tw(t, 33.2, 33.55, 'expo.out');
  DECOR.forEach((d) => {
    const { w, r } = weightOf(c, d.at);
    let vis = w * (d.at.k5 ? intro + (1 - intro) * (c.a !== 'k5' ? 1 : 0) : 1);
    if (!show(d.e, vis > 0.002 && r)) return;
    const cx = r[0] + r[2] / 2 - 720, cy = r[1] + r[3] / 2 - 500, n = Math.hypot(cx, cy) || 1, off = (1 - vis) * 90;
    Object.assign(d.e.style, { width: `${r[2]}px`, height: `${r[3]}px`, transform: `translate(${(r[0] + cx / n * off).toFixed(1)}px, ${(r[1] + cy / n * off).toFixed(1)}px)`, opacity: Math.min(1, vis * 1.4).toFixed(3) });
  });
  Object.entries(guides).forEach(([k, g]) => {
    const w = c.weight(k), u = k === 'k5' ? tw(t, 33.15, 33.5, 'power2.out') : 1;
    g.setAttribute('stroke-dasharray', '1 1'); g.setAttribute('stroke-dashoffset', (1 - u).toFixed(4)); g.style.opacity = (0.55 * w).toFixed(3);
  });

  /* editorial words, each set on its spoken word */
  Object.values(WORDS).forEach((w) => {
    const u = tw(t, w.in[0], w.in[1], 'expo.out'), o = tw(t, w.out[0], w.out[1], 'power2.in');
    if (show(w.mask, u > 0 && o < 1)) w.word.style.transform = `translateY(${(lerp(118, 0, u) - 118 * o).toFixed(2)}%)`;
  });

  /* the map window: one camera through the five framings; d05 rises in */
  const rise = 160 * (1 - tw(t, T0, 33.55, 'expo.out'));
  const win = $('map-window');
  Object.assign(win.style, { width: `${c.w.toFixed(1)}px`, height: `${c.h.toFixed(1)}px`, transform: `translate(${c.x.toFixed(2)}px, ${(c.y + rise).toFixed(2)}px)` });
  mapInner.style.transform = `translate(0px, ${c.dy.toFixed(2)}px) scale(${c.s.toFixed(4)})`;
  toolbar.style.width = `${(c.w / c.s).toFixed(1)}px`;
  Object.assign(canvas.style, { width: `${(c.w / c.s).toFixed(1)}px`, height: `${(c.h / c.s - 44 - c.dy / c.s).toFixed(1)}px` });
  world.style.transform = `translate(${c.ox.toFixed(2)}px, ${c.oy.toFixed(2)}px)`;
  world.querySelectorAll('.edge').forEach((e) => { const k = EDGE_T[e.id]; const u = k ? tw(t, k[0], k[0] + k[1], 'power2.out') : 1; e.setAttribute('stroke-dashoffset', (1 - u).toFixed(4)); e.style.opacity = u > 0 ? 1 : 0; });
  const matter = $('cm-matter'), mp = tw(t, 33.3, 33.46, 'back.out(1.6)');
  matter.style.opacity = seg(t, 33.3, 33.38).toFixed(3); matter.style.transform = `scale(${lerp(0.88, 1, mp).toFixed(4)})`;
  Object.entries(NODE_T).forEach(([id, [a, d]]) => {
    const n = $(`cm-${id}`); if (!n) return;
    const u = EZ('power2.out')(seg(t, a, a + d));
    n.style.opacity = u.toFixed(3); n.style.transform = `translateX(${((RIGHT.has(id) ? -14 : 14) * (1 - u)).toFixed(2)}px)`;
  });
  const sc = { x: 0, y: rise }; // screen-space shift of the rising window
  const at = (p) => { const q = toScreen(c, p); return { x: q.x + sc.x, y: q.y + sc.y }; };
  const nodeBox = (id, pad = 0) => { const b = box(id), p0 = at({ x: b.x, y: b.y }), p1 = at({ x: b.x + b.w, y: b.y + b.h }); return { x0: p0.x - pad, y0: p0.y - pad, x1: p1.x + pad, y1: p1.y + pad }; };

  /* stones rise under the Conflict panel (D7) and stay through Verify */
  STONES.forEach((s) => {
    const { w, r } = weightOf(c, s.at), up = tw(t, 35.1, 35.5, 'power3.out');
    const rr = r || s.at.k7;
    if (!show(s.e, up > 0)) return;
    const [x, y0, sw, fh] = rr, y = y0 + s.rise * (1 - up), k9 = c.weight('k9');
    Object.assign(s.front.style, { left: `${x}px`, top: `${y + 30}px`, width: `${sw}px`, height: `${fh + 20}px`, filter: s.label === 'A' ? `saturate(${lerp(1, 0.7, k9)}) brightness(${lerp(1, 0.92, k9)})` : '', boxShadow: s.label === 'B' ? `0 0 0 ${(2 * k9).toFixed(2)}px #c94820` : '' });
    Object.assign(s.top.style, { left: `${x}px`, top: `${y}px`, width: `${sw + 36}px`, height: '30px', clipPath: `polygon(0 30px, ${sw}px 30px, ${sw + 36}px 0, 36px 0)`, filter: `brightness(${s.light[0]})` });
    Object.assign(s.side.style, { left: `${x + sw}px`, top: `${y}px`, width: '36px', height: `${fh + 50}px`, clipPath: `polygon(0 30px, 36px 0, 36px ${fh + 50}px, 0 ${fh + 50}px)`, filter: `brightness(${s.light[1]})` });
    Object.assign(s.b.style, { left: `${x + 14}px`, top: `${y + 46}px` });
    void w;
  });

  /* panels: Conflict (D7–D8), then the same place hands over to Material fact (D9) */
  {
    const inC = tw(t, 35.05, 35.42, 'expo.out'), outC = tw(t, CLICK.versionB, CLICK.versionB + 0.12, 'power2.in');
    const wk8 = c.weight('k8') + c.weight('k9'), px = lerp(1080, 1004, Math.min(1, wk8)), py = lerp(96, 118, Math.min(1, wk8));
    if (show(pConflict, inC > 0 && outC < 1)) { pConflict.style.transform = `translate(${(px + 300 * (1 - inC) + 40 * outC).toFixed(1)}px, ${py.toFixed(1)}px) scale(1.35)`; pConflict.style.opacity = (Math.min(1, inC * 2) * (1 - outC)).toFixed(3); }
    const inF = tw(t, CLICK.versionB + 0.12, CLICK.versionB + 0.42, 'expo.out');
    if (show(pFact, inF > 0)) { pFact.style.transform = `translate(${FACT_AT.x}px, ${(FACT_AT.y + 24 * (1 - inF)).toFixed(1)}px) scale(${FACT_AT.s})`; pFact.style.opacity = inF.toFixed(3); }
    const vn = $('verify-note');
    if (show(vn, t >= 37.45)) { vn.style.transform = `translate(${FACT_AT.x}px, ${(FACT_AT.y + FACT_H * FACT_AT.s + 14).toFixed(1)}px)`; vn.style.opacity = seg(t, 37.45, 37.6).toFixed(3); }
  }

  /* the source preview opens out of the source card (D9) */
  const cardS = { x: FACT_AT.x + CARD.x * FACT_AT.s, y: FACT_AT.y + CARD.y * FACT_AT.s, w: CARD.w * FACT_AT.s, h: CARD.h * FACT_AT.s };
  const op = tw(t, 36.98, 37.32, 'expo.out'), pv = $('preview');
  if (show(pv, op > 0)) {
    const s0 = cardS.w / PREVIEW.w, s = lerp(s0, 1, op);
    pv.style.transform = `translate(${lerp(cardS.x, PREVIEW.x, op).toFixed(1)}px, ${lerp(cardS.y, PREVIEW.y, op).toFixed(1)}px) scale(${s.toFixed(4)})`;
    pv.style.opacity = Math.min(1, op * 3).toFixed(3);
    ['hl-1', 'hl-2'].forEach((id, i) => { $(id).style.transform = `scaleX(${tw(t, 37.28 + i * 0.06, 37.44 + i * 0.06, 'power2.out').toFixed(3)})`; });
  }

  /* thread: off the slab onto the matter chip (D5); later Version B → passage → source card (D9) */
  let thread = '', dot = 0;
  if (t < 34.5) {
    const m = nodeBox('matter'), end = { x: (m.x0 + m.x1) / 2, y: m.y1 };
    thread = drawn(cubicAt({ x: -20, y: 892 }, { x: 300, y: 892 }, { x: 560, y: m.y1 + 72 }, end, 48), tw(t, 33.3, 33.62, 'power2.inOut'));
    dot = 4.5 * seg(t, 33.6, 33.66);
    $('thread-dot').setAttribute('cx', end.x.toFixed(1)); $('thread-dot').setAttribute('cy', end.y.toFixed(1));
    $('thread').style.opacity = (1 - seg(t, 34.36, 34.5)).toFixed(3);
  } else if (t >= 37.3) {
    const b = nodeBox('versionB'), from = { x: b.x1 + 4, y: (b.y0 + b.y1) / 2 };
    const hx0 = PREVIEW.x - 55 + 73, hy = PREVIEW.y - 106 + 409, hx1 = PREVIEW.x - 55 + 511, card = { x: cardS.x, y: cardS.y + 30 };
    const a1 = cubicAt(from, { x: from.x + 70, y: from.y }, { x: hx0 - 70, y: hy + 10 }, { x: hx0 - 8, y: hy + 10 }, 36);
    const a2 = cubicAt({ x: hx1 + 6, y: hy + 10 }, { x: hx1 + 220, y: hy + 10 }, { x: card.x - 140, y: card.y }, card, 36);
    const u = tw(t, 37.4, 37.85, 'power1.inOut');
    thread = drawn(a1, u * 2) + drawn(a2, u * 2 - 1);
    $('thread').style.opacity = 1;
  }
  $('thread').setAttribute('d', thread); $('thread-dot').setAttribute('r', (t < 34.5 ? dot : 0).toFixed(2));

  /* focal marks: matter chip → the new conflict pair → Version A/B → (none on Frame C) → the cited passage */
  let f = '';
  if (t >= 33.58 && t < CLICK.conflicts) { const k = lerp(1.5, 1, tw(t, 33.58, 33.8, 'expo.out')); const m = scaleBox(nodeBox('matter', 12), k); f = corners(m.x0, m.y0, m.x1, m.y1, 18); }
  else if (t >= 34.72 && t < 35.28) { const a = nodeBox('amount', 14), d = nodeBox('duedate', 14), k = lerp(1.3, 1, tw(t, 34.72, 34.92, 'expo.out')); const q = scaleBox({ x0: a.x0, y0: a.y0, x1: a.x1, y1: d.y1 }, k); f = corners(q.x0, q.y0, q.x1, q.y1, 22); }
  else if (t >= 35.28 && t < 35.55) { const a = nodeBox('versionA', 16), b = nodeBox('versionB', 16), k = lerp(1.3, 1, tw(t, 35.28, 35.46, 'expo.out')); const q = scaleBox({ x0: a.x0, y0: a.y0, x1: a.x1, y1: b.y1 }, k); f = corners(q.x0, q.y0, q.x1, q.y1, 24); }
  else if (t >= 37.3) { const k = lerp(1.3, 1, tw(t, 37.3, 37.5, 'expo.out')); const q = scaleBox({ x0: PREVIEW.x - 55 + 73 - 14, y0: PREVIEW.y - 106 + 383 - 14, x1: PREVIEW.x - 55 + 511 + 14, y1: PREVIEW.y - 106 + 417 + 14 }, k); f = corners(q.x0, q.y0, q.x1, q.y1); }
  $('focal').setAttribute('d', f);

  /* the cursor: Conflicts (34.32) → Amount outstanding (34.97) → away for Compare → Version B (36.68) */
  const pt = (id, dx) => { const b = box(id); return at({ x: b.x + dx, y: b.y + b.h / 2 }); };
  const pC = pt('conflicts', 70), pA = pt('amount', 70), pB = pt('versionB', 150);
  let cur = null, co = 1;
  if (t >= 33.85 && t < 35.6) {
    if (t < 34.55) cur = { x: lerp(560, pC.x, tw(t, 33.85, 34.2, 'power2.out')), y: lerp(1030, pC.y, tw(t, 33.85, 34.2, 'power2.out')) };
    else { const u = tw(t, 34.55, 34.9, 'power2.inOut'); cur = { x: lerp(pC.x, pA.x, u), y: lerp(pC.y, pA.y, u) }; }
    co = 1 - seg(t, 35.4, 35.6);
  } else if (t >= 36.2 && t < 37.0) {
    const u = tw(t, 36.2, 36.6, 'power2.out'); cur = { x: lerp(pB.x + 140, pB.x, u), y: lerp(pB.y + 150, pB.y, u) };
    co = seg(t, 36.2, 36.3) * (1 - seg(t, 36.86, 37.0));
  }
  if (show($('cursor'), !!cur)) { $('cursor').style.transform = `translate(${(cur.x - 2).toFixed(1)}px, ${(cur.y - 2).toFixed(1)}px)`; $('cursor').style.opacity = co.toFixed(3); }
  let ring = 0, rp = null;
  Object.values(CLICK).forEach((tc) => { const u = seg(t, tc, tc + 0.35); if (u > 0 && u < 1) { ring = u; rp = cur; } });
  const cr = $('click-ring');
  if (rp) { cr.setAttribute('cx', rp.x.toFixed(1)); cr.setAttribute('cy', rp.y.toFixed(1)); cr.setAttribute('r', lerp(8, 28, EZ('expo.out')(ring)).toFixed(2)); cr.style.opacity = (0.6 * (1 - ring)).toFixed(3); } else cr.setAttribute('r', 0);
}

/* ------------------------------------------------------------- web cut */
// The web cut drives renderAt through its own time map (src/web.js); no timeline here.
renderAt(T0);
export { renderAt, T0 };

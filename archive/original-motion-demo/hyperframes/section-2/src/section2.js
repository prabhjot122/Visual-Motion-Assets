/* LawVriksh graphics track — section 2, from global reel time 24.80 s.
 *
 * Composition time 0 = reel 24.80 s (the frame after the approved pilot's last
 * frame, 24.7667). renderAt(t) takes GLOBAL reel seconds and is a pure function
 * of time: one paused GSAP timeline, seeded randomness, no clocks, no network.
 *
 * D1–D2 (24.80–28.70) are pure motion graphics (user direction, 22 Oct): the
 * app's own PDF icons, each carrying its real file name, drop through the clay
 * line and run a geometric processing line — Read → Recognise → Structure →
 * Extract — and the five real seed facts come off the end as tags hung on the
 * thread. A concept of the flow, never a claim about a live run: no app chrome,
 * no percentages, no spinners.
 *
 * D3–D5 (28.56–33.13) follow the approved stills d03, d04, d05: a char slab
 * carries in the separate Arif Jafar scan (saved OCR issue, local replay, labelled),
 * the single-word correction is saved, the slab takes the scan away, and the
 * Arora Case Map arrives collapsed with "Mapped." (Case Map rebuilt by the stills'
 * own lib/casemap.js; counts match the live app capture of 22 Oct).
 */
const ID = 'section-2';
const T0 = 24.8, DUR = 8.3333; // 250 frames at 30 fps: 24.8000–33.1000; the reel's 33.130 jump cut falls before frame 994
const gsap = window.gsap;
const EZ = (name) => gsap.parseEase(name);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const tw = (t, a, b, e = 'power2.inOut') => EZ(e)(seg(t, a, b));
const $ = (id) => document.getElementById(id);
const SVGNS = 'http://www.w3.org/2000/svg';

function rng(seed) { // mulberry32
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function el(tag, attrs = {}, parent) { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; }
function div(cls, html = '', parent) { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; parent.appendChild(d); return d; }
const show = (node, on) => { node.style.display = on ? '' : 'none'; return on; };
function corners(x0, y0, x1, y1, L = 18) {
  return `M${x0} ${y0 + L}V${y0}H${x0 + L}M${x1 - L} ${y0}H${x1}V${y0 + L}M${x1} ${y1 - L}V${y1}H${x1 - L}M${x0 + L} ${y1}H${x0}V${y1 - L}`;
}

await Promise.all(['400 100px "Newsreader"', '500 100px "Newsreader"', 'italic 400 100px "Newsreader"', '400 30px "Instrument Serif"', 'italic 400 30px "Instrument Serif"', '500 13px "Figtree"']
  .map((f) => document.fonts.load(f)));
await document.fonts.ready;

/* ------------------------------------------------------------ geometry */
const RAIL_Y = 430, LAND_X = 272, RAIL_X0 = 196;
const GS = 1.27, OS = 1.35; // gate and object scale: the line fills the surface
const GATES = [
  { x: 460, name: 'Read', tex: 'char' },
  { x: 690, name: 'Recognise', tex: 'halftone' },
  { x: 920, name: 'Structure', tex: 'sand' },
  { x: 1150, name: 'Extract', tex: 'clay' },
];
const DOCS = [ // real file names from the seed (src/mocks/data/corpus.ts)
  { name: 'Development Agreement — 03 Feb 2023 (registered).pdf', short: 'Agreement', pages: ['arora-agreement-page1', 'arora-agreement-page2'], facts: [0, 1] },
  { name: 'Notice invoking arbitration — 14 Mar 2026.pdf', short: 'Notice', pages: ['arora-notice-page1', 'arora-notice-page2'], facts: [2, 3] },
  { name: 'Interim order under Section 9 — 18 Jul 2026.pdf', short: 'Interim order', pages: ['arora-order-page1'], facts: [4] },
];
const FACTS = [ // seed values and source pages
  { k: 'Date of agreement', v: '3 February 2023', src: 'Agreement · p1' },
  { k: 'Total consideration', v: 'Rs. 4,60,00,000', src: 'Agreement · p2' },
  { k: 'Date of possession', v: '22 February 2023', src: 'Notice · p1' },
  { k: 'Amount outstanding', v: 'Rs. 2,30,00,000', src: 'Notice · p2', conflict: true },
  { k: 'Amount outstanding', v: 'Rs. 1,15,00,000', src: 'Order · p1', conflict: true },
];
// Timing: one drop every 0.36 s; each gate is a 0.30 s stamp. The last document
// is extracted at 27.24, on "…facts extract karega" (27.17).
const FALL = 0.32, STEP = 0.30;
const S = DOCS.map((_, i) => 24.92 + i * 0.36);   // drop starts
const L = S.map((s) => s + FALL);                    // landings on the rail
const G = L.map((l) => GATES.map((_, k) => l + 0.38 + k * STEP)); // gate centre times
const CROSS = S.map((s) => s + FALL * (1 + Math.log2(290 / (RAIL_Y + 140)) / 10)); // icon centre crosses the clay line (expo.in)
const LIFT_T = [27.5, 27.95], LIFT = -80;          // the finished line rises to centre for the read
const TAG_TOP = 560, slotLeft = (j) => 200 + j * 218;

/* ------------------------------------------------------------- build */
const objects = $('objects'), gatesL = $('gates'), tagsL = $('tags'), railG = $('rail-g');
const rail = el('path', {}, railG);
const ticks = FACTS.map(() => el('path', { pathLength: 1, 'stroke-dasharray': '1 1' }, railG));
const knots = FACTS.map(() => el('circle', { r: 0, fill: '#c4562e', stroke: 'none' }, railG));

const gateEls = GATES.map((g) => {
  const e = div('gate', `<i class="${g.tex} ft"></i><i class="${g.tex} fr"></i><i class="${g.tex} fb"></i><i class="${g.tex} fl"></i><i class="rim"></i><i class="flash"></i>`, gatesL);
  return { e, flash: e.querySelector('.flash'), label: div('glabel', g.name, gatesL) };
});

const objs = DOCS.map((d, i) => {
  const r = rng(300 + i);
  const e = div('obj', '', objects);
  const pdf = div('pdf', `<img src="assets/icons/pdf.svg" alt=""><div class="fname">${d.name.replace(' — ', ' —<br>')}</div>`, e);
  const fan = div('fan', d.pages.map((p, j) => `<div class="pg" style="left:${92 + j * 18 - (d.pages.length - 1) * 9}px; top:${10 + j * 5}px; transform:rotate(${(j - (d.pages.length - 1) / 2) * 9}deg); background-image:url(assets/docs/${p}.png)"></div>`).join('') + `<div class="cap">${d.short}</div>`, e);
  let rects = ''; // recognised glyphs: rows of small marks, ink with ochre and clay
  for (let row = 0; row < 8; row++) for (let col = 0; col < 10; col++) {
    if (r() < 0.16 || (row % 3 === 2 && col > 6)) continue;
    const s = 4 + r() * 3.5, c = r() < 0.08 ? '#c94820' : r() < 0.25 ? '#b9862f' : '#2b2522';
    rects += `<rect x="${col * 8.4 + (8 - s) / 2}" y="${row * 10.6 + (8 - s) / 2}" width="${s.toFixed(1)}" height="${s.toFixed(1)}" fill="${c}" opacity="${(0.55 + r() * 0.4).toFixed(2)}"/>`;
  }
  const glyph = div('glyph', `<svg style="position:absolute;left:78px;top:10px" width="84" height="86" viewBox="0 0 84 86">${rects}</svg><div class="cap">${d.short}</div>`, e);
  const hits = d.facts.length === 2 ? [2, 5] : [4];
  let bars = '';
  for (let b = 0; b < 9; b++) bars += `<i class="${hits.includes(b) ? 'hit' : ''}" style="top:${10 + b * 9}px; width:${(hits.includes(b) ? 56 : 30 + r() * 28).toFixed(0)}px"></i>`;
  const barsEl = div('struct', `<div class="bars">${bars}</div><div class="cap">${d.short}</div>`, e);
  // particles thrown off at each gate
  const parts = GATES.map((_, k) => Array.from({ length: 11 }, () => {
    const p = div('p', '', objects);
    const size = 3 + r() * 5;
    Object.assign(p.style, { width: `${size}px`, height: `${size}px`, background: ['#2b2522', '#c94820', '#b9862f', '#9a8f80'][Math.floor(r() * 4)] });
    return { p, vx: lerp(70, 260, r()), vy: lerp(-170, 170, r()), life: lerp(0.3, 0.55, r()), rot: lerp(-200, 200, r()) };
  }));
  return { e, reps: [pdf, fan, glyph, barsEl], parts, tilt: i % 2 ? 14 : -12 };
});

const tags = FACTS.map((f, j) => {
  const e = div(`fact${f.conflict ? ' conflict' : ''}`, `<div class="body"><div class="k">${f.k}</div><div class="v">${f.v}</div><div class="src">${f.src}</div></div><div class="wash"></div>`, tagsL);
  return { e, body: e.querySelector('.body'), wash: e.querySelector('.wash'), h: e.offsetHeight, x: slotLeft(j) };
});
const tagOf = []; DOCS.forEach((d, i) => d.facts.forEach((j, m) => { tagOf[j] = { i, m }; }));

/* --------------------------------------------------------- object path */
function objX(t, i) {
  const g = G[i];
  if (t < L[i] + 0.1) return LAND_X;
  if (t < g[0]) return lerp(LAND_X, GATES[0].x, EZ('power2.in')(seg(t, L[i] + 0.1, g[0])));
  for (let k = 0; k < 3; k++) if (t < g[k + 1]) return lerp(GATES[k].x, GATES[k + 1].x, EZ('sine.inOut')(seg(t, g[k], g[k + 1])));
  return GATES[3].x;
}
const pulse = (dt, len = 0.22) => (dt >= 0 && dt <= len ? Math.sin(Math.PI * dt / len) : 0);

/* ------------------------------------------------- D3–D5 build */
const SWAP_IN = 28.74, SWAP_OUT = 33.1; // the slab covers the whole frame at these instants (33.10 = the last frame before the 33.13 cut)
// D3–D4 run to the cut (user, 22 Oct): the Case Map is first seen after 33 s, in the next section.
const OCR = { snap: 29.74, highlight: 30.4, del: [31.0, 31.2], type: [31.2, 31.5], save: 31.62, flip: [31.75, 32.15], out: 32.9 };
const MAP_DT = SWAP_OUT - 31.0; // the Case Map build keeps its d05 timings, shifted to start at the cover
// Char slab: x = its bottom-left edge (the face leans 114 px at the top). Keys: [t, x, ease into the key].
const SLAB = [[28.56, 1460], [SWAP_IN, -470, 'power2.in'], [29.05, 1040, 'expo.out'], [OCR.flip[0], 1040], [OCR.flip[1] - 0.1, 1220, 'power2.inOut'], [OCR.out, 1220], [SWAP_OUT, -470, 'power2.in'], [SWAP_OUT + 0.36, -1840, 'expo.out'], [SWAP_OUT + 2.2, -1890, 'sine.inOut']];
function keyed(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) { const a = keys[i], b = keys[i + 1]; if (t < b[0]) return lerp(a[1], b[1], EZ(b[2] || 'none')(seg(t, a[0], b[0]))); }
  return keys.at(-1)[1];
}
// The scan's two poses (d03 → d04): screen = T + R(r)·(s·q) for q in 1600-px scan space.
const SCAN3 = { x: -520, y: -650, s: 1, r: 0 }, SCAN4 = { x: -578.65, y: -410.95, s: 0.75, r: -1.2 };
const BOX = [1261, 1181, 1392, 1239]; // the saved OCR box for "brlies" on page 2
const scanPose = (u) => ({ x: lerp(SCAN3.x, SCAN4.x, u), y: lerp(SCAN3.y, SCAN4.y, u), s: lerp(SCAN3.s, SCAN4.s, u), r: lerp(SCAN3.r, SCAN4.r, u) });
const scanPt = (p, qx, qy) => { const a = p.r * Math.PI / 180, X = qx * p.s, Y = qy * p.s; return { x: p.x + X * Math.cos(a) - Y * Math.sin(a), y: p.y + X * Math.sin(a) + Y * Math.cos(a) }; };
const ISSUES_AT = { x: 1066, y: 150, s: 1.2 }, EDITOR_AT = { x: 690, y: 230, s: 1.18 };
// Element-local layout of the two targets the thread ties to, measured once untransformed.
const localRect = (node, host) => { const a = node.getBoundingClientRect(), b = host.getBoundingClientRect(); return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; };
$('ocr').style.display = ''; $('ocr-front').style.display = ''; $('issues').style.transform = 'none'; $('editor').style.transform = 'none';
const TA = localRect($('ta-brlies'), $('issues')), WORD = localRect($('word-parties'), $('editor'));
const qualA = $('qual-a'), qualB = $('qual-b');

// D5: the Case Map, exactly as the d05 still builds it.
const MAP = { x: 150, y: 300, s: 1.08, ox: 602, oy: 300 };
const mapInner = $('map-inner');
const mapWorld = window.CaseMap.chrome(mapInner, { w: 1204, h: 815, crumbs: ['Arora v. Meridian Estates Pvt. Ltd.'] });
window.CaseMap.renderMap(mapWorld, { path: [], ox: MAP.ox, oy: MAP.oy, k: 1 });
mapInner.style.transform = `scale(${MAP.s})`;
const MATTER = window.CaseMap.box([], 'matter');
const CATS = ['parties', 'facts', 'advocates', 'evidence', 'issues', 'arguments', 'provisions', 'reliefs', 'conflicts']; // alternate sides, top to bottom
const mapEdges = CATS.map((id, i) => { const e = $(`e-matter-${id}`); e.setAttribute('pathLength', 1); e.setAttribute('stroke-dasharray', '1 1'); return { e, chip: $(`cm-${id}`), left: !['facts', 'evidence', 'arguments', 'reliefs'].includes(id), t0: 31.66 + i * 0.04 }; });
const matterChip = $('cm-matter');

/* =============================================================== renderAt */
function renderAt(t) {
  show($('stage'), t < SWAP_IN); show($('ink'), t < SWAP_IN);
  renderLater(t);
  const lift = LIFT * tw(t, LIFT_T[0], LIFT_T[1], 'power3.inOut');
  $('pipe').style.transform = `translateY(${lift.toFixed(2)}px)`;

  /* the clay line: top edge of the surface, rippling as each document drops through it */
  let d = '';
  for (let x = 160; x <= 1280; x += 8) {
    let y = 150;
    CROSS.forEach((c) => { const tau = t - c; if (tau > -0.04) { const a = 26 * Math.exp(-Math.max(tau, 0) * 7) * Math.cos(Math.max(tau, 0) * 26) * (tau < 0 ? (tau + 0.04) / 0.04 : 1); y += a * Math.exp(-(((x - LAND_X) / 75) ** 2)); } });
    d += `${x === 160 ? 'M' : 'L'}${x} ${y.toFixed(2)}`;
  }
  $('topline').setAttribute('d', d);

  /* the rail (the thread), drawn out from the drop column; gates become its nodes */
  const railEnd = lerp(RAIL_X0, 1460, tw(t, 24.84, 25.3, 'power3.out'));
  rail.setAttribute('d', railEnd > RAIL_X0 + 1 ? `M${RAIL_X0} ${RAIL_Y} H ${railEnd.toFixed(1)}` : '');

  /* gates rise as diamonds and square up; each stamp pulses; they collapse into rail nodes */
  GATES.forEach((g, k) => {
    const a = 24.98 + k * 0.07, c = 27.4 + k * 0.05;
    const up = EZ('back.out(1.7)')(seg(t, a, a + 0.38)), turn = tw(t, a, a + 0.42, 'expo.out'), down = tw(t, c, c + 0.26, 'power3.in');
    let p = 0; G.forEach((gi) => { p = Math.max(p, pulse(t - gi[k])); });
    const s = up * (1 - down) * (1 + 0.08 * p);
    const { e, flash, label } = gateEls[k];
    if (show(e, s > 0.002)) {
      e.style.transform = `translate(${g.x - 75}px, ${RAIL_Y - 75}px) rotate(${lerp(45, 0, turn).toFixed(2)}deg) scale(${(s * GS).toFixed(4)})`;
      flash.style.opacity = p.toFixed(3);
    }
    const lo = Math.min(1, seg(t, a + 0.15, a + 0.4)) * (1 - seg(t, c - 0.1, c + 0.05));
    if (show(label, lo > 0)) { label.style.transform = `translate(${g.x - 80}px, ${RAIL_Y - 75 * GS - 34 + (1 - lo) * 8}px)`; label.style.opacity = lo.toFixed(3); }
  });

  /* documents: drop, land, run the line; the representation changes inside each gate */
  objs.forEach((o, i) => {
    const vis = t >= S[i] && t < G[i][3] + 0.06;
    if (!show(o.e, vis)) return;
    const fall = EZ('expo.in')(seg(t, S[i], L[i]));
    const x = objX(t, i), y = t < L[i] ? lerp(-140, RAIL_Y, fall) : RAIL_Y;
    let sx = OS, sy = OS;
    const q = seg(t, L[i], L[i] + 0.2); if (q > 0 && q < 1) { const b = Math.sin(Math.PI * q) * (1 - q); sx *= 1 + 0.12 * b; sy *= 1 - 0.18 * b; }
    G[i].forEach((gk) => { const dd = Math.abs(t - gk); if (dd < 0.13) { const w = 0.5 + 0.5 * Math.cos(Math.PI * dd / 0.13); sx *= 1 - 0.55 * w; sy *= 1 - 0.55 * w; } });
    const stage = G[i].filter((gk) => t >= gk).length;
    o.reps.forEach((r, k) => { r.style.display = k === stage ? 'block' : 'none'; });
    const rot = t < L[i] ? lerp(o.tilt, 0, fall) : 0;
    o.e.style.transform = `translate(${(x - 120).toFixed(2)}px, ${(y - 52).toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
  });
  // particles leave each gate with the document
  objs.forEach((o, i) => o.parts.forEach((list, k) => list.forEach((p) => {
    const tau = t - G[i][k];
    if (!show(p.p, tau >= 0 && tau < p.life)) return;
    const px = GATES[k].x + 26 * GS + p.vx * tau, py = RAIL_Y + p.vy * tau + 160 * tau * tau;
    p.p.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) rotate(${(p.rot * tau).toFixed(1)}deg)`;
    p.p.style.opacity = (1 - tau / p.life).toFixed(3);
  })));

  /* facts: the extracted line leaves the last gate as a clay bar and opens into its tag */
  tags.forEach((g, j) => {
    const { i, m } = tagOf[j], T = G[i][3] + 0.04 + m * 0.1, u = seg(t, T, T + 0.55);
    if (!show(g.e, t >= T)) { ticks[j].style.opacity = 0; return; }
    const e = EZ('expo.out')(u);
    const cx = lerp(GATES[3].x, g.x + 103, e), cy = lerp(RAIL_Y, TAG_TOP + g.h / 2, e) - 120 * Math.sin(Math.PI * e);
    const sx = lerp(0.4, 1, EZ('power3.out')(seg(u, 0, 0.5))), sy = lerp(0.05, 1, EZ('expo.out')(seg(u, 0.42, 0.85)));
    g.e.style.transform = `translate(${(cx - 103).toFixed(2)}px, ${(cy - g.h / 2).toFixed(2)}px) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
    g.wash.style.opacity = (1 - seg(u, 0.5, 0.78)).toFixed(3);
    g.body.style.opacity = seg(u, 0.6, 0.9).toFixed(3);
    // hung on the thread once the gates have gone
    const tu = tw(t, 27.62 + j * 0.04, 27.84 + j * 0.04, 'power2.out');
    ticks[j].setAttribute('d', `M${g.x + 103} ${RAIL_Y} V ${TAG_TOP}`);
    ticks[j].setAttribute('stroke-dashoffset', (1 - tu).toFixed(4)); ticks[j].style.opacity = tu > 0 ? 1 : 0;
    knots[j].setAttribute('cx', g.x + 103); knots[j].setAttribute('cy', RAIL_Y); knots[j].setAttribute('r', (4.5 * seg(t, 27.6 + j * 0.04, 27.7 + j * 0.04)).toFixed(2));
  });

  /* one focal frame at a time: each landing, then the extract gate, then the two conflicting amounts */
  let f = '', fo = 0;
  L.forEach((l, i) => {
    if (t >= l && t < l + 0.4) { const k = lerp(1.5, 1, tw(t, l, l + 0.22, 'expo.out')), w = 54 * k, h = 52 * k; f = corners(LAND_X - w * OS, RAIL_Y - 6 - h * OS, LAND_X + w * OS, RAIL_Y - 6 + h * OS); fo = 1 - seg(t, l + 0.3, l + 0.4); }
  });
  if (t >= 26.42 && t < 27.45) { const k = lerp(1.4, 1, tw(t, 26.42, 26.66, 'expo.out')), r = 90 * GS * k; f = corners(GATES[3].x - r, RAIL_Y - r, GATES[3].x + r, RAIL_Y + r, 20); fo = 1 - seg(t, 27.36, 27.45); }
  if (t >= 27.95) {
    const a = tags[3], b = tags[4], k = lerp(1.25, 1, tw(t, 27.95, 28.2, 'expo.out'));
    const x0 = a.x - 14, x1 = b.x + 206 + 14, y0 = TAG_TOP + lift - 14, y1 = TAG_TOP + lift + Math.max(a.h, b.h) + 14, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    f = corners(cx + (x0 - cx) * k, cy + (y0 - cy) * k, cx + (x1 - cx) * k, cy + (y1 - cy) * k); fo = 1;
  }
  $('focal').setAttribute('d', f); $('focal').style.opacity = fo.toFixed(3);
}

/* ---- D3–D5 ------------------------------------------------------------------ */
function cubicAt(p0, c1, c2, p1, n = 40) { const out = []; for (let i = 0; i <= n; i++) { const u = i / n, m = 1 - u; out.push({ x: m * m * m * p0.x + 3 * m * m * u * c1.x + 3 * m * u * u * c2.x + u * u * u * p1.x, y: m * m * m * p0.y + 3 * m * m * u * c1.y + 3 * m * u * u * c2.y + u * u * u * p1.y }); } return out; }
const polyD = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('');
const lerpBox = (a, b, u) => ({ x0: lerp(a.x0, b.x0, u), y0: lerp(a.y0, b.y0, u), x1: lerp(a.x1, b.x1, u), y1: lerp(a.y1, b.y1, u) });
const scaleBox = (b, k) => { const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2; return { x0: cx + (b.x0 - cx) * k, y0: cy + (b.y0 - cy) * k, x1: cx + (b.x1 - cx) * k, y1: cy + (b.y1 - cy) * k }; };

function renderLater(t) {
  /* the char slab: in from the right, covers, parks; at the cut it covers again and leaves to the left */
  const sx = keyed(SLAB, t);
  show($('slab-layer'), t >= 28.56 && sx > -1900 + 20);
  $('slab').style.transform = `translateX(${sx.toFixed(1)}px)`;
  // parked, the slab is the backdrop between the scan and the review UI; sweeping, it covers everything
  const parked = t >= 29.05 && t < OCR.out;
  $('ocr').style.zIndex = 0; $('ocr-front').style.zIndex = 2; $('slab-layer').style.zIndex = parked ? 1 : 3;
  $('bug').style.opacity = (1 - seg(t, 28.6, 28.68) + seg(t, SWAP_OUT + 0.1, SWAP_OUT + 0.3)).toFixed(3);

  /* ---- D3 · OCR issue (28.74–31.00) and D4 · correction (31.00–33.10) ---- */
  const inOcr = t >= SWAP_IN && t < SWAP_OUT;
  show($('ocr-front'), inOcr);
  if (show($('ocr'), inOcr)) {
    // settle in, then a slow push while it is read
    const k = lerp(1.06, 1, tw(t, SWAP_IN, 29.4, 'expo.out')) * (1 + 0.02 * tw(t, 29.9, OCR.out, 'sine.inOut'));
    const [f0, f1] = OCR.flip, u4 = tw(t, f0, f1, 'power3.inOut'), sp = scanPose(u4);
    // push in on the issue card while the word is corrected; release as the editor comes forward
    const kp = 1 + 0.12 * tw(t, OCR.del[0] - 0.08, OCR.del[0] + 0.3, 'power2.inOut') * (1 - u4);
    ['ocr', 'ocr-front'].forEach((id) => { $(id).style.transformOrigin = '0 0'; $(id).style.transform = `translate(720px, 500px) scale(${k.toFixed(4)}) translate(-720px, -500px) translate(1180px, 380px) scale(${kp.toFixed(4)}) translate(-1180px, -380px)`; });
    $('scan').style.transform = `translate(${sp.x.toFixed(2)}px, ${sp.y.toFixed(2)}px) rotate(${sp.r.toFixed(3)}deg) scale(${sp.s.toFixed(4)})`;
    const hd = lerp(-60, 0, tw(t, 28.95, 29.3, 'expo.out')) - 60 * tw(t, f0, f0 + 0.14, 'power2.in');
    $('ocr-head').style.transform = `translateY(${hd.toFixed(1)}px)`;
    // issues panel arrives once the slab has parked; leaves as the editor comes forward
    const pin = tw(t, 29.05, 29.45, 'expo.out'), pout = tw(t, f0, f0 + 0.16, 'power2.in');
    $('issues').style.transform = `translate(${(ISSUES_AT.x + 90 * (1 - pin) + 80 * pout).toFixed(1)}px, ${ISSUES_AT.y}px) scale(${ISSUES_AT.s})`;
    $('issues').style.opacity = (Math.min(1, seg(t, 29.05, 29.2)) * (1 - pout)).toFixed(3);
    $('issue-brlies').classList.toggle('active', t >= OCR.snap + 0.04);
    // the single-word correction, slow enough to read: brlies deleted, Parties typed, Save
    const del = Math.round(6 * seg(t, OCR.del[0], OCR.del[1])), typ = Math.round(7 * seg(t, OCR.type[0], OCR.type[1]));
    const w = $('ta-word'); w.textContent = t < OCR.type[0] ? 'brlies'.slice(0, 6 - del) : 'Parties'.slice(0, typ); w.classList.toggle('bad', t < OCR.del[0]);
    const sv = pulse(t - OCR.save, 0.16); $('save').style.filter = `brightness(${(1 - 0.25 * sv).toFixed(3)})`; $('save').style.transform = `scale(${(1 - 0.05 * sv).toFixed(3)})`;
    const ein = tw(t, f0 + 0.04, f1 + 0.04, 'expo.out');
    $('editor').style.transform = `translate(${(EDITOR_AT.x + 70 * (1 - ein)).toFixed(1)}px, ${EDITOR_AT.y}px) scale(${EDITOR_AT.s})`;
    $('editor').style.opacity = seg(t, f0 + 0.04, f0 + 0.18).toFixed(3);
    $('saved').style.color = t >= f1 - 0.1 && t < f1 + 0.5 ? '#c94820' : '#858585';
    qualA.style.transform = 'translate(1090px, 96px)'; qualA.style.opacity = (seg(t, 29.1, 29.3) * (1 - seg(t, f0, f0 + 0.1))).toFixed(3);
    qualB.style.transform = 'translate(690px, 180px)'; qualB.style.opacity = seg(t, f0 + 0.14, f0 + 0.3).toFixed(3);
    // the saved OCR box: snap on "unclear", a pulse on "highlight", then the thread box → issue → word
    const hp = pulse(t - OCR.highlight, 0.3);
    $('ocr-box').style.opacity = tw(t, OCR.snap, OCR.snap + 0.1, 'power2.out').toFixed(3);
    $('ocr-box').style.transform = `scale(${(1 + 0.12 * hp).toFixed(4)})`;
    const c = [scanPt(sp, BOX[0], BOX[1]), scanPt(sp, BOX[2], BOX[1]), scanPt(sp, BOX[2], BOX[3]), scanPt(sp, BOX[0], BOX[3])];
    const box = { x0: Math.min(...c.map((p) => p.x)), y0: Math.min(...c.map((p) => p.y)), x1: Math.max(...c.map((p) => p.x)), y1: Math.max(...c.map((p) => p.y)) };
    const ex = EDITOR_AT.x + 70 * (1 - ein), wb = { x0: ex + WORD.x * EDITOR_AT.s, y0: EDITOR_AT.y + WORD.y * EDITOR_AT.s, x1: ex + (WORD.x + WORD.w) * EDITOR_AT.s, y1: EDITOR_AT.y + (WORD.y + WORD.h) * EDITOR_AT.s };
    const fb = lerpBox({ x0: box.x0 - 16, y0: box.y0 - 16, x1: box.x1 + 16, y1: box.y1 + 16 }, { x0: wb.x0 - 10, y0: wb.y0 - 10, x1: wb.x1 + 10, y1: wb.y1 + 10 }, u4);
    const fs = scaleBox(fb, lerp(1.6, 1, tw(t, OCR.snap, OCR.snap + 0.22, 'expo.out')) * (1 + 0.1 * hp));
    $('ocr-focal').setAttribute('d', t >= OCR.snap ? corners(fs.x0, fs.y0, fs.x1, fs.y1, lerp(18, 14, u4)) : '');
    const from = { x: box.x1 + 4, y: (box.y0 + box.y1) / 2 };
    const ix = ISSUES_AT.x + 90 * (1 - pin) + 80 * pout, taL = { x: ix + TA.x * ISSUES_AT.s, y: ISSUES_AT.y + (TA.y + TA.h / 2) * ISSUES_AT.s };
    const wd = { x: (wb.x0 + wb.x1) / 2, y: wb.y1 + 4 };
    const a3 = cubicAt(from, { x: from.x + 140, y: from.y }, { x: taL.x - 120, y: taL.y }, taL);
    const a4 = cubicAt(from, { x: from.x + 160, y: from.y + 40 }, { x: wd.x - 40, y: wd.y + 120 }, wd);
    const pts = a3.map((p, i) => ({ x: lerp(p.x, a4[i].x, u4), y: lerp(p.y, a4[i].y, u4) }));
    const n = Math.round(pts.length * tw(t, OCR.snap + 0.12, OCR.snap + 0.46, 'power2.inOut'));
    $('ocr-thread').setAttribute('d', n >= 2 ? polyD(pts.slice(0, n)) : '');
  }

  /* ---- D5 · Case Map, default collapsed: first seen after the 33.13 cut (next section) ---- */
  renderMapScene(t - MAP_DT, t >= SWAP_OUT);
}

// The d05 build on its original clock (31.00 = the cover); called with t - MAP_DT.
function renderMapScene(t, visible) {
  if (show($('map'), visible)) {
    const rise = 160 * (1 - tw(t, 31.0, 31.5, 'expo.out')), drift = 1 + 0.008 * tw(t, 31.9, 33.2, 'sine.inOut');
    $('map-window').style.transform = `translate(${MAP.x}px, ${MAP.y + rise}px) scale(${drift.toFixed(5)})`;
    $('map-window').style.transformOrigin = '0 0';
    $('mapped').style.transform = `translateY(${lerp(115, 0, tw(t, 31.12, 31.62, 'expo.out')).toFixed(2)}%)`;
    ['pl-1', 'pl-2', 'pl-3'].forEach((id, i) => { const u = tw(t, 31.05 + i * 0.05, 31.45 + i * 0.07, 'power2.out'); $(id).setAttribute('stroke-dasharray', '1 1'); $(id).setAttribute('stroke-dashoffset', (1 - u).toFixed(4)); });
    $('stone-corner').style.transform = `translate(${lerp(1500, 1210, tw(t, 31.1, 31.5, 'expo.out')).toFixed(1)}px, 118px)`;
    $('stone-dot').style.transform = `translate(1150px, 150px) scale(${EZ('back.out(2)')(seg(t, 31.3, 31.5)).toFixed(4)})`;
    $('stone-hatch').style.transform = `translate(1380px, ${lerp(1000, 420, tw(t, 31.15, 31.55, 'expo.out')).toFixed(1)}px)`;
    // the matter chip first, then the thread lands on it, the marks lock, the edges draw out
    const mp = tw(t, 31.28, 31.46, 'back.out(1.6)');
    matterChip.style.opacity = seg(t, 31.28, 31.36).toFixed(3); matterChip.style.transform = `scale(${lerp(0.88, 1, mp).toFixed(4)})`;
    mapEdges.forEach((m) => {
      const u = tw(t, m.t0, m.t0 + 0.4, 'power2.out'), cu = seg(u, 0.7, 1);
      m.e.setAttribute('stroke-dashoffset', (1 - u).toFixed(4)); m.e.style.opacity = u > 0 ? 1 : 0;
      m.chip.style.opacity = cu.toFixed(3); m.chip.style.transform = `translateX(${((m.left ? 14 : -14) * (1 - EZ('power2.out')(cu))).toFixed(2)}px)`;
    });
    const S5 = MAP.s * drift, wx = MAP.x, wy = MAP.y + rise + 44 * S5;
    const mx0 = wx + (MAP.ox + MATTER.x) * S5, my0 = wy + (MAP.oy + MATTER.y) * S5, mx1 = mx0 + MATTER.w * S5, my1 = my0 + MATTER.h * S5;
    const end = { x: (mx0 + mx1) / 2, y: my1 };
    const pts = cubicAt({ x: -20, y: 892 }, { x: 300, y: 892 }, { x: 560, y: my1 + 72 }, end, 48);
    const n = Math.round(pts.length * tw(t, 31.3, 31.66, 'power2.inOut'));
    $('map-thread').setAttribute('d', n >= 2 ? polyD(pts.slice(0, n)) : '');
    $('map-thread-dot').setAttribute('cx', end.x.toFixed(1)); $('map-thread-dot').setAttribute('cy', end.y.toFixed(1));
    $('map-thread-dot').setAttribute('r', (4.5 * seg(t, 31.62, 31.68)).toFixed(2));
    const fk = lerp(1.5, 1, tw(t, 31.62, 31.84, 'expo.out')), fbx = scaleBox({ x0: mx0 - 12, y0: my0 - 12, x1: mx1 + 12, y1: my1 + 12 }, fk);
    $('map-focal').setAttribute('d', t >= 31.62 ? corners(fbx.x0, fbx.y0, fbx.x1, fbx.y1) : '');
    // the cursor comes to rest by Conflicts: the next action (D6)
    const cu = tw(t, 32.35, 32.85, 'power2.out');
    show($('cursor'), t >= 32.35);
    $('cursor').style.transform = `translate(${lerp(560, 262, cu).toFixed(1)}px, ${lerp(1030, 790, cu).toFixed(1)}px)`;
  }
}

/* ------------------------------------------------------------- timeline */
const clock = { t: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(clock, { t: DUR, duration: DUR, ease: 'none', onUpdate: () => renderAt(T0 + clock.t) }, 0);
renderAt(T0);
window.__lvSection2 = { renderAt, T0 };
export const timeline = tl;
export const compositionId = ID;

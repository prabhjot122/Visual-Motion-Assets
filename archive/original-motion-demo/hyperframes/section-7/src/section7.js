/* LawVriksh graphics track — section 7, global reel time 46.4000–49.6333 s (D13, PDF Insights).
 *
 * Composition time 0 = reel 46.40 s (frame 1392). renderAt(t) takes GLOBAL reel
 * seconds and is a pure function of time. Ends before frame 1489 (49.6333), where
 * the locked Hearing Prep window begins (49.62).
 *
 * The verified local Notice Analysis run on the Arora notice (screenshots/16–18,
 * still d13), replayed: the template is picked and the six results arrive 140 ms
 * apart, as in the run. No live model; Save to Notes / Regenerate stay unpressed.
 *   46.40 the clay slab leaves (back to Arora); "Insights." lands on "identify" (46.72)
 *   46.88 Notice Analysis picked · 46.98 + 140 ms × i the six results; their passages highlight
 *   47.30–47.90 the viewer rides to page 2 ("important points")
 *   47.90 Demand Made selected: clay thread card → amber passage; pink and indigo leaders · hold to the cut
 */
const ID = 'section-7';
const T0 = 46.4, DUR = 3.2333; // 97 frames at 30 fps: 46.4000–49.6000
const gsap = window.gsap;
const EZ = (name) => gsap.parseEase(name);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const tw = (t, a, b, e = 'power2.inOut') => EZ(e)(seg(t, a, b));
const $ = (id) => document.getElementById(id);
const SVGNS = 'http://www.w3.org/2000/svg';
const show = (node, on) => { node.style.display = on ? '' : 'none'; return on; };
const corners = (x0, y0, x1, y1, L = 16) => `M${x0} ${y0 + L}V${y0}H${x0 + L}M${x1 - L} ${y0}H${x1}V${y0 + L}M${x1} ${y1 - L}V${y1}H${x1 - L}M${x0 + L} ${y1}H${x0}V${y1 - L}`;

await Promise.all(['400 100px "Newsreader"', 'italic 400 100px "Newsreader"', 'italic 400 14px "Newsreader"', '600 13px "Figtree"', '700 11px "Figtree"'].map((f) => document.fonts.load(f)));
await document.fonts.ready;

/* ------------------------------------------------------------ the verified run */
// passages measured on the notice PDF, in 825-px page coordinates (raster × 0.75)
const RESULTS = [
  { n: 1, key: 'ISSUING AUTHORITY', field: 'Issuing Authority', color: '#a855f7', page: 1, q: 'Chambers of R.K. Arora, Advocate, K-12 Jangpura Extension, New Delhi 110014', boxes: [[127.9, 209.2, 607.6, 228.6]] },
  { n: 2, key: 'RECIPIENT', field: 'Recipient', color: '#3b82f6', page: 1, q: 'Meridian Estates Private Limited, through its Managing Director, Meridian House, Sector 44, Gurugram 122003', boxes: [[112.5, 241.8, 657.8, 261.2], [88.7, 263.2, 195.8, 282.7]] },
  { n: 3, key: 'STATUTORY PROVISION', field: 'Statutory Provision', color: '#14b8a6', page: 1, q: 'Under Section 21 of the Arbitration and Conciliation Act, 1996', boxes: [[88.7, 130.2, 457.3, 149.6]] },
  { n: 4, key: 'DEMAND MADE', field: 'Demand Made', color: '#f59e0b', page: 2, q: 'being Rs. 2,30,00,000/- in principal together with interest;', boxes: [[88.7, 412.2, 427.0, 431.6]] },
  { n: 5, key: 'RESPONSE DEADLINE', field: 'Response Deadline', color: '#ec4899', page: 2, q: 'consent within thirty days of receipt of this notice', boxes: [[88.7, 565.4, 378.1, 584.8]] },
  { n: 6, key: 'STATED CONSEQUENCE', field: 'Stated Consequence', color: '#6366f1', page: 2, q: "the Claimant shall approach the Hon'ble High Court of Delhi under Section 11 of the Act.", boxes: [[466.2, 565.4, 629.1, 584.8], [88.7, 586.9, 444.6, 606.3]] },
];
const resT = (i) => 46.98 + i * 0.14;
const rgba = (hex, a) => `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a})`;

const list = $('list'), fields = $('fields');
RESULTS.forEach((r) => {
  r.card = document.createElement('div'); r.card.className = 'res';
  r.card.innerHTML = `<div class="lab"><span><i style="background:${r.color}"></i>${r.n} · ${r.key}</span><span>1</span></div><div class="q">${r.q}</div><div class="pg">Page ${r.page}</div>`;
  list.appendChild(r.card);
  r.row = document.createElement('div'); r.row.innerHTML = `<span>0${r.n}</span><span>${r.field}</span>`; fields.appendChild(r.row);
  r.hls = r.boxes.map(([x0, y0, x1, y1]) => { const h = document.createElement('div'); h.className = 'hl'; Object.assign(h.style, { left: `${x0}px`, top: `${y0}px`, width: `${x1 - x0}px`, height: `${y1 - y0}px`, background: rgba(r.color, 0.24), borderBottom: `2px solid ${r.color}` }); $(`p${r.page}`).appendChild(h); return h; });
});

/* ------------------------------------------------------------ geometry (d13) */
const VIEW = { x: 40, y: 240 }, STRIP_X = 18, P2_TOP = 1185, SCROLL = 1450;     // page 2 ends at top −205, as in d13
const INS = { x: 930, y: 250, s: 1.3 }, FIELDS = { x: 600, y: 770, s: 1.05 };
const wrap = $('list-wrap'), headH = $('ins').querySelector('.tabs').offsetHeight + $('tpl-head').offsetHeight;
wrap.style.top = `${headH}px`;
const LIST_SCROLL = RESULTS[3].card.offsetTop;                                     // results 4–6 under the template, as in d13
const p2 = { x: VIEW.x + STRIP_X, y: VIEW.y + 60 - SCROLL + P2_TOP };            // page 2 origin on screen at the end
const hlScreen = (r, i = 0) => { const [x0, y0, x1, y1] = r.boxes[i]; return { left: p2.x + x0, top: p2.y + y0, right: p2.x + x1, bottom: p2.y + y1 }; };
const cardLeft = (r) => ({ x: INS.x, y: INS.y + INS.s * (headH + r.card.offsetTop - LIST_SCROLL + r.card.offsetHeight / 2) });
const MARGIN = p2.x + 676;
const toCard = (x, y, r) => { const c = cardLeft(r); return `C ${x + 120} ${y}, ${c.x - 120} ${c.y}, ${c.x} ${c.y}`; };
const dm = hlScreen(RESULTS[3]), dl = hlScreen(RESULTS[4]), c2 = hlScreen(RESULTS[5], 1), gap = c2.bottom + 26;
const thread = $('thread'), leaders = $('leaders');
thread.setAttribute('d', `M${dm.right} ${dm.bottom} H ${MARGIN} ${toCard(MARGIN, dm.bottom, RESULTS[3])}`);
leaders.innerHTML = `<path stroke="#6366f1" opacity="0.85" d="M${c2.right} ${c2.bottom} H ${MARGIN} ${toCard(MARGIN, c2.bottom, RESULTS[5])}"/>`
  + `<path stroke="#ec4899" opacity="0.85" d="M${dl.left} ${dl.bottom} H ${dl.left - 22} V ${gap} H ${MARGIN} ${toCard(MARGIN, gap, RESULTS[4])}"/>`;
[thread, ...leaders.children].forEach((p) => { p.setAttribute('pathLength', 1); p.setAttribute('stroke-dasharray', '1 1'); });

/* =============================================================== renderAt */
function renderAt(t) {
  /* back to Arora: the clay slab leaves; d13's clay arc settles top-right */
  const sx = lerp(-470, -2100, EZ('power3.out')(seg(t, 46.3667, 46.78)));
  show($('slab-layer'), sx + 1900 > 0);
  $('slab').style.transform = `translateX(${sx.toFixed(1)}px)`;
  $('arc').style.transform = `translateX(${lerp(1460, 1250, tw(t, 46.45, 46.85, 'expo.out')).toFixed(1)}px)`;
  $('ins-word').style.transform = `translateY(${lerp(118, 0, tw(t, 46.5, 46.86, 'expo.out')).toFixed(2)}%)`;   // "identify" 46.72

  /* the viewer opens on page 1, then rides to page 2 on "important points" */
  const vin = tw(t, 46.4, 46.75, 'expo.out');
  $('viewer').style.transform = `translateY(${(90 * (1 - vin)).toFixed(1)}px)`;
  const sc = SCROLL * tw(t, 47.3, 47.9, 'power3.inOut');
  $('strip').style.top = `${(60 - sc).toFixed(1)}px`;
  $('pageno').textContent = sc > SCROLL / 2 ? '2 / 2' : '1 / 2';

  /* the panel arrives; Notice Analysis is picked */
  const pin = tw(t, 46.62, 46.95, 'expo.out');
  $('ins').style.transform = `translate(${(INS.x + 120 * (1 - pin)).toFixed(1)}px, ${INS.y}px) scale(${INS.s})`;
  $('ins').style.opacity = Math.min(1, pin * 2).toFixed(3);
  const picked = t >= 46.88;
  $('tpl').classList.toggle('on', picked); $('tpl-name').textContent = picked ? 'Notice Analysis' : 'Choose a template';
  $('tpl-tick').style.opacity = picked ? 1 : 0; $('tpl-tick').style.transform = `scale(${EZ('back.out(3)')(seg(t, 46.9, 47.06)).toFixed(3)})`;

  /* the six results arrive 140 ms apart (as in the run); each passage lights on the page */
  RESULTS.forEach((r, i) => {
    const u = tw(t, resT(i), resT(i) + 0.24, 'expo.out');
    r.card.style.opacity = u.toFixed(3); r.card.style.transform = `translateY(${(14 * (1 - u)).toFixed(1)}px)`;
    r.row.style.opacity = seg(t, resT(i), resT(i) + 0.12).toFixed(3);
    r.hls.forEach((h, j) => { h.style.transform = `scaleX(${tw(t, resT(i) + 0.05 + j * 0.06, resT(i) + 0.25 + j * 0.06, 'power2.out').toFixed(3)})`; });
    const sel = r.n === 4 && t >= 47.9;
    r.card.classList.toggle('sel', sel); r.row.classList.toggle('sel', sel);
  });
  list.style.transform = `translateY(${(-LIST_SCROLL * tw(t, 47.3, 47.9, 'power3.inOut')).toFixed(1)}px)`;
  const fin = tw(t, 46.95, 47.3, 'expo.out');
  fields.style.transform = `translate(${FIELDS.x}px, ${(FIELDS.y + 40 * (1 - fin)).toFixed(1)}px) scale(${FIELDS.s})`;
  fields.style.opacity = Math.min(1, fin * 2).toFixed(3);

  /* Demand Made: the clay thread card ↔ amber passage; leaders in their own colours; marks on the passage */
  thread.setAttribute('stroke-dashoffset', (1 - tw(t, 47.92, 48.22, 'power2.inOut')).toFixed(4)); thread.style.opacity = t >= 47.92 ? 1 : 0;
  [...leaders.children].forEach((p, i) => { p.setAttribute('stroke-dashoffset', (1 - tw(t, 47.98 + i * 0.05, 48.3 + i * 0.05, 'power2.inOut')).toFixed(4)); p.style.opacity = t >= 47.98 ? 0.85 : 0; });
  const fk = lerp(1.35, 1, tw(t, 48.0, 48.2, 'expo.out')), b = { x0: dm.left - 10, y0: dm.top - 10, x1: dm.right + 10, y1: dm.bottom + 10 }, cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
  $('focal').setAttribute('d', t >= 48.0 ? corners(cx + (b.x0 - cx) * fk, cy + (b.y0 - cy) * fk, cx + (b.x1 - cx) * fk, cy + (b.y1 - cy) * fk) : '');

  /* a slow push through the hold */
  const push = 1 + 0.01 * tw(t, 48.2, 49.7, 'sine.inOut');
  $('stage').style.transformOrigin = '720px 520px'; $('stage').style.transform = `scale(${push.toFixed(5)})`;
}

/* ------------------------------------------------------------- timeline */
const clock = { t: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(clock, { t: DUR, duration: DUR, ease: 'none', onUpdate: () => renderAt(T0 + clock.t) }, 0);
renderAt(T0);
window.__lvSection7 = { renderAt, T0 };
export const timeline = tl;
export const compositionId = ID;

/* LawVriksh graphics track — section 4, global reel time 38.1667–41.5333 s (D10).
 *
 * Composition time 0 = reel 38.1667 s (frame 1145). renderAt(t) takes GLOBAL reel
 * seconds and is a pure function of time: one paused GSAP timeline, seeded
 * geometry, no clocks, no network. Ends on the reel's 41.528 jump cut.
 *
 * Pure motion graphics (user direction, 22 Oct: "not the style of chronology").
 * The order page's "18 July 2026" lifts out of section 3's last frame as a P6
 * paper tag; the frame falls away; the clay thread straightens into a rail; the
 * other eleven tags from P6 come home onto it, newest first; "Timeline." sets on
 * "timeline"; each event's real title sets beside its date; "Agreement
 * registered" opens a paper slip with its source's own words (notice p1).
 * Data: the 12 seeded Arora events (src/mocks/data/corpus.ts) = P6's 12 tags.
 */
const ID = 'section-4';
const T0 = 38.1667, DUR = 3.3667; // 101 frames at 30 fps: 38.1667–41.5000; the 41.528 jump cut follows frame 1245
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
const corners = (x0, y0, x1, y1, L = 16) => `M${x0} ${y0 + L}V${y0}H${x0 + L}M${x1 - L} ${y0}H${x1}V${y0 + L}M${x1} ${y1 - L}V${y1}H${x1 - L}M${x0 + L} ${y1}H${x0}V${y1 - L}`;
function cubicAt(p0, c1, c2, p1, n = 40) { const out = []; for (let i = 0; i <= n; i++) { const u = i / n, m = 1 - u; out.push({ x: m * m * m * p0.x + 3 * m * m * u * c1.x + 3 * m * u * u * c2.x + u * u * u * p1.x, y: m * m * m * p0.y + 3 * m * m * u * c1.y + 3 * m * u * u * c2.y + u * u * u * p1.y }); } return out; }
const drawn = (pts, u) => { const n = Math.round(pts.length * clamp(u, 0, 1)); return n >= 2 ? pts.slice(0, n).map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('') : ''; };

await Promise.all(['400 100px "Newsreader"', 'italic 400 100px "Newsreader"', 'italic 400 30px "Instrument Serif"', '600 16px "Figtree"', '500 12px "Figtree"'].map((f) => document.fonts.load(f)));
await document.fonts.ready;

/* ------------------------------------------------------------ data and geometry */
const RAIL_X = 470, ROW_Y0 = 330, ROW_DY = 54.5;
// newest first; tag text as in P6; from = where P6 left it (x, rotation, scale) before it fell out of frame
const EVENTS = [
  { tag: '12 Sep 2026', title: 'Listed hearing (18 July order)', from: [40, -4, 0.95] },
  { tag: '15 Aug 2026<small>calculated</small>', title: 'Respondent affidavit deadline (calculated)', from: [1010, -3, 0.9] },
  { tag: '18 Jul 2026', title: 'Interim protection granted', pulled: true },
  { tag: '14 Mar 2026', title: 'Arbitration invoked', from: [1080, 5, 0.9] },
  { tag: '29 Jul 2024', title: 'Respondent replied on the payment condition', from: [420, 6, 0.75] },
  { tag: '4 Jul 2024', title: 'Legal notice served', from: [1250, 9, 0.7] },
  { tag: '30 Jun 2024', title: 'Legal notice issued', from: [1180, -7, 1.05] },
  { tag: '15 Jan 2024', title: 'Third tranche fell due', from: [560, -2, 1.3] },
  { tag: '6 Apr 2023', title: 'DDA no-objection certificate dated', from: [640, -8, 0.8] },
  { tag: '22 Feb 2023', title: 'Possession handed over', from: [880, 8, 1.0] },
  { tag: '9 Feb 2023', title: 'Agreement registered', from: [760, 4, 0.8], selected: true },
  { tag: '3 Feb 2023', title: 'Development Agreement executed', from: [120, -6, 1.15] },
];
const rowY = (i) => ROW_Y0 + i * ROW_DY;
const PULLED = EVENTS.findIndex((e) => e.pulled), SEL = EVENTS.findIndex((e) => e.selected);
// "18 July 2026" on section 3's last frame: order p1 raster box [231.9, 427.7, 332.2, 453.6] × 0.62, preview (440, 250), page offset (−55, −106)
const PK = 682 / 1100, DATE = { x0: 385 + 231.9 * PK, y0: 144 + 427.7 * PK, x1: 385 + 332.2 * PK, y1: 144 + 453.6 * PK };
Object.assign($('date-hl').style, { left: `${DATE.x0 - 2}px`, top: `${DATE.y0 - 1}px`, width: `${DATE.x1 - DATE.x0 + 4}px`, height: `${DATE.y1 - DATE.y0 + 2}px` });

const rowsL = $('rows'), tagsL = $('tags'), ringsG = $('rings');
const rows = EVENTS.map((e, i) => {
  const tag = div('tag', e.tag, tagsL), title = div('title', e.title, rowsL);
  const ring = el('circle', { cx: RAIL_X, cy: rowY(i), r: 0, fill: '#efebe3', stroke: '#2b2522', 'stroke-width': 2 }, ringsG);
  return { ...e, i, tag, title, ring, w: tag.offsetWidth, h: tag.offsetHeight, tw: title.offsetWidth };
});
// fly-in order: the eleven others, newest first, 70 ms apart (the pulled tag is already home)
let k = 0; rows.forEach((r) => { r.start = r.pulled ? null : 38.72 + 0.07 * k++; });
const SLIP_AT = { x: 900, y: 690 }, slip = $('slip');
const slipDate = (() => { const a = $('slip-date').getBoundingClientRect(), b = slip.getBoundingClientRect(); return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; })();

/* =============================================================== renderAt */
function renderAt(t) {
  /* the opening plate: the date's highlight lifts out, then the frame falls away */
  const hl = tw(t, T0, 38.32, 'power2.out'), fall = tw(t, 38.34, 38.66, 'power2.in');
  $('date-hl').style.transform = `scaleX(${hl.toFixed(3)})`;
  $('date-hl').style.opacity = (1 - seg(t, 38.3, 38.36)).toFixed(3);
  if (show($('plate-layer'), fall < 1)) {
    $('plate').style.transform = `translateY(${(140 * fall).toFixed(1)}px) scale(${(1 - 0.03 * fall).toFixed(4)})`;
    $('plate').style.opacity = (1 - fall).toFixed(3);
    $('plate').style.filter = fall > 0.01 ? `blur(${(4 * fall).toFixed(2)}px)` : 'none';
  }
  $('vignette').style.opacity = fall.toFixed(3); // the plate carries its own vignette

  /* the rail grows out of the pulled tag's ring, both ways */
  const ru = tw(t, 38.5, 38.86, 'power2.out'), yc = rowY(PULLED);
  $('rail').setAttribute('d', ru > 0 ? `M${RAIL_X} ${(yc - (yc - (ROW_Y0 - 36)) * ru).toFixed(1)} V ${(yc + (rowY(11) + 40 - yc) * ru).toFixed(1)}` : '');

  /* tags: the pulled date lifts from the page to its row; the others come home from where P6 dropped them */
  rows.forEach((r) => {
    // the event's real title sets beside its date
    const ts = 39.55 + r.i * 0.03, tu = tw(t, ts, ts + 0.36, 'expo.out');
    if (show(r.title, tu > 0)) {
      r.title.style.transform = `translate(${RAIL_X + 26}px, ${(rowY(r.i) - 10).toFixed(1)}px)`;
      r.title.style.clipPath = `inset(-4px ${((1 - tu) * 100).toFixed(2)}% -4px 0)`;
    }
    // selection: Agreement registered
    const sel = !!r.selected && t >= 39.95;
    r.tag.classList.toggle('sel', sel); r.title.classList.toggle('sel', sel);
    r.ring.setAttribute('fill', sel ? '#c4562e' : '#efebe3'); r.ring.setAttribute('stroke', sel ? '#c4562e' : '#2b2522');
    const tx = RAIL_X - 22 - r.w, ty = rowY(r.i) - r.h / 2;
    let x, y, rot = 0, s = 1, op = 1;
    if (r.pulled) {
      const u = tw(t, 38.3, 38.72, 'expo.out'), lift = tw(t, 38.22, 38.32, 'power2.out');
      const sx0 = (DATE.x1 - DATE.x0) / (r.w - 26) * 1.05;
      x = lerp(DATE.x1 - r.w, tx, u); y = lerp((DATE.y0 + DATE.y1) / 2 - r.h / 2, ty, u) - 24 * Math.sin(Math.PI * u);
      s = lerp(sx0, 1, u) * (1 + 0.06 * lift * (1 - u)); rot = lerp(-3, 0, u); op = Math.min(1, lift * 1.5);
      if (!show(r.tag, t >= 38.22)) return;
    } else {
      if (!show(r.tag, t >= r.start)) { r.ring.setAttribute('r', 0); return; }
      const u = tw(t, r.start, r.start + 0.5, 'expo.out'), [fx, frot, fs] = r.from;
      x = lerp(fx, tx, u); y = lerp(1060, ty, u); rot = lerp(frot * 3, 0, u); s = lerp(fs, 1, u);
    }
    r.tag.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(${s.toFixed(4)})`;
    r.tag.style.opacity = op.toFixed(3);
    const land = r.pulled ? 38.72 : r.start + 0.32, rr = EZ('back.out(2.2)')(seg(t, land, land + 0.16));
    r.ring.setAttribute('r', (5.5 * rr).toFixed(2));
  });

  /* "Timeline." — solid now, on "timeline" (39.44): the payoff of P6's outline word */
  $('timeline-word').style.transform = `translateY(${lerp(118, 0, tw(t, 39.2, 39.62, 'expo.out')).toFixed(2)}%)`;

  /* the source's own words for the selected event, and the thread that ties them */
  const su = tw(t, 40.0, 40.36, 'expo.out'), sr = rows[SEL];
  if (show(slip, su > 0)) { slip.style.transform = `translate(${(SLIP_AT.x + 70 * (1 - su)).toFixed(1)}px, ${SLIP_AT.y}px)`; slip.style.opacity = Math.min(1, su * 2).toFixed(3); }
  const from = { x: RAIL_X + 26 + sr.tw + 10, y: rowY(SEL) }, to = { x: SLIP_AT.x - 4, y: SLIP_AT.y + slipDate.y + slipDate.h / 2 };
  $('thread').setAttribute('d', t >= 40.1 ? drawn(cubicAt(from, { x: from.x + 90, y: from.y }, { x: to.x - 90, y: to.y }, to), tw(t, 40.1, 40.4, 'power2.inOut')) : '');
  const fk = lerp(1.4, 1, tw(t, 40.3, 40.5, 'expo.out')), d = { x0: SLIP_AT.x + slipDate.x - 8, y0: SLIP_AT.y + slipDate.y - 8, x1: SLIP_AT.x + slipDate.x + slipDate.w + 8, y1: SLIP_AT.y + slipDate.y + slipDate.h + 8 };
  const cx = (d.x0 + d.x1) / 2, cy = (d.y0 + d.y1) / 2;
  $('focal').setAttribute('d', t >= 40.3 ? corners(cx + (d.x0 - cx) * fk, cy + (d.y0 - cy) * fk, cx + (d.x1 - cx) * fk, cy + (d.y1 - cy) * fk) : '');

  /* a slow push through the hold */
  const push = 1 + 0.012 * tw(t, 40.4, 41.6, 'sine.inOut');
  $('stage').style.transformOrigin = '720px 620px'; $('stage').style.transform = `scale(${push.toFixed(5)})`;
}

/* ------------------------------------------------------------- timeline */
const clock = { t: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(clock, { t: DUR, duration: DUR, ease: 'none', onUpdate: () => renderAt(T0 + clock.t) }, 0);
renderAt(T0);
window.__lvSection4 = { renderAt, T0 };
export const timeline = tl;
export const compositionId = ID;

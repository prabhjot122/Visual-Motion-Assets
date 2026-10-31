/* WEB CUT COPY of section-4/src/section4.js: identical scene code, exporting renderAt for src/web.js.
 *
 * LawVriksh graphics track — section 4, global reel time 38.1667–41.5333 s (D10).
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
 *
 * Web cut, revision 6 (22 Oct): the plate is the Tabular review's completed comparison. Every date
 * the table holds lifts out of its own Document Date cell (no highlight bar, no single date singled
 * out); the two dates the table has no cell for come home from below. The rows sit higher (y 190,
 * 50 apart) so the bottom subtitle stays clear.
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
const RAIL_X = 470, ROW_Y0 = 190, ROW_DY = 50;
// newest first; tag text as in P6; from = where P6 left it (x, rotation, scale) before it fell out of frame
const EVENTS = [
  { tag: '12 Sep 2026', title: 'Listed hearing (18 July order)', from: [40, -4, 0.95] },
  { tag: '15 Aug 2026<small>calculated</small>', title: 'Respondent affidavit deadline (calculated)', from: [1010, -3, 0.9] },
  { tag: '18 Jul 2026', title: 'Interim protection granted', cell: [449.3, 414.5, 64.2, 13.1], pulled: true },
  { tag: '14 Mar 2026', title: 'Arbitration invoked', cell: [449.3, 351.7, 75.3, 13.1] },
  { tag: '29 Jul 2024', title: 'Respondent replied on the payment condition', cell: [449.3, 696.9, 65.9, 13.1] },
  { tag: '4 Jul 2024', title: 'Legal notice served', cell: [449.3, 665.5, 60.2, 13.1] },
  { tag: '30 Jun 2024', title: 'Legal notice issued', cell: [449.3, 634.1, 70.7, 13.1] },
  { tag: '15 Jan 2024', title: 'Third tranche fell due', cell: [449.3, 602.8, 83.6, 13.1] },
  { tag: '6 Apr 2023', title: 'DDA no-objection certificate dated', cell: [449.3, 571.4, 61.4, 13.1] },
  { tag: '22 Feb 2023', title: 'Possession handed over', cell: [449.3, 508.6, 89.0, 13.1] },
  { tag: '9 Feb 2023', title: 'Agreement registered', selected: true, cell: [449.3, 477.2, 82.8, 13.1] },
  { tag: '3 Feb 2023', title: 'Development Agreement executed', cell: [449.3, 383.1, 82.5, 13.1] },
];
const rowY = (i) => ROW_Y0 + i * ROW_DY;
const PULLED = EVENTS.findIndex((e) => e.pulled), SEL = EVENTS.findIndex((e) => e.selected);
// cell: the date's text box in the Tabular review's last frame [x, y, w, h] (web-tab, window.__lvMeasure.dates)
$('date-hl').style.display = 'none';

const rowsL = $('rows'), tagsL = $('tags'), ringsG = $('rings');
const rows = EVENTS.map((e, i) => {
  const tag = div('tag', e.tag, tagsL), title = div('title', e.title, rowsL);
  const ring = el('circle', { cx: RAIL_X, cy: rowY(i), r: 0, fill: '#efebe3', stroke: '#2b2522', 'stroke-width': 2 }, ringsG);
  return { ...e, i, tag, title, ring, w: tag.offsetWidth, h: tag.offsetHeight, tw: title.offsetWidth };
});
// lift order: the table's dates out of their cells, newest first, 40 ms apart; then the two it has no cell for
let k = 0, j = 0; rows.forEach((r) => { r.start = r.cell ? 38.22 + 0.04 * k++ : 38.72 + 0.07 * j++; });
const SLIP_AT = { x: 900, y: 505 }, slip = $('slip');
const slipDate = (() => { const a = $('slip-date').getBoundingClientRect(), b = slip.getBoundingClientRect(); return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; })();

/* =============================================================== renderAt */
function renderAt(t) {
  /* the opening plate: the dates lift out of their cells, then the frame falls away */
  const fall = tw(t, 38.4, 38.72, 'power2.in');
  if (show($('plate-layer'), fall < 1)) {
    $('plate').style.transform = `translateY(${(140 * fall).toFixed(1)}px) scale(${(1 - 0.03 * fall).toFixed(4)})`;
    $('plate').style.opacity = (1 - fall).toFixed(3);
    $('plate').style.filter = fall > 0.01 ? `blur(${(4 * fall).toFixed(2)}px)` : 'none';
  }
  $('vignette').style.opacity = fall.toFixed(3); // the plate carries its own vignette

  /* the rail grows out of the pulled tag's ring, both ways */
  const ru = tw(t, 38.5, 38.86, 'power2.out'), yc = rowY(PULLED);
  $('rail').setAttribute('d', ru > 0 ? `M${RAIL_X} ${(yc - (yc - (ROW_Y0 - 36)) * ru).toFixed(1)} V ${(yc + (rowY(11) + 40 - yc) * ru).toFixed(1)}` : '');

  /* tags: the table's dates lift from their cells to their rows; the other two come home from below */
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
    if (r.cell) {
      // the tag's text laid over the cell's (origin: the tag's right centre), then home along a small arc
      if (!show(r.tag, t >= r.start)) { r.ring.setAttribute('r', 0); return; }
      const [cx0, cy0, cw, ch] = r.cell, s0 = cw / (r.w - 26);
      const lift = tw(t, r.start, r.start + 0.1, 'power2.out'), u = tw(t, r.start + 0.06, r.start + 0.56, 'expo.out');
      x = lerp(cx0 + cw + 13 * s0 - r.w, tx, u); y = lerp(cy0 + ch / 2 - r.h / 2, ty, u) - 30 * Math.sin(Math.PI * u);
      s = lerp(s0, 1, u) * (1 + 0.08 * lift * (1 - u)); rot = lerp(-2, 0, u); op = lift;
    } else {
      if (!show(r.tag, t >= r.start)) { r.ring.setAttribute('r', 0); return; }
      const u = tw(t, r.start, r.start + 0.5, 'expo.out'), [fx, frot, fs] = r.from;
      x = lerp(fx, tx, u); y = lerp(1060, ty, u); rot = lerp(frot * 3, 0, u); s = lerp(fs, 1, u);
    }
    r.tag.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(${s.toFixed(4)})`;
    r.tag.style.opacity = op.toFixed(3);
    const land = r.start + (r.cell ? 0.4 : 0.32), rr = EZ('back.out(2.2)')(seg(t, land, land + 0.16));
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

/* ------------------------------------------------------------- web cut */
// The web cut drives renderAt through its own time map (src/web.js); no timeline here.
renderAt(T0);
export { renderAt, T0 };

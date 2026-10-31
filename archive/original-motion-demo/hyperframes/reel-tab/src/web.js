/* LawVriksh web cut — part 4: Tabular review (web 0–3.5 s; a new chapter, not in the reel). Plan §11–12.
 *
 * Comparing is this chapter's job (the Case Map resolves conflicts). The local app's own run,
 * replayed: the Arora matter's documents × the questions asked of each (capture
 * screenshots/31–32; 14 documents, 6 columns; demo data). Nothing is pressed or approved.
 * Revision 6 (22 Oct): ≈ 5 s with part 3's heading; the table fills in three row groups, and most
 * of the time goes to the completed comparison. No camera push, no sentence turned into a cell.
 *   0.00 none     "Compare documents side by side." carried over at the centre; the film is irised
 *                 shut on part 3's source passage
 *   0.30 morph    the iris opens from that passage onto the table; the heading settles into the
 *                 subtitle
 *   0.50–1.10     the run fills in three groups of rows: "Filling n of 84" → "Complete · 84 of 84"
 *   1.25–1.55     the comparison: Amount Claimed, Document Date and Parties are framed in turn; the
 *                 other columns step back and the "Not found" cells under the three go quiet
 *   3.00–3.40     the amount and party frames let go; the dates stay framed for the Timeline
 */
import { mountStream, applyFilm } from '../assets/lib/stream.js';

const ID = 'web-tab';
const DUR = 3.5; // 105 frames
const gsap = window.gsap;
const EZ = (name) => gsap.parseEase(name);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const tw = (t, a, b, e = 'power2.inOut') => EZ(e)(seg(t, a, b));
const $ = (id) => document.getElementById(id);
await Promise.all(['500 118px "Newsreader"', 'italic 500 118px "Newsreader"', '500 13px "Figtree"', '600 11px "Figtree"'].map((f) => document.fonts.load(f)));

/* ------------------------------------------------------------ the run (capture 32, demo data) */
const TAG = {
  Notice: ['#fdecc8', '#9a5308'], Contract: ['#fce7ef', '#a8204f'], 'Order / Judgment': ['#fde6d4', '#a8461f'], Other: ['#ece8fd', '#5140b8'],
  Evidence: ['#dcf3e6', '#1f6e42'], 'Financial record': ['#e0ebff', '#2a56a3'], Correspondence: ['#fde4e4', '#a52b29'], Application: ['#e5e9fe', '#3542b0'], Pleading: ['#dff1fb', '#1a6389'],
};
const AR = 'Arora (owner) · Meridian Estates Pvt. Ltd. (developer)';
const NF = null; // "Not found"
// [document, type, date, parties, amount, court, key fact]; a value is [text, dot] with dot g (green) · a (amber) · w (amber with a warning)
const g = (v) => [v, 'g'], a = (v) => [v, 'a'], w = (v) => [v, 'w'];
const ROWS = [
  ['Notice invoking arbitration — 14 Mar 2026.pdf', 'Notice', g('14 March 2026'), g('Arora (claimant) · Meridian Estates Pvt. Ltd. (respondent)'), a('Rs. 2,30,00,000'), NF, a('Rs. 2,30,00,000')],
  ['Development Agreement — 03 Feb 2023 (registered).pdf', 'Contract', g('3 February 2023'), g(AR), g('Rs. 4,60,00,000'), g('New Delhi'), g('Rs. 4,60,00,000')],
  ['Interim order under Section 9 — 18 Jul 2026.pdf', 'Order / Judgment', g('18 July 2026'), g('Arora (petitioner) · Meridian Estates Pvt. Ltd. (respondent)'), a('Rs. 1,15,00,000'), NF, w('Respondent affidavit of bookings within four weeks')],
  ['Research note — limitation under Section 34.pdf', 'Other', g('Undated'), NF, NF, NF, g('Undated')],
  ['Registration endorsement — Sub-Registrar, Vasant Vihar.pdf', 'Evidence', g('9 February 2023'), g(AR), NF, NF, g('Development Agreement registered before the Sub-Registrar, Vasant Vihar.')],
  ['Possession receipt — 22 Feb 2023.pdf', 'Evidence', g('22 February 2023'), w(AR), NF, NF, g('Vacant and peaceful possession of Khasra No. 214/2 handed over.')],
  ['Site photographs at handover — 22 Feb 2023.pdf', 'Evidence', g('22 February 2023'), NF, NF, NF, g('Photographs of the 2.8-acre land parcel on the day of handover.')],
  ['DDA no-objection certificate — 06 Apr 2023.pdf', 'Evidence', g('6 April 2023'), NF, NF, g('Delhi Development Authority'), g('DDA has no objection to development of Khasra No. 214/2.')],
  ['Statement of account — tranche payments.pdf', 'Financial record', w('15 January 2024'), NF, g('Rs. 1,15,00,000'), NF, g('Third tranche under Clause 9.2 shown unpaid on its due date.')],
  ['Legal notice — 30 Jun 2024.pdf', 'Notice', g('30 June 2024'), g(AR), w('Rs. 1,15,00,000 with interest'), NF, g('Demands the unpaid third tranche with interest at 12% per annum.')],
  ['Postal acknowledgement — 04 Jul 2024.pdf', 'Correspondence', g('4 July 2024'), g('Meridian Estates Pvt. Ltd. (addressee)'), NF, NF, g('Legal notice served on the respondent at Meridian House, Gurugram.')],
  ['Reply to legal notice — 29 Jul 2024.pdf', 'Correspondence', g('29 July 2024'), g(AR), NF, NF, g('Respondent says the third tranche is payable only after the commencement certificate.')],
  ['Petition under Section 9 — interim measures.pdf', 'Application', g('Undated'), g('Arora (petitioner) · Meridian Estates Pvt. Ltd. (respondent)'), g('Rs. 1,15,00,000'), g('High Court of Delhi'), g('Seeks to restrain the respondent from creating third-party interest.')],
  ['Written submissions — Section 9 hearing.pdf', 'Pleading', g('Undated'), NF, NF, g('High Court of Delhi'), g('Argues the payment condition is not a condition precedent under Clause 9.2.')],
];
const DOTC = { g: '#2e9e5b', a: '#e08a1e', w: '#e08a1e', n: '#a8a29a' };
const tbody = $('rows'), cells = [];
ROWS.forEach((r, i) => {
  const tr = document.createElement('tr');
  tr.innerHTML = `<td class="n">${i + 1}</td><td><span class="doc"><img src="assets/icons/pdf.svg" alt=""><span>${r[0]}</span></span></td>`;
  const vals = [[r[1], 'g', true], ...r.slice(2)];
  vals.forEach((v, c) => {
    const td = document.createElement('td');
    const [text, dot, isTag] = v ?? ['Not found', 'n'];
    const body = isTag ? `<span class="tag" style="background:${TAG[text][0]};color:${TAG[text][1]}">${text}</span>` : `<span class="val${v ? '' : ' nf'}">${text}</span>${v && !isTag ? '<span class="cite">1</span>' : ''}`;
    td.innerHTML = `<span class="skel"></span><span class="cell">${body}</span>${dot === 'w' ? '<span class="warn">⚠</span>' : ''}<span class="dot" style="background:${DOTC[dot]}"></span>`;
    tr.appendChild(td);
    cells.push({ r: i, c, td, nf: !v, skel: td.querySelector('.skel'), cell: td.querySelector('.cell'), extras: [...td.querySelectorAll('.warn, .dot')] });
  });
  tbody.appendChild(tr);
});
// the app fills in groups: rows 1–5, 6–10, 11–14, each group in one quick pass across its columns
const groupT = (r) => (r < 5 ? 0.5 : r < 10 ? 0.68 : 0.86);
const cellT = (r, c) => groupT(r) + c * 0.018;

/* ------------------------------------------------------------ geometry */
const WIN = { x: 40, y: 262, s: 1360 / 1560 };
$('win').style.transform = `translate(${WIN.x}px, ${WIN.y}px) scale(${WIN.s})`;
const rectOf = (el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
// value columns: 0 type · 1 date · 2 parties · 3 amount claimed · 4 court · 5 key fact
// the comparison, in the subtitle's order: amounts, dates, parties (each framed header to last row)
const COMPARE = [3, 1, 2], FRAME_T = [1.25, 1.37, 1.49], DATES = 1;
const LIFT0 = $('lift');
const frames = COMPARE.map((c, k) => {
  const top = rectOf($('table').querySelectorAll('th')[2 + c]), bottom = rectOf(cells.find((q) => q.r === 13 && q.c === c).td);
  const el = k ? LIFT0.cloneNode() : LIFT0; $('cam').appendChild(el); // styled by #lift
  Object.assign(el.style, { left: `${top.x - 5}px`, top: `${top.y - 5}px`, width: `${top.w + 10}px`, height: `${bottom.y + bottom.h - top.y + 10}px` });
  return { c, el, at: FRAME_T[k] };
});
window.__lvMeasure = { // read by web-cut/measure.mjs: the Timeline (part 5) lifts its tags out of these cells
  dates: cells.filter((q) => q.c === DATES && !q.nf).map((q) => { const v = q.cell.querySelector('.val'); const b = rectOf(v); return { text: v.textContent, x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.w.toFixed(1), h: +b.h.toFixed(1) }; }),
};

// part 3's source passage, where its iris closed
const PASSAGE = { x: 872.4, y: 536.2 }; // measured by web-cut/measure.mjs on web-s3 (window.__lvMeasure.passage)

const CH = ['The problem', 'Upload', 'OCR', 'Case map', 'Tabular', 'Timeline', 'Ask', 'Draft', 'Insights', 'Hearing'];
const render = mountStream($('captions'), {
  segments: [
    { at: 0, place: 'center', in: 'none', fx: 'iris', fxp: PASSAGE, html: 'Compare documents<br><em>side by side</em>.' },
    { at: 0.3, place: 'below', in: 'morph', fit: true, recDur: 0.6, html: 'Compare <em>amounts</em>, <em>dates</em> and <em>parties</em>.' },
  ],
  hud: { chapters: CH, chapter: () => ({ num: 4, name: 'Tabular review', case: 'Arora v. Meridian Estates  ·  ARB.P. 428/2026' }), start: -1 },
});

const film = $('film'), runtext = $('runtext');
export function renderWeb(t) {
  // the run, in groups; then the comparison
  const back = tw(t, 1.2, 1.55);
  let filled = 0;
  cells.forEach((k) => {
    const a0 = cellT(k.r, k.c), u = seg(t, a0, a0 + 0.2);
    if (t >= a0 + 0.1) filled++;
    k.skel.style.opacity = (1 - u).toFixed(3);
    const compared = COMPARE.includes(k.c);
    k.cell.style.opacity = (u * (compared && k.nf ? 1 - 0.55 * back : 1)).toFixed(3);
    k.cell.style.transform = `translateY(${(4 * (1 - EZ('expo.out')(u))).toFixed(1)}px)`;
    k.extras.forEach((e) => { e.style.opacity = seg(t, a0 + 0.1, a0 + 0.26).toFixed(3); });
    k.td.style.opacity = compared ? 1 : (1 - 0.62 * back).toFixed(3);
  });
  runtext.textContent = filled >= 84 ? 'Complete · 84 of 84' : `Filling ${filled} of 84`;
  frames.forEach((f) => {
    const on = tw(t, f.at, f.at + 0.35, 'back.out(1.4)') * (f.c === DATES ? 1 : 1 - tw(t, 3.0, 3.4));
    Object.assign(f.el.style, { opacity: on.toFixed(3), transform: `translateY(${(-3 * on).toFixed(1)}px)` });
  });

  const { rec, fx, fxp } = render(t);
  applyFilm(film, rec, fx, fxp ?? {});
}

const clock = { t: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(clock, { t: DUR, duration: DUR, ease: 'none', onUpdate: () => renderWeb(clock.t) }, 0);
renderWeb(0);
export const timeline = tl;
export const compositionId = ID;

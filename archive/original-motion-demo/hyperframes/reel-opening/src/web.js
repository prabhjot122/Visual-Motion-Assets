/* LawVriksh web cut — opening, revision 6 (web 0.00–30.80 s ↔ reel 0.00–24.77 s). Plan: web-cut/web-cut-plan.md §11.
 *
 * The approved pilot scene, retimed through a time map, told as a problem with stakes. One
 * caption stream (lib/stream.js); nothing cuts in and no turn repeats a move. Each is triggered
 * by the motion before it (revision 6, 22 Oct: the margin line holds 2 s; subtitles after Delhi):
 *   1.72 zoom    the camera dives into the top sheet; the sentence comes forward out of it
 *   3.60 morph   the camera cranes up; the sentence shrinks into the corner
 *   5.15 lift    the margin note is written; the line then reads for 2 s on the settled note
 *   7.87 morph   the corner sentence grows to the centre (page recedes, blur)
 *   9.87 into    the sentence melts into the line the pencil bracket is checking, and the hops go on
 *  12.87 from    the last hop lands; the bracket lifts off the page and the question opens inside it
 *               (the page behind pushes in)
 *  14.87 sweep   the question sweeps away with the clay thread that reads every line
 *  17.07 gather  the thread draws into one clay point; the sentence blooms out of it
 *  18.57 focus   in place, the next sentence comes into focus
 *  20.07 into    it shrinks into the label of the case folder the point becomes
 *  21.77 burst   the folder opens and the next sentence is thrown out with its pages, down to the
 *               subtitle line, where every later narrative sentence sits
 *  24.92 slide · 26.62 flip · 28.32 settle   the subtitle changes with each beat
 * The mid-film brand moment is removed; the brand closes the film.
 */
import { renderAt } from './pilot.js';
import { mountStream, applyFilm, timeMap } from '../assets/lib/stream.js';

const ID = 'web-opening';
const DUR = 30.8; // 924 frames at 30 fps; the last shows reel 24.7667, the pilot's last frame
const gsap = window.gsap;
const EZ = (name) => gsap.parseEase(name);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const $ = (id) => document.getElementById(id);

await Promise.all(['500 118px "Newsreader"', 'italic 500 118px "Newsreader"', '500 12px "Newsreader"'].map((f) => document.fonts.load(f)));

/* web time → reel time ([web, reel]; a flat run is a hold, a vertical step a jump behind the veil) */
const reel = timeMap([
  [0, 0], [1.88, 1.88],          // O1 office footage, at its own speed; the dive lands on the sheet
  [3.6, 1.95],                   // the first sentence on the sheet
  [5.1, 2.92],                   // O2 the crane up off the sheet
  [6.4, 4.33],                   // O3 the margin note
  [7.8667, 4.345],               // held: "and notes in every margin" reads for 2 s once it is complete
  [9.8667, 4.38],                // under "Miss one detail"
  [10.8667, 4.72],               // the first hop lands as the sentence melts into its line
  [12.8667, 6.7],                // O4 the rest of the hops
  [14.8667, 6.93],               // under the question
  [17.0667, 9.2],                // O5 one sweep reads every line, draws into one point
  [18.0667, 9.2],                // the sentence blooms out of the point
  [18.0668, 14.62],              // behind the veil: past the removed brand moment, to the case seed
  [20.0667, 14.62],              // under "An arbitration before the Delhi High Court"
  [21.7667, 16.17],              // P1 the seed becomes the folder
  [23.7667, 18.49],              // P2 the case opens
  [26.5667, 20.83],              // P3–P4 the documents, the two figures
  [28.0667, 22.16],              // P5 provisions
  [30.7667, 24.7667],            // P6 dates, the knot, the taut line
]);

/* anchors measured on the scene itself (the pencil bracket on its line, the folder's label) */
const rectAt = (rt, find) => { renderAt(rt); const e = find(); const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
const bracket = () => document.querySelector('#stage2d path[stroke-linecap="square"][stroke-width="2"]');
const firstLine = { ...rectAt(4.72, bracket), rot: -5 };
const lastLine = { ...rectAt(6.7, bracket), rot: -5 };
const label = { ...rectAt(16.0, () => document.querySelector('#folder .flabel')), rot: -1.5 };
const folderBox = rectAt(16.2, () => document.querySelector('#folder'));
const folderC = { x: folderBox.x + folderBox.w / 2, y: folderBox.y + folderBox.h / 2 };
const pointC = { x: 720, y: 431 }; // O5's clay point (the pilot's ground line, centred)

const render = mountStream($('captions'), {
  segments: [
    { at: 1.72, place: 'center', rec: 0, in: 'zoom', html: 'Every case comes with<br><em>hundreds</em> of pages.' },
    { at: 3.6, place: 'corner', html: 'Pleadings, orders, agreements,' },
    { at: 5.15, place: 'corner', in: 'lift', dur: 0.7, html: 'and notes in <em>every</em> margin.' },
    { at: 7.8667, place: 'center', fx: 'blur', html: 'Miss one detail,<br>and the case <em>shifts</em>.', out: 'into', anchorOut: firstLine, outDur: 1.1 },
    { at: 9.8667, html: null },
    { at: 12.8667, place: 'center', in: 'from', anchorIn: lastLine, marks: true, fx: 'push', fxp: { ox: lastLine.x + lastLine.w / 2, oy: lastLine.y + lastLine.h / 2 }, html: 'What if AI read<br><em>every page</em> for you?', out: 'sweep', dir: [480, 0], outDur: 0.9 },
    { at: 14.8667, html: null },
    { at: 17.0667, place: 'center', in: 'gather', point: pointC, fx: 'veil', html: 'Take <em>one</em> real case.' },
    { at: 18.5667, place: 'center', in: 'focus', html: 'An arbitration before<br>the <em>Delhi High Court</em>.', out: 'into', anchorOut: label, outDur: 1.25 },
    { at: 20.0667, html: null },
    // from here on, narrative sits at the bottom centre as a subtitle (user direction, 22 Oct)
    { at: 21.7667, place: 'below', in: 'burst', point: folderC, html: 'Inside: an agreement, a notice, an order.' },
    { at: 24.9167, place: 'below', in: 'slide', dur: 0.7, html: 'And they <em>don’t agree</em>.' },
    { at: 26.6167, place: 'below', in: 'flip', dur: 0.7, html: 'Three provisions to track.' },
    { at: 28.3167, place: 'below', in: 'settle', dur: 0.75, html: 'Twelve dates, <em>out of order</em>.' },
  ],
  hud: {
    chapters: ['The problem', 'Upload', 'OCR', 'Case map', 'Tabular', 'Timeline', 'Ask', 'Draft', 'Insights', 'Hearing'],
    chapter: (t) => ({ num: 0, name: 'The problem', case: t >= 19.0667 ? 'Arora v. Meridian Estates  ·  ARB.P. 428/2026' : '' }),
    start: 0.5,
  },
});

const film = $('film');
function renderWeb(t) {
  renderAt(reel(t));
  const { rec, fx, fxp } = render(t);
  applyFilm(film, rec, fx, fxp ?? {});
  // "…and the case shifts": the receded page behind slides, then settles back as the sentence melts
  const shift = -38 * EZ('power3.out')(seg(t, 8.7667, 9.3167)) * (1 - EZ('power2.inOut')(seg(t, 9.8667, 10.6667)));
  if (Math.abs(shift) > 0.05) film.style.transform = `translateX(${shift.toFixed(1)}px) ${film.style.transform === 'none' ? '' : film.style.transform}`;
}

/* ------------------------------------------------------------- timeline */
const clock = { t: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(clock, { t: DUR, duration: DUR, ease: 'none', onUpdate: () => renderWeb(clock.t) }, 0);
renderWeb(0);
window.__lvWebOpening = { renderWeb, reel };
export const timeline = tl;
export const compositionId = ID;

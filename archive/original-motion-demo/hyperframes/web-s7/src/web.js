/* LawVriksh web cut — part 8: PDF Insights (web 0–4.1 s ↔ reel 46.40–49.60). Plan §11–12.
 *
 * Section 7's approved scene through a time map. The clay slab and "Insights." are hidden. The
 * film grows back to 0.84 of its size (top-aligned) instead of full frame, so the viewer and the
 * results list end above the subtitle; part 9's carried-over containers start from that pose.
 *   0.00 none   "The key points of any document," carried over at the centre (the film shrunk away)
 *   0.30 wipe   the film grows back into place as the sentence is wiped off, left to right
 *   1.10 highlight  the results arrive; the sentence completes as the subtitle and a marker sweeps it
 *               (carried into part 9)
 */
import { renderAt } from './scene.js';
import { mountStream, applyFilm, timeMap } from '../assets/lib/stream.js';

const ID = 'web-s7';
const DUR = 4.1; // 123 frames
const gsap = window.gsap;
const $ = (id) => document.getElementById(id);
await Promise.all(['500 118px "Newsreader"', 'italic 500 118px "Newsreader"'].map((f) => document.fonts.load(f)));

const reel = timeMap([
  [0, 46.4], [0.6, 46.45],       // behind the sentence, past the hidden slab
  [2.7, 47.9],                   // the template, the six results, the ride to page 2 (1.45× longer)
  [3.4, 48.5],                   // Demand Made selected: thread, passage, leaders
  [4.1, 49.6],                   // the hold
]);

const CH = ['The problem', 'Upload', 'OCR', 'Case map', 'Tabular', 'Timeline', 'Ask', 'Draft', 'Insights', 'Hearing'];
const render = mountStream($('captions'), {
  segments: [
    { at: 0, place: 'center', in: 'none', fx: 'shrink', html: 'The key points of<br><em>any</em> document,', out: 'wipe', outDur: 0.8 },
    { at: 0.3, html: null, recDur: 0.9 },
    { at: 1.1, place: 'below', in: 'highlight', html: '…without reading <em>every page</em>.' },
  ],
  hud: { chapters: CH, chapter: () => ({ num: 8, name: 'PDF insights', case: 'Arora v. Meridian Estates  ·  ARB.P. 428/2026' }), start: -1 },
});

const film = $('film');
function renderWeb(t) {
  renderAt(reel(t));
  const { rec, fx, fxp } = render(t);
  applyFilm(film, rec, fx, fxp ?? {});
  // it grows back to 0.84, top-aligned (about 720, 500, then up 80): clear of the subtitle
  const k = 1 - rec;
  if (k > 0.001) film.style.transform = `translateY(${(-80 * k).toFixed(1)}px) scale(${(1 - 0.16 * k).toFixed(4)}) ${film.style.transform === 'none' ? '' : film.style.transform}`;
  film.style.transformOrigin = '720px 500px';
}

const clock = { t: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(clock, { t: DUR, duration: DUR, ease: 'none', onUpdate: () => renderWeb(clock.t) }, 0);
renderWeb(0);
export const timeline = tl;
export const compositionId = ID;

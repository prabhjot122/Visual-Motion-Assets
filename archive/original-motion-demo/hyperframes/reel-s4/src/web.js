/* LawVriksh web cut — part 5: Timeline (web 0–4.6 s ↔ reel 38.17–41.50). Plan §11–12.
 *
 * Section 4's approved scene through a time map. Its opening plate is the Tabular review's last
 * frame (plates/d09-exit.png, re-made from web-tab): the compared table, its dates still framed. The
 * dates lift out of their own cells, the table falls away, the rail straightens and the dates come
 * home in order (scene: rows raised clear of the subtitle). "Timeline." is hidden.
 *   0.00 none   "Compare amounts, dates and parties." carried over; it lifts away as the dates leave
 *   0.50 rise   the dates come home: the next subtitle rises into its line
 *   2.60 blur   the registered agreement opens its source slip; the next subtitle comes through
 *               (carried into part 6, where it leaves with this frame)
 */
import { renderAt } from './scene.js';
import { mountStream, applyFilm, timeMap } from '../assets/lib/stream.js';

const ID = 'web-s4';
const DUR = 4.6; // 138 frames
const gsap = window.gsap;
const $ = (id) => document.getElementById(id);
await Promise.all(['500 118px "Newsreader"', 'italic 500 118px "Newsreader"'].map((f) => document.fonts.load(f)));

const reel = timeMap([[0, 38.1667], [4.6, 41.5]]); // 1.38× longer throughout

const CH = ['The problem', 'Upload', 'OCR', 'Case map', 'Tabular', 'Timeline', 'Ask', 'Draft', 'Insights', 'Hearing'];
const render = mountStream($('captions'), {
  segments: [
    { at: 0, place: 'below', in: 'none', html: 'Compare <em>amounts</em>, <em>dates</em> and <em>parties</em>.' },
    { at: 0.5, place: 'below', in: 'rise', dur: 0.7, html: 'The same dates, now <em>in order</em>.' },
    { at: 2.6, place: 'below', in: 'blur', dur: 0.7, html: 'Each one keeps its <em>source</em>.' },
  ],
  hud: { chapters: CH, chapter: () => ({ num: 5, name: 'Timeline', case: 'Arora v. Meridian Estates  ·  ARB.P. 428/2026' }), start: -1 },
});

const film = $('film');
function renderWeb(t) {
  renderAt(reel(t));
  const { rec, fx, fxp } = render(t);
  applyFilm(film, rec, fx, fxp ?? {});
}

const clock = { t: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(clock, { t: DUR, duration: DUR, ease: 'none', onUpdate: () => renderWeb(clock.t) }, 0);
renderWeb(0);
export const timeline = tl;
export const compositionId = ID;

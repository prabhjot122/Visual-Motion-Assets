/* LawVriksh web cut — part 11: the brand (web 0–3.63 s = reel 59.27–62.87, at its own speed). Plan §11.
 *
 * Section 10's approved close: the window light sweeps the office into paper, the brand is already
 * set, the ground line draws out to both edges, a still hold.
 *   0.00 none   the closing line carried over from the office, in light type
 *   0.00 wipe   the window light wipes it away with the footage, left to right
 * Nothing else is written: the mark and the wordmark close the film.
 */
import { renderAt } from './scene.js';
import { mountStream, applyFilm } from '../assets/lib/stream.js';

const ID = 'web-s10';
const DUR = 3.6333; // 109 frames
const gsap = window.gsap;
const $ = (id) => document.getElementById(id);
await Promise.all(['500 118px "Newsreader"', 'italic 500 118px "Newsreader"'].map((f) => document.fonts.load(f)));

const T0 = 59.2667;
const render = mountStream($('captions'), {
  segments: [
    { at: 0, place: 'below', in: 'none', tone: 'light', html: 'From hundreds of pages,<br>to <em>one</em> clear brief.', out: 'wipe', outDur: 0.42 },
    { at: 0.0001, html: null },
  ],
});

const film = $('film');
function renderWeb(t) {
  renderAt(T0 + t);
  const { rec, fx, fxp } = render(t);
  applyFilm(film, rec, fx, fxp ?? {});
}

const clock = { t: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(clock, { t: DUR, duration: DUR, ease: 'none', onUpdate: () => renderWeb(clock.t) }, 0);
renderWeb(0);
export const timeline = tl;
export const compositionId = ID;

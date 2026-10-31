/* LawVriksh web cut — part 10: back to the office (web 0–7.83 s = reel 51.43–59.23, at its own speed:
 * the footage plays in full, as the user asked). Plan §11.
 *
 * Section 9's scene in reel time, with one change (rev. 6): the brief, the app page and the laptop
 * screen are one continuous pull back (51.45–52.50), not a glide into the app followed by a pull back.
 *   0.00 none    "Prepare for your next hearing." carried over as the subtitle
 *   0.10 recede  as the page pulls back into the laptop, the subtitle recedes with it into the screen
 *   2.30 rise    over the office, in light type, the film's closing line rises (carried into part 11,
 *                where the window light wipes it away)
 * The frame's labels fade out with the office: the brand closes the film clean.
 */
import { renderAt } from './scene.js';
import { mountStream, applyFilm } from '../assets/lib/stream.js';

const ID = 'web-s9';
const DUR = 7.8333; // 235 frames
const gsap = window.gsap;
const $ = (id) => document.getElementById(id);
await Promise.all(['500 118px "Newsreader"', 'italic 500 118px "Newsreader"'].map((f) => document.fonts.load(f)));

const T0 = 51.4333;
const SCREEN_C = { x: 745, y: 563 }; // the laptop screen's centre in the footage (section 9's measured quad)

const CH = ['The problem', 'Upload', 'OCR', 'Case map', 'Tabular', 'Timeline', 'Ask', 'Draft', 'Insights', 'Hearing'];
const render = mountStream($('captions'), {
  segments: [
    { at: 0, place: 'below', in: 'none', html: 'Prepare for your next <em>hearing</em>.', out: 'recede', point: SCREEN_C, outDur: 0.9 },
    { at: 0.1, html: null },
    { at: 2.3, place: 'below', in: 'rise', tone: 'light', html: 'From hundreds of pages,<br>to <em>one</em> clear brief.' },
  ],
  hud: { chapters: CH, chapter: () => ({ num: 9, name: 'Hearing prep', case: 'Arora v. Meridian Estates  ·  ARB.P. 428/2026' }), start: -1, end: 1.2 },
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

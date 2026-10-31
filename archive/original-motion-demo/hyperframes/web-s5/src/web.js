/* LawVriksh web cut — part 6: Ask (web 0–8.13 s ↔ reel 41.53–44.04). Plan §11–12.
 *
 * Section 5's approved scene through a time map; its opening plate is the web timeline's last frame
 * (plates/timeline-exit.png, re-made from web-s4). In the reel the timeline fell away; here it slides
 * off to the left as its rail tips into the prompt box. The sand slab and "Ask." are hidden.
 * Revision 6 (22 Oct): Ask runs ≈ 7 s and its only narrative is one subtitle; the typing stays brisk
 * and the extra time goes to the answer and its citations. As the window builds, the film rises
 * 110 px so the composer clears the subtitle.
 *   0.00 none   "Each one keeps its source." carried over; it sweeps away left with the timeline
 *   2.30 highlight  as the answer streams: "Every answer backed by source citation."; the marker
 *               sweeps "source citation" as the citations land (3.2–3.75), then the result holds
 *   6.95 wave   Draft is a new feature: the Ask window pans away left and the Draft heading ripples
 *               in at the centre (part 7's page then slides in from the right)
 */
import { renderAt } from './scene.js';
import { mountStream, applyFilm, timeMap } from '../assets/lib/stream.js';

const ID = 'web-s5';
const DUR = 8.1333; // 244 frames
const gsap = window.gsap;
const EZ = (name) => gsap.parseEase(name);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const $ = (id) => document.getElementById(id);
await Promise.all(['500 118px "Newsreader"', 'italic 500 118px "Newsreader"'].map((f) => document.fonts.load(f)));

const reel = timeMap([
  [0, 41.5333],
  [1.55, 42.62],                 // the timeline slides off; the question types (brisk)
  [2.05, 42.98],                 // sent; the window builds around the composer
  [3.2, 43.6],                   // the answer streams
  [3.75, 43.84],                 // citations; marks on the answer
  [6.95, 44.04],                 // the result holds: the answer and its citations read
  [8.1333, 44.04],               // under the Draft heading
]);

const CH = ['The problem', 'Upload', 'OCR', 'Case map', 'Tabular', 'Timeline', 'Ask', 'Draft', 'Insights', 'Hearing'];
const render = mountStream($('captions'), {
  segments: [
    { at: 0, place: 'below', in: 'none', html: 'Each one keeps its <em>source</em>.', out: 'sweep', dir: [-520, 0], outDur: 0.55 },
    { at: 0.0001, html: null },
    { at: 2.3, place: 'below', in: 'highlight', dur: 1.4, html: 'Every answer backed by <em>source citation</em>.', out: 'sweep', dir: [-420, 0], outDur: 0.6 },
    { at: 6.95, place: 'center', in: 'wave', dur: 0.7, fx: 'pan', fxp: { dir: -1 }, recDur: 0.9, html: 'Create a working <em>draft</em>.' },
  ],
  hud: { chapters: CH, chapter: (t) => (t < 6.95 ? { num: 6, name: 'Ask', case: 'Arora v. Meridian Estates  ·  ARB.P. 428/2026' } : { num: 7, name: 'Draft', case: 'Separate example  ·  bail application (Vikram)' }), start: -1 },
});

const film = $('film');
function renderWeb(t) {
  const r = reel(t);
  renderAt(r);
  // the timeline slides off to the left instead of falling (the reel's fall is used once, in part 5)
  const fall = EZ('power2.in')(seg(r, 41.56, 41.86));
  if (fall < 1) Object.assign($('plate').style, { transform: `translateX(${(-460 * fall).toFixed(1)}px)`, opacity: (1 - fall).toFixed(3), filter: fall > 0.01 ? `blur(${(5 * fall).toFixed(2)}px)` : 'none' });
  const { rec, fx, fxp } = render(t);
  applyFilm(film, rec, fx, fxp ?? {});
  // the window builds a little higher than in the reel: the composer clears the subtitle
  const up = -110 * EZ('power3.inOut')(seg(r, 42.7, 43.1));
  if (up < -0.05) film.style.transform = `translateY(${up.toFixed(1)}px) ${film.style.transform === 'none' ? '' : film.style.transform}`;
}

const clock = { t: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(clock, { t: DUR, duration: DUR, ease: 'none', onUpdate: () => renderWeb(clock.t) }, 0);
renderWeb(0);
export const timeline = tl;
export const compositionId = ID;

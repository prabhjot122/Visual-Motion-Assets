/* LawVriksh web cut — part 9: Hearing Prep (web 0–3.0 s ↔ reel 49.63–51.40). Plan §11–12.
 *
 * Section 8's approved scene through a time map; its opening plate is the web Insights' last frame
 * (plates/insights-exit.png, re-made from web-s7). The viewer and the Insights panel still carry
 * over into the brief card and the review panel; the plate behind them now recedes into the paper
 * instead of falling.
 *   0.00 none   "…without reading every page." carried over as the subtitle
 *   0.30 zoom   as the brief sets, the subtitle changes: "Prepare for your next hearing." comes up out
 *               of depth; the brief and its open review item then hold, readable (carried into part 10)
 */
import { renderAt } from './scene.js';
import { mountStream, applyFilm, timeMap } from '../assets/lib/stream.js';

const ID = 'web-s8';
const DUR = 3.0; // 90 frames
const gsap = window.gsap;
const EZ = (name) => gsap.parseEase(name);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const $ = (id) => document.getElementById(id);
await Promise.all(['500 118px "Newsreader"', 'italic 500 118px "Newsreader"'].map((f) => document.fonts.load(f)));

const reel = timeMap([[0, 49.6333], [3.0, 51.4]]); // 1.7× longer: the brief gets time to be read

const CH = ['The problem', 'Upload', 'OCR', 'Case map', 'Tabular', 'Timeline', 'Ask', 'Draft', 'Insights', 'Hearing'];
const render = mountStream($('captions'), {
  segments: [
    { at: 0, place: 'below', in: 'none', html: '…without reading <em>every page</em>.' },
    { at: 0.3, place: 'below', in: 'zoom', dur: 0.8, html: 'Prepare for your next <em>hearing</em>.' },
  ],
  hud: { chapters: CH, chapter: () => ({ num: 9, name: 'Hearing prep', case: 'Arora v. Meridian Estates  ·  ARB.P. 428/2026' }), start: -1 },
});

const film = $('film');
function renderWeb(t) {
  const r = reel(t);
  renderAt(r);
  // the Insights frame recedes into the paper (the reel's fall is used once, in part 5)
  const fall = EZ('power2.inOut')(seg(r, 49.64, 49.9));
  if (fall < 1) Object.assign($('plate').style, { transform: `scale(${(1 - 0.08 * fall).toFixed(4)})`, transformOrigin: '720px 500px', opacity: (1 - fall).toFixed(3), filter: fall > 0.01 ? `blur(${(6 * fall).toFixed(2)}px)` : 'none' });
  const { rec, fx, fxp } = render(t);
  applyFilm(film, rec, fx, fxp ?? {});
}

const clock = { t: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(clock, { t: DUR, duration: DUR, ease: 'none', onUpdate: () => renderWeb(clock.t) }, 0);
renderWeb(0);
export const timeline = tl;
export const compositionId = ID;

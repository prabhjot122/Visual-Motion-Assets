/* LawVriksh web cut — part 3: the Case Map (web 0–10.3 s ↔ reel 33.13–38.13). Plan §11–12.
 *
 * Section 3's approved camera through a time map (the conflict clicks get room to read); the char
 * slab and the one-word titles are hidden. Narrative is a bottom subtitle; each one reads ≈ 1 s once
 * it is complete:
 *   0.00 none     "Every fact, mapped to its source." carried over at the centre, the film risen away
 *   0.40 split    its two lines part, and the map builds in the gap as the film settles back
 *   1.60 stamp    the click on Conflicts: the subtitle is pressed in
 *   3.20 wave     the two versions open: a ripple runs through the next subtitle
 *   5.00 highlight Frame C: the subtitle lands, then a marker sweeps its key word
 *   7.00 cascade  Version B opens its source: the subtitle slides in from the left
 *   9.00 stream   Tabular review is a new feature: the film irises closed on the source passage and its
 *                 heading streams in at the centre (the Tabular review opens out of that passage)
 */
import { renderAt } from './scene.js';
import { mountStream, applyFilm, timeMap } from '../assets/lib/stream.js';

const ID = 'web-s3';
const DUR = 10.3; // 309 frames
const gsap = window.gsap;
const $ = (id) => document.getElementById(id);
await Promise.all(['500 118px "Newsreader"', 'italic 500 118px "Newsreader"'].map((f) => document.fonts.load(f)));

const reel = timeMap([
  [0, 33.1333], [0.4, 33.1333],
  [1.6, 34.32],                  // D5 the map builds; the cursor goes to Conflicts
  [3.1, 34.97],                  // D6 the conflicts open
  [4.6, 35.5],                   // D7 Version A / B, the Conflict panel
  [6.8, 36.68],                  // D8 Frame C
  [9.0, 38.1333],                // D9 Version B → its source; Verify fact (never pressed)
  [10.3, 38.1333],
]);

// the source passage on the order page (the film irises closed on it)
renderAt(38.1);
const hr = $('hl-1').getBoundingClientRect();
const passage = { x: hr.left + hr.width / 2, y: hr.top + hr.height / 2 };
renderAt(33.1333);
window.__lvMeasure = { passage }; // read by web-cut/measure.mjs so part 4's iris opens where this one closes

const ARORA = 'Arora v. Meridian Estates  ·  ARB.P. 428/2026';
const CH = ['The problem', 'Upload', 'OCR', 'Case map', 'Tabular', 'Timeline', 'Ask', 'Draft', 'Insights', 'Hearing'];
const render = mountStream($('captions'), {
  segments: [
    { at: 0, place: 'center', in: 'none', fx: 'rise', html: 'Every fact, mapped<br>to its <em>source</em>.', out: 'split', outDur: 1.0 },
    { at: 0.4, html: null },
    { at: 1.6, place: 'below', in: 'stamp', dur: 0.7, html: 'Conflicts surface on their <em>own</em>.' },
    { at: 3.2, place: 'below', in: 'wave', dur: 0.7, html: 'Two sources disagree on <em>one</em> fact.' },
    { at: 5.0, place: 'below', in: 'highlight', html: 'Resolve it against the <em>record</em>.' },
    { at: 7.0, place: 'below', in: 'cascade', dur: 0.7, html: 'Open the source. <em>Verify</em> before relying on it.' },
    { at: 9.0, place: 'center', in: 'stream', wait: 0.2, dur: 0.6, recDur: 0.8, fx: 'iris', fxp: passage, html: 'Compare documents<br><em>side by side</em>.' },
  ],
  hud: { chapters: CH, chapter: (t) => (t < 9.0 ? { num: 3, name: 'Case map', case: ARORA } : { num: 4, name: 'Tabular review', case: ARORA }), start: -1 },
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

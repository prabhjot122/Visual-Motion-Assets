/* LawVriksh web cut — part 7: Draft (web 0–6.1 s ↔ reel 44.27–46.18). Plan §11–12.
 *
 * Section 6's approved scene (the separate Vikram example, labelled as such in the frame) through a
 * time map. The clay slab wipe and "Draft." are hidden; the sand strip stays, settling while the
 * film is still behind the veil. Revision 6 (22 Oct): Draft runs ≈ 6 s with part 6's heading.
 *   0.00 none   "Create a working draft." carried over at the centre
 *   0.40 morph  the page slides in from the right (pan) and the heading settles into the first
 *               subtitle; the page holds still 1.2–1.6 before it writes itself
 *   1.60–2.45   the page writes itself: yellow "to be confirmed" fields, blue facts from the instructions
 *   2.60 reveal the checks count, the thread hops fact → field → "Must fix": a clay rule wipes the next
 *               subtitle on; the checked draft holds
 *   4.80 rise   the page shrinks back into the paper; the Insights heading rises line by line at the
 *               centre (continued in part 8)
 */
import { renderAt } from './scene.js';
import { mountStream, applyFilm, timeMap } from '../assets/lib/stream.js';

const ID = 'web-s6';
const DUR = 6.1; // 183 frames
const gsap = window.gsap;
const $ = (id) => document.getElementById(id);
await Promise.all(['500 118px "Newsreader"', 'italic 500 118px "Newsreader"'].map((f) => document.fonts.load(f)));

const reel = timeMap([
  [0, 44.2667],
  [1.6, 44.6],                   // the page slides in and settles, blank but for its heading
  [2.45, 45.22],                 // the page writes itself
  [3.5, 45.85],                  // the checks count; the thread hops to "Must fix"
  [4.8, 46.18],                  // the checked draft holds
  [6.1, 46.18],                  // under the Insights heading
]);

const CH = ['The problem', 'Upload', 'OCR', 'Case map', 'Tabular', 'Timeline', 'Ask', 'Draft', 'Insights', 'Hearing'];
const render = mountStream($('captions'), {
  segments: [
    { at: 0, place: 'center', in: 'none', fx: 'pan', fxp: { dir: 1 }, html: 'Create a working <em>draft</em>.' },
    { at: 0.4, place: 'below', in: 'morph', fit: true, recDur: 0.8, html: 'Start with your <em>instructions</em>.' },
    { at: 2.6, place: 'below', in: 'reveal', dur: 0.7, html: 'Review what still <em>needs attention</em>.' },
    { at: 4.8, place: 'center', in: 'rise', fx: 'shrink', recDur: 1.0, html: 'The key points of<br><em>any</em> document,' },
  ],
  hud: { chapters: CH, chapter: (t) => (t < 4.8 ? { num: 7, name: 'Draft', case: 'Separate example  ·  bail application (Vikram)' } : { num: 8, name: 'Insights', case: 'Arora v. Meridian Estates  ·  ARB.P. 428/2026' }), start: -1 },
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

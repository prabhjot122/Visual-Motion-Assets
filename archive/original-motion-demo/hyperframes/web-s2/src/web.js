/* LawVriksh web cut — part 2: upload & extract, OCR review (web 0–14.4 s ↔ reel 24.80–32.90). Plan §11–12.
 *
 * Section 2's approved scene through a time map; the char slab wipes are hidden (the web cut never
 * goes dark) and every turn is carried by the caption stream instead (narrative as bottom subtitles):
 *   0.00 none     "Twelve dates, out of order." carried over from the opening; drops away
 *   0.30 drop     with the first PDF, the next subtitle drops in
 *   3.50 rise     the facts open into tags
 *   5.60 type     OCR review is a new feature: the film sinks away and its heading types at the centre
 *                 (the scene changes behind the veil)
 *   7.20 morph    the film rises back onto the scan; the heading settles into the subtitle, and the
 *                 scan holds still for 0.5 s before the flag snaps (8.40)
 *  10.30 strike   as the wrong word is deleted, the subtitle is struck through; trace: the next one
 *                 is written behind a running clay underline as the correction is typed
 *  13.00 unfold   the scan rises away; the Case Map statement turns in, word by word (continues in part 3)
 */
import { renderAt } from './scene.js';
import { mountStream, applyFilm, timeMap } from '../assets/lib/stream.js';

const ID = 'web-s2';
const DUR = 14.4; // 432 frames
const gsap = window.gsap;
const $ = (id) => document.getElementById(id);
await Promise.all(['500 118px "Newsreader"', 'italic 500 118px "Newsreader"'].map((f) => document.fonts.load(f)));

const reel = timeMap([
  [0, 24.8],
  [3.8, 27.95],                  // D1–D2 the PDFs drop and run the processing line (1.2× longer)
  [4.9, 28.5],                   // the five facts hang on the thread
  [6.1, 28.55],                  // the film sinks under the OCR heading
  [6.1001, 29.25],               // behind the veil: past the hidden slab, onto the scan
  [8.4, 29.25],                  // the scan settles under the heading, then holds still (7.9–8.4)
  [10.3, 31.0],                  // D3 the flag snaps onto the unclear word, highlighted
  [12.5, 32.9],                  // D4 deleted, retyped, saved; the editor comes forward
  [14.4, 32.9],                  // under the Case Map statement
]);

const ARORA = 'Arora v. Meridian Estates  ·  ARB.P. 428/2026';
const CH = ['The problem', 'Upload', 'OCR', 'Case map', 'Tabular', 'Timeline', 'Ask', 'Draft', 'Insights', 'Hearing'];
const render = mountStream($('captions'), {
  segments: [
    { at: 0, place: 'below', in: 'none', html: 'Twelve dates, <em>out of order</em>.', out: 'drop', outDur: 0.9 },
    { at: 0.3, place: 'below', in: 'drop', wait: 0.45, html: 'Upload the case files, and LawVriksh<br>reads <em>every page</em>.' },
    { at: 3.5, place: 'below', in: 'rise', html: 'Out come the facts,<br>each <em>linked</em> to its page.' },
    { at: 5.6, place: 'center', in: 'type', dur: 0.75, fx: 'sink', recDur: 0.5, html: 'Review <em>unclear</em> text.' },
    { at: 7.2, place: 'below', in: 'morph', fit: true, recDur: 0.7, html: 'Unclear words are <em>flagged</em> for your review.', out: 'strike', outDur: 0.9 },
    { at: 10.3, place: 'below', in: 'trace', html: 'Correct the text. Keep its <em>source link</em>.' },
    { at: 13.0, place: 'center', in: 'unfold', fx: 'rise', html: 'Every fact, mapped<br>to its <em>source</em>.' },
  ],
  // the OCR scan is the separate Arif Jafar example: the frame never names the Arora matter over it
  hud: { chapters: CH, chapter: (t) => (t < 5.6 ? { num: 1, name: 'Upload', case: ARORA } : t < 13.0 ? { num: 2, name: 'OCR review', case: 'Separate example  ·  supplied Supreme Court scan' } : { num: 3, name: 'Case map', case: ARORA }), start: -1 },
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

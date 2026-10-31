/* LawVriksh graphics track — section 9, global reel time 51.4333–59.2667 s (C1 + C2, closing).
 *
 * Composition time 0 = reel 51.4333 s (frame 1543). renderAt(t) takes GLOBAL reel
 * seconds and is a pure function of time. Ends before frame 1778 (59.2667); C3's
 * wipe to paper begins at 59.25.
 *
 * Opening entered through paper; the closing exits through the laptop screen.
 *   51.42 ("As technology") d14's decorations peel off; the brief card and the review
 *         panel glide into the Hearing Prep page (capture 13, rebuilt without Accept /
 *         Regenerate / Sign off) and the app's chrome sets around them
 *   51.80–52.40 the page pulls back onto the laptop screen's quad (homography) while the
 *         office footage zooms out under it; the paper dissolves (footage visible 52.30)
 *   52.30 corner marks lock on the four screen corners; 52.75 ("evolves") they release
 *   52.95–59.25 C2: the office hold, ≈3 % push; the page stays on the screen, graded to it
 * Footage clip time = reel − 48.30 (clip 3.13–10.97 s; the opening used 0.50–2.35).
 */
const ID = 'section-9';
const T0 = 51.4333, DUR = 7.8333; // 235 frames at 30 fps: 51.4333–59.2333
const gsap = window.gsap;
const EZ = (name) => gsap.parseEase(name);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const tw = (t, a, b, e = 'power2.inOut') => EZ(e)(seg(t, a, b));
const $ = (id) => document.getElementById(id);
const show = (node, on) => { node.style.display = on ? '' : 'none'; return on; };
const corners = (x0, y0, x1, y1, L = 18) => `M${x0} ${y0 + L}V${y0}H${x0 + L}M${x1 - L} ${y0}H${x1}V${y0 + L}M${x1} ${y1 - L}V${y1}H${x1 - L}M${x0 + L} ${y1}H${x0}V${y1 - L}`;

await Promise.all(['400 100px "Newsreader"', 'italic 500 44px "Newsreader"', '600 13px "Figtree"', '400 30px "Instrument Serif"', 'italic 400 30px "Instrument Serif"'].map((f) => document.fonts.load(f)));
await document.fonts.ready;

/* ------------------------------------------------------------- homography (from the pilot) */
// 3×3 homography helpers (row-major). sq2quad maps the unit square onto q (TL, TR, BR, BL).
function sq2quad(q) {
  const [p0, p1, p2, p3] = q;
  const dx1 = p1.x - p2.x, dx2 = p3.x - p2.x, dx3 = p0.x - p1.x + p2.x - p3.x;
  const dy1 = p1.y - p2.y, dy2 = p3.y - p2.y, dy3 = p0.y - p1.y + p2.y - p3.y;
  const den = dx1 * dy2 - dx2 * dy1, g = (dx3 * dy2 - dx2 * dy3) / den, h = (dx1 * dy3 - dx3 * dy1) / den;
  return [p1.x - p0.x + g * p1.x, p3.x - p0.x + h * p3.x, p0.x, p1.y - p0.y + g * p1.y, p3.y - p0.y + h * p3.y, p0.y, g, h, 1];
}
const mul3 = (a, b) => [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j]));
const css3 = (m) => { const n = m.map((v) => v / m[8]); return `matrix3d(${[n[0], n[3], 0, n[6], n[1], n[4], 0, n[7], 0, 0, 1, 0, n[2], n[5], 0, n[8]].map((v) => v.toFixed(9)).join(',')})`; };
const scaleRect = (w, h) => [1 / w, 0, 0, 0, 1 / h, 0, 0, 0, 1];
const rectQuad = (x0, y0, x1, y1) => [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }];
const quadCentre = (q) => ({ x: q.reduce((s, p) => s + p.x, 0) / 4, y: q.reduce((s, p) => s + p.y, 0) / 4 });
const scaleQuad = (q, s) => { const c = quadCentre(q); return q.map((p) => ({ x: c.x + (p.x - c.x) * s, y: c.y + (p.y - c.y) * s })); };
function cornerPath(q, arm = 16) { // L-marks at the four corners of a quad, arms along its edges
  let d = '';
  for (let i = 0; i < 4; i++) {
    const p = q[i], a = q[(i + 1) % 4], b = q[(i + 3) % 4];
    const ua = Math.hypot(a.x - p.x, a.y - p.y) || 1, ub = Math.hypot(b.x - p.x, b.y - p.y) || 1;
    d += `M${(p.x + (a.x - p.x) / ua * arm).toFixed(1)} ${(p.y + (a.y - p.y) / ua * arm).toFixed(1)}L${p.x.toFixed(1)} ${p.y.toFixed(1)}L${(p.x + (b.x - p.x) / ub * arm).toFixed(1)} ${(p.y + (b.y - p.y) / ub * arm).toFixed(1)}`;
  }
  return d;
}

/* ------------------------------------------------------------- geometry */
const K = 1000 / 1080; // source px → canvas px (O1's layout: 1770.37 × 1000 at x −18.52)
// the laptop's display area, line-fitted on the clip (locked camera: one quad for the whole clip)
const SCREEN = [[619.2, 488.7], [984.1, 457.0], [1027.7, 714.2], [664.8, 771.5]].map(([x, y]) => ({ x: x * K - 18.52, y: y * K }));
const SC = quadCentre(SCREEN), PUSH_C = { x: 820, y: 560 };
const PAGE_W = 1440, PAGE_H = 900, PAGE0 = rectQuad(0, 50, PAGE_W, 50 + PAGE_H);
const PUSH0 = 1.005942; // section 8's hold push at 51.40 (stage scale about 720, 520)

// the footage camera: zooms out under the page (pull-back), then C2's slow push
function footCam(t) {
  if (t < 52.7) return { z: lerp(1.5, 1, tw(t, 51.8, 52.4, 'power3.inOut')), c: SC };
  return { z: 1 + 0.03 * tw(t, 52.95, 59.4, 'sine.inOut'), c: PUSH_C };
}
const camPt = ({ z, c }, p) => ({ x: c.x + (p.x - c.x) * z, y: c.y + (p.y - c.y) * z });

/* the brief and the panel: d14's poses (page-local, the page sitting at y 50) → the page's layout */
const brief = $('brief'), review = $('review');
const BRIEF = { a: { x: 80, y: 250, s: 1.25 }, b: { x: 340, y: 76, s: 1 } };
const REVIEW = { a: { x: 1062, y: 346, s: 1.2 }, b: { x: 1124, y: 76, s: 1 } };
const place = (el, p) => { el.style.transform = `translate(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px) scale(${p.s.toFixed(5)})`; };
$('page').style.transform = 'translate(0px, 50px)';
place(brief, BRIEF.a); place(review, REVIEW.a);
$('qual').style.left = '80px'; $('qual').style.top = `${300 + (brief.offsetHeight - 2) * 1.25 + 16}px`; // section 8's shell had no border

// d14's thread and marks (measured in the d14 pose, before any push)
const box = (el) => el.getBoundingClientRect();
const at = box($('attn')), it = box($('item'));
const P = 12, fx0 = it.left - P, fy0 = it.top - P, fx1 = it.right + P, fy1 = it.bottom + P, fmy = (fy0 + fy1) / 2, amy = at.top + at.height / 2;
const thread = $('thread');
thread.setAttribute('d', `M${at.right + 6} ${amy} C ${at.right + 160} ${amy}, ${fx0 - 160} ${fmy}, ${fx0 - 4} ${fmy}`);
thread.setAttribute('pathLength', 1); thread.setAttribute('stroke-dasharray', '1 1');
$('focal').setAttribute('d', corners(fx0, fy0, fx1, fy1));
$('focal').style.transformOrigin = `${(fx0 + fx1) / 2}px ${fmy}px`;

// her knuckles rise in front of the screen's lower-right corner from ≈58.6: per-frame cut-outs of
// the hand, keyed from a page-less render of this composition (push baked in), sit above the page
const HAND_K = [214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 228, 229, 230, 231, 232, 233, 234];
const hands = new Map(HAND_K.map((k) => { const im = document.createElement('img'); im.src = `assets/hand/h${k}.png`; im.alt = ''; Object.assign(im.style, { position: 'absolute', left: '740px', top: '540px', display: 'none' }); $('hand-layer').appendChild(im); return [k, im]; }));
await Promise.all([...hands.values()].map((im) => im.decode()));
const CHROME = ['rail', 'topbar', 'index', 'verdict', 'docs'].map($);
const rise = (el, t, a, d = 12) => { const u = tw(t, a, a + 0.3, 'expo.out'); el.style.opacity = seg(t, a, a + 0.16).toFixed(3); el.style.transform = `translateY(${(d * (1 - u)).toFixed(2)}px)`; };

/* =============================================================== renderAt */
function renderAt(t) {
  /* section 8's push relaxes */
  const push = lerp(PUSH0, 1, tw(t, 51.44, 51.75, 'power2.inOut'));
  $('stage').style.transformOrigin = '720px 520px'; $('stage').style.transform = `scale(${push.toFixed(5)})`;

  /* d14's decorations peel off; the thread and its marks retract */
  const peel = tw(t, 51.43, 51.75, 'power2.in');
  if (show($('block-wrap'), peel < 1)) $('block-wrap').style.transform = `translateY(${(-190 * peel).toFixed(1)}px)`;
  if (show($('sand'), peel < 1)) $('sand').style.transform = `translateY(${(330 * peel).toFixed(1)}px)`;
  $('guides').style.opacity = (1 - tw(t, 51.43, 51.65, 'power1.in')).toFixed(3);
  $('label').style.opacity = (1 - seg(t, 51.45, 51.62)).toFixed(3); $('label').style.transform = `translateY(${(-16 * peel).toFixed(1)}px)`;
  $('qual').style.opacity = (1 - seg(t, 51.45, 51.62)).toFixed(3); $('qual').style.transform = `translateY(${(16 * peel).toFixed(1)}px)`;
  thread.setAttribute('stroke-dashoffset', tw(t, 51.43, 51.6, 'power2.in').toFixed(4)); thread.style.opacity = t < 51.6 ? 1 : 0;
  const fo = seg(t, 51.43, 51.58); $('focal').style.opacity = (1 - fo).toFixed(3); $('focal').style.transform = `scale(${lerp(1, 1.2, fo).toFixed(4)})`;

  /* the brief and the panel glide into the Hearing Prep page; the app's chrome sets around them */
  const g = tw(t, 51.45, 51.85, 'power3.inOut');
  const mix = (A) => ({ x: lerp(A.a.x, A.b.x, g), y: lerp(A.a.y, A.b.y, g), s: lerp(A.a.s, A.b.s, g) });
  place(brief, mix(BRIEF)); place(review, mix(REVIEW));
  brief.style.boxShadow = `0 ${lerp(22, 2, g).toFixed(1)}px ${lerp(60, 6, g).toFixed(1)}px rgba(20,16,12,${lerp(0.24, 0.06, g).toFixed(3)})`;
  review.style.boxShadow = `0 ${lerp(18, 0, g).toFixed(1)}px ${lerp(48, 0, g).toFixed(1)}px rgba(20,16,12,${lerp(0.22, 0, g).toFixed(3)})`;
  $('page-bg').style.opacity = tw(t, 51.5, 51.8, 'power1.inOut').toFixed(3);
  CHROME.forEach((el, i) => rise(el, t, 51.56 + i * 0.04));

  /* pull back: the page shrinks onto the laptop screen as the footage zooms out under it */
  const cam = footCam(t), fq = SCREEN.map((p) => camPt(cam, p));
  $('footage-world').style.transform = `translate(${(cam.c.x * (1 - cam.z)).toFixed(2)}px, ${(cam.c.y * (1 - cam.z)).toFixed(2)}px) scale(${cam.z.toFixed(5)})`;
  const u = tw(t, 51.8, 52.4, 'power3.inOut');
  const q = PAGE0.map((p, i) => ({ x: lerp(p.x, fq[i].x, u), y: lerp(p.y, fq[i].y, u) }));
  $('page').style.transform = css3(mul3(sq2quad(q), scaleRect(PAGE_W, PAGE_H)));
  const gr = tw(t, 51.95, 52.4, 'power1.inOut');
  $('grade').style.opacity = gr.toFixed(3); $('glare').style.opacity = gr.toFixed(3);

  /* the paper dissolves into the office (footage visible from 52.30) */
  const paper = 1 - tw(t, 52.0, 52.3, 'power1.inOut');
  show($('paper'), paper > 0); $('paper').style.opacity = paper.toFixed(3);
  $('vignette').style.opacity = paper.toFixed(3);

  /* the hand stays in front of the screen */
  const fk = Math.round((t - T0) * 30); hands.forEach((im, k) => { im.style.display = k === fk ? '' : 'none'; });

  /* corner marks lock on the four screen corners, then release on "evolves" */
  const lock = tw(t, 52.3, 52.55, 'expo.out'), rel = tw(t, 52.75, 52.95, 'expo.out');
  const on = t >= 52.3 && t < 52.95;
  $('marks').setAttribute('d', on ? cornerPath(scaleQuad(fq, lerp(1.5, 1, lock) * lerp(1, 1.2, rel)), 18) : '');
  $('marks').style.opacity = (seg(t, 52.3, 52.38) * (1 - seg(t, 52.75, 52.95))).toFixed(3);
}

/* ------------------------------------------------------------- timeline */
const clock = { t: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(clock, { t: DUR, duration: DUR, ease: 'none', onUpdate: () => renderAt(T0 + clock.t) }, 0);
renderAt(T0);
window.__lvSection9 = { renderAt, T0 };
export const timeline = tl;
export const compositionId = ID;

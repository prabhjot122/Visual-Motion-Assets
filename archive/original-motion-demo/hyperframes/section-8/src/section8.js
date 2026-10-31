/* LawVriksh graphics track — section 8, global reel time 49.6333–51.4333 s (D14, Hearing Prep).
 *
 * Composition time 0 = reel 49.6333 s (frame 1489). renderAt(t) takes GLOBAL reel
 * seconds and is a pure function of time. Ends on the reel's 51.415 jump cut;
 * the closing (C1) begins at 51.42.
 *
 * The locked Hearing Prep window: the saved Arora brief (capture 13, still d14)
 * SETS — it is never shown as generated. No Accept / Regenerate / Sign-off; the
 * one review item stays open. 28 Oct 2026 is labelled presentation-only.
 *   49.64 section 7's frame falls away; its viewer and Insights panel carry over and
 *         reshape into the Hearing brief card and the Preparation Review panel
 *   49.95–50.40 the brief's fields set ("every" 50.02, "single" 50.34); counts 0 · 1 · 0
 *   50.36 NEEDS ATTENTION pulses; the clay thread runs to the open review item; marks lock
 *   50.65–51.40 readable hold ("page." 50.70) to the cut
 */
const ID = 'section-8';
const T0 = 49.6333, DUR = 1.8; // 54 frames at 30 fps: 49.6333–51.4000
const gsap = window.gsap;
const EZ = (name) => gsap.parseEase(name);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const tw = (t, a, b, e = 'power2.inOut') => EZ(e)(seg(t, a, b));
const $ = (id) => document.getElementById(id);
const show = (node, on) => { node.style.display = on ? '' : 'none'; return on; };
const corners = (x0, y0, x1, y1, L = 18) => `M${x0} ${y0 + L}V${y0}H${x0 + L}M${x1 - L} ${y0}H${x1}V${y0 + L}M${x1} ${y1 - L}V${y1}H${x1 - L}M${x0 + L} ${y1}H${x0}V${y1 - L}`;
const rgb = (a, b, u) => `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], u))).join(',')})`;

await Promise.all(['400 100px "Newsreader"', 'italic 500 44px "Newsreader"', '600 13px "Figtree"', '400 30px "Instrument Serif"', 'italic 400 30px "Instrument Serif"'].map((f) => document.fonts.load(f)));
await document.fonts.ready;

/* ------------------------------------------------------------ geometry (d14) */
const PUSH0 = 1.00989;                                              // section 7's hold push at 49.60 (stage scale about 720, 520)
const BRIEF = { x: 80, y: 300, s: 1.25 }, REVIEW = { x: 1062, y: 396, s: 1.2 };
const brief = $('brief'), review = $('review');
brief.style.transform = `translate(${BRIEF.x}px, ${BRIEF.y}px) scale(${BRIEF.s})`;
review.style.transform = `translate(${REVIEW.x}px, ${REVIEW.y}px) scale(${REVIEW.s})`;
// the carried-over containers: section 7's viewer and Insights panel → d14's brief card and review panel
const SHELLS = [
  { el: $('brief-shell'), from: { x: 40, y: 240, w: 860, h: 820, r: 16, bg: [241, 238, 233] }, to: { x: BRIEF.x, y: BRIEF.y, w: 760 * BRIEF.s, h: brief.offsetHeight * BRIEF.s, r: 16 * BRIEF.s, bg: [255, 255, 255] }, at: [49.68, 50.1] },
  { el: $('review-shell'), from: { x: 930, y: 250, w: 340 * 1.3, h: 492 * 1.3, r: 16 * 1.3, bg: [255, 255, 255] }, to: { x: REVIEW.x, y: REVIEW.y, w: 300 * REVIEW.s, h: review.offsetHeight * REVIEW.s, r: 16 * REVIEW.s, bg: [251, 250, 248] }, at: [49.72, 50.14] },
];
Object.assign($('qual').style, { left: `${BRIEF.x}px`, top: `${SHELLS[0].to.y + SHELLS[0].to.h + 16}px` });

const box = (el) => el.getBoundingClientRect();
const at = box($('attn')), it = box($('item'));
const P = 12, fx0 = it.left - P, fy0 = it.top - P, fx1 = it.right + P, fy1 = it.bottom + P, fmy = (fy0 + fy1) / 2, amy = at.top + at.height / 2;
const thread = $('thread');
thread.setAttribute('d', `M${at.right + 6} ${amy} C ${at.right + 160} ${amy}, ${fx0 - 160} ${fmy}, ${fx0 - 4} ${fmy}`);
['thread', 'g-h', 'g-v'].forEach((id) => { $(id).setAttribute('pathLength', 1); $(id).setAttribute('stroke-dasharray', '1 1'); });

const SET = [...brief.querySelectorAll('[data-set]')], SET_T = [49.95, 50.1, 50.14, 50.2, 50.24, 50.28, 50.32];
const RSET = [...review.querySelectorAll('[data-rset]')], TILES = [...review.querySelectorAll('[data-tile]')];
const rise = (el, t, a, d = 12) => { const u = tw(t, a, a + 0.3, 'expo.out'); el.style.opacity = seg(t, a, a + 0.16).toFixed(3); el.style.transform = `translateY(${(d * (1 - u)).toFixed(2)}px)`; };

/* =============================================================== renderAt */
function renderAt(t) {
  /* section 7's frame falls away; the live containers sit exactly under it */
  const fall = tw(t, 49.64, 49.88, 'power2.in');
  if (show($('plate-layer'), fall < 1)) {
    Object.assign($('plate').style, { transform: `translateY(${(140 * fall).toFixed(1)}px) scale(${(1 - 0.03 * fall).toFixed(4)})`, opacity: (1 - fall).toFixed(3), filter: fall > 0.01 ? `blur(${(4 * fall).toFixed(2)}px)` : 'none' });
  }
  $('vignette').style.opacity = fall.toFixed(3);

  /* section 7's push relaxes; a ≤1 % drift through the hold */
  const push = lerp(PUSH0, 1, tw(t, 49.64, 50.0, 'power2.inOut')) * (1 + 0.006 * tw(t, 50.65, 51.45, 'sine.inOut'));
  $('stage').style.transformOrigin = '720px 520px'; $('stage').style.transform = `scale(${push.toFixed(5)})`;

  /* the containers carry over: viewer → brief card, Insights panel → Preparation Review */
  SHELLS.forEach(({ el, from: a, to: b, at: [t0, t1] }) => {
    const u = tw(t, t0, t1, 'expo.inOut');
    Object.assign(el.style, { left: `${lerp(a.x, b.x, u).toFixed(1)}px`, top: `${lerp(a.y, b.y, u).toFixed(1)}px`, width: `${lerp(a.w, b.w, u).toFixed(1)}px`, height: `${lerp(a.h, b.h, u).toFixed(1)}px`, borderRadius: `${lerp(a.r, b.r, u).toFixed(1)}px`, background: rgb(a.bg, b.bg, u) });
  });

  /* d14's frame: the clay arc squares into the wordmark block; sand rises; pencil guides draw */
  const k = tw(t, 49.7, 50.08, 'power3.inOut'), L = lerp(70, 0, k), T = lerp(0, 10, k), B = lerp(170, 160, k), r = lerp(100, 0.01, k), bx = lerp(110, 0, k);
  $('block').style.clipPath = `path('M${L.toFixed(2)} ${T.toFixed(2)} H300 V${B.toFixed(2)} H${(bx + r).toFixed(2)} A${r.toFixed(2)} ${r.toFixed(2)} 0 0 0 ${bx.toFixed(2)} ${(B - r).toFixed(2)} H${L.toFixed(2)} Z')`;
  rise($('mark'), t, 50.0, 10);
  $('sand').style.transform = `translateY(${(300 * (1 - tw(t, 49.78, 50.2, 'expo.out'))).toFixed(1)}px)`;
  $('g-h').setAttribute('stroke-dashoffset', (1 - tw(t, 49.8, 50.25, 'power2.inOut')).toFixed(4));
  $('g-v').setAttribute('stroke-dashoffset', (1 - tw(t, 49.84, 50.28, 'power2.inOut')).toFixed(4));
  const tag = EZ('back.out(2)')(seg(t, 49.86, 50.1));
  $('label').style.opacity = seg(t, 49.86, 49.96).toFixed(3); $('label').firstChild.style.transform = `scale(${lerp(0.7, 1, tag).toFixed(4)})`;

  /* the saved brief sets (not generated): title on "every", fields stagger in */
  SET.forEach((el, i) => rise(el, t, SET_T[i]));
  $('title').style.transform = `translateY(${(112 * (1 - tw(t, 49.98, 50.32, 'expo.out'))).toFixed(2)}%)`;
  $('rule').style.transform = `scaleX(${tw(t, 50.12, 50.42, 'power3.out').toFixed(4)})`;
  rise($('qual'), t, 50.3, 8);

  /* Preparation Review: counts land 0 · 1 · 0; the one open item */
  RSET.forEach((el, i) => rise(el, t, 50.02 + i * 0.04));
  TILES.forEach((el, i) => { rise(el, t, 50.12 + i * 0.05, 10); el.firstChild.style.transform = `scale(${lerp(0.6, 1, EZ('back.out(3)')(seg(t, 50.16 + i * 0.05, 50.34 + i * 0.05))).toFixed(4)})`; });
  rise($('item'), t, 50.26);

  /* NEEDS ATTENTION pulses; the clay thread runs to the open item; marks lock on it */
  const pu = seg(t, 50.36, 50.62);
  $('attn').style.transform = `scale(${(1 + 0.1 * Math.sin(Math.PI * pu)).toFixed(4)})`;
  const ring = seg(t, 50.36, 50.72);
  Object.assign($('attn-ring').style, { opacity: (ring > 0 && ring < 1 ? 0.8 * (1 - EZ('power1.out')(ring)) : 0).toFixed(3), transform: `scale(${(1 + 0.6 * EZ('expo.out')(ring)).toFixed(4)})` });
  thread.setAttribute('stroke-dashoffset', (1 - tw(t, 50.4, 50.64, 'power2.inOut')).toFixed(4)); thread.style.opacity = t >= 50.4 ? 1 : 0;
  const fk = lerp(1.35, 1, tw(t, 50.55, 50.75, 'expo.out')), cx = (fx0 + fx1) / 2;
  $('focal').setAttribute('d', t >= 50.55 ? corners(cx + (fx0 - cx) * fk, fmy + (fy0 - fmy) * fk, cx + (fx1 - cx) * fk, fmy + (fy1 - fmy) * fk) : '');
}

/* ------------------------------------------------------------- timeline */
const clock = { t: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(clock, { t: DUR, duration: DUR, ease: 'none', onUpdate: () => renderAt(T0 + clock.t) }, 0);
renderAt(T0);
window.__lvSection8 = { renderAt, T0 };
export const timeline = tl;
export const compositionId = ID;

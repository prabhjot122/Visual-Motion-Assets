/* LawVriksh graphics track — section 5, global reel time 41.5333–44.2667 s (D11, Ask).
 *
 * Composition time 0 = reel 41.5333 s (frame 1246, the first after the 41.528 jump
 * cut). renderAt(t) takes GLOBAL reel seconds and is a pure function of time.
 *
 * User direction (22 Oct): Ask starts as pure motion graphics — a prompt box with
 * the query typed into it — and converts into the Ask screen, where the answer
 * generates, the way top product demos show it. The words are exactly the saved
 * Arora Ask session (screenshots/15): the saved question and its saved answer,
 * replayed as typing and a stream. Both amounts stay unresolved.
 *   41.53 section 4's timeline falls away; its clay rail tips horizontal and becomes the prompt box's underline
 *   41.72–42.60 the question types in ("You can also ask questions…")
 *   42.66 send: the text lifts out as the sent message; the box shrinks into the composer; the Ask window builds around it
 *   42.98–43.60 thinking glyph, "Direct answer", the answer streams; the two figures take a clay underline
 *   43.55–43.80 citations; marks on the answer; 44.05 a sand slab covers for Vikram (44.27, locked)
 */
const ID = 'section-5';
const T0 = 41.5333, DUR = 2.7333; // 82 frames at 30 fps: 41.5333–44.2333; frame 1328 (44.2667) begins D12 (locked 44.27)
const gsap = window.gsap;
const EZ = (name) => gsap.parseEase(name);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const tw = (t, a, b, e = 'power2.inOut') => EZ(e)(seg(t, a, b));
const $ = (id) => document.getElementById(id);
const SVGNS = 'http://www.w3.org/2000/svg';
const show = (node, on) => { node.style.display = on ? '' : 'none'; return on; };
const corners = (x0, y0, x1, y1, L = 20) => `M${x0} ${y0 + L}V${y0}H${x0 + L}M${x1 - L} ${y0}H${x1}V${y0 + L}M${x1} ${y1 - L}V${y1}H${x1 - L}M${x0 + L} ${y1}H${x0}V${y1 - L}`;
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

await Promise.all(['400 100px "Newsreader"', 'italic 400 100px "Newsreader"', 'italic 400 30px "Instrument Serif"', '400 15px "Figtree"', '600 16px "Figtree"', '700 16px "Figtree"'].map((f) => document.fonts.load(f)));
await document.fonts.ready;

/* ------------------------------------------------------------ the saved session */
const QUESTION = 'What is the outstanding amount we are claiming, and is it consistent across the record?';
const ANSWER = 'The record is not consistent. The notice invoking arbitration pleads **Rs. 2,30,00,000** as the principal outstanding, while the Section 9 order records **Rs. 1,15,00,000** as presently due for the interim application. Both figures are traceable to their source. The discrepancy remains unresolved.';

/* ------------------------------------------------------------ geometry (d11) */
const WIN = { x: 300, y: 250, w: 1160, h: 800 };
const BIG = { x: 82, y: 430, s: 1.5 }, SMALL = { x: 426, y: 800, s: 1 };   // the prompt box, then the composer
const CW = 850, CH = 94;
const SEND = { x: CW - 16 - 15, y: 50 + 15 };                                  // send button centre, composer-local
const BUBBLE = { x: 627, y: 343 };
// the rail as section 4 left it (x 470, y 294–969.5, under its 1.0118 push about 720, 620)
const PUSH = 1.0118, RAIL0 = { x: 720 + (470 - 720) * PUSH, y0: 620 + (294 - 620) * PUSH, y1: 620 + (969.5 - 620) * PUSH };
const UNDER_BIG = { x0: 0, x1: 1340, y: BIG.y + CH * BIG.s + 27 }, UNDER_SMALL = { x0: 0, x1: 1258, y: 912 };

/* typing: the saved question, letter by letter with a slight human rhythm */
const TYPE = [41.72, 42.6];
const typeTimes = (() => { const r = rng(5), w = [...QUESTION].map((c) => (c === ' ' ? 1.5 : 1) * (0.7 + r() * 0.6)); const sum = w.reduce((a, b) => a + b, 0); let acc = 0; return w.map((x) => (acc += x) / sum); })();

/* the answer, word by word; the two figures carry their clay underline */
const answerEl = $('answer');
const tokens = ANSWER.split(' ');
answerEl.innerHTML = tokens.map((w) => (w.startsWith('**') ? `<span><b>${w.replace(/\*\*/g, '')}<i></i></b></span>` : `<span>${w}</span>`)).join(' ');
// figures are written "**Rs." + "2,30,00,000**": merge the pair into one bold token
answerEl.innerHTML = answerEl.innerHTML.replace(/<span><b>Rs\.<i><\/i><\/b><\/span> <span>([\d,]+)\*\*<\/span>/g, '<span><b>Rs. $1<i></i></b></span>');
const words = [...answerEl.querySelectorAll(':scope > span')];
const STREAM = [43.1, 43.6];
const wordT = words.map((_, i) => STREAM[0] + (STREAM[1] - STREAM[0]) * (i / (words.length - 1)));

/* the app's thinking glyph: a ring of eight dots */
const glyph = $('glyph');
for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; const c = document.createElementNS(SVGNS, 'circle'); c.setAttribute('cx', 11 + Math.cos(a) * 7.5); c.setAttribute('cy', 11 + Math.sin(a) * 7.5); c.setAttribute('r', 1.9); c.setAttribute('fill', '#c94820'); glyph.appendChild(c); }
const dots = [...glyph.children];

/* small 2 : 1 stones at the left margin (d11), over a pencil base line */
$('stones').innerHTML = `
  <div class="deco clay" id="st-a" style="left:90px; top:792px; width:70px; height:128px"></div>
  <div class="deco clay" style="left:90px; top:762px; width:92px; height:30px; clip-path: polygon(0 30px, 70px 30px, 92px 0, 22px 0); filter: brightness(1.28)"></div>
  <div class="deco clay" style="left:160px; top:762px; width:22px; height:158px; clip-path: polygon(0 30px, 22px 0, 22px 158px, 0 158px); filter: brightness(0.58)"></div>
  <div class="deco char" style="left:190px; top:856px; width:70px; height:64px"></div>
  <div class="deco char" style="left:190px; top:832px; width:92px; height:24px; clip-path: polygon(0 24px, 70px 24px, 92px 0, 22px 0); filter: brightness(1.7)"></div>
  <div class="deco" style="left:80px; top:924px; width:200px; height:1.4px; background: rgba(43,37,34,0.45)"></div>`;

/* =============================================================== renderAt */
function renderAt(t) {
  /* section 4's timeline falls away; the rail stays live on top */
  const fall = tw(t, 41.56, 41.86, 'power2.in');
  if (show($('plate-layer'), fall < 1)) {
    Object.assign($('plate').style, { transform: `translateY(${(140 * fall).toFixed(1)}px) scale(${(1 - 0.03 * fall).toFixed(4)})`, opacity: (1 - fall).toFixed(3), filter: fall > 0.01 ? `blur(${(4 * fall).toFixed(2)}px)` : 'none' });
  }
  $('vignette').style.opacity = fall.toFixed(3);

  /* the rail tips horizontal (41.56–41.95) under the prompt box, then follows it down to the composer (42.70–43.05) */
  const tip = tw(t, 41.56, 41.95, 'power3.inOut'), dn = tw(t, 42.7, 43.05, 'power3.inOut');
  const hl0 = (RAIL0.y1 - RAIL0.y0) / 2, m0 = { x: RAIL0.x, y: (RAIL0.y0 + RAIL0.y1) / 2 };
  const ub = UNDER_BIG, us = UNDER_SMALL;
  const m1 = { x: lerp((ub.x0 + ub.x1) / 2, (us.x0 + us.x1) / 2, dn), y: lerp(ub.y, us.y, dn) }, hl1 = lerp((ub.x1 - ub.x0) / 2, (us.x1 - us.x0) / 2, dn);
  const a = lerp(Math.PI / 2, 0, tip), m = { x: lerp(m0.x, m1.x, tip), y: lerp(m0.y, m1.y, tip) }, hl = lerp(hl0, hl1, tip);
  $('rail').setAttribute('d', `M${(m.x - Math.cos(a) * hl).toFixed(1)} ${(m.y - Math.sin(a) * hl).toFixed(1)} L ${(m.x + Math.cos(a) * hl).toFixed(1)} ${(m.y + Math.sin(a) * hl).toFixed(1)}`);
  $('rail').setAttribute('stroke-width', lerp(2.4 * PUSH, 2.4, tip).toFixed(2));

  /* the prompt box: rises onto the rail, takes the typing, then becomes the composer */
  const cin = tw(t, 41.78, 42.05, 'expo.out'), cs = lerp(BIG.s, SMALL.s, dn);
  const cx = lerp(BIG.x, SMALL.x, dn), cy = lerp(BIG.y, SMALL.y, dn) + 40 * (1 - cin);
  const comp = $('composer');
  if (show(comp, cin > 0)) { comp.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px) scale(${cs.toFixed(4)})`; comp.style.opacity = Math.min(1, cin * 1.6).toFixed(3); }
  const typedU = seg(t, TYPE[0], TYPE[1]), n = typeTimes.filter((x) => x <= typedU + 1e-9).length;
  const sent = tw(t, 42.66, 42.78, 'power2.in');
  $('typed-text').textContent = t < TYPE[0] ? '' : QUESTION.slice(0, n);
  show($('ph'), t < TYPE[0]);
  $('typed').style.opacity = (1 - sent).toFixed(3);
  $('caret').style.opacity = t < TYPE[0] || t >= 42.66 ? 0 : (t > TYPE[1] && Math.floor((t - TYPE[1]) / 0.25) % 2 ? 0 : 1);
  $('send').style.filter = `brightness(${(1 - 0.22 * Math.sin(Math.PI * seg(t, 42.64, 42.78))).toFixed(3)})`;

  /* "Ask." lands on "ask" (42.18) */
  $('ask-word').style.transform = `translateY(${lerp(118, 0, tw(t, 41.86, 42.24, 'expo.out')).toFixed(2)}%)`;

  /* the Ask window builds around the composer as it settles */
  const wb = tw(t, 42.7, 43.08, 'expo.out');
  const win = $('win');
  if (show(win, wb > 0)) {
    const bx = { x: cx, y: cy, w: CW * cs, h: CH * cs };
    Object.assign(win.style, { left: '0', top: '0', width: `${lerp(bx.w, WIN.w, wb).toFixed(1)}px`, height: `${lerp(bx.h, WIN.h, wb).toFixed(1)}px`, transform: `translate(${lerp(bx.x, WIN.x, wb).toFixed(1)}px, ${lerp(bx.y, WIN.y, wb).toFixed(1)}px)` });
    $('win-content').style.opacity = seg(t, 42.88, 43.04).toFixed(3);
  }
  // the decor of d11 arrives with the window
  const dk = tw(t, 42.78, 43.12, 'expo.out');
  $('d-arc').style.transform = `translate(${lerp(1460, 1150, dk).toFixed(1)}px, 0px)`;
  $('d-hatch').style.transform = `translate(${lerp(-60, 0, dk).toFixed(1)}px, 330px)`;
  if (show($('stones'), dk > 0)) $('stones').style.transform = `translateY(${(260 * (1 - dk)).toFixed(1)}px)`;
  $('bug').style.top = `${lerp(150, 180, dk).toFixed(1)}px`;

  /* the sent message lifts out of the box to its place at the top of the conversation */
  const bu = tw(t, 42.68, 43.04, 'power3.inOut'), bubble = $('bubble');
  if (show(bubble, t >= 42.68)) {
    const from = { x: BIG.x + 19 * BIG.s - 20 * BIG.s, y: BIG.y + 17 * BIG.s - 16 * BIG.s }, s = lerp(BIG.s, 1, bu);
    bubble.style.transform = `translate(${lerp(from.x, BUBBLE.x, bu).toFixed(1)}px, ${lerp(from.y, BUBBLE.y, bu).toFixed(1)}px) scale(${s.toFixed(4)})`;
    bubble.style.background = `rgba(241,238,233,${seg(t, 42.8, 43.0).toFixed(3)})`;
  }

  /* generating: the thinking glyph, the heading, then the answer streams word by word */
  const gOn = t >= 42.98 && t < 43.2;
  glyph.style.opacity = gOn ? Math.min(1, seg(t, 42.98, 43.02) * 1) : 0;
  dots.forEach((d, i) => { const ph = ((t - 42.98) * 2.4 - i / 8) % 1; d.setAttribute('opacity', (0.25 + 0.75 * (1 - ((ph + 1) % 1))).toFixed(3)); });
  $('ans-head').style.opacity = seg(t, 43.04, 43.12).toFixed(3);
  words.forEach((w, i) => {
    const u = seg(t, wordT[i], wordT[i] + 0.08);
    w.style.opacity = u.toFixed(3);
    const b = w.querySelector('b i'); if (b) b.style.transform = `scaleX(${tw(t, wordT[i] + 0.06, wordT[i] + 0.26, 'power2.out').toFixed(3)})`;
  });
  const ci = tw(t, 43.55, 43.82, 'expo.out');
  $('cites').style.opacity = ci.toFixed(3); $('cites').style.transform = `translateY(${(26 * (1 - ci)).toFixed(1)}px)`;
  [...$('cites').querySelectorAll('.crow')].forEach((r, i) => { r.style.opacity = seg(t, 43.62 + i * 0.04, 43.72 + i * 0.04).toFixed(3); });

  /* marks frame the answer once it has landed */
  const fk = lerp(1.25, 1, tw(t, 43.62, 43.84, 'expo.out'));
  const A = { x0: WIN.x + 101 - 14, y0: WIN.y + 180 - 12, x1: WIN.x + 101 + 900 + 14, y1: WIN.y + 220 + 31 * 3 + 12 };
  const ccx = (A.x0 + A.x1) / 2, ccy = (A.y0 + A.y1) / 2;
  $('focal').setAttribute('d', t >= 43.62 ? corners(ccx + (A.x0 - ccx) * fk, ccy + (A.y0 - ccy) * fk, ccx + (A.x1 - ccx) * fk, ccy + (A.y1 - ccy) * fk) : '');

  /* the cursor reaches send (42.66) and leaves */
  const sendPt = { x: BIG.x + SEND.x * BIG.s, y: BIG.y + SEND.y * BIG.s };
  const cu = tw(t, 42.3, 42.62, 'power2.out');
  if (show($('cursor'), t >= 42.3 && t < 42.95)) {
    $('cursor').style.transform = `translate(${lerp(1300, sendPt.x - 2, cu).toFixed(1)}px, ${lerp(820, sendPt.y - 2, cu).toFixed(1)}px)`;
    $('cursor').style.opacity = (1 - seg(t, 42.8, 42.95)).toFixed(3);
  }
  const ru = seg(t, 42.66, 43.0), ring = $('click-ring');
  if (ru > 0 && ru < 1) { ring.setAttribute('cx', sendPt.x); ring.setAttribute('cy', sendPt.y); ring.setAttribute('r', lerp(8, 30, EZ('expo.out')(ru)).toFixed(2)); ring.style.opacity = (0.6 * (1 - ru)).toFixed(3); } else ring.setAttribute('r', 0);

  /* a sand slab covers for the Vikram context (locked from 44.27) */
  const sx = lerp(1460, -470, tw(t, 44.05, 44.2333, 'power2.in'));
  show($('slab-layer'), t >= 44.05);
  $('slab').style.transform = `translateX(${sx.toFixed(1)}px)`;
}

/* ------------------------------------------------------------- timeline */
const clock = { t: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(clock, { t: DUR, duration: DUR, ease: 'none', onUpdate: () => renderAt(T0 + clock.t) }, 0);
renderAt(T0);
window.__lvSection5 = { renderAt, T0 };
export const timeline = tl;
export const compositionId = ID;

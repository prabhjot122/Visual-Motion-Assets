/* WEB CUT COPY of section-10/src/section10.js: identical scene code, exporting renderAt for src/web.js.
 *
 * LawVriksh graphics track — section 10, global reel time 59.2667–62.9000 s (C3 + C4, the end).
 *
 * Composition time 0 = reel 59.2667 s (frame 1778). renderAt(t) takes GLOBAL reel
 * seconds and is a pure function of time. 109 frames; the whole track is 1887 frames
 * (62.90 s), matching the reel's audio (ends 62.8999).
 *
 *   59.25–59.71 C3: a window-light band sweeps left → right across the office footage
 *         (still playing, page on the laptop screen); its trailing edge wipes to paper
 *   59.25 behind the edge, B1's mark and wordmark are already set; no ground line yet
 *   59.86 ("honestly") the trunk node pulses; 60.0–62.35 the clay ground line draws from
 *         the roots out to both frame edges, arriving on "started" · still hold to the end
 * Footage clip time = reel − 48.30 (clip 10.97–11.41 s), as in section 9.
 */
const ID = 'section-10';
const T0 = 59.2667, DUR = 3.6333; // 109 frames at 30 fps: 59.2667–62.8667
const gsap = window.gsap;
const EZ = (name) => gsap.parseEase(name);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const tw = (t, a, b, e = 'power2.inOut') => EZ(e)(seg(t, a, b));
const $ = (id) => document.getElementById(id);
const show = (node, on) => { node.style.display = on ? '' : 'none'; return on; };
const SVGNS = 'http://www.w3.org/2000/svg';

await Promise.all(['400 176px "Instrument Serif"', 'italic 400 176px "Instrument Serif"', 'italic 500 44px "Newsreader"', '600 13px "Figtree"'].map((f) => document.fonts.load(f)));
await document.fonts.ready;
await $('mark').decode();

/* ------------------------------------------------------------- homography (from the pilot) */
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

/* ------------------------------------------------------------- section 9's exit, live */
const K = 1000 / 1080;
const SCREEN = [[619.2, 488.7], [984.1, 457.0], [1027.7, 714.2], [664.8, 771.5]].map(([x, y]) => ({ x: x * K - 18.52, y: y * K }));
const PUSH_C = { x: 820, y: 560 };
const footZ = (t) => 1 + 0.03 * tw(t, 52.95, 59.4, 'sine.inOut'); // section 9's C2 push, finishing under the wipe
const place = (el, x, y) => { el.style.transform = `translate(${x}px, ${y}px)`; };
place($('brief'), 340, 76); place($('review'), 1124, 76);
$('brief').style.boxShadow = '0 2px 6px rgba(20,16,12,0.06)';
$('grade').style.opacity = 1; $('glare').style.opacity = 1;

// her knuckles in front of the screen's lower-right corner until the wipe passes it (see section 9)
const HAND_K = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const hands = new Map(HAND_K.map((k) => { const im = document.createElement('img'); im.src = `assets/hand/h${String(k).padStart(3, "0")}.png`; im.alt = ''; Object.assign(im.style, { position: 'absolute', left: '740px', top: '540px', display: 'none' }); $('hand-layer').appendChild(im); return [k, im]; }));
await Promise.all([...hands.values()].map((im) => im.decode()));

/* ------------------------------------------------------------- B1's brand (pilot geometry) */
const MARK_S = 380 / 1024, mk = (x, y) => ({ x: 530 + x * MARK_S, y: 100 + y * MARK_S });
const GROUND_Y = 431, NODE = { trunk: mk(507, 737.8), top: mk(506.5, 345.5), left: mk(391.7, 424), right: mk(623.7, 424) };
[[NODE.trunk, 17], [NODE.top, 15], [NODE.left, 13], [NODE.right, 13]].forEach(([c, r]) => { const n = document.createElementNS(SVGNS, 'circle'); n.setAttribute('cx', c.x); n.setAttribute('cy', c.y); n.setAttribute('r', r); $('halos').appendChild(n); });
$('pulse').setAttribute('cx', NODE.trunk.x); $('pulse').setAttribute('cy', NODE.trunk.y);

/* the wipe edge, tilted like the window light (−24°): x(y) = X + (y − 500)·tan 24° */
const wipeX = (t) => lerp(-300, 1760, tw(t, 59.25, 59.71, 'power2.out'));
const GRAD_L = 1440 * Math.sin(66 * Math.PI / 180) + 1000 * Math.cos(66 * Math.PI / 180); // the gradient line's length for 66° on 1440 × 1000

/* =============================================================== renderAt */
function renderAt(t) {
  /* the office keeps playing under the wipe; the page rides the screen */
  const z = footZ(t);
  $('footage-world').style.transform = `translate(${(PUSH_C.x * (1 - z)).toFixed(2)}px, ${(PUSH_C.y * (1 - z)).toFixed(2)}px) scale(${z.toFixed(5)})`;
  const q = SCREEN.map((p) => ({ x: PUSH_C.x + (p.x - PUSH_C.x) * z, y: PUSH_C.y + (p.y - PUSH_C.y) * z }));
  $('page').style.transform = css3(mul3(sq2quad(q), scaleRect(1440, 900)));
  const fk = Math.round((t - T0) * 30); hands.forEach((im, k) => { im.style.display = k === fk ? '' : 'none'; });

  /* C3: the band sweeps left → right; behind its trailing edge, paper (and the brand, already set) */
  const X = wipeX(t), covered = X > 1755; // at X ≥ 1706 + 40 the feathered edge has passed the top-right corner
  show($('footage-layer'), !covered); show($('stage'), !covered); show($('hand-layer'), !covered);
  // a feathered edge: a mask gradient along the edge's normal (66° in CSS terms), 40 px each side
  const along = (X - 720) * Math.cos(24 * Math.PI / 180) + GRAD_L / 2;
  $('paper').style.webkitMaskImage = $('paper').style.maskImage = covered ? 'none' : `linear-gradient(66deg, #000 ${(along - 40).toFixed(1)}px, transparent ${(along + 40).toFixed(1)}px)`;
  const band = Math.sin(Math.PI * seg(t, 59.25, 59.78));
  if (show($('light-sweep'), band > 0.001)) {
    $('sweep').style.transform = `translateX(${(X + 120 - 150).toFixed(1)}px) rotate(-24deg)`; $('sweep').style.opacity = (0.95 * band).toFixed(3);
    $('edge').style.transform = `translateX(${(X + 50 - 90).toFixed(1)}px) rotate(-24deg)`; $('edge').style.opacity = band.toFixed(3);
  }

  /* C4: the trunk node pulses on "honestly"; the ground line draws out to both edges, arriving on "started" */
  const pu = seg(t, 59.86, 60.5);
  $('pulse').setAttribute('r', (17 + 26 * EZ('expo.out')(pu)).toFixed(2)); $('pulse').style.opacity = (pu > 0 && pu < 1 ? 0.75 * (1 - pu) : 0).toFixed(3);
  const gap = 160, half = lerp(gap, 760, tw(t, 60.0, 62.35, 'sine.inOut'));
  $('ground').setAttribute('d', half > gap + 0.5 ? `M${720 - half} ${GROUND_Y} L ${720 - gap} ${GROUND_Y} M ${720 + gap} ${GROUND_Y} L ${720 + half} ${GROUND_Y}` : '');
}

/* ------------------------------------------------------------- web cut */
// The web cut drives renderAt through its own time map (src/web.js); no timeline here.
renderAt(T0);
export { renderAt, T0 };

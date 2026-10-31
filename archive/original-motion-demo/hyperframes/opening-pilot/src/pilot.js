/* LawVriksh graphics track — opening pilot, global source time 0.00–24.78 s.
 *
 * One paused GSAP timeline drives renderAt(t), a pure function of time that
 * sets every layer. No clocks, no unseeded randomness, no network: same t →
 * same frame.
 *
 * Scope of Three.js (user direction, 22 Oct 2026): only the paper stacks of
 * O2–O5 (1.85–9.05 s). Everything else is flat 2D DOM/SVG in the approved
 * stills' language — storyboard/stills/{o3-o4,b1,p3-p4,p5-p6}.html supply the
 * layouts, sizes and colours used below.
 */
import * as THREE from '../assets/three.module.js';

const ID = 'opening-pilot';
const W = 1440, H = 1000, DUR = 24.8;
const gsap = window.gsap;
const EZ = (name) => gsap.parseEase(name);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const tw = (t, a, b, e = 'power2.inOut') => EZ(e)(seg(t, a, b));
const lerpPt = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) });
const $ = (id) => document.getElementById(id);
const SVGNS = 'http://www.w3.org/2000/svg';
const DEG = Math.PI / 180;
const CLAY = '#c4562e', MARK_CLAY = '#bf560b', INK = '#1c1714';
const GROUND_Y = 431; // the mark's root horizon in b1-brand (the thread's line)

function rng(seed) { // mulberry32
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const loadImg = (src) => new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => bad(new Error(src)); i.src = src; });

/* ------------------------------------------------------------------ assets */
await Promise.all([
  '400 100px "Newsreader"', '500 100px "Newsreader"', 'italic 400 100px "Newsreader"',
  '400 100px "Instrument Serif"', 'italic 400 100px "Instrument Serif"', '500 20px "Figtree"', '600 20px "Figtree"',
].map((f) => document.fonts.load(f)));
await document.fonts.ready;

const IMG = Object.fromEntries(await Promise.all(Object.entries({
  paper: 'assets/textures/paper.jpg', sand: 'assets/textures/stone-sand.jpg',
}).map(async ([k, src]) => [k, await loadImg(src)])));

/* ------------------------------------------------------------ page artwork */
const PAGE_W = 300, PAGE_D = 410; // a page / stack footprint in world units

// Abstract page: rows of grey bars, no legible invented text (o2 / o3-o4 stills).
function pageCanvas(seed, w = 900) {
  const h = Math.round(w * PAGE_D / PAGE_W);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = '#fbf8f2'; g.fillRect(0, 0, w, h);
  g.globalAlpha = 0.3; g.drawImage(IMG.paper, 0, 0, w, h); g.globalAlpha = 1;
  const r = rng(seed), pad = w * 0.12, top = h * 0.1, n = 24, lh = (h * 0.84) / n, rows = [];
  for (let i = 0; i < n; i++) {
    if (i > 0 && r() < 0.08) continue;
    const y = top + i * lh, len = i === 0 ? 0.45 : 0.55 + r() * 0.4, ww = (w - pad * 2) * len, bh = i === 0 ? lh * 0.42 : lh * 0.27;
    g.fillStyle = i === 0 ? '#3a352f' : '#b3ab9f'; g.globalAlpha = i === 0 ? 0.85 : 0.8;
    g.beginPath(); g.roundRect(pad, y, ww, bh, 2); g.fill(); g.globalAlpha = 1;
    rows.push({ i, u0: pad / w, u1: (pad + ww) / w, v: (y + bh / 2) / h });
  }
  return { canvas: c, rows };
}

function edgeCanvas() { // page edges seen on a stack's side
  const c = document.createElement('canvas'); c.width = 64; c.height = 2048;
  const g = c.getContext('2d'), r = rng(91);
  for (let y = 0; y < c.height;) {
    const t = 1 + Math.floor(r() * 3), shade = r();
    g.fillStyle = shade < 0.18 ? '#b5aa98' : shade < 0.5 ? '#e6dfd2' : '#f3eee4';
    g.fillRect(0, y, 64, t); y += t;
  }
  return c;
}

/* ------------------------------------------------- three.js: stacks only */
const renderer = new THREE.WebGLRenderer({ canvas: $('gl'), antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
const maxAniso = renderer.capabilities.getMaxAnisotropy();

const tex = (src, { repeat = [1, 1], wrap = false } = {}) => {
  const t = src instanceof HTMLCanvasElement ? new THREE.CanvasTexture(src) : new THREE.Texture(src);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; t.needsUpdate = true;
  if (wrap) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
};
const lambert = (map, extra = {}) => new THREE.MeshLambertMaterial({ map, ...extra });

// Lambert divides irradiance by π: ambient + sun·cos(41°) ≈ π puts a lit page
// top at its own texture value, so the 3D stacks read as the stills' bright paper.
const LIGHT = { ambient: 1.62, sun: 2.0 };
const scene = new THREE.Scene();
scene.background = new THREE.Color('#efebe3');
scene.add(new THREE.AmbientLight(0xfffaf3, LIGHT.ambient));
const sun = new THREE.DirectionalLight(0xfff1de, LIGHT.sun);
sun.position.set(-1500, 1900, 900); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -2800, right: 2800, top: 2800, bottom: -2800, near: 100, far: 7000 });
sun.shadow.bias = -0.0006; sun.shadow.radius = 5;
scene.add(sun, sun.target);

const desk = new THREE.Mesh(new THREE.PlaneGeometry(24000, 24000), lambert(tex(IMG.paper, { wrap: true, repeat: [24000 / 1440, 24000 / 1000] })));
desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; scene.add(desk);

// Camera rig: target → yaw → pitch → camera at distance R.
const rig = new THREE.Object3D(), pitchNode = new THREE.Object3D();
const camera = new THREE.PerspectiveCamera(32, W / H, 10, 40000);
rig.add(pitchNode); pitchNode.add(camera); scene.add(rig);

// Camera keys: [t, tx, ty, tz, yawDeg, pitchDeg, R, fov, easeIntoThisKey]
const STACK_H = 560;
const CAM_A_R = (H * PAGE_W / W) / 2 / Math.tan(16 * DEG); // entry page fills the frame width exactly
const CAM = [
  [0.00, 0, STACK_H, 0, 0, -90, CAM_A_R, 32],
  [1.95, 0, STACK_H, 0, 0, -90, CAM_A_R, 32], // = MATTE_END: the 2D sheet matte hands over here
  [2.80, 300, 150, 120, -24, -40, 3050, 32, 'power3.inOut'],
  [2.95, 300, 150, 120, -24, -40, 3020, 32, 'sine.inOut'],
  [3.55, 140, 220, 40, -18, -31, 2300, 32, 'power2.inOut'],
  [6.90, 140, 200, 30, -15, -29, 2430, 32, 'sine.inOut'],
  [9.05, 140, 200, 30, -15, -29, 2500, 32, 'sine.inOut'],
];
function setCamera(t) {
  let i = 0; while (i < CAM.length - 1 && CAM[i + 1][0] <= t) i++;
  const a = CAM[i], b = CAM[Math.min(i + 1, CAM.length - 1)];
  const u = b === a ? 0 : EZ(b[8] || 'none')(seg(t, a[0], b[0]));
  const v = (k) => lerp(a[k], b[k], u);
  rig.position.set(v(1), v(2), v(3)); rig.rotation.y = v(4) * DEG; pitchNode.rotation.x = v(5) * DEG;
  camera.position.set(0, 0, v(6)); camera.fov = v(7); camera.updateProjectionMatrix();
  rig.updateMatrixWorld(true);
}

const edgeImg = edgeCanvas();
const stacks = [];
function makeStack(x, z, h, rot, seed) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot * DEG;
  const side = lambert(tex(edgeImg, { wrap: true, repeat: [1, h / 650] })), plain = lambert(null, { color: 0xf3eee4 });
  const box = new THREE.Mesh(new THREE.BoxGeometry(PAGE_W, h, PAGE_D), [side, side, plain, plain, side, side]);
  box.position.y = h / 2; box.castShadow = true; box.receiveShadow = true; g.add(box);
  const page = new THREE.Mesh(new THREE.PlaneGeometry(PAGE_W, PAGE_D), lambert(tex(pageCanvas(seed, 600).canvas)));
  page.rotation.x = -Math.PI / 2; page.position.y = h + 0.4; page.receiveShadow = true; g.add(page);
  scene.add(g); const s = { g, h, d: Math.hypot(x, z) }; stacks.push(s); return s;
}
[
  [-400, -80, 380, 3, 11], [390, -150, 640, -2, 13], [790, -40, 300, 4, 15], [-430, 470, 230, -3, 17],
  [370, 480, 450, 2, 19], [760, 540, 520, -4, 21], [40, 990, 170, 3, 23], [-800, 430, 340, -1, 25],
  [1150, 360, 270, 5, 27], [-830, -110, 470, -5, 29], [1180, -210, 420, 1, 31], [-1200, 300, 260, 2, 33],
].forEach((s) => makeStack(...s));
const entry = makeStack(0, 0, STACK_H, 0, 1);
entry.g.remove(entry.g.children[1]); // the entry stack's top page is a free object (it lifts in O3)

// The entry page is unlit (MeshBasic) so it is pixel-identical to the 2D sheet
// it hands over to: the footage matte at 1.85 and the DOM sheet at 3.48.
const entryPC = pageCanvas(7, 900);
const entryURL = entryPC.canvas.toDataURL('image/jpeg', 0.92);
const entryPage = new THREE.Mesh(new THREE.PlaneGeometry(PAGE_W, PAGE_D), new THREE.MeshBasicMaterial({ map: tex(entryPC.canvas), side: THREE.DoubleSide }));
entryPage.castShadow = true; scene.add(entryPage);
const entryLie = { pos: new THREE.Vector3(0, STACK_H + 0.4, 0), quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)) };

// Billboard: the lifted page faces camera, centred at (720, 440), 780 px tall,
// rolled so it matches the 2D sheet's CSS rotate(-5deg) (three's +z = CCW on screen).
const SH = 780, SW = SH * PAGE_W / PAGE_D, SHEET_CX = 720, SHEET_CY = 440, SHEET_ROT = -5;
const BB = { d: 0, sy: 0, roll: -SHEET_ROT * DEG };
{ const visH = PAGE_D * H / SH; BB.d = visH / 2 / Math.tan(16 * DEG); BB.sy = (H / 2 - SHEET_CY) / H * visH; }

/* ------------------------------------------------------------ DOM / SVG */
const stage = $('stage2d'), type = $('type'), pencilL = $('pencil-layer'), clayL = $('clay-layer'), markL = $('mark-layer');
function el(tag, attrs = {}, parent) { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; }
function div(cls, html = '', parent = stage) { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; parent.appendChild(d); return d; }
const ptsAttr = (pts) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
function drawOn(node, u) { node.setAttribute('stroke-dasharray', '1 1'); node.setAttribute('stroke-dashoffset', (1 - clamp(u, 0, 1)).toFixed(4)); node.style.opacity = u > 0 ? 1 : 0; }
const show = (node, on) => { node.style.display = on ? '' : 'none'; return on; };
function catmull(pts, steps = 12) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let s = 0; s < steps; s++) {
      const t = s / steps, t2 = t * t, t3 = t2 * t;
      out.push({ x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
                 y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3) });
    }
  }
  out.push(pts[pts.length - 1]); return out;
}
function cornerPath(q, arm = 16) { // L-marks at the four corners of a quad, arms along its edges
  let d = '';
  for (let i = 0; i < 4; i++) {
    const p = q[i], a = q[(i + 1) % 4], b = q[(i + 3) % 4];
    const ua = Math.hypot(a.x - p.x, a.y - p.y) || 1, ub = Math.hypot(b.x - p.x, b.y - p.y) || 1;
    d += `M${(p.x + (a.x - p.x) / ua * arm).toFixed(1)} ${(p.y + (a.y - p.y) / ua * arm).toFixed(1)}L${p.x.toFixed(1)} ${p.y.toFixed(1)}L${(p.x + (b.x - p.x) / ub * arm).toFixed(1)} ${(p.y + (b.y - p.y) / ub * arm).toFixed(1)}`;
  }
  return d;
}
const rectQuad = (x0, y0, x1, y1) => [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }];
const quadCentre = (q) => ({ x: q.reduce((s, p) => s + p.x, 0) / 4, y: q.reduce((s, p) => s + p.y, 0) / 4 });
const scaleQuad = (q, s) => { const c = quadCentre(q); return q.map((p) => ({ x: c.x + (p.x - c.x) * s, y: c.y + (p.y - c.y) * s })); };
function loops(x, y, w, n, amp, seed) { // abstract handwriting
  const r = rng(seed), pts = [];
  for (let i = 0; i <= n * 8; i++) { const s = i / (n * 8); pts.push({ x: x + s * w, y: y - Math.abs(Math.sin(s * n * Math.PI)) * amp * (0.7 + r() * 0.5) + Math.sin(s * 3.1) * 2 }); }
  return pts;
}
// Element placed by its centre: translate · rotate · scale (transform-origin 50% 50%).
const placeCSS = (w, h, cx, cy, r = 0, sx = 1, sy = sx) => `translate(${(cx - w / 2).toFixed(2)}px, ${(cy - h / 2).toFixed(2)}px) rotate(${r.toFixed(3)}deg) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
function placedPt(w, h, cx, cy, r, sx, sy, x, y) { // local px of a placed element → stage px
  const dx = (x - w / 2) * sx, dy = (y - h / 2) * sy, a = r * DEG;
  return { x: cx + dx * Math.cos(a) - dy * Math.sin(a), y: cy + dx * Math.sin(a) + dy * Math.cos(a) };
}

/* --- O1 footage matte ---------------------------------------------------- */
$('sheet').style.backgroundImage = `url(${entryURL})`;
const sheetMarks = el('path', { 'stroke-width': 2.2 }, markL);

/* --- O2 "Hundreds." ------------------------------------------------------ */
const hundreds = div('mask', '<div class="word" style="left:0;top:8px;font-size:232px">Hundreds<em>.</em></div>', type);
Object.assign(hundreds.style, { left: '40px', top: '18px', width: '1140px', height: '262px' });

/* --- O3–O5 the 2D entry sheet, its slip and pencil -------------------- */
const sheet2d = div('sheet2d'); Object.assign(sheet2d.style, { width: `${SW}px`, height: `${SH}px`, backgroundImage: `url(${entryURL})`, zIndex: 2 });
const sheetInk = el('svg', { width: SW, height: SH, viewBox: `0 0 ${SW} ${SH}`, style: 'position:absolute;left:0;top:0;overflow:visible' }, sheet2d);
const sheetPencil = el('g', { filter: 'url(#pencil)', fill: 'none', stroke: '#2b2522', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, sheetInk);
const circleNote = el('polyline', { 'stroke-width': 2, pathLength: 1, opacity: 0.8 }, sheetPencil);
const arrowNote = el('polyline', { 'stroke-width': 2, pathLength: 1, opacity: 0.8 }, sheetPencil);
const ticks = [0, 1, 2, 3].map(() => el('polyline', { 'stroke-width': 2.4, pathLength: 1 }, sheetPencil));
const hops = [0, 1, 2, 3].map(() => el('path', { 'stroke-width': 1.4, 'stroke-dasharray': '3 6', opacity: 0.55 }, sheetPencil));
const focal = el('path', { fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-linecap': 'square' }, sheetInk);

const slip = div('slip sand'); slip.style.zIndex = 1;
const slipInk = el('svg', { width: 230, height: 200, viewBox: '0 0 230 200', style: 'position:absolute;left:0;top:0' }, slip);
const slipPencil = el('g', { filter: 'url(#pencil)', fill: 'none', stroke: '#2b2522', 'stroke-width': 2.2, 'stroke-linecap': 'round', opacity: 0.82 }, slipInk);
const HAND = [loops(32, 62, 150, 6, 9, 3), loops(28, 102, 165, 7, 9, 4), loops(36, 142, 120, 5, 9, 5)];
const hand = HAND.map((pts) => el('polyline', { points: ptsAttr(pts), pathLength: 1 }, slipPencil));

const manually = div('mask', '<div class="word" style="left:0;top:10px;font-size:230px">Manually<em>.</em></div>', type);
Object.assign(manually.style, { left: '40px', top: '690px', width: '1060px', height: '300px' });

const ROWS = entryPC.rows;
const rowIndex = (i) => ROWS.find((r) => r.i === i) || ROWS[Math.min(i, ROWS.length - 1)];
const rowPx = (r) => ({ x0: r.u0 * SW, x1: r.u1 * SW, y: r.v * SH });
const TICK_ROWS = [3, 5, 8, 11], FOCAL_ROWS = [3, 5, 8, 11, 13], HOP0 = 4.4, HOPDT = 0.45;
{ // static pencil geometry in sheet-local px
  const r3 = rowPx(rowIndex(3)), cx = (r3.x0 + r3.x1) / 2, rx = (r3.x1 - r3.x0) / 2 + 16, pts = [];
  for (let i = 0; i <= 64; i++) { const a = -2.8 + i / 64 * Math.PI * 2.1; pts.push({ x: cx + Math.cos(a) * rx, y: r3.y + Math.sin(a) * 16 - Math.cos(a) * 3 }); }
  circleNote.setAttribute('points', ptsAttr(pts));
  const ax = 0.06 * SW, a0 = 0.62 * SH, a1 = 0.78 * SH;
  arrowNote.setAttribute('points', ptsAttr([{ x: ax, y: a0 }, { x: ax, y: a1 }, { x: ax - 9, y: a1 - 13 }, { x: ax, y: a1 }, { x: ax + 9, y: a1 - 13 }]));
  TICK_ROWS.forEach((ri, k) => {
    const a = rowPx(rowIndex(ri)), n = rowPx(rowIndex(FOCAL_ROWS[k + 1])), tx = a.x0 - 26;
    ticks[k].setAttribute('points', ptsAttr([{ x: tx - 9, y: a.y - 2 }, { x: tx - 3, y: a.y + 5 }, { x: tx + 9, y: a.y - 11 }]));
    hops[k].dataset.p = JSON.stringify([tx, a.y, n.x0 - 26, n.y]);
  });
}
function sheetPose(t) {
  const fold = tw(t, 7.95, 8.45, 'power2.in'), s = 1 + 0.025 * tw(t, 3.5, 7.9, 'sine.inOut');
  return { cx: SHEET_CX, cy: lerp(SHEET_CY, GROUND_Y, fold), r: lerp(SHEET_ROT, 0, fold), sx: s, sy: s * Math.max(0.001, 1 - fold) };
}
const sheetPt = (p, x, y) => placedPt(SW, SH, p.cx, p.cy, p.r, p.sx, p.sy, x, y);

/* --- O5 thread ----------------------------------------------------------- */
const thread = el('polyline', { 'stroke-width': 2.4 }, clayL);
const threadDot = el('circle', { r: 0, fill: CLAY, stroke: 'none' }, clayL);

/* --- B1 brand (geometry from b1-brand.html) ------------------------------ */
const MARK_S = 380 / 1024, MARK_X = 530, MARK_Y = 100;
const mk = (x, y) => ({ x: MARK_X + x * MARK_S, y: MARK_Y + y * MARK_S });
const NODE = { top: mk(506.5, 345.5), left: mk(391.7, 424), right: mk(623.7, 424), trunk: mk(507, 737.8) };
const B = {}; // construction strokes, in the mark's own clay, drawn exactly over its circuit
['ground'].forEach((k) => { B[k] = el('path', { stroke: CLAY, 'stroke-width': 2.4 }, clayL); });
['riser', 'axisL', 'left', 'right', 'connL', 'connR'].forEach((k) => { B[k] = el('path', { stroke: MARK_CLAY, 'stroke-width': 3.2, pathLength: 1 }, clayL); });
['trunk', 'top', 'nl', 'nr'].forEach((k) => { B[k] = el('circle', { stroke: MARK_CLAY, 'stroke-width': 3.2, pathLength: 1 }, clayL); });
const halos = [[NODE.trunk, 17], [NODE.top, 15], [NODE.left, 13], [NODE.right, 13]].map(([c, r]) => ({ c, r, n: el('circle', { cx: c.x, cy: c.y, r: 0, stroke: CLAY, 'stroke-width': 1.6 }, clayL) }));
const brand = div('', '', type); Object.assign(brand.style, { position: 'absolute', left: 0, top: 0, width: '1440px', height: '1000px', transformOrigin: `720px ${GROUND_Y}px` });
const markImg = document.createElement('img'); markImg.src = 'assets/brand/lawvriksh-mark.png'; markImg.alt = '';
Object.assign(markImg.style, { position: 'absolute', left: `${MARK_X}px`, top: `${MARK_Y}px`, width: `${1024 * MARK_S}px`, height: `${996 * MARK_S}px`, transformOrigin: `${NODE.trunk.x - MARK_X}px ${NODE.trunk.y - MARK_Y}px` });
brand.appendChild(markImg);
const wordmarkBox = div('mask', '', brand); Object.assign(wordmarkBox.style, { left: '0', top: '488px', width: '1440px', height: '230px' });
const wordmark = div('wordmark', '', wordmarkBox);
Object.assign(wordmark.style, { position: 'absolute', left: '0', top: '12px', width: '1440px', textAlign: 'center', fontSize: '176px', letterSpacing: '-0.01em' });
const letters = 'LawVriksh'.split('').map((ch, i) => { const s = document.createElement('span'); s.textContent = ch; if (i >= 3) s.className = 'v'; wordmark.appendChild(s); return s; });
// Stone fragments that leave at the frame edges (Harvey H-E); final poses from the still.
const FRAGS = [
  { cls: 'clay', w: 170, h: 120, from: [470, 560, 4], to: [-5, 880, -14], out: [-260, 960] },
  { cls: 'char', w: 140, h: 110, from: [1010, 300, 6], to: [1420, 15, 18], out: [1640, -150] },
  { cls: 'hatch', w: 110, h: 46, from: [1060, 560, -2], to: [1435, 713, -8], out: [1620, 760] },
  { cls: 'sand', w: 120, h: 70, from: [420, 330, 2], to: [0, 95, 9], out: [-220, 30] },
].map((f) => ({ ...f, el: div(`frag ${f.cls}`) }));
const bug = div('wordmark', 'Law<span class="v">Vriksh</span>', type); bug.id = 'bug';
Object.assign(bug.style, { position: 'absolute', right: '40px', top: '36px', fontSize: '30px' });

/* --- P1–P2 the case file and its burst ----------------------------------- */
const folder = div(''); folder.id = 'folder';
folder.innerHTML = '<i class="fshadow"></i><i class="fedge-b clay"></i><i class="fedge-r clay"></i><div class="base clay"></div><div class="inner"></div><div class="cover clay"><div class="flabel"><b>ARB.P. 428/2026</b><span>Arora v. Meridian Estates</span></div></div>';
const fCover = folder.querySelector('.cover');
folder.querySelector('.inner').style.backgroundImage = `url(${pageCanvas(41, 420).canvas.toDataURL('image/jpeg', 0.9)})`;
const FOLDER_C = { x: 720, y: 470 };

const looseURL = [3, 5, 9, 12, 14, 18].map((s) => pageCanvas(s, 300).canvas.toDataURL('image/jpeg', 0.85));
const burst = [];
{
  const r = rng(404);
  const add = (kind, i, n) => {
    const a = (i / n) * Math.PI * 2 + lerp(-0.25, 0.25, r());
    const b = { kind, a, dist: lerp(820, 1650, r()), start: 16.26 + i * (kind === 'page' ? 0.011 : 0.018), dur: lerp(0.8, 1.2, r()),
      s1: kind === 'page' ? lerp(1.8, 3.6, r()) : lerp(1.2, 2.8, r()), r0: lerp(-30, 30, r()), spin: lerp(-260, 260, r()) };
    if (kind === 'page') { b.el = div('loose'); b.el.style.backgroundImage = `url(${looseURL[i % looseURL.length]})`; b.w = 150; b.h = 205; }
    else if (kind === 'slip') { b.el = div('chip sand'); b.w = 92; b.h = 70; Object.assign(b.el.style, { width: '92px', height: '70px', boxShadow: '0 10px 24px rgba(40,24,10,0.25)' }); }
    else { const s = lerp(34, 72, r()); b.w = s; b.h = s * lerp(0.55, 0.95, r()); b.el = div(`chip ${['clay', 'char', 'sand'][i % 3]}`); Object.assign(b.el.style, { width: `${b.w}px`, height: `${b.h}px` }); }
    burst.push(b);
  };
  for (let i = 0; i < 34; i++) add('page', i, 34);
  for (let i = 0; i < 14; i++) add('chip', i, 14);
  for (let i = 0; i < 6; i++) add('slip', i, 6);
}

/* --- P3–P6 documents, figures, stones, tablets, dates (p3-p4 / p5-p6) --- */
const DOC_W = 460, DOC_H = 651;
const DOCS = [
  { src: 'assets/docs/arora-notice-page2.png', label: 'Notice · page 2', p3: [170, 435.5, 1, -4], p5: [215, 204.5, 190 / 460, -6], lab: [40, 64], r0: -38 },
  { src: 'assets/docs/arora-agreement-page2.png', label: 'Agreement · 3 Feb 2023', p3: [720, 284.5, 360 / 460, 2], p5: [695, 160, 170 / 460, 3], lab: [560, 548], r0: 24 },
  { src: 'assets/docs/arora-order-page1.png', label: 'Interim order · page 1', p3: [1240, 455.5, 1, 5], p5: [1215, 214.5, 190 / 460, 7], lab: [1050, 84], r0: 34 },
].map((d, i) => {
  const e = div('card'); Object.assign(e.style, { width: `${DOC_W}px`, height: `${DOC_H}px`, backgroundImage: `url(${d.src})` });
  return { ...d, i, el: e, labEl: div('plabel', d.label), pose: null };
});
// Clay highlights on the exact source lines (raster px of a 1100-wide render, ×460/1100).
const hlBox = (doc, x0, y0, x1, y1) => {
  const k = DOC_W / 1100, box = { x: x0 * k, y: y0 * k, w: (x1 - x0) * k, h: (y1 - y0) * k };
  const e = div('hl', '', doc.el); Object.assign(e.style, { left: `${box.x}px`, top: `${box.y}px`, width: `${box.w}px`, height: `${box.h}px` });
  return { ...box, el: e, doc };
};
const hlNotice = hlBox(DOCS[0], 118.3, 549.6, 569.4, 575.5);
const hlOrderA = hlBox(DOCS[2], 754.6, 618.0, 814.6, 644.0), hlOrder = hlBox(DOCS[2], 118.3, 646.6, 824.0, 672.6);
const docPt = (doc, x, y) => { const [cx, cy, s, r] = doc.pose; return placedPt(DOC_W, DOC_H, cx, cy, r, s, s, x, y); };

const stoneFaces = (x, y, cls, frontH, sideH, topLight) => {
  const box = div('stone'); Object.assign(box.style, { left: `${x}px`, top: `${y}px` });
  box.innerHTML = `<i class="${cls}" style="left:0;top:30px;width:150px;height:${frontH}px"></i>`
    + `<i class="${cls}" style="left:0;top:0;width:190px;height:30px;clip-path:polygon(0 30px,150px 30px,190px 0,40px 0);filter:brightness(${topLight})"></i>`
    + `<i class="${cls}" style="left:150px;top:0;width:40px;height:${sideH}px;clip-path:polygon(0 30px,40px 0,40px ${sideH}px,0 ${sideH}px);filter:brightness(0.58)"></i>`;
  return box;
};
const stoneA = stoneFaces(250, 770, 'clay', 220, 250, 1.28), stoneB = stoneFaces(920, 880, 'char', 110, 140, 1.7);
const amtA = div('amt', 'Rs. 2,30,00,000'), amtB = div('amt', 'Rs. 1,15,00,000');
const AMT = { a: { x: 150, y: 620, w: amtA.offsetWidth }, b: { x: 640, y: 722, w: amtB.offsetWidth } };
const leaderA = el('path', { 'stroke-width': 1.4, opacity: 0.6, pathLength: 1 }, pencilL), leaderB = el('path', { 'stroke-width': 1.4, opacity: 0.6, pathLength: 1 }, pencilL);
const fracture = el('polyline', { 'stroke-width': 3, 'stroke-linejoin': 'miter', pathLength: 1 }, clayL);

const TABLETS = [
  { cls: 'char', title: 'Section 21', sub: 'Arbitration and Conciliation Act, 1996', x: 330, y: 250, r: -3, start: 21.0, pin: [220, 320] },
  { cls: 'clay', title: 'Section 9', sub: 'interim protection', x: 820, y: 230, r: 2, start: 21.12, pin: [1190, 330] },
  { cls: 'sand', title: 'Section 11', sub: 'appointment of arbitrator', x: 600, y: 330, r: -1, start: 21.24, pin: [220, 330] },
].map((d) => { const e = div(`tablet ${d.cls}`, `<b>${d.title}</b><span>${d.sub}</span>`); return { ...d, el: e, w: e.offsetWidth, h: e.offsetHeight }; });
const pins = TABLETS.map(() => el('path', { 'stroke-width': 1.4, opacity: 0.6, pathLength: 1 }, pencilL));

const TAGS = [ // real chronology dates in date order: label, source doc, target (left, top, rot, scale) from p5-p6
  ['3 Feb 2023', 1, 120, 520, -6, 1.15], ['9 Feb 2023', 0, 760, 520, 4, 0.8], ['22 Feb 2023', 0, 880, 690, 8, 1.0], ['6 Apr 2023', 0, 640, 770, -8, 0.8],
  ['15 Jan 2024', 0, 560, 600, -2, 1.3], ['30 Jun 2024', 0, 1180, 620, -7, 1.05], ['4 Jul 2024', 0, 1250, 380, 9, 0.7], ['29 Jul 2024', 0, 420, 450, 6, 0.75],
  ['14 Mar 2026', 0, 1080, 470, 5, 0.9], ['18 Jul 2026', 2, 300, 700, 3, 0.85], ['15 Aug 2026<small>calculated</small>', 2, 1010, 820, -3, 0.9], ['12 Sep 2026', 2, 40, 820, -4, 0.95],
].map(([label, src, x, y, r, s], i) => { const e = div('tag', label); const q = rng(700 + i); return { src, x, y, r, s, el: e, h: e.offsetHeight, from: [lerp(90, 370, q()), lerp(140, 520, q())] }; });
const axis = el('path', { 'stroke-width': 1.4, opacity: 0.5 }, pencilL);
const knot = el('polyline', { 'stroke-width': 1.7, opacity: 0.75 }, pencilL);
const winEl = div(''); winEl.id = 'window';

/* ------------------------------------------------------------- footage math */
// 3×3 homography helpers (row-major). sq2quad maps the unit square onto q (TL, TR, BR, BL).
function sq2quad(q) {
  const [p0, p1, p2, p3] = q;
  const dx1 = p1.x - p2.x, dx2 = p3.x - p2.x, dx3 = p0.x - p1.x + p2.x - p3.x;
  const dy1 = p1.y - p2.y, dy2 = p3.y - p2.y, dy3 = p0.y - p1.y + p2.y - p3.y;
  const den = dx1 * dy2 - dx2 * dy1, g = (dx3 * dy2 - dx2 * dy3) / den, h = (dx1 * dy3 - dx3 * dy1) / den;
  return [p1.x - p0.x + g * p1.x, p3.x - p0.x + h * p3.x, p0.x, p1.y - p0.y + g * p1.y, p3.y - p0.y + h * p3.y, p0.y, g, h, 1];
}
const mul3 = (a, b) => [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j]));
function inv3(m) {
  const [a, b, c, d, e, f, g, h, i] = m, A = e * i - f * h, Bv = -(d * i - f * g), C = d * h - e * g, det = a * A + b * Bv + c * C;
  return [A, -(b * i - c * h), b * f - c * e, Bv, a * i - c * g, -(a * f - c * d), C, -(a * h - b * g), a * e - b * d].map((v) => v / det);
}
const css3 = (m) => { const n = m.map((v) => v / m[8]); return `matrix3d(${[n[0], n[3], 0, n[6], n[1], n[4], 0, n[7], 0, 0, 1, 0, n[2], n[5], 0, n[8]].map((v) => v.toFixed(9)).join(',')})`; };
const scaleRect = (w, h) => [1 / w, 0, 0, 0, 1 / h, 0, 0, 0, 1];

const K = 1000 / 1080; // source px → base canvas px (the clip is laid out 1770.37 × 1000 at x −18.52)
const base = ([x, y]) => ({ x: (x - 20) * K, y: y * K });
// Measured top-sheet plane, ordered as the page reads: far edge on top (left, back, right, front = TL, TR, BR, BL).
const QB = [[48, 584], [359, 551], [584, 618], [261, 672]].map(base);
const QC = quadCentre(QB);
const INV_QB = inv3(sq2quad(QB));
const SHEET_TARGET = rectQuad(0, (H - W * PAGE_D / PAGE_W) / 2, W, (H + W * PAGE_D / PAGE_W) / 2);
const VIDEO_RECT = rectQuad(-18.52, 0, 1751.85, 1000);
const MATTE_END = 1.95; // the sheet matte faces camera here; the 3D crane starts from the same pose
const COVER_T = 1.8;    // from here the sheet matte covers the whole frame (checked numerically)

/* The dive is a camera move, not a morph: an exponential dolly toward the sheet
 * (affine, so the footage cannot tear) plus as much perspective straightening as
 * the footage can take while its horizon stays outside the clip (w > 0 at every
 * corner). Footage and sheet share that one warp, so the sheet never leaves its
 * surface. Once the sheet fills the frame (COVER_T) only the sheet straightens. */
function dollyQuad(t) { // the sheet's quad under the dolly alone
  const s = seg(t, 1.45, 1.85);
  const Z = t < 1.45 ? 1 + 0.05 * tw(t, 0, 1.45, 'sine.inOut') : Math.exp(Math.log(1.05) + (Math.log(22) - Math.log(1.05)) * s * s);
  const P = lerpPt(QC, { x: W / 2, y: H / 2 }, EZ('power2.inOut')(s));
  return QB.map((p) => ({ x: P.x + (p.x - QC.x) * Z, y: P.y + (p.y - QC.y) * Z }));
}
const straighten = (qa, v) => qa.map((p, i) => lerpPt(p, SHEET_TARGET[i], v));
function footageV(t, qa) { // largest straightening ≤ the eased target that keeps the footage's horizon off-clip
  const safe = (v) => { const M = mul3(sq2quad(straighten(qa, v)), INV_QB); return VIDEO_RECT.every((c) => (M[6] * c.x + M[7] * c.y + M[8]) / M[8] > 0.08); };
  const vd = tw(Math.min(t, 1.85), 1.6, 1.85, 'power2.inOut');
  if (safe(vd)) return vd;
  let lo = 0, hi = vd; for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (safe(m)) lo = m; else hi = m; }
  return lo;
}
const VS_COVER = footageV(COVER_T, dollyQuad(COVER_T));
function footageWarp(t) {
  const qa = dollyQuad(t), vf = footageV(t, qa);
  const vs = t < COVER_T ? vf : Math.max(vf, lerp(VS_COVER, 1, tw(t, COVER_T, MATTE_END, 'power2.inOut')));
  return { qf: straighten(qa, vf), qs: straighten(qa, vs) };
}

/* =============================================================== renderAt */
function renderAt(t) {
  const in3D = t < 9.05;

  /* ---- O1 footage, plane-locked dive into the top sheet (0–1.97 s) ---- */
  if (show($('footage-layer'), t < MATTE_END + 0.02)) {
    const w = footageWarp(t);
    $('footage-world').style.transform = css3(mul3(sq2quad(w.qf), INV_QB));
    show($('footage-world'), t < 1.85);
    const blur = 6 * tw(t, 1.6, 1.85, 'power2.in');
    $('lawyer').style.filter = blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : 'none';
    $('sheet').style.transform = css3(mul3(sq2quad(w.qs), scaleRect(PAGE_W, PAGE_D)));
    $('sheet').style.opacity = (tw(t, 1.24, 1.44, 'sine.inOut') * (1 - seg(t, MATTE_END, MATTE_END + 0.02))).toFixed(3);
    const sb = 2.5 * Math.sin(Math.PI * seg(t, 1.72, MATTE_END));
    $('sheet').style.filter = sb > 0.01 ? `blur(${sb.toFixed(2)}px)` : 'none';
    const mIn = tw(t, 1.2, 1.42, 'expo.out'), mOut = 1 - seg(t, 1.6, 1.74);
    sheetMarks.setAttribute('d', cornerPath(scaleQuad(w.qf, lerp(1.6, 1, mIn)), 16));
    sheetMarks.style.opacity = (mIn * mOut).toFixed(3);
  } else sheetMarks.style.opacity = 0;
  $('light').style.opacity = tw(t, MATTE_END, 2.4, 'sine.inOut').toFixed(3);
  $('vignette').style.opacity = tw(t, MATTE_END, 2.4, 'sine.inOut').toFixed(3);

  /* ---- O2–O5 three.js stacks (1.85–9.05 s) ---------------------------- */
  show($('three-host'), in3D);
  $('veil').style.opacity = (in3D ? tw(t, 8.45, 8.95, 'sine.inOut') : 1).toFixed(3);
  if (in3D) {
    setCamera(t);
    for (const s of stacks) s.g.position.y = -(s.h + 8) * tw(t, 7.95 + s.d / 9000, 8.55 + s.d / 9000, 'power2.in');
    // entry page: lying on its stack → lifts → camera-facing billboard, then hands over to the DOM sheet
    const lift = tw(t, 2.92, 3.48, 'power3.inOut');
    camera.updateMatrixWorld(true);
    const bbPos = camera.localToWorld(new THREE.Vector3(0, BB.sy, -BB.d));
    const bbQ = camera.getWorldQuaternion(new THREE.Quaternion()).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, BB.roll)));
    entryPage.position.copy(entryLie.pos.clone().lerp(bbPos, lift)); entryPage.position.y += Math.sin(lift * Math.PI) * 140;
    entryPage.quaternion.copy(entryLie.quat.clone().slerp(bbQ, lift));
    entryPage.visible = t < 3.48;
    renderer.render(scene, camera);
  }

  /* ---- O2 "Hundreds." --------------------------------------------------- */
  if (show(hundreds, t >= 2.08 && t < 3.35)) hundreds.firstChild.style.transform = `translateY(${lerp(125, 0, tw(t, 2.12, 2.6, 'expo.out')) - 125 * tw(t, 2.95, 3.3, 'power2.in')}%)`;

  /* ---- O3–O4 2D sheet: slip, handwriting, ticks, hops ------------------ */
  const sp = sheetPose(t);
  if (show(sheet2d, t >= 3.48 && t < 8.45)) {
    sheet2d.style.transform = placeCSS(SW, SH, sp.cx, sp.cy, sp.r, sp.sx, sp.sy);
    sheet2d.style.boxShadow = `0 2px 4px rgba(40,24,10,${(0.12 * tw(t, 3.48, 3.75)).toFixed(3)}), 0 40px 90px rgba(40,24,10,${(0.28 * tw(t, 3.48, 3.75)).toFixed(3)})`;
  }
  if (show(slip, t >= 3.48 && t < 8.45)) {
    const su = tw(t, 3.5, 3.92, 'power3.out'), fold = tw(t, 7.95, 8.4, 'power2.in');
    const cx = lerp(lerp(875, 1045, su), 1045, 0), cy = lerp(lerp(270, 220, su), GROUND_Y, fold);
    slip.style.transform = placeCSS(230, 200, cx, cy, lerp(lerp(-2, 7, su), 0, fold), 1, Math.max(0.001, 1 - fold));
    slip.style.zIndex = su > 0.55 ? 3 : 1;
  }
  HAND.forEach((_, i) => drawOn(hand[i], tw(t, 3.62 + i * 0.22, 3.92 + i * 0.22, 'power1.inOut')));
  drawOn(circleNote, tw(t, 3.72, 4.06, 'power1.inOut')); circleNote.style.opacity = t >= 3.72 ? 0.8 : 0;
  drawOn(arrowNote, tw(t, 4.02, 4.28, 'power1.inOut')); arrowNote.style.opacity = t >= 4.02 ? 0.8 : 0;
  let fq = null;
  FOCAL_ROWS.forEach((ri, k) => {
    const r = rowPx(rowIndex(ri)), q = rectQuad(r.x0 - 12, r.y - 13, r.x1 + 12, r.y + 13), t0 = HOP0 + k * HOPDT;
    if (t < t0) return;
    const u = tw(t, t0, t0 + 0.26, 'expo.out');
    fq = fq ? fq.map((p, i) => lerpPt(p, q[i], u)) : scaleQuad(q, lerp(1.5, 1, u));
  });
  focal.setAttribute('d', fq ? cornerPath(fq, 16) : '');
  focal.style.opacity = fq ? (1 - seg(t, 6.95, 7.15)).toFixed(3) : 0;
  TICK_ROWS.forEach((_, k) => {
    const t0 = HOP0 + k * HOPDT;
    drawOn(ticks[k], tw(t, t0 + 0.24, t0 + 0.38, 'power1.out')); ticks[k].style.opacity = t >= t0 + 0.24 ? 0.85 : 0;
    const [x0, y0, x1, y1] = JSON.parse(hops[k].dataset.p), hu = tw(t, t0 + HOPDT - 0.05, t0 + HOPDT + 0.2, 'power2.out');
    hops[k].setAttribute('d', `M${x0} ${y0} Q ${x0 - 60 * hu} ${lerp(y0, (y0 + y1) / 2, hu)}, ${lerp(x0, x1, hu)} ${lerp(y0, y1, hu)}`);
    hops[k].style.opacity = hu > 0 ? 0.55 : 0;
  });
  if (show(manually, t >= 5.3 && t < 8.3)) manually.firstChild.style.transform = `translateY(${lerp(105, 0, tw(t, 5.35, 5.95, 'expo.out')) + 108 * tw(t, 7.95, 8.28, 'power2.in')}%)`;

  /* ---- O5 one clay thread → a straight line → one point ------------- */
  let threadPts = [];
  if (t >= 6.93 && t < 9.1) {
    const anchors = [{ x: -40, y: sheetPt(sp, 0.1 * SW, rowIndex(1).v * SH).y - 40 }];
    ROWS.forEach((r, i) => anchors.push(sheetPt(sp, r.u0 * SW - (i % 2 ? 4 : 24), r.v * SH)));
    const last = ROWS.at(-1), lp = sheetPt(sp, last.u1 * SW, last.v * SH);
    anchors.push({ x: lp.x + 70, y: lp.y - 40 }, { x: 1010, y: 380 }, { x: 1180, y: 290 }, { x: 1490, y: 250 });
    const curve = catmull(anchors, 10);
    const draw = clamp(tw(t, 6.95, 7.12, 'power1.in') * 0.08 + seg(t, 7.02, 7.9) * 0.92, 0, 1);
    const n = Math.max(2, Math.round(curve.length * draw));
    const st = tw(t, 7.95, 8.55, 'power3.inOut'), ct = tw(t, 8.58, 9.03, 'expo.in');
    threadPts = curve.slice(0, n).map((p, i) => {
      const sx = lerp(p.x, lerp(-40, 1480, i / (curve.length - 1)), st);
      return { x: lerp(sx, 720, ct), y: lerp(p.y, GROUND_Y, st) };
    });
  }
  thread.setAttribute('points', ptsAttr(threadPts)); thread.style.opacity = threadPts.length ? 1 : 0;
  const dotOn = t >= 8.95 && t < 10.45;
  threadDot.setAttribute('cx', 720); threadDot.setAttribute('cy', GROUND_Y);
  threadDot.setAttribute('r', dotOn ? (5.5 * tw(t, 8.95, 9.05, 'power2.out') * (1 - seg(t, 10.3, 10.45))).toFixed(2) : 0);

  /* ---- B1 brand moment (9.37–14.73) ------------------------------------ */
  const inBrand = t >= 9.3 && t < 14.75;
  show(brand, inBrand);
  Object.values(B).forEach((n) => show(n, inBrand)); halos.forEach((h) => show(h.n, inBrand));
  if (inBrand) {
    const half = 760 * tw(t, 9.37, 10.4, 'expo.out') * (1 - tw(t, 14.08, 14.42, 'power3.in'));
    const gap = 160 * tw(t, 11.0, 11.3, 'power2.out') * (1 - tw(t, 14.0, 14.2, 'power2.in'));
    B.ground.setAttribute('d', half > gap ? `M${720 - half} ${GROUND_Y} L ${720 - gap} ${GROUND_Y} M ${720 + gap} ${GROUND_Y} L ${720 + half} ${GROUND_Y}` : '');
    const ring = (n, c, r, a, b) => { n.setAttribute('cx', c.x); n.setAttribute('cy', c.y); n.setAttribute('r', r); drawOn(n, tw(t, a, b, 'power2.out')); };
    B.riser.setAttribute('d', `M720 ${GROUND_Y} L ${NODE.trunk.x} ${NODE.trunk.y + 5.3}`); drawOn(B.riser, tw(t, 10.28, 10.46, 'power2.out'));
    ring(B.trunk, NODE.trunk, 5.3, 10.42, 10.6);
    B.axisL.setAttribute('d', `M${NODE.trunk.x} ${NODE.trunk.y - 5.3} L ${NODE.top.x} ${NODE.top.y + 8}`); drawOn(B.axisL, tw(t, 10.55, 10.92, 'power2.inOut'));
    const sideY = mk(0, 490).y;
    B.connL.setAttribute('d', `M${NODE.trunk.x} ${NODE.trunk.y - 30} Q ${NODE.left.x + 8} ${NODE.trunk.y - 40}, ${NODE.left.x} ${sideY}`); drawOn(B.connL, tw(t, 10.62, 10.86, 'power2.inOut'));
    B.connR.setAttribute('d', `M${NODE.trunk.x} ${NODE.trunk.y - 30} Q ${NODE.right.x - 8} ${NODE.trunk.y - 40}, ${NODE.right.x} ${sideY}`); drawOn(B.connR, tw(t, 10.62, 10.86, 'power2.inOut'));
    B.left.setAttribute('d', `M${NODE.left.x} ${sideY} L ${NODE.left.x} ${NODE.left.y + 8}`); drawOn(B.left, tw(t, 10.84, 10.98, 'power2.out'));
    B.right.setAttribute('d', `M${NODE.right.x} ${sideY} L ${NODE.right.x} ${NODE.right.y + 8}`); drawOn(B.right, tw(t, 10.84, 10.98, 'power2.out'));
    ring(B.top, NODE.top, 8, 10.9, 11.08); ring(B.nl, NODE.left, 8, 10.96, 11.12); ring(B.nr, NODE.right, 8, 10.96, 11.12);
    const build = 1 - seg(t, 11.3, 11.5); // construction hands over to the real mark
    ['riser', 'trunk', 'axisL', 'connL', 'connR', 'left', 'right', 'top', 'nl', 'nr'].forEach((k) => { B[k].style.opacity = (parseFloat(B[k].style.opacity || 1) * build).toFixed(3); });
    halos.forEach((h, i) => { const u = tw(t, 11.12 + i * 0.05, 11.55 + i * 0.05, 'expo.out') * (1 - tw(t, 13.95, 14.12, 'power2.in')); h.n.setAttribute('r', (h.r * u).toFixed(2)); h.n.style.opacity = (0.6 * u).toFixed(3); });
    // the dark tree fills upward from its roots; at the exit it contracts into its trunk node
    const grow = tw(t, 11.0, 11.36, 'expo.out'), back = tw(t, 14.04, 14.38, 'power3.in');
    markImg.style.clipPath = `inset(${(100 - grow * 100).toFixed(2)}% 0 0 0)`;
    markImg.style.transform = `scale(${Math.max(0.001, 1 - back).toFixed(4)})`;
    markImg.style.opacity = grow > 0 ? (1 - seg(t, 14.3, 14.38)).toFixed(3) : 0;
    letters.forEach((s, i) => {
      const u = tw(t, 11.36 + i * 0.035, 11.36 + i * 0.035 + 0.7, 'expo.out'), d = tw(t, 13.96 + (8 - i) * 0.018, 14.24 + (8 - i) * 0.018, 'power2.in');
      s.style.transform = `translateY(${lerp(140, 0, u) + 140 * d}%)`;
    });
    show(wordmarkBox, t >= 11.3);
    brand.style.transform = `scale(${1 + 0.012 * tw(t, 11.9, 14.0, 'none')})`;
  }
  { // a single window-light band crosses during the hold (12.5–13.6)
    const u = seg(t, 12.5, 13.6);
    $('sweep').style.transform = `translate(${lerp(-500, 1800, EZ('sine.inOut')(u))}px, 0) rotate(-24deg)`;
    $('sweep').style.opacity = (Math.sin(u * Math.PI) * 0.9).toFixed(3);
  }
  FRAGS.forEach((f, i) => {
    if (!show(f.el, t >= 9.4 && t < 14.6)) return;
    const u = tw(t, 9.42 + i * 0.05, 10.7 + i * 0.05, 'power3.out'), drift = tw(t, 10.7, 14.0, 'none'), out = tw(t, 13.95 + i * 0.04, 14.45, 'power2.in');
    const dx = f.to[0] - 720, dy = f.to[1] - 470, dl = Math.hypot(dx, dy);
    let x = lerp(f.from[0], f.to[0], u) + dx / dl * 22 * drift, y = lerp(f.from[1], f.to[1], u) + dy / dl * 22 * drift;
    x = lerp(x, f.out[0], out); y = lerp(y, f.out[1], out);
    f.el.style.transform = placeCSS(f.w, f.h, x, y, lerp(f.from[2], f.to[2], u) + 8 * out * (i % 2 ? 1 : -1), lerp(0.6, 1, u));
    f.el.style.opacity = Math.min(1, seg(t, 9.42 + i * 0.05, 9.6 + i * 0.05)).toFixed(3);
  });
  bug.style.opacity = tw(t, 14.5, 14.85, 'power2.out').toFixed(3);

  /* ---- 2D camera for the problem setup: push-ins, dolly back, impact shake */
  {
    const f1 = 1 + 0.04 * tw(t, 15.15, 16.17, 'sine.inOut') * (1 - tw(t, 16.17, 16.9, 'power3.out'));
    const f2 = 1 + 0.025 * tw(t, 17.9, 20.2, 'sine.inOut') * (1 - tw(t, 20.85, 21.4, 'power3.inOut'));
    const f3 = 1 + 0.02 * tw(t, 22.2, 24.3, 'sine.inOut') * (1 - tw(t, 24.43, 24.6, 'power2.in'));
    const k = t - 20.25, shake = k > 0 && k < 0.45 ? Math.sin(k * 55) * 7 * Math.exp(-k * 9) : 0;
    const cam = t >= 14.6 ? `translate(${shake.toFixed(2)}px, ${(shake * 0.4).toFixed(2)}px) translate(720px, 480px) scale(${(f1 * f2 * f3).toFixed(5)}) translate(-720px, -480px)` : '';
    ['stage2d', 'ink', 'back-type'].forEach((id) => { $(id).style.transform = cam; });
  }

  /* ---- P1 one case: the trunk node becomes a closed file (14.6–16.17) -- */
  if (show(folder, t >= 14.3 && t < 17.35)) {
    const g = tw(t, 14.62, 15.15, 'expo.out'), recede = tw(t, 16.3, 17.4, 'power3.out');
    const c = lerpPt(NODE.trunk, FOLDER_C, tw(t, 14.62, 15.0, 'power2.out'));
    const s = Math.max(0.001, lerp(0.02, 1, g) * lerp(1, 0.42, recede));
    folder.style.transform = `translate(${c.x - 720}px, ${c.y - 470}px) rotate(${lerp(16, -6, g)}deg) scale(${s})`;
    folder.style.opacity = (Math.min(1, seg(t, 14.6, 14.7)) * (1 - seg(t, 16.9, 17.3))).toFixed(3);
    fCover.style.transform = `rotateY(${-165 * tw(t, 16.18, 16.52, 'power2.inOut')}deg)`;
  }
  // until the file appears, the seed is a clay point at the trunk node
  if (t >= 14.3 && t < 14.75) { threadDot.setAttribute('cx', NODE.trunk.x); threadDot.setAttribute('cy', NODE.trunk.y); threadDot.setAttribute('r', (5.5 * seg(t, 14.3, 14.38) * (1 - seg(t, 14.62, 14.72))).toFixed(2)); }

  /* ---- P2 complex case: the file bursts open in depth ------------------ */
  for (const b of burst) {
    if (!show(b.el, t >= b.start && t < b.start + b.dur)) continue;
    const u = seg(t, b.start, b.start + b.dur), e = EZ('power3.out')(u);
    const x = FOLDER_C.x + Math.cos(b.a) * b.dist * e, y = FOLDER_C.y + Math.sin(b.a) * b.dist * 0.82 * e;
    const s = lerp(0.42, b.s1, EZ('power2.in')(u) * 0.6 + e * 0.4); // they come toward camera as the file recedes
    b.el.style.transform = placeCSS(b.w, b.h, x, y, b.r0 + b.spin * e, s);
    b.el.style.filter = `blur(${(5 * (1 - u) * (1 - u) * s).toFixed(2)}px)`;
    b.el.style.opacity = (1 - seg(u, 0.75, 1)).toFixed(3);
  }

  /* ---- P2→P3 documents fly out and stand; P5 they pull back ------------ */
  DOCS.forEach((d, i) => {
    const s0 = 16.42 + i * 0.07, u = seg(t, s0, s0 + 1.45), e = EZ('expo.out')(u);
    const p5 = tw(t, 20.85 + i * 0.03, 21.38 + i * 0.03, 'power3.inOut'), exit = tw(t, 24.43 + i * 0.03, 24.68, 'power2.in');
    const [x3, y3, s3, r3] = d.p3, [x5, y5, s5, r5] = d.p5;
    let cx = lerp(FOLDER_C.x, x3, e), cy = lerp(FOLDER_C.y, y3, e) - Math.sin(u * Math.PI) * (150 - i * 40);
    let s = lerp(0.18, s3, e), r = lerp(d.r0, r3, e);
    const fl = Math.sin(t * 0.9 + i * 2) * 3 * seg(t, 17.9, 18.4);
    cx = lerp(cx, x5, p5); cy = lerp(cy + fl, y5, p5) + 340 * exit; s = lerp(s, s5, p5); r = lerp(r, r5, p5);
    d.pose = [cx, cy, s, r];
    const lu = tw(t, 18.55 + i * 0.1, 18.9 + i * 0.1, 'power2.out') * (1 - seg(t, 20.85, 21.05));
    if (show(d.labEl, lu > 0)) { d.labEl.style.transform = `translate(${d.lab[0]}px, ${d.lab[1] + (1 - lu) * 12}px)`; d.labEl.style.opacity = ((i === 1 ? 0.7 : 1) * lu).toFixed(3); }
    if (!show(d.el, t >= s0 && t < 24.7)) return;
    d.el.style.transform = placeCSS(DOC_W, DOC_H, cx, cy, r, s);
    d.el.style.opacity = ((i === 1 ? lerp(0.92, 1, p5) : 1) * (1 - exit)).toFixed(3);
    d.el.style.filter = i === 1 ? `brightness(${lerp(0.97, 1, p5)}) saturate(${lerp(0.9, 1, p5)})` : '';
  });

  /* ---- P4 conflicting figures lift off their exact lines and collide --- */
  hlNotice.el.style.transform = `scaleX(${tw(t, 19.62, 19.86, 'power2.out').toFixed(3)})`;
  hlOrderA.el.style.transform = `scaleX(${tw(t, 19.62, 19.7, 'power2.out').toFixed(3)})`;
  hlOrder.el.style.transform = `scaleX(${tw(t, 19.7, 19.9, 'power2.out').toFixed(3)})`;
  const amtState = (node, hl, A, side, stoneTop) => {
    if (!show(node, t >= 19.86 && t < 21.15)) return null;
    const c = docPt(hl.doc, hl.x + hl.w / 2, hl.y + hl.h / 2), s0 = hl.h * hl.doc.pose[2] / 74;
    const lift = tw(t, 19.86, 20.25, 'power3.in'), grow = EZ('power2.out')(seg(t, 19.86, 20.18));
    const hit = seg(t, 20.25, 20.62), recoil = Math.sin(hit * Math.PI * 2) * (1 - hit) * 18 * side;
    let x = lerp(c.x - A.w * s0 / 2, A.x, lift) + recoil, y = lerp(c.y - 52 * s0, A.y, lift), s = lerp(s0, 1, grow);
    const away = tw(t, 20.85, 21.1, 'power2.in');
    x = lerp(x, stoneTop.x - A.w * 0.1, away); y = lerp(y, stoneTop.y - 12, away); s = lerp(s, 0.2, away);
    node.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(4)})`;
    node.style.opacity = (1 - seg(t, 20.98, 21.12)).toFixed(3);
    return { x, y, w: A.w * s, h: 104 * s };
  };
  const ra = amtState(amtA, hlNotice, AMT.a, -1, { x: 320, y: 785 }), rb = amtState(amtB, hlOrder, AMT.b, 1, { x: 990, y: 895 });
  const leaderU = tw(t, 20.22, 20.6, 'power2.out') * (1 - seg(t, 20.85, 21.0));
  if (ra && leaderU > 0) {
    const h = docPt(DOCS[0], hlNotice.x + hlNotice.w, hlNotice.y + hlNotice.h);
    leaderA.setAttribute('d', `M${h.x} ${h.y} C ${h.x + 80} ${h.y + 120}, ${ra.x + 160} ${ra.y - 120}, ${ra.x + 200} ${ra.y + 6}`);
  }
  if (rb && leaderU > 0) {
    const h = docPt(DOCS[2], hlOrder.x, hlOrder.y + hlOrder.h);
    leaderB.setAttribute('d', `M${h.x} ${h.y} C ${h.x - 120} ${h.y + 160}, ${rb.x + rb.w - 120} ${rb.y - 140}, ${rb.x + rb.w - 160} ${rb.y + 6}`);
  }
  drawOn(leaderA, leaderU); drawOn(leaderB, leaderU); leaderA.style.opacity = leaderB.style.opacity = leaderU > 0 ? 0.6 : 0;
  { // the fracture opens where the two figures meet
    const fu = tw(t, 20.25, 20.42, 'power2.out'), x = (AMT.a.x + AMT.a.w + AMT.b.x) / 2 + 10, y0 = AMT.a.y - 30, y1 = AMT.b.y + 134, pts = [];
    for (let i = 0; i <= 9; i++) pts.push({ x: i ? x + (i % 2 ? 16 : -14) : x, y: lerp(y0, y1, i / 9) });
    fracture.setAttribute('points', ptsAttr(pts)); drawOn(fracture, fu); fracture.style.opacity = fu > 0 ? (1 - seg(t, 20.85, 21.05)).toFixed(3) : 0;
  }
  // 2 : 1 stones rise beneath them for the first time, then sink away
  [[stoneA, 300], [stoneB, 180]].forEach(([st, depth], i) => {
    if (!show(st, t >= 20.1 && t < 21.4)) return;
    const up = tw(t, 20.12 + i * 0.05, 20.6 + i * 0.05, 'power3.out'), down = tw(t, 20.98, 21.36, 'power2.in');
    st.style.transform = `translateY(${(depth * (1 - up) + depth * down).toFixed(2)}px)`;
  });

  /* ---- P5 provisions: tablets drop in, pencil pins tie them to pages --- */
  TABLETS.forEach((tb, i) => {
    if (!show(tb.el, t >= tb.start && t < 24.7)) { pins[i].style.opacity = 0; return; }
    const fall = EZ('expo.in')(seg(t, tb.start, tb.start + 0.3)), land = seg(t, tb.start + 0.3, tb.start + 0.5);
    const squash = Math.sin(land * Math.PI) * (1 - land) * 0.09, exit = tw(t, 24.43 + i * 0.02, 24.64, 'power2.in');
    tb.el.style.transform = `translate(${tb.x}px, ${tb.y - 420 * (1 - fall) + 300 * exit}px) rotate(${tb.r + lerp(i % 2 ? 9 : -8, 0, fall)}deg) scale(${1 + squash * 0.6}, ${1 - squash})`;
    tb.el.style.opacity = (Math.min(1, seg(t, tb.start, tb.start + 0.08)) * (1 - exit)).toFixed(3);
    const a = { x: tb.x + tb.w / 2, y: tb.y }, pu = tw(t, 21.36 + i * 0.08, 21.7 + i * 0.08, 'power2.out');
    pins[i].setAttribute('d', `M${a.x} ${a.y} L ${tb.pin[0]} ${tb.pin[1]}`);
    drawOn(pins[i], pu); pins[i].style.opacity = pu > 0 ? (0.6 * (1 - seg(t, 24.43, 24.55))).toFixed(3) : 0;
  });

  /* ---- P6 dates peel off the pages; the timeline knots ---------------- */
  $('timeline-mask').style.width = `${1420 * tw(t, 22.25, 22.85, 'power2.inOut')}px`;
  $('back-type').style.opacity = (1 - seg(t, 24.43, 24.58)).toFixed(3);
  show($('back-type'), t >= 22.2 && t < 24.6);
  const tagPts = [];
  TAGS.forEach((g, i) => {
    const start = 22.16 + i * 0.05, u = tw(t, start, start + 0.62, 'expo.out');
    const src = docPt(DOCS[g.src], g.from[0], g.from[1]);
    const float = Math.sin(t * 1.6 + i) * 2.2 * seg(t, 23.0, 23.4), drop = tw(t, 24.43 + (i % 4) * 0.02, 24.66, 'power2.in');
    const x = lerp(src.x, g.x, u), y = lerp(src.y, g.y, u) + float, r = lerp(g.r * 3 + 20, g.r, u);
    tagPts.push({ x: x + 2, y: y + g.h / 2 }); // the knot keeps its anchors while the tags fall away
    if (!show(g.el, t >= start && t < 24.7)) return;
    g.el.style.transform = `translate(${x.toFixed(2)}px, ${(y + 380 * drop).toFixed(2)}px) rotate(${(r + drop * (i % 2 ? 25 : -25)).toFixed(3)}deg) scale(${lerp(0.22, g.s, u).toFixed(4)})`;
    g.el.style.opacity = (Math.min(1, u * 3) * (1 - drop)).toFixed(3);
  });
  axis.setAttribute('d', (() => { const L = 80 + 1280 * tw(t, 22.5, 22.95, 'power2.inOut'); let d = `M80 950 L ${L} 950`; for (let x = 120; x <= L; x += 100) d += ` M${x} 942 L ${x} 958`; return d; })());
  axis.style.opacity = t >= 22.5 ? (0.5 * (1 - seg(t, 24.43, 24.55))).toFixed(3) : 0;
  if (t >= 22.7) {
    const pts = [];
    for (let i = 0; i < tagPts.length - 1; i++) {
      const p = tagPts[i], q = tagPts[i + 1], c1 = { x: p.x + 140, y: p.y - 120 }, c2 = { x: q.x - 160, y: q.y + 140 };
      for (let s = 0; s < 20; s++) { const u = s / 20, m = 1 - u; pts.push({ x: m * m * m * p.x + 3 * m * m * u * c1.x + 3 * m * u * u * c2.x + u * u * u * q.x, y: m * m * m * p.y + 3 * m * m * u * c1.y + 3 * m * u * u * c2.y + u * u * u * q.y }); }
    }
    pts.push(tagPts.at(-1));
    const vis = Math.max(2, Math.round(pts.length * tw(t, 22.75, 23.45, 'power1.inOut')));
    const taut = tw(t, 24.43, 24.64, 'power3.inOut');
    knot.setAttribute('points', ptsAttr(pts.slice(0, vis).map((p, i) => ({ x: lerp(p.x, lerp(WIN.x, WIN.x + WIN.w, i / (pts.length - 1)), taut), y: lerp(p.y, WIN.y, taut) }))));
    knot.setAttribute('stroke', taut > 0.5 ? CLAY : '#2b2522'); knot.setAttribute('stroke-width', lerp(1.7, 2.4, taut).toFixed(2));
    knot.setAttribute('opacity', lerp(0.75, 1, taut).toFixed(3));
    const host = taut > 0.5 ? clayL : pencilL; if (knot.parentNode !== host) host.appendChild(knot);
  } else knot.setAttribute('points', '');

  /* ---- exit pose: the taut line becomes the top edge of a window ------ */
  const wu = tw(t, 24.58, 24.78, 'expo.out');
  winEl.style.opacity = t >= 24.58 ? 1 : 0; winEl.style.height = `${(WIN.h * wu).toFixed(2)}px`;
}
const WIN = { x: 160, y: 150, w: 1120, h: 650 };

/* ------------------------------------------------------------- timeline */
const clock = { t: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(clock, { t: DUR, duration: DUR, ease: 'none', onUpdate: () => renderAt(clock.t) }, 0);
renderAt(0);
window.__lvPilot = { renderAt, exitPose: { line: { y: WIN.y, x0: WIN.x, x1: WIN.x + WIN.w, color: CLAY, width: 2.4 }, window: { ...WIN, radius: 18 }, brandBug: { right: 40, top: 36, size: 30 } } };
// Registered inline in index.html (the HyperFrames static contract), after this module finishes building.
export const timeline = tl;
export const compositionId = ID;

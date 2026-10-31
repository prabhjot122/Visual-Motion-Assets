/* LawVriksh graphics track — opening pilot, global source time 0.00–24.78 s.
 *
 * One paused GSAP timeline drives renderAt(t), a pure function of time that
 * sets every layer: the framework-owned footage clip (0–1.95 s), the Three.js
 * paper world, the SVG ink (thread, corner marks, pencil) and the DOM type.
 * No clocks, no unseeded randomness, no network: same t → same frame.
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
const $ = (id) => document.getElementById(id);
const SVGNS = 'http://www.w3.org/2000/svg';
const DEG = Math.PI / 180;
const CLAY = '#c4562e', MARK_CLAY = '#bf560b', INK = '#1c1714';

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
  paper: 'assets/textures/paper.jpg', clay: 'assets/textures/stone-clay.jpg', char: 'assets/textures/stone-char.jpg',
  sand: 'assets/textures/stone-sand.jpg', hatch: 'assets/textures/hatch-sand.jpg', mark: 'assets/brand/lawvriksh-mark.png',
  docA: 'assets/docs/arora-agreement-page2.png', docN: 'assets/docs/arora-notice-page2.png', docO: 'assets/docs/arora-order-page1.png',
}).map(async ([k, src]) => [k, await loadImg(src)])));

/* --------------------------------------------------------- canvas textures */
const PAGE_W = 300, PAGE_D = 410; // a page / stack footprint in world units

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

function edgeCanvas() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 2048;
  const g = c.getContext('2d'), r = rng(91);
  for (let y = 0; y < c.height;) {
    const t = 1 + Math.floor(r() * 3), shade = r();
    g.fillStyle = shade < 0.18 ? '#b5aa98' : shade < 0.5 ? '#e6dfd2' : '#f3eee4';
    g.fillRect(0, y, 64, t); y += t;
  }
  return c;
}

function textCanvas(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h); return c;
}

/* -------------------------------------------------------------- three.js */
const renderer = new THREE.WebGLRenderer({ canvas: $('gl'), antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const maxAniso = renderer.capabilities.getMaxAnisotropy();

const tex = (src, { repeat = [1, 1], wrap = false } = {}) => {
  const t = src instanceof HTMLCanvasElement ? new THREE.CanvasTexture(src) : new THREE.Texture(src);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; t.needsUpdate = true;
  if (wrap) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
};
const lambert = (map, extra = {}) => new THREE.MeshLambertMaterial({ map, ...extra });

const scene = new THREE.Scene();
scene.background = new THREE.Color('#e6e0d5');
scene.add(new THREE.AmbientLight(0xfff3e2, 0.52));
const sun = new THREE.DirectionalLight(0xffe7c4, 0.66);
sun.position.set(-1500, 1900, 900); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -2800, right: 2800, top: 2800, bottom: -2800, near: 100, far: 7000 });
sun.shadow.bias = -0.0006; sun.shadow.radius = 4;
scene.add(sun, sun.target);

const desk = new THREE.Mesh(new THREE.PlaneGeometry(24000, 24000), lambert(tex(IMG.paper, { wrap: true, repeat: [24000 / 1440, 24000 / 1000] })));
desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; scene.add(desk);
const wall = new THREE.Mesh(new THREE.PlaneGeometry(24000, 7000), lambert(tex(IMG.paper, { wrap: true, repeat: [24000 / 1440, 7000 / 1000] }), { color: 0xe9e2d6 }));
wall.position.set(0, 3500, -2600); wall.receiveShadow = true; scene.add(wall);

// Camera rig: target → yaw → pitch → camera at distance R.
const rig = new THREE.Object3D(), pitchNode = new THREE.Object3D();
const camera = new THREE.PerspectiveCamera(32, W / H, 10, 40000);
rig.add(pitchNode); pitchNode.add(camera); scene.add(rig);

// Camera keys: [t, tx, ty, tz, yawDeg, pitchDeg, R, fov, easeIntoThisKey]
const STACK_H = 560;
const CAM_A_R = (H * PAGE_W / W) / 2 / Math.tan(16 * DEG); // entry page fills the frame width exactly
const CAM_D_R = (H / 2) / Math.tan(16 * DEG);              // top-down, 1 world unit = 1 px
const CAM = [
  [0.00, 0, STACK_H, 0, 0, -90, CAM_A_R, 32],
  [1.85, 0, STACK_H, 0, 0, -90, CAM_A_R, 32],
  [2.80, 300, 150, 120, -24, -40, 3050, 32, 'power3.inOut'],
  [2.95, 300, 150, 120, -24, -40, 3020, 32, 'sine.inOut'],
  [3.55, 140, 220, 40, -18, -31, 2300, 32, 'power2.inOut'],
  [6.90, 140, 200, 30, -15, -29, 2430, 32, 'sine.inOut'],
  [7.95, 140, 200, 30, -15, -29, 2450, 32, 'sine.inOut'],
  [9.00, 0, 0, 0, 0, -90, CAM_D_R, 32, 'power3.inOut'],
  [14.73, 0, 0, 0, 0, -90, CAM_D_R, 32],
  [16.15, 0, 20, -60, -14, -52, 1250, 32, 'power2.inOut'],
  [16.22, 0, 20, -60, -14, -52, 1240, 32],
  [17.20, 0, 150, 0, -8, -36, 3300, 32, 'power3.out'],
  [18.35, 0, 330, 0, 0, -9, 2900, 32, 'power2.inOut'],
  [20.83, 0, 330, 0, 0, -9, 2780, 32, 'sine.inOut'],
  [21.45, 0, 300, 120, 0, -21, 3500, 32, 'power2.inOut'],
  [24.80, 0, 290, 140, 2, -23, 3620, 32, 'sine.inOut'],
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
const _v = new THREE.Vector3();
function proj(x, y, z) { _v.set(x, y, z).project(camera); return { x: (_v.x + 1) / 2 * W, y: (1 - _v.y) / 2 * H, z: _v.z }; }
function projV(v3) { return proj(v3.x, v3.y, v3.z); }
const _ray = new THREE.Raycaster();
function deskPointAt(t, sx, sy) { // world point on the desk under a screen pixel at time t
  setCamera(t); _ray.setFromCamera(new THREE.Vector2(sx / W * 2 - 1, 1 - sy / H * 2), camera);
  const p = new THREE.Vector3(); _ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), p); return p;
}

/* --- stacks: page volume (O2) ------------------------------------------- */
const edgeImg = edgeCanvas();
const stacks = [];
function makeStack(x, z, h, rot, seed) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot * DEG;
  const et = tex(edgeImg, { wrap: true, repeat: [1, h / 650] });
  const side = lambert(et), plain = lambert(null, { color: 0xf3eee4 });
  const box = new THREE.Mesh(new THREE.BoxGeometry(PAGE_W, h, PAGE_D), [side, side, plain, plain, side, side]);
  box.position.y = h / 2; box.castShadow = true; box.receiveShadow = true; g.add(box);
  const pc = pageCanvas(seed, 600);
  const page = new THREE.Mesh(new THREE.PlaneGeometry(PAGE_W, PAGE_D), lambert(tex(pc.canvas)));
  page.rotation.x = -Math.PI / 2; page.position.y = h + 0.4; page.receiveShadow = true; g.add(page);
  scene.add(g); const s = { g, h, x, z, d: Math.hypot(x, z) }; stacks.push(s); return s;
}
[
  [-400, -80, 380, 3, 11], [390, -150, 640, -2, 13], [790, -40, 300, 4, 15], [-430, 470, 230, -3, 17],
  [370, 480, 450, 2, 19], [760, 540, 520, -4, 21], [40, 990, 170, 3, 23], [-800, 430, 340, -1, 25],
  [1150, 360, 270, 5, 27], [-830, -110, 470, -5, 29], [1180, -210, 420, 1, 31], [-1200, 300, 260, 2, 33],
].forEach((s) => makeStack(...s));
const entry = makeStack(0, 0, STACK_H, 0, 1);
entry.g.remove(entry.g.children[1]); // the entry stack's top page is a free object (it lifts in O3)
const entryPC = pageCanvas(7, 900);
const entryTex = tex(entryPC.canvas);
const entryPage = new THREE.Mesh(new THREE.PlaneGeometry(PAGE_W, PAGE_D), lambert(entryTex, { side: THREE.DoubleSide }));
entryPage.receiveShadow = true; entryPage.castShadow = true; scene.add(entryPage);
$('sheet').style.backgroundImage = `url(${entryPC.canvas.toDataURL('image/jpeg', 0.92)})`;

// The slip (handwritten note), a child of the entry page in page-local units.
const slip = new THREE.Mesh(new THREE.PlaneGeometry(128, 112), lambert(tex(IMG.sand)));
entryPage.add(slip);

// "Hundreds." stands up out of the desk behind the stacks.
const hundredsC = textCanvas(2400, 560, (g, w, h) => {
  g.font = '400 400px "Newsreader"'; g.fillStyle = INK; g.textBaseline = 'alphabetic';
  const word = 'Hundreds'; const ww = g.measureText(word).width; const x = (w - ww - 120) / 2;
  g.fillText(word, x, 420); g.fillStyle = '#a93a18'; g.font = 'italic 400 400px "Newsreader"'; g.fillText('.', x + ww + 6, 420);
});
const hundreds = new THREE.Mesh(new THREE.PlaneGeometry(2400, 560), new THREE.MeshBasicMaterial({ map: tex(hundredsC), transparent: true }));
hundreds.rotation.y = -24 * DEG; scene.add(hundreds);

/* --- the case: folder, burst, documents (P1–P3) ---------------------- */
const FOLDER = new THREE.Vector3(0, 0, -60);
const folder = new THREE.Group(); folder.position.copy(FOLDER); scene.add(folder);
const folderLabel = textCanvas(1020, 1380, (g, w, h) => {
  g.drawImage(IMG.sand, 0, 0, w, h); g.fillStyle = 'rgba(246,238,222,0.55)'; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(60,40,25,0.35)'; g.lineWidth = 3; g.strokeRect(60, 60, w - 120, h - 120);
  g.font = 'italic 400 104px "Newsreader"'; g.fillStyle = '#3a2a1e'; g.textAlign = 'center'; g.fillText('ARB.P. 428/2026', w / 2, h * 0.36);
  g.font = 'italic 400 64px "Newsreader"'; g.fillStyle = 'rgba(58,42,30,0.75)'; g.fillText('Arora v. Meridian Estates', w / 2, h * 0.36 + 100);
  g.strokeStyle = 'rgba(140,40,20,0.75)'; g.lineWidth = 10; g.beginPath(); g.moveTo(0, h * 0.62); g.lineTo(w, h * 0.62); g.stroke();
});
const clayMat = lambert(tex(IMG.clay, { wrap: true, repeat: [1, 1] }));
const folderBase = new THREE.Mesh(new THREE.BoxGeometry(340, 18, 460), [clayMat, clayMat, lambert(null, { color: 0xeee6d6 }), clayMat, clayMat, clayMat]);
folderBase.position.y = 9; folderBase.castShadow = true; folderBase.receiveShadow = true; folder.add(folderBase);
const coverPivot = new THREE.Object3D(); coverPivot.position.set(0, 19, -230); folder.add(coverPivot);
const cover = new THREE.Mesh(new THREE.BoxGeometry(344, 4, 464), [clayMat, clayMat, lambert(tex(folderLabel)), clayMat, clayMat, clayMat]);
cover.position.set(0, 2, 232); cover.castShadow = true; coverPivot.add(cover);

const DOC_W = 520, DOC_H = DOC_W * 1556 / 1100;
const docDefs = [
  { key: 'notice', img: IMG.docN, x: -640, z: 140, yaw: 16, label: 'Notice · page 2' },
  { key: 'agreement', img: IMG.docA, x: 0, z: -380, yaw: 0, label: 'Agreement · 3 Feb 2023' },
  { key: 'order', img: IMG.docO, x: 640, z: 140, yaw: -16, label: 'Interim order · page 1' },
];
const docs = docDefs.map((d, i) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(DOC_W, DOC_H), lambert(tex(d.img), { side: THREE.DoubleSide }));
  m.castShadow = true; scene.add(m); return { ...d, mesh: m, i };
});
// Highlights on the exact source lines (raster px of a 1100-wide page render).
function docLocal(px, py) { return [(px / 1100 - 0.5) * DOC_W, (0.5 - py / 1556) * DOC_H]; }
function addHighlight(doc, x0, y0, x1, y1) {
  const [ax, ay] = docLocal(x0, y0), [bx, by] = docLocal(x1, y1);
  const grp = new THREE.Group(); grp.position.set(ax, (ay + by) / 2, 0.6); doc.mesh.add(grp);
  const fill = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xc94820, transparent: true, opacity: 0.26, depthWrite: false }));
  fill.scale.set(bx - ax, ay - by, 1); fill.position.x = (bx - ax) / 2; grp.add(fill);
  const rule = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xc94820 }));
  rule.scale.set(bx - ax, 2.2, 1); rule.position.set((bx - ax) / 2, (by - ay) / 2, 0.1); grp.add(rule);
  return { grp, center: () => doc.mesh.localToWorld(new THREE.Vector3((ax + bx) / 2, (ay + by) / 2, 0.6)), hpx: () => Math.abs(projV(doc.mesh.localToWorld(new THREE.Vector3(ax, ay, 0))).y - projV(doc.mesh.localToWorld(new THREE.Vector3(ax, by, 0))).y) };
}
const hlNotice = [addHighlight(docs[0], 118.3, 549.6, 569.4, 575.5)];
const hlOrder = [addHighlight(docs[2], 754.6, 618.0, 814.6, 644.0), addHighlight(docs[2], 118.3, 646.6, 824.0, 672.6)];

// Burst: loose pages and stone chips that fly out of the opened folder.
const burst = [];
{
  const r = rng(404);
  const pageTex = [3, 5, 9, 12, 14, 18].map((s) => tex(pageCanvas(s, 420).canvas));
  for (let i = 0; i < 34; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(PAGE_W, PAGE_D), lambert(pageTex[i % pageTex.length], { side: THREE.DoubleSide }));
    m.castShadow = true; m.receiveShadow = true; scene.add(m);
    const ang = lerp(-170, 10, r()) * DEG, rad = lerp(520, 1750, r());
    burst.push({ m, kind: 'page', start: 16.27 + i * 0.012, dur: lerp(0.85, 1.25, r()), apex: lerp(260, 820, r()),
      p0: new THREE.Vector3(FOLDER.x + lerp(-30, 30, r()), 14 + i * 0.25, FOLDER.z + lerp(-40, 40, r())),
      p1: new THREE.Vector3(Math.cos(ang) * rad, 0.6 + i * 0.03, FOLDER.z + Math.sin(ang) * rad * 0.8),
      yaw1: lerp(-60, 60, r()) * DEG, spin: [lerp(-2, 2, r()), lerp(-1.5, 1.5, r()), lerp(-2.5, 2.5, r())] });
  }
  const stoneMats = [IMG.clay, IMG.char, IMG.sand].map((im) => lambert(tex(im)));
  for (let i = 0; i < 12; i++) {
    const s = lerp(30, 70, r());
    const m = new THREE.Mesh(new THREE.BoxGeometry(s, s * lerp(0.4, 0.9, r()), s * lerp(0.6, 1.2, r())), stoneMats[i % 3]);
    m.castShadow = true; scene.add(m);
    const ang = lerp(-180, 0, r()) * DEG, rad = lerp(380, 1500, r());
    burst.push({ m, kind: 'chip', start: 16.3 + i * 0.02, dur: lerp(0.7, 1.05, r()), apex: lerp(300, 700, r()),
      p0: new THREE.Vector3(FOLDER.x, 20, FOLDER.z), p1: new THREE.Vector3(Math.cos(ang) * rad, s * 0.3, FOLDER.z + Math.sin(ang) * rad * 0.8),
      yaw1: r() * Math.PI, spin: [lerp(-3, 3, r()), lerp(-3, 3, r()), lerp(-3, 3, r())] });
  }
}

/* --- stones (2 : 1) and provision tablets (P4–P5) --------------------- */
function stoneBlock(img, w, h, d) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lambert(tex(img)));
  m.castShadow = true; m.receiveShadow = true; scene.add(m); return m;
}
const STONE_H = 300;
const stoneA = stoneBlock(IMG.clay, 150, STONE_H * 2, 150);
const stoneB = stoneBlock(IMG.char, 150, STONE_H, 150);
const STONE_A_AT = deskPointAt(20.4, 330, 990), STONE_B_AT = deskPointAt(20.4, 1000, 990);

function tabletFace(title, sub, dark) {
  return textCanvas(1140, 510, (g, w, h) => {
    g.drawImage(dark ? IMG.char : IMG.clay, 0, 0, w, h);
    g.fillStyle = dark ? '#fbf4ec' : '#fbf4ec';
    g.font = '500 150px "Newsreader"'; g.fillText(title, 60, 230);
    g.font = '500 44px "Figtree"'; g.globalAlpha = 0.88; g.fillText(sub, 64, 330);
  });
}
function tabletFaceSand(title, sub) {
  return textCanvas(1140, 510, (g, w, h) => {
    g.drawImage(IMG.sand, 0, 0, w, h); g.fillStyle = INK;
    g.font = '500 150px "Newsreader"'; g.fillText(title, 60, 230);
    g.font = '500 44px "Figtree"'; g.globalAlpha = 0.85; g.fillText(sub, 64, 330);
  });
}
const tabletDefs = [
  { face: tabletFace('Section 21', 'Arbitration and Conciliation Act, 1996', true), stone: IMG.char, x: -380, z: 520, start: 20.95, doc: 0 },
  { face: tabletFace('Section 9', 'interim protection', false), stone: IMG.clay, x: 390, z: 560, start: 21.07, doc: 2 },
  { face: tabletFaceSand('Section 11', 'appointment of arbitrator'), stone: IMG.sand, x: 10, z: 760, start: 21.19, doc: 0 },
];
const TAB_W = 380, TAB_H = 170, TAB_D = 46;
const tablets = tabletDefs.map((d) => {
  const sm = lambert(tex(d.stone)), fm = lambert(tex(d.face));
  const m = new THREE.Mesh(new THREE.BoxGeometry(TAB_W, TAB_H, TAB_D), [sm, sm, sm, sm, fm, sm]);
  m.castShadow = true; m.receiveShadow = true; scene.add(m); return { ...d, m };
});

/* ------------------------------------------------------------ DOM / SVG */
const type = $('type'), pencilL = $('pencil-layer'), clayL = $('clay-layer'), markL = $('mark-layer');
function el(tag, attrs = {}, parent) { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; }
function div(cls, html, parent = type) { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; parent.appendChild(d); return d; }
const ptsAttr = (pts) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
function drawOn(node, u) { node.setAttribute('stroke-dasharray', '1 1'); node.setAttribute('stroke-dashoffset', (1 - clamp(u, 0, 1)).toFixed(4)); node.style.opacity = u > 0 ? 1 : 0; }
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
function rectQuad(x0, y0, x1, y1) { return [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }]; }

// Ink nodes
const sheetMarks = el('path', { 'stroke-width': 2.2 }, markL);
const focal = el('path', { 'stroke-width': 2 }, markL);
const hand = [0, 1, 2].map(() => el('polyline', { 'stroke-width': 2.4, pathLength: 1, opacity: 0.85 }, pencilL));
const circleNote = el('polyline', { 'stroke-width': 2, pathLength: 1, opacity: 0.8 }, pencilL);
const arrowNote = el('polyline', { 'stroke-width': 2, pathLength: 1, opacity: 0.8 }, pencilL);
const ticks = [0, 1, 2, 3].map(() => el('polyline', { 'stroke-width': 2.4, pathLength: 1, opacity: 0.85 }, pencilL));
const hops = [0, 1, 2, 3].map(() => el('path', { 'stroke-width': 1.4, 'stroke-dasharray': '3 6', opacity: 0.55 }, pencilL));
const pins = [0, 1, 2].map(() => el('line', { 'stroke-width': 1.4, opacity: 0.6, pathLength: 1 }, pencilL));
const axis = el('path', { 'stroke-width': 1.4, opacity: 0.5 }, pencilL);
const knot = el('polyline', { 'stroke-width': 1.7, opacity: 0.75 }, pencilL);
const thread = el('polyline', { 'stroke-width': 2.4 }, clayL);
const threadDot = el('circle', { r: 0, fill: CLAY, stroke: 'none' }, clayL);
const fracture = el('polyline', { 'stroke-width': 3, 'stroke-linejoin': 'miter', pathLength: 1 }, clayL);
const B = {}; // brand construction lines, in the mark's own clay
['ground', 'riser', 'axisL', 'left', 'right', 'connL', 'connR'].forEach((k) => { B[k] = el('path', { stroke: k === 'ground' ? CLAY : MARK_CLAY, 'stroke-width': k === 'ground' ? 2.4 : 3.2, pathLength: 1 }, clayL); });
['trunk', 'top', 'nl', 'nr'].forEach((k) => { B[k] = el('circle', { stroke: MARK_CLAY, 'stroke-width': 3.2, pathLength: 1 }, clayL); });

// Type nodes
const manually = div('mask', '<div class="word" style="left:0;top:0;font-size:230px">Manually<em>.</em></div>');
Object.assign(manually.style, { left: '40px', top: '690px', width: '1000px', height: '260px' });
const brand = div('', '', type); Object.assign(brand.style, { position: 'absolute', left: 0, top: 0, width: '1440px', height: '1000px', transformOrigin: '720px 470px' });
const MARK_S = 0.39, MARK_X = 720 - 506.5 * MARK_S, MARK_Y = 440 - 864 * MARK_S;
const markImg = document.createElement('img'); markImg.src = 'assets/brand/lawvriksh-mark.png'; markImg.alt = '';
Object.assign(markImg.style, { position: 'absolute', left: `${MARK_X}px`, top: `${MARK_Y}px`, width: `${1024 * MARK_S}px`, height: `${996 * MARK_S}px` });
brand.appendChild(markImg);
const mk = (x, y) => ({ x: MARK_X + x * MARK_S, y: MARK_Y + y * MARK_S });
const NODE = { top: mk(506.5, 345.5), left: mk(391.7, 424), right: mk(623.7, 424), trunk: mk(507, 737.8) };
const wordmarkBox = div('mask', '', brand); Object.assign(wordmarkBox.style, { left: '0', top: '488px', width: '1440px', height: '230px' });
const wordmark = div('wordmark', '', wordmarkBox);
Object.assign(wordmark.style, { position: 'absolute', left: '0', top: '10px', width: '1440px', textAlign: 'center', fontSize: '176px', transformOrigin: '0 0' });
const letters = [];
'LawVriksh'.split('').forEach((ch, i) => { const s = document.createElement('span'); s.textContent = ch; if (i >= 3) s.className = 'v'; wordmark.appendChild(s); letters.push(s); });

const amtA = div('amt', 'Rs. 2,30,00,000'), amtB = div('amt', 'Rs. 1,15,00,000');
const labels = docs.map((d) => div('plabel', d.label));
const TAGS = [ // date, source doc index, target (left, top, rot, scale) — real chronology dates
  ['3 Feb 2023', 1, 120, 520, -6, 1.15], ['9 Feb 2023', 0, 760, 520, 4, 0.8], ['22 Feb 2023', 0, 880, 690, 8, 1.0], ['6 Apr 2023', 0, 640, 770, -8, 0.8],
  ['15 Jan 2024', 0, 560, 600, -2, 1.3], ['30 Jun 2024', 0, 1180, 620, -7, 1.05], ['4 Jul 2024', 0, 1250, 380, 9, 0.7], ['29 Jul 2024', 0, 420, 450, 6, 0.75],
  ['14 Mar 2026', 0, 1080, 470, 5, 0.9], ['18 Jul 2026', 2, 300, 700, 3, 0.85], ['15 Aug 2026<small>calculated</small>', 2, 1010, 820, -3, 0.9], ['12 Sep 2026', 2, 40, 820, -4, 0.95],
];
const tags = TAGS.map(([d]) => div('tag', d));
const winEl = document.createElement('div'); winEl.id = 'window'; type.appendChild(winEl);

/* ------------------------------------------------------------- footage math */
const K = 1000 / 1080; // source px → base canvas px (crop x from 20)
const base = ([x, y]) => ({ x: (x - 20) * K, y: y * K });
const QUAD_SRC = [[359, 551], [584, 618], [261, 672], [48, 584]]; // measured top-sheet plane: back, right, front, left
const QB = QUAD_SRC.map(base);
const QC = { x: QB.reduce((s, p) => s + p.x, 0) / 4, y: QB.reduce((s, p) => s + p.y, 0) / 4 };
const SHEET_TARGET = rectQuad(0, (H - W * PAGE_D / PAGE_W) / 2, W, (H + W * PAGE_D / PAGE_W) / 2);
function homography(w, h, q) { // CSS matrix3d mapping a w×h element onto quad q (TL, TR, BR, BL)
  const [p0, p1, p2, p3] = q;
  const dx1 = p1.x - p2.x, dx2 = p3.x - p2.x, dx3 = p0.x - p1.x + p2.x - p3.x;
  const dy1 = p1.y - p2.y, dy2 = p3.y - p2.y, dy3 = p0.y - p1.y + p2.y - p3.y;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / den, hh = (dx1 * dy3 - dx3 * dy1) / den;
  const a = p1.x - p0.x + g * p1.x, b = p3.x - p0.x + hh * p3.x, c = p0.x;
  const d = p1.y - p0.y + g * p1.y, e = p3.y - p0.y + hh * p3.y, f = p0.y;
  return `matrix3d(${[a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, c, f, 0, 1].map((n) => n.toFixed(8)).join(',')})`;
}

/* ------------------------------------------------------------- derived anchors */
const entryLie = { pos: new THREE.Vector3(0, STACK_H + 0.4, 0), quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)) };
const BB = { d: 0, sy: 0, roll: -5 * DEG }; // billboard: page centred at (720, 440), 780 px tall
{ const visH = PAGE_D * H / 780; BB.d = visH / 2 / Math.tan(16 * DEG); BB.sy = (500 - 440) / H * visH; }
const ROWS = entryPC.rows;
const TICK_ROWS = [3, 5, 8, 11], FOCAL_ROWS = [3, 5, 8, 11, 13];
const rowIndex = (i) => ROWS.find((r) => r.i === i) || ROWS[Math.min(i, ROWS.length - 1)];
function pageLocal(u, v) { return new THREE.Vector3((u - 0.5) * PAGE_W, (0.5 - v) * PAGE_D, 0.5); }
function pageScreen(u, v) { return projV(entryPage.localToWorld(pageLocal(u, v))); }
function loops(x, y, w, n, amp, seed) { // abstract handwriting in slip-local units
  const r = rng(seed), pts = [];
  for (let i = 0; i <= n * 8; i++) { const s = i / (n * 8); pts.push({ x: x + s * w, y: y + Math.sin(s * n * Math.PI * 2) * amp * (0.7 + r() * 0.5) + Math.sin(s * 3.1) * 2 }); }
  return pts;
}
const HAND = [loops(-52, 30, 100, 6, 6, 3), loops(-55, 2, 110, 7, 6, 4), loops(-50, -26, 78, 5, 6, 5)];
const KNOT_TARGET_Y = 150, WIN_X0 = 160, WIN_X1 = 1280;

/* =============================================================== renderAt */
function renderAt(t) {
  setCamera(t);

  /* ---- footage, 0–1.95 s --------------------------------------------- */
  const fw = $('footage-world'), sheet = $('sheet');
  if (t < 1.95) {
    const Z = (1 + 0.1 * tw(t, 0, 1.5, 'sine.inOut')) * (1 + 3.2 * tw(t, 1.5, 1.85, 'power3.in'));
    const m = tw(t, 1.35, 1.85, 'power2.in');
    const P = { x: lerp(QC.x, 720, m), y: lerp(QC.y, 500, m) };
    fw.style.transform = `translate(${P.x}px,${P.y}px) scale(${Z}) translate(${-QC.x}px,${-QC.y}px)`;
    const blur = 3 * tw(t, 1.6, 1.85, 'power2.in');
    $('lawyer').style.filter = blur > 0.01 ? `blur(${blur}px) brightness(${1 - 0.12 * blur / 3})` : 'none';
    const qs = QB.map((p) => ({ x: P.x + Z * (p.x - QC.x), y: P.y + Z * (p.y - QC.y) }));
    const u2 = tw(t, 1.52, 1.85, 'power3.inOut');
    const q = qs.map((p, i) => ({ x: lerp(p.x, SHEET_TARGET[i].x, u2), y: lerp(p.y, SHEET_TARGET[i].y, u2) }));
    sheet.style.transform = homography(PAGE_W, PAGE_D, q);
    sheet.style.opacity = (tw(t, 1.3, 1.52, 'sine.inOut') * (1 - seg(t, 1.86, 1.92))).toFixed(3);
    fw.style.opacity = t < 1.85 ? 1 : 0;
    // corner marks lock onto the measured plane (1.20) and ride it until the sheet rises
    const mIn = tw(t, 1.2, 1.42, 'expo.out'), mOut = 1 - seg(t, 1.56, 1.7);
    const sc = lerp(1.6, 1, mIn), cx = q.reduce((s, p) => s + p.x, 0) / 4, cy = q.reduce((s, p) => s + p.y, 0) / 4;
    sheetMarks.setAttribute('d', cornerPath(q.map((p) => ({ x: cx + (p.x - cx) * sc, y: cy + (p.y - cy) * sc })), 16));
    sheetMarks.style.opacity = (mIn * mOut).toFixed(3);
    $('footage-layer').style.display = '';
  } else {
    $('footage-layer').style.display = 'none'; sheetMarks.style.opacity = 0;
  }
  $('light').style.opacity = tw(t, 1.85, 2.3, 'sine.inOut').toFixed(3);
  $('vignette').style.opacity = tw(t, 1.85, 2.3, 'sine.inOut').toFixed(3);

  /* ---- stacks and the entry page (O2–O5) ----------------------------- */
  const sinkU = (s) => tw(t, 7.95 + s.d / 9000, 8.55 + s.d / 9000, 'power2.in');
  for (const s of stacks) { const u = sinkU(s); s.g.position.y = -(s.h + 8) * u; s.g.visible = t < 9.2; }
  hundreds.visible = t > 2.0 && t < 3.9;
  hundreds.position.set(-120, lerp(-300, 290, tw(t, 2.15, 2.62, 'power3.out')) - 600 * tw(t, 3.1, 3.7, 'power2.in'), -1250);

  // Entry page pose: lying on the entry stack → lifts → camera-facing billboard → folds edge-on.
  const lift = tw(t, 2.92, 3.48, 'power3.inOut');
  camera.updateMatrixWorld(true);
  const camQ = camera.getWorldQuaternion(new THREE.Quaternion());
  const bbPos = camera.localToWorld(new THREE.Vector3(0, BB.sy, -BB.d));
  const bbQ = camQ.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, BB.roll)));
  const fold = tw(t, 7.95, 8.45, 'power2.in');
  bbQ.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-fold * Math.PI / 2, 0, 0)));
  const sinkE = sinkU(entry);
  const liePos = entryLie.pos.clone(); liePos.y -= (entry.h + 8) * (t < 2.92 ? 0 : 0);
  entryPage.position.copy(liePos.lerp(bbPos, lift)); entryPage.position.y += Math.sin(lift * Math.PI) * 140;
  entryPage.quaternion.copy(entryLie.quat.clone().slerp(bbQ, lift));
  entryPage.visible = t < 8.5;
  entryPage.updateMatrixWorld(true);
  void sinkE;

  // Slip slides out from under the page (page-local units).
  const so = tw(t, 3.15, 3.5, 'power3.out');
  slip.position.set(lerp(40, 196, so), lerp(110, 150, so), so > 0.65 ? 0.8 : -0.8);
  slip.rotation.z = lerp(0, 7, so) * DEG; slip.visible = t > 3.1 && t < 8.5;
  slip.updateMatrixWorld(true);

  /* ---- pencil: handwriting, ticks, hops, focal marks (O3–O4) ---------- */
  const collapse = tw(t, 7.95, 8.4, 'power2.in');
  pencilL.setAttribute('transform', collapse > 0 ? `translate(0 440) scale(1 ${Math.max(0.001, 1 - collapse)}) translate(0 -440)` : '');
  pencilL.style.opacity = t < 8.45 ? 1 : 0;
  const slipPt = (p) => projV(slip.localToWorld(new THREE.Vector3(p.x, p.y, 0.5)));
  HAND.forEach((pts, i) => { hand[i].setAttribute('points', ptsAttr(pts.map(slipPt))); drawOn(hand[i], tw(t, 3.42 + i * 0.22, 3.72 + i * 0.22, 'power1.inOut')); hand[i].style.opacity = t < 3.42 ? 0 : 0.85; });
  { // circle a row, then a margin arrow
    const r3 = rowIndex(3), c = pageScreen((r3.u0 + r3.u1) / 2, r3.v), ex = pageScreen(r3.u1 + 0.03, r3.v).x - c.x;
    const pts = []; for (let i = 0; i <= 64; i++) { const a = -2.8 + i / 64 * Math.PI * 2.1; pts.push({ x: c.x + Math.cos(a) * ex * 1.02, y: c.y + Math.sin(a) * 15 }); }
    circleNote.setAttribute('points', ptsAttr(pts)); drawOn(circleNote, tw(t, 3.62, 3.98, 'power1.inOut')); if (t < 3.62) circleNote.style.opacity = 0;
    const a0 = pageScreen(0.06, 0.62), a1 = pageScreen(0.06, 0.78);
    arrowNote.setAttribute('points', ptsAttr([a0, a1, { x: a1.x - 9, y: a1.y - 13 }, a1, { x: a1.x + 9, y: a1.y - 13 }]));
    drawOn(arrowNote, tw(t, 3.95, 4.22, 'power1.inOut')); if (t < 3.95) arrowNote.style.opacity = 0;
  }
  // Focal marks hop one row at a time (O4), leaving ticks and a dotted trail.
  const HOP0 = 4.4, HOPDT = 0.42;
  let fq = null, fOp = 0;
  FOCAL_ROWS.forEach((ri, k) => {
    const r = rowIndex(ri), a = pageScreen(r.u0, r.v), b = pageScreen(r.u1, r.v);
    const q = rectQuad(a.x - 12, a.y - 13, b.x + 12, b.y + 13);
    if (t >= HOP0 + k * HOPDT - 0.001) {
      const u = tw(t, HOP0 + k * HOPDT, HOP0 + k * HOPDT + 0.26, 'expo.out');
      fq = fq ? fq.map((p, i) => ({ x: lerp(p.x, q[i].x, u), y: lerp(p.y, q[i].y, u) })) : q.map((p) => ({ x: lerp(p.x, a.x + 40, 1 - u) , y: p.y })).map((p, i) => ({ x: lerp(q[i].x * 0 + p.x, q[i].x, u), y: q[i].y }));
      fOp = 1;
    }
    if (k < TICK_ROWS.length) {
      const tk = { x: a.x - 26, y: a.y };
      ticks[k].setAttribute('points', ptsAttr([{ x: tk.x - 9, y: tk.y - 2 }, { x: tk.x - 3, y: tk.y + 5 }, { x: tk.x + 9, y: tk.y - 11 }]));
      const tu = tw(t, HOP0 + k * HOPDT + 0.22, HOP0 + k * HOPDT + 0.36, 'power1.out'); drawOn(ticks[k], tu); if (tu <= 0) ticks[k].style.opacity = 0;
      const nr = rowIndex(FOCAL_ROWS[k + 1]), n = pageScreen(nr.u0, nr.v);
      const p0 = { x: a.x - 26, y: a.y }, p1 = { x: n.x - 26, y: n.y };
      const hu = tw(t, HOP0 + (k + 1) * HOPDT - 0.05, HOP0 + (k + 1) * HOPDT + 0.2, 'power2.out');
      const mid = { x: lerp(p0.x, p0.x - 60, 1), y: (p0.y + p1.y) / 2 };
      const end = { x: lerp(p0.x, p1.x, hu), y: lerp(p0.y, p1.y, hu) };
      hops[k].setAttribute('d', `M${p0.x} ${p0.y} Q ${lerp(p0.x, mid.x, hu)} ${lerp(p0.y, mid.y, hu)}, ${end.x} ${end.y}`);
      hops[k].style.opacity = hu > 0 ? 0.55 : 0;
    }
  });
  const focalOut = 1 - seg(t, 6.95, 7.2);
  focal.setAttribute('d', fq ? cornerPath(fq, 16) : ''); focal.style.opacity = (fOp * focalOut).toFixed(3);
  // "Manually." rises inside its mask.
  manually.firstChild.style.transform = `translateY(${lerp(105, 0, tw(t, 5.35, 5.95, 'expo.out')) + 40 * tw(t, 7.95, 8.3, 'power2.in')}%)`;
  manually.style.opacity = (1 - seg(t, 7.95, 8.25)).toFixed(3);
  manually.style.display = t >= 5.3 && t < 8.3 ? '' : 'none';

  /* ---- the thread: one continuous sweep (O5) → line → point ---------- */
  let threadPts = [];
  if (t >= 6.93 && t < 9.5) {
    const anchors = [{ x: -30, y: pageScreen(0.1, rowIndex(1).v).y - 40 }];
    ROWS.forEach((r, i) => { const p = pageScreen(r.u0, r.v); anchors.push({ x: p.x - (i % 2 ? 4 : 24), y: p.y }); });
    const lastRow = pageScreen(ROWS.at(-1).u1, ROWS.at(-1).v), s0 = projV(slip.localToWorld(new THREE.Vector3(-40, 0, 0.5)));
    anchors.push({ x: lastRow.x + 60, y: lastRow.y - 40 }, { x: s0.x + 40, y: s0.y + 60 }, { x: 1180, y: 300 }, { x: 1480, y: 260 });
    const curve = catmull(anchors, 10);
    const draw = tw(t, 6.95, 7.9, 'power1.in') * 0.08 + seg(t, 7.02, 7.9) * 0.92;
    const n = Math.max(2, Math.round(curve.length * clamp(draw, 0, 1)));
    // straighten to y=440 (7.95–8.55), then contract to the ground-line centre (8.6–9.03)
    const st = tw(t, 7.95, 8.55, 'power3.inOut'), ct = tw(t, 8.58, 9.03, 'expo.in');
    threadPts = curve.slice(0, n).map((p, i) => {
      const fx = lerp(-30, 1470, i / (curve.length - 1));
      const sx = lerp(p.x, fx, st), sy = lerp(p.y, 440, st);
      return { x: lerp(sx, 720, ct), y: sy };
    });
    thread.style.opacity = 1;
  }
  thread.setAttribute('points', ptsAttr(threadPts)); if (!threadPts.length) thread.style.opacity = 0;
  const dotR = t >= 8.9 && t < 9.6 ? lerp(0, 5.5, tw(t, 8.9, 9.03, 'power2.out')) : 0;
  threadDot.setAttribute('cx', 720); threadDot.setAttribute('cy', 440); threadDot.setAttribute('r', dotR);

  /* ---- brand moment (B1) ---------------------------------------------- */
  const inBrand = t >= 9.3 && t < 14.8;
  brand.style.display = inBrand ? '' : 'none';
  Object.values(B).forEach((n) => { n.style.display = inBrand ? '' : 'none'; });
  if (inBrand) {
    const half = 780 * tw(t, 9.37, 10.4, 'expo.out') * (1 - tw(t, 14.12, 14.5, 'power3.in'));
    wordmarkBox.style.display = t >= 11.3 ? '' : 'none';
    B.ground.setAttribute('d', `M${720 - half} 440 L ${720 + half} 440`); B.ground.style.opacity = half > 0.5 ? 1 : 0;
    const brandFade = 1 - seg(t, 11.15, 11.45);
    B.riser.setAttribute('d', `M720 440 L ${NODE.trunk.x} ${NODE.trunk.y + 5.3}`); drawOn(B.riser, tw(t, 10.28, 10.46, 'power2.out'));
    const ring = (n, c, r, a, b) => { n.setAttribute('cx', c.x); n.setAttribute('cy', c.y); n.setAttribute('r', r); drawOn(n, tw(t, a, b, 'power2.out')); };
    ring(B.trunk, NODE.trunk, 5.3, 10.42, 10.6);
    B.axisL.setAttribute('d', `M${NODE.trunk.x} ${NODE.trunk.y - 5.3} L ${NODE.top.x} ${NODE.top.y + 8}`); drawOn(B.axisL, tw(t, 10.55, 10.92, 'power2.inOut'));
    B.connL.setAttribute('d', `M${NODE.trunk.x} ${NODE.trunk.y - 30} Q ${NODE.left.x + 8} ${NODE.trunk.y - 40}, ${NODE.left.x} ${mk(0, 490).y}`); drawOn(B.connL, tw(t, 10.62, 10.86, 'power2.inOut'));
    B.connR.setAttribute('d', `M${NODE.trunk.x} ${NODE.trunk.y - 30} Q ${NODE.right.x - 8} ${NODE.trunk.y - 40}, ${NODE.right.x} ${mk(0, 489).y}`); drawOn(B.connR, tw(t, 10.62, 10.86, 'power2.inOut'));
    B.left.setAttribute('d', `M${NODE.left.x} ${mk(0, 490).y} L ${NODE.left.x} ${NODE.left.y + 8}`); drawOn(B.left, tw(t, 10.84, 10.98, 'power2.out'));
    B.right.setAttribute('d', `M${NODE.right.x} ${mk(0, 489).y} L ${NODE.right.x} ${NODE.right.y + 8}`); drawOn(B.right, tw(t, 10.84, 10.98, 'power2.out'));
    ring(B.top, NODE.top, 8, 10.9, 11.08); ring(B.nl, NODE.left, 8, 10.96, 11.12); ring(B.nr, NODE.right, 8, 10.96, 11.12);
    ['riser', 'trunk', 'axisL', 'connL', 'connR', 'left', 'right', 'top', 'nl', 'nr'].forEach((k) => { B[k].style.opacity = (parseFloat(B[k].style.opacity || 1) * brandFade).toFixed(3); });
    // the dark tree grows upward from its roots, then retracts at the exit
    const grow = tw(t, 11.0, 11.36, 'expo.out'), shrink = tw(t, 14.0, 14.36, 'power2.in');
    markImg.style.clipPath = `inset(${(100 - grow * 100) + shrink * 100}% 0 0 0)`;
    markImg.style.opacity = grow > 0 ? 1 : 0;
    letters.forEach((s, i) => { const u = tw(t, 11.36 + i * 0.035, 11.36 + i * 0.035 + 0.7, 'expo.out'); s.style.transform = `translateY(${lerp(110, 0, u)}%)`; });
    const drift = 1 + 0.012 * tw(t, 11.9, 14.0, 'none');
    brand.style.transform = `scale(${drift})`;
    // wordmark → brand bug (top right) at the exit
    const bug = tw(t, 14.0, 14.6, 'power3.inOut');
    const ww = wordmark.firstChild ? wordmark.scrollWidth : 1440;
    void ww;
    const s = lerp(1, 30 / 176, bug);
    const textW = letters.reduce((a, l) => a + l.offsetWidth, 0);
    const x0 = (1440 - textW) / 2, tx = lerp(0, (1400 - textW * s) - x0 * s, bug), ty = lerp(0, 36 - 488 - 10 - 176 * 0.14 * s, bug);
    wordmark.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    wordmarkBox.style.overflow = bug > 0 ? 'visible' : 'hidden';
  }
  // brand bug persists after the brand moment
  const bugEl = $('bug') || (() => { const d = div('wordmark', 'Law<span class="v">Vriksh</span>'); d.id = 'bug'; Object.assign(d.style, { position: 'absolute', right: '40px', top: '36px', fontSize: '30px' }); return d; })();
  bugEl.style.opacity = t >= 14.6 ? (1 - seg(t, 24.5, 24.6) * 0) : 0;

  /* ---- the case seed → folder (P1) ------------------------------------ */
  const seedDot = t >= 14.36 && t < 14.85;
  if (seedDot) { threadDot.setAttribute('r', lerp(5.5, 0, seg(t, 14.6, 14.75))); threadDot.setAttribute('cx', 720); threadDot.setAttribute('cy', 440); }
  const fg = tw(t, 14.62, 15.15, 'expo.out');
  folder.visible = t >= 14.62;
  folder.scale.setScalar(Math.max(0.001, lerp(0.03, 1, fg)));
  folder.position.set(FOLDER.x, lerp(60, 0, tw(t, 14.62, 14.95, 'power2.in')), FOLDER.z);
  folder.rotation.y = lerp(22, 4, fg) * DEG;
  coverPivot.rotation.x = -lerp(0, 118, tw(t, 16.2, 16.62, 'back.out(1.3)')) * DEG;

  /* ---- burst (P2) ------------------------------------------------------ */
  for (const b of burst) {
    const u = seg(t, b.start, b.start + b.dur);
    b.m.visible = t >= b.start - 0.02;
    if (!b.m.visible) continue;
    const e = EZ('power2.out')(u);
    b.m.position.set(lerp(b.p0.x, b.p1.x, e), lerp(b.p0.y, b.p1.y, u) + b.apex * 4 * u * (1 - u), lerp(b.p0.z, b.p1.z, e));
    const spin = Math.sin(u * Math.PI);
    if (b.kind === 'page') b.m.rotation.set(-Math.PI / 2 + b.spin[0] * spin, b.spin[1] * spin, b.yaw1 * e + b.spin[2] * spin);
    else b.m.rotation.set(b.spin[0] * u * 3, b.yaw1 + b.spin[1] * u * 3, b.spin[2] * u * 3);
  }
  // the three documents fly out with the burst and stand in depth (P2→P3)
  docs.forEach((d, i) => {
    const s0 = 16.34 + i * 0.05, u = seg(t, s0, s0 + 1.55), e = EZ('power3.inOut')(u);
    d.mesh.visible = t >= s0 - 0.02;
    const p0 = new THREE.Vector3(FOLDER.x, 20 + i, FOLDER.z), p1 = new THREE.Vector3(d.x, DOC_H / 2, d.z);
    d.mesh.position.set(lerp(p0.x, p1.x, e), lerp(p0.y, p1.y, e) + Math.sin(u * Math.PI) * (700 - i * 90), lerp(p0.z, p1.z, e));
    d.mesh.rotation.set(lerp(-Math.PI / 2, 0, EZ('power2.inOut')(u)) + Math.sin(u * Math.PI) * 0.6, lerp(0, d.yaw * DEG, e) + Math.sin(u * Math.PI) * (i - 1) * 0.8, Math.sin(u * Math.PI) * (1 - i) * 0.4);
    d.mesh.scale.setScalar(lerp(PAGE_W / DOC_W, 1, e));
    d.mesh.updateMatrixWorld(true);
  });

  /* ---- documents labels (P3), highlights + figures (P4) --------------- */
  docs.forEach((d, i) => {
    const top = projV(d.mesh.localToWorld(new THREE.Vector3(0, DOC_H / 2 + 26, 0)));
    const u = tw(t, 18.55 + i * 0.1, 18.9 + i * 0.1, 'power2.out') * (1 - seg(t, 20.9, 21.2));
    labels[i].style.transform = `translate(${top.x - labels[i].offsetWidth / 2}px, ${top.y - 30 + (1 - u) * 12}px)`;
    labels[i].style.opacity = u.toFixed(3);
    labels[i].style.display = u > 0 ? '' : 'none';
  });
  const hlU = tw(t, 19.62, 19.86, 'power2.out');
  [...hlNotice, ...hlOrder].forEach((h, i) => { h.grp.visible = t >= 19.6; h.grp.scale.x = Math.max(0.001, i === 2 ? tw(t, 19.7, 19.9, 'power2.out') : hlU); });
  function placeAmount(node, hl, target, side) {
    const show = t >= 19.86 && t < 21.25;
    node.style.display = show ? '' : 'none'; if (!show) return;
    const w0 = node.offsetWidth, c = projV(hl.center()), s0 = Math.max(0.05, hl.hpx() / 74);
    const u = tw(t, 19.86, 20.25, 'power3.in');
    const hit = seg(t, 20.25, 20.6), recoil = Math.sin(hit * Math.PI) * (1 - hit) * 26 * side;
    let x = lerp(c.x - w0 * s0 / 2, target.x, u) + recoil, y = lerp(c.y - 52 * s0, target.y, u) + recoil * 0.4;
    let s = lerp(s0, 1, EZ('power2.out')(seg(t, 19.86, 20.2)));
    const away = tw(t, 20.85, 21.15, 'power2.in'), st = projV(side < 0 ? stoneA.position.clone().setY(STONE_H * 2) : stoneB.position.clone().setY(STONE_H));
    x = lerp(x, st.x - w0 * 0.12, away); y = lerp(y, st.y - 20, away); s = lerp(s, 0.24, away);
    node.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    node.style.opacity = (1 - seg(t, 21.0, 21.2)).toFixed(3);
  }
  placeAmount(amtA, hlNotice[0], { x: 150, y: 560 }, -1);
  placeAmount(amtB, hlOrder[1], { x: 640, y: 672 }, 1);
  { // fracture where the figures meet
    const fu = tw(t, 20.25, 20.42, 'power2.out'), out = 1 - seg(t, 20.85, 21.05);
    const x = 760, y0 = 535, y1 = 800, pts = [];
    for (let i = 0; i <= 9; i++) pts.push({ x: x + (i % 2 ? 16 : -14), y: lerp(y0, y1, i / 9) });
    fracture.setAttribute('points', ptsAttr(pts)); drawOn(fracture, fu); fracture.style.opacity = fu > 0 ? out : 0;
  }
  // 2 : 1 stones rise under the figures
  const ru = tw(t, 20.12, 20.62, 'power3.out');
  stoneA.visible = stoneB.visible = t >= 20.1;
  stoneA.scale.y = Math.max(0.001, ru); stoneA.position.set(STONE_A_AT.x, STONE_H * ru, STONE_A_AT.z);
  stoneB.scale.y = Math.max(0.001, ru); stoneB.position.set(STONE_B_AT.x, STONE_H / 2 * ru, STONE_B_AT.z);

  /* ---- provisions: tablets drop in and are pinned (P5) ---------------- */
  tablets.forEach((tb, i) => {
    const u = seg(t, tb.start, tb.start + 0.34), fall = EZ('expo.in')(u);
    tb.m.visible = t >= tb.start;
    const settle = Math.sin(seg(t, tb.start + 0.34, tb.start + 0.48) * Math.PI) * 6;
    tb.m.position.set(tb.x, lerp(1100, TAB_H / 2, fall) - settle, tb.z);
    tb.m.rotation.set(lerp(-10, 0, fall) * DEG, lerp(i % 2 ? 14 : -12, (i - 1) * -3, fall) * DEG, 0);
    tb.m.updateMatrixWorld(true);
    const a = projV(tb.m.localToWorld(new THREE.Vector3(0, TAB_H / 2, 0))), b = projV(docs[tb.doc].mesh.localToWorld(new THREE.Vector3(0, -DOC_H * 0.1, 0)));
    pins[i].setAttribute('x1', a.x); pins[i].setAttribute('y1', a.y); pins[i].setAttribute('x2', b.x); pins[i].setAttribute('y2', b.y);
    drawOn(pins[i], tw(t, 21.35 + i * 0.08, 21.7 + i * 0.08, 'power2.out')); if (t < 21.35) pins[i].style.opacity = 0;
    pins[i].style.opacity = (parseFloat(pins[i].style.opacity) * (1 - seg(t, 22.2, 22.6))).toFixed(3);
  });

  /* ---- dates peel off, the timeline knots (P6), then pulls taut ------- */
  const veil = Math.max(0.36 * tw(t, 22.2, 22.8, 'sine.inOut'), tw(t, 24.43, 24.62, 'power2.in'));
  $('veil').style.opacity = veil.toFixed(3);
  $('timeline-mask').style.width = `${1420 * tw(t, 22.25, 22.85, 'power2.inOut')}px`;
  $('back-type').style.opacity = (1 - seg(t, 24.43, 24.58)).toFixed(3);
  $('back-type').style.display = t >= 22.2 && t < 24.6 ? '' : 'none';
  const r = rng(77);
  const tagPts = [];
  TAGS.forEach(([, src, x1, y1, rot1, s1], i) => {
    const el2 = tags[i], start = 22.16 + i * 0.05, u = tw(t, start, start + 0.62, 'expo.out');
    const srcPt = projV(docs[src].mesh.localToWorld(new THREE.Vector3(lerp(-0.3, 0.3, r()) * DOC_W, lerp(-0.25, 0.3, r()) * DOC_H, 1)));
    const show = t >= start;
    el2.style.display = show && t < 24.7 ? '' : 'none';
    const float = Math.sin(t * 1.6 + i) * 2.2 * seg(t, 23.0, 23.4);
    const drop = tw(t, 24.43 + (i % 4) * 0.02, 24.66, 'power2.in');
    const x = lerp(srcPt.x, x1, u), y = lerp(srcPt.y, y1, u) + float + 380 * drop, rot = lerp(rot1 * 3, rot1, u) + drop * (i % 2 ? 25 : -25);
    const s = lerp(0.25, s1, u);
    el2.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${s})`;
    el2.style.opacity = (Math.min(1, u * 3) * (1 - drop)).toFixed(3);
    const h2 = el2.offsetHeight || 46;
    tagPts.push({ x: x + 2, y: y + h2 / 2 });
  });
  // knot: through the tags in date order; the axis below stays empty
  axis.setAttribute('d', (() => { const L = 80 + 1280 * tw(t, 22.5, 22.95, 'power2.inOut'); let d = `M80 950 L ${L} 950`; for (let x = 120; x <= L; x += 100) d += ` M${x} 942 L ${x} 958`; return d; })());
  axis.style.opacity = t >= 22.5 ? 0.5 * (1 - seg(t, 24.43, 24.55)) : 0;
  if (t >= 22.7) {
    const pts = [];
    for (let i = 0; i < tagPts.length - 1; i++) {
      const p = tagPts[i], q = tagPts[i + 1];
      for (let s = 0; s < 20; s++) {
        const u = s / 20, c1 = { x: p.x + 140, y: p.y - 120 }, c2 = { x: q.x - 160, y: q.y + 140 }, m = 1 - u;
        pts.push({ x: m * m * m * p.x + 3 * m * m * u * c1.x + 3 * m * u * u * c2.x + u * u * u * q.x, y: m * m * m * p.y + 3 * m * m * u * c1.y + 3 * m * u * u * c2.y + u * u * u * q.y });
      }
    }
    pts.push(tagPts.at(-1));
    const vis = Math.max(2, Math.round(pts.length * tw(t, 22.75, 23.45, 'power1.inOut')));
    const taut = tw(t, 24.43, 24.64, 'power3.inOut');
    const shown = pts.slice(0, vis).map((p, i) => ({ x: lerp(p.x, lerp(WIN_X0, WIN_X1, i / (pts.length - 1)), taut), y: lerp(p.y, KNOT_TARGET_Y, taut) }));
    knot.setAttribute('points', ptsAttr(shown));
    knot.style.opacity = 1;
    knot.setAttribute('stroke', taut > 0.5 ? CLAY : '#2b2522'); knot.setAttribute('stroke-width', lerp(1.7, 2.4, taut));
    knot.parentNode !== (taut > 0 ? clayL : pencilL) && (taut > 0 ? clayL : pencilL).appendChild(knot);
  } else { knot.setAttribute('points', ''); }

  /* ---- exit pose: a blank window opens under the straightened line ---- */
  const wu = tw(t, 24.58, 24.78, 'expo.out');
  winEl.style.opacity = t >= 24.58 ? 1 : 0; winEl.style.height = `${650 * wu}px`;

  renderer.render(scene, camera);
}

/* ------------------------------------------------------------- timeline */
const clock = { t: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(clock, { t: DUR, duration: DUR, ease: 'none', onUpdate: () => renderAt(clock.t) }, 0);
renderAt(0);
window.__lvPilot = { renderAt, exitPose: { line: { y: KNOT_TARGET_Y, x0: WIN_X0, x1: WIN_X1, color: CLAY }, window: { x: WIN_X0, y: KNOT_TARGET_Y, w: WIN_X1 - WIN_X0, h: 650, radius: 18 } } };
// Registered inline in index.html (the HyperFrames static contract), after this module finishes building.
export const timeline = tl;
export const compositionId = ID;

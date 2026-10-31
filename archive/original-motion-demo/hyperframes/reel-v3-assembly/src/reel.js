/* LawVriksh reel v3 — the assembly's motion and captions (reel-v3-plan.md §3, §6).
 * Pure function of time. Shots come from edl.json (cuts anchored to words); the clips inside them are
 * placed by the HTML. Here: which shot is live, its settle (a 3.5 % ease-in on every cut, the
 * reference's energy) or its punch (FACE: a slow push), and the word-by-word captions.
 *
 * Captions: the exact Hinglish script, 1–3 words at a time, the spoken word in a clay pill.
 * Placement follows her: over her panel's top in SPLIT, over the chest in FACE, lower third elsewhere.
 */
const EDL = await (await fetch('./edl.json')).json();
const gsap = window.gsap;
const EZ = (n) => gsap.parseEase(n);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
await document.fonts.load('800 66px "Figtree"');

const shots = EDL.shots.map((s) => ({ ...s, el: document.getElementById(`shot-${s.i}`), parts: [...document.querySelectorAll(`#shot-${s.i} > .full, #shot-${s.i} > .top`)], pan: document.querySelector(`#shot-${s.i} .pan`) }));
const shotAt = (t) => { const f = Math.round(t * 30); return shots.find((s) => f >= s.f0 && f < s.f1) ?? shots.at(-1); }; // by frame: no rounding gaps

/* caption groups: ≤ 3 words and ≤ 18 letters; a new group after a pause, a sentence end or a cut */
const clean = (w) => w.replace(/[.,]+$/, '');
const groups = [];
let g = null;
EDL.words.forEach((w, i) => {
  const prev = EDL.words[i - 1];
  const len = g ? g.words.reduce((n, x) => n + clean(x.w).length, 0) + clean(w.w).length : 0;
  const cut = prev && shotAt(prev.s) !== shotAt(w.s);
  if (!g || g.words.length >= 3 || len > 18 || w.s - prev.e > 0.25 || /[.?!,]$/.test(prev.w) || cut) { g = { words: [], start: w.s }; groups.push(g); }
  g.words.push(w);
});
// a caption never runs on into the next shot (the brand card stays clean)
groups.forEach((x, i) => { const next = groups[i + 1]; x.end = Math.min(next ? Math.min(next.start, x.words.at(-1).e + 0.45) : x.words.at(-1).e + 0.5, shotAt(x.words.at(-1).s).t1); });
const caps = document.getElementById('caps');
groups.forEach((x) => {
  x.el = document.createElement('div'); x.el.className = 'cap';
  x.el.innerHTML = x.words.map((w) => `<span>${clean(w.w)}</span>`).join(' ');
  caps.appendChild(x.el); x.spans = [...x.el.children];
});
const CAP_Y = { FACE: 1300, SPLIT: 1040, GRAPHIC: 1300, BROLL: 1300 }; // top of the caption block

function render(t) {
  const cur = shotAt(t);
  shots.forEach((s) => { s.el.style.display = s === cur ? 'block' : 'none'; });
  // every cut lands with a short settle; full-screen faces push in slowly instead
  const k = EZ('power2.out')(seg(t, cur.t0, cur.t0 + 0.3));
  if (cur.mode === 'FACE') {
    const [a, b] = cur.punch ?? [1, 1.04], u = EZ('sine.inOut')(seg(t, cur.t0, cur.t1));
    cur.parts.forEach((p) => { p.style.transformOrigin = '540px 880px'; p.style.transform = `scale(${(a + (b - a) * u).toFixed(4)})`; });
  } else {
    cur.parts.forEach((p) => { p.style.transform = `scale(${(1.035 - 0.035 * k).toFixed(4)})`; });
    if (cur.pan) cur.pan.style.transform = `scale(${(1.03 - 0.03 * k).toFixed(4)})`;
  }
  // captions
  groups.forEach((x) => {
    const on = t >= x.start && t < x.end;
    x.el.style.display = on ? 'block' : 'none';
    if (!on) return;
    const s = shotAt(x.start);
    x.el.style.top = `${CAP_Y[s.mode]}px`;
    const p = EZ('back.out(2)')(seg(t, x.start, x.start + 0.12));
    x.el.style.transform = `scale(${(0.9 + 0.1 * p).toFixed(4)})`;
    x.el.style.opacity = seg(t, x.start, x.start + 0.06).toFixed(3);
    x.words.forEach((w, i) => { const nx = x.words[i + 1]; x.spans[i].classList.toggle('on', t >= w.s && (nx ? t < nx.s : true)); });
  });
}

const D = EDL.duration, clock = { t: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(clock, { t: D, duration: D, ease: 'none', onUpdate: () => render(clock.t) }, 0);
render(0);
export const timeline = tl;

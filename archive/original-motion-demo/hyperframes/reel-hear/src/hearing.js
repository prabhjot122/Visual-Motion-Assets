/* LawVriksh reel v3 — Hearing Prep, a motion graphic of its own (reel-v3-plan.md §4, shots 25–30).
 *
 * The app's Hearing Prep brief for the Arora matter, rebuilt at phone scale from the frontend
 * (src/features/hearing-prep; computed styles captured in motion-demo/screenshots/hearing/styles.json).
 * The brief moves the way the app moves: its "In this brief" contents jump between sections and the
 * sheet scrolls to each; every entrance lands on the word she says (strip.json → words).
 *   "…hearing preparation features"   01 Basic info: the title sets word by word, the facts of the listing cascade
 *   "previous records"                04 Relevant previous proceedings: both paragraphs, each with its order chip
 *   "important facts"                 07 Weak points: the critical discrepancy, both amounts marked
 *   "case developments … organize"    03 Case snapshot, then 05 the checklist: four items fly into their groups
 *   "jisse lawyers apne hearings"     02 Preparation verdict; "Needs Review" opens the review panel — the open
 *                                     item and the compliance result ("No confirmed compliance issues…")
 *   "arguments … prepare"             06 Main arguments with their support, then expected opposition and your answer
 * Nothing is accepted, ticked or signed off; the demo date keeps its presentation-only label.
 */
const gsap = window.gsap;
const EZ = (n) => gsap.parseEase(n);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const lerp = (a, b, u) => a + (b - a) * u;
const $ = (id) => document.getElementById(id);
await Promise.all(['500 60px "Figtree"', '700 60px "Figtree"', 'italic 500 100px "Newsreader"', '400 21px "Geist Mono"'].map((f) => document.fonts.load(f)));

const STRIP = await (await fetch('./strip.json')).json();
// W('aur', 2): the time (scene seconds) of her 2nd "aur" in this sentence
const W = (w, k = 1) => { const hits = STRIP.words.filter((x) => x.w.toLowerCase().replace(/[^a-z]/g, '') === w); return (hits[k - 1] ?? hits.at(-1)).t; };

/* source chips: the app's icons (court: gavel · document: file) */
const ICON = {
  COURT: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m14 13-7.5 7.5a2.1 2.1 0 0 1-3-3L11 10"/><path d="m16 16 6-6M8 8l6-6M9 7l8 8M21 11l-8-8"/></svg>',
  DOC: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
};
document.querySelectorAll('.chip').forEach((c) => { c.innerHTML = c.innerHTML.replace(/^(COURT|DOC) /, (_, k) => ICON[k]); });
// the title, word by word
$('title').innerHTML = $('title').textContent.split(' ').map((w) => `<span>${w}</span>`).join(' ');
const titleWords = [...$('title').children];
// the contents ticker
const SECTIONS = ['Basic info', 'Preparation verdict', 'Case snapshot', 'Relevant previous proceedings', 'Preparation checklist', 'Main arguments', 'Weak points', 'Questions to prepare for', 'Sources'];
$('ticker').innerHTML = SECTIONS.map((_, i) => `<span class="ti">${String(i + 1).padStart(2, '0')}</span>`).join('') + '<span class="lab" id="tlab"></span>';
const ticks = [...$('ticker').querySelectorAll('.ti')];
const top = (id) => $(id).offsetTop - 40;   // a section's scroll position (its top just under the ticker)

/* the states: when each starts, which section it scrolls to, which contents entry is active */
const ST = [
  { at: 0, sec: 'sec-01', n: 1, nudge: [W('preparation'), 60] },    // the listing's facts come up into view
  { at: W('previous') - 0.06, sec: 'sec-04', n: 4 },
  { at: W('important') - 0.06, sec: 'sec-07', n: 7 },
  { at: W('aur', 2) - 0.04, sec: 'sec-03', n: 3 },
  { at: W('organize') - 0.12, sec: 'sec-05', n: 5 },
  { at: W('jisse') - 0.04, sec: 'sec-02', n: 2 },
  { at: W('arguments') - 0.08, sec: 'sec-06', n: 6 },
];
ST.forEach((s) => { s.y = top(s.sec); s.h = $(s.sec).offsetHeight; });
const SECS = [...document.querySelectorAll('.sec')];
const VIEW = 1880 - 204;   // the window's height under the bar and the contents ticker
const stateAt = (T) => ST.reduce((cur, s) => (T >= s.at ? s : cur), ST[0]);

const show = (el, t0, T, { dx = 0, dy = 34, s = 1, d = 0.42, e = 'expo.out' } = {}) => {
  const u = EZ(e)(seg(T, t0, t0 + d));
  el.style.opacity = seg(T, t0, t0 + d * 0.5).toFixed(3);
  el.style.transform = `translate(${(dx * (1 - u)).toFixed(1)}px, ${(dy * (1 - u)).toFixed(1)}px) scale(${lerp(s, 1, u).toFixed(4)})`;
};
const pop = (el, t0, T) => show(el, t0, T, { dy: 0, s: 0.7, d: 0.36, e: 'back.out(2.2)' });
const checks = [...document.querySelectorAll('.check')];
const FLY = [[-260, 120, -9], [300, -80, 7], [-200, -150, 6], [240, 160, -8]]; // where each checklist item flies in from

function render(T, full) {
  /* the sheet scrolls to the active section, the way the contents rail jumps */
  const i = ST.indexOf(stateAt(T)), cur = ST[i], prev = ST[Math.max(0, i - 1)];
  // full screen: the active section sits mid-window; in the split it sits at the top (the reel shows the top 1000 px)
  const yOf = (s) => s.y - (full ? Math.max(0, (VIEW - 80 - s.h) / 2) : 0);
  const k = EZ('expo.inOut')(seg(T, cur.at, cur.at + 0.5));
  let y = lerp(yOf(prev), yOf(cur), k);
  // only the section in focus is drawn; the one before it fades as the sheet moves on
  SECS.forEach((el) => { el.style.opacity = el.id === cur.sec ? (prev === cur ? 1 : k).toFixed(3) : el.id === prev.sec && prev !== cur ? (1 - k).toFixed(3) : '0'; });
  if (cur.nudge) y += cur.nudge[1] * EZ('power2.inOut')(seg(T, cur.nudge[0], cur.nudge[0] + 0.7));
  $('sheet').style.transform = `translateY(${(-y).toFixed(1)}px)`;
  ticks.forEach((t, k) => t.classList.toggle('on', k === cur.n - 1));
  const tp = EZ('back.out(2.5)')(seg(T, cur.at, cur.at + 0.3));
  ticks[cur.n - 1].style.transform = `scale(${lerp(0.75, 1, tp).toFixed(3)})`;
  $('tlab').textContent = SECTIONS[cur.n - 1];
  $('tlab').style.opacity = seg(T, cur.at, cur.at + 0.2).toFixed(3);

  /* 01 basic info */
  show(document.querySelector('#sec-01 .eyebrow'), W('aur') - 0.1, T, { dy: 16 });
  titleWords.forEach((w, k) => show(w, W('upcoming') + k * 0.09, T, { dy: 60 }));
  show(document.querySelector('#sec-01 .row'), W('hearings'), T, { dy: 20 });
  pop($('attn'), W('hearing'), T);
  show(document.querySelector('#sec-01 .sub'), W('hearing') + 0.1, T, { dy: 14 });
  [...$('meta').children].forEach((m, k) => show(m, W('preparation') + k * 0.11, T, { dy: 26 }));
  show($('qual'), W('features'), T, { dy: 10 });
  pop($('count1'), W('features') + 0.2, T);

  /* 04 relevant previous proceedings */
  show($('pp1'), ST[1].at + 0.12, T); pop($('c-pp1'), W('records'), T);
  show($('pp2'), W('records') + 0.18, T); pop($('c-pp2'), W('records') + 0.45, T);

  /* 07 weak points: the discrepancy, both amounts marked */
  show($('weak'), ST[2].at + 0.06, T, { dx: -90, dy: 0 });
  $('u1').style.transform = `scaleX(${EZ('power2.inOut')(seg(T, W('facts') - 0.1, W('facts') + 0.25)).toFixed(3)})`;
  $('u2').style.transform = `scaleX(${EZ('power2.inOut')(seg(T, W('facts') + 0.25, W('facts') + 0.6)).toFixed(3)})`;

  /* 03 case snapshot, then 05 the checklist organizing itself */
  show($('stage'), ST[3].at + 0.1, T); pop($('c-stage'), ST[3].at + 0.32, T);
  show($('latest'), W('developments') - 0.05, T); pop($('c-latest'), W('developments') + 0.3, T);
  checks.forEach((c, k) => {
    const t0 = W('organize') + k * 0.17, u = EZ('expo.out')(seg(T, t0, t0 + 0.55)), [fx, fy, fr] = FLY[k];
    c.style.opacity = seg(T, t0, t0 + 0.15).toFixed(3);
    c.style.transform = `translate(${(fx * (1 - u)).toFixed(1)}px, ${(fy * (1 - u)).toFixed(1)}px) rotate(${(fr * (1 - u)).toFixed(2)}deg)`;
  });
  show($('prog'), W('help'), T, { dy: 12 });

  /* 02 the verdict; "Needs Review" opens the review panel with the compliance result */
  show($('verdict'), ST[5].at + 0.05, T, { dy: 50 });
  document.querySelectorAll('.stat').forEach((s, k) => pop(s, W('lawyers') + k * 0.12, T));
  const press = seg(T, W('apne') - 0.25, W('apne') - 0.05);
  $('needs').style.transform = `scale(${(1 - 0.08 * Math.sin(Math.PI * press)).toFixed(4)})`;
  $('needs').style.background = press > 0 && press < 1 ? '#fbeeec' : '#fff';
  const open = EZ('expo.out')(seg(T, W('apne'), W('apne') + 0.5)) * (1 - EZ('expo.in')(seg(T, ST[6].at, ST[6].at + 0.35)));
  $('panel').style.transform = `translateX(${(800 * (1 - open)).toFixed(1)}px)`;
  $('panel').style.display = open > 0.001 ? '' : 'none';
  document.querySelectorAll('.tile').forEach((t, k) => pop(t, W('apne') + 0.3 + k * 0.1, T));
  show($('p-item'), W('hearings', 2), T, { dy: 24 });
  show($('compl'), W('aur', 3), T, { dy: 24 });

  /* 06 main arguments, then the opposition and your answer */
  show($('arg1'), ST[6].at + 0.12, T, { dy: 60 }); pop($('tag1'), W('better'), T);
  show($('arg2'), W('way'), T, { dy: 60 }); pop($('tag2'), W('way') + 0.3, T);
  show($('opp1'), W('prepare'), T, { dx: -120, dy: 0 }); show($('opp2'), W('prepare') + 0.2, T, { dx: 120, dy: 0 });
}

/* render strip: one segment per shot, scene time running with the reel (see reel-v3/build_shots.py) */
function renderFrame(f) {
  const s = STRIP.segments.find((g) => f >= g.f0 && f < g.f0 + g.frames) ?? STRIP.segments.at(-1);
  render(lerp(s.reel[0], s.reel[1], Math.min(1, (f - s.f0) / Math.max(1, s.frames - 1))), s.box[3] === 1920);
}
const N = STRIP.frames, clock = { f: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(clock, { f: N, duration: N / 30, ease: 'none', onUpdate: () => renderFrame(Math.min(N - 1, Math.floor(clock.f + 1e-6))) }, 0);
renderFrame(0);
export const timeline = tl;

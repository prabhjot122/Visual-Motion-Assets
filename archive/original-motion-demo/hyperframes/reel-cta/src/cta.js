/* LawVriksh reel v3 — the CTA cards (shots 36–37; reel-v3-plan.md §4). Rendered as one strip through
 * reel-v3/scenes/cta/strip.json: scene time T runs 0–2.9 (search) and 3.0–6.2 (comment → DM).
 * Generic UI only: no third-party logos, no invented URL, no tagline under the brand.
 *   T 0.00  "Search on Google" label; the search pill rises in
 *   T 0.35–1.25  "LawVriksh" types, one key per letter (the cue sheet places a keystroke on each)
 *   T 1.45  enter: the pill presses; T 1.60 the result card rises with the mark and wordmark
 *   T 3.00  the comment card rises; T 3.35–3.75 "LAW" types; T 4.40 the DM bubble arrives
 */
const gsap = window.gsap;
const EZ = (n) => gsap.parseEase(n);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const $ = (id) => document.getElementById(id);
await Promise.all(['500 56px "Newsreader"', 'italic 500 56px "Newsreader"', '800 64px "Figtree"', '600 30px "Figtree"'].map((f) => document.fonts.load(f)));

export const KEYS_A = [0.35, 0.45, 0.55, 0.66, 0.76, 0.86, 0.97, 1.08, 1.18]; // L a w V r i k s h
export const KEYS_B = [3.35, 3.5, 3.65];
const WORD = 'LawVriksh';
const rise = (el, t, a, d = 40, e = 'expo.out') => { const u = EZ(e)(seg(t, a, a + 0.45)); el.style.opacity = seg(t, a, a + 0.2).toFixed(3); el.style.transform = `translateY(${(d * (1 - u)).toFixed(1)}px)`; return u; };

function renderCTA(T) {
  const A = T < 2.95, B = !A;
  $('partA').style.display = A ? '' : 'none'; $('partB').style.display = B ? '' : 'none';
  if (A) {
    rise($('labelA'), T, 0.0, 20);
    const pin = EZ('back.out(1.4)')(seg(T, 0.0, 0.4));
    const press = 1 - 0.035 * Math.sin(Math.PI * seg(T, 1.45, 1.6));
    $('pill').style.opacity = seg(T, 0, 0.15).toFixed(3); $('pill').style.transform = `translateY(${(50 * (1 - pin)).toFixed(1)}px) scale(${press.toFixed(4)})`;
    const n = KEYS_A.filter((k) => T >= k).length;
    const typed = WORD.slice(0, n);
    $('typed').innerHTML = typed.length > 3 ? `Law<i>${typed.slice(3)}</i>` : typed;
    $('typed').style.transform = $('pill').style.transform;
    const w = $('typed').getBoundingClientRect().width;
    const blink = T > 1.25 && Math.floor((T - 1.25) / 0.27) % 2 === 1;
    Object.assign($('caret').style, { left: `${220 + w}px`, opacity: T < 0.3 || blink || T > 1.5 ? 0 : 1 });
    rise($('result'), T, 1.6, 80);
  } else {
    rise($('labelB'), T, 3.0, 20);
    const cu = EZ('back.out(1.3)')(seg(T, 3.0, 3.4));
    $('comment').style.opacity = seg(T, 3.0, 3.15).toFixed(3); $('comment').style.transform = `translateY(${(60 * (1 - cu)).toFixed(1)}px)`;
    const n = KEYS_B.filter((k) => T >= k).length;
    $('law').textContent = 'LAW'.slice(0, n);
    $('law').style.transform = `scale(${(1 + 0.12 * Math.sin(Math.PI * seg(T, 3.65, 3.85))).toFixed(4)})`;
    const du = EZ('back.out(1.2)')(seg(T, 4.4, 4.85));
    $('dm').style.opacity = seg(T, 4.4, 4.55).toFixed(3); $('dm').style.transform = `translate(${(140 * (1 - du)).toFixed(1)}px, ${(30 * (1 - du)).toFixed(1)}px)`;
  }
}

/* render strip: one segment per shot (see reel-v3/build_shots.py) */
const res = await fetch('./strip.json'); const STRIP = await res.json();
const lerp = (a, b, u) => a + (b - a) * u;
function renderFrame(f) {
  const s = STRIP.segments.find((g) => f >= g.f0 && f < g.f0 + g.frames) ?? STRIP.segments.at(-1);
  // full screen (GRAPHIC): the cards sit mid-frame; in the split they sit in the top panel
  const off = s.box[3] === 1920 ? 430 : 0;
  $('partA').style.top = $('partB').style.top = `${off}px`;
  renderCTA(lerp(s.reel[0], s.reel[1], Math.min(1, (f - s.f0) / Math.max(1, s.frames - 1))));
}
const N = STRIP.frames, clock = { f: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(clock, { f: N, duration: N / 30, ease: 'none', onUpdate: () => renderFrame(Math.min(N - 1, Math.floor(clock.f + 1e-6))) }, 0);
renderFrame(0);
export const timeline = tl;

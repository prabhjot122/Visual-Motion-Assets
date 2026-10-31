/* LawVriksh web cut — the explanatory-text system (web-cut/web-cut-plan.md §2).
 *
 * Pure function of web time, like every section's renderAt. Three devices, from the
 * Lovio reference:
 *   card → dock  a sentence arrives big and alone on paper (the film behind it blurs),
 *                holds for reading, then shrinks into the top-left corner while the
 *                film sharpens and plays beside it
 *   swap         inside the dock, the line changes with the beat
 *   split        a question assembles centred, then its two halves part sideways
 * plus an optional chapter rail along the bottom.
 *
 * Copied into each web project's assets by its prepare-assets.mjs; edit it here.
 */
const gsap = window.gsap;
const EZ = (name) => gsap.parseEase(name);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const tw = (t, a, b, e = 'power2.inOut') => EZ(e)(seg(t, a, b));

const CSS = `
.cap-layer { position: absolute; left: 0; top: 0; width: 1440px; height: 1000px; pointer-events: none; overflow: hidden; }
.cap-veil { position: absolute; inset: 0; background: rgba(239, 235, 227, 0.62); opacity: 0; }
.cap-wash { position: absolute; left: -220px; top: -280px; width: 1320px; height: 740px; background: radial-gradient(closest-side, rgba(245,241,234,0.97) 0%, rgba(245,241,234,0.88) 46%, rgba(245,241,234,0) 100%); opacity: 0; }
.cap-kicker { position: absolute; left: 0; top: 0; transform-origin: 0 0; white-space: nowrap; font-family: 'Figtree', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #c94820; }
.cap-line { position: absolute; left: 0; top: 0; transform-origin: 0 0; white-space: nowrap; font-family: 'Newsreader', serif; font-weight: 400; font-size: 104px; line-height: 1.02; letter-spacing: -0.032em; color: #1c1714; }
.cap-line em, .cap-split em { font-style: italic; color: #a93a18; }
.cap-line span, .cap-split span { display: inline-block; white-space: pre; }
.cap-sub { position: absolute; left: 0; top: 0; transform-origin: 0 0; width: 820px; font-family: 'Figtree', sans-serif; font-size: 24px; line-height: 1.45; color: #5d554d; }
.cap-split { position: absolute; left: 0; top: 0; white-space: nowrap; font-family: 'Newsreader', serif; font-size: 84px; line-height: 1; letter-spacing: -0.03em; color: #1c1714; }
.cap-split > b { display: inline-block; font-weight: 400; }
.cap-rail { position: absolute; left: 64px; bottom: 34px; display: flex; gap: 20px; align-items: center; font-family: 'Figtree', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #6f675f; white-space: nowrap; }
.cap-rail span.on { color: #1c1714; }
.cap-rail span.on::before { content: ''; display: inline-block; width: 18px; height: 2px; margin: 0 8px 3px 0; background: #c94820; vertical-align: middle; }
`;

/* Wrap words in spans (tags such as <em> and <br> kept), so each can enter on its own. */
function wordSpans(html) {
  const tpl = document.createElement('template'); tpl.innerHTML = html;
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
          else { const s = document.createElement('span'); s.textContent = part; frag.appendChild(s); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  };
  walk(tpl.content);
  return tpl.innerHTML;
}

const DOCK = { x: 64, kickerY: 54, lineY: 80, scale: 0.5, kickerScale: 13 / 14, subScale: 17 / 24 };
const DOCK_DUR = 0.55, CARD_IN = 0.55, SWAP_IN = 0.4, SWAP_OUT = 0.25, OUT = 0.32;

/**
 * chapters: [{ kicker, in, dock, out, card = true, phrases: [{ html, sub?, at? }] }]
 *   the first phrase arrives at `in` (as a card when card is true, else straight into the dock);
 *   the card starts docking at `dock`; later phrases swap in at their `at`; all leave at `out`.
 * splits: [{ left, right, in, part, out }]
 * rail: { items: [...], current: index, show: [[from, to], ...] } or null
 * Returns render(t) → { focus } where focus (0–1) is how much a card holds the frame
 * (the host blurs its film by it).
 */
export function mountCaptions(host, { chapters = [], splits = [], rail = null } = {}) {
  const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
  const layer = document.createElement('div'); layer.className = 'cap-layer'; host.appendChild(layer);
  const veil = document.createElement('div'); veil.className = 'cap-veil'; layer.appendChild(veil);
  const wash = document.createElement('div'); wash.className = 'cap-wash'; layer.appendChild(wash);
  const add = (cls, html) => { const e = document.createElement('div'); e.className = cls; e.innerHTML = html; layer.appendChild(e); return e; };

  const CH = chapters.map((c) => {
    const card = c.card !== false;
    const kicker = c.kicker ? add('cap-kicker', c.kicker) : null;
    const phrases = c.phrases.map((p, i) => {
      const line = add('cap-line', wordSpans(p.html));
      const sub = p.sub ? add('cap-sub', p.sub) : null;
      return { ...p, at: i === 0 ? c.in : p.at, line, sub, words: [...line.querySelectorAll('span')] };
    });
    phrases.forEach((p, i) => { p.until = i + 1 < phrases.length ? phrases[i + 1].at : c.out; });
    // card geometry from the first phrase (laid out at 104 px)
    const p0 = phrases[0];
    const w = p0.line.offsetWidth, h = p0.line.offsetHeight;
    if (p0.sub) { p0.sub.style.width = `${Math.min(820, Math.max(420, w))}px`; }
    const subH = p0.sub ? p0.sub.offsetHeight : 0, subW = p0.sub ? p0.sub.offsetWidth : 0;
    const blockW = Math.max(w, subW), kH = kicker ? 40 : 0, total = kH + h + (p0.sub ? 30 + subH : 0);
    const left = (1440 - blockW) / 2, top = 500 - total / 2;
    const geo = { left, kickerY: top, lineY: top + kH, subY: top + kH + h + 30 };
    phrases.forEach((p) => { if (p.sub) p.sub.style.width = `${Math.min(820, Math.max(420, w))}px`; p.h = p.line.offsetHeight; });
    return { ...c, card, kicker, phrases, geo };
  });

  const SP = splits.map((s) => {
    const el = add('cap-split', `<b>${wordSpans(s.left)}</b><b style="width:28px"></b><b>${wordSpans(s.right)}</b>`);
    const [l, , r] = el.children; const w = el.offsetWidth;
    el.style.left = `${(1440 - w) / 2}px`; el.style.top = `${s.y ?? 470}px`;
    return { ...s, el, l, r, words: [...el.querySelectorAll('span')] };
  });

  let railEl = null;
  if (rail) {
    railEl = document.createElement('div'); railEl.className = 'cap-rail';
    railEl.innerHTML = rail.items.map((n, i) => `<span class="${i === rail.current ? 'on' : ''}">${n}</span>`).join('');
    layer.appendChild(railEl);
  }

  const enterWords = (words, t, t0, dist, blur, stagger, dur) => words.forEach((s, i) => {
    const a = t0 + i * stagger, u = tw(t, a, a + dur, 'expo.out');
    s.style.opacity = seg(t, a, a + dur * 0.6).toFixed(3);
    s.style.transform = `translateY(${(dist * (1 - u)).toFixed(2)}px)`;
    s.style.filter = u < 0.999 ? `blur(${(blur * (1 - u)).toFixed(2)}px)` : 'none';
  });
  const place = (el, x, y, s, op = 1, blur = 0) => {
    el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(4)})`;
    el.style.opacity = op.toFixed(3); el.style.filter = blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : 'none';
    el.style.display = op > 0.001 ? '' : 'none';
  };

  return function render(t) {
    let focus = 0, docked = 0;
    for (const c of CH) {
      const live = t >= c.in && t < c.out + OUT;
      const leave = tw(t, c.out, c.out + OUT, 'power2.in');
      const d = c.card ? tw(t, c.dock, c.dock + DOCK_DUR, 'power3.inOut') : 1;
      if (live && c.card) focus = Math.max(focus, seg(t, c.in, c.in + 0.35) * (1 - d));
      if (live) docked = Math.max(docked, (c.card ? seg(t, c.dock + 0.2, c.dock + DOCK_DUR) : seg(t, c.in, c.in + 0.3)) * (1 - leave));
      if (c.kicker) {
        const kin = seg(t, c.in, c.in + 0.3);
        place(c.kicker, lerp(c.geo.left, DOCK.x, d), lerp(c.geo.kickerY, DOCK.kickerY, d) - 12 * leave, lerp(1, DOCK.kickerScale, d), live ? kin * (1 - leave) : 0);
      }
      c.phrases.forEach((p, i) => {
        const on = live && t >= p.at && t < p.until + SWAP_OUT;
        if (!on) { p.line.style.display = 'none'; if (p.sub) p.sub.style.display = 'none'; return; }
        const first = i === 0 && c.card;
        const dd = first ? d : 1;
        const out = i < c.phrases.length - 1 ? tw(t, p.until, p.until + SWAP_OUT, 'power2.in') : leave;
        const x = lerp(c.geo.left, DOCK.x, dd), y = lerp(c.geo.lineY, DOCK.lineY, dd) - 18 * out;
        place(p.line, x, y, lerp(1, DOCK.scale, dd), 1 - out, 6 * out);
        if (first) enterWords(p.words, t, c.in, 24, 8, 0.06, CARD_IN);
        else enterWords(p.words, t, p.at, 36, 10, 0.04, SWAP_IN);
        if (p.sub) {
          const lineH = p.h * DOCK.scale;
          const sx = lerp(c.geo.left, DOCK.x, dd), sy = lerp(c.geo.subY, DOCK.lineY + lineH + 14, dd) - 18 * out;
          const sin = seg(t, (first ? c.in + 0.35 : p.at + 0.15), (first ? c.in + 0.75 : p.at + 0.5));
          place(p.sub, sx, sy, lerp(1, DOCK.subScale, dd), sin * (1 - out), 6 * out);
        }
      });
    }
    for (const s of SP) {
      const on = t >= s.in && t < s.out;
      s.el.style.display = on ? '' : 'none';
      if (!on) continue;
      enterWords(s.words, t, s.in, 24, 8, 0.06, CARD_IN);
      const p = tw(t, s.part, s.out, 'power3.in');
      s.l.style.transform = `translateX(${(-760 * p).toFixed(1)}px)`; s.r.style.transform = `translateX(${(760 * p).toFixed(1)}px)`;
      s.l.style.filter = s.r.style.filter = p > 0.01 ? `blur(${(10 * p).toFixed(2)}px)` : 'none';
      s.el.style.opacity = (1 - seg(t, s.part + (s.out - s.part) * 0.5, s.out)).toFixed(3);
      focus = Math.max(focus, seg(t, s.in, s.in + 0.35) * (1 - tw(t, s.part, s.part + 0.4, 'power2.inOut')));
    }
    veil.style.opacity = focus.toFixed(3);
    wash.style.opacity = docked.toFixed(3);
    if (railEl) {
      const vis = rail.show.some(([a, b]) => t >= a && t < b) ? 1 : 0;
      const fade = rail.show.reduce((m, [a, b]) => Math.max(m, seg(t, a, a + 0.3) * (1 - seg(t, b - 0.3, b))), 0);
      railEl.style.opacity = (vis * fade).toFixed(3);
    }
    return { focus };
  };
}

/** Piecewise-linear web → reel time map. keys: [[web, reel], ...] ascending; flat runs are holds. */
export function timeMap(keys) {
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [w1, r1] = keys[i], [w0, r0] = keys[i - 1];
      if (t <= w1) return w1 === w0 ? r1 : r0 + (r1 - r0) * ((t - w0) / (w1 - w0));
    }
    return keys.at(-1)[1];
  };
}

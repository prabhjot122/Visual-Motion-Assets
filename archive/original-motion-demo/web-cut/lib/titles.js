/* LawVriksh web cut — text system, revision 3 (web-cut/web-cut-plan.md §2).
 *
 * After the user's references (Stephan Livera's "Claude, motion designer" reel, Sarvam's
 * "Saaras V4", Google's "AI Mode"), kept professional (user, 22 Oct):
 *   - whole sentences, large and readable, animated word by word (never one word with a caption)
 *   - serif only (Newsreader); the key words in clay italic
 *   - calm paper grounds only (paper, vellum); no full-screen clay or black
 * Devices:
 *   title    a full-bleed paper ground cut in hard; a sentence of one or two lines arrives word by
 *            word (each word slides in with a short blur and a gentle overshoot); a later sentence
 *            can take its place in the same spot (the old words lift away). Optional field of a
 *            repeated italic word rippling faintly behind. Exits on a hard cut, or SPLITS: the
 *            ground parts sideways and the film shows through the gap.
 *   ticker   inside a visual, top-left: a short sentence that hands over to the next with the beat.
 *   hud      a viewfinder over everything: corner brackets, chapter label and chapter index,
 *            in small tracked serif caps.
 * Pure function of web time. Copied into each web project's assets by prepare-assets.mjs.
 */
const gsap = window.gsap;
const EZ = (name) => gsap.parseEase(name);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const tw = (t, a, b, e = 'power2.inOut') => EZ(e)(seg(t, a, b));
const SVGNS = 'http://www.w3.org/2000/svg';

export const PALETTE = {
  paper: { bg: '#efebe3', ink: '#1c1714' },
  vellum: { bg: '#e6dfd1', ink: '#1c1714' },
};

const CSS = `
.tt-layer { position: absolute; left: 0; top: 0; width: 1440px; height: 1000px; pointer-events: none; overflow: hidden; }
.tt-card { position: absolute; inset: 0; overflow: hidden; background-image: url(assets/textures/paper.jpg); background-size: cover; background-position: center; background-blend-mode: multiply; }
.tt-field { position: absolute; left: -200px; top: 0; width: 1840px; height: 1000px; }
.tt-field div { position: absolute; left: 0; white-space: nowrap; font-family: 'Newsreader', serif; font-style: italic; font-weight: 300; font-size: 78px; letter-spacing: -0.01em; }
.tt-sent { position: absolute; left: 0; top: 0; width: 1440px; text-align: center; font-family: 'Newsreader', serif; font-weight: 500; line-height: 1.04; letter-spacing: -0.03em; color: #1c1714; }
.tt-sent em, .tk-sent em { font-style: italic; color: #a93a18; }
.tt-sent span, .tk-sent span { display: inline-block; white-space: pre; }
.tk { position: absolute; left: 64px; top: 62px; }
.tk-wash { position: absolute; left: -260px; top: -300px; width: 1240px; height: 660px; background: radial-gradient(closest-side, rgba(245,241,234,0.95) 0%, rgba(245,241,234,0.85) 50%, rgba(245,241,234,0) 100%); }
.tk-sent { position: absolute; left: 0; top: 0; white-space: nowrap; font-family: 'Newsreader', serif; font-weight: 500; font-size: 50px; line-height: 1.08; letter-spacing: -0.025em; color: #1c1714; }
.hud { position: absolute; inset: 0; font-family: 'Newsreader', serif; font-size: 12px; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; }
.hud svg { position: absolute; left: 0; top: 0; }
.hud .tl { position: absolute; left: 34px; top: 24px; white-space: nowrap; }
.hud .bl { position: absolute; left: 34px; bottom: 22px; white-space: nowrap; display: flex; gap: 14px; }
.hud .bl b { font-weight: 500; opacity: 0.4; }
.hud .bl b.on { opacity: 1; }
.hud .br { position: absolute; right: 34px; bottom: 22px; white-space: nowrap; }
`;

/* Wrap words in spans (keeping <em> and <br>), so each word can enter on its own. */
function wordSpans(html) {
  const tpl = document.createElement('template'); tpl.innerHTML = html;
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(' '));
          else { const s = document.createElement('span'); s.textContent = part; frag.appendChild(s); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  };
  walk(tpl.content);
  return tpl.innerHTML;
}

/* A sentence's words: in one after another (slide, short blur, gentle overshoot); out lifting away. */
function animateWords(words, t, tin, tout, from, { stagger = 0.075, dur = 0.5, dist = 70 } = {}) {
  words.forEach((s, i) => {
    const a = tin + i * stagger, u = EZ('back.out(1.2)')(seg(t, a, a + dur)), v = seg(t, a, a + 0.18);
    const o = tout == null ? 0 : tw(t, tout + i * 0.02, tout + 0.3 + i * 0.02, 'power2.in');
    s.style.opacity = (v * (1 - o)).toFixed(3);
    s.style.transform = `translate(${(from * dist * (1 - u)).toFixed(1)}px, ${(-26 * o).toFixed(1)}px)`;
    const b = 10 * (1 - tw(t, a, a + dur * 0.8, 'expo.out')) + 8 * o;
    s.style.filter = b > 0.05 ? `blur(${b.toFixed(2)}px)` : 'none';
  });
}

/**
 * titles: [{ at, end, bg: 'paper' | 'vellum', phrases: [{ html, at? }], field?, exit?: 'cut' | 'split', from?: 1 | -1, size? }]
 *   the first phrase arrives at `at`; a later phrase replaces the one before it at its own `at`.
 * tickers: [{ at, end, beats: [{ at, html }] }]
 * hud: { chapters: [names], chapter: (t) => ({ num, name, case? }), start? }
 * render(t, { dark }) → { card }  (true while a full-bleed title covers the film)
 */
export function mountTitles(host, { titles = [], tickers = [], hud = null } = {}) {
  const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
  const layer = document.createElement('div'); layer.className = 'tt-layer'; host.appendChild(layer);

  const buildCard = (c) => {
    const P = PALETTE[c.bg];
    const card = document.createElement('div'); card.className = 'tt-card'; card.style.backgroundColor = P.bg;
    let rows = [];
    if (c.field) {
      const f = document.createElement('div'); f.className = 'tt-field'; f.style.color = P.ink; card.appendChild(f);
      rows = Array.from({ length: 11 }, (_, i) => { const r = document.createElement('div'); r.style.top = `${-10 + i * 92}px`; r.textContent = Array(14).fill(c.field).join('   '); f.appendChild(r); return r; });
    }
    const sents = c.phrases.map((p) => { const e = document.createElement('div'); e.className = 'tt-sent'; e.innerHTML = wordSpans(p.html); card.appendChild(e); return e; });
    layer.appendChild(card);
    return { card, rows, sents, words: [] };
  };

  const T = titles.map((c) => {
    const copies = c.exit === 'split' ? [buildCard(c), buildCard(c)] : [buildCard(c)];
    const phrases = c.phrases.map((p, i) => ({ ...p, at: i === 0 ? c.at : p.at }));
    phrases.forEach((p, i) => { p.until = i + 1 < phrases.length ? phrases[i + 1].at : null; });
    // size each sentence to the frame: up to 1180 px wide, at most `size` px type (default 124)
    copies.forEach((k, ci) => {
      k.sents.forEach((e, pi) => {
        e.style.fontSize = '100px'; e.style.width = 'auto';
        const w100 = e.offsetWidth;
        const fs = Math.min(c.size ?? 124, 1180 / w100 * 100);
        e.style.fontSize = `${fs}px`; e.style.width = '1440px';
        e.style.top = `${(1000 - e.offsetHeight) / 2 - 8}px`;
        k.words[pi] = [...e.querySelectorAll('span')];
      });
      if (copies.length === 2) k.card.style.clipPath = ci === 0 ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)';
    });
    return { ...c, copies, phrases, from: c.from ?? 1 };
  });

  const TK = tickers.map((k) => {
    const el = document.createElement('div'); el.className = 'tk'; layer.appendChild(el);
    const wash = document.createElement('div'); wash.className = 'tk-wash'; el.appendChild(wash);
    const beats = k.beats.map((b, i) => {
      const e = document.createElement('div'); e.className = 'tk-sent'; e.innerHTML = wordSpans(b.html); el.appendChild(e);
      return { ...b, e, words: [...e.querySelectorAll('span')], until: i + 1 < k.beats.length ? k.beats[i + 1].at : k.end };
    });
    return { ...k, el, wash, beats };
  });

  let H = null;
  if (hud) {
    const el = document.createElement('div'); el.className = 'hud'; layer.appendChild(el);
    const svg = document.createElementNS(SVGNS, 'svg'); svg.setAttribute('width', 1440); svg.setAttribute('height', 1000); el.appendChild(svg);
    const p = document.createElementNS(SVGNS, 'path'); p.setAttribute('fill', 'none'); p.setAttribute('stroke-width', '1.5');
    const I = 22, L = 28;
    p.setAttribute('d', `M${I} ${I + L}V${I}H${I + L}M${1440 - I - L} ${I}H${1440 - I}V${I + L}M${1440 - I} ${1000 - I - L}V${1000 - I}H${1440 - I - L}M${I + L} ${1000 - I}H${I}V${1000 - I - L}`);
    svg.appendChild(p);
    const tl = document.createElement('div'); tl.className = 'tl'; el.appendChild(tl);
    const bl = document.createElement('div'); bl.className = 'bl'; el.appendChild(bl);
    bl.innerHTML = hud.chapters.map((n, i) => `<b>${String(i).padStart(2, '0')}</b>`).join('');
    const br = document.createElement('div'); br.className = 'br'; el.appendChild(br);
    H = { el, p, tl, br, ticks: [...bl.children] };
  }

  return function render(t, { dark = false } = {}) {
    let card = false;
    for (const c of T) {
      const on = t >= c.at && t < c.end;
      c.copies.forEach((k) => { k.card.style.display = on ? '' : 'none'; });
      if (!on) continue;
      const split = c.exit === 'split' ? tw(t, c.end - 0.5, c.end, 'power3.in') : 0;
      if (split < 0.02) card = true;
      c.copies.forEach((k, i) => {
        if (c.exit === 'split') k.card.style.transform = `translateX(${(i === 0 ? -1 : 1) * 760 * split}px)`;
        c.phrases.forEach((p, pi) => {
          const live = t >= p.at && (p.until == null || t < p.until + 0.5);
          k.sents[pi].style.display = live ? '' : 'none';
          if (live) animateWords(k.words[pi], t, p.at + (pi === 0 ? 0.08 : 0.25), p.until, pi % 2 ? -c.from : c.from);
        });
        k.rows.forEach((r, j) => {
          r.style.transform = `translateX(${((j % 2 ? -1 : 1) * 60 * (t - c.at) - (j % 2) * 120).toFixed(1)}px)`;
          r.style.opacity = (seg(t, c.at, c.at + 0.4) * (0.025 + 0.035 * (0.5 + 0.5 * Math.sin((t - c.at) * 4 - j * 0.7)))).toFixed(3);
        });
      });
    }
    for (const k of TK) {
      const on = !card && t >= k.at && t < k.end + 0.4; // a title always clears the ticker
      k.el.style.display = on ? '' : 'none';
      if (!on) continue;
      k.wash.style.opacity = (seg(t, k.at, k.at + 0.3) * (1 - seg(t, k.end, k.end + 0.4))).toFixed(3);
      k.beats.forEach((b) => {
        const live = t >= b.at && t < b.until + 0.4;
        b.e.style.display = live ? '' : 'none';
        if (live) animateWords(b.words, t, b.at + 0.05, b.until, 1, { stagger: 0.06, dur: 0.45, dist: 40 });
      });
    }
    if (H) {
      const c = hud.chapter(t), onDark = card ? false : dark;
      const col = onDark ? 'rgba(243,237,226,0.85)' : 'rgba(28,23,20,0.6)';
      H.el.style.color = col; H.p.setAttribute('stroke', col);
      H.el.style.opacity = seg(t, hud.start ?? 0.4, (hud.start ?? 0.4) + 0.4).toFixed(3);
      H.tl.textContent = `LawVriksh  ·  ${String(c.num).padStart(2, '0')}  ${c.name}`;
      H.ticks.forEach((b, i) => b.classList.toggle('on', i === c.num));
      H.br.textContent = c.case || '';
    }
    return { card };
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

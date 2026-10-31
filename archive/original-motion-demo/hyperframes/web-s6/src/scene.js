/* WEB CUT COPY of section-6/src/section6.js: identical scene code, exporting renderAt for src/web.js.
 *
 * LawVriksh graphics track — section 6, global reel time 44.2667–46.4000 s (D12, Vikram, LOCKED window).
 *
 * Composition time 0 = reel 44.2667 s (frame 1328). renderAt(t) takes GLOBAL reel
 * seconds and is a pure function of time. Ends before frame 1392 (46.40), where
 * Insights begins.
 *
 * User direction (22 Oct): the draft writes itself, like Ask. The words are exactly
 * the saved Vikram scenario draft (screenshots/09–10, still d12), replayed as
 * generation; a separate, labelled context (sand), never mixed with Arora.
 *   44.27 the sand slab from section 5 leaves, uncovering the Vikram page
 *   44.60–45.22 the page writes itself; yellow "to be confirmed" fields pop, blue instruction facts set
 *   44.70 "Draft." (on "drafts" 44.92) · 45.15 Checks counts to 61 / 100 · Linked Documents · 10 · legend
 *   45.35–45.85 the thread hops blue fact → yellow field → "Must fix · Complete case details"
 *   46.18–46.37 a clay slab covers: back to Arora for Insights
 */
const ID = 'section-6';
const T0 = 44.2667, DUR = 2.1333; // 64 frames at 30 fps: 44.2667–46.3667
const gsap = window.gsap;
const EZ = (name) => gsap.parseEase(name);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const tw = (t, a, b, e = 'power2.inOut') => EZ(e)(seg(t, a, b));
const $ = (id) => document.getElementById(id);
const show = (node, on) => { node.style.display = on ? '' : 'none'; return on; };
const corners = (x0, y0, x1, y1, L = 14) => `M${x0} ${y0 + L}V${y0}H${x0 + L}M${x1 - L} ${y0}H${x1}V${y0 + L}M${x1} ${y1 - L}V${y1}H${x1 - L}M${x0 + L} ${y1}H${x0}V${y1 - L}`;

await Promise.all(['400 15px "Newsreader"', '600 17px "Newsreader"', '400 100px "Newsreader"', 'italic 400 100px "Newsreader"', 'italic 400 30px "Instrument Serif"', '500 12px "Figtree"', '600 22px "Figtree"'].map((f) => document.fonts.load(f)));
await document.fonts.ready;

/* ------------------------------------------------------------ the page, as tokens in reading order */
const doc = $('doc');
const tokens = [];
(function split(node) {
  for (const child of [...node.childNodes]) {
    if (child.nodeType === 3) {
      const parts = child.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((p) => { if (!p) return; if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(p)); else { const s = document.createElement('span'); s.className = 'tok'; s.textContent = p; frag.appendChild(s); tokens.push(s); } });
      child.replaceWith(frag);
    } else if (child.classList && (child.classList.contains('y') || child.classList.contains('b'))) {
      child.classList.add('tok'); tokens.push(child); // a field or a fact lands whole
    } else split(child);
  }
})(doc);
const WRITE = [44.6, 45.22];
const tokT = tokens.map((_, i) => WRITE[0] + (WRITE[1] - WRITE[0]) * (i / (tokens.length - 1)));

/* final layout from d12, measured once for the thread and the marks */
const DOC_AT = { x: 360, y: 92, s: 1.02, r: -1 };
const docCSS = (dy, r) => `translate(${DOC_AT.x}px, ${DOC_AT.y + dy}px) rotate(${r}deg) scale(${DOC_AT.s})`;
doc.style.transform = docCSS(0, DOC_AT.r);
const R = (id) => $(id).getBoundingClientRect();
const bd = R('b-date'), yn = R('y-name'), dr = doc.getBoundingClientRect();
const CHECKS_AT = { x: 1110, y: 250, s: 1.1 }, LINKED_AT = { x: 40, y: 430, s: 1.15 };
$('checks').style.transform = `translate(${CHECKS_AT.x}px, ${CHECKS_AT.y}px) scale(${CHECKS_AT.s})`;
const fr = R('finding');
// the thread hops through the margins only: blue fact → left margin → yellow field → top margin → Checks
const mx = dr.left + 34, ty = yn.top - 14;
const THREAD = `M${bd.left - 4} ${bd.bottom + 2} H ${mx + 14} Q ${mx} ${bd.bottom + 2}, ${mx} ${bd.bottom - 12} V ${yn.bottom + 14} Q ${mx} ${yn.bottom + 2}, ${mx + 14} ${yn.bottom + 2} H ${yn.left} `
  + `M${yn.right} ${yn.top + 4} Q ${yn.right + 10} ${ty}, ${yn.right + 30} ${ty} H ${dr.right - 40} C ${dr.right + 40} ${ty}, ${fr.left - 60} ${fr.top + 30}, ${fr.left} ${fr.top + 30}`;
$('thread').setAttribute('d', THREAD); $('thread').setAttribute('pathLength', 1); $('thread').setAttribute('stroke-dasharray', '1 1');
const files = [...$('linked').querySelectorAll('.file')];

/* =============================================================== renderAt */
function renderAt(t) {
  /* the sand slab from section 5 leaves to the left, settling as d12's sand strip */
  const sx = t < 44.62 ? lerp(-470, -1630, EZ('power3.out')(seg(t, 44.2333, 44.62))) : -1630;
  $('sand').style.transform = `translateX(${sx.toFixed(1)}px)`;
  $('bug').style.opacity = tw(t, 44.36, 44.5).toFixed(3); // section 5's last frame is sand only

  /* the page settles and writes itself */
  const st = tw(t, 44.34, 44.62, 'expo.out');
  doc.style.transform = docCSS(50 * (1 - st), lerp(-3, DOC_AT.r, st));
  doc.style.opacity = Math.min(1, st * 2).toFixed(3);
  $('label').style.opacity = seg(t, 44.4, 44.55).toFixed(3);
  tokens.forEach((k, i) => {
    const u = seg(t, tokT[i], tokT[i] + 0.07);
    k.style.opacity = u.toFixed(3);
    if (k.classList.contains('y')) k.style.transform = `scale(${lerp(0.85, 1, EZ('back.out(2.5)')(seg(t, tokT[i], tokT[i] + 0.16))).toFixed(4)})`;
  });

  /* "Draft." lands on "drafts" (44.92) */
  $('draft-word').style.transform = `translateY(${lerp(118, 0, tw(t, 44.7, 45.08, 'expo.out')).toFixed(2)}%)`;

  /* the checks, the ten linked files, the legend */
  const ci = tw(t, 45.12, 45.42, 'expo.out');
  $('checks').style.transform = `translate(${(CHECKS_AT.x + 90 * (1 - ci)).toFixed(1)}px, ${CHECKS_AT.y}px) scale(${CHECKS_AT.s})`;
  $('checks').style.opacity = Math.min(1, ci * 2).toFixed(3);
  $('score').textContent = Math.round(61 * EZ('power2.out')(seg(t, 45.22, 45.6)));
  $('finding').style.opacity = seg(t, 45.48, 45.6).toFixed(3);
  const li = tw(t, 45.22, 45.52, 'expo.out');
  $('linked').style.transform = `translate(${(LINKED_AT.x - 90 * (1 - li)).toFixed(1)}px, ${LINKED_AT.y}px) scale(${LINKED_AT.s})`;
  $('linked').style.opacity = Math.min(1, li * 2).toFixed(3);
  files.forEach((f, i) => { f.style.opacity = seg(t, 45.3 + i * 0.025, 45.4 + i * 0.025).toFixed(3); });
  $('legend').style.opacity = seg(t, 45.55, 45.72).toFixed(3);
  $('legend').style.transform = `translateY(${(14 * (1 - tw(t, 45.55, 45.75, 'expo.out'))).toFixed(1)}px)`;

  /* the thread hops; marks land on the yellow field */
  const th = tw(t, 45.35, 45.85, 'power1.inOut');
  $('thread').setAttribute('stroke-dashoffset', (1 - th).toFixed(4)); $('thread').style.opacity = th > 0 ? 1 : 0;
  const fk = lerp(1.4, 1, tw(t, 45.5, 45.7, 'expo.out')), b = { x0: yn.left - 8, y0: yn.top - 8, x1: yn.right + 8, y1: yn.bottom + 8 }, cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
  $('focal').setAttribute('d', t >= 45.5 ? corners(cx + (b.x0 - cx) * fk, cy + (b.y0 - cy) * fk, cx + (b.x1 - cx) * fk, cy + (b.y1 - cy) * fk) : '');

  /* back to Arora: a clay slab covers on 46.40 */
  show($('clay-layer'), t >= 46.18);
  $('clay').style.transform = `translateX(${lerp(1460, -470, tw(t, 46.18, 46.3667, 'power2.in')).toFixed(1)}px)`;
}

/* ------------------------------------------------------------- web cut */
// The web cut drives renderAt through its own time map (src/web.js); no timeline here.
renderAt(T0);
export { renderAt, T0 };

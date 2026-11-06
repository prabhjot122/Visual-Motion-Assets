// Graphics families: layered SVG files (+ HTML component sheets where live text is needed).
// Every graphic has a paper and a dark version. Galleries inline the SVGs for previews/checks.
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {write, T, rgba, docPage, blurDef, esc, SYS, MARK} from './lib.mjs';
const require = createRequire(import.meta.url);
const O = require('../core/lv-objects.js');
const TEX = '../../../brand/textures/';   // from graphics/<family>/x.svg
const out = [];
const svgWrap = (vb, inner, label) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${esc(label)}">${inner}</svg>\n`;
const files = {}; // family -> [{name, theme, rel, svg}]
function add(family, name, theme, svg, label){
  const rel = `graphics/${family}/${name}-${theme}.svg`;
  write(rel, svg);
  (files[family] ||= []).push({name, theme, rel, svg, label});
}
const TH = ['paper', 'dark'];
const acc = th => th === 'dark' ? T.edge : T.clay;
const ink = th => th === 'dark' ? T.paper : T.ink;

/* ---------- 1. document objects ---------- */
const docs = [
  ['judgment-page', 'Judgment page', th => ({kind: 'judgment', seed: 3})],
  ['draft-page', 'Draft page', th => ({kind: 'draft', seed: 7, highlight: false})],
  ['filing', 'Filing cover page', th => ({kind: 'filing', seed: 4, highlight: false})],
  ['notes-page', 'Notes page', th => ({kind: 'notes', seed: 5, highlight: false})],
  ['highlighted-page', 'Page with highlighted paragraph', th => ({kind: 'draft', seed: 11})],
  ['folded-page', 'Page with folded corner', th => ({kind: 'draft', seed: 2, highlight: false, folded: true})],
  ['report-page', 'Law report page', th => ({kind: 'report', seed: 8})]
];
for (const th of TH) {
  for (const [name, label, f] of docs) {
    const d = docPage({w: 420, h: 560, theme: th, ...f(th)}), m = 40;
    add('documents', name, th, svgWrap(`${-m} ${-m} ${d.w + m * 2} ${d.h + m * 2}`, blurDef() + d.inner, label), label);
  }
  // stacked pages
  const a = docPage({w: 380, h: 500, theme: th, kind: 'draft', seed: 1, highlight: false, shadow: true}), b = docPage({w: 380, h: 500, theme: th, kind: 'judgment', seed: 6, shadow: true});
  add('documents', 'stacked-pages', th, svgWrap('-40 -40 520 620', blurDef() + `<g transform="rotate(-5 190 250) translate(-10 10)">${a.inner}</g><g transform="rotate(3 190 250) translate(40 20)">${b.inner}</g>`, 'Stacked pages'), 'Stacked pages');
  for (const [name, motif, label] of [['stacked-files', 'files', 'Stacked case files'], ['open-law-report', 'open-book', 'Open bound law report'], ['bound-volumes', 'reports', 'Bound law report volumes']])
    add('documents', name, th, O.svg(motif, {theme: th, texBase: TEX}).replace('<svg ', '<svg width="620" height="470" ') + '\n', label);
}

/* ---------- 2. connection motifs (no arrowheads) ---------- */
const dot = (x, y, th, r = 9, hollow = false) => hollow ? `<circle cx="${x}" cy="${y}" r="${r}" fill="${th === 'dark' ? T.inkWarm : T.paper}" stroke="${T.thread}" stroke-width="4"/>` : `<circle cx="${x}" cy="${y}" r="${r}" fill="${th === 'dark' ? T.edge : T.thread}"/>`;
const pth = (d, th, w = 5, dash = '') => `<path d="${d}" fill="none" stroke="${T.thread}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
const conns = [
  ['straight', 'Straight link with end nodes', th => pth('M40 120H560', th) + dot(40, 120, th) + dot(560, 120, th)],
  ['dotted-nodes', 'Thread with stations', th => pth('M40 120H560', th, 4) + [40, 170, 300, 430, 560].map((x, i) => dot(x, 120, th, i === 2 ? 12 : 8, i !== 2)).join('')],
  ['elbow', 'Rounded elbow connector', th => pth('M40 40H260Q300 40 300 80V160Q300 200 340 200H560', th) + dot(40, 40, th) + dot(560, 200, th)],
  ['s-curve', 'S-curve thread', th => pth('M40 200C 220 200, 380 40, 560 40', th) + dot(40, 200, th) + dot(560, 40, th)],
  ['dashed', 'Dashed pending link', th => pth('M40 120H560', th, 4, '2 14') + dot(40, 120, th) + dot(560, 120, th, 9, true)],
  ['branch-two', 'One to two branch', th => pth('M40 120H220Q260 120 260 80V60Q260 40 300 40H560M260 120V180Q260 200 300 200H560', th) + dot(40, 120, th) + dot(560, 40, th) + dot(560, 200, th)],
  ['branch-three', 'One to three tree', th => pth('M40 120H200M200 120Q240 120 240 80V50Q240 30 280 30H560M200 120H560M200 120Q240 120 240 160V190Q240 210 280 210H560', th) + dot(40, 120, th) + dot(560, 30, th) + dot(560, 120, th) + dot(560, 210, th)],
  ['converge', 'Three into one', th => pth('M40 30H280Q320 30 320 70V120M40 120H560M40 210H280Q320 210 320 170V120', th) + dot(40, 30, th) + dot(40, 120, th) + dot(40, 210, th) + dot(560, 120, th, 12)],
  ['timeline', 'Timeline with dated nodes', th => pth('M40 120H560', th, 3) + [70, 200, 330, 470].map((x, i) => `<path d="M${x} 120V${i % 2 ? 160 : 80}" fill="none" stroke="${rgba(th === 'dark' ? T.paper : T.ink, .3)}" stroke-width="3"/>` + dot(x, 120, th, 9, i === 3)).join('')],
  ['braid', 'Two threads braided', th => pth('M40 90C140 90 160 150 260 150S380 90 480 90 540 120 560 120', th, 4) + `<path d="M40 150C140 150 160 90 260 90S380 150 480 150 540 120 560 120" fill="none" stroke="${th === 'dark' ? rgba(T.paper, .5) : rgba(T.ink, .4)}" stroke-width="4" stroke-linecap="round"/>` + dot(40, 90, th) + dot(40, 150, th, 9, true) + dot(560, 120, th, 11)],
  ['loop-back', 'Loop back to source', th => pth('M60 160H420Q520 160 520 100Q520 40 420 40H200', th) + dot(60, 160, th) + dot(200, 40, th, 9, true)]
];
for (const th of TH) for (const [n, l, f] of conns) add('connections', n, th, svgWrap('0 0 600 240', f(th), l), l);

/* ---------- 3. law-object compositions (cover decorations, corner accents, clusters) ---------- */
const nest = (name, th, x, y, w, h) => O.svg(name, {theme: th, texBase: TEX}).replace('<svg xmlns="http://www.w3.org/2000/svg"', `<svg x="${x}" y="${y}" width="${w}" height="${h}"`);
const comps = [
  ['cover-shelf-and-court', 'Cover: law reports beside a court facade', '0 0 1000 520', th => nest('courthouse', th, 0, 40, 520, 440) + nest('reports', th, 430, 60, 560, 400)],
  ['cover-desk', 'Cover: judgment, notes and files on a desk', '0 0 1000 560', th => nest('files', th, 0, 120, 520, 420) + nest('judgment', th, 360, 0, 460, 360) + nest('notes', th, 640, 180, 360, 300)],
  ['cover-reading', 'Cover: open report with a ticked page', '0 0 900 520', th => nest('open-book', th, 0, 80, 600, 420) + nest('checked', th, 520, 0, 380, 300)],
  ['corner-top-right', 'Corner accent: open report', '0 0 420 300', th => nest('open-book', th, 0, 0, 420, 300)],
  ['corner-bottom-right', 'Corner accent: case files', '0 0 420 340', th => nest('files', th, 0, 0, 420, 340)],
  ['corner-top-left', 'Corner accent: note slip', '0 0 360 300', th => nest('notes', th, 0, 0, 360, 300)],
  ['cluster-dates', 'Cluster: calendar and register', '0 0 700 420', th => nest('register', th, 0, 120, 440, 300) + nest('calendar', th, 340, 0, 360, 300)],
  ['cluster-compare', 'Cluster: two pages and a thread', '0 0 600 400', th => nest('compare', th, 0, 0, 600, 400)],
  ['cluster-source', 'Cluster: volumes with a judgment page', '0 0 820 480', th => nest('reports', th, 0, 40, 560, 400) + nest('judgment', th, 460, 80, 360, 380)],
  ['small-court', 'Small accent: court facade', '0 0 300 220', th => nest('courthouse', th, 0, 0, 300, 220)],
  ['small-check', 'Small accent: ticked page', '0 0 280 220', th => nest('checked', th, 0, 0, 280, 220)]
];
for (const th of TH) for (const [n, l, vb, f] of comps) add('compositions', n, th, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${esc(l)}">${f(th)}</svg>\n`, l);

/* ---------- 4. paper and light treatments (overlays, 1080x1350) ---------- */
const lt = th => th === 'dark' ? T.paper : T.surface, sh = T.ink;
const g = (id, stops, x1 = 0, y1 = 0, x2 = 1, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
const torn = (y, up, seed) => { let d = `M0 ${up ? 0 : 1350}V${y}`; for (let x = 0; x <= 1080; x += 18) d += `L${x} ${(y + Math.sin(x * 0.07 + seed) * 6 + Math.sin(x * 0.31 + seed * 2) * 4).toFixed(1)}`; return d + `V${up ? 0 : 1350}Z`; };
const lights = [
  ['window-light-two', 'Window light, two bands', th => `<defs>${g('a', [[0, lt(th), 0], [.3, lt(th), th === 'dark' ? .06 : .5], [.42, lt(th), 0], [.55, lt(th), 0], [.62, lt(th), th === 'dark' ? .04 : .35], [.72, lt(th), 0]], 0, 0, 1, .6)}</defs><rect width="1080" height="1350" fill="url(#a)"/>`],
  ['window-light-three', 'Window light, three narrow bands', th => `<defs>${g('a', [[.18, lt(th), 0], [.24, lt(th), th === 'dark' ? .05 : .4], [.3, lt(th), 0], [.4, lt(th), 0], [.46, lt(th), th === 'dark' ? .05 : .4], [.52, lt(th), 0], [.62, lt(th), 0], [.68, lt(th), th === 'dark' ? .04 : .3], [.74, lt(th), 0]], 0, 0, 1, .5)}</defs><rect width="1080" height="1350" fill="url(#a)"/>`],
  ['window-light-wide', 'Window light, one wide wash', th => `<defs>${g('a', [[.1, lt(th), 0], [.4, lt(th), th === 'dark' ? .07 : .55], [.75, lt(th), 0]], 0, 0, 1, .8)}</defs><rect width="1080" height="1350" fill="url(#a)"/>`],
  ['window-mullion', 'Window light with mullion shadows', th => `<defs>${g('a', [[0, lt(th), 0], [.35, lt(th), th === 'dark' ? .06 : .5], [.7, lt(th), 0]], 0, 0, 1, .7)}<filter id="b"><feGaussianBlur stdDeviation="14"/></filter></defs><rect width="1080" height="1350" fill="url(#a)"/><g filter="url(#b)" opacity="${th === 'dark' ? .5 : .14}"><path d="M300 -40L120 1400" fill="none" stroke="${sh}" stroke-width="22"/><path d="M640 -40L460 1400" fill="none" stroke="${sh}" stroke-width="22"/></g>`],
  ['vignette-soft', 'Soft vignette', th => `<defs><radialGradient id="a" cx=".4" cy=".35" r=".85"><stop offset=".55" stop-color="${sh}" stop-opacity="0"/><stop offset="1" stop-color="${sh}" stop-opacity="${th === 'dark' ? .35 : .12}"/></radialGradient></defs><rect width="1080" height="1350" fill="url(#a)"/>`],
  ['vignette-corner', 'Corner vignette, bottom right', th => `<defs><radialGradient id="a" cx="0" cy="0" r="1.5"><stop offset=".6" stop-color="${sh}" stop-opacity="0"/><stop offset="1" stop-color="${sh}" stop-opacity="${th === 'dark' ? .4 : .16}"/></radialGradient></defs><rect width="1080" height="1350" fill="url(#a)"/>`],
  ['torn-edge-top', 'Torn paper edge, top', th => `<defs><filter id="b"><feGaussianBlur stdDeviation="6"/></filter></defs><path d="${torn(220, true, 1)}" fill="${sh}" opacity=".18" filter="url(#b)" transform="translate(0 8)"/><path d="${torn(220, true, 1)}" fill="${th === 'dark' ? T.paper : T.surface}"/>`],
  ['torn-edge-bottom', 'Torn paper edge, bottom', th => `<defs><filter id="b"><feGaussianBlur stdDeviation="6"/></filter></defs><path d="${torn(1120, false, 3)}" fill="${sh}" opacity=".18" filter="url(#b)" transform="translate(0 -8)"/><path d="${torn(1120, false, 3)}" fill="${th === 'dark' ? T.paper : T.surface}"/>`],
  ['folded-corner', 'Folded corner, top right', th => `<defs><filter id="b"><feGaussianBlur stdDeviation="8"/></filter>${g('a', [[0, T.surface, 1], [1, T.paper, 1]])}</defs><path d="M900 0H1080V180Z" fill="${th === 'dark' ? T.inkWarm : T.paper}"/><path d="M900 0L1080 180H920Q900 180 900 160Z" fill="${sh}" opacity=".22" filter="url(#b)" transform="translate(-6 10)"/><path d="M900 0L1080 180H920Q900 180 900 160Z" fill="url(#a)"/>`],
  ['centre-crease', 'Centre fold crease', th => `<defs>${g('a', [[0, sh, 0], [.47, sh, th === 'dark' ? .3 : .08], [.5, lt(th), th === 'dark' ? .08 : .5], [.53, sh, th === 'dark' ? .2 : .05], [1, sh, 0]], 0, 0, 1, 0)}</defs><rect x="440" width="200" height="1350" fill="url(#a)"/>`],
  ['paper-stack-edge', 'Paper stack edge, bottom', th => [0, 1, 2].map(i => `<rect x="${60 + i * 10}" y="${1270 - i * 14}" width="${960 - i * 20}" height="40" rx="4" fill="${i === 2 ? T.surface : T.paper}" stroke="${rgba(T.ink, .12)}" stroke-width="1.5"/>`).join('')]
];
for (const th of TH) for (const [n, l, f] of lights) add('paper-light', n, th, svgWrap('0 0 1080 1350', f(th), l), l);

/* ---------- 5. icons (24+, monoline, 2px at 24, round caps) ---------- */
const IC = {
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  'cross-out': '<path d="M4 12h16"/><path d="M6 8.5h9M6 15.5h7" opacity=".45"/>',
  document: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 11h6M9 14.5h6M9 18h4"/>',
  search: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
  paragraph: '<path d="M10 20V4h8M15 4v16"/><path d="M10 4a4 4 0 0 0 0 8"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/><circle cx="15" cy="15" r="1.4"/>',
  court: '<path d="M3.5 9L12 4l8.5 5z"/><path d="M5 9v9M9.7 9v9M14.3 9v9M19 9v9M3 20.5h18"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
  note: '<path d="M5 4h14v11l-5 5H5z"/><path d="M14 20v-5h5M8.5 9h7M8.5 12.5h4"/>',
  link: '<path d="M10 14l4-4"/><path d="M8.5 11.5l-2 2a3 3 0 0 0 4.2 4.2l2-2M15.5 12.5l2-2a3 3 0 0 0-4.2-4.2l-2 2"/>',
  verify: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12.3l2.8 2.8L16.2 9.5"/>',
  list: '<path d="M9 7h11M9 12h11M9 17h11"/><circle cx="5" cy="7" r=".9"/><circle cx="5" cy="12" r=".9"/><circle cx="5" cy="17" r=".9"/>',
  compare: '<rect x="3.5" y="5" width="7" height="14" rx="1.5"/><rect x="13.5" y="5" width="7" height="14" rx="1.5"/><path d="M6 9h2M16 9h2M6 12h2M16 12h2"/>',
  folder: '<path d="M3.5 7.5V18a1.5 1.5 0 0 0 1.5 1.5h14a1.5 1.5 0 0 0 1.5-1.5V9.5A1.5 1.5 0 0 0 19 8h-7l-2-2.5H5A1.5 1.5 0 0 0 3.5 7z"/>',
  bookmark: '<path d="M7 3.5h10v17l-5-4-5 4z"/>',
  highlight: '<path d="M4 19.5h16"/><rect x="5" y="9" width="14" height="6" rx="1.2"/>',
  'section-mark': '<path d="M15 6.5a3 3 0 0 0-3-2c-2 0-3 1.2-3 2.4 0 3 6 2.6 6 6 0 1.4-1.3 2.4-3 2.4M9 17.5a3 3 0 0 0 3 2c2 0 3-1.2 3-2.4 0-3-6-2.6-6-6 0-1.4 1.3-2.4 3-2.4"/>',
  'page-stack': '<path d="M8 3.5h10v13H8z"/><path d="M5.5 6.5v14h10"/>',
  timeline: '<path d="M3.5 12h17"/><circle cx="6.5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="17.5" cy="12" r="1.8"/><path d="M6.5 7.5v2M12 14.5v2M17.5 7.5v2"/>',
  pin: '<path d="M12 21s-6-5.6-6-10.5a6 6 0 0 1 12 0C18 15.4 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.2"/>',
  pen: '<path d="M4.5 19.5l1-4L15 6l3 3-9.5 9.5z"/><path d="M13 8l3 3"/>',
  read: '<path d="M3 6.5c3-1.4 6-1.4 9 .5 3-1.9 6-1.9 9-.5v12c-3-1.4-6-1.4-9 .5-3-1.9-6-1.9-9-.5z"/><path d="M12 7v12"/>',
  tag: '<path d="M3.5 12.5V4.5h8l9 9-8 8z"/><circle cx="8" cy="9" r="1.3"/>',
  sort: '<path d="M4 7h16M7 12h10M10 17h4"/>',
  filter: '<path d="M4 5h16l-6 7.5V19l-4 1.5v-8z"/>',
  index: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16M9 9v11"/>',
  clip: '<path d="M8.5 12.5V6a3.5 3.5 0 0 1 7 0v10a5.5 5.5 0 0 1-11 0V9"/>',
  hearing: '<rect x="3.5" y="13.5" width="17" height="6" rx="1.5"/><path d="M7 13.5V9h10v4.5M9.5 9V6h5v3"/>'
};
const iconSVG = (name, th, size = 24) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${ink(th)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="${name}">${IC[name].replace(/opacity="\.45"/, `stroke="${acc(th)}"`)}</svg>\n`;
for (const th of TH) {
  for (const n of Object.keys(IC)) write(`icons/${n}-${th}.svg`, iconSVG(n, th));
  write(`icons/sprite-${th}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${Object.keys(IC).map(n => `<symbol id="lv-${n}" viewBox="0 0 24 24" fill="none" stroke="${ink(th)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[n]}</symbol>`).join('')}</svg>\n`);
}
// accent variants: clay stroke on either ground
for (const n of Object.keys(IC)) write(`icons/${n}-clay.svg`, iconSVG(n, 'paper').replace(`stroke="${T.ink}"`, `stroke="${T.clay}"`));

/* ---------- galleries ---------- */
function gallery(family, title, cols, cell, opts = {}){
  for (const th of TH) {
    const items = files[family].filter(f => f.theme === th);
    const rows = Math.ceil(items.length / cols), W = 72 * 2 + cols * cell[0] + (cols - 1) * 40, H = 72 + 120 + rows * (cell[1] + 70) + 40;
    const body = `
<header style="position:absolute;left:72px;top:60px;z-index:2;display:flex;align-items:baseline;gap:24px"><span class="kicker">${esc(family)}</span><span class="label" style="color:var(--fg-muted)">${esc(title)}</span></header>
<div style="position:absolute;left:72px;top:150px;z-index:2;display:grid;grid-template-columns:repeat(${cols},${cell[0]}px);column-gap:40px;row-gap:24px">
${items.map(f => `<figure style="margin:0;display:flex;flex-direction:column;gap:12px"><div data-deco style="position:relative;width:${cell[0]}px;height:${cell[1]}px;${opts.frame ? `border-radius:12px;overflow:hidden;background:${th === 'dark' ? T.inkWarm : T.paper};box-shadow:inset 0 0 0 1.5px ${th === 'dark' ? rgba(T.paper, .14) : rgba(T.ink, .12)}` : ''}">${f.svg.replace(/^<svg /, '<svg style="width:100%;height:100%;display:block" ').replace(/ width="\d+" height="\d+"/, '')}</div><figcaption class="label" style="font-size:34px;color:var(--fg-muted)">${esc(f.name)}</figcaption></figure>`).join('\n')}
</div>`;
    write(`graphics/${family}-${th}.html`, pageG(`LawVriksh graphics — ${title}`, `graphics/${family}-${th}`, `${W}x${H}`, th, body, W, H));
    out.push({family: 'graphics', id: `${family}-${th}`, title, size: `${W}x${H}`, file: `graphics/${family}-${th}.html`, themes: [th], skipChecks: ['safeArea', 'minSize'], role: 'gallery'});
  }
}
function pageG(title, id, size, theme, body, W, H){
  // dedupe ids across inlined SVGs
  let n = 0; body = body.replace(/<svg /g, m => m).replace(/id="([a-z])"/g, (m, i) => m); // ids in light/paper are local
  let k = 0; body = body.replace(/<svg[\s\S]*?<\/svg>/g, s => { k++; return s.replace(/id="([^"]+)"/g, (m, i) => `id="g${k}-${i}"`).replace(/url\(#([^)]+)\)/g, (m, i) => `url(#g${k}-${i})`); });
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<meta name="lv:template" content="${id}"><meta name="lv:size" content="${size}">
<link rel="stylesheet" href="../core/lv.css">
<script src="../core/lv-runtime.js"></script>
<style>.lv{width:${W}px;height:${H}px}</style>
</head>
<body>
<main class="lv" data-format="sheet" data-theme="${theme}">
${body.trim().replace(/\.\.\/\.\.\/\.\.\/brand/g, '../../brand')}
</main>
</body>
</html>
`;
}
gallery('documents', 'Document objects', 5, [300, 340]);
gallery('connections', 'Connection motifs — threads, link lines with dots, connector paths. No arrowheads.', 4, [360, 150]);
gallery('compositions', 'Law-object compositions — cover decorations, corner accents, clusters', 4, [380, 260]);
gallery('paper-light', 'Paper and light treatments (overlays, 1080×1350)', 6, [216, 270], {frame: true});

/* icon sheet */
for (const th of TH) {
  const names = Object.keys(IC), cols = 7, W = 72 * 2 + cols * 200 + (cols - 1) * 24, H = 200 + Math.ceil(names.length / cols) * 190 + 40;
  const body = `
<header style="position:absolute;left:72px;top:60px;z-index:2;display:flex;align-items:baseline;gap:24px"><span class="kicker">icons</span><span class="label" style="color:var(--fg-muted)">${names.length} monoline icons · 2 px at 24 · ink, paper and clay</span></header>
<div style="position:absolute;left:72px;top:150px;z-index:2;display:grid;grid-template-columns:repeat(${cols},200px);gap:24px">
${names.map(n => `<figure style="margin:0;display:flex;flex-direction:column;align-items:center;gap:14px"><div data-deco style="width:96px;height:96px">${iconSVG(n, th, 96).replace('<svg ', '<svg style="display:block" ')}</div><figcaption class="label" style="font-size:34px;color:var(--fg-muted);white-space:nowrap">${n}</figcaption></figure>`).join('\n')}
</div>`;
  write(`icons/icons-${th}.html`, pageG('LawVriksh icons', `icons/icons-${th}`, `${W}x${H}`, th, body, W, H));
  out.push({family: 'icons', id: `icons-${th}`, title: 'Icon set', size: `${W}x${H}`, file: `icons/icons-${th}.html`, themes: [th], skipChecks: ['safeArea'], role: 'gallery'});
}

const iconEntries = ['paper', 'dark', 'clay'].flatMap(th => Object.keys(IC).map(n => ({family: 'graphics-svg', id: `${n}-${th}`, group: 'icons', file: `icons/${n}-${th}.svg`, title: n, theme: th})));
export function build(){ return out.concat(iconEntries, Object.entries(files).flatMap(([fam, fs]) => fs.map(f => ({family: 'graphics-svg', id: path.basename(f.rel, '.svg'), group: fam, file: f.rel, title: f.label, theme: f.theme})))); }

// Product compositions (only two): Case Mapping and Chronology, kept as separate features.
// Rebuilt from motion-demo/screenshots/21-arora-map-root-current.png and 11-chronology-expanded-corpus.png.
// Placeholder data only; requires_claim_approval: true.
import {write, esc, MARK} from './lib.mjs';

const I = {
  home: '<path d="M4 11l8-6 8 6v8.5H4z"/>', ask: '<circle cx="12" cy="12" r="7.5"/><path d="M9.5 10a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5"/>', book: '<path d="M4 6c3-1.3 5.5-1.3 8 .4 2.5-1.7 5-1.7 8-.4v12c-3-1.3-5.5-1.3-8 .4-2.5-1.7-5-1.7-8-.4z"/>',
  folder: '<path d="M4 7.5V18h16V9h-8l-2-2.5H4z"/>', grid: '<rect x="4.5" y="4.5" width="6" height="6" rx="1.5"/><rect x="13.5" y="4.5" width="6" height="6" rx="1.5"/><rect x="4.5" y="13.5" width="6" height="6" rx="1.5"/><rect x="13.5" y="13.5" width="6" height="6" rx="1.5"/>',
  map: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="7" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7.5 7.3l3.7 9M16.6 8.4l-3.8 8"/>', clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
  table: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16M10 10v9"/>', draft: '<path d="M6 3.5h8l4 4v13H6z"/><path d="M9 12h6M9 15.5h4"/>', note: '<path d="M5 4h14v11l-5 5H5z"/><path d="M14 20v-5h5"/>', cal: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  lib: '<path d="M5 4.5h4v15H5zM10 4.5h4v15h-4z"/><path d="M15.5 5.5l3.5-.8 2.8 14-3.5.8z"/>', plus: '<path d="M12 5v14M5 12h14"/>', search: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>', up: '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 19.5h14"/>',
  down: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/>', filter: '<path d="M4 5h16l-6 7.5V19l-4 1.5v-8z"/>', minus: '<path d="M5 12h14"/>', expand: '<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>', reset: '<path d="M5 12a7 7 0 1 0 2-5"/><path d="M5 4.5V8h3.5"/>',
  chev: '<path d="M9 6l6 6-6 6"/>', chevd: '<path d="M6 9l6 6 6-6"/>', addfact: '<path d="M7 3.5h7l4 4V20H7z"/><path d="M12.5 11v6M9.5 14h6"/>', panel: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M14 5v14"/>',
  quote: '<path d="M8 8.5h-2.5v4h3v1.5c0 1.5-1 2.5-2.5 2.5M17 8.5h-2.5v4h3v1.5c0 1.5-1 2.5-2.5 2.5"/>', doc: '<path d="M6 3.5h8l4 4v13H6z"/><path d="M9 12h6M9 15.5h6"/>', gavel: '<path d="M14 4l6 6M11 7l6 6M12.5 5.5l-6 6 3 3 6-6M8 13l-4.5 4.5 2 2L10 15"/>'
};
const ic = n => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;
const side = active => `
<aside class="side">
  <div class="brand"><img src="${MARK}" alt="LawVriksh"><span class="wm">Law<span>Vriksh</span></span><span class="beta">beta</span></div>
  <div class="newrow"><span class="new">${ic('plus')}New</span><span class="srch">${ic('search')}</span></div>
  <div class="nav is-active" style="background:rgba(23,23,23,.06)">${ic('home')}Home</div>
  <div class="nav">${ic('ask')}Ask</div>
  <div class="nav">${ic('book')}Playbook</div>
  <div class="group">Workspace</div>
  <div class="nav">${ic('folder')}[Matter name]<span style="margin-left:auto">${ic('chevd')}</span></div>
  ${[['grid', 'Overview'], ['folder', 'Documents'], ['map', 'Case Mapping'], ['clock', 'Chronology'], ['table', 'Tabular review'], ['draft', 'Drafts'], ['note', 'Notes'], ['cal', 'Hearing']].map(([i, l]) => `<div class="nav sub${l === active ? ' is-active' : ''}">${ic(i)}${l}</div>`).join('\n  ')}
  <div class="nav" style="margin-top:6px">${ic('lib')}Library<span style="margin-left:auto">${ic('chev')}</span></div>
  <div class="foot"><span class="av">AD</span><span style="display:flex;flex-direction:column;gap:2px"><span style="font-weight:500">[Advocate name]</span><span style="font-size:11px;color:var(--muted)">[email]</span></span></div>
</aside>`;
const wrap = (title, id, body) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<meta name="lv:template" content="${id}">
<meta name="lv:size" content="1440x1000">
<meta name="lv:requires_claim_approval" content="true">
<link rel="stylesheet" href="../core/lv.css">
<link rel="stylesheet" href="product.css">
<script src="../core/lv-runtime.js"></script>
</head>
<body>
<main class="lv" data-format="product" data-theme="paper">
<div class="app">
${body.trim()}
</div>
</main>
</body>
</html>
`;

function caseMap(){
  const L = [['Parties', 443], ['Advocates', 492], ['Issues', 540], ['Provisions', 589], ['Conflicts', 637]], R = [['Facts', 467], ['Evidence', 516], ['Arguments', 565], ['Reliefs', 613]];
  // canvas origin: main panel starts at x=242, toolbar bottom ~ y=94 in the source capture
  const ox = 242, oy = 94, rootX = 718 - ox, rootY = 513 - oy;
  const links = L.map(([, y]) => `<path d="M${537 - ox} ${y - oy}C ${620 - ox} ${y - oy}, ${640 - ox} ${541 - oy}, ${718 - ox} ${541 - oy}"/>`).concat(R.map(([, y]) => `<path d="M${954 - ox} ${541 - oy}C ${1040 - ox} ${541 - oy}, ${1050 - ox} ${y - oy}, ${1135 - ox} ${y - oy}"/>`)).join('');
  return wrap('LawVriksh product — Case Mapping (placeholder data)', 'product/case-mapping', `
${side('Case Mapping')}
<section class="main">
  <div class="topbar">
    <span class="crumb" style="color:var(--muted)">${ic('chev').replace('<path d="M9 6l6 6-6 6"/>', '<path d="M15 6l-6 6 6 6"/>')}${ic('chev')}</span>
    <span class="crumb">[Matter name] ${ic('chevd')}<span class="sep">/</span>Case Mapping</span>
    <span style="margin-left:auto" class="btn-s">${ic('up')}Upload</span>
    <span class="btn-s is-clay">${ic('plus').replace('class="ico"', 'class="ico" style="color:var(--surface)"')}Create new ${ic('chevd').replace('class="ico"', 'class="ico" style="color:var(--surface)"')}</span>
  </div>
  <div class="toolbar">
    <span class="tabs"><span class="is-on">Map</span><span>Facts</span></span>
    <span class="search">${ic('search')}Search the map…</span>
    <span class="btn-s">${ic('addfact')}Add fact</span>
    <span class="live"><span class="ld"></span>Live</span>
    <span style="margin-left:auto;display:flex;gap:6px"><span class="iconbtn">${ic('plus')}</span><span class="iconbtn">${ic('minus')}</span><span class="iconbtn">${ic('expand')}</span><span class="iconbtn">${ic('reset')}</span></span>
  </div>
  <div class="mapc">
    <span class="title">[Matter name]</span>
    <svg class="links" aria-hidden="true" fill="none" stroke="rgba(23,23,23,.18)" stroke-width="1.5">${links}</svg>
    ${L.map(([l, y]) => `<div class="node left" style="left:${337 - ox}px;top:${y - 18 - oy}px"><span class="ct">[n] ${ic('chev').replace('<path d="M9 6l6 6-6 6"/>', '<path d="M15 6l-6 6 6 6"/>')}</span><span>${l}</span></div>`).join('\n    ')}
    <div class="root" style="left:${rootX}px;top:${rootY}px"><div class="k">MATTER</div><div class="n">[Matter name]</div><div class="c">[Case number]</div></div>
    ${R.map(([l, y]) => `<div class="node right" style="left:${1135 - ox}px;top:${y - 18 - oy}px"><span>${l}</span><span class="ct">[n] ${ic('chev')}</span></div>`).join('\n    ')}
  </div>
</section>`);
}

function chronology(){
  const evs = [['review', 'cal', 'Listed hearing', 'Listing recorded in [source]; no later date is confirmed by these sources.'], ['review', 'quote', 'Deadline (calculated)', '[Date] is calculated from [source]; verify the deadline before relying on it.'], ['', 'gavel', '[Event title]', '[Short description of the event, as recorded in [source].]'], ['', 'doc', '[Event title]', '[Short description of the event, as recorded in [source].]'], ['', 'quote', '[Event title]', '[Short description of the event, as recorded in [source].]'], ['', 'quote', '[Event title]', '[Short description of the event, as recorded in [source].]'], ['', 'doc', '[Event title]', '[Short description of the event, as recorded in [source].]'], ['', 'quote', '[Event title]', '[Short description of the event, as recorded in [source].]'], ['', 'quote', '[Event title]', '[Short description of the event, as recorded in [source].]'], ['', 'quote', '[Event title]', '[Short description of the event, as recorded in [source].]'], ['', 'quote', '[Event title]', '[Short description of the event, as recorded in [source].]']];
  return wrap('LawVriksh product — Chronology (placeholder data)', 'product/chronology', `
${side('Chronology')}
<section class="main">
  <div class="topbar">
    <span class="crumb" style="color:var(--muted)">${ic('chev').replace('<path d="M9 6l6 6-6 6"/>', '<path d="M15 6l-6 6 6 6"/>')}${ic('chev')}</span>
    <span class="crumb">[Matter name] ${ic('chevd')}<span class="sep">/</span>Chronology</span>
    <span style="margin-left:auto" class="btn-s is-clay">${ic('up').replace('class="ico"', 'class="ico" style="color:var(--surface)"')}Upload</span>
    <span class="btn-s">${ic('down')}Download</span>
  </div>
  <div class="toolbar">
    <span class="search" style="max-width:none">${ic('search')}Search chronology by event, description, or date…</span>
    <span class="btn-s">${ic('filter')}Filter</span>
    <span style="margin-left:auto" class="btn-s">[n] events need review <span style="border-left:1px solid rgba(23,23,23,.12);height:28px;margin:0 2px 0 6px"></span>${ic('panel')}</span>
    <span class="btn-s">${ic('plus')}Add event</span>
  </div>
  <div class="chron">
    <div class="era">PAST</div>
    ${evs.map(([st, i, t, s]) => `<div class="ev"><span class="d">[date]</span><span class="m"><span class="dot${st ? ' is-review' : ''}"><svg viewBox="0 0 24 24" aria-hidden="true">${I[i]}</svg></span></span><span><div class="t">${t}</div><div class="s">${s}</div></span></div>`).join('\n    ')}
  </div>
</section>`);
}

const META = (feature, src) => ({feature, requires_claim_approval: true, status: 'proposed', public_use: 'not permitted until the founder approves the specific capability shown',
  placeholder_data_only: true, separate_feature: `${feature} only. Case Mapping, Fact Review and Chronology are separate features and are never merged into one view.`,
  source_evidence: `D:/lv-frontend/motion-demo/screenshots/${src} (local product capture, 1440x1000, light theme; layout and labels followed, not redesigned)`,
  deviations: ['Typeface set to LawVriksh Sans (product wordmark rendered as mark + sans wordmark).', 'Colours mapped to library tokens; the product’s green status dot and green source glyphs are shown in thread/muted tokens.', 'Credits/plan panel omitted (pricing is not part of this composition).'],
  text_size_note: 'UI text is at product scale (11–16 CSS px at 1440 wide). Crop and enlarge so rendered text is at least 34 px on a 1080-wide frame, or use it as a non-reading visual.'});

export function build(){
  write('product/case-mapping.html', caseMap());
  write('product/chronology.html', chronology());
  write('product/case-mapping.meta.json', META('Case Mapping', '21-arora-map-root-current.png'));
  write('product/chronology.meta.json', META('Chronology', '11-chronology-expanded-corpus.png'));
  return [
    {family: 'product', id: 'case-mapping', title: 'Case Mapping (placeholder data)', role: 'product UI', size: '1440x1000', file: 'product/case-mapping.html', themes: ['paper'], skipChecks: ['minSize', 'safeArea'], requires_claim_approval: true},
    {family: 'product', id: 'chronology', title: 'Chronology (placeholder data)', role: 'product UI', size: '1440x1000', file: 'product/chronology.html', themes: ['paper'], skipChecks: ['minSize', 'safeArea'], requires_claim_approval: true}
  ];
}

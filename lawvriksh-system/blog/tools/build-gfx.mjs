// In-article graphics: 10 families x 10 variants x widths 1200 / 720 x paper / dark. Live HTML text, flat grounds.
import {write, page, schema, P, S, html, esc, tick, tickSVG, MARK} from './lib.mjs';
import {docSVG} from '../../tools/lib.mjs';

const ICON = {
  note: '<path d="M5 4h14v11l-5 5H5z"/><path d="M14 20v-5h5M8.5 9h7M8.5 12.5h4"/>',
  caution: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5.5M12 16.3v.2"/>',
  settle: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12h8"/>',
  check: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12.3l2.8 2.8L16.2 9.5"/>',
  doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 11h6M9 14.5h6M9 18h4"/>',
  court: '<path d="M3.5 9L12 4l8.5 5z"/><path d="M5 9v9M9.7 9v9M14.3 9v9M19 9v9M3 20.5h18"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  link: '<path d="M10 14l4-4"/><path d="M8.5 11.5l-2 2a3 3 0 0 0 4.2 4.2l2-2M15.5 12.5l2-2a3 3 0 0 0-4.2-4.2l-2 2"/>',
  search: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
  bookmark: '<path d="M7 3.5h10v17l-5-4-5 4z"/>'
};
const icon = (n, cls = 'g-icon') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;
const tk = `<span class="g-tick">${tickSVG()}</span>`;
const NOTE = (m, o) => `<div class="motif" data-motif="${m}" ${o || ''}></div>`;

/* ---------- block helpers ---------- */
const kick = e => `<p class="kicker" data-slot="kicker" data-optional>${esc(e.kicker || '')}</p>`;
const ttl = e => `<h2 class="g-title statement" data-slot-html="title_html" data-optional>${html(e.title_html || '')}</h2>`;
const head = e => `<div class="g-head">${kick(e)}${ttl(e)}</div>`;
const list = (slot, tag, cls, tpl, items, attrs = '') => `<${tag} class="${cls}" data-slot-list="${slot}" data-cols-auto ${attrs}><template>${tpl}</template>\n${items.join('\n')}\n</${tag}>`;
const str = (o = {}) => S({maxLength: 40, ...o});
const pad2 = i => String(i + 1).padStart(2, '0');

/* ======================= 1. process steps ======================= */
const STEPS = [{title: 'Find it', text: 'In an authorised source.'}, {title: 'Read it', text: 'The paragraph your point rests on.'}, {title: 'Match it', text: 'Court, date and parties.'}, {title: 'Note it', text: 'One line per citation.'}];
const stepProps = {kicker: P.kicker, title_html: P.title_html, steps: {type: 'array', minItems: 3, maxItems: 6, items: {type: 'object', properties: {title: str({maxLength: 24}), text: str({maxLength: 60})}, required: ['title']}}};
const psTpl = pad => `<li class="ps-i"><span class="g-badge" data-index${pad ? '-pad' : ''}></span><div class="ps-b"><p class="g-t" data-field="title"></p><p class="g-x" data-field="text" data-field-optional="text"></p></div></li>`;
const psItem = pad => (it, i) => `<li class="ps-i"><span class="g-badge" data-index${pad ? '-pad' : ''}>${pad ? pad2(i) : i + 1}</span><div class="ps-b"><p class="g-t" data-field="title">${esc(it.title)}</p><p class="g-x" data-field="text" data-field-optional="text">${esc(it.text || '')}</p></div></li>`;
const ps = (n, name, pad, vertical, maxCols = 4) => ({
  id: `process-steps-${String(n).padStart(2, '0')}-${name}`, family: 'process-steps', title: `Process steps ${n} — ${name}`, props: stepProps,
  ex: {kicker: 'Before you file', title_html: 'Four checks, <b>in this order</b>', steps: STEPS},
  build: e => `<div class="g ps ps-${n}">${head(e)}${list('steps', 'ol', 'ps-list', psTpl(pad), e.steps.map((s, i) => psItem(pad)(s, i)), vertical ? 'data-cols-max="1"' : `data-cols-max="${maxCols}" data-cols-max-narrow="2"`)}</div>`
});
const processSteps = [ps(1, 'horizontal-badges', false, false), ps(2, 'horizontal-cards', false, false), ps(3, 'horizontal-rules', true, false), ps(4, 'vertical-thread', false, true), ps(5, 'vertical-cards', false, true), ps(6, 'vertical-list', true, true), ps(7, 'horizontal-stones', false, false), ps(8, 'grid-cards', false, false, 2), ps(9, 'vertical-rail', false, true), ps(10, 'horizontal-underline', true, false)];

/* ======================= 2. checklist cards ======================= */
const ROWS = ['Found in an authorised source', 'Paragraph read and noted', 'Court, date and parties match', 'Written down, one line each'];
const ccProps = {kicker: P.kicker, title_html: P.title_html, rows: {type: 'array', minItems: 3, maxItems: 6, items: str({maxLength: 44})}, note: S({maxLength: 100})};
const ccRows = (numbered, extra = '') => list('rows', 'ul', 'cc-rows', `<li>${numbered ? '<span class="n" data-index-pad></span>' : tk}<span class="tx" data-field="text"></span></li>`, ROWS.map((r, i) => `<li>${numbered ? `<span class="n">${pad2(i)}</span>` : tk}<span class="tx">${esc(r)}</span></li>`), extra);
const noteP = e => `<p class="cc-note" data-slot="note" data-optional>${esc(e.note || '')}</p>`;
const cc = (n, name, builder, ex = {}) => ({id: `checklist-cards-${String(n).padStart(2, '0')}-${name}`, family: 'checklist-cards', title: `Checklist card ${n} — ${name}`, props: ccProps,
  ex: {kicker: 'Before you file', title_html: 'Four checks for <b>every citation</b>', rows: ROWS, note: 'About a minute per citation.', ...ex}, build: builder});
const checklistCards = [
  cc(1, 'card-rows', e => `<div class="g cc-1">${head(e)}${ccRows(false)}${noteP(e)}</div>`),
  cc(2, 'before-you-file', e => `<div class="g cc-2"><div class="gc is-raised">${kick(e)}${ttl(e)}${ccRows(false)}${noteP(e)}</div></div>`),
  cc(3, 'two-column', e => `<div class="g cc-3">${head(e)}${ccRows(false, 'data-cols-max="2" data-cols-max-narrow="1"')}${noteP(e)}</div>`),
  cc(4, 'ruled-square', e => `<div class="g cc-4">${head(e)}${ccRows(false)}${noteP(e)}</div>`),
  cc(5, 'numbered-rows', e => `<div class="g cc-5">${head(e)}${ccRows(true)}${noteP(e)}</div>`),
  cc(6, 'pill-checks', e => `<div class="g cc-6">${head(e)}${ccRows(false)}${noteP(e)}</div>`),
  cc(7, 'thread-spine', e => `<div class="g cc-7">${head(e)}${ccRows(false)}${noteP(e)}</div>`),
  cc(8, 'ink-card', e => `<div class="g cc-8"><div class="gc is-ink">${kick(e)}${ttl(e)}${ccRows(false)}${noteP(e).replace('class="cc-note"', 'class="cc-note g-muted"')}</div></div>`),
  cc(9, 'list-and-note', e => `<div class="g cc-9">${head(e)}<div class="cc9">${ccRows(false)}<div class="side"><span class="g-lbl">Note</span>${noteP(e).replace('class="cc-note"', 'class="cc-note" style="color:var(--fg)"')}</div></div></div>`),
  cc(10, 'inline-compact', e => `<div class="g cc-10">${head(e)}${ccRows(false)}${noteP(e)}</div>`)
];

/* ======================= 3. comparison ======================= */
const cardsProps = {kicker: P.kicker, title_html: P.title_html, left_label: str({maxLength: 22}), left_text: str({maxLength: 80}), right_label: str({maxLength: 22}), right_text: str({maxLength: 80})};
const cardsEx = {kicker: 'This, not that', title_html: 'Cite the paragraph, <b>not the summary</b>', left_label: 'Not this', left_text: 'The judgment says the delay was condoned.', right_label: 'This', right_text: 'Para [12]: the delay was condoned on [ground].'};
const tblProps = {kicker: P.kicker, title_html: P.title_html, left_label: str({maxLength: 22}), right_label: str({maxLength: 22}), rows: {type: 'array', minItems: 3, maxItems: 6, items: {type: 'object', properties: {left: str({maxLength: 50}), right: str({maxLength: 50})}, required: ['left', 'right']}}};
const tblEx = {kicker: 'Habits', title_html: 'From summary to <b>source</b>', left_label: 'Not this', right_label: 'This', rows: [{left: 'Cite the headnote', right: 'Cite the paragraph'}, {left: 'Trust the tool’s citation', right: 'Find it in an authorised source'}, {left: 'Assume the date', right: 'Match the date on the page'}, {left: 'Remember the parties', right: 'Copy them from the report'}]};
const cardsBlock = (e, {strike = false, quiet = true} = {}) => [`<div class="gc ${quiet ? 'cmp-q' : ''}"><span class="g-pill is-outline" data-slot="left_label">${esc(e.left_label)}</span><p class="g-x${strike ? ' cmp-strike' : ''}" data-slot="left_text">${esc(e.left_text)}</p></div>`, `<div class="gc is-raised"><span class="g-pill is-accent" data-slot="right_label">${esc(e.right_label)}</span><p class="g-t" data-slot="right_text" style="font-weight:500">${esc(e.right_text)}</p></div>`];
const tblRows = (e, cls = '') => e.rows.map(r => `<tr><td class="q">${esc(r.left)}</td><td>${esc(r.right)}</td></tr>`).join('\n');
const tblBody = (e, rowFn) => `<tbody data-slot-list="rows"><template>${rowFn.tpl}</template>\n${e.rows.map(rowFn.row).join('\n')}\n</tbody>`;
const T1 = {tpl: '<tr><td class="q" data-field="left"></td><td data-field="right"></td></tr>', row: r => `<tr><td class="q" data-field="left">${esc(r.left)}</td><td data-field="right">${esc(r.right)}</td></tr>`};
const T8 = {tpl: '<tr><td><div class="mk"><span class="no" aria-hidden="true"></span><span class="q" data-field="left"></span></div></td><td><div class="mk">' + tk + '<span data-field="right"></span></div></td></tr>', row: r => `<tr><td><div class="mk"><span class="no" aria-hidden="true"></span><span class="q" data-field="left" style="color:var(--fg-muted)">${esc(r.left)}</span></div></td><td><div class="mk">${tk}<span data-field="right">${esc(r.right)}</span></div></td></tr>`};
const table = (e, rf, cls) => `<table class="cmp-t ${cls || ''}"><thead><tr><th data-slot="left_label">${esc(e.left_label)}</th><th data-slot="right_label">${esc(e.right_label)}</th></tr></thead>${tblBody(e, rf)}</table>`;
const cmp = (n, name, flavor, builder) => ({id: `comparison-${String(n).padStart(2, '0')}-${name}`, family: 'comparison', title: `Comparison ${n} — ${name}`, props: flavor === 'cards' ? cardsProps : tblProps, ex: flavor === 'cards' ? cardsEx : tblEx, build: builder});
const comparison = [
  cmp(1, 'side-by-side-link', 'cards', e => { const [a, b] = cardsBlock(e); return `<div class="g cmp-1">${head(e)}<div class="cmp-pair">${a}<div class="cmp-lk" aria-hidden="true"></div>${b}</div></div>`; }),
  cmp(2, 'stacked-link', 'cards', e => { const [a, b] = cardsBlock(e); return `<div class="g cmp-2">${head(e)}<div class="cmp-stack">${a}<div class="cmp-vlk" aria-hidden="true"></div>${b}</div></div>`; }),
  cmp(3, 'split-panel', 'cards', e => `<div class="g cmp-3">${head(e)}<div class="cmp-split"><div class="l"><span class="g-pill is-outline" data-slot="left_label">${esc(e.left_label)}</span><p class="g-x" data-slot="left_text">${esc(e.left_text)}</p></div><div class="r"><span class="g-pill is-accent" data-slot="right_label">${esc(e.right_label)}</span><p class="g-t" data-slot="right_text" style="font-weight:500">${esc(e.right_text)}</p></div></div></div>`),
  cmp(4, 'struck-left', 'cards', e => { const [a, b] = cardsBlock(e, {strike: true}); return `<div class="g cmp-4">${head(e)}<div class="cmp-pair">${a}<div class="cmp-lk" aria-hidden="true"></div>${b}</div></div>`; }),
  cmp(5, 'paragraph-and-sentence', 'cards', e => `<div class="g cmp-5">${head(e)}<div class="cmp-pair"><div class="gc is-raised"><span class="g-lbl" data-slot="left_label">${esc(e.left_label)}</span>${docSVG({w: 360, h: 120, kind: 'notes', highlight: true, seed: 3, shadow: false}).replace('<svg ', '<svg class="g-minidoc" style="width:100%;height:auto" ')}<p class="g-x" data-slot="left_text">${esc(e.left_text)}</p></div><div class="cmp-lk" aria-hidden="true"></div><div class="gc is-ink"><span class="g-lbl" data-slot="right_label" style="color:var(--on-ink-accent)">${esc(e.right_label)}</span><p class="g-t" data-slot="right_text" style="font-weight:500">${esc(e.right_text)}</p></div></div></div>`),
  cmp(6, 'table-plain', 'table', e => `<div class="g cmp-6">${head(e)}${table(e, T1)}</div>`),
  cmp(7, 'table-banded', 'table', e => `<div class="g cmp-7">${head(e)}${table(e, T1)}</div>`),
  cmp(8, 'table-marks', 'table', e => `<div class="g cmp-8">${head(e)}${table(e, T8)}</div>`),
  cmp(9, 'row-cards', 'table', e => `<div class="g cmp-9">${head(e)}<div class="heads"><p class="g-lbl" data-slot="left_label">${esc(e.left_label)}</p><p class="g-lbl" data-slot="right_label">${esc(e.right_label)}</p></div>${list('rows', 'div', 'rows9', '<div class="r9"><div class="a" data-field="left"></div><div class="b" data-field="right"></div></div>', e.rows.map(r => `<div class="r9"><div class="a" data-field="left">${esc(r.left)}</div><div class="b" data-field="right">${esc(r.right)}</div></div>`), 'data-cols-max="1"')}</div>`),
  cmp(10, 'table-compact', 'table', e => `<div class="g cmp-10">${head(e)}${table(e, T1)}</div>`)
];

/* ======================= 4. timeline ======================= */
const EVENTS = [{date: '[date]', title: '[First event]', text: 'Recorded in [source].'}, {date: '[date]', title: '[Second event]', text: 'Recorded in [source].'}, {date: '[date]', title: '[Third event]', text: 'Recorded in [source].'}, {date: '[date]', title: '[Fourth event]', text: 'Recorded in [source].'}];
const tlProps = {kicker: P.kicker, title_html: P.title_html, events: {type: 'array', minItems: 3, maxItems: 6, items: {type: 'object', properties: {date: str({maxLength: 16}), title: str({maxLength: 28}), text: str({maxLength: 60})}, required: ['date', 'title']}}};
const tlTpl = '<li class="tl-i"><p class="tl-d" data-field="date"></p><div class="tl-m"><span class="tl-dot"></span></div><div class="tl-b"><p class="g-t" data-field="title"></p><p class="g-x" data-field="text" data-field-optional="text"></p></div></li>';
const tlItem = (e, i) => `<li class="tl-i"><p class="tl-d" data-field="date">${esc(e.date)}</p><div class="tl-m"><span class="tl-dot"></span></div><div class="tl-b"><p class="g-t" data-field="title">${esc(e.title)}</p><p class="g-x" data-field="text" data-field-optional="text">${esc(e.text || '')}</p></div></li>`;
const tl = (n, name, horizontal, maxCols = 3) => ({id: `timeline-${String(n).padStart(2, '0')}-${name}`, family: 'timeline', title: `Timeline ${n} — ${name}`, props: tlProps,
  ex: {kicker: 'Sequence', title_html: 'What happened, <b>in order</b>', events: EVENTS},
  build: e => `<div class="g tl tl-${n}${horizontal ? ' tl-h' : ''}">${head(e)}${list('events', 'ol', 'tl-list', tlTpl, e.events.map(tlItem), horizontal ? `data-cols-max="${maxCols}" data-cols-max-narrow="2"` : 'data-cols-max="1"')}</div>`});
const timelines = [tl(1, 'vertical-thread', false), tl(2, 'vertical-cards', false), tl(3, 'horizontal-thread', true, 4), tl(4, 'horizontal-cards', true, 4), tl(5, 'dated-list', false), tl(6, 'pending-last', false), tl(7, 'stepped', false), tl(8, 'date-chips', false), tl(9, 'milestone-grid', true, 2), tl(10, 'compact-thread', false)];

/* ======================= 5. document callouts ======================= */
const dcPage = (kind, seed, o = {}) => `<div class="dc-page" data-deco aria-hidden="true">${docSVG({w: 420, h: 540, kind, seed, highlight: true, shadow: true, ...o})}</div>`;
const dcProps = {kicker: P.kicker, title_html: P.title_html, pinpoint: str({maxLength: 56, description: 'Pinpoint, e.g. “[Court], [date], para [n]”.'}), callout: S({maxLength: 120})};
const dcEx = {kicker: 'Pinpoint it', title_html: 'Mark the paragraph, <b>then cite it</b>', pinpoint: '[Court], [date], para [n]', callout: 'Note the paragraph number beside the authority in your draft.'};
const vsProps = {kicker: P.kicker, title_html: P.title_html, draft_label: str({maxLength: 28}), source_label: str({maxLength: 28}), callout: S({maxLength: 120})};
const vsEx = {kicker: 'Side by side', title_html: 'Your sentence, <b>its source</b>', draft_label: 'Your draft', source_label: 'The source paragraph', callout: 'Your sentence should say no more than the paragraph does.'};
const note = (e, extra = '') => `<div class="dc-note"><span class="dc-pin"><span data-slot="pinpoint">${esc(e.pinpoint)}</span></span><p class="g-t" data-slot="callout" style="font-weight:500">${esc(e.callout)}</p>${extra}</div>`;
const dc = (n, name, flavor, builder) => ({id: `document-callouts-${String(n).padStart(2, '0')}-${name}`, family: 'document-callouts', title: `Document callout ${n} — ${name}`, props: flavor === 'vs' ? vsProps : dcProps, ex: flavor === 'vs' ? vsEx : dcEx, build: builder});
const vsFig = (e, kind, seed, label, slot, hl = true) => `<figure>${dcPage(kind, seed, {highlight: hl}).replace('class="dc-page"', 'class="dc-page" style="max-width:420px"')}<figcaption class="g-lbl" data-slot="${slot}">${esc(label)}</figcaption></figure>`;
const documentCallouts = [
  dc(1, 'page-and-note', 'callout', e => `<div class="g dc-1">${head(e)}<div class="dc-stage">${dcPage('judgment', 3)}${note(e)}</div></div>`),
  dc(2, 'draft-vs-source', 'vs', e => `<div class="g dc-2">${head(e)}<div class="dc-two">${vsFig(e, 'draft', 11, e.draft_label, 'draft_label')}<div class="dc-lk" aria-hidden="true"></div>${vsFig(e, 'judgment', 3, e.source_label, 'source_label')}</div><p class="g-t" data-slot="callout" style="font-weight:500">${esc(e.callout)}</p></div>`),
  dc(3, 'margin-and-chip', 'callout', e => `<div class="g dc-3">${head(e)}<div class="dc-stage">${note(e).replace('<div class="dc-note">', '<div class="dc-note"><span class="dc-pin" style="background:var(--clay-dark);color:var(--surface)" aria-hidden="true">[1]</span>')}${dcPage('report', 8)}</div></div>`),
  dc(4, 'stacked-pages', 'callout', e => `<div class="g dc-4">${head(e)}<div class="dc-stage"><div class="dc-page" data-deco aria-hidden="true" style="padding:0 0 0 0;position:relative">${docSVG({w: 380, h: 480, kind: 'draft', seed: 7, highlight: false, shadow: true}).replace('<svg ', '<svg style="width:84%;transform:rotate(-4deg)" ')}<div style="position:absolute;right:0;top:12%;width:84%">${docSVG({w: 380, h: 480, kind: 'judgment', seed: 2, shadow: true}).replace('<svg ', '<svg style="width:100%;transform:rotate(3deg)" ')}</div></div>${note(e)}</div></div>`),
  dc(5, 'connected-note', 'callout', e => `<div class="g dc-5">${head(e)}<div class="dc-stage">${dcPage('judgment', 5)}<div class="dc-note" style="border-left:4px solid var(--thread);padding-left:calc(var(--gap)*1.1);position:relative"><span class="dc-pin"><span data-slot="pinpoint">${esc(e.pinpoint)}</span></span><p class="g-t" data-slot="callout" style="font-weight:500">${esc(e.callout)}</p></div></div></div>`),
  dc(6, 'open-report', 'callout', e => `<div class="g dc-6">${head(e)}<div class="dc-stage"><div class="dc-page" data-deco aria-hidden="true" style="height:calc(var(--badge)*4.2);position:relative">${NOTE('open-book', 'style="position:absolute;inset:0"')}</div>${note(e)}</div></div>`),
  { ...dc(7, 'numbered-pins', 'callout', e => `<div class="g dc-7">${head(e)}<div class="dc-stage">${dcPage('judgment', 4)}<div class="dc-note"><span class="dc-pin"><span data-slot="pinpoint">${esc(e.pinpoint)}</span></span>${list('pins', 'ol', 'dc-pins', '<li><span class="g-badge" data-index style="width:calc(var(--fs)*1.6);height:calc(var(--fs)*1.6);font-size:var(--fs)"></span><span data-field="text"></span></li>', e.pins.map((t, i) => `<li><span class="g-badge" data-index style="width:calc(var(--fs)*1.6);height:calc(var(--fs)*1.6);font-size:var(--fs)">${i + 1}</span><span data-field="text">${esc(t)}</span></li>`), 'data-cols-max="1"')}<p class="g-t" data-slot="callout" style="font-weight:500">${esc(e.callout)}</p></div></div></div>`),
    props: {...dcProps, pins: {type: 'array', minItems: 1, maxItems: 3, items: str({maxLength: 40})}}, ex: {...dcEx, pins: ['Find the paragraph', 'Mark it', 'Cite it']} },
  dc(8, 'draft-vs-source-verdict', 'vs', e => `<div class="g dc-8">${head(e)}<div class="dc-two">${vsFig(e, 'draft', 13, e.draft_label, 'draft_label')}<div class="dc-lk" aria-hidden="true"></div>${vsFig(e, 'judgment', 6, e.source_label, 'source_label')}</div><div class="dc-verdict">${tk}<p class="g-t" data-slot="callout" style="font-weight:500">${esc(e.callout)}</p></div></div>`),
  dc(9, 'filing-page', 'callout', e => `<div class="g dc-9">${head(e)}<div class="dc-stage">${dcPage('filing', 9, {highlight: false})}${note(e)}</div></div>`),
  dc(10, 'page-and-source-line', 'callout', e => `<div class="g dc-10">${head(e)}<div class="dc-stage">${dcPage('notes', 12)}<div class="dc-note"><p class="g-t" data-slot="callout" style="font-weight:500">${esc(e.callout)}</p><hr class="g-rule"><span class="dc-pin"><span data-slot="pinpoint">${esc(e.pinpoint)}</span></span></div></div></div>`)
];

/* ======================= 6. definition and key-term boxes ======================= */
const dfProps = {label: str({maxLength: 28}), term: str({maxLength: 30}), pos: str({maxLength: 16}), meaning_html: S({maxLength: 160, pattern: '^(?!.*<(?!/?b>|br ?/?>)).*$'}), note_label: str({maxLength: 28}), note: S({maxLength: 110})};
const dfEx = {label: 'Key term', term: 'Authorised source', pos: 'noun', meaning_html: 'A place where a judgment is published by the court or an official reporter, and can be <b>read in full</b>.', note_label: 'In practice', note: 'If you cannot find it there, it is not ready to file.'};
const dfParts = e => ({
  label: `<span class="g-lbl" data-slot="label">${esc(e.label)}</span>`, term: `<p class="df-term" data-slot="term">${esc(e.term)}</p>`, pos: `<p class="df-pos" data-slot="pos">${esc(e.pos)}</p>`,
  mean: `<p class="df-m" data-slot-html="meaning_html">${html(e.meaning_html)}</p>`, nl: `<span class="g-lbl" data-slot="note_label">${esc(e.note_label)}</span>`, note: `<p class="df-m" data-slot="note" style="color:var(--fg-muted)">${esc(e.note)}</p>`
});
const df = (n, name, builder, props = dfProps, ex = dfEx) => ({id: `definition-boxes-${String(n).padStart(2, '0')}-${name}`, family: 'definition-boxes', title: `Definition box ${n} — ${name}`, props, ex, build: builder});
const definitionBoxes = [
  df(1, 'card', e => { const p = dfParts(e); return `<div class="g df-1"><div class="gc is-raised" style="display:flex;flex-direction:column;gap:var(--gap)">${p.label}${p.term}${p.pos}${p.mean}<hr class="g-rule">${p.nl}${p.note}</div></div>`; }),
  df(2, 'term-column', e => { const p = dfParts(e); return `<div class="g df-2"><div class="l">${p.label}${p.term}${p.pos}</div><div style="display:flex;flex-direction:column;gap:var(--gap)">${p.mean}${p.nl}${p.note}</div></div>`; }),
  df(3, 'thread-underline', e => { const p = dfParts(e); return `<div class="g df-3">${p.label}${p.term}${p.pos}${p.mean}${p.nl}${p.note}</div>`; }),
  df(4, 'dictionary', e => { const p = dfParts(e); return `<div class="g df-4"><div class="gc" style="display:flex;flex-direction:column;gap:calc(var(--gap)*.6)"><div style="display:flex;align-items:baseline;gap:var(--gap);flex-wrap:wrap">${p.term}${p.pos}</div>${p.label}${p.mean}<hr class="g-rule">${p.nl}${p.note}</div></div>`; }),
  df(5, 'chip-term', e => { const p = dfParts(e); return `<div class="g df-5">${p.label}<span class="chip" data-slot="term">${esc(e.term)}</span>${p.pos}<div class="gc" style="display:flex;flex-direction:column;gap:calc(var(--gap)*.6)">${p.mean}${p.nl}${p.note}</div></div>`; }),
  df(6, 'with-object', e => { const p = dfParts(e); return `<div class="g df-6"><div style="display:flex;flex-direction:column;gap:var(--gap)">${p.label}${p.term}${p.pos}${p.mean}${p.nl}${p.note}</div><div class="obj" data-deco aria-hidden="true">${NOTE('reports')}</div></div>`; }),
  df(7, 'not-to-be-confused', e => { const p = dfParts(e); return `<div class="g df-7">${p.label}${p.term}${p.pos}${p.mean}<div class="nb">${p.nl}${p.note}</div></div>`; }),
  df(8, 'inline', e => { const p = dfParts(e); return `<div class="g df-8"><div style="display:flex;flex-direction:column;gap:calc(var(--gap)*.5);flex:1">${p.label}<div style="display:flex;align-items:baseline;gap:calc(var(--gap)*.6);flex-wrap:wrap">${p.term}${p.pos}</div>${p.mean}${p.nl}${p.note}</div></div>`; }),
  df(9, 'ink-card', e => { const p = dfParts(e); return `<div class="g df-9"><div class="gc is-ink" style="display:flex;flex-direction:column;gap:var(--gap)">${p.label.replace('class="g-lbl"', 'class="g-lbl" style="color:var(--on-ink-accent)"')}${p.term}${p.pos.replace('class="df-pos"', 'class="df-pos" style="color:var(--on-ink-muted)"')}${p.mean}${p.nl.replace('class="g-lbl"', 'class="g-lbl" style="color:var(--on-ink-accent)"')}${p.note.replace('style="color:var(--fg-muted)"', 'style="color:var(--on-ink-muted)"')}</div></div>`; }),
  df(10, 'two-terms', e => `<div class="g df-10">${kick(e)}${ttl(e)}${list('terms', 'ul', 'terms', '<li><p class="t" data-field="term"></p><p class="df-m" data-field="meaning" style="color:var(--fg-muted)"></p></li>', e.terms.map(t => `<li><p class="t" data-field="term">${esc(t.term)}</p><p class="df-m" data-field="meaning" style="color:var(--fg-muted)">${esc(t.meaning)}</p></li>`), 'data-cols-max="2" data-cols-max-narrow="1"')}</div>`,
    {kicker: P.kicker, title_html: P.title_html, terms: {type: 'array', minItems: 2, maxItems: 4, items: {type: 'object', properties: {term: str({maxLength: 28}), meaning: str({maxLength: 90})}, required: ['term', 'meaning']}}},
    {kicker: 'Two terms', title_html: 'Words that <b>sound alike</b>', terms: [{term: 'Headnote', meaning: 'A short summary written for readers. It is not the court’s words.'}, {term: 'Paragraph', meaning: 'The numbered text of the judgment itself.'}]})
];

/* ======================= 7. callout and note boxes ======================= */
const coProps = {label: str({maxLength: 30}), body_html: S({maxLength: 150, pattern: '^(?!.*<(?!/?b>|br ?/?>)).*$'})};
const coRowsProps = {label: str({maxLength: 30}), body_html: coProps.body_html, rows: {type: 'array', minItems: 1, maxItems: 4, items: str({maxLength: 56})}};
const coEx = {label: 'Note', body_html: 'A tool can <b>find and sort</b>. Whether a case helps your client is still your call.'};
const coRowsEx = {label: 'What this does not settle', body_html: 'The checks show a citation exists and says what you wrote.', rows: ['Whether it has been overruled', 'Whether it fits your facts']};
const coLbl = (e, c = '') => `<span class="g-lbl ${c}" data-slot="label">${esc(e.label)}</span>`;
const coBody = e => `<p class="co-body" data-slot-html="body_html">${html(e.body_html)}</p>`;
const coRows = e => list('rows', 'ul', 'co-rows', '<li data-field="text"></li>', (e.rows || []).map(r => `<li>${esc(r)}</li>`), 'data-cols-max="1"');
const co = (n, name, builder, rows = false) => ({id: `callout-boxes-${String(n).padStart(2, '0')}-${name}`, family: 'callout-boxes', title: `Callout box ${n} — ${name}`, props: rows ? coRowsProps : coProps, ex: rows ? coRowsEx : coEx, build: builder});
const calloutBoxes = [
  co(1, 'note-bar', e => `<div class="g"><div class="co-1 co-b">${coLbl(e)}${coBody(e)}</div></div>`),
  co(2, 'note-icon', e => `<div class="g"><div class="gc co-2">${icon('note', 'g-icon g-ico-lg')}<div class="co-b">${coLbl(e)}${coBody(e)}</div></div></div>`),
  co(3, 'caution', e => `<div class="g"><div class="gc co-2">${icon('caution', 'g-icon g-ico-lg')}<div class="co-b">${coLbl(e)}${coBody(e)}</div></div></div>`.replace('<div class="gc co-2">', '<div class="gc co-2 is-raised">')),
  co(4, 'does-not-settle', e => `<div class="g"><div class="gc co-b" style="gap:var(--gap)">${coLbl(e)}${coBody(e)}<hr class="g-rule">${coRows(e)}</div></div>`, true),
  co(5, 'outlined', e => `<div class="g"><div class="co-5 co-b">${coLbl(e)}${coBody(e)}</div></div>`),
  co(6, 'ink-card', e => `<div class="g"><div class="gc is-ink co-b">${coLbl(e, '').replace('class="g-lbl "', 'class="g-lbl" style="color:var(--on-ink-accent)"')}${coBody(e)}</div></div>`),
  co(7, 'thread-dot', e => `<div class="g"><div class="co-7 co-b">${coLbl(e)}${coBody(e)}</div></div>`),
  co(8, 'tab-label', e => `<div class="g"><div class="co-8"><span class="tab" data-slot="label">${esc(e.label)}</span><div class="gc is-raised co-b">${coBody(e)}</div></div></div>`),
  co(9, 'icon-column', e => `<div class="g"><div class="co-9"><span class="col">${icon('settle', 'g-icon g-ico-lg')}</span><div class="co-b" style="flex:1">${coLbl(e)}${coBody(e)}${coRows(e)}</div></div></div>`, true),
  co(10, 'hatch-strip', e => `<div class="g"><div class="co-10"><div class="strip" data-deco aria-hidden="true"></div><div class="gc co-b">${coLbl(e)}${coBody(e)}</div></div></div>`)
];

/* ======================= 8. pull statement ======================= */
const pqProps = {kicker: P.kicker, statement_html: S({maxLength: 120, pattern: '^(?!.*<(?!/?b>|br ?/?>)).*$', description: 'One sentence from the article. No quotation marks; never attributed to a person.'})};
const pqEx = {kicker: 'The point', statement_html: 'A citation that <b>reads well</b> is not yet a citation you have checked.'};
const pqS = e => `<p class="pq-s" data-slot-html="statement_html">${html(e.statement_html)}</p>`;
const pq = (n, name, builder, withMotif = false) => ({id: `pull-statements-${String(n).padStart(2, '0')}-${name}`, family: 'pull-statements', title: `Pull statement ${n} — ${name}`, props: withMotif ? {...pqProps, motif: P.motif} : pqProps, ex: withMotif ? {...pqEx, motif: 'open-book'} : pqEx, build: builder});
const pullStatements = [
  pq(1, 'clay-bar', e => `<div class="g pq-1">${kick(e)}${pqS(e)}</div>`),
  pq(2, 'between-threads', e => `<div class="g pq-2"><div class="g-thread" aria-hidden="true"></div>${kick(e)}${pqS(e)}<div class="g-thread" aria-hidden="true"></div></div>`),
  pq(3, 'plain-large', e => `<div class="g pq-3">${kick(e)}${pqS(e)}</div>`),
  pq(4, 'ink-card', e => `<div class="g pq-4"><div class="gc is-ink" style="display:flex;flex-direction:column;gap:var(--gap)">${kick(e).replace('class="kicker"', 'class="kicker" style="color:var(--on-ink-accent)"')}${pqS(e)}</div></div>`),
  pq(5, 'card-with-node', e => `<div class="g pq-5"><div class="gc is-raised" style="display:flex;flex-direction:column;gap:var(--gap)">${kick(e)}${pqS(e)}</div></div>`),
  pq(6, 'with-object', e => `<div class="g pq-6"><div style="display:flex;flex-direction:column;gap:var(--gap)">${kick(e)}${pqS(e)}</div><div class="obj" data-deco aria-hidden="true"><div class="motif" data-motif="${e.motif}"></div></div></div>`, true),
  pq(7, 'underlined-phrase', e => `<div class="g pq-7">${kick(e)}${pqS(e)}</div>`),
  pq(8, 'paragraph-mark', e => `<div class="g pq-8"><span class="mk" aria-hidden="true">¶</span><div style="display:flex;flex-direction:column;gap:var(--gap)">${kick(e)}${pqS(e)}</div></div>`),
  pq(9, 'thread-top', e => `<div class="g pq-9">${kick(e)}${pqS(e)}</div>`),
  pq(10, 'minimal', e => `<div class="g pq-10">${kick(e)}${pqS(e)}</div>`)
];

/* ======================= 9. source and citation lines ======================= */
const slProps = {court: str({maxLength: 40}), date: str({maxLength: 24}), parties: str({maxLength: 56}), para: str({maxLength: 16})};
const slEx = {court: '[Court]', date: '[date]', parties: '[Party] v [Party]', para: '[para]'};
const sv = (k, e) => `<span class="v" data-slot="${k}">${esc(e[k])}</span>`;
const sl = (n, name, builder, props = slProps, ex = slEx) => ({id: `source-lines-${String(n).padStart(2, '0')}-${name}`, family: 'source-lines', title: `Source line ${n} — ${name}`, props, ex, build: builder});
const sep = '<span class="sep" aria-hidden="true"></span>';
const slotP = (k, e, cls = 'v') => `<span class="${cls}" data-slot="${k}">${esc(e[k])}</span>`;
const sourceLines = [
  sl(1, 'inline-dots', e => `<div class="g"><div class="sl-1">${slotP('court', e)}${sep}${slotP('date', e)}${sep}${slotP('parties', e)}${sep}<span>para </span>${slotP('para', e)}</div></div>`),
  sl(2, 'chips', e => `<div class="g"><div class="sl-chips"><span class="sl-chip"><span class="k">Court</span>${slotP('court', e, 'sl-v')}</span><span class="sl-chip"><span class="k">Date</span>${slotP('date', e, 'sl-v')}</span><span class="sl-chip"><span class="k">Parties</span>${slotP('parties', e, 'sl-v')}</span><span class="sl-chip"><span class="k">Para</span>${slotP('para', e, 'sl-v')}</span></div></div>`),
  sl(3, 'label-value', e => `<div class="g"><dl class="sl-3"><dt>Court</dt><dd>${slotP('court', e, 'sl-v')}</dd><dt>Date</dt><dd>${slotP('date', e, 'sl-v')}</dd><dt>Parties</dt><dd>${slotP('parties', e, 'sl-v')}</dd><dt>Para</dt><dd>${slotP('para', e, 'sl-v')}</dd></dl></div>`),
  sl(4, 'four-columns', e => `<div class="g"><div class="sl-4"><div><span class="k">Court</span>${slotP('court', e, 'sl-v')}</div><div><span class="k">Date</span>${slotP('date', e, 'sl-v')}</div><div><span class="k">Parties</span>${slotP('parties', e, 'sl-v')}</div><div><span class="k">Para</span>${slotP('para', e, 'sl-v')}</div></div></div>`),
  sl(5, 'pinpoint-chip', e => `<div class="g"><div class="sl-1">${slotP('parties', e)}${sep}${slotP('court', e)}${sep}${slotP('date', e)}<span class="dc-pin"><span>para </span>${slotP('para', e, 'sl-v')}</span></div></div>`),
  sl(6, 'table-row', e => `<div class="g"><div class="sl-6"><span class="sl-v" data-slot="parties">${esc(e.parties)}</span><span class="sl-v" data-slot="court">${esc(e.court)}</span><span class="sl-v" data-slot="date">${esc(e.date)}</span><span class="sl-v"><span style="color:var(--accent)">para </span><span data-slot="para">${esc(e.para)}</span></span></div></div>`),
  sl(7, 'numbered-source', e => `<div class="g"><div class="sl-7"><span class="n">1</span><span>${slotP('parties', e, 'sl-v')}, ${slotP('court', e, 'sl-v')}, ${slotP('date', e, 'sl-v')}, para ${slotP('para', e, 'sl-v')}</span></div></div>`),
  sl(8, 'two-sources', e => `<div class="g sl-8">${list('sources', 'ol', '', '<li><span class="sl-v" data-field="parties"></span><span data-field="court"></span><span data-field="date"></span><span class="v">para <span data-field="para"></span></span></li>', e.sources.map(s => `<li><span class="sl-v" data-field="parties">${esc(s.parties)}</span><span data-field="court">${esc(s.court)}</span><span data-field="date">${esc(s.date)}</span><span class="v">para <span data-field="para">${esc(s.para)}</span></span></li>`), 'data-cols-max="1"')}</div>`,
    {sources: {type: 'array', minItems: 1, maxItems: 3, items: {type: 'object', properties: {court: str({maxLength: 40}), date: str({maxLength: 24}), parties: str({maxLength: 56}), para: str({maxLength: 16})}, required: ['court', 'date', 'parties', 'para']}}},
    {sources: [{court: '[Court]', date: '[date]', parties: '[Party] v [Party]', para: '[para]'}, {court: '[Court]', date: '[date]', parties: '[Party] v [Party]', para: '[para]'}]}),
  sl(9, 'mark-bar', e => `<div class="g"><div class="sl-9"><span class="mk"><img src="${MARK}" alt=""></span><div class="tx">${slotP('parties', e, 'sl-v')}${slotP('court', e)}${slotP('date', e)}<span>para </span>${slotP('para', e, 'sl-v')}</div></div></div>`),
  sl(10, 'tag-line', e => `<div class="g"><div class="sl-chips"><span class="g-pill">${slotP('court', e, 'sl-v').replace('class="sl-v"', 'style="font-weight:500"')}</span><span class="g-pill is-outline">${slotP('date', e, 'sl-v').replace('class="sl-v"', '')}</span><span class="g-pill is-outline">${slotP('parties', e, 'sl-v').replace('class="sl-v"', '')}</span><span class="g-pill is-accent">para ${slotP('para', e, 'sl-v').replace('class="sl-v"', '')}</span></div></div>`)
];

/* ======================= 10. section dividers and end-of-article CTA blocks ======================= */
const dvProps = {label: str({maxLength: 36}), number: S({maxLength: 3})};
const dvEx = {label: 'Part two', number: '02'};
const ctaProps = {title_html: P.title_html, body_html: P.body_html, button: str({maxLength: 30}), note: S({maxLength: 90}), link: S({maxLength: 60, description: 'Tracked link: shown as the link text and set as the button/link href (use a full URL or a path).'})};
const ctaEx = {title_html: 'One practice note, <b>every week</b>', body_html: 'Short, checkable habits for individual advocates.', button: 'Follow LawVriksh', note: 'Save this for your next filing.', link: 'lawvriksh.com/[tracked-path]'};
const ctaBits = e => ({
  t: `<h2 class="cta-t statement" data-slot-html="title_html">${html(e.title_html)}</h2>`, b: `<p class="g-x" data-slot-html="body_html" data-optional>${html(e.body_html)}</p>`,
  btn: `<a class="cta-btn" href="#" data-slot="button">${esc(e.button)}</a>`, n: `<p class="g-x" data-slot="note" data-optional>${esc(e.note)}</p>`, l: `<a class="cta-link" href="#" data-slot="link" data-slot-href="link">${esc(e.link)}</a>`
});
const dvLabelOnly = {label: dvProps.label};
const dv = (n, name, builder, cta = false) => ({id: `dividers-cta-${String(n).padStart(2, '0')}-${name}`, family: 'dividers-cta', title: `${cta ? 'CTA block' : 'Divider'} ${n} — ${name}`, props: cta ? ctaProps : (n === 2 ? dvProps : dvLabelOnly), ex: cta ? ctaEx : (n === 2 ? dvEx : {label: dvEx.label}), build: builder});
const dividersCta = [
  dv(1, 'thread-nodes', e => `<div class="g dv-1"><div class="dv-line"><span class="node" aria-hidden="true"></span><span class="dv-lbl" data-slot="label">${esc(e.label)}</span><span class="node" aria-hidden="true"></span></div></div>`),
  dv(2, 'numbered-section', e => `<div class="g dv-2"><span class="no" data-slot="number">${esc(e.number)}</span><div class="rest"><span class="dv-lbl" data-slot="label" style="text-align:left">${esc(e.label)}</span><div class="g-thread" aria-hidden="true"></div></div></div>`),
  dv(3, 'with-icon', e => `<div class="g dv-3"><div class="dv-line">${icon('doc', 'g-icon ic')}<span class="dv-lbl" data-slot="label">${esc(e.label)}</span></div></div>`),
  dv(4, 'dotted-thread', e => `<div class="g dv-4"><span class="dv-lbl" data-slot="label">${esc(e.label)}</span><div class="dots" aria-hidden="true"></div></div>`),
  dv(5, 'short-thread', e => `<div class="g dv-5"><div class="g-thread" aria-hidden="true"></div><span class="dv-lbl" data-slot="label">${esc(e.label)}</span></div>`),
  dv(6, 'ink-card', e => { const c = ctaBits(e); return `<div class="g cta-6"><div class="gc is-ink">${c.t}${c.b}${c.btn}${c.n}${c.l}</div></div>`; }, true),
  dv(7, 'with-object', e => { const c = ctaBits(e); return `<div class="g cta-7"><div class="gc is-raised"><div class="row7"><div style="display:flex;flex-direction:column;gap:calc(var(--gap)*.8)">${c.t}${c.b}${c.btn}${c.n}${c.l}</div><div class="obj" data-deco aria-hidden="true"><div class="motif" data-motif="reports"></div></div></div></div></div>`; }, true),
  dv(8, 'inline-row', e => { const c = ctaBits(e); return `<div class="g cta-8"><div class="l">${c.t}${c.b}${c.n}${c.l}</div>${c.btn}</div>`; }, true),
  dv(9, 'stacked-card', e => { const c = ctaBits(e); return `<div class="g cta-9"><div class="gc">${c.t}${c.b}${c.btn}${c.n}${c.l}</div></div>`; }, true),
  dv(10, 'series-follow', e => { const c = ctaBits(e); return `<div class="g cta-10"><div class="gc is-raised"><div class="head10"><span class="mk"><img src="${MARK}" alt=""></span><span class="g-lbl">LawVriksh</span></div>${c.t}${c.b}${c.btn}${c.n}${c.l}</div></div>`; }, true)
];

export const FAMILIES = [
  ['process-steps', 'Process steps', processSteps], ['checklist-cards', 'Checklist cards', checklistCards], ['comparison', 'Comparison', comparison], ['timeline', 'Timeline', timelines],
  ['document-callouts', 'Document callouts', documentCallouts], ['definition-boxes', 'Definition and key-term boxes', definitionBoxes], ['callout-boxes', 'Callout and note boxes', calloutBoxes],
  ['pull-statements', 'Pull statements', pullStatements], ['source-lines', 'Source and citation lines', sourceLines], ['dividers-cta', 'Section dividers and CTA blocks', dividersCta]
];

export function build(){
  const out = [];
  for (const [fam, famTitle, vs] of FAMILIES) for (const v of vs) {
    const ex = {theme: 'paper', ...v.ex};
    write(`graphics/${v.id}.schema.json`, schema(`graphics/${v.id}`, v.title, v.props, []));
    write(`graphics/${v.id}.example.json`, ex);
    for (const w of [1200, 720]) {
      write(`graphics/${v.id}-${w}.html`, page({title: `LawVriksh blog graphic — ${v.title} (${w})`, id: `blog/graphics/${v.id}-${w}`, size: `${w}x600`, format: `gfx${w}`, css: ['graphics.css'], body: v.build(ex), meta: {role: 'in-article graphic', family: fam}}));
      out.push({family: 'graphics', kind: 'graphic', group: fam, groupTitle: famTitle, width: w, id: `${v.id}-${w}`, variant: v.id, title: `${v.title} · ${w}`, size: `${w}x600`, file: `graphics/${v.id}-${w}.html`, schema: `graphics/${v.id}.schema.json`, example: `graphics/${v.id}.example.json`, slots: Object.keys(v.props)});
    }
  }
  return out;
}

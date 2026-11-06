// Blog thumbnails: 10 templates x 3 sizes (og 1200x630, sq 1080x1080, pt 1080x1350). Dark and paper via data-theme.
import {write, page, schema, P, S, html, esc, tick, MARK} from './lib.mjs';

const FIT = {og: {max: 96, min: 64, lines: 4}, sq: {max: 112, min: 72, lines: 5}, pt: {max: 120, min: 80, lines: 6}};
const SIZE = {og: '1200x630', sq: '1080x1080', pt: '1080x1350'};
const foot = e => `<footer class="bt-foot"><span class="mark"><img src="${MARK}" alt="LawVriksh"></span><span class="wordmark">Law<span>Vriksh</span></span>${e.meta !== undefined ? `<span class="meta" data-slot="meta">${esc(e.meta)}</span>` : ''}</footer>`;
const head = (e, rule = true) => `<div class="bt-head"><p class="kicker" data-slot="kicker">${esc(e.kicker)}</p>${rule ? '<span class="bt-headrule" aria-hidden="true"></span>' : ''}</div>`;
const title = (e, fmt, o = {}) => { const f = {...FIT[fmt], ...(o[fmt] || {})}; return `<div class="bt-title"><h1 class="statement" data-fit data-fit-max="${f.max}" data-fit-min="${f.min}" data-fit-lines="${f.lines}" data-slot-html="${o.slot || 'title_html'}">${html(e[o.slot || 'title_html'])}</h1></div>`; };
const sub = e => `<div class="bt-sub"><p class="support" data-slot-html="body_html" data-optional>${html(e.body_html)}</p></div>`;
const art = inner => `<div class="bt-art" data-deco aria-hidden="true">${inner}</div>`;
const motif = e => art(`<div class="motif" data-motif="${e.motif}"></div>`);

export const thumbs = [
{
  id: 'statement-only', title: 'Statement only', layout: 'no-art',
  desc: 'Typographic headline across the full width, a thread with a node above it, one support line.',
  props: {kicker: P.kicker, title_html: P.title_html, body_html: P.body_html, meta: P.meta},
  ex: {kicker: 'Practice note', title_html: 'A citation that <b>reads well</b> is not yet a citation you have checked.', body_html: 'Four habits for advocates who use AI tools for first drafts.', meta: '[n] min read'},
  body: (e, f) => head(e) + title(e, f, {og: {max: 112, lines: 3}}) + sub(e) + foot(e)
},
{
  id: 'statement-object', title: 'Statement with a law object', layout: 'has-art',
  desc: 'Headline on the left; a law object on the right chosen to match the idea.',
  props: {kicker: P.kicker, title_html: P.title_html, body_html: P.body_html, motif: P.motif, meta: P.meta},
  ex: {kicker: 'Verify before you file', title_html: 'How to check an <b>AI-assisted citation</b> before you file', body_html: 'Source, paragraph, then court, date and parties.', motif: 'reports', meta: '[n] min read'},
  body: (e, f) => head(e, false) + title(e, f) + sub(e) + motif(e) + foot(e)
},
{
  id: 'how-to', title: 'How to, with a step count', layout: 'has-art',
  desc: 'A large clay numeral states the number of steps; the headline carries the task.',
  props: {kicker: P.kicker, title_html: P.title_html, count: S({maxLength: 2}), count_label: S({maxLength: 12}), meta: P.meta},
  ex: {kicker: 'How to', title_html: 'Check a citation <b>before you file it</b>', count: '5', count_label: 'steps', meta: '[n] min read'},
  body: (e, f) => head(e, false) + title(e, f, {og: {lines: 5}}) + art(`<div class="bt-count"><p class="n" data-slot="count">${esc(e.count)}</p><p class="l" data-slot="count_label">${esc(e.count_label)}</p></div>`) + foot(e)
},
{
  id: 'question', title: 'Question headline', layout: 'has-art',
  desc: 'A question as the headline, a large clay question mark, and a one-line promise of the short answer.',
  props: {kicker: P.kicker, title_html: P.title_html, body_html: P.body_html, meta: P.meta},
  ex: {kicker: 'Practice question', title_html: 'Is a case that exists <b>always</b> a case that helps?', body_html: 'A short answer, and the check behind it.', meta: '[n] min read'},
  body: (e, f) => head(e, false) + title(e, f) + sub(e) + art('<p class="bt-q" aria-hidden="true">?</p>') + foot(e)
},
{
  id: 'does-not-settle', title: 'What this does not settle', layout: 'no-art',
  desc: 'Headline plus a short “still yours to judge” list marked with thread dashes.',
  props: {kicker: P.kicker, title_html: P.title_html, list_label: S({maxLength: 30}), rows: {type: 'array', minItems: 1, maxItems: 2, items: S({maxLength: 44})}, meta: P.meta},
  ex: {kicker: 'What this does not settle', title_html: 'A matching citation is <b>not good law.</b>', list_label: 'Still yours to judge', rows: ['Whether it has been overruled', 'Whether it fits your facts'], meta: '[n] min read'},
  body: (e, f) => head(e) + title(e, f, {og: {max: 88, lines: 3}}) + `<div class="bt-sub"><p class="bt-label" data-slot="list_label">${esc(e.list_label)}</p><ul class="bt-rows is-dash" data-slot-list="rows"><template><li data-field="text"></li></template>${e.rows.map(r => `<li>${esc(r)}</li>`).join('')}</ul></div>` + foot(e)
},
{
  id: 'comparison', title: 'This, not that', layout: 'has-art wide-art',
  desc: 'Headline with two cards joined by a clay link line (no arrowhead): the quiet “not this”, the raised “this”.',
  props: {kicker: P.kicker, title_html: P.title_html, not_label: S({maxLength: 20}), not_text: S({maxLength: 48}), this_label: S({maxLength: 20}), this_text: S({maxLength: 48}), meta: P.meta},
  ex: {kicker: 'This, not that', title_html: 'Cite the paragraph, <b>not the summary.</b>', not_label: 'Not this', not_text: 'The judgment says the delay was condoned.', this_label: 'This', this_text: 'Para [12]: the delay was condoned on [ground].', meta: '[n] min read'},
  body: (e, f) => head(e, false) + title(e, f, {og: {max: 88, lines: 5}}) + `<div class="bt-pair" data-deco-keep>
  <div class="card is-quiet"><span class="pill is-outline" data-slot="not_label">${esc(e.not_label)}</span><p class="t" data-slot="not_text">${esc(e.not_text)}</p></div>
  <div class="lk" data-deco aria-hidden="true"></div>
  <div class="card is-raised"><span class="pill is-accent" data-slot="this_label">${esc(e.this_label)}</span><p class="t" data-slot="this_text">${esc(e.this_text)}</p></div>
</div>` + foot(e)
},
{
  id: 'checklist-teaser', title: 'Checklist teaser', layout: 'has-art wide-art tall-sub',
  desc: 'Headline and the first three checks as tick rows, with a quiet line pointing to the rest.',
  props: {kicker: P.kicker, title_html: P.title_html, rows: {type: 'array', minItems: 1, maxItems: 3, items: S({maxLength: 36})}, teaser_more: S({maxLength: 36}), meta: P.meta},
  ex: {kicker: 'Before you file', title_html: 'The <b>five checks</b> for any citation', rows: ['Found in an authorised source', 'Paragraph read and noted', 'Court, date and parties match'], teaser_more: 'Two more checks inside', meta: '[n] min read'},
  body: (e, f) => head(e, false) + title(e, f, {og: {max: 88, lines: 4}}) + `<div class="bt-checks"><ul class="bt-rows" data-slot-list="rows"><template><li>${tick}<span data-field="text"></span></li></template>${e.rows.map(r => `<li>${tick}<span>${esc(r)}</span></li>`).join('')}</ul><p class="bt-more" data-slot="teaser_more">${esc(e.teaser_more)}</p></div>` + foot(e)
},
{
  id: 'series-edition', title: 'Series edition', layout: 'has-art',
  desc: 'Series label, a large edition number and a date line beside the headline (“Practice note No. [n]”).',
  props: {series_label: S({maxLength: 24}), edition_no: S({maxLength: 4}), title_html: P.title_html, date_line: S({maxLength: 24}), meta: P.meta},
  ex: {series_label: 'Practice note', edition_no: '[n]', title_html: 'Read the paragraph <b>your point rests on</b>', date_line: '[date]', meta: '[n] min read'},
  body: (e, f) => `<div class="bt-head"><p class="kicker" data-slot="series_label">${esc(e.series_label)}</p></div>` + title(e, f) + art(`<div class="bt-ed"><p class="no">No.</p><p class="n" data-slot="edition_no">${esc(e.edition_no)}</p><p class="d" data-slot="date_line">${esc(e.date_line)}</p></div>`) + foot(e)
},
{
  id: 'advocate-profile', title: 'Past-advocate profile', layout: 'has-art',
  desc: 'Empty labelled portrait frame (hatch-sand), headline, name and era. No likeness ships in the template.',
  props: {kicker: P.kicker, title_html: P.title_html, name: S({maxLength: 36}), era: S({maxLength: 40}), image: P.image, image_alt: P.image_alt, image_label: P.image_label, meta: P.meta},
  ex: {kicker: 'Advocates who shaped practice', title_html: '[Advocate name] and the habit of <b>[practice]</b>', name: '[Advocate name]', era: '[Year]–[Year] · [Bar / city]', image: '', image_alt: '', image_label: 'Portrait slot', meta: '[n] min read'},
  body: (e, f) => head(e, false) + title(e, f, {og: {max: 80, lines: 3}, sq: {max: 100}, pt: {max: 108}}) + `<div class="bt-sub"><p class="bt-name" data-slot="name">${esc(e.name)}</p><p class="bt-era" data-slot="era">${esc(e.era)}</p></div>` + art(`<div class="bt-prof"><figure class="slot-frame" style="margin:0"><img data-slot-src="image" data-slot-alt="image_alt" alt="" data-hidden><span class="slot-label" data-slot="image_label">${esc(e.image_label)}</span></figure></div>`) + foot(e)
},
{
  id: 'case-explained', title: 'Case explained', layout: 'has-art',
  desc: 'Court, date and topic only, as placeholders, beside an open report. No invented case.',
  props: {court: S({maxLength: 40}), date: S({maxLength: 24}), topic: S({maxLength: 80})},
  ex: {court: '[Court]', date: '[date]', topic: '[Topic of the judgment]'},
  body: (e, f) => `<div class="bt-head"><p class="kicker">Case explained</p></div>` + `<div class="bt-title"><h1 class="statement" data-fit data-fit-max="${FIT[f].max}" data-fit-min="${FIT[f].min}" data-fit-lines="${FIT[f].lines}" data-slot="topic">${esc(e.topic)}</h1></div>` + `<div class="bt-sub"><ul class="bt-chips"><li class="bt-chip"><span class="k">Court</span><span class="v" data-slot="court">${esc(e.court)}</span></li><li class="bt-chip"><span class="k">Date</span><span class="v" data-slot="date">${esc(e.date)}</span></li></ul></div>` + art('<div class="motif" data-motif="open-book"></div>') + `<footer class="bt-foot"><span class="mark"><img src="${MARK}" alt="LawVriksh"></span><span class="wordmark">Law<span>Vriksh</span></span></footer>`
}
];

export function build(){
  const out = [];
  for (const t of thumbs) {
    const ex = {theme: 'paper', ...t.ex};
    write(`thumbnails/${t.id}.schema.json`, schema(`thumbnails/${t.id}`, t.title, t.props, Object.keys(t.props).filter(k => !['body_html', 'meta', 'image', 'image_alt', 'image_label'].includes(k))));
    write(`thumbnails/${t.id}.example.json`, ex);
    for (const f of ['og', 'sq', 'pt']) {
      const cls = `bt ${t.layout.includes('no-art') ? 'no-art' : 'has-art'}${t.layout.includes('wide-art') ? ' wide-art' : ''}${t.layout.includes('tall-sub') ? ' tall-sub' : ''}`;
      const body = `<div class="${cls}">\n${t.body(ex, f)}\n</div>`;
      write(`thumbnails/${t.id}-${f}.html`, page({title: `LawVriksh blog thumbnail — ${t.title} (${SIZE[f]})`, id: `blog/thumbnails/${t.id}-${f}`, size: SIZE[f], format: f, css: ['thumbs.css'], body, meta: {role: 'blog thumbnail'}}));
      out.push({family: 'thumbnails', kind: 'thumbnail', group: t.id, fmt: f, id: `${t.id}-${f}`, title: `${t.title} · ${f}`, desc: t.desc, size: SIZE[f], file: `thumbnails/${t.id}-${f}.html`, schema: `thumbnails/${t.id}.schema.json`, example: `thumbnails/${t.id}.example.json`, slots: Object.keys(t.props)});
    }
  }
  return out;
}

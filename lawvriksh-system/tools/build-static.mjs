// Static family: each template composed twice — 1080x1350 (Instagram) and 1200x1200 (LinkedIn)
import {write, page, tickSVG, stones, motif, docSVG, schema, P, S, html, esc, MARK} from './lib.mjs';

const tick = `<span class="tick">${tickSVG()}</span>`;
const k = v => `<p class="kicker" data-slot="kicker">${esc(v)}</p>`;
const t = (v, size = '') => `<h1 class="statement ${size}" data-slot-html="title_html">${html(v)}</h1>`;
const b = v => `<p class="support" data-slot-html="body_html" data-optional>${html(v)}</p>`;
const foot = (series = 'Field notes') => `
<div class="thread is-static" aria-hidden="true" style="--progress-x:var(--safe-x)"></div>
<footer class="folio">
  <span class="mark"><img src="${MARK}" alt="LawVriksh"></span>
  <span class="wordmark">Law<span>Vriksh</span></span>
  <span class="series" data-slot="series">${esc(series)}</span>
</footer>`;
const rows = items => `<ul class="rows" data-slot-list="rows"><template><li class="row">${tick}<span class="txt" data-field="text"></span></li></template>
${items.map(x => `<li class="row">${tick}<span class="txt">${esc(x)}</span></li>`).join('\n')}</ul>`;
const series = S({maxLength:24, description:'Right side of the footer, e.g. the series name.'});

const defs = [
{
  id:'single-statement', title:'Single statement', props:{motif:P.motif, title_html:P.title_html, series},
  ex:{motif:'judgment', title_html:'Check the citation <b>before it checks you.</b>', series:'Field notes'},
  body:(e, sq) => `
${sq ? motif(e.motif,700,50,440,340) : motif(e.motif,600,50,440,360)}
<section class="content">
  <div class="push"></div>
  ${t(e.title_html,'xl')}
  <div style="flex:.35 1 0"></div>
</section>${foot(e.series)}`
},
{
  id:'statement-support', title:'Statement with supporting line', props:{motif:P.motif, kicker:P.kicker, title_html:P.title_html, body_html:P.body_html, series},
  ex:{motif:'open-book', kicker:'Practice note', title_html:'A headnote is a summary. <b>The paragraph is the law.</b>', body_html:'Before you rely on a case, read the paragraph your sentence depends on.', series:'Field notes'},
  body:(e, sq) => `
${sq ? motif(e.motif,800,50,360,260) : motif(e.motif,700,50,340,250)}
<section class="content">
  ${k(e.kicker)}
  <div class="push"></div>
  ${t(e.title_html, sq ? 'l' : 'xl')}
  <div class="gap-m"></div>
  ${b(e.body_html)}
</section>${foot(e.series)}`
},
{
  id:'three-checks', title:'Three-point checklist', props:{motif:P.motif, kicker:P.kicker, title_html:P.title_html, rows:{...P.rows, minItems:3, maxItems:3}, series},
  ex:{motif:'checked', kicker:'Before you file', title_html:'Three checks, <b>every citation.</b>', rows:['Found in an authorised source','Paragraph read and noted','Court, date and parties match'], series:'Field notes'},
  body:(e, sq) => `
<section class="content">
  ${k(e.kicker)}
  <div class="gap-m"></div>
  ${t(e.title_html, sq ? 'm' : 'l')}
  <div class="push"></div>
  ${rows(e.rows)}
</section>
${sq ? motif(e.motif,700,330,420,320) : motif(e.motif,560,400,460,380)}${foot(e.series)}`
},
{
  id:'comparison', title:'Comparison', props:{kicker:P.kicker, title_html:P.title_html, a_label:S({maxLength:22}), a_text:S({maxLength:80}), b_label:S({maxLength:22}), b_text:S({maxLength:80}), series},
  ex:{kicker:'The paragraph, your sentence', title_html:'Say <b>no more</b> than the paragraph does.', a_label:'The paragraph', a_text:'Para [14]: the notice was served on [date].', b_label:'Your sentence', b_text:'Notice was served on [date] (para [14]).', series:'Field notes'},
  body:(e, sq) => `
<section class="content">
  ${k(e.kicker)}
  <div class="gap-m"></div>
  ${t(e.title_html, sq ? 'm' : 'l')}
  <div class="push"></div>
  <div class="pair">
    <div class="card is-quiet"><span class="pill is-outline" data-slot="a_label">${esc(e.a_label)}</span><p class="body" data-slot="a_text">${esc(e.a_text)}</p></div>
    <div class="link-h" data-deco aria-hidden="true"></div>
    <div class="card is-raised"><span class="pill is-accent" data-slot="b_label">${esc(e.b_label)}</span><p class="body" data-slot="b_text">${esc(e.b_text)}</p></div>
  </div>
</section>${foot(e.series)}`
},
{
  id:'myth-check', title:'Myth versus check', props:{motif:P.motif, kicker:P.kicker, myth_label:S({maxLength:22}), myth:S({maxLength:80}), check_label:S({maxLength:22}), check_html:P.title_html, series},
  ex:{motif:'compare', kicker:'Common assumption', myth_label:'You may hear', myth:'If the tool cited it, the case exists.', check_label:'Check instead', check_html:'Find it yourself in an <b>authorised source.</b>', series:'Field notes'},
  body:(e, sq) => `
<section class="content">
  ${k(e.kicker)}
  <div class="push"></div>
  <div class="pair">
    <div class="card is-quiet myth"><span class="pill is-outline" data-slot="myth_label">${esc(e.myth_label)}</span><p class="body" data-slot="myth">${esc(e.myth)}</p></div>
    <div class="link-h" data-deco aria-hidden="true"></div>
    <div class="card is-raised"><span class="pill is-accent" data-slot="check_label">${esc(e.check_label)}</span><p class="body" style="font-size:${sq ? 52 : 60}px;line-height:1.08;font-weight:600;letter-spacing:-0.025em" data-slot-html="check_html">${html(e.check_html)}</p></div>
  </div>
  <div style="flex:.4 1 0"></div>
</section>
${sq ? motif(e.motif,820,40,320,230) : motif(e.motif,720,40,320,230)}${foot(e.series)}`
},
{
  id:'callout-document', title:'Callout with document', props:{kicker:P.kicker, title_html:P.title_html, cite:S({maxLength:6}), callout:S({maxLength:90}), series},
  ex:{kicker:'Margin habit', title_html:'Mark the paragraph, <b>then cite it.</b>', cite:'[1]', callout:'Note the paragraph number beside every authority in your draft.', series:'Field notes'},
  body:(e, sq) => `
<div class="callout-doc" data-deco aria-hidden="true" style="${sq ? 'left:640px;top:110px;width:500px' : 'left:520px;top:300px;width:520px'};transform:rotate(-3deg)">${docSVG({w:460,h:600,kind:'judgment',seed:9})}</div>
<section class="content">
  ${k(e.kicker)}
  <div class="gap-m"></div>
  <div style="max-width:${sq ? 540 : 440}px">${t(e.title_html, 's')}</div>
  <div class="push"></div>
  <div class="card is-raised callout" style="${sq ? '' : 'max-width:560px'}">
    <div class="cite-row"><span class="chip-cite" data-slot="cite">${esc(e.cite)}</span><span class="label" style="color:var(--fg-muted)">Margin note</span></div>
    <p class="body" data-slot="callout">${esc(e.callout)}</p>
  </div>
</section>${foot(e.series)}`
},
{
  id:'cta-card', title:'CTA card', props:{motif:P.motif, title_html:P.title_html, body_html:P.body_html, button:P.button, note:P.note, series},
  ex:{motif:'reports', title_html:'One practice note, <b>every week.</b>', body_html:'Short, checkable habits for individual advocates.', button:'Follow LawVriksh', note:'Save this for your next filing.', series:'Field notes'},
  body:(e, sq) => `
${sq ? motif(e.motif,640,50,500,330) : motif(e.motif,560,50,480,330)}
<section class="content">
  <div class="push"></div>
  <div class="cta-card">
    ${t(e.title_html,'m')}
    <div class="gap-s"></div>
    ${b(e.body_html)}
    <div class="gap-m"></div>
    <span class="btn" data-slot="button">${esc(e.button)}</span>
    <div class="gap-s"></div>
    <p class="note" data-slot="note" data-optional>${esc(e.note)}</p>
  </div>
</section>${foot(e.series)}`
},
{
  id:'big-number', title:'Big number / keyword', props:{motif:P.motif, kicker:P.kicker, number:S({maxLength:4}), unit:S({maxLength:24}), body_html:P.body_html, series},
  ex:{motif:'notes', kicker:'One habit', number:'1', unit:'line per citation', body_html:'Source, paragraph, date checked. Your review becomes visible to you and to your junior.', series:'Field notes'},
  body:(e, sq) => `
${sq ? motif(e.motif,740,150,400,330) : motif(e.motif,640,170,400,340)}
<section class="content">
  ${k(e.kicker)}
  <div class="push"></div>
  <div class="bignum-row"><p class="bignum" data-slot="number">${esc(e.number)}</p><p class="unit" data-slot="unit">${esc(e.unit)}</p></div>
  <div class="gap-s"></div>
  ${b(e.body_html)}
</section>${foot(e.series)}`
},
{
  id:'definition-card', title:'Definition card', props:{motif:P.motif, kicker:P.kicker, term:S({maxLength:28}), pos:S({maxLength:20}), body_html:P.body_html, not_label:S({maxLength:30}), not_text:S({maxLength:80}), series},
  ex:{motif:'reports', kicker:'Plain terms', term:'Authorised source', pos:'noun', body_html:'Where a judgment is published by the court or an official reporter, and can be read in full.', not_label:'Does not settle', not_text:'Whether the case is still good law.', series:'Field notes'},
  body:(e, sq) => `
<section class="content">
  ${k(e.kicker)}
  <div class="push"></div>
  <div class="term-line"><h1 class="statement l" data-slot="term" style="margin:0">${esc(e.term)}</h1><span class="pos" data-slot="pos">${esc(e.pos)}</span></div>
  <div class="gap-s"></div>
  ${b(e.body_html)}
  <div class="gap-l"></div>
  <hr class="rule">
  <div class="gap-m"></div>
  <p class="label" data-slot="not_label" style="color:var(--accent)">${esc(e.not_label)}</p>
  <div class="gap-s"></div>
  <p class="body" data-slot="not_text">${esc(e.not_text)}</p>
</section>
${sq ? motif(e.motif,840,40,300,210) : motif(e.motif,740,40,300,210)}${foot(e.series)}`
},
{
  id:'principle-card', title:'Principle card', props:{motif:P.motif, number:S({maxLength:12}), title_html:P.title_html, body_html:P.body_html, series},
  ex:{motif:'courthouse', number:'Principle 04', title_html:'Your judgment stays <b>yours.</b>', body_html:'A tool can find and sort. Whether a case helps your client is still your call.', series:'Field notes'},
  body:(e, sq) => `
${sq ? motif(e.motif,60,70,560,380) : motif(e.motif,50,80,560,400)}
<section class="content">
  <div class="push"></div>
  <p class="principle-no" data-slot="number">${esc(e.number)}</p>
  <div class="gap-s"></div>
  ${t(e.title_html,'xl')}
  <div class="gap-m"></div>
  ${b(e.body_html)}
</section>${foot(e.series)}`
}
];

export function build(){
  const out = [];
  for (const d of defs) for (const [fmt, size, suffix] of [['portrait','1080x1350','ig'],['square','1200x1200','li']]) {
    const ex = {theme:'paper', ...d.ex}, id = `${d.id}-${suffix}`;
    write(`static/${id}.html`, page({title:`LawVriksh static — ${d.title} (${size})`, id:`static/${id}`, size, format:fmt, css:['static.css'], body:d.body(ex, fmt === 'square'), meta:{role:'static'}}));
    write(`static/${id}.example.json`, ex);
    out.push({family:'static', id, title:`${d.title} · ${suffix === 'ig' ? 'Instagram' : 'LinkedIn'}`, role:'static', desc:'', slots:Object.keys(d.props), size, file:`static/${id}.html`});
  }
  for (const d of defs) write(`static/${d.id}.schema.json`, schema(`static/${d.id}`, d.title, d.props, Object.keys(d.props).filter(k => !['body_html','note','series'].includes(k))));
  return out;
}

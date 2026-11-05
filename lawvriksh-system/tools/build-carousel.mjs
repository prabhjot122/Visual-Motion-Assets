// Carousel family: 1080x1350. Writes carousel/<id>.html, .schema.json, .example.json
import {write, page, folio, tickSVG, stones, motif, docSVG, schema, P, S, html, esc, T, MARK} from './lib.mjs';

const C = ['carousel.css'];
const tick = `<span class="tick">${tickSVG()}</span>`;
const rowsTpl = (items, slot = 'rows') => `<ul class="rows" data-slot-list="${slot}"><template><li class="row">${tick}<span class="txt" data-field="text"></span></li></template>
${items.map(t => `<li class="row">${tick}<span class="txt">${esc(t)}</span></li>`).join('\n')}</ul>`;
const pillsTpl = items => `<ul class="pills" data-slot-list="pills"><template><li class="pill" data-field="text"></li></template>
${items.map(p => `<li class="pill${p.variant && p.variant !== 'default' ? ' is-' + p.variant : ''}">${esc(p.text)}</li>`).join('\n')}</ul>`;
const k = v => `<p class="kicker" data-slot="kicker">${esc(v)}</p>`;
const t = (v, size = '') => `<h1 class="statement ${size}" data-slot-html="title_html">${html(v)}</h1>`;
const b = (v, opt = true) => `<p class="support" data-slot-html="body_html"${opt ? ' data-optional' : ''}>${html(v)}</p>`;

export const carousel = [
{
  id:'cover-stack', title:'Cover A — stacked statement', role:'cover / hook',
  desc:'Large statement high on the page, supporting line bottom left, stone cluster bottom right. The thread starts at the first node.',
  props:{motif:P.motif, kicker:P.kicker, title_html:P.title_html, body_html:P.body_html, swipe:S({maxLength:20}), counter:P.counter},
  ex:{motif:'files', kicker:'For practising advocates', title_html:'Three checks before a citation goes into a <b>filing.</b>', body_html:'A short routine to run, in order, on any citation a draft gave you.', swipe:'Swipe to read', counter:{index:1,total:8}},
  body:e => `
<section class="content cover-stack">
  ${k(e.kicker)}
  ${t(e.title_html,'xl')}
  <div class="push"></div>
  ${b(e.body_html)}
  <div class="gap-s"></div>
  <p class="swipe" data-slot="swipe" data-optional>${esc(e.swipe)}</p>
</section>
${motif(e.motif,630,700,430,400)}
${folio('01 / 08')}`
},
{
  id:'cover-document', title:'Cover B — document object', role:'cover / hook',
  desc:'A greeked page with one highlighted paragraph sits top right on a stone slab; the statement takes the lower half.',
  props:{motif:P.motif, kicker:P.kicker, title_html:P.title_html, body_html:P.body_html, counter:P.counter},
  ex:{motif:'judgment', kicker:'Field note', title_html:'Read the paragraph, <b>not the headnote.</b>', body_html:'What a judgment says is in its paragraphs. Everything else is somebody’s summary.', counter:{index:1,total:6}},
  body:e => `
${motif(e.motif,500,70,540,500)}
<section class="content cover-doc">
  ${k(e.kicker)}
  <div class="push"></div>
  ${t(e.title_html,'xl')}
  <div class="gap-m"></div>
  ${b(e.body_html)}
</section>
${folio('01 / 06')}`
},
{
  id:'cover-number', title:'Cover C — oversized numeral', role:'cover / hook',
  desc:'One large clay numeral states the count; three stones echo it. Use for “N habits / N checks” openers.',
  props:{motif:P.motif, kicker:P.kicker, numeral:S({maxLength:2}), title_html:P.title_html, body_html:P.body_html, counter:P.counter},
  ex:{motif:'checked', kicker:'Before you file', numeral:'3', title_html:'checks for every citation a draft hands you.', body_html:'Source, paragraph, then court, date and parties.', counter:{index:1,total:8}},
  body:e => `
<section class="content cover-number">
  ${k(e.kicker)}
  <div class="gap-m"></div>
  <p class="numeral" data-slot="numeral">${esc(e.numeral)}</p>
  <div class="push"></div>
  ${t(e.title_html,'l')}
  <div class="gap-s"></div>
  ${b(e.body_html)}
</section>
${motif(e.motif,560,200,470,380)}
${folio('01 / 08')}`
},
{
  id:'statement', title:'Statement', role:'content',
  desc:'Kicker, one statement, one muted supporting line. A small stone pair anchors the top right.',
  props:{motif:P.motif, kicker:P.kicker, title_html:P.title_html, body_html:P.body_html, counter:P.counter},
  ex:{motif:'open-book', kicker:'Why check', title_html:'A citation can <b>look right</b> and still not be.', body_html:'A first draft may cite a case that reads well but does not exist, or does not say what the draft says.', counter:{index:2,total:8}},
  body:e => `
${motif(e.motif,660,60,380,280)}
<section class="content">
  ${k(e.kicker)}
  <div class="push"></div>
  ${t(e.title_html,'xl')}
  <div class="gap-m"></div>
  ${b(e.body_html)}
  <div class="push"></div>
</section>
${folio('02 / 08')}`
},
{
  id:'statement-checks', title:'Statement with check rows', role:'content',
  desc:'Statement plus up to four check rows (clay circle, paper tick) and an optional closing line.',
  props:{kicker:P.kicker, title_html:P.title_html, rows:P.rows, body_html:P.body_html, counter:P.counter},
  ex:{kicker:'Check three', title_html:'Match the <b>court, date and parties.</b>', rows:['The court is the one your draft names.','The date is the date your draft gives.','The parties match your draft.'], body_html:'Any mismatch: <b>stop and recheck.</b>', counter:{index:5,total:8}},
  body:e => `
<section class="content">
  ${k(e.kicker)}
  <div class="push"></div>
  ${t(e.title_html,'m')}
  <div class="gap-m"></div>
  ${rowsTpl(e.rows)}
  <div class="gap-m"></div>
  ${b(e.body_html)}
</section>
${folio('05 / 08')}`
},
{
  id:'statement-pills', title:'Statement with pills', role:'content',
  desc:'Statement, supporting line and a row of pills (ink, accent or outline).',
  props:{motif:P.motif, kicker:P.kicker, title_html:P.title_html, body_html:P.body_html, pills:P.pills, counter:P.counter},
  ex:{motif:'notes', kicker:'Then', title_html:'Write down <b>what you checked.</b>', body_html:'One line per citation. It makes your own review visible.', pills:[{text:'Source'},{text:'Paragraph',variant:'accent'},{text:'Date checked'}], counter:{index:6,total:8}},
  body:e => `
${motif(e.motif,700,50,340,270)}
<section class="content">
  ${k(e.kicker)}
  <div class="push"></div>
  ${t(e.title_html,'xl')}
  <div class="gap-m"></div>
  ${b(e.body_html)}
  <div class="gap-l"></div>
  ${pillsTpl(e.pills)}
  <div class="push"></div>
</section>
${folio('06 / 08')}`
},
{
  id:'compare', title:'Comparison — this, not that', role:'content',
  desc:'Two stacked cards joined by a clay link line with a node (no arrowhead). The “not” card is quiet; the “this” card is raised.',
  props:{kicker:P.kicker, title_html:P.title_html, not_label:S({maxLength:22}), not_text:S({maxLength:90}), this_label:S({maxLength:22}), this_text:S({maxLength:90}), counter:P.counter},
  ex:{kicker:'This, not that', title_html:'Cite the paragraph, <b>not the summary.</b>', not_label:'Not this', not_text:'“As held in the judgment, the delay was condoned.”', this_label:'This', this_text:'“Para [12]: the delay was condoned on [ground].”', counter:{index:4,total:8}},
  body:e => `
<section class="content">
  ${k(e.kicker)}
  <div class="gap-m"></div>
  ${t(e.title_html,'s')}
  <div class="push"></div>
  <div class="compare">
    <div class="card is-not"><span class="pill is-outline" data-slot="not_label">${esc(e.not_label)}</span><p class="body" data-slot="not_text">${esc(e.not_text)}</p></div>
    <div class="link-v" data-deco aria-hidden="true"></div>
    <div class="card is-raised is-this"><span class="pill is-accent" data-slot="this_label">${esc(e.this_label)}</span><p class="body" data-slot="this_text">${esc(e.this_text)}</p></div>
  </div>
</section>
${folio('04 / 08')}`
},
{
  id:'step', title:'Numbered step', role:'content',
  desc:'Step badge, a step track (01 02 03) with the current step on the thread, statement and supporting line.',
  props:{motif:P.motif, step:{type:'integer',minimum:1,maximum:6}, steps:{type:'integer',minimum:2,maximum:6}, kicker:P.kicker, title_html:P.title_html, body_html:P.body_html, pills:P.pills, counter:P.counter},
  ex:{motif:'reports', step:1, steps:3, kicker:'Check one', title_html:'Find the judgment in an <b>authorised source.</b>', body_html:'If you cannot find it there, it is not ready to file.', pills:[{text:'Authorised source',variant:'outline'}], counter:{index:3,total:8}},
  body:e => `
<section class="content">
  <div class="step-head">
    <span class="badge-num" data-slot="step">${e.step}</span>
    <ol class="step-track" aria-label="Steps">${Array.from({length:e.steps},(_,i)=>`<li${i+1===e.step?' class="is-current"':''}>${String(i+1).padStart(2,'0')}</li>`).join('')}</ol>
  </div>
  <div class="push"></div>
  ${k(e.kicker)}
  <div class="gap-s"></div>
  ${t(e.title_html,'l')}
  <div class="gap-m"></div>
  ${b(e.body_html)}
  <div class="gap-m"></div>
  ${pillsTpl(e.pills)}
</section>
${motif(e.motif,620,240,420,300)}
${folio('03 / 08')}`,
  script:`window.__lvAfterFill=function(d){if(!('step' in d)&&!('steps' in d))return;var tr=document.querySelector('.step-track');var n=d.steps||tr.children.length,s=d.step||1;tr.innerHTML='';for(var i=1;i<=n;i++){var li=document.createElement('li');li.textContent=String(i).padStart(2,'0');if(i===s)li.className='is-current';tr.appendChild(li);}};`
},
{
  id:'definition', title:'Definition — what this does not settle', role:'content',
  desc:'A term and its plain definition, then a short list of what it does not settle, marked with thread dashes.',
  props:{kicker:P.kicker, title_html:P.title_html, body_html:P.body_html, list_label:S({maxLength:30}), rows:P.rows, counter:P.counter},
  ex:{kicker:'What this does not settle', title_html:'Real is not the same as <b>good law.</b>', body_html:'The checks show a citation exists and says what you wrote.', list_label:'Still yours to judge', rows:['Whether it has been overruled','Whether it applies to your facts'], counter:{index:7,total:8}},
  body:e => `
<section class="content">
  ${k(e.kicker)}
  <div class="push"></div>
  ${t(e.title_html,'xl')}
  <div class="gap-s"></div>
  ${b(e.body_html)}
  <div class="gap-l"></div>
  <hr class="rule">
  <div class="gap-m"></div>
  <p class="label" data-slot="list_label" style="color:var(--fg)">${esc(e.list_label)}</p>
  <div class="gap-s"></div>
  <ul class="rows def-list" data-slot-list="rows"><template><li class="row"><span class="dash" aria-hidden="true"></span><span class="txt" data-field="text"></span></li></template>
  ${e.rows.map(r=>`<li class="row"><span class="dash" aria-hidden="true"></span><span class="txt">${esc(r)}</span></li>`).join('\n')}</ul>
</section>
${folio('07 / 08')}`
},
{
  id:'checklist', title:'Checklist summary', role:'summary',
  desc:'Numbered summary of the whole carousel. Rows carry tabular numerals; a note closes it.',
  props:{kicker:P.kicker, title_html:P.title_html, rows:P.rows, note:P.note, counter:P.counter},
  ex:{kicker:'Save this', title_html:'Every citation, <b>every time.</b>', rows:['Find it in an authorised source','Read the paragraph it rests on','Match court, date and parties','Note what you checked'], note:'Four lines. About a minute per citation.', counter:{index:8,total:9}},
  body:e => `
<section class="content">
  ${k(e.kicker)}
  <div class="gap-m"></div>
  ${t(e.title_html,'l')}
  <div class="push"></div>
  <ol class="rows numlist" data-slot-list="rows"><template><li class="row"><span class="n" data-index-pad></span><span class="txt" data-field="text"></span></li></template>
  ${e.rows.map((r,i)=>`<li class="row"><span class="n">${String(i+1).padStart(2,'0')}</span><span class="txt">${esc(r)}</span></li>`).join('\n')}</ol>
  <div class="gap-m"></div>
  <p class="note" data-slot="note" data-optional>${esc(e.note)}</p>
</section>
${folio('08 / 09')}`
},
{
  id:'closing-cta', title:'Closing / CTA', role:'closing',
  desc:'Closing statement, one line, a button and a note. The thread ends at the last node.',
  props:{motif:P.motif, kicker:P.kicker, title_html:P.title_html, body_html:P.body_html, button:P.button, note:P.note, counter:P.counter},
  ex:{motif:'reports', kicker:'Next week', title_html:'Prepare your case with <b>facts you can check.</b>', body_html:'One practice note for individual advocates, every week.', button:'Follow for the next note', note:'Save this carousel for your next filing.', counter:{index:8,total:8}},
  body:e => `
${motif(e.motif,600,60,440,300)}
<section class="content">
  ${k(e.kicker)}
  <div class="push"></div>
  ${t(e.title_html,'xl')}
  <div class="gap-m"></div>
  ${b(e.body_html)}
  <div class="gap-l"></div>
  <span class="btn" data-slot="button">${esc(e.button)}</span>
  <div class="gap-s"></div>
  <p class="note" data-slot="note" data-optional>${esc(e.note)}</p>
</section>
${folio('08 / 08')}`
},
{
  id:'statement-document', title:'Statement with document', role:'content',
  desc:'Statement on top; a band of greeked pages below shows the idea (one highlighted paragraph). Pages are images: no text touches them.',
  props:{kicker:P.kicker, title_html:P.title_html, body_html:P.body_html, counter:P.counter},
  ex:{kicker:'Check two', title_html:'Read the paragraph <b>your point rests on.</b>', body_html:'Your sentence should say no more than that paragraph does.', counter:{index:4,total:8}},
  body:e => `
<section class="content stmt-doc">
  ${k(e.kicker)}
  <div class="gap-m"></div>
  ${t(e.title_html,'m')}
  <div class="gap-s"></div>
  ${b(e.body_html)}
  <div class="push"></div>
  <div class="docband" data-deco aria-hidden="true">
    <div class="d" style="left:40px;transform:rotate(-4deg)">${docSVG({w:300,h:380,kind:'draft',highlight:false,seed:7})}</div>
    <div class="d" style="left:330px;top:-14px">${docSVG({w:300,h:380,kind:'judgment',seed:2})}</div>
    <div class="d" style="left:640px;transform:rotate(3deg)">${docSVG({w:300,h:380,kind:'notes',highlight:false,seed:5})}</div>
  </div>
</section>
${folio('04 / 08')}`
},
/* ---- weekly historical-advocate series ---- */
{
  id:'advocate-cover', title:'Advocate series — cover', role:'series cover',
  desc:'Weekly series on past advocates. An empty labelled portrait frame (hatch-sand stone treatment) until a licensed image is supplied. No likeness ships in the template.',
  props:{kicker:P.kicker, image:P.image, image_alt:S({maxLength:120}), image_label:P.image_label, name:S({maxLength:40}), era:S({maxLength:40}), body_html:P.body_html, counter:P.counter},
  ex:{kicker:'Advocates who shaped practice · No. [n]', image:'', image_alt:'', image_label:'Portrait — public-domain or licensed image', name:'[Advocate name]', era:'[Year]–[Year] · [Bar / city]', body_html:'One habit of practice we still use, and where it came from.', counter:{index:1,total:5}},
  body:e => `
<section class="content adv-cover">
  ${k(e.kicker)}
  <div class="gap-m"></div>
  <figure class="slot-frame portrait" style="margin:0"><img data-slot-src="image" data-slot-alt="image_alt" alt="" data-hidden><span class="slot-label" data-slot="image_label">${esc(e.image_label)}</span></figure>
  <div class="push"></div>
  <h1 class="statement m" data-slot="name">${esc(e.name)}</h1>
  <div class="gap-s"></div>
  <p class="era" data-slot="era">${esc(e.era)}</p>
</section>
${folio('01 / 05')}`
},
{
  id:'advocate-profile', title:'Advocate series — profile', role:'series content',
  desc:'Portrait slot, name and era, a “what they did” block of up to three rows, and a sources line.',
  props:{image:P.image, image_alt:S({maxLength:120}), image_label:P.image_label, kicker:P.kicker, name:S({maxLength:40}), era:S({maxLength:40}), did_label:S({maxLength:24}), rows:{...P.rows, maxItems:3}, sources:S({maxLength:120, description:'Plain list of sources, e.g. biographies or archives. Required before publishing.'}), counter:P.counter},
  ex:{image:'', image_alt:'', image_label:'Portrait slot', kicker:'Who they were', name:'[Advocate name]', era:'[Year]–[Year] · [Court]', did_label:'What they did', rows:['[First documented contribution]','[A practice habit they are known for]','[Why it still matters to advocates]'], sources:'[Source 1]; [Source 2]', counter:{index:2,total:5}},
  body:e => `
<section class="content adv-profile">
  <div class="top">
    <figure class="slot-frame portrait" style="margin:0"><img data-slot-src="image" data-slot-alt="image_alt" alt="" data-hidden><span class="slot-label" data-slot="image_label">${esc(e.image_label)}</span></figure>
    <div class="who">
      ${k(e.kicker)}
      <h1 class="statement s" data-slot="name">${esc(e.name)}</h1>
      <p class="era" data-slot="era">${esc(e.era)}</p>
    </div>
  </div>
  <div class="push"></div>
  <p class="label" data-slot="did_label">${esc(e.did_label)}</p>
  <div class="gap-s"></div>
  <div class="did">${rowsTpl(e.rows)}</div>
  <div class="gap-m"></div>
  <p class="sources"><b>Sources</b> <span data-slot="sources">${esc(e.sources)}</span></p>
</section>
${folio('02 / 05')}`
},
/* ---- LinkedIn document pair ---- */
{
  id:'li-doc-cover', title:'LinkedIn document — cover (PDF page 1)', role:'document cover',
  desc:'Reads as a proper first page in a PDF viewer: title, subtitle, contents, byline with mark and edition line.',
  props:{kicker:P.kicker, title_html:P.title_html, body_html:P.body_html, toc:{type:'array',minItems:2,maxItems:5,items:S({maxLength:40})}, edition:S({maxLength:40}), counter:P.counter},
  ex:{kicker:'Practice note', title_html:'Verify before you file: <b>a citation routine.</b>', body_html:'For individual advocates who use AI tools for first drafts.', toc:['Find it in an authorised source','Read the paragraph','Match court, date and parties','Write down what you checked'], edition:'LawVriksh field notes · [Month Year]', counter:{index:1,total:7}},
  body:e => `
<section class="content li-cover">
  <div class="byline"><span class="mark"><img src="${MARK}" alt="LawVriksh"></span><span data-slot="edition">${esc(e.edition)}</span></div>
  <div class="gap-l"></div>
  ${k(e.kicker)}
  <div class="gap-s"></div>
  ${t(e.title_html,'l')}
  <div class="gap-s"></div>
  ${b(e.body_html)}
  <div class="push"></div>
  <ol class="toc" data-slot-list="toc"><template><li><span class="n" data-index-pad></span><span data-field="text"></span></li></template>
  ${e.toc.map((x,i)=>`<li><span class="n">${String(i+1).padStart(2,'0')}</span><span>${esc(x)}</span></li>`).join('\n')}</ol>
</section>
${folio('01 / 07')}`
},
{
  id:'li-doc-closing', title:'LinkedIn document — closing', role:'document closing',
  desc:'Final PDF page: summary statement, one line, a button-styled action and a note. Stones close the document.',
  props:{motif:P.motif, kicker:P.kicker, title_html:P.title_html, body_html:P.body_html, button:P.button, note:P.note, counter:P.counter},
  ex:{motif:'courthouse', kicker:'Keep this', title_html:'Four lines per citation. <b>Every filing.</b>', body_html:'Source, paragraph, court, date and parties, then a note of what you checked.', button:'Follow LawVriksh', note:'A practice note for individual advocates, every week.', counter:{index:7,total:7}},
  body:e => `
<section class="content">
  ${k(e.kicker)}
  <div class="push"></div>
  ${t(e.title_html,'xl')}
  <div class="gap-m"></div>
  ${b(e.body_html)}
  <div class="gap-l"></div>
  <span class="btn" data-slot="button">${esc(e.button)}</span>
  <div class="gap-s"></div>
  <p class="note" data-slot="note" data-optional>${esc(e.note)}</p>
</section>
${motif(e.motif,620,60,420,300)}
${folio('07 / 07')}`
}
];

export function buildCarousel(){
  for (const d of carousel) {
    const ex = {theme:'paper', ...d.ex};
    write(`carousel/${d.id}.html`, page({title:`LawVriksh carousel — ${d.title}`, id:`carousel/${d.id}`, size:'1080x1350', counter:`${ex.counter.index}/${ex.counter.total}`, css:C, body:d.body(ex), script:d.script, meta:{role:d.role}}));
    write(`carousel/${d.id}.schema.json`, schema(`carousel/${d.id}`, d.title, d.props, Object.keys(d.props).filter(k=>!['body_html','note','pills','swipe','image','image_alt','counter'].includes(k))));
    write(`carousel/${d.id}.example.json`, ex);
  }
  return carousel.map(d => ({family:'carousel', id:d.id, title:d.title, role:d.role, desc:d.desc, slots:Object.keys(d.props), size:'1080x1350', file:`carousel/${d.id}.html`}));
}

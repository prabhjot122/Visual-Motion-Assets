// Reel / Shorts family: 1080x1920 @ 30 fps. Every frame comes from window.__renderAt(t).
import {write, page, tickSVG, motif, schema, P, S, html, esc, MARK} from './lib.mjs';

const CAPSTYLES = ['ink-band', 'paper-slip', 'edge-word', 'stack', 'highlighter'];
const timed = (sentence, start = 0.4, step = 0.34) => sentence.split(' ').map((w, i) => ({w, s: +(start + i * step).toFixed(2), e: +(start + i * step + step * 0.92).toFixed(2)}));
const tick = `<span class="tick">${tickSVG()}</span>`;

const top = `
<div class="reel-top"><span class="mark"><img src="${MARK}" alt="LawVriksh"></span><span class="wordmark">Law<span>Vriksh</span></span><span class="counter" data-slot="reel_counter">02 / 07</span></div>
<div class="reel-progress" data-deco aria-hidden="true"></div>`;
const cap = style => `<div class="cap ${style}" data-cap aria-live="off"><div class="cap-line"></div></div>`;

function scenePage({id, title, theme = 'dark', body, duration, hold, render, ex, capStyle = 'ink-band', strip}){
  const script = `
(function(){
  var root = document.querySelector('.lv'), $ = function(s){ return root.querySelector(s); }, $$ = function(s){ return [].slice.call(root.querySelectorAll(s)); };
  var D = ${JSON.stringify(ex)};
  var CAP = D.captions || [], IDX = D.scene_index || 1, TOT = D.scene_total || 1;
  window.__lvAfterFill = function(d){
    if (d.captions) CAP = d.captions;
    if (d.scene_index) IDX = d.scene_index; if (d.scene_total) TOT = d.scene_total;
    if (d.caption_style) { var c = $('[data-cap]'); c.className = 'cap ' + d.caption_style; }
    if (window.__renderAt) window.__renderAt(window.__lastT || 0);
  };
  LV.scene({duration: ${duration}, hold: ${hold}, render: function(t){
    window.__lastT = t;
    LV.progress(root, t, ${duration}, IDX, TOT);
    LV.captions($('[data-cap]'), CAP, t);
${render.trim().split('\n').map(l => '    ' + l).join('\n')}
  }});
})();`;
  return page({title: `LawVriksh reel — ${title}`, id: `reel/${id}`, size: '1080x1920', format: 'reel', theme, css: ['reel.css'], body: top + (typeof body === 'function' ? body(ex) : body) + cap(capStyle), script, meta: {fps: '30', duration: String(duration), hold: String(hold)}})
    .replace('<script src="../core/lv-objects.js"></script>', '<script src="../core/lv-objects.js"></script>\n<script src="../core/lv-motion.js"></script>');
}

const k = v => `<p class="kicker" data-slot="kicker">${esc(v)}</p>`;
const t = (v, size = '') => `<h1 class="statement ${size}" data-slot-html="title_html">${html(v)}</h1>`;
const b = v => `<p class="support" data-slot-html="body_html" data-optional>${html(v)}</p>`;
const common = {scene_index: {type: 'integer', minimum: 1}, scene_total: {type: 'integer', minimum: 1}, caption_style: {enum: CAPSTYLES},
  captions: {type: 'array', items: {type: 'object', properties: {w: S({}), s: {type: 'number'}, e: {type: 'number'}}, required: ['w', 's', 'e']}, description: 'Word timings in seconds from the voiceover; the current word is highlighted.'}};

export const scenes = [
{
  id: 'hook', title: 'Hook', duration: 4, hold: 3.2, theme: 'paper',
  motion: 'Kicker fades up (0.1 s). Statement rises word by word (0.35 s, 0.09 s stagger). Case files settle up from below (1.0–1.8 s). Supporting line fades up (1.7 s).',
  props: {kicker: P.kicker, title_html: P.title_html, body_html: P.body_html, motif: P.motif},
  ex: {kicker: 'For practising advocates', title_html: 'Three checks before a citation goes into a <b>filing.</b>', body_html: 'A short routine for any citation a draft gave you.', motif: 'files', scene_index: 1, scene_total: 7, captions: timed('Three checks before a citation goes into a filing.')},
  body: e => `
<section class="reel-content">
  ${k(e.kicker)}
  <div class="gap-m"></div>
  ${t(e.title_html, 'xl')}
  <div class="push"></div>
  <div style="max-width:470px">${b(e.body_html)}</div>
</section>
${motif(e.motif, 560, 900, 480, 440)}`,
  render: `
LV.reveal($('.kicker'), t, 0.1, 0.5, 20);
LV.wordsIn($('.statement'), t, 0.35, 0.09, 0.55);
var m = $('.motif'), p = LV.ease.outQuint(LV.prog(t, 1.0, 0.8)); m.style.opacity = p.toFixed(3); m.style.transform = 'translateY(' + ((1 - p) * 90).toFixed(2) + 'px)';
LV.reveal($('.support'), t, 1.7, 0.6, 20);`
},
{
  id: 'title', title: 'Kicker, title, supporting line', duration: 4, hold: 3,
  motion: 'Kicker (0.1 s), statement word by word (0.3 s), a short thread draws under it (1.1–1.6 s), supporting line (1.4 s).',
  props: {kicker: P.kicker, title_html: P.title_html, body_html: P.body_html},
  ex: {kicker: 'Check one', title_html: 'Find the judgment in an <b>authorised source.</b>', body_html: 'If you cannot find it there, it is not ready to file.', scene_index: 2, scene_total: 7, captions: timed('Find the judgment in an authorised source.')},
  body: e => `
<section class="reel-content">
  <div class="push"></div>
  ${k(e.kicker)}
  <div class="gap-s"></div>
  ${t(e.title_html, 'xl')}
  <div class="gap-m"></div>
  <div class="ttl-thread" data-deco aria-hidden="true" style="height:6px;width:240px;border-radius:3px;background:var(--thread);transform-origin:0 50%"></div>
  <div class="gap-m"></div>
  ${b(e.body_html)}
  <div class="push"></div>
</section>`,
  render: `
LV.reveal($('.kicker'), t, 0.1, 0.5, 20);
LV.wordsIn($('.statement'), t, 0.3, 0.08, 0.55);
$('.ttl-thread').style.transform = 'scaleX(' + LV.ease.inOut(LV.prog(t, 1.1, 0.5)).toFixed(4) + ')';
LV.reveal($('.support'), t, 1.4, 0.6, 20);`
},
{
  id: 'document-highlight', title: 'Document highlight', duration: 5, hold: 3.8, theme: 'paper',
  motion: 'Statement fades up (0.1 s). The page slides up (0.4–1.1 s). The highlight sweeps line by line across one paragraph (1.3–2.7 s); a clay margin mark grows beside it (2.6–3.0 s).',
  props: {kicker: P.kicker, title_html: P.title_html, lines: {type: 'integer', minimum: 2, maximum: 5, description: 'Highlighted lines'}},
  ex: {kicker: 'Check two', title_html: 'Read the paragraph <b>your point rests on.</b>', lines: 4, scene_index: 3, scene_total: 7, captions: timed('Read the paragraph your point rests on.', 0.3)},
  body: e => `
<section class="reel-content">
  ${k(e.kicker)}
  <div class="gap-s"></div>
  ${t(e.title_html, 'l')}
</section>
<div class="scene-doc" data-deco aria-hidden="true" style="left:120px;top:780px;width:840px;height:560px">
  <div class="ln h" style="width:40%"></div><div class="gap"></div>
  <div class="ln" style="width:96%"></div><div class="ln" style="width:92%"></div><div class="ln" style="width:58%"></div><div class="gap"></div>
  <div class="ln hl" style="width:97%"></div><div class="ln hl" style="width:94%"></div><div class="ln hl" style="width:96%"></div><div class="ln hl" style="width:62%"></div><div class="gap"></div>
  <div class="ln" style="width:95%"></div><div class="ln" style="width:70%"></div>
  <div class="mm" style="top:236px;height:166px"></div>
</div>`,
  render: `
LV.reveal($('.kicker'), t, 0.1, 0.5, 16); LV.reveal($('.statement'), t, 0.2, 0.6, 24);
var d = $('.scene-doc'), p = LV.ease.outQuint(LV.prog(t, 0.4, 0.7)); d.style.opacity = p.toFixed(3); d.style.transform = 'translateY(' + ((1 - p) * 120).toFixed(2) + 'px)';
$$('.ln.hl').forEach(function(l, i){ l.style.setProperty('--hl', LV.ease.inOut(LV.prog(t, 1.3 + i * 0.35, 0.4)).toFixed(4)); });
$('.mm').style.transform = 'scaleY(' + LV.ease.out(LV.prog(t, 2.6, 0.4)).toFixed(4) + ')';`
},
{
  id: 'strike-list', title: 'Strike-out list', duration: 5, hold: 3.9,
  motion: 'Title fades up. Items appear (0.5 s, 0.15 s stagger). A clay strike draws through each struck item in turn (1.3, 1.8, 2.3 s) and it dims. The kept item gains a thread dot and turns full strength (2.9 s).',
  props: {kicker: P.kicker, title_html: P.title_html, struck: {type: 'array', minItems: 1, maxItems: 4, items: S({maxLength: 30})}, kept: S({maxLength: 30})},
  ex: {kicker: 'Not a source', title_html: 'What you <b>cannot cite.</b>', struck: ['A headnote', 'A forwarded summary', 'An AI answer'], kept: 'The judgment itself', scene_index: 3, scene_total: 7, captions: timed('Not a headnote, not a summary. The judgment itself.', 0.4, 0.4)},
  body: e => `
<section class="reel-content">
  ${k(e.kicker)}
  <div class="gap-s"></div>
  ${t(e.title_html, 'l')}
  <div class="push"></div>
  <ul class="slist">
    ${e.struck.map(s => `<li class="is-struck"><span class="dot" aria-hidden="true"></span><span class="strike">${esc(s)}<span class="bar" aria-hidden="true"></span></span></li>`).join('\n    ')}
    <li class="is-keep"><span class="dot" aria-hidden="true"></span><span data-slot="kept">${esc(e.kept)}</span></li>
  </ul>
  <div class="push"></div>
</section>`,
  render: `
LV.reveal($('.kicker'), t, 0.05, 0.5, 16); LV.reveal($('.statement'), t, 0.15, 0.6, 24);
$$('.slist li').forEach(function(li, i){ LV.reveal(li, t, 0.5 + i * 0.15, 0.5, 24); });
$$('.slist .is-struck').forEach(function(li, i){ var s = LV.ease.inOut(LV.prog(t, 1.3 + i * 0.5, 0.4)); li.querySelector('.bar').style.setProperty('--s', s.toFixed(4)); li.classList.toggle('is-out', s > 0.6); });
var keep = $('.is-keep'), kp = LV.prog(t, 2.9, 0.3); keep.style.color = kp > 0.5 ? 'var(--accent)' : ''; keep.style.fontWeight = '600';`
},
{
  id: 'compare-link', title: 'Two-card comparison with link line', duration: 5, hold: 3.8, theme: 'paper',
  motion: 'Title fades up. The first card rises (0.5 s). A clay link line draws down between the cards with a node at each end, no arrowhead (1.2–1.8 s). The second card rises (1.7 s).',
  props: {kicker: P.kicker, title_html: P.title_html, a_label: S({maxLength: 22}), a_text: S({maxLength: 80}), b_label: S({maxLength: 22}), b_text: S({maxLength: 80})},
  ex: {kicker: 'The paragraph, your sentence', title_html: 'Say <b>no more</b> than it does.', a_label: 'The paragraph', a_text: 'Para [14]: notice was served on [date].', b_label: 'Your sentence', b_text: 'Notice was served on [date] (para [14]).', scene_index: 4, scene_total: 7, captions: timed('Your sentence should say no more than the paragraph.', 0.3, 0.3)},
  body: e => `
<section class="reel-content">
  ${k(e.kicker)}
  <div class="gap-s"></div>
  ${t(e.title_html, 'l')}
  <div class="push"></div>
  <div class="card is-quiet ca" style="display:flex;flex-direction:column;gap:18px;padding:36px 40px"><span class="pill is-outline" style="align-self:flex-start" data-slot="a_label">${esc(e.a_label)}</span><p class="body" style="color:var(--fg-muted)" data-slot="a_text">${esc(e.a_text)}</p></div>
  <div class="link-line" data-deco aria-hidden="true"><span class="ln"></span><span class="n1"></span><span class="n2"></span></div>
  <div class="card is-raised cb" style="display:flex;flex-direction:column;gap:18px;padding:36px 40px"><span class="pill is-accent" style="align-self:flex-start" data-slot="b_label">${esc(e.b_label)}</span><p class="body" data-slot="b_text">${esc(e.b_text)}</p></div>
</section>`,
  render: `
LV.reveal($('.kicker'), t, 0.05, 0.5, 16); LV.reveal($('.statement'), t, 0.15, 0.6, 24);
LV.reveal($('.ca'), t, 0.5, 0.6, 40);
var d = LV.ease.inOut(LV.prog(t, 1.2, 0.6)); $('.link-line').style.setProperty('--d', d.toFixed(4));
$('.link-line .n1').style.opacity = LV.prog(t, 1.15, 0.1).toFixed(3); $('.link-line .n2').style.opacity = LV.prog(t, 1.75, 0.1).toFixed(3);
LV.reveal($('.cb'), t, 1.7, 0.6, 40);`
},
{
  id: 'check-rows', title: 'Check rows, one by one', duration: 5, hold: 3.9,
  motion: 'Title fades up. Each row rises 0.55 s after the last (from 1.0 s); its tick circle scales in 0.15 s after the row.',
  props: {kicker: P.kicker, title_html: P.title_html, rows: P.rows},
  ex: {kicker: 'Check three', title_html: 'Match the <b>court, date and parties.</b>', rows: ['The court your draft names', 'The date your draft gives', 'The parties your draft names'], scene_index: 5, scene_total: 7, captions: timed('Match the court, the date and the parties.', 0.3, 0.32)},
  body: e => `
<section class="reel-content">
  ${k(e.kicker)}
  <div class="gap-s"></div>
  ${t(e.title_html, 'l')}
  <div class="push"></div>
  <ul class="rows" data-slot-list="rows"><template><li class="row">${tick}<span class="txt" data-field="text"></span></li></template>
  ${e.rows.map(r => `<li class="row">${tick}<span class="txt">${esc(r)}</span></li>`).join('\n  ')}</ul>
  <div class="push"></div>
</section>`,
  render: `
LV.reveal($('.kicker'), t, 0.05, 0.5, 16); LV.reveal($('.statement'), t, 0.15, 0.6, 24);
$$('.rows .row').forEach(function(r, i){ LV.reveal(r, t, 1.0 + i * 0.55, 0.5, 30); var s = LV.ease.settle(LV.prog(t, 1.15 + i * 0.55, 0.35)); r.querySelector('.tick').style.transform = 'scale(' + s.toFixed(4) + ')'; });`
},
{
  id: 'step', title: 'Numbered step', duration: 4.5, hold: 3.4, theme: 'paper',
  motion: 'Badge scales in (0.1 s). Step track fades up; the current step’s thread underline draws (0.6–1.0 s). Calendar settles in (0.8 s). Kicker, statement and supporting line follow (1.0, 1.15, 1.6 s).',
  props: {step: {type: 'integer', minimum: 1, maximum: 6}, steps: {type: 'integer', minimum: 2, maximum: 6}, kicker: P.kicker, title_html: P.title_html, body_html: P.body_html, motif: P.motif},
  ex: {step: 3, steps: 3, kicker: 'Check three', title_html: 'Match the date your <b>draft gives.</b>', body_html: 'Then the court, then the parties.', motif: 'calendar', scene_index: 5, scene_total: 7, captions: timed('Check three. Match the date your draft gives.', 0.3, 0.32)},
  body: e => `
<section class="reel-content">
  <div style="display:flex;align-items:center;gap:32px">
    <span class="badge-num" data-slot="step">${e.step}</span>
    <ol class="step-track" aria-label="Steps" style="display:flex;gap:28px;margin:0;padding:0;list-style:none">${Array.from({length: e.steps}, (_, i) => `<li style="font-size:36px;font-weight:600;letter-spacing:.08em;padding-bottom:12px;position:relative;color:${i + 1 === e.step ? 'var(--accent)' : 'var(--fg-muted)'}">${String(i + 1).padStart(2, '0')}${i + 1 === e.step ? '<span class="cur" aria-hidden="true" style="position:absolute;left:0;right:0;bottom:0;height:4px;border-radius:2px;background:var(--thread);transform-origin:0 50%"></span>' : ''}</li>`).join('')}</ol>
  </div>
  <div class="push"></div>
  ${k(e.kicker)}
  <div class="gap-s"></div>
  ${t(e.title_html, 'l')}
  <div class="gap-m"></div>
  ${b(e.body_html)}
</section>
${motif(e.motif, 560, 470, 460, 380)}`,
  render: `
var bs = LV.ease.settle(LV.prog(t, 0.1, 0.45)); $('.badge-num').style.transform = 'scale(' + bs.toFixed(4) + ')';
LV.reveal($('.step-track'), t, 0.3, 0.5, 12);
var cu = $('.cur'); if (cu) cu.style.transform = 'scaleX(' + LV.ease.inOut(LV.prog(t, 0.6, 0.4)).toFixed(4) + ')';
var m = $('.motif'), p = LV.ease.outQuint(LV.prog(t, 0.8, 0.8)); m.style.opacity = p.toFixed(3); m.style.transform = 'translateY(' + ((1 - p) * 60).toFixed(2) + 'px)';
LV.reveal($('.kicker'), t, 1.0, 0.5, 16); LV.reveal($('.statement'), t, 1.15, 0.6, 24); LV.reveal($('.support'), t, 1.6, 0.6, 16);`
},
{
  id: 'big-number', title: 'Big number / keyword', duration: 4, hold: 3.0,
  motion: 'The number counts up from zero in whole steps (0.3–1.3 s, eased). Unit fades in beside it (1.1 s). Supporting line (1.5 s). For a keyword, set number to text: it rises instead of counting.',
  props: {kicker: P.kicker, number: S({maxLength: 6}), unit: S({maxLength: 26}), body_html: P.body_html},
  ex: {kicker: 'One habit', number: '4', unit: 'lines per citation', body_html: 'Source, paragraph, court-date-parties, and what you checked.', scene_index: 6, scene_total: 7, captions: timed('Four lines per citation. That is the whole habit.', 0.3, 0.32)},
  body: e => `
<section class="reel-content">
  ${k(e.kicker)}
  <div class="push"></div>
  <p class="bigword" data-slot="number">${esc(e.number)}</p>
  <p class="unit" data-slot="unit" style="font-size:72px;line-height:1.05;font-weight:600;letter-spacing:-0.03em;margin:0">${esc(e.unit)}</p>
  <div class="gap-m"></div>
  ${b(e.body_html)}
  <div class="push"></div>
</section>`,
  render: `
LV.reveal($('.kicker'), t, 0.05, 0.5, 16);
var n = $('.bigword'); if (!n.__v) n.__v = n.textContent.trim();
var target = parseFloat(n.__v), p = LV.ease.out(LV.prog(t, 0.3, 1.0));
if (!isNaN(target) && /^\\d+$/.test(n.__v)) { n.textContent = String(Math.round(target * p)); n.style.opacity = LV.prog(t, 0.25, 0.15).toFixed(3); }
else LV.reveal(n, t, 0.3, 0.7, 60);
LV.reveal($('.unit'), t, 1.1, 0.5, 20); LV.reveal($('.support'), t, 1.5, 0.6, 16);`
},
{
  id: 'principle', title: 'Principle card', duration: 4.5, hold: 3.4, theme: 'paper',
  motion: 'The court facade rises into place (0.2–1.2 s). Principle number fades up (0.9 s); statement rises word by word (1.05 s); supporting line (2.0 s). No quotation marks: a principle, not a quote.',
  props: {number: S({maxLength: 14}), title_html: P.title_html, body_html: P.body_html, motif: P.motif},
  ex: {number: 'Principle 04', title_html: 'Your judgment <b>stays yours.</b>', body_html: 'A tool can find and sort. Whether a case helps your client is your call.', motif: 'courthouse', scene_index: 6, scene_total: 7, captions: timed('Your judgment stays yours.', 0.9, 0.36)},
  body: e => `
${motif(e.motif, 90, 330, 620, 450)}
<section class="reel-content">
  <div class="push"></div>
  <p class="principle-no" data-slot="number" style="font-size:36px;font-weight:600;letter-spacing:.16em;color:var(--fg-muted);margin:0">${esc(e.number)}</p>
  <div class="gap-s"></div>
  ${t(e.title_html, 'xl')}
  <div class="gap-m"></div>
  ${b(e.body_html)}
</section>`,
  render: `
var m = $('.motif'), p = LV.ease.outQuint(LV.prog(t, 0.2, 1.0)); m.style.opacity = p.toFixed(3); m.style.transform = 'translateY(' + ((1 - p) * 80).toFixed(2) + 'px)';
LV.reveal($('.principle-no'), t, 0.9, 0.5, 16); LV.wordsIn($('.statement'), t, 1.05, 0.09, 0.55); LV.reveal($('.support'), t, 2.0, 0.6, 16);`
},
{
  id: 'end-card', title: 'End card', duration: 4.5, hold: 3.6,
  motion: 'Mark scales in on its paper disc (0.1 s); wordmark fades (0.4 s); closing line rises word by word (0.6 s); button rises (1.5 s); note fades (1.9 s). The progress thread reaches its last node.',
  props: {title_html: P.title_html, button: P.button, note: P.note},
  ex: {title_html: 'Prepare your case with <b>facts you can check.</b>', button: 'Follow for the next note', note: 'One practice note for advocates, every week.', scene_index: 7, scene_total: 7, captions: timed('Follow for the next note.', 1.4, 0.34)},
  body: e => `
<section class="reel-content" style="align-items:flex-start">
  <div class="push"></div>
  <div class="endmark"><img src="${MARK}" alt="LawVriksh"></div>
  <div class="gap-s"></div>
  <p class="end-word">Law<span>Vriksh</span></p>
  <div class="gap-l"></div>
  ${t(e.title_html, 'l')}
  <div class="gap-l"></div>
  <span class="btn" data-slot="button">${esc(e.button)}</span>
  <div class="gap-s"></div>
  <p class="note" data-slot="note" data-optional>${esc(e.note)}</p>
  <div class="push"></div>
</section>`,
  render: `
var s = LV.ease.settle(LV.prog(t, 0.1, 0.5)); $('.endmark').style.transform = 'scale(' + s.toFixed(4) + ')'; $('.endmark').style.opacity = LV.prog(t, 0.1, 0.2).toFixed(3);
LV.reveal($('.end-word'), t, 0.4, 0.5, 12); LV.wordsIn($('.statement'), t, 0.6, 0.08, 0.55);
LV.reveal($('.btn'), t, 1.5, 0.6, 24); LV.reveal($('.note'), t, 1.9, 0.6, 12);`
}
];

/* ---------- transitions: scene A (dark) -> scene B (paper), switch at the midpoint ---------- */
const TRANS = [
  ['clay-wipe', 'Clay wipe', 'A clay panel sweeps in from the left, covers the frame at the midpoint, and leaves to the right.', '<div class="tw-panel"></div>'],
  ['paper-fold', 'Paper fold', 'Two paper leaves fold in from top and bottom on a centre crease, meet at the midpoint, and fold away.', '<div class="tw-top"></div><div class="tw-bot"></div><div class="tw-crease"></div>'],
  ['stone-slide', 'Stone-block slide', 'Three stone slabs (sand, clay, char) slide up in a stagger, overlap to cover at the midpoint, and lift away.', '<div class="tw-slab s1"></div><div class="tw-slab s2"></div><div class="tw-slab s3"></div>'],
  ['thread-draw', 'Thread draw', 'A clay thread draws across the middle with a travelling node, thickens until it fills the frame at the midpoint, then thins away.', '<div class="tw-thread"></div><div class="tw-node"></div>'],
  ['ink-iris', 'Ink iris from the node', 'Warm ink spreads from the progress thread’s first node to fill the frame, then recedes into the last node.', '<div class="tw-ink"></div>'],
  ['ink-paper-flip', 'Ink-to-paper flip', 'An ink leaf turns in from the right edge; at the midpoint it is face-on, then its paper side turns away to the left.', '<div class="tw-shade"></div><div class="tw-leaf"></div>']
];
function transitionPage([name, title, desc, overlay]){
  const A = scenes[1], B = scenes[2];
  const body = `
<div class="scene-a" data-theme-local="dark" style="background:var(--ink-warm);--fg:var(--paper);--fg-muted:var(--paper-74);--accent:var(--edge);--kicker-c:var(--edge);color:var(--paper)">
  <section class="reel-content"><div class="push"></div><p class="kicker">Check one</p><div class="gap-s"></div><h1 class="statement xl">Find the judgment in an <b>authorised source.</b></h1><div class="push"></div></section>
</div>
<div class="scene-b" style="background:var(--paper) var(--tex-paper) center/cover;--fg:var(--ink);--fg-muted:var(--muted);--accent:var(--clay-dark);--kicker-c:var(--clay-dark);color:var(--ink)">
  <section class="reel-content"><div class="push"></div><p class="kicker">Check two</p><div class="gap-s"></div><h1 class="statement xl">Read the paragraph <b>your point rests on.</b></h1><div class="push"></div></section>
</div>
<div class="tw" aria-hidden="true">${overlay}</div>`;
  const script = `
(function(){
  var root = document.querySelector('.lv'), a = root.querySelector('.scene-a'), b = root.querySelector('.scene-b'), ov = root.querySelector('.tw');
  var T0 = 1.0, TD = 1.0;  // transition window: 1.0–2.0 s, full cover at 1.5 s
  LV.scene({duration: 3, hold: 0.6, render: function(t){
    var p = LV.clamp((t - T0) / TD, 0, 1);
    a.style.display = p < 0.5 ? '' : 'none'; b.style.display = p < 0.5 ? 'none' : '';
    LV.transitions['${name}'](ov, p);
  }});
  window.__transition = {name: '${name}', start: T0, duration: TD, midpoint: T0 + TD / 2};
})();`;
  return page({title: `LawVriksh transition — ${title}`, id: `reel/transition-${name}`, size: '1080x1920', format: 'reel', theme: 'dark', css: ['reel.css'], body, script, meta: {fps: '30', duration: '3', transition: `${name}: 1.0–2.0 s, cover at 1.5 s`}})
    .replace('<script src="../core/lv-objects.js"></script>', '<script src="../core/lv-objects.js"></script>\n<script src="../core/lv-motion.js"></script>');
}

/* ---------- caption styles ---------- */
const CAPDESC = {
  'ink-band': 'Warm-ink bar, paper words; the spoken word sits on a dark-clay chip.',
  'paper-slip': 'Surface slip with a soft shadow; ink words; a thread underline marks the spoken word.',
  'edge-word': 'Rounded ink band; unspoken words a touch dimmer, the spoken word in edge clay.',
  'stack': 'Two large words at a time on a surface card (72 px); the spoken word in dark clay.',
  'highlighter': 'Surface card; the spoken word gets a clay highlighter sweep behind ink text.'
};

export function build(){
  const out = [];
  for (const s of scenes) {
    const ex = {theme: s.theme || 'dark', caption_style: 'ink-band', ...s.ex};
    write(`reel/${s.id}.html`, scenePage({...s, ex}));
    write(`reel/${s.id}.schema.json`, schema(`reel/${s.id}`, s.title, {...s.props, ...common}, Object.keys(s.props).filter(k => !['body_html', 'note', 'motif'].includes(k))));
    write(`reel/${s.id}.example.json`, ex);
    const d = s.duration;
    out.push({family: 'reel', kind: 'reel', id: s.id, title: s.title, role: 'scene', desc: s.motion, slots: Object.keys({...s.props, ...common}), size: '1080x1920', file: `reel/${s.id}.html`, duration: d, checkTimes: [s.hold, d], strip: [0.15, d * 0.18, d * 0.36, d * 0.55, s.hold].map(x => +x.toFixed(2))});
  }
  for (const tr of TRANS) {
    write(`reel/transition-${tr[0]}.html`, transitionPage(tr));
    out.push({family: 'transitions', kind: 'reel', id: `transition-${tr[0]}`, title: tr[1], role: 'transition', desc: tr[2], size: '1080x1920', file: `reel/transition-${tr[0]}.html`, themes: ['dark'], duration: 3, checkTimes: [0.6, 2.6], coverAt: 1.5, strip: [1.0, 1.2, 1.35, 1.5, 1.65, 1.8, 2.0].map(x => +x.toFixed(2)), skipChecks: []});
  }
  for (const style of CAPSTYLES) {
    const base = scenes[1];
    const ex = {theme: 'dark', ...base.ex, caption_style: style, captions: timed('Find the judgment in an authorised source before you file.', 0.2, 0.3)};
    const html_ = scenePage({...base, id: `caption-${style}`, title: `Caption style — ${style}`, ex, capStyle: style});
    write(`reel/caption-${style}.html`, html_);
    out.push({family: 'captions', kind: 'reel', id: `caption-${style}`, title: `Caption — ${style}`, role: 'caption style', desc: CAPDESC[style], size: '1080x1920', file: `reel/caption-${style}.html`, checkTimes: [1.35, 2.6], strip: [0.5, 1.3, 2.1, 2.9]});
  }
  write('reel/captions.schema.json', {$schema: 'https://json-schema.org/draft/2020-12/schema', title: 'Caption track', type: 'object', properties: {caption_style: {enum: CAPSTYLES}, captions: common.captions}});
  return out;
}

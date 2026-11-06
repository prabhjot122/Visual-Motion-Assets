// Shared builders for the LawVriksh system generator.
// The generator writes plain, self-contained HTML/SVG files; edit either the
// generator (to change a whole family) or the emitted file (for one piece).
import {writeFileSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const SYS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const T = {ink:'#171717', inkWarm:'#1c1714', paper:'#f5f1ea', surface:'#fbfaf7', clay:'#c94820', clayDark:'#a93a18', edge:'#cf795d', thread:'#c4562e', muted:'#5a524b'};
export const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

export function write(rel, body){
  const p = path.join(SYS, rel); mkdirSync(path.dirname(p), {recursive:true});
  writeFileSync(p, typeof body === 'string' ? body : JSON.stringify(body, null, 2) + '\n', 'utf8');
}
export const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
/* title_html / body_html: our own example strings only contain <b> and <br> */
export const html = s => String(s ?? '');

export function page({title, id, size, format = 'portrait', theme = 'paper', counter, css = [], body, script = '', meta = {}}){
  const metas = Object.entries({template:id, size, ...meta}).map(([k,v]) => `<meta name="lv:${k}" content="${esc(v)}">`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
${metas}
<link rel="stylesheet" href="../core/lv.css">
${css.map(c => `<link rel="stylesheet" href="${c}">`).join('\n')}
<script src="../core/lv-runtime.js"></script>
<script src="../core/lv-objects.js"></script>
</head>
<body>
<main class="lv" data-format="${format}" data-theme="${theme}"${counter ? ` data-counter="${counter}"` : ''}>
${body.trim()}
</main>
${script ? `<script>\n${script.trim()}\n</script>\n` : ''}</body>
</html>
`;
}

export const MARK = '../../brand/logos/lawvriksh-mark.png';
export const folio = (counter = '02 / 08') => `
<div class="thread" aria-hidden="true"></div>
<footer class="folio">
  <span class="mark"><img src="${MARK}" alt="LawVriksh"></span>
  <span class="wordmark">Law<span>Vriksh</span></span>
  <span class="counter" data-slot="counter">${counter}</span>
</footer>`;

export const tickSVG = (stroke = T.paper) => `<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M7.5 15.5l5 5 10-11" fill="none" stroke="${stroke}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* law object (see core/lv-objects.js): decorative, never under text */
export const motif = (name, x, y, w, h) => `<div class="motif" data-motif="${name}" data-deco aria-hidden="true" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"></div>`;
export const MOTIFS = ['reports','files','checked','open-book','courthouse','calendar','notes','compare','judgment','register'];
/* stones: [cls, x, y, w, h, extraClass] (absolute, decorative) */
export const stones = list => list.map(([tex, x, y, w, h, extra = '']) =>
  `<div class="stone ${tex} ${extra}" data-deco style="left:${x}px;top:${y}px;width:${w}px;height:${h}px" aria-hidden="true"></div>`).join('\n');

/* ---------- greeked document page (SVG, no readable text) ---------- */
export function docPage({w = 420, h = 540, theme = 'paper', kind = 'judgment', highlight = true, seed = 1, margin = true, folded = false, shadow = true}){
  const bg = theme === 'dark' ? T.surface : T.surface;
  const bar = rgba(T.ink, .16), barStrong = rgba(T.ink, .32), hl = rgba(T.clay, .26);
  const pad = Math.round(w * .11), lh = Math.round(h * .036), bh = Math.max(4, Math.round(lh * .38));
  let y = pad, out = [], n = 0;
  const rnd = i => { const x = Math.sin((i + 1) * 12.9898 * seed) * 43758.5453; return x - Math.floor(x); };
  // head block differs by kind
  const head = {
    judgment: () => { out.push(`<rect x="${w/2 - w*.18}" y="${y}" width="${w*.36}" height="${bh+2}" rx="${bh/2}" fill="${barStrong}"/>`); y += lh * 1.4;
                      out.push(`<rect x="${w/2 - w*.26}" y="${y}" width="${w*.52}" height="${bh}" rx="${bh/2}" fill="${bar}"/>`); y += lh * 2; },
    draft:    () => { out.push(`<rect x="${pad}" y="${y}" width="${w*.42}" height="${bh+2}" rx="${bh/2}" fill="${barStrong}"/>`); y += lh * 1.8; },
    filing:   () => { out.push(`<rect x="${pad}" y="${y}" width="${w - pad*2}" height="${lh*2.2}" rx="6" fill="none" stroke="${bar}" stroke-width="2"/>`);
                      out.push(`<rect x="${pad + 14}" y="${y + lh*.6}" width="${w*.34}" height="${bh}" rx="${bh/2}" fill="${barStrong}"/>`); y += lh * 3.2; },
    notes:    () => { y += lh * .4; },
    report:   () => { out.push(`<rect x="${pad}" y="${y}" width="${w*.22}" height="${bh+2}" rx="${bh/2}" fill="${rgba(T.clay,.7)}"/>`); y += lh * 1.6; }
  }[kind] || (() => {});
  head();
  let para = 0, hlDone = false;
  while (y < h - pad - lh) {
    const lines = 3 + Math.floor(rnd(para) * 3);
    const indent = kind === 'judgment' ? Math.round(w * .07) : 0;
    if (kind === 'judgment') out.push(`<rect x="${pad}" y="${y}" width="${bh*2.2}" height="${bh}" rx="${bh/2}" fill="${barStrong}"/>`);
    const isHL = highlight && !hlDone && para === 2;
    for (let l = 0; l < lines && y < h - pad - lh; l++, n++) {
      const full = w - pad*2 - indent, len = l === lines - 1 ? full * (.35 + rnd(n) * .4) : full * (.86 + rnd(n) * .14);
      if (isHL) out.push(`<rect x="${pad + indent - 6}" y="${y - lh*.28}" width="${len + 12}" height="${bh + lh*.56}" rx="4" fill="${hl}"/>`);
      if (kind === 'notes') out.push(`<line x1="${pad}" x2="${w-pad}" y1="${y + bh + lh*.25}" y2="${y + bh + lh*.25}" stroke="${rgba(T.ink,.08)}" stroke-width="1.5"/>`);
      out.push(`<rect x="${pad + indent}" y="${y}" width="${len.toFixed(1)}" height="${bh}" rx="${bh/2}" fill="${bar}"/>`);
      y += lh;
    }
    if (isHL) { hlDone = true; if (margin) out.push(`<rect x="${pad*.36}" y="${y - lh*lines - lh*.28}" width="4" height="${lh*lines}" rx="2" fill="${T.clay}"/>`); }
    y += lh * .7; para++;
  }
  const fold = folded ? `<path d="M${w-56} 0 L${w} 56 L${w-56} 56 Z" fill="${rgba(T.ink,.08)}"/><path d="M${w-56} 0 L${w} 56 L${w} 0 Z" fill="${T.paper}"/>` : '';
  const sh = shadow ? `<rect x="10" y="14" width="${w}" height="${h}" rx="6" fill="${rgba(T.ink, theme === 'dark' ? .5 : .16)}" filter="url(#blur)"/>` : '';
  return {w, h, inner: `${sh}<rect width="${w}" height="${h}" rx="6" fill="${bg}"/><rect width="${w}" height="${h}" rx="6" fill="none" stroke="${rgba(T.ink,.10)}" stroke-width="1.5"/>${out.join('')}${fold}`};
}
export const blurDef = (sd = 12) => `<defs><filter id="blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${sd}"/></filter></defs>`;
export function docSVG(opts){
  const d = docPage(opts), m = 40;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-m} ${-m} ${d.w + m*2} ${d.h + m*2}" width="${d.w + m*2}" height="${d.h + m*2}" aria-hidden="true">${blurDef()}${d.inner}</svg>`;
}

export const STR = {type:'string'};
export const S = (o) => ({type:'string', ...o});
export function schema(id, title, props, required = []){
  return {
    $schema:'https://json-schema.org/draft/2020-12/schema',
    $id:`lawvriksh-system/${id}.schema.json`, title, type:'object', additionalProperties:false,
    properties:{
      theme:{enum:['paper','dark'], default:'paper', description:'Ground: paper grain or solid warm ink'},
      ...props
    },
    required
  };
}
export const P = {
  kicker: S({maxLength:36, description:'Uppercase tracked kicker, clay (edge on dark). Keep under ~28 characters.'}),
  title_html: S({maxLength:110, pattern:'^(?!.*<(?!/?b>|br ?/?>)).*$', description:'Statement. Emphasis with <b>…</b> (clay), at most two phrases. Only <b> and <br> are allowed; never <i>.'}),
  body_html: S({maxLength:180, pattern:'^(?!.*<(?!/?b>|br ?/?>)).*$', description:'Muted supporting line. Optional <b> emphasis.'}),
  counter: {type:'object', properties:{index:{type:'integer', minimum:1}, total:{type:'integer', minimum:1}}, required:['index','total'], description:'Page counter; also positions the thread node.'},
  rows: {type:'array', minItems:1, maxItems:4, items:S({maxLength:56}), description:'Check rows: clay circle with a paper tick.'},
  pills: {type:'array', minItems:1, maxItems:4, items:{type:'object', properties:{text:S({maxLength:22}), variant:{enum:['default','accent','outline']}}, required:['text']}},
  button: S({maxLength:28}), note: S({maxLength:90}),
  image: S({description:'Relative path to a licensed image. Leave empty to show the labelled frame.'}),
  image_label: S({maxLength:60}),
  motif: {enum:['reports','files','checked','open-book','courthouse','calendar','notes','compare','judgment','register'], description:'Law object drawn from the library materials; pick the one that matches the idea of the page.'}
};

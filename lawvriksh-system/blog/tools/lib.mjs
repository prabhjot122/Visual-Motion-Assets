// Page and schema helpers for the blog templates (files live in blog/<family>/, so core is ../../core).
import {write, esc, T} from './common.mjs';
export {write, esc, T};
export const MARK = '../../../brand/logos/lawvriksh-mark.png';
export const tickSVG = (stroke = T.paper) => `<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M7.5 15.5l5 5 10-11" fill="none" stroke="${stroke}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const tick = `<span class="tick">${tickSVG()}</span>`;
export const html = s => String(s ?? '');

export function page({title, id, size, format, theme = 'paper', css = [], body, script = '', meta = {}, rootStyle = ''}){
  const metas = Object.entries({template: id, size, ...meta}).map(([k, v]) => `<meta name="lv:${k}" content="${esc(v)}">`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
${metas}
<link rel="stylesheet" href="../../core/lv.css">
${css.map(c => `<link rel="stylesheet" href="${c}">`).join('\n')}
<script src="../../core/lv-runtime.js"></script>
<script src="../../core/lv-objects.js"></script>
<script src="../blog.js"></script>
</head>
<body>
<main class="lv" data-format="${format}" data-theme="${theme}"${rootStyle ? ` style="${rootStyle}"` : ''}>
${body.trim()}
</main>
${script ? `<script>\n${script.trim()}\n</script>\n` : ''}</body>
</html>
`;
}

export const S = o => ({type: 'string', ...o});
const NO_RAW = '^(?!.*<(?!/?b>|br ?/?>)).*$';
export const P = {
  kicker: S({maxLength: 40, description: 'Uppercase tracked kicker (clay; edge on dark).'}),
  title_html: S({maxLength: 90, pattern: NO_RAW, description: 'Headline. Emphasis with <b>…</b> (clay), at most two phrases. Only <b> and <br> are allowed; never <i>.'}),
  body_html: S({maxLength: 120, pattern: NO_RAW, description: 'Muted supporting line. Optional <b> emphasis.'}),
  meta: S({maxLength: 36, description: 'Right side of the footer, e.g. “[n] min read”.'}),
  motif: {enum: ['reports', 'files', 'checked', 'open-book', 'courthouse', 'calendar', 'notes', 'compare', 'judgment', 'register'], description: 'Law object from core/lv-objects.js; pick the one that matches the idea.'},
  image: S({description: 'Relative path to a licensed image. Leave empty to show the labelled frame.'}),
  image_alt: S({maxLength: 120}), image_label: S({maxLength: 40})
};
export function schema(id, title, props, required = []){
  return {$schema: 'https://json-schema.org/draft/2020-12/schema', $id: `lawvriksh-system/blog/${id}.schema.json`, title, type: 'object', additionalProperties: false,
    properties: {theme: {enum: ['paper', 'dark'], default: 'paper', description: 'Ground: paper or solid warm ink.'}, ...props}, required};
}

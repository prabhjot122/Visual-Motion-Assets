// Slot audit: for every slot in a template's schema, fill a unique marker and require that it is visible on the page;
// then require that none of the example's text stays visible after the fill.
//   node blog/tools/audit.mjs --index tools/index.json --family carousel,static,reel    (audit the existing library, report only)
//   (blog/tools/render.mjs imports slotAudit and runs it for every blog template)
import {existsSync} from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {SYS, BLOG, arg, launch, readJSON} from './common.mjs';

const short = key => 'Q' + [...key].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 46656, 7).toString(36).toUpperCase().padStart(3, '0');
const marker = (key, i, maxLen) => { const m = maxLen && maxLen < 9 ? short(key).slice(0, maxLen) + (i ? i : '') : `${short(key)}x${key.replace(/[^a-z]/gi, '').slice(0, 6)}${i || ''}`; return maxLen ? m.slice(0, maxLen) : m; };

/** Build the marker data for a schema. Returns {data, expect:[{key, texts[]}], special:[...]} */
export function buildMarkers(schema, example){
  const data = {}, expect = [], special = [];
  for (const [key, p] of Object.entries(schema.properties || {})) {
    if (key === 'theme') continue;
    if (key === 'counter') { data.counter = {index: 7, total: 9}; special.push({key, kind: 'counter', want: '07 / 09'}); continue; }
    if (key === 'scene_index' || key === 'scene_total') { data[key] = key === 'scene_index' ? 4 : 6; continue; }
    if (key === 'caption_style') { data[key] = (p.enum || []).find(v => v !== example?.caption_style) || p.enum?.[0]; special.push({key, kind: 'captionStyle', want: data[key]}); continue; }
    if (key === 'captions') { data.captions = [{w: 'QCAPAAA', s: 0.2, e: 0.5}, {w: 'QCAPBBB', s: 0.5, e: 0.8}]; special.push({key, kind: 'captions', want: ['QCAPAAA', 'QCAPBBB']}); continue; }
    if (key === 'image') { special.push({key, kind: 'image'}); continue; }
    if (key === 'image_alt') { data.image_alt = 'QALTTEXT'; special.push({key, kind: 'alt', want: 'QALTTEXT'}); continue; }
    if (key === 'motif') { data.motif = (p.enum || []).find(v => v !== example?.motif) || p.enum?.[0]; special.push({key, kind: 'motif', want: data.motif}); continue; }
    if (key === 'step' && p.type === 'integer') { data.step = 2; special.push({key, kind: 'step', want: '2'}); continue; }
    if (key === 'steps' && p.type === 'integer') { data.steps = 5; special.push({key, kind: 'steps', want: 5}); continue; }
    if (p.type === 'integer') { data[key] = 5; expect.push({key, texts: ['5']}); continue; }
    if (p.enum) { data[key] = p.enum.find(v => v !== example?.[key]) ?? p.enum[0]; special.push({key, kind: 'enum', want: data[key]}); continue; }
    if (p.type === 'array') {
      const n = Math.min(p.maxItems || 3, Math.max(p.minItems || 1, 3)), items = [], texts = [];
      for (let i = 0; i < n; i++) {
        const it = p.items || {};
        if (it.type === 'object') { const o = {}; for (const [k2, p2] of Object.entries(it.properties || {})) o[k2] = k2 === 'variant' ? (p2.enum?.[0] ?? 'default') : (k2 === 'text' ? marker(key, i, p2.maxLength) : marker(key + k2, i, p2.maxLength)); items.push(o); texts.push(o.text ?? Object.values(o)[0]); }
        else { const m = marker(key, i, it.maxLength); items.push(m); texts.push(m); }
      }
      data[key] = items; expect.push({key, texts}); continue;
    }
    if (p.type === 'string') {
      const html = /_html$/.test(key);
      const m = marker(key, 0, p.maxLength); data[key] = html && (!p.maxLength || p.maxLength > 40) ? `${m} <b>${m}B</b>` : m;
      expect.push({key, texts: (html && (!p.maxLength || p.maxLength > 40)) ? [m, `${m}B`] : [m]});
    }
  }
  return {data, expect, special};
}

const visibleTextFn = () => {
  const root = document.querySelector('.lv'); const out = [];
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) {
    if (!n.nodeValue.trim()) continue; const el = n.parentElement; if (!el || el.closest('template,script,style')) continue;
    let e = el, ok = true; while (e && e !== document.body) { const c = getComputedStyle(e); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity < 0.02) { ok = false; break; } e = e.parentElement; }
    if (ok) out.push(n.nodeValue.replace(/\s+/g, ' ').trim());
  }
  return out.join(' ¦ ');
};

const leaves = (v, out = []) => { if (typeof v === 'string') out.push(v); else if (Array.isArray(v)) v.forEach(x => leaves(x, out)); else if (v && typeof v === 'object') Object.values(v).forEach(x => leaves(x, out)); return out; };
const stripTags = s => s.replace(/<[^>]+>/g, '');

export async function slotAudit(pg, url, {schema, example, reel = false, imageSample}){
  const problems = [];
  const {data, expect, special} = buildMarkers(schema, example);
  const load = async () => { await pg.goto(url, {waitUntil: 'load'}); await pg.evaluate(() => window.__lvReady); };
  // ---- phase A: markers in every slot except image ----
  await load();
  const theme = schema.properties?.theme ? 'dark' : null; if (theme) data.theme = (example?.theme === 'dark' ? 'paper' : 'dark');
  await pg.evaluate(d => LV.fill(d), data);
  if (reel) await pg.evaluate(() => window.__renderAt(window.__holdAt));
  await new Promise(r => setTimeout(r, 40));
  const text = await pg.evaluate(visibleTextFn);
  for (const e of expect) for (const t of e.texts) if (!text.includes(t)) problems.push({slot: e.key, issue: 'value does not appear', value: t});
  for (const s of special) {
    if (s.kind === 'counter' || s.key === 'scene_index') { const want = s.kind === 'counter' ? s.want : '04 / 06'; if (!text.includes(want)) problems.push({slot: s.key, issue: 'counter text does not appear', want}); }
    if (s.kind === 'motif') { const ok = await pg.evaluate(w => { const m = document.querySelector('[data-motif]'); return !!m && m.getAttribute('data-motif') === w && !!m.querySelector('svg'); }, s.want); if (!ok) problems.push({slot: 'motif', issue: 'object did not change', want: s.want}); }
    if (s.kind === 'alt') { const ok = await pg.evaluate(w => !![...document.querySelectorAll('img')].find(i => i.getAttribute('alt') === w), s.want); if (!ok) problems.push({slot: 'image_alt', issue: 'alt text not applied'}); }
    if (s.kind === 'step' && !text.split(' ¦ ').includes(s.want)) problems.push({slot: 'step', issue: 'step number does not appear'});
    if (s.kind === 'steps') { const n = await pg.evaluate(() => document.querySelectorAll('.step-track li, .step-track > *').length); if (n !== s.want) problems.push({slot: 'steps', issue: 'step count does not render', want: s.want, got: n}); }
    if (s.kind === 'captionStyle') { const ok = await pg.evaluate(w => !!document.querySelector('[data-cap]')?.classList.contains(w), s.want); if (!ok) problems.push({slot: 'caption_style', issue: 'style not applied'}); }
    if (s.kind === 'enum') { const ok = await pg.evaluate(w => document.documentElement.innerHTML.includes(w) || document.querySelector('.lv').className.includes(w) || !![...document.querySelectorAll('.lv *')].find(e => e.className && String(e.className).includes(w)), s.want); if (!ok) problems.push({slot: s.key, issue: 'enum value has no visible effect', want: s.want}); }
  }
  if (special.find(s => s.kind === 'captions')) {
    await pg.evaluate(() => window.__renderAt(0.6)); await new Promise(r => setTimeout(r, 40));
    const ct = await pg.evaluate(() => document.querySelector('[data-cap] .cap-line')?.textContent || '');
    for (const w of ['QCAPAAA', 'QCAPBBB']) if (!ct.includes(w)) problems.push({slot: 'captions', issue: 'caption words do not appear', value: w});
  }
  // theme slot
  if (schema.properties?.theme) { const th = await pg.evaluate(() => document.querySelector('.lv').getAttribute('data-theme')); if (th !== data.theme) problems.push({slot: 'theme', issue: 'theme not applied'}); }
  // ---- leftover example text ----
  const ex = leaves(example || {}).map(stripTags).map(s => s.trim()).filter(s => s.length >= 4 && !/^\d+$/.test(s) && !/^(paper|dark)$/.test(s));
  const leftover = [...new Set(ex)].filter(s => text.includes(s));
  for (const s of leftover) problems.push({issue: 'example text still visible after fill', value: s});
  // ---- phase B: image slot ----
  if (special.find(s => s.kind === 'image')) {
    await load();
    await pg.evaluate(d => LV.fill(d), {image: imageSample});
    const r = await pg.evaluate(() => { const i = document.querySelector('[data-slot-src]'); return i ? {src: i.getAttribute('src'), shown: getComputedStyle(i).display !== 'none', filled: !!i.closest('.slot-frame')?.classList.contains('is-filled')} : null; });
    if (!r || r.src !== imageSample || !r.shown) problems.push({slot: 'image', issue: 'image does not render', got: r});
    // and with image empty the labelled frame must show its label
  }
  return problems;
}

/* ---------- CLI: audit existing library templates (report only) ---------- */
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const index = readJSON(path.join(SYS, arg('index', 'tools/index.json')));
  const fams = (arg('family', 'carousel,static,reel')).split(',');
  const browser = await launch(); const pg = await browser.newPage(); const report = [];
  const imageSample = '../previews/carousel/statement-paper.png';
  for (const e of index.filter(e => fams.includes(e.family) && e.file.endsWith('.html'))) {
    const dir = path.dirname(path.join(SYS, e.file)), base = path.basename(e.file, '.html');
    const schemaP = [path.join(dir, base + '.schema.json'), path.join(dir, base.replace(/-(ig|li)$/, '') + '.schema.json')].find(existsSync);
    if (!schemaP) { continue; }
    const [W, H] = e.size.split('x').map(Number); await pg.setViewport({width: W, height: H});
    const probs = await slotAudit(pg, pathToFileURL(path.join(SYS, e.file)).href, {schema: readJSON(schemaP), example: readJSON(path.join(dir, base + '.example.json')), reel: e.kind === 'reel', imageSample});
    report.push({file: e.file, problems: probs}); console.log(`${probs.length ? 'FAIL' : 'ok  '} ${e.file}${probs.length ? '  ' + JSON.stringify(probs) : ''}`);
  }
  await browser.close();
  const failed = report.filter(r => r.problems.length);
  console.log(`\n${report.length} templates audited, ${failed.length} failing`);
  if (arg('out')) (await import('node:fs')).writeFileSync(arg('out'), JSON.stringify(report, null, 1));
}

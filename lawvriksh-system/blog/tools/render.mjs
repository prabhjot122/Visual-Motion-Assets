// Render previews and run every check for the blog templates:
//   the eight system checks (fonts, italics, palette, overlap, safe area, min size, contrast, arrows),
//   the slot audit (every schema slot renders; no example text left after a fill),
//   and, for thumbnails, the 1.91:1 crop band and 300 px legibility checks.
//   node lawvriksh-system/blog/tools/render.mjs --only thumbnails [--id statement-only-og] [--runtime <puppeteer-core node_modules>]
import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import path from 'node:path';
import {BLOG, SYS, arg, launch, fileUrl, readJSON} from './common.mjs';
import {checkPage} from './checks.mjs';
import {slotAudit} from './audit.mjs';

const only = arg('only') ? arg('only').split(',') : null, onlyId = arg('id'), onlyGroup = arg('group');
const index = readJSON(path.join(BLOG, 'tools/index.json'));
const items = index.filter(e => (!only || only.includes(e.family)) && (!onlyId || e.id === onlyId) && (!onlyGroup || e.group === onlyGroup));
const browser = await launch();
const checksP = path.join(BLOG, 'previews/checks.json');
const prev = existsSync(checksP) ? readJSON(checksP) : [];
const results = [];
const minPxFor = W => W <= 720 ? 24 : W <= 1080 ? 34 : 40;
const BAND = {sq: [257, 822], pt: [392, 958]};

try {
  for (const e of items) {
    const [W, H0] = e.size.split('x').map(Number);
    const isArticle = e.family === 'article', isGfx = e.family === 'graphics';
    for (const theme of e.themes || ['paper', 'dark']) {
      const pg = await browser.newPage();
      const errors = [], net = [];
      pg.on('pageerror', x => errors.push(String(x)));
      pg.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      pg.on('request', r => { if (!/^(file|data):/.test(r.url())) net.push(r.url()); });
      await pg.setViewport({width: W, height: H0, deviceScaleFactor: 1});
      const url = fileUrl('blog/' + e.file) + `?theme=${theme}`;
      await pg.goto(url, {waitUntil: 'load'});
      await pg.evaluate(() => window.__lvReady);
      await pg.evaluate(() => { if (window.LV && LV.fitAll) LV.fitAll(); });
      let H = H0;
      if (isGfx || isArticle) { H = await pg.evaluate(() => Math.ceil(document.querySelector('.lv').getBoundingClientRect().height)); await pg.setViewport({width: W, height: Math.min(H, 8000), deviceScaleFactor: 1}); await pg.evaluate(() => LV.fitAll && LV.fitAll()); }
      await new Promise(r => setTimeout(r, 40));
      const opts = {W, H, reel: false, skip: e.skipChecks || [], textCheck: true, minPx: minPxFor(W), safeX: isGfx ? 24 : 56, flat: isGfx || isArticle};
      const check = await pg.evaluate(checkPage, opts);
      const extra = {};
      if (e.kind === 'thumbnail') {
        const t = await pg.evaluate(() => { const h = document.querySelector('.statement'); const r = h.getBoundingClientRect(); return {top: r.top, bottom: r.bottom, fs: parseFloat(getComputedStyle(h).fontSize)}; });
        extra.titleFont = t.fs; extra.preview300Px = +(t.fs * 300 / W).toFixed(1);
        check.pass.preview300 = t.fs * 300 / W >= 16;
        if (!check.pass.preview300) check.problems.push({check: 'preview300', fs: t.fs});
        if (BAND[e.fmt]) { check.pass.cropBand = t.top >= BAND[e.fmt][0] - 1 && t.bottom <= BAND[e.fmt][1] + 1; extra.titleBox = [Math.round(t.top), Math.round(t.bottom)]; if (!check.pass.cropBand) check.problems.push({check: 'cropBand', band: BAND[e.fmt], title: [Math.round(t.top), Math.round(t.bottom)]}); }
      }
      // ---- screenshot ----
      const outDir = path.join(BLOG, 'previews', e.family); mkdirSync(outDir, {recursive: true});
      await pg.evaluate(t => window.scrollTo(0, 0));
      await pg.screenshot({path: path.join(outDir, `${e.id}-${theme}.png`), clip: {x: 0, y: 0, width: W, height: Math.min(H, 16000)}, captureBeyondViewport: true});
      // ---- slot audit ----
      let audit = [];
      if (e.schema && !arg('noaudit')) {
        const schema = readJSON(path.join(BLOG, e.schema)), example = readJSON(path.join(BLOG, e.example));
        audit = await slotAudit(pg, url.replace(/\?theme=\w+/, ''), {schema, example, imageSample: '../../previews/carousel/statement-paper.png'});
        await pg.setViewport({width: W, height: H0});
      }
      check.pass.slotAudit = audit.length === 0; if (audit.length) check.problems.push(...audit.map(a => ({check: 'slotAudit', ...a})));
      check.errors = errors; check.network = net;
      const rec = {family: e.family, id: e.id, file: e.file, theme, size: e.size, renderedHeight: H, ...check, ...extra};
      results.push(rec);
      const fails = Object.entries(check.pass).filter(([, v]) => !v).map(([k]) => k);
      console.log(`${fails.length || errors.length || net.length ? 'FAIL' : 'ok  '} ${e.family}/${e.id} [${theme}]${fails.length ? ' -> ' + fails.join(', ') + ' ' + JSON.stringify(check.problems.slice(0, 3)) : ''}${errors.length ? ' ERR ' + errors[0] : ''}${net.length ? ' NET ' + net[0] : ''}`);
      await pg.close();
    }
  }
} finally { await browser.close(); }
const key = r => `${r.file}|${r.theme}`;
const merged = new Map(prev.map(r => [key(r), r])); for (const r of results) merged.set(key(r), r);
mkdirSync(path.dirname(checksP), {recursive: true});
writeFileSync(checksP, JSON.stringify([...merged.values()].sort((a, b) => key(a) < key(b) ? -1 : 1), null, 1) + '\n');
const failed = results.filter(r => Object.values(r.pass).some(v => !v) || r.errors.length || r.network.length);
console.log(`\n${results.length} renders, ${failed.length} with failures`);

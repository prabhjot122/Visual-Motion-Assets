// Render previews and run the self-checks for every template in tools/index.json.
// Uses an existing puppeteer-core install and an existing Chromium; installs nothing.
//   node lawvriksh-system/tools/render.mjs --runtime D:/lv-frontend/motion-demo/hyperframes/node_modules \
//        [--chrome <path to chrome.exe>] [--only carousel,static] [--id cover-stack]
import {readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import os from 'node:os';
import {SYS} from './lib.mjs';
import {checkPage} from './checks.mjs';

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i < 0 ? d : process.argv[i + 1]; };
const runtime = arg('runtime', process.env.LV_PUPPETEER || 'D:/lv-frontend/motion-demo/hyperframes/node_modules');
const req = createRequire(pathToFileURL(path.join(path.resolve(runtime), '../package.json')));
const puppeteer = req('puppeteer-core');
function findChrome(){
  if (arg('chrome')) return arg('chrome');
  const base = path.join(os.homedir(), 'AppData/Local/ms-playwright');
  if (existsSync(base)) for (const d of readdirSync(base).filter(d => /^chromium-\d+/.test(d)).sort().reverse())
    for (const sub of ['chrome-win64/chrome.exe','chrome-win/chrome.exe','chrome-linux/chrome','chrome-linux64/chrome']) { const p = path.join(base, d, sub); if (existsSync(p)) return p; }
  throw Error('No Chromium found; pass --chrome');
}
const only = arg('only') ? arg('only').split(',') : null, onlyId = arg('id');
const index = JSON.parse(readFileSync(path.join(SYS, 'tools/index.json'), 'utf8'));
const items = index.filter(e => (!only || only.includes(e.family)) && (!onlyId || e.id === onlyId) && e.file.endsWith('.html'));

const browser = await puppeteer.launch({executablePath: findChrome(), headless: true, args: ['--allow-file-access-from-files', '--font-render-hinting=none', '--disable-lcd-text', '--force-color-profile=srgb']});
const results = [];
// ---- individual SVG previews (transparent PNG at the graphic's own size; icons at 96 px) ----
if (!only || only.includes('svg')) {
  const svgs = index.filter(e => e.file.endsWith('.svg') && (!onlyId || e.id === onlyId));
  const pg = await browser.newPage();
  for (const e of svgs) {
    const src = readFileSync(path.join(SYS, e.file), 'utf8');
    const vb = (src.match(/viewBox="([^"]+)"/) || [])[1].split(/[\s,]+/).map(Number);
    const icon = e.group === 'icons', scale = icon ? 4 : Math.min(1, 1200 / vb[2]);
    const W = Math.round(vb[2] * (icon ? 1 : scale)), H = Math.round(vb[3] * (icon ? 1 : scale));
    await pg.setViewport({width: W, height: H, deviceScaleFactor: icon ? 4 : 1});
    const url = pathToFileURL(path.join(SYS, e.file)).href;
    await pg.goto(url, {waitUntil: 'load'});
    await pg.evaluate((W, H) => { const s = document.documentElement; s.setAttribute('width', W); s.setAttribute('height', H); }, W, H);
    await new Promise(r => setTimeout(r, 60));
    const dir = path.join(SYS, 'previews/svg', e.group); mkdirSync(dir, {recursive: true});
    await pg.screenshot({path: path.join(dir, `${e.id}.png`), omitBackground: true, clip: {x: 0, y: 0, width: W, height: H}});
  }
  await pg.close();
  console.log(`${svgs.length} svg previews`);
}
const checksPath = path.join(SYS, 'previews/checks.json');
const prev = existsSync(checksPath) ? JSON.parse(readFileSync(checksPath, 'utf8')) : [];
try {
  for (const e of items) {
    const [W, H] = e.size.split('x').map(Number);
    for (const theme of (e.themes || ['paper', 'dark'])) {
      const pg = await browser.newPage();
      const errors = [], net = [];
      pg.on('pageerror', x => errors.push(String(x)));
      pg.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      pg.on('request', r => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:')) net.push(r.url()); });
      await pg.setViewport({width: W, height: H, deviceScaleFactor: 1});
      const url = pathToFileURL(path.join(SYS, e.file)).href + `?theme=${theme}`;
      await pg.goto(url, {waitUntil: 'load'});
      await pg.evaluate(() => window.__lvReady);
      const times = e.kind === 'reel' ? (e.checkTimes || [await pg.evaluate(() => window.__holdAt)]) : [null];
      const outDir = path.join(SYS, 'previews', e.family); mkdirSync(outDir, {recursive: true});
      let check = null;
      for (const [ti, t] of times.entries()) {
        if (t != null) await pg.evaluate(tt => window.__renderAt(tt), t);
        await new Promise(r => setTimeout(r, 30));
        const c = await pg.evaluate(checkPage, {W, H, reel: e.kind === 'reel', skip: e.skipChecks || [], textCheck: t == null || ti < (e.textCheckCount ?? 99)});
        check = check ? merge(check, c, t) : {...c, at: t};
        if (ti === 0) await pg.screenshot({path: path.join(outDir, `${e.id}-${theme}.png`), clip: {x: 0, y: 0, width: W, height: H}});
      }
      if (e.kind === 'reel' && e.strip) {
        const sd = path.join(SYS, 'previews/_frames', e.family); mkdirSync(sd, {recursive: true});
        for (const [si, t] of e.strip.entries()) { await pg.evaluate(tt => window.__renderAt(tt), t); await pg.screenshot({path: path.join(sd, `${e.id}-${theme}-${String(si).padStart(2,'0')}.png`), clip: {x: 0, y: 0, width: W, height: H}}); }
      }
      if (e.coverAt != null) {
        await pg.evaluate(tt => window.__renderAt(tt), e.coverAt);
        const cover = await pg.evaluate((W, H) => { const ov = document.querySelector('.tw'); let miss = 0, n = 0;
          for (let x = 2; x < W; x += 41) for (let y = 2; y < H; y += 47) { n++; const hit = document.elementFromPoint(x, y); if (!hit || !ov.contains(hit)) miss++; }
          return {miss, n}; }, W, H);
        check.pass.fullCover = cover.miss === 0; check.cover = cover;
        if (cover.miss) check.problems.push({check: 'fullCover', miss: cover.miss, of: cover.n});
        const sd = path.join(SYS, 'previews', e.family); await pg.screenshot({path: path.join(sd, `${e.id}-midpoint.png`), clip: {x: 0, y: 0, width: W, height: H}});
      }
      check.errors = errors; check.network = net;
      results.push({family: e.family, id: e.id, file: e.file, theme, size: e.size, ...check});
      const fails = Object.entries(check.pass).filter(([, v]) => !v).map(([k]) => k);
      console.log(`${fails.length ? 'FAIL' : 'ok  '} ${e.family}/${e.id} [${theme}]${fails.length ? ' -> ' + fails.join(', ') + ' ' + JSON.stringify(check.problems.slice(0, 4)) : ''}${errors.length ? ' ERR ' + errors[0] : ''}`);
      await pg.close();
    }
  }
} finally { await browser.close(); }
function merge(a, b, t){
  const pass = {}; for (const k of Object.keys(a.pass)) pass[k] = a.pass[k] && b.pass[k];
  return {...a, pass, minFont: Math.min(a.minFont, b.minFont), minContrast: Math.min(a.minContrast, b.minContrast), problems: a.problems.concat(b.problems.map(p => ({...p, t})))};
}
const keyOf = r => `${r.file}|${r.theme}`;
const merged = new Map(prev.map(r => [keyOf(r), r])); for (const r of results) merged.set(keyOf(r), r);
mkdirSync(path.dirname(checksPath), {recursive: true});
writeFileSync(checksPath, JSON.stringify([...merged.values()].sort((a, b) => keyOf(a) < keyOf(b) ? -1 : 1), null, 1) + '\n');
const failed = results.filter(r => Object.values(r.pass).some(v => !v));
console.log(`\n${results.length} renders, ${failed.length} with failures`);

// Reel v3 debugging aid: load a reel scene project, seek its timeline, list the elements under a pixel.
//   node reel-v3/probe.mjs reel-opening 5.875 110 1300
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const hf = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'hyperframes');
const require = createRequire(path.join(hf, 'package.json'));
const puppeteer = require('puppeteer-core');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };
const server = createServer(async (req, res) => {
  const file = path.join(hf, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  let body; try { body = await readFile(file); } catch { return res.writeHead(404).end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' }).end(body);
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const [proj, t, x, y] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, defaultViewport: { width: 1080, height: 1920 } });
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('pageerror', e.message)); page.on('console', (m) => console.error('console', m.text())); page.on('requestfailed', (r) => console.error('failed', r.url()));
await page.evaluateOnNewDocument(() => { window.__timelines = {}; });
await page.goto(`http://127.0.0.1:${server.address().port}/${proj}/index.html`, { waitUntil: 'networkidle0' });
await page.waitForFunction((p) => !!window.__timelines[p], { timeout: 15000, polling: 200 }, proj).catch(async () => { console.error('keys', await page.evaluate(() => Object.keys(window.__timelines))); process.exit(1); });
const out = await page.evaluate((p, t, x, y) => {
  window.__timelines[p].seek(+t, false);
  const hit = [...document.querySelectorAll('#root *')].filter((e) => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.left <= +x && r.right >= +x && r.top <= +y && r.bottom >= +y && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.01; }).reverse();
  return hit.slice(0, 10).map((e) => `${e.tagName.toLowerCase()}#${e.id}.${[...e.classList].join('.')} "${(e.textContent || '').trim().slice(0, 40)}" parent=${e.parentElement?.id}`);
}, proj, t, x, y);
console.log(out.join('\n'));
await browser.close(); server.close();

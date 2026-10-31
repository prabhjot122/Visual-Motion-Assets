// Read hand-off geometry that one web-cut part measures on its own scene (window.__lvMeasure),
// so the next part can continue from exactly there.   node motion-demo/web-cut/measure.mjs web-s3
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const hf = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'hyperframes');
const require = createRequire(path.join(hf, 'package.json'));
const puppeteer = require('puppeteer-core');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };
const server = createServer(async (req, res) => {
  const file = path.join(hf, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  let body; try { body = await readFile(file); } catch { return res.writeHead(404).end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' }).end(body);
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, defaultViewport: { width: 1440, height: 1000 } });
const page = await browser.newPage();
await page.evaluateOnNewDocument(() => { window.__timelines = {}; });
await page.goto(`http://127.0.0.1:${server.address().port}/${process.argv[2]}/index.html`, { waitUntil: 'networkidle0' });
await page.waitForFunction(() => window.__lvMeasure, { timeout: 30000 });
console.log(JSON.stringify(await page.evaluate(() => window.__lvMeasure)));
await browser.close(); server.close();

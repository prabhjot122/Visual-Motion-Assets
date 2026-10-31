// Render the web-cut style frames (motion-demo/web-cut/frames/*.html) to PNG.
//
//   node motion-demo/web-cut/render-frames.mjs [name ...]   (adapted from scripts/render-stills.mjs)
//
// Uses the isolated puppeteer-core under motion-demo/hyperframes and the
// installed Edge. Serves motion-demo/ on an ephemeral localhost port so
// relative textures/fonts resolve; no remote requests are allowed.
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); // motion-demo/
const require = createRequire(path.join(root, 'hyperframes', 'package.json'));
const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };

const server = createServer(async (req, res) => {
  const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(root)) return res.writeHead(403).end();
  let body;
  try {
    body = await readFile(file);
  } catch {
    return res.writeHead(404).end();
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' }).end(body);
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${server.address().port}`;

const stillsDir = path.join(root, 'web-cut', 'frames');
const wanted = process.argv.slice(2);
const names = (await readdir(stillsDir)).filter((f) => f.endsWith('.html')).map((f) => f.slice(0, -5)).filter((n) => !wanted.length || wanted.includes(n));

const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ['--no-first-run', '--disable-extensions'] });
try {
  for (const name of names) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.setRequestInterception(true);
    page.on('request', (r) => (r.url().startsWith(base) ? r.continue() : r.abort()));
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`${base}/web-cut/frames/${name}.html`, { waitUntil: 'networkidle0' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => (i.onload = i.onerror = r)))));
    });
    const out = path.join(root, 'web-cut', 'renders', `${name}.png`);
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1440, height: 1000 } });
    console.log(errors.length ? `${name}: ERRORS ${errors.join(' | ')}` : `${name}: ok`);
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}

// Shared helpers for the blog tools: browser launch (existing puppeteer-core + existing Chromium), paths, file writing.
import {readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
import {pathToFileURL, fileURLToPath} from 'node:url';

export const BLOG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SYS = path.resolve(BLOG, '..');
export const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i < 0 ? d : process.argv[i + 1]; };
export const T = {ink:'#171717', inkWarm:'#1c1714', paper:'#f5f1ea', surface:'#fbfaf7', clay:'#c94820', clayDark:'#a93a18', edge:'#cf795d', thread:'#c4562e', muted:'#5a524b'};
export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function write(rel, body){
  const p = path.join(BLOG, rel); mkdirSync(path.dirname(p), {recursive: true});
  writeFileSync(p, typeof body === 'string' ? body : JSON.stringify(body, null, 2) + '\n', 'utf8');
}
export function findChrome(){
  if (arg('chrome')) return arg('chrome');
  const base = path.join(os.homedir(), 'AppData/Local/ms-playwright');
  if (existsSync(base)) for (const d of readdirSync(base).filter(d => /^chromium-\d+/.test(d)).sort().reverse())
    for (const sub of ['chrome-win64/chrome.exe', 'chrome-win/chrome.exe', 'chrome-linux/chrome', 'chrome-linux64/chrome']) { const p = path.join(base, d, sub); if (existsSync(p)) return p; }
  throw Error('No Chromium found; pass --chrome');
}
export async function launch(){
  const runtime = arg('runtime', process.env.LV_PUPPETEER || 'D:/lv-frontend/motion-demo/hyperframes/node_modules');
  const req = createRequire(pathToFileURL(path.join(path.resolve(runtime), '../package.json')));
  const puppeteer = req('puppeteer-core');
  return puppeteer.launch({executablePath: findChrome(), headless: true, protocolTimeout: 240000, args: ['--allow-file-access-from-files', '--font-render-hinting=none', '--disable-lcd-text', '--force-color-profile=srgb']});
}
export const fileUrl = rel => pathToFileURL(path.join(SYS, rel)).href;
export const readJSON = p => JSON.parse(readFileSync(p, 'utf8'));

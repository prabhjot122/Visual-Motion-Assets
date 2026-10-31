// Copy section 10's local assets into section-10/assets. Sources are never
// modified; everything the composition loads is served from this project.
import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const hf = path.resolve(here, '..');
const md = path.resolve(hf, '..');
const app = path.resolve(md, '..');

const copies = [
  [path.join(md, 'design/assets/lawvriksh-mark.png'), 'brand/lawvriksh-mark.png'], // B1's mark
  [path.join(md, 'media/footage/lawyer-v2/lawyer-office-v3.mp4'), 'footage/lawyer-office-v3.mp4'], // LOCKED clip v3 (O1's footage)
  [path.join(hf, 'node_modules/gsap/dist/gsap.min.js'), 'gsap.min.js'],
  ...['paper', 'stone-clay', 'stone-char', 'stone-sand', 'hatch-sand', 'halftone-ochre'].map((t) => [path.join(md, `design/assets/textures/${t}.jpg`), `textures/${t}.jpg`]),
  ...['arora-agreement-page1', 'arora-agreement-page2', 'arora-notice-page1', 'arora-notice-page2', 'arora-order-page1', 'sc2051-page2'].map((d) => [path.join(md, `storyboard/assets/${d}.png`), `docs/${d}.png`]),
  [path.join(app, 'node_modules/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2'), 'fonts/figtree.woff2'],
  [path.join(app, 'node_modules/@fontsource/newsreader/files/newsreader-latin-400-normal.woff2'), 'fonts/newsreader-400.woff2'],
  [path.join(app, 'node_modules/@fontsource/newsreader/files/newsreader-latin-500-italic.woff2'), 'fonts/newsreader-500-italic.woff2'],
  [path.join(app, 'node_modules/@fontsource/newsreader/files/newsreader-latin-400-italic.woff2'), 'fonts/newsreader-400-italic.woff2'],
  [path.join(app, 'node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2'), 'fonts/instrument-serif.woff2'],
  [path.join(app, 'node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2'), 'fonts/instrument-serif-italic.woff2'],
];

for (const [from, to] of copies) {
  const dest = path.join(here, 'assets', to);
  await mkdir(path.dirname(dest), { recursive: true });
  await copyFile(from, dest);
}
// the hand cut-outs (keyed from a page-less render; see design-spec.md)
await mkdir(path.join(here, 'hand'), { recursive: true });
const { readdir } = await import('node:fs/promises');
await mkdir(path.join(here, 'assets/hand'), { recursive: true });
for (const f of await readdir(path.join(here, 'hand'))) await copyFile(path.join(here, 'hand', f), path.join(here, 'assets/hand', f));
console.log(`prepared ${copies.length} assets`);

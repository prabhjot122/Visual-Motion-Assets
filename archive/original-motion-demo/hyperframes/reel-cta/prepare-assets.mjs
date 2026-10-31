// Copy the reel CTA scene's assets and its render strip (reel v3, plan §4).
import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const hf = path.resolve(here, '..');
const md = path.resolve(hf, '..');
const app = path.resolve(md, '..');

const copies = [
  [path.join(hf, 'node_modules/gsap/dist/gsap.min.js'), 'assets/gsap.min.js'],
  [path.join(md, 'design/assets/textures/paper.jpg'), 'assets/textures/paper.jpg'],
  [path.join(md, 'design/assets/textures/stone-sand.jpg'), 'assets/textures/stone-sand.jpg'],
  [path.join(md, 'design/assets/lawvriksh-mark.png'), 'assets/brand/lawvriksh-mark.png'],
  [path.join(app, 'node_modules/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2'), 'assets/fonts/figtree.woff2'],
  [path.join(app, 'node_modules/@fontsource/newsreader/files/newsreader-latin-500-normal.woff2'), 'assets/fonts/web-newsreader-500.woff2'],
  [path.join(app, 'node_modules/@fontsource/newsreader/files/newsreader-latin-500-italic.woff2'), 'assets/fonts/web-newsreader-500-italic.woff2'],
  [path.join(md, 'reel-v3/scenes/cta/strip.json'), 'strip.json'],
];
for (const [from, to] of copies) {
  const dest = path.join(here, to);
  await mkdir(path.dirname(dest), { recursive: true });
  await copyFile(from, dest);
}
console.log(`prepared ${copies.length} assets`);

// Copy the reel Hearing Prep scene's assets and its render strip (reel v3, plan §4).
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
  [path.join(app, 'node_modules/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2'), 'assets/fonts/figtree.woff2'],
  [path.join(app, 'node_modules/@fontsource/newsreader/files/newsreader-latin-500-italic.woff2'), 'assets/fonts/newsreader-500-italic.woff2'],
  [path.join(app, 'node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2'), 'assets/fonts/geist-mono.woff2'],
  [path.join(md, 'reel-v3/scenes/hear/strip.json'), 'strip.json'],
];
for (const [from, to] of copies) {
  const dest = path.join(here, to);
  await mkdir(path.dirname(dest), { recursive: true });
  await copyFile(from, dest);
}
console.log(`prepared ${copies.length} assets`);

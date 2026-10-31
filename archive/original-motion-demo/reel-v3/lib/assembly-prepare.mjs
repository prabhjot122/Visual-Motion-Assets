// Copy the reel v3 assembly's media and assets into reel-v3-assembly/assets (plan §8).
import { copyFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const hf = path.resolve(here, '..');
const md = path.resolve(hf, '..');
const app = path.resolve(md, '..');
const r3 = path.join(md, 'reel-v3');

const copies = [
  [path.join(hf, 'node_modules/gsap/dist/gsap.min.js'), 'gsap.min.js'],
  [path.join(md, 'design/assets/textures/paper.jpg'), 'textures/paper.jpg'],
  [path.join(app, 'node_modules/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2'), 'fonts/figtree.woff2'],
  [path.join(r3, 'media/take-P.mp4'), 'take-P.mp4'],
  [path.join(r3, 'media/take-L.mp4'), 'take-L.mp4'],
  [path.join(r3, 'media/office.mp4'), 'office.mp4'],
  ...(await readdir(path.join(r3, 'media/sr')).catch(() => [])).filter((f) => f.endsWith('.mp4')).map((f) => [path.join(r3, 'media/sr', f), `sr/${f}`]),
  ...(await readdir(path.join(r3, 'build/strips'))).filter((f) => f.endsWith('.mp4')).map((f) => [path.join(r3, 'build/strips', f), `strips/${f}`]),
];
for (const [from, to] of copies) {
  const dest = path.join(here, 'assets', to);
  await mkdir(path.dirname(dest), { recursive: true });
  await copyFile(from, dest);
}
console.log(`prepared ${copies.length} assets`);

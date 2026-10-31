// Copy the Tabular review chapter's local assets into web-tab/assets (web cut, plan §11).
import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const hf = path.resolve(here, '..');
const md = path.resolve(hf, '..');
const app = path.resolve(md, '..');

const copies = [
  [path.join(hf, 'node_modules/gsap/dist/gsap.min.js'), 'gsap.min.js'],
  [path.join(md, 'web-cut/lib/stream.js'), 'lib/stream.js'],
  [path.join(md, 'design/assets/textures/paper.jpg'), 'textures/paper.jpg'],
  [path.join(app, 'public/icons/file-types/pdf.svg'), 'icons/pdf.svg'], // the app's own PDF icon
  [path.join(app, 'node_modules/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2'), 'fonts/figtree.woff2'],
  [path.join(app, 'node_modules/@fontsource/newsreader/files/newsreader-latin-500-normal.woff2'), 'fonts/web-newsreader-500.woff2'],
  [path.join(app, 'node_modules/@fontsource/newsreader/files/newsreader-latin-500-italic.woff2'), 'fonts/web-newsreader-500-italic.woff2'],
];
for (const [from, to] of copies) {
  const dest = path.join(here, 'assets', to);
  await mkdir(path.dirname(dest), { recursive: true });
  await copyFile(from, dest);
}
console.log(`prepared ${copies.length} assets`);

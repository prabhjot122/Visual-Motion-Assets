// Regenerate every template, schema, example and graphic in lawvriksh-system/.
//   node lawvriksh-system/tools/build.mjs
import {write} from './lib.mjs';
import {buildCarousel} from './build-carousel.mjs';

const index = [];
index.push(...buildCarousel());
for (const mod of ['./build-static.mjs', './build-reel.mjs', './build-graphics.mjs', './build-product.mjs']) {
  try { const m = await import(mod); index.push(...m.build()); }
  catch (e) { if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e; }
}
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {SYS} from './lib.mjs';
// hand-authored entries (galleries, demos) that the generator does not emit
for (const e of JSON.parse(readFileSync(path.join(SYS, 'tools/extra-index.json'), 'utf8'))) if (!index.find(x => x.file === e.file)) index.push(e);
write('tools/index.json', index);
console.log(`${index.length} entries`);

// Regenerate every blog template, schema and example.   node lawvriksh-system/blog/tools/build.mjs
import {write} from './lib.mjs';
const index = [];
for (const mod of ['./build-thumbs.mjs', './build-gfx.mjs', './build-article.mjs']) {
  try { const m = await import(mod); index.push(...m.build()); }
  catch (e) { if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e; console.log('skipped', mod); }
}
write('tools/index.json', index);
console.log(`${index.length} entries`);

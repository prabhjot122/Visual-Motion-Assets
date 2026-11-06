"""Finalize lawvriksh-system/blog/: contact sheets, README and manifest entries (blog files only).

python lawvriksh-system/blog/tools/finalize.py
Existing files and existing manifest entries are never touched.
"""
import hashlib, json, pathlib, shutil, subprocess
from PIL import Image, ImageDraw, ImageFont

BLOG = pathlib.Path(__file__).resolve().parents[1]
SYS = BLOG.parent
ROOT = SYS.parent
idx = json.loads((BLOG / 'tools/index.json').read_text(encoding='utf-8'))
checks = json.loads((BLOG / 'previews/checks.json').read_text(encoding='utf-8'))
PAPER = (245, 241, 234)
FONT = ImageFont.truetype(str(SYS / 'fonts/LawVrikshSans-Medium.ttf'), 18)
PRE = BLOG / 'previews'

# existing-library slot audit findings (report only)
old = BLOG / 'tools/.existing-audit.json'
if old.exists():
    shutil.move(str(old), str(PRE / 'existing-library-slot-audit.json'))
existing = json.loads((PRE / 'existing-library-slot-audit.json').read_text(encoding='utf-8')) if (PRE / 'existing-library-slot-audit.json').exists() else []

# ---------- contact sheets ----------
def sheet(files, out, cols, tw, labels=True):
    ims = [Image.open(p).convert('RGB') for p in files]
    scaled = [im.resize((tw, max(1, int(im.height * tw / im.width))), Image.LANCZOS) for im in ims]
    rows = [scaled[i:i + cols] for i in range(0, len(scaled), cols)]
    lab = 30 if labels else 0
    H = sum(max(i.height for i in r) + lab + 14 for r in rows) + 14
    s = Image.new('RGB', (cols * (tw + 14) + 14, H), PAPER); d = ImageDraw.Draw(s); y = 14; k = 0
    for r in rows:
        for c, im in enumerate(r):
            x = 14 + c * (tw + 14); s.paste(im, (x, y))
            if labels: d.text((x, y + im.height + 6), files[k].stem, fill=(90, 82, 75), font=FONT)
            k += 1
        y += max(i.height for i in r) + lab + 14
    s.save(out, optimize=True)

thumb_ids = []
for e in idx:
    if e['family'] == 'thumbnails' and e['fmt'] == 'og': thumb_ids.append(e['group'])
for fmt, tw, cols in [('og', 520, 2), ('sq', 340, 4), ('pt', 300, 4)]:
    files = []
    for t in thumb_ids:
        for th in ('paper', 'dark'):
            files.append(PRE / 'thumbnails' / f'{t}-{fmt}-{th}.png')
    sheet(files, PRE / f'thumbnails-{fmt}-contact-sheet.png', cols, tw)
# 300 px legibility strip (share-image preview size)
strip = [Image.open(PRE / 'thumbnails' / f'{t}-og-{th}.png').convert('RGB').resize((300, 158), Image.LANCZOS) for th in ('paper', 'dark') for t in thumb_ids]
cols = 5; rows = (len(strip) + cols - 1) // cols
s = Image.new('RGB', (cols * 312 + 12, rows * 170 + 12), (110, 110, 110))
for i, im in enumerate(strip): s.paste(im, (12 + (i % cols) * 312, 12 + (i // cols) * 170))
s.save(PRE / 'thumbnails-300px-strip.png', optimize=True)

fams = []
for e in idx:
    if e['family'] == 'graphics' and e['group'] not in [f[0] for f in fams]: fams.append((e['group'], e['groupTitle']))
for g, _ in fams:
    vs = sorted({e['variant'] for e in idx if e['family'] == 'graphics' and e['group'] == g})
    f1200 = [PRE / 'graphics' / f'{v}-1200-{th}.png' for v in vs for th in ('paper', 'dark')]
    sheet(f1200, PRE / f'graphics-{g}-contact-sheet.png', 2, 560)
    f720 = [PRE / 'graphics' / f'{v}-720-{th}.png' for v in vs for th in ('paper', 'dark')]
    sheet(f720, PRE / f'graphics-{g}-720-contact-sheet.png', 4, 340)
a, b = Image.open(PRE / 'article/article-paper.png').convert('RGB'), Image.open(PRE / 'article/article-dark.png').convert('RGB')
H = min(a.height, 3200); w = 640
sc = lambda im: im.crop((0, 0, im.width, min(im.height, 3200))).resize((w, int(min(im.height, 3200) * w / im.width)), Image.LANCZOS)
A, B = sc(a), sc(b); s = Image.new('RGB', (w * 2 + 42, max(A.height, B.height) + 28), PAPER); s.paste(A, (14, 14)); s.paste(B, (w + 28, 14)); s.save(PRE / 'article-contact-sheet.png', optimize=True)

# ---------- README ----------
by = {}
for c in checks: by.setdefault(c['file'], []).append(c)
KEYS = ['fonts', 'noItalics', 'palette', 'noOverlap', 'safeArea', 'minSize', 'contrast', 'noArrows', 'slotAudit']
LABEL = {'fonts': 'LawVriksh Sans only', 'noItalics': 'No italics', 'palette': 'Palette only', 'noOverlap': 'No text overlap', 'safeArea': 'Safe area', 'minSize': 'Min size', 'contrast': 'Contrast', 'noArrows': 'No arrows', 'slotAudit': 'Slot audit'}
def mark(files, k, extra=None):
    rs = [r for f in files for r in by.get(f, [])]
    if not rs: return 'not run'
    vals = [r['pass'].get(k) for r in rs]
    if all(v is None for v in vals): return 'n/a'
    return 'pass' if all(v in (True, None) for v in vals) else '**FAIL**'
def extra_cols(files):
    rs = [r for f in files for r in by.get(f, [])]
    errs = sum(len(r['errors']) + len(r['network']) for r in rs)
    return 'pass' if rs and errs == 0 else ('**FAIL**' if rs else 'not run')

L = []; w = L.append
w('# LawVriksh blog — thumbnails, in-article graphics and article page\n')
w('Status: **proposed**. Built for the blog pipeline on top of `lawvriksh-system/`: it uses `core/lv.css`, `core/lv-runtime.js`, the law objects (`core/lv-objects.js`), the textures, the mark and LawVriksh Sans. Nothing here is loaded from the network, and nothing uses timers or randomness. Each template takes only text and picks components.\n')
w('![Thumbnails, 1200×630](previews/thumbnails-og-contact-sheet.png)\n')
w('## Rules (unchanged from the system library)\n')
w('- **Type**: LawVriksh Sans 400/500/600, upright only. Emphasis is clay colour (`<b>` in `title_html`) or weight, never italics.')
w('- **Palette**: the nine tokens only; tints are `rgba()` of them (checked against every computed colour).')
w('- **Layout**: text never overlaps text, images or decorative objects. Decoration may overlap decoration. No arrows, stock photos, faces, emblems or scales.')
w('- **Size**: minimum text is 34 px on a 1080-wide frame, scaled by width: **40 px at 1200**, **24 px at 720** (checked). Contrast ≥ 4.5:1 (3:1 for large text).')
w('- **Decoration means something**: the law objects (reports, files, ticked page, open report, court facade, calendar, notes, paired pages, judgment, register) are chosen to match the idea; there are no abstract blocks.')
w('- **Copy**: placeholders are educational and calm, with no product claims. Variable details use square brackets: `[date]`, `[para]`, `[Court]`, `[n]`. Nothing is stated as law.\n')
w('## Using a template\n')
w('```js\nawait page.goto(pathToFileURL(\'lawvriksh-system/blog/thumbnails/question-og.html\').href);\nawait page.evaluate(() => window.__lvReady);\nawait page.evaluate(d => LV.fill(d), data);   // data matches question.schema.json\nawait page.screenshot({path: \'thumb.png\'});\n```\n')
w('- Slots: `data-slot` (text), `data-slot-html` (`<b>` and `<br>` only), `data-slot-list` (strings or objects), `data-slot-src` (image), `data-slot-href` (tracked link), `data-slot-md` (Markdown body). `theme` is `paper` or `dark`; `?theme=dark` also works.')
w('- **Title fitting** (`blog/blog.js`): headlines shrink in 2 px steps from a maximum until they fit their box and line limit (never below a floor of 64–80 px on thumbnails). It is a pure function of the text, so renders are repeatable.')
w('- **Lists** (`data-cols-auto`) choose their column count from the item count and the frame width: 5 items wrap 3+2, 6 items 3+3.\n')

w('## 1. Thumbnails (10 templates × 3 sizes × paper and dark)\n')
w('Primary size **1200×630** (blog hero and Open Graph / LinkedIn share image); **1080×1080** and **1080×1350** are recomposed for social posts that point to the article. On the square and portrait versions the headline sits inside the centre **1.91:1 band** (1080×565), so a platform crop keeps it; at **300 px wide** the headline renders at 16 px or more (checked, see below).\n')
w('![300 px strip](previews/thumbnails-300px-strip.png)\n')
w('| Template | Layout | Slots | 1200×630 | 1080×1080 | 1080×1350 |\n|---|---|---|---|---|---|')
for e in [e for e in idx if e['family'] == 'thumbnails' and e['fmt'] == 'og']:
    g = e['group']; sl = ', '.join('`' + s + '`' for s in e['slots'])
    cells = ' | '.join(f"[html]({'thumbnails/' + g + '-' + f + '.html'}) · [paper](previews/thumbnails/{g}-{f}-paper.png) · [dark](previews/thumbnails/{g}-{f}-dark.png)" for f in ('og', 'sq', 'pt'))
    w(f"| {e['title'].split(' · ')[0]} | {e['desc']} | {sl} | {cells} |")
w('\nSchema and example per template: `thumbnails/<template>.schema.json`, `thumbnails/<template>.example.json` (shared by the three sizes). Sheets: [1200×630](previews/thumbnails-og-contact-sheet.png) · [1080×1080](previews/thumbnails-sq-contact-sheet.png) · [1080×1350](previews/thumbnails-pt-contact-sheet.png).\n')
w('The advocate-profile thumbnail has an **empty, labelled portrait frame** and ships no likeness. The case-explained thumbnail has exactly three slots (`court`, `date`, `topic`), all placeholders; no case is invented.\n')

w('## 2. In-article graphics (10 families × 10 variants × widths 1200 and 720 × paper and dark)\n')
w('Live HTML text on a flat ground (the paper grain stays in thumbnails so the graphic sits cleanly in a reading column). Height follows the content. Each variant has one schema and one example shared by its two widths and both themes. Horizontal layouts wrap on the narrow width.\n')
for g, title in fams:
    vs = [e for e in idx if e['family'] == 'graphics' and e['group'] == g and e['width'] == 1200]
    w(f'### {title}\n')
    w(f'![{title}](previews/graphics-{g}-contact-sheet.png)\n')
    w('| Variant | Slots | 1200 | 720 |\n|---|---|---|---|')
    for e in vs:
        v = e['variant']; sl = ', '.join('`' + s + '`' for s in e['slots'])
        w(f"| {e['title'].split(' · ')[0]} | {sl} | [html](graphics/{v}-1200.html) · [paper](previews/graphics/{v}-1200-paper.png) · [dark](previews/graphics/{v}-1200-dark.png) | [html](graphics/{v}-720.html) · [paper](previews/graphics/{v}-720-paper.png) · [dark](previews/graphics/{v}-720-dark.png) |")
    w(f'\nMobile sheet: [previews/graphics-{g}-720-contact-sheet.png](previews/graphics-{g}-720-contact-sheet.png). Schemas: `graphics/{g}-NN-*.schema.json`.\n')
w('Notes: timelines use placeholder dates only and are separate from Case Mapping. Pull statements carry no quotation marks and no attribution. The tracked-link slot (`link`) is shown as link text and set as the `href`. If a graphic needs the product, reuse `product/case-mapping.html` or `product/chronology.html` (both `requires_claim_approval: true`); this folder adds no product UI.\n')

w('## 3. Article page\n')
w('`article/article.html` + `article/article.css`: a self-contained, class-based reading layout for previewing a finished article from Markdown. Title, dek, byline/date/reading time, contents (built from the H2 headings, or supplied), H2/H3, body (19 px on a 700 px column), lists, tables, footnote-style sources, the callout and graphic components, and a closing CTA block. Paper (light reading mode) and dark via `data-theme`.\n')
w('![Article page, paper and dark](previews/article-contact-sheet.png)\n')
w('Slots: ' + ', '.join('`' + s + '`' for s in [e for e in idx if e['family'] == 'article'][0]['slots']) + '. `body_md` is rendered by `LV.md` (`blog/blog.js`); raw HTML is never passed through, and `em` renders upright in clay.\n')
w('| Markdown | Renders as |\n|---|---|')
for a_, b_ in [('`##`, `###`', 'H2 / H3 (ids feed the contents list)'), ('`**bold**`, `*accent*`, `` `code` ``', 'weight 600; clay (upright); chip'), ('`[1]`', 'citation chip `.lv-cite`'), ('`[^1]` + `[^1]: text`', 'footnote reference and `.lv-sources` list'), ('tables, lists, `---`', '`.lv-table`, lists, `.lv-divider`'),
               ('`::: note` / `caution` / `settle` [label]', '`.lv-callout` (`is-note`, `is-caution`, `is-settle`)'), ('`::: term Name`', '`.lv-term` key-term box'), ('`::: pull`', '`.lv-pull` (no quotation marks, no attribution)'), ('`::: steps`, `::: checklist`', '`.lv-steps`, `.lv-checks` (numbered / tick rows)'),
               ('`::: figure src | alt | caption`', '`.lv-figure`; `{theme}` in `src` is replaced by the current mode'), ('`::: source Court | date | parties | para`', '`.lv-source` line'), ('`::: cta Button | note | link`', '`.lv-cta` block')]:
    w(f'| {a_} | {b_} |')
w('\nThe article page is a reading layout, so it follows the brief’s 18–20 px body rather than the 34 px-per-1080 rule, and the safe-area and minimum-size checks are not applied to it (they are shown as n/a). Every other check, including the slot audit, runs.\n')

w('## 4. Self-check\n')
w('`tools/render.mjs` runs every template in both themes in headless Chromium: the eight system checks (parameterised for these sizes: minimum text 40 px at 1200, 34 px at 1080, 24 px at 720), the **slot audit**, and for thumbnails the **1.91:1 crop band** (square and portrait) and **300 px legibility** (headline ≥ 16 px when the image is shown 300 px wide). Pages must also load with no console errors and no network requests. Raw results: [previews/checks.json](previews/checks.json).\n')
w('**Slot audit** (`tools/audit.mjs`). For every slot in a template’s schema it fills a unique marker and requires the marker to be visible on the page (list slots get several items; enum slots such as `motif` must change the page; the image slot must show the image). It then requires that no text from the example JSON is still visible after the fill. Run it with `node blog/tools/audit.mjs --family <family> --index <index.json>`.\n')
for grp, name, filt in [('thumbnails', 'Thumbnails', lambda e: e['family'] == 'thumbnails'), ('graphics', 'In-article graphics', lambda e: e['family'] == 'graphics'), ('article', 'Article page', lambda e: e['family'] == 'article')]:
    es = [e for e in idx if filt(e)]
    w(f'### {name}\n')
    hdr = '| Template | ' + ' | '.join(LABEL[k] for k in KEYS) + ' | Load |'
    w(hdr); w('|' + '---|' * (len(KEYS) + 2))
    if grp == 'graphics':
        seen = []
        for e in es:
            if e['variant'] in seen: continue
            seen.append(e['variant'])
            files = [x['file'] for x in es if x['variant'] == e['variant']]
            w(f"| {e['variant']} | " + ' | '.join(mark(files, k) for k in KEYS) + f' | {extra_cols(files)} |')
    else:
        for e in es:
            extra = ''
            if grp == 'thumbnails':
                rs = by.get(e['file'], [])
                if rs: extra = f" ({', '.join(str(r.get('preview300Px')) + ' px@300' for r in rs[:1])}{', crop band ' + mark([e['file']], 'cropBand') if e['fmt'] != 'og' else ''})"
            w(f"| {e['id']}{extra} | " + ' | '.join(mark([e['file']], k) for k in KEYS) + f" | {extra_cols([e['file']])} |")
    w('')
w('Each graphics row aggregates its four renders (two widths × two themes).\n')
w('### Existing library: slot audit findings (report only)\n')
w('Running the same audit over the **existing** `carousel/`, `static/` and `reel/` templates (46 audited) found these failures. They are listed here, not fixed: the brief says not to change existing files, and the branch `lawvriksh-system-fixes` was not found on the remote. Full output: [previews/existing-library-slot-audit.json](previews/existing-library-slot-audit.json).\n')
fails = [r for r in existing if r['problems']]
w('| Template | What the audit found |\n|---|---|')
for r in fails:
    pr = r['problems']; summ = '; '.join(sorted({(p.get('slot') or 'example text') + ': ' + p['issue'] for p in pr}))
    w(f"| `{r['file']}` | {summ} |")
w(f'\n{len(existing)} audited, {len(fails)} failing. Likely causes: `carousel/advocate-cover` has a `body_html` slot but no element for it; `reel/document-highlight` (`lines`) and `reel/step` (`steps`) declare counts the markup does not render; `reel/strike-list` fills `struck` as a list but the markup is static; `reel/big-number` caches its first numeral and overwrites a filled `number`.\n')
w('## Rebuilding\n')
w('```bash\nnode lawvriksh-system/blog/tools/build.mjs                      # templates, schemas, examples\nnode lawvriksh-system/blog/tools/render.mjs --only thumbnails   # previews + checks (run one family per process: graphics --group <family>)\npython lawvriksh-system/blog/tools/finalize.py                  # sheets, README, manifest\n```\n')
w('`render.mjs` uses an existing `puppeteer-core` and Chromium and installs nothing. Tools: `build*.mjs` (generators), `render.mjs`, `checks.mjs` (parameterised copy of the system checker), `audit.mjs`, `sheet.py`, `finalize.py`.\n')
w('## Rights and provenance\n')
w('| Material | Source | Licence / note |\n|---|---|---|')
w('| LawVriksh Sans | `lawvriksh-system/fonts/` (existing) | SIL Open Font License 1.1 |')
w('| Textures, mark | `brand/` (existing, referenced in place) | As recorded in `ASSET-RIGHTS.md` |')
w('| Templates, CSS/JS, graphics, icons (inline SVG), law objects | Original work for LawVriksh in this branch | No stock imagery, faces, emblems or other brands’ marks; the court facade is generic with an empty pediment |')
w('| Document pages | Original vectors with greeked bars | No readable invented legal text |\n')
(BLOG / 'README.md').write_text('\n'.join(L) + '\n', encoding='utf-8')
print('README written')

# ---------- manifest (append only: blog files) ----------
mf_path = ROOT / 'asset-manifest.json'
mf = json.loads(mf_path.read_text(encoding='utf-8'))
mf['assets'] = [a for a in mf['assets'] if not a['path'].startswith('lawvriksh-system/blog/')]
def role(rel):
    p = rel.split('/')
    if rel.endswith('README.md'): return 'documentation'
    if p[2] == 'previews': return 'self-check results' if rel.endswith('.json') else 'preview'
    if p[2] == 'tools': return 'generator / checker source'
    if rel.endswith('.schema.json'): return 'slot schema'
    if rel.endswith('.example.json'): return 'example slot data'
    if rel.endswith('blog.js'): return 'shared template runtime'
    if rel.endswith('.css'): return 'template styles'
    if rel.endswith('.md'): return 'sample article source (placeholder text)'
    return {'thumbnails': 'blog thumbnail template', 'graphics': 'blog in-article graphic template', 'article': 'article page template'}.get(p[2], 'blog file')
ignored = set(subprocess.check_output(['git', 'ls-files', '--others', '--ignored', '--exclude-standard', '-z', 'lawvriksh-system/blog'], cwd=ROOT).decode().split('\0'))
added = 0
for p in sorted((SYS / 'blog').rglob('*')):
    if not p.is_file(): continue
    rel = p.relative_to(ROOT).as_posix()
    if rel in ignored or p.name.startswith('.') or '__pycache__' in rel: continue
    b = p.read_bytes()
    mf['assets'].append({'path': rel, 'role': role(rel), 'status': 'proposed', 'bytes': len(b), 'sha256': hashlib.sha256(b).hexdigest(), 'copy': 'original',
                         'rights': 'Original LawVriksh work; uses only library textures, the library mark and LawVriksh Sans by reference. Templates are placeholder copy only.'})
    added += 1
mf_path.write_text(json.dumps(mf, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(f'manifest: {added} blog entries')

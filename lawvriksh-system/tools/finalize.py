"""Finalize the LawVriksh system package.

python lawvriksh-system/tools/finalize.py

1. Builds filmstrips for reels, transitions and captions from previews/_frames, then removes the frames.
2. Builds contact sheets for every family.
3. Writes lawvriksh-system/README.md (index, slots, transitions, captions, self-check table).
4. Adds every lawvriksh-system file to the repository asset-manifest.json (status: proposed).
"""
import hashlib, json, pathlib, shutil, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

SYS = pathlib.Path(__file__).resolve().parents[1]
ROOT = SYS.parent
idx = json.loads((SYS / 'tools/index.json').read_text(encoding='utf-8'))
checks = json.loads((SYS / 'previews/checks.json').read_text(encoding='utf-8'))
PAPER = (245, 241, 234)
try:
    FONT = ImageFont.truetype(str(SYS / 'fonts/LawVrikshSans-Medium.ttf'), 22)
except Exception:
    FONT = ImageFont.load_default()

# ---------- 1. filmstrips ----------
frames = SYS / 'previews/_frames'
if frames.exists():
    for fam_dir in frames.iterdir():
        groups = {}
        for f in sorted(fam_dir.glob('*.png')):
            groups.setdefault(f.stem.rsplit('-', 1)[0], []).append(f)
        tw, th = 216, 384
        rows = sorted(groups)
        cols = max(len(v) for v in groups.values())
        sheet = Image.new('RGB', (24 + cols * (tw + 12) + 260, 24 + len(rows) * (th + 16)), PAPER)
        d = ImageDraw.Draw(sheet)
        for r, name in enumerate(rows):
            y = 24 + r * (th + 16)
            d.text((24, y + th // 2 - 12), name.replace('-paper', ' · paper').replace('-dark', ' · dark'), fill=(90, 82, 75), font=FONT)
            for c, f in enumerate(groups[name]):
                sheet.paste(Image.open(f).convert('RGB').resize((tw, th), Image.LANCZOS), (260 + c * (tw + 12), y))
        sheet.save(SYS / f'previews/{fam_dir.name}-filmstrip.png', optimize=True)
    shutil.rmtree(frames)

# ---------- 2. contact sheets ----------
def sheet(files, out, cols, tw):
    ims = [Image.open(p).convert('RGBA') for p in files]
    th = max(int(im.height * tw / im.width) for im in ims)
    rows = (len(ims) + cols - 1) // cols
    s = Image.new('RGB', (24 + cols * (tw + 24), 24 + rows * (th + 58)), PAPER)
    d = ImageDraw.Draw(s)
    for i, (p, im) in enumerate(zip(files, ims)):
        x = 24 + (i % cols) * (tw + 24); y = 24 + (i // cols) * (th + 58)
        t = im.resize((tw, int(im.height * tw / im.width)), Image.LANCZOS)
        if '-dark' in p.stem and p.parent.name in ('documents', 'connections', 'compositions', 'paper-light', 'icons'):
            bg = Image.new('RGB', t.size, (28, 23, 20)); bg.paste(t, mask=t.split()[3]); t = bg
        s.paste(t.convert('RGB'), (x, y), None)
        d.text((x, y + t.height + 10), p.stem, fill=(90, 82, 75), font=FONT)
    s.save(out, optimize=True)

for fam, cols, tw in [('carousel', 8, 300), ('static', 8, 300), ('reel', 10, 260), ('transitions', 6, 260), ('captions', 10, 260), ('product', 2, 900), ('icons', 2, 900), ('graphics', 4, 520)]:
    files = sorted((SYS / 'previews' / fam).glob('*.png'))
    if files:
        sheet(files, SYS / f'previews/{fam}-contact-sheet.png', cols, tw)
for grp in ['documents', 'connections', 'compositions', 'paper-light', 'icons']:
    files = sorted((SYS / 'previews/svg' / grp).glob('*.png'))
    if files:
        sheet(files, SYS / f'previews/svg-{grp}-contact-sheet.png', 8 if grp == 'icons' else 6, 160 if grp == 'icons' else 280)

# ---------- 3. README ----------
CHECKS = ['fonts', 'noItalics', 'palette', 'noOverlap', 'safeArea', 'minSize', 'contrast', 'noArrows']
LABEL = {'fonts': 'LawVriksh Sans only', 'noItalics': 'No italics', 'palette': 'Palette only', 'noOverlap': 'No text overlap',
         'safeArea': 'Safe area', 'minSize': 'Min 34 px', 'contrast': 'Contrast', 'noArrows': 'No arrows'}
by_file = {}
for c in checks:
    by_file.setdefault(c['file'], []).append(c)

def mark(file, k):
    rs = by_file.get(file, [])
    if not rs: return 'not run'
    vals = [r['pass'].get(k) for r in rs]
    if all(v is None for v in vals): return 'n/a'
    return 'pass' if all(v in (True, None) for v in vals) else '**FAIL**'

def stat(file, key, fn):
    vals = [r.get(key) for r in by_file.get(file, []) if r.get(key) is not None]
    return fn(vals) if vals else '–'

L = []
w = L.append
w('# LawVriksh system — templates and graphics library\n')
w('Status: **proposed** (6 November 2026). Built for the LawVriksh content pipeline: every carousel, static, reel and YouTube Short is filled from these templates and rendered by Playwright/Chromium from `file://`. Nothing here loads from the network.\n')
w('Look and feel: *Folio & Thread*. Each piece is a page from a working file: an uppercase clay kicker, one statement, a muted supporting line, and a clay **thread** that runs edge to edge at the same height on every carousel page, with a node that advances page by page, so a swiped carousel reads as one line. Decoration is not abstract: each page carries a **law object** built from the library\'s stone, sand and paper textures that matches the idea on that page (bound law reports for "authorised source", case files for "filing", a ticked page for "checks", an open report for "read the paragraph", a calendar for "dates", a generic court facade with no emblem, and so on).\n')
w('![Carousel contact sheet](previews/carousel-contact-sheet.png)\n')
w('## Rules every file follows\n')
w('- **Type**: LawVriksh Sans 400/500/600, upright only (`font-synthesis: none`; `<b>` is coloured, never bolded past 600; `<i>`/`<em>` render upright and are flagged by the checker). Fonts load from `fonts/` (SIL OFL 1.1, notice in `fonts/LawVrikshSans-OFL.txt`).')
w('- **Palette**: `#171717` ink, `#1c1714` warm ink, `#f5f1ea` paper, `#fbfaf7` surface, `#c94820` clay, `#a93a18` dark clay (emphasis on paper), `#cf795d` edge (emphasis on dark), `#c4562e` thread, `#5a524b` muted. Tints are `rgba()` of these. All are CSS variables in `core/lv.css`.')
w('- **Materials**: textures are referenced in place from `../../brand/textures/` (paper, stone-clay, stone-char, stone-sand, hatch-sand, halftone-ochre); the mark from `../../brand/logos/lawvriksh-mark.png`. Light falls from the upper left; shadows fall down and right.')
w('- **Layout**: text never overlaps text, images or decorative objects; decoration may overlap decoration and cards. No arrows. One idea per page. Min text 34 px on a 1080-wide frame (38 px on 1200). Side safe area ≥ 56 px (templates use 72/80). Reels keep text out of the top 200 px and bottom 380 px.')
w('- **Copy**: example copy is educational ("verify before you file" habits) with no product claims. Placeholders use square brackets: `[Matter name]`, `[date]`, `[source]`, `[n]`.\n')
w('## Folder map\n')
w('| Folder | What it holds |\n|---|---|')
for a, b in [('core/', '`lv.css` tokens + components, `lv-runtime.js` slot filling + deterministic motion helpers, `lv-motion.js` word reveals, captions, progress, transitions, `lv-objects.js` the ten law objects'),
             ('carousel/', '16 slide templates (1080×1350) + `carousel.css`; each with `.schema.json` and `.example.json`'),
             ('static/', '10 statics, each composed for Instagram 1080×1350 (`-ig`) and LinkedIn 1200×1200 (`-li`) + `static.css`'),
             ('reel/', '10 scene templates, 6 transition demos and 5 caption-style demos (1080×1920, 30 fps) + `reel.css`'),
             ('graphics/', 'layered SVG families (documents, connections, compositions, paper-light), HTML component sheets (citations, badges) + `components.css`, galleries'),
             ('icons/', '28 monoline icons × ink/paper/clay, sprites, gallery'),
             ('product/', 'two product compositions (Case Mapping, Chronology) with `.meta.json` — `requires_claim_approval: true`'),
             ('previews/', 'rendered PNG for every template, theme and graphic; contact sheets; filmstrips; `checks.json`'),
             ('fonts/', 'LawVriksh Sans WOFF2 (400/500/600), Medium TTF for contact-sheet labels, OFL notice'),
             ('tools/', 'generator (`build.mjs`), renderer + checker (`render.mjs`, `checks.mjs`), `sheet.py`, `finalize.py`')]:
    w(f'| `{a}` | {b} |')
w('\n## Using a template in the pipeline\n')
w('```js\n// Playwright or Puppeteer, Chromium, offline\nawait page.setViewportSize({width: 1080, height: 1350});\nawait page.goto(pathToFileURL(\'lawvriksh-system/carousel/statement.html\').href + \'?theme=dark\');\nawait page.evaluate(d => LV.fill(d), data);          // data matches carousel/statement.schema.json\nawait page.evaluate(() => window.__lvReady);         // fonts + images decoded\nawait page.screenshot({path: \'slide-02.png\'});\n```\n')
w('- `LV.fill(data)` fills named slots: `data-slot` (text), `data-slot-html` (`title_html`, `body_html`: only `<b>` and `<br>` survive the sanitiser; `<b>` renders clay), `data-slot-list` (`rows`, `pills`, `toc`, …; strings or `{text, variant}`), `data-slot-src` (`image`: an empty value shows the labelled frame). `theme` is `paper` or `dark`; `counter: {index, total}` sets the counter text and moves the thread node; `motif` swaps the law object.')
w('- Query parameters also work: `?theme=dark&index=3&total=8`.')
w('- **Reels**: every scene exposes `window.__renderAt(t)` (seconds), `window.__duration`, `window.__fps = 30` and `window.__holdAt` (a representative still). Motion is a pure function of `t`: no `requestAnimationFrame`, timers or randomness. Capture with `for (f = 0; f < __duration * 30; f++) await page.evaluate(t => __renderAt(t), f / 30)`. Captions come from `captions: [{w, s, e}]` word timings; `caption_style` picks one of five styles; `scene_index`/`scene_total` drive the progress thread and counter.\n')

w('## Carousel templates (1080×1350, Instagram carousel and LinkedIn document)\n')
w('| Template | Role | Slots | Preview |\n|---|---|---|---|')
for e in [e for e in idx if e['family'] == 'carousel']:
    w(f"| [{e['title']}]({e['file']}) | {e.get('role','')} | {', '.join('`'+s+'`' for s in e['slots'])} | [paper](previews/carousel/{e['id']}-paper.png) · [dark](previews/carousel/{e['id']}-dark.png) |")
w('\nThe advocate series uses an **empty, labelled portrait frame** (hatch-sand treatment). Supply only a public-domain or licensed image through `image`, record its source in `sources`, and never generate a likeness. The LinkedIn document cover carries title, subtitle, contents and an edition line so it reads as a proper first PDF page.\n')
w('## Static templates\n')
w('![Static contact sheet](previews/static-contact-sheet.png)\n')
w('| Template | Instagram 1080×1350 | LinkedIn 1200×1200 | Slots |\n|---|---|---|---|')
seen = set()
for e in [e for e in idx if e['family'] == 'static']:
    base = e['id'].rsplit('-', 1)[0]
    if base in seen: continue
    seen.add(base)
    w(f"| {e['title'].split(' · ')[0]} | [html](static/{base}-ig.html) · [png](previews/static/{base}-ig-paper.png) | [html](static/{base}-li.html) · [png](previews/static/{base}-li-paper.png) | {', '.join('`'+s+'`' for s in e['slots'])} |")
w('\nSchemas: `static/<name>.schema.json` (shared by both sizes); examples: `static/<name>-ig.example.json`.\n')
w('## Reel and Shorts scenes (1080×1920, 30 fps)\n')
w('Text zone y 300–1330; caption band y 1372–1520; progress thread + counter y 206–290; nothing below y 1540 or above y 200.\n')
w('![Reel scenes](previews/reel-contact-sheet.png)\n')
w('| Scene | Duration | Motion (all deterministic in t) | Slots |\n|---|---|---|---|')
for e in [e for e in idx if e['family'] == 'reel']:
    w(f"| [{e['title']}]({e['file']}) | {e['duration']} s | {e['desc']} | {', '.join('`'+s+'`' for s in e['slots'])} |")
w('\nFilmstrip: [previews/reel-filmstrip.png](previews/reel-filmstrip.png).\n')
w('### Transitions\n')
w('Each is a function `LV.transitions[name]`, called with the overlay element and `p` from 0 to 1 over the transition window. At `p = 0.5` the overlay covers the whole frame; switch scenes exactly there, so two scenes\' text never share a frame. The checker hit-tests a 27×41 grid at the midpoint (`fullCover`).\n')
w('| Transition | Description | Demo | Midpoint |\n|---|---|---|---|')
for e in [e for e in idx if e['family'] == 'transitions']:
    w(f"| {e['title']} | {e['desc']} | [{e['file']}]({e['file']}) | [png](previews/transitions/{e['id']}-midpoint.png) |")
w('\nFilmstrip (1.0–2.0 s): [previews/transitions-filmstrip.png](previews/transitions-filmstrip.png).\n')
w('### Caption styles (band y 1372–1520, ≥ 46 px; 54–72 px used)\n')
w('| Style | Description | Demo |\n|---|---|---|')
for e in [e for e in idx if e['family'] == 'captions']:
    w(f"| `{e['id'].replace('caption-','')}` | {e['desc']} | [paper](previews/captions/{e['id']}-paper.png) · [dark](previews/captions/{e['id']}-dark.png) |")
w('\nEvery style sits on its own solid band, so it reads the same over dark and paper scenes. Pages hold up to four words and never end on a lone word. Schema: `reel/captions.schema.json`.\n')
w('### Progress and counter\n')
w('`.reel-progress` is a 4 px thread across the top safe line with a node at the current position; `LV.progress(root, t, duration, index, total)` advances it within the scene\'s share of the series. The counter (`data-slot="reel_counter"`, 36 px) sits beside the wordmark above it.\n')
w('## Graphics\n')
w('| Family | Files | Gallery | Count |\n|---|---|---|---|')
fam_desc = {'documents': 'Judgment, draft, filing, notes, highlighted, folded and report pages; stacked pages; stacked case files; open bound law report; bound volumes. Body text is greeked bars.',
            'connections': 'Straight, stations, elbow, S-curve, dashed, one-to-two, one-to-three, converge, timeline, braid, loop-back. No arrowheads anywhere.',
            'compositions': 'Law-object compositions at three scales: cover decorations, corner accents, clusters.',
            'paper-light': 'Window-light bands, mullion shadows, vignettes, torn edges, folded corner, centre crease, paper-stack edge (1080×1350 overlays).'}
for grp in ['documents', 'connections', 'compositions', 'paper-light']:
    n = len(list((SYS / 'graphics' / grp).glob('*.svg')))
    w(f"| {grp} | `graphics/{grp}/*-paper.svg`, `*-dark.svg` — {fam_desc[grp]} | [paper](previews/graphics/{grp}-paper-paper.png) · [dark](previews/graphics/{grp}-dark-dark.png) · [individual](previews/svg-{grp}-contact-sheet.png) | {n // 2} × 2 |")
w(f"| law objects | `core/lv-objects.js` (`data-motif=\"reports\"`, `files`, `checked`, `open-book`, `courthouse`, `calendar`, `notes`, `compare`, `judgment`, `register`) | [paper](previews/graphics/law-objects-paper.png) · [dark](previews/graphics/law-objects-dark.png) | 10 × 2 |")
w("| citation and evidence | `graphics/components.css` — chips `[1]`, solid/outline chips, pinpoint chip, highlight, underline thread, boxed phrase, margin mark, margin dot, ¶ and § markers, pinpoint line, source line, margin-note card, strong highlight (live HTML text) | [paper](previews/graphics/citations-paper.png) · [dark](previews/graphics/citations-dark.png) | 16 × 2 |")
w("| badges, rules, pills, buttons | `graphics/components.css` — 5 number badges, numeral, step label, counter; 6 dividers; 6 pills; 6 buttons (no arrows) | [paper](previews/graphics/badges-paper.png) · [dark](previews/graphics/badges-dark.png) | 23 × 2 |")
n_icons = len(list((SYS / 'icons').glob('*-clay.svg')))
w(f"| icons | `icons/<name>-paper.svg` (ink), `-dark.svg` (paper), `-clay.svg`; `sprite-paper.svg`, `sprite-dark.svg` (`#lv-<name>`). 2 px monoline at 24, round caps | [paper](previews/icons/icons-paper-paper.png) · [dark](previews/icons/icons-dark-dark.png) | {n_icons} × 3 |")
w('\nIcons: ' + ', '.join(sorted(p.stem[:-5] for p in (SYS / 'icons').glob('*-clay.svg'))) + '.\n')
w('## Product graphics (two only)\n')
w('Rebuilt as layered HTML/CSS/SVG from local product captures, not redesigned; placeholder data only. **Both are `requires_claim_approval: true` and must not be used publicly until the founder approves the specific capability shown.** Case Mapping and Chronology are separate files and separate features; Fact Review is not shown and nothing merges them.\n')
w('| Composition | Source evidence | Metadata | Preview |\n|---|---|---|---|')
w('| [Case Mapping](product/case-mapping.html) | `motion-demo/screenshots/21-arora-map-root-current.png` | [meta](product/case-mapping.meta.json) | [png](previews/product/case-mapping-paper.png) |')
w('| [Chronology](product/chronology.html) | `motion-demo/screenshots/11-chronology-expanded-corpus.png` | [meta](product/chronology.meta.json) | [png](previews/product/chronology-paper.png) |')
w('\nDeviations (recorded in each `.meta.json`): LawVriksh Sans replaces the product face; colours are mapped to tokens (the green status dot and source glyphs become thread/muted); the credits panel is left out. UI text is at product scale, so crop and enlarge until text is ≥ 34 px on a 1080 frame, or use it as a non-reading visual.\n')

w('## Self-check\n')
w('Produced by `tools/render.mjs` + `tools/checks.mjs` in headless Chromium against the rendered DOM, for every template in both themes (reels at their hold time and their last frame; transitions before and after the switch, plus the midpoint cover test). Raw results: [previews/checks.json](previews/checks.json).\n')
w('How each check works: **fonts** — every text node\'s computed family is LawVriksh Sans at 400/500/600 and those faces are loaded. **no italics** — computed `font-style` is normal everywhere and no `<i>`/`<em>` exists. **palette** — every computed colour, background, gradient stop, shadow, SVG fill/stroke is a token (any alpha). **no text overlap** — glyph bands (each line\'s content box inset 18 % top and bottom) of different elements never intersect each other, images, law objects or the thread. **safe area** — text ≥ 56 px from the sides; reels also y 200–1540. **min 34 px** — computed size ≥ 34 px at 1080 wide (≥ 37.8 px at 1200). **contrast** — text over its composited background (textured paper measured at its darker value) ≥ 4.5:1 below 60 px, ≥ 3:1 above. **no arrows** — no arrow characters (U+2190–21FF, 2794–27BF, 2B00–2BFF …), `->`/`=>`, or SVG markers. Arrow-like *shapes* were also reviewed by eye: connectors end in round nodes only. Gallery sheets skip safe-area/min-size (they are not delivery frames) and product compositions skip min-size (see above).\n')
hdr = '| Template | ' + ' | '.join(LABEL[k] for k in CHECKS) + ' | Min px | Min contrast |'
w(hdr); w('|' + '---|' * (len(CHECKS) + 3))
order = ['carousel', 'static', 'reel', 'transitions', 'captions', 'graphics', 'icons', 'product']
for fam in order:
    for e in [e for e in idx if e['family'] == fam and e['file'].endswith('.html')]:
        extra = ''
        if e.get('coverAt') is not None:
            extra = ' (cover: ' + mark(e['file'], 'fullCover') + ')'
        w(f"| {fam}/{e['id']}{extra} | " + ' | '.join(mark(e['file'], k) for k in CHECKS) + f" | {stat(e['file'], 'minFont', lambda v: round(min(v)))} | {stat(e['file'], 'minContrast', lambda v: min(v))} |")
w('\nLimits: these are automated geometric and colour checks plus the visual review of every contact sheet; they are not a usability study or a rights audit. Contrast on textured paper is computed against a conservative flat value, not per pixel.\n')
w('## Rebuilding\n')
w('```bash\nnode lawvriksh-system/tools/build.mjs                       # regenerate templates, schemas, examples, SVGs\nnode lawvriksh-system/tools/render.mjs --runtime <puppeteer-core node_modules>   # previews + checks\npython lawvriksh-system/tools/finalize.py                    # sheets, README, manifest\n```\n')
w('`render.mjs` uses an existing `puppeteer-core` install and an existing Chromium (it looks in the Playwright cache, or pass `--chrome`). It installs nothing.\n')
w('## Rights and provenance\n')
w('| Material | Source | Licence / note |\n|---|---|---|')
w('| LawVriksh Sans (WOFF2, Medium TTF) | LawVriksh-Sans-v0.1 package (Public Sans derivative) | SIL Open Font License 1.1 — `fonts/LawVrikshSans-OFL.txt` |')
w('| Textures, mark | This repository: `brand/textures/*`, `brand/logos/lawvriksh-mark.png` (referenced, not copied) | As recorded in `ASSET-RIGHTS.md` |')
w('| Templates, CSS/JS, SVG graphics, law objects, icons | Original work for LawVriksh in this branch | LawVriksh creative work; no third-party marks, emblems, stock or AI imagery |')
w('| Product compositions | Rebuilt from LawVriksh\'s own product screens (local captures) | Placeholder data only; claim approval required before use |')
w('\nNo stock photos, real faces or likenesses, court or government emblems (including the State Emblem of India), scales-of-justice imagery, other brands\' marks or AI-generated text in images are used. The court facade is a generic columned building with an empty pediment.\n')
(SYS / 'README.md').write_text('\n'.join(L) + '\n', encoding='utf-8')
print('README written')

# ---------- 4. manifest ----------
mf_path = ROOT / 'asset-manifest.json'
mf = json.loads(mf_path.read_text(encoding='utf-8'))
mf['assets'] = [a for a in mf['assets'] if not a['path'].startswith('lawvriksh-system/')]
def role(rel):
    p = rel.split('/')
    if rel.endswith(('.woff2', '.ttf')): return 'font'
    if rel.endswith('OFL.txt'): return 'font license notice'
    if p[1] == 'previews': return 'preview' if not rel.endswith('.json') else 'self-check results'
    if p[1] == 'tools': return 'generator / checker source'
    if p[1] == 'core': return 'shared template runtime and styles'
    if rel.endswith('.schema.json'): return 'slot schema'
    if rel.endswith('.example.json'): return 'example slot data'
    if rel.endswith('.meta.json'): return 'product composition metadata'
    if p[1] == 'product': return 'product composition (requires_claim_approval)'
    if p[1] == 'icons': return 'icon'
    if p[1] == 'graphics': return 'graphic'
    if p[1] in ('carousel', 'static', 'reel'): return f'{p[1]} template'
    if rel.endswith('README.md'): return 'documentation'
    return 'system file'
def rights(rel):
    if rel.endswith(('.woff2', '.ttf', 'OFL.txt')): return 'LawVriksh Sans v0.1, Public Sans derivative, SIL OFL 1.1 (notice: lawvriksh-system/fonts/LawVrikshSans-OFL.txt)'
    if '/product/' in rel or 'previews/product' in rel: return 'Original rebuild of LawVriksh product UI; placeholder data; requires founder claim approval before public use'
    return 'Original LawVriksh work; uses only library textures and mark by reference'
ignored = set(subprocess.check_output(['git', 'ls-files', '--others', '--ignored', '--exclude-standard', '-z', 'lawvriksh-system'], cwd=ROOT).decode().split('\0'))
added = 0
for p in sorted(SYS.rglob('*')):
    if not p.is_file(): continue
    rel = p.relative_to(ROOT).as_posix()
    if rel in ignored or p.name.startswith('.') or '__pycache__' in rel: continue
    b = p.read_bytes()
    mf['assets'].append({'path': rel, 'role': role(rel), 'status': 'proposed', 'bytes': len(b), 'sha256': hashlib.sha256(b).hexdigest(), 'copy': 'original' if not rel.endswith(('.woff2', '.ttf', 'OFL.txt')) else 'byte-identical', 'rights': rights(rel)})
    added += 1
mf_path.write_text(json.dumps(mf, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(f'manifest: {added} lawvriksh-system entries')

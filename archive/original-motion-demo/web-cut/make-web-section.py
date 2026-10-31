"""Make a web-cut project from an approved reel section (web-cut/web-cut-plan.md §11).

    python motion-demo/web-cut/make-web-section.py <N> [--hide "<css selectors>"]

Creates motion-demo/hyperframes/web-s<N>/ from section-<N>/ without touching the original:
  - src/scene.js   the section's scene code, exporting renderAt(reelTime) instead of
                   building its own timeline (src/web.js drives it through a time map)
  - index.html     the section's page with its layers wrapped in #film, a #captions layer,
                   the selectors given hidden (one-word titles, slab wipes the web cut replaces),
                   Newsreader 500 for the caption stream, and src/web.js as the entry
  - prepare-assets.mjs  the section's asset copy plus lib/stream.js and the caption fonts
  - plates/, hand/ copied when the section has them
src/web.js is written by hand per section (time map, segments, transitions).
"""
import re, shutil, sys, pathlib

hf = pathlib.Path(__file__).resolve().parent.parent / 'hyperframes'
n = sys.argv[1]
hide = ''
if '--hide' in sys.argv:
    hide = sys.argv[sys.argv.index('--hide') + 1]
src, dst = hf / f'section-{n}', hf / f'web-s{n}'
(dst / 'src').mkdir(parents=True, exist_ok=True)
shutil.copy(src / 'hyperframes.json', dst / 'hyperframes.json')
for d in ('plates', 'hand'):
    if (src / d).exists() and not (dst / d).exists():
        shutil.copytree(src / d, dst / d)

js = (src / 'src' / f'section{n}.js').read_text(encoding='utf8')
i = js.index('/* ------------------------------------------------------------- timeline */')
js = js[:i] + '/* ------------------------------------------------------------- web cut */\n// The web cut drives renderAt through its own time map (src/web.js); no timeline here.\nrenderAt(T0);\nexport { renderAt, T0 };\n'
js = js.replace('/* LawVriksh graphics track', f'/* WEB CUT COPY of section-{n}/src/section{n}.js: identical scene code, exporting renderAt for src/web.js.\n *\n * LawVriksh graphics track', 1)
(dst / 'src' / 'scene.js').write_text(js, encoding='utf8')

h = (src / 'index.html').read_text(encoding='utf8')
h = re.sub(r'<title>[^<]*</title>', f'<title>LawVriksh web cut — section {n}</title>', h, 1)
faces = ("    @font-face { font-family: 'Newsreader'; src: url(assets/fonts/web-newsreader-500.woff2) format('woff2'); font-weight: 500; }\n"
         "    @font-face { font-family: 'Newsreader'; src: url(assets/fonts/web-newsreader-500-italic.woff2) format('woff2'); font-weight: 500; font-style: italic; }\n")
h = h.replace('  <style>\n', '  <style>\n' + faces, 1)
extra = '\n    /* Web cut: replaced by the caption stream and its transitions */\n'
if hide:
    extra += f'    {hide} {{ display: none !important; }}\n'
extra += '    #film { overflow: hidden; }\n  </style>'
h = h.replace('</style>', extra, 1)
m = re.search(r'(<div id="root" data-composition-id=")section-\d+(" [^>]*data-duration=")[\d.]+(">)', h)
h = h[:m.start()] + m.group(1) + f'web-s{n}' + m.group(2) + 'DURATION' + m.group(3) + '\n    <div class="layer" id="film">' + h[m.end():]
j = h.rindex('  <script type="module">')
k = h.rindex('</div>', 0, j)
h = h[:k] + '  </div>\n    <div class="layer" id="captions"></div>\n  </div>\n' + h[k + len('</div>\n'):]
h = re.sub(r'<script type="module">.*?</script>', f"<script type=\"module\">\n    import {{ timeline }} from './src/web.js';\n    window.__timelines['web-s{n}'] = timeline;\n  </script>", h, flags=re.S)
(dst / 'index.html').write_text(h, encoding='utf8')

p = (src / 'prepare-assets.mjs').read_text(encoding='utf8')
add = ("  [path.join(md, 'web-cut/lib/stream.js'), 'lib/stream.js'], // the web cut's caption stream\n"
       "  [path.join(app, 'node_modules/@fontsource/newsreader/files/newsreader-latin-500-normal.woff2'), 'fonts/web-newsreader-500.woff2'],\n"
       "  [path.join(app, 'node_modules/@fontsource/newsreader/files/newsreader-latin-500-italic.woff2'), 'fonts/web-newsreader-500-italic.woff2'],\n")
p = p.replace('const copies = [\n', 'const copies = [\n' + add, 1)
p = re.sub(r"Copy section \d+'s local assets into section-\d+/assets", f"Copy web section {n}'s local assets into web-s{n}/assets", p)
(dst / 'prepare-assets.mjs').write_text(p, encoding='utf8')
print(f'web-s{n} ready')

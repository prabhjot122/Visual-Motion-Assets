"""One-time curated import from the user's existing motion-demo working tree.

Run: python scripts/import-library.py --source D:/lv-frontend/motion-demo
No source files are modified. This is not a recursive repository backup.
"""
import argparse, hashlib, json, re, shutil, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
args = argparse.ArgumentParser()
args.add_argument('--source', type=Path, required=True)
SRC = args.parse_args().source.resolve()
ARCH = ROOT / 'archive/original-motion-demo'
records = []

def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def copy(p, target, role, status='historical'):
    assert p.is_file(), p
    dest = ROOT / target
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(p, dest)
    rel = p.relative_to(SRC).as_posix() if p.is_relative_to(SRC) else p.relative_to(SRC.parent).as_posix()
    records.append({'path': target.as_posix(), 'source_relative_path': rel,
        'role': role, 'status': status, 'bytes': dest.stat().st_size,
        'sha256': digest(dest), 'copy': 'byte-identical'})

def tree(folder, target, role, predicate=lambda p: True, status='historical'):
    for p in sorted(folder.rglob('*')):
        rel = p.relative_to(folder)
        if not p.is_file() or any(x.startswith('.') or x in ('node_modules','__pycache__') for x in rel.parts):
            continue
        if predicate(rel): copy(p, target / rel, role, status)

# Portable brand assets, distinct from the historical source layout.
tree(SRC/'design/assets/textures', Path('brand/textures'), 'brand texture', status='approved appearance')
tree(SRC/'storyboard/assets/fonts', Path('brand/fonts'), 'font', status='brand default')
copy(SRC/'design/assets/lawvriksh-mark.png', Path('brand/logos/lawvriksh-mark.png'), 'brand mark', 'approved brand asset')

# Historical original sources: selective, never app runbooks or account data.
for name in ['creative-memory.md','design-spec.md','storyboard.md','reference-motion-analysis.md',
             'reference-index.md','section-2-plan.md','section-3-plan.md','section-4-plan.md',
             'section-5-plan.md','section-6-plan.md','section-7-plan.md','section-8-plan.md',
             'section-9-plan.md','section-10-plan.md']:
    copy(SRC/name, Path('archive/original-motion-demo')/name, 'historical film record')
tree(SRC/'design', Path('archive/original-motion-demo/design'), 'historical design source')
tree(SRC/'storyboard', Path('archive/original-motion-demo/storyboard'), 'historical style/source',
     lambda p: p.parts[0] not in ('superseded',) and p.name != 'animatic-review.mp4'
        and not p.name.startswith('reel-frame-'))
tree(SRC/'web-cut', Path('archive/original-motion-demo/web-cut'), 'historical website source',
     lambda p: p.parts[0] not in ('plates',) and p.suffix.lower() not in ('.mp4',))
tree(SRC/'reel-v3', Path('archive/original-motion-demo/reel-v3'), 'successful reel implementation source',
     lambda p: p.parts[0] not in ('analysis','build','media','music','renders')
        and p.suffix.lower() in ('.py','.mjs','.js','.json','.md','.sh'), 'successful example source')
tree(SRC/'sfx', Path('archive/original-motion-demo/sfx'), 'historical SFX code/library with notices')

# Prepared original scenes retain their local resources; generated reel/web copies
# retain source only. Exclude the assembly media cache, raw takes and render strips.
hf = SRC/'hyperframes'
for p in sorted(hf.iterdir()):
    if not p.is_dir(): continue
    if p.name == 'opening-pilot' or re.fullmatch(r'section-(?:[2-9]|10)',p.name) or p.name == 'web-tab':
        tree(p, Path('archive/original-motion-demo/hyperframes')/p.name, 'prepared historical scene')
    elif re.fullmatch(r'(?:web|reel)-[a-z0-9-]+',p.name) and p.name != 'web-titles-test':
        tree(p, Path('archive/original-motion-demo/hyperframes')/p.name, 'historical derived scene source',
             lambda rel: rel.parts[0] != 'assets')
for name in ['package.json','package-lock.json','hyperframes.json','README.md','run.ps1']:
    copy(hf/name, Path('archive/original-motion-demo/hyperframes')/name, 'historical renderer setup')

# Inspectable representative exports, not high-quality masters or raw takes.
copy(SRC/'reel-v3/renders/lawvriksh-reel-v3-share.mp4',Path('examples/reel-v3/lawvriksh-reel-v3-share.mp4'),
     'successful reel example', 'user-selected successful example')
copy(SRC/'hyperframes/renders/web/lawvriksh-web-cut-preview.mp4',Path('examples/website-film/lawvriksh-web-cut-preview.mp4'),
     'separate website-film example', 'historical separate format')
tree(SRC/'storyboard/renders',Path('examples/frame-c/style-frames'),'approved appearance example',status='approved appearance')
copy(SRC/'storyboard/storyboard-sheet.jpg',Path('examples/frame-c/storyboard-sheet.jpg'),'historical style overview','approved appearance')

# Compact reference indexing, not redistribution of full third-party films.
for p in sorted((SRC/'references').rglob('*.jpg')):
    rel = p.relative_to(SRC/'references')
    if rel.name.startswith('influencer-') or 'influencer-reel' in rel.parts: continue
    if len(rel.parts) == 1 or (len(rel.parts)==2 and rel.parts[0]=='motion-analysis'):
        copy(p, Path('motion/references')/rel, 'external reference contact sheet', 'inspection only')
reference_sources = []
for slug in ['harvey','lovio']:
    p=SRC/f'media/originals/{slug}-reference-original.mp4'
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]))
    v=next(x for x in probe['streams'] if x['codec_type']=='video')
    reference_sources.append({'id':slug,'source_filename':p.name,'source_sha256':digest(p),
        'duration_seconds':float(probe['format']['duration']),'width':v['width'],'height':v['height'],
        'frame_rate':v['r_frame_rate'],'included':'contact sheets and written analysis only',
        'full_video_distribution':'not included; not granted a reuse or redistribution license'})
(ROOT/'motion/references/source-index.json').write_text(json.dumps(reference_sources,indent=2)+'\n',encoding='utf-8')

# Identify the historical local music candidates without redistributing them.
music_sources=[]
for p in sorted((SRC/'reel-v3/music').glob('*.mp3')):
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]))
    a=next(x for x in probe['streams'] if x['codec_type']=='audio')
    music_sources.append({'source_relative_path':p.relative_to(SRC).as_posix(),'sha256':digest(p),
        'duration_seconds':float(probe['format']['duration']),'codec':a['codec_name'],
        'sample_rate':a['sample_rate'],'channels':a['channels'],'audio_included':False,
        'rights':'exact source URL and license evidence not present in inspected project files; do not infer redistribution rights'})
(ROOT/'sound').mkdir(exist_ok=True)
(ROOT/'sound/music-source-index.json').write_text(json.dumps(music_sources,indent=2)+'\n',encoding='utf-8')

# Adapted active preview. Preserve the original separately and describe the delta.
original=SRC/'design/frame-c.html'
html=original.read_text(encoding='utf-8')
html=re.sub(r'<link[^>]+href="https://fonts\.[^"]+"[^>]*>\s*','',html)
html=html.replace('<style>','<link rel="stylesheet" href="../../brand/fonts.css">\n<style>',1)
html=html.replace('assets/textures/','../../brand/textures/').replace('assets/lawvriksh-mark.png','../../brand/logos/lawvriksh-mark.png')
dest=ROOT/'examples/frame-c/frame-c.html';dest.write_text(html,encoding='utf-8')
records.append({'path':dest.relative_to(ROOT).as_posix(),'source_relative_path':'design/frame-c.html',
    'role':'portable style preview','status':'approved appearance; local-font/path adaptation',
    'bytes':dest.stat().st_size,'sha256':digest(dest),'source_sha256':digest(original),
    'copy':'adapted: remote font links removed, local font CSS and brand paths added'})

# Keep actual font licenses from the existing install. No dependency directories copied.
for package, name in [('@fontsource/newsreader','Newsreader'),('@fontsource/instrument-serif','Instrument-Serif'),
                      ('@fontsource-variable/figtree','Figtree'),('@fontsource-variable/geist-mono','Geist-Mono')]:
    p=SRC.parent/'node_modules'/package/'LICENSE'
    if p.is_file():copy(p,Path('brand/font-notices')/(name+'-LICENSE.txt'),'font license notice','third-party notice')
copy(SRC/'hyperframes/node_modules/three/LICENSE',Path('archive/runtime-notices/Three-LICENSE.txt'),
     'Three.js license notice','third-party notice')

(ROOT/'asset-manifest.json').write_text(json.dumps({'schema_version':1,'date':'2026-10-31',
    'source':'existing motion-demo working tree; relative source paths, never a clean revision assumption',
    'assets':records},indent=2)+'\n',encoding='utf-8')
media=[]
for path, role in [('examples/reel-v3/lawvriksh-reel-v3-share.mp4','successful reel'),
                   ('examples/website-film/lawvriksh-web-cut-preview.mp4','separate website example')]:
    result=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(ROOT/path)]))
    v=next(x for x in result['streams'] if x['codec_type']=='video')
    a=next((x for x in result['streams'] if x['codec_type']=='audio'),None)
    media.append({'path':path,'role':role,'duration_seconds':float(result['format']['duration']),
       'width':v['width'],'height':v['height'],'frame_rate':v['r_frame_rate'],'video_codec':v['codec_name'],
       'audio':{k:a.get(k) for k in ['codec_name','sample_rate','channels']} if a else None,
       'qualification':'existing representative export copied unchanged; not a newly rendered master'})
(ROOT/'media-index.json').write_text(json.dumps(media,indent=2)+'\n',encoding='utf-8')
exclusions={'reason':'curated portable creative library, not complete application backup',
 'excluded':['application source/config, secrets and account login runbooks','raw influencer takes and voice masters',
 'full Harvey/Lovio original videos: retain source identity and compact reference evidence only',
 'models, virtualenv, node_modules, hidden render caches and frame snapshots',
 'generation-job responses, service URLs, machine sessions and temporary logs',
 'assembly assets, rendered strips, analysis audio and intermediate exports',
 'rejected reel-reshoot compositor video', 'old influencer layout screenshots'],
 'historical_build_limit':'Full old-film rerender requires excluded original input media and runtime/app dependencies. Selected prepared scenes are inspectable; no blanket rebuild claim.'}
(ROOT/'archive/exclusions.json').write_text(json.dumps(exclusions,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'imported_assets':len(records),'total_copied_bytes':sum(x['bytes'] for x in records),
                  'source_modified':False,'media':media},indent=2))

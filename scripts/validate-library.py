"""Validate the shipped library: links, assets, exclusions and current guidance.

python scripts/validate-library.py [--source D:/lv-frontend/motion-demo]
"""
import argparse, hashlib, json, re, subprocess
from pathlib import Path
from urllib.parse import unquote

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--source',type=Path);parser.add_argument('--git-index',action='store_true')
args=parser.parse_args();source=args.source
errors=[]
def require(ok,message):
    if not ok:errors.append(message)
manifest=json.loads((ROOT/'asset-manifest.json').read_text(encoding='utf-8'))
seen=set();copied=0
for a in manifest['assets']:
    p=ROOT/a['path']
    require(p.is_relative_to(ROOT),'Asset escapes repository: '+a['path'])
    require(a['path'] not in seen,'Duplicate manifest path: '+a['path']);seen.add(a['path'])
    require(p.is_file(),'Missing asset: '+a['path'])
    if p.is_file():
        require(p.stat().st_size==a['bytes'],'Size mismatch: '+a['path'])
        require(hashlib.sha256(p.read_bytes()).hexdigest()==a['sha256'],'Hash mismatch: '+a['path'])
    if source:
        s=source/a['source_relative_path']
        if a['source_relative_path'].startswith('node_modules/'):s=source.parent/a['source_relative_path']
        require(s.is_file(),'Missing source: '+a['source_relative_path'])
        if s.is_file():
            expected=a.get('source_sha256',a['sha256'])
            require(hashlib.sha256(s.read_bytes()).hexdigest()==expected,'Source changed: '+a['source_relative_path'])
    copied+=1

# Active guidance links only. Archive links may refer to the original application;
# those limits are explicitly documented and are not startup instructions.
links=0
for p in ROOT.rglob('*.md'):
    rel=p.relative_to(ROOT)
    if rel.parts[0] in ('archive','.git'):continue
    for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)',p.read_text(encoding='utf-8')):
        if re.match(r'^(?:https?:|mailto:|#)',target):continue
        local=unquote(target.split('#')[0].strip('<>'))
        dest=(p.parent/local).resolve()
        require(dest.is_relative_to(ROOT),'Guidance link escapes repository: '+str(rel)+' -> '+target)
        require(dest.exists(),'Broken guidance link: '+str(rel)+' -> '+target);links+=1

# Validate the publishable package. Running Python may create ignored bytecode;
# ignored local artifacts are not shipped and must not invalidate the library.
names=subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z'],cwd=ROOT).decode('utf-8')
files=sorted({ROOT/name for name in names.split('\0') if name and (ROOT/name).is_file()})
for p in files:
    rel=p.relative_to(ROOT)
    require(not any(x in ('node_modules','__pycache__','.models') or x.startswith(('.venv','.snap')) for x in rel.parts),'Forbidden cache/dependency: '+str(rel))
    require(not p.name.startswith('.env'),'Environment file: '+str(rel))
    require(p.stat().st_size<50_000_000,'Large file exceeds package bound: '+str(rel))
    if p.suffix.lower() in ('.md','.txt','.json','.html','.js','.mjs','.py','.ps1','.sh'):
        body=p.read_text(encoding='utf-8',errors='replace')
        for pattern in [r'-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----',r'gh[pousr]_[A-Za-z0-9]{30,}',
                        r'github_pat_[A-Za-z0-9_]{40,}',r'(?i)(?:coo|admin|founder)@[a-z0-9.-]+\.[a-z]{2,}']:
            # Do not flag this scanner's own public pattern literals.
            if p.name!='validate-library.py':require(not re.search(pattern,body),'Credential/account material: '+str(rel))
    if rel.parts[0]!='scripts':
        require(p.name not in ('take-P.mp4','take-L.mp4','IMG_6187.MP4','influencer-reel-original.mp4'),
                'Raw influencer take: '+str(rel))

entry=(ROOT/'START-HERE.md').read_text(encoding='utf-8')
require('Reel V3' in entry and 'no influencer' in entry,'Current example/default missing')
require('rejected' in entry.lower(),'Rejection status missing')
require('historical' in (ROOT/'AGENTS.md').read_text(encoding='utf-8').lower(),'Archive authority boundary missing')
require('promotion' in (ROOT/'LEARNING-POLICY.md').read_text(encoding='utf-8').lower(),'Learning scope missing')
require('music acquisition' in (ROOT/'AGENTS.md').read_text(encoding='utf-8').lower(),'Autonomous audio guidance missing')
frame=(ROOT/'examples/frame-c/frame-c.html').read_text(encoding='utf-8')
require('fonts.googleapis' not in frame and '../../brand/fonts.css' in frame,'Preview still loads remote fonts')
css=ROOT/'brand/fonts.css'
for name in re.findall(r'url\(([^)]+)\)',css.read_text()):require((css.parent/name).exists(),'Missing bundled font: '+name)
for a in manifest['assets']:
    if a['role']=='font':require((ROOT/'brand/font-notices').is_dir(),'Missing font notices')

index_checks=0
if args.git_index:
    raw=subprocess.check_output(['git','ls-files','--stage','-z'],cwd=ROOT).decode('utf-8')
    indexed={item.split('\t',1)[1]:item.split()[1] for item in raw.split('\0') if item}
    for a in manifest['assets']:
        data=(ROOT/a['path']).read_bytes()
        blob=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
        require(indexed.get(a['path'])==blob,'Git index bytes differ from manifest asset: '+a['path'])
        index_checks+=1

report={'passed':not errors,'asset_hashes_checked':copied,'source_hashes_checked':copied if source else 0,
        'git_index_assets_checked':index_checks,
        'active_guidance_links_checked':links,'package_files_checked':len(files),
        'total_file_bytes':sum(p.stat().st_size for p in files),'errors':errors,
        'limits':'Historical archive is not a full old-film rebuild. Content validation is not an opinion on creative quality or an independent rights audit.'}
out=ROOT/'docs/verification/library-validation.json';out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,indent=2));raise SystemExit(bool(errors))

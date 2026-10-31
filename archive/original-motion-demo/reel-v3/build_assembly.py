"""Reel v3: write the 9:16 assembly composition (hyperframes/reel-v3-assembly/) from edl.json. Plan §3–4, §6.

  python build_assembly.py

Every picture is a static <video class="clip"> (HyperFrames reads clips from the HTML): the graphic strips,
the office footage, and the two takes cut exactly like the voice (a face clip follows the voice's spans
of its take, so lips stay matched through every jump cut). src/reel.js shows each shot in its window,
gives it its settle or punch, and draws the captions.
"""
import json, shutil
from pathlib import Path

HERE = Path(__file__).parent
HF = HERE.parent / 'hyperframes'
OUT = HF / 'reel-v3-assembly'
edl = json.load(open(HERE / 'edl.json', encoding='utf8'))
FPS = 30
spans = sorted(edl['voice'], key=lambda v: v['out_in'])

# where her face sits in each upscaled take (media/take-*.mp4) → placement in a panel
FACE_P_TOP = -8                              # full screen: 1080×1936 centred on 1920
SPLIT = {'P': (0, -440), 'L': (-440, 0)}     # bottom panel 1080×920: (x, y) offset of the take's frame

def take_pieces(take, a, b):
    """[(t0, t1, media_t0)] covering [a, b) of the output with that take's footage, cut with its voice spans"""
    own = [v for v in spans if v['take'] == take]
    cuts = [v for v in own if a < v['out_in'] < b]
    pieces, t = [], a
    for v in cuts + [None]:
        end = v['out_in'] if v else b
        if end - t > 1e-6:
            prev = [w for w in own if w['out_in'] <= t + 1e-6]
            if prev and t < prev[-1]['out_in'] + (prev[-1]['src_out'] - prev[-1]['src_in']) + 1.0:
                p = prev[-1]; m = p['src_in'] + (t - p['out_in'])
            else:  # the shot opens just before this take's next span: run into it
                n = next(w for w in own if w['out_in'] >= t - 1e-6); m = n['src_in'] - (n['out_in'] - t)
            pieces.append((t, end, max(0.0, m)))
        t = end
    # a piece under 0.2 s does not render reliably: fold it into the next one (run the next span in early)
    merged = []
    for t0, t1, m in reversed(pieces):
        if merged and t1 - t0 < 0.2: n0, n1, nm = merged[-1]; merged[-1] = (t0, n1, nm - (n0 - t0))
        else: merged.append((t0, t1, m))
    if len(merged) > 1 and merged[-1][1] - merged[-1][0] < 0.2: (a0, _, _), (_, b1, bm) = merged[-1], merged[-2]; merged[-2:] = [(a0, b1, bm - (merged[-2][0] - a0))]
    return list(reversed(merged))

H = 0.5 / FPS  # half a frame of margin at both ends: frame times never fall between two clips
# the AI-upscaled stretches (upscale.py): a face clip plays from the SR clip that covers it, else the plain take
SR = json.load(open(HERE / 'media/sr/index.json')) if (HERE / 'media/sr/index.json').exists() else {'P': [], 'L': []}
def face_src(tk, m, dur):
    for iv in SR[tk]:
        if iv['start'] <= m - 0.02 and m + dur <= iv['end'] + 0.02: return (f"sr/{iv['file']}", m - iv['start'])
    return (f'take-{tk}.mp4', m)

def face_clip(tk, t0, t1, m, cls):
    src, mm = face_src(tk, m, t1 - t0)
    return clip(src, t0, t1, mm, cls)

def clip(src, t0, t1, m0, cls=''):
    return f'<video class="clip {cls}" src="assets/{src}" data-start="{max(0.0, t0 - H):.6f}" data-duration="{t1 - t0 + 2 * H:.6f}" data-media-start="{max(0.0, m0 - H):.6f}" muted playsinline></video>'

# scenes rendered without the camera (make_scenes.NATIVE) and each shot's camera window (its start)
NATIVE = set()  # (make_scenes.NATIVE)
import importlib.util
_sp = importlib.util.spec_from_file_location('shots', HERE / 'shots.py'); _m = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(_m)
CAM = {i + 1: sh['cam'][0] for i, sh in enumerate(_m.SHOTS) if sh.get('scene') in NATIVE}

html_shots = []
for s in edl['shots']:
    t0, t1 = s['t0'], s['t1']
    inner = ''
    if s['mode'] in ('GRAPHIC', 'SPLIT'):
        g = clip(f"strips/{s['scene']}.mp4", t0, t1, s['strip']['f0'] / FPS, 'gfx')
        if s['scene'] in NATIVE:  # rendered at 1440×1000: crop the shot's camera window here
            (cx, cy, w), box = CAM[s['i']], (1080, 1920 if s['mode'] == 'GRAPHIC' else 1000)
            k = box[0] / w
            g = g.replace('class="clip gfx"', f'class="clip native" style="transform: translate({box[0] / 2 - cx * k:.1f}px, {box[1] / 2 - cy * k:.1f}px) scale({k:.4f})"')
        inner += f'<div class="{"full" if s["mode"] == "GRAPHIC" else "top"}">{g}</div>'
    if s['mode'] in ('FACE', 'SPLIT'):
        tk = s['take']
        vids = ''.join(face_clip(tk, a, b, m, f'face face-{tk}') for a, b, m in take_pieces(tk, t0, t1))
        if s['mode'] == 'FACE':
            inner += f'<div class="full punch" style="--y:{FACE_P_TOP}px">{vids}</div>'
        else:
            x, y = SPLIT[tk]
            inner += f'<div class="bottom"><div class="pan" style="--x:{x}px; --y:{y}px">{vids}</div></div><div class="seam"></div>'
    if s['mode'] == 'BROLL':
        inner += f'<div class="full">{clip("office.mp4", t0, t1, max(0.0, s["media"][0] - 0.4), "gfx")}</div>'  # pre-cropped 1080×1920
    html_shots.append(f'<div class="shot {s["mode"].lower()}" id="shot-{s["i"]}">{inner}</div>')

page = (HERE / 'lib' / 'assembly.html').read_text(encoding='utf8')
page = page.replace('%DURATION%', f"{edl['duration']:.4f}").replace('%SHOTS%', '\n      '.join(html_shots))
OUT.mkdir(parents=True, exist_ok=True); (OUT / 'src').mkdir(exist_ok=True)
(OUT / 'index.html').write_text(page, encoding='utf8')
shutil.copy(HERE / 'lib' / 'reel.js', OUT / 'src' / 'reel.js')
shutil.copy(HERE / 'lib' / 'assembly-prepare.mjs', OUT / 'prepare-assets.mjs')
(OUT / 'hyperframes.json').write_text((HF / 'web-tab' / 'hyperframes.json').read_text(encoding='utf8'), encoding='utf8')
json.dump({k: edl[k] for k in ('duration', 'shots', 'words', 'sentences')}, open(OUT / 'edl.json', 'w', encoding='utf8'), ensure_ascii=False)
n = sum(h.count('<video') for h in html_shots)
print(f'reel-v3-assembly: {len(edl["shots"])} shots, {n} clips, {edl["duration"]} s')

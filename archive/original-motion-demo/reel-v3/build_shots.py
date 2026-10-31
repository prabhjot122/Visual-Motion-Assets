"""Reel v3: resolve shots.py against edl.json (word anchors → frame-exact cuts) and schedule the graphic shots
into one render strip per scene (scenes/<scene>/strip.json: back-to-back segments with scene time and camera).

  python build_shots.py
"""
import json, importlib.util
from pathlib import Path

HERE = Path(__file__).parent
FPS = 30
edl = json.load(open(HERE / 'edl.json', encoding='utf8'))
spec = importlib.util.spec_from_file_location('shots', HERE / 'shots.py'); mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)

def word_time(s, w, off):
    if s == 'end': return edl['words'][-1]['e'] + 0.12 + off
    for x in edl['words']:
        if x['sentence'] == s and x['w'].strip('.,?!') == w.strip('.,?!'): return x['s'] + off
    raise KeyError((s, w))

def fr(t): return round(t * FPS)
starts = [fr(max(0.0, word_time(*sh['at']))) for sh in mod.SHOTS]
starts[0] = 0
assert all(a < b for a, b in zip(starts, starts[1:])), 'shots out of order'
ends = starts[1:] + [starts[-1] + fr(mod.SHOTS[-1].get('tail', 1.5))]

BOX = {'GRAPHIC': (0, 0, 1080, 1920), 'SPLIT': (0, 0, 1080, 1000)}
take_of = {s['n']: s['take'] for s in edl['sentences']}
def sentence_at(t):
    cur = edl['sentences'][0]['n']
    for s in edl['sentences']:
        if s['start'] <= t + 0.2: cur = s['n']  # a cut lands just before its first word
    return cur

shots, strips = [], {}
for i, (sh, a, b) in enumerate(zip(mod.SHOTS, starts, ends)):
    t0, t1 = a / FPS, b / FPS
    out = {'i': i + 1, 'mode': sh['mode'], 'f0': a, 'f1': b, 't0': round(t0, 4), 't1': round(t1, 4)}
    if sh['mode'] in ('FACE', 'SPLIT'):
        out['take'] = take_of[sentence_at(t0)]
        if sh['mode'] == 'FACE': assert out['take'] == 'P', f'shot {i + 1}: full-screen face needs the portrait take'
    if 'punch' in sh: out['punch'] = sh['punch']
    if sh['mode'] == 'BROLL': out.update(src=sh['src'], media=sh['media'])
    if 'scene' in sh:
        out['scene'] = sh['scene']
        st = strips.setdefault(sh['scene'], {'segments': [], 'frames': 0})
        reel = sh['reel']
        if reel == 'live':  # scene time runs with the reel from the scene's first shot
            base = st.setdefault('base', t0); reel = (round(t0 - base, 4), round(t1 - base, 4))
        seg = {'shot': i + 1, 'f0': st['frames'], 'frames': b - a, 'reel': reel, 'box': BOX[sh['mode']]}
        if 'cam' in sh: seg['cam'] = sh['cam']
        if 'extra' in sh: seg['extra'] = sh['extra']
        st['segments'].append(seg); st['frames'] += b - a
        out['strip'] = {'scene': sh['scene'], 'f0': seg['f0']}
    shots.append(out)

edl['shots'] = shots
edl['duration'] = round(ends[-1] / FPS, 4)
json.dump(edl, open(HERE / 'edl.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
for name, st in strips.items():
    if 'base' in st:  # live scenes key their entrances to her words: hand them the words, in scene time
        end = st['base'] + st['frames'] / FPS
        st['words'] = [{'w': w['w'], 't': round(w['s'] - st['base'], 3)} for w in edl['words'] if st['base'] - 0.5 <= w['s'] < end]
    d = HERE / 'scenes' / name; d.mkdir(parents=True, exist_ok=True)
    json.dump({'fps': FPS, **st}, open(d / 'strip.json', 'w'), indent=1)
for s in shots:
    extra = s.get('scene', s.get('take', '')) + (' ' + s['take'] if s['mode'] == 'SPLIT' else '')
    print(f"{s['i']:>2} {s['t0']:6.2f}–{s['t1']:6.2f} {s['t1'] - s['t0']:4.2f}s {s['mode']:<7} {extra}")
print(f"duration {edl['duration']} s; strips:", {k: v['frames'] for k, v in strips.items()})

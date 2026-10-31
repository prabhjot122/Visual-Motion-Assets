"""Reel v3: build the edit decision list (edl.json) from the aligned word timings. Plan: reel-v3-plan.md.

  python build_edl.py            → edl.json + voice.wav (the spoken edit, for audition)

Every sentence comes whole from one take (picture and voice together, so lips always match):
P = the old portrait take (full-screen face), L = the new landscape take (new wording, Hearing Prep, CTA).
Gaps between sentences are tightened to the reference's pace (≈ 0.3 s); three gaps are deliberate beats.
Inside a sentence, any silence over 0.45 s is closed to 0.3 s. Shots are anchored to words, never to
typed times, so picture, captions and sound all follow the voice.
"""
import json, re, subprocess
from pathlib import Path

HERE = Path(__file__).parent
A = HERE / 'analysis'
FPS = 30
TAKES = {'P': A / 'portrait-old.mp4', 'L': A / 'landscape-new.mp4'}

def sentences(take):
    words = json.load(open(A / f'align-{take}.json', encoding='utf8'))
    out, cur = [], []
    for w in words:
        cur.append(w)
        if re.search(r'[.?!]$', w['word']): out.append(cur); cur = []
    if cur: out.append(cur)
    return out

SP, SL = sentences('P'), sentences('L')
# S1…S14 of the new script: (take, sentence index in that take)
CHOICE = [('P', 0), ('P', 1), ('P', 2), ('P', 3), ('L', 4), ('L', 5), ('L', 6), ('L', 7), ('L', 8), ('L', 9), ('P', 8), ('P', 9), ('P', 10), ('L', 13)]
# gap before each sentence (s); the deliberate beats: the question lands (S3), a breath into Hearing Prep (S9),
# the turn to "As technology evolves" (S11)
GAP_BEFORE = {9: 0.5, 11: 0.75}   # (no beat before S3: it read as a lag; the brand grows under her words instead)
GAP = 0.22
PRE, POST = 0.05, 0.09            # handles around each spoken span
INNER_MAX, INNER_TO = 0.3, 0.18   # inner silences longer than this close to this (reel-style jump cuts)

def fr(t): return round(t * FPS) / FPS

# speech activity from the audio itself (word end-times from ASR stretch across silences)
import av, numpy as np
HOP, THR = 0.01, -36.0   # 10 ms frames; speech sits ≈ −23 dB, silence below −38 dB in both takes
def activity(path):
    c = av.open(str(path)); rs = av.AudioResampler(format='s16', layout='mono', rate=16000)
    x = np.concatenate([r.to_ndarray().reshape(-1) for f in c.decode(c.streams.audio[0]) for r in rs.resample(f)]).astype(np.float32) / 32768
    h = 160; n = len(x) // h
    db = 20 * np.log10(np.sqrt((x[:n * h].reshape(n, h) ** 2).mean(1)) + 1e-9)
    db = np.convolve(db, np.ones(3) / 3, 'same')
    return db > THR
ACT = {k: activity(v) for k, v in TAKES.items()}

def regions(take, a, b):
    """speech regions inside [a, b] s of a take, gaps under INNER_MAX merged, specks under 80 ms dropped"""
    act = ACT[take][int(a / HOP):int(b / HOP)]
    out, start = [], None
    for i, on in enumerate(list(act) + [False]):
        if on and start is None: start = i
        if not on and start is not None: out.append([a + start * HOP, a + i * HOP]); start = None
    merged = []
    for r in out:
        if merged and r[0] - merged[-1][1] < INNER_MAX: merged[-1][1] = r[1]
        else: merged.append(r)
    return [r for r in merged if r[1] - r[0] >= 0.08]

def silences(take):
    act = ACT[take]; out, start = [], None
    for i, on in enumerate(list(act) + [True]):
        if not on and start is None: start = i
        if on and start is not None:
            if (i - start) * HOP >= 0.18: out.append(((start + i) / 2 * HOP, (i - start) * HOP))
            start = None
    return out

def boundaries(take, sl):
    """sentence k spans BOUND[k]…BOUND[k+1]: each boundary is the real silence nearest the ASR estimate"""
    sil, dur = silences(take), len(ACT[take]) * HOP
    bs = [0.0]
    for k in range(len(sl) - 1):
        est = (sl[k][-1]['end'] + sl[k + 1][0]['start']) / 2
        cands = [c for c, d in sil if c > bs[-1] + 0.5 and abs(c - est) < 1.5]
        bs.append(min(cands, key=lambda c: abs(c - est) - 0.3 * min(1, dict(sil)[c])) if cands else est)  # favour longer silences
    return bs + [dur]
BOUND = {'P': boundaries('P', SP), 'L': boundaries('L', SL)}

voice, words_out, sent_out = [], [], []
t = 0.0
for n, (take, si) in enumerate(CHOICE, start=1):
    sl = SP if take == 'P' else SL
    ws = sl[si]
    a, b = BOUND[take][si], BOUND[take][si + 1]
    runs = regions(take, a, b)
    # ASR word times drift up to ~1 s: spread the sentence's words over where speech really is
    a0, a1, r0, r1 = ws[0]['start'], ws[-1]['end'], runs[0][0], runs[-1][1]
    ws = [{**w, 'start': r0 + (w['start'] - a0) * (r1 - r0) / (a1 - a0), 'end': r0 + (w['end'] - a0) * (r1 - r0) / (a1 - a0)} for w in ws]
    if n > 1: t += GAP_BEFORE.get(n, GAP)
    s_start = fr(t)
    spans = []
    for k, (ra, rb) in enumerate(runs):
        if k: t += INNER_TO
        src_in, src_out = max(0, ra - PRE), rb + POST
        out_in = fr(t)
        voice.append({'take': take, 'src_in': round(src_in, 3), 'src_out': round(src_out, 3), 'out_in': out_in, 'sentence': n})
        spans.append((src_in, src_out, out_in))
        t = out_in + (src_out - src_in)
    # each word maps through the span that holds it (or the nearest one)
    for w in ws:
        sp = min(spans, key=lambda s: 0 if s[0] <= w['start'] <= s[1] else min(abs(w['start'] - s[0]), abs(w['start'] - s[1])))
        clamp = lambda v: min(max(v, sp[0]), sp[1])
        words_out.append({'w': w['word'], 's': round(sp[2] + clamp(w['start']) - sp[0], 3), 'e': round(sp[2] + clamp(w['end']) - sp[0], 3), 'sentence': n, 'take': take})
    sent_out.append({'n': n, 'take': take, 'start': s_start, 'end': round(t, 3), 'text': ' '.join(w['word'] for w in ws)})

END = round(t + 0.25, 3)
edl = {'fps': FPS, 'width': 1080, 'height': 1920, 'speech_end': END, 'takes': {k: str(v) for k, v in TAKES.items()},
       'voice': voice, 'sentences': sent_out, 'words': words_out}
json.dump(edl, open(HERE / 'edl.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)

# the voices: both takes cleaned by DeepFilterNet3 (noise and room reverb; build/voice/enhance.py), then the
# landscape take matched to the portrait take's colour (build/voice/match.py: a smoothed long-term spectrum
# match at 70 %) and level (−0.4 dB). The video files still drive the cut points.
AUDIO = {'P': HERE / 'build/voice/P-clean.wav', 'L': HERE / 'build/voice/L-matched.wav'}
TAKE_MATCH = {'P': '', 'L': 'volume=-0.4dB,'}

# the spoken edit, for audition: each span trimmed from its take, 15 ms fades, placed at its output time
inputs, filters = [], []
for i, v in enumerate(voice):
    inputs += ['-i', str(AUDIO[v['take']])]
    d = v['src_out'] - v['src_in']
    match = TAKE_MATCH[v['take']]
    filters.append(f"[{i}:a]aresample=48000,pan=mono|c0=c0,atrim={v['src_in']}:{v['src_out']},asetpts=PTS-STARTPTS,{match}"
                   f"afade=t=in:d=0.015,afade=t=out:st={d - 0.015:.3f}:d=0.015,adelay={int(v['out_in'] * 1000)}[v{i}]")
filters.append(''.join(f'[v{i}]' for i in range(len(voice))) + f'amix=inputs={len(voice)}:normalize=0,atrim=0:{END}[out]')
(HERE / 'build').mkdir(exist_ok=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(filters), '-map', '[out]', '-c:a', 'pcm_s16le', str(HERE / 'build' / 'voice-raw.wav')], check=True)
for s in sent_out: print(f"S{s['n']:<2} {s['take']} {s['start']:6.2f}–{s['end']:6.2f}  {s['text'][:70]}")
print(f'speech ends {END:.2f} s; {len(voice)} spans')

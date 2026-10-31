"""sfx generators: each returns mono float samples at SR (48 kHz). Pure Python stdlib; seeded, so every
render is identical. `python -m sfx --list` prints the first docstring line of each.

Built from the sound-design skill's spec (generator → visual event): whoosh, pop, click, blip, chime,
riser, impact, sub_drop, scratch, pad, tick. Plus `sample()` for the CC0 library in sfx/library/
(coldframe: Kenney + @remotion/sfx, see library/LICENSE.md).
"""
import math, random, wave, array
from pathlib import Path

SR = 48000
random.seed(7)
LIB = Path(__file__).parent / 'library'

def _n(d): return max(1, int(d * SR))

def envelope(n, a=0.005, r=0.1, curve=3.0):
    """attack/decay envelope: linear attack a s, exponential-ish release over the rest"""
    na = max(1, int(a * SR)); out = []
    for i in range(n):
        if i < na: out.append(i / na)
        else:
            u = (i - na) / max(1, n - na)
            out.append((1 - u) ** curve)
    return out

def bandnoise(d, lo, hi, peak=1.0):
    """noise band-limited between lo and hi Hz (two one-pole filters); the base of anything airy"""
    n = _n(d); y, lp1, lp2 = [], 0.0, 0.0
    a_hi = 1 - math.exp(-2 * math.pi * hi / SR); a_lo = 1 - math.exp(-2 * math.pi * lo / SR)
    for _ in range(n):
        x = random.uniform(-1, 1)
        lp1 += a_hi * (x - lp1); lp2 += a_lo * (lp1 - lp2)
        y.append((lp1 - lp2) * peak * 2.2)
    return y

def whoosh(d=0.45, f0=400, f1=2600, peak=0.5):
    """airy sweep for a move or a reveal: band noise whose band glides f0→f1, swelling to the middle"""
    n = _n(d); y, lp1, lp2 = [], 0.0, 0.0
    for i in range(n):
        u = i / n; f = f0 * (f1 / f0) ** u
        a_hi = 1 - math.exp(-2 * math.pi * f * 1.8 / SR); a_lo = 1 - math.exp(-2 * math.pi * f * 0.45 / SR)
        x = random.uniform(-1, 1); lp1 += a_hi * (x - lp1); lp2 += a_lo * (lp1 - lp2)
        y.append((lp1 - lp2) * 3.0 * peak * math.sin(math.pi * u) ** 1.6)
    return y

def tone(f, d, peak=0.5, harm=(1.0, 0.3, 0.12), a=0.004, r_curve=3.0):
    """plain additive tone with a decaying envelope"""
    n = _n(d); env = envelope(n, a, curve=r_curve)
    return [peak * env[i] * sum(h * math.sin(2 * math.pi * f * (k + 1) * i / SR) for k, h in enumerate(harm)) for i in range(n)]

def pop(f=900, d=0.09, peak=0.6):
    """a badge or chip popping in: a short pitch-dropping blip with a soft click"""
    n = _n(d); y = []
    for i in range(n):
        u = i / n; ff = f * (1.6 - 0.6 * u)
        y.append(peak * (1 - u) ** 4 * math.sin(2 * math.pi * ff * i / SR))
    return y

def click(d=0.012, peak=0.5):
    """a control snapping: a very short filtered noise tick"""
    return [x * e for x, e in zip(bandnoise(d, 1500, 9000, peak), envelope(_n(d), 0.0005, curve=5))]

def blip(f=1320, d=0.07, peak=0.35):
    """a landing accent in key: a short sine with fast decay"""
    return tone(f, d, peak, (1.0, 0.15), 0.002, 4)

def tick(peak=0.4):
    """a timeline or counter step: click plus a tiny high blip"""
    c, b = click(0.01, peak), blip(2640, 0.04, peak * 0.4)
    return [c[i] if i < len(c) else 0 for i in range(len(b))] if len(b) < len(c) else [b[i] + (c[i] if i < len(c) else 0) for i in range(len(b))]

def chime(freqs=(587.33, 739.99, 880.0), d=1.2, peak=0.35, spread=0.035):
    """success or arrival: a soft chord in key, notes slightly staggered"""
    n = _n(d + spread * len(freqs)); y = [0.0] * n
    for k, f in enumerate(freqs):
        t = tone(f, d, peak / len(freqs) * 1.6, (1.0, 0.25, 0.08), 0.003, 2.5); o = int(k * spread * SR)
        for i, v in enumerate(t): y[o + i] += v
    return y

def riser(d=2.0, f0=180, f1=1400, peak=0.35):
    """build-up into a hit: noise swelling and rising with a pitched sweep; end it exactly on the hit"""
    n = _n(d); y, lp, ph = [], 0.0, 0.0
    for i in range(n):
        u = i / n; f = f0 * (f1 / f0) ** (u ** 1.5); a = 1 - math.exp(-2 * math.pi * f * 3 / SR)
        lp += a * (random.uniform(-1, 1) - lp); ph += 2 * math.pi * f / SR
        y.append(peak * u ** 2.2 * (0.7 * lp * 2 + 0.3 * math.sin(ph)))
    return y

def sub_drop(d=1.1, f0=110, f1=38, peak=0.8):
    """the low thud under a hero hit: a sine gliding down, long decay"""
    n = _n(d); y, ph = [], 0.0
    for i in range(n):
        u = i / n; f = f0 * (f1 / f0) ** min(1, u * 2.2); ph += 2 * math.pi * f / SR
        y.append(peak * min(1, i / (0.004 * SR)) * (1 - u) ** 1.8 * math.sin(ph))
    return y

def impact(d=1.2, peak=0.8):
    """the hero hit: sub drop plus a noise burst body"""
    s, b = sub_drop(d, 95, 36, peak), bandnoise(0.25, 60, 2500, peak * 0.6)
    env = envelope(len(b), 0.001, curve=6)
    return [s[i] + (b[i] * env[i] if i < len(b) else 0) for i in range(len(s))]

def scratch(d=0.5, peak=0.25):
    """pencil or sketch: scratchy noise in short strokes"""
    n = _n(d); base = bandnoise(d, 1800, 7000, peak); y = []
    for i in range(n):
        stroke = 0.5 + 0.5 * math.sin(2 * math.pi * 9 * i / SR) ** 2
        y.append(base[i] * stroke)
    return y

def pad(d, freqs=(146.83, 220.0, 293.66, 369.99), peak=0.2, detune=0.4):
    """under everything: a soft stereo chord bed (returns (left, right)); shape it with an envelope"""
    n = _n(d); L, R = [0.0] * n, [0.0] * n
    for k, f in enumerate(freqs):
        for side, det in ((L, -detune), (R, detune)):
            w = 2 * math.pi * (f + det * (k + 1)) / SR
            for i in range(n): side[i] += peak / len(freqs) * (math.sin(w * i) + 0.2 * math.sin(2 * w * i))
    fade = int(min(1.5, d / 4) * SR)
    for i in range(fade): L[i] *= i / fade; R[i] *= i / fade; L[-1 - i] *= i / fade; R[-1 - i] *= i / fade
    return L, R

_cache = {}
def sample(name, rate=1.0, gain=1.0):
    """a CC0 library sound (sfx/library/<name>.wav) as mono at SR, optionally re-pitched by rate"""
    if name not in _cache:
        with wave.open(str(LIB / f'{name}.wav')) as w:
            ch, sw, sr, n = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes()
            raw = w.readframes(n)
        assert sw == 2 and sr == SR, f'{name}: needs 16-bit {SR} Hz'
        a = array.array('h'); a.frombytes(raw)
        _cache[name] = [sum(a[i:i + ch]) / ch / 32768 for i in range(0, len(a), ch)]
    x = _cache[name]
    if rate == 1.0: return [v * gain for v in x]
    m = int(len(x) / rate)
    return [x[min(len(x) - 1, int(i * rate))] * gain for i in range(m)]

GENERATORS = [whoosh, pop, click, blip, tick, chime, riser, sub_drop, impact, scratch, pad, bandnoise, sample]

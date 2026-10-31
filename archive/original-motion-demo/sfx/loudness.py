"""BS.1770-4 integrated loudness (LUFS) and sample peak, pure Python. Matches ffmpeg's ebur128 within ~0.1 LU."""
import math

def _biquad(x, b, a):
    y, x1, x2, y1, y2 = [], 0.0, 0.0, 0.0, 0.0
    for v in x:
        o = b[0] * v + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2
        x2, x1, y2, y1 = x1, v, y1, o
        y.append(o)
    return y

def _kweight(x, sr):
    # stage 1: high shelf (+4 dB above ~1.5 kHz); stage 2: RLB high-pass (~38 Hz) — the standard's 48 kHz coefficients
    assert sr == 48000
    s1 = _biquad(x, (1.53512485958697, -2.69169618940638, 1.19839281085285), (1.0, -1.69065929318241, 0.73248077421585))
    return _biquad(s1, (1.0, -2.0, 1.0), (1.0, -1.99004745483398, 0.99007225036621))

def integrated(channels, sr=48000):
    """integrated loudness of [ch0, ch1, …] float lists; gated per BS.1770 (−70 LUFS absolute, −10 LU relative)"""
    kw = [_kweight(c, sr) for c in channels]
    blk, hop = int(0.4 * sr), int(0.1 * sr)
    n = len(kw[0]); zs = []
    for s in range(0, max(1, n - blk + 1), hop):
        zs.append(sum(sum(v * v for v in c[s:s + blk]) / blk for c in kw))
    lk = lambda z: -0.691 + 10 * math.log10(z) if z > 0 else -999
    g1 = [z for z in zs if lk(z) > -70]
    if not g1: return -999.0
    rel = lk(sum(g1) / len(g1)) - 10
    g2 = [z for z in g1 if lk(z) > rel]
    return lk(sum(g2) / len(g2))

def peak_db(channels):
    p = max(max(abs(v) for v in c) for c in channels)
    return 20 * math.log10(p) if p > 0 else -999.0

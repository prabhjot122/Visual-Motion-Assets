"""Mix: place sounds in time, master to a loudness target (or leave as a stem), write a 16-bit 48 kHz WAV."""
import math, random, wave, array
from .synth import SR, sample
from . import loudness

class Mix:
    def __init__(self, duration):
        self.n = int(duration * SR) + SR
        self.L = [0.0] * self.n; self.R = [0.0] * self.n
        self.events = []

    def put(self, t, x, gain=0.2, pan=0.0):
        """mono samples x at time t (s), constant-power pan −1 … +1"""
        i0 = int(round(t * SR)); a = (pan + 1) * math.pi / 4
        gl, gr = gain * math.cos(a), gain * math.sin(a)
        for k, v in enumerate(x):
            i = i0 + k
            if 0 <= i < self.n: self.L[i] += v * gl; self.R[i] += v * gr
        self.events.append(round(t, 3))

    def put_stereo(self, t, left, right, gain=0.2):
        i0 = int(round(t * SR))
        for k, (l, r) in enumerate(zip(left, right)):
            i = i0 + k
            if 0 <= i < self.n: self.L[i] += l * gain; self.R[i] += r * gain

    def typing(self, start, end, chars, gain=0.12, pan=0.0, names=('key-1', 'key-2', 'key-3', 'key-4')):
        """one humanised keystroke per character between start and end"""
        rnd = random.Random(int(start * 1000))
        for k in range(chars):
            t = start + (end - start) * k / max(1, chars - 1) + rnd.uniform(-0.005, 0.005)
            self.put(t, sample(rnd.choice(names), rate=rnd.uniform(0.96, 1.04)), gain * 10 ** (rnd.uniform(-2, 2) / 20), pan)

    def master(self, target=-14.0, tp_db=-2.0):
        """soft-clip and gain to the target integrated loudness, true-ish peak ≤ tp_db; returns the LUFS reached"""
        lufs = loudness.integrated([self.L, self.R])
        g = 10 ** ((target - lufs) / 20)
        ceiling = 10 ** (tp_db / 20)
        sat = lambda v: ceiling * math.tanh(v / ceiling)
        self.L = [sat(v * g) for v in self.L]; self.R = [sat(v * g) for v in self.R]
        return loudness.integrated([self.L, self.R])

    def write(self, path):
        with wave.open(str(path), 'wb') as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
            a = array.array('h')
            for l, r in zip(self.L, self.R):
                a.append(max(-32767, min(32767, int(l * 32767)))); a.append(max(-32767, min(32767, int(r * 32767))))
            w.writeframes(a.tobytes())

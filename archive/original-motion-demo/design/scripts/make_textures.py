"""Procedural textures for the LawVriksh style frames (paper, stone, hatching, office plate)."""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(7)


def noise(w, h, octaves=(4, 8, 16, 32, 64, 128), falloff=0.55):
    acc = np.zeros((h, w), np.float32)
    amp, total = 1.0, 0.0
    for o in octaves:
        small = rng.random((max(2, h * o // max(w, h)), max(2, o))).astype(np.float32)
        layer = np.asarray(Image.fromarray((small * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), np.float32) / 255
        acc += layer * amp
        total += amp
        amp *= falloff
    acc /= total
    return (acc - acc.min()) / (acc.max() - acc.min() + 1e-6)


def tint(field, dark, light):
    dark, light = np.array(dark, np.float32), np.array(light, np.float32)
    return (dark[None, None] * (1 - field[..., None]) + light[None, None] * field[..., None]).clip(0, 255).astype(np.uint8)


def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def grain(w, h, strength):
    return (rng.standard_normal((h, w)).astype(np.float32) * strength)


def save(arr, name, quality=88):
    img = Image.fromarray(arr)
    if name.endswith('.jpg'):
        img.save(OUT / name, quality=quality, optimize=True)
    else:
        img.save(OUT / name, optimize=True)


# 1. Paper ground: warm, mottled, fibrous
W, H = 1440, 1000
f = noise(W, H, octaves=(3, 6, 12, 48, 160), falloff=0.6)
paper = tint(0.82 + 0.18 * f, hexrgb('#d9d2c4'), hexrgb('#f6f2ea')).astype(np.float32)
paper += grain(W, H, 4.5)[..., None]
fib = Image.new('L', (W, H), 0)
d = ImageDraw.Draw(fib)
for _ in range(900):
    x, y = rng.integers(0, W), rng.integers(0, H)
    a = rng.uniform(0, np.pi)
    ln = rng.uniform(6, 26)
    d.line([(x, y), (x + np.cos(a) * ln, y + np.sin(a) * ln)], fill=int(rng.integers(20, 60)), width=1)
fib = np.asarray(fib.filter(ImageFilter.GaussianBlur(0.6)), np.float32) / 255
paper -= fib[..., None] * 18
save(paper.clip(0, 255).astype(np.uint8), 'paper.jpg')


def stone(size, dark, light, name, speck=0.03):
    f = noise(size, size, octaves=(3, 7, 15, 40, 120, 300), falloff=0.62)
    arr = tint(f, hexrgb(dark), hexrgb(light)).astype(np.float32)
    arr += grain(size, size, 9)[..., None]
    specks = rng.random((size, size)) < speck
    arr[specks] *= 0.72
    save(arr.clip(0, 255).astype(np.uint8), name)


# 2-4. Stone fills for slabs
stone(900, '#7a2f16', '#e08a60', 'stone-clay.jpg', speck=0.06)
stone(900, '#1d1714', '#4d433d', 'stone-char.jpg', speck=0.05)
stone(900, '#b9ab94', '#e6dccb', 'stone-sand.jpg', speck=0.02)

# 5. Crayon hatching on sand
S = 900
hatch = Image.fromarray(tint(noise(S, S), hexrgb('#cfc3ad'), hexrgb('#e9e0d0')))
hd = ImageDraw.Draw(hatch, 'RGBA')
for i in range(-S, S * 2, 7):
    jitter = rng.uniform(-2, 2)
    alpha = int(rng.integers(60, 150))
    hd.line([(i + jitter, 0), (i + S * 0.35 + jitter, S)], fill=(70, 52, 40, alpha), width=int(rng.integers(1, 3)))
hatch = hatch.filter(ImageFilter.GaussianBlur(0.5))
arr = np.asarray(hatch, np.float32) + grain(S, S, 7)[..., None]
save(arr.clip(0, 255).astype(np.uint8), 'hatch-sand.jpg')

# 6. Halftone dots on ochre
ht = Image.new('RGB', (S, S), hexrgb('#c9974f'))
hdd = ImageDraw.Draw(ht)
step = 12
for yy in range(0, S, step):
    for xx in range(0, S, step):
        r = 1.2 + 3.6 * (xx / S) * (0.8 + 0.4 * rng.random())
        hdd.ellipse([xx - r, yy - r, xx + r, yy + r], fill=hexrgb('#5a3418'))
arr = np.asarray(ht, np.float32) + grain(S, S, 8)[..., None]
save(arr.clip(0, 255).astype(np.uint8), 'halftone-ochre.jpg')

# 7. Placeholder office plate: warm dim interior, window-blind light, shelf shapes, heavy blur
plate = Image.new('RGB', (W, H), hexrgb('#5a4536'))
pd = ImageDraw.Draw(plate, 'RGBA')
for x in range(0, W, 120):  # bookshelf verticals at left
    if x < 480:
        pd.rectangle([x, 120, x + 70, 820], fill=(68, 45, 32, 200))
        for yy in range(150, 800, 90):
            pd.rectangle([x + 6, yy, x + 64, yy + 60], fill=(int(rng.integers(90, 150)), int(rng.integers(55, 90)), 40, 160))
pd.rectangle([0, 760, W, H], fill=(54, 36, 26, 255))  # desk plane
for k in range(6):  # blind light shafts
    x0 = 620 + k * 120
    pd.polygon([(x0, 0), (x0 + 60, 0), (x0 + 360, H), (x0 + 260, H)], fill=(255, 214, 170, 105))
for _ in range(14):  # practical-lamp bokeh
    cx, cy, r = rng.integers(500, W), rng.integers(80, 520), rng.integers(18, 60)
    pd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 205, 140, int(rng.integers(70, 150))))
plate = plate.filter(ImageFilter.GaussianBlur(30))
arr = np.asarray(plate, np.float32)
yy, xx = np.mgrid[0:H, 0:W]
vign = 1 - 0.35 * (((xx - W * 0.55) / W) ** 2 + ((yy - H * 0.45) / H) ** 2) * 2.2
arr = arr * vign.clip(0.35, 1)[..., None] + grain(W, H, 5)[..., None]
save(arr.clip(0, 255).astype(np.uint8), 'office-plate-placeholder.jpg', quality=85)

print('ok', sorted(p.name for p in OUT.iterdir()))

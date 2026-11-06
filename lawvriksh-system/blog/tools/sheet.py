"""Quick contact sheet for review: python blog/tools/sheet.py <family> <prefix> <width|fmt> <theme> <out> [cols] [thumb_w]"""
import sys, pathlib
from PIL import Image, ImageDraw, ImageFont
root = pathlib.Path(__file__).resolve().parents[1]
fam, prefix, suffix, theme, out = sys.argv[1:6]; cols = int(sys.argv[6]) if len(sys.argv) > 6 else 2; tw = int(sys.argv[7]) if len(sys.argv) > 7 else 560
files = sorted((root / 'previews' / fam).glob(f'{prefix}*-{suffix}-{theme}.png'))
ims = [Image.open(p).convert('RGB') for p in files]
if not ims: sys.exit('none')
scaled = [im.resize((tw, max(1, int(im.height * tw / im.width))), Image.LANCZOS) for im in ims]
rows = [scaled[i:i + cols] for i in range(0, len(scaled), cols)]
lab = 28; font = ImageFont.truetype(str(root.parent / 'fonts/LawVrikshSans-Medium.ttf'), 16)
H = sum(max(i.height for i in r) + lab + 12 for r in rows) + 12
s = Image.new('RGB', (cols * (tw + 12) + 12, H), (110, 110, 110)); d = ImageDraw.Draw(s); y = 12; k = 0
for r in rows:
    for c, im in enumerate(r):
        s.paste(im, (12 + c * (tw + 12), y)); d.text((12 + c * (tw + 12), y + im.height + 6), files[k].stem, fill=(245, 241, 234), font=font); k += 1
    y += max(i.height for i in r) + lab + 12
s.save(out); print(out, s.size)

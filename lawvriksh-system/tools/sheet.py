"""Contact sheets: python tools/sheet.py <family> [cols] [thumb_width] [out]"""
import sys, pathlib
from PIL import Image, ImageDraw, ImageFont
root = pathlib.Path(__file__).resolve().parents[1]
fam = sys.argv[1]; cols = int(sys.argv[2]) if len(sys.argv) > 2 else 4; tw = int(sys.argv[3]) if len(sys.argv) > 3 else 360
out = pathlib.Path(sys.argv[4]) if len(sys.argv) > 4 else root / 'previews' / f'{fam}-contact-sheet.png'
files = sorted(p for p in (root / 'previews' / fam).glob('*.png'))
if not files: sys.exit('no previews')
ims = [Image.open(p).convert('RGB') for p in files]
th = max(int(im.height * tw / im.width) for im in ims)
font = ImageFont.truetype(str(root / 'fonts' / 'LawVrikshSans-Medium.ttf'), 18) if (root / 'fonts' / 'LawVrikshSans-Medium.ttf').exists() else ImageFont.load_default()
gap, lab = 24, 34; rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (tw + gap) + gap, rows * (th + gap + lab) + gap), (245, 241, 234))
d = ImageDraw.Draw(sheet)
for i, (p, im) in enumerate(zip(files, ims)):
    x = gap + (i % cols) * (tw + gap); y = gap + (i // cols) * (th + gap + lab)
    t = im.resize((tw, int(im.height * tw / im.width)), Image.LANCZOS); sheet.paste(t, (x, y))
    d.text((x, y + t.height + 8), p.stem, fill=(90, 82, 75), font=font)
sheet.save(out, optimize=True); print(out, sheet.size)

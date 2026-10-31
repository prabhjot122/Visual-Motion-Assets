"""Reel v3: AI-upscale only the stretches of the two takes that the reel shows (Real-ESRGAN x4plus, local GPU).

  python upscale.py plan        → the intervals and frame counts
  python upscale.py run         → media/sr/<take>-<n>.mp4 (one clip per interval) + media/sr/index.json

Each interval: frames from the ORIGINAL file at 30 fps → realesrgan-x4plus → scaled to the reel's working size
(P 1080×1936, L 1636×920) and blended 65 / 35 with a plain lanczos upscale, so skin keeps its texture
instead of the model's waxy smoothness. build_assembly.py then points each face clip at its SR clip.
"""
import json, re, subprocess, sys, shutil
from pathlib import Path

HERE = Path(__file__).parent
ESRGAN = Path(r'C:\Users\prabh\AppData\Local\Temp\claude\D--lv-frontend\cec3f320-0e5c-414d-9242-b0cb9d4ee3d6\scratchpad\esrgan\bin\realesrgan-ncnn-vulkan.exe')
SRC = {'P': HERE / 'analysis/portrait-old.mp4', 'L': HERE / 'analysis/landscape-new.mp4'}
SIZE = {'P': (1080, 1936), 'L': (1636, 920)}
OUT = HERE / 'media/sr'
HANDLE, JOIN = 0.15, 0.6

def intervals():
    html = (HERE.parent / 'hyperframes/reel-v3-assembly/index.html').read_text(encoding='utf8')
    iv = {'P': [], 'L': []}
    for take, dur, m in re.findall(r'src="assets/take-(P|L)\.mp4" data-start="[0-9.]+" data-duration="([0-9.]+)" data-media-start="([0-9.]+)"', html):
        iv[take].append([max(0.0, float(m) - HANDLE), float(m) + float(dur) + HANDLE])
    for k in iv:
        merged = []
        for a, b in sorted(iv[k]):
            if merged and a - merged[-1][1] < JOIN: merged[-1][1] = max(merged[-1][1], b)
            else: merged.append([a, b])
        iv[k] = [[round(a, 3), round(b, 3)] for a, b in merged]
    return iv

def run(cmd): subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

if __name__ == '__main__':
    iv = intervals()
    for k, v in iv.items(): print(k, len(v), 'intervals,', round(sum(b - a for a, b in v) * 30), 'frames:', v)
    if sys.argv[1:] == ['run']:
        OUT.mkdir(parents=True, exist_ok=True)
        index = {'P': [], 'L': []}
        for take, spans in iv.items():
            W, H = SIZE[take]
            for n, (a, b) in enumerate(spans):
                clip = OUT / f'{take}-{n:02d}.mp4'
                index[take].append({'start': a, 'end': b, 'file': clip.name})
                if clip.exists(): continue
                tmp = OUT / f'tmp-{take}-{n:02d}'; lo, hi = tmp / 'lo', tmp / 'hi'
                shutil.rmtree(tmp, ignore_errors=True); lo.mkdir(parents=True); hi.mkdir()
                run(['ffmpeg', '-v', 'error', '-ss', f'{a:.3f}', '-t', f'{b - a:.3f}', '-i', str(SRC[take]), '-vf', 'fps=30', str(lo / '%05d.png')])
                run([str(ESRGAN), '-i', str(lo), '-o', str(hi), '-n', 'realesrgan-x4plus', '-s', '4', '-f', 'png'])
                run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', str(hi / '%05d.png'), '-framerate', '30', '-i', str(lo / '%05d.png'), '-filter_complex',
                     f'[0]scale={W}:{H}:flags=lanczos[sr];[1]scale={W}:{H}:flags=lanczos[lz];[sr][lz]blend=all_expr=A*0.65+B*0.35,format=yuv420p',
                     '-c:v', 'libx264', '-crf', '12', '-preset', 'slow', '-g', '15', '-r', '30', str(clip)])
                shutil.rmtree(tmp, ignore_errors=True)
                print('done', clip.name, flush=True)
        json.dump(index, open(OUT / 'index.json', 'w'), indent=1)

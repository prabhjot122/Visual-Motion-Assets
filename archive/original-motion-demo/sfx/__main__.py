"""python -m sfx --list | python -m sfx <cue-sheet.py>   (run from motion-demo/)

A cue sheet defines TIMELINE (a JSON file, the same one the picture reads), OUT, optional TARGET_LUFS
(None = leave as a stem for a later mix) and score(mix, tl).
"""
import importlib.util, json, sys
from pathlib import Path
from . import synth
from .mix import Mix
from . import loudness

sys.stdout.reconfigure(encoding="utf-8")  # docstrings carry arrows; the Windows console defaults to cp1252

if len(sys.argv) < 2 or sys.argv[1] == '--list':
    for g in synth.GENERATORS: print(f'{g.__name__:<10} {(g.__doc__ or "").strip().splitlines()[0]}')
    sys.exit()
cue = Path(sys.argv[1])
spec = importlib.util.spec_from_file_location('cue', cue); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
tl = json.load(open(cue.parent / m.TIMELINE if not Path(m.TIMELINE).is_absolute() else m.TIMELINE, encoding='utf8'))
mix = Mix(tl.get('duration', 60))
m.score(mix, tl)
target = getattr(m, 'TARGET_LUFS', -14.0)
if target is None: print(f'stem: {len(mix.events)} sounds, {loudness.integrated([mix.L, mix.R]):.1f} LUFS, peak {loudness.peak_db([mix.L, mix.R]):.1f} dBFS')
else: print(f'mastered: {len(mix.events)} sounds, {mix.master(target):.1f} LUFS')
out = cue.parent / m.OUT if not Path(m.OUT).is_absolute() else Path(m.OUT)
out.parent.mkdir(parents=True, exist_ok=True); mix.write(out); print('wrote', out)

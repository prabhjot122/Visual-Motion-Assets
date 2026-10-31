"""Reel v3: the final soundtrack (plan §7). Voice + music + SFX stem → mastered stereo WAV.

  python build_mix.py [music-file [music-offset-s]]

Voice: build/voice-raw.wav (the spoken edit from the cleaned, matched takes) → high-pass 80 Hz, a touch of
presence, compression, de-essing → about −16 LUFS on its own.
Music (optional until a track is picked): starts at `music-offset` s into the track; sits about 8 dB under
the voice through sidechain ducking, opens up in the gaps; drops back for the breakdown ("As technology
evolves" → "law is one of them") and fades out over the end card.
SFX: build/sfx-stem.wav (python -m sfx sfx/cues/reel_v3.py).
Master: −14 LUFS integrated, true peak ≤ −1 dBTP (two-pass loudnorm, linear).
"""
import json, subprocess, sys
from pathlib import Path

HERE = Path(__file__).parent
B = HERE / 'build'
edl = json.load(open(HERE / 'edl.json', encoding='utf8'))
D = edl['duration']
S = {s['i']: s for s in edl['shots']}
music = Path(sys.argv[1]) if len(sys.argv) > 1 else None
offset = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0

def run(*a): subprocess.run(['ffmpeg', '-v', 'error', '-y', *a], check=True)

# 1. voice
run('-i', str(B / 'voice-raw.wav'), '-af',
    'highpass=f=80,equalizer=f=3200:t=q:w=1.1:g=1.5,acompressor=threshold=-22dB:ratio=3:attack=5:release=90:makeup=2,deesser=i=0.35,'  # already cleaned (DeepFilterNet); a touch of presence
    'loudnorm=I=-16:TP=-3:LRA=9', '-ar', '48000', '-ac', '1', str(B / 'voice.wav'))

# 2. music bed: offset, length, the breakdown dip, the end fade; then ducked under the voice
inputs = ['-i', str(B / 'voice.wav'), '-i', str(B / 'sfx-stem.wav')]
if music:
    bd0, bd1, end = S[35]['t0'] - 0.6, S[38]['t0'] - 0.3, S[41]['t0']
    inputs += ['-ss', f'{offset:.3f}', '-t', f'{D + 0.5:.3f}', '-i', str(music)]
    fc = (f"[2:a]aresample=48000,aformat=channel_layouts=stereo,volume=-9dB,"
          f"volume='if(between(t,{bd0:.2f},{bd1:.2f}),0.45,1)':eval=frame,"
          f"afade=t=in:d=0.02,afade=t=out:st={end + 0.4:.2f}:d={D - end - 0.4:.2f}[m];"
          f"[0:a]apad=whole_dur={D:.3f},asplit=2[v][key];"
          "[m][key]sidechaincompress=threshold=0.035:ratio=5:attack=25:release=320:makeup=1[md];"
          "[v]aformat=channel_layouts=stereo[vs];"
          "[vs][md][1:a]amix=inputs=3:normalize=0:duration=longest[mix]")
else:
    fc = "[0:a]aformat=channel_layouts=stereo[vs];[vs][1:a]amix=inputs=2:normalize=0:duration=longest[mix]"
run(*inputs, '-filter_complex', fc + f";[mix]apad,atrim=0:{D:.3f}[out]", '-map', '[out]', '-ar', '48000', str(B / 'premaster.wav'))

# 3. master: measure, then a linear loudnorm pass to −14 LUFS / −1 dBTP
meas = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(B / 'premaster.wav'), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j = json.loads(meas[meas.rindex('{'):meas.rindex('}') + 1])
run('-i', str(B / 'premaster.wav'), '-af',
    f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true",
    '-ar', '48000', str(B / 'soundtrack.wav'))
chk = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(B / 'soundtrack.wav'), '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
summary = chk[chk.rindex('Summary:'):]
print('soundtrack:', ' · '.join(' '.join(l.split()) for l in summary.splitlines() if l.strip().startswith(('I:', 'LRA:', 'Peak:'))), '| music:', music.name if music else 'none yet')

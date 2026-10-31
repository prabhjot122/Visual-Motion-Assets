#!/usr/bin/env bash
# Reel v3: assemble the 9:16 reel from edl.json and the rendered strips, then lay the soundtrack in.
#   bash motion-demo/reel-v3/render-reel.sh            draft picture → renders/lawvriksh-reel-v3-preview.mp4
#   Q=high bash motion-demo/reel-v3/render-reel.sh     final → renders/lawvriksh-reel-v3.mp4
set -e
cd "$(dirname "$0")"
export HYPERFRAMES_NO_TELEMETRY=1 HYPERFRAMES_NO_UPDATE_CHECK=1 HYPERFRAMES_NO_CAPTURE_DOTENV=1 HYPERFRAMES_BROWSER_PATH='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
unset GEMINI_API_KEY
PY=../.venv-media/Scripts/python.exe
Q=${Q:-draft}
PYTHONIOENCODING=utf8 $PY build_assembly.py
node ../hyperframes/reel-v3-assembly/prepare-assets.mjs > /dev/null
(cd ../hyperframes && npx --no-install hyperframes render reel-v3-assembly --quality $Q --fps 30 --workers ${W:-2} --output ../reel-v3/build/reel-picture-$Q.mp4 > /dev/null)
mkdir -p renders
if [ "$Q" = draft ]; then out=renders/lawvriksh-reel-v3-preview.mp4; v="-vf scale=720:-2 -c:v libx264 -crf 24 -preset medium"; else out=renders/lawvriksh-reel-v3.mp4; v="-c:v libx264 -crf 16 -preset slow"; fi
ffmpeg -v error -y -i build/reel-picture-$Q.mp4 -i build/soundtrack.wav $v -pix_fmt yuv420p -r 30 -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart $out
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,nb_frames -of compact $out

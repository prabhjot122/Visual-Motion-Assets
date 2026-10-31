#!/usr/bin/env bash
# Reel v3: (re)make every scene project from scenes/*/strip.json and render its strip of graphic shots.
#   bash motion-demo/reel-v3/render-scenes.sh [scene …]       (quality: Q=high by default)
set -e
cd "$(dirname "$0")/../hyperframes"
export HYPERFRAMES_NO_TELEMETRY=1 HYPERFRAMES_NO_UPDATE_CHECK=1 HYPERFRAMES_NO_CAPTURE_DOTENV=1 HYPERFRAMES_BROWSER_PATH='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
unset GEMINI_API_KEY
PY=../.venv-media/Scripts/python.exe
SCENES=${*:-$(ls ../reel-v3/scenes)}
mkdir -p ../reel-v3/build/strips
for s in $SCENES; do
  if [ "$s" = cta ] || [ "$s" = hear ]; then node reel-$s/prepare-assets.mjs > /dev/null; else PYTHONIOENCODING=utf8 $PY ../reel-v3/make_scenes.py "$s" > /dev/null; node "reel-$s/prepare-assets.mjs" > /dev/null; fi
  npx --no-install hyperframes render "reel-$s" --quality ${Q:-high} --fps 30 --output "../reel-v3/build/strips/$s.mp4" > /dev/null
  echo "$s $(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 ../reel-v3/build/strips/$s.mp4) frames"
done

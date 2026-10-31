#!/usr/bin/env bash
# Render every web-cut part and join them into the silent web cut (plan §11–12).
#   bash motion-demo/web-cut/render-all.sh            high quality → renders/web/lawvriksh-web-cut-silent.mp4
#   bash motion-demo/web-cut/render-all.sh preview    draft quality, light join → renders/web-preview/lawvriksh-web-cut-preview.mp4
#   PARTS="web-tab web-s4" bash … [preview]           only these parts (the join still uses every part's last render)
set -e
cd "$(dirname "$0")/../hyperframes"
export HYPERFRAMES_NO_TELEMETRY=1 HYPERFRAMES_NO_UPDATE_CHECK=1 HYPERFRAMES_NO_CAPTURE_DOTENV=1 HYPERFRAMES_BROWSER_PATH='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
unset GEMINI_API_KEY
ALL="web-opening web-s2 web-s3 web-tab web-s4 web-s5 web-s6 web-s7 web-s8 web-s9 web-s10"
PARTS=${PARTS:-$ALL}
if [ "$1" = preview ]; then Q=draft; dir=renders/web-preview; else Q=high; dir=renders/web; fi
mkdir -p "$dir"
for p in $PARTS; do
  node "$p/prepare-assets.mjs" > /dev/null
  npx --no-install hyperframes render "$p" --quality $Q --fps 30 --output "$dir/$p-silent.mp4" > /dev/null
  echo "$p $(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 $dir/$p-silent.mp4) frames"
done
list=$dir/parts.txt; : > "$list"
for p in $ALL; do echo "file '$p-silent.mp4'" >> "$list"; done
if [ "$1" = preview ]; then
  ffmpeg -v error -y -f concat -safe 0 -i "$list" -vf scale=1080:-2 -c:v libx264 -crf 26 -preset medium -pix_fmt yuv420p -r 30 -an -movflags +faststart $dir/lawvriksh-web-cut-preview.mp4
  ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames,duration -of compact $dir/lawvriksh-web-cut-preview.mp4
else
  ffmpeg -v error -y -f concat -safe 0 -i "$list" -c:v libx264 -crf 14 -preset slow -pix_fmt yuv420p -r 30 -an -movflags +faststart $dir/lawvriksh-web-cut-silent.mp4
  ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames,duration -of compact $dir/lawvriksh-web-cut-silent.mp4
fi

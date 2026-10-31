#!/usr/bin/env bash
# Make a hand-off plate: a lossless, caption-free snapshot of one web part's frame, saved as the next
# part's opening plate.   bash motion-demo/web-cut/make-plate.sh <from-project> <at-seconds> <to-png>
set -e
cd "$(dirname "$0")/../hyperframes"
src=$1; at=$2; out=$3; tmp=zz-plate-$src
rm -rf "$tmp"; mkdir "$tmp"
cp -r "$src/src" "$src/assets" "$src/hyperframes.json" "$tmp/"
sed -e "s#</style>#  \#captions { visibility: hidden !important; }\n  </style>#" -e "s/data-composition-id=\"$src\"/data-composition-id=\"$tmp\"/" -e "s/window.__timelines\['$src'\]/window.__timelines['$tmp']/" "$src/index.html" > "$tmp/index.html"
snap=$(mktemp -d)
HYPERFRAMES_NO_TELEMETRY=1 HYPERFRAMES_NO_UPDATE_CHECK=1 HYPERFRAMES_NO_CAPTURE_DOTENV=1 HYPERFRAMES_BROWSER_PATH='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' \
  npx --no-install hyperframes snapshot "$tmp" --at "0,$at" --describe false --no-end -o "$snap" --timeout 40000 > /dev/null
# the first seek after load can capture before it has rendered: warm up on t=0, keep the second frame
cp "$snap"/frame-01-*.png "$out"
rm -rf "$tmp" "$snap"
echo "plate $out from $src @ $at"

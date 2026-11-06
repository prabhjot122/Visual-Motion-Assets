#!/bin/sh
# Full render + check pass, one family per process (a single long run can hit a Chromium protocol timeout).
cd "$(dirname "$0")/../../.." || exit 1
R="node lawvriksh-system/blog/tools/render.mjs"
rm -f lawvriksh-system/blog/previews/checks.json
for f in thumbnails article; do $R --only $f || echo "ERR $f"; done
for g in process-steps checklist-cards comparison timeline document-callouts definition-boxes callout-boxes pull-statements source-lines dividers-cta; do $R --only graphics --group $g || echo "ERR $g"; done
echo DONE

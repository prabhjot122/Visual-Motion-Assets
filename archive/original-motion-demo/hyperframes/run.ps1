param(
  [ValidateSet('check','preview','render-test','doctor','timeline','pilot-check','pilot-preview','pilot-draft','pilot-render','pilot-snapshot','s2-check','s2-draft','s2-render','s2-snapshot','s3-check','s3-draft','s3-render','s3-snapshot','s4-check','s4-draft','s4-render','s4-snapshot','s5-check','s5-draft','s5-render','s5-snapshot','s6-check','s6-draft','s6-render','s6-snapshot','s7-check','s7-draft','s7-render','s7-snapshot','s8-check','s8-draft','s8-render','s8-snapshot','s9-check','s9-draft','s9-render','s9-snapshot','s10-check','s10-draft','s10-render','s10-snapshot','w1-check','w1-draft','w1-render','w1-snapshot','web-all')][string]$Task = 'check',
  [string]$At = '1.0'
)
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$env:HYPERFRAMES_NO_TELEMETRY = '1'
$env:HYPERFRAMES_NO_UPDATE_CHECK = '1'
$env:HYPERFRAMES_NO_CAPTURE_DOTENV = '1'
$env:HYPERFRAMES_RUN_ID = 'lawvriksh-phase3-technical-test'
$env:HYPERFRAMES_BROWSER_PATH = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
node prepare-assets.mjs
switch ($Task) {
  'check' { npx --no-install hyperframes check --json }
  'preview' { npx --no-install hyperframes preview --port 3150 --no-open }
  'render-test' { npx --no-install hyperframes render --quality draft --fps 30 --workers 1 --output renders/technical-test.mp4 }
  'doctor' { npx --no-install hyperframes doctor --json }
  'timeline' { npx --no-install hyperframes timeline --json }
  # Opening pilot (0.00–24.78 s graphics track). Assets are copied, originals untouched.
  'pilot-check' { node opening-pilot/prepare-assets.mjs; npx --no-install hyperframes check opening-pilot --json }
  'pilot-preview' { node opening-pilot/prepare-assets.mjs; npx --no-install hyperframes preview opening-pilot --port 3151 --no-open }
  'pilot-draft' { node opening-pilot/prepare-assets.mjs; npx --no-install hyperframes render opening-pilot --quality draft --fps 30 --output renders/opening-pilot-draft.mp4 }
  'pilot-render' { node opening-pilot/prepare-assets.mjs; npx --no-install hyperframes render opening-pilot --quality high --fps 30 --output renders/opening-pilot-silent.mp4 }
  'pilot-snapshot' { npx --no-install hyperframes snapshot opening-pilot --at $At }
  # Section 2 (24.80–33.13). Composition time 0 = reel 24.80; -At takes composition seconds.
  's2-check' { node section-2/prepare-assets.mjs; npx --no-install hyperframes check section-2 --json }
  's2-draft' { node section-2/prepare-assets.mjs; npx --no-install hyperframes render section-2 --quality draft --fps 30 --output renders/section-2-draft.mp4 }
  's2-render' { node section-2/prepare-assets.mjs; npx --no-install hyperframes render section-2 --quality high --fps 30 --output renders/section-2-silent.mp4 }
  's2-snapshot' { npx --no-install hyperframes snapshot section-2 --at $At --describe false }
  # Section 3 (33.13–38.17). Composition time 0 = reel 33.1333; -At takes composition seconds.
  's3-check' { node section-3/prepare-assets.mjs; npx --no-install hyperframes check section-3 --json }
  's3-draft' { node section-3/prepare-assets.mjs; npx --no-install hyperframes render section-3 --quality draft --fps 30 --output renders/section-3-draft.mp4 }
  's3-render' { node section-3/prepare-assets.mjs; npx --no-install hyperframes render section-3 --quality high --fps 30 --output renders/section-3-silent.mp4 }
  's3-snapshot' { npx --no-install hyperframes snapshot section-3 --at $At --describe false }
  # Section 4 (38.17–41.53). Composition time 0 = reel 38.1667; -At takes composition seconds.
  's4-check' { node section-4/prepare-assets.mjs; npx --no-install hyperframes check section-4 --json }
  's4-draft' { node section-4/prepare-assets.mjs; npx --no-install hyperframes render section-4 --quality draft --fps 30 --output renders/section-4-draft.mp4 }
  's4-render' { node section-4/prepare-assets.mjs; npx --no-install hyperframes render section-4 --quality high --fps 30 --output renders/section-4-silent.mp4 }
  's4-snapshot' { npx --no-install hyperframes snapshot section-4 --at $At --describe false }
  # Section 5 (41.53–44.27). Composition time 0 = reel 41.5333; -At takes composition seconds.
  's5-check' { node section-5/prepare-assets.mjs; npx --no-install hyperframes check section-5 --json }
  's5-draft' { node section-5/prepare-assets.mjs; npx --no-install hyperframes render section-5 --quality draft --fps 30 --output renders/section-5-draft.mp4 }
  's5-render' { node section-5/prepare-assets.mjs; npx --no-install hyperframes render section-5 --quality high --fps 30 --output renders/section-5-silent.mp4 }
  's5-snapshot' { npx --no-install hyperframes snapshot section-5 --at $At --describe false }
  # Section 6 (44.27–46.40, locked Vikram window). Composition time 0 = reel 44.2667; -At takes composition seconds.
  's6-check' { node section-6/prepare-assets.mjs; npx --no-install hyperframes check section-6 --json }
  's6-draft' { node section-6/prepare-assets.mjs; npx --no-install hyperframes render section-6 --quality draft --fps 30 --output renders/section-6-draft.mp4 }
  's6-render' { node section-6/prepare-assets.mjs; npx --no-install hyperframes render section-6 --quality high --fps 30 --output renders/section-6-silent.mp4 }
  's6-snapshot' { npx --no-install hyperframes snapshot section-6 --at $At --describe false }
  # Section 7 (46.40–49.62, PDF Insights). Composition time 0 = reel 46.40; -At takes composition seconds.
  's7-check' { node section-7/prepare-assets.mjs; npx --no-install hyperframes check section-7 --json }
  's7-draft' { node section-7/prepare-assets.mjs; npx --no-install hyperframes render section-7 --quality draft --fps 30 --output renders/section-7-draft.mp4 }
  's7-render' { node section-7/prepare-assets.mjs; npx --no-install hyperframes render section-7 --quality high --fps 30 --output renders/section-7-silent.mp4 }
  's7-snapshot' { npx --no-install hyperframes snapshot section-7 --at $At --describe false }
  # Section 8 (49.62–51.42, Hearing Prep). Composition time 0 = reel 49.6333; -At takes composition seconds.
  's8-check' { node section-8/prepare-assets.mjs; npx --no-install hyperframes check section-8 --json }
  's8-draft' { node section-8/prepare-assets.mjs; npx --no-install hyperframes render section-8 --quality draft --fps 30 --output renders/section-8-draft.mp4 }
  's8-render' { node section-8/prepare-assets.mjs; npx --no-install hyperframes render section-8 --quality high --fps 30 --output renders/section-8-silent.mp4 }
  's8-snapshot' { npx --no-install hyperframes snapshot section-8 --at $At --describe false }
  # Section 9 (51.42–59.25, closing C1 + C2). Composition time 0 = reel 51.4333; -At takes composition seconds.
  's9-check' { node section-9/prepare-assets.mjs; npx --no-install hyperframes check section-9 --json }
  's9-draft' { node section-9/prepare-assets.mjs; npx --no-install hyperframes render section-9 --quality draft --fps 30 --output renders/section-9-draft.mp4 }
  's9-render' { node section-9/prepare-assets.mjs; npx --no-install hyperframes render section-9 --quality high --fps 30 --output renders/section-9-silent.mp4 }
  's9-snapshot' { npx --no-install hyperframes snapshot section-9 --at $At --describe false }
  # Section 10 (59.25–62.90, closing C3 + C4, the end). Composition time 0 = reel 59.2667; -At takes composition seconds.
  's10-check' { node section-10/prepare-assets.mjs; npx --no-install hyperframes check section-10 --json }
  's10-draft' { node section-10/prepare-assets.mjs; npx --no-install hyperframes render section-10 --quality draft --fps 30 --output renders/section-10-draft.mp4 }
  's10-render' { node section-10/prepare-assets.mjs; npx --no-install hyperframes render section-10 --quality high --fps 30 --output renders/section-10-silent.mp4 }
  's10-snapshot' { npx --no-install hyperframes snapshot section-10 --at $At --describe false }
  # Web cut 1 · opening (web 0–29.03 ↔ reel 0–24.77; web-cut/web-cut-plan.md). -At takes web seconds.
  'w1-check' { node web-opening/prepare-assets.mjs; npx --no-install hyperframes check web-opening --json }
  'w1-draft' { node web-opening/prepare-assets.mjs; npx --no-install hyperframes render web-opening --quality draft --fps 30 --output renders/web/web-opening-draft.mp4 }
  'w1-render' { node web-opening/prepare-assets.mjs; npx --no-install hyperframes render web-opening --quality high --fps 30 --output renders/web/web-opening-silent.mp4 }
  'w1-snapshot' { npx --no-install hyperframes snapshot web-opening --at $At --describe false }
  # The whole web cut: every part at high quality, joined (web-cut/render-all.sh; plan §11).
  'web-all' { bash ../web-cut/render-all.sh }
}
exit $LASTEXITCODE

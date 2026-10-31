# Isolated HyperFrames technical scaffold

This folder contains a **2-second calibration only**, not a storyboard, opening treatment or full reel. It validates a deterministic GSAP seek, local script loading, browser capture and MP4 encoding at the user-confirmed 1440×1000 graphics size. 30 fps is the test setting, not a final composition choice.

Pinned dependencies: HyperFrames 0.8.184 and GSAP 3.15.0. Application package files are untouched. `assets/gsap.min.js` is copied by `prepare-assets.mjs` from the isolated installed package so render-time CDN access is unnecessary. No Three.js is installed or used.

```powershell
Set-Location -LiteralPath 'D:\lv-frontend\motion-demo\hyperframes'
npm ci --no-audit --no-fund
./run.ps1 check
./run.ps1 preview
./run.ps1 render-test
```

The existing installation already succeeded. Node 22+, FFmpeg/ffprobe on PATH, and installed Edge are prerequisites. `run.ps1` fixes the working directory, sets the Edge executable, disables telemetry/update checks, copies GSAP and invokes only the local pinned CLI. A fresh setup can use `npm ci`; no global install is required. Preview is `http://localhost:3150/#project/hyperframes`, verified HTTP 200, and runs in the background without opening the user's browser. Stop only this preview with `npx --no-install hyperframes preview . --stop`.

Verified output: `renders/technical-test.mp4`, H.264/yuv420p, 1440×1000, 30/1 fps, 60 frames, 2.000 seconds, no audio stream. Render summary: `drawelement capture`, hardware GPU, about 13 seconds on this host. The square's X position changes across decoded start/middle/end frames; its identity and layout remain stable. `../phase3-evidence/verification.json` includes the measured positions and links to evidence. `check` completed with no lint warnings/errors and no runtime/layout/contrast errors.

This test does not validate audio integration, alpha export, source-video synchronization, any footage masks or a final reel composition. Preserve the original media audio. `../handoff.md` and `../project-brief.md` govern Phase 4; do not treat this calibration's colors/layout/text as creative direction. Current sources have a separate portrait reel and confirmed graphics canvas, whose final relationship still needs a decision.

Official core/CLI/GSAP documentation used at setup is retained under `../official-docs/`. `index.html` uses a sized standalone root and one paused timeline, registered only after font readiness. The framework owns time; no autoplay, random state or external asset requests are authored.

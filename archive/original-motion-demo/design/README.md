# Phase 4 design — Case Map conflict beat

Source of the Design canvas at https://claude.ai/artifact/CFkaZZrsyPHw522eKtRFMV (private), copied 22 October 2026. The canvas is the live, viewable version; this folder is the repository copy for handoff.

## Files

| File                                | What it is                                                                                      | Status                 |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------- |
| `canvas/Combined.dc.html`           | Frame C: paper/stone stage + window light + rebuilt Case Map window and Conflict panel          | **Approved direction** |
| `canvas/MotionStudy.dc.html`        | 4.3 s conflict-beat motion study with play/scrub controls                                       | Draft, awaiting review |
| `canvas/DecisionLog.dc.html`        | Decision log: feedback, approved/rejected choices, open decisions                               | Current                |
| `canvas/Main.dc.html`               | Round 2 frame A (paper & stone, screenshot cards)                                               | Superseded by C        |
| `canvas/FrameB.dc.html`             | Round 2 frame B (light & glass, screenshot window)                                              | Superseded by C        |
| `canvas/canvas.json`                | Canvas index (artboard positions, titles)                                                       | —                      |
| `frame-c.html`, `motion-study.html` | Standalone browser versions (see below)                                                         | —                      |
| `assets/`                           | LawVriksh mark and procedural textures                                                          | —                      |
| `scripts/make_textures.py`          | Regenerates the textures: `python -I scripts/make_textures.py assets/textures` (Pillow + numpy) | —                      |

## Standalone pages (open in a browser)

| File                | What it is                                                                  |
| ------------------- | --------------------------------------------------------------------------- |
| `frame-c.html`      | Frame C, static, 1440×1000                                                  |
| `motion-study.html` | Conflict-beat motion study with Play/Pause, Restart, scrub and beat buttons |

Both load only local assets (plus Google Fonts for Figtree, Newsreader, Instrument Serif and Geist Mono) and scale down to fit the window, centred. Serve the folder over HTTP rather than opening the file directly, so the relative texture paths resolve in every browser:

```powershell
python -m http.server 3160 --bind 127.0.0.1 --directory motion-demo/design
```

Then open `http://localhost:3160/frame-c.html` or `/motion-study.html`. For capture: `?noscale` renders at exactly 1440×1000, `?t=2.6` freezes the study at 2.6 s, and `window.lvStudy.seek(t)`, `.play()` and `.pause()` drive it from a script. The study's timing block is copied verbatim from `canvas/MotionStudy.dc.html`.

## These are Design Component files, not standalone pages

The `.dc.html` files use the canvas runtime (`./support.js`, `<x-dc>`, `{{holes}}`, `<sc-for>`) and load images from the canvas's asset store as `/_blob/<id>`. Opened directly in a browser they will not render as on the canvas. Use them as the design source: layout, exact values, copy and, for the motion study, the timing block in `renderVals()`.

Blob ids map to the local files here:

| `/_blob/…` id                      | Local file                                                                              |
| ---------------------------------- | --------------------------------------------------------------------------------------- |
| `6d303f926450c22070f3efb8dfd36dff` | `assets/textures/paper.jpg`                                                             |
| `53e784f53afc99e471c208bd97532ae9` | `assets/textures/stone-clay.jpg`                                                        |
| `b8eb28fd34cca721e5d7aa1d0407618a` | `assets/textures/stone-char.jpg`                                                        |
| `e181a2536582a8482cc20aa1d029817c` | `assets/textures/stone-sand.jpg`                                                        |
| `32612ae2f97e136ebe27b0ced24e6901` | `assets/textures/hatch-sand.jpg`                                                        |
| `6301bb6c6fc4468175b2870315d90e7e` | `assets/textures/halftone-ochre.jpg`                                                    |
| `34051131e8c2a6d12f97648ad0cc85e9` | `assets/textures/office-plate-placeholder.jpg` (placeholder for blurred office footage) |
| `c2a858148a47ce62290fac0819beb7d9` | `assets/lawvriksh-mark.png` (from `public/landing/`)                                    |
| `691d6acc3062a75d53ad1b6aa349372e` | `../screenshots/01-case-map-conflicts-version-comparison.png`                           |
| `a04480e9ef9f85910db26bdd3c590cc8` | `../screenshots/02-case-map-conflict-version-a.png`                                     |
| `d8265bc82decdeffcf45e95ec9535b5d` | `../screenshots/03-case-map-conflict-version-b.png`                                     |

## Key decisions carried by these files

- The Case Map window and Conflict panel in frame C and the motion study are **rebuilt in HTML from the frontend**: `src/features/matters/components/case-map.css`, `floating-review-panel.css`, `source-evidence.tsx`, `docs-matrix/docs-matrix.css` and the layout constants in `services/case-map-layout.ts` (NODE_W 264, COLUMN_GAP 76, ROW_GAP 10, 52 px node height). The UI is laid out at 1× and scaled (1.5× map, 1.35× panel), so text stays sharp. Enlarged screenshots were rejected as too soft.
- Content is the saved Arora state: amount conflict selected, notice p2 Rs. 2,30,00,000 vs order p1 Rs. 1,15,00,000, **unresolved**. No approval is shown.
- The stone columns are in true 2 : 1 height, matching the two amounts.
- Motion study timing is sized to cue window 33.18–37.52 s from `cue-sheet.json` (ASR, unlocked) and is not yet synced to the reel audio.

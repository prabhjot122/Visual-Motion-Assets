# Design spec — graphics track (revision 2)

Companion to `storyboard.md`. Status words: APPROVED / PROPOSED / OPEN / SUPERSEDED.

## Canvas and output

- **1440×1000, full canvas, graphics only (APPROVED).** The influencer reel is never embedded. No reserved column, PiP, or cutaways inside this canvas (influencer column/layout options **SUPERSEDED**).
- Final arrangement: influencer on top, this track below, in a stacked composite whose size, gap and proportions are **not supplied**. Nothing is assumed, and neither region is stretched.
- **Master:** silent (no audio track) unless separate effects are approved. **Review copies:** graphics plus the original reel audio, stream-copied, unedited.
- Timing uses source seconds of the reel. Export frame rate is OPEN (30 fps proposed). Duration is 62.906667 s.
- **No reserved safe areas inside the canvas.** The stacked composite is outside it. Keep essential text ≥ 40 px from canvas edges because the stacked edit may crop or add borders.

## Visual language (APPROVED via Frame C)

- **Stage:** `design/assets/textures/paper.jpg`, five window-light bands at −24° (blur 26 px, soft-light), vignette.
- **Stone:** clay / char / sand / hatch / halftone at 600 px tiles; carries meaning only.
- **Type:**
  - Newsreader for editorial words (200–330 px, −0.035em, clay italic full stop) and display figures (104–116 px).
  - Instrument Serif for the wordmark.
  - Figtree for product UI (`--font-geist` = Figtree).
  - Geist Mono only on review slates, never in artwork.
- **Colour:** ink `#171717` / `#1c1714`; clay `#c94820`, `#a93a18`; thread `#c4562e`; on-path edge `#cf795d`; paper `#f5f1ea`, `#fbfaf7`.
- **Product UI is rebuilt as layered HTML/CSS/SVG**: every text run, node, edge, card, panel and highlight is its own element. Raster is used only for source documents (the Arora agreement p2, notice p1/p2, order p1 rendered from `public/dummy-docs/*.pdf`; the Arif Jafar scan p2) and the brand mark PNG (transparent, 1024 px; a vector trace is recommended before Phase 5).

## Technique for the problem sequence (pilot, 22 Oct)

- **Three.js (pinned 0.186.1) for the paper stacks only:** O2–O5, 1.95–9.05 s, behind everything.
  - Lambert lighting at ambient 1.62 / sun 2.0. Lambert divides by π, so a lit page top lands at its own texture value: the stills' bright paper, not muddy.
  - The entry page is unlit (MeshBasic), so it is pixel-identical to the 2D sheets it hands over to: the footage matte at 1.95 and the DOM sheet at 3.48.
  - **Nothing else may use Three.js** (user direction; pass 1 rejected).
- **2D DOM/SVG for everything else, using the stills' exact layouts:**
  - O3–O4 sheet 570×780 at (720, 440), −5°, with the sand slip and pencil in sheet-local SVG.
  - B1 mark 380 px at (530, 100), ground y 431.
  - P3 / P5 document poses, stones (three flat clay/char faces), tablets and tags from `p3-p4` / `p5-p6`.
  - Folder: a flat clay slab with bevel faces and a paper label. Its cover is a single CSS-3D hinge.
  - A shared 2D "camera" (scale about 720,480 plus a 0.45 s damped shake at the P4 impact) moves `#stage2d`, `#ink` and `#back-type` together.
- **SVG** for the thread, corner marks, pencil strokes (turbulence displacement), handwriting draw-on (`stroke-dashoffset`), the fracture and the knot.
- **Brand:** the mark's clay nodes and ground line are drawn as SVG over the dark tree. The tree reveals upward from the roots with a clip, then contracts into its trunk node (the case seed).

## Pilot implementation (opening 0.00–24.78 s)

- **Project:** `hyperframes/opening-pilot/` (`index.html`, `src/pilot.js`, `prepare-assets.mjs` copies assets; originals untouched). Commands are in `hyperframes/run.ps1`: `pilot-check`, `pilot-preview`, `pilot-draft`, `pilot-render`, `pilot-snapshot -At <t>`.
- **Determinism:** one paused GSAP timeline whose tween calls a pure `renderAt(t)`. There is no clock or unseeded randomness (mulberry32 seeds).
- **Frame rate and boundary:**
  - Global offset 0: composition time = reel source time.
  - 30 fps (OPEN, proposed); `data-duration` 24.8 s = 744 frames, last frame at 24.7667 s.
  - The 24.78 s boundary falls between frames 743 and 744. The exit pose is complete by 24.7667.
  - The review audio is the reel's original audio trimmed to exactly 24.78 s, with no fade or processing. A stream copy can only cut on AAC packets and ran to 24.82 s (into the next phrase's onset), so the audio alone is re-encoded as AAC at the source's 63 kb/s. The video is stream-copied.
- **O1 plane lock:**
  - The stack's top sheet is measured in source px (left 48,584 · back 359,551 · right 584,618 · front 261,672), ordered far edge on top.
  - Footage and sheet matte share one homography `sq2quad(q)·inv(sq2quad(QB))`: an exponential dolly to 22× (affine) plus the largest straightening that keeps w > 0 at every clip corner (bisection per frame). The footage cannot tear.
  - The matte covers the frame from 1.80 s. Only then does it straighten alone to face camera by 1.95 s, the 3D crane's first pose.
- **Exit pose (24.7667 s), for the next section:**
  - Straight clay line at y 150, x 160–1280, 2.4 px, `#c4562e`. It is the top edge of a blank window at x 160, y 150, 1120×650, radius 0 0 18 18.
  - Brand bug at right 40, top 36, 30 px.
  - Exposed as `window.__lvPilot.exitPose`.
- **SVG** for the thread, corner marks, pencil strokes (turbulence displacement), handwriting draw-on (`stroke-dashoffset`) and the fracture.
- **Brand:** the mark's clay nodes and ground line are drawn as SVG over the dark tree. The tree reveals upward from the roots with a mask.

## Motion system (PROPOSED; measured from references)

| Token     | Use                        | Value                                                             |
| --------- | -------------------------- | ----------------------------------------------------------------- |
| `arrive`  | camera/focal arrivals      | `expo.out` 0.45–0.6 s (peak ≈0.13 s, settle ≈0.35 s — Harvey H-C) |
| `handoff` | exits into the next state  | `power2.in` 0.35–0.45 s (Lovio L-E)                               |
| `ui`      | product state changes      | the app's 140–180 ms ease                                         |
| `drift`   | holds                      | ≤1.5 %/s                                                          |
| `hold`    | anything to read           | ≥0.8 s near-still                                                 |
| `beat`    | primary event spacing      | 0.9–1.2 s                                                         |
| `stagger` | edges, rail ticks, results | 40–140 ms                                                         |

**Rhythm contrasts (deliberate, opening):**

- O4 slow hops (≈0.45 s each) vs O5 one 0.9 s constant sweep.
- B1 stillness vs P2 burst (largest scale change).
- P4 collision vs P6 readable knot hold.

**Never:** cross-fade whole layouts; introduce an element without a spatial origin; move two focal elements at once.

## Geometry

- **Clay thread:** 2.4 px, round caps. Born from the mark (B1), returns to it (C4). Inside the Case Map it is the app's on-path edge. In product scenes it routes along margins, baselines or blank gaps, never across body text it isn't underlining.
- **Corner marks:** 2 px ink L-marks, 16–24 px arms, 8–16 px outside the element. They tween as one rectangle.
- **Stones:** 2 : 1 A/B columns (first in P4; again in D7–D9, D11 margin). Context slabs: clay Arora, char Arif Jafar, sand Vikram (0.3–0.45 s crossings).
- **Insights colours** come from the run's own field colours: `#8b5cf6 #3b82f6 #14b8a6 #f59e0b #ec4899 #6366f1`. Each result card and its PDF highlight share one colour.

## Rebuilt UI sources

| Element       | Code                                                                            | Content                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Case Map      | `services/case-map-layout.ts`, `components/case-map.css`, `case-map-canvas.tsx` | Arora seed counts; `corpus.ts`                                                                                            |
| Review panels | `floating-review-panel.css`, `source-evidence.tsx`                              | `fact_arora_outstanding_order` etc.                                                                                       |
| OCR           | `ocr-review/styles/ocr-page-editor.css`; captures 07/08                         | `sc2051-arif-jafar-scan.pdf` p2, box [0.788235, 0.448095, 0.870196, 0.470476]                                             |
| Ask           | capture 15                                                                      | `ASK_HISTORY[asksess_seed_01]`                                                                                            |
| Vikram draft  | captures 09/10                                                                  | saved draft; `murshid-attachments.json` (10 files)                                                                        |
| PDF Insights  | captures 16–18; `documents/viewer`                                              | `mocks/handlers/insight-templates.ts` (6 exact quotes, colours); highlight boxes from PyMuPDF text search on notice p1/p2 |
| Hearing Prep  | capture 13                                                                      | `mocks/data/arora-hearing.ts`                                                                                             |
| Chronology    | captures 11/12                                                                  | `corpus.ts` chronology (12)                                                                                               |

Builders: `storyboard/stills/lib/{stage.css, fonts.css, casemap.js, panels.js, marks.js, paper3d.js}`.

## Legibility rules

- Product body text ≥ ~14 px effective; key values ≥ 20 px; one focal element per beat.
- Source rasters: the cited line must be readable at its display scale (≥ ~11 px x-height), otherwise zoom.

## Section 2 implementation (24.80–33.13)

- **Project:** `hyperframes/section-2/` (`index.html`, `src/section2.js`, `prepare-assets.mjs`); commands `s2-check`, `s2-draft`, `s2-render`, `s2-snapshot` in `run.ps1`.
- **Time:** composition time 0 = reel 24.80 s (frame 744, the frame after the pilot's last). `renderAt` takes global reel seconds. 250 frames at 30 fps: 24.8000–33.1000. The reel's 33.130 jump cut falls between frames 993 and 994.
- **D1–D2 (24.80–28.70), geometric processing line:**
  - The app's PDF icon carries each real file name (one drop every 0.36 s, the clay line ripples).
  - Four bevelled gates (Read · char, Recognise · halftone, Structure · sand, Extract · clay) stamp every 0.30 s.
  - Extracted lines open from clay highlights into the five fact tags; the hold is 27.95–28.70 with brackets on the two amounts.
- **D3–D4 (28.56–33.13), retimed 22 Oct so the OCR example can be read:**
  - One char slab sweeps in, covers the frame at 28.74, and parks as the backdrop between the scan and the review UI; it is above everything only while sweeping.
  - "Unclear" snap at 29.74; box pulse on "highlight" at 30.4.
  - Push-in on the issue card; `brlies` deleted 31.00–31.20, `Parties` typed 31.20–31.50, Save at 31.62.
  - 31.75–32.15: the scan eases to the d04 pose while the Extracted-text editor comes forward; the thread and marks stay tied to the same OCR box. Hold to 32.90.
  - 32.90–33.10: the slab covers the whole frame for the cut.
- **D5:** first seen after the 33.13 cut (user direction). Its d05 build is kept in `section2.js` (`renderMapScene`, on its original clock shifted by `MAP_DT`) for the next section to continue.
- **Exit pose at 33.10 (last frame):** the char slab covers the whole frame (bottom-left edge at x −470). The next section opens as the slab leaves to the left and reveals "Mapped." and the Case Map; brand bug top-right returns after the slab clears.

## Section 3 implementation (33.13–38.17)

- **Project:** `hyperframes/section-3/` (`index.html`, `src/section3.js`, `prepare-assets.mjs`); commands `s3-check`, `s3-draft`, `s3-render`, `s3-snapshot` in `run.ps1`.
- **Time:** composition time 0 = reel 33.1333 s (frame 994). 151 frames at 30 fps: 33.1333–38.1333; the last frame ends at 38.1667, where "aur poore case ki timeline" begins (38.17).
- **One Case Map camera.** Its keyframes are the approved stills' own framings (window rect, inner scale, map origin):
  - d05 (150, 300, 1360×760, ×1.08, origin 602/300)
  - d06 (120, 150, 1400×900, ×1.45, 960/222)
  - d07 (40, −80, 1180×1180, ×1.6, 1270/254)
  - **Frame C** (60, 290, 1020×740, ×1.5, 1256/100)
  - d09 (−40, 700, 470×360, ×1.25, 1300/52, inner −55)

  Moves use power3.inOut: 34.36–34.86, 35.00–35.45, 35.50–35.95, 36.72–37.22. The map is rebuilt by `lib/casemap.js`, the panels by `lib/panels.js`.

- **Clicks on the words:** Conflicts 34.32 ("conflicting" 34.38) · Amount outstanding 34.97 · Version B 36.68 ("verify").
- **Words:** "Mapped." 33.20 (exits on the Conflicts click) · "Compare." 35.75–36.10 ("compare" 35.98), still hold to 36.62 · "Verify." 36.92–37.30.
- **D9:** the Material fact panel replaces the Conflict panel in place; the order p1 preview opens out of its source card (36.98–37.32); the cited passage highlights; the thread runs Version B → passage → card. Verify fact is visible, never pressed, with "Verify fact opens review · nothing is approved".
- **Exit pose at 38.1333 (for D10, Chronology):**
  - d09 exactly: "Verify." top-left; map window bottom-left with Version B selected; order p1 preview at (440, 250) 580×800, page offset (−55, −106) with "Date of order: 18 July 2026" visible; Material fact panel at (1036, 250) ×1.28; stones A (1110, 820) and B (1290, 910) with B ringed; brand bug at right 40, top 150.
  - Thread: Version B → passage → source card; marks on the passage.

## Section 4 implementation (38.17–41.53), Chronology as pure motion graphics

- **Project:** `hyperframes/section-4/`; commands `s4-*` in `run.ps1`. Composition time 0 = reel 38.1667 (frame 1145); 101 frames to 41.5000; the 41.528 jump cut follows.
- **Opening plate:** `section-4/plates/d09-exit.png` is a lossless HyperFrames snapshot of section 3 at reel 38.1333 (its last frame). Re-take it if section 3 changes:
  `npx hyperframes snapshot section-3 --at 5.0 --no-end`.
  - "18 July 2026" on the order page (raster box 231.9, 427.7 – 332.2, 453.6, shown at 529, 409 – 591, 425) takes a clay highlight and lifts out as a P6 tag; the plate falls away (38.34–38.66).
  - The sand block, char dot and brand bug (top 150) continue live in the same places.
- **Timeline (user direction: not the app's Chronology style):**
  - A clay rail at x 470 grows from the pulled tag (38.50–38.86).
  - The other eleven P6 tags come home from where P6 left them, newest first, 70 ms apart (from 38.72); rows y = 330 + 54.5·i.
  - "Timeline." (solid, 236 px) sets 39.20–39.62 on "timeline" (39.44).
  - The 12 seeded event titles set beside the rail (39.55 + 30 ms each).
  - "Agreement registered" (9 Feb 2023) is selected at 39.95; a paper slip with notice p1's own words ("…on 9 February 2023 as Document No. 4127 of 2023.") enters at (900, 690); the thread ties row → slip; marks frame the date. Slow push to the cut.
- **Exit pose at 41.50 (for D11, Ask):**
  - The vertical clay rail at x 470, y 294–972, with 12 tags and titles.
  - "Timeline." top-left; the slip at (900, 690); brand bug at right 40, top 150.
  - Stage scale ≈1.009 about (720, 620).

## Section 5 implementation (41.53–44.27), Ask typed and generated

- **Project:** `hyperframes/section-5/`; commands `s5-*`. Composition time 0 = reel 41.5333 (frame 1246); 82 frames to 44.2333; frame 1328 (44.2667) begins the locked D12.
- **Opening plate:** `section-5/plates/timeline-exit.png` is a lossless snapshot of section 4 at reel 41.5000. Re-take it if section 4 changes:
  `npx hyperframes snapshot section-4 --at 3.3333 --no-end`.
  - The rail is redrawn live over the plate: x 467.05, y 290.2–973.6, stroke 2.43, matching section 4's 1.0118 push.
- **Flow (user direction, typed and generated):**
  - 41.56–41.95: the plate falls away; the rail tips horizontal under a large prompt box (the composer at ×1.5, at 82, 430).
  - 41.72–42.60: the saved question types in.
  - 42.66: send; the text lifts out as the sent message (to 627, 343); the box shrinks to the composer (426, 800); the Ask window builds around it (300, 250, 1160×800, as in `d11`); the underline follows to y 912.
  - 42.98: thinking glyph; 43.04 "Direct answer"; 43.10–43.60 the saved answer streams word by word; the two figures get clay underlines.
  - 43.55–43.80: citations 1–3; marks on the answer.
  - 44.05–44.23: a sand slab covers for Vikram.
- **Exit pose at 44.2333:** the sand slab covers the whole frame (bottom-left edge at x −470). D12 opens as it crosses with "Saved draft · Vikram bail application".

## Section 6 implementation (44.27–46.40, locked Vikram window), the draft writes itself

- **Project:** `hyperframes/section-6/`; commands `s6-*`. Composition time 0 = reel 44.2667 (frame 1328); 64 frames to 46.3667; frame 1392 (46.40) begins Insights.
- **Layout:** `d12` exactly: page (360, 92) ×1.02 −1°, Checks (1110, 250) ×1.1, Linked Documents (40, 430) ×1.15, legend (1100, 740), "Draft." at (400, 745). The page font is the local Newsreader, not Times New Roman (no named system font, avoiding the font fetch seen in the pilot).
- **Flow (user direction):**
  - Section 5's sand slab sweeps on and settles behind everything as d12's sand strip.
  - The label "Vikram bail application · separate example" sets.
  - 44.60–45.22: the page writes itself word by word; yellow fields pop whole, blue facts land whole. "Draft." sets on "drafts".
  - 45.12+: Checks count to 61 / 100; Linked Documents · 10; legend.
  - 45.35–45.85: the thread hops blue fact → yellow field → "Must fix · Complete case details"; marks on the yellow name field.
  - 46.18–46.37: a clay slab covers for Arora.
- **Exit pose at 46.3667:** the clay slab covers the whole frame (bottom-left edge at x −470). Insights opens as it crosses.

## Section 7 implementation (46.40–49.62), PDF Insights replayed as the verified run

- **Project:** `hyperframes/section-7/`; commands `s7-*`. Composition time 0 = reel 46.40 (frame 1392); 97 frames to 49.60; frame 1489 (49.6333) begins the locked Hearing Prep window.
- **Layout:** `d13` exactly: viewer (40, 240) 860×820 with page 2 ending at top −205; Insights panel (930, 250) ×1.3; field index (600, 770) ×1.05; clay arc top-right. Pages are the notice rasters at 825 px wide.
- **Passages:** measured on the notice PDF (825-px page coordinates):
  - p1: Issuing Authority (127.9, 209.2–607.6, 228.6); Recipient (two lines); Statutory Provision (88.7, 130.2–457.3, 149.6)
  - p2: as in `d13`
- **Flow:**
  - The clay slab leaves; "Insights." on "identify".
  - 46.88: Notice Analysis picked.
  - 46.98 + 140 ms × i: results 1–6 and their passages.
  - 47.30–47.90: the viewer scrolls to page 2 and the panel to results 4–6.
  - 47.90: Demand Made selected; the clay thread and the pink and indigo leaders draw; marks on the amber passage. Hold with a 1 % push to the cut.
- **Exit pose at 49.60:** `d13`'s hold (stage scale ≈1.009 about 720, 520).

## Section 8 implementation (49.62–51.42), Hearing Prep, saved brief that sets

- **Project:** `hyperframes/section-8/`; commands `s8-*`. Composition time 0 = reel 49.6333 (frame 1489); 54 frames to 51.40; the reel's jump cut is 51.415 and the closing (C1) begins at 51.42.
- **Opening plate:** `plates/insights-exit.png`, a lossless snapshot of section 7 at local 3.2 (reel 49.60). It falls away 49.64–49.88 (translateY 140, blur, fade; vignette opacity = fall). The stage starts at section 7's push (1.00989 about 720, 520) and relaxes to 1 by 50.0.
- **Containers carry over:** live shells sit under the plate at section 7's viewer (40, 240, 860×820) and Insights panel (930, 250, 442×640) and reshape (expo.inOut) into `d14`'s brief card (80, 300, 950 wide, ×1.25 content) 49.68–50.10 and the Preparation Review panel (1062, 396, 360 wide, ×1.2 content) 49.72–50.14. The clay arc squares into the wordmark block (1180, −30, 300×150) 49.70–50.08; LawVriksh wordmark 50.0; sand quarter-disc rises bottom-left; pencil guides y 300 and x 80 draw.
- **Sets (not generated):** "Hearing Prep" pill 49.86; brief fields 49.95–50.32 with the title rising on "every" (50.02); counts 0 · 1 · 0 50.12–50.34; open item 50.26; qualifier under the card 50.30.
- **Needs attention:** chip pulse and ring 50.36; clay thread chip → open item 50.40–50.64; marks lock 50.55–50.75. Hold with 0.6 % drift to the cut.
- **Contrast:** field keys #6b6b6b; count colours #82580f and #256b3b (AA).
- **Exit pose at 51.40:** `d14` exactly (stage scale ≈1.006 about 720, 520). The brief card is clean for C1 to shrink into the laptop screen.

## Section 9 implementation (51.42–59.25), closing C1 + C2: out through the laptop screen

- **Project:** `hyperframes/section-9/`; commands `s9-*`. Composition time 0 = reel 51.4333 (frame 1543); 235 frames to 59.2333; C3 begins at 59.25.
- **Footage:** `lawyer-office-v3.mp4` in O1's layout (1770.37 × 1000 at x −18.52, bezel patch). Clip time = reel − 48.30 (`data-media-start` 3.1333; clip 3.13–10.97 s). Checked: nothing crosses the screen in that range (screen-colour coverage ≥ 97.8 % every frame; the first dips are at clip 11.2–11.5 s, which matters for C3).
- **Screen quad** (line-fitted display area, source px): TL (619.2, 488.7), TR (984.1, 457.0), BR (1027.7, 714.2), BL (664.8, 771.5); canvas = source × 1000/1080 − (18.52, 0). Locked camera, one quad for the whole clip.
- **No plate:** section 8's d14 hold is rebuilt live (stage push 1.005942 relaxing to 1 by 51.75).
- **Flow:**
  - 51.43–51.75: decorations peel off (clay block up, sand down, guides, pill and qualifier fade); the thread and marks retract.
  - 51.45–51.85: the brief (page 340, 76, ×1) and the review panel (1124, 76, ×1) glide into the Hearing Prep page (1440 × 900, rebuilt from capture 13 without Accept / Regenerate / Sign off); chrome sets 51.56 + 0.04 i.
  - 51.80–52.40: the page's corners go from (0, 50)–(1440, 950) to the screen quad (power3.inOut, matrix3d homography) while the footage zooms 1.5 → 1 about the screen centre; grade (multiply rgb 184, 187, 201) and glare fade in 51.95–52.40; the paper dissolves 52.00–52.30.
  - 52.30–52.55: light corner marks lock on the screen (expo.out from 1.5×); 52.75–52.95 release.
  - 52.95–59.25: C2 hold, 3 % push about (820, 560); the page rides the screen.
- **Check:** contrast flags only on the graded screen text (intended: it is a screen inside footage).
- **Hand matte (added 22 Oct after approval):** her knuckles rise in front of the screen's lower-right corner from ≈58.6 (clip ≈10.3 s on). Fix: per-frame RGBA cut-outs `section-9/hand/hNNN.png` (frames 214–234, placed at canvas (740, 540)) above the page. They are keyed from a render of a temporary copy of the composition with `#page` hidden, so they sit on HyperFrames' own resampled footage frames with the push baked in. Alpha = clamp((R − B + 2) / 14) inside the screen quad (3 px dilated), 0.6 px blur. Script: `scripts/hand-matte.py <frames dir with np/nNNN.png> <out dir> <T0> 0`; regenerate the same way if the push or timing changes.
- **Exit pose at 59.2333:** the footage at push ≈1.03 with the page on the screen; C3 wipes from here.

## Section 10 implementation (59.25–62.90), closing C3 + C4: window light to the brand

- **Project:** `hyperframes/section-10/`; commands `s10-*`. Composition time 0 = reel 59.2667 (frame 1778); 109 frames to 62.8667. The whole track is **1887 frames (62.90 s)**, matching the reel's audio (ends 62.8999).
- **C3 wipe 59.25–59.71:** section 9's office (clip = reel − 48.30, push continuing to 59.4) and the page on the screen run live under a paper layer whose mask is a feathered (±40 px) linear gradient at 66° (edge tilted like the window light, −24°). Edge X = −300 → 1760 (power2.out), so it clears the hand corner by ≈59.41. A soft-light band (300 px, blur 40) leads the edge by 120 px, plus a screen-blend glow (180 px, blur 30) on the footage side. Hand cut-outs `section-10/hand/h000–h008` (same method as section 9) under the paper layer.
- **C4:** B1's layout exactly (mark 380 px at (530, 100); wordmark Instrument Serif 176 px, centred, top 500; halos r 17/15/13/13 at the nodes). No ground line at the wipe. 59.86 trunk-node pulse (r 17 → 43, fades by 60.5). 60.0–62.35 the ground line draws from the roots (720 ± 160) to both frame edges (sine.inOut), arriving on "started". Still hold to the last frame.
- **Exit pose (last frame 62.8667):** B1's brand with the full ground line.

## Final exports (22 Oct 2026)

- **`hyperframes/renders/lawvriksh-graphics-track-silent.mp4`:** the ten high-quality section masters concatenated and re-encoded once (H.264, CRF 12, slow, yuv420p, faststart). 1440×1000, 30 fps, 1887 frames, 62.90 s. Section frame counts: pilot 744 · 2: 250 · 3: 151 · 4: 101 · 5: 82 · 6: 64 · 7: 97 · 8: 54 · 9: 235 · 10: 109.
- **`hyperframes/renders/review-0-62.90.mp4`:** the same picture (CRF 18) with the reel's original audio, AAC 63 kb/s, trimmed to 62.90 (the audio ends at 62.8999).
- To re-export after a change: re-render the affected section (`run.ps1 sN-render`), then run the same concat.

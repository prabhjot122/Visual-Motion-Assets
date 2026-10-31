# Reference motion analysis — Harvey II and Lovio

Phase 4, 22 Oct 2026. Sources: `media/originals/harvey-reference-original.mp4` (1280×720, 24 fps, 60.04 s) and `media/originals/lovio-reference-original.mp4` (1920×1080, 30 fps, 53.0 s). Style references only; none of their footage, audio or marks is reused.

## Method and limits

- **Orientation:** existing 5 s contact sheets, then new 1 fps overviews: `references/motion-analysis/harvey-reference-overview-1fps.jpg`, `lovio-reference-overview-1fps.jpg`.
- **Transition finding:** FFmpeg scene-change detection (threshold 0.18) on both files.
- **Dense inspection:** 8–12 fps strips of ten passages and four **every-frame** spans (24/30 fps). Frames and labelled sheets are under `references/motion-analysis/<video>/<passage>/` and `references/motion-analysis/<video>-<passage>.jpg`. Produced by `scripts/extract-motion-strips.py` (source-time seeking; originals untouched). Not every frame of either video was extracted.
- **Motion energy:** mean absolute luminance difference between consecutive frames (160×90 grey) over two transitions, giving measured acceleration, peak and settle rather than an impression.
- **Limitation — no real-time viewing or listening.** I cannot watch normal-speed playback or hear audio in this environment. Motion was judged from consecutive frames and the energy curves; reference soundtracks were not analysed. Timing statements below are frame-accurate to the sampled rate (±1 frame at every-frame spans, ±0.125 s on 8 fps strips).

Notation: **Obs** = visible in frames. **Inf** = my inference about the mechanism.

## Harvey II

### H-A · Cube face becomes the product window — 9.50–11.50 s

Sheets: `harvey-reference-h5-collage-to-ui.jpg` (12 fps), `harvey-reference-h5-every-frame.jpg` (10.45–10.95, every frame).

- **Obs:** a dark cube rotates slowly inside a dense collage (9.5–10.4). Collage clears around it (10.58). At 10.67 the cube is face-on: a flat dark square. At 10.75 the square becomes a blank white rectangle on new collage. From 10.83 the window fills with UI: headline types in, then sidebar (11.17), then list rows (11.33).
- **Followed:** the cube, then the same rectangle, then its text.
- **Inf:** the object's silhouette becomes the window's frame (shape match plus a cut on the face-on frame). The UI builds inside a frame that already holds the eye; nothing appears from nowhere.

### H-B · Stone slabs bridge into product — 15.50–19.50 s

Sheet: `harvey-reference-h1-hub-slabs-ui.jpg`.

- **Obs:** hard cut from the hub layout to a close-up of stone slabs (16.0). The camera trucks laterally (16.0–17.3). Cut to a top view where the slabs read as horizontal white bars (17.375). Cut at 19.0 to a white product window on stone ground with a slow push-in (19.0–19.5).
- **Inf:** the slabs are a material interlude between product states. The white bar shape rhymes with the white window that follows. Each cut lands on a shape match, not on a fade.

### H-C · Focal disc snaps to a dot; lines become rails for cards — 22.00–25.00 s

Sheets: `harvey-reference-h2-ui-to-portal-cards.jpg`, `harvey-reference-h2-every-frame.jpg` (22.00–22.54).

- **Obs (every frame):** UI at 22.083; hard cut to a frame-filling dark textured disc at 22.125. The disc shrinks fast (22.125–22.458). A thin square outline appears around it at 22.333 while it keeps shrinking into a small dot. A bevelled box forms around the dot (22.5–23.0). Its outer line extends off-frame (23.25–23.375). A UI text card appears top-left (23.375) and a second card slides in from the right attached to a line (23.625–23.875). Box faces change texture at 24.25–24.375.
- **Energy:** rises from 22.01, **peaks at 22.26** (62.4), drops to 11.1 by 22.51 and below 2 by 22.76. Small secondary bumps (5–6) at 23.18–23.34 are the line draws. **Near-still 23.6–24.2** (reading hold). A second short beat peaks at 24.34 (10.2).
- **Inf:** "snap and settle": about 0.13 s to peak, then roughly exponential decay with ~0.35 s settle. The dot stays at the same screen position from 22.4 to 25.0. Everything that follows attaches to geometry radiating from it.

### H-D · Hub around a locked centre — 46.00–50.50 s

Sheet: `harvey-reference-h3-hub-nodes.jpg`.

- **Obs:** a list panel shifts up and dissolves while pixel blocks fly out (46.0–46.75). At 46.875 a hub appears: centre square, four black-header cards and quarter-circle stone blocks in the corners. At 48.375 the card contents blank to grey bars, and at 48.5 they swap to a new card style. The corner blocks change texture (grey → pink/green). The centre square never moves (46.875–50.5).
- **Inf:** a fixed focal anchor lets content change around it without the viewer re-orienting. Card content swaps in place (blank → new) rather than cross-fading whole layouts.

### H-E · Product → cube → brand mark — 54.50–59.50 s

Sheet: `harvey-reference-h4-ui-cube-mark.jpg`.

- **Obs:** product UI held 54.5–55.5. Cut to a dark close-up of a cube face (55.625). The camera pulls back as the cube rotates and shrinks (55.75–57.0). At 57.125 white light seams split the cube along its edges. The H mark is revealed inside (57.5–57.875). At 58.125 the background flips to white paper and fragments fly outward and off-frame (58.125–58.875). The H holds alone from 58.875 to the end (≈1.5 s+).
- **Inf:** the ending reverses the opening logic: object opens to reveal the mark. A long, still hold signs off.

## Lovio

### L-A · Environment prompt → word → mark — 5.00–9.50 s

Sheet: `lovio-reference-l1-prompt-word-mark.jpg`.

- **Obs:** a glass prompt card floats in a sunlit concrete environment with shadow bands. Its text clears (5.25). The camera pushes in until the card edge frames the shot (5.375). "I have an idea" types (5.375–6.125). Hard cut at 6.25 to the single word "idea" on a gradient, focusing in (6.25–6.625) and holding (6.625–7.0). The word dissolves into particles that form the logo mark (7.125–7.5). The mark shrinks (7.75–8.125), then the wordmark wipes in beside it (8.25–8.5) and holds (8.5–9.25). Cut to UI at 9.375; pull-out reveals it on a laptop in a room (9.5).
- **Inf:** the carried element is the **word** ("idea" survives the cut). The environment's light bands set a mood that the product space later echoes.

### L-B · Device hand-offs and split layout — 9.50–15.50 s

Sheet: `lovio-reference-l2-device-handoffs.jpg`.

- **Obs:** laptop with a slow push (9.5–10.8). Cut to the phone in a hand (11.0), then the tablet (12.83), then the person typing (14.5). At 14.833 a dark panel wipes in from the left, pushing the person right into a split, with the prompt typing in the panel (15.0–15.5).
- **Inf:** continuity is carried by the same app across devices, not by geometry. The split at 14.83 is a person-plus-product layout; not used — the influencer is outside the graphics canvas (rev 2).

### L-C · Click → same container changes state → push in to read → highlights lift out — 16.00–20.50 s

Sheets: `lovio-reference-l3-click-zoom-panels.jpg`, `lovio-reference-l3-every-frame.jpg` (16.55–17.10).

- **Obs (every frame):** the cursor presses send at 16.583–16.617. The text fades over 3 frames (16.65–16.717) while the **container stays**. An icon appears inside at 16.783. The container shrinks and translates as a progress bar grows (16.82–17.88, ~1 s readable). Hard cut to a code window at 18.0. The camera pushes in (18.5–18.875), then holds a close-up for reading (19.0–19.5). Blue highlight rectangles appear on lines (19.625), detach and float as panels (19.75–19.875), and become a grid of blank tiles (20.0) that fill with product cards (20.125–20.5).
- **Inf:** state changes happen **inside a persistent container**. A detail the viewer just read (highlight) is physically pulled out and becomes the next composition.

### L-D · UI → device → flanking words — 25.00–28.50 s

Sheet: `lovio-reference-l4-ui-to-device-words.jpg`.

- **Obs:** full-frame UI (25.0–25.25), then a pull-back to a laptop at an angle that keeps receding (25.375–26.5). The price ticks $3503 → $3499 during the move. At 26.625 the laptop becomes a small card while "Beautifully" / "designed" slide in from the sides with motion blur. Hold with a slow push (26.75–27.875). Letters dissolve individually (28.0–28.5).
- **Inf:** live content changes during camera moves keep the product feeling real. Editorial words flank, never cover, the product.

### L-E · Click, pull back into environment, fixed selection brackets — 40.50–44.50 s

Sheets: `lovio-reference-l5-click-env-brackets.jpg`, `lovio-reference-l5-every-frame.jpg` (41.10–41.75).

- **Obs (every frame):** the cursor reaches Share (40.75) and clicks (40.875; button turns blue). Hold 41.0–41.1. The UI shrinks slowly, then faster (41.1–41.5), revealing the sunlit environment behind it (41.467). By 41.567 it is one card in a moving horizontal row. White brackets `{ }` appear around the card at screen centre (41.75–42.0). The row scrolls left **through the fixed brackets** (42.0–43.4). The brackets part (43.5) and the selected card expands into a full dashboard (43.625), followed by a slow push and hold (43.75–44.5).
- **Energy:** quiet through 41.03 (click hold), then a **monotonic ramp** 2.6 → 6.6 → 10.9 → 16.4 → **28.1 at 41.53** (ease-in into the hand-off). Long low drift (1–3) through the row scroll. Recurring beats at **42.63** and **43.53**: about **0.9 s cadence**, each preceded by a short ramp. Near-still after 44.0.
- **Inf:** exits accelerate into the next state (ease-in), arrivals settle. A screen-fixed frame lets the content change underneath while the eye stays put.

## What the combination teaches for LawVriksh

| Need                                | Observed device                                                                                                                              | Where                              |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| One thing to follow across a cut    | Focal object keeps screen position (dot, centre square, brackets)                                                                            | H-C 22.4–25.0; H-D; L-E 41.75–43.4 |
| Shape continuity into product       | Object silhouette becomes the window (cube face → window)                                                                                    | H-A 10.58–10.83                    |
| UI that grows from geometry         | Lines extend; cards attach to them                                                                                                           | H-C 23.25–23.875                   |
| State change without a fade         | Same container, content swapped                                                                                                              | L-C 16.65–16.82; H-D 48.375–48.5   |
| Detail becomes next composition     | Highlight lifts out into panels                                                                                                              | L-C 19.625–20.125                  |
| Material interlude between contexts | Stone slabs as a wipe                                                                                                                        | H-B 16.0–19.0                      |
| Pacing                              | Snap-settle arrivals (~0.13 s to peak, ~0.35 s settle), ease-in exits (~0.4 s ramp), ~0.9 s beat cadence, ≥0.6–0.9 s still holds for reading | H-C and L-E energy curves          |
| Brand ending                        | Object opens to reveal mark on paper, fragments exit, ≥1.5 s still hold                                                                      | H-E 57.1–59.5                      |
| Person + product                    | Panel wipes in and splits frame with the person                                                                                              | L-B 14.83–15.5                     |

These are mechanisms, not compositions to copy. The approved Frame C supplies the look. `storyboard.md` maps each shot to the passages above.

## Influencer reel checks (timing evidence)

Not a style reference, but inspected with the same tools.

- `references/motion-analysis/influencer-reel-overview-2s.jpg`: a single locked medium close-up, subject centred, face in the upper middle third (≈25–50 % of height). Plain wall, hands enter the lower third. **No burned-in captions.**
- Scene detection finds **three jump cuts at 33.130, 41.528 and 51.415 s**, matching paragraph starts. These are frame-accurate anchors.
- Speech pauses ≥120 ms come from the audio RMS envelope (10 ms hop, threshold −34.2 dBFS); see `storyboard.md` § Timing evidence. Combined with the ASR words, they confirm or correct each cue window. This is signal analysis, not listening.

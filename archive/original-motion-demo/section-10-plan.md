# Section 10 plan — Closing C3 + C4, 59.25–62.90 s (wipe to paper, brand hold) — the last section

22 Oct 2026. Follows the approved section 9. Status: APPROVED 22 Oct (left-to-right window-light wipe, brand already set, ground line arriving on "started", 1887 frames, straight to motion). Draft APPROVED 22 Oct; high-quality renders `hyperframes/renders/section-10-silent.mp4`, `section-10-review-audio.mp4`. Final exports `lawvriksh-graphics-track-silent.mp4` and `review-0-62.90.mp4`. Source: `storyboard.md` C3, C4; still `storyboard/renders/b1-brand.png`, as built in the pilot's B1 (mark 380 px at (530, 100), ground line y 431, wordmark 176 px).

## Scope and boundary

- **59.25 to the end:** C3 is the 0.46 s wipe from footage to paper. C4 is the brand hold.
- **Frames at 30 fps:** 1778–1886, i.e. 59.2667–62.8667 s, 109 frames. The full track is then **1887 frames (62.90 s)**. That matches the reel's audio, which ends at 62.8999, and the storyboard's last frame (62.873). The reel's container says 62.9067 s with 1890 nominal frames; its last frames are compressed timing, so I'm matching the audio, not the nominal frame count.
- **Entry:** section 9's last frame. That is the office footage at a push of about 1.03, with the Hearing Prep page on the laptop screen.

## What is said (reel ASR)

| Time        | Words                              |
| ----------- | ---------------------------------- |
| 59.20–59.86 | "and" (the pause the wipe sits in) |
| 59.86       | "**honestly**"                     |
| 60.32–61.64 | "I think we are just"              |
| 61.64       | "getting"                          |
| 62.00–62.54 | "**started.**"                     |
| 62.54–62.90 | silence to the end                 |

## Shot plan

| Beat                       | Time        | What happens                                                                                                                                                                                                                                                                                                | Mechanism                                                                                                |
| -------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **C3 · Window-light wipe** | 59.25–59.71 | A broad warm band of window light, at the same −24° as the stage light, sweeps left to right across the footage, from the window's side. Its trailing edge is the wipe: behind it, the footage gives way to paper. The footage keeps playing (clip 10.95–11.41), and the push continues until it's covered. | One soft-light band (as in B1's hold) plus a −24° clip edge. No slab, since this isn't a context change. |
| **Brand already set**      | 59.25–59.71 | The paper behind the band already carries **B1's mark and wordmark**, set and still, exactly as in the opening's brand moment. The clay ground line is **not drawn yet**. Only the mark's own clay circuit nodes show, with their soft halos.                                                               | The wipe reveals the brand rather than building it again. B1 built it; C4 brings it back.                |
| **The thread returns**     | 59.86–62.40 | On "honestly", the trunk node's clay ring pulses once. The clay ground line then draws outward from the roots to **both frame edges**, slowly at first and arriving at the edges on "started" (62.0–62.4). This is the thread that was born from the mark in B1, going back into it.                        | `stroke-dashoffset` draw-on, ease-in-out.                                                                |
| **Still hold**             | 62.40–62.87 | A still hold to the last frame. No drift and no bug.                                                                                                                                                                                                                                                        |                                                                                                          |

## Things to handle

- **Her fingertips touch the screen's lower-right corner from clip ≈11.2 s (reel 59.50)**, inside the wipe. I'll time the band so the wipe covers that corner first. If a frame still shows the page over her fingers, I'll add a small hand matte from the footage, so her fingers stay in front of the screen.
- The wipe leaves no gap: the paper, mark and wordmark are already in place behind the band edge.

## Honesty

- No product claims and no new UI: only the brand and the line.
- Original audio stays authoritative. No music or SFX.

## Build

- **New composition** `hyperframes/section-10/` (T0 = 59.2667, frame 1778), same contract; `run.ps1` tasks `s10-*`.
- **Footage and screen page:** carried over live from section 9's code for the first 0.46 s (the same clip mapping, screen quad and grade), so the wipe sweeps over moving footage.
- **Brand:** the mark PNG and Instrument Serif wordmark at B1's exact layout, with the clay nodes and ground line in SVG. No Three.js.
- **Final deliverables after approval:**
  - `section-10-silent.mp4`;
  - the full joined review, `review-0-62.90.mp4`, with the whole reel audio;
  - a single **full graphics track**, `lawvriksh-graphics-track-silent.mp4` (1440×1000, 30 fps, 1887 frames), which is the deliverable that sits under the influencer reel.

## Decisions for you

1. **Wipe:** a left-to-right window-light band, from the window's side (proposed), or right to left?
2. **C4 as storyboarded:** the mark and wordmark already set under the wipe, then the ground line draws out to both edges, finishing on "started", then a still hold (proposed). The alternative is to rebuild the mark the way B1 did.
3. **End length:** 1887 frames (62.90 s), matching the reel's audio (proposed), or pad to the reel's nominal 1890 frames?
4. **Straight to motion** (proposed; B1 is an approved still and already built)?

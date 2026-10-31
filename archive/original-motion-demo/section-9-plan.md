# Section 9 plan — Closing C1 + C2, 51.42–59.25 s (footage return and office hold)

22 Oct 2026. Follows the approved section 8. Status: APPROVED 22 Oct (C1 + C2 together, rebuilt Hearing Prep page held on the screen, O1 framing, straight to motion). Draft APPROVED 22 Oct; high-quality renders `hyperframes/renders/section-9-silent.mp4`, `section-9-review-audio.mp4`, joined `review-0-59.25.mp4`. Source: `storyboard.md` C1, C2; footage `media/footage/lawyer-v2/lawyer-office-v3.mp4` (LOCKED clip v3, 1912×1080, 24 fps, locked camera); reference `screenshots/13-hearing-basic-info-needs-review.png` (the saved Arora Hearing Prep page).

## Scope and boundary

- **51.42–59.25 s:** C1, the footage return, then C2, the office hold. I've kept them as one section because the footage runs continuously from C1 into C2, and the laptop screen keeps the same content throughout.
- **Frames at 30 fps:** 1543–1777, i.e. 51.4333–59.2333 s, 235 frames. Global reel time.
- **Entry:** section 8's last frame, the d14 hold.
- **Exit:** C3 begins at 59.25. In that 0.46 s pause, a band of window light wipes the footage to paper. That is the next and final section, together with C4.

## What is said (reel ASR)

| Time        | Words                                       |
| ----------- | ------------------------------------------- |
| 51.42       | "**As**"                                    |
| 51.74       | "**technology**"                            |
| 52.12–52.66 | "**evolves,**"                              |
| 53.04–54.56 | "AI sirf coding tak limited nahi hai"       |
| 55.14–57.36 | "it's changing different professions' work" |
| 57.36–59.20 | "and law is one of them"                    |

## Footage

- **Clip time = reel − 48.30.** Clip 4.0 s lands at 52.30, the moment the footage is fully visible, and clip 10.95 s plays at 59.25. This doesn't overlap the opening's clip range (0.50–2.35). It keeps the storyboard's glance at the papers (clip ≈4.5–8 s, so 52.8–56.3), and leaves about 1.1 s of clip for C3's wipe.
- **Framing:** the same as the opening (O1), as a bookend. The clip is laid out 1770×1000 at x −18.5, so the paper stack sits at left, the laptop at centre and the advocate at right; her head crops at the right edge, as in O1. The bezel patch from O1 is reused.
- **Laptop screen:** the camera is locked, so the screen is a fixed four-corner quad. Measured roughly at TL (556, 453), TR (≈905, 427), BR (≈935, 665), BL (594, 713) in canvas px; the build measures it exactly. Her hands stay on the keyboard below the screen. The build checks every frame for anything crossing the screen.

## Shot plan

| Beat                                 | Time        | What happens                                                                                                                                                                                                                                                                                                                                                                                                       | Mechanism                                                                                                          |
| ------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **The brief goes back into the app** | 51.42–51.80 | On "As technology", the d14 decorations peel off: the clay wordmark block, the sand, the pencil guides, the pill and the qualifier. The brief card and the review panel glide into their places on the **Hearing Prep page**, and the app's chrome sets around them: sidebar, breadcrumb "Arora v. Meridian Estates Pvt. Ltd. / Hearing Prep", the "In this brief" index, and the paper turning to app background. | Same containers, new state (Lovio L-C). The page is rebuilt from capture 13 as layered HTML at 1440×900 (16 : 10). |
| **Pull back into the screen**        | 51.80–52.40 | The page pulls back (`handoff`) and takes the laptop screen's perspective. It shrinks along a homography onto the screen's quad. Around it, the paper dissolves into the office footage, which is fully visible from 52.30.                                                                                                                                                                                        | Paper exits through the screen, mirroring the opening.                                                             |
| **Lock**                             | 52.30–52.55 | The corner marks re-lock on the four screen corners (`arrive`).                                                                                                                                                                                                                                                                                                                                                    |                                                                                                                    |
| **Release**                          | 52.75–52.95 | On "evolves", the marks expand and fade. Nothing else is drawn over the footage.                                                                                                                                                                                                                                                                                                                                   |                                                                                                                    |
| **Office hold (C2)**                 | 52.95–59.25 | The footage plays: she types, glances left at the papers, then returns to typing. A slow push of ≤1 %/s, about 3 % in total, eases toward the laptop and the advocate. The Hearing Prep page stays on the screen, graded to the screen's measured brightness and tint, with a faint glare, so it reads as the screen and not as an overlay.                                                                        | No product overlays (C2).                                                                                          |

## Honesty

- The screen shows the saved Arora Hearing Prep page, the same saved state as section 8. It is not generated.
- Accept, Regenerate and Sign off preparation are **left off** the rebuilt page. Capture 13 shows them, but they are never shown or pressed in this film. "1 to review" stays open.
- The screen content is a composite on generated footage. There's no new Higgsfield spend and no new footage.

## Build

- **New composition** `hyperframes/section-9/` (T0 = 51.4333, frame 1543), same contract; `run.ps1` tasks `s9-*`.
- **Opening plate:** none needed. Section 8's d14 layout is rebuilt live in this composition, so the brief and the panel can move into the page.
- **Footage:** a `<video>` clip with `data-media-start` = 3.1333 (reel 51.4333 − 48.30), placed as in the pilot. A matrix3d homography maps the page onto the screen quad. No Three.js.
- **Joined review:** 0.00–59.25.

## Decisions for you

1. **C1 and C2 as one section** (proposed), or C1 alone, ending at 53.09?
2. **What the laptop screen shows:** the Hearing Prep page rebuilt without Accept, Regenerate or Sign-off, held through C2 (proposed); capture 13 itself, which shows those buttons; or the page released back to the footage's blank screen after the marks?
3. **Framing:** the opening's framing, as a bookend (proposed; her head crops at the right edge), or a reframe so she is whole and the paper stack crops at the left?
4. **Straight to motion** (proposed; there's no still for C1), or a still first?

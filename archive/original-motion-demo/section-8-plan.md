# Section 8 plan — Hearing Prep, 49.62–51.42 s (D14, LOCKED window)

22 Oct 2026. Follows the approved section 7. Status: APPROVED 22 Oct (saved brief that sets, containers carry over, straight to motion). Draft APPROVED 22 Oct; high-quality renders `hyperframes/renders/section-8-silent.mp4`, `section-8-review-audio.mp4`, joined `review-0-51.42.mp4`. Source: `storyboard.md` D14; still `storyboard/renders/d14-hearing-prep.png`; reference `screenshots/13-hearing-basic-info-needs-review.png` (the saved Arora hearing brief).

## Scope and boundary

- **49.62–51.42 s, the locked Hearing Prep window.** It runs from section 7's end to the reel's **51.415 jump cut**, where the closing begins ("As technology evolves", 51.42).
- **Frames at 30 fps:** 1489–1542, i.e. 49.6333–51.4000 s, 54 frames. The cut falls inside the last frame, as at 33.13. Global reel time.
- **Entry:** section 7's last frame (the Insights hold).
- **Exit matters:** the closing (C1, next) pulls the Hearing brief's window back and shrinks it into the **laptop screen** in the office footage. This section ends with that brief card clean and centred enough to make that move.

## What is said (reel ASR)

| Time       | Words                       |
| ---------- | --------------------------- |
| 49.52–49.9 | "manually" (from section 7) |
| 50.02      | "**every**"                 |
| 50.34      | "**single**"                |
| 50.70      | "**page.**"                 |
| 51.0–51.42 | silence to the cut          |

## Shot plan (1.8 s: one readable state, `d14` layout)

| Beat                      | Time        | What happens                                                                                                                                                                                                                                                                                                                                                                                                                                  | Mechanism                                                 |
| ------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Containers carry over** | 49.62–50.05 | No wipe; same Arora matter. The document viewer from Insights folds into the **Hearing brief card**: it lifts, its pages slide away, and its rectangle settles at `d14`'s card (80, 300). The Insights panel becomes the **Readiness · Preparation Review** panel in its place on the right. "Insights." lifts out; the "Hearing Prep" label pill sets.                                                                                       | Same containers, new state (Lovio L-C), not a wipe.       |
| **The brief reads**       | 49.95–50.40 | The brief's fields set: HEARING BRIEF · _Arora v. Meridian Estates Pvt. Ltd._ · ARB.P. 428/2026 · Demo listing — verify against court record · Petitioner · Hearing date Wed, 28 Oct 2026 · Delhi High Court · Current stage · Last hearing 18 Jul 2026. The readiness counts land **0 Blockers · 1 Need review · 0 Completed**. The qualifier sets under the card: **"28 Oct 2026 is a presentation-only demo date — not a court listing."** | Saved state, set in fast; no thinking glyph.              |
| **Needs attention**       | 50.35–50.65 | The **NEEDS ATTENTION** chip pulses once. The clay thread runs from it to the To-review item: "Reconcile the notice and order amounts before settling the position." Marks lock on that item.                                                                                                                                                                                                                                                 | The thread ends where the story's conflict is still open. |
| **Hold**                  | 50.65–51.40 | Readable hold, **≈0.75 s**, through "every single page"; ≤1 % drift. Cut on 51.415.                                                                                                                                                                                                                                                                                                                                                           |                                                           |

## Honesty

- **Visual-only and labelled:** the saved Arora demo brief exactly as in the app capture. It is not generated: the storyboard and your standing direction say Hearing Prep is never shown as fresh generation, so I keep it a saved state that _sets_, not one that _writes itself_. (Say so if you want it to generate like Ask and the draft; I will record the change.)
- 28 Oct 2026 is labelled presentation-only. No Accept, Regenerate or Sign-off buttons are shown or pressed. "1 Need review" stays open.

## Build

- **New composition** `hyperframes/section-8/` (T0 = 49.6333, frame 1489), same contract; `run.ps1` tasks `s8-*`.
- **Opening plate:** a lossless snapshot of section 7's last frame, as in sections 4 and 5. The viewer and the panel are rebuilt live over it so they can morph.
- **Brief card and Readiness panel** rebuilt as layered HTML/CSS from `d14` and the capture. No Three.js.
- **Joined review:** 0.00–51.42.

## Decisions for you

1. **Saved brief that sets** (proposed, per the standing rule), or **generated** like Ask and the draft?
2. **Containers carry over** from Insights (proposed), or a wipe?
3. **Straight to motion** (proposed; `d14` is an approved still)?

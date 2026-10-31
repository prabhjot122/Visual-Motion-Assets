# Section 6 plan — Vikram draft, 44.27–46.40 s (D12, LOCKED window)

22 Oct 2026. Follows the approved section 5. Status: APPROVED 22 Oct (the draft writes itself, clay slab hand-off at 46.40, straight to motion). DRAFT BUILT (`hyperframes/renders/section-6-draft.mp4`; joined review `review-0-46.40-section-6-draft.mp4`), awaiting feedback. Source: `storyboard.md` D12; still `storyboard/renders/d12-vikram-draft.png`; references `screenshots/09-bail-draft-ten-linked-documents.png`, `10-bail-draft-law-and-checks.png` (the Vikram scenario draft).

## Scope and boundary

- **44.27–46.40 s, the locked Vikram window.** It opens as section 5's sand slab crosses and ends where the Insights section begins (46.40, on "…and you can also").
- **Frames at 30 fps:** 1328–1391, i.e. 44.2667–46.3667 s, 64 frames. Frame 1392 (46.40) begins D13. Global reel time.
- **Entry:** section 5's last frame, with the sand slab covering the frame.

## What is said (reel ASR)

| Time        | Words                                        |
| ----------- | -------------------------------------------- |
| 44.18       | "**generate**"                               |
| 44.52       | "**legal**"                                  |
| 44.92       | "**drafts**"                                 |
| 45.30–45.78 | pause                                        |
| 45.78–46.40 | "and you can also" (continues into Insights) |

## Shot plan (2.13 s, the shortest window: one idea, one read)

| Beat                       | Time        | What happens                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Context change**         | 44.27–44.55 | The sand slab crosses and leaves to the left, uncovering a new context: the label pill **"Vikram bail application · separate example"** and the draft page (as in `d12`) settling on the paper stage. "**Draft.**" rises (bottom, as in `d12`) on "drafts" (44.92).                                                                                                                                                                                                                                            |
| **The page writes itself** | 44.55–45.20 | **Recommended, to match your Ask direction:** the bail application builds on "generate legal drafts". The title block sets, then the paragraphs flow in line by line. As they land, the **yellow** "[… to be confirmed]" fields pop and the **blue** instruction-derived facts underline: "28 September 2026", "Suresh alleges that Vikram slapped him once".                                                                                                                                                  |
| **The checks**             | 45.20–45.85 | The **Checks** panel slides in. The score counts up to **61 / 100 · 4 issues found**, with Compliance 4 highlighted. The thread hops blue fact → yellow missing field → **Must fix · Complete case details** ("FIR number, police station, Applicant identity and address, and exact arrest time are still to be confirmed."). **Linked Documents · 10** slides in at the left (1 scenario note, 9 samples). The legend sets: Blue = from supplied instructions, not verified; Yellow = still to be confirmed. |
| **Hold → hand-off**        | 45.85–46.40 | Short readable hold. Then a **clay** slab sweeps in and covers on 46.40: back to Arora for Insights.                                                                                                                                                                                                                                                                                                                                                                                                           |

**Alternative (the storyboard's original):** the **saved** draft page simply settles (no writing), labelled "Saved draft · Vikram bail application", with the same hops, Checks, linked files and legend. It gives about 0.5 s more reading time, but it is static next to the Ask section.

## Honesty

- Separate context, clearly labelled (sand slab, Vikram label). No Arora content mixes in.
- The draft content is exactly the saved Vikram scenario draft. If it "writes itself", that replays the saved draft as generation, as you chose for Ask.
- Blue facts are labelled "from supplied instructions, not verified"; yellow fields "still to be confirmed".
- Check findings are shown, never applied or rejected.

## Build

- **New composition** `hyperframes/section-6/` (T0 = 44.2667, frame 1328), same contract; `run.ps1` tasks `s6-*`.
- **Draft page, Checks panel, Linked Documents and legend** rebuilt as layered HTML/CSS from `d12` and the captures. Every line, field and highlight is its own element. No Three.js.
- **Joined review:** 0.00–46.40.

## Decisions for you

1. **Draft writes itself (recommended, matches Ask)** or the saved page settles (storyboard original)?
2. **Clay slab hand-off back to Arora at 46.40:** keep (proposed)?
3. **Straight to motion** (proposed; `d12` is an approved still)?

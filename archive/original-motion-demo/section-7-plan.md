# Section 7 plan — PDF Insights, 46.40–49.62 s (D13)

22 Oct 2026. Follows the approved section 6. Status: APPROVED 22 Oct (template picked and six results arriving, straight to motion). DRAFT BUILT (`hyperframes/renders/section-7-draft.mp4`; joined review `review-0-49.62-section-7-draft.mp4`), awaiting feedback. Source: `storyboard.md` D13; still `storyboard/renders/d13-pdf-insights.png`; references `screenshots/16–18-pdf-insights-*.png` (the verified local Notice Analysis run on the Arora notice).

## Scope and boundary

- **46.40–49.62 s.** It opens as section 6's clay slab crosses (back to Arora) and ends where the **locked** Hearing Prep window begins (49.62).
- **Frames at 30 fps:** 1392–1488, i.e. 46.4000–49.6000 s, 97 frames. Frame 1489 (49.6333) is the first of D14. Global reel time.
- **Entry:** section 6's last frame: the clay slab covers the frame.

## What is said (reel ASR)

| Time        | Words                                                  |
| ----------- | ------------------------------------------------------ |
| 46.08–46.48 | "you can also"                                         |
| 46.72       | "**identify**"                                         |
| 47.36       | "**important**"                                        |
| 48.02       | "**points**"                                           |
| 48.58       | "**without**"                                          |
| 49.10       | "**reading**"                                          |
| 49.52       | "**manually**…" ("every single page" runs on into D14) |

## Shot plan (`d13` layout)

| Beat                 | Time        | What happens                                                                                                                                                                                                                                                                                           |
| -------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Back to Arora**    | 46.40–46.75 | The clay slab leaves to the left (it settles as `d13`'s clay arc, top-right). The notice opens in the document viewer at page 1: "Document · Notice invoking arbitration — 14 Mar 2026.pdf". "**Insights.**" rises top-left, landing on "identify" (46.72).                                            |
| **Run the template** | 46.70–47.10 | The side panel slides in on its **Insights** tab. **Notice Analysis** is picked as the insight template; its row fills and ticks ✓.                                                                                                                                                                    |
| **Results arrive**   | 46.95–47.80 | The six results reveal **140 ms apart, as in the verified run**: 01 Issuing Authority · 02 Recipient · 03 Statutory Provision · 04 Demand Made · 05 Response Deadline · 06 Stated Consequence. Each is a card with its exact quote and its page link. The field index card (01–06) sets in the viewer. |
| **Ride to page 2**   | 47.30–47.90 | On "important points", the viewer scrolls from page 1 to page 2 and the panel scrolls to results 4–6. The three passages highlight in their own colours: **amber** Demand Made, **pink** Response Deadline, **indigo** Stated Consequence.                                                             |
| **Demand Made**      | 47.90–48.20 | Demand Made is selected (index 04 lit). The clay thread runs from its card to its amber passage; the pink and indigo leaders draw in their own colours. Marks frame the amber passage.                                                                                                                 |
| **Hold**             | 48.20–49.60 | **≈1.4 s readable hold**, through "without reading manually". Rs. 2,30,00,000 reads as the notice's claim; nothing reconciles it. Ends on the cut into Hearing Prep.                                                                                                                                   |

Reveal timing follows the verified local run (140 ms stagger), a deterministic replay of that run: no live model. The "Save to Notes" and "Regenerate Insight" buttons stay unpressed.

## Data (verified run, exact quotes)

| Result                                                  | Quote                                                                                      | Page |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---- |
| 4 · Demand Made                                         | "being Rs. 2,30,00,000/- in principal together with interest;"                             | p2   |
| 5 · Response Deadline                                   | "consent within thirty days of receipt of this notice"                                     | p2   |
| 6 · Stated Consequence                                  | "the Claimant shall approach the Hon'ble High Court of Delhi under Section 11 of the Act." | p2   |
| 1–3 · Issuing Authority, Recipient, Statutory Provision | from the capture                                                                           | p1   |

## Build

- **New composition** `hyperframes/section-7/` (T0 = 46.40, frame 1392), same contract; `run.ps1` tasks `s7-*`.
- **Viewer and Insights panel** rebuilt as layered HTML/CSS from `d13` and the captures. The notice pages are the existing rasters (p1, p2), and the highlight boxes are the ones measured for `d13`. No Three.js.
- **Joined review:** 0.00–49.62.

## Decisions for you

1. **Show the template being picked and the six results arriving** (proposed; a replay of the verified run, consistent with Ask and the draft), or have the results simply present?
2. **Straight to motion** (proposed; `d13` is an approved still)?

## Constraints carried

- Arora only; the verified Notice Analysis results only (other templates, custom fields, save-to-notes and viewer chat stay deferred).
- Original audio authoritative; Hearing Prep 49.62–51.42 stays locked.
- No Higgsfield spend.

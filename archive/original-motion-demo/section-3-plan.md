# Section 3 plan — Case Map: conflicts → compare → verify, 33.13–38.17 s (D5–D9)

22 Oct 2026. Follows the approved section 2. Status: APPROVED 22 Oct (stop at 38.17, D5 ≈1.1 s, keep "Compare." and "Verify."). DRAFT BUILT (`hyperframes/renders/section-3-draft.mp4`; joined review `review-0-38.17-section-3-draft.mp4`), awaiting feedback. Source shots: `storyboard.md` D5–D9; look: stills `d05`, `d06`, `d07`, **`d08` = Frame C (approved appearance)**, `d09`.

## Scope and boundary

- **33.13–38.17 s.** It opens on the reel's 33.130 jump cut and ends where "aur poore case ki timeline…" begins (38.17, after the pause 37.67–38.17). That is the hand-off into the Chronology (D10), which pulls the order's "18 July 2026" off this section's last frame.
- **Frames at 30 fps:** 994–1144, i.e. 33.1333–38.1333 s, 151 frames. It runs on global reel time, like sections 1 and 2, so the renders join with no re-timing.
- **Entry:** section 2's last frame. The char slab covers the whole frame, then leaves to the left.

## What is said (reel ASR, word starts)

| Time        | Words                                           |
| ----------- | ----------------------------------------------- |
| 33.18–34.38 | "If there are…"                                 |
| 34.38–35.40 | "**conflicting** facts in different documents," |
| 35.60–36.58 | "then you can **compare** them,"                |
| 36.68–37.52 | "**verify** the sources"                        |
| 37.52–38.17 | "and…" (pause into the next phrase)             |

## Shot plan

| Shot               | Time        | What happens                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Look / mechanism                                     |
| ------------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **D5 · Mapped**    | 33.13–34.25 | The slab leaves to the left. "Mapped." rises; the Case Map window rises, default collapsed. The thread that came off the slab lands on the matter chip, the marks lock, and the nine edges draw out (40 ms stagger). The cursor glides to Conflicts. **About 1.1 s instead of d05's 2.1 s**, because the map is now on screen through 38.17.                                                                                                                                                    | `d05`; edges grow from the matter chip (Harvey H-C). |
| **D6 · Conflicts** | 34.25–34.95 | **Click Conflicts at 34.32**, just before "conflicting" (34.38). "Mapped." lifts away. The camera moves to the app's own focus framing for the opened branch. The two conflict groups grow out on their edge: Amount outstanding, and Third-tranche due date (agreement calculation). Marks frame the pair.                                                                                                                                                                                     | `d06`; same container, new state (Lovio L-C).        |
| **D7 · Versions**  | 34.95–35.55 | Click **Amount outstanding**. Version A and Version B appear. The Conflict panel slides in with both sources: notice p2 "…Rs. 2,30,00,000/- in principal…" and order p1 "…Rs. 1,15,00,000/-." The **2 : 1 stones rise**, the same A/B stones as in P4.                                                                                                                                                                                                                                          | `d07`; the stones carry the P4 conflict forward.     |
| **D8 · Compare**   | 35.55–36.62 | The camera pulls back and lands exactly on **Frame C**. "**Compare.**" sets on "compare" (35.98). **Still hold 36.0–36.55.**                                                                                                                                                                                                                                                                                                                                                                    | `d08`, the approved appearance.                      |
| **D9 · Verify**    | 36.62–38.17 | Click **Version B** (36.68, "verify"). The Material fact panel shows Rs. 1,15,00,000 with its one source; the source card opens the **interim order, page 1**, with the cited passage highlighted. "**Verify.**" sets. The thread runs Version B → passage → source card. **Verify fact is visible, never pressed**; the note "Verify fact opens review · nothing is approved" sits under it. Both stones stay. Hold 37.4–38.1, with the order's "Date of order: 18 July 2026" in view for D10. | `d09`.                                               |

Rhythm: one quick arrival (D5), three clicks a beat apart (34.32 · ≈34.95 · 36.68), one big still hold on Frame C, then a readable verify hold. One focal element at a time; the clay thread and the corner marks carry the eye from chip to chip.

## Data and app behaviour (checked 22 Oct, read-only, local mock app)

- New reference captures in `screenshots/`:
  - `22-arora-map-conflicts-open.png`
  - `23-arora-map-amount-versions.png`
  - `24-arora-map-version-b-panel.png`
  - `25-arora-map-version-b-source-preview.png`
- They match the stills:
  - Conflicts → Amount outstanding / Third-tranche due date
  - Amount outstanding → Version A / Version B, with the Conflict panel quoting notice p2 and order p1
  - Version B → Material fact Rs. 1,15,00,000, one source (interim order p1), Verify fact
- The source card opens the PDF viewer on the right document and page. In the mock dev capture the PDF itself showed "Failed to load document" (mock data only; user: ignore). D9 draws the order page from its raster with the measured passage, as `d09` does.
- The current app toolbar also shows expand and refresh buttons beside + and −. The rebuild adds them.

## Build

- **New composition** `hyperframes/section-3/`, same contract as before: global reel time, T0 = 33.1333 (frame 994); one paused GSAP timeline driving a pure `renderAt(t)`; seeded; local assets only; `run.ps1` tasks `s3-check`, `s3-draft`, `s3-render`, `s3-snapshot`.
- **No Three.js.**
- **Reused:**
  - section 2's Case Map scene code (`renderMapScene`, kept for this purpose)
  - the stills' `lib/casemap.js` (already supports the `conflicts → amount` path and the selected node)
  - `lib/panels.js` for the Conflict and Material fact panels
  - the order p1 raster with the measured line boxes for the D9 highlight
- **Camera:** a 2D camera over the map world (translate and scale about the map origin), interpolating between the framings in `d05` → `d06` → `d07` → `d08` → `d09`. Each still's own transform is a keyframe, so every hold lands exactly on its approved still.
- **Joined review:** 0.00–38.13, reel audio trimmed exactly.

## Steps

1. Build D5–D9 on the stills' framings as keyframes.
2. Snapshot each hold against its still (d05–d09); fix differences.
3. Draft render and joined review; present.
4. On approval: high-quality render, docs, exit pose for D10.

## Decisions for you

1. **Boundary:** stop at 38.17 before the Chronology (proposed), or continue through the Chronology to the 41.53 jump cut?
2. **D5 shortened to about 1.1 s** (the map then stays on screen for the next 4 s). OK?
3. **Editorial words "Compare." (D8) and "Verify." (D9)**, as in the approved stills: keep both?

## Constraints carried

- Verify never approves: the button is shown, never pressed.
- Both amounts stay unresolved; no reconciliation implied.
- Arora context only (the Arif Jafar scan ended at the cut).
- Original audio authoritative; no retime.
- No Higgsfield spend needed.

# Section 2 plan — product entry, 24.78–33.13 s (D1–D5)

22 Oct 2026. Follows the approved opening pilot. Status: DRAFT BUILT 22 Oct (`hyperframes/renders/section-2-draft.mp4`; joined review `review-0-33.13-section-2-draft.mp4`), retimed after motion feedback (OCR to the cut; Case Map after 33.13), awaiting review. Plan APPROVED 22 Oct (stop at 33.13, keep "Mapped.", build D4 and judge it in the draft, stills first). **Revised the same day:** D1 and D2 are pure motion graphics; see stills `d01-upload` and `d02-extract`. Source shots: `storyboard.md` D1–D5; look: Frame C and stills `d03`, `d04`, `d05`.

## Scope and boundary

- **24.78–33.13 s: documents in → extracted facts → OCR issue → correction → Case Map root.** It ends on the reel's jump cut at 33.130 s, the first hard edit after the opening. That cut is a clean place to stop, review and join the next section (Case Map deep dive D6–D10, 33.13–41.53).
- **Frames at 30 fps (rate still OPEN):** 744–993, i.e. 24.8000–33.1000 s, 250 frames, 8.333 s.
  - Frame 744 is the first after the pilot's last frame (743 = 24.7667).
  - The cut lands between frames 993 and 994 (33.1333).
  - The composition runs on global reel time (offset 24.8), so the two renders join with no re-timing.
- **Entry is the pilot's exit pose, unchanged:**
  - clay line y 150, x 160–1280
  - blank window 160,150 1120×650
  - brand bug top right
  - background paper and light bands
- Review audio: the reel 24.78–33.13 for this section, plus a joined 0.00–33.13 review copy so the hand-off is judged in motion.

## Shot plan

| Shot                       | Time                 | Words                                         | What happens                                                                                                                                                                                                                                                                                                                                                                                         | Mechanism (reference)                                                                                   |
| -------------------------- | -------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **D1 Documents in**        | 24.78–27.17 (2.39 s) | "Aap LawVriksh pe apne documents upload karo" | **Motion graphics, no app screen** (`d01-upload`). The P6 line is the top edge of a paper surface. The three real documents rise back in from below, one at a time (≈0.5 s apart); each is delivered on a clay drop from the line and pressed into its slot. Corner marks lock on each. Hold ≈0.6 s.                                                                                                 | Silhouette becomes surface (Harvey H-A); snap and settle per document (H-C).                            |
| **D2 Facts extracted**     | 27.17–28.70 (1.53 s) | "LawVriksh important facts extract karega"    | **Motion graphics** (`d02-extract`). The documents deal five source pages into columns (0.3 s). A clay scan stops on each real source line; the highlight lifts off, drops down the page margin and unfolds into a fact tag with its source page (80 ms stagger). The tags hang on one thread that exits right. Readable ≈0.6 s.                                                                     | Highlight becomes the next composition (Lovio L-C 19.625–20.125).                                       |
| **slab**                   | 28.56–28.70          | (pause)                                       | A **char** slab sweeps in from the right (context change to the separate Arif Jafar scan).                                                                                                                                                                                                                                                                                                           | Material interlude (Harvey H-B).                                                                        |
| **D3 OCR issue**           | 28.70–30.30 (1.60 s) | "unclear text highlight karega"               | The slab carries in the supplied scan, page 2 (raster), and the Issues panel, laid out as `d03`. Label: "Separate example · Arif Jafar v. Union of India — supplied scan". **≈29.74 ("unclear"):** the corner marks snap onto the OCR box around `brlies`. The issue card (Important · 73 % confidence) lifts, and the thread joins box → card. A saved result, replayed locally, not a new OCR run. | Snap and settle (H-C); the focal box stays put (L-E).                                                   |
| **D4 Correction**          | 30.30–31.00 (0.70 s) | —                                             | `brlies` → `Parties` (single-word replace), **Saved**. The panel flips to Extracted text (`d04`); the same thread still ties the word to its box. The char slab exits left at 30.85, taking the scan with it.                                                                                                                                                                                        | State change inside the panel (L-C). **Fallback if 0.7 s is unreadable:** drop D4 and hold D3 to 31.00. |
| **D5 Case Map, collapsed** | 31.00–33.13 (2.13 s) | "aur poore case ki mapping banayega"          | Back on Arora paper: **"Mapped."** sets top-left (if kept; see decisions). The window arrives with the default collapsed map (`d05`). The thread that came off the slab lands on the matter chip, and the corner marks lock to it. Edges draw out to the nine categories (0.4 s, 40 ms stagger). Hold ≈1.0 s, then the cut.                                                                          | Lines extend; nodes attach (H-C 23.25–23.875).                                                          |

Rhythm: D1 calm build → D2 quick swap → D3 the one hard snap → D4 fast (deliberately) → D5 spacious hold. One focal element moves at a time; the thread is the only continuous object across all five shots, as in the opening.

## Data (checked against the current seed, 22 Oct)

- **Facts (D2), `src/mocks/data/corpus.ts`:** Date of agreement 3 February 2023 (agreement p1) · Total consideration Rs. 4,60,00,000 (p2) · Date of possession 22 February 2023 (notice p1) · Amount outstanding Rs. 2,30,00,000 (notice p2, contradicted) · Amount outstanding Rs. 1,15,00,000 (order p1, contradicted). These match the storyboard.
- **Documents (D1): the seed now has four Arora documents, not three.** D1 is concept motion graphics, so it shows the three source documents the story uses; the research note is left out:
  - Notice invoking arbitration — 14 Mar 2026
  - Development Agreement — 03 Feb 2023 (registered); status _needs attention_, 3 OCR issues
  - Interim order under Section 9 — 18 Jul 2026
  - **Research note — limitation under Section 34** (new)

  I'll show all four rows truthfully. The agreement row's own "3 OCR issues" must not be confused with D3's separate scan, so D3 keeps its "separate example" label.

- **Case Map counts (D5):** the `d05` still's counts come from the stale phase-2 capture. They will be re-read from the running app before building.

## Build

- **New HyperFrames composition** `hyperframes/section-2/`, same contract as the pilot: one paused GSAP timeline driving a pure `renderAt(t)`; seeded; local fonts and assets; `run.ps1` tasks `s2-check`, `s2-draft`, `s2-render`, `s2-snapshot`.
- **No Three.js.** Product UI is rebuilt as layered HTML/CSS from the app's own sources, with every text run, row, chip and node its own element:
  - `matter-documents-page.tsx`
  - `matter-facts-mode.tsx` / `fact-register-table.tsx`
  - the OCR review styles
  - `case-map.css` / `case-map-panel-model.ts`

  It reuses the stills' `lib/casemap.js` and `lib/panels.js`. Raster only for the Arif Jafar scan.

- **Joined review:** concatenate the pilot and section-2 renders, then mux the reel audio 0.00–33.13 (trimmed exactly, as for the pilot).

## Steps

1. ~~Reference captures~~ Only `map-root-current` was captured (`screenshots/21-arora-map-root-current.png`); its counts match `d05`, so `d05` stands. D1/D2 captures were withdrawn.
2. **Two new stills for approval:** `d01-upload` and `d02-extract` (motion graphics).
3. Build D1–D5; snapshots against the stills and the reference passages; early draft render.
4. Final silent render + section review copy + joined 0.00–33.13 review copy; docs updated (`design-spec.md` exit pose at 33.13, `creative-memory.md`).
5. Present, then stop before 33.13.

## Decisions for you

1. **Boundary:** stop at the 33.13 jump cut (proposed), or run the whole product section to 51.42 in one build?
2. **Editorial word "Mapped."** in D5: keep it (as in `d05`), or let the map arrive without a word? (Open choice 3 in the storyboard.)
3. **D4 at 0.70 s:** build it and judge in the draft (proposed), or drop it now?
4. **Stills first (proposed) or straight to motion** for D1 and D2?

## Constraints carried

- No influencer picture; original audio authoritative; no retime.
- Arora / Arif Jafar / Vikram kept separate (char slab for the scan).
- Saved results never shown as fresh upload, OCR or generation.
- Verify never approves.
- No Higgsfield spend is needed for this section.

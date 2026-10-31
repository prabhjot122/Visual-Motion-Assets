# Section 4 plan — Chronology, 38.17–41.53 s (D10)

22 Oct 2026. Follows the approved section 3. Status: APPROVED 22 Oct (stop at 41.53, solid "Timeline.", straight to motion) with one change: **pure motion graphics, not the app's Chronology style** (the "resolves into the product" beat became titles set beside the rail and a paper source slip). DRAFT BUILT (`hyperframes/renders/section-4-draft.mp4`; joined review `review-0-41.53-section-4-draft.mp4`), awaiting feedback. Source: `storyboard.md` D10; references `screenshots/11-chronology-expanded-corpus.png` and `12-chronology-registered-source.png` (reference images on hand, per your note); look: P6 still `p5-p6-provisions-dates.png` resolved, and Frame C.

## Scope and boundary

- **38.17–41.53 s.** It opens where "aur poore case ki timeline…" begins and ends on the reel's **41.528 jump cut**, before "You can also ask…" (41.62). That cut is where D11 (Ask) enters: the rail tips horizontal and becomes the composer's underline.
- **Frames at 30 fps:** 1145–1245, i.e. 38.1667–41.5000 s, 101 frames. The jump cut falls between frames 1245 and 1246. Global reel time, like sections 1–3.
- **Entry:** section 3's last frame (d09): the order p1 preview with "Date of order: 18 July 2026" in view, the Material fact panel, the stones, "Verify.".

## What is said (reel ASR)

| Time       | Words                        |
| ---------- | ---------------------------- |
| 38.17      | "and you can see…"           |
| 38.70      | "**complete**"               |
| 39.44      | "**timeline**"               |
| 40.00–40.6 | "of the whole case at once." |
| 40.6–41.53 | silence until the cut        |

## Shot plan

| Beat                          | Time        | What happens                                                                                                                                                                                                                                                                                                                                    | Mechanism                                                                   |
| ----------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Pull the date**             | 38.17–38.70 | On the order page, "18 July 2026" takes a clay highlight and lifts off as a paper date tag, as P6's tags did. The clay thread hooks it and pulls it down; the thread straightens into a vertical **rail** at the left third. Everything else clears with ease-in exits: the preview, Material fact panel, map window, "Verify." and the stones. | Detail becomes the next composition (Lovio L-C); one thread carries across. |
| **The dates come home**       | 38.70–39.55 | The other eleven tags from P6, the same paper tags with the same small pin rings, fly back in from the frame edges where they fell at 24.4. They **snap into order on the rail, newest first, 70 ms apart**. "**Timeline.**" sets on "timeline" (39.44), solid this time: the payoff of P6's outline word.                                      | Payoff of the knot (P6); snap-and-settle (Harvey H-C).                      |
| **Resolves into the product** | 39.55–39.95 | The rail and tags become the real **Chronology** inside a product window: tags become the date column, pin rings become the event icons on the rail, and the 12 events' titles and lines set beside them. "PAST" header, toolbar: search, Filter, "2 events need review", Add event.                                                            | Same container, new state; UI grows from geometry.                          |
| **Agreement registered**      | 39.90–40.40 | The camera eases toward the lower rows. **Agreement registered** (9 Feb 2023) is selected, and its event panel slides in: Fact · Verified automatically · details · Sources (1): notice p1 "…on **9 February 2023** as Document No. 4127 of 2023." The thread runs row → source quote.                                                          | Same panel language as D9.                                                  |
| **Hold**                      | 40.40–41.50 | Readable hold with ≤1 % drift. Focal marks on the row and its provenance. Cut on 41.528.                                                                                                                                                                                                                                                        |                                                                             |

**Data (seed, checked):** 12 Arora events, all Past, as on the reel and in capture 11:

| Date         | Event                                       |
| ------------ | ------------------------------------------- |
| 12 Sept 2026 | Listed hearing (18 July order)              |
| 15 Aug 2026  | Respondent affidavit deadline (calculated)  |
| 18 Jul 2026  | Interim protection granted                  |
| 14 Mar 2026  | Arbitration invoked                         |
| 29 Jul 2024  | Respondent replied on the payment condition |
| 4 Jul 2024   | Legal notice served                         |
| 30 Jun 2024  | Legal notice issued                         |
| 15 Jan 2024  | Third tranche fell due                      |
| 6 Apr 2023   | DDA no-objection certificate dated          |
| 22 Feb 2023  | Possession handed over                      |
| 9 Feb 2023   | Agreement registered                        |
| 3 Feb 2023   | Development Agreement executed              |

These are exactly P6's twelve tags, so every tag has a row to land in.

**Honesty:** the event panel shows the saved state ("Verified automatically"), and nothing is clicked in it. "Unverify" and "Edit" are visible, never pressed. 15 Aug 2026 stays labelled _calculated_. 12 Sept 2026 is the historical listing in the order, not a confirmed future hearing.

## Build

- **New composition** `hyperframes/section-4/` (T0 = 38.1667, frame 1145), same contract as before; `run.ps1` tasks `s4-*`.
- **No Three.js.** The Chronology list and event panel are rebuilt as layered HTML/CSS from the app's chronology components and the reference captures. Section 3's D9 scene code supplies the opening frame, and the P6 tag style comes from the pilot.
- **Joined review:** 0.00–41.53, with the reel audio trimmed exactly.

## Decisions for you

1. **Boundary:** stop at the 41.53 jump cut (proposed)?
2. **"Timeline." as a solid editorial word** on "timeline" (39.44), paying off P6's outline: keep (proposed) or skip?
3. **Straight to motion** (proposed, since the composition is P6 resolved into captures you've already seen), or one still first?

## Constraints carried

- Arora only; saved data; nothing verified or edited on screen.
- Original audio authoritative; no retime.
- No Higgsfield spend.

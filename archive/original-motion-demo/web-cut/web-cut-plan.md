# Web cut plan — a silent, self-explaining version of the film

22 Oct 2026, revision 2. Status: **APPROVED 22 Oct; building section by section** (reel projects untouched).
- **The reel cut stays exactly as approved:** 62.90 s, audio-locked, `hyperframes/renders/lawvriksh-graphics-track-silent.mp4`.
- **This is a second cut, for the website hero:**
  - no audio;
  - each section gets the time it deserves;
  - short animated sentences explain what each part shows;
  - one new chapter, **Tabular review**.

**Revision 2 changes (your notes):**
- The lawyer footage stays in full, at its reel length: the opening office shot and the whole closing laptop and office sequence.
- No tagline under the logo, at the brand moment or at the end.
- Case Map is about **conflict resolution**, not comparing.
- Insights covers **any document**, not only a notice.
- **New chapter 04 · Tabular review** is where the film says "compare".

**Where things are:**
- **Style frames:** `web-cut/renders/f1–f8.png`. Their sources are `web-cut/frames/*.html`, laid over word-free snapshots of the real sections.
- **Tabular review captures:** `screenshots/28–32-tabular-review-*.png`, from the local mock app.

---

## 1. What changes and what doesn't
- **Visuals stay as approved:** every section keeps its animation, layout, art style, hand-offs and honesty labels.
- **Footage stays:** the opening office shot (1.85 s) and the closing laptop and office sequence (7.8 s) play at their reel length.
- **Retiming:** each section gets a time map. Every section's `renderAt(t)` is a pure function of time, so retiming is exact. Snaps keep their speed; only holds, staggers and reading time stretch.
- **One-word titles become sentences:** "Hundreds.", "Manually.", the outline "Timeline.", "Mapped.", "Compare.", "Verify.", "Timeline.", "Ask.", "Draft." and "Insights.".

## 2. The text system (from the Lovio reference)

| Lovio passage | What happens | What we take |
| --- | --- | --- |
| 36.0–38.6 s, "What starts as / an idea" | The sentence arrives phrase by phrase: each phrase focuses in from blur, alone and big. Then a device rises out of it. | **Sentence card** |
| 28.4–31.6 s, "ready to launch" | The letters resolve. Then the words **part sideways**, product UI slides in between, and the row scrolls on into the screen. | **Split** |
| 26.6–28.5 s, "Beautifully / designed" | The words flank the product and never cover it. | **Dock** |

- **Device A, sentence card then dock (every chapter):**
  1. The words rise 24 px and focus from 8 px blur, 60 ms apart, with a clay kicker above. The visual waits behind, blurred.
  2. The card holds for 0.3 s per word plus 0.5 s, and at least 1.2 s.
  3. The sentence shrinks from 104 px to 52 px and glides to the top-left, where the old one-word title sat. Meanwhile the visual sharpens and plays (F1 → F2, F5, F6, F7).
  4. A beat change inside a chapter swaps the line in the dock.
- **Device B, the split (once):** "What if AI did the heavy lifting?" The words part, the clay thread sweeps through the gap, contracts to the clay point, and the brand grows from it (F4).
- **Type:** Newsreader for sentences, with the key word in italic clay. Figtree caps for the clay kicker. A soft paper wash sits behind the dock for contrast.
- **Optional chapter rail:**
  - Bottom-left: Problem · Upload · OCR · Case map · Tabular · Timeline · Ask · Draft · Insights · Hearing.
  - It's hidden in sections where it would collide (F2, F3, F6).

## 3. The script: what appears on screen

| # | Beat | On-screen text | Device | Replaces |
| --- | --- | --- | --- | --- |
| 1 | O1 office (footage, full) | (none) | | |
| 2 | O2 page volume | **THE PROBLEM** · Hundreds of pages in *every* case. | Card → dock | "Hundreds." |
| 3 | O3 handwritten notes | sub: Notes in the margins, pages to cross-check. | Dock sub-line | |
| 4 | O4 manual verification | Every detail, checked *by hand*. · sub: One line at a time, page after page. | Card → dock | "Manually." |
| 5 | O5 the turn | What if AI · did the *heavy lifting*? | Split | |
| 6 | B1 brand | (none: mark and wordmark only) | | |
| 7 | P1 one case | **A REAL-WORLD EXAMPLE** · Take *one* case. | Card → dock | |
| 8 | P2 complex case | …and everything inside it. | Dock swap | |
| 9 | P3–P4 documents, conflict | Three documents. Facts that *disagree*. | Dock swap | |
| 10 | P5 provisions | Provisions to keep track of. | Dock swap | |
| 11 | P6 dates, knot | Dates scattered *across* the file. | Dock swap | outline "Timeline." |
| 12 | D1–D2 upload, extract | **01 · UPLOAD & EXTRACT** · Upload the case files. · sub: LawVriksh reads every page and pulls out the key facts, each one linked to the page it came from. → dock: Upload once. The *facts* come out. | Card → dock | |
| 13 | D3 OCR issue | **02 · OCR REVIEW** · Unclear text gets *flagged*. · sub: Low-confidence words are marked on the scan for you to check. | Card → dock | |
| 14 | D4 correction | Fix it once. It stays *linked* to the page. | Dock swap | |
| 15 | D5 Case Map | **03 · CASE MAP** · Every fact, mapped to its *source*. | Card → dock | "Mapped." |
| 16 | D6 conflicts | Conflicting facts surface on their *own*. | Dock swap | |
| 17 | D7–D8 two versions | Conflicting facts, side by side. *Resolve* them at the source. | Dock swap | "Compare." |
| 18 | D9 verify | Open the source. *Verify* before you rely on it. | Dock swap | "Verify." |
| 19 | **NEW · Tabular review** | **04 · TABULAR REVIEW** · *Compare* every document, side by side. · sub: Ask every document the same questions. The answers land in one table. → dock: Every answer cites its *page*. | Card → dock | |
| 20 | D10 timeline | **05 · TIMELINE** · The whole case, in *date order*. | Card → dock | "Timeline." |
| 21 | D11 Ask | **06 · ASK** · Ask your case file. · sub: Answers cite the documents they come from. → dock: Ask in plain words. Get *cited* answers. | Card → dock | "Ask." |
| 22 | D12 draft | **07 · DRAFT** · Draft from the *record*. · sub: Every draft is checked against its linked documents. | Card → dock | "Draft." |
| 23 | D13 Insights | **08 · PDF INSIGHTS** · The key points of *any* document, without reading every page. | Card → dock | "Insights." |
| 24 | D14 Hearing Prep | **09 · HEARING PREP** · Walk into the hearing *prepared*. | Card → dock | |
| 25 | C1–C2 laptop and office (footage, full) | (none) | | |
| 26 | C3–C4 wipe and brand | (none: mark, wordmark and ground line only) | | |

- **Labels stay:** the existing honesty labels stay where they are, such as "separate example", "Verify fact opens review · nothing is approved" and "28 Oct 2026 is a presentation-only demo date".
- **Wording changes from the reel:**
  - Lines 9 and 11 no longer name amounts or dates.
  - Line 17 is about resolving conflicts.
  - Line 19 is where "compare" lives.

## 4. New chapter: Tabular review

**What the app shows** (local mock app, light theme, captured with the right detail panel closed; `screenshots/28–32`):
- **Matrix:** the Arora matter as a document × question matrix. There are 14 documents: the 4 already seeded plus 10 the Arora record refers to, which are listed below.
- **Six columns:** Document Type · Document Date · Parties · Amount Claimed · Court · Key Fact.
- **The run** (`29-…-running.png`):
  - "Run this template" → "Confirm and start" → **"Filling 10 of 84"**.
  - Cells fill row by row from grey skeleton bars into answers, each with a citation marker and a status dot.
- **Done** (`30–32`):
  - Every cell is filled. Each answer carries a citation and a green, amber or grey dot.
  - Amber warnings mark weaker answers, and "Not found" is said honestly where a document doesn't state something.
  - The Amount Claimed column lines up Rs. 2,30,00,000 (notice), Rs. 4,60,00,000 (agreement) and Rs. 1,15,00,000 (order, petition, legal notice, statement of account), side by side.

**The 10 added documents:**
- **What they are:** registration endorsement (9 Feb 2023), possession receipt (22 Feb 2023), site photographs at handover, DDA no-objection certificate (6 Apr 2023), statement of account (tranche payments), legal notice (30 Jun 2024), postal acknowledgement (4 Jul 2024), reply to legal notice (29 Jul 2024), petition under Section 9, and written submissions for the Section 9 hearing.
- **Where they come from:** each date and fact comes from the Arora record (the notice's enclosures, the chronology, Clause 9.2, Khasra No. 214/2).
- **Storage:** they exist only in the capture's throwaway browser profile. The app's mock seed in the repo is unchanged. The capture script is `scripts/capture-tabular-review.mjs`.

**In the film, about 5.2 s plus a 1.6 s card** (rebuilt as layered HTML like the other product scenes):
1. The table rises with its 14 document rows, each PDF icon carrying its real name, and the six column heads drop in.
2. The cells fill as skeleton bars resolving into answers, row by row with a 40 ms cell stagger. A small counter, "Filling 23 of 84", ticks along, as in the app. It's a replay of the app's own run.
3. The camera eases along the table. On "Compare", the Amount Claimed column lifts out of the table (Lovio L-C: the highlight becomes the next composition). Its values line up and the differing ones get the clay mark.
4. Hold. No buttons are pressed, and no Approve is shown.

**A quirk in the app's mock seed (not the film):** with the seeded data only (`26-…-arora.png`), the Document Date column picks the wrong fact. For example, the notice shows 22 February 2023, which is its possession date, instead of 14 March 2026. In the capture profile I added each document's own date, so the new captures read correctly. That might be worth fixing in `src/mocks` separately.

## 5. Timing: before and after (≈90 s)

| Beat | Reel (s) | Web (s) | Note |
| --- | --- | --- | --- |
| O1 office (footage) | 1.85 | **1.85** | Kept in full |
| O2 page volume + card | 1.07 | 2.6 | |
| O3 handwritten notes | 1.41 | 1.2 | |
| O4 manual + card | 2.60 | 3.1 | |
| O5 the turn (split) | 2.44 | 3.3 | |
| B1 brand | 5.36 | 3.0 | No tagline; shorter hold |
| P1 one case + card | 1.44 | 2.1 | |
| P2 complex case | 2.32 | 2.0 | |
| P3–P4 documents, conflict | 2.34 | 2.8 | |
| P5 provisions | 1.33 | 1.5 | |
| P6 dates, knot | 2.62 | 2.6 | |
| D1–D2 upload, extract + card | 3.78 | 6.2 | |
| D3–D4 OCR, correction + card | 4.57 | 6.2 | |
| D5–D9 Case Map (map, conflicts, versions, resolve, verify) + card | 5.04 | 9.9 | Conflicts and versions get more than 2× |
| **Tabular review + card (new)** | 0 | **6.4** | |
| D10 timeline + card | 3.36 | 4.5 | |
| D11 Ask + card | 2.74 | 5.2 | |
| D12 Draft + card | 2.13 | 4.8 | |
| D13 Insights + card | 3.22 | 5.0 | |
| D14 Hearing Prep + card | 1.80 | 3.9 | |
| C1 into the laptop (footage) | 1.67 | **1.67** | Kept in full |
| C2 office hold (footage) | 6.16 | **6.16** | Kept in full, with the hand matte |
| C3 wipe | 0.46 | 0.46 | |
| C4 brand end | 3.19 | 3.4 | No tagline |
| **Total** | **62.90** | **≈89.8** | |

Keeping the footage in full and adding the new chapter takes the cut to about 90 s, so the same-length 62.90 s option from revision 1 no longer works without cutting the features back.

## 6. Build notes (after you decide)
- **Separate projects:** a web cut set, e.g. `hyperframes/web-*/`, reuses each section through a time map plus a shared captions module. The reel projects aren't touched.
- **New project for Tabular review:** rebuilt from captures 28–32, in the same art direction as the other product scenes.
- **Website delivery:**
  - H.264 MP4 plus VP9 WebM, no audio.
  - 1440×1000, or 1200 wide for weight.
  - A poster frame.
  - Loop: dissolve back to the start, or hold on the brand.

## 7. Decisions for you
1. **Script:** approve §3 as revised, or tell me which lines to change.
2. **Tabular review:** the six columns and 14 documents as captured, and the Amount Claimed column as the "compare" moment?
3. **Chapter rail:** include it, or leave it out?
4. **Website loop:** dissolve back to the start, or hold on the brand?

## 8. Build log
- **Shared text system:** `web-cut/lib/captions.js` (card → dock, swap, split, chapter rail, film blur under a card, `timeMap`). Each web project copies it into `assets/lib/`.
- **W1 · opening** (`hyperframes/web-opening/`, run.ps1 `w1-*`): web 0–29.03 s (871 frames) ↔ reel 0–24.77 s.
  - The pilot's scene code (`src/pilot.js`, a copy that exports `renderAt` instead of building a timeline) is driven by `src/web.js` through the time map.
  - The office footage plays at its own speed (0–1.88).
  - "Hundreds.", "Manually." and the outline "Timeline." are hidden by CSS; the film is wrapped in `#film` so a card can blur it.
  - Draft: `hyperframes/renders/web/web-opening-draft.mp4`, awaiting feedback.
  - The opening runs about 2.8 s longer than the §5 estimate (full footage, the split and readable card holds), so the whole cut now projects to about 92 s.

## 9. Revision 3: storytelling and text motion (22 Oct, after the user's references)
**References** (the user's downloads, studied frame by frame):
- **Stephan Livera's "Claude, motion designer" reel:** one idea per beat, words slam in with motion blur and overshoot, hard cuts, a viewfinder HUD.
- **Sarvam's "Saaras V4":** whole phrases, large and centred, handing over in place, with key words emphasised.
- **Google's "AI Mode":** a short title, then straight into the product.

**User directions, standing:**
- Whole sentences, large and readable, animated. Never one big word with a small caption.
- Serif only (Newsreader).
- Professional: calm paper grounds only. No full-screen orange or black; clay is an accent (italic key words, full stops).
- Better storytelling: the problem must read as a problem, with stakes. "Checked by hand" alone sounded like a virtue.

**System** (`web-cut/lib/titles.js`, replaces `captions.js`):
- **Title:** a full-bleed paper or vellum ground, cut in hard. A one- or two-line sentence arrives word by word, each word sliding in with a short blur and a gentle overshoot. A later sentence can take its place in the same spot. The ground can split open to reveal the film.
- **Ticker:** inside a visual, a short sentence at the top-left that hands over to the next with the beat.
- **HUD:** corner brackets, plus "LawVriksh · 00 The problem", the chapter index 00–09 and the matter name, in small tracked serif caps.

**Opening script** (W1, 31.13 s):
- Titles:
  - "Every case comes with *hundreds* of pages."
  - "Miss one detail, and the case *shifts*."
  - "What if AI read *every page* for you?" — splits open onto the thread's sweep.
  - "Take *one* real case." → "An arbitration before the *Delhi High Court*."
- Tickers:
  - "Pleadings, orders, agreements," → "and notes in *every* margin."
  - "So every line is read again," → "*by hand*, page after page."
  - "Inside: an agreement, a notice, an order." → "And they *don't agree*." → "Three provisions to track." → "Twelve dates, *out of order*."

**Feature openers** (test, `hyperframes/web-titles-test/`):
- "Upload the case file." → "LawVriksh reads *every page* and pulls out the facts."
- "Conflicting facts surface *on their own*."
- "Compare *every* document, side by side."
- "Walk into the hearing *prepared*."

**Drafts:** `hyperframes/renders/web/web-opening-draft.mp4` (934 frames) and `web-feature-titles-test.mp4` (252 frames), both awaiting feedback.

## 10. Revision 4: everything connected (22 Oct, user direction)
**Directions:**
- Nothing may appear abruptly. Every sentence, section opening and section closing must be connected to the motion before it, one thing triggering the next.
- The mid-film brand moment is removed; the brand closes the film only.

**System** (`web-cut/lib/stream.js`, replaces `titles.js` for the film):
- **One caption stream.** A single sentence object never leaves the frame. It lives in the corner (small, while a visual plays) or at the centre (large, while the film recedes under paper, blur and a 3.5 % pull-back).
- **Morphing.** Moving to the next sentence, the object travels one path between the two places and morphs on the way: old words lift away as new ones resolve along the same motion. The film's recession rides the same curve.
- **Exit.** A sentence can leave along a direction instead, following the visual that takes over.
- **HUD:** ink throughout.

**Opening, W1** (28.33 s, 850 frames; reel 0–24.77, keys in `web-opening/src/web.js`):
| Web (s) | Trigger | Text |
| --- | --- | --- |
| 1.72 | The camera dives into the top sheet; the sentence comes forward out of it | "Every case comes with *hundreds* of pages." |
| 3.60 | The camera cranes up; the sentence shrinks into the corner | "Pleadings, orders, agreements," → "and notes in *every* margin." |
| 6.40 | The margin note settles; the corner sentence grows to the centre and the page recedes | "Miss one detail, and the case *shifts*." (on "shifts" the page behind slides 38 px, then settles back) |
| 8.40 | The page returns and the hops start | "So every line is read again," → "*by hand*, page after page." |
| 10.40 | The last hop lands; the question grows | "What if AI read *every page* for you?" |
| 12.40 | The question sweeps right as the clay thread reads every line, then draws into one point | — |
| 14.60 | Around the point | "Take *one* real case." → "An arbitration before the *Delhi High Court*." |
| 15.60 | Behind the veil, the reel jumps past the removed brand moment to the case seed | — |
| 17.60 | The seed becomes the case folder; the sentence shrinks into the corner | "Inside: an agreement, a notice, an order." → "And they *don't agree*." → "Three provisions to track." → "Twelve dates, *out of order*." |

W1 ends with that corner sentence still on screen, so W2 continues from it.

**Draft:** `hyperframes/renders/web/web-opening-draft.mp4`. The check is clean (no runtime or contrast errors; the 3 layout overlaps are the pilot's own document labels).

## 11. Revision 5: the whole web cut, connected and never repeating (22 Oct, user direction)
**Directions:**
- No back-and-forth: the corner → centre → corner → centre after "Miss one detail" read as repetitive.
- Every turn uses its own animation, yet each must feel meant to connect with the frame before and after it.
- Then render the whole video.

**Build:**
- **Caption stream v2** (`web-cut/lib/stream.js`):
  - **Places:** centre, corner, top and below.
  - **Ins (25):** morph, zoom, from, gather, burst, drop, rise, type, reveal, stream, settle, focus, lift, slide, flip, blur, highlight, count, stamp, unfold, trace, wave, cascade, none.
  - **Outs (10):** morph, lift, into, sweep, drop, split, recede, wipe, strike.
  - **Film recessions (`applyFilm`):** blur, push, rise, sink, pan, veil, shrink, iris.
- **Parts:** each reel section is a web part made by `web-cut/make-web-section.py`:
  - its scene code exports `renderAt`;
  - its one-word title and slab wipes are hidden;
  - its `src/web.js` holds the time map, the segments and the hand-offs.
- **New chapter:** `hyperframes/web-tab/` (Tabular review).
- **Hand-off plates:** `web-cut/make-plate.sh` snapshots the previous part's real last frame without captions. It warms up on t = 0, because a cold first seek can capture before rendering.
- **Hand-off geometry:** `web-cut/measure.mjs` reads geometry a part measures on its own scene, such as part 3's source passage.
- **Render and join:** `web-cut/render-all.sh`.
- **No corner brand mark in any part:** the frame label carries the brand, and the full brand closes the film only.

**The chain** (every turn, its move, and what triggers it):
| Part | Turn | Move | Triggered by |
| --- | --- | --- | --- |
| 1 Opening | "Every case comes with *hundreds* of pages." | zoom out of the sheet | the camera's dive into the top sheet |
| | → "Pleadings, orders, agreements," | morph to the corner | the crane up off the sheet |
| | → "and notes in *every* margin." | lift | the margin note being written |
| | → "Miss one detail, and the case *shifts*." | morph to the centre (page recedes, blur) | the note settling |
| | → melts into the checked line | into the bracketed line (rotated with the page) | the first pencil hop |
| | "What if AI read *every page* for you?" | from: lifts off the last bracket, framed by corner marks (page pushes in) | the last hop landing |
| | → sweeps right | sweep | the clay thread reading every line |
| | "Take *one* real case." | gather out of the clay point (veil) | the thread drawing into one point |
| | → "An arbitration before the *Delhi High Court*." | focus, in place | — |
| | → into the folder's label | into | the point becoming the case folder |
| | "Inside: an agreement, a notice, an order." | burst out of the folder | the folder opening |
| | → "And they *don't agree*." · "Three provisions to track." · "Twelve dates, *out of order*." | slide · flip · settle | the documents, provisions and dates beats |
| 2 Upload, OCR | → falls away; "Upload the case files, and LawVriksh reads *every page*." | drop out / drop in | the PDFs dropping through the line |
| | → "Out come the facts, each *linked* to its page." | rise | the facts opening into tags |
| | "Some pages are *hard* to read." | type (film sinks) | the facts settling |
| | → recedes into the flagged word; "Unclear words are *flagged* for review." | recede / reveal | the flag snapping onto the word |
| | → struck through; "Fix it once. It stays *linked* to the page." | strike / trace | the wrong word deleted, the right one typed |
| | "Every fact, mapped to its *source*." | unfold (scan rises away) | the editor's save |
| 3 Case Map | → its lines part onto the map | split | the map building in the gap |
| | "Conflicts surface on their *own*." · "Two sources disagree on *one* fact." · "Resolve it against the *record*." · "Open the source. *Verify* before relying on it." | stamp · wave · highlight · cascade | the clicks: Conflicts, Version A/B, Frame C, Version B |
| | "Now compare *every* document, side by side." | stream (film irises shut on the source passage) | the passage |
| 4 Tabular review | → rises to caption the table | morph (iris opens from the same passage) | the table under the passage |
| | the run, "Filling n of 84" | — | — |
| | → "Every answer cites its *page*." · "Same question, *every* document." | slide · flip | the Amount Claimed column lifting out |
| | → into the "18 July 2026" cell | into | the camera settling that cell where part 5 lifts its first tag |
| 5 Timeline | "The same dates, now *in order*." · "Each one keeps its *source*." | rise · blur | the date lifting out of the table, the table falling, the tags coming home; the source slip |
| 6 Ask | → sweeps away left | sweep | the timeline sliding off left (not falling) as its rail tips into the prompt box |
| | "Ask the file *anything*, in plain words." · "Answers come back *cited* to the documents." | blur · highlight | the question typing; the answer streaming |
| | "Draft from the *record*." | wave (Ask window pans away left) | the citations settling |
| 7 Draft (Vikram, separate example) | → sweeps away left | sweep | the page sliding in from the right |
| | "Every draft, checked: **61** checks." | count | the checks counting up |
| | "The key points of *any* document," | rise (page shrinks into the paper) | the thread's last hop |
| 8 Insights | → wiped away | wipe | the page growing back |
| | "…without reading *every page*." | highlight | the results arriving |
| 9 Hearing Prep | → "Walk into every hearing *prepared*." | morph corner → below | the viewer and panel carrying over into the brief (the Insights frame recedes, not falls) |
| 10 Office (full footage, own speed) | → recedes into the laptop screen | recede | the page pulling back into the screen |
| | "From hundreds of pages to *one* clear brief." (light type over the office) | rise | the office hold |
| 11 Brand | → wiped away with the footage | wipe | the window light |
| | the mark, the wordmark, the ground line | — | — |

**Output:** `hyperframes/renders/web/lawvriksh-web-cut-silent.mp4`, 1440×1000, 30 fps, no audio. The parts are `renders/web/<part>-silent.mp4`.

**Final render (22 Oct):**
- **File:** `hyperframes/renders/web/lawvriksh-web-cut-silent.mp4`, 2883 frames, 96.1 s, 1440×1000, 30 fps, H.264 CRF 14, no audio.
- **Parts:** 880 + 420 + 318 + 234 + 138 + 168 + 135 + 144 + 102 + 235 + 109 frames.
- **Boundaries:** checked frame by frame; the last frame of each part matches the first frame of the next.
- **Scene wordmarks:** the small LawVriksh wordmarks inside the Hearing Prep scene (its clay corner block) are hidden too, so the brand appears at the end only.

## 12. Revision 6: feature boundaries, readable subtitles, time where it matters (22 Oct, user direction)
**Directions:**
- These are targeted fixes, not a redo. Keep the visual identity and the brisk pace.
- Each new feature must be recognisable, especially OCR review, Tabular review, and Ask → Draft.
  - A feature opens with a centre heading.
  - It then gets a 0.4–0.6 s settled moment before its action starts.
- Reading time counts from when the text is complete.
- **Placement:**
  - After the Delhi introduction, narrative is a bottom-centre subtitle.
  - No narrative top-left.
  - Product labels stay where they are.
  - No sentence turns into product data.
- **Time:** about 5 s Tabular, 7 s Ask and 6 s Draft. The total stays about 96 s.
- **Hearing Prep:** the move to the laptop is one continuous pull back.

**Build:**
- **Subtitle place:** `below` (`lib/stream.js`).
  - Centred, at most 52 px, bottom edge at y 912.
  - It always sits on a low wash: a band 770–1060, so UI above it is not greyed.
- **Subtitle swaps:** the new line waits only 0.2 s, not 0.34 s.
- **`fit` morph:** a heading settles into a subtitle centre on centre, at the subtitle's width.
- **Scenes moved clear of the subtitle:**
  - Timeline rows from y 190, 50 apart. The slip is at y 505, and part 6's rail matches.
  - The Ask film rises 110 px as its window builds.
  - Insights settles at 0.84, top-aligned. Part 9's shells start from that pose.
- **Plates remade:** `d09-exit.png` (from web-tab), `timeline-exit.png` (from web-s4) and `insights-exit.png` (from web-s7).
- **Light preview:** `bash web-cut/render-all.sh preview` writes `renders/web-preview/lawvriksh-web-cut-preview.mp4`.

**Changes by part:**
| Part | Change |
| --- | --- |
| 1 Opening (30.8 s) | "and notes in every margin." reads 2.0 s on the settled note; everything after shifts 1.47 s. From "Inside: …" on, subtitles; the beats are respaced so each reads ≈ 0.8 s or more. |
| 2 Upload, OCR (14.4 s) | The upload line runs 1.2× (was 1.4×). OCR opens with "Review unclear text." typed at the centre over the sunk film. The scan returns as the heading settles into "Unclear words are flagged for your review." The scan holds still 7.9–8.4, then the flag snaps. "Correct the text. Keep its source link." is traced as the correction is typed. |
| 3 Case Map (10.3 s) | Subtitles, each reading ≈ 1 s (one used to be visible < 0.1 s). The map builds at reel pace. Tabular heading: "Compare documents side by side.", irised on the source passage. |
| 4 Tabular (3.5 s; chapter 4.8 s) | Iris opens at 0.3. The table fills in three row groups (0.5 / 0.68 / 0.86) and is complete by 1.1. Amount Claimed, Document Date and Parties are framed at 1.25 / 1.37 / 1.49. The other columns step back and "Not found" under the three goes quiet. The completed comparison holds to 3.5. Removed: "Every answer cites its page.", "Same question, every document.", the sentence shrinking into a cell, and the camera push onto "18 July 2026". |
| 5 Timeline (4.6 s) | The ten dates the table holds lift out of their own Document Date cells; the other two come from below. The table falls; the rows sit higher. |
| 6 Ask (8.13 s; chapter 6.95 s) | Only narrative: "Every answer backed by source citation." (highlight at 2.3; the marker sweeps as the citations land). Brisk typing; the answer and citations hold 3.75–6.95. Then "Create a working draft." ripples in at the centre as the window pans away. |
| 7 Draft (6.1 s; chapter ≈ 6.1 s) | The heading settles into "Start with your instructions." as the Vikram page slides in. The page holds still, then writes. "Review what still needs attention." comes with the checks and "Must fix". |
| 8 Insights (4.1 s) | Shorter hold; settles at 0.84; subtitle. |
| 9 Hearing Prep (3.0 s) | "Prepare for your next hearing." (zoom); the brief and its open review item hold, readable. |
| 10 Office | One eased progress (51.45–52.50) drives the decorations peeling, the brief and panel settling into the app page, the chrome, the page shrinking onto the laptop quad, the footage zoom-out and the paper dissolve. The subtitle recedes into the screen with it. Closing: "From hundreds of pages, to one clear brief." |

**Runtime:** 2892 frames, 96.4 s (was 2883, 96.1 s).

# Section 5 plan — Ask, 41.53–44.27 s (D11)

22 Oct 2026. Follows the approved section 4. Status: CHANGED by the user 22 Oct to **typed and generated**: a pure-motion-graphics prompt box where the saved question types in, then the Ask screen where the saved answer streams. The user left the details to me. DRAFT BUILT (`hyperframes/renders/section-5-draft.mp4`; joined review `review-0-44.27-section-5-draft.mp4`), awaiting feedback. The beats below are the original saved-state plan, kept for reference. Source: `storyboard.md` D11; still `storyboard/renders/d11-ask.png`; reference `screenshots/15-ask-arora-source-answer.png` (the saved Arora Ask session).

## Scope and boundary

- **41.53–44.27 s.** It opens on the reel's 41.528 jump cut and ends where the **locked** Vikram window begins (44.27, "generate legal drafts").
- **Frames at 30 fps:** 1246–1327, i.e. 41.5333–44.2333 s, 82 frames. Frame 1328 (44.2667) is the first of D12. Global reel time, like sections 1–4.
- **Entry:** section 4's last frame: the vertical clay rail with the 12 dates, "Timeline.", and the source slip.

## What is said (reel ASR)

| Time       | Words                               |
| ---------- | ----------------------------------- |
| 41.62      | "You can also"                      |
| 42.18      | "**ask**"                           |
| 42.48      | "**questions** about"               |
| 43.12      | "**documents**,"                    |
| 43.5–44.27 | pause ("generate" follows at 44.18) |

## Shot plan

| Beat                                 | Time        | What happens                                                                                                                                                                                                                                                                                                                                                                                                                                     | Mechanism                                                                                       |
| ------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| **The rail tips**                    | 41.53–41.95 | On the cut, section 4's timeline falls away, but its **clay rail stays and tips horizontal**, swinging down to y ≈ 912. There it becomes the **underline of the Ask composer** (as in `d11`).                                                                                                                                                                                                                                                    | One thread carries across the cut (Harvey H-C); same section-4 plate technique as sections 3→4. |
| **Ask.**                             | 41.70–42.20 | "**Ask.**" rises top-left; it lands on "ask" (42.18). The Ask window rises from below onto the underline: Chat History · Ask/Draft toggle; composer "Ask a legal query" with the Arora matter chip, Deep, Model. The clay arc stone sits top-right; the small 2 : 1 stones at the left margin.                                                                                                                                                   | `d11` layout.                                                                                   |
| **The saved question**               | 42.20–42.45 | The **saved** question appears as a sent bubble: "What is the outstanding amount we are claiming, and is it consistent across the record?" Nothing is typed, sent or streamed.                                                                                                                                                                                                                                                                   | State shown, not run.                                                                           |
| **The saved answer, block by block** | 42.45–43.10 | "Direct answer" sets, then the answer **line by line**: "The record is not consistent. The notice invoking arbitration pleads **Rs. 2,30,00,000** as the principal outstanding, while the Section 9 order records **Rs. 1,15,00,000** as presently due for the interim application. Both figures are traceable to their source. The discrepancy remains unresolved." The two figures take a clay underline as they appear; they echo the stones. | Readable reveal (Lovio L-C), not token streaming.                                               |
| **Citations**                        | 43.00–43.30 | The Citations card slides up with 1 · Amount outstanding, 2 · Amount outstanding, 3 · Total consideration. Marks frame the answer block.                                                                                                                                                                                                                                                                                                         |                                                                                                 |
| **Hold**                             | 43.10–44.05 | **≈1.2 s readable hold on the two figures**, with ≤1 % drift.                                                                                                                                                                                                                                                                                                                                                                                    |                                                                                                 |
| **Hand-off**                         | 44.05–44.27 | A **sand** slab sweeps in from the right and covers the frame on 44.27. Sand marks the Vikram context change; the next section opens as it crosses with "Saved draft · Vikram bail application" (locked D12).                                                                                                                                                                                                                                    | Same slab wipe as the charcoal one at 28.56 and 33.13.                                          |

## Honesty

- The saved Arora Ask session only: no typing, no send, no streaming, no live model.
- Both amounts stay unresolved, exactly as the saved answer says.
- The capture also has "Why the two differ" and "What to do" sections. `d11` shows only the Direct answer and Citations; I keep to `d11` so it reads in 2.7 s.

## Build

- **New composition** `hyperframes/section-5/` (T0 = 41.5333, frame 1246), same contract; `run.ps1` tasks `s5-*`.
- **Opening plate:** a lossless snapshot of section 4's last frame, as in section 4. The rail is redrawn live on top of it so it can tip.
- **The Ask window** is rebuilt as layered HTML/CSS from the `d11` still: header, question bubble, answer, citations, composer. Every line and figure is its own element. No Three.js.
- **Joined review:** 0.00–44.27, with the reel audio trimmed exactly.

## Decisions for you

1. **Ask as the rebuilt product view (`d11`, proposed) or as pure motion graphics** like the Chronology? It is a product feature, which is why `d11` shows the real Ask screen.
2. **Sand slab hand-off into Vikram at 44.27:** keep (proposed)?
3. **Straight to motion** (proposed; `d11` is already an approved still)?

## Constraints carried

- Saved session only; nothing is asked live.
- Arora context; the Vikram context starts only after 44.27 (sand slab).
- Original audio authoritative; no retime; Vikram window 44.27–46.40 stays locked.
- No Higgsfield spend.

# LawVriksh influencer reel, v3: edit and sound plan

**Status:** plan only, for your approval. Nothing has been edited, installed or rendered.

**Output:** a 9:16 Instagram reel, 1080×1920, 30 fps, with voice, music and sound design. About 79 s long.

**Analysis files:** everything measured lives in `reel-v3/analysis/`:
- `ref-sheet-01…05.png`: the reference reel at 2 frames per second.
- `*-words.json`: word timings for all three voices.
- `*-onsets.json`: audio onsets, tempo and level.
- `ref-spec-*.png`: spectrograms of the reference audio.

---

## 1. What the reference reel ("PHP's scariest day ever") actually does

| Measure | Reference | Codex v2 (ours) |
|---|---|---|
| Length | 73.7 s | 87.3 s |
| Picture changes | 48 cuts, one every 1.5 s on average | about 12 layout changes; the face stays on top the whole time |
| Face on screen | about 15% of the reel (0–3 s, 8.5–9.5 s, 34–36 s, 70.5–73.6 s) | about 100% |
| Speech gaps | 0.1–0.3 s; the voice never stops | 0.8 s pauses where the picture freezes |
| Music | a continuous dark, sub-heavy bed (energy at 20–100 Hz), loudest under the hook | none |
| SFX | whooshes and hits on about a third of the cuts (15 of 48), not on every one | none |
| Captions | 1–3 words at a time, white bold, at about 70–74% of frame height (in the panel seam during the split hook) | none in the speech; one-word titles ("Manually.", "Verify.") |

### How the reference builds energy
1. **The hook is a split, then the screen opens up.** For 0–3 s a title graphic sits on top and the creator talks below. From 3 s the screen goes fully to visuals.
2. **The voice carries the story; the picture illustrates almost every phrase.** Whatever is named appears: "the NSA" shows the NSA post, "the FBI" its notice, "Japan's PM" news footage, "14 years" a year grid counting up.
3. **Five layout modes rotate:**
   - full-screen face;
   - split (graphic over face);
   - a full-screen document or screenshot with a word-by-word highlight sweep;
   - full-screen custom motion graphics synced word by word (the attack diagram, the radial NSA/FBI/UK/EU/Japan diagram, the PHP version checklist);
   - stock footage.
4. **The face returns only for turns in the story:** "Here's exactly what's going on", "everyone keeps quiet until…", and the closing line.
5. **Punch cards** (big serif "THEY GOT TO WORK", "14 years!") land on a hit about every 20 s.
6. **Documents are never static.** The camera slowly pushes in while a highlight box sweeps the key words in time with the voice.
7. **Sound:**
   - the bed never drops out;
   - hits mark section changes;
   - whooshes ride the bigger moves;
   - plain cuts are often silent.
   - Accent, don't narrate.

### What this means for us
- The permanent face-on-top/graphic-below layout is the main problem. It should become one of several modes.
- Pauses should not freeze the picture. When she stops talking, the screen belongs to a graphic and the music fills the space.

---

## 2. Inputs and how the two takes sync

| Take | File | Picture | Script |
|---|---|---|---|
| **P** (old, portrait) | `VID-20261020-WA0003.mp4` | 464×832, warm wall, framed for vertical | old script, 62.9 s |
| **L** (new, landscape) | `IMG_6187.MP4` | 960×540 after rotation, wardrobe background | new script, 84.06 s |

### Sentence-by-sentence sync

Times are word-level ASR, in seconds.

| # | Sentence | P | L | Use |
|---|---|---|---|---|
| S1 | Lawyers ke paas hundreds of pages… verify | 0.00–5.40 | 0.00–4.68 | **P** |
| S2 | What if AI ye kaam thoda easy bana de? | 6.42–8.50 | 6.02–8.06 | **P** |
| S3 | Recently I came across… LawVriksh… kaafi easy hai | 9.20–14.32 | 8.98–14.48 | **P** |
| S4 | Maan lo aap ek lawyer ho… complex case | 14.70–17.28 | 15.04–17.60 | **P** |
| S5 | Multiple documents, conflicting facts, legal provisions… verify | 18.34–23.98 (ends "timeline manage") | 18.64–23.44 | **L** (new wording) |
| S6 | Aapko LawVriksh me apna document upload karna hai | 24.66–28.48 | 24.84–27.26 | **L** |
| S7 | AI important facts extract… unclear text… mapping | 29.48–31.96 | 27.26–33.22 | **L** |
| S8 | Agar… conflicting fact… compare them, verify the sources… timeline | 33.14–40.52 | 34.36–41.50 | **L** |
| S9 | Aur upcoming hearings ke liye… arguments better prepare | none | 42.80–55.46 | **L** (L only) |
| S10 | Ask questions… legal drafts… without manually reading every single page | 41.66–51.08 | 56.66–65.68 | **L** |
| S11 | As technology evolves, AI sirf coding tak limited nahi hai | 51.40–54.54 | 66.08–69.08 | **P** |
| S12 | It's changing how different professions work… law is one of them | 54.54–59.20 | 69.90–74.52 | **P** |
| S13 | And honestly… we are just getting started | 59.66–62.54 | 74.96–78.04 | **P** |
| S14 | Search LawVriksh on Google… comment LAW… DM | none | 78.26–83.76 | **L** (L only) |

### Take rules
- **Whole sentences only.** A sentence is taken whole, picture and voice together from the same take, so lips always match. Takes switch only at sentence breaks: P → L after S4, L → P before S11, P → L before S14.
- **Which take where:**
  - Full-screen face shots come from **P**, the only take framed for vertical.
  - The split panel uses whichever take the sentence comes from: P cropped to the face, or L cropped and shifted right so she's centred.
- **Matching the two voices:**
  - same loudness;
  - a matched EQ curve;
  - light noise reduction;
  - 20 ms crossfades at the take switches;
  - the music bed under every join.
  - The rooms sound different, and the bed hides that.

---

## 3. Layout system (1080×1920)

| Mode | What fills the frame | When |
|---|---|---|
| **FACE** | P full screen, slight slow push (1.00→1.05), occasional punch-in (1.0→1.12 cut) on a stressed word | hook, story turns, closing |
| **SPLIT** | graphic on top (1080×1000), face below (1080×920); the seam has a thin paper rule, not a hard bar | explaining while she's in frame |
| **GRAPHIC** | the motion graphic full screen, vertical: a virtual camera on the 2× scene, or a vertical rebuild | most feature beats; every pause |
| **PUNCH** | big Newsreader word card on the beat (1–2 words), paper ground | 4 times max |
| **B-ROLL** | the existing lawyer-office footage, full screen | "maan lo aap ek lawyer ho", "different professions" |

### Safe zones
Instagram covers roughly the bottom 330 px with caption and audio UI, and the right 140 px with buttons.
- **Captions:** between y 1000 and 1480.
- **Key UI:** never in the bottom 330 px or the right 140 px.

### Shot transitions
- **Hard cuts on the beat:** about 70% of changes. Some cuts get an accent sound; most are silent.
- **Push or slide** (graphic slides up over the face and becomes the split): at mode changes, with a whoosh.
- **Zoom-through** (the camera dives into a UI element and lands in the next scene): at section changes, with a whoosh into a hit.
- **No glitch, no colour flashes, no full-screen orange or black.** The standing brand direction applies.

---

## 4. Shot list

Output times in seconds (O). Sentence gaps are tightened to about 0.3 s. Your four pause points stay as **0.7 s beat moments** (rounded so the next sentence lands on a downbeat). During each one, the screen is a full graphic finishing its move and the music hits, so the face never freezes.

| # | O | Mode | Picture | Spoken (caption source) | Sound |
|---|---|---|---|---|---|
| 1 | 0.00–0.95 | FACE (P) | she opens straight to camera, slight punch-in | Lawyers ke paas | sub drop + impact on frame 1; music starts at full |
| 2 | 0.95–2.35 | GRAPHIC | the opening's camera dive into the page stacks: "hundreds of pages" | hundreds of pages ke documents | whoosh into the dive |
| 3 | 2.35–3.45 | GRAPHIC | the margin note writing itself | handwritten notes | pencil scratch |
| 4 | 3.45–5.14 | SPLIT | top: the pencil bracket ticking line after line; bottom: face | aur ek-ek detail manually verify karni padti hai | ticks, one per hop, rising |
| 5 | 5.44–7.52 | FACE (P) | slow push-in for the question | What if AI ye kaam thoda easy bana de? | riser starts, music thins |
| 6 | 7.87–10.0 | FACE (P) | | Recently I came across this platform called | riser peaks |
| 7 | 10.0–11.3 | PUNCH/brand | LawVriksh tree mark and wordmark set (the approved brand build, vertical) on "LawVriksh" | LawVriksh | **the one big impact**; the music drops into the main groove |
| 8 | 11.3–12.99 | SPLIT | top: a 3-flash product glimpse (map, timeline, Ask, 0.5 s each); bottom: face | aur honestly iska concept kaafi easy hai | pop per flash |
| 9 | 13.29–14.4 | B-ROLL | the lawyer at her desk (opening footage) | Maan lo aap ek lawyer ho | — |
| 10 | 14.4–15.87 | GRAPHIC | the case folder ARB.P. 428/2026 drops in | aur aapko ek complex case handle karna hai | soft thud on landing |
| 11 | 16.17–17.4 | GRAPHIC | the documents fan out of the folder | Multiple documents | 3 paper pops, pitch rising |
| 12 | 17.4–18.5 | GRAPHIC | the two amounts collide (Rs 2,30,00,000 vs 1,15,00,000) | conflicting facts | low tension hit |
| 13 | 18.5–19.6 | GRAPHIC | the Section 21 / 11 / 9 tags slap down | legal provisions | 3 clicks |
| 14 | 19.6–20.97 | SPLIT | top: twelve dates out of order (the knot); bottom: face | aur ek-ek detail manually verify karni padti hai | — |
| 15 | 21.27–23.69 | SPLIT | top: PDFs drop through the clay line (upload); bottom: face | Aapko LawVriksh me apna document upload karna hai | whoosh + drop |
| 16 | 23.69–25.5 | GRAPHIC | facts come off the processing line as tags | AI important facts extract karega | pops, rising in key |
| 17 | 25.5–27.3 | GRAPHIC | OCR scan, vertical crop: the flag snaps on the unclear word, a marker sweeps it | unclear text highlight karega | marker swipe + blip |
| 18 | 27.3–29.01 | GRAPHIC | the Case Map builds node by node, vertical crop | aur pure case ki mapping banayega | clicks per node |
| ⏸ 1 | 29.01–29.71 | GRAPHIC | the map completes, the camera pulls back to the whole map | — | music hit + short swell (your pause 1) |
| 19 | 29.71–31.6 | SPLIT | top: Conflict panel, Version A / B; bottom: face | Agar different documents me conflicting fact hai | — |
| 20 | 31.6–33.0 | GRAPHIC | **Tabular review**: the Amount Claimed column framed across documents | toh you can compare them | swish across the columns |
| 21 | 33.0–34.4 | GRAPHIC | open source passage; the Verify fact panel (never pressed) | verify the sources | click + blip |
| 22 | 34.4–36.79 | GRAPHIC | **vertical timeline**: the dates lift and stack in order (native vertical) | aur pure case ki timeline aapko ek hi jagah dikh jayegi | tick per date, rising |
| ⏸ 2 | 36.79–37.49 | GRAPHIC | the timeline settles; the selected event opens its source slip | — | chime in key (your pause 2) |
| 23 | 37.49–39.2 | SPLIT | top: Hearing Prep brief card sets; bottom: face | Aur upcoming hearings ke liye iska hearing preparation features | new music section starts |
| 24 | 39.2–41.3 | GRAPHIC | previous order card (Codex's extended Hearing scene) | previous records | page whoosh |
| 25 | 41.3–43.2 | GRAPHIC | facts and developments cards stack into the brief | important facts, aur case developments | pops |
| 26 | 43.2–45.4 | SPLIT | top: Preparation Review, NEEDS ATTENTION pulses; bottom: face | ko organize karne me help karta hai, jisse lawyers apne hearings | soft alert blip |
| 27 | 45.4–49.99 | GRAPHIC | argument cards line up under the brief; the open review item stays open | aur arguments better way me prepare kar sakte hain | confirm on the last card |
| ⏸ 3 | 49.99–50.69 | GRAPHIC | the brief zooms through into the Ask composer | — | whoosh + hit (your pause 3) |
| 28 | 50.69–52.9 | GRAPHIC | Ask: the question types in a big prompt box (vertical crop) | You can also ask questions about documents | keystrokes |
| 29 | 52.9–53.6 | GRAPHIC | the answer and citations land | — | chime |
| 30 | 53.6–55.0 | GRAPHIC | the Vikram draft writes itself (labelled as a separate example) | generate legal drafts | soft typing bed |
| 31 | 55.0–57.5 | SPLIT | top: Insights results arrive; bottom: face | you can also identify important points | pops, rising |
| 32 | 57.5–59.71 | GRAPHIC | the Insights document: highlights sweep, the page counter flicks past | without manually reading every single page | page flicks |
| ⏸ 4 | 59.71–60.41 | GRAPHIC | everything recedes to the paper | — | music drops to the pad only (your pause 4) |
| 33 | 60.41–63.55 | FACE (P) | slow push, calmer | As technology evolves, AI sirf coding tak limited nahi hai | pad + light pulse |
| 34 | 63.85–66.3 | B-ROLL | the lawyer's laptop with the LawVriksh brief on screen (the pull back, reversed) | It's changing how different professions work | — |
| 35 | 66.3–68.51 | FACE (P) | | aur law is one of them | drums return |
| 36 | 68.81–71.69 | FACE (P) | punch-in on "getting started" | And honestly, I think we are just getting started | riser into the CTA |
| 37 | 71.99–74.3 | SPLIT | top: a search box types "LawVriksh" → result card; bottom: face (L) | Search LawVriksh on Google to find out more | keystrokes + click |
| 38 | 74.3–77.49 | SPLIT | top: a comment "LAW" pops → DM bubble arrives; bottom: face | aur comment LAW to get a DM with more details | pop + notification blip |
| 39 | 77.49–79.0 | GRAPHIC | the brand end card (section 10's brand hold) | — | music button / final chord |

**Totals:**
- about 39 shots in 79 s, one change every 2.0 s;
- face on screen about 40% (FACE plus SPLIT);
- face full screen about 20%.

**Exact cut points:** set from word timings, frame-accurate, in `edl.json`. All picture and sound read the same file, so nothing can drift.

---

## 5. Graphics: making the 1440×1000 scenes work vertically

1. **2× masters.**
   - **What:** re-render every scene used above from the existing HyperFrames sources at 2880×2000, with all captions and titles hidden (the web cut's caption-free renders plus the reel's scenes).
   - **Why:** a virtual camera can then crop vertical windows (about 1040×1850 of the 2× master) and push in without going soft.
2. **Virtual camera per shot.**
   - **What:** each GRAPHIC shot sets a start and end crop window on the element that matters (the flagged word, the Amount column, the answer), plus a slow push.
   - **Why:** that's how the reference treats every screenshot.
3. **Native vertical rebuilds**, where a crop can't work:
   - the hook page dive (a portrait camera path);
   - the LawVriksh brand set;
   - the timeline (it's naturally vertical: rows down the screen);
   - the CTA search box and comment → DM cards (new, in the brand style);
   - the end card.
4. **Reuse as-is:**
   - Codex's extended Hearing Prep scene (`reel-reshoot/hearing/`);
   - the web cut's Tabular review;
   - the lawyer-office footage and the laptop pull back.
5. **Data rules kept:**
   - Arora, Vikram and the Arif Jafar scan stay separate and labelled.
   - 28 Oct 2026 stays presentation-only.
   - Verify fact is never pressed.
   - The open review item stays open.

---

## 6. Captions

### Accuracy
1. **Script:** your Hinglish script, word for word, in Roman script. It is not the ASR text, which translated it.
2. **Timings:** force-aligned to each take. Whisper is run with your script as its prompt, then each word is matched back to the script.
3. **Check:** every phrase is spot-checked against the audio.

### Style
- **Grouping:** 1–3 words on screen at a time.
- **Active word:** clay (#c4562e) with a small scale pop. Keywords (LawVriksh, hearing, timeline, drafts…) stay clay.
- **Font:** see the decisions below.

### Placement
Captions follow the influencer, as you asked:
- **SPLIT:** in her panel, just under the seam (y ≈ 1040–1120), over her.
- **FACE:** at about 70% height (y ≈ 1330), over her chest, clear of the face.
- **GRAPHIC / B-ROLL:** at y ≈ 1330 on a soft paper pill so they read over busy UI.

### CTA
No extra CTA text card, as you told Codex. The spoken CTA gets the same running captions as everything else.

---

## 7. Sound design

### Music
- **The track:** one track, 95–110 BPM, cinematic-tech, with a sub-heavy intro, a clear drop, a breakdown and an outro. It's edited (cut on bars, not stretched) so its sections land on:
  - the hook (0.0);
  - the LawVriksh drop (10.0);
  - the Hearing Prep section change (37.5);
  - the breakdown at "As technology evolves" (59.7–66.3);
  - the lift into the CTA (71.7);
  - the end button (77.5–79.0).
- **Level:** under the voice at about −22 LUFS, ducked about 8 dB while she speaks and opening up in the beat moments.

### SFX library
- **Base:** the CC0 library from [coldframe's sound-design skill](https://github.com/Razee4315/coldframe). It has 37 sounds across 17 roles (click, tick, key, pop, drop, confirm, whoosh, impact…) from Kenney and `@remotion/sfx`, all CC0, so they're safe to commit.
- **Engine:** your skill's procedural engine (`sfx/synth.py`, `mix.py`, `loudness.py`, `cues/`) isn't public as a repo. I'd build its small core under `motion-demo/sfx/` from the skill's spec (stdlib Python):
  - risers;
  - sub drops;
  - in-key chimes;
  - keystroke runs;
  - the cue sheet that reads `edl.json`.
- **Rules from the skill and the reference:**
  - **One of each per reel:** one big impact (the LawVriksh drop) and one big riser (into it).
  - **Accents:** sounds go on about a third of the cuts.
  - **Tonal sounds:** every one in the music's key, rising with progress.
  - **Panning:** sounds pan with their position on screen.
  - **Gains:** hero 0.25–0.35, supporting 0.08–0.2.

### Voice
For both takes:
- high-pass at 80 Hz;
- gentle noise reduction;
- an EQ match of L to P;
- light compression and de-essing;
- level-matched to sit about 8 dB above the bed.

### Master
- **Loudness:** −14 LUFS integrated, true peak ≤ −1 dBTP, measured on the final MP4 with ffmpeg `loudnorm`/`ebur128`.
- **Instagram:** re-encodes, so the mix keeps 1 dB of headroom.

---

## 8. Build order

1. `edl.json`: shot list, take and source times, crops, captions, beats. Generated from the word timings, then hand-tuned.
2. Voice assembly: an audio-only check of the spoken edit, so the pacing can be judged before any picture.
3. Graphics: the 2× masters and the vertical rebuilds (HyperFrames).
4. The reel composition: a new 1080×1920 HyperFrames project `reel-v3/` that reads `edl.json`. It holds the takes, crops, graphics, captions and transitions.
5. Sound: copy the SFX library in, build the engine, write the cue sheet from `edl.json`, edit the music, mix and master.
6. A light preview for your review. Then fixes, then the final export (MP4 H.264 high quality + AAC 320 k).

### Checks before you see it
- lips in sync at every take switch;
- captions vs audio within 1 frame;
- the safe zones on an Instagram overlay;
- loudness and true peak;
- every transition reviewed at normal speed;
- a frame-difference scan for accidental jump cuts.

---

## 9. Decisions needed from you

1. **Original footage.** Both files are compressed copies: P is 464×832 and L is 960×540. For full-screen face shots, P has to be enlarged 2.3×, so it will look soft. If you have the phone originals (likely 1080p or 4K), the face shots will be sharp. This matters most for the hook.
2. **Music.** The options:
   - (a) I shortlist 3 tracks from Pixabay Music or the YouTube Audio Library (free, no attribution) and you pick;
   - (b) you give me a track you own;
   - (c) a generated track (paid; I'd show the cost first).
   - Instagram's trending audio can't be baked in. It's added in the app, and it would fight the voice.
3. **Caption font.** Newsreader serif (the brand) in semibold, or a bold sans (Figtree, the app's UI font). The sans reads faster at phone size, like the reference, but it breaks the "serif only" rule from the web cut.
4. **Your four pauses.** I've kept them at 0.7 s with a graphic on screen and a music hit, not a frozen face. Say if you'd rather they go entirely, like the reference.

---

## 10. Decisions and build notes (27 Oct, after approval)

### Decisions
- **Footage:** use the copies supplied (P 464×832, L 960×540). Both are upscaled once with lanczos and light sharpening (`media/take-*.mp4`).
- **Music:** three free tracks shortlisted from Pixabay; you pick one. Until then, previews carry voice + SFX only.
- **Captions:** Figtree ExtraBold, white with a dark stroke; the spoken word sits in a clay pill.
- **Pauses:** your four 0.7 s positions are dropped. Speech is nearly continuous, like the reference, with three deliberate beats:
  - 0.6 s after "What if AI ye kaam thoda easy bana de?" (the question lands; the riser carries into "LawVriksh");
  - 0.5 s into Hearing Prep;
  - 0.75 s before "As technology evolves" (a chime, then the face).
  - Every other silence over 0.3 s closes to 0.18 s (reel-style jump cuts).

### Timing correction
Whisper's word times drift by up to 1 s. The real silences, measured from the audio level, are short: she speaks about as densely as the reference creator (2.7 words a second against 2.4). So the edit is **85.4 s**, not 79 s.
- **Sentence boundaries:** snapped to the real silences.
- **Word times:** spread over where speech actually is in the audio.

### Build
| Step | File | Output |
|---|---|---|
| Voice edit and word timeline | `build_edl.py` | `edl.json`, `build/voice-raw.wav` |
| Shot list (40 shots; cuts anchored to words) | `shots.py` → `build_shots.py` | `edl.json` shots, `scenes/*/strip.json` |
| Scene projects (web-cut parts behind a vertical camera) | `make_scenes.py`, `render-scenes.sh` | `hyperframes/reel-<scene>/`, `build/strips/*.mp4` |
| New CTA scene | `hyperframes/reel-cta/` | — |
| 9:16 assembly (clips, settles, punches, captions) | `build_assembly.py` | `hyperframes/reel-v3-assembly/` |
| Sound engine (stdlib, built from the skill's spec) and cue sheet | `motion-demo/sfx/`, `sfx/cues/reel_v3.py` | — |
| CC0 sound library | coldframe's `sfx/library/` (licence file kept) | — |
| Final soundtrack (voice chain + music ducking + SFX; −14 LUFS, ≤ −1 dBTP) | `build_mix.py` | — |

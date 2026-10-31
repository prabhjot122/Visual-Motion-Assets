# Reel V3 audio case study

User evidence, 31 October 2026: V3 is the reel they used; it also performed sound design and obtained/extracted background music autonomously. This correction is part of the handoff, not an inference from old 'music pending' plan text.

## What the current source verifies

- `reel-v3/music/` in the original working tree contains four local MP3 candidates: `1-code-unknown.mp3`, `2-exit-the-simulation.mp3`, `3-the-technology-corporate.mp3`, `4-downtempo-explainer.mp3`. These are excluded from this public package pending per-track distribution rights; source hashes/properties are in music-source-index.json.
- The historical cue sheet names **Corporate Lofi Downtempo Explainer**, alex-morgan / Pixabay, and sets C major / 92 BPM in its comment. This is source attribution as recorded by that project, not an independently verified license, musical analysis or proof of the exact final acquisition command.
- [build_mix.py](../archive/original-motion-demo/reel-v3/build_mix.py) accepts a local music file and offset, shapes a breakdown/fade, ducks the music with a voice sidechain, combines the SFX stem and voice, and measures/master-normalises with FFmpeg.
- The voice chain includes high-pass, presence EQ, compression, de-essing and levelling. The code comments refer to earlier DeepFilterNet cleaning, but that cleaning step is not independently reconstructed here.
- [reel_v3.py](../archive/original-motion-demo/sfx/cues/reel_v3.py) derives cues from shot and word timing, mixes recorded samples with generated effects, pans cues and chooses a tonal progression. Cue-specific numbers and key belong to V3.
- The original build contains voice-raw.wav, voice.wav, sfx-stem.wav, premaster.wav and soundtrack.wav. Those media caches/private narration are excluded; the original sources remain untouched.
- The shipped V3 share export has AAC stereo audio at 48 kHz. Its words, music and SFX remain an example mix, not separately licensed library stems.

## Evidence boundary

No music-download script, exact track source URL/license receipt, logged final mixer invocation or source-separation command was found in the targeted source files. Do not fill that gap by inventing a tool, claiming the music was isolated from the reference reel, asserting all candidates are CC0, or treating an early 'music not picked' note as current reality. The user's observation establishes the desired autonomous audio workflow; the preserved code establishes the concrete mixing/SFX mechanisms.

## Reusable toolkit and command

From `archive/original-motion-demo/`:

```sh
python -B -m sfx --list
```

This lists the existing generator vocabulary without creating media. A cue sheet provides TIMELINE, OUT, optional TARGET_LUFS and score(mix, tl); the existing module loads that timeline, schedules events and writes a stem. For a new project, use its own timeline/output paths and sources. Do not run the old V3 cue/mixer to manufacture a new project's soundtrack.

For file-specific history use the archive; for future policy use [music-and-sfx.md](music-and-sfx.md). Actual listening/full-film review has not been performed as part of this library curation.

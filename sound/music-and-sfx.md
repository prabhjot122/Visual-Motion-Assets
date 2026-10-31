# Sound is part of the creative work

The user specifically highlighted that Reel V3 used sound design and that its agent obtained/extracted background music itself. Future reel agents should own the soundtrack task alongside the visuals; a supplied voiceover does not mean the user must also hand over a finished music/SFX package.

Within the project's budget and sourcing authority, the agent should find suitable music, obtain authorized audio, design the effects, synchronise cues and mix the result. Do not silently deliver a silent graphics sequence or a voice-only edit when the brief calls for a finished sounding reel. See [V3 evidence](v3-audio-case-study.md).

## Music acquisition and extraction

1. Decide the musical role from the script, pace, audience and emotion. Evaluate candidates against voice intelligibility and the visual rhythm, not just the opening seconds.
2. Use supplied licensed tracks, sources whose terms permit the intended use, or authorized generated music. Record track title, creator, exact source URL, acquisition date, terms/license evidence, attribution and any distribution limits. 'Free to download' is not enough to establish permitted use.
3. Select and obtain a suitable track autonomously when allowed. Do not require the user to choose every track unless their brief asks for that checkpoint. Do not assume purchase or paid generation authority.
4. If an authorized supplied video contains the required audio, extracting its audio track is different from isolating its background music. A simple audio demux also carries any speech/SFX in that track. Use source separation only if needed, available and authorized; inspect artifacts and retain provenance. Do not claim V3 used a separation tool when the evidence only shows local music candidates and a mixing pipeline.
5. Never rip a reference ad's soundtrack merely because its pacing is liked. Learn the role of its sound; choose or create audio whose rights fit the new project.

Music is a creative input the agent can acquire, not a mandatory missing user recording. Missing commercial-use authority is a separate issue from a missing file. If no suitable authorized source is available, record that exact limitation rather than claiming the final mix is complete.

## Sound design

Create a cue sheet from the actual scene/event timeline and speech anchors. Distinguish transition whooshes, impacts/risers, tactile paper/writing, UI clicks/typing, confirmation tones and musical accents. Use silence and variation deliberately; not every cut needs a whoosh. Main accents should support the hierarchy rather than repeatedly compete for attention.

Use the [existing deterministic generators and licensed sample library](../archive/original-motion-demo/sfx/) as a starting toolkit. Its [sample notices](../archive/original-motion-demo/sfx/library/LICENSE.md) identify the historical sources. [V3's cue sheet](../archive/original-motion-demo/sfx/cues/reel_v3.py) shows shot/word-derived cues, tonal progressions, spatial panning and scene-to-sound relationships. Copy its method, not the old shot numbers or key.

## Voice, mix and delivery

Clean and level supplied narration conservatively, preserving words and intended character. Separate voice, music and SFX stems. Shape music sections and accents to the new narrative; duck beneath speech with sensible attack/release and check the result, rather than assuming a constant gain offset works for every recording.

Choose distribution-appropriate loudness, peak headroom, channel layout and sample rate for the current brief. V3's -14 LUFS targets and 48 kHz mix are historical parameters, not universal platform requirements. Measure final output and check dialogue intelligibility, pumps, distortion, clipped transients and extraction artifacts. State if listening was unavailable; numerical checks do not substitute for it.

Deliver the agreed final audiovisual file, cue sheet, source/license record, editable mix recipe and any requested stems. Keep unlicensed source candidates and private narration outside public commits. Do not reuse a completed example's soundtrack as if it were a standalone licensed music asset.

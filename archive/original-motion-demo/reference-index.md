# Technical reference index

Source files are copied byte-for-byte under `media/originals/`; SHA256, source paths and full stream metadata are in `media-spec.json` and `phase3-evidence/*-ffprobe.json`. These references are for inspection, not assets to incorporate into the LawVriksh output. Their original soundtracks, logos and watermarks remain in reference files only.

| Reference       | Measured source                                           | Overview                                                                                              | Transition samples                                                                                                   |
| --------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Harvey II       | 60.041667 s, 1280×720, 24 fps, AAC stereo 44.1 kHz        | [Contact sheet](references/harvey-reference-contact-sheet.jpg), uniform 5 s sampling including 60 s   | [Transition sheet](references/harvey-reference-transition-sheet.jpg); PNGs at 17, 18, 19, 20 s and 56, 57, 58, 59 s  |
| Lovio           | 53.000000 s, 1920×1080, 30 fps, AAC stereo 44.1 kHz       | [Contact sheet](references/lovio-reference-contact-sheet.jpg), uniform 5 s sampling through 50 s      | [Transition sheet](references/lovio-reference-transition-sheet.jpg); PNGs at 6, 7, 8, 9 s and 13.5, 14, 14.5, 15.5 s |
| Influencer reel | 62.906667 s, 464×832, nominal 30 fps; original AAC stereo | [Technical source overview](references/influencer-reel-contact-sheet.jpg), 0/10/20/30/40/50/60/62.5 s | No creative cut or transition chosen                                                                                 |

Observed windows are indexed for retrieval only:

- Harvey 17–20 s: geometric slabs give way to a product view. Harvey 56–59 s: cube/object to the brand mark.
- Lovio 6–9 s: environmental prompt view to a word and brand mark. Lovio 13.5–15.5 s: device view to person and split layout.

These descriptions are not instructions to copy those compositions or select them for LawVriksh. The approved direction remains the restrained editorial treatment and product clarity recorded in `project-brief.md`. Final choreography is Phase 4 work.

`references/frame-index.json` records every overview frame's source timestamp and path. `references/transition-index.json` records each selected full-resolution transition frame. Contact sheets are downscaled derivatives with timestamp labels; the original videos and selected PNGs are preserved. Extraction uses FFmpeg source-time seeking; rerunning the scripts skips already extracted frames, avoiding duplicate extraction.

Reproduce from the repository root:

```powershell
python motion-demo/scripts/prepare-media.py
python motion-demo/scripts/extract-reference-transitions.py
```

The preparation script needs Python/Pillow and FFmpeg/ffprobe on PATH. It checks copied originals against source hashes and does not transcode them. Timing is source seconds, not final-video timecode.

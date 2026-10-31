# LawVriksh Visual / Motion Assets

A reusable creative library for autonomous agents producing LawVriksh reels, motion graphics, static posts and carousels. Start with [START-HERE.md](START-HERE.md), not the historical film plans.

The user identified **Reel V3 as the reel they actually used**, and rejected the earlier compositor result. Frame C remains the approved appearance. New work is **script + voiceover led, with no influencer by default**. A historical person's layout, old timeline or particular case is never a template requirement.

## Library

| Location | Purpose |
|---|---|
| [Brand](brand/visual-language.md) | Type, colour, materials, lighting, marks and portable local assets |
| [Motion](motion/principles.md) | Connected choreography, pacing, sound and reference mechanisms |
| [Sound](sound/music-and-sfx.md) | Autonomous music sourcing/extraction within authority, SFX, mixing and V3 audio evidence |
| [Formats](formats/README.md) | Voiceover reels, static posts, carousels and website films |
| [Examples](examples/README.md) | Annotated V3, Frame C, website film and rejected approaches |
| [Templates](templates/project-brief.md) | Brief, storyboard, quality review and learning record |
| [Projects](projects/README.md) | Isolated new assignments; no new film has been started |
| [Historical archive](archive/README.md) | Selected original sources; not standing instructions |
| [Rights and provenance](ASSET-RIGHTS.md) | Asset categories, source hashes, missing media and reuse limits |

## Quick start

Give the agent [the reusable starting instruction](templates/agent-starting-prompt.md), a script, voiceover and project brief. It reads the brand and motion guidance, examines V3 and the references, then develops a new visual narrative for that assignment. It must distinguish source evidence, user preferences and its own creative choices.

Offline style preview, from the repository root:

```sh
python -m http.server 3160 --bind 127.0.0.1
```

Open `http://127.0.0.1:3160/examples/frame-c/frame-c.html`. It uses bundled fonts and textures. Original source files remain in the archive; this preview is an explicitly adapted, local-font copy.

Validate the package:

```sh
python scripts/validate-library.py
```

This repository contains no credentials, raw influencer takes, dependency installs or full old-film build cache. Representative finished previews do contain the historical influencer. They are examples, never a requirement to include a person in new work. No blanket open-source license is asserted for all assets.

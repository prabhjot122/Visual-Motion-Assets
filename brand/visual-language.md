# LawVriksh visual language

Status: extracted from approved Frame C and the existing successful work, 31 October 2026. These are reusable defaults, not a requirement to reproduce its Case Map composition.

## Character

Editorial, tactile and precise. Warm paper, restrained clay accents, dark ink and soft directional window light. Abstract geometry carries the meaning of documents, links, contradiction, organisation and evidence. Depth is made through scale, overlap, texture and considered shadows; avoid glossy generic SaaS styling or muddy plastic 3D.

## Type

| Role | Family | Use |
|---|---|---|
| Editorial/display | Newsreader | Large phrases, figures and calm reading hierarchy; restrained italic clay accents |
| Product and compact labels | Figtree | Faithful UI, dense labels and mobile captions where the brief calls for them |
| Historical wordmark treatment | Instrument Serif | Reference wordmark typography; prefer the actual supplied brand mark for a locked logo |
| Technical metadata | Geist Mono | Review slates/debug information, not decoration in artwork |

Fonts are in fonts/. fonts.css provides local @font-face declarations. Match supplied weights; do not invent a family substitute without checking the result. V3's Figtree spoken-word captions and the website film's Newsreader narrative are different format choices. 'Serif only' is not a universal rule.

## Palette

| Token | Value | Role |
|---|---|---|
| Ink | #171717 / #1c1714 | Text and dark geometry |
| Paper | #f5f1ea / #fbfaf7 | Main grounds and UI surfaces |
| Clay | #c94820 / #a93a18 | Emphasis and material shapes |
| Thread | #c4562e | Connections and continuity |
| On-path edge | #cf795d | Secondary emphasis |

Material textures are in textures/: paper, stone-clay, stone-char, stone-sand, hatch-sand and halftone-ochre. Use texture at a scale that still feels tactile; avoid noisy body-text regions. Window-light bands, soft shadow and restrained vignette unify surfaces. The old frame's exact band count/angle and pixel positions are examples, not mandatory dimensions for every format.

## Composition

One clear focal idea, useful negative space, deliberate scale changes and sharp hierarchy. Large editorial words can coexist with geometry, but must not compete with tiny product text. Close-ups should show the detail named by the narration. A clean edge or clay thread can carry the eye into the next state.

Product views: rebuild the required elements as layered HTML/CSS/SVG/canvas or equivalent editable composition objects. Retain genuine product language and interactions. Do not redesign the product for a shot. Source scans/PDF pages and footage may remain raster/video; keep highlights, annotations and motion layers separate.

## Static translation

Preserve typography, palette, materials, light and visual metaphors. Recompose the hierarchy for the target dimensions. A static needs a complete readable thought; a carousel needs deliberate progression. Do not copy transient animation poses or depend on sound to explain a slide. See ../formats/static-and-carousel.md.

Assets: [mark](logos/lawvriksh-mark.png), [font CSS](fonts.css), [tokens JSON](tokens.json), [tokens CSS](tokens.css), [approved frame](../examples/frame-c/frame-c.html). See ../ASSET-RIGHTS.md for scope and notices.

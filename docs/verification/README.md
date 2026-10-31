# Verification record — 31 October 2026

Commands run from the library root:

```sh
python scripts/validate-library.py --source D:/lv-frontend/motion-demo
node scripts/check-preview.mjs --runtime D:/lv-frontend/motion-demo/hyperframes/node_modules
```

The source flag verifies both destination and original working-tree asset hashes. On a fresh clone, omit it for package integrity/link checks. The browser command reuses an existing Puppeteer runtime and installed Edge; no dependencies are installed and no existing browser profile is cleared. EDGE_PATH can override the executable location.

- library-validation.json: 763 imported assets checked against their manifest hashes, original sources and staged Git blobs; 52 active guidance links, file-size/exclusion rules and bounded credential patterns checked.
- preview-check.json: 1440x1000 Frame C, bundled Figtree/Newsreader loaded, content present, 16 localhost/data requests, zero reported browser/resource errors.
- frame-c-preview.png: actual decoded browser screenshot; visually inspected for rendered content/materials/layout. It is a verification image, not a new approved artboard.
- media-index.json at the root: actual copied V3 share export is 85.1 seconds, 1080x1920, 30 fps, H.264/AAC stereo. Website preview is 96.4 seconds, 1080x750, 30 fps, H.264 without audio. No new video was rendered.
- Independent read-only review found no remaining critical/important issues. It checked authority boundaries, status, rights notices, manifest integrity, script syntax and additional secret patterns; it did not claim to watch/listen to the films.
- A second read-only review of the audio follow-up found no critical/important issues. It checked the distinction between user feedback, verified code and missing acquisition history; all four music-source hashes match the originals and full candidate MP3s remain excluded.
- Existing SFX generator CLI verified with `python -B -m sfx --list` from archive/original-motion-demo; it lists 13 generator/sample roles without rendering a new soundtrack. The sound guide records the user's autonomous-music correction and distinguishes verified local music/mixing evidence from an unrecorded acquisition/separation method. Full candidate MP3s remain excluded pending redistribution rights.

The initial review's missing full Three.js license notice was resolved by including the exact upstream notice in archive/runtime-notices and recording its hash. The active Frame C copy removes remote font links and uses bundled local fonts; its historical original is unchanged in the archive.

.gitattributes disables line-ending conversion so copied-source SHA256 checks also hold in a fresh clone. `python scripts/validate-library.py --git-index` additionally checks imported bytes against staged Git blobs before publication. Ignored local runtime artifacts are excluded from package checks; tracked or publishable caches remain forbidden.

No full historical-film rebuild, new creative approval, exhaustive rights audit or real-time audiovisual review is claimed. Historical source retains formatting and obsolete application paths; those files are evidence, not current startup instructions. The original application checkout was used read-only. Publication status is confirmed against Git after pushing rather than inferred from a local commit.

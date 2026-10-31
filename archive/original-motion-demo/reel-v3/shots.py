"""Reel v3 shot list (plan §4). Every cut is anchored to a spoken word: (sentence, word, offset s) → the
shot starts `offset` after that word's start (negative = just before it). A shot ends where the next begins.

modes
  FACE     the take of that sentence, full screen (P only: the take framed for vertical); punch = zoom
  SPLIT    graphic on top (1080×1000), face below (1080×920) from the sentence's take
  GRAPHIC  the graphic full screen (1080×1920)
  BROLL    footage full screen
graphics
  scene    which scene renders it (a web part's scene, by name; see scenes/)
  reel     scene time (s) at shot start → shot end, linear
  cam      camera window in scene px (1440×1000): (cx, cy, w) at start → end; the window's height follows
           the target box's aspect. 'fit' = the whole scene width.
  extra    scene-specific state (e.g. the Hearing Prep phase)
"""
W = lambda s, w, off=0.0: (s, w, off)

SHOTS = [
    # hook: her face one beat, then the problem in pictures
    dict(at=W(1, 'Lawyers', -0.05), mode='FACE', punch=(1.0, 1.06)),
    dict(at=W(1, 'hundreds', -0.08), mode='GRAPHIC', scene='opening', reel=(2.25, 2.92), cam=((720, 520, 520), (720, 500, 640))),
    dict(at=W(1, 'handwritten', -0.03), mode='GRAPHIC', scene='opening', reel=(3.55, 4.33), cam=((900, 470, 560), (930, 440, 500))),
    dict(at=W(1, 'aur', -0.05), mode='SPLIT', scene='opening', reel=(4.4, 6.7), cam=((660, 470, 920), (660, 480, 860))),
    dict(at=W(2, 'What', -0.12), mode='FACE', punch=(1.0, 1.08)),
    # "Recently I came across this platform called…": the tree grows out of the line while she says it (no face jump
    # cut between her two sentences), and the wordmark lands on "LawVriksh" — the one big hit
    dict(at=W(3, 'Recently,', -0.1), mode='GRAPHIC', scene='opening', reel=(10.05, 11.3), cam=((720, 420, 820), (720, 440, 760))),
    dict(at=W(3, 'LawVriksh', -0.06), mode='GRAPHIC', scene='opening', reel=(11.3, 12.1), cam=((720, 440, 760), (720, 450, 700))),
    # "kaafi easy": three quick flashes of the product, one per stressed word
    dict(at=W(3, 'honestly', -0.06), mode='SPLIT', scene='s3', reel=(35.0, 35.3), cam=('fit', (760, 520, 1300))),
    dict(at=W(3, 'concept', -0.06), mode='SPLIT', scene='s4', reel=(40.4, 40.6), cam=((650, 470, 1150), (650, 470, 1080))),
    dict(at=W(3, 'easy', -0.06), mode='SPLIT', scene='s5', reel=(43.85, 43.95), cam=((860, 560, 1250), (860, 560, 1180))),
    dict(at=W(4, 'Maan', -0.08), mode='BROLL', src='office', media=(0.55, 1.9)),
    dict(at=W(4, 'aur', -0.04), mode='GRAPHIC', scene='opening', reel=(14.7, 16.6), cam=((710, 470, 700), (710, 460, 600))),
    # the problem, phrase by phrase
    dict(at=W(5, 'Multiple', -0.1), mode='GRAPHIC', scene='opening', reel=(16.6, 18.4), cam=((420, 470, 700), (1020, 470, 700))),
    dict(at=W(5, 'conflicting', -0.08), mode='SPLIT', scene='opening', reel=(18.6, 20.4), cam=((760, 500, 1500), (760, 500, 1460))),
    dict(at=W(5, 'legal', -0.06), mode='GRAPHIC', scene='opening', reel=(21.1, 22.1), cam=((660, 460, 860), (640, 430, 740))),
    dict(at=W(5, 'aur', -0.04), mode='SPLIT', scene='opening', reel=(22.2, 24.7), cam=('fit', (720, 560, 1300))),
    # the product
    dict(at=W(6, 'Aapko', -0.1), mode='SPLIT', scene='s2', reel=(24.8, 27.2), cam=((712, 470, 1180), (712, 470, 1100))),
    dict(at=W(7, 'AI', -0.1), mode='GRAPHIC', scene='s2', reel=(27.2, 28.6), cam=((420, 520, 640), (1060, 520, 640))),
    dict(at=W(7, 'unclear', -0.08), mode='GRAPHIC', scene='s2', reel=(29.55, 31.0), cam=((780, 560, 640), (800, 560, 480))),
    dict(at=W(7, 'aur', -0.05), mode='GRAPHIC', scene='s3', reel=(33.25, 34.3), cam=((720, 560, 1000), (720, 560, 800))),
    dict(at=W(8, 'Agar', -0.1), mode='SPLIT', scene='s3', reel=(34.9, 35.7), cam=((800, 540, 1340), (860, 540, 1280))),
    dict(at=W(8, 'toh', -0.08), mode='GRAPHIC', scene='tab', reel=(1.1, 3.4), cam=((470, 520, 620), (930, 520, 560))),
    dict(at=W(8, 'verify', -0.06), mode='GRAPHIC', scene='s3', reel=(36.9, 38.13), cam=((1080, 470, 680), (1170, 520, 560))),
    dict(at=W(8, 'aur', -0.05), mode='GRAPHIC', scene='s4', reel=(38.45, 40.6), cam=((640, 470, 760), (760, 470, 820))),
    # Hearing Prep: its own motion graphic (hyperframes/reel-hearing), rebuilt from the app's brief; scene time runs
    # with the reel ('live') and every entrance is keyed to her words
    dict(at=W(9, 'Aur', -0.1), mode='SPLIT', scene='hear', reel='live'),
    dict(at=W(9, 'previous', -0.06), mode='GRAPHIC', scene='hear', reel='live'),
    dict(at=W(9, 'important', -0.06), mode='GRAPHIC', scene='hear', reel='live'),
    dict(at=W(9, 'aur', -0.04), mode='GRAPHIC', scene='hear', reel='live'),
    dict(at=W(9, 'jisse', -0.04), mode='SPLIT', scene='hear', reel='live'),
    dict(at=W(9, 'arguments', -0.08), mode='GRAPHIC', scene='hear', reel='live'),
    # Ask, Draft, Insights
    dict(at=W(10, 'You', -0.1), mode='GRAPHIC', scene='s5', reel=(41.8, 43.85), cam=((520, 540, 760), (900, 560, 1160))),
    dict(at=W(10, 'generate', -0.06), mode='GRAPHIC', scene='s6', reel=(44.55, 45.6), cam=((720, 470, 760), (720, 430, 700))),
    dict(at=W(10, 'you', -0.06), mode='SPLIT', scene='s7', reel=(46.85, 47.6), cam=('fit', 'fit')),
    dict(at=W(10, 'without', -0.06), mode='GRAPHIC', scene='s7', reel=(47.4, 49.5), cam=((470, 560, 860), (470, 520, 700))),
    # the turn
    dict(at=W(11, 'As', -0.12), mode='FACE', punch=(1.0, 1.07)),
    dict(at=W(12, "It's", -0.1), mode='GRAPHIC', scene='s9', reel=(52.9, 55.6), cam=((900, 500, 560), (880, 500, 540))),
    dict(at=W(12, 'law', -0.12), mode='FACE', punch=(1.12, 1.14)),
    dict(at=W(13, 'And', -0.1), mode='FACE', punch=(1.0, 1.08)),
    # the CTA, then the brand
    # the CTA opens on the search card alone, so the switch to the landscape take is never seen as a cut on her
    dict(at=W(14, 'Search', -0.12), mode='GRAPHIC', scene='cta', reel=(0, 2.9)),
    dict(at=W(14, 'comment', -0.06), mode='SPLIT', scene='cta', reel=(3.0, 6.2)),
    dict(at=('end', None, 0.0), mode='GRAPHIC', scene='s10', reel=(61.0, 62.87), cam=((720, 480, 820), (720, 480, 760)), tail=1.5),
]

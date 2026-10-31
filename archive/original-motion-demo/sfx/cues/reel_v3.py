"""Reel v3 cue sheet (reel-v3-plan.md §7): the SFX stem, mixed later under the voice and the music.

Every time comes from the edit (edl.json shots, anchored to her words) or from a scene's own key times
mapped through its shot; nothing is typed by hand. Accent, don't narrate: about a third of the cuts get
a sound. One big riser and one big impact, both on "LawVriksh". Tonal sounds sit in KEY (set from the
chosen music track); pitch climbs through each sequence.
"""
from sfx.synth import whoosh, pop, click, blip, tick, chime, riser, sub_drop, impact, scratch, sample

TIMELINE = '../../reel-v3/edl.json'
OUT = '../../reel-v3/build/sfx-stem.wav'
TARGET_LUFS = None            # a stem: the final mix masters voice + music + this together

KEY = 261.63                  # C: "Corporate Lofi Downtempo Explainer" (alex-morgan, Pixabay) is in C major, 92 BPM
SCALE = [1, 9 / 8, 5 / 4, 4 / 3, 3 / 2, 5 / 3, 15 / 8, 2]  # major, just intonation
note = lambda k, octave=1: KEY * octave * SCALE[k % 7] * (2 ** (k // 7))

def score(mix, tl):
    S = {s['i']: s for s in tl['shots']}
    t0 = lambda i: S[i]['t0']
    # a scene time inside shot i (its strip runs scene time linearly over the shot)
    def at(i, scene_t, reel):
        a, b = reel; s = S[i]
        return s['t0'] + (scene_t - a) / (b - a) * (s['t1'] - s['t0'])

    # hook
    mix.put(t0(1), sub_drop(0.9, 120, 40, 0.8), 0.22)                           # her first word lands on weight
    mix.put(t0(2) - 0.12, sample('whoosh-1'), 0.16, -0.2)                       # into the page stacks
    mix.put(t0(3) + 0.1, scratch(0.7, 0.3), 0.12, 0.4)                          # the margin note writes itself
    for k in range(4):                                                         # the pencil bracket ticks line by line
        mix.put(t0(4) + 0.35 + k * 0.5, tick(0.4), 0.10, -0.3 + k * 0.15)
    # the build and the reveal (the one riser, the one impact)
    hit = t0(7)
    r = riser(hit - (t0(6) - 0.4), 160, 1500, 0.4); mix.put(hit - len(r) / 48000, r, 0.16)
    mix.put(hit, impact(1.4, 0.9), 0.32)
    mix.put(hit + 0.42, chime((note(0), note(2), note(4))), 0.12)              # the wordmark completes
    for k, i in enumerate((8, 9, 10)):                                         # three flashes of the product
        mix.put(t0(i), pop(note(2 + 2 * k, 2), 0.09), 0.12, -0.35 + 0.35 * k)
    mix.put(t0(11) - 0.08, sample('whoosh-2'), 0.08)                           # into the office
    # the problem
    mix.put(t0(12) + 1.75, sample('drop-1'), 0.20)                             # the case folder lands
    for k in range(3): mix.put(t0(13) + 0.12 + 0.33 * k, pop(note(k, 2), 0.08), 0.10, -0.5 + 0.5 * k)
    mix.put(t0(14) + 0.05, sample('impact-soft-1'), 0.24)                      # the two amounts collide
    for k in range(3): mix.put(t0(15) + 0.05 + 0.2 * k, sample('click-firm-%d' % (k + 1)), 0.14, -0.4 + 0.4 * k)
    mix.put(t0(16), whoosh(0.5, 300, 1800, 0.5), 0.08)
    # the product
    mix.put(t0(17) + 0.05, sample('whoosh-1'), 0.12); mix.put(t0(17) + 0.45, sample('drop-2'), 0.16)   # upload
    for k in range(5): mix.put(t0(18) + 0.25 + 0.38 * k, pop(note(k, 2), 0.08), 0.10, -0.6 + 0.3 * k)  # facts come off the line
    mix.put(t0(19) + 0.15, sample('select-1'), 0.14); mix.put(t0(19) + 0.3, whoosh(0.25, 1500, 5000, 0.4), 0.07)  # the flag snaps, the marker sweeps
    for k in range(5): mix.put(t0(20) + 0.12 + 0.19 * k, tick(0.35), 0.08, -0.4 + 0.2 * k)          # the map builds
    mix.put(t0(21) + 0.1, sample('toggle-on'), 0.12)                           # the conflict opens
    mix.put(t0(22), whoosh(0.4, 600, 2600, 0.5), 0.09, -0.5)                    # across the compared columns
    mix.put(t0(23) + 0.1, sample('select-2'), 0.12)                            # the source opens (Verify fact is never pressed)
    for k in range(10): mix.put(t0(24) + 0.08 + 0.1 * k, tick(0.3), 0.07, -0.2)   # the dates come home
    # Hearing Prep (hyperframes/reel-hear): the same word anchors its entrances use
    hw = [w for w in tl['words'] if w['sentence'] == 9]
    def W(word, k=1):
        hits = [w['s'] for w in hw if w['w'].lower().strip('.,?!') == word]
        return hits[min(k, len(hits)) - 1]
    mix.put(t0(25) - 0.1, sample('whoosh-2'), 0.10)
    mix.put(W('hearing'), pop(note(5, 2), 0.08), 0.10, 0.4)                     # NEEDS ATTENTION
    for k in range(4): mix.put(W('preparation') + 0.11 * k, tick(0.3), 0.05, -0.3 + 0.2 * k)   # the listing's facts cascade
    for t in (W('previous') - 0.06, W('important') - 0.06, W('aur', 2) - 0.04, W('organize') - 0.12, W('jisse') - 0.04, W('arguments') - 0.08):
        mix.put(t, sample('tick-1'), 0.10, -0.6); mix.put(t + 0.02, whoosh(0.4, 500, 2200, 0.4), 0.05)   # the contents jump, the sheet scrolls
    mix.put(W('records'), pop(note(2, 2), 0.08), 0.09); mix.put(W('records') + 0.45, pop(note(4, 2), 0.08), 0.09)
    mix.put(W('facts') - 0.1, whoosh(0.3, 1500, 5000, 0.4), 0.06); mix.put(W('facts') + 0.25, whoosh(0.3, 1500, 5000, 0.4), 0.06)   # both amounts marked
    for k in range(4): mix.put(W('organize') + 0.17 * k + 0.3, pop(note(k, 2), 0.08), 0.08, (-1) ** k * 0.4)   # the checklist organizes itself
    for k in range(3): mix.put(W('lawyers') + 0.12 * k, pop(note(2 + k, 2), 0.07), 0.08)            # the verdict's counts
    mix.put(W('apne') - 0.15, sample('click-firm-1'), 0.12, 0.6); mix.put(W('apne'), sample('open-1'), 0.10, 0.4)   # Needs Review opens the panel
    mix.put(W('aur', 3), chime((note(2, 2), note(4, 2)), 0.5), 0.06, 0.3)        # the compliance check comes back clean
    mix.put(W('better'), pop(note(4, 2), 0.08), 0.08); mix.put(W('way') + 0.3, pop(note(6, 2), 0.08), 0.08)   # the support tags
    mix.put(W('prepare'), whoosh(0.4, 400, 2000, 0.4), 0.06, -0.4); mix.put(W('prepare') + 0.2, whoosh(0.4, 400, 2000, 0.4), 0.06, 0.4)  # opposition / your answer
    # Ask, Draft, Insights
    mix.typing(t0(31) + 0.05, t0(31) + 1.25, 26, 0.07, -0.1)
    mix.put(t0(31) + 1.35, sample('key-enter-1'), 0.10)
    mix.put(t0(31) + 2.0, chime((note(2, 2), note(4, 2)), 0.6), 0.06)          # the answer and its citations land
    mix.typing(t0(32) + 0.1, t0(32) + 1.2, 14, 0.04)                            # the draft writes itself
    for k in range(6): mix.put(t0(33) + 0.2 + 0.14 * k, pop(note(k, 2), 0.07), 0.08, -0.5 + 0.2 * k)   # six results, 140 ms apart
    for k in range(3): mix.put(t0(34) + 0.1 + 0.7 * k, whoosh(0.22, 1200, 4200, 0.4), 0.05)            # pages flick past
    mix.put(t0(35) - 0.6, chime((note(0), note(2), note(4), note(0, 2))), 0.10)                         # the beat before "As technology evolves"
    # the turn, the CTA, the brand
    mix.put(t0(36) - 0.05, sample('whoosh-1'), 0.07)
    mix.put(t0(39) - 0.9, whoosh(0.9, 200, 1400, 0.5), 0.07)                                             # lift into the CTA
    keys_a = [0.35, 0.45, 0.55, 0.66, 0.76, 0.86, 0.97, 1.08, 1.18]                                      # reel-cta/src/cta.js KEYS_A
    for k, T in enumerate(keys_a): mix.put(at(39, T, (0, 2.9)), sample('key-%d' % (k % 4 + 1)), 0.09, 0.1)
    mix.put(at(39, 1.45, (0, 2.9)), sample('key-enter-2'), 0.11)
    mix.put(at(39, 1.62, (0, 2.9)), pop(note(4, 2), 0.09), 0.10)
    mix.put(at(40, 3.02, (3.0, 6.2)), pop(note(2, 2), 0.08), 0.09)
    for k, T in enumerate((3.35, 3.5, 3.65)): mix.put(at(40, T, (3.0, 6.2)), sample('key-%d' % (k + 1)), 0.10)
    mix.put(at(40, 4.42, (3.0, 6.2)), sample('confirm-1'), 0.14, 0.3)                                    # the DM arrives
    mix.put(t0(41), sample('impact-soft-2'), 0.12); mix.put(t0(41) + 0.05, chime((note(0), note(4), note(0, 2))), 0.10)

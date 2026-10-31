/* Reel v3: Hearing Prep's extended states (reel-v3-plan.md §4, shots 23–27).
 *
 * Content: Codex's extension (reel-reshoot/scripts/hearing-scene.mjs), built from the saved Arora hearing
 * data (src/mocks/data/arora-hearing.ts): previous records, facts and case developments, main arguments.
 * The demo hearing date stays labelled presentation-only, and the open review item stays open.
 *
 * Unlike that version, the scene's own brief is never rewritten: phases 1–3 paint a separate card
 * (#brief-alt) over it, so every frame is a pure function of (phase, local time) and render workers can
 * seek frames in any order.
 */
const BODIES = [null,
  `<div class="eye">PREVIOUS RECORDS</div><div class="bt" style="font-size:36px">Interim order · 18 July 2026</div><div class="item" style="font-size:23px;margin-top:18px">Paragraph 5 restrains creation of third-party interests until the next hearing.</div><div class="item" style="font-size:23px;margin-top:14px">Paragraph 6 directs an affidavit of bookings, allotments and receipts within four weeks.</div><div class="sub" style="font-size:17px;margin-top:18px">Source: interim order · page 2 · paragraphs 5–6</div>`,
  `<div class="eye">FACTS & CASE DEVELOPMENTS</div><div class="bt" style="font-size:36px">One record. An open discrepancy.</div><div class="item" style="font-size:23px;margin-top:18px">Notice: <b>Rs. 2,30,00,000</b><br>Interim order: <b>Rs. 1,15,00,000</b></div><div class="item" style="font-size:23px;margin-top:14px">The July order records limited interim protection. Later proceedings are not included in this corpus.</div><div class="sub" style="font-size:17px;margin-top:18px">Notice · p. 2 / interim order · pp. 1–2 · discrepancy unresolved</div>`,
  `<div class="eye">MAIN ARGUMENTS</div><div class="bt" style="font-size:36px">Prepare the position.</div><div class="item" style="font-size:23px;margin-top:18px"><b>Payment condition</b><br>Clause 9.2 versus the alleged commencement-certificate condition. Still disputed.</div><div class="item" style="font-size:23px;margin-top:14px"><b>Interim protection</b><br>Review the restraint and affidavit direction in paragraphs 5–6 of the July order.</div><div class="sub" style="font-size:17px;margin-top:18px">Agreement · notice · interim order / confirm instructions before use</div>`,
];

export function setupHearing() {
  const $ = (id) => document.getElementById(id);
  const brief = $('brief'), alt = document.createElement('div');
  alt.id = 'brief-alt';
  Object.assign(alt.style, { position: 'absolute', left: '0', top: '0', width: '760px', transformOrigin: '0 0', padding: '30px 34px 28px', display: 'none' });
  brief.parentNode.insertBefore(alt, brief.nextSibling);
  const tag = document.querySelector('#label .tag');
  const init = { qual: [$('qual').style.top, $('qual').style.fontSize], label: $('label').style.top, tag: tag.style.fontSize, focal: $('focal').style.opacity };

  /* call after the scene's renderAt for the same frame; lt = seconds into the shot */
  return function paint(phase, lt) {
    if (!phase) {
      alt.style.display = 'none'; brief.style.visibility = '';
      [$('qual').style.top, $('qual').style.fontSize] = init.qual; $('label').style.top = init.label; tag.style.fontSize = init.tag; $('focal').style.opacity = init.focal;
      return;
    }
    const u = Math.min(1, Math.max(0, lt / 0.4));
    $('plate-layer').style.display = 'none';
    brief.style.visibility = 'hidden';
    alt.style.display = ''; alt.innerHTML = BODIES[phase];
    alt.style.opacity = String(u); alt.style.transform = `translate(80px, ${(300 + 14 * (1 - u)).toFixed(2)}px) scale(1.25)`;
    $('brief-shell').style.height = '450px';
    $('qual').style.top = '775px'; $('qual').style.fontSize = '17px';
    $('focal').style.opacity = phase === 2 ? '1' : '.35';
    $('label').style.top = '220px'; tag.style.fontSize = '22px';
  };
}

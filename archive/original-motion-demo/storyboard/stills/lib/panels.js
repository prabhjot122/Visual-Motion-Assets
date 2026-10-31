/* Rebuilt floating review panels (floating-review-panel.css, source-evidence.tsx),
   saved Arora content. Each source card and button carries an id. */
(function () {
  const pdf = '<svg width="13" height="13" viewBox="0 0 24 24" style="flex:none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#d65248"/><path d="M14 2v6h6" fill="#f6b1aa"/></svg>';
  const close = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#606060" stroke-width="1.8" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  const NOTICE = { id: 'src-notice', file: 'Notice invoking arbitration — 14 Mar 2026.pdf', page: 'Page 2', quote: 'the quantum payable to the Claimant, being Rs. 2,30,00,000/- in principal together with interest;' };
  const ORDER = { id: 'src-order', file: 'Interim order under Section 9 — 18 Jul 2026.pdf', page: 'Page 1', quote: 'For this interim application, the petitioner quantifies the amount presently due at Rs. 1,15,00,000/-.' };
  const card = (s) => `<div class="src" id="${s.id}"><div class="sh">${pdf}<span class="fn">${s.file}</span><span class="pg">${s.page}</span></div><p>${s.quote}</p></div>`;

  function conflict() {
    return `<div class="ph"><span>Conflict</span>${close}</div><div class="pb">
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:18px"><p class="title">Amount outstanding</p>
      <p class="desc">Two documents state different outstanding amounts: the arbitration notice pleads Rs. 2,30,00,000 while the Section 9 order records Rs. 1,15,00,000 as presently due.</p>
      <div><span class="chip-red">Contradicted</span></div></div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px"><h3 style="margin:0;font-size:11.5px;font-weight:600;color:#404040">Sources used in this branch</h3><span class="count" style="min-width:0;height:auto;padding:0 6px">2</span></div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px">${card(NOTICE)}${card(ORDER)}</div></div>
      <div class="pf"><div class="btn-open">Open source</div></div>`;
  }

  function materialFactB() {
    return `<div class="ph"><span>Material fact</span>${close}</div><div class="pb">
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:18px"><p class="title" id="fact-value">Rs. 1,15,00,000</p>
      <p class="desc">Figure taken from the interim order conflicts with the arbitration notice. One of the two will have to be corrected in the statement of claim.</p>
      <div><span class="chip-red">Contradicted</span></div></div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px"><h3 style="margin:0;font-size:11.5px;font-weight:600;color:#404040">Sources</h3><span class="count" style="min-width:0;height:auto;padding:0 6px">1</span></div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px">${card(ORDER)}</div></div>
      <div class="pf"><div class="btn-verify" id="btn-verify">Verify fact</div></div>`;
  }

  window.Panels = { conflict, materialFactB };
})();

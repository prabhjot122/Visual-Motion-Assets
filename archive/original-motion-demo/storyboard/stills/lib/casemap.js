/* Rebuilt Case Map for the storyboard stills.
 *
 * Positions follow src/features/matters/services/case-map-layout.ts exactly:
 * matter at the origin, nine category hubs in fixed slots, one column per
 * open level (NODE_W 264, COLUMN_GAP 76, ROW_GAP 10). Content is the saved
 * Arora seed. Every chip, edge and panel is its own element with an id so the
 * Phase 5 timeline can drive each one independently.
 */
(function () {
  const MATTER_W = 264, MATTER_H = 64, HUB_W = 224, HUB_H = 40, HUB_GAP = 14, HUB_OFFSET = 200;
  const NODE_W = 264, NODE_H = 52, COLUMN_GAP = 76, ROW_GAP = 10;

  const LEFT = [['parties', 'Parties', 2], ['advocates', 'Advocates', 0], ['issues', 'Issues', 2], ['provisions', 'Provisions', 3], ['conflicts', 'Conflicts', 2]];
  const RIGHT = [['facts', 'Facts', 12], ['evidence', 'Evidence', 4], ['arguments', 'Arguments', 3], ['reliefs', 'Reliefs', 0]];
  const CHILDREN = {
    conflicts: [['amount', 'Amount outstanding', 2], ['duedate', 'Third-tranche due date (agreement calculation)', 2]],
    amount: [['versionA', 'Version A', 0], ['versionB', 'Version B', 0]],
  };

  const chev = (rot) => `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#606060" stroke-width="2" stroke-linecap="round" style="transform:rotate(${rot}deg)"><path d="m9 6 6 6-6 6"/></svg>`;

  function curve(from, to, tension) {
    const dx = (to.x - from.x) * tension;
    return `M${from.x} ${from.y} C${from.x + dx} ${from.y}, ${to.x - dx} ${to.y}, ${to.x} ${to.y}`;
  }

  /** Layout in map units for a path such as ['conflicts', 'amount']. */
  function layout(path) {
    const nodes = [{ id: 'matter', kind: 'matter', x: -MATTER_W / 2, y: -MATTER_H / 2, w: MATTER_W, h: MATTER_H }];
    const edges = [];
    for (const [side, list] of [['left', LEFT], ['right', RIGHT]]) {
      const total = list.length * HUB_H + (list.length - 1) * HUB_GAP;
      list.forEach(([id, label, count], i) => {
        const x = side === 'left' ? -HUB_OFFSET - MATTER_W / 2 - HUB_W : HUB_OFFSET + MATTER_W / 2;
        const y = -total / 2 + i * (HUB_H + HUB_GAP);
        nodes.push({ id, kind: 'cat', side, label, count, x, y, w: HUB_W, h: HUB_H, open: path[0] === id });
        const from = side === 'left' ? { x: -MATTER_W / 2, y: 0 } : { x: MATTER_W / 2, y: 0 };
        const to = side === 'left' ? { x: x + HUB_W, y: y + HUB_H / 2 } : { x, y: y + HUB_H / 2 };
        edges.push({ id: `e-matter-${id}`, d: curve(from, to, 0.55), on: path[0] === id });
      });
    }
    let parent = nodes.find((n) => n.id === path[0]);
    for (let level = 0; parent && level < path.length; level++) {
      const kids = CHILDREN[path[level]] || [];
      const total = kids.length * NODE_H + (kids.length - 1) * ROW_GAP;
      const cy = parent.y + parent.h / 2;
      const x = parent.x - COLUMN_GAP - NODE_W; // both opened branches sit on the left
      let next = null;
      kids.forEach(([id, label, count], i) => {
        const y = cy - total / 2 + i * (NODE_H + ROW_GAP);
        const n = { id, kind: 'node', side: 'left', label, count, x, y, w: NODE_W, h: NODE_H, open: path[level + 1] === id };
        nodes.push(n);
        edges.push({ id: `e-${parent.id}-${id}`, d: curve({ x: parent.x, y: cy }, { x: x + NODE_W, y: y + NODE_H / 2 }, 0.5), on: path[level + 1] === id });
        if (n.open) next = n;
      });
      parent = next;
    }
    return { nodes, edges };
  }

  function chipHTML(n, selected) {
    if (n.kind === 'matter') {
      return `<div class="matter" id="cm-matter" style="left:${n.x}px;top:${n.y}px"><span class="eyebrow">MATTER</span><span class="name">Arora v. Meridian Estates Pvt. Ltd.</span><span class="case">ARB.P. 428/2026</span></div>`;
    }
    if (n.kind === 'cat') {
      const rot = n.open ? 90 : n.side === 'left' ? 180 : 0;
      return `<div class="cat ${n.side}${n.open ? ' open' : ''}" id="cm-${n.id}" style="left:${n.x}px;top:${n.y}px"><span>${n.label}</span><span class="count">${n.count}${chev(rot)}</span></div>`;
    }
    const sel = selected === n.id;
    const count = n.count ? `<span class="ncount">${n.count}${chev(n.open ? 90 : 180)}</span>` : '';
    return `<div class="node left${n.open ? ' open' : ''}${sel || n.open && !selected ? ' sel' : ''}" id="cm-${n.id}" style="left:${n.x}px;top:${n.y}px"><span class="dot"></span><span class="txt"><span class="meta">Contradicted</span><span class="label">${n.label}</span></span>${count}</div>`;
  }

  /** Render the map world into `el`; (ox, oy) is where map (0,0) lands, k the zoom. */
  function renderMap(el, { path = [], selected = null, ox = 0, oy = 0, k = 1, quiet = [] } = {}) {
    const { nodes, edges } = layout(path);
    el.classList.add('world');
    el.style.transform = `translate(${ox}px, ${oy}px) scale(${k})`;
    el.innerHTML =
      `<svg class="edges" aria-hidden="true">${edges.map((e) => `<path id="${e.id}" class="edge${e.on ? ' on' : ''}" d="${e.d}"/>`).join('')}</svg>` +
      nodes.map((n) => chipHTML(n, selected)).join('');
    quiet.forEach((id) => { const q = el.querySelector(`#cm-${id}`); if (q) q.style.opacity = 0.85; });
    return { nodes, edges };
  }

  /** Map-space box of a node id (for framing, threads and focal marks). */
  function box(path, id) {
    return layout(path).nodes.find((n) => n.id === id);
  }

  /** App window chrome (1x layout): toolbar, dotted canvas and breadcrumb. Returns the canvas element. */
  function chrome(inner, { w, h, crumbs }) {
    const search = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#606060" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
    const sep = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#858585" stroke-width="2" stroke-linecap="round"><path d="m9 6 6 6-6 6"/></svg>';
    inner.style.width = w + 'px';
    inner.style.height = h + 'px';
    inner.innerHTML =
      `<div class="toolbar" style="width:${w}px"><div class="seg"><span class="on">Map</span><span>Facts</span></div>` +
      `<div class="tb-field" style="width:236px">${search}Search the map…</div>` +
      `<div class="tb-btn">Add fact</div><div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#858585"><span style="width:7px;height:7px;border-radius:999px;background:#2e7d46"></span>Live</div>` +
      `<div style="flex-grow:1"></div><div class="tb-sq">+</div><div class="tb-sq">–</div></div>` +
      `<div class="cm-dots" id="cm-canvas" style="position:absolute;left:0;top:44px;width:${w}px;height:${h - 44}px;overflow:hidden">` +
      `<div class="crumbs">${crumbs.map((c, i) => `<span class="${i === crumbs.length - 1 && crumbs.length > 1 ? 'cur' : ''}">${c}</span>`).join(sep)}</div>` +
      `<div id="cm-world"></div></div>`;
    return inner.querySelector('#cm-world');
  }

  window.CaseMap = { renderMap, layout, box, chrome };
})();

/* Shared motion-system geometry for stills: focal corner marks and the clay
   thread, anchored to live element bounds (stage pixels). */
(function () {
  const r = (el) => (typeof el === 'string' ? document.querySelector(el) : el).getBoundingClientRect();

  /** Corner-mark path around an element (or a {left, top, right, bottom} box). */
  function corners(target, pad = 12, arm = 18) {
    const b = target.left !== undefined && target.getBoundingClientRect === undefined ? target : r(target);
    const x0 = b.left - pad, y0 = b.top - pad, x1 = b.right + pad, y1 = b.bottom + pad, L = arm;
    return `M${x0} ${y0 + L}V${y0}H${x0 + L}M${x1 - L} ${y0}H${x1}V${y0 + L}M${x1} ${y1 - L}V${y1}H${x1 - L}M${x0 + L} ${y1}H${x0}V${y1 - L}`;
  }

  /** Horizontal-tangent cubic from point a to point b. */
  function link(a, b, bend = 0.5) {
    const dx = (b.x - a.x) * bend;
    return `M${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
  }

  const edge = (target, side) => {
    const b = r(target);
    return side === 'left' ? { x: b.left, y: (b.top + b.bottom) / 2 }
      : side === 'right' ? { x: b.right, y: (b.top + b.bottom) / 2 }
      : side === 'top' ? { x: (b.left + b.right) / 2, y: b.top }
      : { x: (b.left + b.right) / 2, y: b.bottom };
  };

  window.Marks = { corners, link, edge, rect: r };
})();

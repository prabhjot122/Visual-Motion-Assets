/* CSS-3D paper for the problem sequence: stacks of pages as boxes whose top
   face is a page (abstract text lines, no legible invented content) and whose
   sides are page edges. Every stack, face and line is its own element. */
(function () {
  const EDGE = 'repeating-linear-gradient(0deg, #efe8dc 0 2px, #b9ad9b 2px 3px, #e3dbcd 3px 5px)';

  function lines(face, { w, d, inset = 0.12, rows = 14, seed = 1 }) {
    let s = seed;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const pad = w * inset, lh = (d - pad * 2) / rows;
    for (let i = 0; i < rows; i++) {
      if (i === 0 || rnd() < 0.08) continue;
      const bar = document.createElement('i');
      bar.className = 'pline';
      const len = i === 1 ? 0.45 : 0.55 + rnd() * 0.4;
      Object.assign(bar.style, { position: 'absolute', left: pad + 'px', top: pad + i * lh + 'px', width: (w - pad * 2) * len + 'px', height: Math.max(2, lh * 0.32) + 'px', background: i === 1 ? '#3a352f' : '#b9b1a5', borderRadius: '1px', opacity: i === 1 ? 0.8 : 0.7 });
      face.appendChild(bar);
    }
  }

  /** A stack of pages standing on the desk plane. x/y on the plane, h = thickness. */
  function stack(scene, { x, y, w, d, h, rot = 0, seed = 1, rows = 14, top = '#fbf8f2', id }) {
    const g = document.createElement('div');
    if (id) g.id = id;
    Object.assign(g.style, { position: 'absolute', left: x + 'px', top: y + 'px', width: w + 'px', height: d + 'px', transformStyle: 'preserve-3d', transform: `rotateZ(${rot}deg)` });
    const face = (css) => { const f = document.createElement('div'); Object.assign(f.style, { position: 'absolute' }, css); g.appendChild(f); return f; };
    const t = face({ left: 0, top: 0, width: w + 'px', height: d + 'px', background: top, transform: `translateZ(${h}px)`, boxShadow: 'inset 0 0 0 1px rgba(60,45,30,0.08)' });
    t.className = 'page-top';
    lines(t, { w, d, rows, seed });
    face({ left: 0, top: d + 'px', width: w + 'px', height: h + 'px', background: EDGE, transformOrigin: '0 0', transform: 'rotateX(90deg)', filter: 'brightness(0.92)' });
    face({ left: w + 'px', top: 0, width: h + 'px', height: d + 'px', background: EDGE.replace('0deg', '90deg'), transformOrigin: '0 0', transform: 'rotateY(-90deg)', filter: 'brightness(0.72)' });
    // Contact shadow on the desk
    face({ left: '-6px', top: '-6px', width: w + 12 + 'px', height: d + 12 + 'px', background: 'rgba(40,24,10,0.28)', filter: 'blur(14px)', transform: 'translateZ(-1px) translate(18px, 22px)' });
    scene.appendChild(g);
    return { g, top: t };
  }

  window.Paper3D = { stack, lines };
})();

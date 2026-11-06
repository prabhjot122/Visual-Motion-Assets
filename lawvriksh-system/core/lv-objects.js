/* LawVriksh system — law objects carved from the library materials.
   Each object means something on its page: bound law reports (authorised
   source), case files (filing), a ticked page (checks), an open report
   (reading the paragraph), a generic court facade (no emblem), a calendar
   (dates), a note slip (writing down what you checked), paired pages
   (comparison), a judgment page (the paragraph) and an index-card register.
   Pure SVG: no text, no arrows, token colours only, deterministic.

   Browser: <div class="motif" data-motif="reports" data-deco></div> is filled on load;
            LV.fill({motif:'files'}) swaps it.
   Node:    const O = require('./lv-objects.js'); O.svg('reports', {theme:'paper', texBase:'../../../brand/textures/'})
*/
(function(root){
  'use strict';
  var C = {ink:'#171717', inkWarm:'#1c1714', paper:'#f5f1ea', surface:'#fbfaf7', clay:'#c94820', clayDark:'#a93a18', edge:'#cf795d', thread:'#c4562e', muted:'#5a524b'};
  var A = function(hex, a){ var n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; };
  var uidN = 0;

  function rr(x, y, w, h, r){ r = Math.min(r, w / 2, h / 2);
    return 'M' + (x + r) + ' ' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ' ' + y + ' ' + (x + w) + ' ' + (y + r) + 'V' + (y + h - r) + 'Q' + (x + w) + ' ' + (y + h) + ' ' + (x + w - r) + ' ' + (y + h) + 'H' + (x + r) + 'Q' + x + ' ' + (y + h) + ' ' + x + ' ' + (y + h - r) + 'V' + (y + r) + 'Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y + 'Z'; }

  function Kit(opts){
    var id = 'o' + (++uidN) + (opts.uid || ''), dark = opts.theme === 'dark', base = opts.texBase || '../../brand/textures/';
    var k = {id:id, dark:dark, parts:[]};
    var tex = {clay:'stone-clay.jpg', char:'stone-char.jpg', sand:'stone-sand.jpg', hatch:'hatch-sand.jpg', ochre:'halftone-ochre.jpg', paper:'paper.jpg'};
    k.defs = '<defs>' + Object.keys(tex).map(function(t){
      return '<pattern id="' + id + '-' + t + '" patternUnits="userSpaceOnUse" width="520" height="520"><image href="' + base + tex[t] + '" width="520" height="520" preserveAspectRatio="xMidYMid slice"/></pattern>'; }).join('') +
      '<linearGradient id="' + id + '-lit" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + C.surface + '" stop-opacity=".30"/><stop offset=".42" stop-color="' + C.surface + '" stop-opacity="0"/><stop offset=".7" stop-color="' + C.ink + '" stop-opacity="0"/><stop offset="1" stop-color="' + C.ink + '" stop-opacity=".22"/></linearGradient>' +
      '<filter id="' + id + '-sh" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="11"/></filter>' +
      '<filter id="' + id + '-sh2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter></defs>';
    var shA = dark ? .62 : .26, shB = dark ? .5 : .16;
    k.fill = function(t){ return t[0] === '#' || t.indexOf('rgba') === 0 ? t : 'url(#' + id + '-' + t + ')'; };
    /* a solid body: soft directional shadow (light from upper left), material, lit overlay */
    k.solid = function(d, t, o){ o = o || {};
      var s = '';
      if (o.shadow !== false) s += '<path d="' + d + '" fill="' + A(C.ink, o.shA || shA) + '" filter="url(#' + id + '-sh)" transform="translate(' + (o.dx || 16) + ' ' + (o.dy || 22) + ')"/>' +
                                   '<path d="' + d + '" fill="' + A(C.ink, shB) + '" filter="url(#' + id + '-sh2)" transform="translate(4 6)"/>';
      s += '<path d="' + d + '" fill="' + k.fill(t) + '"' + (o.stroke ? ' stroke="' + o.stroke + '" stroke-width="' + (o.sw || 1.5) + '"' : '') + '/>';
      if (o.lit !== false) s += '<path d="' + d + '" fill="url(#' + id + '-lit)"/>';
      return s; };
    k.bar = function(x, y, w, h, c){ return '<path d="' + rr(x, y, w, h, h / 2) + '" fill="' + c + '"/>'; };
    k.lines = function(x, y, w, n, gap, h, c, seed){ var s = ''; for (var i = 0; i < n; i++) { var f = i === n - 1 ? .45 + .3 * frac(seed + i) : .86 + .14 * frac(seed * 3 + i); s += k.bar(x, y + i * gap, w * f, h, c); } return s; };
    k.page = function(x, y, w, h, o){ o = o || {}; return k.solid(rr(x, y, w, h, 6), C.surface, {lit:false, stroke:A(C.ink, .10), dx:o.dx, dy:o.dy}) ; };
    k.tick = function(cx, cy, r){ return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + C.clay + '"/><path d="M' + (cx - r * .42) + ' ' + (cy + r * .02) + 'l' + (r * .3) + ' ' + (r * .3) + 'l' + (r * .55) + ' ' + (-r * .6) + '" fill="none" stroke="' + C.paper + '" stroke-width="' + (r * .22) + '" stroke-linecap="round" stroke-linejoin="round"/>'; };
    k.wrap = function(vb, inner, label){ return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" role="img" aria-label="' + label + '" preserveAspectRatio="xMidYMid meet">' + k.defs + inner + '</svg>'; };
    k.bars = A(C.ink, .16); k.barsStrong = A(C.ink, .3); k.hl = A(C.clay, .28);
    return k;
  }
  function frac(x){ var v = Math.sin(x * 12.9898) * 43758.5453; return v - Math.floor(v); }

  var O = {};
  /* 1. bound law reports on a shelf — "find it in an authorised source" */
  O.reports = function(k){
    var s = '', x = 30, base = 420, spines = [['clay',78,330],['char',70,352],['sand',84,318],['clay',72,344],['char',90,360],['sand',76,326]];
    s += k.bar(10, base, 560, 8, k.dark ? A(C.paper, .18) : A(C.ink, .2));
    spines.forEach(function(sp, i){
      var w = sp[1], h = sp[2], y = base - h, d = rr(x, y, w, h, 7);
      s += k.solid(d, sp[0], {dx:10, dy:14});
      s += k.bar(x + 10, y + 26, w - 20, 7, A(C.paper, .42)) + k.bar(x + 10, y + 40, w - 20, 4, A(C.paper, .3));
      s += '<path d="' + rr(x + 14, y + 74, w - 28, 54, 4) + '" fill="' + A(C.paper, .34) + '"/>';
      s += k.bar(x + 10, base - 46, w - 20, 7, A(C.paper, .42));
      if (i === 3) s += '<path d="M' + (x + w / 2 - 8) + ' ' + (y - 2) + 'v-38l8 -10l8 10v38z" fill="' + C.clay + '"/>'; // ribbon marker, square tail
      x += w + 6;
    });
    // one volume pulled forward and leaning, the one you open
    var lx = x + 26;
    s += '<g transform="rotate(14 ' + (lx + 40) + ' ' + base + ')">' + k.solid(rr(lx, base - 300, 80, 300, 7), 'clay', {dx:14, dy:16}) + k.bar(lx + 10, base - 274, 60, 7, A(C.paper, .42)) + '<path d="' + rr(lx + 14, base - 226, 52, 54, 4) + '" fill="' + A(C.paper, .34) + '"/></g>';
    return k.wrap('0 0 700 470', s, 'Bound law reports on a shelf');
  };
  /* 2. case files stacked — "a filing" */
  O.files = function(k){
    var s = '';
    function folder(x, y, w, h, t, tabX){ var d = 'M' + (x + 8) + ' ' + y + 'H' + (x + tabX) + 'q8 0 12 -10l8 -18q4 -8 12 -8H' + (x + tabX + 150) + 'q8 0 8 8V' + y + 'H' + (x + w - 8) + 'q8 0 8 8V' + (y + h - 8) + 'q0 8 -8 8H' + (x + 8) + 'q-8 0 -8 -8V' + (y + 8) + 'q0 -8 8 -8Z'; return k.solid(d, t, {dx:14, dy:20}); }
    s += folder(60, 120, 470, 300, 'sand', 250);
    s += k.page(104, 96, 380, 290, {dx:6, dy:8}) + k.lines(140, 136, 300, 5, 30, 9, k.bars, 2);
    s += folder(40, 190, 480, 280, 'clay', 40);
    s += '<path d="' + rr(70, 300, 150, 40, 6) + '" fill="' + A(C.paper, .5) + '"/>';
    s += k.bar(86, 314, 118, 10, A(C.ink, .28));
    return k.wrap('0 40 580 470', s, 'Stacked case files');
  };
  /* 3. a ticked page — "the checks" */
  O.checked = function(k){
    var s = k.solid(rr(90, 300, 440, 150, 12), 'char', {dx:12, dy:16});
    s += '<g transform="rotate(-4 300 240)">' + k.page(120, 30, 380, 400);
    s += k.bar(156, 70, 160, 12, k.barsStrong);
    [0, 1, 2].forEach(function(i){ var y = 140 + i * 88; s += k.tick(172, y, 22) + k.lines(212, y - 16, 250, 2, 26, 9, k.bars, i + 4); });
    s += '</g>';
    return k.wrap('0 0 620 470', s, 'A page with three ticked checks');
  };
  /* 4. open law report — "read the paragraph" */
  O['open-book'] = function(k){
    var s = k.solid('M40 120 Q170 90 300 130 Q430 90 560 120 V420 Q430 392 300 432 Q170 392 40 420 Z', 'clay', {dx:16, dy:22});
    var pageL = 'M60 110 Q180 82 296 118 V414 Q180 380 60 404 Z', pageR = 'M304 118 Q420 82 540 110 V404 Q420 380 304 414 Z';
    s += '<path d="' + pageL + '" fill="' + C.surface + '"/><path d="' + pageR + '" fill="' + C.surface + '"/>';
    s += '<path d="M296 118 V414 M304 118 V414" fill="none" stroke="' + A(C.ink, .14) + '" stroke-width="3"/>';
    s += '<path d="' + pageL + '" fill="url(#' + k.id + '-lit)" opacity=".5"/>';
    for (var i = 0; i < 9; i++) { var y = 140 + i * 28; s += k.bar(86, y + (i < 4 ? -4 : 0), 180 - (i % 4 === 3 ? 70 : 0), 8, k.bars); }
    s += '<path d="' + rr(322, 196, 202, 74, 6) + '" fill="' + k.hl + '"/>';
    for (var j = 0; j < 9; j++) { var y2 = 140 + j * 28; s += k.bar(332, y2 + (j < 4 ? -4 : 0), 180 - (j % 4 === 3 ? 70 : 0), 8, j >= 2 && j <= 4 ? k.barsStrong : k.bars); }
    s += '<path d="' + rr(530, 200, 6, 64, 3) + '" fill="' + C.clay + '"/>';
    return k.wrap('0 50 600 420', s, 'An open law report with one paragraph highlighted');
  };
  /* 5. a generic court facade in sand stone — no emblem, no scales */
  O.courthouse = function(k){
    var s = '';
    s += k.solid(rr(40, 410, 540, 34, 4), 'sand', {dx:12, dy:14}) + k.solid(rr(70, 382, 480, 32, 4), 'sand', {dx:8, dy:10}) + k.solid(rr(96, 356, 428, 30, 4), 'sand', {dx:6, dy:8});
    for (var i = 0; i < 6; i++) { var x = 118 + i * 72; s += k.solid(rr(x, 176, 40, 180, 4), 'sand', {dx:8, dy:10}); s += '<path d="M' + (x + 13) + ' 182V350M' + (x + 27) + ' 182V350" fill="none" stroke="' + A(C.ink, .14) + '" stroke-width="3"/>'; }
    s += k.solid(rr(92, 150, 436, 30, 4), 'sand', {dx:8, dy:10});
    s += k.solid('M86 150 L310 56 L534 150 Z', 'sand', {dx:10, dy:12});
    s += '<path d="M140 136 L310 76 L480 136 Z" fill="none" stroke="' + A(C.ink, .16) + '" stroke-width="3" stroke-linejoin="round"/>';
    return k.wrap('0 30 620 440', s, 'A generic court building facade');
  };
  /* 6. calendar with one date circled — "match the date" */
  O.calendar = function(k){
    var s = k.solid(rr(110, 70, 400, 380, 14), C.surface, {lit:false, stroke:A(C.ink, .10)});
    s += '<path d="M110 84 Q110 70 124 70 H496 Q510 70 510 84 V150 H110 Z" fill="' + k.fill('clay') + '"/><path d="M110 84 Q110 70 124 70 H496 Q510 70 510 84 V150 H110 Z" fill="url(#' + k.id + '-lit)"/>';
    s += k.bar(150, 100, 120, 12, A(C.paper, .6));
    [190, 430].forEach(function(x){ s += '<path d="' + rr(x - 8, 46, 16, 50, 8) + '" fill="' + (k.dark ? C.paper : C.ink) + '"/>'; });
    for (var r = 0; r < 5; r++) for (var c = 0; c < 7; c++) { var x = 140 + c * 50, y = 178 + r * 52; s += '<path d="' + rr(x, y, 34, 30, 6) + '" fill="' + (r === 2 && c === 4 ? A(C.clay, .9) : A(C.ink, .09)) + '"/>'; }
    s += '<circle cx="357" cy="297" r="36" fill="none" stroke="' + C.thread + '" stroke-width="5"/>';
    return k.wrap('0 20 620 450', s, 'A calendar page with one date circled');
  };
  /* 7. a note slip held by a clip — "write down what you checked" */
  O.notes = function(k){
    var s = k.solid(rr(80, 260, 300, 170, 12), 'hatch', {dx:12, dy:16});
    s += '<g transform="rotate(3 330 240)">' + k.page(170, 60, 340, 380);
    for (var i = 0; i < 8; i++) s += '<path d="M200 ' + (140 + i * 34) + 'H480" fill="none" stroke="' + A(C.ink, .08) + '" stroke-width="2"/>' + (i < 6 ? k.bar(206, 124 + i * 34, i === 5 ? 120 : 210 + 50 * frac(i), 9, i === 1 ? C.clay : k.bars) : '');
    s += '<path d="M318 36 V96 Q318 112 334 112 Q350 112 350 96 V48 Q350 40 342 40 Q334 40 334 48 V92" fill="none" stroke="' + (k.dark ? C.edge : C.clayDark) + '" stroke-width="6" stroke-linecap="round"/></g>';
    return k.wrap('0 20 600 450', s, 'A note slip held by a clip');
  };
  /* 8. two pages joined by a thread — "this, not that" */
  O.compare = function(k){
    var s = '<g transform="rotate(-5 160 250)">' + k.page(40, 70, 220, 300);
    for (var i = 0; i < 6; i++) s += k.bar(66, 110 + i * 32, 160 - (i === 5 ? 60 : 0), 8, k.bars);
    s += k.bar(60, 172, 180, 5, C.clay) + '</g>';
    s += '<g transform="rotate(4 450 250)">' + k.page(340, 70, 220, 300);
    s += '<path d="' + rr(356, 150, 188, 70, 6) + '" fill="' + k.hl + '"/>';
    for (var j = 0; j < 6; j++) s += k.bar(366, 110 + j * 32, 160 - (j === 5 ? 60 : 0), 8, j >= 1 && j <= 3 ? k.barsStrong : k.bars);
    s += '</g>';
    s += '<path d="M262 250 C 290 214, 312 286, 338 250" fill="none" stroke="' + C.thread + '" stroke-width="5" stroke-linecap="round"/><circle cx="262" cy="250" r="9" fill="' + C.thread + '"/><circle cx="338" cy="250" r="9" fill="' + C.thread + '"/>';
    return k.wrap('0 30 600 400', s, 'Two pages joined by a clay thread');
  };
  /* 9. a judgment page on a stone desk block — "the paragraph" */
  O.judgment = function(k){
    var s = k.solid(rr(60, 330, 500, 110, 12), 'char', {dx:12, dy:16});
    s += '<g transform="rotate(-3 310 220)">' + k.page(150, 24, 320, 400);
    s += k.bar(250, 56, 120, 10, k.barsStrong) + k.bar(220, 78, 180, 7, k.bars);
    var y = 116;
    for (var p = 0; p < 4; p++) { var n = p === 1 ? 4 : 3; if (p === 1) s += '<path d="' + rr(184, y - 10, 262, n * 24 + 4, 5) + '" fill="' + k.hl + '"/><path d="' + rr(164, y - 8, 5, n * 24, 2.5) + '" fill="' + C.clay + '"/>';
      s += k.bar(178, y, 14, 7, k.barsStrong);
      for (var i = 0; i < n && y < 400; i++) { s += k.bar(200, y, i === n - 1 ? 130 : 236, 7, p === 1 ? k.barsStrong : k.bars); y += 24; } y += 16; }
    s += '</g>';
    return k.wrap('0 0 620 460', s, 'A judgment page with one paragraph highlighted');
  };
  /* 10. index-card register — "the record of what you checked" */
  O.register = function(k){
    var s = k.solid(rr(70, 250, 460, 190, 14), 'clay', {dx:14, dy:18});
    [[110, 120, 'sand'], [130, 150, C.surface], [150, 180, C.surface]].forEach(function(c, i){
      s += '<g transform="rotate(' + (i - 1) * 2 + ' 300 250)">' + k.solid(rr(c[0], c[1], 340, 200, 10), c[2], {lit:c[2] !== C.surface, stroke:A(C.ink, .1), dx:6, dy:8});
      if (i === 2) { s += k.tick(c[0] + 44, c[1] + 50, 18) + k.lines(c[0] + 80, c[1] + 40, 220, 1, 0, 10, k.barsStrong, 1) + k.lines(c[0] + 40, c[1] + 96, 260, 3, 28, 8, k.bars, 3); }
      s += '</g>';
    });
    return k.wrap('0 90 600 370', s, 'A stack of index cards, the top one ticked');
  };

  var API = {
    names: Object.keys(O),
    svg: function(name, opts){ opts = opts || {}; var f = O[name]; if (!f) throw new Error('Unknown motif ' + name); return f(Kit(opts)); },
    mount: function(el, name, theme){ el.innerHTML = API.svg(name, {theme:theme, texBase:API.texBase}); el.setAttribute('data-motif', name); }
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = API; return; }
  root.LVObjects = API;
  var me = document.currentScript && document.currentScript.src;
  API.texBase = me ? new URL('../../brand/textures/', me).href : '../../brand/textures/';
  function mountAll(){
    var lv = document.querySelector('.lv'), theme = lv ? lv.getAttribute('data-theme') : 'paper';
    document.querySelectorAll('[data-motif]').forEach(function(el){ API.mount(el, el.getAttribute('data-motif'), theme); });
  }
  root.LV = root.LV || {};
  var prevAfter = null;
  document.addEventListener('DOMContentLoaded', function(){
    mountAll();
    var fill = root.LV.fill;
    if (fill && !fill.__obj) { root.LV.fill = function(d){ var r = fill.apply(this, arguments); if (d && (d.motif || d.theme)) { if (d.motif) document.querySelectorAll('[data-motif]').forEach(function(el, i){ if (i === 0) el.setAttribute('data-motif', d.motif); }); mountAll(); } return r; }; root.LV.fill.__obj = true; }
  });
})(typeof window !== 'undefined' ? window : this);

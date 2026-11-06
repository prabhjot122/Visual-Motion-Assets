/* LawVriksh system runtime — slot filling + deterministic motion helpers.
   No network, no randomness, no requestAnimationFrame loops.

   Pipeline use (Playwright/Puppeteer, file:// URL):
     await page.goto('file:///…/carousel/statement.html?theme=dark');
     await page.evaluate(d => LV.fill(d), data);      // swap in copy
     await page.evaluate(() => window.__lvReady);      // fonts + images decoded
     // reels: for (f…) await page.evaluate(t => window.__renderAt(t), f / 30)
*/
(function(){
  'use strict';
  var LV = window.LV = window.LV || {};

  /* ---------- sanitising: title_html / body_html allow <b>, <br> and <span class="nowrap"> only ---------- */
  LV.sanitize = function(html){
    var s = String(html == null ? '' : html);
    s = s.replace(/<(\/?)(b|strong)\s*>/gi, '\u0001$1b\u0002')
         .replace(/<br\s*\/?>/gi, '\u0001br\u0002')
         .replace(/<span class="nowrap">/gi, '\u0001span class="nowrap"\u0002')
         .replace(/<\/span>/gi, '\u0001/span\u0002');
    s = s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return s.replace(/\u0001/g, '<').replace(/\u0002/g, '>');
  };

  function setText(el, v){ el.textContent = v == null ? '' : String(v); }
  function setHTML(el, v){ el.innerHTML = LV.sanitize(v); }
  function empty(v){ return v == null || v === '' || (Array.isArray(v) && !v.length); }
  function hide(el, on){ if (on) el.setAttribute('data-hidden',''); else el.removeAttribute('data-hidden'); }

  function fillItem(node, item){
    if (typeof item !== 'object' || item === null) item = { text: item };
    node.querySelectorAll('[data-field]').forEach(function(el){ var k = el.getAttribute('data-field'); if (k in item) setText(el, item[k]); });
    node.querySelectorAll('[data-field-html]').forEach(function(el){ var k = el.getAttribute('data-field-html'); if (k in item) setHTML(el, item[k]); });
    node.querySelectorAll('[data-field-optional]').forEach(function(el){ var k = el.getAttribute('data-field-optional'); hide(el, empty(item[k])); });
    var root = node.firstElementChild ? node : node;
    [].slice.call(node.children).forEach(function(ch){
      if (item.variant) ch.classList.add('is-' + item.variant);
      if (ch.hasAttribute('data-field')) setText(ch, item[ch.getAttribute('data-field')]);
      if (ch.hasAttribute('data-field-html')) setHTML(ch, item[ch.getAttribute('data-field-html')]);
    });
    return root;
  }

  LV.fill = function(data){
    data = data || {};
    var root = document.querySelector('.lv');
    if (!root) return;
    if (data.theme) root.setAttribute('data-theme', data.theme);
    if (data.counter) LV.counter(data.counter.index, data.counter.total);

    document.querySelectorAll('[data-slot]').forEach(function(el){
      var k = el.getAttribute('data-slot'); if (!(k in data) || k === 'counter') return;
      setText(el, data[k]); if (el.hasAttribute('data-optional')) hide(el, empty(data[k]));
    });
    document.querySelectorAll('[data-slot-html]').forEach(function(el){
      var k = el.getAttribute('data-slot-html'); if (!(k in data)) return;
      setHTML(el, data[k]); if (el.hasAttribute('data-optional')) hide(el, empty(data[k]));
    });
    document.querySelectorAll('[data-slot-list]').forEach(function(el){
      var k = el.getAttribute('data-slot-list'); if (!(k in data)) return;
      var tpl = el.querySelector('template'); if (!tpl) return;
      [].slice.call(el.children).forEach(function(c){ if (c !== tpl) el.removeChild(c); });
      (data[k] || []).forEach(function(item, i){
        var frag = tpl.content.cloneNode(true);
        frag.querySelectorAll('[data-index]').forEach(function(n){ n.textContent = String(i + 1); });
        frag.querySelectorAll('[data-index-pad]').forEach(function(n){ n.textContent = String(i + 1).padStart(2, '0'); });
        fillItem(frag, item);
        el.appendChild(frag);
      });
      if (el.hasAttribute('data-optional')) hide(el, empty(data[k]));
    });
    document.querySelectorAll('[data-slot-src]').forEach(function(el){
      var k = el.getAttribute('data-slot-src'); if (!(k in data)) return;
      var frame = el.closest('.slot-frame');
      if (empty(data[k])) { el.removeAttribute('src'); hide(el, true); if (frame) frame.classList.remove('is-filled'); }
      else { el.setAttribute('src', data[k]); hide(el, false); if (frame) frame.classList.add('is-filled'); }
    });
    document.querySelectorAll('[data-slot-alt]').forEach(function(el){
      var k = el.getAttribute('data-slot-alt'); if (k in data) el.setAttribute('alt', data[k] || '');
    });
    if (typeof window.__lvAfterFill === 'function') window.__lvAfterFill(data);
    return root;
  };

  /* counter + thread node position. The node advances page by page so a
     swiped carousel reads as one continuous thread. */
  LV.counter = function(index, total){
    var root = document.querySelector('.lv'); if (!root) return;
    index = Math.max(1, +index || 1); total = Math.max(index, +total || index);
    var pad = function(n){ return String(n).padStart(2, '0'); };
    document.querySelectorAll('[data-slot="counter"]').forEach(function(el){ el.textContent = pad(index) + ' / ' + pad(total); });
    var w = root.offsetWidth, sx = parseFloat(getComputedStyle(root).getPropertyValue('--safe-x')) || 72;
    var x = total > 1 ? sx + (w - 2 * sx) * (index - 1) / (total - 1) : w / 2;
    root.style.setProperty('--progress-x', x + 'px');
  };

  /* ---------- deterministic motion helpers ---------- */
  LV.clamp = function(v, a, b){ return Math.min(b, Math.max(a, v)); };
  LV.prog = function(t, start, dur){ return dur <= 0 ? (t >= start ? 1 : 0) : LV.clamp((t - start) / dur, 0, 1); };
  LV.ease = {
    linear: function(p){ return p; },
    out: function(p){ return 1 - Math.pow(1 - p, 3); },
    inOut: function(p){ return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; },
    outQuint: function(p){ return 1 - Math.pow(1 - p, 5); },
    /* gentle settle, no bounce past 1.02 */
    settle: function(p){ var q = 1 - p; return 1 - q * q * q * (1 + 0.6 * p); }
  };
  LV.lerp = function(a, b, p){ return a + (b - a) * p; };
  /* Reveal: opacity + vertical drift, all from t */
  LV.reveal = function(el, t, start, dur, dy){
    if (!el) return 0;
    var p = LV.ease.out(LV.prog(t, start, dur == null ? .6 : dur));
    el.style.opacity = p.toFixed(4);
    el.style.transform = 'translateY(' + ((1 - p) * (dy == null ? 28 : dy)).toFixed(2) + 'px)';
    return p;
  };
  /* Exit: fades and lifts everything in a scene before a transition */
  LV.exit = function(el, t, start, dur){
    if (!el) return;
    var p = LV.ease.inOut(LV.prog(t, start, dur == null ? .4 : dur));
    if (p > 0) { el.style.opacity = (1 - p).toFixed(4); }
  };

  /* register a scene: fn(t) must be pure in t */
  LV.scene = function(opts){
    window.__duration = opts.duration;
    window.__fps = opts.fps || 30;
    window.__renderAt = function(t){ t = Math.max(0, +t || 0); opts.render(t); return t; };
    window.__holdAt = opts.hold == null ? opts.duration * 0.7 : opts.hold;
  };

  /* ready: fonts and images decoded */
  window.__lvReady = new Promise(function(res){
    function done(){
      var imgs = [].slice.call(document.images).map(function(i){ return i.decode ? i.decode().catch(function(){}) : null; });
      Promise.all([document.fonts ? document.fonts.ready : null].concat(imgs)).then(function(){ res(true); });
    }
    if (document.readyState === 'complete') done(); else window.addEventListener('load', done);
  });

  /* boot: ?theme=dark|paper, ?index=2&total=8, window.LV_DATA */
  document.addEventListener('DOMContentLoaded', function(){
    var q = new URLSearchParams(location.search), d = {};
    if (window.LV_DATA) d = window.LV_DATA;
    if (q.get('theme')) d.theme = q.get('theme');
    if (q.get('index')) d.counter = { index: +q.get('index'), total: +(q.get('total') || q.get('index')) };
    var root = document.querySelector('.lv');
    if (root && !d.counter) {
      var c = root.getAttribute('data-counter');
      if (c) { var m = c.split('/'); d.counter = { index: +m[0], total: +m[1] }; }
    }
    LV.fill(d);
    if (typeof window.__renderAt === 'function') window.__renderAt(+(q.get('t') || window.__holdAt || 0));
  });
})();

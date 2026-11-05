/* LawVriksh system — reel motion kit: word splitting, captions, progress, transitions.
   Every function is pure in t (or p). Load after lv-runtime.js. */
(function(){
  'use strict';
  var LV = window.LV;

  /* Wrap every word of an element in <span class="w">, keeping <b> emphasis. Idempotent. */
  LV.splitWords = function(el){
    if (!el || el.__split) return el ? el.__split : [];
    var words = [];
    (function walk(node){
      [].slice.call(node.childNodes).forEach(function(c){
        if (c.nodeType === 3) {
          var parts = c.nodeValue.split(/(\s+)/), frag = document.createDocumentFragment();
          parts.forEach(function(p){
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var s = document.createElement('span'); s.className = 'w'; s.textContent = p; frag.appendChild(s); words.push(s);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(el);
    el.__split = words; return words;
  };
  /* Rise words in one after another */
  LV.wordsIn = function(el, t, start, stagger, dur){
    var ws = LV.splitWords(el);
    ws.forEach(function(w, i){
      var p = LV.ease.out(LV.prog(t, start + i * (stagger || .08), dur || .5));
      w.style.opacity = p.toFixed(4); w.style.transform = 'translateY(' + ((1 - p) * 0.32).toFixed(3) + 'em)';
    });
  };

  /* ---------- captions ----------
     words: [{w:'Find', s:0.20, e:0.48}, …]  (seconds, from the voiceover timing)
     Pages of up to `per` words are shown; the current word gets .is-now. */
  LV.captions = function(box, words, t, per){
    if (!box) return;
    per = per || +box.getAttribute('data-per') || 4;
    if (!words || !words.length) { box.setAttribute('data-hidden', ''); return; }
    var pages = []; for (var i = 0; i < words.length; i += per) pages.push(words.slice(i, i + per));
    /* never leave a lone last word: borrow one from the page before */
    if (pages.length > 1 && pages[pages.length - 1].length === 1) { var prev = pages[pages.length - 2]; pages[pages.length - 1].unshift(prev.pop()); }
    var pi = 0; for (var j = 0; j < pages.length; j++) if (t >= pages[j][0].s - 0.05) pi = j;
    var page = pages[pi], last = page[page.length - 1];
    var line = box.querySelector('.cap-line');
    var key = pi + ':' + page.length;
    if (line.__key !== key) {
      line.innerHTML = '';
      page.forEach(function(wd){ var s = document.createElement('span'); s.className = 'cw'; s.textContent = wd.w; line.appendChild(s); line.appendChild(document.createTextNode(' ')); });
      line.__key = key;
    }
    var spans = line.querySelectorAll('.cw');
    page.forEach(function(wd, k){ spans[k].classList.toggle('is-now', t >= wd.s && t < (k + 1 < page.length ? page[k + 1].s : wd.e + 0.25)); spans[k].classList.toggle('is-past', t >= wd.e); });
    var visible = t >= page[0].s - 0.05 && t <= last.e + 0.6;
    box.style.opacity = visible ? '1' : '0';
    box.removeAttribute('data-hidden');
  };

  /* ---------- progress thread + counter ---------- */
  LV.progress = function(root, t, duration, index, total){
    var bar = root.querySelector('.reel-progress'); if (!bar) return;
    var seg = total ? 1 / total : 1, base = total ? (index - 1) * seg : 0;
    var f = LV.clamp(base + seg * LV.clamp(t / duration, 0, 1), 0, 1);
    bar.style.setProperty('--f', f.toFixed(5));
    var c = root.querySelector('[data-slot="reel_counter"]');
    if (c && total) c.textContent = String(index).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
  };

  /* ---------- transitions ----------
     LV.transitions[name](overlay, p): p 0..1. At p = 0.5 the overlay covers the
     whole 1080x1920 frame, opaque. Switch scenes exactly at p >= 0.5. */
  var T = LV.transitions = {};
  function show(ov, on){ ov.style.visibility = on ? 'visible' : 'hidden'; }

  /* 1. clay wipe: a clay panel sweeps across left to right */
  T['clay-wipe'] = function(ov, p){
    show(ov, p > 0 && p < 1);
    var x = p < .5 ? -100 + 100 * LV.ease.inOut(p / .5) : 100 * LV.ease.inOut((p - .5) / .5);
    ov.querySelector('.tw-panel').style.transform = 'translateX(' + x.toFixed(3) + '%)';
  };
  /* 2. paper fold: two paper leaves fold in from top and bottom, meet, fold away */
  T['paper-fold'] = function(ov, p){
    show(ov, p > 0 && p < 1);
    var a = p < .5 ? LV.ease.inOut(p / .5) : 1 - LV.ease.inOut((p - .5) / .5);
    var top = ov.querySelector('.tw-top'), bot = ov.querySelector('.tw-bot');
    top.style.transform = 'perspective(2400px) rotateX(' + (-90 * (1 - a)).toFixed(3) + 'deg)';
    bot.style.transform = 'perspective(2400px) rotateX(' + (90 * (1 - a)).toFixed(3) + 'deg)';
    var crease = ov.querySelector('.tw-crease'); if (crease) crease.style.opacity = (a * a).toFixed(3);
  };
  /* 3. stone slide: three stone slabs slide up in a stagger, overlapping, then leave upwards */
  T['stone-slide'] = function(ov, p){
    show(ov, p > 0 && p < 1);
    [].slice.call(ov.querySelectorAll('.tw-slab')).forEach(function(s, i){
      var d = i * .06, inP = LV.ease.outQuint(LV.clamp((p - d) / (.5 - .12), 0, 1)), outP = LV.ease.inOut(LV.clamp((p - .5 - d * .5) / (.5 - .12), 0, 1));
      var y = 110 * (1 - inP) - 110 * outP;
      s.style.transform = 'translateY(' + y.toFixed(3) + '%)';
    });
  };
  /* 4. thread draw: a clay thread draws across, thickens to fill the frame, then thins away */
  T['thread-draw'] = function(ov, p){
    show(ov, p > 0 && p < 1);
    var line = ov.querySelector('.tw-thread');
    var draw = LV.ease.inOut(LV.clamp(p / .22, 0, 1));
    var grow = p < .5 ? LV.ease.inOut(LV.clamp((p - .2) / .3, 0, 1)) : 1 - LV.ease.inOut(LV.clamp((p - .5) / .5, 0, 1));
    var h = 6 + (1940 - 6) * grow;
    line.style.width = (draw * 100).toFixed(3) + '%';
    line.style.height = h.toFixed(2) + 'px';
    line.style.top = (1920 / 2 - h / 2).toFixed(2) + 'px';
    var node = ov.querySelector('.tw-node');
    node.style.left = (draw * 100).toFixed(3) + '%'; node.style.opacity = grow > .02 ? '0' : '1';
  };
  /* 5. ink iris: warm ink spreads from a thread node into the full frame, then recedes to the next node */
  T['ink-iris'] = function(ov, p){
    show(ov, p > 0 && p < 1);
    var R = 2300, r, cx, cy;
    if (p < .5) { r = R * LV.ease.inOut(p / .5); cx = 72; cy = 276; }
    else { r = R * (1 - LV.ease.inOut((p - .5) / .5)); cx = 1008; cy = 276; }
    ov.querySelector('.tw-ink').style.clipPath = 'circle(' + r.toFixed(2) + 'px at ' + cx + 'px ' + cy + 'px)';
  };
  /* 6. ink-to-paper flip: an ink leaf turns over its spine and lands paper side up */
  T['ink-paper-flip'] = function(ov, p){
    show(ov, p > 0 && p < 1);
    var leaf = ov.querySelector('.tw-leaf');
    // first half: ink face swings in from the right edge (scaleX 0 -> 1, anchored right)
    // second half: paper face swings out to the left edge (scaleX 1 -> 0, anchored left)
    if (p < .5) { var a = LV.ease.inOut(p / .5); leaf.className = 'tw-leaf is-ink'; leaf.style.transformOrigin = '100% 50%'; leaf.style.transform = 'scaleX(' + a.toFixed(4) + ')'; }
    else { var b = 1 - LV.ease.inOut((p - .5) / .5); leaf.className = 'tw-leaf is-paper'; leaf.style.transformOrigin = '0% 50%'; leaf.style.transform = 'scaleX(' + b.toFixed(4) + ')'; }
    var sh = ov.querySelector('.tw-shade'); if (sh) sh.style.opacity = p < .5 ? (LV.ease.inOut(p / .5) * .35).toFixed(4) : '0';
  };
  /* note: at exactly p = 0.5 every transition above is opaque edge to edge */
})();

// Services page script: the inline <script> of site/src/services.html, unchanged inside init() except where marked
// "PORT:". usePage('services', init) runs it once the page markup is mounted (after the shared per-page runtime);
// the returned function stops it when the visitor navigates away.
// GSAP tweens and ScrollTriggers created synchronously here are reverted automatically (usePage wraps init in a
// gsap.context), so the cleanup only has to stop what GSAP doesn't own: the rAF loop, observers and listeners.
export function init() {
  'use strict';
  var X = window.INFRAX || {}, reduce = !!X.reduce, G = !!(window.gsap && window.ScrollTrigger);
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  // one shared tick; it sleeps when no card is on screen, the tab is hidden or the demo modal covers the page (none under reduced motion)
  var jobs = [], t0 = performance.now(), raf = 0;
  var observers = [], stopped = false; // PORT: kept so the cleanup can stop them
  function covered() { return !!(window.INFRAX && INFRAX.covered); }
  function wake() { if (!reduce && !raf && !stopped) raf = requestAnimationFrame(tick); }
  function tick(now) {
    raf = 0; if (document.hidden || covered()) return;
    var t = (now - t0) / 1000, any = false;
    jobs.forEach(function (j) { if (j.vis) { any = true; j.fn(t); } });
    if (any) raf = requestAnimationFrame(tick);
  }
  function onFrame(node, fn) { var job = { fn: fn, vis: false }; jobs.push(job); var io = new IntersectionObserver(function (es) { job.vis = es[0].isIntersecting; if (job.vis) wake(); }); io.observe(node); observers.push(io); return job; }
  document.addEventListener('visibilitychange', wake); document.addEventListener('infrax:cover', wake);

  /* ---------- service card mini animations (straight paths, always running at full pace; no hover effect) ---------- */
  $$('.sv-card').forEach(function (card) {
    var k = card.getAttribute('data-k'), svg = card.querySelector('svg'), energy = 1, target = 1;
    var ex = {};
    if (k === 'api') { ex.pk = svg.querySelector('.pk'); ex.pk2 = svg.querySelector('.pk2'); }
    if (k === 'apps') { ex.bars = []; var bg = svg.querySelector('.bars'); for (var i = 0; i < 8; i++) ex.bars.push(el('rect', { x: 28 + i * 20, width: 12, rx: 2, y: 60, height: 12 }, bg)); }
    if (k === 'video') { ex.det = svg.querySelector('.det'); ex.cone = svg.querySelector('.cone'); ex.bar = svg.querySelector('.scanbar'); }
    if (k === 'handover') {
      ex.ticks = []; var tg = svg.querySelector('.ticks');
      ['Env', 'Tests', 'Docs', 'Own'].forEach(function (lbl, i) {
        var x = 40 + i * 74, g = el('g', {}, tg);
        var c = el('circle', { cx: x, cy: 46, r: 11, fill: '#fff', stroke: '#C5D4E2', 'stroke-width': 1.5 }, g);
        el('path', { d: 'M' + (x - 4.5) + ' 46 l3.2 3.4 l6 -7', fill: 'none', stroke: '#fff', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
        var tx = el('text', { x: x, y: 80, 'text-anchor': 'middle', 'font-family': 'Geist Mono, monospace', 'font-size': 12, fill: '#5B6E82' }, g); tx.textContent = lbl;
        ex.ticks.push(c);
      });
    }
    var job = onFrame(card, function (t) {
      energy += (target - energy) * .1;
      var sp = .35 + energy * .5;
      if (k === 'api') { ex.pk.setAttribute('x', 72 + 142 * ((t * sp) % 1)); ex.pk2.setAttribute('x', 216 - 144 * ((t * sp + .5) % 1)); }
      else if (k === 'apps') ex.bars.forEach(function (b, i) { var h = 14 + (Math.abs(Math.sin(i * 1.3 + Math.floor(t * 2 * sp + i) * .7))) * 30 * (.5 + energy * .5); b.setAttribute('y', (74 - h).toFixed(1)); b.setAttribute('height', h.toFixed(1)); });
      else if (k === 'video') { var p = (t * sp) % 1; ex.bar.setAttribute('x', (62 + 112 * p).toFixed(1)); ex.cone.setAttribute('fill-opacity', (.06 + .08 * energy).toFixed(3)); ex.det.setAttribute('stroke-opacity', p > .7 ? 1 : .35); }
      else if (k === 'handover') { var n = Math.floor((t * 1.2) % 5); ex.ticks.forEach(function (c, i) { var on = i < n; c.setAttribute('fill', on ? '#2673B5' : '#fff'); c.setAttribute('stroke', on ? '#2673B5' : '#C5D4E2'); }); }
    });
    if (reduce) { target = energy = 1; job.fn(0); }
  });

  /* ---------- engagement rail: fills once, lights each phase ---------- */
  (function () {
    var fill = document.getElementById('svRailFill'), dots = $$('#svRail .sv-rail-dot'), ph = $$('#svPhases li');
    function on(i) { dots.forEach(function (d, k) { d.classList.toggle('on', k <= i); }); ph.forEach(function (p, k) { p.classList.toggle('on', k <= i); }); }
    if (G && !reduce) {
      on(-1);
      var tl = gsap.timeline({ paused: true });
      tl.to(fill, { scaleX: 1, duration: .9, ease: 'power2.inOut' });
      [0, 1, 2, 3].forEach(function (i) { tl.add(function () { on(i); }, i * .45); });
      ScrollTrigger.create({ trigger: '#svRail', start: 'top 80%', once: true, onEnter: function () { tl.play(); } });
    } else { fill.style.transform = 'scaleX(1)'; on(3); }
  })();


  /* ---------- entrances ---------- */
  if (G && !reduce) {
    [['.sv-card', '#svCards']].forEach(function (pair) {
      gsap.fromTo(pair[0], { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .45, ease: 'expo.out', stagger: .04, clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: pair[1], start: 'top 88%', once: true } });
    });
  }

  // PORT: the static page ended with a loader for assets/icons.js; the shared runtime now renders the icons on every page.

  // PORT: cleanup for client-side navigation away from this page
  return function stop() {
    stopped = true;
    cancelAnimationFrame(raf); raf = 0;
    observers.forEach(function (io) { io.disconnect(); });
    document.removeEventListener('visibilitychange', wake); document.removeEventListener('infrax:cover', wake);
  };
}

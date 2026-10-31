/* INFRAX.AI site — shared runtime (port of site/assets/site.js).

   The static site ran site.js once per full page load. In the Next.js app the shell (nav, footer, demo dialog,
   plexus background) stays mounted across client-side navigations and only <main> changes, so site.js is split in two:

     bootSite(router)  runs ONCE per browser session: the INFRAX.* helpers, plexus background, nav/menu/sheet behaviour,
                       Lenis smooth scroll, the Book a demo dialog, Gmail compose links, wave page transitions, no-copy.
     enterPage(page)   runs every time a page mounts (from usePage, before the page's own init): body[data-page],
                       [data-reveal] / [data-magnetic] / canvas[data-net] / mailto links inside <main>, section
                       observers, icons, scroll to top or #anchor. Returns leave(), which undoes the per-page parts.

   The code inside is site.js unchanged except where marked "PORT:". Everything else in this file is site.js. */
import { installGlobals } from './globals';
import { bootIcons } from './icons';

import { PAGES, pageForPath } from './site-data';
export { PAGES, pageForPath };

// PORT: escape hatch. A route listed here is always opened with a full document load (like the static site did) instead
// of a client-side navigation. Use it only if that page's script truly cannot be torn down and re-run.
export const HARD_NAV = new Set([]);

// internal page links: "/", "/products", "/services#sv-path" ... (the static site matched "products.html#x")
const ROUTE = /^\/(products|analytics|deployment|how-it-works|integrations|services)?(#[a-z0-9-]+)?$/i;

let booted = false, routerRef = null;
const rt = {}; // closures shared between bootSite() and enterPage()

export function bootSite(router) {
  if (router) routerRef = router;
  if (booted || typeof window === 'undefined') return;
  booted = true;
  installGlobals();

  /* canvas safety: animated radii can dip below zero for a frame; clamp instead of throwing */
  (function () {
    var P = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype; if (!P || P.__arcSafe) return;
    var arc = P.arc, ell = P.ellipse;
    P.arc = function (x, y, r, a, b, c) { return arc.call(this, x, y, r > 0 ? r : 0, a, b, c); };
    if (ell) P.ellipse = function (x, y, rx, ry, rot, a, b, c) { return ell.call(this, x, y, rx > 0 ? rx : 0, ry > 0 ? ry : 0, rot, a, b, c); };
    P.__arcSafe = true;
  })();

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var X = (window.INFRAX = window.INFRAX || {});
  X.reduce = reduce;
  rt.reduce = reduce; rt.X = X;
  // shared breakpoints (same values as site.css) and the light-motion flag for phones/touch
  X.mq = { phone: '(max-width:480px)', tablet: '(max-width:768px)', laptop: '(max-width:1024px)', wide: '(min-width:1440px)' };
  function mm(q) { return window.matchMedia ? matchMedia(q) : { matches: false }; }
  function onMq(m, fn) { if (m.addEventListener) m.addEventListener('change', fn); else if (m.addListener) m.addListener(fn); }
  var liteQ = mm('(max-width:768px),(pointer:coarse)');
  X.lite = liteQ.matches;
  onMq(liteQ, function () { X.lite = liteQ.matches; });
  // integrated and phone GPUs (Intel UHD/Iris, Mali, Adreno ...): the 3D scenes drop MSAA and shadows there, which
  // roughly doubles their frame rate. Read once, on first use, from a throwaway WebGL context.
  var lowGpu = null;
  Object.defineProperty(X, 'lowGPU', { configurable: true, get: function () {
    if (lowGpu === null) try {
      var g = document.createElement('canvas').getContext('webgl'), e = g && g.getExtension('WEBGL_debug_renderer_info');
      lowGpu = !!e && /Intel|UHD|Iris|HD Graphics|Mali|Adreno|PowerVR|SwiftShader|llvmpipe|Basic Render/i.test(g.getParameter(e.UNMASKED_RENDERER_WEBGL));
      var lc = g && g.getExtension('WEBGL_lose_context'); if (lc) lc.loseContext();
    } catch (err) { lowGpu = false; }
    return lowGpu;
  } });
  // compile a three.js scene's shaders without freezing the page: start every program link at once and let the GPU
  // work while the page stays responsive (renderer.compile alone waits on each link in turn, which takes seconds on
  // office laptops). done() runs when they are ready. Shadow-pass shaders still compile on the first draw.
  X.warmGL = window.INFRAX_WARM = function (renderer, scene, cam, done) {
    var gl = renderer.getContext(), ext = gl.getExtension('KHR_parallel_shader_compile'), t0 = performance.now();
    if (!ext) { try { renderer.compile(scene, cam); } catch (e) { } return done(); }
    // pass 1: three.js links a program and then reads its uniforms, which waits for the link; stop each object there
    // (the program stays cached) so the next one starts linking at once
    var gpp = gl.getProgramParameter, PEND = {}, proxy = Object.create(scene);
    // compile() briefly flips a transparent double-sided material to back then front side; a bail-out mid-way must put it back
    proxy.traverse = function (cb) { scene.traverse(function (o) {
      var mats = [].concat(o.material || []), sides = mats.map(function (m) { return m.side; });
      try { cb(o); } catch (e) { mats.forEach(function (m, i) { m.side = sides[i]; }); if (e !== PEND) throw e; }
    }); };
    gl.getProgramParameter = function (p, k) { if (k === gl.ACTIVE_UNIFORMS && !gpp.call(gl, p, ext.COMPLETION_STATUS_KHR)) throw PEND; return gpp.call(gl, p, k); };
    try { renderer.compile(proxy, cam); } catch (e) { } finally { delete gl.getProgramParameter; }
    (function poll() {
      var ps = renderer.info.programs || [], ok = true;
      for (var i = 0; i < ps.length && ok; i++) if (!gpp.call(gl, ps[i].program, ext.COMPLETION_STATUS_KHR)) ok = false;
      if (!ok && performance.now() - t0 < 8000) return setTimeout(poll, 40);
      try { renderer.compile(scene, cam); } catch (e) { } // pass 2: every link is done, so this only reads uniforms
      done();
    })();
  };
  X.isMobile = function () { return mm(X.mq.tablet).matches; };
  // true while the demo modal covers the page; 'infrax:cover' fires on document when it changes
  X.covered = false;
  function setCovered(v) { if (X.covered === v) return; X.covered = v; try { document.dispatchEvent(new CustomEvent('infrax:cover', { detail: { covered: v } })); } catch (e) {} }

  /* ---------- original plexus background ---------- */
  (function plexus() {
    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:.5';
    document.body.prepend(canvas);
    // the faint blueprint grid under the network (globals.css .site-grid), behind the canvas
    var gridEl = document.createElement('div'); gridEl.className = 'site-grid'; gridEl.setAttribute('aria-hidden', 'true'); document.body.prepend(gridEl);
    // transparent canvas, cleared every frame: crisp lines and dots (no smeared trails) over the page's light wash (globals.css html)
    var ctx = canvas.getContext('2d'); if (!ctx) { X.pausePlexus = function () {}; rt.watchCovers = function () {}; return; }
    var particles = [], W = 0, H = 0, lineGrad = null;
    function vw() { return document.documentElement.clientWidth || innerWidth; }
    // 1 canvas px per CSS px (as the original); the layer sits at 34% opacity so higher DPR buys nothing
    function count() { return X.lite ? 40 : vw() <= 1024 ? 60 : 100; }
    // full strength behind the first screen, then a little lighter behind the reading sections
    var OP0 = .7, OP1 = .4, fq = 0;
    function fade() { fq = 0; var k = Math.min(1, (window.scrollY || 0) / (innerHeight * 1.1)); canvas.style.opacity = (OP0 - (OP0 - OP1) * k).toFixed(3); }
    addEventListener('scroll', function () { if (!fq) fq = requestAnimationFrame(fade); }, { passive: true }); fade();
    // sprite atlas, uploaded once as an ImageBitmap: 6 glows (by connection count 0..5), 2 drifting blobs, 3 solid dots (navy, blue, sky)
    var SPR = 32, D = 16, DOT = SPR * 6 + 200, atlas = document.createElement('canvas'); atlas.width = DOT + D * 3; atlas.height = 100;
    (function () {
      var ax = atlas.getContext('2d');
      for (var b = 0; b <= 5; b++) {
        var k = b / 5, cx = b * SPR + SPR / 2, g = ax.createRadialGradient(cx, SPR / 2, 0, cx, SPR / 2, SPR / 2);
        g.addColorStop(0, 'rgba(30,95,160,' + (.7 + k * .3) + ')'); g.addColorStop(.45, 'rgba(58,143,212,' + (.38 + k * .22) + ')'); g.addColorStop(1, 'rgba(110,196,240,0)');
        ax.fillStyle = g; ax.fillRect(b * SPR, 0, SPR, SPR);
      }
      [['38,115,181', '58,143,212', '110,196,240'], ['14,59,102', '38,115,181', '90,180,234']].forEach(function (c, i) {
        var bx = SPR * 6 + 50 + i * 100, g2 = ax.createRadialGradient(bx, 50, 0, bx, 50, 50);
        g2.addColorStop(0, 'rgba(' + c[0] + ',0.45)'); g2.addColorStop(.5, 'rgba(' + c[1] + ',0.24)'); g2.addColorStop(1, 'rgba(' + c[2] + ',0)');
        ax.fillStyle = g2; ax.fillRect(SPR * 6 + i * 100, 0, 100, 100);
      });
      ['#0E3B66', '#2673B5', '#5AB4EA'].forEach(function (col, i) { ax.fillStyle = col; ax.beginPath(); ax.arc(DOT + i * D + D / 2, D / 2, D / 2, 0, Math.PI * 2); ax.fill(); });
    })();
    var src = atlas;
    if (window.createImageBitmap) createImageBitmap(atlas).then(function (bm) { src = bm; if (reduce) still(); }, function () {});
    function init() {
      var oldW = W, oldH = H, n = count(), w = vw(), h = innerHeight;
      // mobile URL bar showing/hiding only changes the height a little: keep the scene (the canvas just stretches)
      if (oldW && w === oldW && Math.abs(h - oldH) < 150 && particles.length === n) return;
      W = canvas.width = w; H = canvas.height = h;
      shade();
      if (particles.length !== n || oldW === 0) {
        particles = [];
        for (var i = 0; i < n; i++) particles.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5, radius: Math.random() * 2 + 1, connections: 0 });
      } else if (oldW > 0 && oldH > 0) {
        var sx = W / oldW, sy = H / oldH;
        particles.forEach(function (p) { p.x *= sx; p.y *= sy; });
      }
      if (reduce) still();
    }
    // the lines shade across the screen: navy top left, brand blue in the middle, sky blue bottom right
    // (dark theme: brand blue to sky to pale sky, so they read on navy)
    var dark = false;
    function shade() {
      dark = document.documentElement.getAttribute('data-theme') === 'dark';
      lineGrad = ctx.createLinearGradient(0, 0, W, H);
      var C = dark ? ['#3A8BD2', '#5AB4EA', '#A9D8F5'] : ['#0E3B66', '#2673B5', '#4FB0E6'];
      lineGrad.addColorStop(0, C[0]); lineGrad.addColorStop(.5, C[1]); lineGrad.addColorStop(1, C[2]);
    }
    document.addEventListener('infrax:theme', function () { shade(); if (reduce) still(); });
    var NB = 8, buckets = []; for (var q = 0; q < NB; q++) buckets.push([]);
    var grid = new Map();
    function frame(dtk) {
      ctx.clearRect(0, 0, W, H);
      var mob = W <= 768, maxD = mob ? 100 : 150, maxD2 = maxD * maxD, n = particles.length, i, p;
      grid.clear();
      for (i = 0; i < n; i++) {
        p = particles[i];
        if (!reduce) { p.x += p.vx * dtk; p.y += p.vy * dtk; }
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        p.x = Math.max(0, Math.min(W, p.x)); p.y = Math.max(0, Math.min(H, p.y));
        p.connections = 0;
        var key = ((p.x / maxD) | 0) * 4096 + ((p.y / maxD) | 0), cell = grid.get(key);
        if (cell) cell.push(i); else grid.set(key, [i]);
      }
      for (q = 0; q < NB; q++) buckets[q].length = 0;
      // spatial grid: only neighbouring cells can hold a particle closer than maxD
      for (i = 0; i < n; i++) {
        p = particles[i];
        var cx = (p.x / maxD) | 0, cy = (p.y / maxD) | 0;
        for (var gx = cx - 1; gx <= cx + 1; gx++) for (var gy = cy - 1; gy <= cy + 1; gy++) {
          var c = grid.get(gx * 4096 + gy); if (!c) continue;
          for (var m = 0; m < c.length; m++) {
            var j = c[m]; if (j <= i) continue;
            var o = particles[j], dx = p.x - o.x, dy = p.y - o.y, d2 = dx * dx + dy * dy;
            if (d2 < maxD2) {
              p.connections++; o.connections++;
              var a = (1 - Math.sqrt(d2) / maxD) * .25;
              buckets[Math.min(NB - 1, (a / .25 * NB) | 0)].push(p.x, p.y, o.x, o.y);
            }
          }
        }
      }
      // one path and one stroke per alpha bucket
      ctx.lineWidth = mob ? .8 : 1;
      ctx.strokeStyle = lineGrad;
      for (q = 0; q < NB; q++) {
        var L = buckets[q]; if (!L.length) continue;
        ctx.globalAlpha = (q + .5) / NB * .5;
        ctx.beginPath();
        for (var e = 0; e < L.length; e += 4) { ctx.moveTo(L[e], L[e + 1]); ctx.lineTo(L[e + 2], L[e + 3]); }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      for (i = 0; i < n; i++) { p = particles[i]; var R = p.radius * 3; ctx.drawImage(src, Math.min(5, p.connections) * SPR, 0, SPR, SPR, p.x - R, p.y - R, R * 2, R * 2); }
      // dot colour follows the same diagonal as the lines; well-connected dots go a shade deeper
      for (i = 0; i < n; i++) { p = particles[i]; var r = p.radius, tone = Math.min(2, ((p.x / W + p.y / H) * 1.5) | 0); if (p.connections > 3 && tone) tone--; if (dark) tone = Math.max(1, tone); ctx.drawImage(src, DOT + tone * D, 0, D, D, p.x - r, p.y - r, r * 2, r * 2); }
      // three soft glows drift slowly across the screen
      var cc = mob ? 2 : 3, cs = mob ? 35 : 50, t = reduce ? 0 : Date.now() * .001;
      for (var kk = 0; kk < cc; kk++) {
        var x = (Math.sin(t + kk * 2) * .5 + .5) * W, y = (Math.cos(t * .7 + kk * 2) * .5 + .5) * H;
        ctx.drawImage(src, SPR * 6 + (kk % 2) * 100, 0, 100, 100, x - cs, y - cs, cs * 2, cs * 2);
      }
    }
    // reduced motion: no loop; one settled frame
    function still() { frame(0); }
    // keeps moving while the page scrolls, time-based at 15 fps (10 on phones/touch: the drift is slow, so this reads as smooth); sleeps while hidden, covered or paused
    var last = 0, raf = 0, paused = false;
    function idle() { return reduce || paused || X.covered || document.hidden; }
    function loop(now) {
      raf = 0;
      if (idle()) { last = 0; return; }
      raf = requestAnimationFrame(loop);
      if (last && now - last < (X.lite ? 100 : 64)) return;
      var dtk = last ? Math.min(3, (now - last) / 16.667) : 1; last = now;
      frame(dtk);
    }
    function wake() { if (!raf && !idle()) { last = 0; raf = requestAnimationFrame(loop); } }
    X.pausePlexus = function (v) { paused = !!v; if (paused) { cancelAnimationFrame(raf); raf = 0; } else wake(); };
    // a full-screen opaque stage ([data-plexus-off]: the products tunnel, the home twin) hides the background, so it sleeps meanwhile
    // PORT: re-scanned on every page (rt.watchCovers, called by enterPage) since pages now swap without a reload
    var cio = null, under = [];
    rt.watchCovers = function () {
      if (cio) { cio.disconnect(); cio = null; }
      under = []; X.pausePlexus(false);
      var covers = document.querySelectorAll('[data-plexus-off]');
      if (covers.length && window.IntersectionObserver) {
        cio = new IntersectionObserver(function (es) {
          es.forEach(function (e) { var k = under.indexOf(e.target); if (e.intersectionRatio >= .97) { if (k < 0) under.push(e.target); } else if (k > -1) under.splice(k, 1); });
          X.pausePlexus(under.length > 0);
        }, { threshold: [0, .97, 1] });
        covers.forEach(function (el) { cio.observe(el); });
      }
    };
    document.addEventListener('visibilitychange', wake);
    document.addEventListener('infrax:cover', wake);
    var rsT = 0;
    init(); wake();
    addEventListener('resize', function () { clearTimeout(rsT); rsT = setTimeout(init, 120); });
    onMq(liteQ, init);
  })();

  /* ---------- small particle network (the page background's style) for light side panels: start/stop while shown ---------- */
  function makeNet(cv) {
      var cx = cv && cv.getContext && cv.getContext('2d'), P = [], W = 0, H = 0, raf = 0, sr = 0, on = false, last = 0, lg = null, ro = null;
      if (!cx) return { start: function () {}, stop: function () {}, destroy: function () {} };
      // seeded once; later sizes keep the particles and rescale their positions
      function size() {
        var r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2), w = r.width, h = r.height, i;
        if (!w || !h) return false;
        var cw = Math.round(w * d), ch = Math.round(h * d);
        if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; }
        cx.setTransform(d, 0, 0, d, 0, 0);
        if (!P.length) {
          var n = Math.round(Math.min(70, w * h / 7000));
          for (i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: 1.2 + Math.random() * 2.2 });
        } else if (W && H && (w !== W || h !== H)) for (i = 0; i < P.length; i++) { P[i].x *= w / W; P[i].y *= h / H; }
        W = w; H = h;
        lg = cx.createLinearGradient(0, 0, w, h); lg.addColorStop(0, '#0E3B66'); lg.addColorStop(.5, '#2673B5'); lg.addColorStop(1, '#4FB0E6');
        return true;
      }
      function draw(dt) {
        cx.clearRect(0, 0, W, H);
        var i, j, a, b, dx, dy, d2, L = 120 * 120;
        for (i = 0; i < P.length; i++) { a = P[i]; a.x += a.vx * dt; a.y += a.vy * dt; if (a.x < 0 || a.x > W) a.vx *= -1; if (a.y < 0 || a.y > H) a.vy *= -1; }
        for (i = 0; i < P.length; i++) for (j = i + 1; j < P.length; j++) {
          a = P[i]; b = P[j]; dx = a.x - b.x; dy = a.y - b.y; d2 = dx * dx + dy * dy;
          if (d2 < L) { cx.strokeStyle = lg; cx.globalAlpha = .34 * (1 - d2 / L); cx.lineWidth = 1; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke(); }
        }
        cx.globalAlpha = 1;
        for (i = 0; i < P.length; i++) { a = P[i]; cx.fillStyle = i % 5 ? ((a.x / W + a.y / H) > 1.1 ? 'rgba(79,176,230,.7)' : 'rgba(38,115,181,.6)') : 'rgba(14,59,102,.75)'; cx.beginPath(); cx.arc(a.x, a.y, a.r, 0, Math.PI * 2); cx.fill(); }
      }
      function loop(now) { raf = requestAnimationFrame(loop); var dt = last ? Math.min(3, (now - last) / 16.7) : 1; last = now; draw(dt); }
      // resizing clears the canvas: repaint at once so a running net never shows a blank frame
      if (window.ResizeObserver) (ro = new ResizeObserver(function () { if (on && size()) draw(0); })).observe(cv);
      var api = {
        start: function () {
          on = true; if (sr) return;
          sr = requestAnimationFrame(function () { sr = 0; if (!on) return; size(); if (reduce) draw(0); else if (!raf) { last = 0; raf = requestAnimationFrame(loop); } });
        },
        stop: function () { on = false; cancelAnimationFrame(sr); sr = 0; cancelAnimationFrame(raf); raf = 0; },
        // PORT: added so a page's nets can be released when the page unmounts
        destroy: function () { api.stop(); if (ro) ro.disconnect(); ro = null; }
      };
      return api;
    }
  X.makeNet = makeNet;
  rt.makeNet = makeNet;

  /* ---------- sections off screen pause their CSS loops (icons, overlays, pulses) ---------- */
  // PORT: rt.watchSections re-observes after each page mounts (the original watched once on DOMContentLoaded)
  (function () {
    if (!('IntersectionObserver' in window)) { rt.watchSections = function () {}; return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.toggleAttribute('data-off', !e.isIntersecting); }); }, { rootMargin: '200px 0px' });
    function watch() { document.querySelectorAll('main > section, .site-foot, .hm-pc-vis, .hm-agc, .hw-step').forEach(function (s) { io.observe(s); }); }
    rt.watchSections = function () { io.disconnect(); watch(); };
  })();

  /* ---------- nav ---------- */
  // PORT: aria-current on [data-nav] links and .is-current on the Products/Platform buttons are rendered by SiteNav from the route
  var nav = document.querySelector('.site-nav');
  var navScrolled = null;
  addEventListener('scroll', function () { var s = scrollY > 8; if (nav && s !== navScrolled) { navScrolled = s; nav.classList.toggle('scrolled', s); } }, { passive: true });
  document.querySelectorAll('.has-menu > button').forEach(function (b) {
    var li = b.parentElement;
    function closeOthers() { document.querySelectorAll('.has-menu').forEach(function (x) { if (x !== li) { x.classList.remove('open'); x.querySelector('button').setAttribute('aria-expanded', 'false'); if (x.contains(document.activeElement)) document.activeElement.blur(); } }); }
    b.addEventListener('click', function () { var o = !li.classList.contains('open'); closeOthers(); li.classList.toggle('open', o); b.setAttribute('aria-expanded', o); });
    li.addEventListener('mouseenter', closeOthers);
    li.addEventListener('mouseleave', function () {
      var a = document.activeElement, kb = a && a.matches && a.matches(':focus-visible');
      li.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); if (li.contains(a) && !kb) a.blur();
    });
    // keyboard: ArrowDown opens and moves into the menu; tabbing out of the item closes it
    b.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown') return; e.preventDefault(); closeOthers(); li.classList.add('open'); b.setAttribute('aria-expanded', 'true');
      var first = li.querySelector('.menu a'); if (first) first.focus();
    });
    li.addEventListener('focusout', function (e) { if (!li.contains(e.relatedTarget)) { li.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); } });
  });
  document.addEventListener('click', function (e) { document.querySelectorAll('.has-menu.open').forEach(function (li) { if (!li.contains(e.target)) { li.classList.remove('open'); li.querySelector('button').setAttribute('aria-expanded', 'false'); } }); });
  var toggle = document.querySelector('.nav-toggle'), sheet = document.querySelector('.sheet');
  if (toggle && sheet) toggle.addEventListener('click', function () {
    var o = !sheet.classList.contains('open'); sheet.classList.toggle('open', o); toggle.setAttribute('aria-expanded', o); toggle.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
    document.documentElement.style.overflow = o ? 'hidden' : '';
    ['main', '.site-foot'].forEach(function (s) { var el = document.querySelector(s); if (el) el.inert = o; });
    if (!o) toggle.focus();
  });
  // the sheet only exists up to the laptop breakpoint: growing past it with the sheet open would leave the page inert
  if (toggle && sheet) onMq(mm(X.mq.laptop), function (e) { if (!e.matches && sheet.classList.contains('open')) toggle.click(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (sheet && sheet.classList.contains('open')) toggle.click();
    document.querySelectorAll('.has-menu.open').forEach(function (li) {
      var mb = li.querySelector('button'); li.classList.remove('open'); mb.setAttribute('aria-expanded', 'false');
      if (li.contains(document.activeElement)) mb.focus();
    });
  });
  // PORT: closes the sheet and any open menu (used when a client-side navigation starts)
  rt.closeNav = function () {
    if (toggle && sheet && sheet.classList.contains('open')) toggle.click();
    document.querySelectorAll('.has-menu.open').forEach(function (li) { li.classList.remove('open'); li.querySelector('button').setAttribute('aria-expanded', 'false'); });
  };

  /* ---------- smooth scroll ---------- */
  // not inside a frame (the claude.ai preview): there JS-driven scrolling turns every busy frame into scroll stutter, so the browser scrolls natively
  var framed = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  if (!reduce && !framed && window.Lenis) {
    // lerp-based (frame-rate independent in Lenis 1.1), driven by GSAP's ticker below: one rAF loop for scroll + ScrollTrigger
    var lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, syncTouch: false });
    X.lenis = lenis;
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(500, 33);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
  }
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- every page opens at its top (or at its #anchor) ----------
     The browser/viewer can restore the previous page's scroll offset, which dropped visitors at the bottom
     of the next page. Force the start position until the visitor scrolls on their own. */
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  var userMoved = false;
  // where an #anchor lands: its heading sits just under the nav (not the section's padded top edge)
  function anchorY(el) { var h = el.querySelector('h1,h2') || el, n = document.querySelector('.site-nav'); return Math.max(0, h.getBoundingClientRect().top + scrollY - (n ? n.offsetHeight : 68) - 28); }
  X.anchorY = anchorY;
  function moved() { userMoved = true; }
  // PORT: re-armed for every page (rt.resetStart), since a client-side navigation is a new "page load"
  rt.resetStart = function () {
    userMoved = false;
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (ev) { removeEventListener(ev, moved); addEventListener(ev, moved, { passive: true, once: true }); });
  };
  function toStart() {
    if (userMoved) return;
    var id = location.hash.slice(1), el = id && document.getElementById(id);
    var y = el ? anchorY(el) : 0;
    if (id && !el) return; // page scripts handle their own deep links (e.g. solutions.html#toll)
    if (X.lenis) X.lenis.scrollTo(y, { immediate: true, force: true });
    window.scrollTo(0, y);
  }
  rt.toStart = toStart;
  addEventListener('pageshow', function (e) { if (e.persisted) { userMoved = false; toStart(); } });

  /* INFRAX.wave was the decorative bottom signal track; it has been removed. Kept as a harmless no-op for any old caller. */
  X.wave = function () { return { set: function () {}, destroy: function () {} }; };

  /* ---------- masked line reveal ---------- */
  X.split = function (el) {
    if (!el || el.dataset.splitDone) return [];
    el.dataset.splitDone = 1;
    var words = el.innerHTML.split(/(<br\s*\/?>)/i);
    var html = words.map(function (chunk) { return /^<br/i.test(chunk) ? chunk : chunk.trim() ? '<span class="split-line"><span>' + chunk + '</span></span>' : ''; }).join('');
    el.innerHTML = html.replace(/<br\s*\/?>/gi, '');
    return [].slice.call(el.querySelectorAll('.split-line>span'));
  };
  X.reveal = function (el, opts) {
    if (reduce || !window.gsap) return;
    var parts = X.split(el);
    gsap.from(parts, Object.assign({ yPercent: 110, duration: .65, ease: 'expo.out', stagger: .05 }, opts || {}));
  };

  /* ---------- buttons stay still under the cursor: the old "magnetic" pull is switched off site-wide.
     Kept as a no-op so the [data-magnetic] buttons and their callers need no change. ---------- */
  X.magnetic = function () {};
  // PORT: the shell's magnetic buttons (nav CTA) bind once here; [data-magnetic] and [data-reveal] inside <main> bind in enterPage
  document.querySelectorAll('[data-magnetic]').forEach(function (el) { if (!el.closest('main')) X.magnetic(el); });

  /* ---------- email links: mailto: opens the visitor's default mail app. If nothing takes the link (the page keeps
     focus and stays visible for 900 ms), a Gmail compose window addressed to us opens in a new tab instead.
     A browser that asks which app to use counts as handled, since its dialog takes the focus. ---------- */
  // PORT: kept as a function of a root (enterPage calls it on each new page); the links stay mailto:, so there is nothing to rewrite
  function mailLinks() {}
  rt.mailLinks = mailLinks;
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (!a || e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var to = decodeURIComponent(a.getAttribute('href').replace(/^mailto:/i, '').split('?')[0]);
    var gmail = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(to);
    var left = false, off = function () { left = true; };
    addEventListener('blur', off); document.addEventListener('visibilitychange', off);
    setTimeout(function () {
      removeEventListener('blur', off); document.removeEventListener('visibilitychange', off);
      if (left || document.hidden || !document.hasFocus()) return; // a mail app (or the browser's app chooser) took it
      var w = window.open(gmail, '_blank'); // not 'noopener': that always returns null, hiding a blocked pop-up
      if (w) w.opener = null; else if (!document.hidden) location.href = gmail; // pop-up blocked: open Gmail here instead
    }, 900);
  });

  /* ---------- Book a demo: centred modal for every a[href$="#demo"] (markup from components/site/DemoModal.jsx) ---------- */
  (function demoModal() {
    var dm = document.getElementById('demoModal'); if (!dm) return;
    // title words reveal one by one when the popup opens (styles in site.css)
    (function () {
      var t = document.getElementById('dmTitle'); if (!t) return;
      var words = t.textContent.trim().split(/\s+/);
      t.innerHTML = '<span class="sr-only">' + t.textContent.trim() + '</span>' + words.map(function (w, i) { return '<span class="dm-w" aria-hidden="true" style="--i:' + i + '">' + w + (i < words.length - 1 ? ' ' : '') + '</span>'; }).join('');
      var d = .35 + words.length * .07 + .15;
      var intro = dm.querySelector('.dm-intro'); if (intro) intro.style.setProperty('--d', d.toFixed(2) + 's');
      [].forEach.call(dm.querySelectorAll('.dm-steps li'), function (li, i) { li.style.setProperty('--d', (d + .15 + i * .1).toFixed(2) + 's'); });
    })();
    var dlg = dm.querySelector('.dm-dialog'), form = document.getElementById('dmForm'), ok = document.getElementById('dmOk');
    var net = null; // built on first open
    var trigger = null, closeT = 0, padR = document.body.style.paddingRight;
    var FOC = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
    function focusables() { return [].filter.call(dlg.querySelectorAll(FOC), function (n) { return n.offsetParent !== null || n === document.activeElement; }); }
    function open(from) {
      if (!dm.hidden && dm.classList.contains('is-open')) return;
      clearTimeout(closeT);
      trigger = from || document.activeElement;
      if (sheet && sheet.classList.contains('open')) toggle.click();
      document.querySelectorAll('.has-menu.open').forEach(function (li) { li.classList.remove('open'); });
      var sbw = innerWidth - document.documentElement.clientWidth;
      if (sbw > 0) document.body.style.paddingRight = sbw + 'px';
      document.documentElement.classList.add('dm-lock');
      if (X.lenis) X.lenis.stop();
      dm.hidden = false; dlg.scrollTop = 0;
      void dm.offsetWidth; // commit the hidden state so the open transition runs
      if (!net) net = makeNet(dm.querySelector('.dm-net'));
      dm.classList.add('is-open'); net.start(); setCovered(true);
      ['main', '.site-nav', '.site-foot'].forEach(function (s) { var el = document.querySelector(s); if (el) el.inert = true; });
      var first = form.hidden ? ok : dlg;
      setTimeout(function () { try { (first || dlg).focus({ preventScroll: true }); } catch (e) { (first || dlg).focus(); } }, 30);
    }
    function close() {
      if (dm.hidden) return;
      dm.classList.remove('is-open'); if (net) net.stop(); setCovered(false);
      ['main', '.site-nav', '.site-foot'].forEach(function (s) { var el = document.querySelector(s); if (el) el.inert = false; });
      closeT = setTimeout(function () {
        dm.hidden = true;
        document.documentElement.classList.remove('dm-lock');
        document.body.style.paddingRight = padR;
        if (X.lenis) X.lenis.start();
      }, reduce ? 0 : 230);
      if (trigger && sheet && sheet.contains(trigger) && toggle && toggle.offsetParent) trigger = toggle; // the sheet closed on open
      if (trigger && trigger.focus && document.contains(trigger)) { try { trigger.focus({ preventScroll: true }); } catch (e) { trigger.focus(); } }
      trigger = null;
    }
    X.demo = { open: open, close: close };
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href$="#demo"]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault(); open(a);
    });
    dm.addEventListener('click', function (e) { if (e.target.closest('[data-dm-close]')) close(); });
    dm.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
      if (e.key !== 'Tab') return;
      var f = focusables(); if (!f.length) { e.preventDefault(); return; }
      var i = f.indexOf(document.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && (i === -1 || i === f.length - 1)) { e.preventDefault(); f[0].focus(); }
    });
    // focus must not escape the dialog (e.g. clicking the page behind is impossible, but programmatic focus can)
    document.addEventListener('focusin', function (e) { if (!dm.hidden && dm.classList.contains('is-open') && !dm.contains(e.target)) { var f = focusables(); (f[0] || dlg).focus(); } });

    // the domain list in the site's own style: a select-only combobox over the native select, which keeps the value
    function fancySelect(sel) {
      if (!sel) return;
      var lab = document.querySelector('label[for="' + sel.id + '"]');
      var wrap = document.createElement('div'), btn = document.createElement('button'), list = document.createElement('ul');
      var opts = [].filter.call(sel.options, function (o) { return o.value; }), ph = sel.options[0] && !sel.options[0].value ? sel.options[0].text : '';
      var at = -1;
      wrap.className = 'dm-sel';
      btn.type = 'button'; btn.className = 'dm-sel-btn'; btn.id = sel.id + 'Btn';
      btn.setAttribute('role', 'combobox'); btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', sel.id + 'List');
      if (sel.getAttribute('aria-describedby')) btn.setAttribute('aria-describedby', sel.getAttribute('aria-describedby'));
      btn.innerHTML = '<span></span><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>';
      list.id = sel.id + 'List'; list.className = 'dm-sel-list'; list.setAttribute('role', 'listbox'); list.hidden = true;
      if (lab) { lab.htmlFor = btn.id; if (!lab.id) lab.id = sel.id + 'Lab'; list.setAttribute('aria-labelledby', lab.id); }
      opts.forEach(function (o, i) {
        var li = document.createElement('li'); li.id = sel.id + 'Opt' + i; li.setAttribute('role', 'option'); li.textContent = o.text;
        li.addEventListener('click', function () { pick(i); });
        li.addEventListener('mousemove', function () { if (at !== i) mark(i); });
        list.appendChild(li);
      });
      sel.classList.add('dm-native'); sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
      sel.parentNode.insertBefore(wrap, sel.nextSibling); wrap.appendChild(btn); wrap.appendChild(list);
      function cur() { for (var i = 0; i < opts.length; i++) if (opts[i].value === sel.value) return i; return -1; }
      function sync() {
        var c = cur(); btn.firstChild.textContent = c < 0 ? ph : opts[c].text; btn.classList.toggle('ph', c < 0);
        [].forEach.call(list.children, function (li, i) { li.setAttribute('aria-selected', i === c ? 'true' : 'false'); });
      }
      function mark(i) {
        at = Math.max(0, Math.min(opts.length - 1, i));
        [].forEach.call(list.children, function (li, j) { li.classList.toggle('at', j === at); });
        var li = list.children[at]; btn.setAttribute('aria-activedescendant', li.id);
        if (li.offsetTop < list.scrollTop) list.scrollTop = li.offsetTop;
        else if (li.offsetTop + li.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = li.offsetTop + li.offsetHeight - list.clientHeight;
      }
      function show() { if (!list.hidden) return; list.hidden = false; wrap.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); mark(Math.max(0, cur())); }
      function hide() { if (list.hidden) return; list.hidden = true; wrap.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.removeAttribute('aria-activedescendant'); }
      function pick(i) { sel.value = opts[i].value; sel.dispatchEvent(new Event('change', { bubbles: true })); sync(); hide(); btn.focus(); }
      btn.addEventListener('click', function () { if (list.hidden) show(); else hide(); });
      list.addEventListener('mousedown', function (e) { e.preventDefault(); }); // keep focus on the button
      btn.addEventListener('blur', hide);
      btn.addEventListener('keydown', function (e) {
        var k = e.key, open = !list.hidden;
        if (k === 'ArrowDown' || k === 'ArrowUp') { e.preventDefault(); if (!open) show(); else mark(at + (k === 'ArrowDown' ? 1 : -1)); }
        else if (k === 'Home' || k === 'End') { if (open) { e.preventDefault(); mark(k === 'Home' ? 0 : opts.length - 1); } }
        else if (k === 'Enter' || k === ' ') { e.preventDefault(); if (open) pick(at); else show(); }
        else if (k === 'Escape') { if (open) { e.preventDefault(); e.stopPropagation(); hide(); } }
        else if (k === 'Tab') { if (open) hide(); }
        else if (k.length === 1 && /\S/.test(k)) { // jump to the next option starting with the letter
          for (var n = 1; n <= opts.length; n++) {
            var j = ((open ? at : cur()) + n + opts.length) % opts.length;
            if (opts[j].text.charAt(0).toLowerCase() === k.toLowerCase()) { if (open) mark(j); else { sel.value = opts[j].value; sync(); } break; }
          }
        }
      });
      if (sel.form) sel.form.addEventListener('reset', function () { setTimeout(sync); });
      sync();
    }
    fancySelect(document.getElementById('dmDomain'));

    function v(id) { return document.getElementById(id).value.trim(); }
    function setErr(id, msg) {
      var el = document.getElementById(id), f = el.closest('.dm-f'), c = document.getElementById(id + 'Btn');
      f.classList.toggle('bad', !!msg); f.querySelector('.err').textContent = msg || '';
      el.setAttribute('aria-invalid', msg ? 'true' : 'false'); if (c) c.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var good = [
        setErr('dmName', v('dmName') ? '' : 'Please add your name.'),
        setErr('dmPhone', /^\+?[\d\s()-]{10,20}$/.test(v('dmPhone')) && v('dmPhone').replace(/\D/g, '').length >= 10 ? '' : 'Please add a mobile number, like +91 98765 43210.'),
        setErr('dmEmail', /^[A-Za-z0-9._%+'-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/.test(v('dmEmail')) /* same rule as app/api/leads */ ? '' : 'Please enter an email, like name@company.com.'),
        setErr('dmDomain', v('dmDomain') ? '' : 'Pick the closest domain.')
      ].every(Boolean);
      if (!good) { var bad = form.querySelector(':not(.dm-native)[aria-invalid="true"]'); if (bad) bad.focus(); return; }
      var picks = [].map.call(form.querySelectorAll('input[name="interest"]:checked'), function (i) { return i.value; });
      var lead = { name: v('dmName'), org: v('dmOrg'), email: v('dmEmail'), phone: v('dmPhone'), domain: v('dmDomain'), products: picks, message: v('dmMsg') };
      var sendErr = document.getElementById('dmSendErr'), btn = form.querySelector('[type="submit"]');
      if (sendErr) sendErr.hidden = true;
      // sent: "Request received", one step, nothing else to do
      function done() {
        document.getElementById('dmOkText').textContent = 'Thank you, ' + lead.name.split(/\s+/)[0] + '. We’ll reply to ' + lead.email + ' within one working day to set up the demo.';
        form.hidden = true; ok.hidden = false; dlg.scrollTop = 0; ok.focus();
        form.reset();
      }
      // the lead is sent to BOOK_DEMO_TO by /api/leads (Microsoft Graph) on any real host. The claude.ai review preview has no
      // backend, so there the form only shows the confirmation
      var onSite = /^https?:$/.test(location.protocol) && !/(^|\.)claude\.ai$|claudeusercontent\.com$/.test(location.hostname);
      if (!onSite || !window.fetch) { done(); return; }
      if (btn) { btn.disabled = true; btn.setAttribute('aria-busy', 'true'); }
      fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        name: lead.name, organization: lead.org, email: lead.email, phone: lead.phone, domain: lead.domain, products: picks,
        message: lead.message, source: 'website · ' + location.pathname, website: v('dmWebsite')
      }) }).then(function (r) { if (!r.ok) throw new Error(r.status); return true; }).catch(function () { return false; }).then(function (sent) {
        if (btn) { btn.disabled = false; btn.removeAttribute('aria-busy'); }
        // not saved: keep what they typed and say so, with the address to email instead
        if (sent) done(); else if (sendErr) { sendErr.hidden = false; sendErr.focus(); }
      });
    });
    if (/#demo$/.test(location.hash)) {
      var openSoon = function () { setTimeout(function () { open(null); }, 120); };
      if (document.readyState === 'complete') openSoon(); else addEventListener('load', openSoon);
    }
  })();

  /* ---------- wave page transitions ---------- */
  // the veil stays out of layout (display:none, 0x0 canvas) until a transition starts
  var veil = document.createElement('div'); veil.className = 'wave-veil'; veil.setAttribute('aria-hidden', 'true');
  var vc = document.createElement('canvas'); vc.width = vc.height = 0; veil.appendChild(vc); document.body.appendChild(veil);
  var vctx = vc.getContext('2d'), VW = 0, VH = 0;
  function sizeVeil() { if (!vctx) return; var d = Math.min(devicePixelRatio || 1, 1.5); VW = document.documentElement.clientWidth || innerWidth; VH = innerHeight; vc.width = VW * d; vc.height = VH * d; vctx.setTransform(d, 0, 0, d, 0, 0); }
  function hideVeil() { veil.classList.remove('on'); vc.width = vc.height = 0; VW = VH = 0; }
  rt.hideVeil = hideVeil;
  // p: 0..1 coverage; dir: 1 = wave rises from the bottom (leaving), -1 = wave clears upward (arriving)
  function paintVeil(p, dir) {
    if (!vctx || !VW) return;
    var W = VW, H = VH, t = performance.now() * .002;
    vctx.clearRect(0, 0, W, H);
    if (p <= 0) return;
    var layers = [['14,59,102', 0], ['38,115,181', .08], ['220,235,247', .16]];
    layers.forEach(function (L, i) {
      var q = Math.max(0, Math.min(1, (p - L[1]) / (1 - L[1] * 1.0)));
      if (dir < 0) q = Math.max(0, Math.min(1, (p - (0.16 - L[1])) / (1 - 0.16)));
      vctx.beginPath();
      if (dir > 0) {
        var top = H - q * (H + 140);
        vctx.moveTo(0, H);
        for (var x = 0; x <= W; x += 12) vctx.lineTo(x, top + Math.sin(x / W * 7 + t + i) * 46 * (1 - q * .6) + Math.sin(x / W * 17 - t) * 14);
        vctx.lineTo(W, H);
      } else {
        var bot = q * (H + 140);
        vctx.moveTo(0, 0);
        for (var x2 = 0; x2 <= W; x2 += 12) vctx.lineTo(x2, bot + Math.sin(x2 / W * 7 + t + i) * 46 * (1 - q * .6) + Math.sin(x2 / W * 17 - t) * 14);
        vctx.lineTo(W, 0);
      }
      vctx.closePath(); vctx.fillStyle = 'rgb(' + L[0] + ')'; vctx.fill();
    });
  }
  function animateVeil(from, to, dir, ms, done) {
    var s = performance.now();
    veil.classList.add('on'); sizeVeil();
    (function step(n) {
      var k = Math.min(1, (n - s) / ms), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      paintVeil(from + (to - from) * e, dir);
      if (k < 1) requestAnimationFrame(step); else done && done();
    })(s);
  }
  var arriving = false;
  try { arriving = sessionStorage.getItem('infrax-wave') === '1'; sessionStorage.removeItem('infrax-wave'); } catch (e) {}
  // the arrival reveal is pure CSS (html.wave-in, set in <head>) so the page shows from first paint; just tidy up after it
  if (arriving) setTimeout(function () { document.documentElement.classList.remove('wave-in'); }, 380);

  // PORT: the static site left with location.href = next page. Here the veil covers the screen, then the router swaps
  // <main> and enterPage() plays the same CSS arrival wave (html.wave-in) and drops the veil.
  var veilT = 0;
  function go(href) {
    var path = href.split('#')[0] || '/';
    if (HARD_NAV.has(path) || !routerRef) {
      try { sessionStorage.setItem('infrax-wave', '1'); } catch (err) {}
      location.href = href; return;
    }
    rt.arriving = true;
    routerRef.push(href, { scroll: false });
    // never leave the veil up if the route does not mount (e.g. a navigation error)
    clearTimeout(veilT); veilT = setTimeout(function () { if (rt.arriving) { rt.arriving = false; hideVeil(); } }, 10000);
  }
  rt.arrive = function () {
    if (!rt.arriving) return;
    rt.arriving = false; clearTimeout(veilT);
    var html = document.documentElement;
    // restart the CSS arrival wave, then drop the veil underneath it in the same frame
    html.classList.remove('wave-in'); void html.offsetWidth; html.classList.add('wave-in');
    hideVeil();
    setTimeout(function () { html.classList.remove('wave-in'); }, 380);
  };

  // fetch a page as soon as the pointer rests on its link, so the switch has nothing to wait for
  var pre = {};
  document.addEventListener('pointerover', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="/"]'); if (!a) return;
    var href = a.getAttribute('href'); if (!ROUTE.test(href)) return;
    var u = href.split('#')[0] || '/'; if (pre[u]) return;
    pre[u] = 1; if (routerRef && !HARD_NAV.has(u)) routerRef.prefetch(u);
  }, { passive: true });
  // one in-page glide at a time; the visitor's own wheel/touch cancels it
  var glide = null, glideT = 0;
  function stopGlide() { clearTimeout(glideT); glideT = 0; if (glide) glide.kill(); glide = null; }
  ['wheel', 'touchstart'].forEach(function (ev) { addEventListener(ev, function () { if (glide || glideT) stopGlide(); }, { passive: true }); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button > 0 || a.target === '_blank') return;
    var href = a.getAttribute('href');
    if (!ROUTE.test(href)) return; // only our own pages
    // same page, different #anchor: no reload happens, so no veil (the page handles the hashchange)
    var here = location.pathname.replace(/\/+$/, '') || '/';
    if (href.indexOf('#') > -1 && (href.split('#')[0] || '/') === here) {
      if (sheet && sheet.classList.contains('open')) toggle.click();
      document.querySelectorAll('.has-menu.open').forEach(function (li) { li.classList.remove('open'); });
      // a section on this page (e.g. Company on Home): glide there and stop with its heading just under the nav
      var id = href.split('#')[1], el = document.getElementById(id);
      if (el && !/^(demo)$/.test(id)) {
        e.preventDefault();
        var y = (window.INFRAX && INFRAX.anchorY) ? INFRAX.anchorY(el) : el.getBoundingClientRect().top + scrollY - 96;
        var jumpTo = function (v) { if (X.lenis) X.lenis.scrollTo(v, { immediate: true, force: true }); window.scrollTo(0, v); };
        stopGlide();
        if (window.gsap && !reduce) { var pos = { v: scrollY }; glide = gsap.to(pos, { v: y, duration: 1.1, ease: 'power2.inOut', overwrite: true, onUpdate: function () { jumpTo(pos.v); } }); }
        else jumpTo(y);
        // always finish exactly on the heading (also if the glide could not run)
        glideT = setTimeout(function () { glideT = 0; if (glide) glide.kill(); glide = null; jumpTo((window.INFRAX && INFRAX.anchorY) ? INFRAX.anchorY(el) : y); }, 1300);
        try { history.replaceState(history.state, '', '#' + id); } catch (err) {}
      }
      return;
    }
    e.preventDefault();
    if (sheet && sheet.classList.contains('open')) toggle.click();
    document.querySelectorAll('.has-menu.open').forEach(function (li) { li.classList.remove('open'); li.querySelector('button').setAttribute('aria-expanded', 'false'); });
    // PORT: a link to the page you are on reloaded it on the static site; the router would not remount it, so reload
    var same = (href.split('#')[0] || '/') === here;
    // PORT: reduced motion swaps pages without the veil (the static site did a plain reload)
    if (reduce) { if (same) location.href = href; else go(href); return; }
    animateVeil(0, 1, 1, 180, function () {
      if (same) { try { sessionStorage.setItem('infrax-wave', '1'); } catch (err) {} location.href = href; }
      else go(href);
    });
  });
  addEventListener('pageshow', function (e) { if (e.persisted) hideVeil(); });

  /* ---------- photos: once the page has loaded, fetch its lazy images a few at a time, so they are ready before the
     visitor scrolls to them (skipped when the visitor asked to save data) ---------- */
  // PORT: a function, run by enterPage after each page is in (on 'load' for the first page)
  rt.eagerImages = function () {
    var c = navigator.connection; if (c && (c.saveData || /2g/.test(c.effectiveType || ''))) return;
    var go = function () {
      var imgs = [].slice.call(document.querySelectorAll('img[loading="lazy"]')), i = 0;
      (function next() { for (var k = 0; k < 4 && i < imgs.length; k++) imgs[i++].loading = 'eager'; if (i < imgs.length) setTimeout(next, 200); })();
    };
    if (window.requestIdleCallback) requestIdleCallback(go, { timeout: 2500 }); else setTimeout(go, 1500);
  };

  /* ---------- footer year + copy email ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  // PORT: a function of a root, re-run on each page; each button binds once
  rt.copyButtons = function (root) {
    (root || document).querySelectorAll('[data-copy]').forEach(function (btn) {
      if (btn.__infraxCopy) return; btn.__infraxCopy = true;
      btn.addEventListener('click', function () {
        var txt = btn.getAttribute('data-copy');
        var done = function () { var o = btn.textContent; btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = o; }, 1400); };
        if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, function () {});
      });
    });
  };
  rt.copyButtons(document);

  /* ---------- no-copy: block copy/cut, context menu, drag and common copy shortcuts (form fields excepted) ---------- */
  (function () {
    function editable(t) { return t && (t.closest && t.closest('input,textarea,select,[contenteditable="true"]')); }
    ['copy', 'cut'].forEach(function (ev) {
      document.addEventListener(ev, function (e) { if (!editable(e.target)) e.preventDefault(); });
    });
    document.addEventListener('contextmenu', function (e) { if (!editable(e.target)) e.preventDefault(); });
    document.addEventListener('dragstart', function (e) { if (!editable(e.target)) e.preventDefault(); });
    document.addEventListener('selectstart', function (e) { if (!editable(e.target)) e.preventDefault(); });
    document.addEventListener('keydown', function (e) {
      var k = (e.key || '').toLowerCase();
      if ((e.ctrlKey || e.metaKey) && (k === 'c' || k === 'x' || k === 'a' || k === 's' || k === 'u' || k === 'p') && !editable(e.target)) e.preventDefault();
    });
    document.querySelectorAll('img').forEach(function (i) { i.setAttribute('draggable', 'false'); });
  })();

  // icons.js loaded after site.js on the static site
  bootIcons();
}

/* ---------- per page ----------
   PORT: everything site.js did with the page's own content, re-run for each page that mounts. Called by usePage()
   right before the page's init(); the returned leave() runs when the page unmounts. */
export function enterPage(page) {
  if (typeof window === 'undefined' || !booted) return function () {};
  var X = rt.X, reduce = rt.reduce, main = document.getElementById('main') || document;
  var G = !!(window.gsap && window.ScrollTrigger), left = false, nets = [];

  // safety net for scripts that could not clean up after themselves: ScrollTriggers and tweens whose elements left the page
  if (G) {
    ScrollTrigger.getAll().forEach(function (st) { if (st.trigger && !st.trigger.isConnected) st.kill(); });
    gsap.globalTimeline.getChildren(true, true, false).forEach(function (tw) {
      var t = tw.targets(); if (t.length && t.every(function (el) { return el && el.nodeType === 1 && !el.isConnected; })) tw.kill();
    });
  }

  if (page) document.body.setAttribute('data-page', page); else document.body.removeAttribute('data-page');
  rt.closeNav();
  rt.arrive();
  rt.watchCovers();
  rt.watchSections();

  // reveals and magnetic buttons inside this page; the gsap context lets leave() revert their tweens and ScrollTriggers
  var ctx = G ? gsap.context(function () {
    main.querySelectorAll('[data-magnetic]').forEach(function (el) { X.magnetic(el); });
    main.querySelectorAll('[data-reveal]').forEach(function (el) {
      if (reduce || !window.gsap) return;
      var parts = X.split(el);
      gsap.from(parts, { yPercent: 110, duration: .65, ease: 'expo.out', stagger: .05, scrollTrigger: el.closest('[data-reveal-now]') ? null : { trigger: el, start: 'top 85%' } });
    });
  }) : null;

  // any canvas[data-net] runs while it is on screen and the demo modal is not over it
  if ('IntersectionObserver' in window) main.querySelectorAll('canvas[data-net]').forEach(function (cv) {
    var n = rt.makeNet(cv), vis = false;
    function sync() { if (vis && !X.covered) n.start(); else n.stop(); }
    var io = new IntersectionObserver(function (es) { vis = es[es.length - 1].isIntersecting; sync(); });
    io.observe(cv);
    document.addEventListener('infrax:cover', sync);
    nets.push(function () { io.disconnect(); document.removeEventListener('infrax:cover', sync); n.destroy(); });
  });

  rt.mailLinks(main);
  rt.copyButtons(main);
  main.querySelectorAll('img').forEach(function (i) { i.setAttribute('draggable', 'false'); });
  if (window.INFRAX && INFRAX.icons) INFRAX.icons.render();

  // open at the top (or the #anchor), and again once the page's images and layout have settled
  rt.resetStart();
  rt.toStart();
  function settled() {
    if (left) return;
    rt.toStart();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
    setTimeout(function () { if (!left) rt.toStart(); }, 80); setTimeout(function () { if (!left) rt.toStart(); }, 350);
    rt.eagerImages();
  }
  if (document.readyState === 'complete') requestAnimationFrame(settled);
  else addEventListener('load', settled, { once: true });

  return function leave() {
    left = true;
    removeEventListener('load', settled);
    nets.forEach(function (f) { f(); });
    if (ctx) ctx.revert();
  };
}

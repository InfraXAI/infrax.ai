import { installThree } from '@/lib/three-global';

// Home page script: the inline <script> of site/src/home.html, unchanged inside init() except where marked "PORT:".
// usePage('home', init) runs it once the page markup is mounted (after the shared per-page runtime); the returned
// function stops it when the visitor navigates away. GSAP tweens/ScrollTriggers created synchronously are reverted by
// usePage's gsap.context; everything else (rAF loops, timers, observers, listeners, WebGL contexts) is stopped here.
// PORT: mechanical edits (generated, see the lifecycle block below): document.addEventListener( -> docAdd(,
// new TH/THREE.WebGLRenderer( -> glNew(TH/THREE, , 'img/x.jpg' -> '/img/x.webp' (build.py webp()), products.html# -> /products#.
let LOGO_URI = '';
// PORT: the hero samples the original logo (public/assets/logo.svg) as a data URI; HomeScript (server-read) sets it
export function setLogoUri(uri) { LOGO_URI = uri; }

export function init() {
  'use strict';
  // PORT: lifecycle tracking. The static page lived until the next full load; here the same globals are shadowed by
  // tracking versions so stop() can cancel every frame, timer, observer, listener and WebGL context the script made.
  var stopped = false, rafs = new Set(), timers = new Set(), intervals = new Set(), winL = [], docL = [], obs = [], renderers = [];
  var requestAnimationFrame = function (fn) { if (stopped) return 0; var id = window.requestAnimationFrame(function (now) { rafs.delete(id); if (!stopped) fn(now); }); rafs.add(id); return id; };
  var cancelAnimationFrame = function (id) { rafs.delete(id); window.cancelAnimationFrame(id); };
  var setTimeout = function (fn, ms) { if (stopped) return 0; var id = window.setTimeout(function () { timers.delete(id); if (!stopped) fn(); }, ms); timers.add(id); return id; };
  var clearTimeout = function (id) { timers.delete(id); window.clearTimeout(id); };
  var setInterval = function (fn, ms) { var id = window.setInterval(fn, ms); intervals.add(id); return id; };
  var addEventListener = function (type, fn, o) { winL.push([type, fn, o]); window.addEventListener(type, fn, o); };
  var removeEventListener = function (type, fn, o) { window.removeEventListener(type, fn, o); };
  function docAdd(type, fn, o) { docL.push([type, fn, o]); document.addEventListener(type, fn, o); }
  function tracked(Ctor) { return Ctor && function (cb, o) { var ob = new Ctor(function (a, b) { if (!stopped) cb(a, b); }, o); obs.push(ob); return ob; }; }
  var IntersectionObserver = tracked(window.IntersectionObserver), ResizeObserver = tracked(window.ResizeObserver);
  function glNew(T, o) { if (stopped) throw new Error('home stopped'); var r = new T.WebGLRenderer(o); renderers.push(r); return r; }
  installThree(); // PORT: three.js r149 as window.THREE (the static page loaded it from the CDN)
  var sections = [].slice.call(document.querySelectorAll('#main > section')); // PORT: for killing late tweens in stop()

  var X = window.INFRAX || {}, reduce = !!X.reduce, G = window.gsap, ST = window.ScrollTrigger, hasG = !!(G && ST);
  // contract breakpoints (site.js INFRAX.mq; literals if it is missing); the demo modal sets INFRAX.covered
  var MQ_T = (X.mq && X.mq.tablet) || '(max-width:768px)';
  var tablet = function () { return !!(window.matchMedia && matchMedia(MQ_T).matches); };
  var covered = function () { return !!(window.INFRAX && window.INFRAX.covered); };
  var ARROW = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';

  /* ---------- domains (tiles) ---------- */
  var DOMAINS = [
    { s: 'highways', n: 'Highways', img: '/img/highway-sm.webp', alt: 'Expressway under a camera gantry', d: 'Gantries, call boxes, toll lanes and incidents on one screen.', runs: 'Dhrishya · AstraAlert · Naka · Cygnus',
      boxes: [[37.1, 60.2, 15.4, 20.4, 'Car', '97%'], [78.1, 43.1, 19.5, 30.1, 'Truck', '95%', 'r']] },
    { s: 'cities', n: 'Cities', img: '/img/city-junction-sm.webp', alt: 'Busy city junction seen from above, with pole cameras', d: 'Every junction camera on one map and one wall.', runs: 'Cygnus',
      boxes: [[51, 42.8, 10.8, 15, 'Bus', '96%'], [16.9, 70.6, 9.6, 9.5, 'Car · plate read', '94%', 'b']] },
    { s: 'campuses', n: 'Campuses', img: '/img/campus-sm.webp', alt: 'Campus entrance at dusk with a parking barrier', d: 'Gate logs and one video wall for many buildings.', runs: 'Cygnus · Toran',
      boxes: [[40.9, 67.6, 5.7, 7, 'Car', '94%'], [68, 74.8, 25.3, 3.4, 'Gate · barrier down', '', 'r b']] },
    { s: 'ports', n: 'Ports', img: '/img/port-sm.webp', alt: 'Container port gate at dawn with cameras on poles', d: 'Truck plates at the gate and every yard camera on one wall.', runs: 'Cygnus · Toran',
      boxes: [[45.6, 64.4, 11.7, 21.8, 'Truck · gate in', '95%', 'b'], [73.6, 57.9, 5.3, 22, 'Gate 3 · open', '', 'r']] },
    { s: 'warehouses', n: 'Warehouses', img: '/img/factory-gate-sm.webp', alt: 'Warehouse gate with a boom barrier, a container truck and a guard cabin', d: 'Every truck logged by plate, every dock camera recorded.', runs: 'Cygnus · Toran',
      boxes: [[19.5, 32.4, 18.9, 42.1, 'Truck · plate read', '97%']] },
    { s: 'construction', n: 'Construction', img: '/img/construction-site-sm.webp', alt: 'Construction site with a concrete frame, tower cranes and a pole camera', d: 'Deliveries logged at the gate, site cameras watched for tampering.', runs: 'Cygnus · Toran',
      boxes: [[8.6, 5.8, 8.1, 24.3, 'Site camera · OK', '', 'b'], [89.6, 71.8, 10.4, 12, 'Mixer truck', '92%', 'r']] }
  ];

  /* ================= HERO: logo -> globe -> India inside two rings -> headline =================
     Intro (~6.5 s): brand-blue particles fly in from close to the viewer and form the logo (0-1.8 s), a shimmer crosses it,
     then the particle wordmark zooms out into the distance onto a revolving dotted globe that grows there (2.2-3.4 s); the globe
     eases its spin until India faces the camera (to 4.4 s) and zooms in (from 4.2 s), India's dots flatten
     onto the map plane while the rest of the globe fades, and the map settles with a gentle tilt. Two tilted SVG rings draw
     in around it, "INFRAX.AI" running along each path in opposite directions; then the headline and CTAs rise in.
     Live loop: the six domain sites pulse, packets run along arcs to the command centre, and every 5 s one site flashes red
     and is acknowledged. One three.js renderer (DPR <= 1.25), drawn only while the hero is on screen. Scrolling during the
     intro jumps to its end state. Reduced motion: the final state, drawn once. No WebGL: a 2D canvas map with the rings. */
  (function () {
    var hero = document.querySelector('.hm-hero'), stage = document.getElementById('hxStage'), cv = document.getElementById('hxGl'), lbs = document.getElementById('hxLbs');
    var svg = document.getElementById('hxRings'), rc = document.getElementById('hxRc'), rcx = rc && rc.getContext('2d'), RCD = 1, GS = 2.6;
    if (!hero || !stage || !cv || !lbs || !svg) return;
    var skipIntro = !!window.INFRAX_HX_SKIP;
    if (reduce || skipIntro) hero.classList.remove('hx-intro'); else hero.classList.add('hx-intro');
    var TH = window.THREE, D2R = Math.PI / 180, TAU = Math.PI * 2;
    // simplified outline of India (lon, lat), clockwise from the north
    var IND = [[74.0, 37.0], [75.3, 37.1], [77.0, 35.9], [78.0, 35.5], [79.5, 35.6], [80.3, 35.2], [80.1, 34.4], [78.9, 33.4], [78.8, 32.6], [79.4, 32.0], [78.8, 31.2], [79.9, 30.9], [81.0, 30.2],
      [80.1, 28.8], [81.5, 28.0], [83.3, 27.4], [84.6, 27.2], [85.8, 26.6], [87.0, 26.4], [88.1, 26.6], [88.0, 27.4], [88.8, 28.0], [88.9, 27.2], [89.8, 26.8], [91.6, 26.8], [92.1, 26.9],
      [93.9, 27.6], [95.3, 28.2], [96.2, 29.4], [97.3, 28.3], [96.6, 27.4], [95.2, 26.6], [94.6, 25.6], [94.2, 24.0], [93.3, 23.9], [93.1, 22.5], [92.6, 21.9], [92.3, 23.5], [91.8, 23.6],
      [91.3, 23.2], [91.2, 24.0], [92.2, 24.3], [92.2, 25.1], [90.0, 25.2], [89.8, 25.9], [88.5, 26.4], [88.1, 25.6], [88.5, 25.2], [88.0, 24.4], [88.7, 24.0], [88.9, 22.6], [89.0, 21.8],
      [87.5, 21.6], [86.9, 21.0], [86.4, 20.0], [85.0, 19.3], [84.2, 18.3], [83.0, 17.6], [82.3, 16.6], [81.3, 15.9], [80.3, 15.4], [80.2, 13.5], [80.3, 13.0], [79.9, 11.8], [79.8, 10.3],
      [79.3, 10.3], [78.9, 9.3], [78.2, 8.9], [77.5, 8.1], [76.6, 8.9], [76.2, 10.0], [75.8, 11.3], [75.2, 12.5], [74.7, 13.5], [74.3, 14.6], [73.8, 15.7], [73.3, 17.0], [72.9, 18.6],
      [72.8, 19.6], [72.8, 20.8], [72.6, 21.4], [72.3, 22.3], [72.2, 21.6], [71.2, 20.8], [70.0, 21.0], [69.0, 22.3], [70.3, 22.9], [69.6, 22.8], [68.4, 23.5], [68.8, 24.3], [70.0, 24.2],
      [71.1, 24.4], [70.6, 25.6], [70.1, 26.6], [69.5, 27.0], [70.6, 28.0], [71.9, 27.9], [73.0, 29.0], [73.4, 29.9], [74.5, 31.0], [74.6, 31.9], [75.4, 32.3], [74.6, 32.8], [74.0, 33.2],
      [73.9, 34.0], [73.5, 34.6], [72.6, 35.5], [73.0, 36.5]];
    // live sites by domain: name, lon, lat, preferred label side, event copy
    var SITES = [['Highway', 73.6, 25.6, 'l', 'Stopped vehicle'], ['Port', 72.9, 19.0, 'l', 'Gate alarm'], ['Campus', 77.6, 13.0, 'r', 'Camera offline'],
      ['City', 88.4, 22.6, 'r', 'Junction blocked'], ['Warehouse', 78.5, 17.4, 'r', 'Dock door open'], ['Construction', 81.0, 26.6, 'r', 'Camera tamper']];
    var CCLL = [77.03, 28.46], COSF = Math.cos(22 * D2R), SC = 2.26, RF = SC / D2R;
    // timeline (s): particles 0-3.4 (zoom-out from 2.2), globe from GS = 2.6, India faces the camera at 4.5; everything from the zoom on runs on te = t - OFF
    // (zoom 1.7-3.2, rings from 2.9, sites from 3.5, headline at 3.9, intro ends 4.8, all in te)
    var OFF = 2.6, EV_ORDER = [0, 3, 1, 4, 2, 5], EV_START = 6.6 + OFF, EV_EVERY = 5, COPY_AT = 3.9 + OFF, END = 4.8 + OFF, STILL = 6.2 + OFF, FOV = 26;
    function cl(v, a, b) { return v < a ? a : v > b ? b : v; }
    function sg(t, a, b) { return cl((t - a) / (b - a), 0, 1); }
    function io3(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function io2(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    function o3(t) { return 1 - Math.pow(1 - t, 3); }
    // flat map in world units (x east, z south), centred on the outline's bounding box; 1 degree of latitude = SC units
    var raw = IND.map(function (p) { return [(p[0] - 68) * COSF * SC, (37.1 - p[1]) * SC]; }), bx0 = 1e9, bx1 = -1e9, bz0 = 1e9, bz1 = -1e9;
    raw.forEach(function (p) { bx0 = Math.min(bx0, p[0]); bx1 = Math.max(bx1, p[0]); bz0 = Math.min(bz0, p[1]); bz1 = Math.max(bz1, p[1]); });
    var MX = (bx0 + bx1) / 2, MZ = (bz0 + bz1) / 2, poly = raw.map(function (p) { return [p[0] - MX, p[1] - MZ]; });
    function F(lon, lat) { return [(lon - 68) * COSF * SC - MX, (37.1 - lat) * SC - MZ]; }
    function LL(x, z) { return [68 + (x + MX) / (COSF * SC), 37.1 - (z + MZ) / SC]; }
    function inside(x, y) {
      var c = false;
      for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        var a = poly[i], b = poly[j];
        if (((a[1] > y) !== (b[1] > y)) && (x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0])) c = !c;
      }
      return c;
    }
    var CCF = F(CCLL[0], CCLL[1]), CF = F(82, 22);
    // hex-packed dot field, plus a thin chain through the Siliguri corridor so the Northeast stays attached
    function dotField(gap) {
      var d = [], x, z, r = 0;
      for (z = bz0 - MZ; z < bz1 - MZ; z += gap, r++) for (x = bx0 - MX; x < bx1 - MX; x += gap) { var xx = x + (r % 2 ? gap / 2 : 0); if (inside(xx, z)) d.push([xx, z]); }
      [[26.5, 26.42], [26.85, 26.8]].forEach(function (lt) {
        var a = F(87.6, lt[0]), b = F(89.6, lt[1]), L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        for (var s = 0; s <= L; s += gap * .62) {
          var cx = a[0] + (b[0] - a[0]) * s / L, cz = a[1] + (b[1] - a[1]) * s / L;
          if (!d.some(function (p) { return Math.abs(p[0] - cx) < gap * .55 && Math.abs(p[1] - cz) < gap * .55; })) d.push([cx, cz]);
        }
      });
      return d;
    }
    var mob = tablet(), fine = !mob && !!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches);
    var GAP = mob ? 1.08 : .78, DOTS = dotField(GAP);
    var sites = SITES.map(function (s, i) { var f = F(s[1], s[2]); return { i: i, name: s[0], what: s[4], side: s[3], f: f, d: Math.hypot(f[0] - CCF[0], f[1] - CCF[1]) }; });
    // the event label names the domain
    function evText(s) { return s.what + ' · ' + s.name; }

    // ---- labels: crisp HTML at the shared type scale, anchored to projected 3D points and kept apart every frame
    function mk(cls, html) { var el = document.createElement('span'); el.className = cls; el.innerHTML = html; lbs.appendChild(el); return el; }
    sites.forEach(function (s) { s.lb = { el: mk('hx-lb', s.name), pref: s.side, k: -1, on: false }; });
    var ccLb = { el: mk('hx-lb cc', 'Command centre'), k: -1, on: false };
    var evLb = { el: mk('hx-ev', '<i></i><span></span>'), k: -1, on: false }, evTx = evLb.el.lastChild;
    var ALL = sites.map(function (s) { return s.lb; }).concat([ccLb, evLb]), W = 0, H = 0;
    function measure() { ALL.forEach(function (o) { o.w = o.el.offsetWidth; o.h = o.el.offsetHeight; }); }
    // candidate spots around an anchor: beside a site (preferred side first), or above it
    function cands(o, ax, ay, top) {
      var w = o.w, h = o.h, g = mob ? 9 : 12;
      if (top) return [[ax - w / 2, ay - g - h], [ax + g, ay - h - g * .5], [ax - g - w, ay - h - g * .5], [ax + g, ay - h / 2], [ax - g - w, ay - h / 2], [ax - w / 2, ay + g]];
      var r = [ax + g, ay - h / 2], l = [ax - g - w, ay - h / 2];
      return (o.pref === 'l' ? [l, r] : [r, l]).concat([[ax - w / 2, ay + g * .8], [ax - w / 2, ay - g * .8 - h], [ax + g * .6, ay + g * .4], [ax - g * .6 - w, ay + g * .4], [ax + g * .6, ay - g * .4 - h], [ax - g * .6 - w, ay - g * .4 - h]]);
    }
    function cost(x, y, w, h, placed) {
      var c = (x < 6 || y < 6 || x + w > W - 6 || y + h > H - 6) ? 1e6 : 0;
      for (var i = 0; i < placed.length; i++) {
        var b = placed[i], ox = Math.min(x + w, b[0] + b[2]) - Math.max(x, b[0]), oy = Math.min(y + h, b[1] + b[3]) - Math.max(y, b[1]);
        if (ox > 0 && oy > 0) c += ox * oy;
      }
      return c;
    }
    // keep the last spot while it is clear (no jitter); otherwise take the clearest; a label that cannot sit clear hides
    function place(o, cs, placed, must) {
      var k = o.k >= 0 && o.k < cs.length ? o.k : 0, best = k, bc = cost(cs[k][0], cs[k][1], o.w, o.h, placed);
      if (bc > 0) for (var i = 0; i < cs.length; i++) { if (i === k) continue; var c = cost(cs[i][0], cs[i][1], o.w, o.h, placed); if (c < bc) { bc = c; best = i; if (!c) break; } }
      o.k = best;
      var p = cs[best], ok = bc === 0 || !!must;
      if (ok) {
        var x = cl(p[0], 6, Math.max(6, W - o.w - 6)), y = cl(p[1], 6, Math.max(6, H - o.h - 6));
        o.el.style.transform = 'translate3d(' + Math.round(x) + 'px,' + Math.round(y) + 'px,0)'; placed.push([x - 3, y - 3, o.w + 6, o.h + 6]);
      }
      return ok;
    }
    function show(o, v) { if (o.on !== v) { o.on = v; o.el.classList.toggle('on', v); } }
    // P(x, y, z) -> stage px; u = time into the current event (-1: none)
    // anchors are projected into reused arrays (P writes into its 4th argument), so no per-frame allocation for them
    var ANC = sites.map(function () { return [0, 0]; }), CCA = [0, 0];
    function labels(P, t, u) {
      var placed = [], anc = ANC, cc = P(CCF[0], 0, CCF[1], CCA), i;
      for (i = 0; i < sites.length; i++) { P(sites[i].f[0], 0, sites[i].f[1], anc[i]); placed.push([anc[i][0] - 9, anc[i][1] - 9, 18, 18]); }
      placed.push([cc[0] - 9, cc[1] - 9, 18, 18]);
      if (ev && u >= 0 && u < 2.9) { var a = anc[ev.i]; place(evLb, cands(evLb, a[0], a[1] - 6, true), placed, true); }
      show(ccLb, t > 4 && place(ccLb, cands(ccLb, cc[0], cc[1] - 4, true), placed, true));
      // phones: the sites only pulse (no name labels), so the small map stays readable
      sites.forEach(function (s, i) { var on = !mob && t > 3.9 + i * .08; show(s.lb, on && place(s.lb, cands(s.lb, anc[i][0], anc[i][1], false), placed, false)); });
    }
    // ---- events: one every EV_EVERY s; the site flashes red with a label, a red packet runs to the centre, acknowledged, fade
    var ev = null, evN = 0, nextEv = EV_START, evState = '';
    function events(t) {
      if (t >= nextEv) {
        ev = { i: EV_ORDER[evN % EV_ORDER.length], t0: t }; evN++; nextEv += EV_EVERY; evLb.k = -1;
        evTx.textContent = evText(sites[ev.i]); evLb.w = evLb.el.offsetWidth; evLb.h = evLb.el.offsetHeight;
      }
      if (!ev) return -1;
      var u = t - ev.t0, st = u < 1.3 ? 'red' : u < 2.7 ? 'ack' : 'off';
      if (st !== evState) {
        evState = st;
        evLb.el.className = 'hx-ev' + (st === 'off' ? '' : ' on') + (st === 'ack' ? ' ack' : '');
        if (st === 'ack') { evTx.textContent = 'Acknowledged'; evLb.w = evLb.el.offsetWidth; }
      }
      return u;
    }

    // ---- rings: two tilted SVG ellipses; "INFRAX.AI" runs along each (text-on-a-path) just outside a hairline that carries
    // ticks. The far half is dimmed so each ring reads as passing behind India. Opposite directions, different speeds.
    var NS = 'http://www.w3.org/2000/svg', RG = [], RTXT = 'INFRAX.AI  ·  ';
    // the wide ring carries the product names in sequence; the round one keeps "INFRAX.AI"
    var PN = ['Dhrishya', 'AstraAlert', 'Naka', 'Cygnus', 'Plexus', 'Ulka', 'Toran'],
      PTXT = PN.join('  ·  ') + '  ·  ', PTXT2 = PN.join(' · ') + ' · ';
    // a wide, flat ring crossing India like Saturn's, and a rounder one that orbits it
    // (the round ring is the longer path on narrow screens, so it carries the product names)
    var RINGS = [{ a: .72, b: .2, rot: -8, sp: 30, dir: 1, txt: RTXT, min: 3 }, { a: .54, b: .45, rot: -20, sp: 19, dir: -1, txt: PTXT, alt: PTXT2, min: 1 }];
    function sv(tag, at, par) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; }
    function ell(cx, cy, rx, ry) { return 'M' + (cx - rx) + ' ' + cy + 'A' + rx + ' ' + ry + ' 0 1 0 ' + (cx + rx) + ' ' + cy + 'A' + rx + ' ' + ry + ' 0 1 0 ' + (cx - rx) + ' ' + cy; }
    function buildRings() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); RG = [];
      var u = Math.min(W / 1.28, H), cx = W / 2, cy = H / 2, defs = sv('defs', {}, svg), off = 14;
      if (rcx) { RCD = Math.min(devicePixelRatio || 1, 2); rc.width = Math.round(W * RCD); rc.height = Math.round(H * RCD); }
      RINGS.forEach(function (d, n) {
        var rx = Math.min(d.a * u, W / 2 - off - 8), ry = d.b * u, id = 'hxR' + n, pad = 40, box = { x: cx - rx - pad, y: cy - ry - pad, width: 2 * rx + 2 * pad, height: 2 * ry + 2 * pad };
        // masks (in the ring's own rotated space): the far half fades; the text also fades where it crosses India
        [['l', .3]].forEach(function (k) {
          var gr = sv('linearGradient', { id: id + k[0] + 'g', gradientUnits: 'userSpaceOnUse', x1: 0, y1: cy - ry, x2: 0, y2: cy + ry }, defs);
          [[0, k[1]], [.4, k[1] + .04], [.62, 1]].forEach(function (s) { sv('stop', { offset: s[0], 'stop-color': '#fff', 'stop-opacity': s[1] }, gr); });
          var m = sv('mask', { id: id + k[0], maskUnits: 'userSpaceOnUse', x: box.x, y: box.y, width: box.width, height: box.height }, defs);
          sv('rect', { x: box.x, y: box.y, width: box.width, height: box.height, fill: 'url(#' + id + k[0] + 'g)' }, m);
        });
        sv('path', { id: id + 'p', d: ell(cx, cy, rx + off, ry + off) }, defs);
        var g = sv('g', { transform: 'rotate(' + d.rot + ' ' + cx + ' ' + cy + ')', mask: 'url(#' + id + 'l)' }, svg);
        var line = sv('path', { d: ell(cx, cy, rx, ry), fill: 'none', stroke: '#2673B5', 'stroke-opacity': .55, 'stroke-width': 1 }, g);
        var ticks = sv('path', { d: ell(cx, cy, rx, ry), fill: 'none', stroke: '#2673B5', 'stroke-opacity': .45, 'stroke-width': 5 }, g);
        var L = line.getTotalLength(), LT = defs.lastChild.getTotalLength(), nt = Math.max(24, Math.round(L / (mob ? 20 : 26)));
        ticks.setAttribute('stroke-dasharray', '1 ' + (L / nt - 1).toFixed(3));
        // two copies of the same text (offsets o - LT and o) cover the closed path seamlessly as it scrolls
        var tg = sv('g', { transform: g.getAttribute('transform'), mask: 'url(#' + id + 't)' }, svg), probe = sv('text', { style: 'white-space:pre' }, tg); probe.textContent = d.txt;
        // whole repeats of the phrase fill the path exactly: pick the count nearest the CSS spacing, never so many that the
        // letters would need less than ~1px spacing, then spread the remainder evenly over the letter-spacing
        var fs0 = parseFloat(getComputedStyle(probe).fontSize) || 12, ls = parseFloat(getComputedStyle(probe).letterSpacing) || 4, em = ls / fs0;
        var best = null;
        (d.alt ? [d.txt, d.alt] : [d.txt]).forEach(function (src, si) {
          probe.textContent = src;
          var n = src.length, lp = probe.getComputedTextLength() || n * 11, lp0 = lp - ls * n;
          var r0 = d.alt ? 1 : Math.max(d.min, Math.round(LT / (lp * 1.12))), r1 = d.alt ? Math.max(1, Math.ceil(LT / lp0)) : r0;
          for (var r = r0; r <= r1; r++) {
            // the product ring may grow its type a little (12-14px) so a single sequence is not over-spaced
            var k = d.alt ? Math.min(14 / 12, Math.max(1, LT / (r * lp))) : 1, lsp = (LT - r * lp0 * k) / (r * n);
            if (lsp < .5 && r > 1) continue;
            var sc = Math.abs(lsp / (fs0 * k) - em) + si * .03;
            if (!best || sc < best.sc) best = { sc: sc, src: src, r: r, k: k, lsp: Math.max(.5, lsp) };
          }
        });
        var txt = new Array(best.r + 1).join(best.src), lsp = best.lsp, fsz = (fs0 * best.k).toFixed(2);
        var noText = getComputedStyle(probe).display === 'none', fam = getComputedStyle(probe).fontFamily;
        tg.removeChild(probe);
        svg.removeChild(tg);
        // the text path as a table: 1024 points at equal arc length (local, unrotated space) with the direction of travel
        var tpath = defs.lastChild, R1 = rx + off, R2 = ry + off, sgn = tpath.getPointAtLength(LT * .25).y > cy ? -1 : 1, NS2 = 2048, acc = [0], th;
        for (th = 1; th <= NS2; th++) { var a0 = Math.PI + (th - 1) / NS2 * TAU, a1 = Math.PI + th / NS2 * TAU; acc.push(acc[th - 1] + Math.hypot(R1 * (Math.cos(a1) - Math.cos(a0)), R2 * (Math.sin(a1) - Math.sin(a0)))); }
        var tl = new Float32Array(1025 * 3), kk = 0;
        for (var q2 = 0; q2 <= 1024; q2++) { var want = acc[NS2] * q2 / 1024; while (kk < NS2 - 1 && acc[kk + 1] < want) kk++;
          var fr = (want - acc[kk]) / ((acc[kk + 1] - acc[kk]) || 1), an = Math.PI + (kk + fr) / NS2 * TAU;
          tl[q2 * 3] = cx + R1 * Math.cos(an); tl[q2 * 3 + 1] = cy + sgn * R2 * Math.sin(an); tl[q2 * 3 + 2] = Math.atan2(sgn * R2 * Math.cos(an), -R1 * Math.sin(an)); }
        var tx = { txt: txt.toUpperCase(), fsz: fsz, lsp: lsp, fam: fam, off: noText, tl: tl, cw: null, cum: null, ry: ry, rot: d.rot * D2R, cx: cx, cy: cy, hx: .3 * H, hy: .42 * H };
        RG.push({ d: d, line: line, ticks: ticks, tx: tx, L: L, LT: LT });
      });
      ringsLast = -1; // a rebuild cleared the canvas: the next frame redraws the rings whatever the 60 fps cap says
      // a still frame (reduced motion) drawn before the web font arrived gets its words once the font is in
      if (document.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(function () { if (ringsT >= 0) { ringsLast = -1; rings(ringsT, ringsRp, true); } });
    }
    // rp: draw-in progress (0..1) - the hairline draws itself, then text and ticks fade in
    // one ring's words at path offset o, as the SVG text path laid them out: each letter at its arc position, turned to the
    // path, with the far-half fade (text mask) and the soft hole where the ring crosses India computed per letter
    function stop3(f, a, b, c) { return f <= 0 ? a[1] : f >= c[0] ? c[1] : f < b[0] ? a[1] + (b[1] - a[1]) * f / b[0] : b[1] + (c[1] - b[1]) * (f - b[0]) / (c[0] - b[0]); }
    function ringText(r, o, fa) {
      var x = r.tx, c = rcx; if (!c || x.off || fa <= .004) return;
      c.font = '500 ' + x.fsz + 'px ' + x.fam;
      if (!x.cw) { // letter widths once the web font is in (until then the words wait, as the SVG text did for its font)
        if (document.fonts && document.fonts.status !== 'loaded') return;
        x.cw = []; x.cum = []; var acc = 0, wc = {};
        for (var i = 0; i < x.txt.length; i++) { var ch = x.txt[i], w = wc[ch] != null ? wc[ch] : (wc[ch] = c.measureText(ch).width); x.cw.push(w); x.cum.push(acc); acc += w + x.lsp; }
      }
      c.fillStyle = '#2673B5';
      var LT = r.LT, tl = x.tl, cr = Math.cos(x.rot), sr = Math.sin(x.rot), D = RCD, y0 = x.cy - x.ry, y2 = 2 * x.ry;
      for (var j = 0; j < x.txt.length; j++) {
        var chj = x.txt[j]; if (chj === ' ') continue;
        var m = ((o + x.cum[j] + x.cw[j] / 2) % LT + LT) % LT, u = m / LT * 1024, q = u | 0, f = u - q, q1 = q + 1 > 1024 ? 1024 : q + 1;
        var lx = tl[q * 3] + (tl[q1 * 3] - tl[q * 3]) * f, ly = tl[q * 3 + 1] + (tl[q1 * 3 + 1] - tl[q * 3 + 1]) * f, an = tl[q * 3 + 2] + x.rot;
        var g = stop3((ly - y0) / y2, [0, .1], [.4, .14], [.62, 1]);
        var X = x.cx + (lx - x.cx) * cr - (ly - x.cy) * sr, Y = x.cy + (lx - x.cx) * sr + (ly - x.cy) * cr;
        var rn = Math.hypot((X - x.cx) / x.hx, (Y - x.cy) / x.hy), h = rn >= 1 ? 0 : stop3(rn, [0, .72], [.6, .66], [1, 0]);
        var al = fa * g * (1 - h); if (al < .01) continue;
        var ca = Math.cos(an), sa = Math.sin(an);
        c.globalAlpha = al; c.setTransform(D * ca, D * sa, -D * sa, D * ca, X * D, Y * D); c.fillText(chj, -x.cw[j] / 2, 0);
      }
      c.globalAlpha = 1;
    }
    var ringsLast = -1, ringsT = -1, ringsRp = 0;
    // between: called on the frames the 30 fps scene skips, with the time since its last draw, so the rings glide at up to 60 fps
    function rings(t, rp, between) {
      if (!between) { ringsT = t; ringsRp = rp; }
      if (t - ringsLast < .015 && t > ringsLast) return; ringsLast = t; // text-path updates cost a text layout: at most ~60 per second
      svg.classList.toggle('on', rp > 0); if (rc) rc.classList.toggle('on', rp > 0);
      if (rcx) { rcx.setTransform(1, 0, 0, 1, 0, 0); rcx.clearRect(0, 0, rc.width, rc.height); }
      RG.forEach(function (r) {
        var o = ((r.d.dir * t * r.d.sp) % r.LT + r.LT) % r.LT, ol = o * r.L / r.LT, fa = sg(rp, .35, 1).toFixed(3);
        ringText(r, o, +fa);
        r.ticks.setAttribute('stroke-dashoffset', (-ol).toFixed(1));
        if (rp < 1) r.line.setAttribute('stroke-dasharray', (r.L * o3(rp)).toFixed(1) + ' ' + r.L.toFixed(1)); else r.line.removeAttribute('stroke-dasharray');
        r.ticks.setAttribute('opacity', fa);
      });
    }
    // ---- intro particles (one 2D canvas over the whole hero): brand-blue particles start close to the viewer (large, soft)
    // and fly together into the logo, sampled from the original logo file (assets/logo.svg, inlined at build time),
    // shrinking and sharpening as they land (0-1.8 s); a shimmer crosses it (to 2.2 s); then the whole wordmark zooms out
    // into the distance, onto the globe's centre, and fades as the globe grows there (2.2-3.4 s)
    var pc = document.getElementById('hxPt'), px = pc && pc.getContext && pc.getContext('2d'), ptOn = !!px && !reduce && !skipIntro;
    var PW = 0, PH = 0, PDPR = 1, SOX = 0, SOY = 0, PTS = null, PT_FORM = 1.8, PT_ZOOM = 2.2, PT_END = 3.4;
    // the original logo file, inlined at build time (a data URI never taints the sampling canvas)
    var lgImg = new Image(); lgImg.onload = function () { PTS = null; }; lgImg.src = LOGO_URI; // PORT: build.py inlined assets/logo.svg here; HomeScript passes the same data URI
    if (pc && !ptOn) pc.style.display = 'none';
    var pseed = 11; function prnd() { pseed = (pseed * 16807) % 2147483647; return pseed / 2147483647; }
    function sprite(rgb, soft) {
      var s = 64, c = document.createElement('canvas'); c.width = c.height = s;
      var g = c.getContext('2d'), rg = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2), f = function (a) { return 'rgba(' + rgb + ',' + a + ')'; };
      if (soft) { rg.addColorStop(0, f(.9)); rg.addColorStop(.4, f(.55)); rg.addColorStop(1, f(0)); } else { rg.addColorStop(0, f(1)); rg.addColorStop(.8, f(1)); rg.addColorStop(1, f(0)); }
      g.fillStyle = rg; g.fillRect(0, 0, s, s); return c;
    }
    var SPR = ptOn ? [[sprite('38,115,181', 0), sprite('38,115,181', 1)], [sprite('14,59,102', 0), sprite('14,59,102', 1)]] : null;
    function sizePt() {
      if (!ptOn) return;
      var hr = hero.getBoundingClientRect(), sr = stage.getBoundingClientRect();
      PW = hr.width; PH = hr.height; SOX = sr.left - hr.left; SOY = sr.top - hr.top;
      PDPR = Math.min(window.devicePixelRatio || 1, 2); pc.width = Math.round(PW * PDPR); pc.height = Math.round(PH * PDPR); PTS = null;
    }
    // target points: ink of the logo (or the text) on a jittered grid sized so about n cells are inked
    function makeTargets() {
      var small = PW <= 768, n = small ? 700 : 2200, ww = PW * (small ? .8 : .5), c = document.createElement('canvas'), g = c.getContext('2d'), sw = Math.round(Math.min(ww, 720)), sh, d = null;
      if (lgImg.complete && lgImg.naturalWidth) try { sh = Math.round(sw * 120.89 / 410.67); c.width = sw; c.height = sh; g.drawImage(lgImg, 0, 0, sw, sh); d = g.getImageData(0, 0, sw, sh).data; } catch (e) { d = null; }
      // never a stand-in wordmark: without the logo's pixels there are no particles and the real logo simply fades in
      if (!d) { PTS = { p: [], ww: ww, none: true }; return; }
      var ink = 0, x, y, i; for (i = 3; i < d.length; i += 4) if (d[i] > 120) ink++;
      var st = Math.max(1.5, Math.sqrt(ink / n)), k = ww / sw, out = [];
      pseed = 11;
      for (y = st / 2; y < sh; y += st) for (x = st / 2; x < sw; x += st) {
        var jx = x + (prnd() - .5) * st * .5, jy = y + (prnd() - .5) * st * .5;
        if (d[(Math.round(jy) * sw + Math.round(jx)) * 4 + 3] <= 120) continue;
        var a = prnd() * TAU, rr = .55 + prnd() * .75;
        out.push({ tx: (jx - sw / 2) * k, ty: (jy - sh / 2) * k, sx: Math.cos(a) * rr * PW * .62, sy: Math.sin(a) * rr * PH * .62, r0: 7 + prnd() * 13, r1: Math.max(1, st * k * .5), bend: (prnd() - .5) * .6,
          dl: prnd() * .32 + (jx / sw) * .12, a0: .25 + prnd() * .35, c: prnd() < .2 ? 1 : 0, ph: prnd() * TAU });
      }
      PTS = { p: out, ww: ww };
    }
    function drawPt(t, gx, gy) {
      if (!PW) return;
      if (!PTS) makeTargets();
      var cx0 = SOX + W / 2, cy0 = SOY + H / 2, re = io3(sg(t, PT_ZOOM, PT_END)), s = 1 / (1 + 18 * re * re), fade = 1 - sg(re, .5, 1);
      var cx = cx0 + (SOX + gx - cx0) * re, cy = cy0 + (SOY + gy - cy0) * re, sw = (sg(t, 1.5, 2.4) * 2 - 1.2) * PTS.ww * .75, sh = Math.sin(Math.PI * sg(t, 1.5, 2.4));
      px.setTransform(PDPR, 0, 0, PDPR, 0, 0); px.clearRect(0, 0, PW, PH);
      // soft glow behind the formed mark, brightest as the shimmer passes and as it zooms away
      var gw = .1 * sh + .14 * Math.sin(Math.PI * re);
      if (gw > .004) { var gr = PTS.ww * .55 * s + 40, rg = px.createRadialGradient(cx, cy, 0, cx, cy, gr); rg.addColorStop(0, 'rgba(38,115,181,' + gw.toFixed(3) + ')'); rg.addColorStop(1, 'rgba(38,115,181,0)'); px.fillStyle = rg; px.fillRect(cx - gr, cy - gr, gr * 2, gr * 2); }
      // once the particles have landed they dissolve into the real logo, which is what zooms away
      var real = lgImg.complete && lgImg.naturalWidth ? io3(PTS.none ? sg(t, .2, .8) : sg(t, 1.45, 1.95)) : 0, keep = 1 - real;
      PTS.p.forEach(function (p) {
        var e = sg(t, p.dl, p.dl + 1.3), m = 1 - Math.pow(1 - e, 4), bw = Math.sin(Math.PI * e) * p.bend;
        var x = p.sx + (p.tx - p.sx) * m - (p.ty - p.sy) * bw * .35, y = p.sy + (p.ty - p.sy) * m + (p.tx - p.sx) * bw * .35;
        var gl2 = sh * Math.exp(-Math.pow((p.tx - sw) / (PTS.ww * .08), 2)), r = (p.r0 + (p.r1 - p.r0) * m) * (1 + .5 * gl2), a = (p.a0 + (1 - p.a0) * m) * fade * sg(t, 0, .25) * keep;
        x = cx + x * s; y = cy + y * s; r = Math.max(.6, r * (s * .85 + .15));
        if (a < .01 || x < -r || y < -r || x > PW + r || y > PH + r) return;
        var b = 1 - sg(m, .55, 1), sp = SPR[p.c];
        if (b < .98) { px.globalAlpha = a * (1 - b); px.drawImage(sp[0], x - r, y - r, 2 * r, 2 * r); }
        if (b > .02) { var r2 = r * 1.7; px.globalAlpha = a * b * .8; px.drawImage(sp[1], x - r2, y - r2, 2 * r2, 2 * r2); }
      });
      if (real > .01) {
        var lw = PTS.ww * s, lh = lw * 120.89 / 410.67;
        px.globalAlpha = real * fade; px.imageSmoothingQuality = 'high';
        px.drawImage(lgImg, cx - lw / 2, cy - lh / 2, lw, lh);
      }
      px.globalAlpha = 1;
    }
    var copied = false, T0 = performance.now();
    function intro(t, gx, gy) {
      if (ptOn) { if (t >= PT_END) { ptOn = false; pc.width = pc.height = 0; pc.style.display = 'none'; /* frees the full-screen backing store */ } else drawPt(t, gx == null ? W / 2 : gx, gy == null ? H / 2 : gy); }
      if (!copied && (t >= COPY_AT || performance.now() - T0 > COPY_AT * 1000)) { // wall clock too: a slow GPU must not hold the headline back
        copied = true; hero.classList.add('hx-done'); if (window.INFRAX_NAV_IN) window.INFRAX_NAV_IN(); }
    }

    // ---- one loop for both renderers: runs only while the hero is on screen and the tab is visible; reduced motion draws once
    var t = skipIntro ? END : 0, last = 0, raf = 0, vis = true, draw = null;
    function frame(now) {
      raf = 0;
      if (!vis || document.hidden || covered()) return;
      // after the intro the live loop draws at ~30 fps (skipped frames carry their time into the next draw)
      if (t >= END && last && now - last < 31) { if (ringsRp >= 1) rings(ringsT + (now - last) / 1000, 1, true); raf = requestAnimationFrame(frame); return; }
      var dt = last ? Math.min(.1, (now - last) / 1000) : 0; last = now; t += dt;
      draw(t, dt); raf = requestAnimationFrame(frame);
      if (armed && t >= END) disarm();
    }
    function run() {
      if (reduce) { draw(STILL, 0); return; }
      if (!raf && vis && !document.hidden && !covered()) { last = 0; raf = requestAnimationFrame(frame); }
    }
    // scrolling (or arriving scrolled) during the intro jumps straight to its end state
    // only a real gesture after load counts: scroll events from scroll restoration, Lenis or the site's start-position reset
    // (site.js) must not skip the intro on arrival
    var GEST = ['wheel', 'touchmove', 'keydown'], gestOn = false, armed = false;
    // the skip listeners only live while the intro runs
    function disarm() { armed = false; removeEventListener('scroll', onScroll); GEST.forEach(function (n) { removeEventListener(n, onGest); }); }
    function jump() { disarm(); if (t < END) { t = END; intro(t); } }
    function onScroll() { if (gestOn && scrollY > 4) jump(); }
    function onGest(e) {
      if (e.type === 'keydown' && !/^(ArrowDown|ArrowUp|PageDown|PageUp|End|Home| |Spacebar)$/.test(e.key)) return;
      gestOn = true; setTimeout(onScroll, 120);
    }
    var skipBtn = document.getElementById('hxSkip');
    if (skipBtn) skipBtn.addEventListener('click', function () { jump(); skipBtn.blur(); });
    function armSkip() {
      if (armed || t >= END) return; armed = true;
      GEST.forEach(function (n) { addEventListener(n, onGest, { passive: true }); });
      addEventListener('scroll', onScroll, { passive: true });
    }
    function start(layoutFn0, drawFn) {
      draw = drawFn;
      function layoutFn() { var ok = layoutFn0(); if (ok) sizePt(); return ok; }
      function relayout() { if (layoutFn()) { buildRings(); if (reduce || !raf) draw(reduce ? STILL : t, 0); } }
      if (!reduce) { if (document.readyState === 'complete') armSkip(); else addEventListener('load', armSkip); }
      if (layoutFn()) { buildRings(); run(); } else requestAnimationFrame(function () { relayout(); run(); });
      new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (draw) run(); }).observe(stage);
      docAdd('visibilitychange', run); docAdd('infrax:cover', run);
      if (window.ResizeObserver) new ResizeObserver(relayout).observe(stage); else addEventListener('resize', relayout);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
    }

    // ---- WebGL scene (one renderer); without WebGL a 2D map stands in
    var R = null;
    if (TH) try { R = glNew(TH, { canvas: cv, antialias: true, alpha: true, powerPreference: 'low-power' }); } catch (e) { R = null; }
    if (!R) { flat2d(); return; }
    R.debug.checkShaderErrors = false;
    R.setClearColor(0xffffff, 0);
    var V3 = TH.Vector3, BLUE = new TH.Color(0x2673B5), DEEP = new TH.Color(0x0E3B66), RED = new TH.Color(0xE5484D), tmp = new V3();
    var scene = new TH.Scene(), cam = new TH.PerspectiveCamera(FOV, 1, 1, 3000), own = [], i, a, b;
    function add(o) { own.push(o); return o; }
    // particles only (no lines): India (kind 1) morphs sphere -> plane; the world (0) is a dense, twinkling particle sphere that
    // fades with the zoom. World particles carry a random 0..1 in aD for size and twinkle
    var fl = [], ll = [], kd = [], dd = [];
    DOTS.forEach(function (p) { var g = LL(p[0], p[1]); fl.push(p[0], p[1]); ll.push(g[0] * D2R, g[1] * D2R); kd.push(1); dd.push(Math.hypot(p[0] - CCF[0], p[1] - CCF[1])); });
    var NW = mob ? 2600 : 5200, GA = Math.PI * (3 - Math.sqrt(5));
    for (i = 0; i < NW; i++) {
      var la = Math.asin(1 - 2 * (i + .5) / NW), lo = (i * GA) % TAU - Math.PI, LO = lo / D2R, LA = la / D2R;
      if (LO > 67 && LO < 98 && LA > 6 && LA < 38) { var q = F(LO, LA); if (inside(q[0], q[1])) continue; }
      fl.push(0, 0); ll.push(lo + (prnd() - .5) * .02, la + (prnd() - .5) * .02); kd.push(0); dd.push(prnd());
    }
    var DVS = 'uniform float uLon0,uLat0,uR,uMorph,uTime,uPx,uK,uLive,uWorld,uZs,uDot,uFade; uniform vec2 uC;' +
      'attribute vec2 aFlat; attribute vec2 aLL; attribute float aKind; attribute float aD; varying float vA,vK;' +
      'void main(){ float lon=aLL.x-uLon0, lat=aLL.y, cl=cos(lat); vec3 p=vec3(cl*sin(lon),sin(lat),cl*cos(lon));' +
      ' float ca=cos(uLat0), sa=sin(uLat0); vec3 q=vec3(p.x,p.y*ca-p.z*sa,p.y*sa+p.z*ca);' +
      ' vec3 sp=vec3(uC.x+q.x*uR,(q.z-1.)*uR*.35,uC.y-q.y*uR); float front=smoothstep(-.02,.3,q.z);' +
      ' float ind=step(.5,aKind)*step(aKind,1.5), mo=uMorph*ind;' +
      ' float w1=sin(aD*.45-uTime*1.7), w2=sin(aFlat.x*.13+aFlat.y*.09+uTime*.55);' +
      ' vec3 pos=mix(sp,vec3(aFlat.x,(w2*.22+w1*.1)*uLive,aFlat.y),mo); float v=mix(.62,.5+.32*w1+.18*w2,uLive);' +
      ' float tw=.5+.5*sin(uTime*1.7+aD*37.);' +
      ' vK=mo*(.45+.35*v); vA=(ind>.5?mix(front,1.,mo)*(.62+.38*v):front*(.2+.22*tw)*uWorld)*uFade;' +
      ' float dia=ind>.5?mix(.3*uZs,.32+.2*v,mo)*uDot:(.16+.16*aD)*(.85+.3*tw)*uDot;' +
      ' vec4 mv=modelViewMatrix*vec4(pos,1.); gl_PointSize=max(1.4*uPx,dia*uPx*uK/-mv.z); gl_Position=projectionMatrix*mv; }';
    var DFS = 'uniform vec3 uCol,uCol2; varying float vA,vK; void main(){ float d=length(gl_PointCoord-.5); float a=vA*smoothstep(.5,.34,d); if(a<.004) discard; gl_FragColor=vec4(mix(uCol,uCol2,vK),a); }';
    var CFS = 'uniform vec3 uCol; varying float vA; void main(){ float d=length(gl_PointCoord-.5); float a=vA*smoothstep(.5,.34,d); if(a<.004) discard; gl_FragColor=vec4(uCol,a); }';
    var dg = add(new TH.BufferGeometry());
    dg.setAttribute('position', new TH.Float32BufferAttribute(new Float32Array(kd.length * 3), 3));
    dg.setAttribute('aFlat', new TH.Float32BufferAttribute(fl, 2)); dg.setAttribute('aLL', new TH.Float32BufferAttribute(ll, 2));
    dg.setAttribute('aKind', new TH.Float32BufferAttribute(kd, 1)); dg.setAttribute('aD', new TH.Float32BufferAttribute(dd, 1));
    var U = { uLon0: { value: 0 }, uLat0: { value: 0 }, uR: { value: 30 }, uMorph: { value: 0 }, uTime: { value: 0 }, uPx: { value: 1 }, uK: { value: 1 }, uLive: { value: 0 },
      uWorld: { value: 1 }, uFade: { value: 1 }, uZs: { value: 1 }, uDot: { value: GAP / .9 }, uC: { value: new TH.Vector2() }, uCol: { value: BLUE.clone() }, uCol2: { value: DEEP.clone() } };
    // dark theme: the globe's dots go sky and pale blue so they read on navy (everything else keeps the brand colours)
    function globeTheme() { var d = document.documentElement.getAttribute('data-theme') === 'dark'; U.uCol.value.set(d ? 0x5AB4EA : 0x2673B5); U.uCol2.value.set(d ? 0xA9D0F2 : 0x0E3B66); }
    globeTheme(); docAdd('infrax:theme', globeTheme);
    var dots = new TH.Points(dg, add(new TH.ShaderMaterial({ uniforms: U, vertexShader: DVS, fragmentShader: DFS, transparent: true, depthTest: false, depthWrite: false })));
    dots.frustumCulled = false; scene.add(dots);
    // a soft atmosphere glow around the particle globe, fading as the camera closes in
    var AU = { uA: { value: 1 } };
    var atm = new TH.Mesh(add(new TH.CircleGeometry(1.1, 96).rotateX(-Math.PI / 2)), add(new TH.ShaderMaterial({ uniforms: AU, transparent: true, depthTest: false, depthWrite: false,
      vertexShader: 'varying float vR; void main(){ vR=length(position.xz); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: 'uniform float uA; varying float vR; void main(){ gl_FragColor=vec4(.149,.451,.71,smoothstep(.72,.98,vR)*(1.-smoothstep(.98,1.1,vR))*.09*uA); }' })));
    atm.frustumCulled = false; atm.renderOrder = -1; scene.add(atm);
    // sites: a disc with pulse ripples; the command centre is a larger deep-blue disc
    var rgeo = add(new TH.RingGeometry(.62, .78, 48)), dgeo = add(new TH.CircleGeometry(.5, 32));
    rgeo.rotateX(-Math.PI / 2); dgeo.rotateX(-Math.PI / 2);
    function mesh(geo, mat, ro) { var m = new TH.Mesh(geo, mat); m.renderOrder = ro; return m; }
    var white = add(new TH.MeshBasicMaterial({ color: 0xffffff })), NK = mob ? 1.35 : 1.15;
    var nodes = sites.map(function (s) { return { f: s.f }; }).concat([{ f: CCF, cc: true }]).map(function (n) {
      var g = new TH.Group(); g.position.set(n.f[0], 0, n.f[1]); g.scale.set(NK, 1, NK); scene.add(g);
      n.rings = [0, 1].map(function () { var r = mesh(rgeo, add(new TH.MeshBasicMaterial({ color: n.cc ? 0x0E3B66 : 0x2673B5, transparent: true, opacity: 0, depthWrite: false, depthTest: false })), 1); r.position.y = .02; g.add(r); return r; });
      n.d1 = mesh(dgeo, white, 3); n.d1.position.y = .03; n.d2 = mesh(dgeo, add(new TH.MeshBasicMaterial({ color: n.cc ? 0x0E3B66 : 0x2673B5 })), 4); n.d2.position.y = .04;
      g.add(n.d1, n.d2); n.g = g; return n;
    });
    // low arcs over the map, packets riding them; a red packet and a green acknowledge ripple for events
    var curves = sites.map(function (s) {
      var p0 = new V3(s.f[0], 0, s.f[1]), p1 = new V3(CCF[0], 0, CCF[1]), m = p0.clone().add(p1).multiplyScalar(.5); m.y = p0.distanceTo(p1) * .3 + 1.5;
      var c = new TH.QuadraticBezierCurve3(p0, m, p1), lm = add(new TH.LineBasicMaterial({ color: 0x0E3B66, transparent: true, opacity: 0, depthWrite: false }));
      var ln = new TH.Line(add(new TH.BufferGeometry().setFromPoints(c.getPoints(64))), lm); ln.renderOrder = 1; scene.add(ln); return { c: c, lm: lm };
    });
    var PVS = 'uniform float uPx,uK; attribute float aA; attribute float aS; varying float vA; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vA=aA; gl_PointSize=aS*uPx*uK/-mv.z; gl_Position=projectionMatrix*mv; }';
    function pset(n, col) {
      var pos = new Float32Array(n * 3), al = new Float32Array(n), sz = new Float32Array(n), g = add(new TH.BufferGeometry());
      g.setAttribute('position', new TH.BufferAttribute(pos, 3)); g.setAttribute('aA', new TH.BufferAttribute(al, 1)); g.setAttribute('aS', new TH.BufferAttribute(sz, 1));
      var p = new TH.Points(g, add(new TH.ShaderMaterial({ uniforms: { uPx: U.uPx, uK: U.uK, uCol: { value: new TH.Color(col) } }, vertexShader: PVS, fragmentShader: CFS, transparent: true, depthWrite: false, depthTest: false })));
      p.frustumCulled = false; p.renderOrder = 5; scene.add(p); return { g: g, pos: pos, al: al, sz: sz };
    }
    var PK = pset(sites.length * 6, 0x0E3B66), RK = pset(8, 0xE5484D);
    var ack = [0, 1].map(function () { var r = mesh(rgeo, add(new TH.MeshBasicMaterial({ color: 0x1F8A5B, transparent: true, opacity: 0, depthWrite: false, depthTest: false })), 4); r.position.set(CCF[0], .05, CCF[1]); scene.add(r); return r; });

    // ---- camera: orbit pose around the map centre; fit() finds the distance and screen offset that frame a set of points
    function pose(el, az, d, ox, oy) {
      var ce = Math.cos(el); cam.position.set(d * ce * Math.sin(az), d * Math.sin(el), d * ce * Math.cos(az)); cam.lookAt(0, 0, 0);
      cam.setViewOffset(W, H, ox, oy, W, H); cam.updateMatrixWorld();
    }
    function P3(x, y, z, o) { tmp.set(x, y, z).project(cam); o = o || [0, 0]; o[0] = (tmp.x + 1) / 2 * W; o[1] = (1 - tmp.y) / 2 * H; return o; }
    var FITP = poly.map(function (p) { return [p[0], 0, p[1]]; });
    function fit(el, pts, mL, mR, mT, mB) {
      var d = 160, x0, x1, y0, y1, it;
      function box() { x0 = y0 = 1e9; x1 = y1 = -1e9; pts.forEach(function (p) { var q = P3(p[0], p[1], p[2]); x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }); }
      for (it = 0; it < 5; it++) { pose(el, 0, d, 0, 0); box(); d *= Math.max((x1 - x0) / (W - mL - mR), (y1 - y0) / (H - mT - mB)); }
      pose(el, 0, d, 0, 0); box();
      return { d: d, ox: (x0 + x1) / 2 - (mL + (W - mL - mR) / 2), oy: (y0 + y1) / 2 - (mT + (H - mT - mB) / 2) };
    }
    // India sits inside the rings: a centred box about 0.76 of the visual's height; final pose is a gentle 20-degree tilt
    var TOP, FIN, R0 = 30, EL0 = 89 * D2R, EL1 = 70 * D2R;
    function layout() {
      W = stage.clientWidth; H = stage.clientHeight;
      if (!W || !H) return false;
      var dpr = Math.min(window.devicePixelRatio || 1, 2); // full sharpness
      R.setPixelRatio(dpr); R.setSize(W, H, false);
      cam.aspect = W / H; cam.updateProjectionMatrix();
      U.uPx.value = dpr; U.uK.value = (H / 2) / Math.tan(FOV * D2R / 2);
      measure();
      var mx = (W - Math.min(W * (mob ? .74 : .6), H * .84)) / 2, my = H * .12;
      TOP = fit(EL0, FITP, mx, mx, my, my);
      FIN = fit(EL1, FITP, mx, mx, my, my);
      R0 = .36 * H * (2 * TOP.d * Math.tan(FOV * D2R / 2)) / H;
      return true;
    }
    // pointer parallax (desktop): a few degrees of orbit and tilt, eased
    var par = { x: 0, y: 0, tx: 0, ty: 0 };
    if (fine && !reduce) {
      var sRect = null; addEventListener('resize', function () { sRect = null; }); addEventListener('scroll', function () { sRect = null; }, { passive: true });
      hero.addEventListener('pointermove', function (e) { var r = sRect || (sRect = stage.getBoundingClientRect()); par.tx = cl((e.clientX - r.left) / r.width * 2 - 1, -1, 1); par.ty = cl((e.clientY - r.top) / r.height * 2 - 1, -1, 1); });
      hero.addEventListener('pointerleave', function () { par.tx = par.ty = 0; });
    }
    function step(t0, dt) {
      var t = t0 - OFF;
      var u = reduce ? -1 : events(t0), z = io3(sg(t, 1.7, 3.2)), mo = io3(sg(t, 2.2, 3.4)), sp = sg(t0, GS, OFF + 1.9), tl = io3(sg(t, 2.9, 4.4));
      // globe: grows out of the zooming particle wordmark, revolves and eases until India faces the camera, zooms to 1:1 with the map, India flattens
      var Rg = R0 * (.3 + .7 * o3(sg(t0, GS, GS + 1.4))), Rz = Rg * Math.pow(RF / Rg, z), cx = CF[0] * z, cz = CF[1] * z, ga = (1 - sg(z, .15, .6)) * sg(t0, GS + .1, GS + .8);
      U.uLon0.value = (82 + 220 * Math.pow(1 - sp, 2)) * D2R; U.uLat0.value = (10 + 12 * z) * D2R; U.uR.value = Rz; U.uZs.value = cl(Rz / RF, .42, 1);
      U.uMorph.value = mo; U.uC.value.set(cx, cz); U.uTime.value = t; U.uLive.value = sg(t, 3.3, 4.3); U.uWorld.value = 1 - sg(z, .25, .8); U.uFade.value = sg(t0, GS + .05, GS + .9);
      atm.visible = ga > 0; AU.uA.value = ga;
      atm.scale.setScalar(Rz); atm.position.set(cx, -.35 * Rz, cz);
      // camera: top-down -> a gentle tilt, then a very slow sway (+ parallax)
      var k = Math.min(1, dt * 3); par.x += (par.tx - par.x) * k; par.y += (par.ty - par.y) * k;
      var orb = reduce ? 0 : tl * Math.sin((t - 4.4) * .12) * 4 * D2R;
      pose(EL0 + (EL1 - EL0) * tl + par.y * 2 * D2R * tl, orb + par.x * 4 * D2R * tl, TOP.d + (FIN.d - TOP.d) * tl, TOP.ox + (FIN.ox - TOP.ox) * tl, TOP.oy + (FIN.oy - TOP.oy) * tl);
      // the zooming particle wordmark heads for the globe's centre on screen
      var gc = ptOn ? P3(cx, -.35 * Rz, cz) : null; intro(t0, gc && gc[0], gc && gc[1]);
      // sites pulse; the event site flashes red
      var evI = ev && u >= 0 && u < 2.9 ? ev.i : -1, flash = evI < 0 ? 0 : o3(sg(u, 0, .3)) * (1 - sg(u, 1.3, 1.9));
      nodes.forEach(function (n, i) {
        var up = o3(sg(t, 3.5 + i * .08, 4.1 + i * .08)), red = i === evI ? flash : 0;
        n.g.visible = up > 0;
        if (!up) return;
        if (!n.cc) n.d2.material.color.copy(BLUE).lerp(RED, red);
        n.d1.scale.setScalar((n.cc ? 1.3 : 1) * up * (1 + .25 * red)); n.d2.scale.setScalar((n.cc ? .88 : .66 + .05 * Math.sin(t * 2.2 + i)) * up * (1 + .3 * red));
        n.rings.forEach(function (r, j) { var ph = (t * (red ? 1.3 : .42) + i * .21 + j * .5) % 1; r.scale.setScalar(1 + (red ? 3.2 : 2.2) * o3(ph)); r.material.opacity = (red ? .8 : .45) * (1 - ph) * up; if (!n.cc) r.material.color.copy(BLUE).lerp(RED, red); });
      });
      // arcs and one packet per arc
      var q = 0, pa = sg(t, 4.2, 4.8);
      curves.forEach(function (c, i) {
        c.lm.opacity = .26 * sg(t, 3.8, 4.5);
        var e = io2((t * .3 + i * .37) % 1);
        for (var r = 0; r < 6; r++) { c.c.getPoint(Math.max(0, e - r * .022), tmp); PK.pos[q * 3] = tmp.x; PK.pos[q * 3 + 1] = tmp.y; PK.pos[q * 3 + 2] = tmp.z; PK.al[q] = (.95 - r * .15) * pa * (i === evI ? .25 : 1); PK.sz[q] = (.62 - r * .07) * NK; q++; }
      });
      var pe = evI < 0 ? -1 : sg(u, .45, 1.15);
      for (q = 0; q < 8; q++) {
        if (pe > 0 && pe < 1) { curves[evI].c.getPoint(Math.max(0, io2(pe) - q * .028), tmp); RK.pos[q * 3] = tmp.x; RK.pos[q * 3 + 1] = tmp.y; RK.pos[q * 3 + 2] = tmp.z; RK.al[q] = q ? 1 - q * .12 : .2; RK.sz[q] = (q ? 1 - q * .09 : 2.6) * NK; } else RK.al[q] = 0;
      }
      [PK, RK].forEach(function (s) { s.g.attributes.position.needsUpdate = s.g.attributes.aA.needsUpdate = s.g.attributes.aS.needsUpdate = true; });
      ack.forEach(function (r, m) { var a2 = evI < 0 ? 0 : sg(u, 1.15 + m * .22, 2.1 + m * .22); r.visible = a2 > 0 && a2 < 1; r.scale.setScalar((1.6 + 4.5 * o3(a2)) * NK); r.material.opacity = .8 * (1 - a2); });
      R.render(scene, cam);
      labels(P3, t, u);
      rings(t, sg(t, 2.9, 4.1));
    }
    start(layout, step);

    // ---- no WebGL: the flat map with arcs and sites on a 2D canvas, fading in as the particle wordmark zooms out; the SVG rings still revolve
    function flat2d() {
      var c2 = document.createElement('canvas'), ctx = c2.getContext('2d'), P = null;
      c2.setAttribute('aria-hidden', 'true'); cv.parentNode.replaceChild(c2, cv); cv = c2;
      if (!ctx) return;
      function dot(p, r, f) { ctx.fillStyle = f; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, TAU); ctx.fill(); }
      function step2d(t0) {
        var t = t0 - OFF;
        intro(t0, W / 2, H / 2); c2.style.opacity = sg(t0, GS, GS + 1.2).toFixed(3);
        if (P) labels(P, t, -1);
        rings(t, sg(t, 2.9, 4.1));
      }
      start(paint, step2d);
      function paint() {
        W = stage.clientWidth; H = stage.clientHeight;
        if (!W || !H) return false;
        var dpr = Math.min(window.devicePixelRatio || 1, 2); c2.width = Math.round(W * dpr); c2.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        measure();
        var mw = Math.min(W * (mob ? .74 : .6), H * .84), mh = H * .76;
        var s = Math.min(mw / (bx1 - bx0), mh / (bz1 - bz0)), ox = W / 2, oy = H / 2, r = Math.max(1.3, .19 * s * GAP);
        P = function (x, y, z, o) { o = o || [0, 0]; o[0] = ox + x * s; o[1] = oy + (z - y) * s; return o; };
        ctx.clearRect(0, 0, W, H); ctx.fillStyle = 'rgba(30,96,158,.82)'; ctx.beginPath();
        DOTS.forEach(function (p) { var q = P(p[0], 0, p[1]); ctx.moveTo(q[0] + r, q[1]); ctx.arc(q[0], q[1], r, 0, TAU); });
        ctx.fill();
        var c = P(CCF[0], 0, CCF[1]); ctx.strokeStyle = 'rgba(14,59,102,.32)'; ctx.lineWidth = 1;
        sites.forEach(function (st) { var a = P(st.f[0], 0, st.f[1]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo((a[0] + c[0]) / 2, Math.min(a[1], c[1]) - Math.hypot(a[0] - c[0], a[1] - c[1]) * .3, c[0], c[1]); ctx.stroke(); });
        sites.forEach(function (st) { var a = P(st.f[0], 0, st.f[1]); dot(a, 6.5, '#fff'); dot(a, 4.5, '#2673B5'); });
        dot(c, 10, '#fff'); dot(c, 7, '#0E3B66'); dot(c, 2.4, '#fff');
        return true;
      }
    }
  })();

  /* ---------- domain tiles ---------- */
  var tiles = document.getElementById('hmTiles');
  tiles.innerHTML = DOMAINS.map(function (D) {
    var boxes = D.boxes.map(function (b) { return '<div class="hm-dbox' + (b[6] ? ' ' + b[6] : '') + '" style="left:' + b[0] + '%;top:' + b[1] + '%;width:' + b[2] + '%;height:' + b[3] + '%"><span>' + b[4] + (b[5] ? '<em>' + b[5] + '</em>' : '') + '</span></div>'; }).join('');
    return '<a class="hm-tile" href="/products#d-' + D.s + '"><div class="hm-photo"><img src="' + D.img + '" srcset="' + D.img + ' 768w, ' + D.img.replace('-sm.', '.') + ' 1536w" sizes="(min-width:1024.02px) 33vw, (min-width:768.02px) 50vw, 100vw" alt="' + D.alt + '" width="768" height="432" loading="lazy" decoding="async">' + boxes + '<div class="hm-scan" aria-hidden="true"></div><span class="ov-time" data-clock aria-hidden="true">--:--:--</span></div>' +
      '<div class="hm-cap"><div class="hm-cap-top"><h3>' + D.n + '</h3><span class="hm-go">' + ARROW + '</span></div>' +
      (D.proof ? '<span class="hm-proofline">' + D.proof + '</span>' : '') +
      '<p>' + D.d + '</p><span class="runs">Runs on <b>' + D.runs + '</b></span></div></a>';
  }).join('');
  function scanTile(t) {
    var scan = t.querySelector('.hm-scan'), boxes = t.querySelectorAll('.hm-dbox');
    if (!G || reduce) { boxes.forEach(function (b) { b.style.opacity = 1; }); return; }
    G.fromTo(scan, { xPercent: -120 }, { xPercent: 1040, duration: .6, ease: 'power2.inOut' });
    G.fromTo(boxes, { opacity: 0, scale: .9 }, { opacity: 1, scale: 1, duration: .22, stagger: .04, delay: .25, ease: 'back.out(2)' });
  }
  tiles.querySelectorAll('.hm-tile').forEach(function (t) {
    if (ST) ST.create({ trigger: t, start: 'top 88%', once: true, onEnter: function () { scanTile(t); } });
    else scanTile(t);
    t.addEventListener('mouseenter', function () { scanTile(t); });
  });

  /* ---------- live wall: corridor feeds with AI boxes; every 4 s one tile raises a stopped vehicle and an incident card ---------- */
  (function () {
    var wall = document.getElementById('hwWall'), fig = document.getElementById('hwFig');
    if (!wall || !fig) return;
    var clk = document.getElementById('hwClk'), dot = document.getElementById('hwDot');
    var COL = { car: '#5CB8FF', truck: '#F2B544', bus: '#5FDDB0' };
    // boxes in fractions of the 16:10 frame [x0, y0, x1, y1, type, confidence, label below], each checked against its image
    var T = {
      w01: [], w04: [], w08: [],
      n01: [[.23, .33, .36, .53, 'truck', .96], [.40, .52, .49, .65, 'car', .93], [.12, .64, .25, .81, 'car', .97]],
      w02: [[.69, .14, .745, .31, 'truck', .91]],
      n03: [[.375, .15, .525, .41, 'truck', .95], [.225, .54, .395, .76, 'car', .98, 'lo'], [.59, .40, .69, .56, 'car', .9]],
      n02: [[.69, .28, .83, .54, 'truck', .94], [.52, .52, .63, .70, 'car', .92]],
      w07: [[.16, 0, .25, .2, 'truck', .88]],
      n05: [[.23, .12, .41, .41, 'truck', .95], [.085, .56, .27, .79, 'car', .97], [.48, .39, .59, .56, 'car', .91]],
      n04: [[.11, .40, .28, .59, 'bus', .95], [.73, .65, .84, .81, 'car', .93]],
      w11: [[.355, .04, .425, .19, 'truck', .9]],
      n06: [[.71, .51, .81, .62, 'car', .9], [.70, .72, .82, .92, 'car', .94]]
    };
    var LAY = { d: ['w01', 'n01', 'w02', 'n03', 'n02', 'w07', 'n05', 'w08', 'w04', 'n04', 'w11', 'n06'], m: ['n01', 'w02', 'n05', 'n03', 'n04', 'n02'] };
    // alarms: tile, index of the box that becomes the stopped vehicle, copy
    var AL = [
      { id: 'n05', b: 2, what: 'Stopped vehicle', km: 'km 41.2', no: '#4471', p: 'Patrol 3 assigned', s: 'Sign SIGN-14 updated' },
      { id: 'w02', b: 0, what: 'Stalled truck', km: 'km 27.9', no: '#4472', p: 'Patrol 1 assigned', s: 'Sign SIGN-09 updated' },
      { id: 'n04', b: 1, what: 'Stopped vehicle', km: 'km 52.6', no: '#4473', p: 'Patrol 2 assigned', s: 'Sign SIGN-17 updated' }
    ];
    var TICK = '<b><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2.2 5.2l2 2 3.8-4.4" stroke="#fff" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></b>';
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    var mode = '', ids = [], tw = [], boxes = [], card, cNo, cEl, cTt, s1, s2, alarms = [], curA = -1, lastSec = -1, tNow = 0, cache;
    function set(el, c, on) { var k = cache.get(el) || {}; if (k[c] !== on) { el.classList.toggle(c, on); k[c] = on; cache.set(el, k); } }
    function build() {
      mode = tablet() ? 'm' : 'd'; var m = mode === 'm';
      ids = LAY[mode]; curA = -1; cache = new Map();
      wall.innerHTML = ids.map(function (id, i) {
        var bx = T[id].map(function (b, j) {
          var isAl = AL.some(function (a) { return a.id === id && a.b === j; });
          // label below the box when it would sit on the CAM tag or the tile edge
          var lo = b[6] === 'lo' || (m ? b[1] < .36 : b[1] < .2 || (b[1] < .3 && (b[0] - .083) / .833 < .45));
          var cls = (lo ? ' lo' : '') + (b[0] > .55 ? ' rt' : '') + (m && !isAl && (b[2] - b[0]) < .12 ? ' hid' : '');
          return '<div class="hw-bx' + cls + '" style="--c:' + COL[b[4]] + ';left:' + (b[0] * 100) + '%;top:' + (b[1] * 100) + '%;width:' + ((b[2] - b[0]) * 100).toFixed(1) + '%;height:' + ((b[3] - b[1]) * 100).toFixed(1) + '%"><span>' + b[4] + ' ' + b[5].toFixed(2).slice(1) + '</span></div>';
        }).join('');
        return '<div class="hw-t"><div class="hw-ti"><img src="/img/real/tiles/' + id + '.webp" alt="" width="320" height="200" loading="lazy" decoding="async">' + bx + '</div><span class="hw-cam">CAM ' + pad(i + 3) + '</span><span class="hw-flag"></span></div>';
      }).join('') + '<div class="hw-card" aria-hidden="true"><div class="r1"><i></i><span class="no"></span><em class="el"></em></div><div class="tt"></div><div class="hw-st s1">' + TICK + '<span></span></div><div class="hw-st s2">' + TICK + '<span></span></div></div>';
      tw = [].slice.call(wall.querySelectorAll('.hw-t'));
      boxes = tw.map(function (el) { return [].slice.call(el.querySelectorAll('.hw-bx')); });
      boxes.forEach(function (bs) { bs.forEach(function (b) { b.dataset.txt = b.firstChild.textContent; }); });
      card = wall.querySelector('.hw-card'); cNo = card.querySelector('.no'); cEl = card.querySelector('.el'); cTt = card.querySelector('.tt');
      s1 = card.querySelector('.s1'); s2 = card.querySelector('.s2');
      alarms = AL.filter(function (a) { return ids.indexOf(a.id) > -1; });
      // the alarm flags get their text now (they stay invisible until the alarm), so labels() can keep clear of them
      alarms.forEach(function (a) { tw[ids.indexOf(a.id)].querySelector('.hw-flag').textContent = m ? a.km : a.what + ' · ' + a.km; });
      document.getElementById('hwTitle').textContent = m ? 'Corridor wall' : 'Corridor wall · 12 feeds';
      document.getElementById('hwEdge').textContent = m ? 'Edge AI' : 'Edge AI · on-prem';
      labels();
    }
    /* box labels are placed by measurement, so none prints over another, the CAM tag or the alarm flag at any size:
       the alarm box's label first (sized for "stopped"), then the rest, each above its box or else below it, inside the
       tile. A label with no free spot is left off; its box still shows. */
    // tile-local layout boxes (offsets ignore the boxes' entrance scale and the alarm tile's zoom)
    function lbox(e, dx) { return { left: dx + e.offsetLeft, top: e.offsetTop, right: dx + e.offsetLeft + e.offsetWidth, bottom: e.offsetTop + e.offsetHeight }; }
    function labels() {
      tw.forEach(function (el, i) {
        if (!el.offsetWidth) return;
        var tr = { left: 0, top: 0, right: el.offsetWidth, bottom: el.offsetHeight }, ti = el.querySelector('.hw-ti'), tx = ti.offsetLeft - ti.offsetWidth / 2; // .hw-ti is centred by translateX(-50%)
        var taken = [lbox(el.querySelector('.hw-cam'), 0)], fl = el.querySelector('.hw-flag');
        if (fl.textContent) taken.push(lbox(fl, 0));
        var a = AL.filter(function (x) { return x.id === ids[i]; })[0];
        var order = boxes[i].map(function (b, j) { return j; }).sort(function (p, q) { return (a && q === a.b) - (a && p === a.b); });
        order.forEach(function (j) {
          var b = boxes[i][j], s = b.firstChild; if (b.classList.contains('hid')) return;
          b.classList.remove('nolbl'); s.style.left = s.style.right = '';
          var isAl = a && j === a.b, t0 = s.textContent;
          if (isAl) s.textContent = 'stopped'; // the alarm label is measured with the word it will show
          var r = lbox(b, tx), h = s.offsetHeight, w = s.offsetWidth;
          if (isAl) s.textContent = t0;
          // try above/below, each aligned to the box's own side first, then to the other side
          var rt0 = b.classList.contains('rt'), lo0 = b.classList.contains('lo'), spot = null, C = [];
          (lo0 ? ['lo', 'up'] : ['up', 'lo']).forEach(function (k) { C.push([k, rt0], [k, !rt0]); });
          // last, a spot slid sideways just clear of the CAM tag, still under (or over) the box
          var cam = taken[0], xs = Math.min(tr.right - w, Math.max(cam.right + 2, r.left - 1.5));
          if (xs < r.right && xs + w > r.left) C.push(['lo', false, xs], ['up', false, xs]);
          var fit = null; // the alarm label always shows: when every spot is taken it uses the first one inside the tile
          C.some(function (c) {
            var x0 = c.length > 2 ? c[2] : c[1] ? r.right + 1.5 - w : r.left - 1.5, y = c[0] === 'up' ? r.top - 2 - h : r.bottom + 2, q = { left: x0, right: x0 + w, top: y, bottom: y + h };
            if (q.top < tr.top || q.bottom > tr.bottom || q.left < tr.left - 1 || q.right > tr.right + 1) return false;
            if (!fit) fit = [c, q];
            if (taken.some(function (t) { return q.left < t.right + 1 && q.right > t.left - 1 && q.top < t.bottom + 1 && q.bottom > t.top - 1; })) return false;
            spot = c; taken.push(q); return true;
          });
          if (!spot && isAl && fit) { spot = fit[0]; taken.push(fit[1]); }
          if (spot) { b.classList.toggle('lo', spot[0] === 'lo'); b.classList.toggle('rt', spot[1]); if (spot.length > 2) { s.style.left = (spot[2] - r.left) + 'px'; s.style.right = 'auto'; } }
          else b.classList.add('nolbl');
        });
      });
    }
    function place(a) {
      var m = mode === 'm', i = ids.indexOf(a.id), el = tw[i], cols = m ? 2 : 4, col = i % cols;
      var right = m ? col === 0 : col <= 1, gap = wall.clientWidth * (m ? .024 : .026);
      cNo.textContent = (m ? '' : 'Incident ') + a.no; cTt.textContent = m ? a.what : a.what + ' · ' + a.km;
      s1.lastChild.textContent = a.p; s2.lastChild.textContent = m ? a.s.replace('Sign ', '') : a.s;
      el.querySelector('.hw-flag').textContent = m ? a.km : a.what + ' · ' + a.km;
      var cw = card.offsetWidth, ch = card.offsetHeight;
      card.style.left = (right ? el.offsetLeft + el.offsetWidth + gap : el.offsetLeft - cw - gap) + 'px';
      card.style.top = Math.max(0, Math.min(wall.clientHeight - ch, el.offsetTop + (el.offsetHeight - ch) / 2)) + 'px';
      card.style.transform = 'translateX(' + (right ? -16 : 16) + 'px)';
    }
    function frame(t) {
      var d = new Date(), sec = d.getSeconds();
      if (sec !== lastSec) { lastSec = sec; clk.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(sec); }
      dot.classList.toggle('off', (t % 1.2) > .8);
      var u0 = t - .8, slot = u0 < 0 ? -1 : Math.floor(u0 / 4), u = u0 - slot * 4;
      var ai = slot < 0 ? -1 : slot % alarms.length, a = ai < 0 ? null : alarms[ai], live = !!a && u < 3.3;
      if (a && ai !== curA) { curA = ai; place(a); }
      tw.forEach(function (el, i) {
        var isA = live && ids[i] === a.id;
        set(el, 'alarm', isA); set(el, 'dim', live && !isA);
        boxes[i].forEach(function (b, j) {
          var al = isA && j === a.b;
          set(b, 'al', al);
          if (al) { b.firstChild.textContent = 'stopped'; set(b, 'on', true); return; }
          if (b.firstChild.textContent !== b.dataset.txt) b.firstChild.textContent = b.dataset.txt;
          var ph = (i * .83 + j * 1.37) % 5;
          set(b, 'on', !isA && ((t + ph) % 5) < 3.4 && t > .15 + j * .25 + i * .06);
        });
      });
      set(card, 'on', live && u > .35);
      set(s1, 'on', live && u > .95); set(s2, 'on', live && u > 1.45);
      if (live) cEl.textContent = '00:' + pad(Math.floor(u * 3));
    }
    build();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(labels); // label widths settle once the mono font is in
    var vis = false, raf = 0, last = 0;
    function loop(now) {
      raf = 0;
      if (!vis || document.hidden || covered()) return;
      tNow += Math.min(.05, (now - (last || now)) / 1000); last = now;
      frame(tNow);
      raf = requestAnimationFrame(loop);
    }
    function start() { if (reduce) { frame(2.9); return; } if (!raf && vis && !document.hidden && !covered()) { last = 0; raf = requestAnimationFrame(loop); } }
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; start(); }, { rootMargin: '0px 0px -10% 0px' }).observe(fig);
    docAdd('visibilitychange', start); docAdd('infrax:cover', start);
    var rt = 0;
    addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        if ((tablet() ? 'm' : 'd') !== mode) { build(); frame(reduce ? 2.9 : tNow); }
        else { labels(); if (curA > -1) place(alarms[curA]); }
      }, 120);
    });
  })();

  /* ---------- digital twin = demo G "Map to street": a GIS map in WebGL; a cursor opens CAM-07, the map tilts into a 3D street twin,
     the live camera tile lands. Scroll-driven inside a pin (scrolling back reverses it); the step pills, device chips, cards and
     Replay are buttons that jump to a step. Traffic, the cursor pulse and the clock run in real time. All data is dummy. ---------- */
  (function () {
    'use strict';
    var sec = document.getElementById('twin'), stage = document.getElementById('hmTwStage'), vp = document.getElementById('hmTwVp');
    if (!sec || !stage || !vp) return;
    var E = {
      out3: function (t) { return 1 - Math.pow(1 - t, 3); },
      io3: function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
      io2: function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    };
    var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
    var seg = function (t, a, b) { return clamp((t - a) / (b - a), 0, 1); };

    /* ---- twin toolkit (the concept's TW helpers, trimmed to what G uses) ---- */
    var P = { road: 0xB9C8D8, mark: 0xFFFFFF, median: 0xD3E0EA, deep: 0x0E3B66, blue: 0x2673B5, glass: 0xA9C2DA, steel: 0x9DB0C3, ink: 0x22364B, tree: 0xB3D4CF, tree2: 0x9CC4C4 };
    var rnd = function (a, b) { return a + Math.random() * (b - a); };
    var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
    function kit() {
      var mats = new Map(), geos = [], extra = [];
      function M(color, o) { var k = color + '|' + (o ? JSON.stringify(o) : ''), m = mats.get(k);
        if (!m) { m = new THREE.MeshStandardMaterial(Object.assign({ color: color, roughness: .88, metalness: 0 }, o || {})); mats.set(k, m); } return m; }
      function G(g) { geos.push(g); return g; }
      function mesh(g, m, shadow) { var me = new THREE.Mesh(g, m); if (shadow !== false) { me.castShadow = true; me.receiveShadow = true; } return me; }
      function box(w, h, d, color, x, y0, z, o) { var me = mesh(G(new THREE.BoxGeometry(w, h, d)), M(color, o)); me.position.set(x || 0, (y0 || 0) + h / 2, z || 0); return me; }
      function cyl(r, h, color, x, y0, z, sg, r2) { var me = mesh(G(new THREE.CylinderGeometry(r2 == null ? r : r2, r, h, sg || 10)), M(color)); me.position.set(x || 0, (y0 || 0) + h / 2, z || 0); return me; }
      function own(o) { extra.push(o); return o; }
      function dispose() { mats.forEach(function (m) { m.dispose(); }); geos.forEach(function (g) { g.dispose(); }); extra.forEach(function (o) { if (o.dispose) o.dispose(); }); }
      return { M: M, G: G, mesh: mesh, box: box, cyl: cyl, own: own, dispose: dispose };
    }
    function rig(scene, R0, o) {
      o = o || {};
      scene.add(new THREE.HemisphereLight(0xFFFFFF, 0xB8CADB, o.hemi || .5));
      var d = new THREE.DirectionalLight(0xFFFFFF, o.sun || .66);
      d.position.set(-R0 * .55, R0 * 1.25, R0 * .75); d.castShadow = true;
      var s = d.shadow; s.mapSize.set(o.map || 2048, o.map || 2048); s.bias = -.0004; s.normalBias = .03;
      var c = s.camera; c.left = -R0; c.right = R0; c.top = R0; c.bottom = -R0; c.near = 1; c.far = R0 * 4;
      scene.add(d); scene.add(d.target);
      var f = new THREE.DirectionalLight(0xDDE9F6, .14); f.position.set(R0, R0 * .4, -R0); scene.add(f);
      return d;
    }
    // phones: no shadows, default GPU (antialias always on); desktop: shadows, the shadow map refreshed every few frames (see frame)
    function renderer(cv, m) {
      var R; try { R = glNew(THREE, { canvas: cv, antialias: true, powerPreference: m ? 'default' : 'high-performance' }); } catch (e) { return null; }
      R.debug.checkShaderErrors = false;
      R.shadowMap.enabled = !m; R.shadowMap.type = THREE.PCFShadowMap; R.shadowMap.autoUpdate = false; R.shadowMap.needsUpdate = !m; R.setClearColor(0xffffff, 1);
      return R;
    }
    function disposeAll(scene, R) {
      if (scene) scene.traverse(function (o) { if (o.isInstancedMesh && o.dispose) o.dispose(); });
      if (R) { R.dispose(); try { R.forceContextLoss(); } catch (e) {} }
    }
    var CAR_COL = [0xFFFFFF, 0xF1F5F9, 0x2673B5, 0x0E3B66, 0xBFD3E6, 0x5D7186, 0xFFFFFF, 0xDCE6F0];
    function vehicle(K, kind, s, col) { // low-poly, oriented along +x, front at +x
      s = s || 1; var g = new THREE.Group(), len, c;
      var wheel = function (x, z) { g.add(K.box(.75 * s, .62 * s, .28 * s, 0x27384A, x, 0, z)); };
      if (kind === 'truck') {
        len = 8.6 * s; c = col || pick([0x2673B5, 0xDCE6F0, 0xFFFFFF, 0x8DB4D8]);
        g.add(K.box(6.1 * s, 2.5 * s, 2.35 * s, c, -1.25 * s, .55 * s, 0)); g.add(K.box(2.0 * s, 2.25 * s, 2.3 * s, 0xFFFFFF, 3.0 * s, .5 * s, 0));
        g.add(K.box(.08 * s, .8 * s, 2.0 * s, P.glass, 4.02 * s, 1.75 * s, 0, { roughness: .3 }));
        [-3.4, -2.5, 2.9].forEach(function (x) { wheel(x * s, 1.05 * s); wheel(x * s, -1.05 * s); });
      } else if (kind === 'bus') {
        len = 10.5 * s; c = col || 0xFFFFFF;
        g.add(K.box(10.4 * s, 2.7 * s, 2.4 * s, c, 0, .45 * s, 0)); g.add(K.box(10.45 * s, .75 * s, 2.44 * s, P.ink, 0, 1.75 * s, 0, { roughness: .35 }));
        g.add(K.box(10.46 * s, .22 * s, 2.46 * s, P.blue, 0, .95 * s, 0));
        [-3.6, 3.4].forEach(function (x) { wheel(x * s, 1.1 * s); wheel(x * s, -1.1 * s); });
      } else {
        len = 4.4 * s; c = col || pick(CAR_COL);
        g.add(K.box(4.3 * s, .78 * s, 1.86 * s, c, 0, .36 * s, 0)); g.add(K.box(2.25 * s, .62 * s, 1.66 * s, c, -.25 * s, 1.12 * s, 0));
        g.add(K.box(2.3 * s, .42 * s, 1.7 * s, P.ink, -.25 * s, 1.18 * s, 0, { roughness: .3 }));
        [-1.35, 1.35].forEach(function (x) { wheel(x * s, .86 * s); wheel(x * s, -.86 * s); });
      }
      g.userData.len = len; g.userData.front = (kind === 'truck' ? 4.02 : kind === 'bus' ? 5.2 : 2.15) * s; return g;
    }
    function tree(K, x, z, s) {
      var g = new THREE.Group(); g.add(K.cyl(.16 * s, 1.2 * s, 0xA8B8C8, 0, 0, 0, 6));
      var top = K.mesh(K.G(new THREE.IcosahedronGeometry(1.25 * s, 1)), K.M(pick([P.tree, P.tree2]), { flatShading: true }));
      top.position.y = 2.1 * s; top.scale.y = 1.15; top.rotation.set(0, Math.random() * 3, 0); g.add(top); g.position.set(x, 0, z); return g;
    }
    // one-lane traffic: car following, no overlap; the front vehicle is recycled behind the last one
    function Lane(o) { this.L = o.L; this.vmax = o.vmax || 12; this.veh = []; this.place = o.place; this.gapR = o.gap || [5, 16]; this.minGap = 1.6; this.acc = 3.6; this.dec = 16; }
    Lane.prototype.add = function (obj, s) { this.veh.push({ obj: obj, len: obj.userData.len, s: s, v: 0, vm: this.vmax * rnd(.85, 1.08) }); this.veh.sort(function (a, b) { return b.s - a.s; }); return this; };
    Lane.prototype.step = function (dt) {
      var V = this.veh, i, v;
      for (i = 0; i < V.length; i++) {
        v = V[i]; var lim = i > 0 ? V[i - 1].s - V[i - 1].len - this.minGap : Infinity, vt = Math.max(0, Math.min(v.vm, (lim - v.s) * 1.25));
        v.v += Math.max(-this.dec * dt, Math.min(this.acc * dt, vt - v.v)); var s0 = v.s; v.s += v.v * dt;
        if (v.s > lim) { v.s = Math.max(s0, lim); v.v = 0; }
      }
      if (V.length && V[0].s - V[0].len > this.L + 1) { v = V.shift(); var back = V[V.length - 1]; v.s = Math.min(-rnd(1, 6), back ? back.s - back.len - rnd(this.gapR[0], this.gapR[1]) : -2); v.v = v.vm * .9; V.push(v); }
      for (i = 0; i < V.length; i++) this.place(V[i]);
    };
    function warm(lanes, sec2) { for (var i = 0; i < sec2 * 30; i++) lanes.forEach(function (l) { l.step(1 / 30); }); }
    // floating device pins (DOM over WebGL)
    function pins(layer) {
      var list = [], v = new THREE.Vector3();
      function add(o) {
        var el = document.createElement('div'); el.className = 'tpin'; el.dataset.s = o.s || 'ok';
        el.innerHTML = '<span class="stm"></span><span class="dt"></span><button type="button" class="ch" aria-label="' + o.label + ', ' + o.type + ', km ' + o.km + '"><i></i><span class="lb">' + o.label + '</span><em>' + (o.sub || '') + '</em></button>';
        layer.appendChild(el);
        var p = { el: el, btn: el.querySelector('.ch'), o: o, pos: o.pos, s: o.s || 'ok', off: false, hid: false, zb: false, em: el.querySelector('em'), x: 0, y: 0 }; list.push(p); return p;
      }
      function place(cam, W, H) { list.forEach(function (p) { v.copy(p.pos).project(cam);
        p.x = (v.x + 1) / 2 * W; p.y = (1 - v.y) / 2 * H;
        p.el.style.transform = 'translate(' + Math.round(p.x) + 'px,' + Math.round(p.y) + 'px)'; p.zb = v.z > 1; }); }
      function set(p, k, val) { if (k === 's') { if (p.s !== val) { p.s = val; p.el.dataset.s = val; } } else if (p[k] !== val) { p[k] = val; p.el.classList.toggle(k, val); } }
      return { list: list, add: add, place: place, set: set };
    }
    // LED sign face on a canvas texture
    function led(w, h) {
      var c = document.createElement('canvas'); c.width = w; c.height = h; var g = c.getContext('2d'), tex = new THREE.CanvasTexture(c), key = '';
      tex.anisotropy = 4;
      function draw(lines, color) {
        var k = lines.join('|') + color; if (k === key) return; key = k;
        g.fillStyle = '#0B1218'; g.fillRect(0, 0, w, h); g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
        var n = lines.length, fs = Math.floor(h * (n > 1 ? .33 : .46)); g.font = '700 ' + fs + 'px "Geist Mono", ui-monospace, monospace';
        lines.forEach(function (l, i) { g.fillText(l, w / 2, h * (i + .5) / n + (n > 1 ? (i ? -1 : 1) * h * .03 : 0)); });
        g.fillStyle = 'rgba(11,18,24,.6)'; for (var x = 0; x < w; x += 4) g.fillRect(x, 0, 1, h); for (var y = 0; y < h; y += 4) g.fillRect(0, y, w, 1);
        tex.needsUpdate = true;
      }
      return { tex: tex, draw: draw };
    }
    // PTZ pole with a dome head that can pan
    function ptz(K, h, s) {
      s = s || 1; var g = new THREE.Group(), head = new THREE.Group();
      g.add(K.cyl(.13 * s, h, P.steel, 0, 0, 0, 8, .1 * s)); head.position.y = h; g.add(head);
      head.add(K.box(.9 * s, .12 * s, .16 * s, P.steel, .4 * s, -.06 * s, 0)); head.add(K.box(.5 * s, .36 * s, .5 * s, 0xFFFFFF, .8 * s, -.42 * s, 0));
      var dome = K.mesh(K.G(new THREE.SphereGeometry(.24 * s, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2)), K.M(P.ink, { roughness: .25 }));
      dome.position.set(.8 * s, -.42 * s, 0); head.add(dome);
      g.userData.head = head; return g;
    }
    /* ---- the GIS map: an expressway through a city grid, a river and km posts, drawn once to a texture (same every mount) ---- */
    var MS = 960, MH = MS / 2, ZS = 170, PIN = [16, 0];
    var ex = function (z) { return z < -ZS ? -.0035 * (z + ZS) * (z + ZS) : z > ZS ? .003 * (z - ZS) * (z - ZS) : 0; };
    var RIV = [[-480, -300], [-330, -180], [-250, -60], [-290, 90], [-240, 220], [-300, 480]];
    function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    function dSeg(px, pz, a, b) { var dx = b[0] - a[0], dz = b[1] - a[1], l = dx * dx + dz * dz, k = Math.max(0, Math.min(1, ((px - a[0]) * dx + (pz - a[1]) * dz) / l)); return Math.hypot(px - a[0] - k * dx, pz - a[1] - k * dz); }
    function dRiv(x, z) { var d = 1e9; for (var i = 1; i < RIV.length; i++) d = Math.min(d, dSeg(x, z, RIV[i - 1], RIV[i])); return d; }
    // terrain: the city sits flat along the expressway; soft wooded hills rise beyond it (the river keeps a flat valley)
    function hillM(x, z) { var m = Math.max(0, Math.min(1, (Math.abs(x - ex(z)) - 170) / 90)) * Math.max(0, Math.min(1, (dRiv(x, z) - 26) / 60)); return m * m * (3 - 2 * m); }
    function hill(x, z) { var m = hillM(x, z); if (m <= 0) return 0;
      var n = Math.sin(x * .012 + 1.3) * Math.cos(z * .011 - .4) * .55 + Math.sin(x * .027 - z * .019 + 2.1) * .3 + Math.cos(x * .041 + z * .035) * .15;
      return m * Math.max(0, n + .45) * 70; }
    function layout() {
      var r = rng(42), STEP = 40, blocks = [], foot = [];
      for (var gx = -MH; gx < MH; gx += STEP) for (var gz = -MH; gz < MH; gz += STEP) {
        var sw = (Math.round(gx / STEP) % 3 === 0 ? 7 : 4.5), x0 = gx + sw / 2, x1 = gx + STEP - sw / 2, z0 = gz + sw / 2, z1 = gz + STEP - sw / 2, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
        if ([[x0, z0], [x1, z0], [x0, z1], [x1, z1], [cx, cz]].some(function (p) { return Math.abs(p[0] - ex(p[1])) < 22; })) continue;
        if (dRiv(cx, cz) < 34 || hillM(cx, cz) > 0) continue;
        var park = r() < .12; blocks.push({ x0: x0, x1: x1, z0: z0, z1: z1, park: park });
        if (park) continue;
        var nx = 1 + Math.floor(r() * 2), nz = 1 + Math.floor(r() * 2);
        for (var i = 0; i < nx; i++) for (var j = 0; j < nz; j++) {
          var bx0 = x0 + (x1 - x0) * i / nx + 2, bx1 = x0 + (x1 - x0) * (i + 1) / nx - 2, bz0 = z0 + (z1 - z0) * j / nz + 2, bz1 = z0 + (z1 - z0) * (j + 1) / nz - 2;
          if (r() < .12) continue;
          var near = Math.abs((bx0 + bx1) / 2 - ex((bz0 + bz1) / 2));
          foot.push({ x0: bx0, x1: bx1, z0: bz0, z1: bz1, h: 6 + r() * 10 + Math.min(26, (near - 20) * .18) * r() });
        }
      }
      return { blocks: blocks, foot: foot };
    }
    function drawMap(LY, TX) {
      var PXU = TX / MS, c = document.createElement('canvas'); c.width = c.height = TX; var g = c.getContext('2d');
      var X = function (x) { return (x + MH) * PXU; }, Z = X, S = function (u) { return u * PXU; };
      g.fillStyle = '#FBFCFD'; g.fillRect(0, 0, TX, TX);
      // hills: a pale sage tint and a hillshade baked from the height field
      (function () { var N = 256, sh = document.createElement('canvas'); sh.width = sh.height = N; var sx = sh.getContext('2d'), id = sx.createImageData(N, N), D = id.data, cell = MS / N;
        for (var j = 0; j < N; j++) for (var i = 0; i < N; i++) { var wx = -MH + (i + .5) * cell, wz = -MH + (j + .5) * cell, m = hillM(wx, wz), o = (j * N + i) * 4;
          if (m <= 0) { D[o + 3] = 0; continue; }
          var hx = (hill(wx + 2, wz) - hill(wx - 2, wz)) / 4, hz = (hill(wx, wz + 2) - hill(wx, wz - 2)) / 4, sl = (hx * .62 + hz * .5) * 1.6;
          if (sl > 0) { D[o] = 168; D[o + 1] = 190; D[o + 2] = 212; D[o + 3] = Math.min(150, sl * 150) * m; }
          else { D[o] = 228; D[o + 1] = 239; D[o + 2] = 231; D[o + 3] = (120 + Math.min(80, -sl * 80)) * m; } }
        sx.putImageData(id, 0, 0); g.imageSmoothingEnabled = true; g.drawImage(sh, 0, 0, TX, TX); })();
      g.lineCap = 'round'; g.lineJoin = 'round';
      g.strokeStyle = '#CFE1F0'; g.lineWidth = S(30); g.beginPath(); RIV.forEach(function (p, i) { if (i) g.lineTo(X(p[0]), Z(p[1])); else g.moveTo(X(p[0]), Z(p[1])); }); g.stroke();
      LY.blocks.forEach(function (b) { g.fillStyle = b.park ? '#DCEBE2' : '#E3E9EF'; g.fillRect(X(b.x0), Z(b.z0), S(b.x1 - b.x0), S(b.z1 - b.z0)); });
      g.fillStyle = '#D3DCE6'; LY.foot.forEach(function (f) { g.fillRect(X(f.x0), Z(f.z0), S(f.x1 - f.x0), S(f.z1 - f.z0)); });
      var path = function () { g.beginPath(); for (var z = -MH - 10; z <= MH + 10; z += 4) { var x = ex(z); if (z === -MH - 10) g.moveTo(X(x), Z(z)); else g.lineTo(X(x), Z(z)); } };
      g.strokeStyle = '#BCD3E8'; g.lineWidth = S(29); path(); g.stroke();
      g.strokeStyle = '#E4EEF7'; g.lineWidth = S(26); path(); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = S(1.2); path(); g.stroke();
      g.font = '500 ' + Math.round(S(6.6)) + 'px "Geist Mono", ui-monospace, monospace'; g.textBaseline = 'middle'; g.textAlign = 'right';
      for (var k = -7; k <= 7; k++) { var z = -k * 60, x = ex(z); g.fillStyle = '#1B5A94'; g.fillRect(X(x - 15) - S(1), Z(z) - S(1), S(2), S(2));
        g.fillStyle = '#7C8EA1'; g.fillText('km ' + (42.6 + k * .6).toFixed(1), X(x - 18), Z(z)); }
      // the map tile fades into the white page at its edges
      var eg = g.createRadialGradient(TX / 2, TX / 2, TX * .36, TX / 2, TX / 2, TX * .5); eg.addColorStop(0, 'rgba(255,255,255,0)'); eg.addColorStop(1, '#FFFFFF');
      g.fillStyle = eg; g.fillRect(0, 0, TX, TX);
      return c;
    }
    var LY = layout();
    var cv = document.getElementById('hmTwin'), pinsEl = document.getElementById('hmTwPins'), tx = stage.querySelector('.tx');
    var cur = vp.querySelector('.cur'), rip = vp.querySelector('.rip'), card = vp.querySelector('.gcard'), live = document.getElementById('hmTwLive'),
      lbx = live.querySelector('.bx'), tc = document.getElementById('hmTwClk'), pcard = document.getElementById('hmTwPcard'), rp = document.getElementById('hmTwReplay'), chrome = vp.querySelector('.chrome'), scl = vp.querySelector('.scl'),
      lyr = [].slice.call(document.querySelectorAll('#hmTwSteps button')), lyrB = lyr.map(function (s) { return s.querySelector('b'); });
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var span = function (t, a1, b1, a2, b2) { return t < a2 ? seg(t, a1, b1) : 1 - seg(t, a2, b2); };
    /* ---- one mount of the scene (m = phones: copy above, taller stage, fixed street camera) ---- */
    function mount(m) {
      var R = renderer(cv, m); if (!R) return null;
      var fc = 0, CW = 1, CH = 1, cutX = 560, cutY = 0, scene = new THREE.Scene(), K = kit(), o3 = new THREE.Object3D();
      var cam = new THREE.PerspectiveCamera(20, 1, 1, 3000);
      var badge = null, szGen = 0; // the "Digital Twin · Live" badge in stage coordinates: pins must not put their label on it
      function size() {
        CW = Math.max(1, vp.clientWidth); CH = Math.max(1, vp.clientHeight);
        R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); R.setSize(CW, CH, false);
        // desktop: G's frame, the scene pushed right of the copy; phones: the lower part of a taller frame (less empty sky)
        var fw = m ? CW : CW * 1.3, fh = m ? CH * 1.2 : CH; cam.aspect = fw / fh; cam.setViewOffset(fw, fh, 0, fh - CH, CW, CH);
        var r0 = vp.getBoundingClientRect(), rt = tx.getBoundingClientRect(); cutX = rt.right - r0.left + 48; cutY = rt.bottom - r0.top + 8;
        var bd = vp.parentNode && vp.parentNode.querySelector('.tw-badge'), rb = bd && bd.getBoundingClientRect();
        badge = rb && rb.width ? { l: rb.left - r0.left - 4, r: rb.right - r0.left + 4, t: rb.top - r0.top - 4, b: rb.bottom - r0.top + 4 } : null;
        szGen++; // label widths are measured again after a resize
      }
      size();
      scene.fog = new THREE.Fog(0xffffff, 4000, 5000);
      var sun = rig(scene, 170, { map: 1024 }); sun.position.set(-90, 210, 120);
      // map plane (unlit, crisp) + a shadow catcher above it
      var tex = new THREE.CanvasTexture(drawMap(LY, 2048)); tex.anisotropy = R.capabilities.getMaxAnisotropy(); K.own(tex);
      var mapM = new THREE.MeshBasicMaterial({ map: tex, fog: true }); K.own(mapM);
      var tg0 = new THREE.PlaneGeometry(MS, MS, 160, 160), tp = tg0.attributes.position;
      for (var vi = 0; vi < tp.count; vi++) tp.setZ(vi, hill(tp.getX(vi), -tp.getY(vi))); // local z is world height after the turn
      var mapP = new THREE.Mesh(K.G(tg0), mapM); mapP.rotation.x = -Math.PI / 2; scene.add(mapP);
      // low-poly woods on the hills
      (function () { var r = rng(7), pts = [];
        for (var a = 0; a < 6000 && pts.length < 900; a++) { var x = -MH + r() * MS, z = -MH + r() * MS, mm = hillM(x, z); if (mm < .35 || r() > mm) continue; if (Math.hypot(x, z) > MH * .92) continue; pts.push([x, z, hill(x, z)]); }
        if (!pts.length) return;
        var tgeo = K.G(new THREE.IcosahedronGeometry(1, 0)); tgeo.scale(1, 1.5, 1); tgeo.translate(0, 1.2, 0);
        var tim = new THREE.InstancedMesh(tgeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .9, flatShading: true }), pts.length); K.own(tim.material);
        var TC = [0x9CC7B3, 0x86B9A6, 0xB3D4CF, 0x7FAFA3].map(function (c) { return new THREE.Color(c); });
        pts.forEach(function (q, i) { var sc = 3 + r() * 3.2; o3.position.set(q[0], q[2] - .5, q[1]); o3.rotation.set(0, r() * 3, 0); o3.scale.set(sc, sc * (.9 + r() * .4), sc); o3.updateMatrix(); tim.setMatrixAt(i, o3.matrix); tim.setColorAt(i, TC[i % 4]); });
        o3.rotation.set(0, 0, 0); scene.add(tim); })();
      // the expressway as a glowing blue route with a light running along it, and a vehicle travelling it (map view only)
      var route = new THREE.Group(); scene.add(route);
      var rc = document.createElement('canvas'); rc.width = 512; rc.height = 4; var rx = rc.getContext('2d'), rgr = rx.createLinearGradient(0, 0, 512, 0);
      rgr.addColorStop(0, 'rgba(38,115,181,.85)'); rgr.addColorStop(.7, 'rgba(38,115,181,.85)'); rgr.addColorStop(.86, 'rgba(160,210,255,1)'); rgr.addColorStop(.9, 'rgba(255,255,255,1)'); rgr.addColorStop(1, 'rgba(38,115,181,.85)');
      rx.fillStyle = rgr; rx.fillRect(0, 0, 512, 4);
      var rTex = K.own(new THREE.CanvasTexture(rc)); rTex.wrapS = THREE.RepeatWrapping; rTex.repeat.set(3, 1);
      function ribbon(w, y, mat) { var pos = [], uv = [], idx = [], n = 0, L = 0, pz = null, px = 0;
        for (var z = MH * .9; z >= -MH * .9; z -= 6) { var x = ex(z); if (pz !== null) L += Math.hypot(x - px, z - pz); var dz = -6, dx = ex(z - 6) - x, l = Math.hypot(dx, dz), nx = -dz / l * w / 2, nz = dx / l * w / 2;
          pos.push(x - nx, y, z - nz, x + nx, y, z + nz); uv.push(L / MS, 0, L / MS, 1); if (n) idx.push(2 * n - 2, 2 * n - 1, 2 * n, 2 * n - 1, 2 * n + 1, 2 * n); n++; px = x; pz = z; }
        var gg = K.G(new THREE.BufferGeometry()); gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); gg.setIndex(idx);
        var me = new THREE.Mesh(gg, mat); me.renderOrder = 2; K.own(mat); route.add(me); return me; }
      var rGlow = ribbon(34, .6, new THREE.MeshBasicMaterial({ color: 0x5A9FD4, transparent: true, opacity: .16, depthWrite: false, side: THREE.DoubleSide }));
      var rLine = ribbon(9, .8, new THREE.MeshBasicMaterial({ map: rTex, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
      var rCar = vehicle(K, 'car', 4.2, 0xFFFFFF), rCarM = []; route.add(rCar);
      rCar.traverse(function (o) { if (o.material && rCarM.indexOf(o.material) < 0) { o.material = o.material.clone(); K.own(o.material); o.material.transparent = true; rCarM.push(o.material); } });
      var rDot = new THREE.Mesh(K.G(new THREE.RingGeometry(9, 12, 40).rotateX(-Math.PI / 2)), new THREE.MeshBasicMaterial({ color: 0x2673B5, transparent: true, opacity: .5, depthWrite: false })); K.own(rDot.material); route.add(rDot);
      function routeAt(amb, kR) {
        var k = 1 - E.out3(clamp(kR * 1.6, 0, 1)); route.visible = k > .01; if (!route.visible) return;
        rTex.offset.x = -amb * .22; rGlow.material.opacity = .16 * k; rLine.material.opacity = k;
        var zc = 110 - ((amb * 20 + 62) % 220), xc = ex(zc); // loops through the middle of the map, passing CAM-07 (z = 0) as the cursor clicks it
        rCar.position.set(xc, 1, zc); rCar.rotation.set(0, -Math.atan2(-2, ex(zc - 2) - xc), 0); rCarM.forEach(function (mt) { mt.opacity = k; });
        rDot.position.set(xc, .9, zc); var pf = (amb * .9) % 1; rDot.scale.setScalar(.6 + pf * 1.4); rDot.material.opacity = .55 * (1 - pf) * k;
      }
      var shM = new THREE.MeshStandardMaterial({ color: 0xEEF3F7, roughness: 1, transparent: true, opacity: 0 }); K.own(shM);
      var shP = new THREE.Mesh(K.G(new THREE.PlaneGeometry(MS, MS)), shM); shP.rotation.x = -Math.PI / 2; shP.position.y = .04; shP.receiveShadow = true; scene.add(shP);
      // buildings that rise out of their footprints near the pin
      var BL = LY.foot.filter(function (f) { return Math.hypot((f.x0 + f.x1) / 2 - PIN[0], (f.z0 + f.z1) / 2 + 40) < (m ? 150 : 185); });
      var bg = K.G(new THREE.BoxGeometry(1, 1, 1)); bg.translate(0, .5, 0);
      var bm = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .9 }); K.own(bm);
      var bIM = new THREE.InstancedMesh(bg, bm, BL.length); bIM.castShadow = true; bIM.receiveShadow = true; scene.add(bIM);
      var BCOL = [0xFFFFFF, 0xF2F6FA, 0xE6EEF6, 0xDCE7F2].map(function (c) { return new THREE.Color(c); });
      BL.forEach(function (f, i) { f.cx = (f.x0 + f.x1) / 2; f.cz = (f.z0 + f.z1) / 2; f.d = Math.hypot(f.cx - PIN[0], f.cz - PIN[1]); bIM.setColorAt(i, BCOL[i % 4]); });
      var dMax = Math.max.apply(0, BL.map(function (f) { return f.d; }));
      function rise(k) { BL.forEach(function (f, i) { var dl = f.d / dMax * .55, r = E.out3(clamp((k - dl) / .45, 0, 1));
        o3.position.set(f.cx, 0, f.cz); o3.scale.set(f.x1 - f.x0, Math.max(.001, f.h * r), f.z1 - f.z0); o3.updateMatrix(); bIM.setMatrixAt(i, o3.matrix); });
        bIM.instanceMatrix.needsUpdate = true; bIM.visible = k > 0; }
      // the street: road, devices, trees, traffic (rises out of the map)
      var road = new THREE.Group(), dev = new THREE.Group(), trees = new THREE.Group(), traf = new THREE.Group(), RL = ZS * 2;
      scene.add(road, dev, trees, traf);
      road.add(K.box(29.6, .12, RL, P.road, 0, 0, 0)); road.add(K.box(2.4, .34, RL, P.median, 0, 0, 0));
      [-12.6, -1.6, 1.6, 12.6].forEach(function (x) { var l = K.box(.18, .03, RL, P.mark, x, .12, 0); l.castShadow = false; road.add(l); });
      (function () { var pos = []; [-5.2, -8.9, 5.2, 8.9].forEach(function (x) { for (var z = -ZS + 2; z < ZS; z += 10) pos.push([x, z]); });
        var im = new THREE.InstancedMesh(K.G(new THREE.BoxGeometry(.18, .03, 3.4)), K.M(P.mark), pos.length); im.receiveShadow = true;
        pos.forEach(function (p, i) { o3.position.set(p[0], .13, p[1]); o3.scale.set(1, 1, 1); o3.updateMatrix(); im.setMatrixAt(i, o3.matrix); }); road.add(im); })();
      for (var z = -ZS + 20; z < ZS; z += 40) { dev.add(K.cyl(.12, 9, P.steel, 0, .3, z, 8)); dev.add(K.box(6, .14, .3, P.steel, 0, 9.1, z)); dev.add(K.box(1, .2, .5, 0xFFFFFF, -2.8, 8.95, z)); dev.add(K.box(1, .2, .5, 0xFFFFFF, 2.8, 8.95, z)); }
      // CAM-07 pole at the pin, looking up the road
      var pole = ptz(K, 10, 1.4); pole.position.set(PIN[0], 0, PIN[1]); pole.userData.head.rotation.y = Math.PI * .82; dev.add(pole);
      // Dhrishya gantry and a VMS over the northbound side
      (function () { var g = new THREE.Group(); g.position.z = -40;
        [-16, 16].forEach(function (x) { g.add(K.box(.7, 8.4, .7, 0xFFFFFF, x, 0, 0)); }); g.add(K.box(32.7, .55, .55, 0xFFFFFF, 0, 7.8, 0)); g.add(K.box(32.7, .4, .4, 0xFFFFFF, 0, 6.8, 0));
        [-10.6, -7, -3.4, 3.4, 7, 10.6].forEach(function (x) { g.add(K.box(.5, .42, .9, P.deep, x, 6.15, .3)); }); dev.add(g); })();
      var vmsT = led(512, 128); K.own(vmsT.tex); vmsT.draw(['SPEED LIMIT 100'], '#F6B73C');
      (function () { var g = new THREE.Group(); g.position.z = -92;
        g.add(K.box(.8, 9.6, .8, 0xFFFFFF, -17, 0, 0)); g.add(K.box(16, .45, .45, 0xFFFFFF, -9.5, 9.1, -.4)); g.add(K.box(13.4, 3.6, .6, P.deep, -7.6, 5.6, 0));
        var face = new THREE.Mesh(K.G(new THREE.PlaneGeometry(12.8, 3.0)), new THREE.MeshBasicMaterial({ map: vmsT.tex, toneMapped: false, fog: true }));
        K.own(face.material); face.position.set(-7.6, 7.4, .31); g.add(face); dev.add(g); })();
      (function () { var s = 7, r = function () { s = (s * 16807) % 2147483647; return s / 2147483647; };
        for (var z2 = -ZS + 6; z2 < ZS - 6; z2 += 9) [-1, 1].forEach(function (sd) { if (r() < .35) return; var x = sd * (19 + r() * 5); if (Math.abs(z2 - PIN[1]) < 6 && sd > 0) return;
          if (sd > 0 && z2 > -6) return; trees.add(tree(K, x, z2, 1.5 + r() * .7)); }); })();
      // two carriageways, three lanes each; India keeps left: northbound (-z) on x<0
      var lanes = [];
      [-1, 1].forEach(function (sd) { [3.4, 7, 10.6].forEach(function (lx, li) {
        var x = sd * lx, lane = new Lane({ L: RL, vmax: [14, 12.5, 10.5][li], gap: [10, 30],
          place: function (v) { var f = v.obj.userData.front; v.obj.position.set(x, .12, sd < 0 ? ZS - v.s + f : -ZS + v.s - f); } });
        ['car', 'car', li === 2 ? 'truck' : 'car', 'car', li === 2 ? 'bus' : 'car'].forEach(function (k, i) { var o = vehicle(K, k, 1); o.rotation.y = sd < 0 ? Math.PI / 2 : -Math.PI / 2; traf.add(o); lane.add(o, RL - i * 68 - rnd(0, 20)); });
        lanes.push(lane); }); });
      warm(lanes, 6);
      // pins
      pinsEl.innerHTML = '';
      var PN = pins(pinsEl), V3 = function (x, y, z2) { return new THREE.Vector3(x, y, z2); };
      // km follows the map's posts (km 42.6 at z = 0, +0.6 km every 60 units north); all data is dummy
      var dv = function (label, type, z2, o) { return PN.add(Object.assign({ label: label, type: type, km: (42.6 - z2 / 100).toFixed(1), st: 'Online' }, o || {})); };
      var sel = dv('CAM-07', 'PTZ camera', 0, { pos: V3(PIN[0], 10.9, PIN[1]) });
      var others = [dv('Dhrishya-04', 'Dhrishya gantry', -40, { pos: V3(0, 8.6, -40) }), dv('SIGN-11', 'Message sign', -92, { pos: V3(-17, 9.8, -92) }),
        dv('ECB-21', 'Emergency call box', 46, { pos: V3(-17, 1, 46) }), dv('CAM-12', 'PTZ camera', 64, { sub: 'degraded', s: 'warn', st: 'Degraded', pos: V3(17, 1, 64) }),
        dv('CAM-15', 'Fixed camera', -28, { pos: V3(84, 1, -28) }), dv('ECB-22', 'Emergency call box', -128, { pos: V3(17, 1, -128) })];
      if (m) [others[3], others[4]].forEach(function (p) { PN.set(p, 'off', true); });
      PN.list.forEach(function (p) { if (p !== sel) p.btn.setAttribute('aria-expanded', 'false');
        p.btn.addEventListener('click', function (ev) { onPin(p, p === sel, ev.detail === 0); }); });
      // camera keyframes: top-down map -> street
      var A = m ? { x: 10, z: -6, h: 640 } : { x: 40, z: -10, h: 900 };
      var B = m ? { p: V3(20, 7, 34), t: V3(0, 2.6, -40), f: 58 } : { p: V3(21, 7, 30), t: V3(-2, 2.6, -40), f: 50 };
      var TILT = m ? 1.05 : 1.3; // the map is seen at a slant, like a miniature, not straight down
      var upA = V3(0, 1, 0), upB = V3(0, 1, 0), tA = V3(A.x, 0, A.z), tmp = V3(0, 0, 0), tg = V3(0, 0, 0);
      function camAt(t) {
        var e = t < 12.2 ? E.io3(seg(t, 3.6, 6.6)) : 1 - E.io3(seg(t, 12.2, 15.2));
        var creep = m ? 0 : .8 * Math.max(0, Math.min(t, 12.2) - 6.6) * e;
        var h = Math.exp(Math.log(A.h) + (Math.log(B.p.y) - Math.log(A.h)) * e);
        cam.position.set(A.x + (B.p.x - A.x) * e, h, A.z + (B.p.z - creep - A.z) * e + h * TILT * (1 - e));
        tg.copy(tA).lerp(tmp.copy(B.t).setZ(B.t.z - creep), e);
        cam.up.copy(upA).lerp(upB, e).normalize(); cam.lookAt(tg);
        cam.fov = 20 + (B.f - 20) * e; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
        scene.fog.near = 4000 + (70 - 4000) * e * e; scene.fog.far = 5000 + (260 - 5000) * e * e;
        return e;
      }
      // t = choreography time (from scroll, or a step button), dt / amb = real time for the ambient motion (traffic, ripple, clock)
      function frame(t, dt, amb) {
        var e = camAt(t);
        var kR = span(t, 4.3, 5.0, 13.6, 14.3), kB = span(t, 4.4, 7.0, 12.2, 13.8), kD = span(t, 4.9, 6.0, 12.3, 13.3);
        road.position.y = -3 * (1 - E.out3(kR)); road.visible = kR > 0;
        routeAt(amb, kR);
        rise(kB); shM.opacity = E.io2(kB); shP.visible = kB > 0;
        dev.position.y = -16 * (1 - E.out3(kD)); dev.visible = kD > 0;
        trees.scale.set(1, Math.max(.001, E.out3(kD)), 1); trees.visible = kD > 0;
        traf.visible = kR > .97;
        if (dt > 0) lanes.forEach(function (l) { l.step(dt); });
        var st = t < 3.6 ? 0 : t < 7.2 ? 1 : 2;
        setStep(st, staticMode ? 1 : st === 0 ? (t - TMIN) / (3.6 - TMIN) : st === 1 ? (t - 3.6) / 3.6 : (t - 7.2) / (TEND - 7.2));
        // pins (hidden ones leave the tab order too)
        PN.place(cam, CW, CH);
        var on = t > 2.45; PN.set(sel, 's', on ? 'sel' : 'ok'); sel.em.textContent = on ? 'km 42.6' : '';
        others.forEach(function (p, i) { if (m && (i === 3 || i === 4)) return; PN.set(p, 'off', t < .2 + i * .08 || t > 3.5); });
        // a pin whose label would sit on the badge or on a label already placed (the selected pin first) stays hidden this
        // frame, so labels never print over each other on small or short screens. Label widths are measured once and cached.
        var taken = badge ? [badge] : [];
        [sel].concat(PN.list.filter(function (q) { return q !== sel; })).forEach(function (p) {
          var h = p.zb || (!m && p.x < cutX && p.y - 56 < cutY);
          if (!h && !p.off) {
            if (!p.cw || p.gen !== szGen) { p.cw = p.btn.offsetWidth || 80; p.chh = p.btn.offsetHeight || 32; p.gen = szGen; }
            var w = p.cw + (p === sel && p.em.textContent ? 64 : 0), r = { l: p.x - 2, r: p.x + w + 2, t: p.y - 24 - p.chh - 2, b: p.y - 22 };
            if (p !== sel && taken.some(function (q) { return r.l < q.r && r.r > q.l && r.t < q.b && r.b > q.t; })) h = true; else taken.push(r);
          }
          if (h !== p.hid) { p.hid = h; p.el.style.opacity = h ? '0' : ''; p.el.style.visibility = h ? 'hidden' : ''; }
        });
        // cursor, click (then a real-time pulse while it rests on CAM-07), card
        var sx = sel.x, sy = sel.y, k = E.io3(seg(t, .9, 2.3));
        var x0 = m ? CW * .86 : CW * .74, y0 = m ? CH * .98 : CH * .94;
        cur.style.transform = 'translate(' + (x0 + (sx - x0) * k - 4).toFixed(1) + 'px,' + (y0 + (sy - y0) * k - 2.5).toFixed(1) + 'px)';
        cur.classList.toggle('on', t > .8 && t < 3.3);
        var rk = t < 3.0 ? seg(t, 2.4, 3.0) : (amb % 1.6) / .7, rOn = t > 2.4 && t < 3.4 && rk < 1;
        rip.style.opacity = rOn ? (.8 * (1 - rk)).toFixed(2) : '0';
        rip.style.transform = 'translate(' + sx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px) scale(' + (.3 + 1.1 * E.out3(Math.min(1, rk))).toFixed(3) + ')';
        card.style.translate = Math.round(m ? Math.max(8, Math.min(sx - 90, CW - 206)) : sx + 72) + 'px ' + Math.round(m ? sy - 196 : sy - 60) + 'px';
        card.classList.toggle('on', t > 2.6 && t < 3.8 && !S.pc);
        // another device's info card follows its pin; it closes once that pin hides
        if (S.pc) {
          if (S.pc.off || S.pc.hid) closeCard();
          else { var pw = pcard.offsetWidth, ph = pcard.offsetHeight, px = clamp(S.pc.x - pw / 2, 8, CW - pw - 8), py = S.pc.y - 56 - ph;
            if (py < 8) py = S.pc.y + 16; pcard.style.translate = Math.round(px) + 'px ' + Math.round(Math.min(py, CH - ph - 8)) + 'px'; }
        }
        // live tile (the CAM-07 tag toggles it in the street steps)
        var lv = liveShown(t); live.classList.toggle('on', lv); lbx.classList.toggle('on', lv && (S.liveOv != null || t > 7.8));
        if (sel.lv !== lv + '' + (t < 3.6)) { sel.lv = lv + '' + (t < 3.6);
          sel.btn.setAttribute('aria-label', t < 3.6 ? 'CAM-07, PTZ camera, km 42.6: open street twin' : 'CAM-07 km 42.6: ' + (lv ? 'hide' : 'show') + ' live camera');
          if (t < 3.6) sel.btn.removeAttribute('aria-pressed'); else sel.btn.setAttribute('aria-pressed', lv ? 'true' : 'false'); }
        var cs = 10 * 3600 + 42 * 60 + 18 + Math.floor(amb); if (cs !== tc.cs) tc.cs = cs, tc.textContent = pad(Math.floor(cs / 3600) % 24) + ':' + pad(Math.floor(cs / 60) % 60) + ':' + pad(cs % 60);
        chrome.style.opacity = scl.style.opacity = e < .15 ? '1' : '0';
        rp.classList.toggle('on', !staticMode && t > TEND - .3);
        if (!m && (dt <= 0 || ++fc % 6 === 0)) R.shadowMap.needsUpdate = true;
        R.render(scene, cam);
      }
      // link every shader in the background (hidden street objects shown for a moment) so the first frame never stalls the scroll
      function link(done) { var hid = []; scene.traverse(function (o) { if (!o.visible) { hid.push(o); o.visible = true; } });
        (window.INFRAX_WARM || function (r, s, c, d) { d(); })(R, scene, cam, function () { hid.forEach(function (o) { o.visible = false; }); done(); }); }
      return { frame: frame, resize: size, warm: link, ready: false, destroy: function () { K.dispose(); disposeAll(scene, R); } };
    }
    /* ---- controller. Autoplay: the choreography time runs on its own and loops; a step button or pin jumps to a step and stops it,
       Replay restarts it. Ambient motion runs in real time. Renders only while the stage is on screen and the tab is visible.
       Reduced motion / no GSAP: the step buttons switch three states. No WebGL: the map image + info states ---- */
    var TMIN = .75, TST = 6.8, TEND = 9.6, STEP_T = [TMIN, TST, TEND];
    var T2P = function (t) { return clamp((t - TMIN) / (TEND - TMIN), 0, 1); };
    var S = { liveOv: null, pc: null }, step = -1, st = null, staticMode = reduce || !hasG;
    var inst = null, mode = '', tGoal = TMIN, tCur = TMIN, amb = 0, onScreen = false, raf = 0, last = 0, away = true, dead = false;
    var auto = !staticMode, hold = 0, AUTO_RATE = .85, AUTO_HOLD = 5;
    function isPhone() { return tablet(); }
    function glOK() {
      if (!window.THREE) return false;
      try { var c = document.createElement('canvas'), g = c.getContext('webgl') || c.getContext('experimental-webgl'); if (!g) return false;
        var x = g.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); return true; } catch (e) { return false; }
    }
    function setStep(s, pr) {
      if (s !== step) { step = s; S.liveOv = null;
        lyr.forEach(function (b, i) { var o = i === s; b.classList.toggle('on', o); if (o) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); }); }
      lyrB[s].style.transform = 'scaleX(' + clamp(pr, 0, 1).toFixed(3) + ')';
    }
    function liveShown(t) { return S.liveOv != null ? S.liveOv : t > 7.2; }
    function closeCard() { if (S.pc) { S.pc.btn.setAttribute('aria-expanded', 'false'); S.pc = null; } pcard.classList.remove('on'); }
    function openCard(p, kb) {
      closeCard(); S.pc = p; var o = p.o;
      pcard.classList.toggle('warn', o.st !== 'Online'); pcard.setAttribute('aria-label', o.label + ' details');
      pcard.querySelector('.r1 span').textContent = o.st + ' \u00b7 ' + o.type; pcard.querySelector('.tt').textContent = o.label + ' \u00b7 km ' + o.km;
      p.btn.setAttribute('aria-expanded', 'true'); pcard.classList.add('on'); paint();
      if (kb) pcard.querySelector('.go').focus({ preventScroll: true });
    }
    function onPin(p, isSel, kb) {
      if (isSel) { closeCard(); if (tCur < 3.6) go(TST); else { S.liveOv = !liveShown(tCur); paint(); } return; }
      if (S.pc === p) closeCard(); else openCard(p, kb);
    }
    // jump to a step: in scroll mode, scroll (Lenis) to that step's place inside the pin and the scene follows
    function go(t) {
      auto = false;
      if (dead) { fbState(t < 3.6 ? 0 : t < 7.2 ? 1 : 2); return; }
      if (!st) { tGoal = t; if (reduce) { tCur = t; paint(); } else play(); return; }
      var y = Math.round(st.start + (st.end - st.start) * T2P(t));
      if (X.lenis) X.lenis.scrollTo(y, { duration: 1.2 }); else scrollTo({ top: y, behavior: 'smooth' });
    }
    // no WebGL: the same GIS map as a flat image; the step buttons switch map / CAM-07 card / live tile
    function fbState(i) {
      setStep(i, 1);
      var ph = isPhone(); card.style.left = (ph ? 16 : Math.max(vp.clientWidth * .6, (tx.getBoundingClientRect().right - vp.getBoundingClientRect().left) + 40)) + 'px'; card.style.top = (ph ? 24 : vp.clientHeight * .36) + 'px';
      card.classList.toggle('on', i === 1); live.classList.toggle('on', i === 2); lbx.classList.toggle('on', i === 2);
    }
    function fallback() {
      dead = true; cv.style.display = 'none'; pinsEl.hidden = true;
      try { var im = new Image(); im.className = 'tw-fb'; im.alt = ''; im.src = drawMap(LY, 1600).toDataURL('image/jpeg', .86); vp.insertBefore(im, vp.firstChild); } catch (e) {}
      fbState(0);
    }
    function ensure() {
      if (dead) return;
      var md = isPhone() ? 'm' : 'd';
      if (inst && md === mode) return;
      closeCard();
      if (inst) { inst.destroy(); inst = null; var n = cv.cloneNode(false); cv.parentNode.replaceChild(n, cv); cv = n; }
      mode = md; inst = mount(md === 'm');
      if (!inst) fallback(); else { var mi = inst; mi.warm(function () { mi.ready = true; if (inst === mi && onScreen) play(); }); }
    }
    function paint() { if (inst && inst.ready) inst.frame(tCur, 0, amb); }
    function tick(now) {
      raf = 0;
      if (!onScreen || document.hidden || !inst || !inst.ready || covered()) { away = true; return; }
      raf = requestAnimationFrame(tick);
      if (now - last < 31) return; // 30 fps: the twin moves slowly, and this halves its GPU and DOM work
      var dt = Math.min(.1, (now - last) / 1000); last = now;
      if (away) { away = false; tCur = tGoal; }
      // autoplay: the choreography runs in real time (map → street twin → live camera), holds, then rewinds to the map and loops
      if (auto) { if (tGoal < TEND) tGoal = Math.min(TEND, tGoal + dt * AUTO_RATE); else if ((hold += dt) > AUTO_HOLD) { hold = 0; tGoal = TMIN; } }
      amb += dt; var d = tGoal - tCur; tCur = Math.abs(d) < .002 ? tGoal : tCur + d * (1 - Math.exp(-dt * 7));
      inst.frame(tCur, dt, amb);
    }
    function play() { ensure(); if (!inst || !inst.ready) return; if (reduce) { paint(); return; } if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } }
    lyr.forEach(function (b, i) { b.addEventListener('click', function () { closeCard(); go(STEP_T[i]); }); });
    card.querySelector('.go').addEventListener('click', function () { go(dead ? TEND : TST); });
    pcard.querySelector('.go').addEventListener('click', function () { var p = S.pc; closeCard(); if (p && p.btn) p.btn.blur(); go(TST); });
    rp.addEventListener('click', function () { closeCard(); go(TMIN); auto = !staticMode; hold = 0; });
    stage.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && S.pc) { var b = S.pc.btn; closeCard(); b.focus({ preventScroll: true }); } });
    docAdd('pointerdown', function (ev) { if (S.pc && !ev.target.closest('#hmTwPcard,.tpin .ch')) closeCard(); }, { passive: true });
    if (!glOK()) fallback();
    else {
      // no scroll pin: the twin plays on its own while it is on screen (see auto in tick)
      new IntersectionObserver(function (es) { if (es[0].isIntersecting) ensure(); }, { rootMargin: '600px 0px' }).observe(stage);
      var vis = function (v) { onScreen = v; if (v) play(); };
      new IntersectionObserver(function (es) { vis(es[0].isIntersecting); }, { threshold: .25 }).observe(vp);
      var wake = function () { if (!document.hidden && onScreen && !covered()) play(); };
      docAdd('visibilitychange', wake); docAdd('infrax:cover', wake);
    }
    var rsT = 0;
    addEventListener('resize', function () { clearTimeout(rsT); rsT = setTimeout(function () {
      if (dead) { fbState(step); return; } if (!inst) return; var md = isPhone() ? 'm' : 'd';
      if (md !== mode) ensure(); else inst.resize(); if (reduce || !raf) paint();
    }, 160); });
  })();

  /* ---------- AI Beings: the example exchanges appear once the section is on screen ---------- */
  (function () {
    var g = document.getElementById('hmAg'); if (!g || reduce || !window.IntersectionObserver) return;
    g.classList.add('typing');
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { g.classList.add('on'); io.disconnect(); } }, { threshold: .35 });
    io.observe(g);
  })();

  /* ---------- live time on photo overlays ---------- */
  (function () {
    var els = document.querySelectorAll('[data-clock]');
    function tick() { var d = new Date(), p = function (x) { return String(x).padStart(2, '0'); }, t = p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
      for (var i = 0; i < els.length; i++) els[i].textContent = t; }
    tick(); setInterval(function () { if (!document.hidden) tick(); }, 1000);
  })();

  /* ---------- quick entrances ---------- */
  if (G && ST && !reduce) {
    [['#hmPgrid .hm-pc', '#hmPgrid'], ['#hmTiles .hm-tile', '#hmTiles']].forEach(function (p) {
      G.from(p[0], { y: 14, opacity: 0, duration: .4, stagger: .04, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: p[1], start: 'top 88%' } });
    });
    G.from('#hwFig', { y: 18, opacity: 0, duration: .45, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: '#hwFig', start: 'top 85%' } });
  }


  // PORT: cleanup for client-side navigation away from this page
  return function stop() {
    stopped = true;
    rafs.forEach(function (id) { window.cancelAnimationFrame(id); }); rafs.clear();
    timers.forEach(function (id) { window.clearTimeout(id); }); timers.clear();
    intervals.forEach(function (id) { window.clearInterval(id); }); intervals.clear();
    winL.forEach(function (l) { window.removeEventListener(l[0], l[1], l[2]); });
    docL.forEach(function (l) { document.removeEventListener(l[0], l[1], l[2]); });
    obs.forEach(function (ob) { ob.disconnect(); });
    renderers.forEach(function (r) {
      try { r.dispose(); var gl = r.getContext(); if (gl && !gl.isContextLost()) r.forceContextLoss(); } catch (e) {}
    });
    // tweens started later from callbacks (tile hover scans, the twin's camera moves) are outside usePage's gsap.context
    if (G) sections.forEach(function (s) { G.killTweensOf(s.querySelectorAll('*')); });
    // the hero intro hides the nav until it ends: never leave it hidden on the next page
    if (window.INFRAX_NAV_IN) window.INFRAX_NAV_IN();
    document.documentElement.classList.remove('nav-wait');
  };
}

// Analytics page script: the inline <script> of site/src/analytics.html, unchanged inside init() except where marked
// "PORT:". usePage('analytics', init) runs it once the page markup is mounted (after the shared per-page runtime);
// the returned function stops it when the visitor navigates away.
// GSAP tweens and ScrollTriggers created synchronously here (the card entrances) are reverted automatically (usePage
// wraps init in a gsap.context); the cleanup stops the rest: the shared rAF loop, the resize debounce, the
// Resize/IntersectionObservers, document/window/button listeners and the filter's FLIP tweens (made later, on click).
export function init() {
  'use strict'; // PORT: the static page wrapped this body in an IIFE; it is now init()
  var X = window.INFRAX || {}, reduce = !!X.reduce;
  var lite = X.lite !== undefined ? !!X.lite : !!(window.matchMedia && matchMedia('(max-width:768px),(pointer:coarse)').matches);
  var dpr = Math.min(devicePixelRatio || 1, 2);
  var DOM = { hwy: 'Highways', city: 'Cities', campus: 'Campuses', ports: 'Ports', wh: 'Warehouses', cons: 'Construction' };
  var B = '38,115,181', D = '14,59,102', S = '90,159,212', A = '214,69,61', INK = '10,26,43', MUT = '91,110,130';
  var cards = [].slice.call(document.querySelectorAll('.an-card'));
  cards.forEach(function (c) {
    c.querySelector('.an-doms').innerHTML = c.dataset.d.split(' ').map(function (k) { return '<span>' + DOM[k] + '</span>'; }).join('');
    if (c.dataset.p) { var pp = document.createElement('p'); pp.className = 'an-prod'; pp.textContent = 'In ' + c.dataset.p; c.querySelector('.an-doms').before(pp); }
  });

  function ease(k) { k = Math.max(0, Math.min(1, k)); return 1 - Math.pow(1 - k, 3); }
  function font(c, px, w) { c.font = (w || 500) + ' ' + Math.max(12, px) + 'px "Geist Mono",monospace'; }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function car(c, x, y, w, h, col) { rr(c, x, y, w, h, Math.min(w, h) * .25); c.fillStyle = col; c.fill(); }
  function lanes(c, W, H, n, top, bot, t, dash) {
    c.strokeStyle = 'rgba(' + B + ',.18)'; c.lineWidth = 1;
    for (var i = 0; i <= n; i++) { var y = top + (bot - top) * i / n; c.setLineDash(i === 0 || i === n ? [] : [10, 10]); c.lineDashOffset = dash ? -t * 40 : 0; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    c.setLineDash([]);
  }
  function pill(c, x, y, s, col) {
    font(c, 12); var tw = c.measureText(s).width + 12, th = 19;
    c.fillStyle = 'rgba(' + col + ',1)'; rr(c, x, y - th, tw, th, 3); c.fill();
    c.fillStyle = '#fff'; c.fillText(s, x + 6, y - 5);
  }
  function vline(c, x, y0, y1, col, w) { c.strokeStyle = col; c.lineWidth = w || 2; c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y1); c.stroke(); }
  // a round check mark (ok) or cross in the given colour
  function tick(c, x, y, ok, col) {
    c.beginPath(); c.arc(x, y, 7, 0, 7); c.fillStyle = 'rgba(' + col + ',1)'; c.fill();
    c.strokeStyle = '#fff'; c.lineWidth = 1.8; c.beginPath();
    if (ok) { c.moveTo(x - 3, y); c.lineTo(x - 1, y + 2.5); c.lineTo(x + 3.5, y - 2.5); } else { c.moveTo(x - 2.5, y - 2.5); c.lineTo(x + 2.5, y + 2.5); c.moveTo(x + 2.5, y - 2.5); c.lineTo(x - 2.5, y + 2.5); }
    c.stroke();
  }
  // a chat bubble with one line of text; right-aligned when mine
  function bubble(c, x, y, maxW, s, mine, col) {
    font(c, 12); var tw = Math.min(c.measureText(s).width, maxW - 16), bw = tw + 16, bx = mine ? x + maxW - bw : x;
    rr(c, bx, y, bw, 24, 8); c.fillStyle = mine ? 'rgba(' + (col || B) + ',1)' : 'rgba(' + S + ',.18)'; c.fill();
    c.fillStyle = mine ? '#fff' : 'rgba(' + INK + ',1)'; c.fillText(s, bx + 8, y + 16, bw - 16);
  }

  // ---- front camera view, shared by the traffic cards: a camera over the road looks down the lanes to the vanishing
  // point; vehicles come towards it (or, rear view, drive away). fvRoad draws the road in a rect and returns its mapping.
  function fvRoad(c, x0, y0, w, h, t, o) {
    o = o || {};
    var hy = y0 + h * (o.hz || .1), vx = x0 + w * .5, by = y0 + h * 1.04, Lb = w * (o.lb || .34), k3 = by - hy, sh = o.shoulder || 0, lsh = o.lshoulder || 0;
    var R = { X: function (u, s) { return vx + u * Lb * s; }, Y: function (s) { return hy + k3 * s; }, S: function (y) { return (y - hy) / k3; }, Lb: Lb, hy: hy, by: by, vx: vx };
    c.fillStyle = 'rgba(' + S + ',.10)'; c.beginPath(); c.moveTo(vx - 2, hy); c.lineTo(vx + 2, hy); c.lineTo(R.X(1.6 + sh, 1), by); c.lineTo(R.X(-1.6 - lsh, 1), by); c.closePath(); c.fill();
    if (lsh) { c.fillStyle = 'rgba(' + MUT + ',.08)'; c.beginPath(); c.moveTo(vx, hy); c.lineTo(R.X(-1.5, 1), by); c.lineTo(R.X(-1.5 - lsh, 1), by); c.closePath(); c.fill(); }
    if (o.median) { c.fillStyle = 'rgba(31,138,91,.16)'; c.beginPath(); c.moveTo(vx - 2, hy); c.lineTo(R.X(-1.5, 1), by); c.lineTo(R.X(-1.95, 1), by); c.closePath(); c.fill(); }
    if (sh) { c.fillStyle = 'rgba(' + MUT + ',.08)'; c.beginPath(); c.moveTo(vx, hy); c.lineTo(R.X(1.5 + sh, 1), by); c.lineTo(R.X(1.5, 1), by); c.closePath(); c.fill(); }
    c.strokeStyle = 'rgba(' + B + ',.35)'; c.lineWidth = 1.2;
    [-1.5, 1.5].forEach(function (u) { c.beginPath(); c.moveTo(vx, hy); c.lineTo(R.X(u, 1), by); c.stroke(); });
    c.setLineDash([8, 10]); c.lineDashOffset = -t * 60 * (o.rev ? -1 : 1); c.strokeStyle = 'rgba(' + B + ',.28)';
    [-.5, .5].forEach(function (u) { c.beginPath(); c.moveTo(vx, hy); c.lineTo(R.X(u, 1), by); c.stroke(); });
    c.setLineDash([]);
    return R;
  }
  // vehicle class: width and height in lane widths
  var VC = { CAR: [.52, .36], TRUCK: [.7, .66], BUS: [.74, .7], '2W': [.2, .42], '3W': [.42, .44] };
  // one vehicle at depth s (0 far, 1 at the camera); rear = seen from behind (tail lights). Returns its box.
  function fvVeh(c, R, u, s, cl, o) {
    o = o || {};
    var d = VC[cl], w = d[0] * R.Lb * s, h = d[1] * R.Lb * s, cx = R.X(u, s), y1 = R.Y(s), x0 = cx - w / 2, y0 = y1 - h, heavy = cl === 'TRUCK' || cl === 'BUS';
    rr(c, x0, y0, w, h, Math.min(w, h) * .18); c.fillStyle = o.fill || (heavy ? 'rgba(' + D + ',.55)' : 'rgba(' + MUT + ',.5)'); c.fill();
    if (o.rear) { rr(c, x0 + w * .2, y0 + h * .12, w * .6, h * .26, Math.min(w, h) * .06); c.fillStyle = 'rgba(255,255,255,.45)'; c.fill(); }
    else { rr(c, x0 + w * .12, y0 + h * .1, w * .76, h * (heavy ? .38 : .34), Math.min(w, h) * .08); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill(); }
    if (cl !== '2W') { c.fillStyle = o.rear ? 'rgba(230,60,50,.95)' : (o.lights || 'rgba(255,214,120,.95)'); var lr = Math.max(1, w * .05); c.beginPath(); c.arc(x0 + w * .16, y0 + h * .78, lr, 0, 7); c.arc(x0 + w * .84, y0 + h * .78, lr, 0, 7); c.fill(); }
    var pad = Math.max(2, w * .06);
    return { x: x0 - pad, y: y0 - pad, w: w + pad * 2, h: h + pad * 2 };
  }
  // a detection box: thin outline with bold corners, an optional label pill above it
  function fvBox(c, b, col, label, W) {
    var L = Math.min(b.w, b.h) * .28;
    c.strokeStyle = 'rgba(' + col + ',.5)'; c.lineWidth = 1; c.strokeRect(b.x, b.y, b.w, b.h);
    c.strokeStyle = 'rgba(' + col + ',1)'; c.lineWidth = 2.2; c.beginPath();
    c.moveTo(b.x, b.y + L); c.lineTo(b.x, b.y); c.lineTo(b.x + L, b.y); c.moveTo(b.x + b.w - L, b.y); c.lineTo(b.x + b.w, b.y); c.lineTo(b.x + b.w, b.y + L);
    c.moveTo(b.x + b.w, b.y + b.h - L); c.lineTo(b.x + b.w, b.y + b.h); c.lineTo(b.x + b.w - L, b.y + b.h); c.moveTo(b.x + L, b.y + b.h); c.lineTo(b.x, b.y + b.h); c.lineTo(b.x, b.y + b.h - L); c.stroke();
    if (label) { font(c, 12); var tw = c.measureText(label).width + 12; pill(c, Math.max(2, Math.min((W || 9999) - tw - 2, b.x)), Math.max(21, b.y - 3), label, col); }
  }
  // the traffic: a fixed sequence of classes and lanes, each looping towards the camera; sorted far to near
  var FV_SEQ = [['CAR', 0], ['TRUCK', 1], ['2W', -1], ['BUS', 0], ['3W', 1], ['CAR', -1], ['CAR', 1], ['2W', 0]];
  function fvTraffic(t, rate, seq) {
    seq = seq || FV_SEQ;
    return seq.map(function (q, i) { var p = t * rate + i / seq.length, k = p % 1; return { i: i, cl: q[0], u: q[1] * .98, s: .05 + k * k * 1.05, n: Math.floor(p) }; })
      .sort(function (a, b) { return a.s - b.s; });
  }
  // camera overlay: name tag top-left, blinking REC top-right
  function fvHud(c, x0, y0, w, name, t) {
    font(c, 12); var tw = c.measureText(name).width + 14;
    rr(c, x0 + 8, y0 + 8, tw, 21, 4); c.fillStyle = 'rgba(' + INK + ',.78)'; c.fill(); c.fillStyle = '#fff'; c.fillText(name, x0 + 15, y0 + 23);
    if (w > 200) { c.fillStyle = 'rgba(' + A + ',' + ((t % 1.2) < .8 ? 1 : .3) + ')'; c.beginPath(); c.arc(x0 + w - 44, y0 + 18, 4, 0, 7); c.fill(); c.fillStyle = 'rgba(' + INK + ',.8)'; c.fillText('REC', x0 + w - 36, y0 + 23); }
  }

  var PLATES = ['XX 26 AB 1234', 'XX 03 CD 1290', 'XX 16 CT 4411', 'XX 04 KU 6620', '22 BH 0000 XX', 'XX 05 MN 7720'];
  var SIMS = {
    wrongway: function (c, W, H, t) {
      // front camera facing the oncoming traffic (left-hand traffic): the median is on the picture's left, the kerb-side
      // shoulder on its right; one vehicle on that shoulder drives away from the camera, against the flow
      var R = fvRoad(c, 0, 0, W, H, t, { median: true, shoulder: .8, lb: .3 });
      var cyc = 7, k = (t % cyc) / cyc, ws = 1.02 - k * .95, ww = null;
      var V = fvTraffic(t, .085, [['CAR', 0], ['TRUCK', 1], ['CAR', 1], ['BUS', 0], ['3W', 1], ['CAR', 0]]);
      V.push({ wrong: true, cl: 'CAR', u: 1.95, s: ws }); V.sort(function (a, b) { return a.s - b.s; });
      V.forEach(function (v) {
        if (R.Y(v.s) - VC[v.cl][1] * R.Lb * v.s > H) return;
        if (v.wrong) { ww = fvVeh(c, R, v.u, v.s, v.cl, { rear: true, fill: 'rgba(' + A + ',.85)' }); return; }
        var b = fvVeh(c, R, v.u, v.s, v.cl); if (v.s > .34) fvBox(c, b, B);
      });
      if (ww) {
        var r = 6 + ((t * 26) % 18); c.beginPath(); c.arc(ww.x + ww.w / 2, ww.y + ww.h / 2, Math.max(ww.w, ww.h) / 2 + r, 0, 7); c.strokeStyle = 'rgba(' + A + ',' + (1 - r / 24) * .7 + ')'; c.lineWidth = 2; c.stroke();
        fvBox(c, ww, A, 'WRONG WAY · shoulder', W);
        // an arrow beside it: the direction it is driving (away from the camera)
        var ax = ww.x - 10, ay = ww.y + ww.h; c.strokeStyle = 'rgba(' + A + ',1)'; c.lineWidth = 2; c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax, ay - 22); c.moveTo(ax - 5, ay - 16); c.lineTo(ax, ay - 22); c.lineTo(ax + 5, ay - 16); c.stroke();
      }
      fvHud(c, 0, 0, W, 'CAM-21 · front view', t);
      font(c, 12); c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText('clip + lane attached · sample', 12, H - 10);
    },
    stopped: function (c, W, H, t) {
      // front camera, same layout as wrong-way: median on the picture's left, kerb-side hard shoulder on its right; one
      // vehicle stands on the shoulder with its hazard lights on, its dwell timer runs and the alert fires at 30 s
      var R = fvRoad(c, 0, 0, W, H, t, { median: true, shoulder: .8, lb: .3 });
      var dwell = Math.floor(t * 6) % 75, alert = dwell >= 30, ss = .62, haz = (t % .8) < .4;
      var V = fvTraffic(t, .085, [['CAR', -1], ['TRUCK', 0], ['CAR', 1], ['BUS', -1], ['3W', 0], ['CAR', 1]]);
      V.push({ stop: true, cl: 'CAR', u: 1.95, s: ss }); V.sort(function (a, b) { return a.s - b.s; });
      V.forEach(function (v) {
        if (R.Y(v.s) - VC[v.cl][1] * R.Lb * v.s > H) return;
        if (!v.stop) { fvVeh(c, R, v.u, v.s, v.cl); return; }
        var b = fvVeh(c, R, v.u, v.s, v.cl, { fill: alert ? 'rgba(' + A + ',.8)' : 'rgba(' + D + ',.7)', lights: haz ? 'rgba(255,170,40,1)' : 'rgba(255,170,40,.25)' });
        fvBox(c, b, alert ? A : D, (alert ? 'STOPPED · ' : 'dwell · ') + '00:' + String(dwell % 60).padStart(2, '0'), W);
      });
      font(c, 12); c.fillStyle = 'rgba(' + D + ',.7)'; var shl = 'shoulder'; c.fillText(shl, Math.min(W - c.measureText(shl).width - 6, R.X(2.3, .3) + 4), R.Y(.3) + 4);
      fvHud(c, 0, 0, W, 'CAM-14 · front view', t);
      font(c, 12); c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText('shoulder · alert at 30 s · sample', 12, H - 10);
    },
    speed: function (c, W, H, t) {
      // top view: radar and camera on a gantry across the lanes, aimed down the road at the oncoming traffic; radar
      // pulses run out from the gantry, a vehicle lights up as a pulse reaches it and its speed shows in the zone
      var L = W * .2, rx0 = W / 2 - L * 1.5, gy = H * .18, z0 = H * .36, z1 = H * .86, SP = [88, 112, 74, 96, 104, 81];
      c.fillStyle = 'rgba(' + S + ',.12)'; c.fillRect(rx0, 0, L * 3, H);
      c.strokeStyle = 'rgba(' + B + ',.45)'; c.lineWidth = 1.5; [0, 3].forEach(function (k) { c.beginPath(); c.moveTo(rx0 + L * k, 0); c.lineTo(rx0 + L * k, H); c.stroke(); });
      c.setLineDash([10, 10]); c.lineDashOffset = t * 50; c.strokeStyle = 'rgba(' + B + ',.35)'; [1, 2].forEach(function (k) { c.beginPath(); c.moveTo(rx0 + L * k, 0); c.lineTo(rx0 + L * k, H); c.stroke(); }); c.setLineDash([]);
      // the measuring zone
      c.fillStyle = 'rgba(' + B + ',.06)'; c.fillRect(rx0, z0, L * 3, z1 - z0);
      font(c, 12); c.fillStyle = 'rgba(' + D + ',.7)'; c.save(); c.translate(rx0 - 8, (z0 + z1) / 2); c.rotate(-Math.PI / 2); c.textAlign = 'center'; c.fillText('measuring zone', 0, 0); c.restore();
      // radar beam and pulses from the gantry
      var rxc = W / 2, ry = gy + 6;
      c.save(); c.beginPath(); c.moveTo(rxc, ry); c.lineTo(rx0 - L * .2, H); c.lineTo(rx0 + L * 3.2, H); c.closePath(); c.fillStyle = 'rgba(' + B + ',.07)'; c.fill(); c.clip();
      var pulses = [];
      for (var a = 0; a < 4; a++) { var r = ((t * 120 + a * (H * .9 / 4)) % (H * .9)) + 6; pulses.push(r); c.beginPath(); c.arc(rxc, ry, r, .12 * Math.PI, .88 * Math.PI); c.strokeStyle = 'rgba(' + B + ',' + Math.max(0, .75 - r / (H * 1.1)) + ')'; c.lineWidth = 2.5; c.stroke(); }
      c.restore();
      // traffic from the bottom, driving up under the gantry
      for (var i = 0; i < 6; i++) {
        var ln = i % 3, k = (t * (.11 + ln * .012) + i / 6) % 1, cx = rx0 + L * (ln + .5), vw = L * .5, vh = L * (i === 1 ? 1.25 : .82), y = H + vh - k * (H + vh * 2);
        var over = SP[i] > 100, inz = y > z0 && y < z1, hit = pulses.some(function (r) { return Math.abs(Math.hypot(cx - rxc, y - ry) - r) < 8; });
        rr(c, cx - vw / 2, y, vw, vh, vw * .22); c.fillStyle = over && inz ? 'rgba(' + A + ',.8)' : 'rgba(' + MUT + ',.55)'; c.fill();
        rr(c, cx - vw * .36, y + vh * .12, vw * .72, vh * .2, 3); c.fillStyle = 'rgba(255,255,255,.6)'; c.fill();
        if (inz && hit) { c.strokeStyle = 'rgba(' + B + ',.9)'; c.lineWidth = 2; c.strokeRect(cx - vw / 2 - 3, y - 3, vw + 6, vh + 6); }
        if (inz) pill(c, Math.min(W - 80, cx + vw / 2 + 4), y + 12, SP[i] + ' km/h', over ? A : B);
      }
      // the gantry across the road: radar in the middle, camera beside it
      c.fillStyle = 'rgba(' + D + ',.85)'; c.fillRect(rx0 - 10, gy - 4, L * 3 + 20, 8);
      rr(c, rxc - 14, gy - 9, 28, 18, 4); c.fillStyle = 'rgba(' + B + ',1)'; c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(rxc, gy, 3.5, 0, 7); c.fill();
      rr(c, rxc + L * .9 - 9, gy - 7, 18, 14, 3); c.fillStyle = 'rgba(' + INK + ',.85)'; c.fill();
      font(c, 12); c.fillStyle = 'rgba(' + D + ',1)'; c.fillText('radar', rxc - 18, gy - 14); c.fillText('camera', rxc + L * .9 - 22, gy + 22);
      fvHud(c, 0, 0, W, 'Gantry G04 · top view', t);
      c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText('limit 100 · sample', 12, H - 10);
    },
    track: function (c, W, H, t) {
      var n = 3, gw = (W - 24 - 16) / n, gh = H * .55, cyc = 6, k = (t % cyc) / cyc, y = 14;
      var KIND = ['ANPR', 'PTZ', 'JUNCTION'], ID = ['CAM-03', 'CAM-07', 'CAM-11'], TS = ['08:42:10', '08:43:02', '08:44:37'];
      for (var i = 0; i < n; i++) {
        var x = 12 + i * (gw + 8), on = k * 3.4 > i + .3, live = on && k * 3.4 < i + 1.3;
        c.save(); rr(c, x, y, gw, gh, 6); c.clip();
        if (i === 0) {
          // ANPR: infrared close-up of the rear of the car, the plate boxed and read
          c.fillStyle = '#1B232C'; c.fillRect(x, y, gw, gh);
          c.fillStyle = 'rgba(255,255,255,.05)'; c.fillRect(x, y + gh * .78, gw, gh * .22);
          if (on) {
            var bw = gw * .7, bx = x + (gw - bw) / 2, by = y + gh * .3;
            rr(c, bx, by, bw, gh * .5, 10); c.fillStyle = '#C9D1D9'; c.fill();
            rr(c, bx + bw * .14, by + 6, bw * .72, gh * .16, 5); c.fillStyle = '#3A4652'; c.fill();
            c.fillStyle = '#E8564C'; c.fillRect(bx + 4, by + gh * .25, 10, 5); c.fillRect(bx + bw - 14, by + gh * .25, 10, 5);
            var pw = bw * .5, px = x + (gw - pw) / 2, py = by + gh * .32;
            c.fillStyle = '#fff'; c.fillRect(px, py, pw, 13);
            c.font = '600 9px "Geist Mono",monospace'; c.fillStyle = '#111'; c.textAlign = 'center'; c.fillText('XX26AB1234', px + pw / 2, py + 10); c.textAlign = 'left';
            c.strokeStyle = 'rgba(' + S + ',1)'; c.lineWidth = 2; c.strokeRect(px - 4, py - 4, pw + 8, 21);
          }
        } else if (i === 1) {
          // PTZ: the view zooms in on the car and the frame follows it
          var z = on ? 1 + Math.max(0, Math.min(1, (k * 3.4 - 1.3) / .8)) * .9 : 1;
          c.fillStyle = 'rgba(' + D + ',.95)'; c.fillRect(x, y, gw, gh);
          var cx0 = x + gw / 2, cy0 = y + gh * .58;
          c.strokeStyle = 'rgba(255,255,255,.2)'; c.lineWidth = 1; c.beginPath();
          c.moveTo(cx0 - gw * .12 * z, y); c.lineTo(cx0 - gw * .6 * z, y + gh); c.moveTo(cx0 + gw * .12 * z, y); c.lineTo(cx0 + gw * .6 * z, y + gh); c.stroke();
          if (on) {
            var vx = cx0 + Math.sin(t * 1.3) * 6, vw = 22 * z, vh = 14 * z;
            car(c, vx - vw / 2, cy0 - vh / 2, vw, vh, 'rgba(255,255,255,.95)');
            var fw = vw + 16, fh = vh + 14, fx = vx - fw / 2, fy = cy0 - fh / 2, L = 7;
            c.strokeStyle = 'rgba(' + S + ',1)'; c.lineWidth = 2; c.beginPath();
            [[fx, fy, 1, 1], [fx + fw, fy, -1, 1], [fx, fy + fh, 1, -1], [fx + fw, fy + fh, -1, -1]].forEach(function (q) { c.moveTo(q[0] + q[2] * L, q[1]); c.lineTo(q[0], q[1]); c.lineTo(q[0], q[1] + q[3] * L); });
            c.stroke();
          }
          c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx0 - 5, y + gh * .2); c.lineTo(cx0 + 5, y + gh * .2); c.moveTo(cx0, y + gh * .2 - 5); c.lineTo(cx0, y + gh * .2 + 5); c.stroke();
          font(c, 11); c.fillStyle = 'rgba(255,255,255,.75)'; c.fillText('ZOOM ' + (z * 4).toFixed(0) + '×', x + 6, y + gh - 8);
        } else {
          // junction overview: a crossroads from high up, the same car picked out of the traffic
          c.fillStyle = 'rgba(' + D + ',.95)'; c.fillRect(x, y, gw, gh);
          c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(x, y + gh * .4, gw, gh * .26); c.fillRect(x + gw * .4, y, gw * .22, gh);
          for (var j = 0; j < 5; j++) {
            var hz = j % 2 === 0, q = ((t * .12 + j * .23) % 1);
            var ox = hz ? x + q * gw : x + gw * (.44 + (j % 3) * .05), oy = hz ? y + gh * (.45 + (j % 4) * .05) : y + q * gh;
            car(c, ox - 5, oy - 3, hz ? 10 : 6, hz ? 6 : 10, 'rgba(255,255,255,.45)');
          }
          if (on) {
            var tq = Math.max(0, Math.min(1, (k * 3.4 - 2.3) / 1.1)), tx = x + gw * (.1 + .75 * tq), ty = y + gh * .5;
            car(c, tx - 6, ty - 4, 12, 8, 'rgba(255,255,255,.95)');
            c.strokeStyle = 'rgba(' + S + ',1)'; c.lineWidth = 2; c.strokeRect(tx - 10, ty - 8, 20, 16);
          }
        }
        c.restore();
        rr(c, x, y, gw, gh, 6); c.strokeStyle = live ? 'rgba(' + S + ',1)' : 'rgba(255,255,255,0)'; c.lineWidth = 2; c.stroke();
        font(c, 11, 600); c.fillStyle = 'rgba(255,255,255,.85)'; c.fillText(KIND[i], x + 6, y + 15);
        font(c, 11); c.fillStyle = 'rgba(255,255,255,.6)'; c.textAlign = 'right'; c.fillText(ID[i], x + gw - 6, y + gh - 8, gw); c.textAlign = 'left';
        if (on) { font(c, 11); c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText(TS[i], x + 2, y + gh + 15); }
      }
      var m = Math.min(3, Math.floor(k * 3.4 - .3) + 1);
      font(c, 12); c.fillStyle = 'rgba(' + INK + ',1)'; c.fillText('XX 26 AB 1234 · white hatchback', 14, H * .55 + 52);
      c.fillStyle = 'rgba(' + B + ',1)'; c.fillText(Math.max(0, m) + ' of 3 cameras · match 0.94 · sample', 14, H * .55 + 72);
    },
    // a camera over a gate: each person is boxed and tracked; their centre crossing the operator's line adds to IN
    // (walking in, down the frame) or OUT (walking up). The live tile shows "N in / N out"; the side panel is the
    // Detections dashboard: IN, OUT and NET (in − out, an estimate, so never called "inside") and the latest saved
    // events, each with its snapshot. No hourly chart: people counts can't yet be shown on their own. All values are dummies.
    people: function (c, W, H, t) {
      var fx = 12, fy = 12, fw = W * .62, fh = H - 40, lineY = fy + fh * .55, P = 7, inN = 0, outN = 0;
      c.save(); rr(c, fx, fy, fw, fh, 6); c.clip();
      c.fillStyle = 'rgba(' + D + ',.95)'; c.fillRect(fx, fy, fw, fh);
      // floor in perspective, gate posts at the far end
      var top = fy + fh * .14, nl = fx + fw * .32, nr = fx + fw * .68;
      c.fillStyle = 'rgba(255,255,255,.06)'; c.beginPath(); c.moveTo(nl, top); c.lineTo(nr, top); c.lineTo(fx + fw, fy + fh); c.lineTo(fx, fy + fh); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(nl - 6, fy, 6, top - fy + 4); c.fillRect(nr, fy, 6, top - fy + 4); c.fillRect(nl - 6, fy, nr - nl + 12, 5);
      function across(yy) { var u = (yy - top) / (fy + fh - top); return [nl + (fx - nl) * u, nr + (fx + fw - nr) * u]; }
      var Lx = across(lineY);
      c.setLineDash([7, 5]); c.strokeStyle = 'rgba(' + S + ',1)'; c.lineWidth = 2; c.beginPath(); c.moveTo(Lx[0], lineY); c.lineTo(Lx[1], lineY); c.stroke(); c.setLineDash([]);
      for (var i = 0; i < P; i++) {
        var into = i % 3 !== 2, per = 5 + (i % 4) * .9, ph = (t / per + i * .37), cyc = Math.floor(ph), q = ph - cyc;
        var yn = into ? q : 1 - q, py = top + 8 + yn * (fy + fh - top + 10), lane = ((i * 0.29) % 1) * .7 + .15;
        var ac = across(Math.min(py, fy + fh)), px = ac[0] + (ac[1] - ac[0]) * lane, sc = 9 + yn * 15;
        var crossed = cyc + (q >= .55 ? 1 : 0); if (into) inN += crossed; else outN += crossed;
        if (py < top || py > fy + fh + 12) continue;
        var just = Math.abs(py - lineY) < 14;
        c.beginPath(); c.arc(px, py - sc * 1.55, sc * .28, 0, 7); c.fillStyle = 'rgba(255,255,255,.9)'; c.fill();
        rr(c, px - sc * .32, py - sc * 1.25, sc * .64, sc * 1.25, sc * .2); c.fill();
        c.strokeStyle = just ? 'rgba(' + S + ',1)' : 'rgba(255,255,255,.35)'; c.lineWidth = just ? 2 : 1; c.strokeRect(px - sc * .55, py - sc * 1.95, sc * 1.1, sc * 2);
        c.font = '500 10px "Geist Mono",monospace'; c.fillStyle = 'rgba(255,255,255,.75)'; c.fillText('#' + (11 + i), px - sc * .55, py - sc * 1.95 - 3);
        if (just) { font(c, 11, 600); c.fillStyle = 'rgba(' + S + ',1)'; c.fillText(into ? '+1 IN' : '+1 OUT', px + sc * .7, py - sc); }
      }
      c.restore();
      var IN = 318 + inN, OUT = 277 + outN;
      // the count on the live video tile
      font(c, 11, 600); var tl = IN + ' in / ' + OUT + ' out', tw = c.measureText(tl).width + 12;
      c.fillStyle = 'rgba(10,26,43,.6)'; rr(c, fx + 6, fy + 6, tw, 19, 3); c.fill(); c.fillStyle = '#fff'; c.fillText(tl, fx + 12, fy + 20);
      font(c, 11, 600); c.fillStyle = 'rgba(255,255,255,.85)'; c.fillText('CAM-21', fx + 6, fy + fh - 8);
      font(c, 11); c.fillStyle = 'rgba(' + S + ',1)'; c.textAlign = 'right'; c.fillText('IN ↓', fx + fw - 6, lineY - 6, fw); c.fillText('OUT ↑', fx + fw - 6, lineY + 16, fw); c.textAlign = 'left';
      // the Detections dashboard: IN, OUT and NET side by side, then the latest saved events (newest first), each with its snapshot
      var rx = fx + fw + 16, cw = (W - rx - 8) / 3;
      [['IN', IN, D], ['OUT', OUT, D], ['NET', IN - OUT, B]].forEach(function (m, j) {
        font(c, 11); c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText(m[0], rx + j * cw, fy + 12, cw - 4);
        font(c, 18, 600); c.fillStyle = 'rgba(' + m[2] + ',1)'; c.fillText(m[1], rx + j * cw, fy + 33, cw - 4);
      });
      font(c, 11); c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText('EVENTS', rx, fy + 62);
      var ev = Math.floor(t / 2.2), rh = Math.min(26, (fh - 70) / 3);
      for (var e = 0; e < 3; e++) {
        var k = ev - e, ey = fy + 70 + e * rh, sn = rh - 6, dir = ((k % 3) + 3) % 3 === 2 ? 'OUT' : 'IN', s = 8 * 3600 + 42 * 60 + k * 7;
        rr(c, rx, ey, sn, sn, 3); c.fillStyle = 'rgba(' + D + ',.95)'; c.fill();
        c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.arc(rx + sn / 2, ey + sn * .32, sn * .14, 0, 7); c.fill(); c.fillRect(rx + sn * .38, ey + sn * .5, sn * .24, sn * .38);
        var hh = Math.floor(s / 3600) % 24, mm = Math.floor(s / 60) % 60, ss = s % 60;
        font(c, 11, e ? 500 : 600); c.fillStyle = e ? 'rgba(' + MUT + ',1)' : 'rgba(' + D + ',1)';
        var tm = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0') + (W - rx - sn - 12 < 100 ? '' : ':' + String(ss).padStart(2, '0')); // seconds only when they fit
        c.fillText((dir + '  ').slice(0, 4) + tm, rx + sn + 6, ey + sn / 2 + 4);
      }
      font(c, 12); c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText('Gate 2 entrance · counting line · sample', 14, H - 8);
    },
    zone: function (c, W, H, t) {
      var Z = [[.52, .22], [.9, .3], [.86, .78], [.5, .7]], inside = false;
      var k = (t % 5) / 5, px = W * (.2 + k * .55), py = H * (.55 + .1 * Math.sin(t * 2));
      inside = px > W * .52 && px < W * .86;
      c.beginPath(); Z.forEach(function (p, i) { i ? c.lineTo(p[0] * W, p[1] * H) : c.moveTo(p[0] * W, p[1] * H); }); c.closePath();
      c.fillStyle = inside ? 'rgba(' + A + ',.12)' : 'rgba(' + B + ',.08)'; c.fill();
      c.setLineDash([7, 5]); c.strokeStyle = inside ? 'rgba(' + A + ',.9)' : 'rgba(' + B + ',.8)'; c.lineWidth = 2; c.stroke(); c.setLineDash([]);
      vline(c, W * .3, H * .15, H * .9, 'rgba(' + D + ',.6)', 2);
      c.beginPath(); c.arc(px, py - 10, 5, 0, 7); c.fillStyle = inside ? 'rgba(' + A + ',1)' : 'rgba(' + D + ',1)'; c.fill();
      c.fillRect(px - 3, py - 4, 6, 14);
      if (inside) pill(c, Math.min(W - 140, W * .55), H * .2, 'ZONE INTRUSION', A);
      else if (px > W * .3) pill(c, W * .32, H * .2, 'LINE CROSSED', B);
      font(c, 12); c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText('excavation zone · sample', 14, H - 8);
    },
    // Plexus: the AI checks an overspeed case's photo against three rules, then passes or rejects it with the
    // reason. Every third case has a second vehicle in view and is rejected. Plate and speed are dummies.
    overspeedcheck: function (c, W, H, t) {
      var cyc = 7, k = (t % cyc) / cyc, rej = Math.floor(t / cyc) % 3 === 2, fx = 12, fy = 12, fw = W * .48, fh = H - 42;
      c.save(); rr(c, fx, fy, fw, fh, 6); c.clip();
      c.fillStyle = 'rgba(' + D + ',.95)'; c.fillRect(fx, fy, fw, fh);
      c.fillStyle = 'rgba(255,255,255,.06)'; c.beginPath(); c.moveTo(fx + fw * .38, fy); c.lineTo(fx + fw * .62, fy); c.lineTo(fx + fw, fy + fh); c.lineTo(fx, fy + fh); c.closePath(); c.fill();
      var cx = fx + fw * .3, cy = fy + fh * .46, cw = fw * .4, ch = fh * .3;
      car(c, cx, cy, cw, ch, 'rgba(255,255,255,.92)');
      var pw = cw * .62, px = cx + (cw - pw) / 2, py = cy + ch * .58;
      c.fillStyle = '#fff'; c.fillRect(px, py, pw, 12); c.strokeStyle = 'rgba(' + INK + ',.6)'; c.lineWidth = 1; c.strokeRect(px, py, pw, 12);
      c.font = '600 9px "Geist Mono",monospace'; c.fillStyle = '#111'; c.textAlign = 'center'; c.fillText('AB 1234', px + pw / 2, py + 9); c.textAlign = 'left';
      if (rej) { car(c, fx + fw * .72, fy + fh * .16, fw * .2, fh * .15, 'rgba(255,255,255,.6)'); if (k > .5) { c.strokeStyle = 'rgba(' + A + ',1)'; c.lineWidth = 2; c.strokeRect(fx + fw * .7, fy + fh * .13, fw * .24, fh * .21); } }
      if (k > .2) { c.strokeStyle = 'rgba(' + S + ',1)'; c.lineWidth = 2; c.strokeRect(px - 4, py - 4, pw + 8, 20); }
      c.restore();
      pill(c, fx + 6, fy + 24, '104 km/h', A);
      var x0 = fx + fw + 14, R = ['Plate readable', 'Speed matches record', 'No other vehicle'];
      font(c, 11); c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText('AI CHECK', x0, fy + 10);
      R.forEach(function (r, i) {
        if (k < .2 + i * .15) return; var y = fy + 32 + i * 26, ok = !(rej && i === 2);
        tick(c, x0 + 7, y - 4, ok, ok ? B : A); font(c, 12); c.fillStyle = 'rgba(' + INK + ',1)'; c.fillText(r, x0 + 20, y);
      });
      if (k > .68) pill(c, x0, fy + 32 + 3 * 26 + 10, rej ? 'REJECT · other vehicle' : 'PASS · for review', rej ? A : B);
      font(c, 12); c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText('Overspeed case · photo and clip · sample', 14, H - 8);
    },
    // AstraAlert: no operator picks up within the wait, so the AI answers in Hindi, asks what happened and sends the
    // control room a short briefing. The call, its words and the place are dummies.
    voice: function (c, W, H, t) {
      var cyc = 10, k = (t % cyc) / cyc, bx = 14, bw = Math.min(96, W * .26), by = 12, bh = H - 42, on = k >= .3;
      rr(c, bx, by, bw, bh, 8); c.fillStyle = 'rgba(' + D + ',.95)'; c.fill();
      font(c, 11, 600); c.fillStyle = 'rgba(255,255,255,.85)'; c.fillText('ECB-21', bx + 8, by + 18, bw - 12);
      var r = 9 + (on ? 0 : 3 * Math.abs(Math.sin(t * 6))); c.beginPath(); c.arc(bx + bw / 2, by + bh * .38, r, 0, 7); c.fillStyle = 'rgba(' + A + ',1)'; c.fill();
      if (on) for (var i = 0; i < 7; i++) { var h = 4 + 14 * Math.abs(Math.sin(t * 7 + i * 1.3)); c.fillStyle = 'rgba(' + S + ',1)'; c.fillRect(bx + 12 + i * ((bw - 24) / 7), by + bh * .68 - h / 2, (bw - 24) / 7 - 3, h); }
      font(c, 11); c.fillStyle = 'rgba(255,255,255,.75)';
      if (!on) c.fillText('00:' + String(Math.max(0, Math.ceil(20 * (1 - k / .3)))).padStart(2, '0'), bx + 8, by + bh - 10, bw - 12);
      else c.fillText('AI · Hindi', bx + 8, by + bh - 10, bw - 12);
      var x0 = bx + bw + 14, mw = W - x0 - 12;
      font(c, 11); c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText(on ? 'AI ANSWERED' : 'WAITING FOR AN OPERATOR', x0, by + 10, mw);
      if (k > .36) bubble(c, x0, by + 20, mw, 'Namaste. Kya hua hai?', false);
      if (k > .5) bubble(c, x0, by + 50, mw, 'Accident, km 41 ke paas', true, D);
      if (k > .66) {
        var y = by + 84, cardH = Math.min(52, by + bh - y); rr(c, x0, y, mw, cardH, 8); c.fillStyle = 'rgba(' + B + ',.08)'; c.fill(); c.strokeStyle = 'rgba(' + B + ',.5)'; c.lineWidth = 1; c.stroke();
        font(c, 11, 600); c.fillStyle = 'rgba(' + B + ',1)'; c.fillText('BRIEFING → CONTROL ROOM', x0 + 8, y + 17, mw - 16);
        font(c, 12); c.fillStyle = 'rgba(' + INK + ',1)'; c.fillText('Accident · km 41 · caller safe', x0 + 8, y + 37, mw - 16);
      }
      font(c, 12); c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText('No operator in 20 s · sample', 14, H - 8);
    },
    // AstraAlert: a question about the call boxes in plain words is typed, looked up and answered. Boxes and numbers are dummies.
    ask: function (c, W, H, t) {
      var cyc = 9, k = (t % cyc) / cyc, x0 = 14, mw = W - 28, q = 'Which call boxes need attention?';
      bubble(c, x0, 14, mw, q.slice(0, Math.max(1, Math.round(Math.min(1, k / .28) * q.length))), true);
      if (k > .3 && k < .45) { font(c, 12); c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText('Looking up call boxes' + '...'.slice(0, 1 + Math.floor(t * 3) % 3), x0, 62); }
      if (k > .45) {
        var y = 48, L = [['2 of 48 call boxes need attention', INK, 600], ['ECB-07 · battery 18%', A], ['ECB-22 · no network since 06:10', A], ['Last call: ECB-12 · 08:41 · accident', B]];
        rr(c, x0, y, Math.min(mw, 320), Math.min(H - y - 30, 22 + L.length * 22), 8); c.fillStyle = 'rgba(' + S + ',.14)'; c.fill();
        L.forEach(function (l, i) {
          if (k < .45 + i * .08) return; var ly = y + 22 + i * 22;
          if (i) { c.beginPath(); c.arc(x0 + 14, ly - 4, 3.5, 0, 7); c.fillStyle = 'rgba(' + l[1] + ',1)'; c.fill(); }
          font(c, 12, l[2] || 500); c.fillStyle = 'rgba(' + (i ? INK : l[1]) + ',1)'; c.fillText(l[0], x0 + (i ? 24 : 12), ly, Math.min(mw, 320) - 30);
        });
      }
      font(c, 12); c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText('Plain-word question · sample', 14, H - 8);
    },
    // Ulka: field check-ins arrive one by one; rule checks flag the odd ones for a manager. Names, times and places are dummies.
    attendance: function (c, W, H, t) {
      var ROWS = [['RK', '09:02 · Toll plaza 2', ''], ['SM', '09:03 · Toll plaza 2', 'Same GPS 3 times'], ['AP', '09:41 · km 112', 'Jumped 42 km in 6 min'], ['VD', '02:14 · Depot', 'Unusual hour'], ['NS', '10:12 · km 88', 'Late 4 days running']];
      var cyc = 8, k = (t % cyc) / cyc, rh = Math.min(30, (H - 42) / ROWS.length), fx = W * .5;
      ROWS.forEach(function (r, i) {
        if (k < i * .12) return; var y = 14 + i * rh, flag = !!r[2];
        c.beginPath(); c.arc(26, y + rh / 2 - 2, 10, 0, 7); c.fillStyle = 'rgba(' + (flag ? A : S) + ',' + (flag ? '.9' : '.35') + ')'; c.fill();
        c.font = '600 9px "Geist Mono",monospace'; c.fillStyle = flag ? '#fff' : 'rgba(' + D + ',1)'; c.textAlign = 'center'; c.fillText(r[0], 26, y + rh / 2 + 1); c.textAlign = 'left';
        font(c, 12); c.fillStyle = 'rgba(' + INK + ',1)'; c.fillText(r[1], 44, y + rh / 2 + 2, fx - 52);
        font(c, 12, flag ? 600 : 500); c.fillStyle = flag ? 'rgba(' + A + ',1)' : 'rgba(' + MUT + ',1)'; c.fillText(flag ? r[2] : 'ok', fx, y + rh / 2 + 2);
        c.fillStyle = 'rgba(' + D + ',.08)'; c.fillRect(14, y + rh - 2, W - 28, 1);
      });
      font(c, 12); c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText('Field check-ins · for a manager to review · sample', 14, H - 8);
    },
    // Ulka: equipment with repeated corrective work, an overdue work order and a stale handover roll up into
    // the daily digest. Equipment, orders and times are dummies.
    repeatfault: function (c, W, H, t) {
      var cyc = 8, k = (t % cyc) / cyc, EQ = [['CAM R-14', 4], ['ECB-07', 2], ['VMS-03', 1]], y = 14;
      font(c, 11); c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText('CORRECTIVE WORK · 30 DAYS', 14, y + 8);
      EQ.forEach(function (e, i) {
        var ey = y + 30 + i * 24, n = Math.min(e[1], Math.floor(k * 10) - i), hot = e[1] >= 3;
        font(c, 12, hot ? 600 : 500); c.fillStyle = 'rgba(' + INK + ',1)'; c.fillText(e[0], 14, ey, W * .3);
        for (var j = 0; j < e[1]; j++) { c.beginPath(); c.arc(W * .32 + j * 16, ey - 4, 5, 0, 7); c.fillStyle = j < n ? 'rgba(' + (hot ? A : S) + ',1)' : 'rgba(' + D + ',.1)'; c.fill(); }
        if (hot && n >= e[1]) { font(c, 12, 600); c.fillStyle = 'rgba(' + A + ',1)'; c.fillText('repeat fault', W * .32 + 4 * 16 + 6, ey); }
      });
      var oy = y + 30 + 3 * 24 + 8;
      if (k > .45) { tick(c, 21, oy - 4, false, A); font(c, 12); c.fillStyle = 'rgba(' + INK + ',1)'; c.fillText('WO-2219 · overdue 3 days', 34, oy); }
      if (k > .55) { tick(c, 21, oy + 20, false, A); font(c, 12); c.fillStyle = 'rgba(' + INK + ',1)'; c.fillText('Shift handover · not updated in 14 h', 34, oy + 24); }
      if (k > .7) pill(c, Math.max(14, W - 190), 30, 'DAILY DIGEST · 3 items', B);
      font(c, 12); c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText('Highway O&M · daily digest 07:00 · sample', 14, H - 8);
    },
    anpr: function (c, W, H, t) {
      var cyc = 3.2, k = (t % cyc) / cyc, p = PLATES[Math.floor(t / cyc) % PLATES.length];
      var pw = Math.min(W * .8, 280), ph = pw * .26, x = (W - pw) / 2, y = H * .3;
      rr(c, x, y, pw, ph, 6); c.fillStyle = '#fff'; c.fill(); c.strokeStyle = 'rgba(' + INK + ',.85)'; c.lineWidth = 2; c.stroke();
      c.fillStyle = 'rgba(' + B + ',1)'; c.fillRect(x + 4, y + 4, pw * .07, ph - 8);
      var chars = p.split(''), cw = (pw * .86) / chars.length;
      chars.forEach(function (ch, i) {
        var lock = ease((k * 1.8 - i / chars.length) * 4), cx = x + pw * .11 + i * cw;
        c.font = '700 ' + (ph * .5) + 'px "Geist Mono",monospace'; c.fillStyle = 'rgba(' + INK + ',' + (.25 + lock * .75) + ')';
        c.fillText(lock > .5 ? ch : '0123456789ABCDEFGHJKLMNPRSTUVWXYZ'.charAt(Math.floor(t * 20 + i * 7) % 33), cx, y + ph * .7);
        if (ch !== ' ' && lock > .1) { c.strokeStyle = 'rgba(' + B + ',' + lock + ')'; c.lineWidth = 1.2; c.strokeRect(cx - 2, y + ph * .18, cw - 2, ph * .66); }
      });
      vline(c, x + pw * Math.min(1, k * 1.6), y - 8, y + ph + 8, 'rgba(' + B + ',.85)', 2);
      font(c, 12); c.fillStyle = 'rgba(' + D + ',' + ease(k * 2 - .9) + ')';
      c.fillText('conf ' + (0.95 + (Math.floor(t / cyc) % 4) * .01).toFixed(2) + ' · CAM-041 · sample', x, y + ph + 28);
    },
    classify: function (c, W, H, t) {
      // far away a vehicle has a dashed "detecting" box; inside the detection zone its box turns solid with the class
      var R = fvRoad(c, 0, 0, W, H, t), z0 = .34, CF = { CAR: '97%', TRUCK: '95%', BUS: '96%', '2W': '93%', '3W': '94%' };
      c.fillStyle = 'rgba(' + B + ',.05)'; c.beginPath(); c.moveTo(R.X(-1.5, z0), R.Y(z0)); c.lineTo(R.X(1.5, z0), R.Y(z0)); c.lineTo(R.X(1.6, 1), R.by); c.lineTo(R.X(-1.6, 1), R.by); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(' + D + ',.35)'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(R.X(-1.5, z0), R.Y(z0)); c.lineTo(R.X(1.5, z0), R.Y(z0)); c.stroke(); c.setLineDash([]);
      font(c, 12); var zl = 'detection zone', zw = c.measureText(zl).width; c.fillStyle = 'rgba(' + D + ',.75)'; c.fillText(zl, Math.max(6, R.X(-1.5, z0) - zw - 8), R.Y(z0) + 4);
      fvTraffic(t, .085).forEach(function (v) {
        if (R.Y(v.s) - VC[v.cl][1] * R.Lb * v.s > H) return;
        var b = fvVeh(c, R, v.u, v.s, v.cl), heavy = v.cl === 'TRUCK' || v.cl === 'BUS';
        if (v.s < z0) { c.strokeStyle = 'rgba(' + MUT + ',.7)'; c.lineWidth = 1; c.setLineDash([3, 3]); c.strokeRect(b.x, b.y, b.w, b.h); c.setLineDash([]); return; }
        fvBox(c, b, heavy ? D : B, v.cl + ' ' + CF[v.cl], W);
      });
      fvHud(c, 0, 0, W, 'CAM-12 · front view', t);
    },
    count: function (c, W, H, t) {
      // front camera with a counting line across the lanes: every vehicle that crosses it is counted in its lane
      var R = fvRoad(c, 0, 0, W, H, t, { hz: .2 }), cs = .62, cy = R.Y(cs), rate = .085;
      var lane = [0, 0, 0], base = [412, 455, 384];
      FV_SEQ.forEach(function (q, i) { var p = t * rate + i / FV_SEQ.length, crossed = Math.floor(p) + (Math.sqrt(Math.max(0, (cs - .05) / 1.05)) <= p % 1 ? 1 : 0); lane[q[1] + 1] += crossed; });
      var hit = [false, false, false];
      fvTraffic(t, rate).forEach(function (v) {
        if (R.Y(v.s) - VC[v.cl][1] * R.Lb * v.s > H) return;
        var past = v.s >= cs, b = fvVeh(c, R, v.u, v.s, v.cl, past ? { fill: 'rgba(' + B + ',.55)' } : null);
        if (Math.abs(v.s - cs) < .06) { hit[Math.round(v.u) + 1] = true; fvBox(c, b, B, '+1'); }
      });
      // the counting line, lit in the lane where a vehicle is crossing
      for (var l = 0; l < 3; l++) { c.strokeStyle = hit[l] ? 'rgba(' + B + ',1)' : 'rgba(' + D + ',.55)'; c.lineWidth = hit[l] ? 3 : 2; c.beginPath(); c.moveTo(R.X(l - 1.5, cs), cy); c.lineTo(R.X(l - .5, cs), cy); c.stroke(); }
      var tot = base[0] + base[1] + base[2] + lane[0] + lane[1] + lane[2];
      c.fillStyle = 'rgba(255,255,255,.88)'; c.fillRect(0, 0, W, H * .17);
      c.font = '600 ' + Math.min(26, H * .12) + 'px "Geist Mono",monospace'; c.fillStyle = 'rgba(' + INK + ',1)'; c.fillText(String(tot), 12, H * .12);
      font(c, 12); c.fillStyle = 'rgba(' + MUT + ',1)'; var lx = 12 + c.measureText('00000').width * 1.9;
      c.fillText('this hour · L1 ' + (base[0] + lane[0]) + ' · L2 ' + (base[1] + lane[1]) + ' · L3 ' + (base[2] + lane[2]), lx, H * .11, W - lx - 8);
      font(c, 12); c.fillStyle = 'rgba(' + D + ',.75)'; c.fillText('count line', Math.max(6, R.X(-1.5, cs) - 80), cy + 4);
      c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText('CAM-09 · front view · sample', 12, H - 10);
    },
    journey: function (c, W, H, t) {
      // cross-camera tracking: one plate is searched, and the same vehicle is picked up by three cameras in turn; each
      // tile is that camera's front view with the tracked vehicle boxed, and the trail below joins the reads in time order
      var plate = 'XX 26 AB 1234', cyc = 9, k = (t % cyc) / cyc;
      rr(c, 10, 8, W - 20, 26, 13); c.fillStyle = '#fff'; c.fill(); c.strokeStyle = 'rgba(' + B + ',.5)'; c.lineWidth = 1; c.stroke();
      var typed = plate.slice(0, Math.max(0, Math.min(plate.length, Math.floor(k * 90))));
      font(c, 12, 600); c.fillStyle = 'rgba(' + INK + ',1)'; c.fillText('Track  ' + typed + (k < .15 && Math.floor(t * 3) % 2 ? '|' : ''), 22, 26);
      var CAMS = [['CAM-03', '07:42'], ['CAM-05', '07:51'], ['CAM-07', '08:03']], gap = 8, tw = (W - 20 - gap * 2) / 3, th = Math.min(H * .5, tw * .78), ty = 42;
      var ph = (k - .15) / .8 * 3; // which camera has the vehicle now (0..3)
      CAMS.forEach(function (cm, i) {
        var tx = 10 + i * (tw + gap), on = ph >= i && ph < i + 1, seen = ph >= i;
        c.save(); rr(c, tx, ty, tw, th, 6); c.fillStyle = '#fff'; c.fill(); c.clip();
        var R = fvRoad(c, tx, ty, tw, th, t + i * 1.3, { hz: .14 });
        fvTraffic(t + i * 2.1, .09, [['CAR', -1], ['TRUCK', 1], ['CAR', 1], ['2W', -1]]).forEach(function (v) { if (R.Y(v.s) - VC[v.cl][1] * R.Lb * v.s < ty + th) fvVeh(c, R, v.u, v.s, v.cl); });
        if (on) { var f = ph - i, s = .1 + f * f * .95, b = fvVeh(c, R, 0, s, 'CAR', { fill: 'rgba(' + B + ',.9)' }); fvBox(c, b, A); }
        c.restore();
        rr(c, tx, ty, tw, th, 6); c.strokeStyle = on ? 'rgba(' + A + ',1)' : 'rgba(' + B + ',.25)'; c.lineWidth = on ? 2 : 1; c.stroke();
        font(c, 12); c.fillStyle = 'rgba(' + INK + ',.78)'; rr(c, tx + 5, ty + 5, c.measureText(cm[0]).width + 10, 18, 3); c.fill(); c.fillStyle = '#fff'; c.fillText(cm[0], tx + 10, ty + 18);
        // the trail: a pin per camera, joined as each read lands
        var px = tx + tw / 2, py = ty + th + 26;
        if (i && seen) { c.strokeStyle = 'rgba(' + A + ',.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(px - tw - gap, py); c.lineTo(px - tw - gap + (tw + gap) * Math.min(1, ph - i + 1), py); c.stroke(); }
        c.beginPath(); c.arc(px, py, seen ? 6 : 4, 0, 7); c.fillStyle = seen ? 'rgba(' + A + ',1)' : 'rgba(' + MUT + ',.35)'; c.fill();
        if (seen) { font(c, 12); c.fillStyle = 'rgba(' + D + ',1)'; var lb = cm[0] + ' ' + cm[1]; c.fillText(lb, px - c.measureText(lb).width / 2, py + 20); }
      });
      font(c, 12); c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText(Math.max(0, Math.min(3, Math.floor(ph) + 1)) + ' of 3 cameras · clips ready · sample', 12, H - 8);
    },
    watch: function (c, W, H, t) {
      var rowH = 26, list = ['XX 14 CV 0021', 'XX 51 BQ 7740', 'XX 08 AF 3302', 'XX 32 MN 7781', 'XX 10 GH 1188', 'XX 26 AZ 0456', 'XX 01 BX 9921'];
      var off = (t * 16) % (rowH * list.length);
      c.save(); c.beginPath(); c.rect(0, 0, W, H - 30); c.clip();
      for (var i = 0; i < list.length + 6; i++) {
        var y = i * rowH - off + 18, p = list[i % list.length], hit = p === 'XX 32 MN 7781';
        font(c, 13, hit ? 600 : 500); c.fillStyle = hit ? 'rgba(' + A + ',1)' : 'rgba(' + INK + ',.55)';
        c.fillText(p, 16, y);
        if (hit) { var cy = y - 4, r = 6 + ((t * 30) % 22); c.beginPath(); c.arc(W - 30, cy, r, 0, 7); c.strokeStyle = 'rgba(' + A + ',' + (1 - r / 28) + ')'; c.lineWidth = 2; c.stroke(); c.beginPath(); c.arc(W - 30, cy, 4, 0, 7); c.fillStyle = 'rgba(' + A + ',1)'; c.fill(); font(c, 12); c.fillText('MATCH', W - 96, y); }
      }
      c.restore();
      font(c, 12); c.fillStyle = 'rgba(' + D + ',1)'; c.fillText('Watchlist · sample data', 14, H - 11);
    },
    health: function (c, W, H, t) {
      // six camera tiles, each its own front view; faults come and go on a cycle: no signal, fog, blur, moved, blinded
      var cols = 3, rows = 2, gw = (W - 20 - (cols - 1) * 6) / cols, gh = (H - 16 - (rows - 1) * 6) / rows;
      var F = [null, 'FOG', null, 'BLUR', 'NO SIGNAL', 'MOVED'], k = t % 8;
      for (var i = 0; i < 6; i++) {
        var x = 10 + (i % cols) * (gw + 6), y = 8 + Math.floor(i / cols) * (gh + 6), f = F[i];
        var st = i * .9 + (i % 2) * 1.3, fault = f && ((k - st + 8) % 8) < 3.6 ? f : (i === 2 && k > 5.5 ? 'BLINDED' : null);
        c.save(); rr(c, x, y, gw, gh, 6); c.fillStyle = '#fff'; c.fill(); c.clip();
        var draw = function (dx, dy, rot) {
          c.save(); if (rot) { c.translate(x + gw / 2, y + gh / 2); c.rotate(rot); c.translate(-(x + gw / 2), -(y + gh / 2)); }
          var R = fvRoad(c, x + dx, y + dy, gw, gh, t + i, { hz: .16 });
          fvTraffic(t + i * 1.7, .09, [['CAR', -1], ['TRUCK', 1], ['CAR', 1], ['BUS', 0]]).forEach(function (v) { if (R.Y(v.s) - VC[v.cl][1] * R.Lb * v.s < y + gh) fvVeh(c, R, v.u, v.s, v.cl); });
          c.restore();
        };
        if (fault === 'NO SIGNAL') {
          c.fillStyle = '#20262E'; c.fillRect(x, y, gw, gh);
          for (var n = 0; n < 220; n++) { var sx = x + ((n * 53 + Math.floor(t * 30) * 97) % 1000) / 1000 * gw, sy = y + ((n * 31 + Math.floor(t * 30) * 61) % 1000) / 1000 * gh, g = 90 + (n * 37 % 140); c.fillStyle = 'rgb(' + g + ',' + g + ',' + g + ')'; c.fillRect(sx, sy, 2, 2); }
          font(c, 12, 600); c.fillStyle = '#fff'; var ns = 'NO SIGNAL'; c.fillText(ns, x + gw / 2 - c.measureText(ns).width / 2, y + gh / 2 + 4);
        } else if (fault === 'BLUR') {
          c.globalAlpha = .28; for (var bq = 0; bq < 6; bq++) draw(Math.cos(bq) * 3.5, Math.sin(bq) * 3.5); c.globalAlpha = 1;
        } else if (fault === 'MOVED') { draw(0, 0, .32);
        } else if (fault === 'BLINDED') { draw(0, 0); c.fillStyle = 'rgba(10,26,43,.92)'; c.fillRect(x, y, gw, gh);
        } else {
          draw(0, 0);
          if (fault === 'FOG') { var fg = c.createLinearGradient(0, y, 0, y + gh); fg.addColorStop(0, 'rgba(238,242,246,.97)'); fg.addColorStop(1, 'rgba(238,242,246,.72)'); c.fillStyle = fg; c.fillRect(x, y, gw, gh); }
        }
        c.restore();
        rr(c, x, y, gw, gh, 6); c.strokeStyle = fault ? 'rgba(' + A + ',.9)' : 'rgba(' + B + ',.2)'; c.lineWidth = fault ? 1.6 : 1; c.stroke();
        var lbl = 'CAM-0' + (i + 1) + ' ' + (fault || 'OK');
        font(c, 12); var lw = c.measureText(lbl).width + 10; rr(c, x + 5, y + gh - 23, lw, 18, 3); c.fillStyle = fault ? 'rgba(' + A + ',1)' : 'rgba(' + INK + ',.72)'; c.fill();
        c.fillStyle = '#fff'; c.fillText(lbl, x + 10, y + gh - 10, gw - 20);
      }
    },
  };

  /* ---- canvases: size, visibility, one shared loop ---- */
  var items = cards.map(function (card) {
    var cv = card.querySelector('canvas');
    return { card: card, cv: cv, c: fitText(cv.getContext('2d')), fn: SIMS[card.dataset.sim], vis: false, t0: performance.now() - Math.random() * 3000 };
  });
  // a caption wider than the room left (to the canvas edge, or the given max width) shrinks to 10px, then ends in an ellipsis
  function fitText(c) {
    var f = c.fillText, re = /(\d+(?:\.\d+)?)px/;
    c.fillText = function (s, x, y, mw) {
      s = String(s); var lim = mw || (c.canvas.width / dpr - x - 6), f0 = c.font;
      if (lim > 0 && c.measureText(s).width > lim) {
        var m = re.exec(f0), px = m ? +m[1] : 12;
        while (px > 10 && c.measureText(s).width > lim) { px -= .5; c.font = f0.replace(re, px + 'px'); }
        if (c.measureText(s).width > lim) { while (s.length > 1 && c.measureText(s + '\u2026').width > lim) s = s.slice(0, -1); s += '\u2026'; }
      }
      f.call(c, s, x, y); c.font = f0;
    };
    return c;
  }
  // canvas buffers follow each canvas's CSS size; unchanged sizes are skipped (setting width clears and reallocates)
  function size(it) {
    var w = it.cv.clientWidth, h = it.cv.clientHeight; if (w === it.W && h === it.H) return;
    it.W = w; it.H = h; it.cv.width = Math.max(1, Math.round(w * dpr)); it.cv.height = Math.max(1, Math.round(h * dpr)); it.c.setTransform(dpr, 0, 0, dpr, 0, 0);
    it.drawn = false; wake();
  }
  var rzT = 0, pend = [];
  function later(list) { list.forEach(function (it) { if (pend.indexOf(it) < 0) pend.push(it); }); clearTimeout(rzT); rzT = setTimeout(function () { var p = pend; pend = []; p.forEach(size); }, 120); }
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function (es) { later(es.map(function (e) { return items.find(function (x) { return x.cv === e.target; }); }).filter(Boolean)); });
    items.forEach(function (it) { ro.observe(it.cv); });
  } else addEventListener('resize', onResize); // PORT: named so the cleanup can remove it
  function onResize() { later(items); }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { var it = items.find(function (x) { return x.cv === e.target; }); if (it) { it.vis = e.isIntersecting; if (it.vis) { if (!it.W) size(it); wake(); } } }); });
  items.forEach(function (it) { io.observe(it.cv); });
  // one shared loop; it sleeps when nothing is on screen, the tab is hidden or the demo modal covers the page.
  // reduced motion: each canvas is drawn once (again only after a resize), no loop
  var raf = 0;
  function covered() { return !!(window.INFRAX && INFRAX.covered); }
  var stopped = false; // PORT: set by the cleanup so a late observer/resize callback cannot restart the loop
  function wake() { if (!raf && !stopped) raf = requestAnimationFrame(loop); }
  function loop(now) {
    raf = 0; if (document.hidden || covered()) return;
    var any = false;
    items.forEach(function (it) {
      if (!it.vis || it.card.hidden || !it.fn || !it.W) return;
      any = true; if (reduce) { if (it.drawn) return; it.drawn = true; }
      it.c.clearRect(0, 0, it.W, it.H);
      it.fn(it.c, it.W, it.H, reduce ? 3.3 : (now - it.t0) / 1000);
    });
    if (any && !reduce) raf = requestAnimationFrame(loop);
  }
  document.addEventListener('visibilitychange', wake); document.addEventListener('infrax:cover', wake);
  items.forEach(size);

  /* ---- domain filter with a quick FLIP reflow ---- */
  var btns = [].slice.call(document.querySelectorAll('#anFilter button'));
  btns.forEach(function (b) { var f = b.dataset.f; b.querySelector('.count').textContent = cards.filter(function (c) { return f === 'all' || c.dataset.d.split(' ').indexOf(f) > -1; }).length; });
  function apply(f) {
    btns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.f === f); });
    var first = new Map(); cards.forEach(function (c) { if (!c.hidden) first.set(c, c.getBoundingClientRect()); });
    cards.forEach(function (c) { c.hidden = !(f === 'all' || c.dataset.d.split(' ').indexOf(f) > -1); });
    document.getElementById('anEmpty').hidden = !!document.querySelector('.an-card:not([hidden])');
    // a group's heading hides with its last card, so a filter never leaves a heading over nothing
    document.querySelectorAll('.an-grid').forEach(function (g) { var h = g.previousElementSibling; if (h && h.classList.contains('an-ghead')) h.hidden = !g.querySelector('.an-card:not([hidden])'); });
    items.forEach(function (it) { if (!it.card.hidden) size(it); });
    wake();
    if (reduce || !window.gsap) return;
    cards.forEach(function (c, i) {
      if (c.hidden) return;
      var last = c.getBoundingClientRect(), f0 = first.get(c);
      if (f0) gsap.fromTo(c, { x: f0.left - last.left, y: f0.top - last.top }, { x: 0, y: 0, opacity: 1, duration: .45, ease: 'expo.out', overwrite: 'auto' });
      else gsap.fromTo(c, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .45, ease: 'expo.out', delay: i * .03, overwrite: true });
    });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  var clicks = []; // PORT: handlers kept so the cleanup can remove them
  btns.forEach(function (b) { var h = function () { apply(b.dataset.f); }; clicks.push([b, h]); b.addEventListener('click', h); });

  /* ---- entrance: cards rise quickly ---- */
  if (!reduce && window.gsap && window.ScrollTrigger) {
    document.querySelectorAll('.an-grid').forEach(function (g) { gsap.from(g.children, { y: 20, opacity: 0, duration: .45, ease: 'expo.out', stagger: .04, scrollTrigger: { trigger: g, start: 'top 90%', once: true } }); });
  }

  // PORT: the static page ended with a loader for assets/icons.js; the shared runtime now renders the icons on every page.

  // PORT: cleanup for client-side navigation away from this page
  return function stop() {
    stopped = true;
    cancelAnimationFrame(raf); raf = 0;
    clearTimeout(rzT); pend = [];
    if (ro) ro.disconnect(); else removeEventListener('resize', onResize);
    io.disconnect();
    document.removeEventListener('visibilitychange', wake); document.removeEventListener('infrax:cover', wake);
    clicks.forEach(function (p) { p[0].removeEventListener('click', p[1]); });
    // the filter's FLIP tweens are created on click (after init), so the gsap.context does not own them
    if (window.gsap) gsap.killTweensOf(cards);
  };
}

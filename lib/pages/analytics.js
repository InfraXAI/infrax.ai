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

  var PLATES = ['XX 26 AB 1234', 'XX 03 CD 1290', 'XX 16 CT 4411', 'XX 04 KU 6620', '22 BH 0000 XX', 'XX 05 MN 7720'];
  var SIMS = {
    wrongway: function (c, W, H, t) {
      lanes(c, W, H, 3, H * .2, H * .9, t, true);
      for (var i = 0; i < 6; i++) {
        var ln = i % 2 ? 2 : 0, slot = Math.floor(i / 2), x = ((t * (ln ? .14 : .12) + slot / 3 * 1.25) % 1.25 - .1) * W, y = H * .2 + (ln + .5) * (H * .7 / 3);
        car(c, x, y - 7, W * .085, 14, 'rgba(' + S + ',.6)');
      }
      var k = (t % 4) / 4, wx = (1.05 - k * 1.2) * W, wy = H * .2 + 1.5 * (H * .7 / 3);
      car(c, wx, wy - 8, W * .09, 16, 'rgba(' + A + ',.95)');
      var r = 8 + ((t * 28) % 20); c.beginPath(); c.arc(wx + W * .045, wy, r, 0, 7); c.strokeStyle = 'rgba(' + A + ',' + (1 - r / 30) + ')'; c.lineWidth = 2; c.stroke();
      pill(c, Math.max(4, Math.min(W - 120, wx - 10)), wy - 14, 'WRONG WAY · lane 2', A);
      font(c, 12); c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText('clip + lane attached · sample', 14, H - 10);
    },
    stopped: function (c, W, H, t) {
      lanes(c, W, H, 2, H * .18, H * .7, t, true);
      for (var i = 0; i < 7; i++) {
        var ln = i % 2, slot = Math.floor(i / 2), x = ((t * (ln ? .15 : .13) + slot / 4 * 1.2) % 1.2 - .1) * W, y = H * .18 + (ln + .5) * (H * .52 / 2);
        car(c, x, y - 7, W * .08, 14, 'rgba(' + S + ',.6)');
      }
      c.fillStyle = 'rgba(' + B + ',.08)'; c.fillRect(0, H * .72, W, H * .14);
      var sx = W * .58, sy = H * .79, dwell = Math.floor(t * 8) % 90;
      car(c, sx, sy - 8, W * .1, 16, dwell > 30 ? 'rgba(' + A + ',.95)' : 'rgba(' + D + ',.85)');
      pill(c, Math.min(W - 150, sx - 20), sy - 14, (dwell > 30 ? 'STOPPED · ' : 'dwell · ') + '00:' + String(dwell % 60).padStart(2, '0'), dwell > 30 ? A : D);
      font(c, 12); c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText('shoulder · threshold 30 s · sample', 14, H - 6);
    },
    speed: function (c, W, H, t) {
      // radar on the gantry ahead of the traffic, aimed back down the lanes (a speed radar sits in front of or behind
      // the vehicles, never beside them); its waves run against the traffic and speeds show in the measuring zone
      var top = H * .12, bot = H * .86, rx = W - 14, ry = (top + bot) / 2;
      lanes(c, W, H, 3, top, bot, t, true);
      for (var a = 0; a < 3; a++) { var r = ((t * 90 + a * 55) % 165); c.beginPath(); c.arc(rx, ry, r, .87 * Math.PI, 1.13 * Math.PI); c.strokeStyle = 'rgba(' + B + ',' + Math.max(0, .6 - r / 280) + ')'; c.lineWidth = 2; c.stroke(); }
      c.fillStyle = 'rgba(' + D + ',1)'; c.fillRect(rx - 5, ry - 15, 10, 30);
      font(c, 11); c.fillStyle = 'rgba(' + D + ',1)'; c.fillText('radar', rx - 38, top - 4);
      var SP = [88, 112, 74, 96, 104];
      for (var i = 0; i < 5; i++) {
        var ln = i % 3, slot = Math.floor(i / 3), x = ((t * (.1 + ln * .03) + slot / 2 * 1.25) % 1.25 - .12) * W, y = top + (ln + .5) * ((bot - top) / 3), over = SP[i] > 100;
        car(c, x, y - 7, W * .085, 14, over ? 'rgba(' + A + ',.9)' : 'rgba(' + B + ',.8)');
        if (x > W * .38 && x < W * .78) pill(c, x, y - 10, SP[i] + ' km/h', over ? A : B);
      }
      font(c, 12); c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText('limit 100 · camera + radar · sample', 14, H - 6);
    },
    // one vehicle handed from camera to camera, each a different kind: an ANPR camera reads the plate, a PTZ camera
    // zooms in and follows it, a wide junction camera picks it out of traffic. Times and match score are dummies.
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
    // Central Plexus: the AI checks an overspeed case's photo against three rules, then passes or rejects it with the
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
    // InfraX AI Ops: field check-ins arrive one by one; rule checks flag the odd ones for a manager. Names, times and places are dummies.
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
    // InfraX AI Ops: equipment with repeated corrective work, an overdue work order and a stale handover roll up into
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
      lanes(c, W, H, 3, H * .22, H * .9, t, true);
      var cls = [['CAR', .1, .13], ['TRUCK', .2, .17], ['2W', .06, .1], ['BUS', .24, .17], ['3W', .08, .12]];
      var scan = W * .55;
      for (var i = 0; i < 6; i++) {
        var cl = cls[i % cls.length], ln = i % 3, sp = .1 + ln * .025, slot = Math.floor(i / 3);
        var x = ((t * sp + slot / 2 * 1.3) % 1.3 - .15) * W, y = H * .22 + (ln + .5) * (H * .68 / 3);
        var w = cl[1] * W, h = cl[2] * H, known = x + w > scan;
        car(c, x, y - h / 2, w, h, known ? 'rgba(' + B + ',.85)' : 'rgba(' + MUT + ',.35)');
        if (known) pill(c, x, y - h / 2 - 3, cl[0], B);
      }
      vline(c, scan, 0, H, 'rgba(' + D + ',.7)', 1.5);
    },
    count: function (c, W, H, t) {
      lanes(c, W, H, 2, H * .44, H * .92, t, true);
      var line = W * .5;
      for (var i = 0; i < 10; i++) {
        var ln = i % 2, sp = ln ? .135 : .12, slot = Math.floor(i / 2), pos = (t * sp + slot / 5 * 1.2), x = (pos % 1.2 - .1) * W, y = H * .44 + (ln + .5) * (H * .48 / 2);
        car(c, x, y - 7, W * .08, 14, x > line ? 'rgba(' + B + ',.9)' : 'rgba(' + S + ',.55)');
      }
      vline(c, line, H * .4, H * .96, 'rgba(' + D + ',.8)', 2);
      c.font = '600 ' + Math.min(34, H * .2) + 'px "Geist Mono",monospace'; c.fillStyle = 'rgba(' + INK + ',1)'; c.fillText(String(1200 + Math.floor(t * 1.9)), 14, H * .27);
      font(c, 12); c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText('vehicles this hour · lanes 1 + 2 · sample', 14, H * .27 + 18);
    },
    journey: function (c, W, H, t) {
      // a plate is typed into search; the cameras that READ it light up in time order (past reads only, no path lines)
      var plate = 'XX 26 AB 1234', cyc = 5.5, k = (t % cyc) / cyc;
      rr(c, 12, 12, W - 24, 28, 14); c.fillStyle = '#fff'; c.fill(); c.strokeStyle = 'rgba(' + B + ',.5)'; c.lineWidth = 1; c.stroke();
      var typed = plate.slice(0, Math.max(0, Math.min(plate.length, Math.floor(k * 60))));
      font(c, 12, 600); c.fillStyle = 'rgba(' + INK + ',1)'; c.fillText('Search  ' + typed + (k < .23 && Math.floor(t * 3) % 2 ? '|' : ''), 24, 31);
      var P = [[.12, .62], [.36, .8], [.6, .56], [.86, .74]], TM = ['07:42', '07:51', '08:03', '08:16'];
      var reach = Math.max(0, (k - .25) / .45);
      P.forEach(function (p, i) {
        var on = reach * 3 >= i - .02, x = p[0] * W, y = p[1] * H;
        c.beginPath(); c.arc(x, y, on ? 6 : 4, 0, 7); c.fillStyle = on ? 'rgba(' + B + ',1)' : 'rgba(' + MUT + ',.35)'; c.fill();
        if (on) pill(c, Math.min(W - 108, Math.max(4, x - 30)), y - 12, 'CAM-0' + (3 + i * 2) + ' ' + TM[i], D);
      });
      font(c, 12); c.fillStyle = 'rgba(' + MUT + ',1)'; c.fillText(Math.min(4, Math.max(0, Math.floor(reach * 3 + 1.01))) + ' reads · clips ready · sample', 12, H - 10);
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
      // six cameras with a bitrate bar sparkline; one goes dark (blinded), then recovers
      var cols = 3, rows = 2, gw = (W - 24 - (cols - 1) * 8) / cols, gh = (H - 24 - (rows - 1) * 8) / rows;
      for (var i = 0; i < 6; i++) {
        var x = 12 + (i % cols) * (gw + 8), y = 12 + Math.floor(i / cols) * (gh + 8);
        var k = t % 6, down = i === 4 && k > 2 && k < 4.2;
        rr(c, x, y, gw, gh, 6); c.fillStyle = '#fff'; c.fill(); c.strokeStyle = down ? 'rgba(' + A + ',.8)' : 'rgba(' + B + ',.18)'; c.lineWidth = 1; c.stroke();
        var bars = 10, bw = (gw - 16) / bars;
        for (var j = 0; j < bars; j++) {
          var v = down ? .05 : .45 + .35 * Math.abs(Math.sin(j * 1.7 + Math.floor(t * 4) * .9 + i));
          c.fillStyle = 'rgba(' + (down ? A : B) + ',' + (down ? .6 : .75) + ')';
          c.fillRect(x + 8 + j * bw, y + gh * .62 - v * gh * .38, bw - 2, v * gh * .38);
        }
        font(c, 12); c.fillStyle = 'rgba(' + (down ? A : MUT) + ',1)'; c.fillText(down ? 'CAM-0' + (i + 1) + ' BLINDED' : 'CAM-0' + (i + 1) + ' OK', x + 8, y + gh - 8, gw - 14);
      }
    }
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

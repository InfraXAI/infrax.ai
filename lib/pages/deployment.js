// Deployment page script: the inline <script> of site/src/deployment.html, unchanged inside init() except where marked
// "PORT:". usePage('deployment', init) runs it once the page markup is mounted (after the shared per-page runtime);
// the returned function stops it when the visitor navigates away.
export function init() {
  var X = window.INFRAX || {}, reduce = !!X.reduce, hasG = !!window.gsap;
  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.getElementById('dpSvg'), stage = document.getElementById('dpStage');
  var gZ = document.getElementById('dpZones'), gL = document.getElementById('dpLinks'), gP = document.getElementById('dpPackets'), gN = document.getElementById('dpNodes');
  var gA = document.createElementNS('http://www.w3.org/2000/svg', 'g'); svg.appendChild(gA);
  // PORT: handles kept so stop() can tear everything down on client-side navigation away
  var stopped = false, observers = [], timers = [], later = [];

  /* ---------- data ---------- */
  var NODES = {
    cam1: ['ic-bullet', 'Bullet', 'ONVIF'], cam2: ['ic-dome', 'Dome', 'RTSP'], cam3: ['ic-anpr', 'ANPR camera', 'IR · plates'],
    radar: ['ic-radar', 'Gantry radar', 'speed'], aibox: ['ic-edge', 'Box on the gantry', 'Dhrishya · offline-ready'],
    ecb: ['ic-callbox', 'Call box', 'AstraAlert'], vms: ['ic-vms', 'LED message sign', 'from the control room'],
    fw: ['ic-fw', 'Your network', 'fibre · site LAN'], srv: ['ic-rack', 'Your servers', 'Cygnus · AstraAlert'],
    srv2: ['ic-rack', 'Site node', 'Site A · Cygnus'], srv3: ['ic-rack', 'Site node', 'Site B · its own VMS'], console1: ['ic-console', 'Control room', 'operators act here'],
    console2: ['ic-console', 'Site desk', 'local security'], aibox2: ['ic-edge', 'Edge box', 'beside site cameras']
  };
  var MODES = {
    centralised: {
      pos: { cam1: [100, 130], cam2: [100, 280], cam3: [100, 430], fw: [360, 280], srv: [660, 280], console1: [980, 280] },
      vpos: { cam1: [90, 110], cam2: [270, 110], cam3: [450, 110] },
      labels: { cam3: ['ANPR camera', 'plates'], srv: ['Analytics servers', 'in the control room · CPU, GPU to scale'], console1: ['Control room', 'video wall · map · incidents'] },
      zones: [[40, 46, 220, 468, 'Cameras'], [540, 70, 250, 420, 'Control-room servers'], [850, 70, 260, 420, 'Control room'], [16, 18, 1168, 524, 'Your network · on your servers', 'dash', 'end']],
      links: [['cam1', 'fw', 'v'], ['cam2', 'fw', 'v'], ['cam3', 'fw', 'v'], ['fw', 'srv', 'v'], ['srv', 'console1', 'e']],
      ai: ['srv'],
      title: 'Centralised: analytics on control-room servers.',
      best: [['Campuses', '/products#d-campuses'], ['Industrial sites', '/products#d-warehouses'], ['City control rooms', '/products#d-cities']],
      where: [['Video', 'Streams to your control-room servers and is recorded there'], ['AI', 'Analytics servers in the control room'], ['Results', 'Events, clips and plate reads in Cygnus'], ['Console', 'One console in the browser, on your network']],
      needs: ['Standard CPU servers sized to your cameras', 'The ONVIF or RTSP cameras you already have', 'A network from the cameras to the control room']
    },
    edge: {
      pos: { cam3: [95, 80], cam1: [95, 205], aibox: [290, 142], cam2: [95, 345], ecb: [95, 470], aibox2: [290, 345], fw: [520, 300], srv: [790, 300], console1: [1060, 300] },
      vpos: { cam3: [90, 110], cam1: [270, 110], cam2: [450, 110], aibox: [130, 270], aibox2: [310, 270], ecb: [480, 270] },
      labels: { aibox: ['Edge box', 'beside the cameras'], aibox2: ['Edge box', 'beside site cameras'], ecb: ['Call box', 'AstraAlert'], srv: ['Cygnus core', 'events · clips · incidents'] },
      zones: [[40, 30, 360, 500, 'Beside the cameras'], [700, 110, 190, 380, 'Your servers'], [960, 110, 210, 380, 'Control room'], [16, 8, 1168, 544, 'Your network · results travel, video stays', 'dash', 'end']],
      links: [['cam3', 'aibox', 'v'], ['cam1', 'aibox', 'v'], ['cam2', 'aibox2', 'v'], ['aibox', 'fw', 'e'], ['aibox2', 'fw', 'e'], ['ecb', 'aibox2', 'e'], ['fw', 'srv', 'e'], ['srv', 'console1', 'e']],
      ai: ['aibox', 'aibox2'],
      title: 'Edge: analytics on boxes beside the cameras.',
      best: [['Highway corridors', '/products#d-highways'], ['Ports, transport & utilities', '/products#d-ports'], ['Remote sites on thin links', '/products#d-ports']],
      where: [['Video', 'Stays beside the cameras, on the edge box'], ['AI', 'Edge boxes run the detections on CPU'], ['Results', 'Plates, events and clips travel up, not video'], ['Console', 'One control room for every edge box']],
      needs: ['An edge box for each group of cameras', 'A link from each box for results and clips', 'Your servers for the Cygnus core and the console']
    },
    hybrid: {
      pos: { cam3: [95, 80], radar: [95, 205], aibox: [270, 142], ecb: [95, 330], cam1: [95, 455], fw: [470, 300], srv: [745, 300], console1: [1045, 300] },
      vpos: { cam3: [90, 110], radar: [270, 110], ecb: [450, 110], aibox: [180, 270], cam1: [450, 270] },
      labels: { aibox: ['Edge box', 'on the gantry · Dhrishya'], radar: ['Gantry radar', 'beside the cameras'], srv: ['Analytics servers', 'control room · one console'] },
      zones: [[40, 20, 360, 520, 'On the road and at the site', '', 'end'], [640, 110, 240, 380, 'Control-room servers'], [940, 110, 230, 380, 'Control room'], [16, 8, 1168, 544, 'Your network · on your servers', 'dash', 'end']],
      links: [['cam3', 'aibox', 'v'], ['radar', 'aibox', 'v'], ['aibox', 'fw', 'e'], ['ecb', 'fw', 'e'], ['cam1', 'fw', 'v'], ['fw', 'srv', 'm'], ['srv', 'console1', 'e']],
      ai: ['aibox', 'srv'],
      title: 'Hybrid: edge and centre together, one console.',
      best: [['Highway concessionaires', '/products#d-highways'], ['EPC & O&M contractors', '/products#d-highways'], ['Authorities running control rooms', '/products#d-highways']],
      where: [['Video', 'Gantry video stays on the edge box; site cameras record centrally'], ['AI', 'Edge boxes on the gantries and analytics servers in the control room'], ['Calls', 'AstraAlert puts each call box through to the control room'], ['Console', 'One console for edge and centre']],
      needs: ['Edge boxes where links are thin or reads must survive a dropped link', 'Analytics servers in the control room for the other cameras', 'Your servers for Cygnus and AstraAlert']
    },
    federated: {
      pos: { cam3: [95, 95], cam1: [95, 205], srv2: [290, 150], cam2: [95, 410], srv3: [290, 410], srv: [700, 300], console1: [1040, 190], console2: [1040, 420] },
      vpos: { cam3: [90, 110], cam1: [270, 110], cam2: [450, 110], srv2: [180, 270], srv3: [450, 270] },
      labels: { srv: ['One view on top', 'multi-site view'], console1: ['Head office', 'every site in one tree'], console2: ['Site desk', 'keeps its own control'] },
      zones: [[40, 40, 360, 240, 'Site A · its own node', '', '', 'Site A'], [40, 310, 360, 240, 'Site B · its own VMS', '', '', 'Site B'], [570, 110, 260, 380, 'One view'], [930, 40, 240, 480, 'Where people act']],
      links: [['cam3', 'srv2', 'v'], ['cam1', 'srv2', 'v'], ['cam2', 'srv3', 'v'], ['srv2', 'srv', 'e'], ['srv3', 'srv', 'e'], ['srv', 'console1', 'e'], ['srv', 'console2', 'e']],
      ai: ['srv2', 'srv3'],
      title: 'Federated: many sites and VMSs, one view.',
      best: [['Multi-stretch highway operators', '/products#d-highways'], ['City-wide security', '/products#d-cities'], ['Campus & industrial groups', '/products#d-campuses']],
      where: [['Video', 'Kept at each site, on its own node'], ['AI', 'Runs at each site'], ['Results', 'Alerts and evidence roll up to one view'], ['Console', 'Head office sees every site; each site keeps its own desk']],
      needs: ['A Cygnus node at each site', 'A link from each site for alerts and clips', 'Ask us about connecting other VMSs']
    }
  };
  // PORT: 'products.html#x' links above -> '/products#x'
  var ORDER = ['centralised', 'edge', 'hybrid', 'federated'];
  var ALIAS = { one: 'centralised', corridor: 'hybrid', many: 'federated', onprem: 'centralised', cloud: 'centralised' };

  /* ---------- orientation ---------- */
  var vert = false;
  function O(p) { return vert ? [p[1], p[0] + 30] : [p[0], p[1]]; } // vertical: nodes sit below zone titles
  function OR(z) { return vert ? [z[1], z[0], z[3], z[2]] : [z[0], z[1], z[2], z[3]]; }
  function setOrient() {
    vert = stage.getBoundingClientRect().width < 900;
    svg.setAttribute('viewBox', vert ? '0 0 560 1200' : '0 0 1200 560');
    svg.classList.toggle('dp-vert', vert);
  }

  /* ---------- build nodes ---------- */
  var live = {};
  Object.keys(NODES).forEach(function (id, i) {
    var n = NODES[id], g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'dp-node');
    g.innerHTML = '<use href="#' + n[0] + '" x="-48" y="-36" width="96" height="72"/><text class="dp-l1" y="56">' + n[1] + '</text><text class="dp-l2" y="73">' + n[2] + '</text>';
    gN.appendChild(g);
    live[id] = { g: g, x: 600, y: 280, o: 0, s: .6, i: i, t1: g.querySelector('.dp-l1'), t2: g.querySelector('.dp-l2') };
  });
  var moved = 3; // frames left in which link paths must follow moving nodes
  function paintNode(n) { n.g.setAttribute('transform', 'translate(' + n.x.toFixed(1) + ',' + n.y.toFixed(1) + ') scale(' + n.s.toFixed(3) + ')'); n.g.style.opacity = n.o; moved = 3; }

  /* ---------- zones ---------- */
  var zones = [0, 1, 2, 3, 4].map(function () {
    var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'dp-zone');
    g.innerHTML = '<rect rx="18"/><text></text>'; gZ.appendChild(g);
    return { g: g, r: g.firstChild, t: g.lastChild, v: { x: 600, y: 280, w: 0, h: 0, o: 0 } };
  });
  function paintZone(z, anchorEnd) {
    var v = z.v; z.r.setAttribute('x', v.x); z.r.setAttribute('y', v.y); z.r.setAttribute('width', Math.max(0, v.w)); z.r.setAttribute('height', Math.max(0, v.h));
    z.g.style.opacity = v.o;
    if (anchorEnd) { z.t.setAttribute('x', v.x + v.w - 18); z.t.setAttribute('y', v.y + v.h - 16); z.t.setAttribute('text-anchor', 'end'); }
    else { z.t.setAttribute('x', v.x + 18); z.t.setAttribute('y', v.y + (vert ? 34 : 28)); z.t.setAttribute('text-anchor', 'start'); }
  }

  /* ---------- links + packets ---------- */
  var links = [];
  function anchor(n, out) {
    var d = 44 * n.s;
    return vert ? [n.x, n.y + (out ? d : -d)] : [n.x + (out ? d : -d), n.y];
  }
  function bez(a, b) {
    var k = vert ? (b[1] - a[1]) * .5 : (b[0] - a[0]) * .5;
    return vert ? [a, [a[0], a[1] + k], [b[0], b[1] - k], b] : [a, [a[0] + k, a[1]], [b[0] - k, b[1]], b];
  }
  function pt(c, t) {
    var u = 1 - t;
    return [u * u * u * c[0][0] + 3 * u * u * t * c[1][0] + 3 * u * t * t * c[2][0] + t * t * t * c[3][0],
            u * u * u * c[0][1] + 3 * u * u * t * c[1][1] + 3 * u * t * t * c[2][1] + t * t * t * c[3][1]];
  }
  function makeLink(def, rank) {
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('class', 'dp-link' + (def[2] === 'v' ? '' : ' ev'));
    p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1'; p.style.strokeDashoffset = '1';
    gL.appendChild(p);
    var dots = [], k = def[2] === 'v' ? 5 : 3;
    for (var i = 0; i < k; i++) {
      var c = document.createElementNS(NS, 'circle');
      var isEv = def[2] === 'e' || (def[2] === 'm' && i % 2);
      c.setAttribute('r', isEv ? 4.2 : 3.2); c.setAttribute('fill', isEv ? '#2673B5' : '#5A9FD4');
      gP.appendChild(c); dots.push({ c: c, ph: i / k });
    }
    var L = { a: def[0], b: def[1], kind: def[2], rev: def[3] === 'rev', p: p, dots: dots, draw: 0, o: 1, rank: rank };
    links.push(L);
    return L;
  }
  function removeLink(L) {
    if (L.gone) return; L.gone = L.dead = true;
    L.p.remove(); L.dots.forEach(function (d) { d.c.remove(); });
    var i = links.indexOf(L); if (i > -1) links.splice(i, 1);
  }
  function killLink(L) {
    if (L.dead) return; L.dead = true;
    if (hasG && !reduce) gsap.to(L, { o: 0, duration: .35, ease: 'sine.in', onComplete: function () { removeLink(L); } }); else removeLink(L);
  }
  // drop every link at once (orientation flip, first-view reset); kills pending fades so none splice later
  function dropLinks() { links.slice().forEach(function (L) { if (hasG) gsap.killTweensOf(L); removeLink(L); }); }

  /* ---------- mode switching ---------- */
  var mode = null;
  function labelFor(id, m) { var l = MODES[m].labels[id]; return l || [NODES[id][1], NODES[id][2]]; }
  function setMode(m, instant) {
    if (m === mode) return;
    mode = m;
    var M = MODES[m], anim = hasG && !reduce && !instant;
    // tabs
    document.querySelectorAll('.dp-tab').forEach(function (b) { var on = b.dataset.mode === m; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; });
    movePill();
    document.getElementById('dpPanel').setAttribute('aria-labelledby', 'tab-' + m);
    // nodes travel on sine paths, in a wave ordered by their target position along the flow
    var ids = Object.keys(live), ranked = ids.slice().sort(function (a, b) { var pa = M.pos[a] || [600, 0], pb = M.pos[b] || [600, 0]; return pa[0] - pb[0] || pa[1] - pb[1]; });
    ranked.forEach(function (id, r) {
      var n = live[id], target = M.pos[id], lab = labelFor(id, m);
      n.t1.textContent = lab[0]; n.t2.textContent = lab[1];
      if (hasG) { gsap.killTweensOf(n); if (n._tw) n._tw.kill(); }
      if (!target) { // leave
        if (anim) gsap.to(n, { o: 0, s: .6, duration: .45, ease: 'sine.in', onUpdate: paintNode, onUpdateParams: [n] });
        else { n.o = 0; n.s = .6; paintNode(n); }
        return;
      }
      var to = (vert && M.vpos && M.vpos[id]) ? M.vpos[id] : O(target);
      if (!anim) { n.x = to[0]; n.y = to[1]; n.o = 1; n.s = 1; paintNode(n); return; }
      var from = n.o > .05 ? [n.x, n.y] : [to[0] - (vert ? 0 : 120), to[1] - (vert ? 120 : 0)];
      var dx = to[0] - from[0], dy = to[1] - from[1], len = Math.hypot(dx, dy) || 1;
      var nx = -dy / len, ny = dx / len, amp = (28 + 26 * Math.abs(Math.sin(r * 1.7))) * (r % 2 ? 1 : -1);
      var prox = { k: 0 }, o0 = n.o, s0 = n.s;
      n._tw = gsap.to(prox, {
        k: 1, duration: .55, delay: .03 * r, ease: 'power2.inOut',
        onUpdate: function () {
          var k = prox.k, bump = Math.sin(Math.PI * k) * amp;
          n.x = from[0] + dx * k + nx * bump; n.y = from[1] + dy * k + ny * bump;
          n.o = o0 + (1 - o0) * Math.min(1, k * 2); n.s = s0 + (1 - s0) * k; paintNode(n);
        }
      });
    });
    // zones
    zones.forEach(function (z, i) {
      var d = M.zones[i];
      if (hasG) gsap.killTweensOf(z.v);
      z.g.setAttribute('class', 'dp-zone' + (d && d[5] === 'dash' ? ' dash' : ''));
      var end = d && d[6] === 'end';
      if (!d) { if (anim) gsap.to(z.v, { o: 0, duration: .4, onUpdate: function () { paintZone(z, end); } }); else { z.v.o = 0; paintZone(z, end); } return; }
      z.t.textContent = (vert && d[7]) ? d[7] : d[4];
      var r = OR(d), tgt = { x: r[0], y: r[1], w: r[2], h: r[3], o: 1 };
      if (anim) gsap.to(z.v, Object.assign(tgt, { duration: .5, delay: .03 * i, ease: 'power2.inOut', onUpdate: function () { paintZone(z, end); } }));
      else { Object.assign(z.v, tgt); paintZone(z, end); }
    });
    // links: old ones ebb away, new ones draw in after their source node lands
    links.slice().forEach(killLink);
    M.links.forEach(function (def) {
      var L = makeLink(def, ranked.indexOf(def[0]));
      if (anim) gsap.to(L, { draw: 1, duration: .45, delay: .3 + .04 * L.rank, ease: 'sine.out' }); else L.draw = 1;
    });
    // "AI here" markers ride on the nodes where analytics run
    aiTags.slice().forEach(function (A) { if (hasG && !reduce) gsap.to(A, { o: 0, duration: .3, onComplete: function () { A.g.remove(); } }); else A.g.remove(); });
    aiTags = (M.ai || []).map(function (id, k) {
      var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'dp-ai');
      g.innerHTML = vert ? '<circle class="ring" r="58"/><rect x="-22" y="-15" width="44" height="30" rx="15"/><text y="6">AI</text>'
                         : '<circle class="ring" r="58"/><rect x="-36" y="-13" width="72" height="26" rx="13"/><text y="4.5">AI HERE</text>';
      gA.appendChild(g);
      var A = { g: g, id: id, o: 0, ring: g.firstChild };
      if (anim) gsap.to(A, { o: 1, duration: .4, delay: .6 + .08 * k, ease: 'sine.out' }); else A.o = 1;
      return A;
    });
    renderPanel(M, anim);
    wake();
  }
  var aiTags = [];

  /* ---------- per-frame: links follow nodes, packets travel in waves ---------- */
  var vis = true, t0 = performance.now(), raf = 0;
  function covered() { return !!(window.INFRAX && INFRAX.covered); }
  // the loop sleeps while offscreen, hidden or covered (and after each change under reduced motion)
  function wake() { if (!raf && !stopped) raf = requestAnimationFrame(frame); } // PORT: no wake after stop()
  var ioStage = new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) wake(); }); ioStage.observe(stage); observers.push(ioStage); // PORT: kept
  document.addEventListener('visibilitychange', wake); document.addEventListener('infrax:cover', wake);
  function frame(now) {
    raf = 0;
    if (!vis || document.hidden || covered()) return;
    if (!reduce && !stopped) raf = requestAnimationFrame(frame); // PORT: stopped guard
    var t = reduce ? 0 : (now - t0) / 1000, rebuild = moved > 0;
    if (rebuild) moved--;
    aiTags.forEach(function (A, k) {
      var n = live[A.id]; if (!n) return;
      // desktop: the tag sits above the node; phone: beside it, so it never covers the labels under the nodes
      var ox = vert ? 50 * n.s : 0, oy = vert ? -34 * n.s : -78 * n.s, pulse = reduce ? 0 : (t * .8 + k * .5) % 1;
      A.g.setAttribute('transform', 'translate(' + (n.x + ox).toFixed(1) + ',' + (n.y + oy).toFixed(1) + ')');
      A.g.style.opacity = A.o * n.o;
      A.ring.setAttribute('transform', 'translate(' + (-ox).toFixed(1) + ',' + (-oy).toFixed(1) + ') scale(' + (.6 + pulse * .7).toFixed(3) + ')');
      A.ring.style.opacity = ((1 - pulse) * .6).toFixed(2);
    });
    links.forEach(function (L) {
      var c = L.c;
      if (rebuild || !c) {
        c = L.c = bez(anchor(live[L.a], true), anchor(live[L.b], false));
        L.p.setAttribute('d', 'M' + c[0] + 'C' + c[1] + ' ' + c[2] + ' ' + c[3]);
      }
      if (L._d !== L.draw) { L._d = L.draw; L.p.style.strokeDashoffset = 1 - L.draw; }
      if (L._o !== L.o) { L._o = L.o; L.p.style.opacity = L.o; }
      var speed = L.kind === 'v' ? .42 : .3;
      L.dots.forEach(function (d) {
        var u = reduce ? d.ph : ((t * speed + d.ph) % 1); if (L.rev) u = 1 - u;
        var q = pt(c, u), env = Math.sin(Math.PI * u);
        var wob = 0; // packets travel straight along the link
        d.c.setAttribute('cx', (q[0] + (vert ? wob : 0)).toFixed(1)); d.c.setAttribute('cy', (q[1] + (vert ? 0 : wob)).toFixed(1));
        d.c.style.opacity = L.draw < .98 || L.dead ? 0 : (.25 + .75 * env) * L.o;
      });
    });
  }

  /* ---------- panel ---------- */
  var niT = 0; // PORT: hoisted out of the edge-notes block so stop() can clear it
  var tick = '<svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9.5l4 4 8-9"/></svg>';
  function esc(s) { return s.replace(/&/g, '&amp;'); }
  function renderPanel(M, anim) {
    var el = document.getElementById('dpPanel');
    el.innerHTML =
      '<div><h2>' + M.title + '</h2><h4 role="none" style="margin-top:calc(22*var(--s))">Best for</h4><div class="dp-chips" style="margin-top:0">' +
      M.best.map(function (b) { return '<a class="dp-chip" href="' + b[1] + '">' + esc(b[0]) + '</a>'; }).join('') + '</div></div>' +
      '<div><h4 role="none">Where your data lives</h4><dl class="dp-where">' +
      M.where.map(function (w) { return '<div><dt>' + esc(w[0]) + '</dt><dd>' + w[1] + '</dd></div>'; }).join('') + '</dl></div>' +
      '<div><h4 role="none">What you need</h4><ul class="dp-needs">' + M.needs.map(function (n) { return '<li>' + tick + '<span>' + n + '</span></li>'; }).join('') + '</ul></div>';
    if (anim) {
      var items = el.querySelectorAll('h2,.dp-chip,.dp-where div,.dp-needs li');
      gsap.from(items, { y: 16, opacity: 0, duration: .45, ease: 'sine.out', stagger: function (i) { return .05 * i + .04 * Math.sin(i * .9); } });
    }
  }

  /* ---------- tabs ---------- */
  var tabs = [].slice.call(document.querySelectorAll('.dp-tab')), pill = document.getElementById('dpPill');
  function movePill() {
    var on = tabs.filter(function (b) { return b.getAttribute('aria-selected') === 'true'; })[0]; if (!on) return;
    pill.style.width = on.offsetWidth + 'px'; pill.style.transform = 'translateX(' + on.offsetLeft + 'px)';
  }
  var auto = !reduce, autoTimer = null, autoNote = document.getElementById('dpAuto');
  function stopAuto() { auto = false; if (autoTimer) autoTimer.kill ? autoTimer.kill() : clearTimeout(autoTimer); autoNote.textContent = 'Pick a model to compare'; }
  tabs.forEach(function (b, i) {
    b.addEventListener('click', function () { stopAuto(); setMode(b.dataset.mode); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
      e.preventDefault(); var nb = tabs[(i + d + tabs.length) % tabs.length]; nb.focus(); nb.click();
    });
  });
  function scheduleAuto() {
    if (!auto || stopped) return; // PORT: stopped guard
    autoTimer = setTimeout(function () {
      if (!auto) return;
      if (vis && !document.hidden && !covered()) setMode(ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]);
      scheduleAuto();
    }, 7000);
  }
  if (!auto) autoNote.textContent = 'Pick a model to compare';

  /* ---------- boot ---------- */
  setOrient();
  // deep links: deployment.html#centralised | #edge | #hybrid | #federated (old #one/#corridor/#many still work)
  function hashToMode(hs) { hs = (hs || '').replace(/^#/, ''); hs = ALIAS[hs] || hs; return ORDER.indexOf(hs) > -1 ? hs : null; }
  var hashMode = hashToMode(location.hash);
  setMode(hashMode || 'centralised', true);
  if (hashMode) { stopAuto(); document.getElementById('tab-' + hashMode).scrollIntoView({ block: 'center' }); }
  function onHash() { var m = hashToMode(location.hash); if (m) { stopAuto(); setMode(m); } } // PORT: named so stop() can remove it
  addEventListener('hashchange', onHash);
  // the first view assembles in a wave from a loose line of equipment
  if (hasG && !reduce) {
    Object.keys(live).forEach(function (id, i) { var n = live[id]; if (n.o > 0) { n.y += (vert ? 0 : 1) * Math.sin(i * 1.3) * 60; n.x += (vert ? 1 : 0) * Math.sin(i * 1.3) * 60; n.o = 0; n.s = .7; paintNode(n); } });
    var first = mode; mode = null;
    dropLinks();
    ScrollTrigger.create({ trigger: stage, start: 'top 85%', once: true, onEnter: function () { setMode(first); scheduleAuto(); } });
  } else scheduleAuto();
  wake();
  var lastV = vert, lastW = document.documentElement.clientWidth, rzT = 0;
  function onResize() { // PORT: named so stop() can remove it
    clearTimeout(rzT);
    rzT = setTimeout(function () {
      var w = document.documentElement.clientWidth; if (w === lastW) return; lastW = w; // height-only (URL bar) resizes skip
      movePill(); setOrient();
      if (vert !== lastV) { lastV = vert; var m = mode; mode = null; dropLinks(); setMode(m, true); }
    }, 120);
  }
  addEventListener('resize', onResize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!stopped) movePill(); }); // PORT: stopped guard

  /* ---------- camera registry: ONVIF discovery and CSV import, then icons fly from the tray on a wave ---------- */
  var tray = [].slice.call(document.querySelectorAll('#dpTray li')), rows = [].slice.call(document.querySelectorAll('.dp-reg-row'));
  var disc = document.getElementById('dpDisc'), csv = document.getElementById('dpCsv');
  function runAct(btn, bar, txt, busy, done, cb) {
    var b = document.getElementById(bar), tx = document.getElementById(txt), sw = btn.querySelector('.sweep');
    if (!hasG || reduce) { b.style.transform = 'scaleX(1)'; tx.textContent = done; cb && cb(); return; }
    tx.textContent = busy; gsap.fromTo(b, { scaleX: 0 }, { scaleX: 1, duration: .55, ease: 'sine.inOut', onComplete: function () { tx.textContent = done; cb && cb(); } });
    if (sw) gsap.fromTo(sw, { rotation: 0 }, { rotation: 720, duration: .55, ease: 'sine.inOut', svgOrigin: '17 17' });
  }
  function flashRows(list) { list.forEach(function (r, i) { r.classList.add('new'); timers.push(setTimeout(function () { r.classList.remove('new'); }, 1400 + i * 120)); /* PORT: tracked */ }); }
  disc.addEventListener('click', function () { runAct(disc, 'dpDiscBar', 'dpDiscTxt', 'Scanning the network · ONVIF', '6 cameras found · added to the registry', function () { flashRows(rows); }); });
  csv.addEventListener('click', function () { runAct(csv, 'dpCsvBar', 'dpCsvTxt', 'Reading cameras.xlsx', 'Imported · names, sites and map positions', function () { flashRows(rows.slice(2)); }); });
  if (hasG && !reduce) {
    ScrollTrigger.create({
      trigger: '#dpCams', start: 'top 70%', once: true, onEnter: function () {
        runAct(disc, 'dpDiscBar', 'dpDiscTxt', 'Scanning the network · ONVIF', '6 cameras found · added to the registry');
        rows.forEach(function (row, i) {
          var ic = row.querySelector('.dp-reg-ic'), src = tray[i].querySelector('svg');
          var a = src.getBoundingClientRect(), b = ic.getBoundingClientRect();
          var dx = a.left + a.width / 2 - (b.left + b.width / 2), dy = a.top + a.height / 2 - (b.top + b.height / 2);
          var lift = 46 * (i % 2 ? 1 : -1);
          var rest = row.querySelectorAll('.dp-reg-id,.dp-reg-pr,.dp-on');
          gsap.set(ic, { x: dx, y: dy, scale: 1.25 }); gsap.set(rest, { opacity: 0, x: -10 });
          var tl = gsap.timeline({ delay: .12 * i + .05 * Math.sin(i) }); later.push(tl); // PORT: created after init, killed in stop()
          tl.to(ic, { keyframes: [{ x: dx * .5, y: dy * .5 + lift, scale: 1.1, duration: .45, ease: 'sine.out' }, { x: 0, y: 0, scale: 1, duration: .5, ease: 'sine.in' }] })
            .add(function () { tray[i].classList.add('done'); })
            .to(rest, { opacity: 1, x: 0, duration: .45, stagger: .04, ease: 'expo.out' }, '-=.1');
        });
        timers.push(setTimeout(function () { runAct(csv, 'dpCsvBar', 'dpCsvTxt', 'Reading cameras.xlsx', 'Imported · names, sites and map positions'); }, 2600)); // PORT: tracked
      }
    });
  } else { tray.forEach(function (li) { li.classList.add('done'); }); runAct(disc, 'dpDiscBar', 'dpDiscTxt', '', '6 cameras found · added to the registry'); runAct(csv, 'dpCsvBar', 'dpCsvTxt', '', 'Imported · names, sites and map positions'); }

  /* ---------- edge photo notes ---------- */
  var hots = [].slice.call(document.querySelectorAll('.dp-hot')), notes = [].slice.call(document.querySelectorAll('#dpNotes li'));
  function focusNote(n) { hots.forEach(function (h) { h.classList.toggle('on', +h.dataset.n === n); h.setAttribute('aria-pressed', String(+h.dataset.n === n)); }); notes.forEach(function (l) { l.classList.toggle('on', +l.dataset.n === n); }); }
  hots.forEach(function (h) { ['pointerenter', 'focus', 'click'].forEach(function (ev) { h.addEventListener(ev, function () { focusNote(+h.dataset.n); }); }); });
  notes.forEach(function (l) { l.addEventListener('pointerenter', function () { focusNote(+l.dataset.n); }); });
  focusNote(0);
  if (hasG && !reduce) {
    gsap.from(hots, { scale: 0, duration: .5, ease: 'back.out(2)', stagger: function (i) { return .14 * i + .06 * Math.sin(i * 1.4); }, scrollTrigger: { trigger: '#dpPhoto', start: 'top 75%' } });
    // notes cycle only while the photo is on screen
    var ni = 0; niT = 0; // PORT: niT is declared above (was "var ni = 0, niT = 0;")
    var ioPhoto = new IntersectionObserver(function (es) { // PORT: kept
      if (es[0].isIntersecting) { if (!niT) niT = setInterval(function () { if (!document.hidden && !covered()) { ni = (ni + 1) % 4; focusNote(ni); } }, 4200); }
      else { clearInterval(niT); niT = 0; }
    }); ioPhoto.observe(document.getElementById('dpPhoto')); observers.push(ioPhoto);
  }

  // PORT: the static page ended with a loader for assets/icons.js; the shared runtime now renders the icons on every page.

  // PORT: cleanup for client-side navigation away from this page. Tweens/ScrollTriggers made synchronously above are
  // reverted by usePage's gsap.context; everything started later (mode switches, the auto cycle, the registry demo) is
  // killed here, along with the rAF loop, timers, observers and window/document listeners.
  return function stop() {
    stopped = true; auto = false;
    cancelAnimationFrame(raf); raf = 0;
    clearTimeout(autoTimer); clearTimeout(rzT); clearInterval(niT); niT = 0;
    timers.forEach(clearTimeout);
    observers.forEach(function (io) { io.disconnect(); });
    document.removeEventListener('visibilitychange', wake); document.removeEventListener('infrax:cover', wake);
    removeEventListener('hashchange', onHash); removeEventListener('resize', onResize);
    if (hasG) {
      later.forEach(function (tl) { tl.kill(); });
      Object.keys(live).forEach(function (id) { var n = live[id]; gsap.killTweensOf(n); if (n._tw) n._tw.kill(); });
      zones.forEach(function (z) { gsap.killTweensOf(z.v); });
      links.forEach(function (L) { gsap.killTweensOf(L); });
      aiTags.forEach(function (A) { gsap.killTweensOf(A); });
      gsap.killTweensOf(document.querySelectorAll('#dpPanel *, #dpDiscBar, #dpCsvBar, .dp-act .sweep, .dp-reg-row *'));
    }
  };
}

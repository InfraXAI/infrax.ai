/* INFRAX.AI domain journey: CONSTRUCTION
   A building site: concrete frame with beams, formwork, rebar cages, stair and lift cores, full scaffolding with
   ladders and toe boards, wind-moved safety netting, two tower cranes with cat-heads and warning lights, a concrete
   pump with an articulated boom, transit mixers, a dumper and a digging excavator, workers in hard hats and hi-vis,
   hoarding, porta-cabin site office, laydown (rebar, pipes, precast), dust, puddles and tyre tracks.
   Detail pass: deck formwork on adjustable props with rebar mat and starters, column forms with yokes and push-pull
   props, edge rails, tube-and-coupler scaffold with boards and couplers, crane walkways/cab/hook block, vehicle
   hydraulics, mirrors and dummy plates, porta-cabins with steps and stair, hoarding posts and blank signs, merged
   static detail per surface type (one draw call each); ctx.mobile drops small props.
   Products here: Access and parking (site gate) and Cygnus. Everything is shown as Live (brief-v9).
   Contract: brief-v8 §6. Registers INFRAX_DOMAINS.construction. */
(function () {
  'use strict';
  var REG = window.INFRAX_DOMAINS = window.INFRAX_DOMAINS || {};

  REG.construction = {
    slug: 'construction',
    label: 'Construction',
    title: 'Every gate, crane and pour camera in one control room',
    intro: 'Deliveries read at the site gate, a concrete truck’s plate reads from gate to pour, every lift on record, and the excavator’s swing radius watched.',
    stations: [
      { id: 'gate', product: 'Access and parking', productSlug: 'access-parking', short: 'Site gate', title: 'Every delivery read at the gate',
        body: 'The ANPR camera at the site gate reads each delivery’s plate and vehicle class. The barrier opens and the visit is logged against the plate.',
        rows: [['Gate', 'Site gate · in'], ['Plate', 'XX 00 AB 1234'], ['Class', 'Truck · transit mixer'], ['Logged', '07:58 IST']],
        live: ['ANPR', 'Vehicle detection & classification'], photo: 'img/construction-gate-sm.jpg', photoCaption: 'Illustrative' },
      { id: 'journey', product: 'Cygnus', productSlug: 'cygnus', short: 'Gate to pour', title: 'A concrete truck, from gate to pour',
        body: 'Search the plate and Cygnus lines up every camera that saw it: in at the gate, at the Core B pour and out again, each with its clip.',
        rows: [['Search', 'XX 00 AB 1234'], ['Gate', '07:58'], ['Core B pour', '08:21'], ['Exit', '09:05']],
        live: ['Plate search & journeys'], photo: 'img/construction-aerial-sm.jpg', photoCaption: 'Illustrative' },
      { id: 'wall', product: 'Cygnus', productSlug: 'cygnus', short: 'Site wall', title: 'Every lift on record',
        body: 'Every site camera sits on one 3×3 wall and records around the clock. Scrub back to the crane lift at 10:42 and export the clip.',
        rows: [['Wall', '9 site cameras'], ['Recording', '24×7'], ['Clip', 'Crane T1 lift · 10:42'], ['Export', 'MP4 · 38 s']],
        live: ['Live view & recording', 'Clip export'], photo: 'img/construction-site-sm.jpg', photoCaption: 'Illustrative' },
      { id: 'health', product: 'Cygnus', productSlug: 'cygnus', short: 'Camera health', title: 'Dust on the crane camera, flagged',
        body: 'Dust from the site settles on the lens of the camera on the crane jib. As the picture fades, Cygnus raises a tamper alert so someone cleans it before the next lift needs watching.',
        rows: [['Camera', 'Crane T1 · CAM 04'], ['Status', 'Lens blocked · dust'], ['Raised', '13:20 IST']],
        live: ['Camera tamper & health'], photo: 'img/construction-crane-cam-sm.jpg', photoCaption: 'Illustrative' },
      { id: 'safety', product: 'Cygnus', productSlug: 'cygnus', short: 'Swing radius', title: 'Someone inside the swing radius',
        body: 'A zone is drawn around the excavator’s swing radius. When a person walks into it while the machine works, Cygnus raises a zone-intrusion alert with the clip.',
        rows: [['Zone', 'Excavator EX-2 · swing radius'], ['Event', 'Person in zone'], ['Raised', '15:06 IST']],
        live: ['Zone intrusion'], photo: 'img/construction-lift-sm.jpg', photoCaption: 'Illustrative' }
    ],
    create: function (host, ctx) { return build(host, ctx); }
  };

  function build(host, ctx) {
    var T = ctx.THREE, MOB = !!ctx.mobile, REDUCE = !!ctx.reduce, LOW = !!ctx.lowGpu, SH = !MOB && !LOW; // integrated GPUs: no shadows, no MSAA
    if (T.ColorManagement) T.ColorManagement.legacyMode = false;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

    /* ---------- renderer, layers ---------- */
    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    host.appendChild(canvas);
    var tags = document.createElement('div');
    tags.setAttribute('aria-hidden', 'true');
    tags.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
    host.appendChild(tags);

    var renderer = new T.WebGLRenderer({ canvas: canvas, antialias: !MOB && !LOW && (devicePixelRatio || 1) < 1.5, alpha: true, powerPreference: 'high-performance' });
    renderer.debug.checkShaderErrors = false; // no synchronous compile-log reads
    renderer.setPixelRatio(Math.min(ctx.dpr || devicePixelRatio || 1, MOB ? 1.25 : 1.75));
    renderer.setClearColor(0xffffff, 0);
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
    if (SH) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFShadowMap; renderer.shadowMap.autoUpdate = false; }

    var scene = new T.Scene();
    scene.fog = new T.FogExp2(0xF2F6FA, MOB ? .0041 : .0032);
    var cam = new T.PerspectiveCamera(MOB ? 62 : 50, 1, .3, 600);
    var envTex;
    (function env() {
      var es = new T.Scene(), g = new T.SphereGeometry(60, 32, 16), cl = [], top = new T.Color(0xBFD7EE), hor = new T.Color(0xFFFFFF), bot = new T.Color(0x77838F), tmp = new T.Color(), p = g.attributes.position;
      for (var i = 0; i < p.count; i++) { var y = p.getY(i) / 60; if (y > 0) tmp.copy(hor).lerp(top, Math.pow(y, .6)); else tmp.copy(hor).lerp(bot, Math.min(1, -y * 2.4)); cl.push(tmp.r, tmp.g, tmp.b); }
      g.setAttribute('color', new T.Float32BufferAttribute(cl, 3));
      es.add(new T.Mesh(g, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide })));
      var disc = new T.Mesh(new T.SphereGeometry(4, 16, 8), new T.MeshBasicMaterial({ color: 0xffffff })); disc.material.color.multiplyScalar(8); disc.position.set(25, 40, 20); es.add(disc);
      var pm = new T.PMREMGenerator(renderer); envTex = pm.fromScene(es, .03).texture; scene.environment = envTex; pm.dispose();
      es.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    })();
    scene.add(new T.HemisphereLight(0xF4F8FC, 0x8C97A3, 1.0));
    var sun = new T.DirectionalLight(0xFFF4E6, 2.6); sun.position.set(40, 60, 35); scene.add(sun); scene.add(sun.target);
    if (SH) { sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); var sc = sun.shadow.camera; sc.left = -60; sc.right = 60; sc.top = 60; sc.bottom = -60; sc.near = 5; sc.far = 220; sun.shadow.bias = -.0004; sun.shadow.normalBias = .03; sun.shadow.radius = 2; }
    // shadow frustum follows the station in view (centre x, y, z, half-size) so shadows stay crisp in every shot
    // the shadow map is redrawn when the frustum moves, on a station change, and every 4th frame for moving things
    var SUNOFF = new T.Vector3(40, 60, 35), _sfa = new T.Vector3(), shR = 60, shDirty = true, shN = 0;
    function shadowFocus(a, b, k) {
      if (!SH) return;
      _sfa.set(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k);
      var r = a[3] + (b[3] - a[3]) * k, px = (r * 2) / 2048; _sfa.x = Math.round(_sfa.x / px) * px; _sfa.z = Math.round(_sfa.z / px) * px;
      if (!sun.target.position.equals(_sfa)) shDirty = true;
      sun.target.position.copy(_sfa); sun.position.copy(_sfa).add(SUNOFF);
      if (Math.abs(r - shR) > .05) { shR = r; shDirty = true; sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r; sc.updateProjectionMatrix(); }
    }
    // ground decals: stacked layers get a depth bias so coplanar planes never z-fight, even from far above
    function decal(m, k) { m.polygonOffset = true; m.polygonOffsetFactor = -k; m.polygonOffsetUnits = -4 * k; return m; }

    /* ---------- kit ---------- */
    function M(c, o) { return new T.MeshStandardMaterial(Object.assign({ color: c, roughness: .78, metalness: .05 }, o || {})); }
    function B(c, o) { return new T.MeshBasicMaterial(Object.assign({ color: c, toneMapped: false }, o || {})); }
    function cs(o, recvOnly) { if (SH) { o.castShadow = !recvOnly; o.receiveShadow = true; } return o; }
    function add(g, m, x, y, z, parent) { var o = new T.Mesh(g, m); o.position.set(x || 0, y || 0, z || 0); (parent || scene).add(o); return o; }
    function canvasTex(w, h, draw, rep) {
      var c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
      var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 8;
      if (rep) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } t.userData = { canvas: c }; return t;
    }
    function noise(x, w, h, base, n, a) { x.fillStyle = base; x.fillRect(0, 0, w, h); for (var i = 0; i < n; i++) { var v = Math.random(); x.fillStyle = 'rgba(' + (v > .5 ? '255,255,255' : '40,46,52') + ',' + (Math.random() * a) + ')'; x.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); } }
    /* crisp brand-blue station board (same look as the highway tunnel) */
    function titleBoard(lines, opt) {
      opt = opt || {};
      var c = document.createElement('canvas'); c.width = 2048; c.height = 324;
      var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 16;
      function draw() {
        var x = c.getContext('2d'), w = c.width, h = c.height;
        x.clearRect(0, 0, w, h); x.fillStyle = '#2673B5'; x.fillRect(0, 0, w, h);
        x.strokeStyle = '#1B5A94'; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, h - 14);
        x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 4; x.strokeRect(26, 26, w - 52, h - 52);
        x.textBaseline = 'middle';
        if (opt.num) { x.fillStyle = '#FFFFFF'; x.fillRect(62, 62, 200, h - 124); x.fillStyle = '#2673B5'; x.font = '800 132px "Onest", "Segoe UI", sans-serif'; x.textAlign = 'center'; x.fillText(opt.num, 162, h / 2 + 4); }
        var left = opt.num ? 318 : 90, right = w - 90;
        if (opt.grp) { x.fillStyle = '#DCEBF7'; x.font = '600 58px "Geist Mono", ui-monospace, Consolas, monospace'; x.textAlign = 'right'; x.fillText(opt.grp.toUpperCase(), right, h / 2 + 2); right -= x.measureText(opt.grp.toUpperCase()).width + 60; }
        x.fillStyle = '#FFFFFF'; x.textAlign = opt.num ? 'left' : 'center';
        var size = lines.length > 1 ? 104 : 150; x.font = '800 ' + size + 'px "Onest", "Segoe UI", sans-serif';
        while (x.measureText(lines[0]).width > right - left && size > 60) { size -= 6; x.font = '800 ' + size + 'px "Onest", "Segoe UI", sans-serif'; }
        var cx = opt.num ? left : w / 2;
        if (lines.length > 1) { x.fillText(lines[0], cx, h * .34); x.fillText(lines[1], cx, h * .7); } else x.fillText(lines[0], cx, h / 2 + 6);
        t.needsUpdate = true;
      }
      draw(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!dead) draw(); });
      return t;
    }
    function board(text, opt) {
      opt = opt || {};
      var c = document.createElement('canvas'), w = (opt.w || 1024) * 2, h = (opt.h || 160) * 2; c.width = w; c.height = h;
      var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 16;
      function draw() {
        var x = c.getContext('2d'); x.fillStyle = opt.bg || '#2673B5'; x.fillRect(0, 0, w, h);
        var ins = Math.min(28, h * .12); x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 6; x.strokeRect(ins, ins, w - ins * 2, h - ins * 2);
        var size = (opt.size || 64) * 2.3, fam = '"Onest", "Segoe UI", sans-serif'; x.font = '800 ' + size + 'px ' + fam;
        while (x.measureText(text).width > w - ins * 6 && size > 20) { size -= 4; x.font = '800 ' + size + 'px ' + fam; }
        x.fillStyle = opt.fg || '#FFFFFF'; x.textBaseline = 'middle'; x.textAlign = 'center'; x.fillText(text, w / 2, h / 2 + 4);
        t.needsUpdate = true;
      }
      draw(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!dead) draw(); });
      return t;
    }
    /* camera model: bracket, housing, sunshield, bezel, glass lens, IR ring */
    var CAM = (function () {
      var housing = M(0xF4F6F8, { roughness: .32, metalness: .15 }), dark = M(0x1C232B, { roughness: .3, metalness: .6 }), glass = M(0x0B1520, { roughness: .04, metalness: .9 }), ir = B(0x5A1A1A), bracket = M(0x9AA4AE, { metalness: .65, roughness: .38 });
      var gHouse = new T.BoxGeometry(.5, .46, 1.2), gShield = new T.BoxGeometry(.64, .05, 1.48), gBezel = new T.CylinderGeometry(.22, .22, .06, 20).rotateX(Math.PI / 2), gLens = new T.CylinderGeometry(.13, .13, .08, 18).rotateX(Math.PI / 2), gIr = new T.TorusGeometry(.18, .022, 6, 22), gArm = new T.BoxGeometry(.08, .5, .08), gJoint = new T.SphereGeometry(.09, 10, 8);
      return function () {
        var h = new T.Group();
        add(gArm, bracket, 0, .48, -.25, h); add(gJoint, bracket, 0, .26, -.25, h);
        var b = add(gHouse, housing, 0, 0, 0, h); var s = add(gShield, housing, 0, .26, .12, h);
        add(gBezel, dark, 0, 0, .61, h); add(gLens, glass, 0, 0, .63, h); add(gIr, ir, 0, 0, .645, h);
        if (SH) b.castShadow = s.castShadow = true;
        return h;
      };
    })();
    var DOME = (function () {
      var base = M(0xF4F6F8, { roughness: .35 }), bubble = new T.MeshStandardMaterial({ color: 0x1B2732, roughness: .05, metalness: .6, transparent: true, opacity: .85 });
      var gB = new T.CylinderGeometry(.42, .46, .16, 24), gD = new T.SphereGeometry(.34, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
      return function () { var g = new T.Group(); add(gB, base, 0, 0, 0, g); add(gD, bubble, 0, -.08, 0, g); return g; };
    })();
    /* vehicle kit (merged per role) */
    var GL = 0x1B2732, TY = 0x131619, TR = 0x3A4048, RIM = 0xB4BCC4, LITE = 0xE9EEF2;
    function merge(parts) {
      var pos = [], nor = [], colA = [], c = new T.Color();
      parts.forEach(function (pt) {
        var g = pt[0].index ? pt[0].toNonIndexed() : pt[0], p = g.attributes.position.array, n = g.attributes.normal.array; c.setHex(pt[1] === undefined ? 0xffffff : pt[1]);
        for (var i = 0; i < p.length; i++) { pos.push(p[i]); nor.push(n[i]); }
        for (var j = 0; j < p.length / 3; j++) colA.push(c.r, c.g, c.b);
        g.dispose(); if (g !== pt[0]) pt[0].dispose();
      });
      var G = new T.BufferGeometry(); G.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); G.setAttribute('normal', new T.Float32BufferAttribute(nor, 3)); G.setAttribute('color', new T.Float32BufferAttribute(colA, 3)); return G;
    }
    function prof(pts, depth, bev) { var s = new T.Shape(); pts.forEach(function (p, i) { i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1]); }); var g = new T.ExtrudeGeometry(s, { depth: depth, bevelEnabled: !!bev, bevelThickness: bev || 0, bevelSize: bev || 0, bevelSegments: 2, curveSegments: 3 }); g.translate(0, 0, -depth / 2); g.rotateY(-Math.PI / 2); return g; }
    function bx(w, h, l, x, y, z, rx) { var g = new T.BoxGeometry(w, h, l); if (rx) g.rotateX(rx); return g.translate(x || 0, y || 0, z || 0); }
    function wheelSet(list, r, wd, W, zs) {
      zs.forEach(function (zz) { [-1, 1].forEach(function (sd) { var x = sd * (W / 2 - wd / 2 + .03);
        list.push([new T.CylinderGeometry(r, r, wd, 16).rotateZ(Math.PI / 2).translate(x, r, zz), TY]);
        list.push([new T.CylinderGeometry(r * .56, r * .56, wd + .03, 12).rotateZ(Math.PI / 2).translate(x, r, zz), RIM]);
        list.push([new T.CylinderGeometry(r * .18, r * .18, wd + .07, 8).rotateZ(Math.PI / 2).translate(x, r, zz), TR]); }); });
    }
    var paintM = new T.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: .3, metalness: .4 });
    var darkM = new T.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: .18, metalness: .5 });
    var boxM = new T.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: .7, metalness: .05 });
    /* detail kit: transformed parts collected per surface type and merged into one mesh each (one draw call per type) */
    var UPV = new T.Vector3(0, 1, 0), _kq = new T.Quaternion(), _kd = new T.Vector3();
    function G(g, x, y, z, rx, ry, rz) { if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); if (rz) g.rotateZ(rz); return g.translate(x || 0, y || 0, z || 0); }
    function BXG(w, h, d, x, y, z, rx, ry, rz) { return G(new T.BoxGeometry(w, h, d), x, y, z, rx, ry, rz); }
    function CY(rt, rb, h, seg, open) { return new T.CylinderGeometry(rt, rb, h, seg || 12, 1, !!open); }
    function ROD(a, b, r, seg) { _kd.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]); var L = _kd.length(), g = new T.CylinderGeometry(r, r, L, seg || 6); g.applyQuaternion(_kq.setFromUnitVectors(UPV, _kd.normalize())); return g.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); }
    var VCM = {
      matte: new T.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: .88, metalness: .02 }),
      paint: new T.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: .42, metalness: .3 }),
      metal: new T.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: .32, metalness: .78 }),
      glass: new T.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: .05, metalness: .9 }),
      lamp: new T.MeshBasicMaterial({ color: 0xffffff, vertexColors: true, toneMapped: false })
    };
    function kit() {
      var b = {};
      return {
        put: function (kind, g, c) { (b[kind] = b[kind] || []).push([g, c === undefined ? 0xffffff : c]); return this; },
        build: function (parent, shadow) {
          Object.keys(b).forEach(function (k) { if (!b[k].length) return; var m = new T.Mesh(merge(b[k]), VCM[k]); if (shadow && k !== 'lamp' && k !== 'glass') cs(m); else if (SH && k !== 'lamp') m.receiveShadow = true; (parent || scene).add(m); });
          b = {};
        }
      };
    }
    // seated driver facing +z (hip at x, y, z): hi-vis over a work shirt, hard hat, thighs forward, hands on a wheel or levers
    function driver(K, x, y, z, wheel) {
      K.put('matte', BXG(.38, .48, .24, x, y + .3, z), 0x2D4A6B); K.put('matte', BXG(.42, .34, .27, x, y + .34, z), 0xF07A1F); K.put('lamp', BXG(.43, .04, .275, x, y + .3, z), 0xE9EEF2);
      K.put('matte', BXG(.1, .1, .1, x, y + .58, z), 0xA9805E); K.put('matte', G(new T.SphereGeometry(.12, 12, 10), x, y + .7, z), 0xA9805E);
      K.put('paint', G(new T.SphereGeometry(.145, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), x, y + .75, z), 0xFFFFFF); K.put('paint', G(CY(.18, .18, .02, 14), x, y + .755, z + .02), 0xFFFFFF);
      [-1, 1].forEach(function (sd) {
        K.put('matte', BXG(.14, .13, .42, x + sd * .1, y + .02, z + .2), 0x24344A); K.put('matte', BXG(.12, .42, .13, x + sd * .1, y - .2, z + .4), 0x24344A);
        K.put('matte', ROD([x + sd * .2, y + .48, z], [x + sd * .17, y + .3, z + .36], .05), 0x2D4A6B); K.put('matte', G(new T.SphereGeometry(.045, 8, 6), x + sd * .17, y + .3, z + .39), 0xD9B84A);
        if (!wheel) K.put('metal', ROD([x + sd * .3, y - .05, z + .4], [x + sd * .19, y + .28, z + .4], .02), 0x23282D);   // joystick levers
      });
      if (wheel) { K.put('metal', G(new T.TorusGeometry(.19, .022, 6, 18), x, y + .3, z + .42, -1.0), 0x1E2328); K.put('metal', ROD([x, y + .1, z + .62], [x, y + .3, z + .44], .025), 0x23282D); }
    }
    var _ra2 = new T.Vector3(), _rb2 = new T.Vector3(), _rd2 = new T.Vector3(), _rq2 = new T.Quaternion(), _rm2 = new T.Matrix4(), _rs2 = new T.Vector3(), _rp2 = new T.Vector3();
    function rodInst(list, mat, seg, shadow) {   // instanced round bars between two points: {a, b, r}
      var g = new T.InstancedMesh(new T.CylinderGeometry(1, 1, 1, seg || 6), mat, Math.max(1, list.length));
      list.forEach(function (m, i) { _ra2.fromArray(m.a); _rb2.fromArray(m.b); _rd2.subVectors(_rb2, _ra2); var L = _rd2.length(); _rq2.setFromUnitVectors(UPV, _rd2.normalize()); _rm2.compose(_rp2.addVectors(_ra2, _rb2).multiplyScalar(.5), _rq2, _rs2.set(m.r, L, m.r)); g.setMatrixAt(i, _rm2); });
      g.count = list.length; if (SH && shadow !== false) g.castShadow = true; scene.add(g); return g;
    }
    // dummy number plate, shared by every vehicle
    var plateM = B(0xE4E8EC, { map: canvasTex(256, 56, function (x, w, h) { x.fillStyle = '#F7F8F9'; x.fillRect(0, 0, w, h); x.strokeStyle = '#1B2126'; x.lineWidth = 4; x.strokeRect(3, 3, w - 6, h - 6); x.fillStyle = '#14181C'; x.font = '700 33px "Geist Mono", Consolas, monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('XX 00 AB 1234', w / 2, h / 2 + 2); }) });
    var plateG = new T.PlaneGeometry(.52, .12);
    function plates(g, zf, yf, zr, yr) { add(plateG, plateM, 0, yf, zf, g); if (zr !== undefined) add(plateG, plateM, 0, yr, zr, g).rotation.y = Math.PI; }
    // irregular stockpile: a cone/dome blend with a wobbly footprint
    function heapGeo(r, h, seed) {
      var g = new T.SphereGeometry(1, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), p = g.attributes.position;
      for (var i = 0; i < p.count; i++) {
        var x = p.getX(i), y = p.getY(i), z = p.getZ(i), rho = Math.hypot(x, z), a = Math.atan2(z, x), k = 1 + .12 * Math.sin(a * 3 + seed) + .06 * Math.sin(a * 7 + seed * 2.3) + .03 * Math.sin(a * 13 + seed);
        var yy = (1 - rho) * .72 + y * .28; p.setXYZ(i, x * r * k, yy * h * (1 + .1 * Math.sin(a * 5 + seed) * (1 - yy)), z * r * k);
      }
      g.computeVertexNormals(); return g;
    }
    var grainTex = canvasTex(256, 256, function (x, w, h) { noise(x, w, h, '#E9E6E0', 16000, .32); }, [3, 3]);
    /* projected HTML tags (inside host) */
    var TAGS = [];
    function tag(html, kind) {
      var el = document.createElement('div');
      var red = kind === 'alert', dark = kind === 'dark';
      el.style.cssText = 'position:absolute;left:0;top:0;transform:translate(-50%,-100%);white-space:nowrap;font:600 12.5px/1.25 "Geist Mono",ui-monospace,Consolas,monospace;' +
        'padding:6px 9px;border-radius:6px;border:1px solid ' + (red ? '#D6453D' : '#2673B5') + ';background:' + (red ? '#D6453D' : dark ? '#0E3B66' : 'rgba(255,255,255,.96)') + ';color:' + (red || dark ? '#fff' : '#0E3B66') +
        ';box-shadow:0 8px 20px -12px rgba(10,26,43,.5);opacity:0;transition:opacity .25s;will-change:transform';
      el.innerHTML = html; tags.appendChild(el);
      var t = { el: el, p: new T.Vector3(), on: false }; TAGS.push(t); return t;
    }
    var _v = new T.Vector3(), W = 1, H = 1;
    var _sz = function (el) { if (el._st !== el.textContent) { el._st = el.textContent; el._sw = el.offsetWidth; el._sh = el.offsetHeight; } return el; };
    function placeTags() {
      TAGS.forEach(function (t) {
        if (!t.on) { t.el.style.opacity = 0; return; }
        _v.copy(t.p).project(cam);
        var vis = _v.z < 1 && _v.x > -1.05 && _v.x < 1.05 && _v.y > -1.05 && _v.y < 1.1;
        t.el.style.opacity = vis ? 1 : 0;
        var x = (_v.x * .5 + .5) * W, y = (-_v.y * .5 + .5) * H;
        x = Math.max(80, Math.min(W - 80, x));
        _sz(t.el); t.el.style.transform = 'translate(' + Math.round(x - t.el._sw / 2) + 'px,' + Math.round(y - t.el._sh) + 'px)'; // whole pixels: no blurred text
      });
    }


    /* ================= CONSTRUCTION SITE ================= */
    var postM = M(0x8E99A4, { metalness: .6, roughness: .4 });
    var dead = false;

    /* ---------- ground: blueprint grid outside, site soil inside the hoarding, gravel haul road ---------- */
    var gridPts = [];
    for (var gx = -140; gx <= 140; gx += 6) gridPts.push(gx, 0.01, -140, gx, 0.01, 140);
    for (var gz = -140; gz <= 140; gz += 6) gridPts.push(-140, 0.01, gz, 140, 0.01, gz);
    var gridG = new T.BufferGeometry(); gridG.setAttribute('position', new T.Float32BufferAttribute(gridPts, 3));
    scene.add(new T.LineSegments(gridG, new T.LineBasicMaterial({ color: 0x9CC0E0, transparent: true, opacity: .35 })));
    var grnd = add(new T.PlaneGeometry(1000, 1000).rotateX(-Math.PI / 2), M(0xEEF2F6, { roughness: .95 }), 0, 0, 0); cs(grnd, true);
    // site soil: compacted and loose patches, ruts and stone scatter so the ground reads from high above
    var soilTex = canvasTex(1024, 1024, function (x, w, h) {
      noise(x, w, h, '#C8BEAE', 40000, .16);
      for (var b = 0; b < 26; b++) { var bx = Math.random() * w, by = Math.random() * h, br = 40 + Math.random() * 140, gr = x.createRadialGradient(bx, by, 0, bx, by, br), dk = Math.random() > .5; gr.addColorStop(0, dk ? 'rgba(120,104,84,.16)' : 'rgba(236,228,212,.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(bx - br, by - br, br * 2, br * 2); }
      for (var i = 0; i < 70; i++) { x.strokeStyle = 'rgba(110,96,78,.12)'; x.lineWidth = 3 + Math.random() * 6; x.beginPath(); var sx = Math.random() * w, sy = Math.random() * h; x.moveTo(sx, sy); x.quadraticCurveTo(sx + (Math.random() - .5) * 200, sy + (Math.random() - .5) * 200, sx + (Math.random() - .5) * 260, sy + (Math.random() - .5) * 260); x.stroke(); }
      for (var s = 0; s < 900; s++) { x.fillStyle = 'rgba(' + (Math.random() > .5 ? '150,140,124' : '96,88,76') + ',.5)'; var r = 1 + Math.random() * 2.5; x.beginPath(); x.arc(Math.random() * w, Math.random() * h, r, 0, 7); x.fill(); }
    }, [2, 2]);
    var soil = add(new T.PlaneGeometry(100, 100).rotateX(-Math.PI / 2), decal(M(0xffffff, { map: soilTex, roughness: .98 }), 1), 0, .02, -10); cs(soil, true);
    var gravelTex = canvasTex(512, 512, function (x, w, h) { noise(x, w, h, '#A7A49C', 22000, .25); for (var s = 0; s < 500; s++) { x.fillStyle = 'rgba(' + (Math.random() > .5 ? '200,196,186' : '110,106,98') + ',.6)'; x.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 2 + Math.random() * 3); } }, [2, 12]);
    function gravelM(k, rx, ry) { var m = decal(M(0xffffff, { map: gravelTex.clone(), roughness: .95 }), k); m.map.repeat.set(rx, ry); m.map.needsUpdate = true; return m; }
    add(new T.PlaneGeometry(12, 52).rotateX(-Math.PI / 2), gravelM(4, 2, 9), 0, .032, 14);          // gate → building
    add(new T.PlaneGeometry(40, 9).rotateX(-Math.PI / 2), gravelM(5, 7, 1.6), 14, .036, -6);       // along the building front
    var roadTex = canvasTex(512, 512, function (x, w, h) { noise(x, w, h, '#7E868D', 14000, .14); }, [2, 10]);
    add(new T.PlaneGeometry(14, 70).rotateX(-Math.PI / 2), decal(M(0xffffff, { map: roadTex, roughness: .9 }), 2), 0, .022, 76); // public road to the gate
    var markM = decal(B(0xF4F6F8), 3);
    for (var dz = 0; dz < 14; dz++) add(new T.PlaneGeometry(.22, 2.2).rotateX(-Math.PI / 2), markM, 0, .03, 46 + dz * 4.5);
    add(new T.PlaneGeometry(6, .4).rotateX(-Math.PI / 2), markM, -3, .035, 44.6);  // stop line

    // puddles (water over a darker wet rim) on the haul roads and in the ruts; tyre tracks follow the real vehicle paths (see below)
    var puddleM = decal(new T.MeshStandardMaterial({ color: 0x6E7A86, roughness: .04, metalness: .6, transparent: true, opacity: .78, depthWrite: false }), 9);
    var wetM = decal(new T.MeshStandardMaterial({ color: 0x8C7E68, roughness: .9, transparent: true, opacity: .42, depthWrite: false }), 8);
    function puddleGeo(seed) { var g = new T.CircleGeometry(1, 28), p = g.attributes.position; for (var i = 1; i < p.count; i++) { var a = Math.atan2(p.getY(i), p.getX(i)), k = 1 + .18 * Math.sin(a * 3 + seed) + .1 * Math.sin(a * 5 + seed * 1.7); p.setXY(i, p.getX(i) * k, p.getY(i) * k); } return g.rotateX(-Math.PI / 2); }
    [[-1.5, 30, 1.6, .9], [2.2, 22, 1.1, .7], [-2.6, 8, 2.0, 1.1], [18, -1, 1.4, .8], [-20, 2, 1.2, .9], [8, 14, 1.0, .6], [-4.6, 17, .9, .5], [30.5, 4.5, 1.5, .8], [41.5, -6.5, 1.1, .7], [27, -12.5, 1.3, .6], [-9.5, -2.5, .8, .5], [3.6, 36.5, 1.2, .6]].forEach(function (p, i) {
      var g = puddleGeo(i * 1.9), wet = add(g, wetM, p[0], .046, p[1]); wet.scale.set(p[2] * 1.35, 1, p[3] * 1.45); wet.rotation.y = p[0] * .7;
      var m = add(g, puddleM, p[0], .05, p[1]); m.scale.set(p[2], 1, p[3]); m.rotation.y = p[0] * .7;
    });
    var trackTex = canvasTex(128, 256, function (x, w, h) {
      x.clearRect(0, 0, w, h);
      [[5, 22], [w - 27, 22]].forEach(function (s) { x.fillStyle = 'rgba(92,80,64,.22)'; x.fillRect(s[0], 0, s[1], h); for (var y = 0; y < h; y += 8) { x.fillStyle = 'rgba(70,60,48,' + (.28 + Math.random() * .14) + ')'; x.beginPath(); x.moveTo(s[0], y); x.lineTo(s[0] + s[1] / 2, y + 4); x.lineTo(s[0] + s[1], y); x.lineTo(s[0] + s[1], y + 2.5); x.lineTo(s[0] + s[1] / 2, y + 6.5); x.lineTo(s[0], y + 2.5); x.fill(); } });
    });
    var trackM = decal(new T.MeshBasicMaterial({ map: trackTex, transparent: true, depthWrite: false, opacity: .72, side: T.DoubleSide }), 7);
    trackTex.wrapS = trackTex.wrapT = T.RepeatWrapping;
    // a flat ribbon that follows a list of ground points (x, z): tyre tracks along the routes the trucks actually drive
    function ribbon(pts, wdt, y, mat, closed) {
      var pos = [], uv = [], idx = [], L = 0;
      for (var i = 0; i < pts.length; i++) {
        var a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
        if (closed) { a = pts[(i - 1 + pts.length) % pts.length]; b = pts[(i + 1) % pts.length]; }
        var tx = b.x - a.x, tz = b.z - a.z, tl = Math.hypot(tx, tz) || 1, nx = -tz / tl * wdt / 2, nz = tx / tl * wdt / 2;
        if (i) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z);
        pos.push(pts[i].x + nx, y, pts[i].z + nz, pts[i].x - nx, y, pts[i].z - nz); uv.push(0, L / 3.2, 1, L / 3.2);
        if (i) { var k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
      }
      var g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
      var m = new T.Mesh(g, mat); scene.add(m); return m;
    }

    /* ---------- hoarding with gate gap ---------- */
    var hoardTex = canvasTex(1024, 256, function (x, w, h) {
      x.fillStyle = '#F4F6F8'; x.fillRect(0, 0, w, h); x.fillStyle = '#2673B5'; x.fillRect(0, 0, w, 54); x.fillStyle = '#1B5A94'; x.fillRect(0, 54, w, 6);
      for (var i = 0; i < w; i += 128) { x.fillStyle = 'rgba(30,50,70,.12)'; x.fillRect(i, 0, 3, h); }
    }, [8, 1]);
    var hoardM = M(0xffffff, { map: hoardTex, roughness: .6, metalness: .1 });
    function hoard(x0, z0, x1, z1) {
      var len = Math.hypot(x1 - x0, z1 - z0), m = hoardM.clone(); m.map = hoardTex.clone(); m.map.repeat.set(len / 12, 1); m.map.needsUpdate = true;
      var o = add(new T.BoxGeometry(len, 2.6, .12), m, (x0 + x1) / 2, 1.3, (z0 + z1) / 2); o.rotation.y = -Math.atan2(z1 - z0, x1 - x0); cs(o);
    }
    hoard(-50, 40, -7, 40); hoard(7, 40, 50, 40); hoard(-50, 40, -50, -60); hoard(50, 40, 50, -60); hoard(-50, -60, 50, -60);
    add(new T.PlaneGeometry(10, 1.6), B(0xffffff, { map: board('SITE GATE · DELIVERIES', { size: 66, h: 150, w: 900 }) }), -24, 2.0, 40.1);
    // blank sign panels on the road face, and the hoarding's posts and kicker braces on ballast blocks inside
    var HK2 = kit(), blankM = M(0xffffff, { roughness: .5, map: canvasTex(512, 128, function (x, w, h) { x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2673B5'; x.lineWidth = 12; x.strokeRect(6, 6, w - 12, h - 12); x.strokeStyle = 'rgba(38,115,181,.35)'; x.lineWidth = 3; x.strokeRect(24, 24, w - 48, h - 48); }) });
    [-41, -13, 14, 25.5, 37].forEach(function (x) { add(new T.PlaneGeometry(6, 1.5), blankM, x, 1.15, 40.075); [-2.6, 2.6].forEach(function (o) { HK2.put('metal', BXG(.06, .06, .05, x + o, 1.82, 40.09), 0x8E99A4); HK2.put('metal', BXG(.06, .06, .05, x + o, .48, 40.09), 0x8E99A4); }); });
    function hoardPosts(x0, z0, x1, z1, ix, iz) {
      var len = Math.hypot(x1 - x0, z1 - z0), n = Math.round(len / 3);
      for (var i = 0; i <= n; i++) {
        var t = i / n, px = x0 + (x1 - x0) * t + ix * .12, pz = z0 + (z1 - z0) * t + iz * .12;
        HK2.put('metal', BXG(.08, 2.7, .08, px, 1.35, pz), 0x6E7378);
        if (!MOB) { HK2.put('metal', ROD([px, 1.9, pz], [px + ix * 1.4, .3, pz + iz * 1.4], .035, 5), 0x6E7378); HK2.put('matte', BXG(.45, .3, .45, px + ix * 1.4, .15, pz + iz * 1.4), 0x9AA0A6); }
      }
    }
    hoardPosts(-50, 40, -7, 40, 0, -1); hoardPosts(7, 40, 50, 40, 0, -1); hoardPosts(-50, 40, -50, -60, 1, 0); hoardPosts(50, 40, 50, -60, -1, 0); hoardPosts(-50, -60, 50, -60, 0, 1);
    HK2.build(scene, true);

    /* ---------- gate: cabin, boom barrier, ANPR pole ---------- */
    var cabin = new T.Group(); cabin.position.set(10, 0, 37);
    cs(add(new T.BoxGeometry(4.2, 3, 3.2), M(0xE9EDF1, { roughness: .6 }), 0, 1.5, 0, cabin));
    add(new T.BoxGeometry(4.6, .3, 3.6), M(0x2673B5), 0, 3.15, 0, cabin);
    add(new T.PlaneGeometry(3.2, 1.2), M(0x22303D, { roughness: .08, metalness: .85 }), -2.11, 1.9, 0, cabin).rotation.y = -Math.PI / 2;
    add(new T.PlaneGeometry(2.4, .55), B(0xffffff, { map: board('SECURITY', { size: 74, h: 150, w: 600 }) }), 0, 2.75, 1.62, cabin);
    scene.add(cabin);
    // two barriers on a central island: the entry arm spans the in-lane (x −3), the exit arm the out-lane (x 3.5)
    cs(add(new T.BoxGeometry(1.1, .2, 3.4), M(0xC9CDD1, { roughness: .9 }), .25, .1, 42.7));
    var boomTex = canvasTex(512, 32, function (x, w, h) { for (var i = 0; i < w; i += 64) { x.fillStyle = '#D6453D'; x.fillRect(i, 0, 32, h); x.fillStyle = '#FFFFFF'; x.fillRect(i + 32, 0, 32, h); } });
    function barrier(z, sd) {
      cs(add(new T.BoxGeometry(.55, 1.1, .55), M(0xE7B53A, { roughness: .5 }), .25, .75, z));
      add(new T.BoxGeometry(.4, .14, .02), B(0xF4F6F8), .25, 1.0, z + (sd < 0 ? .29 : -.29));
      var g = new T.Group(); g.position.set(.25, 1.2, z); scene.add(g);
      cs(add(new T.BoxGeometry(6.6, .14, .14), M(0xffffff, { map: boomTex, roughness: .5 }), sd * 3.4, 0, 0, g));
      add(new T.BoxGeometry(.3, .5, .2), M(0x2B3036), -sd * .35, 0, 0, g);   // counterweight
      cs(add(new T.CylinderGeometry(.06, .07, .9, 8), postM, .25 + sd * 6.7, .45, z));   // rest post
      return g;
    }
    var boom = barrier(43.1, -1), boomXg = barrier(42.3, 1);
    cs(add(new T.CylinderGeometry(.13, .16, 6.2, 12), postM, -8.6, 3.1, 41));
    add(new T.BoxGeometry(2.4, .12, .12), postM, -7.5, 6.0, 41);
    var anpr = CAM(); anpr.position.set(-6.5, 5.6, 41.3); anpr.rotation.x = .28; scene.add(anpr);

    /* ---------- building under construction: frame, beams, cores, formwork, rebar, scaffold, netting, pump ---------- */
    var B_X0 = -20, B_X1 = 20, B_Z0 = -46, B_Z1 = -18, LV = 3.6, LEVELS = 6;
    var concM = M(0xC9CDD1, { roughness: .88 }), concDark = M(0xB3B8BD, { roughness: .92 }), plyM = M(0xD7B98A, { roughness: .9 }), rebarM = M(0x8A5A3B, { roughness: .7, metalness: .45 });
    var m4 = new T.Matrix4(), col = new T.Color(), q = new T.Quaternion(), sv = new T.Vector3(), pv = new T.Vector3(), q0 = new T.Quaternion(), up = new T.Vector3(0, 1, 0);
    function boxInst(list, mat, shadow) {
      var g = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), mat, Math.max(1, list.length));
      list.forEach(function (t, i) { m4.compose(pv.set(t.p[0], t.p[1], t.p[2]), t.q || q0, sv.set(t.s[0], t.s[1], t.s[2])); g.setMatrixAt(i, m4); });
      g.count = list.length; if (shadow !== false) cs(g); else if (SH) g.receiveShadow = true; scene.add(g); return g;
    }
    var XS = [], ZS = [];
    for (var cx = B_X0; cx <= B_X1; cx += 10) XS.push(cx);
    for (var cz = B_Z0; cz <= B_Z1; cz += 7) ZS.push(cz);
    function boxInstC(list, mat, shadow) { var g = boxInst(list, mat, shadow); list.forEach(function (t, i) { g.setColorAt(i, col.setHex(t.c === undefined ? 0xffffff : t.c)); }); if (g.instanceColor) g.instanceColor.needsUpdate = true; return g; }
    var cols = [], beams = [], edges = [], XTOP = B_X0 + (B_X1 - B_X0) * .55;   // the top lift is cast west of XTOP; east of it level 5 is still on its formwork
    for (var lv = 0; lv < LEVELS; lv++) {
      var topLift = lv === LEVELS - 1;
      XS.forEach(function (x, xi) { ZS.forEach(function (z, zi) {
        if (topLift && (x > XTOP || (xi + zi) % 2 === 0)) return;          // top lift still being cast
        cols.push({ p: [x, lv * LV + LV / 2, z], s: [.6, LV, .6] });
      }); });
      if (lv === 0) continue;
      var by0 = lv * LV - .45, xMax = topLift ? XTOP : B_X1;
      XS.forEach(function (x) { if (x <= xMax + .1) beams.push({ p: [x, by0, (B_Z0 + B_Z1) / 2], s: [.5, .6, B_Z1 - B_Z0] }); });
      ZS.forEach(function (z) { beams.push({ p: [(B_X0 + xMax) / 2, by0, z], s: [xMax - B_X0, .6, .5] }); });
      edges.push({ p: [(B_X0 + xMax) / 2, lv * LV + .42, B_Z1 + .55], s: [xMax - B_X0 + 1.2, .5, .1] });   // edge protection
    }
    boxInst(cols, concM); boxInst(beams, concDark); boxInst(edges, M(0xE7B53A, { roughness: .5 }), false);
    for (var sl = 1; sl < LEVELS; sl++) {
      var partial = sl === LEVELS - 1, w = partial ? (B_X1 - B_X0) * .55 : B_X1 - B_X0 + 1.2;
      cs(add(new T.BoxGeometry(w, .32, B_Z1 - B_Z0 + 1.2), sl % 2 ? concM : concDark, partial ? B_X0 + w / 2 - .6 : 0, sl * LV, (B_Z0 + B_Z1) / 2));
    }
    var TOPY = (LEVELS - 1) * LV, SLT = .16;
    // east of the pour line: level-5 deck formwork (film-faced panels on timber joists, aluminium primaries and adjustable
    // steel props standing on level 4), the slab's rebar mat on top and edge forms; starter bars come up through it
    var DX0 = XTOP - .6, DX1 = B_X1 + .6, DZ0 = B_Z0 - .6, DZ1 = B_Z1 + .6, DECK = TOPY - SLT;
    function inCore(x, z) { return x > 9.3 && x < 14.7 && z > -42.7 && z < -37.3; }
    var form = [], ply = [], joists = [], prim = [], propO = [], propI = [], propP = [], yokes = [], starters = [], mat = [], pushP = [];
    var PNX = 8, PNZ = 24, pnw = (DX1 - DX0) / PNX, pnd = (DZ1 - DZ0) / PNZ;
    for (var ix = 0; ix < PNX; ix++) for (var iz = 0; iz < PNZ; iz++) { var px0 = DX0 + (ix + .5) * pnw, pz0 = DZ0 + (iz + .5) * pnd; if (!inCore(px0, pz0)) ply.push({ p: [px0, DECK - .015, pz0], s: [pnw - .025, .03, pnd - .025], c: [0xA8692F, 0xB27236, 0x9E642D][(ix * 7 + iz * 3) % 3] }); }
    for (var jz = DZ0 + .25; jz < DZ1; jz += .5) joists.push({ p: [(DX0 + DX1) / 2, DECK - .105, jz], s: [DX1 - DX0, .15, .07] });
    for (var jx = DX0 + .6; jx < DX1; jx += 1.5) prim.push({ p: [jx, DECK - .27, (DZ0 + DZ1) / 2], s: [.1, .18, DZ1 - DZ0] });
    var PB = TOPY - LV + SLT, PT = DECK - .36;
    for (var px = 2; px < 19.4; px += MOB ? 3 : 1.5) for (var pz = -45.4; pz <= -17.8; pz += MOB ? 2.8 : 1.4) {
      if (inCore(px, pz)) continue;
      propO.push({ a: [px, PB, pz], b: [px, PB + 1.75, pz], r: .032 }); propI.push({ a: [px, PB + 1.7, pz], b: [px, PT, pz], r: .022 });
      propP.push({ p: [px, PB + .008, pz], s: [.16, .016, .16] }); propP.push({ p: [px, PT + .03, pz], s: [.16, .06, .12] });
    }
    var rs = MOB ? .8 : .4;
    for (var rz2 = DZ0 + .2; rz2 < DZ1; rz2 += rs) mat.push({ p: [(DX0 + DX1) / 2, DECK + .06, rz2], s: [DX1 - DX0 - .3, .028, .028] });
    for (var rx2 = DX0 + .2; rx2 < DX1; rx2 += rs) mat.push({ p: [rx2, DECK + .09, (DZ0 + DZ1) / 2], s: [.028, .028, DZ1 - DZ0 - .3] });
    // top lift west of the pour line: alternate columns cast (starter bars out of their tops), the rest in plywood forms
    // with steel yokes and push-pull props
    XS.forEach(function (x, xi) { ZS.forEach(function (z, zi) {
      var y0 = x > XTOP ? DECK - .1 : (xi + zi) % 2 ? TOPY + LV - .1 : -1;
      if (y0 > 0) [[-.2, -.2], [.2, -.2], [-.2, .2], [.2, .2]].forEach(function (o) { starters.push({ p: [x + o[0], y0 + .6, z + o[1]], s: [.032, 1.2, .032] }); });
      if (x > XTOP || (xi + zi) % 2) return;
      form.push({ p: [x, TOPY + LV / 2, z], s: [.82, LV, .82] });
      [.6, 1.7, 2.8].forEach(function (h) { var yy = TOPY + h; [-1, 1].forEach(function (sd) { yokes.push({ p: [x, yy, z + sd * .45], s: [1.02, .09, .07] }); yokes.push({ p: [x + sd * .45, yy, z], s: [.07, .09, 1.02] }); }); });
      var dx = x < -9 ? 1 : -1, dz = z < -32 ? 1 : -1;
      pushP.push({ a: [x + dx * 2.4, TOPY + SLT + .05, z], b: [x + dx * .45, TOPY + 2.5, z], r: .03 }); pushP.push({ a: [x, TOPY + SLT + .05, z + dz * 2.4], b: [x, TOPY + 2.5, z + dz * .45], r: .03 });
    }); });
    boxInst(form, plyM); boxInstC(ply, M(0xffffff, { roughness: .55 }), true); boxInst(joists, M(0xD9B26F, { roughness: .85 }), false);
    boxInst(prim, M(0xC4CCD3, { metalness: .7, roughness: .35 }), false); boxInst(propP, M(0x5A646E, { metalness: .6, roughness: .45 }), false);
    rodInst(propO, M(0xD8642A, { roughness: .5, metalness: .3 }), 8); rodInst(propI, M(0xB8C0C8, { metalness: .75, roughness: .35 }), 8, false);
    boxInst(yokes, M(0x2B3036, { metalness: .5, roughness: .5 }), false); rodInst(pushP, M(0xE7B53A, { roughness: .5, metalness: .3 }), 6);
    boxInst(starters.concat(mat), rebarM, false);
    // edge forms with stop-end braces round the deck; safety rails (posts, top and mid rails, toe boards) on every open slab edge
    var FK = kit(), railY = [], railT = [];
    [[DX0, DZ1, DX1, DZ1, 0, -1], [DX0, DZ0, DX1, DZ0, 0, 1], [DX1, DZ0, DX1, DZ1, -1, 0]].forEach(function (e) {
      var len = Math.hypot(e[2] - e[0], e[3] - e[1]), ax = e[1] === e[3];
      FK.put('matte', BXG(ax ? len : .03, .46, ax ? .03 : len, (e[0] + e[2]) / 2, DECK + .2, (e[1] + e[3]) / 2), 0xB27236);
      if (!MOB) for (var s = .6; s < len; s += 1.2) { var bx0 = ax ? e[0] + s : e[0], bz0 = ax ? e[1] : e[1] + s; FK.put('matte', ROD([bx0, DECK + .4, bz0], [bx0 + e[4] * .5, DECK + .02, bz0 + e[5] * .5], .025, 4), 0xD9B26F); }
    });
    function railRun(x0, z0, x1, z1, y) {
      var len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / 2)), ax = Math.abs(x1 - x0) > Math.abs(z1 - z0);
      for (var i = 0; i <= n; i++) { var t = i / n; railY.push({ p: [x0 + (x1 - x0) * t, y + .55, z0 + (z1 - z0) * t], s: [.05, 1.1, .05] }); }
      [1.0, .5].forEach(function (hh) { railY.push({ p: [(x0 + x1) / 2, y + hh, (z0 + z1) / 2], s: ax ? [len, .045, .045] : [.045, .045, len] }); });
      railT.push({ p: [(x0 + x1) / 2, y + .08, (z0 + z1) / 2], s: ax ? [len, .15, .025] : [.025, .15, len] });
    }
    for (var sl2 = 1; sl2 < LEVELS; sl2++) {
      var ty = sl2 * LV + SLT, xe = sl2 === LEVELS - 1 ? DX0 : B_X1 + .6;
      railRun(B_X0 - .55, B_Z0 - .55, B_X0 - .55, B_Z1 + .55, ty); railRun(B_X0 - .55, B_Z0 - .55, xe, B_Z0 - .55, ty);
    }
    railRun(DX0, DZ0 + .08, DX1, DZ0 + .08, DECK + .45);
    boxInst(railY, M(0xE7B53A, { roughness: .45, metalness: .3 }), false); boxInst(railT, M(0xD9B26F, { roughness: .85 }), false);
    FK.build(scene, true);
    // rebar cages waiting on the open top lift (vertical bars + links)
    var bars = [];
    for (var ri = 0; ri < (MOB ? 5 : 12); ri++) {
      var rx = B_X0 + 2 + (ri % 4) * 2.6, rz = B_Z0 + 3 + Math.floor(ri / 4) * 7;
      for (var bb = 0; bb < 4; bb++) bars.push({ p: [rx + (bb % 2) * .5, TOPY + 1.3, rz + Math.floor(bb / 2) * .5], s: [.04, 2.6, .04] });
      for (var li = 0; li < 6; li++) bars.push({ p: [rx + .25, TOPY + .3 + li * .42, rz + .25], s: [.58, .03, .58] });
    }
    boxInst(bars, rebarM, false);
    // lift core and stair core rising above the frame, with door openings
    var coreM = M(0xBFC4C9, { roughness: .9 }), holeM = M(0x3A4048, { roughness: .9 });
    cs(add(new T.BoxGeometry(5, LEVELS * LV + 3, 5), coreM, 12, (LEVELS * LV + 3) / 2, -40));
    cs(add(new T.BoxGeometry(4.2, LEVELS * LV + 1, 6), coreM, -14, (LEVELS * LV + 1) / 2, -40));
    for (var co = 0; co < LEVELS; co++) { add(new T.PlaneGeometry(1.4, 2.2), holeM, 12, co * LV + 1.4, -37.48); add(new T.PlaneGeometry(1.2, 2.0), holeM, -14, co * LV + 1.4, -36.98); }
    // scaffold on two faces: standards, transoms, ledgers, braces, boards, toe boards and a ladder bay
    // tube-and-coupler: standards on base plates and timber sole boards, ledgers and transoms with couplers at every node,
    // five scaffold boards per lift, guard and mid rails, toe boards, façade braces and a ladder bay
    var tube = [], boards = [], toes = [], cplr = [], soles = [], scafM = M(0xC4CCD3, { metalness: .7, roughness: .35 }), SCH = LEVELS * LV - 1;
    function scaffoldFace(x0, x1, z0, z1) {
      var len = Math.hypot(x1 - x0, z1 - z0), n = Math.round(len / 2.5), alongX = z0 === z1, nx = alongX ? 0 : 1, nz = alongX ? 1 : 0, i, y;
      for (i = 0; i <= n; i++) {
        var t = i / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
        [0, 1.2].forEach(function (o) {
          tube.push({ p: [x + nx * o, SCH / 2, z + nz * o], s: [.048, SCH, .048] });
          soles.push({ p: [x + nx * o, .07, z + nz * o], s: [.16, .014, .16], c: 0x8E99A4 });
          if (!MOB) for (var yy = 2; yy <= SCH; yy += 2) cplr.push({ p: [x + nx * o, yy, z + nz * o], s: [.1, .1, .1] });
        });
        soles.push({ p: [x + nx * .6, .03, z + nz * .6], s: alongX ? [.22, .05, 1.7] : [1.7, .05, .22], c: 0x9C7A55 });
        for (y = 2; y <= SCH; y += 2) tube.push({ p: [x + nx * .6, y + .055, z + nz * .6], s: alongX ? [.045, .045, 1.4] : [1.4, .045, .045] });   // transoms
      }
      for (y = 2; y <= SCH; y += 2) {
        [0, 1.2].forEach(function (o) { tube.push({ p: [(x0 + x1) / 2 + nx * o, y, (z0 + z1) / 2 + nz * o], s: alongX ? [len, .048, .048] : [.048, .048, len] }); });   // ledgers
        [1.0, .5].forEach(function (hh) { tube.push({ p: [(x0 + x1) / 2 + nx * 1.2, y + hh, (z0 + z1) / 2 + nz * 1.2], s: alongX ? [len, .045, .045] : [.045, .045, len] }); });   // guard + mid rail
        for (var bd = 0; bd < 5; bd++) { var off = .14 + bd * .23; boards.push({ p: [(x0 + x1) / 2 + nx * off, y + .1, (z0 + z1) / 2 + nz * off], s: alongX ? [len, .038, .215] : [.215, .038, len], c: [0xB98E5A, 0xC49A63, 0xAE8452, 0xBF9560, 0xB38956][(bd + y) % 5] }); }
        toes.push({ p: [(x0 + x1) / 2 + nx * 1.17, y + .2, (z0 + z1) / 2 + nz * 1.17], s: alongX ? [len, .15, .03] : [.03, .15, len] });
      }
      for (var j = 0; j < n; j += 2) for (var b0 = 0; b0 < SCH - 2; b0 += 4) {
        var ta = j / n, tb = Math.min(1, (j + 2) / n);
        var A = new T.Vector3(x0 + (x1 - x0) * ta + nx * 1.25, b0, z0 + (z1 - z0) * ta + nz * 1.25), Bv = new T.Vector3(x0 + (x1 - x0) * tb + nx * 1.25, b0 + 4, z0 + (z1 - z0) * tb + nz * 1.25);
        var dv = Bv.clone().sub(A), L = dv.length();
        tube.push({ p: [(A.x + Bv.x) / 2, (A.y + Bv.y) / 2, (A.z + Bv.z) / 2], s: [.05, L, .05], q: new T.Quaternion().setFromUnitVectors(up, dv.normalize()) });
      }
      var lx = x0 + (x1 - x0) * .15 + nx * .9, lz = z0 + (z1 - z0) * .15 + nz * .9;
      [-.25, .25].forEach(function (o) { tube.push({ p: [lx + (alongX ? o : 0), SCH / 2, lz + (alongX ? 0 : o)], s: [.05, SCH, .05] }); });
      for (var r = .3; r < SCH; r += .3) tube.push({ p: [lx, r, lz], s: alongX ? [.5, .03, .03] : [.03, .03, .5] });
    }
    scaffoldFace(B_X0 - 1, B_X1 + 1, B_Z1 + 1.6, B_Z1 + 1.6);
    scaffoldFace(B_X1 + 1.6, B_X1 + 1.6, B_Z0 - 1, B_Z1 + 1);
    boxInst(tube, scafM, false); boxInstC(boards, M(0xffffff, { roughness: .9 }), false); boxInst(toes, M(0xB98E5A, { roughness: .9 }), false);
    boxInstC(soles, M(0xffffff, { roughness: .6, metalness: .3 }), false); if (cplr.length) boxInst(cplr, M(0x7D8790, { metalness: .85, roughness: .3 }), false);
    // safety netting outside the scaffold, moved by the wind in update()
    var netTex = canvasTex(256, 256, function (x, w, h) { x.clearRect(0, 0, w, h); x.strokeStyle = 'rgba(38,115,181,.55)'; x.lineWidth = 2; for (var i = 0; i < w; i += 8) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); } }, [16, 8]);
    var netM = new T.MeshStandardMaterial({ map: netTex, color: 0xBFD7EE, transparent: true, opacity: .55, side: T.DoubleSide, depthWrite: false, roughness: .9 });
    var NETS = [];
    function netPlane(w, h, x, y, z, ry) { var g = new T.PlaneGeometry(w, h, 24, 12), m = add(g, netM, x, y, z); m.rotation.y = ry || 0; m.userData.base = g.attributes.position.array.slice(); m.userData.h = h; NETS.push(m); return m; }
    netPlane(B_X1 - B_X0 + 2, SCH - 3, 0, (SCH - 3) / 2 + 2, B_Z1 + 3.0, 0);
    netPlane(B_Z1 - B_Z0 + 2, SCH - 3, B_X1 + 3.0, (SCH - 3) / 2 + 2, (B_Z0 + B_Z1) / 2, Math.PI / 2);
    // concrete pump: chassis, cab, outriggers on pads, turret and a three-section articulated boom over the top lift
    var yel = M(0xE7B53A, { roughness: .5 });
    var pump = new T.Group(); pump.position.set(-6, 0, -8); pump.rotation.y = Math.PI; scene.add(pump);   // hopper end faces the haul road
    cs(add(new T.BoxGeometry(2.5, 1.0, 9), M(0x2B3036, { roughness: .6 }), 0, 1.0, 0, pump));
    cs(add(new T.BoxGeometry(2.4, 2.0, 2.0), M(0xF2F4F6, { roughness: .4 }), 0, 2.2, 3.6, pump));
    add(new T.PlaneGeometry(2.0, .9), M(0x22303D, { roughness: .08, metalness: .85 }), 0, 2.6, 4.61, pump);
    cs(add(new T.BoxGeometry(2.2, 1.2, 4.2), yel, 0, 2.1, -1.4, pump));
    [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(function (o) { add(new T.BoxGeometry(2.6, .25, .3), yel, o[0] * 2.4, .7, o[1] * 3.2, pump); add(new T.BoxGeometry(.7, .1, .7), M(0x7A5B3A), o[0] * 3.6, .05, o[1] * 3.2, pump); add(new T.BoxGeometry(.2, .7, .2), yel, o[0] * 3.6, .4, o[1] * 3.2, pump); });
    [-1.3, 1.3].forEach(function (x) { [3.4, -2, -3.4].forEach(function (z) { add(new T.CylinderGeometry(.5, .5, .4, 14).rotateZ(Math.PI / 2), M(0x131619, { roughness: .9 }), x, .5, z, pump); }); });
    var turret = new T.Group(); turret.position.set(0, 2.9, -2.4); pump.add(turret);
    add(new T.CylinderGeometry(.7, .8, .6, 16), yel, 0, 0, 0, turret);
    function boomSeg(len) {
      var g = new T.Group(); cs(add(new T.BoxGeometry(.45, .45, len), yel, 0, 0, len / 2, g));
      var BK = kit();
      BK.put('metal', G(CY(.09, .09, len, 8), 0, .32, len / 2, Math.PI / 2), 0x8E99A4);                       // delivery line
      for (var c = 1; c < len; c += 2) BK.put('metal', BXG(.3, .1, .12, 0, .3, c), 0x2B3036);                  // pipe clamps
      BK.put('metal', G(CY(.32, .32, .6, 14), 0, 0, len, 0, 0, Math.PI / 2), 0x2B3036);                        // knuckle
      BK.put('paint', G(CY(.12, .12, len * .32, 10), 0, -.36, len * .2, Math.PI / 2), 0xE7B53A);               // ram barrel
      BK.put('metal', G(CY(.07, .07, len * .3, 10), 0, -.36, len * .48, Math.PI / 2), 0xD4DAE0);                // chrome rod
      BK.put('metal', ROD([0, -.36, len * .04], [0, -.15, .02], .05), 0x2B3036);
      BK.build(g, true); return g;
    }
    var seg1 = boomSeg(10); seg1.rotation.x = -1.25; turret.add(seg1);
    var seg2 = boomSeg(9); seg2.position.z = 10; seg2.rotation.x = .45; seg1.add(seg2);
    var seg3 = boomSeg(8); seg3.position.z = 9; seg3.rotation.x = .35; seg2.add(seg3);
    var hose = new T.Group(); hose.position.z = 8; seg3.add(hose);
    add(new T.CylinderGeometry(.13, .13, 2, 8), M(0x131619, { roughness: .8 }), 0, -1, 0, hose);
    // pump detail: cab glass, mirrors, grille, lamps, wheel rims and hubs, outrigger rams, rear hopper with grate, plates
    var PK = kit();
    [-1, 1].forEach(function (sd) {
      PK.put('glass', BXG(.04, .8, 1.3, sd * 1.21, 2.6, 3.7), GL);
      PK.put('metal', BXG(.36, .04, .04, sd * 1.36, 2.7, 4.3), TR); PK.put('metal', BXG(.06, .5, .24, sd * 1.56, 2.55, 4.3), TR); PK.put('glass', BXG(.04, .42, .18, sd * 1.595, 2.55, 4.3), 0x8FA3B5);
      PK.put('lamp', BXG(.34, .16, .04, sd * .8, 1.45, 4.62), LITE); PK.put('lamp', BXG(.2, .12, .04, sd * 1.0, 1.1, -4.52), 0xD6453D);
      PK.put('paint', BXG(.6, .1, 1.2, sd * 1.15, 1.08, 3.4), 0x2B3036);
      [3.4, -2, -3.4].forEach(function (z) { PK.put('metal', G(CY(.28, .28, .42, 12), sd * 1.31, .5, z, 0, 0, Math.PI / 2), RIM); PK.put('metal', G(CY(.09, .09, .46, 8), sd * 1.33, .5, z, 0, 0, Math.PI / 2), TR); });
      [1, -1].forEach(function (oz) { PK.put('metal', G(CY(.07, .07, .5, 8), sd * 3.6, .2, oz * 3.2), 0xD4DAE0); PK.put('paint', G(CY(.11, .11, .4, 8), sd * 3.6, .78, oz * 3.2), 0x2B3036); });
    });
    PK.put('metal', BXG(1.2, .5, .04, 0, 1.75, 4.62), 0x1B2126); PK.put('metal', BXG(2.5, .3, .2, 0, .9, 4.6), TR);
    PK.put('paint', G(CY(.1, .12, .18, 10), .7, 3.3, 3.6), 0xF2A33A);
    PK.put('paint', BXG(1.7, .75, 1.0, 0, 1.55, -4.75), 0xE7B53A); PK.put('metal', BXG(1.5, .05, .85, 0, 1.94, -4.75), 0x3A4048);
    for (var hg = -.6; hg <= .61; hg += .2) PK.put('metal', BXG(.03, .06, .85, hg, 1.97, -4.75), 0x8E99A4);
    PK.put('metal', G(CY(.16, .16, 1.4, 10), 0, 1.2, -3.8, Math.PI / 2), 0x8E99A4);
    PK.build(pump, true);
    plates(pump, 4.63, .95, -5.27, 1.25);
    add(new T.PlaneGeometry(7, 1.0), B(0xffffff, { map: board('CORE B · POUR', { size: 74, h: 150, w: 880 }) }), -6, LEVELS * LV + 1.2, B_Z1 + 3.4);

    /* ---------- tower cranes: lattice mast + jib, cat-head with pendant ties, counter-jib, cab, trolley, hook, warning lights ---------- */
    var latM = M(0xE7C33A, { roughness: .45, metalness: .35 }), lat = [];
    function member(a, b, r) { lat.push({ a: a, b: b, r: r || .1 }); }
    function mast(x, z, h) {
      var s = MS;   // 1.7 m square mast: corner legs, K-bracing on every face, horizontals at each panel point
      [[-s, -s], [s, -s], [s, s], [-s, s]].forEach(function (c) { member([x + c[0], 0, z + c[1]], [x + c[0], h, z + c[1]], .075); });
      for (var y = 0; y < h - .1; y += 2.0) {
        var y1 = Math.min(h, y + 2.0);
        member([x - s, y, z - s], [x + s, y1, z - s], .04); member([x + s, y, z + s], [x - s, y1, z + s], .04); member([x - s, y, z + s], [x - s, y1, z - s], .04); member([x + s, y, z - s], [x + s, y1, z + s], .04);
        member([x - s, y, z - s], [x + s, y, z - s], .03); member([x - s, y, z + s], [x + s, y, z + s], .03); member([x - s, y, z - s], [x - s, y, z + s], .03); member([x + s, y, z - s], [x + s, y, z + s], .03);
      }
    }
    function jibLattice(len, back, yb) {
      var L = [];
      for (var x = -back; x < len; x += 2.5) {
        var hh = x < 0 ? 1.1 : 1.6 - (x / len) * .6;
        var x1 = x + 2.5, hh1 = x1 < 0 ? 1.1 : 1.6 - (x1 / len) * .6;
        L.push([[x, yb, -.7], [x1, yb, -.7], .05]); L.push([[x, yb, .7], [x1, yb, .7], .05]); L.push([[x, yb + hh, 0], [x1, yb + hh1, 0], .05]);
        L.push([[x, yb, -.7], [x + 1.25, yb + (hh + hh1) / 2, 0], .032]); L.push([[x + 1.25, yb + (hh + hh1) / 2, 0], [x1, yb, -.7], .032]);
        L.push([[x, yb, .7], [x + 1.25, yb + (hh + hh1) / 2, 0], .032]); L.push([[x + 1.25, yb + (hh + hh1) / 2, 0], [x1, yb, .7], .032]);
        L.push([[x, yb, -.7], [x, yb, .7], .028]); L.push([[x, yb, -.7], [x1, yb, .7], .022]);
      }
      L.push([[-.9, yb, -.6], [0, yb + 7, 0], .07]); L.push([[.9, yb, -.6], [0, yb + 7, 0], .07]); L.push([[-.9, yb, .6], [0, yb + 7, 0], .07]); L.push([[.9, yb, .6], [0, yb + 7, 0], .07]);   // cat-head
      for (var ch = 1.5; ch < 7; ch += 1.5) { var cw = .9 * (1 - ch / 7); L.push([[-cw, yb + ch, -cw * .66], [cw, yb + ch, cw * .66], .025]); L.push([[-cw, yb + ch, cw * .66], [cw, yb + ch, -cw * .66], .025]); }
      L.push([[0, yb + 7, 0], [len * .55, yb + 1.3, 0], .028]); L.push([[0, yb + 7, 0], [len * .95, yb + 1.0, 0], .024]);   // pendant ties
      L.push([[0, yb + 7, 0], [-back + 1, yb + 1.1, -.4], .028]); L.push([[0, yb + 7, 0], [-back + 1, yb + 1.1, .4], .028]);
      return L;
    }
    var latDir = new T.Vector3();
    function latticeMesh(list, mat) {
      var g = new T.InstancedMesh(new T.CylinderGeometry(1, 1, 1, 6), mat, list.length);
      list.forEach(function (m, i) {
        var a = new T.Vector3().fromArray(m.a || m[0]), b = new T.Vector3().fromArray(m.b || m[1]), r = m.r || m[2];
        latDir.subVectors(b, a); var len = latDir.length(); q.setFromUnitVectors(up, latDir.normalize());
        m4.compose(pv.addVectors(a, b).multiplyScalar(.5), q, sv.set(r, len, r)); g.setMatrixAt(i, m4);
      });
      if (SH) g.castShadow = true; return g;
    }
    var lampM = B(0xFF3B30), LAMPS = [], ropeM = M(0x2B3036), MS = .85;
    function crane(x, z, h, jib, back, rot, loadKind) {
      lat = []; mast(x, z, h); scene.add(latticeMesh(lat, latM));
      cs(add(new T.BoxGeometry(5, .8, 5), concDark, x, .4, z));                                                  // base pad
      var YL = 0xE7C33A, GR = 0x8E99A4, DK = 0x2B3036, MK = kit();
      // mast: fixing angles on the pad, internal ladder, rest platforms
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c) { MK.put('metal', BXG(.42, .35, .42, x + c[0] * MS, .97, z + c[1] * MS), DK); MK.put('metal', BXG(.32, .12, .32, x + c[0] * MS, 1.2, z + c[1] * MS), 0x5A646E); });
      [-.25, .25].forEach(function (o) { MK.put('metal', BXG(.045, h, .045, x + o, h / 2, z - .62), GR); });
      if (!MOB) for (var ry = .5; ry < h; ry += .3) MK.put('metal', BXG(.5, .025, .025, x, ry, z - .62), GR);
      if (!MOB) for (var hp2 = 2.4; hp2 < h - 1; hp2 += 1.2) [-1, 1].forEach(function (sd) { MK.put('metal', BXG(.025, .025, .5, x + sd * .38, hp2, z - .42), GR); });   // safety hoops
      for (var py = 9; py < h - 3; py += 9) MK.put('metal', BXG(1.5, .05, .8, x, py, z + .25), GR);
      MK.build(scene, true);
      var top = new T.Group(); top.position.set(x, h, z); top.rotation.y = rot; scene.add(top);
      top.add(latticeMesh(jibLattice(jib, back, .4), latM));
      add(new T.CylinderGeometry(1.3, 1.3, .5, 20), M(0x2B3036, { metalness: .5 }), 0, .1, 0, top);            // slewing ring
      var TK = kit();
      // tower-head platform with handrails
      TK.put('metal', BXG(3.0, .08, 3.0, 0, -.25, 0), GR);
      [-1, 1].forEach(function (sd) { TK.put('paint', BXG(3.0, .04, .04, 0, .72, sd * 1.5), YL); TK.put('paint', BXG(.04, .04, 3.0, sd * 1.5, .72, 0), YL); [-1, 1].forEach(function (s2) { TK.put('paint', BXG(.04, 1.0, .04, sd * 1.5, .23, s2 * 1.5), YL); }); });
      // jib walkway (grating between the bottom chords) with kick strips
      TK.put('metal', BXG(jib - 1.2, .04, .56, jib / 2 + .4, .47, 0), GR);
      [-1, 1].forEach(function (sd) { TK.put('paint', BXG(jib - 1.2, .1, .02, jib / 2 + .4, .52, sd * .29), YL); });
      // counter-jib: walkway, handrails both sides, ballast blocks and the hoist winch with its rope drum
      TK.put('metal', BXG(back - 1, .12, 1.6, -back / 2, .45, 0), 0x9AA4AE);
      [-1, 1].forEach(function (sd) {
        for (var cp = -1; cp > -back + .5; cp -= 2) TK.put('paint', BXG(.05, 1.0, .05, cp, 1.0, sd * .8), YL);
        TK.put('paint', BXG(back - 1.4, .05, .05, -back / 2 + .2, 1.5, sd * .8), YL); TK.put('paint', BXG(back - 1.4, .04, .04, -back / 2 + .2, 1.0, sd * .8), YL);
      });
      for (var c = 0; c < 4; c++) { TK.put('matte', BXG(1.4, 1.6, 1.8, -back + 1 + c * 1.5, -.5, 0), 0xC9CDD1); TK.put('matte', BXG(1.42, .06, 1.82, -back + 1 + c * 1.5, -.1, 0), 0xA9AEB3); }
      TK.put('metal', BXG(2, 1.2, 1.6, -back * .45, 1.1, 0), DK);
      TK.put('metal', G(CY(.42, .42, 1.3, 16), -back * .45 + 1.45, 1.05, 0, Math.PI / 2), 0x5A646E); TK.put('metal', G(CY(.3, .3, 1.34, 16), -back * .45 + 1.45, 1.05, 0, Math.PI / 2), 0x23282D);
      TK.put('paint', BXG(.7, .7, .9, -back * .45 - 1.4, .95, 0), 0x2673B5);
      // operator cab: glazed front and sides, floor window, roof, mullions, wiper, access platform and the driver inside
      var cx0 = 1.6, cy0 = -.95, cz0 = 2.15;
      TK.put('paint', BXG(2.0, 2.0, 2.0, cx0 - .1, cy0, cz0), 0xF2F4F6);
      var CG = 0x3E5A74;
      TK.put('glass', BXG(.06, 1.5, 1.8, cx0 + .92, cy0 + .1, cz0), CG);
      [-1, 1].forEach(function (sd) { TK.put('glass', BXG(1.4, 1.05, .06, cx0 + .1, cy0 + .25, cz0 + sd * 1.0), CG); TK.put('metal', BXG(.09, 1.6, .09, cx0 + .94, cy0 + .1, cz0 + sd * .96), DK);
        TK.put('metal', BXG(.06, 1.12, .07, cx0 - .62, cy0 + .25, cz0 + sd * 1.01), DK); TK.put('metal', BXG(1.5, .06, .07, cx0 + .1, cy0 + .79, cz0 + sd * 1.01), DK); TK.put('metal', BXG(1.5, .06, .07, cx0 + .1, cy0 - .29, cz0 + sd * 1.01), DK); });
      TK.put('metal', BXG(.07, .06, 1.9, cx0 + .95, cy0 + .86, cz0), DK); TK.put('metal', BXG(.07, .06, 1.9, cx0 + .95, cy0 - .66, cz0), DK);
      TK.put('glass', BXG(.8, .06, 1.5, cx0 + .45, cy0 - 1.0, cz0), CG);
      TK.put('metal', BXG(2.3, .12, 2.2, cx0 - .05, cy0 + 1.06, cz0), DK);
      TK.put('metal', BXG(.03, .7, .04, cx0 + .97, cy0 + .2, cz0 + .2, 0, 0, 0), DK);
      TK.put('metal', BXG(1.3, .05, .9, cx0 - .5, cy0 - .98, cz0 - 1.45), GR);
      TK.put('matte', BXG(.4, .5, .3, cx0 + .25, cy0 - .25, cz0), 0x2D4A6B); TK.put('lamp', BXG(.41, .05, .31, cx0 + .25, cy0 - .3, cz0), 0xDDE3E8);
      TK.put('matte', G(new T.SphereGeometry(.13, 10, 8), cx0 + .25, cy0 + .14, cz0), 0xA9805E);
      TK.put('paint', G(new T.SphereGeometry(.15, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), cx0 + .25, cy0 + .2, cz0), 0xFFFFFF);
      TK.build(top, true);
      var trolley = new T.Group(); trolley.position.set(jib * .62, 0, 0); top.add(trolley);
      var TRK = kit();
      TRK.put('metal', BXG(1.5, .1, 1.7, 0, .12, 0), DK);
      [-1, 1].forEach(function (sz) { TRK.put('paint', BXG(1.5, .5, .06, 0, -.12, sz * .82), YL); [-.5, .5].forEach(function (wx) { TRK.put('metal', G(CY(.12, .12, .1, 12), wx, .56, sz * .7, Math.PI / 2), DK); }); });
      [-.2, .2].forEach(function (sx) { TRK.put('metal', G(CY(.16, .16, .12, 16), sx, -.2, 0, Math.PI / 2), 0x5A646E); });
      TRK.build(trolley, true);
      var rope = new T.Mesh(merge([[new T.CylinderGeometry(.024, .024, 1, 5).translate(-.2, 0, 0), DK], [new T.CylinderGeometry(.024, .024, 1, 5).translate(.2, 0, 0), DK]]), VCM.metal); rope.position.y = -1; trolley.add(rope);
      var hook = new T.Group(); trolley.add(hook);
      // hook block: cheek plates with a black band, sheave on its axle, crosshead, shank, hook and safety latch
      var HKB = kit();
      [-1, 1].forEach(function (sd) { HKB.put('paint', BXG(.62, .52, .05, 0, -.25, sd * .14), 0xE7B53A); HKB.put('paint', BXG(.63, .08, .055, 0, -.1, sd * .142), 0x1B2126); });
      HKB.put('metal', G(CY(.2, .2, .2, 18), 0, -.2, 0, Math.PI / 2), 0x5A646E); HKB.put('metal', G(CY(.05, .05, .36, 8), 0, -.2, 0, Math.PI / 2), 0xC4CCD3);
      HKB.put('metal', BXG(.5, .12, .36, 0, -.56, 0), DK); HKB.put('metal', G(CY(.06, .06, .18, 10), 0, -.7, 0), 0xC4CCD3);
      HKB.put('metal', G(new T.TorusGeometry(.15, .05, 8, 18, Math.PI * 1.45), 0, -.92, 0, 0, 0, 2.0), DK);
      HKB.put('paint', BXG(.03, .16, .03, .11, -.84, 0, 0, 0, .5), 0xE7B53A);
      HKB.build(hook, true);
      var load = new T.Group(); hook.add(load);
      if (loadKind === 'bucket') {
        load.position.y = -1.9; cs(add(new T.CylinderGeometry(.8, .45, 1.4, 16), M(0x9BA6B1, { metalness: .5, roughness: .4 }), 0, 0, 0, load));
        [-1, 1].forEach(function (sd) { add(new T.CylinderGeometry(.02, .02, 1.3, 4), ropeM, sd * .45, .95, 0, load).rotation.z = sd * .5; });
      } else {
        load.position.y = -1.7;
        for (var br = 0; br < 3; br++) for (var bc = 0; bc < 4; bc++) add(new T.CylinderGeometry(.06, .06, 6, 6).rotateX(Math.PI / 2), rebarM, -.3 + bc * .2, -br * .14, 0, load);
        [-1, 1].forEach(function (sd) { add(new T.CylinderGeometry(.02, .02, 2.3, 4), ropeM, 0, .95, sd * 1.0, load).rotation.x = sd * .9; });
      }
      [[jib, 1.6], [-back, 1.3], [0, 7.6]].forEach(function (p) { LAMPS.push(add(new T.SphereGeometry(.28, 10, 8), lampM, p[0], p[1] + .4, 0, top)); });
      LAMPS.push(add(new T.SphereGeometry(.2, 10, 8), lampM, x + MS + .12, h * .55, z + MS + .12));
      return { top: top, trolley: trolley, rope: rope, hook: hook, load: load };
    }
    var T1 = crane(30, -30, 44, 42, 13, 2.6, 'rebar'), T2 = MOB ? null : crane(-32, -44, 36, 34, 11, .6, 'bucket');
    // lift cycles: lower to the pick, sling on, hoist, slew + trolley out (eased), lower to the set-down, release, hoist, slew back.
    // T1 carries rebar bundles from a staging area on bearers east of the frame onto the level-5 deck; T2 shuttles a concrete
    // skip between the refill point on the ground and the pour on the top lift. Hooks always hang plumb under the trolley.
    function aimOf(bx, bz, x, z) { var dx = x - bx, dz = z - bz; return [Math.atan2(-dz, dx), Math.hypot(dx, dz)]; }
    var CY1 = (function () { var a = aimOf(30, -30, 40, -42), b = aimOf(30, -30, 5, -25); if (b[0] < a[0]) b[0] += Math.PI * 2; return { C: T1, a0: a[0], r0: a[1], a1: b[0], r1: b[1], lo0: 44 - 2.04 - .22, lo1: 44 - 2.04 - (TOPY - SLT + .104), hi: 12, carry: true, hold: 0 }; })();
    var CY2 = T2 ? (function () { var a = aimOf(-32, -44, -40, -20), b = aimOf(-32, -44, -16.5, -30.6); return { C: T2, a0: a[0], r0: a[1], a1: b[0], r1: b[1], lo0: 36 - 2.6 - .02, lo1: 36 - 2.6 - (TOPY + SLT + .5), hi: 10, carry: false, hold: 0 }; })() : null;
    // phase lengths come from real speeds: hoist/lower at ~1 m/s mean (the eased profile peaks at ~1.5 m/s and starts and
    // stops gently), slew at ~0.1 rad/s mean. Phases: 0 lower to pick, 1 sling on, 2 hoist, 3 slew + trolley, 4 lower to
    // set-down, 5 release (T2: discharge), 6 hoist, 7 slew back.
    var BH = .40, NSLOT = 4, SLOT_DR = .9;   // bundle height; deck slots side by side along the jib
    function phases(c) {
      var h0 = Math.abs(c.lo0 - c.hi) / 1.0, h1 = Math.abs(c.lo1 - c.hi) / 1.0, sl = Math.max(10, Math.abs(c.a1 - c.a0) / .1);
      c.ph = [h0, 4, h0, sl, h1, c.carry ? 4 : 7, h1, sl]; c.P = 0; c.ph.forEach(function (d) { c.P += d; });
      c.pickLo = c.lo0; c.r1c = c.r1; c.pi = -1;
    }
    function phaseAt(c, t) { var i = 0; while (i < 7 && t >= c.ph[i]) { t -= c.ph[i]; i++; } return [i, Math.min(1, t / c.ph[i])]; }
    function cyclePose(c, t) {
      var q = phaseAt(c, t), i = q[0], e = ease(q[1]), L0 = c.pickLo, R1 = c.r1c;
      if (i === 0) return [c.a0, c.r0, c.hi + (L0 - c.hi) * e, i];
      if (i === 1) return [c.a0, c.r0, L0, i];
      if (i === 2) return [c.a0, c.r0, L0 + (c.hi - L0) * e, i];
      if (i === 3) return [c.a0 + (c.a1 - c.a0) * e, c.r0 + (R1 - c.r0) * e, c.hi, i];
      if (i === 4) return [c.a1, R1, c.hi + (c.lo1 - c.hi) * e, i];
      if (i === 5) return [c.a1, R1, c.lo1, i];
      if (i === 6) return [c.a1, R1, c.lo1 + (c.hi - c.lo1) * e, i];
      return [c.a1 + (c.a0 - c.a1) * e, R1 + (c.r0 - R1) * e, c.hi, i];
    }
    function setCrane(C, a, r, d) { C.top.rotation.y = a; C.trolley.position.x = r; C.hook.position.y = -d; C.rope.scale.y = Math.max(.1, d - .2); C.rope.position.y = -(d - .2) / 2 - .2; }
    // rebar bundles stacked on the staging bearers and laid side by side on the deck: copies of the hook load at those exact
    // poses, so picking one up or setting one down never jumps
    function loadCopyAt(c, a, r, d) {
      setCrane(c.C, a, r, d); c.C.top.updateMatrixWorld(true);
      var cp = c.C.load.clone(); cp.children.forEach(function (o, i) { if (i >= 12) o.visible = false; });
      cp.matrixAutoUpdate = false; cp.matrix.copy(c.C.load.matrixWorld); cp.userData.base = cp.matrix.clone(); cp.userData.eat = 0; scene.add(cp); return cp;
    }
    phases(CY1); if (CY2) phases(CY2);
    var STAGED = [0, 1, 2].map(function (k) { return loadCopyAt(CY1, CY1.a0, CY1.r0, CY1.lo0 - k * BH); });
    var DECK = []; for (var dk2 = 0; dk2 < NSLOT; dk2++) DECK.push(loadCopyAt(CY1, CY1.a1, CY1.r1 + (dk2 - 1.5) * SLOT_DR, CY1.lo1));
    var SGK = kit(); [-1.9, 1.9].forEach(function (o) { SGK.put('matte', BXG(1.3, .22, .3, 40 + Math.sin(CY1.a0) * o, .11, -42 + Math.cos(CY1.a0) * o, 0, CY1.a0, 0), 0x7A5B3A); }); SGK.build(scene, true);
    // start of the story: two bundles already on the deck, one on the hook mid-slew, two left on the staging stack
    var nDel = 2, stN = 2; DECK[2].visible = DECK[3].visible = false; STAGED[2].visible = false;
    CY1.slot = 2; CY1.r1c = CY1.r1 + (2 - 1.5) * SLOT_DR; CY1.t = CY1.ph[0] + CY1.ph[1] + CY1.ph[2] + CY1.ph[3] * .35; CY1.pi = 3;
    if (CY2) { CY2.t = CY2.ph[0] + CY2.ph[1] + CY2.ph[2] * .6; CY2.pi = 2; }
    var _frus = new T.Frustum(), _pm = new T.Matrix4(), _stSph = new T.Sphere(new T.Vector3(40, 1, -42), 4.5);
    var _mA = new T.Matrix4().makeTranslation(0, -.34, 0), _mB = new T.Matrix4().makeTranslation(0, .34, 0), _mS = new T.Matrix4();
    function craneCycle(c, dt, hold) {
      if (!REDUCE && !hold) c.t = (c.t + dt) % c.P;
      c.hold += ((hold ? 1 : 0) - c.hold) * Math.min(1, dt * 1.6);
      var tt = REDUCE ? c.ph[0] + c.ph[1] + c.ph[2] + c.ph[3] * .5 : c.t, pi = phaseAt(c, tt)[0];
      if (c.carry && !REDUCE && pi !== c.pi) {
        if (pi === 0) { if (stN === 0) { STAGED.forEach(function (o) { o.visible = true; }); stN = 3; } c.pickLo = c.lo0 - (stN - 1) * BH; }
        if (pi === 2) { stN = Math.max(0, stN - 1); STAGED[stN].visible = false; }
        if (pi === 3) { c.slot = nDel % NSLOT; c.r1c = c.r1 + (c.slot - 1.5) * SLOT_DR; }
        if (pi === 5) {
          var D = DECK[c.slot]; D.userData.eat = 0; D.matrix.copy(D.userData.base); D.visible = true;
          if (nDel >= NSLOT - 1) { var O = DECK[(nDel + 1) % NSLOT]; if (O.visible) O.userData.eat = .0001; }   // the oldest starts being used
          nDel++;
        }
      }
      c.pi = pi;
      var ps = cyclePose(c, tt), a = ps[0];
      if (c.hold > .001) { var tgt = 2.6; while (tgt - a > Math.PI) tgt -= Math.PI * 2; while (a - tgt > Math.PI) tgt += Math.PI * 2; a += (tgt - a) * ease(c.hold); }
      setCrane(c.C, a, ps[1], ps[2]);
      if (!c.carry) return;
      c.C.load.visible = pi >= 2 && pi <= 4;
      // workers cut and fix the oldest bundle: it flattens into the deck over 45 s, never popping out
      DECK.forEach(function (o) {
        if (!o.userData.eat) return;
        if (!REDUCE) o.userData.eat = Math.min(1, o.userData.eat + dt / 45);
        var sy = Math.max(.001, 1 - ease(o.userData.eat)); _mS.makeScale(1, sy, 1);
        o.matrix.copy(o.userData.base).multiply(_mA).multiply(_mS).multiply(_mB);
        if (o.userData.eat >= 1) { o.visible = false; o.userData.eat = 0; }
      });
      // the staging stack is topped up only while it is off-screen and the hook is away from it
      if (stN < 3 && pi >= 3) { _pm.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse); _frus.setFromProjectionMatrix(_pm); if (!_frus.intersectsSphere(_stSph)) { STAGED.forEach(function (o) { o.visible = true; }); stN = 3; } }
    }
    // camera on T1's jib, looking down at the slab (this is the one the dust blinds)
    // it hangs from a clamp plate across the jib's bottom chords on a drop tube, tilted down at the slab from its joint
    var camMount = new T.Group(); camMount.position.set(6, .37, 0); T1.top.add(camMount);
    var CMK = kit(); CMK.put('metal', BXG(.42, .06, 1.62, 0, 0, 0), 0x5A646E); [-.72, .72].forEach(function (z) { CMK.put('metal', BXG(.5, .14, .06, 0, .02, z), 0x5A646E); }); CMK.put('metal', G(CY(.045, .045, .56, 10), 0, -.3, 0), 0x9AA4AE); CMK.put('metal', BXG(.16, .06, .16, 0, -.56, 0), 0x5A646E); CMK.build(camMount, true);
    var camTilt = new T.Group(); camTilt.position.set(0, -.62, 0); camTilt.rotation.order = 'YXZ'; camTilt.rotation.y = Math.PI / 2; camTilt.rotation.x = 1.0; camMount.add(camTilt);
    add(new T.SphereGeometry(.09, 10, 8), M(0x9AA4AE, { metalness: .65, roughness: .38 }), 0, 0, 0, camTilt);
    var craneCam = CAM(); craneCam.position.set(0, -.26, .25); craneCam.children[0].visible = false; craneCam.children[1].visible = false; camTilt.add(craneCam);
    add(new T.BoxGeometry(.08, .2, .08), M(0x9AA4AE, { metalness: .65, roughness: .38 }), 0, .16, -.25, craneCam);
    var dustM = new T.SpriteMaterial({ color: 0xB9A88E, transparent: true, opacity: 0, depthWrite: false });
    var dust = []; for (var d = 0; d < 14; d++) { var spr = new T.Sprite(dustM); spr.scale.setScalar(1.6 + Math.random() * 1.6); spr.userData.o = new T.Vector3((Math.random() - .5) * 2.2, (Math.random() - .5) * 1.6, (Math.random() - .5) * 2.2); spr.position.copy(spr.userData.o).add(new T.Vector3(6, -.6, 0)); T1.top.add(spr); dust.push(spr); }
    var craneRing = add(new T.RingGeometry(1.4, 1.75, 40), new T.MeshBasicMaterial({ color: 0xD6453D, transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false }), 6, -.6, 0, T1.top);
    // dust that builds up on the lens (station 4): a layer over the glass, a heap on the sunshield, settling grains
    var lensDustM = new T.MeshStandardMaterial({ color: 0xB8A684, roughness: 1, transparent: true, opacity: 0, depthWrite: false });
    var lensDust = add(new T.CircleGeometry(.24, 28), lensDustM, 0, 0, .672, craneCam);
    var heapM = new T.MeshStandardMaterial({ color: 0xC2B08E, roughness: 1, transparent: true, opacity: 0 });
    var heap = add(new T.SphereGeometry(.36, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), heapM, 0, .285, .1, craneCam); heap.scale.set(1, .05, 1.6);
    var NG = MOB ? 50 : 140, grainPos = new Float32Array(NG * 3), GRAINS = [];
    for (var gi = 0; gi < NG; gi++) GRAINS.push({ x: (Math.random() - .5) * 1.2, y: .4 + Math.random() * 2.6, z: (Math.random() - .5) * 1.2, v: .35 + Math.random() * .5, stop: Math.random() * .3 });
    var grainG = new T.BufferGeometry(); grainG.setAttribute('position', new T.BufferAttribute(grainPos, 3));
    var grains = new T.Points(grainG, new T.PointsMaterial({ color: 0xA89676, size: .07, transparent: true, opacity: 0, depthWrite: false })); grains.frustumCulled = false; scene.add(grains);

    /* ---------- pole cameras with coverage cones ---------- */
    var coneM = new T.MeshBasicMaterial({ color: 0x2673B5, transparent: true, opacity: .045, depthWrite: false, side: T.DoubleSide });
    var CONES = [];
    [[-40, 30, .9], [42, 28, -.9], [-42, -20, 1.6], [40, -52, -2.3]].forEach(function (p) {
      cs(add(new T.CylinderGeometry(.12, .15, 8, 10), postM, p[0], 4, p[1]));
      var c = CAM(); c.position.set(p[0], 7.9, p[1]); c.rotation.y = p[2]; c.rotation.x = .45; scene.add(c);
      var cone = new T.Mesh(new T.ConeGeometry(5, 14, 28, 1, true), coneM); cone.position.set(0, 0, 7); cone.rotation.x = -Math.PI / 2;
      var holder = new T.Group(); holder.position.set(p[0], 7.7, p[1]); holder.rotation.y = p[2]; holder.rotation.x = .45; holder.add(cone); scene.add(holder); CONES.push(holder);
    });

    /* ---------- laydown: rebar on bearers, pipe stack, formwork panels, precast segments, sand and aggregate bays ---------- */
    var YK = kit(), TIM = 0x7A5B3A, rebarBars = [], NBUN = MOB ? 3 : 6, hexOff = [];
    // rebar: bundles of bars on timber bearers and dunnage, tied with wire bands
    for (var hr = 0; hr < 4; hr++) for (var hc = 0; hc < 6; hc++) hexOff.push([(hc - 2.5) * .095 + (hr % 2) * .047, hr * .082]);
    for (var bn = 0; bn < NBUN; bn++) {
      var bxp = 25.7 + (bn % 3) * 1.2, byp = .27 + Math.floor(bn / 3) * .45;
      hexOff.forEach(function (o, k) { var j = (k * 37 % 11) * .03; rebarBars.push({ a: [bxp + o[0], byp + o[1], 13.6 + j], b: [bxp + o[0], byp + o[1], 22.4 - j], r: .038 }); });
      [15.5, 18, 20.5].forEach(function (bz) { YK.put('metal', BXG(.64, .34, .03, bxp, byp + .12, bz), 0x2B3036); });
    }
    rodInst(rebarBars, rebarM, 6);
    [14, 22].forEach(function (z) { YK.put('matte', BXG(4.2, .22, .3, 26.9, .11, z), TIM); if (NBUN > 3) YK.put('matte', BXG(4.0, .08, .14, 26.9, .62, z), TIM); });
    // steel pipe stack on chocked bearers; dark bores show at the ends
    for (var pp = 0; pp < 9; pp++) {
      var py = pp < 4 ? 0 : pp < 7 ? 1 : 2, pxx = (pp < 4 ? pp : pp < 7 ? pp - 4 + .5 : pp - 7 + 1), ppx = 36 + pxx * 1.02, ppy = .5 + py * .88 + .16;
      YK.put('metal', G(CY(.5, .5, 8, 18), ppx, ppy, 20, Math.PI / 2), 0x9BA6B1); YK.put('matte', G(CY(.43, .43, 8.04, 16), ppx, ppy, 20, Math.PI / 2), 0x3A4048);
    }
    [17, 23].forEach(function (z) { YK.put('matte', BXG(4.8, .16, .3, 37.5, .08, z), TIM); [-.6, 4.0].forEach(function (o) { YK.put('matte', BXG(.25, .3, .3, 36 + o, .3, z), TIM); }); });
    // formwork panel stacks on bearers
    [[-30, 6], [-26.6, 4]].forEach(function (s) { for (var fp = 0; fp < s[1]; fp++) YK.put('matte', BXG(2.4, .12, 4.8, s[0], .22 + fp * .14, 8), fp % 2 ? 0xD7B98A : 0xCDAE7E); [6.2, 9.8].forEach(function (z) { YK.put('matte', BXG(2.6, .1, .12, s[0], .05, z), TIM); }); });
    // precast: hollow-core planks on dunnage (cores at the ends, lifting loops), wall panels on an A-frame, manhole rings
    for (var hp = 0; hp < (MOB ? 3 : 5); hp++) {
      var hy = .3 + hp * .34;
      YK.put('matte', BXG(1.2, .26, 6, 31, hy, 28), 0xD4D7DA); [26, 30].forEach(function (z) { YK.put('matte', BXG(1.3, .07, .14, 31, hy - .165, z), TIM); });
      if (!MOB) for (var cc = 0; cc < 4; cc++) { YK.put('matte', G(new T.CircleGeometry(.08, 10), 30.58 + cc * .28, hy, 31.005), 0x4A4F54); YK.put('matte', G(new T.CircleGeometry(.08, 10), 30.58 + cc * .28, hy, 24.995, 0, Math.PI), 0x4A4F54); }
      if (hp === (MOB ? 2 : 4)) [26, 30].forEach(function (z) { YK.put('metal', G(new T.TorusGeometry(.09, .02, 6, 12, Math.PI), 31, hy + .13, z), 0x8E99A4); });
    }
    YK.put('metal', ROD([36, 0, 28], [36, 2.6, 28], .06), 0x5A646E); YK.put('metal', ROD([36, 0, 32], [36, 2.6, 32], .06), 0x5A646E); YK.put('metal', ROD([36, 2.6, 27.8], [36, 2.6, 32.2], .06), 0x5A646E);
    [-1, 1].forEach(function (sd) {
      [28, 32].forEach(function (z) { YK.put('metal', ROD([36 + sd * 1.1, 0, z], [36, 2.6, z], .05), 0x5A646E); });
      YK.put('metal', BXG(.4, .1, 4.4, 36 + sd * 1.05, .05, 30), 0x5A646E);
      YK.put('matte', BXG(.18, 2.5, 3.8, 36 + sd * .55, 1.3, 30, 0, 0, -sd * .2), 0xCDD1D4);
    });
    var ringGeo = function () { return new T.LatheGeometry([new T.Vector2(.6, 0), new T.Vector2(.72, 0), new T.Vector2(.72, .9), new T.Vector2(.6, .9), new T.Vector2(.6, 0)], 22); };
    [[41, 26, 0], [42.7, 26, 0], [40.2, 27.7, 0], [41, 26, .9]].forEach(function (rg) { YK.put('matte', G(ringGeo(), rg[0], rg[2], rg[1]), 0xC9CDD1); });
    YK.build(scene, true);
    // sand and aggregate stockpiles in a block-walled bay
    cs(add(heapGeo(3.5, 2.4, .7), M(0xD9C49A, { map: grainTex, roughness: 1 }), -34.4, 0, -6), true);
    cs(add(heapGeo(2.7, 1.8, 2.2), M(0x9C968C, { map: grainTex, roughness: 1 }), -26.8, 0, -8), true);
    add(new T.BoxGeometry(.3, 2, 8), concDark, -30.5, 1, -7);

    /* ---------- site office (stacked cabins) + video wall ---------- */
    var office = new T.Group(); office.position.set(-46, 0, 33.5); scene.add(office);
    // porta-cabins on blocks: ribbed steel skin, corner castings, framed windows with mullions and sills, doors with
    // vision panels, precast steps with handrails, an external stair and landing to the upper cabin, AC units
    var cabSkin = M(0xffffff, { roughness: .5, metalness: .15, map: canvasTex(512, 256, function (x, w, h) { x.fillStyle = '#EEF1F4'; x.fillRect(0, 0, w, h); for (var i = 0; i < w; i += 12) { x.fillStyle = 'rgba(40,60,80,.10)'; x.fillRect(i, 0, 4, h); x.fillStyle = 'rgba(255,255,255,.6)'; x.fillRect(i + 4, 0, 2, h); } }, [3, 1]) });
    var OK = kit(), RZ = .45, CW = 6.1, CHt = 2.6, CD = 2.5, FZ = CD / 2;
    [[0, 0, -2.1], [6.4, 0, 4.3 - 6.4], [3.2, CHt + .1, 2.3]].forEach(function (o) {
      var ccx = o[0], by = RZ + o[1];
      cs(add(new T.BoxGeometry(CW, CHt, CD), cabSkin, ccx, by + CHt / 2, 0, office));
      OK.put('metal', BXG(CW + .08, .14, CD + .08, ccx, by + .07, 0), 0x3A4048); OK.put('paint', BXG(CW + .12, .16, CD + .12, ccx, by + CHt + .08, 0), 0x2673B5);
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c) { OK.put('metal', BXG(.15, CHt, .15, ccx + c[0] * (CW / 2 - .04), by + CHt / 2, c[1] * (CD / 2 - .04)), 0x3A4048); });
      (o[1] ? [-2.0, .0] : [-.3, 1.7]).forEach(function (wx) {
        OK.put('paint', BXG(1.5, 1.0, .06, ccx + wx, by + 1.55, FZ + .02), 0xF7F9FB); OK.put('glass', BXG(1.36, .86, .07, ccx + wx, by + 1.55, FZ + .025), 0x22303D);
        OK.put('paint', BXG(.05, .86, .085, ccx + wx, by + 1.55, FZ + .03), 0xF7F9FB); OK.put('metal', BXG(1.6, .05, .16, ccx + wx, by + 1.02, FZ + .08), 0x9AA4AE);
      });
      var dx = ccx + o[2];
      OK.put('paint', BXG(.95, 2.05, .06, dx, by + 1.06, FZ + .02), 0x5C7186); OK.put('glass', BXG(.4, .5, .07, dx, by + 1.6, FZ + .025), 0x22303D); OK.put('metal', BXG(.12, .04, .05, dx + .32, by + 1.0, FZ + .07), 0xC4CCD3);
      if (!o[1]) { OK.put('paint', BXG(.35, .55, .8, ccx + (ccx ? CW / 2 + .18 : -CW / 2 - .18), by + 1.9, -.3), 0xE9EDF1); [-2.6, 0, 2.6].forEach(function (bxo) { [-.9, .9].forEach(function (bzo) { OK.put('matte', BXG(.5, RZ, .5, ccx + bxo, RZ / 2, bzo), 0x9AA0A6); }); }); }
    });
    [-2.1, 4.3].forEach(function (dx) {
      for (var s = 0; s < 3; s++) OK.put('matte', BXG(1.1, .15, .9 - s * .3, dx, .075 + s * .15, FZ + .45 - s * .15), 0xB3B8BD);
      [-1, 1].forEach(function (sd) { OK.put('metal', ROD([dx + sd * .55, .05, FZ + .88], [dx + sd * .55, 1.0, FZ + .88], .025), 0x9AA4AE); OK.put('metal', ROD([dx + sd * .55, 1.0, FZ + .88], [dx + sd * .55, 1.45, FZ + .06], .025), 0x9AA4AE); });
    });
    var LY = RZ + CHt + .1, LX0 = 4.85, LX1 = 6.15, SX1 = LX1 + LY / .84;   // landing, then a 40° flight down along +x
    OK.put('metal', BXG(LX1 - LX0, .08, 1.0, (LX0 + LX1) / 2, LY - .04, FZ + .5), 0x8E99A4);
    [[LX0, FZ + .05], [LX0, FZ + .95], [LX1, FZ + .95]].forEach(function (p) { OK.put('metal', ROD([p[0], 0, p[1]], [p[0], LY + 1.0, p[1]], .04), 0x6E7378); });
    OK.put('metal', ROD([LX0, LY + 1.0, FZ + .95], [LX1, LY + 1.0, FZ + .95], .025), 0x9AA4AE); OK.put('metal', ROD([LX0, LY + 1.0, FZ + .05], [LX0, LY + 1.0, FZ + .95], .025), 0x9AA4AE);
    [FZ + .1, FZ + .9].forEach(function (sz) { OK.put('metal', ROD([LX1, LY, sz], [SX1, 0, sz], .05, 4), 0x6E7378); });
    OK.put('metal', ROD([LX1, LY + 1.0, FZ + .95], [SX1, 1.0, FZ + .95], .025), 0x9AA4AE);
    for (var tr2 = 1; tr2 < 12; tr2++) { var tf = tr2 / 12; OK.put('metal', BXG(.26, .04, .8, LX1 + (SX1 - LX1) * tf, LY * (1 - tf), FZ + .5), 0x8E99A4); }
    OK.put('metal', BXG(.2, .5, .06, 3.2, LY + CHt + .4, FZ - .1), 0x6E7378); OK.put('metal', BXG(.2, .5, .06, 5.0, LY + CHt + .4, FZ - .1), 0x6E7378);
    OK.build(office, true);
    add(new T.PlaneGeometry(4.8, .8), B(0xffffff, { map: board('SITE OFFICE', { size: 74, h: 150, w: 900 }) }), 4.1, LY + CHt + .6, FZ - .05, office);
    // site control room: a glazed cabin seen through its open front: curved 3x3 wall of bezelled screens,
    // operator console with monitors, chairs and operators, ceiling panels; the span is clear (no column in the room)
    var WALL_POS = new T.Vector3(-30, 0, 22);
    var wallG = new T.Group(); wallG.position.copy(WALL_POS); wallG.rotation.y = .45; scene.add(wallG);
    var RW = 10, RD = 7.5, RH = 5.4, RF = .3;
    var roomM = M(0xF0F2F4, { roughness: .6 }), frameM = M(0x3A4048, { roughness: .4, metalness: .6 });
    var glassM = new T.MeshStandardMaterial({ color: 0xCFE2F2, roughness: .05, metalness: .2, transparent: true, opacity: .16, depthWrite: false, side: T.DoubleSide });
    var rFloorTex = canvasTex(256, 256, function (x, w, h) { x.fillStyle = '#5B636B'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(20,26,32,.55)'; x.lineWidth = 3; for (var i = 0; i <= w; i += 64) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); } }, [5, 4]);
    cs(add(new T.BoxGeometry(RW + .4, RF, RD + .4), concDark, 0, RF / 2, 0, wallG), true);
    add(new T.PlaneGeometry(RW, RD).rotateX(-Math.PI / 2), M(0xffffff, { map: rFloorTex, roughness: .5, metalness: .1 }), 0, RF + .01, 0, wallG);
    cs(add(new T.BoxGeometry(RW, RH, .25), roomM, 0, RF + RH / 2, -RD / 2, wallG));
    [-1, 1].forEach(function (sd) {
      cs(add(new T.BoxGeometry(.25, 1.1, RD), roomM, sd * RW / 2, RF + .55, 0, wallG));
      var gl = add(new T.PlaneGeometry(RD, RH - 1.1), glassM, sd * RW / 2, RF + 1.1 + (RH - 1.1) / 2, 0, wallG); gl.rotation.y = Math.PI / 2;
      for (var mz = -RD / 2; mz <= -RD / 2 + .01; mz += RD) add(new T.BoxGeometry(.12, RH - 1.1, .12), frameM, sd * RW / 2, RF + 1.1 + (RH - 1.1) / 2, mz, wallG);
    });
    cs(add(new T.BoxGeometry(RW + .6, .35, RD + .6), roomM, 0, RF + RH + .17, 0, wallG));
    add(new T.BoxGeometry(RW + .7, .32, .1), M(0x2673B5, { roughness: .5 }), 0, RF + RH + .17, RD / 2 + .32, wallG);
    // front glazing: one clear pane, framed only at its edges
    add(new T.PlaneGeometry(RW, RH), glassM, 0, RF + RH / 2, RD / 2, wallG);
    [-1, 1].forEach(function (sd) { add(new T.BoxGeometry(.16, RH, .16), frameM, sd * RW / 2, RF + RH / 2, RD / 2, wallG); });
    add(new T.BoxGeometry(RW, .14, .16), frameM, 0, RF + RH - .07, RD / 2, wallG); add(new T.BoxGeometry(RW, .1, .16), frameM, 0, RF + .05, RD / 2, wallG);
    // ceiling LED panels
    var ledM = B(0xF7FAFF);
    for (var lr = 0; lr < 3; lr++) for (var lc = 0; lc < 3; lc++) add(new T.BoxGeometry(1.8, .05, .5), ledM, -3 + lc * 3, RF + RH - .03, -2.2 + lr * 2, wallG);
    // curved wall: three columns of three screens, the side columns turned in towards the console
    var SW = 2.1, SH2 = 1.18, VW_Z = -RD / 2 + .45, VW_A = .32, bezM = M(0x15191D, { roughness: .35, metalness: .5 }), scrBackM = M(0x0B0E11, { roughness: .3 }), WALLCOLS = [];
    [-1, 0, 1].forEach(function (j) {
      var cg = new T.Group(), hw = SW / 2 + .04;
      if (j === 0) cg.position.set(0, 0, VW_Z);
      else { cg.position.set(j * (hw + hw * Math.cos(VW_A)), 0, VW_Z + hw * Math.sin(VW_A)); cg.rotation.y = -j * VW_A; }
      add(new T.BoxGeometry(SW + .14, SH2 * 3 + .3, .18), bezM, 0, RF + 1.1 + SH2 * 1.5 + .06, -.08, cg);
      for (var rr = 0; rr < 3; rr++) add(new T.BoxGeometry(SW + .06, SH2 + .04, .06), scrBackM, 0, RF + 1.1 + (2 - rr) * (SH2 + .06) + SH2 / 2, .03, cg);
      wallG.add(cg); WALLCOLS.push(cg);
    });
    // operator console: three desks on an arc, two monitors each, keyboards, chairs; operators seated facing the wall
    var deskM = M(0xDCE1E6, { roughness: .5 }), deskDark = M(0x2B3036, { roughness: .5 }), monM = M(0x15191D, { roughness: .35, metalness: .4 }), trouserM = M(0x2B3036, { roughness: .8 });
    var uiTex = canvasTex(256, 160, function (x, w, h) { x.fillStyle = '#0E1C2A'; x.fillRect(0, 0, w, h); for (var i = 0; i < 6; i++) { x.fillStyle = ['#3E5566', '#4A6272', '#36505F'][i % 3]; x.fillRect(8 + (i % 3) * 82, 22 + Math.floor(i / 3) * 66, 76, 60); } x.fillStyle = '#2673B5'; x.fillRect(0, 0, w, 14); x.fillStyle = '#D6453D'; x.fillRect(w - 40, 3, 30, 8); });
    var monScrM = B(0xffffff, { map: uiTex }), shirtM = M(0x2D4A6B, { roughness: .8 }), skinM = M(0xA9805E, { roughness: .8 }), hairM = M(0x1E1B19, { roughness: .9 });
    var OPS = MOB ? 2 : 3;
    [-1, 0, 1].forEach(function (j, di) {
      var dg = new T.Group(); dg.position.set(j * 2.75, RF, .9 + Math.abs(j) * .55); dg.rotation.y = -j * .28; wallG.add(dg);
      cs(add(new T.BoxGeometry(2.5, .06, .85), deskM, 0, .76, 0, dg)); add(new T.BoxGeometry(2.5, .7, .05), deskDark, 0, .4, -.4, dg);
      [-1.2, 1.2].forEach(function (x) { add(new T.BoxGeometry(.06, .73, .8), deskDark, x, .37, 0, dg); });
      [-.48, .48].forEach(function (x) {
        add(new T.BoxGeometry(.06, .3, .06), monM, x, .94, -.2, dg);
        var mon = add(new T.BoxGeometry(.78, .48, .05), monM, x, 1.3, -.22, dg); mon.rotation.y = -x * .35;
        var scr = add(new T.PlaneGeometry(.72, .42), monScrM, x, 1.3, -.19, dg); scr.rotation.y = -x * .35;
      });
      add(new T.BoxGeometry(.5, .025, .16), deskDark, 0, .8, .12, dg); add(new T.BoxGeometry(.07, .03, .1), deskDark, .4, .8, .14, dg);
      var ch = new T.Group(); ch.position.set(0, 0, .95); dg.add(ch);
      add(new T.CylinderGeometry(.32, .32, .05, 10), deskDark, 0, .06, 0, ch); add(new T.CylinderGeometry(.04, .04, .4, 8), postM, 0, .28, 0, ch);
      add(new T.BoxGeometry(.52, .09, .5), deskDark, 0, .5, 0, ch); add(new T.BoxGeometry(.5, .62, .07), deskDark, 0, .88, .26, ch).rotation.x = -.12;
      if (di < OPS) {
        add(new T.BoxGeometry(.42, .58, .26), shirtM, 0, .86, .08, ch);
        add(new T.SphereGeometry(.13, 12, 10), skinM, 0, 1.32, .02, ch); add(new T.SphereGeometry(.135, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), hairM, 0, 1.35, .04, ch);
        [-1, 1].forEach(function (sd) {
          add(new T.BoxGeometry(.11, .11, .44), shirtM, sd * .2, .86, -.22, ch); add(new T.SphereGeometry(.055, 8, 6), skinM, sd * .17, .84, -.46, ch);
          add(new T.BoxGeometry(.15, .14, .44), trouserM, sd * .1, .56, -.18, ch); add(new T.BoxGeometry(.13, .46, .14), trouserM, sd * .1, .3, -.38, ch);
        });
      }
    });
    add(new T.PlaneGeometry(4.6, .62), B(0xffffff, { map: board('SITE CONTROL ROOM', { size: 70, h: 150, w: 1000 }) }), 0, RF + RH + .17, RD / 2 + .38, wallG);
    function tileTex(kind, label) {
      return canvasTex(512, 300, function (x, w, h) {
        var sky = x.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#D7E3EE'); sky.addColorStop(1, '#B9B2A4'); x.fillStyle = sky; x.fillRect(0, 0, w, h);
        if (kind === 'frame') { x.fillStyle = '#BFC4C9'; for (var i = 0; i < 5; i++) x.fillRect(60, 260 - i * 46, 380, 8); for (var j = 0; j < 6; j++) x.fillRect(60 + j * 74, 70, 10, 200); x.strokeStyle = '#E7C33A'; x.lineWidth = 4; x.beginPath(); x.moveTo(470, 300); x.lineTo(470, 20); x.lineTo(120, 20); x.stroke(); }
        if (kind === 'gate') { x.fillStyle = '#8D8A83'; x.beginPath(); x.moveTo(180, h); x.lineTo(240, 90); x.lineTo(280, 90); x.lineTo(380, h); x.fill(); x.fillStyle = '#F2F4F6'; x.fillRect(220, 160, 90, 100); x.fillStyle = '#D6453D'; x.fillRect(110, 150, 170, 6); }
        if (kind === 'yard') { x.fillStyle = '#C8BEAE'; x.fillRect(0, 120, w, 180); x.fillStyle = '#8A5A3B'; for (var y = 0; y < 3; y++) x.fillRect(60 + y * 30, 200, 22, 70); x.fillStyle = '#9BA6B1'; for (var z = 0; z < 4; z++) { x.beginPath(); x.arc(330 + z * 30, 250, 14, 0, 7); x.fill(); } }
        if (kind === 'crane') { x.strokeStyle = '#E7C33A'; x.lineWidth = 6; x.beginPath(); x.moveTo(0, 60); x.lineTo(w, 60); x.stroke(); x.fillStyle = '#BFC4C9'; x.fillRect(80, 160, 340, 120); }
        x.fillStyle = 'rgba(14,59,102,.88)'; x.fillRect(0, 0, w, 38); x.fillStyle = '#fff'; x.font = '600 22px "Geist Mono", Consolas, monospace'; x.textBaseline = 'middle'; x.fillText(label, 14, 20);
        x.fillStyle = '#D6453D'; x.beginPath(); x.arc(w - 26, 19, 7, 0, 7); x.fill();
      });
    }
    // 3×3 wall of drawn (illustrative) site views
    var TILE_DEF = [['gate', 'GATE · LIVE'], ['frame', 'CORE B · LIVE'], ['crane', 'CRANE T1 · CAM 04'],
      ['yard', 'LAYDOWN · LIVE'], ['frame', 'LEVEL 5 · LIVE'], ['gate', 'GATE · REC 07:58'],
      ['crane', 'CRANE T2 · LIVE'], ['yard', 'PIPE YARD · LIVE'], ['frame', 'LEVEL 3 · LIVE']];
    var TILES = TILE_DEF.map(function (d, i) {
      var tex = tileTex(d[0], d[1]), m = new T.Mesh(new T.PlaneGeometry(3.9, 2.3), B(0xffffff, { map: tex }));
      m.geometry.dispose(); m.geometry = new T.PlaneGeometry(SW, SH2);
      m.position.set(0, RF + 1.1 + (2 - Math.floor(i / 3)) * (SH2 + .06) + SH2 / 2, .065); WALLCOLS[i % 3].add(m); return { m: m, tex: tex };
    });
    var noiseTex = canvasTex(512, 300, function (x, w, h) { noise(x, w, h, '#A8987C', 30000, .55); x.fillStyle = '#D6453D'; x.fillRect(0, 0, w, 38); x.fillStyle = '#fff'; x.font = '700 22px Consolas, monospace'; x.textBaseline = 'middle'; x.fillText('CAM 04 · TAMPER · LENS BLOCKED', 14, 20); });
    var hazeCanvas = document.createElement('canvas'); hazeCanvas.width = 512; hazeCanvas.height = 300; var hazeTex = new T.CanvasTexture(hazeCanvas); hazeTex.encoding = T.sRGBEncoding; var hazeLast = -1;
    function drawHaze(f) {
      var q = Math.round(f * 30); if (q === hazeLast) return; hazeLast = q;
      var x = hazeCanvas.getContext('2d'), base = TILES[2].tex.userData && TILES[2].tex.userData.canvas;
      if (base) x.drawImage(base, 0, 0, 512, 300);
      x.fillStyle = 'rgba(184,166,132,' + (f * .82).toFixed(3) + ')'; x.fillRect(0, 38, 512, 262);
      for (var i = 0; i < f * 900; i++) { x.fillStyle = 'rgba(120,104,80,' + (.25 + Math.random() * .35).toFixed(2) + ')'; x.fillRect(Math.random() * 512, 38 + Math.random() * 262, 2, 2); }
      hazeTex.needsUpdate = true;
    }
    var tlCanvas = document.createElement('canvas'); tlCanvas.width = 1024; tlCanvas.height = 70; var tlTex = new T.CanvasTexture(tlCanvas); tlTex.encoding = T.sRGBEncoding;
    var tl = new T.Mesh(new T.PlaneGeometry(6.2, .36), B(0xffffff, { map: tlTex })); tl.position.set(0, RF + .8, VW_Z + .12); wallG.add(tl);
    function drawTimeline(f, ex) {
      var x = tlCanvas.getContext('2d'), w = tlCanvas.width, h = tlCanvas.height;
      x.fillStyle = '#0E3B66'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(110, 30, w - 230, 10);
      x.fillStyle = '#5A9FD4'; x.fillRect(110, 30, (w - 230) * f, 10);
      x.fillStyle = 'rgba(255,255,255,.3)'; x.fillRect(110 + (w - 230) * .62, 20, (w - 230) * .1, 30);
      x.fillStyle = '#fff'; x.beginPath(); x.arc(110 + (w - 230) * f, 35, 11, 0, 7); x.fill();
      x.font = '700 24px Consolas, monospace'; x.fillText('REC', 18, 44);
      x.fillStyle = ex ? '#9FD0F5' : '#fff'; x.fillText(ex ? 'SAVED' : 'EXPORT', w - 112, 44);
      tlTex.needsUpdate = true;
    }
    drawTimeline(.4, false);
    // three wall tiles show the site photos (illustrative), loaded once
    var TL = new T.TextureLoader();
    [['img/construction-gate-sm.jpg', 0], ['img/construction-site-sm.jpg', 1], ['img/construction-aerial-sm.jpg', 4]].forEach(function (dd) {
      TL.load(dd[0], function (t) { if (dead) { t.dispose(); return; } t.encoding = T.sRGBEncoding; TILES[dd[1]].tex = t; TILES[dd[1]].m.material.map = t; TILES[dd[1]].m.material.needsUpdate = true; });
    });

    /* ---------- vehicles: transit mixers, tipper, excavator ---------- */
    var MIXER = (function () {
      var cab = [[prof([[2.6, .95], [4.6, .95], [4.68, 1.95], [4.4, 3.0], [2.6, 3.05]], 2.32, .05)]];
      var dark = [[bx(2.0, .35, 8.4, 0, .8, -.2), TR], [bx(2.44, .3, .16, 0, .95, 4.7), TR], [bx(2.2, .85, .08, 0, 2.45, 4.52, -.18), GL], [bx(2.42, .72, 1.05, 0, 2.45, 3.6), GL], [bx(1.8, .3, 6, 0, 1.25, -1.2), 0x2B3036]];
      // mirrors on arms, head and tail lights, grille, wheel arches, water and fuel tanks, rear chute and ladder
      [-1, 1].forEach(function (sd) {
        dark.push([bx(.36, .04, .04, sd * 1.32, 2.6, 4.25), TR], [bx(.06, .52, .24, sd * 1.52, 2.45, 4.25), TR], [bx(.04, .44, .18, sd * 1.555, 2.45, 4.25), 0x8FA3B5]);
        dark.push([bx(.36, .18, .05, sd * .82, 1.3, 4.79), LITE], [bx(.2, .12, .05, sd * 1.0, 1.0, -4.42), 0xD6453D]);
        dark.push([bx(.48, .1, 1.3, sd * 1.02, 1.12, 3.5), TR], [bx(.48, .1, 2.8, sd * 1.02, 1.12, -2.5), TR], [bx(.05, .22, 2.8, sd * 1.25, 1.02, -2.5), TR]);
        dark.push([bx(.05, 2.3, .05, sd * .3, 1.95, -4.3), RIM]);
      });
      dark.push([bx(1.1, .5, .05, 0, 1.6, 4.78), 0x1B2126], [new T.CylinderGeometry(.36, .36, 1.9, 14).rotateZ(Math.PI / 2).translate(0, 1.75, 2.15), LITE]);
      dark.push([new T.CylinderGeometry(.28, .28, 1.1, 12).rotateX(Math.PI / 2).translate(1.05, .78, 1.0), RIM], [bx(.55, .08, 1.3, 0, 1.55, -4.75, .45), 0x8E99A4]);
      for (var rg = 0; rg < 6; rg++) dark.push([bx(.6, .04, .04, 0, 1.0 + rg * .36, -4.3), RIM]);
      // cab steps and grab handles, exhaust stack, roof beacon, mud flaps, drum pedestals, charging hopper
      [-1, 1].forEach(function (sd) {
        dark.push([bx(.4, .05, .34, sd * 1.1, .55, 2.75), RIM], [bx(.4, .05, .34, sd * 1.1, .88, 2.75), RIM], [bx(.04, .8, .04, sd * 1.2, 2.0, 2.66), RIM]);
        dark.push([bx(.5, .5, .03, sd * 1.0, .55, -3.85), TY], [bx(.15, 1.05, .15, sd * .75, 1.6, -3.3), TR]);
      });
      dark.push([new T.CylinderGeometry(.07, .07, 1.7, 8).translate(.95, 2.95, 2.45), TR], [new T.CylinderGeometry(.1, .12, .18, 10).translate(.55, 3.14, 3.3), 0xF2A33A]);
      dark.push([bx(1.0, 1.05, .4, 0, 1.7, .95), TR], [bx(1.65, .15, .3, 0, 2.1, -3.3), TR], [new T.CylinderGeometry(.55, .22, .6, 14).translate(0, 3.7, -4.3), 0x9BA6B1]);
      wheelSet(dark, .5, .34, 2.45, [3.5, -1.8, -3.2]);
      return { cab: merge(cab), dark: merge(dark) };
    })();
    function mixerGroup(col) {
      var g = new T.Group();
      var c = new T.Mesh(MIXER.cab, paintM.clone()); c.material.color.setHex(col); g.add(cs(c)); g.add(cs(new T.Mesh(MIXER.dark, darkM)));
      var drumG = new T.Group(); drumG.position.set(0, 2.65, -1.2); drumG.rotation.x = -.18; g.add(drumG);
      var drumTex = canvasTex(256, 64, function (x, w, h) { x.fillStyle = '#F2F4F6'; x.fillRect(0, 0, w, h); x.fillStyle = '#2673B5'; for (var i = 0; i < w; i += 64) { x.save(); x.translate(i, 0); x.rotate(.5); x.fillRect(0, -20, 18, 120); x.restore(); } });
      var drum = new T.Mesh(new T.CylinderGeometry(1.15, 1.3, 4.2, 22, 1).rotateX(Math.PI / 2), M(0xffffff, { map: drumTex, roughness: .4, metalness: .25 })); drumG.add(cs(drum));
      var tail = new T.Mesh(new T.ConeGeometry(1.15, 1.4, 22).rotateX(-Math.PI / 2), M(0xF2F4F6, { roughness: .4 })); tail.position.z = -2.75; drumG.add(cs(tail));
      add(new T.BoxGeometry(.5, .2, 1.6), M(0x9BA6B1, { metalness: .6 }), 0, -.6, -4.0, drumG).rotation.x = .5;
      [-1.1, 1.1].forEach(function (z) { add(new T.TorusGeometry(1.24, .05, 6, 28), M(0x9BA6B1, { metalness: .6 }), 0, 0, z, drumG); });   // drum rollers rings
      plates(g, 4.79, .95, -4.43, 1.0);
      g.userData.drum = drum; scene.add(g); return g;
    }
    // the second mixer waits in its own bay, clear of the turning and reversing space
    var mixer = mixerGroup(0xF0F0EE), mixer2 = MOB ? null : mixerGroup(0xE58A2B);
    if (mixer2) mixer2.position.set(-12.5, 0, -1);
    // tipper: chassis, cab with glass, mirrors and beacon, six wheels under arches, body on a rear hinge with a hydraulic ram
    var dumper = new T.Group(); scene.add(dumper);
    var dYel = M(0xE7B53A, { roughness: .45 }), dDark = M(0x2B3036, { roughness: .6 }), dGlass = new T.MeshStandardMaterial({ color: 0x5C7890, roughness: .05, metalness: .3, transparent: true, opacity: .38, depthWrite: false, side: T.DoubleSide });
    cs(add(new T.BoxGeometry(1.9, .38, 7.2), dDark, 0, .98, -.4, dumper));
    cs(add(new T.BoxGeometry(2.3, .7, 1.75), dYel, 0, 1.625, 2.25, dumper)); cs(add(new T.BoxGeometry(2.3, .85, .1), dYel, 0, 2.4, 1.43, dumper));
    [[-1.1, 3.08], [1.1, 3.08], [-1.1, 1.43], [1.1, 1.43]].forEach(function (pp2) { add(new T.BoxGeometry(.1, .85, .1), dYel, pp2[0], 2.4, pp2[1], dumper); });
    var DRK = kit(); driver(DRK, -.5, 1.85, 2.3, true); DRK.put('matte', BXG(.5, .1, .5, -.5, 1.8, 2.25), 0x1E2328); DRK.put('matte', BXG(.5, .55, .1, -.5, 2.1, 1.97), 0x1E2328); DRK.put('matte', BXG(2.1, .3, .3, 0, 2.05, 2.9), 0x23282D); DRK.build(dumper, true);
    add(new T.BoxGeometry(2.36, .08, 1.82), dDark, 0, 2.86, 2.25, dumper);
    add(new T.PlaneGeometry(2.0, .78), dGlass, 0, 2.38, 3.13, dumper);
    [-1, 1].forEach(function (sd) {
      add(new T.PlaneGeometry(1.2, .7), dGlass, sd * 1.16, 2.38, 2.35, dumper).rotation.y = sd * Math.PI / 2;
      add(new T.BoxGeometry(.36, .04, .04), dDark, sd * 1.32, 2.5, 2.95, dumper); add(new T.BoxGeometry(.06, .46, .22), dDark, sd * 1.52, 2.4, 2.95, dumper);
      add(new T.BoxGeometry(.34, .16, .04), B(0xF4F6F8), sd * .78, 1.45, 3.14, dumper);
      add(new T.BoxGeometry(.18, .12, .04), B(0xD6453D), sd * .9, 1.0, -4.02, dumper);
      add(new T.BoxGeometry(.5, .1, 1.4), dDark, sd * .98, 1.28, 2.25, dumper); add(new T.BoxGeometry(.5, .1, 2.9), dDark, sd * .98, 1.28, -2.35, dumper);
    });
    add(new T.BoxGeometry(1.2, .5, .04), M(0x1B2126), 0, 1.65, 3.14, dumper);
    cs(add(new T.BoxGeometry(2.5, .3, .22), dDark, 0, .92, 3.25, dumper));
    var beacon = add(new T.CylinderGeometry(.1, .12, .18, 10), B(0xF2A33A), .7, 2.99, 2.0, dumper);
    var DW = [];
    [2.25, -1.7, -3.0].forEach(function (z) { [-1, 1].forEach(function (sd) {
      DW.push(add(new T.CylinderGeometry(.58, .58, .48, 18).rotateZ(Math.PI / 2), M(0x131619, { roughness: .9 }), sd * 1.0, .58, z, dumper));
      add(new T.CylinderGeometry(.3, .3, .5, 10).rotateZ(Math.PI / 2), M(0xB4BCC4, { metalness: .6, roughness: .35 }), sd * 1.0, .58, z, dumper);
    }); });
    var tipG = new T.Group(); tipG.position.set(0, 1.25, -3.85); dumper.add(tipG);
    cs(add(new T.BoxGeometry(2.5, .12, 4.9), dYel, 0, .1, 2.45, tipG));
    [-1, 1].forEach(function (sd) { cs(add(new T.BoxGeometry(.1, 1.15, 4.9), dYel, sd * 1.25, .72, 2.45, tipG)); for (var rb = 0; rb < 4; rb++) add(new T.BoxGeometry(.06, 1.1, .1), dDark, sd * 1.31, .72, .6 + rb * 1.2, tipG); });
    cs(add(new T.BoxGeometry(2.5, 1.5, .12), dYel, 0, .85, 4.9, tipG)); add(new T.BoxGeometry(2.5, .1, .9), dYel, 0, 1.6, 5.3, tipG);
    cs(add(new T.BoxGeometry(2.5, 1.05, .1), dYel, 0, .66, .02, tipG));
    var dLoad = add(new T.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0x8C7E68, { roughness: 1 }), 0, .9, 2.45, tipG); dLoad.scale.set(1.12, .55, 2.3);
    var ram = add(new T.CylinderGeometry(.1, .1, 1, 10), M(0xC4CCD3, { metalness: .8, roughness: .2 }), 0, 0, 0, dumper), RAM_B = new T.Vector3(0, 1.1, -1.05), _ra = new T.Vector3();
    function setTip(a) {
      tipG.rotation.x = -a; _ra.set(0, 1.25 + Math.sin(a) * 2.6, -3.85 + Math.cos(a) * 2.6);
      var L = Math.max(.2, _ra.distanceTo(RAM_B)); ram.position.copy(_ra).add(RAM_B).multiplyScalar(.5); ram.scale.set(1, L, 1);
      ram.quaternion.setFromUnitVectors(up, _ra.sub(RAM_B).normalize());
    }
    setTip(0);
    // tipper detail: exhaust stack, fuel and air tanks, cab steps, sun visor, mud flaps, hub caps, plates
    var TPK = kit();
    TPK.put('metal', G(CY(.08, .08, 1.5, 8), -.95, 3.0, 1.3), TR); TPK.put('metal', G(CY(.1, .08, .2, 8), -.95, 3.8, 1.3), TR);
    TPK.put('metal', G(CY(.3, .3, 1.1, 14), 1.05, .95, .4, Math.PI / 2), 0xB4BCC4); TPK.put('metal', G(CY(.2, .2, .8, 12), -1.0, .9, .4, Math.PI / 2), 0x5A646E);
    TPK.put('metal', BXG(2.24, .07, .32, 0, 2.86, 3.2), 0x2B3036);
    [-1, 1].forEach(function (sd) {
      TPK.put('metal', BXG(.42, .05, .3, sd * 1.12, .62, 1.45), RIM); TPK.put('metal', BXG(.42, .05, .3, sd * 1.12, .95, 1.45), RIM); TPK.put('metal', BXG(.04, .7, .04, sd * 1.18, 1.9, 1.36), RIM);
      TPK.put('matte', BXG(.5, .5, .03, sd * 1.0, .55, -3.7), TY);
      [2.25, -1.7, -3.0].forEach(function (z) { TPK.put('metal', G(CY(.12, .12, .52, 8), sd * 1.0, .58, z, 0, 0, Math.PI / 2), TR); });
    });
    TPK.build(dumper, true);
    plates(dumper, 3.37, .92, -4.05, .98);
    // excavator: tracks with sprockets, idlers and rollers, slewing house with counterweight, cab glass and frames, boom and stick rams, hoses, toothed bucket
    var exc = new T.Group(); exc.position.set(16, 0, -6); scene.add(exc);
    var trackTex2 = canvasTex(64, 256, function (x, w, h) { x.fillStyle = '#24292E'; x.fillRect(0, 0, w, h); x.fillStyle = '#3A4048'; for (var y = 0; y < h; y += 16) x.fillRect(0, y, w, 6); }, [1, 3]);
    var trkM = M(0xffffff, { map: trackTex2, roughness: .9 }), steelEx = M(0x8E99A4, { metalness: .6 });
    [-1.4, 1.4].forEach(function (x) {
      cs(add(new T.BoxGeometry(.9, .9, 4.0), trkM, x, .45, 0, exc));
      [-2.0, 2.0].forEach(function (z) { cs(add(new T.CylinderGeometry(.45, .45, .9, 16).rotateZ(Math.PI / 2), M(0x24292E, { roughness: .9 }), x, .45, z, exc)); add(new T.CylinderGeometry(.28, .28, .94, 12).rotateZ(Math.PI / 2), steelEx, x, .45, z, exc); });
      for (var rr = -1.2; rr <= 1.21; rr += .8) add(new T.CylinderGeometry(.16, .16, .95, 10).rotateZ(Math.PI / 2), steelEx, x, .2, rr, exc);
      add(new T.BoxGeometry(.5, .2, 3.4), M(0x2B3036), x, .7, 0, exc);
    });
    add(new T.BoxGeometry(2, .4, 2.2), M(0x2B3036), 0, .95, 0, exc);
    var yel2 = M(0xE7B53A, { roughness: .45 }), hoseM = M(0x131619, { roughness: .7 }), chromeM = M(0xC4CCD3, { metalness: .8, roughness: .2 });
    var house = new T.Group(); house.position.y = 1.15; exc.add(house);
    function pileMat(c) { return M(c, { map: grainTex, roughness: 1 }); }
    cs(add(new T.BoxGeometry(3, 1.2, 3.4), yel2, 0, .7, -.5, house));
    cs(add(new T.BoxGeometry(3, 1.0, 1.0), M(0x2B3036, { roughness: .6 }), 0, .6, -2.4, house));
    cs(add(new T.BoxGeometry(1.3, .45, 1.4), yel2, -.75, 1.425, .7, house)); cs(add(new T.BoxGeometry(1.36, .1, 1.46), yel2, -.75, 2.75, .7, house)); add(new T.BoxGeometry(1.3, 1.1, .08), yel2, -.75, 2.15, .04, house);
    add(new T.BoxGeometry(1.34, 1.1, 1.44), new T.MeshStandardMaterial({ color: 0x5C7890, roughness: .05, metalness: .3, transparent: true, opacity: .36, depthWrite: false }), -.75, 2.15, .7, house);
    var XDK = kit(); driver(XDK, -.75, 1.75, .55, false); XDK.put('matte', BXG(.5, .1, .5, -.75, 1.7, .5), 0x1E2328); XDK.put('matte', BXG(.5, .6, .1, -.75, 2.0, .22), 0x1E2328); XDK.build(house, true);
    [[-1.41, .02], [-.09, .02], [-.75, .7]].forEach(function (f, k) { add(new T.BoxGeometry(k < 2 ? .07 : 1.36, k < 2 ? 1.12 : .07, k < 2 ? 1.46 : .07), M(0x2B3036), f[0], 2.15, k < 2 ? .7 : 1.43, house); });   // window frames
    add(new T.BoxGeometry(.3, .1, .14), B(0xF4F6F8), -.75, 2.85, 1.35, house);   // work light
    add(new T.CylinderGeometry(.07, .07, .8, 8), M(0x2B3036), .9, 1.7, -1.6, house);
    [.2, 1.4].forEach(function (x) { add(new T.CylinderGeometry(.03, .03, 2.2, 6).rotateX(Math.PI / 2), M(0xE9EEF2), x, 1.55, -.9, house); });   // handrails
    // boom, stick and bucket are profiled plate sections on pins; their rams are drawn between the real pin points every frame
    var bm = new T.Group(); bm.position.set(.7, 1.3, 1.0); house.add(bm);
    cs(add(prof([[-.3, .28], [2.2, .88], [4.62, .22], [4.62, -.24], [2.2, .32], [-.24, -.36]], .52, .02), yel2, 0, 0, 0, bm));
    var armG = new T.Group(); armG.position.set(0, 0, 4.4); bm.add(armG);
    cs(add(prof([[-.62, .58], [-.28, .74], [3.3, .17], [3.32, -.17], [.3, -.32], [-.52, .16]], .42, .02), yel2, 0, 0, 0, armG));
    var bucketG = new T.Group(); bucketG.position.set(0, 0, 3.2); armG.add(bucketG);
    var bkM = M(0x2B3036, { roughness: .6, metalness: .3 });
    cs(add(prof([[-.26, .2], [.22, .24], [.58, -.12], [.78, -.74], [.6, -1.02], [.12, -1.04], [-.28, -.7], [-.36, -.2]], 1.1, .02), bkM, 0, 0, 0, bucketG));
    var BKK = kit();
    for (var tth = -.42; tth <= .43; tth += .21) BKK.put('metal', G(new T.ConeGeometry(.055, .26, 6), tth, -1.0, .78, 2.2), 0x9AA4AE);
    BKK.put('metal', BXG(1.14, .06, .12, 0, -1.0, .64, .3), 0x9AA4AE);                                   // cutting edge
    [-1, 1].forEach(function (sd) { BKK.put('metal', BXG(.06, .4, .3, sd * .3, .3, -.05), 0x3A4048); });   // lugs
    BKK.build(bucketG, true);
    var spoil = add(heapGeo(.42, .32, 2.7), pileMat(0x8C7E68), 0, .05, .2, bucketG); spoil.scale.set(1.25, 1, 1); spoil.visible = false;
    // pins (chrome) at boom foot, stick and bucket joints
    [[bm, 0, 0], [armG, 0, 0], [bucketG, 0, 0]].forEach(function (pn) { add(new T.CylinderGeometry(.11, .11, .62, 12).rotateZ(Math.PI / 2), chromeM, 0, pn[1], pn[2], pn[0]); });
    // hydraulic ram: barrel fixed at pin A on the parent link, chrome rod from pin B, both on the A-B line
    var RAMS = [], _ra3 = new T.Vector3(), _rb3 = new T.Vector3(), _rd3 = new T.Vector3();
    function ramPair(parent, x, rb, rr, lb, lr) {
      var bar = add(new T.CylinderGeometry(rb, rb, 1, 10).translate(0, .5, 0), yel2, 0, 0, 0, parent), rod = add(new T.CylinderGeometry(rr, rr, 1, 8).translate(0, .5, 0), chromeM, 0, 0, 0, parent);
      bar.scale.y = lb; rod.scale.y = lr; cs(bar); var r = { bar: bar, rod: rod, x: x }; RAMS.push(r); return r;
    }
    function rotYZ(y, z, a, oy, oz, out) { out.set(0, oy + y * Math.cos(a) - z * Math.sin(a), oz + y * Math.sin(a) + z * Math.cos(a)); return out; }
    function setRam(r, ay, az, by, bz) {
      _ra3.set(r.x, ay, az); _rb3.set(r.x, by, bz); _rd3.subVectors(_rb3, _ra3).normalize();
      r.bar.position.copy(_ra3); r.bar.quaternion.setFromUnitVectors(up, _rd3); r.rod.position.copy(_rb3); r.rod.quaternion.setFromUnitVectors(up, _rd3.negate());
    }
    var ramBoomL = ramPair(house, .42, .12, .07, 1.6, 1.5), ramBoomR = ramPair(house, .98, .12, .07, 1.6, 1.5);
    var ramStick = ramPair(bm, 0, .11, .065, 1.55, 1.4), ramBkt = ramPair(armG, 0, .09, .055, 1.6, 1.4);
    var hoseL = [-1, 1].map(function (sd) { return add(new T.CylinderGeometry(.03, .03, 4.3, 6).rotateX(Math.PI / 2), hoseM, sd * .28, .5, 2.2, bm); });
    function updRams() {
      var b = bm.rotation.x, a = armG.rotation.x, k = bucketG.rotation.x, P = _np, Q = tmpB;
      rotYZ(-.2, 1.9, b, 1.3, 1.0, P); setRam(ramBoomL, .45, .25, P.y, P.z); setRam(ramBoomR, .45, .25, P.y, P.z);   // house → boom underside
      rotYZ(.6, -.52, a, 0, 4.4, Q); setRam(ramStick, .92, 2.2, Q.y, Q.z);                                         // boom knee → stick tail
      rotYZ(.42, -.18, k, 0, 3.2, P); setRam(ramBkt, .6, .55, P.y, P.z);                                          // stick top → bucket lever
    }
    // excavator detail: mirrors, beacon, work lamp, engine grille, boom-foot pin, steps and track guards, plate on the counterweight
    var EK = kit();
    EK.put('metal', BXG(.04, .55, .04, -1.45, 2.3, 1.38), 0x2B3036); EK.put('glass', BXG(.05, .3, .2, -1.48, 2.65, 1.42), 0x8FA3B5);
    EK.put('metal', BXG(.04, .9, .04, 1.45, 1.6, .95), 0x2B3036); EK.put('glass', BXG(.05, .3, .2, 1.48, 2.15, 1.0), 0x8FA3B5);
    EK.put('paint', G(CY(.09, .11, .16, 10), -.35, 2.88, .3), 0xF2A33A);
    for (var gs = -.9; gs <= 1.0; gs += .25) EK.put('metal', BXG(.08, .03, 1.0, gs, 1.31, -1.5), 0x23282D);
    EK.put('metal', G(CY(.13, .13, .75, 12), .7, 1.3, 1.0, 0, 0, Math.PI / 2), 0xC4CCD3);
    EK.put('metal', BXG(.5, .05, .3, -1.6, .35, 1.0), 0x8E99A4);
    EK.build(house, true);
    var EK2 = kit(); [-1.4, 1.4].forEach(function (x) { EK2.put('metal', BXG(.95, .06, 3.1, x, .93, 0), 0x2B3036); EK2.put('metal', G(CY(.2, .2, .96, 10), x, .45, 1.6, 0, 0, Math.PI / 2), 0x3A4048); }); EK2.build(exc, true);
    var pileM = function (c) { return M(c, { map: grainTex, roughness: 1 }); };
    cs(add(heapGeo(2.1, 1.5, 1.3), pileM(0xB2A58E), 22.5, 0, 3.5), true);    // spoil heap
    add(puddleGeo(4.4), decal(M(0x8C7E68, { roughness: 1 }), 6), 18.4, .045, .6).scale.set(2.2, 1, 1.9);   // the dig
    cs(add(heapGeo(2.4, 1.4, 4.1), pileM(0x9C8F78), 46.6, 0, -10.5), true);   // tipping heap
    add(new T.PlaneGeometry(24, 28).rotateX(-Math.PI / 2), gravelM(2, 4, 6.5), 34, .026, -4);                      // haul loop for the tipper
    add(new T.PlaneGeometry(9, 12).rotateX(-Math.PI / 2), gravelM(3, 1.6, 2.8), -9.5, .029, 2);                        // pour bay

    /* ---------- walkways: green footpaths with edge lines, a zebra crossing over the haul road, bollards, sign ---------- */
    var walkM = decal(new T.MeshStandardMaterial({ color: 0x3FA36B, roughness: .7, transparent: true, opacity: .62, depthWrite: false }), 10), edgeM = decal(B(0xF4F6F8), 11);
    function walkway(x0, z0, x1, z1) {
      var len = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(x1 - x0, z1 - z0), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
      add(new T.PlaneGeometry(1.3, len).rotateX(-Math.PI / 2), walkM, mx, .05, mz).rotation.y = a;
      [-1, 1].forEach(function (sd) { add(new T.PlaneGeometry(.08, len).rotateX(-Math.PI / 2), edgeM, mx + Math.cos(a) * .69 * sd, .055, mz - Math.sin(a) * .69 * sd).rotation.y = a; });
    }
    walkway(-20.65, -14.3, 9, -14.3); walkway(-20, -14.95, -20, 30.65); walkway(-20.65, 30, -6.6, 30); walkway(6.6, 30, 9.65, 30); walkway(9, 30.65, 9, 34.8);
    for (var zx = -5.6; zx <= 5.61; zx += .8) add(new T.PlaneGeometry(.45, 2.4).rotateX(-Math.PI / 2), edgeM, zx, .052, 30);
    add(new T.PlaneGeometry(3, .3).rotateX(-Math.PI / 2), edgeM, -3, .052, 32.6); add(new T.PlaneGeometry(3, .3).rotateX(-Math.PI / 2), edgeM, 3.5, .052, 27.4);
    [[-6.9, 28.9], [-6.9, 31.1], [6.9, 28.9], [6.9, 31.1]].forEach(function (b) { cs(add(new T.CylinderGeometry(.14, .14, 1.0, 10), M(0xE7B53A, { roughness: .45 }), b[0], .5, b[1])); add(new T.CylinderGeometry(.145, .145, .1, 10), B(0x1B2732), b[0], .78, b[1]); });
    add(new T.CylinderGeometry(.05, .05, 2.4, 8), postM, -7.8, 1.2, 32.4);
    add(new T.PlaneGeometry(1.6, .5), B(0xffffff, { map: board('CROSSING · STOP', { size: 70, h: 150, w: 520 }) }), -7.8, 2.3, 32.43);

    /* ---------- workers: hard hat with brim, hi-vis vest with reflective bands, belt, sleeves, gloves, two legs and boots ---------- */
    var NW = MOB ? 9 : 22, eul = new T.Euler(), ONE = new T.Vector3(1, 1, 1), XAX = new T.Vector3(1, 0, 0);
    function IM(g, m, n) { var o = new T.InstancedMesh(g, m, n); scene.add(o); return o; }
    var vestI = IM(new T.BoxGeometry(.48, .46, .3), M(0xF07A1F, { roughness: .7, emissive: 0x3a1500 }), NW);
    var shirtI = IM(new T.BoxGeometry(.43, .6, .26), M(0x2D4A6B, { roughness: .8 }), NW);
    var stripeI = IM(new T.BoxGeometry(.49, .05, .31), B(0xE9EEF2), NW * 2);
    var braceI = IM(new T.BoxGeometry(.055, .44, .315), B(0xE9EEF2), NW * 2), neckI = IM(new T.BoxGeometry(.1, .1, .1), M(0xA9805E, { roughness: .8 }), NW);
    var beltI = IM(new T.BoxGeometry(.46, .08, .28), M(0x3A2E22, { roughness: .8 }), NW);
    var legI = IM(new T.BoxGeometry(.17, .8, .2), M(0x24344A, { roughness: .8 }), NW * 2);
    var bootI = IM(new T.BoxGeometry(.19, .13, .32), M(0x2B2118, { roughness: .7 }), NW * 2);
    var armI = IM(new T.BoxGeometry(.12, .56, .12), M(0x2D4A6B, { roughness: .8 }), NW * 2);
    var gloveI = IM(new T.BoxGeometry(.12, .12, .13), M(0xD9B84A, { roughness: .8 }), NW * 2);
    var headI = IM(new T.SphereGeometry(.15, 12, 10), M(0xA9805E, { roughness: .8 }), NW);
    var hatI = IM(new T.SphereGeometry(.19, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0xFFFFFF, { roughness: .35 }), NW);
    var brimI = IM(new T.CylinderGeometry(.25, .25, .03, 16), M(0xFFFFFF, { roughness: .35 }), NW);
    var WPARTS = [vestI, shirtI, stripeI, braceI, neckI, beltI, legI, bootI, armI, gloveI, headI, hatI, brimI];
    cs(vestI); cs(legI); cs(shirtI);
    // walkers keep to the footpaths; workers at a task stand clear of the vehicles
    var GPATHS = [[[-19.5, -14.3], [8.5, -14.3]], [[-20, -13.8], [-20, 29.4]], [[-19.4, 30], [8.4, 30], [9, 30.6], [9, 34.2]]];
    var SPATHS = [-35.5, -28.5, -21.5].map(function (z) { return [[-8.5, z], [-1, z]]; });
    var TASKS = [[-8.4, -3.8, 0, 1.4], [-27.6, 10.6, 0, -1.6], [24.9, 17, 0, 1.57], [-14, -30, TOPY + .16, .4], [-5.5, -40.5, TOPY + .16, 2.2], [-3, -23.2, TOPY + .16, -.8]];
    function mkPath(pts) { var L = [0]; for (var k = 1; k < pts.length; k++) L.push(L[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1])); return { pts: pts, L: L, len: L[L.length - 1] }; }
    var WK = [], nTask = MOB ? 2 : TASKS.length, nSlab = MOB ? 2 : 6;
    for (var wi = 0; wi < NW; wi++) {
      var w = { ph: Math.random() * 6, hat: wi % 3 === 0 ? 0xFFD23A : wi % 5 === 1 ? 0x2673B5 : 0xFFFFFF, x: 0, z: 0, ry: 0, moving: false, wait: 0, dir: wi % 2 ? 1 : -1 };
      if (wi < nTask) { var tk = TASKS[wi]; w.work = true; w.x = tk[0]; w.z = tk[1]; w.y = tk[2]; w.ry = tk[3]; }
      else if (wi < nTask + nSlab) { w.path = mkPath(SPATHS[wi % 3]); w.y = TOPY + .16; w.ground = false; }
      else { var gi2 = wi - nTask - nSlab; w.path = mkPath(GPATHS[gi2 < 3 ? 2 : gi2 % 3]); w.y = 0; w.ground = true; }
      if (w.path) { w.s = Math.random() * w.path.len; w.sp = 1.0 + Math.random() * .35; }
      WK.push(w);
    }
    WK.forEach(function (w, i) { hatI.setColorAt(i, col.setHex(w.hat)); brimI.setColorAt(i, col.setHex(w.hat)); });
    function pathAt(pa, s, out) {
      s = Math.max(0, Math.min(pa.len, s));
      for (var k = 1; k < pa.pts.length; k++) if (s <= pa.L[k] + 1e-6) { var f = (s - pa.L[k - 1]) / Math.max(1e-6, pa.L[k] - pa.L[k - 1]), a = pa.pts[k - 1], b = pa.pts[k]; out.set(a[0] + (b[0] - a[0]) * f, 0, a[1] + (b[1] - a[1]) * f); return Math.atan2(b[0] - a[0], b[1] - a[1]); }
      out.set(pa.pts[pa.pts.length - 1][0], 0, pa.pts[pa.pts.length - 1][1]); return 0;
    }
    var _qb = new T.Quaternion(), _qy = new T.Quaternion(), _ql = new T.Quaternion(), _hp = new T.Vector3(), _jp = new T.Vector3(), _op = new T.Vector3();
    function putI(I, idx, base, qq, x, y, z, qrot) { _op.set(x, y, z).applyQuaternion(qq).add(base); m4.compose(_op, qrot || qq, ONE); I.setMatrixAt(idx, m4); }
    function limb(I, idx, base, qq, jx, jy, sw, len, end) {
      _jp.set(jx, jy, 0).applyQuaternion(qq).add(base); _ql.setFromAxisAngle(XAX, sw).premultiply(qq);
      _op.set(0, -len / 2, 0).applyQuaternion(_ql).add(_jp); m4.compose(_op, _ql, ONE); I.setMatrixAt(idx * 2 + (jx > 0 ? 1 : 0), m4);
      if (end) { _op.set(0, -len + .005, end[1]).applyQuaternion(_ql).add(_jp); m4.compose(_op, _ql, ONE); end[0].setMatrixAt(idx * 2 + (jx > 0 ? 1 : 0), m4); }
    }
    function drawWorker(i, x, y, z, ry, lean, walk, armSw) {
      _qy.setFromAxisAngle(up, ry); _qb.setFromEuler(eul.set(lean, ry, 0, 'YXZ'));
      var bob = walk ? Math.abs(Math.sin(time * 7 + i)) * .04 : 0; _hp.set(x, y + .86 + bob, z);
      var ls = walk ? Math.sin(time * 7 + i) * .45 : 0;
      limb(legI, i, _hp, _qy, -.1, 0, ls, .8, [bootI, .06]); limb(legI, i, _hp, _qy, .1, 0, -ls, .8, [bootI, .06]);
      putI(shirtI, i, _hp, _qb, 0, .3, 0); putI(vestI, i, _hp, _qb, 0, .33, 0); putI(beltI, i, _hp, _qb, 0, .03, 0);
      putI(stripeI, i * 2, _hp, _qb, 0, .22, 0); putI(stripeI, i * 2 + 1, _hp, _qb, 0, .42, 0);
      putI(braceI, i * 2, _hp, _qb, -.12, .33, 0); putI(braceI, i * 2 + 1, _hp, _qb, .12, .33, 0); putI(neckI, i, _hp, _qb, 0, .64, 0);
      putI(headI, i, _hp, _qb, 0, .78, 0); putI(hatI, i, _hp, _qb, 0, .84, 0); putI(brimI, i, _hp, _qb, 0, .84, .02);
      limb(armI, i, _hp, _qb, -.29, .56, armSw[0], .56, [gloveI, 0]); limb(armI, i, _hp, _qb, .29, .56, armSw[1], .56, [gloveI, 0]);
    }
    // zone around the excavator's swing radius (station 5) and the person who walks into it
    var ZC = new T.Vector3(16, .08, -6), ZR = 8.6, zonePts = [];
    for (var zi2 = 0; zi2 <= 72; zi2++) { var za = zi2 / 72 * Math.PI * 2; zonePts.push(new T.Vector3(ZC.x + Math.cos(za) * ZR, .1, ZC.z + Math.sin(za) * ZR)); }
    var zoneM = new T.LineDashedMaterial({ color: 0x2673B5, dashSize: 1.0, gapSize: .6, transparent: true, opacity: 0 });
    var zone = new T.Line(new T.BufferGeometry().setFromPoints(zonePts), zoneM); zone.computeLineDistances(); scene.add(zone);
    var zoneFill = add(new T.CircleGeometry(ZR, 48).rotateX(-Math.PI / 2), decal(new T.MeshBasicMaterial({ color: 0x2673B5, transparent: true, opacity: 0, depthWrite: false }), 12), ZC.x, .07, ZC.z);
    var intr = new T.Group(); intr.visible = false; scene.add(intr);
    var intrLegs = [-1, 1].map(function (sd) { var lg = new T.Group(); lg.position.set(sd * .1, .86, 0); intr.add(lg); cs(add(new T.BoxGeometry(.17, .8, .2), M(0x24344A, { roughness: .8 }), 0, -.4, 0, lg)); add(new T.BoxGeometry(.19, .13, .32), M(0x2B2118), 0, -.82, .06, lg); return lg; });
    cs(add(new T.BoxGeometry(.43, .6, .26), M(0x2D4A6B, { roughness: .8 }), 0, 1.16, 0, intr)); cs(add(new T.BoxGeometry(.48, .46, .3), M(0xF07A1F, { roughness: .7, emissive: 0x3a1500 }), 0, 1.19, 0, intr));
    add(new T.BoxGeometry(.49, .05, .31), B(0xE9EEF2), 0, 1.08, 0, intr); add(new T.BoxGeometry(.49, .05, .31), B(0xE9EEF2), 0, 1.28, 0, intr); [-.12, .12].forEach(function (x) { add(new T.BoxGeometry(.055, .44, .315), B(0xE9EEF2), x, 1.19, 0, intr); });
    [-1, 1].forEach(function (sd) { add(new T.BoxGeometry(.12, .56, .12), M(0x2D4A6B, { roughness: .8 }), sd * .29, 1.14, 0, intr); });
    add(new T.SphereGeometry(.15, 12, 10), M(0xA9805E, { roughness: .8 }), 0, 1.64, 0, intr); add(new T.SphereGeometry(.19, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0xFFFFFF, { roughness: .35 }), 0, 1.7, 0, intr);
    add(new T.CylinderGeometry(.25, .25, .03, 16), M(0xFFFFFF, { roughness: .35 }), 0, 1.7, .02, intr);
    var intrRing = add(new T.RingGeometry(.9, 1.15, 32).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: 0xD6453D, transparent: true, opacity: 0, depthWrite: false }), 0, .06, 0, intr);
    // dust motes drifting over the haul road
    var NM = MOB ? 60 : 180, motePos = new Float32Array(NM * 3), MOTES = [];
    for (var mi = 0; mi < NM; mi++) MOTES.push({ x: -22 + Math.random() * 44, y: .3 + Math.random() * 4, z: -14 + Math.random() * 60, s: .2 + Math.random() * .6 });
    var moteG = new T.BufferGeometry(); moteG.setAttribute('position', new T.BufferAttribute(motePos, 3));
    var motes = new T.Points(moteG, new T.PointsMaterial({ color: 0xC9B79C, size: .35, transparent: true, opacity: .45, depthWrite: false })); scene.add(motes);

    var SURR = { ox: 0, oz: 0, ex: [[-56, 56, -66, 44], [-10, 10, 40, 130], [8, 46, 44, 64]],
      verges: [[-29, 42.6, 42, 3.4], [29.5, 42.6, 41, 3.4], [52.2, -10, 3.4, 100], [-52.2, -10, 3.4, 100], [0, -62.2, 108, 3.4]], park: { x0: 10, x1: 44, z0: 45, z1: 62 } };
    /* ---------- surroundings to the horizon: street grid on the cell lines, neighbouring blocks with glazing bands and roof
       plant, street trees, grass verges and a staff car park with parked cars (one draw call per kind; fewer on mobile) ---------- */
    (function surroundings(O) {
      var rnd = (function () { var sd = 7; return function () { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }; })();
      function inEx(x0, x1, z0, z1, pad) { return O.ex.some(function (e) { return x1 > e[0] - pad && x0 < e[1] + pad && z1 > e[2] - pad && z0 < e[3] + pad; }); }
      var CELL = 40, R = MOB ? 200 : 280, SW = 10, mx = new T.Matrix4(), mq = new T.Quaternion(), mp = new T.Vector3(), ms = new T.Vector3(), cc = new T.Color();
      // streets (light asphalt, the brand's white world) with kerb lines
      var segs = [], kerbs = [];
      for (var g = -R; g <= R; g += CELL) for (var t = -R; t < R; t += CELL) {
        var gx = g + O.ox, tx = t + O.ox, gz = g + O.oz, tz = t + O.oz;
        if (!inEx(gx - SW / 2, gx + SW / 2, tz, tz + CELL, 0)) { segs.push([gx, tz + CELL / 2, SW, CELL]); kerbs.push([gx - SW / 2, tz + CELL / 2, .25, CELL], [gx + SW / 2, tz + CELL / 2, .25, CELL]); }
        if (!inEx(tx, tx + CELL, gz - SW / 2, gz + SW / 2, 0)) { segs.push([tx + CELL / 2, gz, CELL, SW]); kerbs.push([tx + CELL / 2, gz - SW / 2, CELL, .25], [tx + CELL / 2, gz + SW / 2, CELL, .25]); }
      }
      function flat(list, mat, y) {
        var im = new T.InstancedMesh(new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), mat, Math.max(1, list.length));
        list.forEach(function (s, i) { mx.compose(mp.set(s[0], y, s[1]), mq.identity(), ms.set(s[2], 1, s[3])); im.setMatrixAt(i, mx); });
        im.count = list.length; if (SH) im.receiveShadow = true; scene.add(im); return im;
      }
      flat(segs, decal(M(0xD5DBE1, { roughness: .9 }), 1), .006); flat(kerbs, decal(M(0xF7F9FB, { roughness: .8 }), 2), .008);
      // neighbouring blocks: UV-scaled so every façade shows 4 m bays and 3.5 m floors of glazing; roofs stay plain
      var winTex = canvasTex(256, 256, function (x, w, h) {
        x.fillStyle = '#F2F4F6'; x.fillRect(0, 0, w, h);
        var gr = x.createLinearGradient(0, 50, 0, 190); gr.addColorStop(0, '#B4C8DA'); gr.addColorStop(1, '#8EA6BC'); x.fillStyle = gr; x.fillRect(14, 50, w - 28, 140);
        x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.moveTo(30, 50); x.lineTo(110, 50); x.lineTo(60, 190); x.lineTo(14, 190); x.fill();
        x.fillStyle = '#DCE3EA'; x.fillRect(w / 2 - 3, 50, 6, 140); x.fillStyle = 'rgba(30,50,70,.18)'; x.fillRect(0, 196, w, 4);
      });
      winTex.wrapS = winTex.wrapT = T.RepeatWrapping;
      var bp = [], bn = [], bu = [], bc = [], roofs = [], tint = [0xFFFFFF, 0xF4F6F8, 0xE9EEF3, 0xDDE6EE, 0xEEF0F2, 0xE4ECF4];
      function bldg(x, z, w, d, h, col) {
        var gB = new T.BoxGeometry(w, h, d).toNonIndexed(), P = gB.attributes.position, N = gB.attributes.normal, U = gB.attributes.uv; cc.setHex(col);
        for (var i = 0; i < P.count; i++) {
          var nx = N.getX(i), ny = N.getY(i), px = P.getX(i), py = P.getY(i) + h / 2, pz = P.getZ(i), u, v;
          if (Math.abs(ny) > .5) { u = .5; v = .02; } else if (Math.abs(nx) > .5) { u = (pz + d / 2) / 4; v = py / 3.5; } else { u = (px + w / 2) / 4; v = py / 3.5; }
          bp.push(px + x, py, pz + z); bn.push(nx, ny, N.getZ(i)); bu.push(u, v); bc.push(cc.r, cc.g, cc.b);
        }
        gB.dispose();
        if (h > 7 && rnd() < .8) roofs.push([x + (rnd() - .5) * w * .3, h + .7, z + (rnd() - .5) * d * .3, Math.min(6, w * .35), 1.4, Math.min(5, d * .3)]);
        roofs.push([x, h + .25, z, w + .3, .5, d + .3]);   // parapet cap
      }
      var lot = CELL / 2 - SW / 2 - 3;
      for (var cxl = -R; cxl < R; cxl += CELL) for (var czl = -R; czl < R; czl += CELL) {
        var bxc = cxl + CELL / 2 + O.ox, bzc = czl + CELL / 2 + O.oz;
        if (inEx(bxc - lot, bxc + lot, bzc - lot, bzc + lot, 2) || rnd() < .12) continue;
        var far = Math.hypot(bxc, bzc), hmax = far > 160 ? 34 : 22, col = tint[(rnd() * tint.length) | 0];
        if (rnd() < .45) { var w0 = 14 + rnd() * 10, d0 = 14 + rnd() * 10; bldg(bxc, bzc, w0, d0, 5 + Math.pow(rnd(), 2) * hmax, col); }
        else { var hw = lot - 1; bldg(bxc - hw / 2 - .5, bzc, hw - 1, 10 + rnd() * 12, 4 + Math.pow(rnd(), 1.6) * hmax, col); bldg(bxc + hw / 2 + .5, bzc + (rnd() - .5) * 4, hw - 1, 10 + rnd() * 12, 4 + Math.pow(rnd(), 1.6) * hmax, tint[(rnd() * tint.length) | 0]); }
      }
      var BG = new T.BufferGeometry(); BG.setAttribute('position', new T.Float32BufferAttribute(bp, 3)); BG.setAttribute('normal', new T.Float32BufferAttribute(bn, 3)); BG.setAttribute('uv', new T.Float32BufferAttribute(bu, 2)); BG.setAttribute('color', new T.Float32BufferAttribute(bc, 3));
      var bm2 = new T.Mesh(BG, new T.MeshStandardMaterial({ map: winTex, vertexColors: true, roughness: .55, metalness: .1 })); if (SH) bm2.receiveShadow = true; scene.add(bm2);
      var rf = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), M(0xC9D0D7, { roughness: .7, metalness: .2 }), Math.max(1, roofs.length));
      roofs.forEach(function (r, i) { mx.compose(mp.set(r[0], r[1], r[2]), mq.identity(), ms.set(r[3], r[4], r[5])); rf.setMatrixAt(i, mx); }); rf.count = roofs.length; scene.add(rf);
      // street trees and verge trees: trunk + two-lobe canopy, muted greens
      var TP = [], cap = MOB ? 110 : 320;
      segs.forEach(function (s, i) {
        if (TP.length >= cap || i % 2) return; var alongX = s[2] > s[3], L = alongX ? s[2] : s[3];
        for (var k = -L / 2 + 5; k < L / 2 - 4; k += 11) [-1, 1].forEach(function (sd) {
          var x = s[0] + (alongX ? k : sd * (SW / 2 + 1.8)), z = s[1] + (alongX ? sd * (SW / 2 + 1.8) : k);
          if (!inEx(x - 2, x + 2, z - 2, z + 2, 0) && TP.length < cap) TP.push([x, z, .8 + rnd() * .5]);
        });
      });
      (O.verges || []).forEach(function (v) {
        var gv = add(new T.PlaneGeometry(v[2], v[3]).rotateX(-Math.PI / 2), decal(M(0xB9CDB0, { roughness: .95 }), 2), v[0], .012, v[1]); if (SH) gv.receiveShadow = true;
        var alongX = v[2] > v[3], L = alongX ? v[2] : v[3];
        for (var k = -L / 2 + 3; k < L / 2 - 2; k += MOB ? 12 : 7.5) TP.push([v[0] + (alongX ? k : 0), v[1] + (alongX ? 0 : k), .7 + rnd() * .4]);
      });
      var trunk = new T.InstancedMesh(new T.CylinderGeometry(.14, .2, 2.6, 7).translate(0, 1.3, 0), M(0x8A7563, { roughness: .9 }), TP.length);
      var can = merge([[new T.IcosahedronGeometry(1.6, 1).scale(1, .9, 1).translate(0, 3.6, 0)], [new T.IcosahedronGeometry(1.1, 1).translate(.7, 4.6, .3)]]);
      var crown = new T.InstancedMesh(can, new T.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: .85, flatShading: true }), TP.length);
      var greens = [0x9DBB95, 0x8EAF88, 0xA9C4A0, 0x86A882, 0xB3C9A6];
      TP.forEach(function (p, i) { mq.setFromAxisAngle(up, rnd() * 6.28); mx.compose(mp.set(p[0], 0, p[1]), mq, ms.set(p[2], p[2], p[2])); trunk.setMatrixAt(i, mx); crown.setMatrixAt(i, mx); crown.setColorAt(i, cc.setHex(greens[i % greens.length])); });
      if (SH) { trunk.castShadow = crown.castShadow = true; crown.receiveShadow = true; } scene.add(trunk); scene.add(crown);
      // car park: asphalt, bay lines, wheel stops, parked cars (paint instanced and tinted, glass/tyres/lamps merged in one dark instance)
      var C = O.park; if (!C) return;
      add(new T.PlaneGeometry(C.x1 - C.x0, C.z1 - C.z0).rotateX(-Math.PI / 2), decal(M(0x9AA2AA, { roughness: .9 }), 3), (C.x0 + C.x1) / 2, .014, (C.z0 + C.z1) / 2).receiveShadow = SH;
      var lines = [], stops = [], cars = [], nBay = Math.floor((C.x1 - C.x0 - 2) / 2.6);
      [[C.z0 + .6, 1], [C.z1 - .6, -1]].forEach(function (row) {
        for (var b = 0; b <= nBay; b++) { var lx = C.x0 + 1 + b * 2.6; lines.push([lx, row[0] + row[1] * 2.5, .12, 5]); }
        for (var b2 = 0; b2 < nBay; b2++) {
          var cx = C.x0 + 1 + (b2 + .5) * 2.6; stops.push([cx, .08, row[0] + row[1] * .5]);
          if (rnd() < (MOB ? .45 : .72)) cars.push([cx, row[0] + row[1] * 2.55, row[1] > 0 ? Math.PI : 0]);
        }
      });
      flat(lines, decal(B(0xF4F6F8), 4), .018);
      var ws = new T.InstancedMesh(new T.BoxGeometry(1.6, .14, .22), M(0xC9CDD1, { roughness: .9 }), Math.max(1, stops.length)); stops.forEach(function (s, i) { mx.makeTranslation(s[0], s[1], s[2]); ws.setMatrixAt(i, mx); }); scene.add(ws);
      var paintG = merge([[new T.BoxGeometry(1.8, .62, 4.4).translate(0, .55, 0)], [new T.BoxGeometry(1.62, .5, 2.2).translate(0, 1.11, -.2)]]);
      var darkP = [[new T.BoxGeometry(1.66, .36, 2.24).translate(0, 1.1, -.2), 0x2E4152], [new T.BoxGeometry(1.84, .16, 4.46).translate(0, .3, 0), 0x3A4048]];
      [-1, 1].forEach(function (sd) {
        [-1.4, 1.35].forEach(function (z) { darkP.push([new T.CylinderGeometry(.32, .32, .24, 14).rotateZ(Math.PI / 2).translate(sd * .8, .32, z), 0x15181B], [new T.CylinderGeometry(.19, .19, .25, 10).rotateZ(Math.PI / 2).translate(sd * .8, .32, z), 0xB4BCC4]); });
        darkP.push([new T.BoxGeometry(.36, .12, .04).translate(sd * .6, .7, 2.21), 0xF4F6F8], [new T.BoxGeometry(.32, .12, .04).translate(sd * .62, .72, -2.21), 0xD6453D]);
      });
      var carP = new T.InstancedMesh(paintG, new T.MeshStandardMaterial({ color: 0xffffff, roughness: .3, metalness: .45 }), Math.max(1, cars.length));
      var carD = new T.InstancedMesh(merge(darkP), new T.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: .25, metalness: .5 }), Math.max(1, cars.length));
      var carCols = [0xF4F6F8, 0xDCE3EA, 0x2C66B0, 0x9AA4AE, 0x3A4048, 0xC8442F, 0xE9EDF1, 0x1B5A94];
      cars.forEach(function (c, i) { mq.setFromAxisAngle(up, c[2]); mx.compose(mp.set(c[0], 0, c[1]), mq, ms.set(1, 1, 1)); carP.setMatrixAt(i, mx); carD.setMatrixAt(i, mx); carP.setColorAt(i, cc.setHex(carCols[(rnd() * carCols.length) | 0])); });
      carP.count = carD.count = cars.length; if (SH) { carP.castShadow = carD.castShadow = true; carP.receiveShadow = true; } scene.add(carP); scene.add(carD);
    })(SURR);

    /* ---------- station boards ---------- */
    var ST = REG.construction.stations;
    var BOARD_AT = [[-12.5, 9.2, 44.6, 0], [-12, 9, 14, .2], [-30, 8.1, 22, .45], [30, 24, -30 + MS + .2, 0], [16, 8, 6, 0]];
    ST.forEach(function (S, i) {
      var p = BOARD_AT[i], g = new T.Group(); g.position.set(p[0], p[1], p[2]); g.rotation.y = p[3];
      g.add(new T.Mesh(new T.PlaneGeometry(9, 1.42), B(0xffffff, { map: titleBoard([S.short || S.title], { num: ('0' + (i + 1)).slice(-2), grp: S.product === 'Cygnus' ? 'Cygnus' : 'Access & parking' }) })));
      if (i === 0 || i === 1 || i === 4) [-3.6, 3.6].forEach(function (x) { add(new T.BoxGeometry(.14, p[1], .14), postM, x, -p[1] / 2, -.1, g); });
      if (i === 2) { var pl = p[1] - (RF + RH + .35); [-3.6, 3.6].forEach(function (x) { add(new T.BoxGeometry(.14, pl, .14), postM, x, -pl / 2, -.1, g); }); }   // short posts on the control-room roof
      if (i === 3) { [.42, -.42].forEach(function (y) { add(new T.BoxGeometry(8.6, .08, .06), postM, 0, y, -.05, g); }); [-MS, MS].forEach(function (x) { add(new T.BoxGeometry(.12, 1.3, .16), postM, x, 0, -.13, g); }); }   // clamped to T1's mast
      scene.add(g);
    });

    /* ---------- paths ---------- */
    // mixer: in-lane to the barrier, through the gate, K-turn past the pour bay, reverse onto the pump hopper, out by the exit lane
    var V3 = function (x, z) { return new T.Vector3(x, 0, z); };
    var P = {
      approach: new T.CatmullRomCurve3([V3(-3, 108), V3(-3, 70), V3(-3, 49)]),
      toPour: new T.CatmullRomCurve3([V3(-3, 49), V3(-3, 26), V3(-3.4, 15), V3(-6, 10), V3(-10, 8.2), V3(-13, 7.8)]),
      backIn: new T.CatmullRomCurve3([V3(-13, 7.8), V3(-9, 7.4), V3(-6.6, 5.2), V3(-6, 2.4)]),
      out: new T.CatmullRomCurve3([V3(-6, 2.4), V3(-5.8, 8.5), V3(-2.5, 15.5), V3(3.5, 22), V3(3.5, 46), V3(3.5, 100)])
    };
    function onCurve(g, curve, t, rev) { t = Math.max(0, Math.min(1, t)); var p = curve.getPointAt(t), tg = curve.getTangentAt(Math.min(.999, Math.max(.001, t))); g.position.copy(p); g.rotation.y = Math.atan2(tg.x, tg.z) + (rev ? Math.PI : 0); }
    // where the exit lane meets the barrier: the mixer stops short of it until the arm is up
    var OUT_STOP = (function () { for (var k = 0; k <= 400; k++) { var pt = P.out.getPointAt(k / 400); if (pt.z >= 34.5) return k / 400; } return .6; })();
    // station-2 cycle (s): approach, wait at the barrier, in, pause, reverse onto the pump, pour, out to the exit barrier, wait, leave
    var MX_END = [2.4, 2.9, 7.1, 7.7, 10.9, 13.3, 16.1, 18.9, 19.4];
    function mixPose(c) {
      if (c < 2.4) return [P.approach, ease(c / 2.4), false, 0];
      if (c < 2.9) return [P.approach, 1, false, 1];
      if (c < 7.1) return [P.toPour, ease((c - 2.9) / 4.2), false, 2];
      if (c < 7.7) return [P.toPour, 1, false, 3];
      if (c < 10.9) return [P.backIn, ease((c - 7.7) / 3.2), true, 4];
      if (c < 13.3) return [P.backIn, 1, true, 5];
      if (c < 16.1) return [P.out, OUT_STOP * ease((c - 13.3) / 2.8), false, 6];
      if (c < 18.9) return [P.out, OUT_STOP + (1 - OUT_STOP) * ease((c - 16.1) / 2.8), false, 8];
      return [P.out, 1, false, 9];
    }
    var pins = [[-6.2, 47], [-9.2, 1.5], [6.4, 52]].map(function (qq) { var g = new T.Group(); g.position.set(qq[0], 0, qq[1]); add(new T.CylinderGeometry(.08, .08, 3, 8), B(0x2673B5), 0, 1.5, 0, g); add(new T.SphereGeometry(.42, 16, 12), B(0x2673B5), 0, 3.2, 0, g); g.visible = false; scene.add(g); return g; });
    // tipper loop on its own haul area east of the frame: load beside the excavator, tip at the heap, come back
    var dumpLoop = new T.CatmullRomCurve3([V3(23.8, -4.2), V3(26.5, 1.5), V3(32, 6), V3(40, 5), V3(43.5, -3), V3(42, -11), V3(35, -14.5), V3(28, -13.5), V3(24.2, -9.5)], true);
    var DL = (function () { var pts = [], L = [0], n = 240; for (var k = 0; k <= n; k++) { pts.push(dumpLoop.getPoint(k / n)); if (k) L.push(L[k - 1] + pts[k].distanceTo(pts[k - 1])); } return { pts: pts, L: L, len: L[n] }; })();
    function dlAt(s, out) {
      s = ((s % DL.len) + DL.len) % DL.len; var lo = 0, hi = DL.L.length - 1;
      while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (DL.L[mid] <= s) lo = mid; else hi = mid; }
      var f = (s - DL.L[lo]) / Math.max(1e-6, DL.L[hi] - DL.L[lo]); out.lerpVectors(DL.pts[lo], DL.pts[hi], f);
      return Math.atan2(DL.pts[hi].x - DL.pts[lo].x, DL.pts[hi].z - DL.pts[lo].z);
    }
    var DL_TIP = (function () { var best = 0, bd = 1e9; DL.pts.forEach(function (p, k) { var d = Math.hypot(p.x - 42, p.z + 11); if (d < bd) { bd = d; best = DL.L[k]; } }); return best; })();
    var DT_A = DL_TIP / 4.2, DT_B = (DL.len - DL_TIP) / 4.2, D_CYC = 5 + DT_A + 4.2 + DT_B;   // load 5 s, drive, tip 4.2 s, drive back
    // tyre tracks along the routes the trucks really drive: the mixer's way in, its reverse onto the pump, the way out, the tipper loop
    [P.toPour, P.backIn, P.out].forEach(function (cv, i) { var pts = cv.getSpacedPoints(90).filter(function (v) { return v.z < 39.5; }); if (pts.length > 1) ribbon(pts, 2.6, .041 + i * .001, trackM); });
    ribbon(dumpLoop.getSpacedPoints(160).slice(0, 160), 2.5, .04, trackM, true);
    if (mixer2) ribbon([V3(-12.5, 6), V3(-12.5, -6)], 2.6, .043, trackM);

    /* ---------- tags ---------- */
    var tPlate = tag('ANPR · <b>XX 00 AB 1234</b> · transit mixer', 'dark'); tPlate.p.set(-3, 5.6, 50);
    var tLog = tag('Site gate · in · 07:58 IST · logged'); tLog.p.set(10, 4.6, 37);
    var tPins = [tag('Gate · 07:58'), tag('Core B pour · 08:21'), tag('Exit · 09:05')];
    tPins[0].p.set(-6.2, 4.6, 47); tPins[1].p.set(-9.2, 4.6, 1.5); tPins[2].p.set(6.4, 4.6, 52);
    var tWall = tag('Cygnus · Crane T1 lift · 10:42 · recording'); wallG.updateMatrixWorld(true); tWall.p.set(0, RF + .1, RD / 2 + .6); wallG.localToWorld(tWall.p);
    var tExport = tag('Clip exported · MP4 · 38 s', 'dark'); tExport.p.set(0, RF + .45, VW_Z + .2); wallG.localToWorld(tExport.p);
    var tTamper = tag('Camera tamper · Crane T1 · CAM 04 · lens blocked', 'alert'); var tamperP = new T.Vector3();
    var tCamLive = tag('Crane T1 · CAM 04 · live', 'dark'), tDust = tag('Dust settling on the lens');
    var tZone = tag('Zone intrusion · EX-2 swing radius · 15:06', 'alert');

    /* ---------- camera path ---------- */
    var KEYS = MOB ? [
      { p: [14, 9, 74], t: [-2, 3, 46] },
      { p: [46, 44, 52], t: [0, 0, -4] },
      { p: [-22.6, 4.3, 37.4], t: [-30.2, 2.6, 21.6] },
      { p: [54, 36, -4], t: [36, 40, -27] },
      { p: [2, 14, 18], t: [16, 1, -6] }
    ] : [
      { p: [16, 8.5, 70], t: [-2, 3, 46] },
      { p: [44, 42, 50], t: [2, 0, -4] },
      { p: [-23.9, 3.9, 34.6], t: [-30.2, 2.5, 21.6] },
      { p: [50, 37, -2], t: [36, 40, -26] },
      { p: [0, 15, 16], t: [16, 1, -6] }
    ];
    var cPos = new T.Vector3(), cTgt = new T.Vector3(), tmpA = new T.Vector3(), tmpB = new T.Vector3();
    var SHF = [[-2, 2, 40, 28], [2, 6, -8, 66], [-30, 2, 22, 16], [33, 41, -27, 15], [15, 1, -4, 24]];   // shadow focus per station
    function ease(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    var CLOSE_EYE = new T.Vector3(9.4, .5, 3.1), CLOSE_AT = new T.Vector3(6, -.55, 0), _e = new T.Vector3(), _t = new T.Vector3();
    function camAt(progress, time) {
      T1.top.updateMatrixWorld(true); _e.copy(CLOSE_EYE); T1.top.localToWorld(_e); _t.copy(CLOSE_AT); T1.top.localToWorld(_t);
      KEYS[3].p = [_e.x, _e.y, _e.z]; KEYS[3].t = [_t.x, _t.y, _t.z];
      var n = KEYS.length, s = Math.max(0, Math.min(n - 1e-4, progress * n)), i = Math.floor(s), f = s - i;
      var a = KEYS[i], b = KEYS[Math.min(n - 1, i + 1)], k = i === n - 1 ? 0 : ease(Math.max(0, (f - .58) / .42));
      cPos.set(a.p[0], a.p[1], a.p[2]).lerp(tmpA.set(b.p[0], b.p[1], b.p[2]), k);
      cTgt.set(a.t[0], a.t[1], a.t[2]).lerp(tmpB.set(b.t[0], b.t[1], b.t[2]), k);
      shadowFocus(SHF[i], SHF[Math.min(n - 1, i + 1)], k);
      var sway = REDUCE || (i === 3 && k === 0) ? 0 : Math.sin(time * .25) * .35;
      cam.position.set(cPos.x + sway, cPos.y + sway * .3, cPos.z); cam.lookAt(cTgt);
    }

    /* ---------- per-frame ---------- */
    var time = 0, lastStation = -1, stT = 0, stStart = 0;
    var mcT = 2.4, boomE = 0, boomX = 0, mixMoving = false, mixPrev = new T.Vector3(), dumpT = 0, _np = new T.Vector3();
    // excavator key poses: [time, swing ('T' = towards the dump target), boom, stick, bucket]
    var EXK = [[0, .349, -.05, .95, -.3], [2.0, .349, -.12, 1.65, .9], [3.0, .349, -.55, 1.3, 1.1], [4.8, 'T', -.6, .75, 1.1], [5.8, 'T', -.6, .75, -.6], [8.0, .349, -.05, .95, -.3]];
    var exT = 0, exToTip = false, tipLoaded = false;
    var fenceTex = hoardTex; // disposed with the rest
    var intrA = new T.Vector3(ZC.x - 12, 0, ZC.z + 9), intrB = new T.Vector3(ZC.x - 3.6, 0, ZC.z + 3.2);
    function update(progress, stationIndex, dt) {
      if (dead) return;
      dt = Math.max(0, Math.min(.05, dt || .016)); time += dt;   // never run backwards (a host can hand over a negative first dt)
      var nowS = performance.now() / 1000;
      if (stationIndex !== lastStation) { lastStation = stationIndex; stStart = nowS; shDirty = true; }
      stT = nowS - stStart; var st = stationIndex;
      // transit mixer: approach (st 0) -> the full delivery on a loop (st 1) -> parked on the pump afterwards.
      // It stops at each barrier until the arm is fully up, and gives way to anyone already on the crossing.
      var seen = [false, false, false], mph = -1, pedOn = WK.some(function (w) { return w.onX; });
      if (st !== 1) mcT = 2.4;
      if (st === 0) { onCurve(mixer, P.approach, ease(Math.min(1, stT / 2.2))); mph = stT > 2.2 ? 1 : 0; }
      else if (st === 1) {
        var nc = mcT + dt, pc = mixPose(nc), pz = pc[0].getPointAt(Math.max(0, Math.min(1, pc[1]))).z;
        if (mcT <= 2.9 && nc > 2.9 && boomE < .98) nc = 2.9;                                    // entry arm not up yet
        else if (mcT <= 16.1 && nc > 16.1 && boomX < .98) nc = 16.1;                            // exit arm not up yet
        else if (pedOn && Math.abs(pz - 30) < 7.6 && Math.abs(mixer.position.z - 30) >= 7.4 && Math.abs(mixer.position.x) < 8) nc = mcT;   // give way at the crossing
        mcT = nc >= MX_END[8] ? 0 : nc;
        var pose = mixPose(mcT); onCurve(mixer, pose[0], pose[1], pose[2]); mph = pose[3];
        if (mcT === 16.1) mph = 7;
        seen[0] = mph >= 1; seen[1] = mph >= 5; seen[2] = mph === 8 && mixer.position.z > 50;
      }
      else onCurve(mixer, P.backIn, 1, true);
      mixMoving = mixPrev.distanceToSquared(mixer.position) > 1e-6; mixPrev.copy(mixer.position);
      // barrier arms: up only for a vehicle waiting at or passing the arm; they drop once its tail is clear
      var mz = mixer.position.z;
      var entryT = (st === 0 && stT > 2.3) || (st === 1 && ((mph === 1 && mcT > 2.6) || (mph === 2 && mz > 37.2))) ? 1 : 0;
      var exitT = st === 1 && (mph === 7 || (mph === 6 && mcT > 15.7) || (mph === 8 && mz < 48.6)) ? 1 : 0;
      boomE += Math.max(-dt / .8, Math.min(dt / .6, entryT - boomE)); boomX += Math.max(-dt / .8, Math.min(dt / .6, exitT - boomX));
      if (REDUCE) { boomE = entryT; boomX = exitT; }
      boom.rotation.z = -boomE * 1.4; boomXg.rotation.z = boomX * 1.4;
      mixer.userData.drum.rotation.z += dt * (mph === 5 ? 3.2 : 1.6); if (mixer2) mixer2.userData.drum.rotation.z += dt * 1.6;
      // cranes: T1 slews and makes the recorded lift at station 3; T2 works its bucket; warning lights blink
      craneCycle(CY1, dt, st === 3); if (CY2) craneCycle(CY2, dt, false);
      var blink = Math.sin(time * 3.2) > 0; LAMPS.forEach(function (l) { l.visible = blink; });
      // pump boom breathes; safety netting moves in the wind
      seg2.rotation.x = .45 + Math.sin(time * .3) * .03; seg3.rotation.x = .35 + Math.sin(time * .3 + 1) * .04;
      if (!MOB && !REDUCE) NETS.forEach(function (n, k) {
        var pa = n.geometry.attributes.position, b0 = n.userData.base, hh = n.userData.h;
        for (var vi = 0; vi < pa.count; vi++) { var bxv = b0[vi * 3], byv = b0[vi * 3 + 1]; pa.array[vi * 3 + 2] = Math.sin(bxv * .35 + time * 1.4 + k) * .2 * (.35 + (byv / hh + .5) * .65); }
        pa.needsUpdate = true;
      });
      // tipper: waits beside the excavator while it is loaded, drives its own loop, tips at the heap, comes back
      // it does not leave the loading spot until the excavator has dumped into it and swung its bucket clear
      var dHold = !REDUCE && dumpT < 5 && dumpT + dt >= 4.9 && (!tipLoaded || (exT >= 3.0 && exT < 6.6 && exToTip));
      if (!REDUCE && !dHold) dumpT = (dumpT + dt) % D_CYC;
      var dc = REDUCE ? 1 : dumpT, ds, tipA = 0;
      if (dc < 5) ds = 0;
      else if (dc < 5 + DT_A) ds = DL_TIP * ease((dc - 5) / DT_A);
      else if (dc < 9.2 + DT_A) { ds = DL_TIP; var tc = dc - 5 - DT_A; tipA = tc < 1.5 ? ease(tc / 1.5) * .85 : tc < 2.7 ? .85 : .85 * (1 - ease((tc - 2.7) / 1.5)); }
      else ds = DL_TIP + (DL.len - DL_TIP) * ease((dc - 9.2 - DT_A) / DT_B);
      dumper.rotation.y = dlAt(ds, dumper.position); setTip(tipA);
      if (dc >= 5 + DT_A + 1.6) tipLoaded = false;
      dLoad.visible = REDUCE || (tipLoaded && dc < 5 + DT_A + 1.6);
      beacon.visible = Math.sin(time * 9) > 0;
      // excavator: digs at the cut, swings round and empties the bucket over the tipper (or the heap)
      // dig cycle (8 s): fill at the cut, curl, lift, swing (eased) to the waiting tipper or to the spoil heap, open the bucket, swing back
      var exPrev = exT; if (!REDUCE) exT = (exT + dt) % 8; else exT = 4.8;
      if (exPrev < 3.0 && exT >= 3.0) exToTip = dc < 5 && ds === 0;
      if (exPrev < 5.3 && exT >= 5.3 && exToTip) tipLoaded = true;
      var exK = EXK, kk = 0; while (kk < exK.length - 2 && exT >= exK[kk + 1][0]) kk++;
      var k0 = exK[kk], k1 = exK[kk + 1], ef = ease(Math.max(0, Math.min(1, (exT - k0[0]) / (k1[0] - k0[0])))), phT = exToTip ? 1.344 : .62;
      function exA(i) { var v0 = k0[i] === 'T' ? phT : k0[i], v1 = k1[i] === 'T' ? phT : k1[i]; return v0 + (v1 - v0) * ef; }
      house.rotation.y = exA(1); bm.rotation.x = exA(2); armG.rotation.x = exA(3); bucketG.rotation.x = exA(4);
      spoil.visible = exT >= 1.9 && exT < 5.4; updRams();
      // workers: walkers keep to the footpaths, wait at the kerb unless the haul road is clear or the mixer has stopped,
      // never step towards a vehicle or into the excavator's swing radius; workers at a task lean in and hammer
      var mxN = Math.abs(mixer.position.x) < 8, mdz = Math.abs(mixer.position.z - 30);
      var crossOK = !(mxN && mdz < 7.5) && !(mxN && mdz < 17 && mixMoving);
      WK.forEach(function (w, i) {
        if (w.work) {
          var sw = -1.1 + Math.sin(time * 5 + i) * .45;
          drawWorker(i, w.x, w.y, w.z, w.ry, .35 + Math.sin(time * 3 + i) * .15, false, [sw, -.6]);
          return;
        }
        var moving = false;
        if (w.x === 0 && w.z === 0) { var h0 = pathAt(w.path, w.s, _np); w.x = _np.x; w.z = _np.z; w.ry = h0; }
        if (w.wait > 0) w.wait -= dt;
        else if (!REDUCE) {
          var ns = w.s + w.dir * w.sp * dt, flip = false;
          if (ns >= w.path.len || ns <= 0) { ns = Math.max(0, Math.min(w.path.len, ns)); flip = true; }
          var hd = pathAt(w.path, ns, _np), ok = true;
          if (w.ground) {
            var inX = Math.abs(_np.x) < 6.9 && Math.abs(_np.z - 30) < 1.4;
            if (inX && !w.onX && !crossOK) ok = false;
            [mixer, mixer2, dumper].forEach(function (v) { if (v && ok) { var d1 = Math.hypot(_np.x - v.position.x, _np.z - v.position.z); if (d1 < 5.6 && d1 < Math.hypot(w.x - v.position.x, w.z - v.position.z)) ok = false; } });
            if (ok && Math.hypot(_np.x - ZC.x, _np.z - ZC.z) < ZR + .6) ok = false;
          }
          if (ok) { w.s = ns; w.x = _np.x; w.z = _np.z; w.ry = hd + (w.dir < 0 ? Math.PI : 0); moving = true; if (flip) { w.dir *= -1; w.wait = 1 + Math.random() * 1.5; } }
        }
        w.onX = w.ground && Math.abs(w.x) < 6.9 && Math.abs(w.z - 30) < 1.4;
        drawWorker(i, w.x, w.y, w.z, w.ry, 0, moving, moving ? [Math.sin(time * 7 + i) * .4, -Math.sin(time * 7 + i) * .4] : [0, 0]);
      });
      WPARTS.forEach(function (o) { o.instanceMatrix.needsUpdate = true; });
      for (var mi2 = 0; mi2 < NM; mi2++) { var mo = MOTES[mi2]; if (!REDUCE) { mo.x += mo.s * dt * .8; if (mo.x > 22) mo.x = -22; } motePos[mi2 * 3] = mo.x; motePos[mi2 * 3 + 1] = mo.y + Math.sin(time * .7 + mi2) * .2; motePos[mi2 * 3 + 2] = mo.z; }
      moteG.attributes.position.needsUpdate = true;
      // station reveals (fast: every moment lands within ~2.5 s)
      tPlate.on = st === 0 && stT > 1.6; tLog.on = st === 0 && stT > 2.4;
      // sightings: each pin pops when the plate WAS read there (gate, pour camera, exit), in time order
      pins.forEach(function (p, i) { var on = st === 1 && seen[i]; p.visible = on; tPins[i].on = on; });
      tWall.on = st === 2 && stT > .4; tExport.on = st === 2 && stT > 2.2;
      drawTimeline(st === 2 ? Math.min(.72, .35 + stT * .18) : .4, st === 2 && stT > 2.2);
      // camera tamper, staged: clear lens (0–1.2 s) → dust settles, picture hazes (1.2–3.8 s) → alert (3.8 s+)
      var T_A = 1.2, T_C = 3.8, acc = st === 3 ? Math.max(0, Math.min(1, (stT - T_A) / (T_C - T_A))) : 0, alarm = st === 3 && stT >= T_C;
      lensDustM.opacity = acc * .93; heapM.opacity = Math.min(1, acc * 1.4); heap.scale.set(.9, .05 + acc * .2, 1.4);
      dustM.opacity = 0; dust.forEach(function (s2, i) { s2.position.y = -.6 + s2.userData.o.y + Math.sin(time * 1.2 + i) * .3; s2.position.x = 6 + s2.userData.o.x + Math.cos(time * .8 + i) * .2; });
      craneCam.getWorldPosition(tamperP);
      grains.material.opacity = st === 3 && stT > T_A * .6 ? Math.min(.9, (stT - T_A * .6) * 1.2) : 0;
      if (grains.material.opacity > 0) GRAINS.forEach(function (g, i) {
        if (!REDUCE && acc < 1) g.y = Math.max(g.stop, g.y - g.v * dt); else if (REDUCE) g.y = g.stop;
        grainPos[i * 3] = tamperP.x + g.x * (.4 + g.y * .2); grainPos[i * 3 + 1] = tamperP.y + .26 + g.y; grainPos[i * 3 + 2] = tamperP.z + g.z * (.4 + g.y * .2);
      });
      else if (st !== 3) GRAINS.forEach(function (g) { g.y = .4 + Math.random() * 2.6; });
      grainG.attributes.position.needsUpdate = true;
      craneRing.material.opacity = alarm ? .45 + .4 * Math.sin(time * 6) : 0; craneRing.scale.setScalar(st === 3 ? .42 : 1); craneRing.lookAt(cam.position);
      tCamLive.p.copy(tamperP).add(tmpA.set(0, 1.4, 0)); tCamLive.on = st === 3 && stT < T_A + .6;
      tDust.p.copy(tamperP).add(tmpA.set(0, 1.4, 0)); tDust.on = st === 3 && stT >= T_A + .6 && !alarm;
      tTamper.p.copy(tamperP).add(tmpA.set(0, 1.6, 0)); tTamper.on = alarm;
      if (st === 3 && !alarm && acc > 0) drawHaze(acc);
      TILES[2].m.material.map = st !== 3 ? TILES[2].tex : alarm ? noiseTex : acc > 0 ? hazeTex : TILES[2].tex;
      var zOn = st === 4 ? Math.min(1, stT / .5) : 0, hit = st === 4 && stT > 1.6;
      zoneM.opacity = zOn * .95; zoneM.color.setHex(hit ? 0xD6453D : 0x2673B5);
      zoneFill.material.color.setHex(hit ? 0xD6453D : 0x2673B5); zoneFill.material.opacity = zOn * (hit ? .14 + .06 * Math.sin(time * 6) : .06);
      intr.visible = st === 4;
      if (st === 4) { intr.position.lerpVectors(intrA, intrB, ease(Math.min(1, stT / 1.6))); intr.rotation.y = Math.atan2(intrB.x - intrA.x, intrB.z - intrA.z); intrLegs.forEach(function (lg, k) { lg.rotation.x = stT < 1.6 && !REDUCE ? Math.sin(time * 7) * .45 * (k ? 1 : -1) : 0; }); intrRing.material.opacity = hit ? .5 + .5 * Math.sin(time * 6) : 0; tZone.p.copy(intr.position).add(tmpB.set(0, 3.4, 0)); }
      tZone.on = hit;
      CONES.forEach(function (c3, i) { c3.rotation.y += Math.sin(time * .3 + i) * .0006; });
      camAt(progress, time);
      if (SH && (shDirty || ++shN % 4 === 0)) { renderer.shadowMap.needsUpdate = true; shDirty = false; }
      renderer.render(scene, cam);
      placeTags();
    }

    function resize(w, h) {
      W = Math.max(1, w); H = Math.max(1, h);
      renderer.setSize(W, H, false); cam.aspect = W / H;
      cam.fov = W < 700 ? 64 : 50; cam.updateProjectionMatrix();
    }
    function dispose() {
      dead = true;
      scene.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) [].concat(o.material).forEach(function (m) { ['map', 'roughnessMap', 'normalMap'].forEach(function (k) { if (m[k]) m[k].dispose(); }); m.dispose(); });
      });
      [noiseTex, tlTex, fenceTex, envTex, hazeTex].forEach(function (t) { if (t) t.dispose(); });
      renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      if (tags.parentNode) tags.parentNode.removeChild(tags);
    }
    var r0 = host.getBoundingClientRect(); resize(r0.width || 800, r0.height || 500);
    return { update: update, warm: function (done) { (window.INFRAX_WARM || function (r, s, c, d) { d(); })(renderer, scene, cam, done); }, resize: resize, setDpr: function (v) { renderer.setPixelRatio(v); renderer.setSize(W, H, false); }, dispose: dispose };
  }
})();

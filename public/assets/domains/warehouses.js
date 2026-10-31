/* INFRAX.AI domain journey: WAREHOUSES
   A logistics warehouse / distribution centre: yard gate with ANPR, weighbridge, kerbs and bollards; a portal-frame
   shed with ribbed cladding, skylights, a dock canopy, levellers, seals and numbered doors; reefer and box trucks
   reversing to bays with reverse lights; racking aisles with varied loads, a reach truck, pallet jacks, LED high-bays
   and floor markings; a yard video wall. Products here: Access and parking (gate) and Cygnus. All Live (brief-v9).
   Detail pass: I-section portal frame with haunches and purlins, insulated panels on a plinth, ribbed roof with rooflights
   and parapet, sectional dock doors with seals/levellers/bumpers/wheel guides, racking with real pallets and mixed
   loads, finned LED high-bays, counterbalance forklifts and a reach truck with drivers, detailed reefer, trailer and
   rigid box trucks with dummy plates, weighbridge, guardhouse, bollards and yard markings; mobile drops small props.
   Contract: brief-v8 §6. Registers INFRAX_DOMAINS.warehouses; create(host, ctx) builds its own renderer in host. */
(function () {
  'use strict';
  var REG = window.INFRAX_DOMAINS = window.INFRAX_DOMAINS || {};

  REG.warehouses = {
    slug: 'warehouses',
    label: 'Warehouses',
    title: 'Every gate, dock and aisle in one control room',
    intro: 'Plates read at the yard gate, every read of a truck from gate to dock on one timeline, and every dock and aisle camera on one wall. It runs on your own servers.',
    stations: [
      { id: 'gate', product: 'Access and parking', productSlug: 'access-parking', short: 'Yard gate', title: 'The gate reads every truck',
        body: 'An ANPR camera at the yard gate reads the plate and the vehicle class as the truck stops. The barrier opens and the visit is logged against the plate.',
        rows: [['Lane', 'Gate 1 · in'], ['Plate', 'XX 00 AB 1234'], ['Class', 'Truck · 3 axle'], ['Logged', '08:42 IST']],
        live: ['ANPR', 'Vehicle detection & classification'], photo: 'img/factory-gate-sm.webp', photoCaption: 'Illustrative' },
      { id: 'journey', product: 'Cygnus', productSlug: 'cygnus', short: 'Gate to dock', title: 'Gate to dock to exit, on one timeline',
        body: 'Search a plate and Cygnus lines up every camera that saw it: the gate, the dock bay it reversed into and the exit, each with its clip.',
        rows: [['Search', 'XX 00 AB 1234'], ['Gate 1', '08:42'], ['Dock 4', '08:51'], ['Exit', '10:07']],
        live: ['Plate search & journeys'], photo: 'img/warehouse-dock-sm.webp', photoCaption: 'Illustrative' },
      { id: 'wall', product: 'Cygnus', productSlug: 'cygnus', short: 'Video wall', title: 'Docks and aisles on one wall',
        body: 'Every dock, yard and aisle camera on one 3×3 wall, recorded around the clock. Scrub the timeline to any moment and export the clip.',
        rows: [['Cameras', 'Gate · docks · aisles'], ['Recording', '24×7'], ['Playback', 'Timeline · clip export']],
        live: ['Live view & recording', 'Clip export'], photo: 'img/real/tiles/t9-warehouse.webp', photoCaption: 'Illustrative' },
      { id: 'health', product: 'Cygnus', productSlug: 'cygnus', short: 'Camera health', title: 'A blinded camera is flagged at once',
        body: 'When an aisle camera is covered, knocked off its view or drops its stream, Cygnus raises a tamper alert so it is fixed before anyone needs the footage.',
        rows: [['Camera', 'Aisle 3 · CAM 12'], ['Status', 'View blocked'], ['Raised', '14:06 IST']],
        live: ['Camera tamper & health'], photo: 'img/warehouse-aisle-sm.webp', photoCaption: 'Illustrative' },
      { id: 'docks', product: 'Cygnus', productSlug: 'cygnus', short: 'Dock dwell', title: 'Every dock, busy or free, with its dwell time',
        body: 'Cygnus counts the trucks at each bay and times how long each one stays, so the yard team sees which docks are free and which truck has waited too long.',
        rows: [['Docks busy', '4 of 8'], ['Longest dwell', 'Dock 6 · 1 h 18 m'], ['Average dwell', '39 min']],
        live: ['Dock occupancy & dwell', 'Vehicle detection & classification'], photo: 'img/warehouse-bays-sm.webp', photoCaption: 'Illustrative' }
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
      var pos = [], nor = [], colA = [], uvA = [], c = new T.Color();
      parts.forEach(function (pt) {
        var g = pt[0].index ? pt[0].toNonIndexed() : pt[0], p = g.attributes.position.array, n = g.attributes.normal.array, uv = g.attributes.uv ? g.attributes.uv.array : null; c.setHex(pt[1] === undefined ? 0xffffff : pt[1]);
        for (var i = 0; i < p.length; i++) { pos.push(p[i]); nor.push(n[i]); }
        for (var j = 0; j < p.length / 3; j++) { colA.push(c.r, c.g, c.b); uvA.push(uv ? uv[j * 2] : 0, uv ? uv[j * 2 + 1] : 0); }
        g.dispose(); if (g !== pt[0]) pt[0].dispose();
      });
      var G = new T.BufferGeometry(); G.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); G.setAttribute('normal', new T.Float32BufferAttribute(nor, 3)); G.setAttribute('color', new T.Float32BufferAttribute(colA, 3)); G.setAttribute('uv', new T.Float32BufferAttribute(uvA, 2)); return G;
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
    // articulated truck: cab + long box trailer (front = +z)
    function cabDetail(dark, zc, sd) {   // mirrors, lamps, steps and grab handle for a cab whose front face is at zc
      dark.push([bx(.36, .04, .04, sd * 1.38, 2.75, zc - .5), TR], [bx(.06, .56, .25, sd * 1.58, 2.62, zc - .5), TR], [bx(.04, .48, .19, sd * 1.615, 2.62, zc - .5), 0x8FA3B5]);
      dark.push([bx(.06, .3, .2, sd * 1.5, 2.15, zc - .3), TR], [bx(.04, .24, .15, sd * 1.535, 2.15, zc - .3), 0x8FA3B5]);
      dark.push([bx(.38, .18, .05, sd * .85, 1.35, zc + .03), LITE], [bx(.12, .1, .05, sd * 1.1, 1.35, zc + .03), 0xF2A33A]);
      dark.push([bx(.36, .05, .3, sd * 1.12, .62, zc - 2.0), RIM], [bx(.36, .05, .3, sd * 1.12, .95, zc - 2.0), RIM], [bx(.04, .9, .04, sd * 1.22, 2.0, zc - 2.1), RIM]);
      dark.push([bx(.02, 1.5, .02, sd * 1.215, 2.2, zc - .55), TR], [bx(.04, .04, .18, sd * 1.23, 1.95, zc - 1.2), RIM]);   // door seam + handle
    }
    var TRUCK = (function () {
      var cab = [[prof([[4.2, .95], [6.4, .95], [6.48, 1.95], [6.2, 3.1], [4.2, 3.15]], 2.4, .05)], [prof([[4.3, 3.12], [5.7, 3.12], [4.65, 3.78], [4.3, 3.82]], 2.2, .03)]];
      var trailer = [[bx(2.5, 2.7, 11.6, 0, 2.6, -1.9)], [bx(2.54, .18, 11.7, 0, 1.18, -1.9)]];
      var dark = [];
      dark.push([bx(1.9, .35, 13.2, 0, .8, -.9), TR], [bx(2.44, .3, .16, 0, .95, 6.5), TR], [bx(2.24, .85, .08, 0, 2.5, 6.33, -.18), GL], [bx(2.46, .72, 1.05, 0, 2.5, 5.4), GL], [bx(2.3, .1, .1, 0, 3.2, 5.3), LITE]);
      dark.push([bx(2.4, .12, .1, 0, 1.0, -7.8), 0xD6453D], [bx(2.32, .08, .3, 0, 3.17, 6.3), TR]);
      for (var rl = 0; rl < 5; rl++) dark.push([bx(.12, .07, .07, -.5 + rl * .25, 3.24, 6.38), 0xF2A33A]);
      [-1, 1].forEach(function (sd) {
        cabDetail(dark, 6.5, sd);
        dark.push([bx(.5, .1, 1.3, sd * 1.05, 1.12, 5.3), TR], [bx(.5, .1, 2.7, sd * 1.05, 1.12, -6.25), TR], [bx(.05, .45, 4.4, sd * 1.24, .95, -.6), TR], [bx(.5, .5, .03, sd * 1.0, .62, -7.6), TY]);
        dark.push([bx(.12, .9, .12, sd * .85, .75, 2.6), TR], [bx(.32, .06, .32, sd * .85, .31, 2.6), TR]);                       // landing legs
        for (var hg = 0; hg < 4; hg++) dark.push([bx(.07, .12, .05, sd * 1.21, 1.55 + hg * .7, -7.77), TR]);                    // door hinges
        [.35, .95].forEach(function (lb) { dark.push([bx(.045, 2.5, .045, sd * lb, 2.6, -7.79), RIM]); });                       // lock bars
        dark.push([bx(.08, 2.72, .08, sd * 1.25, 2.6, -7.72), RIM]);                                                          // rear corner posts
        for (var mk = 0; mk < 6; mk++) dark.push([bx(.03, .08, .14, sd * 1.265, 1.4, -7 + mk * 2.0), 0xF2A33A]);              // side markers
      });
      dark.push([bx(1.3, .6, .05, 0, 1.78, 6.5), 0x1B2126], [new T.CylinderGeometry(.32, .32, 1.2, 12).rotateX(Math.PI / 2).translate(1.0, .78, 3.6), RIM]);
      dark.push([new T.CylinderGeometry(.07, .07, 1.9, 8).translate(1.02, 3.0, 4.06), TR], [bx(1.2, .1, 1.2, 0, 1.08, 3.55), 0x2B3036], [bx(2.3, .15, .12, 0, .62, -7.62), TR]);
      dark.push([bx(.03, 2.5, .02, 0, 2.6, -7.73), TR], [bx(2.56, .08, 11.72, 0, 3.96, -1.9), RIM]);
      wheelSet(dark, .5, .34, 2.45, [5.3, 2.9, -5.6, -6.9]);
      return { cab: merge(cab), trailer: merge(trailer), dark: merge(dark) };
    })();
    // rigid box truck with a tail lift (front = +z, rear face at z -4.55)
    var BOXT = (function () {
      var cab = [[prof([[2.4, .95], [4.6, .95], [4.68, 1.95], [4.4, 3.0], [2.4, 3.05]], 2.32, .05)]];
      var box = [[bx(2.48, 2.7, 6.6, 0, 2.6, -1.2)], [bx(2.52, .16, 6.7, 0, 1.18, -1.2)]];
      var dark = [[bx(1.9, .35, 8.9, 0, .8, -.1), TR], [bx(2.44, .3, .16, 0, .95, 4.6), TR], [bx(2.2, .85, .08, 0, 2.45, 4.43, -.18), GL], [bx(2.42, .72, 1.05, 0, 2.45, 3.5), GL], [bx(2.3, .1, .1, 0, 3.12, 3.4), LITE]];
      [-1, 1].forEach(function (sd) {
        cabDetail(dark, 4.6, sd);
        dark.push([bx(.5, .1, 1.3, sd * 1.05, 1.12, 3.5), TR], [bx(.5, .1, 2.6, sd * 1.05, 1.12, -2.9), TR], [bx(.05, .4, 3.0, sd * 1.22, .95, .4), TR]);
        dark.push([bx(.2, .14, .05, sd * 1.05, 1.02, -4.6), 0xD6453D], [bx(.08, 2.72, .08, sd * 1.25, 2.6, -4.52), RIM]);
        for (var hg = 0; hg < 4; hg++) dark.push([bx(.07, .12, .05, sd * 1.21, 1.55 + hg * .7, -4.55), TR]);
        [.35, .95].forEach(function (lb) { dark.push([bx(.045, 2.5, .045, sd * lb, 2.6, -4.57), RIM]); });
        for (var mk = 0; mk < 3; mk++) dark.push([bx(.03, .08, .14, sd * 1.265, 1.4, -4 + mk * 2.2), 0xF2A33A]);
      });
      dark.push([bx(1.2, .55, .05, 0, 1.7, 4.6), 0x1B2126], [bx(2.3, .9, .08, 0, .78, -4.66), 0x8E99A4], [bx(.03, 2.5, .02, 0, 2.6, -4.53), TR], [bx(2.56, .08, 6.62, 0, 3.96, -1.2), RIM]);
      dark.push([new T.CylinderGeometry(.06, .06, 1.6, 8).translate(1.0, 2.9, 2.25), TR], [new T.CylinderGeometry(.28, .28, 1.0, 12).rotateX(Math.PI / 2).translate(-1.0, .78, 1.4), RIM]);
      wheelSet(dark, .5, .34, 2.45, [3.5, -2.3, -3.5]);
      return { cab: merge(cab), trailer: merge(box), dark: merge(dark) };
    })();
    var trailerTex = canvasTex(512, 64, function (x, w, h) { x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, w, h); for (var i = 0; i < w; i += 18) { x.fillStyle = 'rgba(40,56,72,.16)'; x.fillRect(i, 0, 3, h); x.fillStyle = 'rgba(255,255,255,.9)'; x.fillRect(i + 3, 0, 2, h); } x.fillStyle = 'rgba(40,56,72,.22)'; x.fillRect(0, 0, w, 3); x.fillRect(0, h - 3, w, 3); });
    function truckGroup(cabCol, trailerCol, kind) {
      var g = new T.Group(), MD = kind === 'box' ? BOXT : TRUCK;
      var c = new T.Mesh(MD.cab, paintM.clone()); c.material.color.setHex(cabCol); g.add(cs(c));
      var tr = new T.Mesh(MD.trailer, boxM.clone()); tr.material.color.setHex(trailerCol); tr.material.map = trailerTex; g.add(cs(tr));
      g.add(cs(new T.Mesh(MD.dark, darkM)));
      if (kind === 'box') plates(g, 4.69, .95, -4.71, .55); else plates(g, 6.69, .82, -7.83, .72);
      scene.add(g); return g;
    }
    // counterbalance forklift (front = +z): profiled body, round counterweight, overhead guard, two-stage mast with lift
    // cylinder and chains, carriage, load backrest, forks, seat, steering wheel, lamps and beacon
    var FORK = (function () {
      var body = [[prof([[-1.05, .22], [.72, .22], [.78, .5], [.74, 1.02], [.25, 1.08], [-.55, 1.08], [-.95, 1.2], [-1.1, 1.0], [-1.12, .4]], 1.08, .04)]];
      var dark = [[new T.CylinderGeometry(.46, .46, 1.12, 18).rotateZ(Math.PI / 2).translate(0, .8, -.8), 0x2B3036]], inner = [], carr = [];
      [-1, 1].forEach(function (sd) {
        dark.push([ROD([sd * .5, 1.0, .55], [sd * .5, 2.15, .35], .035), TR], [ROD([sd * .5, 1.15, -.82], [sd * .5, 2.15, -.75], .035), TR], [bx(.05, .06, 1.2, sd * .5, 2.17, -.2), TR]);
        dark.push([bx(.1, 2.7, .12, sd * .42, 1.5, .98), TR], [bx(.12, .1, .08, sd * .42, 2.08, .42), LITE]);
        inner.push([bx(.08, 2.6, .1, sd * .32, 1.42, 1.07), 0x4A525A], [bx(.03, 2.2, .03, sd * .15, 1.3, 1.13), TR]);
        carr.push([bx(.12, .55, .045, sd * .3, .48, 1.23), TR], [bx(.12, .045, 1.15, sd * .3, .22, 1.8), TR]);
      });
      for (var sl = 0; sl < 5; sl++) dark.push([bx(1.0, .04, .07, 0, 2.17, -.72 + sl * .26), TR]);
      dark.push([bx(.94, .1, .08, 0, 2.82, .98), TR], [bx(.94, .08, .08, 0, .3, .98), TR], [new T.CylinderGeometry(.06, .06, 2.2, 8).translate(0, 1.3, .9), RIM]);
      inner.push([bx(.74, .08, .08, 0, 2.68, 1.07), 0x4A525A]);
      carr.push([bx(1.0, .36, .06, 0, .5, 1.19), TR], [bx(1.0, .04, .04, 0, 1.55, 1.19), TR]);
      for (var br = 0; br < 5; br++) carr.push([bx(.03, .9, .03, -.4 + br * .2, 1.1, 1.19), TR]);
      dark.push([bx(.5, .12, .45, 0, 1.15, -.35), 0x1E2328], [bx(.5, .5, .1, 0, 1.42, -.6), 0x1E2328], [bx(.9, .3, .3, 0, 1.25, .45), 0x23282D]);
      dark.push([new T.TorusGeometry(.15, .025, 6, 16).rotateX(-1.0).translate(0, 1.55, .25), 0x1E2328], [ROD([0, 1.3, .4], [0, 1.55, .25], .025), TR]);
      dark.push([new T.CylinderGeometry(.06, .08, .12, 10).translate(-.35, 2.26, -.7), 0xF2A33A]);
      wheelSet(dark, .3, .25, 1.2, [.55]); wheelSet(dark, .24, .2, 1.1, [-.75]);
      return { body: merge(body), dark: merge(dark), inner: merge(inner), carr: merge(carr) };
    })();
    function palletParts(K, x, y, z, ry) {   // EUR-style pallet: top deck boards, blocks, bottom boards (1.2 along x, 1.0 along z)
      var cy = Math.cos(ry || 0), sy = Math.sin(ry || 0);
      function P(w, h, d, ox, oy, oz) { K.put('matte', BXG(w, h, d, x + ox * cy + oz * sy, y + oy, z - ox * sy + oz * cy, 0, ry || 0), [0xB89466, 0xA88457, 0xC29C6A][(Math.abs(ox * 10 + oz * 7) | 0) % 3]); }
      for (var b = 0; b < 5; b++) P(1.2, .022, .1, 0, .133, -.45 + b * .225);
      [-.52, 0, .52].forEach(function (ox) { [-.45, 0, .45].forEach(function (oz) { P(.14, .078, .1, ox, .083, oz); }); P(.14, .022, 1.0, ox, .033, 0); });
    }
    // counterbalance forklift: the inner mast rises at half the carriage speed; forks sit in the pallet's entries, under its top deck
    function forkGroup() {
      var g = new T.Group(); var b = new T.Mesh(FORK.body, paintM.clone()); b.material.color.setHex(0xE7B53A); g.add(cs(b)); g.add(cs(new T.Mesh(FORK.dark, darkM)));
      var inner = new T.Group(); g.add(inner); inner.add(cs(new T.Mesh(FORK.inner, darkM)));
      var carr = new T.Group(); g.add(carr); carr.add(cs(new T.Mesh(FORK.carr, darkM)));
      var K = kit();
      palletParts(K, 0, .12, 1.78, Math.PI / 2);
      K.put('matte', BXG(1.0, .9, 1.1, 0, .714, 1.78), 0xC9A876); K.put('matte', BXG(.1, .015, 1.11, 0, 1.1715, 1.78), 0xA8865A); K.put('paint', BXG(.25, .18, .01, .2, .84, 2.335), 0xF4F6F8);
      K.build(carr, true);
      var K2 = kit(); operator(K2, 0, 1.2, -.35, false); K2.build(g, true);
      var arms = new T.Group(); arms.position.set(0, 1.7, -.35); g.add(arms); var K3 = kit(); operatorArms(K3, 0, -.5, 0); K3.build(arms, true);
      g.userData = { carr: carr, inner: inner, arms: arms, lift: 0, stopT: 0, nextStop: 0 };
      scene.add(g); return g;
    }
    // driver / picker: hi-vis with reflective bands and braces, neck, head, hard hat with brim, legs (arms built separately so they move)
    function operator(K, x, y, z, standing, hat) {
      K.put('matte', BXG(.4, .5, .25, x, y + .3, z), 0x2D4A6B); K.put('matte', BXG(.44, .38, .28, x, y + .34, z), 0xD7E83A);
      [.22, .42].forEach(function (yy) { K.put('lamp', BXG(.45, .045, .285, x, y + yy, z), 0xDDE3E8); });
      [-.11, .11].forEach(function (xx) { K.put('lamp', BXG(.05, .36, .29, x + xx, y + .34, z), 0xDDE3E8); });
      K.put('matte', BXG(.1, .1, .1, x, y + .59, z), 0xA9805E); K.put('matte', G(new T.SphereGeometry(.13, 12, 10), x, y + .72, z), 0xA9805E);
      K.put('paint', G(new T.SphereGeometry(.15, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), x, y + .77, z), hat || 0xFFFFFF); K.put('paint', G(CY(.19, .19, .025, 16), x, y + .775, z + .02), hat || 0xFFFFFF);
      [-1, 1].forEach(function (sd) {
        if (standing) { K.put('matte', BXG(.15, .78, .18, x + sd * .1, y - .37, z), 0x24344A); K.put('matte', BXG(.17, .12, .3, x + sd * .1, y - .8, z + .05), 0x1E1B19); }
        else { K.put('matte', BXG(.15, .14, .45, x + sd * .1, y + .03, z + .2), 0x24344A); K.put('matte', BXG(.13, .45, .14, x + sd * .1, y - .2, z + .4), 0x24344A); }
      });
    }
    function operatorArms(K, x, y, z) {   // shoulders at the group origin (y = shoulder height offset), hands forward on the controls
      [-1, 1].forEach(function (sd) { K.put('matte', ROD([x + sd * .22, y + .5, z], [x + sd * .2, y + .3, z + .34], .055), 0x2D4A6B); K.put('matte', G(new T.SphereGeometry(.05, 8, 6), x + sd * .2, y + .29, z + .38), 0x2B3036); });
    }
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

    /* ---------- ground: blueprint grid, yard concrete, bay markings ---------- */
    var gridPts = [];
    for (var gx = -120; gx <= 120; gx += 6) gridPts.push(gx, 0.01, -140, gx, 0.01, 120);
    for (var gz = -140; gz <= 120; gz += 6) gridPts.push(-120, 0.01, gz, 120, 0.01, gz);
    var gridG = new T.BufferGeometry(); gridG.setAttribute('position', new T.Float32BufferAttribute(gridPts, 3));
    scene.add(new T.LineSegments(gridG, new T.LineBasicMaterial({ color: 0x9CC0E0, transparent: true, opacity: .35 })));
    var grnd = add(new T.PlaneGeometry(1000, 1000).rotateX(-Math.PI / 2), M(0xEEF2F6, { roughness: .95 }), 0, 0, -10); cs(grnd, true);
    var yardTex = canvasTex(1024, 1024, function (x, w, h) { noise(x, w, h, '#B8BEC4', 26000, .12); x.strokeStyle = 'rgba(70,78,86,.18)'; x.lineWidth = 2; for (var i = 0; i < 9; i++) { x.beginPath(); x.moveTo(0, i * 128); x.lineTo(w, i * 128); x.stroke(); x.beginPath(); x.moveTo(i * 128, 0); x.lineTo(i * 128, h); x.stroke(); } }, [6, 6]);
    var yard = add(new T.PlaneGeometry(96, 70).rotateX(-Math.PI / 2), decal(M(0xffffff, { map: yardTex, roughness: .92 }), 2), 0, .02, 2); cs(yard, true);
    // approach road outside the gate
    var roadTex = canvasTex(512, 512, function (x, w, h) { noise(x, w, h, '#7E868D', 14000, .14); }, [2, 10]);
    add(new T.PlaneGeometry(14, 60).rotateX(-Math.PI / 2), decal(M(0xffffff, { map: roadTex, roughness: .9 }), 3), -4.6, .021, 66);
    var paintW = decal(B(0xF4F6F8), 5), paintY = decal(B(0xE7C33A), 5);
    for (var bi = 0; bi < 9; bi++) { var bxp = -37 + bi * 8; add(new T.PlaneGeometry(.18, 16).rotateX(-Math.PI / 2), paintY, bxp, .03, -21); }
    for (var dz = 0; dz < 12; dz++) add(new T.PlaneGeometry(.22, 2.2).rotateX(-Math.PI / 2), paintW, -5.4, .03, 36 + dz * 4);
    add(new T.PlaneGeometry(3, .4).rotateX(-Math.PI / 2), paintW, -3, .03, 29.6); add(new T.PlaneGeometry(3, .4).rotateX(-Math.PI / 2), paintW, -7.8, .03, 26.8); // stop lines at the barriers

    /* ---------- the shed: steel portal frame (I-section columns and rafters, haunches, purlins, bracing), insulated wall
       panels on a concrete plinth, ribbed roof sheets with rooflights, parapet and coping, downpipes; sectional dock doors
       with foam seals, levellers, lips, bumpers and wheel guides under a lit canopy ---------- */
    var fm4 = new T.Matrix4(), fpv = new T.Vector3(), fsv = new T.Vector3(), fq = new T.Quaternion();
    function boxList(list, mat, shadow) {
      var g = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), mat, Math.max(1, list.length));
      list.forEach(function (b, i) { fm4.compose(fpv.set(b[0], b[1], b[2]), fq, fsv.set(b[3], b[4], b[5])); g.setMatrixAt(i, fm4); });
      g.count = list.length; if (shadow && SH) g.castShadow = true; if (SH) g.receiveShadow = true; scene.add(g); return g;
    }
    var cladTex = canvasTex(1024, 1024, function (x, w, h) {
      x.fillStyle = '#EEF1F4'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#2673B5'; x.fillRect(0, 0, w, h * .2); x.fillStyle = '#1B5A94'; x.fillRect(0, h * .2, w, 6);
      for (var i = 0; i < w; i += 8) { x.fillStyle = 'rgba(30,50,70,.035)'; x.fillRect(i, h * .2 + 6, 2, h); }
      var ph = (h * .8 - 6) / 11;
      for (var j = 1; j < 11; j++) { var y = h * .2 + 6 + j * ph; x.fillStyle = 'rgba(20,34,48,.26)'; x.fillRect(0, y, w, 3); x.fillStyle = 'rgba(255,255,255,.75)'; x.fillRect(0, y + 3, w, 2); }
      for (var k = 0; k < w; k += 256) { x.fillStyle = 'rgba(20,34,48,.10)'; x.fillRect(k, h * .2 + 6, 2, h); }
    }, [6, 1]);
    var cladM = M(0xffffff, { map: cladTex, roughness: .5, metalness: .2 });
    var SH_X0 = -42, SH_X1 = 42, SH_Z0 = -72, SH_Z1 = -30, SH_H = 14, DOOR_X0 = 27, DOOR_X1 = 35, DOOR_H = 8, RCZ = (SH_Z0 + SH_Z1) / 2;
    function wall(x0, x1, y0, y1, z, m) { var o = add(new T.BoxGeometry(x1 - x0, y1 - y0, .5), m, (x0 + x1) / 2, (y0 + y1) / 2, z); cs(o); return o; }
    wall(SH_X0, DOOR_X0, 0, SH_H, SH_Z1, cladM);
    wall(DOOR_X1, SH_X1, 0, SH_H, SH_Z1, cladM);
    wall(DOOR_X0, DOOR_X1, DOOR_H, SH_H, SH_Z1, cladM);
    var back = add(new T.BoxGeometry(SH_X1 - SH_X0, SH_H, .5), cladM, 0, SH_H / 2, SH_Z0); cs(back);
    [SH_X0, SH_X1].forEach(function (x) { var s = add(new T.BoxGeometry(.5, SH_H, SH_Z1 - SH_Z0), cladM, x, SH_H / 2, RCZ); cs(s); });
    var roofTex = canvasTex(512, 512, function (x, w, h) { x.fillStyle = '#D3DAE1'; x.fillRect(0, 0, w, h); for (var i = 0; i < h; i += 16) { x.fillStyle = 'rgba(40,56,72,.24)'; x.fillRect(0, i, w, 3); x.fillStyle = 'rgba(255,255,255,.55)'; x.fillRect(0, i + 4, w, 3); } }, [1, 4]);
    var roof = add(new T.BoxGeometry(SH_X1 - SH_X0 + 1.2, .5, SH_Z1 - SH_Z0 + 1.2), M(0xffffff, { map: roofTex, roughness: .5, metalness: .35 }), 0, SH_H + .25, RCZ); if (SH) roof.receiveShadow = true; // roof casts no shadow so the interior stays readable
    var floorTex = canvasTex(512, 512, function (x, w, h) { noise(x, w, h, '#D9DEE3', 9000, .08); x.strokeStyle = 'rgba(90,100,110,.25)'; x.lineWidth = 2; x.strokeRect(0, 0, w, h); }, [14, 7]);
    add(new T.PlaneGeometry(SH_X1 - SH_X0, SH_Z1 - SH_Z0).rotateX(-Math.PI / 2), M(0xffffff, { map: floorTex, roughness: .35, metalness: .05 }), 0, .03, RCZ);
    // rooflights: translucent strips in the ribbed sheets
    // raised rooflights glowing with the lit hall below (upstand frame + glazing), roof plant, a PV array and a roof walkway
    var skyM = M(0xE2EEF8, { roughness: .1, metalness: .2, emissive: 0xBFD9F0, emissiveIntensity: .7 }), skyP = [];
    for (var rzl = SH_Z1 - 5; rzl > SH_Z0 + 2; rzl -= 6) [-30, -10, 10, 30].forEach(function (rxl) { skyP.push([rxl, rzl]); });
    var skyI = new T.InstancedMesh(new T.BoxGeometry(9, .14, 1.1), skyM, skyP.length), skyF = new T.InstancedMesh(new T.BoxGeometry(9.3, .2, 1.4), M(0xAEB8C2, { roughness: .5, metalness: .5 }), skyP.length);
    skyP.forEach(function (s, i) { fm4.makeTranslation(s[0], SH_H + .63, s[1]); skyI.setMatrixAt(i, fm4); fm4.makeTranslation(s[0], SH_H + .55, s[1]); skyF.setMatrixAt(i, fm4); }); scene.add(skyF); scene.add(skyI);
    var RFK = kit();
    for (var hz = SH_Z1 - 8; hz > SH_Z0 + 4; hz -= 12) {
      RFK.put('paint', BXG(3.2, 1.3, 2.2, 0, SH_H + 1.15, hz), 0xE4E9EE); RFK.put('metal', BXG(3.3, .1, 2.3, 0, SH_H + .55, hz), 0x8E99A4);
      [-.8, .8].forEach(function (fx) { RFK.put('metal', G(CY(.55, .55, .06, 18), fx, SH_H + 1.82, hz), 0x2B3036); RFK.put('metal', G(CY(.12, .12, .1, 10), fx, SH_H + 1.86, hz), 0x8E99A4); });
      RFK.put('metal', BXG(.4, .4, 3.5, 1.2, SH_H + .75, hz + 2.6), 0xC4CCD3);
    }
    for (var vz = SH_Z1 - 8; vz > SH_Z0 + 2; vz -= 12) [-30, -10, 10, 30].forEach(function (vx) { RFK.put('paint', BXG(1.6, .45, .9, vx, SH_H + .72, vz), 0xD5DCE3); RFK.put('glass', BXG(1.5, .04, .8, vx, SH_H + .96, vz), 0x6F8BA6); });   // smoke vents
    RFK.put('paint', BXG(1.4, .03, SH_Z1 - SH_Z0 - 2, -3.2, SH_H + .51, RCZ), 0xE7C33A); RFK.put('paint', BXG(1.4, .03, SH_Z1 - SH_Z0 - 2, 3.2, SH_H + .51, RCZ), 0xE7C33A);
    RFK.build(scene, true);
    if (!MOB) {
      var pvP = []; [-20, 20].forEach(function (px) { for (var pz = SH_Z1 - 3.5; pz > SH_Z0 + 3; pz -= 3) for (var pc = 0; pc < 5; pc++) pvP.push([px - 3.6 + pc * 1.8 - (px > 0 ? 0 : 0), pz]); });
      var pvTex = canvasTex(64, 128, function (x, w, h) { x.fillStyle = '#23405E'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(180,205,230,.5)'; x.lineWidth = 2; for (var i = 0; i <= w; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } for (var j = 0; j <= h; j += 16) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); } x.strokeStyle = '#C9D3DC'; x.lineWidth = 4; x.strokeRect(0, 0, w, h); });
      var pvI = new T.InstancedMesh(new T.BoxGeometry(1.7, .04, 1.0), M(0xffffff, { map: pvTex, roughness: .25, metalness: .6 }), pvP.length), pvq = new T.Quaternion().setFromAxisAngle(new T.Vector3(1, 0, 0), .17);
      pvP.forEach(function (p, i) { fm4.compose(fpv.set(p[0], SH_H + .78, p[1]), pvq, fsv.set(1, 1, 1)); pvI.setMatrixAt(i, fm4); }); if (SH) pvI.castShadow = true; scene.add(pvI);
    }
    var SK = kit(), RXW = SH_X1 - SH_X0 + 1.2, RZW = SH_Z1 - SH_Z0 + 1.2;
    [SH_Z1 + .45, SH_Z0 - .45].forEach(function (z) { SK.put('paint', BXG(RXW, .8, .25, 0, SH_H + .9, z), 0xE9EDF1); SK.put('paint', BXG(RXW + .1, .08, .37, 0, SH_H + 1.34, z), 0x2673B5); });
    [SH_X0 - .45, SH_X1 + .45].forEach(function (x) { SK.put('paint', BXG(.25, .8, RZW, x, SH_H + .9, RCZ), 0xE9EDF1); SK.put('paint', BXG(.37, .08, RZW + .1, x, SH_H + 1.34, RCZ), 0x2673B5); });
    // concrete plinth along the walls, downpipes between the docks
    [[SH_X0, DOOR_X0], [DOOR_X1, SH_X1]].forEach(function (r) { SK.put('matte', BXG(r[1] - r[0], 1.2, .12, (r[0] + r[1]) / 2, .6, SH_Z1 + .31), 0xB9BEC3); });
    SK.put('matte', BXG(SH_X1 - SH_X0, 1.2, .12, 0, .6, SH_Z0 - .31), 0xB9BEC3);
    [SH_X0 - .31, SH_X1 + .31].forEach(function (x) { SK.put('matte', BXG(.12, 1.2, SH_Z1 - SH_Z0, x, .6, RCZ), 0xB9BEC3); });
    [-32, -16, 0, 16].forEach(function (x) { SK.put('metal', BXG(.14, SH_H + .4, .14, x, (SH_H + .4) / 2 + .1, SH_Z1 + .35), 0xC4CCD3); SK.put('metal', BXG(.18, .3, .3, x, .25, SH_Z1 + .45), 0xC4CCD3); });
    // portal frames: I-section columns and rafters (instanced), haunches, base plates, purlins, roof and wall bracing
    var steelM = M(0x6E8396, { roughness: .45, metalness: .6 });
    var colG = merge([[BXG(.03, 1, .4, -.235, .5, 0)], [BXG(.03, 1, .4, .235, .5, 0)], [BXG(.44, 1, .025, 0, .5, 0)]]);
    var rafG = merge([[BXG(1, .03, .3, 0, .285, 0)], [BXG(1, .03, .3, 0, -.285, 0)], [BXG(1, .54, .02, 0, 0, 0)]]);
    var FZS = []; for (var fz = SH_Z1 - 4; fz > SH_Z0; fz -= 8) FZS.push(fz);
    var colI = new T.InstancedMesh(colG, steelM, FZS.length * 2), rafI = new T.InstancedMesh(rafG, steelM, FZS.length);
    function haunch(x0, dir, y0, z) { var s = new T.Shape(); s.moveTo(x0, y0); s.lineTo(x0 + dir * 2.6, y0); s.lineTo(x0, y0 - .75); s.lineTo(x0, y0); return new T.ExtrudeGeometry(s, { depth: .02, bevelEnabled: false }).translate(0, 0, z - .01); }
    FZS.forEach(function (z, i) {
      [SH_X0 + .55, SH_X1 - .55].forEach(function (x, k) { fm4.compose(fpv.set(x, 0, z), fq, fsv.set(1, SH_H - .35, 1)); colI.setMatrixAt(i * 2 + k, fm4); SK.put('metal', BXG(.62, .04, .6, x, .02, z), 0x3A4048); });
      fm4.compose(fpv.set(0, SH_H - .65, z), fq, fsv.set(SH_X1 - SH_X0 - 1.6, 1, 1)); rafI.setMatrixAt(i, fm4);
      [-1, 1].forEach(function (sd) { var x0 = sd * (SH_X1 - .8); SK.put('metal', haunch(x0, -sd, SH_H - .94, z), 0x6E8396); SK.put('metal', ROD([x0, SH_H - 1.69, z], [x0 - sd * 2.6, SH_H - .95, z], .025, 4), 0x6E8396); });
    });
    if (SH) { colI.castShadow = true; colI.receiveShadow = true; rafI.receiveShadow = true; } scene.add(colI); scene.add(rafI);
    var purl = []; for (var pxl = SH_X0 + 3; pxl < SH_X1 - 1; pxl += 3) purl.push([pxl, SH_H - .22, RCZ, .08, .2, SH_Z1 - SH_Z0 - .6]);
    boxList(purl, M(0xB8C0C8, { roughness: .4, metalness: .7 }), false);
    if (!MOB) {
      [[FZS[0], FZS[1]], [FZS[FZS.length - 2], FZS[FZS.length - 1]]].forEach(function (bay) {
        for (var bx0 = -40; bx0 < 40; bx0 += 10) { SK.put('metal', ROD([bx0, SH_H - .36, bay[0]], [bx0 + 10, SH_H - .36, bay[1]], .02, 4), 0x8E99A4); SK.put('metal', ROD([bx0 + 10, SH_H - .36, bay[0]], [bx0, SH_H - .36, bay[1]], .02, 4), 0x8E99A4); }
        [SH_X0 + .35, SH_X1 - .35].forEach(function (x) { SK.put('metal', ROD([x, .5, bay[0]], [x, SH_H - 1, bay[1]], .025, 4), 0x8E99A4); SK.put('metal', ROD([x, .5, bay[1]], [x, SH_H - 1, bay[0]], .025, 4), 0x8E99A4); });
      });
    }
    SK.build(scene, true);
    // dock doors: sectional panels with a vision row, foam seals with guide stripes, leveller deck and lip, laminated
    // bumpers, hazard-striped dock face, wheel guides, dock light on its arm, signal head, control box, number board
    var shutterTex = canvasTex(256, 256, function (x, w, h) {
      x.fillStyle = '#D3DAE1'; x.fillRect(0, 0, w, h); var ph = h / 5;
      for (var j = 0; j < 5; j++) { x.fillStyle = 'rgba(30,46,62,.07)'; x.fillRect(0, j * ph + ph * .33, w, 2); x.fillRect(0, j * ph + ph * .66, w, 2); }
      for (var i = 1; i < 5; i++) { x.fillStyle = 'rgba(30,46,62,.4)'; x.fillRect(0, i * ph - 2, w, 3); x.fillStyle = 'rgba(255,255,255,.6)'; x.fillRect(0, i * ph + 1, w, 2); }
      x.fillStyle = '#22303D'; for (var k = 0; k < 4; k++) x.fillRect(18 + k * 60, ph + 12, 44, ph - 24);
      x.fillStyle = '#E7C33A'; x.fillRect(0, h - 10, w, 10);
    });
    var shutterM = M(0xffffff, { map: shutterTex, roughness: .45, metalness: .35 });
    var hazTex = canvasTex(256, 32, function (x, w, h) { x.fillStyle = '#1B2126'; x.fillRect(0, 0, w, h); x.fillStyle = '#E7C33A'; for (var i = -h; i < w + h; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 16, 0); x.lineTo(i + 16 - h, h); x.lineTo(i - h, h); x.fill(); } });
    var hazI = new T.InstancedMesh(new T.PlaneGeometry(3.2, .2), M(0xffffff, { map: hazTex, roughness: .6 }), 8);
    var DOCKS = [], dockRed = B(0xE0453C), dockGreen = B(0x3FC07A), dockRedOff = B(0x4A2622), dockGreenOff = B(0x1F3A2A), DOCK_Z = -21.3, DKK = kit(), YEL = 0xE7C33A, ZF = SH_Z1;
    // 3 m x 3 m sectional doors over a 1.2 m dock: the door rolls up into its head when a trailer is docked, then the leveller
    // rises, its lip swings out and the deck settles onto the trailer bed. Behind the door the opening shows the dim hall.
    var DW2 = 3.0, DH2 = 3.0, DFL = 1.2, DTOP = DFL + DH2;
    var openTex = canvasTex(64, 64, function (x, w, h) { var g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#20272E'); g.addColorStop(.7, '#39424B'); g.addColorStop(1, '#5A646E'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
    var openM = decal(B(0xffffff, { map: openTex }), 1), levM = M(0x8E99A4, { metalness: .6, roughness: .45 }), lipM = M(0x6E7882, { metalness: .6, roughness: .45 });
    for (var d = 0; d < 8; d++) {
      var x = -36 + d * 8;
      add(new T.PlaneGeometry(DW2, DH2), openM, x, DFL + DH2 / 2, ZF + .262);
      var sm = decal(shutterM.clone(), 3); sm.map = shutterTex.clone(); sm.map.needsUpdate = true;
      var shut = add(new T.PlaneGeometry(DW2, DH2), sm, x, DFL + DH2 / 2, ZF + .3);
      DKK.put('matte', BXG(DW2, .45, .9, x, DTOP + .225, ZF + .7), 0x23292F); DKK.put('paint', BXG(DW2 - .2, .06, .02, x, DTOP + .1, ZF + 1.16), YEL);
      DKK.put('metal', BXG(DW2 + .9, .55, .45, x, DTOP + .72, ZF + .48), 0x5A646E);                                     // roll-up head box
      [-1, 1].forEach(function (sd) { var sx = sd * (DW2 / 2 + .19); DKK.put('matte', BXG(.38, DH2 + .45, .9, x + sx, DFL + (DH2 + .45) / 2, ZF + .7), 0x23292F); DKK.put('paint', BXG(.06, DH2, .02, x + sx, DFL + DH2 / 2, ZF + 1.16), YEL); DKK.put('metal', BXG(.08, DH2 + .5, .08, x + sd * (DW2 / 2 + .04), DFL + (DH2 + .5) / 2, ZF + .3), 0x8E99A4); });
      DKK.put('matte', BXG(3.2, 1.2, .5, x, .6, ZF + .4), 0xAEB6BE);
      [-1.25, 1.25].forEach(function (sx) { DKK.put('matte', BXG(.42, .52, .26, x + sx, 1.0, ZF + .78), 0x15181B); if (!MOB) for (var bl = 0; bl < 4; bl++) DKK.put('matte', BXG(.43, .02, .27, x + sx, .8 + bl * .13, ZF + .78), 0x30363C); });
      [-1.62, 1.62].forEach(function (sx) { DKK.put('paint', BXG(.16, .16, 3.4, x + sx, .08, ZF + 2.4), YEL); DKK.put('paint', BXG(.16, .5, .16, x + sx, .25, ZF + 4.1), YEL); });
      DKK.put('metal', BXG(.05, .05, 1.0, x + 2.6, 5.4, ZF + .75), 0x5A646E); DKK.put('lamp', G(CY(.12, .16, .14, 12), x + 2.6, 5.35, ZF + 1.25), 0xFFE7A8);
      DKK.put('metal', BXG(.26, .62, .18, x + 2.75, 4.3, ZF + .32), 0x22282E);
      DKK.put('paint', BXG(.3, .4, .16, x - 2.75, 1.6, ZF + .32), 0xE9EDF1); DKK.put('lamp', BXG(.08, .08, .02, x - 2.75, 1.68, ZF + .41), 0x3FC07A); DKK.put('lamp', BXG(.08, .08, .02, x - 2.75, 1.54, ZF + .41), 0xE0453C);
      add(new T.PlaneGeometry(1.6, .55), B(0xffffff, { map: board('DOCK ' + (d + 1), { size: 70, h: 150, w: 440 }) }), x, 6.3, ZF + .28);
      var lampR = add(new T.SphereGeometry(.09, 10, 8), dockRedOff, x + 2.75, 4.46, ZF + .43), lampG = add(new T.SphereGeometry(.09, 10, 8), dockGreenOff, x + 2.75, 4.16, ZF + .43);
      fm4.makeTranslation(x, 1.08, ZF + .656); hazI.setMatrixAt(d, fm4);
      // leveller: deck hinged at the door line, lip hinged at the deck's front edge
      var lev = new T.Group(); lev.position.set(x, DFL + .02, ZF + .28); scene.add(lev);
      cs(add(new T.BoxGeometry(2.0, .08, .62), levM, 0, -.04, .31, lev));
      var lip = new T.Group(); lip.position.set(0, -.02, .62); lev.add(lip); cs(add(new T.BoxGeometry(2.0, .04, .42), lipM, 0, -.02, .21, lip)); lip.rotation.x = 1.45;
      DOCKS.push({ x: x, shut: shut, sm: sm, lev: lev, lip: lip, o: 0, l: 0, still: 0, r: lampR, g: lampG });
    }
    scene.add(hazI);
    // big open door frame (with bollards) + façade name board
    add(new T.BoxGeometry(.4, DOOR_H, .7), M(0xE7C33A, { roughness: .6 }), DOOR_X0 + .2, DOOR_H / 2, SH_Z1 + .2);
    add(new T.BoxGeometry(.4, DOOR_H, .7), M(0xE7C33A, { roughness: .6 }), DOOR_X1 - .2, DOOR_H / 2, SH_Z1 + .2);
    DKK.put('metal', BXG(DOOR_X1 - DOOR_X0, .6, .5, (DOOR_X0 + DOOR_X1) / 2, DOOR_H + .3, SH_Z1 + .3), 0x5A646E);
    add(new T.PlaneGeometry(14, 2.2), B(0xffffff, { map: board('DISTRIBUTION CENTRE · YARD A', { size: 66, h: 150, w: 1100 }) }), -8, 11.4, SH_Z1 + .28);
    // dock canopy: deck, fascia, beams, tie rods back to the wall, a downlight over every dock
    var canopyM = M(0xDCE2E8, { roughness: .5, metalness: .35 });
    cs(add(new T.BoxGeometry(66, .3, 3.8), canopyM, -7, 7.3, SH_Z1 + 1.9));
    add(new T.BoxGeometry(66, .35, .2), M(0x2673B5, { roughness: .5 }), -7, 7.15, SH_Z1 + 3.8);
    for (var cr = -34; cr <= 24; cr += 8) { DKK.put('metal', ROD([cr, 7.45, SH_Z1 + 3.6], [cr, 10.3, SH_Z1 + .3], .05), 0x6E8396); DKK.put('metal', BXG(.15, .3, 3.8, cr, 7.0, SH_Z1 + 1.9), 0x6E8396); }
    DOCKS.forEach(function (dk) { DKK.put('lamp', G(CY(.28, .28, .04, 16), dk.x, 7.13, SH_Z1 + 2.2), 0xF7FAFF); });
    DKK.build(scene, true);

    /* interior: selective racking (perforated uprights with zig-zag bracing, orange beams, row-end guards) holding mixed
       loads on real pallets (cased cartons, stretch-wrapped, drums); floor stacks; LED high-bays; ceiling domes */
    var m4 = new T.Matrix4(), col = new T.Color();
    var rnd = (function () { var sd = 11; return function () { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }; })();
    // rows: back-to-back pair west, then a 3.7 m reach-truck aisle, aisle 3 (4.9 m, counterbalance), and a 3.0 m aisle by the wall
    var RACK_ROWS = MOB ? [23.5, 28.4, 34.4] : [19.5, 23.5, 28.4, 34.4, 38.5], RSLOT = { x: 28.4, z: -46.8, ly: 5.4 };
    var perfTex = canvasTex(32, 256, function (x, w, h) { x.fillStyle = '#1B5A94'; x.fillRect(0, 0, w, h); x.fillStyle = '#0D2C4A'; for (var i = 6; i < h; i += 14) { x.fillRect(10, i, 4, 7); x.fillRect(18, i, 4, 7); } }, [1, 6]);
    var uprM = M(0xffffff, { map: perfTex, roughness: .45, metalness: .5 }), beamM = M(0xE58A2B, { roughness: .45, metalness: .45 });
    var upr = [], beam = [], braceL = [], guards = [], LOADS = [], LEV = [1.8, 3.6, 5.4, 7.2, 9.0], palCols = [0xC9A876, 0xB89666, 0xD8C29A, 0x9FB4C8, 0xDCE3EA];
    RACK_ROWS.forEach(function (rx) {
      for (var z = -34; z >= -68; z -= 3) {
        upr.push([rx - .55, z]); upr.push([rx + .55, z]);
        for (var k = 0; k < 8; k++) { var y0 = .25 + k * 1.2, a = k % 2 ? -1 : 1; braceL.push({ a: [rx - a * .5, y0, z], b: [rx + a * .5, y0 + 1.2, z], r: .022 }); }
        braceL.push({ a: [rx - .5, .2, z], b: [rx + .5, .2, z], r: .022 });
      }
      for (var z2 = -35.5; z2 >= -66.5; z2 -= 3) {
        LEV.forEach(function (ly) { beam.push([rx - .55, ly, z2]); beam.push([rx + .55, ly, z2]); });
        [0].concat(LEV).forEach(function (ly) { [-.7, .7].forEach(function (oz) { var r0 = rnd(), h0 = .85 + rnd() * (ly === 9.0 ? .25 : .5), t0 = rnd(); if (rx === RSLOT.x && ly === RSLOT.ly && Math.abs(z2 + oz - RSLOT.z) < .1) return; if (r0 < .86) LOADS.push({ x: rx, y: ly ? ly + .048 : .008, z: z2 + oz, h: h0, t: t0 }); }); });   // pallets sit on the beam tops / the floor
      }
      [-33.5, -68.5].forEach(function (z) { [-.55, .55].forEach(function (o) { guards.push([rx + o, .35, z, .3, .7, .3]); }); });
    });
    for (var s2 = 0; s2 < (MOB ? 10 : 22); s2++) LOADS.push({ x: -30 + (s2 % 11) * 4.4, y: .008, z: -40 - Math.floor(s2 / 11) * 6, h: 1.0 + rnd() * 1.1, t: rnd() });
    for (var wr = 0; wr < 8; wr++) LOADS.push({ x: -28 + wr * 4.4, y: .008, z: -40.2, h: 1.45, t: .6 });
    for (var sp2 = 0; sp2 < 4; sp2++) LOADS.push({ x: -38.6 + (sp2 % 2) * 1.6, y: -.002, z: -4.2 + Math.floor(sp2 / 2) * 2.2, h: 1.0 + (sp2 % 2) * .6, t: sp2 % 2 ? .1 : .7 });
    var uprI = new T.InstancedMesh(new T.BoxGeometry(.12, 10.2, .12), uprM, upr.length); upr.forEach(function (u, i) { m4.makeTranslation(u[0], 5.1, u[1]); uprI.setMatrixAt(i, m4); }); scene.add(cs(uprI));
    var beamI = new T.InstancedMesh(new T.BoxGeometry(.1, .14, 3), beamM, beam.length); beam.forEach(function (b, i) { m4.makeTranslation(b[0], b[1], b[2]); beamI.setMatrixAt(i, m4); }); scene.add(beamI);
    rodInst(braceL, M(0x1B5A94, { roughness: .45, metalness: .5 }), 5, false); boxList(guards, M(0xE7C33A, { roughness: .5 }), false);
    // pallets and loads, instanced by kind
    function palletGeo() { var parts = []; palletParts({ put: function (k, g, c) { parts.push([g, c]); } }, 0, 0, 0, 0); return merge(parts); }
    var cartonTex = canvasTex(256, 256, function (x, w, h) {
      x.fillStyle = '#CDAA78'; x.fillRect(0, 0, w, h);
      for (var r = 0; r < 4; r++) { var y = r * 64, off = r % 2 ? 32 : 0; x.fillStyle = 'rgba(90,64,36,.5)'; x.fillRect(0, y, w, 3); for (var c = -1; c < 5; c++) x.fillRect(c * 64 + off, y, 3, 64); x.fillStyle = 'rgba(214,190,150,.9)'; for (var c2 = -1; c2 < 5; c2++) x.fillRect(c2 * 64 + off + 4, y + 28, 57, 8); if (r % 2 === 0) { x.fillStyle = '#F4F2EE'; x.fillRect(off + 12, y + 42, 22, 14); } }
    });
    var wrapTex = canvasTex(128, 128, function (x, w, h) { x.fillStyle = '#DCE6EE'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(150,120,80,.35)'; for (var r = 0; r < 4; r++) x.fillRect(0, r * 32, w, 2); for (var c = 0; c < 4; c++) x.fillRect(c * 32 + (c % 2) * 6, 0, 2, h); for (var i = 0; i < 18; i++) { x.strokeStyle = 'rgba(255,255,255,' + (.25 + Math.random() * .4) + ')'; x.lineWidth = 2 + Math.random() * 4; x.beginPath(); var y0 = Math.random() * h; x.moveTo(0, y0); x.lineTo(w, y0 - 30 + Math.random() * 60); x.stroke(); } });
    var drumParts = [];
    [[-.3, -.25], [.3, -.25], [-.3, .25], [.3, .25]].forEach(function (o) { drumParts.push([G(CY(.27, .27, .86, 18), o[0], .43, o[1]), 0xFFFFFF], [G(CY(.275, .275, .03, 18), o[0], .3, o[1]), 0xC9CED3], [G(CY(.275, .275, .03, 18), o[0], .6, o[1]), 0xC9CED3], [G(CY(.25, .25, .02, 18), o[0], .87, o[1]), 0xC9CED3]); });
    var LC = { c: [], w: [], d: [] };
    LOADS.forEach(function (L) { (L.t < .5 ? LC.c : L.t < .84 ? LC.w : LC.d).push(L); });
    var palI = new T.InstancedMesh(palletGeo(), new T.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: .9 }), LOADS.length);
    var carI = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), M(0xffffff, { map: cartonTex, roughness: .85 }), Math.max(1, LC.c.length));
    var wraI = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), M(0xffffff, { map: wrapTex, roughness: .22, metalness: .05 }), Math.max(1, LC.w.length));
    var druI = new T.InstancedMesh(merge(drumParts), new T.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: .35, metalness: .45 }), Math.max(1, LC.d.length));
    LOADS.forEach(function (L, i) { m4.makeTranslation(L.x, L.y, L.z); palI.setMatrixAt(i, m4); });
    LC.c.forEach(function (L, i) { fm4.compose(fpv.set(L.x, L.y + .144 + L.h / 2, L.z), fq, fsv.set(1.12, L.h, .96)); carI.setMatrixAt(i, fm4); carI.setColorAt(i, col.setHex([0xFFFFFF, 0xF3E7D6, 0xE6D8C2, 0xFFF6E8][i % 4])); });
    LC.w.forEach(function (L, i) { fm4.compose(fpv.set(L.x, L.y + .144 + L.h / 2, L.z), fq, fsv.set(1.16, L.h, 1.0)); wraI.setMatrixAt(i, fm4); wraI.setColorAt(i, col.setHex([0xFFFFFF, 0xE8F0F8, 0xF6F4EE][i % 3])); });
    LC.d.forEach(function (L, i) { m4.makeTranslation(L.x, L.y + .144, L.z); druI.setMatrixAt(i, m4); druI.setColorAt(i, col.setHex([0x2673B5, 0x5A646E, 0xC8442F, 0x3A7D5C][i % 4])); });
    carI.count = LC.c.length; wraI.count = LC.w.length; druI.count = LC.d.length;
    [palI, carI, wraI, druI].forEach(function (o) { scene.add(cs(o)); });
    // LED high-bays: finned driver housing, reflector, glowing lens, suspension rod
    var hbParts = [[G(CY(.3, .34, .14, 20), 0, 0, 0), 0x3A4048], [G(CY(.2, .3, .12, 20), 0, .13, 0), 0x2B3036], [G(CY(.05, .05, .2, 8), 0, .29, 0), 0x2B3036], [G(CY(.008, .008, 1.1, 4), 0, .9, 0), 0x8E99A4]];
    for (var fn = 0; fn < 12; fn++) { var fa = fn / 12 * Math.PI * 2; hbParts.push([BXG(.08, .1, .012, Math.cos(fa) * .27, .13, Math.sin(fa) * .27, 0, -fa, 0), 0x4A525A]); }
    var HBP = []; (MOB ? [-22, 2, 21.5, 31] : [-34, -22, -10, 2, 12, 21.5, 31]).forEach(function (x) { for (var z = -36; z >= -66; z -= 6) HBP.push([x, SH_H - 1.45, z]); });
    var hbI = new T.InstancedMesh(merge(hbParts), VCM.metal, HBP.length), hbL = new T.InstancedMesh(G(CY(.28, .28, .02, 20), 0, -.08, 0), B(0xF7FAFF), HBP.length);
    HBP.forEach(function (p, i) { m4.makeTranslation(p[0], p[1], p[2]); hbI.setMatrixAt(i, m4); hbL.setMatrixAt(i, m4); }); scene.add(hbI); scene.add(hbL);
    var DOMES = [];
    [-40, -50, -60].forEach(function (z, i) { var dm = DOME(); dm.position.set(31, SH_H - .3, z); scene.add(dm); DOMES.push(dm); });
    var aisleBoard = add(new T.PlaneGeometry(3.4, .7), B(0xffffff, { map: board('AISLE 3', { size: 74, h: 150, w: 720 }) }), 31, 9.6, -33.2);
    // floor markings, walkways, loose cartons, a reach truck and pallet jacks
    var lineY = B(0xE7C33A), lineG = B(0x3FA36B);
    [29.15, 33.65].forEach(function (x) { add(new T.PlaneGeometry(.14, 34).rotateX(-Math.PI / 2), lineY, x, .045, -51); });
    [23.95 + .1, 27.85 - .1].forEach(function (x) { add(new T.PlaneGeometry(.1, 34).rotateX(-Math.PI / 2), lineY, x, .045, -51); });   // reach aisle edge lines
    add(new T.PlaneGeometry(1.4, 34).rotateX(-Math.PI / 2), M(0x3FA36B, { roughness: .6, transparent: true, opacity: .55 }), 16.6, .044, -51);
    for (var wz = -36; wz >= -66; wz -= 2) add(new T.PlaneGeometry(1.2, .25).rotateX(-Math.PI / 2), B(0xF4F6F8), 16.6, .05, wz);
    var walkG = M(0x3FA36B, { roughness: .6, transparent: true, opacity: .55 });
    add(new T.PlaneGeometry(51.2, 1.2).rotateX(-Math.PI / 2), walkG, -8.7, .044, -32.2);
    add(new T.PlaneGeometry(1.2, 22).rotateX(-Math.PI / 2), walkG, 7.8, .044, -45.2);
    for (var zb = -36; zb <= -33; zb += .7) add(new T.PlaneGeometry(1.4, .38).rotateX(-Math.PI / 2), B(0xF4F6F8), 7.8, .05, zb);   // crossing over the forklift lane
    add(new T.PlaneGeometry(48, .14).rotateX(-Math.PI / 2), lineY, -11, .046, -36.1); add(new T.PlaneGeometry(48, .14).rotateX(-Math.PI / 2), lineY, -11, .046, -32.95);
    var cartons = [], cCols = [0xC9A876, 0xB68F5F, 0xD9C29A, 0xA77F55];
    for (var cs2 = 0; cs2 < (MOB ? 18 : 48); cs2++) { var cxp = -30 + (cs2 % 12) * 3.6, czp = -48 - Math.floor(cs2 / 12) * 3.2, ch = .45 + (cs2 % 3) * .1; cartons.push([cxp, .25 + ch / 2, czp, .9 + (cs2 % 2) * .3, ch, .9]); }
    var cartonI = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), M(0xffffff, { roughness: .9 }), cartons.length);
    cartons.forEach(function (b, i) { fm4.compose(fpv.set(b[0], b[1], b[2]), fq, fsv.set(b[3], b[4], b[5])); cartonI.setMatrixAt(i, fm4); cartonI.setColorAt(i, new T.Color(cCols[i % cCols.length])); });
    scene.add(cs(cartonI));
    // reach truck: chassis with rounded rear, stand-up compartment under an overhead guard, base legs with load wheels,
    // drive wheel, three-stage mast with lift cylinders, carriage with backrest and forks carrying a pallet
    var REACH = new T.Group(); scene.add(REACH);
    var RK = kit(), ORG = 0xE58A2B, DKC = 0x2B3036;
    RK.put('paint', BXG(1.2, 1.15, 1.2, 0, .8, -.5), ORG); RK.put('paint', G(CY(.6, .6, 1.15, 20), 0, .8, -1.1), ORG); RK.put('metal', BXG(1.24, .12, 1.25, 0, .28, -.5), DKC);
    RK.put('metal', BXG(.5, .32, .3, -.3, 1.5, -.25), DKC); RK.put('glass', BXG(.3, .18, .02, -.3, 1.55, -.09), 0x2C66B0);
    [[-.58, -1.55], [.58, -1.55], [-.58, .05], [.58, .05]].forEach(function (p) { RK.put('metal', BXG(.06, 1.2, .06, p[0], 1.95, p[1]), DKC); });
    RK.put('metal', BXG(1.22, .06, 1.66, 0, 2.56, -.75), DKC); for (var rsl = 0; rsl < 6; rsl++) RK.put('metal', BXG(1.16, .04, .06, 0, 2.6, -1.45 + rsl * .28), DKC);
    [-1, 1].forEach(function (sd) { RK.put('metal', BXG(.18, .25, 1.6, sd * .48, .2, .85), DKC); RK.put('metal', G(CY(.12, .12, .12, 12), sd * .48, .12, 1.5, 0, 0, Math.PI / 2), 0x131619); RK.put('metal', G(CY(.12, .12, .12, 12), sd * .48, .12, .4, 0, 0, Math.PI / 2), 0x131619); RK.put('lamp', BXG(.1, .08, .03, sd * .4, 2.45, .08), LITE); });
    RK.put('metal', G(CY(.22, .22, .2, 16), 0, .22, -1.45, 0, 0, Math.PI / 2), 0x131619); RK.put('paint', G(CY(.06, .08, .12, 10), .45, 2.66, -1.4), 0xF2A33A);
    operator(RK, .2, 1.4, -1.0, true, 0x2673B5);
    RK.build(REACH, true);
    var rArms = new T.Group(); rArms.position.set(.2, 1.9, -1.0); REACH.add(rArms); var RAK = kit(); operatorArms(RAK, 0, -.5, 0); RAK.build(rArms, true);
    // two-stage mast between the base legs; the carriage climbs it, and a pantograph (scissor) reach pushes the forks forward
    var mastR = new T.Group(); mastR.position.set(0, 0, .2); REACH.add(mastR);
    var MRK = kit();
    [-1, 1].forEach(function (sd) { MRK.put('metal', BXG(.12, 4.4, .14, sd * .45, 2.2, 0), DKC); MRK.put('metal', G(CY(.05, .05, 3.4, 8), sd * .2, 1.8, -.05), RIM); });
    MRK.put('metal', BXG(1.0, .12, .14, 0, 4.35, 0), DKC); MRK.put('metal', BXG(1.0, .1, .14, 0, .3, 0), DKC);
    MRK.build(mastR, true);
    var mastIn = new T.Group(); mastR.add(mastIn); var MIK = kit();
    [-1, 1].forEach(function (sd) { MIK.put('metal', BXG(.1, 4.3, .1, sd * .36, 2.25, .08), 0x4A525A); MIK.put('metal', BXG(.03, 4.0, .03, sd * .12, 2.3, .14), TR); });
    MIK.put('metal', BXG(.82, .1, .1, 0, 4.35, .08), 0x4A525A); MIK.build(mastIn, true);
    var carriage = new T.Group(); carriage.position.z = .14; mastR.add(carriage);
    var CBK = kit(); CBK.put('metal', BXG(.9, .5, .06, 0, .4, .03), DKC); [-1, 1].forEach(function (sd) { CBK.put('metal', BXG(.06, .9, .06, sd * .4, .65, .03), DKC); }); CBK.build(carriage, true);
    var forkG = new T.Group(); forkG.position.z = .12; carriage.add(forkG);
    var CRK = kit();
    CRK.put('metal', BXG(1.0, .4, .06, 0, .2, 0), DKC); for (var cb = 0; cb < 5; cb++) CRK.put('metal', BXG(.03, .8, .03, -.4 + cb * .2, .8, 0), DKC); CRK.put('metal', BXG(1.0, .04, .04, 0, 1.2, 0), DKC);
    [-.3, .3].forEach(function (x) { CRK.put('metal', BXG(.12, .045, 1.15, x, 0, .605), DKC); CRK.put('metal', BXG(.12, .45, .045, x, .2, .055), DKC); });
    CRK.build(forkG, true);
    var PANTO = [-.32, .32].map(function (x) { return [0, 1].map(function () { var r = add(new T.CylinderGeometry(.03, .03, 1, 6).translate(0, .5, 0), M(0x3A4048, { metalness: .6, roughness: .4 }), x, 0, 0, carriage); return r; }); });
    var PL = 1.5, PY = .65, _pa = new T.Vector3(), _pb = new T.Vector3();
    function setPanto(e) {
      var dz = e + .12, hh = Math.sqrt(Math.max(.01, PL * PL - dz * dz)) / 2;
      PANTO.forEach(function (pr) { var x = pr[0].position.x;
        [[PY + hh, PY - hh], [PY - hh, PY + hh]].forEach(function (ys, k) { var r = pr[k]; _pa.set(x, ys[0], .06); _pb.set(x, ys[1], .06 + dz); r.position.copy(_pa); _pb.sub(_pa); r.scale.set(1, _pb.length(), 1); r.quaternion.setFromUnitVectors(up, _pb.normalize()); });
      });
    }
    // the pallet it puts away / retrieves: one copy on the forks, one in the rack slot; they swap at the instant the load
    // is set down on (or lifted off) the beams, where both copies coincide exactly
    function rLoad(K, x, y, z, ry) { palletParts(K, x, y, z, ry); var c = Math.cos(ry), sn = Math.sin(ry); K.put('matte', BXG(1.12, 1.1, .96, x, y + .144 + .55, z, 0, ry, 0), 0xDCE6EE); K.put('lamp', BXG(.3, .2, .01, x + sn * .49, y + .7, z + c * .49, 0, ry, 0), 0xF4F6F8); }
    var forkLoad = new T.Group(); forkG.add(forkLoad); var FLK = kit(); rLoad(FLK, 0, -.0995, .63, Math.PI / 2); FLK.build(forkLoad, true);
    var slotLoad = new T.Group(); scene.add(slotLoad); var SLK = kit(); rLoad(SLK, RSLOT.x, RSLOT.ly + .048, RSLOT.z, 0); SLK.build(slotLoad, true); slotLoad.visible = false;
    var JACKS = [];
    [[30.4, -33.2], [32.8, -34.4]].forEach(function (p, i) { var g = new T.Group(); g.position.set(p[0], 0, p[1]); scene.add(g);
      var JK = kit();
      [-.27, .27].forEach(function (x) { JK.put('paint', BXG(.16, .08, 1.15, x, .08, .1), 0x2673B5); JK.put('metal', G(CY(.04, .04, .08, 8), x, .04, .6, 0, 0, Math.PI / 2), 0x131619); });
      JK.put('paint', BXG(.6, .35, .25, 0, .25, -.6), 0x2673B5); JK.put('metal', G(CY(.09, .09, .12, 12), 0, .09, -.62, 0, 0, Math.PI / 2), 0x131619); JK.put('metal', ROD([0, .4, -.7], [0, 1.1, -.95], .025), 0x2B3036); JK.put('metal', BXG(.35, .04, .04, 0, 1.12, -.96), 0x2B3036);
      if (i === 0) { palletParts(JK, 0, -.002, .1, Math.PI / 2); JK.put('matte', BXG(1.0, .9, 1.1, 0, .592, .1), 0xB68F5F); }   // deck rests on the raised forks
      JK.build(g, true); JACKS.push(g); });
    // staff on foot (hi-vis, cap, two legs, arms, boots): they keep to the green walkways
    var up = new T.Vector3(0, 1, 0), eul = new T.Euler(), ONE = new T.Vector3(1, 1, 1), XAX = new T.Vector3(1, 0, 0), NP = MOB ? 3 : 6;
    function IM(g, m, n) { var o = new T.InstancedMesh(g, m, n); scene.add(o); return o; }
    var vestI = IM(new T.BoxGeometry(.48, .46, .3), M(0xD7E83A, { roughness: .7, emissive: 0x1f2600 }), NP);
    var shirtI = IM(new T.BoxGeometry(.43, .6, .26), M(0x2D4A6B, { roughness: .8 }), NP);
    var stripeI = IM(new T.BoxGeometry(.49, .05, .31), B(0xE9EEF2), NP * 2);
    var braceI = IM(new T.BoxGeometry(.055, .44, .315), B(0xE9EEF2), NP * 2), neckI = IM(new T.BoxGeometry(.1, .1, .1), M(0xA9805E, { roughness: .8 }), NP);
    var beltI = IM(new T.BoxGeometry(.46, .08, .28), M(0x22282E, { roughness: .8 }), NP);
    var legI = IM(new T.BoxGeometry(.17, .8, .2), M(0x24344A, { roughness: .8 }), NP * 2);
    var bootI = IM(new T.BoxGeometry(.19, .13, .32), M(0x1E1B19, { roughness: .7 }), NP * 2);
    var armI = IM(new T.BoxGeometry(.12, .56, .12), M(0x2D4A6B, { roughness: .8 }), NP * 2);
    var gloveI = IM(new T.BoxGeometry(.11, .11, .12), M(0xA9805E, { roughness: .8 }), NP * 2);
    var headI = IM(new T.SphereGeometry(.15, 12, 10), M(0xA9805E, { roughness: .8 }), NP);
    var hatI = IM(new T.SphereGeometry(.16, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0x2673B5, { roughness: .5 }), NP);
    var brimI = IM(new T.BoxGeometry(.2, .03, .14), M(0x2673B5, { roughness: .5 }), NP);
    var WPARTS = [vestI, shirtI, stripeI, braceI, neckI, beltI, legI, bootI, armI, gloveI, headI, hatI, brimI];
    cs(vestI); cs(legI); cs(shirtI);
    function mkPath(pts) { var L = [0]; for (var k = 1; k < pts.length; k++) L.push(L[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1])); return { pts: pts, L: L, len: L[L.length - 1] }; }
    function pathAt(pa, s, out) {
      s = Math.max(0, Math.min(pa.len, s));
      for (var k = 1; k < pa.pts.length; k++) if (s <= pa.L[k] + 1e-6) { var f = (s - pa.L[k - 1]) / Math.max(1e-6, pa.L[k] - pa.L[k - 1]), a = pa.pts[k - 1], b = pa.pts[k]; out.set(a[0] + (b[0] - a[0]) * f, 0, a[1] + (b[1] - a[1]) * f); return Math.atan2(b[0] - a[0], b[1] - a[1]); }
      var e = pa.pts[pa.pts.length - 1]; out.set(e[0], 0, e[1]); return 0;
    }
    // picker route (crosses the forklift lane on the zebra), the aisle-side walkway, the dock-wall walkway, the yard footpath
    var PPATHS = [[[16.6, -66], [16.6, -32.2], [7.8, -32.2], [7.8, -55.5]], [[16.6, -36], [16.6, -66]], [[-34, -32.2], [16.6, -32.2]], [[11, 31.3], [30, 31.3]]];
    var PEDS = [], _p0 = new T.Vector3();
    for (var pi = 0; pi < NP; pi++) {
      var pw = { path: mkPath(PPATHS[MOB ? [0, 2, 3][pi] : [0, 0, 1, 2, 2, 3][pi]]), dir: pi % 2 ? 1 : -1, sp: 1.0 + Math.random() * .3, wait: 0, onX: false };
      pw.s = Math.random() * pw.path.len; pw.ry = pathAt(pw.path, pw.s, _p0); pw.x = _p0.x; pw.z = _p0.z; PEDS.push(pw);
    }
    var _qb = new T.Quaternion(), _qy = new T.Quaternion(), _ql = new T.Quaternion(), _hp = new T.Vector3(), _jp = new T.Vector3(), _op = new T.Vector3();
    function putI(I, idx, base, qq, x, y, z) { _op.set(x, y, z).applyQuaternion(qq).add(base); m4.compose(_op, qq, ONE); I.setMatrixAt(idx, m4); }
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
      putI(headI, i, _hp, _qb, 0, .78, 0); putI(hatI, i, _hp, _qb, 0, .84, 0); putI(brimI, i, _hp, _qb, 0, .85, .17);
      limb(armI, i, _hp, _qb, -.29, .56, armSw[0], .56, [gloveI, 0]); limb(armI, i, _hp, _qb, .29, .56, armSw[1], .56, [gloveI, 0]);
    }

    /* ---------- yard gate: fence, boom barrier, guard cabin, ANPR pole ---------- */
    var fenceTex = canvasTex(256, 256, function (x, w, h) { x.clearRect(0, 0, w, h); x.strokeStyle = 'rgba(70,84,98,.75)'; x.lineWidth = 2; for (var i = -h; i < w; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + h, h); x.stroke(); x.beginPath(); x.moveTo(i + h, 0); x.lineTo(i, h); x.stroke(); } }, [24, 1]);
    var fenceM = new T.MeshStandardMaterial({ map: fenceTex, transparent: true, side: T.DoubleSide, roughness: .6, metalness: .4, depthWrite: false });
    var postM = M(0x8E99A4, { metalness: .6, roughness: .4 });
    function fenceRun(x0, z0, x1, z1) {
      var len = Math.hypot(x1 - x0, z1 - z0), f = add(new T.PlaneGeometry(len, 2.6), fenceM.clone(), (x0 + x1) / 2, 1.3, (z0 + z1) / 2);
      f.material.map = fenceTex.clone(); f.material.map.repeat.set(len / 4, 1); f.material.map.needsUpdate = true; f.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
      var n = Math.ceil(len / 4); for (var i = 0; i <= n; i++) { var t = i / n; add(new T.CylinderGeometry(.07, .07, 2.8, 8), postM, x0 + (x1 - x0) * t, 1.4, z0 + (z1 - z0) * t); }
    }
    fenceRun(-48, 32, -10, 32); fenceRun(14, 32, 48, 32); fenceRun(-48, 32, -48, -76); fenceRun(48, 32, 48, -76);
    // guard cabin
    var cabin = new T.Group(); cabin.position.set(8, 0, 29);
    var cabBody = add(new T.BoxGeometry(4.2, 3, 3.2), M(0xE9EDF1, { roughness: .6 }), 0, 1.5, 0, cabin); cs(cabBody);
    add(new T.BoxGeometry(4.6, .3, 3.6), M(0x2673B5, { roughness: .5 }), 0, 3.15, 0, cabin);
    add(new T.PlaneGeometry(3.2, 1.2), M(0x22303D, { roughness: .08, metalness: .85 }), -2.11, 1.9, 0, cabin).rotation.y = -Math.PI / 2;
    add(new T.PlaneGeometry(2.2, .55), B(0xffffff, { map: board('GATE 1', { size: 74, h: 150, w: 600 }) }), 0, 2.75, 1.62, cabin);
    // guardhouse detail: plinth, framed lane window with a transaction counter, front window, door with step, AC unit, downlights
    var GK = kit(), WF = 0xF7F9FB;
    GK.put('matte', BXG(4.5, .16, 3.5, 0, .08, 0), 0xB3B8BD);
    GK.put('paint', BXG(.06, .1, 3.36, -2.12, 1.25, 0), WF); GK.put('paint', BXG(.06, .1, 3.36, -2.12, 2.55, 0), WF);
    [-1.64, 0, 1.64].forEach(function (z) { GK.put('paint', BXG(.07, 1.3, .08, -2.13, 1.9, z), WF); });
    GK.put('metal', BXG(.45, .05, 1.4, -2.3, 1.22, .3), 0x9AA4AE);
    GK.put('glass', BXG(1.5, .95, .05, -.9, 1.75, 1.61), 0x22303D); GK.put('paint', BXG(1.62, .07, .08, -.9, 2.26, 1.62), WF); GK.put('paint', BXG(1.62, .07, .08, -.9, 1.24, 1.62), WF); GK.put('paint', BXG(.06, .95, .08, -.9, 1.75, 1.63), WF);
    GK.put('paint', BXG(.05, 2.15, .95, 2.12, 1.1, .7), 0x5C7186); GK.put('glass', BXG(.06, .45, .4, 2.13, 1.65, .7), 0x22303D); GK.put('metal', BXG(.06, .04, .12, 2.16, 1.05, .35), 0xC4CCD3);
    GK.put('matte', BXG(1.4, .2, 1.2, 2.8, .1, .7), 0xB3B8BD);
    GK.put('paint', BXG(.95, .62, .32, .9, 2.25, -1.78), 0xE9EDF1); for (var ag = 0; ag < 5; ag++) GK.put('metal', BXG(.85, .03, .02, .9, 2.05 + ag * .1, -1.95), 0x8E99A4);
    [[-2.1, 1.6], [2.1, 1.6], [-2.1, -1.6]].forEach(function (c) { GK.put('lamp', G(CY(.12, .12, .03, 12), c[0], 2.99, c[1]), 0xF7FAFF); });
    GK.build(cabin, true);
    scene.add(cabin);
    // boom barrier (pivot at the island next to the cabin)
    var boomTex = canvasTex(512, 32, function (x, w, h) { for (var i = 0; i < w; i += 64) { x.fillStyle = '#D6453D'; x.fillRect(i, 0, 32, h); x.fillStyle = '#FFFFFF'; x.fillRect(i + 32, 0, 32, h); } });
    function barrier(px, z, len) {
      cs(add(new T.BoxGeometry(.55, 1.1, .55), M(0xE7B53A, { roughness: .5 }), px, .55, z));
      var g = new T.Group(); g.position.set(px, 1.05, z); scene.add(g);
      cs(add(new T.BoxGeometry(len, .15, .15), M(0xffffff, { map: boomTex, roughness: .5 }), -len / 2 - .2, 0, 0, g));
      add(new T.BoxGeometry(.3, .5, .2), M(0x2B3036), .35, 0, 0, g);
      cs(add(new T.CylinderGeometry(.06, .07, .9, 8), postM, px - len - .2, .45, z));
      return g;
    }
    // in-lane (x -3) barrier pivots by the cabin; out-lane (x -7.8) barrier pivots on the island between the lanes
    var boom = barrier(.4, 28.4, 5.9), boomXg = barrier(-5.4, 27.6, 4.6);
    cs(add(new T.BoxGeometry(1.1, .2, 6), M(0xC9CDD1, { roughness: .9 }), -5.4, .1, 26.6));
    // ANPR pole on the island facing incoming trucks
    var pole = add(new T.CylinderGeometry(.13, .16, 6.2, 12), postM, -5.4, 3.1, 24.4); cs(pole);
    add(new T.BoxGeometry(2.4, .12, .12), postM, -4.3, 6.0, 24.4);
    var anpr = CAM(); anpr.position.set(-3.3, 5.6, 24.7); anpr.rotation.y = 0; anpr.rotation.x = .28; scene.add(anpr);
    // perimeter cameras
    [[-46, 8], [46, -10], [-46, -50], [46, -60]].forEach(function (p) { add(new T.CylinderGeometry(.1, .12, 7, 10), postM, p[0], 3.5, p[1]); var c = CAM(); c.position.set(p[0] + (p[0] < 0 ? .6 : -.6), 6.6, p[1]); c.rotation.y = p[0] < 0 ? Math.PI / 2 : -Math.PI / 2; c.rotation.x = .35; scene.add(c); });
    // kerbs, bollards and a weighbridge on the way in
    var kerbM = M(0xC9CDD1, { roughness: .9 }), bolM = M(0xE7B53A, { roughness: .45 });
    [[-29, 30.6, 38, .4], [31, 30.6, 34, .4]].forEach(function (k) { cs(add(new T.BoxGeometry(k[2], .25, k[3]), kerbM, k[0], .13, k[1])); });
    // bollards (steel, yellow, black cap, reflective band), all merged: docks, gatehouse, door jambs, yard footpath
    var BK2 = kit();
    function bollard(x, z) { BK2.put('paint', G(CY(.16, .16, 1.1, 14), x, .55, z), 0xE7B53A); BK2.put('metal', G(CY(.165, .165, .12, 14), x, .82, z), 0x1B2732); BK2.put('lamp', G(CY(.165, .165, .07, 14), x, .66, z), 0xE9EEF2); BK2.put('matte', G(CY(.24, .24, .04, 14), x, .02, z), 0x9AA0A6); }
    DOCKS.forEach(function (dk) { [-2.7, 2.7].forEach(function (o) { bollard(dk.x + o, SH_Z1 + 1.6); }); });
    [[1.4, 29.4], [4.8, 29.4], [.6, 24], [5.6, 27.2], [10.4, 27.2], [10.4, 30.8], [DOOR_X0 - .6, SH_Z1 + .9], [DOOR_X1 + .6, SH_Z1 + .9]].forEach(function (b) { bollard(b[0], b[1]); });
    if (!MOB) for (var fb = 13; fb <= 29; fb += 2.6) bollard(fb, 30.2);
    BK2.build(scene, true);
    // weighbridge: chequer-plate deck in a steel frame, hazard-striped kerbs, ramps, load-cell covers, LED weight display
    var chqTex = canvasTex(128, 128, function (x, w, h) { x.fillStyle = '#7E878F'; x.fillRect(0, 0, w, h); for (var i = 0; i < 8; i++) for (var j = 0; j < 8; j++) { x.save(); x.translate(i * 16 + 8, j * 16 + 8); x.rotate((i + j) % 2 ? .78 : -.78); x.fillStyle = 'rgba(210,218,226,.55)'; x.fillRect(-5, -1.5, 10, 3); x.fillStyle = 'rgba(30,36,42,.35)'; x.fillRect(-5, 1.5, 10, 1); x.restore(); } }, [3, 12]);
    var wbM = M(0xffffff, { map: chqTex, roughness: .45, metalness: .6 });
    cs(add(new T.BoxGeometry(3.6, .22, 14), wbM, -3, .11, 19), true);
    [12, 26].forEach(function (z) { var rp = add(new T.BoxGeometry(3.6, .12, 1.2), wbM, -3, .06, z); rp.rotation.x = z > 19 ? .18 : -.18; });
    var WK2 = kit();
    [-1, 1].forEach(function (sd) {
      WK2.put('metal', BXG(.12, .26, 14.2, -3 + sd * 1.86, .13, 19), 0x3A4048);
      for (var kz = 0; kz < 14; kz++) WK2.put('paint', BXG(.22, .3, 1.0, -3 + sd * 2.05, .15, 12.5 + kz), kz % 2 ? 0x1B2126 : 0xE7C33A);
      [14, 24].forEach(function (z) { WK2.put('metal', BXG(.5, .02, .5, -3 + sd * 1.45, .225, z), 0x4A525A); });
    });
    WK2.put('metal', ROD([1.6, 0, 13.4], [1.6, 2.6, 13.4], .06, 8), 0x8E99A4); WK2.put('metal', BXG(1.5, .55, .2, 1.6, 2.9, 13.4), 0x1B2126);
    WK2.build(scene, true);
    var wDisp = canvasTex(256, 96, function (x, w, h) { x.fillStyle = '#0B0E11'; x.fillRect(0, 0, w, h); x.fillStyle = '#FF4A3D'; x.font = '700 58px Consolas, monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('- - - - kg', w / 2, h / 2 + 2); });
    add(new T.PlaneGeometry(1.38, .45), B(0xffffff, { map: wDisp }), 1.6, 2.9, 13.51);
    add(new T.PlaneGeometry(4.2, .9), B(0xffffff, { map: board('WEIGHBRIDGE', { size: 70, h: 150, w: 720 }) }), 1.8, 2.4, 19).rotation.y = Math.PI / 2;
    add(new T.BoxGeometry(.12, 2, .12), postM, 1.8, 1, 19.9); add(new T.BoxGeometry(.12, 2, .12), postM, 1.8, 1, 18.1);
    // dock-side cameras on the façade
    var DOCKCAMS = [];
    [-28, -4, 20].forEach(function (x) { var c = CAM(); c.position.set(x, 9.2, SH_Z1 + 1.1); c.rotation.x = .55; scene.add(c); DOCKCAMS.push(c); });

    /* ---------- yard video wall (Cygnus) ---------- */
    // security control room: a glazed cabin seen through its open front: curved 3x3 wall of bezelled screens,
    // operator console with monitors, chairs and operators, ceiling panels; the span is clear (no column in the room)
    var WALL_POS = new T.Vector3(-30, 0, 14);
    var wallG = new T.Group(); wallG.position.copy(WALL_POS); wallG.rotation.y = .5; scene.add(wallG);
    var RW = 10, RD = 7.5, RH = 5.4, RF = .3;
    var roomM = M(0xF0F2F4, { roughness: .6 }), frameM = M(0x3A4048, { roughness: .4, metalness: .6 });
    var glassM = new T.MeshStandardMaterial({ color: 0xCFE2F2, roughness: .05, metalness: .2, transparent: true, opacity: .16, depthWrite: false, side: T.DoubleSide });
    var rFloorTex = canvasTex(256, 256, function (x, w, h) { x.fillStyle = '#5B636B'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(20,26,32,.55)'; x.lineWidth = 3; for (var i = 0; i <= w; i += 64) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); } }, [5, 4]);
    cs(add(new T.BoxGeometry(RW + .4, RF, RD + .4), M(0xB3B8BD, { roughness: .92 }), 0, RF / 2, 0, wallG), true);
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
    add(new T.PlaneGeometry(4.6, .62), B(0xffffff, { map: board('SECURITY CONTROL ROOM', { size: 70, h: 150, w: 1000 }) }), 0, RF + RH + .17, RD / 2 + .38, wallG);
    // tile from a masked feed image (img/real/tiles/*), drawn into a canvas with the camera label bar
    function imgTile(src, label, fallback) {
      var t = tileTex(fallback, label), c = t.userData.canvas, im = new Image();
      im.onload = function () { if (dead) return; var x = c.getContext('2d'); x.drawImage(im, 0, 0, c.width, c.height); tileLabel(x, c.width, label); t.needsUpdate = true; };
      im.src = src; return t;
    }
    function tileLabel(x, w, label) { x.fillStyle = 'rgba(14,59,102,.88)'; x.fillRect(0, 0, w, 38); x.fillStyle = '#fff'; x.font = '600 22px "Geist Mono", Consolas, monospace'; x.textBaseline = 'middle'; x.fillText(label, 14, 20); x.fillStyle = '#D6453D'; x.beginPath(); x.arc(w - 26, 19, 7, 0, 7); x.fill(); }
    function tileTex(kind, label) {
      return canvasTex(512, 300, function (x, w, h) {
        var sky = x.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#CFDDEB'); sky.addColorStop(1, '#9AA6B1'); x.fillStyle = sky; x.fillRect(0, 0, w, h);
        if (kind === 'dock') { x.fillStyle = '#E8ECF0'; x.fillRect(0, 40, w, 150); for (var i = 0; i < 4; i++) { x.fillStyle = '#B9C3CC'; x.fillRect(30 + i * 120, 90, 90, 100); } x.fillStyle = '#F2F4F6'; x.fillRect(150, 150, 110, 120); x.fillStyle = '#2C66B0'; x.fillRect(165, 120, 80, 40); }
        if (kind === 'aisle') { x.fillStyle = '#DCE1E6'; x.fillRect(0, 0, w, h); x.fillStyle = '#1B5A94'; for (var j = 0; j < 7; j++) { x.fillRect(40 + j * 26, 20, 6, 260); x.fillRect(w - 46 - j * 26, 20, 6, 260); } x.fillStyle = '#E58A2B'; for (var k = 0; k < 5; k++) { x.fillRect(30, 50 + k * 50, 190, 5); x.fillRect(w - 220, 50 + k * 50, 190, 5); } x.fillStyle = '#C9A876'; for (var q = 0; q < 8; q++) { x.fillRect(50 + (q % 4) * 40, 60 + Math.floor(q / 4) * 100, 32, 38); x.fillRect(w - 200 + (q % 4) * 40, 60 + Math.floor(q / 4) * 100, 32, 38); } }
        if (kind === 'gate') { x.fillStyle = '#7E868D'; x.beginPath(); x.moveTo(180, h); x.lineTo(240, 80); x.lineTo(280, 80); x.lineTo(380, h); x.fill(); x.fillStyle = '#F2F4F6'; x.fillRect(220, 150, 90, 110); x.fillStyle = '#E7B53A'; x.fillRect(120, 140, 160, 6); }
        if (kind === 'yard') { x.fillStyle = '#B8BEC4'; x.fillRect(0, 120, w, 180); for (var y = 0; y < 3; y++) { x.fillStyle = '#E7B53A'; x.fillRect(80 + y * 150, 180, 40, 30); } }
        tileLabel(x, w, label);
      });
    }
    // 3×3 wall: two tiles use masked feed images, the rest are drawn (illustrative) views
    var TILE_DEF = [['img/real/tiles/t9-warehouse.webp', 'GATE 1 · LIVE', 'gate'], ['dock', 'DOCK 4 · LIVE'], ['dock', 'DOCK 7 · LIVE'],
      ['aisle', 'AISLE 3 · CAM 12'], ['aisle', 'AISLE 5 · LIVE'], ['yard', 'YARD · LIVE'],
      ['dock', 'DOCK 2 · LIVE'], ['img/warehouse-bays-sm.webp', 'YARD GATE B · LIVE', 'yard'], ['aisle', 'AISLE 8 · LIVE']];
    var TILES = TILE_DEF.map(function (d, i) {
      var tex = d.length === 3 ? imgTile(d[0], d[1], d[2]) : tileTex(d[0], d[1]), m = new T.Mesh(new T.PlaneGeometry(3.9, 2.3), B(0xffffff, { map: tex }));
      m.geometry.dispose(); m.geometry = new T.PlaneGeometry(SW, SH2);
      m.position.set(0, RF + 1.1 + (2 - Math.floor(i / 3)) * (SH2 + .06) + SH2 / 2, .065); WALLCOLS[i % 3].add(m); return { m: m, tex: tex };
    });
    var noiseTex = canvasTex(256, 150, function (x, w, h) { noise(x, w, h, '#30363C', 9000, .9); x.fillStyle = '#D6453D'; x.fillRect(0, 0, w, 22); x.fillStyle = '#fff'; x.font = '700 13px Consolas, monospace'; x.fillText('CAM 12 · VIEW BLOCKED', 8, 15); });
    var tlCanvas = document.createElement('canvas'); tlCanvas.width = 1024; tlCanvas.height = 70; var tlTex = new T.CanvasTexture(tlCanvas); tlTex.encoding = T.sRGBEncoding;
    var tl = new T.Mesh(new T.PlaneGeometry(6.2, .36), B(0xffffff, { map: tlTex })); tl.position.set(0, RF + .8, VW_Z + .12); wallG.add(tl);
    function drawTimeline(f) {
      var x = tlCanvas.getContext('2d'), w = tlCanvas.width, h = tlCanvas.height;
      x.fillStyle = '#0E3B66'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(110, 30, w - 230, 10);
      x.fillStyle = '#5A9FD4'; x.fillRect(110, 30, (w - 230) * f, 10);
      for (var i = 0; i < 6; i++) { x.fillStyle = '#E7C33A'; x.fillRect(110 + (w - 230) * (.12 + i * .15), 24, 3, 22); }
      x.fillStyle = '#fff'; x.beginPath(); x.arc(110 + (w - 230) * f, 35, 11, 0, 7); x.fill();
      x.font = '700 24px Consolas, monospace'; x.fillStyle = '#fff'; x.fillText('REC', 18, 44); x.fillText('EXPORT', w - 112, 44);
      tlTex.needsUpdate = true;
    }
    drawTimeline(.4);

    var SURR = { ox: -4.6, oz: 0, ex: [[-52, 52, -80, 36], [-14, 5, 32, 130], [-46, -14, 35, 56]],
      verges: [[-29, 34, 38, 3.4], [31, 34, 34, 3.4], [50.2, -22, 3.4, 108], [-50.2, -22, 3.4, 108], [0, -78.2, 104, 3.4]], park: { x0: -44, x1: -16, z0: 38, z1: 54 } };
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
    var ST = REG.warehouses.stations, boards = [];
    var BOARD_AT = [[-3, 9.6, 33.5, 0], [30, 8.5, -12, -.25], [-30, 8.1, 14, .5], [31, 10.6, -31.4, 0], [-36, 9.6, 4, .35]];
    ST.forEach(function (S, i) {
      var p = BOARD_AT[i], g = new T.Group(); g.position.set(p[0], p[1], p[2]); g.rotation.y = p[3];
      var mesh = new T.Mesh(new T.PlaneGeometry(9, 1.42), B(0xffffff, { map: titleBoard([S.short || S.title], { num: ('0' + (i + 1)).slice(-2), grp: S.product === 'Cygnus' ? 'Cygnus' : 'Access & parking' }) }));
      g.add(mesh); if (i !== 2 && i !== 3) { [-3.6, 3.6].forEach(function (x) { add(new T.BoxGeometry(.14, p[1], .14), postM, x, -p[1] / 2, -.1, g); }); }
      if (i === 2) { var pl = p[1] - (RF + RH + .35); [-3.6, 3.6].forEach(function (x) { add(new T.BoxGeometry(.14, pl, .14), postM, x, -pl / 2, -.1, g); }); }   // short posts on the control-room roof
      if (i === 3) { var hl = SH_H - .32 - p[1] - .71; [-3.0, 3.0].forEach(function (x) { add(new T.CylinderGeometry(.025, .025, hl, 6), postM, x, .71 + hl / 2, -.04, g); add(new T.BoxGeometry(.3, .06, .3), postM, x, .71 + hl, -.04, g); }); add(new T.BoxGeometry(8.8, .07, .05), postM, 0, .72, -.04, g); }   // hung from the purlins
      scene.add(g); boards.push(g);
    });

    /* ---------- moving things ---------- */
    var gateTruck = truckGroup(0x2C66B0, 0xE9ECEF);
    // two articulated trailers and a rigid box truck (its rear at the same dock line) on the docks
    var BOX_Z = -29.15 + 4.6;
    var parked = [truckGroup(0xF0F0EE, 0xDCE3EA), truckGroup(0xC8442F, 0xE9ECEF), truckGroup(0xE7C33A, 0xEEF1F4, 'box')];
    [1, 5, 7].forEach(function (d, i) { parked[i].position.set(DOCKS[d].x, 0, i === 2 ? BOX_Z : DOCK_Z); DOCKS[d].o = DOCKS[d].l = 1; DOCKS[d].still = 2; });   // already docked: doors up
    // wheel chocks in front of the rear wheels
    var CHK = kit();
    [1, 5, 7].forEach(function (d, i) { var cz = i === 2 ? BOX_Z - 2.3 + .62 : DOCK_Z - 4.95; [-1, 1].forEach(function (sd) { CHK.put('paint', BXG(.3, .25, .4, DOCKS[d].x + sd * 1.1, .12, cz, -.3), 0xE7B53A); }); });
    CHK.build(scene, true);
    // yard markings: bay numbers, direction arrows, a hatched keep-clear box at the big door, footpath along the fence
    var bayNum = canvasTex(2048, 64, function (x, w, h) { x.clearRect(0, 0, w, h); x.fillStyle = '#F4F6F8'; x.font = '800 44px "Onest", "Segoe UI", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; for (var b = 0; b < 8; b++) x.fillText('D' + (b + 1), (b * 8 + 4) / 72 * w, h / 2); });
    add(new T.PlaneGeometry(72, 2).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ map: bayNum, transparent: true, depthWrite: false }), -4, .036, -12.2);
    var arrowTex = canvasTex(128, 256, function (x, w, h) { x.clearRect(0, 0, w, h); x.fillStyle = '#F4F6F8'; x.fillRect(52, 90, 24, 160); x.beginPath(); x.moveTo(64, 0); x.lineTo(120, 100); x.lineTo(8, 100); x.fill(); });
    var ARW = [[-3, 6, Math.PI], [-3, 14, Math.PI], [-7.8, 6, 0], [-7.8, 14, 0], [8, -4, -Math.PI / 2], [24, -2, -Math.PI / 2]];
    var arrI = new T.InstancedMesh(new T.PlaneGeometry(1.1, 2.2).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ map: arrowTex, transparent: true, depthWrite: false }), ARW.length);
    ARW.forEach(function (a, i) { fm4.compose(fpv.set(a[0], .037, a[1]), fq.setFromAxisAngle(up, a[2]), fsv.set(1, 1, 1)); arrI.setMatrixAt(i, fm4); }); fq.identity(); scene.add(arrI);
    var hatchTex = canvasTex(256, 256, function (x, w, h) { x.clearRect(0, 0, w, h); x.strokeStyle = '#E7C33A'; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, h - 14); x.lineWidth = 9; for (var i = -h; i < w; i += 40) { x.beginPath(); x.moveTo(i, h); x.lineTo(i + h, 0); x.stroke(); } });
    add(new T.PlaneGeometry(8, 5).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ map: hatchTex, transparent: true, depthWrite: false }), 31, .036, -26.6);
    add(new T.PlaneGeometry(19, 1.2).rotateX(-Math.PI / 2), M(0x3FA36B, { roughness: .6, transparent: true, opacity: .6, depthWrite: false }), 20.5, .04, 31.3);
    // reefer unit on a trailer (refrigerated load), and reverse lights on the trucks that back into bays
    function reefer(g) {   // fridge unit on the trailer nose: housing, condenser grille, fan rings, controller, fuel tank under the floor
      var u = new T.Group(); u.position.set(0, 3.2, 3.85); g.add(u);
      var RF2 = kit();
      RF2.put('paint', BXG(2.2, 1.45, .7, 0, 0, 0), 0xF2F4F6); RF2.put('paint', BXG(2.24, .1, .74, 0, .72, 0), 0x2673B5);
      RF2.put('metal', BXG(1.7, .85, .04, 0, .05, .36), 0x2B3036);
      for (var gl2 = 0; gl2 < 8; gl2++) RF2.put('metal', BXG(1.66, .025, .03, 0, -.33 + gl2 * .1, .39), 0x5A646E);
      [-.42, .42].forEach(function (fx) { RF2.put('metal', G(new T.TorusGeometry(.26, .03, 6, 20), fx, .05, .4), 0x8E99A4); });
      RF2.put('metal', BXG(.32, .22, .03, .72, -.52, .37), 0x1B2126); RF2.put('lamp', BXG(.2, .07, .01, .72, -.5, .386), 0x5AE08A);
      RF2.put('metal', BXG(.7, .5, 1.1, .75, -2.1, -4.2), 0xB4BCC4);
      RF2.build(u, true); return u;
    }
    reefer(parked[0]);
    var revM = B(0xFFFFFF), revLights = [];
    function reverseLights(g) { var l = new T.Group(); g.add(l); [-.9, .9].forEach(function (x) { add(new T.BoxGeometry(.28, .16, .06), revM, x, 1.0, -7.86, l); }); l.visible = false; revLights.push(l); return l; }
    var gateRev = reverseLights(gateTruck);
    var reverser = truckGroup(0xF0F0EE, 0xE9ECEF); reefer(reverser); var revRev = reverseLights(reverser);
    var REV_BAY = DOCKS[6].x, revPath = new T.CatmullRomCurve3([new T.Vector3(35, 0, 12), new T.Vector3(REV_BAY + 6, 0, 2), new T.Vector3(REV_BAY + 1.5, 0, -10), new T.Vector3(REV_BAY, 0, DOCK_Z)]);
    var lifts = [forkGroup(), forkGroup()];
    if (!MOB) lifts.push(forkGroup());
    // gate-truck journey: approach → stop at the barrier → in, swing left past the bay → reverse onto dock 4 → wait → out lane → exit barrier
    var BAY = DOCKS[3].x, V3 = function (x, z) { return new T.Vector3(x, 0, z); }, P = {
      approach: new T.CatmullRomCurve3([V3(-3, 92), V3(-3, 60), V3(-3, 36.5)]),
      inYard: new T.CatmullRomCurve3([V3(-3, 36.5), V3(-3, 18), V3(-5, 9), V3(-12, 4.6), V3(-22, 3.6)]),
      reverse: new T.CatmullRomCurve3([V3(-22, 3.6), V3(-15.5, 1.6), V3(-12.6, -7), V3(BAY, DOCK_Z)]),
      out: new T.CatmullRomCurve3([V3(BAY, DOCK_Z), V3(BAY, -9), V3(-10.4, 2), V3(-7.8, 12), V3(-7.8, 24), V3(-7.8, 70)])
    };
    var OUT_STOP = (function () { for (var k = 0; k <= 400; k++) if (P.out.getPointAt(k / 400).z >= 20.2) return k / 400; return .7; })();
    var GT_END = [2.4, 2.9, 6.1, 6.6, 10.0, 11.4, 14.2, 17.0, 17.4];
    function gatePose(c) {
      if (c < 2.4) return [P.approach, ease(c / 2.4), false, 0];
      if (c < 2.9) return [P.approach, 1, false, 1];
      if (c < 6.1) return [P.inYard, ease((c - 2.9) / 3.2), false, 2];
      if (c < 6.6) return [P.inYard, 1, false, 3];
      if (c < 10.0) return [P.reverse, ease((c - 6.6) / 3.4), true, 4];
      if (c < 11.4) return [P.reverse, 1, true, 5];
      if (c < 14.2) return [P.out, OUT_STOP * ease((c - 11.4) / 2.8), false, 6];
      if (c < 17.0) return [P.out, OUT_STOP + (1 - OUT_STOP) * ease((c - 14.2) / 2.8), false, 8];
      return [P.out, 1, false, 9];
    }
    // arc-length loops for the forklifts (rounded rectangles keep them in their lanes)
    function loopPath(pts) {
      var cv = new T.CatmullRomCurve3(pts.map(function (q) { return V3(q[0], q[1]); }), true, 'centripetal'), sp = [], L = [0], n = 200;
      for (var k = 0; k <= n; k++) { sp.push(cv.getPoint(k / n)); if (k) L.push(L[k - 1] + sp[k].distanceTo(sp[k - 1])); }
      return { pts: sp, L: L, len: L[n] };
    }
    function loopAt(lp, s, out) {
      s = ((s % lp.len) + lp.len) % lp.len; var lo = 0, hi = lp.L.length - 1;
      while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (lp.L[mid] <= s) lo = mid; else hi = mid; }
      out.lerpVectors(lp.pts[lo], lp.pts[hi], (s - lp.L[lo]) / Math.max(1e-6, lp.L[hi] - lp.L[lo]));
      return Math.atan2(lp.pts[hi].x - lp.pts[lo].x, lp.pts[hi].z - lp.pts[lo].z);
    }
    function rect(x0, z0, x1, z1, r) { return [[x0 + r, z0], [x1 - r, z0], [x1, z0 + r * Math.sign(z1 - z0)], [x1, z1 - r * Math.sign(z1 - z0)], [x1 - r, z1], [x0 + r, z1], [x0, z1 - r * Math.sign(z1 - z0)], [x0, z0 + r * Math.sign(z1 - z0)]]; }
    function onCurve(g, curve, t, reverse) {
      t = Math.max(0, Math.min(1, t)); var p = curve.getPointAt(t), tg = curve.getTangentAt(Math.min(.999, Math.max(.001, t)));
      g.position.copy(p); var a = Math.atan2(tg.x, tg.z); g.rotation.y = reverse ? a + Math.PI : a;
    }
    // journey markers on the ground (gate → dock → exit)
    var pins = [[1.2, 31.4], [BAY + 3.3, -14], [-10.6, 40]].map(function (q) { var g = new T.Group(); g.position.set(q[0], 0, q[1]); add(new T.CylinderGeometry(.08, .08, 3, 8), B(0x2673B5), 0, 1.5, 0, g); add(new T.SphereGeometry(.42, 16, 12), B(0x2673B5), 0, 3.2, 0, g); g.visible = false; scene.add(g); return g; });

    /* tags */
    var tPlate = tag('ANPR · <b>XX 00 AB 1234</b> · truck', 'dark'); tPlate.p.set(-3, 5.4, 34);
    var tLog = tag('Gate 1 · in · 08:42 IST · logged'); tLog.p.set(8, 4.6, 29);
    var tPins = [tag('Gate 1 · 08:42'), tag('Dock 4 · 08:51'), tag('Exit · 10:07')];
    tPins[0].p.set(1.2, 4.6, 31.4); tPins[1].p.set(BAY + 3.3, 4.6, -14); tPins[2].p.set(-10.6, 4.6, 40);
    var tWall = tag('Cygnus · 9 cameras · recording 24×7'); wallG.updateMatrixWorld(true); tWall.p.set(0, RF + .1, RD / 2 + .6); wallG.localToWorld(tWall.p);
    var tExport = tag('Clip · Dock 4 · 08:51 · exported', 'dark'); tExport.p.set(0, RF + .45, VW_Z + .2); wallG.localToWorld(tExport.p);
    var tTamper = tag('Tamper · CAM 12 · view blocked', 'alert'); tTamper.p.set(31, SH_H - 1.4, -50);
    // alert ring + cover on the aisle camera
    var ring = add(new T.RingGeometry(1.0, 1.25, 40), new T.MeshBasicMaterial({ color: 0xD6453D, transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false }), 31, SH_H - .8, -50); ring.rotation.x = Math.PI / 2;
    var coverM = new T.MeshStandardMaterial({ color: 0x7A6A55, roughness: 1, transparent: true, opacity: 0 });
    var cover = add(new T.SphereGeometry(.38, 14, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), coverM, 31, SH_H - .38, -50);
    // dock occupancy & dwell: bay fills in front of each dock, a dwell tag on the busy ones, and a yard summary
    var BUSY = [{ d: 1, base: 42 }, { d: 3, base: 9 }, { d: 5, base: 78 }, { d: 7, base: 27 }];
    var bayFillM = new T.MeshBasicMaterial({ color: 0x2673B5, transparent: true, opacity: 0, depthWrite: false }), bayFreeM = new T.MeshBasicMaterial({ color: 0x3FA36B, transparent: true, opacity: 0, depthWrite: false });
    var BAYFILLS = DOCKS.map(function (dk, i) { var busy = BUSY.some(function (b) { return b.d === i; }); return add(new T.PlaneGeometry(4.6, 15).rotateX(-Math.PI / 2), busy ? bayFillM : bayFreeM, dk.x, .05, -21.5); });
    var tDwell = BUSY.map(function (b) { var t = tag('', b.base > 60 ? 'alert' : 'dark'); t.p.set(DOCKS[b.d].x, 8.6, SH_Z1 + 1.8); t.base = b.base; t.d = b.d; return t; });
    var tDocks = tag('Docks · <b>4 of 8 busy</b> · average dwell 39 min'); tDocks.p.set(-6, 15.2, -12);

    /* ---------- camera path: one key per station, with a dwell at each ---------- */
    var KEYS = MOB ? [
      { p: [8, 9, 58], t: [-3, 2.5, 30] },
      { p: [40, 30, 34], t: [6, 0, -6] },
      { p: [-22.6, 4.3, 27.6], t: [-30.2, 2.6, 13.6] },
      { p: [31, 4.2, -30], t: [31, 9, -52] },
      { p: [-2, 19, 30], t: [-6, 2, -26] }
    ] : [
      { p: [16, 8.5, 56], t: [2, 2.8, 30] },
      { p: [38, 28, 32], t: [4, 0, -6] },
      { p: [-23.3, 3.9, 26.3], t: [-30.2, 2.5, 13.6] },
      { p: [31, 4.4, -29], t: [31, 9.4, -52] },
      { p: [-2, 15, 21], t: [-6, 2.2, -26] }
    ];
    var cPos = new T.Vector3(), cTgt = new T.Vector3(), tmpA = new T.Vector3(), tmpB = new T.Vector3();
    var SHF = [[-2, 2, 26, 26], [2, 6, -12, 66], [-30, 2, 14, 16], [31, 5, -48, 22], [-6, 3, -20, 34]];   // shadow focus per station
    function ease(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    function camAt(progress, time) {
      var n = KEYS.length, s = Math.max(0, Math.min(n - 1e-4, progress * n)), i = Math.floor(s), f = s - i;
      var a = KEYS[i], b = KEYS[Math.min(n - 1, i + 1)], k = i === n - 1 ? 0 : ease(Math.max(0, (f - .58) / .42));
      // through the open door: the path from the dock overview to the aisle bends via the doorway
      cPos.set(a.p[0], a.p[1], a.p[2]).lerp(tmpA.set(b.p[0], b.p[1], b.p[2]), k);
      cTgt.set(a.t[0], a.t[1], a.t[2]).lerp(tmpB.set(b.t[0], b.t[1], b.t[2]), k);
      if (i === 2 && k > 0) { var arc = Math.sin(k * Math.PI); cPos.x += arc * 18; cPos.y -= arc * 2; cPos.z += arc * 6; } // swing round towards the door
      shadowFocus(SHF[i], SHF[Math.min(n - 1, i + 1)], k);
      var sway = REDUCE ? 0 : Math.sin(time * .25) * .35;
      cam.position.set(cPos.x + sway, cPos.y + sway * .3, cPos.z);
      cam.lookAt(cTgt);
    }

    /* ---------- per-frame ---------- */
    // yard forklift: staging loop by the west fence; aisle forklift: aisle 3; floor forklift: marshalling lane by the docks
    var time = 0, lastStation = -1, stT = 0, stStart = 0, liftPaths = [loopPath(rect(-41.5, -8, -34, 2.2, 2.2)), loopPath(rect(29.9, -39, 32.4, -62, 1.0)), loopPath(rect(-35, -34.5, 13.2, -63, 2.4))];
    var dead = false, revT = 0, reachT = 0, liftS = [0, 8, 20], liftMoving = [false, false, false], gtT = 2.4, boomE = 0, boomX = 0, _np = new T.Vector3(), _lp = new T.Vector3();
    var XING = new T.Vector3(7.8, 0, -34.5);
    function fmtDwell(min) { var h = Math.floor(min / 60), m = Math.floor(min % 60); return (h ? h + ' h ' : '') + m + ' m'; }
    function update(progress, stationIndex, dt) {
      if (dead) return;
      dt = Math.max(0, Math.min(.05, dt || .016)); time += dt;   // never run backwards (a host can hand over a negative first dt)
      // each station's script runs on wall-clock time so its moment plays at real speed even on a slow GPU
      var nowS = performance.now() / 1000;
      if (stationIndex !== lastStation) { lastStation = stationIndex; stStart = nowS; shDirty = true; }
      stT = nowS - stStart;
      var st = stationIndex, gateReversing = false, seen = [false, false, false], gph = -1;
      // gate truck: approach (st 0) -> the full visit on a loop (st 1) -> docked afterwards. It waits at each barrier
      // until the arm is fully up; the arm drops once the trailer is clear.
      if (st !== 1) gtT = 2.4;
      if (st === 0) { onCurve(gateTruck, P.approach, ease(Math.min(1, stT / 2.2))); gph = stT > 2.2 ? 1 : 0; }
      else if (st === 1) {
        var nc = gtT + dt;
        if (gtT <= 2.9 && nc > 2.9 && boomE < .98) nc = 2.9;
        else if (gtT <= 14.2 && nc > 14.2 && boomX < .98) nc = 14.2;
        gtT = nc >= GT_END[8] ? 0 : nc;
        var gp = gatePose(gtT); onCurve(gateTruck, gp[0], gp[1], gp[2]); gph = gtT === 14.2 ? 7 : gp[3];
        gateReversing = gph === 4;
        seen[0] = gph >= 1; seen[1] = gph >= 5; seen[2] = gph === 8 && gateTruck.position.z > 38;
      } else onCurve(gateTruck, P.reverse, 1, true);
      var gz = gateTruck.position.z;
      var entryT = (st === 0 && stT > 2.3) || (st === 1 && ((gph === 1 && gtT > 2.6) || (gph === 2 && gz > 20))) ? 1 : 0;
      var exitT = st === 1 && (gph === 7 || (gph === 6 && gtT > 13.8) || (gph === 8 && gz < 36.2)) ? 1 : 0;
      boomE += Math.max(-dt / .8, Math.min(dt / .6, entryT - boomE)); boomX += Math.max(-dt / .8, Math.min(dt / .6, exitT - boomX));
      if (REDUCE) { boomE = entryT; boomX = exitT; }
      boom.rotation.z = -boomE * 1.4; boomXg.rotation.z = -boomX * 1.4;
      gateRev.visible = gateReversing && Math.sin(time * 10) > -.2;
      // background reefer: reverses into dock 7 (reverse lights on), waits, pulls out, repeats
      revT += dt;
      var rc = (revT % 25), revOn = false;   // reverse on (6 s), stay while the door, leveller and unloading run, pull out (5 s)
      if (rc < 6) { onCurve(reverser, revPath, ease(rc / 6), true); revOn = true; } else if (rc < 20) onCurve(reverser, revPath, 1, true); else onCurve(reverser, revPath, 1 - ease((rc - 20) / 5), true);
      revRev.visible = revOn && Math.sin(time * 10) > -.2;
      // forklifts keep to their loops, hold back from trucks and give way at the walkway crossing
      var pedOn = PEDS.some(function (w) { return w.onX; });
      // each forklift also stops twice per loop to lift its pallet (6 s: raise 1.5 m, hold, lower); the inner mast follows at half speed
      lifts.forEach(function (l, i) {
        var lp = liftPaths[i], u = l.userData, ok = !REDUCE;
        if (u.stopT > 0) { u.stopT = Math.max(0, u.stopT - dt); ok = false; var sf = 1 - u.stopT / 6; u.lift = 1.5 * (sf < .3 ? ease(sf / .3) : sf < .7 ? 1 : 1 - ease((sf - .7) / .3)); }
        else {
          u.lift = 0; var ns = liftS[i] + dt * (2.2 + i * .3), hd = loopAt(lp, ns, _lp);
          [gateTruck, reverser].concat(parked).forEach(function (tk) { if (ok && Math.hypot(_lp.x - tk.position.x, _lp.z - tk.position.z) < 9.5) ok = false; });
          if (ok && i === 2 && pedOn && _lp.distanceTo(XING) < 4.6 && l.position.distanceTo(XING) >= 4.4) ok = false;
          if (ok) { var a0 = ((liftS[i] % lp.len) + lp.len) % lp.len, a1 = a0 + (ns - liftS[i]); [lp.len * .45, lp.len * .9].forEach(function (sm) { if (a0 < sm && a1 >= sm) u.stopT = 6; }); liftS[i] = ns; }
        }
        liftMoving[i] = ok;
        l.rotation.y = loopAt(lp, liftS[i], l.position);
        u.carr.position.y = u.lift; u.inner.position.y = u.lift / 2;
        u.arms.rotation.z = ok ? Math.sin(time * 1.3 + i * 2) * .12 : 0; u.arms.rotation.x = u.stopT > 0 ? -.12 : 0;
      });
      // reach truck: drive the aisle, turn to the rack, lift, extend the pantograph, set the pallet on the beams (or lift it off),
      // retract, lower, turn back, run to the far end and return; put-away and retrieval alternate every 41.5 s
      if (!REDUCE) reachT += dt;
      var rHalf = Math.floor(reachT / 41.5), put = REDUCE || rHalf % 2 === 0, rt = REDUCE ? 15.2 : reachT % 41.5;
      var cA = put ? 5.6475 : 5.52, cB = put ? 5.52 : 5.6475, CSW = 5.5475, X_T = 25.95, EMAX = RSLOT.x - X_T - 1.09, zA = -38.5, zB = -63;
      var rz = zA, rr = Math.PI, rcc = .2, re = 0;
      function rq(t0, t1) { return ease(Math.max(0, Math.min(1, (rt - t0) / (t1 - t0)))); }
      if (rt < 6) rz = zA + (RSLOT.z - zA) * rq(0, 6);
      else if (rt < 24.5) {
        rz = RSLOT.z; rr = Math.PI - Math.PI / 2 * (rt < 22.5 ? rq(6, 8) : 1 - rq(22.5, 24.5));
        if (rt < 14.5) rcc = .2 + (cA - .2) * rq(8, 12); else if (rt < 16) rcc = cA + (cB - cA) * rq(14.5, 16); else rcc = cB + (.2 - cB) * rq(18.5, 22.5);
        re = rt < 16 ? EMAX * rq(12, 14.5) : EMAX * (1 - rq(16, 18.5));
      }
      else if (rt < 30) rz = RSLOT.z + (zB - RSLOT.z) * rq(24.5, 30);
      else if (rt < 32) { rz = zB; rr = Math.PI * (1 - rq(30, 32)); }
      else if (rt < 40) { rz = zB + (zA - zB) * rq(32, 40); rr = 0; }
      else rr = -Math.PI * rq(40, 41.5);
      var carrying = put ? (rt < 14.5 || (rt < 16 && rcc > CSW)) : (rt >= 16 || (rt >= 14.5 && rcc >= CSW));
      forkLoad.visible = carrying; slotLoad.visible = !carrying;
      REACH.position.set(X_T, 0, rz); REACH.rotation.y = rr; carriage.position.y = rcc; mastIn.position.y = Math.max(0, rcc - 3.0); forkG.position.z = .12 + re; setPanto(re);
      rArms.rotation.x = rt > 8 && rt < 22.5 ? -.15 + Math.sin(time * 2) * .05 : 0;
      JACKS[1].position.x = 32.8 + Math.sin(time * .5) * .6;
      // dock signals: red while a trailer is on the dock, green when free
      // a door rolls up only once a trailer has stood at its dock for 1.5 s; then the leveller rises, swings its lip out and
      // settles; before the trailer leaves the leveller stows and the door closes again
      var TRK = [gateTruck, reverser].concat(parked);
      TRK.forEach(function (tk) { var pp = tk.userData.pp || (tk.userData.pp = tk.position.clone()); tk.userData.mv = pp.distanceToSquared(tk.position) > 1e-6; pp.copy(tk.position); });
      DOCKS.forEach(function (dk) {
        var tk = null; TRK.forEach(function (t2) { if (!tk && Math.abs(t2.position.x - dk.x) < 1.5 && t2.position.z < -19) tk = t2; });
        var busy = !!tk;
        dk.r.material = busy ? dockRed : dockRedOff; dk.g.material = busy ? dockGreenOff : dockGreen;
        dk.still = tk && !tk.userData.mv ? dk.still + dt : 0;
        var want = dk.still > 1.5 && !(tk === reverser && rc > 15.5);
        if (REDUCE) { dk.o = dk.l = want ? 1 : 0; }
        else if (want) { if (dk.o < 1) dk.o = Math.min(1, dk.o + dt / 2.4); else dk.l = Math.min(1, dk.l + dt / 2); }
        else if (dk.l > 0) dk.l = Math.max(0, dk.l - dt / 1.6); else dk.o = Math.max(0, dk.o - dt / 2.4);
        var vis = Math.max(.02, 1 - ease(dk.o));
        dk.shut.scale.y = vis; dk.shut.position.y = DTOP - DH2 * vis / 2; dk.sm.map.repeat.y = vis;
        var la = Math.min(1, dk.l / .5), lb = Math.max(0, (dk.l - .5) / .5);
        dk.lev.rotation.x = dk.l < .5 ? -.12 * ease(la) : -.12 + .09 * ease(lb);
        dk.lip.rotation.x = dk.l < .5 ? 1.45 * (1 - ease(la)) : .05 * ease(lb);
      });
      // staff on the green walkways: they cross the forklift lane only while the floor forklift is clear or stopped
      var fl = lifts[2], fd = fl ? fl.position.distanceTo(XING) : 99, crossOK = !fl || fd > 9 || (!liftMoving[2] && fd > 3.2);
      PEDS.forEach(function (w, i) {
        var moving = false;
        if (w.wait > 0) w.wait -= dt;
        else if (!REDUCE) {
          var ns = w.s + w.dir * w.sp * dt, flip = false;
          if (ns >= w.path.len || ns <= 0) { ns = Math.max(0, Math.min(w.path.len, ns)); flip = true; }
          var hd = pathAt(w.path, ns, _np), inX = Math.abs(_np.x - XING.x) < 1 && Math.abs(_np.z - XING.z) < 1.9, ok = !(inX && !w.onX && !crossOK);
          lifts.concat([REACH]).forEach(function (v) { if (ok) { var d1 = Math.hypot(_np.x - v.position.x, _np.z - v.position.z); if (d1 < 3.2 && d1 < Math.hypot(w.x - v.position.x, w.z - v.position.z)) ok = false; } });
          if (ok) { w.s = ns; w.x = _np.x; w.z = _np.z; w.ry = hd + (w.dir < 0 ? Math.PI : 0); moving = true; if (flip) { w.dir *= -1; w.wait = 1 + Math.random() * 1.5; } }
        }
        w.onX = Math.abs(w.x - XING.x) < 1 && Math.abs(w.z - XING.z) < 1.9;
        drawWorker(i, w.x, 0, w.z, w.ry, 0, moving, moving ? [Math.sin(time * 7 + i) * .4, -Math.sin(time * 7 + i) * .4] : [0, 0]);
      });
      WPARTS.forEach(function (o) { o.instanceMatrix.needsUpdate = true; });
      // station reveals (each lands within ~2.5 s)
      tPlate.on = st === 0 && stT > 1.6; tLog.on = st === 0 && stT > 2.4;
      pins.forEach(function (p, i) { var on = st === 1 && seen[i]; p.visible = on; tPins[i].on = on; });
      tWall.on = st === 2; tExport.on = st === 2 && stT > 2.0;
      drawTimeline(st === 2 ? Math.min(.62, .2 + stT * .2) : .4);
      var blind = st === 3 ? Math.max(0, Math.min(1, (stT - .9) / 1.3)) : 0, alarm = st === 3 && stT >= 2.3;
      coverM.opacity = blind * .95; ring.material.opacity = alarm ? .5 + .5 * Math.sin(time * 6) : 0;
      tTamper.on = alarm;
      TILES[3].m.material.map = alarm ? noiseTex : TILES[3].tex;
      var dOn = st === 4 ? Math.min(1, stT / .5) : 0;
      bayFillM.opacity = dOn * .22; bayFreeM.opacity = dOn * .14;
      BAYFILLS.forEach(function (b) { b.visible = dOn > 0; });
      tDwell.forEach(function (t, i) { t.on = st === 4 && stT > .4 + i * .25; if (t.on) t.el.innerHTML = 'Dock ' + (t.d + 1) + ' · dwell <b>' + fmtDwell(t.base + stT * 2) + '</b>'; });
      tDocks.on = st === 4 && stT > 1.6;
      DOCKCAMS.forEach(function (c2, i) { c2.rotation.y = Math.sin(time * .3 + i) * .15; });
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
      [noiseTex, tlTex, fenceTex, envTex].forEach(function (t) { if (t) t.dispose(); });
      renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      if (tags.parentNode) tags.parentNode.removeChild(tags);
    }
    var r0 = host.getBoundingClientRect(); resize(r0.width || 800, r0.height || 500);
    return { update: update, warm: function (done) { (window.INFRAX_WARM || function (r, s, c, d) { d(); })(renderer, scene, cam, done); }, resize: resize, setDpr: function (v) { renderer.setPixelRatio(v); renderer.setSize(W, H, false); }, dispose: dispose };
  }
})();

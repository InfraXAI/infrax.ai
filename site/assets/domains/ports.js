/* INFRAX.AI domain journey: ports. Self-contained module, loaded on demand by products.html. */
(function () {
  'use strict';
  /* ---------------------------------------------------------------------------------------------
     Shared kit (copied into each domain module so the file stays self-contained).
     Light blueprint-real look matching the highway tunnel: ACES, sRGB, physically correct lights,
     procedural sky for reflections, soft sun shadows on desktop only.
     --------------------------------------------------------------------------------------------- */
  function makeKit(host, ctx) {
    var T = ctx.THREE, MOB = !!ctx.mobile, LOW = !!ctx.lowGpu, SH = !MOB && !LOW; // integrated GPUs: no shadows, no MSAA
    var owned = [];                       // textures / render targets we must dispose
    var gcache = {}, mcache = {};
    if (T.ColorManagement) T.ColorManagement.legacyMode = false;

    var renderer = new T.WebGLRenderer({ antialias: !MOB && !LOW && (devicePixelRatio || 1) < 1.5, alpha: true, powerPreference: 'high-performance' });
    renderer.debug.checkShaderErrors = false; // no synchronous compile-log reads
    renderer.setPixelRatio(Math.min(ctx.dpr || 1, MOB ? 1.25 : 1.75));
    renderer.setClearColor(0xffffff, 0);
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
    if (SH) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFShadowMap; renderer.shadowMap.autoUpdate = false; }
    var cv = renderer.domElement; cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.style.overflow = 'hidden';
    host.appendChild(cv);

    var scene = new T.Scene();
    scene.fog = new T.FogExp2(0xF2F6FA, MOB ? .0055 : .0042);
    var camera = new T.PerspectiveCamera(MOB ? 62 : 50, 1, .4, 900);

    (function env() {
      var es = new T.Scene(), g = new T.SphereGeometry(60, 32, 16), cl = [], top = new T.Color(0xBFD7EE), hor = new T.Color(0xFFFFFF), bot = new T.Color(0x77838F), tmp = new T.Color(), p = g.attributes.position;
      for (var i = 0; i < p.count; i++) { var y = p.getY(i) / 60; if (y > 0) tmp.copy(hor).lerp(top, Math.pow(y, .6)); else tmp.copy(hor).lerp(bot, Math.min(1, -y * 2.4)); cl.push(tmp.r, tmp.g, tmp.b); }
      g.setAttribute('color', new T.Float32BufferAttribute(cl, 3));
      var sky = new T.Mesh(g, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide })); es.add(sky);
      var dm = new T.MeshBasicMaterial({ color: 0xffffff }); dm.color.multiplyScalar(8);
      var disc = new T.Mesh(new T.SphereGeometry(4, 16, 8), dm); disc.position.set(25, 40, 20); es.add(disc);
      var pm = new T.PMREMGenerator(renderer), rt = pm.fromScene(es, .03); scene.environment = rt.texture; owned.push(rt); pm.dispose();
      g.dispose(); sky.material.dispose(); disc.geometry.dispose(); dm.dispose();
    })();
    scene.add(new T.HemisphereLight(0xF4F8FC, 0x8C97A3, .78));
    var sun = new T.DirectionalLight(0xFFF4E6, 2.9); sun.position.set(40, 70, 35); scene.add(sun); scene.add(sun.target);
    if (SH) {
      sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
      var shc = sun.shadow.camera; shc.left = -60; shc.right = 60; shc.top = 60; shc.bottom = -60; shc.near = 5; shc.far = 220;
      sun.shadow.bias = -.0005; sun.shadow.normalBias = .04; sun.shadow.radius = 3;
    }

    function M(c, o) {
      var key = c + JSON.stringify(o || {});
      if (!o || !o.map) { if (mcache[key]) return mcache[key]; }
      var m = new T.MeshStandardMaterial(Object.assign({ color: c, roughness: .78, metalness: .05 }, o || {}));
      if (!o || !o.map) mcache[key] = m; return m;
    }
    function B(c, o) { return new T.MeshBasicMaterial(Object.assign({ color: c, toneMapped: false }, o || {})); }
    function geo(key, make) { return gcache[key] || (gcache[key] = make()); }
    function cs(o) { if (SH) { o.castShadow = true; o.receiveShadow = true; } return o; }
    function rcv(o) { if (SH) o.receiveShadow = true; return o; }
    function box(w, h, d, mat, x, y, z, parent) {
      var m = cs(new T.Mesh(geo('b' + w + '_' + h + '_' + d, function () { return new T.BoxGeometry(w, h, d); }), mat));
      m.position.set(x || 0, y || 0, z || 0); if (parent !== false) (parent || scene).add(m); return m;
    }
    function cyl(r1, r2, h, seg, mat, x, y, z, parent) {
      var m = cs(new T.Mesh(geo('c' + r1 + '_' + r2 + '_' + h + '_' + seg, function () { return new T.CylinderGeometry(r1, r2, h, seg); }), mat));
      m.position.set(x || 0, y || 0, z || 0); if (parent !== false) (parent || scene).add(m); return m;
    }
    function canvasTex(w, h, draw, rep, linear) {
      var c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
      var t = new T.CanvasTexture(c); if (!linear) t.encoding = T.sRGBEncoding; t.anisotropy = 8;
      if (rep) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
      owned.push(t); return t;
    }
    function imgTex(src) {
      var t = new T.TextureLoader().load(src); t.encoding = T.sRGBEncoding; t.anisotropy = 4; owned.push(t); return t;
    }
    /* crisp brand-blue title board (same drawing as the highway tunnel) */
    function titleBoard(lines, opt) {
      opt = opt || {};
      var c = document.createElement('canvas'); c.width = 2048; c.height = 324;
      var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 16; owned.push(t);
      function draw() {
        var x = c.getContext('2d'), w = c.width, h = c.height;
        x.clearRect(0, 0, w, h);
        x.fillStyle = '#2673B5'; x.fillRect(0, 0, w, h);
        x.strokeStyle = '#1B5A94'; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, h - 14);
        x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 4; x.strokeRect(26, 26, w - 52, h - 52);
        x.textBaseline = 'middle';
        if (opt.num) {
          x.fillStyle = '#FFFFFF'; x.fillRect(62, 62, 200, h - 124);
          x.fillStyle = '#2673B5'; x.font = '800 132px "Onest", "Segoe UI", sans-serif'; x.textAlign = 'center';
          x.fillText(opt.num, 162, h / 2 + 4);
        }
        var left = opt.num ? 318 : 90, right = w - 90;
        if (opt.grp) {
          x.fillStyle = '#DCEBF7'; x.font = '600 58px "Geist Mono", ui-monospace, Consolas, monospace'; x.textAlign = 'right';
          x.fillText(opt.grp.toUpperCase(), right, h / 2 + 2); right -= x.measureText(opt.grp.toUpperCase()).width + 60;
        }
        x.fillStyle = '#FFFFFF'; x.textAlign = opt.num ? 'left' : 'center';
        var size = lines.length > 1 ? 104 : 150;
        x.font = '800 ' + size + 'px "Onest", "Segoe UI", sans-serif';
        var maxW = right - left; while (x.measureText(lines[0]).width > maxW && size > 60) { size -= 6; x.font = '800 ' + size + 'px "Onest", "Segoe UI", sans-serif'; }
        var cx = opt.num ? left : w / 2;
        if (lines.length > 1) { x.fillText(lines[0], cx, h * .34); x.fillText(lines[1], cx, h * .7); }
        else x.fillText(lines[0], cx, h / 2 + 6);
        t.needsUpdate = true;
      }
      draw();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
      return t;
    }
    /* station board on two posts */
    function stationBoard(num, name, grp, x, z, rotY, parent, scale) {
      var g = new T.Group(), steel = M(0xA9B3BD, { metalness: .65, roughness: .35 });
      cyl(.14, .14, 6.4, 10, steel, -4.6, 3.2, 0, g); cyl(.14, .14, 6.4, 10, steel, 4.6, 3.2, 0, g);
      box(10.6, 1.9, .28, M(0x1C2733, { roughness: .5 }), 0, 6.3, -.05, g);
      var rib = M(0x8E959C, { metalness: .5, roughness: .45 });
      box(10.4, 1.7, .03, M(0xB9C0C7, { metalness: .4, roughness: .5 }), 0, 6.3, -.205, g);
      [-3.4, 0, 3.4].forEach(function (rx) { box(.12, 1.6, .1, rib, rx, 6.3, -.26, g); });
      box(9.6, .1, .1, rib, 0, 6.85, -.26, g); box(9.6, .1, .1, rib, 0, 5.75, -.26, g);
      [-4.6, 4.6].forEach(function (px) { box(.5, .08, .5, M(0x8E959C, { metalness: .5 }), px, .04, 0, g); });
      var brd = new T.Mesh(geo('pl10x1.6', function () { return new T.PlaneGeometry(10.1, 1.6); }), B(0xffffff, { map: titleBoard([name], { num: num, grp: grp }) }));
      brd.position.set(0, 6.3, .1); g.add(brd);
      g.position.set(x, 0, z); g.rotation.y = rotY || 0; if (scale) g.scale.setScalar(scale); (parent || scene).add(g); return g;
    }
    /* camera model: bracket, housing, sunshield, bezel, glass lens, IR ring (faces -z of its group) */
    function camModel(parent, scale) {
      var housing = M(0xF4F6F8, { roughness: .32, metalness: .15 }), dark = M(0x1C232B, { roughness: .3, metalness: .6 }), glass = M(0x0B1520, { roughness: .04, metalness: .9 }), bracket = M(0x9AA4AE, { metalness: .65, roughness: .38 });
      var h = new T.Group();
      box(.08, .5, .08, bracket, 0, .48, .25, h);
      box(.5, .46, 1.2, housing, 0, 0, 0, h);
      box(.64, .05, 1.48, housing, 0, .26, -.06, h);
      var bz = cyl(.22, .22, .06, 18, dark, 0, 0, -.62, h); bz.rotation.x = Math.PI / 2;
      var ln = cyl(.13, .13, .08, 16, glass, 0, 0, -.64, h); ln.rotation.x = Math.PI / 2;
      var ir = new T.Mesh(geo('ir', function () { return new T.TorusGeometry(.18, .022, 6, 22); }), B(0x5A1A1A)); ir.position.z = -.66; h.add(ir);
      h.scale.setScalar(scale || 1); if (parent) parent.add(h); return h;
    }
    /* pole camera: pole + arm + camera aimed at a target */
    function poleCam(x, z, height, target, parent) {
      var g = new T.Group(), steel = M(0x9AA4AE, { metalness: .6, roughness: .4 });
      cyl(.13, .17, height, 10, steel, 0, height / 2, 0, g);
      var c = camModel(g, 1.1); c.position.set(0, height - .2, 0);
      g.position.set(x, 0, z); (parent || scene).add(g);
      var wp = new T.Vector3(x, height - .2, z); var dir = new T.Vector3().subVectors(target, wp);
      c.rotation.order = 'YXZ'; c.rotation.y = Math.atan2(-dir.x, -dir.z); c.rotation.x = Math.atan2(dir.y, Math.hypot(dir.x, dir.z));
      g.userData.cam = c; g.userData.head = wp; return g;
    }
    /* a translucent view cone from p toward target (for "camera sees" moments) */
    function viewCone(p, target, len, spread, color) {
      var dir = new T.Vector3().subVectors(target, p).normalize();
      var g = new T.ConeGeometry(spread, len, 4, 1, true); g.translate(0, -len / 2, 0); g.rotateX(-Math.PI / 2);
      var m = new T.MeshBasicMaterial({ color: color || 0x2673B5, transparent: true, opacity: .1, side: T.DoubleSide, depthWrite: false });
      var mesh = new T.Mesh(g, m); mesh.position.copy(p); mesh.lookAt(p.clone().add(dir)); scene.add(mesh);
      return mesh;
    }
    /* ---------- merged-geometry builder ----------
       Many small coloured parts become one BufferGeometry per material layer (vertex colours), so a detailed
       car, person, bench or tree costs a handful of draw calls and can be instanced.
       Layers: p paint (per-object or per-instance colour), m matte, s satin metal, g glass, e unlit (lamps, LEDs). */
    var VCM = null;
    function vcMats() {
      if (!VCM) VCM = {
        p: M(0xffffff, { vertexColors: true, roughness: .34, metalness: .4 }), m: M(0xffffff, { vertexColors: true, roughness: .8, metalness: .04 }),
        s: M(0xffffff, { vertexColors: true, roughness: .36, metalness: .62 }), g: M(0xffffff, { vertexColors: true, roughness: .06, metalness: .86 }),
        e: B(0xffffff, { vertexColors: true })
      };
      return VCM;
    }
    var _e = new T.Euler(), _q = new T.Quaternion(), _p = new T.Vector3(), _s = new T.Vector3(), _col = new T.Color(), UG = {};
    function X(x, y, z, rx, ry, rz, sx, sy, sz) {
      _e.set(rx || 0, ry || 0, rz || 0); _q.setFromEuler(_e); _p.set(x || 0, y || 0, z || 0); _s.set(sx == null ? 1 : sx, sy == null ? 1 : sy, sz == null ? 1 : sz);
      return new T.Matrix4().compose(_p, _q, _s);
    }
    function unitG(k) {
      if (!UG[k]) UG[k] = k === 'b' ? new T.BoxGeometry(1, 1, 1) : k.charAt(0) === 'c' ? new T.CylinderGeometry(1, 1, 1, +k.slice(1)) : new T.SphereGeometry(1, +k.slice(1), Math.max(4, +k.slice(1) * .6 | 0));
      return UG[k];
    }
    function builder() {
      var L = { p: [], m: [], s: [], g: [], e: [] }, own = [], frame = null;
      var api = {
        frame: function (m4) { frame = m4 || null; return api; },
        add: function (g, col, m4, layer, owned) { if (frame) m4 = frame.clone().multiply(m4); L[layer || 'm'].push([g, col, m4]); if (owned) own.push(g); return api; },
        box: function (w, h, d, col, x, y, z, layer, rx, ry, rz) { return api.add(unitG('b'), col, X(x, y, z, rx, ry, rz, w, h, d), layer); },
        cyl: function (rt, rb, h, seg, col, x, y, z, layer, rx, ry, rz) {
          if (rt === rb) return api.add(unitG('c' + (seg || 10)), col, X(x, y, z, rx, ry, rz, rt, h, rt), layer);
          return api.add(new T.CylinderGeometry(rt, rb, h, seg || 10), col, X(x, y, z, rx, ry, rz), layer, true);
        },
        sph: function (r, col, x, y, z, layer, sx, sy, sz, seg) { return api.add(unitG('s' + (seg || 10)), col, X(x, y, z, 0, 0, 0, r * (sx || 1), r * (sy || 1), r * (sz || 1)), layer); },
        geo: function (g, col, x, y, z, layer, rx, ry, rz, sx, sy, sz, owned) { return api.add(g, col, X(x, y, z, rx, ry, rz, sx, sy, sz), layer, owned); },
        rod: function (a, b, r, col, layer, seg) {
          var d = new T.Vector3().subVectors(b, a), len = d.length(), q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), d.clone().normalize());
          return api.add(unitG('c' + (seg || 6)), col, new T.Matrix4().compose(a.clone().addScaledVector(d, .5), q, new T.Vector3(r, len, r)), layer);
        },
        build: function () { var out = {}; Object.keys(L).forEach(function (k) { if (L[k].length) out[k] = mergeList(L[k]); }); own.forEach(function (g) { g.dispose(); }); return out; }
      };
      return api;
    }
    function mergeList(list) {
      var n = 0, parts = list.map(function (q) { var g = q[0].index ? q[0].toNonIndexed() : q[0].clone(); g.applyMatrix4(q[2]); n += g.attributes.position.count; return [g, q[1]]; });
      var pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3), o = 0;
      parts.forEach(function (q) {
        var g = q[0], c = g.attributes.position.count; if (!g.attributes.normal) g.computeVertexNormals();
        pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3);
        _col.setHex(q[1]); for (var i = 0; i < c; i++) { col[(o + i) * 3] = _col.r; col[(o + i) * 3 + 1] = _col.g; col[(o + i) * 3 + 2] = _col.b; }
        o += c; g.dispose();
      });
      var out = new T.BufferGeometry(); out.setAttribute('position', new T.BufferAttribute(pos, 3)); out.setAttribute('normal', new T.BufferAttribute(nor, 3)); out.setAttribute('color', new T.BufferAttribute(col, 3));
      out.computeBoundingSphere(); return out;
    }
    /* one mesh per layer in a group; paint overrides the p layer material (object colour) */
    function meshes(geos, parent, paint) {
      var g = new T.Group(), V = vcMats();
      Object.keys(geos).forEach(function (k) { var m = new T.Mesh(geos[k], k === 'p' && paint ? paint : V[k]); if (k !== 'e') cs(m); g.add(m); });
      if (parent !== false) (parent || scene).add(g); return g;
    }
    /* instanced copies of a built model: list [x,y,z, sx,sy,sz, ry, rx, rz]; colors tint the p layer per instance */
    function instMerged(geos, list, parent, colors) {
      var g = new T.Group(), V = vcMats(), o = new T.Object3D(), c = new T.Color();
      Object.keys(geos).forEach(function (k) {
        var im = new T.InstancedMesh(geos[k], V[k], Math.max(1, list.length));
        list.forEach(function (q, i) {
          o.position.set(q[0], q[1], q[2]); o.scale.set(q[3] || 1, q[4] || 1, q[5] || 1); o.rotation.set(q[7] || 0, q[6] || 0, q[8] || 0); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
          if (k === 'p' && colors) im.setColorAt(i, c.setHex(colors[i % colors.length]));
        });
        im.count = list.length; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
        im.frustumCulled = false; if (k !== 'e') cs(im); g.add(im);
      });
      (parent || scene).add(g); return g;
    }
    /* deterministic vertex jitter (organic foliage); coincident vertices move together so meshes stay closed */
    function jitter(g, amt, seed) {
      var p = g.attributes.position;
      for (var i = 0; i < p.count; i++) {
        var x = p.getX(i), y = p.getY(i), z = p.getZ(i), h = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + (seed || 0)) * 43758.5453; h = h - Math.floor(h) - .5;
        var f = 1 + h * amt; p.setXYZ(i, x * f, y * f, z * f);
      }
      g.computeVertexNormals(); return g;
    }
    function shapeOf(pts) { var s = new T.Shape(); pts.forEach(function (q, i) { if (i) s.lineTo(q[0], q[1]); else s.moveTo(q[0], q[1]); }); return s; }
    /* side profile (z forward, y up) extruded across x with rounded edges; full width = w */
    function profileX(pts, w, bev, segs) {
      var b = bev == null ? .05 : bev, d = w - 2 * b, g = new T.ExtrudeGeometry(shapeOf(pts), { depth: d, bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelSegments: segs || 2, curveSegments: 4 });
      g.translate(0, 0, -d / 2); g.rotateY(-Math.PI / 2); return g;
    }

    /* ---------- vehicles (local +z = forward) ----------
       Car: one extruded side profile with wheel arches and rounded edges (body), side glass (DLO) cut from the
       same profile, raked windscreen and rear glass, B-pillar, bumpers, grille, lamps, mirrors, door seams,
       handles, skirts, tyres with rims and spokes. All parts merge into ≤5 draws; parked cars are instanced. */
    var PAINT = [0xF2F3F4, 0xC9CED4, 0x8E959C, 0x2D3338, 0xB3261E, 0x2B5C9E, 0xF2F3F4, 0x6E7A86];
    var CARP = {
      car: { L: 4.42, W: 1.8, wr: .33, wz: 1.36, ar: .46, yb: .3, bp: -.3,
        pts: [[2.14, .3], [2.23, .44], [2.22, .72], [1.92, .88], [1.02, 1.03], [.3, 1.42], [-.92, 1.39], [-1.58, 1.05], [-2.14, .99], [-2.24, .62]],
        dlo: [[-1.44, 1.07], [.94, 1.07], [.29, 1.36], [-.86, 1.34]], ws: [[1.02, 1.03], [.3, 1.42]], rw: [[-.92, 1.39], [-1.58, 1.05]] },
      suv: { L: 4.62, W: 1.86, wr: .37, wz: 1.42, ar: .5, yb: .38, bp: -.42,
        pts: [[2.25, .38], [2.32, .52], [2.32, .86], [2.08, 1.06], [1.34, 1.18], [.52, 1.72], [-2.08, 1.7], [-2.2, 1.2], [-2.32, .82]],
        dlo: [[-1.92, 1.22], [1.28, 1.22], [.5, 1.66], [-1.94, 1.64]], ws: [[1.34, 1.18], [.52, 1.72]], rw: [[-2.08, 1.68], [-2.2, 1.24]] }
    };
    function carGeos(kind, lite) {
      return geo('car' + kind + (lite ? 'L' : ''), function () {
        var P = CARP[kind], b = builder(), W = P.W, hw = W / 2, D = 0x16191C, TR = 0x23272B, CH = 0xC9CFD5, GL = 0x18222C;
        var out = [[-P.L / 2 + .06, P.yb]];
        for (var i = 0; i <= 8; i++) { var a = Math.PI - i / 8 * Math.PI; out.push([-P.wz + P.ar * Math.cos(a), P.yb + P.ar * Math.sin(a) * .9]); }
        for (var j = 0; j <= 8; j++) { var a2 = Math.PI - j / 8 * Math.PI; out.push([P.wz + P.ar * Math.cos(a2), P.yb + P.ar * Math.sin(a2) * .9]); }
        out = out.concat(P.pts);
        b.geo(profileX(out, W, .05, lite ? 1 : 2), 0xffffff, 0, 0, 0, 'p', 0, 0, 0, 1, 1, 1, true);
        var dg = new T.ExtrudeGeometry(shapeOf(P.dlo), { depth: W + .02, bevelEnabled: false }); dg.translate(0, 0, -(W + .02) / 2); dg.rotateY(-Math.PI / 2);
        b.geo(dg, GL, 0, 0, 0, 'g', 0, 0, 0, 1, 1, 1, true);
        [P.ws, P.rw].forEach(function (s) {
          var a = s[0], c = s[1], dz = c[0] - a[0], dy = c[1] - a[1], len = Math.hypot(dz, dy), nz = dy / len, ny = -dz / len;
          b.box(W * .8, len * .9, .02, GL, 0, (a[1] + c[1]) / 2 + ny * .064, (a[0] + c[0]) / 2 + nz * .064, 'g', Math.atan2(dz, dy));
        });
        var y0 = P.dlo[0][1], y1 = Math.min(P.dlo[2][1], P.dlo[3][1]);
        b.box(W + .05, y1 - y0, .1, 0xffffff, 0, (y0 + y1) / 2, P.bp, 'p');                                    // B-pillar over the side glass
        function edgeZ(y, front) {
          var best = front ? -9 : 9;
          for (var k = 0; k < out.length; k++) { var q = out[k], r = out[(k + 1) % out.length]; if ((q[1] - y) * (r[1] - y) <= 0 && q[1] !== r[1]) { var z = q[0] + (r[0] - q[0]) * (y - q[1]) / (r[1] - q[1]); if (front ? z > best : z < best) best = z; } }
          return best + (front ? .05 : -.05);
        }
        var yl = P.yb + (kind === 'suv' ? .5 : .42), yt = P.yb + (kind === 'suv' ? .62 : .52);
        b.box(W + .02, .22, .26, TR, 0, P.yb + .12, edgeZ(P.yb + .12, true) - .1, 'm'); b.box(W + .02, .22, .26, TR, 0, P.yb + .12, edgeZ(P.yb + .12, false) + .1, 'm'); // bumpers
        b.box(W * .5, .16, .04, D, 0, yl - .12, edgeZ(yl - .12, true) + .005, 'm');                            // grille
        [-1, 1].forEach(function (sx) {
          b.box(.42, .12, .06, 0xFFF4D8, sx * (hw - .33), yl, edgeZ(yl, true) - .005, 'e');                       // headlights
          b.box(.38, .14, .06, 0xC2272D, sx * (hw - .3), yt, edgeZ(yt, false) + .005, 'e');                        // tail lights
          b.box(.1, .09, .2, 0xffffff, sx * (hw + .09), y0 + .06, P.ws[0][0] - .2, 'p'); b.box(.1, .03, .08, TR, sx * (hw + .03), y0 + .04, P.ws[0][0] - .2, 'm'); // mirror + arm
          [P.wz, -P.wz].forEach(function (wz) {
            var x = sx * (hw - .14);
            b.cyl(P.wr, P.wr, .24, lite ? 12 : 18, D, x, P.wr, wz, 'm', 0, 0, Math.PI / 2);                     // tyre
            b.cyl(P.wr * .62, P.wr * .62, .27, lite ? 10 : 14, 0x6E757C, x, P.wr, wz, 's', 0, 0, Math.PI / 2);   // rim
            if (!lite) for (var sp = 0; sp < 5; sp++) b.box(.03, P.wr * 1.1, .055, CH, x + sx * .125, P.wr, wz, 's', sp * 1.2566);
          });
        });
        b.box(.52, .12, .03, 0xF4F4F0, 0, P.yb + .2, edgeZ(P.yb + .12, true) + .03, 'e'); b.box(.52, .12, .03, 0xF4F4F0, 0, P.yb + .2, edgeZ(P.yb + .12, false) - .03, 'e'); // blank plates
        if (!lite) {
          [-1, 1].forEach(function (sx) {
            var xs = sx * (hw + .004);
            b.box(.012, y0 - P.yb - .2, .02, D, xs, (y0 + P.yb + .12) / 2, P.ws[0][0] - .1, 'm');                 // door seams
            b.box(.012, y0 - P.yb - .2, .02, D, xs, (y0 + P.yb + .12) / 2, P.bp - .05, 'm');
            b.box(.012, y0 - P.yb - .2, .02, D, xs, (y0 + P.yb + .12) / 2, P.dlo[0][0] + .06, 'm');
            b.box(.03, .035, .16, CH, sx * (hw + .012), y0 - .12, P.bp + .45, 's'); b.box(.03, .035, .16, CH, sx * (hw + .012), y0 - .12, P.bp - .5, 's'); // handles
            b.box(.04, .1, P.wz * 2 - P.ar * 2 - .1, TR, sx * (hw + .01), P.yb + .07, 0, 'm');                    // side skirt
            b.box(.02, .025, P.dlo[1][0] - P.dlo[0][0], CH, sx * (hw + .008), y0 - .01, (P.dlo[0][0] + P.dlo[1][0]) / 2, 's'); // belt-line chrome
            if (kind === 'suv') b.box(.05, .05, 2.2, 0x3A4148, sx * hw * .7, 1.76, -.6, 's');                     // roof rails
            b.box(.14, .06, .05, 0xF0A020, sx * (hw - .12), yl - .08, edgeZ(yl - .08, true) - .005, 'e');      // indicators
          });
          b.cyl(.04, .04, .16, 8, CH, .5, P.yb + .02, edgeZ(P.yb + .12, false) - .02, 's', Math.PI / 2);         // exhaust
        }
        return b.build();
      });
    }
    function car(color, kind, lite) {
      kind = kind === 'suv' ? 'suv' : 'car'; lite = lite || MOB;
      var g = meshes(carGeos(kind, lite), false, M(color, { vertexColors: true, roughness: .26, metalness: .5 }));
      g.userData.len = CARP[kind].L; g.userData.wid = CARP[kind].W; return g;
    }
    /* parked cars as instances: list [x, y, z, rotY, colour, kind] (one draw per layer for the whole lot) */
    function carsInst(list, parent) {
      ['car', 'suv'].forEach(function (k) {
        var sub = list.filter(function (q) { return (q[5] === 'suv' ? 'suv' : 'car') === k; }); if (!sub.length) return;
        instMerged(carGeos(k, true), sub.map(function (q) { return [q[0], q[1], q[2], 1, 1, 1, q[3]]; }), parent, sub.map(function (q) { return q[4]; }));
      });
    }
    /* truck: raked cab-over tractor (extruded cab, split windscreen, roof fairing, grille with chrome bars, lamps,
       visor, mirrors on arms, steps, grab handles, fuel + air tanks, exhaust stack, fifth wheel, mudguards,
       single front + dual rear wheels with rims) and a trailer. cargo: a hex colour gives a ribbed box van,
       'chassis' gives a 20 ft skeletal container chassis (bolsters + twistlocks; deck top 1.5 m, slot centre z -2.42). */
    function truckGeos(cargo) {
      return geo('truck' + cargo, function () {
        var b = builder(), D = 0x22272C, TR = 0x16191C, CH = 0xC9CFD5, ST = 0x9AA4AE, cw = 2.44;
        b.geo(profileX([[3.55, 1.05], [5.7, 1.05], [5.78, 2.0], [5.7, 3.02], [5.5, 3.3], [3.55, 3.3]], cw, .06), 0xffffff, 0, 0, 0, 'p', 0, 0, 0, 1, 1, 1, true);
        b.geo(profileX([[3.65, 3.33], [5.25, 3.33], [4.95, 3.88], [3.65, 3.98]], 2.24, .04, 1), 0xffffff, 0, 0, 0, 'p', 0, 0, 0, 1, 1, 1, true);
        b.box(2.16, .92, .025, 0x18222C, 0, 2.52, 5.812, 'g', -.078); b.box(.07, .94, .03, D, 0, 2.52, 5.83, 'm', -.078);   // split windscreen
        b.box(2.3, .08, .34, D, 0, 3.12, 5.74, 'm', .3);                                                                     // sun visor
        b.box(1.6, .76, .05, D, 0, 1.55, 5.815, 'm');                                                                       // grille
        for (var gb = 0; gb < 4; gb++) b.box(1.5, .04, .03, CH, 0, 1.28 + gb * .18, 5.845, 's');
        b.box(2.5, .36, .32, 0x8E959C, 0, .9, 5.72, 's');                                                                    // bumper
        for (var rm = -1; rm <= 1; rm++) b.box(.18, .08, .06, 0xF0A020, rm * .7, 3.4, 5.4, 'e');                              // roof markers
        [-1, 1].forEach(function (s) {
          b.box(.46, .16, .06, 0xFFF4D8, s * .88, 1.22, 5.8, 'e'); b.box(.14, .1, .06, 0xF0A020, s * 1.12, 1.22, 5.79, 'e');    // headlamps, indicators
          b.box(.03, .78, 1.15, 0x18222C, s * (cw / 2 + .006), 2.62, 4.95, 'g');                                                // side window
          b.box(.012, 1.9, .03, D, s * (cw / 2 + .004), 2.1, 4.3, 'm');                                                         // door seam
          b.box(.03, .04, .22, CH, s * (cw / 2 + .015), 2.05, 4.55, 's');                                                       // door handle
          b.rod(new T.Vector3(s * 1.2, 2.95, 5.25), new T.Vector3(s * 1.46, 2.95, 5.42), .025, ST, 's');                     // mirror arm
          b.box(.08, .55, .18, D, s * 1.47, 2.72, 5.45, 'm');
          b.box(.5, .07, .38, D, s * 1.0, .62, 4.98, 'm'); b.box(.5, .07, .38, D, s * 1.0, .3, 4.98, 'm');                    // steps
          b.cyl(.022, .022, .8, 6, CH, s * (cw / 2 + .04), 1.95, 3.75, 's');                                                   // grab handle
          b.box(.62, .05, 2.1, D, s * 1.0, 1.15, 1.1, 'm');                                                                     // rear mudguard
          b.box(.5, .55, .04, D, s * 1.0, .52, .02, 'm');                                                                       // mudflap
        });
        b.box(.22, .3, 6.2, D, -.45, .9, 2.65, 'm'); b.box(.22, .3, 6.2, D, .45, .9, 2.65, 'm');                            // chassis rails
        b.cyl(.32, .32, 1.2, 16, CH, -1.0, .95, 2.9, 's', Math.PI / 2); b.box(.06, .7, .1, D, -1.0, .95, 2.5, 'm'); b.box(.06, .7, .1, D, -1.0, .95, 3.3, 'm');
        b.box(.6, .6, 1.0, D, 1.0, .95, 2.9, 'm'); b.cyl(.18, .18, .9, 12, ST, .95, .62, 3.9, 's', Math.PI / 2);          // battery box, air tank
        b.cyl(.075, .075, 1.8, 10, CH, 1.0, 3.55, 3.36, 's');                                                                 // exhaust stack
        b.box(.9, .2, .8, D, 0, 1.2, 1.4, 'm'); b.box(1.1, .1, 1.0, 0x3A4148, 0, 1.35, 1.4, 's');                           // fifth wheel
        function wheel(x, z, r, w, rim) {
          b.cyl(r, r, w, 18, TR, x, r, z, 'm', 0, 0, Math.PI / 2);
          if (rim) { b.cyl(r * .58, r * .58, w + .03, 14, 0xA9B3BD, x, r, z, 's', 0, 0, Math.PI / 2); b.cyl(r * .2, r * .2, w + .06, 8, D, x, r, z, 'm', 0, 0, Math.PI / 2); }
        }
        [-1, 1].forEach(function (s) {
          wheel(s * 1.07, 4.55, .52, .32, true);
          [1.75, .5].forEach(function (z) { wheel(s * 1.08, z, .52, .3, true); wheel(s * .74, z, .52, .3, false); });
          [-3.4, -4.5].forEach(function (z) { wheel(s * 1.08, z, .5, .3, true); wheel(s * .74, z, .5, .3, false); });
          b.box(.08, 1.0, .12, D, s * .95, .7, -.9, 'm'); b.box(.3, .05, .3, D, s * .95, .2, -.9, 'm');                       // landing legs + feet
          b.box(.05, .4, 2.4, ST, s * 1.2, .9, -1.95, 's');                                                                    // side under-run guard
          b.box(.5, .6, .04, D, s * 1.0, .55, -5.1, 'm');                                                                       // trailer mudflaps
          b.box(.36, .13, .05, 0xC2272D, s * 1.0, 1.08, -5.56, 'e'); b.box(.14, .1, .05, 0xF0A020, s * .72, 1.08, -5.56, 'e'); // tail lamps
        });
        b.box(2.2, .14, .14, D, 0, .62, -5.5, 'm'); b.box(.52, .12, .03, 0xF4F4F0, 0, .9, -5.55, 'e');                       // under-run bar, blank plate
        if (cargo === 'chassis') {
          b.box(.26, .36, 8.4, D, -.5, 1.2, -1.3, 'm'); b.box(.26, .36, 8.4, D, .5, 1.2, -1.3, 'm');                           // main rails
          b.box(2.3, .3, .5, D, 0, 1.3, 2.65, 'm');                                                                             // gooseneck
          for (var cm = 2.0; cm > -5.3; cm -= 1.0) b.box(2.0, .1, .12, D, 0, 1.33, cm, 'm');
          b.box(2.44, .2, .3, D, 0, 1.4, .46, 'm'); b.box(2.44, .2, .3, D, 0, 1.4, -5.3, 'm');                                // bolsters (deck top 1.5)
          b.box(.5, .14, 4.6, D, 0, .98, -1.8, 'm'); b.box(.32, .32, .9, D, 0, .62, -4.0, 'm');                                // centre spine, axle hangers
          [[-1.1, .46], [1.1, .46], [-1.1, -5.3], [1.1, -5.3]].forEach(function (q) { b.box(.15, .1, .15, ST, q[0], 1.53, q[1], 's'); }); // twistlocks
          b.box(.9, .06, .3, 0xF0A020, 0, 1.15, -5.52, 'e');
        } else {
          var cc = cargo == null ? 0xE4E8EC : cargo, rib = new T.Color(cc).multiplyScalar(.78).getHex();
          b.box(.26, .3, 8.4, D, -.5, 1.25, -1.3, 'm'); b.box(.26, .3, 8.4, D, .5, 1.25, -1.3, 'm');
          b.box(2.46, 2.6, 8.6, cc, 0, 2.75, -1.25, 'm');                                                                     // box van
          for (var ri = 0; ri < 11; ri++) { b.box(.05, 2.36, .07, rib, 1.245, 2.75, 2.6 - ri * .77, 'm'); b.box(.05, 2.36, .07, rib, -1.245, 2.75, 2.6 - ri * .77, 'm'); }
          b.box(2.5, .1, 8.64, rib, 0, 4.07, -1.25, 'm'); b.box(2.5, .12, 8.64, rib, 0, 1.47, -1.25, 'm');                    // top + bottom rails
          b.box(2.4, 2.4, .04, rib, 0, 2.75, -5.57, 'm'); b.box(.04, 2.4, .05, D, 0, 2.75, -5.6, 'm');                         // rear doors + seam
          [-.9, -.3, .3, .9].forEach(function (lx) { b.box(.035, 2.3, .035, ST, lx, 2.75, -5.61, 's'); });                     // locking bars
          for (var mk = 0; mk < 4; mk++) { b.box(.04, .1, .16, 0xF0A020, 1.25, 1.75, -4.6 + mk * 2.6, 'e'); b.box(.04, .1, .16, 0xF0A020, -1.25, 1.75, -4.6 + mk * 2.6, 'e'); }
        }
        return b.build();
      });
    }
    function truck(color, cargo) {
      var g = meshes(truckGeos(cargo), false, M(color, { vertexColors: true, roughness: .36, metalness: .38 }));
      g.userData.len = 11.2; g.userData.wid = 2.5; g.userData.deckY = 1.5; g.userData.deckZ = -2.42; return g;
    }

    /* ---------- people: merged body + jointed limbs (hip, knee, shoulder, elbow); faces local +z ----------
       opt: pants, shoe, skin, hair ('short'|'long'|'bun'), skirt, shorts, sleeve ('short'|'long'),
       bag ('back'|'side'|true), bagc, vest (hi-vis colour or true), helmet (colour), boots, gloves. Height ≈ 1.72 m. */
    var SKIN = [0x8A5A3C, 0xA06E4C, 0x6E4630, 0xC28E6A, 0x5A3A26], HAIR = [0x1A1410, 0x2B2017, 0x3A2A1E, 0x111111, 0x5A3A22];
    function personGeos(c, o) {
      var key = 'per' + [c, o.skin, o.hair, o.hc, o.pants, o.shoe, o.skirt, o.shorts, o.sleeve, o.bag, o.bagc, o.vest, o.helmet, o.boots, o.gloves].join('_');
      return geo(key, function () {
        var HIP = .91, bd = builder(), legC = o.skirt ? o.skin : o.pants;
        bd.box(.34, .2, .21, o.pants, 0, HIP + .01, 0);                                                                  // hips
        if (o.skirt) bd.cyl(.18, .27, .44, 12, o.pants, 0, HIP - .14, 0);
        bd.geo(new T.CylinderGeometry(.2, .165, .46, 12), c, 0, HIP + .29, 0, 'm', 0, 0, 0, 1, 1, .62, true);              // torso (elliptic)
        bd.sph(.085, c, -.19, HIP + .47, 0); bd.sph(.085, c, .19, HIP + .47, 0);                                         // shoulders
        bd.cyl(.05, .055, .12, 8, o.skin, 0, HIP + .56, 0);                                                              // neck
        bd.sph(.115, o.skin, 0, HIP + .68, 0, 'm', .92, 1.06, .98, 12);                                                 // head
        bd.box(.03, .04, .03, o.skin, 0, HIP + .665, .112); bd.box(.024, .014, .01, 0x1A1410, -.042, HIP + .695, .108); bd.box(.024, .014, .01, 0x1A1410, .042, HIP + .695, .108);
        bd.box(.012, .045, .03, o.skin, -.108, HIP + .68, 0); bd.box(.012, .045, .03, o.skin, .108, HIP + .68, 0);       // ears
        if (o.helmet) {
          bd.geo(new T.SphereGeometry(.135, 12, 6, 0, Math.PI * 2, 0, Math.PI * .5), o.helmet, 0, HIP + .715, -.005, 'm', 0, 0, 0, 1, .95, 1.05, true);
          bd.cyl(.165, .165, .016, 14, o.helmet, 0, HIP + .72, .015, 'm'); bd.box(.03, .05, .2, o.helmet, 0, HIP + .84, 0);
        } else {
          bd.geo(new T.SphereGeometry(.124, 12, 6, 0, Math.PI * 2, 0, Math.PI * .46), o.hc, 0, HIP + .69, -.012, 'm', -.32, 0, 0, 1, 1, 1, true);
          if (o.hair === 'long') bd.box(.22, .28, .07, o.hc, 0, HIP + .58, -.085);
          if (o.hair === 'bun') bd.sph(.06, o.hc, 0, HIP + .79, -.08);
        }
        if (o.vest) {
          var vc = o.vest === true ? 0xE5F23A : o.vest;
          bd.geo(new T.CylinderGeometry(.212, .18, .4, 12), vc, 0, HIP + .3, 0, 'm', 0, 0, 0, 1, 1, .66, true);
          bd.geo(new T.CylinderGeometry(.214, .2, .045, 12), 0xD8DCE0, 0, HIP + .2, 0, 'e', 0, 0, 0, 1, 1, .67, true);
          bd.geo(new T.CylinderGeometry(.21, .205, .045, 12), 0xD8DCE0, 0, HIP + .36, 0, 'e', 0, 0, 0, 1, 1, .67, true);
          bd.box(.05, .4, .02, 0xD8DCE0, -.1, HIP + .32, .135, 'e'); bd.box(.05, .4, .02, 0xD8DCE0, .1, HIP + .32, .135, 'e');
        }
        if (o.bag === 'back') {
          bd.box(.3, .38, .15, o.bagc, 0, HIP + .3, -.2); bd.box(.22, .14, .05, o.bagc, 0, HIP + .18, -.29); bd.box(.1, .03, .05, 0x2A2F35, 0, HIP + .5, -.2);
          bd.box(.05, .36, .02, 0x2A2F35, -.1, HIP + .32, .132); bd.box(.05, .36, .02, 0x2A2F35, .1, HIP + .32, .132);
          bd.box(.05, .04, .2, 0x2A2F35, -.1, HIP + .48, -.03); bd.box(.05, .04, .2, 0x2A2F35, .1, HIP + .48, -.03);
        } else if (o.bag === 'side') {
          bd.box(.035, .62, .02, 0x2A2F35, 0, HIP + .3, .132, 'm', 0, 0, .72); bd.box(.035, .62, .02, 0x2A2F35, 0, HIP + .3, -.132, 'm', 0, 0, .72);
          bd.box(.09, .26, .32, o.bagc, .27, HIP + .02, 0);
        }
        var B1 = bd.build();
        var th = builder(), sh = builder(), up = builder(), fo = builder();
        if (o.shorts && !o.skirt) { th.box(.15, .22, .17, o.pants, 0, -.1, 0); th.box(.12, .23, .13, o.skin, 0, -.31, 0); }
        else th.box(o.skirt ? .11 : .14, .43, o.skirt ? .12 : .16, legC, 0, -.215, 0);
        sh.box(o.skirt || o.shorts ? .1 : .12, .4, o.skirt || o.shorts ? .11 : .14, o.skirt || o.shorts ? o.skin : o.pants, 0, -.2, 0);
        if (o.boots) sh.box(.14, .17, .27, o.shoe, 0, -.405, .045); else sh.box(.125, .08, .26, o.shoe, 0, -.44, .05);
        up.box(.1, .3, .11, c, 0, -.15, 0);
        fo.box(.09, .25, .1, o.sleeve === 'short' ? o.skin : c, 0, -.125, 0);
        fo.box(.08, .1, .055, o.gloves ? o.gloves : o.skin, 0, -.3, .005);
        return { body: B1, thigh: th.build(), shin: sh.build(), up: up.build(), fore: fo.build() };
      });
    }
    function person(color, opt) {
      opt = opt || {};
      var c = color == null ? 0x2B5C9E : color, n = ((c >> 3) + (c >> 13) * 7 + (opt.seed || 0) * 13) >>> 0;
      var o = {
        skin: opt.skin || SKIN[n % SKIN.length], hc: HAIR[(n >> 2) % HAIR.length], hair: opt.hair || ['short', 'short', 'long', 'bun'][(n >> 1) % 4],
        pants: opt.pants || 0x2A2F35, shoe: opt.shoe || (opt.boots ? 0x3A2A1E : 0x1A1D20), skirt: !!opt.skirt, shorts: !!opt.shorts,
        sleeve: opt.sleeve || (opt.vest || opt.helmet ? 'long' : (n % 3 === 0 ? 'short' : 'long')),
        bag: opt.bag === true ? 'back' : (opt.bag || ''), bagc: opt.bagc || [0x3A4148, 0x2B5C9E, 0x7A2E2A, 0x1F5A3A, 0x6E7A86][n % 5],
        vest: opt.vest || '', helmet: opt.helmet || '', boots: !!opt.boots, gloves: opt.gloves || ''
      };
      var G = personGeos(c, o), g = new T.Group(), legs = [], knees = [], arms = [], elbows = [];
      meshes(G.body, g);
      [-.095, .095].forEach(function (x) {
        var th = new T.Group(); th.position.set(x, .91, 0); g.add(th); meshes(G.thigh, th);
        var kn = new T.Group(); kn.position.y = -.43; th.add(kn); meshes(G.shin, kn);
        legs.push(th); knees.push(kn);
      });
      [-.235, .235].forEach(function (x) {
        var sh = new T.Group(); sh.position.set(x, 1.38, 0); g.add(sh); meshes(G.up, sh);
        var el = new T.Group(); el.position.y = -.3; el.rotation.x = -.12; sh.add(el); meshes(G.fore, el);
        arms.push(sh); elbows.push(el);
      });
      g.userData.legs = legs; g.userData.knees = knees; g.userData.arms = arms; g.userData.elbows = elbows; return g;
    }
    /* walk cycle: hips swing, the trailing knee bends on its forward swing, arms counter-swing with a soft elbow */
    function walk(p, phase, amt) {
      var a = amt == null ? .5 : amt, s = Math.sin(phase) * a, cph = Math.cos(phase), ud = p.userData, L = ud.legs, K2 = ud.knees, A = ud.arms, E = ud.elbows;
      if (!L) return;
      L[0].rotation.x = s; L[1].rotation.x = -s;
      K2[0].rotation.x = Math.max(0, -cph) * a * 1.5; K2[1].rotation.x = Math.max(0, cph) * a * 1.5;
      A[0].rotation.x = -s * .8; A[1].rotation.x = s * .8;
      E[0].rotation.x = -.12 - Math.max(0, s) * .5; E[1].rotation.x = -.12 - Math.max(0, -s) * .5;
    }
    /* seated operator (hips at chair height, thighs forward, shins down, hands on the keyboard); faces local +z */
    function seated(color, opt) {
      var g = new T.Group(), p = person(color, opt); p.position.y = -.37; g.add(p);
      p.userData.legs.forEach(function (l) { l.rotation.x = -1.5; }); p.userData.knees.forEach(function (k) { k.rotation.x = 1.42; });
      p.userData.arms.forEach(function (a) { a.rotation.x = -.55; }); p.userData.elbows.forEach(function (e) { e.rotation.x = -.95; });
      return g;
    }
    /* barrier-gated vehicle on a 1-D path (s grows in the travel direction). The vehicle holds at stopS until the
       arm is fully up; the arm lifts only once the vehicle waits there and `open` is true, and drops after the
       vehicle is past clearS. o.hold: an extra stop point (e.g. before a crossing) while it is set.
       Scrubbing backwards snaps. st = {s, a} is kept by the caller; returns the arm angle 0..full. */
    function gateStep(st, want, o, dt) {
      var FULL = o.full || 1.35;
      if (st.s == null || want < st.s - 1 || want - st.s > 30 || ctx.reduce) {
        st.s = want;
        if (o.hold != null && st.s > o.hold && st.s < o.hold + 6) st.s = o.hold;
        if (st.s > o.stopS && st.s < o.clearS && !o.open) st.s = o.stopS;
        st.a = (st.s >= o.stopS - .5 && st.s < o.clearS && o.open) ? FULL : 0;
        return st.a;
      }
      var lim = want;
      if (st.s <= o.stopS + .01 && st.a < FULL * .98) lim = Math.min(lim, o.stopS);
      if (o.hold != null && st.s <= o.hold + .01) lim = Math.min(lim, o.hold);
      var v = Math.min(o.v || 7, Math.max(0, (lim - st.s) * 2.2));
      st.s = Math.min(lim, st.s + v * dt);
      var up = o.open && st.s >= o.stopS - 1 && st.s < o.clearS, rate = FULL * dt / .8;
      st.a += Math.max(-rate, Math.min(rate, (up ? FULL : 0) - st.a));
      return st.a;
    }
    /* single-file followers on a looped 1-D lane (vehicles or pedestrians): each keeps `gap` behind the one ahead
       and stops at `stop(it)` (a position limit or Infinity). items: [{s, len, v}]; loop: lane length. */
    function follow(items, loop, dt, gap, stop) {
      if (!items.length) return;
      items.sort(function (a, b) { return b.s - a.s; });
      for (var k = 0; k < items.length; k++) {
        var it = items[k], lead = items[k ? k - 1 : items.length - 1], ls = k ? lead.s : lead.s + loop;
        var lim = items.length > 1 ? ls - (lead.len + it.len) / 2 - gap : Infinity;
        var sl = stop ? stop(it) : Infinity; if (sl < lim) lim = sl;
        var v = Math.min(it.v, Math.max(0, (lim - it.s) * 1.6));
        it.moving = v > .05; it.s += v * dt; if (it.s >= loop) it.s -= loop;
      }
    }
    /* office chair: seat, raked back, lumbar, armrests, gas lift, five-star base with casters (merged, cached) */
    function chair(parent) {
      var G = geo('chairG', function () {
        var b = builder(), dk = 0x22272C, st = 0x9AA4AE;
        b.box(.54, .09, .52, dk, 0, .5, 0); b.box(.5, .56, .07, dk, 0, .86, -.27, 'm', -.1); b.box(.4, .1, .08, dk, 0, .62, -.25, 'm');
        [-1, 1].forEach(function (s) { b.box(.06, .04, .3, dk, s * .28, .7, -.02); b.box(.04, .16, .04, st, s * .28, .6, -.08, 's'); });
        b.cyl(.035, .035, .4, 8, st, 0, .27, 0, 's'); b.cyl(.06, .06, .1, 8, dk, 0, .44, 0);
        for (var k = 0; k < 5; k++) { var a = k * 1.2566; b.box(.3, .035, .045, st, Math.cos(a) * .15, .07, Math.sin(a) * .15, 's', 0, -a); b.sph(.03, dk, Math.cos(a) * .29, .03, Math.sin(a) * .29); }
        return b.build();
      });
      var g = meshes(G, false); (parent || scene).add(g); return g;
    }
    /* CONTROL ROOM INTERIOR (no columns in the room): curved video wall of bezelled panels in 3 angled
       segments, a curved console of desk segments with 2 monitors + keyboard each, chairs with seated
       operators, ceiling light panels, raised-floor tiles, side walls and a glazed back partition.
       The room opens toward local +z (the viewer). wall: a videoWall() object. Returns the group. */
    function controlRoom(opt) {
      var g = new T.Group(), W2 = opt.w || 12, D2 = opt.d || 9, H2 = opt.h || 4.2, seats = opt.seats || 4;
      var floorT = canvasTex(256, 256, function (x, w, h) {
        x.fillStyle = '#C9CFD5'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(80,90,100,.35)'; x.lineWidth = 2;
        for (var i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, h); x.stroke(); x.beginPath(); x.moveTo(0, i * 64); x.lineTo(w, i * 64); x.stroke(); }
      }, [W2 / 2.4, D2 / 2.4]);
      var fl = rcv(new T.Mesh(new T.PlaneGeometry(W2, D2), M(0xffffff, { map: floorT, roughness: .7 }))); fl.rotation.x = -Math.PI / 2; fl.position.set(0, .02, 0); g.add(fl);
      var wallM2 = M(0xEEF1F4, { roughness: .7 }), dark = M(0x10161C, { roughness: .5, metalness: .3 });
      box(W2, H2, .25, wallM2, 0, H2 / 2, -D2 / 2, g);                                   // back wall
      box(.25, H2, D2, wallM2, -W2 / 2, H2 / 2, 0, g); box(.25, H2, D2, wallM2, W2 / 2, H2 / 2, 0, g); // side walls
      box(W2, .2, D2, M(0xF4F6F8, { roughness: .8 }), 0, H2, 0, g);                       // ceiling
      var lp = []; for (var lx = -W2 / 2 + 1.5; lx < W2 / 2; lx += 2.4) for (var lz = -D2 / 2 + 1.6; lz < D2 / 2; lz += 2.2) lp.push([lx, H2 - .12, lz, 1.4, .04, .6]);
      inst(null, B(0xFFFBF0), lp, g);
      // curved video wall: 3 segments, each shows a third of the wall texture; bezel grid on top
      var VW = Math.min(W2 * .82, opt.wallW || 9), VH = opt.wallH || VW * .6, seg = VW / 3, ang = .26, yC = 1.0 + VH / 2;
      for (var s = 0; s < 3; s++) {
        var pg = new T.PlaneGeometry(seg, VH), uv = pg.attributes.uv;
        for (var k = 0; k < uv.count; k++) uv.setX(k, (s + uv.getX(k)) / 3);
        var sg = new T.Group(), off = (s - 1);
        sg.position.set(off * seg / 2 * (1 + Math.cos(ang)), yC, -D2 / 2 + .45 + Math.abs(off) * seg / 2 * Math.sin(ang));
        sg.rotation.y = -off * ang;
        box(seg + .18, VH + .18, .14, dark, 0, 0, -.08, sg);
        var scr = new T.Mesh(pg, B(0xffffff, { map: opt.wall.tex })); scr.position.z = .001; sg.add(scr);
        var bez = [];                                                                    // panel bezels: each segment is one column of 3 panels
        for (var by = 1; by < 3; by++) bez.push([0, -VH / 2 + by * VH / 3, .01, seg, .035, .02]);
        bez.push([-seg / 2, 0, .01, .03, VH, .02]); bez.push([seg / 2, 0, .01, .03, VH, .02]);
        inst(null, dark, bez, sg);
        g.add(sg);
      }
      box(VW + 1, .5, .6, dark, 0, .55, -D2 / 2 + .5, g);                                  // wall plinth
      // curved console (desk segments on an arc facing the wall), monitors, keyboards, chairs, operators
      var R = D2 * .55, cz = -D2 / 2 + (opt.deskZ || 3) + R, mon = M(0x1A2129, { roughness: .4, metalness: .4 }), deskM = M(0xE2E6EA, { roughness: .5 }), deskTop = M(0xB9C3CC, { roughness: .4, metalness: .2 });
      var monTex = canvasTex(256, 160, function (x, w, h) {
        x.fillStyle = '#0E2236'; x.fillRect(0, 0, w, h); x.fillStyle = '#2673B5'; x.fillRect(0, 0, w, 16);
        for (var i = 0; i < 6; i++) { x.fillStyle = i % 3 ? '#1D3A57' : '#3B78B5'; x.fillRect(10, 26 + i * 21, w - 20 - (i * 23 % 80), 12); }
        x.fillStyle = '#5BE38A'; x.fillRect(w - 30, 26, 18, 12);
      });
      var monM = B(0xffffff, { map: monTex });
      function desk(px, pz, ry, si) {
        var dg = new T.Group(); dg.position.set(px, 0, pz); dg.rotation.y = ry;
        box(1.78, .05, .86, deskTop, 0, .76, 0, dg);                                     // desk top, side panels, modesty panel (knee space open)
        box(.05, .74, .8, deskM, -.85, .37, 0, dg); box(.05, .74, .8, deskM, .85, .37, 0, dg); box(1.7, .42, .04, deskM, 0, .5, -.38, dg);
        [-.42, .42].forEach(function (mx) {
          box(.04, .3, .04, mon, mx, .93, -.22, dg); box(.68, .42, .04, mon, mx, 1.28, -.24, dg);
          var mm = new T.Mesh(geo('monp', function () { return new T.PlaneGeometry(.62, .36); }), monM); mm.position.set(mx, 1.28, -.215); dg.add(mm);
        });
        box(.62, .03, .2, mon, 0, .8, .08, dg); box(.1, .03, .14, mon, .48, .8, .1, dg);  // keyboard + mouse
        var ch = chair(dg); ch.position.set(0, 0, .75); ch.rotation.y = Math.PI;
        if (si % (opt.every || 1) === 0) { var op = seated([0x1B3A5C, 0x2B5C9E, 0xE6E9EC, 0x6E7A86][si % 4]); op.position.set(0, 0, .7); op.rotation.y = Math.PI; dg.add(op); }
        g.add(dg);
      }
      for (var si = 0; si < seats; si++) { var a = (si - (seats - 1) / 2) * (opt.spread || .2); desk(Math.sin(a) * R, cz - Math.cos(a) * R, -a, si); }
      // optional second, straight row (shift supervisors) a little further back
      for (var s2 = 0; s2 < (opt.row2 || 0); s2++) desk((s2 - (opt.row2 - 1) / 2) * 2.1, cz - R + 2.9, 0, s2 + 1);
      // supervisor standing behind the console
      if (opt.supervisor !== false) { var sv = person(0x0A1A2B); sv.position.set(W2 * .22, 0, cz - R + (opt.row2 ? 4.4 : 2.2)); sv.rotation.y = Math.PI + .3; g.add(sv); }
      // frameless glazing across the open front: head and sill rails only, no mullions or columns
      var glz = new T.Mesh(new T.PlaneGeometry(W2, H2), new T.MeshStandardMaterial({ color: 0xBFD6EA, roughness: .05, metalness: .3, transparent: true, opacity: .08, side: T.DoubleSide, depthWrite: false }));
      glz.position.set(0, H2 / 2, D2 / 2); g.add(glz);
      var rail = M(0xCFD5DA, { metalness: .5, roughness: .4 });
      box(W2, .14, .14, rail, 0, H2 - .07, D2 / 2, g); box(W2, .1, .14, rail, 0, .05, D2 / 2, g);
      g.userData.wallZ = -D2 / 2 + .45; g.userData.wallY = yC; g.userData.wallW = VW; g.userData.wallH = VH;
      return g;
    }
    /* trees: deciduous (round / oval), conifer (cone), birch (column), flowering (bloom), palm. Built once per
       species + variant from jittered low-poly clusters with real branches, and drawn as instances (queued here,
       flushed on the first render). Positions are world coordinates. */
    var treeQ = [], lightQ = [];
    function treeGeos(key) {
      return geo('tree' + key, function () {
        var b = builder(), kind = key.slice(0, -1), v = +key.slice(-1), bark = 0x6B5544, sd = v * 3.7 + 1, m = v ? -1 : 1;
        function blob(r, col, x, y, z, sx, sy, sz) { b.geo(jitter(new T.IcosahedronGeometry(r, 1), .22, sd + x * 3 + y), col, x, y, z, 'm', 0, 0, 0, sx || 1, sy || 1, sz || 1, true); }
        function branch(x0, y0, x1, y1, z1, r) { b.rod(new T.Vector3(x0, y0, 0), new T.Vector3(x1, y1, z1), r, bark); }
        if (kind === 'cone') {
          b.cyl(.09, .15, 1.8, 7, bark, 0, .9, 0);
          [[1.7, 2.0, 1.6], [1.35, 2.9, 1.5], [1.0, 3.75, 1.35], [.6, 4.5, 1.2]].forEach(function (q, k) { b.geo(jitter(new T.ConeGeometry(q[0], q[2] + .6, 9, 2), .12, sd + k), k % 2 ? 0x3F6E4E : 0x4A7A55, 0, q[1], 0, 'm', 0, k * .4, 0, 1, 1, 1, true); });
        } else if (kind === 'column') {
          b.cyl(.08, .12, 4.6, 7, 0xE9E4DA, 0, 2.3, 0);
          for (var bm = 0; bm < 5; bm++) b.box(.1, .05, .06, 0x3A3530, 0, .8 + bm * .8, .1 - bm % 2 * .2, 'm', 0, bm);
          blob(.95, 0x8FB36E, 0, 3.7, 0, 1, 1.5, 1); blob(.7, 0x9CC07A, .2 * m, 5.0, .1, 1, 1.4, 1); blob(.6, 0x7FA460, -.25 * m, 4.3, -.3, 1, 1.3, 1);
        } else if (kind === 'palm') {
          for (var ps = 0; ps < 6; ps++) b.cyl(.15 - ps * .01, .17 - ps * .01, 1.02, 8, ps % 2 ? 0x7A6A55 : 0x8A7860, Math.sin(ps * .35) * .12 * m, ps + .5, 0);
          for (var fr = 0; fr < 8; fr++) {
            var fg = new T.BoxGeometry(2.6, .04, .5, 8, 1, 1), fp = fg.attributes.position;
            for (var fi = 0; fi < fp.count; fi++) { var fx = fp.getX(fi) + 1.3; fp.setY(fi, fp.getY(fi) - .18 * fx * fx + .4 * fx); fp.setZ(fi, fp.getZ(fi) * (1 - fx / 3.2)); }
            fg.translate(1.3, 0, 0); fg.computeVertexNormals();
            b.geo(fg, fr % 2 ? 0x5E8C4A : 0x6E9E58, 0, 6.0, 0, 'm', 0, fr * .785 + v * .3, .12, 1, 1, 1, true);
          }
          [0, 2.1, 4.2].forEach(function (a) { b.sph(.12, 0x5A4630, Math.cos(a) * .2, 5.85, Math.sin(a) * .2); });
        } else {
          var tall = kind === 'oval', H = tall ? 2.9 : 2.3, col = kind === 'bloom' ? [0xE7A3BC, 0xF0C1D2, 0xD98BA8] : [0x5E8C5A, 0x6E9A5E, 0x4E7D57];
          b.cyl(.12, .2, H, 8, bark, 0, H / 2, 0);
          branch(0, H * .8, .7 * m, H + .6, .2, .07); branch(0, H * .75, -.6 * m, H + .5, -.3, .065); branch(0, H * .9, .1, H + .9, .6, .06);
          var cl = tall ? [[0, H + 1.1, 0, 1.25], [.5 * m, H + 2.0, .2, 1.0], [-.45 * m, H + 1.7, -.4, .95], [0, H + 2.8, 0, .8], [.2, H + .5, .6, .8]]
            : [[0, H + 1.0, 0, 1.45], [.85 * m, H + 1.3, .3, 1.05], [-.8 * m, H + 1.2, -.4, 1.1], [.2, H + 1.9, -.5, .95], [-.3, H + .6, .75, .9], [.4 * m, H + .55, -.8, .8]];
          cl.forEach(function (q, k) { blob(q[3], col[k % 3], q[0], q[1], q[2], 1, kind === 'bloom' ? .85 : .9, 1); });
        }
        return b.build();
      });
    }
    function tree(x, z, s, parent, kind) {
      var h = Math.abs(Math.round(x * 3.1 + z * 7.3));
      kind = kind || ['round', 'oval', 'round', 'round', 'oval'][h % 5];
      treeQ.push([x, z, s || 1, (x * 13.7 + z * 7.1) % 6.28, kind + (h % 2)]);
    }
    /* road light: base plate + collar, tapered pole, swept bracket arm, flat LED luminaire with lens (instanced) */
    function streetLight(x, z, rotY) { lightQ.push([x, z, rotY || 0]); }
    function flushQueues() {
      if (treeQ.length) {
        var by = {}; treeQ.forEach(function (q) { (by[q[4]] = by[q[4]] || []).push([q[0], 0, q[1], q[2], q[2], q[2], q[3]]); }); treeQ = [];
        Object.keys(by).forEach(function (k) { instMerged(treeGeos(k), by[k]); });
      }
      if (lightQ.length) {
        var G = geo('streetLightG', function () {
          var b = builder(), st = 0x9AA4AE, dk = 0x2A2F35;
          b.cyl(.36, .4, .08, 12, 0x8E959C, 0, .04, 0, 's'); b.cyl(.16, .2, .9, 10, st, 0, .5, 0, 's');
          b.cyl(.08, .14, 7.9, 10, st, 0, 4.0, 0, 's'); b.cyl(.1, .1, .2, 10, dk, 0, 2.4, 0, 'm');
          b.rod(new T.Vector3(0, 7.7, 0), new T.Vector3(0, 8.05, .9), .06, st, 's'); b.rod(new T.Vector3(0, 8.05, .9), new T.Vector3(0, 8.0, 1.75), .055, st, 's');
          b.rod(new T.Vector3(0, 7.1, 0), new T.Vector3(0, 7.95, 1.1), .03, st, 's');
          b.box(.46, .12, .95, dk, 0, 7.96, 2.05, 'm', -.05); b.box(.5, .05, 1.0, 0x5A6470, 0, 8.04, 2.05, 's', -.05);
          b.box(.38, .03, .78, 0xFFF4D8, 0, 7.89, 2.05, 'e', -.05);
          return b.build();
        });
        instMerged(G, lightQ.map(function (q) { return [q[0], 0, q[1], 1, 1, 1, q[2]]; })); lightQ = [];
      }
    }
    /* instanced boxes/meshes: list of [x,y,z, sx,sy,sz, rotY, rotX, rotZ]; one draw call for many small parts.
       Instances spread over the whole site, so frustum culling (which only sees the base geometry) is off. */
    var unitBox = null;
    function inst(geom, mat, list, parent) {
      geom = geom || (unitBox || (unitBox = new T.BoxGeometry(1, 1, 1)));
      var im = new T.InstancedMesh(geom, mat, Math.max(1, list.length)), o = new T.Object3D();
      list.forEach(function (q, k) {
        o.position.set(q[0], q[1], q[2]); o.scale.set(q[3] || 1, q[4] || 1, q[5] || 1);
        o.rotation.set(q[7] || 0, q[6] || 0, q[8] || 0); o.updateMatrix(); im.setMatrixAt(k, o.matrix);
      });
      im.count = list.length; im.instanceMatrix.needsUpdate = true; im.frustumCulled = false; cs(im); (parent || scene).add(im); return im;
    }
    /* rotation that turns a +z-facing board at (bx,bz) toward a viewer at (cx,cz) */
    function facing(bx, bz, cx, cz) { return Math.atan2(cx - bx, cz - bz); }
    /* a thin cylinder between two points (cables, mooring lines) */
    function rod(a, b, r, mat, parent) {
      var d = new T.Vector3().subVectors(b, a), len = d.length();
      var m = new T.Mesh(geo('rod' + r, function () { return new T.CylinderGeometry(1, 1, 1, 5); }), mat);
      m.scale.set(r, len, r); m.position.copy(a).addScaledVector(d, .5);
      m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()); (parent || scene).add(m); return m;
    }
    /* window façade with a matching emissive map so lit offices glow softly */
    function windowPair(cols, rows, glassy, seed) {
      var lit = [], s = seed || 1;
      function rnd() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
      for (var i = 0; i < cols * rows; i++) lit.push(rnd() < .42);
      var map = canvasTex(512, 512, function (x, w, h) {
        x.fillStyle = glassy ? '#7FA6C6' : '#EEF1F4'; x.fillRect(0, 0, w, h);
        var cw = w / cols, rh = h / rows;
        for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
          var on = lit[r * cols + c];
          x.fillStyle = glassy ? (on ? '#D9E6F0' : 'rgba(40,70,100,.38)') : (on ? '#CFE0EE' : '#5E7A94');
          x.fillRect(c * cw + cw * .08, r * rh + rh * .14, cw * .84, rh * .7);
          if (on) { x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(c * cw + cw * .14, r * rh + rh * .2, cw * .3, rh * .08); }
        }
        x.strokeStyle = glassy ? 'rgba(235,242,248,.9)' : '#FFFFFF'; x.lineWidth = glassy ? 4 : 6;
        for (var r2 = 0; r2 <= rows; r2++) { x.beginPath(); x.moveTo(0, r2 * rh); x.lineTo(w, r2 * rh); x.stroke(); }
      });
      var em = canvasTex(256, 256, function (x, w, h) {
        x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
        var cw = w / cols, rh = h / rows;
        for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) if (lit[r * cols + c]) {
          x.fillStyle = 'rgb(255,' + (226 + (r * 7 + c * 3) % 20) + ',178)'; x.fillRect(c * cw + cw * .1, r * rh + rh * .16, cw * .8, rh * .66);
        }
      });
      return { map: map, emissive: em };
    }
    /* textures */
    function asphaltTex(rep) {
      return canvasTex(512, 512, function (x, w, h) {
        x.fillStyle = '#7C838A'; x.fillRect(0, 0, w, h);
        for (var i = 0; i < 9000; i++) { var v = 100 + Math.random() * 60 | 0; x.fillStyle = 'rgba(' + v + ',' + v + ',' + (v + 4) + ',' + (.25 + Math.random() * .35) + ')'; x.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
      }, rep);
    }
    function pavingTex(rep, base) {
      return canvasTex(512, 512, function (x, w, h) {
        x.fillStyle = base || '#D9DEE2'; x.fillRect(0, 0, w, h);
        x.strokeStyle = 'rgba(120,130,140,.25)'; x.lineWidth = 2;
        for (var i = 0; i <= 8; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, h); x.stroke(); x.beginPath(); x.moveTo(0, i * 64); x.lineTo(w, i * 64); x.stroke(); }
        for (var k = 0; k < 4000; k++) { x.fillStyle = 'rgba(90,100,110,' + Math.random() * .12 + ')'; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
      }, rep);
    }
    function grassTex(rep) {
      return canvasTex(512, 512, function (x, w, h) {
        x.fillStyle = '#B9CFB0'; x.fillRect(0, 0, w, h);
        for (var i = 0; i < 12000; i++) { var g = 150 + Math.random() * 60 | 0; x.fillStyle = 'rgba(' + (g - 40) + ',' + g + ',' + (g - 50) + ',.35)'; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
      }, rep);
    }
    function windowTex(cols, rows, glassy) {
      return canvasTex(512, 512, function (x, w, h) {
        x.fillStyle = glassy ? '#7FA6C6' : '#EEF1F4'; x.fillRect(0, 0, w, h);
        var cw = w / cols, rh = h / rows;
        for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
          var lit = Math.random() < .35;
          x.fillStyle = glassy ? (lit ? '#C9DDEE' : 'rgba(40,70,100,' + (.25 + Math.random() * .2) + ')') : (lit ? '#BBD3E8' : '#5E7A94');
          x.fillRect(c * cw + cw * .08, r * rh + rh * .14, cw * .84, rh * .7);
        }
        x.strokeStyle = glassy ? 'rgba(235,242,248,.9)' : '#FFFFFF'; x.lineWidth = glassy ? 3 : 6;
        for (var r2 = 0; r2 <= rows; r2++) { x.beginPath(); x.moveTo(0, r2 * rh); x.lineTo(w, r2 * rh); x.stroke(); }
      });
    }
    /* 3×3 video wall built from the masked tile feeds (img/real/tiles/*.jpg, 640×400).
       tiles: 9 × { src, label, crop:[sx,sy,sw,sh] as fractions of the image (optional, gives distinct views) }.
       Returns {tex, draw(time, alertIdx, lostIdx)}; redraws only when something changes (cheap). */
    function videoWall(tiles) {
      var c = document.createElement('canvas'); c.width = 1200; c.height = 720;
      var x = c.getContext('2d'), t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 8; owned.push(t);
      var imgs = {}, loaded = 0, total = 0;
      tiles.forEach(function (tl) {
        if (imgs[tl.src]) return; total++;
        var im = new Image(); im.onload = function () { loaded++; dirty = true; }; im.src = tl.src; imgs[tl.src] = im;
      });
      var dirty = true, lastKey = '';
      function draw(time, alert, lost) {
        var blink = Math.sin(time * 8) > 0, key = alert + '|' + lost + '|' + (alert >= 0 || lost >= 0 ? blink : '') + '|' + loaded;
        if (!dirty && key === lastKey) return; lastKey = key; dirty = false;
        x.fillStyle = '#0B1520'; x.fillRect(0, 0, c.width, c.height);
        var cols = 3, rows = 3, tw = c.width / cols, th = c.height / rows;
        for (var i = 0; i < 9; i++) {
          var tl = tiles[i % tiles.length], cx = (i % cols) * tw, cy = Math.floor(i / cols) * th, im = imgs[tl.src];
          if (lost === i) {
            x.fillStyle = '#16212C'; x.fillRect(cx + 3, cy + 3, tw - 6, th - 6);
            x.fillStyle = blink ? '#F08A84' : '#D6453D'; x.font = '700 22px "Geist Mono", monospace'; x.textAlign = 'center';
            x.fillText('NO SIGNAL', cx + tw / 2, cy + th / 2); x.textAlign = 'left';
          } else if (im && im.complete && im.naturalWidth) {
            var cr = tl.crop || [0, 0, 1, 1], W2 = im.naturalWidth, H2 = im.naturalHeight;
            x.drawImage(im, cr[0] * W2, cr[1] * H2, cr[2] * W2, cr[3] * H2, cx + 3, cy + 3, tw - 6, th - 6);
          } else { x.fillStyle = '#1C2B3A'; x.fillRect(cx + 3, cy + 3, tw - 6, th - 6); }
          x.fillStyle = 'rgba(11,21,32,.7)'; x.fillRect(cx + 3, cy + th - 30, tw - 6, 27);
          x.fillStyle = '#DCEBF7'; x.font = '600 16px "Geist Mono", monospace'; x.fillText(tl.label || ('CAM ' + (i + 1)), cx + 12, cy + th - 11);
          x.fillStyle = '#D6453D'; x.beginPath(); x.arc(cx + tw - 18, cy + 18, 5, 0, 7); x.fill();
          if (alert === i) { x.strokeStyle = blink ? '#D6453D' : '#F08A84'; x.lineWidth = 7; x.strokeRect(cx + 6, cy + 6, tw - 12, th - 12); }
        }
        t.needsUpdate = true;
      }
      draw(0, -1, -1); return { tex: t, draw: draw };
    }

    /* HTML tags projected from 3D, kept inside the host */
    var layer = document.createElement('div');
    layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
    layer.setAttribute('aria-hidden', 'true');
    var st = document.createElement('style');
    st.textContent = '.dmk-tag{position:absolute;left:0;top:0;font:500 12.5px/1.25 "Geist Mono",ui-monospace,Consolas,monospace;background:#2673B5;color:#fff;padding:6px 9px;border-radius:5px;white-space:nowrap;opacity:0;transition:opacity .3s;box-shadow:0 8px 20px -10px rgba(10,26,43,.5)}'
      + '.dmk-tag b{font-weight:600}.dmk-alert{background:#D6453D}.dmk-light{background:#fff;color:#0A1A2B;border:1px solid #C5D4E2}'
      + '.dmk-ok{background:#0A1A2B}.dmk-tag::after{content:"";position:absolute;left:50%;bottom:-5px;width:9px;height:9px;background:inherit;transform:translateX(-50%) rotate(45deg);border-right:inherit;border-bottom:inherit}';
    layer.appendChild(st); host.appendChild(layer);
    var tags = [], v3 = new T.Vector3(), W = 1, H = 1;
    function tag(html, kind, pos) {
      var el = document.createElement('div'); el.className = 'dmk-tag' + (kind ? ' dmk-' + kind : ''); el.innerHTML = html; layer.appendChild(el);
      var o = { el: el, pos: pos ? pos.clone() : new T.Vector3(), on: false, set: function (h) { if (el.innerHTML !== h) el.innerHTML = h; } };
      tags.push(o); return o;
    }
    function placeTags() {
      for (var i = 0; i < tags.length; i++) {
        var o = tags[i];
        if (!o.on) { if (o.el.style.opacity !== '0') o.el.style.opacity = '0'; continue; }
        v3.copy(o.pos).project(camera);
        if (v3.z > 1 || v3.z < -1) { o.el.style.opacity = '0'; continue; }
        var x = (v3.x * .5 + .5) * W, y = (-v3.y * .5 + .5) * H, ew = o.el.offsetWidth || 120, eh = o.el.offsetHeight || 28;
        x = Math.max(ew / 2 + 8, Math.min(W - ew / 2 - 8, x)); y = Math.max(eh + 12, Math.min(H - 8, y));
        o.el.style.transform = 'translate(' + (x - ew / 2).toFixed(1) + 'px,' + (y - eh - 8).toFixed(1) + 'px)';
        o.el.style.opacity = '1';
      }
    }

    /* camera journey: dwell at each station, then glide to the next; smooth-damped so jumps never snap */
    var camPos = new T.Vector3(), camLook = new T.Vector3(), tgtPos = new T.Vector3(), tgtLook = new T.Vector3(), started = false;
    function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function journey(keys, progress, dt, sway, time) {
      var n = keys.length, f = Math.min(progress * n, n - 1e-6), i = Math.floor(f), t = f - i;
      var a = keys[i], b = keys[Math.min(i + 1, n - 1)], hold = .64;
      var m = (i < n - 1 && t > hold) ? ease((t - hold) / (1 - hold)) : 0;
      tgtPos.lerpVectors(a.pos, b.pos, m); tgtLook.lerpVectors(a.look, b.look, m);
      var shA = a.sh, shB = b.sh;
      if (m > 0 && m < 1) tgtPos.y += Math.sin(m * Math.PI) * (a.lift || 4);
      if (!started || ctx.reduce) { camPos.copy(tgtPos); camLook.copy(tgtLook); started = true; }
      else { var k = 1 - Math.exp(-dt * 5); camPos.lerp(tgtPos, k); camLook.lerp(tgtLook, k); }
      camera.position.copy(camPos);
      if (sway && !ctx.reduce) { camera.position.x += Math.sin(time * .35) * .25; camera.position.y += Math.sin(time * .5) * .12; }
      camera.lookAt(camLook);
      // shadow frustum follows the framed area: a station's own radius (key.sh) or one fitted to the view distance
      var base = camPos.distanceTo(camLook) * 1.3 + 10, ra = shA != null ? shA : base, rb = shB != null ? shB : base;
      shFocus.copy(camLook).lerp(camPos, .2); fitShadow(shFocus, ra + (rb - ra) * m);
      if (i !== shI) { shI = i; shDirty = true; }
      return { i: i, local: t < hold ? t / hold : 1, moving: m > 0 };
    }

    /* sun shadow map re-centred on the framed area each frame and sized to it (snapped to texels and 4 m steps so
       it does not shimmer); a station close-up gets crisp contact shadows, an aerial view still gets them all */
    // the shadow map is redrawn when the frustum moves, on a station change, and every 4th frame for moving things
    var sunOff = null, shR = 0, shFocus = new T.Vector3(), MAXSH = 100, shDirty = true, shN = 0, shI = -1;
    function fitShadow(look, r) {
      if (!SH) return;
      if (!sunOff) sunOff = new T.Vector3().subVectors(sun.position, sun.target.position).normalize().multiplyScalar(160);
      r = Math.ceil(Math.max(12, Math.min(MAXSH, r)) / 4) * 4;
      var tex = 2 * r / sun.shadow.mapSize.x;
      var nx = Math.round(look.x / tex) * tex, nz = Math.round(look.z / tex) * tex;
      if (nx !== sun.target.position.x || nz !== sun.target.position.z) shDirty = true;
      sun.target.position.set(nx, 0, nz); sun.position.copy(sun.target.position).add(sunOff);
      if (r !== shR) { shR = r; shDirty = true; shc.left = -r; shc.right = r; shc.top = r; shc.bottom = -r; shc.near = 30; shc.far = 320; shc.updateProjectionMatrix(); }
    }
    function resize(w, h) {
      W = Math.max(1, w); H = Math.max(1, h);
      renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
    }
    // the products page lowers the pixel ratio on a slow GPU
    function setDpr(v) { renderer.setPixelRatio(v); renderer.setSize(W, H, false); }
    function render() {
      if (SH && (shDirty || ++shN % 4 === 0)) { renderer.shadowMap.needsUpdate = true; shDirty = false; }
      flushQueues(); renderer.render(scene, camera); placeTags();
    }
    function dispose() {
      scene.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { if (m.map) m.map.dispose(); m.dispose(); }); }
      });
      owned.forEach(function (t) { if (t && t.dispose) t.dispose(); });
      renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss();
      if (cv.parentNode) cv.parentNode.removeChild(cv);
      if (layer.parentNode) layer.parentNode.removeChild(layer);
    }
    return {
      T: T, MOB: MOB, SH: SH, renderer: renderer, scene: scene, camera: camera, sun: sun,
      M: M, B: B, geo: geo, cs: cs, rcv: rcv, box: box, cyl: cyl, canvasTex: canvasTex, imgTex: imgTex,
      titleBoard: titleBoard, stationBoard: stationBoard, camModel: camModel, poleCam: poleCam, viewCone: viewCone,
      car: car, carsInst: carsInst, truck: truck, person: person, walk: walk, seated: seated, chair: chair, controlRoom: controlRoom, gateStep: gateStep, follow: follow, tree: tree, streetLight: streetLight, PAINT: PAINT,
      builder: builder, meshes: meshes, instMerged: instMerged, jitter: jitter, shapeOf: shapeOf, profileX: profileX, X: X, vcMats: vcMats, fitShadow: fitShadow,
      asphaltTex: asphaltTex, pavingTex: pavingTex, grassTex: grassTex, windowTex: windowTex, videoWall: videoWall,
      inst: inst, facing: facing, rod: rod, windowPair: windowPair,
      tag: tag, journey: journey, resize: resize, setDpr: setDpr, render: render, dispose: dispose, ease: ease
    };
  }

  /* =============================================================================================
     PORTS: container port and logistics hub. Cygnus + Access and parking (truck gate) only.
     World (metres): water x < -42, quay edge at x = -42 with ship-to-shore cranes on rails and a moored
     ship, container yard blocks with RTGs and straddle carriers in the middle, a reefer row, light
     towers, truck gate complex at z = +46 (outside is +z) with the queue, operations building with the
     Cygnus 3×3 wall + playback east of the gate, berth camera on the quay.
     ============================================================================================= */
  var STATIONS = [
    { id: 'gate', product: 'Access and parking', productSlug: 'access-parking', short: 'Gate lanes',
      title: 'Every truck read at the gate lane',
      body: 'Cameras over each gate lane read the plate and the class of every truck, day or night. Each read opens the gate transaction with the time, the lane and a snapshot.',
      rows: [['Plate', 'XX 00 AB 1234'], ['Class', 'Truck · container'], ['Lane', 'Gate 3 · in'], ['Barrier', 'Opened on read']],
      live: ['ANPR', 'Vehicle classification', 'Gate log'],
      photo: 'img/port-sm.jpg', photoCaption: 'Illustrative' },
    { id: 'journey', product: 'Cygnus', productSlug: 'cygnus', short: 'Gate to berth',
      title: 'Follow a truck from gate to berth',
      body: 'Search a plate and Cygnus shows every camera that read it, in order: the gate lane, the yard block, the berth.',
      rows: [['Plate', 'XX 00 AB 1234'], ['Seen at', 'Gate 3 → Block C → Berth 2'], ['Time in port', '31 min']],
      live: ['Plate search & journeys'],
      photo: 'img/port-road-sm.jpg', photoCaption: 'Illustrative' },
    { id: 'wall', product: 'Cygnus', productSlug: 'cygnus', short: 'Yard wall',
      title: 'Yard and quay on one 3×3 wall',
      body: 'Gates, yard blocks, the quay and the berths on one wall in the gate operations room. Every camera records 24×7, and any moment plays back from the timeline.',
      rows: [['Wall', 'Gates · yard · quay · berths'], ['Recording', '24×7 · timeline playback'], ['Export', 'Clip with time and camera']],
      live: ['Live video wall', '24×7 recording', 'Playback & export'],
      photo: 'img/real/tiles/t8-port.jpg', photoCaption: 'Corridor feeds masked · other views illustrative' },
    { id: 'health', product: 'Cygnus', productSlug: 'cygnus', short: 'Berth camera',
      title: 'A berth camera dropped its stream',
      body: 'Remote berth cameras sit on the same wall. When one is blinded, moved or goes offline, Cygnus flags it at once and raises a maintenance ticket.',
      rows: [['Camera', 'Berth 2 · quay cam'], ['Status', 'Stream lost'], ['Next step', 'Maintenance ticket']],
      live: ['Camera tamper & health'],
      photo: 'img/port-berth-sm.jpg', photoCaption: 'Illustrative' },
    { id: 'queue', product: 'Access and parking', productSlug: 'access-parking', short: 'Gate queue',
      title: 'How long trucks wait, lane by lane',
      body: 'Trucks queued outside each gate lane are counted with their waiting time, so the gate team opens another lane before the line reaches the road.',
      rows: [['Lane 1', '3 trucks · 6 min'], ['Lane 2', '2 trucks · 4 min'], ['Lane 3', '1 truck · 1 min'], ['Lane 4', '2 trucks · 3 min']],
      live: ['Queue length', 'Dwell time', 'ANPR'],
      photo: 'img/port-queue-sm.jpg', photoCaption: 'Illustrative' }
  ];

  function create(host, ctx) {
    var K = makeKit(host, ctx), T = K.T, scene = K.scene, M = K.M, B = K.B, box = K.box, cyl = K.cyl, MOB = K.MOB;
    var time = 0;
    scene.fog.density = MOB ? .0042 : .0032;
    K.sun.position.set(-30, 80, 50);

    /* ---------- water: swell on the mesh + a multi-octave ripple normal map (random phases, no visible tiling),
       low roughness so the sky, ship and cranes read as soft reflections ---------- */
    var nmap = K.canvasTex(256, 256, function (x, w, h) {
      var hgt = new Float32Array(w * h), waves = [];
      for (var k = 0; k < 14; k++) { var fx = 1 + (k * 7 % 11), fy = 1 + (k * 5 % 9), sg = k % 2 ? 1 : -1; waves.push([fx * sg, fy, .9 / (1 + k * .45), k * 2.39]); }
      for (var y = 0; y < h; y++) for (var xx = 0; xx < w; xx++) {
        var u = xx / w * Math.PI * 2, v = y / h * Math.PI * 2, s = 0;
        for (var q = 0; q < waves.length; q++) s += Math.sin(u * waves[q][0] + v * waves[q][1] + waves[q][3]) * waves[q][2];
        hgt[y * w + xx] = s;
      }
      var img = x.createImageData(w, h);
      for (var y2 = 0; y2 < h; y2++) for (var x2 = 0; x2 < w; x2++) {
        var l = hgt[y2 * w + (x2 + w - 1) % w], r = hgt[y2 * w + (x2 + 1) % w], d = hgt[((y2 + 1) % h) * w + x2], t = hgt[((y2 + h - 1) % h) * w + x2];
        var nx = (l - r) * .9, ny = (t - d) * .9, nz = 1, len = Math.hypot(nx, ny, nz), o = (y2 * w + x2) * 4;
        img.data[o] = (nx / len * .5 + .5) * 255; img.data[o + 1] = (ny / len * .5 + .5) * 255; img.data[o + 2] = (nz / len * .5 + .5) * 255; img.data[o + 3] = 255;
      }
      x.putImageData(img, 0, 0);
    }, [11, 17], true);
    var wg = new T.PlaneGeometry(260, 420, MOB ? 20 : 52, MOB ? 30 : 80);
    var water = K.rcv(new T.Mesh(wg, new T.MeshStandardMaterial({ color: 0x3A73A3, roughness: .14, metalness: .25, normalMap: nmap, normalScale: new T.Vector2(.42, .42), envMapIntensity: 1.2 })));
    water.rotation.x = -Math.PI / 2; water.position.set(-172, -1.6, -40); scene.add(water);
    var wPos = wg.attributes.position, wBase = Float32Array.from(wPos.array);
    var apron = K.rcv(new T.Mesh(new T.PlaneGeometry(150, 260), M(0xBFC5CA, { map: K.pavingTex([26, 44], '#C9CED2'), roughness: .9 })));
    apron.rotation.x = -Math.PI / 2; apron.position.set(33, 0, -40); scene.add(apron);
    box(1.2, 4.4, 260, M(0x9AA1A8, { roughness: .8 }), -42.4, -1.7, -40);                         // quay wall + coping (top .5)
    // cranes sit on rails at x = -39.5 (waterside) and -23.5 (landside); their bays line up with the ship's container bays
    var BAYP = 6.3 * (MOB ? 2 : 1), CRANE_BAYS = MOB ? [1, 4] : [3, 10, 16], CRANE_Z = CRANE_BAYS.map(function (b) { return -110 + b * BAYP; });
    function underCrane(z, m) { return CRANE_Z.some(function (cz) { return Math.abs(Math.abs(z - cz) - 8) < 2 + (m || 0); }); }
    // quay edge: yellow capping, bollards with caps (kept clear of crane bogies), cone fenders with panels, ladders
    var bollList = [], bollCap = [], fenderList = [], fenderCone = [], ladder = [], BOLL = [];
    for (var bz = -160; bz < 90; bz += 12) {
      if (!underCrane(bz)) { bollList.push([-41.2, .3, bz, .4, .6, .4]); bollCap.push([-41.2, .64, bz, .56, .1, .56]); BOLL.push(bz); }
      fenderList.push([-43.95, -.5, bz + 6, .3, 2.2, 2.6]); fenderCone.push([-43.4, -.5, bz + 6, .55, .8, .55, 0, 0, Math.PI / 2]);
      if (!MOB && (bz / 12 | 0) % 2) { ladder.push([-43.04, -.8, bz + 2.4, .06, 2.4, .06], [-43.04, -.8, bz + 2.9, .06, 2.4, .06]); for (var rg = 0; rg < 5; rg++) ladder.push([-43.04, -1.7 + rg * .45, bz + 2.65, .05, .05, .5]); }
    }
    var bollM = M(0x2A2F35, { roughness: .6 });
    K.inst(new T.CylinderGeometry(1, 1.15, 1, 10), bollM, bollList); K.inst(new T.CylinderGeometry(1, 1, 1, 10), bollM, bollCap);
    K.inst(null, M(0x1C1F22, { roughness: .9 }), fenderList); K.inst(new T.CylinderGeometry(1, .65, 1, 12), M(0x23272B, { roughness: .9 }), fenderCone);
    if (ladder.length) K.inst(null, M(0xE0A42B, { roughness: .5, metalness: .4 }), ladder);
    box(.35, .05, 260, M(0xE0B04A, { roughness: .6 }), -42.75, .525, -40);
    var railM = M(0x8E959C, { metalness: .7, roughness: .35 });
    box(.3, .15, 260, railM, -39.5, .075, -40); box(.3, .15, 260, railM, -23.5, .075, -40);
    // yard road (truck route) along x = 6, and gate approach
    var roadM = M(0x6E757C, { map: K.asphaltTex([3, 50]), roughness: .92 });
    var rd = K.rcv(new T.Mesh(new T.PlaneGeometry(12, 230), roadM)); rd.rotation.x = -Math.PI / 2; rd.position.set(6, .03, 5); scene.add(rd);
    var rd2 = K.rcv(new T.Mesh(new T.PlaneGeometry(44, 90), roadM)); rd2.rotation.x = -Math.PI / 2; rd2.position.set(0, .035, 90); scene.add(rd2);
    var mark = B(0xF5F5F0), markList = [];
    for (var z = -150; z < 40; z += 8) markList.push([6, .05, z, .16, .02, 3.4]);
    [-8.5, 0, 8.5].forEach(function (lx) { for (var qz = 54; qz < 132; qz += 6) markList.push([lx, .05, qz, .16, .02, 3]); });
    // quay walkway for lashers (yellow lines), crane lane markings
    markList.push([-40.9, .012, -40, .1, .02, 250], [-39.95, .012, -40, .1, .02, 250]);
    K.inst(null, mark, markList);

    /* ---------- containers (ISO 20 ft 6.058 × 2.438 × 2.591 m, 40 ft 12.192 m) ----------
       Corrugated side walls and front end, flat roof, top + bottom side rails, headers + sills, corner posts and eight
       corner castings at the exact outer extents (so stacks sit casting-on-casting), door end with two leaves, door gap,
       four locking bars with cam keepers and handles, hinges. Three liveries per length, tinted per instance. */
    var CW = 2.438, CH = 2.591, LEN = { 20: 6.058, 40: 12.192 };
    function contTex(kind, L) {
      var ncor = Math.round((L - .36) / .3);
      return K.canvasTex(512, 256, function (x, w, h) {
        x.fillStyle = '#C9CBCD'; x.fillRect(0, 0, w, h);
        if (!MOB) for (var i = 0; i < ncor; i++) { var cx = (i + .5) / ncor * w; x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(cx - w / ncor * .3, 0, w / ncor * .18, h); x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(cx + w / ncor * .1, 0, w / ncor * .14, h); }
        else for (var i2 = 0; i2 < ncor; i2++) { x.fillStyle = 'rgba(0,0,0,.16)'; x.fillRect(i2 * w / ncor, 0, w / ncor * .4, h); }
        x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(0, 0, w, 7); x.fillRect(0, h - 7, w, 7); x.fillRect(0, 0, 7, h); x.fillRect(w - 7, 0, 7, h);
        if (kind === 1) { x.fillStyle = '#FFFFFF'; x.fillRect(0, h * .2, w, h * .1); }
        if (kind === 2) { x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(w * .3, h * .5, h * .2, 0, 7); x.fill(); x.fillRect(w * .42, h * .42, w * .32, h * .16); x.fillStyle = 'rgba(0,0,0,.35)'; x.beginPath(); x.arc(w * .3, h * .5, h * .1, 0, 7); x.fill(); }
        x.fillStyle = 'rgba(255,255,255,.85)'; x.font = '700 16px "Geist Mono",monospace'; x.textAlign = 'right'; x.fillText('XXXU 000000 0', w - 16, 26); x.fillText('22G1', w - 16, 46);
      });
    }
    function contGeo(L) {
      if (MOB) return new T.BoxGeometry(CW, CH, L);
      var pos = [], uv = [], e1 = new T.Vector3(), e2 = new T.Vector3(), cr = new T.Vector3(), W2 = CW / 2, H2 = CH / 2, L2 = L / 2;
      function V3(x, y, z) { return new T.Vector3(x, y, z); }
      function quad(q, n, u) {
        e1.subVectors(q[1], q[0]); e2.subVectors(q[2], q[0]); cr.crossVectors(e1, e2);
        if (cr.dot(n) < 0) { q = [q[0], q[3], q[2], q[1]]; u = [u[0], u[3], u[2], u[1]]; }
        [0, 1, 2, 0, 2, 3].forEach(function (k) { pos.push(q[k].x, q[k].y, q[k].z); uv.push(u[k][0], u[k][1]); });
      }
      function bx(sx, sy, sz, x, y, z, u0, v0) {
        var b = new T.BoxGeometry(sx, sy, sz); b.translate(x, y, z); var nb = b.toNonIndexed(), p = nb.attributes.position.array;
        for (var i = 0; i < p.length; i++) pos.push(p[i]); for (var j = 0; j < p.length / 3; j++) uv.push(u0 == null ? .006 : u0, v0 == null ? .5 : v0); b.dispose(); nb.dispose();
      }
      var y0 = -H2 + .16, y1 = H2 - .12, zA = -L2 + .17, zB = L2 - .17, prof = [[zA, 0]], D = .04;
      for (var z = zA + .06; z + .26 <= zB; z += .3) prof.push([z, 0], [z + .06, D], [z + .2, D], [z + .26, 0]);
      prof.push([zB, 0]);
      [-1, 1].forEach(function (sd) {                                                                   // corrugated side walls
        for (var k = 0; k < prof.length - 1; k++) {
          var za = prof[k][0], zb = prof[k + 1][0], xa = sd * (W2 - .02 - prof[k][1]), xb = sd * (W2 - .02 - prof[k + 1][1]), ua = za / L + .5, ub = zb / L + .5;
          quad([V3(xa, y0, za), V3(xb, y0, zb), V3(xb, y1, zb), V3(xa, y1, za)], V3(sd, 0, 0), [[ua, .04], [ub, .04], [ub, .96], [ua, .96]]);
        }
      });
      var fp = [[-W2 + .17, 0]];                                                                          // corrugated front end
      for (var x = -W2 + .23; x + .26 <= W2 - .17; x += .3) fp.push([x, 0], [x + .06, D], [x + .2, D], [x + .26, 0]);
      fp.push([W2 - .17, 0]);
      for (var f = 0; f < fp.length - 1; f++) { var xa2 = fp[f][0], xb2 = fp[f + 1][0], za2 = -L2 + .02 + fp[f][1], zb2 = -L2 + .02 + fp[f + 1][1]; quad([V3(xa2, y0, za2), V3(xb2, y0, zb2), V3(xb2, y1, zb2), V3(xa2, y1, za2)], V3(0, 0, -1), [[.5, .5], [.52, .5], [.52, .52], [.5, .52]]); }
      quad([V3(-W2 + .02, H2 - .02, -L2 + .02), V3(W2 - .02, H2 - .02, -L2 + .02), V3(W2 - .02, H2 - .02, L2 - .02), V3(-W2 + .02, H2 - .02, L2 - .02)], V3(0, 1, 0), [[.5, .5], [.52, .5], [.52, .52], [.5, .52]]); // roof
      quad([V3(-W2 + .02, -H2 + .03, -L2 + .02), V3(W2 - .02, -H2 + .03, -L2 + .02), V3(W2 - .02, -H2 + .03, L2 - .02), V3(-W2 + .02, -H2 + .03, L2 - .02)], V3(0, -1, 0), [[.006, .5], [.007, .5], [.007, .51], [.006, .51]]); // floor underside
      [-1, 1].forEach(function (sd) {                                                                   // door leaves (door end +z)
        quad([V3(sd * .015, y0 - .04, L2 - .03), V3(sd * (W2 - .17), y0 - .04, L2 - .03), V3(sd * (W2 - .17), y1 + .02, L2 - .03), V3(sd * .015, y1 + .02, L2 - .03)], V3(0, 0, 1), [[.5, .5], [.52, .5], [.52, .52], [.5, .52]]);
      });
      bx(.03, CH - .3, .03, 0, 0, L2 - .045, .006);                                                     // door gap
      [-1, 1].forEach(function (sx) {
        bx(.1, .12, L - .34, sx * (W2 - .06), H2 - .07, 0); bx(.1, .16, L - .34, sx * (W2 - .06), -H2 + .09, 0);   // top + bottom side rails
        bx(.15, CH - .236, .15, sx * (W2 - .085), 0, L2 - .085); bx(.15, CH - .236, .15, sx * (W2 - .085), 0, -L2 + .085); // corner posts
        [-1, 1].forEach(function (sy) { [-1, 1].forEach(function (sz) { bx(.178, .118, .162, sx * (W2 - .089), sy * (H2 - .059), sz * (L2 - .081), .006, .5); }); }); // castings
        [.3, .85].forEach(function (lx) {                                                               // locking bars, keepers, handles
          bx(.035, CH - .42, .035, sx * lx, 0, L2 - .02, .5, .5);
          bx(.08, .07, .05, sx * lx, H2 - .2, L2 - .02); bx(.08, .07, .05, sx * lx, -H2 + .2, L2 - .02);
          bx(.2, .035, .035, sx * (lx - .1), -.25, L2 - .005, .5, .5);
        });
        for (var hg = 0; hg < 4; hg++) bx(.1, .08, .05, sx * (W2 - .2), -H2 + .35 + hg * .63, L2 - .02);   // hinges
      });
      [-1, 1].forEach(function (sz) { bx(CW - .36, .12, .1, 0, H2 - .07, sz * (L2 - .06)); bx(CW - .36, .16, .1, 0, -H2 + .09, sz * (L2 - .06)); }); // headers + sills
      var g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
      g.computeVertexNormals(); return g;
    }
    var CGEO = { 20: contGeo(LEN[20]), 40: contGeo(LEN[40]) };
    var CMAT = { 20: [0, 1, 2].map(function (k) { return new T.MeshStandardMaterial({ map: contTex(k, LEN[20]), roughness: .55, metalness: .3 }); }),
                 40: [0, 1, 2].map(function (k) { return new T.MeshStandardMaterial({ map: contTex(k, LEN[40]), roughness: .55, metalness: .3 }); }) };
    var CC = [0xB3261E, 0x2B5C9E, 0x8E959C, 0x2F7D57, 0xE0A42B, 0xF2F3F4, 0x6E7A86, 0xC4572E, 0x1C4E80, 0x7A2E2A, 0x1F7A80, 0xD9822B, 0x4A5A2E];
    function contTint(c, k) { return new T.Color(CC[c % CC.length]).multiplyScalar(1.18 + (k % 5) * .03); }
    /* stacks: [x, yBottom, z, colourIdx, 20|40] → one instanced draw per length × livery */
    function stacks(list) {
      [20, 40].forEach(function (L) {
        [0, 1, 2].forEach(function (kind) {
          var sub = list.filter(function (c) { return (c[4] || 20) === L && c[3] % 3 === kind; }); if (!sub.length) return;
          var im = new T.InstancedMesh(CGEO[L], CMAT[L][kind], sub.length), m4 = new T.Matrix4();
          sub.forEach(function (c, k) { m4.makeTranslation(c[0], c[1] + CH / 2, c[2]); im.setMatrixAt(k, m4); im.setColorAt(k, contTint(c[3], k)); });
          im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; im.frustumCulled = false; K.cs(im); scene.add(im);
        });
      });
    }
    function contMesh(c, L) { var m = new T.Mesh(CGEO[L || 20], CMAT[L || 20][c % 3].clone()); m.material.color.copy(contTint(c, 2)); return K.cs(m); }

    /* ---------- ship: shaped hull (raked bow, rounded stern) with antifouling, boot-top and sheer lines, plating strakes
       and frames, forecastle, anchors, hatch covers, lashing bridges, deck stacks (precise tiers, no gaps), a tiered
       accommodation block with window rows and handrails, bridge with wraparound glazing and wings, funnel with livery
       bands, mast + radar, enclosed lifeboats on davits, bitts and fairleads, mooring lines to the quay bollards ---------- */
    var ship = new T.Group(), SX = -58, SZ = -50, hullM = M(0x24476B, { roughness: .55, metalness: .3 });
    var plan = [[-12, 72], [-11.4, 74.4], [-9.5, 75.6], [9.5, 75.6], [11.4, 74.4], [12, 72], [12, -60], [11.6, -70], [10, -78], [7.2, -85], [3.6, -89.5], [0, -91.5], [-3.6, -89.5], [-7.2, -85], [-10, -78], [-11.6, -70], [-12, -60]];
    function hullExt(sc, y0, h) {
      var g = new T.ExtrudeGeometry(K.shapeOf(plan.map(function (q) { return [q[0] * sc, -q[1] * sc]; })), { depth: h, bevelEnabled: false, curveSegments: 1 });
      g.rotateX(-Math.PI / 2); g.translate(0, y0, 0); return g;
    }
    ship.add(K.cs(new T.Mesh(hullExt(1, -4, 12), hullM)));
    ship.add(new T.Mesh(hullExt(1.004, -4, 2.7), M(0xA8322A, { roughness: .6 })));                      // antifouling to just above the waterline
    ship.add(new T.Mesh(hullExt(1.0045, -1.32, .12), B(0xF2F4F6)));                                     // boot-top line
    ship.add(new T.Mesh(hullExt(1.003, 7.55, .3), B(0xF2F4F6)));                                        // sheer line
    var fc = new T.ExtrudeGeometry(K.shapeOf(plan.slice(7, 16).map(function (q) { return [q[0] * .985, -q[1] * .985]; }).concat([[-11.4, 64], [11.4, 64]])), { depth: 1.6, bevelEnabled: false });
    fc.rotateX(-Math.PI / 2); fc.translate(0, 8, 0); ship.add(K.cs(new T.Mesh(fc, M(0xF2F3F4, { roughness: .5 }))));   // forecastle
    [-1, 1].forEach(function (s) { var an = box(.5, 1.6, 1.0, M(0x1C1F22, { roughness: .5, metalness: .5 }), s * 9.25, 5.2, -80.5, ship); an.rotation.y = s * .55; });
    var draft = []; for (var dm = 0; dm < 6; dm++) { draft.push([12.07, -2 + dm * 1.1, -58, .04, .12, .6]); draft.push([12.07, -2 + dm * 1.1, 70, .04, .12, .6]); }
    K.inst(null, B(0xF2F4F6), draft, ship);
    var railP = []; for (var rz2 = -66; rz2 <= 74; rz2 += 2.5) { railP.push([11.8, 8.6, rz2, .06, 1, .06]); railP.push([-11.8, 8.6, rz2, .06, 1, .06]); }
    railP.push([11.8, 9.1, 4, .05, .05, 140], [-11.8, 9.1, 4, .05, .05, 140], [11.8, 8.65, 4, .04, .04, 140], [-11.8, 8.65, 4, .04, .04, 140]);
    K.inst(null, M(0xD9DEE2, { metalness: .5, roughness: .4 }), railP, ship);
    var seam = [];                                                                                     // plating: strakes + frames, both sides
    [-1, 1].forEach(function (s) {
      [-1.2, 1.6, 4.4, 6.6].forEach(function (sy) { seam.push([s * 12.015, sy, 6, .03, .06, 132]); });
      for (var sz3 = -58; sz3 < 72; sz3 += 6.5) seam.push([s * 12.015, 1.8, sz3, .03, 10.6, .05]);
    });
    K.inst(null, M(0x1E3D5C, { roughness: .6 }), seam, ship);
    // accommodation block: six decks stepping back, windows on every face, handrails, bridge + wings, funnel, mast
    var sup = new T.Group(), white = M(0xF2F3F4, { roughness: .5 }), glassD = M(0x2A4560, { roughness: .06, metalness: .8 }), winL = [], frameL = [], hrL = [];
    for (var dk = 0; dk < 6; dk++) {
      var dy = 8 + dk * 2.8, dw = 18 - (dk > 3 ? 1 : 0), dd = 11 - (dk > 3 ? 1 : 0);
      box(dw, 2.8, dd, white, 0, dy + 1.4, 0, sup); box(dw + .3, .14, dd + .3, M(0xDCE1E5, { roughness: .5 }), 0, dy + 2.8, 0, sup);
      for (var wc = 0; wc < 8; wc++) { var wx = -dw / 2 + 1.4 + wc * (dw - 2.8) / 7; winL.push([wx, dy + 1.55, dd / 2 + .02, 1.1, .75, .04], [wx, dy + 1.55, -dd / 2 - .02, 1.1, .75, .04]); frameL.push([wx, dy + 1.12, dd / 2 + .05, 1.2, .06, .08]); }
      for (var wz2 = 0; wz2 < 4; wz2++) { var wzz = -dd / 2 + 1.6 + wz2 * (dd - 3.2) / 3; winL.push([dw / 2 + .02, dy + 1.55, wzz, .04, .75, 1.1], [-dw / 2 - .02, dy + 1.55, wzz, .04, .75, 1.1]); }
      hrL.push([0, dy + 3.85, dd / 2 + .12, dw + .3, .05, .05], [dw / 2 + .12, dy + 3.85, 0, .05, .05, dd + .3], [-dw / 2 - .12, dy + 3.85, 0, .05, .05, dd + .3]);
    }
    K.inst(null, glassD, winL, sup); K.inst(null, M(0xDCE1E5, { roughness: .45 }), frameL, sup);
    var BY = 8 + 6 * 2.8;                                                                              // bridge deck floor (24.8)
    box(16, 2.9, 8, white, 0, BY + 1.45, -1, sup); box(27, .35, 4, white, 0, BY + .18, -3, sup);       // wheelhouse + wings
    [-1, 1].forEach(function (s) { box(2.4, 2.4, 3.2, white, s * 12, BY + 1.55, -3, sup); box(.04, 1.1, 2.9, glassD, s * 13.22, BY + 1.95, -3, sup); box(2.2, 1.1, .04, glassD, s * 12, BY + 1.95, -4.62, sup); box(.06, 1, .06, M(0xD9DEE2), s * 13.4, BY + .9, -1.5, sup); });
    box(16.2, 1.15, .05, glassD, 0, BY + 1.95, -5.03, sup); box(.05, 1.15, 7.2, glassD, 8.03, BY + 1.95, -1, sup); box(.05, 1.15, 7.2, glassD, -8.03, BY + 1.95, -1, sup); box(16.2, 1.0, .05, glassD, 0, BY + 1.9, 3.03, sup);
    for (var bm2 = -7; bm2 <= 7; bm2 += 1.4) box(.08, 1.15, .08, white, bm2, BY + 1.95, -5.06, sup);    // bridge window mullions
    box(17, .3, 9, M(0xDCE1E5, { roughness: .5 }), 0, BY + 3.05, -1, sup); box(17.2, .5, .25, M(0xDCE1E5), 0, BY + 2.75, -5.6, sup, 0); // roof + visor
    K.inst(null, M(0xD9DEE2, { metalness: .5, roughness: .4 }), hrL, sup);
    box(.5, 6, .5, M(0xD9DEE2), 0, BY + 6.2, -2, sup); box(4.4, .2, .3, M(0xD9DEE2), 0, BY + 7.6, -2, sup); box(3.2, .12, .4, M(0x2A2F35), 0, BY + 9.3, -2, sup); cyl(.12, .12, .4, 8, M(0x2A2F35), 0, BY + 9.05, -2, sup);
    box(.2, .2, .2, B(0xFFFFFF), 0, BY + 9.3, -2, sup); box(.18, .18, .18, B(0xD6453D), -2, BY + 7.8, -2, sup); box(.18, .18, .18, B(0x34D27B), 2, BY + 7.8, -2, sup);
    var fun = new T.Group(); fun.position.set(0, 0, 7.6); sup.add(fun);                                   // funnel aft of the block
    var fcas = cyl(2.2, 2.6, 9, 20, M(0xF2F3F4, { roughness: .5 }), 0, 24.5, 0, fun); fcas.scale.set(.72, 1, 1);
    var fb = cyl(2.34, 2.44, 2.2, 20, M(0x2673B5, { roughness: .5 }), 0, 25.5, 0, fun); fb.scale.set(.72, 1, 1);
    var ft = cyl(2.28, 2.28, 1.1, 20, M(0x1C1F22, { roughness: .6 }), 0, 28.55, 0, fun); ft.scale.set(.72, 1, 1);
    [-1, 1].forEach(function (s) { var ld = cyl(.62, .62, .06, 20, B(0xF2F4F6), s * 1.77, 25.5, 0, fun); ld.rotation.z = Math.PI / 2; });
    [-.5, .5].forEach(function (px) { cyl(.25, .25, 1.4, 10, M(0x2A2F35, { metalness: .5 }), px, 29.6, .3, fun); });
    // enclosed lifeboats on davits (both sides, deck 3)
    var lbG = (function () {
      var b = K.builder();
      b.cyl(1.05, 1.05, 4.6, 14, 0xF08A2B, 0, 0, 0, 'm', Math.PI / 2); b.sph(1.05, 0xF08A2B, 0, 0, 2.3, 'm', 1, 1, .6); b.sph(1.05, 0xF08A2B, 0, 0, -2.3, 'm', 1, 1, .6);
      b.box(1.9, .9, 4.4, 0xF4F6F8, 0, .7, 0, 'm'); b.box(1.6, .6, 3.6, 0xF4F6F8, 0, 1.2, 0); b.box(.6, .5, .8, 0xF08A2B, 0, 1.6, -.9);
      for (var lw = 0; lw < 4; lw++) { b.box(.04, .25, .5, 0x15212C, .96, .75, -1.5 + lw, 'g'); b.box(.04, .25, .5, 0x15212C, -.96, .75, -1.5 + lw, 'g'); }
      b.box(2.15, .08, 6.6, 0xD9DEE2, 0, -.6, 0, 's');
      return b.build();
    })();
    [-1, 1].forEach(function (s) {
      var lb = K.meshes(lbG, sup); lb.position.set(s * 10.4, 8 + 2 * 2.8 + 1.2, 1.2);
      [-1.8, 1.8].forEach(function (dz) { var dv = box(.25, 3.4, .25, M(0xD9DEE2, { metalness: .5 }), s * 9.6, 8 + 2 * 2.8 + 1.6, 1.2 + dz, sup); dv.rotation.z = -s * .35; box(1.6, .2, .2, M(0xD9DEE2), s * 10.3, 8 + 2 * 2.8 + 3.15, 1.2 + dz, sup); });
    });
    sup.position.set(0, 0, 62); ship.add(sup);
    var hatchList = [], lashList = [], lashBar = [], bays = MOB ? 10 : 19;
    for (var hb = 0; hb < bays; hb++) {
      var hz = -110 + hb * BAYP - SZ;
      hatchList.push([0, 8.15, hz, 21, .5, 5.8]);
      if (!MOB) { var lz2 = hz + 3.15; lashList.push([-10.6, 11, lz2, .2, 6, .2], [10.6, 11, lz2, .2, 6, .2]); lashBar.push([0, 14, lz2, 21.4, .2, .2], [0, 11, lz2, 21.4, .15, .15]); }
    }
    K.inst(null, M(0x3A4652, { roughness: .6, metalness: .4 }), hatchList, ship);
    if (!MOB) { K.inst(null, M(0xE0A42B, { roughness: .5, metalness: .4 }), lashList, ship); K.inst(null, M(0xE0A42B, { roughness: .5, metalness: .4 }), lashBar, ship); }
    var bitt = [], FAIR = [-118, -110, -98, 4, 12, 18];                                                 // bitts at the fairleads (ship z, world)
    FAIR.forEach(function (fz) { bitt.push([10.6, 8.5, fz - SZ - .6, .45, .9, .45], [10.6, 8.5, fz - SZ + .6, .45, .9, .45]); });
    K.inst(new T.CylinderGeometry(1, 1, 1, 10), M(0x1C1F22, { roughness: .6 }), bitt, ship);
    ship.position.set(SX, 0, SZ); scene.add(ship);
    // deck stacks: every column is a solid pile from the hatch cover (8.4) up, so nothing floats
    var HATCH = 8.4, deckStack = [], craneSlot = {};
    for (var bx = 0; bx < 8; bx++) for (var bzz = 0; bzz < bays; bzz++) {
      var tiers = 1 + (bx * 7 + bzz * 3) % 3, zz = -110 + bzz * BAYP, xx = -67 + bx * 2.6;
      var ci = CRANE_BAYS.indexOf(bzz);
      if (bx === 5 && ci >= 0) { tiers = 2; craneSlot[ci] = { x: xx, z: zz, y: HATCH + (tiers - 1) * CH, col: bx + bzz + 7 }; tiers -= 1; }
      for (var t = 0; t < tiers; t++) deckStack.push([xx, HATCH + t * CH, zz, bx + bzz + t, 20]);
    }
    stacks(deckStack);
    // mooring lines from the bitts over the side to real bollards: head, breast and spring lines fore and aft
    var lineM = M(0xE9E2CF, { roughness: .9 });
    function nearestBoll(z) { var best = BOLL[0]; BOLL.forEach(function (b) { if (Math.abs(b - z) < Math.abs(best - z)) best = b; }); return best; }
    [[-118, -136], [-110, -112], [-98, -76], [4, -16], [12, 20], [18, 44]].forEach(function (q) {
      var a = new T.Vector3(SX + 12.05, 8.0, q[0]), bz2 = nearestBoll(q[1]), b = new T.Vector3(-41.2, .62, bz2), m = a.clone().lerp(b, .5); m.y -= .5;
      K.rod(a, m, .07, lineM); K.rod(m, b, .07, lineM);
    });
    // tug: shaped hull with a rubber fender belt, tyre fenders, deck house, wheelhouse with wraparound glazing, mast,
    // funnel with a band, towing winch and staple
    var tugG = (function () {
      var b = K.builder(), red = 0xB3261E, wh = 0xF2F3F4, dk = 0x1C1F22;
      var tp = [[-4.2, -11], [4.2, -11], [4.6, -6], [4.6, 5], [3.6, 9.5], [0, 12], [-3.6, 9.5], [-4.6, 5], [-4.6, -6]];
      var hg = new T.ExtrudeGeometry(K.shapeOf(tp.map(function (q) { return [q[0], -q[1]]; })), { depth: 3.2, bevelEnabled: false }); hg.rotateX(-Math.PI / 2); hg.translate(0, -1.6, 0);
      b.geo(hg, red, 0, 0, 0, 'm', 0, 0, 0, 1, 1, 1, true);
      var fg = new T.ExtrudeGeometry(K.shapeOf(tp.map(function (q) { return [q[0] * 1.06, -q[1] * 1.03]; })), { depth: .6, bevelEnabled: false }); fg.rotateX(-Math.PI / 2); fg.translate(0, .9, 0);
      b.geo(fg, dk, 0, 0, 0, 'm', 0, 0, 0, 1, 1, 1, true);
      b.box(6.2, 2.4, 7, wh, 0, 2.8, 2.2); b.box(5.2, 2.2, 4.4, wh, 0, 5.1, 3.4);
      b.box(5.25, .9, 4.45, 0x15212C, 0, 5.4, 3.4, 'g'); b.box(5.6, .2, 4.8, 0xDCE1E5, 0, 6.3, 3.4);
      for (var w = 0; w < 4; w++) { b.box(.04, .6, .8, 0x15212C, 3.12, 3.1, -.3 + w * 1.6, 'g'); b.box(.04, .6, .8, 0x15212C, -3.12, 3.1, -.3 + w * 1.6, 'g'); }
      b.cyl(.12, .12, 4, 8, 0xD9DEE2, 0, 8.3, 3.2, 's'); b.box(1.6, .1, .1, 0xD9DEE2, 0, 9.6, 3.2, 's');
      b.cyl(.55, .65, 2.2, 12, wh, 0, 4.6, -1.8); b.cyl(.66, .66, .5, 12, 0x2673B5, 0, 5.2, -1.8);
      b.cyl(.6, .6, 2.2, 12, 0x5A6470, 0, 2.2, -5.5, 's', 0, 0, Math.PI / 2); b.box(5, .2, .2, 0xE0A42B, 0, 3.4, -8.5, 's');
      for (var tf = 0; tf < 6; tf++) [-1, 1].forEach(function (s) { b.geo(new T.TorusGeometry(.42, .16, 6, 12), dk, s * 4.85, .6, -7 + tf * 2.6, 'm', 0, Math.PI / 2, 0, 1, 1, 1, true); });
      return b.build();
    })();
    var tugs = (MOB ? [[-80, 40, .3]] : [[-80, 40, .3], [-88, -150, -.6]]).map(function (q) { var g = K.meshes(tugG); g.position.set(q[0], -.2, q[1]); g.rotation.y = q[2]; return g; });

    /* ---------- ship-to-shore cranes: portal legs on rails with bogies, sill beams and bracing, lattice boom + girder,
       A-frame with forestays and backstay, machinery house with louvres, operator cab and trolley, festoon cables,
       boom lights. Each crane works one ship bay: its spreader lowers to the stack, locks a 20 ft box, hoists, the
       trolley runs landside and sets it on a terminal tractor under the portal, then the reverse (load) cycle. ---------- */
    var TRAVEL = 26, CR_X = -37.5, TRUCK_LX = 10, TT_DECK = 1.32;
    function stsCrane(zc, slot) {
      var g = new T.Group(), blue = M(0x2E6DB4, { roughness: .45, metalness: .45 }), white = M(0xEEF1F4, { roughness: .45, metalness: .35 });
      [[-2, -8], [-2, 8], [14, -8], [14, 8]].forEach(function (q) { box(1.1, 30, 1.1, blue, q[0], 15.6, q[1], g); box(2.2, 1.2, 3, M(0x2A2F35, { roughness: .5 }), q[0], 1.0, q[1], g); });
      box(18, 1.4, 1.1, blue, 6, 30, -8, g); box(18, 1.4, 1.1, blue, 6, 30, 8, g);
      box(1.1, 1.2, 17, blue, -2, 12, 0, g); box(1.1, 1.2, 17, blue, 14, 12, 0, g);                    // portal beams below the hoist path
      box(18, .8, .8, blue, 6, 12, -8, g); box(18, .8, .8, blue, 6, 12, 8, g);                          // side ties
      var br = box(.4, 22, .4, blue, 14, 18, 0, g); br.rotation.x = .62; var br2 = box(.4, 22, .4, blue, 14, 18, 0, g); br2.rotation.x = -.62;
      var lat = [[-14, 32.4, 1.5, 64, .45, .45], [-14, 32.4, -1.5, 64, .45, .45], [-14, 34.6, 1.5, 64, .4, .4], [-14, 34.6, -1.5, 64, .4, .4], [-14, 32.05, .9, 64, .25, .3], [-14, 32.05, -.9, 64, .25, .3]], latD = [];
      for (var bxp = -45, bk = 0; bxp <= 17; bxp += 3, bk++) {
        var sg = bk % 2 ? 1 : -1;
        lat.push([bxp, 33.5, 1.5, .22, 2.2, .22], [bxp, 33.5, -1.5, .22, 2.2, .22], [bxp, 34.6, 0, .2, .2, 3], [bxp, 32.4, 0, .18, .18, 3]);
        latD.push([bxp + 1.5, 33.5, 1.5, .15, 3.72, .15, 0, 0, sg * .938], [bxp + 1.5, 33.5, -1.5, .15, 3.72, .15, 0, 0, sg * .938], [bxp + 1.5, 34.6, 0, .12, 4.24, .12, 0, Math.PI / 2, sg * Math.PI / 4]);
      }
      K.inst(null, white, lat, g); K.inst(null, white, latD, g);
      box(10, .3, 5.4, white, 12, 34.95, 0, g); box(9, 4.2, 5, white, 12.5, 37.2, 0, g);
      box(.9, 2.2, .06, M(0x5A6470, { roughness: .5 }), 9, 36.2, 2.53, g); box(2.2, .8, 1.4, M(0xC9CFD5, { metalness: .4 }), 13.5, 39.7, -1, g);
      box(9.2, .14, 5.2, B(0x2673B5), 12.5, 39.2, 0, g);
      for (var mw = 0; mw < 4; mw++) box(1.2, .6, .05, M(0x15212C, { roughness: .1, metalness: .8 }), 9.8 + mw * 1.6, 37.9, 2.52, g);
      [[4, 1.5], [4, -1.5], [7, 1.5], [7, -1.5]].forEach(function (q) { K.rod(new T.Vector3(q[0], 34.8, q[1]), new T.Vector3(4, 46, 0), .24, white, g); });
      box(1.2, .6, 1.2, white, 4, 46, 0, g);
      K.rod(new T.Vector3(4, 46, 0), new T.Vector3(-40, 34.8, 0), .16, white, g); K.rod(new T.Vector3(4, 46, 0), new T.Vector3(-18, 34.8, 0), .16, white, g);
      K.rod(new T.Vector3(4, 46, 0), new T.Vector3(16, 35, 0), .18, white, g);
      var cr1 = cyl(1.3, 1.3, .7, 18, M(0x2A2F35, { roughness: .5 }), 14, 3.4, 9.4, g); cr1.rotation.z = Math.PI / 2;
      var dkM = M(0x2A2F35, { roughness: .5, metalness: .4 }), ylM = M(0xE0A42B, { roughness: .5 });
      var shipLX = slot.x - CR_X, trolley = new T.Group(); trolley.position.set(shipLX, 31.3, 0); g.add(trolley);
      box(3.2, 1.1, 3.4, dkM, 0, 0, 0, trolley); box(3.3, .12, 3.5, ylM, 0, .6, 0, trolley); box(.25, .25, .25, B(0xF0A020), 1.2, .75, 1.2, trolley);
      [-.8, .8].forEach(function (sx) { var sh2 = cyl(.4, .4, 1.4, 12, M(0x9AA4AE, { metalness: .7, roughness: .3 }), sx, -.6, 0, trolley); sh2.rotation.x = Math.PI / 2; });
      var cab = new T.Group(); cab.position.set(shipLX, 29.6, 2.2); g.add(cab);                        // operator cab (glazed floor + front)
      box(2.2, 2.2, 2.4, M(0xF2F3F4, { roughness: .4 }), 0, 0, 0, cab); box(2.25, 1.0, 2.0, M(0x15212C, { roughness: .08, metalness: .8 }), 0, -.1, -.25, cab);
      box(1.6, .05, 1.4, M(0x15212C, { roughness: .08, metalness: .8 }), 0, -1.12, -.2, cab); box(.4, 1.4, .1, dkM, 0, 1.6, 0, cab);
      // spreader: telescopic frame (20 ft), end beams with flippers, headblock with sheaves; group origin = frame centre
      var spreader = new T.Group(); g.add(spreader);
      box(2.3, .4, 6.06, ylM, 0, 0, 0, spreader); box(2.44, .3, .3, ylM, 0, 0, 2.88, spreader); box(2.44, .3, .3, ylM, 0, 0, -2.88, spreader);
      box(1.6, .6, 1.9, dkM, 0, .5, 0, spreader); box(.6, .3, .3, M(0x9AA4AE, { metalness: .6 }), 0, .9, 0, spreader);
      [[-1.36, -3.17], [1.36, -3.17], [-1.36, 3.17], [1.36, 3.17]].forEach(function (q) { box(.25, .45, .25, dkM, q[0], -.35, q[1], spreader); });   // flippers outside the box corners
      var ropes = [[-.8, -.7], [.8, -.7], [-.8, .7], [.8, .7]].map(function (q) { var r = cyl(.035, .035, 1, 4, M(0x1C232B), q[0], 0, q[1], g); r.userData.o = q; return r; });
      var fest = []; for (var fx = -44; fx < 14; fx += 2.2) fest.push([fx, 31.7 - (Math.abs(fx) % 4.4 < 2.2 ? .25 : 0), -2.4, 1, 1, 1, 0, Math.PI]);
      K.inst(new T.TorusGeometry(.45, .05, 4, 10, Math.PI), M(0x1C232B, { roughness: .7 }), fest, g);
      var lamps = []; for (var lx = -44; lx < 16; lx += 8) lamps.push([lx, 31.82, 2.1, .6, .2, .6], [lx, 31.82, -2.1, .6, .2, .6]);   // under the boom, beside the trolley path
      K.inst(null, B(0xFFF2CC), lamps, g);
      var bog = [], rails = [], louv = [];
      [[-2, -8], [-2, 8], [14, -8], [14, 8]].forEach(function (q) { [-1, 1].forEach(function (sd) { for (var wb = 0; wb < 4; wb++) bog.push([q[0] + sd * .7, .45, q[1] - 1.2 + wb * .8, .45, .3, .45, 0, 0, Math.PI / 2]); }); });
      K.inst(new T.CylinderGeometry(1, 1, 1, 12), M(0x16191C, { roughness: .8 }), bog, g);
      box(1.2, 1, 17, blue, -2, 2.1, 0, g); box(1.2, 1, 17, blue, 14, 2.1, 0, g);
      var px = box(.45, 20, .45, blue, -2, 20, 0, g); px.rotation.x = .72; var px2 = box(.45, 20, .45, blue, -2, 20, 0, g); px2.rotation.x = -.72;
      for (var rx = -45; rx < 7; rx += 2.5) { rails.push([rx, 35.3, 1.5, .06, 1, .06]); rails.push([rx, 35.3, -1.5, .06, 1, .06]); }
      rails.push([-19, 35.8, 1.5, 52, .06, .06]); rails.push([-19, 35.8, -1.5, 52, .06, .06]);
      K.inst(null, M(0xEEF1F4, { metalness: .5, roughness: .4 }), rails, g);
      for (var st = 0; st < 10; st++) box(1.4, .08, .5, M(0x9AA4AE, { metalness: .6, roughness: .4 }), 12.6, 1.5 + st * 2.8, 7.4 - (st % 2) * 1.2, g);
      box(.08, 28, .08, M(0x9AA4AE, { metalness: .6, roughness: .4 }), 11.9, 15, 7.4, g);
      for (var lv = 0; lv < 5; lv++) louv.push([17.05, 35.8 + lv * .6, 0, .06, .12, 4]);
      K.inst(null, M(0xC9CFD5, { metalness: .5, roughness: .4 }), louv, g);
      box(.5, .5, .5, B(0xFF3B30), 4, 46.3, 0, g);
      g.position.set(CR_X, 0, zc); scene.add(g);
      // terminal tractor parked under the portal, and the box this crane moves
      var tt = ttruck(0xE0A42B); tt.position.set(CR_X + TRUCK_LX, 0, zc + 2.05); scene.add(tt);
      var box1 = contMesh(slot.col, 20); scene.add(box1);
      return { g: g, trolley: trolley, cab: cab, spreader: spreader, ropes: ropes, box1: box1, zc: zc, ph: zc * .37 + 40,
        shipX: shipLX, shipY: slot.y + CH + .2, truckX: TRUCK_LX, truckY: TT_DECK + CH + .2, slot: slot };
    }
    /* terminal tractor (yard truck): offset one-man cab, engine hood, hydraulic fifth wheel, beacon, plus a 40 ft yard
       chassis (gooseneck, rails, cross members, bolsters with twistlocks; deck 1.32 m, slot centre z -2.05). +z forward. */
    var ttG = (function () {
      var b = K.builder(), D = 0x22272C, TR = 0x16191C, ST = 0x9AA4AE;
      b.box(1.4, .5, 5.0, 0xffffff, 0, .85, 6.1, 'p');                                                   // tractor frame
      b.box(1.15, 1.75, 1.6, 0xffffff, -.55, 2.0, 7.55, 'p'); b.box(1.17, .85, 1.62, 0x18222C, -.55, 2.35, 7.55, 'g'); b.box(1.3, .1, 1.75, 0xDCE1E5, -.55, 2.92, 7.55, 's');
      b.box(1.0, .75, 1.7, 0xffffff, .62, 1.45, 7.65, 'p'); b.box(.9, .05, 1.5, D, .62, 1.84, 7.65);      // engine hood
      b.cyl(.07, .07, 1.6, 8, 0xC9CFD5, .95, 2.2, 6.7, 's');                                             // exhaust
      b.box(1.6, .2, 1.4, 0x3A4148, 0, 1.2, 4.7, 's'); b.cyl(.12, .12, .7, 8, ST, 0, .9, 5.4, 's', .6);  // fifth wheel + ram
      b.box(.4, .14, .06, 0xFFF4D8, -.7, 1.0, 8.62, 'e'); b.box(.4, .14, .06, 0xFFF4D8, .7, 1.0, 8.62, 'e'); b.box(2.3, .2, .12, D, 0, .7, 8.62, 'm');
      b.box(.2, .2, .2, 0xF0A020, -.55, 3.03, 7.55, 'e');                                                  // beacon
      function wheel(x, z, r, w) { b.cyl(r, r, w, 16, TR, x, r, z, 'm', 0, 0, Math.PI / 2); b.cyl(r * .55, r * .55, w + .03, 12, ST, x, r, z, 's', 0, 0, Math.PI / 2); }
      [-1, 1].forEach(function (s) {
        wheel(s * 1.0, 7.4, .55, .35); wheel(s * 1.2, 4.7, .55, .32); wheel(s * .86, 4.7, .55, .32);
        b.box(.7, .06, 1.4, D, s * 1.03, 1.2, 4.7, 'm');                                                  // mudguards
        b.box(.3, .35, 12.6, D, s * .55, 1.0, -2.2, 'm');                                                 // chassis rails
        wheel(s * 1.13, -5.9, .5, .28); wheel(s * .82, -5.9, .5, .28); wheel(s * 1.13, -7.1, .5, .28); wheel(s * .82, -7.1, .5, .28);
        b.box(.36, .13, .05, 0xC2272D, s * 1.0, .95, -8.62, 'e');
      });
      b.box(2.2, .3, 1.5, D, 0, 1.45, 4.9, 'm');                                                           // gooseneck on the fifth wheel
      for (var cm = 3.0; cm > -8.4; cm -= 1.4) b.box(1.5, .1, .14, D, 0, 1.12, cm, 'm');
      [4.0, -2.05, -8.1].forEach(function (z) { b.box(2.44, .14, .26, D, 0, 1.25, z, 'm'); [-1.1, 1.1].forEach(function (x) { b.box(.15, .08, .15, ST, x, 1.36, z, 's'); }); });
      b.box(2.2, .14, .14, D, 0, .62, -8.55, 'm');
      return b.build();
    })();
    function ttruck(color) { var g = K.meshes(ttG, false, M(color, { vertexColors: true, roughness: .4, metalness: .3 })); g.userData.len = 17.3; return g; }
    var cranes = CRANE_Z.map(function (zc, k) { return stsCrane(zc, craneSlot[k]); });
    // lashers / quay crew in PPE under each crane: one walks the lashing lane, one stands by with a radio
    var crew = [];
    cranes.forEach(function (c, k) {
      var walker = K.person(0x2B4A6E, { vest: 0xF08A2B, helmet: 0xF2F3F4, boots: true, gloves: 0x3A3A3A, pants: 0x2B4A6E, seed: k * 3 }); scene.add(walker);
      crew.push({ p: walker, z0: c.zc, ph: k * 2.1 });
      if (!MOB) { var st = K.person(0xE6E9EC, { vest: 0xE5F23A, helmet: 0xE0A42B, boots: true, pants: 0x2A2F35, seed: k * 3 + 1 }); st.position.set(-38.6, 0, c.zc + 2.2); st.rotation.y = -Math.PI / 2 - .3; st.userData.arms[1].rotation.x = -1.3; st.userData.elbows[1].rotation.x = -1.6; scene.add(st); }
    });

    /* ---------- container yard: blocks of 20 ft and 40 ft columns on a 2.9 m × 6.6 m grid. A 40 ft column spans two
       20 ft slots and only stacks on 40 ft boxes; every tier sits exactly on the one below (pitch = box height). ---------- */
    var yard = [], rows = MOB ? 4 : 6, nb = MOB ? 6 : 9;
    var blocks = [[-16, -110], [-16, -50], [20, -110], [20, -50]];
    blocks.forEach(function (blk, bi) {
      for (var r = 0; r < rows; r++) for (var b2 = 0; b2 < nb; b2 += 2) {
        var x = blk[0] + r * 2.9, z0 = blk[1] + b2 * 6.6, h1 = (r * 5 + b2 * 3 + bi * 2) % 5;
        if (b2 + 1 < nb && (r * 2 + b2 + bi) % 3 === 0) { for (var t = 0; t < 1 + h1 % 4; t++) yard.push([x, t * CH, z0 + 3.3, r + b2 + t + bi, 40]); }
        else for (var s = 0; s < 2 && b2 + s < nb; s++) { var tt = 1 + (h1 + s * 3) % 4; for (var t2 = 0; t2 < tt; t2++) yard.push([x, t2 * CH, z0 + s * 6.6, r * 3 + b2 + s + t2 + bi, 20]); }
      }
    });
    // reefer row east of Block D (two tiers of white boxes) with its rack, plug leads and status LEDs
    var nRf = MOB ? 5 : 9, plugs = [], ledsG = [], ledsR = [];
    for (var rf = 0; rf < nRf; rf++) {
      var rz = -50 + rf * 6.6; yard.push([42, 0, rz, 5, 20], [42, CH, rz, 5, 20]);
      plugs.push([44.4, 1.6, rz, .5, 3.2, .5]);
      (rf % 3 ? ledsG : ledsR).push([44.68, 2.6, rz, .1, .18, .18]); ledsG.push([44.68, 2.2, rz + .3, .1, .14, .14]);
    }
    var rkCol = [], rkDeck = [], rkRail = [], rkGrille = [], rkLead = [];
    for (var rk = 0; rk <= nRf; rk++) { var czr = -53.3 + rk * 6.6; rkCol.push([45.4, 3.5, czr, .22, 7, .22], [46.9, 3.5, czr, .22, 7, .22]); }
    for (var rk2 = 0; rk2 < nRf; rk2++) {
      var rz3 = -50 + rk2 * 6.6;
      [CH, 2 * CH].forEach(function (dy) { rkDeck.push([46.15, dy, rz3, 1.5, .08, 6.6]); rkRail.push([46.9, dy + .55, rz3, .05, .05, 6.6], [46.9, dy + 1.05, rz3, .05, .05, 6.6]); });
      [CH / 2, CH * 1.5].forEach(function (gy) { rkGrille.push([43.27, gy, rz3 + 2.2, .06, 2, 1.3]); rkLead.push([43.85, gy + 1.05, rz3 + 2.2, 1.15, .05, .05]); });
    }
    K.inst(null, M(0x9AA4AE, { metalness: .6, roughness: .4 }), rkCol.concat(rkRail)); K.inst(null, M(0x6E7A86, { metalness: .5, roughness: .5 }), rkDeck);
    K.inst(null, M(0x3A4148, { roughness: .6 }), rkGrille); K.inst(null, M(0x1C232B), rkLead);
    var stair = box(1.2, .1, 4.4, M(0x6E7A86, { metalness: .5 }), 46.15, CH / 2, -55.6); stair.rotation.x = -Math.atan(CH / 4);
    K.inst(null, M(0x9AA4AE, { metalness: .6, roughness: .4 }), plugs);
    K.inst(null, B(0x5BE38A), ledsG);
    var ledRedM = B(0xFF4A3D); K.inst(null, ledRedM, ledsR);
    [['BLOCK A', -9, -110], ['BLOCK C', -9, -50], ['BLOCK B', 27, -110], ['BLOCK D', 27, -50]].forEach(function (q) {
      var p = new T.Mesh(new T.PlaneGeometry(9, 1.4), B(0xffffff, { map: K.titleBoard([q[0]]) }));
      box(9.6, 1.9, .3, M(0x1C2733), q[1], 13, q[2] - 6);
      p.position.set(q[1], 13, q[2] - 5.8); scene.add(p);
      cyl(.18, .18, 12, 8, M(0xA9B3BD, { metalness: .6, roughness: .35 }), q[1], 6, q[2] - 6);
    });
    /* ---------- rail siding (east): ballast, sleepers, rails, buffer stop, flat wagons with boxes; empties depot
       and reach stackers working the train (static, booms raised clear of the wagons) ---------- */
    var RX = 50;
    box(3.8, .2, 146, M(0xA39C92, { roughness: 1 }), RX, .1, -78);
    var slp = []; for (var sz2 = -150; sz2 < -6; sz2 += MOB ? 1.4 : .7) slp.push([RX, .25, sz2, 2.6, .1, .24]);
    K.inst(null, M(0x6B5544, { roughness: .9 }), slp);
    box(.1, .16, 146, railM, RX - .75, .38, -78); box(.1, .16, 146, railM, RX + .75, .38, -78);
    box(3, 1.2, .5, M(0xB3261E, { roughness: .5 }), RX, .9, -5.4); box(3.2, .12, .55, B(0xF2F4F6), RX, 1.3, -5.4);
    var wagM = M(0x3A4652, { roughness: .6, metalness: .4 }), wagPart = [], wagWh = [];
    for (var wg2 = 0; wg2 < (MOB ? 3 : 6); wg2++) {
      var wz = -140 + wg2 * 14;
      box(2.7, .3, 13, wagM, RX, 1.15, wz);
      wagPart.push([RX, .78, wz - 4.6, 2.2, .45, 2.4], [RX, .78, wz + 4.6, 2.2, .45, 2.4], [RX, 1.05, wz - 6.75, .4, .3, .6], [RX, 1.05, wz + 6.75, .4, .3, .6]);
      [-4.6, 4.6].forEach(function (bo) { [-.9, .9].forEach(function (wo) { [-.75, .75].forEach(function (xo) { wagWh.push([RX + xo, .5, wz + bo + wo, .42, .14, .42, 0, 0, Math.PI / 2]); }); }); });
      if ((wg2 + 1) % 3) { if (wg2 % 2) yard.push([RX, 1.3, wz, wg2 * 2 + 1, 40]); else yard.push([RX, 1.3, wz - 3.15, wg2 * 2 + 1, 20], [RX, 1.3, wz + 3.15, wg2 * 3 + 4, 20]); }
    }
    K.inst(null, wagM, wagPart); K.inst(new T.CylinderGeometry(1, 1, 1, 12), M(0x16191C, { roughness: .8 }), wagWh);
    if (!MOB) for (var dr = 0; dr < 2; dr++) for (var db = 0; db < 3; db++) for (var dt3 = 0; dt3 < 2 + (dr + db) % 3; dt3++) yard.push([60 + dr * 2.9, dt3 * CH, -128 + db * 6.6, dr + db * 2 + dt3 + 5, 20]);
    stacks(yard);
    function reach(x, z, rot, ang, col) {
      var g = new T.Group(), body = M(0xC4572E, { roughness: .45, metalness: .3 }), dk2 = M(0x2A2F35, { roughness: .5, metalness: .4 }), tyre = M(0x16191C, { roughness: .85 });
      box(3.2, 1.3, 7.4, body, 0, 1.5, 0, g); box(3.4, 1.7, 1.6, body, 0, 2.0, -3.6, g);
      box(1.5, 1.9, 1.7, M(0xF2F3F4, { roughness: .4 }), -.95, 3.1, -.6, g); box(1.55, .95, 1.75, M(0x15212C, { roughness: .08, metalness: .8 }), -.95, 3.45, -.6, g);
      box(1.3, .9, 2.6, body, .95, 2.6, -2.2, g); box(.3, .9, .3, dk2, 1.3, 3.4, -3, g);
      [[-1.3, 2.3, .85], [1.3, 2.3, .85], [-1.85, 2.3, .85], [1.85, 2.3, .85], [-1.4, -2.6, .72], [1.4, -2.6, .72]].forEach(function (q) { var w4 = cyl(q[2], q[2], .55, 14, tyre, q[0], q[2], q[1], g); w4.rotation.z = Math.PI / 2; var rm = cyl(q[2] * .5, q[2] * .5, .58, 10, M(0x9AA4AE, { metalness: .6 }), q[0], q[2], q[1], g); rm.rotation.z = Math.PI / 2; });
      var boom = new T.Group(); boom.position.set(.55, 3.2, -2.6); boom.rotation.x = -ang; g.add(boom);
      box(.9, .9, 8, body, 0, 0, 4, boom); box(.7, .7, 3.6, M(0xE0A42B, { roughness: .5 }), 0, 0, 9.6, boom);
      var tip = new T.Vector3(.55, 3.2 + Math.sin(ang) * 11.2, -2.6 + Math.cos(ang) * 11.2);
      K.rod(new T.Vector3(.55, 1.9, .8), new T.Vector3(.55, 3.2 + Math.sin(ang) * 4.5, -2.6 + Math.cos(ang) * 4.5), .2, dk2, g);
      box(.8, .9, .8, dk2, tip.x, tip.y - .6, tip.z, g);
      box(6.2, .35, 2.5, M(0xE0A42B, { roughness: .5 }), tip.x, tip.y - 1.2, tip.z, g);
      var cb = contMesh(col, 20); cb.position.set(tip.x, tip.y - 1.375 - CH / 2, tip.z); cb.rotation.y = Math.PI / 2; g.add(cb);
      g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g); return g;
    }
    reach(58.5, -92, -Math.PI / 2, .5, 4); if (!MOB) reach(58.5, -58, -Math.PI / 2, .32, 10);
    // RTG gantry cranes straddling the blocks (legs 2.3 m outside the outer rows; the east leg clear of the truck lane):
    // rubber tyres with rims on bogies, sill beams, bracing, engine house, ladder, cab, trolley and a four-rope spreader
    function rtg(blk) {
      var g = new T.Group(), y = M(0xE0A42B, { roughness: .5, metalness: .35 }), span = rows * 2.9 + 1.5, tyre = M(0x16191C, { roughness: .8 }), rimM = M(0x9AA4AE, { metalness: .6, roughness: .35 });
      [[-1.6, -3.4], [-1.6, 3.4], [span - 1.4, -3.4], [span - 1.4, 3.4]].forEach(function (q) {
        box(.7, 17, .7, y, q[0], 9.1, q[1], g);
        [-.9, .9].forEach(function (o) { var wh = cyl(.6, .6, .5, 16, tyre, q[0], .6, q[1] + o, g); wh.rotation.z = Math.PI / 2; var rm = cyl(.34, .34, .53, 12, rimM, q[0], .6, q[1] + o, g); rm.rotation.z = Math.PI / 2; });
        box(.8, .5, 2.8, y, q[0], 1.45, q[1], g);
      });
      box(.5, .5, 6.8, y, -1.6, 2.2, 0, g); box(.5, .5, 6.8, y, span - 1.4, 2.2, 0, g);
      box(.3, 9, .3, y, -1.6, 8, 0, g).rotation.x = .75; box(.3, 9, .3, y, span - 1.4, 8, 0, g).rotation.x = -.75;
      box(1.4, 1.2, 2, M(0x9AA4AE, { metalness: .5 }), -1.6, 15.2, -2.2, g);
      for (var sp = 0; sp < 6; sp++) box(.9, .06, .4, M(0x9AA4AE, { metalness: .6 }), span - .7, 1 + sp * 2.3, 3.4 - (sp % 2) * .5, g);
      box(span + .6, 1.2, .9, y, span / 2 - 1.5, 17.4, -3.4, g); box(span + .6, 1.2, .9, y, span / 2 - 1.5, 17.4, 3.4, g);
      box(.9, 1.6, 7.6, y, -1.6, 15.8, 0, g); box(.9, 1.6, 7.6, y, span - 1.4, 15.8, 0, g);
      box(2.4, 2, 2.4, M(0xF2F3F4, { roughness: .4 }), span - 2.8, 13.6, 2.4, g); box(2.45, .9, 2.45, M(0x15212C, { roughness: .08, metalness: .8 }), span - 2.8, 13.9, 2.4, g);
      var tro = box(2.6, 1, 3.4, M(0x2A2F35, { roughness: .5 }), 3, 18.4, 0, g);
      var spr = new T.Group(); spr.position.set(3, 12, 0); g.add(spr);
      box(2.3, .35, 6.06, M(0xE0A42B, { roughness: .45 }), 0, 0, 0, spr); box(1.2, .4, 1.4, M(0x2A2F35, { roughness: .5 }), 0, .35, 0, spr);
      var ropes = [[-.7, -.6], [.7, -.6], [-.7, .6], [.7, .6]].map(function (q) { var r = cyl(.03, .03, 1, 4, M(0x1C232B), 3 + q[0], 15, q[1], g); r.userData.o = q; return r; });
      g.position.set(blk[0] - .7, 0, blk[1] + 20); scene.add(g);
      return { g: g, tro: tro, spr: spr, ropes: ropes, span: span, z0: blk[1] + 8, z1: blk[1] + nb * 6.6 - 8, ph: blk[1] * .03 };
    }
    var rtgs = MOB ? [rtg(blocks[1])] : [rtg(blocks[1]), rtg(blocks[2])];
    // straddle carriers run in their own aisles (between the crane legs and Block A/C, and between Block B/D and
    // the reefer row), never over the stacks; carriers in one aisle keep a fixed spacing
    function straddle(x, z) {
      var g = new T.Group(), y = M(0xE0A42B, { roughness: .5, metalness: .3 }), tyre = M(0x16191C, { roughness: .8 });
      [[-1.7, -2.6], [1.7, -2.6], [-1.7, 2.6], [1.7, 2.6]].forEach(function (q) {
        box(.5, 9.5, .5, y, q[0], 4.75, q[1], g);
        var wh = cyl(.6, .6, .5, 14, tyre, q[0], .6, q[1], g); wh.rotation.z = Math.PI / 2;
        var rm = cyl(.33, .33, .53, 10, M(0x9AA4AE, { metalness: .6 }), q[0], .6, q[1], g); rm.rotation.z = Math.PI / 2;
        box(.7, .7, 1.4, y, q[0], 1.1, q[1], g);
      });
      box(.5, .6, 5.8, y, -1.7, 1.6, 0, g); box(.5, .6, 5.8, y, 1.7, 1.6, 0, g);
      box(4.4, .8, 6, y, 0, 9.6, 0, g); box(2.2, 1.6, 2, M(0xEEF1F4, { roughness: .4 }), 1.2, 10.8, 2.2, g);
      box(2.25, .7, 2.05, M(0x15212C, { roughness: .08, metalness: .8 }), 1.2, 11, 2.2, g);
      box(1.6, 1, 2.4, M(0x9AA4AE, { metalness: .5 }), -1, 10.5, -1.6, g);
      box(.3, 6, .3, y, -1.7, 6, 0, g); box(.3, 6, .3, y, 1.7, 6, 0, g);
      box(.2, .2, .2, B(0xF0A020), -1.7, 10.2, 3, g); box(.2, .2, .2, B(0xF0A020), 1.7, 10.2, 3, g);
      var spr = box(3.2, .3, 6.2, M(0x2A2F35, { roughness: .5 }), 0, 4, 0, g);
      var box1 = contMesh(1, 20); box1.position.set(0, 4 - .15 - CH / 2, 0); g.add(box1);
      g.position.set(x, 0, z); scene.add(g); return { g: g, spr: spr, box1: box1 };
    }
    var carriers = MOB ? [straddle(-20.8, -60)] : [straddle(-20.8, -95), straddle(-20.8, -40), straddle(38.25, -27)];
    var CAR_PATH = MOB ? [[-60, 22]] : [[-95, 22], [-40, 22], [-27, 17]];
    // high-mast light towers with lamp rings (outside the blocks and the RTG/carrier paths)
    var lampRing = B(0xFFF2CC), floodH = [], floodF = [];
    [[-12, 14], [32, -120], [-6, -128], [36, 8]].forEach(function (q, k) {
      if (MOB && k > 1) return;
      cyl(.35, .6, 30, 10, M(0x9AA4AE, { metalness: .6, roughness: .4 }), q[0], 15, q[1]);
      var ring = new T.Mesh(K.geo('lampRing', function () { return new T.TorusGeometry(1.6, .28, 6, 18); }), lampRing); ring.rotation.x = Math.PI / 2; ring.position.set(q[0], 30, q[1]); scene.add(ring);
      box(3.6, .2, 3.6, M(0x5A6470, { metalness: .5 }), q[0], 29.4, q[1]);
      for (var fh = 0; fh < 8; fh++) { var fa = fh * Math.PI / 4, ry = Math.atan2(Math.cos(fa), Math.sin(fa)); floodH.push([q[0] + Math.cos(fa) * 2, 30.3, q[1] + Math.sin(fa) * 2, .9, .55, .3, ry]); floodF.push([q[0] + Math.cos(fa) * 2.17, 30.3, q[1] + Math.sin(fa) * 2.17, .8, .45, .04, ry]); }
      floodH.push([q[0] + .75, 15, q[1], .06, 28, .06], [q[0] + .75, 15, q[1] + .45, .06, 28, .06]);
    });
    K.inst(null, M(0x3A4148, { roughness: .5, metalness: .5 }), floodH); K.inst(null, B(0xFFF2CC), floodF);

    /* ---------- gate complex: canopy over 4 lanes, booths, barriers, lane cameras ---------- */
    var gate = new T.Group(), canM = M(0xEEF1F4, { roughness: .45, metalness: .25 }), steel = M(0x9AA4AE, { metalness: .6, roughness: .4 });
    box(34, 1, 12, canM, 0, 8, 0, gate);
    box(34.4, .5, .2, B(0x2673B5), 0, 7.3, 6.05, gate);
    [-17, -8.5, 0, 8.5, 17].forEach(function (x) { box(.6, 8, .6, steel, x, 4, -4, gate); box(.6, 8, .6, steel, x, 4, 4, gate); });
    var gateBoard = new T.Mesh(new T.PlaneGeometry(16, 1.6), B(0xffffff, { map: K.titleBoard(['TRUCK GATE · IN']) })); gateBoard.position.set(0, 9.4, 6.1); gate.add(gateBoard);
    box(16.6, 2.1, .3, M(0x1C2733), 0, 9.4, 5.9, gate);
    var laneX = [-12.75, -4.25, 4.25, 12.75], arms = [], boothPart = [], boothGl = [], boothBand = [], isl = [], boothScr = [];
    var stripes = K.canvasTex(256, 16, function (x2, w, h) { for (var i = 0; i < 8; i++) { x2.fillStyle = i % 2 ? '#D6453D' : '#FFFFFF'; x2.fillRect(i * 32, 0, 32, h); } });
    var stripeM = M(0xffffff, { map: stripes, roughness: .5 });
    laneX.forEach(function (x, li) {
      if (li < 3) {
        box(1.6, .3, 10, M(0xE8B83A, { roughness: .6 }), x + 4.25, .15, 0, gate);
        box(1.4, 2.6, 2, M(0xF1F3F5, { roughness: .6 }), x + 4.25, 1.6, 1.5, gate);
        box(1.2, 1, .05, M(0x9DB8CF, { roughness: .08, metalness: .6 }), x + 4.25, 2, 2.53, gate);
        boothPart.push([x + 4.25, 3.0, 1.5, 1.9, .2, 2.5], [x + 4.25, 1.5, .48, .7, 2, .05], [x + 4.25, 3.35, 1.9, .5, .5, .9]);
        boothGl.push([x + 3.53, 2, 1.6, .05, 1, 1.5], [x + 4.97, 2, 1.6, .05, 1, 1.5]); boothBand.push([x + 4.25, 2.86, 1.5, 1.92, .1, 2.52]);
        isl.push([x + 4.25, .6, -5.4, .2, 1.2, .2], [x + 4.25, .6, 5.4, .2, 1.2, .2], [x + 3.7, .6, -4.9, .2, 1.2, .2], [x + 4.8, .6, -4.9, .2, 1.2, .2]);
        boothPart.push([x + 3.65, .75, 4.6, .3, 1.5, .3]); boothScr.push([x + 3.49, 1.25, 4.6, .02, .3, .22]);
      }
      var arm = new T.Group(); arm.position.set(x + 3.3, 1.1, -1); gate.add(arm);
      box(.45, 1.05, .45, M(0xE0A42B, { roughness: .5 }), x + 3.3, .52, -1, gate);
      var bar = K.cs(new T.Mesh(new T.BoxGeometry(6, .12, .12), stripeM)); bar.position.x = -3; arm.add(bar);
      arms.push(arm);
      var c = K.camModel(gate, 1.05); c.position.set(x, 6.9, 5.6); c.rotation.order = 'YXZ'; c.rotation.y = Math.PI; c.rotation.x = -.42;
      var ln = new T.Mesh(new T.PlaneGeometry(2.4, 1), B(0xffffff, { map: K.titleBoard([String(li + 1)]) })); ln.position.set(x, 7.2, 6.12); gate.add(ln);
      // lane status light (green when open)
      var sl = box(.5, .5, .2, B(0x5BE38A), x - 2.4, 6.6, 6.1, gate); arm.userData.light = sl;
    });
    K.inst(null, M(0xDCE1E5, { roughness: .5 }), boothPart, gate); K.inst(null, M(0x9DB8CF, { roughness: .08, metalness: .6 }), boothGl, gate);
    K.inst(null, B(0x2673B5), boothBand, gate); K.inst(new T.CylinderGeometry(1, 1, 1, 10), M(0xE0B04A, { roughness: .5 }), isl, gate); K.inst(null, B(0x2A5A8A), boothScr, gate);
    // canopy soffit lights, weighbridge plates + lane stop bars, speed humps outside, OCR portal frame upstream
    var soff = [], plates = [], humps = [];
    laneX.forEach(function (x) {
      for (var sz = -3; sz <= 3; sz += 3) soff.push([x, 7.45, sz, 2.6, .06, .5]);
      plates.push([x, .04, 6, 3.2, .06, 9]);
      humps.push([x, .06, 16, 3.6, .12, .7]);
    });
    K.inst(null, B(0xFFFBF0), soff, gate); K.inst(null, M(0x8E959C, { metalness: .6, roughness: .5 }), plates, gate);
    K.inst(null, M(0xE0B04A, { roughness: .7 }), humps, gate);
    var stopBars = laneX.map(function (x) { return [x, .07, 2.4, 3.4, .02, .35]; }); K.inst(null, B(0xF5F5F0), stopBars, gate);
    var portal = M(0xD9DEE2, { metalness: .5, roughness: .4 });
    box(.5, 7.6, .5, portal, -18, 3.8, 12, gate); box(.5, 7.6, .5, portal, 18, 3.8, 12, gate); box(36.5, .6, .6, portal, 0, 7.6, 12, gate);
    laneX.forEach(function (x) { var oc = K.camModel(gate, .8); oc.position.set(x, 7.1, 12.2); oc.rotation.order = 'YXZ'; oc.rotation.y = Math.PI; oc.rotation.x = -.5; });
    var portBoard = new T.Mesh(new T.PlaneGeometry(10, 1), B(0xffffff, { map: K.titleBoard(['OCR PORTAL · SLOW']) })); portBoard.position.set(0, 8.5, 12.35); gate.add(portBoard);
    box(10.4, 1.3, .2, M(0x1C2733), 0, 8.5, 12.2, gate);
    gate.position.set(0, 0, 46); scene.add(gate);
    // gate checker (hi-vis vest, helmet): steps off the island to the stopped truck's cab, then back to the booth
    var checker = K.person(0x2B4A6E, { vest: true, helmet: 0xF2F3F4, boots: true, gloves: 0x3A3A3A, pants: 0x2B4A6E, seed: 9 }); scene.add(checker);
    var CHK_HOME = new T.Vector3(8.1, .3, 49.2), CHK_CAB = new T.Vector3(6.15, .06, 49.6);
    var chk = { t: 0, phase: 'home' }, gateSt = { s: null, a: 0 };
    var laneCone = K.viewCone(new T.Vector3(4.25, 6.9, 51.6), new T.Vector3(4.25, .5, 66), 16, 3.4);
    var fence = [];
    for (var fx2 = -70; fx2 <= 70; fx2 += 3) if (Math.abs(fx2) > 18) fence.push([fx2, 1.3, 46, .08, 2.6, .08]);
    K.inst(null, steel, fence);
    box(52, .08, .08, steel, -44, 2.5, 46); box(52, .08, .08, steel, 44, 2.5, 46);

    /* ---------- operations building with the Cygnus 3×3 wall + playback timeline ---------- */
    var ops = new T.Group();
    var owp = K.windowPair(6, 2, false, 5), cladM = M(0xF2F4F6, { roughness: .6 });
    box(18, 6, 14, M(0xF2F4F6, { map: owp.map, emissive: 0xffffff, emissiveMap: owp.emissive, emissiveIntensity: .25, roughness: .55 }), 0, 9.1, 0, ops); // upper floors
    box(18.6, .5, 14.6, M(0xDCE1E5), 0, 12.2, 0, ops);
    box(.5, 6.1, 14, cladM, -8.75, 3.05, 0, ops); box(.5, 6.1, 14, cladM, 8.75, 3.05, 0, ops); box(18, 6.1, .5, cladM, 0, 3.05, 6.75, ops);
    box(18.4, .7, .9, M(0xDCE1E5, { roughness: .5 }), 0, 6.05, -7.05, ops); box(18.5, .14, .95, B(0x2673B5), 0, 5.66, -7.05, ops); // facade head + blue band
    box(19, .3, 15, M(0xBFC6CD, { roughness: .8 }), 0, -.1, 0, ops);
    var TL = 'img/real/tiles/';
    var wall = K.videoWall([
      { src: TL + 't8-port.jpg', label: 'GATE 1' }, { src: TL + 't8-port.jpg', label: 'GATE 2', crop: [0, .3, .65, .65] },
      { src: TL + 't8-port.jpg', label: 'GATE 3', crop: [.35, .3, .65, .65] }, { src: TL + 't9-warehouse.jpg', label: 'CFS SHED' },
      { src: TL + 't8-port.jpg', label: 'BERTH 2', crop: [0, 0, .6, .6] }, { src: TL + 't8-port.jpg', label: 'QUAY', crop: [.4, 0, .6, .6] },
      { src: TL + 't1-corridor.jpg', label: 'APPROACH ROAD' }, { src: TL + 't9-warehouse.jpg', label: 'YARD · BLOCK C', crop: [.2, .2, .7, .7] },
      { src: TL + 't8-port.jpg', label: 'BERTH 3', crop: [.2, .1, .6, .6] }]);
    // gate operations room on the ground floor, open to the yard behind frameless glazing (no columns inside):
    // curved 3×3 bezelled wall, curved console of desks with twin monitors, chairs and operators, ceiling panels
    var room = K.controlRoom({ wall: wall, w: 17, d: 10, h: 6, seats: MOB ? 3 : 5, wallW: 7.8, spread: .17, deskZ: 3, row2: MOB ? 0 : 2 });
    room.rotation.y = Math.PI; ops.add(room);
    var tlC = document.createElement('canvas'); tlC.width = 1024; tlC.height = 72;
    var tlT = new T.CanvasTexture(tlC); tlT.encoding = T.sRGBEncoding; var tlLast = -1;
    function drawTimeline(u) {
      var q = Math.round(u * 200); if (q === tlLast) return; tlLast = q;
      var x = tlC.getContext('2d'); x.fillStyle = '#0B1520'; x.fillRect(0, 0, 1024, 72);
      x.fillStyle = '#1F3449'; x.fillRect(150, 30, 840, 12); x.fillStyle = '#2673B5'; x.fillRect(150, 30, 840 * u, 12);
      [.18, .44, .73].forEach(function (m) { x.fillStyle = '#F0B44C'; x.fillRect(150 + 840 * m - 3, 22, 6, 28); });
      x.fillStyle = '#fff'; x.beginPath(); x.arc(150 + 840 * u, 36, 11, 0, 7); x.fill();
      x.fillStyle = '#DCEBF7'; x.font = '700 24px "Geist Mono",monospace'; x.fillText('▶ BERTH 2', 12, 45);
      tlT.needsUpdate = true;
    }
    drawTimeline(.3);
    var tlMesh = new T.Mesh(new T.PlaneGeometry(4.8, .34), B(0xffffff, { map: tlT })); tlMesh.position.set(0, .55, 4.18); tlMesh.rotation.y = Math.PI; ops.add(tlMesh);
    var opsBoard = new T.Mesh(new T.PlaneGeometry(10, 1.3), B(0xffffff, { map: K.titleBoard(['GATE OPERATIONS']) })); opsBoard.position.set(0, 11.9, -7.45); opsBoard.rotation.y = Math.PI; ops.add(opsBoard);
    ops.position.set(36, 0, 30); ops.rotation.y = Math.PI / 2 + .25; scene.add(ops);

    /* ---------- berth camera on the quay (the one that drops its stream) + yard cameras ---------- */
    var berthTarget = new T.Vector3(-58, 8, -40);
    var berthCam = K.poleCam(-36, -30, 14, berthTarget);
    var berthCone = K.viewCone(new T.Vector3(-36, 13.8, -30), berthTarget, 30, 9);
    [[1.4, -118, -8, -100], [40, -76, 28, -92], [1.4, 12, -6, 0]].forEach(function (q) { K.poleCam(q[0], q[1], 12, new T.Vector3(q[2], 0, q[3])); });
    for (var lz = -140; lz < 40; lz += 30) K.streetLight(12.5, lz, Math.PI / 2 * 3);

    /* ---------- trucks: gate truck and queue (road tractors with a 20 ft box on a skeletal chassis), yard traffic
       (terminal tractors with 40 ft boxes on yard chassis) ---------- */
    function roadTruck(color, c) { var t = K.truck(color, 'chassis'), cb = contMesh(c, 20); cb.position.set(0, t.userData.deckY + CH / 2, t.userData.deckZ); t.add(cb); return t; }
    var gateTruck = roadTruck(0xF2F3F4, 1); scene.add(gateTruck);
    var yardTrucks = [], nY = MOB ? 2 : 5;
    for (var yt = 0; yt < nY; yt++) {
      var tk = ttruck([0xE0A42B, 0x2B5C9E, 0xF2F3F4][yt % 3]), yc = contMesh(yt * 3 + 2, 40); yc.position.set(0, TT_DECK + CH / 2, -2.05); tk.add(yc);
      var d = yt % 2 ? 1 : -1; tk.rotation.y = d > 0 ? 0 : Math.PI;
      tk.userData = { x: d > 0 ? 3 : 9, z: -150 + yt * 32, v: d * 7 }; scene.add(tk); yardTrucks.push(tk);
    }
    var QN = MOB ? [2, 1, 1, 1] : [3, 2, 1, 2], queue = [];
    QN.forEach(function (n, li) {
      for (var qi = 0; qi < n; qi++) {
        var qt = roadTruck([0xF2F3F4, 0x2D3338, 0xB3261E, 0x2B5C9E][(li + qi) % 4], li * 3 + qi * 5);
        qt.rotation.y = Math.PI; qt.position.set(laneX[li], 0, 60 + qi * 13.5); qt.userData.li = li; scene.add(qt); queue.push(qt);
      }
    });
    // where the plate was read on its way in: gate lane 3 → Block C → Berth 2
    var routePts = [new T.Vector3(4.25, .4, 46), new T.Vector3(6, .4, 10), new T.Vector3(6, .4, -30), new T.Vector3(-6, .4, -44), new T.Vector3(-30, .4, -46)];
    // sighting pins: the gate lane camera, the Block C yard camera and the Berth 2 quay camera (past reads only)
    var pinM = B(0x2673B5);
    var spins = [routePts[0], routePts[2], routePts[4]].map(function (q) {
      var g = new T.Group(); g.position.set(q.x, 0, q.z);
      var st2 = new T.Mesh(new T.CylinderGeometry(.12, .12, 4.4, 8), pinM); st2.position.y = 2.2; g.add(st2);
      var hd = new T.Mesh(new T.SphereGeometry(.7, 16, 12), pinM); hd.position.y = 4.8; g.add(hd);
      g.visible = false; scene.add(g); return g;
    });

    /* ---------- station boards ---------- */
    K.stationBoard('01', 'Gate lanes · plate reads', 'Access and parking', 24, 60, K.facing(24, 60, 24, 82) - .4);
    K.stationBoard('02', 'Gate to berth', 'Cygnus', 14, 16, -Math.PI / 2 + .2);
    K.stationBoard('03', 'Yard wall', 'Cygnus', 22, 21, K.facing(22, 21, 20.5, 33.2));
    K.stationBoard('04', 'Camera health', 'Cygnus', -29, -4, 0);              // under the crane portal, facing the station camera
    K.stationBoard('05', 'Gate queue', 'Access and parking', 28, 78, K.facing(28, 78, 34, 104));

    /* ---------- tags ---------- */
    var tPlate = K.tag('<b>XX 00 AB 1234</b> · Truck · Gate 3', '', new T.Vector3(4.25, 5.4, 60));
    var tOpen = K.tag('Read · gate transaction opened', 'light', new T.Vector3(4.25, 8.8, 52));
    var tJ1 = K.tag('Gate 3 · 08:41', 'light', new T.Vector3(4.25, 6.4, 46));
    var tJ2 = K.tag('Block C · 08:55', 'light', new T.Vector3(6, 6.4, -30));
    var tJ3 = K.tag('<b>Berth 2</b> · 09:12', '', new T.Vector3(-30, 6.4, -46));
    var tWall = K.tag('Cygnus wall · gates · yard · berths', '', new T.Vector3(29.2, 7, 31.7));
    var tPlay = K.tag('Playback · Berth 2 · 08:57', 'light', new T.Vector3(40.05, 1.1, 29));
    var tLost = K.tag('<b>Berth 2 · quay cam</b> · stream lost', 'alert', new T.Vector3(-36, 16, -30));
    var tTicket = K.tag('Ticket raised · maintenance', 'light', new T.Vector3(-36, 3.5, -28));
    var tQ = laneX.map(function (x, li) { return K.tag('', li === 0 ? 'alert' : 'light', new T.Vector3(x, 6.4, 60 + (QN[li] - 1) * 13.5 + 6)); });
    var dwell = [372, 248, 61, 190];

    /* ---------- journey keys ---------- */
    var V = function (x, y, z) { return new T.Vector3(x, y, z); };
    var KEYS = [
      { pos: V(24, 9, 82), look: V(2, 3, 50) },
      { pos: V(52, 58, 48), look: V(-6, 0, -18), lift: 10 },
      { pos: V(20.5, 4.4, 33.2), look: V(40, 2.8, 29), lift: 8 },
      { pos: V(-30, 14, 22), look: V(-38, 8, -26), lift: 10 },          // through the crane portal: board, berth camera, ship
      { pos: V(34, 20, 108), look: V(0, 2, 70), lift: 10 }
    ];
    if (MOB) KEYS.forEach(function (k, ki) { k.pos.add(ki === 2 ? new T.Vector3(2, 1.2, 1.5) : ki === 3 ? new T.Vector3(0, 1, 4) : new T.Vector3(0, 3, 8)); });

    function fmt(sec) { var m = Math.floor(sec / 60), s = Math.floor(sec % 60); return m + 'm ' + (s < 10 ? '0' : '') + s + 's'; }
    function update(progress, stationIndex, dt) {
      dt = Math.min(dt || .016, .05); time += dt;
      var J = K.journey(KEYS, progress, dt, true, time), i = J.i, lt = J.local;
      if (!ctx.reduce) {
        for (var k = 0; k < wPos.count; k++) {
          var bx2 = wBase[k * 3], by2 = wBase[k * 3 + 1];
          wPos.array[k * 3 + 2] = Math.sin(bx2 * .08 + time * .9) * .25 + Math.cos(by2 * .06 + time * .7) * .2;
        }
        wPos.needsUpdate = true;
        nmap.offset.x = (time * .012) % 1; nmap.offset.y = (time * .007) % 1;
        tugs.forEach(function (g, ti) { g.position.y = -.2 + Math.sin(time * 1.1 + ti) * .18; g.rotation.z = Math.sin(time * .9 + ti) * .03; g.rotation.x = Math.sin(time * .7 + ti) * .015; });
      }
      // STS cycle (17 s per move): lower empty → lock → hoist → trolley run → lower → unlock → hoist empty; even moves
      // discharge ship → tractor, odd moves load it back, so the box is always on the ship, on the spreader or on the tractor
      cranes.forEach(function (c) {
        var tt = ctx.reduce ? 0 : time + c.ph, H = 17, k = Math.floor(tt / H), u = (tt - k * H) / H, dis = k % 2 === 0;
        var sX = dis ? c.shipX : c.truckX, dX = dis ? c.truckX : c.shipX, sY = dis ? c.shipY : c.truckY, dY = dis ? c.truckY : c.shipY;
        function sm(a, b, v) { v = Math.max(0, Math.min(1, v)); v = v * v * (3 - 2 * v); return a + (b - a) * v; }
        var tx, sy, at;
        if (u < .14) { tx = sX; sy = sm(TRAVEL, sY, u / .14); at = 0; }
        else if (u < .2) { tx = sX; sy = sY; at = u < .17 ? 0 : 1; }
        else if (u < .34) { tx = sX; sy = sm(sY, TRAVEL, (u - .2) / .14); at = 1; }
        else if (u < .6) { tx = sm(sX, dX, (u - .34) / .26); sy = TRAVEL; at = 1; }
        else if (u < .74) { tx = dX; sy = sm(TRAVEL, dY, (u - .6) / .14); at = 1; }
        else if (u < .8) { tx = dX; sy = dY; at = u < .77 ? 1 : 2; }
        else { tx = dX; sy = sm(dY, TRAVEL, (u - .8) / .2); at = 2; }
        c.trolley.position.x = tx; c.cab.position.x = tx; c.spreader.position.set(tx, sy, 0);
        var len = 30.75 - (sy + .2);
        c.ropes.forEach(function (r) { r.position.set(tx + r.userData.o[0], sy + .2 + len / 2, r.userData.o[1]); r.scale.y = len; });
        if (at === 1) c.box1.position.set(CR_X + tx, sy - .2 - CH / 2, c.zc);
        else if ((at === 0) === dis) c.box1.position.set(c.slot.x, c.slot.y + CH / 2, c.slot.z);
        else c.box1.position.set(CR_X + TRUCK_LX, TT_DECK + CH / 2, c.zc);
      });
      // RTGs travel along their block; the trolley traverses and the spreader works above the 4-high stacks
      rtgs.forEach(function (r) {
        var zz = r.z0 + (Math.sin(time * .12 + r.ph) * .5 + .5) * (r.z1 - r.z0); r.g.position.z = zz;
        var tx = 2 + (Math.sin(time * .5 + r.ph) * .5 + .5) * (r.span - 5); r.tro.position.x = tx;
        var sy = 11.6 + Math.max(0, Math.sin(time * .8 + r.ph)) * 3.2; r.spr.position.set(tx, sy, 0);
        var len = 17.9 - (sy + .55);
        r.ropes.forEach(function (rp) { rp.position.set(tx + rp.userData.o[0], sy + .55 + len / 2, rp.userData.o[1]); rp.scale.y = len; });
      });
      carriers.forEach(function (c, ci) {
        c.g.position.z = CAR_PATH[ci][0] + Math.sin(time * .18) * CAR_PATH[ci][1];
        var lift = Math.max(0, Math.sin(time * .5 + ci)); c.spr.position.y = 4 + lift * 2.5; c.box1.position.y = c.spr.position.y - .15 - CH / 2;
      });
      // quay crew: the lasher walks the lashing lane between the crane legs and turns at each end
      crew.forEach(function (w) {
        var a = (ctx.reduce ? 0 : time) * .25 + w.ph, dz = Math.cos(a);
        w.p.position.set(-40.2, 0, w.z0 + Math.sin(a) * 4); w.p.rotation.y = dz >= 0 ? 0 : Math.PI;
        K.walk(w.p, time * 6 + w.ph, Math.min(.5, Math.abs(dz) * .8));
      });
      ledRedM.color.setHex(Math.sin(time * 6) > 0 ? 0xFF4A3D : 0x4A1410);
      yardTrucks.forEach(function (tk) { var u = tk.userData; if (!ctx.reduce) u.z += u.v * dt; if (u.z > 6) u.z -= 156; if (u.z < -150) u.z += 156; tk.position.set(u.x, 0, u.z); });
      // station 0: gate truck in lane 3 arrives, read, barrier lifts, rolls in
      var g0 = i === 0 ? lt : (i > 0 ? 1 : 0);
      // the truck stops at the stop bar, the checker walks to the cab and back (only while it is stopped), then the
      // arm lifts fully, the truck rolls through and the arm drops behind it
      var gWant = -(g0 < .4 ? 92 - (g0 / .4) * 37.6 : (g0 < .62 ? 54.4 : 54.4 - (g0 - .62) / .38 * 30.4));
      if (ctx.reduce) chk.done = true;
      if (i > 1 || (gateSt.s != null && gateSt.s < -60)) { chk.done = false; chk.phase = 'home'; }
      var atStop = i <= 1 && gateSt.s != null && Math.abs(gateSt.s + 54.4) < .05;
      if (chk.phase === 'home' && atStop && !chk.done && g0 >= .4) { chk.phase = 'out'; chk.t = 0; }
      if (chk.phase !== 'home') {
        chk.t += dt;
        if (chk.phase === 'out' && chk.t > 1.7) { chk.phase = 'check'; chk.t = 0; }
        else if (chk.phase === 'check' && chk.t > 1.3) { chk.phase = 'back'; chk.t = 0; }
        else if (chk.phase === 'back' && chk.t > 1.7) { chk.phase = 'home'; chk.done = true; }
      }
      var cu2 = chk.phase === 'out' ? chk.t / 1.7 : chk.phase === 'check' ? 1 : chk.phase === 'back' ? 1 - chk.t / 1.7 : 0;
      checker.position.lerpVectors(CHK_HOME, CHK_CAB, Math.min(1, cu2)); checker.position.y = cu2 > .25 ? .06 : .3;
      checker.rotation.y = chk.phase === 'back' ? Math.atan2(CHK_HOME.x - CHK_CAB.x, CHK_HOME.z - CHK_CAB.z) : chk.phase === 'home' ? 0 : -Math.PI / 2;
      K.walk(checker, (chk.phase === 'out' || chk.phase === 'back') ? time * 7 : 0, (chk.phase === 'out' || chk.phase === 'back') ? .5 : 0);
      arms.forEach(function (a) { a.rotation.z = 0; a.userData.light.material.color.setHex(0xD6453D); });
      var a3 = K.gateStep(gateSt, gWant, { stopS: -54.4, clearS: -39, open: g0 >= .44 && chk.done, v: 6 }, dt);
      gateTruck.position.set(4.25, 0, -gateSt.s); gateTruck.rotation.y = Math.PI; gateTruck.visible = i <= 1;
      if (i <= 1) { arms[2].rotation.z = -a3; if (a3 > 1.3) arms[2].userData.light.material.color.setHex(0x5BE38A); }
      // queue (all stations, but the focus of station 4): trucks idle, timers tick, lane 3 releases
      queue.forEach(function (q) { q.visible = i >= 2 || q.userData.li !== 2; });
      var lane3 = queue.filter(function (q) { return q.userData.li === 2; })[0];
      if (i === 4) {
        for (var dq = 0; dq < 4; dq++) dwell[dq] += dt;
        var rc = (time % 7), up = rc < .5 ? rc / .5 : rc < 2.8 ? 1 : rc < 3.3 ? 1 - (rc - 2.8) / .5 : 0;
        arms[2].rotation.z = -up * 1.35; if (up > .5) arms[2].userData.light.material.color.setHex(0x5BE38A);
        if (lane3) {
          var qz = rc < .55 ? 60 : rc < 2.7 ? 60 - (rc - .55) / 2.15 * 44 : rc < 3.4 ? -40 : rc < 6 ? 110 - (rc - 3.4) / 2.6 * 50 : 60;
          lane3.position.z = qz; lane3.visible = qz >= 16;
          if (rc > .55 && rc < 1) dwell[2] = 0;
        }
      } else if (lane3) lane3.position.z = 60;
      // journey route
      var jOn = i === 1;
      spins[0].visible = jOn && lt > .1; spins[1].visible = jOn && lt > .3; spins[2].visible = jOn && lt > .5;
      laneCone.material.opacity = i === 0 ? .14 + .05 * Math.sin(time * 4) : .05;
      var lost = i === 3 && lt > .25;
      berthCone.material.color.setHex(lost ? 0xD6453D : 0x2673B5);
      berthCone.material.opacity = lost ? (Math.sin(time * 18) > .6 ? .1 : 0) : .08;
      wall.draw(time, -1, lost ? 4 : -1);
      drawTimeline(i === 2 ? (time * .09) % 1 : .3);
      // tags
      tPlate.on = i === 0 && g0 > .32 && g0 < .64; tOpen.on = i === 0 && g0 > .45;
      tJ1.on = jOn && lt > .1; tJ2.on = jOn && lt > .3; tJ3.on = jOn && lt > .5;
      tWall.on = i === 2; tPlay.on = i === 2 && lt > .3;
      tLost.on = lost; tTicket.on = i === 3 && lt > .55;
      tQ.forEach(function (t, li) { t.on = i === 4 && lt > li * .08; if (t.on) t.set('<b>Lane ' + (li + 1) + '</b> · ' + QN[li] + (QN[li] > 1 ? ' trucks' : ' truck') + ' · ' + fmt(dwell[li])); });
      K.render();
    }
    return { update: update, warm: function (done) { (window.INFRAX_WARM || function (r, s, c, d) { d(); })(K.renderer, K.scene, K.camera, done); }, resize: K.resize, setDpr: K.setDpr, dispose: K.dispose };
  }

  window.INFRAX_DOMAINS = window.INFRAX_DOMAINS || {};
  window.INFRAX_DOMAINS.ports = {
    slug: 'ports', label: 'Ports',
    title: 'From the truck gate to the berth',
    intro: 'Container ports and logistics hubs: every truck read at the gate lanes, followed through the yard, the quay on one wall, and the gate queue measured lane by lane.',
    stations: STATIONS,
    create: create
  };

})();

/* INFRAX.AI domain journey: campuses. Self-contained module, loaded on demand by products.html. */
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
     CAMPUSES: corporate / hospital / university campus. Cygnus + Access and parking only.
     World (metres): internal road along z (gate at z=42, outside is +z), glass and white blocks with
     mullions and lit floors, a porte-cochere drop-off and entrance (Block A, east face), a 3-level
     parking deck (east), a basement ramp, and the security pavilion with the Cygnus wall (west).
     ============================================================================================= */
  var STATIONS = [
    { id: 'gate', product: 'Access and parking', productSlug: 'access-parking', short: 'Gate',
      title: 'Every vehicle in and out, read and logged',
      body: 'Plate reads at the main gate, in and out. Each read lands in the visitor and vehicle log with the time, the lane and a snapshot, so the front desk knows who is on campus.',
      rows: [['Plate', 'XX 00 AB 1234'], ['Lane', 'Main gate · entry'], ['Class', 'Car'], ['Log', 'Visitor · Block A']],
      live: ['ANPR', 'Vehicle classification', 'Visitor and vehicle log'],
      photo: 'img/campus-sm.webp', photoCaption: 'Illustrative' },
    { id: 'parking', product: 'Access and parking', productSlug: 'access-parking', short: 'Parking',
      title: 'Free spaces by level, as they change',
      body: 'Every entry and exit updates the count for each level of the parking deck. Cameras at the basement ramp watch the cars going down to P2.',
      rows: [['Level 1', '12 free'], ['Level 2', '27 free'], ['Level 3', '41 free'], ['Ramp', 'P2 · 2 cameras']],
      live: ['Parking occupancy', 'ANPR', 'Live video'],
      photo: 'img/campus-parking-sm.webp', photoCaption: 'Illustrative' },
    { id: 'console', product: 'Cygnus', productSlug: 'cygnus', short: 'One console',
      title: 'One console for every building',
      body: 'Gates, blocks, parking and walkways on one 3×3 video wall and one campus map. Recording runs 24×7 with timeline playback, and PTZ cameras move from the tile.',
      rows: [['Wall', 'Gates · blocks · parking'], ['Map', 'Every camera by building'], ['Recording', '24×7 · timeline playback']],
      live: ['Live video wall', '24×7 recording', 'Plate search & journeys'],
      photo: 'img/real/tiles/t7-campus.webp', photoCaption: 'Corridor feeds masked · other views illustrative' },
    { id: 'health', product: 'Cygnus', productSlug: 'cygnus', short: 'Camera health',
      title: 'A ramp camera stopped sending video',
      body: 'Cygnus flags a camera the moment it is blinded, moved or drops its stream, and opens a maintenance ticket, so the gap is fixed before anyone needs that footage.',
      rows: [['Camera', 'Basement ramp · cam 04'], ['Status', 'Stream lost'], ['Next step', 'Maintenance ticket']],
      live: ['Camera tamper & health'],
      photo: 'img/campus-ramp-sm.webp', photoCaption: 'Illustrative' },
    { id: 'people', product: 'Cygnus', productSlug: 'cygnus', short: 'People count',
      title: 'People in and out at every entrance',
      body: 'A camera over the Block A entrance counts people crossing the line in each direction, so facilities see footfall by entrance and by hour.',
      rows: [['Entrance', 'Block A · main doors'], ['In today', '1,284'], ['Out today', '1,102'], ['Busiest', '09:00–10:00']],
      live: ['People counting', 'Live video'],
      photo: 'img/campus-entrance-sm.webp', photoCaption: 'Illustrative' }
  ];

  function create(host, ctx) {
    var K = makeKit(host, ctx), T = K.T, scene = K.scene, M = K.M, B = K.B, box = K.box, cyl = K.cyl, MOB = K.MOB;
    var time = 0;
    // students: varied tops, trousers / jeans / skirts / shorts, trainers, backpacks or shoulder bags, hair styles
    var TOPS = [0x2B5C9E, 0xE6E9EC, 0xB3261E, 0x1F8A5B, 0x6E7A86, 0xE0A42B, 0x7A4E9E, 0x2D3338, 0xC86B8A, 0x3E8FB0, 0xF2F3F4, 0x8A5A3C];
    var BOTTOMS = [0x2E4A6B, 0x2A2F35, 0xB8A68A, 0x3B4E6E, 0x5A6470, 0x1C2733, 0x6B5544];
    function student(k, bag) {
      return K.person(TOPS[k % TOPS.length], { seed: k, pants: BOTTOMS[(k * 3 + 1) % BOTTOMS.length], skirt: k % 5 === 2, shorts: k % 7 === 4,
        bag: bag || ['back', 'back', 'side', 'back', 'side', ''][k % 6], shoe: [0x1A1D20, 0xF2F3F4, 0x8A5A3C, 0x2B5C9E][k % 4] });
    }

    /* ---------- ground: lawns, paving, internal road with a planted median ---------- */
    var ground = K.rcv(new T.Mesh(new T.PlaneGeometry(1100, 1100), M(0xC4D6BC, { map: K.grassTex([105, 105]), roughness: .95 })));
    ground.rotation.x = -Math.PI / 2; scene.add(ground);
    var plaza = K.rcv(new T.Mesh(new T.PlaneGeometry(150, 130), M(0xDDE2E6, { map: K.pavingTex([22, 19]), roughness: .9 })));
    plaza.rotation.x = -Math.PI / 2; plaza.position.set(0, .02, -10); scene.add(plaza);
    var road = K.rcv(new T.Mesh(new T.PlaneGeometry(9, 220), M(0x7C838A, { map: K.asphaltTex([2, 40]), roughness: .92 })));
    road.rotation.x = -Math.PI / 2; road.position.set(0, .04, 10); scene.add(road);
    // pedestrian crossings: a signalised zebra over the internal road, the deck driveway over the east walkway,
    // and the drop-off zebra in front of Block A. Verge furniture keeps out of these zones.
    var ZEB_Z = -6, ZEB_H = 1.6, DRV_Z = 26, DRV_H = 2.5;
    var KEEP = [[-8.6, 8.6, ZEB_Z - 2.6, ZEB_Z + 2.6], [4.4, 17, DRV_Z - DRV_H - 1, DRV_Z + DRV_H + 1], [-7.6, -5.6, -14.6, -12]];
    function clearOf(x, z, r) { r = r || 0; for (var k = 0; k < KEEP.length; k++) { var q = KEEP[k]; if (x > q[0] - r && x < q[1] + r && z > q[2] - r && z < q[3] + r) return false; } return true; }
    var mark = B(0xF5F5F0), markList = [];
    for (var z = -95; z < 120; z += 7) if (Math.abs(z - ZEB_Z) > 4) markList.push([0, .06, z, .16, .02, 3.2]);
    [-4.3, 4.3].forEach(function (x) { markList.push([x, .06, -55, .14, .02, 90]); markList.push([x, .06, 58, .14, .02, 124]); });
    for (var zb = -4; zb <= 4; zb += 1) markList.push([zb, .061, ZEB_Z, .5, .02, ZEB_H * 2]);            // zebra bars (parallel to traffic)
    markList.push([-2.15, .061, ZEB_Z - ZEB_H - 1, 4.2, .02, .3]); markList.push([2.15, .061, ZEB_Z + ZEB_H + 1, 4.2, .02, .3]); // stop lines
    for (var zd = DRV_Z - 2.1; zd <= DRV_Z + 2.1; zd += .9) markList.push([9.5, .061, zd, 3, .02, .45]);      // driveway zebra over the walkway
    for (var zx = -15.4; zx <= -10.4; zx += 1) markList.push([zx, .061, 2.4, .5, .02, 4.4]);                   // drop-off zebra
    K.inst(null, mark, markList);
    var kerb = M(0xCFD5DA, { roughness: .8 }), kerbList = [[-4.7, .11, 10, .35, .22, 220], [4.7, .11, -38.25, .35, .22, 123.5], [4.7, .11, 74.25, .35, .22, 91.5]];
    K.inst(null, kerb, kerbList);
    var walkM = M(0xE9ECEE, { map: K.pavingTex([2, 40], '#E6E9EC'), roughness: .9 });
    [-9.5, 9.5].forEach(function (x) { var w = K.rcv(new T.Mesh(new T.PlaneGeometry(3, 170), walkM)); w.rotation.x = -Math.PI / 2; w.position.set(x, .05, -10); scene.add(w); });
    // lawn verges between kerb and walkway (paved where the crossings cut through), kerb edging on the walkways
    var lawnM = M(0xB5CDA9, { map: K.grassTex([2, 30]), roughness: .95 });
    [[-6.35, -50.05, 83.9], [-6.35, 18.8, 45.4], [6.35, -50.05, 83.9], [6.35, 9.8, 27.4], [6.35, 35, 13]].forEach(function (q) {
      var l = K.rcv(new T.Mesh(new T.PlaneGeometry(2.9, q[2]), lawnM)); l.rotation.x = -Math.PI / 2; l.position.set(q[0], .055, q[1]); scene.add(l);
    });
    var edgeList = []; [-11.05, -7.95, 7.95, 11.05].forEach(function (x) { edgeList.push([x, .07, -10, .1, .1, 170]); });
    K.inst(null, M(0xBFC6CD, { roughness: .8 }), edgeList);
    // driveway from the road to the deck entrance
    var drv = K.rcv(new T.Mesh(new T.PlaneGeometry(12.6, DRV_H * 2), M(0x7C838A, { map: K.asphaltTex([3, 1]), roughness: .92 }))); drv.rotation.x = -Math.PI / 2; drv.position.set(10.9, .045, DRV_Z); scene.add(drv);
    // landscaped verges: clipped hedges alternating with flower beds (soil + flower clumps in three colours), round shrubs
    var hedge = M(0x5E8C5A, { roughness: .9 }), soilM = M(0x5A4636, { roughness: 1 });
    var hedgeGeo = K.jitter(new T.BoxGeometry(1, 1, 1, 3, 2, 6), .06, 3), bloomGeo = K.jitter(new T.IcosahedronGeometry(1, 0), .25, 5), shrubGeo = K.jitter(new T.IcosahedronGeometry(1, 1), .2, 2);
    var hedgeList = [], soilList = [], bloomA = [], bloomB = [], bloomC = [], shrubA = [], shrubB = [];
    function bed(x, z, lx, lz) {
      soilList.push([x, .1, z, lx, .1, lz]);
      var nx = Math.max(1, Math.round(lx / .42)), nz = Math.max(1, Math.round(lz / .42)), k = 0;
      for (var i = 0; i < nx; i++) for (var j = 0; j < nz; j++, k++) {
        if (MOB && k % 2) continue;
        [bloomA, bloomB, bloomC][Math.abs(i + j * 2 + Math.round(x * 3 + z)) % 3].push([x - lx / 2 + (i + .5) * lx / nx, .22, z - lz / 2 + (j + .5) * lz / nz, .17, .13, .17, k]);
      }
    }
    for (var hz = -78; hz < 36; hz += 6) {
      if (clearOf(-6.8, hz, 2.2)) { if ((hz / 6 | 0) % 2) bed(-6.8, hz, 1.0, 4.0); else { hedgeList.push([-6.8, .4, hz, 1.1, .7, 4.2]); shrubA.push([-5.6, .45, hz + 2.6, .7, .6, .7]); } }
      if (clearOf(6.8, hz + 3, 2.2)) { if ((hz / 6 | 0) % 2) bed(6.8, hz + 3, 1.0, 4.0); else { hedgeList.push([6.8, .4, hz + 3, 1.1, .7, 4.2]); shrubB.push([5.6, .4, hz + .4, .6, .5, .6]); } }
    }
    K.inst(shrubGeo, M(0x4E7D57, { roughness: .9 }), shrubA); K.inst(shrubGeo, M(0x8AAE6A, { roughness: .9 }), shrubB);
    // signal heads + pedestrian lights at the zebra (one material per aspect, recoloured each frame)
    var sigOn = { r: B(0xFF3B30), a: B(0x3A2A10), g: B(0x0E3A1E), pr: B(0xFF3B30), pg: B(0x0E3A1E) }, sigPole = M(0x3A4148, { roughness: .4, metalness: .6 });
    [[-5.3, ZEB_Z - ZEB_H - 1.4, Math.PI], [5.3, ZEB_Z + ZEB_H + 1.4, 0]].forEach(function (q) {
      var sg = new T.Group(); cyl(.08, .08, 3.4, 8, sigPole, 0, 1.7, 0, sg);
      box(.42, 1.2, .3, M(0x1C2228, { roughness: .5 }), 0, 3.1, 0, sg);
      box(.24, .24, .05, sigOn.r, 0, 3.48, .16, sg); box(.24, .24, .05, sigOn.a, 0, 3.12, .16, sg); box(.24, .24, .05, sigOn.g, 0, 2.76, .16, sg);
      box(.3, .5, .22, M(0x1C2228, { roughness: .5 }), 0, 2.1, -.05, sg); box(.2, .18, .05, sigOn.pr, 0, 2.22, -.18, sg); box(.2, .18, .05, sigOn.pg, 0, 1.98, -.18, sg);
      sg.position.set(q[0], 0, q[1]); sg.rotation.y = q[2]; scene.add(sg);
    });
    // paving where the zebra crosses the verges
    [-6.35, 6.35].forEach(function (x) { var pv = K.rcv(new T.Mesh(new T.PlaneGeometry(2.9, ZEB_H * 2 + 1), walkM)); pv.rotation.x = -Math.PI / 2; pv.position.set(x, .056, ZEB_Z); scene.add(pv); });

    /* ---------- gate: boundary wall + railings, two lanes, boom barriers, security cabin, ANPR pole ---------- */
    var wallM = M(0xE8EBEE, { roughness: .8 }), railM = M(0x9AA4AE, { metalness: .6, roughness: .4 });
    var railList = [];
    [[-48, 42], [48, 42]].forEach(function (q) {
      var cx = q[0];                                                                     // wall runs from the gate piers outward (|x| >= 6), clear of both lanes
      box(84, 1.6, .5, wallM, cx, .8, q[1]);
      for (var i = 0; i < 42; i++) railList.push([cx - 41 + i * 2, 2.2, q[1], .08, 1.2, .08]);
      box(84, .1, .1, railM, cx, 2.8, q[1]);
    });
    K.inst(null, railM, railList);
    box(.8, 3.6, .8, wallM, -5.6, 1.8, 42); box(.8, 3.6, .8, wallM, 5.6, 1.8, 42); box(.8, 3.6, .8, wallM, 0, 1.8, 42);
    var gateSign = new T.Mesh(new T.PlaneGeometry(10.4, 1.3), B(0xffffff, { map: K.titleBoard(['MAIN GATE']) }));
    box(11.6, 1.6, .4, M(0x1C2733, { roughness: .5 }), 0, 4.3, 42); gateSign.position.set(0, 4.3, 42.22); scene.add(gateSign);
    var stripes = K.canvasTex(256, 16, function (x2, w, h) { for (var i = 0; i < 8; i++) { x2.fillStyle = i % 2 ? '#D6453D' : '#FFFFFF'; x2.fillRect(i * 32, 0, 32, h); } });
    var stripeM = M(0xffffff, { map: stripes, roughness: .5 });
    function barrier(x, zz, dirSign, len) {
      var g = new T.Group(), post = M(0x2A2F35, { roughness: .5, metalness: .3 });
      box(.5, 1.1, .5, M(0xE0A42B, { roughness: .5 }), 0, .55, 0, g);
      box(.3, .3, .3, post, 0, 1.15, 0, g);
      var arm = new T.Group(); arm.position.set(0, 1.12, 0); g.add(arm);
      var bar = K.cs(new T.Mesh(new T.BoxGeometry(len || 4, .12, .12), stripeM)); bar.position.x = dirSign * (len || 4) / 2; arm.add(bar);
      g.position.set(x, 0, zz); scene.add(g); return arm;
    }
    var armIn = barrier(4.6, 41.2, -1), armOut = barrier(-4.6, 41.2, 1);
    // security cabin: hollow shell (sill + head bands, corner posts, glazing on three sides, solid back wall),
    // interior with an L desk, two monitors, a keyboard, a chair and a seated guard facing the entry lane
    var cabin = new T.Group(), cabW = M(0xF1F3F5, { roughness: .6 }), cabG = M(0x9DB8CF, { roughness: .05, metalness: .4, transparent: true, opacity: .3, depthWrite: false });
    box(4.8, .3, 3.8, M(0xBFC6CD, { roughness: .7 }), 0, .15, 0, cabin);              // plinth
    box(4.5, .02, 3.5, M(0xC9CFD5, { roughness: .7 }), 0, .31, 0, cabin);              // floor
    box(4.6, .85, .1, cabW, 0, .72, -1.75, cabin); box(.1, .85, 3.6, cabW, -2.25, .72, 0, cabin); box(2.7, .85, .1, cabW, -.95, .72, 1.75, cabin); // sills
    box(4.6, .45, .1, cabW, 0, 2.78, -1.75, cabin); box(.1, .45, 3.6, cabW, -2.25, 2.78, 0, cabin); box(4.6, .45, .1, cabW, 0, 2.78, 1.75, cabin);   // heads
    box(.1, 3, 3.6, cabW, 2.25, 1.5, 0, cabin);                                         // back wall
    [[-2.25, -1.75], [-2.25, 1.75], [2.25, -1.75], [2.25, 1.75], [.4, 1.75]].forEach(function (q) { box(.16, 3, .16, cabW, q[0], 1.5, q[1], cabin); });
    box(4.3, 1.4, .04, cabG, 0, 1.85, -1.75, cabin); box(.04, 1.4, 3.3, cabG, -2.25, 1.85, 0, cabin); box(2.5, 1.4, .04, cabG, -.95, 1.85, 1.75, cabin);
    [-1.2, 0, 1.2].forEach(function (mx) { box(.06, 1.4, .08, cabW, mx, 1.85, -1.75, cabin); });            // glazing mullions + transom
    [-.6, .6].forEach(function (mz) { box(.08, 1.4, .06, cabW, -2.25, 1.85, mz, cabin); }); box(.06, 1.4, .08, cabW, -.95, 1.85, 1.75, cabin);
    var clk = cyl(.18, .18, .04, 18, M(0xF4F6F8), 2.18, 2.25, .9, cabin); clk.rotation.z = Math.PI / 2; box(.01, .12, .02, M(0x1C2228), 2.155, 2.28, .9, cabin);
    box(.03, .6, .9, M(0xC9A27A, { roughness: .9 }), 2.185, 1.75, -.7, cabin); box(.01, .2, .25, B(0xF4F4F0), 2.165, 1.82, -.85, cabin); box(.01, .15, .2, B(0xDCEBF7), 2.165, 1.66, -.5, cabin);
    box(.9, 2.25, .06, M(0x8E959C, { roughness: .5, metalness: .4 }), 1.3, 1.43, 1.76, cabin);              // door
    box(.45, 2.25, .1, cabW, .62, 1.43, 1.75, cabin); box(.5, 2.25, .1, cabW, 2.0, 1.43, 1.75, cabin);
    box(.4, .4, .06, cabG, 1.3, 2.0, 1.8, cabin);                                       // door vision panel
    box(5.2, .25, 4.2, M(0xD3D9DE, { roughness: .6 }), 0, 3.12, 0, cabin);
    box(5.24, .12, 4.24, B(0x2673B5), 0, 2.96, 0, cabin);                              // fascia band
    box(1.2, .6, .5, M(0x9AA4AE, { metalness: .6, roughness: .4 }), 1.2, 2.2, -2.05, cabin);  // AC unit (outside, campus face)
    box(1.6, .08, .4, B(0xFFFBF0), 0, 2.98 - .1, 0, cabin);                                // ceiling light
    var cdesk = M(0xB9C3CC, { roughness: .4, metalness: .2 }), cmon = M(0x1A2129, { roughness: .4, metalness: .4 });
    box(.7, .05, 3.2, cdesk, -1.8, 1.08, 0, cabin); box(1.6, .05, .6, cdesk, -1.1, 1.08, -1.35, cabin); box(.6, .75, .05, M(0xE2E6EA), -1.8, .7, 1.55, cabin);
    [-.5, .5].forEach(function (mz) { box(.05, .4, .66, cmon, -1.95, 1.42, mz, cabin); var sc = box(.01, .34, .6, B(0x2A5A8A), -1.92, 1.42, mz, cabin); sc.castShadow = false; });
    box(.2, .03, .6, cmon, -1.6, 1.12, 0, cabin);                                       // keyboard
    var cch = K.chair(cabin); cch.position.set(-.85, .31, 0); cch.rotation.y = -Math.PI / 2;
    var guard = K.seated(0x1B3A5C); guard.position.set(-.95, .31, 0); guard.rotation.y = -Math.PI / 2; cabin.add(guard);
    cabin.position.set(9.5, 0, 44.5); scene.add(cabin);
    var anpr = K.poleCam(6.4, 39.2, 5.4, new T.Vector3(2.3, 1, 50));
    var anprCone = K.viewCone(new T.Vector3(6.4, 5.2, 39.2), new T.Vector3(2.3, 0.6, 52), 15, 4.2);
    var anprOut = K.poleCam(-6.4, 44.8, 5.4, new T.Vector3(-2.3, 1, 34));
    var anprOutCone = K.viewCone(new T.Vector3(-6.4, 5.2, 44.8), new T.Vector3(-2.3, .6, 32), 14, 4);

    /* ---------- buildings: real façade frames aligned to the window grid ----------
       White blocks: punched windows recessed behind piers and spandrel bands, with sills, sunshades and balconies.
       Glass blocks: curtain wall with mullions, opaque spandrel panels, transom caps and vertical fins.
       The window texture has one row per storey and one column per bay, so every frame member lands on a joint. */
    var mullM = M(0xE9EEF2, { roughness: .4, metalness: .3 }), slabM = M(0xFFFFFF, { roughness: .5 });
    var hvacList = [], fanList = [], solarList = [], solarFrame = [], hvacLouv = [], ductList = [];
    var podList = [], finList = [], crownList = [], coreList = [], louvreList = [], mastList = [], copingList = [], parapetList = [];
    var shadeList = [], balcList = [], balcGlass = [], finV = [], gfGlass = [], tankList = [], avList = [], guardList = [];
    var pierList = [], spandW = [], spandG = [], sillList = [], cwMull = [], transom = [], cornerList = [];
    function tower(x, z, w, h, d, glassy, seed) {
      var floors = Math.max(3, Math.round(h / 3.75)), fh = h / floors, bay = glassy ? (MOB ? 3 : 1.5) : 3.0;
      var cw = Math.max(2, Math.round(w / bay)), cd = Math.max(2, Math.round(d / bay));
      var tw = K.windowPair(cw, floors, glassy, seed), td = K.windowPair(cd, floors, glassy, seed + 5);
      function fm(t) { return M(glassy ? 0x8FB2CF : 0xF2F4F6, { map: t.map, emissive: 0xFFFFFF, emissiveMap: t.emissive, emissiveIntensity: .28, roughness: glassy ? .1 : .5, metalness: glassy ? .6 : .08 }); }
      var sw = fm(tw), sd = fm(td), top = M(0xDCE1E5, { roughness: .7 });
      var mesh = K.cs(new T.Mesh(new T.BoxGeometry(w, h, d), [sd, sd, top, top, sw, sw])); mesh.position.set(x, h / 2, z); scene.add(mesh);
      var D = glassy ? .16 : .32, PW = glassy ? .09 : .7;
      // faces: [nx, nz, face width, bays]; put() places a box on a face at along-coordinate u, outward offset t
      [[0, 1, w, cw], [0, -1, w, cw], [1, 0, d, cd], [-1, 0, d, cd]].forEach(function (F) {
        var nx = F[0], nz = F[1], W2 = F[2], n = F[3], step = W2 / n, o = nz ? d / 2 : w / 2;
        function put(list, u, t, y, su, sy, st) { list.push([x + (nz ? u : nx * (o + t)), y, z + (nz ? nz * (o + t) : u), nz ? su : st, sy, nz ? st : su]); }
        for (var k = 1; k < n; k++) {
          var u = -W2 / 2 + k * step;
          if (glassy) put(cwMull, u, D / 2, h / 2, PW, h - .1, D);
          else { put(pierList, u, (D + .03) / 2, (h - .02 + fh - .35) / 2, PW, h - .02 - fh + .35, D + .03); put(cwMull, u, .06, fh / 2 + .3, .12, fh - .6, .12); }
          if (glassy && nz && k % 2 === 0) put(finV, u, .45, h / 2 + fh / 2, .12, h - fh - .2, .7);
        }
        for (var f = 1; f < floors; f++) {
          var fy = f * fh, span = nz ? W2 + 2 * D : W2;
          if (glassy) { put(spandG, 0, .04, fy + .05, span, .9, .08); put(transom, 0, .07, fy + .52, span, .06, .14); put(transom, 0, .07, fy - .42, span, .06, .14); }
          else {
            put(spandW, 0, D / 2, fy + .2, span, 1.1, D);
            if (!MOB) for (var s2 = 0; s2 < n; s2++) put(sillList, -W2 / 2 + (s2 + .5) * step, D / 2 + .06, fy + .785, step - PW - .04, .07, D + .12);
            if (nz) put(shadeList, 0, .6, (f + 1) * fh - .5, W2, .07, .95);
          }
        }
        put(gfGlass, 0, .04, 2.0, W2 - .4, 3.0, .06);                                                   // lobby glazing band
      });
      // corner posts stand 4-7 cm proud of every face member so no two faces are coplanar; they stop short of the crown
      var cO = D + (glassy ? .04 : .07), y0c = glassy ? 0 : fh - .35, y1c = h - .03;
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) { cornerList.push([x + q[0] * (w / 2 + (cO - .1) / 2), (y0c + y1c) / 2, z + q[1] * (d / 2 + (cO - .1) / 2), cO + .1, y1c - y0c, cO + .1]); });
      if (!glassy && !MOB) for (var f2 = 2; f2 < floors; f2++) for (var bc = -w / 2 + 2.6; bc < w / 2 - 2; bc += 6) {     // balconies on the +z face
        balcList.push([x + bc, f2 * fh + .1, z + d / 2 + .75, 2.6, .16, 1.3]); balcGlass.push([x + bc, f2 * fh + .65, z + d / 2 + 1.38, 2.6, .9, .05]);
      }
      // rooftop: parapet + coping, plant (HVAC with louvres + fans, ducts), lift core with louvres, tanks, mast, solar
      parapetList.push([x, h + .45, z + d / 2 - .15, w, .9, .3], [x, h + .45, z - d / 2 + .15, w, .9, .3], [x + w / 2 - .15, h + .45, z, .3, .9, d - .6], [x - w / 2 + .15, h + .45, z, .3, .9, d - .6]);
      copingList.push([x, h + .94, z + d / 2 - .15, w + .12, .08, .46], [x, h + .94, z - d / 2 + .15, w + .12, .08, .46], [x + w / 2 - .15, h + .94, z, .46, .08, d - .6], [x - w / 2 + .15, h + .94, z, .46, .08, d - .6]);
      for (var hu = 0; hu < 3; hu++) {
        var hx = x - w * .32 + hu * 3.2, hzz = z - d * .28;
        hvacList.push([hx, h + .82, hzz, 2.6, 1.6, 2.2]);
        fanList.push([hx - .6, h + 1.67, hzz, .5, .1, .5], [hx + .6, h + 1.67, hzz, .5, .1, .5]);
        if (!MOB) for (var lv4 = 0; lv4 < 5; lv4++) hvacLouv.push([hx, h + .3 + lv4 * .26, hzz + 1.11, 2.3, .05, .04], [hx, h + .3 + lv4 * .26, hzz - 1.11, 2.3, .05, .04]);
      }
      ductList.push([x - w * .32 + 3.2, h + .27, z - d * .28 + 1.4, 8.4, .5, .5]);                                   // duct run behind the plant
      podList.push([x, .22, z, w + 1.4, .44, d + 1.4]);
      finList.push([x, 4.1, z, w + 1.8, .22, d + 1.8]);
      crownList.push([x, h - .49, z, w + 2 * D + .3, 1.02, d + 2 * D + .3]);              // crown top is the roof deck (h + .02)
      coreList.push([x + w * .3, h + 1.9, z + d * .3, 4.2, 3.8, 3.6]);
      for (var lv3 = 0; lv3 < 4; lv3++) louvreList.push([x + w * .3, h + 1.0 + lv3 * .6, z + d * .3 + 1.82, 3.6, .1, .06]);
      mastList.push([x + w * .3 - 1.2, h + 5.8, z + d * .3, .12, 4, .12]);
      tankList.push([x - w * .3, h + 1.2, z + d * .36, 1.1, 2.4, 1.1], [x - w * .3 + 2.6, h + 1.2, z + d * .36, 1.1, 2.4, 1.1]);
      avList.push([x + w * .3 - 1.2, h + 7.9, z + d * .3, .3, .3, .3]);
      for (var gr = -w / 2 + 1; gr < w / 2; gr += 2.5) guardList.push([x + gr, h + .52, z - d / 2 + .9, .06, 1, .06]);
      guardList.push([x, h + 1.0, z - d / 2 + .9, w - 2, .06, .06]); guardList.push([x, h + .6, z - d / 2 + .9, w - 2, .05, .05]);
      var cols2 = Math.floor(w / 3.4);
      for (var sr = 0; sr < 2; sr++) for (var sc = 0; sc < cols2; sc++) {
        var sx = x - w / 2 + 2 + sc * 3.4, sz = z + d * .08 + sr * 3.2;
        solarList.push([sx, h + .02 + 1.09, sz, 3, .08, 2.2, 0, -.32]);
        var yf = 1.05 + .75 * Math.sin(.32), yr = 1.05 - .75 * Math.sin(.32);                         // panel underside at the posts (tilted .32 rad)
        solarFrame.push([sx - 1.3, h + .02 + yf / 2, sz + .75, .08, yf, .08], [sx + 1.3, h + .02 + yf / 2, sz + .75, .08, yf, .08], [sx - 1.3, h + .02 + yr / 2, sz - .75, .08, yr, .08], [sx + 1.3, h + .02 + yr / 2, sz - .75, .08, yr, .08]);
      }
    }
    tower(-30, 4, 22, 30, 20, true, 3);
    tower(30, -8, 24, 20, 22, false, 7);
    tower(-32, -48, 20, 24, 22, false, 11);
    tower(28, -54, 22, 34, 20, true, 17);
    tower(0, -92, 46, 16, 18, true, 23);
    var frameW = M(0xF4F6F8, { roughness: .55, metalness: .08 }), alu = M(0xC9D0D6, { roughness: .35, metalness: .6 });
    K.inst(null, frameW, pierList.concat(spandW)); K.inst(null, M(0xE4E8EC, { roughness: .5 }), sillList.length ? sillList : [[0, -5, 0, .01, .01, .01]]);
    K.inst(null, alu, cwMull.concat(transom)); K.inst(null, M(0x3B5570, { roughness: .25, metalness: .55 }), spandG); K.inst(null, mullM, cornerList);
    K.inst(null, slabM, parapetList); K.inst(null, M(0xC9D0D6, { roughness: .45, metalness: .5 }), copingList);
    K.inst(null, M(0xC9D0D6, { roughness: .6, metalness: .3 }), hvacList); if (hvacLouv.length) K.inst(null, M(0x8E959C, { roughness: .5, metalness: .5 }), hvacLouv);
    K.inst(null, M(0xB9C0C7, { roughness: .5, metalness: .5 }), ductList);
    K.inst(new T.CylinderGeometry(1, 1, 1, 14), M(0x2A2F35, { roughness: .5, metalness: .5 }), fanList);
    K.inst(null, M(0x1E3A5C, { roughness: .18, metalness: .7 }), solarList);
    K.inst(null, M(0xA9B3BD, { metalness: .6, roughness: .35 }), solarFrame);
    K.inst(null, M(0xB8BEC4, { roughness: .85 }), podList); K.inst(null, M(0xF4F6F8, { roughness: .45, metalness: .2 }), finList);
    K.inst(null, M(0xE4E8EC, { roughness: .5, metalness: .15 }), crownList); K.inst(null, M(0xD6DBE0, { roughness: .7 }), coreList);
    K.inst(null, M(0x8E959C, { roughness: .5, metalness: .4 }), louvreList); K.inst(null, M(0x9AA4AE, { metalness: .7, roughness: .3 }), mastList);
    K.inst(null, M(0xF4F6F8, { roughness: .45, metalness: .2 }), shadeList); K.inst(null, M(0xE9EEF2, { roughness: .4, metalness: .3 }), finV);
    if (balcList.length) { K.inst(null, slabM, balcList); K.inst(null, M(0xA9C6DE, { roughness: .05, metalness: .4, transparent: true, opacity: .45 }), balcGlass); }
    K.inst(null, M(0x2E4A63, { roughness: .08, metalness: .7 }), gfGlass);
    K.inst(new T.CylinderGeometry(1, 1, 1, 12), M(0xE4E8EC, { roughness: .5, metalness: .3 }), tankList);
    K.inst(null, B(0xFF3B30), avList); K.inst(null, M(0xBFC6CD, { metalness: .5, roughness: .4 }), guardList);
    // entrance on every block: cantilevered canopy with a blue fascia and soffit lights, glazed double doors in a
    // frame with push bars, door mat, flanking planters, and a stone signage plinth with the block name.
    // ent(x, z, rot, name): rot turns local +z (outward) to the face.
    var totFace = [], eCan = [], eFas = [], eFrame = [], eGlass = [], eMat = [], ePl = [], ePlTop = [], eTot = [], eSoff = [], plinthL = [], plinthCap = [];
    var blockTex = {};
    function ent(ox, oz, rot, name) {
      var c = Math.cos(rot), s = Math.sin(rot);
      function P(list, lx, ly, lz, sx, sy, sz) { list.push([ox + lx * c + lz * s, ly, oz - lx * s + lz * c, sx, sy, sz, rot]); }
      P(eCan, 0, 3.75, 1.7, 7.2, .32, 3.4); P(eFas, 0, 3.75, 3.42, 7.3, .36, .06);
      [-2.4, 0, 2.4].forEach(function (lx) { P(eSoff, lx, 3.58, 1.9, 1.2, .02, .3); });
      P(eFrame, 0, 3.05, .12, 3.6, .16, .2); P(eFrame, -1.75, 1.5, .12, .14, 3, .2); P(eFrame, 1.75, 1.5, .12, .14, 3, .2); P(eFrame, 0, 1.5, .14, .08, 3, .16);
      P(eGlass, -.86, 1.5, .1, 1.6, 2.96, .05); P(eGlass, .86, 1.5, .1, 1.6, 2.96, .05);
      P(eFrame, -.2, 1.15, .2, .05, .7, .06); P(eFrame, .2, 1.15, .2, .05, .7, .06);                     // push bars
      P(eMat, 0, .07, 1.2, 3.2, .03, 1.8);
      [-3, 3].forEach(function (px) { P(ePl, px, .4, 2, 1.2, .8, 1.2); P(ePlTop, px, .95, 2, .7, .5, .7); });
      if (name) {
        P(plinthL, 4.6, .45, 3.0, 3.2, .9, .6); P(plinthCap, 4.6, .93, 3.0, 3.3, .06, .66);
        var tx = blockTex[name] || (blockTex[name] = K.titleBoard([name]));
        var pb = new T.Mesh(K.geo('plinthB', function () { return new T.PlaneGeometry(2.9, .46); }), B(0xffffff, { map: tx }));
        pb.position.set(ox + 4.6 * c + 3.31 * s, .5, oz - 4.6 * s + 3.31 * c); pb.rotation.y = rot; scene.add(pb);
      } else { P(eTot, 4.4, 1.2, 2.6, .5, 2.4, .16); P(totFace, 4.4, 1.3, 2.69, .44, 2.1, 1); }
    }
    ent(18, -12, -Math.PI / 2, 'BLOCK B'); ent(-22, -48, Math.PI / 2, 'BLOCK C'); ent(17, -54, -Math.PI / 2, 'BLOCK D'); ent(-12, -83, 0); ent(-30, 14, 0, 'BLOCK A');
    K.inst(null, M(0xF4F6F8, { roughness: .45, metalness: .2 }), eCan); K.inst(null, B(0x2673B5), eFas); K.inst(null, B(0xFFFBF0), eSoff);
    K.inst(null, M(0x3A4148, { roughness: .4, metalness: .6 }), eFrame); K.inst(null, M(0xA9C6DE, { roughness: .05, metalness: .5, transparent: true, opacity: .55 }), eGlass);
    K.inst(null, M(0x2A2F35, { roughness: .95 }), eMat); K.inst(null, M(0xBFC6CD, { roughness: .8 }), ePl);
    K.inst(null, M(0xB8B2A6, { roughness: .9 }), plinthL); K.inst(null, M(0x2673B5, { roughness: .5 }), plinthCap);
    K.inst(shrubGeo, M(0x4E7D57, { roughness: .9 }), ePlTop);
    function signTex(text, bg, fg, w) {
      return K.canvasTex(w || 256, 64, function (x, W2, H2) { x.fillStyle = bg; x.fillRect(0, 0, W2, H2); x.fillStyle = fg || '#fff'; x.font = '800 34px "Onest","Segoe UI",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, W2 / 2, H2 / 2 + 2); });
    }
    // sky bridge between the two western blocks, glazed with mullions
    box(4, 3.2, 26, M(0x9DB8CF, { roughness: .1, metalness: .6 }), -31, 14, -22);
    var sbM = []; for (var sbz = -34; sbz <= -10; sbz += 2.4) { sbM.push([-31, 14, sbz, 4.2, 3.3, .12]); }
    K.inst(null, mullM, sbM);

    /* ---------- porte-cochere drop-off + Block A entrance (east face, x = -19) ---------- */
    var pc = new T.Group(), canopy = M(0xF4F6F8, { roughness: .45, metalness: .2 }), colM = M(0xDCE1E5, { roughness: .5, metalness: .3 });
    box(9.5, .55, 12, canopy, 0, 4.9, 0, pc);
    box(9.7, .12, 12.2, B(0x2673B5), 0, 4.6, 0, pc);                                   // blue soffit band
    [[-3.6, -5.2], [3.6, -5.2], [3.6, 5.2]].forEach(function (q) { cyl(.24, .24, 4.6, 14, colM, q[0], 2.3, q[1], pc); });
    box(3.2, .18, 10, kerb, -3.2, .09, 0, pc);                                           // drop-off island kerb
    var dropBoard = new T.Mesh(new T.PlaneGeometry(7.2, .9), B(0xffffff, { map: K.titleBoard(['DROP-OFF · BLOCK A']) }));
    dropBoard.position.set(4.83, 4.9, 0); dropBoard.rotation.y = Math.PI / 2; pc.add(dropBoard);
    pc.position.set(-14.2, 0, 4); scene.add(pc);
    // entrance doors on Block A east face
    var doorGlass = M(0xA9C6DE, { roughness: .05, metalness: .5, transparent: true, opacity: .55 });
    box(.12, 3.2, 6.4, doorGlass, -18.9, 1.6, 4);
    box(.3, .3, 6.8, colM, -18.85, 3.3, 4);
    for (var dz = 1; dz <= 7; dz += 1.6) box(.16, 3.2, .1, colM, -18.82, 1.6, dz);
    // counting line on the paving + camera over the doors
    var countLine = new T.Mesh(new T.PlaneGeometry(.35, 4.8), new T.MeshBasicMaterial({ color: 0x2673B5, transparent: true, opacity: .8, depthWrite: false }));
    countLine.rotation.x = -Math.PI / 2; countLine.position.set(-16.6, .07, 2.4); scene.add(countLine);
    var doorCam = K.camModel(scene, .9); doorCam.position.set(-18.4, 4.2, 2.4); doorCam.rotation.order = 'YXZ'; doorCam.rotation.y = -Math.PI / 2; doorCam.rotation.x = -.85;
    var doorCone = K.viewCone(new T.Vector3(-18.2, 4.1, 2.4), new T.Vector3(-15.4, 0, 2.4), 4.6, 3.4);
    // the drop-off car is parked (engine off, hazard lights) north of the zebra; people use the zebra only
    var dropCar = K.car(0xC9CED4, 'suv'); dropCar.position.set(-13, 0, 8.1); scene.add(dropCar);
    // planters + bollards fencing the drop-off lane from the entrance paving (gap at the zebra)
    var plantList = [], plantTop = [];
    [[-16.1, -1.2], [-16.1, 6.4], [-16.1, 8.6], [-9.8, 6.4], [-9.8, 8.6], [-9.8, -1.2]].forEach(function (q) { plantList.push([q[0], .35, q[1], .9, .7, 1.8]); plantTop.push([q[0], .82, q[1], .8, .4, 1.6]); });
    K.inst(null, M(0xBFC6CD, { roughness: .8 }), plantList); K.inst(shrubGeo, M(0x5E8C5A, { roughness: .9 }), plantTop);
    // entrance walkers: four single-file lanes over the drop-off zebra (two in, two out), never through the parked car
    var entrants = [], nEnt = MOB ? 4 : 8, ENT_Z = [.7, 1.85, 3.0, 4.15];
    for (var en = 0; en < nEnt; en++) {
      var ln = en % 4, ep = student(en + 10);
      Object.assign(ep.userData, { z: ENT_Z[ln], ph: (en >> 2) * .5 + ln * .13, dir: ln < 2 ? 1 : -1 }); scene.add(ep); entrants.push(ep);   // keep the limb refs
    }

    /* ---------- trees (deciduous, oval, conifer, birch, flowering, palm), lights, street furniture ---------- */
    var treeStep = MOB ? 16 : 9;
    for (var tz = -80; tz < 36; tz += treeStep) {
      var westClear = tz > -2 && tz < 38;
      if (!westClear && clearOf(-7.6, tz, 1.6)) K.tree(-7.6, tz, .95, null, (tz / treeStep | 0) % 3 === 0 ? 'cone' : null);
      if (!(tz + 4 > 0 && tz + 4 < 22) && clearOf(7.6, tz + 4, 1.6)) K.tree(7.6, tz + 4, 1);
    }
    if (!MOB) for (var tz2 = 50; tz2 < 110; tz2 += 12) { K.tree(-9, tz2, .9); K.tree(9, tz2 + 5, .9, null, 'oval'); }
    [[-10, -8], [-12.5, -12], [-21, -6], [-21, 14]].forEach(function (q) { K.tree(q[0], q[1], 1, null, 'palm'); });   // palms around the drop-off
    // lawn courts in the plaza with raised edging, planted with birches, flowering trees and shrub clumps
    var edgeC = [], clump = [];
    [[-16, -24, 5, 12], [14, -30, 5, 12], [-16, -66, 5, 10], [14, -70, 5, 10]].forEach(function (q, k) {
      var cl2 = K.rcv(new T.Mesh(K.geo('court' + q[2] + q[3], function () { return new T.PlaneGeometry(q[2], q[3]); }), lawnM)); cl2.rotation.x = -Math.PI / 2; cl2.position.set(q[0], .07, q[1]); scene.add(cl2);
      edgeC.push([q[0] - q[2] / 2, .14, q[1], .16, .28, q[3] + .16], [q[0] + q[2] / 2, .14, q[1], .16, .28, q[3] + .16], [q[0], .14, q[1] - q[3] / 2, q[2] - .16, .28, .16], [q[0], .14, q[1] + q[3] / 2, q[2] - .16, .28, .16]);
      for (var tt = 0; tt < 3; tt++) {
        var tz3 = q[1] - q[3] / 2 + 2 + tt * (q[3] - 4) / 2;
        if ((tt + k) % 2) K.tree(q[0] - .8, tz3, .9, null, 'column'); else K.tree(q[0] + .6, tz3, .75, null, 'bloom');
        clump.push([q[0] + 1.6, .35, tz3 + 1.1, .55, .45, .55], [q[0] - 1.7, .3, tz3 - .9, .45, .4, .45]);
      }
    });
    K.inst(null, M(0xBFC6CD, { roughness: .8 }), edgeC);
    for (var lz = -70; lz < 36; lz += 20) { if (clearOf(-5.4, lz, .6)) K.streetLight(-5.4, lz, 0); if (clearOf(5.4, lz + 10, .6)) K.streetLight(5.4, lz + 10, Math.PI); }
    // street furniture models (merged, instanced): slatted bench with cast frames + armrests, bollard with a domed cap
    // and reflective band, post-top lantern, Sheffield cycle stand, bicycle
    var benchG = (function () {
      var b = K.builder(), wd = 0xB98A5A, ir = 0x2A2F35;
      for (var sl = 0; sl < 3; sl++) b.box(1.9, .045, .14, wd, 0, .46, -.17 + sl * .17);
      for (var bl = 0; bl < 2; bl++) b.box(1.9, .12, .035, wd, 0, .66 + bl * .17, -.31 - bl * .02, 'm', -.12);
      [-.82, .82].forEach(function (x) { b.box(.06, .44, .48, ir, x, .22, 0, 's'); b.box(.06, .52, .06, ir, x, .7, -.3, 's', -.12); b.box(.06, .05, .4, ir, x, .65, -.04, 's'); });
      return b.build();
    })();
    var bollG = (function () {
      var b = K.builder(); b.cyl(.1, .1, .82, 12, 0x3A4148, 0, .41, 0, 's'); b.sph(.1, 0x3A4148, 0, .82, 0, 's', 1, .5, 1); b.cyl(.106, .106, .06, 12, 0xE8ECEF, 0, .7, 0, 'e'); b.cyl(.15, .15, .03, 12, 0x2A2F35, 0, .015, 0, 's');
      return b.build();
    })();
    var lanternG = (function () {
      var b = K.builder(), dk = 0x3A4148;
      b.cyl(.1, .14, .3, 10, dk, 0, .15, 0, 's'); b.cyl(.06, .07, 3.6, 10, dk, 0, 2.0, 0, 's');
      b.cyl(.2, .26, .08, 12, 0x2A2F35, 0, 3.84, 0, 's'); b.cyl(.2, .2, .34, 12, 0xFFF4D6, 0, 4.05, 0, 'e'); b.cyl(.06, .28, .16, 12, 0x2A2F35, 0, 4.3, 0, 's'); b.cyl(.03, .03, .12, 6, dk, 0, 4.44, 0, 's');
      return b.build();
    })();
    var standG = (function () {
      var b = K.builder(), s = 0x9AA4AE; b.cyl(.025, .025, .5, 8, s, -.36, .25, 0, 's'); b.cyl(.025, .025, .5, 8, s, .36, .25, 0, 's');
      b.geo(new T.TorusGeometry(.36, .025, 6, 14, Math.PI), s, 0, .5, 0, 's', 0, 0, 0, 1, 1, 1, true); return b.build();
    })();
    var bikeG = (function () {
      var b = K.builder(), F = 0xffffff, TY = 0x16191C, ST = 0xB9C0C7, DK = 0x22272C, V3 = function (x, y, z) { return new T.Vector3(x, y, z); };
      [-.52, .52].forEach(function (z) {
        b.geo(new T.TorusGeometry(.33, .03, 6, 20), TY, 0, .36, z, 'm', 0, Math.PI / 2, 0, 1, 1, 1, true);                 // tyre
        b.geo(new T.TorusGeometry(.3, .01, 4, 20), ST, 0, .36, z, 's', 0, Math.PI / 2, 0, 1, 1, 1, true);                  // rim
        if (!MOB) for (var k = 0; k < 8; k++) b.box(.006, .58, .012, ST, 0, .36, z, 's', k * Math.PI / 8);                // spokes
        b.cyl(.03, .03, .1, 8, ST, 0, .36, z, 's', 0, 0, Math.PI / 2);                                                     // hub
      });
      var BB = V3(0, .33, -.05), SA = V3(0, .86, -.18), HT = V3(0, .84, .4), HB = V3(0, .66, .45), RA = V3(0, .36, -.52), FA = V3(0, .36, .52);
      b.rod(BB, SA, .022, F, 'p'); b.rod(BB, HB, .025, F, 'p'); b.rod(SA, HT, .02, F, 'p'); b.rod(HB, HT, .026, F, 'p');      // seat, down, top, head tubes
      b.rod(BB, RA, .015, F, 'p'); b.rod(V3(0, .81, -.18), RA, .014, F, 'p'); b.rod(HB, FA, .018, F, 'p');                  // stays, fork
      b.rod(SA, V3(0, .96, -.2), .015, ST, 's'); b.box(.14, .05, .26, DK, 0, .99, -.22, 'm');                              // seat post + saddle
      b.rod(HT, V3(0, .98, .36), .016, ST, 's'); b.box(.56, .022, .022, ST, 0, .99, .36, 's');                              // stem + bar
      b.box(.05, .03, .1, DK, -.27, .99, .36, 'm'); b.box(.05, .03, .1, DK, .27, .99, .36, 'm');                             // grips
      b.geo(new T.TorusGeometry(.09, .012, 4, 14), 0x5A6470, -.04, .33, -.05, 's', 0, Math.PI / 2, 0, 1, 1, 1, true);       // chainring
      b.box(.02, .02, .32, 0x5A6470, -.05, .33, -.05, 's', .9); b.box(.1, .02, .06, DK, -.1, .2, .06, 'm'); b.box(.1, .02, .06, DK, .02, .46, -.16, 'm'); // crank, pedals
      b.rod(V3(-.04, .42, -.05), V3(-.04, .4, -.52), .006, 0x3A4148, 's'); b.rod(V3(-.04, .24, -.05), V3(-.04, .32, -.52), .006, 0x3A4148, 's'); // chain
      return b.build();
    })();
    // benches + litter bins along the west walkway (kept clear of the drop-off, the pavilion and the shuttle stop)
    var benchI = [], binList = [], bollI = [], totem = [], lantI = [];
    for (var bz2 = -66; bz2 < 30; bz2 += 18) if (bz2 < -32 || bz2 === -12) { benchI.push([-11.6, .05, bz2, 1, 1, 1, Math.PI / 2]); binList.push([-11.6, .45, bz2 + 1.6, .26, .9, .26]); }
    for (var bo = -76; bo < 38; bo += 3.2) { if (clearOf(-8, bo, .4)) bollI.push([-8, .05, bo]); if (clearOf(8, bo + 1.6, .4)) bollI.push([8, .05, bo + 1.6]); }
    [[-11.4, -43], [11.4, -20], [11.4, 14]].forEach(function (q) { totem.push([q[0], 1.2, q[1], .5, 2.4, .16]); totFace.push([q[0], 1.3, q[1] + .09, .44, 2.1, 1], [q[0], 1.3, q[1] - .09, .44, 2.1, 1, Math.PI]); });
    // wayfinding sign face (one small texture shared by every totem)
    var totTex = K.canvasTex(128, 256, function (x, w, h) {
      x.fillStyle = '#2673B5'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.fillRect(10, 10, w - 20, 4);
      x.font = '800 22px "Onest","Segoe UI",sans-serif'; x.textAlign = 'center';
      ['BLOCKS', 'A · B · C', 'PARKING', 'SHUTTLE', 'SECURITY'].forEach(function (t, k) { x.fillText(t, w / 2, 48 + k * 44); });
    });
    K.inst(new T.CylinderGeometry(1, .85, 1, 10), M(0x5A6470, { roughness: .5, metalness: .4 }), binList);
    K.inst(null, M(0x2673B5, { roughness: .5 }), totem.concat(eTot)); K.inst(new T.PlaneGeometry(1, 1), B(0xffffff, { map: totTex }), totFace);
    // post-top lanterns on the outer walkway edges (a different family from the road lights)
    for (var pl2 = -75; pl2 < 36; pl2 += 18) [[-12.1, pl2], [12.1, pl2 + 9]].forEach(function (q) {
      if (!clearOf(q[0], q[1], .8) || (q[0] < 0 ? q[1] > 10 : (q[1] > -3 && q[1] < 15) || q[1] > 36)) return;   // cycle shelter, pavilion, ramp, wall
      lantI.push([q[0], .05, q[1]]);
    });
    // shuttle stop on the west walkway: glazed shelter (roof, back + side glass, posts), bench, lit map panel,
    // SHUTTLE board and a stop flag at the kerb; two students waiting inside
    var sh = new T.Group(), shSteel = M(0x3A4148, { roughness: .4, metalness: .6 }), shGlass = M(0xBFD6EA, { roughness: .05, metalness: .3, transparent: true, opacity: .35 });
    box(2.4, .14, 5.4, M(0xF4F6F8, { roughness: .4, metalness: .2 }), 0, 2.62, 0, sh); box(2.44, .2, .06, B(0x2673B5), 0, 2.52, 2.7, sh);
    [[-1, -2.5], [-1, 2.5], [.9, -2.5], [.9, 2.5]].forEach(function (q) { box(.08, 2.55, .08, shSteel, q[0], 1.28, q[1], sh); });
    box(.04, 1.9, 4.9, shGlass, -1, 1.3, 0, sh); box(1.8, 1.9, .04, shGlass, 0, 1.3, -2.5, sh);
    box(.5, .06, 3, M(0xB98A5A, { roughness: .7 }), -.6, .48, .2, sh); box(.06, .45, 3, shSteel, -.6, .24, .2, sh);
    box(.08, 1.6, 1.1, B(0xDCEBF7), -.96, 1.4, 2, sh);
    var shB = new T.Mesh(new T.PlaneGeometry(1.9, .46), B(0xffffff, { map: signTex('SHUTTLE', '#2673B5') })); shB.position.set(1.22, 2.95, 0); shB.rotation.y = Math.PI / 2; sh.add(shB);
    box(.06, .5, 2, M(0x1C2733), 1.18, 2.95, 0, sh);
    cyl(.05, .05, 3, 8, shSteel, 4.3, 1.5, 3.5, sh); box(.06, .7, .5, B(0x2673B5), 4.3, 2.75, 3.5, sh);
    if (!MOB) [[-.2, -1], [.1, 1.2]].forEach(function (q, k) { var wp2 = student(k + 20); wp2.position.set(q[0], .06, q[1]); wp2.rotation.y = Math.PI / 2 + (k ? .4 : -.2); sh.add(wp2); });
    sh.position.set(-12.6, 0, -33.5); scene.add(sh);
    // gate fence: welded-mesh panels between the railing posts on top of the boundary wall, pier caps and lamps
    var meshTex = K.canvasTex(64, 64, function (x, w, h) { x.clearRect(0, 0, w, h); x.strokeStyle = '#8E989F'; x.lineWidth = 3; for (var i = 0; i <= 64; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); } }, [168, 3]);
    var meshM = new T.MeshStandardMaterial({ map: meshTex, transparent: true, alphaTest: .4, side: T.DoubleSide, roughness: .5, metalness: .5 });
    [-48, 48].forEach(function (cx) { var fp = new T.Mesh(new T.PlaneGeometry(84, 1.2), meshM); fp.position.set(cx, 2.2, 42); scene.add(fp); });
    [-5.6, 0, 5.6].forEach(function (px) { box(1, .2, 1, M(0xD3D9DE, { roughness: .6 }), px, 3.7, 42); box(.36, .3, .36, B(0xFFF4D6), px, 3.95, 42); });
    // cycle shelter between the drop-off and the pavilion, west of the walkway: pad, four posts, mono-pitch roof with
    // a blue fascia, six Sheffield stands with bicycles parked alongside
    var cycPad = K.rcv(new T.Mesh(new T.BoxGeometry(2.8, .06, 6.8), M(0xC9CED2, { roughness: .9 }))); cycPad.position.set(-12.95, .03, 14.4); scene.add(cycPad);
    [[-14.2, 11.2], [-14.2, 17.6], [-11.7, 11.2], [-11.7, 17.6]].forEach(function (q) { box(.08, q[0] < -13 ? 2.45 : 2.75, .08, shSteel, q[0], q[0] < -13 ? 1.285 : 1.435, q[1]); });
    var cycRoof = box(2.9, .08, 6.9, M(0xF4F6F8, { roughness: .4, metalness: .2 }), -12.95, 2.7, 14.4); cycRoof.rotation.z = .12;
    var cycFas = box(.06, .22, 6.9, B(0x2673B5), -11.5, 2.83, 14.4);
    var standI = [], bikeI = [], bikeC = [0x2B5C9E, 0xB3261E, 0x1F8A5B, 0xF2F3F4, 0x2D3338, 0xE0A42B];
    for (var rk = 0; rk < 6; rk++) {
      standI.push([-12.9, .06, 11.8 + rk * 1.1]);
      if (!MOB || rk % 2 === 0) if (rk !== 3) bikeI.push([-12.9, .06, 12.12 + rk * 1.1, 1, 1, 1, Math.PI / 2 * (rk % 2 ? -1 : 1)]);
    }
    K.instMerged(standG, standI); K.instMerged(bikeG, bikeI, null, bikeC);

    /* ---------- landscaped quads between the blocks: four lawns with kerbs around cross paths, a round planter with a
       flowering tree, outer hedges, flower beds along the paths, varied trees, shrubs, benches and lanterns ---------- */
    var quadKerb = [], planterL = [], soilTop = [];
    function quad(cx, cz, w, d) {
      var pw = 2.4, kinds = ['round', 'cone', 'oval', 'column'];
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q, k) {
        var lw = (w - pw) / 2, ld = (d - pw) / 2, lx = cx + q[0] * (pw / 2 + lw / 2), lz = cz + q[1] * (pw / 2 + ld / 2);
        var lawn = K.rcv(new T.Mesh(K.geo('qlawn' + lw + '_' + ld, function () { return new T.PlaneGeometry(lw - .16, ld - .16); }), lawnM)); lawn.rotation.x = -Math.PI / 2; lawn.position.set(lx, .08, lz); scene.add(lawn);
        quadKerb.push([lx, .07, lz - ld / 2, lw, .14, .16], [lx, .07, lz + ld / 2, lw, .14, .16], [lx - lw / 2, .07, lz, .16, .14, ld - .16], [lx + lw / 2, .07, lz, .16, .14, ld - .16]);
        hedgeList.push([lx, .45, lz + q[1] * (ld / 2 - .55), lw - 1.4, .7, .8], [lx + q[0] * (lw / 2 - .55), .45, lz - q[1] * .5, .8, .7, ld - 2.6]);
        bed(lx - q[0] * (lw / 2 - .6), lz - q[1] * .2, .8, ld - 2.9);
        K.tree(lx + q[0] * .4, lz + q[1] * .6, .9 + (k % 2) * .15, null, kinds[(k + Math.round(cx)) % 4]);
        clump.push([lx + q[0] * (lw / 2 - 1.5), .3, lz + q[1] * (ld / 2 - 1.6), .5, .4, .5], [lx - q[0] * 1.2, .28, lz + q[1] * (ld / 2 - 1.5), .42, .36, .42]);
        if (!MOB) benchI.push([lx, .08, lz - q[1] * (ld / 2 - .45), 1, 1, 1, q[1] > 0 ? Math.PI : 0]);
        lantI.push([cx + q[0] * 1.95, .08, cz + q[1] * 1.95]);
      });
      planterL.push([cx, .23, cz, 1.5, .46, 1.5]); soilTop.push([cx, .47, cz, 1.36, .04, 1.36]);
      K.tree(cx, cz, .8, null, 'bloom');
    }
    quad(31, -31, 22, 20); quad(-31, -22, 18, 24);

    /* ---------- sports court (east of the deck): acrylic surface with full basketball lines, padded hoops on
       overhanging posts, chain-link fence, four floodlight masts, three students playing ---------- */
    var CX = 58, CZ = 22;
    var courtT = K.canvasTex(512, 1024, function (x, w, h) {
      x.fillStyle = '#3F8A5A'; x.fillRect(0, 0, w, h);
      var sx = w / 19, sy = h / 32, ox = 2 * sx, oy = 2 * sy, cw2 = 15 * sx, ch = 28 * sy;
      x.fillStyle = '#2E6FA8'; x.fillRect(ox, oy, cw2, ch);
      x.fillStyle = '#C9733A'; [oy, oy + ch - 5.8 * sy].forEach(function (ky) { x.fillRect(ox + (cw2 - 4.9 * sx) / 2, ky, 4.9 * sx, 5.8 * sy); });
      x.strokeStyle = '#FFFFFF'; x.lineWidth = 5;
      x.strokeRect(ox, oy, cw2, ch); x.beginPath(); x.moveTo(ox, oy + ch / 2); x.lineTo(ox + cw2, oy + ch / 2); x.stroke();
      x.beginPath(); x.arc(ox + cw2 / 2, oy + ch / 2, 1.8 * sx, 0, 7); x.stroke();
      [[oy, 1], [oy + ch, -1]].forEach(function (e) {
        x.strokeRect(ox + (cw2 - 4.9 * sx) / 2, e[1] > 0 ? e[0] : e[0] - 5.8 * sy, 4.9 * sx, 5.8 * sy);
        x.beginPath(); x.arc(ox + cw2 / 2, e[0] + e[1] * 5.8 * sy, 1.8 * sx, 0, 7); x.stroke();
        x.beginPath(); x.arc(ox + cw2 / 2, e[0] + e[1] * 1.575 * sy, 6.75 * sx, e[1] > 0 ? 0 : Math.PI, e[1] > 0 ? Math.PI : 2 * Math.PI); x.stroke();
      });
    });
    var crt = K.rcv(new T.Mesh(new T.PlaneGeometry(19, 32), M(0xffffff, { map: courtT, roughness: .7 }))); crt.rotation.x = -Math.PI / 2; crt.position.set(CX, .045, CZ); scene.add(crt);
    var hoopG = (function () {
      var b = K.builder();
      b.box(.24, 3.7, .24, 0x3A4148, 0, 1.85, 0, 's'); b.box(.34, 1.9, .34, 0x2673B5, 0, .95, 0);                       // post + padding
      b.box(.12, .12, 2.1, 0x3A4148, 0, 3.6, 1.05, 's'); b.rod(new T.Vector3(0, 2.6, .05), new T.Vector3(0, 3.55, 1.6), .04, 0x3A4148, 's');
      b.box(1.8, 1.05, .05, 0xF4F6F8, 0, 3.45, 2.15); b.box(.59, .45, .052, 0xD6453D, 0, 3.3, 2.15); b.box(.5, .37, .056, 0xF4F6F8, 0, 3.3, 2.15);
      b.geo(new T.TorusGeometry(.23, .018, 6, 18), 0xE06A2B, 0, 3.05, 2.425, 's', Math.PI / 2, 0, 0, 1, 1, 1, true);
      b.geo(new T.CylinderGeometry(.23, .14, .4, 12, 1, true), 0xF4F6F8, 0, 2.85, 2.425, 'm', 0, 0, 0, 1, 1, 1, true);
      return b.build();
    })();
    [-1, 1].forEach(function (e) { var hg = K.meshes(hoopG); hg.position.set(CX, .045, CZ + e * 15); hg.rotation.y = e > 0 ? Math.PI : 0; });
    var chainT = K.canvasTex(64, 64, function (x, w, h) { x.clearRect(0, 0, w, h); x.strokeStyle = '#8E989F'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(0, 32); x.lineTo(32, 0); x.lineTo(64, 32); x.lineTo(32, 64); x.closePath(); x.stroke(); }, [1, 1]);
    var chainM = new T.MeshStandardMaterial({ map: chainT, transparent: true, alphaTest: .35, side: T.DoubleSide, roughness: .5, metalness: .5 });
    var fencePost = [];
    [[CX, CZ - 16, 19, 0], [CX, CZ + 16, 19, 0], [CX - 9.5, CZ, 32, Math.PI / 2], [CX + 9.5, CZ, 32, Math.PI / 2]].forEach(function (f) {
      var t2 = chainT.clone(); t2.needsUpdate = true; t2.repeat.set(f[2] / .8, 3.4 / .8);
      var fm2 = chainM.clone(); fm2.map = t2;
      var fp2 = new T.Mesh(new T.PlaneGeometry(f[2], 3.4), fm2); fp2.position.set(f[0], 1.75, f[1]); fp2.rotation.y = f[3]; scene.add(fp2);
      for (var fpk = 0; fpk <= Math.round(f[2] / 3); fpk++) { var u = -f[2] / 2 + fpk * f[2] / Math.round(f[2] / 3); fencePost.push(f[3] ? [f[0], 1.8, f[1] + u, .07, 3.6, .07] : [f[0] + u, 1.8, f[1], .07, 3.6, .07]); }
      fencePost.push(f[3] ? [f[0], 3.55, f[1], .05, .05, f[2]] : [f[0], 3.55, f[1], f[2], .05, .05]);
    });
    K.inst(new T.CylinderGeometry(1, 1, 1, 8), shSteel, fencePost.filter(function (q) { return q[4] > 1; }));
    K.inst(null, shSteel, fencePost.filter(function (q) { return q[4] < 1; }));
    var floodG = (function () {
      var b = K.builder(); b.cyl(.12, .18, 9, 10, 0x9AA4AE, 0, 4.5, 0, 's'); b.box(1.6, .1, .1, 0x9AA4AE, 0, 9, 0, 's');
      [-.6, .6].forEach(function (x) { b.box(.5, .36, .22, 0x2A2F35, x, 8.8, .15, 'm', .5); b.box(.44, .3, .02, 0xFFF4D8, x, 8.75, .27, 'e', .5); });
      return b.build();
    })();
    K.instMerged(floodG, [[CX - 10.2, 0, CZ - 16.7, 1, 1, 1, Math.PI * .25], [CX + 10.2, 0, CZ - 16.7, 1, 1, 1, -Math.PI * .25], [CX - 10.2, 0, CZ + 16.7, 1, 1, 1, Math.PI * .75], [CX + 10.2, 0, CZ + 16.7, 1, 1, 1, -Math.PI * .75]]);
    var players = [[CX - 3, CZ - 7, 2.6, 2.2, 0], [CX + 3, CZ, 2.4, 2.0, 2], [CX - 2, CZ + 7.5, 2.6, 2.1, 4]].slice(0, MOB ? 1 : 3).map(function (q, k) {
      var p = K.person([0xF2F3F4, 0xD6453D, 0x2B5C9E][k], { shorts: true, sleeve: 'short', pants: [0x2A2F35, 0x2B5C9E, 0x1C2733][k], shoe: 0xF2F3F4, seed: k + 40 });
      scene.add(p); return { p: p, c: q };
    });
    benchI.push([CX - 10.9, .05, CZ - 6, 1, 1, 1, Math.PI / 2], [CX - 10.9, .05, CZ + 6, 1, 1, 1, Math.PI / 2]);

    // furniture instancing (benches, bollards, lanterns) after every list is complete
    /* ---------- surroundings east of the campus (aerial / horizon fill): boundary wall + railing on x = 90, a perimeter
       road with kerbs, sidewalk, verge trees and street lights, a surface car park, a playing field with goals and light
       masts, a neighbouring low-rise residential quarter, and distant city blocks out to the horizon. Everything is
       instanced; phones get fewer of each. ---------- */
    var EX = 90, RDX = 97;
    box(.5, 1.0, 132, wallM, EX, .5, -24);
    var bRail = []; for (var bz5 = -89; bz5 <= 41; bz5 += 2) bRail.push([EX, 1.6, bz5, .07, 1.2, .07]); bRail.push([EX, 2.2, -24, .07, .07, 132]);
    K.inst(null, railM, bRail);
    var proad = K.rcv(new T.Mesh(new T.PlaneGeometry(9, 420), M(0x7C838A, { map: K.asphaltTex([2, 80]), roughness: .92 }))); proad.rotation.x = -Math.PI / 2; proad.position.set(RDX, .03, -20); scene.add(proad);
    var swalk = K.rcv(new T.Mesh(new T.PlaneGeometry(2.6, 420), M(0xE6E9EC, { map: K.pavingTex([1, 90], '#E3E6E9'), roughness: .9 }))); swalk.rotation.x = -Math.PI / 2; swalk.position.set(RDX + 5.8, .05, -20); scene.add(swalk);
    var pk = [[RDX - 4.6, .1, -20, .25, .2, 420], [RDX + 4.6, .1, -20, .25, .2, 420]], pm = [];
    for (var pz = -225; pz < 190; pz += 8) pm.push([RDX, .045, pz, .15, .02, 3.2]);
    K.inst(null, kerb, pk); K.inst(null, mark, pm);
    for (var tz5 = -180; tz5 < 180; tz5 += MOB ? 28 : 14) { K.tree(EX + 1.3, tz5 + 4, .85, null, (tz5 / 14 | 0) % 3 ? 'round' : 'oval'); K.tree(RDX + 8.2, tz5 + 11, .9); }
    for (var lz5 = -170; lz5 < 170; lz5 += 34) { K.streetLight(RDX - 4.4, lz5, Math.PI / 2); K.streetLight(RDX + 4.4, lz5 + 17, -Math.PI / 2); }
    // surface car park (x 107..143, z -21..31): three double rows of bays, kerbs, lamps, parked cars
    var cp = K.rcv(new T.Mesh(new T.PlaneGeometry(36, 52), M(0x80878E, { map: K.asphaltTex([4, 6]), roughness: .92 }))); cp.rotation.x = -Math.PI / 2; cp.position.set(125, .025, 5); scene.add(cp);
    var cpL = [], cpCars = [], cpK = [[107, .08, 5, .25, .16, 52], [143, .08, 5, .25, .16, 52], [125, .08, -21, 36, .16, .25], [125, .08, 31, 36, .16, .25]];
    [[111, -1], [116.2, 1], [122.6, -1], [127.8, 1], [134.2, -1], [139.4, 1]].forEach(function (rw, ri) {
      for (var b = 0; b < 18; b++) {
        var bz6 = -17.5 + b * 2.6; cpL.push([rw[0], .04, bz6 - 1.3, 5, .02, .1]); if (b === 17) cpL.push([rw[0], .04, bz6 + 1.3, 5, .02, .1]);
        if ((b * 7 + ri * 3) % 10 < (MOB ? 3 : 7)) cpCars.push([rw[0], .03, bz6, rw[1] > 0 ? Math.PI / 2 : -Math.PI / 2, K.PAINT[(b + ri * 5) % K.PAINT.length], (b + ri) % 3 ? 'car' : 'suv']);
      }
    });
    K.inst(null, mark, cpL); K.inst(null, kerb, cpK); K.carsInst(cpCars);
    [[119.4, -8], [119.4, 18], [131, -8], [131, 18]].forEach(function (q) { K.streetLight(q[0], q[1], 0); });
    // playing field (centre 134, -70): striped turf with full markings, goals, four light masts
    var pitchT = K.canvasTex(512, 768, function (x, w, h) {
      for (var i = 0; i < 12; i++) { x.fillStyle = i % 2 ? '#6FA35C' : '#78AD64'; x.fillRect(0, i * h / 12, w, h / 12 + 1); }
      var sx = w / 50, sy = h / 76, ox = 2 * sx, oy = 2 * sy, fw = 46 * sx, fh = 72 * sy;
      x.strokeStyle = '#F4F6F2'; x.lineWidth = 4; x.strokeRect(ox, oy, fw, fh);
      x.beginPath(); x.moveTo(ox, oy + fh / 2); x.lineTo(ox + fw, oy + fh / 2); x.stroke();
      x.beginPath(); x.arc(ox + fw / 2, oy + fh / 2, 8 * sx, 0, 7); x.stroke();
      [[oy, 1], [oy + fh, -1]].forEach(function (e) {
        x.strokeRect(ox + (fw - 30 * sx) / 2, e[1] > 0 ? e[0] : e[0] - 13 * sy, 30 * sx, 13 * sy);
        x.strokeRect(ox + (fw - 14 * sx) / 2, e[1] > 0 ? e[0] : e[0] - 4.5 * sy, 14 * sx, 4.5 * sy);
      });
    });
    var pitch = K.rcv(new T.Mesh(new T.PlaneGeometry(50, 76), M(0xffffff, { map: pitchT, roughness: .95 }))); pitch.rotation.x = -Math.PI / 2; pitch.position.set(134, .03, -70); scene.add(pitch);
    var goalG = (function () {
      var b = K.builder(), wt = 0xF4F6F8;
      b.cyl(.06, .06, 2.44, 8, wt, -3.66, 1.22, 0, 's'); b.cyl(.06, .06, 2.44, 8, wt, 3.66, 1.22, 0, 's'); b.cyl(.06, .06, 7.44, 8, wt, 0, 2.44, 0, 's', 0, 0, Math.PI / 2);
      b.cyl(.03, .03, 7.32, 6, 0xD9DEE2, 0, .03, -2, 's', 0, 0, Math.PI / 2);
      [-3.66, 3.66].forEach(function (x) { b.rod(new T.Vector3(x, 2.44, 0), new T.Vector3(x, 0, -2), .03, 0xD9DEE2, 's'); b.cyl(.03, .03, 2, 6, 0xD9DEE2, x, .03, -1, 's', Math.PI / 2); });
      return b.build();
    })();
    K.instMerged(goalG, [[134, .03, -106, 1, 1, 1, 0], [134, .03, -34, 1, 1, 1, Math.PI]]);
    K.instMerged(floodG, [[108.5, -109], [159.5, -109], [108.5, -31], [159.5, -31]].map(function (q) { return [q[0], 0, q[1], 1, 1, 1, Math.atan2(134 - q[0], -70 - q[1])]; }));
    // neighbouring low-rise residential quarter (x 154..214): blocks with window rows, flat roofs with parapets + plant
    var resWP = K.windowPair(6, 4, false, 31), resM = M(0xF1EDE6, { map: resWP.map, emissive: 0xFFFFFF, emissiveMap: resWP.emissive, emissiveIntensity: .2, roughness: .7 });
    var resTop = M(0xD9D6CF, { roughness: .8 }), resL = [], resPar = [], resPlant = [], resC = [];
    for (var rx = 154; rx < 216; rx += MOB ? 32 : 22) for (var rz5 = -112; rz5 < 74; rz5 += MOB ? 36 : 20) {
      if (rx < 166 && rz5 < -26) continue;                                                                // beside the playing field
      var hv = Math.abs(rx * 3 + rz5 * 7), hh = 9 + (hv % 4) * 3, ww = 15 + (hv % 3) * 2, dd = 11 + (hv % 2) * 3;
      resL.push([rx, hh / 2, rz5, ww, hh, dd]); resPar.push([rx, hh + .3, rz5, ww + .2, .6, dd + .2]); resPlant.push([rx - ww * .2, hh + 1.2, rz5, 2.4, 1.2, 1.8]);
      resC.push([0xF1EDE6, 0xE8DCCB, 0xDCE3E8, 0xEFE3D3][hv % 4]);
    }
    var o5 = new T.Object3D(), c5 = new T.Color();
    var resIM = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), [resM, resM, resTop, resTop, resM, resM], resL.length);
    resL.forEach(function (q, i) { o5.position.set(q[0], q[1], q[2]); o5.scale.set(q[3], q[4], q[5]); o5.updateMatrix(); resIM.setMatrixAt(i, o5.matrix); resIM.setColorAt(i, c5.setHex(resC[i])); });
    resIM.instanceMatrix.needsUpdate = true; resIM.instanceColor.needsUpdate = true; resIM.frustumCulled = false; K.cs(resIM); scene.add(resIM);
    K.inst(null, M(0xEDEBE6, { roughness: .7 }), resPar); K.inst(null, M(0xB9C0C7, { roughness: .5, metalness: .4 }), resPlant);
    // distant city blocks in a ring out to the horizon (fog fades them); the ring starts beyond everything above
    var farWP = K.windowPair(8, 12, true, 41), farM = M(0x9FB6CA, { map: farWP.map, emissive: 0xFFFFFF, emissiveMap: farWP.emissive, emissiveIntensity: .18, roughness: .3, metalness: .4 });
    var farL = [], seed5 = 7;
    function rnd5() { seed5 = (seed5 * 9301 + 49297) % 233280; return seed5 / 233280; }
    for (var fi = 0; fi < (MOB ? 45 : 130); fi++) {
      var ang = rnd5() * Math.PI * 2, rr = 245 + rnd5() * 220, fh2 = 14 + Math.pow(rnd5(), 2) * 70;
      farL.push([Math.cos(ang) * rr + 20, fh2 / 2, Math.sin(ang) * rr - 20, 16 + rnd5() * 22, fh2, 14 + rnd5() * 20, ang]);
    }
    var farIM = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), [farM, farM, resTop, resTop, farM, farM], farL.length);
    farL.forEach(function (q, i) { o5.position.set(q[0], q[1], q[2]); o5.scale.set(q[3], q[4], q[5]); o5.rotation.set(0, q[6], 0); o5.updateMatrix(); farIM.setMatrixAt(i, o5.matrix); farIM.setColorAt(i, c5.setHex([0xFFFFFF, 0xE6EDF3, 0xF3EEE6, 0xDDE6EE][i % 4])); });
    farIM.instanceMatrix.needsUpdate = true; farIM.instanceColor.needsUpdate = true; farIM.frustumCulled = false; scene.add(farIM);

    K.instMerged(benchG, benchI); K.instMerged(bollG, bollI); K.instMerged(lanternG, lantI);
    K.inst(hedgeGeo, hedge, hedgeList); K.inst(null, soilM, soilList);
    K.inst(bloomGeo, M(0xC86B8A, { roughness: .85 }), bloomA); K.inst(bloomGeo, M(0xE0B04A, { roughness: .85 }), bloomB); K.inst(bloomGeo, M(0xF2EEF4, { roughness: .85 }), bloomC);
    K.inst(shrubGeo, M(0x6E9A4E, { roughness: .9 }), clump);
    K.inst(null, M(0xBFC6CD, { roughness: .8 }), quadKerb); K.inst(new T.CylinderGeometry(1, 1, 1, 24), M(0xB8B2A6, { roughness: .9 }), planterL); K.inst(new T.CylinderGeometry(1, 1, 1, 24), soilM, soilTop);

    // walkway walkers: each walkway has a northbound and a southbound file (keep left), single file with spacing
    var WALK_MIN = -80, WALK_LEN = 114, walkers = [], walkLanes = {}, nWalk = MOB ? 4 : 12;
    for (var w = 0; w < nWalk; w++) {
      var side = w % 2 ? -1 : 1, d = (w >> 1) % 2 ? 1 : -1, key = side + '_' + d;
      var pp = student(w);
      var it = { p: pp, s: 0, len: .6, v: 1.25, d: d, x: side * 9.5 - d * side * .6, side: side, ph: w };
      (walkLanes[key] = walkLanes[key] || []).push(it); walkers.push(it); scene.add(pp);
    }
    Object.keys(walkLanes).forEach(function (k) { var L = walkLanes[k]; L.forEach(function (it, j) { it.s = (j + .3 * (it.side + 1)) / L.length * WALK_LEN; }); });
    // zebra crossers (students with bags): wait at the kerb, cross only on the green man with both lanes stopped
    var crossers = [], CR_Z = [ZEB_Z - .9, ZEB_Z - .3, ZEB_Z + .3, ZEB_Z + .9], nCross = MOB ? 2 : 4;
    for (var cr = 0; cr < nCross; cr++) {
      var cp = student(cr + 30, 'back'), cside = cr % 2 ? 1 : -1;
      var cu = { p: cp, z: CR_Z[cr], side: cside, x: cside * (6.6 + (cr >> 1) * .5), walking: false, ph: cr * 1.7 };
      cp.position.set(cu.x, .06, cu.z); cp.rotation.y = cside > 0 ? -Math.PI / 2 : Math.PI / 2; scene.add(cp); crossers.push(cu);
    }
    var sig = { ph: 'veh', t: 4 };

    /* ---------- 3-level parking deck (east) ----------
       Slabs with a ramp opening, three straight ramps stacked in one shaft (constant 2.9 m headroom) with kerbs and
       chevrons, downstand edge beams, columns with safety bands, perforated spandrel panels, bay lines, wheel stops at
       the front wheels, flush ceiling lights, bay guidance LEDs on stems, EV chargers, instanced parked cars on every
       level (and the roof), roof lanterns, stair + lift core, occupancy board. */
    var deck = new T.Group(), conc = M(0xD6DBE0, { roughness: .8 }), concDark = M(0xBFC6CD, { roughness: .85 });
    var DW = 26, DD = 20, LV = 3.2, RX0 = 7.3, RX1 = 12.1, RZ0 = -8, RZ1 = 4, RL = Math.hypot(RZ1 - RZ0, LV), RA = Math.atan2(LV, RZ1 - RZ0);
    box(DW, .35, DD, concDark, 0, 0, 0, deck);
    var slabL = [], beamL = [];
    for (var lv = 1; lv <= 3; lv++) {
      var sy = lv * LV;
      slabL.push([(-DW / 2 + RX0) / 2, sy, 0, RX0 + DW / 2, .35, DD], [(RX0 + RX1) / 2, sy, (-DD / 2 + RZ0) / 2, RX1 - RX0, .35, RZ0 + DD / 2],
        [(RX0 + RX1) / 2, sy, (RZ1 + DD / 2) / 2, RX1 - RX0, .35, DD / 2 - RZ1], [(RX1 + DW / 2) / 2, sy, 0, DW / 2 - RX1, .35, DD]);
      beamL.push([0, sy - .32, DD / 2 - .15, DW, .3, .3], [0, sy - .32, -DD / 2 + .15, DW, .3, .3], [DW / 2 - .15, sy - .32, 0, .3, .3, DD - .6], [-DW / 2 + .15, sy - .32, 0, .3, .3, DD - .6]);
    }
    K.inst(null, conc, slabL, deck); K.inst(null, concDark, beamL, deck);
    var colList = [];
    for (var cxp = -DW / 2 + .5; cxp <= DW / 2; cxp += 6.25) for (var czp = -DD / 2 + .5; czp <= DD / 2; czp += 6.3) colList.push([cxp, LV * 1.5, czp, .5, LV * 3, .5]);
    K.inst(null, conc, colList, deck);
    var rampGeo = K.geo('dkRamp', function () { return new T.BoxGeometry(RX1 - RX0 - .2, .3, RL); }), kerbW = M(0xEEF1F4, { roughness: .6 }), chevL = [];
    for (var rl = 0; rl < 3; rl++) {
      var ry = LV * (rl + .5), rzc = (RZ0 + RZ1) / 2, rp = K.cs(new T.Mesh(rampGeo, concDark)); rp.position.set((RX0 + RX1) / 2, ry, rzc); rp.rotation.x = -RA; deck.add(rp);
      [RX0 + .18, RX1 - .18].forEach(function (kx) { var kw = box(.16, .8, RL, kerbW, kx, ry + .55 * Math.cos(RA), rzc - .55 * Math.sin(RA), deck); kw.rotation.x = -RA; });
      for (var cv = 0; cv < 4; cv++) { var czv = RZ0 + 2 + cv * 2.6; chevL.push([(RX0 + RX1) / 2, rl * LV + (czv - RZ0) * Math.tan(RA) + .17, czv, 2.6, .02, .3, 0, -RA]); }
    }
    K.inst(null, B(0xF5F5F0), chevL, deck);
    var perfT = K.canvasTex(128, 64, function (x, w, h) { x.fillStyle = '#E9EDF0'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(70,80,90,.45)'; for (var i = 4; i < w; i += 8) for (var j = 6; j < h - 4; j += 8) { x.beginPath(); x.arc(i, j, 2.2, 0, 7); x.fill(); } x.fillStyle = 'rgba(60,70,80,.5)'; x.fillRect(0, 0, w, 3); x.fillRect(0, h - 3, w, 3); }, [12, 1]);
    var perfM = M(0xffffff, { map: perfT, roughness: .5, metalness: .3 });
    for (var lv2 = 1; lv2 <= 3; lv2++) {                                                  // perforated spandrel panels (open-sided deck)
      box(DW, .9, .1, perfM, 0, lv2 * LV + .62, DD / 2 + .06, deck); box(DW, .9, .1, perfM, 0, lv2 * LV + .62, -DD / 2 - .06, deck);
      box(.1, .9, DD, perfM, DW / 2 + .06, lv2 * LV + .62, 0, deck);
      box(DW, .06, .1, B(0x2673B5), 0, lv2 * LV + 1.1, DD / 2 + .14, deck);
    }
    var bayList = [], stopList = [], housing = [], lens = [], ledG = [], ledR = [], stemL = [], parked = [], bandList = [], aisleL = [];
    var BAYS = []; for (var dc = -2; dc <= 4; dc++) if (!MOB || dc % 2 === 0) BAYS.push(-5 + dc * 2.6);
    for (var dl = 0; dl < 4; dl++) {
      var fy = dl * LV + .175;
      BAYS.forEach(function (bx3, k) {
        [6, -6].forEach(function (bz3, side) {
          if (dl === 3 && bx3 < -6) return;                                                   // roof: the west end stays clear
          bayList.push([bx3 - 1.3, fy + .01, bz3, .1, .02, 5]); if (k === BAYS.length - 1) bayList.push([bx3 + 1.3, fy + .01, bz3, .1, .02, 5]);
          stopList.push([bx3, fy + .07, bz3 + (bz3 > 0 ? 1.8 : -1.8), 1.4, .14, .22]);       // at the front wheels of a nose-in car
          var taken = (dl * 3 + k + side * 2) % 4 !== 3 && !(dl === 3 && (k + side) % 2);
          if (taken) parked.push([bx3, fy, bz3, bz3 > 0 ? 0 : Math.PI, K.PAINT[(dl * 5 + k * 3 + side) % K.PAINT.length], (k + side) % 3 ? 'car' : 'suv']);
          if (dl < 3) { var ceil = (dl + 1) * LV - .175, lz3 = bz3 > 0 ? 3.4 : -3.4; (taken ? ledR : ledG).push([bx3, ceil - .36, lz3, .2, .2, .2]); stemL.push([bx3, ceil - .13, lz3, .03, .26, .03]); }
        });
      });
      aisleL.push([-2.5, fy + .01, 2.6, 19, .02, .12], [-2.5, fy + .01, -2.6, 19, .02, .12]);
      if (dl < 3) [-10, -5, 0, 5].forEach(function (lx2) { var ce = (dl + 1) * LV - .175; housing.push([lx2, ce - .05, 0, 2.6, .1, .4]); lens.push([lx2, ce - .105, 0, 2.4, .012, .26]); });
    }
    K.inst(null, B(0xF5F5F0), bayList, deck); K.inst(null, M(0xE0A42B, { roughness: .6 }), stopList.concat(aisleL), deck);
    K.inst(null, M(0x5A6470, { roughness: .5, metalness: .5 }), housing, deck); K.inst(null, B(0xFFFBF0), lens, deck);
    K.inst(null, B(0x34D27B), ledG.length ? ledG : [[0, -5, 0, .01, .01, .01]], deck); K.inst(null, B(0xFF3B30), ledR, deck); K.inst(null, M(0x3A4148, { metalness: .5 }), stemL, deck);
    colList.forEach(function (c) { for (var lb = 0; lb < 3; lb++) bandList.push([c[0], lb * LV + .75, c[2], .54, .5, .54]); });
    K.inst(null, M(0xE0A42B, { roughness: .6 }), bandList, deck);
    K.carsInst(parked, deck);
    K.instMerged(lanternG, [[-11.5, 3 * LV + .175, 9.2], [-11.5, 3 * LV + .175, -9.2], [4, 3 * LV + .175, 9.2], [4, 3 * LV + .175, -9.2]], deck);
    ['P1', 'P2', 'P3'].forEach(function (t, k) {
      var lb2 = new T.Mesh(K.geo('lvlb', function () { return new T.PlaneGeometry(1.6, .9); }), B(0xffffff, { map: signTex(t, '#2673B5', '#fff', 128) }));
      lb2.position.set(DW / 2 + 2.2, k * LV + 2.2, -DD / 2 + 4.25); deck.add(lb2);
    });
    var entB = new T.Mesh(new T.PlaneGeometry(3.6, .9), B(0xffffff, { map: signTex('ENTRY · P1', '#1F8A5B') })); entB.position.set(-DW / 2 - .02, 2.6, 0); entB.rotation.y = -Math.PI / 2; deck.add(entB);
    var hbTex = K.canvasTex(256, 16, function (x2, w, h) { for (var i = 0; i < 8; i++) { x2.fillStyle = i % 2 ? '#1C2228' : '#F0B44C'; x2.fillRect(i * 32, 0, 32, h); } });
    box(.2, .2, 5, M(0xffffff, { map: hbTex, roughness: .5 }), -DW / 2 + 1, 2.45, 0, deck);            // height bar inside the entry
    [-2.4, 2.4].forEach(function (hz2) { box(.03, .5, .03, M(0x9AA4AE, { metalness: .7 }), -DW / 2 + 1, 2.78, hz2, deck); });
    // stair + lift core on the north-east corner: glazed stair, blue lift shaft, roof canopy
    box(4, 3 * LV + 2.4, 4, M(0xE8EBEE, { roughness: .6 }), DW / 2 + 2.2, (3 * LV + 2.4) / 2, -DD / 2 + 2.2, deck);
    box(.06, 3 * LV + 1.6, 3.2, M(0x9DB8CF, { roughness: .08, metalness: .6 }), DW / 2 + 4.23, (3 * LV + 1.6) / 2 + .2, -DD / 2 + 2.2, deck);
    for (var sf = 1; sf < 4; sf++) box(.08, .1, 3.3, M(0xC9D0D6, { metalness: .5 }), DW / 2 + 4.25, sf * LV + .2, -DD / 2 + 2.2, deck);
    box(4.4, .3, 4.4, M(0x2673B5, { roughness: .5 }), DW / 2 + 2.2, 3 * LV + 2.55, -DD / 2 + 2.2, deck);
    // EV chargers on the ground level (in front of the two westmost north bays)
    [-11, -8.5].forEach(function (ex) {
      box(.5, 1.5, .35, M(0xF2F4F6, { roughness: .5 }), ex, .925, DD / 2 - 1.2, deck);
      box(.42, .1, .37, B(0x2673B5), ex, 1.35, DD / 2 - 1.2, deck); box(.3, .2, .02, B(0x5BE38A), ex, 1.1, DD / 2 - 1.385, deck);
      box(.08, .6, .08, M(0x2A2F35), ex + .3, .6, DD / 2 - 1.1, deck);
    });
    var deckBoard = new T.Mesh(new T.PlaneGeometry(9, 1.3), B(0xffffff, { map: K.titleBoard(['PARKING DECK']) }));
    deckBoard.position.set(0, 3 * LV + 1.9, DD / 2 + .3); deck.add(deckBoard);
    box(9.6, 1.7, .25, M(0x1C2733), 0, 3 * LV + 1.9, DD / 2 + .15, deck);
    [-4.2, 4.2].forEach(function (bx4) { box(.12, 1.2, .12, M(0x9AA4AE, { metalness: .6 }), bx4, 3 * LV + .78, DD / 2 + .15, deck); });
    // live occupancy board (canvas, redrawn when counts change)
    var occC = document.createElement('canvas'); occC.width = 512; occC.height = 256;
    var occT = new T.CanvasTexture(occC); occT.encoding = T.sRGBEncoding; occT.anisotropy = 8;
    var occ = [12, 27, 41], occKey = '';
    function drawOcc() {
      var key = occ.join(','); if (key === occKey) return; occKey = key;
      var x = occC.getContext('2d'); x.fillStyle = '#0B1520'; x.fillRect(0, 0, 512, 256);
      x.fillStyle = '#2673B5'; x.fillRect(0, 0, 512, 56);
      x.fillStyle = '#fff'; x.font = '800 30px "Onest","Segoe UI",sans-serif'; x.fillText('FREE SPACES', 22, 39);
      ['LEVEL 1', 'LEVEL 2', 'LEVEL 3'].forEach(function (l, k) {
        x.fillStyle = '#DCEBF7'; x.font = '600 28px "Geist Mono",monospace'; x.fillText(l, 22, 104 + k * 56);
        x.fillStyle = occ[k] < 15 ? '#F0B44C' : '#7BD49B'; x.font = '800 40px "Geist Mono",monospace'; x.textAlign = 'right'; x.fillText(String(occ[k]), 490, 106 + k * 56); x.textAlign = 'left';
      });
      occT.needsUpdate = true;
    }
    drawOcc();
    var occMesh = new T.Mesh(new T.PlaneGeometry(3.6, 1.8), B(0xffffff, { map: occT }));
    occMesh.position.set(-DW / 2 - .5, 2.6, DD / 2 - 2); occMesh.rotation.y = -Math.PI / 2; deck.add(occMesh);
    cyl(.1, .1, 2.6, 8, M(0x9AA4AE, { metalness: .6 }), -DW / 2 - .5, 1.3, DD / 2 - 2, deck);
    deck.position.set(30, 0, 26); scene.add(deck);
    // ground-level entry barrier into the deck (west side, on the driveway), car entering along the aisle
    var deckArm = barrier(16.2, DRV_Z - 2.4, 1, 4); deckArm.parent.rotation.y = -Math.PI / 2;
    var deckRead = K.poleCam(15.6, DRV_Z + 3.2, 3.2, new T.Vector3(12, .8, DRV_Z));
    var deckCar = K.car(0x2B5C9E, 'car'); deckCar.rotation.y = Math.PI / 2; scene.add(deckCar);
    var deckSt = { s: null, a: 0 };

    /* ---------- basement ramp (down to P2) with two ramp cameras ---------- */
    var rampG = new T.Group();
    var ramp = K.rcv(new T.Mesh(new T.PlaneGeometry(7, 16), M(0x6E757C, { map: K.asphaltTex([2, 4]), roughness: .9 })));
    ramp.rotation.x = -Math.PI / 2 + .16; ramp.position.set(0, -1.2, 0); rampG.add(ramp);
    box(.4, 1.4, 16, M(0xD3D9DE), -3.7, .2, 0, rampG); box(.4, 1.4, 16, M(0xD3D9DE), 3.7, .2, 0, rampG);
    box(8, 3.2, 1, M(0xE8EBEE), 0, 1.6, -8.4, rampG); box(6.6, 2.4, .2, B(0x111820), 0, 1.2, -7.9, rampG);
    box(7, .3, .3, M(0xD3D9DE), 0, 2.55, -7.75, rampG); box(6.4, .16, .12, M(0xffffff, { map: hbTex, roughness: .5 }), 0, 2.28, -7.6, rampG);
    [-2.2, 0, 2.2].forEach(function (lx) { box(.9, .04, .2, B(0xFFFBF0), lx, 2.36, -7.7, rampG); });
    var pSign = new T.Mesh(new T.PlaneGeometry(6, 1), B(0xffffff, { map: K.titleBoard(['PARKING P2']) })); pSign.position.set(0, 3.6, -7.85); rampG.add(pSign);
    var rampCam1 = K.camModel(rampG, .85); rampCam1.position.set(-3.2, 3, -7.6); rampCam1.rotation.order = 'YXZ'; rampCam1.rotation.y = Math.PI + .3; rampCam1.rotation.x = -.45;
    rampG.position.set(14.5, 0, 6); scene.add(rampG);
    // the ramp camera that drops its stream (pole beside the ramp mouth)
    var pkCamTarget = new T.Vector3(14.5, 0, 8);
    var pkCam = K.poleCam(11.6, 19, 6, pkCamTarget);
    var pkCone = K.viewCone(new T.Vector3(11.6, 5.8, 19), pkCamTarget, 11, 4.5);
    // cameras on buildings
    [[-19, 10, 6, 1], [18, 9, -2, -1], [-21, 9, -44, 1], [17, 12, -50, -1]].forEach(function (q) {
      var c2 = K.camModel(scene, 1); c2.position.set(q[0], q[1], q[2]); c2.rotation.order = 'YXZ'; c2.rotation.y = q[3] > 0 ? -Math.PI / 2 : Math.PI / 2; c2.rotation.x = -.35;
    });

    /* ---------- security pavilion with the Cygnus 3×3 wall + campus map ---------- */
    var pav = new T.Group();
    var TL = 'img/real/tiles/';
    var wall = K.videoWall([
      { src: TL + 't7-campus.webp', label: 'GATE 1 · IN' }, { src: TL + 't7-campus.webp', label: 'BLOCK A', crop: [0, 0, .62, .62] },
      { src: TL + 't7-campus.webp', label: 'BLOCK B', crop: [.38, 0, .62, .62] }, { src: TL + 't9-warehouse.webp', label: 'SERVICE YARD' },
      { src: TL + 't7-campus.webp', label: 'WALKWAY', crop: [.2, .38, .62, .62] }, { src: TL + 't6-city.webp', label: 'GATE 2 · OUT' },
      { src: TL + 't7-campus.webp', label: 'RAMP · CAM 04', crop: [.38, .38, .62, .62] }, { src: TL + 't6-city.webp', label: 'ACCESS ROAD', crop: [0, .3, .7, .7] },
      { src: TL + 't7-campus.webp', label: 'DROP-OFF', crop: [0, .38, .62, .62] }]);
    // control room interior (opens toward the road, +x): curved 3×3 bezelled wall, curved console of four desks
    // with twin monitors, keyboards, chairs and operators, ceiling panels, frameless glazing; no columns inside
    var room = K.controlRoom({ wall: wall, w: 14, d: 8.4, h: 5.2, seats: MOB ? 3 : 4, wallW: 6.6, spread: .21, deskZ: 3.4 });
    room.rotation.y = Math.PI / 2; room.position.y = .3; pav.add(room);
    box(9.2, .5, 14.8, M(0xE2E6EA, { roughness: .6 }), 0, 5.45, 0, pav);                 // roof slab + fascia
    box(.3, .7, 14.9, B(0x2673B5), 4.6, 5.3, 0, pav);
    box(9.6, .3, 15.2, M(0xBFC6CD, { roughness: .8 }), 0, .15, 0, pav);                   // plinth
    var pvBoard = new T.Mesh(new T.PlaneGeometry(7, .9), B(0xffffff, { map: K.titleBoard(['SECURITY CONTROL']) }));
    pvBoard.rotation.y = Math.PI / 2; pvBoard.position.set(4.77, 6.2, 0); pav.add(pvBoard);
    box(.2, 1.1, 7.4, M(0x1C2733), 4.66, 6.2, 0, pav);
    var mapTex = K.canvasTex(512, 320, function (x, w, h) {
      x.fillStyle = '#F2F7FC'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#DCEBF7'; [[60, 60, 120, 80], [300, 50, 140, 70], [60, 190, 110, 90], [290, 180, 150, 100]].forEach(function (r) { x.fillRect(r[0], r[1], r[2], r[3]); });
      x.strokeStyle = '#9AA9B9'; x.lineWidth = 10; x.beginPath(); x.moveTo(230, 0); x.lineTo(230, h); x.stroke();
      x.fillStyle = '#2673B5'; [[120, 100], [370, 85], [115, 235], [365, 230], [230, 300], [230, 40], [420, 290]].forEach(function (p2) { x.beginPath(); x.arc(p2[0], p2[1], 9, 0, 7); x.fill(); });
      x.fillStyle = '#0A1A2B'; x.font = '600 20px "Geist Mono",monospace'; x.fillText('CAMPUS MAP', 16, 28);
    });
    // campus map on a wall display (north side wall, angled toward the room)
    box(.12, 2.3, 3.5, M(0x10161C, { roughness: .5, metalness: .3 }), -1.2, 2.8, 6.78, pav).rotation.y = Math.PI / 2;
    var mapMesh = new T.Mesh(new T.PlaneGeometry(3.3, 2.1), B(0xffffff, { map: mapTex })); mapMesh.position.set(-1.2, 2.8, 6.7); mapMesh.rotation.y = Math.PI; pav.add(mapMesh);
    // playback timeline strip under the wall
    var tlC = document.createElement('canvas'); tlC.width = 1024; tlC.height = 72;
    var tlT = new T.CanvasTexture(tlC); tlT.encoding = T.sRGBEncoding; var tlLast = -1;
    function drawTimeline(u) {
      var q = Math.round(u * 200); if (q === tlLast) return; tlLast = q;
      var x = tlC.getContext('2d'); x.fillStyle = '#0B1520'; x.fillRect(0, 0, 1024, 72);
      x.fillStyle = '#1F3449'; x.fillRect(110, 30, 880, 12);
      x.fillStyle = '#2673B5'; x.fillRect(110, 30, 880 * u, 12);
      [.22, .47, .81].forEach(function (m) { x.fillStyle = '#F0B44C'; x.fillRect(110 + 880 * m - 3, 22, 6, 28); });
      x.fillStyle = '#fff'; x.beginPath(); x.arc(110 + 880 * u, 36, 11, 0, 7); x.fill();
      x.fillStyle = '#DCEBF7'; x.font = '700 24px "Geist Mono",monospace'; x.fillText('▶ REC', 14, 45);
      tlT.needsUpdate = true;
    }
    drawTimeline(0);
    var tlMesh = new T.Mesh(new T.PlaneGeometry(4.4, .32), B(0xffffff, { map: tlT })); tlMesh.rotation.y = Math.PI / 2; tlMesh.position.set(-4.2 + .82, .86, 0); pav.add(tlMesh);
    pav.position.set(-16, 0, 26); scene.add(pav);

    /* ---------- moving vehicles: gate car, shuttle buses, internal traffic ---------- */
    var gateCar = K.car(0xF2F3F4, 'car'); gateCar.rotation.y = Math.PI; scene.add(gateCar);
    var exitCar = K.car(0x8E959C, 'suv'); scene.add(exitCar);
    var gateSt = { s: null, a: 0 }, exitSt = { s: null, a: 0 };
    // campus shuttle: split glazing with pillars, destination board, doors, mirrors, roof AC pod, rims
    function shuttle() {
      var g = new T.Group(), body = M(0xF2F4F6, { roughness: .35, metalness: .3 }), glass = M(0x15212C, { roughness: .06, metalness: .85 }), tyre = M(0x16191C, { roughness: .9 }),
        rim = M(0xB9C0C7, { metalness: .8, roughness: .3 }), dark = M(0x22272C, { roughness: .55 });
      box(2.4, 2.6, 8.4, body, 0, 1.7, 0, g); box(2.42, .9, 7.4, glass, 0, 2.3, -.2, g); box(2.44, .2, 8.42, B(0x2673B5), 0, 1.1, 0, g);
      box(2.2, 1.2, .06, glass, 0, 2.2, 4.21, g);                                              // windscreen
      var pil = []; for (var pz = -3.4; pz <= 3; pz += 1.6) { pil.push([1.215, 2.3, pz, .04, .92, .14]); pil.push([-1.215, 2.3, pz, .04, .92, .14]); }
      K.inst(null, body, pil, g);
      box(.04, 1.9, 1.1, dark, 1.215, 1.35, 2.6, g);                                           // door (kerb side)
      box(1.9, .3, .05, B(0xF0B44C), 0, 2.98, 4.22, g);                                        // destination board
      box(.1, .5, .14, dark, 1.32, 2.4, 4.1, g); box(.1, .5, .14, dark, -1.32, 2.4, 4.1, g);  // mirrors
      box(1.6, .35, 2.4, M(0xD9DEE2, { roughness: .5 }), 0, 3.17, -1, g);                      // roof AC pod
      box(2.42, .3, .2, dark, 0, .5, 4.2, g); box(2.42, .3, .2, dark, 0, .5, -4.2, g);          // bumpers
      [[-1.05, 2.8], [1.05, 2.8], [-1.05, -2.8], [1.05, -2.8]].forEach(function (q) {
        var wh = cyl(.45, .45, .3, 14, tyre, q[0], .45, q[1], g); wh.rotation.z = Math.PI / 2;
        var rr = cyl(.26, .26, .31, 10, rim, q[0], .45, q[1], g); rr.rotation.z = Math.PI / 2;
      });
      box(.5, .16, .05, B(0xFFF6DA), -.75, .95, 4.21, g); box(.5, .16, .05, B(0xFFF6DA), .75, .95, 4.21, g);
      box(.4, .2, .05, B(0xC2272D), -.9, .95, -4.21, g); box(.4, .2, .05, B(0xC2272D), .9, .95, -4.21, g);
      scene.add(g); return g;
    }
    var shuttles = MOB ? [shuttle()] : [shuttle(), shuttle()];
    shuttles.forEach(function (s, k) { s.userData = { dir: k ? 1 : -1, len: 8.4 }; s.rotation.y = k ? 0 : Math.PI; });
    var traffic = [], nTraffic = MOB ? 2 : 5;
    for (var tr = 0; tr < nTraffic; tr++) {
      var tc = K.car(K.PAINT[(tr + 3) % K.PAINT.length], tr % 3 ? 'car' : 'suv');
      var dirn = tr % 2 ? 1 : -1; tc.rotation.y = dirn > 0 ? 0 : Math.PI;
      tc.userData = { dir: dirn, len: tc.userData.len };
      scene.add(tc); traffic.push(tc);
    }

    // lanes: +z on x = -2.2, -z on x = +2.2; each lane is a loop from z = -90 to z = 18. Vehicles follow single
    // file with a gap, and stop at the zebra stop line while the crossing is not green for traffic.
    var LANE_MIN = -90, LANE_MAX = 18, LANE_LEN = LANE_MAX - LANE_MIN, LANE_V = 4.8;
    var laneVeh = { '1': [], '-1': [] };
    shuttles.concat(traffic).forEach(function (v) { laneVeh[String(v.userData.dir)].push({ v: LANE_V, len: v.userData.len, obj: v, dir: v.userData.dir }); });
    Object.keys(laneVeh).forEach(function (k) { var L = laneVeh[k]; L.forEach(function (it, j) { it.s = j / L.length * LANE_LEN; it.x = k === '1' ? -2.2 : 2.2; }); });
    function laneZ(it) { return it.dir > 0 ? LANE_MIN + it.s : LANE_MAX - it.s; }
    var ZEB_S = { '1': ZEB_Z - LANE_MIN, '-1': LANE_MAX - ZEB_Z };          // zebra centre in lane coordinates
    function onZebra(it) { return Math.abs(laneZ(it) - ZEB_Z) < ZEB_H + it.len / 2 + 1.5; }   // includes the stop-line apron

    /* ---------- station boards ---------- */
    // each board reads at its own station and stays out of the other stations' frames (checked by projecting every
    // board into every station camera, desktop and phone)
    K.stationBoard('01', 'Gate · plate reads', 'Access and parking', 15, 47.5, K.facing(15, 47.5, -5, 64), null, .75);
    K.stationBoard('02', 'Parking by level', 'Access and parking', 45.5, 39, -.5, null, .75);        // right of the deck, off the entry car's path
    K.stationBoard('03', 'One console', 'Cygnus', -16.5, 39.2, K.facing(-16.5, 39.2, 1, 26), null, .55);
    K.stationBoard('04', 'Camera health', 'Cygnus', 23, 10, K.facing(23, 10, 2, 27));          // set back from the camera path
    K.stationBoard('05', 'People counting', 'Cygnus', -11, -12, K.facing(-11, -12, -3, 15));

    /* ---------- tags ---------- */
    var tPlate = K.tag('<b>XX 00 AB 1234</b> · Car · entry', '', new T.Vector3(2.3, 2.6, 47));
    var tLog = K.tag('Logged · visitor · Block A · 09:41', 'light', new T.Vector3(9.5, 4, 44.5));
    var tExit = K.tag('<b>XX 00 CD 5678</b> · exit · 09:42', 'light', new T.Vector3(-2.3, 2.6, 36));
    var tDeck = K.tag('<b>Parking deck</b> · 80 free now', '', new T.Vector3(30, 13.4, 36));
    var tDeckIn = K.tag('Entry read · Level 2 · count updated', 'light', new T.Vector3(16, 2.6, DRV_Z));
    var tRamp = K.tag('Ramp cameras · P2', 'light', new T.Vector3(14.5, 4.4, 10));
    var tWall = K.tag('Cygnus wall · gates · blocks · parking', '', new T.Vector3(-19.6, 5.3, 26));
    var tMap = K.tag('Campus map · cameras by building', 'light', new T.Vector3(-17.2, 3.9, 32.6));
    var tPlay = K.tag('Playback · 24×7 recording', 'light', new T.Vector3(-19.2, 1.1, 23.4));
    var tLost = K.tag('<b>Ramp · cam 04</b> · stream lost', 'alert', new T.Vector3(11.6, 3.6, 19));
    var tTicket = K.tag('Ticket raised · maintenance', 'light', new T.Vector3(14.5, 2.6, 4));
    var tCount = K.tag('<b>Block A</b> · in 1,284 · out 1,102', '', new T.Vector3(-17, 3.6, 2.4));
    var tLine = K.tag('Counting line · both directions', 'light', new T.Vector3(-16.6, .4, -.6));

    /* ---------- journey keys ---------- */
    var V = function (x, y, z) { return new T.Vector3(x, y, z); };
    var KEYS = [
      { pos: V(-5, 6.2, 64), look: V(2.5, 1.6, 42) },
      { pos: V(8, 16, 54), look: V(28, 4.5, 28), lift: 4 },                 // high enough to clear the gate gantry + cabin
      { pos: V(1, 5, 26), look: V(-19, 3, 28.5), lift: 6 },
      { pos: V(-5, 10, 19), look: V(17.8, 1.5, 8.8), lift: 5 },          // sight line to board 04 passes clear of the deck corner
      { pos: V(-3, 4.2, 15), look: V(-17.5, 1.7, 4), lift: 5 }
    ];
    if (MOB) { KEYS.forEach(function (k) { k.pos.add(new T.Vector3(0, 1.5, 4)); }); KEYS[3].pos.set(-5, 12, 20); KEYS[3].look.set(16.4, 1.5, 7.2); tLost.pos.set(13.2, 2.6, 12); }   // phone: ramp + board 04 in frame, sight line clear of the deck

    var countIn = 1284, countOut = 1102, occT0 = 0;
    function update(progress, stationIndex, dt) {
      dt = Math.min(dt || .016, .05); time += dt;
      var J = K.journey(KEYS, progress, dt, true, time), i = J.i, lt = J.local;
      var mdt = ctx.reduce ? 0 : dt;
      // zebra signal: traffic green → amber → red with green man (only once both lanes are clear of the zebra) →
      // back to traffic once every crosser is off the road
      var crossing = crossers.some(function (c) { return c.walking; });
      var vehOnZebra = laneVeh['1'].concat(laneVeh['-1']).some(onZebra);
      sig.t += mdt;
      if (sig.ph === 'veh' && sig.t > 11) { sig.ph = 'amber'; sig.t = 0; }
      else if (sig.ph === 'amber' && sig.t > 2.5 && !vehOnZebra) { sig.ph = 'ped'; sig.t = 0; }
      else if (sig.ph === 'ped' && sig.t > 3 && !crossing) { sig.ph = 'veh'; sig.t = 0; }
      sigOn.r.color.setHex(sig.ph === 'ped' ? 0xFF3B30 : 0x3A1210); sigOn.a.color.setHex(sig.ph === 'amber' ? 0xFFB020 : 0x3A2A10); sigOn.g.color.setHex(sig.ph === 'veh' ? 0x34D27B : 0x0E3A1E);
      sigOn.pg.color.setHex(sig.ph === 'ped' ? 0x34D27B : 0x0E3A1E); sigOn.pr.color.setHex(sig.ph === 'ped' ? 0x3A1210 : 0xFF3B30);
      // lane traffic: single file, stop line before the zebra unless the signal is green and nobody is crossing
      var red = sig.ph !== 'veh' || crossing;
      Object.keys(laneVeh).forEach(function (k) {
        var stopFront = ZEB_S[k] - ZEB_H - 1;
        K.follow(laneVeh[k], LANE_LEN, mdt, 2.6, function (it) {
          if (!red) return Infinity;
          var front = it.s + it.len / 2; return front <= stopFront + .3 ? stopFront - it.len / 2 : Infinity;
        });
        laneVeh[k].forEach(function (it) {
          var edge = Math.min(it.s, LANE_LEN - it.s); it.obj.visible = edge > 3;     // hidden at the loop ends
          it.obj.position.set(it.x, 0, laneZ(it));
        });
      });
      // zebra crossers: start only on the green man with no vehicle on the zebra, then walk to the far kerb
      crossers.forEach(function (c) {
        if (!c.walking && sig.ph === 'ped' && sig.t < 2 && !vehOnZebra) c.walking = true;
        var tx = -c.side * Math.abs(c.x0 || (c.x0 = Math.abs(c.x)));
        if (c.walking) {
          c.x += -c.side * 1.35 * mdt;
          if ((c.side > 0 && c.x <= tx) || (c.side < 0 && c.x >= tx)) { c.x = tx; c.side = -c.side; c.walking = false; }
          K.walk(c.p, time * 7 + c.ph);
        } else K.walk(c.p, 0, 0);
        c.p.position.set(c.x, .06, c.z); c.p.rotation.y = c.side > 0 ? -Math.PI / 2 : Math.PI / 2;   // facing the road / the far kerb
      });
      // deck car (station 1): approach, yield at the walkway zebra, stop at the arm until it is fully up, drive in
      var g1 = i === 1 ? lt : (i > 1 ? 1 : 0);
      deckCar.visible = i === 1;
      var dWant = g1 < .3 ? 3 + g1 / .3 * 10.3 : g1 < .52 ? 13.3 : 13.3 + (g1 - .52) / .48 * 12.7;
      var onDrvZebra = walkers.some(function (it) { return it.side > 0 && Math.abs(it.p.position.z - DRV_Z) < DRV_H + .4; });
      var deckActive = deckCar.visible && (deckSt.s == null || deckSt.s < 13.8);
      deckArm.rotation.z = K.gateStep(deckSt, dWant, { stopS: 13.3, clearS: 18.95, open: g1 >= .33, hold: onDrvZebra ? 5.4 : null, v: 6 }, dt);
      if (!deckCar.visible) { deckSt.s = null; deckArm.rotation.z = 0; }
      deckCar.position.set(deckSt.s == null ? 3 : deckSt.s, 0, DRV_Z);
      // walkway walkers: single file per direction; east walkers wait at the driveway zebra while the deck car comes
      Object.keys(walkLanes).forEach(function (k) {
        var L = walkLanes[k], east = L[0].side > 0, d = L[0].d;
        var entry = d > 0 ? DRV_Z - DRV_H - .5 : -(DRV_Z + DRV_H + .5);              // in lane coordinates (d * z)
        K.follow(L, WALK_LEN, mdt, .5, function (it) {
          if (!east || !deckActive) return Infinity;
          var pz = d * (WALK_MIN + (d > 0 ? it.s : WALK_LEN - it.s)), lim = entry - .3;
          return pz <= lim + .05 ? it.s + (lim - pz) : Infinity;
        });
        L.forEach(function (it) {
          var z = d > 0 ? WALK_MIN + it.s : WALK_MIN + WALK_LEN - it.s;
          it.p.position.set(it.x, .06, z); it.p.rotation.y = d > 0 ? 0 : Math.PI;
          it.p.visible = it.s > 1.5 && it.s < WALK_LEN - 1.5;
          K.walk(it.p, it.moving ? time * 7 + it.ph : 0, it.moving ? .5 : 0);
        });
      });
      // sports court: students jogging their own loops (no two loops overlap)
      players.forEach(function (pl, k) {
        var c = pl.c, a = (ctx.reduce ? 0 : time) * (.55 + k * .08) + c[4];
        pl.p.position.set(c[0] + Math.cos(a) * c[2], .045, c[1] + Math.sin(a) * c[3]);
        pl.p.rotation.y = Math.atan2(-Math.sin(a) * c[2], Math.cos(a) * c[3]);
        K.walk(pl.p, time * 9 + k, ctx.reduce ? 0 : .75);
      });
      // entrance walkers cross the counting line (x = -16.6) on the drop-off zebra, between the doors and the walkway
      entrants.forEach(function (p) {
        var u = p.userData, s = (time * .16 + u.ph) % 1, xx = u.dir > 0 ? -10.4 - s * 8.2 : -18.6 + s * 8.2;
        var before = p.position.x; p.position.set(xx, xx < -15.8 ? .2 : .06, u.z);
        p.visible = s > .03 && s < .97;
        p.rotation.y = u.dir > 0 ? -Math.PI / 2 : Math.PI / 2; K.walk(p, time * 7 + u.ph * 9);
        if (before && ((before > -16.6 && xx <= -16.6) || (before < -16.6 && xx >= -16.6))) { if (u.dir > 0) countIn++; else countOut++; }
      });
      // station 0: entry car stops at the arm, is read, the arm lifts fully, it drives in, the arm drops behind it;
      // the exit car does the same on the other lane
      var g0 = i === 0 ? lt : (i > 0 ? 1 : 0);
      var gWant = -(g0 < .35 ? 70 - (g0 / .35) * 24 : (g0 < .58 ? 46 : 46 - (g0 - .58) / .42 * 24));
      armIn.rotation.z = -K.gateStep(gateSt, gWant, { stopS: -46, clearS: -38.4, open: g0 >= .42, v: 7 }, dt);
      gateCar.position.set(2.3, 0, -gateSt.s);
      var ex = i === 0 ? Math.min(1, lt * 1.3) : 1;
      var eWant = ex < .25 ? 27 + ex / .25 * 9.4 : ex < .48 ? 36.4 : 36.4 + (ex - .48) / .52 * 36;
      armOut.rotation.z = K.gateStep(exitSt, eWant, { stopS: 36.4, clearS: 44.2, open: ex >= .28, v: 7 }, dt);
      exitCar.position.set(-2.3, 0, exitSt.s); exitCar.visible = i === 0;
      occT0 += dt; if (occT0 > 1.1) { occT0 = 0; occ = [Math.max(4, occ[0] + (Math.random() < .55 ? -1 : 1)), Math.max(6, occ[1] + (Math.random() < .5 ? -1 : 1)), Math.max(8, occ[2] + (Math.random() < .5 ? -1 : 1))]; }
      drawOcc(); tDeck.set('<b>Parking deck</b> · ' + (occ[0] + occ[1] + occ[2]) + ' free now');
      // cones
      anprCone.material.opacity = (i === 0 ? .15 + .06 * Math.sin(time * 4) : .06); anprOutCone.material.opacity = i === 0 ? .12 : .05;
      var lost = i === 3 && lt > .25;
      pkCone.material.opacity = lost ? (Math.sin(time * 18) > .6 ? .14 : 0) : .1;
      pkCone.material.color.setHex(lost ? 0xD6453D : 0x2673B5);
      doorCone.material.opacity = i === 4 ? .16 + .05 * Math.sin(time * 4) : .07;
      countLine.material.opacity = i === 4 ? .65 + .3 * Math.sin(time * 5) : .45;
      // wall + playback
      wall.draw(time, -1, lost ? 6 : -1);
      drawTimeline(i === 2 ? (time * .08) % 1 : .35);
      // tags
      tPlate.on = i === 0 && g0 > .3 && g0 < .62; tLog.on = i === 0 && g0 > .45; tExit.on = i === 0 && ex > .25 && ex < .8;
      tDeck.on = i === 1; tDeckIn.on = i === 1 && g1 > .35 && g1 < .85; tRamp.on = i === 1 && lt > .55;
      tWall.on = i === 2; tMap.on = i === 2 && lt > .25; tPlay.on = i === 2 && lt > .45;
      tLost.on = lost; tTicket.on = i === 3 && lt > .55;
      tCount.on = i === 4; tCount.set('<b>Block A</b> · in ' + countIn.toLocaleString('en-IN') + ' · out ' + countOut.toLocaleString('en-IN'));
      tLine.on = i === 4 && lt > .3;
      K.render();
    }
    return { update: update, warm: function (done) { (window.INFRAX_WARM || function (r, s, c, d) { d(); })(K.renderer, K.scene, K.camera, done); }, resize: K.resize, setDpr: K.setDpr, dispose: K.dispose };
  }

  window.INFRAX_DOMAINS = window.INFRAX_DOMAINS || {};
  window.INFRAX_DOMAINS.campuses = {
    slug: 'campuses', label: 'Campuses',
    title: 'One security desk for the whole campus',
    intro: 'Corporate, hospital and university campuses: gates, parking, blocks and entrances on one video wall, with every vehicle read at the gate and every level of parking counted.',
    stations: STATIONS,
    create: create
  };

})();

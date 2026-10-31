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

    var renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.debug.checkShaderErrors = false; // no synchronous compile-log reads
    renderer.setPixelRatio(Math.min(ctx.dpr || 1, 2));
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
    scene.fog = new T.FogExp2(0xF2F6FA, MOB ? .003 : .0023);
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
        if (o._t !== o.el.textContent) { o._t = o.el.textContent; o._w = o.el.offsetWidth || 120; o._h = o.el.offsetHeight || 28; } // measured only when the text changes
        var x = (v3.x * .5 + .5) * W, y = (-v3.y * .5 + .5) * H, ew = o._w, eh = o._h;
        x = Math.max(ew / 2 + 8, Math.min(W - ew / 2 - 8, x)); y = Math.max(eh + 12, Math.min(H - 8, y));
        o.el.style.transform = 'translate(' + Math.round(x - ew / 2) + 'px,' + Math.round(y - eh - 8) + 'px)'; // whole pixels: no blurred text
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

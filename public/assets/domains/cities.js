/* INFRAX.AI domain journey: Cities.
   A signalised city junction with zebra crossings, a flyover, mixed Indian traffic, pole cameras on every corner and a
   city command centre. Five stations: the video wall, a watchlist hit, a plate journey on the map, a blinded camera,
   and the operator approving the next step. Contract: see brief-v8 §6 (create / update / resize / dispose). */
(function () {
  window.INFRAX_DOMAINS = window.INFRAX_DOMAINS || {};

  var STATIONS = [
    { id: 'wall', short: 'Video wall',  product: 'Cygnus', productSlug: 'cygnus', title: 'Every junction camera on one wall.',
      body: 'Every junction camera, any brand, live and recorded on one wall, with pan-tilt-zoom from the tile.',
      rows: [['Cameras', 'Any IP · ONVIF · RTSP'], ['Recording', '24×7 · timeline · clip export'], ['Servers', 'CPU servers · add a GPU for more cameras']],
      live: ['Vehicle detection & classification'], photo: 'img/control-room-sm.webp', photoCaption: 'Illustrative' },
    { id: 'watchlist', short: 'Watchlist',  product: 'Cygnus', productSlug: 'cygnus', title: 'A watchlisted vehicle, flagged at the junction.',
      body: 'The junction camera reads the plate. If it is on a watchlist, Cygnus raises an alarm in the control room with the clip attached, while the vehicle is still in view.',
      rows: [['Plate', 'XX 00 CD 5678'], ['Camera', 'J-04 · north arm'], ['Alarm', 'Watchlist · reported stolen']],
      live: ['ANPR', 'Watchlist alerts'], photo: 'img/city-junction-sm.webp', photoCaption: 'Illustrative' },
    { id: 'journey', short: 'Journeys',  product: 'Cygnus', productSlug: 'cygnus', title: 'Where has this vehicle been?',
      body: 'Search a plate and Cygnus lists every camera that read it, with the time of each read, in order.',
      rows: [['Search', 'XX 00 CD 5678'], ['Reads', 'J-02 09:12 · J-04 09:18 · J-07 09:31']],
      live: ['Plate search & journeys'], photo: 'img/city-arterial-sm.webp', photoCaption: 'Illustrative' },
    { id: 'health', short: 'Camera health',  product: 'Cygnus', productSlug: 'cygnus', title: 'A blinded camera, caught at once.',
      body: 'Cygnus warns the moment a camera is blinded, moved or drops its stream, so a blank feed never sits unnoticed on the wall.',
      rows: [['Camera', 'J-05 · south-west corner'], ['State', 'Blinded · 09:44', 'bad'], ['Next', 'Field team informed']],
      live: ['Camera tamper & health'], photo: 'img/real/tiles/t6-city.webp', photoCaption: 'Illustrative' },
    { id: 'approve', short: 'Central Plexus',  product: 'Central Plexus (ATMS)', productSlug: 'central-plexus', title: 'Central Plexus acts on it.',
      body: 'The alert arrives with its clip and frames; the incident is opened and the patrol informed, all on record.',
      rows: [['Incident', '#2219 · watchlist', 'ok'], ['Evidence', 'Clip + frames · on record'], ['Patrol', 'Informed · 09:47', 'ok']], live: ['Watchlist alerts', 'Plate search & journeys'],
      photo: 'img/city-ops-sm.webp', photoCaption: 'Illustrative' }
  ];

  function create(host, ctx) {
    var T = ctx.THREE, MOB = !!ctx.mobile, REDUCE = !!ctx.reduce, LOW = !!ctx.lowGpu, SHADOWS = !MOB && !LOW; // integrated GPUs: no shadows, no MSAA
    if (T.ColorManagement) T.ColorManagement.legacyMode = false;

    /* ---------- dom ---------- */
    var canvas = document.createElement('canvas'); canvas.setAttribute('aria-hidden', 'true'); host.appendChild(canvas);
    var labels = document.createElement('div'); labels.setAttribute('aria-hidden', 'true');
    labels.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
    host.appendChild(labels);
    var css = document.createElement('style');
    css.textContent = '.cx-tag{position:absolute;left:0;top:0;transform:translate(-50%,-100%);font:500 12px/1.25 "Geist Mono",ui-monospace,Consolas,monospace;letter-spacing:.04em;white-space:nowrap;opacity:0;transition:opacity .3s;padding:6px 9px;border-radius:4px;background:#0E3B66;color:#fff;text-transform:uppercase}' +
      '.cx-tag.al{background:#fff;color:#C2362E;border:1.5px solid #D6453D}.cx-tag.lt{background:#fff;color:#0E3B66;border:1px solid #2673B5}' +
      '.cx-tag.pin{background:#2673B5}.cx-tag.ok{background:#2673B5}' +
      '.cx-tag::after{content:"";position:absolute;left:50%;top:100%;width:1px;height:12px;background:currentColor;opacity:.6}' +
      '.cx-box{position:absolute;left:0;top:0;border:2px solid #D6453D;border-radius:2px;opacity:0;will-change:transform}' +
      '.cx-box b{position:absolute;left:-2px;bottom:100%;margin-bottom:2px;font:600 12px/1 "Geist Mono",monospace;background:#D6453D;color:#fff;padding:3px 6px;white-space:nowrap}';
    host.appendChild(css);
    function tag(cls, text) { var e = document.createElement('div'); e.className = 'cx-tag ' + (cls || ''); e.textContent = text; labels.appendChild(e); return e; }

    /* ---------- renderer / scene ---------- */
    var renderer = new T.WebGLRenderer({ canvas: canvas, antialias: !MOB && !LOW && (devicePixelRatio || 1) < 1.5, alpha: true, powerPreference: 'high-performance' });
    renderer.debug.checkShaderErrors = false; // no synchronous compile-log reads
    renderer.setPixelRatio(Math.min(ctx.dpr || 1, MOB ? 1.25 : 1.75));
    renderer.setClearColor(0xffffff, 0);
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
    if (SHADOWS) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFShadowMap; renderer.shadowMap.autoUpdate = false; }
    var scene = new T.Scene();
    // fog: thinner than before so the city reads to the horizon; thinned further when the camera rises (see update)
    var FOG0 = MOB ? .0046 : .0032;
    scene.fog = new T.FogExp2(0xF2F6FA, FOG0);
    var cam = new T.PerspectiveCamera(MOB ? 60 : 48, 1, .5, 1400);
    var MAXA = Math.min(MOB ? 4 : 16, renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 8);
    var envTex = null;
    (function env() {
      var es = new T.Scene(), g = new T.SphereGeometry(60, 32, 16), cl = [], top = new T.Color(0xBFD7EE), hor = new T.Color(0xFFFFFF), bot = new T.Color(0x77838F), tmp = new T.Color(), p = g.attributes.position;
      for (var i = 0; i < p.count; i++) { var y = p.getY(i) / 60; if (y > 0) tmp.copy(hor).lerp(top, Math.pow(y, .6)); else tmp.copy(hor).lerp(bot, Math.min(1, -y * 2.4)); cl.push(tmp.r, tmp.g, tmp.b); }
      g.setAttribute('color', new T.Float32BufferAttribute(cl, 3));
      var sky = new T.Mesh(g, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide })); es.add(sky);
      var disc = new T.Mesh(new T.SphereGeometry(4, 16, 8), new T.MeshBasicMaterial({ color: 0xffffff })); disc.material.color.multiplyScalar(8); disc.position.set(25, 40, 20); es.add(disc);
      var pm = new T.PMREMGenerator(renderer); envTex = pm.fromScene(es, .03).texture; scene.environment = envTex; pm.dispose();
      es.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    })();
    scene.add(new T.HemisphereLight(0xF4F8FC, 0x8C97A3, .9));
    var sun = new T.DirectionalLight(0xFFF4E6, 2.6); sun.position.set(60, 90, 50); scene.add(sun); scene.add(sun.target);
    if (SHADOWS) { sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); var shc = sun.shadow.camera; shc.left = -120; shc.right = 120; shc.top = 120; shc.bottom = -120; shc.near = 10; shc.far = 320; sun.shadow.bias = -.0006; sun.shadow.normalBias = .05; sun.shadow.radius = 3; }

    var TEX = [];
    function M(c, o) { return new T.MeshStandardMaterial(Object.assign({ color: c, roughness: .78, metalness: .05 }, o || {})); }
    function B(c, o) { return new T.MeshBasicMaterial(Object.assign({ color: c, toneMapped: false }, o || {})); }
    function cs(o) { if (SHADOWS) { o.castShadow = true; o.receiveShadow = true; } return o; }
    function rcv(o) { if (SHADOWS) o.receiveShadow = true; return o; }
    function canvasTex(w, h, draw, rep) {
      var c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
      var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = MAXA;
      if (rep) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } TEX.push(t); return t;
    }
    function titleBoard(num, name, grp) {
      var c = document.createElement('canvas'); c.width = 2048; c.height = 324;
      var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 16; TEX.push(t);
      function draw() {
        var x = c.getContext('2d'), w = c.width, h = c.height;
        x.fillStyle = '#2673B5'; x.fillRect(0, 0, w, h);
        x.strokeStyle = '#1B5A94'; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, h - 14);
        x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 4; x.strokeRect(26, 26, w - 52, h - 52);
        x.textBaseline = 'middle';
        x.fillStyle = '#FFFFFF'; x.fillRect(62, 62, 200, h - 124);
        x.fillStyle = '#2673B5'; x.font = '800 132px "Onest", "Segoe UI", sans-serif'; x.textAlign = 'center'; x.fillText(num, 162, h / 2 + 4);
        var right = w - 90;
        if (grp) { x.fillStyle = '#DCEBF7'; x.font = '600 58px "Geist Mono", ui-monospace, Consolas, monospace'; x.textAlign = 'right'; x.fillText(grp.toUpperCase(), right, h / 2 + 2); right -= x.measureText(grp.toUpperCase()).width + 60; }
        var size = 140; x.fillStyle = '#FFFFFF'; x.textAlign = 'left'; x.font = '800 ' + size + 'px "Onest", "Segoe UI", sans-serif';
        while (x.measureText(name).width > right - 318 && size > 60) { size -= 6; x.font = '800 ' + size + 'px "Onest", "Segoe UI", sans-serif'; }
        x.fillText(name, 318, h / 2 + 6); t.needsUpdate = true;
      }
      draw(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!dead) draw(); });
      return t;
    }
    var dead = false;
    // soft contact shadows (an ambient-occlusion feel) under everything that stands on the ground:
    // white blurred shape on black, used as an alpha map so the falloff stays linear
    function blobTex(round, inset, blur) {
      var t = canvasTex(128, 128, function (x, w, h) {
        x.fillStyle = '#000'; x.fillRect(0, 0, w, h); x.shadowColor = '#fff'; x.shadowBlur = blur; x.shadowOffsetX = 600; x.fillStyle = '#fff';
        if (round) { x.beginPath(); x.arc(w / 2 - 600, h / 2, w / 2 - inset, 0, 7); x.fill(); } else x.fillRect(inset - 600, inset, w - inset * 2, h - inset * 2);
      });
      t.encoding = T.LinearEncoding; return t;
    }
    var BLOB_RECT = blobTex(false, 22, 16), BLOB_ROUND = blobTex(true, 18, 22), BLOB_TIGHT = blobTex(false, 12, 9);
    function blobMat(tex, op) { return decal(new T.MeshBasicMaterial({ color: 0x142030, alphaMap: tex, transparent: true, opacity: op, depthWrite: false, toneMapped: false }), 4); }
    var BLOB_GEO = new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
    var blobVeh = null;

    /* ---------- ground, roads, markings ---------- */
    var ROAD_EW_HALF = 10, ROAD_NS_HALF = 8, JB = 12; // junction box half-size
    var ground = new T.Mesh(new T.PlaneGeometry(520, 520), M(0xEEF2F6, { roughness: .95, map: canvasTex(512, 512, function (x, w, h) {
      x.fillStyle = '#EEF2F6'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(38,115,181,.10)'; x.lineWidth = 2;
      for (var i = 0; i <= w; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); }
    }, [26, 26]) }));
    ground.rotation.x = -Math.PI / 2; scene.add(rcv(ground));
    var m4 = new T.Matrix4(), q4 = new T.Quaternion(), v3 = new T.Vector3(), s3 = new T.Vector3();
    // asphalt: aggregate, darker tyre tracks down the middle of each lane, patch repairs and hairline cracks
    // (one texture per road axis so the tracks always run along the traffic)
    function asphaltDraw(vert) {
      return function (x, w, h) {
        x.fillStyle = '#5E656D'; x.fillRect(0, 0, w, h);
        for (var i = 0; i < 16000; i++) { var v = 74 + Math.random() * 70 | 0; x.fillStyle = 'rgba(' + v + ',' + (v + 4) + ',' + (v + 8) + ',' + (.22 + Math.random() * .4) + ')'; x.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 1.4, 1 + Math.random() * 1.4); }
        [.17, .33, .67, .83].forEach(function (f) { // two wheel tracks per lane (lane centres at .25 and .75)
          var g = vert ? x.createLinearGradient(f * w - 18, 0, f * w + 18, 0) : x.createLinearGradient(0, f * h - 18, 0, f * h + 18);
          g.addColorStop(0, 'rgba(40,44,49,0)'); g.addColorStop(.5, 'rgba(40,44,49,.30)'); g.addColorStop(1, 'rgba(40,44,49,0)');
          x.fillStyle = g; if (vert) x.fillRect(f * w - 18, 0, 36, h); else x.fillRect(0, f * h - 18, w, 36);
        });
        for (var p = 0; p < 3; p++) { var px = Math.random() * w * .8, py = Math.random() * h * .8, pw = 40 + Math.random() * 70, ph2 = 26 + Math.random() * 40; x.fillStyle = 'rgba(70,76,82,.55)'; x.fillRect(px, py, vert ? ph2 : pw, vert ? pw : ph2); x.strokeStyle = 'rgba(30,33,37,.45)'; x.lineWidth = 1.5; x.strokeRect(px, py, vert ? ph2 : pw, vert ? pw : ph2); }
        x.strokeStyle = 'rgba(28,31,35,.45)'; x.lineWidth = 1.2;
        for (var c = 0; c < 7; c++) { var cx = Math.random() * w, cy = Math.random() * h; x.beginPath(); x.moveTo(cx, cy); for (var s = 0; s < 6; s++) { cx += (Math.random() - .5) * 30; cy += (Math.random() - .5) * 30; x.lineTo(cx, cy); } x.stroke(); }
        // oil drips where vehicles queue
        for (var o = 0; o < 14; o++) { x.fillStyle = 'rgba(30,32,36,' + (.15 + Math.random() * .2) + ')'; x.beginPath(); x.ellipse(vert ? (Math.random() < .5 ? .25 : .75) * w : Math.random() * w, vert ? Math.random() * h : (Math.random() < .5 ? .25 : .75) * h, 4 + Math.random() * 8, 3 + Math.random() * 6, 0, 0, 7); x.fill(); }
      };
    }
    var asphaltTex = canvasTex(1024, 1024, asphaltDraw(false), [12, 2]);
    var asphalt = M(0xFFFFFF, { map: asphaltTex, roughness: .9 });
    var ew = new T.Mesh(new T.PlaneGeometry(520, ROAD_EW_HALF * 2), asphalt); ew.rotation.x = -Math.PI / 2; ew.position.y = .02; scene.add(rcv(ew));
    var nsTex = canvasTex(1024, 1024, asphaltDraw(true), [2, 12]);
    var ns = new T.Mesh(new T.PlaneGeometry(ROAD_NS_HALF * 2, 520), M(0xFFFFFF, { map: nsTex, roughness: .9 })); ns.rotation.x = -Math.PI / 2; ns.position.y = .03; ns.material.polygonOffset = true; ns.material.polygonOffsetFactor = -1; ns.material.polygonOffsetUnits = -2; scene.add(rcv(ns));
    // decal helper: coplanar-ish layers get a depth bias so they never flicker against what they lie on
    function decal(mat, f) { mat.polygonOffset = true; mat.polygonOffsetFactor = -(f || 2); mat.polygonOffsetUnits = -(f || 2) * 2; return mat; }
    var ROADY = .03; // running surface of both carriageways (vehicles' wheels sit here)
    // fill the four tiny corner squares where the two footpath strips meet (they showed bare ground)
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (q) { var cf = new T.Mesh(new T.BoxGeometry(2.0, .25, 2.0), M(0xC9C2B6, { roughness: .88 })); cf.position.set(q[0] * (ROAD_NS_HALF + 1), .12, q[1] * (ROAD_EW_HALF + 1)); scene.add(rcv(cf)); });
    // kerbed footpaths in the four quadrants: interlocking pavers with a tactile strip near the kerb
    function paverDraw(vert) {
      return function (x, w, h) {
        x.fillStyle = '#CFC8BD'; x.fillRect(0, 0, w, h);
        var bw = 32, bh = 16;
        for (var r = 0; r < h / bh; r++) for (var c = -1; c < w / bw + 1; c++) {
          var v = 196 + Math.random() * 26 | 0, ox = (r % 2) * bw / 2;
          x.fillStyle = 'rgb(' + v + ',' + (v - 6) + ',' + (v - 16) + ')'; x.fillRect(c * bw + ox + 1, r * bh + 1, bw - 2, bh - 2);
        }
        x.fillStyle = '#E2B53A'; if (vert) x.fillRect(w - 26, 0, 20, h); else x.fillRect(0, h - 26, w, 20);
        x.fillStyle = 'rgba(150,110,20,.6)'; for (var k = 0; k < (vert ? h : w); k += 6) { if (vert) x.fillRect(w - 24, k, 16, 2); else x.fillRect(k, h - 24, 2, 16); }
      };
    }
    var pavX = canvasTex(256, 256, paverDraw(false), [62, 1]), pavZ = canvasTex(256, 256, paverDraw(true), [1, 62]);
    var sideM = M(0xA9B0B7, { roughness: .85 }), pavXM = M(0xffffff, { map: pavX, roughness: .88 }), pavZM = M(0xffffff, { map: pavZ, roughness: .88 });
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (q) {
      // the tactile strip is drawn on the +v / +u edge of the tile: flip the box so it always lies on the kerb side
      var walkX = new T.Mesh(new T.BoxGeometry(250, .25, 4), [sideM, sideM, pavXM, sideM, sideM, sideM]); walkX.position.set(q[0] * (ROAD_NS_HALF + 127), .12, q[1] * (ROAD_EW_HALF + 2)); if (q[1] > 0) walkX.rotation.y = Math.PI; scene.add(rcv(walkX));
      var walkZ = new T.Mesh(new T.BoxGeometry(4, .25, 250), [sideM, sideM, pavZM, sideM, sideM, sideM]); walkZ.position.set(q[0] * (ROAD_NS_HALF + 2), .12, q[1] * (ROAD_EW_HALF + 127)); if (q[0] > 0) walkZ.rotation.y = Math.PI; scene.add(rcv(walkZ));
    });
    // cast-iron manhole covers in the lanes and kerb-side drain grates
    (function utilities() {
      var mhTex = canvasTex(128, 128, function (x, w, h) {
        x.fillStyle = '#3A3F45'; x.beginPath(); x.arc(64, 64, 63, 0, 7); x.fill();
        x.strokeStyle = '#5B6168'; x.lineWidth = 5; x.beginPath(); x.arc(64, 64, 56, 0, 7); x.stroke();
        x.lineWidth = 3; for (var r = 12; r < 52; r += 9) { x.beginPath(); x.arc(64, 64, r, 0, 7); x.stroke(); }
        for (var a = 0; a < 8; a++) { x.beginPath(); x.moveTo(64, 64); x.lineTo(64 + Math.cos(a * Math.PI / 4) * 52, 64 + Math.sin(a * Math.PI / 4) * 52); x.stroke(); }
      });
      var mh = [];
      for (var mx2 = -150; mx2 <= 150; mx2 += 37) { if (Math.abs(mx2) < JB + 6) continue; mh.push([mx2 + 5, mx2 % 2 ? 7.5 : -2.5]); }
      for (var mz2 = -150; mz2 <= 150; mz2 += 41) { if (Math.abs(mz2) < JB + 6) continue; mh.push([mz2 % 2 ? 6 : -2, mz2 + 9]); }
      var mhIM = new T.InstancedMesh(new T.CircleGeometry(.62, 24).rotateX(-Math.PI / 2), decal(M(0xffffff, { map: mhTex, roughness: .55, metalness: .6, transparent: true, alphaTest: .4 }), 3), mh.length);
      mh.forEach(function (p, k) { mhIM.setMatrixAt(k, m4.makeTranslation(p[0], .055, p[1])); }); scene.add(rcv(mhIM));
      var grTex = canvasTex(64, 128, function (x, w, h) { x.fillStyle = '#2B3036'; x.fillRect(0, 0, w, h); x.fillStyle = '#6B7178'; x.fillRect(0, 0, w, 6); x.fillRect(0, h - 6, w, 6); for (var y = 12; y < h - 8; y += 10) x.fillRect(6, y, w - 12, 4); });
      var gr = [];
      for (var gx = -150; gx <= 150; gx += 18) { if (Math.abs(gx) < JB + 6) continue; gr.push([gx, ROAD_EW_HALF - .35, 0], [gx + 9, -ROAD_EW_HALF + .35, 0]); }
      for (var gz = -150; gz <= 150; gz += 18) { if (Math.abs(gz) < JB + 6) continue; gr.push([ROAD_NS_HALF - .35, gz, 1], [-ROAD_NS_HALF + .35, gz + 9, 1]); }
      var grIM = new T.InstancedMesh(new T.PlaneGeometry(.5, 1.0).rotateX(-Math.PI / 2), decal(M(0xffffff, { map: grTex, roughness: .6, metalness: .5 }), 3), gr.length), ee = new T.Euler();
      gr.forEach(function (p, k) { ee.set(0, p[2] ? 0 : Math.PI / 2, 0); q4.setFromEuler(ee); grIM.setMatrixAt(k, m4.compose(v3.set(p[0], .056, p[1]), q4, s3.set(1, 1, 1))); }); scene.add(rcv(grIM));
    })();
    // lane markings, stop lines and zebra crossings (instanced white bars)
    var marks = [];
    function bar(x, z, sx, sz) { marks.push([x, z, sx, sz]); }
    for (var mx = -255; mx < 255; mx += 9) { if (Math.abs(mx) < JB + 4) continue; bar(mx, -5, 4, .22); bar(mx, 5, 4, .22); }
    for (var mz = -255; mz < 255; mz += 9) { if (Math.abs(mz) < JB + 4) continue; bar(-4, mz, .22, 4); bar(4, mz, .22, 4); }
    for (var c2 = -255; c2 < 255; c2 += 1) { if (Math.abs(c2) < JB + 4) continue; } // (median kept as a raised strip below)
    bar(-(JB + 3.2), ROAD_EW_HALF / 2, .5, ROAD_EW_HALF); bar(JB + 3.2, -ROAD_EW_HALF / 2, .5, ROAD_EW_HALF);
    bar(ROAD_NS_HALF / 2, JB + 3.2, ROAD_NS_HALF, .5); bar(-ROAD_NS_HALF / 2, -(JB + 3.2), ROAD_NS_HALF, .5);
    for (var zs = -ROAD_EW_HALF + 1; zs <= ROAD_EW_HALF - 1; zs += 1.6) { bar(JB + .2, zs, 3.2, .7); bar(-(JB + .2), zs, 3.2, .7); }
    for (var xs = -ROAD_NS_HALF + 1; xs <= ROAD_NS_HALF - 1; xs += 1.6) { bar(xs, JB + .2, .7, 3.2); bar(xs, -(JB + .2), .7, 3.2); }
    // continuous edge lines 1 m in from each kerb (lanes read ~4 m on the main road, ~3.5 m on the cross road)
    [-1, 1].forEach(function (sd) {
      [[-260, -(JB + 4)], [JB + 4, 260]].forEach(function (r) { bar((r[0] + r[1]) / 2, sd * (ROAD_EW_HALF - 1), r[1] - r[0], .15); bar(sd * (ROAD_NS_HALF - .6), (r[0] + r[1]) / 2, .15, r[1] - r[0]); });
    });
    // more straight-ahead arrows further up every approach (traffic here only runs straight through)
    var markIM = new T.InstancedMesh(new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), decal(B(0xF4F6F8), 2), marks.length);
    marks.forEach(function (mk, k) { m4.compose(v3.set(mk[0], .05, mk[1]), q4.identity(), s3.set(mk[2], 1, mk[3])); markIM.setMatrixAt(k, m4); });
    scene.add(markIM);
    // yellow box-junction hatching (keep clear) inside the junction box, as a crisp canvas decal
    (function boxJunction() {
      var bw = ROAD_NS_HALF * 2 - 1.2, bd = ROAD_EW_HALF * 2 - 1.2, px = 48; // px per metre
      var t = canvasTex(Math.round(bw * px / 4) * 4, Math.round(bd * px / 4) * 4, function (x, w, h) {
        x.clearRect(0, 0, w, h); x.strokeStyle = '#E8B92E'; x.lineWidth = .2 * px; x.strokeRect(.1 * px, .1 * px, w - .2 * px, h - .2 * px);
        x.save(); x.beginPath(); x.rect(0, 0, w, h); x.clip(); x.lineWidth = .14 * px;
        for (var o = -h; o < w + h; o += 2.4 * px) { x.beginPath(); x.moveTo(o, 0); x.lineTo(o + h, h); x.stroke(); x.beginPath(); x.moveTo(o + h, 0); x.lineTo(o, h); x.stroke(); }
        x.restore();
      });
      var m = new T.Mesh(new T.PlaneGeometry(bw, bd).rotateX(-Math.PI / 2), decal(B(0xffffff, { map: t, transparent: true, alphaTest: .35, depthWrite: false }), 2));
      m.position.set(0, .05, 0); scene.add(m);
    })();
    // raised kerbed median under the metro on the north-south road (the viaduct piers stand in it)
    (function nsMedian() {
      var mm = M(0xC9CED3, { roughness: .85 }), strip = M(0x7E8A60, { roughness: 1 });
      [-1, 1].forEach(function (sd) {
        var a = JB + 5, b = 258, len = b - a, c = sd * (a + len / 2);
        var md = new T.Mesh(new T.BoxGeometry(1.44, .22, len), mm); md.position.set(0, .11, c); scene.add(rcv(md));
        var gs = new T.Mesh(new T.BoxGeometry(1.0, .04, len - .4), strip); gs.position.set(0, .23, c); scene.add(gs);
        var nose = new T.Mesh(new T.BoxGeometry(1.46, .24, 1.2), M(0xffffff, { roughness: .7, map: canvasTex(64, 16, function (x, w, h) { for (var i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#1E2226' : '#E5B52E'; x.fillRect(i * 8, 0, 8, h); } }) }));
        nose.position.set(0, .12, sd * (a + .6)); scene.add(nose);
      });
    })();
    // raised medians with planted strips (east-west road)
    var medM = M(0xC9CED3), soil = M(0x6E7B4E, { roughness: 1 });
    [-1, 1].forEach(function (sd) {
      var med = new T.Mesh(new T.BoxGeometry(240, .35, 1.2), medM); med.position.set(sd * (JB + 4 + 120), .18, 0); scene.add(cs(med));
      var gr = new T.Mesh(new T.BoxGeometry(238, .1, .8), soil); gr.position.set(sd * (JB + 4 + 120), .38, 0); scene.add(gr);
      // black-and-yellow painted nose where the median meets the junction
      var nose = new T.Mesh(new T.BoxGeometry(1.6, .37, 1.24), M(0xffffff, { roughness: .7, map: canvasTex(64, 16, function (x, w, h) { for (var i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#1E2226' : '#E5B52E'; x.fillRect(i * 8, 0, 8, h); } }) })); nose.position.set(sd * (JB + 4.8), .19, 0); scene.add(cs(nose));
    });
    // median crash railing: galvanised posts with two rails, broken at the junction
    (function medianRail() {
      var posts = [];
      for (var rx = JB + 7; rx <= 250; rx += 2.5) { posts.push(rx, -rx); }
      var pIM = new T.InstancedMesh(new T.BoxGeometry(.08, .9, .08).translate(0, .8, 0), M(0xB9C1C9, { roughness: .35, metalness: .75 }), posts.length);
      posts.forEach(function (px, k) { pIM.setMatrixAt(k, m4.makeTranslation(px, 0, 0)); }); scene.add(pIM);
      [-1, 1].forEach(function (sd) { [.95, 1.2].forEach(function (y) { var r = new T.Mesh(new T.BoxGeometry(250 - JB - 7, .07, .05), M(0xC6CDD4, { roughness: .3, metalness: .8 })); r.position.set(sd * (JB + 7 + (250 - JB - 7) / 2), y, 0); scene.add(r); }); });
    })();

    /* ---------- flyover (elevated deck parallel to the main road, north side) ---------- */
    var FLY_Z = -22, FLY_Y = 8.2;
    // ramps: the deck top (FLY_Y + .46) runs straight down to the plinth (.2) between |x| = 100 and 168; vehicles follow it
    var RAMP_A = 100, RAMP_B = 168, RTOP = FLY_Y + .46, RLOW = .2, RSLOPE = (RTOP - RLOW) / (RAMP_B - RAMP_A);
    function flyY(x) { var a = Math.abs(x); return a <= RAMP_A ? RTOP : Math.max(RLOW, RTOP - (a - RAMP_A) * RSLOPE); }
    (function flyover() {
      var deckM = M(0xCBD1D7, { roughness: .82 }), railM = M(0xE4E8EC, { roughness: .6, metalness: .2 });
      var deck = new T.Mesh(new T.BoxGeometry(200, .9, 9), deckM); deck.position.set(0, FLY_Y, FLY_Z); scene.add(cs(deck));
      var top = new T.Mesh(new T.PlaneGeometry(200, 8.2), decal(M(0xFFFFFF, { map: asphaltTex, roughness: .92 }), 1)); top.rotation.x = -Math.PI / 2; top.position.set(0, FLY_Y + .46, FLY_Z); scene.add(rcv(top));
      [-1, 1].forEach(function (sd) {
        var rail = new T.Mesh(new T.BoxGeometry(200, 1.1, .3), railM); rail.position.set(0, FLY_Y + 1, FLY_Z + sd * 4.4); scene.add(cs(rail));
        // ramps down at both ends: a tilted group whose top face is exactly the running surface flyY()
        var th = Math.atan(RSLOPE), L = (RAMP_B - RAMP_A) / Math.cos(th), rg = new T.Group();
        rg.position.set(sd * (RAMP_A + RAMP_B) / 2, (RTOP + RLOW) / 2, FLY_Z); rg.rotation.z = -sd * th; scene.add(rg);
        var ramp = new T.Mesh(new T.BoxGeometry(L, .8, 9), deckM); ramp.position.y = -.41; rg.add(cs(ramp));
        var rtop = new T.Mesh(new T.PlaneGeometry(L, 8.2).rotateX(-Math.PI / 2), decal(M(0xFFFFFF, { map: asphaltTex, roughness: .92 }), 1)); rtop.position.y = .005; rg.add(rcv(rtop));
        [-1, 1].forEach(function (s2) { var rr = new T.Mesh(new T.BoxGeometry(L, 1.1, .3), railM); rr.position.set(0, .55, s2 * 4.4); rg.add(cs(rr)); });
        [118, 140].forEach(function (ax) { var ph = flyY(ax) - .85; var rp = new T.Mesh(new T.CylinderGeometry(.9, 1.05, ph, 14), M(0xD5DADF, { roughness: .85 })); rp.position.set(sd * ax, ph / 2, FLY_Z); scene.add(cs(rp)); });
      });
      for (var px = -90; px <= 90; px += 22.5) {
        if (Math.abs(px) < 1) continue; // no pier in the cross-road carriageway (it stood in the inner lanes)
        var pier = new T.Mesh(new T.CylinderGeometry(1.1, 1.3, FLY_Y - .4, 16), M(0xD5DADF, { roughness: .85 })); pier.position.set(px, (FLY_Y - .4) / 2, FLY_Z); scene.add(cs(pier));
        var cap = new T.Mesh(new T.BoxGeometry(2.6, .8, 8), deckM); cap.position.set(px, FLY_Y - .7, FLY_Z); scene.add(cs(cap));
      }
      var dash = []; for (var dx = -98; dx < 98; dx += 8) dash.push(dx);
      var dIM = new T.InstancedMesh(new T.PlaneGeometry(3.6, .2).rotateX(-Math.PI / 2), decal(B(0xF4F6F8), 3), dash.length);
      dash.forEach(function (x0, k) { m4.compose(v3.set(x0, FLY_Y + .48, FLY_Z), q4.identity(), s3.set(1, 1, 1)); dIM.setMatrixAt(k, m4); }); scene.add(dIM);
    })();

    /* ---------- buildings (facade textures) + the command centre ---------- */
    // facades: one texture tile = 4 bays x 4 floors, repeated so a floor is ~3.2 m and a bay ~3 m.
    // styles: 0 punched windows with sills, 1 ribbon glazing, 2 residential (curtains), 3 curtain wall
    function facade(style, tint) {
      return canvasTex(512, 512, function (x, w, h) {
        x.fillStyle = tint; x.fillRect(0, 0, w, h);
        for (var i = 0; i < 2500; i++) { x.fillStyle = 'rgba(0,0,0,' + (Math.random() * .04) + ')'; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
        function glass(gx, gy, gw, gh, lit) {
          var g = x.createLinearGradient(gx, gy, gx + gw * .4, gy + gh);
          if (lit) { g.addColorStop(0, '#FBEFD2'); g.addColorStop(1, '#E9CF98'); } else { g.addColorStop(0, '#C9DBEA'); g.addColorStop(.45, '#8FA9C2'); g.addColorStop(1, '#5F7A94'); }
          x.fillStyle = g; x.fillRect(gx, gy, gw, gh);
        }
        if (style === 3) {
          for (var r = 0; r < 4; r++) for (var c = 0; c < 8; c++) { glass(c * 64, r * 128, 64, 128, Math.random() < .12); x.fillStyle = 'rgba(255,255,255,' + (Math.random() * .12) + ')'; x.fillRect(c * 64, r * 128, 64, 128); }
          x.fillStyle = '#D8DEE4'; for (var mc = 0; mc <= 8; mc++) x.fillRect(mc * 64 - 3, 0, 6, h); for (var fl = 0; fl <= 4; fl++) x.fillRect(0, fl * 128 - 6, w, 12);
          return;
        }
        if (style === 1) {
          for (var r1 = 0; r1 < 4; r1++) {
            glass(0, r1 * 128 + 10, w, 82, false);
            for (var p = 0; p < 16; p++) if (Math.random() < .2) glass(p * 32, r1 * 128 + 10, 32, 82, true);
            x.fillStyle = '#2E3A46'; for (var m = 0; m <= 16; m++) x.fillRect(m * 32 - 2, r1 * 128 + 10, 4, 82);
            x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(0, r1 * 128 + 92, w, 6);
          }
          return;
        }
        var CUR = ['#E9D9C1', '#D5E1EA', '#EBC9B8'];
        for (var rr = 0; rr < 4; rr++) for (var cc = 0; cc < 4; cc++) {
          var bx0 = cc * 128, by0 = rr * 128, lit = Math.random() < .22, fr = style === 2 ? '#F1EEE8' : '#E4E8EC';
          x.fillStyle = 'rgba(0,0,0,.10)'; x.fillRect(bx0 + 22, by0 + 22, 88, 80);             // reveal shadow
          x.fillStyle = fr; x.fillRect(bx0 + 18, by0 + 18, 92, 80);                              // frame
          glass(bx0 + 25, by0 + 25, 78, 66, lit);
          if (style === 2 && Math.random() < .45) { x.fillStyle = CUR[(rr + cc) % 3]; x.fillRect(bx0 + 25, by0 + 25, 78 * (.3 + Math.random() * .4), 66); }
          x.fillStyle = fr; x.fillRect(bx0 + 62, by0 + 25, 4, 66); x.fillRect(bx0 + 25, by0 + 46, 78, 3); // mullion + transom
          x.fillStyle = '#F7F8F9'; x.fillRect(bx0 + 14, by0 + 98, 100, 7); x.fillStyle = 'rgba(0,0,0,.16)'; x.fillRect(bx0 + 16, by0 + 105, 96, 4); // sill
        }
      });
    }
    var facades = [facade(0, '#E6E9EC'), facade(1, '#D9DEE3'), facade(2, '#EEE8DF'), facade(3, '#CFD8E2')];
    // ground floor: glazed shopfronts or rolled-down shutters, fascia boards and pilasters
    var shopTex = canvasTex(512, 256, function (x, w, h) {
      x.fillStyle = '#D8D2C8'; x.fillRect(0, 0, w, h);
      var FAS = ['#2673B5', '#D6453D', '#2E8B57', '#E7A93A'];
      for (var u = 0; u < 2; u++) {
        var ox = u * 256;
        x.fillStyle = FAS[(Math.random() * 4) | 0]; x.fillRect(ox + 14, 18, 228, 46);
        x.fillStyle = 'rgba(255,255,255,.9)'; x.fillRect(ox + 34, 34, 120, 14);
        if (u === 0 || Math.random() < .5) { var g = x.createLinearGradient(0, 72, 0, 250); g.addColorStop(0, '#B9CCDC'); g.addColorStop(1, '#5D7489'); x.fillStyle = g; x.fillRect(ox + 20, 72, 216, 178); x.fillStyle = '#F2E6CC'; for (var s = 0; s < 3; s++) x.fillRect(ox + 34 + s * 66, 150, 50, 60); x.fillStyle = '#3B444D'; x.fillRect(ox + 126, 72, 4, 178); }
        else { x.fillStyle = '#A8AFB6'; x.fillRect(ox + 20, 72, 216, 178); x.fillStyle = 'rgba(0,0,0,.18)'; for (var l = 76; l < 250; l += 7) x.fillRect(ox + 20, l, 216, 2); }
        x.fillStyle = '#C9C2B6'; x.fillRect(ox, 0, 14, h); x.fillRect(ox + 242, 0, 14, h);
      }
    });
    var BLD = [
      [-53, -48, 14, 18, 38, 0], [-70, -46, 18, 22, 26, 1], [-38, -82, 26, 20, 52, 3], [-96, -70, 20, 20, 30, 2],
      [-56, 44, 14, 18, 30, 1], [-74, 48, 20, 22, 44, 3], [-46, 84, 22, 22, 24, 2], [-100, 76, 24, 18, 34, 0],
      [40, 44, 22, 20, 34, 2], [72, 46, 18, 22, 22, 0], [44, 82, 24, 22, 48, 3], [100, 74, 20, 18, 28, 1],
      [86, -88, 22, 20, 40, 1], [118, -50, 20, 22, 26, 2]
    ]; // blocks 0 and 4 stand clear of the station-2 and station-4 camera positions
    if (MOB) BLD = BLD.filter(function (b, k) { return k % 2 === 0 || k === 13; });
    var roofs = [];
    function repX(len) { return Math.max(1, Math.round(len / 12)); }
    function repY(hh) { return Math.max(1, Math.round(hh / 13.6)); }
    var roofM = M(0xB9C3CC, { roughness: .9 }), soffitM = M(0x8E99A4, { roughness: .9 }), hoardSteel = M(0xB4BDC6, { roughness: .4, metalness: .7 });
    BLD.forEach(function (b) {
      var mats = [];
      for (var f = 0; f < 6; f++) {
        if (f === 2 || f === 3) { mats.push(f === 2 ? roofM : soffitM); continue; }
        var tx = facades[b[5]].clone(); tx.needsUpdate = true; tx.wrapS = tx.wrapT = T.RepeatWrapping; tx.repeat.set(repX(f < 2 ? b[3] : b[2]), repY(b[4])); TEX.push(tx);
        mats.push(M(0xFFFFFF, { map: tx, roughness: b[5] === 3 ? .18 : .6, metalness: b[5] === 3 ? .45 : .08 }));
      }
      var m = new T.Mesh(new T.BoxGeometry(b[2], b[4], b[3]), mats); m.position.set(b[0], b[4] / 2, b[1]); scene.add(cs(m));
      // shopfront band round the ground floor
      var sm = [];
      for (var f2 = 0; f2 < 6; f2++) { if (f2 === 2 || f2 === 3) { sm.push(soffitM); continue; } var st = shopTex.clone(); st.needsUpdate = true; st.wrapS = T.RepeatWrapping; st.repeat.set(Math.max(1, Math.round((f2 < 2 ? b[3] : b[2]) / 9)), 1); TEX.push(st); sm.push(M(0xffffff, { map: st, roughness: .5 })); }
      var band = new T.Mesh(new T.BoxGeometry(b[2] + .3, 4.2, b[3] + .3), sm); band.position.set(b[0], 2.1, b[1]); scene.add(cs(band));
      roofs.push(b);
    });
    (function buildingDetail() {
      var par = [], plant = [], tanks = [], balc = [], acs = [], solar = [], one = new T.Vector3(1, 1, 1), e = new T.Euler();
      roofs.forEach(function (b, k) {
        var x = b[0], z = b[1], w = b[2], d = b[3], h = b[4], fh = h / (repY(h) * 4);
        par.push([x, h + .5, z - d / 2 + .15, w, .9, .3], [x, h + .5, z + d / 2 - .15, w, .9, .3], [x - w / 2 + .15, h + .5, z, .3, .9, d], [x + w / 2 - .15, h + .5, z, .3, .9, d]);
        par.push([x, 4.35, z, w + .9, .3, d + .9]);                      // canopy slab over the shopfronts
        if (b[5] !== 3) for (var fl = 2; fl < repY(h) * 4; fl++) par.push([x, fl * fh, z, w + .12, .16, d + .12]); // floor string courses
        for (var u = 0; u < 3; u++) plant.push([x - w * .25 + u * w * .22, h + .8, z + (u % 2 ? d * .18 : -d * .12), 2.6 + (u % 2), 1.6, 1.8]);
        par.push([x - w * .3, h + 1.6, z + d * .25, 3.2, 3.2, 3.6]);      // stair and lift head-room
        tanks.push([x + w * .3, h, z - d * .25], [x + w * .3 - 2.4, h, z - d * .25]);
        if (k % 3 === 0 && !MOB) for (var si = 0; si < 3; si++) for (var sj = 0; sj < 4; sj++) solar.push([x - w * .1 + sj * 1.9, h + .5, z + d * .05 + si * 1.6]);
        // balconies on the face towards the east-west road, aligned with the floors and bays
        var bw = w / (repX(w) * 4), fz = z > 0 ? z - d / 2 : z + d / 2, sg = z > 0 ? -1 : 1;
        if ((k % 2 === 0 || b[5] === 2) && b[5] !== 3) for (var f = 2; f < repY(h) * 4; f++) for (var bi = 0; bi < repX(w) * 4; bi += 2) balc.push([x - w / 2 + (bi + .5) * bw, f * fh + .02, fz + sg * .6, sg, bw * .92]);
        // split-AC outdoor units under some windows on the side faces
        if (b[5] === 0 || b[5] === 2) {
          var bd = d / (repX(d) * 4);
          [-1, 1].forEach(function (sd) { for (var f3 = 2; f3 < repY(h) * 4; f3++) for (var bj = 0; bj < repX(d) * 4; bj++) if (((bj * 7 + f3 * 3 + k) % 5) === 0) acs.push([x + sd * (w / 2 + .32), f3 * fh + .35, z - d / 2 + (bj + .5) * bd]); });
        }
      });
      function boxes(list, mat) { var im = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), mat, list.length); list.forEach(function (q, i) { im.setMatrixAt(i, m4.compose(v3.set(q[0], q[1], q[2]), q4.identity(), s3.set(q[3], q[4], q[5]))); }); if (SHADOWS) im.castShadow = im.receiveShadow = true; scene.add(im); return im; }
      boxes(par, M(0xD5DBE1, { roughness: .8 })); boxes(plant, M(0xAEB7C0, { roughness: .5, metalness: .4 }));
      var tk = new T.InstancedMesh(new T.CylinderGeometry(.9, .9, 1.6, 14).translate(0, 1.9, 0), M(0x2F3A44, { roughness: .6 }), tanks.length);
      var tl = new T.InstancedMesh(new T.BoxGeometry(.12, 1.1, .12).translate(0, .55, 0), M(0x8E979F, { metalness: .6, roughness: .4 }), tanks.length);
      tanks.forEach(function (q, i) { m4.compose(v3.set(q[0], q[1], q[2]), q4.identity(), one); tk.setMatrixAt(i, m4); tl.setMatrixAt(i, m4); }); scene.add(tk); scene.add(tl);
      if (balc.length) {
        var slab = new T.InstancedMesh(new T.BoxGeometry(1, .18, 1.3), M(0xE9ECEF, { roughness: .7 }), balc.length), rail = new T.InstancedMesh(new T.BoxGeometry(1, .9, .06).translate(0, .5, 0), M(0x7FA6CC, { roughness: .1, metalness: .5, transparent: true, opacity: .55 }), balc.length);
        var hand = new T.InstancedMesh(new T.BoxGeometry(1, .07, .1).translate(0, .98, 0), M(0xC9D1D8, { roughness: .3, metalness: .8 }), balc.length);
        balc.forEach(function (q, i) { m4.compose(v3.set(q[0], q[1], q[2]), q4.identity(), s3.set(q[4], 1, 1)); slab.setMatrixAt(i, m4); m4.compose(v3.set(q[0], q[1], q[2] + q[3] * .62), q4.identity(), s3.set(q[4], 1, 1)); rail.setMatrixAt(i, m4); hand.setMatrixAt(i, m4); });
        if (SHADOWS) slab.castShadow = true; scene.add(slab); scene.add(rail); scene.add(hand);
      }
      if (acs.length) {
        var acTex = canvasTex(64, 48, function (x, w, h) { x.fillStyle = '#EEF0F2'; x.fillRect(0, 0, w, h); x.strokeStyle = '#8E979F'; x.lineWidth = 2; x.beginPath(); x.arc(40, 24, 15, 0, 7); x.stroke(); for (var a = 0; a < 4; a++) { x.beginPath(); x.moveTo(40, 24); x.lineTo(40 + Math.cos(a * 1.57 + .3) * 14, 24 + Math.sin(a * 1.57 + .3) * 14); x.stroke(); } x.fillStyle = '#B9C1C9'; for (var g = 6; g < 22; g += 4) x.fillRect(4, g, 14, 2); });
        var acSide = M(0xE4E7EA), acFace = M(0xffffff, { map: acTex, roughness: .5 });
        var ac = new T.InstancedMesh(new T.BoxGeometry(.6, .55, .85), [acFace, acFace, acSide, acSide, acSide, acSide], acs.length);
        acs.forEach(function (q, i) { ac.setMatrixAt(i, m4.makeTranslation(q[0], q[1], q[2])); }); if (SHADOWS) ac.castShadow = true; scene.add(ac);
      }
      if (solar.length) {
        var sTex = canvasTex(64, 96, function (x, w, h) { x.fillStyle = '#1D3557'; x.fillRect(0, 0, w, h); x.strokeStyle = '#7F9CC0'; x.lineWidth = 1; for (var i = 0; i <= w; i += 10.6) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } for (var j = 0; j <= h; j += 10.6) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); } });
        var spEdge = M(0xC6CDD4), spTop = M(0xffffff, { map: sTex, roughness: .2, metalness: .6 });
        var sp = new T.InstancedMesh(new T.BoxGeometry(1.7, .06, 1.1), [spEdge, spEdge, spTop, spEdge, spEdge, spEdge], solar.length);
        e.set(.35, 0, 0); q4.setFromEuler(e); solar.forEach(function (q, i) { sp.setMatrixAt(i, m4.compose(v3.set(q[0], q[1], q[2]), q4, one)); }); scene.add(sp);
        // frames: a short front leg and a tall back leg under each panel, standing on the roof
        var sl = new T.InstancedMesh(new T.BoxGeometry(.06, 1, .06).translate(0, .5, 0), M(0x9AA4AE, { metalness: .6, roughness: .4 }), solar.length * 2);
        solar.forEach(function (q, i) { var base = q[1] - .5; sl.setMatrixAt(i * 2, m4.compose(v3.set(q[0], base, q[2] + .48), q4.identity(), s3.set(1, .3, 1))); sl.setMatrixAt(i * 2 + 1, m4.compose(v3.set(q[0], base, q[2] - .48), q4.identity(), s3.set(1, .7, 1))); }); scene.add(sl);
      }
      // rooftop hoardings on two blocks along the main road (public-service messages)
      [[0, 'DRIVE SAFE · WEAR A HELMET', '#2673B5'], [4, 'KEEP LEFT · STOP AT THE LINE', '#2E8B57']].forEach(function (H0) {
        var b = BLD[H0[0]]; if (!b) return;
        var fz = b[1] > 0 ? b[1] - b[3] / 2 + 1.5 : b[1] + b[3] / 2 - 1.5, g = new T.Group(); g.position.set(b[0], b[4], fz); g.rotation.y = b[1] > 0 ? Math.PI : 0;
        [-5, 0, 5].forEach(function (px) { var p = new T.Mesh(new T.BoxGeometry(.18, 3.4, .18), hoardSteel); p.position.set(px, 1.7, -.3); g.add(cs(p)); });
        var bt = canvasTex(1024, 256, function (x, w, h) { x.fillStyle = H0[2]; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.fillRect(0, h - 26, w, 26); x.font = '800 74px "Onest", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(H0[1], w / 2, h / 2 - 10); });
        var hb = M(0x8E979F);
        var bd = new T.Mesh(new T.BoxGeometry(13, 3.3, .2), [hb, hb, hb, hb, M(0xffffff, { map: bt, roughness: .5 }), M(0x9AA4AE)]); bd.position.set(0, 4.6, 0); g.add(cs(bd));
        var cat = new T.Mesh(new T.BoxGeometry(13, .08, .8), hoardSteel); cat.position.set(0, 2.9, .3); g.add(cat);
        scene.add(g);
      });
    })();
    // command centre: blue glass block with a cut-away ground floor showing the control room
    var CC = { x: 54, z: -56 };
    var wallTiles = [], opScreen = null, opBtn = null, ccLeds = [];
    (function commandCentre() {
      var steel0 = M(0xB4BDC6, { roughness: .4, metalness: .7 });
      var glass = M(0x7FA6CC, { roughness: .12, metalness: .6, envMapIntensity: 1.2 }), frame = M(0xE9EDF1, { roughness: .6 }), floorM = M(0xF4F6F8, { roughness: .7 });
      var upper = new T.Mesh(new T.BoxGeometry(34, 22, 26), glass); upper.position.set(CC.x, 10 + 11, CC.z); scene.add(cs(upper));
      for (var fl = 0; fl < 5; fl++) { var band = new T.Mesh(new T.BoxGeometry(34.4, .5, 26.4), frame); band.position.set(CC.x, 10.2 + fl * 4.4, CC.z); scene.add(band); }
      var roof = new T.Mesh(new T.BoxGeometry(34.6, .8, 26.6), frame); roof.position.set(CC.x, 32.2, CC.z); scene.add(cs(roof));
      var fins = [];
      for (var fx = -16; fx <= 16; fx += 1.6) fins.push([CC.x + fx, CC.z + 12.95, 0]);
      for (var fz = -12; fz <= 12; fz += 1.6) { fins.push([CC.x - 17.15, CC.z + fz, 1], [CC.x + 17.15, CC.z + fz, 1]); }
      var finIM = new T.InstancedMesh(new T.BoxGeometry(.14, 21.2, .3), frame, fins.length), fe = new T.Euler();
      fins.forEach(function (F, k) { fe.set(0, F[2] ? Math.PI / 2 : 0, 0); finIM.setMatrixAt(k, m4.compose(v3.set(F[0], 21.4, F[1]), q4.setFromEuler(fe), s3.set(1, 1, 1))); });
      if (SHADOWS) finIM.castShadow = true; scene.add(finIM);
      // ground floor room: floor, back wall, sides, ceiling slab; open towards the junction (+z)
      var flo = new T.Mesh(new T.BoxGeometry(34, .3, 26), floorM); flo.position.set(CC.x, .15, CC.z); scene.add(rcv(flo));
      var back = new T.Mesh(new T.BoxGeometry(34, 10, .5), frame); back.position.set(CC.x, 5, CC.z - 12.8); scene.add(cs(back));
      [-1, 1].forEach(function (sd) { var side = new T.Mesh(new T.BoxGeometry(.5, 10, 26), frame); side.position.set(CC.x + sd * 16.8, 5, CC.z); scene.add(cs(side)); });
      var ceil = new T.Mesh(new T.BoxGeometry(34, .4, 26), frame); ceil.position.set(CC.x, 9.9, CC.z); scene.add(ceil);
      // clear span: the slab rests on the side walls; only a head beam crosses the opening, no column in the view
      var head0 = new T.Mesh(new T.BoxGeometry(34, .7, .6), frame); head0.position.set(CC.x, 9.55, CC.z + 12.7); scene.add(cs(head0));
      var glz = new T.Mesh(new T.PlaneGeometry(33, 9.2), new T.MeshStandardMaterial({ color: 0xCFE0EE, roughness: .05, metalness: .2, transparent: true, opacity: .06, depthWrite: false })); glz.position.set(CC.x, 4.8, CC.z + 12.95); scene.add(glz);
      var sign = new T.Mesh(new T.PlaneGeometry(14, 2.2), B(0xffffff, { map: titleBoard('01', 'Video wall', 'Cygnus') })); sign.position.set(CC.x, 11.6, CC.z + 13.25); scene.add(sign);
      // the 3x3 wall: real masked corridor feeds and illustrative views as tiles
      var names = ['t1-corridor', 't6-city', 't2-corridor', 't3-corridor', 't7-campus', 't4-corridor', 't8-port', 't5-corridor', 't9-warehouse'];
      var loader = new T.TextureLoader(), bezel = M(0x1A2028, { roughness: .4, metalness: .4 });
      var wb = new T.Mesh(new T.BoxGeometry(17.2, 9.4, .3), bezel); wb.position.set(CC.x, 5.3, CC.z - 12.4); scene.add(wb);
      names.forEach(function (n, k) {
        var col = k % 3, row = Math.floor(k / 3);
        var tx = loader.load('img/real/tiles/' + n + '.webp'); tx.encoding = T.sRGBEncoding; tx.anisotropy = 4; TEX.push(tx);
        var pl = new T.Mesh(new T.PlaneGeometry(5.5, 2.95), new T.MeshBasicMaterial({ map: tx, toneMapped: false }));
        pl.position.set(CC.x + (col - 1) * 5.65, 8.25 - row * 3.05, CC.z - 12.22); scene.add(pl);
        var fr = new T.LineSegments(new T.EdgesGeometry(new T.PlaneGeometry(5.5, 2.95)), new T.LineBasicMaterial({ color: k === 1 ? 0xD6453D : 0x2673B5, transparent: true, opacity: .0 }));
        fr.position.copy(pl.position); fr.position.z += .02; scene.add(fr);
        wallTiles.push({ pl: pl, fr: fr, k: k });
      });
      // operator desk, chair, operator and a console showing the alarm with an Approve button
      var desk = new T.Mesh(new T.BoxGeometry(12, .25, 3), M(0xDCE2E8, { roughness: .5 })); desk.position.set(CC.x, 2.6, CC.z - 3); scene.add(cs(desk));
      [-5.6, 5.6].forEach(function (lx) { var leg = new T.Mesh(new T.BoxGeometry(.25, 2.5, 2.6), M(0xB8C1CA)); leg.position.set(CC.x + lx, 1.3, CC.z - 3); scene.add(cs(leg)); });
      for (var mi = -1; mi <= 1; mi++) {
        var mon = new T.Mesh(new T.BoxGeometry(2.8, 1.7, .12), bezel); mon.position.set(CC.x + mi * 3.1, 3.75, CC.z - 3.9); mon.rotation.y = -mi * .18; scene.add(cs(mon));
        if (mi === 0) {
          var scr = canvasTex(512, 310, function (x, w, h) {
            x.fillStyle = '#F4F7FA'; x.fillRect(0, 0, w, h);
            x.fillStyle = '#D6453D'; x.fillRect(0, 0, w, 52); x.fillStyle = '#fff'; x.font = '600 26px "Geist Mono", monospace'; x.fillText('WATCHLIST ALARM', 18, 35);
            x.fillStyle = '#0A1A2B'; x.font = '700 40px "Onest", sans-serif'; x.fillText('XX 00 CD 5678', 18, 118);
            x.fillStyle = '#5B6E82'; x.font = '500 24px "Geist Mono", monospace'; x.fillText('J-04 · north arm · clip 12 s', 18, 160);
            x.fillStyle = '#2673B5'; x.fillRect(18, 206, 220, 70); x.fillStyle = '#fff'; x.font = '700 30px "Onest", sans-serif'; x.fillText('Approve', 64, 252);
            x.strokeStyle = '#C5D4E2'; x.lineWidth = 3; x.strokeRect(258, 206, 220, 70); x.fillStyle = '#0E3B66'; x.fillText('Dismiss', 312, 252);
          });
          opScreen = new T.Mesh(new T.PlaneGeometry(2.6, 1.55), new T.MeshBasicMaterial({ map: scr, toneMapped: false })); opScreen.position.set(CC.x, 3.75, CC.z - 3.83); scene.add(opScreen);
          opBtn = new T.Mesh(new T.PlaneGeometry(1.15, .36), B(0x5A9FD4, { transparent: true, opacity: 0 })); opBtn.position.set(CC.x - .62, 3.37, CC.z - 3.81); scene.add(opBtn);
        }
      }
      // the operator: a seated figure
      var shirt = M(0x7EA7D0, { roughness: .8 }), skin = M(0x9C6B4E, { roughness: .7 }), dark = M(0x2A3038, { roughness: .8 });
      var chair = new T.Mesh(new T.BoxGeometry(1.6, .3, 1.6), dark); chair.position.set(CC.x, 1.7, CC.z - .6); scene.add(cs(chair));
      var chairB = new T.Mesh(new T.BoxGeometry(1.6, 2, .25), dark); chairB.position.set(CC.x, 2.8, CC.z + .2); scene.add(cs(chairB));
      var torso = new T.Mesh(new T.CylinderGeometry(.5, .6, 1.7, 14), shirt); torso.position.set(CC.x, 2.75, CC.z - .8); scene.add(cs(torso));
      var head = new T.Mesh(new T.SphereGeometry(.38, 18, 14), skin); head.position.set(CC.x, 3.95, CC.z - .9); scene.add(cs(head));
      var hair = new T.Mesh(new T.SphereGeometry(.4, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2), dark); hair.position.set(CC.x, 4.0, CC.z - .86); scene.add(hair);
      [-1, 1].forEach(function (sd) { var arm = new T.Mesh(new T.CylinderGeometry(.13, .13, 1.4, 8), shirt); arm.position.set(CC.x + sd * .55, 2.9, CC.z - 1.6); arm.rotation.x = 1.15; scene.add(cs(arm)); });
      for (var li = 0; li < 6; li++) { var led = new T.Mesh(new T.BoxGeometry(.18, .08, .02), B(0x5A9FD4)); led.position.set(CC.x - 7 + li * .35, 1.2, CC.z - 1.48); scene.add(led); ccLeds.push(led); }
      // the wall curves: two angled wings of 2x3 bezelled screens either side of the centre block
      var wingT = ['w13', 'n03', 'w15', 'n05', 'w17', 'n07', 'w19', 'n09', 'w21', 'n11', 'w23', 'n01'], wi = 0;
      [-1, 1].forEach(function (sd) {
        var wg = new T.Group(); wg.position.set(CC.x + sd * 8.6, 0, CC.z - 12.4); wg.rotation.y = -sd * .42; scene.add(wg);
        var wb2 = new T.Mesh(new T.BoxGeometry(11.6, 9.4, .3), bezel); wb2.position.set(sd * 5.8, 5.3, 0); wg.add(wb2);
        for (var c = 0; c < 2; c++) for (var r = 0; r < 3; r++) {
          var tx2 = loader.load('img/real/tiles/' + wingT[wi++ % wingT.length] + '.webp'); tx2.encoding = T.sRGBEncoding; TEX.push(tx2);
          var pl2 = new T.Mesh(new T.PlaneGeometry(5.5, 2.95), new T.MeshBasicMaterial({ map: tx2, toneMapped: false })); pl2.position.set(sd * (2.95 + c * 5.65), 8.25 - r * 3.05, .18); wg.add(pl2);
        }
        var base = new T.Mesh(new T.BoxGeometry(11.6, .6, .8), M(0x2A3038, { roughness: .6 })); base.position.set(sd * 5.8, .3, .3); wg.add(base);
      });
      // two more operator positions, angled towards the wall, each with three monitors, keyboard, chair and operator
      var deskM = M(0xDCE2E8, { roughness: .5 }), sideM = M(0x9AA6B2, { roughness: .6, metalness: .3 }), keyM = M(0x2B323A, { roughness: .6 });
      var shirts2 = [0xF1F2F3, 0x2A5A9A];
      [-1, 1].forEach(function (sd, n) {
        var g = new T.Group(); g.position.set(CC.x + sd * 9.4, 0, CC.z - 3.4); g.rotation.y = sd * .32; scene.add(g);
        function put(geo, mat, x, y, z) { var m = new T.Mesh(geo, mat); m.position.set(x, y, z); g.add(cs(m)); return m; }
        put(new T.BoxGeometry(5.6, .2, 2.2), deskM, 0, 2.6, 0); put(new T.BoxGeometry(5.6, 2.4, .12), sideM, 0, 1.3, -1.05);
        [-1, 0, 1].forEach(function (k) {
          var mon = put(new T.BoxGeometry(1.7, 1.05, .1), bezel, k * 1.8, 3.65, -.6); mon.rotation.y = -k * .2;
          var sc = new T.Mesh(new T.PlaneGeometry(1.58, .93), B([0x9CC8EE, 0xBFDDF5, 0x6FA9DC][(k + 1 + n) % 3])); sc.position.set(k * 1.8 + Math.sin(-k * .2) * .06, 3.65, -.6 + .06); sc.rotation.y = -k * .2; g.add(sc);
          put(new T.BoxGeometry(.12, .5, .12), bezel, k * 1.8, 2.95, -.7);
        });
        put(new T.BoxGeometry(1.3, .06, .45), keyM, 0, 2.73, .3); put(new T.BoxGeometry(.18, .06, .26), keyM, .95, 2.73, .3);
        put(new T.BoxGeometry(1.4, .22, 1.4), dark, 0, 1.6, 2.0); put(new T.BoxGeometry(1.4, 1.8, .2), dark, 0, 2.6, 2.7);
        put(new T.CylinderGeometry(.08, .08, 1.2, 8), steel0, 0, .9, 2.0); put(new T.CylinderGeometry(.75, .75, .08, 12), dark, 0, .1, 2.0);
        put(new T.CylinderGeometry(.45, .55, 1.5, 12), M(shirts2[n], { roughness: .8 }), 0, 2.55, 1.85);
        put(new T.SphereGeometry(.34, 16, 12), skin, 0, 3.6, 1.8); var hr = put(new T.SphereGeometry(.36, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), dark, 0, 3.66, 1.85);
        [-1, 1].forEach(function (a) { var ar = put(new T.CylinderGeometry(.12, .12, 1.2, 8), M(shirts2[n], { roughness: .8 }), a * .5, 2.75, 1.2); ar.rotation.x = 1.2; });
      });
      // ceiling light panels and a light trough over the wall
      var cl = new T.InstancedMesh(new T.BoxGeometry(2.6, .08, 1.1), M(0xffffff, { emissive: 0xF4F8FF, emissiveIntensity: 1.25, roughness: .3 }), 20), ck = 0;
      for (var lx = -12; lx <= 12; lx += 6) for (var lz = -8; lz <= 8; lz += 5.3) { cl.setMatrixAt(ck++, new T.Matrix4().makeTranslation(CC.x + lx, 9.66, CC.z + lz)); }
      cl.count = ck; scene.add(cl);
      var trough = new T.Mesh(new T.BoxGeometry(30, .3, .8), M(0xffffff, { emissive: 0xDCEBFA, emissiveIntensity: .9 })); trough.position.set(CC.x, 9.5, CC.z - 11.4); scene.add(trough);
    })();

    /* ---------- signals, pole cameras, title boards ---------- */
    var steel = M(0xB4BDC6, { roughness: .4, metalness: .7 }), blackM = M(0x1E2226, { roughness: .5 });
    var signals = [];
    function signalPole(x, z, rot, axis) {
      var g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = rot;
      var pole = new T.Mesh(new T.CylinderGeometry(.18, .22, 7, 10), steel); pole.position.y = 3.5; g.add(cs(pole));
      var arm = new T.Mesh(new T.BoxGeometry(.18, .18, 6), steel); arm.position.set(0, 6.8, 3); g.add(cs(arm));
      var headM = new T.Mesh(new T.BoxGeometry(.7, 2.1, .6), blackM); headM.position.set(0, 5.9, 5.6); g.add(cs(headM));
      var backP = new T.Mesh(new T.BoxGeometry(1.15, 2.5, .06), blackM); backP.position.set(0, 5.9, 5.27); g.add(backP);
      var stripe = new T.Mesh(new T.BoxGeometry(1.19, .08, .07), M(0xF2F4F6)); stripe.position.set(0, 7.12, 5.27); g.add(stripe);
      var lamps = [0xD6453D, 0xE7A93A, 0x2FA36B].map(function (c, k) {
        var l = new T.Mesh(new T.CircleGeometry(.22, 16), B(c)); l.position.set(0, 6.55 - k * .65, 5.92); g.add(l);
        var visor = new T.Mesh(new T.CylinderGeometry(.27, .27, .42, 14, 1, true, -Math.PI / 2, Math.PI), blackM); visor.rotation.x = Math.PI / 2; visor.position.set(0, 6.6 - k * .65, 6.1); g.add(visor);
        return l;
      });
      var pedBox = new T.Mesh(new T.BoxGeometry(.5, .9, .35), blackM); pedBox.position.set(0, 3.2, .3); g.add(cs(pedBox));
      var pedLamp = new T.Mesh(new T.PlaneGeometry(.32, .32), B(0xD6453D)); pedLamp.position.set(0, 3.35, .48); g.add(pedLamp); lamps.ped = pedLamp;
      // countdown timer under the head (seconds to the next change for this arm)
      var cdC = document.createElement('canvas'); cdC.width = 128; cdC.height = 64; var cdT = new T.CanvasTexture(cdC); cdT.encoding = T.sRGBEncoding; TEX.push(cdT);
      var cdBox = new T.Mesh(new T.BoxGeometry(.9, .5, .3), blackM); cdBox.position.set(0, 4.45, 5.6); g.add(cdBox);
      var cdP = new T.Mesh(new T.PlaneGeometry(.8, .4), new T.MeshBasicMaterial({ map: cdT, toneMapped: false })); cdP.position.set(0, 4.45, 5.76); g.add(cdP);
      scene.add(g); signals.push({ axis: axis, lamps: lamps, cd: { c: cdC, t: cdT, last: '' } });
    }
    signalPole(JB + 1, JB + 1, 0, 'ns'); signalPole(-JB - 1, -JB - 1, Math.PI, 'ns');
    signalPole(JB + 1, -JB - 1, Math.PI / 2, 'ew'); signalPole(-JB - 1, JB + 1, -Math.PI / 2, 'ew');
    var cams = {};
    function poleCam(id, x, z, aimX, aimZ) {
      var g = new T.Group(); g.position.set(x, 0, z);
      var pole = new T.Mesh(new T.CylinderGeometry(.16, .2, 9, 10), steel); pole.position.y = 4.5; g.add(cs(pole));
      var head = new T.Group(); head.position.y = 9.2; g.add(head);
      var housing = new T.Mesh(new T.BoxGeometry(.5, .45, 1.1), M(0xF4F6F8, { roughness: .32, metalness: .15 })); head.add(cs(housing));
      var shield = new T.Mesh(new T.BoxGeometry(.62, .05, 1.36), M(0xF4F6F8)); shield.position.y = .26; head.add(shield);
      var lens = new T.Mesh(new T.CylinderGeometry(.14, .14, .08, 16).rotateX(Math.PI / 2), M(0x0B1520, { roughness: .05, metalness: .9 })); lens.position.z = .58; head.add(lens);
      head.lookAt(aimX, 0, aimZ);
      // view frustum as a translucent wedge on the road
      var a = new T.Vector3(x, 9.2, z), dir = new T.Vector3(aimX - x, 0, aimZ - z).normalize(), side = new T.Vector3(-dir.z, 0, dir.x);
      var n0 = a.clone().setY(.08).add(dir.clone().multiplyScalar(4)), f0 = a.clone().setY(.08).add(dir.clone().multiplyScalar(30));
      var P = [n0.clone().add(side.clone().multiplyScalar(-2.5)), n0.clone().add(side.clone().multiplyScalar(2.5)), f0.clone().add(side.clone().multiplyScalar(9)), f0.clone().add(side.clone().multiplyScalar(-9))];
      var geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute([].concat(P[0].toArray(), P[1].toArray(), P[2].toArray(), P[0].toArray(), P[2].toArray(), P[3].toArray(), a.toArray(), P[0].toArray(), P[1].toArray(), a.toArray(), P[3].toArray(), P[2].toArray()), 3));
      var zone = new T.Mesh(geo, new T.MeshBasicMaterial({ color: 0x2673B5, transparent: true, opacity: .08, side: T.DoubleSide, depthWrite: false, toneMapped: false }));
      scene.add(g); scene.add(zone);
      cams[id] = { g: g, head: head, zone: zone, top: new T.Vector3(x, 10.6, z), base: head.quaternion.clone() };
    }
    poleCam('J-04', -JB - 2.5, -JB - 2.5, -4, 40);       // north-west corner, watching the south-bound arm
    poleCam('J-05', -JB - 2.5, JB + 2.5, -40, 6);        // south-west corner: the camera that gets blinded
    poleCam('J-06', JB + 2.5, JB + 2.5, 4, -40);
    poleCam('J-02', -78, ROAD_EW_HALF + 3, -50, 2);      // up the road to the west
    poleCam('J-07', ROAD_NS_HALF + 3, -78, 2, -50);      // up the road to the north
    function board(num, name, x, y, z, ry, w) {
      var g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0;
      [-w / 2 + .6, w / 2 - .6].forEach(function (px) { var p = new T.Mesh(new T.CylinderGeometry(.16, .18, y, 10), steel); p.position.set(px, y / 2, 0); g.add(cs(p)); });
      var housing = new T.Mesh(new T.BoxGeometry(w + .4, w * .158 + .4, .4), M(0x2A3540)); housing.position.set(0, y + w * .079, -.12); g.add(cs(housing));
      var b = new T.Mesh(new T.PlaneGeometry(w, w * .158), B(0xffffff, { map: titleBoard(num, name, 'Cygnus') })); b.position.set(0, y + w * .079, .1); g.add(b);
      scene.add(g);
    }
    // [num, name, station, post height]: the watchlist board is raised so the plate tags on the flagged car pass below it
    var boardsLater = [['02', 'Watchlist alarm', 1, 13], ['04', 'Camera health', 3, 6.5]];

    /* ---------- street detail: lane arrows, lamps, trees, bollards, bus stop, shopfronts, metro viaduct ---------- */
    (function laneArrows() {
      var sh = new T.Shape(); sh.moveTo(-.25, -2.2); sh.lineTo(.25, -2.2); sh.lineTo(.25, .4); sh.lineTo(.75, .4); sh.lineTo(0, 1.6); sh.lineTo(-.75, .4); sh.lineTo(-.25, .4); sh.lineTo(-.25, -2.2);
      var geo = new T.ShapeGeometry(sh); geo.rotateX(-Math.PI / 2);
      var spots = [[-1, 7.5, 1], [-1, 2.5, 1], [1, -2.5, -1], [1, -7.5, -1]]; // x-axis lanes: off, dir
      var list = [];
      [[7.5, 1], [2.5, 1], [-2.5, -1], [-7.5, -1]].forEach(function (L) { [-28, -40, -80, -120].forEach(function (p) { list.push({ x: p * L[1], z: L[0], ry: L[1] > 0 ? -Math.PI / 2 : Math.PI / 2 }); }); });
      [[-2, 1], [-6, 1], [2, -1], [6, -1]].forEach(function (L) { [-28, -40, -80, -120].forEach(function (p) { list.push({ x: L[0], z: p * L[1], ry: L[1] > 0 ? Math.PI : 0 }); }); });
      var im = new T.InstancedMesh(geo, decal(B(0xF4F6F8), 3), list.length), e = new T.Euler();
      list.forEach(function (A, k) { e.set(0, A.ry, 0); q4.setFromEuler(e); m4.compose(v3.set(A.x, .06, A.z), q4, s3.set(1, 1, 1)); im.setMatrixAt(k, m4); });
      scene.add(im);
    })();
    // people: torso, hips, head with hair, swinging legs with shoes and arms with hands; one draw call per part
    function makeCrowd(n) {
      var SK = [0x8E5F43, 0xA8744F, 0x6E4630, 0xC08A63], SH = [0x2A5A9A, 0xB0302A, 0xE7C33A, 0x3B8C4A, 0xF1F2F3, 0x7D858C, 0xD97A2B, 0x6B4FA0, 0xE9DCC8, 0x1F7A8C],
        PA = [0x2A3038, 0x3B4A5C, 0x6B5A48, 0x1E2226, 0x8A8F96, 0xD9D2C3], HA = [0x16130F, 0x2B2118, 0x3A3A3A];
      function im(geo, color, count, shadow) { var m = new T.InstancedMesh(geo, M(color, { roughness: .8 }), count); m.instanceMatrix.setUsage(T.DynamicDrawUsage); m.frustumCulled = false; if (SHADOWS && shadow) m.castShadow = true; scene.add(m); return m; }
      var C = {
        torso: im(new T.CylinderGeometry(.21, .17, .6, 10).scale(1, 1, .68).translate(0, 1.24, 0), 0xffffff, n, true),
        hips: im(new T.BoxGeometry(.34, .2, .21).translate(0, .98, 0), 0xffffff, n),
        head: im(merge([[new T.SphereGeometry(.12, 12, 10).scale(.92, 1.05, 1).translate(0, 1.7, 0)], [new T.CylinderGeometry(.05, .055, .14, 8).translate(0, 1.56, 0)]]), 0xffffff, n, true),
        hair: im(new T.SphereGeometry(.128, 10, 8, 0, Math.PI * 2, 0, Math.PI * .55).translate(0, 1.715, -.012), 0xffffff, n),
        legs: im(new T.BoxGeometry(.14, .86, .16).translate(0, -.43, 0), 0xffffff, n * 2, true),
        shoes: im(new T.BoxGeometry(.13, .09, .27).translate(0, -.885, .05), 0x1E2226, n * 2),
        arms: im(new T.BoxGeometry(.095, .56, .1).translate(0, -.28, 0), 0xffffff, n * 2),
        hands: im(new T.SphereGeometry(.05, 6, 5).translate(0, -.6, 0), 0xffffff, n * 2)
      }, col = new T.Color();
      C.blob = new T.InstancedMesh(BLOB_GEO, blobMat(BLOB_ROUND, .42), n); C.blob.instanceMatrix.setUsage(T.DynamicDrawUsage); C.blob.frustumCulled = false; scene.add(C.blob);
      for (var k = 0; k < n; k++) {
        var shirt = SH[(k * 7) % SH.length], pants = PA[(k * 5 + 1) % PA.length], skin = SK[(k * 3) % SK.length];
        C.torso.setColorAt(k, col.setHex(shirt)); C.hips.setColorAt(k, col.setHex(pants)); C.head.setColorAt(k, col.setHex(skin)); C.hair.setColorAt(k, col.setHex(HA[k % HA.length]));
        for (var j = 0; j < 2; j++) { C.legs.setColorAt(k * 2 + j, col.setHex(pants)); C.arms.setColorAt(k * 2 + j, col.setHex(shirt)); C.hands.setColorAt(k * 2 + j, col.setHex(skin)); }
      }
      var e = new T.Euler(), q = new T.Quaternion(), mm = new T.Matrix4(), p = new T.Vector3(), one = new T.Vector3(1, 1, 1);
      var bs = new T.Vector3(.62, 1, .62);
      C.pose = function (k, x, y, z, ry, sw, gy) {
        e.set(0, ry, 0); q.setFromEuler(e); mm.compose(p.set(x, (gy === undefined ? y : gy) + .012, z), q, bs); C.blob.setMatrixAt(k, mm);
        mm.compose(p.set(x, y, z), q, one);
        C.torso.setMatrixAt(k, mm); C.hips.setMatrixAt(k, mm); C.head.setMatrixAt(k, mm); C.hair.setMatrixAt(k, mm);
        var cx = Math.cos(ry), cz = -Math.sin(ry);
        for (var j = 0; j < 2; j++) {
          var sd = j ? 1 : -1;
          e.set(sw * .5 * sd, ry, 0, 'YXZ'); q.setFromEuler(e); mm.compose(p.set(x + cx * sd * .09, y + .93, z + cz * sd * .09), q, one); C.legs.setMatrixAt(k * 2 + j, mm); C.shoes.setMatrixAt(k * 2 + j, mm);
          e.set(-sw * .55 * sd, ry, sd * .06, 'YXZ'); q.setFromEuler(e); mm.compose(p.set(x + cx * sd * .25, y + 1.5, z + cz * sd * .25), q, one); C.arms.setMatrixAt(k * 2 + j, mm); C.hands.setMatrixAt(k * 2 + j, mm);
        }
      };
      C.flush = function () { ['torso', 'hips', 'head', 'hair', 'legs', 'shoes', 'arms', 'hands', 'blob'].forEach(function (key) { C[key].instanceMatrix.needsUpdate = true; }); };
      return C;
    }
    var walkers = [], walkCrowd = null;
    (function streetFurniture() {
      var e = new T.Euler(), one = new T.Vector3(1, 1, 1);
      // street lamps along both roads (pole + arm + glowing head)
      var spots = [];
      for (var lx = -150; lx <= 150; lx += 26) { if (Math.abs(lx) < JB + 8) continue; spots.push([lx, ROAD_EW_HALF + 3.6, Math.PI], [lx + 13, -ROAD_EW_HALF - 3.6, 0]); }
      for (var lz = -150; lz <= 150; lz += 26) { if (Math.abs(lz) < JB + 8 || Math.abs(lz + 22) < 8) continue; spots.push([ROAD_NS_HALF + 3.6, lz, -Math.PI / 2], [-ROAD_NS_HALF - 3.6, lz + 13, Math.PI / 2]); }
      if (MOB) spots = spots.filter(function (sp, k) { return k % 2 === 0; });
      var pole = new T.CylinderGeometry(.12, .17, 8.4, 8).translate(0, 4.2, 0), arm = new T.BoxGeometry(.1, .1, 2.6).translate(0, 8.3, 1.2), head = new T.BoxGeometry(.4, .14, .9).translate(0, 8.22, 2.4);
      var poles = new T.InstancedMesh(pole, steel, spots.length), arms = new T.InstancedMesh(arm, steel, spots.length), heads = new T.InstancedMesh(head, M(0xffffff, { emissive: 0xFFF1D6, emissiveIntensity: 1.6, roughness: .3 }), spots.length);
      spots.forEach(function (S, k) { e.set(0, S[2], 0); q4.setFromEuler(e); m4.compose(v3.set(S[0], 0, S[1]), q4, one); poles.setMatrixAt(k, m4); arms.setMatrixAt(k, m4); heads.setMatrixAt(k, m4); });
      if (SHADOWS) poles.castShadow = true; scene.add(poles); scene.add(arms); scene.add(heads);
      // trees in pits along the footpaths
      var tp = [];
      for (var tx = -140; tx <= 140; tx += 17) { if (Math.abs(tx) < JB + 10) continue; tp.push([tx + 6, ROAD_EW_HALF + 1.2]); }
      for (var tz = 22; tz <= 140; tz += 17) { tp.push([ROAD_NS_HALF + 1.2, tz + 6], [-ROAD_NS_HALF - 1.2, tz + 3]); }
      if (MOB) tp = tp.filter(function (p, k) { return k % 2 === 0; });
      var trunks = new T.InstancedMesh(new T.CylinderGeometry(.14, .2, 2.6, 7).translate(0, 1.3, 0), M(0x6B5340, { roughness: .9 }), tp.length);
      var crowns = new T.InstancedMesh(merge([[new T.IcosahedronGeometry(1.25, 1)], [new T.IcosahedronGeometry(1.0, 1).translate(.95, .25, .2)], [new T.IcosahedronGeometry(.95, 1).translate(-.75, .35, -.55)], [new T.IcosahedronGeometry(.9, 1).translate(.1, .85, .65)], [new T.IcosahedronGeometry(.8, 1).translate(-.3, -.2, .9)]]), M(0x5C8A45, { roughness: .9, flatShading: true }), tp.length), cc = new T.Color(), eyaw = new T.Euler();
      tp.forEach(function (p, k) { var sz = .8 + Math.random() * .5; m4.compose(v3.set(p[0], 0, p[1]), q4.identity(), one); trunks.setMatrixAt(k, m4); eyaw.set(0, k * 2.39, 0); m4.compose(v3.set(p[0], 3.4 * sz, p[1]), q4.setFromEuler(eyaw), s3.set(sz, sz * .9, sz)); crowns.setMatrixAt(k, m4); crowns.setColorAt(k, cc.setHex([0x5C8A45, 0x4E7A3B, 0x6A9450][k % 3])); });
      if (SHADOWS) { trunks.castShadow = true; crowns.castShadow = true; } scene.add(trunks); scene.add(crowns);
      // a second species (tall, narrow ashoka-like crowns) in the gaps, tree guards round every pit
      var tp2 = tp.filter(function (p) { return Math.abs(p[1] - (ROAD_EW_HALF + 1.2)) < .01; }).map(function (p) { return [p[0] + 8.5, p[1]]; }).filter(function (p) { return Math.abs(p[0]) > JB + 9 && !(Math.abs(p[0] + 34) < 5); });
      var cone = new T.InstancedMesh(new T.ConeGeometry(1.1, 6.2, 8).translate(0, 5.0, 0), M(0x3F6B34, { roughness: .9, flatShading: true }), tp2.length), tr2 = new T.InstancedMesh(new T.CylinderGeometry(.1, .14, 2.2, 6).translate(0, 1.1, 0), M(0x6B5340, { roughness: .9 }), tp2.length);
      tp2.forEach(function (p, k) { var sz = .85 + Math.random() * .35; m4.compose(v3.set(p[0], 0, p[1]), q4.identity(), s3.set(sz, sz, sz)); cone.setMatrixAt(k, m4); tr2.setMatrixAt(k, m4); });
      if (SHADOWS) cone.castShadow = true; scene.add(cone); scene.add(tr2);
      var guards = new T.InstancedMesh(new T.CylinderGeometry(.55, .55, 1.0, 10, 1, true).translate(0, .75, 0), M(0x2A3038, { roughness: .6, side: T.DoubleSide, wireframe: false }), tp.length);
      tp.forEach(function (p, k) { m4.compose(v3.set(p[0], 0, p[1]), q4.identity(), one); guards.setMatrixAt(k, m4); }); scene.add(guards);
      // shrubs along the planted median
      var sh = [], sm = new T.InstancedMesh(new T.IcosahedronGeometry(.5, 0), M(0x557F3F, { roughness: .9, flatShading: true }), MOB ? 40 : 90);
      for (var si = 0; si < sm.count; si++) { var sx = (si % 2 ? 1 : -1) * (JB + 6 + (si >> 1) * (MOB ? 5.4 : 2.6)); m4.compose(v3.set(sx, .55, (Math.random() - .5) * .3), q4.identity(), s3.setScalar(.8 + Math.random() * .5)); sm.setMatrixAt(si, m4); }
      if (SHADOWS) sm.castShadow = true; scene.add(sm);
      // granite kerb edges on every footpath and median nose markers
      var kb = [];
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (q) { kb.push([q[0] * (ROAD_NS_HALF + 127), q[1] * (ROAD_EW_HALF + .12), 250, .24]); kb.push([q[0] * (ROAD_NS_HALF + .12), q[1] * (ROAD_EW_HALF + 127), .24, 250]); });
      var kIM = new T.InstancedMesh(new T.BoxGeometry(1, .32, 1).translate(0, .16, 0), M(0xA9B0B7, { roughness: .8 }), kb.length);
      kb.forEach(function (q, k) { m4.compose(v3.set(q[0], 0, q[1]), q4.identity(), s3.set(q[2], 1, q[3])); kIM.setMatrixAt(k, m4); }); scene.add(kIM);
      // speed-limit and no-parking signs on posts along the approaches
      var sgTex = canvasTex(128, 128, function (x, w, h) { x.fillStyle = '#fff'; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill(); x.strokeStyle = '#D6453D'; x.lineWidth = 14; x.beginPath(); x.arc(64, 64, 54, 0, 7); x.stroke(); x.fillStyle = '#0A1A2B'; x.font = '800 54px "Onest", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('40', 64, 68); });
      // each disc faces the traffic approaching it (on that traffic's kerb side)
      [[-46, ROAD_EW_HALF + 3.6, -Math.PI / 2], [46, -ROAD_EW_HALF - 3.6, Math.PI / 2], [ROAD_NS_HALF + 3.6, 46, 0], [-ROAD_NS_HALF - 3.6, -46, Math.PI]].forEach(function (S) {
        var g = new T.Group(); g.position.set(S[0], 0, S[1]); g.rotation.y = S[2];
        var pst = new T.Mesh(new T.CylinderGeometry(.06, .06, 3.2, 8).translate(0, 1.6, 0), steel); g.add(pst);
        var dsc = new T.Mesh(new T.CircleGeometry(.5, 24), M(0xffffff, { map: sgTex, roughness: .5 })); dsc.position.set(0, 3.0, .07); g.add(dsc);
        var bk = new T.Mesh(new T.CircleGeometry(.5, 24), M(0x9AA4AE, { metalness: .5 })); bk.rotation.y = Math.PI; bk.position.set(0, 3.0, .06); g.add(bk);
        scene.add(g);
      });
      // overhead direction gantry over the east-west road, west of the junction
      (function () {
        var gx = -70, g = new T.Group(); g.position.set(gx, 0, 0);
        [-1, 1].forEach(function (sd) { var p = new T.Mesh(new T.BoxGeometry(.5, 8.4, .5), steel); p.position.set(0, 4.2, sd * (ROAD_EW_HALF + 3.0)); g.add(cs(p)); });
        [7.6, 8.2].forEach(function (y) { var b2 = new T.Mesh(new T.BoxGeometry(.25, .25, ROAD_EW_HALF * 2 + 6), steel); b2.position.set(0, y, 0); g.add(b2); });
        var dTex = canvasTex(768, 192, function (x, w, h) { x.fillStyle = '#1F5FA0'; x.fillRect(0, 0, w, h); x.strokeStyle = '#fff'; x.lineWidth = 6; x.strokeRect(8, 8, w - 16, h - 16); x.fillStyle = '#fff'; x.font = '700 58px "Onest", sans-serif'; x.fillText('\u2191 City Centre', 40, 84); x.font = '600 44px "Onest", sans-serif'; x.fillText('\u2192 Ring Road   \u2190 Metro', 40, 156); });
        var sgn = new T.Mesh(new T.PlaneGeometry(8.8, 2.2), M(0xffffff, { map: dTex, roughness: .5 })); sgn.rotation.y = -Math.PI / 2; sgn.position.set(-.2, 7.9, ROAD_EW_HALF / 2); g.add(sgn); // faces the east-bound traffic coming from the west
        var sgb = new T.Mesh(new T.BoxGeometry(.1, 2.3, 8.9), M(0x9AA4AE, { metalness: .5 })); sgb.position.set(-.08, 7.9, ROAD_EW_HALF / 2); g.add(sgb);
        scene.add(g);
      })();
      // bollards round the four junction corners (yellow with a black band)
      var bl = [];
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (q) { for (var a = 0; a < 6; a++) { var ang = a / 5 * Math.PI / 2; bl.push([q[0] * (ROAD_NS_HALF + .6 + Math.cos(ang) * 3.2) + q[0] * (a === 0 || a === 5 ? 0 : 0), q[1] * (ROAD_EW_HALF + .6 + Math.sin(ang) * 3.2)]); } });
      var bol = new T.InstancedMesh(new T.CylinderGeometry(.14, .16, .9, 10).translate(0, .45, 0), M(0xE5B52E, { roughness: .5 }), bl.length);
      var band = new T.InstancedMesh(new T.CylinderGeometry(.165, .165, .14, 10).translate(0, .7, 0), blackM, bl.length);
      bl.forEach(function (p, k) { m4.compose(v3.set(p[0], 0, p[1]), q4.identity(), one); bol.setMatrixAt(k, m4); band.setMatrixAt(k, m4); });
      scene.add(bol); scene.add(band);
      // bus stop on the south footpath, west of the junction: roof, glass back, bench, route sign, bin
      var bs = new T.Group(); bs.position.set(-34, .25, ROAD_EW_HALF + 4.3);
      var roof = new T.Mesh(new T.BoxGeometry(7.2, .16, 2.4), M(0x2673B5, { roughness: .4, metalness: .3 })); roof.position.y = 2.9; bs.add(cs(roof));
      [-3.4, 3.4].forEach(function (px) { var p = new T.Mesh(new T.BoxGeometry(.12, 2.9, .12), steel); p.position.set(px, 1.45, .9); bs.add(cs(p)); var p2 = p.clone(); p2.position.z = -.9; bs.add(p2); });
      var back = new T.Mesh(new T.PlaneGeometry(6.8, 2.2), M(0x9CC0DE, { roughness: .05, metalness: .2, transparent: true, opacity: .5, side: T.DoubleSide })); back.position.set(0, 1.5, .95); bs.add(back);
      var bench = new T.Mesh(new T.BoxGeometry(4.2, .12, .55), M(0xC9D1D8, { metalness: .5, roughness: .4 })); bench.position.set(0, .55, .55); bs.add(cs(bench));
      var adPanel = new T.Mesh(new T.PlaneGeometry(1.6, 2.1), B(0xffffff, { map: canvasTex(160, 210, function (x, w, h) { x.fillStyle = '#EAF2FA'; x.fillRect(0, 0, w, h); x.fillStyle = '#2673B5'; x.fillRect(0, 0, w, 46); x.fillStyle = '#fff'; x.font = '700 22px "Onest", sans-serif'; x.fillText('BUS 41', 14, 32); x.fillStyle = '#0E3B66'; x.font = '500 15px "Geist Mono", monospace'; ['Ring Road', 'City Centre', 'Metro Stn'].forEach(function (t, k) { x.fillText('• ' + t, 14, 82 + k * 30); }); }) })); adPanel.position.set(-3.3, 1.5, .88); adPanel.rotation.y = Math.PI / 2; bs.add(adPanel);
      var signP = new T.Mesh(new T.CylinderGeometry(.06, .06, 3.4, 8), steel); signP.position.set(4.3, 1.7, -.8); bs.add(signP);
      var sign = new T.Mesh(new T.CircleGeometry(.42, 24), B(0x2673B5)); sign.position.set(4.3, 3.3, -.74); bs.add(sign);
      var bin = new T.Mesh(new T.CylinderGeometry(.28, .24, .85, 12), M(0x3B8C4A, { roughness: .6 })); bin.position.set(5.2, .42, .2); bs.add(cs(bin));
      scene.add(bs);
      // benches and bins at the corners
      [[-20, ROAD_EW_HALF + 3.1], [20, ROAD_EW_HALF + 3.1], [ROAD_NS_HALF + 3.1, 24], [-ROAD_NS_HALF - 3.1, 30]].forEach(function (p, k) {
        var b2 = new T.Mesh(new T.BoxGeometry(2.2, .12, .5), M(0x8A6A4C, { roughness: .7 })); b2.position.set(p[0], .78, p[1]); if (k > 1) b2.rotation.y = Math.PI / 2; scene.add(cs(b2));
        var bn = new T.Mesh(new T.CylinderGeometry(.26, .22, .8, 10), M(0x3B8C4A, { roughness: .6 })); bn.position.set(p[0] + (k > 1 ? 0 : 1.7), .52, p[1] + (k > 1 ? 1.7 : 0)); scene.add(cs(bn));
      });
      // people walking along the footpaths
      var nW = MOB ? 8 : 18, shirts = [0x2A5A9A, 0xB0302A, 0xE7C33A, 0x3B8C4A, 0xF1F2F3, 0x7D858C, 0xD97A2B, 0x6B4FA0];
      walkCrowd = makeCrowd(nW);
      for (var w = 0; w < nW; w++) {
        var alongX = w % 2 === 0, sgn = w % 4 < 2 ? 1 : -1;
        walkers.push({ alongX: alongX, lane: alongX ? sgn * (ROAD_EW_HALF + 2.0 + (w % 3 ? .4 : 0)) : sgn * (ROAD_NS_HALF + 2.2 + (w % 3 ? .35 : 0)), p: (Math.random() - .5) * 200, dir: Math.random() < .5 ? -1 : 1, sp: 1.1 + Math.random() * .6 });
      }
    })();
    var SHOPROOFS = []; // shophouse roofs, dressed later by the city-fabric rooftop pass
    (function shopfronts() {
      // two-storey shophouses with striped awnings and name boards, on the south side of the east-west road
      // and along the north-south road; the flyover keeps the north side clear
      var NAMES = ['MEDICAL', 'TEA STALL', 'MOBILE', 'BAKERY', 'HARDWARE', 'CLINIC', 'BOOKS', 'SWEETS', 'OPTICALS', 'TAILOR', 'GROCERY', 'XEROX'];
      var AW = ['#2673B5', '#D6453D', '#2E8B57', '#E7A93A', '#6B4FA0', '#1F7A8C'];
      var upper = canvasTex(256, 128, function (x, w, h) { x.fillStyle = '#EDE7DD'; x.fillRect(0, 0, w, h); for (var i = 0; i < 3; i++) { x.fillStyle = '#9DB3C8'; x.fillRect(22 + i * 80, 30, 52, 62); x.fillStyle = '#C9B79C'; x.fillRect(18 + i * 80, 92, 60, 8); } });
      var units = [];
      for (var ux = 24; ux <= 96; ux += 10) { units.push([-ux, ROAD_EW_HALF + 4 + 4, 0]); units.push([ux, ROAD_EW_HALF + 4 + 4, 0]); }
      for (var uz = 26; uz <= 86; uz += 10) { units.push([-(ROAD_NS_HALF + 4 + 4), uz, -Math.PI / 2]); units.push([ROAD_NS_HALF + 4 + 4, uz, Math.PI / 2]); }
      units = units.filter(function (U) { return !(Math.abs(U[0] + 34) < 6 && U[2] === 0) && !(U[0] < -10 && U[0] > -64 && U[1] > 12 && U[1] < 64); }); // keep the bus stop and the south-west camera shot clear
      if (MOB) units = units.filter(function (U, k) { return k % 2 === 0; });
      var shellM = M(0xffffff, { map: upper, roughness: .75 }), plain = M(0xE3DDD2, { roughness: .9 }), glassS = M(0x5E7F9E, { roughness: .08, metalness: .5 });
      units.forEach(function (U, k) {
        var g = new T.Group(); g.position.set(U[0], 0, U[1]); g.rotation.y = U[2];
        var hgt = 6.2 + (k % 3) * 1.2;
        SHOPROOFS.push([U[0], U[1], U[2] === 0 ? 9.2 : 7.6, U[2] === 0 ? 7.6 : 9.2, hgt]);
        var bldg = new T.Mesh(new T.BoxGeometry(9.2, hgt, 7.6), [plain, plain, plain, plain, plain, shellM]); bldg.position.set(0, hgt / 2, 0); g.add(cs(bldg));
        // shop glass and shutter frame on the street face (-z of the group faces the road after rotation)
        var gl = new T.Mesh(new T.PlaneGeometry(7.4, 2.4), glassS); gl.position.set(0, 1.45, -3.81); gl.rotation.y = Math.PI; g.add(gl);
        var awTex = canvasTex(128, 32, function (x, w, h) { for (var i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#FFFFFF' : AW[k % AW.length]; x.fillRect(i * 16, 0, 16, h); } });
        var aw = new T.Mesh(new T.PlaneGeometry(8.6, 1.9), M(0xffffff, { map: awTex, roughness: .7, side: T.DoubleSide })); aw.position.set(0, 3.0, -4.55); aw.rotation.x = -1.0; aw.rotation.y = Math.PI; g.add(cs(aw));
        var nm = NAMES[k % NAMES.length];
        var signTx = canvasTex(512, 96, function (x, w, h) { x.fillStyle = AW[(k + 2) % AW.length]; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = '800 54px "Onest", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(nm, w / 2, h / 2 + 3); });
        var sg = new T.Mesh(new T.PlaneGeometry(6.8, 1.15), M(0xffffff, { map: signTx, roughness: .5 })); sg.position.set(0, 4.25, -3.83); sg.rotation.y = Math.PI; g.add(sg);
        scene.add(g);
      });
    })();
    (function streetLife() {
      // concrete electric poles with cross-arms and sagging overhead wires along the south footpath
      if (!MOB) {
        var poleM = M(0xC9CCC8, { roughness: .9 }), wires = [], px = [];
        for (var ex = -146; ex <= 146; ex += 26) { if (Math.abs(ex) < JB + 10) continue; px.push(ex); }
        px.forEach(function (x0) {
          var p = new T.Mesh(new T.BoxGeometry(.26, 10, .26).translate(0, 5, 0), poleM); p.position.set(x0, 0, ROAD_EW_HALF + 3.75); scene.add(cs(p));
          var arm = new T.Mesh(new T.BoxGeometry(.12, .12, 1.8), steel); arm.position.set(x0, 9.4, ROAD_EW_HALF + 3.75); scene.add(arm);
          [-.75, 0, .75].forEach(function (oz) { var ins = new T.Mesh(new T.CylinderGeometry(.05, .07, .22, 8), M(0xE9ECEF, { roughness: .3 })); ins.position.set(x0, 9.57, ROAD_EW_HALF + 3.75 + oz); scene.add(ins); });
        });
        for (var i = 0; i + 1 < px.length; i++) {
          if (px[i + 1] - px[i] > 30) continue;
          [-.75, 0, .75].forEach(function (oz, j) {
            var sag = .55 + j * .08;
            for (var sgm = 0; sgm < 12; sgm++) {
              var a = sgm / 12, b = (sgm + 1) / 12, xa = px[i] + (px[i + 1] - px[i]) * a, xb = px[i] + (px[i + 1] - px[i]) * b;
              wires.push(xa, 9.68 - Math.sin(a * Math.PI) * sag, ROAD_EW_HALF + 3.75 + oz, xb, 9.68 - Math.sin(b * Math.PI) * sag, ROAD_EW_HALF + 3.75 + oz);
            }
          });
        }
        var wg = new T.BufferGeometry(); wg.setAttribute('position', new T.Float32BufferAttribute(wires, 3));
        scene.add(new T.LineSegments(wg, new T.LineBasicMaterial({ color: 0x2E343A, transparent: true, opacity: .8 })));
      }
      // a tea cart with an umbrella on the east footpath
      var tc = new T.Group(); tc.position.set(27, .25, ROAD_EW_HALF + 3.4);
      var cartM = M(0x2E8B57, { roughness: .6 });
      var cb = new T.Mesh(new T.BoxGeometry(2.0, .9, 1.0), cartM); cb.position.y = .75; tc.add(cs(cb));
      var top = new T.Mesh(new T.BoxGeometry(2.1, .06, 1.1), M(0xC9CDD1, { metalness: .6, roughness: .3 })); top.position.y = 1.23; tc.add(top);
      [-.75, .75].forEach(function (wx) { var wh = new T.Mesh(new T.CylinderGeometry(.3, .3, .08, 14).rotateX(Math.PI / 2), M(0x1E2226)); wh.position.set(wx, .3, .55); tc.add(wh); });
      var ket = new T.Mesh(new T.CylinderGeometry(.16, .2, .32, 12), M(0xD4D8DC, { metalness: .8, roughness: .25 })); ket.position.set(-.5, 1.42, 0); tc.add(ket);
      for (var gI = 0; gI < 5; gI++) { var gl = new T.Mesh(new T.CylinderGeometry(.04, .035, .1, 8), M(0xF2E6CC, { roughness: .2, transparent: true, opacity: .85 })); gl.position.set(.1 + gI * .14, 1.31, .2); tc.add(gl); }
      var um = new T.Mesh(new T.ConeGeometry(1.6, .6, 8, 1, true), M(0xffffff, { side: T.DoubleSide, roughness: .7, map: canvasTex(128, 16, function (x, w, h) { for (var i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#fff' : '#D6453D'; x.fillRect(i * 16, 0, 16, h); } }) })); um.position.y = 2.75; tc.add(cs(um));
      var up = new T.Mesh(new T.CylinderGeometry(.03, .03, 2.4, 6), steel); up.position.y = 1.4; tc.add(up);
      [-1.4, 1.4].forEach(function (sx) { var st = new T.Mesh(new T.CylinderGeometry(.18, .18, .45, 10), M(0x2673B5, { roughness: .5 })); st.position.set(sx, .22, .3); tc.add(cs(st)); });
      scene.add(tc);
      // a news-and-magazine kiosk on the north-west footpath
      var kq = new T.Group(); kq.position.set(-ROAD_NS_HALF - 5.8, .2, -44); // set back behind the footpath: roof edge 4.6 m clear of the kerb kq.rotation.y = Math.PI / 2;
      var kb = new T.Mesh(new T.BoxGeometry(2.4, 2.3, 1.5), M(0xE9ECEF, { roughness: .6 })); kb.position.y = 1.15; kq.add(cs(kb));
      var kr = new T.Mesh(new T.BoxGeometry(2.9, .14, 2.0), M(0x2673B5, { roughness: .4 })); kr.position.y = 2.4; kq.add(cs(kr));
      var mags = new T.Mesh(new T.PlaneGeometry(2.1, 1.1), M(0xffffff, { roughness: .6, map: canvasTex(256, 128, function (x, w, h) { x.fillStyle = '#F4F2EC'; x.fillRect(0, 0, w, h); var C = ['#D6453D', '#2673B5', '#E7A93A', '#2E8B57', '#6B4FA0', '#1F7A8C']; for (var r = 0; r < 3; r++) for (var c = 0; c < 7; c++) { x.fillStyle = C[(r * 7 + c) % 6]; x.fillRect(6 + c * 35, 6 + r * 41, 30, 36); x.fillStyle = 'rgba(255,255,255,.8)'; x.fillRect(9 + c * 35, 10 + r * 41, 22, 5); } }) }));
      mags.position.set(0, 1.35, .76); kq.add(mags);
      scene.add(kq);
    })();
    var metro = null;
    (function metroViaduct() {
      // elevated metro along the north-south road: I-piers in the median, a U-girder deck, rails and a three-car train
      var MY = 15.2, pierM = M(0xD3D8DD, { roughness: .85 }), girder = M(0xE2E6EA, { roughness: .7 }), mg = new T.Group(); scene.add(mg);
      for (var pz = -150; pz <= 150; pz += 26) {
        if (Math.abs(pz) < JB + 8 || Math.abs(pz + 22) < 9) continue;
        var pier = new T.Mesh(new T.BoxGeometry(1.4, MY - 1.2, 1.8), pierM); pier.position.set(0, (MY - 1.2) / 2, pz); mg.add(cs(pier));
        var capT = new T.Mesh(new T.BoxGeometry(7.4, 1.2, 2.4), pierM); capT.position.set(0, MY - .9, pz); mg.add(cs(capT));
      }
      var deck = new T.Mesh(new T.BoxGeometry(7.2, .7, 320), girder); deck.position.set(0, MY, 0); mg.add(cs(deck));
      [-1, 1].forEach(function (sd) { var wall = new T.Mesh(new T.BoxGeometry(.3, 1.3, 320), girder); wall.position.set(sd * 3.45, MY + .9, 0); mg.add(cs(wall)); });
      [-.75, .75].forEach(function (rx) { var rail = new T.Mesh(new T.BoxGeometry(.1, .12, 320), M(0x8E979F, { metalness: .8, roughness: .3 })); rail.position.set(rx - 1.6, MY + .45, 0); mg.add(rail); var r2 = rail.clone(); r2.position.x = rx + 1.6; mg.add(r2); });
      var train = new T.Group(), body = M(0xF1F4F7, { roughness: .35, metalness: .3 }), stripeM = M(0x2673B5, { roughness: .4 }), win = M(0x24323F, { roughness: .1, metalness: .7 });
      for (var c = 0; c < 3; c++) {
        var car = new T.Mesh(new T.BoxGeometry(2.8, 3.0, 19), body); car.position.set(0, 0, c * 19.6); train.add(cs(car));
        var st = new T.Mesh(new T.BoxGeometry(2.84, .3, 19.02), stripeM); st.position.set(0, -.6, c * 19.6); train.add(st);
        var w2 = new T.Mesh(new T.BoxGeometry(2.86, .8, 16), win); w2.position.set(0, .45, c * 19.6); train.add(w2);
      }
      train.position.set(-1.6, MY + 2.05, -120); mg.add(train);
      metro = { g: mg, train: train, z: -120, dir: 1 };
    })();

    /* ---------- vehicles ---------- */
    var TYPES = {
      car: { len: 4.45, w: 1.8, h: 1.42, cols: [0xF1F2F3, 0xF1F2F3, 0xC3C8CD, 0x7D858C, 0xB0302A, 0x2A5A9A, 0x1E2226] },
      hatch: { len: 3.85, w: 1.72, h: 1.46, cols: [0xF1F2F3, 0xC3C8CD, 0xB0302A, 0xD97A2B, 0x2A5A9A, 0x7D858C] },
      suv: { len: 4.7, w: 1.9, h: 1.8, cols: [0xF1F2F3, 0x1E2226, 0x7D858C, 0x3A4B5C] },
      bus: { len: 11.1, w: 2.5, h: 3.15, cols: [0x2673B5, 0xD6453D, 0x2E8B57, 0xE7A93A] },
      auto: { len: 2.7, w: 1.4, h: 1.92, cols: [0xE7C33A, 0x3B8C4A, 0x3B8C4A] },
      bike: { len: 1.9, w: .7, h: 1.95, cols: [0x1E2226, 0xB0302A, 0x2A5A9A, 0xC3C8CD] }
    };
    // vehicle models: extruded side profiles + wheels, arches, lamps, plates, mirrors; merged per role
    // (paint = instance colour, aux = livery / rider, dark = glass, tyres, trim). Built front +z, turned to front +x.
    var GL = 0x1B2732, TY = 0x131619, TR = 0x3A4048, RIM = 0xB4BCC4, LITE = 0xE9EEF2;
    function merge(parts, keep) {
      var pos = [], nor = [], colA = [], c = new T.Color();
      parts.forEach(function (pt) {
        var g = pt[0].index ? pt[0].toNonIndexed() : pt[0], p = g.attributes.position.array, n = g.attributes.normal.array; c.setHex(pt[1] === undefined ? 0xffffff : pt[1]);
        for (var i = 0; i < p.length; i++) { pos.push(p[i]); nor.push(n[i]); }
        for (var j = 0; j < p.length / 3; j++) colA.push(c.r, c.g, c.b);
      });
      var G = new T.BufferGeometry(); G.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); G.setAttribute('normal', new T.Float32BufferAttribute(nor, 3)); G.setAttribute('color', new T.Float32BufferAttribute(colA, 3));
      if (!keep) G.rotateY(Math.PI / 2); return G;
    }
    function prof(pts, depth, bev) { var s = new T.Shape(); pts.forEach(function (p, i) { i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1]); }); var g = new T.ExtrudeGeometry(s, { depth: depth, bevelEnabled: !!bev, bevelThickness: bev || 0, bevelSize: bev || 0, bevelSegments: 2, curveSegments: 3 }); g.translate(0, 0, -depth / 2); g.rotateY(-Math.PI / 2); return g; }
    function bx(w, h, l, x, y, z, rx) { var g = new T.BoxGeometry(w, h, l); if (rx) g.rotateX(rx); return g.translate(x || 0, y || 0, z || 0); }
    function wheelSet(list, r, wd, W, zs, single) {
      zs.forEach(function (zz) { (single ? [0] : [-1, 1]).forEach(function (sd) { var x = single ? 0 : sd * (W / 2 - wd / 2 + .03);
        list.push([new T.CylinderGeometry(r, r, wd, MOB ? 10 : 16).rotateZ(Math.PI / 2).translate(x, r, zz), TY]);
        list.push([new T.CylinderGeometry(r * .56, r * .56, wd + .03, 10).rotateZ(Math.PI / 2).translate(x, r, zz), RIM]);
        list.push([new T.CylinderGeometry(r * .18, r * .18, wd + .06, 6).rotateZ(Math.PI / 2).translate(x, r, zz), TR]); }); });
    }
    function carModel(o) {
      var paint = [[prof(o.low, o.W - .1, .05)], [prof(o.cab, o.cabW, .03)]], dark = [[prof(o.glass, o.glassW, 0), GL]];
      paint.push([bx(o.glassW + .02, o.pillarH || .42, .12, 0, o.pillarY || 1.13, o.pillarZ || -.05)]); // B-pillar
      dark.push([bx(o.W - .04, .18, .12, 0, o.bumpY || .42, o.L / 2 + .02), TR], [bx(o.W - .04, .18, .12, 0, o.bumpY || .42, -o.L / 2 - .02), TR]);
      [-1, 1].forEach(function (sd) { paint.push([bx(.16, .1, .2, sd * (o.W / 2 + .05), o.mirY || 1.0, o.mirZ || .9)]); });
      wheelSet(dark, o.wr, .24, o.W, o.wz);
      var bY = o.bumpY || .42, hz = o.L / 2;
      o.wz.forEach(function (zz) { [-1, 1].forEach(function (sd) { dark.push([new T.TorusGeometry(o.wr + .06, .055, 6, 12, Math.PI).rotateY(Math.PI / 2).translate(sd * (o.W / 2 - .02), o.wr, zz), TR]); }); });
      [-1, 1].forEach(function (sd) {
        dark.push([bx(.36, .13, .1, sd * (o.W / 2 - .3), bY + .3, hz - .03), LITE], [bx(.3, .14, .08, sd * (o.W / 2 - .26), bY + .34, -hz + .02), 0xA3231D]);
        dark.push([bx(.05, .09, o.L * .5, sd * (o.W / 2 - .02), bY - .06, 0), TR], [bx(.04, .04, .16, sd * (o.W / 2 + .01), bY + .48, .35), TR], [bx(.04, .04, .16, sd * (o.W / 2 + .01), bY + .48, -.75), TR]);
      });
      dark.push([bx(o.W * .42, .14, .06, 0, bY + .2, hz), 0x22272C], [bx(.5, .12, .03, 0, bY + .02, hz + .1), LITE], [bx(.5, .12, .03, 0, bY + .02, -hz - .1), LITE]);
      if (o.extra) o.extra(paint, dark);
      return { body: merge(paint), dark: merge(dark) };
    }
    var MODELS = {
      car: carModel({ L: 4.45, W: 1.8, low: [[-2.2, .3], [2.15, .3], [2.25, .55], [2.2, .78], [1.25, .9], [-1.2, .95], [-2.2, .88], [-2.28, .6]], cab: [[-1.2, .9], [1.25, .86], [.55, 1.38], [-.75, 1.4]], glass: [[-1.29, .93], [1.32, .89], [.58, 1.35], [-.79, 1.36]], cabW: 1.5, glassW: 1.6, wr: .34, wz: [1.35, -1.35] }),
      hatch: carModel({ L: 3.85, W: 1.72, low: [[-1.9, .3], [1.85, .3], [1.95, .55], [1.9, .76], [1.0, .88], [-1.85, .92], [-1.93, .6]], cab: [[-1.85, .9], [1.0, .85], [.35, 1.42], [-1.72, 1.44]], glass: [[-1.92, .93], [1.07, .88], [.38, 1.38], [-1.77, 1.4]], cabW: 1.44, glassW: 1.54, wr: .31, wz: [1.2, -1.2], pillarY: 1.15 }),
      suv: carModel({ L: 4.7, W: 1.9, low: [[-2.3, .42], [2.25, .42], [2.35, .7], [2.3, 1.0], [1.4, 1.1], [-2.3, 1.12], [-2.36, .75]], cab: [[-2.25, 1.1], [1.4, 1.06], [.85, 1.75], [-2.15, 1.78]], glass: [[-2.33, 1.14], [1.48, 1.1], [.88, 1.7], [-2.2, 1.72]], cabW: 1.62, glassW: 1.72, wr: .4, wz: [1.45, -1.45], pillarY: 1.4, pillarH: .52, bumpY: .55, mirY: 1.22, mirZ: 1.1,
        extra: function (p, d) { [-.72, .72].forEach(function (x) { d.push([bx(.06, .06, 2.7, x, 1.84, -.4), TR]); }); } }),
      bus: (function () {
        var body = [[prof([[-5.5, .45], [5.4, .45], [5.55, .9], [5.5, 2.9], [5.2, 3.15], [-5.4, 3.15], [-5.55, 2.9], [-5.5, .9]], 2.4, .05)]], livery = [[bx(2.53, .22, 10.9, 0, 1.25, 0)], [bx(2.53, .12, 10.9, 0, 3.0, 0)], [bx(1.6, .5, .06, 0, 2.86, 5.56)]], dark = [];
        dark.push([bx(2.56, .85, 9.4, 0, 2.35, -.35), GL], [bx(2.3, 1.25, .1, 0, 2.15, 5.53), GL], [bx(2.46, .25, .14, 0, .62, 5.55), TR], [bx(2.46, .25, .14, 0, .62, -5.55), TR]);
        dark.push([bx(.06, 1.95, 1.1, 1.26, 1.4, 4.2), GL], [bx(.06, 1.95, 1.1, 1.26, 1.4, -1.0), GL]); // doors on the kerb side
        [-1, 1].forEach(function (sd) { dark.push([bx(.36, .2, .08, sd * .9, .95, 5.56), LITE], [bx(.3, .3, .08, sd * .95, .95, -5.56), 0xA3231D], [bx(.08, .4, .3, sd * 1.32, 2.35, 5.45), TR]); });
        wheelSet(dark, .52, .32, 2.5, [3.6, -3.4]);
        return { body: merge(body), aux: merge(livery), dark: merge(dark) };
      })(),
      auto: (function () {
        var body = [[prof([[-1.3, .3], [1.2, .3], [1.36, .62], [1.2, .98], [-1.3, .98]], 1.26, .04)]], dark = [];
        dark.push([prof([[-1.3, .96], [1.02, .96], [.86, 1.9], [-1.24, 1.92]], 1.3, .03), 0x1E2328], [bx(1.16, .62, .06, 0, 1.42, 1.0, -.2), GL], [bx(.9, .06, .9, 0, 1.0, -.2), TR], [bx(.3, .14, .06, 0, .8, 1.36), LITE]);
        [-1, 1].forEach(function (sd) { dark.push([bx(.08, .5, 1.2, sd * .64, 1.35, -.45), 0x2B3036]); });
        dark.push([new T.CylinderGeometry(.24, .24, .16, 14).rotateZ(Math.PI / 2).translate(0, .24, 1.0), TY]);
        [-.62, .62].forEach(function (x) { dark.push([new T.CylinderGeometry(.24, .24, .16, 14).rotateZ(Math.PI / 2).translate(x, .24, -.85), TY]); });
        // the driver, seen through the open side
        var aux = [[bx(.42, .55, .3, 0, 1.3, .45), 0xF1F2F3], [new T.SphereGeometry(.14, 10, 8).translate(0, 1.72, .45), 0x8E5F43]];
        return { body: merge(body), aux: merge(aux), dark: merge(dark) };
      })(),
      bike: (function () {
        var paint = [[bx(.3, .22, .55, 0, .88, .28)], [new T.SphereGeometry(.17, 12, 10).translate(0, 1.86, -.02)]], rider = [[bx(.42, .62, .3, 0, 1.38, -.08)], [bx(.36, .12, .5, 0, 1.12, .12)]], dark = [];
        [-1, 1].forEach(function (sd) { rider.push([bx(.1, .5, .12, sd * .2, 1.38, .18, -.9)]); });
        dark.push([bx(.12, .32, 1.2, 0, .6, 0), TR], [bx(.72, .05, .05, 0, 1.06, .62), TR], [bx(.28, .12, .5, 0, .95, -.28), 0x24292E], [bx(.16, .5, .16, -.14, .72, .05), 0x2B3036], [bx(.16, .5, .16, .14, .72, .05), 0x2B3036]);
        dark.push([bx(.24, .12, .06, 0, 1.68, .14), GL], [bx(.12, .1, .05, 0, .95, .78), LITE], [bx(.1, .08, .05, 0, .82, -.78), 0xA3231D]);
        wheelSet(dark, .32, .1, 0, [.7, -.7], true);
        return { body: merge(paint), aux: merge(rider), dark: merge(dark) };
      })()
    };
    var paint = new T.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: .28, metalness: .45 });
    var auxMat = new T.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: .6, metalness: .1 });
    var darkMat = new T.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: .16, metalness: .55 });
    var LANES = [
      { axis: 'x', off: 7.5, dir: 1, mix: ['car', 'bus', 'hatch', 'auto', 'suv', 'bike'] }, { axis: 'x', off: 2.5, dir: 1, mix: ['car', 'hatch', 'bike', 'suv', 'auto'] },
      { axis: 'x', off: -2.5, dir: -1, mix: ['hatch', 'auto', 'car', 'bike', 'suv'] }, { axis: 'x', off: -7.5, dir: -1, mix: ['bus', 'car', 'auto', 'hatch', 'bike', 'suv'] },
      { axis: 'z', off: -2, dir: 1, mix: ['car', 'auto', 'bike', 'car', 'bus'] }, { axis: 'z', off: -6, dir: 1, mix: ['car', 'bike', 'hatch', 'auto'] },
      { axis: 'z', off: 2, dir: -1, mix: ['suv', 'car', 'auto', 'bike'] }, { axis: 'z', off: 6, dir: -1, mix: ['bus', 'hatch', 'bike', 'car'] },
      { axis: 'x', off: FLY_Z + 2, dir: 1, fly: true, mix: ['car', 'suv', 'bus', 'hatch'] }, { axis: 'x', off: FLY_Z - 2, dir: -1, fly: true, mix: ['hatch', 'car', 'suv', 'bus'] }
    ];
    // road lanes now run 340 m (vehicles no longer pop in and out inside the aerial frame); the flyover keeps 260 m
    var per = MOB ? 4 : 8, vehicles = [], counts = {};
    LANES.forEach(function (Ln) { Ln.span = Ln.fly ? 260 : 340; });
    LANES.forEach(function (Ln, li) {
      var SPAN = Ln.span, n = Ln.fly ? (MOB ? 2 : 4) : per, gap = SPAN / n;
      for (var k = 0; k < n; k++) {
        var t = Ln.mix[k % Ln.mix.length]; counts[t] = counts[t] || 0;
        vehicles.push({ t: t, lane: Ln, li: li, pos: -SPAN / 2 + k * gap + Math.random() * 6, v: 0, vmax: (Ln.fly ? 15 : 11) * (0.85 + Math.random() * .3), idx: counts[t]++, ci: Math.random() * 9 | 0 });
      }
    });
    var meshes = {}, darks = {}, auxs = {};
    Object.keys(counts).forEach(function (k) {
      var im = new T.InstancedMesh(MODELS[k].body, paint, counts[k]); im.instanceMatrix.setUsage(T.DynamicDrawUsage); im.frustumCulled = false; if (SHADOWS) im.castShadow = true;
      var col = new T.Color();
      vehicles.forEach(function (V) { if (V.t === k) im.setColorAt(V.idx, col.setHex(TYPES[k].cols[V.ci % TYPES[k].cols.length])); });
      im.instanceColor.needsUpdate = true; scene.add(im); meshes[k] = im;
      var dm = new T.InstancedMesh(MODELS[k].dark, darkMat, counts[k]); dm.instanceMatrix.setUsage(T.DynamicDrawUsage); dm.frustumCulled = false; if (SHADOWS) dm.castShadow = true; scene.add(dm); darks[k] = dm;
      if (MODELS[k].aux) { // bus livery stays white; riders and drivers get shirt colours
        var am = new T.InstancedMesh(MODELS[k].aux, auxMat, counts[k]); am.instanceMatrix.setUsage(T.DynamicDrawUsage); am.frustumCulled = false; if (SHADOWS) am.castShadow = true;
        vehicles.forEach(function (V) { if (V.t === k) am.setColorAt(V.idx, col.setHex(k === 'bike' ? [0x2A5A9A, 0xF1F2F3, 0xB0302A, 0x3B8C4A, 0xD97A2B][V.ci % 5] : 0xffffff)); });
        scene.add(am); auxs[k] = am;
      }
    });
    // the flagged vehicle: whichever car is approaching on the north arm when the watchlist station comes up
    var flagged = null, flagCol = new T.Color();
    function pickFlagged() {
      var best = null;
      vehicles.forEach(function (V) { if (V.t === 'car' && V.lane.axis === 'z' && V.lane.dir === 1 && !V.lane.fly && V.pos > -70 && V.pos < -16) { if (!best || V.pos > best.pos) best = V; } });
      return best;
    }
    function carColor(V) { return TYPES[V.t].cols[V.ci % TYPES[V.t].cols.length]; }
    var ring = new T.Mesh(new T.RingGeometry(2.4, 2.9, 40).rotateX(-Math.PI / 2), B(0xD6453D, { transparent: true, opacity: 0 })); scene.add(ring);
    // pedestrians crossing on the zebra of the arm that has red
    var nPed = MOB ? 4 : 10, peds = [], pedCrowd = makeCrowd(nPed);
    for (var pi = 0; pi < nPed; pi++) peds.push({ crossing: pi % 4, t: pi % 2, dir: pi % 2 ? -1 : 1, walking: false, sp: 1.3 + Math.random() * .5, lane: (pi >> 2) % 3, ph: Math.random() * 6 });
    // a crossing is "busy" while anyone is on it: traffic of that road holds at its stop line until it clears
    var crossBusy = [false, false, false, false];

    /* ---------- city fabric: local street grid, blocks and lots, rooftops, parks, parking, street trees, horizon ----------
       Everything here is instanced (one draw call per part) and laid out from a seeded random so it is the same every load.
       Lots never enter the reserved areas: the station cameras, their sight-lines, the command centre and the main-road frontage. */
    blobVeh = new T.InstancedMesh(BLOB_GEO, blobMat(BLOB_RECT, .5), vehicles.length); blobVeh.instanceMatrix.setUsage(T.DynamicDrawUsage); blobVeh.frustumCulled = false; scene.add(blobVeh);
    var parkWalk = [], parkCrowd = null;
    (function cityFabric() {
      var rs = 0x5EED1234 | 0;
      function rnd() { rs = rs + 0x6D2B79F5 | 0; var t = Math.imul(rs ^ rs >>> 15, 1 | rs); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
      function pick(a) { return a[(rnd() * a.length) | 0]; }
      var col = new T.Color(), eF = new T.Euler(), qF = new T.Quaternion();
      var PL = .2, SH = 5.7, EDGE = 260, CELL = 3.6;
      var XS = [-236, -176, 176, 236], ZS = [-232, -172, -112, 112, 172, 232];
      var UB = new T.BoxGeometry(1, 1, 1).translate(0, .5, 0), QUAD = new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);

      /* instanced batches: collect transforms (+ optional colours), build once */
      function Batch(geo, mat, sh) { this.geo = geo; this.mat = mat; this.m = []; this.c = []; this.sh = sh || 0; }
      Batch.prototype.add = function (x, y, z, sx, sy, sz, ry, color, rx) {
        eF.set(rx || 0, ry || 0, 0, 'YXZ'); qF.setFromEuler(eF);
        this.m.push(new T.Matrix4().compose(new T.Vector3(x, y, z), qF, new T.Vector3(sx, sy, sz))); this.c.push(color === undefined ? -1 : color);
      };
      Batch.prototype.build = function () {
        if (!this.m.length) return null;
        var im = new T.InstancedMesh(this.geo, this.mat, this.m.length), any = this.c.some(function (c) { return c >= 0; });
        for (var i = 0; i < this.m.length; i++) { im.setMatrixAt(i, this.m[i]); if (any) im.setColorAt(i, col.setHex(this.c[i] >= 0 ? this.c[i] : 0xffffff)); }
        if (SHADOWS) { if (this.sh & 1) im.castShadow = true; if (this.sh & 2) im.receiveShadow = true; }
        im.frustumCulled = false; scene.add(im); this.m = this.c = null; return im;
      };

      /* materials with world-space UVs (textures keep their real-world scale on any instance size) */
      function worldUV(mat, tile) {
        mat.onBeforeCompile = function (sh) {
          sh.uniforms.cxTile = { value: tile };
          sh.vertexShader = 'varying vec3 vCxW;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\nvec4 cxw = vec4(transformed, 1.0);\n#ifdef USE_INSTANCING\ncxw = instanceMatrix * cxw;\n#endif\nvCxW = (modelMatrix * cxw).xyz;');
          sh.fragmentShader = 'uniform float cxTile;\nvarying vec3 vCxW;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#ifdef USE_MAP\ndiffuseColor *= texture2D( map, vCxW.xz / cxTile );\n#endif');
        };
        mat.customProgramCacheKey = function () { return 'cxwuv'; };
        return mat;
      }
      // facades: windows locked to a 3 m bay and a 3.2 m storey on every instance, a glazed ground floor,
      // a dark band at the first-floor slab, and contact darkening at the foot of each wall
      function facadeMat(tex, glassy) {
        var m = M(0xffffff, { map: tex, roughness: glassy ? .22 : .64, metalness: glassy ? .4 : .06 });
        m.onBeforeCompile = function (sh) {
          sh.vertexShader = 'varying vec2 vCxF;\nvarying float vCxH;\n' + sh.vertexShader.replace('#include <begin_vertex>', [
            '#include <begin_vertex>',
            'vec3 cxS = vec3(1.0);',
            '#ifdef USE_INSTANCING',
            'cxS = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));',
            '#endif',
            'float cxU = abs(normal.x) > .5 ? (position.z + .5) * cxS.z * sign(normal.x) : (position.x + .5) * cxS.x * -sign(normal.z);',
            'vCxH = position.y * cxS.y;',
            'vCxF = vec2(cxU / 12.0, (vCxH - 0.2) / 12.8);'].join('\n'));
          sh.fragmentShader = 'varying vec2 vCxF;\nvarying float vCxH;\n' + sh.fragmentShader.replace('#include <map_fragment>', [
            '#ifdef USE_MAP',
            'vec4 cxT = texture2D( map, vCxF );',
            'float cxG = step(.45, vCxH) * step(vCxH, 3.3);',
            'cxT.rgb = mix(cxT.rgb, vec3(.26, .32, .38), cxG * .6);',
            'cxT.rgb *= 1.0 - step(3.3, vCxH) * step(vCxH, 3.62) * .3;',
            'diffuseColor *= cxT;',
            'diffuseColor.rgb *= mix(.58, 1.0, smoothstep(0.2, 3.0, vCxH));',
            '#endif'].join('\n'));
        };
        m.customProgramCacheKey = function () { return 'cxfac'; };
        return m;
      }
      var FAC = [facade(0, '#F6F4F0'), facade(1, '#F2F3F4'), facade(2, '#F7F4EF'), facade(3, '#F0F3F6')];
      FAC.forEach(function (t) { t.wrapS = t.wrapT = T.RepeatWrapping; t.needsUpdate = true; });
      var sideM = FAC.map(function (t, k) { return facadeMat(t, k === 3); });
      var topM = M(0xD9DDE1, { roughness: .9 });

      var paverT = canvasTex(256, 256, function (x, w, h) {
        x.fillStyle = '#B4AEA4'; x.fillRect(0, 0, w, h);
        for (var r = 0; r < h / 8; r++) for (var c = -1; c < w / 16 + 1; c++) { var v = 184 + Math.random() * 24 | 0, ox = (r % 2) * 8; x.fillStyle = 'rgb(' + v + ',' + (v - 5) + ',' + (v - 13) + ')'; x.fillRect(c * 16 + ox + 1, r * 8 + 1, 14, 6); }
      }, [1, 1]);
      var grassT = canvasTex(256, 256, function (x, w, h) {
        x.fillStyle = '#7FA35A'; x.fillRect(0, 0, w, h);
        for (var i = 0; i < 9000; i++) { var g = 120 + Math.random() * 60 | 0; x.fillStyle = 'rgba(' + (g - 50) + ',' + g + ',' + (g - 70) + ',.35)'; x.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
        x.fillStyle = 'rgba(255,255,255,.05)'; for (var s = 0; s < w; s += 64) x.fillRect(s, 0, 32, h); // mowing stripes
      }, [1, 1]);
      var lAsph = canvasTex(512, 512, function (x, w, h) {
        x.fillStyle = '#676E76'; x.fillRect(0, 0, w, h);
        for (var i = 0; i < 9000; i++) { var v = 80 + Math.random() * 64 | 0; x.fillStyle = 'rgba(' + v + ',' + (v + 4) + ',' + (v + 8) + ',' + (.2 + Math.random() * .35) + ')'; x.fillRect(Math.random() * w, Math.random() * h, 1.3, 1.3); }
        x.strokeStyle = 'rgba(30,33,37,.4)'; x.lineWidth = 1; for (var c = 0; c < 5; c++) { var cx = Math.random() * w, cy = Math.random() * h; x.beginPath(); x.moveTo(cx, cy); for (var s = 0; s < 5; s++) { cx += (Math.random() - .5) * 26; cy += (Math.random() - .5) * 26; x.lineTo(cx, cy); } x.stroke(); }
      }, [1, 1]);
      var roofT = canvasTex(256, 256, function (x, w, h) {
        x.fillStyle = '#E4E4E1'; x.fillRect(0, 0, w, h);
        for (var i = 0; i < 2600; i++) { x.fillStyle = 'rgba(0,0,0,' + Math.random() * .06 + ')'; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
        x.strokeStyle = 'rgba(0,0,0,.13)'; x.lineWidth = 1; for (var g = 0; g <= w; g += 32) { x.beginPath(); x.moveTo(g, 0); x.lineTo(g, h); x.stroke(); x.beginPath(); x.moveTo(0, g); x.lineTo(w, g); x.stroke(); }
        for (var st = 0; st < 3; st++) { var gr = x.createRadialGradient(0, 0, 2, 0, 0, 40); gr.addColorStop(0, 'rgba(60,60,55,.12)'); gr.addColorStop(1, 'rgba(60,60,55,0)'); x.save(); x.translate(Math.random() * w, Math.random() * h); x.fillStyle = gr; x.fillRect(-40, -40, 80, 80); x.restore(); }
      }, [1, 1]);
      var plinthM = worldUV(M(0xffffff, { map: paverT, roughness: .9 }), 6);
      var grassM = decal(worldUV(M(0xffffff, { map: grassT, roughness: 1 }), 8), 1);
      var parkAsM = decal(worldUV(M(0xffffff, { map: lAsph, roughness: .92 }), 18), 1);
      var streetM = worldUV(M(0xffffff, { map: lAsph, roughness: .92 }), 24);
      var membM = worldUV(M(0xffffff, { map: roofT, roughness: .86 }), 6);

      /* batches */
      var bodies = sideM.map(function (sm) { return new Batch(UB, [sm, sm, topM, topM, sm, sm], 3); });
      var plinth = new Batch(UB, plinthM, 2), streets = new Batch(QUAD, streetM, 2);
      var par = new Batch(UB, M(0xffffff, { roughness: .85 }), 3), memb = new Batch(UB, membM, 2), stair = new Batch(UB, M(0xffffff, { roughness: .8 }), 3);
      var door = new Batch(UB, M(0x3A4148, { roughness: .6 }), 0);
      var tank = new Batch(new T.CylinderGeometry(1, 1, 1, MOB ? 10 : 16).translate(0, .5, 0), M(0xffffff, { roughness: .5 }), 3), tankPad = new Batch(UB, M(0xA9B0B7, { roughness: .8 }), 3);
      var acFan = canvasTex(64, 64, function (x, w, h) { x.fillStyle = '#E8EBEE'; x.fillRect(0, 0, w, h); x.fillStyle = '#3B4249'; x.beginPath(); x.arc(32, 32, 24, 0, 7); x.fill(); x.strokeStyle = '#AEB6BE'; x.lineWidth = 2; for (var r = 8; r < 24; r += 5) { x.beginPath(); x.arc(32, 32, r, 0, 7); x.stroke(); } x.beginPath(); x.moveTo(8, 32); x.lineTo(56, 32); x.moveTo(32, 8); x.lineTo(32, 56); x.stroke(); });
      var acSideM = M(0xE2E5E8, { roughness: .6 }), acTopM = M(0xffffff, { map: acFan, roughness: .5 });
      var acu = new Batch(new T.BoxGeometry(1, 1, 1).translate(0, .5, 0), [acSideM, acSideM, acTopM, acSideM, acSideM, acSideM], 1);
      var panT = canvasTex(64, 96, function (x, w, h) { x.fillStyle = '#1B3354'; x.fillRect(0, 0, w, h); x.strokeStyle = '#7F9CC0'; x.lineWidth = 1; for (var i = 0; i <= w; i += 10.6) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } for (var j = 0; j <= h; j += 10.6) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); } x.strokeStyle = '#C6CDD4'; x.lineWidth = 3; x.strokeRect(1, 1, w - 2, h - 2); });
      var panEdge = M(0xC6CDD4, { metalness: .6, roughness: .35 }), panTop = M(0xffffff, { map: panT, roughness: .18, metalness: .55 });
      var panel = new Batch(new T.BoxGeometry(1, 1, 1), [panEdge, panEdge, panTop, panEdge, panEdge, panEdge], 1), leg = new Batch(UB, M(0x9AA4AE, { metalness: .6, roughness: .4 }), 0);
      var planter = new Batch(UB, M(0x9A6A4A, { roughness: .9 }), 3), shrub = new Batch(new T.IcosahedronGeometry(1, 0), M(0xffffff, { roughness: .9, flatShading: true }), 1);
      var dishGeo = merge([[new T.CylinderGeometry(.05, .06, 1.1, 8).translate(0, .55, 0), 0x9AA4AE], [new T.SphereGeometry(.55, 16, 8, 0, Math.PI * 2, 0, .75).scale(1, .55, 1).rotateX(-1.0).translate(0, 1.25, .12), 0xEEF0F2], [new T.CylinderGeometry(.02, .02, .55, 6).rotateX(-1.0 + Math.PI / 2).translate(0, 1.34, .38), 0x7D858C]], true);
      var dish = new Batch(dishGeo, new T.MeshStandardMaterial({ vertexColors: true, roughness: .45, metalness: .3 }), 1);
      var crownGeo = merge([[new T.IcosahedronGeometry(1.25, 1)], [new T.IcosahedronGeometry(1.0, 1).translate(.95, .25, .2)], [new T.IcosahedronGeometry(.95, 1).translate(-.75, .35, -.55)], [new T.IcosahedronGeometry(.9, 1).translate(.1, .85, .65)], [new T.IcosahedronGeometry(.8, 1).translate(-.3, -.2, .9)]], true);
      var trunk = new Batch(new T.CylinderGeometry(.13, .2, 1, 7).translate(0, .5, 0), M(0x6B5340, { roughness: .9 }), 1), crown = new Batch(crownGeo, M(0xffffff, { roughness: .9, flatShading: true }), 1);
      var hedge = new Batch(UB, M(0x4F7A3A, { roughness: .95, flatShading: true }), 3), pathB = new Batch(QUAD, decal(M(0xD8CCB2, { roughness: .95 }), 2), 2);
      var benchGeo = merge([[new T.BoxGeometry(1.8, .07, .5).translate(0, .45, 0), 0x8A6A4C], [new T.BoxGeometry(1.8, .4, .06).translate(0, .7, -.24), 0x8A6A4C], [new T.BoxGeometry(.08, .45, .45).translate(-.8, .22, 0), 0x3B4249], [new T.BoxGeometry(.08, .45, .45).translate(.8, .22, 0), 0x3B4249]], true);
      var bench = new Batch(benchGeo, new T.MeshStandardMaterial({ vertexColors: true, roughness: .7 }), 1);
      var basin = new Batch(new T.CylinderGeometry(1, 1.05, 1, 28).translate(0, .5, 0), M(0xCDD2D7, { roughness: .8 }), 3), water = new Batch(new T.CircleGeometry(1, 28).rotateX(-Math.PI / 2), decal(M(0x7FB4DC, { roughness: .08, metalness: .25 }), 2), 2);
      var parkAs = new Batch(QUAD, parkAsM, 2), grass = new Batch(QUAD, grassM, 2);
      var bayLine = new Batch(QUAD, decal(B(0xEEF1F4), 3), 0), lmark = new Batch(QUAD, decal(B(0xF4F6F8), 3), 0);
      var mhole = new Batch(new T.CircleGeometry(.62, 20).rotateX(-Math.PI / 2), decal(M(0x41474E, { roughness: .5, metalness: .6 }), 3), 2);
      var skirt = new Batch(BLOB_GEO, blobMat(BLOB_TIGHT, .42), 0), tblob = new Batch(BLOB_GEO, blobMat(BLOB_ROUND, .36), 0), cblob = new Batch(BLOB_GEO, blobMat(BLOB_RECT, .5), 0);
      var pk = {}; ['car', 'hatch', 'suv'].forEach(function (k) { pk[k] = { body: new Batch(MODELS[k].body, paint, 1), dark: new Batch(MODELS[k].dark, darkMat, 1) }; });

      function tree(x, gy, z, s, c) {
        var th = 2.2 * s; trunk.add(x, gy, z, s, th, s, 0);
        crown.add(x, gy + th + 1.0 * s, z, s, s * .92, s, rnd() * 6.3, c || pick([0x5C8A45, 0x4E7A3B, 0x6A9450, 0x557F3F, 0x76A055]));
        tblob.add(x, gy + .006, z, 4.6 * s, 1, 4.6 * s, 0);
      }
      function parked(t, x, y, z, ry) {
        var c = pick(TYPES[t].cols); pk[t].body.add(x, y, z, 1, 1, 1, ry, c); pk[t].dark.add(x, y, z, 1, 1, 1, ry);
        cblob.add(x, y + .006, z, TYPES[t].len + .6, 1, TYPES[t].w + .5, ry);
      }

      /* reserved areas */
      var NONE = [], LOW = [];
      function R(L, x0, x1, z0, z1) { L.push([x0, x1, z0, z1]); }
      function hit(L, x0, x1, z0, z1) { for (var i = 0; i < L.length; i++) { var r = L[i]; if (x0 < r[1] && x1 > r[0] && z0 < r[3] && z1 > r[2]) return true; } return false; }
      BLD.forEach(function (b) { R(NONE, b[0] - b[2] / 2 - 3, b[0] + b[2] / 2 + 3, b[1] - b[3] / 2 - 3, b[1] + b[3] / 2 + 3); });
      R(NONE, 30, 80, -80, -24);      // command centre, its forecourt and the wall camera
      R(NONE, -106, 106, 12, 27);     // shophouse frontage south of the main road
      R(NONE, -23, 23, 12, 97);       // shophouses along the cross road
      R(NONE, -184, 184, -33, -12);   // under and beside the flyover and its ramps
      R(NONE, -116, -84, -42, -24);   // the flat title of the map station
      R(NONE, -50, -22, -70, -36);    // watchlist camera (desktop and phone)
      R(NONE, -21, -3, -49, -33);     // watchlist title board
      R(NONE, -56, -26, 26, 60);      // camera-health camera
      R(NONE, -41, -23, 13, 31);      // camera-health title board
      R(LOW, -52, -4, -78, -24);      // watchlist foreground: parking only, nothing tall
      R(LOW, -70, -4, 6, 70);         // sight-line from the camera-health camera to the corner pole
      R(LOW, 6, 30, -66, -24);        // the camera's arc from the wall to the junction

      /* street grid: local streets 11.4 m (two 3.5 m lanes + two 2.2 m parking lanes), blocks between them */
      function intervals(st, art) {
        var cuts = st.map(function (s) { return [s - SH, s + SH]; }).concat([[-art, art]]).sort(function (a, b) { return a[0] - b[0]; }), out = [], cur = -EDGE;
        cuts.forEach(function (c) { if (c[0] > cur) out.push([cur, c[0]]); cur = Math.max(cur, c[1]); }); if (cur < EDGE) out.push([cur, EDGE]); return out;
      }
      var ART_X = ROAD_NS_HALF + 4, ART_Z = ROAD_EW_HALF + 4;
      var XI = intervals(XS, ART_X), ZI = intervals(ZS, ART_Z);
      // horizontal streets (constant z) stop at the cross-road footpath; vertical ones (constant x) at the main-road footpath
      var hSeg = [], vSeg = [];
      ZS.forEach(function (Z) { hSeg.push([Z, -EDGE, -ART_X], [Z, ART_X, EDGE]); });
      XS.forEach(function (X) { vSeg.push([X, -EDGE, -ART_Z], [X, ART_Z, EDGE]); });
      hSeg.forEach(function (S) { streets.add((S[1] + S[2]) / 2, ROADY, S[0], S[2] - S[1], 1, SH * 2, 0); });
      vSeg.forEach(function (S) { streets.add(S[0], ROADY, (S[1] + S[2]) / 2, SH * 2, 1, S[2] - S[1], 0); });
      // markings: dashed centre line, parking-lane lines, stop lines and zebras at every crossing, manholes
      function bar(x, z, sx, sz) { lmark.add(x, .046, z, sx, 1, sz, 0); }
      function freeSpans(a, b, cross, pad) {
        var out = [], cur = a; cross.filter(function (c) { return c > a && c < b; }).sort(function (p, q) { return p - q; }).forEach(function (c) { if (c - pad > cur) out.push([cur, c - pad]); cur = c + pad; });
        if (b > cur) out.push([cur, b]); return out;
      }
      function streetMarks(S, horiz, cross) {
        var C = S[0], spans = freeSpans(S[1] + 1.5, S[2] - 1.5, cross, SH + 4.6);
        spans.forEach(function (sp) {
          for (var t = sp[0] + 1.5; t + 3 <= sp[1] - 1; t += 6) horiz ? bar(t + 1.5, C, 3, .14) : bar(C, t + 1.5, .14, 3);
          [-1, 1].forEach(function (sd) { var o = C + sd * (SH - 2.2), m = (sp[0] + sp[1]) / 2, L = sp[1] - sp[0]; horiz ? bar(m, o, L, .1) : bar(o, m, .1, L); });
          for (var mh = sp[0] + 18; mh < sp[1] - 10; mh += 46) mhole.add(horiz ? mh : C + 1.6, .044, horiz ? C - 1.6 : mh, 1, 1, 1, 0);
        });
        cross.forEach(function (c) {
          if (c < S[1] || c > S[2]) return;
          [-1, 1].forEach(function (arm) {
            // zebra across this arm, then the stop line for the traffic approaching on its kerb side (right-hand running, as on the main roads)
            var z0 = c + arm * (SH + 2.1);
            for (var q = -SH + .8; q <= SH - .8; q += 1.1) horiz ? bar(z0, C + q, 3, .55) : bar(C + q, z0, .55, 3);
            var sl = c + arm * (SH + 4.4), side = horiz ? (arm < 0 ? 1 : -1) : (arm < 0 ? -1 : 1), lo = C + side * .15, hi = C + side * (SH - 2.3), mid = (lo + hi) / 2, wd = Math.abs(hi - lo);
            horiz ? bar(sl, mid, .45, wd) : bar(mid, sl, wd, .45);
          });
        });
        // give-way line where the street meets the main-road footpath (traffic heading towards the main road)
        var endAtLo = Math.abs(S[1]) < 20, endPos = endAtLo ? S[1] + 3.2 : S[2] - 3.2, sd2 = horiz ? (endAtLo ? -1 : 1) : (endAtLo ? 1 : -1);
        for (var g = .4; g < SH - 2.5; g += 1.0) horiz ? bar(endPos, C + sd2 * (g + .3), .3, .6) : bar(C + sd2 * (g + .3), endPos, .6, .3);
      }
      hSeg.forEach(function (S) { streetMarks(S, true, XS); });
      vSeg.forEach(function (S) { streetMarks(S, false, ZS); });
      // kerbside parking (cars face the way traffic runs on that side) and street trees on the footways
      function kerbCars(S, horiz, cross) {
        var C = S[0];
        [-1, 1].forEach(function (sd) {
          var off = C + sd * (SH - 1.15), ry = horiz ? (sd > 0 ? 0 : Math.PI) : (sd > 0 ? Math.PI / 2 : -Math.PI / 2);
          for (var t = S[1] + 12; t < S[2] - 12; t += 6.2) {
            if (cross.some(function (c) { return Math.abs(t - c) < SH + 10; })) continue;
            if (rnd() > (MOB ? .3 : .55)) continue;
            var x = horiz ? t : off, z = horiz ? off : t;
            if (hit(NONE, x - 3, x + 3, z - 3, z + 3)) continue;
            parked(pick(['car', 'car', 'hatch', 'hatch', 'suv']), x, ROADY, z, ry);
          }
        });
      }
      hSeg.forEach(function (S) { kerbCars(S, true, XS); });
      vSeg.forEach(function (S) { kerbCars(S, false, ZS); });

      /* blocks -> lots */
      var lots = [], shopRoofList = SHOPROOFS || [];
      function split(x0, x1, z0, z1, dep) {
        var w = x1 - x0, d = z1 - z0, mx = MOB ? 46 : 34;
        if ((w > mx || d > mx) && dep < 9) {
          if (w >= d) { var c = x0 + w * (.38 + rnd() * .24); split(x0, c, z0, z1, dep + 1); split(c, x1, z0, z1, dep + 1); }
          else { var c2 = z0 + d * (.38 + rnd() * .24); split(x0, x1, z0, c2, dep + 1); split(x0, x1, c2, z1, dep + 1); }
        } else lots.push([x0, x1, z0, z1]);
      }
      XI.forEach(function (I) {
        ZI.forEach(function (J) {
          plinth.add((I[0] + I[1]) / 2, 0, (J[0] + J[1]) / 2, I[1] - I[0], PL, J[1] - J[0], 0);
          // footway: 2.5 m along local streets, 5 m along the main roads
          function ins(v, out) { return Math.abs(Math.abs(v) - ART_X) < .01 || Math.abs(Math.abs(v) - ART_Z) < .01 ? 5 : (Math.abs(v) >= EDGE - .01 ? 1 : 2.5); }
          var x0 = I[0] + ins(I[0]), x1 = I[1] - ins(I[1]), z0 = J[0] + ins(J[0]), z1 = J[1] - ins(J[1]);
          if (x1 - x0 > 8 && z1 - z0 > 8) split(x0, x1, z0, z1, 0);
          // street trees on footways that face a local street
          var TS = MOB ? 22 : 11;
          [[I[0], 1, 'x'], [I[1], -1, 'x'], [J[0], 1, 'z'], [J[1], -1, 'z']].forEach(function (E) {
            var v = E[0]; if (Math.abs(Math.abs(v) - ART_X) < .01 || Math.abs(Math.abs(v) - ART_Z) < .01 || Math.abs(v) >= EDGE - .01) return;
            var p = v + E[1] * 1.25, a = E[2] === 'x' ? J[0] : I[0], b = E[2] === 'x' ? J[1] : I[1];
            for (var t = a + 9; t < b - 9; t += TS) {
              var x = E[2] === 'x' ? p : t, z = E[2] === 'x' ? t : p;
              if (hit(NONE, x - 2, x + 2, z - 2, z + 2) || hit(LOW, x - 2, x + 2, z - 2, z + 2)) continue;
              tree(x, PL, z, .75 + rnd() * .3);
            }
          });
        });
      });

      /* rooftops: parapet, coloured membrane, stair head with tanks on it, then a mix of tanks, AC condensers,
         solar arrays on frames, terrace gardens and dish antennas on a 3.6 m grid so nothing overlaps */
      var ROOFC = [0xC9CDD0, 0xC9CDD0, 0xB7765E, 0xEEF0F1, 0xEEF0F1, 0x9AA2A8, 0xC8B79A, 0xA9BCC9, 0xD7C6A3, 0xB98A6E];
      function rooftop(x, z, w, d, h, tint, opt) {
        opt = opt || {};
        var pc = col.setHex(tint).multiplyScalar(.9).getHex(), garden = !opt.noGarden && rnd() < .14;
        par.add(x, h, z - d / 2 + .11, w, .95, .22, 0, pc); par.add(x, h, z + d / 2 - .11, w, .95, .22, 0, pc);
        par.add(x - w / 2 + .11, h, z, .22, .95, d - .44, 0, pc); par.add(x + w / 2 - .11, h, z, .22, .95, d - .44, 0, pc);
        memb.add(x, h, z, w - .7, .04, d - .7, 0, garden ? 0x86A363 : pick(ROOFC));
        var nx = Math.floor((w - 1.4) / CELL), nz = Math.floor((d - 1.4) / CELL), cells = [];
        for (var i = 0; i < nx; i++) for (var j = 0; j < nz; j++) cells.push([x - nx * CELL / 2 + (i + .5) * CELL, z - nz * CELL / 2 + (j + .5) * CELL, i, j]);
        for (var s = cells.length - 1; s > 0; s--) { var r = (rnd() * (s + 1)) | 0, tmp = cells[s]; cells[s] = cells[r]; cells[r] = tmp; }
        if (!cells.length) return;
        var y0 = h + .04, tcol = function () { return pick([0x1E2328, 0x1E2328, 0x2B3540, 0xE8EAEC]); };
        var c0 = cells[0]; stair.add(c0[0], h, c0[1], 3.0, 2.8, 2.6, 0, tint); door.add(c0[0] + .5, y0, c0[1] - 1.33, .9, 2.1, .06, 0);
        var nt = rnd() < .5 ? 2 : 1; for (var tk = 0; tk < nt; tk++) tank.add(c0[0] + (nt === 2 ? (tk ? .72 : -.72) : 0), h + 2.8, c0[1], .58, 1.15, .58, 0, tcol());
        var k0 = 1;
        if (opt.big && cells.length > 2) { var c1 = cells[1]; stair.add(c1[0], h, c1[1], 3.0, 2.4, 3.0, 0, tint); k0 = 2; }
        var solar = !garden && !MOB && rnd() < .32 && cells.length >= 5, nSol = solar ? Math.floor((cells.length - k0) * .45) : 0, ndish = 0;
        for (var k = k0; k < cells.length; k++) {
          var C = cells[k], cx = C[0], cz = C[1], r2 = rnd();
          if (garden && r2 < .7) {
            planter.add(cx, y0, cz, 2.4, .5, 1.0, 0); for (var sh = 0; sh < 3; sh++) shrub.add(cx - .8 + sh * .8, y0 + .75, cz, .42, .36, .42, rnd() * 6, pick([0x5E8F45, 0x6FA050, 0x4E7A3B, 0x86A85A]));
            if (r2 < .18) tree(cx, y0, cz + .9, .4, 0x5C8A45);
            continue;
          }
          if (nSol > 0) { nSol--; for (var a = -1; a <= 1; a += 2) for (var b2 = -1; b2 <= 1; b2 += 2) { var px = cx + a * .85, pz = cz + b2 * .82; panel.add(px, y0 + .5, pz, 1.6, .05, 1.0, 0, undefined, .35); leg.add(px, y0, pz + .44, .06, .32, .06, 0); leg.add(px, y0, pz - .44, .06, .67, .06, 0); } continue; }
          if (r2 < .3 && !MOB) { for (var ai = 0; ai < 2; ai++) for (var aj = 0; aj < 3; aj++) acu.add(cx - .6 + ai * 1.2, y0, cz - 1.15 + aj * 1.15, .9, .62, .8, 0); continue; }
          if (r2 < .48) { tankPad.add(cx, y0, cz, 3.0, .3, 1.5, 0); tank.add(cx - .72, y0 + .3, cz, .6, 1.2, .6, 0, tcol()); if (rnd() < .6) tank.add(cx + .72, y0 + .3, cz, .6, 1.2, .6, 0, tcol()); continue; }
          if (r2 < .58 && ndish < 2 && !MOB) { ndish++; dish.add(cx, y0, cz, 1, 1, 1, rnd() * 6.3); continue; }
          if (r2 < .66 && !MOB) { acu.add(cx, y0, cz, .9, .62, .8, 0); acu.add(cx + 1.1, y0, cz, .9, .62, .8, 0); }
        }
      }
      // the original street-front blocks and the command centre get the same roof treatment (membranes + dishes only, their kit is already there)
      BLD.forEach(function (b) {
        memb.add(b[0], b[4], b[1], b[2] - .75, .04, b[3] - .75, 0, pick(ROOFC));
        if (!MOB) dish.add(b[0] + b[2] / 2 - 1.3, b[4] + .04, b[1] + (b[1] < 0 ? -1 : 1) * (b[3] / 2 - 1.3), 1, 1, 1, rnd() * 6.3); // far corner, clear of the hoardings
        skirt.add(b[0], PL + .006, b[1], b[2] + 3.6, 1, b[3] + 3.6, 0);
      });
      (function ccRoof() {
        var y = 32.6, x = CC.x, z = CC.z;
        memb.add(x, y, z, 33.6, .04, 25.6, 0, 0xEEF0F1);
        [[-11, -7], [-11, -3], [-7, -7], [-7, -3]].forEach(function (p) { acu.add(x + p[0], y + .04, z + p[1], 1.6, 1.1, 1.4, 0); });
        [[9, -6, .4], [12, -6, 1.6], [12, -2, 2.4]].forEach(function (p) { dish.add(x + p[0], y + .04, z + p[1], 1.6, 1.6, 1.6, p[2]); });
        stair.add(x - 2, y, z + 7, 4, 3, 3.4, 0, 0xE9EDF1); tank.add(x - 3, y + 3, z + 7, .7, 1.2, .7, 0, 0x1E2328); tank.add(x - 1, y + 3, z + 7, .7, 1.2, .7, 0, 0x1E2328);
        var mast = new T.Mesh(new T.CylinderGeometry(.08, .12, 7, 8).translate(0, 3.5, 0), M(0xB4BDC6, { metalness: .7, roughness: .4 })); mast.position.set(x + 14, y, z + 8); scene.add(cs(mast));
        skirt.add(x, PL + .006, z, 37.5, 1, 29.5, 0);
      })();
      shopRoofList.forEach(function (S) { rooftop(S[0], S[1], S[2], S[3], S[4], 0xE3DDD2, { noGarden: true }); skirt.add(S[0], PL + .006, S[1], S[2] + 2.6, 1, S[3] + 2.6, 0); });

      /* lots */
      var WALL = [0xF3EEE4, 0xEDE3D0, 0xF1E4C8, 0xE8D8C6, 0xF0DDD0, 0xE3E7EA, 0xDCE5EA, 0xE6ECE3, 0xF5F3EE, 0xE9DCCB, 0xF2E9DA, 0xDDE3E8];
      var GLASS = [0xE8EEF4, 0xDDE6EE, 0xEEF2F6, 0xE2E8EC];
      function building(x, z, w, d, storeys, style) {
        var h = storeys * 3.2 + .2, tint = style === 3 ? pick(GLASS) : pick(WALL);
        bodies[style].add(x, 0, z, w, h, d, 0, tint);
        skirt.add(x, PL + .006, z, w + 3.2, 1, d + 3.2, 0);
        rooftop(x, z, w, d, h, tint, { big: storeys >= 9 });
      }
      function snap3(v) { return Math.floor(v / 3) * 3; }
      lots.forEach(function (L) { placeLot(L, 0); });
      function placeLot(L, dep) {
        var x0 = L[0], x1 = L[1], z0 = L[2], z1 = L[3], w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
        // a lot that touches a reserved area is halved until the free parts can be used (no empty plazas round the junction)
        if (hit(NONE, x0, x1, z0, z1)) {
          if ((w > 16 || d > 16) && dep < 5) { if (w >= d) { placeLot([x0, cx, z0, z1], dep + 1); placeLot([cx, x1, z0, z1], dep + 1); } else { placeLot([x0, x1, z0, cz], dep + 1); placeLot([x0, x1, cz, z1], dep + 1); } }
          return;
        }
        var low = hit(LOW, x0, x1, z0, z1), r = rnd(), type;
        if (low) type = (w >= 12 && d >= 12) ? 'parking' : 'plaza';
        else if (w < 11 || d < 11) type = 'plaza';
        else if (r < .1) type = 'park';
        else if (r < .22) type = 'parking';
        else if (r < .33 && w >= 27 && d >= 27) type = 'court';
        else type = 'bld';
        if (type === 'bld') {
          var set = 1.5 + rnd() * 1.5, bw = snap3(w - set * 2), bd = snap3(d - set * 2);
          if (bw < 9 || bd < 9) { type = 'plaza'; }
          else {
            var rr = rnd(), st = rr < .62 ? 3 + Math.floor(rnd() * 5) : rr < .9 ? 8 + Math.floor(rnd() * 5) : (bw >= 15 && bd >= 15 ? 13 + Math.floor(rnd() * 9) : 9);
            if (MOB) st = Math.min(st, 12);
            var sty = st >= 13 ? (rnd() < .6 ? 3 : 1) : pick([0, 0, 2, 2, 2, 1, 0, 2]);
            building(cx, cz, bw, bd, st, sty);
            // service yard / car spaces in the setback
            if (!MOB && set > 2.2 && rnd() < .5) parked(pick(['car', 'hatch']), cx - bw / 2 + 3, PL, cz + bd / 2 + set / 2 + .1, 0);
            return;
          }
        }
        if (type === 'court') {
          var ow = snap3(w - 3), od = snap3(d - 3), bd2 = 9, st2 = 4 + Math.floor(rnd() * 4), sty2 = pick([0, 2, 2]);
          var h2 = st2 * 3.2 + .2, tint2 = pick(WALL);
          [[cx, cz - od / 2 + bd2 / 2, ow, bd2], [cx, cz + od / 2 - bd2 / 2, ow, bd2], [cx - ow / 2 + bd2 / 2, cz, bd2, od - bd2 * 2], [cx + ow / 2 - bd2 / 2, cz, bd2, od - bd2 * 2]].forEach(function (Bk) {
            bodies[sty2].add(Bk[0], 0, Bk[1], Bk[2], h2, Bk[3], 0, tint2); rooftop(Bk[0], Bk[1], Bk[2], Bk[3], h2, tint2, { noGarden: true });
          });
          skirt.add(cx, PL + .006, cz, ow + 3, 1, od + 3, 0);
          var iw = ow - bd2 * 2, idp = od - bd2 * 2;
          paths(cx, cz, iw - .4, idp - .4, false);
          tree(cx - iw * .2, PL + .012, cz, .6); tree(cx + iw * .2, PL + .012, cz + idp * .15, .55);
          bench.add(cx, PL + .012, cz - idp * .3, 1, 1, 1, 0);
          return;
        }
        if (type === 'park') {
          var gw = w - 1.2, gd = d - 1.2; paths(cx, cz, gw, gd, true);
          // hedge round the edge with gaps where the paths come out
          [[cz - gd / 2 + .3, 'x'], [cz + gd / 2 - .3, 'x'], [cx - gw / 2 + .3, 'z'], [cx + gw / 2 - .3, 'z']].forEach(function (Hd) {
            var len = (Hd[1] === 'x' ? gw : gd) / 2 - 1.8, c0 = Hd[1] === 'x' ? cx : cz;
            [-1, 1].forEach(function (sd) { var m = c0 + sd * (1.8 + len / 2); Hd[1] === 'x' ? hedge.add(m, PL, Hd[0], len, .85, .6, 0) : hedge.add(Hd[0], PL, m, .6, .85, len, 0); });
          });
          var fount = gw >= 22 && gd >= 22;
          if (fount) { basin.add(cx, PL, cz, 2.6, .55, 2.6, 0); water.add(cx, PL + .56, cz, 2.3, 1, 2.3, 0); }
          for (var tx = cx - gw / 2 + 3; tx <= cx + gw / 2 - 3; tx += MOB ? 9 : 5.5) for (var tz = cz - gd / 2 + 3; tz <= cz + gd / 2 - 3; tz += MOB ? 9 : 5.5) {
            var jx = tx + (rnd() - .5) * 2, jz = tz + (rnd() - .5) * 2;
            if (Math.abs(jx - cx) < 2.8 || Math.abs(jz - cz) < 2.8 || rnd() < .25) continue;
            tree(jx, PL + .012, jz, .7 + rnd() * .45);
          }
          [[cx + 3.5, cz + 1.9, Math.PI], [cx - 5, cz - 1.9, 0], [cx + 1.9, cz - 5, -Math.PI / 2], [cx - 1.9, cz + 4.5, Math.PI / 2]].forEach(function (Bn) { if (Math.abs(Bn[0] - cx) < gw / 2 - 2 && Math.abs(Bn[1] - cz) < gd / 2 - 2) bench.add(Bn[0], PL + .012, Bn[1], 1, 1, 1, Bn[2]); });
          // people strolling on the paths (they stop short of the fountain)
          var stop = fount ? 3.2 : .6;
          parkWalk.push({ a: [cx - gw / 2 + 1, cz + .5], b: [cx - stop, cz + .5] }, { a: [cx + stop, cz - .5], b: [cx + gw / 2 - 1, cz - .5] }, { a: [cx - .5, cz - gd / 2 + 1], b: [cx - .5, cz - stop] });
          return;
        }
        if (type === 'parking') {
          var aw = w - 1.2, ad = d - 1.2, alongX = aw >= ad, LA = alongX ? aw : ad, LS = alongX ? ad : aw;
          parkAs.add(cx, PL + .01, cz, aw, 1, ad, 0);
          var mods = Math.floor((LS - 1) / 16), rows = [];
          var s0 = -LS / 2 + .5;
          if (mods === 0 && LS >= 11.5) rows.push([s0 + 2.5, -1]);
          for (var mi = 0; mi < mods; mi++) { rows.push([s0 + mi * 16 + 2.5, -1], [s0 + mi * 16 + 13.5, 1]); }
          rows.forEach(function (Rw) {
            for (var a2 = -LA / 2 + 3; a2 + 2.5 <= LA / 2 - 3; a2 += 2.5) {
              var ac = a2 + 1.25, lx = alongX ? cx + a2 : cx + Rw[0], lz = alongX ? cz + Rw[0] : cz + a2;
              bayLine.add(alongX ? lx : lx, PL + .02, alongX ? lz : lz, alongX ? .1 : 5, 1, alongX ? 5 : .1, 0);
              if (rnd() < (MOB ? .45 : .72)) {
                var t = pick(['car', 'car', 'hatch', 'hatch', 'suv']), px2 = alongX ? cx + ac : cx + Rw[0], pz2 = alongX ? cz + Rw[0] : cz + ac;
                // nose-in: the car points away from the aisle
                var ry2 = alongX ? (Rw[1] < 0 ? Math.PI / 2 : -Math.PI / 2) : (Rw[1] < 0 ? Math.PI : 0);
                parked(t, px2 + (rnd() - .5) * .15, PL + .012, pz2 + (rnd() - .5) * .15, ry2 + (rnd() - .5) * .04);
              }
            }
            var lastA = -LA / 2 + 3 + Math.floor((LA - 6) / 2.5) * 2.5;
            bayLine.add(alongX ? cx + lastA : cx + Rw[0], PL + .02, alongX ? cz + Rw[0] : cz + lastA, alongX ? .1 : 5, 1, alongX ? 5 : .1, 0);
          });
          if (!low) { tree(cx - aw / 2 + 1.6, PL + .012, cz - ad / 2 + 1.6, .6); tree(cx + aw / 2 - 1.6, PL + .012, cz + ad / 2 - 1.6, .6); }
          return;
        }
        // plaza: paved, a few planters and benches (kept low for the camera sight-lines)
        if (w > 5 && d > 5) {
          planter.add(cx, PL, cz, Math.min(3, w - 2), .55, Math.min(1.4, d - 2), 0);
          shrub.add(cx, PL + .85, cz, .5, .4, .5, 0, 0x5E8F45);
          if (w > 8) bench.add(cx, PL, cz + Math.min(2.2, d / 2 - 1), 1, 1, 1, 0);
          if (!low && w > 9 && d > 9) { tree(cx - w / 2 + 2.2, PL, cz - d / 2 + 2.2, .7); tree(cx + w / 2 - 2.2, PL, cz + d / 2 - 2.2, .65); }
        }
      }
      // parking under the flyover deck (as in most Indian cities): two parallel rows either side of the pier line,
      // kept clear of the cross road and of the wall camera in front of the command centre
      [[-96, -15], [15, 28], [82, 96]].forEach(function (Sg) {
        parkAs.add((Sg[0] + Sg[1]) / 2, PL + .01, FLY_Z, Sg[1] - Sg[0], 1, 11, 0);
        [-1, 1].forEach(function (sd) {
          var rz = FLY_Z + sd * 3.3, ry = sd < 0 ? Math.PI : 0;
          bayLine.add((Sg[0] + Sg[1]) / 2, PL + .02, FLY_Z + sd * 2.1, Sg[1] - Sg[0], 1, .1, 0);
          for (var bx0 = Sg[0] + 1; bx0 + 5.6 <= Sg[1] - .5; bx0 += 6) {
            bayLine.add(bx0, PL + .02, rz + sd * .2, .1, 1, 2.2, 0);
            if (rnd() < (MOB ? .45 : .78)) parked(pick(['car', 'car', 'hatch', 'suv', 'hatch']), bx0 + 3, PL + .012, rz + (rnd() - .5) * .1, ry);
          }
        });
      });
      // command-centre forecourt: planted beds either side of the open front, kept clear of the wall camera's view
      [-1, 1].forEach(function (sd) {
        var px = CC.x + sd * 13.5, pz = CC.z + 20;
        planter.add(px, PL, pz, 6, .55, 2.2, 0); for (var sb = 0; sb < 5; sb++) shrub.add(px - 2.4 + sb * 1.2, PL + .85, pz, .5, .42, .5, sb, pick([0x5E8F45, 0x6FA050, 0x4E7A3B]));
        tree(CC.x + sd * 20, PL, CC.z + 16, .85);
      });
      function paths(cx, cz, gw, gd, cross) {
        grass.add(cx, PL + .01, cz, gw, 1, gd, 0);
        if (cross) { pathB.add(cx, PL + .014, cz, gw, 1, 2.4, 0); pathB.add(cx, PL + .014, cz, 2.4, 1, gd, 0); }
        else pathB.add(cx, PL + .014, cz, gw * .6, 1, 1.6, 0);
      }

      /* horizon: the city carries on in low-poly blocks, and the two main roads run out to it */
      var hb = [new Batch(UB, [sideM[0], sideM[0], topM, topM, sideM[0], sideM[0]], 0), new Batch(UB, [sideM[2], sideM[2], topM, topM, sideM[2], sideM[2]], 0), new Batch(UB, [sideM[3], sideM[3], topM, topM, sideM[3], sideM[3]], 0)];
      var HS = MOB ? 40 : 26;
      for (var gx = -880; gx <= 880; gx += HS) for (var gz = -880; gz <= 880; gz += HS) {
        var jx2 = gx + (rnd() - .5) * HS * .35, jz2 = gz + (rnd() - .5) * HS * .35, rr2 = Math.sqrt(jx2 * jx2 + jz2 * jz2);
        if (Math.abs(jx2) < EDGE + 14 && Math.abs(jz2) < EDGE + 14) continue;
        if (rr2 > 860 || Math.abs(jz2) < 26 || Math.abs(jx2) < 22 || rnd() < .16) continue;
        var fw = 3 * Math.round((10 + rnd() * 14) / 3), fd = 3 * Math.round((10 + rnd() * 14) / 3), fh = 3.2 * (2 + Math.floor(Math.pow(rnd(), 2.2) * 16)) + .2, sty3 = fh > 40 ? 2 : (rnd() < .5 ? 0 : 1);
        hb[sty3].add(jx2, 0, jz2, fw, fh, fd, 0, sty3 === 2 ? pick(GLASS) : pick(WALL));
      }
      var farG = new T.Mesh(new T.PlaneGeometry(2000, 2000).rotateX(-Math.PI / 2), M(0xE7ECEF, { roughness: 1 })); farG.position.y = -.05; scene.add(farG);
      var extA = M(0x6E757D, { roughness: .9 }), extF = M(0xCFC8BD, { roughness: .9 });
      [-1, 1].forEach(function (sd) {
        var c = sd * (EDGE + 370);
        var r1 = new T.Mesh(new T.PlaneGeometry(740, ROAD_EW_HALF * 2).rotateX(-Math.PI / 2), extA); r1.position.set(c, .02, 0); scene.add(r1);
        var r2 = new T.Mesh(new T.PlaneGeometry(ROAD_NS_HALF * 2, 740).rotateX(-Math.PI / 2), extA); r2.position.set(0, .02, c); scene.add(r2);
        [-1, 1].forEach(function (s2) {
          var f1 = new T.Mesh(new T.PlaneGeometry(740, 4).rotateX(-Math.PI / 2), extF); f1.position.set(c, .03, s2 * (ROAD_EW_HALF + 2)); scene.add(f1);
          var f2 = new T.Mesh(new T.PlaneGeometry(4, 740).rotateX(-Math.PI / 2), extF); f2.position.set(s2 * (ROAD_NS_HALF + 2), .03, c); scene.add(f2);
        });
      });

      // build everything
      [plinth, streets, lmark, mhole, par, memb, stair, door, tank, tankPad, acu, panel, leg, planter, shrub, dish, trunk, crown, hedge, grass, pathB, bench, basin, water, bayLine, parkAs, skirt, tblob, cblob].concat(bodies, hb).forEach(function (b) { b.build(); });
      Object.keys(pk).forEach(function (k) { pk[k].body.build(); pk[k].dark.build(); });

      // strollers in the parks
      var nP = Math.min(parkWalk.length, MOB ? 10 : 36);
      if (nP) {
        parkCrowd = makeCrowd(nP);
        parkWalk = parkWalk.slice(0, nP).map(function (S, k) { return { a: S.a, b: S.b, t: rnd(), dir: rnd() < .5 ? 1 : -1, sp: .9 + rnd() * .5, k: k }; });
      } else parkWalk = [];
    })();
    function stepFabric(dt) {
      if (!parkCrowd) return;
      parkWalk.forEach(function (P) {
        var dx = P.b[0] - P.a[0], dz = P.b[1] - P.a[1], len = Math.max(1, Math.sqrt(dx * dx + dz * dz));
        P.t += P.dir * P.sp * dt / len; if (P.t > 1) { P.t = 1; P.dir = -1; } if (P.t < 0) { P.t = 0; P.dir = 1; }
        var x = P.a[0] + dx * P.t, z = P.a[1] + dz * P.t, sw = Math.sin(clock * 6 * P.sp + P.k), gy = .2 + .014;
        var ry = Math.atan2(dx * P.dir, dz * P.dir);
        parkCrowd.pose(P.k, x, gy + Math.abs(sw) * .04, z, ry, sw, gy);
      });
      parkCrowd.flush();
    }

    /* ---------- plate search on the map: SIGHTINGS only — a pin pops at each camera that read the plate, in time order
       (past reads; no route or predicted path is drawn) ---------- */
    var mapWash = new T.Mesh(new T.PlaneGeometry(520, 520), new T.MeshBasicMaterial({ color: 0xF2F7FC, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); mapWash.rotation.x = -Math.PI / 2; mapWash.position.y = .3; scene.add(mapWash);
    var pins = [['J-02', -78, 12, '09:12'], ['J-04', -14, -14, '09:18'], ['J-07', 11, -78, '09:31']].map(function (p) {
      var m = new T.Mesh(new T.CylinderGeometry(.5, .5, 1, 14), B(0x2673B5)); m.position.set(p[1], 0, p[2]); scene.add(m);
      var head = new T.Mesh(new T.SphereGeometry(1.4, 18, 14), B(0x2673B5)); head.position.set(p[1], 0, p[2]); scene.add(head);
      return { m: m, head: head, el: tag('pin', p[0] + ' · read ' + p[3]), p: new T.Vector3(p[1], 0, p[2]) };
    });

    /* ---------- labels ---------- */
    var tWall = tag('ok', 'Cygnus · 3×3 wall · live and recorded');
    var tWatch = tag('al', 'Watchlist · XX 00 CD 5678 · J-04');
    var tTamper = tag('al', 'CAM J-05 · blinded · 09:44');
    var tApprove = tag('ok', 'Incident opened · patrol informed');
    var box = document.createElement('div'); box.className = 'cx-box'; box.innerHTML = '<b>ANPR · XX 00 CD 5678</b>'; labels.appendChild(box);

    // dispose list for unlit materials (keep exact brand colours)
    scene.traverse(function (o) { var m = o.material; if (!m) return; (Array.isArray(m) ? m : [m]).forEach(function (mm) { if (mm.isMeshBasicMaterial || mm.isLineBasicMaterial) mm.toneMapped = false; }); });

    /* ---------- camera path: one keyframe per station ---------- */
    var KEYS = [
      { p: [CC.x - 2, 7.5, CC.z + 30], l: [CC.x, 5, CC.z - 12] },   // the wall, from outside the open front
      { p: [-34, 17, -52], l: [-4, 1, -18] },                          // the junction from the north-west
      { p: [-30, 175, 40], l: [-40, 0, -40] },                         // top down: the map
      { p: [-40, 11, 40], l: [-14, 6, 14] },                           // the south-west corner camera
      { p: [CC.x - 3, 5.2, CC.z + 6], l: [CC.x, 3.6, CC.z - 4] }       // over the operator's shoulder
    ];
    if (MOB) { KEYS[0].p = [CC.x - 2, 8, CC.z + 38]; KEYS[1].p = [-40, 20, -60]; KEYS[2].p = [-30, 230, 60]; KEYS[3].p = [-46, 12, 48]; KEYS[4].p = [CC.x - 2, 5.6, CC.z + 9]; }
    // station boards: placed to the LEFT of each shot (the panel sits on the right), turned to face that station's camera
    boardsLater.forEach(function (B0) {
      var K = KEYS[B0[2]], dx = K.l[0] - K.p[0], dz = K.l[2] - K.p[2], d = Math.sqrt(dx * dx + dz * dz), ux = dx / d, uz = dz / d;
      var dist = d * .5, off = dist * .42, x = K.p[0] + ux * dist + uz * off, z = K.p[2] + uz * dist - ux * off;
      board(B0[0], B0[1], x, B0[3], z, Math.atan2(K.p[0] - x, K.p[2] - z), 9);
    });
    // the map station is seen from straight above: its title lies flat on the ground beside the route
    (function () { var dec = new T.Mesh(new T.PlaneGeometry(26, 4.1), B(0xffffff, { map: titleBoard('03', 'Plate journeys', 'Cygnus') })); dec.rotation.x = -Math.PI / 2; dec.position.set(-100, .32, -33); scene.add(dec); })(); // north of the flyover ramp (it was hidden under it)
    var pA = new T.Vector3(), pB = new T.Vector3(), lA = new T.Vector3(), lB = new T.Vector3(), camL = new T.Vector3();
    function ss(x) { return x * x * (3 - 2 * x); }
    function camAt(s) {
      var i = Math.max(0, Math.min(KEYS.length - 1, Math.floor(s))), j = Math.min(KEYS.length - 1, i + 1), f = ss(Math.max(0, Math.min(1, s - i)));
      pA.fromArray(KEYS[i].p); pB.fromArray(KEYS[j].p); lA.fromArray(KEYS[i].l); lB.fromArray(KEYS[j].l);
      var lift = Math.sin(f * Math.PI) * (i === 1 || i === 2 ? 0 : 18); // arc up between ground-level stations
      cam.position.lerpVectors(pA, pB, f); cam.position.y += lift; camL.lerpVectors(lA, lB, f); cam.lookAt(camL);
    }

    /* ---------- projection helpers ---------- */
    var W = 1, H = 1, pv = new T.Vector3();
    var PQ = { x: 0, y: 0, ok: false }; // reused: callers read it at once
    function project(p) { pv.copy(p).project(cam); PQ.x = (pv.x * .5 + .5) * W; PQ.y = (-pv.y * .5 + .5) * H; PQ.ok = pv.z > -1 && pv.z < 1; return PQ; }
    var limitX = function () { return MOB ? W - 30 : W * .62; };
    function tagAt(el, p, op) {
      if (op <= .01) { el.style.opacity = 0; return; }
      var q = project(p); if (!q.ok || q.x < 90 || q.x > limitX() || q.y < 70 || q.y > H - 90) { el.style.opacity = 0; return; }
      el.style.transform = 'translate(' + q.x.toFixed(1) + 'px,' + q.y.toFixed(1) + 'px) translate(-50%,-100%)'; el.style.opacity = op;
    }
    function boxAt(V, op) {
      if (!V || op <= .01) { box.style.opacity = 0; return; }
      var Ty = TYPES[V.t], c = vPos(V), minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
      for (var k = 0; k < 8; k++) {
        var dx = (k & 1 ? .5 : -.5) * (V.lane.axis === 'x' ? Ty.len : Ty.w), dz = (k & 4 ? .5 : -.5) * (V.lane.axis === 'x' ? Ty.w : Ty.len);
        var q = project(pv.set(c.x + dx, c.y + (k & 2 ? Ty.h : 0), c.z + dz)); if (!q.ok) { box.style.opacity = 0; return; }
        minX = Math.min(minX, q.x); maxX = Math.max(maxX, q.x); minY = Math.min(minY, q.y); maxY = Math.max(maxY, q.y);
      }
      if (maxX > limitX() || minX < 10) { box.style.opacity = 0; return; }
      box.style.width = (maxX - minX).toFixed(1) + 'px'; box.style.height = (maxY - minY).toFixed(1) + 'px';
      box.style.transform = 'translate(' + minX.toFixed(1) + 'px,' + minY.toFixed(1) + 'px)'; box.style.opacity = op;
    }

    /* ---------- simulation ---------- */
    var clock = 0, phase = 'ew', phaseT = 0;
    var PH = [['ew', 9], ['ew-a', 2.2], ['ar', 1.4], ['ns', 8], ['ns-a', 2.2], ['ar', 1.4]], phK = 0;
    function green(axis) { return (axis === 'x' && phase === 'ew') || (axis === 'z' && phase === 'ns'); }
    var vp = new T.Vector3();
    function vPos(V) { var y = V.lane.fly ? flyY(V.pos * V.lane.dir) : ROADY; return V.lane.axis === 'x' ? vp.set(V.pos * V.lane.dir, y, V.lane.off) : vp.set(V.lane.off, y, V.pos * V.lane.dir); }
    var byLane = LANES.map(function () { return []; });
    vehicles.forEach(function (V) { byLane[V.li].push(V); });
    var eul = new T.Euler(), sc1 = new T.Vector3(1, 1, 1), e5 = new T.Euler();
    var inBox = { x: false, z: false };
    function stepTraffic(dt) {
      phaseT += dt; if (phaseT > PH[phK][1]) { phaseT = 0; phK = (phK + 1) % PH.length; phase = PH[phK][0]; }
      // which axis still has a vehicle between its stop lines (including the crossings)
      inBox.x = inBox.z = false;
      vehicles.forEach(function (V) { if (V.lane.fly) return; var hl = TYPES[V.t].len / 2; if (V.pos + hl > -(JB + 4) + .5 && V.pos - hl < JB + 4) inBox[V.lane.axis] = true; });
      byLane.forEach(function (list) {
        list.sort(function (a, b) { return b.pos - a.pos; });
        // leaders first (sorted by position): each vehicle keeps a gap to the one ahead and never passes it;
        // on red it holds at the stop line (amber: only those too close to stop safely carry on)
        for (var i = 0; i < list.length; i++) {
          var V = list[i], ahead = i > 0 ? list[i - 1] : null, Ty = TYPES[V.t], target = V.vmax, cap = Infinity;
          if (!V.lane.fly) {
            var stop = -(JB + 4) - Ty.len / 2, dist = stop - V.pos; // stop line in lane coordinates (approaching from negative pos)
            var ax = V.lane.axis, amberNow = (ax === 'x' && phase === 'ew-a') || (ax === 'z' && phase === 'ns-a');
            // hold on red (amber: only those too close to stop carry on); on green still hold while people are on this road's
            // crossings or crossing traffic is still clearing the junction box
            var yieldPed = ax === 'x' ? (crossBusy[0] || crossBusy[1]) : (crossBusy[2] || crossBusy[3]);
            var boxBusy = ax === 'x' ? inBox.z : inBox.x;
            if (dist >= -.05 && (!green(ax) || yieldPed || boxBusy)) {
              var canGo = green(ax) ? false : amberNow && dist < V.v * V.v / 9 + .8;
              if (!canGo) { target = Math.min(target, Math.sqrt(Math.max(0, 2 * 4.5 * (dist - .2)))); cap = Math.min(cap, stop); }
            }
          }
          if (ahead) {
            var lim = ahead.pos - (TYPES[ahead.t].len + Ty.len) / 2 - 2.2, gap = lim - V.pos;
            target = Math.min(target, Math.max(0, Math.sqrt(Math.max(0, 2 * 5 * gap)) * .9), gap < 12 ? ahead.v + gap * .4 : Infinity);
            cap = Math.min(cap, lim);
          }
          V.v += (target - V.v) * Math.min(1, dt * (target < V.v ? 5 : 1.3));
          if (V.v < 0) V.v = 0;
          V.pos = Math.min(V.pos + V.v * dt, Math.max(V.pos, cap));
          if (V.pos >= cap - .01 && cap < Infinity) V.v = Math.min(V.v, ahead && cap === ahead.pos - (TYPES[ahead.t].len + Ty.len) / 2 - 2.2 ? ahead.v : 0);
        }
        // a vehicle that leaves the far end re-enters behind the last one in its lane (never on top of it)
        var SPAN = list.length ? list[0].lane.span : 340;
        if (list.length && list[0].pos > SPAN / 2) {
          var Vw = list.shift(), last = list.length ? list[list.length - 1] : null;
          var back = last ? last.pos - (TYPES[last.t].len + TYPES[Vw.t].len) / 2 - 8 - Math.random() * 14 : -SPAN / 2;
          Vw.pos = Math.min(-SPAN / 2, back); Vw.v = Vw.vmax * .8; list.push(Vw);
        }
      });
      vehicles.forEach(function (V, vi) {
        var p = vPos(V), ang = V.lane.axis === 'x' ? (V.lane.dir > 0 ? 0 : Math.PI) : (V.lane.dir > 0 ? -Math.PI / 2 : Math.PI / 2), wx = V.pos * V.lane.dir;
        // on a flyover ramp the body pitches with the slope: nose down when heading away from the deck
        var pitch = V.lane.fly && Math.abs(wx) > RAMP_A ? (V.pos > 0 ? -1 : 1) * Math.atan(RSLOPE) : 0;
        eul.set(0, ang, pitch); q4.setFromEuler(eul); m4.compose(p, q4, sc1); meshes[V.t].setMatrixAt(V.idx, m4); darks[V.t].setMatrixAt(V.idx, m4); if (auxs[V.t]) auxs[V.t].setMatrixAt(V.idx, m4);
        if (blobVeh) { var Ty = TYPES[V.t]; m4.compose(v3.set(p.x, p.y + .03, p.z), q4, s3.set(Ty.len + .7, 1, Ty.w + .6)); blobVeh.setMatrixAt(vi, m4); }
      });
      if (blobVeh) blobVeh.instanceMatrix.needsUpdate = true;
      Object.keys(meshes).forEach(function (k) { meshes[k].instanceMatrix.needsUpdate = true; darks[k].instanceMatrix.needsUpdate = true; if (auxs[k]) auxs[k].instanceMatrix.needsUpdate = true; });
      // signals: red / amber / green per axis
      signals.forEach(function (S) {
        var ax = S.axis === 'ew' ? 'x' : 'z', g = green(ax), amb = (ax === 'x' && phase === 'ew-a') || (ax === 'z' && phase === 'ns-a');
        S.lamps[0].material.color.setHex(!g && !amb ? 0xFF3B30 : 0x3A1412); S.lamps[1].material.color.setHex(amb ? 0xFFB020 : 0x3A2C10); S.lamps[2].material.color.setHex(g ? 0x2BD67B : 0x0F2F1F);
      });
      // countdowns: time left on green, or time until green
      signals.forEach(function (S) {
        var ax = S.axis === 'ew' ? 'x' : 'z', g = green(ax), left = PH[phK][1] - phaseT, k = (phK + 1) % PH.length, guard = 0;
        while (guard++ < PH.length && (((ax === 'x' && PH[k][0] === 'ew') || (ax === 'z' && PH[k][0] === 'ns')) === g)) { left += PH[k][1]; k = (k + 1) % PH.length; }
        var txt = String(Math.max(0, Math.ceil(left))).padStart(2, '0') + (g ? 'g' : 'r');
        if (txt !== S.cd.last) {
          S.cd.last = txt; var x = S.cd.c.getContext('2d'); x.fillStyle = '#0B0D10'; x.fillRect(0, 0, 128, 64);
          x.fillStyle = g ? '#2BD67B' : '#FF3B30'; x.font = '700 50px "Geist Mono", ui-monospace, Consolas, monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt.slice(0, 2), 64, 35); S.cd.t.needsUpdate = true;
        }
      });
      // pedestrians cross the arm whose traffic is held
      var busyNow = [false, false, false, false];
      peds.forEach(function (P, k) {
        var crossAxisZ = P.crossing < 2; // crossings 0,1 cross the east-west road (walk along z); 2,3 the north-south road
        var half = crossAxisZ ? ROAD_EW_HALF : ROAD_NS_HALF, len = half * 2 + 1.6;
        var walkPh = crossAxisZ ? phase === 'ns' : phase === 'ew';
        // start only early in the walk phase, and only when that road's traffic has cleared the crossing
        if (!P.walking && walkPh && phaseT > .6 && phaseT < 3.2 && !(crossAxisZ ? inBox.x : inBox.z)) P.walking = true;
        if (P.walking) { P.t += P.dir * P.sp * dt / len; if (P.t >= 1 || P.t <= 0) { P.t = P.t >= 1 ? 1 : 0; P.dir = -P.dir; P.walking = false; } }
        if (P.walking) busyNow[P.crossing] = true;
        var e = P.crossing % 2 ? 1 : -1, x, z, off = (P.lane - 1) * .9, along = -half - .8 + P.t * len, ry;
        if (crossAxisZ) { x = e * (JB + .2) + off; z = along; ry = P.dir > 0 ? 0 : Math.PI; } else { z = e * (JB + .2) + off; x = along; ry = P.dir > 0 ? Math.PI / 2 : -Math.PI / 2; }
        var stride = P.walking ? Math.sin(clock * 9 + P.ph) : 0, bob = Math.abs(stride) * .05;
        var fy = Math.abs(along) > half ? .25 : .05;
        pedCrowd.pose(k, x, fy + bob, z, ry, stride, fy);
      });
      crossBusy = busyNow;
      pedCrowd.flush();
      // footpath walkers and the pedestrian signal (walk = green while the crossing traffic is held)
      walkers.forEach(function (Wk, k) {
        Wk.p += Wk.dir * Wk.sp * dt; if (Wk.p > 150) Wk.p = -150; if (Wk.p < -150) Wk.p = 150;
        if (Math.abs(Wk.p) < JB + 3) Wk.p += Wk.dir * (JB + 3) * 2; // they cross at the zebras, off-screen of this loop
        var x = Wk.alongX ? Wk.p : Wk.lane, z = Wk.alongX ? Wk.lane : Wk.p, sw = Math.sin(clock * 6.2 * Wk.sp + k), bob = Math.abs(sw) * .04;
        walkCrowd.pose(k, x, .25 + bob, z, Wk.alongX ? (Wk.dir > 0 ? Math.PI / 2 : -Math.PI / 2) : (Wk.dir > 0 ? 0 : Math.PI), sw, .25);
      });
      if (walkCrowd) walkCrowd.flush();
      stepFabric(dt);
      signals.forEach(function (S) { if (S.lamps.ped) S.lamps.ped.material.color.setHex((S.axis === 'ew' ? phase === 'ns' : phase === 'ew') && phaseT < 3.2 ? 0x2BD67B : 0xFF3B30); });
      // metro train runs along the viaduct and turns back at the ends
      if (metro) { metro.z += metro.dir * 16 * dt; if (metro.z > 110) metro.dir = -1; if (metro.z < -150) metro.dir = 1; metro.train.position.z = metro.z; }
    }

    /* ---------- view tuning: fog, near plane and a shadow frustum fitted to what this camera sees ---------- */
    // static instanced meshes: their bounding sphere is the unit geometry at the origin, so never frustum-cull them
    scene.traverse(function (o) { if (o.isInstancedMesh) o.frustumCulled = false; });
    var SUN_DIR = new T.Vector3(60, 110, 40).normalize(), LX = new T.Vector3().crossVectors(new T.Vector3(0, 1, 0), SUN_DIR).normalize(), LY = new T.Vector3().crossVectors(SUN_DIR, LX);
    // the shadow map is redrawn when the frustum moves, on a station change, and every 4th frame for moving things
    var shC = new T.Vector3(), lastExt = -1, lastNear = -1, SHMAP = 2048, shDirty = true, shN = 0, shSt = -1;
    function tuneView() {
      var hgt = cam.position.y, a = Math.max(0, Math.min(1, (hgt - 18) / 140)), dl = cam.position.distanceTo(camL);
      // thinner fog as the camera climbs, so the aerial view keeps its detail out to the horizon blocks
      scene.fog.density = FOG0 * (1 - .62 * a);
      // near plane grows with height: far more depth precision for the aerial shots (no flicker between thin layers)
      var nr = +(.5 + 2.5 * a).toFixed(2); if (nr !== lastNear) { lastNear = nr; cam.near = nr; cam.updateProjectionMatrix(); }
      if (!SHADOWS) return;
      // half-size of the shadow box: tight at street level (crisp), wide enough to cover the whole frame from above
      var ext = Math.round(Math.max(46, Math.min(200, Math.max(hgt * 1.05, dl * 1.45))));
      if (ext !== lastExt) {
        lastExt = ext; shDirty = true; var sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 20; sc.far = 260 + ext * 1.3; sc.updateProjectionMatrix();
        sun.shadow.normalBias = .02 + (2 * ext / SHMAP) * .55; sun.shadow.bias = -.0004;
      }
      // centre between the look point and the camera, snapped to whole shadow texels so edges never crawl
      shC.copy(camL).lerp(cam.position, .3); shC.y = 0;
      var texel = 2 * ext / SHMAP, u = shC.dot(LX), v = shC.dot(LY), du = Math.round(u / texel) * texel - u, dv = Math.round(v / texel) * texel - v;
      shC.addScaledVector(LX, du).addScaledVector(LY, dv);
      if (!sun.target.position.equals(shC)) shDirty = true;
      sun.target.position.copy(shC); sun.target.updateMatrixWorld();
      sun.position.copy(shC).addScaledVector(SUN_DIR, 230); sun.updateMatrixWorld();
    }

    /* ---------- per-frame update from the host ---------- */
    function wgt(s, i) { return Math.max(0, Math.min(1, 1 - Math.abs(s - i) * 1.6)); }
    var P_WALL = new T.Vector3(CC.x, 10.6, CC.z - 12), P_APPR = new T.Vector3(CC.x, 5.6, CC.z - 3.8), FP = new T.Vector3(); // per-frame temporaries, allocated once
    function update(progress, stationIndex, dt) {
      if (dead) return;
      dt = Math.min(.05, dt || .016); clock += dt;
      var s = Math.max(0, Math.min(1, progress)) * (KEYS.length - 1), t = clock;
      camAt(s);
      if (!REDUCE) stepTraffic(dt); else if (clock < .1) stepTraffic(.016);
      tuneView();

      var w0 = wgt(s, 0), w1 = wgt(s, 1), w2 = wgt(s, 2), w3 = wgt(s, 3), w4 = wgt(s, 4);
      // 01 wall: tiles frame up in sequence; the city tile carries a detection
      wallTiles.forEach(function (Ti) { Ti.fr.material.opacity = Math.max(0, Math.min(1, (w0 + w4) * 2 - Ti.k * .12)) * .9; });
      tagAt(tWall, P_WALL, w0 > .45 ? 1 : 0);
      ccLeds.forEach(function (L, k) { L.material.color.setHex(Math.sin(t * 6 + k) > 0 ? 0x5A9FD4 : 0x2673B5); });
      // 02 watchlist hit at J-04: the flagged car turns red, gets a box and a ring
      var hot = w1 > .25;
      if (hot && (!flagged || flagged.pos > 40 || flagged.pos < -90)) {
        if (flagged) { meshes.car.setColorAt(flagged.idx, flagCol.setHex(carColor(flagged))); }
        flagged = pickFlagged();
      }
      if (!hot && flagged) { meshes.car.setColorAt(flagged.idx, flagCol.setHex(carColor(flagged))); meshes.car.instanceColor.needsUpdate = true; flagged = null; }
      if (flagged) {
        meshes.car.setColorAt(flagged.idx, flagCol.setHex(0xD6453D)); meshes.car.instanceColor.needsUpdate = true;
        var fp = FP.copy(vPos(flagged)); ring.position.set(fp.x, .08, fp.z); ring.material.opacity = .35 + .3 * Math.sin(t * 6);
        boxAt(flagged, 1);
        tagAt(tWatch, fp.setY(3.4), w1 > .5 ? 1 : 0);
      } else { ring.material.opacity = 0; boxAt(null, 0); tWatch.style.opacity = 0; }
      cams['J-04'].zone.material.opacity = .06 + w1 * .14;
      // 03 plate search: map wash, then a pin pops at each camera that read the plate, in time order
      mapWash.material.opacity = w2 * .26; if (metro) metro.g.visible = w2 < .05; // the wash stays light so the city detail reads under the pins
      pins.forEach(function (P, k) {
        var k2 = Math.max(0, Math.min(1, w2 * 2.2 - k * .35)), hgt = k2 * 9;
        P.m.scale.set(1, Math.max(.001, hgt), 1); P.m.position.y = hgt / 2; P.head.position.y = hgt + 1.2; P.head.scale.setScalar(Math.max(.001, k2));
        tagAt(P.el, FP.copy(P.p).setY(hgt + 3), k2 > .6 ? 1 : 0);
      });
      // 04 camera health: J-05 is knocked off its aim and its view goes dark
      var C5 = cams['J-05'];
      var knock = Math.max(0, Math.min(1, (s - 2.5) * 2));
      C5.head.quaternion.copy(C5.base); C5.head.rotateY(knock * .9 + (w3 > .3 ? Math.sin(t * 9) * .02 : 0)); C5.head.rotateX(knock * .35);
      C5.zone.material.color.setHex(w3 > .3 ? 0xD6453D : 0x2673B5);
      C5.zone.material.opacity = w3 > .3 ? (Math.sin(t * 7) > .2 ? .16 : .03) : .07;
      tagAt(tTamper, C5.top, w3 > .45 ? 1 : 0);
      // 05 the operator approves: the button on the console pulses
      if (opBtn) opBtn.material.opacity = w4 > .3 ? .35 + .3 * Math.sin(t * 5) : 0;
      tagAt(tApprove, P_APPR, w4 > .5 ? 1 : 0);

      if (stationIndex !== shSt) { shSt = stationIndex; shDirty = true; }
      if (SHADOWS && (shDirty || ++shN % 4 === 0)) { renderer.shadowMap.needsUpdate = true; shDirty = false; }
      renderer.render(scene, cam);
    }

    function resize(w, h) { W = Math.max(1, w); H = Math.max(1, h); renderer.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix(); }

    function dispose() {
      dead = true;
      scene.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { if (m.map) m.map.dispose(); m.dispose(); });
      });
      TEX.forEach(function (t) { t.dispose(); });
      if (envTex) envTex.dispose();
      renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss();
      [canvas, labels, css].forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
    }

    camAt(0);
    return { update: update, warm: function (done) { (window.INFRAX_WARM || function (r, s, c, d) { d(); })(renderer, scene, cam, done); }, resize: resize, setDpr: function (v) { renderer.setPixelRatio(v); renderer.setSize(W, H, false); }, dispose: dispose };
  }

  window.INFRAX_DOMAINS.cities = {
    slug: 'cities', label: 'Cities', title: 'One control room for the city',
    intro: 'Junction cameras from any vendor on one wall, plates read at every arm, and one command centre for the city.',
    stations: STATIONS, create: create
  };
})();

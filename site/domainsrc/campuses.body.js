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
      photo: 'img/campus-sm.jpg', photoCaption: 'Illustrative' },
    { id: 'parking', product: 'Access and parking', productSlug: 'access-parking', short: 'Parking',
      title: 'Free spaces by level, as they change',
      body: 'Every entry and exit updates the count for each level of the parking deck. Cameras at the basement ramp watch the cars going down to P2.',
      rows: [['Level 1', '12 free'], ['Level 2', '27 free'], ['Level 3', '41 free'], ['Ramp', 'P2 · 2 cameras']],
      live: ['Parking occupancy', 'ANPR', 'Live video'],
      photo: 'img/campus-sm.jpg', photoCaption: 'Illustrative' },
    { id: 'console', product: 'Cygnus', productSlug: 'cygnus', short: 'One console',
      title: 'One console for every building',
      body: 'Gates, blocks, parking and walkways on one 3×3 video wall and one campus map. Recording runs 24×7 with timeline playback, and PTZ cameras move from the tile.',
      rows: [['Wall', 'Gates · blocks · parking'], ['Map', 'Every camera by building'], ['Recording', '24×7 · timeline playback']],
      live: ['Live video wall', '24×7 recording', 'Plate search & journeys'],
      photo: 'img/real/tiles/t7-campus.jpg', photoCaption: 'Corridor feeds masked · other views illustrative' },
    { id: 'health', product: 'Cygnus', productSlug: 'cygnus', short: 'Camera health',
      title: 'A ramp camera stopped sending video',
      body: 'Cygnus flags a camera the moment it is blinded, moved or drops its stream, and opens a maintenance ticket, so the gap is fixed before anyone needs that footage.',
      rows: [['Camera', 'Basement ramp · cam 04'], ['Status', 'Stream lost'], ['Next step', 'Maintenance ticket']],
      live: ['Camera tamper & health'],
      photo: 'img/campus-sm.jpg', photoCaption: 'Illustrative' },
    { id: 'people', product: 'Cygnus', productSlug: 'cygnus', short: 'People count',
      title: 'People in and out at every entrance',
      body: 'A camera over the Block A entrance counts people crossing the line in each direction, so facilities see footfall by entrance and by hour.',
      rows: [['Entrance', 'Block A · main doors'], ['In today', '1,284'], ['Out today', '1,102'], ['Busiest', '09:00–10:00']],
      live: ['People counting', 'Live video'],
      photo: 'img/campus-sm.jpg', photoCaption: 'Illustrative' }
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
      { src: TL + 't7-campus.jpg', label: 'GATE 1 · IN' }, { src: TL + 't7-campus.jpg', label: 'BLOCK A', crop: [0, 0, .62, .62] },
      { src: TL + 't7-campus.jpg', label: 'BLOCK B', crop: [.38, 0, .62, .62] }, { src: TL + 't9-warehouse.jpg', label: 'SERVICE YARD' },
      { src: TL + 't7-campus.jpg', label: 'WALKWAY', crop: [.2, .38, .62, .62] }, { src: TL + 't6-city.jpg', label: 'GATE 2 · OUT' },
      { src: TL + 't7-campus.jpg', label: 'RAMP · CAM 04', crop: [.38, .38, .62, .62] }, { src: TL + 't6-city.jpg', label: 'ACCESS ROAD', crop: [0, .3, .7, .7] },
      { src: TL + 't7-campus.jpg', label: 'DROP-OFF', crop: [0, .38, .62, .62] }]);
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

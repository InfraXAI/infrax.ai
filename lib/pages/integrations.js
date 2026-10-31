// Integrations page script: the two inline <script>s of site/src/integrations.html (the hub, then the products exchange),
// unchanged inside init() except where marked "PORT:". usePage('integrations', init) runs it once the page markup is
// mounted; the returned stop() cancels every rAF loop, timer, observer and window/document listener, and kills the
// GSAP tweens created later in callbacks (the ones created synchronously are reverted by usePage's gsap.context).
export function init() {
var cleanups = []; // PORT: each part pushes its own teardown

/* ---------- first <script>: integration hub ---------- */
(function(){
'use strict';
var X=window.INFRAX||{}, reduce=!!X.reduce, hasGsap=!!(window.gsap&&window.ScrollTrigger);
function $(s,r){return (r||document).querySelector(s);} function $$(s,r){return [].slice.call((r||document).querySelectorAll(s));}
function clamp(v,a,b){return Math.max(a===undefined?0:a,Math.min(b===undefined?1:b,v));}
var NS='http://www.w3.org/2000/svg';
var stopped=false, late=[]; function keep(tw){ late.push(tw); return tw; } // PORT: state for stop()
function el(tag,attrs,parent){ var e=document.createElementNS(NS,tag); for(var k in attrs) e.setAttribute(k,attrs[k]); if(parent) parent.appendChild(e); return e; }

var ICON={
  camera:'M3 8h11v8H3zM14 11l5-3v8l-5-3',
  vms:'M3 5h18v6H3zM3 13h18v6H3zM6 8h.01M6 16h.01M10 8h6M10 16h6',
  api:'M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16',
  radar:'M12 20V12M12 12l6-6M5 12a7 7 0 0 1 7-7M8 12a4 4 0 0 1 4-4',
  callbox:'M8 3h8v18H8zM10 7h4M12 11v3M11 17h2',
  sign:'M3 5h18v9H3zM7 9h2M11 9h2M15 9h2M12 14v6M8 20h8',
  challan:'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3',
  map:'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14',
  access:'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c0-4 3-7 7-7s7 3 7 7M17 11l2 2 4-4',
  agent:'M12 3v3M7 8h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM9 13h.01M15 13h.01M10 16h4',
  mcp:'M4 12h4M16 12h4M8 8h8v8H8zM12 4v4M12 16v4',
  fed:'M12 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM5 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 9v3M12 12l-5 3M12 12l5 3'
};
var CATS=[
  {id:'camera',name:'Any IP camera',short:'IP cameras',st:'live',via:'Cygnus',dir:'in',proto:['ONVIF','RTSP','Fixed · PTZ · ANPR','ONVIF discovery','CSV / Excel import'],
   into:'Live streams from any brand of camera on site, recorded 24×7.',outof:'PTZ commands from the video tile, and health checks back to each camera.',
   ex:[['Highways','Gantry and pole cameras along the corridor'],['Cities','Junction cameras across departments'],['Campuses','Gate and building cameras on one wall']]},
  {id:'vms',name:'Your VMS or NVR',short:'VMS / NVR',st:'live',via:'Cygnus',dir:'in',proto:['Through its API','Cameras','Recordings'],
   into:'The cameras and recordings your existing VMS or NVR already manages, connected through its API.',outof:'Nothing to rip out; we scope the link per project.',
   ex:[['Highways','Keep the recorders already on the corridor'],['Cities','Departments keep their own VMS']]},
  {id:'api',name:'Open APIs',short:'Open APIs',st:'live',via:'Cygnus',dir:'both',proto:['REST registry API','Webhooks','Events feed'],
   into:'Your systems read the camera registry and query events through a documented REST API.',outof:'Webhooks and an events feed push detections and incidents to your systems as they happen.',
   ex:[['Highways','Send incidents to an O&M ticketing system'],['Integrators','Build dashboards on the events feed']]},
  {id:'callbox',name:'Emergency call boxes',short:'Call boxes',st:'live',via:'AstraAlert',dir:'both',proto:['Call boxes','Voice','Box health'],
   into:'Calls from drivers, plus each box\'s power, battery, solar and door status.',outof:'The call answered, and with the AI voice agent, a summary for the operator to confirm.',
   ex:[['Highways','Every box located on the map when it rings']]},
  {id:'sign',name:'LED message signs',short:'LED signs',st:'live',via:'Central Plexus (ATMS / ICCC)',dir:'out',proto:['Message signs','Gantry boards'],
   into:'Sign status from the road.',outof:'Messages to the LED signs, sent by the operator.',
   ex:[['Highways','"Accident ahead, keep left" upstream of an incident']]},
  {id:'challan',name:'E-challan review',short:'E-challan',st:'live',via:'Central Plexus (ATMS / ICCC)',dir:'out',proto:['Photo + video evidence','Review','Export'],
   into:'Violations arriving with photo and video evidence.',outof:'Reviewed cases exported for e-challan.',
   ex:[['Highways','Violations reviewed by a person before export']]},
  {id:'map',name:'Maps and GIS',short:'Maps / GIS',st:'live',via:'Central Plexus (ATMS / ICCC)',dir:'both',proto:['GIS registry','Cameras','Roadside assets'],
   into:'Where every camera, gantry, sign and call box sits.',outof:'Alerts and incidents placed on the live map.',
   ex:[['Highways','Cameras linked to the roadside assets they can see'],['Warehouses','Cameras placed on the site plan']]},
  {id:'access',name:'Per-person access',short:'Access',st:'live',via:'Cygnus',dir:'in',proto:['5 roles','Per-feature rights','Audit trail'],
   into:'Who each user is, and which sites, cameras and features they may use.',outof:'A full audit trail of who viewed, exported or approved what.',
   ex:[['Campuses','Security desk and site managers see only their buildings'],['Highways','Operators, supervisors and auditors, each with their own rights']]},
  {id:'agent',name:'AI assistant with scoped rights',short:'AI assistant',st:'live',via:'VAYU, the AI operations assistant',dir:'both',proto:['The operator\'s own access','Confirm each change','Fully local on CPU'],
   into:'VAYU reads cameras, events, plates and incidents with the operator\'s own rights, and nothing more.',outof:'Proposed actions (raise an incident, update a watchlist, move a PTZ camera) that the operator confirms.',
   ex:[['Control rooms','"Which cameras need attention?" answered from your own data']]},
  {id:'radar',name:'Gantry radar',short:'Gantry radar',st:'live',via:'InfraX AI VIDES',dir:'in',proto:['Radar speed','On the gantry'],
   into:'Speed for each vehicle the camera reads, from radar on the gantry.',outof:'Overspeed cases with images, for review before any e-challan.',
   ex:[['Highways','Speed enforcement gantries on expressways']]}
];
var STB={live:'<span class="st st-live">Live</span>'};
var STT={live:'LIVE'};

/* ---------- build the hub ---------- */
var svg=$('#inHub'), gL=$('#inLanes'), gD=$('#inDots'), gN=$('#inNodes'), CX=450, CY=350, RX=318, RY=262;
var lanes=[], sel=0, hover=-1;
CATS.forEach(function(c,i){
  var a=i/CATS.length*Math.PI*2-Math.PI/2, x=CX+Math.cos(a)*RX, y=CY+Math.sin(a)*RY;
  var path=el('path',{'class':'in-lane'+(c.st==='req'?' plan':'')},gL);
  var dir=el('text',{'class':'in-dir','text-anchor':'middle'},gL); dir.textContent=c.dir==='both'?'in · out':c.dir;
  var g=el('g',{'class':'in-node '+(c.st==='req'?'planned':''),tabindex:'0',role:'button','aria-pressed':'false','aria-label':c.name+', '+STT[c.st].toLowerCase(),transform:'translate('+x+' '+y+')'},gN);
  el('circle',{'class':'hit',r:'72'},g); // invisible hit area: stays ≥44px when the hub scales down on phones
  el('circle',{'class':'ring',r:'27'},g);
  var ic=el('g',{transform:'translate(-12 -12)'},g); el('path',{'class':'ico',d:ICON[c.id]},ic);
  var right=Math.cos(a)>.2, left=Math.cos(a)<-.2, tx=right?36:left?-36:0, ty=right||left?-1:(Math.sin(a)<0?-50:46), anc=right?'start':left?'end':'middle';
  var t=el('text',{x:tx,y:ty,'text-anchor':anc},g); t.textContent=c.short||c.name;
  var ts=el('text',{'class':'st-t',x:tx,y:ty+15,'text-anchor':anc},g); ts.textContent=STT[c.st];
  g.addEventListener('click',function(){ select(i); });
  g.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); select(i); } });
  g.addEventListener('pointerenter',function(){ hover=i; wake(); }); g.addEventListener('pointerleave',function(){ hover=-1; wake(); });
  var nd=c.st==='live'?6:3, dots=[]; for(var k=0;k<nd;k++){ var out=c.dir==='out'||(c.dir==='both'&&k%2===0);
    dots.push({out:out,o:k/nd,el:el('circle',{r:out?3.6:3.4,fill:out?'#2673B5':'#fff',stroke:'#2673B5','stroke-width':out?0:1.5},gD)}); }
  lanes.push({x:x,y:y,a:a,path:path,dir:dir,node:g,dots:dots,grow:reduce?1:0,g0:-1,c0:-1});
});

/* chips + card */
var chips=$('#inChips'), card=$('#inCard');
CATS.forEach(function(c,i){ var li=document.createElement('li'); li.innerHTML='<button type="button" aria-pressed="false"><span class="d '+c.st+'" aria-hidden="true"></span>'+c.name+'</button>'; chips.appendChild(li); li.firstChild.addEventListener('click',function(){ select(i); }); });
function select(i){
  sel=i; var c=CATS[i];
  lanes.forEach(function(l,j){ l.node.classList.toggle('on',j===i); l.node.setAttribute('aria-pressed',String(j===i)); l.path.classList.toggle('on',j===i); l.dir.classList.toggle('on',j===i); });
  $$('button',chips).forEach(function(b,j){ b.setAttribute('aria-pressed',String(j===i)); });
  card.innerHTML='<h3>'+c.name+'</h3><div class="stline">'+STB[c.st]+(c.st==='live'?'<small>In production today</small>':'<small>Built; available for a project when it fits</small>')+'</div><div class="proto">'+c.proto.map(function(p){return '<span>'+p+'</span>';}).join('')+'</div>'+
    '<p class="via">Through '+c.via+'</p>'+
    '<div class="in-flow"><div class="fin"><h4 role="none"><i></i>Into the control room</h4><p>'+c.into+'</p></div><div class="fout"><h4 role="none"><i></i>Out to the road and team</h4><p>'+c.outof+'</p></div></div>'+
    '<h5 role="none">By domain</h5><dl>'+c.ex.map(function(e){return '<div><dt>'+e[0]+'</dt><dd>'+e[1]+'</dd></div>';}).join('')+'</dl>';
  if(window.gsap&&!reduce) keep(gsap.from(card.children,{y:10,opacity:0,duration:.35,stagger:.04,ease:'power3.out'})); // PORT: keep(): tweens made after init are killed by stop()
  wake();
}

/* ---------- animate: data pulses travel straight lanes; the chosen lane is highlighted ---------- */
// the loop sleeps offscreen / hidden / covered; under reduced motion it draws once per change (select, hover)
var t0=performance.now(), visible=true, raf=0, ringTw=null, LP=[0,0];
function covered(){ return !!(window.INFRAX&&INFRAX.covered); }
function wake(){ if(!raf&&!stopped) raf=requestAnimationFrame(frame); } // PORT: no new frame after stop()
var hubIO=new IntersectionObserver(function(es){ visible=es[0].isIntersecting; if(ringTw){ if(visible) ringTw.play(); else ringTw.pause(); } if(visible) wake(); }); hubIO.observe(svg); // PORT: kept for stop()
document.addEventListener('visibilitychange',wake); document.addEventListener('infrax:cover',wake);
// lanes are straight: a point at fraction f from the core edge to the node edge (written into the shared LP)
function lanePoint(l,f){
  var sx=CX+Math.cos(l.a)*96, sy=CY+Math.sin(l.a)*96, ex=l.x-Math.cos(l.a)*31, ey=l.y-Math.sin(l.a)*31;
  LP[0]=sx+(ex-sx)*f; LP[1]=sy+(ey-sy)*f; return LP;
}
function frame(now){
  raf=0;
  if(!visible||document.hidden||covered()) return;
  if(!reduce) raf=requestAnimationFrame(frame);
  var t=reduce?0:(now-t0)/1000, cur=hover>-1?hover:sel;
  lanes.forEach(function(l,j){
    var g=l.grow, p;
    if(l.g0!==g){ l.g0=g; // path + direction label only change while the lane grows
      p=lanePoint(l,0); var d='M'+p[0].toFixed(1)+' '+p[1].toFixed(1); p=lanePoint(l,g); l.path.setAttribute('d',d+'L'+p[0].toFixed(1)+' '+p[1].toFixed(1));
      p=lanePoint(l,.55); l.dir.setAttribute('x',(p[0]+(-Math.sin(l.a))*14).toFixed(1)); l.dir.setAttribute('y',(p[1]+Math.cos(l.a)*14+4).toFixed(1)); l.c0=-1; }
    var on=j===cur; if(l.c0!==(on?1:0)||g<1){ l.c0=on?1:0; l.dir.style.opacity=String(clamp(g*2-1)*(on?1:0)); }
    var speed=on?.32:.18;
    l.dots.forEach(function(dt){ var s=(t*speed+dt.o)%1, f=dt.out?s:1-s; p=lanePoint(l,f*g);
      dt.el.setAttribute('cx',p[0].toFixed(1)); dt.el.setAttribute('cy',p[1].toFixed(1));
      dt.el.style.opacity=String((on?1:.45)*Math.sin(s*Math.PI)*clamp(g*1.5-.3)); });
  });
}
select(0);
if(hasGsap&&!reduce){
  /* nodes appear around the ring and lanes grow out of the core */
  ScrollTrigger.create({trigger:svg,start:'top 80%',once:true,onEnter:function(){
    keep(gsap.from('#inCore',{scale:.7,opacity:0,transformOrigin:'450px 350px',duration:.5,ease:'expo.out'})); // PORT: keep() (created in a callback, outside the gsap.context)
    lanes.forEach(function(l,i){ keep(gsap.to(l,{grow:1,duration:.55,delay:.1+i*.03,ease:'power3.out'}));
      keep(gsap.from(l.node,{opacity:0,y:10,duration:.45,delay:.15+i*.03,ease:'power3.out'})); });
  }});
  ringTw=gsap.to('#inCoreRing',{attr:{r:110},opacity:0,duration:2.2,repeat:-1,ease:'power1.out'}); if(!visible) ringTw.pause();
}else{ lanes.forEach(function(l){ l.grow=1; }); wake(); }

// PORT: cleanup for client-side navigation away from this page
cleanups.push(function(){
  stopped=true; cancelAnimationFrame(raf); raf=0; hubIO.disconnect();
  document.removeEventListener('visibilitychange',wake); document.removeEventListener('infrax:cover',wake);
  late.forEach(function(tw){ tw.kill(); }); late.length=0;
});
})();

// PORT: the static page loaded assets/icons.js here; the shared runtime now renders the icons on every page.

/* ---------- second <script>: products exchange ---------- */
(function(){
"use strict";
var reduce=!!(window.INFRAX&&INFRAX.reduce);
  /* ---------- products exchange: one rAF clock. Satellites orbit slowly on an ellipse; every 5.2 s the centre
     (Cygnus -> Central Plexus -> InfraX AI Ops) swaps with a 1.2 s eased cross-move. Links are cubic Beziers rebuilt
     each frame from live positions; data boxes ride them at constant arc-length speed and fade at the ends. ---------- */
  (function () {
    var ex = document.getElementById('hmEx'), svg = document.getElementById('hmExSvg');
    if (!ex) return;
    var NS = 'http://www.w3.org/2000/svg';
    var N = [
      { id: 'cy', name: 'Cygnus', sub: 'Video management', outs: ['Video walls', 'Plate search', 'Watchlist alarm'], to: ['clip', 'plate read'], from: ['camera move'] },
      { id: 'cp', name: 'Central Plexus', sub: 'ATMS', outs: ['Incidents', 'E-challan review', 'Sign messages'], to: ['incident', 'sign message'], from: ['evidence'] },
      { id: 'ops', name: 'InfraX AI Ops', sub: 'Field teams', outs: ['Work orders', 'Shifts', 'Daily digest'], to: ['work order'], from: ['fault ticket'] },
      { id: 'vides', name: 'InfraX AI VIDES', sub: 'Gantry', to: ['plate', 'speed', 'class', 'evidence'], from: ['speed limit', 'classes'] },
      { id: 'astra', name: 'AstraAlert', sub: 'Call boxes', to: ['call', 'box health'], from: ['callback'] },
      { id: 'toll', name: 'TollCloud', sub: 'Toll lanes', to: ['toll session', 'plate'], from: ['tariff'] },
      { id: 'access', name: 'Access and parking', sub: 'Gates', to: ['gate read'], from: ['allow list'] }
    ];
    var CENTRES = ['cy', 'cp', 'ops'], ci = 0, byId = {}, SWAP = 5.2, MOVE = 1.2, CS = 1.12;
    N.forEach(function (n, i) {
      var el = document.createElement('div');
      el.className = 'hm-node';
      el.innerHTML = '<i class="mk"></i><span><b>' + n.name + '</b><small>' + n.sub + '</small></span>' +
        (n.outs ? '<div class="hm-det"><span class="ctrk">At the centre</span><ul>' + n.outs.map(function (o) { return '<li>' + o + '</li>'; }).join('') + '</ul></div>' : '');
      ex.appendChild(el);
      var ln = document.createElementNS(NS, 'path'); ln.setAttribute('class', 'ln'); svg.appendChild(ln);
      n.el = el; n.det = el.querySelector('.hm-det'); n.ln = ln; n.x = 0; n.y = 0; n.s = 1; n.vs = 0; n.d = 0; n.vd = 0;
      n.slot = i - 1; n.tw = null; n.lut = null; n.P = new Array(8); n.lutBuf = []; byId[n.id] = n;
      for (var q = 0; q <= 24; q++) n.lutBuf.push([0, 0, 0]);
    });
    // centre slot is -1; the six others hold orbit slots 0..5
    byId.cy.slot = -1; byId.cp.slot = 0; byId.ops.slot = 1;
    var W = 0, H = 0, small = false, packets = [], HP = { x: 0, y: 0 };
    var MQT = (window.INFRAX && INFRAX.mq && INFRAX.mq.tablet) || '(max-width:768px)';
    var PHONE = [[.27, .065], [.73, .065], [.5, .2], [.27, .8], [.73, .8], [.5, .935]];
    // sizes are measured only on resize, never per frame; the phone layout follows the same breakpoint as the CSS
    function size() {
      var r = ex.getBoundingClientRect(); W = r.width; H = r.height; small = matchMedia(MQT).matches;
      N.forEach(function (n) { n.hw = n.el.offsetWidth / 2; n.hh = n.el.offsetHeight / 2; n.dh = n.det ? n.det.offsetHeight + 8 : 0; });
    }
    function centre() { return byId[CENTRES[ci]]; }
    function ease(e) { return e < .5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2; }
    // home position at clock t: the centre, or a slot on a slowly turning ellipse with gentle sine drift (written into the shared HP)
    function home(n, t) {
      if (n.slot < 0) { HP.x = W / 2 + Math.sin(t * .35) * W * .008; HP.y = H / 2 - n.dh * CS / 2 + Math.cos(t * .3) * H * .01; return HP; }
      if (small) {  // phone: fixed rows above and below the centre card, with a gentle drift
        var M = PHONE[n.slot];
        var mx = W * M[0] + Math.sin(t * .5 + n.slot) * 3, my = H * M[1] + Math.cos(t * .45 + n.slot) * 3;
        HP.x = Math.max(n.hw + 4, Math.min(W - n.hw - 4, mx)); HP.y = my; return HP;
      }
      var rx = W * .38, ry = H * .36;
      var a = -Math.PI / 2 + n.slot / 6 * Math.PI * 2 + t * (Math.PI * 2 / 120) + Math.sin(t * .45 + n.slot * 1.7) * .035;
      var x = W / 2 + Math.cos(a) * rx, y = H / 2 + Math.sin(a) * ry + Math.sin(t * .6 + n.slot) * 3;
      HP.x = Math.max(n.hw + 6, Math.min(W - n.hw - 6, x)); HP.y = Math.max(n.hh + 6, Math.min(H - n.hh - 6, y)); return HP;
    }
    // centre swap: outgoing takes the incoming node's orbit slot; both glide on eased paths that bow to opposite sides
    function swap(t) {
      var out = centre(); ci = (ci + 1) % CENTRES.length; var inc = centre();
      out.slot = inc.slot; inc.slot = -1;
      [out, inc].forEach(function (n, k) { n.tw = { t0: t, fx: n.x, fy: n.y, side: k ? 1 : -1 }; });
      byId.vides.ln.classList.toggle('main', inc.id !== 'ops');
      packets.forEach(function (p) { if (p.a === out || p.b === out || p.link === inc) p.fade = 1; });
    }
    // critically damped spring (no overshoot) for scale and the detail panel
    function spring(n, key, vkey, target, dt) {
      var w = 9, x = n[key] - target, v = n[vkey], e = Math.exp(-w * dt);
      n[key] = target + (x + (v + w * x) * dt) * e; n[vkey] = (v - w * (v + w * x) * dt) * e;
    }
    function place(t, dt) {
      var c = centre();
      N.forEach(function (n) {
        var h = home(n, t);
        if (n.tw) {
          var k = Math.min(1, (t - n.tw.t0) / MOVE), e = ease(k);
          var dx = h.x - n.tw.fx, dy = h.y - n.tw.fy, L = Math.hypot(dx, dy) || 1, b = Math.sin(Math.PI * e) * (small ? 26 : 40) * n.tw.side;
          n.x = n.tw.fx + dx * e - dy / L * b; n.y = n.tw.fy + dy * e + dx / L * b;
          if (k >= 1) n.tw = null;
        } else { n.x = h.x; n.y = h.y; }
        spring(n, 's', 'vs', n === c ? CS : 1, dt);
        if (n.det) {
          spring(n, 'd', 'vd', n === c && !n.tw ? 1 : 0, n === c ? dt : dt * 1.8);
          var d = Math.max(0, Math.min(1, n.d));
          n.det.style.opacity = d.toFixed(3);
          n.det.style.transform = 'translate3d(-50%,' + ((1 - d) * -6).toFixed(1) + 'px,0) scale(' + (.94 + .06 * d).toFixed(3) + ')';
        }
        n.el.classList.toggle('is-c', n === c);
        n.el.style.transform = 'translate3d(' + (n.x - n.hw).toFixed(1) + 'px,' + (n.y - n.hh).toFixed(1) + 'px,0) scale(' + n.s.toFixed(3) + ')';
      });
      // links: cubic Bezier from each satellite to the centre, plus an arc-length table for the packets
      N.forEach(function (n) {
        if (n === c) { n.ln.setAttribute('d', ''); n.lut = null; return; }
        var dx = c.x - n.x, dy = c.y - n.y, L = Math.hypot(dx, dy) || 1, bend = L * .12 * ((n.slot % 2) ? 1 : -1), px = -dy / L * bend, py = dx / L * bend;
        var P = n.P; P[0] = n.x; P[1] = n.y; P[2] = n.x + dx * .33 + px; P[3] = n.y + dy * .33 + py; P[4] = n.x + dx * .7 + px * .6; P[5] = n.y + dy * .7 + py * .6; P[6] = c.x; P[7] = c.y;
        n.ln.setAttribute('d', 'M' + P[0].toFixed(1) + ' ' + P[1].toFixed(1) + 'C' + P[2].toFixed(1) + ' ' + P[3].toFixed(1) + ' ' + P[4].toFixed(1) + ' ' + P[5].toFixed(1) + ' ' + P[6].toFixed(1) + ' ' + P[7].toFixed(1));
        var lut = n.lutBuf, acc = 0, qx = P[0], qy = P[1], e0 = lut[0];
        e0[0] = 0; e0[1] = P[0]; e0[2] = P[1];
        for (var i = 1; i <= 24; i++) {
          var u = i / 24, m = 1 - u, a = m * m * m, b2 = 3 * m * m * u, c2 = 3 * m * u * u, d2 = u * u * u;
          var x = a * P[0] + b2 * P[2] + c2 * P[4] + d2 * P[6], y = a * P[1] + b2 * P[3] + c2 * P[5] + d2 * P[7];
          acc += Math.hypot(x - qx, y - qy); var e = lut[i]; e[0] = acc; e[1] = x; e[2] = y; qx = x; qy = y;
        }
        n.lut = lut;
      });
    }
    // point at arc-length fraction f along a link (0 = satellite end, 1 = centre end)
    var AT = [0, 0];
    function at(lut, f) {
      var s = f * lut[lut.length - 1][0], i = 1;
      while (i < lut.length - 1 && lut[i][0] < s) i++;
      var A = lut[i - 1], B = lut[i], k = (s - A[0]) / ((B[0] - A[0]) || 1);
      AT[0] = A[1] + (B[1] - A[1]) * k; AT[1] = A[2] + (B[2] - A[2]) * k; return AT;
    }
    // trapezoidal velocity: eases in over the first 15 %, constant speed, eases out over the last 15 %
    function trap(k) { var a = .15, v = 1 / (1 - a); if (k < a) return v * k * k / (2 * a); if (k > 1 - a) return 1 - v * (1 - k) * (1 - k) / (2 * a); return v * (k - a / 2); }
    var si = 0, MAXP = 2;
    function spawn() {
      var c = centre(), s = N.filter(function (n) { return n !== c && !n.tw && n.lut; });
      for (var tries = 0; tries < s.length; tries++) {
        var n = s[si++ % s.length];
        if (packets.filter(function (p) { return p.link === n; }).length >= MAXP) continue;
        var toC = (si % 3) !== 0, labs = toC ? n.to : n.from, el = document.createElement('span');
        el.className = 'hm-pk' + (toC ? '' : ' back'); el.textContent = labs[(si >> 1) % labs.length];
        ex.appendChild(el);
        packets.push({ el: el, link: n, a: toC ? n : c, b: toC ? c : n, toC: toC, k: 0, fade: 0, op: 1, x: null, y: null });
        return;
      }
    }
    function step(dt) {
      for (var i = packets.length - 1; i >= 0; i--) {
        var p = packets[i], lut = p.link.lut;
        if (!lut || p.link.tw) p.fade = 1;
        var len = lut ? lut[lut.length - 1][0] : 200, dur = Math.max(1.1, Math.min(2.8, len / (small ? 110 : 170)));
        p.k = Math.min(1, p.k + dt / dur);
        var f = trap(p.k); if (!p.toC) f = 1 - f;
        if (lut) { var q = at(lut, f); p.x = q[0]; p.y = q[1]; } // at() returns the shared AT pair
        if (p.fade) p.op = Math.max(0, p.op - dt / .3);
        p.el.style.opacity = (Math.max(0, Math.min(1, p.k / .12, (1 - p.k) / .12)) * p.op).toFixed(3);
        if (p.x != null) p.el.style.transform = 'translate3d(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px,0) translate(-50%,-50%)';
        if (p.k >= 1 || p.op <= 0) {
          if (p.k >= 1 && p.toC && p.b === centre() && p.b.det) {
            var o = p.b.det.querySelectorAll('li')[si % 3]; o.classList.add('hot'); hotT.push(setTimeout(function () { o.classList.remove('hot'); }, 450)); // PORT: tracked
          }
          p.el.remove(); packets.splice(i, 1);
        }
      }
    }
    size();
    var t = 0;
    N.forEach(function (n) { var h = home(n, 0); n.x = h.x; n.y = h.y; n.s = n === centre() ? CS : 1; n.d = n === centre() ? 1 : 0; });
    byId.vides.ln.classList.add('main');
    var rzT = 0;
    function onResize() { clearTimeout(rzT); rzT = setTimeout(function () { size(); place(t, 0); }, 120); } // PORT: named so stop() can remove it
    addEventListener('resize', onResize);
    var hotT = []; // PORT: pending 'hot' highlight timers
    cleanups.push(function () { removeEventListener('resize', onResize); clearTimeout(rzT); hotT.forEach(clearTimeout); }); // PORT
    place(0, 0);
    if (reduce) return;
    var vis = false, raf = 0, last = 0, nextSwap = SWAP, spawnT = 0;
    function loop(now) {
      raf = 0;
      if (!vis || document.hidden || covered()) return;   // offscreen, hidden tab or demo modal open: the loop stops until wake()
      raf = requestAnimationFrame(loop);
      var dt = last ? Math.min(.05, (now - last) / 1000) : 0; last = now; t += dt;
      if (t >= nextSwap) { nextSwap += SWAP; swap(t); }
      place(t, dt);
      spawnT += dt; if (spawnT > .45) { spawnT = 0; spawn(); }
      step(dt);
    }
    function covered() { return !!(window.INFRAX && INFRAX.covered); }
    function wake() { if (!stopped && vis && !document.hidden && !covered() && !raf) { // PORT: !stopped
      last = 0; raf = requestAnimationFrame(loop); } }
    var exIO = new IntersectionObserver(function (e) { vis = e[0].isIntersecting; wake(); }); exIO.observe(ex); // PORT: kept for stop()
    document.addEventListener('visibilitychange', wake); document.addEventListener('infrax:cover', wake);
    var stopped = false;
    cleanups.push(function () { // PORT: cleanup for client-side navigation away
      stopped = true; cancelAnimationFrame(raf); raf = 0; exIO.disconnect();
      document.removeEventListener('visibilitychange', wake); document.removeEventListener('infrax:cover', wake);
    });
  })();
})();

// PORT: cleanup for client-side navigation away from this page
return function stop() { cleanups.forEach(function (fn) { fn(); }); cleanups.length = 0; };
}

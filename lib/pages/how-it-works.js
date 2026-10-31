// How it works page script: the inline <script> of site/src/how-it-works.html, unchanged inside init() except where marked
// "PORT:". usePage('how-it-works', init) runs it once the page markup is mounted (after the shared per-page runtime); the
// returned function stops it when the visitor navigates away: rAF loops, timers, observers, document listeners, the
// gsap.matchMedia, tweens started later from callbacks, and both WebGL renderers (disposed, context lost).
// GSAP tweens and ScrollTriggers created synchronously here are also reverted by usePage's gsap.context.
import { installThree } from '@/lib/three-global';

export function init(){
installThree(); // PORT: window.THREE from the npm three (the static page loaded it from a CDN)
'use strict';
var X=window.INFRAX||{}, reduce=!!X.reduce, hasGsap=!!(window.gsap&&window.ScrollTrigger);
function $(s,r){return (r||document).querySelector(s);} function $$(s,r){return [].slice.call((r||document).querySelectorAll(s));}
function clamp(v,a,b){return Math.max(a===undefined?0:a,Math.min(b===undefined?1:b,v));}
function ease(x){x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}
function easeBack(x){x=clamp(x);var c1=1.4,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2);}
var MQ=X.mq||{}, mq=function(q){ return !!(window.matchMedia&&matchMedia(q).matches); };
var mobile=mq(MQ.laptop||'(max-width:1024px)'), low=mq(MQ.tablet||'(max-width:768px)');
var lite=X.lite!==undefined?!!X.lite:mq('(max-width:768px),(pointer:coarse)'); // lighter GL: no AA, DPR 1
function covered(){ return !!(window.INFRAX&&INFRAX.covered); }
var stopped=false, observers=[], addedNoGl=false; // PORT: kept so stop() can undo them

/* ---------- WebGL helpers ---------- */
var glOK=(function(){ if(!window.THREE) return false; try{ var c=document.createElement('canvas'); return !!(c.getContext('webgl')||c.getContext('experimental-webgl')); }catch(e){ return false; } })();
if(!glOK){ if(!document.documentElement.classList.contains('no-gl')) addedNoGl=true; document.documentElement.classList.add('no-gl'); } // PORT: remember we added it

var T=window.THREE, UP=glOK? new T.Vector3(0,1,0):null, M=null, stages=[], clockT=0;
// loop handles are declared up front: size() and the diagram call wake() before the loop code below runs
var raf=0, lost=false, last=performance.now(), distOn=false, distRaf=0;
function mats(){
  if(M) return M;
  M={ white:new T.MeshStandardMaterial({color:0xffffff,roughness:.9}), light:new T.MeshStandardMaterial({color:0xeaf1f8,roughness:.95}),
      road:new T.MeshStandardMaterial({color:0xdbe4ee,roughness:1}), mark:new T.MeshBasicMaterial({color:0xffffff}),
      blue:new T.MeshStandardMaterial({color:0x2673b5,roughness:.55}), navy:new T.MeshStandardMaterial({color:0x0e3b66,roughness:.5}),
      tree:new T.MeshStandardMaterial({color:0xcfe0ef,roughness:1,flatShading:true}),
      edge:new T.LineBasicMaterial({color:0x8fb3d6,transparent:true,opacity:.55}), edgeBlue:new T.LineBasicMaterial({color:0x2673b5,transparent:true,opacity:.85}) };
  return M;
}
var GEO={};
function boxGeo(w,h,d){ var k=w+'|'+h+'|'+d; return GEO[k]||(GEO[k]=new T.BoxGeometry(w,h,d)); }
function box(p,w,h,d,x,y,z,mat,edges,ry){ var g=boxGeo(w,h,d), m=new T.Mesh(g,mat||mats().white); m.position.set(x,y,z); if(ry) m.rotation.y=ry; p.add(m);
  if(edges!==false){ var e=new T.LineSegments(new T.EdgesGeometry(g,25),mats().edge); e.position.copy(m.position); e.rotation.copy(m.rotation); p.add(e); } return m; }
function cyl(p,r,h,x,y,z,mat,seg){ var m=new T.Mesh(new T.CylinderGeometry(r,r,h,seg||72),mat||mats().white); m.position.set(x,y,z); p.add(m); return m; }
function rim(r,y,color,op){ var pts=[]; for(var i=0;i<=128;i++){ var a=i/128*Math.PI*2; pts.push(new T.Vector3(Math.cos(a)*r,y,Math.sin(a)*r)); } return new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:color,transparent:true,opacity:op})); }
function shadowPlane(size,y){ var c=document.createElement('canvas'); c.width=c.height=256; var x=c.getContext('2d'); var g=x.createRadialGradient(128,128,30,128,128,128); g.addColorStop(0,'rgba(14,59,102,0.07)'); g.addColorStop(.45,'rgba(14,59,102,0.02)'); g.addColorStop(.7,'rgba(14,59,102,0)'); x.fillStyle=g; x.fillRect(0,0,256,256);
  var m=new T.Mesh(new T.PlaneGeometry(size,size),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false})); m.rotation.x=-Math.PI/2; m.position.y=y; return m; }
function lights(s){ s.add(new T.HemisphereLight(0xffffff,0xd9e6f3,1.0)); var d=new T.DirectionalLight(0xffffff,.55); d.position.set(8,14,6); s.add(d); }
function cone(r,h){ var g=new T.ConeGeometry(r,h,24,1,true); g.translate(0,-h/2,0); return new T.Mesh(g,new T.MeshBasicMaterial({color:0x2673b5,transparent:true,opacity:.1,depthWrite:false,side:T.DoubleSide})); }
function tree(p,x,z){ box(p,.05,.32,.05,x,.16,z,mats().white,false); var t=new T.Mesh(new T.IcosahedronGeometry(.22,0),mats().tree); t.position.set(x,.44,z); p.add(t); }
/* wave particles: per-point alpha + size, soft round sprite */
function waveMaterial(color,size){
  return new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uColor:{value:new T.Color(color)},uSize:{value:size*Math.min(devicePixelRatio||1,2)}},
    vertexShader:'attribute float aA;varying float vA;uniform float uSize;void main(){vA=aA;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=uSize*(150.0/-mv.z);gl_Position=projectionMatrix*mv;}',
    fragmentShader:'uniform vec3 uColor;varying float vA;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.15,d)*vA;if(a<.01)discard;gl_FragColor=vec4(uColor,a);}'});
}
function makePoints(n,color,size){ var g=new T.BufferGeometry(); g.setAttribute('position',new T.BufferAttribute(new Float32Array(n*3),3)); g.setAttribute('aA',new T.BufferAttribute(new Float32Array(n),1)); var p=new T.Points(g,waveMaterial(color,size)); p.frustumCulled=false; return p; }

function makeStage(el,scene,fov){
  var canvas=el.querySelector('canvas');
  var r=new T.WebGLRenderer({canvas:canvas,antialias:true,alpha:true,powerPreference:lite?'default':'high-performance'});
  r.setPixelRatio(Math.min(devicePixelRatio||1,2)); r.debug.checkShaderErrors=false; r.setClearColor(0,0);
  var cam=new T.PerspectiveCamera(fov,1,.1,200);
  var st={el:el,r:r,cam:cam,scene:scene,w:1,h:1,visible:true,rig:{az:.7,polar:1,dist:24,ty:1},pre:null,post:null};
  // skip unchanged sizes: setSize reallocates the drawing buffer even for the same value
  function size(){ var b=el.getBoundingClientRect(), w=Math.max(1,Math.round(b.width)), h=Math.max(1,Math.round(b.height)); if(st.sized&&w===st.w&&h===st.h) return;
    st.sized=true; st.w=w; st.h=h; r.setSize(w,h,false); cam.aspect=w/h; cam.updateProjectionMatrix(); wake(); }
  // PORT: observers kept in `observers` for stop()
  if(window.ResizeObserver){ var ro=new ResizeObserver(size); ro.observe(el); observers.push(ro); } size();
  var io=new IntersectionObserver(function(es){ st.visible=es[0].isIntersecting; if(st.visible) wake(); },{rootMargin:'120px'}); io.observe(el); observers.push(io);
  // PORT: stop() forces the context loss itself; that must not flag the page as no-gl
  canvas.addEventListener('webglcontextlost',function(e){ if(stopped) return; e.preventDefault(); lost=true; if(!document.documentElement.classList.contains('no-gl')) addedNoGl=true; if(raf){ cancelAnimationFrame(raf); raf=0; } document.documentElement.classList.add('no-gl'); });
  // shaders link in the background first (site.js warmGL); the stage joins the loop once they are ready
  st.ready=!X.warmGL; if(X.warmGL) X.warmGL(r,scene,cam,function(){ if(stopped) return; st.ready=true; wake(); }); // PORT: ignore a late callback after stop()
  stages.push(st); return st;
}
function rig(st){ var g=st.rig,c=st.cam; c.position.set(Math.sin(g.polar)*Math.sin(g.az)*g.dist, g.ty+Math.cos(g.polar)*g.dist, Math.sin(g.polar)*Math.cos(g.az)*g.dist); c.lookAt(0,g.ty,0); }
var PV=glOK? new T.Vector3():null;
function place(st,v,el,dy){ PV.copy(v).project(st.cam); var x=(PV.x*.5+.5)*st.w, y=(-PV.y*.5+.5)*st.h+(dy||0);
  var w=el.offsetWidth||80, h=el.offsetHeight||24; x=clamp(x-w/2,8,st.w-w-8); y=clamp(y-h/2,8,st.h-h-8);
  el.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px)'; return PV.z<1; }

/* =====================================================================
   SCENE 1 · the layer stack
   p 0..0.15 mixed-site platter, data rising as loose waves
   p 0.15..0.6 detect (AI at site) + control-room layers rise out of the platter
   p 0.55..0.9 waves fuse into one steady stream; final stacked diagram
   ===================================================================== */
function buildStack(){
  var Mt=mats(), scene=new T.Scene(); lights(scene);
  var L0=new T.Group(), L1=new T.Group(), L2=new T.Group(); scene.add(L0,L1,L2);
  // platter
  cyl(L0,6.2,.36,0,-.18,0,Mt.white,96); cyl(L0,6.0,.42,0,-.55,0,Mt.light,96); L0.add(rim(6.2,.001,0x2673b5,.6)); L0.add(rim(6.05,-.76,0x8fb3d6,.45));
  scene.add(shadowPlane(20,-1.05));
  // highway band
  box(L0,12.1,.03,1.7,0,.016,0,Mt.road,false);
  for(var x=-5.6;x<5.8;x+=.9){ box(L0,.4,.012,.04,x,.036,-.42,Mt.mark,false); box(L0,.4,.012,.04,x,.036,.42,Mt.mark,false); }
  // camera gantry (highway) x=-2.4: two IP cameras, a radar unit, and the AI box on the gantry leg
  [-1.0,1.0].forEach(function(z){ box(L0,.12,1.55,.12,-2.4,.78,z); }); box(L0,.14,.14,2.2,-2.4,1.55,0);
  [-.7,-.15].forEach(function(z){ box(L0,.24,.13,.16,-2.28,1.45,z); box(L0,.04,.07,.09,-2.15,1.45,z,Mt.blue,false); });
  box(L0,.12,.18,.2,-2.26,1.42,.42,Mt.navy,false); box(L0,.02,.13,.15,-2.19,1.42,.42,Mt.blue,false); // radar
  box(L0,.24,.36,.2,-2.4,.5,1.2,Mt.light); var aiLed=box(L0,.02,.04,.12,-2.27,.58,1.2,new T.MeshBasicMaterial({color:0x2673b5}),false); // AI box on the gantry
  // LED message sign gantry x=3.0 (the road sign the control room writes to)
  [-1.0,1.0].forEach(function(z){ box(L0,.1,1.5,.1,3.0,.75,z); }); box(L0,.12,.12,2.2,3.0,1.5,0);
  box(L0,.1,.46,1.4,3.02,1.22,0,Mt.navy,false);
  var signMat=new T.MeshBasicMaterial({color:0x1b5a94}); var signFace=box(L0,.02,.36,1.28,2.96,1.22,0,signMat,false);
  // emergency call boxes on both shoulders
  var callBoxes=[[.9,1.15],[-4.7,-1.15]].map(function(p){ box(L0,.11,.46,.11,p[0],.23,p[1],Mt.white); box(L0,.14,.08,.14,p[0],.5,p[1],Mt.blue,false);
    var ring=new T.Mesh(new T.TorusGeometry(.2,.012,6,40),new T.MeshBasicMaterial({color:0x2673b5,transparent:true,opacity:0})); ring.rotation.x=Math.PI/2; ring.position.set(p[0],.56,p[1]); L0.add(ring); return ring; });
  // city junction (-3.1,-3.2)
  var cx=-3.0, cz=-3.25;
  box(L0,3.6,.025,.55,cx,.02,cz,Mt.road,false); box(L0,.55,.025,3.4,cx,.02,cz,Mt.road,false);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q,k){ var hs=[1.6,.9,1.2,2.1]; box(L0,.95,hs[k],.95,cx+q[0]*1.0,hs[k]/2,cz+q[1]*1.0); });
  box(L0,.03,.9,.03,cx+.42,.45,cz+.42,Mt.white,false); box(L0,.18,.1,.1,cx+.42,.92,cz+.42);
  // industrial site (warehouse) north-east, with a pole camera
  box(L0,2.2,.7,1.1,2.6,.35,-3.45); for(var sx=1.65;sx<3.6;sx+=.42){ box(L0,.34,.12,1.1,sx,.76,-3.45,Mt.light); }
  box(L0,.03,1.1,.03,3.9,.55,-3.1,Mt.white,false); box(L0,.18,.1,.1,3.9,1.16,-3.1);
  // roadside cabinet with the AI box (south shoulder), beside a pole camera
  box(L0,.42,.52,.32,2.45,.26,2.0,Mt.light); var cabLed=box(L0,.02,.05,.2,2.24,.4,2.0,new T.MeshBasicMaterial({color:0x2673b5}),false);
  box(L0,.03,.8,.03,1.85,.4,2.0,Mt.white,false); box(L0,.18,.1,.1,1.85,.84,2.0);
  [[3.4,3.4],[4.2,2.6],[2.9,4.3]].forEach(function(t){ tree(L0,t[0],t[1]); });
  // campus (-3.1, 3.2)
  box(L0,1.6,.9,.8,-3.6,.45,2.8); box(L0,.8,1.4,.9,-2.2,.7,3.5); box(L0,1.2,.6,.7,-3.2,.3,4.2); box(L0,1.25,.04,.72,-3.2,.62,4.2,Mt.blue,false);
  [[-4.6,3.8],[-4.4,2.0],[-1.5,2.3],[-1.6,4.5]].forEach(function(t){ tree(L0,t[0],t[1]); });
  box(L0,.03,.8,.03,-1.9,.4,2.25,Mt.white,false); box(L0,.18,.1,.1,-1.9,.84,2.25);
  [[-5.3,-1.6],[5.3,-1.6],[5.2,1.7],[-.5,-2.2],[.4,2.6]].forEach(function(t){ tree(L0,t[0],t[1]); });

  // capture sources: [x,y,z,isCamera]. Radar and call boxes send data too, but have no view cone.
  var SRC=[[-2.28,1.45,-.7,1],[-2.28,1.45,-.15,1],[-2.26,1.42,.42,0],[.9,.5,1.15,0],[-4.7,.5,-1.15,0],[cx+.42,.92,cz+.42,1],[3.9,1.16,-3.1,1],[1.85,.84,2.0,1],[-1.9,.84,2.25,1]];
  var cams=SRC.map(function(c){ return new T.Vector3(c[0],c[1],c[2]); });
  var cones=[]; SRC.forEach(function(c,i){ if(!c[3]) return; var m=cone(.42,Math.max(.7,c[1]-.04)); m.position.copy(cams[i]); m.rotation.z=(i%2?.3:-.3); L0.add(m); cones.push(m); });
  // vehicles
  var NV=low?8:14, veh=new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshStandardMaterial({color:0xffffff,roughness:.6}),NV); L0.add(veh);
  var lanes=[-.62,-.22,.22,.62], V=[], col=new T.Color(), R=rnd(5);
  // one speed per lane + even spacing per lane: vehicles keep their gap and never overlap
  var LSP=[.85,1.15,1.1,.8], perLane=Math.ceil(NV/4);
  for(var i=0;i<NV;i++){ var tr=R()<.25, ln=i%4, slot=Math.floor(i/4); V.push({z:lanes[ln],dir:ln<2?-1:1,x:-5.6+(slot+.15+R()*.35)*(11.2/perLane),sp:LSP[ln],sx:tr?.75:.42,sy:tr?.28:.18,sz:tr?.26:.22}); veh.setColorAt(i,col.set(tr?(R()<.5?0x2673b5:0x0e3b66):(R()<.3?0xcfdcea:0xffffff))); }
  var dummy=new T.Object3D();
  // L1 edge layer
  cyl(L1,3.3,.18,0,0,0,Mt.light); L1.add(rim(3.3,.091,0x2673b5,.6));
  var edges=[];
  [0,1,2].forEach(function(k){ var a=k/3*Math.PI*2+.5, x=Math.cos(a)*1.85, z=Math.sin(a)*1.85; box(L1,.95,.3,.62,x,.25,z,Mt.white,true,-a); box(L1,.5,.04,.02,x+Math.cos(a)*.0,.27,z,Mt.blue,false,-a); edges.push(new T.Vector3(x,.3,z)); });
  // L2 one control room: a video wall, a console desk and an operator who confirms each step
  var hx=new T.Mesh(new T.CylinderGeometry(2.5,2.5,.16,6),Mt.white); L2.add(hx); L2.add(new T.LineSegments(new T.EdgesGeometry(hx.geometry),Mt.edgeBlue));
  var wallMats=[];
  [[0,-.9,0],[-.95,-.5,.55],[.95,-.5,-.55]].forEach(function(p){ var wm=new T.MeshStandardMaterial({color:0x0e3b66,roughness:.5}); wallMats.push(wm); box(L2,1.1,.62,.05,p[0],.45,p[1],wm,false,p[2]); });
  box(L2,1.5,.28,.5,0,.22,.55,Mt.white); box(L2,.5,.22,.03,-.32,.47,.42,Mt.navy,false); box(L2,.5,.22,.03,.32,.47,.42,Mt.navy,false);
  var op=new T.Group(); var body=new T.Mesh(new T.CylinderGeometry(.12,.16,.42,16),Mt.blue); body.position.y=.29; op.add(body);
  var head=new T.Mesh(new T.SphereGeometry(.1,16,12),Mt.white); head.position.y=.6; op.add(head); op.position.set(0,.08,1.05); L2.add(op);
  var ring=new T.Mesh(new T.TorusGeometry(2.95,.02,6,96),new T.MeshBasicMaterial({color:0x2673b5})); ring.rotation.x=Math.PI/2; L2.add(ring);
  var ring2=new T.Mesh(new T.TorusGeometry(3.25,.01,6,96),new T.MeshBasicMaterial({color:0x5a9fd4,transparent:true,opacity:.6})); ring2.rotation.x=Math.PI/2; L2.add(ring2);
  // trunk line (appears as the stream fuses)
  var trunkMat=new T.LineBasicMaterial({color:0x2673b5,transparent:true,opacity:0});
  var trunk=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0,0,0),new T.Vector3(0,1,0)]),trunkMat); scene.add(trunk);
  // particles
  var NP=low?170:380, pts=makePoints(NP,0x2673b5,low?.9:1.05); scene.add(pts);
  var PP=pts.geometry.attributes.position.array, PA=pts.geometry.attributes.aA.array, D=[];
  for(var q=0;q<NP;q++) D.push({c:q%cams.length,e:q%3,o:R(),sp:.14+R()*.1,ph:R()*6.283});
  var a=new T.Vector3(), b=new T.Vector3(), w=new T.Vector3(), base=new T.Vector3();
  var state={p:0,y1:.2,y2:.2,link:'up',queued:0};
  var signCol=new T.Color(), cA=new T.Color(0x1b5a94), cB=new T.Color(0x5a9fd4), wA=new T.Color(0x0e3b66), wB=new T.Color(0x2673b5);
  function update(t,dt,p){
    var sep=ease(clamp((p-.12)/.48)), fuse=ease(clamp((p-.52)/.36));
    // link cycle (only once the layers stand): up 0-5s, down 5-7.6s (site keeps reading, reads queue), sync 7.6-8.8s
    var cyc=t%10, link='up', queued=0;
    if(sep>.6){ if(cyc>5&&cyc<7.6){ link='down'; queued=Math.floor((cyc-5)*9); } else if(cyc>=7.6&&cyc<8.8){ link='sync'; queued=23; } }
    state.link=link; state.queued=queued;
    var down=link==='down', burst=link==='sync';
    // act: every 10s the operator confirms and the road sign + wall respond (after sync)
    var act=sep>.6? Math.max(0,1-Math.abs(cyc-9.3)/.7):0;
    signFace.material.color.copy(signCol.copy(cA).lerp(cB,act));
    wallMats[0].color.copy(signCol.copy(wA).lerp(wB,Math.max(act,burst?.6:0)));
    op.rotation.y=Math.sin(t*.4)*.25; op.position.y=.08+act*.04;
    aiLed.material.color.setHex(down?0x8fb3d6:0x2673b5); cabLed.material.color.setHex(down&&Math.floor(t*4)%2?0x8fb3d6:0x2673b5);
    callBoxes.forEach(function(r,i){ var ph=((t*.5+i*.5)%1); r.scale.setScalar(1+ph*2.2); r.material.opacity=(1-ph)*.7*(Math.sin(t*.3+i*2)>.2?1:0); });
    var y1=.15+sep*3.6, y2=.15+sep*7.1; state.y1=y1; state.y2=y2;
    L1.position.y=y1; L2.position.y=y2; L1.scale.setScalar(Math.max(.001,easeBack(sep))); L2.scale.setScalar(Math.max(.001,easeBack(clamp(sep*1.25-.15))));
    L0.rotation.y=t*.03; L1.rotation.y=-t*.025; ring.rotation.z=t*.25; ring2.rotation.z=-t*.15;
    for(var i=0;i<NV;i++){ var v=V[i]; v.x+=v.dir*v.sp*dt; if(v.x>5.7)v.x=-5.7; if(v.x<-5.7)v.x=5.7; dummy.position.set(v.x,.04+v.sy/2,v.z); dummy.scale.set(v.sx,v.sy,v.sz); dummy.updateMatrix(); veh.setMatrixAt(i,dummy.matrix); }
    veh.instanceMatrix.needsUpdate=true;
    cones.forEach(function(c,i){ c.material.opacity=.06+.07*(.5+.5*Math.sin(t*2+i)); });
    trunk.geometry.attributes.position.setXYZ(0,0,y1+.2,0); trunk.geometry.attributes.position.setXYZ(1,0,y2-.1,0); trunk.geometry.attributes.position.needsUpdate=true;
    trunkMat.opacity=down? .12*fuse*(Math.floor(t*3)%2) : .55*fuse*(burst?1.6:1);
    var node=y2+.1, rot0=L0.rotation.y, rot1=L1.rotation.y;
    for(var k=0;k<NP;k++){
      var d=D[k], s=(t*d.sp+d.o)%1;
      a.copy(cams[d.c]).applyAxisAngle(UP,rot0);
      // loose wave wisps rising from each camera
      w.set(a.x+Math.sin(s*7+t*1.6+d.ph)*.3*s, a.y+s*2.6, a.z+Math.cos(s*6+t*1.3+d.ph)*.3*s);
      var wa=Math.sin(s*Math.PI)*.85;
      // the routed stream: capture -> AI at the site -> control room
      b.copy(edges[d.e]).multiplyScalar(Math.max(.001,sep)).applyAxisAngle(UP,rot1); b.y=y1+.3;
      var A=.55*(1-fuse)+.03, kk, off;
      if(s<.55){ kk=s/.55; base.copy(a).lerp(b,kk); base.y+=Math.sin(kk*Math.PI)*1.1*(1-fuse*.6); off=Math.sin(kk*Math.PI)*Math.sin(kk*10-t*3+d.ph)*A; }
      else { kk=(s-.55)/.45; base.copy(b).lerp(w.set(0,node,0),kk); var pull=fuse*ease(clamp(kk*2.2)); base.x*=1-pull; base.z*=1-pull; if(kk<.5){ /* keep wisps local */ }
        off=Math.sin(kk*Math.PI)*Math.sin(kk*9-t*3+d.ph)*A*.8; w.set(a.x+Math.sin(s*7+t*1.6+d.ph)*.3*s, a.y+s*2.6, a.z+Math.cos(s*6+t*1.3+d.ph)*.3*s); }
      base.x+=Math.cos(d.ph)*off; base.z+=Math.sin(d.ph)*off;
      var pa=Math.sin(clamp(s*6)*Math.PI*.5)*Math.sin(clamp((1-s)*6)*Math.PI*.5)*.9;
      // link down: reads still flow camera -> AI at site, but nothing leaves the site (queued); on sync they rush up
      if(s>=.55){ if(down) pa=0; else if(burst) pa=Math.min(1,pa*1.6); }
      PP[k*3]=w.x+(base.x-w.x)*sep; PP[k*3+1]=w.y+(base.y-w.y)*sep; PP[k*3+2]=w.z+(base.z-w.z)*sep;
      PA[k]=wa*(1-sep)+pa*sep;
    }
    pts.geometry.attributes.position.needsUpdate=true; pts.geometry.attributes.aA.needsUpdate=true;
  }
  var dom=[['Camera gantry + radar',-2.4,1.75,0],['LED message sign',3.0,1.75,0],['Call box',.9,.75,1.15],['City junction',cx,2.2,cz],['Warehouse',2.6,1.1,-3.45],['AI box on site',2.45,.75,2.0],['Campus',-2.2,1.6,3.5]].map(function(d){ return {name:d[0],v:new T.Vector3(d[1],d[2],d[3])}; });
  return {scene:scene,update:update,state:state,dom:dom,L0:L0};
}
function rnd(seed){ return function(){ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; }; }

/* =====================================================================
   SCENE 2 · federation ring
   ===================================================================== */
var FED=[
  {id:'highways',name:'Highway enforcement',sub:'Gantries with cameras and radar',mods:'Dhrishya on the gantry · Plexus (ATMS / ICCC)',
    keep:['IP cameras on every gantry','Gantry radar','The AI box on the gantry, which keeps reading when the link drops'],
    share:[['Plate read and vehicle class for every vehicle','live'],['Watchlist alerts with images','live'],['Radar speed and overspeed cases for e-challan review','live'],['Wrong-way and stopped-vehicle alerts','live']]},
  {id:'signs',name:'Highway monitoring',sub:'Cameras and LED message signs',mods:'Plexus (ATMS / ICCC) · Cygnus',
    keep:['IP cameras along the carriageway','LED message signs on gantries','Recording at the site'],
    share:[['Incidents opened with video attached',''],['Messages sent to the road signs from the control room',''],['Camera tamper: blinded, moved or stream dropped','live']]},
  {id:'callboxes',name:'Emergency call boxes',sub:'One button on the roadside',mods:'AstraAlert',
    keep:['A call box every few kilometres','Power, battery, solar and door sensors'],
    share:[['Each call, located on the map and recorded',''],['Box health before it fails someone',''],['Optional AI voice summary for the operator to confirm','']]},
  {id:'cities',name:'City junctions',sub:'Police and city security teams',mods:'Cygnus',
    keep:['Junction and street IP cameras','Recording on your servers'],
    share:[['Watchlisted vehicle alerts','live'],['Plate search and vehicle journeys','live'],['A vehicle followed from camera to camera','live']]},
  {id:'campuses',name:'Campus',sub:'One security team, many buildings',mods:'Cygnus · Toran',
    keep:['Gate and building IP cameras','Live walls for the security desk'],
    share:[['Vehicle plate reads at every gate','live'],['Camera tamper & health','live'],['People counting and zone intrusion','live']]},
  {id:'industrial',name:'Warehouse',sub:'Gate, dock and yard security',mods:'Cygnus · Toran',
    keep:['Gate and perimeter IP cameras','Recording with clip export'],
    share:[['Gate plate reads and plate journeys','live'],['Camera tamper & health','live'],['Zone intrusion and line crossing','live']]}
];
function buildFed(){
  var Mt=mats(), scene=new T.Scene(); lights(scene);
  var root=new T.Group(); scene.add(root); // no contact shadow: the stage shows the page background
  // hub
  var hub=new T.Group(); var hx=new T.Mesh(new T.CylinderGeometry(1.5,1.5,.16,6),Mt.white); hub.add(hx); hub.add(new T.LineSegments(new T.EdgesGeometry(hx.geometry),Mt.edgeBlue));
  box(hub,.9,.5,.05,0,.33,-.5,Mt.navy,false); box(hub,.6,.38,.05,.55,.27,.3,Mt.navy,false,-1.0);
  var hr=new T.Mesh(new T.TorusGeometry(1.9,.02,6,96),new T.MeshBasicMaterial({color:0x2673b5})); hr.rotation.x=Math.PI/2; hub.add(hr);
  hub.position.y=1.1; root.add(hub);
  var RAD=low?5.2:6.2, P=[], discs=[];
  FED.forEach(function(f,i){
    var g=new T.Group(); var d=cyl(g,1.5,.2,0,-.1,0,Mt.white,64); d.userData.i=i; discs.push(d); var rl=rim(1.5,.001,0x5a9fd4,.7); g.add(rl);
    mini(g,f.id); var a=i/6*Math.PI*2-Math.PI/2; var tgt=new T.Vector3(Math.cos(a)*RAD,0,Math.sin(a)*RAD);
    root.add(g); P.push({g:g,tgt:tgt,rim:rl});
  });
  // wave links + particles flowing up to the hub
  var curves=P.map(function(p){ var a=p.tgt.clone(); a.y=.35; var c=new T.Vector3(0,1.15,0); var m=a.clone().add(c).multiplyScalar(.5); m.y+=2.2; return new T.QuadraticBezierCurve3(a,m,c); });
  var linkMats=[], links=curves.map(function(cv){ var mm=new T.LineDashedMaterial({color:0x2673b5,dashSize:.18,gapSize:.14,transparent:true,opacity:.35}); linkMats.push(mm); var l=new T.Line(new T.BufferGeometry().setFromPoints(cv.getPoints(48)),mm); l.computeLineDistances(); root.add(l); return l; });
  var PER=low?16:26, NP=PER*6, pts=makePoints(NP,0x2673b5,low?1.0:1.15); root.add(pts);
  var PP=pts.geometry.attributes.position.array, PA=pts.geometry.attributes.aA.array, R=rnd(9), D=[];
  for(var q=0;q<NP;q++) D.push({l:Math.floor(q/PER),o:R(),sp:.16+R()*.1,ph:R()*6.283});
  var tmp=new T.Vector3(), tan=new T.Vector3(), side=new T.Vector3();
  var st={k:0,sel:-1,hover:-1};
  function update(t,dt){
    var k=st.k, cur=st.hover>-1?st.hover:st.sel;
    root.rotation.y=t*.025; hub.rotation.y=-t*.1; hr.rotation.z=t*.3;
    P.forEach(function(p,i){ var kk=easeBack(clamp(k*1.7-i*.12)); p.g.position.copy(p.tgt).multiplyScalar(Math.max(.001,clamp(kk,0,1.2))); p.g.scale.setScalar(Math.max(.001,kk));
      var lift=(i===cur)?.35:0; p.g.position.y+=lift; p.rim.material.opacity=i===cur?1:.55; linkMats[i].opacity=(i===cur?.9:.3)*clamp(k*1.5-.3); });
    for(var j=0;j<NP;j++){
      var d=D[j], s=(t*d.sp*(d.l===cur?1.6:1)+d.o)%1, cv=curves[d.l];
      cv.getPoint(s,tmp); cv.getTangent(s,tan); side.set(-tan.z,0,tan.x).normalize();
      var A=(d.l===cur? .02 : .32)*Math.sin(s*Math.PI);
      var off=Math.sin(s*12-t*4+d.ph)*A; tmp.addScaledVector(side,off); tmp.y+=Math.cos(s*10-t*3+d.ph)*A*.5;
      PP[j*3]=tmp.x; PP[j*3+1]=tmp.y; PP[j*3+2]=tmp.z;
      PA[j]=Math.sin(s*Math.PI)*(cur<0?.75:(d.l===cur?1:.35))*clamp(k*1.5-.4);
    }
    pts.geometry.attributes.position.needsUpdate=true; pts.geometry.attributes.aA.needsUpdate=true;
  }
  return {scene:scene,root:root,update:update,st:st,P:P,discs:discs,hub:hub};
}
/* domain miniatures on a 1.5-radius platter */
function mini(g,id){
  var Mt=mats();
  if(id==='highways'){ box(g,2.7,.02,.8,0,.01,0,Mt.road,false); box(g,2.6,.01,.03,0,.026,0,Mt.mark,false);
    [-.48,.48].forEach(function(z){ box(g,.08,1.0,.08,-.3,.5,z); }); box(g,.1,.1,1.1,-.3,1.0,0); box(g,.06,.22,.5,-.32,.84,.2,Mt.navy,false); box(g,.16,.09,.1,-.22,.92,-.25);
    box(g,.4,.14,.2,.55,.08,-.2,Mt.white); box(g,.55,.2,.22,-.8,.11,.2,Mt.blue); }
  else if(id==='cities'){ box(g,2.6,.02,.42,0,.01,0,Mt.road,false); box(g,.42,.02,2.6,0,.01,0,Mt.road,false);
    [[-.75,-.75,.9],[.75,-.75,1.4],[-.75,.75,.6],[.75,.75,1.1]].forEach(function(b){ box(g,.7,b[2],.7,b[0],b[2]/2,b[1]); }); box(g,.03,.6,.03,.3,.3,.3,Mt.white,false); box(g,.14,.08,.08,.3,.62,.3); }
  else if(id==='signs'){ box(g,2.7,.02,.8,0,.01,0,Mt.road,false); box(g,2.6,.01,.03,0,.026,0,Mt.mark,false);
    [-.48,.48].forEach(function(z){ box(g,.07,.95,.07,.35,.47,z); }); box(g,.09,.09,1.1,.35,.95,0); box(g,.06,.3,.8,.33,.78,0,Mt.navy,false); box(g,.02,.24,.72,.3,.78,0,Mt.blue,false);
    box(g,.45,.15,.2,-.6,.09,.2,Mt.white); box(g,.6,.22,.22,.9,.12,-.2,Mt.blue); }
  else if(id==='callboxes'){ box(g,2.7,.02,.8,0,.01,0,Mt.road,false); box(g,2.6,.01,.03,0,.026,0,Mt.mark,false);
    [[-.9,.58],[0,-.58],[.9,.58]].forEach(function(q){ box(g,.1,.42,.1,q[0],.21,q[1],Mt.white); box(g,.13,.07,.13,q[0],.45,q[1],Mt.blue,false); }); box(g,.4,.14,.2,.3,.08,.18,Mt.white); }
  else if(id==='industrial'){ box(g,1.5,.6,.9,.25,.3,-.3); for(var x=-.4;x<.95;x+=.32) box(g,.26,.1,.9,x,.65,-.3,Mt.light); box(g,.3,.28,.28,-.85,.14,.55,Mt.light);
    box(g,.03,.7,.03,-.55,.35,.6,Mt.white,false); box(g,.14,.08,.08,-.55,.72,.6); box(g,.3,.32,.7,.5,.18,.75,Mt.blue); box(g,.28,.24,.22,.5,.14,.32,Mt.white); }
  else { box(g,.9,.8,.6,-.4,.4,-.3); box(g,.6,1.2,.6,.5,.6,-.2); box(g,.9,.45,.5,.1,.22,.6); box(g,.92,.03,.52,.1,.46,.6,Mt.blue,false); tree(g,-.95,.6); tree(g,.95,.65); tree(g,-1.0,-.8); }
}

/* ---------- wire everything up ---------- */
var stack=null, fed=null, st1=null, st2=null;
var stackP={v:reduce?1:0};
if(glOK){
  try{
    stack=buildStack(); st1=makeStage($('#hwStage'),stack.scene,32);
    fed=buildFed(); st2=makeStage($('#hwFedStage'),fed.scene,34);
  }catch(err){ console.warn(err); if(!document.documentElement.classList.contains('no-gl')) addedNoGl=true; document.documentElement.classList.add('no-gl'); glOK=false; } // PORT: remember we added it
}

/* labels for scene 1 */
var stageEl=$('#hwStage'), domLbls=[], layerLbls=[], linkEl=$('#hwLink'), linkNote=$('#hwLinkNote');
if(stack){
  stack.dom.forEach(function(d){ var el=document.createElement('span'); el.className='hw-lbl'; el.innerHTML='<b>●</b>'+d.name; stageEl.appendChild(el); domLbls.push(el); });
  [['Capture','IP cameras · gantry radar · call boxes'],['Detect · AI on site','plates · speed · alerts, even offline'],['Act · control room','your operator reviews and acts']].forEach(function(l){ var el=document.createElement('span'); el.className='hw-lbl layer'; el.innerHTML=l[0]+'<small>'+l[1]+'</small>'; stageEl.appendChild(el); layerLbls.push(el); });
}
var steps=$$('#hwSteps .hw-step'), phaseEl=$('#hwPhase'), barEl=$('#hwBar');
function setStep(p){
  var s=p<.3?0:p<.62?1:2; steps.forEach(function(el,i){ el.classList.toggle('on',i===s); });
  if(phaseEl) phaseEl.textContent=p<.12?'In the field':p<.55?'Capture and detect':p<.88?'Alert in the control room':'Operator reviews and acts';
  if(barEl) barEl.parentElement.style.setProperty('--p',p.toFixed(3));
}
setStep(stackP.v);
var LV=glOK? new T.Vector3():null;
if(st1){
  st1.post=function(){
    var p=stackP.v, sep=ease(clamp((p-.12)/.48));
    // site labels never overlap: top to bottom, each slides up or down by its own height until clear; one with no room hides (small phones)
    var dl=[], put=[], op=clamp(1-sep*2.2);
    stack.dom.forEach(function(d,i){ LV.copy(d.v).applyAxisAngle(UP,stack.L0.rotation.y); PV.copy(LV).project(st1.cam); var el=domLbls[i], w=el.offsetWidth||80, h=el.offsetHeight||24;
      dl.push({ el:el, x:clamp((PV.x*.5+.5)*st1.w-w/2,8,st1.w-w-8), y:(-PV.y*.5+.5)*st1.h-14-h/2, w:w, h:h }); });
    dl.sort(function(a,b){ return a.y-b.y; }).forEach(function(r){ var y0=r.y, offs=[0,-1,1,-2,2], ok=false;
      for(var k=0;k<offs.length&&!ok;k++){ r.y=clamp(y0+offs[k]*(r.h+4),8,st1.h-r.h-8); ok=!put.some(function(q){ return r.x<q.x+q.w+4&&q.x<r.x+r.w+4&&r.y<q.y+q.h+4&&q.y<r.y+r.h+4; }); }
      if(ok) put.push(r); r.el.style.transform='translate('+r.x.toFixed(1)+'px,'+r.y.toFixed(1)+'px)'; r.el.style.opacity=String(ok?op:0); });
    var ys=[0,stack.state.y1,stack.state.y2], rr=[6.3,3.4,2.7];
    layerLbls.forEach(function(el,i){ LV.set(rr[i],ys[i]+.1,0); place(st1,LV,el,0); el.style.opacity=String(i===0?clamp((sep-.3)*2.5):clamp((sep-.45-.1*i)*3)); });
    // link status chip + note in the Detect step
    var L=stack.state.link, txt=L==='down'?'Link down · still reading · '+stack.state.queued+' queued':L==='sync'?'Link back · '+stack.state.queued+' reads synced':'Link up · reads flowing';
    if(linkEl.textContent!==txt){ linkEl.textContent=txt; linkEl.className='hw-link'+(L==='down'?' down':L==='sync'?' sync':''); if(linkNote) linkNote.textContent=L==='down'?'Link down. The box keeps reading plates and queues them on site.':L==='sync'?'Link back. Every queued read syncs to the control room.':'Link up · reads sent to the control room as they happen.'; }
    linkEl.style.opacity=String(clamp((sep-.6)*4));
  };
}

/* stack scroll control: sticky on desktop (see .hw-pin CSS), scrub on mobile */
var pinST=null, mm=null; // PORT: mm hoisted so stop() can revert it
if(hasGsap&&!reduce){
  mm=gsap.matchMedia();
  mm.add('(min-width:1024.02px)',function(){
    var sec=document.getElementById('hwPin'), wrapEl=sec.querySelector('.wrap');
    pinST=ScrollTrigger.create({trigger:sec,start:function(){ return 'top '+((document.querySelector('.site-nav')||{}).offsetHeight||0)+'px'; },end:function(){ return '+='+Math.max(1,sec.offsetHeight-wrapEl.offsetHeight); },invalidateOnRefresh:true,onUpdate:function(s){ stackP.v=s.progress; setStep(s.progress); }});
    return function(){ pinST=null; };
  });
  mm.add('(max-width:1024px)',function(){
    ScrollTrigger.create({trigger:'#hwStage',start:'top 75%',end:'bottom top',scrub:.6,onUpdate:function(s){ stackP.v=clamp(s.progress*1.35); setStep(stackP.v); }});
  });
}
if(reduce) setStep(1);
// click a step to jump to it: on desktop the pinned section scrolls to that point (scroll and click stay in step); otherwise the scene animates there
var STEP_P=[.2,.5,.92];
function goStep(i){
  var p=STEP_P[i];
  if(pinST){ var y=pinST.start+(pinST.end-pinST.start)*p; if(X.lenis) X.lenis.scrollTo(y,{duration:1.1}); else scrollTo({top:y,behavior:reduce?'auto':'smooth'}); return; }
  if(hasGsap&&!reduce) gsap.to(stackP,{v:p,duration:1.1,ease:'power2.inOut',overwrite:true,onUpdate:function(){ setStep(stackP.v); }});
  else { stackP.v=p; setStep(p); wake(); }
}
steps.forEach(function(el,i){
  var h=el.querySelector('h3'); el.parentNode.setAttribute('role','none'); el.setAttribute('role','button'); el.tabIndex=0; el.setAttribute('aria-label','Show '+(h?h.textContent:'step '+(i+1)));
  el.addEventListener('click',function(){ goStep(i); });
  el.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); goStep(i); } });
});

/* federation interaction */
var list=$('#hwFedList'), card=$('#hwFedCard'), fedLbls=[], fedSel=0;
FED.forEach(function(f,i){ var li=document.createElement('li'); li.innerHTML='<button type="button" aria-pressed="false"><i></i>'+f.name+'</button>'; list.appendChild(li);
  li.firstChild.addEventListener('click',function(){ selectFed(i); }); });
var STL={live:'<span class="st st-live">Live</span>',req:'<span class="st st-live">Live</span>'};
function selectFed(i){
  fedSel=i; if(fed) fed.st.sel=i;
  $$('button',list).forEach(function(b,j){ b.setAttribute('aria-pressed',String(j===i)); });
  fedLbls.forEach(function(el,j){ el.classList.toggle('on',j===i); });
  var f=FED[i];
  card.innerHTML='<h3>'+f.name+'</h3><p class="sub">'+f.sub+'</p><p class="mods">'+f.mods+'</p><h4 role="none">Captures on site</h4><ul>'+f.keep.map(function(k){return '<li><span>'+k+'</span></li>';}).join('')+
    '</ul><h4 role="none">The control room sees</h4><ul>'+f.share.map(function(s){return '<li><span>'+s[0]+'</span>'+(STL[s[1]]||'')+'</li>';}).join('')+'</ul>';
  if(window.gsap&&!reduce) gsap.from(card.children,{y:10,opacity:0,duration:.45,stagger:.035,ease:'power3.out'});
  wake();
}
selectFed(0);
if(fed){
  var fedEl=$('#hwFedStage');
  FED.forEach(function(f,i){ var el=document.createElement('span'); el.className='hw-flbl'+(i===0?' on':''); el.textContent=f.name; fedEl.appendChild(el); fedLbls.push(el); });
  var hubL=document.createElement('span'); hubL.className='hw-flbl hub'; hubL.textContent='Control room'; fedEl.appendChild(hubL);
  // labels: the hub's sits just under the hub; each site's sits under its node, and a label that would overlap one already
  // placed moves up (or down) by its own height until it is clear
  function fedPos(v,el,dy){ PV.copy(v).project(st2.cam); var w=el.offsetWidth||80, h=el.offsetHeight||24;
    return { el:el, x:clamp((PV.x*.5+.5)*st2.w-w/2,8,st2.w-w-8), y:(-PV.y*.5+.5)*st2.h+dy, w:w, h:h }; }
  function hits(a,b){ return a.x<b.x+b.w+4 && b.x<a.x+a.w+4 && a.y<b.y+b.h+4 && b.y<a.y+a.h+4; }
  st2.post=function(){
    LV.set(0,0,0); var hub=fedPos(LV,hubL,18), done=[hub];
    fed.P.forEach(function(p,i){ LV.copy(p.g.position); LV.y=-.15; LV.applyAxisAngle(UP,fed.root.rotation.y);
      var r=fedPos(LV,fedLbls[i],12), y0=r.y, dir=r.y<hub.y?-1:1, offs=[0,1,-1,2,-2,3];
      for(var k=0;k<offs.length;k++){ r.y=y0+dir*offs[k]*(r.h+4); if(!done.some(function(b){ return hits(r,b); })) break; }
      done.push(r); fedLbls[i].style.opacity=String(clamp(fed.st.k*2-.6)); });
    done.forEach(function(r){ r.y=clamp(r.y,8,st2.h-r.h-8); r.el.style.transform='translate('+r.x.toFixed(1)+'px,'+r.y.toFixed(1)+'px)'; });
    hubL.style.opacity=String(clamp(fed.st.k*2-.2));
  };
  var ray=new T.Raycaster(), mv=new T.Vector2();
  fedEl.addEventListener('pointermove',function(e){ var b=fedEl.getBoundingClientRect(); mv.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1); ray.setFromCamera(mv,st2.cam);
    var hit=ray.intersectObjects(fed.discs,false); var i=hit.length?hit[0].object.userData.i:-1; if(fed.st.hover!==i){ fed.st.hover=i; wake(); } fedEl.style.cursor=i>-1?'pointer':''; });
  fedEl.addEventListener('pointerleave',function(){ if(fed.st.hover!==-1){ fed.st.hover=-1; wake(); } });
  fedEl.addEventListener('click',function(){ if(fed.st.hover>-1) selectFed(fed.st.hover); });
  if(hasGsap&&!reduce) ScrollTrigger.create({trigger:fedEl,start:'top 80%',once:true,onEnter:function(){ gsap.to(fed.st,{k:1,duration:.7,ease:'power2.out'}); }});
  else fed.st.k=1;
}


/* ---------- camera cost diagram: each camera is decoded once and all its scenarios share that pass;
   a new camera adds decode, detection, recording and bandwidth, a new scenario adds very little ---------- */
var NS='http://www.w3.org/2000/svg', dist=$('#hwDist'), distNote=$('#hwDistNote'), camBtn=$('#hwDistCam'), scnBtn=$('#hwDistScn');
function el(tag,attrs,parent,text){ var e=document.createElementNS(NS,tag); for(var k in attrs) e.setAttribute(k,attrs[k]); if(text!==undefined) e.textContent=text; (parent||dist).appendChild(e); return e; }
var tw=hasGsap&&!reduce, MONO='Geist Mono, monospace', SANS='Onest, sans-serif';
var CAM_SEQ=['cam','anpr','cam','cam','anpr','cam','cam','anpr'], SCN=['Plates','Vehicles','Watchlist','Journeys','Camera health'];
var MAXC=CAM_SEQ.length, SX=36, SW=48, SLOT=function(i){ return SX+SW/2+i*SW; }; // camera / decode slot centres
// load per camera and per scenario (illustrative weights): ANPR is the heaviest; a scenario shares the frames
var LOAD={cam:{cpu:1,disk:1,bw:1},anpr:{cpu:1.7,disk:1,bw:1.25},scn:{cpu:.1,disk:0,bw:0}}, FULL={cpu:12.6,disk:8.6,bw:9.6};
var gBase=el('g',{}), gFlow=el('g',{}), gCams=el('g',{}), gScn=el('g',{}), gSlots=el('g',{});
// server: scenarios (top) · shared frames · decode once per camera (bottom)
el('rect',{x:16,y:16,width:420,height:290,rx:16,fill:'#F2F7FC',stroke:'#2673B5','stroke-width':1.4},gBase);
el('text',{x:34,y:42,fill:'#0A1A2B','font-family':SANS,'font-size':14,'font-weight':700},gBase,'Cygnus · standard CPU server');
el('text',{x:418,y:42,'text-anchor':'end',fill:'#5B6E82','font-family':MONO,'font-size':12},gBase,'no GPU');
el('text',{x:34,y:68,fill:'#5B6E82','font-family':MONO,'font-size':12},gBase,'Scenarios on every camera');
var shared=el('rect',{x:34,y:178,width:384,height:30,rx:7,fill:'#fff',stroke:'#2673B5','stroke-width':1.2},gBase);
el('text',{x:226,y:198,'text-anchor':'middle',fill:'#1B5A94','font-family':MONO,'font-size':12},gBase,'Shared frames · one detection pass');
el('text',{x:34,y:236,fill:'#5B6E82','font-family':MONO,'font-size':12},gBase,'Decode once per camera');
// meters: CPU cores (a grid that lights up), recording disk, stream bandwidth
el('rect',{x:452,y:16,width:172,height:290,rx:16,fill:'#fff',stroke:'#DCE5EF'},gBase);
el('text',{x:468,y:42,fill:'#0A1A2B','font-family':SANS,'font-size':13,'font-weight':700},gBase,'What it needs');
el('text',{x:468,y:68,fill:'#5B6E82','font-family':MONO,'font-size':12},gBase,'CPU cores');
var CORES=[]; for(var ci=0;ci<16;ci++) CORES.push(el('rect',{x:468+(ci%8)*18.5,y:78+Math.floor(ci/8)*18.5,width:14,height:14,rx:3,fill:'#E6EEF6'},gBase));
function meter(y,label){ el('text',{x:468,y:y,fill:'#5B6E82','font-family':MONO,'font-size':12},gBase,label); el('rect',{x:468,y:y+9,width:140,height:9,rx:4.5,fill:'#E6EEF6'},gBase); return el('rect',{x:468,y:y+9,width:0,height:9,rx:4.5,fill:'#2673B5'},gBase); }
var mDisk=meter(150,'Recording disk'), mBw=meter(196,'Stream bandwidth');
// what the last step added: three short lines that stay inside the panel (at most 18 characters each)
var DL=[250,266,282].map(function(y,k){ return el('text',{x:468,y:y,fill:k?'#41566B':'#1B5A94','font-family':MONO,'font-size':12,'font-weight':k?400:600,opacity:0},gBase,''); });
el('text',{x:16,y:420,fill:'#5B6E82','font-family':MONO,'font-size':12},gBase,'Shared, grows slowly: server, database, UI, video relay');
var cams=[], scns=[], st={cpu:0,disk:0,bw:0};
function addScn(anim){
  var i=scns.length, x=34+(i%3)*130, y=80+Math.floor(i/3)*42, g=el('g',{transform:'translate('+x+','+y+')'},gScn);
  var r=el('rect',{width:122,height:32,rx:8,fill:'#fff',stroke:'#2673B5','stroke-width':1.2},g); el('text',{x:61,y:21,'text-anchor':'middle',fill:'#0A1A2B','font-family':MONO,'font-size':12},g,SCN[i]);
  var s={g:g,r:r,cx:x+61,pulse:0}; scns.push(s);
  if(anim&&tw) gsap.from(g,{opacity:0,duration:.5,ease:'power2.out'});
  return s;
}
function addCam(anim){
  var i=cams.length, kind=CAM_SEQ[i], x=SLOT(i);
  var slot=el('g',{},gSlots); el('rect',{x:x-20,y:244,width:40,height:24,rx:6,fill:'#fff',stroke:kind==='anpr'?'#1B5A94':'#9DB8D2','stroke-width':kind==='anpr'?1.6:1.2},slot); el('text',{x:x,y:260,'text-anchor':'middle',fill:'#2B3E52','font-family':MONO,'font-size':12},slot,'dec');
  var g=el('g',{},gCams), body=el('g',{transform:'translate('+x+',352)'},g);
  el('rect',{x:-13,y:-8,width:26,height:15,rx:3,fill:kind==='anpr'?'#2673B5':'#fff',stroke:'#2673B5','stroke-width':1.4},body); el('circle',{cx:13,cy:0,r:4,fill:'#fff',stroke:'#2673B5','stroke-width':1.4},body);
  el('text',{x:x,y:382,'text-anchor':'middle',fill:kind==='anpr'?'#1B5A94':'#5B6E82','font-family':MONO,'font-size':12,'font-weight':kind==='anpr'?600:400},g,kind==='anpr'?'ANPR':'cam');
  el('line',{x1:x,y1:342,x2:x,y2:270,stroke:'#C5D4E2','stroke-width':3,'stroke-linecap':'round'},gFlow);
  var c={kind:kind,x:x,pk:el('rect',{width:9,height:6,rx:1.5,fill:'#5A9FD4'},gFlow),dot:el('circle',{r:3.4,fill:'#2673B5'},gFlow),o:Math.random()};
  cams.push(c);
  if(anim&&tw){ gsap.from([g,slot],{opacity:0,y:14,duration:.55,ease:'back.out(2)'}); }
  return c;
}
function totals(){ var t={cpu:0,disk:0,bw:0}; cams.forEach(function(c){ var L=LOAD[c.kind]; t.cpu+=L.cpu; t.disk+=L.disk; t.bw+=L.bw; }); t.cpu+=scns.length*LOAD.scn.cpu; return t; }
function paintMeters(){
  var lit=Math.min(16,Math.ceil(st.cpu/FULL.cpu*16-.001));
  CORES.forEach(function(r,k){ r.setAttribute('fill',k<lit?'#2673B5':'#E6EEF6'); });
  mDisk.setAttribute('width',(140*Math.min(1,st.disk/FULL.disk)).toFixed(1)); mBw.setAttribute('width',(140*Math.min(1,st.bw/FULL.bw)).toFixed(1));
}
function update(lines){
  var t=totals(); if(tw) gsap.to(st,{cpu:t.cpu,disk:t.disk,bw:t.bw,duration:.8,ease:'power2.out',overwrite:true,onUpdate:paintMeters}); else { st=t; paintMeters(); }
  distNote.textContent=cams.length+' cameras · '+scns.length+' scenarios · one decode per camera';
  camBtn.disabled=cams.length>=MAXC; scnBtn.disabled=scns.length>=SCN.length;
  var done=camBtn.disabled&&scnBtn.disabled; camBtn.hidden=done; scnBtn.textContent=done?'↺ Start over':'+ Add a scenario'; if(done) scnBtn.disabled=false;
  if(lines){ DL.forEach(function(t,k){ t.textContent=lines[k]||''; }); if(tw){ gsap.fromTo(DL,{opacity:0},{opacity:1,duration:.35,overwrite:true}); gsap.to(DL,{opacity:0,duration:.5,delay:2.4}); } else DL.forEach(function(t){ t.setAttribute('opacity',1); }); }
  distWake();
}
function moreCam(){ if(cams.length>=MAXC) return; var c=addCam(true); update(c.kind==='anpr'?['+ ANPR camera','the heaviest kind','of camera']:['+ camera','decode, detect,','record, stream']); }
function moreScn(){ if(scns.length>=SCN.length) return; addScn(true); update(['+ scenario','same frames,','almost no load']); }
function reset(){ gCams.innerHTML=''; gScn.innerHTML=''; gSlots.innerHTML=''; [].slice.call(gFlow.childNodes).forEach(function(n){ n.remove(); }); cams=[]; scns=[]; addCam(false); addCam(false); addScn(false); addScn(false); st=totals(); paintMeters(); update(); }
reset();
// the diagram loop sleeps offscreen / hidden / covered; under reduced motion it paints once per change
var distLast=0, distHi=null;
function distWake(){ if(!distRaf&&!stopped) distRaf=requestAnimationFrame(distFrame); } // PORT: no wake after stop()
function distFrame(now){
  distRaf=0; if(!distOn||document.hidden||covered()) return; if(!reduce) distRaf=requestAnimationFrame(distFrame);
  if(!reduce&&now-distLast<33) return; distLast=now; // 30 fps: every write re-renders the SVG
  var t=reduce?0:now/1000;
  // video: each camera into its own decode slot; frames: from the slot into the one shared pass
  cams.forEach(function(c){ var s=reduce?.5:(t*.75+c.o)%1;
    c.pk.setAttribute('x',(c.x-4.5).toFixed(1)); c.pk.setAttribute('y',(338-66*s).toFixed(1)); c.pk.setAttribute('opacity',(Math.sin(s*Math.PI)).toFixed(2));
    var s2=reduce?.5:(t*.75+c.o+.5)%1; c.dot.setAttribute('cx',c.x.toFixed(1)); c.dot.setAttribute('cy',(242-32*s2).toFixed(1)); c.dot.setAttribute('opacity',(Math.sin(s2*Math.PI)*.9).toFixed(2)); });
  // every scenario lights from the same pass, in step
  var pl=reduce?0:Math.max(0,Math.sin(t*3.2)), hi=pl>.7; if(hi!==distHi){ distHi=hi; scns.forEach(function(s){ s.r.setAttribute('fill',hi?'#EAF2FA':'#fff'); }); }
  shared.setAttribute('stroke-width',(1.2+pl*.8).toFixed(2));
}
var distIO=new IntersectionObserver(function(es){ distOn=es[0].isIntersecting; if(distOn) distWake(); }); distIO.observe(dist); observers.push(distIO); // PORT: kept for stop()
// on first view: two scenarios (the meters barely move), then cameras (they climb), alternating to the end
var auto=null, playT=0, SEQ=['s','s','c','c','c','s','c','c','c'];
function stopAuto(){ clearTimeout(playT); playT=0; if(auto){ clearInterval(auto); auto=null; } }
function play(){ stopAuto(); var k=0; auto=setInterval(function(){ if(!distOn||document.hidden||covered()) return; if(k>=SEQ.length){ stopAuto(); return; } if(SEQ[k++]==='s') moreScn(); else moreCam(); },1700); }
if(tw) ScrollTrigger.create({trigger:dist,start:'top 70%',once:true,onEnter:function(){ stopAuto(); if(!stopped) playT=setTimeout(play,700); }}); // PORT: no timer after stop()
camBtn.addEventListener('click',function(){ stopAuto(); moreCam(); });
scnBtn.addEventListener('click',function(){ stopAuto(); if(camBtn.hidden){ reset(); if(tw) play(); } else moreScn(); });

/* ---------- render loop ---------- */
// sleeps when no stage is visible, the tab is hidden, the demo modal covers the page or the context is lost;
// under reduced motion it renders once per change (wake() from resize, visibility, step and site picks)
function wake(){ if(!raf&&glOK&&!lost&&!stopped) raf=requestAnimationFrame(loop); } // PORT: no wake after stop()
// PORT: named so stop() can remove them
function onDocWake(){ wake(); distWake(); }
document.addEventListener('visibilitychange',onDocWake);
document.addEventListener('infrax:cover',onDocWake);
var lastP=-1;
function loop(now){
  raf=0; if(lost||document.hidden||covered()) return;
  // 30 fps while the scene only idles; full rate while scroll or a step click is moving it
  if(!reduce&&now-last<31&&stackP.v===lastP){ raf=requestAnimationFrame(loop); return; } lastP=stackP.v;
  var dt=Math.min(.05,(now-last)/1000); last=now; if(!reduce) clockT+=dt;
  var on=false;
  if(st1&&st1.visible&&st1.ready){ on=true; var p=stackP.v; var g=st1.rig, sep=ease(clamp((p-.12)/.48));
    g.ty=.8+sep*3.1; g.dist=(mobile?30:23)+sep*(mobile?9:8); g.polar=.98+sep*.2; g.az=.75+p*.45;
    stack.update(clockT,reduce?0:dt,p); rig(st1); st1.r.render(st1.scene,st1.cam); st1.post(); }
  if(st2&&st2.visible&&st2.ready){ on=true; var r2=st2.rig; r2.ty=.7; r2.polar=1.02; r2.az=.4;
    // the camera distance is fitted to the box: the whole ring of sites (building tops included) stays inside with a margin
    if(st2.fitKey!==st2.w+'x'+st2.h){ st2.fitKey=st2.w+'x'+st2.h; var R=(low?5.2:6.2)+1.8; /* the ring's final radius (sites animate outward, so their live positions start small) */
      var lo=8, hi=80; for(var it=0;it<20;it++){ r2.dist=(lo+hi)/2; rig(st2); st2.cam.updateMatrixWorld(); var ok=true;
        for(var k=0;k<24&&ok;k++){ var an=k/24*Math.PI*2; for(var yy=0;yy<=3.2&&ok;yy+=3.2){ PV.set(Math.cos(an)*R,yy,Math.sin(an)*R).project(st2.cam); if(PV.z>1||Math.abs(PV.x)>.86||Math.abs(PV.y)>.8) ok=false; } }
        if(ok) hi=r2.dist; else lo=r2.dist; }
      st2.fitDist=hi; }
    r2.dist=st2.fitDist;
    fed.update(clockT,dt); rig(st2); st2.r.render(st2.scene,st2.cam); st2.post(); }
  if(on&&!reduce) raf=requestAnimationFrame(loop);
}
wake();

// PORT: the static page ended with a loader for assets/icons.js; the shared runtime now renders the icons on every page.

// PORT: cleanup for client-side navigation away from this page
return function stop(){
  stopped=true;
  if(raf){ cancelAnimationFrame(raf); raf=0; } if(distRaf){ cancelAnimationFrame(distRaf); distRaf=0; }
  stopAuto();
  observers.forEach(function(o){ o.disconnect(); }); observers=[];
  document.removeEventListener('visibilitychange',onDocWake); document.removeEventListener('infrax:cover',onDocWake);
  if(mm) mm.revert();
  // tweens started later from clicks, ScrollTrigger callbacks or the auto-play timer (outside usePage's gsap.context)
  if(window.gsap){ gsap.killTweensOf([stackP,st,DL,shared]); if(fed) gsap.killTweensOf(fed.st); if(card) gsap.killTweensOf(card.children); }
  // WebGL: free every geometry, material and texture, then the renderer and its context
  stages.forEach(function(s){
    s.scene.traverse(function(o){ if(o.geometry) o.geometry.dispose(); [].concat(o.material||[]).forEach(function(m){ if(m.map) m.map.dispose(); m.dispose(); }); });
    s.r.dispose(); s.r.forceContextLoss();
  });
  stages=[];
  if(addedNoGl) document.documentElement.classList.remove('no-gl');
};
}

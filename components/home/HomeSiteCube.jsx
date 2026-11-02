'use client';
// Book a demo band: a slowly turning cube with one site type on each face (highway, city, campus, port, warehouse,
// construction). Time-based rotation on one rAF loop (no per-frame state), drag to spin with eased inertia, paused
// off screen and in hidden tabs; under reduced motion it rests at a three-face angle.
import { useEffect, useRef } from 'react';

const FACES = [
  ['highway', 'rotateY(0deg)'], ['city-arterial', 'rotateY(90deg)'], ['campus-entrance', 'rotateY(180deg)'],
  ['port-berth', 'rotateY(-90deg)'], ['warehouse-dock', 'rotateX(90deg)'], ['construction-gate', 'rotateX(-90deg)'],
];

export default function HomeSiteCube() {
  const wrap = useRef(null), cube = useRef(null);
  useEffect(() => {
    const el = wrap.current, cb = cube.current;
    if (!el || !cb) return undefined;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const st = { ry: -32, rx: -18, vy: 0, drag: null, last: 0, raf: 0, vis: false };
    const SPEED = 14; // degrees per second when idle
    const paint = () => { cb.style.transform = `rotateX(${st.rx.toFixed(2)}deg) rotateY(${st.ry.toFixed(2)}deg)`; };
    paint();
    if (reduce) return undefined;
    const tick = (now) => {
      st.raf = 0;
      if (!st.vis || document.hidden) return;
      const dt = st.last ? Math.min(0.05, (now - st.last) / 1000) : 0; st.last = now;
      if (!st.drag) {
        // inertia from a drag eases back to the idle speed; the tilt settles back to its resting angle
        st.vy += (SPEED - st.vy) * (1 - Math.exp(-dt * 1.6));
        st.ry += st.vy * dt;
        st.rx += (-18 - st.rx) * (1 - Math.exp(-dt * 2.2));
      }
      paint();
      st.raf = requestAnimationFrame(tick);
    };
    const wake = () => { if (!st.raf && st.vis && !document.hidden) { st.last = 0; st.raf = requestAnimationFrame(tick); } };
    const io = new IntersectionObserver((es) => { st.vis = es[0].isIntersecting; wake(); }, { rootMargin: '80px' });
    io.observe(el);
    const down = (e) => { st.drag = { x: e.clientX, y: e.clientY, ry: st.ry, rx: st.rx, t: performance.now(), px: e.clientX }; el.setPointerCapture(e.pointerId); el.classList.add('is-drag'); };
    const move = (e) => {
      const d = st.drag; if (!d) return;
      const now = performance.now(), dtm = Math.max(1, now - d.t);
      st.vy = ((e.clientX - d.px) * 0.45) / (dtm / 1000); d.px = e.clientX; d.t = now;
      st.ry = d.ry + (e.clientX - d.x) * 0.45;
      st.rx = Math.max(-55, Math.min(40, d.rx - (e.clientY - d.y) * 0.3));
      paint();
    };
    const up = () => { if (!st.drag) return; st.drag = null; st.vy = Math.max(-240, Math.min(240, st.vy)); el.classList.remove('is-drag'); wake(); };
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    document.addEventListener('visibilitychange', wake);
    return () => {
      io.disconnect(); if (st.raf) cancelAnimationFrame(st.raf);
      el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
      document.removeEventListener('visibilitychange', wake);
    };
  }, []);
  return (
    <div className="hm-cube" ref={wrap} role="img" aria-label="Photos of the six site types: highway, city, campus, port, warehouse and construction">
      <span className="hm-cube-shadow" aria-hidden="true"></span>
      <div className="hm-cube-c" ref={cube} aria-hidden="true">
        {FACES.map(([n, tr]) => (
          <div className="hm-cube-f" key={n} style={{ transform: `${tr} translateZ(calc(var(--cs) / 2))` }}>
            <img src={`/img/cube/${n}.webp`} alt="" width="864" height="864" decoding="async" loading="lazy" draggable="false" />
          </div>
        ))}
      </div>
    </div>
  );
}

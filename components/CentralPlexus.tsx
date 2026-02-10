'use client';

import { useEffect, useRef } from 'react';

export default function CentralPlexus() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    let animationFrameId: number;

    const getParticleCount = () => {
      const w = window.innerWidth;
      if (w < 640) return 40;
      if (w < 1024) return 60;
      return 100;
    };

    const initCanvas = () => {
      const oldW = canvas.width;
      const oldH = canvas.height;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const newCount = getParticleCount();

      if (particles.length !== newCount || oldW === 0) {
        particles = [];
        for (let i = 0; i < newCount; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2 + 1,
            connections: 0
          });
        }
      } else if (oldW > 0 && oldH > 0) {
        const sx = canvas.width / oldW;
        const sy = canvas.height / oldH;
        particles.forEach(p => { p.x *= sx; p.y *= sy; });
      }
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const maxDistance = canvas.width < 640 ? 100 : 150;
      const mob = canvas.width < 640;

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        p.x = Math.max(0, Math.min(canvas.width, p.x));
        p.y = Math.max(0, Math.min(canvas.height, p.y));

        p.connections = 0;

        for (let j = i + 1; j < particles.length; j++) {
          const o = particles[j];
          const dx = p.x - o.x, dy = p.y - o.y;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < maxDistance) {
            p.connections++;
            o.connections++;
            const opacity = (1 - d / maxDistance) * 0.25;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(38, 115, 181, ${opacity})`;
            ctx.lineWidth = mob ? 0.8 : 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(o.x, o.y);
            ctx.stroke();
          }
        }

        const brightness = Math.min(p.connections / 5, 1);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
        g.addColorStop(0, `rgba(38, 115, 181, ${0.6 + brightness * 0.3})`);
        g.addColorStop(0.5, `rgba(58, 143, 212, ${0.3 + brightness * 0.2})`);
        g.addColorStop(1, 'rgba(96, 165, 250, 0)');
        ctx.beginPath();
        ctx.fillStyle = g;
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = p.connections > 3 ? '#2673B5' : '#5a9fd4';
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      const cometCount = mob ? 2 : 3;
      const cometSize = mob ? 35 : 50;
      const time = Date.now() * 0.001;

      for (let i = 0; i < cometCount; i++) {
        const x = (Math.sin(time + i * 2) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(time * 0.7 + i * 2) * 0.5 + 0.5) * canvas.height;
        const sg = ctx.createRadialGradient(x, y, 0, x, y, cometSize);
        sg.addColorStop(0, 'rgba(38, 115, 181, 0.35)');
        sg.addColorStop(0.5, 'rgba(58, 143, 212, 0.2)');
        sg.addColorStop(1, 'rgba(96, 165, 250, 0)');
        ctx.beginPath();
        ctx.fillStyle = sg;
        ctx.arc(x, y, cometSize, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    initCanvas();
    animate();

    window.addEventListener('resize', initCanvas);
    return () => {
      window.removeEventListener('resize', initCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none opacity-[0.25]"
    />
  );
}

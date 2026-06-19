import React, { useEffect, useRef } from 'react';
import styles from './HeroNebula.module.css';

// Simple nebula shader – a lightweight particle field that slowly drifts.
// This implementation uses Canvas 2D for compatibility; you can replace with WebGL if desired.

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  hue: number;
}

const NebulaCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    const particles: Particle[] = [];
    const particleCount = 120;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1 + Math.random() * 2,
        vx: -0.2 + Math.random() * 0.4,
        vy: -0.2 + Math.random() * 0.4,
        hue: 190 + Math.random() * 40, // cyan‑blue range
      });
    }

    let animationFrameId: number;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, 0.6)`;
        ctx.fill();
        // move
        p.x += p.vx;
        p.y += p.vy;
        // wrap around
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      });
      animationFrameId = requestAnimationFrame(draw);
    };
    draw();
    // cleanup
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return <canvas ref={canvasRef} className={styles.nebulaCanvas} />;
};

const HeroNebula = () => {
  return (
    <div className={styles.heroSection} aria-hidden="true">
      <NebulaCanvas />
    </div>
  );
};

export default HeroNebula;

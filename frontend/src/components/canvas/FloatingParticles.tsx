'use client';

import React, { useRef, useEffect } from 'react';
import { useUI } from '../../context/UIContext';

export default function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { particlesEnabled, accentColor } = useUI();

  useEffect(() => {
    if (!particlesEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Color definitions based on accentColor
    const colors = {
      purple: '168, 36, 255',
      cyan: '0, 243, 255',
      pink: '255, 0, 127',
      green: '57, 255, 20'
    };

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      alpha: number;
      alphaSpeed: number;
    }

    const particleCount = Math.min(60, Math.floor((width * height) / 25000));
    const particles: Particle[] = [];

    const createParticle = (isInitial = false): Particle => {
      return {
        x: Math.random() * width,
        y: isInitial ? Math.random() * height : height + 10,
        size: Math.random() * 2 + 1,
        speedX: Math.random() * 0.4 - 0.2,
        speedY: -(Math.random() * 0.6 + 0.2),
        alpha: Math.random() * 0.5 + 0.1,
        alphaSpeed: Math.random() * 0.005 + 0.002
      };
    };

    // Populate initially
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(true));
    }

    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, index) => {
        // Update physics
        p.x += p.x < mouse.x ? p.speedX + 0.03 : p.speedX - 0.03; // slight mouse gravity
        p.y += p.speedY;
        p.alpha -= p.alphaSpeed;

        // Reset if transparent or out of bounds
        if (p.alpha <= 0 || p.y < -10 || p.x < -10 || p.x > width + 10) {
          particles[index] = createParticle();
          return;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colors[accentColor] || '168, 36, 255'}, ${p.alpha})`;
        ctx.shadowBlur = p.size * 2;
        ctx.shadowColor = `rgb(${colors[accentColor] || '168, 36, 255'})`;
        ctx.fill();
      });

      // Clear shadows for performance
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [particlesEnabled, accentColor]);

  if (!particlesEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

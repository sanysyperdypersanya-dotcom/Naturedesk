import React, { useEffect, useRef, useState } from 'react';
import { CurrentWeather } from '../types';

export type NatureEffectType =
  | 'auto'
  | 'rain'
  | 'snow'
  | 'mist'
  | 'leaves'
  | 'sunbeams'
  | 'fireflies'
  | 'none';

interface InteractiveWeatherCanvasProps {
  weather: CurrentWeather | null;
  effectType: NatureEffectType;
  intensity?: number; // 0.5 to 2.0
  onAutoEffectResolved?: (resolvedEffect: string) => void;
}

export const InteractiveWeatherCanvas: React.FC<InteractiveWeatherCanvasProps> = ({
  weather,
  effectType,
  intensity = 1.0,
  onAutoEffectResolved,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; vx: number; vy: number; active: boolean }>({
    x: -1000,
    y: -1000,
    vx: 0,
    vy: 0,
    active: false,
  });

  // Resolve active effect based on weather if 'auto'
  const resolveActiveEffect = (): Exclude<NatureEffectType, 'auto'> => {
    if (effectType !== 'auto') return effectType;
    if (!weather) return 'sunbeams';

    const icon = weather.condition.iconName;
    const isDay = weather.isDaytime;

    if (icon.includes('snow')) return 'snow';
    if (icon.includes('rain') || icon.includes('drizzle')) return 'rain';
    if (icon.includes('fog') || icon.includes('cloud')) return 'mist';
    if (!isDay) return 'fireflies';
    return 'sunbeams';
  };

  const activeEffect = resolveActiveEffect();

  useEffect(() => {
    if (onAutoEffectResolved) {
      const names: Record<Exclude<NatureEffectType, 'auto'>, string> = {
        rain: 'Живий дощ',
        snow: 'Снігопад',
        mist: 'Гірський туман',
        leaves: 'Осінній листопад',
        sunbeams: 'Сонячне проміння',
        fireflies: 'Нічні світлячки',
        none: 'Без ефектів',
      };
      onAutoEffectResolved(names[activeEffect]);
    }
  }, [activeEffect, onAutoEffectResolved]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Track mouse movement
    let lastMouseX = -1000;
    let lastMouseY = -1000;
    const handleMouseMove = (e: MouseEvent) => {
      const vx = e.clientX - lastMouseX;
      const vy = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        vx: Math.max(-15, Math.min(15, vx)),
        vy: Math.max(-15, Math.min(15, vy)),
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Particle classes
    // 1. Rain
    const rainCount = Math.floor(180 * intensity);
    const raindrops = Array.from({ length: rainCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      len: 12 + Math.random() * 18,
      speed: 12 + Math.random() * 12,
      opacity: 0.2 + Math.random() * 0.45,
      thickness: 1 + Math.random() * 1.2,
    }));

    // Splashes on bottom
    const splashes: Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number }> = [];

    // 2. Snow
    const snowCount = Math.floor(110 * intensity);
    const snowflakes = Array.from({ length: snowCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 1.5 + Math.random() * 3.5,
      speed: 0.8 + Math.random() * 2,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.015 + Math.random() * 0.02,
      opacity: 0.3 + Math.random() * 0.55,
    }));

    // 3. Falling Leaves
    const leafCount = Math.floor(35 * intensity);
    const leaves = Array.from({ length: leafCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 10 + Math.random() * 14,
      speedY: 0.8 + Math.random() * 1.6,
      speedX: -0.5 + Math.random() * 1.5,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      sway: Math.random() * Math.PI * 2,
      color: ['#F59E0B', '#D97706', '#EA580C', '#B45309', '#CA8A04'][
        Math.floor(Math.random() * 5)
      ],
      opacity: 0.65 + Math.random() * 0.3,
    }));

    // 4. Mist / Fog clouds
    const mistCount = Math.floor(14 * intensity);
    const mistPuffs = Array.from({ length: mistCount }, () => ({
      x: Math.random() * width,
      y: height * 0.2 + Math.random() * (height * 0.7),
      radius: 120 + Math.random() * 200,
      vx: (0.15 + Math.random() * 0.3) * (Math.random() > 0.5 ? 1 : 0.8),
      opacity: 0.04 + Math.random() * 0.07,
      pulse: Math.random() * Math.PI * 2,
    }));

    // 5. Sunbeams / Pollen Motes
    const moteCount = Math.floor(45 * intensity);
    const motes = Array.from({ length: moteCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 1 + Math.random() * 2.5,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -0.2 - Math.random() * 0.5,
      alpha: 0.2 + Math.random() * 0.6,
      glow: 4 + Math.random() * 8,
    }));

    // 6. Fireflies
    const fireflyCount = Math.floor(40 * intensity);
    const fireflies = Array.from({ length: fireflyCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 2 + Math.random() * 2.5,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
      hue: 45 + Math.random() * 30, // Golden-green bioluminescence
    }));

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;

      // DRAW ACTIVE EFFECT
      if (activeEffect === 'rain') {
        ctx.strokeStyle = '#BAE6FD';
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';

        // Draw raindrops
        for (let i = 0; i < raindrops.length; i++) {
          const r = raindrops[i];
          ctx.beginPath();
          ctx.globalAlpha = r.opacity;
          ctx.moveTo(r.x, r.y);
          // Angle with wind
          const windAngle = 2 + (mouse.active ? (mouse.x - r.x) * 0.005 : 0);
          ctx.lineTo(r.x + windAngle, r.y + r.len);
          ctx.stroke();

          r.y += r.speed;
          r.x += windAngle * 0.4;

          // Mouse deflection
          if (mouse.active) {
            const dx = r.x - mouse.x;
            const dy = r.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 90) {
              r.x += (dx / dist) * 4;
            }
          }

          // Hit ground
          if (r.y > height - 10) {
            r.y = -20;
            r.x = Math.random() * width;
            if (Math.random() < 0.2) {
              splashes.push({
                x: r.x,
                y: height - Math.random() * 15,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 2.5 - 1,
                life: 0,
                maxLife: 10 + Math.random() * 8,
              });
            }
          }
        }

        // Draw splashes
        ctx.strokeStyle = '#E0F2FE';
        for (let i = splashes.length - 1; i >= 0; i--) {
          const s = splashes[i];
          s.life++;
          s.x += s.vx;
          s.y += s.vy;
          s.vy += 0.2; // gravity
          const alpha = (1 - s.life / s.maxLife) * 0.4;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2);
          ctx.stroke();
          if (s.life >= s.maxLife) {
            splashes.splice(i, 1);
          }
        }
      } else if (activeEffect === 'snow') {
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < snowflakes.length; i++) {
          const s = snowflakes[i];
          s.sway += s.swaySpeed;
          s.y += s.speed;
          let currentX = s.x + Math.sin(s.sway) * 2;

          // Mouse wind interaction
          if (mouse.active) {
            const dx = currentX - mouse.x;
            const dy = s.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 130) {
              const force = (1 - dist / 130) * 5;
              s.x += (dx / dist) * force;
              s.y += (dy / dist) * (force * 0.5);
            }
          }

          if (s.y > height + 10) {
            s.y = -10;
            s.x = Math.random() * width;
          }

          ctx.beginPath();
          ctx.globalAlpha = s.opacity;
          ctx.arc(currentX, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (activeEffect === 'leaves') {
        for (let i = 0; i < leaves.length; i++) {
          const l = leaves[i];
          l.y += l.speedY;
          l.sway += 0.02;
          l.x += l.speedX + Math.sin(l.sway) * 1.5;
          l.rot += l.rotSpeed;

          // Mouse wind
          if (mouse.active) {
            const dx = l.x - mouse.x;
            const dy = l.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 150) {
              l.x += (dx / dist) * 4;
              l.y += (dy / dist) * 2;
              l.rot += 0.08;
            }
          }

          if (l.y > height + 20) {
            l.y = -20;
            l.x = Math.random() * width;
          }

          // Draw stylized leaf shape
          ctx.save();
          ctx.translate(l.x, l.y);
          ctx.rotate(l.rot);
          ctx.globalAlpha = l.opacity;
          ctx.fillStyle = l.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, l.size, l.size * 0.45, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();

          // Leaf vein
          ctx.strokeStyle = 'rgba(0,0,0,0.18)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-l.size * 0.8, 0);
          ctx.lineTo(l.size * 0.8, 0);
          ctx.stroke();
          ctx.restore();
        }
      } else if (activeEffect === 'mist') {
        for (let i = 0; i < mistPuffs.length; i++) {
          const m = mistPuffs[i];
          m.x += m.vx;
          m.pulse += 0.005;

          if (m.x - m.radius > width) {
            m.x = -m.radius;
            m.y = height * 0.2 + Math.random() * (height * 0.65);
          }

          const currentOpacity = m.opacity + Math.sin(m.pulse) * 0.02;
          const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.radius);
          grad.addColorStop(0, `rgba(220, 230, 242, ${currentOpacity * 1.5})`);
          grad.addColorStop(0.5, `rgba(200, 215, 230, ${currentOpacity})`);
          grad.addColorStop(1, 'rgba(200, 215, 230, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (activeEffect === 'sunbeams') {
        // Soft diagonal sunrays
        const rayGrad = ctx.createLinearGradient(0, 0, width, height);
        rayGrad.addColorStop(0, 'rgba(254, 240, 138, 0.09)');
        rayGrad.addColorStop(0.5, 'rgba(253, 224, 71, 0.04)');
        rayGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = rayGrad;
        ctx.fillRect(0, 0, width, height);

        // Floating sun motes
        for (let i = 0; i < motes.length; i++) {
          const m = motes[i];
          m.x += m.vx;
          m.y += m.vy;

          if (m.y < -10) {
            m.y = height + 10;
            m.x = Math.random() * width;
          }
          if (m.x < 0) m.x = width;
          if (m.x > width) m.x = 0;

          // Mouse glow repel
          if (mouse.active) {
            const dx = m.x - mouse.x;
            const dy = m.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 100) {
              m.x += (dx / dist) * 3;
            }
          }

          ctx.beginPath();
          ctx.globalAlpha = m.alpha;
          ctx.fillStyle = '#FEF08A';
          ctx.shadowBlur = m.glow;
          ctx.shadowColor = '#FACC15';
          ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      } else if (activeEffect === 'fireflies') {
        for (let i = 0; i < fireflies.length; i++) {
          const f = fireflies[i];
          f.pulse += f.pulseSpeed;
          f.x += f.vx + Math.sin(f.pulse) * 0.3;
          f.y += f.vy + Math.cos(f.pulse) * 0.3;

          if (f.x < -10) f.x = width + 10;
          if (f.x > width + 10) f.x = -10;
          if (f.y < -10) f.y = height + 10;
          if (f.y > height + 10) f.y = -10;

          // Repel from mouse
          if (mouse.active) {
            const dx = f.x - mouse.x;
            const dy = f.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 110) {
              f.x += (dx / dist) * 4;
              f.y += (dy / dist) * 4;
            }
          }

          const brightness = (Math.sin(f.pulse) + 1) / 2; // 0 to 1
          if (brightness > 0.05) {
            ctx.beginPath();
            ctx.globalAlpha = brightness * 0.85;
            ctx.fillStyle = `hsl(${f.hue}, 95%, 65%)`;
            ctx.shadowBlur = 10 * brightness;
            ctx.shadowColor = `hsl(${f.hue}, 95%, 60%)`;
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [activeEffect, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-10 transition-opacity duration-700"
      style={{ opacity: activeEffect === 'none' ? 0 : 1 }}
    />
  );
};

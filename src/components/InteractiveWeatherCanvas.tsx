import React, { useEffect, useRef } from 'react';
import { CurrentWeather } from '../types';

export type NatureEffectType =
  | 'auto'
  | 'wallpaper_match'
  | 'rain'
  | 'thunderstorm'
  | 'snow'
  | 'mist'
  | 'leaves'
  | 'sakura'
  | 'aurora'
  | 'shooting_stars'
  | 'sunbeams'
  | 'fireflies'
  | 'none';

interface InteractiveWeatherCanvasProps {
  weather: CurrentWeather | null;
  effectType: NatureEffectType;
  recommendedWallpaperEffect?: string;
  intensity?: number; // 0.5 to 2.0
  onAutoEffectResolved?: (
    resolvedLabel: string,
    resolvedType: Exclude<NatureEffectType, 'auto' | 'wallpaper_match'>
  ) => void;
}

export const InteractiveWeatherCanvas: React.FC<InteractiveWeatherCanvasProps> = ({
  weather,
  effectType,
  recommendedWallpaperEffect,
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

  // Resolve active effect based on weather or wallpaper if 'auto' / 'wallpaper_match'
  const resolveActiveEffect = (): Exclude<NatureEffectType, 'auto' | 'wallpaper_match'> => {
    if (effectType === 'wallpaper_match') {
      return (recommendedWallpaperEffect as any) || 'aurora';
    }
    if (effectType !== 'auto') return effectType;
    if (!weather) return (recommendedWallpaperEffect as any) || 'sunbeams';

    const icon = weather.condition.iconName;
    const isDay = weather.isDaytime;

    if (icon.includes('lightning')) return 'thunderstorm';
    if (icon.includes('snow')) return 'snow';
    if (icon.includes('rain') || icon.includes('drizzle')) return 'rain';
    if (icon.includes('fog') || icon.includes('cloud')) return 'mist';
    if (!isDay) return 'shooting_stars';
    return 'sunbeams';
  };

  const activeEffect = resolveActiveEffect();

  useEffect(() => {
    if (onAutoEffectResolved) {
      const names: Record<Exclude<NatureEffectType, 'auto' | 'wallpaper_match'>, string> = {
        rain: 'Живий дощ',
        thunderstorm: 'Гроза та блискавки',
        snow: 'Снігопад',
        mist: 'Гірський туман',
        leaves: 'Осінній листопад',
        sakura: 'Пелюстки сакури',
        aurora: 'Північне сяйво',
        shooting_stars: 'Зорепад у небі',
        sunbeams: 'Сонячне проміння',
        fireflies: 'Нічні світлячки',
        none: 'Без ефектів',
      };
      onAutoEffectResolved(names[activeEffect], activeEffect);
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

    // Track mouse & touch movement
    let lastMouseX = -1000;
    let lastMouseY = -1000;
    const handlePointerMove = (e: PointerEvent) => {
      const vx = e.clientX - lastMouseX;
      const vy = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        vx: Math.max(-18, Math.min(18, vx)),
        vy: Math.max(-18, Math.min(18, vy)),
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // 1. Rain & Thunderstorm drops
    const rainCount = Math.floor(190 * intensity);
    const raindrops = Array.from({ length: rainCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      len: 14 + Math.random() * 20,
      speed: 13 + Math.random() * 13,
      opacity: 0.22 + Math.random() * 0.45,
    }));

    const splashes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
    }> = [];

    // Lightning state for thunderstorm
    let lightningFlashOpacity = 0;
    let lightningTimer = 80 + Math.floor(Math.random() * 140);
    let lightningBolts: Array<{ segments: Array<{ x1: number; y1: number; x2: number; y2: number }>; life: number }> = [];

    const createLightningBolt = (startX: number) => {
      const segments: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
      let cx = startX;
      let cy = 0;
      while (cy < height * 0.72) {
        const nx = cx + (Math.random() - 0.5) * 65;
        const ny = cy + 22 + Math.random() * 35;
        segments.push({ x1: cx, y1: cy, x2: nx, y2: ny });
        // Occasional side branch
        if (Math.random() < 0.28) {
          segments.push({
            x1: cx,
            y1: cy,
            x2: cx + (Math.random() - 0.5) * 90,
            y2: cy + 35 + Math.random() * 45,
          });
        }
        cx = nx;
        cy = ny;
      }
      lightningBolts.push({ segments, life: 14 });
      lightningFlashOpacity = 0.28;
    };

    // 2. Snow
    const snowCount = Math.floor(115 * intensity);
    const snowflakes = Array.from({ length: snowCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 1.5 + Math.random() * 3.5,
      speed: 0.8 + Math.random() * 2,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.015 + Math.random() * 0.02,
      opacity: 0.35 + Math.random() * 0.55,
    }));

    // 3. Falling Autumn Leaves
    const leafCount = Math.floor(38 * intensity);
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

    // 4. Sakura Cherry Blossom Petals
    const sakuraCount = Math.floor(55 * intensity);
    const petals = Array.from({ length: sakuraCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 6 + Math.random() * 8,
      speedY: 0.6 + Math.random() * 1.3,
      speedX: 0.4 + Math.random() * 1.4,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.05,
      flip: Math.random() * Math.PI * 2,
      flipSpeed: 0.02 + Math.random() * 0.03,
      color: ['#FBCFE8', '#F9A8D4', '#F472B6', '#FDF2F8'][Math.floor(Math.random() * 4)],
      opacity: 0.6 + Math.random() * 0.35,
    }));

    // 5. Mist / Fog clouds
    const mistCount = Math.floor(15 * intensity);
    const mistPuffs = Array.from({ length: mistCount }, () => ({
      x: Math.random() * width,
      y: height * 0.18 + Math.random() * (height * 0.7),
      radius: 130 + Math.random() * 210,
      vx: (0.15 + Math.random() * 0.35) * (Math.random() > 0.5 ? 1 : 0.8),
      opacity: 0.04 + Math.random() * 0.07,
      pulse: Math.random() * Math.PI * 2,
    }));

    // 6. Sunbeams & Golden Dust Motes
    const moteCount = Math.floor(50 * intensity);
    const motes = Array.from({ length: moteCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 1 + Math.random() * 2.5,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -0.2 - Math.random() * 0.5,
      alpha: 0.25 + Math.random() * 0.6,
      glow: 4 + Math.random() * 8,
    }));

    // 7. Fireflies
    const fireflyCount = Math.floor(45 * intensity);
    const fireflies = Array.from({ length: fireflyCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 2 + Math.random() * 2.5,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
      hue: 45 + Math.random() * 40,
    }));

    // 8. Background Stars & Shooting Stars (Meteors)
    const starCount = Math.floor(95 * intensity);
    const bgStars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.75),
      r: 0.6 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2,
      speed: 0.015 + Math.random() * 0.03,
    }));

    const meteors: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      len: number;
      life: number;
      maxLife: number;
      color: string;
    }> = [];

    const spawnMeteor = (customX?: number, customY?: number) => {
      const startX = customX ?? Math.random() * width * 0.85 + width * 0.1;
      const startY = customY ?? Math.random() * height * 0.35;
      const angle = (Math.PI * 3) / 4 + (Math.random() - 0.5) * 0.25;
      const speed = 12 + Math.random() * 9;
      meteors.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: 75 + Math.random() * 75,
        life: 0,
        maxLife: 28 + Math.random() * 22,
        color: ['#E0F2FE', '#FEF08A', '#C7D2FE', '#6EE7B7'][Math.floor(Math.random() * 4)],
      });
    };

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;

      // 1. RAIN OR THUNDERSTORM
      if (activeEffect === 'rain' || activeEffect === 'thunderstorm') {
        if (activeEffect === 'thunderstorm') {
          lightningTimer--;
          if (lightningTimer <= 0) {
            createLightningBolt(width * 0.15 + Math.random() * width * 0.7);
            lightningTimer = 95 + Math.floor(Math.random() * 180 / intensity);
          }

          if (lightningFlashOpacity > 0.005) {
            ctx.fillStyle = `rgba(224, 242, 254, ${lightningFlashOpacity})`;
            ctx.fillRect(0, 0, width, height);
            lightningFlashOpacity *= 0.84;
          }

          for (let b = lightningBolts.length - 1; b >= 0; b--) {
            const bolt = lightningBolts[b];
            bolt.life--;
            ctx.save();
            ctx.strokeStyle = '#FEF9C3';
            ctx.shadowColor = '#38BDF8';
            ctx.shadowBlur = 16;
            ctx.lineWidth = (bolt.life / 14) * 2.6;
            ctx.globalAlpha = bolt.life / 14;
            ctx.beginPath();
            for (const seg of bolt.segments) {
              ctx.moveTo(seg.x1, seg.y1);
              ctx.lineTo(seg.x2, seg.y2);
            }
            ctx.stroke();
            ctx.restore();
            if (bolt.life <= 0) lightningBolts.splice(b, 1);
          }
        }

        ctx.strokeStyle = '#BAE6FD';
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';

        for (let i = 0; i < raindrops.length; i++) {
          const r = raindrops[i];
          ctx.beginPath();
          ctx.globalAlpha = r.opacity;
          ctx.moveTo(r.x, r.y);
          const windAngle =
            (activeEffect === 'thunderstorm' ? 4.5 : 2) +
            (mouse.active ? (mouse.x - r.x) * 0.005 : 0);
          ctx.lineTo(r.x + windAngle, r.y + r.len);
          ctx.stroke();

          r.y += r.speed;
          r.x += windAngle * 0.4;

          if (mouse.active) {
            const dx = r.x - mouse.x;
            const dy = r.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 90) {
              r.x += (dx / dist) * 4;
            }
          }

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

        ctx.strokeStyle = '#E0F2FE';
        for (let i = splashes.length - 1; i >= 0; i--) {
          const s = splashes[i];
          s.life++;
          s.x += s.vx;
          s.y += s.vy;
          s.vy += 0.2;
          const alpha = (1 - s.life / s.maxLife) * 0.4;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2);
          ctx.stroke();
          if (s.life >= s.maxLife) splashes.splice(i, 1);
        }
      }
      // 2. SNOW
      else if (activeEffect === 'snow') {
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < snowflakes.length; i++) {
          const s = snowflakes[i];
          s.sway += s.swaySpeed;
          s.y += s.speed;
          const currentX = s.x + Math.sin(s.sway) * 2;

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
      }
      // 3. AUTUMN LEAVES
      else if (activeEffect === 'leaves') {
        for (let i = 0; i < leaves.length; i++) {
          const l = leaves[i];
          l.y += l.speedY;
          l.sway += 0.02;
          l.x += l.speedX + Math.sin(l.sway) * 1.5;
          l.rot += l.rotSpeed;

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

          ctx.save();
          ctx.translate(l.x, l.y);
          ctx.rotate(l.rot);
          ctx.globalAlpha = l.opacity;
          ctx.fillStyle = l.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, l.size, l.size * 0.45, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(0,0,0,0.18)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-l.size * 0.8, 0);
          ctx.lineTo(l.size * 0.8, 0);
          ctx.stroke();
          ctx.restore();
        }
      }
      // 4. SAKURA PETALS
      else if (activeEffect === 'sakura') {
        for (let i = 0; i < petals.length; i++) {
          const p = petals[i];
          p.y += p.speedY;
          p.flip += p.flipSpeed;
          p.x += p.speedX + Math.sin(p.flip) * 1.3;
          p.rot += p.rotSpeed;

          if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 140) {
              p.x += (dx / dist) * 4.5 + mouse.vx * 0.15;
              p.y += (dy / dist) * 2.5 + mouse.vy * 0.15;
              p.rot += 0.07;
            }
          }

          if (p.y > height + 20) {
            p.y = -15;
            p.x = Math.random() * width;
          }
          if (p.x > width + 20) p.x = -15;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(1, 0.55 + Math.abs(Math.cos(p.flip)) * 0.45);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.bezierCurveTo(p.size, -p.size * 0.6, p.size * 0.9, p.size * 0.8, 0, p.size);
          ctx.bezierCurveTo(-p.size * 0.9, p.size * 0.8, -p.size, -p.size * 0.6, 0, -p.size);
          ctx.fill();
          ctx.restore();
        }
      }
      // 5. AURORA BOREALIS (NORTHERN LIGHTS)
      else if (activeEffect === 'aurora') {
        // Twinkling stars behind aurora
        for (let i = 0; i < bgStars.length; i++) {
          const st = bgStars[i];
          st.phase += st.speed;
          const alpha = 0.25 + ((Math.sin(st.phase) + 1) / 2) * 0.65;
          ctx.fillStyle = '#F8FAFC';
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Flowing Aurora Curtains
        const ribbons = [
          { yBase: height * 0.22, color1: 'rgba(52, 211, 153, 0.22)', color2: 'rgba(16, 185, 129, 0)', speed: 0.012, amp: 55 },
          { yBase: height * 0.3, color1: 'rgba(45, 212, 191, 0.18)', color2: 'rgba(139, 92, 246, 0)', speed: 0.016, amp: 70 },
          { yBase: height * 0.16, color1: 'rgba(167, 139, 250, 0.16)', color2: 'rgba(52, 211, 153, 0)', speed: 0.009, amp: 45 },
        ];

        ctx.save();
        for (let rIdx = 0; rIdx < ribbons.length; rIdx++) {
          const rib = ribbons[rIdx];
          ctx.beginPath();
          ctx.moveTo(0, 0);
          for (let x = 0; x <= width; x += 32) {
            const mouseWave =
              mouse.active && Math.abs(x - mouse.x) < 260
                ? Math.cos(((x - mouse.x) / 260) * Math.PI) * 35
                : 0;
            const y =
              rib.yBase +
              Math.sin(x * 0.0035 + tick * rib.speed + rIdx * 2) * rib.amp +
              Math.cos(x * 0.007 - tick * rib.speed * 0.7) * (rib.amp * 0.45) +
              mouseWave;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, 0);
          ctx.closePath();

          const grad = ctx.createLinearGradient(0, 0, 0, rib.yBase + rib.amp * 2.2);
          grad.addColorStop(0, rib.color2);
          grad.addColorStop(0.45, rib.color1);
          grad.addColorStop(1, rib.color2);
          ctx.fillStyle = grad;
          ctx.globalAlpha = Math.min(1, intensity * 0.85);
          ctx.fill();
        }
        ctx.restore();
      }
      // 6. SHOOTING STARS (METEORS & STARFIELD)
      else if (activeEffect === 'shooting_stars') {
        for (let i = 0; i < bgStars.length; i++) {
          const st = bgStars[i];
          st.phase += st.speed;
          const alpha = 0.25 + ((Math.sin(st.phase) + 1) / 2) * 0.7;
          ctx.fillStyle = '#F8FAFC';
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
          ctx.fill();
        }

        if (Math.random() < 0.035 * intensity) {
          spawnMeteor();
        }
        if (mouse.active && Math.hypot(mouse.vx, mouse.vy) > 14 && Math.random() < 0.18) {
          spawnMeteor(mouse.x, mouse.y);
        }

        for (let i = meteors.length - 1; i >= 0; i--) {
          const m = meteors[i];
          m.life++;
          m.x += m.vx;
          m.y += m.vy;

          const progress = m.life / m.maxLife;
          const alpha = progress < 0.2 ? progress * 5 : 1 - (progress - 0.2) / 0.8;

          const tailX = m.x - (m.vx / 14) * m.len;
          const tailY = m.y - (m.vy / 14) * m.len;

          const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
          grad.addColorStop(0, m.color);
          grad.addColorStop(1, 'rgba(255,255,255,0)');

          ctx.save();
          ctx.globalAlpha = Math.max(0, alpha);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2.2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = m.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(m.x, m.y, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (m.life >= m.maxLife || m.x < -100 || m.y > height + 100) {
            meteors.splice(i, 1);
          }
        }
      }
      // 7. MIST
      else if (activeEffect === 'mist') {
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
      }
      // 8. SUNBEAMS
      else if (activeEffect === 'sunbeams') {
        const rayGrad = ctx.createLinearGradient(0, 0, width, height);
        rayGrad.addColorStop(0, 'rgba(254, 240, 138, 0.09)');
        rayGrad.addColorStop(0.5, 'rgba(253, 224, 71, 0.04)');
        rayGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = rayGrad;
        ctx.fillRect(0, 0, width, height);

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
      }
      // 9. FIREFLIES
      else if (activeEffect === 'fireflies') {
        for (let i = 0; i < fireflies.length; i++) {
          const f = fireflies[i];
          f.pulse += f.pulseSpeed;
          f.x += f.vx + Math.sin(f.pulse) * 0.3;
          f.y += f.vy + Math.cos(f.pulse) * 0.3;

          if (f.x < -10) f.x = width + 10;
          if (f.x > width + 10) f.x = -10;
          if (f.y < -10) f.y = height + 10;
          if (f.y > height + 10) f.y = -10;

          if (mouse.active) {
            const dx = f.x - mouse.x;
            const dy = f.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 110) {
              f.x += (dx / dist) * 4;
              f.y += (dy / dist) * 4;
            }
          }

          const brightness = (Math.sin(f.pulse) + 1) / 2;
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
      window.removeEventListener('pointermove', handlePointerMove);
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

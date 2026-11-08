import React, { useEffect, useRef } from 'react';

interface TrailPoint {
  x: number;
  y: number;
}

interface Stardust {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
}

interface ClickSparkle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  char: string;
}

const TRAIL_LENGTH = 18; // Number of luminous points trailing the flower

export const CustomCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Disable on touch-only mobile devices to avoid phantom trails
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isVisible = false;
    let isHovered = false;

    // Mouse coordinates (tip of cursor at 0, 0)
    let mouseX = -200;
    let mouseY = -200;

    // Initialize trailing points
    const points: TrailPoint[] = Array.from({ length: TRAIL_LENGTH }, () => ({
      x: -200,
      y: -200,
    }));

    let stardustList: Stardust[] = [];
    let clickSparkles: ClickSparkle[] = [];
    let lastStardustTime = 0;

    // Handle high-DPI crisp rendering
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        // Snap points to current mouse to prevent long initial line
        for (let i = 0; i < points.length; i++) {
          points[i].x = mouseX + 16;
          points[i].y = mouseY + 16;
        }
      }

      // Periodically emit delicate drifting stardust from the flower stem
      const now = performance.now();
      const dist = Math.hypot(mouseX + 16 - points[0].x, mouseY + 16 - points[0].y);
      if (dist > 6 && now - lastStardustTime > 35) {
        lastStardustTime = now;
        const colors = ['#D4AF37', '#F3E5AB', '#C94C71', '#FFAEC6', '#FFFFFF'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        stardustList.push({
          id: Math.random(),
          x: mouseX + 16 + (Math.random() * 8 - 4),
          y: mouseY + 16 + (Math.random() * 8 - 4),
          size: Math.random() * 2.8 + 1.2,
          opacity: 0.9,
          color,
          vx: (Math.random() - 0.5) * 0.8,
          vy: Math.random() * 0.6 + 0.2,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.08,
        });
        if (stardustList.length > 20) stardustList.shift();
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.getAttribute('role') === 'button' ||
        target.classList.contains('cursor-pointer')
      ) {
        isHovered = true;
      } else {
        isHovered = false;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Radiate luxury starburst on click
      const chars = ['✦', '✧', '•', '⋆'];
      const colors = ['#D4AF37', '#F4E8C1', '#C94C71', '#FFAEC6'];
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8 + (Math.random() * 0.3 - 0.15);
        const speed = Math.random() * 2.4 + 1.6;
        clickSparkles.push({
          id: Math.random(),
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 4 + 10,
          opacity: 1,
          color: colors[i % colors.length],
          char: chars[i % chars.length],
        });
      }
    };

    const handleMouseEnter = () => {
      isVisible = true;
    };

    const handleMouseLeave = () => {
      isVisible = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Luxury palette definition for points: transitions from Royal Rose to Imperial Gold to Champagne
    const getPointColor = (ratio: number): { hex: string; r: number; g: number; b: number } => {
      // 0 (head, near flower): Rose (#C94C71 -> 201, 76, 113)
      // 0.5 (middle): Gold (#D4AF37 -> 212, 175, 55)
      // 1.0 (tail end): Light Champagne (#FFF0BE -> 255, 240, 190)
      if (ratio < 0.5) {
        const t = ratio / 0.5;
        const r = Math.round(201 + (212 - 201) * t);
        const g = Math.round(76 + (175 - 76) * t);
        const b = Math.round(113 + (55 - 113) * t);
        return { hex: `rgb(${r},${g},${b})`, r, g, b };
      } else {
        const t = (ratio - 0.5) / 0.5;
        const r = Math.round(212 + (255 - 212) * t);
        const g = Math.round(175 + (240 - 175) * t);
        const b = Math.round(55 + (190 - 55) * t);
        return { hex: `rgb(${r},${g},${b})`, r, g, b };
      }
    };

    // Main 60fps animation loop
    const render = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (isVisible) {
        // Point 0 follows the stem/leaves of the flower (offset slightly from hotspot 0,0)
        // Hotspot is 0,0 (rosebud tip); leaves and lower calyx extend to roughly +14px, +14px
        const targetHeadX = mouseX + 16;
        const targetHeadY = mouseY + 15;

        // Smooth spring physics: Head moves with fast response
        points[0].x += (targetHeadX - points[0].x) * 0.48;
        points[0].y += (targetHeadY - points[0].y) * 0.48;

        // Each subsequent point smoothly follows the previous point
        // creating the fluid ribbon-like trailing tail
        const trailEase = isHovered ? 0.38 : 0.35;
        for (let i = 1; i < points.length; i++) {
          points[i].x += (points[i - 1].x - points[i].x) * trailEase;
          points[i].y += (points[i - 1].y - points[i].y) * trailEase;
        }

        // 1. Draw glowing connecting ribbon through the points
        if (points.length > 2) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length - 1; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
          }

          // Linear gradient along head-to-tail
          const headPoint = points[0];
          const tailPoint = points[points.length - 1];
          const ribbonGrad = ctx.createLinearGradient(
            headPoint.x,
            headPoint.y,
            tailPoint.x,
            tailPoint.y
          );
          ribbonGrad.addColorStop(0, 'rgba(201, 76, 113, 0.45)');
          ribbonGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.35)');
          ribbonGrad.addColorStop(1, 'rgba(244, 232, 193, 0.0)');

          ctx.strokeStyle = ribbonGrad;
          ctx.lineWidth = isHovered ? 3.5 : 2.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.shadowColor = '#D4AF37';
          ctx.shadowBlur = 6;
          ctx.stroke();
          ctx.restore();
        }

        // 2. Draw the trailing dots with gradually decreasing opacity & size
        for (let i = 0; i < points.length; i++) {
          const pt = points[i];
          const ratio = i / (points.length - 1); // 0 at head (near flower), 1 at tail tip

          // Decreasing opacity: starts around 0.9 near the flower, down to ~0.04 at the tail
          const opacity = Math.max(0.02, Math.pow(1 - ratio, 1.25) * 0.92);

          // Decreasing size: starts around 6.5px (or 8px on hover) down to ~1.6px
          const baseSize = isHovered ? 8.0 : 6.2;
          const radius = Math.max(1.4, (1 - ratio * 0.75) * baseSize);

          const col = getPointColor(ratio);

          ctx.save();
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);

          // Radial gradient for each glowing pearl
          const radGrad = ctx.createRadialGradient(
            pt.x - radius * 0.25,
            pt.y - radius * 0.25,
            0,
            pt.x,
            pt.y,
            radius
          );
          radGrad.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
          radGrad.addColorStop(0.4, `rgba(${col.r}, ${col.g}, ${col.b}, ${opacity})`);
          radGrad.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, ${opacity * 0.15})`);

          ctx.fillStyle = radGrad;
          ctx.shadowColor = col.hex;
          ctx.shadowBlur = Math.max(2, 9 * (1 - ratio));
          ctx.fill();

          // Delicate white core highlight on the first few leading points
          if (i < 5) {
            ctx.beginPath();
            ctx.arc(pt.x - radius * 0.2, pt.y - radius * 0.2, radius * 0.35, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.9})`;
            ctx.fill();
          }

          ctx.restore();
        }

        // 3. Draw drifting stardust particles
        ctx.save();
        for (let i = stardustList.length - 1; i >= 0; i--) {
          const p = stardustList[i];
          p.x += p.vx;
          p.y += p.vy;
          p.opacity -= 0.03;
          p.rotation += p.vRot;

          if (p.opacity <= 0.05) {
            stardustList.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.globalAlpha = p.opacity;

          // Tiny sparkling diamond/star
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(0, 0, p.size, 0);
          ctx.quadraticCurveTo(0, 0, 0, p.size);
          ctx.quadraticCurveTo(0, 0, -p.size, 0);
          ctx.quadraticCurveTo(0, 0, 0, -p.size);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();

        // 4. Draw click sparkles burst
        if (clickSparkles.length > 0) {
          ctx.save();
          for (let i = clickSparkles.length - 1; i >= 0; i--) {
            const s = clickSparkles[i];
            s.x += s.vx;
            s.y += s.vy;
            s.vx *= 0.94;
            s.vy *= 0.94;
            s.opacity -= 0.04;

            if (s.opacity <= 0.05) {
              clickSparkles.splice(i, 1);
              continue;
            }

            ctx.font = `bold ${Math.round(s.size)}px serif`;
            ctx.fillStyle = s.color;
            ctx.shadowColor = s.color;
            ctx.shadowBlur = 8;
            ctx.globalAlpha = s.opacity;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(s.char, s.x, s.y);
          }
          ctx.restore();
        }

        // 5. Delicate luxury hover indicator (halo ring on clickable targets)
        if (isHovered) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(mouseX + 16, mouseY + 15, 18, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([3, 3]);
          ctx.shadowColor = '#D4AF37';
          ctx.shadowBlur = 8;
          ctx.stroke();
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9998] w-full h-full"
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    />
  );
};

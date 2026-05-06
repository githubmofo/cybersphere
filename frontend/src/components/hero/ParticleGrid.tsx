import { useRef, useEffect } from 'react';

/**
 * Animated dot-grid background suggesting a network topology.
 * Pure canvas — lightweight, no Three.js dependency.
 */
export function ParticleGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const DOT_SPACING = 50;
    const DOT_RADIUS = 1;
    const CONNECTION_DISTANCE = 120;
    const MOUSE_INFLUENCE = 150;

    interface Dot {
      baseX: number;
      baseY: number;
      x: number;
      y: number;
    }

    let dots: Dot[] = [];

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width;
      canvas!.height = height;
      createDots();
    }

    function createDots() {
      dots = [];
      const cols = Math.ceil(width / DOT_SPACING) + 1;
      const rows = Math.ceil(height / DOT_SPACING) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          dots.push({
            baseX: i * DOT_SPACING,
            baseY: j * DOT_SPACING,
            x: i * DOT_SPACING,
            y: j * DOT_SPACING,
          });
        }
      }
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Update dot positions with mouse influence
      for (const dot of dots) {
        const dx = mx - dot.baseX;
        const dy = my - dot.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_INFLUENCE) {
          const force = (MOUSE_INFLUENCE - dist) / MOUSE_INFLUENCE;
          dot.x = dot.baseX - dx * force * 0.15;
          dot.y = dot.baseY - dy * force * 0.15;
        } else {
          dot.x += (dot.baseX - dot.x) * 0.1;
          dot.y += (dot.baseY - dot.y) * 0.1;
        }
      }

      // Draw connections
      ctx.strokeStyle = 'hsl(185, 60%, 50%)';
      ctx.lineWidth = 0.3;
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const alpha = 1 - dist / CONNECTION_DISTANCE;
            ctx.globalAlpha = alpha * 0.15;
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw dots
      ctx.fillStyle = 'hsl(185, 100%, 50%)';
      for (const dot of dots) {
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    }

    function handleMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      resize();
      // Draw static dots only
      ctx.fillStyle = 'hsl(185, 100%, 50%)';
      ctx.globalAlpha = 0.2;
      for (const dot of dots) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    resize();
    animate();

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.6 }}
      aria-hidden="true"
    />
  );
}

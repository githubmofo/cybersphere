import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  colorScheme?: 'green' | 'amber' | 'red' | 'cyan';
}

const SCHEME_COLORS = {
  green: { bg: 'hsl(145, 60%, 40%, 0.12)', border: 'hsl(145, 60%, 40%, 0.3)', text: 'hsl(145, 70%, 55%)', glow: 'hsl(145, 70%, 40%)' },
  amber: { bg: 'hsl(45, 90%, 50%, 0.12)', border: 'hsl(45, 90%, 50%, 0.3)', text: 'hsl(45, 95%, 60%)', glow: 'hsl(45, 95%, 40%)' },
  red:   { bg: 'hsl(0, 80%, 50%, 0.12)',  border: 'hsl(0, 80%, 50%, 0.3)',  text: 'hsl(0, 85%, 65%)',  glow: 'hsl(0, 85%, 40%)' },
  cyan:  { bg: 'hsl(185, 90%, 40%, 0.12)', border: 'hsl(185, 90%, 40%, 0.3)', text: 'hsl(185, 100%, 55%)', glow: 'hsl(185, 100%, 40%)' },
};

/**
 * Glassmorphic KPI stat card with animated count-up and color coding.
 */
export function StatCard({
  icon,
  label,
  value,
  unit = '',
  trend = 'neutral',
  colorScheme = 'cyan',
}: StatCardProps) {
  const displayRef = useRef<HTMLSpanElement>(null);
  const prevValue = useRef<number>(0);
  const colors = SCHEME_COLORS[colorScheme];

  // Animated count-up when value changes
  useEffect(() => {
    if (typeof value !== 'number') return;
    const target = value;
    const start = prevValue.current;
    const duration = 600;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * eased);

      if (displayRef.current) {
        displayRef.current.textContent = current.toLocaleString();
      }

      if (progress < 1) requestAnimationFrame(animate);
      else prevValue.current = target;
    };

    requestAnimationFrame(animate);
  }, [value]);

  const trendArrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '';
  const trendColor =
    trend === 'up' ? 'hsl(0, 85%, 65%)' : trend === 'down' ? 'hsl(145, 70%, 55%)' : 'transparent';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        padding: '1.25rem 1.5rem',
        borderRadius: '0.875rem',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        backdropFilter: 'blur(16px)',
        boxShadow: `0 0 20px ${colors.glow}22`,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        position: 'relative',
        overflow: 'hidden',
        minWidth: 0,
      }}
      whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
    >
      {/* Subtle glow circle in corner */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: colors.glow,
          opacity: 0.08,
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />

      {/* Icon + Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: colors.text, opacity: 0.8, display: 'flex' }}>{icon}</span>
        <span
          style={{
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {label}
        </span>
      </div>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
        <span
          ref={displayRef}
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: colors.text,
            lineHeight: 1,
          }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && (
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{unit}</span>
        )}
        {trendArrow && (
          <span style={{ fontSize: '0.875rem', color: trendColor, marginLeft: 'auto' }}>
            {trendArrow}
          </span>
        )}
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';

interface RiskGaugeProps {
  score: number;   // 0-100
  size?: number;   // diameter px
}

const RADIUS_OUTER = 42;
const STROKE = 7;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS_OUTER;

function colorForScore(score: number): string {
  if (score >= 75) return 'hsl(0, 85%, 55%)';
  if (score >= 45) return 'hsl(45, 95%, 55%)';
  return 'hsl(145, 70%, 50%)';
}

/**
 * Animated circular risk gauge with score label.
 */
export function RiskGauge({ score, size = 100 }: RiskGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const color = colorForScore(clamped);
  const fillRatio = 1 - clamped / 100;
  const offset = fillRatio * CIRCUMFERENCE;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{ transform: 'rotate(-90deg)' }}
        aria-label={`Risk score: ${clamped} out of 100`}
        role="img"
      >
        {/* Track */}
        <circle
          cx={50}
          cy={50}
          r={RADIUS_OUTER}
          fill="none"
          stroke="hsl(210, 15%, 14%)"
          strokeWidth={STROKE}
        />
        {/* Animated fill */}
        <motion.circle
          cx={50}
          cy={50}
          r={RADIUS_OUTER}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.0, ease: [0, 0, 0.2, 1] }}
          style={{ filter: `drop-shadow(0 0 5px ${color}88)` }}
        />
      </svg>

      {/* Center label */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <motion.span
          key={clamped}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            fontSize: size > 80 ? '1.375rem' : '0.9rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color,
            lineHeight: 1,
          }}
        >
          {clamped}
        </motion.span>
        <span
          style={{
            fontSize: size > 80 ? '0.5625rem' : '0.4375rem',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          RISK
        </span>
      </div>
    </div>
  );
}

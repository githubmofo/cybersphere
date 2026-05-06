import { motion } from 'framer-motion';

interface NetworkHealthProps {
  healthScore: number;
  nodeBreakdown: { healthy: number; suspicious: number; compromised: number };
}

const RADIUS = 52;
const STROKE = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getArcColor(score: number): string {
  if (score >= 75) return 'hsl(145, 70%, 50%)';
  if (score >= 40) return 'hsl(45, 95%, 55%)';
  return 'hsl(0, 85%, 55%)';
}

/**
 * Network Health gauge with animated SVG arc and node state breakdown bar.
 */
export function NetworkHealth({ healthScore, nodeBreakdown }: NetworkHealthProps) {
  const total = nodeBreakdown.healthy + nodeBreakdown.suspicious + nodeBreakdown.compromised;
  const fillRatio = 1 - healthScore / 100;
  const strokeDashoffset = fillRatio * CIRCUMFERENCE;
  const color = getArcColor(healthScore);

  const healthyPct = total > 0 ? (nodeBreakdown.healthy / total) * 100 : 100;
  const suspiciousPct = total > 0 ? (nodeBreakdown.suspicious / total) * 100 : 0;
  const compromisedPct = total > 0 ? (nodeBreakdown.compromised / total) * 100 : 0;

  return (
    <div
      style={{
        padding: '1.25rem 1.5rem',
        borderRadius: '0.875rem',
        background: 'hsl(210, 18%, 7%, 0.8)',
        border: '1px solid hsl(210, 15%, 14%)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Header */}
      <span
        style={{
          fontSize: '0.6875rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        Network Health
      </span>

      {/* Gauge + Score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
          <svg width={120} height={120} style={{ transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle
              cx={60} cy={60} r={RADIUS}
              fill="none"
              stroke="hsl(210, 15%, 14%)"
              strokeWidth={STROKE}
            />
            {/* Animated fill */}
            <motion.circle
              cx={60} cy={60} r={RADIUS}
              fill="none"
              stroke={color}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
            />
          </svg>
          {/* Center text */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontSize: '1.625rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color,
                lineHeight: 1,
              }}
            >
              {healthScore}
            </span>
            <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              /100
            </span>
          </div>
        </div>

        {/* Node breakdown */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {[
            { label: 'Healthy', count: nodeBreakdown.healthy, pct: healthyPct, color: 'hsl(145, 70%, 50%)' },
            { label: 'Suspicious', count: nodeBreakdown.suspicious, pct: suspiciousPct, color: 'hsl(45, 95%, 55%)' },
            { label: 'Compromised', count: nodeBreakdown.compromised, pct: compromisedPct, color: 'hsl(0, 85%, 55%)' },
          ].map((row) => (
            <div key={row.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{row.label}</span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: row.color }}>
                  {row.count}
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  borderRadius: 9999,
                  background: 'hsl(210, 15%, 14%)',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${row.pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: row.color,
                    borderRadius: 9999,
                    boxShadow: `0 0 4px ${row.color}88`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

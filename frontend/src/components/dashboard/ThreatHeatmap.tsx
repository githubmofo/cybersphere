import { motion } from 'framer-motion';
import type { HeatmapCell } from '@/store/useDashboardStore';

interface ThreatHeatmapProps {
  heatmapData: HeatmapCell[];
}

const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

const SEVERITY_BASE: Record<string, string> = {
  Low:      'hsl(145, 70%, 50%)',
  Medium:   'hsl(45, 95%, 55%)',
  High:     'hsl(25, 90%, 55%)',
  Critical: 'hsl(0, 85%, 55%)',
};

/**
 * Threat heatmap: Y-axis = severity tiers, X-axis = time buckets.
 * Cell color intensity scales with event count.
 */
export function ThreatHeatmap({ heatmapData }: ThreatHeatmapProps) {
  // Get unique sorted time slots (last 20)
  const slots = [...new Set(heatmapData.map((c) => c.timeSlot))].sort().slice(-20);
  const maxCount = Math.max(...heatmapData.map((c) => c.count), 1);

  function getCell(slot: number, severity: string): HeatmapCell | undefined {
    return heatmapData.find((c) => c.timeSlot === slot && c.severity === severity);
  }

  function formatSlot(ts: number): string {
    return new Date(ts).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div
      style={{
        padding: '1.25rem 1.5rem',
        borderRadius: '0.875rem',
        background: 'hsl(210, 18%, 7%, 0.8)',
        border: '1px solid hsl(210, 15%, 14%)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <span
        style={{
          display: 'block',
          fontSize: '0.6875rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '1rem',
        }}
      >
        Threat Heatmap (Severity × Time)
      </span>

      {slots.length === 0 ? (
        <div
          style={{
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-muted)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Awaiting event data…
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {[...SEVERITIES].reverse().map((severity) => (
            <div key={severity} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  width: 64,
                  fontSize: '0.625rem',
                  fontFamily: 'var(--font-mono)',
                  color: SEVERITY_BASE[severity],
                  textAlign: 'right',
                  flexShrink: 0,
                }}
              >
                {severity}
              </span>
              <div style={{ display: 'flex', gap: '0.25rem', flex: 1, flexWrap: 'nowrap', overflowX: 'auto' }}>
                {slots.map((slot) => {
                  const cell = getCell(slot, severity);
                  const intensity = cell ? cell.count / maxCount : 0;
                  return (
                    <motion.div
                      key={slot}
                      title={`${severity} @ ${formatSlot(slot)}: ${cell?.count ?? 0} events`}
                      animate={{ opacity: intensity > 0 ? 1 : 0.15 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 3,
                        flexShrink: 0,
                        background:
                          intensity > 0
                            ? SEVERITY_BASE[severity]
                            : 'hsl(210, 15%, 12%)',
                        opacity: intensity > 0 ? 0.3 + intensity * 0.7 : 0.15,
                        boxShadow: intensity > 0.6 ? `0 0 6px ${SEVERITY_BASE[severity]}88` : 'none',
                        cursor: 'default',
                        transition: 'background 0.3s, opacity 0.3s',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Time axis */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <span style={{ width: 64, flexShrink: 0 }} />
            <div style={{ display: 'flex', gap: '0.25rem', flex: 1, overflowX: 'auto' }}>
              {slots.map((slot, i) => (
                <span
                  key={slot}
                  style={{
                    width: 20,
                    flexShrink: 0,
                    fontSize: '0.5rem',
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-mono)',
                    transform: 'rotate(-45deg)',
                    transformOrigin: 'top left',
                    display: i % 4 === 0 ? 'block' : 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatSlot(slot)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

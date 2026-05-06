import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { TimelineBucket } from '@/store/useDashboardStore';

interface AttackTimelineProps {
  timelineData: TimelineBucket[];
}

const ATTACK_COLORS = {
  DDoS: 'hsl(0, 85%, 55%)',
  'brute-force': 'hsl(25, 90%, 55%)',
  'port-scan': 'hsl(45, 95%, 55%)',
  botnet: 'hsl(270, 70%, 60%)',
  malware: 'hsl(310, 80%, 55%)',
};

/**
 * Full-width stacked area chart of attacks over time, bucketed by 30-second intervals.
 */
export function AttackTimeline({ timelineData }: AttackTimelineProps) {
  const formatted = timelineData.map((d) => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  }));

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
        Attack Timeline (30s buckets)
      </span>

      {formatted.length < 2 ? (
        <div
          style={{
            height: 200,
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
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={formatted} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              {Object.entries(ATTACK_COLORS).map(([key, color]) => (
                <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 15%, 12%)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#556677' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#556677' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: '#0a0f14',
                border: '1px solid #1a3a4a',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: '#e0e0e0',
                padding: '0.5rem 0.75rem',
              }}
              labelStyle={{ color: '#8899aa', marginBottom: 4 }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '0.6875rem', fontFamily: 'monospace', color: '#8899aa', paddingTop: 8 }}
            />
            {Object.entries(ATTACK_COLORS).map(([key, color]) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={color}
                strokeWidth={1.5}
                fill={`url(#grad-${key})`}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import type { TimelineBucket } from '@/store/useDashboardStore';

interface MiniSparklineProps {
  data: TimelineBucket[];
  dataKey?: string;
  color?: string;
  height?: number;
}

/**
 * Tiny inline area sparkline for StatCards — no axes, no labels.
 */
export function MiniSparkline({
  data,
  dataKey = 'total',
  color = '#00bcd4',
  height = 40,
}: MiniSparklineProps) {
  if (data.length < 2) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.625rem',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id={`spark-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${dataKey})`}
          dot={false}
          isAnimationActive={false}
        />
        <Tooltip
          contentStyle={{
            background: '#0a0f14',
            border: '1px solid #1a3a4a',
            borderRadius: '0.375rem',
            fontSize: '0.625rem',
            fontFamily: 'monospace',
            padding: '0.25rem 0.5rem',
            color: '#e0e0e0',
          }}
          itemStyle={{ color }}
          labelFormatter={() => ''}
          formatter={(v) => {
            const n = typeof v === 'number' ? v : 0;
            return [n, dataKey] as [number, string];
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

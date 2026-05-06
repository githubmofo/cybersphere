import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import type { AttackType, ThreatEvent } from '@/types';

interface AIInsightsProps {
  attackTypeDistribution: Record<AttackType, number>;
  avgConfidence: number;
  recentAnomalies: ThreatEvent[];
}

const ATTACK_COLORS: Record<AttackType, string> = {
  DDoS: 'hsl(0, 85%, 55%)',
  'brute-force': 'hsl(25, 90%, 55%)',
  'port-scan': 'hsl(45, 95%, 55%)',
  botnet: 'hsl(270, 70%, 60%)',
  malware: 'hsl(310, 80%, 55%)',
  normal: 'hsl(145, 70%, 50%)',
};

const SEVERITY_COLORS: Record<string, string> = {
  Critical: 'hsl(0, 85%, 55%)',
  High: 'hsl(25, 90%, 55%)',
  Medium: 'hsl(45, 95%, 55%)',
  Low: 'hsl(145, 70%, 50%)',
};

/**
 * AI-powered insights panel: attack distribution donut + recent anomalies.
 */
export function AIInsights({ attackTypeDistribution, avgConfidence, recentAnomalies }: AIInsightsProps) {
  const pieData = (Object.entries(attackTypeDistribution) as [AttackType, number][])
    .filter(([, v]) => v > 0)
    .map(([type, count]) => ({ name: type, value: count, color: ATTACK_COLORS[type] }));

  const total = pieData.reduce((s, d) => s + d.value, 0);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          AI Insights
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Avg Confidence</span>
          <span
            style={{
              fontSize: '0.875rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'hsl(185, 100%, 55%)',
            }}
          >
            {(avgConfidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Donut chart */}
      {pieData.length > 0 ? (
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={74}
              paddingAngle={3}
              dataKey="value"
              isAnimationActive
            >
              {pieData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
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
              formatter={(v) => {
                const count = typeof v === 'number' ? v : 0;
                return [`${count} events (${total > 0 ? ((count / total) * 100).toFixed(1) : 0}%)`, ''] as [string, string];
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '0.6875rem', fontFamily: 'monospace', color: '#8899aa' }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div
          style={{
            height: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-muted)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Start simulation to see data
        </div>
      )}

      {/* Recent anomalies */}
      {recentAnomalies.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <span
            style={{
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Recent Anomalies
          </span>
          {recentAnomalies.slice(0, 5).map((event) => (
            <motion.div
              key={event.event_id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.375rem 0.625rem',
                borderRadius: '0.375rem',
                background: 'hsl(210, 18%, 10%, 0.6)',
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <span style={{ color: ATTACK_COLORS[event.attack_type] }}>{event.attack_type}</span>
              <span
                style={{
                  padding: '0.125rem 0.4rem',
                  borderRadius: 9999,
                  background: `${SEVERITY_COLORS[event.severity]}22`,
                  color: SEVERITY_COLORS[event.severity],
                  border: `1px solid ${SEVERITY_COLORS[event.severity]}44`,
                  fontSize: '0.625rem',
                }}
              >
                {event.severity}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

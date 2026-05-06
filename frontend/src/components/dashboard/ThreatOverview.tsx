import { Shield, AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';
import { StatCard } from './StatCard';
import { MiniSparkline } from './MiniSparkline';
import type { TimelineBucket } from '@/store/useDashboardStore';

interface ThreatOverviewProps {
  totalAttacks: number;
  activeThreats: number;
  blockedCount: number;
  falsePositives: number;
  timelineData: TimelineBucket[];
}

const PANEL_STYLE: React.CSSProperties = {
  padding: '1rem 1.25rem',
  borderRadius: '0.875rem',
  background: 'hsl(210, 18%, 7%, 0.8)',
  border: '1px solid hsl(210, 15%, 14%)',
  backdropFilter: 'blur(16px)',
};

/**
 * Top stat row: 4 KPI cards with inline sparklines.
 */
export function ThreatOverview({
  totalAttacks,
  activeThreats,
  blockedCount,
  falsePositives,
  timelineData,
}: ThreatOverviewProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
      }}
    >
      <div style={PANEL_STYLE}>
        <StatCard
          icon={<AlertOctagon size={16} />}
          label="Total Attacks"
          value={totalAttacks}
          colorScheme="red"
        />
        <MiniSparkline data={timelineData} dataKey="total" color="hsl(0,85%,55%)" />
      </div>

      <div style={PANEL_STYLE}>
        <StatCard
          icon={<AlertTriangle size={16} />}
          label="Active Threats"
          value={activeThreats}
          trend="up"
          colorScheme="amber"
        />
        <MiniSparkline data={timelineData} dataKey="DDoS" color="hsl(45,95%,55%)" />
      </div>

      <div style={PANEL_STYLE}>
        <StatCard
          icon={<CheckCircle size={16} />}
          label="Blocked"
          value={blockedCount}
          colorScheme="green"
        />
        <MiniSparkline data={timelineData} dataKey="normal" color="hsl(145,70%,50%)" />
      </div>

      <div style={PANEL_STYLE}>
        <StatCard
          icon={<Shield size={16} />}
          label="False Positives"
          value={falsePositives}
          colorScheme="cyan"
        />
        <MiniSparkline data={timelineData} dataKey="port-scan" color="hsl(185,100%,50%)" />
      </div>
    </div>
  );
}

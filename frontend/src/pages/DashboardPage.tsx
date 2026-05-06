import { useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { ArrowLeft, Shield, Activity } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { ThreatOverview } from '@/components/dashboard/ThreatOverview';
import { NetworkHealth } from '@/components/dashboard/NetworkHealth';
import { AIInsights } from '@/components/dashboard/AIInsights';
import { AttackTimeline } from '@/components/dashboard/AttackTimeline';
import { ThreatHeatmap } from '@/components/dashboard/ThreatHeatmap';

// Cubic-bezier equivalent of easeOut — satisfies Framer Motion 12 strict Easing type
const EASE_OUT = [0, 0, 0.2, 1] as const;

const PANEL_ENTRY: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: EASE_OUT },
  }),
};

/**
 * Prefetch the VisualizerPage JS chunk imperatively.
 * This is a fire-and-forget dynamic import — the browser downloads and
 * caches the chunk but does NOT execute the component.
 * Result: when the user clicks "3D View", the chunk is already in cache
 * so React.lazy resolves instantly with no network wait.
 */
function prefetchVisualizer() {
  import('@/pages/VisualizerPage').catch(() => {
    // Silently ignore — this is a best-effort prefetch only
  });
}

/**
 * Analytics dashboard page — real-time threat visualization with charts.
 * Connects to the same WebSocket as the 3D visualizer.
 */
export function DashboardPage() {
  const connectionStatus = useAppStore((s) => s.connectionStatus);
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
  const { connect } = useWebSocket(wsUrl);
  const navigate = useNavigate();

  useEffect(() => {
    connect();
  }, [connect]);

  // ── Prefetch the 3D visualizer chunk as soon as this page mounts ──────────
  // By the time the user reads the dashboard and decides to click "3D View",
  // the ~300KB Three.js/R3F chunk will already be downloaded and cached.
  useEffect(() => {
    // Use requestIdleCallback to avoid competing with the dashboard's own paint
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(prefetchVisualizer, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }
    // Fallback for browsers without rIC (Safari < 16.4)
    const t = setTimeout(prefetchVisualizer, 500);
    return () => clearTimeout(t);
  }, []);

  // Navigate programmatically for instant feedback before the chunk resolves
  const handleGoTo3D = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      navigate('/visualizer');
    },
    [navigate]
  );

  const metrics = useDashboardMetrics();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080d12',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Navbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.5rem',
          background: 'hsl(210, 18%, 6%, 0.9)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid hsl(210, 15%, 12%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.375rem 0.625rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-muted)',
              background: 'hsl(210, 18%, 10%, 0.7)',
              border: '1px solid hsl(210, 15%, 15%)',
              textDecoration: 'none',
            }}
            aria-label="Back to home"
          >
            <ArrowLeft size={13} />
            Back
          </Link>

          <Link
            to="/"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', cursor: 'pointer' }}
            aria-label="Go to home page"
          >
            <Shield size={18} style={{ color: 'var(--color-accent-cyan)' }} />
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              CyberSphere
            </span>
            <span
              style={{
                padding: '0.125rem 0.5rem',
                borderRadius: 9999,
                fontSize: '0.625rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                background: 'hsl(185, 100%, 40%, 0.12)',
                color: 'hsl(185, 100%, 55%)',
                border: '1px solid hsl(185, 100%, 40%, 0.3)',
              }}
            >
              ANALYTICS
            </span>
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <motion.div
              animate={connectionStatus === 'connected' ? { scale: [1, 1.4, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: connectionStatus === 'connected' ? 'hsl(145, 70%, 50%)' : 'hsl(0, 85%, 55%)',
              }}
            />
            <span
              style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                color: connectionStatus === 'connected' ? 'hsl(145, 70%, 50%)' : 'var(--color-text-muted)',
              }}
            >
              {connectionStatus === 'connected' ? 'LIVE' : connectionStatus.toUpperCase()}
            </span>
          </div>

          <Link
            to="/visualizer"
            onClick={handleGoTo3D}
            onMouseEnter={prefetchVisualizer}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.375rem 0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: 'hsl(185, 100%, 55%)',
              background: 'hsl(185, 100%, 40%, 0.1)',
              border: '1px solid hsl(185, 100%, 40%, 0.25)',
              textDecoration: 'none',
              transition: 'background 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <Activity size={13} />
            3D View
          </Link>
        </div>
      </header>

      {/* Dashboard grid */}
      <main style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 1600, margin: '0 auto' }}>
        <motion.div custom={0} variants={PANEL_ENTRY} initial="hidden" animate="visible">
          <ThreatOverview
            totalAttacks={metrics.totalAttacks}
            activeThreats={metrics.activeThreats}
            blockedCount={metrics.blockedCount}
            falsePositives={metrics.falsePositives}
            timelineData={metrics.timelineData}
          />
        </motion.div>

        <motion.div custom={1} variants={PANEL_ENTRY} initial="hidden" animate="visible">
          <AttackTimeline timelineData={metrics.timelineData} />
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <motion.div custom={2} variants={PANEL_ENTRY} initial="hidden" animate="visible">
            <NetworkHealth healthScore={metrics.healthScore} nodeBreakdown={metrics.nodeBreakdown} />
          </motion.div>
          <motion.div custom={3} variants={PANEL_ENTRY} initial="hidden" animate="visible">
            <AIInsights
              attackTypeDistribution={metrics.attackTypeDistribution}
              avgConfidence={metrics.avgConfidence}
              recentAnomalies={metrics.recentAnomalies}
            />
          </motion.div>
        </div>

        <motion.div custom={4} variants={PANEL_ENTRY} initial="hidden" animate="visible">
          <ThreatHeatmap heatmapData={metrics.heatmapData} />
        </motion.div>
      </main>
    </div>
  );
}

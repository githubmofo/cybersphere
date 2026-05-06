import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useVisualizerStore } from '@/store/useVisualizerStore';

/**
 * Bridges the global event stream (useAppStore) and node state (useVisualizerStore)
 * into the dashboard store. Throttled to 500ms to prevent render storms.
 */
export function useDashboardMetrics() {
  const events = useAppStore((s) => s.events);
  const nodes = useVisualizerStore((s) => s.nodes);
  const processEvent = useDashboardStore((s) => s.processEvent);
  const setNodeBreakdown = useDashboardStore((s) => s.setNodeBreakdown);

  const lastProcessedCount = useRef(0);
  const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Process new events — only the delta since last run
  useEffect(() => {
    const newEvents = events.slice(lastProcessedCount.current);
    if (newEvents.length === 0) return;

    // Throttle: process at most once per 500ms
    if (throttleRef.current) return;

    throttleRef.current = setTimeout(() => {
      const latestCount = useAppStore.getState().events.length;
      const toProcess = useAppStore.getState().events.slice(lastProcessedCount.current);

      toProcess.forEach((e) => processEvent(e));
      lastProcessedCount.current = latestCount;
      throttleRef.current = null;
    }, 500);
  }, [events, processEvent]);

  // Sync node breakdown whenever nodes change
  useEffect(() => {
    const breakdown = nodes.reduce(
      (acc, node) => {
        acc[node.state] = (acc[node.state] ?? 0) + 1;
        return acc;
      },
      { healthy: 0, suspicious: 0, compromised: 0 } as { healthy: number; suspicious: number; compromised: number }
    );
    setNodeBreakdown(breakdown);
  }, [nodes, setNodeBreakdown]);

  return {
    totalAttacks: useDashboardStore((s) => s.totalAttacks),
    activeThreats: useDashboardStore((s) => s.activeThreats),
    blockedCount: useDashboardStore((s) => s.blockedCount),
    falsePositives: useDashboardStore((s) => s.falsePositives),
    healthScore: useDashboardStore((s) => s.healthScore),
    avgConfidence: useDashboardStore((s) => s.avgConfidence),
    nodeBreakdown: useDashboardStore((s) => s.nodeBreakdown),
    attackTypeDistribution: useDashboardStore((s) => s.attackTypeDistribution),
    timelineData: useDashboardStore((s) => s.timelineData),
    heatmapData: useDashboardStore((s) => s.heatmapData),
    recentAnomalies: useDashboardStore((s) => s.recentAnomalies),
  };
}

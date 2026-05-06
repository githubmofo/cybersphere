import { create } from 'zustand';
import type { ThreatEvent, AttackType } from '@/types';

export interface TimelineBucket {
  timestamp: number;
  total: number;
  DDoS: number;
  'brute-force': number;
  'port-scan': number;
  botnet: number;
  malware: number;
  normal: number;
}

export interface HeatmapCell {
  timeSlot: number;   // unix seconds bucket (30s)
  severity: string;
  count: number;
}

interface DashboardState {
  totalAttacks: number;
  activeThreats: number;
  blockedCount: number;
  falsePositives: number;
  healthScore: number;
  avgConfidence: number;
  nodeBreakdown: { healthy: number; suspicious: number; compromised: number };
  attackTypeDistribution: Record<AttackType, number>;
  timelineData: TimelineBucket[];   // ring buffer — last 300 points
  heatmapData: HeatmapCell[];
  recentAnomalies: ThreatEvent[];   // last 10 high-severity events

  // Actions
  processEvent: (event: ThreatEvent) => void;
  setNodeBreakdown: (breakdown: { healthy: number; suspicious: number; compromised: number }) => void;
  resetMetrics: () => void;
}

const MAX_TIMELINE = 300;
const MAX_ANOMALIES = 10;
const BUCKET_SIZE_MS = 30_000; // 30-second buckets

function emptyDistribution(): Record<AttackType, number> {
  return { DDoS: 0, 'brute-force': 0, 'port-scan': 0, botnet: 0, malware: 0, normal: 0 };
}

function computeHealth(breakdown: { healthy: number; suspicious: number; compromised: number }): number {
  const total = breakdown.healthy + breakdown.suspicious + breakdown.compromised;
  if (total === 0) return 100;
  return Math.round(
    ((breakdown.healthy * 100 + breakdown.suspicious * 40 + breakdown.compromised * 0) / total)
  );
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  totalAttacks: 0,
  activeThreats: 0,
  blockedCount: 0,
  falsePositives: 0,
  healthScore: 100,
  avgConfidence: 0,
  nodeBreakdown: { healthy: 0, suspicious: 0, compromised: 0 },
  attackTypeDistribution: emptyDistribution(),
  timelineData: [],
  heatmapData: [],
  recentAnomalies: [],

  processEvent: (event) =>
    set((state) => {
      const isMalicious = event.is_malicious;
      const isAnomaly = event.severity === 'Critical' || event.severity === 'High';

      // Timestamp bucketing
      const bucketTs = Math.floor(Date.now() / BUCKET_SIZE_MS) * BUCKET_SIZE_MS;
      const lastBucket = state.timelineData[state.timelineData.length - 1];

      let timelineData: TimelineBucket[];
      if (lastBucket && lastBucket.timestamp === bucketTs) {
        // Update current bucket in place
        timelineData = [
          ...state.timelineData.slice(0, -1),
          {
            ...lastBucket,
            total: lastBucket.total + 1,
            [event.attack_type]: (lastBucket[event.attack_type as keyof TimelineBucket] as number) + 1,
          },
        ];
      } else {
        // New bucket
        const newBucket: TimelineBucket = {
          timestamp: bucketTs,
          total: 1,
          DDoS: 0, 'brute-force': 0, 'port-scan': 0, botnet: 0, malware: 0, normal: 0,
          [event.attack_type]: 1,
        };
        timelineData = [
          ...(state.timelineData.length >= MAX_TIMELINE
            ? state.timelineData.slice(1)
            : state.timelineData),
          newBucket,
        ];
      }

      // Heatmap (time × severity)
      const heatTs = Math.floor(Date.now() / 60_000) * 60_000; // 1-min slot
      const existingCell = state.heatmapData.find(
        (c) => c.timeSlot === heatTs && c.severity === event.severity
      );
      const heatmapData = existingCell
        ? state.heatmapData.map((c) =>
            c.timeSlot === heatTs && c.severity === event.severity
              ? { ...c, count: c.count + 1 }
              : c
          )
        : [...state.heatmapData.slice(-200), { timeSlot: heatTs, severity: event.severity, count: 1 }];

      // Anomalies list (ring buffer of high-severity events)
      const recentAnomalies =
        isAnomaly
          ? [event, ...state.recentAnomalies].slice(0, MAX_ANOMALIES)
          : state.recentAnomalies;

      // Running avg confidence from anomaly_score (proxy for confidence)
      const newTotal = state.totalAttacks + 1;
      const newAvgConf = isMalicious
        ? (state.avgConfidence * (newTotal - 1) + event.anomaly_score) / newTotal
        : state.avgConfidence;

      return {
        totalAttacks: newTotal,
        activeThreats: isMalicious ? state.activeThreats + 1 : state.activeThreats,
        blockedCount: isMalicious ? state.blockedCount + 1 : state.blockedCount,
        falsePositives: !isMalicious && event.risk_score > 30 ? state.falsePositives + 1 : state.falsePositives,
        avgConfidence: Math.round(newAvgConf * 100) / 100,
        attackTypeDistribution: {
          ...state.attackTypeDistribution,
          [event.attack_type]: state.attackTypeDistribution[event.attack_type] + 1,
        },
        timelineData,
        heatmapData,
        recentAnomalies,
      };
    }),

  setNodeBreakdown: (breakdown) =>
    set({ nodeBreakdown: breakdown, healthScore: computeHealth(breakdown) }),

  resetMetrics: () =>
    set({
      totalAttacks: 0,
      activeThreats: 0,
      blockedCount: 0,
      falsePositives: 0,
      healthScore: 100,
      avgConfidence: 0,
      attackTypeDistribution: emptyDistribution(),
      timelineData: [],
      heatmapData: [],
      recentAnomalies: [],
    }),
}));

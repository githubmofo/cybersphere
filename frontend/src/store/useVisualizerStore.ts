import { create } from 'zustand';
import type { NetworkNode, NodeState } from '@/types';

export interface EdgeDef {
  source: string;
  target: string;
}

export interface ActiveTrail {
  id: string;
  sourceId: string;
  targetId: string;
  color: string;
  progress: number;
  attackType: string;
}

interface VisualizerState {
  viewMode: 'globe' | 'graph';
  nodes: NetworkNode[];
  edges: EdgeDef[];
  activeTrails: ActiveTrail[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  isSimulating: boolean;
  scenario: string;
  nodePositions: Map<string, [number, number, number]>;

  // Actions
  setViewMode: (mode: 'globe' | 'graph') => void;
  setNodes: (nodes: NetworkNode[]) => void;
  setEdges: (edges: EdgeDef[]) => void;
  updateNodeState: (nodeId: string, state: NodeState, riskScore?: number) => void;
  addTrail: (trail: ActiveTrail) => void;
  removeTrail: (trailId: string) => void;
  /** Instantly wipe all active trails — call on Stop for immediate visual quiet */
  clearTrails: () => void;
  /** Reset every node back to healthy state — call on Stop to clear visual alerts */
  resetNodeStates: () => void;
  selectNode: (nodeId: string | null) => void;
  setHoveredNode: (nodeId: string | null) => void;
  setSimulating: (active: boolean, scenario?: string) => void;
  setNodePositions: (positions: Map<string, [number, number, number]>) => void;
}

const MAX_TRAILS = 50;

export const useVisualizerStore = create<VisualizerState>()((set) => ({
  viewMode: 'graph',
  nodes: [],
  edges: [],
  activeTrails: [],
  selectedNodeId: null,
  hoveredNodeId: null,
  isSimulating: false,
  scenario: 'mixed',
  nodePositions: new Map(),

  setViewMode: (mode) => set({ viewMode: mode }),

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  updateNodeState: (nodeId, state, riskScore) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.node_id === nodeId
          ? { ...n, state, ...(riskScore !== undefined ? { current_risk_score: riskScore } : {}) }
          : n
      ),
    })),

  addTrail: (trail) =>
    set((s) => ({
      activeTrails:
        s.activeTrails.length >= MAX_TRAILS
          ? [...s.activeTrails.slice(1), trail]
          : [...s.activeTrails, trail],
    })),

  removeTrail: (trailId) =>
    set((s) => ({
      activeTrails: s.activeTrails.filter((t) => t.id !== trailId),
    })),

  clearTrails: () => set({ activeTrails: [] }),

  resetNodeStates: () =>
    set((s) => ({
      nodes: s.nodes.map((n) => ({ ...n, state: 'healthy' as NodeState, current_risk_score: 0 })),
    })),

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  setHoveredNode: (nodeId) => set({ hoveredNodeId: nodeId }),

  setSimulating: (active, scenario) =>
    set({ isSimulating: active, ...(scenario ? { scenario } : {}) }),

  setNodePositions: (positions) => set({ nodePositions: positions }),
}));

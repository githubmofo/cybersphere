import { create } from 'zustand';
import type { NetworkNode, ThreatEvent } from '@/types';

interface AppState {
  /** WebSocket connection status */
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';

  /** Current page/view */
  activeView: 'landing' | 'visualizer' | 'dashboard';

  /** Global event log (ring buffer — kept to last 1000) */
  events: ThreatEvent[];

  /** All network nodes */
  nodes: NetworkNode[];

  /** Actions */
  setConnectionStatus: (status: AppState['connectionStatus']) => void;
  setActiveView: (view: AppState['activeView']) => void;
  addEvent: (event: ThreatEvent) => void;
  setNodes: (nodes: NetworkNode[]) => void;
  updateNode: (nodeId: string, updates: Partial<NetworkNode>) => void;
}

const MAX_EVENTS = 1000;

export const useAppStore = create<AppState>()((set) => ({
  connectionStatus: 'disconnected',
  activeView: 'landing',
  events: [],
  nodes: [],

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  setActiveView: (view) => set({ activeView: view }),

  addEvent: (event) =>
    set((state) => {
      // Reuse the same array reference with splice to avoid allocating
      // a brand-new array 10 times per second which forces all subscribers
      // to re-render even if they only care about the count.
      const next = state.events.length >= MAX_EVENTS
        ? [...state.events.slice(-(MAX_EVENTS - 1)), event]
        : [...state.events, event];
      return { events: next };
    }),

  setNodes: (nodes) => set({ nodes }),

  updateNode: (nodeId, updates) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.node_id === nodeId ? { ...n, ...updates } : n
      ),
    })),
}));

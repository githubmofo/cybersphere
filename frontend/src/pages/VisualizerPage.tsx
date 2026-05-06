import { useEffect } from 'react';
import { CyberScene } from '@/scenes/CyberScene';
import { ViewToggle } from '@/components/viz/ViewToggle';
import { SimControls } from '@/components/viz/SimControls';
import { PlaybackControls } from '@/components/playback/PlaybackControls';
import { TimelineSlider } from '@/components/playback/TimelineSlider';
import { NodePanel } from '@/components/inspection/NodePanel';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useVisualizerStore } from '@/store/useVisualizerStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useNodeInteraction } from '@/hooks/useNodeInteraction';
import { usePlayback } from '@/hooks/usePlayback';
import { Shield, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { NetworkNode } from '@/types';

/** Demo topology for when backend is not connected */
const DEMO_NODES: NetworkNode[] = [
  { node_id: 'fw-1', ip_address: '10.0.0.1', role: 'firewall', location: 'Perimeter', state: 'healthy', last_seen: new Date().toISOString(), tags: ['perimeter'], current_risk_score: 5 },
  { node_id: 'fw-2', ip_address: '10.0.0.2', role: 'firewall', location: 'Perimeter', state: 'healthy', last_seen: new Date().toISOString(), tags: ['perimeter'], current_risk_score: 3 },
  { node_id: 'web-1', ip_address: '10.0.1.10', role: 'web-server', location: 'DMZ', state: 'healthy', last_seen: new Date().toISOString(), tags: ['frontend'], current_risk_score: 12 },
  { node_id: 'web-2', ip_address: '10.0.1.11', role: 'web-server', location: 'DMZ', state: 'suspicious', last_seen: new Date().toISOString(), tags: ['frontend'], current_risk_score: 35 },
  { node_id: 'web-3', ip_address: '10.0.1.12', role: 'web-server', location: 'DMZ', state: 'healthy', last_seen: new Date().toISOString(), tags: ['frontend'], current_risk_score: 8 },
  { node_id: 'api-1', ip_address: '10.0.2.10', role: 'api-gateway', location: 'Internal', state: 'healthy', last_seen: new Date().toISOString(), tags: ['backend'], current_risk_score: 10 },
  { node_id: 'api-2', ip_address: '10.0.2.11', role: 'api-gateway', location: 'Internal', state: 'healthy', last_seen: new Date().toISOString(), tags: ['backend'], current_risk_score: 7 },
  { node_id: 'db-1', ip_address: '10.0.3.10', role: 'database', location: 'Secure Zone', state: 'healthy', last_seen: new Date().toISOString(), tags: ['data'], current_risk_score: 15 },
  { node_id: 'db-2', ip_address: '10.0.3.11', role: 'database', location: 'Secure Zone', state: 'healthy', last_seen: new Date().toISOString(), tags: ['data'], current_risk_score: 20 },
  { node_id: 'db-3', ip_address: '10.0.3.12', role: 'database', location: 'Secure Zone', state: 'compromised', last_seen: new Date().toISOString(), tags: ['data', 'critical'], current_risk_score: 78 },
  { node_id: 'dns-1', ip_address: '10.0.4.10', role: 'dns-server', location: 'Infra', state: 'healthy', last_seen: new Date().toISOString(), tags: ['infra'], current_risk_score: 4 },
  { node_id: 'dns-2', ip_address: '10.0.4.11', role: 'dns-server', location: 'Infra', state: 'healthy', last_seen: new Date().toISOString(), tags: ['infra'], current_risk_score: 6 },
  { node_id: 'mail-1', ip_address: '10.0.5.10', role: 'mail-server', location: 'DMZ', state: 'suspicious', last_seen: new Date().toISOString(), tags: ['comms'], current_risk_score: 42 },
  { node_id: 'mail-2', ip_address: '10.0.5.11', role: 'mail-server', location: 'DMZ', state: 'healthy', last_seen: new Date().toISOString(), tags: ['comms'], current_risk_score: 9 },
  { node_id: 'iot-1', ip_address: '10.0.6.10', role: 'iot-device', location: 'Edge', state: 'healthy', last_seen: new Date().toISOString(), tags: ['edge'], current_risk_score: 22 },
  { node_id: 'iot-2', ip_address: '10.0.6.11', role: 'iot-device', location: 'Edge', state: 'healthy', last_seen: new Date().toISOString(), tags: ['edge'], current_risk_score: 18 },
  { node_id: 'iot-3', ip_address: '10.0.6.12', role: 'iot-device', location: 'Edge', state: 'compromised', last_seen: new Date().toISOString(), tags: ['edge', 'vulnerable'], current_risk_score: 85 },
  { node_id: 'iot-4', ip_address: '10.0.6.13', role: 'iot-device', location: 'Edge', state: 'healthy', last_seen: new Date().toISOString(), tags: ['edge'], current_risk_score: 11 },
  { node_id: 'iot-5', ip_address: '10.0.6.14', role: 'iot-device', location: 'Edge', state: 'suspicious', last_seen: new Date().toISOString(), tags: ['edge'], current_risk_score: 55 },
  { node_id: 'iot-6', ip_address: '10.0.6.15', role: 'iot-device', location: 'Edge', state: 'healthy', last_seen: new Date().toISOString(), tags: ['edge'], current_risk_score: 14 },
];

const DEMO_EDGES = [
  { source: 'fw-1', target: 'web-1' }, { source: 'fw-1', target: 'web-2' }, { source: 'fw-1', target: 'web-3' },
  { source: 'fw-2', target: 'api-1' }, { source: 'fw-2', target: 'api-2' },
  { source: 'web-1', target: 'api-1' }, { source: 'web-2', target: 'api-1' }, { source: 'web-3', target: 'api-2' },
  { source: 'api-1', target: 'db-1' }, { source: 'api-1', target: 'db-2' }, { source: 'api-2', target: 'db-3' },
  { source: 'dns-1', target: 'fw-1' }, { source: 'dns-2', target: 'fw-2' },
  { source: 'mail-1', target: 'api-1' }, { source: 'mail-2', target: 'api-2' },
  { source: 'iot-1', target: 'fw-1' }, { source: 'iot-2', target: 'fw-2' }, { source: 'iot-3', target: 'fw-1' },
  { source: 'iot-4', target: 'fw-2' }, { source: 'iot-5', target: 'fw-1' }, { source: 'iot-6', target: 'fw-2' },
];

export function VisualizerPage() {
  const setNodes = useVisualizerStore((s) => s.setNodes);
  const setEdges = useVisualizerStore((s) => s.setEdges);
  const selectNode = useVisualizerStore((s) => s.selectNode);

  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
  const { connect } = useWebSocket(wsUrl);
  const { getSelectedNode } = useNodeInteraction();

  // Initialise playback ring buffer feed (side-effect only)
  usePlayback();

  useEffect(() => {
    setNodes(DEMO_NODES);
    setEdges(DEMO_EDGES);
    connect();
  }, [setNodes, setEdges, connect]);

  const selectedNode = getSelectedNode();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', background: '#0a0f14' }}>
      {/* 3D Canvas — fills entire viewport */}
      <CyberScene />

      {/* ── Top-left: Back + Title ── */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 10,
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.4375rem 0.75rem',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-muted)',
            background: 'hsl(210, 18%, 8%, 0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid hsl(210, 15%, 15%, 0.5)',
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
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
            CyberSphere
          </span>
          <span
            style={{
              padding: '0.125rem 0.5rem',
              borderRadius: 9999,
              fontSize: '0.5625rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              background: 'hsl(185, 100%, 40%, 0.12)',
              color: 'hsl(185, 100%, 55%)',
              border: '1px solid hsl(185, 100%, 40%, 0.3)',
            }}
          >
            3D
          </span>
        </Link>
      </div>

      {/* ── Top-right: Controls ── */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: selectedNode ? '320px' : '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          zIndex: 10,
          transition: 'right 0.3s ease',
        }}
      >
        <Link
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.4375rem 0.75rem',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: 'hsl(185, 100%, 55%)',
            background: 'hsl(185, 100%, 40%, 0.1)',
            border: '1px solid hsl(185, 100%, 40%, 0.25)',
            textDecoration: 'none',
          }}
          aria-label="Go to analytics dashboard"
        >
          <LayoutDashboard size={13} />
          Analytics
        </Link>
        <PlaybackControls />
        <ViewToggle />
        <SimControls />
      </div>

      {/* ── Bottom-center: Timeline slider (replay mode only) ── */}
      <div
        style={{
          position: 'absolute',
          bottom: '1.25rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
        }}
      >
        <TimelineSlider />
      </div>

      {/* ── Bottom-left: Connection status ── */}
      <div
        style={{
          position: 'absolute',
          bottom: '1.25rem',
          left: '1rem',
          zIndex: 10,
        }}
      >
        <StatusIndicator />
      </div>

      {/* ── Right side: Node inspection panel ── */}
      <NodePanel
        node={selectedNode ?? null}
        onClose={() => selectNode(null)}
      />
    </div>
  );
}

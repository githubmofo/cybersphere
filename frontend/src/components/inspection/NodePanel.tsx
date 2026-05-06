import { AnimatePresence, motion } from 'framer-motion';
import { X, Server, Shield, Globe, Database, Wifi, Mail, Activity } from 'lucide-react';
import { RiskGauge } from './RiskGauge';

import { EventTable } from './EventTable';
import { useAppStore } from '@/store/useAppStore';
import type { NetworkNode, NodeRole } from '@/types';

interface NodePanelProps {
  node: NetworkNode | null;
  onClose: () => void;
}

const ROLE_ICONS: Record<NodeRole, React.ReactNode> = {
  'api-gateway': <Globe size={16} />,
  'web-server': <Activity size={16} />,
  'database': <Database size={16} />,
  'firewall': <Shield size={16} />,
  'iot-device': <Wifi size={16} />,
  'dns-server': <Server size={16} />,
  'mail-server': <Mail size={16} />,
};

const STATE_COLORS = {
  healthy: 'hsl(145, 70%, 50%)',
  suspicious: 'hsl(45, 95%, 55%)',
  compromised: 'hsl(0, 85%, 55%)',
};

const EASE_OUT = [0, 0, 0.2, 1] as const;

/**
 * Slide-in node inspection panel triggered by clicking a node in the 3D scene.
 * Shows risk gauge, stats, metadata, and recent events.
 */
export function NodePanel({ node, onClose }: NodePanelProps) {
  const events = useAppStore((s) => s.events);

  const nodeEventCount = node
    ? events.filter((e) => e.source_node_id === node.node_id || e.target_node_id === node.node_id).length
    : 0;
  const maliciousCount = node
    ? events.filter(
        (e) => (e.source_node_id === node.node_id || e.target_node_id === node.node_id) && e.is_malicious
      ).length
    : 0;

  return (
    <AnimatePresence>
      {node && (
        <motion.aside
          key="node-panel"
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          style={{
            position: 'absolute',
            top: '4.5rem',
            right: '1rem',
            bottom: '1rem',
            width: 300,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
            padding: '1.125rem 1.25rem',
            borderRadius: '0.875rem',
            background: 'hsl(210, 18%, 7%, 0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid hsl(210, 15%, 14%)',
            overflowY: 'auto',
            zIndex: 20,
            boxShadow: '0 8px 40px hsl(210, 18%, 4%, 0.6)',
          }}
          role="complementary"
          aria-label="Node inspection panel"
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--color-accent-cyan)' }}>
                {ROLE_ICONS[node.role]}
              </span>
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {node.node_id}
                </div>
                <div
                  style={{
                    fontSize: '0.625rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {node.ip_address}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  padding: '0.125rem 0.5rem',
                  borderRadius: 9999,
                  fontSize: '0.5625rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  background: `${STATE_COLORS[node.state]}22`,
                  color: STATE_COLORS[node.state],
                  border: `1px solid ${STATE_COLORS[node.state]}44`,
                }}
              >
                {node.state.toUpperCase()}
              </span>
              <button
                onClick={onClose}
                aria-label="Close node panel"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: '0.375rem',
                  background: 'hsl(210, 18%, 12%)',
                  border: '1px solid hsl(210, 15%, 18%)',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: 0,
                }}
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Risk gauge + stats row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <RiskGauge score={node.current_risk_score} size={88} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Total Events', value: nodeEventCount, color: 'var(--color-text-primary)' },
                { label: 'Malicious', value: maliciousCount, color: 'hsl(0, 85%, 60%)' },
                { label: 'Risk Score', value: node.current_risk_score, color: node.current_risk_score > 60 ? 'hsl(0, 85%, 60%)' : node.current_risk_score > 30 ? 'hsl(45, 95%, 55%)' : 'hsl(145, 70%, 50%)' },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                    {row.label}
                  </span>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: row.color,
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div
            style={{
              padding: '0.75rem',
              borderRadius: '0.5rem',
              background: 'hsl(210, 18%, 9%, 0.6)',
              border: '1px solid hsl(210, 15%, 13%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}
          >
            <span
              style={{
                fontSize: '0.5625rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.125rem',
              }}
            >
              Metadata
            </span>
            {[
              { label: 'Role', value: node.role },
              { label: 'Location', value: node.location || 'N/A' },
              { label: 'Last Seen', value: new Date(node.last_seen).toLocaleTimeString() },
            ].map((row) => (
              <div
                key={row.label}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                  {row.label}
                </span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}

            {/* Tags */}
            {node.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                {node.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: '0.125rem 0.375rem',
                      borderRadius: 9999,
                      fontSize: '0.5625rem',
                      fontFamily: 'var(--font-mono)',
                      background: 'hsl(185, 100%, 40%, 0.1)',
                      color: 'hsl(185, 100%, 55%)',
                      border: '1px solid hsl(185, 100%, 40%, 0.2)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Recent Events */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <span
              style={{
                fontSize: '0.5625rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Recent Events (last 20)
            </span>
            <EventTable nodeId={node.node_id} maxRows={20} />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

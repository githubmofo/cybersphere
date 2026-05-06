import { useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ThreatBadge } from './ThreatBadge';
import type { ThreatEvent } from '@/types';

interface EventTableProps {
  nodeId: string;
  maxRows?: number;
}

type SortKey = 'timestamp' | 'severity' | 'attack_type';
type SortDir = 'asc' | 'desc';

const SEVERITY_ORDER: Record<string, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

/**
 * Sortable recent-events table filtered to a specific node.
 * Shows last `maxRows` events for the node — auto-scoped.
 */
export function EventTable({ nodeId, maxRows = 20 }: EventTableProps) {
  const events = useAppStore((s) => s.events);
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const nodeEvents = useMemo(() => {
    const filtered = events.filter(
      (e) => e.source_node_id === nodeId || e.target_node_id === nodeId
    );

    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'timestamp') {
        cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortKey === 'severity') {
        cmp = (SEVERITY_ORDER[a.severity] ?? 0) - (SEVERITY_ORDER[b.severity] ?? 0);
      } else if (sortKey === 'attack_type') {
        cmp = a.attack_type.localeCompare(b.attack_type);
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return sorted.slice(0, maxRows);
  }, [events, nodeId, sortKey, sortDir, maxRows]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function arrow(key: SortKey): string {
    if (sortKey !== key) return '';
    return sortDir === 'desc' ? ' ▾' : ' ▴';
  }

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '0.375rem 0.5rem',
    fontSize: '0.5625rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    cursor: 'pointer',
    userSelect: 'none',
    borderBottom: '1px solid hsl(210, 15%, 14%)',
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: '0.3rem 0.5rem',
    fontSize: '0.6875rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-text-secondary)',
    borderBottom: '1px solid hsl(210, 15%, 10%)',
    whiteSpace: 'nowrap',
  };

  return (
    <div
      style={{
        overflowY: 'auto',
        maxHeight: '220px',
        borderRadius: '0.5rem',
        border: '1px solid hsl(210, 15%, 14%)',
      }}
    >
      {nodeEvents.length === 0 ? (
        <div
          style={{
            padding: '1rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          No events for this node yet
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle} onClick={() => toggleSort('timestamp')}>
                Time{arrow('timestamp')}
              </th>
              <th style={thStyle} onClick={() => toggleSort('attack_type')}>
                Type{arrow('attack_type')}
              </th>
              <th style={thStyle} onClick={() => toggleSort('severity')}>
                Severity{arrow('severity')}
              </th>
            </tr>
          </thead>
          <tbody>
            {nodeEvents.map((e: ThreatEvent) => (
              <tr
                key={e.event_id}
                style={{
                  background: e.is_malicious ? 'hsl(0, 80%, 40%, 0.05)' : 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(el) => {
                  (el.currentTarget as HTMLTableRowElement).style.background =
                    'hsl(210, 18%, 10%, 0.8)';
                }}
                onMouseLeave={(el) => {
                  (el.currentTarget as HTMLTableRowElement).style.background = e.is_malicious
                    ? 'hsl(0, 80%, 40%, 0.05)'
                    : 'transparent';
                }}
              >
                <td style={tdStyle}>
                  {new Date(e.timestamp).toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </td>
                <td
                  style={{
                    ...tdStyle,
                    color: e.is_malicious ? 'hsl(0, 85%, 65%)' : 'var(--color-text-secondary)',
                  }}
                >
                  {e.attack_type}
                </td>
                <td style={tdStyle}>
                  <ThreatBadge severity={e.severity} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

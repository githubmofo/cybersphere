import { Globe, Network } from 'lucide-react';
import { useVisualizerStore } from '@/store/useVisualizerStore';

/**
 * Globe/Graph view mode toggle — glassmorphic pill buttons.
 */
export function ViewToggle() {
  const viewMode = useVisualizerStore((s) => s.viewMode);
  const setViewMode = useVisualizerStore((s) => s.setViewMode);

  const modes = [
    { key: 'graph' as const, label: 'Graph', icon: Network },
    { key: 'globe' as const, label: 'Globe', icon: Globe },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.25rem',
        padding: '0.25rem',
        borderRadius: '9999px',
        background: 'hsl(210, 18%, 8%, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid hsl(210, 15%, 15%, 0.5)',
      }}
    >
      {modes.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setViewMode(key)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 500,
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer',
            border: 'none',
            transition: 'all 0.2s ease',
            background: viewMode === key ? 'hsl(185, 100%, 50%, 0.15)' : 'transparent',
            color: viewMode === key ? 'var(--color-accent-cyan)' : 'var(--color-text-muted)',
          }}
          aria-label={`Switch to ${label} view`}
          aria-pressed={viewMode === key}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}

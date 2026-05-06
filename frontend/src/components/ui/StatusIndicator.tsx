import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

/**
 * Animated WS connection status indicator dot + label.
 */
export function StatusIndicator() {
  const status = useAppStore((s) => s.connectionStatus);

  const config = {
    connected: { color: 'hsl(145, 70%, 50%)', label: 'LIVE', pulse: true },
    reconnecting: { color: 'hsl(45, 95%, 55%)', label: 'RECONNECTING', pulse: true },
    disconnected: { color: 'hsl(0, 85%, 55%)', label: 'OFFLINE', pulse: false },
  };

  const { color, label, pulse } = config[status];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.375rem 0.75rem',
        borderRadius: 9999,
        background: 'hsl(210, 18%, 8%, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid hsl(210, 15%, 15%, 0.5)',
      }}
      role="status"
      aria-live="polite"
      aria-label={`Connection status: ${label}`}
    >
      <motion.div
        animate={pulse ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 6px ${color}88`,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: '0.6875rem',
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          color,
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </span>
    </div>
  );
}

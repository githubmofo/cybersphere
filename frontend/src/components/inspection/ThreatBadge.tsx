import type { Severity } from '@/types';

interface ThreatBadgeProps {
  severity: Severity;
  size?: 'sm' | 'md';
}

const SEVERITY_STYLES: Record<Severity, { bg: string; color: string; border: string; glow: string }> = {
  Critical: {
    bg: 'hsl(0, 80%, 45%, 0.18)',
    color: 'hsl(0, 85%, 65%)',
    border: 'hsl(0, 80%, 50%, 0.35)',
    glow: 'hsl(0, 85%, 50%)',
  },
  High: {
    bg: 'hsl(25, 85%, 45%, 0.18)',
    color: 'hsl(25, 90%, 60%)',
    border: 'hsl(25, 85%, 50%, 0.35)',
    glow: 'hsl(25, 90%, 50%)',
  },
  Medium: {
    bg: 'hsl(45, 90%, 45%, 0.18)',
    color: 'hsl(45, 95%, 60%)',
    border: 'hsl(45, 90%, 50%, 0.35)',
    glow: 'hsl(45, 95%, 50%)',
  },
  Low: {
    bg: 'hsl(145, 60%, 35%, 0.18)',
    color: 'hsl(145, 70%, 55%)',
    border: 'hsl(145, 60%, 40%, 0.35)',
    glow: 'hsl(145, 70%, 45%)',
  },
};

/**
 * Colored severity pill badge with subtle glow.
 */
export function ThreatBadge({ severity, size = 'sm' }: ThreatBadgeProps) {
  const styles = SEVERITY_STYLES[severity];
  const isLarge = size === 'md';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: isLarge ? '0.25rem 0.625rem' : '0.125rem 0.5rem',
        borderRadius: 9999,
        fontSize: isLarge ? '0.75rem' : '0.625rem',
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        letterSpacing: '0.04em',
        background: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.border}`,
        boxShadow: `0 0 6px ${styles.glow}44`,
        flexShrink: 0,
      }}
    >
      {severity.toUpperCase()}
    </span>
  );
}

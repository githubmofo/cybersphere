import { usePlaybackStore } from '@/store/usePlaybackStore';

/**
 * TimelineSlider — scrub bar for replay mode.
 * Shows a styled HTML range input styled to match the dark theme.
 */
export function TimelineSlider() {
  const mode = usePlaybackStore((s) => s.mode);
  const currentTime = usePlaybackStore((s) => s.currentTime);
  const startTime = usePlaybackStore((s) => s.startTime);
  const endTime = usePlaybackStore((s) => s.endTime);
  const seek = usePlaybackStore((s) => s.seek);
  const pause = usePlaybackStore((s) => s.pause);

  if (mode !== 'replay') return null;

  const duration = Math.max(endTime - startTime, 1);
  const progressPct = Math.min((currentTime / duration) * 100, 100);

  function formatMs(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.375rem 0.75rem',
        borderRadius: '0.5rem',
        background: 'hsl(210, 18%, 8%, 0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid hsl(45, 90%, 50%, 0.2)',
        minWidth: '220px',
      }}
    >
      <span
        style={{
          fontSize: '0.625rem',
          fontFamily: 'var(--font-mono)',
          color: 'hsl(45, 95%, 55%)',
          flexShrink: 0,
          minWidth: 32,
          textAlign: 'right',
        }}
      >
        {formatMs(currentTime)}
      </span>

      <div style={{ position: 'relative', flex: 1, height: 4 }}>
        {/* Track */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 9999,
            background: 'hsl(210, 15%, 18%)',
          }}
        />
        {/* Fill */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${progressPct}%`,
            borderRadius: 9999,
            background: 'hsl(45, 95%, 55%)',
            boxShadow: '0 0 6px hsl(45, 95%, 55%, 0.5)',
            transition: 'width 0.1s linear',
          }}
        />
        {/* Invisible range input on top */}
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          step={100}
          onChange={(e) => {
            pause();
            seek(Number(e.target.value));
          }}
          aria-label="Playback timeline scrubber"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            opacity: 0,
            cursor: 'pointer',
            height: '100%',
          }}
        />
      </div>

      <span
        style={{
          fontSize: '0.625rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-muted)',
          flexShrink: 0,
          minWidth: 32,
        }}
      >
        {formatMs(duration)}
      </span>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Play, Pause, Square, Rewind, FastForward } from 'lucide-react';
import { usePlaybackStore, type PlaybackSpeed } from '@/store/usePlaybackStore';

/**
 * PlaybackControls — floating control bar that appears when replay mode is active.
 * Enter/Exit replay + Play/Pause/Stop + speed toggle.
 */
export function PlaybackControls() {
  const mode = usePlaybackStore((s) => s.mode);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const playbackSpeed = usePlaybackStore((s) => s.playbackSpeed);
  const bufferedCount = usePlaybackStore((s) => s.eventBuffer.length);

  const enterReplay = usePlaybackStore((s) => s.enterReplay);
  const exitReplay = usePlaybackStore((s) => s.exitReplay);
  const play = usePlaybackStore((s) => s.play);
  const pause = usePlaybackStore((s) => s.pause);
  const setSpeed = usePlaybackStore((s) => s.setSpeed);

  const SPEEDS: PlaybackSpeed[] = [1, 2, 5];

  const btnBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.4rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
    background: 'hsl(210, 18%, 12%, 0.8)',
    color: 'var(--color-text-muted)',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {mode === 'live' ? (
        /* Enter Replay button */
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={enterReplay}
          disabled={bufferedCount < 10}
          style={{
            ...btnBase,
            padding: '0.375rem 0.75rem',
            gap: '0.375rem',
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            background: 'hsl(210, 18%, 10%, 0.85)',
            border: '1px solid hsl(210, 15%, 18%)',
            color: bufferedCount >= 10 ? 'hsl(45, 95%, 55%)' : 'var(--color-text-muted)',
            opacity: bufferedCount >= 10 ? 1 : 0.5,
          }}
          aria-label="Enter replay mode"
          title={bufferedCount < 10 ? 'Need at least 10 events to replay' : `Replay ${bufferedCount} buffered events`}
        >
          <Rewind size={12} />
          REPLAY ({bufferedCount})
        </motion.button>
      ) : (
        /* Replay controls */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0.625rem',
            borderRadius: '0.5rem',
            background: 'hsl(45, 90%, 40%, 0.15)',
            border: '1px solid hsl(45, 90%, 50%, 0.3)',
          }}
        >
          {/* Mode label */}
          <span
            style={{
              fontSize: '0.625rem',
              fontFamily: 'var(--font-mono)',
              color: 'hsl(45, 95%, 60%)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              marginRight: '0.25rem',
            }}
          >
            ⏮ REPLAY
          </span>

          {/* Play / Pause */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={isPlaying ? pause : play}
            style={{
              ...btnBase,
              background: isPlaying
                ? 'hsl(145, 60%, 40%, 0.2)'
                : 'hsl(45, 90%, 50%, 0.2)',
              color: isPlaying ? 'hsl(145, 70%, 55%)' : 'hsl(45, 95%, 60%)',
              border: `1px solid ${isPlaying ? 'hsl(145, 60%, 40%, 0.4)' : 'hsl(45, 90%, 50%, 0.4)'}`,
            }}
            aria-label={isPlaying ? 'Pause replay' : 'Play replay'}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          </motion.button>

          {/* Stop → exit replay */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={exitReplay}
            style={{
              ...btnBase,
              color: 'hsl(0, 85%, 60%)',
              border: '1px solid hsl(0, 85%, 40%, 0.3)',
            }}
            aria-label="Stop replay and return to live"
          >
            <Square size={13} />
          </motion.button>

          {/* Speed selector */}
          <div
            style={{
              display: 'flex',
              gap: '0.25rem',
              marginLeft: '0.25rem',
            }}
          >
            {SPEEDS.map((s) => (
              <motion.button
                key={s}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSpeed(s)}
                style={{
                  ...btnBase,
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.625rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  background:
                    playbackSpeed === s
                      ? 'hsl(185, 100%, 40%, 0.25)'
                      : 'hsl(210, 18%, 12%, 0.6)',
                  color:
                    playbackSpeed === s
                      ? 'hsl(185, 100%, 55%)'
                      : 'var(--color-text-muted)',
                  border: `1px solid ${playbackSpeed === s ? 'hsl(185, 100%, 40%, 0.4)' : 'transparent'}`,
                }}
                aria-label={`Set speed ${s}x`}
              >
                {s}×
              </motion.button>
            ))}
          </div>

          {/* Live button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={exitReplay}
            style={{
              ...btnBase,
              padding: '0.25rem 0.625rem',
              fontSize: '0.625rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              gap: '0.25rem',
              color: 'hsl(145, 70%, 55%)',
              border: '1px solid hsl(145, 60%, 40%, 0.3)',
            }}
            aria-label="Return to live mode"
          >
            <FastForward size={11} />
            LIVE
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

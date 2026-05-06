import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { usePlaybackStore } from '@/store/usePlaybackStore';
import type { ThreatEvent } from '@/types';

/**
 * usePlayback — bridges live event stream → ring buffer
 * and drives the playback ticker in replay mode.
 *
 * Returns a slice of events that the caller should feed to the
 * visualizer / dashboard — either the live stream or the replayed events.
 */
export function usePlayback(): {
  replayEvents: ThreatEvent[];
  isReplayMode: boolean;
  bufferedCount: number;
} {
  const events = useAppStore((s) => s.events);
  const addToBuffer = usePlaybackStore((s) => s.addToBuffer);
  const tick = usePlaybackStore((s) => s.tick);
  const mode = usePlaybackStore((s) => s.mode);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const currentTime = usePlaybackStore((s) => s.currentTime);
  const startTime = usePlaybackStore((s) => s.startTime);
  const eventBuffer = usePlaybackStore((s) => s.eventBuffer);

  const lastProcessedCount = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTickTs = useRef<number>(0);

  // Feed new live events into the ring buffer
  useEffect(() => {
    const newEvents = events.slice(lastProcessedCount.current);
    newEvents.forEach((e) => addToBuffer(e));
    lastProcessedCount.current = events.length;
  }, [events, addToBuffer]);

  // Drive the playback clock in replay mode
  useEffect(() => {
    if (mode !== 'replay' || !isPlaying) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const animate = (now: number) => {
      if (lastTickTs.current === 0) lastTickTs.current = now;
      const delta = now - lastTickTs.current;
      lastTickTs.current = now;
      tick(delta);
      rafRef.current = requestAnimationFrame(animate);
    };

    lastTickTs.current = 0;
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [mode, isPlaying, tick]);

  // Compute which events are "visible" at the current playback time
  const replayEvents: ThreatEvent[] = (() => {
    if (mode !== 'replay') return [];
    const cutoff = startTime + currentTime;
    return eventBuffer.filter(
      (e) => new Date(e.timestamp).getTime() <= cutoff
    );
  })();

  return {
    replayEvents,
    isReplayMode: mode === 'replay',
    bufferedCount: eventBuffer.length,
  };
}

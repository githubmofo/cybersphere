import { create } from 'zustand';
import type { ThreatEvent } from '@/types';

export type PlaybackSpeed = 1 | 2 | 5;

interface PlaybackState {
  mode: 'live' | 'replay';
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  currentTime: number;   // ms offset from startTime
  startTime: number;     // epoch ms of first buffered event
  endTime: number;       // epoch ms of last buffered event
  eventBuffer: ThreatEvent[];  // ring buffer — max 5000 events

  // Actions
  addToBuffer: (event: ThreatEvent) => void;
  enterReplay: () => void;
  exitReplay: () => void;
  play: () => void;
  pause: () => void;
  seek: (timeMs: number) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  tick: (deltaMs: number) => void;
  reset: () => void;
}

const MAX_BUFFER = 5000;

export const usePlaybackStore = create<PlaybackState>()((set) => ({
  mode: 'live',
  isPlaying: false,
  playbackSpeed: 1,
  currentTime: 0,
  startTime: 0,
  endTime: 0,
  eventBuffer: [],

  addToBuffer: (event) =>
    set((s) => {
      const buf =
        s.eventBuffer.length >= MAX_BUFFER
          ? [...s.eventBuffer.slice(1), event]
          : [...s.eventBuffer, event];

      const ts = new Date(event.timestamp).getTime();
      return {
        eventBuffer: buf,
        startTime: buf.length === 1 ? ts : Math.min(s.startTime, ts),
        endTime: Math.max(s.endTime, ts),
      };
    }),

  enterReplay: () =>
    set((s) => ({
      mode: 'replay',
      isPlaying: false,
      currentTime: 0,
      // Keep startTime/endTime from buffer
      startTime: s.startTime,
      endTime: s.endTime,
    })),

  exitReplay: () =>
    set({ mode: 'live', isPlaying: false, currentTime: 0 }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),

  seek: (timeMs) =>
    set((s) => ({
      currentTime: Math.max(0, Math.min(timeMs, s.endTime - s.startTime)),
    })),

  setSpeed: (speed) => set({ playbackSpeed: speed }),

  tick: (deltaMs) =>
    set((s) => {
      if (s.mode !== 'replay' || !s.isPlaying) return {};
      const duration = s.endTime - s.startTime;
      const next = s.currentTime + deltaMs * s.playbackSpeed;
      if (next >= duration) return { currentTime: duration, isPlaying: false };
      return { currentTime: next };
    }),

  reset: () =>
    set({
      mode: 'live',
      isPlaying: false,
      playbackSpeed: 1,
      currentTime: 0,
      eventBuffer: [],
      startTime: 0,
      endTime: 0,
    }),
}));

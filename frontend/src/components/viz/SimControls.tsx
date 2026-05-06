import { useState, useCallback } from 'react';
import { Play, Square, Zap, Loader } from 'lucide-react';
import { useVisualizerStore } from '@/store/useVisualizerStore';
import { useAppStore } from '@/store/useAppStore';

const SCENARIOS = [
  { value: 'calm', label: 'Calm' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'ddos', label: 'DDoS' },
  { value: 'brute_force', label: 'Brute Force' },
  { value: 'port_scan', label: 'Port Scan' },
  { value: 'malware_spread', label: 'Malware' },
];

/**
 * Simulation controls: Start/Stop button and scenario selector.
 *
 * Performance fixes applied:
 * 1. Optimistic UI update — state flips BEFORE await fetch().
 *    The button responds in <1 frame, not after the server round-trip (50-200ms).
 * 2. If the API call fails, we roll back the optimistic state.
 * 3. `isPending` local state drives a spinner while the HTTP request is in-flight,
 *    preventing the button from being clicked twice.
 */
export function SimControls() {
  const isSimulating  = useVisualizerStore((s) => s.isSimulating);
  const scenario       = useVisualizerStore((s) => s.scenario);
  const setSimulating  = useVisualizerStore((s) => s.setSimulating);
  const clearTrails    = useVisualizerStore((s) => s.clearTrails);
  const resetNodeStates = useVisualizerStore((s) => s.resetNodeStates);
  const connectionStatus = useAppStore((s) => s.connectionStatus);
  const [isPending, setIsPending] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleToggle = useCallback(async () => {
    if (isPending) return;

    const nextState = !isSimulating;
    const action    = nextState ? 'start' : 'stop';

    // ── Optimistic update: flip UI state in <1 frame ─────────────────────────
    setSimulating(nextState, scenario);

    // ── On Stop: immediately clear all trails and reset node colors ───────────
    // This makes the 3D scene go quiet in the SAME frame as the button click.
    // The API call runs in the background — the user never waits for it.
    if (!nextState) {
      clearTrails();
      resetNodeStates();
    }

    setIsPending(true);

    try {
      const res = await fetch(`${apiUrl}/api/simulation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, scenario }),
      });

      if (!res.ok) {
        console.error('[SimControls] API error:', res.statusText);
        setSimulating(isSimulating, scenario);
      }
    } catch (err) {
      console.error('[SimControls] Network error:', err);
      setSimulating(isSimulating, scenario);
    } finally {
      setIsPending(false);
    }
  }, [isPending, isSimulating, scenario, setSimulating, clearTrails, resetNodeStates, apiUrl]);

  const handleScenarioChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSimulating(isSimulating, e.target.value);
    },
    [isSimulating, setSimulating]
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.5rem 1rem',
        borderRadius: '0.75rem',
        background: 'hsl(210, 18%, 8%, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid hsl(210, 15%, 15%, 0.5)',
      }}
    >
      {/* Connection indicator */}
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          flexShrink: 0,
          background:
            connectionStatus === 'connected'
              ? 'hsl(145, 70%, 50%)'
              : connectionStatus === 'reconnecting'
                ? 'hsl(45, 95%, 55%)'
                : 'hsl(0, 85%, 55%)',
          boxShadow:
            connectionStatus === 'connected'
              ? '0 0 6px hsl(145, 70%, 50%, 0.5)'
              : 'none',
          transition: 'background 0.3s ease',
        }}
        title={`Status: ${connectionStatus}`}
      />

      {/* Scenario selector */}
      <select
        value={scenario}
        onChange={handleScenarioChange}
        disabled={isSimulating || isPending}
        style={{
          background: 'transparent',
          border: '1px solid hsl(210, 15%, 25%)',
          borderRadius: '0.375rem',
          padding: '0.375rem 0.5rem',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-secondary)',
          cursor: isSimulating ? 'not-allowed' : 'pointer',
          opacity: isSimulating ? 0.5 : 1,
        }}
        aria-label="Select attack scenario"
      >
        {SCENARIOS.map((s) => (
          <option key={s.value} value={s.value} style={{ background: 'hsl(210, 18%, 8%)' }}>
            {s.label}
          </option>
        ))}
      </select>

      {/* Start/Stop button — responds in <1 frame via optimistic update */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          fontFamily: 'var(--font-mono)',
          cursor: isPending ? 'wait' : 'pointer',
          border: 'none',
          transition: 'all 0.15s ease',
          background: isSimulating
            ? 'hsl(0, 85%, 55%, 0.2)'
            : 'hsl(185, 100%, 50%, 0.15)',
          color: isSimulating
            ? 'hsl(0, 85%, 65%)'
            : 'var(--color-accent-cyan)',
          opacity: isPending ? 0.8 : 1,
        }}
        aria-label={isSimulating ? 'Stop simulation' : 'Start simulation'}
        aria-busy={isPending}
      >
        {isPending ? (
          <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
        ) : isSimulating ? (
          <Square size={14} />
        ) : (
          <Play size={14} />
        )}
        {isSimulating ? 'Stop' : 'Start'}
        {!isPending && <Zap size={12} style={{ opacity: 0.5 }} />}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </button>
    </div>
  );
}

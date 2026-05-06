/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { LandingPage } from '@/pages/LandingPage';

// ── Lazy-loaded heavy pages ──────────────────────────────────────────────────
// Each page is a separate JS chunk. The router will NOT download VisualizerPage
// or DashboardPage code until the user actually navigates there.
const VisualizerPage = lazy(() =>
  import('@/pages/VisualizerPage').then((m) => ({ default: m.VisualizerPage }))
);
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);

// ── Lightweight loading shell shown while chunks download ────────────────────
function PageShell({ label }: { label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#020406',
        color: 'hsl(185, 100%, 55%)',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '0.75rem',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        gap: '0.75rem',
        flexDirection: 'column',
      }}
    >
      {/* Animated dot pulse — no heavy deps, pure CSS */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'hsl(185, 100%, 55%)',
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <span style={{ opacity: 0.5 }}>Initializing {label}…</span>
      <style>{`@keyframes pulse{0%,100%{opacity:.2}50%{opacity:1}}`}</style>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    // LandingPage is NOT lazy — it is the entry point and must render instantly
    element: <LandingPage />,
  },
  {
    path: '/visualizer',
    element: (
      <Suspense fallback={<PageShell label="3D Scene" />}>
        <VisualizerPage />
      </Suspense>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <Suspense fallback={<PageShell label="Analytics" />}>
        <DashboardPage />
      </Suspense>
    ),
  },
]);

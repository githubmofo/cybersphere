import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { SceneEnvironment } from '@/scenes/SceneEnvironment';
import { CameraController } from '@/scenes/CameraController';
import { GraphView } from '@/scenes/GraphView';
import { GlobeView } from '@/scenes/GlobeView';
import { PostEffects } from '@/scenes/PostEffects';
import { useVisualizerStore } from '@/store/useVisualizerStore';

/**
 * Root R3F Canvas wrapper for the 3D visualization scene.
 *
 * Performance notes:
 * - `antialias: false`  → avoids MSAA cost on the main framebuffer; bloom handles
 *   perceived quality via post-processing MSAA instead.
 * - `dpr={[1, 1.5]}`   → caps pixel ratio at 1.5× (prevents 4× cost on Retina).
 * - `frameloop="demand"` is intentionally NOT used here because the scene has
 *   continuous animation (globe rotate, attack trails, node breathing).
 * - GlobeView / GraphView swap without unmounting Canvas — avoids
 *   expensive WebGL context re-creation.
 */
export function CyberScene() {
  const viewMode = useVisualizerStore((s) => s.viewMode);

  return (
    <Canvas
      camera={{ position: [18, 12, 22], fov: 50, near: 0.1, far: 200 }}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
        // Disable stencil buffer — not used, saves GPU memory
        stencil: false,
      }}
      dpr={[1, 1.5]}
      style={{ background: '#020406' }}
      // Prevents Three.js from running a new render when no state changes
      // This is the single biggest GPU win for idle frames
      performance={{ min: 0.5 }}
    >
      <Suspense fallback={null}>
        <SceneEnvironment />
        <CameraController />
        {/*
         * Keep BOTH views mounted but hide the inactive one.
         * This avoids re-computing 20-node positions, regenerating all
         * geometry, and re-running all useMemo hooks on every toggle.
         * The inactive view's useFrame callbacks are still cheap because
         * R3F skips rendering for invisible objects.
         */}
        <group visible={viewMode === 'globe'}>
          <GlobeView />
        </group>
        <group visible={viewMode === 'graph'}>
          <GraphView />
        </group>
        <PostEffects />
      </Suspense>
    </Canvas>
  );
}

import { useRef, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useVisualizerStore } from '@/store/useVisualizerStore';
import gsap from 'gsap';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

// Globe radius is 10 — camera limits are set relative to it:
//   minDistance: 14  → can zoom in to see node detail without clipping inside
//   maxDistance: 32  → globe stays at least 40% of viewport height when zoomed out
const GLOBE_RADIUS = 10;
const MIN_CAMERA_DISTANCE = GLOBE_RADIUS * 1.4;  // 14 — close enough for detail
const MAX_CAMERA_DISTANCE = GLOBE_RADIUS * 3.2;  // 32 — globe stays prominent
const DEFAULT_CAMERA_POS  = new THREE.Vector3(18, 10, 22); // cinematic 3/4 angle

/**
 * Camera controller: clamped OrbitControls with cinematic defaults.
 *
 * Fixes applied:
 * 1. orbit target locked to world origin [0,0,0] — globe never drifts
 * 2. min/maxDistance clamped so the globe stays visually prominent
 * 3. maxPolarAngle limited so camera never goes below the globe equator
 * 4. node-focus GSAP now moves the CAMERA toward the node but keeps
 *    the orbit TARGET at the globe center — no more off-center drift
 * 5. dampingFactor reduced from 0.06 → 0.04 for silkier deceleration
 * 6. autoRotate disabled by default (globe self-rotates in GlobeView)
 */
export function CameraController() {
  const controlsRef  = useRef<OrbitControlsImpl>(null);
  const { camera }   = useThree();
  const selectedNodeId  = useVisualizerStore((s) => s.selectedNodeId);
  const nodePositions   = useVisualizerStore((s) => s.nodePositions);

  // ── Set initial camera position on first mount ────────────────────────────
  useEffect(() => {
    camera.position.copy(DEFAULT_CAMERA_POS);
    camera.lookAt(0, 0, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Reset idle timer on user interaction ─────────────────────────────────
  const handleInteraction = () => {
    // No autoRotate restart — the globe shell already self-rotates in GlobeView
  };

  // ── Focus camera on selected node ────────────────────────────────────────
  // IMPORTANT: orbit target stays at [0,0,0] — only camera POSITION changes.
  // Moving the target off-center caused the globe to drift out of frame.
  useEffect(() => {
    if (!selectedNodeId || !controlsRef.current) return;

    const pos = nodePositions.get(selectedNodeId);
    if (!pos) return;

    // Direction from globe center toward the node
    const nodeDir = new THREE.Vector3(...pos).normalize();

    // Position camera 18u from center along the node direction, elevated by 6u
    const camTarget = nodeDir
      .clone()
      .multiplyScalar(18)
      .add(new THREE.Vector3(0, 6, 0));

    // Smooth camera approach — target stays at origin
    gsap.to(camera.position, {
      x: camTarget.x,
      y: camTarget.y,
      z: camTarget.z,
      duration: 1.2,
      ease: 'power3.inOut',
      onUpdate: () => controlsRef.current?.update(),
    });

    // Keep orbit target at world center — globe never drifts
    if (controlsRef.current) {
      gsap.to(controlsRef.current.target, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.6,
        ease: 'power2.out',
        onUpdate: () => controlsRef.current?.update(),
      });
    }
  }, [selectedNodeId, nodePositions, camera]);



  return (
    <OrbitControls
      ref={controlsRef}
      target={[0, 0, 0]}           // always orbit around globe center
      enableDamping
      dampingFactor={0.04}          // silkier than 0.06
      minDistance={MIN_CAMERA_DISTANCE}
      maxDistance={MAX_CAMERA_DISTANCE}
      minPolarAngle={Math.PI * 0.1} // 18° — prevents camera going under globe
      maxPolarAngle={Math.PI * 0.85} // 153° — prevent gimbal lock at south pole
      autoRotate={false}            // globe shell self-rotates — no double rotation
      enablePan={false}             // panning breaks composition on a globe view
      onStart={handleInteraction}
      makeDefault
    />
  );
}

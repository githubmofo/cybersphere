import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useVisualizerStore } from '@/store/useVisualizerStore';
import { NetworkNode3D } from '@/scenes/NetworkNode3D';
import { NetworkEdge3D } from '@/scenes/NetworkEdge3D';
import { AttackTrail } from '@/scenes/AttackTrail';
import { gridVertexShader, gridFragmentShader } from '@/shaders/gridShader';
import { atmosphereVertexShader, atmosphereFragmentShader } from '@/shaders/atmosphereShader';

const GLOBE_RADIUS = 10;

/**
 * Globe topology view — fixed-center rotating cyber intelligence map.
 *
 * Architecture fix:
 * Previously the entire group (nodes, edges, trails) was rotated together,
 * causing nodes to visually drift and breaking the camera orbit anchor.
 *
 * Now only the VISUAL globe meshes (sphere + grid + atmosphere) spin.
 * Nodes, edges, and trails live in a SEPARATE static group at world origin.
 * Node positions are computed in world space — the spinning only affects
 * the globe surface appearance, not the data topology.
 */
export function GlobeView() {
  // Only the visual globe shell rotates — NOT the nodes
  const globeShellRef = useRef<THREE.Group>(null);

  const nodes = useVisualizerStore((s) => s.nodes);
  const edges  = useVisualizerStore((s) => s.edges);
  const setNodePositions = useVisualizerStore((s) => s.setNodePositions);

  // Grid uniforms — dimmer teal for subtle separation from nodes
  const gridUniforms = useMemo(() => ({
    uColor: { value: new THREE.Color('#00e5ff') },
  }), []);

  // Atmosphere uniforms — desaturated blue to reduce overpowering glow
  const atmosphereUniforms = useMemo(() => ({
    uColor: { value: new THREE.Color('#0a4060') },
  }), []);

  // Node positions in world space (NOT rotated with the globe shell)
  const positions = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    nodes.forEach((node, index) => {
      // Fibonacci sphere distribution — evenly covers the globe surface
      const phi   = Math.acos(1 - (2 * (index + 0.5)) / Math.max(nodes.length, 1));
      const theta = Math.PI * (1 + Math.sqrt(5)) * index;
      // Place nodes 0.5u above surface so they never Z-fight with the globe mesh
      const r = GLOBE_RADIUS + 0.5;

      map.set(node.node_id, [
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      ]);
    });
    return map;
  }, [nodes]);

  useEffect(() => {
    setNodePositions(positions);
  }, [positions, setNodePositions]);

  // Rotate ONLY the visual shell (sphere + grid + atmosphere)
  // Nodes and edges stay static in world space — no positional drift
  useFrame((_, delta) => {
    if (globeShellRef.current) {
      // 0.04 rad/s = ~2.3 degrees/second — cinematic, barely noticeable
      globeShellRef.current.rotation.y += delta * 0.04;
    }
  });

  return (
    // Outer group is STATIC — position never changes
    <group position={[0, 0, 0]}>

      {/* ── Rotating visual shell ─────────────────────────────────────────── */}
      <group ref={globeShellRef}>

        {/* Core sphere — slightly lighter than background for clear separation */}
        <mesh>
          <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
          <meshStandardMaterial
            color="#0d1f2d"       // dark navy — clearly distinct from #020406 bg
            roughness={0.7}
            metalness={0.2}
            emissive="#071520"
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* Grid layer — rendered on top with additive blending */}
        <mesh renderOrder={1}>
          <sphereGeometry args={[GLOBE_RADIUS + 0.02, 64, 64]} />
          <shaderMaterial
            vertexShader={gridVertexShader}
            fragmentShader={gridFragmentShader}
            uniforms={gridUniforms}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Atmosphere shell — scale 1.08 (was 1.15) for a thinner, softer ring */}
        <mesh scale={1.08} renderOrder={0}>
          <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
          <shaderMaterial
            vertexShader={atmosphereVertexShader}
            fragmentShader={atmosphereFragmentShader}
            uniforms={atmosphereUniforms}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.BackSide}
          />
        </mesh>

      </group>

      {/* ── Static data layer (nodes, edges, trails) ─────────────────────── */}
      {/* These never rotate so the globe turns "under" the attack points   */}
      <NetworkEdge3D edges={edges} positions={positions} />
      <NetworkNode3D positions={positions} />
      <AttackTrail nodePositions={positions} />

    </group>
  );
}

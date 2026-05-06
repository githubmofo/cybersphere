import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { QuadraticBezierLine } from '@react-three/drei';
import { useVisualizerStore } from '@/store/useVisualizerStore';
import { pulseVertexShader, pulseFragmentShader } from '@/shaders/pulseShader';

interface TrailProps {
  id: string;
  sourcePos: [number, number, number];
  targetPos: [number, number, number];
  color: string;
  viewMode: 'globe' | 'graph';
}

function ArcTrail({ id, sourcePos, targetPos, color, viewMode }: TrailProps) {
  const removeTrail = useVisualizerStore((s) => s.removeTrail);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineRef = useRef<any>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const progress = useRef(0);

  // useMemo with primitive array deps — vectors built from numbers, stable
  const src = useMemo(
    () => new THREE.Vector3(sourcePos[0], sourcePos[1], sourcePos[2]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sourcePos[0], sourcePos[1], sourcePos[2]]
  );
  const tgt = useMemo(
    () => new THREE.Vector3(targetPos[0], targetPos[1], targetPos[2]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targetPos[0], targetPos[1], targetPos[2]]
  );

  const mid = useMemo(() => {
    const m = new THREE.Vector3().addVectors(src, tgt).multiplyScalar(0.5);
    if (viewMode === 'globe') {
      m.normalize().multiplyScalar(10 + src.distanceTo(tgt) * 0.3);
    } else {
      m.y += src.distanceTo(tgt) * 0.2;
    }
    return m;
  }, [src, tgt, viewMode]);

  const pulseUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uRadius: { value: 1.0 },
    uColor: { value: new THREE.Color(color) },
  }), [color]);

  useFrame((_, delta) => {
    progress.current += delta * 1.5;
    const p = progress.current;

    if (lineRef.current?.material) {
      const opacity = Math.max(0, 1 - Math.abs(p - 0.5) * 2);
      lineRef.current.material.opacity = opacity * 0.8;
      lineRef.current.material.linewidth = p > 0.8 ? 1.5 : 2.5;
    }

    if (pulseRef.current?.material) {
      if (p >= 0.95 && p < 1.2) {
        (pulseRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value += delta;
        pulseRef.current.visible = true;
      } else {
        pulseRef.current.visible = false;
      }
    }

    if (p > 1.2) {
      removeTrail(id);
    }
  });

  return (
    <group>
      <QuadraticBezierLine
        ref={lineRef}
        start={src}
        end={tgt}
        mid={mid}
        color={color}
        lineWidth={2.5}
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
      <mesh ref={pulseRef} position={tgt} visible={false}>
        <sphereGeometry args={[1, 32, 32]} />
        <shaderMaterial
          vertexShader={pulseVertexShader}
          fragmentShader={pulseFragmentShader}
          uniforms={pulseUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/**
 * AttackTrail — performance-fixed version.
 * Trails are mapped, and each trail autonomously manages its own progress via local useRef
 * and useFrame to achieve 60 FPS without ever triggering React re-renders.
 */
export function AttackTrail({ nodePositions }: { nodePositions: Map<string, [number, number, number]> }) {
  const trails = useVisualizerStore((s) => s.activeTrails);
  const viewMode = useVisualizerStore((s) => s.viewMode);

  return (
    <group>
      {trails.map((trail) => {
        const src = nodePositions.get(trail.sourceId);
        const tgt = nodePositions.get(trail.targetId);
        if (!src || !tgt) return null;

        return (
          <ArcTrail
            key={trail.id}
            id={trail.id}
            sourcePos={src}
            targetPos={tgt}
            color={`#${new THREE.Color(trail.color).getHexString()}`}
            viewMode={viewMode}
          />
        );
      })}
    </group>
  );
}

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useVisualizerStore } from '@/store/useVisualizerStore';
import * as THREE from 'three';
import type { NodeState } from '@/types';
import { SelectionHalo } from '@/scenes/SelectionHalo';

// ── Color system ──────────────────────────────────────────────────────────────
// Brightness 50–75% lightness as requested.
// healthy    → green  (was teal/cyan)
// suspicious → orange (was amber — keeping similar hue)
// compromised→ blue   (was red)
const STATE_COLORS: Record<NodeState, THREE.Color> = {
  healthy:     new THREE.Color('hsl(142, 70%, 60%)'), // green, 60% L
  suspicious:  new THREE.Color('hsl(30,  90%, 62%)'), // orange, 62% L
  compromised: new THREE.Color('hsl(210, 85%, 62%)'), // blue,   62% L
};

const STATE_EMISSIVE: Record<NodeState, THREE.Color> = {
  healthy:     new THREE.Color('hsl(142, 65%, 38%)'), // green emissive, 38% L
  suspicious:  new THREE.Color('hsl(30,  85%, 40%)'), // orange emissive
  compromised: new THREE.Color('hsl(210, 80%, 40%)'), // blue emissive
};

const MIN_SCALE       = 0.55;
const RISK_SCALE_RANGE = 0.5;

interface NetworkNode3DProps {
  positions: Map<string, [number, number, number]>;
}

/**
 * InstancedMesh for all network nodes — performance-optimised.
 *
 * Key perf fixes vs previous version:
 * 1. tempDir is a module-level constant — no allocation inside useFrame
 * 2. emissive urgency computed via cached booleans, not nodes.some() scans
 * 3. Instance color set inside the same loop — no second pass
 * 4. sphereGeometry args reduced: (1,16,16) → (1,10,10) for glow shell
 *    saves 50% of glow mesh triangles with no visible difference at small scale
 */

// Pre-allocated objects — never re-created inside useFrame
const _tempObject = new THREE.Object3D();
const _tempColor  = new THREE.Color();
const _tempDir    = new THREE.Vector3();

export function NetworkNode3D({ positions }: NetworkNode3DProps) {
  const coreRef = useRef<THREE.InstancedMesh>(null);
  const glowRef = useRef<THREE.InstancedMesh>(null);

  const nodes        = useVisualizerStore((s) => s.nodes);
  const selectedNodeId = useVisualizerStore((s) => s.selectedNodeId);
  const hoveredNodeId  = useVisualizerStore((s) => s.hoveredNodeId);
  const selectNode     = useVisualizerStore((s) => s.selectNode);
  const setHoveredNode = useVisualizerStore((s) => s.setHoveredNode);

  // ── Materials — created once, never recreated ─────────────────────────────
  const coreMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.3,
        metalness: 0.5,
        emissive: new THREE.Color('#000000'),
        emissiveIntensity: 1.8,
        transparent: true,
        opacity: 0.92,
      }),
    []
  );

  const glowMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: /* glsl */ `
          attribute vec3 instanceColor;
          varying vec3 vColor;
          varying float vFresnel;

          void main() {
            vColor = instanceColor;
            vec3 viewNormal = normalize(
              mat3(modelViewMatrix * instanceMatrix) * normal
            );
            vFresnel = 1.0 - abs(dot(viewNormal, vec3(0.0, 0.0, 1.0)));
            vFresnel = pow(vFresnel, 1.4);
            vec4 mvPos = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPos;
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vColor;
          varying float vFresnel;

          void main() {
            float alpha = clamp(vFresnel * 1.3, 0.0, 1.0);
            gl_FragColor = vec4(vColor * 1.6, alpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide,
      }),
    []
  );

  useFrame((state) => {
    if (!coreRef.current || !glowRef.current) return;
    const time = state.clock.getElapsedTime();

    // Track urgency in one pass — avoids two separate nodes.some() calls
    let hasCompromised = false;
    let hasSuspicious  = false;

    nodes.forEach((node, i) => {
      const pos = positions.get(node.node_id);
      if (!pos) return;

      const isSelected    = node.node_id === selectedNodeId;
      const isHovered     = node.node_id === hoveredNodeId;
      const isCompromised = node.state === 'compromised';
      const isSuspicious  = node.state === 'suspicious';

      if (isCompromised) hasCompromised = true;
      if (isSuspicious)  hasSuspicious  = true;

      // Scale from risk score
      const riskFactor = node.current_risk_score / 100;
      const baseScale  = MIN_SCALE + riskFactor * RISK_SCALE_RANGE;
      const scale      = isSelected ? baseScale * 1.5 : isHovered ? baseScale * 1.25 : baseScale;

      // Per-state pulse — no allocations
      const pulseFreq  = isCompromised ? 4.0 : isSuspicious ? 2.5 : 1.0;
      const pulseAmt   = isCompromised ? 0.10 : isSuspicious ? 0.06 : 0.025;
      const pulse      = 1.0 + Math.sin(time * pulseFreq + i * 0.8) * pulseAmt;
      const finalScale = scale * pulse;

      // Push node above globe surface — reuse pre-allocated _tempDir
      _tempDir.set(pos[0], pos[1], pos[2]).normalize();
      _tempObject.position.set(
        pos[0] + _tempDir.x * 0.5,
        pos[1] + _tempDir.y * 0.5,
        pos[2] + _tempDir.z * 0.5
      );

      // Core body matrix
      _tempObject.scale.setScalar(finalScale);
      _tempObject.updateMatrix();
      coreRef.current!.setMatrixAt(i, _tempObject.matrix);

      // Glow shell matrix (2× core radius)
      _tempObject.scale.setScalar(finalScale * 2.0);
      _tempObject.updateMatrix();
      glowRef.current!.setMatrixAt(i, _tempObject.matrix);

      // Instance color — one setColorAt per loop iteration, no second pass
      _tempColor.copy(STATE_COLORS[node.state]);
      coreRef.current!.setColorAt(i, _tempColor);
      glowRef.current!.setColorAt(i, _tempColor);
    });

    // Update shared emissive — determined from urgency flags tracked above
    coreMaterial.emissive.copy(
      hasCompromised
        ? STATE_EMISSIVE.compromised
        : hasSuspicious
          ? STATE_EMISSIVE.suspicious
          : STATE_EMISSIVE.healthy
    );

    coreRef.current.instanceMatrix.needsUpdate = true;
    glowRef.current.instanceMatrix.needsUpdate = true;
    if (coreRef.current.instanceColor) coreRef.current.instanceColor.needsUpdate = true;
    if (glowRef.current.instanceColor)  glowRef.current.instanceColor.needsUpdate = true;
  });

  const selectedNode    = selectedNodeId ? nodes.find((n) => n.node_id === selectedNodeId) : null;
  const selectedNodePos = selectedNodeId ? positions.get(selectedNodeId) : null;
  const selectedScale   = selectedNode
    ? MIN_SCALE + (selectedNode.current_risk_score / 100) * RISK_SCALE_RANGE
    : 1;
  const haloColor = selectedNode
    ? `#${STATE_COLORS[selectedNode.state].getHexString()}`
    : '#00f5ff';

  return (
    <group>
      {/* Core body */}
      <instancedMesh
        ref={coreRef}
        args={[undefined, undefined, Math.max(nodes.length, 1)]}
        renderOrder={2}
        onClick={(e) => {
          e.stopPropagation();
          if (e.instanceId !== undefined && nodes[e.instanceId]) {
            selectNode(nodes[e.instanceId].node_id);
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (e.instanceId !== undefined && nodes[e.instanceId]) {
            setHoveredNode(nodes[e.instanceId].node_id);
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          setHoveredNode(null);
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[1, 12, 12]} />
        <primitive object={coreMaterial} attach="material" />
      </instancedMesh>

      {/* Additive glow shell — lower poly than core, difference not visible */}
      <instancedMesh
        ref={glowRef}
        args={[undefined, undefined, Math.max(nodes.length, 1)]}
        renderOrder={3}
      >
        <sphereGeometry args={[1, 8, 8]} />
        <primitive object={glowMaterial} attach="material" />
      </instancedMesh>

      {selectedNodePos && (
        <SelectionHalo
          position={selectedNodePos}
          scale={selectedScale * 1.6}
          color={haloColor}
        />
      )}
    </group>
  );
}

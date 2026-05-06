import { useMemo, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useVisualizerStore } from '@/store/useVisualizerStore';
import { NetworkNode3D } from '@/scenes/NetworkNode3D';
import { NetworkEdge3D } from '@/scenes/NetworkEdge3D';
import { AttackTrail } from '@/scenes/AttackTrail';

// Defines the 3D radius and Y-height for each role cluster
const ROLE_LAYOUT: Record<string, { r: number; y: number }> = {
  'database': { r: 1.5, y: -4 },
  'firewall': { r: 1.5, y: 4 },
  'api-gateway': { r: 8, y: 1 },
  'web-server': { r: 8, y: -1 },
  'dns-server': { r: 16, y: 2 },
  'mail-server': { r: 16, y: -2 },
  'iot-device': { r: 26, y: 0 },
};

export function GraphView() {
  const groupRef = useRef<THREE.Group>(null);
  const nodes = useVisualizerStore((s) => s.nodes);
  const edges = useVisualizerStore((s) => s.edges);
  const setNodePositions = useVisualizerStore((s) => s.setNodePositions);

  const positions = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    
    const roleGroups: Record<string, typeof nodes> = {};
    nodes.forEach(node => {
      if (!roleGroups[node.role]) roleGroups[node.role] = [];
      roleGroups[node.role].push(node);
    });

    Object.entries(roleGroups).forEach(([role, roleNodes]) => {
      const layout = ROLE_LAYOUT[role] || { r: 20, y: 0 };
      const count = roleNodes.length;

      roleNodes.forEach((node, index) => {
        // Distribute in a circle around the Y axis
        const angle = (index / count) * Math.PI * 2;
        
        // Add subtle variations to make it look organic but structured
        const heightJitter = Math.sin(index * 123.45) * 1.5;
        const radiusJitter = Math.cos(index * 67.89) * (layout.r > 5 ? 2 : 0);
        
        const finalR = layout.r + radiusJitter;
        const finalY = layout.y + heightJitter;

        map.set(node.node_id, [
          Math.cos(angle) * finalR,
          finalY,
          Math.sin(angle) * finalR,
        ]);
      });
    });

    return map;
  }, [nodes]);

  useEffect(() => {
    setNodePositions(positions);
  }, [positions, setNodePositions]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Very slow cinematic rotation
      groupRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <NetworkEdge3D edges={edges} positions={positions} />
      <NetworkNode3D positions={positions} />
      <AttackTrail nodePositions={positions} />
    </group>
  );
}

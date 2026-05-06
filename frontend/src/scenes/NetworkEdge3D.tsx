import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { useVisualizerStore } from '@/store/useVisualizerStore';
import type { EdgeDef } from '@/store/useVisualizerStore';

interface NetworkEdge3DProps {
  edges: EdgeDef[];
  positions: Map<string, [number, number, number]>;
}

/**
 * Renders network edges with tiered visual importance based on node roles.
 * Backbone (core) edges are thicker and brighter.
 */
export function NetworkEdge3D({ edges, positions }: NetworkEdge3DProps) {
  const nodes = useVisualizerStore(s => s.nodes);

  const edgeData = useMemo(() => {
    const nodeMap = new Map(nodes.map(n => [n.node_id, n]));
    
    return edges
      .map((edge) => {
        const srcPos = positions.get(edge.source);
        const tgtPos = positions.get(edge.target);
        if (!srcPos || !tgtPos) return null;

        const srcNode = nodeMap.get(edge.source);
        const tgtNode = nodeMap.get(edge.target);
        if (!srcNode || !tgtNode) return null;

        const isBackbone = 
          ['firewall', 'database', 'api-gateway'].includes(srcNode.role) &&
          ['firewall', 'database', 'api-gateway'].includes(tgtNode.role);
          
        const isOuter = srcNode.role === 'iot-device' || tgtNode.role === 'iot-device';

        return { 
          points: [srcPos, tgtPos] as [[number, number, number], [number, number, number]], 
          key: `${edge.source}-${edge.target}`,
          lineWidth: isBackbone ? 1.5 : isOuter ? 0.5 : 0.8,
          opacity: isBackbone ? 0.5 : isOuter ? 0.15 : 0.25,
          color: isBackbone ? '#00e5ff' : '#1a3a4a'
        };
      })
      .filter(Boolean) as { points: [[number, number, number], [number, number, number]]; key: string; lineWidth: number; opacity: number; color: string }[];
  }, [edges, positions, nodes]);

  return (
    <>
      {edgeData.map((edge) => (
        <Line
          key={edge.key}
          points={edge.points}
          color={edge.color}
          lineWidth={edge.lineWidth}
          transparent
          opacity={edge.opacity}
        />
      ))}
    </>
  );
}

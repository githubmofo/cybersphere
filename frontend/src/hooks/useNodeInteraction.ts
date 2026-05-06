import { useCallback } from 'react';
import { useVisualizerStore } from '@/store/useVisualizerStore';

/**
 * Hook for node interaction handlers: click to select, hover to highlight.
 * Decouples interaction logic from 3D scene components.
 */
export function useNodeInteraction() {
  const selectNode = useVisualizerStore((s) => s.selectNode);
  const setHoveredNode = useVisualizerStore((s) => s.setHoveredNode);
  const selectedNodeId = useVisualizerStore((s) => s.selectedNodeId);
  const nodes = useVisualizerStore((s) => s.nodes);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      // Toggle selection — click again to deselect
      selectNode(selectedNodeId === nodeId ? null : nodeId);
    },
    [selectedNodeId, selectNode]
  );

  const handleNodeHover = useCallback(
    (nodeId: string | null) => {
      setHoveredNode(nodeId);
    },
    [setHoveredNode]
  );

  const getSelectedNode = useCallback(() => {
    if (!selectedNodeId) return null;
    return nodes.find((n) => n.node_id === selectedNodeId) ?? null;
  }, [selectedNodeId, nodes]);

  return {
    handleNodeClick,
    handleNodeHover,
    selectedNodeId,
    getSelectedNode,
  };
}

"""REST API routes for network nodes."""

import logging
from fastapi import APIRouter, HTTPException
from simulation.network_topology import get_default_topology

logger = logging.getLogger("cybersphere.api.nodes")

router = APIRouter(prefix="/api", tags=["nodes"])

# In-memory topology store (populated at startup)
_nodes: list[dict] = []
_edges: list[dict] = []


def initialize_topology() -> None:
    """Load default topology into memory."""
    global _nodes, _edges
    _nodes, _edges = get_default_topology()
    logger.info("Topology loaded: %d nodes, %d edges", len(_nodes), len(_edges))


@router.get("/nodes")
async def get_nodes() -> dict:
    """Get all network nodes."""
    return {"nodes": _nodes, "edges": _edges}


@router.get("/nodes/{node_id}")
async def get_node(node_id: str) -> dict:
    """Get a single node by ID."""
    for node in _nodes:
        if node["node_id"] == node_id:
            return {"node": node}
    raise HTTPException(status_code=404, detail=f"Node '{node_id}' not found")

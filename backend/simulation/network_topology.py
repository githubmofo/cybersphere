"""Network topology definition for simulation — 20 nodes with edges."""

from models.schemas import NodeState

# Each node: (node_id, ip, role, location_xyz, state, tags, risk_score)
DEFAULT_NODES = [
    ("fw-1", "10.0.0.1", "firewall", "0,0,0", NodeState.healthy, ["perimeter"], 5),
    ("fw-2", "10.0.0.2", "firewall", "-6,1,4", NodeState.healthy, ["perimeter"], 3),
    ("web-1", "10.0.1.10", "web-server", "4,2,-3", NodeState.healthy, ["frontend"], 12),
    ("web-2", "10.0.1.11", "web-server", "-2,3,5", NodeState.healthy, ["frontend"], 8),
    ("web-3", "10.0.1.12", "web-server", "6,-1,2", NodeState.healthy, ["frontend"], 10),
    ("api-1", "10.0.2.10", "api-gateway", "1,0,6", NodeState.healthy, ["backend"], 10),
    ("api-2", "10.0.2.11", "api-gateway", "-4,-2,-5", NodeState.healthy, ["backend"], 7),
    ("db-1", "10.0.3.10", "database", "3,-3,-6", NodeState.healthy, ["data"], 15),
    ("db-2", "10.0.3.11", "database", "-5,2,-2", NodeState.healthy, ["data"], 20),
    ("db-3", "10.0.3.12", "database", "7,1,-1", NodeState.healthy, ["data", "critical"], 18),
    ("dns-1", "10.0.4.10", "dns-server", "-3,-1,8", NodeState.healthy, ["infra"], 4),
    ("dns-2", "10.0.4.11", "dns-server", "2,4,3", NodeState.healthy, ["infra"], 6),
    ("mail-1", "10.0.5.10", "mail-server", "-7,-3,1", NodeState.healthy, ["comms"], 9),
    ("mail-2", "10.0.5.11", "mail-server", "5,3,7", NodeState.healthy, ["comms"], 11),
    ("iot-1", "10.0.6.10", "iot-device", "-1,5,-4", NodeState.healthy, ["edge"], 22),
    ("iot-2", "10.0.6.11", "iot-device", "4,-4,5", NodeState.healthy, ["edge"], 18),
    ("iot-3", "10.0.6.12", "iot-device", "-6,0,-7", NodeState.healthy, ["edge"], 25),
    ("iot-4", "10.0.6.13", "iot-device", "8,-2,0", NodeState.healthy, ["edge"], 11),
    ("iot-5", "10.0.6.14", "iot-device", "0,6,6", NodeState.healthy, ["edge"], 14),
    ("iot-6", "10.0.6.15", "iot-device", "-8,4,-3", NodeState.healthy, ["edge"], 16),
]

# Edges: (source_id, target_id)
DEFAULT_EDGES = [
    ("fw-1", "web-1"), ("fw-1", "web-2"), ("fw-1", "web-3"),
    ("fw-2", "api-1"), ("fw-2", "api-2"),
    ("web-1", "api-1"), ("web-2", "api-1"), ("web-3", "api-2"),
    ("api-1", "db-1"), ("api-1", "db-2"), ("api-2", "db-3"),
    ("dns-1", "fw-1"), ("dns-2", "fw-2"),
    ("mail-1", "api-1"), ("mail-2", "api-2"),
    ("iot-1", "fw-1"), ("iot-2", "fw-2"), ("iot-3", "fw-1"),
    ("iot-4", "fw-2"), ("iot-5", "fw-1"), ("iot-6", "fw-2"),
]


def get_default_topology() -> tuple[list[dict], list[dict]]:
    """Return default topology as lists of node/edge dicts."""
    from datetime import datetime, timezone

    nodes = [
        {
            "node_id": n[0],
            "ip_address": n[1],
            "role": n[2],
            "location": n[3],
            "state": n[4].value,
            "last_seen": datetime.now(timezone.utc).isoformat(),
            "tags": n[5],
            "current_risk_score": n[6],
        }
        for n in DEFAULT_NODES
    ]
    edges = [{"source": e[0], "target": e[1]} for e in DEFAULT_EDGES]
    return nodes, edges

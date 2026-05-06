from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime


class NodeState(str, Enum):
    healthy = "healthy"
    suspicious = "suspicious"
    compromised = "compromised"


class AttackType(str, Enum):
    ddos = "DDoS"
    brute_force = "brute-force"
    port_scan = "port-scan"
    botnet = "botnet"
    malware = "malware"
    normal = "normal"


class Severity(str, Enum):
    low = "Low"
    medium = "Medium"
    high = "High"
    critical = "Critical"


class ThreatEventSchema(BaseModel):
    """Schema for threat events streamed via WebSocket."""

    event_id: str
    timestamp: datetime
    source_node_id: str
    target_node_id: str
    protocol: str
    bytes: int = Field(ge=0)
    is_malicious: bool
    attack_type: AttackType
    anomaly_score: float = Field(ge=0.0, le=1.0)
    risk_score: int = Field(ge=0, le=100)
    severity: Severity


class NodeSchema(BaseModel):
    """Schema for network node state."""

    node_id: str
    ip_address: str
    role: str
    location: str
    state: NodeState
    last_seen: datetime
    tags: list[str] = Field(default_factory=list)
    current_risk_score: int = Field(ge=0, le=100)


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "ok"
    version: str
    ml_enabled: bool


class SimulationCommand(BaseModel):
    """Command to control simulation."""

    action: str  # "start" | "stop"
    scenario: str = "mixed"
    events_per_second: int = Field(default=20, ge=1, le=500)

"""Synthetic traffic event generator for simulation."""

import asyncio
import random
import uuid
import logging
from datetime import datetime, timezone

from models.schemas import AttackType, Severity
from simulation.scenarios import get_scenario
from simulation.network_topology import DEFAULT_NODES, DEFAULT_EDGES
from ml.inference import inference_service

logger = logging.getLogger("cybersphere.generator")

PROTOCOLS = ["TCP", "UDP", "HTTP", "HTTPS", "DNS", "SSH", "SMTP", "ICMP"]

ATTACK_SEVERITY: dict[str, str] = {
    "DDoS": "High",
    "brute-force": "Medium",
    "port-scan": "Low",
    "botnet": "Critical",
    "malware": "Critical",
    "normal": "Low",
}


def _severity_from_risk(risk: int) -> str:
    if risk >= 80:
        return "Critical"
    if risk >= 60:
        return "High"
    if risk >= 30:
        return "Medium"
    return "Low"


def generate_normal_event() -> dict:
    """Generate a single normal traffic event, enriched with ML inference."""
    edge = random.choice(DEFAULT_EDGES)
    base_event = {
        "event_id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source_node_id": edge[0],
        "target_node_id": edge[1],
        "protocol": random.choice(["HTTP", "HTTPS", "DNS", "TCP"]),
        "bytes": random.randint(64, 8192),
        "is_malicious": False,
        "attack_type": "normal",
        "anomaly_score": round(random.uniform(0.0, 0.15), 3),
        "risk_score": random.randint(0, 10),
        "severity": "Low",
    }
    prediction = inference_service.predict_event(base_event)
    base_event["anomaly_score"] = round(prediction.anomaly_score, 4)
    base_event["risk_score"] = prediction.risk_score
    base_event["severity"] = prediction.severity
    base_event["ml_prediction"] = {
        "predicted_class": prediction.predicted_class,
        "confidence": round(prediction.confidence, 4),
        "ml_used": prediction.ml_used,
    }
    return base_event


def generate_attack_event(attack_type: str) -> dict:
    """Generate a single malicious event of specified type."""
    node_ids = [n[0] for n in DEFAULT_NODES]
    source = random.choice(node_ids)
    # Target is a different node
    target = random.choice([n for n in node_ids if n != source])

    risk = random.randint(40, 100)
    anomaly = round(random.uniform(0.5, 1.0), 3)

    protocol_map = {
        "DDoS": random.choice(["TCP", "UDP", "ICMP"]),
        "brute-force": "SSH",
        "port-scan": "TCP",
        "botnet": random.choice(["TCP", "HTTP"]),
        "malware": random.choice(["HTTP", "TCP"]),
    }

    bytes_map = {
        "DDoS": random.randint(10000, 100000),
        "brute-force": random.randint(200, 1000),
        "port-scan": random.randint(40, 200),
        "botnet": random.randint(500, 5000),
        "malware": random.randint(5000, 50000),
    }

    base_event = {
        "event_id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source_node_id": source,
        "target_node_id": target,
        "protocol": protocol_map.get(attack_type, "TCP"),
        "bytes": bytes_map.get(attack_type, random.randint(100, 5000)),
        "is_malicious": True,
        "attack_type": attack_type,
        "anomaly_score": anomaly,
        "risk_score": risk,
        "severity": _severity_from_risk(risk),
    }
    prediction = inference_service.predict_event(base_event)
    base_event["anomaly_score"] = round(prediction.anomaly_score, 4)
    base_event["risk_score"] = prediction.risk_score
    base_event["severity"] = prediction.severity
    base_event["ml_prediction"] = {
        "predicted_class": prediction.predicted_class,
        "confidence": round(prediction.confidence, 4),
        "ml_used": prediction.ml_used,
    }
    return base_event


class SimulationEngine:
    """Generates events at configured rate and pushes to callback."""

    def __init__(self) -> None:
        self._task: asyncio.Task | None = None
        self._active = False
        self._scenario = "mixed"

    @property
    def is_active(self) -> bool:
        return self._active

    @property
    def scenario(self) -> str:
        return self._scenario

    async def start(
        self, scenario: str, on_event: callable, events_per_second: int | None = None
    ) -> None:
        """Start generating events."""
        if self._active:
            await self.stop()

        self._scenario = scenario
        self._active = True
        config = get_scenario(scenario)
        eps = events_per_second or config.events_per_second

        logger.info("Simulation starting: scenario=%s, eps=%d", scenario, eps)
        self._task = asyncio.create_task(self._run(config, eps, on_event))

    async def stop(self) -> None:
        """Stop event generation."""
        self._active = False
        if self._task and not self._task.done():
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        self._task = None
        logger.info("Simulation stopped")

    async def _run(self, config, eps: int, on_event: callable) -> None:
        """Main event generation loop."""
        interval = 1.0 / max(eps, 1)

        while self._active:
            try:
                if random.random() < config.malicious_ratio:
                    attack_type = random.choice(config.attack_types)
                    if attack_type == "normal":
                        event = generate_normal_event()
                    else:
                        event = generate_attack_event(attack_type)
                else:
                    event = generate_normal_event()

                await on_event(event)
                await asyncio.sleep(interval)
            except asyncio.CancelledError:
                break
            except Exception:
                logger.exception("Error generating event")
                await asyncio.sleep(1.0)

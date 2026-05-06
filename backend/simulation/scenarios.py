"""Attack scenario preset configurations."""

from dataclasses import dataclass


@dataclass
class ScenarioConfig:
    name: str
    events_per_second: int
    malicious_ratio: float  # 0.0 - 1.0
    attack_types: list[str]
    description: str


SCENARIOS: dict[str, ScenarioConfig] = {
    "calm": ScenarioConfig(
        name="Calm",
        events_per_second=12,
        malicious_ratio=0.02,
        attack_types=["normal"],
        description="Mostly normal traffic with rare anomalies",
    ),
    "mixed": ScenarioConfig(
        name="Mixed Threats",
        events_per_second=30,
        malicious_ratio=0.25,
        attack_types=["DDoS", "brute-force", "port-scan", "malware", "normal"],
        description="Random mix of all attack types",
    ),
    "ddos": ScenarioConfig(
        name="DDoS Attack",
        events_per_second=150,
        malicious_ratio=0.8,
        attack_types=["DDoS"],
        description="Distributed denial of service flood",
    ),
    "brute_force": ScenarioConfig(
        name="Brute Force",
        events_per_second=40,
        malicious_ratio=0.6,
        attack_types=["brute-force"],
        description="Repeated authentication attempts",
    ),
    "port_scan": ScenarioConfig(
        name="Port Scan",
        events_per_second=25,
        malicious_ratio=0.5,
        attack_types=["port-scan"],
        description="Sequential port probing from single source",
    ),
    "malware_spread": ScenarioConfig(
        name="Malware Spread",
        events_per_second=20,
        malicious_ratio=0.4,
        attack_types=["malware", "botnet"],
        description="Infected node spreading to neighbors",
    ),
}


def get_scenario(name: str) -> ScenarioConfig:
    """Get scenario config by name, fallback to 'mixed'."""
    return SCENARIOS.get(name, SCENARIOS["mixed"])

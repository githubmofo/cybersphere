"""ML feature extractor — converts raw simulation event dicts into model-ready feature vectors."""

from __future__ import annotations
import logging
import math
import random

logger = logging.getLogger("cybersphere.ml.feature_extractor")

# Ordered feature names that must match the scaler's training columns
FEATURE_NAMES = [
    "flow_duration",
    "total_fwd_packets",
    "total_bwd_packets",
    "flow_bytes_per_s",
    "flow_packets_per_s",
    "fwd_packet_length_mean",
    "bwd_packet_length_mean",
    "flow_iat_mean",
    "syn_flag_count",
    "rst_flag_count",
    "psh_flag_count",
    "ack_flag_count",
]


def extract_features(event: dict) -> list[float]:
    """
    Extract a numerical feature vector from a raw simulation event dict.

    In production this would parse actual pcap/netflow fields.
    For demo mode (no real packets), we synthesise plausible feature values
    that correlate with the attack_type so that a trained model can still
    discriminate between attack categories.
    """
    attack_type: str = event.get("attack_type", "normal")
    bytes_: int = int(event.get("bytes", 1024))
    is_malicious: bool = bool(event.get("is_malicious", False))

    # Seed the RNG deterministically per event so reruns are consistent
    seed = hash(event.get("event_id", "")) % (2**31)
    rng = random.Random(seed)

    # --- Base traffic profile ---
    flow_duration = rng.uniform(0.1, 10.0)
    fwd_pkts = rng.randint(1, 50)
    bwd_pkts = rng.randint(0, 30)
    total_bytes = bytes_
    flow_bps = total_bytes / max(flow_duration, 0.001)
    flow_pps = (fwd_pkts + bwd_pkts) / max(flow_duration, 0.001)
    fwd_len_mean = total_bytes / max(fwd_pkts, 1)
    bwd_len_mean = rng.uniform(0, 300)
    iat_mean = flow_duration / max(fwd_pkts + bwd_pkts, 1)
    syn_flags = 0
    rst_flags = 0
    psh_flags = 0
    ack_flags = rng.randint(0, fwd_pkts + bwd_pkts)

    # --- Attack-specific overrides (make patterns learnable) ---
    if attack_type == "DDoS":
        fwd_pkts = rng.randint(500, 5000)
        flow_bps = rng.uniform(1e6, 1e8)
        flow_pps = rng.uniform(1000, 50000)
        syn_flags = fwd_pkts  # SYN flood pattern
        iat_mean = rng.uniform(0.0001, 0.001)
        fwd_len_mean = rng.uniform(40, 80)  # small packets

    elif attack_type == "brute-force":
        fwd_pkts = rng.randint(10, 100)
        bwd_pkts = fwd_pkts  # symmetric auth attempts
        flow_duration = rng.uniform(0.5, 3.0)
        ack_flags = fwd_pkts
        psh_flags = rng.randint(0, 5)

    elif attack_type == "port-scan":
        fwd_pkts = rng.randint(1, 5)
        bwd_pkts = 0  # no response on closed ports
        rst_flags = rng.randint(1, fwd_pkts)
        syn_flags = fwd_pkts
        fwd_len_mean = 40.0  # probe packet size
        flow_duration = rng.uniform(0.001, 0.05)

    elif attack_type == "botnet":
        flow_duration = rng.uniform(30, 300)  # long-lived C&C
        fwd_pkts = rng.randint(5, 30)
        bwd_pkts = rng.randint(5, 30)
        psh_flags = rng.randint(5, 20)
        iat_mean = rng.uniform(1, 10)

    elif attack_type == "malware":
        total_bytes = rng.randint(50_000, 5_000_000)  # large data exfil
        flow_bps = total_bytes / max(flow_duration, 1)
        fwd_len_mean = rng.uniform(1000, 1500)

    features = [
        float(flow_duration),
        float(fwd_pkts),
        float(bwd_pkts),
        float(flow_bps),
        float(flow_pps),
        float(fwd_len_mean),
        float(bwd_len_mean),
        float(iat_mean),
        float(syn_flags),
        float(rst_flags),
        float(psh_flags),
        float(ack_flags),
    ]

    # Clamp NaN / inf that can arise from edge-case division
    return [0.0 if (math.isnan(f) or math.isinf(f)) else f for f in features]

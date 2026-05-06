"""ML inference service — loads models and runs predictions on events.

Gracefully degrades when model files are not present (no CICIDS2017 training required
for demo mode — falls back to rule-based scoring using the feature extractor).
"""

from __future__ import annotations
import logging
import os
import math
from dataclasses import dataclass
from typing import TYPE_CHECKING

from ml.feature_extractor import extract_features, FEATURE_NAMES

if TYPE_CHECKING:
    pass

logger = logging.getLogger("cybersphere.ml.inference")

ATTACK_TYPES = ["DDoS", "brute-force", "port-scan", "botnet", "malware", "normal"]

# Rule-based weights used when models are NOT loaded (demo fallback)
_TYPE_RISK_WEIGHT: dict[str, int] = {
    "DDoS": 30,
    "malware": 35,
    "brute-force": 25,
    "botnet": 28,
    "port-scan": 15,
    "normal": 0,
}


@dataclass
class MLPrediction:
    anomaly_score: float
    predicted_class: str
    confidence: float
    risk_score: int
    severity: str
    class_probabilities: dict[str, float]
    ml_used: bool  # False when falling back to rule-based scoring


def compute_risk_score(anomaly_score: float, attack_type: str, confidence: float) -> tuple[int, str]:
    """Compute a 0-100 risk score and severity label."""
    base = anomaly_score * 60  # 0-60 from anomaly detector
    type_weight = _TYPE_RISK_WEIGHT.get(attack_type, 10)
    score = min(100, int(base + type_weight * confidence))

    if score >= 80:
        severity = "Critical"
    elif score >= 55:
        severity = "High"
    elif score >= 30:
        severity = "Medium"
    else:
        severity = "Low"

    return score, severity


def _rule_based_prediction(event: dict) -> MLPrediction:
    """
    Fallback when ML models are not loaded.
    Uses event metadata directly to produce plausible predictions.
    """
    attack_type: str = event.get("attack_type", "normal")
    is_malicious: bool = bool(event.get("is_malicious", False))
    raw_anomaly: float = float(event.get("anomaly_score", 0.0))

    # Clamp and normalise
    anomaly_score = max(0.0, min(1.0, raw_anomaly))

    # Confidence heuristic: higher for malicious events
    confidence = 0.85 if is_malicious else 0.60

    # Uniform probability distribution with peak at predicted class
    probs: dict[str, float] = {t: 0.02 for t in ATTACK_TYPES}
    probs[attack_type] = confidence
    # Normalise
    total = sum(probs.values())
    probs = {k: round(v / total, 4) for k, v in probs.items()}

    risk_score, severity = compute_risk_score(anomaly_score, attack_type, confidence)

    return MLPrediction(
        anomaly_score=anomaly_score,
        predicted_class=attack_type,
        confidence=confidence,
        risk_score=risk_score,
        severity=severity,
        class_probabilities=probs,
        ml_used=False,
    )


class MLInferenceService:
    """
    Wraps scikit-learn / XGBoost models for event-level inference.
    Models are optional — the service degrades to rule-based scoring if
    .joblib files are not present (e.g., before CICIDS2017 training).
    """

    def __init__(self) -> None:
        self._anomaly_model = None   # IsolationForest
        self._classifier = None      # XGBoost / RandomForest
        self._scaler = None          # StandardScaler
        self._models_loaded = False

    @property
    def models_loaded(self) -> bool:
        return self._models_loaded

    def load_models(self, model_dir: str) -> None:
        """
        Attempt to load .joblib model files from model_dir.
        Silently skips if files are missing (demo mode).
        """
        try:
            import joblib  # only import if actually available
        except ImportError:
            logger.warning("[ML] joblib not installed — running in rule-based fallback mode")
            return

        paths = {
            "anomaly": os.path.join(model_dir, "isolation_forest.joblib"),
            "classifier": os.path.join(model_dir, "xgboost_classifier.joblib"),
            "scaler": os.path.join(model_dir, "scaler.joblib"),
        }

        missing = [k for k, p in paths.items() if not os.path.exists(p)]
        if missing:
            logger.info(
                "[ML] Model files not found (%s) — running in rule-based fallback mode. "
                "Train models with ml/src/train_*.py to enable ML inference.",
                ", ".join(missing),
            )
            return

        try:
            self._scaler = joblib.load(paths["scaler"])
            self._anomaly_model = joblib.load(paths["anomaly"])
            self._classifier = joblib.load(paths["classifier"])
            self._models_loaded = True
            logger.info("[ML] Models loaded successfully from %s ✅", model_dir)
        except Exception:
            logger.exception("[ML] Failed to load models — falling back to rule-based mode")
            self._anomaly_model = None
            self._classifier = None
            self._scaler = None
            self._models_loaded = False

    def predict_event(self, event: dict) -> MLPrediction:
        """
        Run inference on a single event dict.
        Returns MLPrediction; uses rule-based fallback if models are not loaded.
        """
        if not self._models_loaded:
            return _rule_based_prediction(event)

        try:
            import numpy as np  # type: ignore[import-untyped]

            features = extract_features(event)
            X = np.array([features], dtype=float)

            # Scale
            X_scaled = self._scaler.transform(X)

            # Anomaly score: IsolationForest returns negative score; higher = more anomalous
            raw_score = float(self._anomaly_model.decision_function(X_scaled)[0])
            # Normalise to 0-1 (invert so 1 = most anomalous)
            anomaly_score = max(0.0, min(1.0, (-raw_score + 0.5)))

            # Classification
            class_probs: list[float] = self._classifier.predict_proba(X_scaled)[0].tolist()
            classes: list[str] = list(self._classifier.classes_)
            probs_map = {c: round(float(p), 4) for c, p in zip(classes, class_probs)}

            predicted_class = classes[int(class_probs.index(max(class_probs)))]
            confidence = max(class_probs)

            risk_score, severity = compute_risk_score(anomaly_score, predicted_class, confidence)

            return MLPrediction(
                anomaly_score=anomaly_score,
                predicted_class=predicted_class,
                confidence=confidence,
                risk_score=risk_score,
                severity=severity,
                class_probabilities=probs_map,
                ml_used=True,
            )

        except Exception:
            logger.exception("[ML] Inference error — falling back to rule-based mode for this event")
            return _rule_based_prediction(event)


# Module-level singleton — imported by backend startup
inference_service = MLInferenceService()

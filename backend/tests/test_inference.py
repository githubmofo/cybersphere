"""Unit tests for ML inference service (rule-based fallback mode)."""

import pytest
from ml.inference import MLInferenceService, _rule_based_prediction


SAMPLE_EVENTS = [
    {
        "event_id": "test-001",
        "attack_type": "DDoS",
        "is_malicious": True,
        "anomaly_score": 0.85,
        "bytes": 50000,
    },
    {
        "event_id": "test-002",
        "attack_type": "normal",
        "is_malicious": False,
        "anomaly_score": 0.05,
        "bytes": 512,
    },
    {
        "event_id": "test-003",
        "attack_type": "port-scan",
        "is_malicious": True,
        "anomaly_score": 0.60,
        "bytes": 80,
    },
    {
        "event_id": "test-004",
        "attack_type": "malware",
        "is_malicious": True,
        "anomaly_score": 0.92,
        "bytes": 100000,
    },
]


class TestRuleBasedPrediction:
    def test_returns_correct_predicted_class(self):
        for event in SAMPLE_EVENTS:
            pred = _rule_based_prediction(event)
            assert pred.predicted_class == event["attack_type"]

    def test_anomaly_score_clamped_0_to_1(self):
        for event in SAMPLE_EVENTS:
            pred = _rule_based_prediction(event)
            assert 0.0 <= pred.anomaly_score <= 1.0

    def test_risk_score_in_range(self):
        for event in SAMPLE_EVENTS:
            pred = _rule_based_prediction(event)
            assert 0 <= pred.risk_score <= 100

    def test_severity_valid_values(self):
        valid = {"Low", "Medium", "High", "Critical"}
        for event in SAMPLE_EVENTS:
            pred = _rule_based_prediction(event)
            assert pred.severity in valid

    def test_class_probabilities_sum_to_one(self):
        for event in SAMPLE_EVENTS:
            pred = _rule_based_prediction(event)
            total = sum(pred.class_probabilities.values())
            assert abs(total - 1.0) < 0.01

    def test_ml_used_is_false_in_fallback(self):
        for event in SAMPLE_EVENTS:
            pred = _rule_based_prediction(event)
            assert pred.ml_used is False

    def test_malicious_has_higher_risk_than_normal(self):
        ddos_pred = _rule_based_prediction(SAMPLE_EVENTS[0])
        normal_pred = _rule_based_prediction(SAMPLE_EVENTS[1])
        assert ddos_pred.risk_score > normal_pred.risk_score


class TestMLInferenceService:
    def test_service_starts_in_fallback_mode(self):
        svc = MLInferenceService()
        assert svc.models_loaded is False

    def test_predict_event_works_in_fallback(self):
        svc = MLInferenceService()
        pred = svc.predict_event(SAMPLE_EVENTS[0])
        assert pred is not None
        assert pred.predicted_class == "DDoS"

    def test_load_models_from_nonexistent_dir_is_safe(self):
        """Should not raise — gracefully logs and stays in fallback."""
        svc = MLInferenceService()
        svc.load_models("/nonexistent/path/to/models")
        assert svc.models_loaded is False

    def test_predict_all_attack_types(self):
        svc = MLInferenceService()
        types = ["DDoS", "brute-force", "port-scan", "botnet", "malware", "normal"]
        for attack_type in types:
            event = {
                "event_id": f"test-{attack_type}",
                "attack_type": attack_type,
                "is_malicious": attack_type != "normal",
                "anomaly_score": 0.5,
                "bytes": 1000,
            }
            pred = svc.predict_event(event)
            assert pred.severity in {"Low", "Medium", "High", "Critical"}
            assert 0 <= pred.risk_score <= 100

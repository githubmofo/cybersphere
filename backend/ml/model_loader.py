"""Model loader — called during FastAPI lifespan startup."""

from __future__ import annotations
import logging
import os

from ml.inference import inference_service

logger = logging.getLogger("cybersphere.ml.model_loader")


def load_models_at_startup(model_dir: str | None = None) -> None:
    """
    Load ML models from model_dir at application startup.
    Safe to call even when model files don't exist yet.
    """
    if model_dir is None:
        # Default: relative to this file → ../../ml/models/
        base = os.path.dirname(os.path.abspath(__file__))
        model_dir = os.path.normpath(os.path.join(base, "..", "..", "ml", "models"))

    logger.info("[ML] Loading models from %s", model_dir)
    inference_service.load_models(model_dir)

    if inference_service.models_loaded:
        logger.info("[ML] ✅ ML inference active")
    else:
        logger.info("[ML] ⚠️  Rule-based fallback active (no trained models found)")

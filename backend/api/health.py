from fastapi import APIRouter
from models.schemas import HealthResponse
from config import get_settings

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint for monitoring and deployment verification."""
    settings = get_settings()
    return HealthResponse(
        status="ok",
        version=settings.app_version,
        ml_enabled=settings.enable_ml_inference,
    )

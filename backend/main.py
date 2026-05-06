import logging
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from api.health import router as health_router
from api.simulation import router as simulation_router
from api.nodes import router as nodes_router, initialize_topology
from api.events import router as events_router, add_event_to_buffer
from websocket.manager import manager
from websocket.handlers import handle_client_message, simulation, broadcast_event
from ml.model_loader import load_models_at_startup

logger = logging.getLogger("cybersphere")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifecycle manager."""
    settings = get_settings()
    logger.info(
        "CyberSphere AI v%s starting (ML=%s)",
        settings.app_version,
        settings.enable_ml_inference,
    )

    # Initialize network topology
    initialize_topology()

    # Load ML models (graceful no-op if model files not present)
    load_models_at_startup(settings.model_dir if settings.enable_ml_inference else None)

    # Startup: load ML models when enabled (Wave 5)
    if settings.enable_ml_inference:
        logger.info("ML inference enabled — models ready")

    yield

    # Shutdown: stop simulation if running
    if simulation.is_active:
        await simulation.stop()
    logger.info("CyberSphere AI shutting down")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="AI-powered cyber attack visualization platform",
        lifespan=lifespan,
    )

    # CORS — configured from environment, never ["*"] in production
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["*"],
    )

    # Register routers
    app.include_router(health_router)
    app.include_router(simulation_router)
    app.include_router(nodes_router)
    app.include_router(events_router)

    return app


app = create_app()


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket) -> None:
    """WebSocket endpoint for real-time event streaming."""
    await manager.connect(ws)
    try:
        while True:
            raw = await ws.receive_text()
            await handle_client_message(ws, raw)
    except WebSocketDisconnect:
        manager.disconnect(ws)
    except Exception:
        logger.exception("WebSocket error")
        manager.disconnect(ws)

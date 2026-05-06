"""REST API routes for simulation control."""

import logging
from fastapi import APIRouter
from models.schemas import SimulationCommand
from websocket.handlers import simulation, broadcast_event

logger = logging.getLogger("cybersphere.api.simulation")

router = APIRouter(prefix="/api", tags=["simulation"])


@router.post("/simulation")
async def control_simulation(cmd: SimulationCommand) -> dict:
    """Start or stop the simulation engine."""
    if cmd.action == "start":
        await simulation.start(cmd.scenario, broadcast_event, cmd.events_per_second)
        logger.info("Simulation started: scenario=%s", cmd.scenario)
        return {
            "status": "started",
            "scenario": cmd.scenario,
            "events_per_second": cmd.events_per_second,
        }
    elif cmd.action == "stop":
        await simulation.stop()
        logger.info("Simulation stopped")
        return {"status": "stopped"}
    else:
        return {"status": "error", "message": f"Unknown action: {cmd.action}"}


@router.get("/simulation/status")
async def simulation_status() -> dict:
    """Get current simulation status."""
    return {
        "active": simulation.is_active,
        "scenario": simulation.scenario,
    }

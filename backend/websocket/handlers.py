"""WebSocket event handlers — process client messages and dispatch actions."""

import json
import logging
from fastapi import WebSocket
from websocket.manager import manager
from simulation.generator import SimulationEngine

logger = logging.getLogger("cybersphere.ws.handlers")

# Global simulation engine instance
simulation = SimulationEngine()


async def broadcast_event(event: dict) -> None:
    """Callback for simulation engine — broadcasts event to all WS clients."""
    await manager.broadcast({"type": "event", "data": event})


async def handle_client_message(ws: WebSocket, raw: str) -> None:
    """Parse and handle a client WebSocket message."""
    try:
        msg = json.loads(raw)
    except json.JSONDecodeError:
        logger.warning("Invalid JSON from client")
        await manager.send_to(ws, {"type": "error", "data": {"message": "Invalid JSON"}})
        return

    action = msg.get("action")

    if action == "subscribe":
        channel = msg.get("channel", "events")
        logger.info("Client subscribed to channel: %s", channel)
        await manager.send_to(ws, {
            "type": "simulation_status",
            "data": {
                "active": simulation.is_active,
                "scenario": simulation.scenario,
            },
        })

    elif action == "start_simulation":
        scenario = msg.get("scenario", "mixed")
        eps = msg.get("events_per_second")
        await simulation.start(scenario, broadcast_event, eps)
        await manager.broadcast({
            "type": "simulation_status",
            "data": {"active": True, "scenario": scenario},
        })

    elif action == "stop_simulation":
        await simulation.stop()
        await manager.broadcast({
            "type": "simulation_status",
            "data": {"active": False, "scenario": simulation.scenario},
        })

    else:
        logger.warning("Unknown action: %s", action)

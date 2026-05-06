"""WebSocket connection manager — handles multiple client connections."""

import logging
from fastapi import WebSocket

logger = logging.getLogger("cybersphere.ws")


class ConnectionManager:
    """Manages active WebSocket connections and broadcasting."""

    def __init__(self) -> None:
        self._connections: list[WebSocket] = []

    @property
    def active_count(self) -> int:
        return len(self._connections)

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self._connections.append(ws)
        logger.info("Client connected (total: %d)", self.active_count)

    def disconnect(self, ws: WebSocket) -> None:
        if ws in self._connections:
            self._connections.remove(ws)
        logger.info("Client disconnected (total: %d)", self.active_count)

    async def broadcast(self, message: dict) -> None:
        """Send message to all connected clients. Remove dead connections."""
        dead: list[WebSocket] = []
        for ws in self._connections:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)

        for ws in dead:
            self.disconnect(ws)

    async def send_to(self, ws: WebSocket, message: dict) -> None:
        """Send message to a specific client."""
        try:
            await ws.send_json(message)
        except Exception:
            self.disconnect(ws)


# Global singleton
manager = ConnectionManager()

"""
WebSocket connection manager para notificaciones en tiempo real.
Usado para notificar a la PC principal cuando se crea una nueva orden
desde otro dispositivo (teléfono de mesero).
"""

import json
import logging

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Administra conexiones WebSocket activas."""

    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(
            f"WS conectado. Total conexiones: {len(self.active_connections)}"
        )

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(
            f"WS desconectado. Total conexiones: {len(self.active_connections)}"
        )

    async def broadcast(self, message: dict):
        """Envía un mensaje JSON a todas las conexiones activas."""
        data = json.dumps(message, default=str)
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(data)
            except Exception:
                disconnected.append(connection)
        # Limpiar conexiones muertas
        for conn in disconnected:
            self.disconnect(conn)


# Instancia global
manager = ConnectionManager()

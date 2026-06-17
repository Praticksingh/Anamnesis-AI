import asyncio
import logging
from contextvars import ContextVar
from fastapi import WebSocket

logger = logging.getLogger(__name__)

# Context variable to hold the scenario ID for the current async execution context
current_scenario_id: ContextVar[str] = ContextVar("current_scenario_id", default="")

# In-memory mapping of scenario_id -> list of active WebSocket connections
_active_websockets = {}

async def register_websocket(scenario_id: str, websocket: WebSocket):
    if scenario_id not in _active_websockets:
        _active_websockets[scenario_id] = []
    _active_websockets[scenario_id].append(websocket)
    logger.info("Telemetry WS │ Connected scenario %s (active=%d)", scenario_id, len(_active_websockets[scenario_id]))

def unregister_websocket(scenario_id: str, websocket: WebSocket):
    if scenario_id in _active_websockets:
        if websocket in _active_websockets[scenario_id]:
            _active_websockets[scenario_id].remove(websocket)
        if not _active_websockets[scenario_id]:
            del _active_websockets[scenario_id]
    logger.info("Telemetry WS │ Disconnected scenario %s", scenario_id)

async def broadcast_log(message: str, scenario_id: str = ""):
    """Send a log message to all WebSockets listening to the current scenario."""
    sid = scenario_id or current_scenario_id.get()
    if not sid:
        return

    # Log locally in backend
    logger.info("Telemetry WS │ Broadcast [%s]: %s", sid[:8], message)

    if sid in _active_websockets and _active_websockets[sid]:
        sockets = list(_active_websockets[sid])
        coros = [ws.send_text(message) for ws in sockets]
        await asyncio.gather(*coros, return_exceptions=True)

"""REST API routes for events (recent event log)."""

import logging
from collections import deque
from fastapi import APIRouter, Query

logger = logging.getLogger("cybersphere.api.events")

router = APIRouter(prefix="/api", tags=["events"])

# In-memory ring buffer for recent events
MAX_EVENTS = 5000
event_buffer: deque[dict] = deque(maxlen=MAX_EVENTS)


def add_event_to_buffer(event: dict) -> None:
    """Push an event into the ring buffer."""
    event_buffer.append(event)


@router.get("/events")
async def get_events(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    severity: str | None = Query(default=None),
    attack_type: str | None = Query(default=None),
) -> dict:
    """Get recent events with pagination and optional filtering."""
    events = list(event_buffer)

    # Apply filters
    if severity:
        events = [e for e in events if e.get("severity") == severity]
    if attack_type:
        events = [e for e in events if e.get("attack_type") == attack_type]

    # Reverse for newest-first
    events.reverse()
    total = len(events)
    paginated = events[offset : offset + limit]

    return {
        "events": paginated,
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.get("/events/stats")
async def get_event_stats() -> dict:
    """Get aggregate event statistics."""
    events = list(event_buffer)
    total = len(events)
    malicious = sum(1 for e in events if e.get("is_malicious"))
    by_type: dict[str, int] = {}
    by_severity: dict[str, int] = {}

    for e in events:
        at = e.get("attack_type", "unknown")
        sv = e.get("severity", "unknown")
        by_type[at] = by_type.get(at, 0) + 1
        by_severity[sv] = by_severity.get(sv, 0) + 1

    return {
        "total_events": total,
        "malicious_events": malicious,
        "normal_events": total - malicious,
        "malicious_ratio": round(malicious / max(total, 1), 3),
        "by_attack_type": by_type,
        "by_severity": by_severity,
    }

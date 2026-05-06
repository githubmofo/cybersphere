"""Integration tests for simulation and node REST endpoints."""

import pytest


@pytest.mark.asyncio
async def test_simulation_status(client):
    response = await client.get("/api/simulation/status")
    assert response.status_code == 200
    data = response.json()
    assert "active" in data
    assert "scenario" in data
    assert isinstance(data["active"], bool)


@pytest.mark.asyncio
async def test_simulation_start(client):
    """POST /api/simulation with action=start should respond 200."""
    response = await client.post(
        "/api/simulation",
        json={"action": "start", "scenario": "calm", "events_per_second": 1},
    )
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") in ("started", "stopped", "error")


@pytest.mark.asyncio
async def test_simulation_stop(client):
    """POST /api/simulation with action=stop should respond 200."""
    response = await client.post(
        "/api/simulation",
        json={"action": "stop"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") in ("stopped", "started", "error")


@pytest.mark.asyncio
async def test_simulation_unknown_action(client):
    """Unknown action should return error status."""
    response = await client.post(
        "/api/simulation",
        json={"action": "explode"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "error"


@pytest.mark.asyncio
async def test_nodes_endpoint_returns_lists(client):
    """GET /api/nodes should return nodes and edges lists."""
    response = await client.get("/api/nodes")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert isinstance(data["nodes"], list)
    assert isinstance(data["edges"], list)


@pytest.mark.asyncio
async def test_events_endpoint(client):
    response = await client.get("/api/events")
    assert response.status_code == 200
    data = response.json()
    assert "events" in data
    assert isinstance(data["events"], list)

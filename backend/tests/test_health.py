"""Tests for /health endpoint."""

import pytest


@pytest.mark.asyncio
async def test_health_returns_ok(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data


@pytest.mark.asyncio
async def test_health_cors_header(client):
    """Health endpoint should be reachable without CORS rejection in tests."""
    response = await client.get("/health")
    assert response.status_code == 200

"""pytest fixtures for CyberSphere backend tests."""

import asyncio
import pytest
from httpx import AsyncClient, ASGITransport
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app


@pytest.fixture
async def client():
    """Async HTTP client bound to the FastAPI ASGI app."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac

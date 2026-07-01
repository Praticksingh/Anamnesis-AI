"""Shared fixtures for Anamnesis-AI backend tests."""

from contextlib import asynccontextmanager

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
async def client():
    """Provide an async HTTP client wired to the FastAPI app."""
    @asynccontextmanager
    async def lifespan_app():
        async with app.router.lifespan_context(app):
            yield

    async with lifespan_app():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac

"""Integration tests for FastAPI endpoints."""

import pytest


class TestHealthCheck:
    async def test_health_returns_ok(self, client):
        resp = await client.get("/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] in ("ok", "degraded")
        assert "database" in data


class TestCreateScenario:
    async def test_create_valid_scenario(self, client):
        resp = await client.post(
            "/api/scenarios",
            json={"raw_input": "What if the Roman Empire never fell?"},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert "scenario_id" in data
        assert isinstance(data["scenario_id"], str)
        assert len(data["scenario_id"]) > 0

    async def test_create_empty_scenario(self, client):
        resp = await client.post(
            "/api/scenarios",
            json={"raw_input": "   "},
        )
        assert resp.status_code == 422

    async def test_create_too_long_scenario(self, client):
        long_input = "x" * 3000
        resp = await client.post(
            "/api/scenarios",
            json={"raw_input": long_input},
        )
        assert resp.status_code == 422
        assert "maximum length" in resp.json()["detail"].lower()

    async def test_create_missing_raw_input(self, client):
        resp = await client.post("/api/scenarios", json={})
        assert resp.status_code == 422


class TestGetScenarioStatus:
    async def test_status_nonexistent_scenario(self, client):
        resp = await client.get("/api/scenarios/nonexistent-id/status")
        assert resp.status_code in (404, 500)

    async def test_status_after_creation(self, client):
        create_resp = await client.post(
            "/api/scenarios",
            json={"raw_input": "What if gravity was twice as strong?"},
        )
        scenario_id = create_resp.json()["scenario_id"]
        status_resp = await client.get(f"/api/scenarios/{scenario_id}/status")
        assert status_resp.status_code == 200
        data = status_resp.json()
        assert data["status"] in ("pending", "running", "done", "error")
        assert "completed_agents" in data


class TestGetScenarioReport:
    async def test_report_nonexistent_scenario(self, client):
        resp = await client.get("/api/scenarios/nonexistent-id/report")
        assert resp.status_code in (404, 500)

    async def test_report_not_ready(self, client):
        from app.database import AsyncSessionLocal
        from app.models import Scenario
        
        async with AsyncSessionLocal() as session:
            scenario = Scenario(
                raw_input="What if Mars was habitable?",
                status="pending",
            )
            session.add(scenario)
            await session.commit()
            scenario_id = scenario.id

        report_resp = await client.get(f"/api/scenarios/{scenario_id}/report")
        # Should return 409 (not ready) since we inserted it with pending status
        assert report_resp.status_code == 409

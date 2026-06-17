"""Unit tests for the LLM client (mock mode)."""

import pytest
from app.llm_client import call_agent, AgentResponseError


class TestCallAgentMock:
    """When no API keys are set, call_agent should use the mock path."""

    async def test_returns_dict(self):
        """Mock responses should parse as dictionary."""
        # We can pass a prompt that matches "climate" to get climate mock
        result = await call_agent("You are the climate agent.", "What if test?")
        assert isinstance(result, dict)
        assert "analysis_text" in result
        assert "impact_score" in result
        assert "timeline_events" in result

    async def test_fallback_default_mock(self):
        """Should fallback to orchestrator mock if prompt matches orchestrator/parse."""
        result = await call_agent("orchestrator", "test scenario")
        assert isinstance(result, dict)
        assert "scenario" in result
        assert "divergence_year" in result

    async def test_critic_mock_generation(self):
        """Should generate critic mock response based on input scenario context if possible."""
        import json
        from app.telemetry import current_scenario_id
        
        # Use a unique scenario ID to avoid test pollution from other tests modifying "default"
        current_scenario_id.set("test_critic_mock_unique_id")
        
        input_data = json.dumps({
            "economist": {"impact_score": 80},
            "technology": {"impact_score": 30}
        })
        result = await call_agent("critic", input_data)
        assert isinstance(result, dict)
        assert "confidence_score" in result
        # Since economist impact score is 80 (extreme projection > 75), confidence should be reduced
        assert result["confidence_score"] < 95
        assert any("economist" in note for note in result["risk_notes"])

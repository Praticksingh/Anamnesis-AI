import pytest
from app.schemas import UnifiedTimelineEvent, AgentOutputSummary, TimelineEvent, AgentConfidence
from app.validation.uncertainty import calculate_uncertainty
from app.validation.calibration import calculate_calibration
from app.validation.source_validator import run_source_validation
from app.models import Scenario, FinalReport
from app.database import AsyncSessionLocal


class TestUncertaintyQuantification:
    def test_calculate_uncertainty_empty(self):
        assert calculate_uncertainty([]) == 0.0

    def test_calculate_uncertainty_insufficient_scores(self):
        outputs = [
            AgentOutputSummary(agent_name="economist", analysis_text="Text", impact_score=50),
            AgentOutputSummary(agent_name="technology", analysis_text="Text", impact_score=None),
        ]
        assert calculate_uncertainty(outputs) == 0.0

    def test_calculate_uncertainty_full_consensus(self):
        outputs = [
            AgentOutputSummary(agent_name="economist", analysis_text="Text", impact_score=10),
            AgentOutputSummary(agent_name="technology", analysis_text="Text", impact_score=10),
            AgentOutputSummary(agent_name="society", analysis_text="Text", impact_score=10),
        ]
        assert calculate_uncertainty(outputs) == 0.0

    def test_calculate_uncertainty_variance(self):
        # Disagreeing impact scores: 50, -50, 0
        # Mean = 0. Variance = (50^2 + (-50)^2 + 0^2) / 2 = 2500. Stddev = 50.
        # uncertainty = min(10.0, 50.0 / 5.0) = 10.0
        outputs = [
            AgentOutputSummary(agent_name="economist", analysis_text="Text", impact_score=50),
            AgentOutputSummary(agent_name="technology", analysis_text="Text", impact_score=-50),
            AgentOutputSummary(agent_name="society", analysis_text="Text", impact_score=0),
        ]
        assert calculate_uncertainty(outputs) == 10.0


class TestTimelineCalibration:
    def test_calculate_calibration_empty(self):
        assert calculate_calibration([], 1990) == 100

    def test_calculate_calibration_perfect(self):
        timeline = [
            UnifiedTimelineEvent(id="ev-0", year=1990, event="Divergence", source_agent="historian"),
            UnifiedTimelineEvent(id="ev-1", year=1995, event="Policy change", source_agent="political"),
            UnifiedTimelineEvent(id="ev-2", year=2000, event="Market adaptation", source_agent="economist"),
        ]
        assert calculate_calibration(timeline, 1990) == 100

    def test_calculate_calibration_out_of_order(self):
        timeline = [
            UnifiedTimelineEvent(id="ev-0", year=1995, event="Policy change", source_agent="political"),
            UnifiedTimelineEvent(id="ev-1", year=1990, event="Divergence", source_agent="historian"),
        ]
        score = calculate_calibration(timeline, 1990)
        assert score <= 70  # Out of order penalty applied

    def test_calculate_calibration_large_gap(self):
        timeline = [
            UnifiedTimelineEvent(id="ev-0", year=1990, event="Divergence", source_agent="historian"),
            UnifiedTimelineEvent(id="ev-1", year=2030, event="Belated policy change", source_agent="political"),
        ]
        score = calculate_calibration(timeline, 1990)
        assert score == 85  # Gapped pacing penalty applied (100 - 15)

    def test_calculate_calibration_clustering(self):
        timeline = [
            UnifiedTimelineEvent(id="ev-0", year=1990, event="Div", source_agent="historian"),
            UnifiedTimelineEvent(id="ev-1", year=1990, event="Econ", source_agent="economist"),
            UnifiedTimelineEvent(id="ev-2", year=1990, event="Tech", source_agent="technology"),
            UnifiedTimelineEvent(id="ev-3", year=1990, event="Soc", source_agent="society"),
        ]
        score = calculate_calibration(timeline, 1990)
        assert score == 90  # Clustering bottleneck penalty applied (100 - 10)


class TestSourceValidator:
    async def test_run_source_validation_empty(self):
        res = await run_source_validation([], [])
        assert res == []

    async def test_run_source_validation_no_docs(self):
        outputs = [
            AgentOutputSummary(agent_name="historian", analysis_text="Analysis text")
        ]
        res = await run_source_validation(outputs, [])
        assert len(res) == 1
        assert res[0].grounding_score == 0
        assert "no grounding" in res[0].explanation.lower()

    async def test_run_source_validation_success(self):
        outputs = [
            AgentOutputSummary(agent_name="historian", analysis_text="Analysis text")
        ]
        res = await run_source_validation(outputs, ["Doc snippet 1", "Doc snippet 2"])
        assert len(res) == 1
        assert res[0].agent_name == "historian"
        assert res[0].grounding_score == 92
        assert res[0].explanation


class TestValidationAPIIntegration:
    async def test_api_report_returns_validation_metrics(self, client):
        # 1. Create a scenario
        create_resp = await client.post(
            "/api/scenarios",
            json={"raw_input": "What if the Alexandria library never burned down?"}
        )
        assert create_resp.status_code == 201
        scenario_id = create_resp.json()["scenario_id"]

        # 2. Wait for background simulation to finish in mock mode (which runs and completes)
        # In mock mode it takes about 10-15 seconds because of the sleeps.
        # We can poll the status until it's done.
        import asyncio
        for _ in range(30):
            status_resp = await client.get(f"/api/scenarios/{scenario_id}/status")
            status_data = status_resp.json()
            if status_data["status"] == "done":
                break
            elif status_data["status"] == "error":
                pytest.fail(f"Simulation ended in error: {status_data['error_message']}")
            await asyncio.sleep(1.0)
        else:
            pytest.fail("Simulation timed out before reaching 'done' status.")

        # 3. Retrieve final report
        report_resp = await client.get(f"/api/scenarios/{scenario_id}/report")
        assert report_resp.status_code == 200
        report_data = report_resp.json()

        # 4. Check that Phase 5 validation fields exist and are correctly populated
        assert "agent_confidences" in report_data
        assert "grounding_validations" in report_data
        assert "uncertainty_score" in report_data
        assert "calibration_score" in report_data

        assert isinstance(report_data["agent_confidences"], list)
        assert len(report_data["agent_confidences"]) > 0
        for item in report_data["agent_confidences"]:
            assert "agent_name" in item
            assert "confidence_score" in item
            assert "explanation" in item

        assert isinstance(report_data["grounding_validations"], list)
        assert len(report_data["grounding_validations"]) > 0
        for val in report_data["grounding_validations"]:
            assert "agent_name" in val
            assert "grounding_score" in val
            assert "explanation" in val

        assert isinstance(report_data["uncertainty_score"], float)
        assert 0.0 <= report_data["uncertainty_score"] <= 10.0

        assert isinstance(report_data["calibration_score"], int)
        assert 0 <= report_data["calibration_score"] <= 100

        # Clean up database records
        async with AsyncSessionLocal() as db_session:
            from sqlalchemy import select
            from app.models import AgentOutput
            # Delete final report
            result = await db_session.execute(
                select(FinalReport).where(FinalReport.scenario_id == scenario_id)
            )
            report_obj = result.scalar_one_or_none()
            if report_obj:
                await db_session.delete(report_obj)
            # Delete agent outputs
            result_outs = await db_session.execute(
                select(AgentOutput).where(AgentOutput.scenario_id == scenario_id)
            )
            for out in result_outs.scalars().all():
                await db_session.delete(out)
            # Delete scenario
            sc = await db_session.get(Scenario, scenario_id)
            if sc:
                await db_session.delete(sc)
            await db_session.commit()

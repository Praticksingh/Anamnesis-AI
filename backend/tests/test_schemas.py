"""Unit tests for Pydantic schemas."""

import pytest
from pydantic import ValidationError

from app.schemas import (
    ClimateOutput,
    CriticOutput,
    EconomistOutput,
    FinalReportSchema,
    HistorianOutput,
    ImpactDashboard,
    ScenarioContext,
    ScenarioCreateRequest,
    SocietyOutput,
    TechnologyOutput,
    PoliticalOutput,
    EnergyOutput,
    HealthcareOutput,
    DemographicsOutput,
    TimelineEvent,
    UnifiedTimelineEvent,
)


# ── TimelineEvent ─────────────────────────────────────────────────────────────


class TestTimelineEvent:
    def test_valid(self):
        ev = TimelineEvent(year=1990, event="Something happened")
        assert ev.year == 1990
        assert ev.event == "Something happened"

    def test_missing_year(self):
        with pytest.raises(ValidationError):
            TimelineEvent(event="No year")

    def test_missing_event(self):
        with pytest.raises(ValidationError):
            TimelineEvent(year=2000)


# ── ScenarioContext ───────────────────────────────────────────────────────────


class TestScenarioContext:
    def test_valid(self):
        ctx = ScenarioContext(
            scenario="What if X?",
            divergence_year=1990,
            focus_domains=["economy", "technology"],
            time_horizon=2025,
        )
        assert ctx.divergence_year == 1990
        assert len(ctx.focus_domains) == 2

    def test_missing_scenario(self):
        with pytest.raises(ValidationError):
            ScenarioContext(divergence_year=1990, focus_domains=[], time_horizon=2025)


# ── Agent Outputs ─────────────────────────────────────────────────────────────


class TestHistorianOutput:
    def test_valid(self):
        out = HistorianOutput(
            analysis_text="Analysis.",
            timeline_events=[{"year": 1990, "event": "Start"}],
        )
        assert out.agent_name == "historian"

    def test_rejects_wrong_agent_name(self):
        with pytest.raises(ValidationError):
            HistorianOutput(
                agent_name="wrong",
                analysis_text="X",
                timeline_events=[],
            )


class TestEconomistOutput:
    def test_valid(self):
        out = EconomistOutput(
            analysis_text="GDP shifted.",
            timeline_events=[{"year": 1995, "event": "Trade shift"}],
            impact_score=42,
        )
        assert out.impact_score == 42

    def test_missing_impact_score(self):
        with pytest.raises(ValidationError):
            EconomistOutput(
                analysis_text="GDP shifted.",
                timeline_events=[],
            )


class TestClimateOutput:
    def test_valid(self):
        out = ClimateOutput(
            analysis_text="Carbon reduced.",
            timeline_events=[],
            impact_score=-50,
        )
        assert out.impact_score == -50


class TestTechnologyOutput:
    def test_valid(self):
        out = TechnologyOutput(
            analysis_text="Tech shifted.",
            timeline_events=[],
            impact_score=25,
        )
        assert out.agent_name == "technology"


class TestSocietyOutput:
    def test_valid(self):
        out = SocietyOutput(
            analysis_text="Social change.",
            timeline_events=[],
            impact_score=10,
        )
        assert out.agent_name == "society"


class TestPoliticalOutput:
    def test_valid(self):
        out = PoliticalOutput(
            analysis_text="Political change.",
            timeline_events=[],
            impact_score=15,
        )
        assert out.agent_name == "political"


class TestEnergyOutput:
    def test_valid(self):
        out = EnergyOutput(
            analysis_text="Energy transition.",
            timeline_events=[],
            impact_score=35,
        )
        assert out.agent_name == "energy"


class TestHealthcareOutput:
    def test_valid(self):
        out = HealthcareOutput(
            analysis_text="Healthcare advances.",
            timeline_events=[],
            impact_score=45,
        )
        assert out.agent_name == "healthcare"


class TestDemographicsOutput:
    def test_valid(self):
        out = DemographicsOutput(
            analysis_text="Demographic shift.",
            timeline_events=[],
            impact_score=-5,
        )
        assert out.agent_name == "demographics"


class TestCriticOutput:
    def test_valid(self):
        out = CriticOutput(
            confidence_score=80,
            confidence_explanation="Coherent simulation.",
            risk_notes=["Minor issue"],
        )
        assert out.confidence_score == 80

    def test_missing_risk_notes(self):
        with pytest.raises(ValidationError):
            CriticOutput(confidence_score=80, confidence_explanation="OK")


# ── ImpactDashboard ───────────────────────────────────────────────────────────


class TestImpactDashboard:
    def test_valid(self):
        d = ImpactDashboard(
            economy=10, technology=20, society=30, politics=40, climate=50
        )
        assert d.economy == 10


# ── Request / Response ────────────────────────────────────────────────────────


class TestScenarioCreateRequest:
    def test_valid(self):
        req = ScenarioCreateRequest(raw_input="What if the sun was blue?")
        assert req.raw_input == "What if the sun was blue?"


# ── FinalReportSchema ─────────────────────────────────────────────────────────


class TestFinalReportSchema:
    def test_valid_minimal(self):
        report = FinalReportSchema(
            scenario_summary="Test scenario",
            alternate_timeline=[
                UnifiedTimelineEvent(year=1990, event="Event", source_agent="historian")
            ],
            agent_outputs=[],
            impact_dashboard=ImpactDashboard(
                economy=0, technology=0, society=0, politics=0, climate=0
            ),
            confidence_score=75,
            confidence_explanation="OK",
            risk_notes=[],
            sources_consulted=[],
            retrieved_documents=[],
        )
        assert report.confidence_score == 75

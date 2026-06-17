"""Unit tests for agent modules.

These test the agent functions using the mock LLM path (no API keys configured).
Each agent should return the expected output schema.
"""

import pytest
from app.schemas import (
    ScenarioContext,
    HistorianOutput,
    EconomistOutput,
    TechnologyOutput,
    SocietyOutput,
    ClimateOutput,
    PoliticalOutput,
    EnergyOutput,
    HealthcareOutput,
    DemographicsOutput,
    CriticOutput,
    TimelineEvent,
)
from app.agents.historian import run_historian
from app.agents.economist import run_economist
from app.agents.technology import run_technology
from app.agents.society import run_society
from app.agents.climate import run_climate
from app.agents.political import run_political
from app.agents.energy import run_energy
from app.agents.healthcare import run_healthcare
from app.agents.demographics import run_demographics
from app.agents.critic import run_critic


@pytest.fixture
def sample_context():
    return ScenarioContext(
        scenario="What if the Roman Empire never fell?",
        divergence_year=476,
        focus_domains=["history", "economy", "technology", "society", "climate"],
        time_horizon=2025,
    )


class TestHistorian:
    async def test_returns_expected_keys(self, sample_context):
        output, retrieved_docs, sources = await run_historian(sample_context)
        assert isinstance(output, HistorianOutput)
        assert output.analysis_text
        assert isinstance(output.timeline_events, list)
        assert isinstance(retrieved_docs, list)
        assert isinstance(sources, list)

    async def test_agent_name_is_historian(self, sample_context):
        output, _, _ = await run_historian(sample_context)
        assert output.agent_name == "historian"


class TestEconomist:
    async def test_returns_expected_keys(self, sample_context):
        output, retrieved_docs, sources = await run_economist(sample_context)
        assert isinstance(output, EconomistOutput)
        assert output.analysis_text
        assert isinstance(output.impact_score, int)
        assert isinstance(retrieved_docs, list)
        assert isinstance(sources, list)

    async def test_impact_score_in_range(self, sample_context):
        output, _, _ = await run_economist(sample_context)
        assert -100 <= output.impact_score <= 100


class TestTechnology:
    async def test_returns_expected_keys(self, sample_context):
        output, retrieved_docs, sources = await run_technology(sample_context)
        assert isinstance(output, TechnologyOutput)
        assert output.analysis_text
        assert isinstance(output.impact_score, int)
        assert isinstance(retrieved_docs, list)
        assert isinstance(sources, list)

    async def test_impact_score_in_range(self, sample_context):
        output, _, _ = await run_technology(sample_context)
        assert -100 <= output.impact_score <= 100


class TestSociety:
    async def test_returns_expected_keys(self, sample_context):
        output, retrieved_docs, sources = await run_society(sample_context)
        assert isinstance(output, SocietyOutput)
        assert output.analysis_text
        assert isinstance(output.impact_score, int)
        assert isinstance(retrieved_docs, list)
        assert isinstance(sources, list)

    async def test_impact_score_in_range(self, sample_context):
        output, _, _ = await run_society(sample_context)
        assert -100 <= output.impact_score <= 100


class TestClimate:
    async def test_returns_expected_keys(self, sample_context):
        output, retrieved_docs, sources = await run_climate(sample_context)
        assert isinstance(output, ClimateOutput)
        assert output.analysis_text
        assert isinstance(output.impact_score, int)
        assert isinstance(retrieved_docs, list)
        assert isinstance(sources, list)

    async def test_impact_score_in_range(self, sample_context):
        output, _, _ = await run_climate(sample_context)
        assert -100 <= output.impact_score <= 100


class TestPolitical:
    async def test_returns_expected_keys(self, sample_context):
        output, retrieved_docs, sources = await run_political(sample_context)
        assert isinstance(output, PoliticalOutput)
        assert output.analysis_text
        assert isinstance(output.impact_score, int)
        assert isinstance(retrieved_docs, list)
        assert isinstance(sources, list)

    async def test_impact_score_in_range(self, sample_context):
        output, _, _ = await run_political(sample_context)
        assert -100 <= output.impact_score <= 100


class TestEnergy:
    async def test_returns_expected_keys(self, sample_context):
        output, retrieved_docs, sources = await run_energy(sample_context)
        assert isinstance(output, EnergyOutput)
        assert output.analysis_text
        assert isinstance(output.impact_score, int)
        assert isinstance(retrieved_docs, list)
        assert isinstance(sources, list)

    async def test_impact_score_in_range(self, sample_context):
        output, _, _ = await run_energy(sample_context)
        assert -100 <= output.impact_score <= 100


class TestHealthcare:
    async def test_returns_expected_keys(self, sample_context):
        output, retrieved_docs, sources = await run_healthcare(sample_context)
        assert isinstance(output, HealthcareOutput)
        assert output.analysis_text
        assert isinstance(output.impact_score, int)
        assert isinstance(retrieved_docs, list)
        assert isinstance(sources, list)

    async def test_impact_score_in_range(self, sample_context):
        output, _, _ = await run_healthcare(sample_context)
        assert -100 <= output.impact_score <= 100


class TestDemographics:
    async def test_returns_expected_keys(self, sample_context):
        output, retrieved_docs, sources = await run_demographics(sample_context)
        assert isinstance(output, DemographicsOutput)
        assert output.analysis_text
        assert isinstance(output.impact_score, int)
        assert isinstance(retrieved_docs, list)
        assert isinstance(sources, list)

    async def test_impact_score_in_range(self, sample_context):
        output, _, _ = await run_demographics(sample_context)
        assert -100 <= output.impact_score <= 100


class TestCritic:
    async def test_returns_expected_keys(self):
        historian = HistorianOutput(
            analysis_text="Rome endured.",
            timeline_events=[TimelineEvent(year=476, event="Empire stands")],
        )
        economist = EconomistOutput(
            analysis_text="Trade expanded.",
            timeline_events=[],
            impact_score=80,
        )
        technology = TechnologyOutput(
            analysis_text="Tech advanced.",
            timeline_events=[],
            impact_score=70,
        )
        society = SocietyOutput(
            analysis_text="Society stable.",
            timeline_events=[],
            impact_score=60,
        )
        climate = ClimateOutput(
            analysis_text="Minor impact.",
            timeline_events=[],
            impact_score=-10,
        )
        political = PoliticalOutput(
            analysis_text="Governance unified.",
            timeline_events=[],
            impact_score=50,
        )
        energy = EnergyOutput(
            analysis_text="Grids modernized.",
            timeline_events=[],
            impact_score=40,
        )
        healthcare = HealthcareOutput(
            analysis_text="Sanitation improved.",
            timeline_events=[],
            impact_score=30,
        )
        demographics = DemographicsOutput(
            analysis_text="Migration stabilized.",
            timeline_events=[],
            impact_score=20,
        )
        output = await run_critic(
            historian,
            economist,
            technology,
            society,
            climate,
            political,
            energy,
            healthcare,
            demographics,
        )
        assert isinstance(output, CriticOutput)
        assert isinstance(output.confidence_score, int)
        assert output.confidence_explanation
        assert isinstance(output.risk_notes, list)

    async def test_confidence_score_range(self):
        historian = HistorianOutput(analysis_text="X", timeline_events=[])
        economist = EconomistOutput(analysis_text="X", timeline_events=[], impact_score=50)
        technology = TechnologyOutput(analysis_text="X", timeline_events=[], impact_score=50)
        society = SocietyOutput(analysis_text="X", timeline_events=[], impact_score=50)
        climate = ClimateOutput(analysis_text="X", timeline_events=[], impact_score=50)
        political = PoliticalOutput(analysis_text="X", timeline_events=[], impact_score=50)
        energy = EnergyOutput(analysis_text="X", timeline_events=[], impact_score=50)
        healthcare = HealthcareOutput(analysis_text="X", timeline_events=[], impact_score=50)
        demographics = DemographicsOutput(analysis_text="X", timeline_events=[], impact_score=50)
        output = await run_critic(
            historian,
            economist,
            technology,
            society,
            climate,
            political,
            energy,
            healthcare,
            demographics,
        )
        assert 0 <= output.confidence_score <= 100


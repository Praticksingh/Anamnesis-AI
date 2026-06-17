"""Unit tests for SQLAlchemy models."""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.database import Base
from app.models import AgentOutput, FinalReport, Scenario


@pytest.fixture
async def db_session():
    """Provide a fresh in-memory SQLite database session for each test."""
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:", echo=False
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session

    await engine.dispose()


class TestScenarioModel:
    async def test_create_scenario(self, db_session: AsyncSession):
        scenario = Scenario(
            raw_input="What if X?",
            status="pending",
        )
        db_session.add(scenario)
        await db_session.commit()
        await db_session.refresh(scenario)

        assert scenario.id is not None
        assert scenario.raw_input == "What if X?"
        assert scenario.status == "pending"
        assert scenario.created_at is not None

    async def test_update_status(self, db_session: AsyncSession):
        scenario = Scenario(raw_input="Test", status="pending")
        db_session.add(scenario)
        await db_session.commit()

        scenario.status = "running"
        await db_session.commit()
        await db_session.refresh(scenario)
        assert scenario.status == "running"


class TestAgentOutputModel:
    async def test_create_agent_output(self, db_session: AsyncSession):
        scenario = Scenario(raw_input="Test", status="done")
        db_session.add(scenario)
        await db_session.commit()

        agent_output = AgentOutput(
            scenario_id=scenario.id,
            agent_name="historian",
            analysis_text="Rome endured.",
            structured_data={
                "timeline_events": [{"year": 476, "event": "Empire stands"}],
                "impact_score": 85,
            },
        )
        db_session.add(agent_output)
        await db_session.commit()
        await db_session.refresh(agent_output)

        assert agent_output.id is not None
        assert agent_output.agent_name == "historian"
        assert agent_output.structured_data.get("impact_score") == 85
        assert len(agent_output.structured_data.get("timeline_events")) == 1


class TestFinalReportModel:
    async def test_create_final_report(self, db_session: AsyncSession):
        scenario = Scenario(raw_input="Test", status="done")
        db_session.add(scenario)
        await db_session.commit()

        report = FinalReport(
            scenario_id=scenario.id,
            scenario_summary="Test summary",
            alternate_timeline=[],
            impact_dashboard={"economy": 10, "technology": 20, "society": 30, "politics": 40, "climate": 50},
            confidence_score=80,
            confidence_explanation="Good",
            risk_notes=["Minor risk"],
            sources_consulted=["Wikipedia"],
            retrieved_documents=["Doc1"],
        )
        db_session.add(report)
        await db_session.commit()
        await db_session.refresh(report)

        assert report.id is not None
        assert report.confidence_score == 80
        assert report.scenario_id == scenario.id

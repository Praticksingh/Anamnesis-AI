import logging
from contextlib import asynccontextmanager

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.database import AsyncSessionLocal, create_tables, get_db
from app.models import AgentOutput, FinalReport, Scenario
from app.orchestrator import run_simulation_graph
from app.schemas import (
    FinalReportSchema,
    ScenarioCreateRequest,
    ScenarioCreateResponse,
    ScenarioStatusResponse,
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Skip Alembic, run automatic SQLAlchemy table creation on startup
    try:
        await create_tables()
        logger.info("Database tables created / verified")
    except (OSError, SQLAlchemyError):
        logger.warning("Database unavailable during startup; continuing without table verification")
    yield


app = FastAPI(lifespan=lifespan)


def _db_unavailable_exception() -> HTTPException:
    return HTTPException(
        status_code=503,
        detail="Database unavailable. Check DATABASE_URL and ensure PostgreSQL is running.",
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/scenarios", response_model=ScenarioCreateResponse, status_code=201)
async def create_scenario(
    request: ScenarioCreateRequest,
    background_tasks: BackgroundTasks,
    db=Depends(get_db),
) -> ScenarioCreateResponse:
    try:
        scenario = Scenario(raw_input=request.raw_input, status="pending")
        db.add(scenario)
        await db.commit()
        await db.refresh(scenario)
        background_tasks.add_task(run_simulation_background, scenario.id)
        return ScenarioCreateResponse(scenario_id=scenario.id)
    except HTTPException:
        raise
    except SQLAlchemyError:
        logger.exception("Database error while creating scenario")
        raise _db_unavailable_exception()
    except Exception:
        logger.exception("Unexpected error while creating scenario")
        raise _db_unavailable_exception()


async def run_simulation_background(scenario_id: str):
    async with AsyncSessionLocal() as db:
        try:
            scenario = await db.get(Scenario, scenario_id)
            if scenario is None:
                raise RuntimeError(f"Scenario {scenario_id} not found")

            scenario.status = "running"
            await db.commit()

            result = await run_simulation_graph(str(scenario_id), scenario.raw_input)
            if result.get("error") is not None:
                scenario.status = "error"
                scenario.error_message = result["error"]
                await db.commit()
                return

            # Save individual agent outputs to AgentOutput table
            agent_mappings = [
                ("historian_output", "historian"),
                ("economist_output", "economist"),
                ("technology_output", "technology"),
                ("society_output", "society"),
                ("climate_output", "climate"),
            ]
            for state_key, agent_name in agent_mappings:
                output_val = result.get(state_key)
                if output_val:
                    timeline_list = []
                    for ev in output_val.timeline_events:
                        timeline_list.append({"year": ev.year, "event": ev.event})
                    
                    s_data = {"timeline_events": timeline_list}
                    if hasattr(output_val, "impact_score"):
                        s_data["impact_score"] = output_val.impact_score

                    db.add(AgentOutput(
                        scenario_id=scenario.id,
                        agent_name=agent_name,
                        analysis_text=output_val.analysis_text,
                        structured_data=s_data,
                    ))

            final_report = result["final_report"].model_dump(exclude={"agent_outputs"})
            db.add(FinalReport(scenario_id=scenario.id, **final_report))
            scenario.status = "done"
            scenario.error_message = None
            await db.commit()
        except Exception as exc:
            logger.exception("Unexpected error while running scenario %s", scenario_id)
            try:
                scenario = await db.get(Scenario, scenario_id)
                if scenario is not None:
                    scenario.status = "error"
                    scenario.error_message = f"Unexpected error: {str(exc)}"
                    await db.commit()
            except Exception:
                logger.exception("Failed to persist error state for scenario %s", scenario_id)


@app.get("/api/scenarios/{scenario_id}/status", response_model=ScenarioStatusResponse)
async def get_scenario_status(
    scenario_id: str,
    db=Depends(get_db),
) -> ScenarioStatusResponse:
    try:
        scenario = await db.get(Scenario, scenario_id)
        if scenario is None:
            raise HTTPException(status_code=404, detail="Scenario not found")

        result = await db.execute(select(AgentOutput.agent_name).where(AgentOutput.scenario_id == scenario_id))
        completed_agents = [row[0] for row in result.all()]
        return ScenarioStatusResponse(
            status=scenario.status,
            completed_agents=completed_agents,
            error_message=scenario.error_message,
        )
    except HTTPException:
        raise
    except SQLAlchemyError:
        logger.exception("Database error while getting scenario status")
        raise _db_unavailable_exception()
    except Exception:
        logger.exception("Unexpected error while getting scenario status")
        raise _db_unavailable_exception()


@app.get("/api/scenarios/{scenario_id}/report", response_model=FinalReportSchema)
async def get_scenario_report(
    scenario_id: str,
    db=Depends(get_db),
) -> FinalReportSchema:
    try:
        scenario = await db.get(Scenario, scenario_id)
        if scenario is None:
            raise HTTPException(status_code=404, detail="Scenario not found")

        if scenario.status != "done":
            raise HTTPException(status_code=409, detail=f"Report not ready, current status: {scenario.status}")

        result = await db.execute(select(FinalReport).where(FinalReport.scenario_id == scenario_id))
        report = result.scalar_one_or_none()
        if report is None:
            raise HTTPException(status_code=500, detail="Final report is missing for a completed scenario")

        agent_result = await db.execute(
            select(AgentOutput).where(
                AgentOutput.scenario_id == scenario_id,
                AgentOutput.agent_name.in_(["historian", "economist", "technology", "society", "climate"]),
            )
        )
        agent_rows = {agent_output.agent_name: agent_output for agent_output in agent_result.scalars().all()}

        return FinalReportSchema.model_validate(
            {
                "scenario_summary": report.scenario_summary,
                "alternate_timeline": report.alternate_timeline,
                "agent_outputs": [
                    {
                        "agent_name": agent_name,
                        "analysis_text": agent_rows[agent_name].analysis_text,
                        "timeline_events": agent_rows[agent_name].structured_data.get("timeline_events"),
                        "impact_score": agent_rows[agent_name].structured_data.get("impact_score"),
                    }
                    for agent_name in ["historian", "economist", "technology", "society", "climate"]
                    if agent_name in agent_rows
                ],
                "impact_dashboard": report.impact_dashboard,
                "confidence_score": report.confidence_score,
                "confidence_explanation": report.confidence_explanation,
                "risk_notes": report.risk_notes,
                "sources_consulted": report.sources_consulted,
                "retrieved_documents": report.retrieved_documents,
            }
        )
    except HTTPException:
        raise
    except SQLAlchemyError:
        logger.exception("Database error while getting scenario report")
        raise _db_unavailable_exception()
    except Exception:
        logger.exception("Unexpected error while getting scenario report")
        raise _db_unavailable_exception()

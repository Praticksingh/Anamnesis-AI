import logging
from uuid import UUID

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.database import AsyncSessionLocal, get_db
from app.models import AgentOutput, FinalReport, Scenario
from app.orchestrator import run_simulation_graph
from app.schemas import (
    FinalReportSchema,
    ScenarioCreateRequest,
    ScenarioCreateResponse,
    ScenarioStatusResponse,
)

app = FastAPI()
logger = logging.getLogger(__name__)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
    scenario = Scenario(raw_input=request.raw_input, status="pending")
    db.add(scenario)
    await db.commit()
    await db.refresh(scenario)
    background_tasks.add_task(run_simulation_background, scenario.id)
    return ScenarioCreateResponse(scenario_id=scenario.id)


async def run_simulation_background(scenario_id: UUID):
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
    scenario_id: UUID,
    db=Depends(get_db),
) -> ScenarioStatusResponse:
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


@app.get("/api/scenarios/{scenario_id}/report", response_model=FinalReportSchema)
async def get_scenario_report(
    scenario_id: UUID,
    db=Depends(get_db),
) -> FinalReportSchema:
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
            AgentOutput.agent_name.in_(["historian", "economist", "technology", "society"]),
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
                for agent_name in ["historian", "economist", "technology", "society"]
                if agent_name in agent_rows
            ],
            "impact_dashboard": report.impact_dashboard,
            "confidence_score": report.confidence_score,
            "risk_notes": report.risk_notes,
        }
    )

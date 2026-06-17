import json
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import FinalReport, Scenario, AgentOutput
from app.llm_client import call_agent

logger = logging.getLogger(__name__)

QA_SYSTEM_PROMPT = """You are the Lead Counterfactual Researcher for Anamnesis-AI.
Your role is to answer user Q&A questions regarding a specific alternate-history simulation report.

You must answer the question based strictly on the provided simulation report context.
Be highly detailed, analytical, and write in a premium scholarly tone. Highlight causal factors and structural domain shifts.

You must output your response in valid JSON matching this schema:
{
  "answer": "A detailed, structured, clear explanation answering the user's question, including appropriate historical and alternate-timeline analysis.",
  "citations": ["Source document or agent claim that supports this answer"]
}
"""

QA_USER_TEMPLATE = """SIMULATION REPORT CONTEXT:
Scenario Title/Summary: {summary}
Confidence Score: {confidence_score}%
Calibration Score: {calibration_score}%
Uncertainty Score: {uncertainty_score}

ALTERNATE TIMELINE MILESTONES:
{timeline_events}

AGENT ANALYSIS BRIEFINGS:
{agent_analyses}

USER QUESTION: {question}

Respond with only the requested JSON object containing "answer" and "citations" fields.
"""

async def answer_scenario_question(db: AsyncSession, scenario_id: str, question: str) -> dict:
    """Load scenario report context and call the LLM to answer the user's question."""
    logger.info("exploration_qa │ scenario_id=%s question=%r", scenario_id, question)
    
    # Load Scenario
    scenario = await db.get(Scenario, scenario_id)
    if not scenario:
        raise ValueError(f"Scenario {scenario_id} not found")
        
    # Load FinalReport
    result = await db.execute(select(FinalReport).where(FinalReport.scenario_id == scenario_id))
    report = result.scalar_one_or_none()
    if not report:
        raise ValueError(f"Final report for scenario {scenario_id} not found")

    # Load Agent Outputs
    agent_result = await db.execute(
        select(AgentOutput).where(AgentOutput.scenario_id == scenario_id)
    )
    agent_outputs = agent_result.scalars().all()

    # Format timeline
    timeline_str = ""
    timeline_data = report.alternate_timeline or []
    for ev in timeline_data:
        year = ev.get("year") or ev.get("year")
        event = ev.get("event")
        source = ev.get("source_agent", "unknown")
        timeline_str += f"- [{year}] ({source}): {event}\n"

    # Format agent outputs
    agent_str = ""
    for out in agent_outputs:
        agent_str += f"=== {out.agent_name.upper()} AGENT ===\n{out.analysis_text}\n\n"

    # Format user prompt
    user_content = QA_USER_TEMPLATE.format(
        summary=report.scenario_summary,
        confidence_score=report.confidence_score,
        calibration_score=report.calibration_score or 100,
        uncertainty_score=report.uncertainty_score or 0.0,
        timeline_events=timeline_str or "No timeline events recorded.",
        agent_analyses=agent_str or "No domain briefings recorded.",
        question=question
    )

    try:
        response_dict = await call_agent(QA_SYSTEM_PROMPT, user_content)
        # Verify JSON properties exist
        if "answer" not in response_dict:
            response_dict = {
                "answer": str(response_dict.get("response") or "Unable to process Q&A query response."),
                "citations": response_dict.get("citations") or []
            }
        return response_dict
    except Exception as exc:
        logger.exception("exploration_qa │ failed to process Q&A")
        return {
            "answer": f"Error processing exploration query: {str(exc)}",
            "citations": []
        }

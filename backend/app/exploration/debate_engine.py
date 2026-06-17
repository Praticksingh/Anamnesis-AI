import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import FinalReport, Scenario, AgentOutput
from app.llm_client import call_agent

logger = logging.getLogger(__name__)

DEBATE_SYSTEM_TEMPLATE = """You are facilitating a structured research debate between two Anamnesis-AI domain agents: {agent_a} and {agent_b}.
The topic of the debate is: "{topic}".

You must construct a transcripts of 2 rounds of debate. 
Each agent must speak in character, reflecting their specific domain knowledge and analytical lens:
- {agent_a}: Focus on variables relevant to {agent_a} dynamics.
- {agent_b}: Focus on variables relevant to {agent_b} dynamics.

At the end, the Critic agent must synthesize a consensus, indicating which arguments are logically sound.

You must output your response in valid JSON matching this schema:
{{
  "rounds": [
    {{ "round_num": 1, "agent_name": "{agent_a}", "argument": "First round statement from {agent_a}." }},
    {{ "round_num": 1, "agent_name": "{agent_b}", "argument": "First round response from {agent_b}." }},
    {{ "round_num": 2, "agent_name": "{agent_a}", "argument": "Second round rebuttal from {agent_a}." }},
    {{ "round_num": 2, "agent_name": "{agent_b}", "argument": "Second round concluding summary from {agent_b}." }}
  ],
  "consensus": "A final synthesis by the Critic Agent detailing the consensus reached or unresolved contradictions."
}}
"""

DEBATE_USER_TEMPLATE = """SIMULATION REPORT CONTEXT:
Scenario Summary: {summary}

ALTERNATE TIMELINE MILESTONES:
{timeline_events}

AGENT ANALYSIS BRIEFINGS:
{agent_analyses}

Initiate the debate between {agent_a} and {agent_b} on the topic: "{topic}".
Respond with only the requested JSON object.
"""

async def run_agent_debate(
    db: AsyncSession, 
    scenario_id: str, 
    topic: str, 
    agent_a: str, 
    agent_b: str
) -> dict:
    """Simulate a structured research debate between two agent personas based on report context."""
    logger.info(
        "debate_engine │ scenario_id=%s topic=%r agents=%s vs %s", 
        scenario_id, topic, agent_a, agent_b
    )

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
    for ev in (report.alternate_timeline or []):
        year = ev.get("year")
        event = ev.get("event")
        timeline_str += f"- [{year}]: {event}\n"

    # Format agent outputs
    agent_str = ""
    for out in agent_outputs:
        agent_str += f"=== {out.agent_name.upper()} AGENT ===\n{out.analysis_text}\n\n"

    # Set up system prompt
    system_prompt = DEBATE_SYSTEM_TEMPLATE.format(
        agent_a=agent_a,
        agent_b=agent_b,
        topic=topic
    )

    # Set up user content
    user_content = DEBATE_USER_TEMPLATE.format(
        summary=report.scenario_summary,
        timeline_events=timeline_str or "No timeline events recorded.",
        agent_analyses=agent_str or "No briefings recorded.",
        agent_a=agent_a,
        agent_b=agent_b,
        topic=topic
    )

    try:
        response_dict = await call_agent(system_prompt, user_content)
        return response_dict
    except Exception as exc:
        logger.exception("debate_engine │ failed to execute debate")
        return {
            "rounds": [
                { "round_num": 1, "agent_name": agent_a, "argument": f"Error initiating debate: {str(exc)}" },
                { "round_num": 1, "agent_name": agent_b, "argument": "Could not compile counter-argument." }
            ],
            "consensus": "Debate aborted due to execution failure."
        }

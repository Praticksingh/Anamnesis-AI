import json
import logging
from pydantic import ValidationError
from app.llm_client import AgentResponseError, call_agent
from app.prompts import ASSUMPTION_EXTRACTION_PROMPT
from app.schemas import Assumption, AgentOutputSummary

logger = logging.getLogger(__name__)


async def run_assumption_extraction(agent_outputs: list[AgentOutputSummary]) -> list[Assumption]:
    """Extract explicit or implicit simulation assumptions from agent outputs."""
    if not agent_outputs:
        return []

    # Map inputs to simple JSON payload for assumption extraction
    payload = {
        output.agent_name: {
            "analysis_text": output.analysis_text,
            "timeline_events": [ev.model_dump() for ev in output.timeline_events] if output.timeline_events else []
        }
        for output in agent_outputs
        if output.analysis_text
    }

    if not payload:
        return []

    try:
        result = await call_agent(ASSUMPTION_EXTRACTION_PROMPT, json.dumps(payload))
        assumptions_data = result.get("assumptions", [])
        
        assumptions = []
        for item in assumptions_data:
            try:
                validated = Assumption.model_validate(item)
                # Normalize impact level to expected values
                if validated.impact_level.lower() in ("high", "medium", "low"):
                    validated.impact_level = validated.impact_level.lower()
                    assumptions.append(validated)
            except ValidationError as exc:
                logger.warning("Skipped invalid assumption entry %s: %s", item, exc)

        return assumptions
    except (AgentResponseError, Exception) as exc:
        logger.warning("Assumption extraction failed: %s. Returning empty assumptions list.", exc)
        return []

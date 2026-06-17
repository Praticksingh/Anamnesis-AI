import json
import logging
from pydantic import ValidationError
from app.llm_client import AgentResponseError, call_agent
from app.prompts import CAUSAL_MODELING_PROMPT
from app.schemas import CausalLink, UnifiedTimelineEvent

logger = logging.getLogger(__name__)


async def run_causal_modeling(events: list[UnifiedTimelineEvent]) -> list[CausalLink]:
    """Analyze timeline events and generate cause-effect links using LLM reasoning."""
    if not events:
        return []

    # Map events to simplified structures for the prompt payload
    payload = [
        {
            "id": ev.id,
            "year": ev.year,
            "event": ev.event,
            "source_agent": ev.source_agent
        }
        for ev in events
    ]

    try:
        result = await call_agent(CAUSAL_MODELING_PROMPT, json.dumps(payload))
        links_data = result.get("causal_links", [])
        
        causal_links = []
        event_ids = {ev.id for ev in events}

        for link in links_data:
            try:
                # Validate link fields
                validated = CausalLink.model_validate(link)
                # Filter out links pointing to non-existent events to ensure DAG integrity
                if validated.source in event_ids and validated.target in event_ids:
                    causal_links.append(validated)
            except ValidationError as exc:
                logger.warning("Skipped invalid causal link entry %s: %s", link, exc)

        return causal_links
    except (AgentResponseError, Exception) as exc:
        logger.warning("Causal graph generation failed: %s. Returning empty graph.", exc)
        return []

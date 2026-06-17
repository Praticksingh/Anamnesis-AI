import logging
from app.schemas import TimelineEvent, UnifiedTimelineEvent

logger = logging.getLogger(__name__)


def create_unified_timeline(agent_events: dict[str, list[TimelineEvent]]) -> list[UnifiedTimelineEvent]:
    """Combines timeline events from all agents, removes duplicates, and sorts chronologically."""
    seen_keys = set()
    unified = []
    
    # Priority order for deduplication tie-breaking and timeline sequencing
    agent_order = ["historian", "climate", "economist", "technology", "society", "political", "energy", "healthcare", "demographics"]
    
    for agent in agent_order:
        events = agent_events.get(agent, [])
        for ev in events:
            norm_event = ev.event.strip().lower()
            key = (ev.year, norm_event)
            if key not in seen_keys:
                seen_keys.add(key)
                unified.append(
                    UnifiedTimelineEvent(
                        year=ev.year,
                        event=ev.event.strip(),
                        source_agent=agent
                    )
                )

    # Sort chronologically by year, then by agent priority rank
    unified.sort(
        key=lambda x: (
            x.year, 
            agent_order.index(x.source_agent) if x.source_agent in agent_order else 99
        )
    )
    
    logger.info("Timeline Engine compiled %d events from %d agents", len(unified), len(agent_events))
    return unified

from sqlalchemy import select
from app.models import FinalReport, Scenario
from app.schemas import UnifiedTimelineEvent


async def create_branch_context(db, parent_scenario_id: str, divergent_event_id: str) -> tuple[int, list[dict], str]:
    """Retrieves the pre-divergence event list and target year to branch a new simulation from a parent scenario."""
    # Fetch final report of parent scenario
    result = await db.execute(select(FinalReport).where(FinalReport.scenario_id == parent_scenario_id))
    report = result.scalar_one_or_none()
    if not report:
        raise ValueError(f"Final report not found for parent scenario {parent_scenario_id}")

    # Fetch parent scenario
    parent_scenario = await db.get(Scenario, parent_scenario_id)
    if not parent_scenario:
        raise ValueError(f"Parent scenario {parent_scenario_id} not found")

    # Find the divergent event target
    target_event = None
    alternate_timeline = report.alternate_timeline or []
    for ev_data in alternate_timeline:
        ev = UnifiedTimelineEvent.model_validate(ev_data)
        if ev.id == divergent_event_id:
            target_event = ev
            break

    if not target_event:
        raise ValueError(f"Divergent event ID {divergent_event_id} not found in the parent timeline")

    # Filter pre-divergence events (strictly before the divergent event's year)
    pre_divergence_events = []
    for ev_data in alternate_timeline:
        ev = UnifiedTimelineEvent.model_validate(ev_data)
        if ev.year < target_event.year:
            pre_divergence_events.append(ev.model_dump())

    return target_event.year, pre_divergence_events, parent_scenario.raw_input

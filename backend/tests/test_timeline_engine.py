"""Unit tests for the timeline engine."""

from app.timeline_engine import create_unified_timeline
from app.schemas import TimelineEvent, UnifiedTimelineEvent


class TestCreateUnifiedTimeline:
    def test_empty_agents(self):
        result = create_unified_timeline({})
        assert result == []

    def test_single_agent(self):
        agent_events = {
            "historian": [
                TimelineEvent(year=1990, event="Divergence point"),
                TimelineEvent(year=2000, event="Later event"),
            ]
        }
        result = create_unified_timeline(agent_events)
        assert len(result) == 2
        assert result[0].year == 1990
        assert result[0].source_agent == "historian"
        assert result[0].event == "Divergence point"
        assert result[1].year == 2000
        assert result[1].source_agent == "historian"
        assert result[1].event == "Later event"

    def test_multiple_agents_sorted(self):
        agent_events = {
            "economist": [
                TimelineEvent(year=2000, event="Trade shift"),
            ],
            "historian": [
                TimelineEvent(year=1990, event="Divergence"),
            ],
        }
        result = create_unified_timeline(agent_events)
        assert len(result) == 2
        # Verify chronological sorting
        assert result[0].year == 1990
        assert result[1].year == 2000

    def test_deduplication(self):
        agent_events = {
            "historian": [
                TimelineEvent(year=1990, event="Same event"),
            ],
            "economist": [
                TimelineEvent(year=1990, event="Same event"),
            ],
        }
        result = create_unified_timeline(agent_events)
        # Expect deduplication by year+event (case-insensitive & stripped)
        assert len(result) == 1
        assert result[0].year == 1990
        assert result[0].event == "Same event"
        # Since historian has higher priority than economist in agent_order:
        # agent_order = ["historian", "climate", "economist", "technology", "society"]
        assert result[0].source_agent == "historian"

    def test_empty_timeline_events(self):
        agent_events = {
            "historian": [],
        }
        result = create_unified_timeline(agent_events)
        assert result == []

    def test_new_agents_sorted(self):
        agent_events = {
            "political": [
                TimelineEvent(year=2000, event="Political treaty"),
            ],
            "energy": [
                TimelineEvent(year=2000, event="Energy grid update"),
            ],
            "demographics": [
                TimelineEvent(year=1995, event="Population shift"),
            ],
        }
        result = create_unified_timeline(agent_events)
        assert len(result) == 3
        # Chronological sorting: 1995 first, then 2000 events
        assert result[0].year == 1995
        assert result[0].source_agent == "demographics"
        # For the same year (2000), sorting by agent_order (political is before energy)
        assert result[1].year == 2000
        assert result[1].source_agent == "political"
        assert result[2].year == 2000
        assert result[2].source_agent == "energy"


from typing import Literal
from uuid import UUID

from pydantic import BaseModel


class TimelineEvent(BaseModel):
	year: int
	event: str


class ImpactDashboard(BaseModel):
	economy: int
	technology: int
	society: int
	politics: int


class ScenarioContext(BaseModel):
	scenario: str
	divergence_year: int
	focus_domains: list[str]
	time_horizon: int


class HistorianOutput(BaseModel):
	agent_name: Literal["historian"] = "historian"
	analysis_text: str
	timeline_events: list[TimelineEvent]


class EconomistOutput(BaseModel):
	agent_name: Literal["economist"] = "economist"
	analysis_text: str
	timeline_events: list[TimelineEvent]
	impact_score: int


class TechnologyOutput(BaseModel):
	agent_name: Literal["technology"] = "technology"
	analysis_text: str
	timeline_events: list[TimelineEvent]
	impact_score: int


class SocietyOutput(BaseModel):
	agent_name: Literal["society"] = "society"
	analysis_text: str
	timeline_events: list[TimelineEvent]
	impact_score: int


class CriticOutput(BaseModel):
	confidence_score: int
	risk_notes: list[str]


class ScenarioCreateRequest(BaseModel):
	raw_input: str


class ScenarioCreateResponse(BaseModel):
	scenario_id: UUID


class ScenarioStatusResponse(BaseModel):
	status: Literal["pending", "running", "done", "error"]
	completed_agents: list[str]
	error_message: str | None = None


class AgentOutputSummary(BaseModel):
	agent_name: str
	analysis_text: str | None
	timeline_events: list[TimelineEvent] | None = None
	impact_score: int | None = None


class FinalReportSchema(BaseModel):
	scenario_summary: str
	alternate_timeline: list[TimelineEvent]
	agent_outputs: list[AgentOutputSummary]
	impact_dashboard: ImpactDashboard
	confidence_score: int
	risk_notes: list[str]

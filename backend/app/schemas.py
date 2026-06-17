from typing import Literal

from pydantic import BaseModel


class TimelineEvent(BaseModel):
	year: int
	event: str


class ImpactDashboard(BaseModel):
	economy: int
	technology: int
	society: int
	politics: int
	climate: int


class UnifiedTimelineEvent(BaseModel):
	id: str = ""
	year: int
	event: str
	source_agent: str
	parent_ids: list[str] = []


class CausalLink(BaseModel):
	source: str
	target: str
	description: str


class Assumption(BaseModel):
	agent_name: str
	assumption: str
	impact_level: str


class BranchRequest(BaseModel):
	divergent_event_id: str
	alternative_event: str


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


class ClimateOutput(BaseModel):
	agent_name: Literal["climate"] = "climate"
	analysis_text: str
	timeline_events: list[TimelineEvent]
	impact_score: int


class PoliticalOutput(BaseModel):
	agent_name: Literal["political"] = "political"
	analysis_text: str
	timeline_events: list[TimelineEvent]
	impact_score: int


class EnergyOutput(BaseModel):
	agent_name: Literal["energy"] = "energy"
	analysis_text: str
	timeline_events: list[TimelineEvent]
	impact_score: int


class HealthcareOutput(BaseModel):
	agent_name: Literal["healthcare"] = "healthcare"
	analysis_text: str
	timeline_events: list[TimelineEvent]
	impact_score: int


class DemographicsOutput(BaseModel):
	agent_name: Literal["demographics"] = "demographics"
	analysis_text: str
	timeline_events: list[TimelineEvent]
	impact_score: int


class AgentConfidence(BaseModel):
	agent_name: str
	confidence_score: int
	explanation: str


class GroundingValidation(BaseModel):
	agent_name: str
	grounding_score: int
	unsupported_claims: list[str]
	explanation: str


class CriticOutput(BaseModel):
	confidence_score: int
	confidence_explanation: str
	risk_notes: list[str]
	agent_confidences: list[AgentConfidence] = []


class ScenarioCreateRequest(BaseModel):
	raw_input: str


class ScenarioCreateResponse(BaseModel):
	scenario_id: str


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
	alternate_timeline: list[UnifiedTimelineEvent]
	agent_outputs: list[AgentOutputSummary]
	impact_dashboard: ImpactDashboard
	confidence_score: int
	confidence_explanation: str
	risk_notes: list[str]
	sources_consulted: list[str]
	retrieved_documents: list[str]
	causal_graph: list[CausalLink] = []
	assumptions: list[Assumption] = []
	agent_confidences: list[AgentConfidence] = []
	grounding_validations: list[GroundingValidation] = []
	uncertainty_score: float = 0.0
	calibration_score: int = 100


class AskRequest(BaseModel):
	question: str


class DebateRequest(BaseModel):
	topic: str
	agent_a: str
	agent_b: str


class AdjustRequest(BaseModel):
	adjustments: dict[str, int]



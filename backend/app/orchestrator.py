from __future__ import annotations

from statistics import mean
from typing import TypedDict

from pydantic import ValidationError
from typing_extensions import Required

from app.agents.critic import run_critic
from app.agents.economist import run_economist
from app.agents.historian import run_historian
from app.agents.society import run_society
from app.agents.technology import run_technology
from app.llm_client import AgentResponseError, call_agent
from app.prompts import CRITIC_PROMPT, ECONOMIST_PROMPT, HISTORIAN_PROMPT, ORCHESTRATOR_PARSE_PROMPT, SOCIETY_PROMPT, TECHNOLOGY_PROMPT
from app.schemas import (
	AgentOutputSummary,
	CriticOutput,
	EconomistOutput,
	FinalReportSchema,
	HistorianOutput,
	ImpactDashboard,
	ScenarioContext,
	SocietyOutput,
	TechnologyOutput,
)

from langgraph.constants import END, START
from langgraph.graph import StateGraph


class GraphState(TypedDict, total=False):
	scenario_id: Required[str]
	raw_input: Required[str]
	scenario_context: ScenarioContext | None
	historian_output: HistorianOutput | None
	economist_output: EconomistOutput | None
	technology_output: TechnologyOutput | None
	society_output: SocietyOutput | None
	critic_output: CriticOutput | None
	final_report: FinalReportSchema | None
	error: str | None


async def parse_scenario(state: GraphState) -> dict:
	try:
		result = await call_agent(ORCHESTRATOR_PARSE_PROMPT, state["raw_input"])
		context = ScenarioContext.model_validate(result)
		return {"scenario_context": context}
	except (AgentResponseError, ValidationError) as exc:
		return {"error": str(exc)}


async def historian_node(state: GraphState) -> dict:
	if state.get("error"):
		return {"error": state["error"]}

	try:
		result = await run_historian(state["scenario_context"])
		return {"historian_output": result}
	except AgentResponseError as exc:
		return {"error": f"historian failed: {str(exc)}"}


async def economist_node(state: GraphState) -> dict:
	if state.get("error"):
		return {"error": state["error"]}

	try:
		result = await run_economist(state["scenario_context"])
		return {"economist_output": result}
	except AgentResponseError as exc:
		return {"error": f"economist failed: {str(exc)}"}


async def technology_node(state: GraphState) -> dict:
	if state.get("error"):
		return {"error": state["error"]}

	try:
		result = await run_technology(state["scenario_context"])
		return {"technology_output": result}
	except AgentResponseError as exc:
		return {"error": f"technology failed: {str(exc)}"}


async def society_node(state: GraphState) -> dict:
	if state.get("error"):
		return {"error": state["error"]}

	try:
		result = await run_society(state["scenario_context"])
		return {"society_output": result}
	except AgentResponseError as exc:
		return {"error": f"society failed: {str(exc)}"}


async def critic_node(state: GraphState) -> dict:
	if state.get("error"):
		return {"error": state["error"]}

	if not all(
		[
			state.get("historian_output"),
			state.get("economist_output"),
			state.get("technology_output"),
			state.get("society_output"),
		]
	):
		return {"error": "critic skipped because one or more agent outputs are missing"}

	try:
		result = await run_critic(
			state["historian_output"],
			state["economist_output"],
			state["technology_output"],
			state["society_output"],
		)
		return {"critic_output": result}
	except AgentResponseError as exc:
		return {"error": f"critic failed: {str(exc)}"}


def merge_node(state: GraphState) -> dict:
	scenario_context = state["scenario_context"]
	historian_output = state["historian_output"]
	economist_output = state["economist_output"]
	technology_output = state["technology_output"]
	society_output = state["society_output"]
	critic_output = state["critic_output"]

	alternate_timeline = sorted(
		[
			*historian_output.timeline_events,
			*economist_output.timeline_events,
			*technology_output.timeline_events,
			*society_output.timeline_events,
		],
		key=lambda item: item.year,
	)

	impact_scores = [
		economist_output.impact_score,
		technology_output.impact_score,
		society_output.impact_score,
	]

	final_report = FinalReportSchema(
		scenario_summary=scenario_context.scenario,
		alternate_timeline=alternate_timeline,
		agent_outputs=[
			AgentOutputSummary(
				agent_name=historian_output.agent_name,
				analysis_text=historian_output.analysis_text,
				timeline_events=historian_output.timeline_events,
				impact_score=None,
			),
			AgentOutputSummary(
				agent_name=economist_output.agent_name,
				analysis_text=economist_output.analysis_text,
				timeline_events=economist_output.timeline_events,
				impact_score=economist_output.impact_score,
			),
			AgentOutputSummary(
				agent_name=technology_output.agent_name,
				analysis_text=technology_output.analysis_text,
				timeline_events=technology_output.timeline_events,
				impact_score=technology_output.impact_score,
			),
			AgentOutputSummary(
				agent_name=society_output.agent_name,
				analysis_text=society_output.analysis_text,
				timeline_events=society_output.timeline_events,
				impact_score=society_output.impact_score,
			),
		],
		impact_dashboard=ImpactDashboard(
			economy=economist_output.impact_score,
			technology=technology_output.impact_score,
			society=society_output.impact_score,
			politics=round(mean(impact_scores)),
		),
		confidence_score=critic_output.confidence_score,
		risk_notes=critic_output.risk_notes,
	)

	return {"final_report": final_report}


def _route_after_parse(state: GraphState) -> list[str] | str:
	if state.get("error"):
		return END
	return ["historian_node", "economist_node", "technology_node", "society_node"]


def _route_after_agents(state: GraphState) -> str:
	if state.get("error"):
		return END
	return "critic_node"


def _route_after_critic(state: GraphState) -> str:
	if state.get("error"):
		return END
	return "merge_node"


builder = StateGraph(GraphState)
builder.add_node("parse_scenario", parse_scenario)
builder.add_node("historian_node", historian_node)
builder.add_node("economist_node", economist_node)
builder.add_node("technology_node", technology_node)
builder.add_node("society_node", society_node)
builder.add_node("critic_node", critic_node)
builder.add_node("merge_node", merge_node)

builder.add_edge(START, "parse_scenario")
builder.add_conditional_edges("parse_scenario", _route_after_parse)
builder.add_edge(["historian_node", "economist_node", "technology_node", "society_node"], "critic_node")
builder.add_conditional_edges("historian_node", _route_after_agents)
builder.add_conditional_edges("economist_node", _route_after_agents)
builder.add_conditional_edges("technology_node", _route_after_agents)
builder.add_conditional_edges("society_node", _route_after_agents)
builder.add_conditional_edges("critic_node", _route_after_critic)
builder.add_edge("merge_node", END)

compiled_graph = builder.compile()


async def run_simulation_graph(scenario_id: str, raw_input: str) -> GraphState:
	initial_state: GraphState = {
		"scenario_id": scenario_id,
		"raw_input": raw_input,
		"scenario_context": None,
		"historian_output": None,
		"economist_output": None,
		"technology_output": None,
		"society_output": None,
		"critic_output": None,
		"final_report": None,
		"error": None,
	}
	return await compiled_graph.ainvoke(initial_state)

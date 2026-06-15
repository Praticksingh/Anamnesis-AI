from __future__ import annotations

from statistics import mean
from typing import Annotated, TypedDict
from operator import add

from pydantic import ValidationError
from typing_extensions import Required

from app.agents.critic import run_critic
from app.agents.economist import run_economist
from app.agents.historian import run_historian
from app.agents.society import run_society
from app.agents.technology import run_technology
from app.agents.climate import run_climate
from app.llm_client import AgentResponseError, call_agent
from app.prompts import ORCHESTRATOR_PARSE_PROMPT
from app.timeline_engine import create_unified_timeline
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
	ClimateOutput,
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
	climate_output: ClimateOutput | None
	critic_output: CriticOutput | None
	final_report: FinalReportSchema | None
	error: str | None
	# RAG lists accumulated via list concatenation (add reducer)
	retrieved_documents: Annotated[list[str], add]
	sources_consulted: Annotated[list[str], add]


async def parse_scenario(state: GraphState) -> dict:
	try:
		# First, obtain the structured scenario context via the existing LLM call
		result = await call_agent(ORCHESTRATOR_PARSE_PROMPT, state["raw_input"])
		context = ScenarioContext.model_validate(result)
		# THEN request a factual snippet from Microsoft Foundry IQ using the raw input
		from app.rag.foundry_iq import fetch_context
		foundry_snippet = await fetch_context(state["raw_input"])
		return {"scenario_context": context, "foundry_context": foundry_snippet}
	except (AgentResponseError, ValidationError) as exc:
		return {"error": str(exc)}


async def historian_node(state: GraphState) -> dict:
	if state.get("error"):
		return {"error": state["error"]}

	try:
		result, retrieved_docs, sources = await run_historian(state["scenario_context"])
		return {
			"historian_output": result,
			"retrieved_documents": retrieved_docs,
			"sources_consulted": sources
		}
	except AgentResponseError as exc:
		return {"error": f"historian failed: {str(exc)}"}


async def economist_node(state: GraphState) -> dict:
	if state.get("error"):
		return {"error": state["error"]}

	try:
		result, retrieved_docs, sources = await run_economist(state["scenario_context"])
		return {
			"economist_output": result,
			"retrieved_documents": retrieved_docs,
			"sources_consulted": sources
		}
	except AgentResponseError as exc:
		return {"error": f"economist failed: {str(exc)}"}


async def technology_node(state: GraphState) -> dict:
	if state.get("error"):
		return {"error": state["error"]}

	try:
		result, retrieved_docs, sources = await run_technology(state["scenario_context"])
		return {
			"technology_output": result,
			"retrieved_documents": retrieved_docs,
			"sources_consulted": sources
		}
	except AgentResponseError as exc:
		return {"error": f"technology failed: {str(exc)}"}


async def society_node(state: GraphState) -> dict:
	if state.get("error"):
		return {"error": state["error"]}

	try:
		result, retrieved_docs, sources = await run_society(state["scenario_context"])
		return {
			"society_output": result,
			"retrieved_documents": retrieved_docs,
			"sources_consulted": sources
		}
	except AgentResponseError as exc:
		return {"error": f"society failed: {str(exc)}"}


async def climate_node(state: GraphState) -> dict:
	if state.get("error"):
		return {"error": state["error"]}

	try:
		result, retrieved_docs, sources = await run_climate(state["scenario_context"])
		return {
			"climate_output": result,
			"retrieved_documents": retrieved_docs,
			"sources_consulted": sources
		}
	except AgentResponseError as exc:
		return {"error": f"climate failed: {str(exc)}"}


async def critic_node(state: GraphState) -> dict:
	if state.get("error"):
		return {"error": state["error"]}

	if not all(
		[
			state.get("historian_output"),
			state.get("economist_output"),
			state.get("technology_output"),
			state.get("society_output"),
			state.get("climate_output"),
		]
	):
		return {"error": "critic skipped because one or more agent outputs are missing"}

	try:
		result = await run_critic(
			state["historian_output"],
			state["economist_output"],
			state["technology_output"],
			state["society_output"],
			state["climate_output"],
		)
		return {"critic_output": result}
	except AgentResponseError as exc:
		return {"error": f"critic failed: {str(exc)}"}


def narrator_node(state: GraphState) -> dict:
	scenario_context = state["scenario_context"]
	historian_output = state["historian_output"]
	economist_output = state["economist_output"]
	technology_output = state["technology_output"]
	society_output = state["society_output"]
	climate_output = state["climate_output"]
	critic_output = state["critic_output"]

	# Unify timeline via timeline engine
	alternate_timeline = create_unified_timeline({
		"historian": historian_output.timeline_events,
		"economist": economist_output.timeline_events,
		"technology": technology_output.timeline_events,
		"society": society_output.timeline_events,
		"climate": climate_output.timeline_events,
	})

	# Calculate mean including climate impact
	impact_scores = [
		economist_output.impact_score,
		technology_output.impact_score,
		society_output.impact_score,
		climate_output.impact_score,
	]

	# Deduplicate and sort RAG references
	retrieved_documents = sorted(list(set(state.get("retrieved_documents", []))))
	sources_consulted = sorted(list(set(state.get("sources_consulted", []))))

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
			AgentOutputSummary(
				agent_name=climate_output.agent_name,
				analysis_text=climate_output.analysis_text,
				timeline_events=climate_output.timeline_events,
				impact_score=climate_output.impact_score,
			),
		],
		impact_dashboard=ImpactDashboard(
			economy=economist_output.impact_score,
			technology=technology_output.impact_score,
			society=society_output.impact_score,
			politics=round(mean(impact_scores)),
			climate=climate_output.impact_score,
		),
		confidence_score=critic_output.confidence_score,
		confidence_explanation=critic_output.confidence_explanation,
		risk_notes=critic_output.risk_notes,
		sources_consulted=sources_consulted,
		retrieved_documents=retrieved_documents,
	)

	return {"final_report": final_report}


def _route_after_parse(state: GraphState) -> list[str] | str:
	if state.get("error"):
		return END
	return ["historian_node", "economist_node", "technology_node", "society_node", "climate_node"]


def _route_after_critic(state: GraphState) -> str:
	if state.get("error"):
		return END
	return "narrator_node"


builder = StateGraph(GraphState)
builder.add_node("parse_scenario", parse_scenario)
builder.add_node("historian_node", historian_node)
builder.add_node("economist_node", economist_node)
builder.add_node("technology_node", technology_node)
builder.add_node("society_node", society_node)
builder.add_node("climate_node", climate_node)
builder.add_node("critic_node", critic_node)
builder.add_node("narrator_node", narrator_node)

builder.add_edge(START, "parse_scenario")
builder.add_conditional_edges("parse_scenario", _route_after_parse)

# Fan-in: all five agent nodes converge into critic_node
builder.add_edge(
	["historian_node", "economist_node", "technology_node", "society_node", "climate_node"], 
	"critic_node"
)

builder.add_conditional_edges("critic_node", _route_after_critic)
builder.add_edge("narrator_node", END)

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
		"climate_output": None,
		"critic_output": None,
		"final_report": None,
		"error": None,
		"retrieved_documents": [],
		"sources_consulted": [],
	}
	return await compiled_graph.ainvoke(initial_state)

from pydantic import ValidationError

from app.llm_client import AgentResponseError, call_agent
from app.prompts import ECONOMIST_PROMPT
from app.schemas import EconomistOutput, ScenarioContext, HistorianOutput, AgentOutputSummary, UnifiedTimelineEvent
from app.rag.retrieval_service import get_retrieval_service


async def run_economist(
	context: ScenarioContext,
	historian_output: HistorianOutput | None = None,
	other_agents_outputs: list[AgentOutputSummary] | None = None,
	feedback: str | None = None,
	pre_divergence_timeline: list[UnifiedTimelineEvent] | None = None,
) -> tuple[EconomistOutput, list[str], list[str]]:
	retrieval_svc = get_retrieval_service()
	rag_context, retrieved_docs, sources = await retrieval_svc.retrieve(context, "economy", n_results=2)
	
	user_content = f"{rag_context}\n\n{context.model_dump_json()}"
	if pre_divergence_timeline:
		user_content += "\n\nPRE-DIVERGENCE LOCKED HISTORICAL TIMELINE:\n"
		for ev in pre_divergence_timeline:
			user_content += f"- Year {ev.year}: {ev.event}\n"
	if historian_output:
		user_content += f"\n\nHISTORIAN BASELINE ALTERNATE TIMELINE CONTEXT:\n{historian_output.model_dump_json()}"
	if other_agents_outputs:
		user_content += "\n\nOTHER DOMAIN AGENTS' PREVIOUS OUTPUTS (for consistency):"
		for other in other_agents_outputs:
			user_content += f"\n- Agent {other.agent_name}: Impact {other.impact_score}, Analysis: {other.analysis_text}"
	if feedback:
		user_content += f"\n\nCRITIC FEEDBACK FROM PREVIOUS ATTEMPT:\n{feedback}\nPlease adjust your response to resolve the issues cited by the critic."
		
	result = await call_agent(ECONOMIST_PROMPT, user_content)
	try:
		output = EconomistOutput.model_validate({**result, "agent_name": "economist"})
	except ValidationError as exc:
		raise AgentResponseError(str(exc)) from exc
	output.impact_score = max(-100, min(100, output.impact_score))
	return output, retrieved_docs, sources
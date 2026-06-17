from pydantic import ValidationError

from app.llm_client import AgentResponseError, call_agent
from app.prompts import HISTORIAN_PROMPT
from app.schemas import HistorianOutput, ScenarioContext, UnifiedTimelineEvent
from app.rag.retrieval_service import get_retrieval_service


async def run_historian(
	context: ScenarioContext,
	feedback: str | None = None,
	pre_divergence_timeline: list[UnifiedTimelineEvent] | None = None,
) -> tuple[HistorianOutput, list[str], list[str]]:
	retrieval_svc = get_retrieval_service()
	rag_context, retrieved_docs, sources = await retrieval_svc.retrieve(context, "history", n_results=2)
	
	user_content = f"{rag_context}\n\n{context.model_dump_json()}"
	if pre_divergence_timeline:
		user_content += "\n\nPRE-DIVERGENCE LOCKED HISTORICAL TIMELINE:\n"
		for ev in pre_divergence_timeline:
			user_content += f"- Year {ev.year}: {ev.event}\n"
	if feedback:
		user_content += f"\n\nCRITIC FEEDBACK FROM PREVIOUS ATTEMPT:\n{feedback}\nPlease adjust your response to resolve the issues cited by the critic."
		
	result = await call_agent(HISTORIAN_PROMPT, user_content)
	try:
		output = HistorianOutput.model_validate({**result, "agent_name": "historian"})
		return output, retrieved_docs, sources
	except ValidationError as exc:
		raise AgentResponseError(str(exc)) from exc
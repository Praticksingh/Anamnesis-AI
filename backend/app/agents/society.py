from pydantic import ValidationError

from app.llm_client import AgentResponseError, call_agent
from app.prompts import SOCIETY_PROMPT
from app.schemas import ScenarioContext, SocietyOutput
from app.rag.retrieval_service import get_retrieval_service


async def run_society(context: ScenarioContext) -> tuple[SocietyOutput, list[str], list[str]]:
	query = f"{context.scenario} social cultural impact"
	retrieval_svc = get_retrieval_service()
	rag_context, retrieved_docs, sources = await retrieval_svc.retrieve(query, "society", n_results=2)
	
	user_content = f"{rag_context}\n\n{context.model_dump_json()}"
	result = await call_agent(SOCIETY_PROMPT, user_content)
	try:
		output = SocietyOutput.model_validate({**result, "agent_name": "society"})
	except ValidationError as exc:
		raise AgentResponseError(str(exc)) from exc
	output.impact_score = max(-100, min(100, output.impact_score))
	return output, retrieved_docs, sources
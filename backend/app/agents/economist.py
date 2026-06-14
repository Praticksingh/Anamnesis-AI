from pydantic import ValidationError

from app.llm_client import AgentResponseError, call_agent
from app.prompts import ECONOMIST_PROMPT
from app.schemas import EconomistOutput, ScenarioContext
from app.rag.retrieval_service import get_retrieval_service


async def run_economist(context: ScenarioContext) -> tuple[EconomistOutput, list[str], list[str]]:
	query = f"{context.scenario} economic impact GDP trade employment"
	retrieval_svc = get_retrieval_service()
	rag_context, retrieved_docs, sources = await retrieval_svc.retrieve(query, "economy", n_results=2)
	
	user_content = f"{rag_context}\n\n{context.model_dump_json()}"
	result = await call_agent(ECONOMIST_PROMPT, user_content)
	try:
		output = EconomistOutput.model_validate({**result, "agent_name": "economist"})
	except ValidationError as exc:
		raise AgentResponseError(str(exc)) from exc
	output.impact_score = max(-100, min(100, output.impact_score))
	return output, retrieved_docs, sources
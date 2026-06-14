from pydantic import ValidationError

from app.llm_client import AgentResponseError, call_agent
from app.prompts import TECHNOLOGY_PROMPT
from app.schemas import ScenarioContext, TechnologyOutput
from app.rag.retrieval_service import get_retrieval_service


async def run_technology(context: ScenarioContext) -> tuple[TechnologyOutput, list[str], list[str]]:
	query = f"{context.scenario} technology innovation disruption"
	retrieval_svc = get_retrieval_service()
	rag_context, retrieved_docs, sources = await retrieval_svc.retrieve(query, "technology", n_results=2)
	
	user_content = f"{rag_context}\n\n{context.model_dump_json()}"
	result = await call_agent(TECHNOLOGY_PROMPT, user_content)
	try:
		output = TechnologyOutput.model_validate({**result, "agent_name": "technology"})
	except ValidationError as exc:
		raise AgentResponseError(str(exc)) from exc
	output.impact_score = max(-100, min(100, output.impact_score))
	return output, retrieved_docs, sources
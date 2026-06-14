from pydantic import ValidationError

from app.llm_client import AgentResponseError, call_agent
from app.prompts import HISTORIAN_PROMPT
from app.schemas import HistorianOutput, ScenarioContext
from app.rag.retrieval_service import get_retrieval_service


async def run_historian(context: ScenarioContext) -> tuple[HistorianOutput, list[str], list[str]]:
	query = f"{context.scenario} historical context {context.divergence_year}"
	retrieval_svc = get_retrieval_service()
	rag_context, retrieved_docs, sources = await retrieval_svc.retrieve(query, "history", n_results=2)
	
	user_content = f"{rag_context}\n\n{context.model_dump_json()}"
	result = await call_agent(HISTORIAN_PROMPT, user_content)
	try:
		output = HistorianOutput.model_validate({**result, "agent_name": "historian"})
		return output, retrieved_docs, sources
	except ValidationError as exc:
		raise AgentResponseError(str(exc)) from exc
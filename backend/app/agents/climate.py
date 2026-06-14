from pydantic import ValidationError
from app.llm_client import AgentResponseError, call_agent
from app.prompts import CLIMATE_PROMPT
from app.schemas import ClimateOutput, ScenarioContext
from app.rag.retrieval_service import get_retrieval_service


async def run_climate(context: ScenarioContext) -> tuple[ClimateOutput, list[str], list[str]]:
    query = f"{context.scenario} climate environment carbon rainfall temperature biodiversity"
    retrieval_svc = get_retrieval_service()
    
    # Run Knowledge Retrieval
    rag_context, retrieved_docs, sources = await retrieval_svc.retrieve(
        query, "climate", n_results=2
    )
    
    # Inject retrieved context
    user_content = f"{rag_context}\n\n{context.model_dump_json()}"
    
    result = await call_agent(CLIMATE_PROMPT, user_content)
    try:
        output = ClimateOutput.model_validate({**result, "agent_name": "climate"})
        output.impact_score = max(-100, min(100, output.impact_score))
        return output, retrieved_docs, sources
    except ValidationError as exc:
        raise AgentResponseError(str(exc)) from exc

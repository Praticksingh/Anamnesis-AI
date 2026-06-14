from pydantic import ValidationError

from app.llm_client import AgentResponseError, call_agent
from app.prompts import TECHNOLOGY_PROMPT
from app.schemas import ScenarioContext, TechnologyOutput


async def run_technology(context: ScenarioContext) -> TechnologyOutput:
	result = await call_agent(TECHNOLOGY_PROMPT, context.model_dump_json())
	try:
		output = TechnologyOutput.model_validate({**result, "agent_name": "technology"})
	except ValidationError as exc:
		raise AgentResponseError(str(exc)) from exc
	output.impact_score = max(-100, min(100, output.impact_score))
	return output
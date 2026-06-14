from pydantic import ValidationError

from app.llm_client import AgentResponseError, call_agent
from app.prompts import SOCIETY_PROMPT
from app.schemas import ScenarioContext, SocietyOutput


async def run_society(context: ScenarioContext) -> SocietyOutput:
	result = await call_agent(SOCIETY_PROMPT, context.model_dump_json())
	try:
		output = SocietyOutput.model_validate({**result, "agent_name": "society"})
	except ValidationError as exc:
		raise AgentResponseError(str(exc)) from exc
	output.impact_score = max(-100, min(100, output.impact_score))
	return output
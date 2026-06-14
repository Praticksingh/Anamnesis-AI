from pydantic import ValidationError

from app.llm_client import AgentResponseError, call_agent
from app.prompts import ECONOMIST_PROMPT
from app.schemas import EconomistOutput, ScenarioContext


async def run_economist(context: ScenarioContext) -> EconomistOutput:
	result = await call_agent(ECONOMIST_PROMPT, context.model_dump_json())
	try:
		output = EconomistOutput.model_validate({**result, "agent_name": "economist"})
	except ValidationError as exc:
		raise AgentResponseError(str(exc)) from exc
	output.impact_score = max(-100, min(100, output.impact_score))
	return output
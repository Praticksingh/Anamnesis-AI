import json

from pydantic import ValidationError

from app.llm_client import AgentResponseError, call_agent
from app.prompts import CRITIC_PROMPT
from app.schemas import CriticOutput, EconomistOutput, HistorianOutput, SocietyOutput, TechnologyOutput


async def run_critic(
	historian: HistorianOutput,
	economist: EconomistOutput,
	technology: TechnologyOutput,
	society: SocietyOutput,
) -> CriticOutput:
	payload = {
		"historian": historian.model_dump(),
		"economist": economist.model_dump(),
		"technology": technology.model_dump(),
		"society": society.model_dump(),
	}
	result = await call_agent(CRITIC_PROMPT, json.dumps(payload))
	try:
		output = CriticOutput.model_validate(result)
	except ValidationError as exc:
		raise AgentResponseError(str(exc)) from exc
	output.confidence_score = max(0, min(100, output.confidence_score))
	return output
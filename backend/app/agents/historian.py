from pydantic import ValidationError

from app.llm_client import AgentResponseError, call_agent
from app.prompts import HISTORIAN_PROMPT
from app.schemas import HistorianOutput, ScenarioContext


async def run_historian(context: ScenarioContext) -> HistorianOutput:
	result = await call_agent(HISTORIAN_PROMPT, context.model_dump_json())
	try:
		return HistorianOutput.model_validate({**result, "agent_name": "historian"})
	except ValidationError as exc:
		raise AgentResponseError(str(exc)) from exc
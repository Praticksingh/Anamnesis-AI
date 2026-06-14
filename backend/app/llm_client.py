import json
import logging
import os

import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

logger = logging.getLogger(__name__)


class AgentResponseError(Exception):
	pass


def _extract_text(response: object) -> str:
	return response.content[0].text


def _parse_json(raw_text: str) -> dict:
	return json.loads(raw_text.strip())


async def call_agent(system_prompt: str, user_content: str) -> dict:
	prompt_id = system_prompt[:50]
	logger.info("request sent: %s", prompt_id)

	response = await client.messages.create(
		model="claude-sonnet-4-5",
		max_tokens=1024,
		system=system_prompt,
		messages=[{"role": "user", "content": user_content}],
	)
	logger.info("response received: %s", prompt_id)

	raw_text = _extract_text(response)

	try:
		return _parse_json(raw_text)
	except json.JSONDecodeError:
		logger.info("retry triggered: %s", prompt_id)

	retry_response = await client.messages.create(
		model="claude-sonnet-4-5",
		max_tokens=1024,
		system=system_prompt,
		messages=[
			{"role": "user", "content": user_content},
			{"role": "assistant", "content": raw_text},
			{
				"role": "user",
				"content": "Your previous response was not valid JSON. Respond with ONLY the JSON object, no markdown formatting, no explanation.",
			},
		],
	)
	logger.info("response received: %s", prompt_id)

	retry_raw_text = _extract_text(retry_response)

	try:
		return _parse_json(retry_raw_text)
	except json.JSONDecodeError as exc:
		truncated = retry_raw_text[:200]
		logger.info("final failure: %s", prompt_id)
		raise AgentResponseError(
			f"Failed to parse agent response as JSON after retry. Raw response: {truncated}"
		) from exc

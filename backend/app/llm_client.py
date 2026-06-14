"""llm_client.py — Anthropic Claude integration with mock fallback.

Behaviour
---------
* If ``ANTHROPIC_API_KEY`` is set (and not the placeholder ``your_key_here``),
  every ``call_agent()`` call goes to the real Anthropic API asynchronously.
* Otherwise the module falls back to deterministic mock responses so the full
  LangGraph pipeline can run end-to-end without credentials.

Configuration (all via environment / .env)
------------------------------------------
``ANTHROPIC_API_KEY``   – Anthropic secret key.  Leave unset / as placeholder
                          to use mock mode.
``ANTHROPIC_MODEL``     – Claude model ID (default: ``claude-sonnet-4-5``).
``ANTHROPIC_MAX_TOKENS``– Max tokens per response (default: ``1024``).
"""

import json
import logging
import os
import time

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# ── Configuration ──────────────────────────────────────────────────────────────

_api_key: str = os.environ.get("ANTHROPIC_API_KEY", "")
_model: str = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-5")
_max_tokens: int = int(os.environ.get("ANTHROPIC_MAX_TOKENS", "1024"))

# Mock mode: active when there is no real API key.
USE_MOCK: bool = not _api_key or _api_key == "your_key_here"

if not USE_MOCK:
    import anthropic as _anthropic_lib
    _client = _anthropic_lib.AsyncAnthropic(api_key=_api_key)
    logger.info(
        "LLM client │ mode=REAL  model=%s  max_tokens=%d",
        _model,
        _max_tokens,
    )
else:
    _client = None  # type: ignore[assignment]
    logger.info(
        "LLM client │ mode=MOCK  "
        "(set ANTHROPIC_API_KEY to switch to real Anthropic calls)"
    )


# ── Public exception ───────────────────────────────────────────────────────────

class AgentResponseError(Exception):
    """Raised when an agent call fails or returns unparseable JSON."""


# ── Internal helpers ───────────────────────────────────────────────────────────

def _extract_text(response: object) -> str:
    """Pull the text content out of an Anthropic ``Message`` object."""
    return response.content[0].text  # type: ignore[union-attr]


def _parse_json(raw: str) -> dict:
    """Strip whitespace/fences then parse JSON; raises ``json.JSONDecodeError``."""
    # Remove optional markdown code fences that models sometimes emit.
    text = raw.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        # Drop opening fence (e.g. ```json) and closing fence.
        text = "\n".join(lines[1:-1] if lines[-1].startswith("```") else lines[1:])
    return json.loads(text)


def _agent_label(system_prompt: str) -> str:
    """Derive a short agent name from the system prompt for log messages.

    NOTE: 'critic' is checked before 'historian' because ``CRITIC_PROMPT``
    contains the word 'historian' in its body — matching historian first would
    return the wrong mock dict.
    """
    p = system_prompt.lower()
    if "orchestrator" in p or "parse" in p:
        return "orchestrator"
    if "critic" in p:
        return "critic"
    if "climate" in p:
        return "climate"
    if "historian" in p:
        return "historian"
    if "economist" in p:
        return "economist"
    if "technology" in p:
        return "technology"
    if "society" in p:
        return "society"
    return "agent"


# ── Mock response bank ────────────────────────────────────────────────────────
# Deterministic data that mirrors the exact JSON shape each Pydantic schema
# expects.  Used when ``USE_MOCK=True``.

MOCK_RESPONSES: dict[str, dict] = {
    "orchestrator": {
        "scenario": (
            "A hypothetical divergence where the specified historical event unfolded "
            "differently, altering the trajectory of technology, economics, and society."
        ),
        "divergence_year": 1990,
        "focus_domains": ["economy", "technology", "society"],
        "time_horizon": 2025,
    },
    "historian": {
        "analysis_text": (
            "The divergence point represents a critical juncture in modern history. "
            "The original timeline saw rapid globalisation and digital transformation, "
            "but this alternate path would have fundamentally redirected institutional "
            "priorities and geopolitical alliances, cascading into decades of altered "
            "development."
        ),
        "timeline_events": [
            {"year": 1992, "event": "Early policy shifts redirect national R&D budgets toward alternative sectors."},
            {"year": 1998, "event": "A landmark international treaty reshapes trade corridors and diplomatic alliances."},
            {"year": 2005, "event": "A new cultural movement emerges, driven by the altered media and communication landscape."},
            {"year": 2015, "event": "Major urban centres adopt radically different infrastructure models."},
        ],
    },
    "economist": {
        "analysis_text": (
            "GDP growth patterns diverge significantly from the baseline by the late "
            "1990s.  Trade networks reorganise around new hubs, and employment shifts "
            "toward manufacturing and energy sectors rather than services.  Overall "
            "economic output is modestly lower but more equitably distributed across "
            "regions."
        ),
        "timeline_events": [
            {"year": 1995, "event": "A regional economic bloc forms, redirecting 30% of global trade flows."},
            {"year": 2003, "event": "Unemployment spikes temporarily as legacy industries contract before new sectors mature."},
            {"year": 2012, "event": "Median household income in developed nations surpasses the real-history baseline by 8%."},
        ],
        "impact_score": 18,
    },
    "technology": {
        "analysis_text": (
            "Without the same catalysts, the digital revolution proceeds more slowly "
            "but with greater emphasis on privacy-preserving and decentralised "
            "architectures.  Hardware innovation accelerates in materials science and "
            "biotech, partially compensating for slower software ecosystem growth."
        ),
        "timeline_events": [
            {"year": 1997, "event": "A government-funded open computing initiative replaces several proprietary platforms."},
            {"year": 2006, "event": "Breakthroughs in solid-state battery technology enable widespread off-grid energy adoption."},
            {"year": 2018, "event": "Decentralised communication networks reach 40% global penetration, surpassing centralised alternatives."},
        ],
        "impact_score": 25,
    },
    "society": {
        "analysis_text": (
            "Social connectivity evolves through community-based networks rather than "
            "global platforms, fostering stronger local institutions but slower "
            "cross-cultural exchange.  Education systems pivot toward vocational and "
            "applied sciences earlier, producing a more technically skilled but less "
            "globally-mobile workforce."
        ),
        "timeline_events": [
            {"year": 1994, "event": "Community media cooperatives replace several national broadcast networks."},
            {"year": 2002, "event": "A new educational framework emphasising civic engagement is adopted across 30 countries."},
            {"year": 2010, "event": "Urban migration patterns reverse as remote economic opportunities grow in smaller cities."},
        ],
        "impact_score": 12,
    },
    "climate": {
        "analysis_text": (
            "Carbon emission rates diverge from standard historical curves by the mid-1990s. "
            "Rainfall patterns shift, reducing drought occurrences in sub-Saharan regions, "
            "while global temperature rise is slowed by approximately 0.4°C by 2025. "
            "Biodiversity impact is heavily positive, with critical ecosystem restoration."
        ),
        "timeline_events": [
            {"year": 1993, "event": "Alternative carbon sequestration protocols are deployed globally."},
            {"year": 2004, "event": "Satellite data confirms stabilization of the ozone layer and microclimate regions."},
            {"year": 2017, "event": "Ecosystem recovery programs successfully double native species populations in targeted zones."},
        ],
        "impact_score": 35,
    },
    "critic": {
        "confidence_score": 75,
        "confidence_explanation": (
            "The alternate simulation timeline presents strong internal consistency. "
            "The environmental and technological trajectories align closely, showing "
            "coherent cause-and-effect transitions without major historical contradictions."
        ),
        "risk_notes": [
            "The historian's timeline assumes rapid policy shifts that may be unrealistically fast for democratic systems.",
            "The economist projects income gains without fully accounting for transition costs.",
            "Technology and society analyses are broadly consistent with each other.",
            "Overall plausibility is moderate — the scenario is internally coherent but optimistic.",
        ],
    },
}


def _get_mock_critic_response(user_content: str) -> dict:
    try:
        data = json.loads(user_content)
    except Exception:
        return MOCK_RESPONSES["critic"]

    confidence = 100
    risk_notes = []

    scores = {}
    for agent in ["economist", "technology", "society", "climate"]:
        if agent in data and "impact_score" in data[agent]:
            scores[agent] = data[agent]["impact_score"]

    for agent, score in scores.items():
        if abs(score) > 75:
            confidence -= 20
            risk_notes.append(
                f"Extreme projection: {agent.capitalize()} agent reports an extreme impact score of {score}."
            )
        elif abs(score) > 50:
            confidence -= 8
            risk_notes.append(
                f"High variance: {agent.capitalize()} agent reports a high impact score of {score}."
            )

    if scores:
        max_agent = max(scores, key=scores.get)
        min_agent = min(scores, key=scores.get)
        diff = scores[max_agent] - scores[min_agent]
        if diff > 100:
            confidence -= 35
            risk_notes.append(
                f"Severe contradiction: Major divergence between positive {max_agent} ({scores[max_agent]}) "
                f"and negative {min_agent} ({scores[min_agent]}) trajectories."
            )
        elif diff > 60:
            confidence -= 15
            risk_notes.append(
                f"Moderate contradiction: Divergent outputs between positive {max_agent} ({scores[max_agent]}) "
                f"and negative {min_agent} ({scores[min_agent]}) domains."
            )

    if not risk_notes:
        risk_notes.append("The simulation appears consistent across all domains.")
        confidence_explanation = (
            "High plausibility. The timeline milestones align closely across all domains "
            "with minimal contradictions or extreme projections."
        )
        confidence = 95
    else:
        confidence = max(15, min(95, confidence))
        if confidence >= 70:
            confidence_explanation = (
                f"Moderate plausibility (confidence: {confidence}%). The timeline is coherent "
                "overall, but contains high projections or moderate domain mismatch."
            )
        else:
            confidence_explanation = (
                f"Low plausibility (confidence: {confidence}%). Significant contradictions or "
                "unrealistic projections exist between agent forecasts."
            )

    return {
        "confidence_score": confidence,
        "confidence_explanation": confidence_explanation,
        "risk_notes": risk_notes[:4]
    }


def _get_mock_response(system_prompt: str, user_content: str = "") -> dict:
    """Return the mock response dict that matches the given system prompt."""
    label = _agent_label(system_prompt)
    if label == "critic" and user_content:
        return _get_mock_critic_response(user_content)
    return MOCK_RESPONSES.get(label, MOCK_RESPONSES["orchestrator"])


# ── Public API ─────────────────────────────────────────────────────────────────

async def call_agent(system_prompt: str, user_content: str) -> dict:
    """Send a structured prompt to Claude and return the parsed JSON response.

    Flow
    ----
    1. Identify the agent from the system prompt for logging.
    2. If ``USE_MOCK``, return the pre-built mock dict immediately.
    3. Otherwise POST to Anthropic asynchronously and attempt JSON parse.
    4. On ``JSONDecodeError``, send one follow-up turn asking for pure JSON.
    5. If the retry also fails, raise ``AgentResponseError``.

    All timing and outcomes are logged at INFO level; errors at ERROR level.
    """
    label = _agent_label(system_prompt)
    mode = "MOCK" if USE_MOCK else "REAL"

    logger.info("─" * 64)
    logger.info(
        "call_agent │ agent=%-12s mode=%s", label, mode
    )

    t0 = time.perf_counter()

    # ── Mock path ──────────────────────────────────────────────────────────────
    if USE_MOCK:
        result = _get_mock_response(system_prompt, user_content)
        elapsed = time.perf_counter() - t0
        logger.info(
            "call_agent │ agent=%-12s MOCK response ready  "
            "keys=%s  elapsed=%.4fs",
            label,
            list(result.keys()),
            elapsed,
        )
        return result

    # ── Real Anthropic path ────────────────────────────────────────────────────
    logger.info(
        "call_agent │ agent=%-12s → Anthropic  model=%s  max_tokens=%d",
        label, _model, _max_tokens,
    )

    # First attempt ────────────────────────────────────────────────────────────
    try:
        response = await _client.messages.create(
            model=_model,
            max_tokens=_max_tokens,
            system=system_prompt,
            messages=[{"role": "user", "content": user_content}],
        )
    except Exception as exc:
        elapsed = time.perf_counter() - t0
        logger.error(
            "call_agent │ agent=%-12s Anthropic request FAILED  "
            "elapsed=%.4fs  error=%s",
            label, elapsed, exc,
        )
        raise AgentResponseError(f"Anthropic API call failed: {exc}") from exc

    elapsed_api = time.perf_counter() - t0
    logger.info(
        "call_agent │ agent=%-12s response received  "
        "elapsed=%.4fs  stop_reason=%s  input_tokens=%d  output_tokens=%d",
        label,
        elapsed_api,
        response.stop_reason,
        response.usage.input_tokens,
        response.usage.output_tokens,
    )

    raw_text = _extract_text(response)

    try:
        result = _parse_json(raw_text)
        elapsed = time.perf_counter() - t0
        logger.info(
            "call_agent │ agent=%-12s JSON parsed OK  keys=%s  elapsed=%.4fs",
            label, list(result.keys()), elapsed,
        )
        return result
    except json.JSONDecodeError:
        logger.warning(
            "call_agent │ agent=%-12s JSON parse FAILED on first attempt "
            "— retrying with correction prompt.  "
            "Raw snippet: %.120r",
            label,
            raw_text,
        )

    # Retry: ask the model to return pure JSON ─────────────────────────────────
    logger.info(
        "call_agent │ agent=%-12s → Anthropic  RETRY (correction turn)",
        label,
    )
    t_retry = time.perf_counter()

    try:
        retry_response = await _client.messages.create(
            model=_model,
            max_tokens=_max_tokens,
            system=system_prompt,
            messages=[
                {"role": "user", "content": user_content},
                {"role": "assistant", "content": raw_text},
                {
                    "role": "user",
                    "content": (
                        "Your previous response was not valid JSON. "
                        "Respond with ONLY the JSON object — no markdown "
                        "code fences, no explanation, no preamble."
                    ),
                },
            ],
        )
    except Exception as exc:
        elapsed = time.perf_counter() - t_retry
        logger.error(
            "call_agent │ agent=%-12s retry Anthropic request FAILED  "
            "elapsed=%.4fs  error=%s",
            label, elapsed, exc,
        )
        raise AgentResponseError(
            f"Anthropic retry API call failed: {exc}"
        ) from exc

    elapsed_retry = time.perf_counter() - t_retry
    logger.info(
        "call_agent │ agent=%-12s retry response received  "
        "elapsed=%.4fs  input_tokens=%d  output_tokens=%d",
        label,
        elapsed_retry,
        retry_response.usage.input_tokens,
        retry_response.usage.output_tokens,
    )

    retry_raw = _extract_text(retry_response)

    try:
        result = _parse_json(retry_raw)
        elapsed_total = time.perf_counter() - t0
        logger.info(
            "call_agent │ agent=%-12s JSON parsed OK after retry  "
            "keys=%s  total_elapsed=%.4fs",
            label, list(result.keys()), elapsed_total,
        )
        return result
    except json.JSONDecodeError as exc:
        snippet = retry_raw[:200]
        elapsed_total = time.perf_counter() - t0
        logger.error(
            "call_agent │ agent=%-12s JSON parse FAILED after retry  "
            "total_elapsed=%.4fs  raw_snippet=%.200r",
            label, elapsed_total, snippet,
        )
        raise AgentResponseError(
            f"Failed to parse agent response as JSON after retry. "
            f"Raw response snippet: {snippet}"
        ) from exc

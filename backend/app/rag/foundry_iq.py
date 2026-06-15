import os
import logging
from typing import Optional

import httpx
from dotenv import load_dotenv

# Load env vars (already loaded elsewhere, safe here)
load_dotenv()

log = logging.getLogger(__name__)

FOUNDRY_IQ_ENDPOINT: str = os.getenv("FOUNDRY_IQ_ENDPOINT", "")
FOUNDRY_IQ_TOKEN: str = os.getenv("FOUNDRY_IQ_TOKEN", "")
FOUNDRY_IQ_MAX_TOKENS: int = int(os.getenv("FOUNDRY_IQ_MAX_TOKENS", "1500"))

if not FOUNDRY_IQ_ENDPOINT or not FOUNDRY_IQ_TOKEN:
    log.warning(
        "Foundry IQ credentials are missing – set FOUNDRY_IQ_ENDPOINT and FOUNDRY_IQ_TOKEN in .env. Calls will return an empty string."
    )

async def fetch_context(query: str, top: int = 1) -> str:
    """Send *query* to Foundry IQ and return a plain‑text snippet.

    Returns an empty string when credentials are missing or the request fails.
    """
    if not FOUNDRY_IQ_ENDPOINT or not FOUNDRY_IQ_TOKEN:
        return ""

    url = f"{FOUNDRY_IQ_ENDPOINT.rstrip('/')}/foundry/v1/query?api-version=2023-09-01-preview"
    headers = {
        "Authorization": f"Bearer {FOUNDRY_IQ_TOKEN}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    payload = {"query": query, "top": top, "maxTokens": FOUNDRY_IQ_MAX_TOKENS}
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            snippets = data.get("result", {}).get("snippets", [])
            if not snippets:
                return ""
            return " ".join(s.get("text", "") for s in snippets).strip()
        except httpx.HTTPError as exc:
            log.warning("Foundry IQ request failed for query %r – %s", query, str(exc))
            return ""

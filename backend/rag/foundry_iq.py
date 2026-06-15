# backend/rag/foundry_iq.py
"""
Foundry IQ client – thin async wrapper around the REST API.

The code follows the official Microsoft guide:
https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/foundry-iq-connect?tabs=foundry%2Cpython

NOTE:
* Do **not** commit any secrets. The variables below are empty strings on purpose.
* After you create a Foundry IQ workspace, paste the endpoint URL and the bearer token
  into your local ``backend/.env`` file (or your deployment secret store).

Required .env entries (add them manually):
    FOUNDRY_IQ_ENDPOINT=https://<your‑workspace>.foundry.azure.com
    FOUNDRY_IQ_TOKEN=eyJhbGciOi…
"""

import os
import logging
from typing import Optional

import httpx
from dotenv import load_dotenv

# ----------------------------------------------------------------------
# Load environment variables (the backend already calls load_dotenv elsewhere,
# but we do it here for safety if this module is imported in isolation)
# ----------------------------------------------------------------------
load_dotenv()

log = logging.getLogger(__name__)

# ----------------------------------------------------------------------
# Configuration – read from environment (empty strings by default)
# ----------------------------------------------------------------------
FOUNDRY_IQ_ENDPOINT: str = os.getenv("FOUNDRY_IQ_ENDPOINT", "")
FOUNDRY_IQ_TOKEN: str = os.getenv("FOUNDRY_IQ_TOKEN", "")
# Optional limit – keep it low while you are on a free tier
FOUNDRY_IQ_MAX_TOKENS: int = int(os.getenv("FOUNDRY_IQ_MAX_TOKENS", "1500"))

if not FOUNDRY_IQ_ENDPOINT or not FOUNDRY_IQ_TOKEN:
    # The module can still be imported (so the app starts) but any call will raise.
    log.warning(
        "Foundry IQ credentials are missing – set FOUNDRY_IQ_ENDPOINT and "
        "FOUNDRY_IQ_TOKEN in .env. Calls will return an empty string."
    )


# ----------------------------------------------------------------------
# Public async helper
# ----------------------------------------------------------------------
async def fetch_context(query: str, top: int = 1) -> str:
    """
    Sends *query* to Foundry IQ and returns a plain‑text snippet.

    Parameters
    ----------
    query: str
        The user‑level question (e.g. "impact of free public transport").
    top: int, optional
        Number of top results to request – usually 1 is enough.

    Returns
    -------
    str
        Grounded excerpt (or an empty string on failure / missing credentials).
    """
    if not FOUNDRY_IQ_ENDPOINT or not FOUNDRY_IQ_TOKEN:
        # No credentials – graceful degradation
        return ""

    # Build the request URL exactly as shown in the Microsoft doc
    url = f"{FOUNDRY_IQ_ENDPOINT.rstrip('/')}/foundry/v1/query?api-version=2023-09-01-preview"

    headers = {
        "Authorization": f"Bearer {FOUNDRY_IQ_TOKEN}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    payload = {
        "query": query,
        "top": top,
        "maxTokens": FOUNDRY_IQ_MAX_TOKENS,
    }

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
            log.warning(
                "Foundry IQ request failed for query %r – %s", query, str(exc)
            )
            return ""

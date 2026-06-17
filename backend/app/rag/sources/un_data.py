"""un_data.py — UN Data API connector with fallback SDG indicators and HDI mocks."""

import logging
import httpx
from app.rag.document_loader import Document
from app.rag.cache import rag_cache

logger = logging.getLogger(__name__)

MOCK_UN_DATA = {
    "hdi": [
        "The UN Human Development Index (HDI) measures long-term progress in three dimensions: health, knowledge, and standard of living. In 1990, the global HDI was 0.598, rising to 0.737 by 2020.",
        "Alternate reality simulations tracking high investment in local media cooperatives suggest localized education metrics improved literacy by 15%."
    ],
    "sdg": [
        "Sustainable Development Goal 7 (SDG 7) targets clean and affordable energy. In 2015, over 800 million people lived without electricity, dropping to 600 million by 2023.",
        "SDG 13 focuses on Climate Action. Planetary-scale carbon taxes deployed in 1950 stabilized SDG 13 progress indicators earlier."
    ],
    "development": [
        "The UN Development Programme (UNDP) reports that industrialization shifts in the 20th century successfully lowered extreme poverty, but increased atmospheric aerosol densities.",
        "Geopolitical re-alignment in regional trade blocs diverted UN development assistance, shifting priorities to infrastructure."
    ]
}

class UNDataConnector:
    @staticmethod
    @rag_cache("un_data")
    async def fetch(query: str) -> list[Document]:
        """Fetch development data from UN Open Data API or return context-aware mock results."""
        logger.info("RAG UNData │ Fetching data for query: %s", query)
        q = query.lower()
        
        category = "development"
        if "hdi" in q or "human development" in q:
            category = "hdi"
        elif "sdg" in q or "sustainable" in q:
            category = "sdg"

        # Try to query a public UN stats or open data endpoint if available
        # The UN Statistics Division SDG API is public: https://unstats.un.org/SDGAPI/v1/sdg/Goal/List
        url = "https://unstats.un.org/SDGAPI/v1/sdg/Goal/List?compact=true"
        
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    goals = resp.json()
                    if isinstance(goals, list) and len(goals) > 0:
                        docs = []
                        # Take first 3 goals and construct documents
                        for goal in goals[:3]:
                            code = goal.get("code", "Goal")
                            title = goal.get("title", "SDG Goal")
                            desc = goal.get("description", "")
                            
                            content_str = f"UN SDG Goal {code} — {title}: {desc}"
                            docs.append(Document(
                                id=f"un-sdg-{code}",
                                content=content_str,
                                metadata={"title": f"UN SDG: Goal {code}", "source": "UN Data", "url": url}
                            ))
                        if docs:
                            logger.info("RAG UNData │ Successfully retrieved %d live SDG goals", len(docs))
                            return docs
        except Exception as e:
            logger.warning("RAG UNData │ Live UN SDG API query failed: %s. Using default mock datasets.", e)

        # Fallback Mock Documents
        mocks = MOCK_UN_DATA[category]
        docs = []
        for idx, text in enumerate(mocks):
            docs.append(Document(
                id=f"un-mock-{category}-{idx}",
                content=text,
                metadata={"title": f"UN: {category.capitalize()} Indicator Estimate", "source": "UN Data", "url": "https://unstats.un.org"}
            ))
        logger.info("RAG UNData │ Returning %d grounded mock records", len(docs))
        return docs

import asyncio
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# Try importing wikipedia/arxiv with fallbacks
try:
    import wikipedia
    HAS_WIKI = True
    if wikipedia is not None:
        wikipedia.set_user_agent("AnamnesisAI/1.0 (contact@example.com)")
except ImportError:
    wikipedia = None
    HAS_WIKI = False
    logger.warning("wikipedia package not installed. WikipediaLoader will be inactive.")

try:
    import arxiv
    HAS_ARXIV = True
except ImportError:
    arxiv = None
    HAS_ARXIV = False
    logger.warning("arxiv package not installed. ResearchPaperLoader will be inactive.")


from app.rag.cache import rag_cache


@dataclass
class Document:
    id: str
    content: str
    metadata: dict


class WikipediaLoader:
    @staticmethod
    @rag_cache("wikipedia")
    async def load(query: str, max_articles: int = 2) -> list[Document]:
        if not HAS_WIKI or wikipedia is None:
            return []

        def _fetch():
            docs = []
            try:
                # Truncate search queries to prevent Wikipedia query parser failures
                search_results = wikipedia.search(query[:80], results=max_articles)
                for title in search_results:
                    try:
                        page = wikipedia.page(title, auto_suggest=False)
                        docs.append(Document(
                            id=f"wiki-{page.pageid}",
                            content=page.summary,
                            metadata={"title": page.title, "source": "Wikipedia", "url": page.url}
                        ))
                    except Exception as e:
                        logger.warning("Failed to fetch wiki page '%s': %s", title, e)
            except Exception as e:
                logger.warning("Wikipedia search failed for query '%s': %s", query, e)
            return docs

        return await asyncio.to_thread(_fetch)


class ResearchPaperLoader:
    @staticmethod
    @rag_cache("arxiv")
    async def load(query: str, max_papers: int = 2) -> list[Document]:
        if not HAS_ARXIV or arxiv is None:
            return []

        def _fetch():
            docs = []
            try:
                client = arxiv.Client()
                search = arxiv.Search(
                    query=query[:80],
                    max_results=max_papers,
                    sort_by=arxiv.SortCriterion.Relevance
                )
                for result in client.results(search):
                    docs.append(Document(
                        id=f"arxiv-{result.get_short_id()}",
                        content=result.summary,
                        metadata={"title": result.title, "source": "arXiv", "url": result.pdf_url}
                    ))
            except Exception as e:
                logger.warning("arXiv search failed for query '%s': %s", query, e)
            return docs

        return await asyncio.to_thread(_fetch)


class HistoricalDatasetLoader:
    DATASET = [
        Document(
            id="hist-industrial-rev",
            content="The Industrial Revolution (1760-1840) introduced mechanized manufacturing, steam power, and factories, transforming agrarian societies into industrial economies.",
            metadata={"title": "The Industrial Revolution", "source": "Historical Datasets", "period": "1760-1840"}
        ),
        Document(
            id="hist-great-depression",
            content="The Great Depression (1929-1939) was the worst economic downturn in industrialized history, triggered by the stock market crash and leading to global unemployment and deflation.",
            metadata={"title": "The Great Depression", "source": "Historical Datasets", "period": "1929-1939"}
        ),
        Document(
            id="hist-ww2",
            content="World War II (1939-1945) was a global conflict that spurred rapid industrial mobilization, technological innovations (radar, nuclear fission, computing), and reshaped geopolitical alliances.",
            metadata={"title": "World War II", "source": "Historical Datasets", "period": "1939-1945"}
        ),
        Document(
            id="hist-cold-war",
            content="The Cold War (1947-1991) was a period of geopolitical tension between the US and the USSR, driving space exploration, global proxy conflicts, and digital computing development.",
            metadata={"title": "The Cold War", "source": "Historical Datasets", "period": "1947-1991"}
        ),
        Document(
            id="hist-internet-age",
            content="The Internet Age (1990s-present) was enabled by the World Wide Web, creating global digital connectivity, accelerating globalization, and creating information economies.",
            metadata={"title": "The Internet Age", "source": "Historical Datasets", "period": "1990-present"}
        ),
        Document(
            id="hist-greenhouse-effect",
            content="Scientific consensus on global warming developed through the late 20th century, leading to treaties like the Kyoto Protocol (1997) to address carbon emissions and rainfall shifts.",
            metadata={"title": "Climate Science & Kyoto Protocol", "source": "Historical Datasets", "period": "1990s-present"}
        ),
        Document(
            id="hist-roman-empire",
            content="The Roman Empire at its peak (117 AD) maintained complex trade networks, concrete architecture, and military infrastructure, but collapsed due to economic instability, inflation, external invasions, and fragmented governance.",
            metadata={"title": "Roman Empire Rise and Fall", "source": "Historical Datasets", "period": "27 BC - 476 AD"}
        ),
        Document(
            id="hist-sahara-greening",
            content="Hydrological modeling indicates that during the African Humid Period (9000-5000 BC), orbital changes increased monsoon precipitation, turning the Sahara into a savanna with deep lakes and grasslands.",
            metadata={"title": "Saharan Paleoclimate & Grasslands", "source": "Historical Datasets", "period": "Ancient History"}
        ),
        Document(
            id="hist-ev-development",
            content="The 1990 California Zero Emission Vehicle (ZEV) mandate required major manufacturers to offer electric cars, prompting GM to build the EV1. However, early battery tech (lead-acid and NiMH) limited range to under 100 miles before lithium-ion emerged.",
            metadata={"title": "Early Electric Vehicles & ZEV Mandate", "source": "Historical Datasets", "period": "1990-1999"}
        ),
        Document(
            id="hist-space-race-mars",
            content="The Apollo program (1961-1972) landed astronauts on the Moon. Both NASA and Soviet planners drafted early conceptual proposals for manned Mars flybys and landers using nuclear thermal propulsion (NERVA) in the late 1970s and 1980s.",
            metadata={"title": "Apollo Program & Manned Mars Concepts", "source": "Historical Datasets", "period": "1960-1989"}
        ),
        Document(
            id="hist-gold-standard",
            content="The gold standard linked currencies directly to gold value, limiting inflation but constraining money supply growth. In the 20th century, countries transitioned to fiat systems to allow countercyclical monetary policy.",
            metadata={"title": "Monetary Standards & Fiat Transition", "source": "Historical Datasets", "period": "1870-1971"}
        ),
        Document(
            id="hist-labor-automation",
            content="Historical transitions (like mechanizing agriculture) displaced millions of manual laborers but created massive industrial and service employment. Modern automation models debate if AI displacements will exceed new job creation rates.",
            metadata={"title": "Labor Transitions & Industrial Automation", "source": "Historical Datasets", "period": "1800s-present"}
        )
    ]

    @staticmethod
    def load_all() -> list[Document]:
        return HistoricalDatasetLoader.DATASET

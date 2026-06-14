import asyncio
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# Try importing wikipedia/arxiv with fallbacks
try:
    import wikipedia
    HAS_WIKI = True
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


@dataclass
class Document:
    id: str
    content: str
    metadata: dict


class WikipediaLoader:
    @staticmethod
    async def load(query: str, max_articles: int = 2) -> list[Document]:
        if not HAS_WIKI or wikipedia is None:
            return []

        def _fetch():
            docs = []
            try:
                search_results = wikipedia.search(query, results=max_articles)
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
    async def load(query: str, max_papers: int = 2) -> list[Document]:
        if not HAS_ARXIV or arxiv is None:
            return []

        def _fetch():
            docs = []
            try:
                search = arxiv.Search(
                    query=query,
                    max_results=max_papers,
                    sort_by=arxiv.SortCriterion.Relevance
                )
                for result in search.results():
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
        )
    ]

    @staticmethod
    def load_all() -> list[Document]:
        return HistoricalDatasetLoader.DATASET

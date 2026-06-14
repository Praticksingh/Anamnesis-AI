import logging
from app.rag.document_loader import WikipediaLoader, ResearchPaperLoader, HistoricalDatasetLoader
from app.rag.embedding_service import get_embedding_service

logger = logging.getLogger(__name__)

_retrieval_service = None


def get_retrieval_service():
    global _retrieval_service
    if _retrieval_service is None:
        _retrieval_service = RetrievalService()
    return _retrieval_service


class RetrievalService:
    def __init__(self):
        self.embedding_service = get_embedding_service()
        # Seed historical dataset initially
        try:
            self.embedding_service.add_documents(HistoricalDatasetLoader.load_all())
        except Exception as e:
            logger.error("Failed to seed Historical Dataset: %s", e)

    async def retrieve(self, query: str, domain: str, n_results: int = 3) -> tuple[str, list[str], list[str]]:
        """
        Retrieves relevant documents.
        Returns:
            - formatted_context_string (str)
            - retrieved_documents (list[str])
            - sources_consulted (list[str])
        """
        fetched_docs = []
        sources = ["Historical Datasets"]
        
        try:
            wiki_docs = await WikipediaLoader.load(query, max_articles=2)
            if wiki_docs:
                fetched_docs.extend(wiki_docs)
                sources.append("Wikipedia")
        except Exception as e:
            logger.warning("Failed loading Wikipedia docs for RAG: %s", e)

        try:
            arxiv_docs = await ResearchPaperLoader.load(query, max_papers=2)
            if arxiv_docs:
                fetched_docs.extend(arxiv_docs)
                sources.append("arXiv")
        except Exception as e:
            logger.warning("Failed loading arXiv docs for RAG: %s", e)

        # Index any newly fetched docs
        if fetched_docs:
            try:
                self.embedding_service.add_documents(fetched_docs)
            except Exception as e:
                logger.error("Failed to index dynamic RAG documents: %s", e)

        # Search for top matches
        hits = []
        try:
            hits = self.embedding_service.query_similar(query, n_results=n_results)
        except Exception as e:
            logger.error("Failed querying embedding service: %s", e)

        # Format retrieved reference block
        retrieved_titles = []
        context_lines = [
            "━━━ RETRIEVED REFERENCE MATERIAL ━━━",
            "Relevant documents retrieved from Wikipedia, research papers, and historical datasets:",
            ""
        ]
        
        for idx, hit in enumerate(hits, 1):
            title = hit["metadata"].get("title", "Untitled Document")
            source = hit["metadata"].get("source", "Unknown Source")
            retrieved_titles.append(f"{source} — \"{title}\"")
            context_lines.append(f"[{idx}] {source} — \"{title}\"")
            context_lines.append(hit["content"])
            context_lines.append("")
            
        context_lines.append("━━━ END RETRIEVED MATERIAL ━━━")
        context_str = "\n".join(context_lines)
        
        return context_str, retrieved_titles, list(set(sources))

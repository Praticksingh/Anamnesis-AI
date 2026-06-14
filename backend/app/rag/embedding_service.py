import os
import logging
from app.rag.document_loader import Document

logger = logging.getLogger(__name__)

try:
    import chromadb
    HAS_CHROMA = True
except ImportError:
    chromadb = None
    HAS_CHROMA = False
    logger.warning("chromadb package not installed. EmbeddingService will run in memory mock mode.")

_client = None
_collection = None


def get_embedding_service():
    global _client, _collection
    if HAS_CHROMA and chromadb is not None:
        if _client is None:
            try:
                db_path = os.path.join(
                    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                    "chroma_db"
                )
                _client = chromadb.PersistentClient(path=db_path)
                _collection = _client.get_or_create_collection(
                    name="rag_documents", 
                    metadata={"hnsw:space": "cosine"}
                )
            except Exception as e:
                logger.error("Failed to initialize ChromaDB: %s", e)
                return MockEmbeddingService()
        return EmbeddingService()
    else:
        return MockEmbeddingService()


class EmbeddingService:
    def add_documents(self, docs: list[Document]):
        global _collection
        if not docs or _collection is None:
            return
        
        ids = [doc.id for doc in docs]
        documents = [doc.content for doc in docs]
        metadatas = [doc.metadata for doc in docs]
        
        try:
            _collection.upsert(
                ids=ids,
                documents=documents,
                metadatas=metadatas
            )
        except Exception as e:
            logger.error("Failed to upsert documents in ChromaDB: %s", e)

    def query_similar(self, query: str, n_results: int = 3) -> list[dict]:
        global _collection
        if _collection is None:
            return []

        try:
            results = _collection.query(
                query_texts=[query],
                n_results=n_results
            )
            hits = []
            if results and results.get("documents") and results["documents"][0]:
                documents = results["documents"][0]
                metadatas = results["metadatas"][0]
                ids = results["ids"][0]
                distances = (
                    results["distances"][0] 
                    if "distances" in results and results["distances"] 
                    else [0.0] * len(ids)
                )
                for i in range(len(ids)):
                    hits.append({
                        "id": ids[i],
                        "content": documents[i],
                        "metadata": metadatas[i],
                        "distance": distances[i]
                    })
            return hits
        except Exception as e:
            logger.error("Failed to query ChromaDB: %s", e)
            return []


class MockEmbeddingService:
    """Fallback in-memory mock service when ChromaDB is unavailable."""
    def __init__(self):
        self.documents = {}

    def add_documents(self, docs: list[Document]):
        for doc in docs:
            self.documents[doc.id] = doc

    def query_similar(self, query: str, n_results: int = 3) -> list[dict]:
        # Simple sub-string matching search fallback
        hits = []
        words = query.lower().split()
        for doc_id, doc in self.documents.items():
            match_score = sum(1 for w in words if w in doc.content.lower())
            if match_score > 0:
                hits.append((match_score, doc))
        
        # Sort by match score descending
        hits.sort(key=lambda x: x[0], reverse=True)
        
        results = []
        for _, doc in hits[:n_results]:
            results.append({
                "id": doc.id,
                "content": doc.content,
                "metadata": doc.metadata,
                "distance": 0.0
            })
        
        # If no dynamic hits found, return the first few default documents
        if not results:
            for doc in list(self.documents.values())[:n_results]:
                results.append({
                    "id": doc.id,
                    "content": doc.content,
                    "metadata": doc.metadata,
                    "distance": 0.0
                })
        return results

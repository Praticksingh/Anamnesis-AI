"""Integration tests for the Knowledge Retrieval (RAG) pipeline."""

import pytest
from app.schemas import ScenarioContext
from app.rag.document_loader import Document
from app.rag.query_decomposer import decompose_query
from app.rag.chunker import chunk_document, chunk_documents
from app.rag.reranker import rerank_hits, calculate_term_overlap_score
from app.rag.cache import rag_cache, get_cached_val
from app.rag.retrieval_service import get_retrieval_service

@pytest.fixture
def sample_context():
    return ScenarioContext(
        scenario="What if the Roman Empire never fell?",
        divergence_year=476,
        focus_domains=["history", "economy", "climate"],
        time_horizon=600
    )

@pytest.mark.asyncio
async def test_query_decomposer(sample_context):
    queries = await decompose_query(sample_context)
    assert isinstance(queries, dict)
    for k in ["wikipedia", "worldbank", "un_data", "nasa", "noaa", "arxiv"]:
        assert k in queries
        assert isinstance(queries[k], str)
        assert len(queries[k]) > 0

def test_document_chunker():
    text = "Line one of text. " * 50
    doc = Document(id="test-doc", content=text, metadata={"title": "Test Title"})
    chunks = chunk_document(doc, chunk_size=100, chunk_overlap=20)
    assert len(chunks) > 1
    for chunk in chunks:
        assert len(chunk.content) <= 100
        assert chunk.metadata["parent_id"] == "test-doc"
        assert "chunk_index" in chunk.metadata

def test_reranker():
    query = "Roman concrete aqueduct technology"
    hits = [
        {"content": "Irrelevant text about modern finance in New York.", "metadata": {"title": "Finance"}, "distance": 0.1},
        {"content": "Ancient Roman concrete engineering utilized volcanic ash and aqueducts.", "metadata": {"title": "Roman Concrete"}, "distance": 0.8}
    ]
    # Reranking should put Roman Concrete at top despite modern finance having lower vector distance
    top_hits = rerank_hits(query, hits, top_k=1)
    assert len(top_hits) == 1
    assert top_hits[0]["metadata"]["title"] == "Roman Concrete"

@pytest.mark.asyncio
async def test_caching_decorator():
    call_count = 0
    
    @rag_cache("test_cache")
    async def fetch_data(param: str):
        nonlocal call_count
        call_count += 1
        return {"data": param, "calls": call_count}
        
    res1 = await fetch_data("hello")
    res2 = await fetch_data("hello")
    assert res1["calls"] == 1
    assert res2["calls"] == 1  # Bypassed since it's cached
    
    res3 = await fetch_data("world")
    assert res3["calls"] == 2

@pytest.mark.asyncio
async def test_retrieval_service_orchestration(sample_context):
    retrieval_svc = get_retrieval_service()
    context_str, titles, sources = await retrieval_svc.retrieve(sample_context, "economy", n_results=2)
    assert isinstance(context_str, str)
    assert "━━━ RETRIEVED REFERENCE MATERIAL ━━━" in context_str
    assert isinstance(titles, list)
    assert len(titles) <= 2
    assert isinstance(sources, list)
    assert len(sources) > 0

"""reranker.py — Lightweight text re-ranker based on term frequency and matching overlaps."""

import logging
import re

logger = logging.getLogger(__name__)

def _tokenize(text: str) -> set[str]:
    """Tokenize and clean text into lower-case keywords."""
    return set(re.findall(r"\b\w{3,15}\b", text.lower()))

def calculate_term_overlap_score(query: str, document_text: str) -> float:
    """Calculate Jaccard term overlap and simple term frequency weighting."""
    query_tokens = _tokenize(query)
    doc_tokens = _tokenize(document_text)
    
    if not query_tokens:
        return 0.0
        
    overlap = query_tokens.intersection(doc_tokens)
    
    # Calculate simple frequency matches
    freq_matches = 0
    doc_lower = document_text.lower()
    for token in overlap:
        # Count frequency of token in doc
        freq_matches += doc_lower.count(token)
        
    # Jaccard overlap score (0.0 to 1.0)
    union_len = len(query_tokens.union(doc_tokens))
    jaccard = len(overlap) / union_len if union_len > 0 else 0
    
    # Combined score
    score = (len(overlap) * 2.0) + (freq_matches * 0.1) + (jaccard * 5.0)
    return score

def rerank_hits(query: str, hits: list[dict], top_k: int = 3) -> list[dict]:
    """Re-rank vector store query hits based on keyword relevance and vector distance."""
    if not hits:
        return []
        
    reranked = []
    for hit in hits:
        content = hit.get("content", "")
        # Compute term score
        term_score = calculate_term_overlap_score(query, content)
        
        # Combine term score with vector distance
        # ChromaDB distance is L2/cosine distance (smaller is better).
        # We convert distance to a similarity score: similarity = 1 / (1 + distance)
        distance = hit.get("distance", 1.0)
        vector_similarity = 1.0 / (1.0 + distance)
        
        # Combined score: term relevance + vector similarity
        combined_score = term_score + (vector_similarity * 10.0)
        
        hit_copy = hit.copy()
        hit_copy["relevance_score"] = combined_score
        reranked.append(hit_copy)
        
    # Sort hits descending by relevance_score
    reranked.sort(key=lambda x: x["relevance_score"], reverse=True)
    
    logger.info("RAG Reranker │ Re-ranked %d candidates down to top %d", len(hits), min(top_k, len(hits)))
    return reranked[:top_k]

"""chunker.py — Simple overlapping sliding window text chunker."""

import logging
from app.rag.document_loader import Document

logger = logging.getLogger(__name__)

def chunk_document(doc: Document, chunk_size: int = 800, chunk_overlap: int = 150) -> list[Document]:
    """Split a single Document into smaller overlapping Document chunks."""
    content = doc.content.strip()
    if len(content) <= chunk_size:
        return [doc]

    chunks = []
    start = 0
    chunk_index = 0
    
    while start < len(content):
        end = start + chunk_size
        # Try to find a natural boundary (e.g., newline or space) if we are not at the end
        if end < len(content):
            # Scan backwards up to 100 characters for a newline or period or space
            limit = max(start, end - 100)
            boundary = -1
            for separator in ("\n", ". ", " "):
                pos = content.rfind(separator, limit, end)
                if pos != -1:
                    boundary = pos + len(separator)
                    break
            
            if boundary != -1:
                end = boundary

        chunk_text = content[start:end].strip()
        if chunk_text:
            chunk_metadata = doc.metadata.copy()
            chunk_metadata["parent_id"] = doc.id
            chunk_metadata["chunk_index"] = chunk_index
            
            chunks.append(Document(
                id=f"{doc.id}-chunk-{chunk_index}",
                content=chunk_text,
                metadata=chunk_metadata
            ))
            chunk_index += 1
            
        start = end - chunk_overlap
        if start >= len(content) or (end >= len(content)):
            break
            
    logger.debug("RAG Chunker │ Split doc %s into %d chunks", doc.id, len(chunks))
    return chunks

def chunk_documents(docs: list[Document], chunk_size: int = 800, chunk_overlap: int = 150) -> list[Document]:
    """Split a list of Documents into smaller overlapping Document chunks."""
    all_chunks = []
    for doc in docs:
        all_chunks.extend(chunk_document(doc, chunk_size, chunk_overlap))
    logger.info("RAG Chunker │ Chunked %d documents into %d total chunks", len(docs), len(all_chunks))
    return all_chunks

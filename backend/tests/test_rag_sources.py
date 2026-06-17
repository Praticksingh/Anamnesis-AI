"""Unit tests for RAG connectors (World Bank, UN, NASA, NOAA)."""

import pytest
from app.rag.document_loader import Document
from app.rag.sources.worldbank import WorldBankConnector
from app.rag.sources.un_data import UNDataConnector
from app.rag.sources.nasa import NASAConnector
from app.rag.sources.noaa import NOAAConnector

@pytest.mark.asyncio
async def test_worldbank_connector():
    docs = await WorldBankConnector.fetch("test query about gdp")
    assert isinstance(docs, list)
    assert len(docs) > 0
    for doc in docs:
        assert isinstance(doc, Document)
        assert doc.id.startswith("wb-")
        assert doc.content
        assert "World Bank" in doc.metadata.get("source", "")

@pytest.mark.asyncio
async def test_un_data_connector():
    docs = await UNDataConnector.fetch("test query about sdgs")
    assert isinstance(docs, list)
    assert len(docs) > 0
    for doc in docs:
        assert isinstance(doc, Document)
        assert doc.id.startswith("un-")
        assert doc.content
        assert "UN Data" in doc.metadata.get("source", "")

@pytest.mark.asyncio
async def test_nasa_connector():
    docs = await NASAConnector.fetch("solar flares and space research")
    assert isinstance(docs, list)
    assert len(docs) > 0
    for doc in docs:
        assert isinstance(doc, Document)
        assert doc.id.startswith("nasa-")
        assert doc.content
        assert "NASA" in doc.metadata.get("source", "")

@pytest.mark.asyncio
async def test_noaa_connector():
    docs = await NOAAConnector.fetch("precipitation rainfall trends")
    assert isinstance(docs, list)
    assert len(docs) > 0
    for doc in docs:
        assert isinstance(doc, Document)
        assert doc.id.startswith("noaa-")
        assert doc.content
        assert "NOAA" in doc.metadata.get("source", "")

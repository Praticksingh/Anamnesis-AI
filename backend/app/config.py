"""Centralized configuration for Anamnesis-AI backend.

All settings are loaded from environment variables with sensible defaults.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the backend directory regardless of where uvicorn is launched.
_backend_root = Path(__file__).resolve().parents[1]
load_dotenv(_backend_root / ".env")
load_dotenv()


# ── Paths ─────────────────────────────────────────────────────────────────────

BACKEND_ROOT: Path = _backend_root


# ── Database ──────────────────────────────────────────────────────────────────

DATABASE_URL: str = os.getenv(
    "DATABASE_URL", "sqlite+aiosqlite:///./anamnesis.db"
)

DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "5"))
DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "10"))
DB_CONNECT_TIMEOUT: int = int(os.getenv("DB_CONNECT_TIMEOUT", "5"))


# ── LLM Providers ────────────────────────────────────────────────────────────

GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
ANTHROPIC_MODEL: str = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-latest")
ANTHROPIC_MAX_TOKENS: int = int(os.getenv("ANTHROPIC_MAX_TOKENS", "1024"))


# ── CORS ──────────────────────────────────────────────────────────────────────

CORS_ORIGINS: list[str] = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:3000,http://localhost:3001"
    ).split(",")
    if origin.strip()
]


# ── Application ───────────────────────────────────────────────────────────────

APP_ENV: str = os.getenv("APP_ENV", "development")
LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO").upper()
LOG_FORMAT: str = os.getenv("LOG_FORMAT", "json")  # "json" or "text"

MAX_INPUT_LENGTH: int = int(os.getenv("MAX_INPUT_LENGTH", "2000"))
MAX_CONCURRENT_SIMULATIONS: int = int(os.getenv("MAX_CONCURRENT_SIMULATIONS", "10"))

# Critic loop controls
CRITIC_CONFIDENCE_THRESHOLD: int = int(os.getenv("CRITIC_CONFIDENCE_THRESHOLD", "75"))
CRITIC_MAX_ITERATIONS: int = int(os.getenv("CRITIC_MAX_ITERATIONS", "2"))


# ── ChromaDB ──────────────────────────────────────────────────────────────────

CHROMA_DB_PATH: str = os.getenv(
    "CHROMA_DB_PATH",
    str(_backend_root / "chroma_db"),
)

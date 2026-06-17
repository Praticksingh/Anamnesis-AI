import logging

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import DATABASE_URL, DB_CONNECT_TIMEOUT, DB_MAX_OVERFLOW, DB_POOL_SIZE

logger = logging.getLogger(__name__)

# ── Engine configuration ──────────────────────────────────────────────────────

engine_kwargs: dict = {}
if DATABASE_URL.startswith("postgresql+asyncpg"):
    engine_kwargs["connect_args"] = {"timeout": DB_CONNECT_TIMEOUT}
    engine_kwargs["pool_size"] = DB_POOL_SIZE
    engine_kwargs["max_overflow"] = DB_MAX_OVERFLOW

engine = create_async_engine(DATABASE_URL, echo=False, **engine_kwargs)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def create_tables():
    """Create all tables in the database (for local dev, replaces Alembic migrations)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def db_health_check() -> bool:
    """Return *True* if the database is reachable, *False* otherwise."""
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        logger.warning("Database health check failed: %s", exc)
        return False

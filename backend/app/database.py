import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

# Load backend/.env regardless of where uvicorn is launched from.
backend_root = Path(__file__).resolve().parents[1]
load_dotenv(backend_root / ".env")
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
	raise RuntimeError("DATABASE_URL is not set")

engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
	pass


async def get_db():
	async with AsyncSessionLocal() as session:
		yield session

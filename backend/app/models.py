import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Scenario(Base):
	__tablename__ = "scenario"

	id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
	raw_input: Mapped[str] = mapped_column(Text, nullable=False)
	divergence_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
	focus_domains: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
	time_horizon: Mapped[int | None] = mapped_column(Integer, nullable=True)
	status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
	error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
	created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AgentOutput(Base):
	__tablename__ = "agent_output"

	id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
	scenario_id: Mapped[str] = mapped_column(String(36), ForeignKey("scenario.id"), nullable=False)
	agent_name: Mapped[str] = mapped_column(String(50), nullable=False)
	analysis_text: Mapped[str | None] = mapped_column(Text, nullable=True)
	structured_data: Mapped[dict] = mapped_column(JSON, nullable=False)
	created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class FinalReport(Base):
	__tablename__ = "final_report"

	id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
	scenario_id: Mapped[str] = mapped_column(String(36), ForeignKey("scenario.id"), unique=True, nullable=False)
	scenario_summary: Mapped[str] = mapped_column(Text, nullable=False)
	alternate_timeline: Mapped[list[dict]] = mapped_column(JSON, nullable=False)
	impact_dashboard: Mapped[dict] = mapped_column(JSON, nullable=False)
	confidence_score: Mapped[int] = mapped_column(Integer, nullable=False)
	confidence_explanation: Mapped[str] = mapped_column(Text, nullable=False, default="")
	risk_notes: Mapped[list[str]] = mapped_column(JSON, nullable=False)
	sources_consulted: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
	retrieved_documents: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
	created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

"""initial schema

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-06-14 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "scenario",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("raw_input", sa.Text(), nullable=False),
        sa.Column("divergence_year", sa.Integer(), nullable=True),
        sa.Column("focus_domains", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column("time_horizon", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default=sa.text("'pending'")),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
    )
    op.create_table(
        "agent_output",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("scenario_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("scenario.id"), nullable=False),
        sa.Column("agent_name", sa.String(length=50), nullable=False),
        sa.Column("analysis_text", sa.Text(), nullable=True),
        sa.Column("structured_data", postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
    )
    op.create_table(
        "final_report",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("scenario_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("scenario.id"), nullable=False),
        sa.Column("scenario_summary", sa.Text(), nullable=False),
        sa.Column("alternate_timeline", postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column("impact_dashboard", postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column("confidence_score", sa.Integer(), nullable=False),
        sa.Column("risk_notes", postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.UniqueConstraint("scenario_id"),
    )


def downgrade() -> None:
    op.drop_table("final_report")
    op.drop_table("agent_output")
    op.drop_table("scenario")
"""psychological test results

Revision ID: 20260608_0003
Revises: 20260607_0002
Create Date: 2026-06-08 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260608_0003"
down_revision: Union[str, None] = "20260607_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "psychological_test_results",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("candidate_application_id", sa.Integer(), nullable=True),
        sa.Column("test_slug", sa.String(length=120), nullable=False),
        sa.Column("test_title", sa.String(length=255), nullable=False),
        sa.Column("total_questions", sa.Integer(), nullable=False),
        sa.Column("answered_questions", sa.Integer(), nullable=False),
        sa.Column("duration_seconds", sa.Integer(), nullable=False),
        sa.Column("remaining_seconds", sa.Integer(), nullable=False),
        sa.Column("sections", sa.JSON(), nullable=False),
        sa.Column("answers", sa.JSON(), nullable=False),
        sa.Column("submitted_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["candidate_application_id"], ["candidate_applications.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_psychological_test_results_candidate_application_id"), "psychological_test_results", ["candidate_application_id"], unique=False)
    op.create_index(op.f("ix_psychological_test_results_submitted_at"), "psychological_test_results", ["submitted_at"], unique=False)
    op.create_index(op.f("ix_psychological_test_results_test_slug"), "psychological_test_results", ["test_slug"], unique=False)
    op.create_index(op.f("ix_psychological_test_results_user_id"), "psychological_test_results", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_psychological_test_results_user_id"), table_name="psychological_test_results")
    op.drop_index(op.f("ix_psychological_test_results_test_slug"), table_name="psychological_test_results")
    op.drop_index(op.f("ix_psychological_test_results_submitted_at"), table_name="psychological_test_results")
    op.drop_index(op.f("ix_psychological_test_results_candidate_application_id"), table_name="psychological_test_results")
    op.drop_table("psychological_test_results")

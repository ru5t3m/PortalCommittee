"""psychological test progress

Revision ID: 20260616_0005
Revises: 20260614_0004
Create Date: 2026-06-16 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260616_0005"
down_revision: Union[str, None] = "20260614_0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "psychological_test_progress",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("test_slug", sa.String(length=120), nullable=False),
        sa.Column("test_title", sa.String(length=255), nullable=False),
        sa.Column("total_questions", sa.Integer(), nullable=False),
        sa.Column("answered_questions", sa.Integer(), nullable=False),
        sa.Column("current_section_index", sa.Integer(), nullable=False),
        sa.Column("sections", sa.JSON(), nullable=False),
        sa.Column("answers", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "test_slug", name="uq_psychological_test_progress_user_slug"),
    )
    op.create_index(op.f("ix_psychological_test_progress_test_slug"), "psychological_test_progress", ["test_slug"], unique=False)
    op.create_index(op.f("ix_psychological_test_progress_user_id"), "psychological_test_progress", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_psychological_test_progress_user_id"), table_name="psychological_test_progress")
    op.drop_index(op.f("ix_psychological_test_progress_test_slug"), table_name="psychological_test_progress")
    op.drop_table("psychological_test_progress")

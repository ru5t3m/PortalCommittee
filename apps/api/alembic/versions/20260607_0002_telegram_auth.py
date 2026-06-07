"""telegram phone auth

Revision ID: 20260607_0002
Revises: 20260523_0001
Create Date: 2026-06-07 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260607_0002"
down_revision: Union[str, None] = "20260523_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.alter_column("email", existing_type=sa.String(length=255), nullable=True)
        batch_op.alter_column("hashed_password", existing_type=sa.String(length=255), nullable=True)
        batch_op.add_column(sa.Column("telegram_id", sa.String(length=40), nullable=True))
        batch_op.add_column(sa.Column("telegram_username", sa.String(length=120), nullable=True))
        batch_op.add_column(sa.Column("phone", sa.String(length=60), nullable=True))
        batch_op.add_column(sa.Column("phone_verified", sa.Boolean(), nullable=False, server_default=sa.false()))

    op.create_index(op.f("ix_users_telegram_id"), "users", ["telegram_id"], unique=True)
    op.create_index(op.f("ix_users_phone"), "users", ["phone"], unique=False)

    op.create_table(
        "telegram_login_challenges",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nonce", sa.String(length=128), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("telegram_id", sa.String(length=40), nullable=True),
        sa.Column("telegram_username", sa.String(length=120), nullable=True),
        sa.Column("first_name", sa.String(length=120), nullable=True),
        sa.Column("last_name", sa.String(length=120), nullable=True),
        sa.Column("phone", sa.String(length=60), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("consumed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("attempt_count", sa.Integer(), nullable=False),
        sa.Column("created_ip", sa.String(length=80), nullable=True),
        sa.Column("user_agent", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_telegram_login_challenges_expires_at"), "telegram_login_challenges", ["expires_at"], unique=False)
    op.create_index(op.f("ix_telegram_login_challenges_nonce"), "telegram_login_challenges", ["nonce"], unique=True)
    op.create_index(op.f("ix_telegram_login_challenges_status"), "telegram_login_challenges", ["status"], unique=False)
    op.create_index(op.f("ix_telegram_login_challenges_telegram_id"), "telegram_login_challenges", ["telegram_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_telegram_login_challenges_telegram_id"), table_name="telegram_login_challenges")
    op.drop_index(op.f("ix_telegram_login_challenges_status"), table_name="telegram_login_challenges")
    op.drop_index(op.f("ix_telegram_login_challenges_nonce"), table_name="telegram_login_challenges")
    op.drop_index(op.f("ix_telegram_login_challenges_expires_at"), table_name="telegram_login_challenges")
    op.drop_table("telegram_login_challenges")

    op.drop_index(op.f("ix_users_phone"), table_name="users")
    op.drop_index(op.f("ix_users_telegram_id"), table_name="users")
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("phone_verified")
        batch_op.drop_column("phone")
        batch_op.drop_column("telegram_username")
        batch_op.drop_column("telegram_id")
        batch_op.alter_column("hashed_password", existing_type=sa.String(length=255), nullable=False)
        batch_op.alter_column("email", existing_type=sa.String(length=255), nullable=False)

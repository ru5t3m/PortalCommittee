"""eds login

Revision ID: 20260616_0006
Revises: 20260616_0005
Create Date: 2026-06-16 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260616_0006"
down_revision: Union[str, None] = "20260616_0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(sa.Column("iin", sa.String(length=12), nullable=True))
        batch_op.add_column(sa.Column("eds_certificate_serial", sa.String(length=160), nullable=True))
        batch_op.create_index(op.f("ix_users_iin"), ["iin"], unique=True)

    op.create_table(
        "eds_login_challenges",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nonce", sa.String(length=128), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("challenge_text", sa.Text(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("signed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("consumed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("iin", sa.String(length=12), nullable=True),
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column("certificate_serial", sa.String(length=160), nullable=True),
        sa.Column("certificate_subject", sa.Text(), nullable=True),
        sa.Column("created_ip", sa.String(length=80), nullable=True),
        sa.Column("user_agent", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("nonce"),
    )
    op.create_index(op.f("ix_eds_login_challenges_expires_at"), "eds_login_challenges", ["expires_at"], unique=False)
    op.create_index(op.f("ix_eds_login_challenges_iin"), "eds_login_challenges", ["iin"], unique=False)
    op.create_index(op.f("ix_eds_login_challenges_nonce"), "eds_login_challenges", ["nonce"], unique=True)
    op.create_index(op.f("ix_eds_login_challenges_status"), "eds_login_challenges", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_eds_login_challenges_status"), table_name="eds_login_challenges")
    op.drop_index(op.f("ix_eds_login_challenges_nonce"), table_name="eds_login_challenges")
    op.drop_index(op.f("ix_eds_login_challenges_iin"), table_name="eds_login_challenges")
    op.drop_index(op.f("ix_eds_login_challenges_expires_at"), table_name="eds_login_challenges")
    op.drop_table("eds_login_challenges")

    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_index(op.f("ix_users_iin"))
        batch_op.drop_column("eds_certificate_serial")
        batch_op.drop_column("iin")

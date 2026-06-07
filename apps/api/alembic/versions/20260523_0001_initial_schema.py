"""initial production schema

Revision ID: 20260523_0001
Revises:
Create Date: 2026-05-23 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260523_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    is_postgresql = bind.dialect.name == "postgresql"
    if is_postgresql:
        role = postgresql.ENUM("admin", "moderator", "candidate", name="role", create_type=False)
        status = postgresql.ENUM("draft", "published", "archived", name="status", create_type=False)
        appeal_status = postgresql.ENUM("received", "in_review", "answered", "rejected", name="appealstatus", create_type=False)
        candidate_status = postgresql.ENUM("draft", "submitted", "in_review", "approved", "rejected", name="candidatestatus", create_type=False)
    else:
        role = sa.Enum("admin", "moderator", "candidate", name="role")
        status = sa.Enum("draft", "published", "archived", name="status")
        appeal_status = sa.Enum("received", "in_review", "answered", "rejected", name="appealstatus")
        candidate_status = sa.Enum("draft", "submitted", "in_review", "approved", "rejected", name="candidatestatus")

    if is_postgresql:
        role.create(bind, checkfirst=True)
        status.create(bind, checkfirst=True)
        appeal_status.create(bind, checkfirst=True)
        candidate_status.create(bind, checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", role, nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("is_blocked", sa.Boolean(), nullable=False),
        sa.Column("failed_login_count", sa.Integer(), nullable=False),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("password_changed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("two_factor_enabled", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "news",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title_kk", sa.String(length=300), nullable=False),
        sa.Column("title_ru", sa.String(length=300), nullable=False),
        sa.Column("summary_kk", sa.Text(), nullable=False),
        sa.Column("summary_ru", sa.Text(), nullable=False),
        sa.Column("body_kk", sa.Text(), nullable=False),
        sa.Column("body_ru", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=120), nullable=False),
        sa.Column("status", status, nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_news_category"), "news", ["category"], unique=False)

    op.create_table(
        "pages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=160), nullable=False),
        sa.Column("title_kk", sa.String(length=300), nullable=False),
        sa.Column("title_ru", sa.String(length=300), nullable=False),
        sa.Column("body_kk", sa.Text(), nullable=False),
        sa.Column("body_ru", sa.Text(), nullable=False),
        sa.Column("status", status, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_pages_slug"), "pages", ["slug"], unique=True)

    op.create_table(
        "region_offices",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("region", sa.String(length=160), nullable=False),
        sa.Column("address", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=80), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("latitude", sa.String(length=40), nullable=True),
        sa.Column("longitude", sa.String(length=40), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_region_offices_region"), "region_offices", ["region"], unique=False)

    op.create_table(
        "appeals",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("tracking_code", sa.String(length=40), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("iin", sa.String(length=12), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=60), nullable=False),
        sa.Column("subject", sa.String(length=255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", appeal_status, nullable=False),
        sa.Column("assigned_to_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["assigned_to_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_appeals_email"), "appeals", ["email"], unique=False)
    op.create_index(op.f("ix_appeals_tracking_code"), "appeals", ["tracking_code"], unique=True)

    op.create_table(
        "candidate_applications",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("tracking_code", sa.String(length=40), nullable=False),
        sa.Column("first_name", sa.String(length=120), nullable=False),
        sa.Column("last_name", sa.String(length=120), nullable=False),
        sa.Column("middle_name", sa.String(length=120), nullable=True),
        sa.Column("iin", sa.String(length=12), nullable=True),
        sa.Column("birth_date", sa.Date(), nullable=True),
        sa.Column("phone", sa.String(length=60), nullable=False),
        sa.Column("region", sa.String(length=160), nullable=True),
        sa.Column("education_level", sa.String(length=160), nullable=True),
        sa.Column("desired_direction", sa.String(length=200), nullable=True),
        sa.Column("status", candidate_status, nullable=False),
        sa.Column("moderator_comment", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_candidate_applications_user_id"),
    )
    op.create_index(op.f("ix_candidate_applications_iin"), "candidate_applications", ["iin"], unique=False)
    op.create_index(op.f("ix_candidate_applications_phone"), "candidate_applications", ["phone"], unique=False)
    op.create_index(op.f("ix_candidate_applications_tracking_code"), "candidate_applications", ["tracking_code"], unique=True)

    op.create_table(
        "refresh_sessions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("token_hash", sa.String(length=128), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_ip", sa.String(length=80), nullable=True),
        sa.Column("user_agent", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_refresh_sessions_token_hash"), "refresh_sessions", ["token_hash"], unique=True)
    op.create_index(op.f("ix_refresh_sessions_user_id"), "refresh_sessions", ["user_id"], unique=False)

    op.create_table(
        "login_attempts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("success", sa.Boolean(), nullable=False),
        sa.Column("ip_address", sa.String(length=80), nullable=True),
        sa.Column("user_agent", sa.String(length=500), nullable=True),
        sa.Column("reason", sa.String(length=120), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_login_attempts_email"), "login_attempts", ["email"], unique=False)
    op.create_index(op.f("ix_login_attempts_ip_address"), "login_attempts", ["ip_address"], unique=False)

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("actor_id", sa.Integer(), nullable=True),
        sa.Column("action", sa.String(length=120), nullable=False),
        sa.Column("entity", sa.String(length=120), nullable=False),
        sa.Column("entity_id", sa.String(length=80), nullable=False),
        sa.Column("ip_address", sa.String(length=80), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["actor_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_index(op.f("ix_login_attempts_ip_address"), table_name="login_attempts")
    op.drop_index(op.f("ix_login_attempts_email"), table_name="login_attempts")
    op.drop_table("login_attempts")
    op.drop_index(op.f("ix_refresh_sessions_user_id"), table_name="refresh_sessions")
    op.drop_index(op.f("ix_refresh_sessions_token_hash"), table_name="refresh_sessions")
    op.drop_table("refresh_sessions")
    op.drop_index(op.f("ix_candidate_applications_tracking_code"), table_name="candidate_applications")
    op.drop_index(op.f("ix_candidate_applications_phone"), table_name="candidate_applications")
    op.drop_index(op.f("ix_candidate_applications_iin"), table_name="candidate_applications")
    op.drop_table("candidate_applications")
    op.drop_index(op.f("ix_appeals_tracking_code"), table_name="appeals")
    op.drop_index(op.f("ix_appeals_email"), table_name="appeals")
    op.drop_table("appeals")
    op.drop_index(op.f("ix_region_offices_region"), table_name="region_offices")
    op.drop_table("region_offices")
    op.drop_index(op.f("ix_pages_slug"), table_name="pages")
    op.drop_table("pages")
    op.drop_index(op.f("ix_news_category"), table_name="news")
    op.drop_table("news")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
    if op.get_bind().dialect.name == "postgresql":
        op.execute("DROP TYPE IF EXISTS candidatestatus")
        op.execute("DROP TYPE IF EXISTS appealstatus")
        op.execute("DROP TYPE IF EXISTS status")
        op.execute("DROP TYPE IF EXISTS role")

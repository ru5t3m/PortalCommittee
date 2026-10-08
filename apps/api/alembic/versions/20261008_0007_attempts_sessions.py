from alembic import op
import sqlalchemy as sa

revision = "20261008_0007"
down_revision = "20260616_0006"
branch_labels = None
depends_on = None


def timestamps():
    return [sa.Column(name, sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False) for name in ("created_at", "updated_at")]


def upgrade():
    op.create_table("auth_sessions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True)), *timestamps())
    op.create_index("ix_auth_sessions_user_id", "auth_sessions", ["user_id"])
    with op.batch_alter_table("refresh_sessions") as batch:
        batch.add_column(sa.Column("auth_session_id", sa.String(36), nullable=True))
        batch.create_foreign_key("fk_refresh_auth_session", "auth_sessions", ["auth_session_id"], ["id"])
        batch.create_index("ix_refresh_sessions_auth_session_id", ["auth_session_id"])
    op.create_table("psychological_test_attempts",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("test_slug", sa.String(120), nullable=False),
        sa.Column("bank_version", sa.String(80), nullable=False),
        sa.Column("locale", sa.String(2), nullable=False),
        sa.Column("active_key", sa.String(160), unique=True),
        sa.Column("status", sa.String(30), nullable=False),
        sa.Column("section_index", sa.Integer(), nullable=False),
        sa.Column("question_index", sa.Integer(), nullable=False),
        sa.Column("answers", sa.JSON(), nullable=False),
        sa.Column("question_started_at", sa.DateTime(timezone=True)),
        sa.Column("elapsed_milliseconds", sa.Integer(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("last_event_id", sa.String(36)),
        sa.Column("last_event_digest", sa.String(64)), *timestamps())
    op.create_index("ix_psychological_test_attempts_user_id", "psychological_test_attempts", ["user_id"])
    with op.batch_alter_table("psychological_test_results") as batch:
        batch.add_column(sa.Column("attempt_id", sa.String(36), nullable=True))
        batch.create_foreign_key("fk_result_attempt", "psychological_test_attempts", ["attempt_id"], ["id"])
        batch.create_unique_constraint("uq_result_attempt", ["attempt_id"])


def downgrade():
    with op.batch_alter_table("psychological_test_results") as batch:
        batch.drop_constraint("uq_result_attempt", type_="unique")
        batch.drop_constraint("fk_result_attempt", type_="foreignkey")
        batch.drop_column("attempt_id")
    op.drop_table("psychological_test_attempts")
    with op.batch_alter_table("refresh_sessions") as batch:
        batch.drop_index("ix_refresh_sessions_auth_session_id")
        batch.drop_constraint("fk_refresh_auth_session", type_="foreignkey")
        batch.drop_column("auth_session_id")
    op.drop_table("auth_sessions")

from alembic import op
import sqlalchemy as sa

revision = "20261010_0010"
down_revision = "20261010_0009"
branch_labels = None
depends_on = None


def upgrade():
    if op.get_bind().dialect.name == "postgresql":
        op.execute("SET LOCAL lock_timeout = '5s'")
    with op.batch_alter_table("appeals") as batch:
        batch.add_column(sa.Column("owner_id", sa.Integer(), nullable=True))
        batch.create_foreign_key("fk_appeals_owner", "users", ["owner_id"], ["id"])
        batch.create_index("ix_appeals_owner_id", ["owner_id"])
    with op.batch_alter_table("audit_logs") as batch:
        batch.add_column(sa.Column("details", sa.JSON(), nullable=True))
        batch.add_column(sa.Column("actor_name", sa.String(255), nullable=True))
        batch.create_index("ix_audit_case_history", ["entity", "entity_id", "created_at", "id"])
    op.create_table(
        "case_comments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("appeal_id", sa.Integer(), sa.ForeignKey("appeals.id"), nullable=True),
        sa.Column("candidate_application_id", sa.Integer(), sa.ForeignKey("candidate_applications.id"), nullable=True),
        sa.Column("author_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("author_name", sa.String(255), nullable=False),
        sa.Column("visibility", sa.String(20), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("(appeal_id IS NOT NULL AND candidate_application_id IS NULL) OR (appeal_id IS NULL AND candidate_application_id IS NOT NULL)", name="ck_case_comment_target"),
        sa.CheckConstraint("visibility IN ('internal', 'candidate')", name="ck_case_comment_visibility"),
    )
    op.create_index("ix_case_comments_appeal_created", "case_comments", ["appeal_id", "created_at", "id"])
    op.create_index("ix_case_comments_candidate_created", "case_comments", ["candidate_application_id", "created_at", "id"])


def downgrade():
    op.drop_table("case_comments")
    with op.batch_alter_table("audit_logs") as batch:
        batch.drop_index("ix_audit_case_history")
        batch.drop_column("actor_name")
        batch.drop_column("details")
    with op.batch_alter_table("appeals") as batch:
        batch.drop_index("ix_appeals_owner_id")
        batch.drop_constraint("fk_appeals_owner", type_="foreignkey")
        batch.drop_column("owner_id")

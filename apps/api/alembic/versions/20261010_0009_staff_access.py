from alembic import op
import sqlalchemy as sa

revision = "20261010_0009"
down_revision = "20261010_0008"
branch_labels = None
depends_on = None

SCOPE_CHECK = "(staff_scope IS NULL AND organizational_unit_id IS NULL) OR (role = 'moderator' AND staff_scope IS NOT NULL AND ((staff_scope = 'central' AND organizational_unit_id IS NULL) OR (staff_scope = 'territorial' AND organizational_unit_id IS NOT NULL)))"


def upgrade():
    if op.get_bind().dialect.name == "postgresql":
        op.execute("SET LOCAL lock_timeout = '5s'")
    op.create_table(
        "organizational_units",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("code", sa.String(80), nullable=False, unique=True),
        sa.Column("name_ru", sa.String(255), nullable=False),
        sa.Column("name_kk", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    with op.batch_alter_table("users") as batch:
        batch.add_column(sa.Column("staff_scope", sa.String(20), nullable=True))
        batch.add_column(sa.Column("organizational_unit_id", sa.Integer(), nullable=True))
        batch.create_foreign_key("fk_users_organizational_unit", "organizational_units", ["organizational_unit_id"], ["id"])
        batch.create_index("ix_users_organizational_unit_id", ["organizational_unit_id"])
    with op.batch_alter_table("users") as batch:
        batch.create_check_constraint("ck_user_staff_scope", SCOPE_CHECK)
    for table in ("appeals", "candidate_applications"):
        with op.batch_alter_table(table) as batch:
            batch.add_column(sa.Column("organizational_unit_id", sa.Integer(), nullable=True))
            batch.create_foreign_key(f"fk_{table}_organizational_unit", "organizational_units", ["organizational_unit_id"], ["id"])
            batch.create_index(f"ix_{table}_organizational_unit_id", ["organizational_unit_id"])
    with op.batch_alter_table("candidate_applications") as batch:
        batch.add_column(sa.Column("assigned_to_id", sa.Integer(), nullable=True))
        batch.create_foreign_key("fk_candidates_assigned_to", "users", ["assigned_to_id"], ["id"])
        batch.create_index("ix_candidate_applications_assigned_to_id", ["assigned_to_id"])


def downgrade():
    if op.get_bind().dialect.name == "postgresql":
        op.execute("SET LOCAL lock_timeout = '5s'")
    with op.batch_alter_table("candidate_applications") as batch:
        batch.drop_index("ix_candidate_applications_assigned_to_id")
        batch.drop_constraint("fk_candidates_assigned_to", type_="foreignkey")
        batch.drop_column("assigned_to_id")
    for table in ("candidate_applications", "appeals"):
        with op.batch_alter_table(table) as batch:
            batch.drop_index(f"ix_{table}_organizational_unit_id")
            batch.drop_constraint(f"fk_{table}_organizational_unit", type_="foreignkey")
            batch.drop_column("organizational_unit_id")
    with op.batch_alter_table("users") as batch:
        batch.drop_constraint("ck_user_staff_scope", type_="check")
        batch.drop_index("ix_users_organizational_unit_id")
        batch.drop_constraint("fk_users_organizational_unit", type_="foreignkey")
        batch.drop_column("organizational_unit_id")
        batch.drop_column("staff_scope")
    op.drop_table("organizational_units")

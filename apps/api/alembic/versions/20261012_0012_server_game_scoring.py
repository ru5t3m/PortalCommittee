from alembic import op
import sqlalchemy as sa

revision = "20261012_0012"
down_revision = "20261012_0011"
branch_labels = None
depends_on = None


def upgrade():
    if op.get_bind().dialect.name == "postgresql":
        op.execute("SET LOCAL lock_timeout = '5s'")
    op.add_column("specgame_progress", sa.Column("rules_version", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("specgame_progress", sa.Column("last_action", sa.JSON(), nullable=True))
    op.add_column("specgame_progress", sa.Column("legacy_state", sa.JSON(), nullable=True))


def downgrade():
    op.drop_column("specgame_progress", "legacy_state")
    op.drop_column("specgame_progress", "last_action")
    op.drop_column("specgame_progress", "rules_version")

"""remove unused content and make contacts editable

Revision ID: 20260614_0004
Revises: 20260608_0003
Create Date: 2026-06-14 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260614_0004"
down_revision: Union[str, None] = "20260608_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("failed_login_count")
        batch_op.drop_column("two_factor_enabled")

    op.drop_table("pages")
    op.drop_table("news")

    with op.batch_alter_table("region_offices") as batch_op:
        batch_op.add_column(sa.Column("service", sa.String(length=40), nullable=True))
        batch_op.add_column(sa.Column("name_ru", sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column("name_kk", sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column("region_ru", sa.String(length=160), nullable=True))
        batch_op.add_column(sa.Column("region_kk", sa.String(length=160), nullable=True))
        batch_op.add_column(sa.Column("phones", sa.JSON(), nullable=True))

    connection = op.get_bind()
    dialect = connection.dialect.name
    if dialect == "postgresql":
        connection.execute(sa.text("UPDATE region_offices SET service = 'knb', name_ru = region, name_kk = region, region_ru = region, region_kk = region, phones = json_build_array(phone)"))
    else:
        connection.execute(sa.text("UPDATE region_offices SET service = 'knb', name_ru = region, name_kk = region, region_ru = region, region_kk = region, phones = json_array(phone)"))
    connection.execute(sa.text("UPDATE region_offices SET latitude = '0' WHERE latitude IS NULL"))
    connection.execute(sa.text("UPDATE region_offices SET longitude = '0' WHERE longitude IS NULL"))

    with op.batch_alter_table("region_offices") as batch_op:
        batch_op.drop_index(op.f("ix_region_offices_region"))
        batch_op.alter_column("service", existing_type=sa.String(length=40), nullable=False)
        batch_op.alter_column("name_ru", existing_type=sa.String(length=255), nullable=False)
        batch_op.alter_column("name_kk", existing_type=sa.String(length=255), nullable=False)
        batch_op.alter_column("region_ru", existing_type=sa.String(length=160), nullable=False)
        batch_op.alter_column("region_kk", existing_type=sa.String(length=160), nullable=False)
        batch_op.alter_column("phones", existing_type=sa.JSON(), nullable=False)
        batch_op.alter_column("latitude", existing_type=sa.String(length=40), nullable=False)
        batch_op.alter_column("longitude", existing_type=sa.String(length=40), nullable=False)
        batch_op.drop_column("region")
        batch_op.drop_column("address")
        batch_op.drop_column("phone")
        batch_op.drop_column("email")
        batch_op.create_index(op.f("ix_region_offices_service"), ["service"], unique=False)
        batch_op.create_index(op.f("ix_region_offices_region_ru"), ["region_ru"], unique=False)
        batch_op.create_index(op.f("ix_region_offices_region_kk"), ["region_kk"], unique=False)


def downgrade() -> None:
    with op.batch_alter_table("region_offices") as batch_op:
        batch_op.drop_index(op.f("ix_region_offices_region_kk"))
        batch_op.drop_index(op.f("ix_region_offices_region_ru"))
        batch_op.drop_index(op.f("ix_region_offices_service"))
        batch_op.add_column(sa.Column("region", sa.String(length=160), nullable=True))
        batch_op.add_column(sa.Column("address", sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column("phone", sa.String(length=80), nullable=True))
        batch_op.add_column(sa.Column("email", sa.String(length=255), nullable=True))

    connection = op.get_bind()
    dialect = connection.dialect.name
    if dialect == "postgresql":
        connection.execute(sa.text("UPDATE region_offices SET region = region_ru, address = '', phone = COALESCE(phones->>0, ''), email = 'contacts@example.gov.kz'"))
    else:
        connection.execute(sa.text("UPDATE region_offices SET region = region_ru, address = '', phone = COALESCE(json_extract(phones, '$[0]'), ''), email = 'contacts@example.gov.kz'"))

    with op.batch_alter_table("region_offices") as batch_op:
        batch_op.alter_column("region", existing_type=sa.String(length=160), nullable=False)
        batch_op.alter_column("address", existing_type=sa.String(length=255), nullable=False)
        batch_op.alter_column("phone", existing_type=sa.String(length=80), nullable=False)
        batch_op.alter_column("email", existing_type=sa.String(length=255), nullable=False)
        batch_op.drop_column("phones")
        batch_op.drop_column("region_kk")
        batch_op.drop_column("region_ru")
        batch_op.drop_column("name_kk")
        batch_op.drop_column("name_ru")
        batch_op.drop_column("service")
        batch_op.create_index(op.f("ix_region_offices_region"), ["region"], unique=False)

    op.create_table(
        "pages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=160), nullable=False),
        sa.Column("title_kk", sa.String(length=300), nullable=False),
        sa.Column("title_ru", sa.String(length=300), nullable=False),
        sa.Column("body_kk", sa.Text(), nullable=False),
        sa.Column("body_ru", sa.Text(), nullable=False),
        sa.Column("status", sa.Enum("draft", "published", "archived", name="status"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(op.f("ix_pages_slug"), "pages", ["slug"], unique=True)

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
        sa.Column("status", sa.Enum("draft", "published", "archived", name="status"), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_news_category"), "news", ["category"], unique=False)

    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(sa.Column("failed_login_count", sa.Integer(), nullable=False, server_default="0"))
        batch_op.add_column(sa.Column("two_factor_enabled", sa.Boolean(), nullable=False, server_default=sa.false()))

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, text

from app.core.config import get_settings


def upgrade_database() -> None:
    settings = get_settings()
    command.upgrade(Config("alembic.ini"), "head")
    if not settings.migration_runtime_role:
        return
    engine = create_engine(settings.database_url)
    try:
        if engine.dialect.name != "postgresql":
            raise RuntimeError("MIGRATION_RUNTIME_ROLE requires PostgreSQL")
        role = engine.dialect.identifier_preparer.quote_identifier(settings.migration_runtime_role)
        with engine.begin() as connection:
            connection.execute(text(f"REVOKE ALL PRIVILEGES ON TABLE public.alembic_version FROM {role}"))
            connection.execute(text(f"GRANT SELECT ON TABLE public.alembic_version TO {role}"))
    finally:
        engine.dispose()


if __name__ == "__main__":
    upgrade_database()

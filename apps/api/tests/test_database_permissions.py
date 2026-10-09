import os
import unittest
from uuid import uuid4

from sqlalchemy import create_engine, text
from sqlalchemy.exc import DBAPIError
from sqlalchemy.orm import Session

from app.models.entities import User


class PostgresPermissionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app_url = os.environ.get("PERMISSIONS_APP_DATABASE_URL")
        migration_url = os.environ.get("PERMISSIONS_MIGRATION_DATABASE_URL")
        if not app_url or not migration_url:
            raise unittest.SkipTest("Separate PostgreSQL test credentials are not configured")
        cls.app_engine = create_engine(app_url, hide_parameters=True)
        cls.migration_engine = create_engine(migration_url, hide_parameters=True)
        cls.addClassCleanup(cls.app_engine.dispose)
        cls.addClassCleanup(cls.migration_engine.dispose)

    def assert_denied(self, statement):
        with self.app_engine.begin() as connection:
            with self.assertRaises(DBAPIError) as error:
                with connection.begin_nested():
                    connection.execute(text(statement))
            self.assertEqual(error.exception.orig.sqlstate, "42501")

    def test_runtime_role_has_no_administrative_privileges(self):
        with self.app_engine.connect() as connection:
            role = connection.execute(text("""
                SELECT rolname, rolsuper, rolcreatedb, rolcreaterole, rolinherit, rolreplication, rolbypassrls
                FROM pg_roles WHERE rolname = current_user
            """)).one()
            self.assertEqual(role[0], "portal_app")
            self.assertFalse(any(role[1:]))
            self.assertEqual(connection.execute(text("""
                SELECT has_database_privilege(current_user, current_database(), 'CREATE'),
                       has_database_privilege(current_user, current_database(), 'TEMP'),
                       has_schema_privilege(current_user, 'public', 'CREATE')
            """)).one(), (False, False, False))
            self.assertEqual(connection.execute(text("""
                SELECT count(*) FROM pg_auth_members
                WHERE member = (SELECT oid FROM pg_roles WHERE rolname = current_user)
            """)).scalar_one(), 0)

    def test_runtime_role_can_read_and_write_application_data(self):
        with Session(self.app_engine) as session:
            try:
                user = User(email=f"permissions-{uuid4().hex}@example.kz", full_name="Permission test")
                session.add(user)
                session.flush()
                user_id = user.id
                session.expire_all()
                self.assertEqual(session.get(User, user_id).full_name, "Permission test")
                user.full_name = "Updated permission test"
                session.flush()
                session.expire_all()
                self.assertEqual(session.get(User, user_id).full_name, "Updated permission test")
                session.delete(user)
                session.flush()
                self.assertIsNone(session.get(User, user_id))
            finally:
                session.rollback()

    def test_runtime_role_cannot_change_schema_or_escalate_privileges(self):
        probe = "permission_probe_" + uuid4().hex
        statements = (
            f"CREATE TABLE public.{probe} (id integer)",
            f"ALTER TABLE public.users ADD COLUMN {probe} integer",
            "DROP TABLE public.audit_logs",
            "TRUNCATE public.users",
            f"CREATE SCHEMA {probe}",
            f"CREATE ROLE {probe}",
            "ALTER ROLE portal_app CREATEROLE",
            "SET ROLE portal_migrator",
        )
        for statement in statements:
            with self.subTest(statement=statement):
                self.assert_denied(statement)

    def test_runtime_role_can_read_but_cannot_change_migration_version(self):
        with self.app_engine.connect() as connection:
            self.assertIsNotNone(connection.execute(text("SELECT version_num FROM public.alembic_version")).scalar_one())
        self.assert_denied("UPDATE public.alembic_version SET version_num = version_num")
        self.assert_denied("DELETE FROM public.alembic_version")

    def test_migrator_can_create_tables_and_new_objects_grant_runtime_access(self):
        probe = "permission_probe_" + uuid4().hex
        with self.migration_engine.connect() as connection:
            role = connection.execute(text("""
                SELECT rolname, rolsuper, rolcreatedb, rolcreaterole, rolreplication, rolbypassrls
                FROM pg_roles WHERE rolname = current_user
            """)).one()
            self.assertEqual(role[0], "portal_migrator")
            self.assertFalse(any(role[1:]))
        try:
            with self.migration_engine.begin() as connection:
                connection.execute(text(f"CREATE TABLE public.{probe} (id bigserial PRIMARY KEY, value text NOT NULL)"))
                connection.execute(text(f"ALTER TABLE public.{probe} ADD COLUMN extra integer"))
            with self.app_engine.begin() as connection:
                row_id = connection.execute(text(f"INSERT INTO public.{probe}(value) VALUES ('created') RETURNING id")).scalar_one()
                connection.execute(text(f"UPDATE public.{probe} SET value = 'updated' WHERE id = :id"), {"id": row_id})
                self.assertEqual(connection.execute(text(f"SELECT value FROM public.{probe} WHERE id = :id"), {"id": row_id}).scalar_one(), "updated")
                connection.execute(text(f"DELETE FROM public.{probe} WHERE id = :id"), {"id": row_id})
        finally:
            with self.migration_engine.begin() as connection:
                connection.execute(text(f"DROP TABLE IF EXISTS public.{probe}"))

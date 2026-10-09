\set ON_ERROR_STOP on
\getenv app_password PORTAL_APP_PASSWORD
\getenv migration_password PORTAL_MIGRATION_PASSWORD

BEGIN;
SET LOCAL lock_timeout = '5s';

SELECT 1 / CASE WHEN length(:'app_password') >= 32
    AND length(:'migration_password') >= 32
    AND :'app_password' <> :'migration_password' THEN 1 ELSE 0 END AS credentials_valid;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'portal_app') THEN
        CREATE ROLE portal_app LOGIN;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'portal_migrator') THEN
        CREATE ROLE portal_migrator LOGIN;
    END IF;
    IF EXISTS (
        SELECT FROM pg_auth_members
        WHERE member IN (SELECT oid FROM pg_roles WHERE rolname IN ('portal_app', 'portal_migrator'))
    ) THEN
        RAISE EXCEPTION 'Portal database roles must not inherit other roles';
    END IF;
END $$;

ALTER ROLE portal_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
ALTER ROLE portal_migrator LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
SELECT format('ALTER ROLE portal_app PASSWORD %L', :'app_password') \gexec
SELECT format('ALTER ROLE portal_migrator PASSWORD %L', :'migration_password') \gexec

SELECT format('ALTER DATABASE %I OWNER TO portal_migrator', current_database()) \gexec
SELECT format('REVOKE ALL ON DATABASE %I FROM PUBLIC', current_database()) \gexec
SELECT format('GRANT CONNECT ON DATABASE %I TO portal_app', current_database()) \gexec
ALTER SCHEMA public OWNER TO portal_migrator;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO portal_app;

DO $$
DECLARE
    item record;
    kind text;
BEGIN
    FOR item IN
        SELECT c.relname, c.relkind
        FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'S', 'v', 'm', 'f')
        ORDER BY CASE WHEN c.relkind = 'S' THEN 1 ELSE 0 END, c.relname
    LOOP
        kind := CASE item.relkind
            WHEN 'S' THEN 'SEQUENCE' WHEN 'v' THEN 'VIEW'
            WHEN 'm' THEN 'MATERIALIZED VIEW' WHEN 'f' THEN 'FOREIGN TABLE'
            ELSE 'TABLE' END;
        EXECUTE format('ALTER %s public.%I OWNER TO portal_migrator', kind, item.relname);
    END LOOP;
    FOR item IN
        SELECT t.typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public' AND t.typtype IN ('e', 'd')
    LOOP
        EXECUTE format('ALTER TYPE public.%I OWNER TO portal_migrator', item.typname);
    END LOOP;
END $$;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC, portal_app;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC, portal_app;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, portal_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO portal_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO portal_app;

ALTER DEFAULT PRIVILEGES FOR ROLE portal_migrator IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO portal_app;
ALTER DEFAULT PRIVILEGES FOR ROLE portal_migrator IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO portal_app;
ALTER DEFAULT PRIVILEGES FOR ROLE portal_migrator
    REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

DO $$
BEGIN
    IF to_regclass('public.alembic_version') IS NOT NULL THEN
        REVOKE ALL ON TABLE public.alembic_version FROM portal_app;
        GRANT SELECT ON TABLE public.alembic_version TO portal_app;
    END IF;
END $$;

COMMIT;

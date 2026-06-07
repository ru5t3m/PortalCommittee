# Security And Completion Roadmap

## Goal

Finish the portal as a real working official internet resource for a government body.

The project must be functionally complete, production-oriented, and prepared for security review. Formal audit documents are intentionally out of scope for now and will be handled later by the project owner.

## Confirmed Scope

In scope:

- Official internet resource for a government body.
- Only `ru` and `kk` locales.
- Public informational pages.
- Public first-contact applications for people who want to work or study with the Committee.
- Candidate registration as the public registration flow.
- Candidate account cabinet.
- Telegram authentication with phone confirmation and email/password authentication as active login/registration methods.
- Admin and Moderator roles for administration/moderation.
- Candidate role for public authenticated users.
- Admin panel for appeals, candidate applications, and required content CRUD.
- Minimal necessary personal data storage.
- PostgreSQL for Docker/production and SQLite only as local fallback.
- Alembic migrations for schema changes.

Out of scope:

- Integration with government information systems.
- eGov.
- Digital signature.
- SMS.
- External identity providers.
- File upload.
- Managed document storage/CRUD.
- Search.
- English locale.
- Audit document package for now.

Hosting and server administration will be handled by the reviewing/hosting party. The repository still needs to provide a deployable, well-documented, security-conscious application.

## Current Highest-Value Work

1. Complete content CRUD for active site sections with explicit schemas and audit logging.
2. Add backend tests for Telegram auth, sessions, RBAC, appeals, candidate registration/application completion, and admin actions.
3. Add frontend typecheck/build/smoke coverage for main `ru` and `kk` flows.
4. Harden security controls: CORS, trusted hosts, CSRF where applicable, rate limiting, request-size limits, production secret checks, centralized error handling.
5. Harden Docker/infra readiness: non-root containers, healthchecks, production env documentation, logging, backup/restore guidance.

## Phase 1: Project Baseline

Status: mostly done

Tasks:

- Keep `AGENTS.md` updated as durable project context. In progress.
- Align README with the real current stack. Done.
- Remove outdated route references from README if they no longer exist. In progress as routes evolve.
- Keep SQLite fallback only for local development. Done.
- Define required environment variables for dev/staging/production. Pending.
- Add `.env.example` files without real secrets. Pending.

Deliverable:

- A clear project baseline that future agents and developers can read without re-discovering the repository.

## Phase 2: Backend Foundation

Status: in progress

Tasks:

- Remove startup table creation with `Base.metadata.create_all()` from production path. Done.
- Configure Alembic properly. Done.
- Create Alembic migrations for current models. Done.
- Review and simplify models for the confirmed scope. In progress.
- Remove unused managed document/search-related surfaces. Done for threat reports, vacancies, and managed document API/models.
- Add explicit created/updated timestamps where needed. Done for current models.
- Add database constraints and indexes for auth, tracking codes, and admin views. In progress.
- Add centralized exception handling. Pending.
- Add request validation and consistent error response schemas. Pending.

Deliverable:

- Backend schema and startup behavior suitable for real deployment.

## Phase 3: Authentication And Sessions

Status: in progress

Tasks:

- Replace frontend demo login with backend provider authentication. Done for Telegram and email/password providers.
- Define auth model for users. Done.
- Implement candidate account creation through Telegram login. Done for Telegram-authenticated users.
- Keep candidate application data separate from authentication. In progress.
- Implement login. Done through Telegram.
- Implement logout. Done.
- Implement refresh-token sessions. Done with HttpOnly refresh cookie and server-side `RefreshSession`.
- Add access-token expiration. Done.
- Add refresh-token rotation. Done.
- Add password login/register as an explicit secondary provider. Done, without email ownership confirmation; first-time candidate registration creates a candidate application from name, birth date, phone, email, and password.
- Add account active/blocked status. Schema done, behavior in progress.
- Add Telegram webhook secret validation. Done; production requires a strong secret.
- Add Telegram phone confirmation ownership check. Done through `contact.user_id == message.from.id`.
- Reconsider email-code verification before final security review if email/password remains enabled for production.
- Add login attempt logging. Done.
- Add failed login throttling/brute-force protection. Done for previous login failures and basic Telegram challenge creation throttling; broaden as needed.
- Add admin-only user management endpoints. Pending.
- Remove hardcoded frontend credentials. Done.

Deliverable:

- Real authentication and session management used by the frontend.

## Phase 4: RBAC And Admin Security

Status: in progress

Tasks:

- Reduce staff roles to Admin and Moderator unless the user expands scope. Done.
- Add Candidate as the public authenticated user scope. Done.
- Define role permissions explicitly. In progress.
- Protect every admin endpoint. Done for current admin dashboard, appeal, and candidate endpoints.
- Add audit logs for all admin create/update/delete actions. Done for appeal and candidate status changes; content CRUD audit remains pending.
- Add audit logs for login/logout/security-sensitive actions. Pending; login attempts are journaled.
- Ensure inactive/blocked users cannot authenticate or use sessions. In progress.
- Add admin dashboard backed by real API data. Done for current counts and actor context.
- Separate admin-panel login from ordinary user login. Done with `/admin` gate and `admin_session` token.
- Add CRUD endpoints only for required content. Pending.
- Validate admin payloads with Pydantic schemas instead of raw `dict`. Done for appeal and candidate status moderation; content CRUD schemas remain pending.

Deliverable:

- Admin API that is role-aware, auditable, and not based on unsafe generic payloads.

## Phase 5: Public Functional Features

Status: in progress

Tasks:

- Connect frontend to API through typed API helpers. In progress; auth, appeals, account, and admin moderation use typed helpers.
- Implement real public work/study application submission through the appeals backend. Done.
- Return and display appeal tracking code. Done.
- Implement appeal status lookup. Done.
- Implement real candidate application completion after Telegram authentication. Pending or needs verification after auth redesign.
- Create the candidate account during Telegram login. Done.
- Persist candidate application data separately from auth. Pending or needs verification.
- Add public empty states. In progress.
- Add public error states. Done for appeals and current admin panel flows; broaden as needed.
- Add loading states where client-side requests are used. Done for appeals and current admin panel flows; broaden as needed.
- Keep search removed from the active site.
- Keep `/documents` only as a static legal reference page.

Deliverable:

- Public portal workflows work end-to-end against the backend.

## Phase 6: Working Admin Panel

Status: in progress

Tasks:

- Replace concept admin page with real admin UI. Done for appeals and candidate applications.
- Admin login should use the real auth system. Done via existing login/session flow and protected admin API calls.
- Add list/detail views for appeals. Done.
- Add list/detail views for candidate registrations. Done.
- Add moderation/status changes where required. Done for appeal and candidate statuses.
- Add content CRUD only for active site sections that need dynamic content. Pending.
- Add clear empty/error/loading states. Done for current admin views.
- Add confirmation for destructive actions. Pending where destructive content CRUD is added.
- Ensure all admin actions hit audited backend endpoints. Done for current status changes; content CRUD audit remains pending.

Deliverable:

- The developer/site operator can administer the portal without direct database access.

## Phase 7: Application Security Hardening

Status: pending

Tasks:

- Strict CORS allowlist from environment.
- Remove wildcard trusted hosts in production.
- Add security headers on frontend and/or reverse proxy.
- Add HSTS for production.
- Add CSRF protection where cookie-backed session flows need it.
- Add API rate limiting beyond login throttling.
- Add request body size limits.
- Ensure no stack traces leak in production responses.
- Review all user-rendered content for XSS risk.
- Keep ORM usage parameterized.
- Validate all external input with Pydantic or typed frontend validation.
- Add production startup checks that reject weak/default secrets.
- Add secure cookie flags for production.
- Review access-token storage and refresh-cookie behavior together.

Deliverable:

- Application-level controls expected for a public government-facing site.

## Phase 8: Infrastructure Readiness

Status: pending

Tasks:

- Harden Dockerfiles.
- Run containers as non-root where practical.
- Add healthchecks for web and API.
- Ensure PostgreSQL is not exposed publicly in production compose/manifests.
- Split networks for web/API/DB where possible.
- Ensure secrets are injected via environment or secret manager.
- Add logging configuration.
- Add log rotation guidance.
- Add backup/restore scripts or documented commands for PostgreSQL.
- Add monitoring/alerting integration points.
- Ensure HTTPS is expected at ingress/reverse proxy.
- Document expected production environment variables.

Deliverable:

- Hosting/reviewing party receives an application that is straightforward to deploy safely.

## Phase 9: Testing And CI

Status: pending

Tasks:

- Add backend unit tests.
- Add backend integration tests for auth, sessions, RBAC, appeals, candidate registration, and admin actions.
- Add frontend typecheck.
- Add frontend build check.
- Add frontend smoke tests for main `ru` and `kk` routes.
- Add tests for empty/error states.
- Add dependency audit command.
- Add secret scanning step if CI supports it.
- Add Docker build check.
- Add CI workflow once hosting/source-control setup is clear.

Deliverable:

- Repeatable verification before handoff or audit review.

## Phase 10: Final Internal Security Review

Status: pending

Tasks:

- Review every public endpoint.
- Review every admin endpoint.
- Review auth/session behavior.
- Review logs for sensitive data leakage.
- Review environment variables and secret handling.
- Review response headers.
- Review CORS and host restrictions.
- Run dependency audit.
- Run build and tests.
- Run manual role tests.
- Run manual appeal and candidate registration tests.

Deliverable:

- Internal readiness checklist before external security review.

## Immediate Recommended Implementation Order

1. Complete required content CRUD with explicit schemas and audit logging.
2. Add backend tests for auth, sessions, appeals, candidates, and admin actions.
3. Add frontend typecheck/build/smoke coverage.
4. Harden application security controls.
5. Document production environment variables and deployment expectations.
6. Harden containers and infrastructure guidance.
7. Run an internal security readiness pass before handoff.

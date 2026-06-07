# Project Context For Agents

## Read This First

This repository is an official government web portal project for the National Security Committee of the Republic of Kazakhstan context.

Treat the project as a real production-oriented internet resource for a government body, not as a demo. Every change should move the portal toward a deployable, security-reviewable application.

Before making conclusions, inspect the current code. This file captures durable project direction, but implementation may have advanced since it was last edited.

## Product Scope

The portal supports only two locales:

- Russian: `/ru`
- Kazakh: `/kk`

The portal will not integrate with other government information systems at this stage.

Explicitly out of scope unless the user changes direction:

- eGov integration.
- Digital signatures.
- SMS integration.
- External identity providers.
- File or document upload.
- Managed document storage or document CRUD.
- Search.
- English locale or `/en` routes.
- Separate mobile routes such as `/mobile`.

## Current Stack

Frontend:

- Next.js App Router.
- React.
- TypeScript.
- Tailwind CSS.
- `lucide-react` icons.
- Leaflet/react-leaflet for the contacts map.

Backend:

- Python FastAPI.
- SQLAlchemy 2.
- Pydantic.
- PostgreSQL in Docker/production.
- SQLite only as the local development fallback.
- Authentication providers: Telegram with phone confirmation and email/password.
- JWT access tokens plus refresh-token sessions backed by `RefreshSession` rows and an HttpOnly refresh cookie.

Infrastructure:

- Dockerfiles exist for `apps/web` and `apps/api`.
- `docker-compose.yml` runs web, API, and PostgreSQL.
- HTTPS, WAF/rate limiting, backups, monitoring, and network separation are expected from production infrastructure or the hosting/reviewing party.

## Repository Layout

- `apps/web`: frontend portal and admin UI.
- `apps/web/app/[locale]`: localized frontend routes.
- `apps/web/lib/i18n.ts`: locale handling.
- `apps/web/lib/api.ts`: frontend API helpers and `NEXT_PUBLIC_API_URL`.
- `apps/web/lib/data.ts`: remaining static frontend datasets.
- `apps/web/components/AuthPage.tsx`: Telegram login/registration UI.
- `apps/web/components/AccountDashboard.tsx`: candidate account cabinet.
- `apps/web/components/CitizenAppealForm.tsx`: public first-contact work/study application form; returns tracking information and document-submission instructions.
- `apps/web/components/AdminPanel.tsx`: authenticated admin/moderator panel for appeals and candidate applications.
- `apps/web/components/AdminEntryPage.tsx`: root `/admin` entry gate; only the ordinary signed-in user configured by `ADMIN_PORTAL_ALLOWED_USER_EMAIL` may see the second admin login.
- `apps/web/components/Header.tsx`: main navigation and browser session state handling.
- `apps/api`: FastAPI backend.
- `apps/api/app/main.py`: API app factory and route registration.
- `apps/api/app/models/entities.py`: SQLAlchemy models.
- `apps/api/app/api/v1/public.py`: public API routes.
- `apps/api/app/api/v1/auth.py`: auth/session routes.
- `apps/api/app/api/v1/admin.py`: admin API routes.
- `apps/api/app/api/deps.py`: auth/RBAC dependencies.
- `apps/api/app/seed/demo.py`: local seed data.
- `apps/api/alembic`: Alembic migration environment.
- `apps/api/alembic/versions`: database schema migrations.
- `docs/ARCHITECTURE.md`: architecture summary.
- `SECURITY_ROADMAP.md`: completion and hardening roadmap.
- `docker-compose.yml`: local container orchestration.

## Current State

The frontend is visually developed and partly connected to the FastAPI backend.

Implemented or partially implemented:

- Authentication is provider-based. Implemented providers are Telegram and email/password.
- Telegram login uses `/auth/telegram/start`, a bot deep link, `/auth/telegram/webhook`, and `/auth/telegram/complete`.
- Telegram phone confirmation is done by the user sharing their own contact with the bot. The backend checks `contact.user_id == message.from.id`.
- Telegram-authenticated users are created without passwords and default to `candidate`; staff access is no longer granted through ordinary Telegram login.
- Email/password uses `/auth/password/register` and `/auth/password/login`. Password registration collects first name, last name, birth date, phone, email, and password, then creates `User(role=candidate)` plus `CandidateApplication` for regular candidate users.
- Email ownership is not confirmed in the current password flow. Treat this as a weaker secondary option unless the user later restores email-code verification.
- Candidate registration/application data is separate from authentication. After Telegram auth, a candidate may still need to complete candidate application data.
- Refresh tokens are stored as HttpOnly cookies; access tokens are kept in browser session storage.
- Refresh-token sessions use `RefreshSession` rows.
- Current user cabinet reads `/auth/me` and displays persisted candidate application data.
- Public first-contact work/study applications submit through `/api/v1/appeals`.
- Appeal submission displays a tracking code.
- Appeal status lookup uses `/api/v1/appeals/{tracking_code}`.
- After appeal submission, the frontend tells the applicant to send documents to `hr@knb.gov.kz`.
- The current document checklist contains only `resume`.
- Admin page reads real `/api/v1/admin` data for dashboard, appeals, and candidate applications.
- Admin/moderator status changes are implemented for appeals and candidate applications.
- Admin panel access is separated from ordinary auth. `/admin` first requires the ordinary portal user email configured by `ADMIN_PORTAL_ALLOWED_USER_EMAIL`, then requires a second admin-panel login configured by `ADMIN_PANEL_EMAIL` and `ADMIN_PANEL_PASSWORD_HASH`.
- Admin APIs require an `admin_session` JWT claim and no longer trust ordinary user role alone.
- Audit logging exists for current moderation status changes.
- API uses Alembic migrations and must not create tables at application startup.
- Local SQLite development uses `apps/api/knb_portal.dev.db` through `apps/api/.env`.
- The old pre-Alembic SQLite file was renamed to `apps/api/knb_portal.legacy.db` and should not be used for active development.
- `/documents` remains a static legal reference page named `Нормативная база` / `Нормативтік база`.

Known remaining gaps:

- Content CRUD for active site sections is pending.
- Some frontend datasets may still be static in `apps/web/lib/data.ts`.
- Google auth is a planned future provider option, but is not implemented yet.
- Test coverage for backend and frontend behavior is incomplete.
- Security hardening remains incomplete.
- Production environment validation and deployment hardening remain incomplete.

## Required Functional Scope

Required real features:

- Frontend connected to API.
- Real login.
- Real logout and session management.
- Candidate account creation through Telegram login, with candidate application completion handled separately.
- Public work/study application submission and tracking/status lookup.
- Working admin panel for site moderation/administration.
- CRUD for relevant site content only.
- Clear loading, empty, and error states.
- Alembic migrations for schema changes.
- Tests for core backend and frontend behavior.

Not required:

- eGov, digital signature, SMS, or external identity-provider integration.
- File upload.
- Managed document storage/CRUD.
- Search.
- English locale.

## Roles

Only these roles are required unless the user changes scope:

- Admin: full application administration.
- Moderator: site/content moderation.
- Candidate: public authenticated user created through candidate registration.

The developer/site operator uses the admin panel as editor/moderator. Server administration and hosting are handled by the review/hosting party.

## Security Direction

Treat this as a government-facing production application.

Required application security controls:

- Strong authentication.
- RBAC for Admin and Moderator.
- Telegram webhook secret validation in production.
- Telegram contact ownership check for phone confirmation.
- Brute-force/rate-limit protection.
- API rate limiting.
- CSRF protection for cookie-backed session flows where applicable.
- Strict CORS allowlist.
- Security headers.
- Input validation on every public and admin endpoint.
- XSS prevention.
- SQL injection prevention through ORM/query parameterization.
- Request body size limits.
- Audit log for all admin actions.
- No debug secrets or default secrets in production.
- Proper access-token/session expiration.
- User blocking/deactivation.
- Login success/failure journal.
- Centralized error handling without stack trace leakage.

Required infrastructure/security assumptions:

- HTTPS terminates at trusted ingress/reverse proxy.
- HSTS should be enabled in production.
- WAF/rate limiting should exist at the perimeter.
- Web/API/DB should be separated by network boundaries.
- Database must not be exposed to the public internet.
- Secrets must come from environment/secret manager, not repository files.
- PostgreSQL backup and restore process is required.
- Monitoring, logging, alerts, and log rotation are required.
- Containers should run as non-root where practical.
- Healthchecks should exist.
- CI/CD should run typecheck, tests, audit, and build checks.
- Staging and production should be separate.

## Mobile UX Direction

The mobile version may be a substantially different UX, not just a compressed desktop layout.

Preferred approach:

- Keep the same canonical locale routes: `/ru`, `/kk`, and nested localized routes.
- Render separate mobile and desktop components where the UX benefits from divergence.
- Share API calls, validation, translations, business rules, and data types.
- Do not create a separate `/mobile` site or duplicate business logic.
- Mobile UX can use mobile-specific navigation, simplified information architecture, larger touch targets, and different component composition.

## Development Guidance

- Prefer existing project patterns and keep changes scoped.
- Inspect the current code before assuming a feature is absent or complete.
- Do not reintroduce demo auth behavior or hardcoded frontend credentials.
- Do not add hardcoded password users or demo credentials.
- Do not hardcode admin-panel credentials; use `ADMIN_PANEL_EMAIL` and `ADMIN_PANEL_PASSWORD_HASH`.
- Do not add integrations that the user explicitly excluded.
- Do not add document/file upload unless the user asks later.
- Remove or hide search rather than investing in it unless scope changes.
- When adding backend schema changes, use Alembic migrations.
- Do not use `Base.metadata.create_all()` in the app startup path.
- When touching auth, consider both frontend UX and backend security together.
- When implementing frontend API calls, use typed helpers and clear empty/error/loading states.
- Keep `ru` and `kk` behavior consistent.
- Keep frontend copy suitable for an official government portal.

## Next Agent Priorities

1. Verify the actual code state before changing direction.
2. Complete content CRUD for active site sections with explicit schemas and audit logging.
3. Add or improve backend tests for Telegram auth, sessions, RBAC, appeals, candidate registration/application completion, and admin actions.
4. Add or improve frontend typecheck/build/smoke coverage for key `ru` and `kk` flows.
5. Harden security controls: CORS, trusted hosts, CSRF where applicable, rate limiting, request-size limits, production secret checks, and centralized error handling.
6. Harden Docker/infra readiness: non-root containers, healthchecks, production env documentation, logging, backup/restore guidance.

## Local Run Commands

Backend:

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
.venv/bin/alembic -c alembic.ini upgrade head
python -m app.seed.demo
uvicorn app.main:app --reload
```

These commands read `apps/api/.env` and create/use `knb_portal.dev.db` locally.

Frontend:

```bash
cd apps/web
npm install
npm run dev
```

Docker:

```bash
docker compose up --build
```

Useful URLs:

- Web: `http://localhost:3000/ru`
- API docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

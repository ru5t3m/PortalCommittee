# KNB RK Official Portal

Production-oriented monorepo for an official government internet resource in the Republic of Kazakhstan context.

For durable agent context and current implementation guidance, read `AGENTS.md` first. For completion and hardening work, read `SECURITY_ROADMAP.md`.

## Scope

The portal supports only:

- Russian: `/ru`
- Kazakh: `/kk`

Out of scope unless explicitly changed later:

- eGov, digital signature, SMS, or external identity-provider integration.
- File/document upload.
- Managed document storage or document CRUD.
- Search.
- English locale.

## Stack

- Frontend: Next.js App Router, React, Tailwind CSS, TypeScript, `lucide-react`.
- Backend: Python FastAPI, SQLAlchemy 2, Pydantic, PostgreSQL.
- Local database fallback: SQLite via `apps/api/.env`.
- Infrastructure: Dockerfiles for web/API and `docker-compose.yml` for web, API, and PostgreSQL.

## Current Capabilities

- Locale-prefixed public portal pages.
- Citizen first-contact work/study application submission through the backend.
- Appeal tracking/status lookup.
- Telegram login/registration flow backed by the API and Telegram bot webhook.
- Email/password login and registration as a secondary provider. The registration page currently allows only email/password registration. First-time email registration collects name, birth date, phone, email, and password, then creates the candidate account/application.
- Phone confirmation through Telegram contact sharing.
- Logout and refresh-token sessions using an HttpOnly refresh cookie.
- Candidate account cabinet using `/auth/me`.
- Admin/moderator dashboard for appeals and candidate applications.
- Admin/moderator status changes for appeals and candidate applications.
- Separate `/admin` entry gate: ordinary portal session must match `ADMIN_PORTAL_ALLOWED_USER_EMAIL`, then a second admin-panel login issues an admin-session token.
- Imported psychological test `primary-selection` from the provided DOCX. `/[locale]/psychological-testing` is now the public intro page that explains the sections and starts the flow; `/[locale]/psychological-testing/primary-selection` is a full-screen authenticated test mode without the normal portal header/footer. It checks `/auth/me` before showing questions, shows section instructions with the one-hour timer paused, then runs 50 numeric questions followed by 50 visual/figure-selection questions in pages of 10. Memory and interpretation sections are prepared as placeholders. It currently collects answers without automatic scoring until answer keys are added.
- Static legal reference page at `/documents`, named `Нормативная база` / `Нормативтік база`.
- Alembic migrations instead of startup table creation.

Known remaining work includes content CRUD, broader tests, security hardening, and deployment readiness. See `SECURITY_ROADMAP.md`.

## Run Locally

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

Local development uses `apps/api/.env` and `sqlite:///./knb_portal.dev.db` by default. The old pre-Alembic SQLite file was renamed to `apps/api/knb_portal.legacy.db` and should not be used for current development.

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

Open:

- Web: http://localhost:3000/ru
- API docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

Staff access is controlled by the separate `/admin` gate and admin-panel credentials. Password demo accounts are no longer part of the active auth flow.

## Main Routes

Russian routes:

- `/ru`
- `/ru/about`
- `/ru/activities`
- `/ru/careers/admission`
- `/ru/documents`
- `/ru/contacts`
- `/ru/login`
- `/ru/register`
- `/ru/account`
- `/ru/admin`

Kazakh routes follow the same structure under `/kk`.

## API Overview

Public:

- `GET /api/v1/news?locale=ru`
- `GET /api/v1/pages/{slug}?locale=ru`
- `POST /api/v1/appeals`
- `GET /api/v1/appeals/{tracking_code}`
- `GET /api/v1/contacts/regions`

Auth/account:

- `POST /api/v1/auth/password/register`
- `POST /api/v1/auth/password/login`
- `POST /api/v1/auth/admin/login`
- `POST /api/v1/auth/telegram/start`
- `GET /api/v1/auth/telegram/status/{challenge_id}`
- `POST /api/v1/auth/telegram/complete`
- `POST /api/v1/auth/telegram/webhook`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

Admin:

- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/appeals`
- `PATCH /api/v1/admin/appeals/{appeal_id}/status`
- `GET /api/v1/admin/candidates`
- `PATCH /api/v1/admin/candidates/{application_id}/status`

Check the FastAPI docs and route files for the exact current contract before implementing against an endpoint.

## Database Migrations

The API must not create tables at application startup. Apply migrations explicitly before running seed data or starting a new environment:

```bash
cd apps/api
.venv/bin/alembic -c alembic.ini upgrade head
```

When changing backend schema, add an Alembic migration.

## Telegram Webhook

After `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, and `TELEGRAM_WEBHOOK_SECRET` are configured on an HTTPS API host, register the webhook with Telegram:

```bash
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://YOUR_API_DOMAIN/api/v1/auth/telegram/webhook","secret_token":"YOUR_TELEGRAM_WEBHOOK_SECRET"}'
```

For local testing, expose the API through a temporary HTTPS tunnel and use that tunnel URL as the webhook URL.

## Render Backend Deploy

Deploy the FastAPI backend as a Render Web Service from `apps/api` using the existing Dockerfile.

Render setup:

- Service type: Web Service.
- Runtime: Docker.
- Root directory: `apps/api`.
- Health check path: `/health`.
- Region: same as the Render Postgres database.

The API Dockerfile copies Alembic files and starts with:

```bash
alembic -c alembic.ini upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

Use the Render Postgres Internal Database URL for `DATABASE_URL`, converted to SQLAlchemy psycopg format:

```text
postgresql+psycopg://USER:PASSWORD@INTERNAL_HOST:5432/DATABASE
```

Render environment variables can use single comma-separated values or JSON arrays for list fields:

```env
CORS_ORIGINS=https://knb-portal.vercel.app
ALLOWED_HOSTS=knb-portal-api.onrender.com
ADMIN_PORTAL_ALLOWED_USER_EMAIL=test@gmail.com
ADMIN_PANEL_EMAIL=rustemadmin@gmail.com
ADMIN_PANEL_PASSWORD_HASH=<bcrypt-hash>
ADMIN_ACCESS_TOKEN_MINUTES=60
```

Multiple values are also valid:

```env
CORS_ORIGINS=https://knb-portal.vercel.app,http://localhost:3000
ALLOWED_HOSTS=knb-portal-api.onrender.com,localhost
ADMIN_PORTAL_ALLOWED_USER_EMAIL=test@gmail.com
```

Admin-panel credentials must not be committed. Generate a bcrypt hash for the admin-panel password and store only the hash in Render:

```bash
python -c "from app.core.security import hash_password; print(hash_password('YOUR_PASSWORD'))"
```

Render Postgres migration troubleshooting:

- `type "role" already exists` or `relation "users" already exists` means the database is partially migrated but `alembic_version` is not at the expected revision.
- For a disposable test database, the clean fix is to reset/drop the database schema, then redeploy the API with the latest migration code.
- If resetting through the Render dashboard does not clear the schema, create a new Render Postgres database and replace the API `DATABASE_URL` with the new Internal Database URL.

## Production Notes

- Replace `JWT_SECRET`, database credentials, cookie secrets, and CORS origins.
- Configure `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, and strong `TELEGRAM_WEBHOOK_SECRET`.
- Configure the separate `/admin` gate through `ADMIN_PORTAL_ALLOWED_USER_EMAIL`, `ADMIN_PANEL_EMAIL`, and `ADMIN_PANEL_PASSWORD_HASH`.
- Set allowed hosts explicitly for the deployed domain and ingress.
- Terminate HTTPS at a trusted ingress or reverse proxy.
- Enable HSTS in production.
- Connect audit logs to SIEM or equivalent immutable retention.
- Add WAF/rate limiting at the edge and application-level throttling for sensitive forms.
- Ensure PostgreSQL is not publicly exposed.
- Review all legal copy with authorized legal and communications teams before launch.

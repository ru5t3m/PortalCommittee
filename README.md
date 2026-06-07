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
- Phone confirmation through Telegram contact sharing.
- Logout and refresh-token sessions using an HttpOnly refresh cookie.
- Candidate account cabinet using `/auth/me`.
- Admin/moderator dashboard for appeals and candidate applications.
- Admin/moderator status changes for appeals and candidate applications.
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

Staff access after seeding is controlled by Telegram IDs in `TELEGRAM_ADMIN_IDS` and `TELEGRAM_MODERATOR_IDS`. Password demo accounts are no longer part of the active auth flow.

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
TELEGRAM_ADMIN_IDS=["123456789"]
TELEGRAM_MODERATOR_IDS=
```

Multiple values are also valid:

```env
CORS_ORIGINS=https://knb-portal.vercel.app,http://localhost:3000
ALLOWED_HOSTS=knb-portal-api.onrender.com,localhost
TELEGRAM_ADMIN_IDS=123456789,987654321
```

## Production Notes

- Replace `JWT_SECRET`, database credentials, cookie secrets, and CORS origins.
- Configure `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, and strong `TELEGRAM_WEBHOOK_SECRET`.
- Configure staff Telegram IDs through `TELEGRAM_ADMIN_IDS` and `TELEGRAM_MODERATOR_IDS`.
- Set allowed hosts explicitly for the deployed domain and ingress.
- Terminate HTTPS at a trusted ingress or reverse proxy.
- Enable HSTS in production.
- Connect audit logs to SIEM or equivalent immutable retention.
- Add WAF/rate limiting at the edge and application-level throttling for sensitive forms.
- Ensure PostgreSQL is not publicly exposed.
- Review all legal copy with authorized legal and communications teams before launch.

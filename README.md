# KNB RK Official Portal

Production-oriented demo monorepo for an official government portal inspired by FBI.gov information architecture, with unique content and UI for the Republic of Kazakhstan context.

## Stack

- Frontend: Next.js 15, React 19, Tailwind, TypeScript
- Backend: Python FastAPI, SQLAlchemy 2, PostgreSQL
- Core features: i18n routes, public pages, appeals, threat reports, vacancies, documents, admin dashboard API, RBAC-ready auth

## Run Locally

Backend:

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m app.seed.demo
uvicorn app.main:app --reload
```

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

Demo admin account after seeding:

- `admin@knb.local`
- `ChangeMe123!`

## Main Routes

- `/ru`, `/kk`, `/en`
- `/ru/about`
- `/ru/activities/cybersecurity`
- `/ru/citizen-safety`
- `/ru/press`
- `/ru/appeals`
- `/ru/careers/admission`
- `/ru/documents`
- `/ru/contacts`
- `/ru/admin`

## API

Public:

- `GET /api/v1/news?locale=ru`
- `GET /api/v1/pages/{slug}?locale=ru`
- `POST /api/v1/appeals`
- `POST /api/v1/threat`
- `GET /api/v1/appeals/{tracking_code}`
- `GET /api/v1/vacancies?locale=ru`
- `GET /api/v1/documents?locale=ru`
- `GET /api/v1/contacts/regions`

Admin:

- `POST /api/v1/auth/login`
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/appeals`
- `GET /api/v1/admin/threat-reports`
- `GET /api/v1/admin/content/news`
- `GET /api/v1/admin/content/pages`

## Production Notes

- Replace `JWT_SECRET`, database credentials, and CORS origins.
- Terminate HTTPS at a trusted ingress or reverse proxy.
- Add Alembic migrations before the first production release.
- Use object storage plus antivirus scanning for future file uploads.
- Enforce 2FA in the admin panel before broad access.
- Connect audit logs to SIEM and immutable retention.
- Add WAF/rate limiting at the edge and per-form bot protection.
- Review all legal copy with authorized legal and communications teams before launch.

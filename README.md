# LedgerAxis

LedgerAxis is a multi-tenant company due-diligence platform. The repository currently contains a working Node.js/Express backend, a test-oriented Angular 21 frontend slice, backend and frontend Jest coverage, and separate local data setup paths for development, demo, and ingestion verification.

## Project Overview

The project is organized as a small monorepo:

- `backend/`
  Express API, PostgreSQL access through `pg`, auth, tenant-scoped data access, analytics, watchlists, audit logs, and ingestion.
- `frontend/`
  Angular 21 standalone frontend code focused on maintainable unit tests and behavior coverage.
- `scripts/`
  Local data setup and ingestion fixture entrypoints shared by backend development workflows.

## Architecture Summary

- Backend requests are authenticated with JWT and authorized by role.
- Tenant isolation is enforced at the repository layer by explicitly passing `tenantId` into repository methods.
- Company, director, watchlist, analytics, and audit features all read through tenant-scoped queries.
- Ingestion updates tenant companies through an explicit ingestion service and writes audit entries when fields change.
- Frontend code uses Angular standalone components, reactive forms, HttpClient wrappers, route guards, an auth interceptor, and Jest-based unit tests.

## Stack Summary

- Runtime: Node.js 24 LTS
- Backend: Express 4, Joi, JWT, bcrypt, `pg`, node-cron, Swagger UI
- Frontend: Angular 21, RxJS 7, Chart.js 4, Jest 30, `jest-preset-angular`
- Database: PostgreSQL 17 assumptions and SQL dialect
- Testing: Jest and Supertest for backend, Jest + Angular TestBed for frontend

## Runtime Alignment

- Root Node version file: [`.nvmrc`](c:/laragon/www/ledger-axis-v2/.nvmrc) contains `24`
- Backend engine: [`backend/package.json`](c:/laragon/www/ledger-axis-v2/backend/package.json)
- Frontend engine: [`frontend/package.json`](c:/laragon/www/ledger-axis-v2/frontend/package.json)
- Backend and frontend test scripts both run under Node 24-compatible commands

## Environment Files

Create these files before running the app or seed scripts:

1. Root env:
   - `cp .env.example .env`
2. Backend env:
   - `cp backend/.env.example backend/.env`
3. Frontend env:
   - `cp frontend/.env.example frontend/.env`

The backend env file is the important one for running the API, tests that hit the API surface, and all local data scripts.

## PostgreSQL Setup

LedgerAxis currently expects PostgreSQL-compatible behavior throughout the backend:

- `ILIKE` for company search
- `ON CONFLICT` for upserts
- `TIMESTAMPTZ` for timestamp columns in local schema bootstrap scripts
- `JSONB` for audit metadata

Recommended local setup:

1. Install PostgreSQL 17 locally.
2. Create a database, for example `ledgeraxis`.
3. Set `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, and `PGSSLMODE` in `backend/.env`.
4. Set a valid `JWT_SECRET` and a valid `INGESTION_SOURCE_URL`.

The local seed and ingestion fixture scripts bootstrap the minimal schema they need if the tables do not already exist. There is still no formal migration system in the repository.

## Backend Setup

1. `cd backend`
2. `npm install`
3. Configure `backend/.env`
4. Start the API:
   - `npm run dev`
   - or `npm start`

Backend health endpoint:

- `GET http://localhost:4000/health`

API docs:

- Swagger UI: `http://localhost:4000/api/docs`
- OpenAPI JSON: `http://localhost:4000/api/docs.json`

## Frontend Setup

1. `cd frontend`
2. `npm install`

Current frontend status:

- The Angular 21 codebase is present and covered by Jest tests.
- `npm test` works for frontend validation.
- `npm start` and `npm run build` intentionally fail with an explicit message because Angular CLI serve/build wiring is not yet implemented in this repository phase.

## Seed and Fixture Workflows

Three separate local data setup paths are intentionally kept independent.

### `seed:dev`

Command:

- `cd backend && npm run seed:dev`

Purpose:

- deterministic local development
- fixed tenant and role scenarios
- stable credentials
- simple UI and API walkthroughs

What it creates:

- a few tenants
- stable users across viewer, editor, and admin roles
- a small controlled company graph
- linked directors
- watchlists
- minimal audit entries

Sample credentials:

- `admin.alpha@ledgeraxis.local` / `LedgerAxis123!`
- `editor.alpha@ledgeraxis.local` / `LedgerAxis123!`
- `viewer.alpha@ledgeraxis.local` / `LedgerAxis123!`
- `admin.bravo@ledgeraxis.local` / `LedgerAxis123!`
- `viewer.bravo@ledgeraxis.local` / `LedgerAxis123!`

### `seed:demo`

Command:

- `cd backend && npm run seed:demo`

Purpose:

- richer manual QA
- realistic pagination
- analytics chart data
- broader tenant/company/director coverage

What it creates:

- reproducible faker-backed dataset with a fixed seed
- many companies and directors
- mixed `manual` and `ssm_feed` records
- industry spread
- director overlap
- persisted annual revenue bands for analytics

### `ingest:fixture`

Command:

- `cd backend && npm run ingest:fixture`

Purpose:

- deterministic ingestion verification
- sync and re-sync inspection
- audit verification on changed fields

What it uses:

- checked-in fixture payloads in [`backend/src/modules/ingestion/fixtures`](c:/laragon/www/ledger-axis-v2/backend/src/modules/ingestion/fixtures)
- an isolated fixture tenant

Important separation rules:

- ingestion fixtures do not depend on `seed:dev`
- ingestion fixtures do not depend on `seed:demo`
- seed scripts are for local data setup, not for proving ingestion correctness

## Scheduler Behavior

The backend starts a cron job in non-test environments from [`backend/src/server.js`](c:/laragon/www/ledger-axis-v2/backend/src/server.js).

- Schedule source: `INGESTION_CRON`
- Trigger behavior:
  - scheduler execution calls the ingestion service with `triggeredBy: 'scheduler'`
  - manual API-triggered ingestion requires an admin role

The scheduler does not run when `NODE_ENV=test`.

## Test Commands

### Backend

- `cd backend && npm test`
- `cd backend && npm run test:unit`
- `cd backend && npm run test:integration`
- `cd backend && npm run test:coverage`

### Frontend

- `cd frontend && npm test`
- `cd frontend && npm run test:watch`
- `cd frontend && npm run test:coverage`

## Local Development Flow

The most understandable local flow today is:

1. Configure `backend/.env` for PostgreSQL and JWT.
2. Run `cd backend && npm install`.
3. Run `cd frontend && npm install`.
4. Seed compact local data with `cd backend && npm run seed:dev`.
5. Start the backend with `cd backend && npm run dev`.
6. Inspect API docs at `/api/docs`.
7. Run backend tests with `cd backend && npm test`.
8. Run frontend tests with `cd frontend && npm test`.

For richer datasets:

- use `seed:demo`

For ingestion verification:

- use `ingest:fixture`

## API Surface Summary

Main backend route groups:

- `/api/auth`
- `/api/companies`
- `/api/directors`
- `/api/analytics`
- `/api/watchlist`
- `/api/ingestion`
- `/api/companies/:id/audit-log`

Role rules enforced by routes:

- `viewer`
  - read-only access to companies, directors, analytics, watchlists, and audit logs
- `editor`
  - can create and update companies
  - cannot delete companies
- `admin`
  - full company management
  - can trigger ingestion manually

## Assumptions and Tradeoffs

- Repository-level `tenantId` enforcement is the primary tenant isolation boundary.
- PostgreSQL 17 behavior is assumed everywhere in backend SQL and local schema bootstrap.
- The frontend is intentionally test-first right now; it is not yet wired for a full browser-based local app run.
- Seed and fixture scripts bootstrap only the minimal schema they need because the repo still lacks a dedicated migration workflow.
- Swagger coverage is route-driven and aligned to the current implemented routes, not to a future aspirational API.

## Known Limitations

- No formal PostgreSQL migration system yet
- No Docker or compose-based local environment
- Frontend serve/build workflow is not wired yet
- Backend seed scripts are production-minded for local use, but not a replacement for migrations or environment provisioning
- Some backend integration tests still rely on mocks rather than a dedicated test database lifecycle

## Next Improvements

- Add real database migrations and schema versioning
- Add a reproducible local PostgreSQL bootstrap flow
- Wire the Angular app for actual local serve/build
- Expand Swagger schemas with richer response examples
- Add DB-backed backend integration tests with isolated reset strategy

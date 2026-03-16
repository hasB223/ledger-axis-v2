# LedgerAxis

LedgerAxis is a multi-tenant company due-diligence platform with a Node.js/Express backend, an Angular 21 frontend, PostgreSQL-backed tenant-scoped data access, scheduled ingestion, and focused Jest-based test coverage.

## Project Overview

- `backend/`: Express API, JWT auth, role enforcement, tenant-scoped repositories, analytics, watchlists, audit logs, ingestion, Swagger docs, and PostgreSQL migrations.
- `frontend/`: Angular 21 standalone app, Jest unit tests, route guard/interceptor coverage, and Angular CLI serve/build wiring.
- `scripts/`: root developer workflow helpers plus separate dev seed, demo seed, and ingestion fixture entrypoints.

## Architecture Summary

- Backend routes authenticate with JWT and authorize by role.
- Tenant visibility is enforced explicitly in tenant-scoped repositories and analytics query services through `tenantId` filters.
- Backend modules follow `controllers -> application services -> domain services -> repositories` where domain services are only introduced for non-trivial reusable business rules.
- Request-scoped backend flows build a lightweight context object `{ requestId, userId, tenantId, role }` and pass it through controllers, services, and tenant-aware repositories where it improves consistency and traceability.
- Analytics reads use dedicated query-service modules so analytical SQL, aggregation, and response mapping stay separate from general application-service orchestration.
- PostgreSQL 17 is the single persistence layer and uses the `pg` driver directly.
- Schema changes are managed with `node-pg-migrate`; seeds and tests apply the same migrations instead of maintaining a second schema definition.
- The frontend is a standalone Angular 21 app bootstrapped from `src/main.ts`, using Angular router, reactive forms, and `HttpClient`.
- A scheduler in the backend triggers ingestion on the configured cron expression outside the test environment.

## Stack Summary

- Runtime: Node.js 24 LTS
- Backend: Express 4, Joi, JWT, bcrypt, `pg`, `node-pg-migrate`, node-cron, Swagger UI
- Frontend: Angular 21, Angular CLI 21, RxJS 7, Chart.js 4
- Database: PostgreSQL 17
- Testing: Jest and Supertest for backend, Jest and Angular TestBed for frontend

## Runtime and Version Alignment

- Node version file: [`.nvmrc`](c:/laragon/www/ledger-axis-v2/.nvmrc)
- Root engine: [`package.json`](c:/laragon/www/ledger-axis-v2/package.json)
- Backend engine: [`backend/package.json`](c:/laragon/www/ledger-axis-v2/backend/package.json)
- Frontend engine: [`frontend/package.json`](c:/laragon/www/ledger-axis-v2/frontend/package.json)
- Angular dependencies and CLI are pinned to the Angular 21 line in [`frontend/package.json`](c:/laragon/www/ledger-axis-v2/frontend/package.json) and [`frontend/angular.json`](c:/laragon/www/ledger-axis-v2/frontend/angular.json)

## Environment Files

Copy the backend env template before running migrations, seeds, the API, or ingestion:

```bash
cp backend/.env.example backend/.env
```

Optional templates that also exist in the repo:

- [`.env.example`](c:/laragon/www/ledger-axis-v2/.env.example): informational root placeholder
- [`frontend/.env.example`](c:/laragon/www/ledger-axis-v2/frontend/.env.example): frontend placeholder values, not yet consumed automatically by Angular CLI

Key backend env values:

- DB-only commands:
  - `PGHOST`
  - `PGPORT`
  - `PGDATABASE`
  - `PGUSER`
  - `PGPASSWORD`
  - `PGSSLMODE`
  - `PGSCHEMA`
- Full API runtime:
- `JWT_SECRET`
  - `INGESTION_CRON`
  - `INGESTION_SOURCE_URL`

## PostgreSQL Setup

LedgerAxis assumes PostgreSQL 17 semantics throughout the backend:

- `ILIKE` for company search
- `ON CONFLICT` for upserts
- `TIMESTAMPTZ` for timestamp columns
- `JSONB` for audit metadata

Recommended local setup:

1. Install PostgreSQL 17.
2. Create a database such as `ledgeraxis`.
3. Create a matching test database such as `ledgeraxis_test`.
4. Configure [`backend/.env`](c:/laragon/www/ledger-axis-v2/backend/.env.example) with the database connection and `PGSCHEMA=public`.
5. Run migrations before seeds or the API.

If you want to use the repo's default local credentials (`PGDATABASE=ledgeraxis`, `PGUSER=ledgeraxis`), you can provision them with `psql` as a PostgreSQL superuser:

```sql
CREATE ROLE ledgeraxis WITH LOGIN PASSWORD 'your_password';
CREATE DATABASE ledgeraxis OWNER ledgeraxis;
GRANT CONNECT, CREATE, TEMPORARY ON DATABASE ledgeraxis TO ledgeraxis;
```

Then connect to the database and grant schema access:

```sql
\c ledgeraxis
GRANT USAGE, CREATE ON SCHEMA public TO ledgeraxis;
ALTER SCHEMA public OWNER TO ledgeraxis;
```

After that, set [`backend/.env`](c:/laragon/www/ledger-axis-v2/backend/.env) to match:

```env
PGHOST=localhost
PGPORT=5432
PGDATABASE=ledgeraxis
PGUSER=ledgeraxis
PGPASSWORD=your_password
PGSCHEMA=public
```

Then run:

```bash
cd backend
npm run migrate
```

## Backend Setup

```bash
cd backend
npm install
npm run migrate
npm run dev
```

Setup note:

- `npm run migrate`, `npm run migrate:test`, `npm run test:db`, and the seed/fixture scripts only require the PostgreSQL env values.
- `npm run dev` and `npm start` still require the full backend runtime env, including `JWT_SECRET` and `INGESTION_SOURCE_URL`.

Useful backend commands:

- `npm start`
- `npm run migrate`
- `npm run migrate:down`
- `npm run migrate:test`
- `npm run seed:dev`
- `npm run seed:demo`
- `npm run ingest:fixture`
- `npm test`
- `npm run test:unit`
- `npm run test:integration`
- `npm run test:db`
- `npm run test:ci`
- `npm run test:coverage`

Backend URLs:

- Health: `http://localhost:4000/health`
- DB readiness: `http://localhost:4000/health/db`
- Swagger UI: `http://localhost:4000/api/docs`
- OpenAPI JSON: `http://localhost:4000/api/docs.json`

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

Useful frontend commands:

- `npm start`
- `npm run ng -- serve`
- `npm run ng -- build`
- `npm run build`
- `npm test`
- `npm run test:watch`
- `npm run test:coverage`

Frontend dependency audit note:

- `npm audit` currently reports a high-severity `undici` advisory through Angular build tooling, not through LedgerAxis application code.
- Current package path: `@angular-devkit/build-angular -> @angular/build -> undici`.
- LedgerAxis intentionally stays on Angular 21. Do not run `npm audit fix --force` here because npm currently proposes a breaking downgrade to Angular 20 build tooling.
- Re-check this path before taking action with:
  - `cd frontend && npm audit`
  - `cd frontend && npm ls undici @angular/build @angular-devkit/build-angular`
  - compare the installed Angular 21 build packages with the latest published Angular 21 release
- See [frontend/DEPENDENCY_RISKS.md](/c:/laragon/www/ledger-axis-v2/frontend/DEPENDENCY_RISKS.md) for the current tracking note.

Default frontend URL:

- `http://localhost:4200`

Current frontend navigation after sign-in:

- `/companies`: searchable company workspace with filters, pagination, and watchlist actions
- `/companies/new`: create company form
- `/companies/:id`: company detail and update form
- `/watchlist`: dedicated watchlist page
- Analytics is still shown in the shell as an upcoming area, not a completed route

## Root Developer Workflow

Install dependencies in both workspaces first:

```bash
cd backend && npm install
cd ../frontend && npm install
```

Then from the repo root:

```bash
npm run dev
```

Root scripts:

- `npm run dev`: starts backend watch mode and Angular dev server together
- `npm run migrate`: runs backend migrations
- `npm run migrate:down`: rolls back one backend migration
- `npm run migrate:test`: validates migrations against a disposable test schema
- `npm run backend:test`: runs backend Jest tests without requiring PostgreSQL
- `npm run frontend:test`

## Migration Workflow

Schema management now lives in [`backend/migrations`](c:/laragon/www/ledger-axis-v2/backend/migrations). The first migration replaces the old inline schema bootstrap that had been duplicated inside seed helpers.

How it works:

- `npm run migrate` applies pending migrations to `PGSCHEMA`
- `npm run migrate:down` rolls back one migration in `PGSCHEMA`
- `npm run migrate:test` creates a disposable schema, runs the migrations, and drops the schema again
- DB-only commands validate only PostgreSQL-related environment settings, so local schema bootstrap does not require JWT or ingestion runtime secrets

Tooling note:

- The backend uses `node-pg-migrate` 8.x for schema management.
- That upgrade was made to remove the previous transitive `glob` audit issue from the older 7.x line.
- The public migration commands stay the same.

This keeps migrations, seeds, and DB validation on one schema source of truth.

## Seed and Fixture Workflows

These paths stay intentionally separate.

### Deterministic Dev Seed

Command:

```bash
cd backend && npm run seed:dev
```

Purpose:

- stable local development
- predictable tenant and role walkthroughs
- fixed login credentials

Creates:

- a few tenants
- users for each role
- a controlled company set
- linked directors
- watchlists
- minimal audit entries

Sample credentials:

- `admin.alpha@ledgeraxis.local` / `LedgerAxis123!`
- `editor.alpha@ledgeraxis.local` / `LedgerAxis123!`
- `viewer.alpha@ledgeraxis.local` / `LedgerAxis123!`
- `admin.bravo@ledgeraxis.local` / `LedgerAxis123!`
- `viewer.bravo@ledgeraxis.local` / `LedgerAxis123!`

### Demo Seed

Command:

```bash
cd backend && npm run seed:demo
```

Purpose:

- richer manual QA
- realistic pagination
- analytics visual checks
- broader demo coverage

Creates:

- reproducible faker-backed companies and directors
- mixed `manual` and `ssm_feed` company records
- varied industries
- revenue spread for analytics
- overlap between some directors and companies

### Ingestion Fixture

Command:

```bash
cd backend && npm run ingest:fixture
```

Purpose:

- deterministic ingestion testing
- sync and re-sync verification
- audit log verification on changed fields

Source fixtures:

- [baseline.json](c:/laragon/www/ledger-axis-v2/backend/src/modules/ingestion/fixtures/baseline.json)
- [resync.json](c:/laragon/www/ledger-axis-v2/backend/src/modules/ingestion/fixtures/resync.json)

Important separation:

- ingestion does not depend on `seed:dev`
- ingestion does not depend on `seed:demo`
- seeds are for local data setup, not for proving ingestion correctness

## Scheduler Behavior

The backend scheduler is configured in [`backend/src/server.js`](c:/laragon/www/ledger-axis-v2/backend/src/server.js).

- Schedule source: `INGESTION_CRON`
- Runs only when `NODE_ENV !== test`
- Invokes ingestion with `triggeredBy: 'scheduler'`
- Manual ingestion remains restricted to admin users through the API

## Test Commands

Backend:

- `cd backend && npm test`
- `cd backend && npm run test:unit`
- `cd backend && npm run test:integration`
- `cd backend && npm run test:db`
- `cd backend && npm run test:ci`
- `cd backend && npm run test:coverage`

Frontend:

- `cd frontend && npm test`
- `cd frontend && npm run test:watch`
- `cd frontend && npm run test:coverage`

Migration validation:

- `cd backend && npm run migrate:test`

Backend test database requirements:

- `npm test`, `npm run test:unit`, and `npm run test:integration` do not require PostgreSQL.
- `npm run migrate:test` and `npm run test:db` do require PostgreSQL connectivity.
- Test DB config resolves in this order:
  - `PGTEST*` overrides
  - fallback `PG*` values
  - fallback `postgres` for both `PGUSER` and `PGDATABASE`
- By default, the DB-backed suite reuses the configured PostgreSQL database and isolates itself with a disposable schema instead of requiring a separate `*_test` database.
- Set `PGTESTDATABASE` if you want to point the DB-backed suite at a dedicated test database instead.
- The configured test user must be able to connect to the resolved database and create/drop the configured test schema.
- The default disposable test schema is `ledgeraxis_test_suite` unless `PGTESTSCHEMA` is set.

DB-backed integration coverage:

- `cd backend && npm run test:db`
- This suite applies migrations into the disposable test schema, runs a small set of real PostgreSQL-backed integration tests, and then drops the schema in teardown.
- It currently validates migration application, tenant-scoped repository behavior, watchlist uniqueness, ingestion upsert behavior with `ON CONFLICT`, and an analytics aggregation query against real seeded rows.

## Local Development Flow

1. Configure [`backend/.env`](c:/laragon/www/ledger-axis-v2/backend/.env.example).
2. Install backend and frontend dependencies.
3. Run `npm run migrate` from the root or `cd backend && npm run migrate`.
4. Seed the compact dataset with `cd backend && npm run seed:dev`.
5. Start both apps with `npm run dev`.
6. Open the frontend at `http://localhost:4200`.
7. Open Swagger at `http://localhost:4000/api/docs`.
8. Run backend and frontend tests as needed.

Use `seed:demo` when you need pagination and analytics depth. Use `ingest:fixture` when you need deterministic ingestion verification.

## Role and Tenant Rules

Role rules:

- `viewer`: read-only access
- `editor`: create and update companies, but cannot delete
- `admin`: full company management and manual ingestion trigger

Tenant rules:

- repositories scope company, director, watchlist, and audit queries by `tenantId`
- analytics query services scope analytical reads by `tenantId`
- tests and seeds use separate tenants to verify isolation behavior

## Assumptions and Tradeoffs

- The project stays on Node.js 24, PostgreSQL 17, Angular 21, and the `pg` driver.
- Migrations are now the schema authority; there is still no ORM.
- Backend Jest coverage is mostly route- and mock-focused; DB validation is run explicitly through `migrate:test` / `test:db` instead of every Jest run.
- Root `npm run dev` assumes backend and frontend dependencies are already installed in their own folders.

## Known Limitations

- No Docker or compose-based local environment yet
- No root install/bootstrap script yet
- Backend integration tests still do not exercise a full seeded PostgreSQL lifecycle
- Frontend coverage is strong at the unit level, but the app still lacks higher-level browser automation
- Frontend `npm audit` currently includes an unresolved transitive `undici` advisory from Angular build tooling; the repo tracks it until Angular ships a compatible upstream fix

## Next Improvements

- Add DB-backed backend integration tests that seed per-suite data into the disposable schema
- Add a root bootstrap command if the team wants one-step dependency install
- Expand migration coverage with follow-up migrations as the schema evolves
- Add production build/deploy guidance for backend and frontend separately

# LedgerAxis

Multi-tenant Company Data Platform for compliance and due-diligence teams.

## Proposed Architecture (Phase 1 Scaffold)

LedgerAxis is organized as a monorepo with separate backend and frontend applications.

- **Backend**: Node.js 24 (ES modules), Express, PostgreSQL 17 (`pg`), Joi, JWT, bcrypt, node-cron.
- **Frontend**: Angular 21 with strict TypeScript, Router, Reactive Forms, HttpClient, RxJS, Signals, NgRx, Chart.js.
- **Testing**: Jest + Supertest (backend), Jest-based Angular unit tests (frontend scaffold).
- **Docs**: Swagger placeholders (`swagger-jsdoc`, `swagger-ui-express`).

### Multi-Tenancy Principle

Tenant isolation is enforced at the **repository layer**:

- Repository signatures must explicitly receive `tenantId`.
- Example accepted signature: `findById({ tenantId, id })`.
- Anti-pattern to avoid: `findById(id)`.

## Repository Structure

```text
.
├── .nvmrc
├── .env.example
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── routes.js
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── companies/
│   │   │   ├── directors/
│   │   │   ├── analytics/
│   │   │   ├── watchlist/
│   │   │   ├── audit/
│   │   │   └── ingestion/
│   │   └── shared/
│   │       ├── config/
│   │       ├── db/
│   │       ├── middleware/
│   │       ├── errors/
│   │       ├── utils/
│   │       ├── constants/
│   │       └── docs/
│   └── tests/
│       ├── unit/
│       └── integration/
└── frontend/
    ├── .env.example
    ├── package.json
    ├── src/
    │   ├── index.html
    │   ├── main.ts
    │   ├── styles.css
    │   ├── environments/
    │   ├── assets/
    │   └── app/
    │       ├── core/
    │       ├── features/
    │       │   ├── auth/
    │       │   ├── companies/
    │       │   ├── directors/
    │       │   ├── analytics/
    │       │   └── watchlist/
    │       ├── shared/
    │       ├── i18n/
    │       └── styles/
    └── tests/
```

## Runtime and Tooling Baseline

- Node.js **24 LTS** enforced via `.nvmrc` and `engines` in both app package manifests.
- PostgreSQL **17** targeted in backend design notes.
- ES modules used consistently in backend scaffold.
- No ORM introduced; repository pattern prepared for direct `pg` usage.

## Getting Started (Scaffold Stage)

### Prerequisites

- Node.js 24.x
- PostgreSQL 17

### Setup

1. Copy environment templates:
   - `cp .env.example .env`
   - `cp backend/.env.example backend/.env`
   - `cp frontend/.env.example frontend/.env`
2. Install dependencies per app:
   - `cd backend && npm install`
   - `cd ../frontend && npm install`
3. Start backend placeholder server:
   - `cd ../backend && npm run dev`

## Current Phase Scope

This phase intentionally includes only:

1. Final folder structure
2. Repository scaffold
3. README skeleton
4. `.env.example` files
5. Backend and frontend `package.json`
6. Placeholder module files
7. Meaningful TODO markers for later implementation

## Next Implementation Phases (Planned)

- Implement auth and tenant-aware repository data access.
- Add PostgreSQL schema/migration strategy for tenant-scoped entities.
- Implement Angular app shell, routing, and feature flows.
- Add full testing matrix and CI workflows.
- Wire swagger docs and scheduled ingestion pipeline.

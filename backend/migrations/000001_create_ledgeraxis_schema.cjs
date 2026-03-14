exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE tenants (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE users (
      id BIGSERIAL PRIMARY KEY,
      tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('viewer', 'editor', 'admin')),
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE companies (
      id BIGSERIAL PRIMARY KEY,
      tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      registration_no TEXT NOT NULL,
      name TEXT NOT NULL,
      industry TEXT,
      source TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      annual_revenue NUMERIC(14, 2),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (tenant_id, registration_no)
    );

    CREATE TABLE directors (
      id BIGSERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      external_ref TEXT UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE company_directors (
      company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      director_id BIGINT NOT NULL REFERENCES directors(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (company_id, director_id)
    );

    CREATE TABLE watchlist_entries (
      id BIGSERIAL PRIMARY KEY,
      tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (tenant_id, user_id, company_id)
    );

    CREATE TABLE audit_logs (
      id BIGSERIAL PRIMARY KEY,
      tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      changed_fields TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      actor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
      metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_users_tenant_id ON users (tenant_id);
    CREATE INDEX idx_companies_tenant_id ON companies (tenant_id);
    CREATE INDEX idx_companies_tenant_registration ON companies (tenant_id, registration_no);
    CREATE INDEX idx_company_directors_director_id ON company_directors (director_id);
    CREATE INDEX idx_watchlist_entries_lookup ON watchlist_entries (tenant_id, user_id);
    CREATE INDEX idx_audit_logs_company_lookup ON audit_logs (tenant_id, entity_type, entity_id, created_at DESC);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_audit_logs_company_lookup;
    DROP INDEX IF EXISTS idx_watchlist_entries_lookup;
    DROP INDEX IF EXISTS idx_company_directors_director_id;
    DROP INDEX IF EXISTS idx_companies_tenant_registration;
    DROP INDEX IF EXISTS idx_companies_tenant_id;
    DROP INDEX IF EXISTS idx_users_tenant_id;

    DROP TABLE IF EXISTS audit_logs;
    DROP TABLE IF EXISTS watchlist_entries;
    DROP TABLE IF EXISTS company_directors;
    DROP TABLE IF EXISTS directors;
    DROP TABLE IF EXISTS companies;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS tenants;
  `);
};

import Joi from 'joi';
import 'dotenv/config';

const baseSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().port().default(4000),
  API_PREFIX: Joi.string().default('/api'),
  API_DOCS_ENABLED: Joi.boolean().truthy('true').falsy('false').default(true),
  CORS_ORIGIN: Joi.string().default('*'),
  BCRYPT_SALT_ROUNDS: Joi.number().integer().min(10).max(15).default(12),
  PGHOST: Joi.string().required(),
  PGPORT: Joi.number().default(5432),
  PGDATABASE: Joi.string().required(),
  PGUSER: Joi.string().required(),
  PGPASSWORD: Joi.string().allow('').required(),
  PGSSLMODE: Joi.string().default('disable'),
  PGSCHEMA: Joi.string().pattern(/^[A-Za-z_][A-Za-z0-9_]*$/).default('public')
}).unknown(true);

const appSchema = baseSchema.keys({
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  RATE_LIMIT_WINDOW_MS: Joi.number().integer().min(1000).default(60000),
  RATE_LIMIT_MAX: Joi.number().integer().min(1).default(10),
  INGESTION_CRON: Joi.string().default('*/30 * * * *'),
  INGESTION_SOURCE_URL: Joi.string().uri().required()
});

function validateEnvironment(schema, envSource) {
  const { value, error } = schema.validate(envSource, { abortEarly: false, convert: true });

  if (error) {
    throw new Error(`Invalid environment configuration: ${error.message}`);
  }

  return value;
}

function buildBaseEnv(value) {
  return {
    nodeEnv: value.NODE_ENV,
    port: value.PORT,
    apiPrefix: value.API_PREFIX,
    apiDocsEnabled: value.API_DOCS_ENABLED,
    corsOrigin: value.CORS_ORIGIN,
    bcryptSaltRounds: value.BCRYPT_SALT_ROUNDS,
    pg: {
      host: value.PGHOST,
      port: value.PGPORT,
      database: value.PGDATABASE,
      user: value.PGUSER,
      password: value.PGPASSWORD,
      schema: value.PGSCHEMA,
      options: `-c search_path=${value.PGSCHEMA},public`,
      ssl: value.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false
    }
  };
}

export function loadDbEnv(envSource = process.env) {
  const value = validateEnvironment(baseSchema, envSource);
  return buildBaseEnv(value);
}

export function loadAppEnv(envSource = process.env) {
  const value = validateEnvironment(appSchema, envSource);

  return {
    ...buildBaseEnv(value),
    jwtSecret: value.JWT_SECRET,
    jwtExpiresIn: value.JWT_EXPIRES_IN,
    rateLimitWindowMs: value.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: value.RATE_LIMIT_MAX,
    ingestionCron: value.INGESTION_CRON,
    ingestionSourceUrl: value.INGESTION_SOURCE_URL
  };
}

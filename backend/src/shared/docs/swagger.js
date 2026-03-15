import swaggerJSDoc from 'swagger-jsdoc';
import { appEnv } from '../config/app-env.js';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'LedgerAxis API',
      version: '1.0.0',
      description: 'Tenant-scoped company due-diligence API with auth, analytics, watchlists, audit history, and ingestion flows.'
    },
    tags: [
      { name: 'Auth', description: 'Authentication and current-user endpoints.' },
      { name: 'Operations', description: 'Operational health and readiness endpoints.' },
      { name: 'Companies', description: 'Tenant-scoped company listing and management.' },
      { name: 'Directors', description: 'Director lookups scoped through tenant-visible companies.' },
      { name: 'Analytics', description: 'Tenant analytics endpoints for charts and summaries.' },
      { name: 'Watchlist', description: 'User watchlist management within a tenant.' },
      { name: 'Ingestion', description: 'Admin-only ingestion trigger operations.' },
      { name: 'Audit', description: 'Tenant-scoped audit history.' }
    ],
    components: {
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' }
          }
        },
        ErrorResponse: {
          type: 'object',
          required: ['success', 'message', 'code'],
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Forbidden' },
            code: { type: 'string', example: 'FORBIDDEN' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 }
          }
        },
        CompanyPayload: {
          type: 'object',
          required: ['registrationNo', 'name', 'source'],
          properties: {
            registrationNo: { type: 'string', example: 'MY-12345-X' },
            name: { type: 'string', example: 'Acme Holdings Berhad' },
            industry: { type: 'string', nullable: true, example: 'Technology' },
            source: { type: 'string', example: 'manual' },
            status: { type: 'string', example: 'active' },
            annualRevenue: { type: 'number', format: 'double', nullable: true, example: 12500000 }
          }
        },
        WatchlistPayload: {
          type: 'object',
          required: ['companyId'],
          properties: {
            companyId: { type: 'integer', example: 42 },
            note: { type: 'string', nullable: true, example: 'Track board changes' }
          }
        },
        IngestionTriggerPayload: {
          type: 'object',
          properties: {
            dryRun: { type: 'boolean', default: false }
          }
        }
      },
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    servers: [{ url: appEnv.apiPrefix }]
  },
  apis: ['src/modules/**/routes/*.js', 'src/app.js']
});

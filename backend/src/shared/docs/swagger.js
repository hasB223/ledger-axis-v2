import swaggerJSDoc from 'swagger-jsdoc';
import { env } from '../config/env.js';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: { title: 'LedgerAxis API', version: '1.0.0' },
    components: {
      schemas: {
        SuccessResponse: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'object' } } },
        ErrorResponse: { type: 'object', properties: { success: { type: 'boolean', example: false }, message: { type: 'string' }, code: { type: 'string' } } }
      },
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    servers: [{ url: env.apiPrefix }]
  },
  apis: ['src/modules/**/routes/*.js']
});

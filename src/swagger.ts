import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Recruit.io API',
      version: '1.0.0',
      description: 'Documentação da API Recruit.io-backend'
    },
    servers: [
      { url: 'http://localhost:3000' }
    ],
  },
  apis: [
    path.resolve(__dirname, './routes/*.{ts,js}'),
    path.resolve(__dirname, '../src/routes/*.{ts,js}')
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

  app.use(
    '/api-docs',
    swaggerUi.serveFiles(swaggerSpec),
    swaggerUi.setup(undefined, {
      explorer: true,
      customSiteTitle: 'Recruit.io API Docs',
      swaggerOptions: { url: '/api-docs.json' }
    })
  );
}
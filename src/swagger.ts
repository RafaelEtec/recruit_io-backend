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
    path.join(process.cwd(), 'src/routes/*.{ts,js}'),
    path.join(process.cwd(), 'dist/routes/*.{ts,js}')
  ],
};

export function setupSwagger(app: Express) {
  const swaggerSpec = swaggerJsdoc(options);

  app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: 'Recruit.io API Docs'
    })
  );
}
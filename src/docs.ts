import { Express } from 'express';
import openApiDocument from './openapi.js';

const htmlTemplate = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Recruit.io API Reference</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; padding: 0; }
    redoc { display: block; height: 100vh; }
  </style>
</head>
<body>
  <redoc spec-url="/openapi.json"></redoc>
  <script src="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"></script>
</body>
</html>`;

export function setupApiDocs(app: Express) {
  app.get('/openapi.json', (_req, res) => {
    res.json(openApiDocument);
  });

  app.get('/api-docs', (_req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlTemplate);
  });
}

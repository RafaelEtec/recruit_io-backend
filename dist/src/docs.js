"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupApiDocs = setupApiDocs;
const openapi_js_1 = __importDefault(require("./openapi.js"));
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
function setupApiDocs(app) {
    app.get('/openapi.json', (_req, res) => {
        res.json(openapi_js_1.default);
    });
    app.get('/api-docs', (_req, res) => {
        res.setHeader('Content-Type', 'text/html');
        res.send(htmlTemplate);
    });
}

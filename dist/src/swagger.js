"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const path_1 = __importDefault(require("path"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
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
        path_1.default.join(process.cwd(), 'src/routes/*.{ts,js}'),
        path_1.default.join(process.cwd(), 'dist/routes/*.{ts,js}')
    ],
};
function setupSwagger(app) {
    const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
    app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec, {
        explorer: true,
        customSiteTitle: 'Recruit.io API Docs'
    }));
}

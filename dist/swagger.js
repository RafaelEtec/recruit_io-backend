import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
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
    apis: ['./src/routes/*.ts'],
};
const swaggerSpec = swaggerJsdoc(options);
export function setupSwagger(app) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

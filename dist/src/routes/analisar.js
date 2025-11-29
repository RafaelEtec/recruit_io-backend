"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const avaliador_js_1 = require("../services/avaliador.js");
const router = (0, express_1.Router)();
const criteriosEnum = [
    "criatividade",
    "fora_da_caixa",
    "praticidade",
    "preocupacao_com_seguranca",
    "clareza",
    "aderencia_ao_tema",
    "esforco"
];
/**
 * @swagger
 * tags:
 *   name: Analisar
 *   description: Endpoints relacionados à análise automática de respostas
 *
 * components:
 *   schemas:
 *     CriterioAnalise:
 *       type: string
 *       description: Critério utilizado para avaliar a resposta
 *       enum:
 *         - criatividade
 *         - fora_da_caixa
 *         - praticidade
 *         - preocupacao_com_seguranca
 *         - clareza
 *         - aderencia_ao_tema
 *         - esforco
 *
 *     AnaliseRequest:
 *       type: object
 *       required:
 *         - respostaId
 *         - criterios
 *       properties:
 *         respostaId:
 *           type: string
 *           format: cuid
 *           description: ID da resposta cadastrada no banco
 *           example: "cku0s7m8p0000x9l8v0h2abc1"
 *         criterios:
 *           type: array
 *           description: Lista de critérios que serão usados na avaliação
 *           items:
 *             $ref: '#/components/schemas/CriterioAnalise'
 *           example: ["criatividade", "clareza"]
 *         contextoPergunta:
 *           type: string
 *           description: Contexto adicional da pergunta (opcional)
 *           example: "Vaga para desenvolvedor backend pleno"
 *
 *     AnaliseResultado:
 *       type: object
 *       description: Resultado retornado pela IA para cada critério
 *       additionalProperties: true
 *       example:
 *         respostaId: "cku0s7m8p0000x9l8v0h2abc1"
 *         avaliacao:
 *           criatividade:
 *             nota: 8.5
 *             comentario: "Resposta mostra soluções alternativas interessantes."
 *           clareza:
 *             nota: 9
 *             comentario: "Resposta bem estruturada e fácil de entender."
 */
/**
 * @swagger
 * /api/analisar:
 *   post:
 *     summary: Analisa automaticamente uma resposta de candidato
 *     description: >
 *       Envia uma resposta previamente cadastrada para análise automática utilizando IA
 *       (Google Gemini 2.5 Flash), com base em uma lista de critérios.
 *     tags: [Analisar]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnaliseRequest'
 *     responses:
 *       200:
 *         description: Análise realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnaliseResultado'
 *       400:
 *         description: Erro de validação ou problema ao analisar a resposta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post("/", async (req, res) => {
    const schema = zod_1.z.object({
        respostaId: zod_1.z.string().cuid(),
        criterios: zod_1.z.array(zod_1.z.enum(criteriosEnum)).min(1),
        contextoPergunta: zod_1.z.string().optional()
    });
    const dados = schema.parse(req.body);
    try {
        const resultado = await (0, avaliador_js_1.analisarResposta)(dados.respostaId, dados.criterios, dados.contextoPergunta);
        res.json(resultado);
    }
    catch (e) {
        res.status(400).json({ erro: e.message });
    }
});
/**
 * @swagger
 * /api/analisar/criterios:
 *   get:
 *     summary: Lista os critérios disponíveis para análise
 *     tags: [Analisar]
 *     responses:
 *       200:
 *         description: Lista de critérios que podem ser utilizados na análise
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CriterioAnalise'
 */
router.get("/criterios", (_req, res) => {
    res.json(criteriosEnum);
});
exports.default = router;

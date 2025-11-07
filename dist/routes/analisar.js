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
exports.default = router;

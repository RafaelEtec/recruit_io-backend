import { Router } from "express";
import { z } from "zod";
import { analisarResposta } from "../services/avaliador.js";
const router = Router();
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
    const schema = z.object({
        respostaId: z.string().cuid(),
        criterios: z.array(z.enum(criteriosEnum)).min(1),
        contextoPergunta: z.string().optional()
    });
    const dados = schema.parse(req.body);
    try {
        const resultado = await analisarResposta(dados.respostaId, dados.criterios, dados.contextoPergunta);
        res.json(resultado);
    }
    catch (e) {
        res.status(400).json({ erro: e.message });
    }
});
export default router;

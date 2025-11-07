"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
router.post("/", async (req, res) => {
    const schema = zod_1.z.object({
        candidato: zod_1.z.string().min(1),
        resposta: zod_1.z.string().min(1),
        perguntaId: zod_1.z.string().cuid()
    });
    const dados = schema.parse(req.body);
    const resposta = await prisma.resposta.create({ data: dados });
    res.json(resposta);
});
exports.default = router;

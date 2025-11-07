"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
router.post("/", async (req, res) => {
    const schema = zod_1.z.object({
        texto: zod_1.z.string().min(5),
        tags: zod_1.z.array(zod_1.z.string()).optional()
    });
    const dados = schema.parse(req.body);
    const pergunta = await prisma.pergunta.create({
        data: { texto: dados.texto, tags: dados.tags ?? [] }
    });
    res.json(pergunta);
});
router.get("/", async (_req, res) => {
    const lista = await prisma.pergunta.findMany({
        orderBy: { dataCriacao: "desc" }
    });
    res.json(lista);
});
exports.default = router;

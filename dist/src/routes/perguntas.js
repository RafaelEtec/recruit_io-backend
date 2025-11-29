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
        tags: zod_1.z.array(zod_1.z.string()).optional(),
        usuarioId: zod_1.z.string().cuid()
    });
    const dados = schema.parse(req.body);
    const usuario = await prisma.usuario.findUnique({
        where: { id: dados.usuarioId }
    });
    if (!usuario) {
        return res.status(400).json({ erro: "Usuário informado não existe" });
    }
    const pergunta = await prisma.pergunta.create({
        data: {
            texto: dados.texto,
            tags: dados.tags ?? [],
            usuarioId: dados.usuarioId
        }
    });
    res.json(pergunta);
});
router.get("/", async (_req, res) => {
    const lista = await prisma.pergunta.findMany({
        include: { usuario: true },
        orderBy: { dataCriacao: "desc" }
    });
    res.json(lista);
});
router.get("/:id", async (req, res) => {
    try {
        const { id } = zod_1.z.object({ id: zod_1.z.string().cuid() }).parse(req.params);
        const pergunta = await prisma.pergunta.findUnique({
            where: { id },
            include: { usuario: true }
        });
        if (!pergunta)
            return res.status(404).json({ erro: "Pergunta não encontrada" });
        res.json(pergunta);
    }
    catch (e) {
        res.status(400).json({ erro: e.message });
    }
});
router.put("/:id", async (req, res) => {
    try {
        const params = zod_1.z.object({ id: zod_1.z.string().cuid() }).parse(req.params);
        const body = zod_1.z.object({
            texto: zod_1.z.string().min(5).optional(),
            tags: zod_1.z.array(zod_1.z.string()).optional()
        }).parse(req.body);
        const pergunta = await prisma.pergunta.update({
            where: { id: params.id },
            data: body
        });
        res.json(pergunta);
    }
    catch (e) {
        res.status(400).json({ erro: e.message });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const { id } = zod_1.z.object({ id: zod_1.z.string().cuid() }).parse(req.params);
        await prisma.pergunta.delete({ where: { id } });
        res.json({ sucesso: true });
    }
    catch (e) {
        res.status(400).json({ erro: e.message });
    }
});
exports.default = router;

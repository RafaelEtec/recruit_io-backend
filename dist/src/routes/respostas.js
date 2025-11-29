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
        perguntaId: zod_1.z.string().cuid(),
        usuarioId: zod_1.z.string().cuid()
    });
    const dados = schema.parse(req.body);
    const pergunta = await prisma.pergunta.findUnique({
        where: { id: dados.perguntaId }
    });
    if (!pergunta) {
        return res.status(400).json({ erro: "Pergunta inexistente" });
    }
    const usuario = await prisma.usuario.findUnique({
        where: { id: dados.usuarioId }
    });
    if (!usuario) {
        return res.status(400).json({ erro: "Usuário inexistente" });
    }
    const resposta = await prisma.resposta.create({
        data: {
            candidato: dados.candidato,
            resposta: dados.resposta,
            perguntaId: dados.perguntaId,
            usuarioId: dados.usuarioId
        }
    });
    res.json(resposta);
});
router.get("/", async (_req, res) => {
    const lista = await prisma.resposta.findMany({
        include: {
            pergunta: true,
            usuario: true
        },
        orderBy: { dataCriacao: "desc" }
    });
    res.json(lista);
});
router.get("/:id", async (req, res) => {
    try {
        const { id } = zod_1.z.object({ id: zod_1.z.string().cuid() }).parse(req.params);
        const resposta = await prisma.resposta.findUnique({
            where: { id },
            include: {
                pergunta: true,
                usuario: true
            }
        });
        if (!resposta)
            return res.status(404).json({ erro: "Resposta não encontrada" });
        res.json(resposta);
    }
    catch (e) {
        res.status(400).json({ erro: e.message });
    }
});
router.get("/pergunta/:id", async (req, res) => {
    try {
        const { id } = zod_1.z.object({ id: zod_1.z.string().cuid() }).parse(req.params);
        const lista = await prisma.resposta.findMany({
            where: { perguntaId: id },
            include: {
                usuario: true
            },
            orderBy: { dataCriacao: "desc" }
        });
        res.json(lista);
    }
    catch (e) {
        res.status(400).json({ erro: e.message });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const { id } = zod_1.z.object({ id: zod_1.z.string().cuid() }).parse(req.params);
        await prisma.resposta.delete({ where: { id } });
        res.json({ sucesso: true });
    }
    catch (e) {
        res.status(400).json({ erro: e.message });
    }
});
exports.default = router;

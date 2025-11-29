"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
/**
 * Schemas de validação (Zod)
 */
const usuarioCreateSchema = zod_1.z.object({
    nome: zod_1.z.string().min(3),
    email: zod_1.z.string().email(),
    senha: zod_1.z.string().min(6),
    tipoUsuario: zod_1.z.enum(["USER", "RECRUITER"])
});
const usuarioUpdateSchema = zod_1.z.object({
    nome: zod_1.z.string().min(3).optional(),
    email: zod_1.z.string().email().optional(),
    senha: zod_1.z.string().min(6).optional(),
    tipoUsuario: zod_1.z.enum(["USER", "RECRUITER"]).optional()
});
const usuarioIdSchema = zod_1.z.object({
    id: zod_1.z.string().cuid()
});
router.post("/", async (req, res) => {
    try {
        const dados = usuarioCreateSchema.parse(req.body);
        const emailExiste = await prisma.usuario.findUnique({
            where: { email: dados.email }
        });
        if (emailExiste) {
            return res.status(400).json({ erro: "E-mail já cadastrado." });
        }
        const senhaHash = await bcryptjs_1.default.hash(dados.senha, 10);
        const usuario = await prisma.usuario.create({
            data: {
                nome: dados.nome,
                email: dados.email,
                senha: senhaHash,
                tipoUsuario: dados.tipoUsuario
            }
        });
        res.json(usuario);
    }
    catch (e) {
        res.status(400).json({ erro: e.message });
    }
});
router.post("/login", async (req, res) => {
    const schema = zod_1.z.object({
        email: zod_1.z.string().email(),
        senha: zod_1.z.string().min(6)
    });
    try {
        const { email, senha } = schema.parse(req.body);
        const usuario = await prisma.usuario.findUnique({
            where: { email }
        });
        if (!usuario) {
            return res.status(400).json({ erro: "Usuário não encontrado." });
        }
        const senhaOk = await bcryptjs_1.default.compare(senha, usuario.senha);
        if (!senhaOk) {
            return res.status(400).json({ erro: "Senha incorreta." });
        }
        res.json({
            mensagem: "Login realizado com sucesso.",
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipoUsuario: usuario.tipoUsuario
            }
        });
    }
    catch (e) {
        res.status(400).json({ erro: e.message });
    }
});
router.get("/", async (_req, res) => {
    const lista = await prisma.usuario.findMany({
        orderBy: { nome: "asc" }
    });
    res.json(lista);
});
router.get("/:id", async (req, res) => {
    try {
        const { id } = usuarioIdSchema.parse(req.params);
        const usuario = await prisma.usuario.findUnique({ where: { id } });
        if (!usuario) {
            return res.status(404).json({ erro: "Usuário não encontrado." });
        }
        res.json(usuario);
    }
    catch (e) {
        res.status(400).json({ erro: e.message });
    }
});
router.put("/:id", async (req, res) => {
    try {
        const { id } = usuarioIdSchema.parse(req.params);
        const dados = usuarioUpdateSchema.parse(req.body);
        let senhaHash;
        if (dados.senha) {
            senhaHash = await bcryptjs_1.default.hash(dados.senha, 10);
        }
        const usuario = await prisma.usuario.update({
            where: { id },
            data: {
                ...dados,
                ...(senhaHash ? { senha: senhaHash } : {})
            }
        });
        res.json(usuario);
    }
    catch (e) {
        res.status(400).json({ erro: e.message });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const { id } = usuarioIdSchema.parse(req.params);
        await prisma.usuario.delete({ where: { id } });
        res.json({ sucesso: true });
    }
    catch (e) {
        res.status(400).json({ erro: e.message });
    }
});
exports.default = router;

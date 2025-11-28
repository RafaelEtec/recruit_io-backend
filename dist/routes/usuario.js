import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
const router = Router();
/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Endpoints de gestão de usuários do sistema
 *
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: cuid
 *         nome:
 *           type: string
 *         email:
 *           type: string
 *         tipoUsuario:
 *           type: string
 *           enum: [USER, RECRUITER]
 *       example:
 *         id: "cku1b0xg80000x9l8v0h12345"
 *         nome: "Maria Souza"
 *         email: "maria@example.com"
 *         tipoUsuario: "USER"
 *
 *     UsuarioCreate:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - senha
 *         - tipoUsuario
 *       properties:
 *         nome:
 *           type: string
 *           example: "João da Silva"
 *         email:
 *           type: string
 *           example: "joao@example.com"
 *         senha:
 *           type: string
 *           minLength: 6
 *           example: "123456"
 *         tipoUsuario:
 *           type: string
 *           enum: [USER, RECRUITER]
 *
 *     UsuarioLogin:
 *       type: object
 *       required:
 *         - email
 *         - senha
 *       properties:
 *         email:
 *           type: string
 *           example: "joao@example.com"
 *         senha:
 *           type: string
 *           example: "123456"
 *
 *     UsuarioLoginResponse:
 *       type: object
 *       properties:
 *         mensagem:
 *           type: string
 *         usuario:
 *           $ref: '#/components/schemas/Usuario'
 *
 *     UsuarioUpdate:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           example: "João Atualizado"
 *         email:
 *           type: string
 *           example: "novoemail@example.com"
 *         senha:
 *           type: string
 *         tipoUsuario:
 *           type: string
 *           enum: [USER, RECRUITER]
 *
 *     Erro:
 *       type: object
 *       properties:
 *         erro:
 *           type: string
 *       example:
 *         erro: "Mensagem explicando o problema."
 */
/**
 * Schemas de validação (Zod)
 */
const usuarioCreateSchema = z.object({
    nome: z.string().min(3),
    email: z.string().email(),
    senha: z.string().min(6),
    tipoUsuario: z.enum(["USER", "RECRUITER"])
});
const usuarioUpdateSchema = z.object({
    nome: z.string().min(3).optional(),
    email: z.string().email().optional(),
    senha: z.string().min(6).optional(),
    tipoUsuario: z.enum(["USER", "RECRUITER"]).optional()
});
const usuarioIdSchema = z.object({
    id: z.string().cuid()
});
/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioCreate'
 *     responses:
 *       200:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Erro de validação ou e-mail já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post("/", async (req, res) => {
    try {
        const dados = usuarioCreateSchema.parse(req.body);
        const emailExiste = await prisma.usuario.findUnique({
            where: { email: dados.email }
        });
        if (emailExiste) {
            return res.status(400).json({ erro: "E-mail já cadastrado." });
        }
        const senhaHash = await bcrypt.hash(dados.senha, 10);
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
/**
 * @swagger
 * /api/usuarios/login:
 *   post:
 *     summary: Realiza login de um usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioLogin'
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioLoginResponse'
 *       400:
 *         description: Usuário não encontrado ou senha incorreta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post("/login", async (req, res) => {
    const schema = z.object({
        email: z.string().email(),
        senha: z.string().min(6)
    });
    try {
        const { email, senha } = schema.parse(req.body);
        const usuario = await prisma.usuario.findUnique({
            where: { email }
        });
        if (!usuario) {
            return res.status(400).json({ erro: "Usuário não encontrado." });
        }
        const senhaOk = await bcrypt.compare(senha, usuario.senha);
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
/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Lista todos os usuários cadastrados
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 */
router.get("/", async (_req, res) => {
    const lista = await prisma.usuario.findMany({
        orderBy: { nome: "asc" }
    });
    res.json(lista);
});
/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Busca usuário pelo ID
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: cuid
 *         required: true
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuário não encontrado
 *       400:
 *         description: ID inválido
 */
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
/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Atualiza um usuário existente
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioUpdate'
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Erro de validação
 */
router.put("/:id", async (req, res) => {
    try {
        const { id } = usuarioIdSchema.parse(req.params);
        const dados = usuarioUpdateSchema.parse(req.body);
        let senhaHash;
        if (dados.senha) {
            senhaHash = await bcrypt.hash(dados.senha, 10);
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
/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Remove um usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: cuid
 *         required: true
 *     responses:
 *       200:
 *         description: Usuário removido
 *       400:
 *         description: ID inválido
 */
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
export default router;

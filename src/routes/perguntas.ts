import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Perguntas
 *   description: Endpoints para cadastro e gerenciamento de perguntas
 *
 * components:
 *   schemas:
 *     Pergunta:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: cuid
 *           example: "cku0rx3cv0000x9l8v0h2xyz1"
 *         texto:
 *           type: string
 *           example: "Explique o conceito de closures em JavaScript."
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["logica", "javascript"]
 *         dataCriacao:
 *           type: string
 *           format: date-time
 *       required:
 *         - id
 *         - texto
 *         - tags
 *         - dataCriacao
 *
 *     PerguntaCreate:
 *       type: object
 *       required:
 *         - texto
 *         - usuarioId
 *       properties:
 *         texto:
 *           type: string
 *           minLength: 5
 *           example: "Explique o conceito de closures em JavaScript."
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de tags associadas à pergunta
 *           example: ["logica", "javascript"]]
 *         usuarioId:
 *           type: string
 *           format: cuid
 *
 *     PerguntaUpdate:
 *       type: object
 *       properties:
 *         texto:
 *           type: string
 *           minLength: 5
 *           example: "Atualize a explicação sobre closures em JavaScript."
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["logica", "javascript", "avancado"]
 *
 *     Erro:
 *       type: object
 *       properties:
 *         erro:
 *           type: string
 *       example:
 *         erro: "Mensagem de erro explicando o problema."
 */

/**
 * @swagger
 * /api/perguntas:
 *   post:
 *     summary: Cria uma nova pergunta
 *     tags: [Perguntas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PerguntaCreate'
 *     responses:
 *       200:
 *         description: Pergunta criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pergunta'
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post("/", async (req, res) => {
  const schema = z.object({
    texto: z.string().min(5),
    tags: z.array(z.string()).optional(),
    usuarioId: z.string().cuid()
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

/**
 * @swagger
 * /api/perguntas:
 *   get:
 *     summary: Lista todas as perguntas cadastradas
 *     tags: [Perguntas]
 *     responses:
 *       200:
 *         description: Lista de perguntas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pergunta'
 */
router.get("/", async (_req, res) => {
  const lista = await prisma.pergunta.findMany({
    include: { usuario: true },
    orderBy: { dataCriacao: "desc" }
  });
  res.json(lista);
});

/**
 * @swagger
 * /api/perguntas/{id}:
 *   get:
 *     summary: Busca detalhes de uma pergunta específica
 *     tags: [Perguntas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: ID da pergunta
 *     responses:
 *       200:
 *         description: Dados da pergunta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pergunta'
 *       404:
 *         description: Pergunta não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = z.object({ id: z.string().cuid() }).parse(req.params);
    const pergunta = await prisma.pergunta.findUnique({
      where: { id },
      include: { usuario: true }
    });

    if (!pergunta) return res.status(404).json({ erro: "Pergunta não encontrada" });

    res.json(pergunta);
  } catch (e: any) {
    res.status(400).json({ erro: e.message });
  }
});

/**
 * @swagger
 * /api/perguntas/{id}:
 *   put:
 *     summary: Atualiza uma pergunta existente
 *     tags: [Perguntas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: ID da pergunta a ser atualizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PerguntaUpdate'
 *     responses:
 *       200:
 *         description: Pergunta atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pergunta'
 *       400:
 *         description: Erro de validação ou ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.put("/:id", async (req, res) => {
  try {
    const params = z.object({ id: z.string().cuid() }).parse(req.params);
    const body = z.object({
      texto: z.string().min(5).optional(),
      tags: z.array(z.string()).optional()
    }).parse(req.body);

    const pergunta = await prisma.pergunta.update({
      where: { id: params.id },
      data: body
    });

    res.json(pergunta);
  } catch (e: any) {
    res.status(400).json({ erro: e.message });
  }
});

/**
 * @swagger
 * /api/perguntas/{id}:
 *   delete:
 *     summary: Remove uma pergunta
 *     tags: [Perguntas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: ID da pergunta a ser removida
 *     responses:
 *       200:
 *         description: Pergunta removida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *               example:
 *                 sucesso: true
 *       400:
 *         description: ID inválido ou erro ao remover
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = z.object({ id: z.string().cuid() }).parse(req.params);
    await prisma.pergunta.delete({ where: { id } });
    res.json({ sucesso: true });
  } catch (e: any) {
    res.status(400).json({ erro: e.message });
  }
});

export default router;
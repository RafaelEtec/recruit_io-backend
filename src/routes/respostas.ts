import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Respostas
 *   description: Endpoints para cadastro e gerenciamento das respostas dos candidatos
 *
 * components:
 *   schemas:
 *     Resposta:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: cuid
 *         candidato:
 *           type: string
 *           example: "João da Silva"
 *         resposta:
 *           type: string
 *           example: "Minha resposta detalhada para a pergunta..."
 *         perguntaId:
 *           type: string
 *           format: cuid
 *         dataCriacao:
 *           type: string
 *           format: date-time
 *         pergunta:
 *           $ref: '#/components/schemas/Pergunta'
 *       required:
 *         - id
 *         - candidato
 *         - resposta
 *         - perguntaId
 *         - dataCriacao
 *
 *     RespostaCreate:
 *       type: object
 *       required:
 *         - candidato
 *         - resposta
 *         - perguntaId
 *       properties:
 *         candidato:
 *           type: string
 *           minLength: 1
 *           example: "João da Silva"
 *         resposta:
 *           type: string
 *           minLength: 1
 *           example: "Resposta do candidato aqui..."
 *         perguntaId:
 *           type: string
 *           format: cuid
 *           example: "cku0rx3cv0000x9l8v0h2xyz1"
 */

/**
 * @swagger
 * /api/respostas:
 *   post:
 *     summary: Registra a resposta de um candidato
 *     tags: [Respostas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RespostaCreate'
 *     responses:
 *       200:
 *         description: Resposta criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post("/", async (req, res) => {
  const schema = z.object({
    candidato: z.string().min(1),
    resposta: z.string().min(1),
    perguntaId: z.string().cuid()
  });

  const dados = schema.parse(req.body);
  const resposta = await prisma.resposta.create({ data: dados });
  res.json(resposta);
});

/**
 * @swagger
 * /api/respostas:
 *   get:
 *     summary: Lista todas as respostas cadastradas
 *     tags: [Respostas]
 *     responses:
 *       200:
 *         description: Lista de respostas incluindo a pergunta relacionada
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resposta'
 */
router.get("/", async (_req, res) => {
  const lista = await prisma.resposta.findMany({
    include: { pergunta: true },
    orderBy: { dataCriacao: "desc" }
  });
  res.json(lista);
});

/**
 * @swagger
 * /api/respostas/{id}:
 *   get:
 *     summary: Busca detalhes de uma resposta específica
 *     tags: [Respostas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: ID da resposta
 *     responses:
 *       200:
 *         description: Dados da resposta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 *       404:
 *         description: Resposta não encontrada
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
    const resposta = await prisma.resposta.findUnique({
      where: { id },
      include: { pergunta: true }
    });
    if (!resposta) return res.status(404).json({ erro: "Resposta não encontrada" });
    res.json(resposta);
  } catch (e: any) {
    res.status(400).json({ erro: e.message });
  }
});

/**
 * @swagger
 * /api/respostas/pergunta/{id}:
 *   get:
 *     summary: Lista respostas de uma pergunta específica
 *     tags: [Respostas]
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
 *         description: Lista de respostas associadas à pergunta
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resposta'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get("/pergunta/:id", async (req, res) => {
  try {
    const { id } = z.object({ id: z.string().cuid() }).parse(req.params);
    const lista = await prisma.resposta.findMany({
      where: { perguntaId: id },
      orderBy: { dataCriacao: "desc" }
    });
    res.json(lista);
  } catch (e: any) {
    res.status(400).json({ erro: e.message });
  }
});

/**
 * @swagger
 * /api/respostas/{id}:
 *   delete:
 *     summary: Remove uma resposta
 *     tags: [Respostas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: ID da resposta a ser removida
 *     responses:
 *       200:
 *         description: Resposta removida com sucesso
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
    await prisma.resposta.delete({ where: { id } });
    res.json({ sucesso: true });
  } catch (e: any) {
    res.status(400).json({ erro: e.message });
  }
});

export default router;
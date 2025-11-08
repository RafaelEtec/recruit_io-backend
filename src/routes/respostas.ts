import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();
const router = Router();

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

router.get("/", async (_req, res) => {
  const lista = await prisma.resposta.findMany({
    include: { pergunta: true },
    orderBy: { dataCriacao: "desc" }
  });
  res.json(lista);
});

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
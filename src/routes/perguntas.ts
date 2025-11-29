import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();
const router = Router();


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

router.get("/", async (_req, res) => {
  const lista = await prisma.pergunta.findMany({
    include: { usuario: true },
    orderBy: { dataCriacao: "desc" }
  });
  res.json(lista);
});

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
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

export default router;
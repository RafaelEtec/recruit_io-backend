import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
const prisma = new PrismaClient();
const router = Router();
router.post("/", async (req, res) => {
    const schema = z.object({
        texto: z.string().min(5),
        tags: z.array(z.string()).optional()
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
export default router;

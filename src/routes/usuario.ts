import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const router = Router();

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
 * Criar usuário
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
  } catch (e: any) {
    res.status(400).json({ erro: e.message });
  }
});

/**
 * Login
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
  } catch (e: any) {
    res.status(400).json({ erro: e.message });
  }
});

/**
 * Listar usuários
 */
router.get("/", async (_req, res) => {
  const lista = await prisma.usuario.findMany({
    orderBy: { nome: "asc" }
  });
  res.json(lista);
});

/**
 * Buscar usuário por ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = usuarioIdSchema.parse(req.params);
    const usuario = await prisma.usuario.findUnique({ where: { id } });

    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    res.json(usuario);
  } catch (e: any) {
    res.status(400).json({ erro: e.message });
  }
});

/**
 * Atualizar usuário
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
  } catch (e: any) {
    res.status(400).json({ erro: e.message });
  }
});

/**
 * Deletar usuário
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = usuarioIdSchema.parse(req.params);

    await prisma.usuario.delete({ where: { id } });

    res.json({ sucesso: true });
  } catch (e: any) {
    res.status(400).json({ erro: e.message });
  }
});

export default router;
import { AddressInfo } from "node:net";
import bcrypt from "bcryptjs";
import { createApp } from "../src/app.js";
import { createUsuarioRouter } from "../src/routes/usuario.js";

type ServerInstance = ReturnType<ReturnType<typeof createApp>["listen"]>;

type UsuarioRecord = {
  id: string;
  nome: string;
  email: string;
  senha: string;
  tipoUsuario: "USER" | "RECRUITER";
};

type MockPrisma = {
  usuario: {
    findUnique: ({ where }: { where: { id?: string; email?: string } }) => Promise<UsuarioRecord | null>;
    create: ({ data }: { data: Omit<UsuarioRecord, "id"> }) => Promise<UsuarioRecord>;
    findMany: () => Promise<UsuarioRecord[]>;
    update: ({ where, data }: { where: { id: string }; data: Partial<UsuarioRecord> }) => Promise<UsuarioRecord>;
    delete: ({ where }: { where: { id: string } }) => Promise<UsuarioRecord>;
  };
  __data: UsuarioRecord[];
};

const createMockPrisma = (): MockPrisma => {
  const usuarios: UsuarioRecord[] = [];

  return {
    usuario: {
      findUnique: async ({ where }) => {
        if (where.email) {
          return usuarios.find((user) => user.email === where.email) ?? null;
        }
        if (where.id) {
          return usuarios.find((user) => user.id === where.id) ?? null;
        }
        return null;
      },
      create: async ({ data }) => {
        const novoUsuario: UsuarioRecord = {
          ...data,
          id: `usr_${usuarios.length + 1}`
        };
        usuarios.push(novoUsuario);
        return { ...novoUsuario };
      },
      findMany: async () => [...usuarios].sort((a, b) => a.nome.localeCompare(b.nome)),
      update: async ({ where, data }) => {
        const index = usuarios.findIndex((user) => user.id === where.id);

        if (index === -1) {
          throw new Error("Usuário não encontrado");
        }

        usuarios[index] = { ...usuarios[index], ...data };

        return { ...usuarios[index] };
      },
      delete: async ({ where }) => {
        const index = usuarios.findIndex((user) => user.id === where.id);

        if (index === -1) {
          throw new Error("Usuário não encontrado");
        }

        const [removed] = usuarios.splice(index, 1);
        return removed;
      }
    },
    __data: usuarios
  };
};

const startServer = async (mockPrisma: MockPrisma) => {
  const app = createApp({ usuarioRouter: createUsuarioRouter({ prisma: mockPrisma as any }) });
  const server = app.listen(0);

  await new Promise<void>((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return { server, baseUrl };
};

describe("API endpoints", () => {
  let server: ServerInstance;
  let baseUrl: string;
  let mockPrisma: MockPrisma;

  beforeEach(async () => {
    mockPrisma = createMockPrisma();
    const started = await startServer(mockPrisma);
    server = started.server;
    baseUrl = started.baseUrl;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });

  test("GET / deve retornar a mensagem de status", async () => {
    const response = await fetch(baseUrl + "/");

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.message).toBe("Recruit.io API online 🚀");
  });

  test("GET /health deve informar que a API está operante", async () => {
    const response = await fetch(baseUrl + "/health");

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });

  test("GET /api-docs deve servir a documentação Swagger", async () => {
    const response = await fetch(baseUrl + "/api-docs");

    expect(response.status).toBe(200);
    const contentType = response.headers.get("content-type") ?? "";
    expect(contentType.includes("text/html")).toBe(true);
  });

  describe("rotas de usuários", () => {
    const criarUsuario = async (data: Partial<UsuarioRecord> & { senha: string }) => {
      const response = await fetch(baseUrl + "/api/usuarios", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nome: data.nome ?? "João da Silva",
          email: data.email ?? "joao@example.com",
          senha: data.senha,
          tipoUsuario: data.tipoUsuario ?? "USER"
        })
      });

      return { response, body: await response.json() } as const;
    };

    test("cria usuário e retorna dados com senha criptografada", async () => {
      const { response, body } = await criarUsuario({ senha: "123456" });

      expect(response.status).toBe(200);
      expect(body).toMatchObject({
        id: expect.any(String),
        nome: "João da Silva",
        email: "joao@example.com",
        tipoUsuario: "USER"
      });
      expect(body.senha).not.toBe("123456");
      await expect(bcrypt.compare("123456", body.senha)).resolves.toBe(true);
    });

    test("impede criação com e-mail duplicado", async () => {
      await criarUsuario({ senha: "123456" });
      const segunda = await criarUsuario({ senha: "123456" });

      expect(segunda.response.status).toBe(400);
      expect(segunda.body.erro).toBe("E-mail já cadastrado.");
    });

    test("realiza login com credenciais válidas", async () => {
      await criarUsuario({ senha: "segredo" });

      const response = await fetch(baseUrl + "/api/usuarios/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "joao@example.com", senha: "segredo" })
      });

      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.mensagem).toBe("Login realizado com sucesso.");
      expect(body.usuario).toMatchObject({
        id: expect.any(String),
        nome: "João da Silva",
        email: "joao@example.com",
        tipoUsuario: "USER"
      });
    });

    test("retorna erro para senha inválida", async () => {
      await criarUsuario({ senha: "correta" });

      const response = await fetch(baseUrl + "/api/usuarios/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "joao@example.com", senha: "errada" })
      });

      const body = await response.json();
      expect(response.status).toBe(400);
      expect(body.erro).toBe("Senha incorreta.");
    });

    test("lista usuários em ordem alfabética", async () => {
      await criarUsuario({ nome: "Carlos", email: "carlos@example.com", senha: "abc123" });
      await criarUsuario({ nome: "Ana", email: "ana@example.com", senha: "abc123" });

      const response = await fetch(baseUrl + "/api/usuarios");
      const body: UsuarioRecord[] = await response.json();

      expect(response.status).toBe(200);
      expect(body.map((u) => u.nome)).toEqual(["Ana", "Carlos"]);
    });

    test("busca usuário por id", async () => {
      const primeiro = await criarUsuario({ senha: "123456" });
      const usuarioId = primeiro.body.id as string;

      const response = await fetch(baseUrl + `/api/usuarios/${usuarioId}`);
      const body: UsuarioRecord = await response.json();

      expect(response.status).toBe(200);
      expect(body.id).toBe(usuarioId);
      expect(body.email).toBe("joao@example.com");
    });

    test("atualiza dados e senha do usuário", async () => {
      const { body: usuario } = await criarUsuario({ senha: "origem" });

      const updateResponse = await fetch(baseUrl + `/api/usuarios/${usuario.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ nome: "João Atualizado", senha: "novaSenha" })
      });

      const atualizado: UsuarioRecord = await updateResponse.json();

      expect(updateResponse.status).toBe(200);
      expect(atualizado.nome).toBe("João Atualizado");
      await expect(bcrypt.compare("novaSenha", atualizado.senha)).resolves.toBe(true);

      const loginNovo = await fetch(baseUrl + "/api/usuarios/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: usuario.email, senha: "novaSenha" })
      });

      expect(loginNovo.status).toBe(200);
    });

    test("remove usuário e retorna erro ao buscá-lo novamente", async () => {
      const { body: usuario } = await criarUsuario({ senha: "apagar" });

      const deleteResponse = await fetch(baseUrl + `/api/usuarios/${usuario.id}`, {
        method: "DELETE"
      });

      expect(deleteResponse.status).toBe(200);
      const deleteBody = await deleteResponse.json();
      expect(deleteBody.sucesso).toBe(true);

      const buscaAposExcluir = await fetch(baseUrl + `/api/usuarios/${usuario.id}`);
      expect(buscaAposExcluir.status).toBe(404);
    });
  });
});

import express, { type Router } from "express";
import cors from "cors";
import perguntas from "./routes/perguntas";
import respostas from "./routes/respostas";
import analisar from "./routes/analisar";
import { createUsuarioRouter } from "./routes/usuario";

import { setupSwagger } from './swagger';

export type AppDependencies = {
  usuarioRouter?: Router;
};

export const createApp = (deps: AppDependencies = {}) => {
  const app = express();
  setupSwagger(app);

  app.use(cors());
  app.use(express.json());

  app.get("/", (_req, res) => res.json({ message: "Recruit.io API online 🚀" }));
  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/usuarios", deps.usuarioRouter ?? createUsuarioRouter());
  app.use("/api/perguntas", perguntas);
  app.use("/api/respostas", respostas);
  app.use("/api/analisar", analisar);

  return app;
};

const app = createApp();

export default app;
